"use client";

import { useEffect, useState } from "react";
import {
  getExpenses,
  deleteExpense,
  updateExpense,
  Expense,
} from "../service/api";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { useRouter } from "next/navigation";

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const router = useRouter();

  const isLoggedIn = localStorage.getItem("token");

  if (!isLoggedIn) {
    router.push("/login");
  } else {
    router.push("/");
  }

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("token");
    const userDataString = localStorage.getItem("user");

    let userId;

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      userId = userData.id;

      console.log("ID Pengguna:", userId);
    } else {
      console.log("Data pengguna tidak ditemukan di localStorage.");
    }

    if (!isLoggedIn) {
      router.push("/login");
    } else {
      // Pastikan userId telah diinisialisasi sebelum menggunakan fetchExpenses
      if (userId) {
        const fetchExpenses = async () => {
          const expenses = await getExpenses();
          // Filter expenses based on user_id
          const userExpenses = expenses.filter(
            (expense) => expense.user_id === userId
          );
          setExpenses(userExpenses);
          const total = userExpenses.reduce(
            (acc, expense) => acc + expense.amount,
            0
          );
          setTotalAmount(total);
        };
        fetchExpenses();
      }
    }
  }, []);

  const handleDelete = async (id: string) => {
    location.reload();
    await deleteExpense(id);
    setExpenses(expenses.filter((expense) => expense.id !== id));
    setIsDeleteModalOpen(false);
  };

  const handleEdit = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setCurrentExpense(null);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setExpenseToDelete(null);
  };

  const handleUpdate = async (updatedExpense: Expense) => {
    await updateExpense(updatedExpense);
    setExpenses(
      expenses.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
    handleModalClose();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center py-10">
        <h1 className="text-4xl font-bold mb-10 text-gray-900 dark:text-gray-100">
          Expenses
        </h1>
        <div className="sm:w-2/3 lg:w-full mx-3 md:max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <Link href="/create">
            <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600 transition duration-300">
              Create New Expense
            </button>
          </Link>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-4 py-2 text-left text-gray-900 dark:text-gray-100">
                  Title
                </th>
                <th className="px-4 py-2 text-left text-gray-900 dark:text-gray-100">
                  Amount
                </th>
                <th className="px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-900/70 transition duration-300"
                >
                  <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                    {expense.title}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                    {expense.amount.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="mr-2 px-3 py-1.5 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-500 transition duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(expense)}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 transition duration-300"
                    >
                      Delete
                    </button>
                    <Link className="ml-2" href={`/expense/${expense.id}`}>
                      <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 dark:bg-sky-600 dark:hover:bg-sky-500 transition duration-300">
                        Detail
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-lg flex justify-end mt-5 mb-4 text-gray-600 dark:text-gray-300">
            Total Amount:{" "}
            {totalAmount.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            })}
          </p>
        </div>
        {isEditModalOpen && currentExpense && (
          <EditModal
            expense={currentExpense}
            onClose={handleModalClose}
            onUpdate={handleUpdate}
          />
        )}
        {isDeleteModalOpen && expenseToDelete && (
          <DeleteModal
            expense={expenseToDelete}
            onClose={handleDeleteModalClose}
            onDelete={handleDelete}
          />
        )}
      </div>
    </>
  );
}

function EditModal({
  expense,
  onClose,
  onUpdate,
}: {
  expense: Expense;
  onClose: () => void;
  onUpdate: (expense: Expense) => void;
}) {
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(expense.amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...expense, title, amount });
    location.reload()
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Edit Expense
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300">
              Amount
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 border border-r-0 rounded-l-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                Rp
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                className="w-full px-4 py-2 border rounded-r-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 transition duration-300"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({
  expense,
  onClose,
  onDelete,
}: {
  expense: Expense;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Confirm Delete
        </h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete the expense "{expense.title}" ?
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(expense.id)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 transition duration-300"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
