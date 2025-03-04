import "../pages/styles/Login.css";
import "../pages/styles/Global.css";
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
      const response = await axios.post("https://mastriaagenda-production.up.railway.app/auth/login", {
        username,
        senha,
      });

      const token = response.data.token;
      if (token) {
        localStorage.setItem("token", token);

        // Busca informações do usuário autenticado
        const userResponse = await axios.get("https://mastriaagenda-production.up.railway.app/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        localStorage.setItem("user", JSON.stringify(userResponse.data));
        navigate("/dashboard");
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
    <div className="container">
      <div className="container-login">
        <div className="container-logo">
          <img src={logo} alt="" />
          <div className="text-logo">
            <h2>Olá profissional maestria</h2>
            <h3>Seja Bem-vinda!</h3>
          </div>
          </div>

        <form onSubmit={handleLogin}>
          <h2>Realize o Login para continuar</h2>
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
            className=""
          />
          <button
            type="submit"
            className=""
            disabled={loading}
          >
            {loading ? "Carregando..." : "Entrar"}
          </button>
          {error && <p className="erro-conexao">{error}</p>}
        </form>
      </div>
    </div>
  );
}
