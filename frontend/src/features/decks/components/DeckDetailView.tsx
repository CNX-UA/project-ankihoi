import React, { useState } from "react";
import { useCards, Card as CardType } from "../hooks/useCards";
import { CardFormModal } from "./CardFormModal";
import { useDeckStore } from "@/store/useDeckStore";
import { exportToJSON, exportToCSV, exportToHTML } from "../utils/importExport";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useDecks } from "../hooks/useDecks";
import { EditDeckModal } from "./EditDeckModal";

export const DeckDetailView: React.FC = () => {
  const { activeDeck: deck, setActiveDeck, openCardModal, setActiveStudyDeck } = useDeckStore();
  const { cards, isLoading, deleteCard } = useCards(deck?.id || "");
  const { deleteDeck } = useDecks();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!deck) return null;

  const handleAddCard = () => {
    openCardModal(null);
  };

  const handleEditCard = (card: CardType) => {
    openCardModal(card);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (confirm("Ви впевнені, що хочете видалити цю картку?")) {
      try {
        await deleteCard(cardId);
      } catch {
        alert("Не вдалося видалити картку");
      }
    }
  };

  const handleDeleteDeck = async () => {
    const message = `Ви впевнені, що хочете видалити колоду "${deck.title}" та всі її картки? Цю дію неможливо скасувати!`;
    if (confirm(message)) {
      try {
        await deleteDeck(deck.id);
        setActiveDeck(null);
      } catch {
        alert("Не вдалося видалити колоду");
      }
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      {/* Navigation / Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <Button
          id="btn-back-to-decks"
          onClick={() => setActiveDeck(null)}
          variant="secondary"
          style={{ padding: "8px 16px", fontSize: "14px" }}
        >
          &larr; Назад до колод
        </Button>
      </div>

      {/* Deck Hero Panel */}
      <Card
        style={{
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 700,
              margin: 0,
              color: "#f7fafc",
            }}
          >
            {deck.title}
          </h2>
          <p
            style={{
              color: "#a0aec0",
              fontSize: "16px",
              marginTop: "8px",
              lineHeight: 1.5,
              maxWidth: "600px",
            }}
          >
            {deck.description}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "6px",
              background: "rgba(255, 255, 255, 0.03)",
              padding: "4px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "#a0aec0",
                alignSelf: "center",
                padding: "0 8px",
              }}
            >
              Експорт:
            </span>
            <Button
              id="btn-export-json"
              onClick={() => exportToJSON(deck.title, deck.description, cards)}
              variant="secondary"
              style={{ padding: "6px 12px", fontSize: "12px", border: "none" }}
            >
              JSON
            </Button>
            <Button
              id="btn-export-csv"
              onClick={() => exportToCSV(deck.title, cards)}
              variant="secondary"
              style={{ padding: "6px 12px", fontSize: "12px", border: "none" }}
            >
              CSV
            </Button>
            <Button
              id="btn-export-html"
              onClick={() => exportToHTML(deck.title, deck.description, cards)}
              variant="secondary"
              style={{ padding: "6px 12px", fontSize: "12px", border: "none" }}
            >
              HTML
            </Button>
          </div>

          <Button
            id="btn-study-deck-details"
            onClick={() => setActiveStudyDeck(deck)}
            variant="outline"
            style={{ padding: "12px 24px", fontSize: "15px", fontWeight: 600 }}
          >
            Вчити колоду
          </Button>

          <Button
            id="btn-edit-deck-details"
            onClick={() => setIsEditModalOpen(true)}
            variant="outline"
            style={{ padding: "12px 24px", fontSize: "15px", fontWeight: 600 }}
          >
            Редагувати колоду
          </Button>

          <Button
            id="btn-delete-deck-details"
            onClick={handleDeleteDeck}
            variant="danger"
            style={{ padding: "12px 24px", fontSize: "15px", fontWeight: 600 }}
          >
            Видалити колоду
          </Button>

          <Button
            id="btn-add-card"
            onClick={handleAddCard}
            variant="primary"
            style={{ padding: "12px 24px", fontSize: "15px", fontWeight: 600 }}
          >
            + Додати картку
          </Button>
        </div>
      </Card>

      {/* Cards Section */}
      <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "20px" }}>
        Картки в цій колоді ({cards.length})
      </h3>

      {isLoading ? (
        <div style={{ color: "#9ca3af", textAlign: "center", padding: "40px" }}>
          Завантаження карток...
        </div>
      ) : cards.length === 0 ? (
        <Card
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px dashed rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "none",
          }}
        >
          <p style={{ color: "#9ca3af", marginBottom: "16px" }}>
            У цій колоді ще немає жодної картки.
          </p>
          <Button
            id="btn-empty-add-card"
            onClick={handleAddCard}
            variant="outline"
          >
            Додати першу картку
          </Button>
        </Card>
      ) : (
        /* List of Cards */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {cards.map((card) => (
            <Card key={card.id} className="card-row">
              <div
                style={{
                  display: "flex",
                  gap: "40px",
                  flex: 1,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#718096",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Лицьова сторона
                  </span>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "16px",
                      color: "#f7fafc",
                      fontWeight: 500,
                    }}
                  >
                    {card.frontText}
                  </p>
                </div>

                <div style={{ flex: 1, minWidth: "150px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#718096",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Зворотна сторона
                  </span>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "16px",
                      color: "#cbd5e0",
                    }}
                  >
                    {card.backText}
                  </p>
                </div>
              </div>

              {/* Actions Column */}
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  id={`btn-edit-card-${card.id}`}
                  onClick={() => handleEditCard(card)}
                  variant="outline"
                  style={{ padding: "8px 12px", fontSize: "13px" }}
                >
                  Редагувати
                </Button>
                <Button
                  id={`btn-delete-card-${card.id}`}
                  onClick={() => handleDeleteCard(card.id)}
                  variant="danger"
                  style={{ padding: "8px 12px", fontSize: "13px" }}
                >
                  Видалити
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CardFormModal deckId={deck.id} />
      <EditDeckModal
        deck={deck}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updatedDeck) => {
          setActiveDeck(updatedDeck);
        }}
      />
    </div>
  );
};
