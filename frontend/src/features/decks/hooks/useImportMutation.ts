import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import {
  parseJSONDeck,
  parseCSVDeck,
  parseHTMLDeck,
  ImportedDeck,
} from "../utils/importExport";

export interface ImportDeckInput {
  file: File;
  userId: string;
}

export const useImportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, userId }: ImportDeckInput) => {
      const text = await file.text();
      const extension = file.name.split(".").pop()?.toLowerCase();

      let imported: ImportedDeck;
      if (extension === "json") {
        imported = parseJSONDeck(text);
      } else if (extension === "csv") {
        imported = parseCSVDeck(text, file.name);
      } else if (extension === "html") {
        imported = parseHTMLDeck(text);
      } else {
        throw new Error("Непідтримуваний формат файлу");
      }

      // 1. Create the deck
      const deckResponse = await api.post("/decks", {
        title: imported.title,
        description: imported.description,
        userId,
      });
      const newDeck = deckResponse.data;

      // 2. Create the cards
      const cardPromises = imported.cards.map((card) =>
        api.post(`/decks/${newDeck.id}/cards`, {
          frontText: card.frontText,
          backText: card.backText,
        }),
      );
      await Promise.all(cardPromises);

      return { deck: newDeck, cardCount: imported.cards.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      queryClient.invalidateQueries({ queryKey: ["cards", data.deck.id] });

      alert(
        `Колоду "${data.deck.title}" з ${data.cardCount} картками успішно імпортовано!`,
      );
    },
    onError: (err: unknown) => {
      console.error(err);
      let errMsg = "Невідома помилка";
      if (err instanceof Error) {
        errMsg = err.message;
      } else if (err && typeof err === "object") {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          errMsg = axiosError.response.data.message;
        }
      }
      alert(`Помилка імпорту: ${errMsg}`);
    },
  });
};
