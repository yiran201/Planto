// 极简 Markdown → HTML 转换（REQ-048，供"兴趣活动"的内容字段用）。只
// 覆盖标题（#/##/###）、粗体、斜体、链接、无序列表、段落这几种最常用的
// 语法，不追求完整实现 CommonMark 规范——这里的内容本来就是用户自己写
// 的个人笔记/攻略，不需要表格/代码块/引用这类更复杂的语法，手写这几条
// 规则就够用，不需要为此引入一个完整的第三方 Markdown 解析库依赖。
//
// 渲染结果打算用 `v-html` 插入 DOM（见 ActivityModal.vue），插入前先
// 对原始文本做 HTML 转义，再在转义后的文本上应用 Markdown 规则生成标签
// ——这样用户笔记里如果恰好打了 `<script>` 这类字符，会被转义成纯文本
// 显示，不会被当成真的 HTML 标签解析执行。这份数据虽然只在用户自己本机
// 单机使用（不是网络协作场景），但既然反正要用 v-html，转义一步不额外
// 增加多少成本，属于该做的基本卫生。

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 只认 http(s) 链接——避免 `javascript:` 这类协议被当成链接渲染成可
// 点击的 <a href>。
function inlineMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

// 纯文本摘要（REQ-080，供 ActivityCard.vue 在卡片上露出一小段内容
// 预览用，用户反馈"卡片上看不出内容讲了什么，感觉像收藏夹不像笔记
// 本"）：去掉标题/列表标记和粗体/斜体/链接语法，只留下人眼会读到的
// 文字，取前 `maxLength` 个字符，超出的截断并加"…"。不需要转义 HTML
// （这个结果只用来当纯文本插值显示，不走 v-html，不会被当成标签
// 解析），也不需要处理成多行——摘要本来就是拼成一段贴在卡片底部，换行
// 符直接替换成空格压平。
export function extractPlainTextSummary(source, maxLength = 60) {
  if (!source) return '';
  const text = source
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

export function renderMarkdown(source) {
  if (!source) return '';
  const lines = escapeHtml(source).split(/\r?\n/);
  const html = [];
  let listOpen = false;

  const closeList = () => {
    if (listOpen) {
      html.push('</ul>');
      listOpen = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    const listItem = line.match(/^[-*]\s+(.*)$/);
    if (listItem) {
      if (!listOpen) {
        html.push('<ul>');
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdown(listItem[1])}</li>`);
      continue;
    }
    closeList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }
  closeList();
  return html.join('');
}
