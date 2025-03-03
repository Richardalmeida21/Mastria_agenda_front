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
  });
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Enviar o novo agendamento para o backend
      const response = await axios.post("https://mastriaagenda-production.up.railway.app/agendamento", novoAgendamento, { headers });

      // Atualizar a lista de agendamentos localmente sem recarregar a página
      setAgendamentos([...agendamentos, response.data]);

      // Resetar o formulário
      setNovoAgendamento({ clienteId: "", profissionalId: "", servico: "MANICURE", data: "", hora: "" });
    } catch (error) {
      setError("Erro ao criar agendamento.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Excluir o agendamento no backend
      await axios.delete(`https://mastriaagenda-production.up.railway.app/agendamento/${id}`, { headers });

      // Remover o agendamento excluído da lista localmente
      setAgendamentos(agendamentos.filter(agendamento => agendamento.id !== id));
    } catch (error) {
      setError("Erro ao excluir agendamento.");
      console.error(error);
    } finally {
      setLoading(false);
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
        </select>

        <input type="date" name="data" value={novoAgendamento.data} onChange={handleChange} required />
        <input type="time" name="hora" value={novoAgendamento.hora} onChange={handleChange} required />

        <button type="submit" disabled={loading}>{loading ? "Agendando..." : "Agendar"}</button>
      </form>

      <ul>
        {agendamentos.map(agendamento => (
          <li key={agendamento.id}>
            {agendamento.cliente?.nome || "Sem cliente"} - 
            {agendamento.profissional?.nome || "Sem profissional"} - 
            {agendamento.servico} - {agendamento.data} - {agendamento.hora}
            <button onClick={() => handleDelete(agendamento.id)} disabled={loading}>
              {loading ? "Excluindo..." : "Excluir"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
