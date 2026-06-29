import React, { useState, useEffect } from 'react';
import { useCards } from '../hooks/useCards';
import { useDeckStore } from '@/store/useDeckStore';

interface CardFormModalProps {
  deckId: string;
}

export const CardFormModal: React.FC<CardFormModalProps> = ({ deckId }) => {
  const { isCardModalOpen: isOpen, closeCardModal: onClose, selectedCard: cardToEdit } = useDeckStore();
  const { createCard, updateCard, isCreating, isUpdating } = useCards(deckId);
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!cardToEdit;

  useEffect(() => {
    if (cardToEdit) {
      setFrontText(cardToEdit.frontText);
      setBackText(cardToEdit.backText);
    } else {
      setFrontText('');
      setBackText('');
    }
  }, [cardToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontText.trim()) {
      setError('Лицьова сторона карти не може бути порожньою');
      return;
    }
    if (!backText.trim()) {
      setError('Зворотна сторона карти не може бути порожньою');
      return;
    }

    try {
      setError(null);
      if (isEditMode && cardToEdit) {
        await updateCard({
          cardId: cardToEdit.id,
          data: {
            frontText: frontText.trim(),
            backText: backText.trim(),
          },
        });
      } else {
        await createCard({
          frontText: frontText.trim(),
          backText: backText.trim(),
        });
      }
      setFrontText('');
      setBackText('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Не вдалося зберегти картку');
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 10, 15, 0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100,
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '30px',
          width: '450px',
          maxWidth: '90%',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          color: '#ffffff',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="btn-close-card-modal"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            color: '#a0aec0',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px',
            lineHeight: 1,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#a0aec0')}
        >
          &times;
        </button>

        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '22px', fontWeight: 600 }}>
          {isEditMode ? 'Редагувати картку' : 'Додати нову картку'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="input-card-front"
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#cbd5e0' }}
            >
              Лицьова сторона (Запитання / Слово)
            </label>
            <textarea
              id="input-card-front"
              placeholder="Введіть слово або питання..."
              value={frontText}
              onChange={(e) => setFrontText(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4f46e5';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.4)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="input-card-back"
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#cbd5e0' }}
            >
              Зворотна сторона (Відповідь / Переклад)
            </label>
            <textarea
              id="input-card-back"
              placeholder="Введіть переклад або відповідь..."
              value={backText}
              onChange={(e) => setBackText(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4f46e5';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.4)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#fc8181', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              id="btn-cancel-card-form"
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'transparent',
                color: '#a0aec0',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'background-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#a0aec0';
              }}
            >
              Скасувати
            </button>
            <button
              id="btn-submit-card-form"
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                transition: 'transform 0.1s, opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {isSubmitting ? 'Збереження...' : isEditMode ? 'Зберегти' : 'Додати'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
