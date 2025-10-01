const repoBase = "/Mini-Games/"

// --- Setup canvas ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 480;
canvas.height = 640;

// --- Load sprites ---
const spaceshipImg = new Image();
spaceshipImg.src = repoBase + "/assets/spaceship1.png";

const meteorImg = new Image();
meteorImg.src = repoBase + "/assets/meteor.png";

const bulletImg = new Image();
bulletImg.src = repoBase + "/assets/beam1.png";

const restartBtn = document.getElementById("restartBtn");

// --- Oggetti di gioco ---
const spaceship = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 70,
  width: 50,
  height: 50,
  speed: 1
};

// resize dimensioni
resizeCanvas();

// aggiorna se cambia dimensione finestra
window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
  canvas.width = window.innerWidth > 480 ? 480 : window.innerWidth - 10; // max 480px
  canvas.height = window.innerHeight - 4;
  // riposiziona navicella al centro se necessario
  spaceship.x = canvas.width / 2 - spaceship.width / 2;
  spaceship.y = canvas.height - 70;
}

const bullets = [];
const meteors = [];
let keys = {};
let score = 0;
let gameOver = false;
let highScore = 0;

// --- Input ---
document.addEventListener("keydown", e => { keys[e.key] = true; });
document.addEventListener("keyup", e => { keys[e.key] = false; });

// --- Pulsanti touch ---
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

let moveLeft = false;
let moveRight = false;

leftBtn.addEventListener("touchstart", () => moveLeft = true);
leftBtn.addEventListener("touchend", () => moveLeft = false);

rightBtn.addEventListener("touchstart", () => moveRight = true);
rightBtn.addEventListener("touchend", () => moveRight = false);

// --- Funzioni ---
function spawnMeteor() {
  const x = Math.random() * (canvas.width - 50);
  meteors.push({
    x,
    y: -50,
    width: 28,
    height: 70,
    speed: 2 + Math.random() * 2,
    hp: 3
  });
}

function shootBullet() {
  bullets.push({
    x: spaceship.x + spaceship.width / 2 - 5,
    y: spaceship.y,
    width: 10,
    height: 20,
    speed: 8
  });
}

// Spara automaticamente ogni 200ms
setInterval(() => {
  if (!gameOver) shootBullet();
}, 200);

// Genera meteoriti ogni 1.5 secondi
setInterval(() => {
  if (!gameOver) spawnMeteor();
}, 1500);

function update() {
  if (gameOver) return;

  // Movimento navicella
  if (keys["ArrowLeft"] && spaceship.x > 0) spaceship.x -= spaceship.speed;
  if (keys["ArrowRight"] && spaceship.x + spaceship.width < canvas.width) spaceship.x += spaceship.speed;

  // Movimento navicella (tastiera o touch)
  if ((keys["ArrowLeft"] || moveLeft) && spaceship.x > 0) {
    spaceship.x -= spaceship.speed;
  }
  if ((keys["ArrowRight"] || moveRight) && spaceship.x + spaceship.width < canvas.width) {
    spaceship.x += spaceship.speed;
  }


  // Aggiorna proiettili
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if (b.y < -b.height) bullets.splice(i, 1);
  });

  // Aggiorna meteoriti
  meteors.forEach((m, i) => {
    m.y += m.speed;
    if (m.y > canvas.height) {
      gameOver = false; // meteorite arriva in fondo
    }
  });

  // Collisioni proiettile → meteorite
  bullets.forEach((b, bi) => {
    meteors.forEach((m, mi) => {
      if (
        b.x < m.x + m.width &&
        b.x + b.width > m.x &&
        b.y < m.y + m.height &&
        b.y + b.height > m.y
      ) {
        m.hp -= 1;
        bullets.splice(bi, 1);
        if (m.hp <= 0) {
          meteors.splice(mi, 1);
          score += 10;
        }
      }
    });
  });

  // Collisione meteorite → navicella
  meteors.forEach((m) => {
    if (
      spaceship.x < m.x + m.width &&
      spaceship.x + spaceship.width > m.x &&
      spaceship.y < m.y + m.height &&
      spaceship.y + spaceship.height > m.y
    ) {
      gameOver = true;
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Disegna navicella
  ctx.drawImage(spaceshipImg, spaceship.x, spaceship.y, spaceship.width, spaceship.height);

  // Disegna proiettili
  bullets.forEach(b => {
    ctx.drawImage(bulletImg, b.x, b.y, b.width, b.height);
  });

  // Disegna meteoriti
  meteors.forEach(m => {
    ctx.drawImage(meteorImg, m.x, m.y, m.width, m.height);
  });

  // Punteggio
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("High Score: " + highScore, 10, 60);


  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);

    ctx.fillStyle = "yellow";
    ctx.font = "20px Arial";
    ctx.fillText("Final Score: " + score, canvas.width / 2 - 70, canvas.height / 2 + 70);

    // Mostra il bottone
    restartBtn.style.display = "block";
  } else {
    restartBtn.style.display = "none";
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  // aggiorna high score se necessario
  if (score > highScore) {
    highScore = score;
  }

  // reset stato
  spaceship.x = canvas.width / 2 - spaceship.width / 2;
  spaceship.y = canvas.height - 70;
  bullets.length = 0;
  meteors.length = 0;
  score = 0;
  gameOver = false;
}

// if (gameOver) {
//   ctx.fillStyle = "red";
//   ctx.font = "40px Arial";
//   ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);

//   ctx.fillStyle = "white";
//   ctx.font = "20px Arial";
//   ctx.fillText("Premi R per restart", canvas.width / 2 - 100, canvas.height / 2 + 40);

//   // Mostra il bottone
//   restartBtn.style.display = "block";
// } else {
//   restartBtn.style.display = "none";
// }

restartBtn.addEventListener("click", restartGame);

// document.addEventListener("keydown", e => {
//   keys[e.key] = true;
//   if (gameOver && e.key.toLowerCase() === "r") {
//     restartGame();
//   }
// });


gameLoop();
