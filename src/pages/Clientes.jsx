import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [novoCliente, setNovoCliente] = useState({ nome: "", email: "", telefone: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const buscarClientes = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get("https://mastriaagenda-production.up.railway.app/cliente", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientes(response.data);
      setLoading(false);
    } catch (err) {
      setError("Erro ao buscar clientes.");
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarClientes();
  }, []); // Agora apenas dispara a busca ao carregar o componente

  const criarCliente = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("https://mastriaagenda-production.up.railway.app/cliente", novoCliente, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setNovoCliente({ nome: "", email: "", telefone: "" });
      buscarClientes(); // Atualiza a lista de clientes após a criação
    } catch (err) {
      setError("Erro ao criar cliente.");
    }
  };

  const deletarCliente = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://mastriaagenda-production.up.railway.app/cliente/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      buscarClientes(); // Atualiza a lista de clientes após a exclusão
    } catch (err) {
      setError("Erro ao excluir cliente.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Clientes</h2>
      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Carregando...</p>}

      <form onSubmit={criarCliente} className="mt-4 space-y-4">
        <input
          type="text"
          placeholder="Nome"
          value={novoCliente.nome}
          onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="email"
          placeholder="Email"
          value={novoCliente.email}
          onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Telefone"
          value={novoCliente.telefone}
          onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Criar Cliente</button>
      </form>

      <ul className="mt-4">
        {clientes.map((cliente) => (
          <li key={cliente.id} className="border-b p-2 flex justify-between">
            <span>{cliente.nome} - {cliente.email} - {cliente.telefone}</span>
            <button onClick={() => deletarCliente(cliente.id)} className="bg-red-500 text-white px-2 py-1 rounded">
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
