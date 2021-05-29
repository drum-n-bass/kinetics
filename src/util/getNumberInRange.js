export default (range, seed) => {
	seed = seed || Math.random();
	const {min, max} = range;
	return Math.round(seed * (max - min)) + min;
};
