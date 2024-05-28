import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: apiUrl,
});

export interface Expense {
  user_id: string | null;
  id: string;
  title: string;
  amount: number;
}

export const getExpenses = async (): Promise<Expense[]> => {
  console.log("Fetching expenses...");
  const response = await api.get("/expenses");
  console.log("Expenses fetched:", response.data);
  return response.data.expenses;
};

export const getExpenseById = async (id: string): Promise<Expense> => {
  console.log(`Fetching expense with id ${id}...`);
  const response = await api.get(`/expenses/${id}`);
  console.log("Expense fetched:", response.data);
  return response.data.expense;
};

export const createExpense = async (
  expense: Omit<Expense, "id">
): Promise<Expense> => {
  // Retrieve user data from localStorage
  const userDataString = localStorage.getItem("user");
  if (!userDataString) {
    throw new Error("User data not found in localStorage");
  }

  // Parse the user data and extract the user ID
  const userData = JSON.parse(userDataString);
  const userId = userData.id;

  if (!userId) {
    throw new Error("User ID not found in localStorage");
  }

  // Add user ID to the expense data
  const expenseWithUserId = {
    ...expense,
    user_id: userId,
  };

  try {
    // Make the API request to create the expense
    const response = await api.post("/expenses", expenseWithUserId);
    console.log("Expense created:", response.data);
    return response.data;
  } catch (error) {
    // Handle errors appropriately
    console.error("Error creating expense:", error);
    throw new Error("Failed to create expense");
  }
};

export const deleteExpense = async (id: string): Promise<Expense> => {
  console.log(`Deleting expense with id ${id}...`);
  const response = await api.delete(`/expenses/${id}`);
  console.log("Expense deleted:", response.data);
  return response.data.expense;
};

export const updateExpense = async (expense: Expense): Promise<Expense> => {
  console.log(`Updating expense with id ${expense.id}...`, expense);
  const response = await api.put(`/expenses/${expense.id}`, expense);
  console.log("Expense updated:", response.data);
  return response.data.expense;
};
