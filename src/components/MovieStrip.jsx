// ════════════════════════════════════════════════════════════════════════════
// MovieStrip.jsx — Horizontal scrollable row of movie poster cards
// ════════════════════════════════════════════════════════════════════════════

// ─────────────────────────── LESSON 6 START ──────────────────────────────
// Optimizing the UX and Finalizing the Project
// Goal   : Display AI-recommended movies as a scrollable poster strip in chat.
// Output : After each AI reply, a row of clickable movie posters appears.

import { useState, useEffect, useRef } from 'react';
import { omdbDetails } from '../utils/api';
import { useApp } from '../context/AppContext';

export default function MovieStrip({ movies }) {
  const { openMovie } = useApp();

  const scrollRef  = useRef(null);
  const detailsRef = useRef({});

  const [clickingId, setClickingId] = useState(null);
  const [canLeft,    setCanLeft]    = useState(false);
  const [canRight,   setCanRight]   = useState(false);

  const validMovies = movies.filter(m => m.Poster && m.Poster !== 'N/A');

  // Pre-fetch full details in the background so clicking feels instant
  useEffect(() => {
    validMovies.forEach(movie => {
      if (movie.imdbID && !detailsRef.current[movie.imdbID])
        detailsRef.current[movie.imdbID] = omdbDetails(movie.imdbID).catch(() => null);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = async (movie) => {
    if (clickingId) return;
    setClickingId(movie.imdbID);
    const details = await (detailsRef.current[movie.imdbID] || omdbDetails(movie.imdbID).catch(() => null)) || movie;
    openMovie(details);
    setClickingId(null);
  };

  if (!validMovies.length) return null;

  // Show/hide scroll arrows based on scroll position
  const checkArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => {
    const t = setTimeout(checkArrows, 300);
    return () => clearTimeout(t);
  }, [validMovies.length]);

  const scroll = dir => {
    scrollRef.current?.scrollBy({ left: dir * 210, behavior: 'smooth' });
    setTimeout(checkArrows, 350);
  };

  return (
    <div className="movie-strip">
      <div className="strip-label">Tap a movie to view details:</div>
      <div className="strip-outer">
        <button className={`strip-arrow strip-left ${canLeft ? 'visible' : ''}`}
          onClick={() => scroll(-1)} aria-label="Scroll left" tabIndex={canLeft ? 0 : -1}>&#8249;</button>

        <div className="strip-scroll" ref={scrollRef} onScroll={checkArrows}>
          {validMovies.map(movie => {
            const isClicking = clickingId === movie.imdbID;
            return (
              <button key={movie.imdbID} className="strip-card" onClick={() => handleClick(movie)} title={movie.Title}>
                <div className="strip-poster-wrap">
                  <img src={movie.Poster} alt={movie.Title} loading="eager" className="strip-poster"
                    onError={e => {
                      const card = e.target.closest('.strip-card');
                      if (card) card.style.display = 'none';
                      setTimeout(checkArrows, 100);
                    }} />
                  {isClicking && <div className="strip-overlay"><span className="spinner-border spinner-border-sm text-warning" /></div>}
                </div>
                <div className="strip-info">
                  <div className="strip-title">{movie.Title}</div>
                  {movie.Year && <div className="strip-year">{movie.Year}</div>}
                </div>
              </button>
            );
          })}
        </div>

        <button className={`strip-arrow strip-right ${canRight ? 'visible' : ''}`}
          onClick={() => scroll(1)} aria-label="Scroll right" tabIndex={canRight ? 0 : -1}>&#8250;</button>
      </div>
    </div>
  );
}

// ─────────────────────────── LESSON 6 END ────────────────────────────────
