import { SocialAuth } from '@/features/auth/components/SocialAuth';

export default function LoginPage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      gap: '20px'
    }}>
      <h1>Вхід в Ankihoi</h1>
      <p>Оберіть спосіб авторизації:</p>
      <SocialAuth />
    </div>
  );
}
