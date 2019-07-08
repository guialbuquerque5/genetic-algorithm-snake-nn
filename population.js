class Population {
  constructor(s, r) {
    this.population = [];
    this.live;
    this.size = s;
    this.pool = [];
    this.generation = 1;
    this.mutationRate = r;
    this.bestFitness = 0;
    this.bestIndex = 0;
    this.bestSnakes = [];
    this.fitnessMedio = 0;
    this.live = true;
    this.maxFrames = 20000;
    //initializate random snakes
    this.initialize();
  }
  incMaxFrame() {
    this.maxFrames += 3000;
  }
  move(w) {
    this.population.forEach(s => {
      if (s.live) {
        s.move(w,0);
      }
    });

    this.bestSnakes.forEach(s => {
      if (s.live) {
        s.move(w,1);
      }
    });
  }
  draw() {
    if (this.bestSnakes.length > 0) this.bestSnakes[0].draw();
    /*
    this.population.forEach(s => {
      if (s.live) s.draw();
    });*/
  }
  checkLive() {
    let flag = false;
    for (let i = 0; i < this.population.length; i++) {
      if (this.population[i].live) {
        flag = true;
        break;
      }
    }
    for (let i = 0; i < this.bestSnakes.length; i++) {
      if (this.bestSnakes[i].live) {
        flag = true;
        break;
      }
    }
    return flag;
  }
  checkGameover() {
    this.population.forEach(s => {
      if (
        s.hp.x >= CELLS_NUMBER ||
        s.hp.y >= CELLS_NUMBER ||
        s.hp.x < 0 ||
        s.hp.y < 0 ||
        s.checkColision() ||
        s.frames > this.maxFrames || s.moved_without_eat > 220
      ) {
        s.live = false;
      }
    });

    this.bestSnakes.forEach(s => {
      if (
        s.hp.x >= CELLS_NUMBER ||
        s.hp.y >= CELLS_NUMBER ||
        s.hp.x < 0 ||
        s.hp.y < 0 ||
        s.checkColision() ||
        s.frames > this.maxFrames|| s.moved_without_eat > 220
      ) {
        s.live = false;
      }
    });
    return !this.checkLive();
  }
  initialize() {
    for (let i = 0; i < this.size; i++) {
      this.population.push(new Snake(new Brain(new neuralNetwork(21, 18, 3))));
    }
    this.bestSnakes.push(this.population.pop());
  }
  update(w) {
    this.move(w);
    this.checkFruit();
    this.checkGameover();
  }
  calcFitness() {
    let max = 0.0;
    let index = 0;
    let total = 0.0;
    for (let i = 0; i < this.population.length; i++) {
      let temp = this.population[i].calcFitness();
      total += temp;
      if (temp > max) {
        max = temp;
        index = i;
      }
    }
    this.bestIndex = index;
    
    return max;
  }
  naturalSelection() {
    this.pool = [];
    let max = this.calcFitness();

    //let fitMed = total / this.population.length;

    for (let i = 0; i < this.population.length; i++) {
      let n = Math.floor(sigx(this.population[i].getFitness(max)) * 100);
      for (let j = 0; j < n; j++) {
        this.pool.push(i);
      }
    }
  }
  generate() {
    let temp = this.population[0];
    this.population[0] = this.population[this.bestIndex];
    this.population[this.bestIndex] = temp;
    this.bestSnakes[0] = this.population[0].clone();

    this.bestSnakes[0].brain.get_weigth();
    //console.log(this.bestSnakes[0])
    //console.log(this)

    this.population[1] = new Snake(new Brain(new neuralNetwork(21, 18, 3)));


    if (this.pool.length > 1) {
      for (let i = 2; i < this.population.length; i++) {
        let a = Math.floor(random(0, this.pool.length - 1));
        let b = Math.floor(random(0, this.pool.length - 1));
        let partnerA = this.population[this.pool[a]];
        let partnerB = this.population[this.pool[b]];
        let child = partnerA.crossover(partnerB);
        let r = 0.5;
        if (Math.random() < r) {
          child.mutate(this.mutationRate);
        }
        child.mutate(this.mutationRate);
        this.population[i] = child;
      }

      this.generations++;
      this.incMaxFrame();
    }
  }
  checkFruit() {
    this.population.forEach(t => {
      t.checkFruit();
    });

    this.bestSnakes.forEach(t => {
      t.checkFruit();
    });
  }
}

function sigx(t) {
  return 1 / (1 + Math.exp(-1 * (t - 0.5)));
}

/*this.checkGameover();
this.snake.move(this.wall, this.fruit.getPos());
this.drawback();
this.fruit.draw();
this.snake.draw();
this.checkFruit(this.snake);*/
