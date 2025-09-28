# Changelog

All notable changes to AimY will be documented in this file.

## [0.1.0] - 2025-09-28

### Added

-   **3D Game Mode**: Completely new immersive 3D aiming experience (Experimental)
    -   Full 3D environment with target boards and spatial depth
    -   FPS-style pointer lock controls for authentic aiming
    -   Optimized 3D rendering with Three.js for smooth performance
    -   Targets spawn on a dedicated target board in front of the player
    -   3D particle effects and hit detection
-   **Visual Mode Selection**: New `aimy.gameVisualMode` setting
    -   Choose between "2D" (classic) or "3D" (immersive) game modes
    -   Each mode maintains the same gameplay mechanics and features
    -   Stats tracking works across both visual modes
-   **Enhanced 3D Features**:
    -   Target board with proper positioning and boundaries
    -   Crosshair system optimized for 3D aiming
    -   Movement controls (WASD) with FPS-style camera
    -   Optimized lighting and shadow system
    -   Clean 3D environment without performance overhead

### Improved

-   **Performance Optimizations**: 3D mode includes multiple performance enhancements
    -   Limited pixel ratio for better frame rates
    -   Optimized shadow mapping and lighting
    -   Efficient geometry and material usage
    -   Reduced polygon counts for smooth gameplay
-   **Cross-Mode Compatibility**: All existing features work in both 2D and 3D
    -   All game modes (Target Rush, Time Frenzy, Hydra Targets) supported
    -   Difficulty presets apply to both visual modes
    -   Sound effects and visual effects work in 3D
    -   Stats saving includes visual mode information

### Technical

-   Added Three.js integration for 3D rendering
-   Implemented PointerLockControls for FPS-style aiming
-   Created optimized 3D target system with proper hit detection
-   Added 3D scene management and cleanup
-   Maintained backward compatibility with existing 2D mode

## [0.0.14] - 2025-09-27

### Changed

-   **Improved Difficulty Presets**: Difficulty presets now work as true presets without modifying user settings
    -   When selecting Easy/Normal/Hard/Very Hard: Game uses preset values but your configured settings remain unchanged
    -   When selecting Custom: Game uses your personal configured settings
    -   Stats tracking now saves the actual values used in the game (preset or custom)
    -   Settings UI shows your configured values regardless of selected difficulty preset

### Fixed

-   Difficulty presets no longer overwrite user's configured target settings
-   Stats files now accurately reflect the game parameters that were actually used during play
-   Switching between presets and back to Custom properly restores user's original settings

## [0.0.13] - 2025-09-16

### Added

-   **Game Modes**: Three distinct game modes now available:
    -   **Target Rush** (classic): Hit X targets to complete the session
    -   **Time Frenzy**: Hit as many targets as possible within a time limit (60 seconds default)
    -   **Hydra Targets**: 3 simultaneous targets with two sub-modes:
        -   Target Count mode: Hit X targets total (20 default) with 3 always on screen
        -   Timed mode: Hit as many as possible within time limit with 3 always on screen
-   **Enhanced Stats Tracking**: CSV and JSON exports now include comprehensive game data:
    -   All game mode settings (timeFrenzyDuration, hydraMode, hydraTargetCount, etc.)
    -   Complete difficulty and target configuration used for each session
    -   Audio/visual settings and extension behavior settings
    -   Separate tracking of played gameMode vs configured gameMode
-   **Hydra Targets Optimizations**:
    -   Target movement automatically disabled in Hydra mode for better gameplay
    -   Target timeout (targetTimeExists) automatically set to 0 in Hydra mode
    -   Maintains exactly 3 targets on screen at all times

### Changed

-   Stats files now contain much more detailed information for better analysis
-   Game mode selection affects target behavior automatically (movement, timeout, spawn count)

## [0.0.12] - 2025-09-13

### Added

-   Difficulty presets (easy, normal, hard, very hard, custom). Selecting a preset applies balanced game parameter sets (targets, size, movement, speed).

### Changed

-   Safer workspace handling: when `aimy.closeWorkspaceOnGameStart` is enabled, the extension now only closes editors that are not dirty (no unsaved changes). Dirty editors are left open to avoid "Do you want to save changes?" prompts; only the tabs actually closed are restored after the game.

## [0.0.11] - 2025-01-08

### Added

-   Added `aimy.closeWorkspaceOnGameStart` setting to control whether open editors are closed when a game starts. When disabled, the extension will not close editors and will instead return focus to the game if you switch tabs.

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

## [0.0.8] - 2025-01-06

### Added

-   Game visuals and HUD now match your editor's dark or light theme.
-   Changed cursor design and color now match your editor's dark or light theme.

## [0.0.7] - 2025-01-06

### Added

-   Changed display name from AimY to AimY - Aim Trainer

## [0.0.6] - 2025-01-06

### Added

-   Added demo images for visualization

## [0.0.5] - 2025-01-06

### Added

-   Added timeout in (`vscode.window.showInformationMessage()`)

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
