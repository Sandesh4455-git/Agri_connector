import React, { useState } from 'react';
import { Play, X, Volume2 } from 'lucide-react';

export default function VideoPlayer({ src, title, thumbnail, duration }) {
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{
      borderRadius: 14,
      overflow: 'hidden',
      background: '#0f172a',
      position: 'relative',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
    }}>
      <style>{`
        .vp-play-btn {
          width: clamp(48px, 10vw, 64px);
          height: clamp(48px, 10vw, 64px);
          border-radius: 50%;
          background: rgba(22,163,74,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 28px rgba(22,163,74,0.5);
          transition: transform .2s, box-shadow .2s;
          cursor: pointer;
        }
        .vp-play-btn:hover {
          transform: scale(1.12);
          box-shadow: 0 12px 36px rgba(22,163,74,0.65);
        }
        .vp-close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0,0,0,0.65);
          border: none;
          border-radius: 50%;
          width: clamp(28px, 6vw, 36px);
          height: clamp(28px, 6vw, 36px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          z-index: 10;
          transition: background .2s, transform .15s;
        }
        .vp-close-btn:hover {
          background: rgba(0,0,0,0.85);
          transform: scale(1.08);
        }
        .vp-title {
          color: white;
          font-size: clamp(12px, 2.5vw, 14px);
          font-weight: 700;
          text-align: center;
          margin: 0;
          padding: 0 16px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
          max-width: 80%;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>

      {playing ? (
        <>
          <video
            src={src}
            controls
            autoPlay
            playsInline
            style={{
              width: '100%',
              maxHeight: 'min(60vw, 340px)',
              display: 'block',
              background: '#000',
              aspectRatio: '16/9',
              objectFit: 'contain',
            }}
            onEnded={() => setPlaying(false)}
          />
          <button
            className="vp-close-btn"
            onClick={() => setPlaying(false)}
            aria-label="Close video"
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <div
          onClick={() => setPlaying(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'relative',
            cursor: 'pointer',
            minHeight: 'clamp(160px, 40vw, 240px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: thumbnail ? 'transparent' : 'linear-gradient(135deg,#1e3a2f,#0f172a)',
            aspectRatio: '16/9',
            userSelect: 'none',
          }}
          role="button"
          aria-label={`Play${title ? ': ' + title : ''}`}
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPlaying(true); } }}
        >
          {thumbnail && (
            <img
              src={thumbnail}
              alt={title || 'Video thumbnail'}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: hovered ? 0.6 : 0.75,
                transition: 'opacity .25s',
                display: 'block',
              }}
            />
          )}

          {/* Dark overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: hovered ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.3)',
            transition: 'background .25s',
          }} />

          {/* Center content */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '12px 16px',
            width: '100%',
          }}>
            <div className="vp-play-btn">
              <Play
                size={Math.max(20, Math.min(28, window.innerWidth * 0.06))}
                color="white"
                style={{ marginLeft: 3 }}
              />
            </div>
            {title && <p className="vp-title">{title}</p>}
            {duration && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(11px, 2vw, 13px)' }}>
                <Volume2 size={12} />
                {duration}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}