import React, { useState, useEffect } from 'react';
import { useCards } from '../hooks/useCards';
import { useDeckStore } from '@/store/useDeckStore';
import { Button } from '@/components/Button';
import { Textarea } from '@/components/Textarea';
import { Card } from '@/components/Card';

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
      <Card
        style={{
          width: '450px',
          maxWidth: '90%',
          color: '#ffffff',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          id="btn-close-card-modal"
          onClick={onClose}
          className="btn-close"
        >
          &times;
        </Button>

        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '22px', fontWeight: 600 }}>
          {isEditMode ? 'Редагувати картку' : 'Додати нову картку'}
        </h3>

        <form onSubmit={handleSubmit}>
          <Textarea
            id="input-card-front"
            label="Лицьова сторона (Запитання / Слово)"
            placeholder="Введіть слово або питання..."
            value={frontText}
            onChange={(e) => setFrontText(e.target.value)}
            rows={3}
          />

          <Textarea
            id="input-card-back"
            label="Зворотна сторона (Відповідь / Переклад)"
            placeholder="Введіть переклад або відповідь..."
            value={backText}
            onChange={(e) => setBackText(e.target.value)}
            rows={3}
            style={{ marginBottom: '20px' }}
          />

          {error && (
            <div style={{ color: '#fc8181', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button
              id="btn-cancel-card-form"
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Скасувати
            </Button>
            <Button
              id="btn-submit-card-form"
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Збереження...' : isEditMode ? 'Зберегти' : 'Додати'}
            </Button>
          </div>
        </form>
        </Card>
    </div>
  );
};
