import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(() => {
    // Recupera as informações do usuário ou null se não houver dados
    return JSON.parse(localStorage.getItem("user")) || null;
  });
  
  const [loading, setLoading] = useState(true);  // Para controlar o carregamento
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Verificar se o token existe e se é válido
    if (!token) {
      navigate("/");  // Redireciona para o login se o token não existir
    } else {
      // Validando o token com uma requisição para garantir que ele é válido
      axios
        .get("https://mastriaagenda-production.up.railway.app/validate-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          // Se o token for válido, recupera os dados do usuário
          const userData = response.data.user;
          setUser(userData);
          setLoading(false); // Conclui o carregamento
        })
        .catch((error) => {
          console.error("Token inválido ou expirado", error);
          navigate("/");  // Redireciona para o login se o token for inválido
        });
    }
  }, [navigate]);

  if (loading) {
    return <div>Carregando...</div>;  // Exibe um carregamento enquanto não valida o token
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {user && <p>Bem-vindo, {user.nome}!</p>} {/* Exibe o nome do usuário, se disponível */}
      <nav className="mt-4 space-x-4">
        <Link to="/dashboard/agendamentos" className="text-blue-500">Agendamentos</Link>
        <Link to="/dashboard/clientes" className="text-blue-500">Clientes</Link>
        <Link to="/dashboard/profissionais" className="text-blue-500">Profissionais</Link>
      </nav>
      <Outlet />
    </div>
  );
}
