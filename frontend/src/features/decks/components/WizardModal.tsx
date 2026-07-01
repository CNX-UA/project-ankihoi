import React, { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWizardStore } from "@/store/useWizardStore";
import { useDeckStore } from "@/store/useDeckStore";
import api from "@/api/axios";
import { useDecks } from "../hooks/useDecks";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Card } from "@/components/Card";
import { WizardPreviewStep } from "./WizardPreviewStep";

interface WizardModalProps {
  userId: string;
}

export const WizardModal: React.FC<WizardModalProps> = ({ userId }) => {
  const {
    isOpen,
    step,
    deckSelection,
    deckId,
    newDeckTitle,
    newDeckDescription,
    notes,
    suggestions,
    style,
    file,
    count,
    difficulty,
    closeWizard,
    setStep,
    setDeckSelection,
    setInputs,
    setCount,
    setDifficulty,
    reset,
  } = useWizardStore();

  const { decks } = useDecks();
  const queryClient = useQueryClient();
  const { setActiveDeck } = useDeckStore();

  const saveMutation = useMutation({
    mutationFn: async () => {
      const targetId = deckSelection === "new" ? "new" : deckId;
      const payload = {
        newDeckTitle,
        newDeckDescription,
        cards: suggestions,
        difficulty,
      };

      const response = await api.post(
        `/decks/${targetId}/cards/batch`,
        payload,
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setActiveDeck(data);
      reset();
      closeWizard();
      alert("Картки успішно збережено!");
    },
    onError: (err: any) => {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Не вдалося зберегти картки",
      );
    },
  });

  const handleClose = () => {
    if (notes.trim() || suggestions.length > 0) {
      const confirmClose = window.confirm(
        "Ви впевнені, що хочете закрити майстер створення? Всі незбережені зміни буде втрачено.",
      );
      if (!confirmClose) return;
    }
    reset();
    closeWizard();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, notes, suggestions]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      if (deckSelection === "existing") {
        if (!deckId) {
          alert("Будь ласка, оберіть колоду");
          return;
        }
      } else {
        if (!newDeckTitle.trim()) {
          alert("Будь ласка, введіть назву нової колоди");
          return;
        }
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(10, 10, 15, 0.75)",
        backdropFilter: "blur(12px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        animation: "fadeIn 0.25s ease-out",
      }}
      onClick={handleClose}
    >
      <Card
        style={{
          width: "600px",
          maxWidth: "95%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          color: "#ffffff",
          position: "relative",
          overflow: "hidden",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "22px", fontWeight: 600 }}>
            Майстер AI-Генерації Карток
          </h3>
          <Button
            id="btn-close-wizard"
            onClick={handleClose}
            className="btn-close"
            style={{
              fontSize: "24px",
              background: "none",
              border: "none",
              color: "#a0aec0",
              cursor: "pointer",
            }}
          >
            &times;
          </Button>
        </div>

        {/* Steps Progress Indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "24px",
            position: "relative",
          }}
        >
          {[
            { num: 1, label: "Колода" },
            { num: 2, label: "Нотатки" },
            { num: 3, label: "Медіа" },
            { num: 4, label: "Генерація" },
          ].map((s) => (
            <div
              key={s.num}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: step >= s.num ? "#4f46e5" : "#2d3748",
                  color: "#ffffff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: 600,
                  fontSize: "14px",
                  marginBottom: "8px",
                  border: step === s.num ? "2px solid #818cf8" : "none",
                }}
              >
                {s.num}
              </div>
              <span
                style={{
                  fontSize: "12px",
                  color: step >= s.num ? "#ffffff" : "#718096",
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
          {/* Progress bar line */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "10%",
              right: "10%",
              height: "2px",
              backgroundColor: "#2d3748",
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "10%",
              width: `${((step - 1) / 3) * 80}%`,
              height: "2px",
              backgroundColor: "#4f46e5",
              zIndex: 1,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Body (Step content scrollable) */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            marginBottom: "20px",
            paddingRight: "4px",
          }}
        >
          {step === 1 && (
            <div>
              <h4 style={{ marginTop: 0, marginBottom: "16px" }}>
                Виберіть колоду для збереження
              </h4>
              <div
                style={{ display: "flex", gap: "16px", marginBottom: "20px" }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="deckSelection"
                    checked={deckSelection === "existing"}
                    onChange={() => setDeckSelection("existing")}
                  />
                  Існуюча колода
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="deckSelection"
                    checked={deckSelection === "new"}
                    onChange={() => setDeckSelection("new")}
                  />
                  Створити нову колоду
                </label>
              </div>

              {deckSelection === "existing" ? (
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      color: "#a0aec0",
                    }}
                  >
                    Виберіть колоду
                  </label>
                  <select
                    value={deckId}
                    onChange={(e) => setInputs({ deckId: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      backgroundColor: "#1a202c",
                      color: "#ffffff",
                      border: "1px solid #4a5568",
                      marginBottom: "16px",
                    }}
                  >
                    <option value="">-- Виберіть колоду --</option>
                    {decks.map((deck) => (
                      <option key={deck.id} value={deck.id}>
                        {deck.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <Input
                    id="wizard-deck-title"
                    label="Назва нової колоди"
                    placeholder="Наприклад: Нерегулярні дієслова"
                    value={newDeckTitle}
                    onChange={(e) =>
                      setInputs({ newDeckTitle: e.target.value })
                    }
                  />
                  <Textarea
                    id="wizard-deck-desc"
                    label="Опис колоди"
                    placeholder="Про що ця колода..."
                    value={newDeckDescription}
                    onChange={(e) =>
                      setInputs({ newDeckDescription: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h4 style={{ marginTop: 0, marginBottom: "16px" }}>
                Вставте текст ваших нотаток
              </h4>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#a0aec0",
                  }}
                >
                  Стиль генерації карток
                </label>
                <select
                  value={style}
                  onChange={(e) => setInputs({ style: e.target.value as any })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    backgroundColor: "#1a202c",
                    color: "#ffffff",
                    border: "1px solid #4a5568",
                    fontSize: "14px",
                  }}
                >
                  <option value="q_a">Запитання / Відповідь</option>
                  <option value="cloze">Заповнення пропусків (Cloze)</option>
                  <option value="multiple_choice">Тести (Multiple Choice)</option>
                </select>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#a0aec0",
                  }}
                >
                  Складність генерації карток
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { val: "light", label: "Легкий (Light)" },
                    { val: "medium", label: "Середній (Medium)" },
                    { val: "hard", label: "Складний (Hard)" },
                    { val: "ultra", label: "Екстра (Ultra)" },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setDifficulty(item.val as any)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "6px",
                        backgroundColor: difficulty === item.val ? "#4f46e5" : "#2d3748",
                        color: "#ffffff",
                        border: difficulty === item.val ? "1px solid #818cf8" : "1px solid #4a5568",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: difficulty === item.val ? 600 : 400,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#a0aec0",
                  }}
                >
                  Кількість карток для генерації
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setCount(9)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      backgroundColor: count === 9 ? "#4f46e5" : "#2d3748",
                      color: "#ffffff",
                      border: count === 9 ? "1px solid #818cf8" : "1px solid #4a5568",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: count === 9 ? 600 : 400,
                    }}
                  >
                    9 карток
                  </button>
                  <button
                    type="button"
                    onClick={() => setCount(12)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      backgroundColor: count === 12 ? "#4f46e5" : "#2d3748",
                      color: "#ffffff",
                      border: count === 12 ? "1px solid #818cf8" : "1px solid #4a5568",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: count === 12 ? 600 : 400,
                    }}
                  >
                    12 карток
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
                    <span style={{ fontSize: "14px", color: "#a0aec0" }}>Інша кількість:</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={count}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setCount(val);
                        }
                      }}
                      style={{
                        width: "60px",
                        padding: "8px",
                        borderRadius: "6px",
                        backgroundColor: "#1a202c",
                        color: "#ffffff",
                        border: (count !== 9 && count !== 12) ? "1px solid #818cf8" : "1px solid #4a5568",
                        fontSize: "14px",
                        textAlign: "center",
                      }}
                    />
                  </div>
                </div>
              </div>
              <Textarea
                id="wizard-notes"
                label="Ваші нотатки"
                placeholder="Вставте сюди текст лекції, параграф з книги або будь-які сирі нотатки..."
                value={notes}
                onChange={(e) => setInputs({ notes: e.target.value })}
                rows={6}
              />
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <h4 style={{ marginTop: 0, marginBottom: "16px" }}>
                Завантаження документів
              </h4>
              <div
                style={{
                  border: "2px dashed #4a5568",
                  borderRadius: "8px",
                  padding: "30px 20px",
                  backgroundColor: "#1a202c",
                  marginBottom: "16px",
                  cursor: "pointer",
                  position: "relative",
                }}
                onClick={() => document.getElementById("file-upload-input")?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setInputs({ file: e.dataTransfer.files[0] });
                  }
                }}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.md"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setInputs({ file: e.target.files[0] });
                    }
                  }}
                />
                {file ? (
                  <div>
                    <div style={{ fontSize: "36px", marginBottom: "12px" }}>📄</div>
                    <p style={{ margin: "0 0 4px 0", fontWeight: 600, color: "#10b981" }}>
                      {file.name}
                    </p>
                    <p style={{ margin: 0, color: "#718096", fontSize: "12px" }}>
                      {(file.size / 1024).toFixed(1)} KB • {file.type || "unknown type"}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "36px", marginBottom: "12px" }}>📁</div>
                    <p style={{ margin: "0 0 8px 0", color: "#a0aec0", fontSize: "14px" }}>
                      Перетягніть файл сюди або натисніть для вибору
                    </p>
                    <p style={{ margin: 0, color: "#718096", fontSize: "12px" }}>
                      Підтримуються PDF, зображення (JPG, PNG) та Markdown
                    </p>
                  </div>
                )}
              </div>
              {file && (
                <Button
                  id="btn-clear-file"
                  variant="secondary"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setInputs({ file: null });
                  }}
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  Видалити файл
                </Button>
              )}
            </div>
          )}

          {step === 4 && <WizardPreviewStep />}
        </div>

        {/* Footer buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #2d3748",
            paddingTop: "16px",
          }}
        >
          <Button
            id="wizard-back"
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={step === 1 || saveMutation.isPending}
            style={{ visibility: step === 1 ? "hidden" : "visible" }}
          >
            Назад
          </Button>

          {step < 4 ? (
            <Button
              id="wizard-next"
              type="button"
              variant="primary"
              onClick={handleNext}
            >
              Далі
            </Button>
          ) : (
            <Button
              id="wizard-save"
              type="button"
              variant="primary"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || suggestions.length === 0}
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
            >
              {saveMutation.isPending ? "Збереження..." : "Зберегти"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
