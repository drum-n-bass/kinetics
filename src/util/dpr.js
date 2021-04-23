/**
 * Cross-browser DevicePixelRatio
 * @return {Number} DevicePixelRatio
 */
export default () => {
  let dpr = 1;
  if (typeof screen !== 'undefined' && 'deviceXDPI' in screen) {
    dpr = screen.deviceXDPI / screen.logicalXDPI;
  }
  else if (typeof window !== 'undefined' && 'devicePixelRatio' in window) {
    dpr = window.devicePixelRatio;
  }

  dpr = Number(dpr.toFixed(3));
  return dpr;
};
