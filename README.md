# Galaxy Control 🚀

A graphical user interface to manage hardware settings on Samsung Galaxy Books running Linux.

## 📝 Overview

Galaxy Control provides a simple and intuitive way to adjust your Samsung Galaxy Book's hardware settings directly from your Linux desktop. The application interacts with the `sysfs` files exposed by the `samsung-laptop` kernel driver, allowing you to change settings that would typically require terminal commands.

## ✨ Features

- 🔋 **Battery Charge Limit:** Set a maximum charge threshold for your battery to help extend its lifespan.
- ⚡ **Performance Mode:** Easily switch between your notebook's different performance modes (e.g., Silent, Optimized, High Performance).
- 🔌 **Power on Lid Open:** Configure whether your Galaxy Book automatically powers on when you open the lid.
- 🔌 **USB Charging:** Enable or disable USB charging capability when the device is powered off.
- 🚫🎥 **Block Recording:** Control the block recording functionality for privacy and security.

## ⚙️ How It Works

The application modifies values in the `sysfs` files. Since modifying these files requires superuser privileges, Galaxy Control will ask for your `sudo` password on startup to apply changes securely.

## 📦 Installation

_Go to the [Releases](https://github.com/your-username/galaxy-control/releases) page to download the latest version for your Linux distribution._

_(More detailed installation instructions will be added here once packages are available.)_

## 💻 Development

If you want to build the project from the source code, follow the steps below:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/galaxy-control.git
    cd galaxy-control
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Run in development mode:**

    ```bash
    bun run tauri dev
    ```

4.  **Build for production:**
    ```bash
    bun run tauri build
    ```

## ⚠️ Disclaimer

This project modifies system settings. Use it at your own risk. The developers are not responsible for any potential damage to your hardware.
