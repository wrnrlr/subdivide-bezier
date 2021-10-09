const { abs , atan2 , PI  } = Math;
function createBezierSubdivider1(options) {
    const recursionLimit = options?.recursionLimit || 8, floatEpsilon = options?.floatEpsilon || 0.00000011920929, pathEpsilon = options?.pathEpsilon || 1, angleEpsilon = options?.angleEpsilon || 0.01, angleTolerance = options?.angleTolerance || 0, cuspLimit = options?.cuspLimit || 0;
    return (start, c1, c2, end, scale = 1, points = [])=>{
        const distanceTolerance = (pathEpsilon / scale) ** 2;
        begin(start, c1, c2, end, points, distanceTolerance);
        return points;
    };
    function begin(p1, c1, c2, p2, points, distanceTolerance) {
        points.push(clone(p1));
        const x1 = p1[0], y1 = p1[1], x2 = c1[0], y2 = c1[1], x3 = c2[0], y3 = c2[1], x4 = p2[0], y4 = p2[1];
        recursive(x1, y1, x2, y2, x3, y3, x4, y4, points, distanceTolerance, 0);
        points.push(clone(p2));
    }
    function recursive(x1, y1, x2, y2, x3, y3, x4, y4, points, distanceTolerance, level) {
        if (level > recursionLimit) return;
        const x12 = (x1 + x2) / 2, y12 = (y1 + y2) / 2, x23 = (x2 + x3) / 2, y23 = (y2 + y3) / 2, x34 = (x3 + x4) / 2, y34 = (y3 + y4) / 2, x123 = (x12 + x23) / 2, y123 = (y12 + y23) / 2, x234 = (x23 + x34) / 2, y234 = (y23 + y34) / 2, x1234 = (x123 + x234) / 2, y1234 = (y123 + y234) / 2;
        if (level > 0) {
            let dx = x4 - x1, dy = y4 - y1;
            const d2 = Math.abs((x2 - x4) * dy - (y2 - y4) * dx), d3 = Math.abs((x3 - x4) * dy - (y3 - y4) * dx);
            let da1, da2;
            if (d2 > floatEpsilon && d3 > floatEpsilon) {
                if ((d2 + d3) * (d2 + d3) <= distanceTolerance * (dx * dx + dy * dy)) {
                    if (angleTolerance < angleEpsilon) {
                        points.push([
                            x1234,
                            y1234
                        ]);
                        return;
                    }
                    const a23 = Math.atan2(y3 - y2, x3 - x2);
                    da1 = Math.abs(a23 - Math.atan2(y2 - y1, x2 - x1));
                    da2 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - a23);
                    if (da1 >= PI) da1 = 2 * PI - da1;
                    if (da2 >= PI) da2 = 2 * PI - da2;
                    if (da1 + da2 < angleTolerance) {
                        points.push([
                            x1234,
                            y1234
                        ]);
                        return;
                    }
                    if (cuspLimit !== 0) {
                        if (da1 > cuspLimit) {
                            points.push([
                                x2,
                                y2
                            ]);
                            return;
                        } else if (da2 > cuspLimit) {
                            points.push([
                                x3,
                                y3
                            ]);
                            return;
                        }
                    }
                }
            } else {
                if (d2 > floatEpsilon) {
                    if (d2 * d2 <= distanceTolerance * (dx * dx + dy * dy)) {
                        if (angleTolerance < angleEpsilon) {
                            points.push([
                                x1234,
                                y1234
                            ]);
                            return;
                        }
                        da1 = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1));
                        if (da1 >= PI) da1 = 2 * PI - da1;
                        if (da1 < angleTolerance) {
                            points.push([
                                x2,
                                y2
                            ]);
                            points.push([
                                x3,
                                y3
                            ]);
                            return;
                        } else if (cuspLimit !== 0 && da1 > cuspLimit) {
                            points.push([
                                x2,
                                y2
                            ]);
                            return;
                        }
                    }
                } else if (d3 > floatEpsilon) {
                    if (d3 * d3 <= distanceTolerance * (dx * dx + dy * dy)) {
                        if (angleTolerance < angleEpsilon) {
                            points.push([
                                x1234,
                                y1234
                            ]);
                            return;
                        }
                        da1 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y3 - y2, x3 - x2));
                        if (da1 >= PI) da1 = 2 * PI - da1;
                        if (da1 < angleTolerance) {
                            points.push([
                                x2,
                                y2
                            ]);
                            points.push([
                                x3,
                                y3
                            ]);
                            return;
                        } else if (cuspLimit !== 0 && da1 > cuspLimit) {
                            points.push([
                                x3,
                                y3
                            ]);
                            return;
                        }
                    }
                } else {
                    dx = x1234 - (x1 + x4) / 2;
                    dy = y1234 - (y1 + y4) / 2;
                    if (dx * dx + dy * dy <= distanceTolerance) {
                        points.push([
                            x1234,
                            y1234
                        ]);
                        return;
                    }
                }
            }
        }
        recursive(x1, y1, x12, y12, x123, y123, x1234, y1234, points, distanceTolerance, level + 1);
        recursive(x1234, y1234, x234, y234, x34, y34, x4, y4, points, distanceTolerance, level + 1);
    }
}
function clone(v) {
    return [
        v[0],
        v[1]
    ];
}
export { createBezierSubdivider1 as createBezierSubdivider };
