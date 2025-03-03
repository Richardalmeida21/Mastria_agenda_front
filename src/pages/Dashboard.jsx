import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null);
  const [profissionais, setProfissionais] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    buscarUsuario();
    buscarProfissionais();
  }, []);

  const buscarUsuario = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://mastriaagenda-production.up.railway.app/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuario(response.data);
    } catch (err) {
      setError("Erro ao buscar informações do usuário.");
    }
  };

  const buscarProfissionais = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://mastriaagenda-production.up.railway.app/profissional", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfissionais(response.data || []);
    } catch (err) {
      setError("Erro ao buscar profissionais.");
    }
  };

  if (error) return <p className="text-red-500">{error}</p>;
  if (!usuario) return <p>Carregando...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Dashboard</h2>
      <p>Bem-vindo, {usuario.nome}!</p>
      <p>Role: {usuario.role}</p>

      <h3 className="mt-4 text-lg font-semibold">Profissionais</h3>
      {profissionais.length > 0 ? (
        <ul>
          {profissionais.map((prof) => (
            <li key={prof.id} className="border-b p-2">
              {prof.nome} - {prof.login}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum profissional encontrado.</p>
      )}
    </div>
  );
}
