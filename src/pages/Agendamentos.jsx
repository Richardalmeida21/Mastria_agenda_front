import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pages/styles/Agendamentos.css";

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split("T")[0]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [mostrarFormularioCadastro, setMostrarFormularioCadastro] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [servicoSelecionado, setServicoSelecionado] = useState("");
  const [observacao, setObservacao] = useState("");
  const [duracao, setDuracao] = useState(30); // Duração padrão de 30 minutos
  const [horariosOcupados, setHorariosOcupados] = useState({}); // Estado para horários ocupados
  const [agendamentoDetalhes, setAgendamentoDetalhes] = useState(null); // Estado para o agendamento selecionado
  const [modoEdicao, setModoEdicao] = useState(false); // Estado para controlar o modo de edição
  const [novoAgendamento, setNovoAgendamento] = useState({
    clienteId: "",
    profissionalId: "",
    servico: "",
    data: dataSelecionada,
    hora: "",
    duracao: 30,
    observacao: "",
  });
  const navigate = useNavigate();

  const servicosDisponiveis = [
    "MANICURE", "PEDICURE", "CABELO", "DEPILACAO", "PODOLOGIA"
  ];

  // Função para formatar a duração (ex: "PT30M" -> "30 min")
  const formatarDuracao = (duracao) => {
    const minutos = duracao.replace("PT", "").replace("M", "");
    return `${minutos} min`;
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

      // Calcula os horários ocupados após carregar os agendamentos
      const ocupados = calcularHorariosOcupados(agendamentosRes.data);
      setHorariosOcupados(ocupados);
    } catch (error) {
      console.error("Erro ao buscar os dados", error);
      setErro("Erro ao carregar os dados. Tente novamente mais tarde.");
    } finally {
      setCarregando(false);
    }
  };

  // Busca os dados ao carregar a página ou ao mudar a data selecionada
  useEffect(() => {
    buscarDados();
  }, [dataSelecionada]);

  // Gera os horários disponíveis para agendamento
  const horarios = [];
  for (let h = 7; h < 20; h++) {
    for (let m = 0; m < 60; m += 5) {
      horarios.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`);
    }
  }

  // Função para calcular os horários ocupados com base na duração
  const calcularHorariosOcupados = (agendamentos) => {
    const ocupados = {};

    agendamentos.forEach((agendamento) => {
      const horaInicio = agendamento.hora; // Formato "HH:MM:SS"
      const duracaoMinutos = parseInt(
        agendamento.duracao
          .replace("PT", "")
          .replace("H", "*60")
          .replace("M", "")
          .split("*")
          .reduce((a, b) => a * b, 1)
      );

      const [hora, minuto] = horaInicio.split(":").map(Number);
      const inicioTotalMinutos = hora * 60 + minuto; // Converte horário para minutos
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

  // Função para exibir detalhes do agendamento
  const handleDetalhesAgendamento = (agendamento) => {
    setAgendamentoDetalhes(agendamento); // Define o agendamento selecionado
    setModoEdicao(false); // Reseta o modo de edição
  };

  // Função para fechar o modal de detalhes
  const handleFecharDetalhes = () => {
    setAgendamentoDetalhes(null); // Fecha o modal
    setModoEdicao(false); // Reseta o modo de edição
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
      alert("Agendamento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir agendamento", error);
      alert("Erro ao excluir agendamento. Tente novamente.");
    }
  };

  // Função para entrar no modo de edição
  const handleEditarAgendamento = () => {
    setModoEdicao(true); // Ativa o modo de edição
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
      alert("Agendamento atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar agendamento", error);
      alert("Erro ao atualizar agendamento. Tente novamente.");
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

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.post(
        "https://mastria-agenda.fly.dev/agendamento",
        novoAgendamento,
        { headers }
      );

      console.log("Agendamento cadastrado:", response.data);
      buscarDados(); // Atualiza a lista de agendamentos
      setMostrarFormularioCadastro(false); // Fecha o formulário
      alert("Agendamento cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar agendamento", error);
      alert("Erro ao cadastrar agendamento. Tente novamente.");
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
                    const horaInicio = a.hora; // Horário de início do agendamento
                    const duracaoMinutos = parseInt(
                      a.duracao
                        .replace("PT", "")
                        .replace("H", "*60")
                        .replace("M", "")
                        .split("*")
                        .reduce((a, b) => a * b, 1)
                    );

                    const [horaInicioH, horaInicioM] = horaInicio.split(":").map(Number);
                    const inicioTotalMinutos = horaInicioH * 60 + horaInicioM; // Converte horário de início para minutos
                    const fimTotalMinutos = inicioTotalMinutos + duracaoMinutos; // Calcula o horário de término

                    const [horaAtualH, horaAtualM] = hora.split(":").map(Number);
                    const horaAtualTotalMinutos = horaAtualH * 60 + horaAtualM; // Converte horário clicado para minutos

                    // Verifica se o horário clicado está dentro do intervalo do agendamento
                    return (
                      a.profissional.id === profissional.id &&
                      horaAtualTotalMinutos >= inicioTotalMinutos &&
                      horaAtualTotalMinutos < fimTotalMinutos
                    );
                  });

                  // Verifica se a célula atual é a primeira do agendamento (horário de início)
                  const isPrimeiraCelula = agendamento?.hora === hora;

                  return (
                    <td
                      key={profissional.id}
                      className={`${isOcupado ? "ocupado" : "available"}`}
                      onClick={() => {
                        if (isOcupado && agendamento) {
                          handleDetalhesAgendamento(agendamento); // Abre o modal de detalhes
                        } else if (!isOcupado) {
                          handleSelecionarHorario(hora, profissional); // Abre o formulário de cadastro
                        }
                      }}
                    >
                      {isPrimeiraCelula
                        ? `${agendamento.cliente.nome} - ${agendamento.servico}` // Exibe nome e serviço apenas na primeira célula
                        : isOcupado
                        ? "" // Células ocupadas (não início) ficam vazias
                        : "Disponível"} {/* Células disponíveis exibem "Disponível" */}
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
    </div>
  );
}