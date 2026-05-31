import { Pacman } from "./entities/pacman.js";
import { Fantasma } from "./entities/fantasma.js";
import { Map, coins } from "./map.js";
import { clearCanvas, getPlayerPoints, resetPoints, resetInput } from "./engine.js";
import { addTick } from "./main.js";

const canvas = document.getElementById("game-canvas");
const scoreEl = document.getElementById("game-score");

export class Game {
  constructor() {
    this.map = new Map();
    this.pacman = new Pacman(13, 20);
    this.fantasmas = [
      new Fantasma(12, 13, "red"),
      new Fantasma(13, 13, "blue"),
      new Fantasma(14, 13, "orange"),
      new Fantasma(13, 10, "yellow"),
    ];
    this.isStarted = false;
    this.isWon = false;

    // Inicializar el canvas como borroso
    canvas.classList.add("blurred");

    // Conectar botón de jugar/reintentar
    const playButton = document.getElementById("play-button");
    if (playButton) {
      playButton.addEventListener("click", () => {
        resetInput();
        if (this.pacman.isDead || this.isWon) {
          // Si estaba muerto o ganó, resetear y empezar
          this.reset();
          this.isStarted = true;
          const overlay = document.getElementById("game-overlay");
          if (overlay) overlay.classList.add("hidden");
          canvas.classList.remove("blurred");
        } else {
          // Si es el inicio, solo empezar
          this.isStarted = true;
          const overlay = document.getElementById("game-overlay");
          if (overlay) overlay.classList.add("hidden");
          canvas.classList.remove("blurred");
        }
      });
    }
  }

  reset() {
    resetInput();
    this.map = new Map();
    this.pacman = new Pacman(13, 20);
    this.fantasmas = [
      new Fantasma(12, 13, "red"),
      new Fantasma(13, 13, "blue"),
      new Fantasma(14, 13, "orange"),
      new Fantasma(13, 10, "yellow"),
    ];
    resetPoints();
    this.isStarted = false;
    this.isWon = false;
    canvas.classList.add("blurred");

    // Reiniciar estilos del overlay por si viene de una victoria
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

    // Si pacman ya terminó de morir, no actualizar nada
    if (this.pacman.isDead) {
      this.mostrarOverlayMuerte();
      return;
    }

    // Si está en animación de muerte, solo avanzar esa animación
    if (this.pacman.isDying) return;

    this.pacman.update(this.map, this.fantasmas);

    // Check win condition
    if (coins.length === 0) {
      this.isWon = true;
      this.mostrarOverlayVictoria();
      return;
    }

    this.fantasmas.forEach(f => f.update(this.map, this.pacman, this.fantasmas));
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
        overlayTitle.style.color = "#00ffaa"; // Neon green para victoria
        overlayTitle.style.textShadow = "0 0 15px rgba(0, 255, 170, 0.8)";
      }
      if (playButton) playButton.textContent = "PLAY AGAIN";
      overlay.classList.remove("hidden");
      canvas.classList.add("blurred");
    }
  }

  render() {
    // Actualizar marcador siempre
    scoreEl.textContent = getPlayerPoints();

    if (this.isWon) {
      this.mostrarOverlayVictoria();
      return;
    }

    // Si pacman ya terminó su animación, congelar todo y mostrar overlay
    if (this.pacman.isDead) {
      this.mostrarOverlayMuerte();
      return;
    }

    clearCanvas(canvas);

    // Siempre dibujar el mapa y las monedas
    this.map.dibujar();
    coins.forEach(coin => coin.render());

    if (this.pacman.isDying) {
      // Durante la muerte: solo animación de pacman, fantasmas estáticos
      this.pacman.updateDeath();
    } else {
      // Juego normal (o estado inicial pausado)
      this.pacman.render();
      this.fantasmas.forEach(f => f.render());
    }
  }
}