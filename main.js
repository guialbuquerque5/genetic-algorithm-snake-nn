let fps = 5000;
const SQUARE_SIZE = 20;
const CANV_HEIGTH = 1000;
const CANV_WIDTH = 1000;
const CELLS_NUMBER = CANV_HEIGTH / SQUARE_SIZE;
console.log(CELLS_NUMBER);
const NWALL = CELLS_NUMBER * 4 + 4;

window.onload = function() {
  canv = this.document.getElementById("cv");
  ctx = canv.getContext("2d");
  var game = new Game();
  this.document.addEventListener("keydown", keypush);

  function keypush(evt) {
    switch (evt.keyCode) {
      case 37:
        game.snake.control(1);
        break;
      case 38:
        game.snake.control(2);
        break;
      case 39:
        game.snake.control(3);
        break;
      case 40:
        game.snake.control(0);
        break;
    }
  }

  setInterval(() => game.update(), 1000 / fps);
};
class Node {
  constructor(t) {
    this.x = t[0];
    this.y = t[1];
  }
  getPos() {
    return [this.x, this.y];
  }
  setPos(p) {
    this.x = p.x;
    this.y = p.y;
  }
  inc(vx, vy) {
    this.x += vx;
    this.y += vy;
  }
  colide(v) {
    if (v[0] == this.x && v[1] == this.y) {
      return true;
    } else {
      return false;
    }
  }
}

class Fruit {
  constructor() {
    this.pos = [
      Math.floor(Math.random() * (CELLS_NUMBER - 1)),
      Math.floor(Math.random() * (CELLS_NUMBER - 1))
    ];
  }
  draw() {
    ctx.fillStyle = "blue";
    ctx.fillRect(
      this.pos[0] * SQUARE_SIZE,
      this.pos[1] * SQUARE_SIZE,
      SQUARE_SIZE,
      SQUARE_SIZE
    );
  }
  getPos() {
    return this.pos;
  }
}

class Map{
  constructor(size){

  }
}

class Game {
  constructor() {

    this.population = new Population(150, 0.25);

    //this.fruits = [];

    this.gameOver = false;
    this.score = 0;
    
  }

  checkWallCollision(v) {
    let temp = this.v[0];
    let temp2 = this.v[1];
    let flag = false;
    for (let i = 0; i < this.wall.length; i++) {
      if (
        this.wall[i].getPos()[0] == temp &&
        this.wall[i].getPos()[1] == temp2
      ) {
        flag = true;
        break;
      }
    }
    return flag;
  }

  checkGameover() {
    if (this.population.checkGameover()) {
      this.restart();
    }
  }
  drawback() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANV_WIDTH, CANV_HEIGTH);
  }

  update() {

    this.population.move(this.wall);
    this.population.checkFruit();
    this.checkGameover();
    this.drawback();
    //this.drawFruits();
    this.population.draw();
  }
  restart() {
    this.population.naturalSelection();

    this.population.generate();
  }
}
