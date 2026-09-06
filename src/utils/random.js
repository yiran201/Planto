// 约束随机：加权随机抽取工具。调度器用它在评分（权重）基础上做随机选择，
// 而不是纯确定性地总选分数最高的活动，也不是完全无约束的纯随机。

export function weightedPick(candidates, rng = Math.random) {
  const pool = candidates.filter((c) => c.weight > 0);
  if (pool.length === 0) return null;

  const total = pool.reduce((sum, c) => sum + c.weight, 0);
  let r = rng() * total;
  for (const c of pool) {
    r -= c.weight;
    if (r <= 0) return c.item;
  }
  return pool[pool.length - 1].item;
}

// 不重复地抽取多个：每次抽取后从候选集中剔除已选项。
export function weightedPickMany(candidates, count, rng = Math.random) {
  const pool = candidates.slice();
  const picked = [];
  while (picked.length < count && pool.length > 0) {
    const item = weightedPick(pool, rng);
    if (item === null) break;
    picked.push(item);
    const idx = pool.findIndex((c) => c.item === item);
    if (idx >= 0) pool.splice(idx, 1);
  }
  return picked;
}

// 可选的可复现伪随机数生成器（测试用，可替代 Math.random）。
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
