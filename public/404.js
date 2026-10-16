// runner game
const canvas = document.getElementById('runner');
const ctx = canvas.getContext('2d');
const groundY = 255;
let velocityY = 0;
const gravity = 0.6;
const jumpPower = -12;
let isGrounded = true;
let gameStarted = false;
let gameOver = false;
let score = 0;
let lastScoreTime = 0;
let lastFrameTime = 0;
let highScore = Number(localStorage.getItem('moonRunnerHighScore')) || 0;
let waitingToStart = true;
let backgroundOffset = 0;

// astronaut
let astronautY = groundY - 60;
const astronautGroundY = groundY - 60;
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

// alien
let alienSpeed = 5;
const minimumAlienGap = 300;
const minimumSpawnDelay = 700;
const maximumSpawnDelay = 2300;
let aliens = [];
let nextAlienTime = 0;
const alienImg = new Image();
alienImg.src = './images/alien-sprites.png';
const alienSprite = {
    sourceX: 180,
    sourceY: 155,
    sourceWidth: 210,
    sourceHeight: 290,
    drawWidth: 48,
    drawHeight: 66
};
let projectiles = [];
let nextShotTime = 0;
const projectileSpeed = 8;
const projectileCooldownMin = 1400;
const projectileCooldownMax = 2200;
let shootingAlien = null;
let shootingUntil = 0;
const alienNormalSprite = {
    sourceX: 180,
    sourceY: 155,
    sourceWidth: 210,
    sourceHeight: 290
}
const alienShootingSprite = {
    sourceX: 760,
    sourceY: 145,
    sourceWidth: 300,
    sourceHeight: 310
}

// sheild
let isBlocking = false;
let shieldKeyDown = false;
let shieldFlashUntil = 0;
const shieldX = 151;
const shieldWidth = 28;
const shieldHeight = 72;

const shieldImage = new Image();
shieldImage.src = './images/shield-sprite.png';

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

// astronaut sprite
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

// alien
function drawAlien(alien){
    if(!alienImg.complete || !alienImg.naturalWidth) return;

    const sprite = alien.isShooting ? alienShootingSprite : alienNormalSprite;

    ctx.drawImage(
        alienImg,
        sprite.sourceX,
        sprite.sourceY,
        sprite.sourceWidth,
        sprite.sourceHeight,
        alien.x,
        alien.y - alienSprite.drawHeight,
        alienSprite.drawWidth,
        alienSprite.drawHeight
    );
}

function spawnAlien(timestamp){
    if (timestamp < nextAlienTime) return;
    const lastAlien = aliens[aliens.length - 1];

    if (lastAlien && lastAlien.x > canvas.width - minimumAlienGap){
        nextAlienTime = timestamp + 120;
        return;
    }

    aliens.push({
        x: canvas.width + 40 + Math.random() * 100,
        y: groundY,
        isShooting: false,
        shootUntil: 0
    });

    const randomDelay = minimumSpawnDelay + Math.random() * (maximumSpawnDelay - minimumSpawnDelay);

    nextAlienTime = timestamp + randomDelay;
}

// collision death
function checkCollision(alien){
    const alienX = alien.x + 8;
    const alienY = alien.y - 58;
    const alienWidth = 32;
    const alienHeight = 48;

    return(
        105 < alienX + alienWidth &&
        134 > alienX &&
        astronautY + 8 < alienY + alienHeight &&
        astronautY + 58 > alienY
    );
}

// projectile shooting
function alienShoot(timestamp){
    if(timestamp < nextShotTime) return;
    if(projectiles.length > 0) return;

    const aliensAhead = aliens.filter(alien => alien.x > 134).sort((a,b) => a.x - b.x);
    const closestAlien = aliensAhead[0];

    if(!closestAlien) return;

    closestAlien.isShooting = true;
    closestAlien.shootUntil = timestamp + 350;

    shootingAlien = closestAlien;
    shootingUntil = timestamp + 350;

    projectiles.push({
        x: closestAlien.x - 30,
        y: closestAlien.y - 34,
        width: 32,
        height: 7
    });

    nextShotTime = timestamp + projectileCooldownMin + Math.random() * (projectileCooldownMax - projectileCooldownMin);
}

function updateProjectiles(deltaTime){
    const currentShieldY = astronautGroundY - 4;

    projectiles.forEach(projectile => {
        projectile.x -= projectileSpeed * deltaTime;

        const hitsShield =
            isBlocking &&
            projectile.x < shieldX + shieldWidth &&
            projectile.x + projectile.width > shieldX &&
            projectile.y < currentShieldY + shieldHeight &&
            projectile.y + projectile.height > currentShieldY;

        if (hitsShield){
            projectile.blocked = true;
            shieldFlashUntil = performance.now() + 300;
            return;
        }

        const hitsAstronaut = 
            projectile.x < 134 &&
            projectile.x + projectile.width > 105 &&
            projectile.y < astronautY + 58 &&
            projectile.y + projectile.height > astronautY + 8;

        if(hitsAstronaut){
            gameOver = true;
        }
    });

    projectiles = projectiles.filter(projectile =>
        !projectile.blocked &&
        projectile.x + projectile.width > 0
    );
}

function drawProjectile(projectile){
    ctx.fillStyle = "#3cb964";
    ctx.fillRect(
        projectile.x,
        projectile.y,
        projectile.width,
        projectile.height
    );

    ctx.fillStyle = "#56fa77";
    ctx.fillRect(
        projectile.x + 2,
        projectile.y + 1,
        projectile.width - 4,
        2
    );
}

// shield draw
function drawShield(){
    const now = performance.now();
    const shieldIsFlashing = now < shieldFlashUntil;

    if(!isBlocking) return;
    if(!shieldImage.complete || !shieldImage.naturalWidth) return;

    const frameX = shieldIsFlashing ? 256 : 0;

    ctx.drawImage(
        shieldImage,
        frameX,
        0,
        256,
        512,
        shieldX,
        astronautY - 4,
        shieldWidth,
        shieldHeight
    );
}

// draw all
function drawScene(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawStars();
    drawCraters();
    drawAstronaut(100, astronautY);
    drawShield();
    aliens.forEach(alien => {
        drawAlien(alien);
    });

    projectiles.forEach(projectile => {
        drawProjectile(projectile);
    })
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

// game starting function
function startGame(){
    astronautY = astronautGroundY;
    velocityY = 0;
    isGrounded = true;
    gameStarted = false;
    gameOver = false;
    score = 0;
    waitingToStart = true;
    astronautAnimation = 'idle';
    astronautFrame = 0;
    astronautFrameTimer = 0;
    backgroundOffset = 0;

    lastScoreTime = performance.now();
    lastFrameTime = performance.now();

    scoreDisplay.textContent = `Score: 0`;
    highScoreDisplay.textContent = `Best: ${highScore}`;

    aliens = [];
    projectiles = [];
    isBlocking = false;
    shootingUntil = 0;
    shieldKeyDown = false;
    shieldFlashUntil = 0;
    shootingAlien = null;
    nextShotTime = performance.now() + 800;
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

        astronautAnimation = 'walk';
        astronautFrame = 0;
        astronautFrameTimer = 0;

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

// shield controls
document.addEventListener('keydown', event => {
    if(event.code === 'ShiftLeft' || event.code === 'ShiftRight'){
        shieldKeyDown = true;
        
        if(gameStarted && isGrounded){
            isBlocking = true;
        }
    }
});

document.addEventListener('keyup', event => {
    if(event.code === 'ShiftLeft' || event.code === 'ShiftRight'){
        shieldKeyDown = false;
        isBlocking = false;
        shieldFlashUntil = 0;
    }
});

// main loop
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

    isBlocking = shieldKeyDown && isGrounded;

    aliens.forEach(alien => {
        if(alien.isShooting && timestamp >= alien.shootUntil){
            alien.isShooting = false;
        }
    })

    spawnAlien(timestamp);

    aliens.forEach(alien => {
        alien.x -= alienSpeed * deltaTime;

        if(checkCollision(alien)){
            gameOver = true;
        }
    });

    alienShoot(timestamp);
    updateProjectiles(deltaTime);

    aliens = aliens.filter(alien => alien.x > -alienSprite.drawWidth);

    backgroundOffset += alienSpeed * deltaTime;

    drawScene();
    requestAnimationFrame(gameLoop);
}

gameLoop();