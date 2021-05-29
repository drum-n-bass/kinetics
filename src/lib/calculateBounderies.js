export default (mode, point, maxsize, flip, bounderyWidth, bounderyHeight) => {
	let {x, y} = point;
	const gap = maxsize / 2;

	let outside = "";
	if (x > (bounderyWidth + gap)) outside = "right";
	if (x < -gap) outside = "left";
	if (y > (bounderyHeight + gap)) outside = "bottom";
	if (y < -gap) outside = "top";

	if (outside) switch(mode) {
		case "endless":
			switch(outside) {
				case "left":
					x = bounderyWidth + gap;
					break;
				case "right":
					x = -gap;
					break;
				case "bottom":
					y = -gap;
					break;
				case "top":
					y = bounderyHeight + gap;
					break;
			}
			break;


		case "pong":
			switch(outside) {
				case "left":
					x = -gap;
					flip.x *= -1;
					break;
				case "right":
					x = bounderyWidth + gap;
					flip.x *= -1;
					break;
				case "bottom":
					y = bounderyHeight + gap;
					flip.y *= -1;
					break;
				case "top":
					y = -gap;
					flip.y *= -1;
					break;
			}
			break;

		case "emitter":
			x = bounderyWidth / 2;
			y = bounderyHeight / 2;
			break;

		default: //
			throw new Error("invalid mode: " + mode);
	}

	return {x, y};
}
