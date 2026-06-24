import { create } from 'zustand';
import { Deck } from '@/features/decks/hooks/useDecks';
import { Card } from '@/features/decks/hooks/useCards';

interface DeckUIState {
  // Active Deck View
  activeDeck: Deck | null;
  setActiveDeck: (deck: Deck | null) => void;

  // Create Deck Modal
  isCreateDeckModalOpen: boolean;
  setCreateDeckModalOpen: (isOpen: boolean) => void;

  // Card Modal (Create / Edit)
  isCardModalOpen: boolean;
  selectedCard: Card | null;
  openCardModal: (card?: Card | null) => void;
  closeCardModal: () => void;
}

export const useDeckStore = create<DeckUIState>((set) => ({
  activeDeck: null,
  setActiveDeck: (deck) => set({ activeDeck: deck }),

  isCreateDeckModalOpen: false,
  setCreateDeckModalOpen: (isOpen) => set({ isCreateDeckModalOpen: isOpen }),

  isCardModalOpen: false,
  selectedCard: null,
  openCardModal: (card = null) => set({ isCardModalOpen: true, selectedCard: card }),
  closeCardModal: () => set({ isCardModalOpen: false, selectedCard: null }),
}));
