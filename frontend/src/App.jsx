import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MediaProvider } from './context/MediaContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { HomePage } from './pages/HomePage';
import { FollowingPage } from './pages/FollowingPage';
import { LivePage } from './pages/LivePage';
import { ExplorePage } from './pages/ExplorePage';
import { WatchLaterPage } from './pages/WatchLaterPage';
import { SettingsPage } from './pages/SettingsPage';
import { WatchPage } from './pages/WatchPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export default function App() {
  return (
    <AuthProvider>
      <MediaProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/following" element={<FollowingPage />} />
              <Route path="/live" element={<LivePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/watch-later" element={<WatchLaterPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/watch" element={<WatchPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MediaProvider>
    </AuthProvider>
  );
}
