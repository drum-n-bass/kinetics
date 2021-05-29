// Super simple feature test
// TODO: add more browser compatibilities tests, or use external library
export default () => {
  return !!document.querySelector && !!window.requestAnimationFrame;
}