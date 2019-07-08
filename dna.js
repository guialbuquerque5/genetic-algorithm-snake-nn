class Snake {
  constructor(b) {
    this.food = new Fruit();
    this.brain = b;
    this.vision = new Vision(80); // depth

    this.nodes = [];
    this.fitness = 0.0;
    this.frames = 0;
    this.score = 0;
    this.vel = [0, 1];
    this.size = 1;

    this.moved_without_eat = 0;

    this.hp = new Node([
      Math.floor(Math.random() * CELLS_NUMBER),
      Math.floor(Math.random() * CELLS_NUMBER)
    ]);
    this.live = true;
    this.addNode();
  }
  //método que incrementa o score
  checkFruit() {
    if (this.hp.x == this.food.pos[0] && this.hp.y == this.food.pos[1]) {
      this.addNode();
      this.food = new Fruit();
      this.score += 1;
      this.moved_without_eat = 0;
    }
  }
  draw() {
    //draw head

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      this.hp.x * SQUARE_SIZE,
      this.hp.y * SQUARE_SIZE,
      SQUARE_SIZE,
      SQUARE_SIZE
    );
    //draw nodes

    this.nodes.forEach(t => {
      ctx.fillStyle = "#555555";
      ctx.fillRect(
        t.getPos()[0] * SQUARE_SIZE,
        t.getPos()[1] * SQUARE_SIZE,
        SQUARE_SIZE - 2,
        SQUARE_SIZE - 2
      );
    });
    this.food.draw();
  }
  drawFruit() {
    this.food.draw();
  }
  convertResult(r) {
    let temp = this.getVelNumber();
    switch (r) {
      case 1: //FRENTE
        return temp;
        break;
      case 0: //ESQUERDA
        temp -= 1;
        if (temp == -1) temp = 3;
        return temp;
        break;
      case 2: //DIREITA
        temp += 1;
        temp %= 4;
        return temp;
        break;
    }
  }
  move(w, b) {

    this.control(
      this.convertResult(
        this.brain.think(
          this.vision.see(this.vel, this.hp.getPos(), w, this.food, this.nodes, b),b
        )
      )
    );

    if (this.nodes.length >= 1) this.nodes.pop();

    this.nodes.unshift(new Node(this.hp.getPos()));

    this.hp.inc(this.vel[0], this.vel[1]);
    this.frames++;
    this.moved_without_eat += 1;
  }
  getVelNumber() {
    let temp = this.vel;
    if (temp[0] == -1 && temp[1] == 0) {
      return 1;
    } else if (temp[0] == 0 && temp[1] == 1) {
      return 0;
    } else if (temp[0] == 1 && temp[1] == 0) {
      return 3;
    } else if (temp[0] == 0 && temp[1] == -1) {
      return 2;
    }
  }
  control(c) {
    switch (c) {
      case 0:
        this.vel[0] = 0;
        this.vel[1] = 1;
        break;
      case 1:
        this.vel[0] = -1;
        this.vel[1] = 0;
        break;
      case 2:
        this.vel[0] = 0;
        this.vel[1] = -1;
        break;
      case 3:
        this.vel[0] = 1;
        this.vel[1] = 0;
        break;
    }
  }
  addNode() {
    if (this.nodes.length >= 1) {
      this.nodes.push(new Node(this.nodes[this.size - 1].getPos()));
      this.size++;
    } else {
      let aux = this.getHp();
      aux[0] -= this.vel[0];
      aux[1] -= this.vel[1];
      this.nodes.push(new Node(aux));
    }
  }
  checkColision() {
    let temp = this.hp.x;
    let temp2 = this.hp.y;
    let flag = false;
    this.nodes.forEach(t => {
      if (t.x == temp && t.y == temp2) {
        flag = true;
      }
    });
    return flag;
  }
  calcFitness() {
    this.fitness = this.score * 100 + this.frames/200;
    return this.fitness;
  }
  crossover(partner) {
    return new Snake(this.brain.crossover(partner.brain));
  }
  mutate(r) {
    return this.brain.mutate(r);
  }
  getFitness(m) {
    return this.fitness / m;
  }
  getHp() {
    return this.hp.getPos();
  }
  clone() {
    return new Snake(this.brain.clone());
  }
}

class Vision {


  constructor(depth) {
    this.seq = [];
    this.directions = [[0, 1], [ -1, 1], [ -1, 0], [ -1, -1],[0, -1], [1, -1], [1, 0], [1, 1]];
    this.size = depth;
  }
  vision(mapa,headx,heady,snake_direction){

	
      let directions = [[0, 1], [ -1, 1], [ -1, 0], [ -1, -1],[0, -1], [1, -1], [1, 0], [1, 1]];
      let VISION_DIRECTIONS = 7
      let VISION_LENGTH = this.size
      let MAP_SIZE = CELLS_NUMBER
      let FOOD = 'f'
      let BODY = 'b'
      let vision_input = Array(21);
      let pos_init = (snake_direction + 5)%8;
      let temp_pos = pos_init;
      //{fruta, corpo, parede}*vision_directions
      //Para cada direção da visao:
      for ( let i = 0; i < VISION_DIRECTIONS; i++) {
         let x = headx + directions[temp_pos][0];
         let y = heady + directions[temp_pos][1];    
        vision_input[i * 3] = -1;
        vision_input[i * 3+1] = -1;
        vision_input[i * 3+2] = -1;
        //para profundidade
        let found = false;
        for ( let k = 2; k <= ++VISION_LENGTH && !found; k++) {
          
          if ((x >= 0 && x < MAP_SIZE) && (y >= 0 && y < MAP_SIZE)) {
            if (mapa[x][y] == FOOD) {
              vision_input[i * 3] = (3.0 /(k));
              found = true;
            }
            else if (mapa[x][y] == BODY) {
              vision_input[i * 3 + 1] = (2.0 / (k));
              found = true;
            }
          }
          else {
            
            vision_input[i * 3 + 2] = (2.0 / (k));
           
            found = true;
          }
    
          //positio ++
          x += directions[temp_pos][0];
          y += directions[temp_pos][1];
        }    temp_pos = (temp_pos+1)%8; 
      }     
      /*   
      console.log('vision_input: ')
      for(let i = 0; i < 21; i++){
        console.log(vision_input[i])
      }*/
    return vision_input;
  }

  buildMap( fruit_position, snake, snakeSize) {
    let MAP_SIZE = CELLS_NUMBER
    let m = Array(MAP_SIZE)
      for ( let i = 0; i < MAP_SIZE; i++) {
        m[i] = Array(MAP_SIZE);
        for(let j=0; j < MAP_SIZE; j++){
          m[i][j] = 0;
        }
      }
      m[fruit_position[0]][fruit_position[1]] = 'f';
    
      //head position
      m[snake[0][0]][snake[0][1]] = 'h';
      //body position
      for ( let i = 1; i < snakeSize; i++) {
        m[snake[i][0]][snake[i][1]] = 'b';
      }
      return m;
  }

  see(vel, pos, w, f, n,b) {
    let dir = vel;
    let sequence;
    if(dir[0] == 0 && dir[1] == 1){
      sequence = 0;
    }
    else if(dir[0] == -1 && dir[1] == 0){
      sequence = 2;
    }
    else if(dir[0] == 0 && dir[1] == -1){
      sequence = 4;
    }
    else if(dir[0] == 1 && dir[1] == 0){
      sequence = 6;
    }

    let snk = []
    snk.push([pos[0],pos[1]])
    for(let i=0; i< n.length; i++){
      snk.push(n[i].getPos());
    }

    let map = this.buildMap([f.pos[0],f.pos[1]],snk,snk.length);  

    let result = this.vision(map,pos[0],pos[1],sequence)
	return result
  }
}
  

class Brain {
  constructor(b) {
    this.net = b;
  }
  think(view,b) {

    //DIREITA = 2
    //FRENTE = 1
    //ESQUERDA = 0
    let max = -100.0;
    let index = 0;
    //RESULT IS RIGHT, FRONT OR LEFT;
const result = this.net.predict(view);

	if(b){
	//this.get_weigth();
	//console.log(view);
	//console.log(result);
	}

    for (let i = 0; i < 3; i++) {
      if (result[i] > max) {
        max = result[i];
        index = i;
      }
    }
    /*
    if(result[0] == result[2]){
      if(Math.random > 0.5)
        return 0;
      else  
        return 2;
    }*/
    return index;
  }
  clone() {
    return new Brain(this.net.clone());
  }
  kill() {}
  get_weigth(){
    //let myjson = JSON.stringify(this.net.input_weights.dataSync());
    let temp1 = this.net.input_weights.dataSync();
    

    console.log("float temp_inp[INPUT_SIZE*HIDDEN_SIZE] = {"+this.net.input_weights.dataSync().toString()+"};")//21x12
    console.log("float temp_out[OUT_SIZE*HIDDEN_SIZE] = {"+this.net.output_weights.dataSync().toString()+"};")//12x3
    console.log("float temp_inp_bias[INPUT_SIZE] = {"+this.net.input_bias.dataSync().toString()+"};")//1x21
    console.log("float temp_hid_bias[HIDDEN_SIZE] =  {"+this.net.hidden_bias.dataSync().toString()+"};")//1x12

    //this.net.input_weights.print()
  }
  mutate(r) {
    function fn(x) {
      if (Math.random() < r) {
        let offset = (rand_gaus() - 0.5) * 0.08;
        let newx = x + offset;
        return newx;
      }
      return x;
    }
    //this.get_weigth()
    let ih = this.net.input_weights.dataSync().map(fn);
    let ih_shape = this.net.input_weights.shape;
    this.net.input_weights.dispose();
    this.net.input_weights = tf.tensor(ih, ih_shape);

    let ho = this.net.output_weights.dataSync().map(fn);
    let ho_shape = this.net.output_weights.shape;
    this.net.output_weights.dispose();
    this.net.output_weights = tf.tensor(ho, ho_shape);

    let bias_in = this.net.input_bias.dataSync().map(fn);
    let in_shape = this.net.input_bias.shape;
    this.net.input_bias.dispose();
    this.net.input_bias = tf.tensor(bias_in, in_shape);

    let bias_out = this.net.hidden_bias.dataSync().map(fn);
    let out_shape = this.net.hidden_bias.shape;
    this.net.hidden_bias.dispose();
    this.net.hidden_bias = tf.tensor(bias_out, out_shape);

  }
  crossover(partnerBrain) {
    let a_in = this.net.input_weights.dataSync();
    let a_out = this.net.output_weights.dataSync();
    let a_bias_inp = this.net.input_bias.dataSync();
    let a_bias_hidden = this.net.hidden_bias.dataSync();
    let b_in = partnerBrain.net.input_weights.dataSync();
    let b_out = partnerBrain.net.output_weights.dataSync();
    let b_bias_inp = partnerBrain.net.input_bias.dataSync();
    let b_bias_hidden = partnerBrain.net.hidden_bias.dataSync();
    
    let c_in = [];
    let c_out = [];
    let c_bias_inp = [];
    let c_bias_hidden = []; 
    /*
    for (let i = 0; i < a_bias_inp.length; i++) {
      let r = Math.random();
      if (r > 0.5) {
        c_bias_inp.push(a_bias_inp[i]);
      } else {
        c_bias_inp.push(b_bias_inp[i]);
      }
    }
    for (let i = 0; i < a_bias_hidden.length; i++) {
      let r = Math.random();
      if (r > 0.5) {
        c_bias_hidden.push(a_bias_hidden[i]);
      } else {
        c_bias_hidden.push(b_bias_hidden[i]);
      }
    }
    
    for (let i = 0; i < a_in.length; i++) {
      let r = Math.random();
      if (r > 0.5) {
        c_in.push(a_in[i]);
      } else {
        c_in.push(b_in[i]);
      }
    }
    for (let i = 0; i < a_out.length; i++) {
      let r = Math.random();
      if (r > 0.5) {
        c_out.push(a_out[i]);
      } else {
        c_out.push(b_out[i]);
      }
    }
    /*
    /*TESTING RANDOM FOR EACH GENE */

   let mid = random(0, a_in.length);

    for (let i = 0; i < a_in.length; i++) {
      if (i < mid) {
        c_in.push(a_in[i]);
      } else {
        c_in.push(b_in[i]);
      }
    }
    mid = random(0, a_out.length);

    for (let i = 0; i < a_out.length; i++) {
      if (i < mid) {
        c_out.push(a_out[i]);
      } else {
        c_out.push(b_out[i]);
      }
    }
    mid = random(0, a_bias_inp.length);

   for (let i = 0; i < a_bias_inp.length; i++) {
    if (i < mid) {
      c_bias_inp.push(a_bias_inp[i]);
    } else {
      c_bias_inp.push(b_bias_inp[i]);
      }
    }
    mid = random(0, a_bias_hidden.length);

    for (let i = 0; i < a_bias_hidden.length; i++) {
      if (i < mid) {
        c_bias_hidden.push(a_bias_hidden[i]);
      } else {
        c_bias_hidden.push(b_bias_hidden[i]);
      }
    }
  

    let child = this.clone();
    let input_shape = this.net.input_weights.shape;
    let output_shape = this.net.output_weights.shape;
    let bias_in_shape = this.net.input_bias.shape;
    let bias_hidden_shape = this.net.hidden_bias.shape;
    child.net.dispose();

    child.net.input_weights = tf.tensor(c_in, input_shape);
    child.net.output_weights = tf.tensor(c_out, output_shape);
    child.net.input_bias = tf.tensor(c_bias_inp, bias_in_shape);
    child.net.hidden_bias = tf.tensor(c_bias_hidden, bias_hidden_shape);


    return child;
  }
}

function rand_gaus() {
  var u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return rand_gaus(); // resample between 0 and 1

  return num;
}

function sig(x) {
  return 1 / (1 + Math.exp(-1 * (x - 0.5)));
}
