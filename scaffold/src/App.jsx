import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import Dashboard from './Dashboard.jsx';
import Preview from './Preview.jsx';

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('claude-design-dark');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('claude-design-dark', dark);
  }, [dark]);

  return [dark, setDark];
}

export default function App() {
  const [dark, setDark] = useDarkMode();

  return (
    <>
      <button
        onClick={() => setDark(d => !d)}
        className="fixed top-3 right-4 z-50 rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/p/:name" element={<Preview />} />
      </Routes>
    </>
  );
}
