// 儲存所有水草物件的陣列
let grasses = [];
// 儲存氣泡物件的陣列
let bubbles = [];
// 指定的顏色列表
const colors = ['#a3c9a8', '#84b59f', '#69a297', '#50808e', '#ddd8c4'];
// 作品列表
const works = [
  { name: "Week 1", url: "week1/index.html" },
  { name: "Week 2", url: "week2/index.html" },
  { name: "Week 3", url: "week3/index.html" },
  { name: "Week 4", url: "week4/index.html" },
  { name: "Week 5", url: "week5/index.html" },
  { name: "Week 6-1", url: "week6-1/index.html" },
  { name: "Week 6-2", url: "week6-2/index.html" }
];

let iframeContainer;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initGrasses();
  initBubbles();
  
  // 建立用來放置 iframe 的容器 (初始隱藏)
  iframeContainer = createDiv('');
  iframeContainer.position(50, 50);
  iframeContainer.style('width', 'calc(100% - 100px)');
  iframeContainer.style('height', 'calc(100% - 100px)');
  iframeContainer.style('background', 'white');
  iframeContainer.style('border', '5px solid #50808e');
  iframeContainer.style('display', 'none');
  iframeContainer.style('z-index', '100');
}

function initBubbles() {
  bubbles = [];
  for (let i = 0; i < works.length; i++) {
    // 將 6 個氣泡均勻分佈
    let x = map(i, 0, works.length - 1, width * 0.2, width * 0.8);
    bubbles.push(new Bubble(x, height + random(100, 500), works[i].name, works[i].url));
  }
}

function initGrasses() {
  grasses = [];
  for (let i = 0; i < 50; i++) {
    let c = color(random(colors));
    c.setAlpha(150);
    grasses.push({
      x: map(i, 0, 50, 0, width), 
      h: random(height * 0.3, height * 0.66), 
      w: random(30, 60), 
      col: c,
      speed: random(0.005, 0.02), 
      noiseOffset: random(1000), 
      swayRange: random(50, 100)
    });
  }
}

// 使用 Class 物件導向技術定義氣泡
class Bubble {
  constructor(x, y, label, url) {
    this.x = x;
    this.y = y;
    this.label = label;
    this.url = url;
    this.r = 75; // 增大氣泡半徑
    this.noiseOffset = random(1000);
    this.speed = random(1, 2);
  }

  update() {
    this.y -= this.speed; // 氣泡向上飄
    this.x += sin(frameCount * 0.02 + this.noiseOffset) * 0.5; // 左右微晃
    
    // 超出頂部後回到下方
    if (this.y < -this.r) {
      this.y = height + this.r;
    }
  }

  display() {
    push();
    stroke(255, 200);
    strokeWeight(2);
    fill(255, 255, 255, 100);
    circle(this.x, this.y, this.r * 2);
    
    // 繪製高光
    noStroke();
    fill(255, 255, 255, 150);
    ellipse(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.4, this.r * 0.2);
    
    // 文字標籤
    fill(0); // 讓文字顏色更深 (純黑)
    textAlign(CENTER, CENTER);
    textSize(22); // 增大字體
    textStyle(BOLD); // 加粗文字
    text(this.label, this.x, this.y);
    pop();
  }

  isClicked() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    return d < this.r;
  }
}

function draw() {
  background('#caf0f8');
  
  // 1. 繪製水草 (背景層)
  noFill();
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
      let noiseVal = noise(g.noiseOffset + j * 0.1 + frameCount * g.speed);
      let sway = map(noiseVal, 0, 1, -g.swayRange, g.swayRange) * (j / segments);
      curveVertex(g.x + sway, y);
    }
    
    let lastJ = segments;
    let lastY = height - g.h;
    let lastNoiseVal = noise(g.noiseOffset + lastJ * 0.1 + frameCount * g.speed);
    let lastSway = map(lastNoiseVal, 0, 1, -g.swayRange, g.swayRange); // 頂端幅度最大
    curveVertex(g.x + lastSway, lastY);
    endShape();
  }

  // 2. 繪製氣泡 (互動層)
  for (let b of bubbles) {
    b.update();
    b.display();
  }
}

function mousePressed() {
  // 檢查是否點擊到氣泡
  for (let b of bubbles) {
    if (b.isClicked()) {
      openWork(b.url);
      return;
    }
  }
  
  // 如果點擊畫面其他地方且 iframe 已開啟，則關閉它
  if (iframeContainer.style('display') === 'block') {
    iframeContainer.style('display', 'none');
    iframeContainer.html(''); // 清空內容以停止影片或動畫
  }
}

function openWork(url) {
  // 動態插入 iframe 與關閉按鈕
  iframeContainer.html(`
    <button onclick="this.parentElement.style.display='none'" style="position:absolute; top:10px; right:10px; z-index:101; padding:5px 15px; cursor:pointer;">Close X</button>
    <iframe src="${url}" style="width:100%; height:100%; border:none;"></iframe>
  `);
  iframeContainer.style('display', 'block');
}

// 視窗大小改變時自動調整畫布並重新生成水草
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrasses();
  initBubbles();
}
