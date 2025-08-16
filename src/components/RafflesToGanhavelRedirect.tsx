import { useParams, Navigate } from "react-router-dom";

export default function RafflesToGanhavelRedirect() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/" replace />;
  }
  
  return <Navigate to={`/ganhavel/${id}`} replace />;
}