import { Injectable } from '@angular/core';

export interface AlumnusEducation {
  degree: string;
  institution: string;
  year: number;
}

export interface AlumnusExperience {
  role: string;
  company: string;
  from: string;
  to: string; // 'Present' or year string
}

export interface AlumnusMember {
  id: number;
  name: string;
  batch: number;
  industry: string;
  country: string;
  city: string;
  role: string;
  company: string;
  initials: string;
  color: string;
  bio: string;
  skills: string[];
  achievements: string[];
  education: AlumnusEducation[];
  experience: AlumnusExperience[];
  openToMentoring: boolean;
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AlumniService {
  readonly members: AlumnusMember[] = [
    {
      id: 1,
      name: 'Ariful Islam',
      batch: 2018,
      industry: 'Software Engineering',
      country: 'Bangladesh',
      city: 'Dhaka',
      role: 'Senior Software Engineer',
      company: 'Samsung R&D Bangladesh',
      initials: 'AI',
      color: 'bg-sky-600',
      bio: 'Backend-focused engineer with 8+ years building scalable distributed systems. Currently leading the platform services team at Samsung R&D Bangladesh, working on global-scale microservices infrastructure. Passionate about clean architecture, mentoring junior developers, and contributing to open source.',
      skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'AWS', 'PostgreSQL', 'Redis', 'Docker'],
      achievements: [
        'Led migration of monolith to microservices, reducing deployment time by 70%',
        'Speaker at DevFest Dhaka 2024',
        'Open-source contributor to Apache Kafka ecosystem',
        'Samsung R&D "Outstanding Engineer" award 2023',
      ],
      education: [
        { degree: 'B.Sc. in CSE', institution: 'Daffodil International University', year: 2018 },
      ],
      experience: [
        { role: 'Senior Software Engineer', company: 'Samsung R&D Bangladesh', from: '2021', to: 'Present' },
        { role: 'Software Engineer', company: 'BJIT Group', from: '2018', to: '2021' },
      ],
      openToMentoring: true,
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
    },
    {
      id: 2,
      name: 'Nusrat Jahan',
      batch: 2019,
      industry: 'Data Science & AI',
      country: 'USA',
      city: 'San Francisco',
      role: 'ML Engineer',
      company: 'Google',
      initials: 'NJ',
      color: 'bg-violet-600',
      bio: 'Machine learning engineer at Google working on large-scale AI infrastructure powering Search and Google Assistant. Previously completed an M.Sc. in CS at Stanford, specialising in ML systems. Deeply interested in low-resource NLP and making AI accessible to underrepresented languages including Bangla.',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Spark', 'BigQuery', 'Jax', 'Go'],
      achievements: [
        'Co-author of BanglaBERT++ (ACL 2025, 61 citations)',
        'Stanford Graduate Fellowship recipient 2020',
        'Reviewer at NeurIPS 2024 and ACL 2025',
        'Google Peer Bonus Award 2024',
      ],
      education: [
        { degree: 'M.Sc. in Computer Science', institution: 'Stanford University', year: 2022 },
        { degree: 'B.Sc. in CSE', institution: 'Daffodil International University', year: 2019 },
      ],
      experience: [
        { role: 'ML Engineer', company: 'Google', from: '2022', to: 'Present' },
        { role: 'Research Intern', company: 'Stanford NLP Group', from: '2021', to: '2022' },
      ],
      openToMentoring: true,
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      twitter: 'https://twitter.com',
    },
    {
      id: 3,
      name: 'Mahmudul Hasan',
      batch: 2016,
      industry: 'Cloud & DevOps',
      country: 'UK',
      city: 'London',
      role: 'DevOps Lead',
      company: 'Thoughtworks',
      initials: 'MH',
      color: 'bg-emerald-600',
      bio: 'DevOps lead helping enterprise clients across Europe and Asia transform their engineering culture through CI/CD, IaC, and platform engineering. Believer in the idea that developer experience is a product. Co-author of a serverless latency paper accepted at IEEE Cloud 2024.',
      skills: ['Kubernetes', 'AWS', 'Terraform', 'GitHub Actions', 'Ansible', 'Prometheus', 'ArgoCD', 'Python'],
      achievements: [
        'Co-author, IEEE Cloud 2024 (serverless cold-start paper)',
        'Reduced client CI pipeline duration by 65% at a FTSE 100 company',
        'CKA & CKS certified (Kubernetes)',
        'Tech lead for Thoughtworks APAC internal platform initiative',
      ],
      education: [
        { degree: 'B.Sc. in CSE', institution: 'Daffodil International University', year: 2016 },
      ],
      experience: [
        { role: 'DevOps Lead', company: 'Thoughtworks', from: '2020', to: 'Present' },
        { role: 'Cloud Engineer', company: 'Brain Station 23', from: '2016', to: '2020' },
      ],
      openToMentoring: true,
      linkedin: 'https://linkedin.com',
    },
    {
      id: 4,
      name: 'Sadia Rahman',
      batch: 2020,
      industry: 'Product Management',
      country: 'Canada',
      city: 'Toronto',
      role: 'Product Manager',
      company: 'Shopify',
      initials: 'SR',
      color: 'bg-rose-600',
      bio: 'Product manager at Shopify with an engineering background in full-stack web development. I bridged from engineering to PM and love helping other developers make that same transition. Currently driving checkout and payments features used by millions of merchants worldwide.',
      skills: ['Agile / Scrum', 'Figma', 'SQL', 'OKRs', 'A/B Testing', 'Stakeholder Management', 'Product Analytics', 'Road-mapping'],
      achievements: [
        'Led checkout redesign shipped to 3M+ merchants (30% conversion uplift)',
        'Co-authored accessibility research published at CHI 2023',
        'Keynote speaker, ProductWeek Toronto 2024',
        'Forbes "30 Under 30" Technology – Canada, 2025',
      ],
      education: [
        { degree: 'PG Diploma in Product Management', institution: 'University of Toronto', year: 2022 },
        { degree: 'B.Sc. in CSE', institution: 'Daffodil International University', year: 2020 },
      ],
      experience: [
        { role: 'Product Manager', company: 'Shopify', from: '2023', to: 'Present' },
        { role: 'Associate PM', company: 'Wealthsimple', from: '2022', to: '2023' },
        { role: 'Full-Stack Developer', company: 'Nagad', from: '2020', to: '2022' },
      ],
      openToMentoring: true,
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
    {
      id: 5,
      name: 'Tanvir Ahmed',
      batch: 2017,
      industry: 'Cybersecurity',
      country: 'Germany',
      city: 'Berlin',
      role: 'Security Analyst',
      company: 'SAP',
      initials: 'TA',
      color: 'bg-amber-600',
      bio: 'Cybersecurity analyst at SAP SE in Berlin specialising in threat intelligence, vulnerability management, and zero-day research. Published research on GNN-based zero-day detection at CCS 2024. OSCP and CEH certified. Occasional CTF competitor and bug bounty hunter.',
      skills: ['Penetration Testing', 'SIEM', 'ISO 27001', 'Wireshark', 'Python', 'Metasploit', 'GNNs', 'Threat Intel'],
      achievements: [
        'Co-author, ACM CCS 2024 (zero-day GNN detection, 45 citations)',
        'Top 50 global Hack The Box ranking (2024)',
        'Bug bounty: critical CVE reported to Google (2023)',
        'OSCP & CEH dual certified',
      ],
      education: [
        { degree: 'M.Sc. in IT Security', institution: 'TU Berlin', year: 2020 },
        { degree: 'B.Sc. in CSE', institution: 'Daffodil International University', year: 2017 },
      ],
      experience: [
        { role: 'Security Analyst', company: 'SAP SE', from: '2021', to: 'Present' },
        { role: 'Junior Security Engineer', company: 'Deutsche Telekom', from: '2020', to: '2021' },
      ],
      openToMentoring: false,
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
    },
    {
      id: 6,
      name: 'Fariha Begum',
      batch: 2021,
      industry: 'Software Engineering',
      country: 'Bangladesh',
      city: 'Dhaka',
      role: 'Full-Stack Developer',
      company: 'bKash Limited',
      initials: 'FB',
      color: 'bg-pink-600',
      bio: 'Full-stack developer at bKash, Bangladesh\'s largest MFS platform, building consumer-facing payment features serving 60 million users. Also a co-author of SmartGrax, an IoT precision-agriculture paper published at ACM MobiSys 2025. Active contributor to women-in-tech communities in Dhaka.',
      skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Redis', 'IoT', 'Docker', 'Jira'],
      achievements: [
        'Co-author, ACM MobiSys 2025 (SmartGrax IoT paper)',
        'Lead engineer on bKash QR Pay feature (10M+ txns/day)',
        'Women Who Code Dhaka Chapter organiser',
        'Grace Hopper Conference scholarship recipient 2023',
      ],
      education: [
        { degree: 'B.Sc. in CSE', institution: 'Daffodil International University', year: 2021 },
      ],
      experience: [
        { role: 'Full-Stack Developer', company: 'bKash Limited', from: '2021', to: 'Present' },
      ],
      openToMentoring: true,
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
    },
    {
      id: 7,
      name: 'Rakibul Islam',
      batch: 2015,
      industry: 'Entrepreneurship',
      country: 'Bangladesh',
      city: 'Dhaka',
      role: 'Co-Founder & CTO',
      company: 'TechVenture BD',
      initials: 'RI',
      color: 'bg-teal-600',
      bio: 'Serial entrepreneur and CTO who has co-founded two tech startups in Bangladesh. TechVenture BD, a B2B SaaS operations management platform, recently raised BDT 3 crore in seed funding and serves 200+ SMEs. Passionate about building world-class products from Bangladesh for the world.',
      skills: ['Go', 'System Design', 'Leadership', 'Startup Strategy', 'React', 'PostgreSQL', 'Kubernetes', 'Fundraising'],
      achievements: [
        'Raised BDT 3 crore seed round (TechVenture BD, 2026)',
        'ICT Division "Startup of the Year" finalist 2024',
        'Blockchain decentralised identity paper (arXiv 2023)',
        '200+ SME clients across Bangladesh and Nepal',
      ],
      education: [
        { degree: 'B.Sc. in CSE', institution: 'Daffodil International University', year: 2015 },
      ],
      experience: [
        { role: 'Co-Founder & CTO', company: 'TechVenture BD', from: '2020', to: 'Present' },
        { role: 'Software Engineer', company: 'Chaldal', from: '2015', to: '2020' },
      ],
      openToMentoring: true,
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      website: 'https://techventurebd.com',
    },
    {
      id: 8,
      name: 'Sumaiya Akter',
      batch: 2022,
      industry: 'Data Science & AI',
      country: 'Singapore',
      city: 'Singapore',
      role: 'Data Scientist',
      company: 'Grab',
      initials: 'SA',
      color: 'bg-indigo-600',
      bio: 'Data scientist at Grab working on demand forecasting and surge pricing models that power ride-hailing and food delivery across Southeast Asia. Active participant in Kaggle competitions, currently ranked in the top 2% globally. Co-author on the federated learning health data paper at IEEE TMI 2025.',
      skills: ['R', 'Python', 'Tableau', 'NLP', 'Spark', 'BigQuery', 'Time Series', 'XGBoost'],
      achievements: [
        'Kaggle Master (top 2% globally, 2024)',
        'Co-author, IEEE TMI 2025 (federated learning paper, 38 citations)',
        'Grab Data Science "Impact Award" 2024',
        'Speaker, PyData Singapore 2023',
      ],
      education: [
        { degree: 'B.Sc. in CSE', institution: 'Daffodil International University', year: 2022 },
      ],
      experience: [
        { role: 'Data Scientist', company: 'Grab', from: '2022', to: 'Present' },
      ],
      openToMentoring: false,
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
    },
    {
      id: 9,
      name: 'Nafis Hossain',
      batch: 2014,
      industry: 'Academia & Research',
      country: 'USA',
      city: 'Boston',
      role: 'PhD Researcher',
      company: 'MIT CSAIL',
      initials: 'NH',
      color: 'bg-cyan-600',
      bio: 'PhD candidate at MIT CSAIL under Prof. X, researching real-time computer vision for autonomous systems in adverse weather conditions. First author of a CVPR 2024 paper that has garnered 107 citations. Actively mentoring alumni through the PhD application process — happy to review SOPs and research proposals.',
      skills: ['Computer Vision', 'PyTorch', 'LaTeX', 'Networking (SDN)', 'Python', 'C++', 'ROS', 'CUDA'],
      achievements: [
        'First author, CVPR 2024 (traffic sign detection, 107 citations)',
        'Co-author, IEEE INFOCOM 2022 (SDN mesh networking, 52 citations)',
        'NSF Graduate Research Fellowship 2021',
        'MIT Presidential Fellowship recipient',
      ],
      education: [
        { degree: 'PhD in Computer Science (ongoing)', institution: 'MIT', year: 2026 },
        { degree: 'B.Sc. in CSE', institution: 'Daffodil International University', year: 2014 },
      ],
      experience: [
        { role: 'PhD Researcher', company: 'MIT CSAIL', from: '2020', to: 'Present' },
        { role: 'Research Assistant', company: 'BUET CAIL', from: '2014', to: '2020' },
      ],
      openToMentoring: true,
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      website: 'https://nafishossain.mit.edu',
    },
    {
      id: 10,
      name: 'Mehnaz Karim',
      batch: 2023,
      industry: 'Software Engineering',
      country: 'Australia',
      city: 'Melbourne',
      role: 'Junior Developer',
      company: 'Atlassian',
      initials: 'MK',
      color: 'bg-orange-600',
      bio: 'Recent graduate who landed a role at Atlassian\'s Melbourne office less than 4 months after graduating from CSE DIU. Working on the Jira Cloud frontend team with a focus on accessibility and performance. Co-author of SmartGrax, an IoT agriculture paper published at ACM MobiSys 2025.',
      skills: ['TypeScript', 'Angular', 'GraphQL', 'React', 'Jest', 'CSS', 'Accessibility', 'IoT'],
      achievements: [
        'Co-author, ACM MobiSys 2025 (SmartGrax IoT paper)',
        'Secured Atlassian graduate role within 4 months of graduation',
        'Dean\'s List, CSE DIU (2023)',
        'Winner, DIU Hackathon 2022',
      ],
      education: [
        { degree: 'B.Sc. in CSE', institution: 'Daffodil International University', year: 2023 },
      ],
      experience: [
        { role: 'Junior Developer', company: 'Atlassian', from: '2023', to: 'Present' },
      ],
      openToMentoring: false,
      linkedin: 'https://linkedin.com',
    },
    {
      id: 11,
      name: 'Sabbir Hassan',
      batch: 2018,
      industry: 'Cloud & DevOps',
      country: 'UAE',
      city: 'Dubai',
      role: 'Cloud Architect',
      company: 'Microsoft',
      initials: 'SH',
      color: 'bg-lime-600',
      bio: 'Cloud architect at Microsoft Middle East helping enterprises across the Gulf region migrate to Azure. Co-authored a serverless cold-start latency paper at IEEE Cloud 2024. Azure Solutions Architect Expert and DevOps Engineer Expert certified. Occasional hackathon judge in the Dubai startup ecosystem.',
      skills: ['Azure', 'CI/CD', 'Docker', 'Serverless', 'Terraform', 'Python', 'TypeScript', 'Solution Architecture'],
      achievements: [
        'Co-author, IEEE Cloud 2024 (serverless cold-start latency paper)',
        'Azure Solutions Architect Expert certification',
        'Led 15+ enterprise Azure migrations in MENA region',
        'Microsoft MVP nominee 2025',
      ],
      education: [
        { degree: 'B.Sc. in CSE', institution: 'Daffodil International University', year: 2018 },
      ],
      experience: [
        { role: 'Cloud Architect', company: 'Microsoft', from: '2022', to: 'Present' },
        { role: 'Cloud Engineer', company: 'Koenig Solutions', from: '2018', to: '2022' },
      ],
      openToMentoring: true,
      linkedin: 'https://linkedin.com',
    },
    {
      id: 12,
      name: 'Anika Sultana',
      batch: 2020,
      industry: 'Finance & Fintech',
      country: 'UK',
      city: 'Manchester',
      role: 'Fintech Engineer',
      company: 'Revolut',
      initials: 'AS',
      color: 'bg-fuchsia-600',
      bio: 'Fintech engineer at Revolut building high-throughput payment processing systems that handle millions of transactions daily across 35+ currencies. Co-author of a blockchain decentralised identity paper (arXiv 2023). Passionate about financial inclusion and making global payments accessible to underbanked populations.',
      skills: ['Scala', 'Kafka', 'Payment APIs', 'Java', 'PostgreSQL', 'Blockchain', 'Microservices', 'Distributed Systems'],
      achievements: [
        'Co-author, blockchain decentralised identity paper (arXiv 2023, 14 citations)',
        'Revolut "High-Impact Engineer" award Q3 2024',
        'Implemented SWIFT gpi integration reducing settlement time by 80%',
        'Speaker, FinTech Futures Manchester 2024',
      ],
      education: [
        { degree: 'B.Sc. in CSE', institution: 'Daffodil International University', year: 2020 },
      ],
      experience: [
        { role: 'Fintech Engineer', company: 'Revolut', from: '2021', to: 'Present' },
        { role: 'Software Developer', company: 'Nagad', from: '2020', to: '2021' },
      ],
      openToMentoring: true,
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
    },
  ];

  getAll(): AlumnusMember[] {
    return this.members;
  }

  getById(id: number): AlumnusMember | undefined {
    return this.members.find((m) => m.id === id);
  }
}
