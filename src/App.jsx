import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Agendamentos from "./pages/Agendamentos";
import Clientes from "./pages/Clientes";
import Profissionais from "./pages/Profissionais";

function App() {
  const [user, setUser] = useState({ name: "Usuário Teste" }); // Simula um login

  return (
    <Router>
      <Routes>
        {/* Página de Login */}
        <Route path="/" element={<Login setUser={setUser} />} />

        {/* Dashboard com subpáginas */}
        <Route path="/dashboard" element={<Dashboard user={user} />}>
          <Route path="agendamentos" element={<Agendamentos />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="profissionais" element={<Profissionais />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
