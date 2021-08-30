
// Main central file


// Canvas elements
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d', { alpha: false });

// Sidebar
var sidebar = document.getElementById("sidebar");
var sctx = sidebar.getContext('2d', { alpha: false });


// size of tiles
var tileSize = 20

// list of all tiles
var totalTiles = {}

// chunkSizes ^2 determines how many tiles are in a chunk
var chunkSizes = 10;

// name of the island (cosmetic)
var islandName;

// Sets viewport scale when you first execute it
var viewportScale = 2;

// selected starting position
var startingPos = "centre"

// worldSize ^2 determines how many chunks in a world
var worldSize = 10

// Manual selecion flag
var manualSelect = false;

// sea level height ( between 0 and 2 )
var seaLevel = 1;

// A dictionary of all trees lets gooo
var trees = {}

// entities to draw stats for
var drawStatsEntities = []

// All availabletiles for spawning entities in
var availableTiles = []

// Biome setting from ./config/colour_palettes.js
var biome = "generic_biome";
biome = colour_palettes[biome];

// if debug is true or not
var debug_mode = true;

// available starting positions
var startingPositions = {
	centre: {x:(tileSize * chunkSizes * worldSize)/2,
					y:-(tileSize * chunkSizes * worldSize)/2},

	tleft: {x: 0,
					y:0}
}

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
	position: 						false,
	colour:   						false,
	scale:								true,
	boundingBox: 					false,
	strokeStyle:  				false,
	speed:								true,
	state:								true,
	moveTarget: 					true,
	sense:								true,
	availableTiles: 			false,
	foundTree: 						true,
	treesEaten: 					true,
	reproductabililty:		true,
	generation: 					true,
	wanderdistance: 			true,
	name:									true,

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
	startingSpeed: 1,
	startingRepro: 80,
	startingSense: 3,
	startingWandr: 100,
}

var simulationFactors = {
	// Minimum values for each stat
	minScale: 2,
	minSpeed: -Infinity,
	minRepro: -Infinity,
	minWandr: -Infinity,

	// Maximum values for each stat
	maxScale: Infinity,
	maxSpeed: Infinity,
	maxRepro: Infinity,
	maxWandr: 300,

	// how much food does eating a tree with a berry on it give
	foodValue: 1,

	// maximum amount of food an entity can eat in a day
	maxFood: 2,

	// how much food an entity needs a day to survive
	foodReq: 1,

	// how much food an entity needs to have a child
	childReq: 2,

	// How much every mutation should effect scale
	scaleMutationFactor: 1,

	// How much every mutation should effect speed
	speedMutationFactor: 1,

	// How much every mutation should effect reproductabililty
	reproMutationFactor: 1,

	// How much every mutation should effect wandering distance
	wandrMutationFactor: 1,

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


var popchange = 0;

// Total population before
var population;

// Current oldest entity stats
var oldest = {generation:0,
							daysAlive:0,
							colour:"rgb(0,0,0)"};


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

// Tree with or without berry images loading
let noBerry = new Image();
noBerry.src = "./assets/tree.svg"

let berry = new Image();
berry.src = "./assets/berry.svg"

// Statistics of current entities
var averages = {
	speed: 							0,
	scale:							0,
	reproductabililty:	0,
	wanderdistance: 		0,
	generation: 				0,
}

// Map for movement
var map = {};

// World
var world = [];

// See if an entity is currently selected
var entitySelected = false;

// Stats for the selected entity draw location
var entityDisplayStats = [{}];

// The end
var end = false

// the day
var day =  -1

// constant of world total sizes
var worldTotalSize = tileSize * chunkSizes * worldSize

// Clocks for refresh intervals.
var clocks = {
	berryRefresh: 0,
	dayNight: 0,
	treeReplace: 0,
};

// Construct viewport before running anything else
var viewport = viewportCreator(worldSize, tileSize, chunkSizes, startingPositions[startingPos].x, startingPositions[startingPos].y);


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

	// drawing of the sidebar
	drawSidebar(sctx)

	if (end == true) {
		return
	}

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

	islandName = generateName()

	console.log('Generating island '+islandName);
	console.log('with '+ worldSize + 'x' + worldSize +' chunks');
	console.log('at '+ worldSize*worldSize * chunkSizes*chunkSizes + ' tiles');

	// Create the world
	world = GenWorld();

	console.log('World generation completed');

	// Generate entities over the world
	entities = generateEntities();

	console.log('Entity generation completed');
	console.log(entities.length + ' Entities generated')

	// Statistics of current entities
	averages = {
		speed: 							genFactors.startingSpeed,
		scale:							genFactors.startingScale,
		reproductabililty:	genFactors.startingRepro,
		wanderdistance: 		genFactors.startingWandr,
		generation: 				0,
	}

	randomEntity = entities[Math.floor(Math.random() * entities.length)]

	oldest = {generation:0,
						daysAlive:0,
						colour: randomEntity.colour,
						stroke: randomEntity.strokeStyle,
						name: randomEntity.name};

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

// Main menu elements begin here:
var sidebarSettings = {
	bgColour: "rgb(232,232,232)",

	// stored as percentage of sidebar floored
	dividerSize:	1,
	dividerColour: 	"rgb(169,169,169)",

	drawDivider: false,

	textColour: "rgb(32,32,32)",
	isleNameSize: 20,
}
