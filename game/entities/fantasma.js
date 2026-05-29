import Entity from "./entity.js";
import { ctx, TILE, ACTUAL_TICK, COLS, ROWS } from "../main.js";
import { addPoints } from "../engine.js";

const SPRITE_SIZE = 16; // El tamaño real de cada sprite en la imagen

export class Fantasma extends Entity {
    constructor(x, y, color) {
        super(x, y);
        this.spritesheet = new Image();
        this.spritesheet.onerror = () => console.error("Spritesheet de fantasma no se pudo cargar.");
        this.color = color;

        // Propiedades de estado para pellets grandes (Power Pellets)
        this.state = "normal"; // "normal", "scared", "dead"
        this.scaredTimer = 0;
        this.scaredSpritesheet = new Image();
        this.scaredSpritesheet.src = "./img/sprites/greenGhost.png";
        this.scaredSpritesheet.onerror = () => console.error("Spritesheet de fantasma asustado no se pudo cargar.");

        switch (color) {
            case "red":
                this.spritesheet.src = "./img/sprites/redGhost.png";
                break;
            case "yellow":
                this.spritesheet.src = "./img/sprites/yellowGhost.png";
                break;
            case "blue":
                this.spritesheet.src = "./img/sprites/blueGhost.png";
                break;
            case "orange":
                this.spritesheet.src = "./img/sprites/orangeGhost.png";
                break;
            default:
                this.spritesheet.src = "./img/sprites/redGhost.png";
        }
    }

    asustar() {
        if (this.state === "dead") return;
        this.state = "scared";
        this.scaredTimer = 360; // 6 segundos a 60 FPS
    }

    manejarColision(pacman) {
        if (this.state === "scared") {
            this.state = "dead";
            addPoints(200); // 200 puntos por comer un fantasma asustado
            console.log("Pacman se comió al fantasma asustado: " + this.color);
        } else if (this.state === "normal") {
            pacman.morir();
        }
    }

    regresarAlSpawn(map, directions) {
        const spawnCol = 13;
        const spawnRow = 13;

        // Si llegó a la casa de regeneración, volver al estado normal
        if (this.x === spawnCol && this.y === spawnRow) {
            this.state = "normal";
            this.dir = { x: 0, y: -1 };
            this.startSlide(this.x, this.y - 1, 500); // Velocidad normal
            return;
        }

        // Buscar el camino más rápido utilizando BFS
        const path = map.getPath(this.x, this.y, spawnCol, spawnRow);
        if (path && path.length > 0) {
            const nextDir = path[0];
            const nextPosition = map.getNextPosition(this.x, this.y, nextDir);

            if (map.isWalkable(nextPosition.col, nextPosition.row)) {
                this.dir = nextDir;
                this.startSlide(nextPosition.col, nextPosition.row, 200); // Retorna super rápido (200ms por casilla)
                return;
            }
        }

        this.moverAzar(directions);
    }

    moverAsustado(directions) {
        if (directions.length === 0) return;

        // Elegir una dirección que no sea dar la vuelta en U inmediatamente
        const validDirections = directions.filter(direction => {
            const isReverse = direction.x === -this.dir.x && direction.y === -this.dir.y;
            return !isReverse || directions.length === 1;
        });

        const choices = validDirections.length > 0 ? validDirections : directions;
        const nextDir = choices[Math.floor(Math.random() * choices.length)];

        this.dir = nextDir;
        this.startSlide(this.x + nextDir.x, this.y + nextDir.y, 800); // Movimiento lento cuando está asustado (800ms)
    }

    update(map, pacman, fantasmas = []) {
        if (pacman.x === -1 && pacman.y === -1) {
            return;
        }

        // Controlar el temporizador de asustado
        if (this.state === "scared") {
            this.scaredTimer--;
            if (this.scaredTimer <= 0 || pacman.powerupTimer <= 0) {
                this.state = "normal";
            }
        }

        // Colisión lógica al inicio de la actualización
        if (pacman.x === this.x && pacman.y === this.y) {
            this.manejarColision(pacman);
            return;
        }

        this.updateSlide();

        if (this.isSliding) {
            return;
        }

        // Colisión lógica justo después de terminar un deslizamiento
        if (pacman.x === this.x && pacman.y === this.y &&
            (this.state === "scared" || this.state === "normal")) {
            this.manejarColision(pacman);
            return;
        }

        const directions = map.getAvailableDirections(this.x, this.y);

        // Estado 1: Si está muerto, regresar rápido al spawn
        if (this.state === "dead") {
            this.regresarAlSpawn(map, directions);
            return;
        }

        // Estado 2: Si está asustado, moverse aleatorio y lento
        if (this.state === "scared") {
            this.moverAsustado(directions);
            return;
        }

        // Estado 3: Comportamiento de IA clásica del fantasma
        switch (this.color) {
            case "red": // Fantasma rojo persigue a Pacman
                this.persiguePacman(map, directions, pacman);
                break;
            case "blue": // Fantasma azul (Inky) usa posición de Blinky + Pacman
                this.perseguirInky(map, directions, pacman, fantasmas);
                break;
            case "yellow": // Fantasma amarillo (Machibuse - Emboscada)
                const cycle = ACTUAL_TICK % 600;
                if (cycle < 400) {
                    this.perseguirMachibuse(map, directions, pacman);
                } else {
                    this.rodearObstaculos(map, directions);
                }
                break;
            case "orange": // Fantasma naranja se mueve aleatoriamente
                this.moverAzar(directions);
                break;
        }
    }

    render() {
        this.updateSlide();
        const currentFrame = Math.floor((ACTUAL_TICK + this.randomInt) / (this.randomInt % 4 + 1)) % 8;

        let activeSheet = this.spritesheet;
        if (this.state === "scared") {
            activeSheet = this.scaredSpritesheet;
        }

        if (!activeSheet.complete) return;

        if (this.state === "dead") {
            // Dibujar como un alma/ojos translúcidos en escala de grises
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.filter = "grayscale(100%) brightness(1.5)";
            ctx.drawImage(
                activeSheet,
                currentFrame * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE,
                this.rx * TILE, this.ry * TILE, TILE, TILE
            );
            ctx.restore();
        } else {
            ctx.drawImage(
                activeSheet,
                currentFrame * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE,
                this.rx * TILE, this.ry * TILE, TILE, TILE
            );
        }
    }

    persiguePacman(map, directions, pacman) {
        const path = map.getPath(this.x, this.y, pacman.x, pacman.y);

        if (path && path.length > 0) {
            const nextDir = path[0];  // Primera dirección del camino
            const nextPosition = map.getNextPosition(this.x, this.y, nextDir);

            if (!map.isWalkable(nextPosition.col, nextPosition.row)) {
                this.moverAzar(directions);
                return;
            }
            this.dir = nextDir;
            this.startSlide(nextPosition.col, nextPosition.row, 500);
        } else {
            // Si no hay camino, moverse al azar
            this.moverAzar(directions);
        }
    }

    /**
     * Inky (azul): calcula un objetivo basado en Blinky y Pacman.
     * 1. Encuentra la casilla 2 espacios delante de Pacman.
     * 2. Traza un vector desde Blinky hasta esa casilla.
     * 3. Duplica ese vector para obtener el objetivo final.
     * 4. Busca camino hacia ese objetivo (o el walkable más cercano).
     */
    perseguirInky(map, directions, pacman, fantasmas) {
        // Buscar a Blinky (fantasma rojo)
        const blinky = fantasmas.find(f => f.color === "red");
        if (!blinky) {
            this.moverAzar(directions);
            return;
        }

        // Casilla 2 adelante de Pacman en su dirección actual
        const aheadX = pacman.x + pacman.dir.x * 2;
        const aheadY = pacman.y + pacman.dir.y * 2;

        // Vector de Blinky → casilla adelante, luego duplicar
        const vecX = aheadX - blinky.x;
        const vecY = aheadY - blinky.y;

        // Objetivo = casilla adelante + vector (es decir, Blinky + 2*vector)
        let targetX = aheadX + vecX;
        let targetY = aheadY + vecY;

        // Clampear dentro del mapa
        targetX = Math.max(0, Math.min(COLS - 1, targetX));
        targetY = Math.max(0, Math.min(ROWS - 1, targetY));

        // Si el objetivo no es walkable, buscar la casilla walkable más cercana
        if (!map.isWalkable(targetX, targetY)) {
            let bestDist = Infinity;
            let bestX = targetX;
            let bestY = targetY;
            // Buscar en un radio creciente
            for (let r = 1; r <= 5; r++) {
                for (let dy = -r; dy <= r; dy++) {
                    for (let dx = -r; dx <= r; dx++) {
                        const cx = targetX + dx;
                        const cy = targetY + dy;
                        if (cx >= 0 && cx < COLS && cy >= 0 && cy < ROWS && map.isWalkable(cx, cy)) {
                            const dist = Math.abs(dx) + Math.abs(dy);
                            if (dist < bestDist) {
                                bestDist = dist;
                                bestX = cx;
                                bestY = cy;
                            }
                        }
                    }
                }
                if (bestDist < Infinity) break;
            }
            targetX = bestX;
            targetY = bestY;
        }

        // Buscar camino hacia el objetivo
        const path = map.getPath(this.x, this.y, targetX, targetY);

        if (path && path.length > 0) {
            const nextDir = path[0];
            const nextPosition = map.getNextPosition(this.x, this.y, nextDir);

            if (!map.isWalkable(nextPosition.col, nextPosition.row)) {
                this.moverAzar(directions);
                return;
            }
            this.dir = nextDir;
            this.startSlide(nextPosition.col, nextPosition.row, 500);
        } else {
            this.moverAzar(directions);
        }
    }

    /**
     * Machibuse (amarillo): embosca a Pacman apuntando 4 casillas adelante de su dirección.
     * Esto le ayuda a Blinky (red) a acorralar a Pacman desde dos lados opuestos.
     */
    perseguirMachibuse(map, directions, pacman) {
        // Apuntar 4 casillas adelante de la dirección actual de Pacman
        let targetX = pacman.x + pacman.dir.x * 4;
        let targetY = pacman.y + pacman.dir.y * 4;

        // Limitar las coordenadas dentro del mapa
        targetX = Math.max(0, Math.min(COLS - 1, targetX));
        targetY = Math.max(0, Math.min(ROWS - 1, targetY));

        // Si el objetivo no es caminable, buscar la casilla caminable más cercana
        if (!map.isWalkable(targetX, targetY)) {
            let bestDist = Infinity;
            let bestX = targetX;
            let bestY = targetY;
            for (let r = 1; r <= 5; r++) {
                for (let dy = -r; dy <= r; dy++) {
                    for (let dx = -r; dx <= r; dx++) {
                        const cx = targetX + dx;
                        const cy = targetY + dy;
                        if (cx >= 0 && cx < COLS && cy >= 0 && cy < ROWS && map.isWalkable(cx, cy)) {
                            const dist = Math.abs(dx) + Math.abs(dy);
                            if (dist < bestDist) {
                                bestDist = dist;
                                bestX = cx;
                                bestY = cy;
                            }
                        }
                    }
                }
                if (bestDist < Infinity) break;
            }
            targetX = bestX;
            targetY = bestY;
        }

        // Buscar camino al objetivo
        const path = map.getPath(this.x, this.y, targetX, targetY);

        if (path && path.length > 0) {
            const nextDir = path[0];
            const nextPosition = map.getNextPosition(this.x, this.y, nextDir);

            if (!map.isWalkable(nextPosition.col, nextPosition.row)) {
                this.moverAzar(directions);
                return;
            }
            this.dir = nextDir;
            this.startSlide(nextPosition.col, nextPosition.row, 500);
        } else {
            // Si no hay camino, rodear obstáculos en sentido antihorario
            this.rodearObstaculos(map, directions);
        }
    }

    /**
     * Navegación siguiendo la pared izquierda (Left-Hand Rule)
     * lo cual causa que rodee obstáculos en sentido antihorario (counterclockwise).
     */
    rodearObstaculos(map, directions) {
        if (directions.length === 0) return;

        // Inicializar dirección si está quieto
        if (this.dir.x === 0 && this.dir.y === 0) {
            this.dir = directions[0];
        }

        // Direcciones relativas para giro antihorario en pantalla (y va hacia abajo):
        // Giro de 90° CCW (izquierda): x' = y, y' = -x
        const dirIzquierda = { x: this.dir.y, y: -this.dir.x };
        const dirRecto = { x: this.dir.x, y: this.dir.y };
        const dirDerecha = { x: -this.dir.y, y: this.dir.x };
        const dirAtras = { x: -this.dir.x, y: -this.dir.y };

        const opciones = [dirIzquierda, dirRecto, dirDerecha, dirAtras];

        for (const op of opciones) {
            const existe = directions.some(d => d.x === op.x && d.y === op.y);
            if (existe) {
                const nextCol = this.x + op.x;
                const nextRow = this.y + op.y;
                if (map.isWalkable(nextCol, nextRow)) {
                    this.dir = op;
                    this.startSlide(nextCol, nextRow, 500);
                    return;
                }
            }
        }

        this.moverAzar(directions);
    }

    moverAzar(directions) {
        if (directions.length === 0) {
            return;
        }

        const validDirections = directions.filter(direction => {
            const isReverse = direction.x === -this.dir.x && direction.y === -this.dir.y;
            return !isReverse || directions.length === 1;
        });

        const choices = validDirections.length > 0 ? validDirections : directions;
        const nextDir = choices[Math.floor(Math.random() * choices.length)];

        this.dir = nextDir;
        this.startSlide(this.x + nextDir.x, this.y + nextDir.y, 500);
    }

}
