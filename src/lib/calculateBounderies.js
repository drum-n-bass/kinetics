export default (mode, point, maxsize, flip, bounderyWidth, bounderyHeight) => {
  let {x, y} = point;
  let gap = maxsize;
  if (mode === "pong") gap /= 2;  // on pong, we want it to bounce from the center of the shape, approx divide by two.
                                  // This needs to be dynamic.  based on calculated shape (`vertices`) + stroke + grow?
                                  // Can results in ugly "edge disapear/popping" bug, visible on pointy shapes with large stroke width, and "wind" mode.
                                  // Temp solution can be to add manual param `gap = maxsize * bounderyGapFactor` ?



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
