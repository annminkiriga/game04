// ■enemy.js

/**
 * enemy.js (パターンB対応・完全版)
 */
class Enemy {
  constructor(stage, x, y, type = 'A') {
    this.stage = stage;
    this.type = type; // 'A' or 'B'
    this.isAlive = true;

    const s = CELL_RAW_SIZE + GAP;
    // 中心の座標を保持
    this.startX = x * s + 2; 
    this.startY = y * s + 2;
    this.px = this.startX;
    this.py = this.startY;

    // パターンB(円形)用の設定
    this.angle = 0; 
    this.radius = 65; // 半径(約1.5マス分)
    this.isPausing = false;

    this.element = this.createEnemy();
    this.updateVisual();
  }

  createEnemy() {
    const e = document.createElement('div');
    e.id = 'enemy';
    e.innerText = '★';
    this.stage.container.appendChild(e);
    return e;
  }

  // game.jsから毎フレーム呼ばれるメインメソッド
  move(playerX, playerY, level) {
    if (!this.isAlive || this.isPausing) return;

    if (this.type === 'A') {
      this.moveTowards(playerX, playerY, level);
    } else if (this.type === 'B') {
      this.moveCircle();
    } else if (this.type === 'C') {
      this.moveSquare();
    } else if (this.type === 'D') { // ★追加
      this.moveCross();
    } else if (this.type === 'E') { // ★ここに追加
      this.moveSteadyChase(playerX, playerY);
    }
  }

  // パターンA: 追跡移動
  moveTowards(playerX, playerY, level = 1) {
    const s = CELL_RAW_SIZE + GAP;
    const targetPx = playerX * s + 2;
    const targetPy = playerY * s + 2;
    const dx = targetPx - this.px;
    const dy = targetPy - this.py;
    const angle = Math.atan2(dy, dx);

    // 速度調整
    const speed = 40 + (level * 5); 
    this.px += Math.cos(angle) * speed;
    this.py += Math.sin(angle) * speed;

    this.keepInside();
    this.updateVisual();
  }

  // パターンB: 円形移動
  moveCircle() {
    // 1回の移動で30度(約0.52ラジアン)進む
    this.angle += 0.52; 
    this.px = this.startX + Math.cos(this.angle) * this.radius;
    this.py = this.startY + Math.sin(this.angle) * this.radius;

    // 1周したら1秒止まる
    if (this.angle >= Math.PI * 2) {
      this.angle = 0;
      this.isPausing = true;
      setTimeout(() => { this.isPausing = false; }, 1000);
    }
    this.keepInside();
    this.updateVisual();
  }

// ★新しく追加：四角形移動（パターンC）
    moveSquare() {
    // 1マス40px単位。r = 40 なら、中心から上下左右に1マス分移動する
    const stepSize = 40; 
    const r = stepSize * 1; // ここを 1 にすると、3x3マスの外周を歩くようになります

    // 4つの角（マスの中心にピッタリ重なる座標）
    const corners = [
      { dx: -r, dy: -r }, // 左上マスの中心
      { dx:  r, dy: -r }, // 右上マスの中心
      { dx:  r, dy:  r }, // 右下マスの中心
      { dx: -r, dy:  r }  // 左下マスの中心
    ];

    if (this.squareStep === undefined) this.squareStep = 0;

    const t = corners[this.squareStep];
    
    // startX, startY は (4,4)マスの中心付近にあるので、
    // そこに r (40px) を加減算することで、隣のマスの中心へピタッと移動します
    this.px = this.startX + t.dx;
    this.py = this.startY + t.dy;

    this.squareStep = (this.squareStep + 1) % 4;

    if (this.squareStep === 0) {
      this.isPausing = true;
      setTimeout(() => { this.isPausing = false; }, 1000);
    }

    this.keepInside();
    this.updateVisual();
  }

// ★新しく追加：十字移動（パターンD）
  moveCross() {
    const s = 40; 
    const r = s * 2; // 2マス分移動

    // 十字の4点（上、下、左、右）
    const points = [
      { dx: 0,  dy: -r }, // 上
      { dx: 0,  dy:  r }, // 下
      { dx: -r, dy:  0 }, // 左
      { dx:  r, dy:  0 }  // 右
    ];

    if (this.crossStep === undefined) this.crossStep = 0;

    const t = points[this.crossStep];
    this.px = this.startX + t.dx;
    this.py = this.startY + t.dy;

    this.crossStep = (this.crossStep + 1) % 4;

    this.isPausing = true;
    setTimeout(() => { this.isPausing = false; }, 800);

    this.keepInside();
    this.updateVisual();
  }

  // ★ ここに追加：パターンE：一定速度・ノンストップ追跡 ★
  // ★ パターンE：斜め移動対応版
  moveSteadyChase(playerX, playerY) {
    const s = CELL_RAW_SIZE + GAP;
    let gx = Math.round((this.px - 2) / s);
    let gy = Math.round((this.py - 2) / s);

    // X軸の移動判断
    if (gx < playerX) gx++;
    else if (gx > playerX) gx--;

    // Y軸の移動判断（else if ではなく if にすることで、XとYを同時に動かせる）
    if (gy < playerY) gy++;
    else if (gy > playerY) gy--;

    this.px = gx * s + 2;
    this.py = gy * s + 2;

    this.updateVisual();
  }

  // 以下、共通メソッド（既存と同じ）
  moveRandom() {
    if (!this.isAlive || this.type !== 'A') return;
    const angle = Math.random() * Math.PI * 2;
    const dist = 25;
    this.px += Math.cos(angle) * dist;
    this.py += Math.sin(angle) * dist;
    this.keepInside();
    this.updateVisual();
  }

  keepInside() {
    const max = (GRID_SIZE - 1) * (CELL_RAW_SIZE + GAP);
    if (this.px < 2) this.px = 2;
    if (this.px > max) this.px = max;
    if (this.py < 2) this.py = 2;
    if (this.py > max) this.py = max;
  }

  updateVisual() {
    if (!this.isAlive) return;

    if (this.type === 'E') {
      // 1sかけて動く命令に対し、1s（1000ms）のアニメ時間を設定
      // linear（等速）にすることで、次の命令と繋がってスムーズになります
      this.element.style.transition = "left 1s linear, top 1s linear";
    } else {
      // A〜Dタイプ
      this.element.style.transition = "left 0.3s ease-out, top 0.3s ease-out";
    }

    this.element.style.left = this.px + 'px';
    this.element.style.top = this.py + 'px';
  }

  die() {
    if (!this.isAlive) return;
    this.isAlive = false;
    this.element.style.animation = "none"; 
    setTimeout(() => {
      this.element.classList.add('enemy-die');
      this.createParticles();
    }, 10);
    setTimeout(() => {
      if (this.element.parentNode) this.element.remove();
    }, 700);
  }

  createParticles() {
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'enemy-particle';
      p.style.left = (this.px + 19) + 'px';
      p.style.top = (this.py + 19) + 'px';
      p.style.setProperty('--dx', `${(Math.random()-0.5)*80}px`);
      p.style.setProperty('--dy', `${(Math.random()-0.5)*80+30}px`);
      this.stage.container.appendChild(p);
      setTimeout(() => p.remove(), 500);
    }
  }

  getGridPos() {
    if (!this.isAlive) return { x: -1, y: -1 };
    const s = CELL_RAW_SIZE + GAP;
    return {
      x: Math.round((this.px - 2) / s),
      y: Math.round((this.py - 2) / s)
    };
  }
}