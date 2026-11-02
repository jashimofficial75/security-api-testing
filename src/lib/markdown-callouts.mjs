/**
 * BUILD TIME Markdown plugin (Sätteri mdast, astro.config.mjs): a blockquote
 * whose first line is a marker becomes a callout box (DESIGN.md "Callout
 * boxes"). No dependency, no inline styles: only classes, styled in
 * global.css.
 *
 *   > [!TIP]              → মেন্টরের টিপ
 *   > [!DANGER] Own title → the title given on the marker line
 *
 * Markers: TIP, NOTE, DANGER, LIVE, MISTAKE, CHECK.
 */
const CALLOUTS = {
  TIP: {icon: '💡', title: 'মেন্টরের টিপ'},
  NOTE: {icon: 'ℹ️', title: 'জেনে রাখুন'},
  DANGER: {icon: '⚠️', title: 'সতর্কতা: শুধু নিজের বা অনুমতিপ্রাপ্ত পরিবেশে টেস্ট করুন'},
  LIVE: {icon: '🔶', title: 'লাইভ মোডে টেস্টের আগে অনুমতি নিন'},
  MISTAKE: {icon: '✖', title: 'সাধারণ ভুল'},
  CHECK: {icon: '✔', title: 'সফলতার চেকলিস্ট'},
};

const MARKER = /^\[!([A-Z]+)\][ \t]*([^\n]*)\n?/;

export const callouts = {
  name: 'callouts',
  blockquote(node, ctx) {
    const first = node.children[0];
    const text = first?.type === 'paragraph' ? first.children[0] : null;
    const match = text?.type === 'text' ? MARKER.exec(text.value) : null;
    const kind = match && CALLOUTS[match[1]];
    if (!kind) return;

    // Drop the marker line; then the paragraph if nothing (or only a line break) is left.
    const rest = text.value.slice(match[0].length);
    if (rest) ctx.setProperty(text, 'value', rest);
    else if (first.children.length > 1) {
      ctx.removeNode(text);
      if (first.children[1].type === 'break') ctx.removeNode(first.children[1]);
    } else ctx.removeNode(first);

    ctx.setProperty(node, 'data', {
      hName: 'div',
      hProperties: {className: ['callout', `callout-${match[1].toLowerCase()}`], role: 'note'},
    });
    ctx.prependChild(node, {
      type: 'paragraph',
      data: {hProperties: {className: ['callout-title']}},
      children: [
        {type: 'emphasis', data: {hName: 'span', hProperties: {ariaHidden: 'true'}}, children: [{type: 'text', value: kind.icon}]},
        {type: 'strong', children: [{type: 'text', value: match[2].trim() || kind.title}]},
      ],
    });
  },
};
