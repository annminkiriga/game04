// ■levels.js

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
  6: {
    enemies: [
      { x: 0, y: 0, type: 'F' }
    ],
    statusMsg: "STAGE 006: SPIRAL"
  },
  7: {
    enemies: [
      { x: 2, y: 2, type: 'B', radius: 80 }, // 左上（半径2マス分で回転）
      { x: 6, y: 2, type: 'B', radius: 80 }, // 右上
      { x: 4, y: 6, type: 'B', radius: 80 }  // 中央下
    ],
    statusMsg: "STAGE 007: TRIPLE CIRCLES"
  },
// ★ ここに追加：STAGE 008 (前のやつ)
  8: {
    enemies: [
      { x: 0, y: 2, type: 'G' }, // 左端スタート（横往復）
      { x: 0, y: 6, type: 'G' }, // 左端スタート（横往復）
      { x: 2, y: 8, type: 'H' }, // 下端スタート（縦往復）
      { x: 6, y: 8, type: 'H' }  // 下端スタート（縦往復）
    ],
    statusMsg: "STAGE 008: CROSSING LINES"
  },
  // ★ ここに追加：STAGE 009 (前のやつ)
  9: {
    enemies: [
      { x: 1, y: 0, type: 'I' },
      { x: 7, y: 8, type: 'I' }
    ],
    statusMsg: "STAGE 009: BOUNCING BALLS"
  },
  // ★ 新設：STAGE 010（中ボスとして配置）
  10: {
    enemies: [
      { x: 4, y: 4, type: 'U' } 
    ],
    statusMsg: "STAGE 010: BOSS ENCOUNTER"
  },

  // ★ 旧10を11へ
  11: {
    enemies: [
      { x: 4, y: 1, type: 'J', radius: 100 },
      { x: 4, y: 7, type: 'K', radius: 100 }
    ],
    statusMsg: "STAGE 011: TWIN PENTAGRAMS"
  },

  // ★ 旧11を12へ
  12: {
    enemies: [
      { x: 4, y: 2, type: 'L', radius: 95 },
      { x: 4, y: 6, type: 'M', radius: 95 }
    ],
    statusMsg: "STAGE 012: HEXAGRAM"
  },

  // ★ 旧12を13へ
  13: {
    enemies: [
      { x: 2, y: 2, type: 'C' },
      { x: 6, y: 2, type: 'C' },
      { x: 2, y: 6, type: 'C' },
      { x: 6, y: 6, type: 'C' }
    ],
    statusMsg: "STAGE 013: QUAD SQUARES"
  },

  // ★ 旧13を14へ
  14: {
    enemies: [
      { x: 0, y: 0, type: 'N' }, 
      { x: 8, y: 0, type: 'N' }, 
      { x: 0, y: 8, type: 'N' }, 
      { x: 8, y: 8, type: 'N' }  
    ],
    statusMsg: "STAGE 014: CROSSING DIAGONALS"
  },

  // ★ 旧14を15へ
  15: {
    enemies: [
      { x: 3, y: 3, type: 'B', radius: 80, noPause: true },
      { x: 5, y: 3, type: 'B', radius: 80, noPause: true },
      { x: 4, y: 4, type: 'B', radius: 80, noPause: true },
      { x: 3, y: 5, type: 'P', radius: 80, noPause: true },
      { x: 5, y: 5, type: 'P', radius: 80, noPause: true }
    ],
    statusMsg: "STAGE 015: NON-STOP CIRCLES"
  },

  // ★ 旧15を16へ
  16: {
    enemies: [
      { x: 4, y: 2, type: 'Q', radius: 120, noPause: true },
      { x: 4, y: 2, type: 'R', radius: 120, noPause: true }
    ],
    statusMsg: "STAGE 016: TWIN HEARTS"
  },

  // ★ 旧16を17へ
  17: {
    enemies: [
      { x: 8, y: 2, type: 'S', noPause: true }, 
      { x: 0, y: 4, type: 'S', noPause: true }, 
      { x: 8, y: 6, type: 'S', noPause: true }  
    ],
    statusMsg: "STAGE 017: FAST NON-STOP WAVES"
  },

  // ★ 旧17（ボス）を18へ（最終試練として再配置）
  18: {
    enemies: [
      { x: 4, y: 4, type: 'U' } 
    ],
    statusMsg: "STAGE 018: THE FINAL STAR"
  }
};