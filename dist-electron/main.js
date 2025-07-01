var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { ipcMain, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import require$$0 from "child_process";
import require$$1 from "crypto";
import require$$2 from "fs";
import require$$3 from "os";
import require$$4 from "path";
import require$$5 from "util";
var Node = {
  child: require$$0,
  crypto: require$$1,
  fs: require$$2,
  os: require$$3,
  path: require$$4,
  process,
  util: require$$5
};
function Attempt(instance, end) {
  var platform = Node.process.platform;
  if (platform === "darwin") return Mac(instance, end);
  if (platform === "linux") return Linux(instance, end);
  if (platform === "win32") return Windows(instance, end);
  end(new Error("Platform not yet supported."));
}
function EscapeDoubleQuotes(string) {
  if (typeof string !== "string") throw new Error("Expected a string.");
  return string.replace(/"/g, '\\"');
}
function Exec() {
  if (arguments.length < 1 || arguments.length > 3) {
    throw new Error("Wrong number of arguments.");
  }
  var command = arguments[0];
  var options = {};
  var end = function() {
  };
  if (typeof command !== "string") {
    throw new Error("Command should be a string.");
  }
  if (arguments.length === 2) {
    if (Node.util.isObject(arguments[1])) {
      options = arguments[1];
    } else if (Node.util.isFunction(arguments[1])) {
      end = arguments[1];
    } else {
      throw new Error("Expected options or callback.");
    }
  } else if (arguments.length === 3) {
    if (Node.util.isObject(arguments[1])) {
      options = arguments[1];
    } else {
      throw new Error("Expected options to be an object.");
    }
    if (Node.util.isFunction(arguments[2])) {
      end = arguments[2];
    } else {
      throw new Error("Expected callback to be a function.");
    }
  }
  if (/^sudo/i.test(command)) {
    return end(new Error('Command should not be prefixed with "sudo".'));
  }
  if (typeof options.name === "undefined") {
    var title = Node.process.title;
    if (ValidName(title)) {
      options.name = title;
    } else {
      return end(new Error("process.title cannot be used as a valid name."));
    }
  } else if (!ValidName(options.name)) {
    var error = "";
    error += "options.name must be alphanumeric only ";
    error += "(spaces are allowed) and <= 70 characters.";
    return end(new Error(error));
  }
  if (typeof options.icns !== "undefined") {
    if (typeof options.icns !== "string") {
      return end(new Error("options.icns must be a string if provided."));
    } else if (options.icns.trim().length === 0) {
      return end(new Error("options.icns must not be empty if provided."));
    }
  }
  if (typeof options.env !== "undefined") {
    if (typeof options.env !== "object") {
      return end(new Error("options.env must be an object if provided."));
    } else if (Object.keys(options.env).length === 0) {
      return end(new Error("options.env must not be empty if provided."));
    } else {
      for (var key in options.env) {
        var value = options.env[key];
        if (typeof key !== "string" || typeof value !== "string") {
          return end(
            new Error("options.env environment variables must be strings.")
          );
        }
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
          return end(
            new Error(
              "options.env has an invalid environment variable name: " + JSON.stringify(key)
            )
          );
        }
        if (/[\r\n]/.test(value)) {
          return end(
            new Error(
              "options.env has an invalid environment variable value: " + JSON.stringify(value)
            )
          );
        }
      }
    }
  }
  var platform = Node.process.platform;
  if (platform !== "darwin" && platform !== "linux" && platform !== "win32") {
    return end(new Error("Platform not yet supported."));
  }
  var instance = {
    command,
    options,
    uuid: void 0,
    path: void 0
  };
  Attempt(instance, end);
}
function Linux(instance, end) {
  LinuxBinary(
    instance,
    function(error, binary) {
      if (error) return end(error);
      var command = [];
      command.push('cd "' + EscapeDoubleQuotes(Node.process.cwd()) + '";');
      for (var key in instance.options.env) {
        var value = instance.options.env[key];
        command.push("export " + key + '="' + EscapeDoubleQuotes(value) + '";');
      }
      command.push('"' + EscapeDoubleQuotes(binary) + '"');
      if (/kdesudo/i.test(binary)) {
        command.push(
          "--comment",
          '"' + instance.options.name + ' wants to make changes. Enter your password to allow this."'
        );
        command.push("-d");
        command.push("--");
      } else if (/pkexec/i.test(binary)) {
        command.push("--disable-internal-agent");
      }
      var magic = "SUDOPROMPT\n";
      command.push(
        '/bin/bash -c "echo ' + EscapeDoubleQuotes(magic.trim()) + "; " + EscapeDoubleQuotes(instance.command) + '"'
      );
      command = command.join(" ");
      Node.child.exec(
        command,
        { encoding: "utf-8", maxBuffer: MAX_BUFFER },
        function(error2, stdout, stderr) {
          var elevated = stdout && stdout.slice(0, magic.length) === magic;
          if (elevated) stdout = stdout.slice(magic.length);
          if (error2 && !elevated) {
            if (/No authentication agent found/.test(stderr)) {
              error2.message = NO_POLKIT_AGENT;
            } else {
              error2.message = PERMISSION_DENIED;
            }
          }
          end(error2, stdout, stderr);
        }
      );
    }
  );
}
function LinuxBinary(instance, end) {
  var index = 0;
  var paths = ["/usr/bin/kdesudo", "/usr/bin/pkexec"];
  function test() {
    if (index === paths.length) {
      return end(new Error("Unable to find pkexec or kdesudo."));
    }
    var path2 = paths[index++];
    Node.fs.stat(
      path2,
      function(error) {
        if (error) {
          if (error.code === "ENOTDIR") return test();
          if (error.code === "ENOENT") return test();
          end(error);
        } else {
          end(void 0, path2);
        }
      }
    );
  }
  test();
}
function Mac(instance, callback) {
  var temp = Node.os.tmpdir();
  if (!temp) return callback(new Error("os.tmpdir() not defined."));
  var user = Node.process.env.USER;
  if (!user) return callback(new Error("env['USER'] not defined."));
  UUID(
    instance,
    function(error, uuid) {
      if (error) return callback(error);
      instance.uuid = uuid;
      instance.path = Node.path.join(
        temp,
        instance.uuid,
        instance.options.name + ".app"
      );
      function end(error2, stdout, stderr) {
        Remove(
          Node.path.dirname(instance.path),
          function(errorRemove) {
            if (error2) return callback(error2);
            if (errorRemove) return callback(errorRemove);
            callback(void 0, stdout, stderr);
          }
        );
      }
      MacApplet(
        instance,
        function(error2, stdout, stderr) {
          if (error2) return end(error2, stdout, stderr);
          MacIcon(
            instance,
            function(error3) {
              if (error3) return end(error3);
              MacPropertyList(
                instance,
                function(error4, stdout2, stderr2) {
                  if (error4) return end(error4, stdout2, stderr2);
                  MacCommand(
                    instance,
                    function(error5) {
                      if (error5) return end(error5);
                      MacOpen(
                        instance,
                        function(error6, stdout3, stderr3) {
                          if (error6) return end(error6, stdout3, stderr3);
                          MacResult(instance, end);
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}
function MacApplet(instance, end) {
  var parent = Node.path.dirname(instance.path);
  Node.fs.mkdir(
    parent,
    function(error) {
      if (error) return end(error);
      var zip = Node.path.join(parent, "sudo-prompt-applet.zip");
      Node.fs.writeFile(
        zip,
        APPLET,
        "base64",
        function(error2) {
          if (error2) return end(error2);
          var command = [];
          command.push("/usr/bin/unzip");
          command.push("-o");
          command.push('"' + EscapeDoubleQuotes(zip) + '"');
          command.push('-d "' + EscapeDoubleQuotes(instance.path) + '"');
          command = command.join(" ");
          Node.child.exec(command, { encoding: "utf-8" }, end);
        }
      );
    }
  );
}
function MacCommand(instance, end) {
  var path2 = Node.path.join(
    instance.path,
    "Contents",
    "MacOS",
    "sudo-prompt-command"
  );
  var script = [];
  script.push('cd "' + EscapeDoubleQuotes(Node.process.cwd()) + '"');
  for (var key in instance.options.env) {
    var value = instance.options.env[key];
    script.push("export " + key + '="' + EscapeDoubleQuotes(value) + '"');
  }
  script.push(instance.command);
  script = script.join("\n");
  Node.fs.writeFile(path2, script, "utf-8", end);
}
function MacIcon(instance, end) {
  if (!instance.options.icns) return end();
  Node.fs.readFile(
    instance.options.icns,
    function(error, buffer) {
      if (error) return end(error);
      var icns = Node.path.join(
        instance.path,
        "Contents",
        "Resources",
        "applet.icns"
      );
      Node.fs.writeFile(icns, buffer, end);
    }
  );
}
function MacOpen(instance, end) {
  var binary = Node.path.join(instance.path, "Contents", "MacOS", "applet");
  var options = {
    cwd: Node.path.dirname(binary),
    encoding: "utf-8"
  };
  Node.child.exec("./" + Node.path.basename(binary), options, end);
}
function MacPropertyList(instance, end) {
  var plist = Node.path.join(instance.path, "Contents", "Info.plist");
  var path2 = EscapeDoubleQuotes(plist);
  var key = EscapeDoubleQuotes("CFBundleName");
  var value = instance.options.name + " Password Prompt";
  if (/'/.test(value)) {
    return end(new Error("Value should not contain single quotes."));
  }
  var command = [];
  command.push("/usr/bin/defaults");
  command.push("write");
  command.push('"' + path2 + '"');
  command.push('"' + key + '"');
  command.push("'" + value + "'");
  command = command.join(" ");
  Node.child.exec(command, { encoding: "utf-8" }, end);
}
function MacResult(instance, end) {
  var cwd = Node.path.join(instance.path, "Contents", "MacOS");
  Node.fs.readFile(
    Node.path.join(cwd, "code"),
    "utf-8",
    function(error, code) {
      if (error) {
        if (error.code === "ENOENT") return end(new Error(PERMISSION_DENIED));
        end(error);
      } else {
        Node.fs.readFile(
          Node.path.join(cwd, "stdout"),
          "utf-8",
          function(error2, stdout) {
            if (error2) return end(error2);
            Node.fs.readFile(
              Node.path.join(cwd, "stderr"),
              "utf-8",
              function(error3, stderr) {
                if (error3) return end(error3);
                code = parseInt(code.trim(), 10);
                if (code === 0) {
                  end(void 0, stdout, stderr);
                } else {
                  error3 = new Error(
                    "Command failed: " + instance.command + "\n" + stderr
                  );
                  error3.code = code;
                  end(error3, stdout, stderr);
                }
              }
            );
          }
        );
      }
    }
  );
}
function Remove(path2, end) {
  if (typeof path2 !== "string" || !path2.trim()) {
    return end(new Error("Argument path not defined."));
  }
  var command = [];
  if (Node.process.platform === "win32") {
    if (/"/.test(path2)) {
      return end(new Error("Argument path cannot contain double-quotes."));
    }
    command.push('rmdir /s /q "' + path2 + '"');
  } else {
    command.push("/bin/rm");
    command.push("-rf");
    command.push('"' + EscapeDoubleQuotes(Node.path.normalize(path2)) + '"');
  }
  command = command.join(" ");
  Node.child.exec(command, { encoding: "utf-8" }, end);
}
function UUID(instance, end) {
  Node.crypto.randomBytes(
    256,
    function(error, random) {
      if (error) random = Date.now() + "" + Math.random();
      var hash = Node.crypto.createHash("SHA256");
      hash.update("sudo-prompt-3");
      hash.update(instance.options.name);
      hash.update(instance.command);
      hash.update(random);
      var uuid = hash.digest("hex").slice(-32);
      if (!uuid || typeof uuid !== "string" || uuid.length !== 32) {
        return end(new Error("Expected a valid UUID."));
      }
      end(void 0, uuid);
    }
  );
}
function ValidName(string) {
  if (!/^[a-z0-9 ]+$/i.test(string)) return false;
  if (string.trim().length === 0) return false;
  if (string.length > 70) return false;
  return true;
}
function Windows(instance, callback) {
  var temp = Node.os.tmpdir();
  if (!temp) return callback(new Error("os.tmpdir() not defined."));
  UUID(
    instance,
    function(error, uuid) {
      if (error) return callback(error);
      instance.uuid = uuid;
      instance.path = Node.path.join(temp, instance.uuid);
      if (/"/.test(instance.path)) {
        return callback(
          new Error("instance.path cannot contain double-quotes.")
        );
      }
      instance.pathElevate = Node.path.join(instance.path, "elevate.vbs");
      instance.pathExecute = Node.path.join(instance.path, "execute.bat");
      instance.pathCommand = Node.path.join(instance.path, "command.bat");
      instance.pathStdout = Node.path.join(instance.path, "stdout");
      instance.pathStderr = Node.path.join(instance.path, "stderr");
      instance.pathStatus = Node.path.join(instance.path, "status");
      Node.fs.mkdir(
        instance.path,
        function(error2) {
          if (error2) return callback(error2);
          function end(error3, stdout, stderr) {
            Remove(
              instance.path,
              function(errorRemove) {
                if (error3) return callback(error3);
                if (errorRemove) return callback(errorRemove);
                callback(void 0, stdout, stderr);
              }
            );
          }
          WindowsWriteExecuteScript(
            instance,
            function(error3) {
              if (error3) return end(error3);
              WindowsWriteCommandScript(
                instance,
                function(error4) {
                  if (error4) return end(error4);
                  WindowsElevate(
                    instance,
                    function(error5, stdout, stderr) {
                      if (error5) return end(error5, stdout, stderr);
                      WindowsWaitForStatus(
                        instance,
                        function(error6) {
                          if (error6) return end(error6);
                          WindowsResult(instance, end);
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}
function WindowsElevate(instance, end) {
  var command = [];
  command.push("powershell.exe");
  command.push("Start-Process");
  command.push("-FilePath");
  command.push(`"'` + instance.pathExecute.replace(/'/g, "`'") + `'"`);
  command.push("-WindowStyle hidden");
  command.push("-Verb runAs");
  command = command.join(" ");
  var child = Node.child.exec(
    command,
    { encoding: "utf-8" },
    function(error, stdout, stderr) {
      if (error) return end(new Error(PERMISSION_DENIED), stdout, stderr);
      end();
    }
  );
  child.stdin.end();
}
function WindowsResult(instance, end) {
  Node.fs.readFile(
    instance.pathStatus,
    "utf-8",
    function(error, code) {
      if (error) return end(error);
      Node.fs.readFile(
        instance.pathStdout,
        "utf-8",
        function(error2, stdout) {
          if (error2) return end(error2);
          Node.fs.readFile(
            instance.pathStderr,
            "utf-8",
            function(error3, stderr) {
              if (error3) return end(error3);
              code = parseInt(code.trim(), 10);
              if (code === 0) {
                end(void 0, stdout, stderr);
              } else {
                error3 = new Error(
                  "Command failed: " + instance.command + "\r\n" + stderr
                );
                error3.code = code;
                end(error3, stdout, stderr);
              }
            }
          );
        }
      );
    }
  );
}
function WindowsWaitForStatus(instance, end) {
  Node.fs.stat(
    instance.pathStatus,
    function(error, stats) {
      if (error && error.code === "ENOENT" || stats.size < 2) {
        setTimeout(
          function() {
            Node.fs.stat(
              instance.pathStdout,
              function(error2) {
                if (error2) return end(new Error(PERMISSION_DENIED));
                WindowsWaitForStatus(instance, end);
              }
            );
          },
          1e3
        );
      } else if (error) {
        end(error);
      } else {
        end();
      }
    }
  );
}
function WindowsWriteCommandScript(instance, end) {
  var cwd = Node.process.cwd();
  if (/"/.test(cwd)) {
    return end(new Error("process.cwd() cannot contain double-quotes."));
  }
  var script = [];
  script.push("@echo off");
  script.push("chcp 65001>nul");
  script.push('cd /d "' + cwd + '"');
  for (var key in instance.options.env) {
    var value = instance.options.env[key];
    script.push("set " + key + "=" + value.replace(/([<>\\|&^])/g, "^$1"));
  }
  script.push(instance.command);
  script = script.join("\r\n");
  Node.fs.writeFile(instance.pathCommand, script, "utf-8", end);
}
function WindowsWriteExecuteScript(instance, end) {
  var script = [];
  script.push("@echo off");
  script.push(
    'call "' + instance.pathCommand + '" > "' + instance.pathStdout + '" 2> "' + instance.pathStderr + '"'
  );
  script.push('(echo %ERRORLEVEL%) > "' + instance.pathStatus + '"');
  script = script.join("\r\n");
  Node.fs.writeFile(instance.pathExecute, script, "utf-8", end);
}
var exec = Exec;
var APPLET = "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";
var PERMISSION_DENIED = "User did not grant permission.";
var NO_POLKIT_AGENT = "No polkit authentication agent found.";
var MAX_BUFFER = 134217728;
class SysfsManager {
  constructor(sysfsPath) {
    __publicField(this, "sysfsPath");
    this.sysfsPath = sysfsPath;
  }
  async getValue() {
    return new Promise((resolve, reject) => {
      const command = `cat "${this.sysfsPath}"`;
      exec(
        command,
        { name: "GalaxyControl" },
        (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else if (stderr) {
            reject(new Error(stderr.toString()));
          } else {
            resolve((stdout == null ? void 0 : stdout.toString()) || "");
          }
        }
      );
    });
  }
  async setValue(value) {
    return new Promise((resolve, reject) => {
      const command = `echo "${value}" > "${this.sysfsPath}"`;
      exec(
        command,
        { name: "GalaxyControl" },
        (error, stdout, stderr) => {
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
class BatteryThresholdManager extends SysfsManager {
  constructor() {
    super("/sys/class/power_supply/BAT1/charge_control_end_threshold");
  }
  async getThreshold() {
    const value = await this.getValue();
    return parseInt(value);
  }
  async setThreshold(threshold) {
    await this.setValue(threshold.toString());
  }
}
const batteryThresholdManager = new BatteryThresholdManager();
function registerServices() {
  ipcMain.handle("batteryThresholdManager:getThreshold", async () => {
    return batteryThresholdManager.getThreshold();
  });
  ipcMain.handle(
    "batteryThresholdManager:setThreshold",
    async (_event, threshold) => {
      return batteryThresholdManager.setThreshold(threshold);
    }
  );
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  registerServices();
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
