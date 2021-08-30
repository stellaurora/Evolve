
// Tile / Chunk / Entity drawing


// Update window canvas to fit webpage
function updateWindow(ctx) {

	// Change canvas height & width to match window height & width
	ctx.canvas.width  = window.innerWidth * 3/4;
	ctx.canvas.height = window.innerHeight;

	sctx.canvas.width =  window.innerWidth * 1/4;
	sctx.canvas.height = window.innerHeight;
	sctx.canvas.style.left = (window.innerWidth * 3/4) + "px"
}

// Clear the canvas to backdrop colour
function clearCanvas(backdrop) {

	// Clear canvas with backdrop colour.
	ctx.fillStyle = backdrop;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	sctx.fillStyle = sidebarSettings.bgColour;
	sctx.fillRect(0, 0, sidebar.width, sidebar.height);

}

// Draw tiles (magic function which i have no longer any idea how it works)
function draw(ctx, viewport, chunkSizes){

	// Correct size with scale every draw
	let tileScaledSize = tileSize * viewport.scale;

	let culled = viewport.checkChunks()
	// DRAW TILES

	// Per Row of chunks
	for (let row = 0; row < culled.length; row+=1) {

		// Per Chunk in row
		for (let i = 0; i < culled[row].length; i +=1) {

			chunkX = culled[row][i].region.x
			chunkY = culled[row][i].region.y

			// Per Tile
			for (let t = 0; t < chunkSizes * chunkSizes; t+=1) {
				tile = culled[row][i].tiles[t];
				ctx.fillStyle = tile['colour'];

				tileposX = ((culled[row][i].tiles[t].x * tileSize ) + chunkX - viewport.tleft.x) * viewport.scale;
				tileposY = ((culled[row][i].tiles[t].y * tileSize ) + chunkY + viewport.tleft.y) * viewport.scale;
				ctx.fillRect(tileposX, tileposY, tileScaledSize, tileScaledSize);

				treeCoord = trees[[tile.realX, tile.realY]];
				if(treeCoord != undefined) {
					if(treeCoord.tree) {
						if(treeCoord.berry) {
							ctx.drawImage(berry, tileposX, tileposY, tileScaledSize, tileScaledSize);
						}
						else {
							ctx.drawImage(noBerry, tileposX, tileposY, tileScaledSize, tileScaledSize);
						}
					}
				}
			};
		};
	};

};

function drawStats(ctx, entities) {

	// align text origin point to the centre of the text
	ctx.textAlign = 'center';

	// Text font height
	let textHeight = statsFactors.textSize * viewport.scale;
	ctx.font = textHeight + "px Helvetica";

	// change colour of text to default text colour
	ctx.fillStyle = statsFactors.textColour;


		// draws states for every entity
		for (entityPos in entities) {

			let current_entityPos = entities[entityPos];

			let entityPadding = statsFactors.distAboveEntity + current_entityPos.entity.scale + (textHeight * textDisplay.totalList.length/ viewport.scale)

			// if text changes with scale flag is on
			if (statsFactors.textChangesWScale == true) {

				// New text font size for entity
				let textFontSize = statsFactors.textSize * current_entityPos.entity.scale * statsFactors.textScaleChangeAmount * viewport.scale;
				entityPadding = statsFactors.distAboveEntity * current_entityPos.entity.scale/statsFactors.distAboveEntityScale + current_entityPos.entity.scale

				// change text height to accomodate the new size per entity
				textHeight = textFontSize;

				ctx.font = textFontSize + "px Helvetica";

			}

			//get centre position of entity

			let x = current_entityPos.x;
			let y = current_entityPos.y;

			// change colour to entity colour if flag is true
			if (statsFactors.textColourEntityContinuum == true) {
				ctx.fillStyle = current_entityPos.entity.colour;
			}

			// current position of text in heirachy for easy indentation etc.
			current_position = 0;

			yBase =  y - ((entityPadding) * viewport.scale) ;


			// add different lines of text so its not ew (why cant they support \n or <br> ;-;)
			for (property in textDisplay.totalList) {

				let entityProperty = textDisplay.totalList[property];

				if (textDisplay[entityProperty] == true) {

					let lineY = yBase + current_position * textHeight

					ctx.fillText(entityProperty + ': ' + JSON.stringify(current_entityPos.entity[entityProperty]), x , lineY );

					current_position += 1
				}
			}
		}

		drawStatsEntities = [];
}

// Draw ring around entities
function drawRing(ctx, entity, x, y) {

	//Draws a ring outline around entities which helps highlight them
	let current_entity = checkSelected(entity);

	ctx.beginPath();
	ctx.strokeStyle = current_entity.strokeStyle;
	ctx.arc(x, y,  current_entity.scale * viewport.scale, 0, 2 * Math.PI);
	ctx.stroke();

};

document.addEventListener('click', MouseClicked, true);

function MouseClicked(event) {

      let cursor = {
				x: event.pageX,
				y: event.pageY,
			}

			console.log(cursor)

			// check if manual selection is enabled

			if (manualSelect == true) {
				entitySelected = getEntclicked(cursor);
				console.log(entitySelected)
			}


}

function drawPath(ctx, entities, targetX, targetY) {

	for (entity in entities) {

		current_entity = entities[entity].entity

		if (current_entity.moveTarget != null) {

			// Location of entity
			entX = (current_entity.position.x - viewport.tleft.x) * viewport.scale
			entY = (current_entity.position.y + viewport.tleft.y) * viewport.scale

			goalX = (current_entity.moveTarget.x - viewport.tleft.x) * viewport.scale
			goalY = (current_entity.moveTarget.y + viewport.tleft.y) * viewport.scale

			ctx.strokeStyle = statsFactors.pathColour;

			if (statsFactors.drawPathEntityContinuum == true) {
				ctx.strokeStyle = current_entity.colour;
			}

			// Draws a the line of the current path of entity selected.
			ctx.beginPath()
			ctx.moveTo(entX, entY)
			ctx.lineTo(goalX, goalY)
			ctx.stroke();
		}
	}
}

function totwoDP(num){
	return Math.trunc(num * 100)/100
}
function drawSideBarDivider(sctx) {

	let width = Math.floor((sctx.canvas.width/100) * sidebarSettings.dividerSize);

	sctx.fillStyle = sidebarSettings.dividerColour;
	sctx.fillRect(0, 0, width, sidebar.height);

}
// Draw sidebar in main
function drawSidebar(sctx) {

	sctx.textAlign = 'center';

	if (sidebarSettings.drawDivider == true) {
	drawSideBarDivider(sctx)
	}

	sctx.fillStyle = sidebarSettings.textColour;


	//island name
	sctx.font = Math.floor(sctx.canvas.height * 1/sidebarSettings.isleNameSize	) + "px Helvetica";
	sctx.fillStyle = sidebarSettings.textColour;
	sctx.fillText('Island of '+islandName, sidebar.width/2, sidebar.height * 1/10);


	sctx.font = Math.floor(sctx.canvas.height * 1/40) + "px Helvetica";
	sctx.fillText(worldSize + ' x ' + worldSize, sidebar.width/2, sidebar.height * 13/100);

	let symbol = ''

	if (popchange == 0) {
		symbol = '↕'
	}
	else if (popchange > 0) {
		symbol = '↑'
	}
	else if (popchange < 0) {
		symbol = '↓'
	}

	sctx.font = Math.floor(sctx.canvas.height * 1/40	) + "px Helvetica";
	sctx.fillText('Population of '+entities.length+ ' '+ symbol + Math.abs(popchange), sidebar.width/2, sidebar.height * 20/100);

	if (averages.speed == null) {
		sctx.fillText('The population has died..', sidebar.width/2, sidebar.height * 40/100);
		return
	}

	sctx.font = Math.floor(sctx.canvas.height * 1/30	) + "px Helvetica";
	sctx.fillText('Averages', sidebar.width/2, sidebar.height * 35/100);

	sctx.font = Math.floor(sctx.canvas.height * 1/40	) + "px Helvetica";
	sctx.fillText('Speed: '+							totwoDP(averages.speed), 							sidebar.width/2, sidebar.height * 38/100);
	sctx.fillText('Scale: '+							totwoDP(averages.scale), 							sidebar.width/2, sidebar.height * 41/100);
	sctx.fillText('Reproduction Chance: '+totwoDP(averages.reproductabililty), 	sidebar.width/2, sidebar.height * 44/100);
	sctx.fillText('Generation: '+					totwoDP(averages.generation),					sidebar.width/2, sidebar.height * 47/100);
	sctx.fillText('Wander Distance: '+		totwoDP(averages.wanderdistance), 		sidebar.width/2, sidebar.height * 50/100);

	sctx.font = Math.floor(sctx.canvas.height * 1/30	) + "px Helvetica";
	sctx.fillText('Oldest', sidebar.width/2, sidebar.height * 65/100);

	sctx.strokeStyle = oldest.stroke
	sctx.fillStyle = oldest.colour
	sctx.arc(sctx.canvas.width/2 , sctx.canvas.height * 73/100,  sctx.canvas.height * 6/100, 0, 2 * Math.PI);
	sctx.fill();
	sctx.stroke();

	sctx.fillStyle = sidebarSettings.textColour;

	sctx.font = Math.floor(sctx.canvas.height * 1/40	) + "px Helvetica";
	sctx.fillText(oldest.name, sidebar.width/2, sidebar.height * 82/100);

	sctx.fillText('Generation '+oldest.generation, sidebar.width/2, sidebar.height * 87/100);
	sctx.fillText(oldest.daysAlive +' Days Alive', sidebar.width/2, sidebar.height * 90/100);


}
// Draw entities on world
function drawEntities(ctx, entities){

	// Draw every entity
	for( entity in entities) {

		// Access the entity object in the list of entities currently in existance
		current_entity = entities[entity]

		// Location of entity
		entx = (current_entity.position.x - viewport.tleft.x) * viewport.scale
		enty = (current_entity.position.y + viewport.tleft.y) * viewport.scale

		ctx.beginPath();


		ctx.fillStyle = current_entity.colour;


		// draw the circle the entity is in
		ctx.arc(entx, enty,  current_entity.scale * viewport.scale, 0, 2 * Math.PI);

		// fill in the circle
		ctx.fill();

		drawRing( ctx, current_entity, entx, enty)

		let entityStatistics = {
			entity: current_entity,
			x: entx,
			y: enty
		};


		if (manualSelect == false) {

			// add entity to list of entities to draw stats for.
			drawStatsEntities.push(entityStatistics)
		}
		else {

			// check if current entity is equal to the entity selected by cursor.
			if (current_entity == entitySelected) {
				drawStatsEntities.push(entityStatistics)

			}
		}



	}
}

// Movement Code to get keys every time they're pressed
onkeydown = onkeyup = function(e){

	e = e || event;
	map[e.keyCode] = e.type == 'keydown';

}

function getFrameTime(time) {

	frameTime = time - previousFrameTime;
	previousFrameTime = time;

}

// Function which allows for movement of viewport
function getMovement(){

	// Values which are changed by each key pressed
	let moveX = 0;
	let moveY = 0;
	let scale = 1;
	let moveAmount = 4 / viewport.scale

	// Movement (changing values for each key)
	if (map[65] == true){ moveX -= moveAmount };
	if (map[68] == true){ moveX += moveAmount };
	if (map[87] == true){ moveY += moveAmount };
	if (map[83] == true){ moveY -= moveAmount };

	// Scaling
	if (map[69] == true){ scale *= 0.99 };
	if (map[81] == true){ scale /= 0.99 };

	// Change the location of the frame or scale by the values
	viewport.scaleBy(scale);
	viewport.moveFrame(moveX, moveY);

}
