import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface ResearchPaper {
  id: number;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  venue: string;
  venueType: 'journal' | 'conference' | 'preprint';
  tags: string[];
  doi?: string;
  link: string;
  citations: number;
  featured?: boolean;
}

@Component({
  selector: 'app-research',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './research.component.html',
})
export class ResearchComponent {
  readonly allTags = [
    'All',
    'Machine Learning',
    'NLP',
    'Computer Vision',
    'Cybersecurity',
    'Cloud Computing',
    'IoT',
    'Blockchain',
    'Networking',
    'HCI',
  ];

  readonly years = ['All', '2026', '2025', '2024', '2023', '2022'];

  activeTag = signal('All');
  activeYear = signal('All');
  searchQuery = signal('');

  readonly papers: ResearchPaper[] = [
    {
      id: 1,
      title:
        'Federated Learning for Privacy-Preserving Health Data Analysis in Resource-Constrained Environments',
      authors: ['Nafis Hossain', 'Sumaiya Akter', 'Nusrat Jahan'],
      abstract:
        'We propose a federated learning framework tailored for health data analysis in environments with limited compute and bandwidth. Our approach achieves comparable accuracy to centralised models while preserving patient privacy through differential privacy mechanisms.',
      year: 2025,
      venue: 'IEEE Transactions on Medical Imaging',
      venueType: 'journal',
      tags: ['Machine Learning', 'Privacy'],
      doi: '10.1109/TMI.2025.001',
      link: '#',
      citations: 38,
      featured: true,
    },
    {
      id: 2,
      title: 'BanglaBERT++: Enhanced Contextual Embeddings for Low-Resource Bangla NLP Tasks',
      authors: ['Nusrat Jahan', 'Mehedi Hasan'],
      abstract:
        'We extend the BanglaBERT pre-trained language model with domain-adaptive pre-training and task-specific fine-tuning strategies. Our model sets new state-of-the-art results on sentiment analysis, named-entity recognition, and question answering benchmarks for the Bangla language.',
      year: 2025,
      venue: 'ACL 2025 – Findings',
      venueType: 'conference',
      tags: ['NLP', 'Machine Learning'],
      doi: '10.18653/v1/2025.findings-acl.007',
      link: '#',
      citations: 61,
      featured: true,
    },
    {
      id: 3,
      title:
        'Real-Time Traffic Sign Detection for Autonomous Vehicles in Adverse Weather Using Sparse Transformers',
      authors: ['Nafis Hossain', 'Ariful Islam'],
      abstract:
        'This paper presents a sparse transformer-based architecture for real-time traffic sign detection under rain, fog, and low-light conditions. Evaluated on 50,000+ images, our model achieves 94.2% mAP while running at 60fps on edge hardware.',
      year: 2024,
      venue: 'CVPR 2024',
      venueType: 'conference',
      tags: ['Computer Vision', 'Machine Learning'],
      doi: '10.1109/CVPR.2024.016',
      link: '#',
      citations: 107,
    },
    {
      id: 4,
      title: 'Zero-Day Exploit Detection Using Graph Neural Networks on Network Traffic Flows',
      authors: ['Tanvir Ahmed', 'Mahmudul Hasan'],
      abstract:
        'We model network traffic as dynamic graphs and apply GNNs to detect zero-day exploits without requiring signature databases. Our system reduces false positive rates by 67% compared to traditional SIEM approaches in a real-world enterprise testbed.',
      year: 2024,
      venue: 'ACM CCS 2024',
      venueType: 'conference',
      tags: ['Cybersecurity', 'Machine Learning'],
      doi: '10.1145/3658644.3670352',
      link: '#',
      citations: 45,
    },
    {
      id: 5,
      title:
        'Serverless Cold-Start Latency Reduction via Predictive Warm-Up Scheduling on Multi-Cloud Platforms',
      authors: ['Mahmudul Hasan', 'Sabbir Hassan'],
      abstract:
        'Cold-start latency remains a key challenge in serverless computing. We introduce a lightweight prediction model that pre-warms function instances based on historical invocation patterns, reducing p99 latency by up to 78% across AWS Lambda and Azure Functions.',
      year: 2024,
      venue: 'IEEE Cloud 2024',
      venueType: 'conference',
      tags: ['Cloud Computing'],
      doi: '10.1109/CLOUD.2024.041',
      link: '#',
      citations: 29,
    },
    {
      id: 6,
      title:
        'SmartGrax: An IoT-Driven Precision Agriculture Framework for Smallholder Farmers in Bangladesh',
      authors: ['Mehnaz Karim', 'Fariha Begum', 'Tanvir Ahmed'],
      abstract:
        'SmartGrax is an end-to-end IoT platform enabling smallholder farmers in Bangladesh to monitor soil, water, and crop conditions via low-cost sensors and a mobile app. Field trials across 120 farms showed a 22% yield improvement and 31% reduction in water usage.',
      year: 2025,
      venue: 'ACM MobiSys 2025',
      venueType: 'conference',
      tags: ['IoT'],
      doi: '10.1145/3581791.3596852',
      link: '#',
      citations: 18,
    },
    {
      id: 7,
      title:
        'Decentralised Identity Verification Using Self-Sovereign Identity on Ethereum Layer-2',
      authors: ['Rakibul Islam', 'Anika Sultana'],
      abstract:
        'We design and implement a self-sovereign identity system on an Ethereum Layer-2 rollup, enabling privacy-preserving credential verification at scale. Gas costs are reduced by 94% compared to Ethereum Layer-1 implementations.',
      year: 2023,
      venue: 'arXiv Preprint',
      venueType: 'preprint',
      tags: ['Blockchain'],
      link: '#',
      citations: 14,
    },
    {
      id: 8,
      title:
        'Accessibility Barriers in Mobile Banking Applications: A Heuristic Evaluation of MFS Apps in Bangladesh',
      authors: ['Sadia Rahman', 'Sumaiya Akter'],
      abstract:
        'We conduct a systematic heuristic evaluation of the six largest Mobile Financial Services (MFS) applications in Bangladesh, identifying 134 unique accessibility violations. Recommendations are provided aligned with WCAG 2.1 AA across visual, motor, and cognitive dimensions.',
      year: 2023,
      venue: 'CHI 2023',
      venueType: 'conference',
      tags: ['HCI'],
      doi: '10.1145/3544548.3580851',
      link: '#',
      citations: 33,
    },
    {
      id: 9,
      title:
        'Multi-Hop Routing Optimisation in SDN-Enabled Wireless Mesh Networks for Dense Urban Environments',
      authors: ['Sabbir Hassan', 'Nafis Hossain'],
      abstract:
        'We present an SDN-based multi-hop routing protocol that dynamically balances load and minimises latency in dense urban wireless mesh networks. Simulations on NS-3 with 500-node topologies demonstrate 40% throughput improvement over baseline OLSR.',
      year: 2022,
      venue: 'IEEE INFOCOM 2022',
      venueType: 'conference',
      tags: ['Networking'],
      doi: '10.1109/INFOCOM48880.2022.9796946',
      link: '#',
      citations: 52,
    },
  ];

  filteredPapers = computed(() => {
    const tag = this.activeTag();
    const year = this.activeYear();
    const q = this.searchQuery().toLowerCase();
    return this.papers.filter((p) => {
      const matchTag = tag === 'All' || p.tags.includes(tag);
      const matchYear = year === 'All' || p.year === +year;
      const matchQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.authors.some((a) => a.toLowerCase().includes(q));
      return matchTag && matchYear && matchQ;
    });
  });

  setTag(t: string) {
    this.activeTag.set(t);
  }
  setYear(y: string) {
    this.activeYear.set(y);
  }

  venueIcon(type: string): string {
    return type === 'journal'
      ? 'fa-book-open'
      : type === 'conference'
        ? 'fa-users-line'
        : 'fa-file-lines';
  }

  venueColor(type: string): string {
    return type === 'journal'
      ? 'bg-emerald-100 text-emerald-700'
      : type === 'conference'
        ? 'bg-sky-100 text-sky-700'
        : 'bg-zinc-100 text-zinc-600';
  }
}
