import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { format, addDays, parseISO, compareAsc } from "date-fns";
import "../pages/styles/ListAgendamentos.css"; // Importar o arquivo CSS

export default function AgendamentosProfissional() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [filteredAgendamentos, setFilteredAgendamentos] = useState([]);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [showNext7Days, setShowNext7Days] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Obter o ID do profissional a partir dos parâmetros da URL

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Verifica se o usuário não está autenticado
    if (!token) {
      navigate("/login");
      return;
    }

    // Função para buscar os agendamentos do profissional
    const buscarAgendamentos = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Faz a requisição para obter os agendamentos do profissional
        const response = await axios.get(
          `https://mastriaagenda-production.up.railway.app/agendamento/profissional`,
          { headers }
        );

        const sortedAgendamentos = response.data.sort((a, b) => compareAsc(parseISO(a.data), parseISO(b.data)));
        setAgendamentos(sortedAgendamentos);
        setFilteredAgendamentos(sortedAgendamentos);
      } catch (error) {
        setError("Erro ao buscar os agendamentos.");
        console.error(error);
      }
    };

    buscarAgendamentos();
  }, [navigate, id]);

  const handleFilterChange = (e) => {
    const date = e.target.value;
    setFilterDate(date);

    if (date) {
      const filtered = agendamentos.filter(agendamento => agendamento.data === date);
      setFilteredAgendamentos(filtered);
    } else {
      setFilteredAgendamentos(agendamentos);
    }
  };

  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      days.push(format(date, 'yyyy-MM-dd'));
    }
    return days;
  };

  const handleShowNext7Days = () => {
    const next7Days = getNext7Days();
    const filtered = agendamentos.filter(agendamento => next7Days.includes(agendamento.data));
    setFilteredAgendamentos(filtered);
    setShowNext7Days(true);
  };

  const handleShowAll = () => {
    setFilteredAgendamentos(agendamentos);
    setShowNext7Days(false);
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
        <div className="calendar-date">{format(parseISO(date), 'dd MMM')}</div>
        <div className="calendar-content">
          {groupedAgendamentos[date].map((agendamento) => (
            <div key={agendamento.id} className="calendar-item">
              <p>{agendamento.cliente?.nome || "Sem cliente"}</p>
              <p>{agendamento.servico}</p>
              <p>{agendamento.hora}</p>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div>
      <h1>Seus Agendamentos</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="filter-container">
        <label htmlFor="filter-date">Filtrar por data:</label>
        <input
          type="date"
          id="filter-date"
          value={filterDate}
          onChange={handleFilterChange}
        />
        <button onClick={handleShowNext7Days}>Próximos 7 dias</button>
        <button onClick={handleShowAll}>Mostrar todos</button>
      </div>

      <div className="calendar">
        {showNext7Days ? renderAgendamentos(filteredAgendamentos) : renderAgendamentos(filteredAgendamentos)}
      </div>
    </div>
  );
}