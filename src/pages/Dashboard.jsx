import { Link, Outlet } from "react-router-dom";

export default function Dashboard({ user }) {
  if (!user) return <div>Acesso negado</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <nav className="mt-4 space-x-4">
        <Link to="agendamentos" className="text-blue-500">Agendamentos</Link>
        <Link to="clientes" className="text-blue-500">Clientes</Link>
        <Link to="profissionais" className="text-blue-500">Profissionais</Link>
      </nav>
      <Outlet />
    </div>
  );
}