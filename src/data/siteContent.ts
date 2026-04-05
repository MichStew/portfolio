export type WorkExperienceItem = {
  id: string;
  role: string;
  company: string;
  dateRange: string;
  location: string;
  description: string;
  logoSrc?: string;
  logoAlt?: string;
  logoPlaceholder?: string;
  logoScale?: number;
};

export type ResearchExperienceItem = {
  id: string;
  title: string;
  affiliation: string;
  dateRange: string;
  location?: string;
  summary: string;
  focusArea: string;
  description: string;
  link?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export type ExtracurricularItem = {
  id: string;
  title: string;
  organization: string;
  dateRange: string;
  location?: string;
  description: string;
};

export type PersonalLifeItem = {
  id: string;
  title: string;
  description: string;
  imagePlaceholders?: string[];
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
};

export type ProjectItem = {
  id: string;
  title: string;
  context: string;
  dateRange?: string;
  description: string;
  imagePlaceholders: string[];
  mediaVariant?: 'fpga-i2c-diagram';
  imageSrc?: string;
  imageAlt?: string;
  mediaHref?: string;
};

export type SiteContent = {
  name: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
  email: string;
  phone: string;
  headshotSrc?: string;
  headshotAlt?: string;
  seoDescription: string;
  dayQuestion: string;
  education: {
    institution: string;
    degree: string;
    dateRange: string;
    location: string;
    logoSrc?: string;
    logoAlt?: string;
  };
  profile: {
    title: string;
    summary: string;
    recognitions: string[];
  };
  skills: {
    technical: string[];
    commercial: string[];
  };
  workExperience: WorkExperienceItem[];
  researchExperience: ResearchExperienceItem[];
  researchPapers: ResearchExperienceItem[];
  projects: ProjectItem[];
  extracurriculars: ExtracurricularItem[];
  personalLife: PersonalLifeItem[];
};

export const primaryNavItems = [
  { id: 'work-experience', label: 'Work Experience' },
  { id: 'research-experience', label: 'Research Experience' },
  { id: 'extra-curriculars', label: 'Extra-Curriculars' },
  { id: 'personal-life', label: 'Personal Life' },
] as const;

export const siteContent: SiteContent = {
  name: 'Michael Stewart',
  linkedinUrl: 'https://www.linkedin.com/in/mcs46',
  githubUrl: 'https://github.com/MichStew',
  resumeUrl: '/Michael_Stewart_Resume.pdf',
  email: 'stew.mich258@gmail.com',
  phone: '843-297-3658',
  headshotSrc: '/pics/headshot-cropped.jpg',
  headshotAlt: 'Portrait of Michael Stewart',
  seoDescription:
    'Michael Stewart is a computer engineering student blending technical execution with technical sales, research, and product-minded communication.',
  dayQuestion: 'it is your day, what shall you do with it?',
  education: {
    institution: 'University of South Carolina',
    degree: 'B.S.E. in Computer Engineering',
    dateRange: 'August 2022 - December 2026',
    location: 'Columbia, SC',
    logoSrc: '/pics/usc-1801-garnet.png',
    logoAlt: 'USC 1801 spirit mark',
  },
  profile: {
    title: 'Technical + Commercial',
    summary:
      'I am a computer engineering student with a strong interest in the space between technical depth and customer-facing execution. My work spans software, systems thinking, technical communication, and research-facing interface design, and I am most effective in roles where I can translate complex ideas into clear solutions, build trust quickly, and move between engineering conversations and business outcomes with confidence.',
    recognitions: [
      'Won a Nucor sales competition through the Darla Moore School of Business.',
      'Recently competed at Selling with the Bulls.',
      'Contributed to the KiMO demo paper accepted to AAMAS 2026 on knowledge-infused multi-agent orchestration.',
    ],
  },
  skills: {
    technical: [
      'React',
      'React Native',
      'TypeScript',
      'Node.js',
      'Python',
      'Java',
      'C++',
      'Assembly',
      'HTML',
      'CSS',
      'MongoDB',
      'Bluetooth firmware',
      'API integration',
      'Security protocols',
      'OnShape',
      'Fusion 360',
    ],
    commercial: [
      'Technical sales',
      'Consultative communication',
      'Solution design',
      'Customer discovery',
      'Cross-functional collaboration',
      'Presentation and pitching',
      'Relationship building',
      'Stakeholder alignment',
      'Technical storytelling',
      'Interpersonal communication',
    ],
  },
  workExperience: [
    {
      id: 'amarok',
      role: 'Technical Sales Intern',
      company: 'AMAROK, LLC.',
      dateRange: '2025 - Present',
      location: 'Columbia, SC',
      description:
        'At AMAROK, I support Technical Sales Engineers as they translate customer requirements into security system layouts that fit operational constraints. The work puts me between customer needs, technical planning, and cross-functional coordination as teams shape custom security solutions for deployment.',
      logoSrc: '/pics/amarok-wolf-mark.svg',
      logoAlt: 'AMAROK wolf mark',
    },
    {
      id: 'aicqd',
      role: 'Application Design Lead & Full Stack Lead',
      company: 'AICQD',
      dateRange: '2025 - Present',
      location: 'United States',
      description:
        'At AICQD, I lead frontend application design for iOS and Android with React Native while also working across the stack to connect the mobile experience with APIs and database systems. I have also developed firmware for Bluetooth communication between mobile devices, the application, and hardware, which keeps the work grounded in end-to-end product behavior.',
      logoSrc: '/pics/aihdl_logo.png',
      logoAlt: 'AIHDL logo',
      logoScale: 1.65,
    },
  ],
  researchExperience: [
    {
      id: 'aii',
      title: 'Undergraduate Research Assistant',
      affiliation: 'Artificial Intelligence Institute',
      dateRange: '2025 - Present',
      location: 'Columbia, SC',
      summary:
        'Building research-facing interfaces and agentic workflow systems for C3AN applications, including interactive planning and workflow-builder experiences for KiMO.',
      focusArea:
        'TypeScript frontend development, private-server deployment, multi-agent research UI, agentic workflow orchestration, and agent-based systems using Google ADK.',
      description:
        'This work includes building frontend interfaces in TypeScript for C3AN research applications, supporting deployment on private infrastructure, and developing agent-based systems with Google ADK. A major part of the role is making agentic workflows easier to inspect, refine, and extend through interactive planning and workflow-building UI, especially in KiMO where coordination decisions need to stay transparent and human-inspectable.',
    },
  ],
  researchPapers: [
    {
      id: 'kimo-paper',
      title: 'KiMO Demo Paper',
      affiliation: 'AAMAS 2026 Accepted Demo',
      dateRange: '2026 - Continuing',
      summary:
        'Research on KiMO, a knowledge-infused multi-agent orchestrator, accepted as a demo paper at AAMAS 2026.',
      focusArea:
        'Interactive research UI, ontology-guided sub-task planning, registry-guided workflow assembly, and human-inspectable orchestration.',
      description:
        'I worked on the web-based demonstration platform for KiMO, which presents an interactive planning view and an agentic workflow builder for heterogeneous multi-agent systems. The paper centers on explicit coordination through planning ontologies and agent registries, and this is research that will continue through further interface refinement, workflow evaluation, and knowledge-extension capabilities.',
      link: '/50_KiMO_Knowledge_infused_Mult.pdf',
    },
    {
      id: 'cogfatigue',
      title: 'CogFatigue',
      affiliation: 'LLM Reliability Research',
      dateRange: 'Spring 2026',
      summary:
        'Studying how attention, entropy, and context-length behavior can surface model fatigue and hallucination risk.',
      focusArea:
        'Attention drift, entropy tracking, context-length stress testing, and early hallucination detection for AI systems.',
      description:
        'CogFatigue focuses on measuring how AI models drift across attention, entropy, and context length, and using those signals to help prevent and detect hallucinations before failures compound. The work is aimed at making model fatigue more observable so reliability issues can be identified earlier and handled more intentionally.',
      imageSrc: '/pics/cogfatigue-context.png',
      imageAlt: 'CogFatigue context-length drift summary chart',
    },
  ],
  projects: [
    {
      id: 'c3an-interface',
      title: 'C3AN Research Interface',
      context: 'Artificial Intelligence Institute',
      dateRange: '2025 - Present',
      description:
        'A research-facing TypeScript interface built for C3AN applications. The work combines frontend implementation, private infrastructure deployment, and agent-driven workflows into a presentation layer that supports ongoing research activity, including interface patterns for interactive task planning and workflow inspection that also informed the KiMO demo platform.',
      imagePlaceholders: [],
      imageSrc: '/pics/c3anworkflows.png',
      imageAlt: 'C3AN workflow diagram',
    },
    {
      id: 'csiet-database',
      title: 'CSIET Database',
      context: 'Carolina Sales Institute for Engineering and Technology',
      dateRange: '2025 - Present',
      description:
        'A club-facing database project that supported the early structure of CSIET. I helped define the direction of the organization and build the database using React and MongoDB so the group had a working foundation as it grew.',
      imagePlaceholders: [],
      imageSrc: '/pics/csietdb.png',
      imageAlt: 'CSIET member database screenshot',
      mediaHref: 'https://usccsiet.org',
    },
    {
      id: 'freight-predictor',
      title: 'Machine Learning Freight Predictor',
      context: 'Machine Learning Project',
      dateRange: 'Summer 2025',
      description:
        'This project focused on predicting freight costs to reduce quote-to-close time for portable customers, with secure deployment and workflow implementation supported through Databricks Apps.',
      imagePlaceholders: [],
      imageSrc: '/pics/freightpredictor.png',
      imageAlt: 'Freight predictor dashboard screenshot',
    },
    {
      id: 'fpga-i2c',
      title: 'FPGA I2C Bit-Banging',
      context: 'FPGA / Digital Logic',
      description:
        'An FPGA-focused design study where I implemented I2C by bit-banging SDA and SCL directly in logic instead of relying on a dedicated peripheral. The project centered on sequencing start, address, ACK, data, and stop timing in a way that made the bus behavior visible, debuggable, and easy to reason about during bring-up.',
      imagePlaceholders: [],
      imageSrc: '/pics/projectBoard.JPG',
      imageAlt: 'Project board used for the I2C bit-banging project',
    },
    {
      id: 'riscv-processor',
      title: 'RISC-V Processor Architecture',
      context: 'Computer Architecture Class Project',
      description:
        'A class project where I built a RISC-V processor and brought it up on FPGA hardware. The design included jump and branch instructions, so the work centered on datapath control, instruction flow, and debugging how the processor handled real control-flow behavior on the board.',
      imagePlaceholders: [],
      imageSrc: '/pics/foga.jpg',
      imageAlt: 'FPGA hardware used for a class-built RISC-V processor project',
    },
  ],
  extracurriculars: [
    {
      id: 'csiet',
      title: 'Director of Programs',
      organization: 'Carolina Sales Institute for Engineering and Technology',
      dateRange: '2025 - Present',
      location: 'Columbia, SC',
      description:
        'I founded CSIET to create a space focused on engineering, sales, and technical leadership, and helped grow the organization from zero to thirty members within one semester. I also helped define its direction and build the CSIET database using React and MongoDB.',
    },
    {
      id: 'ta',
      title: 'Undergraduate Teaching Assistant',
      organization: 'CSCE-102',
      dateRange: 'Fall 2025',
      location: 'Columbia, SC',
      description:
        'As an undergraduate teaching assistant for CSCE-102, I supported introductory web development instruction and worked directly with more than sixty students on HTML, CSS, and JavaScript fundamentals. I also adapted how I explained material so labs could run more smoothly and effectively.',
    },
    {
      id: 'robotics',
      title: 'Programmer',
      organization: 'Gamecock Robotics',
      dateRange: 'Fall 2024',
      location: 'Columbia, SC',
      description:
        'In Gamecock Robotics, I contributed to software work for competition projects and assisted with applications used in team builds. The role also required close coordination with builders and assemblers to help deliver a finished system on deadline.',
    },
  ],
  personalLife: [
    {
      id: 'garage-gym',
      title: 'Garage & Gym',
      description:
        'I subscribe to the belief that the best engineers get hands on! You can regularly find me rolling around under my mustang... with half the drivetrain sitting in the garage.',
      imageSrc: '/pics/clutchjob.jpg',
      imageAlt: 'Photo taken while changing my clutch',
      imageCaption: '(Pic I took when changing my clutch.)',
    },
    {
      id: 'friends-community',
      title: 'Friends & Community',
      description:
        `Community is huge to me! I live with 3 of my best friends (2 of which I've known since high school), see my brother as often as I can, and love meeting new people!`,
      imageSrc: '/pics/friends.jpeg',
      imageAlt: 'Photo of me spending time with friends',
    },
    {
      id: 'this-season',
      title: 'This Season',
      description:
        'Life is always changing! Along with graduation, my fiance and I will be getting married July 19th, 2026! We are really looking forward to planting roots and building a family!',
      imageSrc: '/pics/fiance.JPG',
      imageAlt: 'Photo of Michael Stewart with his fiancee',
    },
  ],
};
