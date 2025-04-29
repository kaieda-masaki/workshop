let sound;
let fft;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  
  // FFTの初期化
  fft = new p5.FFT();
  
  // 音声ファイルのロード
  loadSound('audio.mp3', 
    // ロード成功時
    function(loadedSound) {
      sound = loadedSound;
      console.log('音声ファイルのロード成功');
      
      // 再生ボタンの作成
      let button = createButton('Play');
      button.position(10, 10);
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
    // ロード失敗時
    function(error) {
      console.error('音声ファイルのロード失敗:', error);
    }
  );
}

function draw() {
  // 背景をクリア
  background(0);
  
  // 音声が再生中の場合のみビジュアライズを行う
  if (sound && sound.isPlaying()) {
    // スペクトラムを解析
    let spectrum = fft.analyze();
    
    // バーの幅を計算
    let barWidth = width / 64;
    
    // スペクトラムを描画
    noStroke();
    fill(0, 255, 0);
    
    for (let i = 0; i < spectrum.length; i++) {
      let x = map(i, 0, spectrum.length, 0, width);
      let h = map(spectrum[i], 0, 255, 0, height);
      rect(x, height, barWidth, -h);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}