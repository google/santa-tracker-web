
// =============================================================================
// TEAMS
// =============================================================================

export const Teams = {
  OPPONENT: 'opponent',
  PLAYER: 'player'
};

// =============================================================================
// ARENA
// =============================================================================

export const Arena = {
  WIDTH: 1200,
  HEIGHT: 900,
  BACKGROUND_COLOR: '#ffffff',
  BORDER_COLOR: '#333333',
  BORDER_WIDTH: 3,
  CENTER_LINE_COLOR: 'rgba(0, 0, 0, 0.15)',
  CENTER_LINE_WIDTH: 2,
  OUT_OF_BOUNDS_MARGIN: 50
};

// =============================================================================
// ELF
// =============================================================================

export const Elf = {
  RADIUS: 20,
  SPEED: 200,                    // pixels per second
  STROKE_WIDTH: 2,
  STROKE_COLOR: '#ffffff',
  WANDER_INTERVAL: 2,            // seconds between picking new wander target
  WANDER_MARGIN: 30,             // radius + 10, margin from arena edges
};

export const ElfColors = {
  PLAYER: '#3498db',             // Blue
  OPPONENT: '#e74c3c',           // Red
  SELECTION_RING: '#f1c40f',     // Yellow
  SELECTION_RING_OFFSET: 5,
  SELECTION_RING_WIDTH: 3
};

// =============================================================================
// PLAYER AI (helper elves)
// =============================================================================

export const PlayerAI = {
  SEEK_SNOWBALL_CHANCE: 0.7,           // % chance to go for snowball
  SEEK_COOLDOWN_AFTER_SEEK: 3,         // base seconds to wait after seeking
  SEEK_COOLDOWN_RANDOM_EXTRA: 2,       // random extra seconds (0-2)
  SEEK_COOLDOWN_AFTER_CHECK: 1.5       // seconds to wait before checking again
};

// Config preset for player helper AI (used by updateAI)
export const PlayerAIConfig = {
  seekChance: PlayerAI.SEEK_SNOWBALL_CHANCE,
  seekCooldownAfterSeek: PlayerAI.SEEK_COOLDOWN_AFTER_SEEK,
  seekCooldownRandomExtra: PlayerAI.SEEK_COOLDOWN_RANDOM_EXTRA,
  seekCooldownAfterCheck: PlayerAI.SEEK_COOLDOWN_AFTER_CHECK
};

// =============================================================================
// OPPONENT AI
// =============================================================================

export const OpponentAI = {
  THROW_INACCURACY: 40,                // random spread in pixels when throwing
  THROW_DELAY: 1.5,                    // seconds to wander before throwing
  SEEK_SNOWBALL_CHANCE: 0.3,           // % chance to go for snowball
  SEEK_COOLDOWN_AFTER_SEEK: 2,         // seconds to wait after seeking
  SEEK_COOLDOWN_AFTER_CHECK: 2         // seconds to wait before checking again
};

// Config preset for opponent AI (used by updateAI)
export const OpponentAIConfig = {
  seekChance: OpponentAI.SEEK_SNOWBALL_CHANCE,
  seekCooldownAfterSeek: OpponentAI.SEEK_COOLDOWN_AFTER_SEEK,
  seekCooldownRandomExtra: 0,
  seekCooldownAfterCheck: OpponentAI.SEEK_COOLDOWN_AFTER_CHECK
};

// =============================================================================
// SNOWBALL
// =============================================================================

export const Snowball = {
  RADIUS: 10,
  SPEED: 500,                    // pixels per second when thrown
  FILL_COLOR: '#ffffff',
  STROKE_COLOR: '#cccccc',
  STROKE_WIDTH: 2
};

// =============================================================================
// GAMEPLAY
// =============================================================================

export const Gameplay = {
  STARTING_HEALTH: 100,
  DAMAGE_PER_HIT: 20,
  SNOWBALL_COUNT: 5,             // number of snowballs on center line
  SPAWN_RESPAWN_DELAY: 4,        // seconds until snowball respawns
  SPAWN_POINT_TOLERANCE: 5,      // pixels tolerance for spawn point detection
  FRIENDLY_FIRE: false
};

// =============================================================================
// UI COLORS
// =============================================================================

export const UIColors = {
  BACKGROUND: '#e8e8e8',

  // Game over / modals
  WIN_BACKGROUND: '#27ae60',
  WIN_BORDER: '#1e8449',
  LOSE_BACKGROUND: '#c0392b',
  LOSE_BORDER: '#922b21',

  // Buttons
  START_BUTTON: '#27ae60',
  START_BUTTON_BORDER: '#1e8449',
  RESTART_BUTTON: '#3498db',
  RESTART_BUTTON_BORDER: '#2980b9',
  HOME_BUTTON: '#7f8c8d',
  HOME_BUTTON_BORDER: '#636e72',

  // Text
  TITLE_COLOR: '#2c3e50',
  TEXT_COLOR: '#555555',
  BUTTON_TEXT_COLOR: '#ffffff'
};

// =============================================================================
// HEALTH BAR
// =============================================================================

export const HealthBar = {
  WIDTH: 200,
  HEIGHT: 20,
  BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.5)',
  BORDER_COLOR: '#ffffff',
  BORDER_WIDTH: 2,
  PLAYER_COLOR: '#3498db',
  OPPONENT_COLOR: '#e74c3c'
};
