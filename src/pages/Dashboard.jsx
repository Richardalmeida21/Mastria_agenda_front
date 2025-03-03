import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    axios
      .get("https://mastriaagenda-production.up.railway.app/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar usuário:", error);
        navigate("/");
      });
  }, [navigate]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Bem-vindo, {user.nome}!</p>
      <p><strong>Role:</strong> {user.role}</p>

      {/* Se for ADMIN, exibe todas as opções */}
      {user.role === "ADMIN" && (
        <>
          <h2 className="mt-4 text-lg font-bold">Gerenciamento</h2>
          <nav className="mt-2 space-x-4">
            <Link to="/dashboard/agendamentos" className="text-blue-500">Agendamentos</Link>
            <Link to="/dashboard/clientes" className="text-blue-500">Clientes</Link>
            <Link to="/dashboard/profissionais" className="text-blue-500">Profissionais</Link>
          </nav>
        </>
      )}

      {/* Se for PROFISSIONAL, exibe apenas os agendamentos dele */}
      {user.role === "PROFISSIONAL" && (
        <>
          <h2 className="mt-4 text-lg font-bold">Seus Agendamentos</h2>
          <Link to="/dashboard/agendamentos" className="text-blue-500">Ver Agendamentos</Link>
        </>
      )}

      <Outlet />
    </div>
  );
}
