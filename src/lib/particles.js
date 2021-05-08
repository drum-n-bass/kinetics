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

  //////////////////////////////////////////////////

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

  //////////////////////////////////////////////////

  attract(area, config) {
    const { chance } = config;
    const count = this.particles.length;
    const shuffled = [].concat(this.particles)
                       .sort(() => Math.random());
    shuffled.forEach((p, i) => {
      if (i/count < chance) {
        const pos = p.position;
        const point = pointOnRect(pos.x, pos.y, area.left, area.top, area.right, area.bottom, false);
        const center = {
          x: area.left + ((area.right - area.left) / 2),
          y: area.top + ((area.bottom - area.top) / 2)
        };

        p.attract(point, center, config);
      }
    });
  }


  unattract() {
    this.particles.forEach(p => p.unattract());
  }


  bump(x, y) {
    this.particles.forEach(p => {
      if (p.isAttracted) {
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
      // Attached scrolling fix + attached chrome bug.
      // programatically make the y-axis follow scroll diff
      if (p.isAttracted) p.attractTo.y -= diff;

      // parallex effect
      else {
        const { layers, speed } = this.config.particles.parallex;
        p.position.y -= diff * (i%layers * speed);
      }
    });
  }


  resetCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    // this.ctx.fillStyle =
    // this.ctx.fillRect(0, 0, this.width, this.height);
  }

  canvasResized(width, height) {
    this.width = width;
    this.height = height;

    this.particles.forEach(p => p.canvasResized(width, height));
  }
}
