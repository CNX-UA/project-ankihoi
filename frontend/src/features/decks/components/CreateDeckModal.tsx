import React, { useState } from 'react';
import { useDecks } from '../hooks/useDecks';
import { useDeckStore } from '@/store/useDeckStore';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Card } from '@/components/Card';

interface CreateDeckModalProps {
  userId: string;
}

export const CreateDeckModal: React.FC<CreateDeckModalProps> = ({ userId }) => {
  const { isCreateDeckModalOpen: isOpen, setCreateDeckModalOpen, setActiveDeck } = useDeckStore();
  const onClose = () => setCreateDeckModalOpen(false);
  const { createDeck, isCreating } = useDecks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      const newDeck = await createDeck({
        title: title.trim(),
        description: description.trim(),
        userId,
      });
      setTitle('');
      setDescription('');
      onClose();
      setActiveDeck(newDeck);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Не вдалося створити колоду');
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
          id="btn-close-deck-modal"
          onClick={onClose}
          className="btn-close"
        >
          &times;
        </Button>

        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '22px', fontWeight: 600 }}>
          Створити нову колоду
        </h3>

        <form onSubmit={handleSubmit}>
          <Input
            id="input-deck-title"
            label="Назва колоди"
            type="text"
            placeholder="Наприклад: Англійська для початківців"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            id="input-deck-desc"
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
              id="btn-cancel-create-deck"
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Скасувати
            </Button>
            <Button
              id="btn-submit-create-deck"
              type="submit"
              variant="primary"
              disabled={isCreating}
            >
              {isCreating ? 'Створення...' : 'Створити'}
            </Button>
          </div>
        </form>
        </Card>
    </div>
  );
};
