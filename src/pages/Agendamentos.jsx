import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { format, addMinutes, startOfDay, endOfDay } from "date-fns";
import Modal from "react-modal";
import "../pages/styles/Agendamentos.css";
import "../pages/styles/Global.css"; 

Modal.setAppElement("#root");

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
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
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
      setSelectedSlot(null);
      setModalIsOpen(false);
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

  const generateTimeSlots = () => {
    const slots = [];
    let start = startOfDay(new Date());
    start.setHours(7, 0, 0, 0);
    const end = endOfDay(new Date());
    end.setHours(20, 0, 0, 0);

    while (start <= end) {
      slots.push(format(start, "HH:mm"));
      start = addMinutes(start, 5);
    }

    return slots;
  };

  const handleSlotClick = (profissionalId, slot) => {
    setSelectedSlot({ profissionalId, slot });
    setNovoAgendamento({ ...novoAgendamento, profissionalId, hora: slot });
    setModalIsOpen(true);
  };

  const renderAgendamentos = () => {
    const timeSlots = generateTimeSlots();

    return (
      <table className="tabela-agendamentos">
        <thead>
          <tr>
            <th>Horário</th>
            {profissionais.map((profissional) => (
              <th key={profissional.id}>{profissional.nome}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={slot}>
              <td>{slot}</td>
              {profissionais.map((profissional) => {
                const agendamento = agendamentos.find(
                  (a) => a.profissionalId === profissional.id && a.hora === slot
                );
                return (
                  <td key={profissional.id} className={agendamento ? "agendado" : ""} onClick={() => handleSlotClick(profissional.id, slot)}>
                    {agendamento ? (
                      <div>
                        <p>{agendamento.cliente?.nome}</p>
                        <p>{agendamento.servico}</p>
                        <button onClick={() => handleDelete(agendamento.id)} disabled={deletingId === agendamento.id}>
                          {deletingId === agendamento.id ? "Excluindo..." : "Excluir"}
                        </button>
                      </div>
                    ) : (
                      ""
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container-agendamentos">
      <h1>Agendamentos</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <div className="calendar">
        {renderAgendamentos()}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Agendar Horário"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <button className="close-button" onClick={() => setModalIsOpen(false)}>X</button>
        <h2>Agendar Horário</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="date"
            name="data"
            value={novoAgendamento.data}
            onChange={handleChange}
            required
          />
          <select name="clienteId" value={novoAgendamento.clienteId} onChange={handleChange} required>
            <option value="">Cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
            ))}
          </select>
          <select name="servico" value={novoAgendamento.servico} onChange={handleChange} required>
            <option value="MANICURE">Manicure</option>
            <option value="PEDICURE">Pedicure</option>
            <option value="CABELO">Cabelo</option>
            <option value="PODOLOGIA">Podologia</option>
            <option value="DEPILACAO">Depilação</option>
          </select>
          <input
            type="text"
            name="observacao"
            value={novoAgendamento.observacao}
            onChange={handleChange}
            placeholder="Descrição do Serviço"
          />
          <button type="submit" disabled={loading}>{loading ? "Agendando..." : "Agendar"}</button>
        </form>
      </Modal>
    </div>
  );
}