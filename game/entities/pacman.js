import Entity from "./entity.js";
import { getInputDir, addPoints } from "../engine.js";
import { ctx, TILE, ACTUAL_TICK } from "../main.js";

const spritesheet = new Image();
spritesheet.src = "./img/sprites/PacMan.png";
spritesheet.onerror = () => console.error("Spritesheet de pacman no se pudo cargar.");
const SPRITE_SIZE = 16; // El tamaño real de cada sprite en la imagen

const DEATH_DURATION = 45; // ticks que dura la animación de muerte

export class Pacman extends Entity {
    constructor(x, y) {
        super(x, y);
        this.lastInputDir = { x: 0, y: 0 };
        this.deathTick = 0;   // tick en que empezó la muerte
        this.isDead = false;   // true cuando la animación terminó
        this.powerupTimer = 0; // Temporizador del pellet grande
    }

    update(map, fantasmas = []) {
        // Si está muriendo o ya murió, no hacer nada
        if (this.isDying || this.isDead) return;

        // Decrementar temporizador del powerup
        if (this.powerupTimer > 0) {
            this.powerupTimer--;
        }

        this.updateSlide();

        if (this.isSliding) {
            return;
        }

        const inputDir = getInputDir();
        if (!inputDir) {
            return;
        }

        if (inputDir !== this.lastInputDir && map.isWalkable(this.x + inputDir.x, this.y + inputDir.y)) {
            this.lastInputDir = inputDir;
        }

        // Si tiene el powerup activo, la velocidad aumenta (duración de slide de 300ms en vez de 500ms)
        const duration = this.powerupTimer > 0 ? 300 : 500;

        if (map.isWalkable(this.x + this.lastInputDir.x, this.y + this.lastInputDir.y)) {
            this.dir = this.lastInputDir;
            this.startSlide(this.x + this.lastInputDir.x, this.y + this.lastInputDir.y, duration);
        }

        const coin = map.getCoin(this.x, this.y);
        if (coin !== undefined) {
            if (coin.grande === true) {
                addPoints(50); // Pellets grandes otorgan 50 puntos
                this.powerupTimer = 360; // 6 segundos a 60 FPS
                // Asustar a todos los fantasmas que no estén muertos
                fantasmas.forEach(f => f.asustar());
            } else {
                addPoints(10);
            }
            map.removeCoin(this.x, this.y);
        }
    }

    render() {
        if (this.isDying || this.isDead) return; // no dibujar normalmente

        this.updateSlide();
        const currentFrame = Math.floor(ACTUAL_TICK / 2) % 8;

        if (!spritesheet.complete) return;

        ctx.drawImage(
            spritesheet,
            currentFrame * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE,
            this.rx * TILE, this.ry * TILE, TILE, TILE);
    }

    morir() {
        if (this.isDying) return; // evitar llamadas múltiples
        this.isDying = true;
        this.isSliding = false;
        this.deathTick = 0;
        console.log("Pacman murio");
    }

    /**
     * Actualiza y dibuja la animación de muerte.
     * Retorna true mientras la animación sigue, false cuando terminó.
     */
    updateDeath() {
        if (!this.isDying || this.isDead) return false;

        this.deathTick++;

        // Progreso de 0 a 1
        const progress = Math.min(1, this.deathTick / DEATH_DURATION);

        // Centro del pacman en píxeles
        const cx = this.rx * TILE + TILE / 2;
        const cy = this.ry * TILE + TILE / 2;
        const radius = TILE / 2;

        // La "boca" se abre desde abajo hasta que desaparece
        // startAngle va de (0.5π + pequeño) hasta 2π (desaparece)
        // endAngle va de (0.5π - pequeño) hasta 0
        const mouthAngle = progress * Math.PI; // 0 → π

        const startAngle = Math.PI * 0.5 + mouthAngle;
        const endAngle = Math.PI * 0.5 - mouthAngle;

        // Cuando mouthAngle llega a π, el arco se cierra y desaparece
        if (progress < 1) {
            ctx.fillStyle = "#FFD700";
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, endAngle, false);
            ctx.closePath();
            ctx.fill();
        }

        if (progress >= 1) {
            this.isDead = true;
            this.isDying = false;
            return false;
        }

        return true;
    }
}