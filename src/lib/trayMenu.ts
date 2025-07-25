import { invoke } from "@tauri-apps/api/core";
import { Menu } from "@tauri-apps/api/menu";
import { TrayIcon, TrayIconOptions } from "@tauri-apps/api/tray";

export async function createTrayIcon() {
  const powerOnLidOpenEnabled: boolean = await invoke("get_power_on_lid_open");
  const menu = await Menu.new({
    items: [
      {
        id: "power_on_lid_open",
        checked: powerOnLidOpenEnabled,
        text: "Power on lid open",
        action: async () => {
          const powerOnLidOpenEnabled: boolean = await invoke(
            "get_power_on_lid_open",
          );

          await invoke("set_power_on_lid_open", {
            enabled: !powerOnLidOpenEnabled,
          });
        },
      },
    ],
  });

  const options: TrayIconOptions = {
    icon: "icons/icon.png",
    menu: menu,
  };
  await TrayIcon.new(options);
}
