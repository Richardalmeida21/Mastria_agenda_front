import { useEffect, useState } from "react";
import axios from "axios";

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [novoProfissional, setNovoProfissional] = useState({ nome: "", login: "", senha: "" });
  const [error, setError] = useState(null);

  useEffect(() => {
    buscarProfissionais();
  }, []);

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

  const criarProfissional = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("https://mastriaagenda-production.up.railway.app/auth/register", novoProfissional, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setNovoProfissional({ nome: "", login: "", senha: "" });
      buscarProfissionais();
    } catch (err) {
      setError("Erro ao criar profissional.");
    }
  };

  const deletarProfissional = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://mastriaagenda-production.up.railway.app/profissional/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      buscarProfissionais();
    } catch (err) {
      setError("Erro ao excluir profissional.");
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
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Criar Profissional
        </button>
      </form>

      <ul className="mt-4">
        {profissionais.map((profissional) => (
          <li key={profissional.id} className="border-b p-2 flex justify-between">
            <span>{profissional.nome} - {profissional.login}</span>
            <button
              onClick={() => deletarProfissional(profissional.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
