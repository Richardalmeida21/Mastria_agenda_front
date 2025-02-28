import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://mastriaagenda-production.up.railway.app/login", {
        username,
        senha,
      });

      console.log("Resposta da API:", response.data); // Exibir a resposta da API

      // Extraindo o token corretamente
      const token = response.data.token || response.data["token"];
      console.log("Token recebido:", token);

      if (token) {
        localStorage.setItem("token", token);
        // Agora, ao fazer uma requisição subsequente, você precisa enviar o token
        const userResponse = await axios.get("https://mastriaagenda-production.up.railway.app/protected-endpoint", {
          headers: {
            Authorization: `Bearer ${token}` // Enviando o token no cabeçalho de autorização
          }
        });
        console.log("Resposta do endpoint protegido:", userResponse.data);
      } else {
        setError("Erro: Token não recebido corretamente.");
      }
    } catch (err) {
      setError("Login falhou. Verifique suas credenciais.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={handleLogin} className="mt-4 space-y-4">
        <input 
          type="text" 
          placeholder="Usuário" 
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
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Entrar
        </button>
      </form>
    </div>
  );
}
