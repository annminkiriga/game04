// ■ending.js

function initEnding() {
    window.stop();
    const view = document.getElementById('game-view');
    view.innerHTML = ''; 
    view.style.backgroundColor = '#000';
    view.style.position = 'relative';
    view.style.overflow = 'hidden';

    const bgm = new Audio('sounds/maou_game_casino04.mp3');
    bgm.play();

    // 1. 背景ステージレイヤー（ダンス会場）
    const stageLayer = document.createElement('div');
    stageLayer.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        z-index: 100; transition: opacity 1.5s; opacity: 0;
    `;
    view.appendChild(stageLayer);

    // 2. テキストレイヤー（最前面）
    const creditDiv = document.createElement('div');
    creditDiv.style.cssText = `
        position: absolute; width: 100%; text-align: center;
        top: 50%; left: 50%; transform: translate(-50%, -50%);
        font-size: 1.8rem; color: #fff; line-height: 2.2;
        z-index: 1000; text-shadow: 0 0 15px #000, 2px 2px 4px #000;
        transition: opacity 1.5s; opacity: 0;
    `;
    view.appendChild(creditDiv);

    // 3. 暗転オーバーレイ
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: black; opacity: 0; z-index: 10001;
        transition: opacity 5s linear; pointer-events: none;
    `;
    view.appendChild(overlay);

    let danceInterval = null;

    // ラインダンス生成関数
    function startLineDance() {
    stageLayer.innerHTML = '';
    stageLayer.style.opacity = 1;

    const units = [];
    [35, 65].forEach(yPos => {
        const rowMarks = ['★', '★', '★', '★', '★', '★', '★'];

        rowMarks.forEach((mark, i) => {
            const el = document.createElement('div');
            const isPlayer = (i === 3);
            
            el.innerHTML = '★'; 
            el.style.cssText = `
                position: absolute;
                font-size: 2rem;
                font-weight: bold;
                color: ${isPlayer ? '#fff' : '#ff0'};
                text-shadow: ${isPlayer ? '0 0 10px #fff, 0 0 20px #fff' : '0 0 10px #ff0'};
                transform-origin: center center;
            `;
            stageLayer.appendChild(el);
            
            units.push({
                el: el,
                offset: (i - 3) * 11,
                yBase: yPos,
                isPlayer: isPlayer,
                side: yPos === 35 ? 1 : -1,
                tiltPhase: i * Math.PI 
            });
        });
    });

    let startTime = Date.now();
    danceInterval = setInterval(() => {
        let elapsed = (Date.now() - startTime) / 1000;
        
        units.forEach(u => {
            let x, y = u.yBase;
            let tilt = 0; // 基本は傾きなし（垂直）

            // --- タイムスケジュール ---
            if (elapsed < 2.5) {
                // 1. 登場（0-2.5秒）：歩かずにスライド
                let progress = elapsed / 2.5;
                x = (u.side === 1) ? (130 - progress * 80) : (-30 + progress * 80);
                x += u.offset;
                tilt = 0; 
            } 
            else if (elapsed < 6.0) {
                // 2. 停止・足踏み（2.5-6.0秒）：その場で左右に傾く
                x = 50 + u.offset;
                tilt = Math.sin(elapsed * 10 + u.tiltPhase) * 15;
            } 
            else if (elapsed < 8.0) {
                // 3. 退場（6.0-8.0秒）：歩かずにスライド
                // 文章が消える（9秒）より前の「8秒」地点で完全に消える設定
                let progress = (elapsed - 6.0) / 2.0;
                x = (u.side === 1) ? (50 - progress * 100) : (50 + progress * 100);
                x += u.offset;
                tilt = 0;
            } else {
                // 4. 退場完了
                x = -200; 
            }

            u.el.style.left = x + '%';
            u.el.style.top = y + '%';
            u.el.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
        });
    }, 30);
}

// ★ここに追記します★
let geminiInterval = null;

function startGeminiFormation() {
    stageLayer.innerHTML = '';
    stageLayer.style.opacity = 1;

    const units = [];
    const count = 7; 

    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        const isPlayer = (i === 0); // 先頭をプレイヤー(☆)に
        
        el.innerHTML = '★'; 
        el.style.cssText = `
            position: absolute;
            font-size: 2rem;
            font-weight: bold;
            color: ${isPlayer ? '#fff' : '#0ff'};
            text-shadow: ${isPlayer ? '0 0 10px #fff, 0 0 20px #fff' : '0 0 10px #0ff'};
            transform: translate(-50%, -50%);
        `;
        stageLayer.appendChild(el);
        
        units.push({
            el: el,
            index: i,
            isPlayer: isPlayer,
            delay: i * 0.18 // 数珠つなぎの間隔
        });
    }

    let startTime = Date.now();
    geminiInterval = setInterval(() => {
        let elapsed = (Date.now() - startTime) / 1000;
        
        units.forEach(u => {
            let x = 50;
            let y = -20;
            
            // --- タイムスケジュール ---
            if (elapsed < 2.5) {
                // 1. 垂直降下：文章のかなり上で待機
                let localTime = elapsed - u.delay;
                if (localTime > 0) {
                    y = -20 + (localTime * 40); 
                    if (y > 20) y = 20; 
                }
            } 
            else if (elapsed < 6.5) {
                // 2. 円周旋回：文章の外側を「一周半」回る
                let circleTime = elapsed - 2.5;
                // 開始角度を真上(-π/2)付近に調整し、一周半(3π)程度回る計算
                let angle = (circleTime * 3.5) - (u.index * 0.4) - 1.5; 
                
                let radiusX = 35; 
                let radiusY = 30;
                x = 50 + Math.cos(angle) * radiusX;
                y = 50 + Math.sin(angle) * radiusY; 
            } 
            else if (elapsed < 7.5) {
                // 3. 下部集結：画面中央下(y:80%)で一直線に並ぶ
                let gatherTime = (elapsed - 6.5) / 1.0;
                // 円の軌道からスムーズに集結地点へ
                let startX = 50 + Math.cos(3.5 * 4 - (u.index * 0.4) - 1.5) * 35; // 直前の位置
                let endX = 50 + (u.index - 3) * 8; // 横に並ぶ
                
                x = startX + (endX - startX) * gatherTime;
                y = 80; // 文章(50%)より下の位置で集結
            } 
            else if (elapsed < 8.5) {
                // 4. 画面下外へ退場
                let exitTime = elapsed - 7.5;
                x = 50 + (u.index - 3) * 8;
                y = 80 + (exitTime * 120); // 垂直に高速降下
            } else {
                y = 150; 
            }

            u.el.style.left = x + '%';
            u.el.style.top = y + '%';
        });
    }, 30);
}

let bossInterval = null;

function startBossFormation() {
    stageLayer.innerHTML = '';
    stageLayer.style.opacity = 1;

    const bosses = [];
    // 四隅の初期位置（0:左上, 1:右上, 2:右下, 3:左下）
    const corners = [
        { x: -20, y: -20, targetX: 15, targetY: 15 },
        { x: 120, y: -20, targetX: 85, targetY: 15 },
        { x: 120, y: 120, targetX: 85, targetY: 85 },
        { x: -20, y: 120, targetX: 15, targetY: 85 }
    ];

    corners.forEach((pos, i) => {
        const el = document.createElement('div');
        el.innerHTML = '★'; 
        el.style.cssText = `
            position: absolute;
            font-size: 5rem; /* ボスなので大きく */
            font-weight: bold;
            color: #f00; /* 魔王魂っぽく赤色 */
            text-shadow: 0 0 20px #f00, 0 0 40px #b00;
            transform: translate(-50%, -50%);
            z-index: 200;
        `;
        stageLayer.appendChild(el);
        bosses.push({ el, start: pos, index: i });
    });

    let startTime = Date.now();
    bossInterval = setInterval(() => {
        let elapsed = (Date.now() - startTime) / 1000;
        
        bosses.forEach(b => {
            let x, y;
            
            if (elapsed < 2.0) {
                // 1. 四隅から登場 (0-2秒)
                let p = elapsed / 2.0;
                x = b.start.x + (b.start.targetX - b.start.x) * p;
                y = b.start.y + (b.start.targetY - b.start.y) * p;
            } 
            else if (elapsed < 6.5) {
                // 2. 四角形状に周回 (2-6.5秒)
                let tourTime = (elapsed - 2.0) * 1.2; // 回転速度
                // 四角形の上を滑るように動かすための計算
                let phase = (tourTime + b.index) % 4; 
                let tx, ty;
                
                if (phase < 1) { // 上辺を右へ
                    tx = 15 + (phase) * 70; ty = 15;
                } else if (phase < 2) { // 右辺を下へ
                    tx = 85; ty = 15 + (phase - 1) * 70;
                } else if (phase < 3) { // 下辺を左へ
                    tx = 85 - (phase - 2) * 70; ty = 85;
                } else { // 左辺を上へ
                    tx = 15; ty = 85 - (phase - 3) * 70;
                }
                x = tx; y = ty;
            } 
            else if (elapsed < 8.5) {
                // 3. 四隅へ退場 (6.5-8.5秒)
                let p = (elapsed - 6.5) / 2.0;
                // 周回時の現在地から、元の画面外（cornersの初期位置）へ
                let currentX = x; // 直前の計算結果を保持したいが、簡易的にターゲットから計算
                x = b.start.targetX + (b.start.x - b.start.targetX) * p;
                y = b.start.targetY + (b.start.y - b.start.targetY) * p;
            } else {
                x = -200;
            }

            b.el.style.left = x + '%';
            b.el.style.top = y + '%';
        });
    }, 30);
}

let finalInterval = null;

function startFinalFormation() {
    stageLayer.innerHTML = '';
    stageLayer.style.opacity = 1;

    const units = [];
    // フィナーレの配置データ
    const layout = [
        { mark: '★', size: '2rem', x: 20, y: 15, color: '#ff0', side: 'top' },    // 左上
        { mark: '★', size: '2rem', x: 80, y: 15, color: '#ff0', side: 'top' },    // 右上
        // ★左ボスの y を 50 -> 35 に変更して少し上に
        { mark: '★', size: '5rem', x: 12, y: 35, color: '#f00', side: 'left' },   
        { mark: '★', size: '2rem', x: 75, y: 35, color: '#0ff', side: 'right' },  // 右上★☆★
        { mark: '☆', size: '2rem', x: 85, y: 35, color: '#fff', side: 'right' },  
        { mark: '★', size: '2rem', x: 95, y: 35, color: '#0ff', side: 'right' },  
        { mark: '★', size: '2rem', x: 15, y: 85, color: '#ff0', side: 'bottom' }, // 左下
        { mark: '★', size: '5rem', x: 75, y: 80, color: '#f00', side: 'bottom' }, // 右下ボス
        { mark: '★', size: '2rem', x: 88, y: 80, color: '#0ff', side: 'right' },  // 右下ボス横
        { mark: '★', size: '2rem', x: 96, y: 80, color: '#0ff', side: 'right' }   
    ];

    layout.forEach((data, i) => {
        const el = document.createElement('div');
        el.innerHTML = data.mark;
        el.style.cssText = `
            position: absolute;
            font-size: ${data.size};
            font-weight: bold;
            color: ${data.color};
            text-shadow: 0 0 15px ${data.color};
            transform: translate(-50%, -50%);
        `;
        stageLayer.appendChild(el);

        let startX = data.x;
        let startY = data.y;
        if (data.side === 'top') startY = -20;
        if (data.side === 'bottom') startY = 120;
        if (data.side === 'left') startX = -20;
        if (data.side === 'right') startX = 120;

        units.push({ el, targetX: data.x, targetY: data.y, startX, startY, phase: i });
    });

    let startTime = Date.now();
    finalInterval = setInterval(() => {
        let elapsed = (Date.now() - startTime) / 1000;
        
        units.forEach(u => {
            let x, y;
            if (elapsed < 2.0) {
                let p = elapsed / 2.0;
                x = u.startX + (u.targetX - u.startX) * p;
                y = u.startY + (u.targetY - u.startY) * p;
            } else {
                x = u.targetX;
                y = u.targetY + Math.sin(elapsed * 2 + u.phase) * 4;
            }
            u.el.style.left = x + '%';
            u.el.style.top = y + '%';
        });
    }, 30);
}

    const updateInterval = setInterval(() => {
        const curr = bgm.currentTime;

        // 配列①：Game design (1～9秒)
        if (curr >= 1 && curr < 9) {
            if (currentIdx !== 0) {
                currentIdx = 0;
                creditDiv.innerHTML = "Game Designer<br><span style='color:#0f0'>アンミン Annmin</span>";
                creditDiv.style.opacity = 1;
                startLineDance();
            }
        } 
        // 配列①のリセット（9～11秒）
        else if (curr >= 9 && curr < 11) {
            creditDiv.style.opacity = 0;
            stageLayer.style.opacity = 0;
            if (danceInterval) { clearInterval(danceInterval); danceInterval = null; }
            currentIdx = -1;
        }
        // 配列②：Program Gemini (11～19秒) ★追加
        else if (curr >= 11 && curr < 19) {
            if (currentIdx !== 1) {
                currentIdx = 1;
                creditDiv.innerHTML = "Programmer<br><span style='color:#0ff'>ジェミニ Gemini</span>";
                creditDiv.style.opacity = 1;
                startGeminiFormation(); 
            }
        } 
        // 配列②のリセット（19～21秒） ★追加
        else if (curr >= 19 && curr < 21) {
            creditDiv.style.opacity = 0;
            stageLayer.style.opacity = 0;
            if (geminiInterval) { clearInterval(geminiInterval); geminiInterval = null; }
            currentIdx = -1;
        }

        // 配列②のリセット（19～21秒）の後に追記
        else if (curr >= 21 && curr < 29) {
            if (currentIdx !== 2) {
                currentIdx = 2;
                creditDiv.innerHTML = "BGM・SE<br><span style='color:#f00'>魔王魂 maou damashii</span>";
                creditDiv.style.opacity = 1;
                startBossFormation();
            }
        }
        // 配列③のリセット（29～31秒）
        else if (curr >= 29 && curr < 31) {
            creditDiv.style.opacity = 0;
            stageLayer.style.opacity = 0;
            if (bossInterval) { clearInterval(bossInterval); bossInterval = null; }
            currentIdx = -1;
        }

        // 配列③のリセット（29～31秒）の後に追記
        else if (curr >= 31 && curr < 39) {
            if (currentIdx !== 3) {
                currentIdx = 3;
                creditDiv.innerHTML = "<span style='font-size:1.4rem'>Thank you for playing!</span>";
                creditDiv.style.opacity = 1;
                startFinalFormation();
            }
        }
        // 最終リセット（フェードアウト開始 35秒～）
        else if (curr >= 39) {
            creditDiv.style.opacity = 0;
            stageLayer.style.opacity = 0;
            if (finalInterval) { clearInterval(finalInterval); finalInterval = null; }
            currentIdx = -1;
        }

        if (curr >= 35) overlay.style.opacity = 1; // ここで画面全体がゆっくり暗くなる
        if (curr >= 41 || bgm.ended) cleanup();

        if (curr >= 35) overlay.style.opacity = 1;
        if (curr >= 41 || bgm.ended) cleanup();
    }, 100);

    let currentIdx = -1;
    const exitEnding = () => cleanup();
    view.addEventListener('click', exitEnding, { once: true });

    function cleanup() {
        clearInterval(updateInterval);
        if (danceInterval) clearInterval(danceInterval);
        bgm.pause();
        location.reload();
    }
}