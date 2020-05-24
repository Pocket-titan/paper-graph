import React from 'react';
import { ForceGraph2D } from 'react-force-graph';
import data from './data.json';
import Graph from './Graph';

// let transformed_data = {
//   nodes: Object.values(data.vertices).map(({ id, citation_count }) => {
//     return {
//       id: id,
//       citation_count: 1 + (citation_count === 'unknown' ? 0 : (citation_count as number)) / 100,
//     };
//   }),
//   links: data.edges.map(({ from, to, times_cited }) => {
//     return {
//       from,
//       to,
//       times_cited,
//       color: `hsl(0, 0%, ${Math.min(100, 50 + (times_cited - 1) * 10)}%)`,
//     };
//   }),
// };

// const Graph = () => {
//   const fgRef = useRef();

//   useEffect(() => {
//     const fg = fgRef.current as any;

//     // Deactivate existing forces
//     // fg.d3Force('center', null);
//     // fg.d3Force('charge', () => {
//     //   // transformed_data.nodes.forEach((node: any) => {
//     //   //   node.vx = 50;
//     //   // });
//     // });

//     // Add collision and bounding box forces
//     // fg.d3Force('collide', d3.forceCollide(4));
//   }, []);

//   return (
//     <ForceGraph2D
//       ref={fgRef}
//       graphData={transformed_data}
//       nodeId='id'
//       linkSource='from'
//       linkTarget='to'
//       nodeVal='citation_count'
//       nodeLabel='title'
//       nodeRelSize={4}
//       linkDirectionalArrowLength={10}
//       linkCurvature={0.3}
//       width={window.innerWidth}
//       height={window.innerHeight}
//       onNodeDragEnd={(node) => {
//         node.fx = node.x;
//         node.fy = node.y;
//       }}
//       d3VelocityDecay={0.8}
//       d3AlphaDecay={0.01}
//     />
//   );
// };

const App = () => {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'hsl(0, 0%, 10%)',
        overflow: 'hidden',
      }}
    >
      <Graph />
    </div>
  );
};

export default App;
