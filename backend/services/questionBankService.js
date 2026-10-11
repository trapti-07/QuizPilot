const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

// Comprehensive verified question pool covering key board exam subjects & chapters
const VERIFIED_QUESTIONS = [
  // --- PHYSICS ---
  {
    subject: 'Physics',
    unit: 'Electrostatics',
    topic: 'Coulomb Law and Electric Fields',
    difficulty: 'Easy',
    question: 'What is the SI unit of electric flux?',
    options: ['N·m²/C', 'N/C', 'N·m/C²', 'C/m²'],
    correctAnswer: 0,
    explanation: 'Electric flux Φ = E · A = (N/C) · m² = N·m²/C (or Volt·meter).'
  },
  {
    subject: 'Physics',
    unit: 'Electrostatics',
    topic: 'Capacitance',
    difficulty: 'Medium',
    question: 'When a dielectric slab of dielectric constant K is inserted between the plates of an isolated charged capacitor, the potential difference across plates:',
    options: ['Increases by a factor of K', 'Decreases by a factor of K', 'Remains unchanged', 'Becomes zero'],
    correctAnswer: 1,
    explanation: 'For an isolated capacitor, charge Q remains constant. Capacitance becomes C\' = K·C, hence V\' = Q / (K·C) = V / K.'
  },
  {
    subject: 'Physics',
    unit: 'Electrostatics',
    topic: 'Gauss Law',
    difficulty: 'Hard',
    question: 'A spherical Gaussian surface encloses a dipole with charges +q and -q. The net electric flux through the surface is:',
    options: ['q / ε₀', '2q / ε₀', 'Zero', 'Dependent on dipole orientation'],
    correctAnswer: 2,
    explanation: 'By Gauss’s Law, net electric flux = Q_enclosed / ε₀. Since the dipole has net charge (+q + (-q)) = 0, the total flux is zero.'
  },
  {
    subject: 'Physics',
    unit: 'Current Electricity',
    topic: 'Ohm Law and Drift Velocity',
    difficulty: 'Easy',
    question: 'Drift velocity of free electrons in a metallic conductor is inversely proportional to:',
    options: ['Electric field', 'Length of the conductor for a given potential difference', 'Relaxation time', 'Electron charge'],
    correctAnswer: 1,
    explanation: 'Drift velocity v_d = eEτ/m = e(V/L)τ/m. For a given applied voltage V, v_d is inversely proportional to length L.'
  },
  {
    subject: 'Physics',
    unit: 'Current Electricity',
    topic: 'Kirchhoff Laws',
    difficulty: 'Medium',
    question: 'Kirchhoff’s second law (junction/loop law for voltage) is a direct consequence of the conservation of:',
    options: ['Electric charge', 'Energy', 'Linear momentum', 'Angular momentum'],
    correctAnswer: 1,
    explanation: 'Kirchhoff\'s Loop Rule (KVL) states that the sum of potential changes around any closed loop is zero, representing conservation of energy.'
  },
  {
    subject: 'Physics',
    unit: 'Current Electricity',
    topic: 'Wheatstone Bridge',
    difficulty: 'Hard',
    question: 'In a balanced Wheatstone bridge, if the galvanometer and cell positions are interchanged, the balance condition:',
    options: ['Is disturbed and cannot be restored', 'Remains unchanged', 'Becomes inversely proportional', 'Shifts to maximum deflection'],
    correctAnswer: 1,
    explanation: 'Interchanging the galvanometer and battery in a balanced bridge leaves the balance condition (P/Q = R/S) mathematically unchanged.'
  },
  {
    subject: 'Physics',
    unit: 'Optics',
    topic: 'Wave Optics',
    difficulty: 'Easy',
    question: 'Which phenomenon definitively demonstrates the transverse nature of electromagnetic light waves?',
    options: ['Interference', 'Diffraction', 'Polarization', 'Refraction'],
    correctAnswer: 2,
    explanation: 'Only transverse waves can undergo polarization. Longitudinal waves cannot be polarized.'
  },
  {
    subject: 'Physics',
    unit: 'Optics',
    topic: 'Ray Optics',
    difficulty: 'Medium',
    question: 'When light travels from glass (n = 1.5) to water (n = 1.33), the critical angle θc is equal to:',
    options: ['sin⁻¹(1.5 / 1.33)', 'sin⁻¹(1.33 / 1.5)', 'cos⁻¹(1.33 / 1.5)', 'tan⁻¹(1.5 / 1.33)'],
    correctAnswer: 1,
    explanation: 'Critical angle is given by sin(θc) = n_rarer / n_denser = 1.33 / 1.5.'
  },
  {
    subject: 'Physics',
    unit: 'Modern Physics',
    topic: 'Photoelectric Effect',
    difficulty: 'Medium',
    question: 'In Einstein\'s photoelectric equation, the maximum kinetic energy of emitted photoelectrons depends on:',
    options: ['Intensity of incident radiation only', 'Frequency of incident radiation and work function', 'Distance between source and cathode', 'Surface area of cathode'],
    correctAnswer: 1,
    explanation: 'K_max = hν - Φ₀. It depends linearly on the incident frequency ν and the target metal’s work function Φ₀.'
  },
  {
    subject: 'Physics',
    unit: 'Modern Physics',
    topic: 'Semiconductor Electronics',
    difficulty: 'Hard',
    question: 'In an unbiased p-n junction diode at thermal equilibrium, the width of the depletion layer increases when:',
    options: ['Forward bias is applied', 'Reverse bias is applied', 'Doping concentration is heavily increased', 'Temperature decreases to absolute zero'],
    correctAnswer: 1,
    explanation: 'In reverse bias, external voltage aids the built-in electric field, pulling majority carriers away and widening the depletion region.'
  },

  // --- CHEMISTRY ---
  {
    subject: 'Chemistry',
    unit: 'Solutions',
    topic: 'Colligative Properties',
    difficulty: 'Easy',
    question: 'Which of the following colligative properties is most commonly used for determining molar masses of polymers and biomolecules?',
    options: ['Relative lowering of vapor pressure', 'Elevation in boiling point', 'Depression in freezing point', 'Osmotic pressure'],
    correctAnswer: 3,
    explanation: 'Osmotic pressure measurements are conducted at room temperature and have significant measurable magnitudes even at very low molar concentrations.'
  },
  {
    subject: 'Chemistry',
    unit: 'Solutions',
    topic: 'Raoult Law and Ideal Solutions',
    difficulty: 'Medium',
    question: 'A mixture of ethanol and acetone exhibits:',
    options: ['Positive deviation from Raoult\'s Law', 'Negative deviation from Raoult\'s Law', 'Ideal solution behavior', 'Maximum boiling azeotrope formation'],
    correctAnswer: 0,
    explanation: 'Acetone molecules disrupt the hydrogen bonding between ethanol molecules, weakening intermolecular attractions and causing positive deviation.'
  },
  {
    subject: 'Chemistry',
    unit: 'Electrochemistry',
    topic: 'Nernst Equation',
    difficulty: 'Medium',
    question: 'According to the Nernst equation, doubling the concentration of ions in the cathode compartment of a standard Daniell cell will:',
    options: ['Decrease cell potential', 'Increase cell potential', 'Keep cell potential identical', 'Double the cell resistance'],
    correctAnswer: 1,
    explanation: 'In a Daniell cell (Zn + Cu²⁺ -> Zn²⁺ + Cu), E_cell = E° - (RT/2F)ln([Zn²⁺]/[Cu²⁺]). Increasing cathode [Cu²⁺] decreases the quotient and increases E_cell.'
  },
  {
    subject: 'Chemistry',
    unit: 'Chemical Kinetics',
    topic: 'Order of Reaction',
    difficulty: 'Easy',
    question: 'The unit of rate constant for a first-order chemical reaction is:',
    options: ['mol·L⁻¹·s⁻¹', 's⁻¹', 'L·mol⁻¹·s⁻¹', 'mol²·L⁻²·s⁻¹'],
    correctAnswer: 1,
    explanation: 'Rate = k [A]¹ => (mol·L⁻¹·s⁻¹) = k · (mol·L⁻¹), giving k = s⁻¹.'
  },
  {
    subject: 'Chemistry',
    unit: 'Chemical Kinetics',
    topic: 'Arrhenius Equation',
    difficulty: 'Hard',
    question: 'If the activation energy of a reaction is zero, the rate constant k is:',
    options: ['Zero at all temperatures', 'Directly equal to frequency factor A and independent of temperature', 'Infinite at all temperatures', 'Exponentially dependent on temperature'],
    correctAnswer: 1,
    explanation: 'From Arrhenius equation k = A·e^(-Ea/RT), when Ea = 0, e^0 = 1, so k = A, which is temperature-independent.'
  },
  {
    subject: 'Chemistry',
    unit: 'Coordination Compounds',
    topic: 'Isomerism and Bonding',
    difficulty: 'Medium',
    question: 'Which of the following ligands is considered an ambidentate ligand?',
    options: ['H₂O', 'NH₃', 'NO₂⁻', 'en (ethylenediamine)'],
    correctAnswer: 2,
    explanation: 'NO₂⁻ can coordinate through either the nitrogen atom (nitro) or oxygen atom (nitrito), making it an ambidentate ligand.'
  },
  {
    subject: 'Chemistry',
    unit: 'Organic Chemistry',
    topic: 'Haloalkanes and Haloarenes',
    difficulty: 'Hard',
    question: 'SN1 reactions proceed with which stereochemical consequence at an asymmetric carbon centre?',
    options: ['Complete inversion of configuration', 'Complete retention of configuration', 'Racemization with partial inversion', 'Retention without rearrangement'],
    correctAnswer: 2,
    explanation: 'SN1 involves a planar carbocation intermediate attacked from both sides, producing racemization typically accompanied by slight inversion.'
  },

  // --- MATHEMATICS ---
  {
    subject: 'Mathematics',
    unit: 'Calculus',
    topic: 'Continuity and Differentiability',
    difficulty: 'Easy',
    question: 'The function f(x) = |x| is at x = 0:',
    options: ['Continuous and differentiable', 'Continuous but not differentiable', 'Discontinuous but differentiable', 'Neither continuous nor differentiable'],
    correctAnswer: 1,
    explanation: 'f(x) = |x| has left derivative -1 and right derivative +1 at x = 0, so it is continuous everywhere but not differentiable at x = 0.'
  },
  {
    subject: 'Mathematics',
    unit: 'Calculus',
    topic: 'Definite Integrals',
    difficulty: 'Medium',
    question: 'The value of the definite integral ∫ from -π/2 to π/2 of sin⁵(x) dx is:',
    options: ['1', '0', 'π/2', '2/5'],
    correctAnswer: 1,
    explanation: 'sin⁵(-x) = -sin⁵(x), so the integrand is an odd function. The integral of any continuous odd function over symmetric interval [-a, a] is zero.'
  },
  {
    subject: 'Mathematics',
    unit: 'Matrices and Determinants',
    topic: 'Properties of Determinants and Inverses',
    difficulty: 'Medium',
    question: 'If A is an invertible square matrix of order 3 and |A| = 4, then |adj(A)| is:',
    options: ['4', '12', '16', '64'],
    correctAnswer: 2,
    explanation: 'For an n x n matrix, |adj(A)| = |A|^(n - 1). Here n = 3, so |adj(A)| = 4^(3 - 1) = 4² = 16.'
  },
  {
    subject: 'Mathematics',
    unit: 'Vectors and 3D Geometry',
    topic: 'Vector Product',
    difficulty: 'Easy',
    question: 'If two non-zero vectors a and b are perpendicular to each other, their scalar product (a · b) equals:',
    options: ['1', '0', '|a||b|', '-1'],
    correctAnswer: 1,
    explanation: 'a · b = |a||b| cos(90°) = 0.'
  },
  {
    subject: 'Mathematics',
    unit: 'Probability',
    topic: 'Bayes Theorem and Conditional Probability',
    difficulty: 'Hard',
    question: 'If P(A) = 0.4, P(B) = 0.8, and P(B|A) = 0.6, what is P(A ∪ B)?',
    options: ['0.96', '0.84', '0.76', '0.64'],
    correctAnswer: 0,
    explanation: 'P(A ∩ B) = P(A) · P(B|A) = 0.4 · 0.6 = 0.24. P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = 0.4 + 0.8 - 0.24 = 0.96.'
  },

  // --- BIOLOGY ---
  {
    subject: 'Biology',
    unit: 'Genetics and Evolution',
    topic: 'Mendelian Genetics',
    difficulty: 'Easy',
    question: 'What is the expected phenotypic ratio in the F2 generation of a typical Mendelian monohybrid cross with complete dominance?',
    options: ['1:2:1', '3:1', '9:3:3:1', '1:1:1:1'],
    correctAnswer: 1,
    explanation: 'The phenotypic ratio is 3 dominant : 1 recessive. The genotypic ratio is 1:2:1.'
  },
  {
    subject: 'Biology',
    unit: 'Genetics and Evolution',
    topic: 'Molecular Basis of Inheritance',
    difficulty: 'Medium',
    question: 'During DNA replication in prokaryotes, RNA primers are removed and replaced with deoxyribonucleotides primarily by:',
    options: ['DNA Polymerase III', 'DNA Polymerase I', 'DNA Ligase', 'RNA Helicase'],
    correctAnswer: 1,
    explanation: 'DNA Polymerase I has 5\' -> 3\' exonuclease activity that excises RNA primers and fills the resulting gaps with DNA nucleotides.'
  },
  {
    subject: 'Biology',
    unit: 'Biotechnology',
    topic: 'Recombinant DNA Technology',
    difficulty: 'Medium',
    question: 'In PCR (Polymerase Chain Reaction), the thermostable enzyme Taq polymerase is isolated from:',
    options: ['Escherichia coli', 'Thermus aquaticus', 'Bacillus thuringiensis', 'Agrobacterium tumefaciens'],
    correctAnswer: 1,
    explanation: 'Taq polymerase is extracted from the thermophilic bacterium Thermus aquaticus, allowing it to withstand 94°C denaturation cycles.'
  },
  {
    subject: 'Biology',
    unit: 'Ecology',
    topic: 'Ecosystems and Energy Flow',
    difficulty: 'Hard',
    question: 'According to Lindeman’s efficiency law, what percentage of energy is transferred from one trophic level to the next higher level?',
    options: ['1%', '10%', '25%', '50%'],
    correctAnswer: 1,
    explanation: 'Only about 10% of the energy available at a trophic level is incorporated into biomass at the next level; the rest is lost as metabolic heat.'
  },

  // --- COMPUTER SCIENCE ---
  {
    subject: 'Computer Science',
    unit: 'Python Data Structures',
    topic: 'Lists, Dictionaries and Tuples',
    difficulty: 'Easy',
    question: 'Which of the following Python data structures is strictly immutable after initialization?',
    options: ['List', 'Dictionary', 'Set', 'Tuple'],
    correctAnswer: 3,
    explanation: 'Tuples in Python cannot be modified (elements cannot be reassigned, added, or deleted) once created.'
  },
  {
    subject: 'Computer Science',
    unit: 'Relational Databases and SQL',
    topic: 'SQL Constraints and Queries',
    difficulty: 'Medium',
    question: 'Which SQL clause is used to filter groups returned by the GROUP BY clause?',
    options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
    correctAnswer: 1,
    explanation: 'HAVING filters aggregate records formed by GROUP BY, whereas WHERE filters individual rows prior to grouping.'
  },
  {
    subject: 'Computer Science',
    unit: 'Computer Networks',
    topic: 'Network Protocols and Topologies',
    difficulty: 'Medium',
    question: 'Which protocol functions at the Transport layer of the OSI model to provide connection-oriented reliable data transmission?',
    options: ['UDP', 'IP', 'TCP', 'HTTP'],
    correctAnswer: 2,
    explanation: 'TCP (Transmission Control Protocol) is connection-oriented, providing reliable byte-stream transfer with error-checking and flow control.'
  },
  {
    subject: 'Computer Science',
    unit: 'Python Data Structures',
    topic: 'Stack and Queue Implementation',
    difficulty: 'Hard',
    question: 'In Python, if a stack is implemented using a list with push as append() and pop as pop(), what is the time complexity of both operations?',
    options: ['O(n)', 'O(log n)', 'O(1) amortized', 'O(n²)'],
    correctAnswer: 2,
    explanation: 'Appending to and popping from the end of a dynamic array in Python takes O(1) amortized time.'
  },

  // --- ENGLISH CORE ---
  {
    subject: 'English Core',
    unit: 'Reading Comprehension',
    topic: 'Inference and Vocabulary',
    difficulty: 'Easy',
    question: 'Which literary device is employed in the phrase "The silence was deafening"?',
    options: ['Metaphor', 'Oxymoron', 'Hyperbole', 'Personification'],
    correctAnswer: 1,
    explanation: 'An oxymoron combines two contradictory terms ("silence" and "deafening") side by side for rhetorical effect.'
  },
  {
    subject: 'English Core',
    unit: 'Writing Skills',
    topic: 'Formal Letter and Notices',
    difficulty: 'Medium',
    question: 'In standard formal CBSE letter writing format, which of the following is the correct order of elements?',
    options: [
      'Sender\'s Address, Date, Receiver\'s Address, Subject, Salutation',
      'Salutation, Date, Sender\'s Address, Receiver\'s Address, Subject',
      'Receiver\'s Address, Sender\'s Address, Date, Salutation, Subject',
      'Subject, Sender\'s Address, Date, Receiver\'s Address, Salutation'
    ],
    correctAnswer: 0,
    explanation: 'Standard formal letters start with Sender’s Address, followed by Date, Receiver’s Designation & Address, Subject line, and formal Salutation.'
  },
  {
    subject: 'English Core',
    unit: 'Grammar and Usage',
    topic: 'Clauses and Reported Speech',
    difficulty: 'Hard',
    question: 'Choose the correct indirect speech for: He said, "I have been writing this revision paper since morning."',
    options: [
      'He said that he was writing this revision paper since morning.',
      'He said that he had been writing that revision paper since morning.',
      'He said that he had wrote that revision paper since morning.',
      'He said that he has been writing that revision paper since morning.'
    ],
    correctAnswer: 1,
    explanation: 'Present perfect continuous ("have been writing") transforms into past perfect continuous ("had been writing"), and "this" transforms to "that".'
  }
];

// Helper to seed database with verified questions if empty
async function seedQuestionBankIfEmpty() {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const count = await QuestionBank.countDocuments();
      if (count === 0) {
        await QuestionBank.insertMany(VERIFIED_QUESTIONS);
        console.log(`[QuestionBank] Seeded ${VERIFIED_QUESTIONS.length} verified questions into DB.`);
      }
    }
  } catch (err) {
    console.warn(`[QuestionBank Seed Warning] ${err.message}`);
  }
}

// Function to fetch or filter matching questions from question bank
async function getQuestionsFromBank({ subject, unit, difficulty, count = 10, topic }) {
  let dbQuestions = [];

  const isDbConnected = mongoose.connection && mongoose.connection.readyState === 1;
  if (isDbConnected) {
    try {
      await seedQuestionBankIfEmpty();

      const query = {};
      if (subject) {
        query.subject = new RegExp(`^${subject}$`, 'i');
      }
      if (unit && unit !== 'All Units' && unit !== 'General') {
        query.unit = new RegExp(unit, 'i');
      }
      if (topic) {
        query.topic = new RegExp(topic, 'i');
      }
      if (difficulty && difficulty !== 'Adaptive') {
        query.difficulty = difficulty;
      }

      dbQuestions = await QuestionBank.find(query).lean();

      // If specific filters yielded fewer than needed, relax difficulty or unit
      if (dbQuestions.length < count) {
        const fallbackQuery = {};
        if (subject) fallbackQuery.subject = new RegExp(`^${subject}$`, 'i');
        const broaderDbQuestions = await QuestionBank.find(fallbackQuery).lean();
        
        const questionMap = new Map();
        dbQuestions.forEach(q => questionMap.set(q.question, q));
        broaderDbQuestions.forEach(q => questionMap.set(q.question, q));
        
        VERIFIED_QUESTIONS
          .filter(q => !subject || q.subject.toLowerCase() === subject.toLowerCase())
          .forEach(q => questionMap.set(q.question, q));

        dbQuestions = Array.from(questionMap.values());
      }
    } catch (err) {
      console.warn(`[QuestionBank Query Warning] Falling back to in-memory pool: ${err.message}`);
    }
  }

  // Fallback to in-memory question bank if DB had 0 or is disconnected
  if (!dbQuestions || dbQuestions.length === 0) {
    dbQuestions = VERIFIED_QUESTIONS.filter(q => !subject || q.subject.toLowerCase() === subject.toLowerCase());
    if (dbQuestions.length === 0) {
      dbQuestions = [...VERIFIED_QUESTIONS];
    }
  }

  // Shuffle array
  const shuffled = [...dbQuestions].sort(() => 0.5 - Math.random());
  
  // Cycle if count exceeds unique items
  const result = [];
  let idx = 0;
  while (result.length < count && shuffled.length > 0) {
    const base = shuffled[idx % shuffled.length];
    result.push({
      question: result.length >= shuffled.length ? `${base.question} (Variation ${Math.floor(result.length / shuffled.length) + 1})` : base.question,
      options: [...base.options],
      correctAnswer: base.correctAnswer,
      explanation: base.explanation,
      topic: base.topic || topic || unit || 'General',
      difficulty: base.difficulty || difficulty || 'Medium'
    });
    idx++;
  }

  return result.slice(0, count);
}

module.exports = {
  VERIFIED_QUESTIONS,
  seedQuestionBankIfEmpty,
  getQuestionsFromBank,
};
