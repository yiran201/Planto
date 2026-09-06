// 唯一 id 生成，不依赖 crypto.randomUUID 以兼容更广的运行环境。

let counter = 0;

export function createId(prefix = 'id') {
  counter = (counter + 1) % 1_000_000;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${counter}_${rand}`;
}
