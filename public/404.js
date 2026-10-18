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
const baseAlienSpeed = 5;
const maximumAlienSpeed = 8;
const alienSpeedIncrease = 0.5;
const difficultyScoreInterval = 200;

let alienSpeed = baseAlienSpeed;

const minimumAlienGap = 300;
const baseMinimumSpawnDelay = 700;
const baseMaximumSpawnDelay = 2300;
const minimumSpawnDelayLimit = 450;
const maximumSpawnDelayLimit = 1200;

let minimumSpawnDelay = baseMinimumSpawnDelay;
let maximumSpawnDelay = baseMaximumSpawnDelay;

let aliens = [];
let nextAlienTime = 0;

const alienImg = new Image();
alienImg.src = './images/alien-sprites.png';
const alienFrames = {
    walk: [
        [190, 175, 200, 280],
        [525, 175, 200, 280],
        [365, 495, 200, 285]
    ],
    shoot: [
        [815, 175, 230, 280],
        [1168, 175, 235, 280],
        [690, 495, 235, 285],
        [1065, 495, 225, 285]
    ]
};

const alienDrawWidth = 40;
const alienDrawHeight = 50;
const alienFrameDelay = 130;

// projectiles
let projectiles = [];
let shieldImpacts = [];
let nextShotTime = 0;
const projectileSpeed = 8;
const projectileCooldownMin = 1400;
const projectileCooldownMax = 2200;
let shootingAlien = null;
let shootingUntil = 0;

// shield
let isBlocking = false;
let shieldKeyDown = false;
let shieldFlashUntil = 0;
const shieldX = 151;
const shieldWidth = 24;
const shieldHeight = 62;
const normalShieldWidth = 24;
const normalShieldHeight = 62;

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

    const frames = alien.animation === 'shoot' ? alienFrames.shoot : alienFrames.walk;
    const frame = frames[alien.frameIndex % frames.length];

    const isShooting = alien.animation === 'shoot';
    const drawWidth = isShooting ? 48 : alienDrawWidth;
    const drawHeight = alienDrawHeight;
    const drawX = alien.x - (isShooting ? 8 : 2);

    ctx.drawImage(
        alienImg,
        frame[0],
        frame[1],
        frame[2],
        frame[3],
        drawX,
        alien.y - drawHeight,
        drawWidth,
        drawHeight
    );
}

function updateAlienAnimation(alien, deltaTime, timestamp){
    if(alien.animation === 'shoot' && timestamp >= alien.shootUntil){
        alien.animation = 'walk';
        alien.isShooting = false;
        alien.frameIndex = 0;
        alien.frameTimer = 0;
    }

    const frames = alien.animation === 'shoot' ? alienFrames.shoot : alienFrames.walk;
    const frameDelay = alien.animation === 'shoot' ? 85 : alienFrameDelay;

    alien.frameTimer += deltaTime * 16.67;

    if(alien.frameTimer >= frameDelay){
        alien.frameTimer = 0;
        alien.frameIndex++;

        if(alien.animation === 'shoot'){
            if(alien.frameIndex >= frames.length){
                alien.frameIndex = frames.length - 1;
            }
        } else{
            alien.frameIndex %= frames.length;
        }
    }
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
        shootUntil: 0,
        animation: 'walk',
        frameIndex: Math.floor(Math.random() * alienFrames.walk.length),
        frameTimer: 0
    });

    const randomDelay = minimumSpawnDelay + Math.random() * (maximumSpawnDelay - minimumSpawnDelay);

    nextAlienTime = timestamp + randomDelay;
}

// difficulty
function updateDifficulty(){
    const difficultyLevel = Math.floor(score / difficultyScoreInterval);

    alienSpeed = Math.min(
        baseAlienSpeed + difficultyLevel * alienSpeedIncrease,
        maximumAlienSpeed
    );

    minimumSpawnDelay = Math.max(
        baseMinimumSpawnDelay - difficultyLevel * 50,
        minimumSpawnDelayLimit
    );

    maximumSpawnDelay = Math.max(
        baseMaximumSpawnDelay - difficultyLevel * 100,
        maximumSpawnDelayLimit
    );
}

// collision death
function checkCollision(alien){
    const alienX = alien.x - 2;
    const alienY = alien.y - 50;
    const alienWidth = 38;
    const alienHeight = 46;

    const astronautLeft = 102;
    const astronautRight = 148;
    const astronautTop = astronautY + 4;
    const astronautBottom = astronautY + 60;

    return(
        astronautLeft < alienX + alienWidth &&
        astronautRight > alienX &&
        astronautTop < alienY + alienHeight &&
        astronautBottom > alienY
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
    closestAlien.shootUntil = timestamp + 450;
    closestAlien.animation = 'shoot';
    closestAlien.frameIndex = 0;
    closestAlien.frameTimer = 0;

    projectiles.push({
        x: closestAlien.x - 15, // gap from alien to projectile
        y: closestAlien.y - 24,
        width: 24, // projectile width
        height: 6 // projectile height
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
            shieldFlashUntil = performance.now() + 200;

            createShieldImpact(
                shieldX + shieldWidth / 2,
                projectile.y + projectile.height / 2
            );

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

// projectiles shield impact
function createShieldImpact(x, y){
    const shieldTop = astronautY - 4;
    const shieldBottom = Math.min(groundY - 3, shieldTop + shieldHeight);
    const impactX = shieldX + shieldWidth / 2;
    
    shieldImpacts.push({
        x: impactX,
        y,
        velocityX: 0,
        velocityY: 0,
        size: 12,
        life: 1,
        core: true
    });

    for (let i = 0; i < 7; i++){
        const progress = i / 10;
        const startY = shieldBottom - progress * (shieldBottom - shieldTop) + (Math.random() - 0.5) * 4;

        shieldImpacts.push({
            x: shieldX + 2 + Math.random() * 4,
            y: startY,
            velocityX: -0.2 - Math.random() * 0.8,
            velocityY: -0.5 - Math.random() * 1.2,
            size: 3,
            life: 1,
            core: false
        });
    }
}

function updateShieldImpacts(deltaTime){
    shieldImpacts.forEach(particle => {
        particle.x += particle.velocityX * deltaTime;
        particle.y += particle.velocityY * deltaTime;

        particle.velocityX *= 0.96;
        particle.velocityY *= 0.96;

        particle.life -= 0.06 * deltaTime;

        if (!particle.core && particle.y + particle.size >= groundY){
            particle.y = groundY - particle.size;
            particle.velocityY = 0;
        }
    });

    shieldImpacts = shieldImpacts.filter(particle => particle.life > 0);
}

function drawShieldImpacts(){
    shieldImpacts.forEach(particle => {
        ctx.save();

        ctx.globalAlpha = Math.max(0, particle.life);
        ctx.fillStyle = particle.core ? '#ffffff' : '#19c7e8';

        const size = Math.max(1, Math.ceil(particle.size));

        ctx.fillRect(
            Math.round(particle.x),
            Math.round(particle.y),
            size,
            size
        );

        ctx.restore();
    });
}

// shield draw
function drawShield(){
    const now = performance.now();
    const shieldIsFlashing = now < shieldFlashUntil;

    if(!isBlocking && !shieldIsFlashing) return;
    if(!shieldImage.complete || !shieldImage.naturalWidth) return;

    const frameX = shieldIsFlashing ? 256 : 0;

    const drawWidth = shieldWidth;
    const drawHeight = shieldHeight;
    const drawY = astronautY - 2;

    ctx.drawImage(
        shieldImage,
        frameX,
        0,
        256,
        512,
        shieldX - (drawWidth - shieldWidth) / 2,
        drawY,
        drawWidth,
        drawHeight
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
    });

    drawShieldImpacts();
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
    alienSpeed = baseAlienSpeed;
    minimumSpawnDelay = baseMinimumSpawnDelay;
    maximumSpawnDelay = baseMaximumSpawnDelay;
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
    shieldImpacts = [];
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

window.addEventListener('blur', () => {
    shieldKeyDown = false;
    isBlocking = false;
    shieldFlashUntil = 0;
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

    updateDifficulty();

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
        updateAlienAnimation(alien, deltaTime, timestamp);
        alien.x -= alienSpeed * deltaTime;

        if(checkCollision(alien)){
            gameOver = true;
        }
    });

    const shieldY = astronautY - 2;

    const alienTouchesShield = aliens.some(alien => {
        const alienIsShooting = alien.animation === 'shoot';
        const alienWidth = alienIsShooting ? 48 : alienDrawWidth;
        const alienLeft = alien.x - (alienIsShooting ? 8 : 2);
        const alienRight = alienLeft + alienDrawWidth;
        const alienTop = alien.y - alienDrawHeight;
        const alienBottom = alien.y;

        return(
            shieldX < alienRight &&
            shieldX + shieldWidth > alienLeft &&
            shieldY < alienBottom &&
            shieldY + shieldHeight > alienTop
        );
    });
    
    isBlocking = shieldKeyDown && isGrounded && !alienTouchesShield;

    alienShoot(timestamp);
    updateProjectiles(deltaTime);
    updateShieldImpacts(deltaTime);

    aliens = aliens.filter(alien => alien.x > -alienDrawWidth);

    backgroundOffset += alienSpeed * deltaTime;

    drawScene();
    requestAnimationFrame(gameLoop);
}

gameLoop();