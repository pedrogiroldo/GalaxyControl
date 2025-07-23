import { useState } from "react";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { BatterySettings, PerformanceSettings } from "./components/settings";

function App() {
  const [activeSection, setActiveSection] = useState("battery");

  const renderSettingsSection = () => {
    switch (activeSection) {
      case "battery":
        return <BatterySettings />;
      case "performance":
        return <PerformanceSettings />;
      default:
        return <BatterySettings />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <SidebarInset>
        <div className="p-6">{renderSettingsSection()}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
