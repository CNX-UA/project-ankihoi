import React from 'react';

interface FlipCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlipToggle?: () => void;
}

export function FlipCard({ front, back, isFlipped, onFlipToggle }: FlipCardProps) {
  return (
    <div 
      className="card-perspective" 
      style={{ 
        width: '100%', 
        maxWidth: '600px', 
        height: '350px', 
        cursor: onFlipToggle ? 'pointer' : 'default',
        margin: '0 auto'
      }}
      onClick={onFlipToggle}
    >
      <div className={`card-flipper ${isFlipped ? 'card-flipped' : ''}`}>
        {/* Front Side */}
        <div 
          className="card card-face"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            opacity: isFlipped ? 0 : 1,
            transition: 'opacity 0.2s ease-out, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: isFlipped ? 'none' : 'auto',
          }}
        >
          <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '20px' }}>
            Питання
          </div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#ffffff', lineHeight: '1.2' }}>
            {front}
          </div>
          {onFlipToggle && (
            <div style={{ fontSize: '14px', color: '#6366f1', marginTop: '4px', opacity: 0.8, position: 'absolute', bottom: '24px' }}>
              Клацніть або натисніть Space, щоб перевернути
            </div>
          )}
        </div>

        {/* Back Side */}
        <div 
          className="card card-face card-face-back"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            opacity: isFlipped ? 1 : 0,
            transition: 'opacity 0.2s ease-out, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: isFlipped ? 'auto' : 'none',
          }}
        >
          <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '20px' }}>
            Відповідь
          </div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#ffffff', lineHeight: '1.2' }}>
            {back}
          </div>
        </div>
      </div>
    </div>
  );
}
