import * as sudoPrompt from "sudo-prompt";

export default abstract class SysfsManager {

  public async getValue(sysfsPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = `cat "${sysfsPath}"`;
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

  public async setValue(sysfsPath: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = `echo "${value}" > "${sysfsPath}"`;
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
