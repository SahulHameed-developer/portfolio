/**
 * Tiny BM25 retriever. Works in Node (require) and the browser (window.Retriever).
 * No dependencies, so the same code powers the API and the in-page demo.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Retriever = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const STOP = new Set('a an and are as at be by does did do for from has have he his him how i in is it its of on or she that the their this to was what when where which who why will with you your about can tell me experience skill work sahul hameed mohamed'.split(' '));
  const SYN = { nodejs: 'node', 'node.js': 'node', js: 'javascript', llm: 'ai', llms: 'ai', gpt: 'ai', openai: 'ai', ml: 'ai', php: 'php', notice: 'notice', remote: 'remote', wfh: 'remote', reach: 'contact', email: 'contact', phone: 'contact', hire: 'availability', available: 'availability', join: 'notice', aws: 'aws', ec2: 'aws' };

  function tokenize(text) {
    return String(text).toLowerCase()
      .replace(/node\.js/g, 'node')
      .split(/[^a-z0-9+#]+/)
      .filter(t => t && !STOP.has(t))
      .map(t => SYN[t] || (t.length > 4 && t.endsWith('s') ? t.slice(0, -1) : t));
  }

  function createIndex(docs, { k1 = 1.4, b = 0.75 } = {}) {
    const toks = docs.map(d => tokenize(`${d.title} ${d.title} ${d.text}`));
    const avgdl = toks.reduce((s, t) => s + t.length, 0) / toks.length;
    const df = new Map();
    toks.forEach(t => new Set(t).forEach(w => df.set(w, (df.get(w) || 0) + 1)));
    const N = docs.length;
    const idf = w => Math.log(1 + (N - (df.get(w) || 0) + 0.5) / ((df.get(w) || 0) + 0.5));

    function search(query, k = 3) {
      const q = [...new Set(tokenize(query))];
      if (!q.length) return [];
      return toks.map((t, i) => {
        const tf = new Map(); t.forEach(w => tf.set(w, (tf.get(w) || 0) + 1));
        let score = 0;
        q.forEach(w => {
          const f = tf.get(w) || 0;
          if (f) score += idf(w) * (f * (k1 + 1)) / (f + k1 * (1 - b + b * t.length / avgdl));
        });
        return { doc: docs[i], score };
      }).filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
    }
    return { search };
  }

  /** Answer without an LLM: return the best-matching facts. */
  function extractiveAnswer(results) {
    if (!results.length) return "I couldn't find that in Sahul's profile. Try asking about his skills, experience, projects, notice period or contact details.";
    const top = results[0].score;
    return results.slice(0, 2).filter(r => r.score >= top * 0.75).map(r => r.doc.text).join('\n\n');
  }

  return { tokenize, createIndex, extractiveAnswer };
});
