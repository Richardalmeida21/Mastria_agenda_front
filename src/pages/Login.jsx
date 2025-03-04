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
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-gold mb-6">Maestria</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button
            type="submit"
            className="w-full py-3 bg-gold text-black font-bold rounded-md hover:bg-gold-dark focus:outline-none focus:ring-2 focus:ring-gold"
            disabled={loading}
          >
            {loading ? "Carregando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
