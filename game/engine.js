import { ctx, TILE } from "./main.js";
import { Map } from "./map.js";

let lastTime = 0;
const TICK_MS = 1000 / 30; // ~16.67 ms → 60 ticks por segundo
let accum = 0;

let playerPoints = 0;

export function addPoints(points) {
    playerPoints += points;
}

export function getPlayerPoints() {
    return playerPoints;
}

export function resetPoints() {
    playerPoints = 0;
}

export function startLoop(update, render) {

    function frame(ts) {
        const dt = ts - lastTime;
        lastTime = ts;
        accum += dt;
        while (accum >= TICK_MS) {
            update();
            accum -= TICK_MS;
        }
        render();
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

// --- Dibujo ---

export function clearCanvas(canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawTile(col, row, color) {
    ctx.fillStyle = color;
    ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
}

export function drawSubTile(col, row, color, subCol, subRow) {
    ctx.fillStyle = color;
    const size = TILE / 3;
    ctx.fillRect(col * TILE + subCol * size,
        row * TILE + subRow * size,
        size, size);
}

export function drawCircle(col, row, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(col * TILE + TILE / 2, row * TILE + TILE / 2, radius, 0, Math.PI * 2);
    ctx.fill();
}

export function drawSprite(img, sx, sy, sw, sh, col, row) {
    ctx.drawImage(img, sx, sy, sw, sh, col * TILE, row * TILE, TILE, TILE);
}

// --- Input ---

let lastKey = null;

document.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        lastKey = e.key;
        e.preventDefault();
    }
});

export function getInputDir() {
    switch (lastKey) {
        case "ArrowUp": return { x: 0, y: -1 };
        case "ArrowDown": return { x: 0, y: 1 };
        case "ArrowLeft": return { x: -1, y: 0 };
        case "ArrowRight": return { x: 1, y: 0 };
        default: return null;
    }
}

function oppositeDir(dir) {
    return { x: -dir.x, y: -dir.y };
}

function manhattan(ax, ay, bx, by) {
    return Math.abs(ax - bx) + Math.abs(ay - by);
}