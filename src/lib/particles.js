import rebound from 'rebound';
import Particle from './particle.js';
import pointOnRect from '../util/pointOnRect.js';

export default class Particles {

  constructor(ctx, config, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;

    const { count, sides } = config.particles;
    this.count = count;
    this.sides = sides;

    this.config = config;
    // const { tension, friction } = config.spring;
    // this.tension = tension;
    // this.friction = friction;

    this.init();
  }

  init() {
    this.particles = [];

    this.springSystem = new rebound.SpringSystem();
    for (let i=0; i < this.count; i++) {
      const particle = new Particle(this.ctx, this.config, this.springSystem);
      this.particles.push(particle);
    }
  }

  destory() {
    if (this.springSystem) this.springSystem.destory();
    this.particles.forEach(p => p.destory());
  }

  set(config) {
    if (!config) return;
    // else if (typeof config === "number") {
    //   //TODO: destory particles (and springsystem?)
    //   this.count = config;
    //   this.init();
    // }
    else {
      this.config = config;
      this.particles.forEach(p => p.set(config));
    }
  }

  draw() {
    this.resetCanvas();
    this.particles.forEach(p => p.draw());
  }


  update() {
    this.particles.forEach(p => p.update());

    // this.particles = this.particles.filter(p => !p.isDead());
    // if (frameCount % this.generationSpeed === 0) {
    //   this.init();
    // }
  }


  attract(area, chance, gravity, grow, mode) {
    if (isNaN(chance)) chance = 0.2;
    // if (isNaN(gravity)) gravity = 1;
    // if (isNaN(grow)) grow = 0;
    // if (isNaN(rotationSpeed)) rotationSpeed = 1;

    const count = this.particles.length;
    const shuffled = [].concat(this.particles);
    shuffled.sort(() => chance - Math.random());
    shuffled.forEach((p, i) => {
      if (i/count < chance) {
        const pos = p.position;
        const point = pointOnRect(pos.x, pos.y, area.left, area.top, area.right, area.bottom, false);
        const center = {
          x: area.left + ((area.right - area.left) / 2),
          y: area.top + ((area.bottom - area.top) / 2)
        };

        p.attract(point, center, gravity, grow, mode);
      }
    });
  }

/*
  pointOnRect(pos, rect) {

    const w = rect.right - rect.left;
    const h = rect.bottom - rect.top;
    // const koter = (w + h) * 2;

    const p = Math.random();
    let x = rect.left;
    let y = rect.top + p * h;
    if (p>0.5) {
      x = rect.left + p * w;
      y = rect.top;
    }

    // if (pos < 0.25)https://openprocessing.org/sketch/138410

    // else if (pos < 0.5)
    // else if (pos < 0.75)
    // else

    // koter * pos

    // if (x > rect.left + w)

    // x += pos;
    // y += pos;
    // w -= pos  * 2
    // h -= pos  * 2
    // if (Math.random() <  w / (w + h)) { // top bottom
    //   x = Math.random() * w + x;
    //   y = Math.random() < 0.5 ? y : y + h -1;
    // } else {
    //   y = Math.random() * h + y;
    //   x = Math.random() < 0.5 ? x: x + w -1;
    // }
    return {x, y};
  }
*/

  unattract() {
    this.particles.forEach(p => p.unattract());
  }


  bump(x, y) {
    this.particles.forEach(p => {
      if (p.isAttracted) {
        // console.log(p);
        const factor = 0.1;
        p.attractTo.x += x * factor;
        p.attractTo.y += y * factor;
        // seedX
        // seedY
        // size

      }
    });
  }
  // rotate(angle) {
  //   this.ctx.rotate(angle * Math.PI / 180);
  // }

  scroll(diff) {
    this.particles.forEach((p,i) => {
      // fix scrolling + attached chrome bug.  programatically make the y-axis follow scroll diff
      if (p.isAttracted) p.attractTo.y -= diff;

      // scrolling effect
      else p.position.y -= diff * (i%this.config.particles.parallex.layers * this.config.particles.parallex.speed);
    });


  }

  resetCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    // this.ctx.fillStyle =
    // this.ctx.fillRect(0, 0, this.width, this.height);

  }

  setCanvasSize(width, height) {
    this.width = width;
    this.height = height;

    this.particles.forEach(p => {
      p.setCanvasSize(width, height);
    });


  }
}
