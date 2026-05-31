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

export function resetInput() {
    lastKey = null;
}


// --- Touch Swipe Controls ---
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 30; // Min pixels to count as a swipe

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
}

function handleTouchEnd(e) {
    if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) > SWIPE_THRESHOLD) {
            if (absDx > absDy) {
                // Horizontal Swipe
                lastKey = dx > 0 ? "ArrowRight" : "ArrowLeft";
            } else {
                // Vertical Swipe
                lastKey = dy > 0 ? "ArrowDown" : "ArrowUp";
            }
        }
    }
}

function handleTouchMove(e) {
    // Prevent default scrolling behavior on the canvas
    if (e.cancelable) {
        e.preventDefault();
    }
}

// Attach swipe controls to canvas
const canvasEl = document.getElementById("game-canvas");
if (canvasEl) {
    canvasEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvasEl.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvasEl.addEventListener("touchend", handleTouchEnd, { passive: true });
}

// --- Virtual D-Pad Setup ---
function setupDpad() {
    const dpadUp = document.getElementById("dpad-up");
    const dpadDown = document.getElementById("dpad-down");
    const dpadLeft = document.getElementById("dpad-left");
    const dpadRight = document.getElementById("dpad-right");

    const setupBtn = (btn, key) => {
        if (!btn) return;
        
        const handlePress = (e) => {
            lastKey = key;
            btn.classList.add("active");
            if (e.cancelable) {
                e.preventDefault();
            }
        };
        const handleRelease = () => {
            btn.classList.remove("active");
        };

        // Touch Listeners
        btn.addEventListener("touchstart", handlePress, { passive: false });
        btn.addEventListener("touchend", handleRelease, { passive: true });
        
        // Mouse Listeners (for testing or backup)
        btn.addEventListener("mousedown", handlePress);
        btn.addEventListener("mouseup", handleRelease);
        btn.addEventListener("mouseleave", handleRelease);
    };

    setupBtn(dpadUp, "ArrowUp");
    setupBtn(dpadDown, "ArrowDown");
    setupBtn(dpadLeft, "ArrowLeft");
    setupBtn(dpadRight, "ArrowRight");
}

// Initialize D-pad setups
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupDpad);
} else {
    setupDpad();
}

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