// src/components/deepthi/api/getCreditScore.js
import axios from "../../../api/axios.api";

export async function getMyCreditScore() {
  try {
    const response = await axios.get("/api/credit-score/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching credit score:", error);
    throw error;
  }
}

// Admin / other: set credit score
export async function setCreditScore({ score, note, userId }) {
  try {
    const response = await axios.post("/api/credit-score", {
      score,
      note,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error setting credit score:", error);
    throw error;
  }
}
