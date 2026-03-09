import React, { useState, useEffect } from 'react';
import { HarmoniaCharacter, getRandomQuote } from '../../data/characters';

interface CharacterPortraitProps {
  character: HarmoniaCharacter;
  size?: 'sm' | 'md' | 'lg';
  showQuote?: boolean;
  quoteType?: 'idle' | 'encourage' | 'taunt';
  customQuote?: string;
  showDescription?: boolean;
  animated?: boolean;
  style?: React.CSSProperties;
}

const SIZES = {
  sm: { frame: 64, emoji: '1.8rem', name: '0.7rem', glow: 6 },
  md: { frame: 100, emoji: '2.8rem', name: '0.85rem', glow: 10 },
  lg: { frame: 140, emoji: '3.8rem', name: '1rem', glow: 16 },
};

export default function CharacterPortrait({
  character,
  size = 'md',
  showQuote = false,
  quoteType = 'idle',
  customQuote,
  showDescription = false,
  animated = true,
  style,
}: CharacterPortraitProps) {
  const [quote, setQuote] = useState('');
  const [bob, setBob] = useState(false);
  const s = SIZES[size];

  useEffect(() => {
    if (showQuote) {
      setQuote(customQuote || getRandomQuote(character, quoteType));
    }
  }, [character, showQuote, quoteType, customQuote]);

  // Idle bobbing animation
  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => setBob((b) => !b), 2000);
    return () => clearInterval(interval);
  }, [animated]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: size === 'sm' ? '0.25rem' : '0.5rem',
        ...style,
      }}
    >
      {/* --- Portrait Frame --- */}
      <div
        style={{
          width: s.frame,
          height: s.frame,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${character.gradientFrom}, ${character.gradientTo})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: `0 0 ${s.glow}px ${character.color}66`,
          transform: animated && bob ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'transform 0.8s ease-in-out',
          cursor: 'default',
          flexShrink: 0,
        }}
        title={`${character.name} — ${character.title}`}
      >
        {/* Main emoji */}
        <span style={{ fontSize: s.emoji, lineHeight: 1, userSelect: 'none' }}>
          {character.emoji}
        </span>

        {/* Accent emoji badge */}
        <span
          style={{
            position: 'absolute',
            bottom: size === 'sm' ? -2 : 0,
            right: size === 'sm' ? -2 : 0,
            fontSize: size === 'sm' ? '0.65rem' : size === 'md' ? '0.9rem' : '1.1rem',
            background: 'var(--card, #fff)',
            borderRadius: '50%',
            width: size === 'sm' ? 18 : size === 'md' ? 24 : 30,
            height: size === 'sm' ? 18 : size === 'md' ? 24 : 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}
        >
          {character.accentEmoji}
        </span>

        {/* Art symbol watermark */}
        {size !== 'sm' && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: size === 'md' ? '0.7rem' : '0.9rem',
              opacity: 0.5,
              color: '#fff',
              fontWeight: 700,
            }}
          >
            {character.artSymbol}
          </span>
        )}
      </div>

      {/* --- Name + Title --- */}
      <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
        <div
          style={{
            fontSize: s.name,
            fontWeight: 700,
            color: character.color,
          }}
        >
          {character.name}
        </div>
        {size !== 'sm' && (
          <div
            style={{
              fontSize: size === 'md' ? '0.7rem' : '0.8rem',
              color: 'var(--muted, #999)',
              fontStyle: 'italic',
            }}
          >
            {character.title}
          </div>
        )}
      </div>

      {/* --- Species badge --- */}
      {size === 'lg' && (
        <div
          style={{
            fontSize: '0.7rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            background: `${character.color}18`,
            color: character.color,
            fontWeight: 500,
          }}
        >
          {character.species}
        </div>
      )}

      {/* --- Description --- */}
      {showDescription && size === 'lg' && (
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-light, #666)',
            textAlign: 'center',
            maxWidth: 280,
            lineHeight: 1.5,
            margin: '0.25rem 0 0',
          }}
        >
          {character.appearance}
        </p>
      )}

      {/* --- Speech Bubble --- */}
      {showQuote && quote && (
        <div
          style={{
            position: 'relative',
            background: `${character.color}10`,
            border: `1.5px solid ${character.color}30`,
            borderRadius: '0.75rem',
            padding: '0.5rem 0.75rem',
            fontSize: size === 'sm' ? '0.7rem' : '0.8rem',
            color: 'var(--text, #333)',
            maxWidth: size === 'sm' ? 160 : size === 'md' ? 220 : 300,
            textAlign: 'center',
            lineHeight: 1.4,
            fontStyle: 'italic',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -6,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: `6px solid ${character.color}30`,
            }}
          />
          "{quote}"
        </div>
      )}
    </div>
  );
}

// ============================================================
// Speech Bubble — standalone dialogue box with character name
// ============================================================
interface SpeechBubbleProps {
  character: HarmoniaCharacter;
  text: string;
  emotion?: string;
  style?: React.CSSProperties;
}

export function SpeechBubble({ character, text, emotion, style }: SpeechBubbleProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '56px 1fr',
        gap: '0.75rem',
        alignItems: 'start',
        ...style,
      }}
    >
      {/* Mini portrait */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${character.gradientFrom}, ${character.gradientTo})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 0 6px ${character.color}44`,
        }}
      >
        <span style={{ fontSize: '1.4rem' }}>{character.emoji}</span>
      </div>

      {/* Dialogue */}
      <div>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: character.color,
            marginBottom: '0.2rem',
          }}
        >
          {character.name}
          {emotion && (
            <span
              style={{
                fontWeight: 400,
                marginLeft: '0.4rem',
                fontStyle: 'italic',
                opacity: 0.7,
                fontSize: '0.7rem',
              }}
            >
              ({emotion})
            </span>
          )}
        </div>
        <div
          style={{
            background: `${character.color}08`,
            border: `1px solid ${character.color}20`,
            borderRadius: '0 0.75rem 0.75rem 0.75rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.88rem',
            color: 'var(--text, #333)',
            lineHeight: 1.5,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Character Card — full info card for character galleries
// ============================================================
interface CharacterCardProps {
  character: HarmoniaCharacter;
  onClick?: () => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        padding: 0,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px ${character.color}22`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
      }}
    >
      {/* Banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${character.gradientFrom}, ${character.gradientTo})`,
          padding: '1.25rem',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <span style={{ fontSize: '3rem' }}>{character.emoji}</span>
        <span
          style={{
            position: 'absolute',
            top: 8,
            right: 12,
            fontSize: '1.5rem',
            opacity: 0.6,
          }}
        >
          {character.accentEmoji}
        </span>
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.65rem',
            background: 'rgba(255,255,255,0.25)',
            padding: '0.1rem 0.5rem',
            borderRadius: '999px',
            color: '#fff',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {character.role}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1rem' }}>
        <h4
          style={{
            margin: 0,
            color: character.color,
            fontSize: '1rem',
          }}
        >
          {character.name}
        </h4>
        <div
          style={{
            fontSize: '0.75rem',
            fontStyle: 'italic',
            color: 'var(--muted, #999)',
            marginBottom: '0.5rem',
          }}
        >
          {character.title} · {character.species}
        </div>
        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-light, #666)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {character.personality}
        </p>
      </div>
    </div>
  );
}
