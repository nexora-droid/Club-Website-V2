// runner game
const canvas = document.getElementById('runner');
const ctx = canvas.getContext('2d');
const groundY = 255;

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

function drawScene(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawStars();
    drawCraters();
    drawAstronaut(100, groundY - 60);
    drawAlien(340, groundY - 40);
    drawAlien(590, groundY - 40);
}

drawScene();