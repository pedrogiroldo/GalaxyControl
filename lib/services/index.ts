import { ipcMain } from "electron";
import BatteryThresholdManager from "./battery-threshold-manager.service";
import PerformanceModeManager from "./performance-mode-manager.service";

const batteryThresholdManager = new BatteryThresholdManager();
const performanceModeManager = new PerformanceModeManager();

export function registerServices() {
  ipcMain.handle("batteryThresholdManager:getThreshold", async () => {
    return batteryThresholdManager.getThreshold();
  });
  ipcMain.handle(
    "batteryThresholdManager:setThreshold",
    async (_event, threshold: number) => {
      return batteryThresholdManager.setThreshold(threshold);
    }
  );

  ipcMain.handle("performanceModeManager:getPerformanceMode", async () => {
    return performanceModeManager.getPerformanceMode();
  });
  ipcMain.handle(
    "performanceModeManager:setPerformanceMode",
    async (_event, mode: string) => {
      return performanceModeManager.setPerformanceMode(mode);
    }
  );
  ipcMain.handle(
    "performanceModeManager:getPossiblePerformanceModes",
    async () => {
      return performanceModeManager.getPossiblePerformanceModes();
    }
  );
  ipcMain.handle("performanceModeManager:getPerformanceData", async () => {
    return performanceModeManager.getPerformanceData();
  });
}
