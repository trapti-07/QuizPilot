/**
 * AI-Based Board Exam Quiz Application
 * Dual Engine: Google Gemini Flash AI + Curated Local Question Bank
 * Features:
 * - Direct API key level (No username, no password)
 * - Popular topic boxes for quick chapter selection
 * - 10-Second pending timeout -> Auto-switch to local questions
 * - Interactive scoring, audio feedback & review
 * - Weak topics & concept revision summary
 * - Dynamic difficulty adjustment recommendation
 * - Daily study streak counter & local leaderboard
 * - Export results (.txt) & Print/Save as PDF
 */

// =========================================================================
// 🔑 OPTIONAL HARDCODED API KEY (OR ENTER IN THE WEB UI)
// =========================================================================
const GEMINI_API_KEY = ""; // <-- Paste your key here or type in the UI
// =========================================================================

// Popular Topic Boxes per Subject
const TOPIC_BOXES = {
  physics: [
    { icon: "⚡", title: "Electrostatics & Charges", chapter: "Electric Charges and Fields", sub: "Coulomb's Law, Gauss's Theorem" },
    { icon: "🔋", title: "Current Electricity", chapter: "Current Electricity", sub: "Ohm's Law, Kirchhoff's Rules, Drift Velocity" },
    { icon: "🧲", title: "Magnetism & Induction", chapter: "Moving Charges and Magnetism", sub: "Biot-Savart, Faraday's Law, AC" },
    { icon: "💡", title: "Ray & Wave Optics", chapter: "Ray Optics and Optical Instruments", sub: "Refraction, Lens Maker, Interference" },
    { icon: "⚛️", title: "Modern Physics & Diodes", chapter: "Atoms and Nuclei", sub: "Photoelectric Effect, Bohr Model, PN Diode" }
  ],
  chemistry: [
    { icon: "🧪", title: "Solutions & Raoult's Law", chapter: "Solutions", sub: "Colligative Properties, Osmotic Pressure, Van't Hoff" },
    { icon: "⚡", title: "Electrochemistry & Cells", chapter: "Electrochemistry", sub: "Nernst Equation, Galvanic Cells, Kohlrausch Law" },
    { icon: "⏱️", title: "Chemical Kinetics", chapter: "Chemical Kinetics", sub: "Rate Laws, Half-life, Arrhenius Equation" },
    { icon: "💎", title: "Coordination Compounds", chapter: "Coordination Compounds", sub: "IUPAC Nomenclature, CFT, Isomerism" },
    { icon: "🧬", title: "Organic Reactions", chapter: "Haloalkanes and Haloarenes", sub: "SN1/SN2, Nucleophilic Substitution, Reagents" }
  ],
  mathematics: [
    { icon: "📐", title: "Matrices & Determinants", chapter: "Matrices and Determinants", sub: "Inverse, Adjoint, System of Linear Equations" },
    { icon: "📈", title: "Differential Calculus", chapter: "Continuity and Differentiability", sub: "Chain Rule, Rolle's Theorem, Maxima-Minima" },
    { icon: "🧮", title: "Integrals & Diff Equations", chapter: "Integrals & Applications", sub: "Integration by Parts, Definite Integrals, Order/Degree" },
    { icon: "🎯", title: "Vectors & 3D Geometry", chapter: "Vector Algebra", sub: "Dot/Cross Product, Shortest Distance, Direction Cosines" },
    { icon: "🎲", title: "Probability & Bayes' Rule", chapter: "Probability", sub: "Conditional Probability, Bayes' Theorem, Distribution" }
  ]
};

// Full Syllabus Chapters by Subject
const SUBJECT_CHAPTERS = {
  physics: [
    "Electric Charges and Fields",
    "Electrostatic Potential and Capacitance",
    "Current Electricity",
    "Moving Charges and Magnetism",
    "Magnetism and Matter",
    "Electromagnetic Induction",
    "Alternating Current",
    "Electromagnetic Waves",
    "Ray Optics and Optical Instruments",
    "Wave Optics",
    "Dual Nature of Radiation and Matter",
    "Atoms and Nuclei",
    "Semiconductor Electronics"
  ],
  chemistry: [
    "Solutions",
    "Electrochemistry",
    "Chemical Kinetics",
    "The d- and f-Block Elements",
    "Coordination Compounds",
    "Haloalkanes and Haloarenes",
    "Alcohols, Phenols and Ethers",
    "Aldehydes, Ketones and Carboxylic Acids",
    "Amines",
    "Biomolecules"
  ],
  mathematics: [
    "Relations and Functions",
    "Inverse Trigonometric Functions",
    "Matrices and Determinants",
    "Continuity and Differentiability",
    "Application of Derivatives",
    "Integrals & Applications",
    "Differential Equations",
    "Vector Algebra",
    "Three-Dimensional Geometry",
    "Linear Programming",
    "Probability"
  ]
};

// Curated Local Question Bank (Fallback for High Demand / Offline / >10s Timeout)
const LOCAL_QUESTION_BANK = {
  physics: [
    {
      id: 1,
      topic: "Electrostatics & Gauss Law",
      difficulty: "easy",
      question: "What is the SI unit of electric flux through a closed surface?",
      options: ["N m² C⁻¹", "N C⁻¹", "V m⁻¹", "C m⁻²"],
      correctAnswer: 0,
      explanation: "Electric flux Φ = E · A. Unit of E is N/C and area is m², giving N m² C⁻¹ (or Volt·meter)."
    },
    {
      id: 2,
      topic: "Capacitance & Dielectrics",
      difficulty: "medium",
      question: "A parallel plate capacitor with air between the plates has a capacitance of 8 pF. If the distance between the plates is halved and the space is filled with a dielectric of constant k = 6, what is the new capacitance?",
      options: ["24 pF", "48 pF", "96 pF", "12 pF"],
      correctAnswer: 2,
      explanation: "Capacitance C = (k * ε₀ * A) / d'. Since d' = d/2, C' = 2 * k * C₀ = 2 * 6 * 8 pF = 96 pF."
    },
    {
      id: 3,
      topic: "Current Electricity & Drift",
      difficulty: "easy",
      question: "When temperature of a metallic conductor is increased, its electrical resistivity:",
      options: ["Decreases", "Increases", "Remains constant", "First decreases then increases"],
      correctAnswer: 1,
      explanation: "With increasing temperature, amplitude of lattice vibrations increases, decreasing relaxation time τ, hence resistivity ρ = m/(n e² τ) increases."
    },
    {
      id: 4,
      topic: "Kirchhoff's Laws",
      difficulty: "medium",
      question: "Kirchhoff's first law (Junction rule) at an electrical junction is based on the conservation of:",
      options: ["Energy", "Charge", "Momentum", "Angular Momentum"],
      correctAnswer: 1,
      explanation: "Kirchhoff's current law states that total current entering a junction equals total current leaving, which is a consequence of conservation of electric charge."
    },
    {
      id: 5,
      topic: "Moving Charges & Cyclotron",
      difficulty: "hard",
      question: "A charged particle moves with velocity v in a uniform magnetic field B perpendicular to v. The radius of the circular path is directly proportional to:",
      options: ["Magnetic field B", "Charge of particle q", "Linear momentum of particle p", "Kinetic energy squared"],
      correctAnswer: 2,
      explanation: "Centripetal force q v B = m v² / r, hence radius r = (m v) / (q B) = p / (q B). Radius is directly proportional to linear momentum p."
    },
    {
      id: 6,
      topic: "Electromagnetic Induction",
      difficulty: "medium",
      question: "The direction of induced electromotive force during electromagnetic induction is given by:",
      options: ["Ampere's law", "Lenz's law", "Biot-Savart law", "Gauss's law"],
      correctAnswer: 1,
      explanation: "Lenz's law states that the polarity of induced emf is such that it produces a current which opposes the change in magnetic flux that produces it."
    },
    {
      id: 7,
      topic: "AC Circuits & Resonance",
      difficulty: "hard",
      question: "In a series LCR alternating current circuit at resonance, the phase difference between applied voltage and resultant current is:",
      options: ["π / 2 radians", "0 radians", "π radians", "π / 4 radians"],
      correctAnswer: 1,
      explanation: "At resonance, inductive reactance equals capacitive reactance (X_L = X_C), making total impedance purely resistive (Z = R). Therefore phase difference φ = 0."
    },
    {
      id: 8,
      topic: "Ray Optics & Total Internal Reflection",
      difficulty: "easy",
      question: "What is the critical angle for a medium of refractive index √2 with respect to air?",
      options: ["30°", "45°", "60°", "90°"],
      correctAnswer: 1,
      explanation: "sin(i_c) = 1 / μ = 1 / √2. Hence the critical angle i_c = 45°."
    },
    {
      id: 9,
      topic: "Wave Optics & Interference",
      difficulty: "medium",
      question: "In Young's double slit experiment, if the separation between the two slits is halved and distance from screen is doubled, fringe width will:",
      options: ["Remain unchanged", "Double", "Become four times", "Be halved"],
      correctAnswer: 2,
      explanation: "Fringe width β = (λ * D) / d. If D is doubled (2D) and d is halved (d/2), the new fringe width becomes 4 * β."
    },
    {
      id: 10,
      topic: "Photoelectric Effect",
      difficulty: "easy",
      question: "According to Einstein's photoelectric equation, the kinetic energy of emitted photoelectrons depends directly upon the:",
      options: ["Intensity of incident light", "Frequency of incident light", "Duration of illumination", "Polarization of light"],
      correctAnswer: 1,
      explanation: "Einstein's photoelectric equation states K_max = hν - Φ. Kinetic energy increases linearly with the frequency of incident radiation."
    }
  ],
  chemistry: [
    {
      id: 1,
      topic: "Solutions & Colligative Properties",
      difficulty: "easy",
      question: "Which of the following colligative properties is most commonly used to find the molar mass of biomolecules and polymers?",
      options: ["Relative lowering of vapour pressure", "Elevation in boiling point", "Depression in freezing point", "Osmotic pressure"],
      correctAnswer: 3,
      explanation: "Osmotic pressure can be measured at room temperature and gives substantial measurable values even for very dilute polymer solutions."
    },
    {
      id: 2,
      topic: "Raoult's Law & Azeotropes",
      difficulty: "medium",
      question: "A mixture of ethanol and water exhibits positive deviation from Raoult's law. This mixture forms:",
      options: ["Minimum boiling azeotrope", "Maximum boiling azeotrope", "Ideal solution", "Insoluble solid mixture"],
      correctAnswer: 0,
      explanation: "Solutions showing large positive deviation from Raoult's law have higher vapour pressure than expected and form minimum boiling azeotropes at specific composition."
    },
    {
      id: 3,
      topic: "Electrochemistry & Kohlrausch Law",
      difficulty: "medium",
      question: "Kohlrausch's law of independent migration of ions helps in calculating the limiting molar conductivity of:",
      options: ["Only strong electrolytes", "Weak electrolytes at infinite dilution", "Insoluble ionic solids only", "Non-electrolytes"],
      correctAnswer: 1,
      explanation: "At infinite dilution, each ion contributes independently to molar conductivity, allowing calculation of Λ°_m for weak electrolytes like CH₃COOH."
    },
    {
      id: 4,
      topic: "Chemical Kinetics & Rate Constant",
      difficulty: "easy",
      question: "The SI unit of rate constant for a zero-order chemical reaction is:",
      options: ["mol L⁻¹ s⁻¹", "s⁻¹", "L mol⁻¹ s⁻¹", "mol⁻² L² s⁻¹"],
      correctAnswer: 0,
      explanation: "Rate = k [A]⁰ = k. Since Rate has units of mol L⁻¹ s⁻¹, k has the same unit mol L⁻¹ s⁻¹ for zero order."
    },
    {
      id: 5,
      topic: "Arrhenius Equation & Activation Energy",
      difficulty: "hard",
      question: "According to the Arrhenius equation, a plot of ln(k) against 1/T yields a straight line with slope equal to:",
      options: ["-E_a / R", "E_a / R", "-E_a / (2.303 R)", "ln A"],
      correctAnswer: 0,
      explanation: "ln(k) = ln(A) - (E_a / R) * (1/T). When plotted against 1/T, the slope is -E_a / R."
    },
    {
      id: 6,
      topic: "Coordination Compounds & CFT",
      difficulty: "medium",
      question: "Which of the following ligands is considered a strong field ligand according to the spectrochemical series?",
      options: ["I⁻", "Cl⁻", "CN⁻", "F⁻"],
      correctAnswer: 2,
      explanation: "Cyanide ion (CN⁻) and CO are strong field carbon-donor ligands causing large crystal field splitting (Δ_o)."
    },
    {
      id: 7,
      topic: "Haloalkanes & SN1 Mechanism",
      difficulty: "medium",
      question: "The nucleophilic substitution reaction proceeding via an SN1 mechanism in optically active alkyl halides results in:",
      options: ["Complete inversion of configuration", "Complete retention of configuration", "Racemisation", "Elimination without product"],
      correctAnswer: 2,
      explanation: "SN1 mechanism forms a planar carbocation intermediate which can be attacked with equal probability from either side, resulting in racemisation."
    },
    {
      id: 8,
      topic: "Alcohols & Lucas Reagent",
      difficulty: "easy",
      question: "Which alcohol reacts immediately at room temperature with Lucas reagent (anhydrous ZnCl₂ + conc. HCl) to produce turbidity?",
      options: ["Primary alcohol", "Secondary alcohol", "Tertiary alcohol", "Methanol"],
      correctAnswer: 2,
      explanation: "Tertiary alcohols form very stable tertiary carbocations and react immediately producing cloudiness (insoluble alkyl chloride)."
    },
    {
      id: 9,
      topic: "Aldehydes & Cannizzaro Reaction",
      difficulty: "hard",
      question: "Which of the following compounds does NOT undergo aldol condensation due to lack of an α-hydrogen atom?",
      options: ["Acetaldehyde", "Benzaldehyde", "Acetone", "Propanal"],
      correctAnswer: 1,
      explanation: "Benzaldehyde (C₆H₅CHO) has no α-hydrogen atom attached to the carbonyl group and undergoes Cannizzaro reaction instead with concentrated alkali."
    },
    {
      id: 10,
      topic: "Biomolecules & Proteins",
      difficulty: "easy",
      question: "The helical structure of proteins (α-helix) is stabilized primarily by:",
      options: ["Peptide bonds", "Hydrogen bonds", "Disulphide linkages", "Van der Waals forces"],
      correctAnswer: 1,
      explanation: "The secondary α-helix structure is stabilized by intramolecular hydrogen bonds between the -NH group of one amino acid and the -CO group of adjacent turns."
    }
  ],
  mathematics: [
    {
      id: 1,
      topic: "Matrices & Adjoint",
      difficulty: "medium",
      question: "If A is an invertible square matrix of order 3 and |A| = 4, then the determinant value of adj(A) is:",
      options: ["4", "16", "64", "1/4"],
      correctAnswer: 1,
      explanation: "For an n × n matrix, |adj(A)| = |A|^(n - 1). Here n = 3, so |adj(A)| = 4^(3 - 1) = 4² = 16."
    },
    {
      id: 2,
      topic: "Matrices & Inverse",
      difficulty: "easy",
      question: "A square matrix A is said to be singular if:",
      options: ["|A| = 1", "|A| = 0", "|A| ≠ 0", "A = Aᵀ"],
      correctAnswer: 1,
      explanation: "By definition, a square matrix is singular if its determinant is exactly zero (|A| = 0), meaning its inverse does not exist."
    },
    {
      id: 3,
      topic: "Continuity & Differentiability",
      difficulty: "medium",
      question: "If f(x) = |x - 2|, then at x = 2 the function is:",
      options: ["Continuous and differentiable", "Continuous but not differentiable", "Neither continuous nor differentiable", "Discontinuous"],
      correctAnswer: 1,
      explanation: "f(x) = |x - 2| is continuous everywhere on ℝ, but has a sharp corner at x = 2 with LHD = -1 and RHD = 1, so it is not differentiable at x = 2."
    },
    {
      id: 4,
      topic: "Application of Derivatives & Maxima",
      difficulty: "hard",
      question: "The maximum value of the function f(x) = sin(x) + cos(x) on the interval [0, 2π] is:",
      options: ["1", "2", "√2", "1 / √2"],
      correctAnswer: 2,
      explanation: "f(x) = √2 * [sin(x) * (1/√2) + cos(x) * (1/√2)] = √2 * sin(x + π/4). Maximum occurs when sin(...) = 1, yielding maximum value √2."
    },
    {
      id: 5,
      topic: "Integrals & Standard Forms",
      difficulty: "easy",
      question: "The indefinite integral ∫ (1 / (1 + x²)) dx equals:",
      options: ["ln(1 + x²) + C", "tan⁻¹(x) + C", "sin⁻¹(x) + C", "cot⁻¹(x) + C"],
      correctAnswer: 1,
      explanation: "By standard integration formula, d/dx (tan⁻¹(x)) = 1 / (1 + x²), therefore ∫ (1 / (1 + x²)) dx = tan⁻¹(x) + C."
    },
    {
      id: 6,
      topic: "Definite Integrals & Properties",
      difficulty: "medium",
      question: "The value of the definite integral ∫_{-1}^{1} x³ * cos(x) dx is:",
      options: ["2", "1", "0", "π / 2"],
      correctAnswer: 2,
      explanation: "f(x) = x³ * cos(x) is an odd function because f(-x) = (-x)³ * cos(-x) = -x³ * cos(x) = -f(x). The integral of any odd function over [-a, a] is identically 0."
    },
    {
      id: 7,
      topic: "Differential Equations & Degree",
      difficulty: "easy",
      question: "The order and degree of the differential equation (d²y/dx²)³ + (dy/dx)² + sin(y) = 0 are:",
      options: ["Order 3, Degree 2", "Order 2, Degree 3", "Order 2, Degree not defined", "Order 3, Degree 1"],
      correctAnswer: 1,
      explanation: "The highest derivative is d²y/dx² (order = 2). The power of this highest derivative in polynomial form is 3 (degree = 3)."
    },
    {
      id: 8,
      topic: "Vector Algebra & Dot Product",
      difficulty: "easy",
      question: "If two non-zero vectors a and b are perpendicular to each other, their scalar product (a · b) is:",
      options: ["1", "0", "-1", "|a| * |b|"],
      correctAnswer: 1,
      explanation: "a · b = |a| * |b| * cos(θ). Since the angle between perpendicular vectors is 90°, cos(90°) = 0, hence a · b = 0."
    },
    {
      id: 9,
      topic: "Three-Dimensional Geometry",
      difficulty: "hard",
      question: "The distance of the point (2, 3, 4) from the x-axis is:",
      options: ["2", "5", "√29", "√20"],
      correctAnswer: 1,
      explanation: "Distance of (x, y, z) from x-axis is √(y² + z²) = √(3² + 4²) = √(9 + 16) = √25 = 5."
    },
    {
      id: 10,
      topic: "Probability & Bayes' Theorem",
      difficulty: "medium",
      question: "If P(A) = 0.4, P(B) = 0.8, and P(B|A) = 0.6, then the value of P(A ∩ B) is:",
      options: ["0.24", "0.48", "0.32", "0.16"],
      correctAnswer: 0,
      explanation: "By conditional probability definition, P(B|A) = P(A ∩ B) / P(A). Therefore P(A ∩ B) = P(B|A) * P(A) = 0.6 * 0.4 = 0.24."
    }
  ]
};

// DOM References
const formView = document.getElementById("formView");
const loadingView = document.getElementById("loadingView");
const quizPlayerView = document.getElementById("quizPlayerView");
const quizResultsView = document.getElementById("quizResultsView");

const quizForm = document.getElementById("quizForm");
const chapterSelect = document.getElementById("chapterSelect");
const customChapterInput = document.getElementById("customChapterInput");
const chapterError = document.getElementById("chapterError");
const topicBoxesContainer = document.getElementById("topicBoxesContainer");

// Preview Elements
const previewSubject = document.getElementById("previewSubject");
const previewChapter = document.getElementById("previewChapter");
const previewDifficulty = document.getElementById("previewDifficulty");
const previewCount = document.getElementById("previewCount");

// Header & Streak Elements
const streakDaysText = document.getElementById("streakDaysText");
const quizzesCompletedText = document.getElementById("quizzesCompletedText");
const openLeaderboardBtn = document.getElementById("openLeaderboardBtn");
const leaderboardModal = document.getElementById("leaderboardModal");
const closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");
const closeLbActionBtn = document.getElementById("closeLbActionBtn");
const clearLeaderboardBtn = document.getElementById("clearLeaderboardBtn");
const leaderboardBody = document.getElementById("leaderboardBody");

// Toast Notice
const noticeToast = document.getElementById("noticeToast");
const noticeMsg = document.getElementById("noticeMsg");
const noticeIcon = document.getElementById("noticeIcon");
const closeNoticeBtn = document.getElementById("closeNoticeBtn");

// API Key Elements
const apiKeyStatusBadge = document.getElementById("apiKeyStatusBadge");
const apiStatusDot = document.getElementById("apiStatusDot");
const apiStatusText = document.getElementById("apiStatusText");
const apiKeyBanner = document.getElementById("apiKeyBanner");
const quickApiKeyInput = document.getElementById("quickApiKeyInput");
const saveQuickKeyBtn = document.getElementById("saveQuickKeyBtn");
const openApiKeyModalBtn = document.getElementById("openApiKeyModalBtn");
const apiKeyModal = document.getElementById("apiKeyModal");
const closeApiKeyModalBtn = document.getElementById("closeApiKeyModalBtn");
const modalApiKeyInput = document.getElementById("modalApiKeyInput");
const saveModalKeyBtn = document.getElementById("saveModalKeyBtn");
const clearKeyBtn = document.getElementById("clearKeyBtn");

// Loading View & 10s Countdown
const loadingTitle = document.getElementById("loadingTitle");
const loadingSubtitle = document.getElementById("loadingSubtitle");
const countdownTimer = document.getElementById("countdownTimer");
const timeoutBarFill = document.getElementById("timeoutBarFill");
const forceLocalBtn = document.getElementById("forceLocalBtn");
const loadStep1 = document.getElementById("loadStep1");
const loadStep2 = document.getElementById("loadStep2");
const loadStep3 = document.getElementById("loadStep3");

// Player Elements
const quizMetaSubject = document.getElementById("quizMetaSubject");
const quizMetaChapter = document.getElementById("quizMetaChapter");
const quizMetaDifficulty = document.getElementById("quizMetaDifficulty");
const quizMetaSource = document.getElementById("quizMetaSource");
const quizTimerText = document.getElementById("quizTimerText");
const quizProgressFill = document.getElementById("quizProgressFill");
const questionCounterText = document.getElementById("questionCounterText");
const answeredCounterText = document.getElementById("answeredCounterText");
const questionPalette = document.getElementById("questionPalette");
const activeQBadge = document.getElementById("activeQBadge");
const activeQTopicTag = document.getElementById("activeQTopicTag");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const explanationBox = document.getElementById("explanationBox");
const explanationText = document.getElementById("explanationText");
const expResultTitle = document.getElementById("expResultTitle");
const expResultIcon = document.getElementById("expResultIcon");
const instantFeedbackCheckbox = document.getElementById("instantFeedbackCheckbox");
const prevQuestionBtn = document.getElementById("prevQuestionBtn");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");
const submitQuizBtn = document.getElementById("submitQuizBtn");
const quitQuizBtn = document.getElementById("quitQuizBtn");

// Results Elements
const resultTrophyIcon = document.getElementById("resultTrophyIcon");
const resultSubtitle = document.getElementById("resultSubtitle");
const scoreFraction = document.getElementById("scoreFraction");
const scorePercentage = document.getElementById("scorePercentage");
const timeTakenText = document.getElementById("timeTakenText");
const reviewQuestionsList = document.getElementById("reviewQuestionsList");
const newQuizBtn = document.getElementById("newQuizBtn");
const retakeQuizBtn = document.getElementById("retakeQuizBtn");
const exportTxtBtn = document.getElementById("exportTxtBtn");
const printReportBtn = document.getElementById("printReportBtn");

// Weak Topics & Difficulty Recommendation Elements
const diffRecCard = document.getElementById("diffRecCard");
const diffRecTitle = document.getElementById("diffRecTitle");
const diffRecDesc = document.getElementById("diffRecDesc");
const applyDiffRecBtn = document.getElementById("applyDiffRecBtn");
// Dashboard Elements
const dashboardView = document.getElementById("dashboardView");
const openGeneratorBtn = document.getElementById("openGeneratorBtn");
const openDashboardBtn = document.getElementById("openDashboardBtn");
const resultsViewDashboardBtn = document.getElementById("resultsViewDashboardBtn");
const dashCreateQuizBtn = document.getElementById("dashCreateQuizBtn");
const dashBottomQuizBtn = document.getElementById("dashBottomQuizBtn");
const dashDemoToggleBtn = document.getElementById("dashDemoToggleBtn");
const dashClearStatsBtn = document.getElementById("dashClearStatsBtn");

// Dashboard KPI Elements
const dashTotalQuizzes = document.getElementById("dashTotalQuizzes");
const dashTotalQuestions = document.getElementById("dashTotalQuestions");
const dashAccuracy = document.getElementById("dashAccuracy");
const dashStreak = document.getElementById("dashStreak");
const dashTotalTime = document.getElementById("dashTotalTime");

// Dashboard Subject Mastery Progress Bars
const dashPhysicsBar = document.getElementById("dashPhysicsBar");
const dashPhysicsPercent = document.getElementById("dashPhysicsPercent");
const dashPhysicsQuestions = document.getElementById("dashPhysicsQuestions");
const dashPhysicsLevel = document.getElementById("dashPhysicsLevel");

const dashChemistryBar = document.getElementById("dashChemistryBar");
const dashChemistryPercent = document.getElementById("dashChemistryPercent");
const dashChemistryQuestions = document.getElementById("dashChemistryQuestions");
const dashChemistryLevel = document.getElementById("dashChemistryLevel");

const dashMathBar = document.getElementById("dashMathBar");
const dashMathPercent = document.getElementById("dashMathPercent");
const dashMathQuestions = document.getElementById("dashMathQuestions");
const dashMathLevel = document.getElementById("dashMathLevel");

// Dashboard Difficulty Breakdown Progress Bars
const dashEasyBar = document.getElementById("dashEasyBar");
const dashEasyPercent = document.getElementById("dashEasyPercent");
const dashMediumBar = document.getElementById("dashMediumBar");
const dashMediumPercent = document.getElementById("dashMediumPercent");
const dashHardBar = document.getElementById("dashHardBar");
const dashHardPercent = document.getElementById("dashHardPercent");

// Dashboard Weak & Mastered Topics
const dashWeakList = document.getElementById("dashWeakList");
const dashWeakCount = document.getElementById("dashWeakCount");
const dashMasteredList = document.getElementById("dashMasteredList");

// Current Configuration State
let currentConfig = {
  subject: "physics",
  chapter: "Electric Charges and Fields",
  difficulty: "medium",
  questionCount: 10
};

// Active Quiz State
let quizState = {
  questions: [],
  currentIndex: 0,
  userAnswers: {},
  timerSeconds: 0,
  timerInterval: null,
  isLocalSource: false,
  recommendedDifficulty: "medium"
};

// Abort controller & 10s countdown for API
let apiAbortController = null;
let timeoutCountdownInterval = null;

// =========================================================================
// 🚀 Application Initialization
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initStreak();
  initApiKey();
  renderTopicBoxes(currentConfig.subject);
  populateChapters(currentConfig.subject);
  setupRadioCardHandlers();
  setupChapterInputs();
  setupApiKeyEvents();
  setupLeaderboardEvents();
  setupPlayerControls();
  setupResultsEvents();
  setupDashboardEvents();
  updateLivePreview();
});

// =========================================================================
// 🔥 Study Streak & Leaderboard
// =========================================================================
function initStreak() {
  const streak = parseInt(localStorage.getItem("boardQuizStreak") || "1", 10);
  const total = parseInt(localStorage.getItem("boardQuizTotalCount") || "0", 10);
  streakDaysText.textContent = `${streak} Day Streak`;
  quizzesCompletedText.textContent = `${total} Quizzes`;
}

function recordQuizCompletion(score, total, percentage) {
  // Update streak
  const todayStr = new Date().toDateString();
  const lastDate = localStorage.getItem("boardQuizLastDate");
  let streak = parseInt(localStorage.getItem("boardQuizStreak") || "1", 10);

  if (lastDate) {
    const last = new Date(lastDate);
    const today = new Date(todayStr);
    const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
  }

  localStorage.setItem("boardQuizStreak", streak);
  localStorage.setItem("boardQuizLastDate", todayStr);

  const completedCount = parseInt(localStorage.getItem("boardQuizTotalCount") || "0", 10) + 1;
  localStorage.setItem("boardQuizTotalCount", completedCount);

  streakDaysText.textContent = `${streak} Day Streak`;
  quizzesCompletedText.textContent = `${completedCount} Quizzes`;

  // Add to local Leaderboard
  const record = {
    id: Date.now(),
    date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    subject: capitalize(currentConfig.subject),
    chapter: currentConfig.chapter,
    difficulty: capitalize(currentConfig.difficulty),
    score: `${score}/${total}`,
    percentage: `${percentage}%`,
    time: formatTime(quizState.timerSeconds)
  };

  const history = JSON.parse(localStorage.getItem("boardQuizLeaderboard") || "[]");
  history.unshift(record);
  if (history.length > 30) history.pop(); // keep top 30
  localStorage.setItem("boardQuizLeaderboard", JSON.stringify(history));
}

function setupLeaderboardEvents() {
  openLeaderboardBtn.addEventListener("click", () => {
    renderLeaderboard();
    leaderboardModal.classList.remove("hidden");
  });

  closeLeaderboardBtn.addEventListener("click", () => leaderboardModal.classList.add("hidden"));
  closeLbActionBtn.addEventListener("click", () => leaderboardModal.classList.add("hidden"));

  clearLeaderboardBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your quiz leaderboard history?")) {
      localStorage.removeItem("boardQuizLeaderboard");
      renderLeaderboard();
    }
  });

  closeNoticeBtn.addEventListener("click", () => noticeToast.classList.add("hidden"));
}

function renderLeaderboard() {
  const history = JSON.parse(localStorage.getItem("boardQuizLeaderboard") || "[]");
  leaderboardBody.innerHTML = "";

  if (history.length === 0) {
    leaderboardBody.innerHTML = `<tr><td colspan="6" class="lb-empty-msg">No completed quizzes yet. Generate and complete your first quiz!</td></tr>`;
    return;
  }

  history.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${row.subject}</strong>: ${row.chapter}</td>
      <td><span class="meta-badge-diff">${row.difficulty}</span></td>
      <td><span class="lb-score-badge">${row.score} (${row.percentage})</span></td>
      <td>${row.time}</td>
      <td>${row.date}</td>
    `;
    leaderboardBody.appendChild(tr);
  });
}

function showToast(msg, isWarning = false) {
  noticeMsg.textContent = msg;
  noticeIcon.textContent = isWarning ? "⚠️" : "⚡";
  noticeToast.className = `notice-toast ${isWarning ? "warning" : ""}`;
  noticeToast.classList.remove("hidden");
  setTimeout(() => noticeToast.classList.add("hidden"), 8000);
}

// =========================================================================
// 🔑 Direct API Key Level (No password, no username)
// =========================================================================
function getEffectiveApiKey() {
  const localKey = localStorage.getItem("GEMINI_API_KEY");
  if (localKey && localKey.trim()) return localKey.trim();
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim()) return GEMINI_API_KEY.trim();
  return "";
}

function initApiKey() {
  const key = getEffectiveApiKey();
  updateApiKeyUI(Boolean(key));
}

function updateApiKeyUI(hasKey) {
  if (hasKey) {
    apiStatusDot.classList.remove("local-mode");
    apiStatusDot.classList.add("active");
    apiStatusText.textContent = "AI Ready";
    apiKeyBanner.classList.add("hidden");
  } else {
    apiStatusDot.classList.remove("active");
    apiStatusDot.classList.add("local-mode");
    apiStatusText.textContent = "Local Bank Active";
    apiKeyBanner.classList.remove("hidden");
  }
}

function saveApiKey(keyVal) {
  const cleaned = (keyVal || "").trim();
  if (cleaned) {
    localStorage.setItem("GEMINI_API_KEY", cleaned);
    updateApiKeyUI(true);
    modalApiKeyInput.value = cleaned;
    quickApiKeyInput.value = "";
    apiKeyModal.classList.add("hidden");
    showToast("Gemini API Key saved! Live AI quiz generation is active.");
  } else {
    showToast("Please enter a valid API key string.", true);
  }
}

function setupApiKeyEvents() {
  saveQuickKeyBtn.addEventListener("click", () => saveApiKey(quickApiKeyInput.value));
  quickApiKeyInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveApiKey(quickApiKeyInput.value);
    }
  });

  openApiKeyModalBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openApiKeyModal();
  });
  apiKeyStatusBadge.addEventListener("click", openApiKeyModal);

  closeApiKeyModalBtn.addEventListener("click", () => apiKeyModal.classList.add("hidden"));

  saveModalKeyBtn.addEventListener("click", () => saveApiKey(modalApiKeyInput.value));

  clearKeyBtn.addEventListener("click", () => {
    localStorage.removeItem("GEMINI_API_KEY");
    modalApiKeyInput.value = "";
    updateApiKeyUI(Boolean(GEMINI_API_KEY));
    apiKeyModal.classList.add("hidden");
    showToast("API Key removed. Switched to Local Question Bank mode.", true);
  });
}

function openApiKeyModal() {
  modalApiKeyInput.value = getEffectiveApiKey();
  apiKeyModal.classList.remove("hidden");
  modalApiKeyInput.focus();
}

// =========================================================================
// 📦 Topic Boxes & Subject Selection
// =========================================================================
function renderTopicBoxes(subject) {
  const boxes = TOPIC_BOXES[subject] || [];
  topicBoxesContainer.innerHTML = "";

  boxes.forEach((box) => {
    const card = document.createElement("div");
    card.className = "topic-box-card";
    if (currentConfig.chapter === box.chapter) {
      card.classList.add("active");
    }

    card.innerHTML = `
      <span class="topic-box-icon">${box.icon}</span>
      <div class="topic-box-info">
        <span class="topic-box-title">${box.title}</span>
        <span class="topic-box-sub">${box.sub}</span>
      </div>
    `;

    card.addEventListener("click", () => {
      // Highlight selected topic box
      document.querySelectorAll(".topic-box-card").forEach((b) => b.classList.remove("active"));
      card.classList.add("active");

      // Set chapter & synchronize dropdown
      currentConfig.chapter = box.chapter;
      chapterSelect.value = box.chapter;
      customChapterInput.value = "";

      hideError();
      updateLivePreview();
    });

    topicBoxesContainer.appendChild(card);
  });
}

function populateChapters(subject) {
  const chapters = SUBJECT_CHAPTERS[subject] || [];
  chapterSelect.innerHTML = `<option value="" disabled selected>-- Or select from full ${capitalize(subject)} syllabus --</option>`;

  chapters.forEach((chapter) => {
    const option = document.createElement("option");
    option.value = chapter;
    option.textContent = chapter;
    chapterSelect.appendChild(option);
  });

  if (currentConfig.chapter) {
    chapterSelect.value = currentConfig.chapter;
  }
}

function setupRadioCardHandlers() {
  // Subject Selection
  const subjectCards = document.querySelectorAll(".subject-card");
  subjectCards.forEach((card) => {
    card.addEventListener("click", () => {
      subjectCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      const radio = card.querySelector('input[type="radio"]');
      radio.checked = true;

      currentConfig.subject = radio.value;
      const firstTopic = TOPIC_BOXES[currentConfig.subject]?.[0];
      currentConfig.chapter = firstTopic ? firstTopic.chapter : "";

      renderTopicBoxes(currentConfig.subject);
      populateChapters(currentConfig.subject);

      customChapterInput.value = "";
      hideError();
      updateLivePreview();
    });
  });

  // Difficulty Selection
  const diffCards = document.querySelectorAll(".diff-card");
  diffCards.forEach((card) => {
    card.addEventListener("click", () => {
      diffCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      const radio = card.querySelector('input[type="radio"]');
      radio.checked = true;

      currentConfig.difficulty = radio.value;
      updateLivePreview();
    });
  });

  // Question Count Selection
  const countCards = document.querySelectorAll(".count-card");
  countCards.forEach((card) => {
    card.addEventListener("click", () => {
      countCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      const radio = card.querySelector('input[type="radio"]');
      radio.checked = true;

      currentConfig.questionCount = parseInt(radio.value, 10);
      updateLivePreview();
    });
  });
}

function setupChapterInputs() {
  chapterSelect.addEventListener("change", (e) => {
    if (e.target.value) {
      currentConfig.chapter = e.target.value;
      customChapterInput.value = "";
      // Uncheck active topic boxes if outside preset
      document.querySelectorAll(".topic-box-card").forEach((b) => {
        b.classList.toggle("active", b.querySelector(".topic-box-title").textContent.includes(e.target.value));
      });
      hideError();
      updateLivePreview();
    }
  });

  customChapterInput.addEventListener("input", (e) => {
    const value = e.target.value.trim();
    if (value) {
      currentConfig.chapter = value;
      chapterSelect.value = "";
      document.querySelectorAll(".topic-box-card").forEach((b) => b.classList.remove("active"));
      hideError();
    }
    updateLivePreview();
  });
}

function updateLivePreview() {
  previewSubject.textContent = capitalize(currentConfig.subject);
  previewChapter.textContent = currentConfig.chapter || "Not Selected";
  previewDifficulty.textContent = capitalize(currentConfig.difficulty);
  previewCount.textContent = `${currentConfig.questionCount} Qs`;
}

// =========================================================================
// ⚡ Quiz Generation: 10s Timeout Switch & High Demand Handling
// =========================================================================
quizForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const finalChapter = customChapterInput.value.trim() || chapterSelect.value || currentConfig.chapter;
  if (!finalChapter) {
    showError("Please select a topic box or chapter from the list.");
    return;
  }
  currentConfig.chapter = finalChapter;
  updateLivePreview();

  const apiKey = getEffectiveApiKey();

  // If no API key provided, seamlessly start with curated local questions
  if (!apiKey) {
    showToast("No Gemini API key supplied. Running with Curated Board Exam Questions.");
    startLocalQuiz();
    return;
  }

  // Live Gemini generation with 10-second pending countdown
  showLoadingView(currentConfig);

  // Setup abort controller
  apiAbortController = new AbortController();

  let secondsLeft = 10;
  countdownTimer.textContent = `${secondsLeft}s`;
  timeoutBarFill.style.width = "100%";

  timeoutCountdownInterval = setInterval(() => {
    secondsLeft--;
    countdownTimer.textContent = `${secondsLeft}s`;
    timeoutBarFill.style.width = `${(secondsLeft / 10) * 100}%`;

    if (secondsLeft <= 0) {
      clearInterval(timeoutCountdownInterval);
      if (apiAbortController) {
        apiAbortController.abort();
      }
      showToast("⏱️ Gemini AI response took >10s (High demand). Switched to Curated Local Questions!", true);
      startLocalQuiz();
    }
  }, 1000);

  // Manual skip button in loading screen
  forceLocalBtn.onclick = () => {
    clearInterval(timeoutCountdownInterval);
    if (apiAbortController) apiAbortController.abort();
    showToast("Switched directly to Curated Local Questions.");
    startLocalQuiz();
  };

  try {
    const questions = await fetchGeminiQuiz(apiKey, currentConfig, apiAbortController.signal);
    clearInterval(timeoutCountdownInterval);

    if (questions && Array.isArray(questions) && questions.length > 0) {
      quizState.isLocalSource = false;
      startQuiz(questions, currentConfig);
    } else {
      throw new Error("Invalid questions array received.");
    }
  } catch (error) {
    clearInterval(timeoutCountdownInterval);
    if (error.name === "AbortError") {
      // Handled by countdown or button
      return;
    }
    console.warn("Gemini API call failed, falling back to local questions:", error);
    showToast(`⚠️ Gemini AI high traffic/limit: ${error.message}. Loaded Curated Local Questions!`, true);
    startLocalQuiz();
  }
});

function startLocalQuiz() {
  hideLoadingView();
  const questions = getLocalQuestions(currentConfig.subject, currentConfig.difficulty, currentConfig.questionCount);
  quizState.isLocalSource = true;
  startQuiz(questions, currentConfig);
}

/**
 * Fetch from Gemini AI
 */
async function fetchGeminiQuiz(apiKey, config, abortSignal) {
  updateLoadingStep(1);

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${encodeURIComponent(apiKey)}`;

  const promptText = `
You are a senior Board Exam paper setter. Generate an accurate multiple-choice question (MCQ) quiz for:
- Subject: ${config.subject}
- Chapter/Topic: ${config.chapter}
- Difficulty: ${config.difficulty}
- Total Questions: ${config.questionCount}

Return strictly a valid JSON array of question objects adhering to this schema:
[
  {
    "id": 1,
    "topic": "Specific subtopic concept name",
    "difficulty": "${config.difficulty}",
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed step-by-step reasoning explaining why this is the correct answer"
  }
]

RULES:
- "correctAnswer" MUST be the 0-based integer index (0 for Option A, 1 for B, 2 for C, 3 for D).
- Output ONLY raw JSON array. Do NOT wrap in \`\`\`json markdown blocks or include pre/post notes.
`.trim();

  updateLoadingStep(2);

  const requestBody = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7
    }
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify(requestBody),
    signal: abortSignal
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  updateLoadingStep(3);

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Empty response from Gemini.");

  const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

/**
 * Retrieve & adapt curated local questions
 */
function getLocalQuestions(subject, difficulty, count) {
  const bank = LOCAL_QUESTION_BANK[subject] || LOCAL_QUESTION_BANK.physics;
  
  // Clone questions
  let pool = JSON.parse(JSON.stringify(bank));

  // If count is greater than pool, repeat or shuffle
  let result = [];
  while (result.length < count) {
    // shuffle
    const shuffled = pool.sort(() => Math.random() - 0.5);
    for (const q of shuffled) {
      if (result.length < count) {
        result.push({
          ...q,
          id: result.length + 1
        });
      }
    }
  }
  return result;
}

// =========================================================================
// ⏳ Loading View Controls
// =========================================================================
function showLoadingView(config) {
  formView.classList.add("hidden");
  quizPlayerView.classList.add("hidden");
  quizResultsView.classList.add("hidden");
  loadingView.classList.remove("hidden");

  loadingTitle.textContent = `Generating ${config.questionCount} ${capitalize(config.difficulty)} Questions...`;
  loadingSubtitle.textContent = `Querying Google Gemini AI (10s timeout before switching to Local Bank)`;
  updateLoadingStep(1);
}

function hideLoadingView() {
  loadingView.classList.add("hidden");
  if (timeoutCountdownInterval) clearInterval(timeoutCountdownInterval);
}

function updateLoadingStep(stepNum) {
  const steps = [loadStep1, loadStep2, loadStep3];
  steps.forEach((step, idx) => {
    if (idx + 1 < stepNum) {
      step.className = "step-item step-done";
      step.querySelector(".step-check").textContent = "✓";
    } else if (idx + 1 === stepNum) {
      step.className = "step-item step-active";
      step.querySelector(".step-check").textContent = "⏳";
    } else {
      step.className = "step-item";
      step.querySelector(".step-check").textContent = "○";
    }
  });
}

// =========================================================================
// 🎮 Interactive Quiz Player Engine
// =========================================================================
function startQuiz(questions, config) {
  quizState.questions = questions;
  quizState.currentIndex = 0;
  quizState.userAnswers = {};
  quizState.timerSeconds = 0;

  if (quizState.timerInterval) clearInterval(quizState.timerInterval);

  // Set Metadata Badges
  quizMetaSubject.textContent = capitalize(config.subject);
  quizMetaChapter.textContent = config.chapter;
  quizMetaDifficulty.textContent = capitalize(config.difficulty);
  quizMetaSource.textContent = quizState.isLocalSource ? "📚 Curated Bank" : "✨ Gemini AI";

  startQuizTimer();

  switchView("player");

  renderQuestionPalette();
  renderCurrentQuestion();
}

function startQuizTimer() {
  quizTimerText.textContent = "00:00";
  quizState.timerInterval = setInterval(() => {
    quizState.timerSeconds++;
    quizTimerText.textContent = formatTime(quizState.timerSeconds);
  }, 1000);
}

function formatTime(totalSecs) {
  const mins = String(Math.floor(totalSecs / 60)).padStart(2, "0");
  const secs = String(totalSecs % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function renderQuestionPalette() {
  questionPalette.innerHTML = "";
  quizState.questions.forEach((_, idx) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "palette-dot";
    dot.textContent = idx + 1;
    dot.title = `Jump to Question ${idx + 1}`;

    if (idx === quizState.currentIndex) dot.classList.add("active");
    if (quizState.userAnswers[idx] !== undefined) dot.classList.add("answered");

    dot.addEventListener("click", () => {
      quizState.currentIndex = idx;
      renderCurrentQuestion();
    });

    questionPalette.appendChild(dot);
  });
}

function renderCurrentQuestion() {
  const currentQ = quizState.questions[quizState.currentIndex];
  if (!currentQ) return;

  const total = quizState.questions.length;
  const currNum = quizState.currentIndex + 1;

  questionCounterText.textContent = `Question ${currNum} of ${total}`;
  activeQBadge.textContent = `Q${currNum}`;
  activeQTopicTag.textContent = currentQ.topic || "Core Concept";
  quizProgressFill.style.width = `${(currNum / total) * 100}%`;

  const answeredCount = Object.keys(quizState.userAnswers).length;
  answeredCounterText.textContent = `${answeredCount} of ${total} Answered`;

  questionText.textContent = currentQ.question;

  // Options
  optionsContainer.innerHTML = "";
  const prefixes = ["A", "B", "C", "D"];
  const userSelected = quizState.userAnswers[quizState.currentIndex];
  const isAnswered = userSelected !== undefined;
  const instantMode = instantFeedbackCheckbox.checked;

  currentQ.options.forEach((optText, optIdx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";

    if (userSelected === optIdx) {
      btn.classList.add("selected");
    }

    // Instant Feedback Mode styling
    if (instantMode && isAnswered) {
      if (optIdx === currentQ.correctAnswer) {
        btn.classList.add("instant-correct");
      } else if (optIdx === userSelected) {
        btn.classList.add("instant-wrong");
      }
    }

    btn.innerHTML = `
      <span class="option-prefix">${prefixes[optIdx] || optIdx + 1}</span>
      <span class="option-text">${optText}</span>
    `;

    btn.addEventListener("click", () => {
      selectOption(optIdx);
    });

    optionsContainer.appendChild(btn);
  });

  // Explanation in Instant Feedback mode
  if (instantMode && isAnswered) {
    const isCorrect = userSelected === currentQ.correctAnswer;
    explanationBox.classList.remove("hidden");
    expResultTitle.textContent = isCorrect ? "Correct!" : "Incorrect Answer";
    expResultIcon.textContent = isCorrect ? "✓" : "✕";
    explanationText.textContent = currentQ.explanation || "No explanation available.";
  } else {
    explanationBox.classList.add("hidden");
  }

  // Navigation controls
  prevQuestionBtn.disabled = quizState.currentIndex === 0;

  if (quizState.currentIndex === total - 1) {
    nextQuestionBtn.classList.add("hidden");
    submitQuizBtn.classList.remove("hidden");
  } else {
    nextQuestionBtn.classList.remove("hidden");
    submitQuizBtn.classList.add("hidden");
  }

  updatePaletteStates();
}

function selectOption(optionIndex) {
  quizState.userAnswers[quizState.currentIndex] = optionIndex;
  playAudioCue(true); // Pleasant click feedback

  const currentQ = quizState.questions[quizState.currentIndex];
  const instantMode = instantFeedbackCheckbox.checked;

  // Rerender current question to update instant styling
  renderCurrentQuestion();
}

function updatePaletteStates() {
  const dots = questionPalette.querySelectorAll(".palette-dot");
  dots.forEach((dot, idx) => {
    dot.classList.remove("active");
    if (idx === quizState.currentIndex) dot.classList.add("active");
    if (quizState.userAnswers[idx] !== undefined) {
      dot.classList.add("answered");
    } else {
      dot.classList.remove("answered");
    }
  });
}

function setupPlayerControls() {
  prevQuestionBtn.addEventListener("click", () => {
    if (quizState.currentIndex > 0) {
      quizState.currentIndex--;
      renderCurrentQuestion();
    }
  });

  nextQuestionBtn.addEventListener("click", () => {
    if (quizState.currentIndex < quizState.questions.length - 1) {
      quizState.currentIndex++;
      renderCurrentQuestion();
    }
  });

  submitQuizBtn.addEventListener("click", () => {
    const total = quizState.questions.length;
    const answeredCount = Object.keys(quizState.userAnswers).length;

    if (answeredCount < total) {
      const ok = confirm(`You have answered ${answeredCount} of ${total} questions. Ready to submit?`);
      if (!ok) return;
    }
    finishQuiz();
  });

  quitQuizBtn.addEventListener("click", () => {
    if (confirm("Exit this quiz? Progress will be lost.")) {
      if (quizState.timerInterval) clearInterval(quizState.timerInterval);
      switchView("form");
    }
  });

  instantFeedbackCheckbox.addEventListener("change", () => {
    renderCurrentQuestion();
  });
}

// Simple synthesizer audio feedback (Web Audio API)
function playAudioCue(isClick = true) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(isClick ? 587.33 : 440, ctx.currentTime); // D5
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Silent fail if audio disabled
  }
}

// =========================================================================
// 🏆 Results, Weak Topics Summary & Dynamic Difficulty
// =========================================================================
function finishQuiz() {
  if (quizState.timerInterval) clearInterval(quizState.timerInterval);

  let correctCount = 0;
  const topicStats = {}; // topic -> { total, correct, sampleTip }

  quizState.questions.forEach((q, idx) => {
    const userSelected = quizState.userAnswers[idx];
    const isCorrect = userSelected === q.correctAnswer;
    if (isCorrect) correctCount++;

    const topic = q.topic || "General Concept";
    if (!topicStats[topic]) {
      topicStats[topic] = { total: 0, correct: 0, explanation: q.explanation };
    }
    topicStats[topic].total++;
    if (isCorrect) topicStats[topic].correct++;
  });

  const total = quizState.questions.length;
  const percentage = Math.round((correctCount / total) * 100);

  // Scorecards
  scoreFraction.textContent = `${correctCount} / ${total}`;
  scorePercentage.textContent = `${percentage}%`;
  timeTakenText.textContent = formatTime(quizState.timerSeconds);

  // Record to Streak & Leaderboard
  recordQuizCompletion(correctCount, total, percentage);

  // Record to Cumulative Performance Analytics & Progress Bars
  updateAnalyticsOnQuizFinish(quizState.questions, quizState.userAnswers, quizState.timerSeconds, currentConfig.subject, currentConfig.difficulty);

  // Performance Badge
  if (percentage >= 80) {
    resultTrophyIcon.textContent = "🏆";
    resultSubtitle.textContent = "Outstanding Performance! High Board Exam Readiness";
  } else if (percentage >= 50) {
    resultTrophyIcon.textContent = "🎯";
    resultSubtitle.textContent = "Solid Attempt! Target your weak topics below";
  } else {
    resultTrophyIcon.textContent = "📚";
    resultSubtitle.textContent = "Foundational Revision Recommended";
  }

  // 1. Weak Topics Summary
  renderWeakTopicsSummary(topicStats);

  // 2. Dynamic Difficulty Adjustment
  setupDifficultyAdjustment(percentage);

  // 3. Detailed Review List
  renderSolutionsReview();

  switchView("results");
}

function renderWeakTopicsSummary(topicStats) {
  weakTopicsList.innerHTML = "";
  const topics = Object.keys(topicStats);

  if (topics.length === 0) {
    weakTopicsList.innerHTML = `<p class="wt-desc">All questions answered accurately!</p>`;
    return;
  }

  topics.forEach((topic) => {
    const stat = topicStats[topic];
    const acc = Math.round((stat.correct / stat.total) * 100);
    const isWeak = acc < 70;

    const row = document.createElement("div");
    row.className = "weak-topic-row";

    row.innerHTML = `
      <div class="wt-left-info">
        <span class="wt-name">${topic} (${stat.correct}/${stat.total} Correct - ${acc}%)</span>
        <span class="wt-tip">${isWeak ? `⚠️ Focus: Review key formulas and conceptual rules for ${topic}.` : `✓ Strong command demonstrated.`}</span>
      </div>
      <span class="wt-tag ${isWeak ? "needs-revision" : "mastered"}">
        ${isWeak ? "Needs Revision" : "Mastered"}
      </span>
    `;

    weakTopicsList.appendChild(row);
  });
}

function setupDifficultyAdjustment(percentage) {
  let recDifficulty = "medium";
  let recTitle = "Retake on Medium";
  let recDesc = "Practice again to reach >90% accuracy before upgrading.";

  if (percentage >= 80) {
    recDifficulty = "hard";
    recTitle = "Upgrade to Hard (HOTS)";
    recDesc = "You achieved high mastery! Challenge yourself with Higher Order Thinking Skills next.";
  } else if (percentage < 50) {
    recDifficulty = "easy";
    recTitle = "Switch to Easy (Fundamentals)";
    recDesc = "Reinforce core definitions and standard formulas first.";
  }

  quizState.recommendedDifficulty = recDifficulty;
  diffRecTitle.textContent = recTitle;
  diffRecDesc.textContent = recDesc;
  applyDiffRecBtn.textContent = `Set ${capitalize(recDifficulty)} & Retake`;

  applyDiffRecBtn.onclick = () => {
    currentConfig.difficulty = recDifficulty;
    // Update radio on form
    document.querySelectorAll(".diff-card").forEach((card) => {
      const val = card.querySelector("input").value;
      card.classList.toggle("active", val === recDifficulty);
      if (val === recDifficulty) card.querySelector("input").checked = true;
    });
    updateLivePreview();
    switchView("form");
    quizForm.dispatchEvent(new Event("submit"));
  };
}

function renderSolutionsReview() {
  reviewQuestionsList.innerHTML = "";
  const prefixes = ["A", "B", "C", "D"];

  quizState.questions.forEach((q, idx) => {
    const userSelected = quizState.userAnswers[idx];
    const isCorrect = userSelected === q.correctAnswer;
    const isAttempted = userSelected !== undefined;

    const item = document.createElement("div");
    item.className = `review-item ${isCorrect ? "correct" : "incorrect"}`;

    const userAnsText = isAttempted
      ? `${prefixes[userSelected]}: ${q.options[userSelected]}`
      : "Not Attempted";

    const correctAnsText = `${prefixes[q.correctAnswer]}: ${q.options[q.correctAnswer]}`;

    item.innerHTML = `
      <div class="review-q-header">
        <div>
          <span class="review-q-num">Question ${idx + 1}</span>
          <span class="topic-tag-badge" style="margin-left: 8px;">${q.topic || "Concept"}</span>
        </div>
        <span class="review-verdict ${isCorrect ? "verdict-correct" : "verdict-incorrect"}">
          ${isCorrect ? "✓ Correct" : isAttempted ? "✕ Incorrect" : "○ Skipped"}
        </span>
      </div>
      <p class="review-q-text">${q.question}</p>
      
      <div class="review-answers-box">
        <div class="review-ans-row">
          <span class="ans-label">Your Choice:</span>
          <span class="ans-val-user ${isCorrect ? "is-correct" : "is-wrong"}">${userAnsText}</span>
        </div>
        ${!isCorrect ? `
          <div class="review-ans-row">
            <span class="ans-label">Correct Option:</span>
            <span class="ans-val-correct">${correctAnsText}</span>
          </div>
        ` : ""}
      </div>

      <div class="review-explanation">
        <strong>Explanation:</strong> ${q.explanation || "No explanation provided."}
      </div>
    `;

    reviewQuestionsList.appendChild(item);
  });
}

// =========================================================================
// 📥 Export Results (.txt) & Print as PDF
// =========================================================================
function setupResultsEvents() {
  newQuizBtn.addEventListener("click", () => {
    switchView("form");
  });

  retakeQuizBtn.addEventListener("click", () => {
    startQuiz(quizState.questions, currentConfig);
  });

  if (resultsViewDashboardBtn) {
    resultsViewDashboardBtn.addEventListener("click", () => {
      switchView("dashboard");
    });
  }

  exportTxtBtn.addEventListener("click", exportResultsAsText);
  printReportBtn.addEventListener("click", () => window.print());
}

function exportResultsAsText() {
  const prefixes = ["A", "B", "C", "D"];
  let correctCount = 0;
  quizState.questions.forEach((q, idx) => {
    if (quizState.userAnswers[idx] === q.correctAnswer) correctCount++;
  });
  const total = quizState.questions.length;
  const percentage = Math.round((correctCount / total) * 100);

  let report = "=========================================================\n";
  report += "           AI BOARD EXAM QUIZ - REPORT CARD               \n";
  report += "=========================================================\n\n";
  report += `Subject:    ${capitalize(currentConfig.subject)}\n`;
  report += `Chapter:    ${currentConfig.chapter}\n`;
  report += `Difficulty: ${capitalize(currentConfig.difficulty)}\n`;
  report += `Date:       ${new Date().toLocaleString()}\n`;
  report += `Time Spent: ${formatTime(quizState.timerSeconds)}\n`;
  report += `Score:      ${correctCount} / ${total} (${percentage}%)\n\n`;
  report += "---------------------------------------------------------\n";
  report += "DETAILED SOLUTIONS & REVIEWS:\n";
  report += "---------------------------------------------------------\n\n";

  quizState.questions.forEach((q, idx) => {
    const userAns = quizState.userAnswers[idx];
    const isCorrect = userAns === q.correctAnswer;
    const isAttempted = userAns !== undefined;

    report += `Q${idx + 1}. [Topic: ${q.topic || "Core Concept"}]\n`;
    report += `${q.question}\n`;
    report += `Your Answer:    ${isAttempted ? prefixes[userAns] + ": " + q.options[userAns] : "Not Attempted"}\n`;
    report += `Correct Answer: ${prefixes[q.correctAnswer]}: ${q.options[q.correctAnswer]}\n`;
    report += `Status:         ${isCorrect ? "CORRECT ✓" : "INCORRECT ✕"}\n`;
    report += `Explanation:    ${q.explanation || "N/A"}\n\n`;
  });

  report += "=========================================================\n";
  report += "Generated by AI Board Exam Quiz Generator\n";

  const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Quiz_Report_${capitalize(currentConfig.subject)}_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// =========================================================================
// Helpers
// =========================================================================
function showError(msg) {
  chapterError.textContent = msg;
  chapterError.classList.add("visible");
  chapterSelect.style.borderColor = "#ef4444";
  customChapterInput.style.borderColor = "#ef4444";
}

function hideError() {
  chapterError.classList.remove("visible");
  chapterSelect.style.borderColor = "";
  customChapterInput.style.borderColor = "";
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}


// =========================================================================
// 📊 DASHBOARD & PERFORMANCE MASTERY CONTROLLER
// =========================================================================

/**
 * Universal View Switcher
 * Handles active tabs, visibility, and dashboard re-rendering
 */
function switchView(viewName) {
  formView.classList.toggle("hidden", viewName !== "form");
  if (dashboardView) dashboardView.classList.toggle("hidden", viewName !== "dashboard");
  loadingView.classList.toggle("hidden", viewName !== "loading");
  quizPlayerView.classList.toggle("hidden", viewName !== "player");
  quizResultsView.classList.toggle("hidden", viewName !== "results");

  if (openGeneratorBtn) openGeneratorBtn.classList.toggle("active-nav", viewName === "form");
  if (openDashboardBtn) openDashboardBtn.classList.toggle("active-nav", viewName === "dashboard");

  if (viewName === "dashboard") {
    renderDashboard();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Analytics Data Storage
 */
function getAnalytics() {
  const saved = localStorage.getItem("boardQuizAnalytics");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return {
    totalQuizzes: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    totalTimeSeconds: 0,
    bySubject: {
      physics: { total: 0, correct: 0 },
      chemistry: { total: 0, correct: 0 },
      mathematics: { total: 0, correct: 0 }
    },
    byDifficulty: {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 }
    },
    topics: {} // topicKey -> { name, subject, total, correct, explanation }
  };
}

function saveAnalytics(data) {
  localStorage.setItem("boardQuizAnalytics", JSON.stringify(data));
}

function updateAnalyticsOnQuizFinish(questions, userAnswers, timeSpent, subject, difficulty) {
  const analytics = getAnalytics();
  let correctCount = 0;

  questions.forEach((q, idx) => {
    const isCorrect = userAnswers[idx] === q.correctAnswer;
    if (isCorrect) correctCount++;

    const topicKey = q.topic || "Core Concept";
    if (!analytics.topics[topicKey]) {
      analytics.topics[topicKey] = {
        name: topicKey,
        subject: subject,
        total: 0,
        correct: 0,
        explanation: q.explanation || ""
      };
    }
    analytics.topics[topicKey].total++;
    if (isCorrect) analytics.topics[topicKey].correct++;
  });

  analytics.totalQuizzes++;
  analytics.totalQuestions += questions.length;
  analytics.totalCorrect += correctCount;
  analytics.totalTimeSeconds += timeSpent;

  if (!analytics.bySubject[subject]) {
    analytics.bySubject[subject] = { total: 0, correct: 0 };
  }
  analytics.bySubject[subject].total += questions.length;
  analytics.bySubject[subject].correct += correctCount;

  if (!analytics.byDifficulty[difficulty]) {
    analytics.byDifficulty[difficulty] = { total: 0, correct: 0 };
  }
  analytics.byDifficulty[difficulty].total += questions.length;
  analytics.byDifficulty[difficulty].correct += correctCount;

  saveAnalytics(analytics);
}

/**
 * Setup Dashboard Event Listeners
 */
function setupDashboardEvents() {
  if (openDashboardBtn) {
    openDashboardBtn.addEventListener("click", () => switchView("dashboard"));
  }
  if (openGeneratorBtn) {
    openGeneratorBtn.addEventListener("click", () => switchView("form"));
  }
  if (dashCreateQuizBtn) {
    dashCreateQuizBtn.addEventListener("click", () => switchView("form"));
  }
  if (dashBottomQuizBtn) {
    dashBottomQuizBtn.addEventListener("click", () => switchView("form"));
  }
  if (dashDemoToggleBtn) {
    dashDemoToggleBtn.addEventListener("click", loadSampleAnalytics);
  }
  if (dashClearStatsBtn) {
    dashClearStatsBtn.addEventListener("click", clearDashboardAnalytics);
  }

  // Quick subject practice buttons on mastery cards
  document.querySelectorAll(".sm-quick-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const targetSubj = e.currentTarget.getAttribute("data-subject");
      if (targetSubj) {
        currentConfig.subject = targetSubj;
        document.querySelectorAll(".subject-card").forEach((c) => {
          const val = c.querySelector('input[type="radio"]').value;
          c.classList.toggle("active", val === targetSubj);
          if (val === targetSubj) c.querySelector('input[type="radio"]').checked = true;
        });
        renderTopicBoxes(targetSubj);
        populateChapters(targetSubj);
        updateLivePreview();
        switchView("form");
        showToast(`Selected ${capitalize(targetSubj)}! Choose a topic and start quiz.`);
      }
    });
  });
}

/**
 * Render Complete Dashboard Metrics & Progress Bars
 */
function renderDashboard() {
  const analytics = getAnalytics();
  const streak = parseInt(localStorage.getItem("boardQuizStreak") || "1", 10);

  // 1. KPI Cards
  if (dashTotalQuizzes) dashTotalQuizzes.textContent = analytics.totalQuizzes;
  if (dashTotalQuestions) dashTotalQuestions.textContent = `${analytics.totalQuestions} Questions Solved`;
  
  const overallAcc = analytics.totalQuestions > 0
    ? Math.round((analytics.totalCorrect / analytics.totalQuestions) * 100)
    : 0;
  if (dashAccuracy) dashAccuracy.textContent = `${overallAcc}%`;
  if (dashStreak) dashStreak.textContent = `${streak} Day${streak > 1 ? "s" : ""} 🔥`;
  if (dashTotalTime) dashTotalTime.textContent = formatTime(analytics.totalTimeSeconds);

  // 2. Subject Mastery Progress Bars
  renderSubjectMasteryBar(analytics.bySubject.physics, dashPhysicsBar, dashPhysicsPercent, dashPhysicsQuestions, dashPhysicsLevel);
  renderSubjectMasteryBar(analytics.bySubject.chemistry, dashChemistryBar, dashChemistryPercent, dashChemistryQuestions, dashChemistryLevel);
  renderSubjectMasteryBar(analytics.bySubject.mathematics, dashMathBar, dashMathPercent, dashMathQuestions, dashMathLevel);

  // 3. Difficulty Breakdown Progress Bars
  renderDifficultyBar(analytics.byDifficulty.easy, dashEasyBar, dashEasyPercent);
  renderDifficultyBar(analytics.byDifficulty.medium, dashMediumBar, dashMediumPercent);
  renderDifficultyBar(analytics.byDifficulty.hard, dashHardBar, dashHardPercent);

  // 4. Weak Topics & Focus Areas List
  renderDashboardWeakTopics(analytics.topics);

  // 5. Mastered Topics List
  renderDashboardMasteredTopics(analytics.topics);
}

function renderSubjectMasteryBar(data, barElem, pctElem, countElem, levelElem) {
  const total = data ? data.total : 0;
  const correct = data ? data.correct : 0;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  if (pctElem) pctElem.textContent = `${pct}%`;
  if (countElem) countElem.textContent = `${correct} / ${total} Correct`;
  if (barElem) barElem.style.width = `${pct}%`;

  if (levelElem) {
    if (total === 0) {
      levelElem.textContent = "Level: Unattempted";
    } else if (pct >= 85) {
      levelElem.textContent = "Level: 🌟 Board Master";
    } else if (pct >= 65) {
      levelElem.textContent = "Level: 🎯 Proficient";
    } else {
      levelElem.textContent = "Level: 🌱 Developing";
    }
  }
}

function renderDifficultyBar(data, barElem, pctElem) {
  const total = data ? data.total : 0;
  const correct = data ? data.correct : 0;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  if (pctElem) pctElem.textContent = `${pct}% (${correct}/${total})`;
  if (barElem) barElem.style.width = `${pct}%`;
}

function renderDashboardWeakTopics(topicsObj) {
  if (!dashWeakList) return;
  dashWeakList.innerHTML = "";
  const topics = Object.values(topicsObj || {});

  // Weak if accuracy < 70% and attempted
  const weakTopics = topics
    .filter((t) => t.total > 0 && ((t.correct / t.total) < 0.7 || (t.total - t.correct) > 0))
    .sort((a, b) => (a.correct / a.total) - (b.correct / b.total));

  if (dashWeakCount) dashWeakCount.textContent = `${weakTopics.length} Topics`;

  if (weakTopics.length === 0) {
    dashWeakList.innerHTML = `
      <div class="dash-empty-notice">
        🎉 No weak topics identified! You have high accuracy on all practiced concepts, or have not taken quizzes yet.
      </div>
    `;
    return;
  }

  weakTopics.forEach((t) => {
    const mistakes = t.total - t.correct;
    const acc = Math.round((t.correct / t.total) * 100);
    const item = document.createElement("div");
    item.className = "dash-weak-item";

    item.innerHTML = `
      <div class="dash-weak-top">
        <div class="dash-weak-title-group">
          <span class="meta-badge" style="text-transform: capitalize;">${t.subject}</span>
          <span class="dash-weak-name">${t.name}</span>
        </div>
        <span class="dash-weak-meta">${t.correct} of ${t.total} Correct (${mistakes} Mistake${mistakes > 1 ? "s" : ""})</span>
      </div>

      <div class="dash-weak-progress-row">
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${acc}%; background: linear-gradient(90deg, #ef4444, #f59e0b);"></div>
        </div>
        <span class="dash-weak-pct">${acc}%</span>
      </div>

      <div class="dash-weak-tip">
        <span>⚠️ Action Plan:</span> Review key definitions & ${t.name} formulas. ${t.explanation ? `(Hint: ${t.explanation.slice(0, 90)}...)` : ""}
      </div>

      <div class="dash-weak-actions">
        <button type="button" class="weak-practice-btn">
          🎯 Practice ${t.name}
        </button>
      </div>
    `;

    item.querySelector(".weak-practice-btn").addEventListener("click", () => {
      practiceSpecificTopic(t.subject, t.name);
    });

    dashWeakList.appendChild(item);
  });
}

function renderDashboardMasteredTopics(topicsObj) {
  if (!dashMasteredList) return;
  dashMasteredList.innerHTML = "";
  const topics = Object.values(topicsObj || {});
  const mastered = topics.filter((t) => t.total >= 1 && (t.correct / t.total) >= 0.8);

  if (mastered.length === 0) {
    dashMasteredList.innerHTML = `<span class="dash-section-hint">Score ≥80% on concepts to earn Mastered badges.</span>`;
    return;
  }

  mastered.forEach((t) => {
    const acc = Math.round((t.correct / t.total) * 100);
    const chip = document.createElement("span");
    chip.className = "mastered-chip";
    chip.innerHTML = `✓ ${t.name} (${acc}%)`;
    dashMasteredList.appendChild(chip);
  });
}

function practiceSpecificTopic(subject, topicName) {
  currentConfig.subject = subject;
  currentConfig.chapter = topicName;

  document.querySelectorAll(".subject-card").forEach((c) => {
    const val = c.querySelector('input[type="radio"]').value;
    c.classList.toggle("active", val === subject);
    if (val === subject) c.querySelector('input[type="radio"]').checked = true;
  });

  renderTopicBoxes(subject);
  populateChapters(subject);
  customChapterInput.value = topicName;
  updateLivePreview();

  switchView("form");
  showToast(`Loaded targeted test topic: "${topicName}" (${capitalize(subject)})`);
}

/**
 * Load Sample Analytics for instant preview
 */
function loadSampleAnalytics() {
  const sample = {
    totalQuizzes: 6,
    totalQuestions: 60,
    totalCorrect: 46,
    totalTimeSeconds: 1140, // 19 mins
    bySubject: {
      physics: { total: 20, correct: 16 },
      chemistry: { total: 20, correct: 15 },
      mathematics: { total: 20, correct: 15 }
    },
    byDifficulty: {
      easy: { total: 20, correct: 18 },
      medium: { total: 30, correct: 23 },
      hard: { total: 10, correct: 5 }
    },
    topics: {
      "Electrostatics & Gauss Law": { name: "Electrostatics & Gauss Law", subject: "physics", total: 4, correct: 2, explanation: "Electric flux Φ = E · A = q / ε₀." },
      "Current Electricity & Drift": { name: "Current Electricity & Drift", subject: "physics", total: 4, correct: 4, explanation: "Drift velocity v_d = eEτ/m." },
      "AC Circuits & Resonance": { name: "AC Circuits & Resonance", subject: "physics", total: 3, correct: 1, explanation: "Resonance frequency f = 1 / (2π√LC)." },
      "Solutions & Colligative Properties": { name: "Solutions & Colligative Properties", subject: "chemistry", total: 4, correct: 4, explanation: "Osmotic pressure π = CRT." },
      "Chemical Kinetics & Rate Constant": { name: "Chemical Kinetics & Rate Constant", subject: "chemistry", total: 4, correct: 2, explanation: "Zero order unit is mol L⁻¹ s⁻¹." },
      "Matrices & Adjoint": { name: "Matrices & Adjoint", subject: "mathematics", total: 4, correct: 4, explanation: "|adj(A)| = |A|^(n - 1)." },
      "Application of Derivatives & Maxima": { name: "Application of Derivatives & Maxima", subject: "mathematics", total: 3, correct: 1, explanation: "Set f'(x) = 0 and verify sign of f''(x)." }
    }
  };

  saveAnalytics(sample);
  renderDashboard();
  showToast("Sample Performance Analytics loaded! Explore mastery bars and weak topics.");
}

/**
 * Clear Dashboard Analytics
 */
function clearDashboardAnalytics() {
  if (confirm("Reset all performance analytics and mastery progress bars?")) {
    localStorage.removeItem("boardQuizAnalytics");
    renderDashboard();
    showToast("Dashboard analytics have been reset.", true);
  }
}
