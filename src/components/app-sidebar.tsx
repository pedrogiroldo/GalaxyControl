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
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Battery, Zap } from "lucide-react";

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AppSidebar({
  activeSection,
  onSectionChange,
}: AppSidebarProps) {
  const menuItems = [
    {
      id: "battery",
      label: "Battery threshold",
      icon: Battery,
      description: "Battery threshold settings",
    },
    {
      id: "performance",
      label: "Performance mode",
      icon: Zap,
      description: "Performance mode settings",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="text-2xl font-bold text-primary">Galaxy Control</h1>
        <p className="text-sm text-muted-foreground">Settings Manager</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeSection === item.id}
                      onClick={() => onSectionChange(item.id)}
                      tooltip={item.description}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground">
          <p>Version 0.1.0</p>
          <p>© 2025 Galaxy Control</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
