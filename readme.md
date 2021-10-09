# Subdivide Bezier

Typescript library to subdivide a bezier curve into a array of points.
It can be used with Deno or as a JavaScript module.

## Usage

Typescript:

```ts
import {createBezierSubdivider} from './mod.ts'
const curve = [[100, 200], [50, 100], [50, 100], [200, 200]],
      subdivide = createBezierSubdivider(),
      points = subdivide(curve[0], curve[1], curve[2], curve[3]);
```

JavaScript:

```js
import {createBezierSubdivider} from './bundle.js'
const curve = [[100, 200], [50, 100], [50, 100], [200, 200]],
      subdivide = createBezierSubdivider(),
      points = subdivide(curve[0], curve[1], curve[2], curve[3]);
```

The `createBezierSubdivider` functions takes an optional options argument:

```ts
type Options = {
  recursionLimit?:number,
  floatEpsilon?:number,
  pathEpsilon?:number,
  angleEpsilon?:number,
  angleTolerance?:number,
  cuspLimit?:number
}
```

## Bundle Module

```bash
deno bundle --watch mod.ts ./bundle.js
```

## Run Tests

```bash
deno test 
```

# Author

Werner Laurensse
