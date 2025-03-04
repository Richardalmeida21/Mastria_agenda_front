import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

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
    <div className="p-4">
      <h2 className="text-xl font-bold">Dashboard</h2>
      {user ? (
        <div>
          <p>Bem-vindo, {user.nome}!</p>
          <p>Role: {user.role}</p>
          <p>Email: {user.email}</p>
          {user.role === "ADMIN" && (
            <div className="mt-4">
              <Link to="/clientes" className="block bg-blue-500 text-white px-4 py-2 rounded mb-2">Gerenciar Clientes</Link>
              <Link to="/profissionais" className="block bg-blue-500 text-white px-4 py-2 rounded mb-2">Gerenciar Profissionais</Link>
              <Link to="/agendamentos" className="block bg-blue-500 text-white px-4 py-2 rounded">Gerenciar Agendamentos</Link>
            </div>
          )}
        </div>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
}
