/**
 * Calculate attraction position
 * @param  {string} type   Attraction type
 * @param  {object} point  {x,y}
 * @param  {object} center {x,y}
 * @param  {float} angle  see: particle.getAngle()
 * @param  {float} radius Attraction radius
 * @return {object}        {x,y} point
 */
export default (type, point, center, angle, radius) => {

  let {x, y} = point;
  const {x: cx, y: cy} = center;
  const rx = (x - cx) * radius;
  const ry = (y - cy) * radius;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  switch (type) {
    case "":
    case "static":
      // (nothing)
      break;

    case "drone":
      x = cx + cos * Math.abs(rx) - sin * (ry);
      y = cy + sin * Math.abs(ry) + cos * (ry);
      break;

    case "horz":
      x = cos * rx + cx;
      break;

    case "vert":
      y = sin * ry + cy;
      break;

    case "orbit":
      x = cx + cos * Math.abs(rx) - sin * Math.abs(ry);
      y = cy + sin * Math.abs(rx) + cos * Math.abs(ry);
      break;

    case "bee":
      x = cx + Math.abs(rx) / 2 * cos * sin;
      y = cy + Math.abs(ry) * cos;
      break;

    case "swing":
      x = cx + sin * rx;
      y = cy + sin * ry;
      break;

    default: //
      throw new Error("invalid type: " + type);
  }

  return {x, y};
};
