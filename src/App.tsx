import { useState, useEffect } from "react";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  BatterySettings,
  PerformanceSettings,
  PowerOnLidOpenSettings,
  UsbChargingSettings,
  BlockRecordingSettings,
} from "./components/settings";
import { SudoPasswordDialog } from "./components/sudo-password-dialog";
import { invoke } from "@tauri-apps/api/core";
import { SupportedSettings } from "./types/settings";

function App() {
  const [activeSection, setActiveSection] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [supportedSettings, setSupportedSettings] =
    useState<SupportedSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handlePasswordSubmit = async (password: string) => {
    try {
      await invoke("authenticate", { password });
      console.log("Autenticação bem-sucedida");
      setIsAuthenticated(true);
      setTimeout(() => {}, 3000);
      await loadSupportedSettings();
    } catch (error) {
      console.error("Erro na autenticação:", error);
    }
  };

  const loadSupportedSettings = async () => {
    try {
      setIsLoading(true);
      const result = (await invoke("get_supported_settings")) as string;
      const settings: [string, boolean][] = JSON.parse(result);

      const supportedSettingsObj: SupportedSettings = {
        battery_threshold: false,
        performance_mode: false,
        power_on_lid_open: false,
        usb_charging: false,
        block_recording: false,
      };

      settings.forEach(([key, value]) => {
        if (key in supportedSettingsObj) {
          (supportedSettingsObj as any)[key] = value;
        }
      });

      setSupportedSettings(supportedSettingsObj);

      // Set default active section to the first supported setting
      if (supportedSettingsObj.battery_threshold) {
        setActiveSection("battery");
      } else if (supportedSettingsObj.performance_mode) {
        setActiveSection("performance");
      }
    } catch (error) {
      console.error("Erro ao carregar configurações suportadas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSupportedSettings();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <SudoPasswordDialog open={true} onPasswordSubmit={handlePasswordSubmit} />
    );
  }

  if (isLoading || !supportedSettings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        supportedSettings={supportedSettings}
      />
      <SidebarInset>
        <div className="p-6">
          {activeSection === "battery" &&
            supportedSettings.battery_threshold && <BatterySettings />}
          {activeSection === "performance" &&
            supportedSettings.performance_mode && <PerformanceSettings />}
          {activeSection === "power_on_lid" &&
            supportedSettings.power_on_lid_open && <PowerOnLidOpenSettings />}
          {activeSection === "usb_charging" &&
            supportedSettings.usb_charging && <UsbChargingSettings />}
          {activeSection === "block_recording" &&
            supportedSettings.block_recording && <BlockRecordingSettings />}
          {!activeSection && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Galaxy Control</h2>
              <p className="text-muted-foreground">
                Selecione uma configuração na barra lateral para começar.
              </p>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
