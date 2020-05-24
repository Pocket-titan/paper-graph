function Partition(node, complex) {
  this.nodes = [node];
  Node.call(this, 0, node.xPosition, node.yPosition, NodeType.PARTITION);
  this.xMin = node.xPosition;
  this.yMin = node.yPosition;
  this.xMax = node.xPosition;
  this.yMax = node.yPosition;
  if (complex) {
    this.totalMass = node.getMass();
    this.totalCharge = node.getCharge();
    this.addNode = this.addComplexNode;
  } else this.addNode = this.addSimpleNode;
}
Partition.prototype = {
  nodes: null,
  xMin: 0,
  yMin: 0,
  xMax: 0,
  yMax: 0,
  totalMass: 0,
  totalCharge: 0,
  getMass: function () {
    return this.totalMass;
  },
  getCharge: function () {
    return this.totalCharge;
  },
  addNode: null,
  addSimpleNode: function (node) {
    // find the center of mass in the partition
    this.xPosition = (this.xPosition * this.nodes.length + node.xPosition) / (this.nodes.length + 1);
    this.yPosition = (this.yPosition * this.nodes.length + node.yPosition) / (this.nodes.length + 1);
    if (node.xPosition < this.xMin) this.xMin = node.xPosition;
    else if (node.xPosition > this.xMax) this.xMax = node.xPosition;
    if (node.yPosition < this.yMin) this.yMin = node.yPosition;
    else if (node.yPosition > this.yMax) this.yMax = node.yPosition;
    this.nodes.push(node);
  },
  addComplexNode: function (node) {
    // find the center of mass in the partition
    this.xPosition =
      (this.xPosition * this.totalMass + node.xPosition * node.getMass()) / (this.totalMass + node.getMass());
    this.yPosition =
      (this.yPosition * this.totalMass + node.yPosition * node.getMass()) / (this.totalMass + node.getMass());
    if (node.xPosition < this.xMin) this.xMin = node.xPosition;
    else if (node.xPosition > this.xMax) this.xMax = node.xPosition;
    if (node.yPosition < this.yMin) this.yMin = node.yPosition;
    else if (node.yPosition > this.yMax) this.yMax = node.yPosition;
    this.totalMass += node.getMass();
    this.totalCharge += node.getCharge();
    this.nodes.push(node);
  },
};

const simpleLayout = function (this, nodes) {
  this.equilibrium = false;

  var i, j, k, node, otherNode, edge, curvature;
  var numberOfNodes = nodes.length;
  var numberOfStoppedNodes = 0;

  // set up partitions
  this.partitions = {}; // faster than Object.create(null) for some reason
  this.fuzzing = (this.fuzzing + 1) % 3;
  var key, otherKey, partition, otherPartition, xPosition, yPosition, size;
  size = this.partitionSize - this.fuzz + this.fuzzing * this.fuzz;
  i = numberOfNodes;
  while (i--) {
    node = nodes[i];
    // count the number of stopped nodes
    if (!node.moving || node.fixed) numberOfStoppedNodes++;
    xPosition = Math.floor(node.xPosition / size);
    yPosition = Math.floor(node.yPosition / size);
    key = xPosition.toString();
    key += '|';
    key += yPosition.toString();
    partition = this.partitions[key];
    if (!partition) {
      partition = new Partition(node, false);
      this.partitions[key] = partition;
    } else {
      partition.addNode(node);
    }
  }
  var keys = Object.keys(this.partitions);
  k = keys.length;
  // calculate the velocity of the partitions
  while (k--) {
    key = keys[k];
    partition = this.partitions[key];
    j = keys.length;
    while (j--) {
      otherKey = keys[j];
      if (key !== otherKey) {
        otherPartition = this.partitions[otherKey];
        partition.xVelocity += otherPartition.nodes.length * this.xSimpleRepelling(partition, otherPartition);
        partition.yVelocity += otherPartition.nodes.length * this.ySimpleRepelling(partition, otherPartition);
      }
    }
  }
  var energy = 0;
  k = keys.length;
  while (k--) {
    key = keys[k];
    partition = this.partitions[key];
    i = partition.nodes.length;
    while (i--) {
      node = partition.nodes[i];
      // add the long range effect from other partitions, somewhat weakened
      node.xVelocity += this.longRangeEffect * partition.xVelocity;
      node.yVelocity += this.longRangeEffect * partition.yVelocity;
      j = partition.nodes.length;
      while (j--) {
        if (i !== j) {
          otherNode = partition.nodes[j];
          // for nodes in the same partition add the repelling velocity
          node.xVelocity += this.xSimpleRepelling(node, otherNode);
          node.yVelocity += this.ySimpleRepelling(node, otherNode);
        }
      }
      // for edges apply bending force (straightens out edges)
      if (node.type === NodeType.EDGE && node.otherNode.visible && node.node.visible) {
        // update the control point
        node.controlPoint.xPosition = 2 * node.xPosition - node.node.xPosition / 2 - node.otherNode.xPosition / 2;
        node.controlPoint.yPosition = 2 * node.yPosition - node.node.yPosition / 2 - node.otherNode.yPosition / 2;
        // curvature is higher for a very bent edge (nodes close together)
        curvature = this.stiffness / this.manhattanDistance(node.node, node.otherNode);
        // attract the edge mid point to the control point
        node.xVelocity -= this.xStiffness(node, node.controlPoint, curvature);
        node.yVelocity -= this.yStiffness(node, node.controlPoint, curvature);
      }
      // for nodes, add the attracting velocity from all edges
      j = node.edges.length;
      while (j--) {
        edge = node.edges[j];
        if (edge.visible) {
          node.xVelocity += this.xSimpleAttracting(node, edge) / node.edges.length;
          node.yVelocity += this.ySimpleAttracting(node, edge) / node.edges.length;
        }
      }
      // apply damping
      node.xVelocity *= this.damping;
      node.yVelocity *= this.damping;
      node.velocity = Math.abs(node.xVelocity) + Math.abs(node.yVelocity);
      // check to see if the node has stopped moving
      if (node.velocity <= this.stoppingVelocity) {
        node.stop();
        node.velocity = node.xVelocity = node.yVelocity = 0; // zero velocity
      }
      // the more nodes that have stopped, the larger the starting velocity must be
      else if (
        node.velocity >=
        this.minimumStartingVelocity + (this.startingVelocityDelta * numberOfStoppedNodes) / numberOfNodes
      ) {
        node.start();
      }
      // if the node is moving and not fixed then calculate the new position
      if (node.moving && !node.fixed) {
        energy += node.velocity;
        node.xPosition += node.xVelocity;
        node.yPosition += node.yVelocity;
      }
    }
  }
  if (energy < (numberOfNodes - numberOfStoppedNodes) * this.stoppingVelocity) this.equilibrium = true;
};
