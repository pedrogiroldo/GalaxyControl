import * as sudoPrompt from "sudo-prompt";

export default abstract class SysfsManager {
  protected sysfsPath: string;

  constructor(sysfsPath: string) {
    this.sysfsPath = sysfsPath;
  }

  public async getValue(): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = `cat "${this.sysfsPath}"`;
      sudoPrompt.exec(
        command,
        { name: "GalaxyControl" },
        (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else if (stderr) {
            reject(new Error(stderr.toString()));
          } else {
            resolve(stdout?.toString() || "");
          }
        }
      );
    });
  }

  public async setValue(value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = `echo "${value}" > "${this.sysfsPath}"`;
      sudoPrompt.exec(
        command,
        { name: "GalaxyControl" },
        (error, _stdout, stderr) => {
          if (error) {
            reject(error);
          } else if (stderr) {
            reject(new Error(stderr.toString()));
          } else {
            resolve();
          }
        }
      );
    });
  }
}
