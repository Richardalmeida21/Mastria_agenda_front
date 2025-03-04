import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [novoAgendamento, setNovoAgendamento] = useState({
    clienteId: "",
    profissionalId: "",
    servico: "MANICURE",
    data: "",
    hora: ""
  });
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const buscarAgendamentos = async () => {
      try {
        const response = await axios.get("https://mastriaagenda-production.up.railway.app/agendamento", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAgendamentos(response.data);
      } catch (err) {
        setError("Erro ao buscar agendamentos.");
      }
    };

    const buscarClientes = async () => {
      try {
        const response = await axios.get("https://mastriaagenda-production.up.railway.app/cliente", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClientes(response.data);
      } catch (err) {
        setError("Erro ao buscar clientes.");
      }
    };

    const buscarProfissionais = async () => {
      try {
        const response = await axios.get("https://mastriaagenda-production.up.railway.app/profissional", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfissionais(response.data);
      } catch (err) {
        setError("Erro ao buscar profissionais.");
      }
    };

    buscarAgendamentos();
    buscarClientes();
    buscarProfissionais();
  }, [navigate]);

  const criarAgendamento = async (e) => {
    e.preventDefault();
    setLoading(true); // Inicia o carregamento
    try {
      const token = localStorage.getItem("token");
      const payload = {
        clienteId: novoAgendamento.clienteId,
        profissionalId: novoAgendamento.profissionalId,
        servico: novoAgendamento.servico,
        data: novoAgendamento.data,
        hora: novoAgendamento.hora
      };

      await axios.post("https://mastriaagenda-production.up.railway.app/agendamento", payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      setNovoAgendamento({ clienteId: "", profissionalId: "", servico: "MANICURE", data: "", hora: "" });
      buscarAgendamentos(); // Atualiza a lista de agendamentos
    } catch (err) {
      setError("Erro ao criar agendamento.");
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  const deletarAgendamento = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://mastriaagenda-production.up.railway.app/agendamento/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      buscarAgendamentos();
    } catch (err) {
      setError("Erro ao excluir agendamento.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Agendamentos</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={criarAgendamento} className="mt-4 space-y-4">
        <select
          value={novoAgendamento.clienteId}
          onChange={(e) => setNovoAgendamento({ ...novoAgendamento, clienteId: e.target.value })}
          className="border p-2 rounded w-full"
        >
          <option value="">Selecione um Cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
          ))}
        </select>
        <select
          value={novoAgendamento.profissionalId}
          onChange={(e) => setNovoAgendamento({ ...novoAgendamento, profissionalId: e.target.value })}
          className="border p-2 rounded w-full"
        >
          <option value="">Selecione um Profissional</option>
          {profissionais.map((profissional) => (
            <option key={profissional.id} value={profissional.id}>{profissional.nome}</option>
          ))}
        </select>
        <select
          value={novoAgendamento.servico}
          onChange={(e) => setNovoAgendamento({ ...novoAgendamento, servico: e.target.value })}
          className="border p-2 rounded w-full"
        >
          <option value="MANICURE">Manicure</option>
          <option value="PEDICURE">Pedicure</option>
          <option value="CABELO">Cabelo</option>
          <option value="DEPILACAO">Depilação</option>
          <option value="PODOLOGIA">Podologia</option>
        </select>
        <input
          type="date"
          value={novoAgendamento.data}
          onChange={(e) => setNovoAgendamento({ ...novoAgendamento, data: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="time"
          value={novoAgendamento.hora}
          onChange={(e) => setNovoAgendamento({ ...novoAgendamento, hora: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Criando..." : "Criar Agendamento"}
        </button>
      </form>

      <ul className="mt-4">
        {agendamentos.map((agendamento) => (
          <li key={agendamento.id} className="border-b p-2 flex justify-between">
            <span>{agendamento.cliente.nome} - {agendamento.profissional.nome} - {agendamento.servico} - {agendamento.data} {agendamento.hora}</span>
            <button onClick={() => deletarAgendamento(agendamento.id)} className="bg-red-500 text-white px-2 py-1 rounded">
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
