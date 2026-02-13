import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Users, Search, Shield, ShieldCheck, User, Mail, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "user" | "expert" | "admin";
}

interface UserWithRoles extends UserProfile {
  roles: UserRole[];
  email?: string;
}

const ROLE_COLORS: Record<string, "default" | "secondary" | "destructive"> = {
  admin: "destructive",
  expert: "default",
  user: "secondary",
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [addingRole, setAddingRole] = useState<string>("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, bio, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("id, user_id, role"),
    ]);

    const profileList = (profiles ?? []) as UserProfile[];
    const roleList = (roles ?? []) as UserRole[];

    const usersWithRoles: UserWithRoles[] = profileList.map((p) => ({
      ...p,
      roles: roleList.filter((r) => r.user_id === p.id),
    }));

    setUsers(usersWithRoles);
    setLoading(false);
  }

  async function addRole(userId: string, role: string) {
    if (!role) return;
    const { error } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: role as "user" | "expert" | "admin",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Role "${role}" added` });
    await loadUsers();
    // Update selected user
    setSelectedUser((prev) => {
      if (!prev) return null;
      const updated = users.find((u) => u.id === userId);
      return updated ?? prev;
    });
    setAddingRole("");
  }

  async function removeRole(roleId: string, userId: string) {
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Role removed" });
    await loadUsers();
    setSelectedUser((prev) => {
      if (!prev) return null;
      return { ...prev, roles: prev.roles.filter((r) => r.id !== roleId) };
    });
  }

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (u.display_name?.toLowerCase().includes(s)) ||
      u.id.toLowerCase().includes(s)
    );
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.roles.some((r) => r.role === "admin")).length;
  const expertCount = users.filter((u) => u.roles.some((r) => r.role === "expert")).length;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage users and assign roles.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-muted p-2.5 text-primary"><Users className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold font-display">{totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-muted p-2.5 text-destructive"><Shield className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold font-display">{adminCount}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-muted p-2.5 text-primary"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold font-display">{expertCount}</p>
              <p className="text-xs text-muted-foreground">Experts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No users found.</p>
            ) : (
              filtered.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => { setSelectedUser(u); setAddingRole(""); }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-full bg-muted p-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{u.display_name || "Unnamed User"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Joined {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {u.roles.map((r) => (
                      <Badge key={r.id} variant={ROLE_COLORS[r.role]}>{r.role}</Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        {selectedUser && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{selectedUser.display_name || "Unnamed User"}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Joined {new Date(selectedUser.created_at).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            {selectedUser.bio && (
              <p className="text-sm text-muted-foreground">{selectedUser.bio}</p>
            )}

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Roles</h4>
              <div className="flex flex-wrap gap-2">
                {selectedUser.roles.map((r) => (
                  <Badge key={r.id} variant={ROLE_COLORS[r.role]} className="gap-1 pr-1">
                    {r.role}
                    {/* Don't allow removing the last role or self-removing admin */}
                    {!(selectedUser.roles.length === 1) && !(r.role === "admin" && selectedUser.id === currentUser?.id) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeRole(r.id, selectedUser.id); }}
                        className="ml-1 rounded-full hover:bg-background/20 p-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>

              {/* Add role */}
              {(() => {
                const existingRoles = selectedUser.roles.map((r) => r.role);
                const availableRoles = (["user", "expert", "admin"] as const).filter(
                  (r) => !existingRoles.includes(r)
                );
                if (availableRoles.length === 0) return null;
                return (
                  <div className="flex gap-2">
                    <Select value={addingRole} onValueChange={setAddingRole}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Add role..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      disabled={!addingRole}
                      onClick={() => addRole(selectedUser.id, addingRole)}
                    >
                      Add
                    </Button>
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
