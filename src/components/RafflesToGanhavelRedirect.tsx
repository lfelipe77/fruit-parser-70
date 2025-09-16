import { useParams, Navigate } from "react-router-dom";
import { appUrlFor } from "@/lib/urlHelpers";

export default function RafflesToGanhavelRedirect() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/" replace />;
  }
  
  return <Navigate to={appUrlFor({ id })} replace />;
}