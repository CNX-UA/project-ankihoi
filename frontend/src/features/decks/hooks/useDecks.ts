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
  dueCardsCount?: number;
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
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
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

  const updateDeckMutation = useMutation({
    mutationFn: async ({ deckId, data }: { deckId: string; data: Partial<CreateDeckInput> }) => {
      const response = await api.patch(`/decks/${deckId}`, data);
      return response.data;
    },
    onSuccess: (updatedDeck) => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      queryClient.invalidateQueries({ queryKey: ['decks', updatedDeck.id] });
    },
  });

  const deleteDeckMutation = useMutation({
    mutationFn: async (deckId: string) => {
      const response = await api.delete(`/decks/${deckId}`);
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
    updateDeck: updateDeckMutation.mutateAsync,
    isUpdating: updateDeckMutation.isPending,
    deleteDeck: deleteDeckMutation.mutateAsync,
    isDeleting: deleteDeckMutation.isPending,
  };
};
