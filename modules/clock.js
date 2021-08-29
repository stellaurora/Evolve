
// In game clock functions


// the in game clock which runs every set amount of time based on clock settings
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

    // Reset average values of current alive entities
		let averages = {
			speed: 0,
			scale: 0,
			reproductabililty: 0,
			generation: 0,
			wanderdistance: 0,
		}

    // Total population before
		let population = entities.length;

    // Current oldest entity stats
		let oldest = {generation:-Infinity,daysAlive:-Infinity};

    // List of keys to find averages for
		averageKeys = Object.keys(averages)

		// Entities which survive the day ;o
		let survived_entities = [];

		for (entity in entities) {
			current_entity = entities[entity]

			if (current_entity.treesEaten >= simulationFactors.childReq && Math.random() < (current_entity.reproductabililty/100)) {

				// Determine the starting colour
				startingColour = biome["startingColour"];

				// If random generate a random colour with brightness
				if (genFactors.randomColour == true) {
					startingColour = randomColour(genFactors.entityRANCOLBrightness);
				};

        // Create a new entity
				new_entity = {
					position: 					{x: current_entity.position.x, y: current_entity.position.y} ,
					colour:   					startingColour,
          boundingBox: 				current_entity.boundingBox,
          strokeStyle:  			biome["defaultEntityRing"],
          state:							"wander",
          moveTarget: 				null,
          sense:							current_entity.sense,
          availableTiles: 		[],
          foundTree: 					false,
          treesEaten: 				0,
          generation: 				current_entity.generation+1,
          daysAlive:					0,

          // Mutate values from parent to simulate *natural selection & evolution*
					scale:							clamp(current_entity.scale                * (Math.random() +0.5) * simulationFactors.scaleMutationFactor, simulationFactors.minScale, simulationFactors.maxScale),
          speed:							clamp(current_entity.speed                * (Math.random() +0.5) * simulationFactors.speedMutationFactor, simulationFactors.minSpeed, simulationFactors.maxSpeed),
          reproductabililty:	clamp(current_entity.reproductabililty    * (Math.random() +0.5) * simulationFactors.reproMutationFactor, simulationFactors.minRepro, simulationFactors.maxRepro),
          wanderdistance: 		clamp(current_entity.wanderdistance       * (Math.random() +0.5) * simulationFactors.wandrMutationFactor, simulationFactors.minWandr, simulationFactors.maxWandr),
				}

        // Add the new entities stats to the average for the alive entities
				for (key in averageKeys) {

					current_key = averageKeys[key]

					averages[current_key] += new_entity[current_key]

				}

        // add it to the entities which survive (since it was created it obviously survived ;-;)
				survived_entities.push(new_entity)
			}

      // Make sure its eaten enough food to survive
			if (current_entity.treesEaten >= simulationFactors.foodReq) {

        //reset how many trees its eaten
				current_entity.treesEaten = 0

        // add its value to the averages
				for (key in averageKeys) {

					current_key = averageKeys[key]

					averages[current_key] += current_entity[current_key]

				}

        // check if its the oldest entity alive
				if (current_entity.daysAlive > oldest.daysAlive) {
					oldest.generation = current_entity.generation
					oldest.daysAlive = current_entity.daysAlive

				}

        // make it older
				current_entity.daysAlive += 1

        // add it to the list of things which live ;o
				survived_entities.push(current_entity)
			}
		}

		console.log('It is now day: '+day)

		for (key in averageKeys) {

			current_key = averageKeys[key]

			console.log('Average '+current_key+': '+ averages[current_key]/survived_entities.length)

		}
		console.log(population, survived_entities.length)
		console.log('Population Change: '+(survived_entities.length - population))
		console.log('Total population: ' +survived_entities.length)
		console.log('Oldest: Generation ' +oldest.generation+ ' Day ' +oldest.daysAlive )

    // Update entities & the amount of days that have passed
		entities = survived_entities;
		day += 1
		clocks.dayNight = time;
	};
}
