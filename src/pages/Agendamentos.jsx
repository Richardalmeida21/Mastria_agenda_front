import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [novoAgendamento, setNovoAgendamento] = useState({
    clienteId: "",
    profissionalId: "",
    servico: "MANICURE",
    data: "",
    hora: "",
  });
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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
          axios.get("
