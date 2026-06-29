import React from 'react';
import { Button } from '@/components/Button';

interface StudyCompletedProps {
  onBackToDecks: () => void;
}

export function StudyCompleted({ onBackToDecks }: StudyCompletedProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '60px auto',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#818cf8',
          fontSize: '36px',
          marginBottom: '24px',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)'
        }}
      >
        🌟
      </div>
      <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
        Всі картки вивчено! 🌟
      </h3>
      <p style={{ color: '#9ca3af', fontSize: '16px', lineHeight: 1.5, marginBottom: '32px', maxWidth: '400px' }}>
        Ви виконали всі заплановані картки на сьогодні. Поверніться на головну панель колод.
      </p>
      <Button
        id="btn-back-to-decks"
        onClick={onBackToDecks}
        variant="primary"
        style={{ fontWeight: 600, padding: '12px 32px' }}
      >
        Назад до колод
      </Button>
    </div>
  );
}
