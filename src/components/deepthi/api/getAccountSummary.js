import axios from "../../../api/axios.api";

const getAccountSummary = async () => {
  try {
    const response = await axios.get("/api/account-summary");
    return response.data;
  } catch (error) {
    console.error("Error fetching account summary:", error);
    throw error;
  }
};

export default getAccountSummary;
