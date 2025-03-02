import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("https://mastriaagenda-production.up.railway.app/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (err) {
        console.error("Erro ao buscar informações do usuário:", err);
        navigate("/login");
      }
    };

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Buscar agendamentos
        const agendamentosResponse = await axios.get("https://mastriaagenda-production.up.railway.app/agendamento", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAgendamentos(agendamentosResponse.data);

        // Buscar clientes
        const clientesResponse = await axios.get("https://mastriaagenda-production.up.railway.app/cliente", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClientes(clientesResponse.data);

        // Buscar profissionais
        const profissionaisResponse = await axios.get("https://mastriaagenda-production.up.railway.app/profissional", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfissionais(profissionaisResponse.data);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    };

    fetchUser();
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredAgendamentos = agendamentos.filter((agendamento) => {
    return (
      agendamento.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
      agendamento.profissional_nome.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Dashboard</h2>
      {user ? (
        <>
          <p>Bem-vindo, {user.nome}!</p>
          <p>Role: {user.role}</p>

          {user.role === "ADMIN" && (
            <>
              <p>Visualizando painel de administração:</p>
              <ul>
                <li>
                  <button
                    onClick={() => navigate("/profissionais")}
                    className="text-blue-500"
                  >
                    Gerenciar Profissionais
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/clientes")}
                    className="text-blue-500"
                  >
                    Gerenciar Clientes
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/agendamentos")}
                    className="text-blue-500"
                  >
                    Visualizar Agendamentos
                  </button>
                </li>
              </ul>
            </>
          )}

          <div className="mt-4">
            <h3 className="font-bold">Estatísticas Rápidas</h3>
            <ul>
              <li>Profissionais: {profissionais.length}</li>
              <li>Clientes: {clientes.length}</li>
              <li>Agendamentos: {agendamentos.length}</li>
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="font-bold">Filtrar Agendamentos</h3>
            <input
              type="text"
              placeholder="Pesquise por cliente ou profissional"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="mt-4">
            <h3 className="font-bold">Agendamentos Recentes</h3>
            <ul>
              {filteredAgendamentos.length > 0 ? (
                filteredAgendamentos.slice(0, 5).map((agendamento) => (
                  <li key={agendamento.id} className="border-b py-2">
                    Cliente: {agendamento.cliente_nome} | Profissional: {agendamento.profissional_nome} | Data: {agendamento.data}
                  </li>
                ))
              ) : (
                <li>Sem agendamentos encontrados.</li>
              )}
            </ul>
            <button
              onClick={() => navigate("/agendamentos")}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Ver mais agendamentos
            </button>
          </div>

          <div className="mt-4">
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Sair
            </button>
          </div>
        </>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
}
