'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const HomeContent = dynamic(() => import('./HomeContent'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #111827, #070a13)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <span style={{ color: '#9ca3af', fontSize: '16px' }}>Завантаження...</span>
    </div>
  ),
});

export default function Home() {
  return <HomeContent />;
}
