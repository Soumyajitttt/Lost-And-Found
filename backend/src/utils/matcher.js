import natural from "natural";
import stringSimilarity from "string-similarity";



const DEFAULT_THRESHOLD = 0.45;
const TOPK_DEFAULT = 10;

const normalize = (s = "") =>
  s
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildDocuments = (baseItem, candidates) => {
  
  const docs = [];
  docs.push(normalize(`${baseItem.title || ""} ${baseItem.description || ""} ${baseItem.category || ""} ${baseItem.location || ""}`));
  candidates.forEach((c) =>
    docs.push(normalize(`${c.title || ""} ${c.description || ""} ${c.category || ""} ${c.location || ""}`))
  );
  return docs;
};

const vectorize = (tfidf, docIndex) => {
  const map = {};
  tfidf.listTerms(docIndex).forEach((t) => {
    map[t.term] = t.tfidf;
  });
  return map;
};

const cosine = (aMap, bMap) => {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const seen = new Set([...Object.keys(aMap), ...Object.keys(bMap)]);
  seen.forEach((k) => {
    const av = aMap[k] || 0;
    const bv = bMap[k] || 0;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  });
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

const matchItem = (baseItem, candidates = [], options = {}) => {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;
  const topK = options.topK ?? TOPK_DEFAULT;

  if (!candidates || candidates.length === 0) return [];

  const docs = buildDocuments(baseItem, candidates);

  
  const tfidf = new natural.TfIdf();
  docs.forEach((d) => tfidf.addDocument(d));

  const baseVec = vectorize(tfidf, 0);

  const results = [];

  for (let i = 0; i < candidates.length; i++) {
    const cand = candidates[i];
    const candVec = vectorize(tfidf, i + 1);

    const tfidfScore = cosine(baseVec, candVec); 
    const baseShort = normalize(`${baseItem.title || ""} ${baseItem.category || ""}`);
    const candShort = normalize(`${cand.title || ""} ${cand.category || ""}`);
    const fuzzyScore = stringSimilarity.compareTwoStrings(baseShort, candShort); 

    
    const score = tfidfScore * 0.7 + fuzzyScore * 0.3;

    if (score >= threshold) {
      results.push({ item: cand, score, tfidfScore, fuzzyScore });
    }
  }

  
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
};

export default { matchItem };
