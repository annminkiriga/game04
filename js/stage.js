// ■stage.js

/**
 * stage.js
 * 盤面の生成、マスの状態、視覚効果を管理
 * ※重複定義エラー回避版
 */

if (typeof Stage === 'undefined') {

    // 定数をグローバル（window）に登録
    window.GRID_SIZE = 9;
    window.CELL_RAW_SIZE = 38;
    window.GAP = 2;

    // クラスをグローバルに登録
    window.Stage = class Stage {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.cells = []; // 2次元配列でマスを保持
            this.init();
        }

        // 9x9の盤面を生成
        init() {
            // 既存のセルがあれば一旦削除（リトライ時の二重生成防止）
            const existingCells = this.container.querySelectorAll('.cell');
            existingCells.forEach(c => c.remove());

            for (let y = 0; y < GRID_SIZE; y++) {
                this.cells[y] = [];
                for (let x = 0; x < GRID_SIZE; x++) {
                    const c = document.createElement('div');
                    c.className = 'cell';
                    c.dataset.x = x;
                    c.dataset.y = y;
                    this.container.appendChild(c);
                    this.cells[y][x] = c;
                }
            }
        }

        // 指定座標を「通過済み（黄色）」状態にする
        // stage.js 内
markAsPassed(x, y) {
  const cell = this.container.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
  if (cell) {
    cell.classList.add('passed');
  }
}

// 魔法発動後にタイルを消去（元に戻す）するメソッド
clearTile(x, y) {
  const cell = this.container.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
  if (cell) {
    cell.classList.remove('passed');
    // 完全に初期の色に戻す場合はこれだけでOK
  }
}

        // タップされた瞬間の波紋エフェクト
        showTapEffect(x, y) {
            const e = document.createElement('div');
            e.className = 'tap-effect';
            const s = CELL_RAW_SIZE + GAP;
            e.style.left = (x * s + 2) + 'px';
            e.style.top = (y * s + 2) + 'px';
            this.container.appendChild(e);
            setTimeout(() => e.remove(), 500);
        }

        // 指定座標に爆発エフェクトを出す（魔法用）
        // stage.js 内の showExplosion メソッドを上書き

showExplosion(x, y) {
  const s = CELL_RAW_SIZE + GAP;
  const px = x * s;
  const py = y * s;

  // 1. 魔法の紋章を生成
  const crest = document.createElement('div');
  crest.className = 'magic-explosion';
  crest.style.left = px + 'px';
  crest.style.top = py + 'px';
  this.container.appendChild(crest);

  // 2. 魔法の粒子を生成（4方向に飛ばす）
  for (let i = 0; i < 4; i++) {
    const p = document.createElement('div');
    p.className = 'magic-particle';
    p.style.left = (px + 17) + 'px'; // マスの中心付近
    p.style.top = (py + 17) + 'px';
    
    // 飛ぶ方向と距離をランダムに設定
    const angle = i * 90 + (Math.random() - 0.5) * 45; // 4方向＋ランダム
    const dist = 30 + Math.random() * 20;
    p.style.setProperty('--dx', `${Math.cos(angle * Math.PI / 180) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(angle * Math.PI / 180) * dist}px`);
    
    this.container.appendChild(p);
    
    // 0.5秒後に粒子を消去
    setTimeout(() => p.remove(), 500);
  }

  // 3. 0.6秒後に紋章を消去
  setTimeout(() => crest.remove(), 600);
}

        // 指定座標のHTML要素を取得
        getCellElement(x, y) {
            if (this.cells[y] && this.cells[y][x]) {
                return this.cells[y][x];
            }
            return null;
        }
    };
}
