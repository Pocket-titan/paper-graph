import React from "react";
import { ForceGraph2D } from "react-force-graph";

type Id = string;

type Node = {
  id: Id;
};

type Link = {
  source: Id;
  target: Id;
  value: number;
};

type GraphData = {
  nodes: Node[];
  links: Link[];
};

const mockData: GraphData = {
  nodes: [
    {
      id: "1",
    },
    {
      id: "2",
    },
    {
      id: "3",
    },
  ],
  links: [
    {
      source: "1",
      target: "2",
      value: 1,
    },
    {
      source: "3",
      target: "1",
      value: 1,
    },
  ],
};

const Graph = ({ data = mockData }: { data?: GraphData }) => {
  return (
    <ForceGraph2D
      graphData={data}
      linkColor={() => "white"}
      nodeColor={() => "#f06"}
    />
  );
};

export default Graph;
