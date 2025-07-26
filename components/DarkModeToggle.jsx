'use client';

export default function DarkModeToggle() {
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-5 right-5 z-50 px-4 py-2 bg-gray-300 dark:bg-gray-800 text-black dark:text-white rounded shadow-md hover:opacity-80"
    >
      Toggle Theme
    </button>
  );
}
