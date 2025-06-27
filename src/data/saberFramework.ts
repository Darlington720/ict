/**
 * SABER-ICT Framework Data
 * Defines the 8 core policy themes and cross-cutting themes
 */

import { PolicyThemeCode, CrossCuttingThemeCode } from '../types/policy';

export const SABER_POLICY_THEMES = {
  vision_planning: {
    code: 'vision_planning' as PolicyThemeCode,
    name: 'Vision and Planning',
    description: 'Strategic vision, sectoral linkages, funding, institutions, and public-private partnerships',
    subThemes: [
      {
        code: '1.1',
        name: 'Vision/Goals',
        description: 'Clear vision and goals for ICT in education',
        stages: {
          latent: 'No policy or vision for ICT in education',
          emerging: 'Basic policy framework with general ICT goals',
          established: 'Comprehensive policy with specific, measurable goals',
          advanced: 'Transformative vision with innovation and 21st-century skills focus'
        }
      },
      {
        code: '1.2',
        name: 'Sectoral Linkages',
        description: 'Alignment with other education and development policies',
        stages: {
          latent: 'ICT policy operates in isolation',
          emerging: 'Some coordination with education policies',
          established: 'Well-coordinated with education sector plans',
          advanced: 'Fully integrated across all relevant sectors'
        }
      },
      {
        code: '1.3',
        name: 'Funding',
        description: 'Sustainable financing for ICT in education',
        stages: {
          latent: 'Minimal or no dedicated funding',
          emerging: 'Basic funding for infrastructure',
          established: 'Sustained funding for infrastructure and capacity building',
          advanced: 'Comprehensive funding including innovation and research'
        }
      },
      {
        code: '1.4',
        name: 'Institutions',
        description: 'Institutional arrangements for ICT in education',
        stages: {
          latent: 'No dedicated institutional arrangements',
          emerging: 'Basic institutional structure',
          established: 'Coordinated institutional framework',
          advanced: 'Integrated governance with clear accountability'
        }
      },
      {
        code: '1.5',
        name: 'Public-Private Partnerships',
        description: 'Engagement with private sector for ICT in education',
        stages: {
          latent: 'No private sector engagement',
          emerging: 'Ad hoc private sector initiatives',
          established: 'Structured partnerships with monitoring',
          advanced: 'Strategic partnerships with innovation focus'
        }
      }
    ]
  },
  ict_infrastructure: {
    code: 'ict_infrastructure' as PolicyThemeCode,
    name: 'ICT Infrastructure',
    description: 'Electricity, equipment, networking, and technical support systems',
    subThemes: [
      {
        code: '2.1',
        name: 'Electricity',
        description: 'Reliable electricity access for schools',
        stages: {
          latent: 'Systemic electricity shortages',
          emerging: 'Basic electricity in some schools',
          established: 'Reliable electricity in most schools',
          advanced: 'Universal access with backup systems'
        }
      },
      {
        code: '2.2',
        name: 'Equipment/Networking',
        description: 'ICT devices and network infrastructure',
        stages: {
          latent: 'Few or no computers in schools',
          emerging: 'Basic computer labs in some schools',
          established: 'Widespread access to ICT devices',
          advanced: 'Ubiquitous access with BYOD policies'
        }
      },
      {
        code: '2.3',
        name: 'Support/Maintenance',
        description: 'Technical support and maintenance systems',
        stages: {
          latent: 'Ad hoc or no technical support',
          emerging: 'Basic support arrangements',
          established: 'Systematic support with trained staff',
          advanced: 'Comprehensive support with preventive maintenance'
        }
      }
    ]
  },
  teachers: {
    code: 'teachers' as PolicyThemeCode,
    name: 'Teachers',
    description: 'Teacher training, competency standards, support networks, and leadership',
    subThemes: [
      {
        code: '3.1',
        name: 'Training',
        description: 'ICT training for teachers',
        stages: {
          latent: 'No ICT training for teachers',
          emerging: 'Basic ICT skills training',
          established: 'Pedagogical ICT integration training',
          advanced: 'Ongoing professional development in ICT pedagogy'
        }
      },
      {
        code: '3.2',
        name: 'Competency Standards',
        description: 'ICT competency standards for teachers',
        stages: {
          latent: 'No ICT competency standards',
          emerging: 'Basic ICT skills requirements',
          established: 'Comprehensive competency framework',
          advanced: 'Standards embedded in certification and career progression'
        }
      },
      {
        code: '3.3',
        name: 'Networks/Resource Centers',
        description: 'Teacher support networks and resource centers',
        stages: {
          latent: 'No teacher support networks',
          emerging: 'Basic resource sharing',
          established: 'Regional support centers',
          advanced: 'Comprehensive network with online communities'
        }
      },
      {
        code: '3.4',
        name: 'Leadership Training',
        description: 'ICT leadership training for school administrators',
        stages: {
          latent: 'No ICT focus in leadership training',
          emerging: 'Basic ICT awareness for leaders',
          established: 'ICT leadership competency standards',
          advanced: 'Comprehensive ICT leadership development programs'
        }
      }
    ]
  },
  skills_competencies: {
    code: 'skills_competencies' as PolicyThemeCode,
    name: 'Skills and Competencies',
    description: 'Digital literacy and 21st-century skills development',
    subThemes: [
      {
        code: '4.1',
        name: 'Digital Literacy',
        description: 'Digital literacy curriculum and standards',
        stages: {
          latent: 'No digital literacy efforts',
          emerging: 'Basic computer skills curriculum',
          established: 'Comprehensive digital literacy framework',
          advanced: '21st-century skills with critical thinking and creativity'
        }
      },
      {
        code: '4.2',
        name: 'Lifelong Learning',
        description: 'ICT-enabled lifelong learning opportunities',
        stages: {
          latent: 'No ICT-enabled lifelong learning',
          emerging: 'Basic adult education programs',
          established: 'Structured lifelong learning with ICT',
          advanced: 'Comprehensive lifelong learning ecosystem'
        }
      }
    ]
  },
  learning_resources: {
    code: 'learning_resources' as PolicyThemeCode,
    name: 'Learning Resources',
    description: 'Digital content, educational resources, and learning materials',
    subThemes: [
      {
        code: '5.1',
        name: 'Digital Content',
        description: 'Digital learning content and resources',
        stages: {
          latent: 'No digital learning content',
          emerging: 'Basic digital resources available',
          established: 'Curriculum-aligned digital content',
          advanced: 'Comprehensive digital content ecosystem with OER'
        }
      }
    ]
  },
  emis: {
    code: 'emis' as PolicyThemeCode,
    name: 'EMIS (Education Management Information Systems)',
    description: 'ICT use in education management and administration',
    subThemes: [
      {
        code: '6.1',
        name: 'ICT in Management',
        description: 'ICT systems for education management',
        stages: {
          latent: 'No EMIS or basic paper-based systems',
          emerging: 'Basic digital data collection',
          established: 'Comprehensive EMIS with multi-level access',
          advanced: 'Integrated EMIS with public data sharing and analytics'
        }
      }
    ]
  },
  monitoring_evaluation: {
    code: 'monitoring_evaluation' as PolicyThemeCode,
    name: 'Monitoring & Evaluation',
    description: 'Impact measurement, assessment systems, and research & development',
    subThemes: [
      {
        code: '7.1',
        name: 'Impact Measurement',
        description: 'Monitoring and evaluation of ICT in education impact',
        stages: {
          latent: 'Irregular input tracking only',
          emerging: 'Basic output monitoring',
          established: 'Systematic impact evaluation',
          advanced: 'Evidence-based policy decisions with continuous improvement'
        }
      },
      {
        code: '7.2',
        name: 'ICT in Assessments',
        description: 'Use of ICT in student assessments',
        stages: {
          latent: 'No ICT use in assessments',
          emerging: 'Basic computer-based testing',
          established: 'Integrated digital assessment tools',
          advanced: 'Comprehensive formative and summative digital assessments'
        }
      },
      {
        code: '7.3',
        name: 'R&D/Innovation',
        description: 'Research and development in ICT for education',
        stages: {
          latent: 'Minimal or no R&D activities',
          emerging: 'Basic pilot projects',
          established: 'Systematic R&D with dedicated funding',
          advanced: 'Centers of excellence with innovation ecosystems'
        }
      }
    ]
  },
  equity_inclusion_safety: {
    code: 'equity_inclusion_safety' as PolicyThemeCode,
    name: 'Equity, Inclusion, Safety',
    description: 'Addressing disparities, digital safety, and inclusive access',
    subThemes: [
      {
        code: '8.1',
        name: 'Pro-Equity',
        description: 'Addressing digital divides and ensuring equitable access',
        stages: {
          latent: 'No provisions for equity',
          emerging: 'Basic recognition of digital divides',
          established: 'Targeted interventions for disadvantaged groups',
          advanced: 'Comprehensive equity framework addressing all disparities'
        }
      },
      {
        code: '8.2',
        name: 'Digital Safety',
        description: 'Digital citizenship, online safety, and ethics',
        stages: {
          latent: 'No digital safety policies',
          emerging: 'Basic online safety awareness',
          established: 'Comprehensive digital citizenship curriculum',
          advanced: 'Integrated digital ethics and citizenship education'
        }
      }
    ]
  }
};

export const CROSS_CUTTING_THEMES = {
  distance_education: {
    code: 'distance_education' as CrossCuttingThemeCode,
    name: 'Distance Education',
    description: 'Remote and blended learning capabilities',
    stages: {
      latent: 'Minimal distance education capabilities',
      emerging: 'Basic online learning platforms',
      established: 'Structured blended learning programs',
      advanced: 'Comprehensive distance education at scale'
    }
  },
  mobiles: {
    code: 'mobiles' as CrossCuttingThemeCode,
    name: 'Mobile Learning',
    description: 'Strategic use of mobile devices in education',
    stages: {
      latent: 'Mobile devices deterred or banned',
      emerging: 'Limited mobile learning initiatives',
      established: 'Strategic mobile learning programs',
      advanced: 'Comprehensive mobile-first education strategy'
    }
  },
  early_childhood: {
    code: 'early_childhood' as CrossCuttingThemeCode,
    name: 'Early Childhood Development',
    description: 'ICT integration in early childhood education',
    stages: {
      latent: 'No ICT policy for early childhood',
      emerging: 'Basic ICT exposure for young children',
      established: 'Age-appropriate ICT integration',
      advanced: 'Coherent ICT framework for early childhood development'
    }
  },
  open_educational_resources: {
    code: 'open_educational_resources' as CrossCuttingThemeCode,
    name: 'Open Educational Resources',
    description: 'OER policies and repositories',
    stages: {
      latent: 'No OER policy or awareness',
      emerging: 'Basic OER initiatives',
      established: 'National OER repository with clear policies',
      advanced: 'Comprehensive OER ecosystem with IP frameworks'
    }
  },
  community_involvement: {
    code: 'community_involvement' as CrossCuttingThemeCode,
    name: 'Community Involvement',
    description: 'Stakeholder engagement in ICT education',
    stages: {
      latent: 'Community involvement ignored',
      emerging: 'Basic community awareness',
      established: 'Structured community engagement',
      advanced: 'Integral stakeholder participation in governance'
    }
  },
  data_privacy: {
    code: 'data_privacy' as CrossCuttingThemeCode,
    name: 'Data Privacy',
    description: 'Student data protection and privacy policies',
    stages: {
      latent: 'Data privacy unaddressed',
      emerging: 'Basic data protection awareness',
      established: 'Comprehensive data privacy policies',
      advanced: 'Integrated privacy-by-design with strong safeguards'
    }
  }
};

export const STAGE_SCORES = {
  'Latent': 25,
  'Emerging': 50,
  'Established': 75,
  'Advanced': 100
};

export const STAGE_COLORS = {
  'Latent': '#EF4444',      // Red
  'Emerging': '#F59E0B',    // Amber
  'Established': '#3B82F6', // Blue
  'Advanced': '#10B981'     // Green
};