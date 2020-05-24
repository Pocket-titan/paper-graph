export const a = 5;
// import React, { useState, useEffect } from 'react';
// import produce from 'immer';
// import data from './data.json';
// import { useClock } from './hooks';

// type Vector = [number, number];
// type Id = number;

// type Node = {
//   id: Id;
//   radius: number;
//   position: Vector;
//   velocity: Vector;
// };

// type Nodes = {
//   [Id: number]: Node;
// }

// type Edge = {
//   weight: number;
//   from: Id;
//   to: Id;
// };

// const add = (v1: Vector, v2: Vector): Vector => [v1[0] + v2[0], v1[1] + v1[1]];

// const subtract = (v1: Vector, v2: Vector): Vector => [v1[0] - v2[0], v1[1] - v2[0]];

// const scale = (v: Vector, factor: number): Vector => [v[0] * factor, v[1] * factor];

// const length = (v: Vector): number => Math.sqrt(v[0] ** 2 + v[1] ** 2);

// // Repelling force between nodes
// const repelling_force = (position_one: Vector, position_two: Vector): Vector => {
//   let c3 = -1;
//   let separation = subtract(position_two, position_one);
//   let distance = length(separation);

//   let strength = distance > 0 ? c3 / distance ** 2 : distance;

//   return scale(separation, strength);
// };

// // Attractive force between edges
// const spring_force = (position_one: Vector, position_two: Vector): Vector => {
//   const c1 = 2;
//   const c2 = 1;
//   let separation = subtract(position_two, position_one);
//   let distance = length(separation);
//   let strength = c1 * Math.log(distance / c2);

//   return scale(separation, strength);
// };

// function computeForces(nodes: Node[]) {
//   let forces = nodes.map((node_one, first_index) => {
//     let total = nodes.reduce(
//       (sum: Vector, node_two, second_index) => {
//         if (second_index === first_index) {
//           return sum;
//         }

//         let force = repelling_force(node_one.position, node_two.position);

//         return add(sum, force);
//       },
//       [0, 0]
//     );

//     return total;
//   });

//   return forces;
// }

// const Graph = () => {
//   let [equilibrium, setEquilibrium] = useState(false);
//   let [nodes, setNodes] = useState({} as Nodes);
//   let [edges, setEdges] = useState([] as Edge[]);
//   let [time, pause, resume] = useClock({ delay: 500 });

//   const [width, height] = [window.innerWidth / 2, window.innerHeight / 2];

//   // On mount, initialize with random positions
//   useEffect(() => {
//     const RADIUS = 20;

//     let initial_nodes: Nodes = Object.values(data.vertices).reduce((obj: Nodes, { id, citation_count }) => {
//       obj[id] = {
//         id: id,
//         radius: RADIUS,
//         position: [
//           Math.min(width - RADIUS, Math.max(RADIUS, Math.random() * width)),
//           Math.min(height - RADIUS, Math.max(RADIUS, Math.random() * height)),
//         ],
//         velocity: [0, 0],
//       };
//       return obj
//     }, {})

//     let initial_edges: Edge[] = data.edges.map(({ from, to, times_cited }) => {
//       return {
//         weight: times_cited,
//         from: from,
//         to: to,
//       };
//     })

//     setNodes(initial_nodes)
//     setEdges(initial_edges
//     );
//   }, []);

//   useEffect(() => {
//     if (equilibrium) {
//       pause();
//     } else {
//       resume();
//     }
//   }, [equilibrium]);

//   const step = () => {
//     let forces = computeForces(nodes);

//     setNodes(
//       produce((nodes: Nodes) => {
//         Object.entries(nodes).forEach(([id, node], my_index) => {
//           let force = forces[my_index];
//           const mass = 1;
//           // const c4 = 0.1;
//           const c4 = 10;
//           node.position[0] += c4 * force[0];
//           node.position[1] += c4 * force[1];
//         });
//       })
//     );
//   };

//   useEffect(() => {
//     if (nodes.length === 0) {
//       return;
//     }

//     step();

//     let equilibrium_condition = false;

//     if (!equilibrium && equilibrium_condition) {
//       setEquilibrium(true);
//     } else if (equilibrium && !equilibrium_condition) {
//       setEquilibrium(false);
//     }
//   }, [time]);

//   return (
//     <div style={{ width, height, position: 'relative', overflow: 'hidden' }}>
//       {nodes.map(({ radius, position, velocity }) => {
//         return (
//           <div
//             style={{
//               width: radius,
//               height: radius,
//               borderRadius: '50%',
//               backgroundColor: '#f06',
//               opacity: 0.8,
//               position: 'absolute',
//               left: position[0],
//               top: position[1],
//             }}
//           />
//         );
//       })}
//       {edges.map()}
//     </div>
//   );
// };

// export default Graph;
