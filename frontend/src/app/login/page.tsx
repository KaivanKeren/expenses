"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorMessage from "../components/ErrorMesasge";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Login successful!");
        localStorage.setItem('token', data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/");
      } else {
        if (data.issues) {
          const errorMessages = data.issues.map((issue: { message: any; }) => issue.message);
          setErrorMessages(errorMessages);
        } else {
          setErrorMessages([data.error || "Login failed. Please try again."]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessages(['An unexpected error occurred. Please try again later.']);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:text-white dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded shadow-md">
          <h2 className="text-2xl font-bold text-center">Login</h2>
          <ErrorMessage messages={errorMessages} />
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full px-3 py-2 border dark:bg-gray-700 dark:placeholder-white border-gray-300 rounded-t-md placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full px-3 py-2 border dark:bg-gray-700 dark:placeholder-white border-gray-300 rounded-b-md placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>
          <p>Don't have an Account? <Link className="text-blue-500 font-bold" href="/register">Register</Link></p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
