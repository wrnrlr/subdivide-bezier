// Adaptive Bezier Curve
// Based on: 
// https://github.com/seanchas116/bezier-subdivide/blob/master/index.js
// https://github.com/pelson/antigrain/blob/master/agg-2.4/src/agg_curves.cpp

export type Vec2 = [number, number];

export type Options = {
  recursionLimit?:number,
  floatEpsilon?:number,
  pathEpsilon?:number,
  angleEpsilon?:number,
  angleTolerance?:number,
  cuspLimit?:number
}

const {abs, atan2, PI} = Math;

// Adaptive Bezier Curve
// https://github.com/mattdesl/adaptive-bezier-curve/blob/master/function.js
// https://github.com/seanchas116/bezier-subdivide/blob/master/index.js
// Based on: https://github.com/pelson/antigrain/blob/master/agg-2.4/src/agg_curves.cpp

export function createBezierSubdivider(options?:Options) {
  const recursionLimit = options?.recursionLimit || 8,
        floatEpsilon = options?.floatEpsilon || 1.19209290e-7,
        pathEpsilon = options?.pathEpsilon || 1.0,
        angleEpsilon = options?.angleEpsilon || 0.01,
        angleTolerance = options?.angleTolerance || 0,
        cuspLimit = options?.cuspLimit || 0;

  return (start:Vec2, c1:Vec2, c2:Vec2, end:Vec2, scale=1.0, points:Array<Vec2>=[]) => {
    const distanceTolerance = (pathEpsilon / scale)**2;
    begin(start, c1, c2, end, points, distanceTolerance)
    return points
  }

  function begin(p1:Vec2, c1:Vec2, c2:Vec2, p2:Vec2, points:Array<Vec2>, distanceTolerance:number) {
    points.push(clone(p1))
    const x1 = p1[0], y1 = p1[1],
          x2 = c1[0], y2 = c1[1],
          x3 = c2[0], y3 = c2[1],
          x4 = p2[0], y4 = p2[1];
    recursive(x1, y1, x2, y2, x3, y3, x4, y4, points, distanceTolerance, 0)
    points.push(clone(p2))
  }

  function recursive(x1:number, y1:number, x2:number, y2:number, x3:number, y3:number, x4:number, y4:number, points:Array<Vec2>, distanceTolerance:number, level:number) {
    if (level > recursionLimit) return

    // Calculate mid-points of line segments
    const x12 = (x1 + x2) / 2, y12 = (y1 + y2) / 2,
          x23 = (x2 + x3) / 2, y23 = (y2 + y3) / 2,
          x34 = (x3 + x4) / 2, y34 = (y3 + y4) / 2,
          x123 = (x12 + x23) / 2, y123 = (y12 + y23) / 2,
          x234 = (x23 + x34) / 2, y234 = (y23 + y34) / 2,
          x1234 = (x123 + x234) / 2, y1234 = (y123 + y234) / 2;

    if (level > 0) { // Enforce subdivision first time
      // Try to approximate the full cubic curve by a single straight line
      let dx = x4-x1, dy = y4-y1;

      const d2 = Math.abs((x2 - x4) * dy - (y2 - y4) * dx),
            d3 = Math.abs((x3 - x4) * dy - (y3 - y4) * dx);

      let da1, da2;

      if (d2 > floatEpsilon && d3 > floatEpsilon) {
        // Regular care
        if ((d2 + d3)*(d2 + d3) <= distanceTolerance * (dx*dx + dy*dy)) {
          // If the curvature doesn't exceed the distanceTolerance value
          // we tend to finish subdivisions.
          if (angleTolerance < angleEpsilon) {
            points.push([x1234, y1234])
            return
          }

          // Angle & Cusp Condition
          const a23 = Math.atan2(y3 - y2, x3 - x2)
          da1 = Math.abs(a23 - Math.atan2(y2 - y1, x2 - x1))
          da2 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - a23)

          if (da1 >= PI) da1 = 2*PI - da1
          if (da2 >= PI) da2 = 2*PI - da2

          if (da1 + da2 < angleTolerance) {
            // Finally we can stop the recursion
            points.push([x1234, y1234])
            return
          }

          if (cuspLimit !== 0.0) {
            if (da1 > cuspLimit) {
              points.push([x2, y2])
              return
            } else if (da2 > cuspLimit) {
              points.push([x3, y3])
              return
            }
          }
        }
      } else {
        if (d2 > floatEpsilon) {
          // p1, p3, p4 are collinear, p2 is considerable
          if (d2 * d2 <= distanceTolerance * (dx*dx + dy*dy)) {
              if (angleTolerance < angleEpsilon) {
                points.push([x1234, y1234])
                return
              }
              // Angle Condition
              da1 = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1))
              if (da1 >= PI) da1 = 2*PI - da1

              if (da1 < angleTolerance) {
                points.push([x2, y2])
                points.push([x3, y3])
                return
              } else if (cuspLimit !== 0.0 && da1 > cuspLimit) {
                points.push([x2, y2])
                return
              }
          }
        } else if (d3 > floatEpsilon) {
          // p1, p2, p4 are collinear, p3 is considerable
          if (d3 * d3 <= distanceTolerance * (dx*dx + dy*dy)) {
            if (angleTolerance < angleEpsilon) {
              points.push([x1234, y1234])
              return
            }

            // Angle Condition
            da1 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y3 - y2, x3 - x2))
            if (da1 >= PI) da1 = 2*PI - da1;

            if (da1 < angleTolerance) {
              points.push([x2, y2]);
              points.push([x3, y3]);
              return
            } else if (cuspLimit !== 0.0 && da1 > cuspLimit) {
              points.push([x3, y3])
              return
            }
          }
        } else {
          // Collinear case
          dx = x1234 - (x1 + x4) / 2;
          dy = y1234 - (y1 + y4) / 2;
          if (dx*dx + dy*dy <= distanceTolerance) {
            points.push([x1234, y1234])
            return
          }
        }
      }
    }

    // Continue subdivision
    recursive(x1, y1, x12, y12, x123, y123, x1234, y1234, points, distanceTolerance, level+1) 
    recursive(x1234, y1234, x234, y234, x34, y34, x4, y4, points, distanceTolerance, level+1) 
  }
}

function clone(v:Vec2):Vec2 { return [v[0], v[1]] }



// export function createBezierSubdivider(options?:Options) {
//   const recursionLimit = options?.recursionLimit || 8,
//         floatEpsilon = options?.floatEpsilon || 1.19209290e-7,
//         pathEpsilon = options?.pathEpsilon || 1.0,
//         angleEpsilon = options?.angleEpsilon || 0.01,
//         angleTolerance = options?.angleTolerance || 0,
//         cuspLimit = options?.cuspLimit || 0;

//   return (p1:Vec2, c1:Vec2, c2:Vec2, p2:Vec2, scale=1.0, points:Array<Vec2>=[]) => {
//     const distanceTolerance = (pathEpsilon / scale)**2;
//     const x1 = p1[0], y1 = p1[1],
//           x2 = c1[0], y2 = c1[1],
//           x3 = c2[0], y3 = c2[1],
//           x4 = p2[0], y4 = p2[1];
//     points.push([x1, y1])
//     subdivide(x1, y1, x2, y2, x3, y3, x4, y4, points, distanceTolerance, 0)
//     points.push([x4, y4])
//     return points
//   }

//   function subdivide(x1:number, y1:number, x2:number, y2:number, x3:number, y3:number, x4:number, y4:number, points:Array<Vec2>, distanceTolerance:number, level:number) {
//     if (level > recursionLimit) return

//     // Calculate mid-points of line segments
//     const x12 = (x1 + x2) / 2, y12 = (y1 + y2) / 2,
//           x23 = (x2 + x3) / 2, y23 = (y2 + y3) / 2,
//           x34 = (x3 + x4) / 2, y34 = (y3 + y4) / 2,
//           x123 = (x12 + x23) / 2, y123 = (y12 + y23) / 2,
//           x234 = (x23 + x34) / 2, y234 = (y23 + y34) / 2,
//           x1234 = (x123 + x234) / 2, y1234 = (y123 + y234) / 2;

//     if (level > 0) { // Enforce subdivision first time
//       // Try to approximate the full cubic curve by a single straight line
//       let dx = x4-x1, dy = y4-y1;

//       const d2 = abs((x2 - x4) * dy - (y2 - y4) * dx),
//             d3 = abs((x3 - x4) * dy - (y3 - y4) * dx);

//       let da1, da2;

//       if (d2 > floatEpsilon && d3 > floatEpsilon) {
//         // Regular care
//         if ((d2 + d3)*(d2 + d3) <= distanceTolerance * (dx*dx + dy*dy)) {
//           // If the curvature doesn't exceed the distanceTolerance value we tend to finish subdivisions.
//           if (angleTolerance < angleEpsilon) {
//             points.push([x1234, y1234])
//             return
//           }

//           // Angle & Cusp Condition
//           const a23 = atan2(y3 - y2, x3 - x2)
//           da1 = abs(a23 - atan2(y2 - y1, x2 - x1))
//           da2 = abs(atan2(y4 - y3, x4 - x3) - a23)

//           if (da1 >= PI) da1 = 2*PI - da1
//           if (da2 >= PI) da2 = 2*PI - da2

//           if (da1 + da2 < angleTolerance) {
//             // Finally we can stop the recursion
//             points.push([x1234, y1234])
//             return
//           }

//           if (cuspLimit !== 0.0) {
//             if (da1 > cuspLimit) {
//               points.push([x2, y2])
//               return
//             } else if (da2 > cuspLimit) {
//               points.push([x3, y3])
//               return
//             }
//           }
//         }
//       } else {
//         if (d2 > floatEpsilon) {
//           // p1, p3, p4 are collinear, p2 is considerable
//           if (d2 * d2 <= distanceTolerance * (dx*dx + dy*dy)) {
//               if (angleTolerance < angleEpsilon) {
//                 points.push([x1234, y1234])
//                 return
//               }
//               // Angle Condition
//               da1 = abs(atan2(y3 - y2, x3 - x2) - atan2(y2 - y1, x2 - x1))
//               if (da1 >= PI) da1 = 2*PI - da1

//               if (da1 < angleTolerance) {
//                 points.push([x2, y2], [x3, y3])
//                 return
//               } else if (cuspLimit !== 0.0 && da1 > cuspLimit) {
//                 points.push([x2, y2])
//                 return
//               }
//           }
//         } else if (d3 > floatEpsilon) {
//           // p1, p2, p4 are collinear, p3 is considerable
//           if (d3 * d3 <= distanceTolerance * (dx*dx + dy*dy)) {
//             if (angleTolerance < angleEpsilon) {
//               points.push([x1234, y1234])
//               return
//             }

//             // Angle Condition
//             da1 = abs(atan2(y4 - y3, x4 - x3) - atan2(y3 - y2, x3 - x2))
//             if (da1 >= PI) da1 = 2*PI - da1;

//             if (da1 < angleTolerance) {
//               points.push([x2, y2], [x3, y3]);
//               return
//             } else if (cuspLimit !== 0.0 && da1 > cuspLimit) {
//               points.push([x3, y3])
//               return
//             }
//           }
//         } else {
//           // Collinear case
//           dx = x1234 - (x1 + x4) / 2;
//           dy = y1234 - (y1 + y4) / 2;
//           if (dx*dx + dy*dy <= distanceTolerance) {
//             points.push([x1234, y1234])
//             return
//           }
//         }
//       }
//     }

//     // Continue subdivision
//     subdivide(x1, y1, x12, y12, x123, y123, x1234, y1234, points, distanceTolerance, level+1) 
//     subdivide(x1234, y1234, x234, y234, x34, y34, x4, y4, points, distanceTolerance, level+1) 
//   }
// }
