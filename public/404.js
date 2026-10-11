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
        ctx.beginPath();
        ctx.arc(x, y, i % 3 === 0 ? 2 : 1.3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawCraters(){
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();
    ctx.fillStyle = '#BFB29C';

    [[90, 278, 6], [260, 287, 4], [480, 274, 5], [680, 286, 7]].forEach(([x,y,r]) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    })
}

function drawAstronaut(x,y){
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#F6EFE1';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    
    ctx.fillRect(9,22,24,27);
    ctx.strokeRect(9,22,24,27);
    ctx.beginPath();
    ctx.arc(21, 13, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(23, 13, 7, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(12, 29);
    ctx.lineTo(3, 39);
    ctx.moveTo(30, 29);
    ctx.lineTo(38, 36);
    ctx.moveTo(15, 48);
    ctx.lineTo(12, 59);
    ctx.moveTo(28, 48);
    ctx.lineTo(33, 58);
    ctx.stroke();
    ctx.restore();
}

function drawAlien(x,y){
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(20, 20, 17, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F6EFE1';

    ctx.beginPath();
    ctx.ellipse(14, 17, 4, 6, -0.2, 0, Math.PI * 2);
    ctx.ellipse(26, 17, 4, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
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

    if (timestamp - lastScoreTime >= 50){
        score++;
        lastScoreTime = timestamp;
        scoreDisplay.textContent = `Score: ${score}`;
    }

    highScoreDisplay.textContent = `Best: ${highScore}`;

    velocityY += gravity * deltaTime;
    astronautY += velocityY * deltaTime;

    if (astronautY >= astronautGroundY){
        astronautY = astronautGroundY;
        velocityY = 0;
        isGrounded = true;
    }

    spawnAlien(timestamp);

    aliens.forEach(alien => {
        alien.x -= alienSpeed * deltaTime;
        
        if(checkCollision(alien)){
            gameOver = true;
        }
    });

    drawScene();
    requestAnimationFrame(gameLoop);
}

gameLoop();