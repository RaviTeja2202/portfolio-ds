const root = document.documentElement;
const toggle = document.getElementById('themeToggle');
const canvas = document.getElementById('constellation');
const ctx = canvas.getContext('2d');
const heroRadial = document.getElementById('heroRadial');
const storySparkIds = ['storySpark-1', 'storySpark-2', 'storySpark-3'];

const prefersDark =
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

function setTheme(mode) {
  root.dataset.theme = mode;
  toggle.querySelector('span').textContent = mode === 'light' ? '🌙' : '☀️';
  localStorage.setItem('data-portfolio-theme', mode);
}

function toggleTheme() {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  setTheme(next);
}

toggle.addEventListener('click', toggleTheme);

const saved = localStorage.getItem('data-portfolio-theme');
setTheme(saved || (prefersDark ? 'dark' : 'light'));

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', () => {
  resizeCanvas();
  drawRadialChart();
  drawStorySparks();
  renderCharts();
});
resizeCanvas();

const nodes = Array.from({ length: 55 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  vx: (Math.random() - 0.5) * 0.4,
  vy: (Math.random() - 0.5) * 0.4,
}));

function drawConstellation() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle =
    root.dataset.theme === 'light' ? 'rgba(11,187,163,0.8)' : 'rgba(92,242,226,0.8)';
  ctx.strokeStyle =
    root.dataset.theme === 'light'
      ? 'rgba(22,109,242,0.25)'
      : 'rgba(83,166,255,0.2)';

  nodes.forEach((node) => {
    node.x += node.vx;
    node.y += node.vy;
    if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
    if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 1.4, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < 140) {
        ctx.globalAlpha = 1 - dist / 140;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(drawConstellation);
}

requestAnimationFrame(drawConstellation);

function randomSeries(length, start, variance) {
  const arr = [];
  let current = start;
  for (let i = 0; i < length; i += 1) {
    current += (Math.random() - 0.5) * variance;
    arr.push(Math.max(0.5, current));
  }
  return arr;
}

function drawLine(canvasId, data, color) {
  const cnv = document.getElementById(canvasId);
  if (!cnv) return;
  const ratio = window.devicePixelRatio || 1;
  cnv.width = cnv.clientWidth * ratio;
  cnv.height = cnv.clientHeight * ratio;
  const context = cnv.getContext('2d');
  context.scale(ratio, ratio);
  const width = cnv.clientWidth;
  const height = cnv.clientHeight;
  context.clearRect(0, 0, width, height);
  const max = Math.max(...data);
  const min = Math.min(...data);
  const step = width / (data.length - 1);

  context.beginPath();
  data.forEach((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / (max - min || 1)) * height;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = color;
  data.forEach((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / (max - min || 1)) * height;
    context.beginPath();
    context.arc(x, y, 3, 0, Math.PI * 2);
    context.fill();
  });
}

function renderCharts() {
  drawLine(
    'velocityChart',
    randomSeries(12, 8, 1.2),
    root.dataset.theme === 'light' ? '#166df2' : '#5cf2e2'
  );
  drawLine(
    'latencyChart',
    randomSeries(12, 12, 2.5),
    root.dataset.theme === 'light' ? '#0bbba3' : '#53a6ff'
  );
}

renderCharts();
setInterval(renderCharts, 4000);

function drawRadialChart() {
  if (!heroRadial) return;
  const ratio = window.devicePixelRatio || 1;
  heroRadial.width = heroRadial.clientWidth * ratio;
  heroRadial.height = heroRadial.clientHeight * ratio;
  const context = heroRadial.getContext('2d');
  context.scale(ratio, ratio);
  const centerX = heroRadial.clientWidth / 2;
  const centerY = heroRadial.clientHeight / 2;
  const maxRadius = Math.min(centerX, centerY) - 10;
  const levels = 4;
  const data = [0.95, 0.85, 0.8];
  const colors = ['#5cf2e2', '#53a6ff', '#f27fd3'];

  context.clearRect(0, 0, heroRadial.clientWidth, heroRadial.clientHeight);
  context.strokeStyle = root.dataset.theme === 'light' ? '#d9e4ff' : '#1c2a42';

  for (let i = levels; i >= 1; i -= 1) {
    const radius = (maxRadius / levels) * i;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.stroke();
  }

  data.forEach((value, index) => {
    const angle = ((Math.PI * 2) / data.length) * index - Math.PI / 2;
    const radius = maxRadius * value;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    context.strokeStyle = colors[index];
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.arc(x, y, 4, 0, Math.PI * 2);
    context.fillStyle = colors[index];
    context.fill();
  });
}

const storySeries = [
  [12, 14, 11, 9, 8, 7],
  [40, 38, 32, 28, 22, 18],
  [1, 1.5, 2.5, 3, 3.8, 4.2],
];

function drawStorySparks() {
  storySparkIds.forEach((id, idx) => {
    drawLine(
      id,
      storySeries[idx],
      idx === 0 ? '#53a6ff' : idx === 1 ? '#5cf2e2' : '#f27fd3'
    );
  });
}

drawRadialChart();
drawStorySparks();

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

function applyFilter(target) {
  filterButtons.forEach((btn) => btn.classList.toggle('active', btn === target));
  const filter = target.dataset.filter;
  projectCards.forEach((card) => {
    const match = filter === 'all' || card.dataset.category === filter;
    card.classList.toggle('hidden', !match);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => applyFilter(button));
});

if (filterButtons.length) {
  applyFilter(filterButtons[0]);
}
