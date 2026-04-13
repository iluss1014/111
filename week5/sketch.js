function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  // 設定背景顏色為 #168aad
  background('#168aad');
  
  // 設定水草顏色 (綠色)，無邊框
  fill(160, 220, 160);
  noStroke();
  
  // 水草的基本設定
  let startX = width / 2;      // 從畫面中間開始
  let startY = height;         // 從畫面底部長出
  let plantHeight = height * 0.7; // 水草高度約為畫面的 70%
  let segments = 60;           // 水草分為多少段 (越多越平滑)
  let step = plantHeight / segments; 
  
  beginShape(); // 開始繪製多邊形
  
  // ---------------------------------------------------------
  // 第一階段：由下往上繪製水草的「左側」
  // ---------------------------------------------------------
  for (let i = 0; i <= segments; i++) {
    // 計算目前的 Y 座標
    let y = startY - (i * step);
    
    // 計算擺動幅度 (Noise)
    // xOffsetNoise: 隨著高度(i)變化，並隨著時間(frameCount)移動
    let xOffsetNoise = noise(i * 0.1 - frameCount * 0.02);
    
    // 利用 map 將 noise (0~1) 映射到擺動範圍 (-100 ~ 100)
    // 並乘上 (i / segments) 讓根部 (i=0) 不動，越上面擺動幅度越大
    let sway = map(xOffsetNoise, 0, 1, -100, 100) * (i / segments);
    
    // 計算中心點 X 座標
    let centerX = startX + sway;
    
    // 計算厚度：根部厚 (20)，頂端薄 (0)
    let thickness = map(i, 0, segments, 20, 0);
    
    // 設定頂點 (中心點向左偏移厚度)
    vertex(centerX - thickness, y);
  }
  
  // ---------------------------------------------------------
  // 第二階段：由上往下繪製水草的「右側」 (為了形成封閉圖形)
  // ---------------------------------------------------------
  for (let i = segments; i >= 0; i--) {
    let y = startY - (i * step);
    
    // 重新計算相同的擺動邏輯，確保左右兩邊同步
    let xOffsetNoise = noise(i * 0.1 - frameCount * 0.02);
    let sway = map(xOffsetNoise, 0, 1, -100, 100) * (i / segments);
    let centerX = startX + sway;
    
    // 計算厚度
    let thickness = map(i, 0, segments, 20, 0);
    
    // 設定頂點 (中心點向右偏移厚度)
    vertex(centerX + thickness, y);
  }
  
  endShape(CLOSE); // 結束繪製並封閉圖形
}

// 視窗大小改變時自動調整畫布
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
// 儲存所有水草物件的陣列
let grasses = [];
// 指定的顏色列表
const colors = ['#a3c9a8', '#84b59f', '#69a297', '#50808e', '#ddd8c4'];

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化水草
  initGrasses();
}

function initGrasses() {
  grasses = [];
  // 產生 50 根水草
  for (let i = 0; i < 50; i++) {
    // 隨機選取顏色並設定透明度
    let c = color(random(colors));
    c.setAlpha(150); // 設定透明度 (0-255)

    // 定義每根水草的屬性
    let g = {
      // 均衡分佈在視窗寬度內，但帶有一點隨機偏移讓它自然些
      x: map(i, 0, 50, 0, width), 
      // 高度不超過視窗高度的 2/3 (0.66)
      h: random(height * 0.3, height * 0.66), 
      // 線條寬度 30 到 60
      w: random(30, 60), 
      col: c,
      // 搖晃的頻率 (速度)
      speed: random(0.005, 0.02), 
      // 每個水草有獨立的 noise 起始點，讓搖晃方向不同
      noiseOffset: random(1000), 
      // 搖晃的幅度
      swayRange: random(50, 100)
    };
    grasses.push(g);
  }
}

function draw() {
  // 設定背景顏色為 #caf0f8
  background('#caf0f8');
  
  // 使用混合模式讓顏色重疊有透明效果
  blendMode(BLEND);
  
  noFill();
  
  // 繪製每一根水草
  for (let i = 0; i < grasses.length; i++) {
    let g = grasses[i];
    
    stroke(g.col);
    strokeWeight(g.w);
    strokeCap(ROUND); // 讓線條端點圓滑
    
    beginShape();
    
    // 水草分為多少段 (越多越平滑)
    let segments = 10;
    
    // 起始點 (底部) - curveVertex 需要重複第一個點作為控制點
    curveVertex(g.x, height);
    curveVertex(g.x, height);
    
    for (let j = 1; j <= segments; j++) {
      // 計算目前節點的 Y 座標 (由下往上)
      let y = height - (g.h * (j / segments));
      
      // 計算擺動 (Noise)
      // noiseOffset: 確保每根草不同
      // j * 0.1: 確保同一根草不同高度擺動不同 (產生波浪感)
      // frameCount * g.speed: 隨著時間改變
      let noiseVal = noise(g.noiseOffset + j * 0.1 + frameCount * g.speed);
      
      // 利用 map 產生擺動位移，越頂端擺動幅度越大 (乘上 j/segments)
      let sway = map(noiseVal, 0, 1, -g.swayRange, g.swayRange) * (j / segments);
      
      curveVertex(g.x + sway, y);
    }
    
    // 為了讓 curveVertex 正確結束，需要重複最後一個點作為控制點
    // 這裡重新計算最後一點的座標
    let lastJ = segments;
    let lastY = height - g.h;
    let lastNoiseVal = noise(g.noiseOffset + lastJ * 0.1 + frameCount * g.speed);
    let lastSway = map(lastNoiseVal, 0, 1, -g.swayRange, g.swayRange); // 頂端幅度最大
    curveVertex(g.x + lastSway, lastY);
    
    endShape();
  }
}

// 視窗大小改變時自動調整畫布並重新生成水草
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrasses();
}
