import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Dashboard</h2>
      {user && <p>Bem-vindo, {user.nome}!</p>}
    </div>
  );
}
