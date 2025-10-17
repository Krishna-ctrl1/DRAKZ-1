// src/components/deepthi/api/getExpenseDistributionPie.js
import axios from "../../../api/axios.api";

export async function fetchExpenseDistributionPie({ days = 30 } = {}) {
  try {
    const response = await axios.get(
      `/api/spendings/distribution-pie?days=${days}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching expense distribution:", error);
    throw error;
  }
}
