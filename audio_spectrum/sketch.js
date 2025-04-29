let sound;
let fft;
let smoothedSpectrum = [];
const FFT_SIZE = 2048;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
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
      button.position(20, 20);
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

function draw() {
  background(26, 26, 26);
  
  if (sound && sound.isPlaying()) {
    // スペクトラムの取得
    let spectrum = fft.analyze();
    
    // グリッドの描画
    drawGrid();
    
    // スペクトラムの描画
    noStroke();
    
    // 周波数バンドごとに描画
    for (let i = 0; i < spectrum.length; i++) {
      // スムージング
      smoothedSpectrum[i] = lerp(smoothedSpectrum[i], spectrum[i], 0.2);
      
      // 周波数の対数スケール化（x座標）
      let freqValue = map(i, 0, spectrum.length, 20, 20000); // 20Hz-20kHz
      let logX = map(log(freqValue), log(20), log(20000), 0, width);
      
      // 振幅の対数スケール化（y座標）
      let amplitude = map(smoothedSpectrum[i], 0, 255, -96, 0); // dBスケール
      let logY = map(amplitude, -96, 0, height * 0.9, height * 0.1);
      
      // グラデーションの色を計算
      let alpha = map(amplitude, -96, 0, 30, 200);
      let c = color(0, 200, 255, alpha);
      fill(c);
      
      // バーの描画
      let barWidth = (width / spectrum.length) * 2;
      let barHeight = height * 0.9 - logY;
      
      // グロー効果
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = color(0, 200, 255, 30);
      
      rect(logX, logY, barWidth, barHeight);
    }
    drawingContext.shadowBlur = 0;
  }
}

function drawGrid() {
  // 横線（振幅）
  strokeWeight(0.5);
  let dbSteps = [-96, -84, -72, -60, -48, -36, -24, -12, 0];
  for (let db of dbSteps) {
    let y = map(db, -96, 0, height * 0.9, height * 0.1);
    
    // メインの目盛り線
    stroke(60);
    line(40, y, width, y);
    
    // ラベル
    noStroke();
    fill(150);
    textAlign(RIGHT, CENTER);
    textFont('Inter');
    textSize(10);
    text(db + 'dB', 35, y);
  }
  
  // 縦線（周波数）
  let freqSteps = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
  for (let freq of freqSteps) {
    let x = map(log(freq), log(20), log(20000), 0, width);
    
    // メインの目盛り線
    stroke(60);
    line(x, height * 0.1, x, height * 0.9);
    
    // ラベル
    noStroke();
    fill(150);
    textAlign(CENTER, TOP);
    textFont('Inter');
    textSize(10);
    let label = freq >= 1000 ? (freq/1000) + 'k' : freq;
    text(label + 'Hz', x, height * 0.91);
  }
  
  // 境界線
  stroke(80);
  strokeWeight(1);
  line(40, height * 0.1, 40, height * 0.9); // 左縦線
  line(40, height * 0.9, width, height * 0.9); // 下横線
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}