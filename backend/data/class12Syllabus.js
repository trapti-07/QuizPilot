/**
 * Authoritative Class 12 Board Examination Syllabus Mapping (CommonJS for Backend)
 * Aligned strictly to official CBSE & State Board Class 12 Curricula.
 */

const CLASS_12_SYLLABUS = {
  'Physics': {
    standard: 'Class 12',
    board: 'CBSE & State Boards',
    units: [
      {
        id: 'Electrostatics',
        name: 'Electrostatics',
        topics: [
          'Coulomb Law and Electric Fields',
          'Gauss Law and Electric Flux',
          'Electric Potential and Equipotential Surfaces',
          'Capacitance and Dielectrics',
        ],
      },
      {
        id: 'Current Electricity',
        name: 'Current Electricity',
        topics: [
          'Ohm Law and Drift Velocity',
          'Kirchhoff Laws and Electrical Circuits',
          'Wheatstone Bridge and Meter Bridge',
          'Cells, EMF and Internal Resistance',
        ],
      },
      {
        id: 'Magnetic Effects of Current',
        name: 'Magnetic Effects of Current & Magnetism',
        topics: [
          'Biot-Savart Law and Ampere Law',
          'Lorentz Force and Cyclotron Motion',
          'Moving Coil Galvanometer',
          'Magnetic Dipole and Earth Magnetism',
        ],
      },
      {
        id: 'Electromagnetic Induction & AC',
        name: 'Electromagnetic Induction & Alternating Currents',
        topics: [
          'Faraday and Lenz Law',
          'Self and Mutual Inductance',
          'AC Circuits and LCR Resonance',
          'Transformers and AC Generator',
        ],
      },
      {
        id: 'Optics',
        name: 'Optics (Ray & Wave Optics)',
        topics: [
          'Ray Optics and Optical Instruments',
          'Total Internal Reflection and Refraction',
          'Wave Optics and Huygens Principle',
          'Interference and Young Double Slit Experiment',
          'Diffraction and Polarization',
        ],
      },
      {
        id: 'Modern Physics',
        name: 'Modern Physics (Dual Nature, Atoms & Nuclei)',
        topics: [
          'Photoelectric Effect and Einstein Equation',
          'De Broglie Wavelength and Matter Waves',
          'Bohr Model and Hydrogen Spectrum',
          'Radioactivity and Nuclear Binding Energy',
        ],
      },
      {
        id: 'Semiconductor Electronics',
        name: 'Semiconductor Electronics & Devices',
        topics: [
          'P-N Junction Diode and Rectifiers',
          'Zener Diode and Voltage Regulation',
          'Energy Bands and Semiconductors',
          'Logic Gates and Digital Circuits',
        ],
      },
    ],
  },

  'Chemistry': {
    standard: 'Class 12',
    board: 'CBSE & State Boards',
    units: [
      {
        id: 'Solutions',
        name: 'Solutions',
        topics: [
          'Colligative Properties',
          'Raoult Law and Ideal Solutions',
          'Henry Law and Solubility of Gases',
          'Van\'t Hoff Factor and Abnormal Molar Mass',
        ],
      },
      {
        id: 'Electrochemistry',
        name: 'Electrochemistry',
        topics: [
          'Nernst Equation and Cell Potential',
          'Kohlrausch Law and Conductance',
          'Galvanic Cells, Batteries and Fuel Cells',
          'Electrolysis and Faraday Laws',
        ],
      },
      {
        id: 'Chemical Kinetics',
        name: 'Chemical Kinetics',
        topics: [
          'Rate of Reaction and Rate Law',
          'Order and Molecularity of Reaction',
          'Integrated Rate Equations and Half-Life',
          'Arrhenius Equation and Activation Energy',
        ],
      },
      {
        id: 'Coordination Compounds',
        name: 'Coordination Compounds',
        topics: [
          'Werner Theory and IUPAC Nomenclature',
          'Isomerism in Coordination Compounds',
          'Valence Bond and Crystal Field Theory',
          'Bonding and Stability of Complex Compounds',
        ],
      },
      {
        id: 'd and f Block Elements',
        name: 'd and f Block Elements',
        topics: [
          'Transition Metal Properties and Oxidation States',
          'Potassium Permanganate and Dichromate',
          'Lanthanoid and Actinoid Contraction',
        ],
      },
      {
        id: 'Haloalkanes and Haloarenes',
        name: 'Haloalkanes and Haloarenes',
        topics: [
          'SN1 and SN2 Nucleophilic Substitution',
          'Elimination Reactions and Saytzeff Rule',
          'Reactivity of Haloarenes and Polyhalogen Compounds',
        ],
      },
      {
        id: 'Alcohols, Phenols and Ethers',
        name: 'Alcohols, Phenols and Ethers',
        topics: [
          'Preparation and Properties of Alcohols',
          'Acidity and Electrophilic Substitution of Phenols',
          'Williamson Ether Synthesis and Cleavage',
        ],
      },
      {
        id: 'Aldehydes, Ketones and Carboxylic Acids',
        name: 'Aldehydes, Ketones and Carboxylic Acids',
        topics: [
          'Nucleophilic Addition Reactions',
          'Aldol Condensation and Cannizzaro Reaction',
          'Acidity and Chemical Reactions of Carboxylic Acids',
        ],
      },
      {
        id: 'Amines',
        name: 'Amines',
        topics: [
          'Basicity of Amines and Gabriel Phthalimide',
          'Hoffmann Bromamide and Carbylamine Test',
          'Diazonium Salts and Azo Dye Coupling',
        ],
      },
      {
        id: 'Biomolecules',
        name: 'Biomolecules',
        topics: [
          'Carbohydrates (Glucose and Fructose)',
          'Amino Acids, Peptide Bonds and Protein Structure',
          'Nucleic Acids (DNA and RNA Architecture)',
          'Vitamins and Enzymes',
        ],
      },
    ],
  },

  'Mathematics': {
    standard: 'Class 12',
    board: 'CBSE & State Boards',
    units: [
      {
        id: 'Relations and Functions',
        name: 'Relations and Functions',
        topics: [
          'Types of Relations and Functions',
          'Inverse Trigonometric Functions and Properties',
        ],
      },
      {
        id: 'Matrices and Determinants',
        name: 'Matrices and Determinants',
        topics: [
          'Matrix Operations and Transpose',
          'Properties of Determinants',
          'Adjoint and Inverse of a Square Matrix',
          'System of Linear Equations (Matrix Method)',
        ],
      },
      {
        id: 'Calculus',
        name: 'Calculus (Differentiation & Integration)',
        topics: [
          'Continuity and Differentiability',
          'Chain Rule and Logarithmic Differentiation',
          'Applications of Derivatives (Maxima and Minima)',
          'Indefinite and Definite Integrals',
          'Differential Equations and Integrating Factor',
        ],
      },
      {
        id: 'Vectors and 3D Geometry',
        name: 'Vectors and 3D Geometry',
        topics: [
          'Dot and Cross Products of Vectors',
          'Direction Cosines and Direction Ratios',
          'Equations of Lines and Planes in 3D',
        ],
      },
      {
        id: 'Linear Programming',
        name: 'Linear Programming',
        topics: [
          'Formulation of Linear Programming Problems',
          'Graphical Solution and Corner Point Method',
        ],
      },
      {
        id: 'Probability',
        name: 'Probability',
        topics: [
          'Conditional Probability and Multiplication Rule',
          'Bayes Theorem and Law of Total Probability',
          'Probability Distribution of Random Variables',
        ],
      },
    ],
  },

  'Biology': {
    standard: 'Class 12',
    board: 'CBSE & State Boards',
    units: [
      {
        id: 'Reproduction',
        name: 'Reproduction',
        topics: [
          'Sexual Reproduction in Flowering Plants',
          'Human Reproduction and Gametogenesis',
          'Reproductive Health and Contraceptive Methods',
        ],
      },
      {
        id: 'Genetics and Evolution',
        name: 'Genetics and Evolution',
        topics: [
          'Mendelian Inheritance and Deviations',
          'Molecular Basis of Inheritance and DNA Replication',
          'Transcription, Translation and Genetic Code',
          'Evolution, Natural Selection and Hardy-Weinberg',
        ],
      },
      {
        id: 'Biology and Human Welfare',
        name: 'Biology in Human Welfare',
        topics: [
          'Human Health and Infectious Diseases',
          'Immunity, Vaccines and Antibodies',
          'Microbes in Industrial and Domestic Products',
        ],
      },
      {
        id: 'Biotechnology',
        name: 'Biotechnology and Applications',
        topics: [
          'Recombinant DNA Technology and Restriction Enzymes',
          'PCR, Gel Electrophoresis and Cloning Vectors',
          'Biotechnology Applications in Agriculture & Medicine',
        ],
      },
      {
        id: 'Ecology and Environment',
        name: 'Ecology and Environment',
        topics: [
          'Organisms, Populations and Adaptations',
          'Ecosystem Structure and Energy Flow',
          'Biodiversity, Endangerment and Conservation',
        ],
      },
    ],
  },

  'Computer Science': {
    standard: 'Class 12',
    board: 'CBSE & State Boards',
    units: [
      {
        id: 'Python Data Structures',
        name: 'Python Data Structures & Programming',
        topics: [
          'Lists, Tuples and Dictionaries',
          'Functions and Variable Scope',
          'File Handling (Text, Binary and CSV Files)',
          'Stack and Queue Linear Data Structures',
        ],
      },
      {
        id: 'Computer Networks',
        name: 'Computer Networks',
        topics: [
          'Network Topologies and Transmission Media',
          'OSI Model Layers and TCP/IP Protocol Suite',
          'Web Services and Network Routing Devices',
          'Cyber Safety and Network Security',
        ],
      },
      {
        id: 'Relational Databases and SQL',
        name: 'Relational Databases and SQL',
        topics: [
          'Relational Data Model and Constraints',
          'SQL DDL and DML Commands',
          'Aggregate Functions and GROUP BY / HAVING',
          'SQL Table Joins and Nested Queries',
        ],
      },
      {
        id: 'Cyber Ethics and Society',
        name: 'Cyber Ethics and Society',
        topics: [
          'Digital Footprints and Net Etiquette',
          'Cyber Crimes, Phishing and Cyber Laws (IT Act)',
          'Intellectual Property Rights and Open Source',
        ],
      },
    ],
  },

  'English Core': {
    standard: 'Class 12',
    board: 'CBSE & State Boards',
    units: [
      {
        id: 'Reading Comprehension',
        name: 'Reading Comprehension',
        topics: [
          'Factual and Discursive Passage Analysis',
          'Vocabulary in Context and Idiomatic Nuance',
          'Inference and Central Theme Extraction',
        ],
      },
      {
        id: 'Writing Skills',
        name: 'Writing Skills & Formats',
        topics: [
          'Notice Writing and Formal Invitations',
          'Official Letters and Letters to Editor',
          'Article and Report Writing Structure',
        ],
      },
      {
        id: 'Literature and Grammar',
        name: 'Literature and Figurative Devices',
        topics: [
          'Flamingo and Vistas Literary Analysis',
          'Poetic Devices and Figures of Speech',
          'Clauses and Direct-Indirect Transformations',
        ],
      },
    ],
  },
};

const normalizeStr = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
};

const findUnit = (subject, unitNameOrId) => {
  const subjectData = CLASS_12_SYLLABUS[subject];
  if (!subjectData || !subjectData.units) return null;
  const targetNorm = normalizeStr(unitNameOrId);
  return (
    subjectData.units.find(u => {
      const idNorm = normalizeStr(u.id);
      const nameNorm = normalizeStr(u.name);
      return idNorm === targetNorm || nameNorm === targetNorm || targetNorm.includes(idNorm) || idNorm.includes(targetNorm);
    }) || subjectData.units[0]
  );
};

module.exports = {
  CLASS_12_SYLLABUS,
  normalizeStr,
  findUnit,
};
