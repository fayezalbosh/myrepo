
function initialize_network(n_inputs, n_hidden, n_outputs) {
	var network = [];
	var hidden_layer = [];
	var output_layer = [];
	for (let i = 0; i < n_hidden; i++) {
		var weights = [];
		for (var j = 0; j < (n_inputs + 1); j++) {
			weights.push(Math.random());
		}
		hidden_layer.push({ 'weights': weights });
	}
	network.push(hidden_layer);

	for (let i = 0; i < n_outputs; i++) {
		var weights = [];
		for (var j = 0; j < (n_hidden + 1); j++) {
			weights.push(Math.random());
		}
		output_layer.push({ 'weights': weights });
	}
	network.push(output_layer);
	return network
}


//# Calculate neuron activation for an input
function activate(weights, inputs) {
	var activation = weights[0];
	for (let i = 1; i < (weights.length); i++)
		activation += weights[i] * inputs[i - 1]
	return activation
}


// Transfer neuron activation
function transfer(activation) {
	return 1.0 / (1.0 + Math.exp(-activation))
}


// Forward propagate input to a network output
function forward_propagate(network, row) {
	inputs = row;
	for (let layer in network) {
		new_inputs = [];
		for (let neuron in network[layer]) {
			let activation = activate(network[layer][neuron]['weights'], inputs)
			network[layer][neuron]['output'] = transfer(activation)
			new_inputs.push(network[layer][neuron]['output'])
		}
		inputs = new_inputs
	}
	return inputs
}


// Calculate the derivative of an neuron output
function transfer_derivative(output) {
	return output * (1.0 - output);
}

// Backpropagate error and store in neurons
function backward_propagate_error(network, expected) {
	for (let i = (network.length) - 1; i > 0; i--) {
		layer = network[i];
		errors =new Set();
		if (i != network.length - 1) {
			for (let j = 0; j < layer.length; j++) {
				error = 0.0;
				for (let neuron in network[i + 1])
					error += (neuron['weights'][j] * neuron['delta'])
				errors.add(error)
			}
		}
		else {
			for (let j = 0; j < layer.length; j++) {
				neuron = layer[j]
				errors.add(neuron['output'] - expected[j])

			}
			for (let j = 0; j < layer.length; j++) {
				neuron = layer[j]
				neuron['delta'] = errors[j] * transfer_derivative(neuron['output'])
			}

		}

	} //in reversed(range(len(network))):

}


// Update network weights with error
function update_weights(network, row, l_rate) {

	//for i in range(len(network)):
	for (let i = 0; i < (network.length); i++) {
		inputs = row;
        inputs.pop();
		if (i != 0) {
			//inputs = [neuron['output'] for neuron in network[i - 1]]	
			inputs = [];
			for (let neuron in network[i - 1]) {
				inputs.push(neuron['output']);
			}
		}

		for (let neuron in network[i]) {
			//for j in range(len(inputs)):
			for (let j = 0; j < inputs.length; j++)
			network[i][neuron]['weights'][j] -= l_rate * network[i][neuron]['delta'] * inputs[j]
			network[i][neuron]['weights'][0] -= l_rate * network[i][neuron]['delta']
		}
	}

}


// Train a network for a fixed number of epochs
function train_network(network, train, l_rate, n_epoch, n_outputs) {
	for (let epoch = 0; epoch < (n_epoch); epoch++) {
		var sum_error = 0;
		for (let row in train) {
			let outputs = forward_propagate(network, train[row])
			console.log(outputs)
			let expected = [];
			for (let i = 0; i < n_outputs; i++)
				expected.push(0);
			var c=train[row].length;
			expected[train[row][c-1]] = 1
			let sum_error = 0;
			for (let i = 0; i < (expected.length); i++)
				sum_error += (expected[i] - outputs[i]) ** 2;
			backward_propagate_error(network, expected);
			update_weights(network, train[row], l_rate);
		}
		console.log('>epoch=',epoch, 'lrate=',l_rate, 'error=', sum_error);
	}

}

// Test training backprop algorithm
//seed(1)
dataset = [[2.7810836, 2.550537003, 0],
[1.465489372, 2.362125076, 0],
[3.396561688, 4.400293529, 0],
[1.38807019, 1.850220317, 0],
[3.06407232, 3.005305973, 0],
[7.627531214, 2.759262235, 1],
[5.332441248, 2.088626775, 1],
[6.922596716, 1.77106367, 1],
[8.675418651, -0.242068655, 1],
[7.673756466, 3.508563011, 1]]
n_inputs = (dataset[0].length) - 1

//n_outputs = len(set([row[-1] for row in dataset]))
n_outputs=2;
network = initialize_network(n_inputs, 2, n_outputs)
for (var layer in network)
for (var neuron in network[layer])
	console.log(network[layer][neuron])
train_network(network, dataset, 0.5, 20, n_outputs)
