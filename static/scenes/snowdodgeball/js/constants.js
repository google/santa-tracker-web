
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
  OUT_OF_BOUNDS_MARGIN: 50,
  // Responsive scaling
  PADDING_TOP: 60,
  PADDING_TOP_MOBILE: 20,
  PADDING_LEFT_PERCENTAGE: 2,
  ZOOM_TOUCH_DEVICE: 0
};

// =============================================================================
// ELF
// =============================================================================

export const Elf = {
  RADIUS: 20,
  SPEED: 200,                    // pixels per second
  WANDER_INTERVAL: 2,            // seconds between picking new wander target
  WANDER_MARGIN: 30,             // radius + 10, margin from arena edges
  DODGE_DISTANCE: 70,            // pixels to move when dodging
  DODGE_COOLDOWN: 0.5,           // seconds before can dodge again
  DODGE_LOCK_DURATION: 0.2,      // seconds to lock AI movement after dodge
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
// LEVELS
// =============================================================================

export const Levels = [
  {
    // Level 1: Easy
    opponentAI: {
      seekChance: 0.2,
      seekCooldownAfterSeek: 3,
      seekCooldownRandomExtra: 1,
      seekCooldownAfterCheck: 3,
      throwInaccuracy: 80,
      throwDelay: 2.5
    }
  },
  {
    // Level 2: Medium (Standard)
    opponentAI: {
      seekChance: 0.6,
      seekCooldownAfterSeek: 2,
      seekCooldownRandomExtra: 0,
      seekCooldownAfterCheck: 2,
      throwInaccuracy: 30,
      throwDelay: 1.5
    }
  },
  {
    // Level 3: Hard
    opponentAI: {
      seekChance: 0.9,
      seekCooldownAfterSeek: 1,
      seekCooldownRandomExtra: 0,
      seekCooldownAfterCheck: 1,
      throwInaccuracy: 1,
      throwDelay: 0.5
    }
  }
];

// =============================================================================
// SNOWBALL
// =============================================================================

export const Snowball = {
  RADIUS: 10,
  SPEED: 500,                    // pixels per second when thrown
  PICKUP_RADIUS: 30,             // pickup radius for spawned snowballs
  DROPPED_PICKUP_RADIUS: 70,     // larger pickup radius for dropped snowballs
  OPPONENT_PICKUP_RADIUS: 60     // pickup radius for opponents
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
