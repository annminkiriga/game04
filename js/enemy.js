// ■enemy.js (完全版)

class Enemy {
  constructor(stage, x, y, type = 'A') {
    this.stage = stage;
    this.type = type; 
    this.isAlive = true;

    const s = CELL_RAW_SIZE + GAP;
    this.startX = x * s + 2; 
    this.startY = y * s + 2;
    this.px = this.startX;
    this.py = this.startY;

    // パターンB(円形)用の設定
    this.angle = 0; 
    this.radius = 65;
    this.isPausing = false;

    this.element = this.createEnemy();
  
    // ★ここに追加：ボス(タイプU)の個別設定
   if (this.type === 'U') {
   this.hp = 3;         // 耐久力：最大9マス分の魔法爆発で倒せる　今回は３ 
   this.isBoss = true;
   this.element.classList.add('boss');
   this.element.innerText = '★'; // 鬼ではなく、指定通り「★」を巨大化
}
    this.updateVisual();
  }

  createEnemy() {
    const e = document.createElement('div');
    e.id = 'enemy';
    e.innerText = '★';
    this.stage.container.appendChild(e);
    return e;
  }

  move(playerX, playerY, level) {
    if (!this.isAlive || this.isPausing) return;

    if (this.type === 'A') {
      this.moveTowards(playerX, playerY, level);
    } else if (this.type === 'B' || this.type === 'P') { // ★修正：パターンBとPをまとめる
      this.moveCircle();
    } else if (this.type === 'C') {
      this.moveSquare();
    } else if (this.type === 'D') {
      this.moveCross();
    } else if (this.type === 'E') {
      this.moveSteadyChase(playerX, playerY);
    } else if (this.type === 'F') { 
      this.moveSpiral();
    } else if (this.type === 'G') { // ★追加：パターンG
      this.moveHorizontal();
    } else if (this.type === 'H') { // ★追加：パターンH
      this.moveVertical();
    } else if (this.type === 'I') { // ★追加：パターンI
      this.moveBounce();
    } else if (this.type === 'J' || this.type === 'K') { // ★追加：パターンJとK
      this.moveStar();
    } else if (this.type === 'L' || this.type === 'M') {
      this.moveTriangle();
    } else if (this.type === 'N') {
      this.moveDiagonal();
    } else if (this.type === 'Q' || this.type === 'R') {
      this.moveHeart();
    } else if (this.type === 'S' || this.type === 'T') { // ★追加：パターンSとT
      this.moveWave();
    }// ★ここが抜けていると動きません
    else if (this.type === 'U') {
      this.moveBossChase(playerX, playerY);
    }
  }

  // --- 移動パターン ---
  
  moveTowards(playerX, playerY, level = 1) {
    const s = CELL_RAW_SIZE + GAP;
    const targetPx = playerX * s + 2;
    const targetPy = playerY * s + 2;
    const dx = targetPx - this.px;
    const dy = targetPy - this.py;
    const angle = Math.atan2(dy, dx);

    const speed = 40 + (level * 5); 
    this.px += Math.cos(angle) * speed;
    this.py += Math.sin(angle) * speed;

    this.keepInside();
    this.updateVisual();
  }

  moveCircle() {
    const isReverse = (this.type === 'P'); 
    
    this.angle += isReverse ? -0.52 : 0.52; 
    
    this.px = this.startX + Math.cos(this.angle) * this.radius;
    this.py = this.startY + Math.sin(this.angle) * this.radius;

    // 1周（2π）を超えたかの判定
    if (Math.abs(this.angle) >= Math.PI * 2) {
      if (!this.noPause) {
        this.angle = 0; // 止まる場合はきっちり初期位置に戻す
        this.isPausing = true;
        setTimeout(() => { this.isPausing = false; }, 1000);
      } else {
        // ★修正：止まらない場合は、はみ出た角度の余りをそのまま引き継ぐ（カクつき防止）
        this.angle %= (Math.PI * 2);
      }
    }
    
    this.keepInside();
    this.updateVisual();
  }

  moveSquare() {
    const stepSize = 40; 
    const r = stepSize * 1; 

    const corners = [
      { dx: -r, dy: -r },
      { dx:  r, dy: -r },
      { dx:  r, dy:  r },
      { dx: -r, dy:  r } 
    ];

    if (this.squareStep === undefined) this.squareStep = 0;

    const t = corners[this.squareStep];
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

  moveCross() {
    const s = 40; 
    const r = s * 2; 

    const points = [
      { dx: 0,  dy: -r },
      { dx: 0,  dy:  r },
      { dx: -r, dy:  0 },
      { dx:  r, dy:  0 } 
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

  moveSteadyChase(playerX, playerY) {
    const s = CELL_RAW_SIZE + GAP;
    let gx = Math.round((this.px - 2) / s);
    let gy = Math.round((this.py - 2) / s);

    if (gx < playerX) gx++;
    else if (gx > playerX) gx--;

    if (gy < playerY) gy++;
    else if (gy > playerY) gy--;

    this.px = gx * s + 2;
    this.py = gy * s + 2;

    this.updateVisual();
  }

  moveSpiral() {
    if (!this.spiralPath) {
      this.spiralPath = this.createSpiralPath();
      this.spiralStep = 0;
      this.spiralDir = 1; 
    }

    const s = CELL_RAW_SIZE + GAP;
    const target = this.spiralPath[this.spiralStep];
    this.px = target.x * s + 2;
    this.py = target.y * s + 2;

    this.spiralStep += this.spiralDir;

    if (this.spiralStep >= this.spiralPath.length) {
      this.spiralStep = this.spiralPath.length - 2; 
      this.spiralDir = -1; 
      this.isPausing = true;
      setTimeout(() => { this.isPausing = false; }, 1000); 
    }
    else if (this.spiralStep < 0) {
      this.spiralStep = 1; 
      this.spiralDir = 1;  
      this.isPausing = true;
      setTimeout(() => { this.isPausing = false; }, 1000); 
    }

    this.updateVisual();
  }

  createSpiralPath() {
    const path = [];
    let top = 0, bottom = GRID_SIZE - 1;
    let left = 0, right = GRID_SIZE - 1;

    while (top <= bottom && left <= right) {
      for (let x = left; x <= right; x++) path.push({ x: x, y: top });
      top++;
      for (let y = top; y <= bottom; y++) path.push({ x: right, y: y });
      right--;
      if (top <= bottom) {
        for (let x = right; x >= left; x--) path.push({ x: x, y: bottom });
        bottom--;
      }
      if (left <= right) {
        for (let y = bottom; y >= top; y--) path.push({ x: left, y: y });
        left++;
      }
    }
    return path;
  }

  // ★ 新規追加：パターンG（水平に往復）
  moveHorizontal() {
    if (this.horizDir === undefined) this.horizDir = 1; // 1:右へ, -1:左へ
    const s = CELL_RAW_SIZE + GAP;
    
    this.px += this.horizDir * s;
    let gx = Math.round((this.px - 2) / s);

    if (gx >= GRID_SIZE - 1) {
      // 右端に到達したら反転
      this.px = (GRID_SIZE - 1) * s + 2;
      this.horizDir = -1;
    } else if (gx <= 0) {
      // 左端に戻ってきたら反転して1秒停止
      this.px = 2;
      this.horizDir = 1;
      this.isPausing = true;
      setTimeout(() => { this.isPausing = false; }, 1000);
    }
    
    this.updateVisual();
  }

  // ★ 新規追加：パターンH（垂直に往復）
  moveVertical() {
    if (this.vertDir === undefined) this.vertDir = -1; // -1:上へ, 1:下へ
    const s = CELL_RAW_SIZE + GAP;
    
    this.py += this.vertDir * s;
    let gy = Math.round((this.py - 2) / s);

    if (gy <= 0) {
      // 上端に到達したら反転
      this.py = 2;
      this.vertDir = 1;
    } else if (gy >= GRID_SIZE - 1) {
      // 下端に戻ってきたら反転して1秒停止
      this.py = (GRID_SIZE - 1) * s + 2;
      this.vertDir = -1;
      this.isPausing = true;
      setTimeout(() => { this.isPausing = false; }, 1000);
    }
    
    this.updateVisual();
  }

// ★ 新規追加：パターンI（斜め反射）
  moveBounce() {
    // 初回のみ移動方向を初期化（右下へ向かう）
    if (this.bounceDirX === undefined) {
      this.bounceDirX = 1; // 1:右, -1:左
      this.bounceDirY = 1; // 1:下, -1:上
    }

    const s = CELL_RAW_SIZE + GAP;
    const minPixel = 2; // 左上端の座標
    const maxPixel = (GRID_SIZE - 1) * s + 2; // 右下端の座標
    
    this.px += this.bounceDirX * s;
    this.py += this.bounceDirY * s;

    // X軸（左右）の壁判定
    if (this.px >= maxPixel) {
      this.px = maxPixel;
      this.bounceDirX = -1; // 左に反転
    } else if (this.px <= minPixel) {
      this.px = minPixel;
      this.bounceDirX = 1;  // 右に反転
    }

    // Y軸（上下）の壁判定
    if (this.py >= maxPixel) {
      this.py = maxPixel;
      this.bounceDirY = -1; // 上に反転
    } else if (this.py <= minPixel) {
      this.py = minPixel;
      this.bounceDirY = 1;  // 下に反転
    }
    
    this.updateVisual();
  }
// ★ 新規追加：パターンJ, K（五芒星・ペンタグラム）
  moveStar() {
    if (!this.starPoints) {
      this.starPoints = [];
      const r = this.radius || 100;
      const isReverse = (this.type === 'K'); 
      
      const cx = this.startX;
      const cy = isReverse ? this.startY - r : this.startY + r;
      const startAngle = isReverse ? Math.PI / 2 : -Math.PI / 2; 
      
      for (let i = 0; i < 5; i++) {
        const angle = startAngle + (i * (isReverse ? -1 : 1) * 4 * Math.PI / 5);
        this.starPoints.push({
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r
        });
      }
      this.starStep = 0;
    }

    // 次の頂点へ進む
    this.starStep = (this.starStep + 1) % 5;
    const target = this.starPoints[this.starStep];
    this.px = target.x;
    this.py = target.y;

    // ★ 修正：すべての角（頂点）で一時停止を入れる
    this.isPausing = true;

    // 挙動Dに合わせて 800ms 停止させる
    // (1周して戻ってきた時だけ少し長めに 1000ms 止まる設定にしています)
    const pauseTime = (this.starStep === 0) ? 1000 : 800;

    setTimeout(() => { 
      this.isPausing = false; 
    }, pauseTime);

    this.keepInside();
    this.updateVisual();
  }
   // ★ 新規追加：パターンL, M（三角形・六芒星の構成パーツ）
  moveTriangle() {
    if (!this.triPoints) {
      this.triPoints = [];
      const r = this.radius || 90;
      const isInverted = (this.type === 'M'); // Mは逆三角形
      
      const cx = this.startX;
      // Lは上端スタートなので中心は下、Mは下端スタートなので中心は上
      const cy = isInverted ? this.startY - r : this.startY + r;
      // Lは-90度（上）から、Mは90度（下）から開始
      const startAngle = isInverted ? Math.PI / 2 : -Math.PI / 2; 
      
      // 正三角形の3つの頂点を計算（120度ずつ進む）
      for (let i = 0; i < 3; i++) {
        const angle = startAngle + (i * 2 * Math.PI / 3);
        this.triPoints.push({
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r
        });
      }
      this.triStep = 0;
    }

    // 次の頂点へ進む
    this.triStep = (this.triStep + 1) % 3;
    const target = this.triPoints[this.triStep];
    this.px = target.x;
    this.py = target.y;

    // 角の頂点ごとに一時停止
    this.isPausing = true;
    const pauseTime = (this.triStep === 0) ? 1000 : 800;

    setTimeout(() => { 
      this.isPausing = false; 
    }, pauseTime);

    this.keepInside();
    this.updateVisual();
  }
// ★ 新規追加：パターンN（対角線往復）
  moveDiagonal() {
    if (this.diagDirX === undefined) {
      // 盤面の中心（x:4, y:4）へ向かうように初期方向を設定
      const s = CELL_RAW_SIZE + GAP;
      const cx = 4 * s + 2;
      const cy = 4 * s + 2;
      
      this.diagDirX = this.px < cx ? 1 : -1;
      this.diagDirY = this.py < cy ? 1 : -1;
    }

    const s = CELL_RAW_SIZE + GAP;
    const minPixel = 2;
    const maxPixel = (GRID_SIZE - 1) * s + 2;
    
    this.px += this.diagDirX * s;
    this.py += this.diagDirY * s;

    // 画面の端（四隅）に到達したか判定
    if (this.px >= maxPixel || this.px <= minPixel || this.py >= maxPixel || this.py <= minPixel) {
      // はみ出しを補正
      if (this.px > maxPixel) this.px = maxPixel;
      if (this.px < minPixel) this.px = minPixel;
      if (this.py > maxPixel) this.py = maxPixel;
      if (this.py < minPixel) this.py = minPixel;

      // 進行方向を反転
      this.diagDirX *= -1;
      this.diagDirY *= -1;

      // 端で1秒停止
      this.isPausing = true;
      setTimeout(() => { this.isPausing = false; }, 1000);
    }
    
    this.updateVisual();
  }
  // ★ 新規追加：パターンQ, R（ハートマーク）
  moveHeart() {
    if (!this.heartPath) {
      this.heartPath = [];
      const scale = (this.radius || 100) / 16;
      const isLeft = (this.type === 'Q'); // Qは左側から回る
      
      // 1. まず数式通りに細かい軌道の点を作成する
      const tempPoints = [];
      for (let t = 0; t <= Math.PI * 2; t += 0.01) {
        let hx = 16 * Math.pow(Math.sin(t), 3);
        if (isLeft) hx = -hx; // 左回りの場合はX座標を反転させる
        
        let hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        tempPoints.push({ x: hx * scale, y: (hy + 5) * scale });
      }
      
      // 2. 「等間隔な距離」で点を間引いて新しく配列を作る（これで速度が完全に一定になる）
      this.heartPath.push(tempPoints[0]);
      let currentPt = tempPoints[0];
      const speed = 40; // ★ 1フレームに進むピクセル数（ここで速度調整可能）

      for (let i = 1; i < tempPoints.length; i++) {
        const pt = tempPoints[i];
        const dist = Math.hypot(pt.x - currentPt.x, pt.y - currentPt.y);
        if (dist >= speed) {
          this.heartPath.push(pt);
          currentPt = pt;
        }
      }
      this.heartStep = 0;
    }

    // 次の等間隔な点へ進む
    this.heartStep++;

    // 配列の範囲を超えた（1周した）時のループ処理
    if (this.heartStep >= this.heartPath.length) {
      this.heartStep = 0; // 起点に戻る
      if (!this.noPause) {
        this.isPausing = true;
        setTimeout(() => { this.isPausing = false; }, 1000);
      }
    }

    const target = this.heartPath[this.heartStep];
    this.px = this.startX + target.x;
    this.py = this.startY + target.y;

    this.keepInside();
    this.updateVisual();
  }
  // ★ 新規追加：パターンS, T（波線・サイン波）
  moveWave() {
    if (!this.wavePath) {
      this.wavePath = [];
      const s = CELL_RAW_SIZE + GAP;
      const minPixel = 2;
      const maxPixel = (GRID_SIZE - 1) * s + 2;
      const range = maxPixel - minPixel;
      
      const amplitude = s * 1.5; // 波の高さ（振幅）：約1.5マス分
      const frequency = 1.5;     // 端から端までで何周期するか
      const isStartRight = (this.startX > (minPixel + maxPixel) / 2);
      
      // 1. 細かい軌道の点を作成（片道分）
      const tempPoints = [];
      for (let t = 0; t <= 1; t += 0.005) {
        // 水平移動
        const curX = isStartRight ? (maxPixel - t * range) : (minPixel + t * range);
        // 垂直移動（サイン波）
        const curY = this.startY + Math.sin(t * Math.PI * frequency * 2) * amplitude;
        tempPoints.push({ x: curX, y: curY });
      }

      // 2. 等間隔（定速）にリサンプリング
      // ★ 速度を2倍に変更（15 → 30）
      const moveSpeed = 30;
      this.wavePath.push(tempPoints[0]);
      let currentPt = tempPoints[0];
      for (let i = 1; i < tempPoints.length; i++) {
        const pt = tempPoints[i];
        const d = Math.hypot(pt.x - currentPt.x, pt.y - currentPt.y);
        if (d >= moveSpeed) {
          this.wavePath.push(pt);
          currentPt = pt;
        }
      }
      this.waveStep = 0;
      this.waveDir = 1; // 1: 往路, -1: 復路
    }

    // 次の点へ進む
    this.waveStep += this.waveDir;

    // 端に到達した時の反転・停止処理
    if (this.waveStep >= this.wavePath.length || this.waveStep < 0) {
      this.waveDir *= -1;
      
      // ★ 修正：同じ頂点に2フレーム留まらないように、折り返し時は2歩分進める
      this.waveStep += this.waveDir * 2;
      
      if (!this.noPause) {
        this.isPausing = true;
        setTimeout(() => { this.isPausing = false; }, 1000);
      }
    }

    const target = this.wavePath[this.waveStep];
    this.px = target.x;
    this.py = target.y;

    this.keepInside(); 
    this.updateVisual();
  }

  // ★ 新規追加：パターンＵ（ボス１・挙動Ｅ・ダメージ３）
  // ボスがプレイヤーを追跡する挙動
  moveBossChase(playerX, playerY) {
  const s = CELL_RAW_SIZE + GAP;
  const targetPx = playerX * s + 2;
  const targetPy = playerY * s + 2;
  
  const dx = targetPx - this.px;
  const dy = targetPy - this.py;
  const dist = Math.hypot(dx, dy);

  if (dist > 1) {
    // ★ここを 0.5 にすると、秒速約30pxになります。
    // 「速すぎる」と感じたら 0.3 に、「遅すぎる」なら 0.8 に調整してください。
    const speed = 0.5; 
    this.px += (dx / dist) * speed;
    this.py += (dy / dist) * speed;
  }

  this.keepInside();
  this.updateVisual();
}

  // --- 共通メソッド ---

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

    // ボスは JS で細かく位置を動かすため、CSS transition を切る
    if (this.isBoss) {
      this.element.style.transition = "none";
    } else if (this.type === 'E') {
      this.element.style.transition = "left 2s linear, top 2s linear";
    } else {
      this.element.style.transition = "left 0.3s ease-out, top 0.3s ease-out";
    }

    this.element.style.left = this.px + 'px';
    this.element.style.top = this.py + 'px';
  }

  die() {
    if (!this.isAlive) return;
    this.isAlive = false;

    // ★追加：ボス(Type 'U')の場合、消滅が始まった瞬間にBGMを一旦止める
    if (this.type === 'U' && window.app && window.app.bossBGM) {
      window.app.bossBGM.pause();
    }

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

// ボスが占有している全座標をリストで返す
getOccupiedRect() {
  const grid = this.getGridPos();
  let area = [];
  // 中心(grid.x, grid.y)から前後1マス、合計3x3の座標リストを作成
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      area.push({ x: grid.x + dx, y: grid.y + dy });
    }
  }
  return area;
}

// ダメージを受ける処理
applyDamage() {
    if (!this.isAlive || this.isInvincible) return false;
    
    this.hp--;
    
    // ダメージ演出（赤点滅）
    this.element.classList.add('damage');
    
    // 連続ヒットしすぎないよう、一瞬だけ無敵にする（0.1秒）
    this.isInvincible = true;
    setTimeout(() => {
      this.element.classList.remove('damage');
      this.isInvincible = false;
    }, 100);

    if (this.hp <= 0) {
      // die() は呼び出すが、実際の消去は game.js 側の defeatedEnemies 経由で行う
      return true; // 撃破
    }
    return false; // 生存
  }

}