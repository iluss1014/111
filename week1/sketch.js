let shapes = [];
let song;
let amplitude;
let points = [
  [-3, 5],
  [5, 6],
  [7, -2],
  [2, -5],
  [-4, -3],
  [-6, 2]
];

function preload() {
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  amplitude = new p5.Amplitude();

  for (let i = 0; i < 10; i++) {
    let shapePoints = points.map(p => {
      return {
        x: p[0] * random(10, 30),
        y: p[1] * random(10, 30)
      };
    });

    shapes.push({
      x: random(windowWidth),
      y: random(windowHeight),
      dx: random(-3, 3),
      dy: random(-3, 3),
      scale: random(1, 10),
      color: color(random(255), random(255), random(255)),
      points: shapePoints
    });
  }
}

function draw() {
  background('#ffcdb2');
  strokeWeight(2);

  let level = amplitude.getLevel();
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  for (let shape of shapes) {
    shape.x += shape.dx;
    shape.y += shape.dy;

    if (shape.x < 0 || shape.x > windowWidth) shape.dx *= -1;
    if (shape.y < 0 || shape.y > windowHeight) shape.dy *= -1;

    fill(shape.color);
    stroke(shape.color);

    push();
    translate(shape.x, shape.y);
    scale(sizeFactor);
    beginShape();
    for (let p of shape.points) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
    pop();
  }

  if (!song.isPlaying()) {
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text('Click to Play', width / 2, height / 2);
  }
}

function mousePressed() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.loop();
  }
}
