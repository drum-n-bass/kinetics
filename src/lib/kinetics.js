// import rebound from 'rebound';
import merge from 'deepmerge';
import onscrolling from 'onscrolling';
// import { ResizeObserver as Ponyfill_RO } from '@juggle/resize-observer';

import defaultConfig from '../kinetics.config.json';
import { version } from '../../package.json';

import dpr from '../util/dpr';
import browsersupport from '../util/browsersupport';
import configParser from '../util/configParser';

// import { elementDimentions } from './events.js';
import Particles from './particles.js';
import interactionHook from './interactionHook';

const Kinetics = (function () {
  'use strict';

  let _this = null;  // TODO: refactor
  const mergeOptions = { arrayMerge: (destinationArray, sourceArray, options) => sourceArray };

  /**
   * Kinetics initialisation
   * @param {Object} options   (optional) Override opt
   * @param {DOM Element} container (optional) container element
   */
  function Kinetics (options = {}, container) {
    if ( !browsersupport() ) return console.warn("KINETICS: FAILED FEATURE TEST");  // ERROR

    // console.log('CONSTRUCTOR', version, options);
    _this = this;

    this.destroy();  // just in case

    // Load configuration
    this.config = configParser(merge(defaultConfig, options, mergeOptions));
    this.originalConfig = merge({}, this.config);	// clone it

    this.container = container;  // (optional) container element

    this.construct();
  };

  Kinetics.prototype.VERSION = version;


  /**
   * constructor
   */
  Kinetics.prototype.construct = function() {
    // Destroy any existing initializations
    this.paths = [];   // init paths array

    // // ResizeObserver (with ponyfill, if required)
    // const RO = ('ResizeObserver' in window === false) ? Ponyfill_RO : ResizeObserver;
    // this.resizeObserver = new RO(onResizeObserved);

    // Intersection observer is optional, only used for "paused" (performance, stop animation when out of view)
    if ('IntersectionObserver' in window) this.intersectionObserver = new IntersectionObserver(onIntersectionObserved);

    this.init();
    // this.setupCanvas(0,0);  // HACK: kick it once until resizeObserver is called with correct width/height
    onResizeObserved();
    // this.onScroll = this.onScroll.bind(this);
  }


  /**
  * Destroy the current initialization.
  * @public
  */
  Kinetics.prototype.destroy = function() {
    // If plugin isn't already initialized, stop
    if ( !this.config ) return;
    if (this.config.debug) console.log("destroy");

    // TODO: FIX THIS !
    if (this.spring) this.spring.destroy();
    if (this.canvas) this.canvas.remove();

    // UNHOOK EVENTS
    onscrolling.remove(onScroll);
    // if (this.resizeObserver) this.resizeObserver.disconnect();
    // window.removeEventListener('resize', this.onResize);
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    if (this.config.click.shuffle) document.removeEventListener('click', onClick, true);
    if (this.onRestTimeout) clearTimeout(this.onRestTimeout);

    this.config = null;  // Reset variables
  }


  /**
   * Init the kinetics system
   */
  Kinetics.prototype.init = function() {
    if (this.config.debug) console.log("init", this.config);

    // Setup canvas element
    this.canvas = document.createElement('canvas');
    if (this.config.canvas.handlePosition) {
      this.canvas.style.position = this.container ? "absolute" : "fixed";
      this.canvas.style.top = 0;
      this.canvas.style.left = 0;
      // this.canvas.style.width = "100%";
      // this.canvas.style.height = "100%";
      this.canvas.style.zIndex = -1;
    }

    const elem = this.container || document.body;

    // Add canvas to element
    elem.prepend(this.canvas);
    this.ctx = this.canvas.getContext('2d', { alpha: true });  // Select canvas context
    this.ctx.frameCount = 0;
    // initSprings();  // start spring system

    // Create the particles
    this.particles = new Particles(this.ctx, this.config);

    // Start the animation loop
    this.loop();


    // ** HOOK EVENTS **
    window.addEventListener('resize', onResizeObserved);
    // this.resizeObserver.observe(elem);  // Element resize observer
    document.addEventListener('visibilitychange', onVisibilityChanged);


    // TODO: not this... we do't need anymore. should just test if tab in focus, else pause.  mybe not needed? if runs on GPU?
    if (this.intersectionObserver) this.intersectionObserver.observe(elem);  // Element (viewport) interaction observer
    // if (this.config.click.shuffle) document.addEventListener('click', onClick, true); // useCapture = true important !!
    onscrolling(onScroll);  // Scroll handler
  }


  /**
   * Main animation loop
   */
  Kinetics.prototype.loop = function() {
    requestAnimationFrame(_this.loop);

    if (!_this.paused) {
      _this.particles.update();
      _this.particles.draw();
      _this.ctx.frameCount += 1;
    }
  }



  // ========================================================================

  /**********/
  /* CANVAS */
  /**********/

  /**
   * Setup canvas size
   * @param  {number} width
   * @param  {number} height
   */
  Kinetics.prototype.setupCanvas = function(width, height) {
    if (this.config.debug) console.log("setupCanvas", width, height);
    this.width = width;
    this.height = height;

    const _dpr = dpr();
    this.canvas.width = width * _dpr;
    this.canvas.height = height * _dpr;
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";

    if (_dpr !== 1) this.ctx.setTransform(_dpr, 0, 0, _dpr, 0, 0); // Reset context
  }


  /**
   * Clear the canvas
   */
  // Kinetics.prototype.resetCanvas = function() {
  //   this.ctx.clearRect(0, 0, this.width, this.height);
  // }


  /**********
  /* EVENTS *
  /**********

  /**
   * Scroll event
   * @param  {object} e event
   */
  const onScroll = function (e) {
    if (_this.container) return;  // We don't need this scroll on "container", as it uses absolute positioning
    // if (_this.config.debug) console.log("scroll");
    if (_this.paused) return;

    const diff = e - (_this.prevScroll || 0);
    _this.prevScroll = e;

    _this.particles.scroll(diff);
  }

  /**
   * Element resize handler
   */
  const onResizeObserved = function(entries) {
    // console.log("onResizeObserved", entries);
    // const { width, height } = elementDimentions(entries[0]);
    // if (!width || !height) console.warn("KINETICS: UNEXPECTED RESPONSE FROM ResizeObserver");

    const width = _this.container ? _this.container.offsetWidth : window.innerWidth;
    const height = _this.container ? _this.container.offsetHeight : window.innerHeight;
    if (_this.config.debug) console.log("Resize observed: Width " + width + "px, Height " + height + "px");

    _this.setupCanvas(width, height);
    _this.particles.canvasResized(width, height);
  }

  /**
   * Element intersection handler
   */
  const onIntersectionObserved = function(entries) {
    // console.log("onIntersectionObserved");
    _this.paused = entries[0].intersectionRatio === 0;
    if (_this.config.debug) console.log("Paused", _this.paused);
  }


  const onVisibilityChanged = function() {
    // console.log("onVisibilityChanged");
    _this.paused = document.visibilityState === 'hidden'
    if (_this.config.debug) console.log("Paused", _this.paused);
  }



  // ========================================================================

  /*******
     API
   *******/

  /**
   * Update configuration options on particles system
   * @param {Object} options Configuration object (see: kinetics.config.json)
   */
  Kinetics.prototype.set = function(options = {}) {
    this.config = configParser(merge(this.originalConfig, options, mergeOptions));  // important: we use originalConfig (and not config). so each call to .set() resets the config back to original.
    this.particles.set(this.config);
  }


  /**
   * Bump the system
   * Currently, attached to mousemove, see: interactionHook
   */
  Kinetics.prototype.bump = function(x, y, movementX, movementY) {
    // if (this.config.debug) console.log("bump", x, y, movementX, movementY);
    this.particles.bump(movementX, movementY);
    // this.particles.rotate((movementX - movementY) / 10);
    // this.ctx.scale(Math.abs(movementX/10), Math.abs(movementY/10));
    // this.particles.attract(area, force, gravity);
  }


  /**
   * Attract system to area
   * @param  {object} area  Rectangle area object
   * @param  {object} props configuration
   */
  Kinetics.prototype.attract = function(area, props) {
    // if (this.config.debug) console.log("attract", area, force, gravity);
    if (this.config.debug) console.log("attract", area, props);

    this.particles.attract(area, configParser(merge(this.config.particles.attract, props)));
  }


  /**
   * Unattract kinetics system
   */
  Kinetics.prototype.unattract = function() {
    if (this.config.debug) console.log("unattract");
    this.particles.unattract();
  }

  /**
   * Helper: Initialise interactionHook
   * @param  {object} config Configuration object
   * @param  {DOM Element} scope  Parent element
   */
  Kinetics.prototype.interactionHook = function(config, scope) {
    interactionHook(this, config, scope);
  }

  return Kinetics;
})();


export { Kinetics };
