import React from 'react';

export function parseAIText(text, onMovieClick) {
  if (!text || typeof text !== 'string') return null;
  const parts = text.split(/(\*\*[^*\n]{1,80}?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const title = part.slice(2, -2).trim();
      if (onMovieClick && title.length > 1)
        return <button key={i} className="movie-title-chip" onClick={() => onMovieClick(title)} title={`Tap to search for "${title}"`}>🎬 {title}</button>;
      return <strong key={i}>{title}</strong>;
    }
    const lines = part.split('\n');
    return lines.map((line, j) => (
      <React.Fragment key={`${i}-${j}`}>{line}{j < lines.length - 1 && <br />}</React.Fragment>
    ));
  });
}

export function extractTitles(text) {
  if (!text) return [];
  const titles = [];
  const boldRe = /\*\*([^*\n]{2,60}?)\*\*/g;
  let m;
  while ((m = boldRe.exec(text)) !== null) {
    const t = m[1].trim();
    if (t && t.length > 1 && !titles.includes(t)) titles.push(t);
  }
  const numRe = /^\s*\d+[.)]\s+\*{0,2}([^*\n(,–-]{2,50}?)\*{0,2}\s*(?:\(|–|-|,|$)/gm;
  while ((m = numRe.exec(text)) !== null) {
    const t = m[1].trim();
    if (t && t.length > 1 && !titles.includes(t)) titles.push(t);
  }
  return titles.slice(0, 6);
}
