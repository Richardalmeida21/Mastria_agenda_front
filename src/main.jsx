import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Agendamentos from "./pages/Agendamentos";
import Clientes from "./pages/Clientes";
import Profissionais from "./pages/Profissionais";
import AgendamentosProfissional from "./pages/ListAgendamentos"; // Adicionando a página de agendamentos do profissional
import "./index.css";

// Função para verificar se o usuário está autenticado
const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

// Componente para proteger as rotas
const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Página de Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard com subpáginas */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />}>
          <Route path="agendamentos" element={<ProtectedRoute element={<Agendamentos />} />} />
          <Route path="clientes" element={<ProtectedRoute element={<Clientes />} />} />
          <Route path="profissionais" element={<ProtectedRoute element={<Profissionais />} />} />
        </Route>

        {/* Página de agendamentos do profissional */}
        <Route path="/agendamentos-profissional/:id" element={<ProtectedRoute element={<AgendamentosProfissional />} />} />

        {/* Rota padrão para redirecionar para /login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  </React.StrictMode>
);