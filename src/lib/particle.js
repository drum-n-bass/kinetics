import rebound from 'rebound';
// import merge from 'deepmerge';

export default class Particle {

  // constructor(ctx, sides, canvasWidth, canvasHeight) {
  constructor(ctx, config, springSystem) {
    this.ctx = ctx;
    this.config = config;
    this.sides = this.getNumberInRange(config.particles.sides);
    this.sidesSeeds = Array.from(Array(this.sides)).map((_,i) => Math.random());

    // this.size = this.getNumberInRange(config.particles.size);
    this.life = 1000;  // TODO

    this.color = Math.floor(Math.random() * config.particles.fill.length);  // select initial color

    this.springPosition = 0;
    this.position = { x: 0, y: 0 }
    this.attractTo = { x: 0, y: 0, center: { x: 0, y: 0 } }
    this.attractConfig = { grow: 0, mode: "" }
    this.resetFlip();

    this.seedX = Math.random();
    this.seedY = Math.random();

    // this.canvasWidth = 0;
    // this.canvasHeight = 0;


    // initialise spring
    this.spring = springSystem.createSpring(
      config.spring.tension + (this.seedX * config.spring.randomTension),
      config.spring.friction + (this.seedY * config.spring.randomFriction)
    );

    // this.onSpringAtRest = this.onSpringAtRest.bind(this);
    this.onSpringUpdate = this.onSpringUpdate.bind(this);
    this.spring.addListener({
      onSpringUpdate: this.onSpringUpdate,
      // onSpringAtRest: this.onSpringAtRest
    });
  }

  set(config) {
    this.config = config;
    this.resetFlip();
  }

  resetFlip() { this.flip = {x: 1, y: 1}; }

  getNumberInRange(range, seed) {
    seed = seed || Math.random();
    const {min, max} = range;
    return Math.round(seed * (max - min)) + min;
  }

  destroy() {
    if (this.spring) this.spring.destroy();
  }



  /**
   * Spring entered resting poition
   */
  // onSpringAtRest(spring) {
  //   if (this.config.debug) console.log("onSpringAtRest");
  //   // Activate re-chaos flag after some time
  //   // if (this.onRestTimeout) clearTimeout(this.onRestTimeout);
  //   // this.onRestTimeout = setTimeout(onExtendedRest, this.config.spring.extendedRestDelay * 1000); // when would a user normally scroll "again", while it should "feel" the same scroll?
  // }

  /**
   * Spring is in extended rest  (long time)
   */
  onExtendedRest() {
    if (this.config.debug) console.log("onExtendedRest");
    // if (this.spring.isAtRest()) this.shouldReChaos = true;
  }

  /**
   * Spring in action
   */
  onSpringUpdate(spring) {
    this.springPosition = spring.getCurrentValue();
    // console.log(val);
    // this.position.y = this.position.y * val;

    // const path = calcPath(this.srcPath, this.dstPath, val);
    // if (this.paths.length >= this.config.path.paths) this.paths.shift();
    // this.paths.push(path);

    // this.resetCanvas();
    // this.drawBackground();
    // this.drawPaths();
  }

  attract(point, center, endval = 1, grow, mode) {
    this.attractTo = {...point, center };
    this.attractConfig = {
      grow: (typeof grow === 'number' ? grow : this.config.particles.attract.grow),
      mode: (typeof mode === 'string' ? mode : this.config.particles.attract.mode)
    }
    this.spring.setEndValue(endval);
    this.isAttracted = true;
  }

  unattract() {
    if (!this.isAttracted) return;
    this.spring.setEndValue(0);
    this.isAttracted = false;
  }


  // pullSpring(pos) {
  //   if (typeof pos === 'undefined') pos = 1;
  //   const val = this.spring.getCurrentValue();
  //   console.log(val, pos, val === pos);
  //   if (val === pos) pos = Math.abs(val-pos);

  //   this.spring.setEndValue(pos);
  // }

/*
  center(arr) {
    const x = arr.map (xy => xy[0]);
    const y = arr.map (xy => xy[1]);
    const cx = (Math.min (...x) + Math.max (...x)) / 2;
    const cy = (Math.min (...y) + Math.max (...y)) / 2;
    return [cx, cy];
  }
*/

  attractPosition() {
    let {x, y} = this.attractTo;
    if (this.isAttracted || !this.spring.isAtRest()) {
      const { mode } = this.attractConfig;
      const { speed, direction } = this.config.particles.attract.rotate;
      const angle = this.getAngle(direction, speed)
      const { x: cx, y: cy } = this.attractTo.center;

      switch (mode) {
        case "":
        case "static":
          // (nothing)
          break;

        case "drone":
          x = Math.cos(angle) * (x-cx) - Math.sin(angle) * (y-cy) + cx;
          y = Math.sin(angle) * (x-cx) + Math.cos(angle) * (y-cy) + cy;
          break;

        case "horz":
          x = Math.cos(angle) * (x-cx) - Math.sin(angle) * (y-cy) + cx;
          break;

        default: //
          throw new Error("invalid mode: " + mode);
      }
    }
    return {x, y};
  }

  modulatePosition(pos, mode) {
    // let pos = {x: 0, y: 0};
    const {type, speed, boundery} = mode;
    switch(type) {


      case "wind-from-right":
        pos.x = pos.x - ((this.seedX * speed) + speed) * this.flip.x;
        // pos.y = pos.y + (this.seedY * speed) * this.flip.y;// * Math.floor(Math.random() * 2) - 1;
        break;

      case "wind-from-left":
        pos.x = pos.x + ((this.seedX * speed) + speed) * this.flip.x;
        // pos.y = pos.y + (this.seedY * speed) * this.flip.y;// * Math.floor(Math.random() * 2) - 1;
        break;

      case "linear":
        pos.x = pos.x + Math.cos(Math.PI - (Math.PI * this.seedX)) * speed * this.flip.x;
        pos.y = pos.y + Math.cos(Math.PI - (Math.PI * this.seedY)) * speed * this.flip.y;
        break;

      case "rain":
        // pos.x = pos.x + Math.cos(Math.PI - (Math.PI * this.seedX)) * speed * this.flip.x;
        pos.x = pos.x - (0.65 * speed) * this.flip.x;
        pos.y = pos.y + ((this.seedY * speed) + speed) * this.flip.y;
        break;

      ///////////////

      case "wind":
        pos.x = pos.x - ((this.seedX * speed) + speed) * this.flip.x;
        pos.y = pos.y + (this.seedY * speed) * this.flip.y;// * Math.floor(Math.random() * 2) - 1;
        break;

      case "party":
        pos.x = pos.x + this.seedX * speed * this.flip.x;
        pos.y = pos.y - this.seedY * speed * this.flip.y; //Math.floor(Math.random() * 2) - 1;
        break;

      case "space":
        // pos.x -= speed * Math.floor(Math.random() * 2) - 1;
        // pos.y += speed * Math.floor(Math.random() * 2) - 1;
        break;

      default: //
        throw new Error("invalid type: " + type);
    }

    pos = this.modulateBounderies(pos, boundery);

    // (optional) performance, less sub-pixel rendering?
    pos.x = Math.floor(pos.x);
    pos.y = Math.floor(pos.y);

    return pos;
  }

  // Position bounderies
  modulateBounderies(pos, mode) {
    let x = pos.x;
    let y = pos.y;
    const size = this.config.particles.size.max;  // used to enlarge range with
    const gap = size / 2;

    let outside = "";
    if (x > (this.canvasWidth + gap)) outside = "right";
    if (x < -gap) outside = "left";
    if (y > (this.canvasHeight + gap)) outside = "bottom";
    if (y < -gap) outside = "top";

    if (outside) {
      switch(mode) {
        case "endless":
          switch(outside) {
            case "left":
              x = this.canvasWidth + gap;
              break;
            case "right":
              x = -gap;
              break;
            case "bottom":
              y = -gap;
              break;
            case "top":
              y = this.canvasHeight + gap;
              break;
          }
          break;


        case "pong":
          switch(outside) {
            case "left":
              x = -gap;
              this.flip.x *= -1;
              break;
            case "right":
              x = this.canvasWidth + gap;
              this.flip.x *= -1;
              break;
            case "bottom":
              y = this.canvasHeight + gap;
              this.flip.y *= -1;
              break;
            case "top":
              y = -gap;
              this.flip.y *= -1;
              break;
          }
          break;

        case "emitter":
          x = this.canvasWidth / 2;
          y = this.canvasHeight / 2;
          break;

        default: //
          throw new Error("invalid mode: " + mode);
      }
    }
    return {x, y};
  }


  /**
   * Generate shape
   * @param  {number} x     center x
   * @param  {number} y     center y
   * @return {array}        array of vertices
   */
  generateVertices(x, y) {
    // dynamically resize on attract/spring
    const { grow } = this.attractConfig;
    const attractSizing = (
      this.springPosition * ( grow >= 1 ? grow : grow - 1 )
    ) + 1;


    const { speed, direction } = this.config.particles.rotate;
    const angle = this.getAngle(direction, speed)

    return Array.from(Array(this.sides)).map((_, i) => {
      const slice = 360/this.sides;
      const posAngle = ((this.sidesSeeds[i] * slice) + (i * slice)) * Math.PI / 180;
      const length = this.getNumberInRange(this.config.particles.size, this.sidesSeeds[i]);

      const vx = (length * Math.cos(posAngle) * attractSizing);
      const vy = (length * Math.sin(posAngle) * attractSizing);
      return {
        x: x + vx * Math.cos(angle) - vy * Math.sin(angle),
        y: y + vx * Math.sin(angle) + vy * Math.cos(angle)
      }
    });
  }


  getAngle(direction, speed) {
    const angle = (this.ctx.frameCount * speed)%360
                  * ( Number.isInteger(direction) ? direction : (this.seedX > 0.5 ? 1 : -1) );  // if not set, randomly set rotate direction (positive/negative)
    return angle * Math.PI / 180;  // in Radians
  }

  getPosition() {
    // Modulate position
    if (!this.isAttracted) {
      this.position = this.modulatePosition(this.position, this.config.particles.mode);
      if (this.spring.isAtRest()) return this.position;  // (optional) performance. we don't need to continue calculating...
    }

    // Modulate attraction position
    let {x, y} = this.attractPosition();
    x = rebound.MathUtil.mapValueInRange(this.springPosition, 0, 1, this.position.x, x);
    y = rebound.MathUtil.mapValueInRange(this.springPosition, 0, 1, this.position.y, y);
    return {x, y};
  }


  update() {
    if (typeof this.canvasWidth === 'undefined') return;  // not yet initialised?
    const {x, y} = this.getPosition();
    this.vertices = this.generateVertices(x, y);
    // this.life--;
  }

  draw() {
    if (typeof this.canvasWidth === 'undefined') return;  // not yet initialised?

    this.ctx.beginPath();
    // this.ctx.moveTo (this.vertices[0][0], this.vertices[0][1]);
    this.vertices.forEach(p => this.ctx.lineTo(p.x, p.y));
    this.ctx.closePath();

    // ** COLOR **
    const pos = Math.abs(Math.sin(this.ctx.frameCount * this.seedX * Math.PI / 180));
    // this.color++; if (this.color >= this.config.particles.fill.length) this.color = 0;  // TODO: HACK
    const fromColor = this.config.particles.fill[this.color];
    const toColor = this.config.particles.toColor; //this.config.particles.fill[0];
    const color = rebound.MathUtil.interpolateColor(pos, fromColor, toColor);

    // ** FILL **
    this.ctx.fillStyle = color + this.config.particles.opacity;
    this.ctx.fill();

    // ** STROKE **
    if (this.config.particles.stroke.color) {
      this.ctx.strokeStyle = this.config.particles.stroke.color + this.config.particles.opacity;
      this.ctx.lineWidth = this.config.particles.stroke.width;
      this.ctx.stroke();
    }
  }

  setCanvasSize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.position = {x: Math.floor(this.seedX * width), y: Math.floor(this.seedY * height)};
  }
}