"use strict";
(() => {
  // public/game/entities/entity.js
  var Entity = class {
    constructor(x, y, dir = { x: 0, y: 0 }) {
      this.x = x;
      this.y = y;
      this.dir = dir;
      this.rx = x;
      this.ry = y;
      this.isDying = false;
      this.randomInt = Math.floor(Math.random() * 1e3);
      this.isSliding = false;
      this.slideStart = 0;
      this.slideDuration = 500;
      this.slideFromX = x;
      this.slideFromY = y;
      this.slideToX = x;
      this.slideToY = y;
    }
    update() {
    }
    render() {
    }
    startSlide(nextX, nextY, duration = 500) {
      if (nextX === 0 && nextY === 13) {
        this.x = 25;
        this.rx = 25;
        return;
      } else if (nextX === 26 && nextY === 13) {
        this.x = 0;
        this.rx = 0;
        return;
      }
      this.isSliding = true;
      this.slideStart = performance.now();
      this.slideDuration = duration;
      this.slideFromX = this.rx;
      this.slideFromY = this.ry;
      this.slideToX = nextX;
      this.slideToY = nextY;
    }
    updateSlide(now = performance.now()) {
      if (!this.isSliding) {
        return;
      }
      const progress = Math.min(1, (now - this.slideStart) / this.slideDuration);
      this.rx = this.slideFromX + (this.slideToX - this.slideFromX) * progress;
      this.ry = this.slideFromY + (this.slideToY - this.slideFromY) * progress;
      if (progress === 1) {
        this.x = this.slideToX;
        this.y = this.slideToY;
        this.rx = this.x;
        this.ry = this.y;
        this.isSliding = false;
      }
    }
  };

  // public/game/entities/coin.js
  var SPRITE_SIZE = 16;
  var Coin = class extends Entity {
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
        currentFrame * SPRITE_SIZE,
        0,
        SPRITE_SIZE,
        SPRITE_SIZE,
        this.rx * TILE,
        this.ry * TILE,
        TILE,
        TILE
      );
    }
  };

  // public/game/map.js
  var spritesheet = new Image();
  spritesheet.src = "./img/sprites/Tileset.png";
  spritesheet.onerror = () => console.error("Spritesheet de tiles no se pudo cargar.");
  var MAP_DATA = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    // 0
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    // 1
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    // 2
    [1, 3, 1, 0, 0, 1, 2, 1, 0, 0, 0, 1, 2, 1, 2, 1, 0, 0, 0, 1, 2, 1, 0, 0, 1, 3, 1],
    // 3  ← power pellets
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    // 4
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    // 5
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    // 6
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    // 7
    [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
    // 8
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    // 9
    [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
    // 10
    [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
    // 11
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    // 12
    [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
    // 13 ← tunnel
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    // 14
    [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
    // 15
    [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
    // 16
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    // 17
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    // 18
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    // 19
    [1, 3, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 3, 1],
    // 20 ← power pellets
    [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
    // 21
    [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
    // 22
    [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
    // 23
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    // 24
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    // 25
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    // 26
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    // 27
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    // 28
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    // 29
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    // 30
  ];
  var coins = [];
  var Map = class {
    constructor() {
      this.grid = MAP_DATA.map((row) => [...row]);
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
                const dx = index % 3;
                const dy = Math.floor(index / 3);
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
      if (this.isWalkable(col, row - 1)) directions.push({ x: 0, y: -1 });
      if (this.isWalkable(col, row + 1)) directions.push({ x: 0, y: 1 });
      if (this.isWalkable(col - 1, row)) directions.push({ x: -1, y: 0 });
      if (this.isWalkable(col + 1, row)) directions.push({ x: 1, y: 0 });
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
      const visited = /* @__PURE__ */ new Set();
      visited.add(`${startCol},${startRow}`);
      while (queue.length > 0) {
        const { col, row, path } = queue.shift();
        if (col === endCol && row === endRow) {
          return path;
        }
        this.getAvailableDirections(col, row).forEach((dir) => {
          const { col: nextCol, row: nextRow } = this.getNextPosition(col, row, dir);
          const key = `${nextCol},${nextRow}`;
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({ col: nextCol, row: nextRow, path: [...path, dir] });
          }
        });
      }
      return null;
    }
    getCoin(x, y) {
      return coins.find((coin) => coin.x === x && coin.y === y);
    }
    removeCoin(x, y) {
      this.grid[y][x] = 0;
    }
  };

  // public/game/engine.js
  var lastTime = 0;
  var TICK_MS = 1e3 / 30;
  var accum = 0;
  var playerPoints = 0;
  function addPoints(points) {
    playerPoints += points;
  }
  function getPlayerPoints() {
    return playerPoints;
  }
  function resetPoints() {
    playerPoints = 0;
  }
  function startLoop(update, render) {
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
  function clearCanvas(canvas3) {
    ctx.clearRect(0, 0, canvas3.width, canvas3.height);
  }
  function drawTile(col, row, color) {
    ctx.fillStyle = color;
    ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
  }
  function drawSubTile(col, row, color, subCol, subRow) {
    ctx.fillStyle = color;
    const size = TILE / 3;
    ctx.fillRect(
      col * TILE + subCol * size,
      row * TILE + subRow * size,
      size,
      size
    );
  }
  var lastKey = null;
  document.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      lastKey = e.key;
      e.preventDefault();
    }
  });
  function getInputDir() {
    switch (lastKey) {
      case "ArrowUp":
        return { x: 0, y: -1 };
      case "ArrowDown":
        return { x: 0, y: 1 };
      case "ArrowLeft":
        return { x: -1, y: 0 };
      case "ArrowRight":
        return { x: 1, y: 0 };
      default:
        return null;
    }
  }

  // public/game/entities/pacman.js
  var spritesheet2 = new Image();
  spritesheet2.src = "./img/sprites/PacMan.png";
  spritesheet2.onerror = () => console.error("Spritesheet de pacman no se pudo cargar.");
  var SPRITE_SIZE2 = 16;
  var DEATH_DURATION = 45;
  var Pacman = class extends Entity {
    constructor(x, y) {
      super(x, y);
      this.lastInputDir = { x: 0, y: 0 };
      this.deathTick = 0;
      this.isDead = false;
      this.powerupTimer = 0;
    }
    update(map, fantasmas = []) {
      if (this.isDying || this.isDead) return;
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
      const duration = this.powerupTimer > 0 ? 300 : 500;
      if (map.isWalkable(this.x + this.lastInputDir.x, this.y + this.lastInputDir.y)) {
        this.dir = this.lastInputDir;
        this.startSlide(this.x + this.lastInputDir.x, this.y + this.lastInputDir.y, duration);
      }
      const coin = map.getCoin(this.x, this.y);
      if (coin !== void 0) {
        if (coin.grande === true) {
          addPoints(50);
          this.powerupTimer = 360;
          fantasmas.forEach((f) => f.asustar());
        } else {
          addPoints(10);
        }
        map.removeCoin(this.x, this.y);
      }
    }
    render() {
      if (this.isDying || this.isDead) return;
      this.updateSlide();
      const currentFrame = Math.floor(ACTUAL_TICK / 2) % 8;
      if (!spritesheet2.complete) return;
      ctx.drawImage(
        spritesheet2,
        currentFrame * SPRITE_SIZE2,
        0,
        SPRITE_SIZE2,
        SPRITE_SIZE2,
        this.rx * TILE,
        this.ry * TILE,
        TILE,
        TILE
      );
    }
    morir() {
      if (this.isDying) return;
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
      const progress = Math.min(1, this.deathTick / DEATH_DURATION);
      const cx = this.rx * TILE + TILE / 2;
      const cy = this.ry * TILE + TILE / 2;
      const radius = TILE / 2;
      const mouthAngle = progress * Math.PI;
      const startAngle = Math.PI * 0.5 + mouthAngle;
      const endAngle = Math.PI * 0.5 - mouthAngle;
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
  };

  // public/game/entities/fantasma.js
  var SPRITE_SIZE3 = 16;
  var Fantasma = class extends Entity {
    constructor(x, y, color) {
      super(x, y);
      this.spritesheet = new Image();
      this.spritesheet.onerror = () => console.error("Spritesheet de fantasma no se pudo cargar.");
      this.color = color;
      this.state = "normal";
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
      this.scaredTimer = 360;
    }
    manejarColision(pacman) {
      if (this.state === "scared") {
        this.state = "dead";
        addPoints(200);
        console.log("Pacman se comi\xF3 al fantasma asustado: " + this.color);
      } else if (this.state === "normal") {
        pacman.morir();
      }
    }
    regresarAlSpawn(map, directions) {
      const spawnCol = 13;
      const spawnRow = 13;
      if (this.x === spawnCol && this.y === spawnRow) {
        this.state = "normal";
        this.dir = { x: 0, y: -1 };
        this.startSlide(this.x, this.y - 1, 500);
        return;
      }
      const path = map.getPath(this.x, this.y, spawnCol, spawnRow);
      if (path && path.length > 0) {
        const nextDir = path[0];
        const nextPosition = map.getNextPosition(this.x, this.y, nextDir);
        if (map.isWalkable(nextPosition.col, nextPosition.row)) {
          this.dir = nextDir;
          this.startSlide(nextPosition.col, nextPosition.row, 200);
          return;
        }
      }
      this.moverAzar(directions);
    }
    moverAsustado(directions) {
      if (directions.length === 0) return;
      const validDirections = directions.filter((direction) => {
        const isReverse = direction.x === -this.dir.x && direction.y === -this.dir.y;
        return !isReverse || directions.length === 1;
      });
      const choices = validDirections.length > 0 ? validDirections : directions;
      const nextDir = choices[Math.floor(Math.random() * choices.length)];
      this.dir = nextDir;
      this.startSlide(this.x + nextDir.x, this.y + nextDir.y, 800);
    }
    update(map, pacman, fantasmas = []) {
      if (pacman.x === -1 && pacman.y === -1) {
        return;
      }
      if (this.state === "scared") {
        this.scaredTimer--;
        if (this.scaredTimer <= 0 || pacman.powerupTimer <= 0) {
          this.state = "normal";
        }
      }
      if (pacman.x === this.x && pacman.y === this.y) {
        this.manejarColision(pacman);
        return;
      }
      this.updateSlide();
      if (this.isSliding) {
        return;
      }
      if (pacman.x === this.x && pacman.y === this.y && (this.state === "scared" || this.state === "normal")) {
        this.manejarColision(pacman);
        return;
      }
      const directions = map.getAvailableDirections(this.x, this.y);
      if (this.state === "dead") {
        this.regresarAlSpawn(map, directions);
        return;
      }
      if (this.state === "scared") {
        this.moverAsustado(directions);
        return;
      }
      switch (this.color) {
        case "red":
          this.persiguePacman(map, directions, pacman);
          break;
        case "blue":
          this.perseguirInky(map, directions, pacman, fantasmas);
          break;
        case "yellow":
          const cycle = ACTUAL_TICK % 600;
          if (cycle < 400) {
            this.perseguirMachibuse(map, directions, pacman);
          } else {
            this.rodearObstaculos(map, directions);
          }
          break;
        case "orange":
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
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.filter = "grayscale(100%) brightness(1.5)";
        ctx.drawImage(
          activeSheet,
          currentFrame * SPRITE_SIZE3,
          0,
          SPRITE_SIZE3,
          SPRITE_SIZE3,
          this.rx * TILE,
          this.ry * TILE,
          TILE,
          TILE
        );
        ctx.restore();
      } else {
        ctx.drawImage(
          activeSheet,
          currentFrame * SPRITE_SIZE3,
          0,
          SPRITE_SIZE3,
          SPRITE_SIZE3,
          this.rx * TILE,
          this.ry * TILE,
          TILE,
          TILE
        );
      }
    }
    persiguePacman(map, directions, pacman) {
      const path = map.getPath(this.x, this.y, pacman.x, pacman.y);
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
     * Inky (azul): calcula un objetivo basado en Blinky y Pacman.
     * 1. Encuentra la casilla 2 espacios delante de Pacman.
     * 2. Traza un vector desde Blinky hasta esa casilla.
     * 3. Duplica ese vector para obtener el objetivo final.
     * 4. Busca camino hacia ese objetivo (o el walkable más cercano).
     */
    perseguirInky(map, directions, pacman, fantasmas) {
      const blinky = fantasmas.find((f) => f.color === "red");
      if (!blinky) {
        this.moverAzar(directions);
        return;
      }
      const aheadX = pacman.x + pacman.dir.x * 2;
      const aheadY = pacman.y + pacman.dir.y * 2;
      const vecX = aheadX - blinky.x;
      const vecY = aheadY - blinky.y;
      let targetX = aheadX + vecX;
      let targetY = aheadY + vecY;
      targetX = Math.max(0, Math.min(COLS - 1, targetX));
      targetY = Math.max(0, Math.min(ROWS - 1, targetY));
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
      let targetX = pacman.x + pacman.dir.x * 4;
      let targetY = pacman.y + pacman.dir.y * 4;
      targetX = Math.max(0, Math.min(COLS - 1, targetX));
      targetY = Math.max(0, Math.min(ROWS - 1, targetY));
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
        this.rodearObstaculos(map, directions);
      }
    }
    /**
     * Navegación siguiendo la pared izquierda (Left-Hand Rule)
     * lo cual causa que rodee obstáculos en sentido antihorario (counterclockwise).
     */
    rodearObstaculos(map, directions) {
      if (directions.length === 0) return;
      if (this.dir.x === 0 && this.dir.y === 0) {
        this.dir = directions[0];
      }
      const dirIzquierda = { x: this.dir.y, y: -this.dir.x };
      const dirRecto = { x: this.dir.x, y: this.dir.y };
      const dirDerecha = { x: -this.dir.y, y: this.dir.x };
      const dirAtras = { x: -this.dir.x, y: -this.dir.y };
      const opciones = [dirIzquierda, dirRecto, dirDerecha, dirAtras];
      for (const op of opciones) {
        const existe = directions.some((d) => d.x === op.x && d.y === op.y);
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
      const validDirections = directions.filter((direction) => {
        const isReverse = direction.x === -this.dir.x && direction.y === -this.dir.y;
        return !isReverse || directions.length === 1;
      });
      const choices = validDirections.length > 0 ? validDirections : directions;
      const nextDir = choices[Math.floor(Math.random() * choices.length)];
      this.dir = nextDir;
      this.startSlide(this.x + nextDir.x, this.y + nextDir.y, 500);
    }
  };

  // public/game/game.js
  var canvas = document.getElementById("game-canvas");
  var scoreEl = document.getElementById("game-score");
  var Game = class {
    constructor() {
      this.map = new Map();
      this.pacman = new Pacman(13, 20);
      this.fantasmas = [
        new Fantasma(12, 13, "red"),
        new Fantasma(13, 13, "blue"),
        new Fantasma(14, 13, "orange"),
        new Fantasma(13, 10, "yellow")
      ];
      this.isStarted = false;
      this.isWon = false;
      canvas.classList.add("blurred");
      const playButton = document.getElementById("play-button");
      if (playButton) {
        playButton.addEventListener("click", () => {
          if (this.pacman.isDead || this.isWon) {
            this.reset();
            this.isStarted = true;
            const overlay = document.getElementById("game-overlay");
            if (overlay) overlay.classList.add("hidden");
            canvas.classList.remove("blurred");
          } else {
            this.isStarted = true;
            const overlay = document.getElementById("game-overlay");
            if (overlay) overlay.classList.add("hidden");
            canvas.classList.remove("blurred");
          }
        });
      }
    }
    reset() {
      this.map = new Map();
      this.pacman = new Pacman(13, 20);
      this.fantasmas = [
        new Fantasma(12, 13, "red"),
        new Fantasma(13, 13, "blue"),
        new Fantasma(14, 13, "orange"),
        new Fantasma(13, 10, "yellow")
      ];
      resetPoints();
      this.isStarted = false;
      this.isWon = false;
      canvas.classList.add("blurred");
      const overlayTitle = document.getElementById("overlay-title");
      if (overlayTitle) {
        overlayTitle.textContent = "READY?";
        overlayTitle.style.color = "";
        overlayTitle.style.textShadow = "";
      }
    }
    update() {
      if (!this.isStarted) return;
      if (this.isWon) {
        this.mostrarOverlayVictoria();
        return;
      }
      if (this.pacman.isDead) {
        this.mostrarOverlayMuerte();
        return;
      }
      if (this.pacman.isDying) return;
      this.pacman.update(this.map, this.fantasmas);
      if (coins.length === 0) {
        this.isWon = true;
        this.mostrarOverlayVictoria();
        return;
      }
      this.fantasmas.forEach((f) => f.update(this.map, this.pacman, this.fantasmas));
      addTick();
    }
    mostrarOverlayMuerte() {
      const overlay = document.getElementById("game-overlay");
      const overlayTitle = document.getElementById("overlay-title");
      const playButton = document.getElementById("play-button");
      if (overlay && overlay.classList.contains("hidden")) {
        if (overlayTitle) {
          overlayTitle.textContent = "GAME OVER";
          overlayTitle.style.color = "";
          overlayTitle.style.textShadow = "";
        }
        if (playButton) playButton.textContent = "TRY AGAIN";
        overlay.classList.remove("hidden");
        canvas.classList.add("blurred");
      }
    }
    mostrarOverlayVictoria() {
      const overlay = document.getElementById("game-overlay");
      const overlayTitle = document.getElementById("overlay-title");
      const playButton = document.getElementById("play-button");
      if (overlay && overlay.classList.contains("hidden")) {
        if (overlayTitle) {
          overlayTitle.textContent = "YOU WIN!";
          overlayTitle.style.color = "#00ffaa";
          overlayTitle.style.textShadow = "0 0 15px rgba(0, 255, 170, 0.8)";
        }
        if (playButton) playButton.textContent = "PLAY AGAIN";
        overlay.classList.remove("hidden");
        canvas.classList.add("blurred");
      }
    }
    render() {
      scoreEl.textContent = getPlayerPoints();
      if (this.isWon) {
        this.mostrarOverlayVictoria();
        return;
      }
      if (this.pacman.isDead) {
        this.mostrarOverlayMuerte();
        return;
      }
      clearCanvas(canvas);
      this.map.dibujar();
      coins.forEach((coin) => coin.render());
      if (this.pacman.isDying) {
        this.pacman.updateDeath();
      } else {
        this.pacman.render();
        this.fantasmas.forEach((f) => f.render());
      }
    }
  };

  // public/game/main.js
  var canvas2 = document.getElementById("game-canvas");
  var ctx = canvas2.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  var ACTUAL_TICK = 0;
  var TILE = 16;
  var COLS = 27;
  var ROWS = 31;
  canvas2.width = COLS * TILE;
  canvas2.height = ROWS * TILE;
  function addTick() {
    ACTUAL_TICK++;
  }
  var game = new Game();
  startLoop(
    () => game.update(),
    () => game.render()
  );
})();
