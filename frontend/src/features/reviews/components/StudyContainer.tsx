import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useHotkeys } from 'react-hotkeys-hook';
import api from '@/api/axios';
import { useCards } from '@/features/decks/hooks/useCards';
import { FlipCard } from './FlipCard';
import { StudyCompleted } from './StudyCompleted';
import { Button } from '@/components/Button';

interface StudyContainerProps {
  deckId: string;
  deckName: string;
  onBackToDecks: () => void;
}

export function StudyContainer({ deckId, deckName, onBackToDecks }: StudyContainerProps) {
  const queryClient = useQueryClient();
  const { cards, isLoading, isError } = useCards(deckId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // 1. Filter due cards: nextReview is null/undefined or nextReview <= now
  const dueCards = cards.filter(
    (card) => !card.nextReview || new Date(card.nextReview) <= new Date()
  );

  const isCompleted = currentIndex >= dueCards.length;

  // 2. Rating submission mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ cardId, score }: { cardId: string; score: number }) => {
      const response = await api.post('/reviews', {
        cardId,
        score,
        timezoneOffset: new Date().getTimezoneOffset(),
      });
      return response.data;
    },
    onSuccess: () => {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
      // Invalidate queries so review counts refresh
      queryClient.invalidateQueries({ queryKey: ['decks', deckId, 'cards'] });
      queryClient.invalidateQueries({ queryKey: ['decks'] });
    },
  });

  // 3. Setup keyboard hotkeys scoped to active study container
  // Space to flip (only when not flipped yet)
  useHotkeys(
    'space',
    (e) => {
      e.preventDefault();
      if (!isCompleted && !isFlipped) {
        setIsFlipped(true);
      }
    },
    {
      enabled: !isCompleted && !isFlipped,
      enableOnFormTags: false,
    }
  );

  // 0-5 to rate performance (only when card is flipped and back is visible)
  useHotkeys(
    '0,1,2,3,4,5',
    (e, handler) => {
      e.preventDefault();
      const score = parseInt(handler.keys?.[0] || '0', 10);
      if (!isCompleted && isFlipped && !reviewMutation.isPending) {
        reviewMutation.mutate({ cardId: dueCards[currentIndex].id, score });
      }
    },
    {
      enabled: !isCompleted && isFlipped && !reviewMutation.isPending,
      enableOnFormTags: false,
    }
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <span style={{ color: '#9ca3af', fontSize: '16px' }}>Завантаження карток...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
        <p>Не вдалося завантажити картки колоди. Спробуйте оновити сторінку.</p>
        <Button onClick={onBackToDecks} variant="secondary" style={{ marginTop: '16px' }}>
          Назад до колод
        </Button>
      </div>
    );
  }

  if (dueCards.length === 0 || isCompleted) {
    return <StudyCompleted onBackToDecks={onBackToDecks} />;
  }

  const currentCard = dueCards[currentIndex];

  const handleRate = (score: number) => {
    if (!reviewMutation.isPending) {
      reviewMutation.mutate({ cardId: currentCard.id, score });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', margin: '40px auto 0 auto', width: '100%', maxWidth: '800px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Вчимо: {deckName}</h2>
          <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            Картка {currentIndex + 1} з {dueCards.length}
          </span>
        </div>
        <Button onClick={onBackToDecks} variant="secondary" style={{ fontWeight: 600 }}>
          Назад
        </Button>
      </div>

      {/* 3D Card flipper */}
      <FlipCard
        front={currentCard.frontText}
        back={currentCard.backText}
        isFlipped={isFlipped}
        onFlipToggle={!isFlipped ? () => setIsFlipped(true) : undefined}
      />

      {/* Controls Container */}
      <div style={{ display: 'flex', justifyContent: 'center', minHeight: '80px', marginTop: '16px' }}>
        {!isFlipped ? (
          <Button
            id="btn-show-answer"
            onClick={() => setIsFlipped(true)}
            variant="primary"
            style={{ padding: '14px 48px', fontSize: '16px', fontWeight: 600 }}
          >
            Показати відповідь
          </Button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
            <span style={{ fontSize: '14px', color: '#9ca3af' }}>Як добре ви згадали картку?</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[0, 1, 2, 3, 4, 5].map((score) => {
                let variant: 'primary' | 'secondary' | 'danger' | 'outline' = 'secondary';
                let styleOverride = {};

                if (score <= 1) {
                  // Low recall
                  styleOverride = { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' };
                } else if (score >= 4) {
                  // Perfect recall
                  styleOverride = { background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#ffffff', border: 'none' };
                }

                return (
                  <Button
                    key={score}
                    id={`btn-rate-${score}`}
                    onClick={() => handleRate(score)}
                    disabled={reviewMutation.isPending}
                    variant={variant}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      padding: 0,
                      fontWeight: 700,
                      fontSize: '16px',
                      ...styleOverride
                    }}
                  >
                    {score}
                  </Button>
                );
              })}
            </div>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Натисніть клавіші 0-5 на клавіатурі</span>
          </div>
        )}
      </div>
    </div>
  );
}
