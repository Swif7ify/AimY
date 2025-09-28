# <div><img width="60" height="60" alt="icon" src="https://github.com/user-attachments/assets/a8b27b56-59c6-4ef6-9e55-19e4badd7889" /> AimY - Aim Trainer</div>

[![Visual Studio Marketplace](https://img.shields.io/badge/VS%20Marketplace-Published-blue?logo=visualstudiocode&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=EarlRomeoOrdovez.aimy)
![Version](https://img.shields.io/visual-studio-marketplace/v/EarlRomeoOrdovez.aimy)
![Downloads](https://img.shields.io/visual-studio-marketplace/d/EarlRomeoOrdovez.aimy)
![Installs](https://img.shields.io/visual-studio-marketplace/i/EarlRomeoOrdovez.aimy)
![Rating](https://img.shields.io/visual-studio-marketplace/r/EarlRomeoOrdovez.aimy)

<!-- Tech stack -->

![Three.js](https://img.shields.io/badge/Three.js-3D-6E40C9?logo=three.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![VS Code API](https://img.shields.io/badge/VS%20Code%20API-Latest-007ACC?logo=visualstudiocode&logoColor=white)

**Stop Coding, Start Shooting!**

AimY is a VS Code extension that turns your idle time into aim training sessions. When you stop coding for a while, targets appear and you need to hit them to get back to work. It's like having a built-in break reminder that actually improves your mouse precision.

## What It Does

-   Detects when you're idle (configurable timer)
-   Launches a fullscreen target practice game
-   Blocks access to your code until you complete the challenge
-   Tracks your performance over time
-   Restores your workspace exactly as it was

## Features

### 🎮 Automatic Game Trigger

Takes over VS Code when you've been idle, forcing you to take an active break before continuing to code.

### 🌍 2D & 3D Game Modes

Choose between classic 2D target practice or immersive 3D aim training:

-   **2D Mode**: Classic flat targets with particle effects and animations
-   **3D Mode**: Immersive 3D environment with target boards and spatial aiming

### ⚙️ Fully Customizable

### ⚙️ Fully Customizable

-   Adjust idle timeout (default: 1 minute)
-   Set number of targets to hit (default: 5)
-   Configure target size and behavior
-   Choose between JSON or CSV stat tracking

### 📊 Performance Tracking

Every game session is saved with detailed stats including accuracy, completion time, and your best streak.

### 🎯 Precision Training

Moving targets, timed challenges, and accuracy scoring help improve your mouse control over time.

## Installation

1. Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=EarlRomeoOrdovez.aimy&ssr=false#review-details) or search AimY directly in VSCode
2. Restart VS Code
3. The extension activates automatically
4. Start coding and wait for your first challenge!

## Quick Start

The extension works out of the box with sensible defaults. You can also:

-   Use `Ctrl+Shift+P` → "AimY: Start Game" to play manually
-   Click the status bar indicator to toggle auto-start on/off
-   Configure settings via File → Preferences → Settings → search "AimY"

## Configuration

All settings are available in VS Code settings under the "AimY" section:

### General Settings

| Setting                | Default | Description                                  |
| ---------------------- | ------- | -------------------------------------------- |
| `aimy.enableExtension` | `true`  | Enable/disable automatic game triggering     |
| `aimy.idleTimer`       | `60000` | Idle time in milliseconds before game starts |

### Visual Settings

| Setting               | Default | Description                                          |
| --------------------- | ------- | ---------------------------------------------------- |
| `aimy.gameVisualMode` | `"2D"`  | Game visual mode: `2D` (classic) or `3D` (immersive) |

### Gameplay Settings

| Setting                 | Default    | Description                                                                                                                                                  |
| ----------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `aimy.difficulty`       | `"Normal"` | Preset difficulty: `Easy`, `Normal`, `Hard`, `Very Hard`, `Custom`. Choosing a preset applies tuned game parameters; `Custom` uses your individual settings. |
| `aimy.targetGoals`      | `5`        | Targets required to complete a session                                                                                                                       |
| `aimy.targetSize`       | `100`      | Target diameter in pixels                                                                                                                                    |
| `aimy.targetMove`       | `false`    | Enable moving targets                                                                                                                                        |
| `aimy.targetSpeed`      | `3000`     | Movement speed (ms per move)                                                                                                                                 |
| `aimy.targetTimeExists` | `3000`     | How long a target exists before counting as a miss (0 = disabled)                                                                                            |

### Game Mode Settings

| Setting                   | Default          | Description                                                                                                                                                         |
| ------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aimy.gameMode`           | `"Target Rush"`  | Game mode: `Target Rush` (classic), `Time Frenzy` (fixed time, unlimited targets), `Hydra Targets` (3 simultaneous targets).                                        |
| `aimy.timeFrenzyDuration` | `60000`          | Duration in ms for Time Frenzy mode                                                                                                                                 |
| `aimy.hydraMode`          | `"Target Count"` | Hydra Targets end condition: `Target Count` (hit X targets to win) or `Timed` (hit as many as possible in Y seconds). Only applies when gameMode = 'Hydra Targets'. |
| `aimy.hydraTargetCount`   | `20`             | Total targets to spawn for Hydra Targets when using target-count mode                                                                                               |
| `aimy.hydraTotalTime`     | `60000`          | Total time in ms for Hydra Targets when using timed mode                                                                                                            |

### Audio & Visual Settings

| Setting                   | Default | Description                            |
| ------------------------- | ------- | -------------------------------------- |
| `aimy.enableSoundEffects` | `true`  | Enable hit/miss sounds                 |
| `aimy.soundVolume`        | `80`    | Sound volume (0–100)                   |
| `aimy.enableEffects`      | `true`  | Enable visual particles and animations |

### Stats & Workspace Settings

| Setting                          | Default  | Description                                                                                                                                                     |
| -------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aimy.enableStatsSave`           | `true`   | Enable/disable saving game stats to files                                                                                                                       |
| `aimy.statsFormat`               | `"json"` | Save format: `"json"` (one file per run) or `"csv"` (append rows)                                                                                               |
| `aimy.statsDirectory`            | `""`     | Directory to save stats (empty = extension storage)                                                                                                             |
| `aimy.closeWorkspaceOnGameStart` | `true`   | When enabled, non‑dirty editors (no unsaved changes) are closed on game start and restored after completion. Dirty editors are left open to avoid save prompts. |

### Difficulty presets

Choose `aimy.difficulty` to quickly switch sets of parameters:

-   easy — fewer, larger, slower targets (good warmup)
-   normal — balanced default
-   hard — more, faster, smaller targets
-   very hard — extreme values for advanced training
-   custom — use the individual `aimy.*` settings you configured |

### Game Mode Details

-   **Target Rush**: Classic mode - hit X targets to complete
-   **Time Frenzy**: Race against the clock - hit as many targets as possible in 60 seconds (configurable)
-   **Hydra Targets**: Face 3 simultaneous targets with two completion modes:
    -   _Target Count_: Hit 20 targets total (configurable) with 3 always on screen
    -   _Timed_: Hit as many as possible in 60 seconds (configurable) with 3 always on screen

### Visual Mode Details

-   **2D Mode**: Classic flat target practice with particle effects and animations
-   **3D Mode**: Immersive aim training experience featuring:
    -   3D environment with target boards
    -   Spatial depth and distance judgment
    -   FPS-style aiming with pointer lock controls
    -   Optimized for performance while maintaining visual quality

## Why AimY?

I built this because I noticed I'd often get stuck in long coding sessions without proper breaks. Traditional break reminders were easy to ignore, but having to actually complete a quick aim challenge before getting back to work ensures you take that mental reset.

The side benefit of improved mouse precision is just a bonus!

## Demo

<p align="center">
  <img width="auto" height="400" alt="image1" src="https://github.com/user-attachments/assets/35dc2580-e678-4848-9e65-f732ffbcceae" />
</p>
<p align="center">
  <img width="auto" height="400" alt="image2" src="https://github.com/user-attachments/assets/cd3a45ee-4482-4bb2-8d17-a08286c0b71d" />
</p>

## Stats & Privacy

-   All stats are saved locally on your machine
-   No data is sent anywhere
-   You can configure where stats are saved
-   JSON format creates one file per session
-   CSV format appends to a single file for easy analysis
-   JSON: one file per session. CSV: appended rows to aimy-stats.csv.
-   To change where stats are saved, set `aimy.statsDirectory`.

## Contributing

Found a bug or have a feature idea? Check out the [GitHub repository](https://github.com/Swif7ify/AimY/issues) and feel free to open an issue or submit a pull request.

## License

MIT - see the LICENSE file for details.

---

_Happy aiming! 🎯_
