import React, { useState } from 'react';
import { useDecks } from '../hooks/useDecks';
import { useDeckStore } from '@/store/useDeckStore';

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
          id="btn-close-deck-modal"
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
          Створити нову колоду
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="input-deck-title"
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#cbd5e0' }}
            >
              Назва колоди
            </label>
            <input
              id="input-deck-title"
              type="text"
              placeholder="Наприклад: Англійська для початківців"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              htmlFor="input-deck-desc"
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#cbd5e0' }}
            >
              Опис
            </label>
            <textarea
              id="input-deck-desc"
              placeholder="Короткий опис того, що містить ця колода..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
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
              id="btn-cancel-create-deck"
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
              id="btn-submit-create-deck"
              type="submit"
              disabled={isCreating}
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
              {isCreating ? 'Створення...' : 'Створити'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
