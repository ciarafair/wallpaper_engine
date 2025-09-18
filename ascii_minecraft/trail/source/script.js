const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let fontSize = 15;
let fontFace = 'Minecraftia';
let activeFontFace = 'Enchantment Proper';
let fontColor = '#d640e7';
let bgFontColor = '#ff11ff31';
let backgroundColor = '#000000';
let bgChars = "abcdefghijklmnopqrstuvwxyz";
let activeCharacters = "abcdefghijklmnopqrstuvwxyz";
const trailColors = ['#d640e7'];

let asciiGrid = [];
let originalAsciiGrid = [];
let activeStates = [];
let activeColors = [];

function generateAsciiGrid() {
    const cols = Math.floor(canvas.width / fontSize);
    const rows = Math.floor(canvas.height / fontSize);
    for (let row = 0; row < rows; row++) {
        asciiGrid[row] = [];
        originalAsciiGrid[row] = [];
        activeStates[row] = [];
        activeColors[row] = [];
        for (let col = 0; col < cols; col++) {
            const char = bgChars[Math.floor(Math.random() * bgChars.length)];
            asciiGrid[row][col] = char;
            originalAsciiGrid[row][col] = char;
            activeStates[row][col] = false;
            activeColors[row][col] = bgFontColor;
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

    ctx.textBaseline = 'middle';

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * fontSize;
            const y = (row + 0.5) * fontSize;

            ctx.fillStyle = activeStates[row][col] ? activeColors[row][col] : bgFontColor;
            ctx.font = `${fontSize}px ${activeStates[row][col] ? activeFontFace : fontFace}`;

            const text = asciiGrid[row][col];
            const textWidth = ctx.measureText(text).width;
            const textX = x + (fontSize - textWidth) / 2;
            ctx.fillText(text, textX, y);
        }
    }
}

function updateActiveStates() {
    const cols = Math.floor(canvas.width / fontSize);
    const rows = Math.floor(canvas.height / fontSize);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (activeStates[row][col]) {
                asciiGrid[row][col] = activeCharacters[Math.floor(Math.random() * activeCharacters.length)];
                activeColors[row][col] = trailColors[Math.floor(Math.random() * trailColors.length)];
            } else {
                asciiGrid[row][col] = originalAsciiGrid[row][col];
                activeColors[row][col] = bgFontColor;
            }
        }
    }
}

function handleMousemove(event) {
    const cols = Math.floor(canvas.width / fontSize);
    const rows = Math.floor(canvas.height / fontSize);
    const col = Math.floor(event.clientX / fontSize);
    const row = Math.floor(event.clientY / fontSize);

    if (row < rows && col < cols && !activeStates[row][col]) {
        activeStates[row][col] = true;
        activeStates[row + 1][col + 1] = true;

        setTimeout(() => {
            activeStates[row][col] = false;
            activeStates[row + 1][col + 1] = false;
        }, 1000);
    }
}

canvas.addEventListener('mousemove', handleMousemove);
window.addEventListener('resize', fillCanvas);

fillCanvas();

function animate() {
    updateActiveStates();
    draw();
    requestAnimationFrame(animate);
}

animate();
