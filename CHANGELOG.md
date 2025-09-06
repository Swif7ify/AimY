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



### Features

-   🎯 Interactive target shooting game
-   ⚙️ Fully customizable game parameters
-   📊 Detailed performance statistics
-   🔄 Automatic workspace management
-   🎮 Manual game trigger command
