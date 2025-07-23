import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Battery, Save } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

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

export function BatterySettings() {
  const [threshold, setThreshold] = useState([20]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadThreshold();
      hasLoadedRef.current = true;
    }
  }, [threshold]);

  const loadThreshold = async () => {
    try {
      setIsLoading(true);
      const currentThreshold = JSON.parse(
        (await invoke("get_threshold")) as string,
      );
      setThreshold([currentThreshold]);
    } catch (error) {
      console.error("Error loading battery threshold:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSliderChange = (value: number[]) => {
    setThreshold(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 1 && value <= 100) {
      setThreshold([value]);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await invoke("set_threshold", { value: threshold[0] });
      console.log("Battery threshold saved successfully!");
    } catch (error) {
      console.error("Error saving battery threshold:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsSection
      title="Battery Settings"
      description="Configure battery threshold"
      icon={Battery}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Battery Threshold (%)</label>
            <div className="flex items-center gap-4">
              <Slider
                value={threshold}
                onValueChange={handleSliderChange}
                max={100}
                min={1}
                step={1}
                className="flex-1"
                disabled={isLoading}
              />
              <Input
                type="number"
                min="1"
                max="100"
                value={threshold[0]}
                onChange={handleInputChange}
                className="w-20"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Stop charging when battery reaches {threshold[0]}%
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
