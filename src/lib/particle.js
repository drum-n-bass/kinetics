import rebound from 'rebound';
import calculateAttractPosition from './calculateAttractPosition.js';
import calculateMovement from './calculateMovement.js';
import calculateBounderies from './calculateBounderies.js';
import getNumberInRange from '../util/getNumberInRange.js';

export default class Particle {

  /**
   * Particle constructor
   * @param  {object} ctx          Canvas context
   * @param  {object} config       Configuration
   * @param  {object} springSystem Spring system
   */
  constructor(ctx, config, springSystem) {
    this.ctx = ctx;
    this.config = config;
    const { particles: { sides, fill, stroke } } = config;

    this.sides = getNumberInRange(sides);
    this.sidesSeeds = Array.from(Array(this.sides)).map((_,i) => Math.random());
    // this.life = 999;  // TODO

    // a random number, index position in arrays (fill, colors, more?)
    const randomIndex = arr => Math.floor(Math.random() * arr.length);
    this.indexes = {
      fill: randomIndex(fill.colors),
      fillTo: randomIndex(fill.toColors),
      stroke: randomIndex(stroke.colors),
      strokeTo: randomIndex(stroke.toColors),
      strokeWidth: randomIndex(stroke.width)
    };

    // init values
    this.seeds = { x: Math.random(), y: Math.random() };
    this.springPosition = 0;
    this.position = { x: 0, y: 0 };
    this.attractPoint = { x: 0, y: 0 };
    this.attractCenter = { x: 0, y: 0 };
    this.attractConfig = {chance: 1, direction: 1, force: 1, grow: 1, radius: 1, size: null, speed: 1, type: "" };
    this.resetFlip();
    // this.canvasWidth = 0;
    // this.canvasHeight = 0;

    // initialise spring
    const { spring: { tension, friction, randomTension, randomFriction } } = config;
    this.spring = springSystem.createSpring(
      tension + (this.seeds.x * randomTension),
      friction + (this.seeds.y * randomFriction)
    );

    // this.onSpringAtRest = this.onSpringAtRest.bind(this);
    this.onSpringUpdate = this.onSpringUpdate.bind(this);
    this.spring.addListener({
      onSpringUpdate: this.onSpringUpdate,
      // onSpringAtRest: this.onSpringAtRest
    });
  }

  /** Remove particle */
  destroy() {
    if (this.spring) this.spring.destroy();
  }

  /**
   * Update particle configuration
   * @param {object} config
   */
  set(config) {
    this.config = config;
    this.resetFlip();
  }

  /** Reset flip state */
  resetFlip() { this.flip = {x: 1, y: 1}; }

  /**
   * Spring entered resting poition
   */
  // onSpringAtRest(spring) {
  //   if (this.config.debug) console.log("onSpringAtRest");
  //   // Activate after some time
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
   * @param  {object} spring
   */
  onSpringUpdate(spring) {
    this.springPosition = spring.getCurrentValue();
  }

  /**
   * Every particle needs to know it's bounderies
   * @param  {number} width
   * @param  {number} height
   */
  canvasResized(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;

    // re-position: spread particles throughout the canvas
    this.position = {x: Math.floor(this.seeds.x * width), y: Math.floor(this.seeds.y * height)};
  }


  // ========================================================================


  /**
   * Attract particle to point
   * @param  {object} point  xy object
   * @param  {object]} center xy object
   * @param  {object} config
   */
  attract(point, center, config) {
    this.attractPoint = point;
    this.attractCenter = center;
    this.attractConfig = config;
    this.spring.setEndValue(config.force);
    this.isAttracted = true;
  }

  /** Unattract particle */
  unattract() {
    if (!this.isAttracted) return;
    this.spring.setEndValue(0);
    this.isAttracted = false;
  }

  /** Attract position manipulator */
  attractPosition() {
    if (this.isAttracted || !this.spring.isAtRest()) {
      const { type, speed, direction, radius } = this.attractConfig;
      // TODO: this is only needed on some modes
      const angle = this.getAngle(direction, (this.seeds.x * speed) + speed);
      return calculateAttractPosition(type, this.attractPoint, this.attractCenter, angle, radius);
    }
    else return this.attractPoint;
  }


  // ========================================================================


  /**
   * Modulate the position
   * @param  {object} pos  {x, y} source point
   * @param  {object} mode Mode configuation
   * @return {object}      {x, y} modulated point
   */
  modulatePosition(pos, mode) {
    // Movement
    const {type, speed, boundery} = mode;
    pos = calculateMovement(type, pos, speed, this.flip, this.seeds);

    // Bounderies
    const { sizes: { max }, stroke: { width }} = this.config.particles;
    const maxsize = max + this.idxValue(width,'strokeWidth');
    pos = calculateBounderies(boundery, pos, maxsize, this.flip, this.canvasWidth, this.canvasHeight);

    // TODO: (is this meaningful?) performance, less sub-pixel rendering
    // pos.x = Math.floor(pos.x);
    // pos.y = Math.floor(pos.y);
    return pos;
  }

  /**
   * Generate shape
   * @param  {number} x     center x
   * @param  {number} y     center y
   * @return {array}        array of vertices
   */
  generateVertices(x, y) {
    // dynamically resize on attract/spring
    const { grow, size } = this.attractConfig;
    let attractSizing = 1;
    if (!size) attractSizing += this.springPosition * ( grow >= 1 ? grow : grow - 1 );

    const { sizes, rotate: { speed, direction } } = this.config.particles;
    const angle = this.getAngle(direction, speed)

    return Array.from(Array(this.sides)).map((_, i) => {
      const slice = 360/this.sides;
      const posAngle = ((this.sidesSeeds[i] * slice) + (i * slice)) * Math.PI / 180;
      let length = getNumberInRange(sizes, this.sidesSeeds[i]);

      if (size) {  // attract to fixed size?
        const attractFixedSize = size * this.sidesSeeds[i];
        length = (1 - this.springPosition) * length + this.springPosition * attractFixedSize;  // transition between original and fixed size
      }

      const vx = length * Math.cos(posAngle) * attractSizing;
      const vy = length * Math.sin(posAngle) * attractSizing;
      return {
        x: x + vx * Math.cos(angle) - vy * Math.sin(angle),
        y: y + vx * Math.sin(angle) + vy * Math.cos(angle)
      }
    });
  }

  /**
   * Get Angle in current frame
   * @param  {int} direction Rotation direction (and quantity)
   * @param  {float} speed   Rotation speed
   * @return {float}         Angle (in radians)
   */
  getAngle(direction, speed) {
    const angle = (this.ctx.frameCount * speed)%360
                  * ( Number.isInteger(direction) ? direction : (this.seeds.x > 0.5 ? 1 : -1) );  // if not set, randomly set rotate direction (positive/negative)
    return angle * Math.PI / 180;  // in Radians
  }

  /**
   * Get modulated particle position
   * @return {object} {x, y} point
   */
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

  // ========================================================================

  /**
   * Update (on each frame)
   */
  update() {
    // if (typeof this.canvasWidth === 'undefined') return;  // not yet initialised?
    const {x, y} = this.getPosition();
    this.vertices = this.generateVertices(x, y);
    // this.life--;
  }

  /**
   * Draw (on each frame)
   */
  draw() {
    // if (typeof this.canvasWidth === 'undefined') return;  // not yet initialised?

    this.ctx.beginPath();
    // this.ctx.moveTo (this.vertices[0][0], this.vertices[0][1]);
    this.vertices.forEach(p => this.ctx.lineTo(p.x, p.y));
    this.ctx.closePath();


    // ** FILL **
    const { fill, stroke } = this.config.particles;

    // ** FILL **
    if (fill.colors.length) { // any colors in the array?
      let fillColor = this.idxValue(fill.colors,'fill');
      if (fill.toColors.length) {
        fillColor = rebound.MathUtil.interpolateColor(this.colorPosition(), fillColor, this.idxValue(fill.toColors,'fillTo'));
      }
      this.ctx.fillStyle = fillColor + this.float2hex(fill.opacity);
      this.ctx.fill();
    }

    // ** STROKE **
    if (stroke.colors.length) { // any colors in the array?
      const strokeWidth = this.idxValue(stroke.width,'strokeWidth');
      if (strokeWidth > 0) {    // valid stroke width?
        let strokeColor = this.idxValue(stroke.colors,'stroke');
        if (stroke.toColors.length)
          strokeColor = rebound.MathUtil.interpolateColor(this.colorPosition(), strokeColor, this.idxValue(stroke.toColors,'strokeTo'));

        this.ctx.strokeStyle = strokeColor + this.float2hex(stroke.opacity);
        this.ctx.lineWidth = strokeWidth;
        this.ctx.stroke();
      }
    }
  }


  // ========================================================================


  /**
   * Calculate color position in interpolation
   * @return {number} Current position
   */
  colorPosition() {
    return Math.abs(
      Math.sin(this.ctx.frameCount * this.seeds.x * Math.PI / 180)
    );
  }

  /**
   * float to HEX
   * with limiter (0-1 --> 00-ff)
   * @param  {number} f input float
   * @return {string}   HEX value
   */
  float2hex(f) {
    return (Number.isNaN(f) || f < 0 || f > 1) ? ''
          : Math.floor(f * 255).toString(16).padStart(2, 0);
  }

  /**
   * Get indexed value from array
   * @param  {Array} arr input array
   * @param  {number} idx Index to fetch
   * @return {*|null}     Value or null if invalid
   */
  idxValue(arr, idx) {
    return arr.length ? arr[this.indexes[idx]] : null;
  }
}
