const keys = document.querySelectorAll('.key');
const playButton = document.querySelector('.play');
const pauseButton = document.querySelector('.pause');
const recordButton = document.querySelector('.record');
const stopButton = document.querySelector('.stop');

let recording = false;
let recordedKeys = [];
let playbackTimeouts = [];
let playbackStartTime = null;
let playbackPaused = false;
let playbackPauseTime = null;

function playSound(key) {
  const audio = document.querySelector(`audio[data-key="${key.toUpperCase()}"]`);
  const keyElement = document.querySelector(`.key[data-key="${key.toUpperCase()}"]`);
  if (keyElement) {
      animateKey(keyElement);
  }
  if (!audio) return;

  keyElement.classList.add('active');
  audio.currentTime = 0; // Rewind to the start
  audio.play();

  setTimeout(() => {
      keyElement.classList.remove('active');
  }, 100);
}

function recordKey(key) {
  if (recording) {
      recordedKeys.push({
          key: key.toUpperCase(),
          time: Date.now()
      });
  }
}

window.addEventListener('keydown', function(event) {
  playSound(event.key);
  recordKey(event.key);
});

keys.forEach(key => {
  key.addEventListener('touchstart', function(e) {
      e.preventDefault(); // Prevent the default touch behavior, like scrolling
      const keyAttribute = this.getAttribute('data-key');
      playSound(keyAttribute);
      recordKey(keyAttribute);
  });

  key.addEventListener('click', function() {
      const keyAttribute = this.getAttribute('data-key');
      playSound(keyAttribute);
      recordKey(keyAttribute);
  });
});

function animateKey(key) {
  key.animate([
      // Keyframes
      { transform: 'scale(1)', backgroundColor: '#333' },
      { transform: 'scale(1.1)', backgroundColor: '#ffc600' },
      { transform: 'scale(1)', backgroundColor: '#333' }
  ], {
      // Timing options
      duration: 100,
      iterations: 1
  });
}

// By default make pause and stop buttons disabled
pauseButton.disabled = true;
stopButton.disabled = true;

playButton.addEventListener('click', () => {
  if (playbackPaused) {
    resumePlayback();
  } else {
    startPlayback();
  }
  playButton.disabled = true;
  pauseButton.disabled = false;
  stopButton.disabled = false;
});

pauseButton.addEventListener('click', () => {
  pausePlayback();
  playButton.disabled = false;
  pauseButton.disabled = true;
  stopButton.disabled = false;
});

recordButton.addEventListener('click', () => {
  startRecording();
  recordButton.disabled = true;
  playButton.disabled = true;
  pauseButton.disabled = true;
  stopButton.disabled = false;
});

stopButton.addEventListener('click', () => {
  stopRecording();
  stopPlayback();
  recordButton.disabled = false;
  playButton.disabled = false;
  pauseButton.disabled = true;
  stopButton.disabled = true;
});

function startRecording() {
  recording = true;
  recordedKeys = [];
  recordedKeys.push({ time: Date.now() });
}

function stopRecording() {
  recording = false;
}

function startPlayback() {
  playbackStartTime = Date.now();
  recordedKeys.slice(1).forEach(({ key, time }) => {
    const timeout = setTimeout(() => playSound(key), time - recordedKeys[0].time);
    playbackTimeouts.push(timeout);
  });
}

function pausePlayback() {
  playbackPaused = true;
  playbackPauseTime = Date.now();
  playbackTimeouts.forEach(timeout => clearTimeout(timeout));
  playbackTimeouts = [];
}

function resumePlayback() {
  playbackPaused = false;
  const elapsed = playbackPauseTime - playbackStartTime;
  recordedKeys.slice(1).forEach(({ key, time }) => {
    if (time - recordedKeys[0].time > elapsed) {
      const timeout = setTimeout(() => playSound(key), time - recordedKeys[0].time - elapsed);
      playbackTimeouts.push(timeout);
    }
  });
}

function stopPlayback() {
  playbackTimeouts.forEach(timeout => clearTimeout(timeout));
  playbackTimeouts = [];
  playbackPaused = false;
  playbackStartTime = null;
  playbackPauseTime = null;
}
