import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { AppShell } from './layouts/AppShell.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { HomeMenu } from './pages/HomeMenu.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { CreateRoom } from './pages/CreateRoom.jsx';
import { JoinRoom } from './pages/JoinRoom.jsx';
import { Game } from './pages/Game.jsx';
import { MatchResult } from './pages/MatchResult.jsx';
import { Profile } from './pages/Profile.jsx';
import { Admin } from './pages/Admin.jsx';
import { Settings } from './pages/Settings.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { QuickSolo } from './pages/QuickSolo.jsx';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route index element={<HomeMenu />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route
                path="lobby"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="room/create"
                element={
                  <ProtectedRoute>
                    <CreateRoom />
                  </ProtectedRoute>
                }
              />
              <Route
                path="room/join"
                element={
                  <ProtectedRoute>
                    <JoinRoom />
                  </ProtectedRoute>
                }
              />
              <Route
                path="game/quick"
                element={
                  <ProtectedRoute>
                    <QuickSolo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="game/:roomId"
                element={
                  <ProtectedRoute>
                    <Game />
                  </ProtectedRoute>
                }
              />
              <Route
                path="match/:roomId"
                element={
                  <ProtectedRoute>
                    <MatchResult />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
