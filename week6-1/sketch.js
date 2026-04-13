let playerX, playerY;
let isDragging = false;
let lives = 5;
let gameState = "PLAYING"; // PLAYING, GAMEOVER
let restartBtn;
let level = 1;
let hitbox; // 離屏緩衝區，用於精準碰撞偵測
let pixelFont; // 用於儲存 Cubic_11 字體

// 隨機生成的起點與終點座標
let startPos = { x: 0, y: 0 };
let endPos = { x: 0, y: 0 };

let currentRoadWidth = 80; // 改為變數，以便動態調整難度

function preload() {
  // 載入 Cubic_11 字體，請確保檔案路徑正確
  // 如果您的檔名是 .otf，請更改副檔名
  pixelFont = loadFont('Cubic_11.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 套用載入的像素字體
  textFont(pixelFont);
  textStyle(BOLD);

  // 建立與螢幕同大的隱形畫布
  hitbox = createGraphics(windowWidth, windowHeight);

  // 建立重新開始按鈕
  restartBtn = createButton('重新開始');
  restartBtn.style('font-size', '20px');
  restartBtn.style('font-family', 'Cubic_11, monospace');
  restartBtn.style('padding', '10px 20px');
  restartBtn.position(windowWidth / 2 - 60, windowHeight / 2 + 100); // 再次下移按鈕，為得分文字留空間
  restartBtn.mousePressed(fullReset);
  restartBtn.hide();

  initLevel(); // 修改：確保初始時就生成隨機位置，避免堆在左上角
}

function fullReset() {
  lives = 5;
  level = 1;
  gameState = "PLAYING";
  restartBtn.hide();
  initLevel();
  loop();
}

// 初始化或進入下一關
function initLevel() {
  let startX = windowWidth * 0.1;
  let endX = windowWidth * 0.9;
  
  // 隨機起終點高度 (避開最邊緣)
  startPos = { x: startX, y: random(height * 0.2, height * 0.8) };
  endPos = { x: endX, y: random(height * 0.2, height * 0.8) };
  
  // 隨關卡增加而減少寬度，最低限制為 30
  currentRoadWidth = max(30, 80 - (level - 1) * 5);

  updateHitbox(); // 每次生成關卡時更新碰撞地圖
  resetGame();
}

// 在隱形畫布上繪製道路，作為判定基準
function updateHitbox() {
  hitbox.clear();
  hitbox.noFill();
  hitbox.stroke(255); // 使用純白作為判定色
  hitbox.strokeWeight(currentRoadWidth);
  hitbox.strokeJoin(ROUND);
  hitbox.strokeCap(ROUND);
  
  hitbox.beginShape();
  // 使用較細的步長確保路徑連續性
  for (let x = startPos.x; x <= endPos.x; x += 1) {
    hitbox.vertex(x, getRoadY(x));
  }
  hitbox.endShape();
}

function resetGame() {
  playerX = startPos.x;
  playerY = startPos.y;
  isDragging = false;
}

// 計算道路在特定 X 位置的 Y 座標
function getRoadY(x) {
  let t = map(x, startPos.x, endPos.x, 0, 1);
  // 基礎線性底色路徑
  let baseY = lerp(startPos.y, endPos.y, t);
  
  // 使用 Perlin Noise 產生隨機轉彎
  // noiseScale 決定路徑的曲折頻率（數字越大，轉彎越頻繁）
  // amplitude 決定轉彎的深度（數字越大，左右擺盪越強）
  let noiseScale = 0.002 + (level * 0.001); 
  let amplitude = 150 + (level * 40);
  
  // 以 level 作為 noise 的第二個維度，確保每一關的地圖都不一樣
  let noiseVal = noise(x * noiseScale, level * 50);
  let offset = map(noiseVal, 0, 1, -amplitude, amplitude);
  
  // 遮罩處理：確保路徑在起點 (t=0) 與終點 (t=1) 處回歸中心，不偏離圓點
  let mask = sin(t * PI);
  
  return baseY + offset * mask;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  restartBtn.position(windowWidth / 2 - 60, windowHeight / 2 + 100); // 縮放時同步更新
  hitbox.resizeCanvas(windowWidth, windowHeight); // 也要縮放隱形畫布
  initLevel(); // 縮放時重新生成以防跑位
}

function draw() {
  background(0);

  if (gameState === "GAMEOVER") {
    drawGameOver();
    return;
  }

  // --- 繪製 UI 資訊 ---
  noStroke();
  fill(255);
  textSize(24);
  textAlign(CENTER);
  text("遊戲方式：點擊綠色起點處的黃點，沿著白線滑動至紅色終點！", width / 2, 50);
  
  textAlign(LEFT);
  let label = `第 ${level} 關 | 剩餘生命: `;
  text(label, 30, 50);
  
  // 計算文字寬度，以便在文字後方接著畫像素心形
  let tw = textWidth(label);
  for (let i = 0; i < max(0, lives); i++) {
    drawPixelHeart(30 + tw + 20 + i * 22, 42, 15, color(255, 0, 0)); // 紅色生命心形
  }

  // --- 繪製彎曲道路 ---
  noFill();
  // 寬路面（透明）
  stroke(255, 40);
  strokeWeight(currentRoadWidth);
  beginShape();
  for (let x = startPos.x; x <= endPos.x; x += 5) {
    vertex(x, getRoadY(x));
  }
  endShape();

  // 中心線
  stroke(255);
  strokeWeight(4);
  beginShape();
  for (let x = startPos.x; x <= endPos.x; x += 5) {
    vertex(x, getRoadY(x));
  }
  endShape();

  // --- 繪製起點與終點 ---
  noStroke();
  fill(0, 255, 0);
  ellipse(startPos.x, startPos.y, 60, 60); 
  fill(255, 0, 0);
  ellipse(endPos.x, endPos.y, 60, 60);

  // 遊戲邏輯處理
  if (isDragging) {
    // 直接檢查隱形畫布在滑鼠位置的像素顏色 (Alpha 值 > 0 代表在路徑內)
    let onRoad = false;
    if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
      let pix = hitbox.get(mouseX, mouseY);
      if (pix[3] > 0) onRoad = true;
    }

    // 判定是否在道路內，且在起終點範圍內
    if (onRoad && mouseX >= startPos.x - 40 && mouseX <= endPos.x + 40) {
      playerX = mouseX;
      playerY = mouseY;
    } else {
      // 出界處理
      lives--;
      background(255, 0, 0, 100); // 閃紅屏提示
      resetGame();
      if (lives <= 0) {
        gameState = "GAMEOVER";
      }
    }

    // 判斷是否抵達終點
    if (dist(playerX, playerY, endPos.x, endPos.y) < 30) {
      isDragging = false;
      level++;
      initLevel();
    }
  }

  // 繪製玩家控制的像素心形
  drawPixelHeart(playerX, playerY, 25, color(255, 255, 0)); // 黃色靈魂
}

// 繪製像素風格的心形 (Undertale 風格)
function drawPixelHeart(x, y, s, col) {
  push();
  translate(x, y);
  rectMode(CENTER);
  fill(col); 
  noStroke();
  let p = s / 10; // 每個「像素」的大小
  let heartMap = [
    "011000110",
    "111101111",
    "111111111",
    "111111111",
    "011111110",
    "001111100",
    "000111000",
    "000010000"
  ];
  for (let i = 0; i < heartMap.length; i++) {
    for (let j = 0; j < heartMap[i].length; j++) {
      if (heartMap[i][j] === '1') {
        rect((j - 4) * p, (i - 4) * p, p, p);
      }
    }
  }
  pop();
}

function drawGameOver() {
  background(0); // 清除畫面確保文字清晰
  fill(255, 0, 0);
  textAlign(CENTER);
  textSize(64);
  text("GAME OVER", width / 2, height / 2 - 80); // 標題往上移
  
  textSize(32);
  fill(255, 255, 0); // 使用黃色顯示最終關卡
  text(`抵達關卡：第 ${level} 關`, width / 2, height / 2 - 10);

  textSize(24);
  fill(255);
  text("你的心數已用光！", width / 2, height / 2 + 45); // 副標題
  restartBtn.show();
  noLoop();
}

function mousePressed() {
  if (gameState === "PLAYING" && dist(mouseX, mouseY, playerX, playerY) < 30) {
    isDragging = true;
  }
}
