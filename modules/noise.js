
// Perlin Noise

// returns perlin noise at certain float
function perlinNoise(x, y, unique) {

	//Similar to chunk culling this finds the top left value of the 1x1 grid region that these coordinates are in
	let x_tl = Math.floor(x);
	let y_tl = Math.floor(y);

	//Bottom right
	let x_br = x_tl + 1;
	let y_br = y_tl + 1;

	// per corner of the grid cell that the value is in
	let tleft = dotProduct(x_tl, y_tl, x, y, unique);
	let tright = dotProduct(x_br, y_tl, x, y, unique);

	//interpolation of tleft and tright dot products
	let top = interpolate(tleft, tright, x - x_tl);

	let bleft = dotProduct(x_tl, y_br, x, y, unique);
	let bright = dotProduct(x_br, y_br, x, y, unique);

	//interpolation of tleft and tright dot products
	let bottom = interpolate(bleft, bright, x - x_tl);

	let interpolated = interpolate(top, bottom, y - y_tl);

	return interpolated

}

//random unit length gradient vector
//(generate a random angle on a unit circle and use trig to find the points of which the hypotenuse of the angle intersects the circumference of the unit circle)
function randomVector(){

	//random angle
	let angle = Math.random() * 360;

	// Points on the circumference of the unit circle
	this.x = Math.cos(angle); // if length of hypotenuse is 1, 1 * cos(angle) = cos(angle)
	this.y = Math.sin(angle);


}

// interpolation mixed with smootherstep, from wikipedia article at https://en.wikipedia.org/wiki/Perlin_noise
function interpolate(a0, a1, w) {
	return (a1 - a0) * ((w * (w * 6.0 - 15.0) + 10.0) * w * w * w) + a0;
}

// dot product
function dotProduct(ix, iy, x, y, unique) {

	// random vector generated at point
	let grad_vector;

	// make random vector at world position if it doesnt exist, else just get it lol (helps preserve integrity between different tiles)
	if (grid[[unique, ix,iy]]){
		grad_vector = grid[[unique, ix,iy]];
	}
	else {
		grad_vector = new randomVector()
		grid[[unique, ix,iy]] = grad_vector;
	}

	// vector between corner and point
	let dist_vector = {
		x: x - ix, // float values - floored/integer value
		y: y - iy  // float values - floored/integer value
	}

	// Dot product of the distance vector and the tile vector
	let dot_product = dist_vector.x * grad_vector.x + dist_vector.y * grad_vector.y

	return dot_product

}

// fractal noise (perlin noise with repetitions at different frequencies)

function fractalNoise(x, y, octaves, lacunarity, persistance, unique) {

	// Total value of multiple perlin noises layered
	let total = 0;

	// Amplitude of the noise total (effected by persistance)
	let amplitude = 1;

	// For clamping back so its not some extreme values
	let totalAmplitude = 0;

	// The frequency which changes every iteration of perlin noise (effected by lacunarity)
	let frequency = 1;

	//repeat perlinNoise
	for (let i = 0; i < octaves; i++ ) {

		// Addition to total of perlin noise which shifts a bit with frequency every iteration
		total += (perlinNoise(x * frequency, y * frequency, unique) + 1) * amplitude;

		// Adjust values per iteration
		totalAmplitude += amplitude;
		amplitude *= persistance;
		frequency *= lacunarity;
	}

	// Clamps back to total amplitude
	return (total/totalAmplitude)
}
