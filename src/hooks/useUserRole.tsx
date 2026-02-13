import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "user" | "expert" | "admin";

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      setRoles((data ?? []).map((r) => r.role));
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  return {
    roles,
    loading,
    isAdmin: roles.includes("admin"),
    isExpert: roles.includes("expert"),
    isUser: roles.includes("user"),
  };
}
