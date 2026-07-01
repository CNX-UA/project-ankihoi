import React, { useState, useEffect } from 'react';
import { useDecks, Deck } from '../hooks/useDecks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Card } from '@/components/Card';

interface EditDeckModalProps {
  deck: Deck;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedDeck: Deck) => void;
}

export const EditDeckModal: React.FC<EditDeckModalProps> = ({ deck, isOpen, onClose, onSuccess }) => {
  const { updateDeck, isUpdating } = useDecks();
  const [title, setTitle] = useState(deck.title);
  const [description, setDescription] = useState(deck.description);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(deck.title);
      setDescription(deck.description);
      setError(null);
    }
  }, [isOpen, deck]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Назва колоди є обов’язковою');
      return;
    }
    if (!description.trim()) {
      setError('Опис колоди є обов’язковим');
      return;
    }

    try {
      setError(null);
      const updated = await updateDeck({
        deckId: deck.id,
        data: {
          title: title.trim(),
          description: description.trim(),
        },
      });
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError('Не вдалося оновити колоду. Будь ласка, перевірте правильність введених даних і спробуйте знову.');
    }
  };

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
        zIndex: 1000,
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
          id="btn-close-edit-deck-modal"
          onClick={onClose}
          className="btn-close"
        >
          &times;
        </Button>

        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '22px', fontWeight: 600 }}>
          Редагувати колоду
        </h3>

        <form onSubmit={handleSubmit}>
          <Input
            id="input-edit-deck-title"
            label="Назва колоди"
            type="text"
            placeholder="Назва колоди"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            id="input-edit-deck-desc"
            label="Опис"
            placeholder="Короткий опис того, що містить ця колода..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ marginBottom: '20px' }}
          />

          {error && (
            <div style={{ color: '#fc8181', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button
              id="btn-cancel-edit-deck"
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Скасувати
            </Button>
            <Button
              id="btn-submit-edit-deck"
              type="submit"
              variant="primary"
              disabled={isUpdating}
            >
              {isUpdating ? 'Збереження...' : 'Зберегти зміни'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
