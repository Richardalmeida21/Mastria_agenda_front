import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../pages/styles/Agendamentos.module.css"; // Importa o CSS Module
import { useNavigate } from "react-router-dom";

export default function Agendamentos() {
  const [profissionais, setProfissionais] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]); // Estado que mantém os agendamentos
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [agendamentoData, setAgendamentoData] = useState({
    clienteNome: "",
    clienteTelefone: "",
    clienteEmail: "",
    profissionalId: null,
    hora: "",
  });
  const [currentDate, setCurrentDate] = useState(new Date()); // Estado para a data atual
  const [currentDateFormatted, setCurrentDateFormatted] = useState(""); // Estado para a data formatada
  const navigate = useNavigate();

  // Função para buscar os agendamentos e os profissionais
  const fetchAgendamentos = async () => {
    try {
      setLoading(true); // Marca como carregando enquanto busca dados
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Token não encontrado, redirecionando para o login...");
        navigate("/login"); // Redireciona caso o token esteja ausente
        return;
      }

      const profissionaisResponse = await axios.get(
        "https://mastriaagenda-production.up.railway.app/profissional", {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfissionais(profissionaisResponse.data);

      // Log para ver a data que estamos buscando
      console.log("Buscando agendamentos para a data:", currentDateFormatted);

      const agendamentosResponse = await axios.get(
        `https://mastriaagenda-production.up.railway.app/agendamento?data=${currentDateFormatted}`, {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAgendamentos(agendamentosResponse.data); // Atualiza os agendamentos com a resposta da API
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setLoading(false); // Marca como não carregando depois de buscar os dados
    }
  };

  // Usamos um useEffect para garantir que a data formatada é atualizada
  useEffect(() => {
    const formattedDate = currentDate.toISOString().split("T")[0];
    setCurrentDateFormatted(formattedDate); // Atualiza a data formatada para o formato correto
  }, [currentDate]);

  // A requisição de agendamentos só acontece quando a data formatada for alterada
  useEffect(() => {
    if (currentDateFormatted) {
      setAgendamentos([]); // Limpa os agendamentos antigos ao mudar a data
      fetchAgendamentos(); // Chama a função para buscar os agendamentos para a nova data
    }
  }, [currentDateFormatted]); // Dependência da data formatada

  // Função para comparar hora no formato correto
  const getAgendamentoForTime = (profissionalId, hora) => {
    return agendamentos.find(
      (agendamento) => {
        const agendamentoHora = agendamento.hora ? agendamento.hora.substring(0, 5) : null;
        return agendamento.profissional.id === profissionalId && agendamentoHora === hora;
      }
    );
  };

  // Função que renderiza a tabela
  const renderTabela = () => {
    const horarios = [];
    for (let h = 7; h <= 20; h++) {
      for (let m = 0; m < 60; m += 5) {
        const horaFormatada = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        horarios.push(horaFormatada);
      }
    }

    return (
      <table className={styles.agendamentosTabela}>
        <thead>
          <tr>
            <th>Horário</th>
            {profissionais.map((profissional) => (
              <th key={profissional.id}>{profissional.nome}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horarios.map((hora) => (
            <tr key={hora}>
              <td>{hora}</td>
              {profissionais.map((profissional) => {
                const agendamento = getAgendamentoForTime(profissional.id, hora);
                return (
                  <td
                    key={profissional.id}
                    className={styles.agendamentoCell}
                    onClick={() => handleCellClick(profissional.id, hora, agendamento)}
                  >
                    {agendamento ? (
                      <div className={styles.agendamentoInfo}>
                        <p>{agendamento.cliente.nome}</p>
                        <p>{agendamento.observacao}</p>
                      </div>
                    ) : (
                      <span>Disponível</span>
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

  // Função de clique na célula da tabela
  const handleCellClick = (profissionalId, hora, agendamento) => {
    if (!agendamento) {
      setAgendamentoData({
        ...agendamentoData,
        profissionalId,
        hora,
      });
      setShowModal(true);
    }
  };

  // Função para lidar com a mudança de valores no formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAgendamentoData({
      ...agendamentoData,
      [name]: value,
    });
  };

  // Função para agendar
  const handleAgendar = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://mastriaagenda-production.up.railway.app/agendamento",
        {
          clienteId: agendamentoData.clienteId,
          profissionalId: agendamentoData.profissionalId,
          hora: agendamentoData.hora,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Agendamento criado com sucesso!");
      setShowModal(false);
      fetchAgendamentos(); // Recarregar agendamentos após o agendamento
    } catch (error) {
      console.error("Erro ao agendar:", error);
      alert("Erro ao criar agendamento");
    }
  };

  // Função para fechar o modal
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.agendamentosContainer}>
      <h2>Agendamentos</h2>
      <div className={styles.dateNavigation}>
        <DatePicker
          selected={currentDate}
          onChange={(date) => setCurrentDate(date)}
          dateFormat="dd/MM/yyyy"
          className={styles.datePicker}
        />
      </div>
      {loading ? <p className="aviso-carregando">Carregando...</p> : renderTabela()}

      {showModal && (
        <div className={styles.agendamentoModal}>
          <div className={styles.agendamentoModalContent}>
            <h3>Agendar Atendimento</h3>
            <form onSubmit={handleAgendar}>
              <div>
                <label>Nome do Cliente:</label>
                <input
                  type="text"
                  name="clienteNome"
                  value={agendamentoData.clienteNome}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Telefone do Cliente:</label>
                <input
                  type="text"
                  name="clienteTelefone"
                  value={agendamentoData.clienteTelefone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Email do Cliente:</label>
                <input
                  type="email"
                  name="clienteEmail"
                  value={agendamentoData.clienteEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit">Confirmar Agendamento</button>
              <button type="button" onClick={closeModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}