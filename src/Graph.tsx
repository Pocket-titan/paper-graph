import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import _ from 'lodash';
import produce from 'immer';
import data from './data.json';
import { useClock } from './hooks';
import { scale_vector, subtract_vectors, vector_length, add_vectors } from './vectors';

type Id = number;

type Vector = [number, number];

type Node = {
  id: Id;
  radius: number;
  position: Vector;
  velocity: Vector;
  charge: number;
  mass: number;
};

type Nodes = {
  [Id: number]: Node;
};

type Connection = {
  strength: number;
  from: Id;
  to: Id;
};

type Connections = Connection[];

type Edge = {
  strength: number;
  from_id: Id;
  from: Vector;
  to_id: Id;
  to: Vector;
};

type Partition = {
  node_ids: Id[];
  mass: number;
  charge: number;
  center_of_mass: Vector;
  velocity: Vector;
};

type Partitions = { [key: string]: Partition };

const Node = ({ radius, position: [x, y], charge }: Node) => {
  return <circle cx={x} cy={y} r={radius + charge / 100} fill='#f06' fillOpacity={0.8} />;
};

const Edge = ({ strength, from, to }: Edge) => {
  let d = `M${from[0]},${from[1]}L${to[0]},${to[1]}`;

  return <path fill='transparent' stroke='white' strokeWidth={5 * strength} strokeOpacity={0.2} d={d} />;
};

const repelling_force = (
  node1: { charge: number; position: Vector },
  node2: { charge: number; position: Vector }
): Vector => {
  const c = 0.1;
  let vector_difference = subtract_vectors(node2.position, node1.position);

  return scale_vector(
    vector_difference,
    (-c * (node1.charge + node2.charge)) / (2 * vector_length(vector_difference) ** 2)
  );
};

const attracting_force = (
  node1: { mass: number; position: Vector },
  node2: { mass: number; position: Vector }
): Vector => {
  const c = 3.73037e-5;
  let vector_difference = subtract_vectors(node2.position, node1.position);

  return scale_vector(vector_difference, ((c * (node1.mass + node2.mass)) / 2) * vector_length(vector_difference));
};

const Graph = ({
  base_partition_size = 450,
  fuzziness = 0.1,
  fuzz = base_partition_size * fuzziness,
  stopping_velocity = 0.5,
  starting_velocity_range = [1, 5],
}: {
  base_partition_size?: number;
  fuzziness?: number;
  fuzz?: number;
  stopping_velocity?: number;
  starting_velocity_range?: Vector;
}) => {
  const [time, pause, resume] = useClock({ delay: 100 });
  const [connections, setConnections] = useState([] as Connections);
  const [nodes, setNodes] = useState({} as Nodes);
  let fuzzing: { current: 0 | 1 | 2 } = useRef(0);

  let nodes_array: Node[] = useMemo(() => Object.values(nodes), [nodes]);
  let edges_array: Edge[] = useMemo(() => {
    if (Object.keys(nodes).length === 0) return [];

    return connections.map(({ strength, from, to }) => {
      return {
        strength: strength,
        from_id: from,
        from: nodes[from].position,
        to_id: to,
        to: nodes[to].position,
      };
    });
  }, [nodes, connections]);

  const [width, height] = [window.innerWidth / 2, window.innerHeight / 2];

  useEffect(() => {
    const RADIUS = 10;

    let initial_nodes: Nodes = _.mapValues(
      data.vertices,
      ({ id, title, citation_count }): Node => {
        return {
          id: id,
          radius: RADIUS,
          position: [
            Math.min(width - RADIUS, Math.max(RADIUS, Math.random() * width)),
            Math.min(height - RADIUS, Math.max(RADIUS, Math.random() * height)),
          ],
          velocity: [
            starting_velocity_range[0] + Math.random() * (starting_velocity_range[1] - starting_velocity_range[0]),
            starting_velocity_range[0] + Math.random() * (starting_velocity_range[1] - starting_velocity_range[0]),
          ],
          // charge: citation_count === 'unknown' ? 1 : (citation_count as number),
          // mass: citation_count === 'unknown' ? 1 : (citation_count as number),
          charge: 20,
          mass: 2,
        };
      }
    );

    let initial_connections: Connections = _.map(data.edges, ({ from, to, times_cited }) => {
      return {
        strength: times_cited,
        from: from,
        to: to,
      };
    });

    setNodes(initial_nodes);
    setConnections(initial_connections);
  }, []);

  const update = useCallback(() => {
    let new_nodes = produce(nodes, (draftNodes) => {
      fuzzing.current = ((fuzzing.current + 1) % 3) as 0 | 1 | 2;
      const partition_size = base_partition_size - fuzz + fuzzing.current * fuzz;

      let partitions: Partitions = {};

      nodes_array.forEach(({ id, position, mass, charge }) => {
        let key = `${Math.floor(position[0] / partition_size)},${Math.floor(position[1] / partition_size)}`; // = `x,y`

        if (!partitions[key]) {
          partitions[key] = {
            node_ids: [id],
            mass: mass,
            charge: charge,
            center_of_mass: position,
            velocity: [0, 0],
          };
        } else {
          partitions[key] = produce(partitions[key], (partition) => {
            partition.node_ids.push(id);
            partition.mass += mass;
            partition.charge += charge;
            partition.center_of_mass = [
              (partition.center_of_mass[0] * partition.node_ids.length + position[0]) / (partition.node_ids.length + 1),
              (partition.center_of_mass[1] * partition.node_ids.length + position[1]) / (partition.node_ids.length + 1),
            ]; // yes i know i could use add_vectors and scale_vector here but this is more readable i think
          });
        }
      });

      // Calculate the forces on the partitions and add them to the children nodes velocities
      Object.entries(partitions).forEach(([key1, partition]) => {
        let total_force_on_me = Object.entries(partitions).reduce(
          (total: Vector, [key2, other_partition]) => {
            if (key1 === key2) return total; // Ignore the force from ourselves

            let force = repelling_force(
              { charge: partition.charge, position: partition.center_of_mass },
              { charge: other_partition.charge, position: other_partition.center_of_mass }
            );

            return add_vectors(total, force);
          },
          [0, 0]
        );

        // Add the total force to all the nodes that are belong to us
        partition.node_ids.forEach((id) => {
          let node = draftNodes[id];

          // Also care a little bit about our close neighbours!
          let intra_partition_force = partition.node_ids.reduce(
            (total: Vector, other_id) => {
              if (id === other_id) return total;

              let other_node = draftNodes[other_id];

              let force = repelling_force(
                { charge: node.charge, position: node.position },
                { charge: other_node.charge, position: other_node.position }
              );

              return add_vectors(total, force);
            },
            [0, 0]
          );

          node.velocity = add_vectors(node.velocity, intra_partition_force);

          node.velocity = add_vectors(node.velocity, scale_vector(total_force_on_me, 1));
        });
      });

      const DAMPING = 0.8; // 4 percent

      nodes_array.forEach(({ id }) => {
        let node = draftNodes[id];

        // Calculate the forces from our edges
        let our_edges = edges_array.filter(({ from_id, to_id }) => from_id === id || to_id === id);

        our_edges.forEach(({ strength, from, from_id, to, to_id }) => {
          let am_i_source = from_id === id ? true : false;

          let force = attracting_force(
            { position: am_i_source ? from : to, mass: node.mass },
            { position: am_i_source ? to : from, mass: draftNodes[am_i_source ? to_id : from_id].mass }
          );

          node.velocity = add_vectors(node.velocity, scale_vector(force, strength / our_edges.length));
        });

        node.velocity = scale_vector(node.velocity, DAMPING);

        // Finally, update the position based on the new velocity
        node.position = add_vectors(node.position, node.velocity);
      });
    });

    setNodes(new_nodes);
  }, [nodes, nodes_array]);

  useEffect(() => {
    if (nodes_array.length === 0) return;

    update();
  }, [time]);

  return (
    <div style={{ height, width, position: 'relative' }}>
      <div style={{ position: 'absolute', left: '50%', top: '-25%', color: 'white', fontSize: 32 }}>
        {time}
        <button onClick={(e) => pause()}>Pause</button>
        <button onClick={(e) => resume()}>Resume</button>
      </div>
      <svg style={{ width, height }}>
        {nodes_array.map((node) => (
          <Node {...node} />
        ))}
        {edges_array.map((edge) => (
          <Edge {...edge} />
        ))}
      </svg>
    </div>
  );
};

export default Graph;
