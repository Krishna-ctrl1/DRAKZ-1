// src/routes/card.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/cardController");
const { auth } = require("../middlewares/auth.middleware.js");

router.get("/", auth, controller.listCards);
router.post("/", auth, controller.createCard);
router.delete("/:cardId", auth, controller.deleteCard);

module.exports = router;
