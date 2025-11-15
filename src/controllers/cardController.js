// src/controllers/cardController.js
const Card = require("../models/Card");
const mongoose = require("mongoose");

function getUserId(req) {
  return (req.user && (req.user.id || req.user._id)) || null;
}

async function listCards(req, res) {
  try {
    const userId = getUserId(req);
    console.log("[listCards] Received request");
    console.log("[listCards] userId:", userId);
    console.log("[listCards] req.user:", req.user);

    if (!userId) {
      console.log("[listCards] No userId found");
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("[listCards] Querying cards for userId:", userId);

    // Make sure userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("[listCards] Invalid ObjectId:", userId);
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const cards = await Card.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    console.log(`[listCards] ✓ Found ${cards.length} cards for user ${userId}`);
    res.json({ cards });
  } catch (err) {
    console.error("[listCards] ✗ Error:", err.message);
    console.error("[listCards] Stack:", err.stack);
    res
      .status(500)
      .json({ error: err.message || "Server error", details: err.toString() });
  }
}

async function createCard(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const {
      holderName,
      type,
      brand,
      cardNumber,
      expiryMonth,
      expiryYear,
      colorTheme,
      notes,
    } = req.body;
    if (!holderName || !type || !cardNumber || !expiryMonth || !expiryYear) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate card type
    if (!["credit", "debit"].includes(type)) {
      return res.status(400).json({ error: "Invalid card type" });
    }

    // Validate expiry
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (
      expiryYear < currentYear ||
      (expiryYear === currentYear && expiryMonth < currentMonth)
    ) {
      return res.status(400).json({ error: "Card has expired" });
    }

    // Basic sanitize + store only last4 and masked
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 12) {
      return res.status(400).json({ error: "Invalid card number length" });
    }

    // Luhn validation
    if (!luhnCheck(digits)) {
      return res
        .status(400)
        .json({ error: "Invalid card number (Luhn check failed)" });
    }

    const last4 = digits.slice(-4);
    const masked = digits
      .replace(/\d(?=\d{4})/g, "*")
      .match(/.{1,4}/g)
      .join(" ");

    const card = await Card.create({
      user: new mongoose.Types.ObjectId(userId),
      holderName,
      type,
      brand: brand || "Unknown",
      last4,
      masked,
      expiryMonth,
      expiryYear,
      colorTheme: colorTheme || "#4fd4c6",
      notes,
    });

    res.status(201).json({ card });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function deleteCard(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const cardId = req.params.cardId;
    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ error: "Card not found" });

    if (card.user.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await card.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Luhn algorithm for card validation
 */
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

module.exports = { listCards, createCard, deleteCard };
