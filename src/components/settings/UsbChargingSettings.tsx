import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Usb, Save } from "lucide-react";

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
}: SettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <Separator />
      {children}
    </div>
  );
}

export function UsbChargingSettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentSetting();
  }, []);

  const loadCurrentSetting = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // This would need to be implemented in the Rust backend
      const result = await invoke<boolean>("get_usb_charging");
      setIsEnabled(result);
    } catch (error) {
      console.error("Erro ao carregar configuração de USB charging:", error);
      setError("Erro ao carregar configuração de USB charging");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      // This would need to be implemented in the Rust backend
      await invoke("set_usb_charging", { enabled: isEnabled });
      console.log("USB charging setting saved successfully!");
    } catch (error) {
      console.error("Erro ao alterar configuração de USB charging:", error);
      setError("Erro ao alterar configuração de USB charging");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SettingsSection
      title="USB Charging Settings"
      description="Control USB charging functionality when the laptop is off or in sleep mode"
      icon={Usb}
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">USB Charging</label>
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  isEnabled ? "bg-primary" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm">
                {isEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              When enabled, USB ports will continue to provide power for
              charging devices even when the laptop is turned off or in sleep
              mode.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
