import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import axios from "axios";
import "../pages/styles/Dashboard.css";
import "../pages/styles/Global.css";
import logo from "../pages/images/logo_maestria.png";

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

    // Adicionar classe ao body
    document.body.classList.add("dashboard-body");

    // Remover classe ao desmontar o componente
    return () => {
      document.body.classList.remove("dashboard-body");
    };
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <header className="header-dashboard">
        <h2>Dashboard Maestria</h2>
        <img src={logo} alt="" />
      </header>
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
        <p className="aviso-carregando">Carregando...</p>
      )}
      <Outlet />

      <div className="container-logo-fixed">
        <img className="logo-dashboard" src={logo} alt="" />
        </div>
    </div>
  );
}