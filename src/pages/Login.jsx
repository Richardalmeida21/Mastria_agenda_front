import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://mastriaagenda-production.up.railway.app/auth/login", {
        username,
        senha,
      });

      const token = response.data.token;
      if (token) {
        localStorage.setItem("token", token);

        // Busca informações do usuário autenticado
        const userResponse = await axios.get("https://mastriaagenda-production.up.railway.app/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        localStorage.setItem("user", JSON.stringify(userResponse.data));
        navigate("/dashboard");
      } else {
        setError("Erro: Token não recebido corretamente.");
      }
    } catch (err) {
      setError("Login falhou. Verifique suas credenciais.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Login</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleLogin} className="mt-4 space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
      </form>
   import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://mastriaagenda-production.up.railway.app/auth/login", {
        username,
        senha,
      });

      const token = response.data.token;
      if (token) {
        localStorage.setItem("token", token);

        // Busca informações do usuário autenticado
        const userResponse = await axios.get("https://mastriaagenda-production.up.railway.app/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        localStorage.setItem("user", JSON.stringify(userResponse.data));
        navigate("/dashboard");
      } else {
        setError("Erro: Token não recebido corretamente.");
      }
    } catch (err) {
      setError("Login falhou. Verifique suas credenciais.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Login</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleLogin} className="mt-4 space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
      </form>
   
