function setup() {
  createCanvas(windowWidth,windowHeight);
  //background("#000000");//背景顏色

  // --- 以下為新增的程式碼 ---
  fill(255); // 設定文字顏色為白色
  textAlign(CENTER, TOP); // 設定文字對齊方式為水平置中、垂直置頂
  textSize(16); // 設定合適的文字大小
  //text('按著滑鼠左鍵拖曳', width / 2, 20); // 在畫布頂部中間顯示文字
  colorMode(HSB)
  background(120,20,80);
  
}

function draw() {
  background(120,20,80); // 每一幀重繪背景，避免重疊
  stroke(300,50,60); // 設定圓的邊框顏色，使用 HSB 色彩模式，色相固定為 300，飽和度和亮度固定為 50 和 60
  
  let c_width = 100; // 圓的寬度
  let c_height = 100; // 圓的高度
  
  for (let i = 0; i < width; i += c_width) { // i += c_width 讓圓形在水平方向有間隔
    for (let j = 0; j < height; j += c_height) { // j += c_height 讓圓形在垂直方向也有間隔
      fill((i + j + mouseX + mouseY) % 360, 70, 80); // 顏色根據位置 (x+y) 變化
      ellipse(i, j, c_width, c_height); // 畫圓
    }
  }
}
//畫布可以重新定寬與高
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}// 畫布可以重新定義寬與高
