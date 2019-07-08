class neuralNetwork {
  constructor(input_nodes, hidden_nodes, output_nodes) {
    this.input_nodes = input_nodes;
    this.hidden_nodes = hidden_nodes;
    this.output_nodes = output_nodes;

    // Initialize random weights
    this.input_weights = tf.randomNormal([this.input_nodes, this.hidden_nodes]);
    this.output_weights = tf.randomNormal([
      this.hidden_nodes,
      this.output_nodes
    ]);
    this.input_bias = tf.randomNormal([1,this.input_nodes])
    this.hidden_bias = tf.randomNormal([1,this.hidden_nodes])
  }
  predict(user_input) {
    let output;
    tf.tidy(() => {
      /* Takes a 1D array */
      let input_layer = tf.tensor(user_input, [1, this.input_nodes]).add(this.input_bias);
      let hidden_layer = input_layer.matMul(this.input_weights).add(this.hidden_bias);
      let output_layer = hidden_layer.matMul(this.output_weights).sigmoid();
      
      output = output_layer.dataSync();
    });
    return output;
  }
  clone() {
    let clonie = new neuralNetwork(
      this.input_nodes,
      this.hidden_nodes,
      this.output_nodes
    );
    clonie.dispose();
    clonie.input_weights = tf.clone(this.input_weights);
    clonie.output_weights = tf.clone(this.output_weights);
    clonie.input_bias = tf.clone(this.input_bias);
    clonie.hidden_bias = tf.clone(this.hidden_bias);


    return clonie;
  }
  dispose() {
    this.input_weights.dispose();
    this.output_weights.dispose();
    this.input_bias.dispose();
    this.hidden_bias.dispose();


  }
}
function random(l, h) {
  return Math.random() * (h - l) + l;
}
