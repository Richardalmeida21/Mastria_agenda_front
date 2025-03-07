import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Agendamentos from "./pages/Agendamentos";
import Clientes from "./pages/Clientes";
import Profissionais from "./pages/Profissionais";
import AgendamentosProfissional from "./pages/ListAgendamentos";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página de Login */}
        <Route path="/" element={<Login />} />

        {/* Dashboard com subpáginas */}
        <Route path="/dashboard" element={<Dashboard />} >
          <Route path="agendamentos" element={<Agendamentos />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="profissionais" element={<Profissionais />} />
        </Route>

        {/* Página de agendamentos do profissional */}
        <Route path="/agendamentos-profissional/:id" element={<AgendamentosProfissional />} />
      </Routes>
    </Router>
  );
}

export default App;
