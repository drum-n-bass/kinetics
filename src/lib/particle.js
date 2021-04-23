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
    this.position = {x: 0, y: 0}
    this.attractTo = {x: 0, y: 0}
    this.attractGrow = 0;
    this.resetFlip();

    this.seedX = Math.random();
    this.seedY = Math.random();

    // this.canvasWidth = 0;
    // this.canvasHeight = 0;

    // this.shape = this.generateShape();
    // console.log(this.shape);


    // initialise spring
    this.spring = springSystem.createSpring(
      config.spring.tension + (this.seedX * config.spring.randomTension),
      config.spring.friction + (this.seedY * config.spring.randomFriction)
    );

    this.onSpringAtRest = this.onSpringAtRest.bind(this);
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
  onSpringAtRest(spring) {
    if (this.config.debug) console.log("onSpringAtRest");
    // Activate re-chaos flag after some time
    // if (this.onRestTimeout) clearTimeout(this.onRestTimeout);
    // this.onRestTimeout = setTimeout(onExtendedRest, this.config.spring.extendedRestDelay * 1000); // when would a user normally scroll "again", while it should "feel" the same scroll?
  }

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

  attract(x, y, endval = 1, grow) {
    this.attractTo = { x, y };
    this.attractGrow = typeof grow === 'number' ? grow : this.config.particles.attract.grow;
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

  modulatePosition(pos, mode) {
    // let pos = {x: 0, y: 0};
    const {type, speed, boundery} = mode;
    switch(type){


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


  // generateShape() {
  //   // generate shape
  //   let points = Array.from(Array(this.sides)).map((_, i) => {
  //     let _x = /* x + */ this.size * Math.cos(i * 2 * Math.PI / this.sides);
  //     let _y = /* y + */ this.size * Math.sin(i * 2 * Math.PI / this.sides);
  //     if (i%3 === 0) {  // strech first point, to make it "polygon" styled
  //       _x += this.seedX * this.config.particles.polystrech.x;
  //       _y += this.seedY * this.config.particles.polystrech.y;
  //     }
  //     return [_x, _y];
  //   });


  //   const [centerX, centerY] = this.center(points);
  //   // var cx = 0; cy = 0;
  //   // for (const p of points) {
  //   //     cx += p.x;
  //   //     cy += p.y;
  //   // }
  //   // cx /= points.length;
  //   // cy /= points.length;

  //   const path = new Path2D;
  //   for (const p of points) { path.lineTo(p[0] - centerX, p[1] - centerY); }
  //   path.closePath();
  //   return path;
  // }

  generateShape(x, y) {
    // dynamically resize on attract/spring
    const attractSizing = (
      this.springPosition * (
        this.attractGrow >= 1 ? this.attractGrow : this.attractGrow - 1
      )
    ) + 1;

/*
    return Array.from(Array(this.sides)).map((_, i) => {
      let _x = x + this.size * Math.cos(i * 2 * Math.PI / this.sides) * attractSizing;
      let _y = y + this.size * Math.sin(i * 2 * Math.PI / this.sides) * attractSizing;
      if (i%3 === 0) {  // strech a point, to make it "polygon" styled
        _x += this.seedX * this.config.particles.polystrech.x;
        _y += this.seedY * this.config.particles.polystrech.y;
      }
      return [_x, _y];
    });
*/

    return Array.from(Array(this.sides)).map((_, i) => {
      const slice = 360/this.sides;
      const angle = ((this.sidesSeeds[i] * slice) + (i * slice)) * Math.PI / 180;
      const length = this.getNumberInRange(this.config.particles.size, this.sidesSeeds[i]);

      const _x = x + (length * Math.cos(angle) * attractSizing);
      const _y = y + (length * Math.sin(angle) * attractSizing);
      return [_x, _y];


      // let _x = x + this.size * Math.cos(i * 2 * Math.PI / this.sides) * attractSizing;
      // let _y = y + this.size * Math.sin(i * 2 * Math.PI / this.sides) * attractSizing;
      // if (i%3 === 0) {  // strech a point, to make it "polygon" styled
      //   _x += this.seedX * this.config.particles.polystrech.x;
      //   _y += this.seedY * this.config.particles.polystrech.y;
      // }
      // return [_x, _y];
    });


  }


  update() {
    if (typeof this.canvasWidth === 'undefined') return;  // not yet initialised?

    // Size
    //this.size += (Math.random());
    //if (this.size > 20) this.size -= 2;

    // Set position
    if (!this.isAttracted) {
      this.position = this.modulatePosition(this.position, this.config.particles.mode);
    }


    // const { x, y } = {x: 100, y: 200 };
    // TODO: in-efficient,  override when not animating attract
    const toX = this.attractTo.x;// + ((this.seedX - 0.5) * 100);
    const toY = this.attractTo.y;// + ((this.seedY - 0.5) * 100)
    const x = rebound.MathUtil.mapValueInRange(this.springPosition, 0, 1, this.position.x, toX);
    const y = rebound.MathUtil.mapValueInRange(this.springPosition, 0, 1, this.position.y, toY);

    let points = this.generateShape(x, y);
    // console.log(points);


    // ** rotate polygon around its center
    // const angle = this.seedX * (180 + points[0][1]%360 * (this.seedX > 0.5 ? 1 : -1));
    const angle = (this.ctx.frameCount * this.config.particles.rotate.speed)%360
                * (this.seedX > 0.5 ? 1 : -1);  // randomly set rotate direction (positive/negative)
    const a = angle * Math.PI / 180;
    // const [centerX, centerY] = this.center(points);
    const centerX = x;
    const centerY = y;
    points = points.map(p => {
      return [
        Math.floor((p[0] - centerX) * Math.cos(a) - (p[1] - centerY) * Math.sin(a) + centerX),
        Math.floor((p[0] - centerX) * Math.sin(a) + (p[1] - centerY) * Math.cos(a) + centerY)
      ];
    });

    this.points = points;
    // this.life--;

  }

  draw() {
    if (typeof this.canvasWidth === 'undefined') return;  // not yet initialised?


    this.ctx.beginPath();
    // this.ctx.moveTo (this.points[0][0], this.points[0][1]);
    this.points.forEach(p => this.ctx.lineTo(p[0], p[1]));
    this.ctx.closePath();

    // ** COLOR **
    // const pos = Math.abs(Math.sin(this.points[0][0] * Math.PI / 180)); // * (this.seedX > 0.5 ? 1 : -1));
    const pos = Math.abs(Math.sin(this.ctx.frameCount * this.seedX * Math.PI / 180));
    // this.color++; if (this.color >= this.config.particles.fill.length) this.color = 0;  // TODO: HACK
    const fromColor = this.config.particles.fill[this.color];
    const toColor = this.config.particles.toColor; //this.config.particles.fill[0];
    const color = rebound.MathUtil.interpolateColor(pos, fromColor, toColor);

    // ** FILL **
    this.ctx.fillStyle = color + this.config.particles.opacity;
    this.ctx.fill(this.shape);

    // ** STROKE **
    if (this.config.particles.stroke.color) {
      this.ctx.strokeStyle = this.config.particles.stroke.color + this.config.particles.opacity;
      this.ctx.lineWidth = this.config.particles.stroke.width;
      this.ctx.stroke(this.shape);
    }
  }

  setCanvasSize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.position = {x: Math.floor(this.seedX * width), y: Math.floor(this.seedY * height)};
  }
}