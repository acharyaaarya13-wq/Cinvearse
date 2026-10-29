// MovieModal.jsx — unchanged from Lesson 4

import { useCallback } from 'react';
import { useApp } from '../context/AppContext';

function DetailBox({ label, value }) {
  if (!value || value === 'N/A') return null;
  return (
    <div className="detail-box">
      <div className="detail-label">{label}</div>
      <div className="detail-value">{value}</div>
    </div>
  );
}

export default function MovieModal() {
  const { selectedMovie: movie, setShowModal, addMsg, callAIWithSearch, setIsBotTyping, isBotTyping } = useApp();
  const poster = movie?.Poster && movie.Poster !== 'N/A' ? movie.Poster : null;
  const handleClose = useCallback(() => setShowModal(false), [setShowModal]);

  const handleAskBot = useCallback(async () => {
    handleClose();
    if (!movie?.Title) return;
    addMsg('user', `Tell me more about "${movie.Title}"`);
    setIsBotTyping(true);
    try {
      const { reply, movieResults } = await callAIWithSearch(`Tell me about "${movie.Title}" — a brief description, why it's great, and 2 similar recommendations.`);
      addMsg('bot', reply || `"${movie.Title}" is a great pick!`);
      if (movieResults?.length) addMsg('bot', { type: 'movie-strip', movies: movieResults });
    } catch {
      addMsg('bot', `Ask me about "${movie.Title}" and I'll help!`);
    } finally { setIsBotTyping(false); }
  }, [movie, handleClose, addMsg, callAIWithSearch, setIsBotTyping]);

  if (!movie) return null;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="modal-dialog-custom" role="dialog" aria-modal="true">
        <div className="modal-header-custom">
          <div className="d-flex align-items-center gap-3 min-w-0">
            {poster && <img src={poster} alt={movie.Title} className="modal-header-poster" />}
            <div className="min-w-0">
              <h5 className="fw-bold mb-0 text-truncate" style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>{movie.Title}</h5>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {[movie.Year, movie.Rated, movie.Runtime].filter(v => v && v !== 'N/A').join(' · ')}
                {movie.imdbRating && movie.imdbRating !== 'N/A' && <span style={{ marginLeft: 8 }}>⭐ {movie.imdbRating}</span>}
              </div>
              {movie.Genre && movie.Genre !== 'N/A' && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{movie.Genre}</div>}
            </div>
          </div>
          <button className="btn-icon flex-shrink-0" onClick={handleClose} aria-label="Close"><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-details-body">
          {poster && <div className="modal-details-poster-col"><img src={poster} alt={movie.Title} className="modal-details-poster" /></div>}
          <div className="modal-info-col">
            {movie.Plot && movie.Plot !== 'N/A' && <p className="modal-plot">{movie.Plot}</p>}
            <div className="details-grid">
              <DetailBox label="Director"   value={movie.Director}  />
              <DetailBox label="Actors"     value={movie.Actors}    />
              <DetailBox label="Released"   value={movie.Released}  />
              <DetailBox label="Runtime"    value={movie.Runtime}   />
              <DetailBox label="Language"   value={movie.Language}  />
              <DetailBox label="Country"    value={movie.Country}   />
              <DetailBox label="Rated"      value={movie.Rated}     />
              <DetailBox label="Box Office" value={movie.BoxOffice} />
            </div>
            <div className="d-flex flex-wrap gap-2 mt-3">
              {movie.imdbID && (
                <a href={`https://www.imdb.com/title/${movie.imdbID}/`} target="_blank" rel="noopener noreferrer" className="btn btn-warning btn-sm">
                  <i className="bi bi-box-arrow-up-right me-1" />IMDb
                </a>
              )}
              <button className="btn btn-outline-secondary btn-sm" onClick={handleAskBot} disabled={isBotTyping}>
                <i className="bi bi-stars me-1" />Ask CineBot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
