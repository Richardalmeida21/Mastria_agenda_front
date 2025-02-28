export default function Login({ setUser }) {
  const handleLogin = () => {
    setUser({ name: "Usuário Teste" });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Login</h1>
      <button onClick={handleLogin} className="mt-4 p-2 bg-blue-500 text-white rounded">Entrar</button>
    </div>
  );
}