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

        if (response.data.role === "CLIENTE") {
          navigate("/dashboard/cliente"); // Redireciona o cliente para uma página específica
        } else {
          setUser(response.data); // Apenas usuários profissionais ou admin são exibidos no dashboard
        }
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
          <p>Role: {user.role}</p>
          <p>Email: {user.email}</p>
        </>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
}
