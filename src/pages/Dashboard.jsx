import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import axios from "axios";
import "./styles/Dashboard.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("https://mastriaagenda-production.up.railway.app/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (err) {
        console.error("Erro ao buscar informações do usuário:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">Dashboard</h2>
      {user ? (
        <div className="user-info">
          <p>Bem-vindo, {user.nome}!</p>
          {user.role === "ADMIN" && (
            <div className="admin-links">
              <Link to="clientes" className="admin-link">Gerenciar Clientes</Link>
              <Link to="profissionais" className="admin-link">Gerenciar Profissionais</Link>
              <Link to="agendamentos" className="admin-link">Gerenciar Agendamentos</Link>
            </div>
          )}
        </div>
      ) : (
        <p>Carregando...</p>
      )}
      <Outlet />
    </div>
  );
}