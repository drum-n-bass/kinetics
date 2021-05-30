export default (type, point, speed, flip, seeds) => {
  let {x, y} = point;

  switch(type) {

    case "wind-from-right":
      x = x - ((seeds.x * speed) + speed) * flip.x;
      break;

    case "wind-from-left":
      x = x + ((seeds.x * speed) + speed) * flip.x;
      break;

    case "linear":
      x = x + Math.cos(Math.PI - (Math.PI * seeds.x)) * speed * flip.x;
      y = y + Math.cos(Math.PI - (Math.PI * seeds.y)) * speed * flip.y;
      break;

    case "rain":
      const _v = ((seeds.y * speed) + speed);
      x = x - (_v / 2) * flip.x;
      y = y + _v * flip.y;
      break;

    case "wind":
      x = x - ((seeds.x * speed) + speed) * flip.x;
      y = y + (seeds.y * speed) * flip.y;
      break;

    case "party":
      x = x + seeds.x * speed * flip.x;
      y = y - seeds.y * speed * flip.y; //Math.floor(Math.random() * 2) - 1;
      break;

    case "space":
      // x -= speed * Math.floor(Math.random() * 2) - 1;
      // y += speed * Math.floor(Math.random() * 2) - 1;
      break;

    default: //
      throw new Error("invalid type: " + type);
  }

  return {x, y};
};
