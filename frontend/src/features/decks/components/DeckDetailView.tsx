import React from 'react';
import { useCards, Card } from '../hooks/useCards';
import { CardFormModal } from './CardFormModal';
import { useDeckStore } from '@/store/useDeckStore';

export const DeckDetailView: React.FC = () => {
  const { activeDeck: deck, setActiveDeck, openCardModal } = useDeckStore();

  if (!deck) return null;

  const { cards, isLoading, deleteCard } = useCards(deck.id);

  const handleAddCard = () => {
    openCardModal(null);
  };

  const handleEditCard = (card: Card) => {
    openCardModal(card);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (confirm('Ви впевнені, що хочете видалити цю картку?')) {
      try {
        await deleteCard(cardId);
      } catch (err) {
        alert('Не вдалося видалити картку');
      }
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Navigation / Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button
          id="btn-back-to-decks"
          onClick={() => setActiveDeck(null)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#a0aec0',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#a0aec0';
          }}
        >
          &larr; Назад до колод
        </button>
      </div>

      {/* Deck Hero Panel */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#f7fafc' }}>
            {deck.title}
          </h2>
          <p style={{ color: '#a0aec0', fontSize: '16px', marginTop: '8px', lineHeight: 1.5, maxWidth: '600px' }}>
            {deck.description}
          </p>
        </div>

        <button
          id="btn-add-card"
          onClick={handleAddCard}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          + Додати картку
        </button>
      </div>

      {/* Cards Section */}
      <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
        Картки в цій колоді ({cards.length})
      </h3>

      {isLoading ? (
        <div style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>
          Завантаження карток...
        </div>
      ) : cards.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#9ca3af', marginBottom: '16px' }}>У цій колоді ще немає жодної картки.</p>
          <button
            id="btn-empty-add-card"
            onClick={handleAddCard}
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Додати першу картку
          </button>
        </div>
      ) : (
        /* List of Cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cards.map((card) => (
            <div
              key={card.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)')}
            >
              <div style={{ display: 'flex', gap: '40px', flex: 1, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <span style={{ fontSize: '11px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Лицьова сторона
                  </span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#f7fafc', fontWeight: 500 }}>
                    {card.frontText}
                  </p>
                </div>

                <div style={{ flex: 1, minWidth: '150px' }}>
                  <span style={{ fontSize: '11px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Зворотна сторона
                  </span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#cbd5e0' }}>
                    {card.backText}
                  </p>
                </div>
              </div>

              {/* Actions Column */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  id={`btn-edit-card-${card.id}`}
                  onClick={() => handleEditCard(card)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    color: '#818cf8',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  Редагувати
                </button>
                <button
                  id={`btn-delete-card-${card.id}`}
                  onClick={() => handleDeleteCard(card.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  Видалити
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CardFormModal
        deckId={deck.id}
      />
    </div>
  );
};
