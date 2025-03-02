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

  const buscarAgendamentos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://mastriaagenda-production.up.railway.app/agendamento", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgendamentos(response.data);
    } catch (err) {
      setError("Erro ao buscar agendamentos.");
    }
  };

  const buscarClientes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://mastriaagenda-production.up.railway.app/cliente", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(response.data);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    }
  };

  const buscarProfissionais = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://mastriaagenda-production.up.railway.app/profissional", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfissionais(response.data);
    } catch (err) {
      console.error("Erro ao buscar profissionais:", err);
    }
  };

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

      await axios.post("https://mastriaagenda-production.up.railway.app/agendamento", payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      setNovoAgendamento({ clienteId: "", profissionalId: "", servico: "MANICURE", data: "", hora: "" });
      buscarAgendamentos();
    } catch (err) {
      console.error("Erro ao criar agendamento:", err.response);
      setError("Erro ao criar agendamento. Verifique os dados.");
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
          {clientes.map(cliente => (
            <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
          ))}
        </select>

        <select 
          value={novoAgendamento.profissionalId} 
          onChange={(e) => setNovoAgendamento({ ...novoAgendamento, profissionalId: e.target.value })} 
          className="border p-2 rounded w-full"
        >
          <option value="">Selecione um Profissional</option>
          {profissionais.map(profissional => (
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

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Criar Agendamento</button>
      </form>

      <ul className="mt-4">
        {agendamentos.map((agendamento) => (
          <li key={agendamento.id} className="border-b p-2">
            {agendamento.cliente?.nome} - {agendamento.servico} - {agendamento.dataHora}
          </li>
        ))}
      </ul>
    </div>
  );
}
