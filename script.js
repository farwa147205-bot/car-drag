// Game variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let gameRunning = false;
let selectedCar = null;
let score = 0;
let distance = 0;
let roadOffset = 0;
let player = { x: canvas.width / 2 - 25, y: canvas.height - 100, width: 50, height: 80, speed: 0, accel: 0, maxSpeed: 5 };
let obstacles = [];
let opponents = [];
let keys = {};

// Car stats (fictional luxury cars)
const cars = {
    luxor: { maxSpeed: 7, accel: 0.1, color: '#FFD700' }, // Gold
    aether: { maxSpeed: 5, accel: 0.2, color: '#FF4500' }, // Orange
    quantum: { maxSpeed: 4, accel: 0.3, color: '#00BFFF' } // Blue
};

// Audio placeholders (replace with actual file paths)
const bgMusic = new Audio('placeholder-music.mp3'); // Background racing music
const engineSound = new Audio('placeholder-engine.mp3'); // Engine sound on acceleration
const collisionSound = new Audio('placeholder-collision.mp3'); // Collision sound

// Initialize game
function init() {
    // Car selection
    document.querySelectorAll('.car-option').forEach(option => {
        option.addEventListener('click', () => {
            selectedCar = option.dataset.car;
            player.maxSpeed = cars[selectedCar].maxSpeed;
            player.accel = cars[selectedCar].accel;
            document.getElementById('car-selection').classList.add('hidden');
            startGame();
        });
    });

    // Restart button
    document.getElementById('restart-btn').addEventListener('click', restartGame);

    // Controls
    document.addEventListener('keydown', (e) => { keys[e.key] = true; });
    document.addEventListener('keyup', (e) => { keys[e.key] = false; });

    // Mobile touch controls
    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        if (touchX < touchStartX - 50) keys['ArrowLeft'] = true; // Swipe left
        else if (touchX > touchStartX + 50) keys['ArrowRight'] = true; // Swipe right
        if (touchY < touchStartY - 50) keys['ArrowUp'] = true; // Swipe up
        if (touchY > touchStartY + 50) keys['ArrowDown'] = true; // Swipe down
    });
    canvas.addEventListener('touchend', () => {
        keys = {}; // Reset on touch end
    });
}

function startGame() {
    gameRunning = true;
    score = 0;
    distance = 0;
    obstacles = [];
    opponents = [];
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 100;
    player.speed = 0;
    bgMusic.loop = true;
    bgMusic.play(); // Start background music
    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Player movement
    if (keys['ArrowLeft'] && player.x > 0) player.x -= 5;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += 5;
    if (keys['ArrowUp']) {
        player.speed = Math.min(player.speed + player.accel, player.maxSpeed);
        if (!engineSound.paused) engineSound.play(); // Play engine sound
    } else {
        player.speed = Math.max(player.speed - 0.1, 0);
        engineSound.pause(); // Stop engine sound
    }
    if (keys['ArrowDown']) player.speed = Math.max(player.speed - 0.2, 0);

    // Scroll road
    roadOffset += player.speed;
    if (roadOffset > canvas.height) roadOffset = 0;

    // Update distance and score
    distance += player.speed;
    score = Math.floor(distance / 10) + Math.floor(player.speed * 10);

    // Spawn obstacles and opponents
    if (Math.random() < 0.01) obstacles.push({ x: Math.random() * (canvas.width - 50), y: -50, width: 50, height: 50 });
    if (Math.random() < 0.005) opponents.push({ x: Math.random() * (canvas.width - 50), y: -80, width: 50, height: 80, speed: 2 + Math.random() * 3 });

    // Move obstacles and opponents
    obstacles.forEach(ob => ob.y += player.speed);
    opponents.forEach(opp => opp.y += opp.speed);

    // Remove off-screen items
    obstacles = obstacles.filter(ob => ob.y < canvas.height);
    opponents = opponents.filter(opp => opp.y < canvas.height);

    // Collision detection
    const checkCollision = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    if (obstacles.some(ob => checkCollision(player, ob)) || opponents.some(opp => checkCollision(player, opp))) {
        gameOver();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw road (scrolling effect with lines; replace with image pattern for better graphics)
    ctx.fillStyle = '#333';
    ctx.fillRect(100, 0, canvas.width - 200, canvas.height);
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 5;
    for (let i = -roadOffset; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, i);
        ctx.lineTo(canvas.width / 2, i + 25);
        ctx.stroke();
    }

    // Draw player car (replace with drawImage for car sprite)
    ctx.fillStyle = cars[selectedCar].color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw obstacles (replace with drawImage for obstacle sprite)
    ctx.fillStyle = '#FF0000';
    obstacles.forEach(ob => ctx.fillRect(ob.x, ob.y, ob.width, ob.height));

    // Draw opponents (replace with drawImage for opponent car sprite)
    ctx.fillStyle = '#808080';
    opponents.forEach(opp => ctx.fillRect(opp.x, opp.y, opp.width, opp.height));

    // Draw UI
    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Speed: ${Math.floor(player.speed)}`, 10, 60);
}

function gameOver() {
    gameRunning = false;
    bgMusic.pause();
    engineSound.pause();
    collisionSound.play(); // Play collision sound
    document.getElementById('final-score').textContent = `Score: ${score}`;
    document.getElementById('game-over').classList.remove('hidden');
}

function restartGame() {
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('car-selection').classList.remove('hidden');
    selectedCar = null;
}

// Start the game
init();
