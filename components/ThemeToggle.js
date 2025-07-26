import { useEffect } from 'react';

export default function ThemeToggle() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-5 left-5 z-[9999] bg-gray-200 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded shadow-lg"
    >
      Toggle Theme
    </button>
  );
}
