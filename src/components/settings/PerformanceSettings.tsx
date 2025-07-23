import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { invoke } from "@tauri-apps/api/core";
import { Zap, Save } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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

export function PerformanceSettings() {
  const [currentMode, setCurrentMode] = useState<string>("");
  const [availableModes, setAvailableModes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadPerformanceData();
    }
  }, []);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);
      const data = (await invoke("get_performance_data")) as {
        currentMode: string;
        possibleModes: string[];
      };
      if (!data || !data.currentMode || !data.possibleModes) {
        throw new Error("Invalid performance data received");
      }
      console.log("Performance data:", data);
      setCurrentMode(data.currentMode);
      setAvailableModes(data.possibleModes);
    } catch (error) {
      console.error("Error loading performance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (mode: string) => {
    setCurrentMode(mode);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await invoke("set_performance_mode", {
        mode: currentMode,
      });
      console.log("Performance mode saved successfully!");
    } catch (error) {
      console.error("Error saving performance mode:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "low-power":
        return "Low Power";
      case "balanced":
        return "Balanced";
      case "performance":
        return "Performance";
      default:
        return mode;
    }
  };

  return (
    <SettingsSection
      title="Performance Settings"
      description="Configure system performance mode"
      icon={Zap}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Performance Mode</label>
            <div className="grid grid-cols-1 gap-2">
              {availableModes.map((mode, index) => (
                <Button
                  key={index}
                  variant={currentMode === mode ? "default" : "outline"}
                  onClick={() => handleModeChange(mode)}
                  disabled={isLoading}
                  className="justify-start"
                >
                  {getModeLabel(mode)}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Current mode: {getModeLabel(currentMode)}
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
