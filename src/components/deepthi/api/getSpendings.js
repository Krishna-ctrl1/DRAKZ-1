// src/components/deepthi/api/getSpendings.js
import axios from "../../../api/axios.api";

export async function fetchWeeklySpendings({ weeks = 5 } = {}) {
  try {
    const response = await axios.get(`/api/spendings/weekly?weeks=${weeks}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching weekly spendings:", error);
    throw error;
  }
}

export async function fetchRecentSpendings({ limit = 30 } = {}) {
  try {
    const response = await axios.get(`/api/spendings/list?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching recent spendings:", error);
    throw error;
  }
}
