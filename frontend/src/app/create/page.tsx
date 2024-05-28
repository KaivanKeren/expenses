"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExpense, Expense } from "../../service/api";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function CreateExpense() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const isLoggedIn = localStorage.getItem('token')
  const router = useRouter();

  if (!isLoggedIn) {
    router.push("/login")
  } else {
    router.push("/create")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: "", title, amount: Number(amount),
      user_id: null
    };
    await createExpense(newExpense);
    router.push("/");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center py-10">
        <h1 className="text-4xl font-bold mb-10 text-gray-900 dark:text-gray-100">
          Create New Expense
        </h1>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
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
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex justify-end">
            <Link href="/">
              <button
                type="button"
                className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 transition duration-300"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 transition duration-300"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
