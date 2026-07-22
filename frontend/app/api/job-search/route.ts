import { NextResponse } from "next/server";

import type {
  JobSearchApiResponse,
  JobSearchFilters,
  JobSearchRequest,
  JobSearchResult,
  JobSortOption,
} from "@/lib/job-search/types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const MOCK_JOBS: JobSearchResult[] = [
  {
    id: "mock-001",
    externalId: "panthrex-001",
    title: "Junior Software Engineer",
    company: "Northstar Technologies",
    location: "London, United Kingdom",
    description:
      "Northstar Technologies is seeking a Junior Software Engineer to join its product engineering team. You will build and maintain web applications, collaborate with designers and backend engineers, review code, resolve defects, and contribute to technical planning. The role is suitable for a recent graduate or an early-career developer with practical experience in TypeScript, React, Node.js, or Python.",
    shortDescription:
      "Build modern web applications using TypeScript, React, Node.js, and cloud technologies.",
    requirements: [
      "Degree in Computer Science, Software Engineering, or equivalent practical experience",
      "Knowledge of TypeScript, JavaScript, Python, or Java",
      "Understanding of REST APIs and relational databases",
      "Familiarity with Git and collaborative development workflows",
      "Strong communication and problem-solving skills",
    ],
    responsibilities: [
      "Develop and maintain customer-facing web applications",
      "Write clean, tested, and maintainable code",
      "Participate in code reviews and sprint planning",
      "Investigate defects and implement reliable fixes",
      "Collaborate with product, design, and engineering teams",
    ],
    skills: [
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "SQL",
      "Git",
      "REST APIs",
    ],
    employmentType: "full-time",
    workplaceType: "hybrid",
    experienceLevel: "junior",
    salary: {
      minimum: 34000,
      maximum: 42000,
      currency: "GBP",
      period: "year",
      isEstimated: false,
    },
    sponsorshipStatus: "possible",
    sponsorshipEvidence:
      "The employer states that sponsorship may be considered for exceptional candidates.",
    matchScore: 91,
    matchReasons: [
      "Strong alignment with TypeScript and React",
      "Relevant Python and SQL experience",
      "Suitable for an early-career applicant",
    ],
    missingSkills: ["AWS certification"],
    source: "mock",
    sourceLabel: "Panthrex Demo Jobs",
    applicationUrl: "https://example.com/jobs/junior-software-engineer",
    companyLogoUrl: null,
    postedAt: daysAgo(1),
    expiresAt: daysFromNow(29),
    createdAt: daysAgo(1),
  },
  {
    id: "mock-002",
    externalId: "panthrex-002",
    title: "Graduate Data Analyst",
    company: "Meridian Financial Services",
    location: "London, United Kingdom",
    description:
      "Meridian Financial Services is recruiting a Graduate Data Analyst to support reporting, customer analytics, and operational decision-making. You will clean datasets, develop dashboards, write SQL queries, communicate findings, and work with analysts across finance and risk teams.",
    shortDescription:
      "Analyse financial datasets, create dashboards, and deliver actionable business insights.",
    requirements: [
      "Degree in Data Science, Computer Science, Mathematics, Economics, or a related field",
      "Strong SQL and spreadsheet skills",
      "Experience with Python for data analysis",
      "Understanding of statistics and data visualisation",
      "Ability to explain technical findings clearly",
    ],
    responsibilities: [
      "Prepare and validate datasets",
      "Develop recurring reports and dashboards",
      "Perform exploratory data analysis",
      "Translate business questions into analytical tasks",
      "Present findings to technical and non-technical stakeholders",
    ],
    skills: [
      "Python",
      "SQL",
      "Pandas",
      "Excel",
      "Power BI",
      "Statistics",
      "Data Visualisation",
    ],
    employmentType: "graduate",
    workplaceType: "hybrid",
    experienceLevel: "entry",
    salary: {
      minimum: 30000,
      maximum: 36000,
      currency: "GBP",
      period: "year",
      isEstimated: false,
    },
    sponsorshipStatus: "available",
    sponsorshipEvidence:
      "The employer confirms that Skilled Worker sponsorship is available for eligible candidates.",
    matchScore: 94,
    matchReasons: [
      "Strong Python and SQL alignment",
      "Relevant data mining and statistics background",
      "Graduate-level role matches current career stage",
    ],
    missingSkills: ["Power BI commercial experience"],
    source: "mock",
    sourceLabel: "Panthrex Demo Jobs",
    applicationUrl: "https://example.com/jobs/graduate-data-analyst",
    companyLogoUrl: null,
    postedAt: daysAgo(2),
    expiresAt: daysFromNow(27),
    createdAt: daysAgo(2),
  },
  {
    id: "mock-003",
    externalId: "panthrex-003",
    title: "Machine Learning Engineer",
    company: "Cobalt AI Labs",
    location: "Cambridge, United Kingdom",
    description:
      "Cobalt AI Labs is hiring a Machine Learning Engineer to develop, evaluate, and deploy predictive models. The successful candidate will work with Python, PyTorch, scikit-learn, model APIs, experiment tracking, and cloud deployment pipelines.",
    shortDescription:
      "Develop and deploy machine learning systems using Python, PyTorch, and cloud infrastructure.",
    requirements: [
      "Strong Python programming skills",
      "Experience with PyTorch, TensorFlow, or scikit-learn",
      "Understanding of model evaluation and data leakage",
      "Experience exposing models through APIs",
      "Knowledge of software engineering best practices",
    ],
    responsibilities: [
      "Train and evaluate machine learning models",
      "Build reproducible experimentation pipelines",
      "Deploy models through production APIs",
      "Monitor model quality and data drift",
      "Collaborate with data and platform engineers",
    ],
    skills: [
      "Python",
      "PyTorch",
      "scikit-learn",
      "FastAPI",
      "Docker",
      "AWS",
      "Machine Learning",
    ],
    employmentType: "full-time",
    workplaceType: "hybrid",
    experienceLevel: "mid",
    salary: {
      minimum: 50000,
      maximum: 68000,
      currency: "GBP",
      period: "year",
      isEstimated: false,
    },
    sponsorshipStatus: "available",
    sponsorshipEvidence:
      "Visa sponsorship is listed as available for candidates meeting the technical requirements.",
    matchScore: 87,
    matchReasons: [
      "Strong alignment with Python and PyTorch",
      "Relevant FastAPI project experience",
      "Machine learning portfolio matches core responsibilities",
    ],
    missingSkills: [
      "Production Kubernetes experience",
      "Commercial MLOps experience",
    ],
    source: "mock",
    sourceLabel: "Panthrex Demo Jobs",
    applicationUrl: "https://example.com/jobs/machine-learning-engineer",
    companyLogoUrl: null,
    postedAt: daysAgo(3),
    expiresAt: daysFromNow(24),
    createdAt: daysAgo(3),
  },
  {
    id: "mock-004",
    externalId: "panthrex-004",
    title: "Fraud Analytics Associate",
    company: "Sterling Digital Bank",
    location: "London, United Kingdom",
    description:
      "Sterling Digital Bank is looking for a Fraud Analytics Associate to support transaction monitoring, fraud detection, risk analysis, and investigative reporting. You will analyse behavioural and transaction data, identify suspicious patterns, improve detection rules, and assist fraud operations teams.",
    shortDescription:
      "Use transaction data and machine learning techniques to identify and reduce financial fraud.",
    requirements: [
      "Experience analysing structured datasets",
      "Strong SQL and Python skills",
      "Understanding of fraud, risk, or financial crime concepts",
      "Knowledge of classification metrics and imbalanced datasets",
      "Strong written analytical skills",
    ],
    responsibilities: [
      "Analyse suspicious customer and transaction activity",
      "Improve fraud detection rules and thresholds",
      "Build analytical reports for fraud operations",
      "Evaluate detection performance",
      "Support investigations with data-driven evidence",
    ],
    skills: [
      "Python",
      "SQL",
      "Fraud Detection",
      "Machine Learning",
      "Risk Analytics",
      "Data Mining",
      "Tableau",
    ],
    employmentType: "full-time",
    workplaceType: "hybrid",
    experienceLevel: "junior",
    salary: {
      minimum: 38000,
      maximum: 47000,
      currency: "GBP",
      period: "year",
      isEstimated: false,
    },
    sponsorshipStatus: "possible",
    sponsorshipEvidence:
      "The vacancy does not guarantee sponsorship but states that applications from candidates requiring sponsorship may be reviewed.",
    matchScore: 97,
    matchReasons: [
      "Excellent alignment with fraud and AML career goals",
      "Strong Python, SQL, and machine learning overlap",
      "Relevant transaction-network dissertation topic",
    ],
    missingSkills: ["Commercial fraud operations experience"],
    source: "mock",
    sourceLabel: "Panthrex Demo Jobs",
    applicationUrl: "https://example.com/jobs/fraud-analytics-associate",
    companyLogoUrl: null,
    postedAt: daysAgo(1),
    expiresAt: daysFromNow(30),
    createdAt: daysAgo(1),
  },
  {
    id: "mock-005",
    externalId: "panthrex-005",
    title: "AML Data Scientist",
    company: "Atlas Payments",
    location: "Manchester, United Kingdom",
    description:
      "Atlas Payments is seeking an AML Data Scientist to develop analytical models for transaction monitoring and financial-crime detection. You will work with high-volume payment data, graph features, anomaly detection, supervised learning, and model governance.",
    shortDescription:
      "Build machine learning and graph-based models for AML transaction monitoring.",
    requirements: [
      "Advanced Python and SQL skills",
      "Experience with classification or anomaly detection",
      "Understanding of AML or transaction monitoring",
      "Knowledge of model validation and explainability",
      "Experience working with large datasets",
    ],
    responsibilities: [
      "Develop AML detection models",
      "Engineer behavioural and graph-based features",
      "Evaluate models using precision, recall, and PR-AUC",
      "Document model methodology and limitations",
      "Collaborate with compliance and engineering teams",
    ],
    skills: [
      "Python",
      "SQL",
      "AML",
      "Graph Analytics",
      "PyTorch",
      "scikit-learn",
      "Model Explainability",
    ],
    employmentType: "full-time",
    workplaceType: "remote",
    experienceLevel: "mid",
    salary: {
      minimum: 55000,
      maximum: 75000,
      currency: "GBP",
      period: "year",
      isEstimated: false,
    },
    sponsorshipStatus: "available",
    sponsorshipEvidence:
      "The employer is a licensed sponsor and explicitly accepts applicants requiring Skilled Worker sponsorship.",
    matchScore: 96,
    matchReasons: [
      "Direct alignment with graph-based AML dissertation",
      "Strong Python and machine learning match",
      "Relevant experience with imbalanced classification metrics",
    ],
    missingSkills: ["Previous regulated-industry employment"],
    source: "mock",
    sourceLabel: "Panthrex Demo Jobs",
    applicationUrl: "https://example.com/jobs/aml-data-scientist",
    companyLogoUrl: null,
    postedAt: daysAgo(4),
    expiresAt: daysFromNow(25),
    createdAt: daysAgo(4),
  },
  {
    id: "mock-006",
    externalId: "panthrex-006",
    title: "Backend Python Developer",
    company: "Harbour FinTech",
    location: "Bristol, United Kingdom",
    description:
      "Harbour FinTech is hiring a Backend Python Developer to design APIs and data services for its payments platform. You will work with Python, FastAPI, PostgreSQL, Docker, automated testing, and cloud infrastructure.",
    shortDescription:
      "Build secure backend APIs and data services for a growing financial technology platform.",
    requirements: [
      "Strong Python programming ability",
      "Experience building REST APIs",
      "Knowledge of SQL databases",
      "Understanding of testing and version control",
      "Interest in secure financial systems",
    ],
    responsibilities: [
      "Develop FastAPI services",
      "Design and optimise PostgreSQL queries",
      "Write unit and integration tests",
      "Review code and technical designs",
      "Support cloud deployments",
    ],
    skills: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Docker",
      "REST APIs",
      "Git",
      "AWS",
    ],
    employmentType: "full-time",
    workplaceType: "remote",
    experienceLevel: "junior",
    salary: {
      minimum: 40000,
      maximum: 52000,
      currency: "GBP",
      period: "year",
      isEstimated: false,
    },
    sponsorshipStatus: "possible",
    sponsorshipEvidence:
      "Sponsorship may be considered after technical assessment.",
    matchScore: 92,
    matchReasons: [
      "Strong FastAPI and Python alignment",
      "Relevant backend API project experience",
      "FinTech sector matches preferred career direction",
    ],
    missingSkills: ["Commercial PostgreSQL optimisation"],
    source: "mock",
    sourceLabel: "Panthrex Demo Jobs",
    applicationUrl: "https://example.com/jobs/backend-python-developer",
    companyLogoUrl: null,
    postedAt: daysAgo(5),
    expiresAt: daysFromNow(22),
    createdAt: daysAgo(5),
  },
  {
    id: "mock-007",
    externalId: "panthrex-007",
    title: "Data Science Intern",
    company: "Quantum Retail Analytics",
    location: "Edinburgh, United Kingdom",
    description:
      "Quantum Retail Analytics is offering a Data Science internship focused on forecasting, customer segmentation, and experimentation. The intern will assist with data preparation, model development, visualisation, and technical documentation.",
    shortDescription:
      "Gain practical experience in forecasting, segmentation, experimentation, and model development.",
    requirements: [
      "Currently studying a quantitative or computing degree",
      "Python data analysis experience",
      "Basic understanding of machine learning",
      "Ability to work with structured datasets",
      "Clear written communication",
    ],
    responsibilities: [
      "Clean and explore datasets",
      "Support model training and evaluation",
      "Create charts and analytical summaries",
      "Document experiments",
      "Present findings to the analytics team",
    ],
    skills: [
      "Python",
      "Pandas",
      "NumPy",
      "scikit-learn",
      "Matplotlib",
      "Statistics",
    ],
    employmentType: "internship",
    workplaceType: "hybrid",
    experienceLevel: "entry",
    salary: {
      minimum: 24000,
      maximum: 28000,
      currency: "GBP",
      period: "year",
      isEstimated: true,
    },
    sponsorshipStatus: "not-available",
    sponsorshipEvidence:
      "Applicants must already have unrestricted permission to work in the United Kingdom.",
    matchScore: 84,
    matchReasons: [
      "Suitable for a current postgraduate student",
      "Strong Python and machine learning alignment",
      "Relevant academic project experience",
    ],
    missingSkills: ["Forecasting project evidence"],
    source: "mock",
    sourceLabel: "Panthrex Demo Jobs",
    applicationUrl: "https://example.com/jobs/data-science-intern",
    companyLogoUrl: null,
    postedAt: daysAgo(6),
    expiresAt: daysFromNow(19),
    createdAt: daysAgo(6),
  },
  {
    id: "mock-008",
    externalId: "panthrex-008",
    title: "Cloud Software Engineer",
    company: "Vertex Cloud Systems",
    location: "Reading, United Kingdom",
    description:
      "Vertex Cloud Systems is seeking a Cloud Software Engineer to develop scalable services and internal platform tooling. The role includes backend development, containerisation, deployment automation, monitoring, and cloud infrastructure.",
    shortDescription:
      "Develop scalable cloud services using Python, containers, and AWS infrastructure.",
    requirements: [
      "Experience with Python, Java, or TypeScript",
      "Knowledge of Docker and cloud services",
      "Understanding of APIs and distributed systems",
      "Familiarity with CI/CD",
      "Strong troubleshooting skills",
    ],
    responsibilities: [
      "Develop cloud-native backend services",
      "Maintain CI/CD pipelines",
      "Improve observability and monitoring",
      "Automate deployment processes",
      "Resolve platform reliability issues",
    ],
    skills: [
      "Python",
      "AWS",
      "Docker",
      "CI/CD",
      "Terraform",
      "REST APIs",
      "Linux",
    ],
    employmentType: "full-time",
    workplaceType: "hybrid",
    experienceLevel: "mid",
    salary: {
      minimum: 48000,
      maximum: 65000,
      currency: "GBP",
      period: "year",
      isEstimated: false,
    },
    sponsorshipStatus: "available",
    sponsorshipEvidence:
      "Skilled Worker sponsorship is available for qualified software engineers.",
    matchScore: 79,
    matchReasons: [
      "Good Python and API alignment",
      "Relevant AWS Academy experience",
      "Software engineering background supports the role",
    ],
    missingSkills: ["Terraform", "Advanced CI/CD experience"],
    source: "mock",
    sourceLabel: "Panthrex Demo Jobs",
    applicationUrl: "https://example.com/jobs/cloud-software-engineer",
    companyLogoUrl: null,
    postedAt: daysAgo(7),
    expiresAt: daysFromNow(20),
    createdAt: daysAgo(7),
  },
  {
    id: "mock-009",
    externalId: "panthrex-009",
    title: "Risk Modelling Analyst",
    company: "Crown Lending Group",
    location: "Leeds, United Kingdom",
    description:
      "Crown Lending Group is recruiting a Risk Modelling Analyst to support credit-risk model development, validation, monitoring, and reporting. You will analyse borrower data, evaluate model performance, develop scorecards, and communicate risk findings.",
    shortDescription:
      "Develop and monitor credit-risk models for lending decisions.",
    requirements: [
      "Degree in a quantitative discipline",
      "Python, R, SAS, or SQL experience",
      "Understanding of classification models",
      "Knowledge of model-performance metrics",
      "Strong analytical documentation skills",
    ],
    responsibilities: [
      "Develop credit-risk scorecards",
      "Monitor model performance",
      "Analyse portfolio trends",
      "Support model validation",
      "Prepare governance documentation",
    ],
    skills: [
      "Python",
      "SQL",
      "Credit Risk",
      "Logistic Regression",
      "Random Forest",
      "Model Validation",
      "Excel",
    ],
    employmentType: "full-time",
    workplaceType: "hybrid",
    experienceLevel: "junior",
    salary: {
      minimum: 36000,
      maximum: 46000,
      currency: "GBP",
      period: "year",
      isEstimated: false,
    },
    sponsorshipStatus: "possible",
    sponsorshipEvidence:
      "Candidates requiring sponsorship will be considered depending on experience and salary eligibility.",
    matchScore: 95,
    matchReasons: [
      "Excellent match with credit-risk portfolio project",
      "Strong Python and model evaluation alignment",
      "Relevant experience with logistic regression and random forests",
    ],
    missingSkills: ["SAS"],
    source: "mock",
    sourceLabel: "Panthrex Demo Jobs",
    applicationUrl: "https://example.com/jobs/risk-modelling-analyst",
    companyLogoUrl: null,
    postedAt: daysAgo(3),
    expiresAt: daysFromNow(28),
    createdAt: daysAgo(3),
  },
  {
    id: "mock-010",
    externalId: "panthrex-010",
    title: "Full Stack Developer",
    company: "Brightline Digital",
    location: "Birmingham, United Kingdom",
    description:
      "Brightline Digital is hiring a Full Stack Developer to create responsive web interfaces and backend services. The role uses React, Next.js, TypeScript, Node.js, relational databases, and third-party APIs.",
    shortDescription:
      "Build full-stack products using Next.js, React, TypeScript, and Node.js.",
    requirements: [
      "Experience with React and TypeScript",
      "Knowledge of Next.js or a comparable framework",
      "Experience integrating REST APIs",
      "Understanding of SQL databases",
      "Ability to deliver accessible responsive interfaces",
    ],
    responsibilities: [
      "Build frontend pages and reusable components",
      "Develop backend routes and integrations",
      "Maintain application state and validation",
      "Review pull requests",
      "Improve performance and accessibility",
    ],
    skills: [
      "Next.js",
      "React",
      "TypeScript",
      "Node.js",
      "SQL",
      "Tailwind CSS",
      "REST APIs",
    ],
    employmentType: "full-time",
    workplaceType: "remote",
    experienceLevel: "junior",
    salary: {
      minimum: 38000,
      maximum: 50000,
      currency: "GBP",
      period: "year",
      isEstimated: false,
    },
    sponsorshipStatus: "unknown",
    sponsorshipEvidence: null,
    matchScore: 93,
    matchReasons: [
      "Direct Next.js and TypeScript alignment",
      "Strong match with Panthrex project architecture",
      "Relevant frontend and backend integration experience",
    ],
    missingSkills: ["Commercial accessibility testing"],
    source: "mock",
    sourceLabel: "Panthrex Demo Jobs",
    applicationUrl: "https://example.com/jobs/full-stack-developer",
    companyLogoUrl: null,
    postedAt: daysAgo(2),
    expiresAt: daysFromNow(26),
    createdAt: daysAgo(2),
  },
  {
    id: "mock-011",
    externalId: "panthrex-011",
    title: "Junior Java Developer",
    company: "Oakridge Enterprise Software",
    location: "Nottingham, United Kingdom",
    description:
      "Oakridge Enterprise Software is looking for a Junior Java Developer to support the development of business applications and integration services. You will work with Java, Spring Boot, SQL, automated tests, and agile delivery practices.",
    shortDescription:
      "Develop enterprise applications using Java, Spring Boot, and SQL.",
    requirements: [
      "Knowledge of Java and object-oriented programming",
      "Understanding of SQL",
      "Familiarity with REST APIs",
      "Basic testing experience",
      "Ability to work in an agile team",
    ],
    responsibilities: [
      "Develop Java application features",
      "Write automated tests",
      "Fix application defects",
      "Participate in code reviews",
      "Maintain technical documentation",
    ],
    skills: [
      "Java",
      "Spring Boot",
      "SQL",
      "REST APIs",
      "JUnit",
      "Git",
    ],
    employmentType: "full-time",
    workplaceType: "onsite",
    experienceLevel: "junior",
    salary: {
      minimum: 32000,
      maximum: 40000,
      currency: "GBP",
      period: "year",
      isEstimated: false,
    },
    sponsorshipStatus: "not-available",
    sponsorshipEvidence:
      "The employer requires applicants to have existing UK work authorisation.",
    matchScore: 71,
    matchReasons: [
      "Relevant Java and SQL fundamentals",
      "Suitable junior experience level",
    ],
    missingSkills: ["Spring Boot project evidence", "JUnit"],
    source: "mock",
    sourceLabel: "Panthrex Demo Jobs",
    applicationUrl: "https://example.com/jobs/junior-java-developer",
    companyLogoUrl: null,
    postedAt: daysAgo(8),
    expiresAt: daysFromNow(16),
    createdAt: daysAgo(8),
  },
  {
    id: "mock-012",
    externalId: "panthrex-012",
    title: "AI Research Assistant",
    company: "London Centre for Applied AI",
    location: "London, United Kingdom",
    description:
      "The London Centre for Applied AI is recruiting an AI Research Assistant to support experiments in graph machine learning, anomaly detection, and explainable AI. The role includes literature reviews, dataset preparation, model implementation, evaluation, and research reporting.",
    shortDescription:
      "Support applied research in graph machine learning, anomaly detection, and explainable AI.",
    requirements: [
      "Postgraduate study in AI, Data Science, or Computer Science",
      "Strong Python and machine learning skills",
      "Experience reading academic papers",
      "Knowledge of PyTorch",
      "Clear technical writing ability",
    ],
    responsibilities: [
      "Review relevant research literature",
      "Prepare experimental datasets",
      "Implement and evaluate models",
      "Document results and limitations",
      "Contribute to technical reports",
    ],
    skills: [
      "Python",
      "PyTorch",
      "Graph Neural Networks",
      "Research",
      "Machine Learning",
      "Data Analysis",
    ],
    employmentType: "temporary",
    workplaceType: "hybrid",
    experienceLevel: "entry",
    salary: {
      minimum: 35000,
      maximum: 41000,
      currency: "GBP",
      period: "year",
      isEstimated: false,
    },
    sponsorshipStatus: "possible",
    sponsorshipEvidence:
      "Sponsorship eligibility is assessed individually for fixed-term research appointments.",
    matchScore: 90,
    matchReasons: [
      "Strong alignment with graph-based dissertation research",
      "Relevant PyTorch and academic research experience",
      "Postgraduate AI and data science background",
    ],
    missingSkills: ["Published research paper"],
    source: "mock",
    sourceLabel: "Panthrex Demo Jobs",
    applicationUrl: "https://example.com/jobs/ai-research-assistant",
    companyLogoUrl: null,
    postedAt: daysAgo(4),
    expiresAt: daysFromNow(21),
    createdAt: daysAgo(4),
  },
];

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const body = (await request.json()) as Partial<JobSearchRequest>;

    if (!body.filters || typeof body.filters !== "object") {
      return errorResponse(
        "Invalid job search request.",
        "A filters object is required.",
        400,
      );
    }

    const filters = body.filters;

    if (
      typeof filters.query !== "string" ||
      typeof filters.location !== "string"
    ) {
      return errorResponse(
        "Invalid search filters.",
        "Query and location must be strings.",
        400,
      );
    }

    const page = normalisePositiveInteger(body.page, DEFAULT_PAGE);
    const requestedPageSize = normalisePositiveInteger(
      body.pageSize,
      DEFAULT_PAGE_SIZE,
    );
    const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);

    const filteredJobs = filterJobs(MOCK_JOBS, filters);
    const sortedJobs = sortJobs(filteredJobs, filters.sortBy);

    const totalResults = sortedJobs.length;
    const totalPages =
      totalResults === 0 ? 0 : Math.ceil(totalResults / pageSize);

    const safePage =
      totalPages === 0 ? 1 : Math.min(page, totalPages);

    const startIndex = (safePage - 1) * pageSize;
    const jobs = sortedJobs.slice(
      startIndex,
      startIndex + pageSize,
    );

    const response: JobSearchApiResponse = {
      success: true,
      jobs,
      pagination: {
        page: safePage,
        pageSize,
        totalResults,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
      metadata: {
        query: filters.query.trim(),
        location: filters.location.trim(),
        searchedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        sources: ["mock"],
      },
    };

    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error) {
    console.error("Job search API error:", error);

    return errorResponse(
      "Unable to search jobs.",
      error instanceof Error
        ? error.message
        : "An unexpected server error occurred.",
      500,
    );
  }
}

export function GET() {
  const response: JobSearchApiResponse = {
    success: false,
    error: "Method not supported.",
    details:
      "Use a POST request containing filters, page, and pageSize.",
  };

  return NextResponse.json(response, {
    status: 405,
    headers: {
      Allow: "POST",
    },
  });
}

function filterJobs(
  jobs: JobSearchResult[],
  filters: JobSearchFilters,
) {
  const queryTerms = normaliseSearchTerms(filters.query);
  const locationTerms = normaliseSearchTerms(filters.location);

  return jobs.filter((job) => {
    const searchableJobText = [
      job.title,
      job.company,
      job.description,
      job.shortDescription,
      job.location,
      ...job.skills,
      ...job.requirements,
      ...job.responsibilities,
    ]
      .join(" ")
      .toLowerCase();

    const queryMatches =
      queryTerms.length === 0 ||
      queryTerms.some((term) =>
        searchableJobText.includes(term),
      );

    const locationText = job.location.toLowerCase();

    const locationMatches =
      locationTerms.length === 0 ||
      locationTerms.some(
        (term) =>
          locationText.includes(term) ||
          term === "united kingdom" ||
          term === "uk",
      );

    const workplaceMatches =
      filters.workplaceTypes.length === 0 ||
      filters.workplaceTypes.includes(job.workplaceType);

    const employmentMatches =
      filters.employmentTypes.length === 0 ||
      filters.employmentTypes.includes(job.employmentType);

    const experienceMatches =
      filters.experienceLevels.length === 0 ||
      filters.experienceLevels.includes(job.experienceLevel);

    const sponsorshipMatches =
      !filters.sponsorshipOnly ||
      job.sponsorshipStatus === "available" ||
      job.sponsorshipStatus === "possible";

    const minimumSalaryMatches =
      filters.minimumSalary === null ||
      job.salary === null ||
      job.salary.maximum === null ||
      job.salary.maximum >= filters.minimumSalary;

    const maximumSalaryMatches =
      filters.maximumSalary === null ||
      job.salary === null ||
      job.salary.minimum === null ||
      job.salary.minimum <= filters.maximumSalary;

    const postedDateMatches = matchesPostedDate(
      job,
      filters.postedWithinDays,
    );

    return (
      queryMatches &&
      locationMatches &&
      workplaceMatches &&
      employmentMatches &&
      experienceMatches &&
      sponsorshipMatches &&
      minimumSalaryMatches &&
      maximumSalaryMatches &&
      postedDateMatches
    );
  });
}

function sortJobs(
  jobs: JobSearchResult[],
  sortBy: JobSortOption,
) {
  return [...jobs].sort((firstJob, secondJob) => {
    switch (sortBy) {
      case "date":
        return (
          getTimestamp(secondJob.postedAt) -
          getTimestamp(firstJob.postedAt)
        );

      case "salary-high":
        return (
          getMaximumSalary(secondJob) -
          getMaximumSalary(firstJob)
        );

      case "salary-low":
        return (
          getMinimumSalary(firstJob) -
          getMinimumSalary(secondJob)
        );

      case "match-score":
        return (
          (secondJob.matchScore ?? 0) -
          (firstJob.matchScore ?? 0)
        );

      case "relevance":
      default:
        return (
          (secondJob.matchScore ?? 0) -
          (firstJob.matchScore ?? 0)
        );
    }
  });
}

function matchesPostedDate(
  job: JobSearchResult,
  postedWithinDays: number | null,
) {
  if (
    postedWithinDays === null ||
    postedWithinDays <= 0 ||
    job.postedAt === null
  ) {
    return true;
  }

  const postedTimestamp = new Date(job.postedAt).getTime();

  if (Number.isNaN(postedTimestamp)) {
    return true;
  }

  const cutoffTimestamp =
    Date.now() - postedWithinDays * 24 * 60 * 60 * 1000;

  return postedTimestamp >= cutoffTimestamp;
}

function normaliseSearchTerms(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function normalisePositiveInteger(
  value: number | undefined,
  fallback: number,
) {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    return fallback;
  }

  return value;
}

function getTimestamp(value: string | null) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getMaximumSalary(job: JobSearchResult) {
  return (
    job.salary?.maximum ??
    job.salary?.minimum ??
    Number.NEGATIVE_INFINITY
  );
}

function getMinimumSalary(job: JobSearchResult) {
  return (
    job.salary?.minimum ??
    job.salary?.maximum ??
    Number.POSITIVE_INFINITY
  );
}

function errorResponse(
  error: string,
  details: string,
  status: number,
) {
  const response: JobSearchApiResponse = {
    success: false,
    error,
    details,
  };

  return NextResponse.json(response, {
    status,
  });
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}