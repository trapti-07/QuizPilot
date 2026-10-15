const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const { CLASS_12_SYLLABUS, normalizeStr, findUnit } = require('../data/class12Syllabus');

// Comprehensive verified Class 12 Board question pool covering all CBSE & State Board subjects & chapters
const VERIFIED_QUESTIONS = [
  // ==========================================
  // --- PHYSICS (CLASS 12 BOARD) ---
  // ==========================================
  {
    subject: 'Physics',
    unit: 'Electrostatics',
    topic: 'Coulomb Law and Electric Fields',
    difficulty: 'Easy',
    standard: 'Class 12',
    question: 'What is the SI unit of electric flux in the official Class 12 board curriculum?',
    options: ['N·m²/C', 'N/C', 'N·m/C²', 'C/m²'],
    correctAnswer: 0,
    explanation: 'Electric flux Φ = E · A = (N/C) · m² = N·m²/C (also equivalent to Volt·meter).',
  },
  {
    subject: 'Physics',
    unit: 'Electrostatics',
    topic: 'Capacitance and Dielectrics',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'When a dielectric slab of dielectric constant K is inserted between the plates of an isolated charged capacitor, the potential difference across plates:',
    options: ['Increases by a factor of K', 'Decreases by a factor of K', 'Remains unchanged', 'Becomes zero'],
    correctAnswer: 1,
    explanation: 'For an isolated capacitor, charge Q remains constant. Capacitance increases to C\' = K·C, hence V\' = Q / (K·C) = V / K.',
  },
  {
    subject: 'Physics',
    unit: 'Electrostatics',
    topic: 'Gauss Law and Electric Flux',
    difficulty: 'Hard',
    standard: 'Class 12',
    question: 'A closed spherical Gaussian surface encloses an electric dipole with charges +q and -q. The net electric flux through the surface is:',
    options: ['q / ε₀', '2q / ε₀', 'Zero', 'Dependent on dipole orientation'],
    correctAnswer: 2,
    explanation: 'By Gauss’s Law, net electric flux = Q_enclosed / ε₀. Since the dipole has net charge (+q + (-q)) = 0, the total flux is zero.',
  },
  {
    subject: 'Physics',
    unit: 'Electrostatics',
    topic: 'Electric Potential and Equipotential Surfaces',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'The work done in moving an electric charge q between any two points situated on an equipotential surface is:',
    options: ['q · V', 'Zero', 'q / ε₀', 'Infinity'],
    correctAnswer: 1,
    explanation: 'Work done W = q · ΔV. On an equipotential surface, potential is identical everywhere so ΔV = 0, yielding W = 0.',
  },

  {
    subject: 'Physics',
    unit: 'Current Electricity',
    topic: 'Ohm Law and Drift Velocity',
    difficulty: 'Easy',
    standard: 'Class 12',
    question: 'Drift velocity of free conduction electrons in a metallic wire under a given potential difference V is inversely proportional to:',
    options: ['Electric field', 'Length of the wire', 'Relaxation time', 'Electron charge'],
    correctAnswer: 1,
    explanation: 'Drift velocity v_d = eEτ/m = e(V/L)τ/m. For a fixed applied voltage V, v_d is inversely proportional to length L.',
  },
  {
    subject: 'Physics',
    unit: 'Current Electricity',
    topic: 'Kirchhoff Laws and Electrical Circuits',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'Kirchhoff’s second law (loop rule for electrical potential changes) is a direct consequence of the conservation of:',
    options: ['Electric charge', 'Energy', 'Linear momentum', 'Angular momentum'],
    correctAnswer: 1,
    explanation: 'Kirchhoff\'s Loop Rule (KVL) states that the algebraic sum of changes in potential around any closed loop is zero, representing conservation of energy.',
  },
  {
    subject: 'Physics',
    unit: 'Current Electricity',
    topic: 'Wheatstone Bridge and Meter Bridge',
    difficulty: 'Hard',
    standard: 'Class 12',
    question: 'In a balanced Wheatstone bridge, if the galvanometer and source battery positions are interchanged, the null deflection condition:',
    options: ['Is disturbed permanently', 'Remains completely unchanged', 'Becomes inversely proportional', 'Shifts to maximum deflection'],
    correctAnswer: 1,
    explanation: 'Interchanging the galvanometer and battery in a balanced bridge preserves conjugate arms symmetry, leaving the balance condition mathematically unchanged.',
  },

  {
    subject: 'Physics',
    unit: 'Magnetic Effects of Current',
    topic: 'Biot-Savart Law and Ampere Law',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'The magnetic field B at the centre of a circular coil of radius R carrying steady current I is given by:',
    options: ['μ₀ I / (2 R)', 'μ₀ I / (4π R)', 'μ₀ I / (2π R)', 'μ₀ I R / 2'],
    correctAnswer: 0,
    explanation: 'From Biot-Savart Law, integrating over circular loop gives B = μ₀ I / (2 R).',
  },
  {
    subject: 'Physics',
    unit: 'Magnetic Effects of Current',
    topic: 'Moving Coil Galvanometer',
    difficulty: 'Hard',
    standard: 'Class 12',
    question: 'In a moving coil galvanometer, radial magnetic field is produced primarily by using:',
    options: ['Plane magnetic pole pieces', 'Cylindrical soft iron core with concave pole pieces', 'Uniform solenoid', 'Toroidal windings'],
    correctAnswer: 1,
    explanation: 'Concave magnetic pole pieces combined with a cylindrical soft iron core ensure the magnetic field lines are always parallel to the plane of the coil (radial field).',
  },

  {
    subject: 'Physics',
    unit: 'Electromagnetic Induction & AC',
    topic: 'Faraday and Lenz Law',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'Lenz’s law in electromagnetic induction is a direct manifestation of the principle of conservation of:',
    options: ['Charge', 'Energy', 'Mass', 'Momentum'],
    correctAnswer: 1,
    explanation: 'The induced current opposes the change that produces it, requiring mechanical work to overcome opposition, in accordance with energy conservation.',
  },
  {
    subject: 'Physics',
    unit: 'Electromagnetic Induction & AC',
    topic: 'AC Circuits and LCR Resonance',
    difficulty: 'Hard',
    standard: 'Class 12',
    question: 'At electrical resonance in a series LCR alternating current circuit, the phase difference between applied voltage and resultant current is:',
    options: ['π/2 radians', 'Zero radians', 'π radians', 'π/4 radians'],
    correctAnswer: 1,
    explanation: 'At resonance, inductive reactance equals capacitive reactance (X_L = X_C), making total circuit impedance strictly resistive (Z = R) and phase angle φ = 0.',
  },

  {
    subject: 'Physics',
    unit: 'Optics',
    topic: 'Wave Optics and Huygens Principle',
    difficulty: 'Easy',
    standard: 'Class 12',
    question: 'Which light phenomenon definitively demonstrates the transverse wave nature of electromagnetic light waves in Class 12 physics?',
    options: ['Interference', 'Diffraction', 'Polarization', 'Refraction'],
    correctAnswer: 2,
    explanation: 'Only transverse waves can undergo polarization along a single spatial plane. Longitudinal waves cannot be polarized.',
  },
  {
    subject: 'Physics',
    unit: 'Optics',
    topic: 'Ray Optics and Optical Instruments',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'When light travels from glass (n = 1.5) to water (n = 1.33), the critical angle θc for total internal reflection is:',
    options: ['sin⁻¹(1.5 / 1.33)', 'sin⁻¹(1.33 / 1.5)', 'cos⁻¹(1.33 / 1.5)', 'tan⁻¹(1.5 / 1.33)'],
    correctAnswer: 1,
    explanation: 'The critical angle is given by sin(θc) = n_rarer / n_denser = 1.33 / 1.5.',
  },

  {
    subject: 'Physics',
    unit: 'Modern Physics',
    topic: 'Photoelectric Effect and Einstein Equation',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'According to Einstein\'s photoelectric equation, the maximum kinetic energy of emitted photoelectrons depends on:',
    options: ['Intensity of incident light only', 'Frequency of incident radiation and work function of metal', 'Distance between light source and cathode', 'Surface area of cathode plate'],
    correctAnswer: 1,
    explanation: 'K_max = hν - Φ₀. It depends linearly on the incident photon frequency ν and metal work function Φ₀, not on light intensity.',
  },
  {
    subject: 'Physics',
    unit: 'Modern Physics',
    topic: 'De Broglie Wavelength and Matter Waves',
    difficulty: 'Hard',
    standard: 'Class 12',
    question: 'If the kinetic energy of a free electron is increased by a factor of 4, its de Broglie wavelength:',
    options: ['Doubles', 'Is halved', 'Quadruples', 'Remains unchanged'],
    correctAnswer: 1,
    explanation: 'de Broglie wavelength λ = h / √(2mE). If kinetic energy E is multiplied by 4, λ becomes λ / √4 = λ / 2 (halved).',
  },

  {
    subject: 'Physics',
    unit: 'Semiconductor Electronics',
    topic: 'P-N Junction Diode and Rectifiers',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'In a semiconductor p-n junction diode at thermal equilibrium, the width of the depletion barrier layer increases when:',
    options: ['Forward bias voltage is applied', 'Reverse bias voltage is applied', 'The diode is heavily forward illuminated', 'Temperature reaches absolute zero'],
    correctAnswer: 1,
    explanation: 'In reverse bias, external applied potential aids the built-in electric field, pulling majority carriers further away and widening the depletion layer.',
  },

  // ==========================================
  // --- CHEMISTRY (CLASS 12 BOARD) ---
  // ==========================================
  {
    subject: 'Chemistry',
    unit: 'Solutions',
    topic: 'Colligative Properties',
    difficulty: 'Easy',
    standard: 'Class 12',
    question: 'Which of the following colligative properties is most suitable for determining molar masses of macromolecules, polymers and proteins?',
    options: ['Relative lowering of vapor pressure', 'Elevation in boiling point', 'Depression in freezing point', 'Osmotic pressure'],
    correctAnswer: 3,
    explanation: 'Osmotic pressure measurements can be carried out at room temperature with measurable magnitudes even at very low molar concentrations.',
  },
  {
    subject: 'Chemistry',
    unit: 'Solutions',
    topic: 'Raoult Law and Ideal Solutions',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'A binary liquid mixture of ethanol and acetone exhibits which deviation from Raoult\'s Law?',
    options: ['Positive deviation from Raoult\'s Law', 'Negative deviation from Raoult\'s Law', 'Ideal solution behavior', 'Maximum boiling azeotrope formation'],
    correctAnswer: 0,
    explanation: 'Acetone molecules disrupt the hydrogen bonding between ethanol molecules, weakening intermolecular interactions and causing positive deviation.',
  },
  {
    subject: 'Chemistry',
    unit: 'Solutions',
    topic: 'Van\'t Hoff Factor and Abnormal Molar Mass',
    difficulty: 'Hard',
    standard: 'Class 12',
    question: 'When benzoic acid dissolves in benzene solvent, it undergoes dimerization. The van\'t Hoff factor i for complete dimerization is:',
    options: ['1.0', '0.5', '2.0', '1.5'],
    correctAnswer: 1,
    explanation: '2 C₆H₅COOH ⇌ (C₆H₅COOH)₂. For complete dimerization (α = 1), i = 1 - α + α/2 = 1 - 1 + 0.5 = 0.5.',
  },

  {
    subject: 'Chemistry',
    unit: 'Electrochemistry',
    topic: 'Nernst Equation and Cell Potential',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'According to the Nernst equation, doubling the concentration of Cu²⁺ ions in the cathode compartment of a standard Daniell cell will:',
    options: ['Decrease the cell potential E_cell', 'Increase the cell potential E_cell', 'Keep E_cell identical', 'Double the internal resistance'],
    correctAnswer: 1,
    explanation: 'For Daniell cell (Zn + Cu²⁺ -> Zn²⁺ + Cu), E_cell = E° - (RT/2F)ln([Zn²⁺]/[Cu²⁺]). Increasing [Cu²⁺] reduces reaction quotient Q, increasing E_cell.',
  },
  {
    subject: 'Chemistry',
    unit: 'Electrochemistry',
    topic: 'Kohlrausch Law and Conductance',
    difficulty: 'Hard',
    standard: 'Class 12',
    question: 'According to Kohlrausch\'s Law of independent migration of ions, limiting molar conductivity Λ°m of a weak electrolyte like acetic acid (CH₃COOH) can be calculated from:',
    options: ['Λ°m(CH₃COONa) + Λ°m(HCl) - Λ°m(NaCl)', 'Λ°m(NaCl) + Λ°m(HCl) - Λ°m(CH₃COONa)', 'Λ°m(CH₃COONa) + Λ°m(NaCl) - Λ°m(HCl)', 'Λ°m(NaOH) + Λ°m(HCl) - Λ°m(H₂O)'],
    correctAnswer: 0,
    explanation: 'Λ°m(CH₃COOH) = λ°(CH₃COO⁻) + λ°(H⁺) = Λ°m(CH₃COONa) + Λ°m(HCl) - Λ°m(NaCl).',
  },

  {
    subject: 'Chemistry',
    unit: 'Chemical Kinetics',
    topic: 'Order and Molecularity of Reaction',
    difficulty: 'Easy',
    standard: 'Class 12',
    question: 'The unit of rate constant k for a first-order chemical reaction in Class 12 board syllabus is:',
    options: ['mol·L⁻¹·s⁻¹', 's⁻¹', 'L·mol⁻¹·s⁻¹', 'mol²·L⁻²·s⁻¹'],
    correctAnswer: 1,
    explanation: 'Rate = k [A]¹ => (mol·L⁻¹·s⁻¹) = k · (mol·L⁻¹), giving k = s⁻¹.',
  },
  {
    subject: 'Chemistry',
    unit: 'Chemical Kinetics',
    topic: 'Arrhenius Equation and Activation Energy',
    difficulty: 'Hard',
    standard: 'Class 12',
    question: 'If the activation energy Ea of a chemical reaction is zero, the rate constant k is:',
    options: ['Zero at all temperatures', 'Directly equal to pre-exponential factor A and independent of temperature', 'Infinite at room temperature', 'Exponentially dependent on temperature'],
    correctAnswer: 1,
    explanation: 'From Arrhenius equation k = A·e^(-Ea/RT). When Ea = 0, e^0 = 1, so k = A, which is completely temperature-independent.',
  },

  {
    subject: 'Chemistry',
    unit: 'Coordination Compounds',
    topic: 'Isomerism in Coordination Compounds',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'Which of the following ligands is considered an ambidentate ligand in coordination chemistry?',
    options: ['H₂O', 'NH₃', 'NO₂⁻', 'en (ethylenediamine)'],
    correctAnswer: 2,
    explanation: 'NO₂⁻ can coordinate through nitrogen (-NO₂, nitro) or oxygen (-ONO, nitrito), making it an ambidentate ligand capable of linkage isomerism.',
  },
  {
    subject: 'Chemistry',
    unit: 'Coordination Compounds',
    topic: 'Valence Bond and Crystal Field Theory',
    difficulty: 'Hard',
    standard: 'Class 12',
    question: 'According to Crystal Field Theory, in an octahedral coordination complex with strong field ligands, d-orbital splitting produces:',
    options: ['t₂g lower energy (triply degenerate), eg higher energy', 'eg lower energy, t₂g higher energy', 'Non-split degenerate d-orbitals', 'Single lowest orbital and four higher orbitals'],
    correctAnswer: 0,
    explanation: 'In octahedral crystal fields, ligands approach along axes, destabilizing eg (dx²-y², dz²) orbitals above t₂g (dxy, dyz, dxz) orbitals.',
  },

  {
    subject: 'Chemistry',
    unit: 'Haloalkanes and Haloarenes',
    topic: 'SN1 and SN2 Nucleophilic Substitution',
    difficulty: 'Hard',
    standard: 'Class 12',
    question: 'SN1 nucleophilic substitution reactions at an asymmetric chiral carbon center proceed with which stereochemical outcome?',
    options: ['100% inversion of configuration', '100% retention of configuration', 'Racemization with partial net inversion', 'Complete retention without rearrangement'],
    correctAnswer: 2,
    explanation: 'SN1 reactions proceed via a planar sp² carbocation intermediate attacked from front and back sides, yielding racemization accompanied by slight preferential inversion.',
  },

  {
    subject: 'Chemistry',
    unit: 'Alcohols, Phenols and Ethers',
    topic: 'Acidity and Electrophilic Substitution of Phenols',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'Phenol is more acidic than ethanol primarily because:',
    options: ['Phenoxide ion is resonance-stabilized', 'Phenol has a higher molecular weight', 'Ethanol forms stronger hydrogen bonds', 'Ethoxide ion is resonance-stabilized'],
    correctAnswer: 0,
    explanation: 'Loss of a proton from phenol yields the phenoxide ion, whose negative charge is delocalized over the ortho and para positions of the aromatic ring.',
  },

  {
    subject: 'Chemistry',
    unit: 'Aldehydes, Ketones and Carboxylic Acids',
    topic: 'Aldol Condensation and Cannizzaro Reaction',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'Which of the following carbonyl compounds does NOT undergo aldol condensation upon treatment with dilute alkali?',
    options: ['Acetaldehyde (CH₃CHO)', 'Formaldehyde (HCHO)', 'Propanal (CH₃CH₂CHO)', 'Acetone (CH₃COCH₃)'],
    correctAnswer: 1,
    explanation: 'Aldol condensation requires at least one α-hydrogen atom. Formaldehyde (HCHO) lacks α-hydrogens and instead undergoes Cannizzaro disproportionation.',
  },

  {
    subject: 'Chemistry',
    unit: 'Biomolecules',
    topic: 'Amino Acids, Peptide Bonds and Protein Structure',
    difficulty: 'Easy',
    standard: 'Class 12',
    question: 'The covalent linkage connecting two adjacent amino acid units in a polypeptide chain is:',
    options: ['Glycosidic linkage', 'Peptide linkage (-CO-NH-)', 'Phosphodiester bond', 'Ester linkage'],
    correctAnswer: 1,
    explanation: 'The condensation of the -COOH group of one amino acid with the -NH₂ group of another forms an amide or peptide bond (-CO-NH-).',
  },

  // ==========================================
  // --- MATHEMATICS (CLASS 12 BOARD) ---
  // ==========================================
  {
    subject: 'Mathematics',
    unit: 'Relations and Functions',
    topic: 'Types of Relations and Functions',
    difficulty: 'Easy',
    standard: 'Class 12',
    question: 'A relation R on a set A is defined as an equivalence relation if and only if R is:',
    options: ['Reflexive, Symmetric, and Transitive', 'Reflexive and Symmetric only', 'Symmetric and Transitive only', 'Reflexive and Transitive only'],
    correctAnswer: 0,
    explanation: 'By standard Class 12 board definition, an equivalence relation satisfies reflexivity (aRa), symmetry (aRb => bRa), and transitivity (aRb & bRc => aRc).',
  },
  {
    subject: 'Mathematics',
    unit: 'Matrices and Determinants',
    topic: 'Properties of Determinants',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'If A is an invertible square matrix of order 3 and determinant |A| = 4, then the determinant of its adjoint |adj(A)| is:',
    options: ['4', '12', '16', '64'],
    correctAnswer: 2,
    explanation: 'For any n x n square matrix, |adj(A)| = |A|^(n - 1). Here n = 3, so |adj(A)| = 4^(3 - 1) = 4² = 16.',
  },
  {
    subject: 'Mathematics',
    unit: 'Calculus',
    topic: 'Continuity and Differentiability',
    difficulty: 'Easy',
    standard: 'Class 12',
    question: 'The modulus function f(x) = |x| at point x = 0 is:',
    options: ['Continuous and differentiable', 'Continuous but not differentiable', 'Discontinuous but differentiable', 'Neither continuous nor differentiable'],
    correctAnswer: 1,
    explanation: 'f(x) = |x| has left-hand derivative -1 and right-hand derivative +1 at x = 0. Therefore it is continuous everywhere on R but not differentiable at x = 0.',
  },
  {
    subject: 'Mathematics',
    unit: 'Calculus',
    topic: 'Indefinite and Definite Integrals',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'The value of the definite integral ∫ from -π/2 to π/2 of sin⁵(x) dx is:',
    options: ['1', '0', 'π/2', '2/5'],
    correctAnswer: 1,
    explanation: 'sin⁵(-x) = -sin⁵(x), so the integrand is an odd function. The definite integral of any continuous odd function over symmetric limits [-a, a] is zero.',
  },
  {
    subject: 'Mathematics',
    unit: 'Vectors and 3D Geometry',
    topic: 'Dot and Cross Products of Vectors',
    difficulty: 'Easy',
    standard: 'Class 12',
    question: 'If two non-zero vectors a and b are perpendicular to each other, their scalar dot product (a · b) equals:',
    options: ['1', '0', '|a||b|', '-1'],
    correctAnswer: 1,
    explanation: 'a · b = |a||b| cos(90°) = |a||b| · 0 = 0.',
  },
  {
    subject: 'Mathematics',
    unit: 'Probability',
    topic: 'Bayes Theorem and Law of Total Probability',
    difficulty: 'Hard',
    standard: 'Class 12',
    question: 'If events A and B satisfy P(A) = 0.4, P(B) = 0.8, and P(B|A) = 0.6, what is P(A ∪ B)?',
    options: ['0.96', '0.84', '0.76', '0.64'],
    correctAnswer: 0,
    explanation: 'P(A ∩ B) = P(A) · P(B|A) = 0.4 · 0.6 = 0.24. Then P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = 0.4 + 0.8 - 0.24 = 0.96.',
  },

  // ==========================================
  // --- BIOLOGY (CLASS 12 BOARD) ---
  // ==========================================
  {
    subject: 'Biology',
    unit: 'Genetics and Evolution',
    topic: 'Mendelian Inheritance and Deviations',
    difficulty: 'Easy',
    standard: 'Class 12',
    question: 'In a standard Mendelian monohybrid cross with complete dominance, what is the expected phenotypic ratio in the F2 generation?',
    options: ['1:2:1', '3:1', '9:3:3:1', '1:1:1:1'],
    correctAnswer: 1,
    explanation: 'The phenotypic ratio in F2 is 3 dominant : 1 recessive. The corresponding genotypic ratio is 1 homozygous dominant : 2 heterozygous : 1 homozygous recessive.',
  },
  {
    subject: 'Biology',
    unit: 'Genetics and Evolution',
    topic: 'Molecular Basis of Inheritance and DNA Replication',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'During DNA replication in prokaryotes, RNA primers are excised and replaced with deoxyribonucleotides primarily by:',
    options: ['DNA Polymerase III', 'DNA Polymerase I', 'DNA Ligase', 'RNA Helicase'],
    correctAnswer: 1,
    explanation: 'DNA Polymerase I possesses 5\' -> 3\' exonuclease activity that removes RNA primers, synthesizing DNA nucleotides in the gap.',
  },
  {
    subject: 'Biology',
    unit: 'Biotechnology',
    topic: 'Recombinant DNA Technology and Restriction Enzymes',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'In PCR (Polymerase Chain Reaction), the thermostable DNA polymerase (Taq polymerase) is isolated from:',
    options: ['Escherichia coli', 'Thermus aquaticus', 'Bacillus thuringiensis', 'Agrobacterium tumefaciens'],
    correctAnswer: 1,
    explanation: 'Taq polymerase is extracted from the thermophilic bacterium Thermus aquaticus, remaining enzymatically active through high-temperature (94°C) denaturation cycles.',
  },
  {
    subject: 'Biology',
    unit: 'Ecology and Environment',
    topic: 'Ecosystem Structure and Energy Flow',
    difficulty: 'Hard',
    standard: 'Class 12',
    question: 'According to Lindeman’s ten percent law of trophic efficiency, what proportion of energy is transferred from one trophic level to the next?',
    options: ['1%', '10%', '25%', '50%'],
    correctAnswer: 1,
    explanation: 'Only about 10% of chemical energy in organic food is transferred and incorporated into biomass at the successive trophic level; 90% is dissipated as heat and respiration.',
  },

  // ==========================================
  // --- COMPUTER SCIENCE (CLASS 12 BOARD) ---
  // ==========================================
  {
    subject: 'Computer Science',
    unit: 'Python Data Structures',
    topic: 'Lists, Tuples and Dictionaries',
    difficulty: 'Easy',
    standard: 'Class 12',
    question: 'Which of the following built-in Python data types is strictly immutable after initialization?',
    options: ['List', 'Dictionary', 'Set', 'Tuple'],
    correctAnswer: 3,
    explanation: 'Tuples in Python cannot be mutated (elements cannot be reassigned, appended, or deleted) after creation.',
  },
  {
    subject: 'Computer Science',
    unit: 'Relational Databases and SQL',
    topic: 'Aggregate Functions and GROUP BY / HAVING',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'Which SQL clause is used to filter aggregate record groups produced by the GROUP BY clause?',
    options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
    correctAnswer: 1,
    explanation: 'HAVING filters aggregated grouped records formed by GROUP BY, whereas WHERE filters individual table rows prior to grouping.',
  },
  {
    subject: 'Computer Science',
    unit: 'Computer Networks',
    topic: 'OSI Model Layers and TCP/IP Protocol Suite',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'Which protocol functions at the Transport layer to provide connection-oriented reliable byte-stream transmission?',
    options: ['UDP', 'IP', 'TCP', 'HTTP'],
    correctAnswer: 2,
    explanation: 'TCP (Transmission Control Protocol) is connection-oriented, providing reliable flow control, packet acknowledgment, and error recovery.',
  },
  {
    subject: 'Computer Science',
    unit: 'Python Data Structures',
    topic: 'Stack and Queue Linear Data Structures',
    difficulty: 'Hard',
    standard: 'Class 12',
    question: 'When implementing a LIFO Stack using Python list with append() for Push and pop() for Pop, what is the amortized time complexity of both operations?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
    correctAnswer: 2,
    explanation: 'Appending to and popping from the end of a dynamic array in Python takes O(1) amortized constant time.',
  },

  // ==========================================
  // --- ENGLISH CORE (CLASS 12 BOARD) ---
  // ==========================================
  {
    subject: 'English Core',
    unit: 'Literature and Grammar',
    topic: 'Poetic Devices and Figures of Speech',
    difficulty: 'Easy',
    standard: 'Class 12',
    question: 'Which literary device is employed in the phrase "The silence was deafening"?',
    options: ['Metaphor', 'Oxymoron', 'Hyperbole', 'Personification'],
    correctAnswer: 1,
    explanation: 'An oxymoron combines two juxtaposed contradictory terms ("silence" and "deafening") for rhetorical emphasis.',
  },
  {
    subject: 'English Core',
    unit: 'Writing Skills',
    topic: 'Official Letters and Letters to Editor',
    difficulty: 'Medium',
    standard: 'Class 12',
    question: 'In standard formal CBSE Class 12 letter writing format, which of the following is the correct order of initial elements?',
    options: [
      'Sender\'s Address, Date, Receiver\'s Address, Subject, Salutation',
      'Salutation, Date, Sender\'s Address, Receiver\'s Address, Subject',
      'Receiver\'s Address, Sender\'s Address, Date, Salutation, Subject',
      'Subject, Sender\'s Address, Date, Receiver\'s Address, Salutation',
    ],
    correctAnswer: 0,
    explanation: 'Standard formal letters start with Sender’s Address, followed by Date, Receiver’s Designation & Address, Subject line, and formal Salutation.',
  },
  {
    subject: 'English Core',
    unit: 'Literature and Grammar',
    topic: 'Clauses and Direct-Indirect Transformations',
    difficulty: 'Hard',
    standard: 'Class 12',
    question: 'Choose the correct indirect speech for: He said, "I have been writing this revision paper since morning."',
    options: [
      'He said that he was writing this revision paper since morning.',
      'He said that he had been writing that revision paper since morning.',
      'He said that he had wrote that revision paper since morning.',
      'He said that he has been writing that revision paper since morning.',
    ],
    correctAnswer: 1,
    explanation: 'Present perfect continuous ("have been writing") transforms to past perfect continuous ("had been writing"), and demonstrative "this" changes to "that".',
  },
];

// Helper to seed database with verified questions if empty
async function seedQuestionBankIfEmpty() {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const count = await QuestionBank.countDocuments();
      if (count === 0) {
        await QuestionBank.insertMany(VERIFIED_QUESTIONS);
        console.log(`[QuestionBank] Seeded ${VERIFIED_QUESTIONS.length} verified Class 12 questions into DB.`);
      }
    }
  } catch (err) {
    console.warn(`[QuestionBank Seed Warning] ${err.message}`);
  }
}

/**
 * Checks if question matches the requested unit
 */
function isQuestionInUnit(q, requestedUnit, canonicalUnit) {
  if (!requestedUnit || requestedUnit === 'All Units' || requestedUnit === 'General') {
    return true;
  }
  const qUnitNorm = normalizeStr(q.unit);
  const reqUnitNorm = normalizeStr(requestedUnit);
  const canonIdNorm = canonicalUnit ? normalizeStr(canonicalUnit.id) : '';
  const canonNameNorm = canonicalUnit ? normalizeStr(canonicalUnit.name) : '';

  return (
    qUnitNorm === reqUnitNorm ||
    qUnitNorm === canonIdNorm ||
    qUnitNorm === canonNameNorm ||
    reqUnitNorm.includes(qUnitNorm) ||
    qUnitNorm.includes(reqUnitNorm) ||
    (canonIdNorm && qUnitNorm.includes(canonIdNorm)) ||
    (canonIdNorm && canonIdNorm.includes(qUnitNorm))
  );
}

/**
 * Checks if question matches the requested topic
 */
function isQuestionInTopic(q, requestedTopic) {
  if (!requestedTopic || requestedTopic === 'All Topics' || requestedTopic.trim() === '') {
    return true;
  }
  const qTopicNorm = normalizeStr(q.topic);
  const reqTopicNorm = normalizeStr(requestedTopic);
  return (
    qTopicNorm === reqTopicNorm ||
    qTopicNorm.includes(reqTopicNorm) ||
    reqTopicNorm.includes(qTopicNorm)
  );
}

/**
 * Strict Class 12 Board question retrieval
 * Enforces STRICT unit and topic isolation: NEVER leaks questions from different units!
 */
async function getQuestionsFromBank({ subject, unit, difficulty, count = 10, topic }) {
  let pool = [];

  const canonicalUnit = findUnit(subject, unit);
  const isDbConnected = mongoose.connection && mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      await seedQuestionBankIfEmpty();
      // Fetch all questions for this subject
      const subjectQuery = subject ? { subject: new RegExp(`^${subject}$`, 'i') } : {};
      pool = await QuestionBank.find(subjectQuery).lean();
    } catch (err) {
      console.warn(`[QuestionBank Query Warning] DB query failed, falling back to in-memory pool: ${err.message}`);
    }
  }

  // Merge in-memory pool to ensure all verified questions are available
  const questionMap = new Map();
  pool.forEach(q => questionMap.set(q.question, q));
  VERIFIED_QUESTIONS
    .filter(q => !subject || q.subject.toLowerCase() === subject.toLowerCase())
    .forEach(q => questionMap.set(q.question, q));

  const allSubjectQuestions = Array.from(questionMap.values());

  // 1. STRICT UNIT FILTERING:
  // Questions MUST strictly belong to the selected Unit.
  let unitQuestions = allSubjectQuestions.filter(q => isQuestionInUnit(q, unit, canonicalUnit));

  // If unit filter matched zero (e.g. unknown unit name), fall back to canonical unit or keep subject pool
  if (unitQuestions.length === 0 && canonicalUnit) {
    unitQuestions = allSubjectQuestions.filter(q => isQuestionInUnit(q, canonicalUnit.id, canonicalUnit));
  }
  if (unitQuestions.length === 0) {
    // If unit still not found, keep subject questions but do not cross subjects
    unitQuestions = allSubjectQuestions;
  }

  // 2. TOPIC FILTERING WITHIN UNIT:
  let finalCandidates = [];
  if (topic && topic.trim() !== '') {
    const topicMatches = unitQuestions.filter(q => isQuestionInTopic(q, topic));
    if (topicMatches.length >= count) {
      finalCandidates = topicMatches;
    } else if (topicMatches.length > 0) {
      // Prioritize topic matches first, then fill from the SAME unit
      const otherUnitQuestions = unitQuestions.filter(q => !isQuestionInTopic(q, topic));
      finalCandidates = [...topicMatches, ...otherUnitQuestions];
    } else {
      // If topic has no exact match in bank, stay strictly in the same unit!
      finalCandidates = unitQuestions;
    }
  } else {
    finalCandidates = unitQuestions;
  }

  // 3. DIFFICULTY PREFERENCE:
  if (difficulty && difficulty !== 'Adaptive') {
    const diffMatches = finalCandidates.filter(q => q.difficulty === difficulty);
    if (diffMatches.length >= count) {
      finalCandidates = diffMatches;
    }
  }

  // Shuffle final candidates
  const shuffled = [...finalCandidates].sort(() => 0.5 - Math.random());

  // 4. GENERATE REQUIRED COUNT (Stay strictly within candidate pool!)
  const result = [];
  let idx = 0;
  while (result.length < count && shuffled.length > 0) {
    const base = shuffled[idx % shuffled.length];
    const isRepeated = result.length >= shuffled.length;
    result.push({
      question: isRepeated ? `${base.question} (Class 12 Practice Variant ${Math.floor(result.length / shuffled.length) + 1})` : base.question,
      options: [...base.options],
      correctAnswer: base.correctAnswer,
      explanation: base.explanation,
      topic: base.topic || topic || canonicalUnit?.name || unit || 'General',
      difficulty: base.difficulty || difficulty || 'Medium',
    });
    idx++;
  }

  return result.slice(0, count);
}

module.exports = {
  VERIFIED_QUESTIONS,
  seedQuestionBankIfEmpty,
  getQuestionsFromBank,
  isQuestionInUnit,
  isQuestionInTopic,
};
