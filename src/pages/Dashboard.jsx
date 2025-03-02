import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

        const response = await axios.get("https://mastriaagenda-production.up.railway.app/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (err) {
        console.error("Erro ao buscar informações do usuário:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Dashboard</h2>
      {user ? (
        <>
          <p>Bem-vindo, {user.nome}!</p>
          {user.role === "ADMIN" && (
            <div className="mt-4">
              <a href="/clientes" className="block bg-blue-500 text-white px-4 py-2 rounded mb-2">Gerenciar Clientes</a>
              <a href="/profissionais" className="block bg-blue-500 text-white px-4 py-2 rounded mb-2">Gerenciar Profissionais</a>
              <a href="/agendamentos" className="block bg-blue-500 text-white px-4 py-2 rounded">Gerenciar Agendamentos</a>
            </div>
          )}
        </>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
}
