// 计算一天内事件块的水平布局（REQ-014，REQ-020 改写为通用 N 路重叠）。
//
// REQ-014 时的实现只处理"恰好两个块互相唯一重叠"这一种情况，一个块同时
// 和 2 个及以上其他块重叠时直接放弃、维持整行宽度——这在"一个长事件
// （比如 9-17 点的工作）内部嵌套了两个互不重叠的短事件（比如 10-11 点
// 开会、13-14 点午休）"这种常见场景下会导致三个块全部整行宽度叠在一起，
// 用户反馈"跨度内有两个事件时显示有问题"。
//
// 改成标准的区间调度（interval partitioning / "会议室数量"）算法：
// 1. 按开始时间把块分成若干"重叠簇"——用一次扫描，簇内当前已纳入的块的
//    最晚结束时间只要 > 下一个块的开始时间，就说明还在同一簇里（即使
//    这两个块本身不直接重叠，只要通过簇内其他块传递重叠，也算一簇）。
// 2. 簇内部按开始时间贪心分配"列"：每个块找当前已存在的、且上一个占用
//    它的块已经结束（结束时间 <= 这个块的开始时间）的列放进去；找不到
//    就开一个新列。这是经典的"最少会议室数"算法，保证同一列内的块两两
//    不重叠。
// 3. 簇最终用到几列，簇内每个块的 columns 就是几，自己占的那一列是它的
//    column——渲染时按 1/columns 等分宽度。
//
// 用户描述的场景验证：A:9-17（长），B:10-11，C:13-14（B、C 本身不重叠，
// 只是都被 A 包住）。按开始时间处理：A 占列 0（列 0 空闲到 17 点）；
// B 开始时列 0 被 A 占着（17>10），开列 1（列 1 空闲到 11 点）；C 开始
// 时列 0 仍被 A 占用（17>13），但列 1 已经空出来了（11<=13），C 复用
// 列 1。结果：A 独占一列（列 0，整个 9-17 期间），B 和 C 共享另一列
// （列 1，各自在自己的时间段内，互不冲突）——这正是期望的效果：长事件
// 和被它包住的多个短事件左右分栏，短事件之间因为不重叠还能纵向复用
// 同一列，不会各占一列造成列数越叠越多。
//
// 周期事件优先靠左（REQ-014 的原要求）：分簇/分列必须按开始时间处理
// 才能保证算法正确（不能为了"周期事件优先"打乱时间顺序），只在开始
// 时间相同时把周期事件排在前面参与列分配，这样平局情况下周期事件仍然
// 更容易分到列 0；但在更复杂的多块场景里不再是"绝对保证最左"，这是
// 从"只处理两个块的特例"换成"通用算法"后功能更强但也更诚实的取舍。
export function computeBlockLayout(blocks) {
  const layout = new Map();
  if (!blocks.length) return layout;

  const sorted = [...blocks].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    const aRecurring = Boolean(a.recurringId);
    const bRecurring = Boolean(b.recurringId);
    if (aRecurring !== bRecurring) return aRecurring ? -1 : 1;
    if (a.id === b.id) return 0;
    return a.id < b.id ? -1 : 1;
  });

  function assignColumns(group) {
    const columnEnds = []; // columnEnds[i] = 目前占用列 i 的块的结束时间
    const placements = [];
    for (const block of group) {
      let column = columnEnds.findIndex((end) => end <= block.start);
      if (column === -1) {
        column = columnEnds.length;
        columnEnds.push(block.end);
      } else {
        columnEnds[column] = block.end;
      }
      placements.push({ block, column });
    }
    const columns = columnEnds.length;
    for (const { block, column } of placements) {
      layout.set(block.id, { column, columns });
    }
  }

  let cluster = [];
  let clusterEnd = -Infinity;
  for (const block of sorted) {
    if (cluster.length && block.start >= clusterEnd) {
      assignColumns(cluster);
      cluster = [];
      clusterEnd = -Infinity;
    }
    cluster.push(block);
    clusterEnd = Math.max(clusterEnd, block.end);
  }
  if (cluster.length) assignColumns(cluster);

  return layout;
}

// 把 computeBlockLayout() 算出的 {column, columns} 换算成 CSS
// left/right（供 DayTimeline.vue/WeekBoard.vue 的 blockStyle() 直接
// 展开进 style 对象）。N 列等分宽度，列与列之间留 2px 缝隙，最外侧两条
// 边保持和不分栏时一致的 8px——column===0 时 left 直接是 '8px'、
// column===columns-1 时 right 直接是 '8px'，是这个通用公式在边界列上
// 的特例，不是另外写的分支。
export function columnBoxStyle(column, columns) {
  if (columns <= 1) return {};
  const widthPercent = 100 / columns;
  return {
    left: column === 0 ? '8px' : `calc(${column * widthPercent}% + 2px)`,
    right: column === columns - 1 ? '8px' : `calc(${100 - (column + 1) * widthPercent}% + 2px)`,
  };
}
