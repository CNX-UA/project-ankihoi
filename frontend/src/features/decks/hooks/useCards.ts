import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';

export interface Card {
  id: string;
  frontText: string;
  backText: string;
  deckId: string;
  easinessFactor: number;
  repetitions: number;
  intervalDays: number;
  nextReview: string;
}

export interface CreateCardInput {
  frontText: string;
  backText: string;
}

export interface UpdateCardInput {
  frontText?: string;
  backText?: string;
}

export const useCards = (deckId: string) => {
  const queryClient = useQueryClient();

  const {
    data: cards = [],
    isLoading,
    isError,
    error,
  } = useQuery<Card[]>({
    queryKey: ['decks', deckId, 'cards'],
    queryFn: async () => {
      if (!deckId) return [];
      const response = await api.get(`/decks/${deckId}/cards`);
      return response.data;
    },
    enabled: !!deckId && typeof window !== 'undefined' && !!localStorage.getItem('token'),
  });

  const createCardMutation = useMutation({
    mutationFn: async (newCard: CreateCardInput) => {
      const response = await api.post(`/decks/${deckId}/cards`, newCard);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks', deckId, 'cards'] });
      queryClient.invalidateQueries({ queryKey: ['decks'] }); // Invalidate decks count
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: async ({ cardId, data }: { cardId: string; data: UpdateCardInput }) => {
      const response = await api.patch(`/decks/${deckId}/cards/${cardId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks', deckId, 'cards'] });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      const response = await api.delete(`/decks/${deckId}/cards/${cardId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks', deckId, 'cards'] });
      queryClient.invalidateQueries({ queryKey: ['decks'] }); // Invalidate decks count
    },
  });

  return {
    cards,
    isLoading,
    isError,
    error,
    createCard: createCardMutation.mutateAsync,
    isCreating: createCardMutation.isPending,
    updateCard: updateCardMutation.mutateAsync,
    isUpdating: updateCardMutation.isPending,
    deleteCard: deleteCardMutation.mutateAsync,
    isDeleting: deleteCardMutation.isPending,
  };
};
