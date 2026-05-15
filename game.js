const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const speedEl = document.getElementById('speed');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Game settings
const ROAD_LEFT = 60;
const ROAD_RIGHT = 340;
const ROAD_WIDTH = ROAD_RIGHT - ROAD_LEFT;
const LANE_COUNT = 3;
const LANE_WIDTH = ROAD_WIDTH / LANE_COUNT;

// Game state
let gameRunning = false;
let score = 0;
let speed = 3;
let maxSpeed = 12;
let acceleration = 0.002;
let frameCount = 0;

// Player car
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 120,
    width: 40,
    height: 70,
    speed: 4,
    dx: 0
};

// Obstacles
let obstacles = [];
let roadLines = [];

// Keys
const keys = {};

// Initialize road lines
function initRoadLines() {
    roadLines = [];
    for (let i = -1; i < 12; i++) {
        roadLines.push({ y: i * 70 });
    }
}

// Draw road
function drawRoad() {
    // Grass
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(0, 0, ROAD_LEFT, canvas.height);
    ctx.fillRect(ROAD_RIGHT, 0, canvas.width - ROAD_RIGHT, canvas.height);

    // Road
    ctx.fillStyle = '#424242';
    ctx.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, canvas.height);

    // Road borders
    ctx.fillStyle = '#fff';
    ctx.fillRect(ROAD_LEFT - 3, 0, 3, canvas.height);
    ctx.fillRect(ROAD_RIGHT, 0, 3, canvas.height);

    // Road lines (dashed)
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 2;
    ctx.setLineDash([30, 20]);

    for (let i = 1; i < LANE_COUNT; i++) {
        const x = ROAD_LEFT + i * LANE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    // Animated road lines
    ctx.fillStyle = '#ffeb3b';
    roadLines.forEach(line => {
        for (let i = 1; i < LANE_COUNT; i++) {
            const x = ROAD_LEFT + i * LANE_WIDTH - 1;
            ctx.fillRect(x, line.y, 2, 30);
        }
    });
}

// Update road lines animation
function updateRoadLines() {
    roadLines.forEach(line => {
        line.y += speed;
        if (line.y > canvas.height) {
            line.y = -70;
        }
    });
}

// Draw player car
function drawPlayer() {
    const { x, y, width, height } = player;

    // Car body
    ctx.fillStyle = '#e94560';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 8);
    ctx.fill();

    // Car roof
    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.roundRect(x + 5, y + 15, width - 10, 30, 5);
    ctx.fill();

    // Windshield
    ctx.fillStyle = '#81d4fa';
    ctx.beginPath();
    ctx.roundRect(x + 8, y + 12, width - 16, 15, 3);
    ctx.fill();

    // Rear window
    ctx.fillStyle = '#81d4fa';
    ctx.beginPath();
    ctx.roundRect(x + 8, y + 45, width - 16, 12, 3);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#212121';
    ctx.fillRect(x - 4, y + 8, 6, 15);
    ctx.fillRect(x + width - 2, y + 8, 6, 15);
    ctx.fillRect(x - 4, y + height - 23, 6, 15);
    ctx.fillRect(x + width - 2, y + height - 23, 6, 15);

    // Headlights
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(x + 8, y + 3, 4, 0, Math.PI * 2);
    ctx.arc(x + width - 8, y + 3, 4, 0, Math.PI * 2);
    ctx.fill();

    // Taillights
    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    ctx.arc(x + 8, y + height - 3, 3, 0, Math.PI * 2);
    ctx.arc(x + width - 8, y + height - 3, 3, 0, Math.PI * 2);
    ctx.fill();
}

// Generate obstacle car
function createObstacle() {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const x = ROAD_LEFT + lane * LANE_WIDTH + (LANE_WIDTH - 36) / 2;
    const colors = ['#1565c0', '#2e7d32', '#f57f17', '#6a1b9a', '#00838f', '#4e342e'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    obstacles.push({
        x: x,
        y: -80,
        width: 36,
        height: 65,
        color: color,
        speed: speed * 0.6
    });
}

// Draw obstacle car
function drawObstacle(obs) {
    const { x, y, width, height, color } = obs;

    // Car body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 7);
    ctx.fill();

    // Roof
    ctx.fillStyle = darkenColor(color, 30);
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 12, width - 8, 25, 4);
    ctx.fill();

    // Windows
    ctx.fillStyle = '#b3e5fc';
    ctx.beginPath();
    ctx.roundRect(x + 6, y + 10, width - 12, 12, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x + 6, y + 40, width - 12, 10, 2);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#212121';
    ctx.fillRect(x - 3, y + 6, 5, 12);
    ctx.fillRect(x + width - 2, y + 6, 5, 12);
    ctx.fillRect(x - 3, y + height - 18, 5, 12);
    ctx.fillRect(x + width - 2, y + height - 18, 5, 12);

    // Taillights (facing player)
    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    ctx.arc(x + 7, y + height - 3, 3, 0, Math.PI * 2);
    ctx.arc(x + width - 7, y + height - 3, 3, 0, Math.PI * 2);
    ctx.fill();
}

// Darken color helper
function darkenColor(hex, amount) {
    let color = hex.replace('#', '');
    let r = Math.max(0, parseInt(color.substring(0, 2), 16) - amount);
    let g = Math.max(0, parseInt(color.substring(2, 4), 16) - amount);
    let b = Math.max(0, parseInt(color.substring(4, 6), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Update obstacles
function updateObstacles() {
    obstacles.forEach(obs => {
        obs.y += speed * 0.7;
    });

    // Remove off-screen obstacles
    obstacles = obstacles.filter(obs => obs.y < canvas.height + 100);

    // Generate new obstacles
    const spawnRate = Math.max(40, 80 - Math.floor(speed * 3));
    if (frameCount % spawnRate === 0) {
        createObstacle();
    }
}

// Collision detection
function checkCollision() {
    for (let obs of obstacles) {
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            return true;
        }
    }

    // Wall collision
    if (player.x < ROAD_LEFT || player.x + player.width > ROAD_RIGHT) {
        return true;
    }

    return false;
}

// Update player
function updatePlayer() {
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        player.x += player.speed;
    }

    // Speed control
    if (keys['ArrowUp'] || keys['KeyW']) {
        speed = Math.min(maxSpeed, speed + 0.05);
    }
    if (keys['ArrowDown'] || keys['KeyS']) {
        speed = Math.max(2, speed - 0.05);
    }

    // Keep player in bounds
    player.x = Math.max(ROAD_LEFT + 2, Math.min(ROAD_RIGHT - player.width - 2, player.x));
}

// Draw grass details
function drawGrassDetails() {
    ctx.fillStyle = '#1b5e20';
    for (let i = 0; i < 20; i++) {
        const x = Math.sin(i * 3.7 + frameCount * 0.01) * 20 + 30;
        const y = (i * 37 + frameCount * speed * 0.5) % canvas.height;
        ctx.fillRect(x, y, 3, 8);
    }
    for (let i = 0; i < 20; i++) {
        const x = ROAD_RIGHT + 10 + Math.sin(i * 2.3 + frameCount * 0.01) * 20;
        const y = (i * 37 + frameCount * speed * 0.5) % canvas.height;
        ctx.fillRect(x, y, 3, 8);
    }
}

// Explosion effect
let particles = [];

function createExplosion(x, y) {
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 60,
            color: ['#e94560', '#ff6b6b', '#ffeb3b', '#ff9800'][Math.floor(Math.random() * 4)],
            size: Math.random() * 6 + 2
        });
    }
}

function updateParticles() {
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.size *= 0.97;
    });
    particles = particles.filter(p => p.life > 0);
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life / 60;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update
    frameCount++;
    speed += acceleration;
    updateRoadLines();
    updatePlayer();
    updateObstacles();
    updateParticles();

    // Draw
    drawRoad();
    drawGrassDetails();
    drawPlayer();
    obstacles.forEach(drawObstacle);
    drawParticles();

    // Update score
    score += Math.floor(speed);
    scoreEl.textContent = `Score: ${score}`;
    speedEl.textContent = `Speed: ${Math.floor(speed * 10)} km/h`;

    // Check collision
    if (checkCollision()) {
        gameOver();
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Game over
function gameOver() {
    gameRunning = false;
    createExplosion(player.x + player.width / 2, player.y + player.height / 2);

    // Animate explosion
    let explosionFrames = 0;
    function explosionLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRoad();
        drawGrassDetails();
        obstacles.forEach(drawObstacle);
        updateParticles();
        drawParticles();
        explosionFrames++;
        if (explosionFrames < 60) {
            requestAnimationFrame(explosionLoop);
        } else {
            finalScoreEl.textContent = `Score: ${score}`;
            gameOverScreen.classList.remove('hidden');
        }
    }
    explosionLoop();
}

// Start game
function startGame() {
    score = 0;
    speed = 3;
    frameCount = 0;
    obstacles = [];
    particles = [];
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 120;
    initRoadLines();

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameRunning = true;
    gameLoop();
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Initialize
initRoadLines();
