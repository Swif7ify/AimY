# Changelog

All notable changes to AimY will be documented in this file.

## [0.0.1] - 2025-01-05

### Added

-   Initial release of AimY
-   Automatic idle detection with configurable timer
-   Fullscreen target practice game
-   Customizable target behavior (size, movement, count)
-   Performance tracking with JSON/CSV export
-   Status bar toggle for quick enable/disable
-   Complete workspace restoration after games
-   Comprehensive settings configuration

## [0.0.4] - 2025-01-05

### Added

-   Configurable sound effects and master volume (`aimy.enableSoundEffects`, `aimy.soundVolume`)
-   Optional background music/synth in the webview (toggleable)
-   Visual effects toggle (`aimy.enableEffects`) to disable particles, +points and MISS UI
-   Stats saving improvements:
    -   Support for JSON and CSV (`aimy.statsFormat`)
    -   Configurable stats output directory (`aimy.statsDirectory`)
    -   Saved stats now include the game settings used for the run
-   New command registrations and activation events (`aimy.startGame`, `aimy.toggle`)
-   "Reset to defaults" setting implemented (`aimy.resetDefaultSettings`)
-   README and packaging metadata updates (publisher, repository, icon)

## [0.0.5] - 2025-01-06

### Added

-   Added timeout in (`vscode.window.showInformationMessage()`)

## [0.0.6] - 2025-01-06

### Added

-   Added demo images for visualization

## [0.0.7] - 2025-01-06

### Added

-   Changed display name from AimY to AimY - Aim Trainer

## [0.0.8] - 2025-01-06

### Added

-   Game visuals and HUD now match your editor’s dark or light theme.
-   Changed cursor design and color now match your editor's dark or light theme.

## [0.0.10] - 2025-01-06

### Added

-   Enforced configuration limits in the Settings UI and at runtime to prevent out-of-range values:
    -   idleTimer: 1000–3600000 ms
    -   targetGoals: 1–100
    -   targetSpeed: 100–60000 ms
    -   targetSize: 10–1000 px
    -   targetTimeExists: 0–60000 ms
    -   soundVolume: 0–100
-   Runtime clamping added to extension to silently correct invalid settings edited manually.

### Features

-   🎯 Interactive target shooting game
-   ⚙️ Fully customizable game parameters
-   📊 Detailed performance statistics
-   🔄 Automatic workspace management
-   🎮 Manual game trigger command
