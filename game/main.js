import { Game } from "./game.js";
import { startLoop } from "./engine.js";

const canvas = document.getElementById("game-canvas");
export const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

export let ACTUAL_TICK = 0;
export const TILE = 16;

export const COLS = 27;
export const ROWS = 31;

canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

export function addTick() {
    ACTUAL_TICK++;
}

const game = new Game();
startLoop(
    () => game.update(), 
    () => game.render()
);