import Entity from "./entity.js";
import { ctx, TILE, ACTUAL_TICK } from "../main.js";

const SPRITE_SIZE = 16;

export default class Coin extends Entity {
    constructor(x, y, grande = false) {
        super(x, y);
        this.grande = grande;
        this.spritesheet = new Image();
        this.spritesheet.onerror = () => console.error("Spritesheet de coin no se pudo cargar.");

        if (grande === true) {
            this.spritesheet.src = "./img/sprites/BigCoin.png";
        } else {
            this.spritesheet.src = "./img/sprites/Coin.png";
        }
    }

    render() {
        const currentFrame = Math.floor(ACTUAL_TICK / 2) % 8;

        if (!this.spritesheet.complete) return;

        ctx.drawImage(
            this.spritesheet,
            currentFrame * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE,
            this.rx * TILE, this.ry * TILE, TILE, TILE);
    }
}