const scenes = [...document.querySelectorAll('.scene')];
const progressBar = document.getElementById('progressBar');
const ticketChoice = document.getElementById('ticketChoice');
const futureResult = document.getElementById('future-result');
const soundToggle = document.getElementById('soundToggle');
let current = 0;
let choice = 'Eine echte Überraschung';
let soundOn = true;
let audioContext;

function showScene(index) {
  scenes[current].classList.remove('active');
  current = index;
  scenes[current].classList.add('active');
  scenes[current].scrollTop = 0;
  progressBar.style.width = `${Math.max(8, ((current + 1) / scenes.length) * 100)}%`;
  chime(current === 6 ? [392, 523.25, 659.25] : [330, 440]);
}

function chime(notes) {
  if (!soundOn) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime + index * .09);
      gain.gain.exponentialRampToValueAtTime(.055, audioContext.currentTime + index * .09 + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + index * .09 + .5);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(audioContext.currentTime + index * .09);
      oscillator.stop(audioContext.currentTime + index * .09 + .55);
    });
  } catch (_) { soundOn = false; }
}

document.querySelectorAll('[data-next]').forEach(button => {
  button.addEventListener('click', () => showScene(current + 1));
});
document.getElementById('unlock').addEventListener('click', () => showScene(1));

document.querySelectorAll('.choice').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.choice').forEach(item => item.classList.remove('selected'));
    button.classList.add('selected');
    choice = button.dataset.value;
    ticketChoice.textContent = choice;
    const messages = {
      moon: 'Ein Abend unter Lichtern – mit Gesprächen, die länger dauern als geplant.',
      spark: 'Eine Überraschung – Vural plant, Amina entscheidet nur noch über das Ja.',
      sun: 'Goldene Stunde – ein Abend, der sich leicht und besonders anfühlt.'
    };
    futureResult.textContent = messages[button.dataset.choice];
    setTimeout(() => showScene(3), 380);
  });
});

document.getElementById('trustYes').addEventListener('click', () => showScene(5));
document.getElementById('convince').addEventListener('click', () => {
  document.getElementById('convinceBox').classList.add('show');
  chime([294, 370]);
  setTimeout(() => {
    document.getElementById('convince').textContent = 'Okay … zeig mir das Finale';
    document.getElementById('convince').onclick = () => showScene(5);
  }, 250);
});

document.getElementById('accept').addEventListener('click', () => {
  launchConfetti();
  if (navigator.vibrate) navigator.vibrate([35, 45, 80]);
  setTimeout(() => showScene(6), 500);
});

document.getElementById('share').addEventListener('click', async () => {
  const text = `Vural, Mission angenommen ♥ Meine Wahl: ${choice}. Ich bin dabei!`;
  const status = document.getElementById('shareStatus');
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Mission angenommen', text });
      status.textContent = 'Antwort bereit zum Senden ♥';
    } else {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Antwort kopiert – schick sie Vural ♥';
    }
  } catch (error) {
    if (error.name !== 'AbortError') status.textContent = 'Sag Vural einfach: Ich bin dabei ♥';
  }
});

document.getElementById('replay').addEventListener('click', () => showScene(0));
soundToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggle.classList.toggle('muted', !soundOn);
  if (soundOn) chime([440]);
});

function launchConfetti() {
  const container = document.getElementById('confetti');
  const colors = ['#f2c879', '#ff6fae', '#9d6cff', '#f8f3ff'];
  for (let i = 0; i < 65; i++) {
    const piece = document.createElement('i');
    piece.className = 'confetto';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--duration', `${2.2 + Math.random() * 2}s`);
    piece.style.setProperty('--drift', `${-80 + Math.random() * 160}px`);
    piece.style.animationDelay = `${Math.random() * .35}s`;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4500);
  }
}

const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];
function resizeStars() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: Math.min(90, Math.floor(innerWidth * innerHeight / 9000)) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.2 + .15,
    a: Math.random() * .65 + .15,
    s: Math.random() * .004 + .001
  }));
}
function drawStars(time = 0) {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  stars.forEach(star => {
    ctx.beginPath();
    ctx.fillStyle = `rgba(239,229,255,${star.a * (.65 + Math.sin(time * star.s) * .35)})`;
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
}
addEventListener('resize', resizeStars);
resizeStars();
drawStars();
