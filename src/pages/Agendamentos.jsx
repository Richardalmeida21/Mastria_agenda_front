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
    hora: "",
    observacao: "", // Adicionando o campo de observação
  });
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const buscarDados = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [agendamentosRes, clientesRes, profissionaisRes] = await Promise.all([
          axios.get("https://mastriaagenda-production.up.railway.app/agendamento", { headers }),
          axios.get("https://mastriaagenda-production.up.railway.app/cliente", { headers }),
          axios.get("https://mastriaagenda-production.up.railway.app/profissional", { headers }),
        ]);

        setAgendamentos(agendamentosRes.data);
        setClientes(clientesRes.data);
        setProfissionais(profissionaisRes.data);
      } catch (error) {
        setError("Erro ao buscar os dados.");
        console.error(error);
      }
    };

    buscarDados();
  }, [navigate]);

  const handleChange = (e) => {
    setNovoAgendamento({ ...novoAgendamento, [e.target.name]: e.target.value });
    if (e.target.name === "data" || e.target.name === "hora") {
      setError(null); // Limpar a mensagem de erro ao corrigir a data ou hora
    }
  };

  const buscarAgendamentos = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get("https://mastriaagenda-production.up.railway.app/agendamento", { headers });
      setAgendamentos(response.data);
    } catch (error) {
      setError("Erro ao atualizar os agendamentos.");
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Verificar se a data do agendamento é no futuro ou hoje
    const hoje = new Date();
    const dataAgendamento = new Date(`${novoAgendamento.data}T${novoAgendamento.hora}`);
    if (dataAgendamento < hoje.setHours(0, 0, 0, 0)) {
      setError("Por favor, agende uma data futura ou a data atual.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Criar agendamento
      await axios.post("https://mastriaagenda-production.up.railway.app/agendamento", novoAgendamento, { headers });

      // Atualizar a lista de agendamentos
      await buscarAgendamentos();

      // Resetar o formulário
      setNovoAgendamento({ clienteId: "", profissionalId: "", servico: "MANICURE", data: "", hora: "", observacao: "" });
    } catch (error) {
      setError("Erro ao criar agendamento.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Excluir o agendamento no backend
      await axios.delete(`https://mastriaagenda-production.up.railway.app/agendamento/${id}`, { headers });

      // Atualizar a lista de agendamentos
      await buscarAgendamentos();
    } catch (error) {
      setError("Erro ao excluir agendamento.");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1>Agendamentos</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <select name="clienteId" value={novoAgendamento.clienteId} onChange={handleChange} required>
          <option value="">Selecione um cliente</option>
          {clientes.map(cliente => (
            <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
          ))}
        </select>

        <select name="profissionalId" value={novoAgendamento.profissionalId} onChange={handleChange} required>
          <option value="">Selecione um profissional</option>
          {profissionais.map(profissional => (
            <option key={profissional.id} value={profissional.id}>{profissional.nome}</option>
          ))}
        </select>

        <select name="servico" value={novoAgendamento.servico} onChange={handleChange} required>
          <option value="MANICURE">Manicure</option>
          <option value="PEDICURE">Pedicure</option>
          <option value="CABELO">Cabelo</option>
          <option value="PODOLOGIA">Podologia</option>
          <option value="DEPILACAO">Depilação</option>
        </select>

        <input type="date" name="data" value={novoAgendamento.data} onChange={handleChange} required />
        <input type="time" name="hora" value={novoAgendamento.hora} onChange={handleChange} required />
        
        {/* Adicionando o campo de observação */}
        <input
          type="text"
          name="observacao"
          value={novoAgendamento.observacao}
          onChange={handleChange}
          placeholder="Tipo de serviço"
        />

        <button type="submit" disabled={loading}>{loading ? "Agendando..." : "Agendar"}</button>
      </form>

      <ul>
        {agendamentos.map(agendamento => (
          <li key={agendamento.id}>
            {agendamento.cliente?.nome || "Sem cliente"} - 
            {agendamento.profissional?.nome || "Sem profissional"} - 
            {agendamento.servico} - {agendamento.data} - {agendamento.hora}
            <button onClick={() => handleDelete(agendamento.id)} disabled={deletingId === agendamento.id}>
              {deletingId === agendamento.id ? "Excluindo..." : "Excluir"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}