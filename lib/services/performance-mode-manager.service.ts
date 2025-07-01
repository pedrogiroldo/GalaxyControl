import SysfsManager from "../models/sysfs-manager.model";
import * as sudoPrompt from "sudo-prompt";

export default class PerformanceModeManager extends SysfsManager {
  private sysfsPath: string;
  private possiblePerformanceModesPaths: string;

  constructor() {
    super();
    this.sysfsPath = "/sys/firmware/acpi/platform_profile";
    this.possiblePerformanceModesPaths =
      "/sys/firmware/acpi/platform_profile_choices";
  }

  public async setPerformanceMode(mode: string): Promise<void> {
    await this.setValue(this.sysfsPath, mode);
  }

  public async getPerformanceMode(): Promise<string> {
    const value = await this.getValue(this.sysfsPath);
    return value;
  }

  public async getPossiblePerformanceModes(): Promise<string[]> {
    const result = await this.getValue(this.possiblePerformanceModesPaths);
    return result.trim().split(" ");
  }

  public async getPerformanceModeOptimized(): Promise<string> {
    const data = await this.getPerformanceData();
    return data.currentMode;
  }

  public async getPossiblePerformanceModesOptimized(): Promise<string[]> {
    const data = await this.getPerformanceData();
    return data.possibleModes;
  }

  public async getPerformanceData(): Promise<{
    currentMode: string;
    possibleModes: string[];
  }> {
    return new Promise((resolve, reject) => {
      const command = `cat "${this.sysfsPath}" "${this.possiblePerformanceModesPaths}"`;

      sudoPrompt.exec(
        command,
        { name: "GalaxyControl" },
        (
          error?: Error | undefined,
          stdout?: string | Buffer | undefined,
          stderr?: string | Buffer | undefined
        ) => {
          if (error) {
            reject(error);
          } else if (stderr) {
            reject(new Error(stderr.toString()));
          } else {
            const lines = stdout?.toString().trim().split("\n") || [];
            const currentMode = lines[0] || "";
            const possibleModes = lines[1]?.split(" ") || [];
            resolve({ currentMode, possibleModes });
          }
        }
      );
    });
  }
}
