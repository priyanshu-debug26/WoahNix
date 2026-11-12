import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MediaProvider } from './context/MediaContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { HomePage } from './pages/HomePage';
import { FollowingPage } from './pages/FollowingPage';
import { LivePage } from './pages/LivePage';
import { ExplorePage } from './pages/ExplorePage';
import { WatchLaterPage } from './pages/WatchLaterPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <MediaProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/following" element={<FollowingPage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/watch-later" element={<WatchLaterPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MediaProvider>
  );
}

