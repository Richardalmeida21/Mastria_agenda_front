import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns"; // Importar funções necessárias
import { ptBR } from "date-fns/locale"; // Importar locale para formatação em português
import "../pages/styles/Agendamentos.css";
import "../pages/styles/Global.css"; 

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [novoAgendamento, setNovoAgendamento] = useState({
    clienteId: "",
    profissionalId: "",
    servico: "MANICURE",
    data: "",
    hora: "",
    observacao: "", 
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

        console.log("Agendamentos:", agendamentosRes.data);
        console.log("Clientes:", clientesRes.data);
        console.log("Profissionais:", profissionaisRes.data);

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
      setError(null); 
    }
  };

  const buscarAgendamentos = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get("https://mastriaagenda-production.up.railway.app/agendamento", { headers });
      console.log("Agendamentos atualizados:", response.data);
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

    const hoje = new Date();
    const dataAgendamento = new Date(`${novoAgendamento.data}T${novoAgendamento.hora}`);
    if (dataAgendamento < hoje) {
      setError("Por favor, agende para um horário futuro.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post("https://mastriaagenda-production.up.railway.app/agendamento", novoAgendamento, { headers });
      await buscarAgendamentos();
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

      await axios.delete(`https://mastriaagenda-production.up.railway.app/agendamento/${id}`, { headers });
      await buscarAgendamentos();
    } catch (error) {
      setError("Erro ao excluir agendamento.");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const renderAgendamentos = (agendamentos) => {
    const groupedAgendamentos = agendamentos.reduce((acc, agendamento) => {
      const date = agendamento.data;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(agendamento);
      return acc;
    }, {});

    return Object.keys(groupedAgendamentos).map((date) => (
      <div key={date} className="calendar-row">
        <div className="calendar-date">
          <p>AGENDAMENTOS: </p>
          {format(parseISO(date), "dd 'de' MMMM", { locale: ptBR })}
        </div>
        <div className="calendar-content">
          {groupedAgendamentos[date].map((agendamento) => (
            <div key={agendamento.id} className="calendar-item agendamento-item">
              <p>{agendamento.cliente?.nome || "Sem cliente"}</p>
              <p>{agendamento.profissional?.nome || "Sem profissional"}</p> {/* Adicionando o nome do profissional */}
              <p>{agendamento.servico}</p>
              <p>{agendamento.hora.slice(0, 5)}</p> {/* Formatação correta da hora */}
              <p>{agendamento.observacao}</p> {/* Adicionando a observação */}
              <button onClick={() => handleDelete(agendamento.id)} disabled={deletingId === agendamento.id}>
                {deletingId === agendamento.id ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="container-agendamentos">
      <h1>Agendamentos</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <form className="form-agendamentos" onSubmit={handleSubmit}>
        <h2>Crie um agendamento</h2>
        <div className="container-selects-agendamentos">
          <select name="clienteId" value={novoAgendamento.clienteId} onChange={handleChange} required>
            <option value="">Cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
            ))}
          </select>
          <select name="profissionalId" value={novoAgendamento.profissionalId} onChange={handleChange} required>
            <option value="">Profissional</option>
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
        </div>

        <div className="container-inputs-agendamentos">
          <input type="date" name="data" value={novoAgendamento.data} onChange={handleChange} required />
          <input type="time" name="hora" value={novoAgendamento.hora} onChange={handleChange} required />
          
          <input
            type="text"
            name="observacao"
            value={novoAgendamento.observacao}
            onChange={handleChange}
            placeholder="Descrição do Serviço"
          />
        </div>

        <button type="submit" disabled={loading}>{loading ? "Agendando..." : "Agendar Horario"}</button>
      </form>

      <div className="calendar">
        {renderAgendamentos(agendamentos)}
      </div>
    </div>
  );
}