const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let fontSize = 15;
let fontFace = 'Minecraftia';
let fontColor = '#d640e7';
let bgFontColor = '#ff11ff31';
let backgroundColor = '#000000';
let bgChars = "abcdefghijklmnopqrstuvwxyz";
let activeCharacters = "abcdefghijklmnopqrstuvwxyz";
let changeInterval = 100;

let ripples = [];
let asciiGrid = [];
let originalAsciiGrid = [];
let lastUpdate = Date.now();

function generateAsciiGrid() {
    const cols = Math.floor(canvas.width / fontSize);
    const rows = Math.floor(canvas.height / fontSize);
    for (let row = 0; row < rows; row++) {
        asciiGrid[row] = [];
        originalAsciiGrid[row] = [];
        for (let col = 0; col < cols; col++) {
            const char = bgChars[Math.floor(Math.random() * bgChars.length)];
            asciiGrid[row][col] = char;
            originalAsciiGrid[row][col] = char;
        }
    }
}

window.wallpaperPropertyListener = {
    applyUserProperties: function (properties) {
        if (properties.font) {
            fontFace = properties.font.value;
            clearCanvas();
            fillCanvas();
        }
        if (properties.characters) {
            bgChars = properties.characters.value;
            clearCanvas();
            fillCanvas();
        }
        if (properties.font_size) {
            fontSize = Math.max(1, properties.font_size.value);
            clearCanvas();
            fillCanvas();
        }
    },
};

function draw() {
    drawBackground();
    drawAsciiGrid();
    animateRipples();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function fillCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    generateAsciiGrid();
    draw();
}

function drawBackground() {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function drawAsciiGrid() {
    const cols = Math.floor(canvas.width / fontSize);
    const rows = Math.floor(canvas.height / fontSize);
    const now = Date.now();

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * fontSize;
            const y = (row + 1) * fontSize;

            let rippleEffect = false;
            let innerRing = false;

            for (const ripple of ripples) {
                if (ripple.isActive && isWithinRipple(x, y, ripple)) {
                    const distance = Math.sqrt((ripple.x - x) ** 2 + (ripple.y - y) ** 2);
                    const innerRingRadius = ripple.radius * 0.5;

                    if (distance < innerRingRadius) {
                        innerRing = true;
                    } else {
                        rippleEffect = true;
                    }
                    const properties = getRippleProperties(x, y, ripple);
                    ctx.fillStyle = properties.color;
                    ctx.font = `${fontSize}px ${properties.fontFace}`;
                    break;
                }
            }

            if (!rippleEffect) {
                ctx.fillStyle = bgFontColor;
                ctx.font = `${fontSize}px ${fontFace}`;
                asciiGrid[row][col] = originalAsciiGrid[row][col];
            } else if (!innerRing) {
                if (now - lastUpdate > changeInterval) {
                    asciiGrid[row][col] = activeCharacters[Math.floor(Math.random() * activeCharacters.length)];
                }
            }

            ctx.fillText(asciiGrid[row][col], x, y);
        }
    }

    if (now - lastUpdate > changeInterval) {
        lastUpdate = now;
    }
}

function getRippleProperties(x, y, ripple) {
    const distance = Math.sqrt((ripple.x - x) ** 2 + (ripple.y - y) ** 2);
    const innerRingRadius = ripple.radius * 0.5;

    if (distance < innerRingRadius) {
        return { color: bgFontColor, fontFace: 'Minecraftia' };
    } else if (distance < ripple.radius) {
        return { color: fontColor, fontFace: 'Enchantment Proper' };
    } else {
        return { color: bgFontColor, fontFace: 'Minecraftia' };
    }
}

function createRipple(x, y) {
    return {
        x: x,
        y: y,
        radius: 0,
        speed: 2,
        isActive: true,
        decay: 0.98,
    };
}

function animateRipples() {
    ripples.forEach((ripple, index) => {
        if (ripple.isActive) {
            ripple.radius += ripple.speed;
            ripple.speed *= ripple.decay;

            if (ripple.speed < 0.1) {
                ripple.isActive = false;
                setTimeout(() => {
                    ripples.splice(index, 1);
                }, changeInterval);
            }
        }
    });
}

function startRipple(x, y) {
    let newRipple = createRipple(x, y);
    ripples.push(newRipple);
}

function isWithinRipple(charX, charY, ripple) {
    const dx = ripple.x - charX;
    const dy = ripple.y - charY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= ripple.radius;
}

canvas.addEventListener('click', function (event) {
    startRipple(event.offsetX, event.offsetY);
});

window.addEventListener('resize', fillCanvas);


fillCanvas();

function animate() {
    draw();
    requestAnimationFrame(animate);
}

animate();
