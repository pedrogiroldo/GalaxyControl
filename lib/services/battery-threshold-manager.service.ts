import SysfsManager from "../models/sysfs-manager.model";

export default class BatteryThresholdManager extends SysfsManager {
  constructor() {
    super("/sys/class/power_supply/BAT1/charge_control_end_threshold");
  }

  public async getThreshold(): Promise<number> {
    const value = await this.getValue();
    return parseInt(value);
  }

  public async setThreshold(threshold: number): Promise<void> {
    await this.setValue(threshold.toString());
  }
}
