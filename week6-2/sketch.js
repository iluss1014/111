let gridSize = 75; // 設定正方形的邊長
let targetX, targetY; // 目標格子的索引位置
let startTime; // 記錄開始時間
let gameState = 'PLAYING'; // 遊戲狀態：'PLAYING' 或 'RESULT'
let lastFinishTime = 0; // 最近一次完成的時間
let bestTime = Infinity; // 最佳成績 (初始化為無限大)
let elapsedTime = 0; // 目前經過時間

function setup() {
  // 創建與瀏覽器視窗等大的畫布
  createCanvas(windowWidth, windowHeight);

  // 從 localStorage 讀取最佳成績
  let savedBest = localStorage.getItem('bestTime');
  if (savedBest !== null) {
    bestTime = parseFloat(savedBest);
  }

  resetGame();
}

// 將重設遊戲的邏輯獨立出來
function resetGame() {
  targetX = floor(random(width / gridSize));
  targetY = floor(random(height / gridSize));
  startTime = millis(); // 取得目前的毫秒數
  gameState = 'PLAYING';
  
  // 確保重設後畫面立刻更新一次
  background(0);
}

function draw() {
  // 遊戲的主迴圈
  // 在遊戲中，我們通常每一幀都會重新繪製背景，以清除上一幀的畫面
  background(0);
  
  // 繪製灰色正方形網格
  stroke(100);     // 設定線條顏色為中度灰色
  noFill();        // 正方形不填滿顏色

  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      rect(x, y, gridSize, gridSize);
    }
  }

  if (gameState === 'PLAYING') {
    // --- 遊戲進行中邏輯 ---
    elapsedTime = ((millis() - startTime) / 1000).toFixed(1);
    
    // 計算滑鼠目前所在的格子索引
    let mouseGridX = floor(mouseX / gridSize);
    let mouseGridY = floor(mouseY / gridSize);

    // 檢查滑鼠是否在畫布範圍內
    if (mouseGridX >= 0 && mouseGridX < width / gridSize && mouseGridY >= 0 && mouseGridY < height / gridSize) {
      let d = dist(mouseGridX, mouseGridY, targetX, targetY);
      
      // 設定感應靈敏度：在 10 格外就維持綠色，10 格內開始劇烈變色
      let sensitivity = 10;
      // 使用 pow(..., 0.6) 讓靠近 0 (目標) 時的數值變化曲線更陡峭
      let colorRatio = pow(constrain(d / sensitivity, 0, 1), 0.6);
      
      let circleColor = lerpColor(color(255, 0, 0), color(0, 255, 150), colorRatio);
      let circleSize = map(colorRatio, 0, 1, gridSize * 0.8, gridSize * 0.15);

      fill(circleColor);
      noStroke();
      ellipse(mouseGridX * gridSize + gridSize / 2, mouseGridY * gridSize + gridSize / 2, circleSize);
    }

    // 繪製上方即時計時器
    drawUI(elapsedTime + "s");

  } else if (gameState === 'RESULT') {
    // --- 結算畫面邏輯 ---
    // 先畫出目標格子的金色標記
    fill(255, 215, 0);
    rect(targetX * gridSize, targetY * gridSize, gridSize, gridSize);

    // 繪製半透明遮罩
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    // 顯示成績面板
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(48);
    text("恭喜過關！", width / 2, height / 2 - 80);
    
    textSize(24);
    text("本次成績: " + lastFinishTime + " 秒", width / 2, height / 2 - 10);
    text("最佳成績: " + (bestTime === Infinity ? "--" : bestTime) + " 秒", width / 2, height / 2 + 30);

    // 繪製重新開始按鈕
    drawRestartButton();
  }
}

// 輔助函式：繪製頂部計時器
function drawUI(t) {
  fill(255);
  noStroke();
  textSize(32);
  textAlign(CENTER, TOP);
  text("時間: " + t, width / 2, 20);
}

// 輔助函式：繪製按鈕
function drawRestartButton() {
  let btnW = 200, btnH = 50;
  let btnX = width / 2 - btnW / 2;
  let btnY = height / 2 + 80;

  // 檢查滑鼠是否在按鈕上（簡單懸停效果）
  if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
    fill(100);
  } else {
    fill(60);
  }
  
  stroke(255);
  rect(btnX, btnY, btnW, btnH, 10);
  
  noStroke();
  fill(255);
  textSize(20);
  text("重新開始", width / 2, btnY + btnH / 2 + 7);
}

// 當瀏覽器視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (gameState === 'PLAYING') {
    // 計算點擊時所在的格子索引
    let clickedGridX = floor(mouseX / gridSize);
    let clickedGridY = floor(mouseY / gridSize);

    // 檢查是否點中目標格
    if (clickedGridX === targetX && clickedGridY === targetY) {
      // 更新成績並切換到結算狀態
      lastFinishTime = ((millis() - startTime) / 1000).toFixed(2);
      if (parseFloat(lastFinishTime) < bestTime) {
        bestTime = lastFinishTime;
        localStorage.setItem('bestTime', bestTime); // 儲存到本地
      }
      gameState = 'RESULT';
    }
  } else if (gameState === 'RESULT') {
    // 檢查是否點擊重新開始按鈕
    let btnW = 200, btnH = 50;
    let btnX = width / 2 - btnW / 2;
    let btnY = height / 2 + 80;
    
    if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
      resetGame();
    }
  }
}
