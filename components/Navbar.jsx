export default function Navbar({ applyTheme, currentTheme }) {
  return (
    <nav className="flex justify-end p-4">
      <button
        onClick={() => applyTheme(currentTheme === "dark" ? "light" : "dark")}
        className="bg-gray-200 dark:bg-gray-700 text-sm px-4 py-2 rounded"
      >
        Switch to {currentTheme === "dark" ? "Light" : "Dark"} Mode
      </button>
    </nav>
  );
}
