import styles from "../pages/styles/Login.module.css"; // Importe o CSS Module
import "../pages/styles/Global.css"; // Estilos globais (se necessário)
import logo from "../pages/images/logo_maestria.png";

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("https://mastria-agenda.fly.dev/auth/login", {
        username,
        senha,
      });

      const token = response.data.token;
      if (token) {
        localStorage.setItem("token", token);

        // Busca informações do usuário autenticado
        const userResponse = await axios.get("https://mastria-agenda.fly.dev/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        localStorage.setItem("user", JSON.stringify(userResponse.data));

        console.log("User role:", userResponse.data.role); // Verifique se está vindo o role corretamente.

        // Verificação do role do usuário para redirecionamento
        const userRole = userResponse.data.role ? userResponse.data.role.trim().toUpperCase() : "";

        if (userRole === "ADMIN") {
          console.log("Redirecionando para o Dashboard...");
          navigate("/dashboard"); // Certifique-se de que "/dashboard" é a rota correta
        } else if (userRole === "PROFISSIONAL") {
          console.log("Redirecionando para a página de agendamentos...");
          navigate(`/agendamentos-profissional/${userResponse.data.id}`); // Certifique-se de que a URL está correta
        } else {
          setError("Erro: Usuário não autorizado.");
        }
      } else {
        setError("Erro: Token não recebido corretamente.");
      }
    } catch (err) {
      console.error("Erro:", err);
      if (err.response && err.response.data) {
        setError(`Erro: ${err.response.data.message || "Login falhou."}`);
      } else {
        setError("Erro de conexão. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className={styles.containerLogin}>
        <div className={styles.containerLogo}>
          <img src={logo} alt="Logo Maestria" />
          <div className={styles.textLogo}>
            <h2>Welcome back!</h2>
          </div>
        </div>
        <form onSubmit={handleLogin} className={styles.form}>
          <h2>SING IN</h2>
          <input
            type="text"
            placeholder="Digite seu username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className={styles.button}
          >
            {loading ? "Carregando..." : "Entrar"}
          </button>
          {error && <p className={styles.erroConexao}>{error}</p>}
        </form>
      </div>
  );
}