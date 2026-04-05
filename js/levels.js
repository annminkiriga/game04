// ■levels.js

/**
 * levels.js
 * 各ステージの構成データを一括管理
 */

const GAME_LEVELS = {
  1: {
    enemyX: 8,
    enemyY: 8,
    enemyType: 'A',
    statusMsg: "STAGE 001: CHASE"
  },
  2: {
    enemyX: 4,
    enemyY: 4,
    enemyType: 'B',
    radius: 120, // パターンB(円形)用の半径
    statusMsg: "STAGE 002: CIRCLE"
  },
  3: {
    enemyX: 4,
    enemyY: 4,
    enemyType: 'C',
    statusMsg: "STAGE 003: SQUARE"
  },
  4: {
    enemyX: 4,
    enemyY: 4,
    enemyType: 'D',
    statusMsg: "STAGE 004: CROSS"
  },
  5: {
    enemies: [
      { x: 8, y: 8, type: 'E' },
      { x: 0, y: 8, type: 'E' }
    ],
    statusMsg: "STAGE 005: TWIN CHASERS"
  },
};