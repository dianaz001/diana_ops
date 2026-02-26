export interface Misterio {
  numero: number;
  titulo: string;
  cita: string;
  meditacion: string;
}

export interface GrupoMisterios {
  nombre: string;
  descripcion: string;
  misterios: Misterio[];
}

export const misteriosGozosos: GrupoMisterios = {
  nombre: 'Misterios Gozosos',
  descripcion: 'Los misterios de la alegría por la venida de Jesús al mundo',
  misterios: [
    {
      numero: 1,
      titulo: 'La Anunciación del Ángel a María',
      cita: 'Lucas 1, 26-38',
      meditacion:
        'El ángel Gabriel fue enviado por Dios a una ciudad de Galilea llamada Nazaret, a una virgen desposada con un hombre llamado José, de la casa de David; el nombre de la virgen era María. "Alégrate, llena de gracia, el Señor está contigo."',
    },
    {
      numero: 2,
      titulo: 'La Visitación de María a su prima Isabel',
      cita: 'Lucas 1, 39-56',
      meditacion:
        'María se puso en camino y fue aprisa a la montaña, a una ciudad de Judá. Entró en casa de Zacarías y saludó a Isabel. "Bendita tú entre las mujeres y bendito el fruto de tu vientre."',
    },
    {
      numero: 3,
      titulo: 'El Nacimiento de Jesús en Belén',
      cita: 'Lucas 2, 1-20',
      meditacion:
        'Mientras estaban en Belén, le llegó a María el tiempo del parto y dio a luz a su hijo primogénito, lo envolvió en pañales y lo acostó en un pesebre, porque no había sitio para ellos en la posada.',
    },
    {
      numero: 4,
      titulo: 'La Presentación de Jesús en el Templo',
      cita: 'Lucas 2, 22-40',
      meditacion:
        'Cuando se cumplieron los días de la purificación, llevaron a Jesús a Jerusalén para presentarlo al Señor. Simeón lo tomó en brazos y bendijo a Dios: "Mis ojos han visto tu salvación."',
    },
    {
      numero: 5,
      titulo: 'El Niño Jesús perdido y hallado en el Templo',
      cita: 'Lucas 2, 41-52',
      meditacion:
        'Al cabo de tres días lo encontraron en el Templo, sentado en medio de los maestros, escuchándolos y haciéndoles preguntas. "¿No sabían que yo debía estar en la casa de mi Padre?"',
    },
  ],
};

export const misteriosDolorosos: GrupoMisterios = {
  nombre: 'Misterios Dolorosos',
  descripcion: 'Los misterios del sufrimiento y la pasión de Jesús',
  misterios: [
    {
      numero: 1,
      titulo: 'La Oración de Jesús en el Huerto de Getsemaní',
      cita: 'Mateo 26, 36-46',
      meditacion:
        'Jesús fue con sus discípulos a un lugar llamado Getsemaní y les dijo: "Siéntense aquí, mientras yo voy a orar." Comenzó a sentir tristeza y angustia. "Padre mío, si es posible, que pase de mí este cáliz; pero no se haga mi voluntad, sino la tuya."',
    },
    {
      numero: 2,
      titulo: 'La Flagelación de Jesús',
      cita: 'Juan 19, 1',
      meditacion:
        'Entonces Pilato tomó a Jesús y mandó azotarlo. Cristo aceptó los golpes con mansedumbre, ofreciendo su sufrimiento por la salvación de todos nosotros.',
    },
    {
      numero: 3,
      titulo: 'La Coronación de espinas',
      cita: 'Mateo 27, 27-31',
      meditacion:
        'Los soldados del gobernador llevaron a Jesús al pretorio, le quitaron la ropa y le pusieron un manto de color púrpura. Trenzaron una corona de espinas y se la pusieron en la cabeza. "¡Salve, Rey de los judíos!"',
    },
    {
      numero: 4,
      titulo: 'Jesús con la Cruz a cuestas camino al Calvario',
      cita: 'Juan 19, 17',
      meditacion:
        'Jesús, cargando con su cruz, salió hacia el lugar llamado "de la Calavera", en hebreo Gólgota. Obligaron a Simón de Cirene a llevar la cruz detrás de Jesús.',
    },
    {
      numero: 5,
      titulo: 'La Crucifixión y Muerte de Jesús',
      cita: 'Lucas 23, 33-46',
      meditacion:
        'Cuando llegaron al lugar llamado Calvario, lo crucificaron. Jesús decía: "Padre, perdónalos, porque no saben lo que hacen." Era ya cerca del mediodía cuando las tinieblas cubrieron toda la tierra. "Padre, en tus manos encomiendo mi espíritu."',
    },
  ],
};

export const misteriosGloriosos: GrupoMisterios = {
  nombre: 'Misterios Gloriosos',
  descripcion: 'Los misterios de la resurrección y la gloria',
  misterios: [
    {
      numero: 1,
      titulo: 'La Resurrección de Jesús',
      cita: 'Mateo 28, 1-10',
      meditacion:
        'Pasado el sábado, al amanecer del primer día de la semana, María Magdalena y la otra María fueron a ver el sepulcro. El ángel les dijo: "No tengan miedo. Sé que buscan a Jesús, el crucificado. No está aquí. Ha resucitado."',
    },
    {
      numero: 2,
      titulo: 'La Ascensión de Jesús al Cielo',
      cita: 'Hechos 1, 6-12',
      meditacion:
        'Dicho esto, fue elevado en presencia de ellos, y una nube lo ocultó a sus ojos. "Este Jesús que ha sido llevado al cielo, volverá de la misma manera que lo han visto subir."',
    },
    {
      numero: 3,
      titulo: 'La Venida del Espíritu Santo',
      cita: 'Hechos 2, 1-13',
      meditacion:
        'Al llegar el día de Pentecostés, estaban todos juntos en un mismo lugar. De repente vino del cielo un ruido como el de un viento recio y se llenaron todos del Espíritu Santo.',
    },
    {
      numero: 4,
      titulo: 'La Asunción de María al Cielo',
      cita: 'Apocalipsis 12, 1',
      meditacion:
        'Una gran señal apareció en el cielo: una mujer vestida del sol, con la luna bajo sus pies y una corona de doce estrellas sobre su cabeza. María fue llevada en cuerpo y alma a la gloria celestial.',
    },
    {
      numero: 5,
      titulo: 'La Coronación de María como Reina del Cielo',
      cita: 'Apocalipsis 12, 1; Salmo 45',
      meditacion:
        'La Virgen María fue coronada como Reina del Cielo y de la Tierra, sentada a la derecha de su Hijo. "A tu derecha está la Reina, enjoyada con oro de Ofir."',
    },
  ],
};

export const misteriosLuminosos: GrupoMisterios = {
  nombre: 'Misterios Luminosos',
  descripcion: 'Los misterios de la luz y la vida pública de Jesús',
  misterios: [
    {
      numero: 1,
      titulo: 'El Bautismo de Jesús en el Jordán',
      cita: 'Mateo 3, 13-17',
      meditacion:
        'Jesús fue de Galilea al Jordán para que Juan lo bautizara. Apenas fue bautizado, se abrieron los cielos y vio al Espíritu de Dios que descendía como paloma. "Este es mi Hijo amado, en quien me complazco."',
    },
    {
      numero: 2,
      titulo: 'Las Bodas de Caná',
      cita: 'Juan 2, 1-12',
      meditacion:
        'Se celebraba una boda en Caná de Galilea y estaba allí la madre de Jesús. María dijo a los sirvientes: "Hagan lo que Él les diga." Este fue el primer signo que hizo Jesús, manifestando su gloria.',
    },
    {
      numero: 3,
      titulo: 'El Anuncio del Reino de Dios',
      cita: 'Marcos 1, 14-15',
      meditacion:
        'Después de que Juan fue arrestado, Jesús se fue a Galilea a proclamar el Evangelio de Dios. "El tiempo se ha cumplido y el Reino de Dios está cerca. Conviértanse y crean en el Evangelio."',
    },
    {
      numero: 4,
      titulo: 'La Transfiguración de Jesús',
      cita: 'Mateo 17, 1-8',
      meditacion:
        'Jesús tomó consigo a Pedro, a Santiago y a Juan, y subió con ellos a un monte alto. Se transfiguró delante de ellos: su rostro se puso brillante como el sol y sus vestidos se volvieron blancos como la luz.',
    },
    {
      numero: 5,
      titulo: 'La Institución de la Eucaristía',
      cita: 'Mateo 26, 26-29',
      meditacion:
        'Mientras cenaban, Jesús tomó pan, lo bendijo, lo partió y lo dio a sus discípulos diciendo: "Tomen y coman, esto es mi Cuerpo." Luego tomó el cáliz: "Beban todos de él, porque esta es mi Sangre de la Alianza."',
    },
  ],
};

/** Día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado) */
export const misteriosDelDia: Record<number, GrupoMisterios> = {
  0: misteriosGloriosos, // Domingo
  1: misteriosGozosos, // Lunes
  2: misteriosDolorosos, // Martes
  3: misteriosGloriosos, // Miércoles
  4: misteriosLuminosos, // Jueves
  5: misteriosDolorosos, // Viernes
  6: misteriosGozosos, // Sábado
};

export const diasSemana = [
  { numero: 1, nombre: 'Lunes', abreviado: 'Lun' },
  { numero: 2, nombre: 'Martes', abreviado: 'Mar' },
  { numero: 3, nombre: 'Miércoles', abreviado: 'Mié' },
  { numero: 4, nombre: 'Jueves', abreviado: 'Jue' },
  { numero: 5, nombre: 'Viernes', abreviado: 'Vie' },
  { numero: 6, nombre: 'Sábado', abreviado: 'Sáb' },
  { numero: 0, nombre: 'Domingo', abreviado: 'Dom' },
];
