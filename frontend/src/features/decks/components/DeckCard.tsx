import React from 'react';
import { Deck } from '../hooks/useDecks';
import { useDeckStore } from '@/store/useDeckStore';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

interface DeckCardProps {
  deck: Deck;
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck }) => {
  const setActiveDeck = useDeckStore((state) => state.setActiveDeck);
  const setActiveStudyDeck = useDeckStore((state) => state.setActiveStudyDeck);
  const cardCount = deck._count?.cards ?? 0;

  return (
    <Card 
      className="deck-card"
      style={{ cursor: 'pointer' }}
      onClick={() => setActiveDeck(deck)}
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

        <Button
          id={`btn-manage-deck-${deck.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveDeck(deck);
          }}
          title="Редагувати колоду та картки"
          className="btn-icon"
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
        </Button>
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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

          {deck.dueCardsCount !== undefined && deck.dueCardsCount > 0 && (
            <span
              id={`badge-due-deck-${deck.id}`}
              style={{
                fontSize: '11px',
                color: '#63b3ed',
                backgroundColor: 'rgba(49, 130, 206, 0.15)',
                border: '1px solid rgba(49, 130, 206, 0.3)',
                padding: '3px 8px',
                borderRadius: '10px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {deck.dueCardsCount} до повторення
            </span>
          )}
        </div>
        
        <span
          id={`btn-study-deck-${deck.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveStudyDeck(deck);
          }}
          style={{
            fontSize: '13px',
            color: '#63b3ed',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'color 0.2s',
            cursor: 'pointer',
          }}
        >
          Вчити &rarr;
        </span>
      </div>
    </Card>
  );
};
