"use client"

import { useEffect, useState } from "react";
import { getExpenseById, Expense } from "../../../service/api";
import { NextPage } from "next";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";

const ExpenseDetail: NextPage = () => {
  const id = window.location.pathname.split("/").pop();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  const isLoggedIn = localStorage.getItem('token');

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setUsername(userData.username);
    }

    const fetchExpense = async () => {
      try {
        if (typeof id === "string") {
          const fetchedExpense = await getExpenseById(id);
          setExpense(fetchedExpense);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching expense:", error);
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  if (!isLoggedIn) {
    router.push("/login");
    return null; // Menghindari rendering konten saat tidak ada pengguna yang login
  }

  if (loading) return <div>Loading...</div>;
  if (!expense) return <div>Expense not found</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center py-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            {expense.title}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Amount: Rp{expense.amount}
          </p>
          <b className="text-lg text-gray-700 dark:text-gray-300 flex justify-end">
            {username}
          </b>
        </div>
      </div>
    </>
  );
};

export default ExpenseDetail;
