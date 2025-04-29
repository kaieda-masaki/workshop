let sound;
let fft;
let smoothedSpectrum = [];
const FFT_SIZE = 2048;  // FFTサイズを2048に変更
const MARGIN = 60;
const BUTTON_TOP = 15;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  
  // FFTの初期化
  fft = new p5.FFT(0.8, FFT_SIZE);
  
  // スムージング用の配列を初期化
  for (let i = 0; i < FFT_SIZE; i++) {
    smoothedSpectrum[i] = 0;
  }
  
  // 音声ファイルのロード
  loadSound('audio.mp3', 
    function(loadedSound) {
      sound = loadedSound;
      console.log('音声ファイルのロード成功');
      
      let button = createButton('Play');
      positionButton(button);
      button.mousePressed(function() {
        if (!sound.isPlaying()) {
          sound.play();
          button.html('Stop');
        } else {
          sound.pause();
          button.html('Play');
        }
      });
    },
    function(error) {
      console.error('音声ファイルのロード失敗:', error);
    }
  );
}

function positionButton(button) {
  let centerX = MARGIN + (width - MARGIN * 2) / 2;
  button.position(centerX - 50, BUTTON_TOP);
}

function draw() {
  background(26, 26, 26);
  drawGrid();
  
  if (sound && sound.isPlaying()) {
    drawSpectrum();
  }
}

function drawSpectrum() {
  let spectrum = fft.analyze();
  noStroke();
  
  // 表示可能な幅を計算
  let availableWidth = width - (MARGIN * 2);
  
  // スペクトラムの描画
  for (let i = 0; i < spectrum.length; i++) {
    // 周波数の対数スケール化（x座標）
    let freqValue = map(i, 0, spectrum.length, 20, 20000);
    let logX = map(log(freqValue), log(20), log(20000), MARGIN, width - MARGIN);
    
    // 周波数帯域ごとのスムージング係数を計算
    let freqRatio = log(freqValue) / log(20000);
    let smoothingFactor = map(freqRatio, 0, 1, 0.15, 0.25);  // 低域から高域へ徐々に変化
    
    // スムージング
    smoothedSpectrum[i] = lerp(smoothedSpectrum[i], spectrum[i], smoothingFactor);
    
    // 振幅の対数スケール化（y座標）
    let amplitude = map(smoothedSpectrum[i], 0, 255, -96, 0);
    let logY = map(amplitude, -96, 0, height - MARGIN, MARGIN);
    
    // バーの幅を計算（密度が一様になるように調整）
    let nextFreq = map(i + 1, 0, spectrum.length, 20, 20000);
    let nextX = map(log(nextFreq), log(20), log(20000), MARGIN, width - MARGIN);
    let spacing = nextX - logX;
    let barWidth = min(max(spacing * 0.8, 2), 20);  // 最小2px、最大20px
    
    // グラデーションの色を計算
    let alpha = map(amplitude, -96, 0, 30, 200);
    let c = color(0, 200, 255, alpha);
    fill(c);
    
    // バーの描画
    rect(logX - barWidth/2, logY, barWidth, height - MARGIN - logY);
  }
}

function drawGrid() {
  strokeWeight(0.5);
  
  // 横線（振幅）
  let dbSteps = [-96, -84, -72, -60, -48, -36, -24, -12, 0];
  for (let db of dbSteps) {
    let y = map(db, -96, 0, height - MARGIN, MARGIN);
    stroke(60);
    line(MARGIN, y, width - MARGIN, y);
    
    noStroke();
    fill(150);
    textAlign(RIGHT, CENTER);
    textFont('Inter');
    textSize(10);
    text(db + 'dB', MARGIN - 5, y);
  }
  
  // 縦線（周波数）
  let freqSteps = [20, 30, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
  for (let freq of freqSteps) {
    let x = map(log(freq), log(20), log(20000), MARGIN, width - MARGIN);
    stroke(60);
    line(x, MARGIN, x, height - MARGIN);
    
    noStroke();
    fill(150);
    textAlign(CENTER, TOP);
    textFont('Inter');
    textSize(10);
    let label = freq >= 1000 ? (freq/1000) + 'k' : freq;
    text(label + 'Hz', x, height - MARGIN + 5);
  }
  
  // 境界線
  stroke(80);
  strokeWeight(1);
  noFill();
  rect(MARGIN, MARGIN, width - MARGIN * 2, height - MARGIN * 2);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (sound) {
    let button = select('button');
    if (button) {
      positionButton(button);
    }
  }
}