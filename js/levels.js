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
  // ★ Level 3 はそのまま（自動的に元の「角から角へ一気移動」になります）
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

  // ★ 修正：STAGE 012（十字ジャンプ 'D' に戻し、相反する動きを再設定）
  12: {
    enemies: [
      // 上からスタート：最初は「下(startStep: 1)」へジャンプ
      { x: 4, y: 2, type: 'D', startStep: 1 }, 
      // 下からスタート：最初は「上(startStep: 0)」へジャンプ
      { x: 4, y: 6, type: 'D', startStep: 0 }
    ],
    statusMsg: "STAGE 012: CROSSING JUMP"
  },

  // ★ 旧12を13へ
  13: {
    enemies: [
      // ★ それぞれの初期位置を独立した中心(centerX, centerY)とし、1マス分の距離(dist: 1)で回るように設定
      { x: 2, y: 2, type: 'C', centerX: 2, centerY: 2, dist: 1 },
      { x: 6, y: 2, type: 'C', centerX: 6, centerY: 2, dist: 1 },
      { x: 2, y: 6, type: 'C', centerX: 2, centerY: 6, dist: 1 },
      { x: 6, y: 6, type: 'C', centerX: 6, centerY: 6, dist: 1 }
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

  // ★ 旧17（波線）
  17: {
    enemies: [
      { x: 8, y: 2, type: 'S', noPause: true }, 
      { x: 0, y: 4, type: 'S', noPause: true }, 
      { x: 8, y: 6, type: 'S', noPause: true }  
    ],
    statusMsg: "STAGE 017: FAST NON-STOP WAVES"
  },

  // ★ STAGE 018 (AとEの混合追尾)
  18: {
    enemies: [
      { x: 8, y: 0, type: 'A', speed: 30 },
      { x: 0, y: 8, type: 'E' }  
    ],
    statusMsg: "STAGE 018: MIXED CHASERS"
  },
  // ★ STAGE 019 (交差する大円 ＋ E)
  19: {
    enemies: [
      { x: 3, y: 4, type: 'B', radius: 100, noPause: true, startAngle: 0 }, 
      { x: 5, y: 4, type: 'P', radius: 100, noPause: true, startAngle: Math.PI }, 
      { x: 4, y: 8, type: 'E' } 
    ],
    statusMsg: "STAGE 019: OVERLAPPING GEARS"
  },

  // ★ STAGE 020（2体目のボス）
  20: {
    enemies: [
      { x: 4, y: 0, type: 'V' } 
    ],
    statusMsg: "STAGE 020: REFLECTING DIAMOND"
  },

  // ★ 巨大な図形には stepMode: 'smooth' を追加
  21: {
    enemies: [
      { x: 2, y: 2, type: 'C', radius: 80, startStep: 2, noPause: true, stepMode: 'smooth' }, 
      { x: 5.414, y: 2.586, type: 'B', radius: 80, startAngle: Math.PI * 0.75, noPause: true }, 
      { x: 4, y: 6, type: 'L', radius: 80, noPause: true, stepMode: 'smooth' }
    ],
    statusMsg: "STAGE 021: CONVERGENCE"
  },

  22: {
    enemies: [
      { x: 4, y: 3, type: 'C', dist: 1 }, // 1層目 (3x3)
      { x: 4, y: 2, type: 'C', dist: 2 }, // 2層目 (5x5)
      { x: 4, y: 1, type: 'C', dist: 3 }  // 3層目 (7x7)
    ],
    statusMsg: "STAGE 022: TRIPLE BOXES"
  },

  // ★ 新設：STAGE 023（4つの円の交差）
  23: {
    enemies: [
      // 左上（時計回り 'B'）: (4,4)で合体するため、45度の位置からスタート
      { x: 2.232, y: 2.232, type: 'B', radius: 100, startAngle: Math.PI * 0.25, noPause: true }, 
      
      // 左下（時計回り 'B'）: (4,4)で合体するため、-45度の位置からスタート
      { x: 2.232, y: 5.768, type: 'B', radius: 100, startAngle: -Math.PI * 0.25, noPause: true }, 
      
      // 右上（反時計回り 'P'）: (4,4)で合体するため、135度の位置からスタート
      { x: 5.768, y: 2.232, type: 'P', radius: 100, startAngle: Math.PI * 0.75, noPause: true }, 

      // 右下（反時計回り 'P'）: (4,4)で合体するため、-135度の位置からスタート
      { x: 5.768, y: 5.768, type: 'P', radius: 100, startAngle: -Math.PI * 0.75, noPause: true }
    ],
    statusMsg: "STAGE 023: QUAD RINGS" // （意味：4つの輪）
  },

  // ★ 新設：STAGE 024（ダブルスパイラル）
  24: {
    enemies: [
      // 外側から中心へ（radiusを2にして2倍速、noPauseでノンストップ）
      { x: 0, y: 0, type: 'F', radius: 2, noPause: true }, 
      
      // 中心から外側へ（startStep: 1 で中心スタート、radius: 2 で2倍速）
      { x: 0, y: 0, type: 'F', radius: 2, startStep: 1, noPause: true } 
    ],
    statusMsg: "STAGE 024: DOUBLE SPIRAL" 
  },

  // ★ 25：CROSSING LINES 強化版（縦3・横3）
  25: {
    enemies: [
      { x: 0, y: 1, type: 'G' }, 
      { x: 0, y: 4, type: 'G' }, 
      { x: 0, y: 7, type: 'G' }, 
      { x: 1, y: 8, type: 'H' }, 
      { x: 4, y: 8, type: 'H' }, 
      { x: 7, y: 8, type: 'H' }
    ],
    statusMsg: "STAGE 025: HEXA-CROSSING"
  },

  26: {
    enemies: [
      { x: 2, y: 4, type: 'W' }, // 左側の円形スパイラル
      { x: 6, y: 4, type: 'W' }  // 右側の円形スパイラル
    ],
    message: "Level 26: Radial Spiral"
  },

  27: {
    enemies: [
      { x: 0, y: 0, type: 'X' }, // 左上から
      { x: 4, y: 2, type: 'X' }  // 画面中央付近から（タイミングをずらす）
    ],
    message: "Level 27: Chaotic Reflection"
  },

  28: {
    enemies: [
      // x: 1(左から2マス目) ～ 7(左から8マス目) の計7体
      // y: 1マスずつ階段状にずらして、完全な斜め一列のウェーブを作成
      { x: 1, y: 8, type: 'H' }, // 1体目（下端）
      { x: 2, y: 7, type: 'H' }, // 2体目
      { x: 3, y: 6, type: 'H' }, // 3体目
      { x: 4, y: 5, type: 'H' }, // 4体目（中央）
      { x: 5, y: 4, type: 'H' }, // 5体目
      { x: 6, y: 3, type: 'H' }, // 6体目
      { x: 7, y: 2, type: 'H' }  // 7体目（上端寄り）
    ],
    statusMsg: "STAGE 028: SEVEN-WAVE"
  },

  29: {
    enemies: [
      // 外側：直径9マス (半径4マス=160px) / B（時計回り）
      { x: 4, y: 4, type: 'B', radius: 160, noPause: true },
      
      // 中間：直径7マス (半径3マス=120px) / P（反時計回り）
      { x: 4, y: 4, type: 'P', radius: 120, noPause: true },
      
      // 内側：直径5マス (半径2マス=80px) / B（時計回り）
      { x: 4, y: 4, type: 'B', radius: 80, noPause: true }
    ],
    statusMsg: "STAGE 029: TRIPLE RINGS"
  },

  30: {
    enemies: [
      // 上部(4, 1)に配置。突進スピードを少し速め(speed: 25)にしています。
      { x: 4, y: 1, type: 'AZ', speed: 13 } 
    ],
    statusMsg: "STAGE 030: BOOMERANG STRIKE"
  },

  // levels.js

  31: {
    enemies: [
      // 高速スパイラル（F）：radiusを「2」や「3」にすると2倍・3倍の猛スピードになります
      { x: 0, y: 0, type: 'F', radius: 3 }, 
      
      // 横往復（G）：左端からスタートし、画面中央(y=4)を右へ
      { x: 0, y: 4, type: 'G' },
      
      // 縦往復（H）：下端からスタートし、画面中央(x=4)を上へ
      { x: 4, y: 8, type: 'H' }
    ],
    statusMsg: "STAGE 031: FAST SPIRAL & CROSS"
  },

  32: {
    enemies: [
      // 1体目：中心から広がる (radiusを4マスにし、speedを15でゆっくりに)
      { x: 4, y: 4, type: 'W', radius: 4, startStep: 1, speed: 15 },
      
      // 2体目：外側から縮む (同じく大きく、ゆっくりに)
      { x: 4, y: 4, type: 'W', radius: 4, startStep: 2, startAngle: Math.PI, speed: 15 }
    ],
    statusMsg: "STAGE 032: DUAL BREATH"
  },

  33: {
    enemies: [
      // 📝 speedの数値をいろいろ変えて、緊張感とクリアのバランスを探ってみてください！
      // （指定しなければ自動的にレベルに応じた上限50付近の速度になります）
      { x: 8, y: 0, type: 'A', speed: 30 }, // 右上
      { x: 0, y: 8, type: 'A', speed: 30 }, // 左下
      { x: 8, y: 8, type: 'A', speed: 30 }  // 右下
    ],
    statusMsg: "STAGE 033: TRIPLE HUNTERS"
  },

  34: {
    enemies: [
      // N, O (斜め：以前の設定を維持)
      { x: 0, y: 0, type: 'N' }, { x: 8, y: 8, type: 'N' },
      { x: 8, y: 0, type: 'O' }, { x: 0, y: 8, type: 'O' },

      // G (横：左右から中心へ)
      { x: 0, y: 4, type: 'G', sync: 1 },  // 左端から右(1)へ
      { x: 8, y: 4, type: 'G', sync: -1 }, // 右端から左(-1)へ

      // H (縦：上下から中心へ)
      { x: 4, y: 0, type: 'H', sync: 1 }, // 上から下へ
      { x: 4, y: 8, type: 'H' },          // 下から上へ（デフォルト）
    ],
    statusMsg: "STAGE 034: CROSS OVER"
  },

  35: {
    enemies: [
      // 1体目：上からスタートして時計回り
      { x: 4, y: 0, type: 'V2', speed: 30 },
      // 2体目：下からスタートして時計回り（追いかけっこ状態）
      { x: 4, y: 8, type: 'V2', speed: 30 }
    ],
    statusMsg: "STAGE 035: DIAMOND CIRCLE"
  },

  36: {
    enemies: [
      { x: 4, y: 4, type: 'B2', radius: 4, speed: 15 }, // 縦に大きくゆっくり
      { x: 4, y: 4, type: 'B3', radius: 4, speed: 15 }  // 横に大きくゆっくり
    ],
    statusMsg: "STAGE 036: INFINITY DANCE"
  },

  37: {
    enemies: [
      // 上段：左から右へ波打つ
      { x: 0, y: 1, type: 'S', speed: 30, noPause: true },
      // 中段：右から左へ波打つ（中央を陣取る）
      { x: 8, y: 4, type: 'T', speed: 30, noPause: true },
      // 下段：左から右へ波打つ
      { x: 0, y: 7, type: 'S', speed: 30, noPause: true },
      
      // 追跡者：プレイヤーをじわじわと追い詰める
      { x: 8, y: 0, type: 'E', speed: 30 }
    ],
    statusMsg: "STAGE 037: WAVE & CHASE"
  },

  38: {
    enemies: [
      { x: 2, y: 2, type: 'W', radius: 1.8, speed: 30, sync: true },
      { x: 6, y: 2, type: 'W', radius: 1.8, speed: 30, sync: true },
      { x: 2, y: 6, type: 'W', radius: 1.8, speed: 30, sync: true },
      { x: 6, y: 6, type: 'W', radius: 1.8, speed: 30, sync: true }
    ],
    statusMsg: "STAGE 038: SYNCHRO SPIRAL"
  },

  39: {
    enemies: [
      // 1体目：左上から右下へ
      { x: 0, y: 0, type: 'I' },
      
      // 2体目：右下から左上へ（対角線）
      { x: 8, y: 8, type: 'I' },
      
      // 3体目：中央上端から発進して、左右の壁も使って跳ね回る
      // 初期位置を中央にすることで、他の2体とは違うリズムを生み出します
      { x: 4, y: 0, type: 'I' }
    ],
    statusMsg: "STAGE 039: TRIPLE BOUNCE"
  },

  40: {
    enemies: [
      { 
        x: 4, y: 4, // 画面のど真ん中からスタート
        type: 'BZ', 
        isBoss: true, 
        hp: 9, 
        color: '#FFD700',
        statusMsg: "BOSS: Z-MASTER" 
      }
    ],
    statusMsg: "STAGE 040: THE Z-MASTER"
  },

  // ★ 41：最終ボス（暫定ラスト）
  41: {
    enemies: [
      { x: 4, y: 4, type: 'U' } 
    ],
    statusMsg: "STAGE 029: THE FINAL STAR"
  }
};
