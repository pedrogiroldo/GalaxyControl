import SysfsManager from "../models/sysfs-manager.model";

export default class BatteryThresholdManager extends SysfsManager {
  private sysfsPath: string;

  constructor() {
    super();
    this.sysfsPath = "/sys/class/power_supply/BAT1/charge_control_end_threshold";
  }

  public async getThreshold(): Promise<number> {
    const value = await this.getValue(this.sysfsPath);
    return parseInt(value);
  }

  public async setThreshold(threshold: number): Promise<void> {
    await this.setValue(this.sysfsPath, threshold.toString());
  }
}
