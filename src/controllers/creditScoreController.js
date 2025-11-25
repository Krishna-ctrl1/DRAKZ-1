const CreditScore = require("../models/CreditScore");
const Person = require("../models/people.model"); // user model

// Robust helper to pull user id from token payload
function getUserIdFromReq(req) {
  return req.user?.id || req.user?._id || req.user?.userId || req.user?.email;
}

exports.getMyCreditScore = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId)
      return res.status(400).json({ msg: "User id missing in token" });

    const credit = await CreditScore.findOne({ user: userId }).populate(
      "user",
      "name email",
    );
    if (!credit) return res.status(404).json({ msg: "Credit score not found" });

    res.json({ success: true, credit });
  } catch (err) {
    console.error("getMyCreditScore error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.setCreditScore = async (req, res) => {
  try {
    const { score, note, userId: bodyUserId } = req.body;
    // Accept score for current user, or for a provided userId (admin)
    const tokenUserId = getUserIdFromReq(req);
    const targetUserId = bodyUserId || tokenUserId;
    if (!targetUserId)
      return res.status(400).json({ msg: "Target user id required" });

    if (typeof score !== "number") {
      return res.status(400).json({ msg: "Score must be a number" });
    }

    // Ensure user exists
    const user = await Person.findById(targetUserId);
    if (!user) return res.status(404).json({ msg: "Target user not found" });

    let credit = await CreditScore.findOne({ user: targetUserId });

    if (!credit) {
      credit = new CreditScore({
        user: targetUserId,
        score,
        history: [{ score, note }],
      });
    } else {
      // Push history and update latest
      credit.history.push({ score, note });
      credit.score = score;
      credit.lastUpdated = Date.now();
    }

    await credit.save();
    await credit.populate("user", "name email");
    res.json({ success: true, credit });
  } catch (err) {
    console.error("setCreditScore error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getCreditScoreByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ msg: "userId is required" });

    const credit = await CreditScore.findOne({ user: userId }).populate(
      "user",
      "name email",
    );
    if (!credit) return res.status(404).json({ msg: "Credit score not found" });

    res.json({ success: true, credit });
  } catch (err) {
    console.error("getCreditScoreByUserId error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
