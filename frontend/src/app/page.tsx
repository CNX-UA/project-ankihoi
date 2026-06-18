'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function Home() {
  const { user, isLoading, logout } = useAuth();

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Ankihoi</h1>
        <div>
          {isLoading ? (
            <span>Завантаження...</span>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span>Вітаємо, <strong>{user.email}</strong>!</span>
              <button 
                onClick={logout}
                style={{ 
                  padding: '5px 10px', 
                  cursor: 'pointer',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Вийти
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#0070f3', 
                color: 'white', 
                textDecoration: 'none',
                borderRadius: '5px'
              }}
            >
              Увійти
            </Link>
          )}
        </div>
      </header>

      <main style={{ marginTop: '50px', textAlign: 'center' }}>
        <h2>Ваша платформа для вивчення карток</h2>
        <p>Почніть вчитися ефективніше вже сьогодні.</p>
      </main>
    </div>
  );
}
