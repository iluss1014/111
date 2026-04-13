let shapes = [];
let song;
let amplitude;
let bubbles = [];

// 定義多邊形的頂點座標 (使用新座標並放大約 20 倍)
const points = [
  [-3, 5], [3, 7], [1, 5], [2, 4], [4, 3], [5, 2], [6, 2], [8, 4], [8, -1], [6, 0], [0, -3]
].map(p => [p[0] * 20, p[1] * 20]);

function preload() {
  // 載入音樂檔案，請確保專案目錄下有 'sample_audio.mp3'
  // 若有不同檔名，請在此修改
  song = loadSound('sample_audio.mp3', 
    () => console.log('音樂載入成功！'), 
    () => console.error('錯誤：找不到 sample_audio.mp3，請確認檔案是否存在於資料夾中。')
  );
}

function setup() {
  // 建立填滿視窗的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化 p5.Amplitude 音量分析器
  amplitude = new p5.Amplitude();

  // 循環播放音樂
  // 注意：部分瀏覽器會阻擋自動播放，建議加入滑鼠點擊事件來觸發播放
  // 加入判斷：只有當音樂成功載入時才播放，避免報錯
  if (song.isLoaded()) {
    song.loop();
  }

  // 隨機產生 10 個多邊形並存入 shapes 陣列
  for (let i = 0; i < 10; i++) {
    shapes.push({
      x: random(width),           // 隨機 X 座標
      y: random(height),          // 隨機 Y 座標
      dx: random(-2, 2),          // 隨機 X 軸速度
      dy: random(-2, 2),          // 隨機 Y 軸速度
      startColor: color(random(255), random(255), random(255), 150), // 起始顏色
      endColor: color(random(255), random(255), random(255), 150),   // 目標顏色
      startTime: millis()         // 開始時間
    });
  }
}

function draw() {
  background(173, 216, 230); // 淺藍色背景

  // --- 水中泡泡效果 ---
  // 隨機產生新的泡泡
  if (random(1) < 0.05) { // 控制泡泡產生的頻率
    bubbles.push({
      x: random(width),
      y: height + 20, // 從底部外側開始
      size: random(10, 50),
      speed: random(1, 3),
      wobble: random(-0.5, 0.5) // 左右搖擺的幅度
    });
  }

  // 更新並繪製所有泡泡 (倒著遍歷以安全地刪除元素)
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];

    // 更新位置：向上移動並左右搖擺
    b.y -= b.speed;
    b.x += sin(frameCount * 0.05 + b.y * 0.1) * b.wobble;

    // 繪製泡泡 (半透明主體 + 高光)
    noStroke();
    fill(255, 255, 255, 60); // 泡泡主體，更透明
    ellipse(b.x, b.y, b.size, b.size);
    fill(255, 255, 255, 180); // 泡泡高光
    ellipse(b.x - b.size * 0.2, b.y - b.size * 0.2, b.size * 0.3, b.size * 0.3);

    // 如果泡泡飄出畫面頂端，就將它從陣列中移除
    if (b.y < -b.size) {
      bubbles.splice(i, 1);
    }
  }

  // 取得當前音量 (範圍 0.0 到 1.0)
  let level = amplitude.getLevel();

  // 將音量對應到縮放比例 (0.5 倍到 2 倍)
  let scaleFactor = map(level, 0, 1.0, 0.5, 2.0);

  // 更新並繪製每個多邊形
  for (let i = 0; i < shapes.length; i++) {
    let s = shapes[i];

    // 1. 更新位置
    s.x += s.dx;
    s.y += s.dy;

    // 2. 邊緣反彈檢查
    if (s.x < 0 || s.x > width) s.dx *= -1;
    if (s.y < 0 || s.y > height) s.dy *= -1;

    // 3. 繪製圖形
    push(); // 儲存當前繪圖狀態
    translate(s.x, s.y); // 移動原點到圖形位置
    
    // 往右移動時水平翻轉
    let dirX = s.dx > 0 ? -1 : 1;
    scale(dirX * scaleFactor, scaleFactor);  // 根據音量縮放
    
    noStroke();
    
    // 計算顏色漸變
    let elapsed = millis() - s.startTime;
    if (elapsed > 4000) { // 每 4 秒更換一次目標顏色
      s.startTime = millis();
      s.startColor = s.endColor;
      s.endColor = color(random(255), random(255), random(255), 150);
      elapsed = 0;
    }
    fill(lerpColor(s.startColor, s.endColor, elapsed / 2000));

    beginShape();
    // 根據 points 陣列繪製頂點
    for (let j = 0; j < points.length; j++) {
      vertex(points[j][0], points[j][1]);
    }
    endShape(CLOSE);
    
    pop(); // 恢復繪圖狀態
  }
}

// 點擊滑鼠切換播放/暫停 (解決瀏覽器自動播放策略問題)
function mousePressed() {
  if (song.isLoaded() && song.isPlaying()) {
    song.pause();
  } else if (song.isLoaded()) {
    song.loop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
