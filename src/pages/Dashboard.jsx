import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    axios
      .get("https://mastriaagenda-production.up.railway.app/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error("Token inválido ou expirado", error);
        localStorage.removeItem("token");
        navigate("/");
      });
  }, [navigate]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {user && <p>Bem-vindo, {user.nome}!</p>}
      <nav className="mt-4 space-x-4">
        <Link to="/dashboard/agendamentos" className="text-blue-500">Agendamentos</Link>
        <Link to="/dashboard/clientes" className="text-blue-500">Clientes</Link>
        <Link to="/dashboard/profissionais" className="text-blue-500">Profissionais</Link>
      </nav>
      <Outlet />
    </div>
  );
}
