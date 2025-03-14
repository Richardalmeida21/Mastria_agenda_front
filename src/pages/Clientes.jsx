import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/Clientes.css"; // Importar o arquivo CSS

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [novoCliente, setNovoCliente] = useState({ nome: "", email: "", telefone: "" });
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);
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
      const response = await axios.get("https://mastria-agenda.fly.dev/cliente", { // Novo link da API
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
  }, []);

  const criarCliente = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("https://mastria-agenda.fly.dev/cliente", novoCliente, { // Novo link da API
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setNovoCliente({ nome: "", email: "", telefone: "" });
      buscarClientes();
    } catch (err) {
      setError("Erro ao criar cliente.");
    }
  };

  const editarCliente = (cliente) => {
    setClienteEditando(cliente);
    setClienteEditandoId(cliente.id);
  };

  const atualizarCliente = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://mastria-agenda.fly.dev/cliente/${id}`, clienteEditando, { // Novo link da API
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setClienteEditando(null);
      setClienteEditandoId(null);
      buscarClientes();
    } catch (err) {
      setError("Erro ao atualizar cliente.");
    }
  };

  const deletarCliente = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://mastria-agenda.fly.dev/cliente/${id}`, { // Novo link da API
        headers: { Authorization: `Bearer ${token}` },
      });
      buscarClientes();
    } catch (err) {
      setError("Erro ao excluir cliente.");
    }
  };

  return (
    <div className="container-clientes">
      <h2>Clientes</h2>
      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Carregando...</p>}

      <form onSubmit={criarCliente} className="form-clientes">
        <input
          type="text"
          placeholder="Nome"
          value={novoCliente.nome}
          onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={novoCliente.email}
          onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Telefone"
          value={novoCliente.telefone}
          onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
        />
        <button type="submit" className="btn-form-clientes">Criar Cliente</button>
      </form>

      <table className="tabela-clientes">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>
                {clienteEditandoId === cliente.id ? (
                  <input
                    type="text"
                    value={clienteEditando.nome}
                    onChange={(e) => setClienteEditando({ ...clienteEditando, nome: e.target.value })}
                  />
                ) : (
                  cliente.nome
                )}
              </td>
              <td>
                {clienteEditandoId === cliente.id ? (
                  <input
                    type="email"
                    value={clienteEditando.email}
                    onChange={(e) => setClienteEditando({ ...clienteEditando, email: e.target.value })}
                  />
                ) : (
                  cliente.email
                )}
              </td>
              <td>
                {clienteEditandoId === cliente.id ? (
                  <input
                    type="text"
                    value={clienteEditando.telefone}
                    onChange={(e) => setClienteEditando({ ...clienteEditando, telefone: e.target.value })}
                  />
                ) : (
                  cliente.telefone
                )}
              </td>
              <td>
                {clienteEditandoId === cliente.id ? (
                  <button onClick={() => atualizarCliente(cliente.id)}>Salvar</button>
                ) : (
                  <button onClick={() => editarCliente(cliente)}>Editar</button>
                )}
                <button onClick={() => deletarCliente(cliente.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
