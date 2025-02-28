import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/"); // Se não houver usuário, redireciona para o login
    }
  }, [user, navigate]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <nav className="mt-4 space-x-4">
        <Link to="/dashboard/agendamentos" className="text-blue-500">Agendamentos</Link>
        <Link to="/dashboard/clientes" className="text-blue-500">Clientes</Link>
        <Link to="/dashboard/profissionais" className="text-blue-500">Profissionais</Link>
      </nav>
      <Outlet />
    </div>
  );
}
