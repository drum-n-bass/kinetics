import merge from 'deepmerge';

export default (kinetics, config = {}, scope = document) => {
  // if (typeof scope === 'undefined') scope = document;

  const defaultConfig = {
    prefix: "kinetics",
    attraction: {
      keyword: "attraction"
    },
    intersection: {
      threshold: 0.2,
      keyword: "mode"
    }
  };

  // Handle kinetics data attributes instructions, and hook events
  // =============================================================
  const { prefix, attraction, intersection } = merge(defaultConfig, config);

  scope.querySelectorAll(`[data-${prefix}-${attraction.keyword}]`).forEach(element => {
    const props = getProps(element, prefix, attraction.keyword);
    const touchOptions = isPassiveSupported() ? { passive: true } : false;

    // Hook interaction events
    element.addEventListener("mouseenter", evt => kinetics.attract(evt.target.getBoundingClientRect(), props), false);
    element.addEventListener("touchstart", evt => kinetics.attract(evt.target.getBoundingClientRect(), props), touchOptions);

    element.addEventListener("mouseleave", evt => kinetics.unattract(), false);
    element.addEventListener("touchend",   evt => kinetics.unattract(), touchOptions);

    element.addEventListener("mousemove", evt => kinetics.bump(evt.offsetX, evt.offsetY, evt.movementX, evt.movementY), false);
  });


  // ** KINETICS MODE **
  if ('IntersectionObserver' in window) { // incompatible browsers are out there
    const onIntersect = entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const props = getProps(entry.target, prefix, intersection.keyword);
          // console.log(props);
          kinetics.set({particles: { mode: props }});
        }
      });
    }

    // Initialize
    const observer = new IntersectionObserver(onIntersect, { threshold: intersection.threshold });
    scope.querySelectorAll(`[data-${prefix}-${intersection.keyword}]`).forEach(element => {
      observer.observe(element);
    });
  }
}


/**
 * Parse element's dataset
 * @param  {DOM Element} element
 * @param  {String} prefix  data property prefix
 * @param  {String} keyword data property keyword
 * @return {Object}         Parsed properties
 */
function getProps(element, prefix, keyword){
  // -----------------------------------------
  // Get properties from data attribute
  let props = {};
  try {
    const key = prefix + keyword[0].toUpperCase() + keyword.substr(1);  // camelcase
    props = JSON.parse(element.dataset[key]);
  }
  catch(e) {
    Object.keys(element.dataset).forEach(d => {
      let _d = d.replace(/[A-Z]/g, m => "-" + m.toLowerCase());  // camelcase back to dash
      if (_d.startsWith(`${prefix}-`)) {  // is our data-prefix?
        _d = _d.substr(prefix.length+1);  // trim prefix
        if (_d !== keyword) {             // exclude top attribute ("data-kinetics-attraction")
          let v = element.dataset[d];
          if (!isNaN(parseFloat(v))) v = parseFloat(v);
          const k = _d.substr(keyword.length + 1);
          props[k] = v;
        }
      }
    });
  }
  return props;
}


/**
 * Passive event listener supported?
 * see: https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 * @return {Boolean}
 */
function isPassiveSupported() {
  var supportsPassive = false;
  try {
    var opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
      }
    });
    window.addEventListener("testPassive", null, opts);
    window.removeEventListener("testPassive", null, opts);
  } catch (e) {}
  console.log(supportsPassive);
  return supportsPassive;
}
