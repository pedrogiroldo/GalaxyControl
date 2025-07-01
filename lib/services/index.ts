import { ipcMain } from "electron";
import BatteryThresholdManager from "./battery-threshold-manager.service";

const batteryThresholdManager = new BatteryThresholdManager();

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
}
