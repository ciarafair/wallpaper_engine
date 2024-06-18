const canvas = document.getElementById('lavaLampCanvas');
const ctx = canvas.getContext('2d');

var blobCount = 50
var fontColour = '#ffffff'
var backgroundColour = '#000000'
var asciiChars = separateCharacters(' ' + ".:-=+*#%@");
var blobSize = 75;
var fontFace = 'monospace'

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.wallpaperPropertyListener = {
    applyUserProperties: function (properties) {
        if (properties.font) {
            fontFace = properties.font.value
        }
        if (properties.font_colour) {
            fontColour = properties.font_colour.value
        }
        if (properties.characters) {
            asciiChars = separateCharacters(' ' + properties.characters.value)
        }
        if (properties.bg_colour) {
            backgroundColour = properties.bg_colour.value
        }
        if (properties.count) {
            blobCount = properties.count.value
            var number = blobs.length
            if (number != 0) {
                if (number < properties.count.value) {
                    blobs = [];
                    generateBlobs(blobCount);
                    animate();
                }
                if (number > properties.count.value) {
                    blobs = [];
                    generateBlobs(blobCount);
                    animate();
                }
            }

        }
        if (properties.size) {
            blobSize = properties.size.value
            changeBlobSize(blobSize)
        }

    },
};

function separateCharacters(inputString) {
    return [...inputString];
}

class Blob {
    constructor(x, y, radius, color, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speedX = speedX;
        this.speedY = speedY;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off walls
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.speedX *= -1;
        }
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            this.speedY *= -1;
        }
    }
}

var blobs = [];

function generateBlobs(count) {
    for (let i = 0; i < count; i++) {
        let radius = blobSize + Math.random() * 20; // Blob size varies around BLOB_SIZE
        let x = Math.random() * (canvas.width - 2 * radius) + radius;
        let y = Math.random() * (canvas.height - 2 * radius) + radius;
        let color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.6)`;
        let speedX = (Math.random() - 0.5) * 2;
        let speedY = (Math.random() - 0.5) * 2;

        blobs.push(new Blob(x, y, radius, color, speedX, speedY));
    }
}

generateBlobs(blobCount);

function drawBackground() {
    ctx.fillStyle = backgroundColour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getAsciiChar(density) {
    density = Math.max(0, Math.min(density, 1)); // Ensure density is within range [0, 1]
    let index = Math.floor(density * (asciiChars.length - 1));
    return asciiChars[index];
}

function drawMetaballs() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    ctx.font = '10px ' + fontFace;
    ctx.fillStyle = fontColour;

    for (let y = 0; y < canvas.height; y += 10) {
        for (let x = 0; x < canvas.width; x += 10) {
            let sum = 0;
            let gradientEffect = 0;

            for (blob of blobs) {
                let dx = blob.x - x;
                let dy = blob.y - y;
                let distanceSquared = dx * dx + dy * dy;
                let influence = blob.radius * blob.radius / distanceSquared;
                sum += influence;

                // Calculate gradient effect based on distance from blob center
                if (influence > 0.01) {
                    let distanceFromCenter = Math.sqrt(distanceSquared);
                    gradientEffect += Math.max(0, blob.radius - distanceFromCenter) / blob.radius;
                }
            }

            if (sum >= 1) {
                let density = Math.min(1, sum);
                let char = getAsciiChar(density * gradientEffect);
                ctx.fillText(char, x, y);
            }
        }
    }
}

function changeBlobSize(newSize) {
    BLOB_SIZE = newSize;
    for (blob of blobs) {
        blob.setRadius(BLOB_SIZE + Math.random() * 20); // Vary blob size around BLOB_SIZE
    }
}

function regenerateBlobs(count) {
    blobs = [];
    generateBlobs(count);
    animate();
}

function animate() {
    drawMetaballs();
    for (blob of blobs) {
        blob.update();
    }
    requestAnimationFrame(animate);
}

animate();
