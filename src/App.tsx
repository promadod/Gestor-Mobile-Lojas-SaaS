import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import ClientesPage from './pages/Clientes';
import EstoquePage from './pages/Estoque';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('gestor_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/clientes"
        element={
          <PrivateRoute>
            <ClientesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/estoque"
        element={
          <PrivateRoute>
            <EstoquePage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
