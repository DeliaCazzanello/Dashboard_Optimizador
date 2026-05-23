import { useState } from 'react';
import type { AppPage } from './theme';
import Dashboard from './Dashboard';
import Devices from './Devices';
import Reports from './Reports';
import Rules from './Rules';

export default function App() {
  const [page, setPage] = useState<AppPage>('dashboard');
  if (page === 'devices') return <Devices onNavigate={setPage} />;
  if (page === 'reports') return <Reports onNavigate={setPage} />;
  if (page === 'rules')   return <Rules   onNavigate={setPage} />;
  return <Dashboard onNavigate={setPage} />;
}
