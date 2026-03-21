import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { PasswordGate } from './components/auth/PasswordGate';
import { VersionUpdateBanner } from './components/VersionUpdateBanner';
import { HomePage } from './pages/HomePage';
import { DashboardTest } from './pages/DashboardTest';
import { MusicPage } from './pages/MusicPage';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <VersionUpdateBanner />
        <BrowserRouter>
          <Routes>
            <Route path="/dashboard-test" element={<DashboardTest />} />
            <Route path="/musica" element={<MusicPage />} />
            <Route path="*" element={<PasswordGate><HomePage /></PasswordGate>} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
