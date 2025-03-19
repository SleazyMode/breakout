// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 2;
const POWERUP_CHANCE = 0.05;
const POWERUP_SPEED = 2;
const MAX_LEVELS = 30;

// Game state
let canvas, ctx;
let score = 0;
let lives = 3;
let currentLevel = 1;
let gameLoop;
let paddle;
let balls = [];
let bricks = [];
let powerups = [];
let activePowerups = {
    laser: false,
    wide: false,
    multi: false
};

// Level configurations
const levelConfigs = Array.from({ length: MAX_LEVELS }, (_, i) => ({
    ballSpeed: 4 + (i * 0.2),
    paddleSpeed: 8 + (i * 0.1),
    brickPattern: getBrickPattern(i),
    brickStrength: Math.min(3, 1 + Math.floor(i / 5)),
    powerupChance: Math.min(0.1, 0.05 + (i * 0.001))
}));

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Initialize paddle
    paddle = {
        x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
        y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: levelConfigs[0].paddleSpeed,
        dx: 0
    };
    
    // Initialize ball
    balls = [{
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - PADDLE_HEIGHT - BALL_RADIUS - 10,
        dx: levelConfigs[0].ballSpeed,
        dy: -levelConfigs[0].ballSpeed,
        radius: BALL_RADIUS
    }];
    
    // Initialize bricks
    initBricks();
    
    // Start game loop
    gameLoop = setInterval(update, 1000 / 60);
    
    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

// Get brick pattern based on level
function getBrickPattern(level) {
    const patterns = [
        // Level 1-5: Basic patterns
        () => Array(BRICK_ROWS).fill().map(() => Array(BRICK_COLS).fill(1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill(i % 2 + 1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill(i + 1)),
        () => Array(BRICK_ROWS).fill().map(() => Array(BRICK_COLS).fill().map(() => Math.random() < 0.5 ? 1 : 0)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map(() => i % 2 + 1)),
        
        // Level 6-10: More complex patterns
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => (i + j) % 2 + 1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => (i * j) % 3 + 1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => Math.sin(i * j) > 0 ? 1 : 0)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => (i + j) % 3 + 1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => Math.random() < 0.7 ? 1 : 0)),
        
        // Level 11-15: Advanced patterns
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => (i * j) % 4 + 1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => Math.sin(i * j) > 0 ? 2 : 1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => (i + j) % 4 + 1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => Math.random() < 0.8 ? 2 : 1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => (i * j) % 5 + 1)),
        
        // Level 16-20: Expert patterns
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => Math.sin(i * j) > 0 ? 3 : 2)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => (i + j) % 5 + 1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => Math.random() < 0.9 ? 3 : 2)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => (i * j) % 6 + 1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => Math.sin(i * j) > 0 ? 3 : 1)),
        
        // Level 21-25: Master patterns
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => (i + j) % 6 + 1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => Math.random() < 0.95 ? 3 : 2)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => (i * j) % 7 + 1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => Math.sin(i * j) > 0 ? 3 : 2)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => (i + j) % 7 + 1)),
        
        // Level 26-30: Ultimate patterns
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => (i * j) % 8 + 1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => Math.random() < 0.98 ? 3 : 2)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => (i + j) % 8 + 1)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => Math.sin(i * j) > 0 ? 3 : 2)),
        () => Array(BRICK_ROWS).fill().map((_, i) => Array(BRICK_COLS).fill().map((_, j) => (i * j) % 9 + 1))
    ];
    
    return patterns[Math.min(level, patterns.length - 1)]();
}

// Initialize bricks
function initBricks() {
    const brickWidth = (CANVAS_WIDTH - (BRICK_COLS + 1) * BRICK_PADDING) / BRICK_COLS;
    const pattern = levelConfigs[currentLevel - 1].brickPattern;
    
    bricks = [];
    for (let i = 0; i < BRICK_ROWS; i++) {
        for (let j = 0; j < BRICK_COLS; j++) {
            if (pattern[i][j] > 0) {
                bricks.push({
                    x: j * (brickWidth + BRICK_PADDING) + BRICK_PADDING,
                    y: i * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING + 50,
                    width: brickWidth,
                    height: BRICK_HEIGHT,
                    color: `hsl(${(i * 360) / BRICK_ROWS}, 70%, 50%)`,
                    active: true,
                    strength: pattern[i][j]
                });
            }
        }
    }
}

// Handle keyboard input
function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') paddle.dx = -paddle.speed;
    if (e.key === 'ArrowRight') paddle.dx = paddle.speed;
    if (e.key === ' ' && activePowerups.laser) shootLaser();
}

function handleKeyUp(e) {
    if (e.key === 'ArrowLeft' && paddle.dx < 0) paddle.dx = 0;
    if (e.key === 'ArrowRight' && paddle.dx > 0) paddle.dx = 0;
}

// Update game state
function update() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Update paddle
    paddle.x += paddle.dx;
    paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, paddle.x));
    
    // Update balls
    balls.forEach(ball => {
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Wall collisions
        if (ball.x + ball.radius > CANVAS_WIDTH || ball.x - ball.radius < 0) {
            ball.dx = -ball.dx;
        }
        
        // Ceiling collision
        if (ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
        }
        
        // Floor collision
        if (ball.y + ball.radius > CANVAS_HEIGHT) {
            lives--;
            updateLives();
            if (lives <= 0) {
                gameOver();
            } else {
                resetBall(ball);
            }
        }
        
        // Paddle collision
        if (ball.y + ball.radius > paddle.y &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.width) {
            ball.dy = -Math.abs(ball.dy);
            // Add some randomness to ball direction
            ball.dx += (Math.random() - 0.5) * 2;
        }
        
        // Brick collisions
        bricks.forEach(brick => {
            if (brick.active && checkCollision(ball, brick)) {
                brick.strength--;
                if (brick.strength <= 0) {
                    brick.active = false;
                    score += 10;
                    updateScore();
                    
                    // Check if level is complete
                    if (bricks.every(b => !b.active)) {
                        nextLevel();
                    }
                    
                    // Chance for powerup
                    if (Math.random() < levelConfigs[currentLevel - 1].powerupChance) {
                        spawnPowerup(brick.x + brick.width / 2, brick.y + brick.height / 2);
                    }
                }
                ball.dy = -ball.dy;
            }
        });
    });
    
    // Update powerups
    powerups.forEach((powerup, index) => {
        powerup.y += POWERUP_SPEED;
        
        // Check if powerup hits paddle
        if (powerup.y + powerup.height > paddle.y &&
            powerup.x > paddle.x &&
            powerup.x < paddle.x + paddle.width) {
            activatePowerup(powerup.type);
            powerups.splice(index, 1);
        }
        
        // Remove powerup if it goes off screen
        if (powerup.y > CANVAS_HEIGHT) {
            powerups.splice(index, 1);
        }
    });
    
    // Draw everything
    draw();
}

// Draw game objects
function draw() {
    // Draw paddle
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Draw balls
    ctx.beginPath();
    balls.forEach(ball => {
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    });
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
    
    // Draw bricks
    bricks.forEach(brick => {
        if (brick.active) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            // Draw brick strength
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(brick.strength, brick.x + brick.width / 2, brick.y + brick.height / 2 + 4);
        }
    });
    
    // Draw powerups
    powerups.forEach(powerup => {
        ctx.fillStyle = powerup.color;
        ctx.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);
    });
    
    // Draw level
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Level ${currentLevel}`, 10, 30);
}

// Spawn a powerup
function spawnPowerup(x, y) {
    const types = ['laser', 'wide', 'multi'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = {
        laser: '#ff0000',
        wide: '#00ff00',
        multi: '#0000ff'
    };
    
    powerups.push({
        x: x - 10,
        y: y,
        width: 20,
        height: 20,
        type: type,
        color: colors[type]
    });
}

// Activate a powerup
function activatePowerup(type) {
    switch (type) {
        case 'laser':
            activePowerups.laser = true;
            document.getElementById('laserPowerup').classList.add('active');
            setTimeout(() => {
                activePowerups.laser = false;
                document.getElementById('laserPowerup').classList.remove('active');
            }, 10000);
            break;
        case 'wide':
            activePowerups.wide = true;
            paddle.width *= 1.5;
            document.getElementById('widePowerup').classList.add('active');
            setTimeout(() => {
                activePowerups.wide = false;
                paddle.width /= 1.5;
                document.getElementById('widePowerup').classList.remove('active');
            }, 10000);
            break;
        case 'multi':
            activePowerups.multi = true;
            const newBalls = balls.map(ball => ({
                ...ball,
                dx: ball.dx * (Math.random() > 0.5 ? 1 : -1)
            }));
            balls.push(...newBalls);
            document.getElementById('multiPowerup').classList.add('active');
            setTimeout(() => {
                activePowerups.multi = false;
                balls = balls.slice(0, 1);
                document.getElementById('multiPowerup').classList.remove('active');
            }, 10000);
            break;
    }
}

// Shoot laser
function shootLaser() {
    const laser = {
        x: paddle.x + paddle.width / 2,
        y: paddle.y,
        width: 4,
        height: 10,
        speed: 7
    };
    
    const laserInterval = setInterval(() => {
        laser.y -= laser.speed;
        
        // Check brick collisions
        bricks.forEach(brick => {
            if (brick.active &&
                laser.x > brick.x &&
                laser.x < brick.x + brick.width &&
                laser.y > brick.y &&
                laser.y < brick.y + brick.height) {
                brick.active = false;
                score += 10;
                updateScore();
                clearInterval(laserInterval);
            }
        });
        
        // Remove laser if it goes off screen
        if (laser.y < 0) {
            clearInterval(laserInterval);
        }
        
        // Draw laser
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
    }, 1000 / 60);
}

// Check collision between ball and brick
function checkCollision(ball, brick) {
    return ball.x + ball.radius > brick.x &&
           ball.x - ball.radius < brick.x + brick.width &&
           ball.y + ball.radius > brick.y &&
           ball.y - ball.radius < brick.y + brick.height;
}

// Reset ball position
function resetBall(ball) {
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT - PADDLE_HEIGHT - BALL_RADIUS - 10;
    ball.dx = levelConfigs[currentLevel - 1].ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -levelConfigs[currentLevel - 1].ballSpeed;
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
}

// Update lives display
function updateLives() {
    document.getElementById('lives').textContent = lives;
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
}

// Next level
function nextLevel() {
    currentLevel++;
    if (currentLevel > MAX_LEVELS) {
        gameWin();
        return;
    }
    
    // Reset game state for new level
    balls = [{
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - PADDLE_HEIGHT - BALL_RADIUS - 10,
        dx: levelConfigs[currentLevel - 1].ballSpeed,
        dy: -levelConfigs[currentLevel - 1].ballSpeed,
        radius: BALL_RADIUS
    }];
    
    paddle.speed = levelConfigs[currentLevel - 1].paddleSpeed;
    powerups = [];
    initBricks();
    
    // Show level transition
    showLevelTransition();
}

// Show level transition
function showLevelTransition() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${currentLevel}!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
    setTimeout(() => {
        update();
    }, 2000);
}

// Game win
function gameWin() {
    clearInterval(gameLoop);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Congratulations!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
    ctx.fillText('You Beat All Levels!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
}

// Start game
window.onload = init; 