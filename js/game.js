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
    this.soundPath = 'sounds/'; 

    // --- BGMの準備（個別に作成） ---
    try {
      this.menuBGM = new Audio(`${this.soundPath}maou_bgm_cyber45.mp3`);
      this.menuBGM.loop = true;
      this.menuBGM.volume = 0.4;

      this.gameBGM = new Audio(`${this.soundPath}maou_bgm_cyber41.mp3`);
      this.gameBGM.loop = true;
      this.gameBGM.volume = 0.4;

      this.currentBGM = null;
    } catch (e) {
      console.warn("BGM load error:", e);
    }
    
    this.titleScreen = document.getElementById('title-screen');
    this.selectScreen = document.getElementById('select-screen');
    this.levelDisplay = document.getElementById('level-display');
    this.clearMenu = document.getElementById('clear-menu');
    
    this.currentGame = null;
    this.init();
  }

  // --- 【重要】BGM切り替えメソッド ---
  playBGM(nextBGM) {
    // 1. すでに同じ曲が流れているなら何もしない
    if (this.currentBGM === nextBGM) return;

    // 2. 別の曲が流れていたら止める
    if (this.currentBGM) {
      this.currentBGM.pause();
      this.currentBGM.currentTime = 0;
    }

    // 3. 新しい曲を再生
    if (nextBGM) {
      this.currentBGM = nextBGM;
      this.currentBGM.play().catch(e => console.log("Audio play blocked"));
    }
  }

  stopAllBGM() {
    if (this.currentBGM) {
      this.currentBGM.pause();
      this.currentBGM.currentTime = 0;
      this.currentBGM = null;
    }
  }

  // ★ここに差し込みます！★
  playSE(filename) {
    const se = new Audio(`${this.soundPath}${filename}`);
    se.volume = 0.5; // 効果音の音量（お好みで）
    se.play().catch(e => {}); // 連続再生時のエラー防止
  }

  init() {
    this.adjustScale();
    window.addEventListener('resize', () => this.adjustScale());

    // --- メニュー系のボタン（pointerdownで即反応＋イベント伝播停止） ---
    
    // タイトル画面
    this.titleScreen.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (this.titleScreen.style.display !== 'none') {
        this.playBGM(this.menuBGM);
        this.titleScreen.style.display = 'none';
        this.showSelectScreen();
      }
    });

    // レベル選択
    document.getElementById('prev-lv').addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.changeLevel(-1);
    });
    document.getElementById('next-lv').addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.changeLevel(1);
    });

    // スタート・リトライ共通
    const startAction = (e) => {
      e.stopPropagation();
      this.startGame();
    };
    document.getElementById('start-btn').addEventListener('pointerdown', startAction);
    document.getElementById('retry-btn').addEventListener('pointerdown', startAction);

    // タイトルへ戻る
    document.getElementById('back-to-title').addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.backToTitle();
    });

    // 次のステージ・ステージ選択へ
    document.getElementById('next-stage-btn').addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.nextStage();
    });

    const toSelectAction = (e) => {
      e.stopPropagation();
      this.showSelectScreen();
    };
    document.getElementById('back-to-select-btn').addEventListener('pointerdown', toSelectAction);
    document.getElementById('back-to-select-from-over').addEventListener('pointerdown', toSelectAction);
    
    // 右クリックメニュー禁止
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }// ← ここが init の閉じカッコです。このすぐ下に書きます。

  // 2. ここに adjustScale を追加
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
    // 追加：他のメニューを隠す
    if (this.clearMenu) this.clearMenu.style.display = 'none';
    const overMenu = document.getElementById('game-over-menu');
    if (overMenu) overMenu.style.display = 'none';
    
    this.updateSelectUI();
  }

  // もし nextStage メソッドがなければ追加
  nextStage() {
    this.currentSelectLevel++;
    this.startGame();
  }

  startGame() {
    this.playBGM(this.gameBGM);
    this.selectScreen.style.display = 'none';
    this.clearMenu.style.display = 'none';
    
    // ゲームオーバーメニューを隠し、操作を有効に戻す
    const overMenu = document.getElementById('game-over-menu');
    if (overMenu) overMenu.style.display = 'none';
    document.getElementById('game-container').style.pointerEvents = 'auto';

    if (this.currentGame) this.currentGame.destroy();
    
    try {
      this.currentGame = new Game(this.currentSelectLevel, () => {
        this.onStageClear();
      });
    } catch (e) {
      console.error("Game Start Error:", e);
    }
  }

  backToTitle() {
    this.stopAllBGM(); // タイトルに戻る時は完全停止
    this.selectScreen.style.display = 'none';
    this.titleScreen.style.display = 'flex';
  }

  // --- 残りのUI処理 ---
  changeLevel(diff) {
    const next = this.currentSelectLevel + diff;
    if (next >= 1 && next <= this.maxClearedLevel) {
      this.currentSelectLevel = next;
      this.updateSelectUI();
    }
  }

  updateSelectUI() {
    const lvStr = String(this.currentSelectLevel).padStart(3, '0');
    this.levelDisplay.innerText = `LV ${lvStr}`;
    document.getElementById('prev-lv').classList.toggle('disabled', this.currentSelectLevel <= 1);
    document.getElementById('next-lv').classList.toggle('disabled', this.currentSelectLevel >= this.maxClearedLevel);
  }

  onStageClear() {
    if (this.currentSelectLevel === this.maxClearedLevel) {
      this.maxClearedLevel++;
      localStorage.setItem('mp_max_lv', this.maxClearedLevel);
    }
    setTimeout(() => {
      if (this.clearMenu) this.clearMenu.style.display = 'flex';
    }, 2000);
  }
}

class Game {
  constructor(level, onClear) {
    this.level = level;
    this.onClear = onClear;

    const container = document.getElementById('game-container');
    
    // ★ここを修正：中身を消すとメニューまで消えるので、
    // タイトルや選択画面、クリアメニューを「残して」から他を消す
    const screens = container.querySelectorAll('.overlay-screen');
    container.innerHTML = ""; 
    screens.forEach(s => container.appendChild(s)); // メニュー類を戻す
    
    this.stage = new Stage('game-container');
    this.status = document.getElementById('status');
    this.magicBtn = document.querySelector('.magic-btn');
    
    this.playerPos = { x: 0, y: 0 };
    this.isMoving = false;
    this.isMagicCasting = false;
    this.isGameOver = false;
    this.pathHistory = [];

    this.player = this.createPlayer();

    // game.js の constructor 内
    // 1. levels.js から現在のレベルデータを取得（Lv1〜Lv100まで自動対応）
    const levelData = GAME_LEVELS[this.level] || GAME_LEVELS[1];

  // 2. 敵の生成（配列管理にして(0,0)の幽霊を防止）
  this.enemies = []; 

  if (levelData.enemies && Array.isArray(levelData.enemies)) {
    // 【新形式：Lv5など】配列がある場合は全員生成
    levelData.enemies.forEach(config => {
      const e = new Enemy(this.stage, config.x, config.y, config.type);
      if (config.radius) e.radius = config.radius;
      this.enemies.push(e);
    });
  } else if (levelData.enemyType) {
    // 【旧形式：Lv1〜4】enemyTypeがある時だけ生成（これで幽霊を阻止）
    const e = new Enemy(this.stage, levelData.enemyX, levelData.enemyY, levelData.enemyType);
    if (levelData.radius) e.radius = levelData.radius;
    this.enemies.push(e);
  }

  // --- 初期化実行 ---
  this.init();
  this.startEnemyAI();
  
  // 4. UIの表示もデータから取得
  const msg = levelData.statusMsg || `STAGE ${this.level} START`;
  this.updateUI(`> ${msg}`, "#0f0");

  // constructor の閉じカッコ
}

  createPlayer() {
    const p = document.createElement('div');
    p.id = 'player';
    p.classList.add('invincible');
    this.stage.container.appendChild(p);
    return p;
  }

  init() {
    this.updatePlayerVisual();
    this.recordPath(0, 0);

    // 盤面のタップ（pointerdown）
    this.stage.container.addEventListener('pointerdown', (e) => {
      if (this.isGameOver) return;
      const cell = e.target.closest('.cell');
      if (cell) {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        this.onCellClick(x, y);
      }
    });

    // 魔法ボタン（既存のボタンに上書き）
    if (this.magicBtn) {
      // 古いイベントを消すために一度空にする
      const newBtn = this.magicBtn.cloneNode(true);
      this.magicBtn.parentNode.replaceChild(newBtn, this.magicBtn);
      this.magicBtn = newBtn;
      
      this.magicBtn.addEventListener('pointerdown', (e) => {
        // 魔法ボタンの時だけ preventDefault をして連打によるズームを防ぐ
        e.preventDefault();
        this.castMagic();
      });
    }
  } // ← ここで init メソッドが正しく閉じられます

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
        enemy.moveTick += 100; // 100msずつカウント

        if (enemy.type === 'A') {
          // Aタイプ：プレイヤー移動中は300ms、停止中は1000ms
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
          // Eタイプ：1000ms（1秒）ごとに次のマスへ命令を出す
          if (enemy.moveTick >= 1000) {
            enemy.move(this.playerPos.x, this.playerPos.y, this.level);
            enemy.moveTick = 0;
          }
        } 
        else {
          // B, C, Dタイプ：300msごとに動く
          if (enemy.moveTick >= 300) {
            enemy.move();
            enemy.moveTick = 0;
          }
        }
      });

      this.checkCollision();
      setTimeout(loop, 100); // 心拍数を100msに細分化
    };
    loop();
  }

  // game.js の checkCollision メソッドを書き換え
  checkCollision() {
    if (this.isGameOver || !this.isMoving) return; 

    // 「いずれかの敵」に当たったか判定
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
          // 念のため、メニューが表示された瞬間に「クリックを邪魔するもの」を排除
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

  recordPath(x, y) {
    this.pathHistory.push({x, y});
    this.stage.markAsPassed(x, y);
    if (this.pathHistory.length >= 5 && !this.isMoving) {
      this.magicBtn.classList.add('active');
    } else {
      this.magicBtn.classList.remove('active');
    }
  }

  async onCellClick(tx, ty) {
    if (this.isMoving || this.isMagicCasting || this.isGameOver) return;
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
    for (let i = 0; i < Math.abs(diff); i++) {
      if (this.isGameOver) break;
      this.playerPos[axis] += step;
      window.app.playSE('maou_se_system10.wav'); // ★追加：移動音
      this.updatePlayerVisual();
      this.recordPath(this.playerPos.x, this.playerPos.y);
      this.checkCollision();
      await new Promise(r => setTimeout(r, 300));
    }
  }

  async castMagic() {
    if (this.isMoving || this.isMagicCasting || this.isGameOver || this.pathHistory.length < 2) return;
    this.isMagicCasting = true;
    this.magicBtn.classList.remove('active', 'disabled');
    this.magicBtn.classList.add('disabled');
    this.player.classList.replace('invincible', 'active');
    this.updateUI("> MAGIC ACTIVATED!!", "#ff0");

    let defeatedEnemies = []; // 今回の魔法で当たった敵をメモするリスト

    // 1. 連鎖爆発フェーズ（ここではまだ敵は消えない）
    for (let i = 0; i < this.pathHistory.length; i++) {
      const pos = this.pathHistory[i];
      this.stage.showExplosion(pos.x, pos.y);
      window.app.playSE('maou_se_magic_fire11.wav');

      // 当たり判定チェック
      this.enemies.forEach(enemy => {
        if (enemy.isAlive) {
          const eGrid = enemy.getGridPos();
          if (pos.x === eGrid.x && pos.y === eGrid.y) {
            // 当たった敵をリストに入れ、重複しないようにする
            if (!defeatedEnemies.includes(enemy)) {
              defeatedEnemies.push(enemy);
            }
          }
        }
      });

      this.stage.clearTile(pos.x, pos.y);
      await new Promise(r => setTimeout(r, 100)); // 爆発の間隔
    }

    // 2. 撃破フェーズ（全ての爆発が終わった後に実行）
    if (defeatedEnemies.length > 0) {
      // 少しだけ「タメ」を作る（お好みで 200〜500ms）
      await new Promise(r => setTimeout(r, 300));

      defeatedEnemies.forEach(enemy => {
        enemy.die(); // ここで初めて消滅アニメーション開始
      });

      // 全滅チェック
      const allDead = this.enemies.every(e => !e.isAlive);
      if (allDead) {
        this.updateUI("ALL ENEMIES DEFEATED!", "#ff0");
        window.app.playSE('maou_se_system19.wav');
        setTimeout(() => { this.gameClear(); }, 800);
      } else {
        this.finalizeMagic();
      }
    } else {
      // 誰にも当たらなかった場合
      this.finalizeMagic();
    }
  }

  // 後片付け用の補助メソッド（コードをスッキリさせるため）
  finalizeMagic() {
    this.pathHistory = [this.pathHistory[this.pathHistory.length - 1]];
    this.isMagicCasting = false;
    this.magicBtn.classList.remove('disabled');
    this.player.classList.replace('active', 'invincible');
    this.updateUI("> STANDBY (INVINCIBLE)", "#0f0");
  }

  gameClear() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // 敵を倒した直後のフィードバック
    this.updateUI("★ ENEMY DEFEATED ★", "#fff");

    // 2.5秒（2500ミリ秒）のタメを作る
    setTimeout(() => {
      // 1. クリアSEを鳴らす
      if (window.app) {
        window.app.playSE('maou_se_jingle12.wav');
      }

      // 2. 「CLEAR!」の巨大文字を表示する
      const div = document.createElement('div');
      div.className = 'clear-message';
      div.innerText = 'CLEAR!';
      this.stage.container.appendChild(div);

      // 3. UIを最終的な表示に更新
      this.updateUI("★ STAGE CLEAR ★", "#fff");

      // 4. 【重要】App側のクリア処理を呼び出す
      // これにより、さらに2秒後くらいに「次のステージへ」ボタンが出ます
      if (this.onClear) {
        this.onClear();
      }

    }, 2500); 
  }

  updateUI(t, c) {
    this.status.innerText = t;
    this.status.style.color = c;
    this.status.style.borderLeftColor = c;
  }

  destroy() {
    this.isGameOver = true;
  }
}

window.onload = () => {
    // window.app に入れることで、どこからでも app.playSE が呼べるようになります
    window.app = new App(); 
};
// ダブルタップによるズームをJavaScript側で強制停止
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault(); // 0.3秒以内の連続タップ（ダブルタップ）を無効化
  }
  lastTouchEnd = now;
}, false);

// 2本指でのピンチズームも禁止
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });