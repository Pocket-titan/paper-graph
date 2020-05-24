import fs from 'fs';
import AcademicApi from './api';
import api_key from './api_key';

const api = new AcademicApi({ api_key });

const MAX_DEPTH = 3;
const MIN_CITATIONS = 200;

type Id = number;

type Vertex = {
  id: Id;
  title: string | 'unknown';
  citation_count: number | 'unknown';
};

type Edge = {
  from: Id;
  to: Id;
  times_cited: number;
};

interface Graph {
  vertices: {
    [Id: string]: Vertex;
  };
  edges: Edge[];
}

const match_id = (id: string | number) => `Id=${id}`;

const postify = (parameters: object) =>
  Object.entries(parameters)
    .map(([key, value]: [string, string | number]) => `${key}=${value}`)
    .join('&');

const fetch_citations = async (ids: Id[], graph: Graph, depth = 0) => {
  if (ids.length === 0 || depth >= MAX_DEPTH) {
    return graph;
  }

  console.log('searching on depth:', depth);

  let expr = ids.length === 1 ? match_id(ids[0]) : `Or(${ids.map(match_id).join(',')})`;

  let response = await api.evaluate({
    body: postify({ expr, attributes: 'Id,CitCon,CC,Ti', count: ids.length }),
  });

  let new_ids_to_query: Id[] = [];

  response.entities.forEach(({ Id, CC, CitCon, Ti }) => {
    if (ids.indexOf(Id) === -1) {
      console.warn("received an Id that I didn't request!", Id);
      return;
    }

    let vertex = graph.vertices[Id];
    if (!vertex) {
      graph.vertices[Id] = {
        id: Id,
        title: Ti || 'unknown',
        citation_count: CC || 'unknown',
      };
      //!CC && console.info(`paper with Id: ${Id} has no CC; setting to 'unknown'`);
    } else if (vertex.citation_count === 'unknown' && typeof CC === 'number') {
      vertex.citation_count = CC;
    }

    if (!CitCon) {
      //console.info(`paper with Id: ${Id} and CC: ${CC} has no CitCon, not searching deeper`);
      return;
    }

    Object.entries(CitCon).forEach(([key, citation_lines]) => {
      let cited_id = Number(key);
      let cited_vertex = graph.vertices[cited_id];

      if (!cited_vertex) {
        graph.vertices[cited_id] = {
          id: cited_id,
          title: 'unknown',
          citation_count: 'unknown',
        };
        new_ids_to_query.push(cited_id); //we don't know this one yet
      }

      let edge_index = graph.edges.findIndex((edge) => edge.from === Id && edge.to === cited_id);

      if (edge_index === -1) {
        graph.edges.push({
          from: Id,
          to: cited_id,
          times_cited: citation_lines.length,
        });
      }
    });
  });

  return fetch_citations([...new Set(new_ids_to_query)], graph, depth + 1);
};

const TEST_PAPER_ID = 2158117921;

const main = async () => {
  let graph = await fetch_citations([TEST_PAPER_ID], {
    vertices: {},
    edges: [],
  });
  console.dir(graph, { depth: null });

  fs.writeFile('data.json', JSON.stringify(graph), (err) => {
    if (err) {
      throw err;
    }
    console.log('Sucessfully wrote data to data.json');
  });
};

main();
