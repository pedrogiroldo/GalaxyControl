export interface SupportedSettings {
  battery_threshold: boolean;
  performance_mode: boolean;
  power_on_lid_open: boolean;
  usb_charging: boolean;
  block_recording: boolean;
}

export type SettingKey = keyof SupportedSettings;

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  description: string;
  settingKey: SettingKey;
}
