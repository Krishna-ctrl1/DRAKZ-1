// src/components/deepthi/CardsCarousel.jsx
import React, { useEffect, useState } from "react";
import { getCards, addCard, deleteCard } from "./api/getCards";
import "../../styles/deepthi/cardsCarousel.css";

export default function CardsCarousel() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    holderName: "",
    type: "credit",
    brand: "VISA",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    colorTheme: "#6C5CE7",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load cards on mount
  useEffect(() => {
    console.log("[CardsCarousel] Component mounted");
    fetchCards();
  }, []);

  async function fetchCards() {
    try {
      setLoading(true);
      console.log("[CardsCarousel] Fetching cards...");
      const data = await getCards();
      console.log("[CardsCarousel] Raw response:", data);

      // FILTER FIRST - only keep valid cards in state
      const validCards = (data.cards || []).filter((card) => {
        const isValid =
          card && card._id && card.masked && card.brand && card.holderName;
        if (!isValid) {
          console.warn("[CardsCarousel] Invalid card filtered out:", card);
        }
        return isValid;
      });

      console.log(
        `[CardsCarousel] ✓ Filtered to ${validCards.length} valid cards`,
      );
      validCards.forEach((card, idx) => {
        console.log(
          `  [${idx}] ${card.brand} (${card.type}) - ${card.masked} - Holder: ${card.holderName}`,
        );
      });

      setCards(validCards);
      setCurrentIndex(0); // Reset to first card
      setError(null);
    } catch (err) {
      console.error("[CardsCarousel] ✗ Error fetching cards:", err);

      // Provide user-friendly error messages
      let errorMsg = err.message;
      if (err.name === "AbortError") {
        errorMsg = "Request timed out. Please try again.";
      } else if (err instanceof TypeError) {
        errorMsg = "Network error. Please check your connection.";
      }

      setError(errorMsg || "Failed to load cards");
    } finally {
      setLoading(false);
    }
  }

  // Carousel navigation - with bounds checking
  const handlePrev = () => {
    if (cards.length === 0) return;
    setCurrentIndex((prev) => {
      const newIndex = prev === 0 ? cards.length - 1 : prev - 1;
      console.log(`[Carousel Nav] Prev: ${prev} → ${newIndex}`);
      return newIndex;
    });
  };

  const handleNext = () => {
    if (cards.length === 0) return;
    setCurrentIndex((prev) => {
      const newIndex = (prev + 1) % cards.length;
      console.log(`[Carousel Nav] Next: ${prev} → ${newIndex}`);
      return newIndex;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [cards.length]);

  // Form validation
  function validateForm() {
    const errors = {};
    if (!formData.holderName.trim()) errors.holderName = "Holder name required";
    if (!formData.cardNumber.trim()) errors.cardNumber = "Card number required";
    else if (!luhnCheck(formData.cardNumber.replace(/\D/g, ""))) {
      errors.cardNumber = "Invalid card number";
    }
    if (!formData.expiryMonth) errors.expiryMonth = "Expiry month required";
    if (!formData.expiryYear) errors.expiryYear = "Expiry year required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Luhn algorithm
  function luhnCheck(num) {
    let sum = 0;
    let isEven = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  }

  async function handleAddCard(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await addCard({
        holderName: formData.holderName,
        type: formData.type,
        brand: formData.brand,
        cardNumber: formData.cardNumber,
        expiryMonth: parseInt(formData.expiryMonth, 10),
        expiryYear: parseInt(formData.expiryYear, 10),
        colorTheme: formData.colorTheme,
        notes: formData.notes,
      });

      console.log("[CardsCarousel] Card add response:", result);

      // Optimistic update: Add the new card to state immediately
      if (result && result.card) {
        setCards((prev) => [result.card, ...prev]);
        setCurrentIndex(0); // Go to the new card
      } else {
        // Fallback if response structure is unexpected
        await fetchCards();
      }

      setShowAddModal(false);
      setFormData({
        holderName: "",
        type: "credit",
        brand: "VISA",
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        colorTheme: "#6C5CE7",
        notes: "",
      });
      setFormErrors({});
    } catch (err) {
      console.error("Error adding card:", err);
      setFormErrors({ submit: err.message || "Failed to add card" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCard(cardId) {
    if (!window.confirm("Are you sure you want to delete this card?")) return;

    try {
      await deleteCard(cardId);
      console.log(`[CardsCarousel] Deleted card ${cardId}`);

      // Filter out deleted card
      const updatedCards = cards.filter((c) => c._id !== cardId);
      setCards(updatedCards);

      // Adjust index if needed
      if (updatedCards.length === 0) {
        setCurrentIndex(0);
      } else if (currentIndex >= updatedCards.length) {
        setCurrentIndex(updatedCards.length - 1);
      }

      console.log(`[CardsCarousel] Remaining cards: ${updatedCards.length}`);
    } catch (err) {
      console.error("Error deleting card:", err);
      alert(`Failed to delete card: ${err.message || "Unknown error"}`);
    }
  }

  if (loading) {
    return (
      <div className="cards-carousel-wrapper">
        <div className="carousel-container">
          <h3 className="carousel-title">Your Cards</h3>
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            Loading cards...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cards-carousel-wrapper">
        <div className="carousel-container">
          <h3 className="carousel-title">Your Cards</h3>
          <div
            style={{ padding: "40px", textAlign: "center", color: "#ff6b6b" }}
          >
            <p>⚠️ Error: {error}</p>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.6)",
                marginTop: "10px",
              }}
            >
              You can still add a new card below
            </p>
            <button
              onClick={fetchCards}
              style={{
                marginTop: "15px",
                padding: "8px 16px",
                background: "rgba(124, 58, 237, 0.6)",
                border: "none",
                color: "#fff",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Retry
            </button>
          </div>
          <button
            className="add-card-btn"
            onClick={() => setShowAddModal(true)}
            aria-label="Add new card"
          >
            + Add Card
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cards-carousel-wrapper">
      <div className="carousel-container">
        <h3 className="carousel-title">Your Cards</h3>

        {cards && cards.length > 0 ? (
          <div className="carousel">
            {/* Carousel Viewport */}
            <div className="carousel-viewport">
              {/* Carousel track */}
              <div
                className="carousel-track"
                style={{
                  transform: `translateX(${-currentIndex * 100}%)`,
                  transition: "transform 0.3s ease-in-out",
                  width: "100%",
                  display: "flex",
                  flexWrap: "nowrap",
                }}
              >
                {cards.map((card, idx) => {
                  const isActive = idx === currentIndex;
                  // Ensure we always render a slide to maintain carousel geometry
                  // even if data is missing
                  const isValid =
                    card &&
                    card._id &&
                    card.masked &&
                    card.brand &&
                    card.holderName;

                  return (
                    <div
                      key={card?._id || idx}
                      className={`card-slide ${isActive ? "active" : ""}`}
                      style={{
                        flex: "0 0 100%",
                        width: "100%",
                        minWidth: "100%",
                      }}
                    >
                      {!isValid ? (
                        <div
                          className="card card-error"
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <p>Invalid Card Data</p>
                          <button
                            className="card-delete-btn"
                            onClick={() =>
                              card?._id && handleDeleteCard(card._id)
                            }
                            style={{ position: "static", marginTop: "10px" }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`card card-${card.type}`}
                          style={{
                            borderColor: card.colorTheme || "#4fd4c6",
                            background: card.colorTheme || "#4fd4c6",
                          }}
                        >
                          {/* Chip */}
                          <div className="card-chip">
                            <div className="chip-inner"></div>
                          </div>

                          {/* Brand & Delete button */}
                          <div className="card-header">
                            <span className="card-brand">
                              {card.brand.toUpperCase()}
                            </span>
                            <button
                              className="card-delete-btn"
                              onClick={() => handleDeleteCard(card._id)}
                              title="Delete card"
                              aria-label="Delete card"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Card number */}
                          <div className="card-number">{card.masked}</div>

                          {/* Footer */}
                          <div className="card-footer">
                            <div>
                              <div className="card-label">CARDHOLDER</div>
                              <div className="card-holder-name">
                                {card.holderName}
                              </div>
                            </div>
                            <div>
                              <div className="card-label">EXPIRES</div>
                              <div className="card-expiry">
                                {String(card.expiryMonth).padStart(2, "0")}/
                                {card.expiryYear % 100}
                              </div>
                            </div>
                            <div>
                              <div className="card-label">TYPE</div>
                              <div className="card-type-label">
                                {card.type === "credit" ? "Credit" : "Debit"}
                              </div>
                            </div>
                          </div>

                          {/* Gradient overlay */}
                          <div className="card-gradient"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation arrows */}
            {cards.length > 1 && (
              <>
                <button
                  className="carousel-nav carousel-prev"
                  onClick={handlePrev}
                  aria-label="Previous card"
                >
                  ‹
                </button>
                <button
                  className="carousel-nav carousel-next"
                  onClick={handleNext}
                  aria-label="Next card"
                >
                  ›
                </button>
              </>
            )}

            {/* Indicators */}
            <div className="carousel-indicators">
              {cards.map((_, idx) => (
                <div
                  key={idx}
                  className={`indicator ${idx === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(idx)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to card ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="no-cards-message">
            <p>No cards yet. Add one to get started!</p>
          </div>
        )}

        {/* Add Card Button */}
        <button
          className="add-card-btn"
          onClick={() => setShowAddModal(true)}
          aria-label="Add new card"
        >
          + Add Card
        </button>

        {/* Add Card Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Card</h2>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowAddModal(false)}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddCard} className="add-card-form">
                {formErrors.submit && (
                  <div className="form-error-message">{formErrors.submit}</div>
                )}

                <div className="form-group">
                  <label htmlFor="holderName">Cardholder Name *</label>
                  <input
                    id="holderName"
                    type="text"
                    value={formData.holderName}
                    onChange={(e) =>
                      setFormData({ ...formData, holderName: e.target.value })
                    }
                    placeholder="e.g., Faiz Anwar"
                    className={formErrors.holderName ? "error" : ""}
                  />
                  {formErrors.holderName && (
                    <span className="field-error">{formErrors.holderName}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="type">Card Type *</label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option value="credit">Credit</option>
                      <option value="debit">Debit</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="brand">Brand *</label>
                    <select
                      id="brand"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                    >
                      <option value="VISA">VISA</option>
                      <option value="MasterCard">MasterCard</option>
                      <option value="Amex">American Express</option>
                      <option value="Discover">Discover</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number *</label>
                  <input
                    id="cardNumber"
                    type="text"
                    inputMode="numeric"
                    value={formData.cardNumber}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 19);
                      setFormData({ ...formData, cardNumber: val });
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className={formErrors.cardNumber ? "error" : ""}
                  />
                  {formErrors.cardNumber && (
                    <span className="field-error">{formErrors.cardNumber}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryMonth">Expiry Month *</label>
                    <select
                      id="expiryMonth"
                      value={formData.expiryMonth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expiryMonth: e.target.value,
                        })
                      }
                      className={formErrors.expiryMonth ? "error" : ""}
                    >
                      <option value="">Select month</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i} value={i + 1}>
                          {String(i + 1).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    {formErrors.expiryMonth && (
                      <span className="field-error">
                        {formErrors.expiryMonth}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="expiryYear">Expiry Year *</label>
                    <select
                      id="expiryYear"
                      value={formData.expiryYear}
                      onChange={(e) =>
                        setFormData({ ...formData, expiryYear: e.target.value })
                      }
                      className={formErrors.expiryYear ? "error" : ""}
                    >
                      <option value="">Select year</option>
                      {[...Array(20)].map((_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <option key={i} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                    {formErrors.expiryYear && (
                      <span className="field-error">
                        {formErrors.expiryYear}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="colorTheme">Card Color</label>
                  <div className="color-picker">
                    <input
                      id="colorTheme"
                      type="color"
                      value={formData.colorTheme}
                      onChange={(e) =>
                        setFormData({ ...formData, colorTheme: e.target.value })
                      }
                    />
                    <span className="color-hex">{formData.colorTheme}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Notes (optional)</label>
                  <input
                    id="notes"
                    type="text"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="e.g., Primary card"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Card"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
