// src/pages/Agendamentos.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [novoAgendamento, setNovoAgendamento] = useState({
    cliente: "",
    profissional: "",
    servico: "MANICURE",
    data: "",
    hora: ""
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    buscarAgendamentos();
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

  const criarAgendamento = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("https://mastriaagenda-production.up.railway.app/agendamento", novoAgendamento, {
        headers: { Authorization: `Bearer ${token}` }
      });
      buscarAgendamentos();
    } catch (err) {
      setError("Erro ao criar agendamento.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Agendamentos</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={criarAgendamento} className="mt-4 space-y-4">
        <input 
          type="text" 
          placeholder="Cliente" 
          value={novoAgendamento.cliente} 
          onChange={(e) => setNovoAgendamento({ ...novoAgendamento, cliente: e.target.value })} 
          className="border p-2 rounded w-full" 
        />
        <input 
          type="text" 
          placeholder="Profissional" 
          value={novoAgendamento.profissional} 
          onChange={(e) => setNovoAgendamento({ ...novoAgendamento, profissional: e.target.value })} 
          className="border p-2 rounded w-full" 
        />
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
            {agendamento.cliente.nome} - {agendamento.servico} - {agendamento.data} {agendamento.hora}
          </li>
        ))}
      </ul>
    </div>
  );
}
