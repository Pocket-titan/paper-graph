type Vector = [number, number];

export const add_vectors = (v1: Vector, v2: Vector): Vector => [v1[0] + v2[0], v1[1] + v2[1]];

export const subtract_vectors = (v1: Vector, v2: Vector): Vector => [v1[0] - v2[0], v1[1] - v2[1]];

export const scale_vector = (v: Vector, factor: number): Vector => [v[0] * factor, v[1] * factor];

export const vector_length = (v: Vector): number => Math.sqrt(v[0] ** 2 + v[1] ** 2);
