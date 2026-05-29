import { ctx, COLS, ROWS } from "./main.js";
import { drawTile, drawSprite, drawSubTile } from "./engine.js";
import Coin from "./entities/coin.js";

const spritesheetTile = 16; // Tamaño de cada tile en la spritesheet
const spritesheet = new Image();
spritesheet.src = "./img/sprites/Tileset.png";
spritesheet.onerror = () => console.error("Spritesheet de tiles no se pudo cargar.");

const MAP_DATA = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 1
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1], // 2
    [1, 3, 1, 0, 0, 1, 2, 1, 0, 0, 0, 1, 2, 1, 2, 1, 0, 0, 0, 1, 2, 1, 0, 0, 1, 3, 1], // 3  ← power pellets
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1], // 4
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 5
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1], // 6
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1], // 7
    [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1], // 8
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1], // 9
    [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0], // 10
    [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0], // 11
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1], // 12
    [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0], // 13 ← tunnel
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1], // 14
    [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0], // 15
    [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0], // 16
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1], // 17
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 18
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1], // 19
    [1, 3, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 3, 1], // 20 ← power pellets
    [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1], // 21
    [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1], // 22
    [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1], // 23
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1], // 24
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1], // 25
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 26
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1], // 27
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1], // 28
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 29
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 30
];

export let coins = [];

export class Map {
    constructor() {
        this.grid = MAP_DATA.map(row => [...row]); // deep copy so the original stays clean
    }

    dibujar() {
        if (this.grid.length === 0) return;
        coins = [];

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (this.grid[row][col] === 1) {
                    drawTile(col, row, "white");

                    this.getTileNeighbors(col, row).split(",").forEach((neighbor, index) => {
                        if (neighbor === "1") {
                            const dx = (index % 3); // 0 - 2
                            const dy = Math.floor(index / 3); // 0, 1, or 2
                            drawSubTile(col, row, "blue", dx, dy);
                        }
                    });
                } else if (this.grid[row][col] === 2) {
                    coins.push(new Coin(col, row, false));
                } else if (this.grid[row][col] === 3) {
                    coins.push(new Coin(col, row, true));
                }
            }
        }
    }

    getTileNeighbors(col, row) {
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) {
                    neighbors.push(1);
                    continue;
                }
                const x = col + dx;
                const y = row + dy;
                if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
                    neighbors.push(this.grid[y][x]);
                } else {
                    neighbors.push(0);
                }
            }
        }
        return neighbors.join(",");
    }

    isWalkable(col, row) {
        //TUnel
        if (col === 0 && row === 13) {
            return true;
        } else if (col === 26 && row === 13) {
            return true;
        }

        if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
            return false;
        }
        return this.grid[row] && this.grid[row][col].length != 0 && this.grid[row][col] !== 1;
    }

    getAvailableDirections(col, row) {
        const directions = [];
        if (this.isWalkable(col, row - 1)) directions.push({ x: 0, y: -1 }); // Up
        if (this.isWalkable(col, row + 1)) directions.push({ x: 0, y: 1 }); // Down
        if (this.isWalkable(col - 1, row)) directions.push({ x: -1, y: 0 }); // Left
        if (this.isWalkable(col + 1, row)) directions.push({ x: 1, y: 0 }); // Right

        // Conectar el túnel horizontal de la fila 13 con el otro extremo del mapa.
        if (row === 13) {
            if (col === 0) {
                directions.push({ x: -1, y: 0 });
            }

            if (col === COLS - 1) {
                directions.push({ x: 1, y: 0 });
            }
        }

        return directions;
    }

    getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    getNextPosition(col, row, dir) {
        if (row === 13 && col === 0 && dir.x === -1 && dir.y === 0) {
            return { col: COLS - 1, row: 13 };
        }

        if (row === 13 && col === COLS - 1 && dir.x === 1 && dir.y === 0) {
            return { col: 0, row: 13 };
        }

        return { col: col + dir.x, row: row + dir.y };
    }

    getPath(startCol, startRow, endCol, endRow) {
        const queue = [{ col: startCol, row: startRow, path: [] }];
        const visited = new Set();
        visited.add(`${startCol},${startRow}`);

        while (queue.length > 0) {
            const { col, row, path } = queue.shift();

            if (col === endCol && row === endRow) {
                return path;
            }

            this.getAvailableDirections(col, row).forEach(dir => {
                const { col: nextCol, row: nextRow } = this.getNextPosition(col, row, dir);
                const key = `${nextCol},${nextRow}`;

                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({ col: nextCol, row: nextRow, path: [...path, dir] });
                }
            });
        }

        return null; // No path found
    };

    getCoin(x, y) {
        return coins.find(coin => coin.x === x && coin.y === y);
    }

    removeCoin(x, y) {
        this.grid[y][x] = 0;
    }
}


