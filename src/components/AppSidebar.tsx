import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem } from
"@/components/ui/sidebar";
import {
  LayoutDashboard,
  ClipboardCheck,
  Gamepad2,
  Calculator,
  BookOpen,
  Bell,
  Settings,
  Shield,
  Users,
  LogOut
} from "lucide-react";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { isAdmin, isExpert } = useUserRole();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.
    from("notifications").
    select("id", { count: "exact", head: true }).
    eq("user_id", user.id).
    eq("is_read", false).
    then(({ count }) => setUnreadCount(count ?? 0));
  }, [user, location.pathname]);

  const mainItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Assessments", icon: ClipboardCheck, path: "/assessments" },
  { title: "Simulations", icon: Gamepad2, path: "/simulations" },
  { title: "Tools", icon: Calculator, path: "/tools" },
   { title: "Learn", icon: BookOpen, path: "/learn" },
   { title: unreadCount > 0 ? `Notifications (${unreadCount})` : "Notifications", icon: Bell, path: "/notifications" }];


  const expertItems = [
  { title: "My Content", icon: BookOpen, path: "/expert/content" }];


  const adminItems = [
  { title: "User Management", icon: Users, path: "/admin/users" },
  { title: "Moderation", icon: Shield, path: "/admin/moderation" }];


  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h1 className="font-display text-xl font-bold text-sidebar-primary-foreground">FinBachat</h1>
        <p className="text-xs text-sidebar-foreground/50">Financial Literacy</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) =>
              <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                  isActive={location.pathname === item.path}
                  onClick={() => navigate(item.path)}>

                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(isExpert || isAdmin) &&
        <SidebarGroup>
            <SidebarGroupLabel>Expert</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {expertItems.map((item) =>
              <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                  isActive={location.pathname === item.path}
                  onClick={() => navigate(item.path)}>

                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        }

        {isAdmin &&
        <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) =>
              <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                  isActive={location.pathname === item.path}
                  onClick={() => navigate(item.path)}>

                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        }
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>);

}