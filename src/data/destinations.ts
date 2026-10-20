// Directorio de destinos (tomado de la leyenda del plano UPB Sede Laureles).

import type { Lang } from '../config';

type L = Record<Lang, string>;
const t = (es: string, en: string): L => ({ es, en });

export interface Destination {
  id: string;
  kind: 'block' | 'service';
  /** Número del bloque tal como aparece en el plano. */
  num?: string;
  /** Posición del pin sobre el mapa (px). */
  x: number;
  y: number;
  /** Nodo del grafo por el que se entra. Si falta, se ajusta al sendero más cercano. */
  entry?: string;
  name: L;
  sub?: L;
  /** Palabras extra para la búsqueda (escuelas, auditorios, sinónimos). */
  keywords?: string;
  /** Categoría de servicio (solo para kind = service). */
  cat?: string;
  /** Está fuera del campus (cruzando la Circular Primera). */
  outside?: boolean;
}

export const BLOCKS: Destination[] = [
  {
    id: 'b1', kind: 'block', num: '1', x: 968, y: 350, entry: 'e_b1',
    name: t('Templo Universitario', 'University Church'),
    sub: t('Nuestra Señora del Santísimo Sacramento', 'Our Lady of the Blessed Sacrament'),
    keywords: 'iglesia capilla misa templo church chapel',
  },
  {
    id: 'b2', kind: 'block', num: '2', x: 884, y: 300, entry: 'e_b2',
    name: t('Aula Magna', 'Aula Magna'),
    sub: t('Mons. Manuel José Sierra', 'Mons. Manuel José Sierra'),
    keywords: 'auditorio eventos grados auditorium',
  },
  {
    id: 'b3', kind: 'block', num: '3', x: 924, y: 468, entry: 'e_b3',
    name: t('Bloque Rectoral', 'Rectory Building'),
    sub: t('Mons. Tiberio de Jesús Salazar y Herrera', 'Mons. Tiberio de Jesús Salazar y Herrera'),
    keywords: 'rectoria rector administracion rectorate',
  },
  {
    id: 'b4', kind: 'block', num: '4', x: 1285, y: 477, entry: 'e_b4',
    name: t('Colegio UPB · Primaria y Preescolar', 'UPB School · Primary & Preschool'),
    sub: t('Pbro. Gonzalo Restrepo Villegas', 'Pbro. Gonzalo Restrepo Villegas'),
    keywords: 'colegio escuela primaria preescolar kinder school',
  },
  {
    id: 'b5', kind: 'block', num: '5', x: 1437, y: 785, entry: 'e_b5',
    name: t('Colegio UPB · Bachillerato', 'UPB School · High School'),
    keywords: 'colegio bachillerato secundaria high school',
  },
  {
    id: 'b6', kind: 'block', num: '6', x: 982, y: 797, entry: 'e_b6',
    name: t('Bloque 6', 'Block 6'),
    sub: t(
      'Escuelas de Economía, Administración y Negocios · Educación y Pedagogía · Teología, Filosofía y Humanidades · Auditorio Pío XII',
      'Schools of Economics, Administration & Business · Education & Pedagogy · Theology, Philosophy & Humanities · Pío XII Auditorium',
    ),
    keywords: 'economia administracion negocios educacion pedagogia teologia filosofia humanidades auditorio pio xii business',
  },
  {
    id: 'b7', kind: 'block', num: '7', x: 957, y: 968, entry: 'e_b7',
    name: t('Bloque 7', 'Block 7'),
    sub: t('Escuela de Ciencias Sociales', 'School of Social Sciences'),
    keywords: 'ciencias sociales social sciences psicologia comunicacion',
  },
  {
    id: 'b8', kind: 'block', num: '8', x: 1063, y: 1288, entry: 'e_b8',
    name: t('Centro de Producción Audiovisual CPA', 'Audiovisual Production Center (CPA)'),
    sub: t('Mons. Alberto Giraldo Jaramillo · Talleres y Laboratorios', 'Mons. Alberto Giraldo Jaramillo · Workshops & Labs'),
    keywords: 'cpa audiovisual produccion talleres laboratorios studio',
  },
  {
    id: 'b9', kind: 'block', num: '9', x: 932, y: 1418, entry: 'e_b9',
    name: t('Bloque 9 · Postgrados', 'Block 9 · Graduate Studies'),
    sub: t('Mons. Luis Fernando Rodríguez Velásquez', 'Mons. Luis Fernando Rodríguez Velásquez'),
    keywords: 'postgrados maestria doctorado especializacion graduate masters',
  },
  {
    id: 'b10', kind: 'block', num: '10', x: 795, y: 1525, entry: 'e_b10',
    name: t('Bloque 10', 'Block 10'),
    sub: t(
      'Escuela de Arquitectura y Diseño · Auditorio Juan Pablo II · Auditorio Ignacio Vieira Jaramillo',
      'School of Architecture & Design · Juan Pablo II Auditorium · Ignacio Vieira Jaramillo Auditorium',
    ),
    keywords: 'arquitectura diseno auditorio juan pablo ii ignacio vieira architecture design',
  },
  {
    id: 'b11', kind: 'block', num: '11', x: 593, y: 1372, entry: 'e_b11',
    name: t('Bloque 11 · Laboratorios y FORUM', 'Block 11 · Labs & FORUM'),
    sub: t(
      'Edificio Laboratorios Mons. Félix Henao Botero · Centro de Eventos · FORUM UPB Mons. Tulio Botero Salazar',
      'Mons. Félix Henao Botero Laboratories · Events Center · FORUM UPB Mons. Tulio Botero Salazar',
    ),
    keywords: 'laboratorios forum eventos centro de eventos labs events',
  },
  {
    id: 'b12', kind: 'block', num: '12', x: 528, y: 600, entry: 'e_b12',
    name: t('Bloque 12', 'Block 12'),
    sub: t(
      'Escuela de Derecho y Ciencias Políticas · Auditorio Guillermo Jaramillo Barrientos',
      'School of Law & Political Science · Guillermo Jaramillo Barrientos Auditorium',
    ),
    keywords: 'derecho ciencias politicas abogacia auditorio guillermo jaramillo law political',
  },
  {
    id: 'b13', kind: 'block', num: '13', x: 664, y: 470, entry: 'e_b13',
    name: t('Editorial · Librería · Tienda Universitaria', 'Press · Bookstore · University Store'),
    keywords: 'editorial libreria tienda libros souvenirs bookstore store shop',
  },
  {
    id: 'b14', kind: 'block', num: '14', x: 779, y: 208, entry: 'e_b14',
    name: t('Bienestar Universitario', 'Student Wellbeing'),
    keywords: 'bienestar deporte cultura salud wellbeing student services',
  },
  {
    id: 'b15', kind: 'block', num: '15', x: 628, y: 828, entry: 'e_b15',
    name: t('Bloque 15 · Biblioteca Central', 'Block 15 · Central Library'),
    sub: t('Mons. Darío Múnera Vélez', 'Mons. Darío Múnera Vélez'),
    keywords: 'biblioteca libros estudio library books',
  },
  {
    id: 'b16', kind: 'block', num: '16', x: 1134, y: 881, entry: 'e_b16',
    name: t('Canchas de fútbol y tenis', 'Football & Tennis Courts'),
    sub: t('Canchas sintéticas · Mons. Luis Alfonso Londoño Bernal', 'Synthetic fields · Mons. Luis Alfonso Londoño Bernal'),
    keywords: 'canchas futbol tenis deporte sintetica courts sports soccer',
  },
  {
    id: 'b17', kind: 'block', num: '17', x: 597, y: 1010, entry: 'e_b17',
    name: t('Polideportivo UPB · Gimnasio', 'UPB Sports Center · Gym'),
    sub: t('Mons. Eugenio Restrepo Uribe', 'Mons. Eugenio Restrepo Uribe'),
    keywords: 'polideportivo gimnasio gym deporte sports coliseo',
  },
  {
    id: 'b18', kind: 'block', num: '18', x: 294, y: 1052, entry: 'e_b18',
    name: t('Bloque 18 · Parqueaderos', 'Block 18 · Parking'),
    sub: t('Cancha Fundadores', 'Fundadores Field'),
    keywords: 'parqueadero parqueaderos cancha fundadores parking field',
  },
  {
    id: 'b19', kind: 'block', num: '19', x: 828, y: 1074, entry: 'e_b19',
    name: t('Puestos de Estudio', 'Study Spaces'),
    keywords: 'estudio puestos study',
  },
  {
    id: 'b24', kind: 'block', num: '24', x: 279, y: 1206, entry: 'e_b24',
    name: t('Asesoría Integral', 'Integral Advisory'),
    keywords: 'asesoria integral admisiones matricula orientacion advisory admissions',
  },
  {
    id: 'b50', kind: 'block', num: '50', x: 322, y: 213, entry: 'e_b50', outside: true,
    name: t('Centro de Familia', 'Family Center'),
    sub: t('Carrera 73 No. C2-46', 'Carrera 73 No. C2-46'),
    keywords: 'familia centro de familia family',
  },
  {
    id: 'b51', kind: 'block', num: '51', x: 131, y: 426, entry: 'e_b51', outside: true,
    name: t('Casa de Institutos', 'Institutes House'),
    sub: t('Circular 1ª No. 73-30', 'Circular 1ª No. 73-30'),
    keywords: 'institutos casa institutes',
  },
  {
    id: 'b52', kind: 'block', num: '52', x: 100, y: 473, entry: 'e_b52', outside: true,
    name: t('Conciliación y Consultorio Jurídico', 'Arbitration Center & Legal Clinic'),
    sub: t(
      'Circular 1ª No. 73-74 · Centro de Conciliación y Arbitraje Darío Velásquez Gaviria · Consultorio Jurídico y Centro de Conciliación Pío XII',
      'Circular 1ª No. 73-74 · Darío Velásquez Gaviria Arbitration Center · Pío XII Legal Clinic',
    ),
    keywords: 'conciliacion arbitraje consultorio juridico legal clinic',
  },
  {
    id: 'b53', kind: 'block', num: '53', x: 71, y: 519, entry: 'e_b53', outside: true,
    name: t('Casa de Transferencia', 'Technology Transfer House'),
    sub: t('Circular 1ª No. 73-74', 'Circular 1ª No. 73-74'),
    keywords: 'transferencia tecnologia casa transfer',
  },
  {
    id: 'b54', kind: 'block', num: '54', x: 71, y: 580, entry: 'e_b54', outside: true,
    name: t('Casa Bioingeniería', 'Bioengineering House'),
    sub: t('Circular 1ª No. 73-80', 'Circular 1ª No. 73-80'),
    keywords: 'bioingenieria bioengineering',
  },
  {
    id: 'b55', kind: 'block', num: '55', x: 50, y: 717, entry: 'e_b55', outside: true,
    name: t('Casa GIA', 'GIA House'),
    sub: t('Grupo de Investigaciones Ambientales', 'Environmental Research Group'),
    keywords: 'gia investigaciones ambientales environmental research',
  },
];

// ---------------------------------------------------------------------------
// Servicios (iconos amarillos del plano)
// ---------------------------------------------------------------------------

export interface Category {
  id: string;
  name: L;
  /** Nombre en singular para "El ... más cercano". */
  nearest: L;
  /** Texto de ayuda breve. */
  hint: L;
}

export const CATEGORIES: Category[] = [
  { id: 'bano', name: t('Baños', 'Restrooms'), nearest: t('Baño más cercano', 'Nearest restroom'), hint: t('Baños públicos', 'Public restrooms') },
  { id: 'comida', name: t('Comida', 'Food'), nearest: t('Zona de comida más cercana', 'Nearest food area'), hint: t('Cafeterías y restaurantes', 'Cafeterias and restaurants') },
  { id: 'cajero', name: t('Cajeros', 'ATMs'), nearest: t('Cajero más cercano', 'Nearest ATM'), hint: t('Bancos y cajeros electrónicos', 'Banks and ATMs') },
  { id: 'pago', name: t('Pagos y carné', 'Payments & ID card'), nearest: t('Punto de pago más cercano', 'Nearest payment point'), hint: t('Punto de pago y recarga de carné', 'Payment point and ID card top-up') },
  { id: 'auditorio', name: t('Auditorios', 'Auditoriums'), nearest: t('Auditorio más cercano', 'Nearest auditorium'), hint: t('Auditorios del campus', 'Campus auditoriums') },
  { id: 'acceso', name: t('Accesos', 'Gates'), nearest: t('Acceso peatonal más cercano', 'Nearest pedestrian gate'), hint: t('Accesos peatonales y de bicicletas', 'Pedestrian and bicycle gates') },
  { id: 'piscina', name: t('Piscinas', 'Pools'), nearest: t('Piscina más cercana', 'Nearest pool'), hint: t('Piscinas', 'Swimming pools') },
];

type P = [number, number];
const svc = (cat: string, label: L, pts: P[], entries: (string | undefined)[] = []): Destination[] =>
  pts.map(([x, y], i) => ({
    id: `s_${cat}_${i + 1}`,
    kind: 'service' as const,
    cat,
    x,
    y,
    entry: entries[i],
    name: { es: `${label.es} ${i + 1}`, en: `${label.en} ${i + 1}` },
  }));

export const SERVICES: Destination[] = [
  ...svc('bano', t('Baños', 'Restrooms'), [[678, 975], [680, 1062], [944, 1541], [1038, 954]]),
  ...svc('comida', t('Zona de comida', 'Food area'), [[850, 1153], [595, 1475], [1017, 1510], [883, 1670], [1247, 553], [1342, 840]]),
  ...svc('cajero', t('Cajero', 'ATM'), [[242, 1164], [651, 1128], [921, 1323]]),
  ...svc('pago', t('Punto de pago', 'Payment point'), [[254, 1083], [398, 1085], [800, 258], [957, 1176]]),
  ...svc('auditorio', t('Auditorio', 'Auditorium'), [[724, 220], [868, 350], [470, 613], [1023, 727], [526, 1268], [1052, 1494], [844, 1591]]),
  ...svc('acceso', t('Acceso peatonal', 'Pedestrian gate'), [[228, 1126], [796, 324], [1283, 1207]], ['sw_acc', 'ne', 'bol']),
  ...svc('piscina', t('Piscina', 'Pool'), [[334, 1236], [1353, 560]]),
];

export const ALL_DESTINATIONS: Destination[] = [...BLOCKS, ...SERVICES];

export const byId = new Map(ALL_DESTINATIONS.map((d) => [d.id, d]));
