import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const userResponse = await axios.get("https://mastriaagenda-production.up.railway.app/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Dados do usuário:", userResponse.data); // Verifique a resposta

        setUser(userResponse.data);

        if (userResponse.data.role !== "ADMIN" && userResponse.data.role !== "PROFISSIONAL") {
          navigate("/dashboard");
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
          <p>Email: {user.email || "Não informado"}</p> {/* Exibe 'Não informado' se email estiver vazio */}
        </>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
}
