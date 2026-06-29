import React from 'react';
import { Deck } from '../hooks/useDecks';
import { useDeckStore } from '@/store/useDeckStore';

interface DeckCardProps {
  deck: Deck;
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck }) => {
  const setActiveDeck = useDeckStore((state) => state.setActiveDeck);
  const cardCount = deck._count?.cards ?? 0;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '24px',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '160px',
        boxSizing: 'border-box',
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.4)';
        e.currentTarget.style.boxShadow = '0 12px 24px -10px rgba(79, 70, 229, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, marginRight: '12px', overflow: 'hidden' }}>
          <h4
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: '#f7fafc',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {deck.title}
          </h4>
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: '14px',
              color: '#a0aec0',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {deck.description}
          </p>
        </div>

        <button
          id={`btn-manage-deck-${deck.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveDeck(deck);
          }}
          title="Редагувати колоду та картки"
          style={{
            background: 'none',
            border: 'none',
            color: '#a0aec0',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s, background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#a0aec0';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '12px',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            color: '#cbd5e0',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            padding: '4px 10px',
            borderRadius: '12px',
            fontWeight: 500,
          }}
        >
          {cardCount} {cardCount === 1 ? 'картка' : cardCount > 1 && cardCount < 5 ? 'картки' : 'карток'}
        </span>
        
        <span
          style={{
            fontSize: '13px',
            color: '#63b3ed',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'color 0.2s',
          }}
        >
          Вчити &rarr;
        </span>
      </div>
    </div>
  );
};
