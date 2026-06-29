import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';

export interface Deck {
  id: string;
  title: string;
  description: string;
  userId: string;
  _count?: {
    cards: number;
  };
}

export interface CreateDeckInput {
  title: string;
  description: string;
  userId: string;
}

export const useDecks = () => {
  const queryClient = useQueryClient();

  const {
    data: decks = [],
    isLoading,
    isError,
    error,
  } = useQuery<Deck[]>({
    queryKey: ['decks'],
    queryFn: async () => {
      const response = await api.get('/decks');
      return response.data;
    },
  });

  const createDeckMutation = useMutation({
    mutationFn: async (newDeck: CreateDeckInput) => {
      const response = await api.post('/decks', newDeck);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
    },
  });

  return {
    decks,
    isLoading,
    isError,
    error,
    createDeck: createDeckMutation.mutateAsync,
    isCreating: createDeckMutation.isPending,
    createError: createDeckMutation.error,
  };
};
