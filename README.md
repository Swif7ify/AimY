# <div><img width="60" height="60" alt="icon" src="https://github.com/user-attachments/assets/a8b27b56-59c6-4ef6-9e55-19e4badd7889" /> AimY</div>


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

1. Install from the VS Code Marketplace
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

| Setting                | Default  | Description                                  |
| ---------------------- | -------- | -------------------------------------------- |
| `aimy.enableExtension` | `true`   | Enable/disable automatic game triggering     |
| `aimy.idleTimer`       | `60000`  | Idle time in milliseconds before game starts |
| `aimy.targetGoals`     | `5`      | Number of targets to hit per game            |
| `aimy.targetSize`      | `100`    | Target diameter in pixels                    |
| `aimy.targetMove`      | `false`  | Enable moving targets for extra challenge    |
| `aimy.targetSpeed`     | `3000`   | Target movement/spawn speed                  |
| `aimy.statsFormat`     | `"json"` | Save format: "json" or "csv"                 |

## Why AimY?

I built this because I noticed I'd often get stuck in long coding sessions without proper breaks. Traditional break reminders were easy to ignore, but having to actually complete a quick aim challenge before getting back to work ensures you take that mental reset.

The side benefit of improved mouse precision is just a bonus!

## Stats & Privacy

-   All stats are saved locally on your machine
-   No data is sent anywhere
-   You can configure where stats are saved
-   JSON format creates one file per session
-   CSV format appends to a single file for easy analysis

## Contributing

Found a bug or have a feature idea? Check out the [GitHub repository](https://github.com/Swif7ify/AimY/issues) and feel free to open an issue or submit a pull request.

## License

MIT - see the LICENSE file for details.

---

_Happy aiming! 🎯_
