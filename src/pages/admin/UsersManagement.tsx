import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Calendar,
  Star,
  AlertTriangle,
  Shield,
} from "lucide-react";

type UserRow = {
  id: string;
  username?: string | null;
  full_name?: string | null;
  role?: string | null;
  banned?: boolean | null;
  total_ganhaveis?: number; // computed
};

export default function UsersManagement() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: udata, error: uerr } = await (supabase as any)
        .from("user_profiles")
        .select("id, username, full_name, role, banned")
        .order("full_name", { ascending: true })
        .limit(500);
      if (uerr) console.error("[Users] profiles error:", uerr);

      const base = (udata ?? []) as UserRow[];
      const ids = base.map(u => u.id);
      let withCounts = base;

      if (ids.length) {
        // Grouped counts: user_id + id.count()
        const { data: cdata, error: cerr } = await (supabase as any)
          .from("raffles")
          .select("user_id, id.count()")
          .in("user_id", ids)
          .group("user_id");
        if (cerr) console.error("[Users] raffles count error:", cerr);

        const map = new Map<string, number>();
        for (const row of cdata ?? []) {
          // PostgREST returns { user_id, id: { count: N } } OR { user_id, count }
          const n = (row as any)?.id?.count ?? (row as any)?.count ?? 0;
          map.set(row.user_id, n);
        }
        withCounts = base.map(u => ({ ...u, total_ganhaveis: map.get(u.id) ?? 0 }));
      }

      setUsers(withCounts);
      setLoading(false);
    })();
  }, []);

  // ... render table; include a column "Ganhavéis" showing row.total_ganhaveis

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Gestão de Usuários</h1>
      <table className="w-full text-sm">
        <thead className="text-left opacity-60">
          <tr>
            <th className="py-2">Nome</th>
            <th>Username</th>
            <th>Função</th>
            <th>Banido</th>
            <th>Ganhavéis</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t border-white/10">
              <td className="py-2">{u.full_name ?? "—"}</td>
              <td>{u.username ?? "—"}</td>
              <td>{u.role ?? "—"}</td>
              <td>{u.banned ? "Sim" : "Não"}</td>
              <td>{u.total_ganhaveis ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}