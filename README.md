Kinetics
==========

> Kinetics is a versatile and easy to use open source particle system written in javascript what interacts with page elements. (WIP ALPHA - params might change )

Check out the [demo website](https://kinetics.li) to see some examples.



Browser
---

Install with: 
```shell
$ npm install @drum-n-bass/kinetics --save
```   

Or, include the CDN:

```html
<script src="//unpkg.com/@drum-n-bass/kinetics"></script>
```   

Or, download the [current build](dist/kinetics.js).


Usage
---

Init kinetics
```js
const kinetics = new Kinetics().interactionHook();
```

Apply attraction to page elements
```html
<div data-kinetics-attraction></div>
```

Custom parameters
```js
const params = {...};
const kinetics = new Kinetics(params).interactionHook();
```


Params
---
> See [default params](src/params.json)

Params to manipulate the possible visual output:

```js
const params = {
  "debug": false,
  "spring": {
    "tension": 8,
    "friction": 10,
    "randomTension": 50,
    "randomFriction": -4,
    "extendedRestDelay": 10
  },
  "canvas": {
    "handlePosition": true
  },
  "particles": {
    "count": 16,
    "sides": {"min": 3, "max": 4},
    "sizes": {"min": 5, "max": 50},
    "rotate": {"speed": 1.5, "direction": null},
    "mode": {
      "type": "linear",
      "speed": 2,
      "boundery": "endless"
    },
    "parallex": {
      "layers": 3,
      "speed": 0.15
    },
    "attract": {
      "chance": 0.75,
      "force": 1,
      "grow": 2,
      "size": null,
      "type": "static",
      "speed": 1.5,
      "direction": -1,
      "radius": 1
    },
    "fill": ["#EF476F","#FFD166","#06D6A0","#118AB2"],
    "toColor": "#FFD166",
    "opacity": "",
    "stroke": {
      "color": "",
      "width": 1
    }
  }
};
```


See ESM+CJS builds [here](dist).

Development
-----------

1. Install package dependencies locally:
```shell
$ npm install
```

2. Start development environment:
```shell
$ npm run dev
```

3. Open http://localhost:3000

> Changes are built in "dev" folder with sourcemaps and are live-reloaded.

Build
-----

```shell
$ npm run build
```

> Builds package into `dist/` folder.

License
-----
See [LICENSE](LICENSE)

