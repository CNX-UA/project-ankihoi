import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { useAuthStore } from '@/store/useAuthStore';

export const useAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const logoutStore = useAuthStore((state) => state.logout);

  // Отримання профілю поточного юзера
  const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me');
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user data');
      }
    },
    // Вмикаємо запит тільки якщо є токен
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
  });

  const logout = () => {
    try {
      logoutStore();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user,
    isLoading: isUserLoading,
    isError: !!userError,
    error: userError,
    logout,
  };
};

