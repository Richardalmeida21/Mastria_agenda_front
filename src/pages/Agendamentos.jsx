import { useEffect, useState } from "react";
import axios from "axios";

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

  useEffect(() => {
    buscarAgendamentos();
    buscarClientes();
    buscarProfissionais();
  }, []);

  // Função para buscar agendamentos, diferenciando Admin e Profissional
  const buscarAgendamentos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://mastriaagenda-production.up.railway.app/agendamento", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userRole = localStorage.getItem("role"); // Verifica o papel do usuário
      if (userRole === 'PROFISSIONAL') {
        // Filtra agendamentos relacionados ao profissional logado
        const profissionalId = localStorage.getItem("profissionalId"); // ID do profissional logado
        const agendamentosFiltrados = response.data.filter(agendamento => agendamento.profissional.id === profissionalId);
        setAgendamentos(agendamentosFiltrados);
      } else {
        // Para admin, exibe todos os agendamentos
        setAgendamentos(response.data);
      }
    } catch (err) {
      setError("Erro ao buscar agendamentos.");
    }
  };

  // Função para buscar clientes
  const buscarClientes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://mastriaagenda-production.up.railway.app/cliente", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientes(response.data);
    } catch (err) {
      setError("Erro ao buscar clientes.");
    }
  };

  // Função para buscar profissionais
  const buscarProfissionais = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://mastriaagenda-production.up.railway.app/profissional", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfissionais(response.data);
    } catch (err) {
      setError("Erro ao buscar profissionais.");
    }
  };

  // Função para criar um novo agendamento
  const criarAgendamento = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        clienteId: novoAgendamento.clienteId,
        profissionalId: novoAgendamento.profissionalId,
        servico: novoAgendamento.servico,
        dataHora: `${novoAgendamento.data}T${novoAgendamento.hora}:00`
      };

      // Adiciona verificação de role e associa o profissional ao agendamento
      const userRole = localStorage.getItem("role");
      if (userRole !== "ADMIN") {
        payload.profissionalId = localStorage.getItem("profissionalId"); // Associa o profissional logado
      }

      await axios.post("https://mastriaagenda-production.up.railway.app/agendamento", payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      setNovoAgendamento({ clienteId: "", profissionalId: "", servico: "MANICURE", data: "", hora: "" });
      buscarAgendamentos();
    } catch (err) {
      setError("Erro ao criar agendamento.");
    }
  };

  // Função para deletar agendamento
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

      {/* Formulário para criar novo agendamento */}
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
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Criar Agendamento</button>
      </form>

      {/* Lista de agendamentos */}
      <ul className="mt-4">
        {agendamentos.map((agendamento) => (
          <li key={agendamento.id} className="border-b p-2 flex justify-between">
            <span>{agendamento.cliente.nome} - {agendamento.profissional.nome} - {agendamento.servico} - {agendamento.dataHora}</span>
            <button onClick={() => deletarAgendamento(agendamento.id)} className="bg-red-500 text-white px-2 py-1 rounded">
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
