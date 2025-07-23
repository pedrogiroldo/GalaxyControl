import { useState } from "react";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { BatterySettings, PerformanceSettings } from "./components/settings";
import { SudoPasswordDialog } from "./components/sudo-password-dialog";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [activeSection, setActiveSection] = useState("battery");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handlePasswordSubmit = async (password: string) => {
    try {
      setIsAuthenticated(true);
      await invoke("authenticate", { password });
      console.log("Autenticação bem-sucedida");
    } catch (error) {
      console.error("Erro na autenticação:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <SudoPasswordDialog open={true} onPasswordSubmit={handlePasswordSubmit} />
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <SidebarInset>
        <div className="p-6">
          {activeSection === "battery" && isAuthenticated && (
            <BatterySettings />
          )}
          {activeSection === "performance" && <PerformanceSettings />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
