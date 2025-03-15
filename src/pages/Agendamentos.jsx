import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pages/styles/Agendamentos.css";
import "../pages/styles/ModalMensagem.css";
import ModalMensagem from "./ModalMensagem"; 

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split("T")[0]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [mostrarFormularioCadastro, setMostrarFormularioCadastro] = useState(false);
  const [agendamentoDetalhes, setAgendamentoDetalhes] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [mostrarModalMensagem, setMostrarModalMensagem] = useState(false);
  const [mensagemModal, setMensagemModal] = useState("");
  const [tipoModal, setTipoModal] = useState("sucesso"); // "sucesso" ou "erro"
  const [novoAgendamento, setNovoAgendamento] = useState({
    clienteId: "",
    profissionalId: "",
    servico: "",
    data: dataSelecionada,
    hora: "",
    duracao: 30, // Duração em minutos
    observacao: "",
  });

  const [horariosOcupados, setHorariosOcupados] = useState({});
  const navigate = useNavigate();

  const servicosDisponiveis = ["MANICURE", "PEDICURE", "CABELO", "DEPILACAO", "PODOLOGIA"];

  // Função para formatar a duração (ex: "PT30M" -> "30 min")
  const formatarDuracao = (duracao) => {
    const minutos = duracao.replace("PT", "").replace("M", "");
    return `${minutos} min`;
  };

  // Função para exibir o modal de mensagem
  const exibirModalMensagem = (mensagem, tipo) => {
    setMensagemModal(mensagem);
    setTipoModal(tipo);
    setMostrarModalMensagem(true);
  };

  // Busca os dados dos agendamentos, profissionais e clientes
  const buscarDados = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setCarregando(true);
      setErro(null);

      const headers = { Authorization: `Bearer ${token}` };
      const [agendamentosRes, profissionaisRes, clientesRes] = await Promise.all([
        axios.get(`https://mastria-agenda.fly.dev/agendamento/dia?data=${dataSelecionada}`, { headers }),
        axios.get("https://mastria-agenda.fly.dev/profissional", { headers }),
        axios.get("https://mastria-agenda.fly.dev/cliente", { headers }),
      ]);

      setAgendamentos(agendamentosRes.data);
      setProfissionais(profissionaisRes.data);
      setClientes(clientesRes.data);

      // Calcula os horários ocupados
      const ocupados = calcularHorariosOcupados(agendamentosRes.data);
      setHorariosOcupados(ocupados);
    } catch (error) {
      console.error("Erro ao buscar os dados", error);
      setErro("Erro ao carregar os dados. Tente novamente mais tarde.");
    } finally {
      setCarregando(false);
    }
  };

  // Gera os horários disponíveis para agendamento
  const horarios = [];
  for (let h = 7; h < 20; h++) {
    for (let m = 0; m < 60; m += 5) {
      horarios.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`);
    }
  }

  // Função para calcular os horários ocupados
  const calcularHorariosOcupados = (agendamentos) => {
    const ocupados = {};

    agendamentos.forEach((agendamento) => {
      const horaInicio = agendamento.hora;
      const duracaoMinutos = parseInt(
        agendamento.duracao
          .replace("PT", "")
          .replace("H", "*60")
          .replace("M", "")
          .split("*")
          .reduce((a, b) => a * b, 1)
      );

      const [hora, minuto] = horaInicio.split(":").map(Number);
      const inicioTotalMinutos = hora * 60 + minuto;
      const fimTotalMinutos = inicioTotalMinutos + duracaoMinutos;

      for (let minutos = inicioTotalMinutos; minutos <= fimTotalMinutos; minutos += 5) {
        const horaFormatada = `${Math.floor(minutos / 60).toString().padStart(2, "0")}:${(minutos % 60).toString().padStart(2, "0")}:00`;

        if (!ocupados[agendamento.profissional.id]) {
          ocupados[agendamento.profissional.id] = new Set();
        }
        ocupados[agendamento.profissional.id].add(horaFormatada);
      }
    });

    return ocupados;
  };

  // Busca os dados ao carregar a página ou ao mudar a data selecionada
  useEffect(() => {
    buscarDados();
  }, [dataSelecionada]);

  // Função para exibir detalhes do agendamento
  const handleDetalhesAgendamento = (agendamento) => {
    setAgendamentoDetalhes(agendamento);
    setModoEdicao(false);
  };

  // Função para fechar o modal de detalhes
  const handleFecharDetalhes = () => {
    setAgendamentoDetalhes(null);
    setModoEdicao(false);
  };

  // Função para excluir um agendamento
  const handleExcluirAgendamento = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`https://mastria-agenda.fly.dev/agendamento/${id}`, { headers });
      buscarDados(); // Atualiza a lista de agendamentos
      handleFecharDetalhes(); // Fecha o modal
      exibirModalMensagem("Agendamento excluído com sucesso!", "sucesso");
    } catch (error) {
      console.error("Erro ao excluir agendamento", error);
      exibirModalMensagem("Erro ao excluir agendamento. Tente novamente.", "erro");
    }
  };

  // Função para entrar no modo de edição
  const handleEditarAgendamento = () => {
    setModoEdicao(true);
  };

  // Função para salvar as alterações do agendamento
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const dadosAtualizados = {
        clienteId: agendamentoDetalhes.cliente.id,
        profissionalId: agendamentoDetalhes.profissional.id,
        servico: agendamentoDetalhes.servico,
        data: agendamentoDetalhes.data,
        hora: agendamentoDetalhes.hora,
        duracao: agendamentoDetalhes.duracao,
        observacao: agendamentoDetalhes.observacao,
      };

      const response = await axios.put(
        `https://mastria-agenda.fly.dev/agendamento/${agendamentoDetalhes.id}`,
        dadosAtualizados,
        { headers }
      );

      console.log("Agendamento atualizado:", response.data);
      buscarDados(); // Atualiza a lista de agendamentos
      setModoEdicao(false); // Sai do modo de edição
      exibirModalMensagem("Agendamento atualizado com sucesso!", "sucesso");
    } catch (error) {
      console.error("Erro ao atualizar agendamento", error);
      exibirModalMensagem("Erro ao atualizar agendamento. Tente novamente.", "erro");
    }
  };

  // Função para abrir o formulário de cadastro ao clicar em uma célula disponível
  const handleSelecionarHorario = (hora, profissional) => {
    setNovoAgendamento({
      ...novoAgendamento,
      hora: hora,
      profissionalId: profissional.id,
    });
    setMostrarFormularioCadastro(true);
  };

  // Função para cadastrar um novo agendamento
  const handleCadastrarAgendamento = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Verifica se o horário já está ocupado
    const horarioOcupado = horariosOcupados[novoAgendamento.profissionalId]?.has(novoAgendamento.hora);
    if (horarioOcupado) {
      exibirModalMensagem("Erro: O horário selecionado já está ocupado.", "erro");
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Converte a duração para o formato ISO 8601
      const duracaoISO = `PT${novoAgendamento.duracao}M`;

      const response = await axios.post(
        "https://mastria-agenda.fly.dev/agendamento",
        { ...novoAgendamento, duracao: duracaoISO },
        { headers }
      );

      console.log("Agendamento cadastrado:", response.data);
      buscarDados(); // Atualiza a lista de agendamentos
      setMostrarFormularioCadastro(false); // Fecha o formulário
      exibirModalMensagem("Agendamento cadastrado com sucesso!", "sucesso");
    } catch (error) {
      console.error("Erro ao cadastrar agendamento", error);
      exibirModalMensagem("O horário selecionado já está ocupado.", "erro");
    }
  };

  // Renderização condicional para carregamento e erro
  if (carregando) {
    return <div>Carregando...</div>;
  }

  if (erro) {
    return <div className="erro">{erro}</div>;
  }

  return (
    <div className="agendamento-container">
      <div className="filtro-container">
        <h2>Confira os agendamentos</h2>
        <div className="filtro-container-input">
          <input
            type="date"
            className="date-picker"
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
          />
        </div>
      </div>
      <div className="table-wrapper">
        <table className="agendamento-table">
          <thead>
            <tr>
              <th>Horários</th>
              {profissionais.map((profissional) => (
                <th key={profissional.id}>{profissional.nome}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horarios.map((hora) => (
              <tr key={hora}>
                <td className="time-column">{hora}</td>
                {profissionais.map((profissional) => {
                  const isOcupado = horariosOcupados[profissional.id]?.has(hora);
                  const agendamento = agendamentos.find((a) => {
                    const horaInicio = a.hora;
                    const duracaoMinutos = parseInt(
                      a.duracao
                        .replace("PT", "")
                        .replace("H", "*60")
                        .replace("M", "")
                        .split("*")
                        .reduce((a, b) => a * b, 1)
                    );

                    const [horaInicioH, horaInicioM] = horaInicio.split(":").map(Number);
                    const inicioTotalMinutos = horaInicioH * 60 + horaInicioM;
                    const fimTotalMinutos = inicioTotalMinutos + duracaoMinutos;

                    const [horaAtualH, horaAtualM] = hora.split(":").map(Number);
                    const horaAtualTotalMinutos = horaAtualH * 60 + horaAtualM;

                    return (
                      a.profissional.id === profissional.id &&
                      horaAtualTotalMinutos >= inicioTotalMinutos &&
                      horaAtualTotalMinutos < fimTotalMinutos
                    );
                  });

                  const isPrimeiraCelula = agendamento?.hora === hora;

                  return (
                    <td
                      key={profissional.id}
                      className={`${isOcupado ? "ocupado" : "available"}`}
                      onClick={() => {
                        if (isOcupado && agendamento) {
                          handleDetalhesAgendamento(agendamento);
                        } else if (!isOcupado) {
                          handleSelecionarHorario(hora, profissional);
                        }
                      }}
                    >
                      {isPrimeiraCelula
                        ? `${agendamento.cliente.nome} - ${agendamento.servico}`
                        : isOcupado
                        ? ""
                        : "Disponível"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes do Agendamento */}
      {agendamentoDetalhes && (
        <div className="modal-overlay">
          <div className="modal">
            {modoEdicao ? (
              // Formulário de Edição
              <form onSubmit={handleSalvarEdicao}>
                <h3>Editar Agendamento</h3>
                <div>
                  <label>Cliente</label>
                  <select
                    value={agendamentoDetalhes.cliente.id}
                    onChange={(e) =>
                      setAgendamentoDetalhes({
                        ...agendamentoDetalhes,
                        cliente: { ...agendamentoDetalhes.cliente, id: e.target.value },
                      })
                    }
                    required
                  >
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Serviço</label>
                  <select
                    value={agendamentoDetalhes.servico}
                    onChange={(e) =>
                      setAgendamentoDetalhes({
                        ...agendamentoDetalhes,
                        servico: e.target.value,
                      })
                    }
                    required
                  >
                    {servicosDisponiveis.map((servico) => (
                      <option key={servico} value={servico}>
                        {servico}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Observações</label>
                  <textarea
                    value={agendamentoDetalhes.observacao}
                    onChange={(e) =>
                      setAgendamentoDetalhes({
                        ...agendamentoDetalhes,
                        observacao: e.target.value,
                      })
                    }
                    placeholder="Observações adicionais"
                  />
                </div>
                <div className="modal-botoes">
                  <button type="submit">Salvar</button>
                  <button type="button" onClick={() => setModoEdicao(false)}>
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              // Detalhes do Agendamento
              <>
                <h3>Detalhes do Agendamento</h3>
                <p><strong>Cliente:</strong> {agendamentoDetalhes.cliente.nome}</p>
                <p><strong>Serviço:</strong> {agendamentoDetalhes.servico}</p>
                <p><strong>Horário:</strong> {agendamentoDetalhes.hora}</p>
                <p><strong>Duração:</strong> {formatarDuracao(agendamentoDetalhes.duracao)}</p>
                <p><strong>Observações:</strong> {agendamentoDetalhes.observacao}</p>
                <div className="modal-botoes">
                  <button onClick={handleEditarAgendamento}>Editar</button>
                  <button onClick={() => handleExcluirAgendamento(agendamentoDetalhes.id)}>
                    Excluir
                  </button>
                  <button onClick={handleFecharDetalhes}>Fechar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Novo Agendamento */}
      {mostrarFormularioCadastro && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cadastrar Novo Agendamento</h3>
            <form onSubmit={handleCadastrarAgendamento}>
              <div>
                <label>Cliente</label>
                <select
                  value={novoAgendamento.clienteId}
                  onChange={(e) =>
                    setNovoAgendamento({ ...novoAgendamento, clienteId: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Serviço</label>
                <select
                  value={novoAgendamento.servico}
                  onChange={(e) =>
                    setNovoAgendamento({ ...novoAgendamento, servico: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {servicosDisponiveis.map((servico) => (
                    <option key={servico} value={servico}>
                      {servico}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Duração (minutos)</label>
                <input
                  type="number"
                  value={novoAgendamento.duracao}
                  onChange={(e) =>
                    setNovoAgendamento({ ...novoAgendamento, duracao: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <label>Observações</label>
                <textarea
                  value={novoAgendamento.observacao}
                  onChange={(e) =>
                    setNovoAgendamento({ ...novoAgendamento, observacao: e.target.value })
                  }
                  placeholder="Observações adicionais"
                />
              </div>
              <div className="modal-botoes">
                <button type="submit">Salvar</button>
                <button type="button" onClick={() => setMostrarFormularioCadastro(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Mensagem */}
      {mostrarModalMensagem && (
        <ModalMensagem
          mensagem={mensagemModal}
          tipo={tipoModal}
          onFechar={() => setMostrarModalMensagem(false)}
        />
      )}
    </div>
  );
}