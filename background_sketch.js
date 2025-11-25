let layers = [];
let layerCount = 4;
let noiseOffset = 20;

// Adaptive grid density
let gridCols, gridRows;
let xStart, xEnd, yStart, yEnd;

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0, 'fixed');
    canvas.id('background-canvas');
    canvas.style('z-index', '-1');
    buildGrids();
}

function buildGrids() {
    layers = [];

    gridCols = floor(width / 60);
    gridRows = floor(height / 60);

    xStart = 0;
    xEnd = width;
    yStart = 0;
    yEnd = height;

    for (let layer = 0; layer < layerCount; layer++) {
        let grid = [];

        for (let x = 0; x < gridCols; x++) {
            for (let y = 0; y < gridRows; y++) {

                let px = map(x, 0, gridCols - 1, xStart, xEnd);
                let py = map(y, 0, gridRows - 1, yStart, yEnd);

                let cellW = (xEnd - xStart) / (gridCols - 1);
                let cellH = (yEnd - yStart) / (gridRows - 1);

                px += (layer * 0.5 * cellW);
                py += (layer * 0.5 * cellH);

                px = constrain(px, 0, width);
                py = constrain(py, 0, height);

                grid.push({ x: px, y: py });
            }
        }
        layers.push(grid);
    }
}

function draw() {
    // Recreate radial gradient: #444444 10% -> #000000 100%
    let gradient = drawingContext.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, max(width, height) / 2
    );

    // 10% mark is approximate in radial gradient logic for canvas, 
    // but we can try to match the visual feel.
    // CSS: radial-gradient(circle, #444444 10%, #000000 100%);
    // This means from 0% to 10% it's #444444, then interpolates to #000000 at 100%.
    gradient.addColorStop(0.0, '#1c1c1cff');
    gradient.addColorStop(0.4, '#141414ff');
    gradient.addColorStop(0.9, '#0c0c0cff');
    gradient.addColorStop(1.0, '#000000ff');

    drawingContext.fillStyle = gradient;
    rect(0, 0, width, height);

    noiseOffset += 0.01;

    let maxDist = dist(0, 0, width, height); // used for distance mapping

    for (let layer = 0; layer < layerCount; layer++) {
        let t = layer / (layerCount - 1);

        let sizeStrength = lerp(1.0, 0.3, t);
        let noiseStrength = lerp(5, 20, t);
        let baseSize = lerp(16, 8, t);

        noStroke();
        fill(196,182,178, 40 * layer);

        for (let p of layers[layer]) {

            let d = dist(mouseX, mouseY, p.x, p.y);

            // size based on distance
            let sizeFactor = map(d, 0, width * 0.16, 1.6, 0.6);
            sizeFactor = constrain(sizeFactor, 0.4, 5.0);
            let finalSize = baseSize * sizeFactor * sizeStrength;

            // ⬇️ NEW: distance-based random movement
            let moveFactor = map(d, 0, maxDist, 0, 100.0);
            moveFactor = constrain(moveFactor, 0, 100.0);

            // noise wobble
            let nx = noise(p.x * 0.01, p.y * 0.01, noiseOffset + layer * 100);
            let ny = noise(p.x * 0.01 + 200, p.y * 0.01 + 200, noiseOffset + layer * 100);

            let wobbleX = map(nx, 0, 1, -noiseStrength, noiseStrength) * moveFactor;
            let wobbleY = map(ny, 0, 1, -noiseStrength, noiseStrength) * moveFactor;

            ellipse(p.x + wobbleX, p.y + wobbleY, finalSize);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    buildGrids();
}




