// ■game.js

/**
 * game.js
 * シーン管理(App)とゲーム本編(Game)
 */

class App {
  constructor() {
    const savedLv = localStorage.getItem('mp_max_lv');
    this.maxClearedLevel = parseInt(savedLv) || 1;
    this.currentSelectLevel = this.maxClearedLevel;

   // ★追加：全ステージ数を取得（GAME_LEVELS の要素数をカウント）
    this.totalLevels = Object.keys(GAME_LEVELS).length;

    this.soundPath = 'sounds/'; 

    this.seCache = {};
    this.seFiles = [
      'maou_se_magic_fire11.wav',
      'maou_se_system19.wav',
      'maou_se_jingle12.wav', // もし 06 を使うならここを 06 に
      'maou_se_jingle06.wav', // ★追加：これを忘れると鳴りません
      'maou_se_magic_ice04.wav',
      'maou_se_system10.wav',
      'maou_bgm_cyber30.mp3'
    ];

    this.menuBGM = new Audio();
    this.menuBGM.loop = true;
    this.menuBGM.volume = 0.4;

    this.gameBGM = new Audio();
    this.gameBGM.loop = true;
    this.gameBGM.volume = 0.4;

    // ★追加：ボス専用BGMの定義
    this.bossBGM = new Audio();
    this.bossBGM.loop = true;
    this.bossBGM.volume = 0.5; // ボスなので少し大きめに

    this.currentBGM = null;
    
    this.titleScreen = document.getElementById('title-screen');
    this.selectScreen = document.getElementById('select-screen');
    this.levelDisplay = document.getElementById('level-display');
    this.clearMenu = document.getElementById('clear-menu');
    
    this.currentGame = null;

    this.preloadAssets();
  }

  async preloadAssets() {
    const blinkText = this.titleScreen.querySelector('.blink-text');
    if (blinkText) blinkText.innerText = "Now Loading...";

    const loadAudio = (audioObj, src) => {
      return new Promise((resolve) => {
        audioObj.src = src;
        audioObj.preload = 'auto';
        
        if (audioObj.readyState >= 3) {
          resolve();
          return;
        }

        audioObj.addEventListener('canplaythrough', resolve, { once: true });
        audioObj.addEventListener('error', (e) => {
          console.warn("Audio load error:", src, e);
          resolve(); 
        }, { once: true });
        
        audioObj.load();
      });
    };

    const loadPromises = [];

    loadPromises.push(loadAudio(this.menuBGM, `${this.soundPath}maou_bgm_cyber45.mp3`));
    loadPromises.push(loadAudio(this.gameBGM, `${this.soundPath}maou_bgm_cyber41.mp3`));
    // ★追加：ボスBGMのロード
    loadPromises.push(loadAudio(this.bossBGM, `${this.soundPath}maou_bgm_cyber30.mp3`));

    this.seFiles.forEach(file => {
      const audio = new Audio();
      this.seCache[file] = audio;
      loadPromises.push(loadAudio(audio, `${this.soundPath}${file}`));
    });

    await Promise.all(loadPromises);

    if (blinkText) blinkText.innerText = "Please tap the screen";
    this.init();
  }

  playBGM(nextBGM) {
    const allBGMs = [this.menuBGM, this.gameBGM, this.bossBGM];
    allBGMs.forEach(bgm => {
      if (bgm) {
        bgm.pause();
        bgm.currentTime = 0;
      }
    });

    // nextBGMがnull（stopAllBGM経由）ならここで終了
    if (!nextBGM) {
      this.currentBGM = null;
      return;
    }

    // ゲームオーバー時は、ループOFF（クリア音）の時だけ再生を許可
    if (this.currentGame && this.currentGame.isGameOver) {
      if (nextBGM.loop === true) return;
    }

    this.currentBGM = nextBGM;
    nextBGM.play().catch(e => {});
  }

  stopAllBGM() {
    this.playBGM(null); // 全停止
  }

  playSE(filename) {
    // ボスBGMと同じファイルをSEとして鳴らそうとしたら無視する
    if (filename === 'maou_bgm_cyber30.mp3') return;

    const se = this.seCache[filename];
    if (se) {
      se.pause();
      se.currentTime = 0;
      se.volume = 0.5;
      se.play().catch(e => {});
    }
  }

  init() {
    this.adjustScale();
    window.addEventListener('resize', () => this.adjustScale());

    this.titleScreen.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (this.titleScreen.style.display !== 'none') {
        this.playBGM(this.menuBGM);
        this.titleScreen.style.display = 'none';
        this.showSelectScreen();
      }
    });

    // ★ ここに追加！
    const resetBtn = document.getElementById('debug-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (confirm("全てのクリア記録とレベル進行度をリセットしますか？")) {
          localStorage.removeItem('mp_max_lv');
          localStorage.removeItem('mp_records');
          alert("データをリセットしました。ページを再読み込みします。");
          location.reload(); 
        }
      });
    }

    document.getElementById('prev-lv').addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.changeLevel(-1);
    });
    document.getElementById('next-lv').addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.changeLevel(1);
    });

    const startAction = (e) => {
      e.stopPropagation();
      this.startGame();
    };
    document.getElementById('start-btn').addEventListener('pointerdown', startAction);
    document.getElementById('retry-btn').addEventListener('pointerdown', startAction);

    document.getElementById('back-to-title').addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.backToTitle();
    });

    document.getElementById('next-stage-btn').addEventListener('pointerdown', (e) => {
      e.preventDefault();  // ブラウザのデフォルト動作を抑止
      e.stopPropagation(); // イベントが下のレイヤーに伝わるのを阻止
      
      // ボタンを即座に非表示にして、二重クリックを防ぐ
      e.target.style.display = 'none';

      // ほんのわずか（50ms）だけ処理を遅らせて、
      // 「クリックした」という判定が消えてからステージ遷移させる
      setTimeout(() => {
        this.nextStage();
      }, 50);
    });

    const toSelectAction = (e) => {
      e.stopPropagation();
      this.showSelectScreen();
    };
    document.getElementById('back-to-select-btn').addEventListener('pointerdown', toSelectAction);
    document.getElementById('back-to-select-from-over').addEventListener('pointerdown', toSelectAction);
    
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  adjustScale() {
    const frame = document.getElementById('mobile-frame');
    if (!frame) return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const baseWidth = 375;
    const baseHeight = 667;

    const scale = Math.min(screenWidth / baseWidth, screenHeight / baseHeight, 1);

    if (scale < 1) {
      frame.style.transform = `scale(${scale})`;
      frame.style.transformOrigin = 'center center';
    } else {
      frame.style.transform = 'scale(1)';
    }
  }

  showSelectScreen() {
    this.playBGM(this.menuBGM);
    this.selectScreen.style.display = 'flex';
    if (this.clearMenu) this.clearMenu.style.display = 'none';
    const overMenu = document.getElementById('game-over-menu');
    if (overMenu) overMenu.style.display = 'none';
    
    this.updateSelectUI();
  }

  nextStage() {
    // ★修正：最終ステージの場合はレベル1に戻してセレクト画面へ（全クリのお祝い）
    if (this.currentSelectLevel >= this.totalLevels) {
      alert("ALL STAGE CLEAR!! おめでとうございます！");
      this.currentSelectLevel = 1;
      this.showSelectScreen();
      return;
    }
    
    this.currentSelectLevel++;
    this.startGame();
  }

  backToTitle() {
    this.stopAllBGM(); 
    this.selectScreen.style.display = 'none';
    this.titleScreen.style.display = 'flex';
  }

  changeLevel(diff) {
    let next = this.currentSelectLevel + diff;

    // ★ループ処理に書き換え
    if (next > this.maxClearedLevel) {
        // 解放済みの最大を超えようとしたらレベル1へ
        next = 1;
    } else if (next < 1) {
        // レベル1より前に行こうとしたら解放済みの最大レベルへ
        next = this.maxClearedLevel;
    }

    this.currentSelectLevel = next;
    this.updateSelectUI();
}

  updateSelectUI() {
    const lvStr = String(this.currentSelectLevel).padStart(3, '0');
    this.levelDisplay.innerText = `LV ${lvStr}`;
    // ★修正：常にボタンを有効に見せる（ループするため）
    document.getElementById('prev-lv').classList.remove('disabled');
    document.getElementById('next-lv').classList.remove('disabled');

    const recordDisplay = document.getElementById('record-display');
    if (recordDisplay) {
      let records = JSON.parse(localStorage.getItem('mp_records')) || {};
      let rec = records[this.currentSelectLevel];
      
      if (rec) {
        let oneShotText = rec.oneShot ? `<div style="color: #ffaa00; font-size: 0.85rem; margin-top: 5px; font-weight: bold; letter-spacing: 1px;">★ ONE SHOT DESTROYED ★</div>` : '';
        recordDisplay.innerHTML = `BEST TIME: ${rec.time}s [RANK: <span style="color: #ff0;">${rec.rank}</span>]${oneShotText}`;
      } else {
        recordDisplay.innerHTML = `<span style="color: #888;">--- NO RECORD ---</span>`;
      }
    }
  }

  startGame() {
    // ここで一律 gameBGM を流すのをやめる（Gameクラス側に任せる）
    // this.playBGM(this.gameBGM); ←これをコメントアウトまたは削除
    
    this.selectScreen.style.display = 'none';
    this.clearMenu.style.display = 'none';
    
    const overMenu = document.getElementById('game-over-menu');
    if (overMenu) overMenu.style.display = 'none';
    document.getElementById('game-container').style.pointerEvents = 'auto';

    if (this.currentGame) this.currentGame.destroy();
    
    try {
      this.currentGame = new Game(this.currentSelectLevel, (result) => {
        this.onStageClear(result); 
      });
    } catch (e) {
      console.error("Game Start Error:", e);
    }
  }

  onStageClear(result) {
    // ★修正：現在のレベルが最大解放レベルと同じ、かつ、まだ全ステージ数に達していない場合のみ次を解放
    if (this.currentSelectLevel === this.maxClearedLevel && this.maxClearedLevel < this.totalLevels) {
        this.maxClearedLevel++;
        localStorage.setItem('mp_max_lv', this.maxClearedLevel);
    }
    
    if (result) {
        this.saveRecord(this.currentSelectLevel, result);
    }
    
    setTimeout(() => {
    if (this.clearMenu) {
      // ★追加：最終ステージをクリアした時は「次のステージへ」ボタンを非表示にする
      const nextBtn = document.getElementById('next-stage-btn');
      if (nextBtn) {
        if (this.currentSelectLevel >= this.totalLevels) {
          nextBtn.style.display = 'none';
        } else {
          nextBtn.style.display = 'block'; // 通常は表示
        }
      }
      this.clearMenu.style.display = 'flex';
    }
  }, 4000);
  }

  saveRecord(level, result) {
    let records = JSON.parse(localStorage.getItem('mp_records')) || {};
    let currentRecord = records[level];

    let isNewBest = (!currentRecord || result.time < currentRecord.time);

    if (!currentRecord) {
      records[level] = { time: result.time, rank: result.rank, oneShot: result.oneShot };
    } else {
      if (isNewBest) {
        records[level].time = result.time;
        records[level].rank = result.rank;
      }
      if (result.oneShot) {
        records[level].oneShot = true;
      }
    }
    localStorage.setItem('mp_records', JSON.stringify(records));
  }
} // ★★★ ここが抜けていた App クラスの閉じ括弧です ★★★

class Game {
  constructor(level, onClear) {
    this.level = level;
    this.onClear = onClear;
    this.isGameOver = false; // ★最初にはっきりリセット
    this.isStarting = true; // ★追加：演出中フラグ
    window.app.currentGame = this; // ★即座に自身をappに登録

    const container = document.getElementById('game-container');
    
    const screens = container.querySelectorAll('.overlay-screen');
    container.innerHTML = ""; 
    screens.forEach(s => container.appendChild(s)); 
    
    this.stage = new Stage('game-container');
    this.status = document.getElementById('status');
    this.magicBtn = document.querySelector('.magic-btn');
    
    this.playerPos = { x: 0, y: 0 };
    this.isMoving = false;
    this.isMagicCasting = false;
    this.isGameOver = false;
    this.pathHistory = [];

    this.player = this.createPlayer();

    // --- ここから差し替え・追記 ---
    const levelData = GAME_LEVELS[this.level] || GAME_LEVELS[1];
    // ★修正：U または V がいればボスステージとする
    this.isBossStage = levelData.enemies?.some(e => e.type === 'U' || e.type === 'V') || 
                       levelData.enemyType === 'U' || levelData.enemyType === 'V';
    
    // BGMの再生
    // --- ここから演出処理 ---
    if (this.isBossStage) {
      // 1. BOSS BATTLE の文字を表示
      this.showBossIntro();
      
      // 2. 1.2秒後にゲーム開始
      setTimeout(() => {
        this.isStarting = false;
        window.app.bossBGM.loop = true;
        window.app.playBGM(window.app.bossBGM);
        this.updateUI("> BOSS BATTLE START!!", "#f00");
      }, 1200);
    } else {
      // 通常ステージは即開始
      this.isStarting = false;
      window.app.gameBGM.loop = true;
      window.app.playBGM(window.app.gameBGM);
      const msg = levelData.statusMsg || `STAGE ${this.level} START`;
      this.updateUI(`> ${msg}`, "#0f0");
    }
    // --- 演出処理ここまで ---

    this.enemies = []; 

    if (levelData.enemies && Array.isArray(levelData.enemies)) {
      levelData.enemies.forEach(config => {
        const e = new Enemy(this.stage, config.x, config.y, config.type);
        if (config.radius) e.radius = config.radius;
        if (config.noPause) e.noPause = config.noPause; // ★この1行を追加！
        // ★この1行を追加（スタートする角度を指定できるようにする）
        if (config.startAngle !== undefined) e.angle = config.startAngle;
        if (config.startStep !== undefined) e.startStep = config.startStep;
        // ★ 追加：levels.js から stepMode (移動の滑らかさ) を受け取る
        if (config.stepMode !== undefined) e.stepMode = config.stepMode;
        if (e.initPosition) e.initPosition();
        this.enemies.push(e);
      });
    } else if (levelData.enemyType) {
      const e = new Enemy(this.stage, levelData.enemyX, levelData.enemyY, levelData.enemyType);
      if (levelData.radius) e.radius = levelData.radius;
      this.enemies.push(e);
    }

    this.init();
    this.startEnemyAI();
    this.startBossSmoothMove();

    const msg = levelData.statusMsg || `STAGE ${this.level} START`;
    this.updateUI(`> ${msg}`, "#0f0");
  }

  createPlayer() {
    const p = document.createElement('div');
    p.id = 'player';
    p.classList.add('invincible');
    this.stage.container.appendChild(p);
    return p;
  }

  // ★ ここに追加！ ★
  showBossIntro() {
    const intro = document.createElement('div');
    intro.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      /* 初期位置はアニメーションで制御するため translate は書かない */
      color: #ff0000;
      font-size: 32px;               /* 確実にはみ出さないサイズ */
      font-weight: 900;
      text-shadow: 
        -2px -2px 0 #fff,
         2px -2px 0 #fff,
        -2px  2px 0 #fff,
         2px  2px 0 #fff,
        0 0 20px #f00;
      white-space: nowrap;
      z-index: 9999;
      pointer-events: none;
      font-family: 'Arial Black', sans-serif;
      /* 1.2秒かけて右→中央停止→左を実行 */
      animation: boss-slide 1.2s ease-in-out forwards;
      text-align: center;
    `;
    intro.innerText = "BOSS BATTLE!!";
    
    this.stage.container.appendChild(intro);

    // アニメーションが終わる頃に要素を消す
    setTimeout(() => {
      intro.remove();
    }, 1300);
  }

  init() {
    this.updatePlayerVisual();
    this.recordPath(0, 0);

    this.startTime = Date.now();
    this.magicCastCount = 0; // ★ここを追加（魔法の使用回数をリセット）

    this.stage.container.addEventListener('pointerdown', (e) => {
      // ゲーム開始から0.5秒間は入力を受け付けない（突き抜け防止）
      if (this.isGameOver || (Date.now() - this.startTime < 500)) return;
      
      const cell = e.target.closest('.cell');
      if (cell) {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        this.onCellClick(x, y);
      }
    });

    if (this.magicBtn) {
      const newBtn = this.magicBtn.cloneNode(true);
      this.magicBtn.parentNode.replaceChild(newBtn, this.magicBtn);
      this.magicBtn = newBtn;
      
      this.magicBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.castMagic();
      });
    }
  }

  startEnemyAI() {
    const loop = () => {
      if (this.isGameOver) return;
      if (this.isMagicCasting) {
        setTimeout(loop, 500);
        return;
      }

      this.enemies.forEach(enemy => {
        if (!enemy.isAlive || enemy.isPausing) return;

        if (!enemy.moveTick) enemy.moveTick = 0;
        enemy.moveTick += 100;

        if (enemy.type === 'A') {
          const interval = this.isMoving ? 300 : 1000;
          if (enemy.moveTick >= interval) {
            if (this.isMoving) {
              enemy.move(this.playerPos.x, this.playerPos.y, this.level);
            } else {
              enemy.moveRandom();
            }
            enemy.moveTick = 0;
          }
        } 
        else if (enemy.type === 'E') {
          if (enemy.moveTick >= 2000) {
            enemy.move(this.playerPos.x, this.playerPos.y, this.level);
            enemy.moveTick = 0;
          }
        } 
        else {
          if (enemy.moveTick >= 300) {
            enemy.move();
            enemy.moveTick = 0;
          }
        }
      });

      this.checkCollision();
      setTimeout(loop, 100); 
    };
    loop();
  }

  checkCollision() {
    if (this.isGameOver || !this.isMoving) return; 

    const isHit = this.enemies.some(enemy => {
      if (!enemy || !enemy.isAlive) return false;
      const eGrid = enemy.getGridPos();
      return (this.playerPos.x === eGrid.x && this.playerPos.y === eGrid.y);
    });

    if (isHit) this.gameOver();
  }

  gameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    window.app.playSE('maou_se_magic_ice04.wav');
    this.updateUI("!!! GAME OVER !!!", "#f00");
    this.player.classList.remove('active', 'invincible');
    this.player.classList.add('player-die');

    setTimeout(() => {
      this.createDieExplosion(this.playerPos.x, this.playerPos.y);
      this.player.style.display = 'none';
      
      setTimeout(() => {
        const menu = document.getElementById('game-over-menu');
        if (menu) {
          menu.style.display = 'flex';
          this.stage.container.style.pointerEvents = 'none'; 
          menu.style.pointerEvents = 'auto';
        }
      }, 1000);
    }, 1000);
  }

  createDieExplosion(x, y) {
    const s = CELL_RAW_SIZE + GAP;
    const cx = x * s + (CELL_RAW_SIZE / 2);
    const cy = y * s + (CELL_RAW_SIZE / 2);
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'die-particle';
      p.style.left = cx + 'px'; p.style.top = cy + 'px';
      p.style.setProperty('--rot', `${i * 45}deg`);
      this.stage.container.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  updatePlayerVisual() {
    const s = CELL_RAW_SIZE + GAP;
    this.player.style.left = (this.playerPos.x * s + 3) + 'px';
    this.player.style.top = (this.playerPos.y * s + 3) + 'px';
  }

  // ★引数に delayVisual を追加
  recordPath(x, y, delayVisual = false) {
    this.pathHistory.push({x, y});

    // ★追加：trueなら150ミリ秒（移動の中間）で色を変える
    if (delayVisual) {
      setTimeout(() => {
        if (!this.isGameOver) this.stage.markAsPassed(x, y);
      }, 150);
    } else {
      this.stage.markAsPassed(x, y);
    }

    if (this.pathHistory.length >= 5 && !this.isMoving) {
      this.magicBtn.classList.add('active');
    } else {
      this.magicBtn.classList.remove('active');
    }
  }

  async onCellClick(tx, ty) {
    // isStarting が true なら何もしない
    if (this.isMoving || this.isMagicCasting || this.isGameOver || this.isStarting) return;
    this.stage.showTapEffect(tx, ty);
    this.isMoving = true;
    this.magicBtn.classList.add('disabled');
    this.player.classList.replace('invincible', 'active');
    await this.moveLinear(tx, 'x');
    await this.moveLinear(ty, 'y');
    this.isMoving = false;
    this.magicBtn.classList.remove('disabled');
    if (this.pathHistory.length >= 5) this.magicBtn.classList.add('active');
    this.player.classList.replace('active', 'invincible');
    if (!this.isGameOver) this.updateUI("> STANDBY (INVINCIBLE)", "#0f0");
  }

  async moveLinear(target, axis) {
    const diff = target - this.playerPos[axis];
    if (diff === 0) return;
    const step = diff > 0 ? 1 : -1;
    
    // ★ 1マスごとの移動時間（ミリ秒）
    // 数字を大きくすると遅く、小さくすると速くなります（transitionの0.30sより少し短く）
    const moveSpeed = 270; 

    // ★ スマホの描画に合わせてカクつきをなくす「滑らかな待機処理」
    const smoothSleep = (ms) => new Promise(resolve => {
      const start = performance.now();
      const loop = (now) => {
        if (now - start >= ms) resolve();
        else requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });

    for (let i = 0; i < Math.abs(diff); i++) {
      if (this.isGameOver) break;
      this.playerPos[axis] += step;
      window.app.playSE('maou_se_system10.wav'); 
      this.updatePlayerVisual();
      
      // ★修正：第3引数に true を渡して、マスの色が光るタイミングを遅らせる
      this.recordPath(this.playerPos.x, this.playerPos.y, true);
      
      this.checkCollision();
      await smoothSleep(moveSpeed);
    }
  }

  async castMagic() {
    if (this.isMoving || this.isMagicCasting || this.isGameOver || this.pathHistory.length < 2) return;
    this.isMagicCasting = true;
    
    this.magicCastCount++; // ★ここを追加（魔法を使った回数をカウント）

    this.magicBtn.classList.add('disabled');
    this.player.classList.replace('invincible', 'active');
    
    let defeatedEnemies = [];
    // let bossDamageCount = 0; ← もう使わないので削除してOKです

    for (let i = 0; i < this.pathHistory.length; i++) {
      const pos = this.pathHistory[i];
      const explosion = this.stage.showExplosion(pos.x, pos.y);
      if (explosion) setTimeout(() => explosion.remove(), 500);

      if (i % 4 === 0) window.app.playSE('maou_se_magic_fire11.wav');

      this.enemies.forEach(enemy => {
        if (!enemy.isAlive) return;
        if (enemy.isBoss) {
          const area = enemy.getOccupiedRect();
          if (area.some(p => p.x === pos.x && p.y === pos.y)) {
            const isDown = enemy.applyDamage();
            // bossDamageCount++; ← 削除します
            if (isDown && !defeatedEnemies.includes(enemy)) defeatedEnemies.push(enemy);
          }
        } else {
          const eGrid = enemy.getGridPos();
          if (pos.x === eGrid.x && pos.y === eGrid.y && !defeatedEnemies.includes(enemy)) {
            defeatedEnemies.push(enemy);
          }
        }
      });

      this.stage.clearTile(pos.x, pos.y);
      await new Promise(r => setTimeout(r, 60)); 
    }

    // ★修正：ボスステージの場合は「1回目の魔法発動で撃破したか」で判定する
    const isOneShot = (defeatedEnemies.length >= 2) || (this.isBossStage && this.magicCastCount === 1 && defeatedEnemies.length > 0);

    if (defeatedEnemies.length > 0) {
      await new Promise(r => setTimeout(r, 200));
      defeatedEnemies.forEach(enemy => enemy.die());

      if (this.enemies.every(e => !e.isAlive)) {
        this.isGameOver = true; 
        // ここで鳴らしていた system19 を削除（または消滅SEに変える）
        this.updateUI("★ ENEMY DEFEATED ★", "#fff");

        setTimeout(() => { 
          this.gameClear(isOneShot); // 2秒後にここへ
        }, 2000); 

        return; 
      }
    }
    this.finalizeMagic();
  } // ← castMagic 本体の閉じ括弧

  finalizeMagic() {
    this.pathHistory = [this.pathHistory[this.pathHistory.length - 1]];
    this.isMagicCasting = false;
    this.magicBtn.classList.remove('disabled');
    this.player.classList.replace('active', 'invincible');
    this.updateUI("> STANDBY (INVINCIBLE)", "#0f0");
  }

  gameClear(isOneShot = false) {
    if (this.stage.container.querySelector('.clear-message')) return;

    const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    // 1. ランク判定（ここで行う）
    let rank = "C";
    if (elapsedSeconds <= 30) rank = "S";
    else if (elapsedSeconds <= 60) rank = "A";
    else if (elapsedSeconds <= 90) rank = "B";

    // 2. 音の同期実行
    // --- 音の制御：迷わずこれで行きましょう ---
    if (window.app) {
      window.app.stopAllBGM(); // ボスBGM(cyber30)を止める

      if (this.isBossStage) {
        // ★重複していた cyber30 ではなく、追加済みの 06 を鳴らす
        window.app.playSE('maou_se_jingle06.wav'); 
      } else {
        window.app.playSE('maou_se_jingle12.wav');
      }
    }

    // 3. 表示メソッドへ全て丸投げ（即座に呼ぶ！）
    this.showResultUI(isOneShot, elapsedSeconds, rank); 
  }

  // 表示処理：受け取った値をそのまま出すだけ
  showResultUI(isOneShot, time, rank) {
    let bonusHtml = isOneShot ? `<div style="font-size: 22px; color: #ffaa00; text-shadow: 0 0 15px #f00; margin-bottom: 10px; font-weight: bold; letter-spacing: 2px;">ONE SHOT DESTROYED!!</div>` : "";
    const div = document.createElement('div');
    div.className = 'clear-message';
    div.style.textAlign = 'center';
    div.innerHTML = `
      ${bonusHtml}
      <div style="font-size: 54px; margin-bottom: 10px;">CLEAR!</div>
      <div style="font-size: 24px; color: #ddd; text-shadow: 0 0 10px #000; line-height: 1.4;">
        TIME: ${time}s<br>
        RANK: <span style="color: #ff0;">${rank}</span>
      </div>
    `;
    this.stage.container.appendChild(div);
    this.updateUI(`★ CLEAR! [TIME:${time}s / RANK:${rank}] ★`, "#fff");

    if (this.onClear) {
      this.onClear({ time: time, rank: rank, oneShot: isOneShot });
    }
  }

  updateUI(t, c) {
    this.status.innerText = t;
    this.status.style.color = c;
    this.status.style.borderLeftColor = c;
  }

  destroy() {
    this.isGameOver = true;
  }
// ★ここから追記！
  startBossSmoothMove() {
    const smoothLoop = () => {
        if (this.isGameOver) return;
        
        if (!this.isMagicCasting && !this.isStarting) {
            this.enemies.forEach(enemy => {
                // ★修正：ボスだけでなく、W(スパイラル) と X(反射) も高速ループで動かす
                const needsSmoothMove = enemy.isBoss || enemy.type === 'W' || enemy.type === 'X';
                
                if (enemy && enemy.isAlive && needsSmoothMove) {
                    // move()の中で、それぞれのタイプに合った挙動（moveRadialSpiralなど）が実行されます
                    enemy.move(this.playerPos.x, this.playerPos.y);
                }
            });
        }
        requestAnimationFrame(smoothLoop);
    };
    requestAnimationFrame(smoothLoop);
  }
} // ← ここが Game クラスの本当の終わり

window.onload = () => {
    window.app = new App(); 
};
