import { create } from "zustand";

export interface WizardCard {
  question: string;
  answer: string;
}

interface WizardState {
  isOpen: boolean;
  step: number;
  deckSelection: "existing" | "new";
  deckId: string;
  newDeckTitle: string;
  newDeckDescription: string;
  notes: string;
  suggestions: WizardCard[];
  style: "q_a" | "cloze" | "multiple_choice";
  file: File | null;
  count: number;
  difficulty: "light" | "medium" | "hard" | "ultra";

  // Actions
  openWizard: () => void;
  closeWizard: () => void;
  setStep: (step: number) => void;
  setDeckSelection: (selection: "existing" | "new") => void;
  setInputs: (
    inputs: Partial<
      Pick<
        WizardState,
        | "deckId"
        | "newDeckTitle"
        | "newDeckDescription"
        | "notes"
        | "style"
        | "file"
        | "count"
        | "difficulty"
      >
    >,
  ) => void;
  setCount: (count: number) => void;
  setDifficulty: (difficulty: "light" | "medium" | "hard" | "ultra") => void;
  setSuggestions: (suggestions: WizardCard[]) => void;
  updateSuggestion: (index: number, updatedCard: Partial<WizardCard>) => void;
  deleteSuggestion: (index: number) => void;
  addSuggestion: (card: WizardCard) => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  step: 1,
  deckSelection: "existing" as const,
  deckId: "",
  newDeckTitle: "",
  newDeckDescription: "",
  notes: "",
  suggestions: [] as WizardCard[],
  style: "q_a" as const,
  file: null,
  count: 9,
  difficulty: "medium" as const,
};

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,

  openWizard: () => set({ isOpen: true }),
  closeWizard: () => set({ isOpen: false }),
  setStep: (step) => set({ step }),
  setDeckSelection: (deckSelection) => set({ deckSelection }),

  setInputs: (inputs) => set((state) => ({ ...state, ...inputs })),

  setCount: (count) => set({ count }),
  setDifficulty: (difficulty) => set({ difficulty }),

  setSuggestions: (suggestions) => set({ suggestions }),

  updateSuggestion: (index, updatedCard) =>
    set((state) => {
      const updated = [...state.suggestions];
      updated[index] = { ...updated[index], ...updatedCard };
      return { suggestions: updated };
    }),

  deleteSuggestion: (index) =>
    set((state) => ({
      suggestions: state.suggestions.filter((_, i) => i !== index),
    })),

  addSuggestion: (card) =>
    set((state) => ({
      suggestions: [...state.suggestions, card],
    })),

  reset: () => set(initialState),
}));
