import { createBezierSubdivider, Vec2 } from './mod.ts'

Deno.test('subdivide bezier curve', ()=>{
  const subdivideBezier = createBezierSubdivider()
  const points = subdivideBezier([0, 0], [0, 50], [50, 100], [100, 100]);
  const expected:Array<Vec2> = [[0,0],[0.09765625,4.6875],[1.23291015625,14.02587890625],[3.43017578125,23.25439453125],[6.6162109375,32.2998046875],[10.7177734375,41.0888671875],[15.66162109375,49.54833984375],[21.37451171875,57.60498046875],[27.783203125,65.185546875],[34.814453125,72.216796875],[42.39501953125,78.62548828125],[50.45166015625,84.33837890625],[58.9111328125,89.2822265625],[67.7001953125,93.3837890625],[76.74560546875,96.56982421875],[85.97412109375,98.76708984375],[95.3125,99.90234375],[100,100]];
  assertEquals(points, expected);
})

function assertEquals(actual:Array<Vec2>, expected:Array<Vec2>) {
  const epsilon = 0.05;
  if (actual.length != expected.length) throw new Error(`Length of actual does not match excpected`)
  for (const [i, a] of actual.entries()) {
    const e = expected[i]
    if (Math.abs(a[0] - e[0]) > epsilon || Math.abs(a[1] - expected[i][1]) > epsilon)
      throw new Error(`Element ${i} fails epsilon:${epsilon} [${a}] != [${e}]`)
  }
}
