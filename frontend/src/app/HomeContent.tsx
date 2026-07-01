'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDecks } from '@/features/decks/hooks/useDecks';
import { DeckCard } from '@/features/decks/components/DeckCard';
import { CreateDeckModal } from '@/features/decks/components/CreateDeckModal';
import { DeckDetailView } from '@/features/decks/components/DeckDetailView';
import { useDeckStore } from '@/store/useDeckStore';
import { useImportMutation } from '@/features/decks/hooks/useImportMutation';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { StudyContainer } from '@/features/reviews/components/StudyContainer';

export default function HomeContent() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { decks, isLoading: isDecksLoading, isError } = useDecks();
  const {
    activeDeck,
    setCreateDeckModalOpen,
    activeStudyDeck,
    setActiveStudyDeck,
  } = useDeckStore();

  const importMutation = useImportMutation();

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv,.html';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !user) return;
      importMutation.mutate({ file, userId: user.id });
    };
    input.click();
  };

  const showDecks = !!user && !isAuthLoading;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #111827, #070a13)',
        color: '#f3f4f6',
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Premium Glassmorphic Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(17, 24, 39, 0.6)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: 'white',
              fontSize: '18px',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
            }}
          >
            A
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>Ankihoi</span>
        </div>

        <div>
          {isAuthLoading ? (
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>Завантаження...</span>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '14px', color: '#d1d5db' }}>
                Вітаємо, <strong style={{ color: '#ffffff' }}>{user.email}</strong>!
              </span>
              <Button
                id="btn-logout"
                variant="danger"
                onClick={logout}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Вийти
              </Button>
            </div>
          ) : (
            <Link
              id="btn-login-redirect"
              href="/login"
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              Увійти
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Container style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!showDecks ? (
          <div style={{ marginTop: '80px', textAlign: 'center', maxWidth: '600px', margin: '80px auto 0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', background: 'linear-gradient(to right, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Ваша платформа для вивчення карток
            </h2>
            <p style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '32px', lineHeight: 1.6 }}>
              Створюйте власні інтелектуальні колоди карток, тренуйте пам{"'"}ять за допомогою методу інтервальних повторень та вивчайте будь-що ефективніше вже сьогодні.
            </p>
            <Link
              id="btn-hero-login"
              href="/login"
              className="btn btn-primary"
              style={{
                padding: '14px 28px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)',
              }}
            >
              Створити першу колоду
            </Link>
          </div>
        ) : activeStudyDeck ? (
          <StudyContainer
            deckId={activeStudyDeck.id}
            deckName={activeStudyDeck.title}
            onBackToDecks={() => setActiveStudyDeck(null)}
          />
        ) : activeDeck ? (
          <DeckDetailView />
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Мої колоди</h2>
                <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>Управляйте своїми навчальними матеріалами</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  id="btn-import-deck"
                  onClick={handleImportClick}
                  disabled={importMutation.isPending}
                  variant="secondary"
                  style={{ fontWeight: 600 }}
                >
                  {importMutation.isPending ? 'Імпорт...' : 'Імпортувати колоду'}
                </Button>

                <Button
                  id="btn-open-create-deck"
                  onClick={() => setCreateDeckModalOpen(true)}
                  variant="primary"
                  style={{ fontWeight: 600 }}
                >
                  + Створити колоду
                </Button>
              </div>
            </div>

            {isDecksLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    style={{
                      height: '160px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                ))}
              </div>
            ) : isError ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                <p>Не вдалося завантажити колоди. Спробуйте оновити сторінку.</p>
              </div>
            ) : decks.length === 0 ? (
              /* Beautiful Empty State Illustration */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 20px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
                  border: '1px dashed rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  textAlign: 'center',
                  marginTop: '20px',
                }}
              >
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: '#4f46e5', marginBottom: '24px', opacity: 0.8 }}
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <path d="M12 6L15 11.5H9Z" />
                  <path d="M12 12.5L9 7H15Z" />
                </svg>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Колод ще немає</h3>
                <p style={{ color: '#9ca3af', fontSize: '15px', maxWidth: '350px', marginBottom: '24px', lineHeight: 1.5 }}>
                  Створіть свою першу колоду, щоб додати навчальні картки та розпочати вивчення.
                </p>
                <Button
                  id="btn-empty-create-deck"
                  onClick={() => setCreateDeckModalOpen(true)}
                  variant="outline"
                  style={{ fontWeight: 600 }}
                >
                  + Створити першу колоду
                </Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {decks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                  />
                ))}
              </div>
            )}

            <CreateDeckModal
              userId={user.id}
            />
          </div>
        )}
        </Container>
      </main>
    </div>
  );
}
