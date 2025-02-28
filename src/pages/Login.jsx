import { useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    const userData = { name: "Usuário Teste" };
    setUser(userData); // Define o usuário no estado
    localStorage.setItem("user", JSON.stringify(userData)); // Salva no localStorage
    navigate("/dashboard"); // Redireciona para o Dashboard
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Login</h1>
      <button onClick={handleLogin} className="mt-4 p-2 bg-blue-500 text-white rounded">
        Entrar
      </button>
    </div>
  );
}
