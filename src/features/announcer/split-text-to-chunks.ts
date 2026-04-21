export function splitTextToChunks(text: string, maxLen = 200): string[] {
  if (!text.trim()) return [];

  const sentences = text.split(/(?<=[.,!?])\s+/);
  const chunks: string[] = [];

  for (const sentence of sentences) {
    if (sentence.length > maxLen) {
      for (let i = 0; i < sentence.length; i += maxLen) {
        chunks.push(sentence.slice(i, i + maxLen).trim());
      }
    } else {
      chunks.push(sentence.trim());
    }
  }

  return chunks.filter((c) => c.length > 0);
}
