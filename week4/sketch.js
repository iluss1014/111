let inputField;
let sizeSlider;
let toggleBtn;
let isBouncing = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 建立輸入框並給予預設文字
  inputField = createInput('ฅ^•ﻌ•^ฅ');
  
  // 設定輸入框樣式：白色背景、黑色文字、圓角等
  inputField.style('background-color', '#fcfcfc');
  inputField.style('color', '#30292f');
  inputField.style('border', 'none');
  inputField.style('padding', '10px');
  inputField.style('border-radius', '5px');
  inputField.style('font-size', '16px');
  inputField.style('text-align', 'center');
  inputField.style('outline', 'none');
  
  // 設定固定寬度以便置中計算，也可以不設寬度動態取得
  inputField.size(200);
  
  // 建立滑桿：範圍 15-80，預設值 24
  sizeSlider = createSlider(15, 80, 24);
  sizeSlider.style('width', '200px');
  sizeSlider.style('accent-color', '#5d737e');
  
  // 建立按鈕
  toggleBtn = createButton('跳動');
  toggleBtn.style('background-color', '#ffffff');
  toggleBtn.style('color', '#30292f');
  toggleBtn.style('border', 'none');
  toggleBtn.style('padding', '10px');
  toggleBtn.style('border-radius', '5px');
  toggleBtn.style('font-size', '16px');
  toggleBtn.mousePressed(toggleBounce);
  
  // 更新輸入框位置
  updateInputPosition();
}

function draw() {
  background('#000000'); // 深色模式的黑色背景
  
  let txt = inputField.value();
  
  // 設定繪製文字的樣式
  fill('#3f4045'); // 深色模式的文字顏色
  textSize(sizeSlider.value());
  textAlign(LEFT, TOP);
  noStroke();

  // 若有文字內容，則計算寬度並進行全螢幕迴圈繪製
  if (txt.length > 0) {
    let marginX = 15; // 文字水平間距
    let marginY = 15; // 文字垂直間距
    let w = textWidth(txt) + marginX;
    let h = textAscent() + textDescent() + marginY;
    
    for (let y = 0; y < height; y += h) {// 垂直迴圈
      for (let x = 0; x < width; x += w) {// 水平迴圈
        let charX = x;// 每行文字的起始 x 座標
        for (let i = 0; i < txt.length; i++) {// 逐字繪製
          let char = txt.charAt(i);// 取得當前字元
          let yOffset = 0;// 跳動效果的垂直偏移量
          if (isBouncing) {// 若跳動效果開啟，計算偏移量
            yOffset = (sin((frameCount / 20 + charX / 50) + 1) / 2) * 24//使用正弦函數創造跳動效果，根據時間和字元位置調整偏移量
          } 
          text(char, charX, y + yOffset);// 繪製字元，考慮跳動偏移
          charX += textWidth(char);// 更新下一個字元的 x 座標
        }
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateInputPosition();
}

function updateInputPosition() {
  // 計算位置使其位於畫面下方中央
  // 使用 elt.offsetWidth 確保包含 padding 的寬度計算準確
  let x = (windowWidth - inputField.elt.offsetWidth) / 2;
  // 將輸入框稍微向上移，留出空間給滑桿
  let y = windowHeight - 100; 
  inputField.position(x, y);
  
  // 設定滑桿位置在輸入框下方
  let sx = (windowWidth - sizeSlider.elt.offsetWidth) / 2;
  let sy = windowHeight - 50;
  sizeSlider.position(sx, sy);
  
  // 設定按鈕位置在輸入框右邊
  let bx = x + inputField.elt.offsetWidth + 10;
  let by = y;
  toggleBtn.position(bx, by);
}

function toggleBounce() {
  isBouncing = !isBouncing;
  if (isBouncing) {
    toggleBtn.style('background-color', '#5d737e');
    toggleBtn.style('color', '#ffffff');
  } else {
    toggleBtn.style('background-color', '#ffffff');
    toggleBtn.style('color', '#30292f');
  }
}