import React, { useEffect, useState } from "react";
import produce from "immer";
import data from "./data.json";
import Graph from "./Graph";
import { isDeepStrictEqual } from "util";

const MAX_NODES = 1; // per cell, any more and we subdivide

type Position = {
  x: number;
  y: number;
};

type Particle = {
  position: Position;
};

type Region = {
  width: number;
  height: number;
  position: Position;
};

type Cell<T> = Region & {
  children: T;
};

// A Quadrant either contains some particles, or four sub-Quadrants
type Quadrant =
  | Cell<Particle[]>
  | Cell<[Quadrant, Quadrant, Quadrant, Quadrant]>;

const contains_particle = function (
  region: Region,
  particle: Particle
): Boolean {
  return (
    region.position.x <= particle.position.x &&
    particle.position.x <= region.position.x + region.width &&
    region.position.y <= particle.position.y &&
    particle.position.y <= region.position.y + region.height
  );
};

const add_particle = function (
  particle: Particle,
  cell: Cell<Particle[]>
): Cell<Particle[]> {
  return produce(cell, (draft) => {
    draft.children.push(particle);
  });
};

const remove_particle = function (
  particle: Particle,
  cell: Cell<Particle[]>
): Cell<Particle[]> {
  let index = cell.children.findIndex((p) => isDeepStrictEqual(p, particle));

  if (index === -1) {
    throw new Error(`Could not find particle: ${particle} in cell: ${cell}.`);
  }

  return produce(cell, (draft) => {
    draft.children.splice(index, 1);
  });
};

const subdivide = function (region: Region): [Region, Region, Region, Region] {
  let size = {
    width: region.width / 2,
    height: region.height / 2,
  };

  return [
    {
      ...size,
      position: {
        x: region.position.x,
        y: region.position.y,
      }, // top_left
    },
    {
      ...size,
      position: {
        x: region.position.x + size.width,
        y: region.position.y,
      }, // top_right
    },
    {
      ...size,
      position: {
        x: region.position.x + size.width,
        y: region.position.y + size.height,
      }, // bottom_right
    },
    {
      ...size,
      position: {
        x: region.position.x,
        y: region.position.y + size.height,
      }, // bottom_left
    },
  ];
};

const build_quadtree = function (
  particles: Particle[],
  { bounds }: { bounds: { width: number; height: number } }
) {
  let tree: Quadrant = {
    width: bounds.width,
    height: bounds.height,
    position: { x: 0, y: 0 },
    children: [],
  };

  for (let particle of particles) {
  }
};

const App = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "hsl(0, 0%, 10%)",
        overflow: "hidden",
      }}
    >
      {/* <Graph/> */}
    </div>
  );
};

export default App;
