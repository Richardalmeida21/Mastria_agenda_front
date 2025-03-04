import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [novoProfissional, setNovoProfissional] = useState({ nome: "", login: "", senha: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Para controlar o estado de carregamento
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redireciona para a página de login se o token não existir
    } else {
      buscarProfissionais();
    }
  }, [navigate]);

  const buscarProfissionais = async () => {
    try {
      setLoading(true); // Ativa o carregamento ao buscar os dados
      const token = localStorage.getItem("token");
      const response = await axios.get("https://mastriaagenda-production.up.railway.app/profissional", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfissionais(response.data || []);
    } catch (err) {
      setError("Erro ao buscar profissionais.");
    } finally {
      setLoading(false); // Desativa o carregamento
    }
  };

  const criarProfissional = async (e) => {
    e.preventDefault();
    setLoading(true); // Ativa o carregamento ao criar o profissional
    try {
      const token = localStorage.getItem("token");
      await axios.post("https://mastriaagenda-production.up.railway.app/auth/register", novoProfissional, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setNovoProfissional({ nome: "", login: "", senha: "" });
      buscarProfissionais();
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar profissional.");
    } finally {
      setLoading(false); // Desativa o carregamento
    }
  };

  const deletarProfissional = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este profissional?")) { // Confirmar exclusão
      setLoading(true); // Ativa o carregamento ao excluir
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`https://mastriaagenda-production.up.railway.app/profissional/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        buscarProfissionais();
      } catch (err) {
        setError("Erro ao excluir profissional.");
      } finally {
        setLoading(false); // Desativa o carregamento
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Profissionais</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={criarProfissional} className="mt-4 space-y-4">
        <input
          type="text"
          placeholder="Nome"
          value={novoProfissional.nome}
          onChange={(e) => setNovoProfissional({ ...novoProfissional, nome: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Login"
          value={novoProfissional.login}
          onChange={(e) => setNovoProfissional({ ...novoProfissional, login: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="password"
          placeholder="Senha"
          value={novoProfissional.senha}
          onChange={(e) => setNovoProfissional({ ...novoProfissional, senha: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Criando..." : "Criar Profissional"}
        </button>
      </form>

      <ul className="mt-4">
        {profissionais.map((profissional) => (
          <li key={profissional.id} className="border-b p-2 flex justify-between">
            <span>{profissional.nome} - {profissional.login}</span>
            <button
              onClick={() => deletarProfissional(profissional.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
              disabled={loading}
            >
              {loading ? "Excluindo..." : "Excluir"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
