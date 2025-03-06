import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { format, addDays, parseISO, compareAsc } from "date-fns";
import { ptBR } from 'date-fns/locale';
import "../pages/styles/ListAgendamentos.css"; // Importar o arquivo CSS

export default function AgendamentosProfissional() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [filteredAgendamentos, setFilteredAgendamentos] = useState([]);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [showNext7Days, setShowNext7Days] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams(); // Obter o ID do profissional a partir dos parâmetros da URL

  useEffect(() => {
    document.body.classList.add('list-agendamentos');
    return () => {
      document.body.classList.remove('list-agendamentos');
    };
  }, []);

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

        // Recuperar observações do localStorage
        const storedObservacoes = JSON.parse(localStorage.getItem("observacoes")) || {};

        // Combinar observações com agendamentos
        const agendamentosComObservacoes = sortedAgendamentos.map(agendamento => ({
          ...agendamento,
          observacao: storedObservacoes[agendamento.id] || agendamento.observacao || "Sem observação"
        }));

        setAgendamentos(agendamentosComObservacoes);
        setFilteredAgendamentos(agendamentosComObservacoes);
      } catch (error) {
        setError("Erro ao buscar os agendamentos.");
        console.error(error);
      }
    };

    // Função para buscar as informações do usuário
    const fetchUser = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Faz a requisição para obter as informações do usuário
        const response = await axios.get(
          `https://mastriaagenda-production.up.railway.app/auth/me`,
          { headers }
        );

        setUser(response.data);
      } catch (err) {
        console.error("Erro ao buscar informações do usuário:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    buscarAgendamentos();
    fetchUser();
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
        <div className="calendar-date">
          <p>AGENDAMENTOS: </p>
          {format(parseISO(date), "dd 'de' MMMM", { locale: ptBR })}
        </div>
        <div className="calendar-content">
          {groupedAgendamentos[date].map((agendamento) => (
            <div key={agendamento.id} className="calendar-item">
              <p>{agendamento.cliente?.nome || "Sem cliente"}</p>
              <p>{agendamento.servico}</p>
              <p>{agendamento.hora.slice(0, 5)}</p> {/* Formatação correta da hora */}
              <p>{agendamento.observacao}</p> {/* Adicionando a observação */}
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div>
      <header>
        {user ? (
          <h2>Bem-vinda, {user.nome}!</h2>
        ) : (
          <p>Carregando...</p>
        )}
        <h2>CONFIRA SEUS AGENDAMENTOS</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </header>

      <div className="filter-container">
        <label htmlFor="filter-date">Filtrar Agendamentos</label>
        <input
          type="date"
          id="filter-date"
          value={filterDate}
          onChange={handleFilterChange}
        />
        <div className="container-btn">
          <button onClick={handleShowNext7Days}>Próximos 7 dias</button>
          <button onClick={handleShowAll}>Mostrar todos</button>
        </div>
      </div>

      <div className="calendar">
        {renderAgendamentos(filteredAgendamentos)}
      </div>
    </div>
  );
}