// runner game
const canvas = document.getElementById('runner');
const ctx = canvas.getContext('2d');
const groundY = 255;
let astronautY = groundY - 60;
let velocityY = 0;
const gravity = 0.6;
const jumpPower = -12;
const astronautGroundY = groundY - 60;
let isGrounded = true;
let alienSpeed = 5;
let aliens = [];
let nextAlienTime = 0;
let gameStarted = false;
let gameOver = false;
let score = 0;
let lastScoreTime = 0;
let lastFrameTime = 0;
let highScore = Number(localStorage.getItem('moonRunnerHighScore')) || 0;
let waitingToStart = true;
let backgroundOffset = 0;
const astronautImg = new Image();
astronautImg.src = './images/astronaut-sprites-canvas.png';
const spriteFrames = {
    idle: [
        [0, 0], [192, 0], [384, 0], [576, 0]
    ],
    walk: [
        [0, 256], [192, 256], [384, 256], [576, 256],
        [768, 256], [960, 256], [1152, 256]
    ],
    jump: [
        [0, 512], [192, 512], [384, 512], [576, 512]
    ],
    fall: [
        [0, 768]
    ],
    land: [
        [0, 1024], [192, 1024], [384, 1024], [576, 1024]
    ]
};
let astronautAnimation = 'walk';
let astronautFrame = 0;
let astronautFrameTimer = 0;
const astronautFrameWidth = 192;
const astronautFrameHeight = 256;
const astronautFrameDelay = 100;

// background design
function drawStars(){
    // random coordinate array (i used ai to get coords)
    const stars = [
        [45, 35], [120, 75], [205, 28], [290, 95],
        [370, 45], [455, 80], [535, 30], [625, 65],
        [710, 35], [765, 100], [160, 130], [570, 120]
    ]

    ctx.fillStyle = '#000000';

    stars.forEach(([x, y], i) => {
        const movingX = ((x - backgroundOffset * 0.2) % canvas.width + canvas.width) % canvas.width;
        ctx.beginPath();
        ctx.arc(movingX, y, i % 3 === 0 ? 2 : 1.3, 0, Math.PI * 2);
        ctx.fill();
    });
}

const craterSpacing = 180;
const craters = Array.from({ length: 20 }, (_, i) => ({
    x: i * craterSpacing + Math.random() * 100,
    width: 7 + Math.random() * 13,
    height: 2 + Math.random() * 4,
    y: groundY + 18 + Math.random() * 25
}));

function drawCraters(){
    ctx.fillStyle = '#F6EFE1';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, groundY, canvas.width, 2);

    const worldWidth = craters.length * craterSpacing;
    const offset = backgroundOffset % worldWidth;
    
    craters.forEach(crater => {
        let x = ((crater.x - offset) % worldWidth + worldWidth) % worldWidth;

        if(x > canvas.width + crater.width){
            x -= worldWidth;
        }

        if(x < -crater.width){
            x += worldWidth;
        }

        ctx.fillStyle = '#ded6c8';
        ctx.beginPath();
        ctx.ellipse(x, crater.y + 1, crater.width, crater.height+1, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#c9c0b2';
        ctx.beginPath();
        ctx.ellipse(x, crater.y, crater.width * 0.8, crater.height * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawAstronaut(x,y){
    if (!astronautImg.complete || !astronautImg.naturalWidth) return;

    const frames = spriteFrames[astronautAnimation];
    const frame = frames[Math.min(astronautFrame, frames.length - 1)];
    
    ctx.drawImage(
        astronautImg,
        frame[0],
        frame[1],
        astronautFrameWidth,
        astronautFrameHeight,
        x,
        y - 5,
        55,
        65
    );
}

function drawAlien(x,y){
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#50c136';
    ctx.beginPath();
    ctx.ellipse(20, 20, 17, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F6EFE1';

    ctx.beginPath();
    ctx.ellipse(14, 17, 4, 6, -0.2, 0, Math.PI * 2);
    ctx.ellipse(26, 17, 4, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#238227';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(12, 36);
    ctx.lineTo(8, 42);
    ctx.moveTo(28, 36);
    ctx.lineTo(32, 42);
    ctx.stroke();
    ctx.restore();
}

function spawnAlien(timestamp){
    if (timestamp < nextAlienTime) return;
    const lastAlien = aliens[aliens.length - 1];
    if (lastAlien && lastAlien.x > canvas.width - 220) return;

    aliens.push({
        x: canvas.width + 40 + Math.random() * 100,
        y: groundY - 40
    });

    nextAlienTime = timestamp + 1200 + Math.random() * 1000;
}

function checkCollision(alien){
    return(
        105 < (alien.x + 35) &&
        134 > alien.x &&
        astronautY + 5 < alien.y + 42 &&
        astronautY + 59 > alien.y
    );
}

function drawScene(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawStars();
    drawCraters();
    drawAstronaut(100, astronautY);
    aliens.forEach(alien => {
        drawAlien(alien.x, alien.y);
    });
}

// start game overlay
const gameOverlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const finalScore = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highscore');

function startGame(){
    astronautY = astronautGroundY;
    velocityY = 0;
    isGrounded = true;
    gameStarted = false;
    gameOver = false;
    score = 0;
    waitingToStart = true;
    backgroundOffset = 0;

    lastScoreTime = performance.now();
    lastFrameTime = performance.now();

    scoreDisplay.textContent = `Score: 0`;
    highScoreDisplay.textContent = `Best: ${highScore}`;

    aliens = [];
    nextAlienTime = performance.now() + 2000 + Math.random() * 1000;

    overlayTitle.textContent = '';
    overlayMessage.textContent = 'Press SPACE to start';
    finalScore.textContent = '';
    startBtn.style.display = 'none';
    gameOverlay.style.display = 'flex';
    gameOverlay.style.backdropFilter = 'blur(1px)';
}

startBtn.addEventListener('click', () => {
    startGame();
});

restartBtn.addEventListener('click', () => {
    startGame();
});

// movement controls
function jump(event){
    if(event.code != 'Space') return;

    event.preventDefault();

    if(waitingToStart){
        waitingToStart = false;
        gameStarted = true;
        gameOverlay.style.display = 'none';
        startBtn.style.display = 'block';
        lastFrameTime = performance.now();
        lastScoreTime = performance.now();
        return;
    }

    if(gameStarted && isGrounded){
        velocityY = jumpPower;
        isGrounded = false;

        astronautAnimation = 'jump';
        astronautFrame = 0;
        astronautFrameTimer = 0;
    }
}

document.addEventListener('keydown', jump);

function gameLoop(timestamp = performance.now()){
    if(!gameStarted){
        drawScene();
        lastFrameTime = timestamp;
        requestAnimationFrame(gameLoop);
        return;
    }

    if (gameOver){
        gameStarted = false;

        astronautY = astronautGroundY;
        velocityY = 0;
        isGrounded = true;
        astronautAnimation = 'idle';
        astronautFrame = 0;
        astronautFrameTimer = 0;

        overlayTitle.textContent = "Game Over";
        overlayMessage.textContent = "You lose, care to try again?";

        if(score > highScore){
            highScore = score;
            localStorage.setItem('moonRunnerHighScore', highScore);
        }

        highScoreDisplay.textContent = `Best: ${highScore}`;
        finalScore.textContent = `Score: ${score}`;
        startBtn.textContent = "Play Again";

        gameOverlay.style.display = 'flex';
        gameOverlay.style.backdropFilter = 'blur(5px)';
        requestAnimationFrame(gameLoop);
        return;
    }

    const deltaTime = Math.min((timestamp - lastFrameTime) / 16.67, 2);
    lastFrameTime = timestamp;

    astronautFrameTimer += deltaTime * 16.67;

    if (astronautFrameTimer >= astronautFrameDelay){
        astronautFrameTimer = 0;
        const frames = spriteFrames[astronautAnimation];

        if (astronautAnimation === 'jump'){
            if(astronautFrame < frames.length - 1){
                astronautFrame++;
            }
        } else if(astronautAnimation === 'land'){
            astronautFrame++;

            if (astronautFrame >= frames.length){
                astronautAnimation = 'walk';
                astronautFrame = 0;
            }
        } else{
            astronautFrame = (astronautFrame + 1) % frames.length;
        }
    }

    if (timestamp - lastScoreTime >= 50){
        score++;
        lastScoreTime = timestamp;
        scoreDisplay.textContent = `Score: ${score}`;
    }

    highScoreDisplay.textContent = `Best: ${highScore}`;

    velocityY += gravity * deltaTime;
    astronautY += velocityY * deltaTime;

    if(!isGrounded && velocityY > 0 && astronautAnimation === 'jump'){
        astronautAnimation = 'fall';
        astronautFrame = 0;
        astronautFrameTimer = 0;
    }

    if (astronautY >= astronautGroundY){
        astronautY = astronautGroundY;
        velocityY = 0;

        if(!isGrounded){
            isGrounded = true;
            astronautAnimation = 'land';
            astronautFrame = 0;
            astronautFrameTimer = 0;
        }
    }

    spawnAlien(timestamp);

    aliens.forEach(alien => {
        alien.x -= alienSpeed * deltaTime;

        if(checkCollision(alien)){
            gameOver = true;
        }
    });

    backgroundOffset += alienSpeed * deltaTime;

    drawScene();
    requestAnimationFrame(gameLoop);
}

gameLoop();