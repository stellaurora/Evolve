
// Canvas elements
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d', { alpha: false });

// size of tiles
var tileSize = 20

// list of all tiles
var totalTiles = {}

// chunkSizes ^2 determines how many tiles are in a chunk
var chunkSizes = 10;

// Sets viewport scale when you first execute it
var viewportScale = 2;

// worldSize ^2 determines how many chunks in a world
var worldSize = 10

// Manual selecion flag
var manualSelect = true;

// sea level height ( between 0 and 2 )
var seaLevel = 1;

// A dictionary of all trees lets gooo
var trees = {}

// entities to draw stats for
var drawStatsEntities = []

// All availabletiles for spawning entities in
var availableTiles = []

// Construct viewport before running anything else
var viewport = viewportCreator(worldSize, tileSize, chunkSizes, (worldSize * tileSize * chunkSizes)/2, -(worldSize * tileSize * chunkSizes)/2);

// Biome setting from ./config/colour_palettes.js
var biome = "generic_biome";
biome = colour_palettes[biome];

// if debug is true or not
var debug_mode = true;

//arbitary height levels for terrian that fall between 0-2, not recommended to adjust unless you are just experimenting
var heightLevels = {

	// All levels of height
	levels: ["depths","twilight","bright","coast","shore","sand","light","medium","dark","mount1","mount2","snow1","snow2"],
	waterLevels: ["depths","twilight","bright","coast","shore"],
	// Height value per level
	depths:		0.45,
	twilight:	0.6,
	bright: 	0.8,
	coast: 		0.9,
	shore:		0.98,
	sand: 		1.05,
	light: 		1.1,
	medium: 	1.23,
	dark: 		1.36,
	mount1: 	1.46,
	mount2: 	1.57,
	snow1: 		1.67,
	snow2:		10,

};


// Clock settings on how fast they refresh
var clockSettings = {

	// Seconds between berry refreshes
	berryRefresh: 10,

	// Seconds taken for day night cycle
	dayNight: 10,

	// Seconds taken for new trees to generate
	treeReplace: 100,


};

// Toggles stat text display
var textDisplay = {

	totalList: [],

	// Toggles on/off if to display entity property in selection text
	position: true,
	colour: true,
	scale: true,
	boundingBox: true,
	strokeStyle: true,
	state: true,
	treesEaten: true,
	moveTarget: true,
	availableTiles: true,
	foundTree: true,
	generation: true,

}

textDisplay.totalList = Object.keys(textDisplay);

// More advanced generation factors.
var genFactors = {

	// How much left the island on the map will be where worldSize * chunkSizes/LeftislandFactor is the origin of the island.
	islandLeftFactor: 2,

	// Size factor of island, higher = Larger.
	islandSizeFactor: 1,




	// Noise.. adjust this for fun stuff
	islandOctaves:     6,
	islandLacunarity:  2,
	islandPersistance: 0.5,

	// How much to shift each tile upwards (value between 0-2, higher values = more island above sea level)
	islandShift: 0.5,

	// Increase or decrease to change the influence the circle has on the island. (same as islandSizeFactor?? leaving this in because i already wrote it tho)
	islandCircleInfluence: 1.6,



	// How much to shift up each tile in the tree noise function.
	treeShift: 0.5,

	// What biomes to spawn trees in.
	treeBiomes: [biome.medium, biome.dark, biome.light],

	// Tree bias for % of tiles in perlin noise bias become a tree
	treeBiasMap: 0.6,
	treeBiasRandom : 0.1,

	//Likelyhood of a bush/tree refreshing with a berry (0.1 = 10%, 0.9 = 90%)
	berryChance: 0.9,



	// How much up to shift heat values.
	heatShift: 1.3,

	// How intense the heat is across the island.
	heatIntensity: 2,

	// Y value of equator origin where heat is greatest where it is worldSize * chunkSizes/heatOrigin, with 2 being half way down the map.
	heatOrigin: 2,



	//How many entities to spawn in at the beginning of execution
	startingEntities: 60,

	// Random coloured entities
	randomColour: true,

	// Determines how bright random colours are for entities (0-255)
	entityRANCOLBrightness: 255,

	//Draw a ring around entities (cool border effect)
	Entring: true,

	//Starting size of entities for nom nom and protek
	startingScale: 5,
}


var statsFactors = {

	//padding between text and entity
	distAboveEntity: 8,

	//spacing of lines of text
	textLineSpacing: 0.1,

	// Make colour of text for entity same as its colour
	textColourEntityContinuum: false,

	//colour of text
	textColour: "rgb(255,255,255)",

	//pixel size of text
	textSize: 3,

	//change text size with entity so it doesnt overwhelm the entity
	textChangesWScale: false,

	//a factor which determines how much to scale the text, 1 being text size * entity size
	textScaleChangeAmount: 0.1,

	//the scaling factor between distaboveentity and the scale of the entity.
	distAboveEntityScale: 5,


	// if should draw path to goal
	drawPathtoGoal: true,

	// if path should be same colour as entity
	drawPathEntityContinuum: false,

	// path colour given not entity contiuum
	pathColour: "rgb(255,255,255)",


}


// Current iteration of perlin nosie
var perliniteration = 0;

// Noise memory storage
var grid = [];

// Entities visible in viewport
var availableEntities = [];

// Entities
var entities = [];

// Previous frame time for independent movement
var previousFrameTime = 0;

// current time between frames
var frameTime = 0;

// Map for movement
var map = {};

// World
var world = [];

// See if an entity is currently selected
var entitySelected = false;

// Stats for the selected entity draw location
var entityDisplayStats = [{}];

// constant of world total sizes
var worldTotalSize = tileSize * chunkSizes * worldSize

// Clocks for refresh intervals.
var clocks = {
	berryRefresh: 0,
	dayNight: 0,
	treeReplace: 0,
};


// Clock check every frame to see if enough time has passed for a certain action to happen (yes its dependant on framerate rn)
function clockCheck(time) {

	// Refresh berries
	if ( time >= (clocks.berryRefresh + (clockSettings.berryRefresh * 1000))) {

		refreshBerries(trees)
		clocks.berryRefresh = time;
	};

	// Replace berries around the map so there's no campers
	if ( time >= (clocks.treeReplace + (clockSettings.treeReplace * 1000))) {

		refreshTrees(trees)
		refreshBerries(trees)
		clocks.treeReplace = time;
	};

	// Day night cycle if i ever implement it
	if ( time >= (clocks.dayNight + (clockSettings.dayNight * 1000))) {

		// Entities which survive the day ;o
		let survived_entities = [];

		for (entity in entities) {
			current_entity = entities[entity]

			if (current_entity.treesEaten > 1) {

				// Determine the starting colour
				startingColour = biome["startingColour"];

				// If random generate a random colour with brightness
				if (genFactors.randomColour == true) {
					startingColour = randomColour(genFactors.entityRANCOLBrightness);
				};

				new_entity = {
					position: 				{x: current_entity.position.x, y: current_entity.position.y} ,
					colour:   				startingColour,
					scale:						current_entity.scale * ((Math.random() +0.5)/10),
					boundingBox: 			calculateBoundBox(current_entity.position, genFactors.startingScale),
					strokeStyle:  		biome["defaultEntityRing"],
					speed:						current_entity.speed * ((Math.random() +0.5)/10),
					state:						"wander",
					moveTarget: 			null,
					sense:						current_entity.sense,
					availableTiles: 	[],
					foundTree: 				false,
					treesEaten: 			0,
					reproductabililty: 80,
					generation: 			current_entity.generation+1,
				}

				survived_entities.push(new_entity)
				console.log('new_entity')
			}
			if (current_entity.treesEaten > 0) {
				current_entity.treesEaten = 0
				survived_entities.push(current_entity)
			}
		}

		console.log('daynight cycle')

		entities = survived_entities;
		clocks.dayNight = time;
	};
}


// Main gameloop
function gameLoop(time){

	// Update canvas to fit window width & height
	updateWindow(ctx)

	// Clear the canvas
	clearCanvas(biome["depths"]);

	// Draw tiles & Entities
	draw(ctx, viewport, chunkSizes);

	availableEntities = entitiesInFrame(entities);

	// Draw entities on world
	drawEntities(ctx, availableEntities);

	//draw path between entity and its goal
	if (statsFactors.drawPathtoGoal == true) {
		drawPath(ctx, drawStatsEntities);
	}

	// draw statistics
	drawStats(ctx, drawStatsEntities);

	// run certain functions every n seconds
	clockCheck(time);

	// Movement checks for viewport camera
	getMovement();

	// independency
	getFrameTime(time)

	// why is life? why is existence? why is reality?
	entities = sentience(ctx, entities)

	// Loop over program indefinitely
	requestAnimationFrame(gameLoop);

};

// Generation at beginning of execution
function generate(debug) {

	// Set it to be a timer if debug mode is on (timer gets printed at console)
	if (debug == true) {

		// Time at beginning of generation
		var t0 = performance.now();
	};

	// Logging some stuff in console which is helpful
	console.log('Generating island');
	console.log('with '+ worldSize + 'x' + worldSize +' chunks');
	console.log('at '+ worldSize*worldSize * chunkSizes*chunkSizes + ' tiles');

	// Create the world
	world = GenWorld();

	console.log('World generation completed');

	// Generate entities over the world
	entities = generateEntities();

	console.log('Entity generation completed');
	console.log(entities.length + ' Entities generated')

	if (debug == true) {

		// Difference between t0 and t1 to have an accurate time that generation has taken
		let t1 = performance.now();
		let timetaken = t1 - t0;

		// Log time taken if debug mode is existant
		console.log("World generation took " + timetaken/60000 + " minutes");
		console.log(world);
	};

};

// yay
generate(debug_mode);
refreshBerries(trees)
requestAnimationFrame(gameLoop);
