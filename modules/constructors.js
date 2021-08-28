

// A tile object constructor
function tileConstructor(x,y,colourNew, heatNew, tree, realX, realY, water) {

	this.x = x;
	this.y = y;
	this.colour = colourNew;
	this.heatcolour = heatNew;
	this.tree = tree;
	this.realX = realX;
	this.realY = realY;
	this.water = water;
}

// A chunk object constructor
function chunkConstructor(regionArea, tilesList) {

	this.region = {
	x: regionArea[0],
	y: regionArea[1],
	};

	this.tiles = tilesList;
}

// Viewport function creator thing of movement around the canvas world
function viewportCreator(worldSize, tileSize, chunkSizes, startx, starty) {

	let viewport = {

		// Top left coordinate of viewport
		tleft: {
		x: startx,
		y: starty,
		},


		bright:  {
			x: startx + (canvas.width  / this.scale),
			y: starty - (canvas.height / this.scale),
		},

		// Current scale of world
		scale: viewportScale,

		// Current keys pressed down
		keysdown: [],

		// Move the frame around
		moveFrame: function(movex,movey){
			this.tleft = {
				x: this.tleft.x+movex,
				y: this.tleft.y+movey,
			};

			this.bright =	{
				x: this.tleft.x + (canvas.width  / this.scale),
				y: this.tleft.y - (canvas.height / this.scale),
			};
		},

		// Scale in the centre instead of into the top left
		scaleBy: function(onSet) {
			this.scale *= onSet
			this.tleft.x += (onSet - 1) * (canvas.width  / 2) / this.scale
			this.tleft.y -= (onSet - 1) * (canvas.height / 2) / this.scale
		},

		// Culling to check what chunks are inside
		checkChunks: function() {
			chunkTotal = tileSize * chunkSizes

			// Top left chunk coordinate with a bit more than necessary
			let chunkX1 = clamp(Math.abs(Math.floor(this.tleft.x / (chunkTotal))) - 2, 0, chunkTotal + 10)
			let chunkY1 = clamp(Math.abs(Math.floor(this.tleft.y / (chunkTotal))) - 1, 0, chunkTotal + 10)

			// Bottom right chunk coordinate
			let chunkX2 = Math.abs(Math.floor(this.bright.x / (chunkTotal)))
			let chunkY2 = Math.abs(Math.floor(this.bright.y / (chunkTotal)))

			//Just a simple map function which slices the world to only have the chunks which are in the area given
			return world.slice(chunkY1, chunkY2).map(row => row.slice(chunkX1, chunkX2 + 2))
		}
	}

	return viewport
}
