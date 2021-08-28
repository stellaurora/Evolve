
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

  for (entity in entities) {

    current_entity = entities[entity]
    postsentience.push(current_entity.state(current_entity));

  }

  return postsentience;
}

var fabricatedKnowledge = {
  move: function(entity, x, y) {

    entity.position.x += x;
    entity.position.y += y;

    return entity;
  },

  moveTowardsGoal: function(entity, goalX, goalY) {

    // Check if entity position is already at  target, + trounding since entity position is actually an insanely long floating point number
    if (Math.round(entity.position.x) == goalX && Math.round(entity.position.y) == goalY) {
      entity.moveTarget = null
      return entity
    }

    //get the distance betwteen both ponts to calculate the bearing of the object
    let distX = entity.position.x-goalX;
    let distY = entity.position.y-goalY;

    let angleToGoal = Math.atan2(distY, distX);


    let moveX = -Math.cos(angleToGoal) * entity.speed;
    let moveY = -Math.sin(angleToGoal) * entity.speed;

    return this.move(entity, moveX, moveY)
  },

  wander: function(entity) {

    // if a moveTarget is already set during wandering process
    if (entity.moveTarget == null) {
      let moveX = Math.floor(entity.position.x + (Math.random() -0.5 )* 200);
      let moveY = Math.floor(entity.position.y + (Math.random() -0.5 )* 200);

      entity.moveTarget = {x: moveX, y: moveY}
      return entity
    }

    fabricatedKnowledge.moveTowardsGoal(entity, entity.moveTarget.x, entity.moveTarget.y)

    return entity
  }

}
