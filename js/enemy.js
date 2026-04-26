// ■enemy.js (バグ完全排除・リセット版)

class Enemy {
  // ★ 引数を (stage, config) に変更
  constructor(stage, config) {
    this.stage = stage;
    this.type = config.type || 'A';
    this.isAlive = true;
    
    this.gridX = config.x;
    this.gridY = config.y;

    // ★ ここが超重要：「個別の指定」があればそれを使用し、なければ「安全な基本値」をセットする

   // ■ 修正後（正しい書き方）
    this.speed = config.speed !== undefined ? config.speed : 30;
    this.noPause = config.noPause !== undefined ? config.noPause : false;
    
    // radius は config の値をそのまま受け取る
    this.radius = config.radius; 
    
    // ★ここに差し込み！
    this.sync = config.sync !== undefined ? config.sync : false;
    
    // BとP（円形移動）の時だけ、元の仕様通りデフォルトを65にする
    if ((this.type === 'B' || this.type === 'P') && this.radius === undefined) {
      this.radius = 65;
    }

    this.stepMode = config.stepMode || 'normal';
    this.startStep = config.startStep || 0;
    this.angle = config.startAngle !== undefined ? config.startAngle : 0;
    
    // ★ 独自の中心座標（指定がない場合は undefiend のままでOK）
    this.dist = config.dist;
    this.centerX = config.centerX;
    this.centerY = config.centerY;

    // --- 座標計算 ---
    const s = CELL_RAW_SIZE + GAP;
    this.startX = this.gridX * s + 2;
    this.startY = this.gridY * s + 2;
    this.px = this.startX;
    this.py = this.startY;

    this.isPausing = false;

    // ボス判定と要素作成
    this.element = this.createEnemy();
    this.isBoss = false;
    // ★ BZ をボスとして追加
    if (this.type === 'U' || this.type === 'V' || this.type === 'AZ' || this.type === 'BZ') {
    this.isBoss = true;
            
    // ★ HPの設定（Vなら7、AZなら9、それ以外(U)は5）
      if (this.type === 'V') this.hp = 7;
      else if (this.type === 'AZ') this.hp = 9;
      else this.hp = 5;

      this.element.classList.add('boss');
      // アイコンを変えたい場合はここで変更可能です（とりあえず今まで通り★にしてあります）
      this.element.innerText = '★'; 
    }

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

    // ★追加：高速ループ専用の敵（ボス、W、X）が、低速ループから「引数なし」で呼ばれたら処理を弾く！
    if (playerX === undefined && (this.isBoss || this.type === 'W' || this.type === 'X')) return;

    if (this.type === 'A') {
        this.moveTowards(playerX, playerY, level);
    } else if (this.type === 'B' || this.type === 'P') { // ★ここを 'P' も含むように修正！
      this.moveCircle();
    } else if (this.type === 'B2') { // 8の字（縦）
      this.moveFigureEight('vertical');
    } else if (this.type === 'B3') { // ∞の字（横）
      this.moveFigureEight('horizontal');
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
    } else if (this.type === 'H') { // ★ここが抜けていました！
        this.moveVertical();
    } else if (this.type === 'N' || this.type === 'O') { // ★ここ！ 'O' が抜けていませんか？
        this.moveDiagonal();
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
        this.moveDiamondBoss(); // ボス（反射）はそのまま
    } else if (this.type === 'V2') { 
        this.moveDiamondSmall(); // 新設（ダイヤ周回）
    } else if (this.type === 'W') {
        this.moveRadialSpiral();
    } else if (this.type === 'X') {
        this.moveReflectiveBounce();
    } else if (this.type === 'AZ') {
        this.moveBossBoomerang(playerX, playerY); // ★ここを追加
    } else if (this.type === 'BZ') {
        this.moveBZ();
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
    
    // ▼ 修正前（レベルが上がると最大60まで加速する凶悪仕様でした）
    // const speed = Math.min(40 + level, 60); 

    // ▼ 修正後（設定されたスピードを使います。設定がなければ基本の30になります）
    const currentSpeed = this.speed; 
    
    this.px += Math.cos(angle) * currentSpeed;
    this.py += Math.sin(angle) * currentSpeed;
    
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
    
    // ★修正：中心座標の指定があればそれを使用、なければ盤面中央(4,4)を基準とする
    const cx = this.centerX !== undefined ? this.centerX : 4;
    const cy = this.centerY !== undefined ? this.centerY : 4;

    if (this.dist === undefined) {
      const distX = Math.abs(this.gridX - cx);
      const distY = Math.abs(this.gridY - cy);
      this.dist = Math.max(distX, distY) || 1;
    }

    // 基準点を cx, cy を使って計算
    const centerPx = cx * s + 2;
    const centerPy = cy * s + 2;

    const minP_X = centerPx - this.dist * s;
    const maxP_X = centerPx + this.dist * s;
    const minP_Y = centerPy - this.dist * s;
    const maxP_Y = centerPy + this.dist * s;

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
      this.spiralStep = (this.startStep === 1) ? this.spiralPath.length - 1 : 0;
      this.spiralDir = (this.startStep === 1) ? -1 : 1;
    }

    const speed = this.radius || 1; // config.radius を速度として利用

    for (let i = 0; i < speed; i++) {
      this.spiralStep += this.spiralDir;
      
      if (this.spiralStep >= this.spiralPath.length) {
        this.spiralStep = this.spiralPath.length - 1;
        this.spiralDir = -1;
        if (!this.noPause) { this.isPausing = true; setTimeout(() => { this.isPausing = false; }, 1000); }
        break;
      } else if (this.spiralStep < 0) {
        this.spiralStep = 0;
        this.spiralDir = 1;
        if (!this.noPause) { this.isPausing = true; setTimeout(() => { this.isPausing = false; }, 1000); }
        break;
      }
    }

    const target = this.spiralPath[this.spiralStep];
    // ★ ここでグリッド座標を直接更新
    this.gridX = target.x;
    this.gridY = target.y;

    const s = CELL_RAW_SIZE + GAP;
    // ★ 盤面の中心（4,4）にピタッと合わせるための補正
    this.px = this.gridX * s + 2; 
    this.py = this.gridY * s + 2;

    this.updateVisual();
  }

  createSpiralPath() {
    const path = [];
    let top = 0, bottom = GRID_SIZE - 1, left = 0, right = GRID_SIZE - 1;

    // 条件を「<=」にしても、中の各for文で条件チェックを厳密にする必要があります
    while (top <= bottom && left <= right) {
      // 1. 左から右へ
      for (let x = left; x <= right; x++) {
        path.push({ x: x, y: top });
      }
      top++;

      // 2. 上から下へ
      for (let y = top; y <= bottom; y++) {
        path.push({ x: right, y: y });
      }
      right--;

      // 3. 右から左へ（行が残っている場合のみ）
      if (top <= bottom) {
        for (let x = right; x >= left; x--) {
          path.push({ x: x, y: bottom });
        }
        bottom--;
      }

      // 4. 下から上へ（列が残っている場合のみ）
      if (left <= right) {
        for (let y = bottom; y >= top; y--) {
          path.push({ x: left, y: y });
        }
        left++;
      }
    }

    // --- 修正の要：重複削除と中心の保証 ---
    // 1. 配列内の隣接する重複を削除（曲がり角で同じ座標が入るのを防ぐ）
    const cleanPath = path.filter((pos, idx) => {
      if (idx === 0) return true;
      return pos.x !== path[idx-1].x || pos.y !== path[idx-1].y;
    });

    // 2. 9x9の場合、(4, 4) が最後に入っているかチェック
    const centerIdx = Math.floor(GRID_SIZE / 2);
    const last = cleanPath[cleanPath.length - 1];
    
    if (last.x !== centerIdx || last.y !== centerIdx) {
      cleanPath.push({ x: centerIdx, y: centerIdx });
    }

    return cleanPath;
  }

  // ★修正：横往復（G）両端で止まるように変更
  // --- 横往復 (G) ---
  moveHorizontal() {
    if (this.horizDir === undefined) {
      // config.dir があればそれを使用（1:右, -1:左）、なければ位置で自動判定
      if (this.sync !== undefined && typeof this.sync === 'number') {
        this.horizDir = this.sync; 
      } else {
        const s = CELL_RAW_SIZE + GAP;
        this.horizDir = this.startX > (4 * s + 2) ? -1 : 1;
      }
    }
    const s = CELL_RAW_SIZE + GAP;
    this.px += this.horizDir * s;
    let gx = Math.round((this.px - 2) / s);

    // 右端に到達
    if (gx >= GRID_SIZE - 1) { 
      this.px = (GRID_SIZE - 1) * s + 2; 
      this.horizDir = -1; 
      this.isPausing = true; 
      setTimeout(() => { this.isPausing = false; }, 1000); 
    } 
    // 左端に到達
    else if (gx <= 0) { 
      this.px = 2; 
      this.horizDir = 1; 
      this.isPausing = true; 
      setTimeout(() => { this.isPausing = false; }, 1000); 
    }
    this.updateVisual();
  }

  // ★修正：縦往復（H）両端で止まるように変更
  moveVertical() {
    if (this.vertDir === undefined) {
      // 1. レベルデータで sync: 1 が指定されていれば「下向き」
      // 2. 指定がなければ、常に「上向き(-1)」からスタート（Level 28のウェーブ用）
      if (this.sync === 1) {
        this.vertDir = 1;
      } else {
        this.vertDir = -1;
      }
    }
    
    const s = CELL_RAW_SIZE + GAP;
    this.py += this.vertDir * s;
    let gy = Math.round((this.py - 2) / s);

    // 上端に到達
    if (gy <= 0) { 
      this.py = 2; 
      this.vertDir = 1; 
      this.isPausing = true; 
      setTimeout(() => { this.isPausing = false; }, 1000); 
    } 
    // 下端に到達
    else if (gy >= GRID_SIZE - 1) { 
      this.py = (GRID_SIZE - 1) * s + 2; 
      this.vertDir = -1; 
      this.isPausing = true; 
      setTimeout(() => { this.isPausing = false; }, 1000); 
    }
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
    
    // デフォルトを1.8に戻し、ボスの威厳を保ちます
    const moveSpeed = this.speed !== 30 ? (this.speed / 15) : 1.8; 
    
    this.px += this.bounceDirX * moveSpeed; 
    this.py += this.bounceDirY * moveSpeed;
    
    const s = CELL_RAW_SIZE + GAP, minPixel = 2, maxPixel = (GRID_SIZE - 1) * s + 2;
    if (this.px >= maxPixel) { this.px = maxPixel; this.bounceDirX = -1; } 
    else if (this.px <= minPixel) { this.px = minPixel; this.bounceDirX = 1; }
    if (this.py >= maxPixel) { this.py = maxPixel; this.bounceDirY = -1; } 
    else if (this.py <= minPixel) { this.py = minPixel; this.bounceDirY = 1; }
    
    this.updateVisual();
  }

  moveRadialSpiral() {
    const s = CELL_RAW_SIZE + GAP;
    const speedRate = this.speed !== 30 ? (this.speed / 30) : 1.0;

    // ★重要：ここで safeRadius を定義。マスの境界を踏まないよう 0.3 引く
    const safeRadius = (this.radius !== undefined ? this.radius - 0.3 : 1.95) * s;
    const maxRadiusPx = safeRadius; 

    if (this.sync) {
      // --- 同期モード (Level 38) ---
      const syncTime = Date.now() / 1000;
      const sharedT = syncTime * 2.5 * speedRate;
      const sharedAngle = syncTime * 2.0 * speedRate;

      let currentRadius = (Math.sin(sharedT) + 1) * 0.5 * maxRadiusPx;
      if (this.startStep === 2) currentRadius = (Math.cos(sharedT) + 1) * 0.5 * maxRadiusPx;

      this.px = this.startX + Math.cos(sharedAngle) * currentRadius;
      this.py = this.startY + Math.sin(sharedAngle) * currentRadius;

    } else {
      // --- 個別モード (Level 26, 32等) ---
      if (this.t === undefined) {
        this.t = (this.startStep === 1) ? -Math.PI / 2 : (this.startStep === 2 ? Math.PI / 2 : 0);
        this.angle = 0;
      }
      this.t += 0.03 * speedRate;
      this.angle += 0.08 * speedRate;

      const currentRadius = (Math.sin(this.t) + 1) * 0.5 * maxRadiusPx;
      this.px = this.startX + Math.cos(this.angle) * currentRadius;
      this.py = this.startY + Math.sin(this.angle) * currentRadius;
    }

    // 壁判定
    const maxLimit = (GRID_SIZE - 1) * s + 2;
    this.px = Math.max(2, Math.min(maxLimit, this.px));
    this.py = Math.max(2, Math.min(maxLimit, this.py));

    this.updateVisual();
  }

   moveBossBoomerang(playerX, playerY) {
    if (!this.azState) {
      this.azState = 'hovering'; // 状態：hovering(待機), dashing(突進), returning(帰還)
      this.azTick = 0;
    }

    const s = CELL_RAW_SIZE + GAP;
    // 突進スピード（config.speed で調整可能にしています。デフォルトは 18）
    const dashSpeed = this.speed !== 30 ? this.speed : 18; 

    if (this.azState === 'hovering') {
      this.azTick++;
      // Math.sin を使ってその場で小刻みに上下に揺れる（ブルブル震えるような演出）
      this.px = this.startX;
      this.py = this.startY + Math.sin(this.azTick * 0.3) * 12;

      // 約2秒間（120フレーム）溜めたら突進開始！
      if (this.azTick > 120) {
        this.azState = 'dashing';
        // 突進開始時のプレイヤーの現在地をロックオン！
        this.targetX = playerX * s + 2;
        this.targetY = playerY * s + 2;
      }
    } 
    else if (this.azState === 'dashing') {
      const dx = this.targetX - this.px;
      const dy = this.targetY - this.py;
      const dist = Math.hypot(dx, dy);

      // 目標地点に到達したら帰還モードへ
      if (dist < dashSpeed) {
        this.px = this.targetX;
        this.py = this.targetY;
        this.azState = 'returning';
      } else {
        // ターゲットに向かって高速移動
        this.px += (dx / dist) * dashSpeed;
        this.py += (dy / dist) * dashSpeed;
      }
    } 
    else if (this.azState === 'returning') {
      const dx = this.startX - this.px;
      const dy = this.startY - this.py;
      const dist = Math.hypot(dx, dy);

      // 初期位置（ホーム）に戻ったら再び待機モードへ
      if (dist < dashSpeed) {
        this.px = this.startX;
        this.py = this.startY;
        this.azState = 'hovering';
        this.azTick = 0;
      } else {
        // 元の位置に向かって移動
        this.px += (dx / dist) * dashSpeed;
        this.py += (dy / dist) * dashSpeed;
      }
    }

    this.updateVisual();
  }

  // --- 反射移動 (Xタイプ) のロジック ---
  moveReflectiveBounce() {
    // 1. 初期設定（再現性のためランダムを排除）
    if (this.vx === undefined) {
      // スピード倍率（config.speed 依存。30なら約6px/frame）
      const baseSpeed = (this.speed / 5); 
      
      // 角度を「45度(1:1)」ではなく「30度や60度」に近い比率に固定することで、
      // 画面全体を万遍なく歩き回る（＝攻略ルートが固定される）ようになります。
      // ここでは X:2, Y:1.2 の比率で固定します。
      const angle = 0.6; // 固定値
      this.vx = Math.cos(angle) * baseSpeed;
      this.vy = Math.sin(angle) * baseSpeed;
    }

    // 2. 移動実行
    this.px += this.vx;
    this.py += this.vy;

    const s = CELL_RAW_SIZE + GAP;
    const minPixel = 2;
    const maxPixel = (GRID_SIZE - 1) * s + 2;

    // 3. 壁での反射（完全な鏡面反射）
    if (this.px <= minPixel) { 
      this.px = minPixel; 
      this.vx *= -1; 
    } else if (this.px >= maxPixel) { 
      this.px = maxPixel; 
      this.vx *= -1; 
    }

    if (this.py <= minPixel) { 
      this.py = minPixel; 
      this.vy *= -1; 
    } else if (this.py >= maxPixel) { 
      this.py = maxPixel; 
      this.vy *= -1; 
    }

    this.updateVisual();
  }

  // ザコ（V2）用：固定の♢（ダイヤ）軌道を周回する
  moveDiamondSmall() {
    // ダイヤの4つの頂点を定義（盤面の中心から上下左右に広がる形）
    // 9x9マスの盤面なら、中心は (4, 4)
    if (!this.diamondPoints) {
      const s = CELL_RAW_SIZE + GAP;
      const cx = 4 * s + 2; // 中心 X
      const cy = 4 * s + 2; // 中心 Y
      const r = 4 * s;     // 半径（広がり）

      this.diamondPoints = [
        { x: cx,     y: cy - r }, // 上 (4, 0)
        { x: cx + r, y: cy     }, // 右 (8, 4)
        { x: cx,     y: cy + r }, // 下 (4, 8)
        { x: cx - r, y: cy     }  // 左 (0, 4)
      ];
      // 現在の座標から一番近い頂点を探すか、0番目からスタート
      this.diamondStep = 0;
    }

    // 次の目的地
    const target = this.diamondPoints[this.diamondStep];
    const dx = target.x - this.px;
    const dy = target.y - this.py;
    const dist = Math.hypot(dx, dy);

    // スピード設定
    const moveSpeed = this.speed !== 30 ? (this.speed / 10) : 3;

    if (dist < moveSpeed) {
      // 頂点に到達したら次の頂点へ
      this.px = target.x;
      this.py = target.y;
      this.diamondStep = (this.diamondStep + 1) % 4;
    } else {
      // 目的地に向かって直線移動
      this.px += (dx / dist) * moveSpeed;
      this.py += (dy / dist) * moveSpeed;
    }

    this.updateVisual();
  }

  // B2: 縦の8の字（〇が上下）、B3: 横の∞（〇が左右）
  moveFigureEight(orientation) {
    if (this.angle === undefined) this.angle = 0;

    // ★さらにスローに調整（0.035 -> 0.025）
    // これにより、さらにゆっくりと一歩一歩進むようになります
    const speedFactor = this.speed !== 30 ? (this.speed / 1200) : 0.025;
    this.angle += speedFactor;

    const s = CELL_RAW_SIZE + GAP;
    
    // ★軌道の大きさを広げる（デフォルト 2 -> 3マス分へ）
    // radiusが指定されていない場合、3マス分（約120px）の大きな輪を描きます
    const r = (this.radius !== undefined ? this.radius : 3) * s;

    const t = this.angle;

    if (orientation === 'vertical') {
      // B2: 縦の8の字
      // 円の膨らみを出すため、縦の係数を 0.8 -> 1.0 に戻して「正円」に近づけました
      this.px = this.startX + Math.cos(t) * r;
      this.py = this.startY + Math.sin(t * 2) * r; 
    } else {
      // B3: 横の∞
      this.px = this.startX + Math.sin(t * 2) * r;
      this.py = this.startY + Math.cos(t) * r;
    }

    this.updateVisual();
  }

  // Zの字に動くロジック
  moveBZ() {
    if (this.bzStep === undefined) {
      this.bzStep = 0;
      // 軌道を中央寄りに凝縮 (3マス目〜5マス目の範囲)
      this.bzPoints = [
        { x: 3, y: 3 }, // 左上（中央寄り）
        { x: 5, y: 3 }, // 右上（中央寄り）
        { x: 3, y: 5 }, // 左下（中央寄り）
        { x: 5, y: 5 }  // 右下（中央寄り）
      ];
    }

    const s = CELL_RAW_SIZE + GAP;
    const target = this.bzPoints[this.bzStep];
    const tx = target.x * s + 2;
    const ty = target.y * s + 2;

    const dx = tx - this.px;
    const dy = ty - this.py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // 範囲が狭くなった分、スピードを少し上げると回避がよりスリリングになります
    const speed = 9; 

    if (dist < speed) {
      this.px = tx;
      this.py = ty;
      this.bzStep = (this.bzStep + 1) % this.bzPoints.length;
      
      this.isPausing = true;
      // 停止時間を少し短く（0.4秒）してテンポを上げます
      setTimeout(() => { this.isPausing = false; }, 400); 
    } else {
      this.px += (dx / dist) * speed;
      this.py += (dy / dist) * speed;
    }
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

    // ★追加：物理座標を固定
    this.vx = 0;
    this.vy = 0;

    // ★最重要：CSSのtransitionを即座に消し、現在の位置に固定する
    this.element.style.transition = "none";
    this.element.style.left = this.px + 'px';
    this.element.style.top = this.py + 'px';

    if (window.app) window.app.playSE('maou_se_system19.wav'); 
    
    this.element.style.animation = "none"; 
    
    setTimeout(() => { 
      this.element.classList.add('enemy-die'); 
      this.createParticles(); 
    }, 10);
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
    
    // マスの中心（中心点から左右に少し余裕を持たせた範囲）で判定する
    // これにより、境界線を数ピクセル踏んだくらいでは「隣のマス」に判定されなくなります
    return { 
      x: Math.floor((this.px - 2 + (CELL_RAW_SIZE / 2)) / s), 
      y: Math.floor((this.py - 2 + (CELL_RAW_SIZE / 2)) / s) 
    };
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
