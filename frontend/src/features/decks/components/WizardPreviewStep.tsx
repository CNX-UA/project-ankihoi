import React, { useEffect, useState } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import api from '@/api/axios';
import { Button } from '@/components/Button';
import { useDecks } from '../hooks/useDecks';

export const WizardPreviewStep: React.FC = () => {
  const { decks } = useDecks();
  const {
    notes,
    file,
    style,
    count,
    difficulty,
    deckSelection,
    deckId,
    newDeckTitle,
    newDeckDescription,
    suggestions,
    setSuggestions,
    updateSuggestion,
    deleteSuggestion,
    addSuggestion,
  } = useWizardStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: any[] = [];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("style", style);
        formData.append("count", String(count));
        formData.append("difficulty", difficulty);
        const response = await api.post("/ai/generate-cards/multimodal", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (style === "cloze") {
          data = response.data.map((item: any) => {
            let question = item.text || "";
            if (item.clozes && item.clozes.length > 0) {
              item.clozes.forEach((cloze: string) => {
                const regex = new RegExp(
                  cloze.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
                  "gi",
                );
                question = question.replace(regex, "[...]");
              });
            }
            return {
              question,
              answer: item.clozes ? item.clozes.join(", ") : "",
            };
          });
        } else if (style === "multiple_choice") {
          data = response.data.map((item: any) => {
            const formattedOptions = item.options
              ? item.options
                  .map(
                    (opt: string, i: number) =>
                      `${String.fromCharCode(65 + i)}) ${opt}`,
                  )
                  .join("\n")
              : "";
            return {
              question: `${item.question || ""}\n\n${formattedOptions}`,
              answer: item.answer || "",
            };
          });
        } else {
          data = response.data;
        }
      } else {
        const payload: any = { notes, count, difficulty };
        if (!notes.trim()) {
          let deckTitle = newDeckTitle;
          let deckDescription = newDeckDescription;
          if (deckSelection === "existing") {
            const selectedDeck = decks.find((d: any) => d.id === deckId);
            if (selectedDeck) {
              deckTitle = selectedDeck.title;
              deckDescription = selectedDeck.description || "";
            }
          }
          payload.deckTitle = deckTitle;
          payload.deckDescription = deckDescription;
        }

        const response = await api.post("/ai/generate-cards", payload);
        data = response.data;
      }
      setSuggestions(data);
    } catch (err: any) {
      console.error("Error generating cards:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Не вдалося згенерувати картки. Будь ласка, спробуйте ще раз.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (suggestions.length === 0 && (notes.trim() || file || newDeckTitle.trim() || deckId)) {
      fetchSuggestions();
    }
  }, []);

  const handleAddCard = () => {
    addSuggestion({ question: '', answer: '' });
  };

  if (isLoading) {
    return (
      <div>
        <h4 style={{ marginTop: 0, marginBottom: '16px' }}>AI аналізує нотатки та створює картки...</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: '#1a202c',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Shimmer animation / skeleton loader */}
              <div
                style={{
                  height: '16px',
                  width: '40%',
                  background: 'linear-gradient(90deg, #2d3748 25%, #4a5568 50%, #2d3748 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite linear',
                  borderRadius: '4px',
                }}
              />
              <div
                style={{
                  height: '32px',
                  width: '100%',
                  background: 'linear-gradient(90deg, #2d3748 25%, #4a5568 50%, #2d3748 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite linear',
                  borderRadius: '4px',
                }}
              />
            </div>
          ))}
        </div>
        {/* Style tag for the keyframe animation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <h4 style={{ marginTop: 0, marginBottom: '12px', color: '#fc8181' }}>Помилка генерації</h4>
        <p style={{ color: '#a0aec0', fontSize: '14px', marginBottom: '20px' }}>{error}</p>
        <Button id="btn-retry-generation" onClick={fetchSuggestions} variant="primary">
          Спробувати знову
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h4 style={{ margin: 0 }}>Згенеровані картки ({suggestions.length})</h4>
        <Button
          id="btn-wizard-add-card"
          onClick={handleAddCard}
          variant="secondary"
          style={{ padding: '6px 12px', fontSize: '13px' }}
        >
          + Додати картку
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#a0aec0' }}>
          Не вдалося вилучити жодної картки. Спробуйте додати картку вручну.
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '45vh',
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          {suggestions.map((card, index) => (
            <div
              key={index}
              style={{
                background: '#1a202c',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                padding: '16px',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => deleteSuggestion(index)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#fc8181',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
                title="Видалити картку"
              >
                &times;
              </button>

              <div style={{ marginBottom: '12px', marginRight: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#718096',
                    marginBottom: '4px',
                    fontWeight: 600,
                  }}
                >
                  Запитання (лицьова сторона)
                </label>
                <input
                  type="text"
                  value={card.question}
                  onChange={(e) => updateSuggestion(index, { question: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#2d3748',
                    color: '#ffffff',
                    border: '1px solid #4a5568',
                    fontSize: '14px',
                  }}
                  placeholder="Введіть запитання..."
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#718096',
                    marginBottom: '4px',
                    fontWeight: 600,
                  }}
                >
                  Відповідь (зворотна сторона)
                </label>
                <textarea
                  value={card.answer}
                  onChange={(e) => updateSuggestion(index, { answer: e.target.value })}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#2d3748',
                    color: '#ffffff',
                    border: '1px solid #4a5568',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                  placeholder="Введіть відповідь..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
