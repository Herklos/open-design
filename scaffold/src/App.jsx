import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import Preview from './Preview.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/p/:name" element={<Preview />} />
    </Routes>
  );
}
