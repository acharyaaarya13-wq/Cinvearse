// SearchModal.jsx — unchanged from Lesson 4

import { useState, useEffect, useRef, useCallback } from 'react';
import { omdbSearch, omdbDetails } from '../utils/api';
import { useApp } from '../context/AppContext';

export default function SearchModal({ onClose }) {
  const { openMovie } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [clickingId, setClickingId] = useState(null);
  const inputRef = useRef(null);
  const detailsCache = useRef({});

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);
  useEffect(() => {
    results.forEach(movie => {
      if (movie.imdbID && !detailsCache.current[movie.imdbID])
        detailsCache.current[movie.imdbID] = omdbDetails(movie.imdbID).catch(() => null);
    });
  }, [results]);

  const handleSearch = useCallback(async (q = query) => {
    const term = q.trim();
    if (!term) return;
    setSearching(true); setSearched(false); setResults([]);
    try { setResults((await omdbSearch(term)).slice(0, 12)); }
    catch { setResults([]); }
    finally { setSearching(false); setSearched(true); }
  }, [query]);

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') onClose();
  };

  const handleCardClick = useCallback(async (movie) => {
    if (clickingId) return;
    setClickingId(movie.imdbID);
    const details = await (detailsCache.current[movie.imdbID] || omdbDetails(movie.imdbID).catch(() => null)) || movie;
    onClose(); openMovie(details); setClickingId(null);
  }, [clickingId, openMovie, onClose]);

  return (
    <div className="search-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="search-modal">
        <div className="search-modal-header">
          <div className="search-input-wrap">
            <i className="bi bi-search search-modal-icon" />
            <input ref={inputRef} type="text" className="search-modal-input"
              placeholder="Search any movie title..." value={query}
              onChange={e => setQuery(e.target.value)} onKeyDown={handleKey} autoComplete="off" />
            {query && <button className="search-clear-btn" onClick={() => { setQuery(''); setResults([]); setSearched(false); }}><i className="bi bi-x-lg" /></button>}
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close"><i className="bi bi-x-lg" /></button>
        </div>
        <div style={{ padding: '10px 14px 12px' }}>
          <button className="btn btn-warning fw-semibold w-100" onClick={() => handleSearch()}
            disabled={searching || !query.trim()} style={{ borderRadius: 12, height: 44 }}>
            {searching ? <><span className="spinner-border spinner-border-sm me-2" />Searching&hellip;</> : <><i className="bi bi-search me-2" />Search</>}
          </button>
        </div>
        <div className="search-modal-results">
          {searching && <div className="search-empty"><div className="spinner-border text-warning mb-3" /><p>Searching for &ldquo;{query}&rdquo;&hellip;</p></div>}
          {!searching && searched && results.length === 0 && <div className="search-empty"><i className="bi bi-camera-reels" style={{ fontSize: '2.5rem', opacity: 0.35 }} /><p style={{ marginTop: 12 }}>No results for &ldquo;{query}&rdquo;</p></div>}
          {!searching && !searched && <div className="search-empty"><i className="bi bi-film" style={{ fontSize: '2.5rem', opacity: 0.2 }} /><p style={{ marginTop: 12, opacity: 0.45 }}>Type a title and press Search</p></div>}
          {!searching && results.length > 0 && (
            <div className="search-results-grid">
              {results.map(movie => {
                const isClicking = clickingId === movie.imdbID;
                const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : null;
                return (
                  <button key={movie.imdbID || movie.Title} className="search-result-card"
                    onClick={() => handleCardClick(movie)} disabled={!!clickingId} title={movie.Title}>
                    <div className="search-result-poster-wrap">
                      {poster ? <img src={poster} alt={movie.Title} className="search-result-poster" loading="lazy" /> : <div className="search-result-no-poster"><i className="bi bi-film" /></div>}
                      {isClicking && <div className="search-result-overlay"><span className="spinner-border spinner-border-sm text-warning" /></div>}
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-title">{movie.Title}</div>
                      {movie.Year && <div className="search-result-year">{movie.Year}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
