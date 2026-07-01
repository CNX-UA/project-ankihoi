'use client';

export const SocialAuth = () => {
  const loginWith = (provider: 'google' | 'github') => {
    // Ведемо на бекенд для початку OAuth процесу
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${backendUrl}/auth/${provider}`;
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '5px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    transition: 'background-color 0.2s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
      <button 
        style={{ ...buttonStyle, backgroundColor: '#4285F4', color: 'white' }} 
        onClick={() => loginWith('google')}
      >
        Увійти через Google
      </button>
      <button 
        style={{ ...buttonStyle, backgroundColor: '#333', color: 'white' }} 
        onClick={() => loginWith('github')}
      >
        Увійти через GitHub
      </button>
    </div>
  );
};
