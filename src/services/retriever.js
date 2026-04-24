const natural = require('natural');
const { getAllKnowledge } = require('../database/knowledge');

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// Cache TF-IDF index agar tidak rebuild setiap request
let cachedTfidf = null;
let cachedKnowledge = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // rebuild cache setiap 5 menit

function getIndex() {
  const now = Date.now();
  // Pakai cache jika masih fresh
  if (cachedTfidf && (now - lastCacheTime) < CACHE_TTL) {
    return { tfidf: cachedTfidf, knowledge: cachedKnowledge };
  }

  const knowledge = getAllKnowledge();
  const tfidf = new TfIdf();
  knowledge.forEach(k => {
    tfidf.addDocument(k.topik + ' ' + k.konten);
  });

  cachedTfidf = tfidf;
  cachedKnowledge = knowledge;
  lastCacheTime = now;

  return { tfidf, knowledge };
}

/**
 * Cari topik paling relevan berdasarkan pesan user
 * Pakai TF-IDF similarity dengan score threshold
 */
function retrieve(userMessage, topN = 2) {
  const { tfidf, knowledge } = getIndex();
  if (!knowledge.length) return null;

  const tokens = tokenizer.tokenize(userMessage.toLowerCase());
  if (!tokens.length) return null;

  const scores = knowledge.map((k, i) => {
    let score = 0;
    tokens.forEach(token => {
      score += tfidf.tfidf(token, i);
    });
    return { score, knowledge: k };
  });

  scores.sort((a, b) => b.score - a.score);

  // Ambil topN dengan score di atas threshold (1.0)
  // Ini mencegah topik yang hampir tidak relevan ikut diinjek
  const MIN_SCORE = 1.0;
  const relevant = scores
    .filter(s => s.score >= MIN_SCORE)
    .slice(0, topN);

  if (!relevant.length) return null;

  // Format output yang lebih ringkas untuk hemat token
  return relevant
    .map(s => `[${s.knowledge.topik}]\n${s.knowledge.konten}`)
    .join('\n\n---\n\n');
}

// Panggil ini setelah update knowledge base agar cache langsung fresh
function invalidateCache() {
  cachedTfidf = null;
  cachedKnowledge = null;
  lastCacheTime = 0;
}

module.exports = { retrieve, invalidateCache };
