// Grafo de senderos peatonales del campus (estimado sobre el plano ilustrado).
// IMPORTANTE: estos caminos deben ser validados por alguien que conozca el campus.
// Usa ?debug=1 en la URL para ver los nodos/aristas sobre el mapa y hacer clic para leer coordenadas.

import type { Lang } from '../config';

export interface GNode {
  id: string;
  x: number;
  y: number;
  /** Referencia para las instrucciones ("junto a ..."). */
  hint?: Record<Lang, string>;
}

const h = (es: string, en: string) => ({ es, en });

export const NODES: GNode[] = [
  // --- Túnel (punto de partida) y salida ---
  { id: 'tunel', x: 340, y: 1112, hint: h('el túnel del Bloque 18', 'the Block 18 tunnel') },
  { id: 'tun_s', x: 340, y: 1165 },
  { id: 'w24', x: 305, y: 1182 },
  { id: 'sw_acc', x: 232, y: 1138, hint: h('el acceso peatonal suroccidental', 'the southwest pedestrian gate') },
  { id: 'e1', x: 440, y: 1177 },
  { id: 'e2', x: 500, y: 1192 },

  // --- Corredor principal oriente-occidente (entre 17/19 y 11/8) ---
  { id: 't_a', x: 560, y: 1198 },
  { id: 't_b', x: 640, y: 1202 },
  { id: 't_c', x: 725, y: 1203, hint: h('el paseo entre los bloques 17 y 19', 'the walkway between blocks 17 and 19') },
  { id: 't_d', x: 790, y: 1203 },
  { id: 't_e', x: 850, y: 1200 },
  { id: 't_f', x: 940, y: 1195 },
  { id: 't_g', x: 1000, y: 1195 },
  { id: 't_h', x: 1050, y: 1197 },
  { id: 't_i', x: 1130, y: 1196 },
  { id: 't_j', x: 1220, y: 1200 },
  { id: 'bol', x: 1283, y: 1212, hint: h('el acceso peatonal de la Av. Bolivariana', 'the Av. Bolivariana pedestrian gate') },

  // --- Paseo central entre bloques 17 y 19, hacia el norte ---
  { id: 'pz1', x: 725, y: 1150 },
  { id: 'pz2', x: 725, y: 1090 },
  { id: 'pz3', x: 725, y: 1020 },
  { id: 'pz4', x: 740, y: 960 },
  { id: 'pz5', x: 752, y: 900 },
  { id: 'pz6', x: 762, y: 820 },
  { id: 'pz7', x: 768, y: 750 },
  { id: 'jc', x: 770, y: 690, hint: h('la plazoleta central', 'the central plaza') },

  // --- Eje norte ---
  { id: 'sp1', x: 765, y: 600 },
  { id: 'sp2', x: 757, y: 520 },
  { id: 'sp3', x: 753, y: 470 },
  { id: 'sp4', x: 748, y: 400 },
  { id: 'ne', x: 790, y: 335, hint: h('el acceso peatonal norte (Carrera 70)', 'the north pedestrian gate (Carrera 70)') },

  // --- Rama occidental desde la plazoleta ---
  { id: 'w1', x: 690, y: 684 },
  { id: 'w2', x: 625, y: 680 },

  // --- Rama oriental (hacia 4, 5, 6) ---
  { id: 'c1', x: 820, y: 640 },
  { id: 'c2', x: 900, y: 612 },
  { id: 'c3', x: 1000, y: 612 },
  { id: 'c4', x: 1070, y: 575 },
  { id: 'c5', x: 1120, y: 548 },
  { id: 'c6', x: 1150, y: 600 },
  { id: 'c7', x: 1190, y: 685 },
  { id: 'c8', x: 1255, y: 775 },
  { id: 'e6a', x: 840, y: 708 },

  // --- Camino desde la Av. Bolivariana hacia el bloque 5 ---
  { id: 'bo1', x: 1330, y: 1130 },
  { id: 'bo2', x: 1345, y: 1062 },
  { id: 'bo3', x: 1285, y: 1030 },
  { id: 'bo4', x: 1272, y: 930 },
  { id: 'bo5', x: 1276, y: 850 },

  // --- Plazoleta del bloque 7 y canchas (16) ---
  { id: 'p7a', x: 992, y: 1125 },
  { id: 'n7s', x: 1030, y: 1072 },
  { id: 'p16a', x: 1050, y: 1010 },

  // --- Hacia el bloque 10 (sendero entre jardines) ---
  { id: 's1', x: 800, y: 1255 },
  { id: 's2', x: 792, y: 1320 },
  { id: 's3', x: 772, y: 1390 },

  // --- Sendero occidental del bloque 8 hacia el 9 ---
  { id: 'w8a', x: 872, y: 1235 },
  { id: 'w8b', x: 872, y: 1300 },
  { id: 'w8c', x: 880, y: 1345 },
  { id: 'r89', x: 940, y: 1362 },

  // --- Borde occidental (acera de la Circular Primera) hacia los bloques 50-55 ---
  { id: 'o1', x: 185, y: 1050 },
  { id: 'o2', x: 150, y: 950 },
  { id: 'o3', x: 135, y: 850 },
  { id: 'o4', x: 130, y: 770 },
  { id: 'o5', x: 140, y: 690 },
  { id: 'o6', x: 175, y: 600 },
  { id: 'o7', x: 190, y: 520 },
  { id: 'o8', x: 215, y: 440 },
  { id: 'o9', x: 260, y: 360 },
  { id: 'o10', x: 310, y: 295 },
  { id: 'o11', x: 345, y: 255 },

  // --- Puntos de entrada a los edificios ---
  { id: 'e_b1', x: 940, y: 414 },
  { id: 'e_b2', x: 825, y: 357 },
  { id: 'e_b3', x: 805, y: 470 },
  { id: 'e_b4', x: 1150, y: 522 },
  { id: 'e_b5', x: 1302, y: 812 },
  { id: 'e_b6', x: 905, y: 742 },
  { id: 'e_b7', x: 985, y: 1080 },
  { id: 'e_b8', x: 1050, y: 1226 },
  { id: 'e_b9', x: 960, y: 1368 },
  { id: 'e_b10', x: 790, y: 1458 },
  { id: 'e_b11', x: 560, y: 1230 },
  { id: 'e_b12', x: 595, y: 672 },
  { id: 'e_b13', x: 700, y: 575 },
  { id: 'e_b14', x: 805, y: 288 },
  { id: 'e_b15', x: 695, y: 895 },
  { id: 'e_b16', x: 1058, y: 950 },
  { id: 'e_b17', x: 705, y: 1012 },
  { id: 'e_b18', x: 335, y: 1085 },
  { id: 'e_b19', x: 742, y: 1090 },
  { id: 'e_b24', x: 305, y: 1180 },
  { id: 'e_b50', x: 360, y: 262 },
  { id: 'e_b51', x: 178, y: 455 },
  { id: 'e_b52', x: 170, y: 492 },
  { id: 'e_b53', x: 160, y: 535 },
  { id: 'e_b54', x: 150, y: 580 },
  { id: 'e_b55', x: 90, y: 745 },
];

export const EDGES: [string, string][] = [
  // Salida del túnel
  ['tunel', 'tun_s'],
  ['tun_s', 'w24'],
  ['tun_s', 'e1'],
  ['tun_s', 'sw_acc'],
  ['e1', 'e2'],
  ['e2', 't_a'],
  ['w24', 'e_b24'],
  ['tunel', 'e_b18'],

  // Corredor principal
  ['t_a', 't_b'],
  ['t_b', 't_c'],
  ['t_c', 't_d'],
  ['t_d', 't_e'],
  ['t_e', 't_f'],
  ['t_f', 't_g'],
  ['t_g', 't_h'],
  ['t_h', 't_i'],
  ['t_i', 't_j'],
  ['t_j', 'bol'],

  // Paseo central
  ['t_c', 'pz1'],
  ['pz1', 'pz2'],
  ['pz2', 'pz3'],
  ['pz3', 'pz4'],
  ['pz4', 'pz5'],
  ['pz5', 'pz6'],
  ['pz6', 'pz7'],
  ['pz7', 'jc'],
  ['pz2', 'e_b19'],
  ['pz3', 'e_b17'],
  ['pz5', 'e_b15'],

  // Eje norte
  ['jc', 'sp1'],
  ['sp1', 'sp2'],
  ['sp2', 'sp3'],
  ['sp3', 'sp4'],
  ['sp4', 'ne'],
  ['sp1', 'e_b13'],
  ['sp3', 'e_b3'],
  ['ne', 'e_b2'],
  ['ne', 'e_b14'],
  ['e_b2', 'e_b1'],

  // Rama occidental
  ['jc', 'w1'],
  ['w1', 'w2'],
  ['w2', 'e_b12'],

  // Rama oriental
  ['jc', 'c1'],
  ['c1', 'c2'],
  ['c2', 'c3'],
  ['c3', 'c4'],
  ['c4', 'c5'],
  ['c5', 'e_b4'],
  ['e_b4', 'c6'],
  ['c6', 'c7'],
  ['c7', 'c8'],
  ['c8', 'e_b5'],
  ['jc', 'e6a'],
  ['e6a', 'e_b6'],

  // Av. Bolivariana hacia el bloque 5
  ['bol', 'bo1'],
  ['bo1', 'bo2'],
  ['bo2', 'bo3'],
  ['bo3', 'bo4'],
  ['bo4', 'bo5'],
  ['bo5', 'e_b5'],

  // Bloque 7 y canchas
  ['t_g', 'p7a'],
  ['p7a', 'e_b7'],
  ['e_b7', 'n7s'],
  ['n7s', 'p16a'],
  ['p16a', 'e_b16'],

  // Bloques 8, 9, 10, 11
  ['t_d', 's1'],
  ['s1', 's2'],
  ['s2', 's3'],
  ['s3', 'e_b10'],
  ['t_e', 'w8a'],
  ['w8a', 'w8b'],
  ['w8b', 'w8c'],
  ['w8c', 'r89'],
  ['r89', 'e_b9'],
  ['t_h', 'e_b8'],
  ['t_a', 'e_b11'],

  // Borde occidental (fuera del campus)
  ['sw_acc', 'o1'],
  ['o1', 'o2'],
  ['o2', 'o3'],
  ['o3', 'o4'],
  ['o4', 'o5'],
  ['o4', 'e_b55'],
  ['o5', 'o6'],
  ['o6', 'o7'],
  ['o6', 'e_b54'],
  ['o7', 'e_b53'],
  ['o7', 'o8'],
  ['o8', 'e_b52'],
  ['o8', 'e_b51'],
  ['o8', 'o9'],
  ['o9', 'o10'],
  ['o10', 'o11'],
  ['o11', 'e_b50'],
];
