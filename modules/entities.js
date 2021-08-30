
// Entities Movement & Interactions



// Bounding box for mouse click collision for entities
function calculateBoundBox(centre, scale) {

  let xpos = ((centre.x - viewport.tleft.x) * viewport.scale);
  let ypos = ((centre.y + viewport.tleft.y) * viewport.scale);

  // top left corner of boundign box of the entity
	let tleft = {
		x: xpos - (scale * viewport.scale),
		y: ypos - (scale * viewport.scale),
	}

  // bottom right corner of boundign box of the entity
	let bright = {
		x: xpos + (scale * viewport.scale),
		y: ypos + (scale * viewport.scale),
	}

  // Bounding box with both tleft and bright
	let boundingBox = {
		tleft:   tleft,
		bright:  bright,
    xcentre: xpos,
    ycentre: ypos,
	}

	return boundingBox

}


// Get all entities in viewport frame
function entitiesInFrame(entities) {

  rectA = {
    left:   viewport.tleft.x,
    top:    viewport.tleft.y,
    bottom: viewport.bright.y,
    right:  viewport.bright.x,
  }

  // Entities in frame
	let frameEntities = [];

  // Check for each entity to see if they are in the frame
	for (entity in entities) {

    // current entity in iteration
		let current_entity = entities[entity]

    rectB = {
      left:   (current_entity.position.x - current_entity.scale),
      top:    -(current_entity.position.y - current_entity.scale),
      bottom: -(current_entity.position.y + current_entity.scale),
      right:  (current_entity.position.x + current_entity.scale),
    }

    // Check for intersection between boundingbox and viewport
    if (checkIntersection(rectA, rectB)) {
      // update bounding box of entities in frame
      current_entity.boundingBox = calculateBoundBox(current_entity.position, current_entity.scale);

      frameEntities.push(current_entity)
    }
   }

	return frameEntities
}


// get entity clicked & display stats about them
function getEntclicked(mousePos) {


  // Sort backwards so entities which render ontop of others have higher priority
  availableEntities.reverse()

  for (entity in availableEntities) {

    // get current entity
    let current_entity = availableEntities[entity];

    let entityBox = current_entity.boundingBox;


    // check if mouse in current entities bounding box (will get the first one iterated over)
    if ( Math.sqrt( ((mousePos.x - entityBox.xcentre )**2 ) + ((mousePos.y - entityBox.ycentre )**2) ) < (current_entity.scale * viewport.scale)) {

      availableEntities.reverse()
      return current_entity
    }
  }
  return false;

}

function checkIntersection(rectA, rectB) {

  // check intersection between two rectangles :thumbs_up:
  return (rectA.left < rectB.right && rectB.left < rectA.right && rectA.top > rectB.bottom && rectB.top > rectA.bottom);
}


function checkSelected(current_entity) {

  if ( entitySelected == current_entity ) {
    current_entity.strokeStyle = biome["selectedEntityHighlight"]

    return current_entity
  }
  else {
    current_entity.strokeStyle = biome["defaultEntityRing"]

    return current_entity
  }
}

function sentience(ctx, entites) {

  let postsentience = [];

  if (entites.length == 0) {
    console.log('the world has ended')
  }

  for (entity in entities) {

    current_entity = entities[entity]
    postsentience.push(fabricatedKnowledge[current_entity.state](current_entity));

  }

  return postsentience;
}

// object which contains functions for entity sentience
var fabricatedKnowledge = {

  // move entity in x and y
  move: function(entity, x, y) {

    // addition of x and y to entity
    entity.position.x += x;
    entity.position.y += y;

    return entity;
  },

  // move the entity towards a goal
  moveTowardsGoal: function(entity, goalX, goalY) {


    //get the distance betwteen both ponts to calculate the bearing of the object
    let distX = entity.position.x-goalX;
    let distY = entity.position.y-goalY;

    // find the angle between the entity and the goal
    let angleToGoal = Math.atan2(distY, distX);


    // calculate the X and Y value for the entity to move if the hypotenuse is the speed of the entity
    let moveX = -Math.cos(angleToGoal) * entity.speed;
    let moveY = -Math.sin(angleToGoal) * entity.speed;


    // Check if entity position is already at  target, + rounding since entity position is actually an insanely long floating point number
    if (Math.abs(distX) < entity.speed && Math.abs(distY) < entity.speed) {

      // move entity to target
      moveX = entity.speed - distX
      moveY = entity.speed - distY

      // its at the target so the target destination is null since its arrived
      entity.moveTarget = null
    }

    // move the entity to the new location closer to the goal
    return this.move(entity, moveX, moveY)
  },

  // generates a random target for an entity to wander to
  genRandomWander: function(entity) {

    current_tile = {water: true}

    let moveX;
    let moveY;

    // make sure the tile isnt water so entities are stuck on the island, and the tile isnt undefined
    while (current_tile != undefined && current_tile.water == true) {

      // create a random movement target within the entity wander distance range
      moveX = Math.floor(entity.position.x + (Math.random() -0.5 )* current_entity.wanderdistance );
      moveY = Math.floor(entity.position.y + (Math.random() -0.5 )* current_entity.wanderdistance );

      // Get the position of the tile the movement target is set to
      current_tile = totalTiles[[Math.ceil(moveX/tileSize), Math.ceil(moveY/tileSize)]]

      // make sure its inside the map (though this can cause the simulation to completely freeze if wander distance isnt clamped)
      if (moveX > worldTotalSize | moveX < 0 | moveY > worldTotalSize | moveY < 0) {
        current_tile = {water: true};
      }
    }

    return {x: moveX, y: moveY, tile: current_tile}
  },

  // wandering state
  wander: function(entity) {

    // check if the entity has found a tree
    if (entity.foundTree == true) {

      // if the move target is not empty
      if (entity.moveTarget != null) {

        // check if the berry on the tree the entity is moving towards still exists
        if (trees[[entity.treeTarget.tilePos.x, entity.treeTarget.tilePos.y]].berry != true) {

          // if it doesnt then clear the movetarget and find a new tree
          entity.moveTarget = null;
          entity.foundTree = false;
        }
      }
    }

    // if a moveTarget is already set during wandering process
    if (entity.moveTarget == null) {

      // if the target is null generate a new random wander target
      moveData = fabricatedKnowledge.genRandomWander(entity)

      // set the move target to the new random wander
      entity.moveTarget = {x: moveData.x, y: moveData.y}

      // if entity has found a tree && the moveTarget is null so it has just been cleared
      if (entity.foundTree == true) {

        // set the berry at the target to be false since the entity went nom nom
        trees[[entity.treeTarget.tilePos.x, entity.treeTarget.tilePos.y]].berry = false;
        entity.foundTree = false;

        // find a new tree with berries, and the entity has also eaten one berry today  so add the amount of food its worth ^w^
        entity.treeTarget = {}
        entity.treesEaten = clamp(entity.treesEaten + simulationFactors.foodValue, 0, entity.foodStorageCap);

      }
    }

    // update available tiles while wandering
    entity = fabricatedKnowledge.getEntityTile(entity)

    // check if entity has not had its maximum amount of food (its not full) and it hasnt found a tree yet to eat
    if (entity.treesEaten < entity.foodStorageCap && entity.foundTree == false) {
      for (tile in entity.accessibleTiles) {
        current_tile = entity.accessibleTiles[tile]

        if (current_tile.tree == true) {
          if (trees[[current_tile.realX, current_tile.realY]].berry == true) {
            entity.foundTree = true;
            entity.moveTarget = {x:current_tile.realX * tileSize, y:current_tile.realY * tileSize}
            entity.treeTarget = trees[[current_tile.realX, current_tile.realY]]
         }
        }
      }
    }

    fabricatedKnowledge.moveTowardsGoal(entity, entity.moveTarget.x, entity.moveTarget.y)

    return entity
  },

  getEntityTile: function(entity) {
    let entX = Math.ceil(entity.position.x/tileSize);
    let entY = Math.ceil(entity.position.y/tileSize);

    let tleft =  {x: entX - entity.sense, y: entY - entity.sense};
    let bright = {x: entX + entity.sense, y: entY + entity.sense};

    let accessibleTiles = [];

    for (   let x = tleft.x; x < bright.x; x++ ) {
      for ( let y = tleft.y; y < bright.y; y++ ) {

        current_tile = totalTiles[[x,y]]

        if(current_tile != undefined) {
          accessibleTiles.push(current_tile)
        }

      }
    }
    entity.accessibleTiles = accessibleTiles;

    return entity
  },
}
