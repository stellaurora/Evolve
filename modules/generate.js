
//generation methods



// Clamp number between min and max
function clamp(num, min, max) {
	return Math.min(Math.max(num, min), max);
};

// 2 dimensional euclidean distance = for dimension i, sum of (pi - pi)^2
function euclidDistance(p, q) {

		let qi = Math.abs(Math.pow(p.x - q.x, 2))
		let pi = Math.abs(Math.pow(p.y - q.y, 2))

		return Math.sqrt( qi + pi )
};



// Shape generation
function GenLine(intensity, My) {

	// linear gradient
	let line_grid = [];

	let totalSize = worldSize * chunkSizes

	for (let x = 0; x < totalSize; x++) {
		let row = [];

		for (let y = 0; y < totalSize; y++) {

			row.push(
				clamp(((Math.abs(y - My)/totalSize) * intensity),0,0.6)
			);

		}

		line_grid.push(row);
	}

	return line_grid;

};

function GenCircle(Mx, My, factor) {

	// 2D array constructed by euclidDistance to form a circle!
	let circle_grid = [];

	let totalSize = worldSize * chunkSizes

	// midpoint of grid
	let midPoint = {
		x: Mx,
		y: My,
	};

	// find euclidDistance between points on grid and circle midpoint
	for (let x = 0; x < totalSize; x++) {
		let row = [];

		for (let y = 0; y < totalSize; y++) {

			let point = {
				x: x,
				y: y,
			};

			row.push(
				Math.floor(euclidDistance(point, midPoint))/(totalSize * factor)
			);
		}

		circle_grid.push(row);


	}

	return circle_grid
}

// Colourise tiles based on heightLevel & colour palettes chosen
function colourise(heightValue, biome) {

	for (let i = 0; i < heightLevels.levels.length; i++) {

		let heightLevel =  heightLevels.levels[i]

		if ( heightLevels[heightLevel] > heightValue ) {
			return [biome[heightLevel], heightLevel]
		}

	}


}

function refreshBerries(trees) {

	for(x in trees) {
		tilePos = trees[x].tilePos

		if (Math.random() < genFactors.berryChance) {
			trees[x].berry = true;
		}
	};
}

function refreshTrees(trees) {


	for(x in trees) {
		tilePos = trees[x].tilePos

		// Generate a new tree heightmap
		treeMap = perlinNoise(tilePos.x/(tileSize), tilePos.y/(tileSize), perliniteration) + genFactors.treeShift;
		trees[x].tree = false;
		totalTiles[x].tree = false;
		if ( genFactors.treeBiasMap < treeMap) {
			if (Math.random() < genFactors.treeBiasRandom) {

				trees[x].tree = true;
				totalTiles[x].tree = true;
			}
		}
	};

	perliniteration++
}

function treeCheck(tileHeightColour, treeMap, x ,y) {

	// Check using randomness & perlin noise map to determine if  tree should be placed on tile.
	if (genFactors.treeBiomes.includes(tileHeightColour)) {
		trees[[x,y]] = {tilePos: {x: x, y: y}, tree: false, berry: false}
		if ( genFactors.treeBiasMap < treeMap) {
			if (Math.random() < genFactors.treeBiasRandom) {

				trees[[x,y]].tree = true;
				return true;
			}
		}
	};

	return false;

}

function randomColour(brightness) {

	// RGB Colours
	let red   = Math.floor(Math.random() * brightness);
	let blue  = Math.floor(Math.random() * brightness);
	let green = Math.floor(Math.random() * brightness);

	// Return in usable form (string thing??)
	return "rgb(" + red + ',' + blue + ',' + green + ")";
}

// Generate and populate world with weird circle thingies? (THEY'RE ALIVE I SWEAR)
function generateEntities() {

	let entities = []

	// create starting entities amount of entities
	for(let i = 0; i < genFactors.startingEntities; i++) {

		// Return if no more tiles are available
		if(availableTiles.length == 0) {

			return entities
		}
		// index of random position to get in availableTiles
		let index = Math.floor( Math.random() * availableTiles.length )

		// Determine the starting colour
		startingColour = biome["startingColour"];

		// If random generate a random colour with brightness
		if (genFactors.randomColour == true) {
			startingColour = randomColour(genFactors.entityRANCOLBrightness);
		};

		// Entity object being created
		entity = {
			position: 						availableTiles[index],
			colour:   						startingColour,
			boundingBox: 					calculateBoundBox(availableTiles[index], genFactors.startingScale),
			strokeStyle:  				biome["defaultEntityRing"],
			scale:								genFactors.startingScale,
			speed:								genFactors.startingSpeed,
			sense:								genFactors.startingSense,
			reproductabililty:		genFactors.startingRepro,
			wanderdistance: 			genFactors.startingWandr,
			state:								"wander",
			moveTarget: 					null,
			availableTiles: 			[],
			foundTree: 						false,
			treesEaten: 					0,
			generation: 					0,
			treeTarget:						{},
			daysAlive:						0,
			name:									generateName(),
			foodStorageCap:				simulationFactors.maxFood  + 	(simulationFactors.maxFood  * (genFactors.startingScale * simulationFactors.scaleStorageFactor)),
			foodReq:							simulationFactors.foodReq  + 	(simulationFactors.foodReq  * (genFactors.startingScale * simulationFactors.scaleFoodFactor   )) + (simulationFactors.foodReq * (genFactors.startingSpeed * simulationFactors.speedFoodFactor)),
			childReq:							simulationFactors.childReq + 	(simulationFactors.childReq * (genFactors.startingScale * simulationFactors.scaleChildFactor  )),


		}

		// Add entity to list of entities
		entities.push(entity);

		// Remove existing value from available tiles to place entities on.
		availableTiles.splice(index, 1)
	}
	return entities
}

// Generate the world O-o 🌎
function GenWorld() {

	let world = [];

	// Generate circle gradient to produce an island shaped map.
	let circleLeftness = Math.floor((worldSize * chunkSizes)/ genFactors.islandLeftFactor)
	let circle_world = GenCircle(circleLeftness, circleLeftness, genFactors.islandSizeFactor);

	// Line gradient for heat map & temperature
	let line_world = GenLine(genFactors.heatIntensity, Math.floor((worldSize * chunkSizes)/genFactors.heatOrigin));

	let treeiter = perliniteration + 1;

	// Chunks
	for ( let cy = 0; cy < worldSize; cy++ ) {
		let row = []

		for ( let cx = 0; cx < worldSize; cx++ ) {

			// Initialise new chunk
			var chunk = new chunkConstructor([cx * tileSize * chunkSizes, cy * tileSize * chunkSizes], []);

			//Tiles
			for (let tx = 0; tx < chunkSizes; tx++ ) {
				for (let ty = 0; ty < chunkSizes; ty++ ) {

					// Object of current tiles position
					let tilePos = {
						x: (tx + (cx * chunkSizes)),
						y: (ty + (cy * chunkSizes))

					};

					// Height at position merged together with the circle gradient shifted up a bit
					let height = (fractalNoise(tilePos.x/(tileSize), tilePos.y/(tileSize), genFactors.islandOctaves, genFactors.islandLacunarity, genFactors.islandPersistance, perliniteration)
					+ genFactors.islandShift)  - (circle_world[tilePos.y][tilePos.x] * genFactors.islandCircleInfluence);

					// Height to seaLevel
					let htsl = Math.abs(seaLevel - height);

					// colour of tile vs the height it is.
					let tileHeightColour = colourise(height, biome);

					let water = false;

					if (heightLevels.waterLevels.includes(tileHeightColour[1])) {
						water = true
					}

					tileHeightColour = tileHeightColour[0]

					// Perlin noise map for trees/bushes
					let TreeMap = perlinNoise(tilePos.x/(tileSize), tilePos.y/(tileSize), treeiter) + genFactors.treeShift;

					// Create trees using tree perlin noise map
					let tileContainsTree = treeCheck(tileHeightColour, TreeMap, tilePos.x, tilePos.y);

					// Default heat of tile.
					heat = genFactors.heatShift - (line_world[tilePos.x][tilePos.y] + htsl)

					// Visualisation of heat map colour
					heatMapColour = "rgb(" + heat * 168 + "," + heat * 128 + "," + heat * 128 + ")";

					if (genFactors.treeBiomes.includes(tileHeightColour)) {
						availableTiles.push({x:tilePos.x * tileSize, y:tilePos.y * tileSize})
					}


					tile = new tileConstructor(tx, ty, tileHeightColour, heatMapColour, tileContainsTree, tilePos.x, tilePos.y, water)
					tileRealPos = new tileConstructor(tx, ty, tileHeightColour, heatMapColour, tileContainsTree, tilePos.x, tilePos.y, water)
					// add to total list of tiles
					totalTiles[[tilePos.x, tilePos.y]] = tileRealPos

					// Add tile to chunk
					chunk.tiles.push(tile)
				};
			};

			row.push(chunk)

		}
		world.push(row)
	}

	perliniteration+=2
	return world
}

function generateName() {
	let combinations = ['vcv','cvvcvc','cvccv','vcvv','vcc','cvvccvc','cvvc','vccvcv','cvc','vccvc']

	vowels = ['a','e','i','o','u']
	rest = ['b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','y','x','z']

	let nameGenerated = ''
	let combination = combinations[Math.floor(Math.random() * combinations.length)]

	for (var i = 0; i < combination.length; i++) {
		let letter = combination.charAt(i)

		if (letter == 'v') {
			nameGenerated += vowels[Math.floor(Math.random() * vowels.length)]
		}

		if (letter == 'c') {
			nameGenerated += rest[Math.floor(Math.random() * rest.length)]
		}
	}

	return nameGenerated.charAt(0).toUpperCase() + nameGenerated.slice(1);

}
