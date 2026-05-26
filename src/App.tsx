import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { dark, light, ThemeCtx, ThemeToggleCtx } from './theme';
import Dashboard from './Dashboard';
import Devices from './Devices';
import Reports from './Reports';
import Rules from './Rules';

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? dark : light;
  const toggle = () => setIsDark(p => !p);

  return (
    <ThemeToggleCtx.Provider value={{ isDark, toggle }}>
      <ThemeCtx.Provider value={theme}>
        <Routes>
          <Route path="/"             element={<Dashboard />} />
          <Route path="/dispositivos" element={<Devices />} />
          <Route path="/reportes"     element={<Reports />} />
          <Route path="/reglas"       element={<Rules />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeCtx.Provider>
    </ThemeToggleCtx.Provider>
  );
}
