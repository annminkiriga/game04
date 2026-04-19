// ■enemy.js (バグ完全排除・リセット版)

class Enemy {
  constructor(stage, x, y, type = 'A') {
    this.stage = stage;
    this.type = type;
    this.isAlive = true;
    this.gridX = x;
    this.gridY = y;
    this.speed = 30;

    const s = CELL_RAW_SIZE + GAP;
    this.startX = x * s + 2;
    this.startY = y * s + 2;
    this.px = this.startX;
    this.py = this.startY;

    this.angle = 0;
    this.isPausing = false;

    if (this.type === 'B' || this.type === 'P') {
      this.radius = 65;
    }

    this.element = this.createEnemy();
    
    this.isBoss = false;
    if (this.type === 'U' || this.type === 'V') {
      this.isBoss = true;
      this.hp = (this.type === 'V') ? 7 : 5;
      this.element.classList.add('boss');
      this.element.innerText = '★';
    }

    // メソッドを呼ぶ
    this.initPosition();
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
    } else if (this.type === 'B' || this.type === 'P') {
        this.moveCircle();
    } else if (this.type === 'C' || this.type === 'Z') {
        this.moveSquare();
    } else if (this.type === 'D') {
        this.moveCross();
    } else if (this.type === 'E') {
        this.moveSteadyChase(playerX, playerY);
    } else if (this.type === 'F') { 
        this.moveSpiral();
    } else if (this.type === 'G') {
        this.moveHorizontal();
    } else if (this.type === 'H') {
        this.moveVertical();
    } else if (this.type === 'I') {
        this.moveBounce();
    } else if (this.type === 'J' || this.type === 'K') {
        this.moveStar();
    } else if (this.type === 'L' || this.type === 'M') {
        this.moveTriangle();
    } else if (this.type === 'N') {
        this.moveDiagonal();
    } else if (this.type === 'Q' || this.type === 'R') {
        this.moveHeart();
    } else if (this.type === 'S' || this.type === 'T') {
        this.moveWave();
    } else if (this.type === 'U') {
        this.moveBossChase(playerX, playerY);
    } else if (this.type === 'V') { 
        this.moveDiamondBoss();
    } else if (this.type === 'W') {
        this.moveRadialSpiral();
    } else if (this.type === 'X') {
        this.moveReflectiveBounce();
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
    const speed = Math.min(40 + level, 60); 
    this.px += Math.cos(angle) * speed;
    this.py += Math.sin(angle) * speed;
    this.keepInside();
    this.updateVisual();
  }

  moveCircle() {
    const isReverse = (this.type === 'P'); 
    const stepAngle = Math.PI / 6; 
    this.angle += isReverse ? -stepAngle : stepAngle; 
    
    this.px = this.startX + Math.cos(this.angle) * this.radius;
    this.py = this.startY + Math.sin(this.angle) * this.radius;

    if (!this.noPause) {
      if (this.traveledAngle === undefined) this.traveledAngle = 0;
      this.traveledAngle += stepAngle;
      if (this.traveledAngle >= Math.PI * 2 - 0.01) {
        this.traveledAngle = 0;
        this.isPausing = true;
        setTimeout(() => { this.isPausing = false; }, 1000);
      }
    }
    this.keepInside();
    this.updateVisual();
  }

  // ★修正：変なブレーキや補正を全削除！元のシンプルな動きを取り戻した四角形
  moveSquare() {
    const s = CELL_RAW_SIZE + GAP;
    
    // ★ ここを修正
    // 1. もし個別に dist が設定されていればそれを使う
    // 2. なければ、初期位置から計算する
    if (this.dist === undefined) {
      const distX = Math.abs(this.gridX - 4);
      const distY = Math.abs(this.gridY - 4);
      this.dist = Math.max(distX, distY) || 1;
    }

    // 基準点は (4,4) に固定（囲い移動の場合）
    const centerX = 4 * s + 2;
    const centerY = 4 * s + 2;

    const minP_X = centerX - this.dist * s;
    const maxP_X = centerX + this.dist * s;
    const minP_Y = centerY - this.dist * s;
    const maxP_Y = centerY + this.dist * s;

    if (this.type === 'C') {
      if (this.state === 'moving_right') {
        this.px += this.speed;
        if (this.px >= maxP_X) { this.px = maxP_X; this.state = 'moving_down'; }
      } else if (this.state === 'moving_down') {
        this.py += this.speed;
        if (this.py >= maxP_Y) { this.py = maxP_Y; this.state = 'moving_left'; }
      } else if (this.state === 'moving_left') {
        this.px -= this.speed;
        if (this.px <= minP_X) { this.px = minP_X; this.state = 'moving_up'; }
      } else if (this.state === 'moving_up') {
        this.py -= this.speed;
        if (this.py <= minP_Y) { this.py = minP_Y; this.state = 'moving_right'; }
      }
    } else if (this.type === 'Z') {
      if (this.state === 'moving_down') {
        this.py += this.speed;
        if (this.py >= maxP_Y) { this.py = maxP_Y; this.state = 'moving_right'; }
      } else if (this.state === 'moving_right') {
        this.px += this.speed;
        if (this.px >= maxP_X) { this.px = maxP_X; this.state = 'moving_up'; }
      } else if (this.state === 'moving_up') {
        this.py -= this.speed;
        if (this.py <= minP_Y) { this.py = minP_Y; this.state = 'moving_left'; }
      } else if (this.state === 'moving_left') {
        this.px -= this.speed;
        if (this.px <= minP_X) { this.px = minP_X; this.state = 'moving_down'; }
      }
    }
    this.updateVisual();
  }

  // ★修正：十字移動（D）が、指定された方向（startStep）から正しくスタートするように復活！
  moveCross() {
    const s = 40; 
    const r = s * 2; 
    const points = [ { dx: 0, dy: -r }, { dx: 0, dy: r }, { dx: -r, dy: 0 }, { dx: r, dy: 0 } ];
    
    // ★ここが欠落していました！指定された方向を読み込む
    if (this.crossStep === undefined) this.crossStep = this.startStep || 0;
    
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
    if (gx < playerX) gx++; else if (gx > playerX) gx--;
    if (gy < playerY) gy++; else if (gy > playerY) gy--;
    this.px = gx * s + 2;
    this.py = gy * s + 2;
    this.updateVisual();
  }

  // ★修正：radius=65の呪縛から解放され、元の速度を取り戻したスパイラル
  moveSpiral() {
    if (this.spiralStep === undefined) {
      if (!this.spiralPath) this.spiralPath = this.createSpiralPath();
      if (this.startStep === 1) {
        this.spiralStep = this.spiralPath.length - 1;
        this.spiralDir = -1; 
      } else {
        this.spiralStep = 0;
        this.spiralDir = 1; 
      }
    }

    const speed = this.radius || 1;

    for (let i = 0; i < speed; i++) {
      this.spiralStep += this.spiralDir;
      if (this.spiralStep >= this.spiralPath.length) {
        this.spiralStep = this.spiralPath.length - 2; 
        this.spiralDir = -1; 
        if (!this.noPause) { this.isPausing = true; setTimeout(() => { this.isPausing = false; }, 1000); }
        break; 
      }
      else if (this.spiralStep < 0) {
        this.spiralStep = 1; 
        this.spiralDir = 1;  
        if (!this.noPause) { this.isPausing = true; setTimeout(() => { this.isPausing = false; }, 1000); }
        break; 
      }
    }

    const s = CELL_RAW_SIZE + GAP;
    const target = this.spiralPath[this.spiralStep];
    this.px = target.x * s + 2;
    this.py = target.y * s + 2;
    this.updateVisual();
  }

  createSpiralPath() {
    const path = [];
    let top = 0, bottom = GRID_SIZE - 1, left = 0, right = GRID_SIZE - 1;
    while (top <= bottom && left <= right) {
      for (let x = left; x <= right; x++) path.push({ x: x, y: top });
      top++;
      for (let y = top; y <= bottom; y++) path.push({ x: right, y: y });
      right--;
      if (top <= bottom) { for (let x = right; x >= left; x--) path.push({ x: x, y: bottom }); bottom--; }
      if (left <= right) { for (let y = bottom; y >= top; y--) path.push({ x: left, y: y }); left++; }
    }
    return path;
  }

  // ★修正：スタート位置によって「右行き」か「左行き」かを自動判定する本来の機能を取り戻す
  moveHorizontal() {
    if (this.horizDir === undefined) {
      const s = CELL_RAW_SIZE + GAP;
      // 盤面の真ん中(x:4)より右からスタートしたら左(-1)へ、左からスタートしたら右(1)へ
      this.horizDir = this.startX > (4 * s + 2) ? -1 : 1; 
    }
    const s = CELL_RAW_SIZE + GAP;
    this.px += this.horizDir * s;
    let gx = Math.round((this.px - 2) / s);
    if (gx >= GRID_SIZE - 1) { this.px = (GRID_SIZE - 1) * s + 2; this.horizDir = -1; } 
    else if (gx <= 0) { this.px = 2; this.horizDir = 1; this.isPausing = true; setTimeout(() => { this.isPausing = false; }, 1000); }
    this.updateVisual();
  }

  // ★修正：縦方向も同様に「上行き」か「下行き」かを自動判定
  moveVertical() {
    if (this.vertDir === undefined) {
      const s = CELL_RAW_SIZE + GAP;
      // 盤面の真ん中(y:4)より下からスタートしたら上(-1)へ、上からスタートしたら下(1)へ
      this.vertDir = this.startY > (4 * s + 2) ? -1 : 1; 
    }
    const s = CELL_RAW_SIZE + GAP;
    this.py += this.vertDir * s;
    let gy = Math.round((this.py - 2) / s);
    if (gy <= 0) { this.py = 2; this.vertDir = 1; } 
    else if (gy >= GRID_SIZE - 1) { this.py = (GRID_SIZE - 1) * s + 2; this.vertDir = -1; this.isPausing = true; setTimeout(() => { this.isPausing = false; }, 1000); }
    this.updateVisual();
  }

  moveBounce() {
    if (this.bounceDirX === undefined) { this.bounceDirX = 1; this.bounceDirY = 1; }
    const s = CELL_RAW_SIZE + GAP;
    const minPixel = 2; 
    const maxPixel = (GRID_SIZE - 1) * s + 2; 
    this.px += this.bounceDirX * s;
    this.py += this.bounceDirY * s;
    if (this.px >= maxPixel) { this.px = maxPixel; this.bounceDirX = -1; } else if (this.px <= minPixel) { this.px = minPixel; this.bounceDirX = 1; }
    if (this.py >= maxPixel) { this.py = maxPixel; this.bounceDirY = -1; } else if (this.py <= minPixel) { this.py = minPixel; this.bounceDirY = 1; }
    this.updateVisual();
  }

  moveStar() {
    if (!this.starPoints) {
      this.starPoints = [];
      const r = this.radius || 100;
      const isReverse = (this.type === 'K'); 
      const cx = this.startX, cy = isReverse ? this.startY - r : this.startY + r;
      const startAngle = isReverse ? Math.PI / 2 : -Math.PI / 2; 
      for (let i = 0; i < 5; i++) {
        const angle = startAngle + (i * (isReverse ? -1 : 1) * 4 * Math.PI / 5);
        this.starPoints.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
      }
      this.starStep = 0;
    }
    this.starStep = (this.starStep + 1) % 5;
    const target = this.starPoints[this.starStep];
    this.px = target.x; this.py = target.y;
    this.isPausing = true;
    setTimeout(() => { this.isPausing = false; }, (this.starStep === 0) ? 1000 : 800);
    this.keepInside();
    this.updateVisual();
  }

  // ★修正：三角形も元の「止まらない仕様」に戻す
  moveTriangle() {
    if (!this.triPath) {
      this.triPath = [];
      const r = this.radius || 80; 
      const isInverted = (this.type === 'M'); 
      const corners = [];
      if (!isInverted) {
        corners.push({ x: this.startX, y: this.startY - r });         
        corners.push({ x: this.startX + r, y: this.startY + r });     
        corners.push({ x: this.startX - r, y: this.startY + r });     
      } else {
        corners.push({ x: this.startX, y: this.startY + r });         
        corners.push({ x: this.startX + r, y: this.startY - r });     
        corners.push({ x: this.startX - r, y: this.startY - r });     
      }

      const stepsPerSide = (this.stepMode === 'smooth') ? Math.max(1, Math.round((r * 2) / 40)) : 1;

      for (let i = 0; i < 3; i++) {
        const start = corners[i];
        const end = corners[(i + 1) % 3];
        for (let j = 0; j < stepsPerSide; j++) { 
          this.triPath.push({
            x: start.x + (end.x - start.x) * (j / stepsPerSide),
            y: start.y + (end.y - start.y) * (j / stepsPerSide)
          });
        }
      }
      this.triStep = 0;
    }

    const target = this.triPath[this.triStep];
    this.px = target.x;
    this.py = target.y;
    this.triStep = (this.triStep + 1) % this.triPath.length;

    // ★修正：1周した時だけ休む仕様に変更
    if (this.triStep === 0 && !this.noPause) {
      this.isPausing = true;
      setTimeout(() => { this.isPausing = false; }, 1000);
    }

    this.keepInside();
    this.updateVisual();
  }

  moveDiagonal() {
    if (this.diagDirX === undefined) {
      const s = CELL_RAW_SIZE + GAP;
      this.diagDirX = this.px < (4 * s + 2) ? 1 : -1;
      this.diagDirY = this.py < (4 * s + 2) ? 1 : -1;
    }
    const s = CELL_RAW_SIZE + GAP;
    const minPixel = 2, maxPixel = (GRID_SIZE - 1) * s + 2;
    this.px += this.diagDirX * s; this.py += this.diagDirY * s;
    if (this.px >= maxPixel || this.px <= minPixel || this.py >= maxPixel || this.py <= minPixel) {
      if (this.px > maxPixel) this.px = maxPixel; if (this.px < minPixel) this.px = minPixel;
      if (this.py > maxPixel) this.py = maxPixel; if (this.py < minPixel) this.py = minPixel;
      this.diagDirX *= -1; this.diagDirY *= -1;
      this.isPausing = true; setTimeout(() => { this.isPausing = false; }, 1000);
    }
    this.updateVisual();
  }

  moveHeart() {
    if (!this.heartPath) {
      this.heartPath = [];
      const scale = (this.radius || 100) / 16;
      const isLeft = (this.type === 'Q'); 
      const tempPoints = [];
      for (let t = 0; t <= Math.PI * 2; t += 0.01) {
        let hx = 16 * Math.pow(Math.sin(t), 3); if (isLeft) hx = -hx; 
        let hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        tempPoints.push({ x: hx * scale, y: (hy + 5) * scale });
      }
      this.heartPath.push(tempPoints[0]);
      let currentPt = tempPoints[0];
      for (let i = 1; i < tempPoints.length; i++) {
        const pt = tempPoints[i];
        if (Math.hypot(pt.x - currentPt.x, pt.y - currentPt.y) >= 40) {
          this.heartPath.push(pt); currentPt = pt;
        }
      }
      this.heartStep = 0;
    }
    this.heartStep++;
    if (this.heartStep >= this.heartPath.length) {
      this.heartStep = 0; 
      if (!this.noPause) { this.isPausing = true; setTimeout(() => { this.isPausing = false; }, 1000); }
    }
    const target = this.heartPath[this.heartStep];
    this.px = this.startX + target.x; this.py = this.startY + target.y;
    this.keepInside(); this.updateVisual();
  }

  moveWave() {
    if (!this.wavePath) {
      this.wavePath = [];
      const s = CELL_RAW_SIZE + GAP, minPixel = 2, maxPixel = (GRID_SIZE - 1) * s + 2, range = maxPixel - minPixel;
      const amplitude = s * 1.5, frequency = 1.5, isStartRight = (this.startX > (minPixel + maxPixel) / 2);
      const tempPoints = [];
      for (let t = 0; t <= 1; t += 0.005) {
        tempPoints.push({ x: isStartRight ? (maxPixel - t * range) : (minPixel + t * range), y: this.startY + Math.sin(t * Math.PI * frequency * 2) * amplitude });
      }
      this.wavePath.push(tempPoints[0]);
      let currentPt = tempPoints[0];
      for (let i = 1; i < tempPoints.length; i++) {
        const pt = tempPoints[i];
        if (Math.hypot(pt.x - currentPt.x, pt.y - currentPt.y) >= 30) { this.wavePath.push(pt); currentPt = pt; }
      }
      this.waveStep = 0; this.waveDir = 1; 
    }
    this.waveStep += this.waveDir;
    if (this.waveStep >= this.wavePath.length || this.waveStep < 0) {
      this.waveDir *= -1; this.waveStep += this.waveDir * 2;
      if (!this.noPause) { this.isPausing = true; setTimeout(() => { this.isPausing = false; }, 1000); }
    }
    const target = this.wavePath[this.waveStep];
    this.px = target.x; this.py = target.y;
    this.keepInside(); this.updateVisual();
  }

  moveBossChase(playerX, playerY) {
    const s = CELL_RAW_SIZE + GAP;
    const dx = (playerX * s + 2) - this.px, dy = (playerY * s + 2) - this.py, dist = Math.hypot(dx, dy);
    if (dist > 1) { this.px += (dx / dist) * 0.5; this.py += (dy / dist) * 0.5; }
    this.keepInside(); this.updateVisual();
  }

  moveDiamondBoss() {
    if (this.bounceDirX === undefined) { this.bounceDirX = 1; this.bounceDirY = 1; }
    this.px += this.bounceDirX * 1.8; this.py += this.bounceDirY * 1.8;
    const s = CELL_RAW_SIZE + GAP, minPixel = 2, maxPixel = (GRID_SIZE - 1) * s + 2;
    if (this.px >= maxPixel) { this.px = maxPixel; this.bounceDirX = -1; } else if (this.px <= minPixel) { this.px = minPixel; this.bounceDirX = 1; }
    if (this.py >= maxPixel) { this.py = maxPixel; this.bounceDirY = -1; } else if (this.py <= minPixel) { this.py = minPixel; this.bounceDirY = 1; }
    this.updateVisual();
  }

  moveRadialSpiral() {
    if (this.t === undefined) {
      this.t = 0;
      this.centerX = this.px;
      this.centerY = this.py;
    }
    
    // ★ 速度調整
    this.t += 0.03;      // 伸び縮みのサイクルを速くする
    this.angle += 0.08;  // 回転速度を速くする

    const s = CELL_RAW_SIZE + GAP;
    const maxRadius = s * 2.5; 
    const currentRadius = (Math.sin(this.t) + 1) * 0.5 * maxRadius;

    this.px = this.centerX + Math.cos(this.angle) * currentRadius;
    this.py = this.centerY + Math.sin(this.angle) * currentRadius;

    this.updateVisual();
  }

  moveReflectiveBounce() {
    // 速度を「5」程度に厳格に固定。this.speed（30）は無視します。
    if (this.vx === undefined) {
      this.vx = 5;
      this.vy = 5;
    }

    this.px += this.vx;
    this.py += this.vy;

    const s = CELL_RAW_SIZE + GAP;
    const minP = 2;
    const maxP = (GRID_SIZE - 1) * s + 2;

    // 反射判定：壁を越えた瞬間に、強制的に壁のラインまで座標を戻す
    if (this.px <= minP) { this.px = minP; this.vx = Math.abs(this.vx); }
    if (this.px >= maxP) { this.px = maxP; this.vx = -Math.abs(this.vx); }
    if (this.py <= minP) { this.py = minP; this.vy = Math.abs(this.vy); }
    if (this.py >= maxP) { this.py = maxP; this.vy = -Math.abs(this.vy); }

    this.updateVisual();
  }

  // --- 共通メソッド ---

  moveRandom() {
    if (!this.isAlive || this.type !== 'A') return;
    const angle = Math.random() * Math.PI * 2;
    this.px += Math.cos(angle) * 25; this.py += Math.sin(angle) * 25;
    this.keepInside(); this.updateVisual();
  }

  keepInside() {
    const max = (GRID_SIZE - 1) * (CELL_RAW_SIZE + GAP);
    if (this.px < 2) this.px = 2; if (this.px > max) this.px = max;
    if (this.py < 2) this.py = 2; if (this.py > max) this.py = max;
  }

  die() {
    if (!this.isAlive) return;
    this.isAlive = false;
    if (window.app) window.app.playSE('maou_se_system19.wav'); 
    if (this.type === 'U' && window.app && window.app.bossBGM) window.app.bossBGM.pause();
    this.element.style.animation = "none"; 
    setTimeout(() => { this.element.classList.add('enemy-die'); this.createParticles(); }, 10);
    setTimeout(() => { if (this.element.parentNode) this.element.remove(); }, 700);
  }

  createParticles() {
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'enemy-particle';
      p.style.left = (this.px + 19) + 'px'; p.style.top = (this.py + 19) + 'px';
      p.style.setProperty('--dx', `${(Math.random()-0.5)*80}px`); p.style.setProperty('--dy', `${(Math.random()-0.5)*80+30}px`);
      this.stage.container.appendChild(p);
      setTimeout(() => p.remove(), 500);
    }
  }

  getGridPos() {
    if (!this.isAlive) return { x: -1, y: -1 };
    const s = CELL_RAW_SIZE + GAP;
    return { x: Math.round((this.px - 2) / s), y: Math.round((this.py - 2) / s) };
  }

  getOccupiedRect() {
    const grid = this.getGridPos();
    let area = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) area.push({ x: grid.x + dx, y: grid.y + dy });
    return area;
  }

  applyDamage() {
    if (!this.isAlive || this.isInvincible) return false;
    this.hp--;
    this.element.classList.add('damage');
    this.isInvincible = true;
    setTimeout(() => { this.element.classList.remove('damage'); this.isInvincible = false; }, 100);
    if (this.hp <= 0) return true; 
    return false; 
  }

  updateVisual() {
    if (!this.element || !this.isAlive) return;

    if (this.type === 'X') {
      this.element.style.transition = "none";
    } 
    // ★ Level 5, 19対策：Eは linear 2s にして「止まり」を解消
    else if (this.type === 'E') {
      this.element.style.transition = "left 2s linear, top 2s linear";
    }
    else if (this.type === 'C' || this.type === 'Z' || this.type === 'W') {
      this.element.style.transition = "left 0.3s linear, top 0.3s linear";
    } 
    else {
      this.element.style.transition = "left 0.3s ease-out, top 0.3s ease-out";
    }

    this.element.style.left = this.px + 'px';
    this.element.style.top = this.py + 'px';
  }

  initPosition() {
    const s = CELL_RAW_SIZE + GAP;

    // ★ CとZの処理をここに統合・修正します
    if (this.type === 'C' || this.type === 'Z') {
      // 座標は指定されたマス(startX, startY)からスタート
      this.px = this.startX;
      this.py = this.startY;
      // 進行方向の初期セット：時計回りは右へ、逆回りは下へ
      this.state = (this.type === 'Z') ? 'moving_down' : 'moving_right';
    } 
    else if (this.type === 'D') {
      const r = 40 * 2;
      const points = [ { dx: 0, dy: -r }, { dx: 0, dy: r }, { dx: -r, dy: 0 }, { dx: r, dy: 0 } ];
      const step = this.startStep || 0;
      this.px = this.startX + points[step].dx;
      this.py = this.startY + points[step].dy;
    } 
    else if (this.type === 'B' || this.type === 'P') {
      const r = this.radius || 65;
      this.px = this.startX + Math.cos(this.angle) * r;
      this.py = this.startY + Math.sin(this.angle) * r;
    } 
    else if (this.type === 'L') {
      const r = this.radius || 80;
      this.px = this.startX; this.py = this.startY - r; 
    } 
    else if (this.type === 'M') {
      const r = this.radius || 80;
      this.px = this.startX; this.py = this.startY + r; 
    } 
    else if (this.type === 'F') {
      if (!this.spiralPath) this.spiralPath = this.createSpiralPath();
      this.spiralStep = (this.startStep === 1) ? this.spiralPath.length - 1 : 0;
      this.spiralDir = (this.startStep === 1) ? -1 : 1;
      const target = this.spiralPath[this.spiralStep];
      this.px = target.x * s + 2; this.py = target.y * s + 2;
    }
    
    this.updateVisual();
  }
}
