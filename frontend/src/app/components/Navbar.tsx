import { useState, useEffect, useRef } from 'react';
import DarkModeToggle from './DarkModeToggle';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();


  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleClickOutside = (event: { target: any; }) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  const login = () => {
    // Assuming you set a token on login
    localStorage.getItem('token');
    setIsLoggedIn(true);
  };

  const logout = () => {
    router.push("/login")
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setIsLoggedIn(true);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="w-full bg-gray-100 dark:bg-gray-900 p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-lg font-bold text-black dark:text-gray-100">
          Expense Manager
        </h1>
      </div>
      <div className="relative flex items-center gap-3">
        <DarkModeToggle />
        {isLoggedIn && (
          <button
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-white rounded-lg shadow hover:bg-white dark:hover:bg-gray-700 transition duration-300"
            onClick={toggleDropdown}
          >
            <svg
              className="h-6 w-6 dark:fill-white fill-black"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" />
            </svg>
          </button>
        )}
        {dropdownOpen && isLoggedIn && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-32 w-48 bg-white dark:text-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          >
            <ul className="py-1">
              <li
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={logout}
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
