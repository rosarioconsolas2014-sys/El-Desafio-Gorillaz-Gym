import { Question, GameRecord, GameSettings } from '../types';

export const LEVEL_1_QUESTIONS: Question[] = [
  {
    id: 'l1-1',
    question: '¿Qué músculo trabaja principalmente el press de banca plano?',
    options: ['Pectorales (Pecho)', 'Gemelos', 'Bíceps femoral', 'Trapecios'],
    correctIndex: 0,
    explanation: 'El press de banca es el ejercicio básico multiarticular por excelencia para desarrollar el pectoral mayor.',
    category: 'exercises'
  },
  {
    id: 'l1-2',
    question: '¿Qué macronutriente es esencial para construir y reparar las fibras musculares?',
    options: ['Grasas saturadas', 'Proteínas', 'Azúcares simples', 'Fibra dietética'],
    correctIndex: 1,
    explanation: 'Los aminoácidos de las proteínas son los bloques de construcción del tejido muscular.',
    category: 'nutrition'
  },
  {
    id: 'l1-3',
    question: '¿Qué ejercicio se enfoca de forma directa en el desarrollo de los bíceps?',
    options: ['Sentadilla búlgara', 'Curl con mancuernas o barra', 'Prensa de piernas', 'Hip Thrust'],
    correctIndex: 1,
    explanation: 'El curl de bíceps realiza la flexión de codo y supinación del antebrazo, activando al máximo los bíceps.',
    category: 'exercises'
  },
  {
    id: 'l1-4',
    question: '¿Qué elemento clásico y pesado se utiliza como base para realizar sentadillas libres?',
    options: ['Barra olímpica y discos', 'Colchoneta de yoga', 'Mancuerna de 1kg', 'Pelota de pilates'],
    correctIndex: 0,
    explanation: 'La barra olímpica con discos de fundición o bumper plates es el estándar de oro para sentadillas pesadas.',
    category: 'equipment'
  },
  {
    id: 'l1-5',
    question: '¿Cuántos días de descanso mínimos por grupo muscular se recomienda generalmente para hipertrofia?',
    options: ['0 horas (entrenar el mismo músculo 3 veces al día)', '48 a 72 horas', '30 días seguidos', '10 minutos'],
    correctIndex: 1,
    explanation: 'El descanso de 48 a 72 horas permite la síntesis proteica muscular y la recuperación del sistema nervioso central.',
    category: 'technique'
  },
  {
    id: 'l1-6',
    question: '¿Qué grupo muscular principal reclutan las dominadas (pull-ups) en barra fija?',
    options: ['Dorsales y espalda alta', 'Cuádriceps', 'Gemelos', 'Pectoral menor únicamente'],
    correctIndex: 0,
    explanation: 'Las dominadas son el ejercicio rey de tracción vertical para dar amplitud a la espalda (dorsal ancho).',
    category: 'exercises'
  },
  {
    id: 'l1-7',
    question: '¿Cuál es el principal líquido que debes reponer constantemente durante tu rutina pesada?',
    options: ['Gaseosa con gas', 'Agua / Electrolitos', 'Jugo de uva con azúcar', 'Café hirviendo'],
    correctIndex: 1,
    explanation: 'Una deshidratación de apenas 2% reduce drásticamente la fuerza máxima y la resistencia muscular.',
    category: 'nutrition'
  },
  {
    id: 'l1-8',
    question: 'En el gimnasio, ¿qué significa hacer una "repetición" (rep)?',
    options: ['Un ciclo completo de ejecución de un ejercicio', 'Tomar una foto para redes', 'Tomar agua', 'Estar sentando 5 minutos'],
    correctIndex: 0,
    explanation: 'Una repetición comprende la fase concéntrica, punto de máxima contracción y fase excéntrica del movimiento.',
    category: 'technique'
  }
];

export interface Level2ChallengeItem {
  id: string;
  type: 'muscle_match' | 'equipment_id' | 'memory_flip' | 'combo_speed' | 'antagonist_match';
  title: string;
  instruction: string;
  badge: string;
  data: unknown;
}

export const LEVEL_2_CHALLENGES: Level2ChallengeItem[] = [
  {
    id: 'c1',
    type: 'muscle_match',
    title: 'TARGET MUSCULAR',
    instruction: '¿Qué ejercicio aísla de forma focalizada los CUÁDRICEPS?',
    badge: 'ANATOMÍA PRÁCTICA',
    data: {
      options: [
        { label: 'Sillón de Extensiones de Pierna', correct: true, icon: 'Flame' },
        { label: 'Remo con Barra al Pecho', correct: false, icon: 'Dumbbell' },
        { label: 'Vuelos Laterales con Mancuerna', correct: false, icon: 'Activity' },
        { label: 'Curl Femoral Tumbado', correct: false, icon: 'Shield' }
      ]
    }
  },
  {
    id: 'c2',
    type: 'equipment_id',
    title: 'RECONOCIMIENTO DE HIERROS',
    instruction: 'Identifica la herramienta: Pesa esférica de hierro fundido con un asa superior para balanceos (kettlebell swings):',
    badge: 'EQUIPAMIENTO',
    data: {
      equipmentName: 'Kettlebell (Pesa Rusa)',
      options: [
        { label: 'Kettlebell (Pesa Rusa)', correct: true, hint: 'Base esférica con asa integrada' },
        { label: 'Barra Hexagonal (Trap Bar)', correct: false, hint: 'Estructura hexagonal con agarre neutro' },
        { label: 'Mancuerna Hexagonal tradicional', correct: false, hint: 'Dos cabezas y agarre central corto' },
        { label: 'Disco Bumper de competición', correct: false, hint: 'Disco redondo de caucho macizo' }
      ]
    }
  },
  {
    id: 'c3',
    type: 'memory_flip',
    title: 'MEMORIA DE ACERO GORILLA',
    instruction: '¡Encuentra las 3 parejas de elementos esenciales del gimnasio!',
    badge: 'MEMORIA & VELOCIDAD',
    data: {
      pairs: [
        { key: 'disco', name: 'Disco 20KG Olímpico', icon: 'Disc' },
        { key: 'proteina', name: 'Shaker de Proteína Whey', icon: 'CupSoda' },
        { key: 'cinturon', name: 'Cinturón Lumbar de Fuerza', icon: 'Award' }
      ]
    }
  },
  {
    id: 'c4',
    type: 'combo_speed',
    title: 'SECUENCIA DEL GORILA ALFA',
    instruction: 'Toca los ejercicios en el orden exacto de calentamiento a levantamiento pesado:',
    badge: 'VELOCIDAD MOTRIZ',
    data: {
      steps: [
        { step: 1, label: '1. Movilidad y activación articular' },
        { step: 2, label: '2. Series de aproximación con barra vacía' },
        { step: 3, label: '3. Serie efectiva pesada al 85% RM' },
        { step: 4, label: '4. Vuelta a la calma y estiramientos' }
      ]
    }
  },
  {
    id: 'c5',
    type: 'antagonist_match',
    title: 'BIOMECÁNICA: ANTAGONISTAS',
    instruction: '¿Cuál es el músculo ANTAGONISTA directo del TRÍCEPS braquial durante la flexión/extensión del brazo?',
    badge: 'CONEXIÓN MENTE-MÚSCULO',
    data: {
      options: [
        { label: 'Bíceps Braquial', correct: true, detail: 'Flexiona el codo mientras el tríceps lo extiende' },
        { label: 'Deltoides Anterior', correct: false, detail: 'Eleva el hombro hacia adelante' },
        { label: 'Pectoral Mayor', correct: false, detail: 'Aduce y rota internamente el húmero' },
        { label: 'Sóleo', correct: false, detail: 'Músculo del tren inferior (pantorrilla)' }
      ]
    }
  }
];

export const LEVEL_3_QUESTIONS: Question[] = [
  {
    id: 'l3-1',
    question: 'En el principio de Sobrecarga Progresiva, ¿cuál de las siguientes opciones representa una progresión real y medible?',
    options: [
      'Aumentar la carga o las repeticiones con idéntica y estricta técnica biomecánica',
      'Acortar el rango de recorrido (hacer trampas) para mover más kilos',
      'Cambiar todos los ejercicios en cada sesión sin registrar pesos ni volumen',
      'Descansar 20 minutos entre cada serie mirando el teléfono'
    ],
    correctIndex: 0,
    explanation: 'La sobrecarga progresiva exige someter al músculo a un estímulo mayor a lo largo del tiempo manteniendo técnica y rango completos.',
    category: 'technique'
  },
  {
    id: 'l3-2',
    question: '¿Qué significa la sigla RIR en la autorregulación del entrenamiento de hipertrofia y fuerza?',
    options: [
      'Repetitions In Reserve (Repeticiones en Reserva antes del fallo muscular)',
      'Running In Room (Correr en la sala de pesas)',
      'Rapid Intensity Ratio (Índice de velocidad de descanso)',
      'Rotational Internal Resistance (Resistencia rotatoria interna)'
    ],
    correctIndex: 0,
    explanation: 'RIR indica cuántas repeticiones teóricas te quedaban antes de llegar al fallo concéntrico (ej: RIR 1 = a una sola repetición del fallo).',
    category: 'technique'
  },
  {
    id: 'l3-3',
    question: 'En biomecánica, ¿en qué fase de la contracción muscular se genera mayor daño microestructural y mayor tensión pasiva?',
    options: [
      'Fase Excéntrica (alargamiento del músculo bajo tensión)',
      'Fase Concéntrica (acortamiento activo del músculo)',
      'Fase Isométrica pasiva sin carga',
      'Durante el calentamiento en la bicicleta fija'
    ],
    correctIndex: 0,
    explanation: 'La fase excéntrica controlada recluta titina y genera alta tensión mecánica, siendo un potente gatillo para la hipertrofia muscular.',
    category: 'anatomy'
  },
  {
    id: 'l3-4',
    question: '¿Cuál es el aminoácido ramificado (BCAA) más determinante para disparar la vía mTOR e iniciar la síntesis proteica muscular?',
    options: [
      'L-Leucina',
      'Glicina',
      'Prolina',
      'Triptófano'
    ],
    correctIndex: 0,
    explanation: 'La leucina actúa como el interruptor molecular que enciende el complejo mTORC1, requiriendo un umbral de ~2.5g a 3g por comida.',
    category: 'nutrition'
  },
  {
    id: 'l3-5',
    question: '¿En qué consiste la técnica avanzada de alta intensidad conocida como "Drop Set" o serie descendente?',
    options: [
      'Llegar al fallo, reducir de inmediato la carga en un 20-30% sin descanso y continuar haciendo repeticiones',
      'Soltar la barra al suelo ruidosamente para llamar la atención',
      'Realizar 1 repetición máxima y descansar 10 minutos',
      'Entrenar únicamente en ayunas durante 24 horas'
    ],
    correctIndex: 0,
    explanation: 'El drop set recluta el remanente de unidades motoras fatigadas reduciendo el peso de golpe para extender la serie más allá del fallo inicial.',
    category: 'technique'
  },
  {
    id: 'l3-6',
    question: '¿Cuál es la función biomecánica primaria del músculo Dorsal Ancho respecto a la articulación glenohumeral?',
    options: [
      'Extensión, aducción y rotación interna del brazo/húmero',
      'Flexión completa de la rodilla y tobillo',
      'Elevación escapular exclusiva sin acción en el húmero',
      'Extensión del cuello hacia atrás'
    ],
    correctIndex: 0,
    explanation: 'El gran dorsal es un potente aductor y extensor del brazo, traccionándolo hacia la línea media y hacia atrás.',
    category: 'anatomy'
  }
];

export const INITIAL_LEADERBOARD: GameRecord[] = [
  {
    id: 'seed-1',
    participantId: 'p-1',
    dni: '38112233',
    name: 'Matías Gómez',
    nickname: 'El Toro',
    level1Score: 50,
    level2Score: 115,
    level3Score: 175,
    speedBonus: 15,
    streakBonus: 30,
    totalScore: 340,
    duration: 78,
    attemptNumber: 1,
    status: 'completado',
    completedAt: '2026-10-28T18:45:00.000Z'
  },
  {
    id: 'seed-2',
    participantId: 'p-2',
    dni: '40223344',
    name: 'Valeria Ramos',
    nickname: 'Titán',
    level1Score: 50,
    level2Score: 110,
    level3Score: 165,
    speedBonus: 10,
    streakBonus: 30,
    totalScore: 325,
    duration: 84,
    attemptNumber: 1,
    status: 'completado',
    completedAt: '2026-10-29T14:20:00.000Z'
  },
  {
    id: 'seed-3',
    participantId: 'p-3',
    dni: '39445566',
    name: 'Franco Romero',
    nickname: 'La Bestia',
    level1Score: 50,
    level2Score: 105,
    level3Score: 150,
    speedBonus: 5,
    streakBonus: 0,
    totalScore: 305,
    duration: 92,
    attemptNumber: 1,
    status: 'completado',
    completedAt: '2026-10-30T10:15:00.000Z'
  },
  {
    id: 'seed-4',
    participantId: 'p-4',
    dni: '42334455',
    name: 'Camila Benítez',
    nickname: 'Iron Girl',
    level1Score: 40,
    level2Score: 100,
    level3Score: 150,
    speedBonus: 0,
    streakBonus: 0,
    totalScore: 290,
    duration: 105,
    attemptNumber: 1,
    status: 'completado',
    completedAt: '2026-10-27T19:30:00.000Z'
  },
  {
    id: 'seed-5',
    participantId: 'p-5',
    dni: '37556677',
    name: 'Lucas Navarro',
    nickname: 'Kong',
    level1Score: 40,
    level2Score: 90,
    level3Score: 130,
    speedBonus: 0,
    streakBonus: 0,
    totalScore: 260,
    duration: 118,
    attemptNumber: 1,
    status: 'completado',
    completedAt: '2026-10-26T20:10:00.000Z'
  }
];

export const DEFAULT_ADMIN_CONFIG: GameSettings = {
  maxAttempts: 3,
  unlimitedAttempts: false,
  competitionEnabled: true,
  competitionTitle: 'GORILLAZ GYM - THE CHAMPION CHALLENGE',
  startDate: '2026-10-20',
  endDate: '2026-11-20',
  prizeTitle: 'PROTEÍNA WHEY 100% GOLD STANDARD 2 LBS',
  prizeSubtitle: '¡El mejor puntaje acumulado de los 3 niveles se lleva el pote de proteína y la gloria eterna!',
  gymLocation: 'Sede Central - GORILLAZ GYM',
  adminPasscode: 'GORILLA2025'
};
