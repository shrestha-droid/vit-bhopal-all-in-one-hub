import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calculator,
  MapPin,
  Bus,
  Search,
  Star,
  Building2,
  Calendar,
  Clock,
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Filter,
  Bell,
  User,
  Award,
  Sparkles,
  ExternalLink,
  Info,
  Shield,
  FileText,
  Navigation,
  Check,
  X,
  UserCheck,
  TrendingUp,
  Phone,
  School,
  Share2,
  AlertCircle
} from 'lucide-react';
import { Pages, Link, Grain, Cursor, Marquee, Reveal, CountUp } from './kit';

// --- DATA STRUCTURES & SAMPLE ACADEMIC CONTENT ---

interface Professor {
  id: string;
  name: string;
  cabin: string; // e.g. AB1-314 or AB2-402
  block: 'AB1' | 'AB2';
  school: 'SCSE' | 'SASL' | 'SEEE' | 'VITBS';
  designation: string;
  specialization: string;
  rating: number;
  totalReviews: number;
  teachingClarity: number;
  gradingFairness: number;
  strictness: number; // 1-5
  tags: string[];
  recentComment: string;
}

const INITIAL_PROFESSORS: Professor[] = [
  {
    id: 'p1',
    name: 'Dr. Suresh K. Mukherjee',
    cabin: 'AB1-314',
    block: 'AB1',
    school: 'SCSE',
    designation: 'Associate Professor',
    specialization: 'Advanced Algorithms & Distributed Systems',
    rating: 4.8,
    totalReviews: 64,
    teachingClarity: 4.9,
    gradingFairness: 4.7,
    strictness: 3.2,
    tags: ['Office Hours Open', 'Fair CAT Marking', 'Research Oriented'],
    recentComment: 'Exceptional clarity during algorithm tracing. Encourages doubt clarification in cabin post-lunch.'
  },
  {
    id: 'p2',
    name: 'Dr. Ananya Sharma',
    cabin: 'AB2-402',
    block: 'AB2',
    school: 'SCSE',
    designation: 'Professor & Lab Head',
    specialization: 'Deep Learning & Neural Networks',
    rating: 4.9,
    totalReviews: 82,
    teachingClarity: 4.9,
    gradingFairness: 4.8,
    strictness: 2.8,
    tags: ['Hands-on GPU Labs', 'Student Friendly', 'Quick Feedback'],
    recentComment: 'Her PyTorch walkthroughs in AB2 computer labs make complex architectures feel completely intuitive.'
  },
  {
    id: 'p3',
    name: 'Prof. Rahul Verma',
    cabin: 'AB1-108',
    block: 'AB1',
    school: 'SASL',
    designation: 'Assistant Professor',
    specialization: 'Linear Algebra & Probability Theory',
    rating: 4.3,
    totalReviews: 41,
    teachingClarity: 4.4,
    gradingFairness: 4.2,
    strictness: 4.5,
    tags: ['Strict 75% Attendance', 'Standard Quizzes', 'Concept Driven'],
    recentComment: 'Very methodical on blackboard deductions. Be on time for slot 8:30 AM or door closes.'
  },
  {
    id: 'p4',
    name: 'Dr. Meenakshi Sundaram',
    cabin: 'AB2-219',
    block: 'AB2',
    school: 'SEEE',
    designation: 'Associate Professor',
    specialization: 'Embedded Systems & IoT Hardware',
    rating: 4.6,
    totalReviews: 53,
    teachingClarity: 4.7,
    gradingFairness: 4.5,
    strictness: 3.5,
    tags: ['Helpful in PCB Lab', 'Encourages Patents', 'Approachable'],
    recentComment: 'Spent 45 minutes in AB2-219 helping our team debug SPI communication for our capstone kit.'
  },
  {
    id: 'p5',
    name: 'Prof. Vikramaditya Joshi',
    cabin: 'AB1-415',
    block: 'AB1',
    school: 'SCSE',
    designation: 'Associate Professor',
    specialization: 'Operating Systems & Kernel Architecture',
    rating: 4.7,
    totalReviews: 70,
    teachingClarity: 4.8,
    gradingFairness: 4.6,
    strictness: 3.0,
    tags: ['Real Linux Labs', 'Active Discussions', 'Well Paced'],
    recentComment: 'Explains virtual memory paging and context switching with real kernel trace examples. Highly recommended.'
  },
  {
    id: 'p6',
    name: 'Dr. Pooja Rathore',
    cabin: 'AB2-112',
    block: 'AB2',
    school: 'VITBS',
    designation: 'Assistant Professor',
    specialization: 'Quantitative Economics & Fintech',
    rating: 4.5,
    totalReviews: 38,
    teachingClarity: 4.6,
    gradingFairness: 4.4,
    strictness: 2.9,
    tags: ['Case Study Method', 'Industry Connect', 'Engaging Slides'],
    recentComment: 'Case-study discussions on algorithmic trading are sharp and tie current Indian market regulations.'
  }
];

interface CourseRow {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
}

const GRADE_POINTS: Record<string, number> = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 4,
  F: 0
};

interface CampusLocation {
  id: string;
  name: string;
  type: 'academic' | 'residential' | 'amenity' | 'transit';
  code: string;
  walkingFromGate: string;
  description: string;
  coordinates: { x: number; y: number };
}

const CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    id: 'ab1',
    name: 'Academic Block 1 (AB1)',
    type: 'academic',
    code: 'AB1',
    walkingFromGate: '4 mins',
    description: 'Central administrative offices, Dean SCSE cabin wing, Main Auditorium, and Computing Labs 1-8.',
    coordinates: { x: 38, y: 35 }
  },
  {
    id: 'ab2',
    name: 'Academic Block 2 (AB2)',
    type: 'academic',
    code: 'AB2',
    walkingFromGate: '7 mins',
    description: 'High Performance Computing Center, Architecture Studios, Electronics & Robotics workshops.',
    coordinates: { x: 55, y: 30 }
  },
  {
    id: 'lc',
    name: 'Learning Centre (Central Library)',
    type: 'amenity',
    code: 'LC-LIB',
    walkingFromGate: '5 mins',
    description: 'Multi-tiered quiet study floor, IEEE digital repository access, and 24/7 exam reading hall.',
    coordinates: { x: 47, y: 44 }
  },
  {
    id: 'bh-cluster',
    name: 'Boys Hostels (BH 1-6 Complex)',
    type: 'residential',
    code: 'BH-ZONE',
    walkingFromGate: '12 mins',
    description: 'Student residential quads, nocturnal reading rooms, laundry hubs, and badminton courts.',
    coordinates: { x: 74, y: 58 }
  },
  {
    id: 'gh-cluster',
    name: 'Girls Hostels (GH 1-3 Complex)',
    type: 'residential',
    code: 'GH-ZONE',
    walkingFromGate: '10 mins',
    description: 'Secure student apartments, multi-gym, quiet study alcoves, and internal greens.',
    coordinates: { x: 26, y: 64 }
  },
  {
    id: 'canteen-sac',
    name: 'Student Activity Centre & Dining',
    type: 'amenity',
    code: 'SAC-FC',
    walkingFromGate: '8 mins',
    description: 'Central multi-cuisine food court, stationary desk, student council office, and coffee kiosk.',
    coordinates: { x: 44, y: 60 }
  },
  {
    id: 'bus-terminal',
    name: 'Main Campus Transit Concourse',
    type: 'transit',
    code: 'BUS-BAY',
    walkingFromGate: '1 min',
    description: 'Pick-up bays for Bhopal, Sehore, and Ashta daily college buses and inter-hostel shuttles.',
    coordinates: { x: 22, y: 22 }
  }
];

interface BusSchedule {
  id: string;
  routeNumber: string;
  routeName: string;
  direction: 'to_campus' | 'to_city';
  departureTime: string;
  keyStops: string[];
  vehicle: string;
  status: 'On Schedule' | 'Boarding' | 'Departed';
}

const BUS_SCHEDULES: BusSchedule[] = [
  {
    id: 'b1',
    routeNumber: 'Route 101',
    routeName: 'Bhopal Habibganj (RKMP) ↔ Campus',
    direction: 'to_campus',
    departureTime: '06:45 AM',
    keyStops: ['Habibganj Stn', 'MP Nagar Zone 1', 'Board Office', 'Lalghati Flyover', 'Sehore Toll', 'Kotri Kalan'],
    vehicle: 'MP-04-E-8821',
    status: 'On Schedule'
  },
  {
    id: 'b2',
    routeNumber: 'Route 102',
    routeName: 'Bhopal Lalghati / Bairagarh ↔ Campus',
    direction: 'to_campus',
    departureTime: '07:15 AM',
    keyStops: ['Bairagarh Gurudwara', 'Halalpur Bus Stand', 'Khajuri', 'Kotri Kalan Gate 1'],
    vehicle: 'MP-04-E-8835',
    status: 'Boarding'
  },
  {
    id: 'b3',
    routeNumber: 'Route 201',
    routeName: 'Sehore Town Crescent ↔ Campus',
    direction: 'to_campus',
    departureTime: '07:40 AM',
    keyStops: ['Sehore Bus Stand', 'Town Hall', 'Crescent Waterpark Jn', 'Campus AB1 Bay'],
    vehicle: 'MP-37-P-1140',
    status: 'On Schedule'
  },
  {
    id: 'b4',
    routeNumber: 'Route 301',
    routeName: 'Ashta Bypass Corridor ↔ Campus',
    direction: 'to_campus',
    departureTime: '07:20 AM',
    keyStops: ['Ashta Old Bus Stand', 'Dewas Naka', 'Kotri Kalan Highway Point'],
    vehicle: 'MP-41-E-2311',
    status: 'On Schedule'
  },
  {
    id: 'b5',
    routeNumber: 'Route 101-R',
    routeName: 'Campus ↔ Bhopal Habibganj (Evening)',
    direction: 'to_city',
    departureTime: '04:45 PM',
    keyStops: ['AB1 Concourse', 'Kotri Kalan', 'Lalghati', 'MP Nagar', 'Habibganj Stn'],
    vehicle: 'MP-04-E-8821',
    status: 'On Schedule'
  },
  {
    id: 'b6',
    routeNumber: 'Hostel Shuttle',
    routeName: 'Boys Hostel ↔ Academic Block 1/2 Loop',
    direction: 'to_campus',
    departureTime: 'Every 10 Mins (08:00 - 18:30)',
    keyStops: ['BH-6 Quad', 'BH-2 Gate', 'Girls Hostel Jn', 'LC Library', 'AB1 Portico'],
    vehicle: 'EV Campus Shuttle 03',
    status: 'Boarding'
  }
];

// --- BRAND HEADER COMPONENT ---
function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Mark */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 border border-line bg-canvas flex items-center justify-center text-accent group-hover:border-accent transition-colors">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl tracking-tight text-ink uppercase">
                  VIT Bhopal Connect
                </span>
                <span className="text-[10px] tracking-widest font-mono uppercase px-1.5 py-0.5 border border-line text-muted">
                  KOTRI KALAN
                </span>
              </div>
              <p className="text-xs text-muted font-mono tracking-wider">
                ACADEMIC PORTAL & DIRECTORY
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
            <Link
              to="/"
              className="px-4 py-2 border border-transparent text-ink hover:border-line aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-on-accent transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/professors"
              className="px-4 py-2 border border-transparent text-ink hover:border-line aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-on-accent transition-colors"
            >
              Faculty & Cabins
            </Link>
            <Link
              to="/cgpa"
              className="px-4 py-2 border border-transparent text-ink hover:border-line aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-on-accent transition-colors"
            >
              CGPA Engine
            </Link>
            <Link
              to="/campus"
              className="px-4 py-2 border border-transparent text-ink hover:border-line aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-on-accent transition-colors"
            >
              Campus Map
            </Link>
            <Link
              to="/transit"
              className="px-4 py-2 border border-transparent text-ink hover:border-line aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-on-accent transition-colors"
            >
              Transit & Bus
            </Link>
          </nav>

          {/* Right action indicator */}
          <div className="hidden lg:flex items-center gap-3 border-l border-line pl-6">
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-muted tracking-widest block">
                TERM 2024–25
              </span>
              <span className="text-xs font-mono font-medium text-ink flex items-center justify-end gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse" />
                FFCS ACTIVE
              </span>
            </div>
          </div>

          {/* Mobile hamburger toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-line text-ink hover:border-accent"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-line bg-surface p-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-mono uppercase border border-line aria-[current=page]:bg-accent aria-[current=page]:text-on-accent"
          >
            Dashboard
          </Link>
          <Link
            to="/professors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-mono uppercase border border-line aria-[current=page]:bg-accent aria-[current=page]:text-on-accent"
          >
            Faculty & Cabins (AB1/AB2)
          </Link>
          <Link
            to="/cgpa"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-mono uppercase border border-line aria-[current=page]:bg-accent aria-[current=page]:text-on-accent"
          >
            CGPA Calculator & Target
          </Link>
          <Link
            to="/campus"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-mono uppercase border border-line aria-[current=page]:bg-accent aria-[current=page]:text-on-accent"
          >
            Kotri Kalan Campus Map
          </Link>
          <Link
            to="/transit"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-mono uppercase border border-line aria-[current=page]:bg-accent aria-[current=page]:text-on-accent"
          >
            Bus Timetables & Shuttles
          </Link>
        </div>
      )}
    </header>
  );
}

// --- FOOTER COMPONENT ---
function Footer() {
  return (
    <footer className="border-t border-line bg-surface text-ink mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-2xl tracking-tight text-ink uppercase">
                VIT Bhopal Connect
              </span>
            </div>
            <p className="text-sm text-muted max-w-md leading-relaxed font-body">
              Independent student-engineered academic utility suite for Vellore Institute of Technology, Bhopal Campus. Built for speed, clarity, and daily campus productivity.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted pt-2">
              <span className="px-2 py-1 border border-line">Kotri Kalan, Sehore Highway</span>
              <span className="px-2 py-1 border border-line">PIN: 466114</span>
              <span className="px-2 py-1 border border-line">MP, INDIA</span>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-muted mb-4">
              Campus Portals
            </h4>
            <ul className="space-y-2 text-xs font-mono text-ink">
              <li>
                <Link to="/professors" className="hover:text-accent flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-muted" /> Rate My Professor (AB1 & AB2)
                </Link>
              </li>
              <li>
                <Link to="/cgpa" className="hover:text-accent flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-muted" /> Interactive CGPA Simulator
                </Link>
              </li>
              <li>
                <Link to="/campus" className="hover:text-accent flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-muted" /> Kotri Kalan Schematic Map
                </Link>
              </li>
              <li>
                <Link to="/transit" className="hover:text-accent flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-muted" /> Bhopal & Sehore Shuttles
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-muted mb-4">
              Academic Notes
            </h4>
            <p className="text-xs text-muted leading-relaxed font-mono">
              Grade computations adhere strictly to VIT Bhopal Academic Regulations (Letter Grades S through F with respective points 10 to 0). Minimum 75% attendance mandatory for FAT examination clearance.
            </p>
            <div className="mt-4 pt-4 border-t border-line text-[11px] font-mono text-muted flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span>Strict Academic Integrity Standard</span>
            </div>
          </div>
        </div>

        <div className="border-t border-line mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-muted">
          <p>© {new Date().getFullYear()} VIT Bhopal Connect. Open Community Academic Suite.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <span>Server Proxy: Local Airgap</span>
            <span>Latency: 2ms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ==========================================
// 1. PAGE: DASHBOARD / OVERVIEW
// ==========================================
function DashboardPage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Editorial Banner */}
      <section className="relative border-b border-line pb-16">
        <Reveal delay={0.1}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-line bg-surface text-accent text-xs font-mono tracking-widest uppercase">
                <span className="w-2 h-2 bg-accent inline-block" />
                Vellore Institute of Technology • Bhopal Campus
              </div>
              <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-ink uppercase leading-[0.95]">
                CAMPUS INTELLIGENCE & ACADEMIC PORTAL.
              </h1>
              <p className="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
                Cabin directory for AB1 & AB2, real-time CGPA target forecaster, bus routes for Bhopal & Sehore, and the Kotri Kalan architectural directory.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/professors"
                className="px-6 py-4 bg-accent text-on-accent font-mono text-xs uppercase tracking-widest font-bold hover:opacity-90 flex items-center justify-center gap-2"
              >
                Find Professor Cabin
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/cgpa"
                className="px-6 py-4 border border-line bg-surface text-ink font-mono text-xs uppercase tracking-widest hover:border-accent flex items-center justify-center gap-2"
              >
                Compute CGPA
                <Calculator className="w-4 h-4 text-accent" />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Live Academic Telemetry strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          <div className="p-6 border border-line bg-surface">
            <div className="text-xs font-mono uppercase text-muted tracking-wider flex items-center justify-between">
              <span>Current Term</span>
              <Calendar className="w-4 h-4 text-accent" />
            </div>
            <div className="mt-3 font-display font-black text-2xl text-ink">
              FALL SEM 24-25
            </div>
            <p className="mt-1 text-xs text-muted font-mono">Classes Active • Week 11</p>
          </div>

          <div className="p-6 border border-line bg-surface">
            <div className="text-xs font-mono uppercase text-muted tracking-wider flex items-center justify-between">
              <span>Credits Required</span>
              <Award className="w-4 h-4 text-accent" />
            </div>
            <div className="mt-3 font-display font-black text-2xl text-ink">
              <CountUp to={160} />
            </div>
            <p className="mt-1 text-xs text-muted font-mono">B.Tech CS Core + Electives</p>
          </div>

          <div className="p-6 border border-line bg-surface">
            <div className="text-xs font-mono uppercase text-muted tracking-wider flex items-center justify-between">
              <span>Campuses Served</span>
              <MapPin className="w-4 h-4 text-accent" />
            </div>
            <div className="mt-3 font-display font-black text-2xl text-ink">
              KOTRI KALAN
            </div>
            <p className="mt-1 text-xs text-muted font-mono">Bhopal-Indore Express Way</p>
          </div>

          <div className="p-6 border border-line bg-surface">
            <div className="text-xs font-mono uppercase text-muted tracking-wider flex items-center justify-between">
              <span>Attendance Gate</span>
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <div className="mt-3 font-display font-black text-2xl text-ink">
              75.0%
            </div>
            <p className="mt-1 text-xs text-muted font-mono">De-registration Threshold</p>
          </div>
        </div>
      </section>

      {/* Marquee highlight strip */}
      <div className="py-2 border-y border-line overflow-hidden bg-surface">
        <Marquee
          items={[
            'CABIN DIRECTORY AB1 & AB2 UPDATED FOR TERM 2024-25',
            'EXAM READING HALL IN LEARNING CENTER OPEN 24/7',
            'BHOPAL HABIBGANJ SHUTTLE DEPARTS AT 06:45 AM SHARP',
            'CAT-2 MARKS PUBLISHED ON VTOP PROXY',
            'SEHORE LOCAL CONNECTIONS RUNNING EVERY 30 MINS'
          ]}
          speed={35}
        />
      </div>

      {/* Key Feature Hubs */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="font-display font-black text-2xl uppercase tracking-tight text-ink">
              CORE PORTAL MODULES
            </h2>
            <p className="text-xs font-mono text-muted uppercase tracking-wider">
              Bespoke academic utilities designed for daily campus life
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Rate My Professor */}
          <div className="p-8 border border-line bg-surface flex flex-col justify-between group hover:border-accent transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 border border-line flex items-center justify-center text-accent bg-canvas group-hover:border-accent transition-colors">
                <School className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">
                CABIN LOCATOR & REVIEWS
              </span>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
                Rate My Professor
              </h3>
              <p className="text-xs text-muted leading-relaxed font-body">
                Search exact faculty cabins in Academic Block 1 and Block 2. Check teaching clarity, quiz difficulty, grading standards, and student tags.
              </p>
            </div>
            <div className="pt-8">
              <Link
                to="/professors"
                className="w-full py-3 border border-line bg-canvas text-ink font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-accent group-hover:text-on-accent group-hover:border-accent transition-colors"
              >
                Browse Faculty Cabins
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: CGPA Calculator */}
          <div className="p-8 border border-line bg-surface flex flex-col justify-between group hover:border-accent transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 border border-line flex items-center justify-center text-accent bg-canvas group-hover:border-accent transition-colors">
                <Calculator className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">
                REAL-TIME SEMESTER & TARGET
              </span>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
                CGPA Precision Engine
              </h3>
              <p className="text-xs text-muted leading-relaxed font-body">
                Weight your courses from 1 to 4 credits. Simulate potential S, A, and B grades to see exact required GPA to reach a target 9.0+ graduation score.
              </p>
            </div>
            <div className="pt-8">
              <Link
                to="/cgpa"
                className="w-full py-3 border border-line bg-canvas text-ink font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-accent group-hover:text-on-accent group-hover:border-accent transition-colors"
              >
                Launch CGPA Simulator
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Campus Map */}
          <div className="p-8 border border-line bg-surface flex flex-col justify-between group hover:border-accent transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 border border-line flex items-center justify-center text-accent bg-canvas group-hover:border-accent transition-colors">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">
                SEHORE HIGHWAY BLUEPRINT
              </span>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">
                Kotri Kalan Map
              </h3>
              <p className="text-xs text-muted leading-relaxed font-body">
                Interactive spatial blueprint of AB1, AB2, Learning Center, Boys Hostels 1-6, Girls Hostels, and the SAC dining concourse with walking metrics.
              </p>
            </div>
            <div className="pt-8">
              <Link
                to="/campus"
                className="w-full py-3 border border-line bg-canvas text-ink font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-accent group-hover:text-on-accent group-hover:border-accent transition-colors"
              >
                Explore Campus Layout
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Attendance & Alert Desk */}
      <section className="p-8 border border-line bg-surface">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-line">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
              ACADEMIC ADVISORY NOTICE
            </span>
            <h3 className="font-display font-black text-xl uppercase text-ink mt-1">
              Term Regulations & Shuttle Notice
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent">
            <CheckCircle2 className="w-4 h-4" />
            <span>Updated Today • Academic Office Dispatch</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-ink">75% Attendance Lock</h4>
            <p className="text-xs text-muted leading-relaxed">
              Students falling below 75% aggregate attendance in any theory or lab slot are debarred from sitting in FAT examinations. Medical certs must be logged at AB1 Clinic within 48h.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-ink">AB1 & AB2 Lab Access</h4>
            <p className="text-xs text-muted leading-relaxed">
              GPU Cluster in AB2-201 and Networking Lab in AB1-305 are open until 10:00 PM on weekdays with approved Faculty Advisor slip.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-ink">Bhopal Weekend Shuttles</h4>
            <p className="text-xs text-muted leading-relaxed">
              Friday evening return buses depart Kotri Kalan Concourse at 17:15 and 18:30 directly to Bhopal Habibganj & ISBT. Seat token allocation active on the transit tab.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ==========================================
// 2. PAGE: RATE MY PROFESSOR & CABIN DIRECTORY
// ==========================================
function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>(INITIAL_PROFESSORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<'ALL' | 'AB1' | 'AB2'>('ALL');
  const [selectedSchool, setSelectedSchool] = useState<'ALL' | 'SCSE' | 'SASL' | 'SEEE' | 'VITBS'>('ALL');

  // Review modal state
  const [activeProfModal, setActiveProfModal] = useState<Professor | null>(null);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewClarity, setNewReviewClarity] = useState(5);
  const [newReviewFairness, setNewReviewFairness] = useState(5);
  const [selectedTagToAdd, setSelectedTagToAdd] = useState('Helpful in Office Hours');
  const [submittedReviewMessage, setSubmittedReviewMessage] = useState(false);

  // Filtered professors
  const filteredProfessors = useMemo(() => {
    return professors.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cabin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specialization.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBlock = selectedBlock === 'ALL' || p.block === selectedBlock;
      const matchesSchool = selectedSchool === 'ALL' || p.school === selectedSchool;
      return matchesSearch && matchesBlock && matchesSchool;
    });
  }, [professors, searchQuery, selectedBlock, selectedSchool]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfModal) return;

    const updated = professors.map((p) => {
      if (p.id === activeProfModal.id) {
        const newTotal = p.totalReviews + 1;
        const newClarity = Number(((p.teachingClarity * p.totalReviews + newReviewClarity) / newTotal).toFixed(1));
        const newFairness = Number(((p.gradingFairness * p.totalReviews + newReviewFairness) / newTotal).toFixed(1));
        const newOverall = Number(((newClarity + newFairness) / 2).toFixed(1));
        const updatedTags = Array.from(new Set([...p.tags, selectedTagToAdd]));

        return {
          ...p,
          totalReviews: newTotal,
          teachingClarity: newClarity,
          gradingFairness: newFairness,
          rating: newOverall,
          tags: updatedTags,
          recentComment: newReviewComment.trim() || p.recentComment
        };
      }
      return p;
    });

    setProfessors(updated);
    setSubmittedReviewMessage(true);
    setTimeout(() => {
      setSubmittedReviewMessage(false);
      setActiveProfModal(null);
      setNewReviewComment('');
    }, 1500);
  };

  return (
    <div className="space-y-12 py-8">
      {/* Page Header */}
      <div className="border-b border-line pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-widest mb-2">
              <School className="w-4 h-4" />
              Faculty Cabin Directory & Reviews
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-ink">
              RATE MY PROFESSOR & CABIN FINDER
            </h1>
            <p className="text-sm text-muted max-w-2xl mt-2 font-body">
              Locate faculty cabins across Academic Block 1 (AB1) and Academic Block 2 (AB2). Read peer reviews regarding lecture clarity, quiz toughness, and FFCS suitability.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 border border-line bg-surface text-ink">
              AB1: Ground to 4th Floor
            </span>
            <span className="px-3 py-1.5 border border-line bg-surface text-ink">
              AB2: Ground to 5th Floor
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by faculty name, cabin code (e.g. AB1-314), or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-line bg-surface text-ink placeholder:text-muted/60 text-xs font-mono focus:outline-none focus:border-accent"
            />
          </div>

          <div className="md:col-span-3 flex border border-line bg-surface font-mono text-xs">
            <button
              onClick={() => setSelectedBlock('ALL')}
              className={`flex-1 py-3 text-center transition-colors ${
                selectedBlock === 'ALL' ? 'bg-accent text-on-accent font-bold' : 'text-ink hover:bg-canvas'
              }`}
            >
              All Blocks
            </button>
            <button
              onClick={() => setSelectedBlock('AB1')}
              className={`flex-1 py-3 text-center border-l border-line transition-colors ${
                selectedBlock === 'AB1' ? 'bg-accent text-on-accent font-bold' : 'text-ink hover:bg-canvas'
              }`}
            >
              AB1
            </button>
            <button
              onClick={() => setSelectedBlock('AB2')}
              className={`flex-1 py-3 text-center border-l border-line transition-colors ${
                selectedBlock === 'AB2' ? 'bg-accent text-on-accent font-bold' : 'text-ink hover:bg-canvas'
              }`}
            >
              AB2
            </button>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value as any)}
              className="w-full py-3 px-3 border border-line bg-surface text-ink text-xs font-mono focus:outline-none focus:border-accent"
            >
              <option value="ALL">All Schools (SCSE, SASL, SEEE, VITBS)</option>
              <option value="SCSE">School of Computing Science (SCSE)</option>
              <option value="SASL">School of Advanced Sciences (SASL)</option>
              <option value="SEEE">Electrical & Electronics (SEEE)</option>
              <option value="VITBS">VIT Bhopal Business School (VITBS)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProfessors.map((prof) => (
          <div
            key={prof.id}
            className="border border-line bg-surface p-6 flex flex-col justify-between hover:border-accent transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 border border-line text-accent font-bold bg-canvas">
                      {prof.cabin}
                    </span>
                    <span className="font-mono text-[10px] uppercase text-muted tracking-widest">
                      {prof.school} • {prof.block}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-xl text-ink uppercase mt-2">
                    {prof.name}
                  </h3>
                  <p className="text-xs text-muted font-mono mt-0.5">
                    {prof.designation} • {prof.specialization}
                  </p>
                </div>

                <div className="text-right border border-line px-3 py-2 bg-canvas">
                  <div className="flex items-center gap-1 text-accent font-display font-black text-xl">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{(prof.rating ?? 0).toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted block">
                    {prof.totalReviews} reviews
                  </span>
                </div>
              </div>

              {/* Metric Breakdown Bars */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-line text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted uppercase block">Teaching Clarity</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 bg-ink/10 h-1.5">
                      <div
                        className="bg-accent h-1.5"
                        style={{ width: `${((prof.teachingClarity ?? 0) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-ink">{(prof.teachingClarity ?? 0).toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted uppercase block">Grading Fairness</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 bg-ink/10 h-1.5">
                      <div
                        className="bg-accent h-1.5"
                        style={{ width: `${((prof.gradingFairness ?? 0) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-ink">{(prof.gradingFairness ?? 0).toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted uppercase block">Strictness</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 bg-ink/10 h-1.5">
                      <div
                        className="bg-accent h-1.5"
                        style={{ width: `${((prof.strictness ?? 0) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-ink">{(prof.strictness ?? 0).toFixed(1)}/5</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {prof.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 border border-line bg-canvas text-ink uppercase"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Quote from Peer Review */}
              <div className="mt-4 p-3 border-l-2 border-accent bg-canvas text-xs text-muted font-body italic">
                "{prof.recentComment}"
              </div>
            </div>

            {/* Card Actions */}
            <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                Floor: {prof.cabin.split('-')[1]?.[0] || '1'}rd Floor, {prof.block}
              </span>

              <button
                onClick={() => {
                  setActiveProfModal(prof);
                  setNewReviewComment('');
                  setSubmittedReviewMessage(false);
                }}
                className="px-4 py-2 border border-line bg-canvas hover:border-accent hover:bg-accent hover:text-on-accent text-xs font-mono uppercase tracking-wider transition-colors"
              >
                Write Review
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProfessors.length === 0 && (
        <div className="p-12 text-center border border-line bg-surface">
          <Info className="w-8 h-8 text-muted mx-auto mb-2" />
          <h3 className="font-mono text-sm uppercase text-ink font-bold">No Faculty Found</h3>
          <p className="text-xs text-muted font-mono mt-1">
            Try adjusting your cabin search query or reset the school filter.
          </p>
        </div>
      )}

      {/* Review Submission Modal */}
      {activeProfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
          <div className="max-w-md w-full border border-line bg-surface p-6 shadow-xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveProfModal(null)}
              className="absolute top-4 right-4 p-1 text-muted hover:text-ink"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-line pb-4 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent">
                STUDENT FEEDBACK & VERIFICATION
              </span>
              <h3 className="font-display font-black text-xl uppercase text-ink mt-1">
                Review {activeProfModal.name}
              </h3>
              <p className="text-xs font-mono text-muted">
                Cabin: {activeProfModal.cabin} ({activeProfModal.block}) • {activeProfModal.school}
              </p>
            </div>

            {submittedReviewMessage ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 border border-line bg-canvas text-accent mx-auto flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h4 className="font-display font-black text-lg text-ink uppercase">Review Verified</h4>
                <p className="text-xs font-mono text-muted">
                  Your feedback has been logged into the local VIT Bhopal cabin ledger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-muted mb-1">
                    Teaching Clarity (1 - 5)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setNewReviewClarity(val)}
                        className={`flex-1 py-2 text-xs font-mono border ${
                          newReviewClarity === val
                            ? 'border-accent bg-accent text-on-accent font-bold'
                            : 'border-line text-ink hover:bg-canvas'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted mb-1">
                    Grading Fairness (1 - 5)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setNewReviewFairness(val)}
                        className={`flex-1 py-2 text-xs font-mono border ${
                          newReviewFairness === val
                            ? 'border-accent bg-accent text-on-accent font-bold'
                            : 'border-line text-ink hover:bg-canvas'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted mb-1">
                    Select Descriptor Tag
                  </label>
                  <select
                    value={selectedTagToAdd}
                    onChange={(e) => setSelectedTagToAdd(e.target.value)}
                    className="w-full py-2 px-3 border border-line bg-canvas text-ink text-xs font-mono focus:outline-none focus:border-accent"
                  >
                    <option value="Helpful in Office Hours">Helpful in Office Hours</option>
                    <option value="Fair CAT Marking">Fair CAT Marking</option>
                    <option value="Strict 75% Rule">Strict 75% Rule</option>
                    <option value="Standard Quizzes">Standard Quizzes</option>
                    <option value="Excellent Slides">Excellent Slides</option>
                    <option value="Research Project Support">Research Project Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted mb-1">
                    Detailed Experience Note
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="E.g., Cleared doubts on recursion during AB1 office hour. Very helpful for CAT-2 preparation..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full p-3 border border-line bg-canvas text-ink text-xs font-mono placeholder:text-muted/60 focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveProfModal(null)}
                    className="flex-1 py-3 border border-line text-xs font-mono uppercase text-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-accent text-on-accent text-xs font-mono uppercase tracking-wider font-bold hover:opacity-90"
                  >
                    Post Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. PAGE: INTERACTIVE CGPA CALCULATOR & TARGET ENGINE
// ==========================================
function CGPACalculatorPage() {
  const [previousCredits, setPreviousCredits] = useState<number>(62);
  const [previousCGPA, setPreviousCGPA] = useState<number>(8.45);
  const [targetCGPA, setTargetCGPA] = useState<number>(8.8);
  const [totalProgramCredits] = useState<number>(160);

  // Current semester course planning state
  const [courses, setCourses] = useState<CourseRow[]>([
    { id: 'c1', code: 'CSE3001', name: 'Software Engineering', credits: 4, grade: 'S' },
    { id: 'c2', code: 'CSE3002', name: 'Compiler Design', credits: 4, grade: 'A' },
    { id: 'c3', code: 'MAT2002', name: 'Discrete Mathematics', credits: 4, grade: 'S' },
    { id: 'c4', code: 'CSE2005', name: 'Object Oriented Analysis', credits: 3, grade: 'A' },
    { id: 'c5', code: 'HUM1021', name: 'Ethics & Values', credits: 2, grade: 'S' },
    { id: 'c6', code: 'CSE3002L', name: 'Compiler Design Lab', credits: 1, grade: 'S' }
  ]);

  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCredits, setNewCredits] = useState<number>(3);
  const [newGrade, setNewGrade] = useState<'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('S');

  // Semester GPA computation
  const semesterStats = useMemo(() => {
    let semCreditSum = 0;
    let semPointsSum = 0;

    courses.forEach((c) => {
      const cr = Number(c.credits) || 0;
      const pts = GRADE_POINTS[c.grade] ?? 0;
      semCreditSum += cr;
      semPointsSum += cr * pts;
    });

    const semGPA = semCreditSum > 0 ? semPointsSum / semCreditSum : 0;
    const totalCredits = (previousCredits || 0) + semCreditSum;
    const totalPoints = (previousCredits || 0) * (previousCGPA || 0) + semPointsSum;
    const updatedCumulativeGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

    // Remaining target projection
    const remainingCredits = Math.max(0, totalProgramCredits - totalCredits);
    // targetCGPA = (totalPoints + remainingCredits * requiredGPA) / totalProgramCredits
    const targetPointsNeeded = totalProgramCredits * targetCGPA;
    const pointsShort = targetPointsNeeded - totalPoints;
    const requiredFutureGPA = remainingCredits > 0 ? pointsShort / remainingCredits : 0;

    return {
      semCredits: semCreditSum,
      semGPA,
      totalCredits,
      updatedCumulativeGPA,
      remainingCredits,
      requiredFutureGPA
    };
  }, [courses, previousCredits, previousCGPA, targetCGPA, totalProgramCredits]);

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    setCourses([
      ...courses,
      {
        id: 'c_' + Date.now(),
        code: newCode.toUpperCase().trim(),
        name: newName.trim() || 'Course Elective',
        credits: newCredits,
        grade: newGrade
      }
    ]);

    setNewCode('');
    setNewName('');
    setNewCredits(3);
    setNewGrade('S');
  };

  const handleRemoveCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const handleGradeChange = (id: string, grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F') => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, grade } : c)));
  };

  const handleCreditsChange = (id: string, credits: number) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, credits } : c)));
  };

  return (
    <div className="space-y-12 py-8">
      {/* Header */}
      <div className="border-b border-line pb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-widest mb-2">
          <Calculator className="w-4 h-4" />
          Academic Performance Simulator
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-ink">
          INTERACTIVE CGPA & TARGET FORECASTER
        </h1>
        <p className="text-sm text-muted max-w-2xl mt-2 font-body">
          Calculate current semester GPA and project overall cumulative score according to the official VIT 10-point scale (S=10, A=9, B=8, C=7, D=6, E=4, F=0).
        </p>
      </div>

      {/* Top Results Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 border border-line bg-surface">
          <span className="text-[10px] font-mono uppercase text-muted tracking-widest block">
            Current Semester GPA
          </span>
          <div className="font-display font-black text-4xl text-accent mt-2">
            {(semesterStats.semGPA ?? 0).toFixed(2)}
          </div>
          <span className="text-xs font-mono text-muted block mt-1">
            Across {semesterStats.semCredits} registered credits
          </span>
        </div>

        <div className="p-6 border border-line bg-surface">
          <span className="text-[10px] font-mono uppercase text-muted tracking-widest block">
            Projected Total CGPA
          </span>
          <div className="font-display font-black text-4xl text-ink mt-2">
            {(semesterStats.updatedCumulativeGPA ?? 0).toFixed(2)}
          </div>
          <span className="text-xs font-mono text-muted block mt-1">
            Cumulative across {semesterStats.totalCredits} credits
          </span>
        </div>

        <div className="p-6 border border-line bg-surface">
          <span className="text-[10px] font-mono uppercase text-muted tracking-widest block">
            Target Graduation CGPA
          </span>
          <div className="font-display font-black text-4xl text-ink mt-2">
            {(targetCGPA ?? 0).toFixed(2)}
          </div>
          <span className="text-xs font-mono text-muted block mt-1">
            Degree cutoff goal
          </span>
        </div>

        <div className="p-6 border border-line bg-surface">
          <span className="text-[10px] font-mono uppercase text-muted tracking-widest block">
            Req. Future Term Avg
          </span>
          <div className={`font-display font-black text-4xl mt-2 ${
            semesterStats.requiredFutureGPA > 10
              ? 'text-red-700'
              : semesterStats.requiredFutureGPA > 9
              ? 'text-amber-800'
              : 'text-accent'
          }`}>
            {semesterStats.requiredFutureGPA > 10
              ? '> 10.0'
              : Math.max(0, semesterStats.requiredFutureGPA ?? 0).toFixed(2)}
          </div>
          <span className="text-xs font-mono text-muted block mt-1">
            In remaining {semesterStats.remainingCredits} credits
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Previous History & Target Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-line bg-surface p-6 space-y-4">
            <div className="border-b border-line pb-3">
              <span className="text-[10px] font-mono uppercase text-muted tracking-widest block">
                STEP 1: BASELINE RECORD
              </span>
              <h3 className="font-display font-black text-lg text-ink uppercase">
                Prior Semesters
              </h3>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">
                Completed Credits to Date
              </label>
              <input
                type="number"
                min="0"
                max="160"
                value={previousCredits}
                onChange={(e) => setPreviousCredits(Math.max(0, Number(e.target.value)))}
                className="w-full p-3 border border-line bg-canvas text-ink text-xs font-mono focus:outline-none focus:border-accent"
              />
              <span className="text-[10px] font-mono text-muted mt-1 block">
                Typical semester load = 20-25 credits
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">
                Prior Cumulative CGPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={previousCGPA}
                onChange={(e) => setPreviousCGPA(Number(e.target.value))}
                className="w-full p-3 border border-line bg-canvas text-ink text-xs font-mono focus:outline-none focus:border-accent"
              />
              <span className="text-[10px] font-mono text-muted mt-1 block">
                As recorded on official grade transcript
              </span>
            </div>
          </div>

          {/* Target Forecaster Box */}
          <div className="border border-line bg-surface p-6 space-y-4">
            <div className="border-b border-line pb-3">
              <span className="text-[10px] font-mono uppercase text-muted tracking-widest block">
                STEP 2: TARGET BENCHMARK
              </span>
              <h3 className="font-display font-black text-lg text-ink uppercase">
                Goal CGPA Planner
              </h3>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono uppercase text-muted">
                  Desired Graduation CGPA
                </label>
                <span className="text-xs font-mono font-bold text-accent">
                  {(targetCGPA ?? 0).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="7.0"
                max="9.8"
                step="0.05"
                value={targetCGPA}
                onChange={(e) => setTargetCGPA(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted mt-1">
                <span>7.50 (First Class)</span>
                <span>8.50 (Dean's List)</span>
                <span>9.00+ (Gold/Top Tier)</span>
              </div>
            </div>

            <div className="p-4 border border-line bg-canvas space-y-2 text-xs font-mono text-muted">
              <div className="flex justify-between">
                <span>Total Degree Credits:</span>
                <span className="text-ink font-bold">{totalProgramCredits}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining After This Sem:</span>
                <span className="text-ink font-bold">{semesterStats.remainingCredits}</span>
              </div>
              <div className="pt-2 border-t border-line text-[11px] leading-relaxed">
                {semesterStats.requiredFutureGPA > 10 ? (
                  <span className="text-ink font-bold">
                    Mathematically unreachable. Consider adjusting target or clearing course backlog.
                  </span>
                ) : (
                  <span>
                    You must sustain an average of{' '}
                    <strong className="text-accent font-bold">
                      {(semesterStats.requiredFutureGPA ?? 0).toFixed(2)}
                    </strong>{' '}
                    across future semesters to meet this goal.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Official Grade Scale Reference */}
          <div className="border border-line bg-surface p-6">
            <h4 className="font-mono text-xs uppercase tracking-widest text-muted mb-3">
              VIT Grade Point Table
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2 border border-line bg-canvas">
                <span className="block font-bold text-accent">S</span>
                <span className="text-[10px] text-muted">10 pts</span>
              </div>
              <div className="p-2 border border-line bg-canvas">
                <span className="block font-bold text-ink">A</span>
                <span className="text-[10px] text-muted">9 pts</span>
              </div>
              <div className="p-2 border border-line bg-canvas">
                <span className="block font-bold text-ink">B</span>
                <span className="text-[10px] text-muted">8 pts</span>
              </div>
              <div className="p-2 border border-line bg-canvas">
                <span className="block font-bold text-ink">C</span>
                <span className="text-[10px] text-muted">7 pts</span>
              </div>
              <div className="p-2 border border-line bg-canvas">
                <span className="block font-bold text-ink">D</span>
                <span className="text-[10px] text-muted">6 pts</span>
              </div>
              <div className="p-2 border border-line bg-canvas">
                <span className="block font-bold text-ink">E</span>
                <span className="text-[10px] text-muted">4 pts</span>
              </div>
              <div className="p-2 border border-line bg-canvas">
                <span className="block font-bold text-ink">F</span>
                <span className="text-[10px] text-muted">0 pts</span>
              </div>
              <div className="p-2 border border-line bg-canvas">
                <span className="block font-bold text-muted">N</span>
                <span className="text-[10px] text-muted">Audit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Course Table & Live Planner */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border border-line bg-surface p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted tracking-widest block">
                  STEP 3: CURRENT TERM ROSTER
                </span>
                <h3 className="font-display font-black text-xl text-ink uppercase">
                  Registered Courses ({courses.length})
                </h3>
              </div>
              <button
                onClick={() => setCourses([])}
                className="text-xs font-mono uppercase text-muted hover:text-ink flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>

            {/* Courses Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-line text-muted uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3 text-center">Credits</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3 text-right">Points</th>
                    <th className="py-2.5 px-2 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-canvas/50">
                      <td className="py-3 px-3 font-bold text-ink">{course.code}</td>
                      <td className="py-3 px-3 text-muted">{course.name}</td>
                      <td className="py-3 px-3 text-center">
                        <select
                          value={course.credits}
                          onChange={(e) => handleCreditsChange(course.id, Number(e.target.value))}
                          className="bg-canvas border border-line px-2 py-1 text-ink focus:outline-none focus:border-accent text-xs"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <select
                          value={course.grade}
                          onChange={(e) =>
                            handleGradeChange(course.id, e.target.value as any)
                          }
                          className="bg-canvas border border-line px-2 py-1 font-bold text-accent focus:outline-none focus:border-accent text-xs"
                        >
                          <option value="S">S (10)</option>
                          <option value="A">A (9)</option>
                          <option value="B">B (8)</option>
                          <option value="C">C (7)</option>
                          <option value="D">D (6)</option>
                          <option value="E">E (4)</option>
                          <option value="F">F (0)</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-ink">
                        {(course.credits * GRADE_POINTS[course.grade]).toFixed(0)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => handleRemoveCourse(course.id)}
                          className="text-muted hover:text-ink p-1"
                          title="Remove subject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {courses.length === 0 && (
              <div className="py-12 text-center text-muted font-mono text-xs">
                No courses added yet. Use the quick entry row below to build your schedule.
              </div>
            )}

            {/* Quick Add Form */}
            <form onSubmit={handleAddCourse} className="mt-6 pt-6 border-t border-line">
              <span className="text-[10px] font-mono uppercase text-muted tracking-widest block mb-3">
                ADD NEW COURSE TO SIMULATOR
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    required
                    placeholder="E.g. CSE3003"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full p-2.5 border border-line bg-canvas text-ink text-xs font-mono uppercase focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Subject Title (Optional)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2.5 border border-line bg-canvas text-ink text-xs font-mono focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="sm:col-span-2">
                  <select
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full p-2.5 border border-line bg-canvas text-ink text-xs font-mono focus:outline-none focus:border-accent"
                  >
                    <option value="1">1 Credit</option>
                    <option value="2">2 Credits</option>
                    <option value="3">3 Credits</option>
                    <option value="4">4 Credits</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as any)}
                    className="w-full p-2.5 border border-line bg-canvas text-ink text-xs font-mono font-bold focus:outline-none focus:border-accent"
                  >
                    <option value="S">Grade S</option>
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                    <option value="D">Grade D</option>
                    <option value="E">Grade E</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <button
                    type="submit"
                    className="w-full h-full min-h-[38px] bg-accent text-on-accent flex items-center justify-center hover:opacity-90 transition-opacity"
                    title="Add Course"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. PAGE: KOTRI KALAN CAMPUS MAP & DIRECTORY
// ==========================================
function CampusMapPage() {
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation>(CAMPUS_LOCATIONS[0]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'academic' | 'residential' | 'amenity' | 'transit'>('all');

  const filteredLocations = useMemo(() => {
    if (typeFilter === 'all') return CAMPUS_LOCATIONS;
    return CAMPUS_LOCATIONS.filter((l) => l.type === typeFilter);
  }, [typeFilter]);

  return (
    <div className="space-y-12 py-8">
      {/* Header */}
      <div className="border-b border-line pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-widest mb-2">
              <Compass className="w-4 h-4" />
              Kotri Kalan Master Site Schematic
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-ink">
              CAMPUS MAP & BLUEPRINT
            </h1>
            <p className="text-sm text-muted max-w-2xl mt-2 font-body">
              Spatial overview of VIT Bhopal at Kotri Kalan, Sehore. Find AB1, AB2, Learning Centre, Boys/Girls Hostels, and internal pedestrian connectors.
            </p>
          </div>

          <div className="font-mono text-xs text-muted border border-line p-3 bg-surface">
            <div>Coordinates: 23.0805° N, 77.0163° E</div>
            <div className="text-ink font-bold mt-0.5">Bhopal-Indore National Expressway</div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-8 flex flex-wrap gap-2 font-mono text-xs">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-4 py-2 border transition-colors ${
              typeFilter === 'all'
                ? 'border-accent bg-accent text-on-accent font-bold'
                : 'border-line bg-surface text-ink hover:border-accent'
            }`}
          >
            All Zones ({CAMPUS_LOCATIONS.length})
          </button>
          <button
            onClick={() => setTypeFilter('academic')}
            className={`px-4 py-2 border transition-colors ${
              typeFilter === 'academic'
                ? 'border-accent bg-accent text-on-accent font-bold'
                : 'border-line bg-surface text-ink hover:border-accent'
            }`}
          >
            Academic (AB1 / AB2)
          </button>
          <button
            onClick={() => setTypeFilter('residential')}
            className={`px-4 py-2 border transition-colors ${
              typeFilter === 'residential'
                ? 'border-accent bg-accent text-on-accent font-bold'
                : 'border-line bg-surface text-ink hover:border-accent'
            }`}
          >
            Hostels (BH / GH)
          </button>
          <button
            onClick={() => setTypeFilter('amenity')}
            className={`px-4 py-2 border transition-colors ${
              typeFilter === 'amenity'
                ? 'border-accent bg-accent text-on-accent font-bold'
                : 'border-line bg-surface text-ink hover:border-accent'
            }`}
          >
            Library & Dining
          </button>
          <button
            onClick={() => setTypeFilter('transit')}
            className={`px-4 py-2 border transition-colors ${
              typeFilter === 'transit'
                ? 'border-accent bg-accent text-on-accent font-bold'
                : 'border-line bg-surface text-ink hover:border-accent'
            }`}
          >
            Transit Terminal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Schematic SVG canvas */}
        <div className="lg:col-span-8 border border-line bg-surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-line mb-4 font-mono text-xs">
            <span className="text-muted uppercase">ARCHITECTURAL SCHEMATIC VIEW</span>
            <span className="text-accent flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent inline-block animate-ping" />
              Scale 1 : 2500
            </span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full aspect-[16/10] bg-canvas border border-line overflow-hidden select-none">
            {/* Grid Pattern Background */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'radial-gradient(var(--tw-color-ink, #1E232A) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Campus Central Spine / Walkway Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line
                x1="22%"
                y1="22%"
                x2="38%"
                y2="35%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-line"
              />
              <line
                x1="38%"
                y1="35%"
                x2="55%"
                y2="30%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-line"
              />
              <line
                x1="38%"
                y1="35%"
                x2="47%"
                y2="44%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-line"
              />
              <line
                x1="47%"
                y1="44%"
                x2="44%"
                y2="60%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-line"
              />
              <line
                x1="44%"
                y1="60%"
                x2="74%"
                y2="58%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-line"
              />
              <line
                x1="44%"
                y1="60%"
                x2="26%"
                y2="64%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-line"
              />
            </svg>

            {/* Render Location Pins */}
            {filteredLocations.map((loc) => {
              const isSelected = selectedLocation.id === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none transition-transform ${
                    isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                  }`}
                >
                  <div
                    className={`px-2.5 py-1 font-mono text-[11px] uppercase border shadow-md flex items-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'border-accent bg-accent text-on-accent font-bold ring-4 ring-accent/20'
                        : 'border-line bg-surface text-ink hover:border-accent'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{loc.code}</span>
                  </div>
                </button>
              );
            })}

            {/* Compass Rose */}
            <div className="absolute top-4 right-4 p-2 border border-line bg-surface/90 text-center font-mono text-[10px] text-muted">
              <div className="font-bold text-accent">N ↑</div>
              <div>W ↔ E</div>
              <div>S ↓</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-line flex flex-wrap items-center justify-between text-xs font-mono text-muted gap-2">
            <span>Click any campus landmark to inspect walking metrics & faculties</span>
            <span>Shuttle loops connect Bus Concourse to Hostels every 10 min</span>
          </div>
        </div>

        {/* Right Column: Selected Location Detail Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-line bg-surface p-6 space-y-6">
            <div className="border-b border-line pb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
                ZONE INSPECTOR • {selectedLocation.code}
              </span>
              <h3 className="font-display font-black text-2xl uppercase tracking-tight text-ink mt-1">
                {selectedLocation.name}
              </h3>
              <p className="text-xs font-mono uppercase text-muted mt-1">
                Category: {selectedLocation.type.toUpperCase()}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted block mb-1">
                  Walking Time from Concourse
                </span>
                <div className="text-lg font-mono font-bold text-ink flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  {selectedLocation.walkingFromGate} (approx. 80m/min)
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted block mb-1">
                  Facility Specifications
                </span>
                <p className="text-xs text-muted leading-relaxed font-body">
                  {selectedLocation.description}
                </p>
              </div>

              {selectedLocation.id === 'ab1' && (
                <div className="p-3 border border-line bg-canvas space-y-1 font-mono text-xs">
                  <div className="font-bold text-ink">Key Offices inside AB1:</div>
                  <div className="text-muted">• Ground: Registrar, Finance Office, Main Auditorium</div>
                  <div className="text-muted">• 2nd Floor: Director Academic Research</div>
                  <div className="text-muted">• 3rd Floor: SCSE Faculty Cabins 301-340</div>
                </div>
              )}

              {selectedLocation.id === 'ab2' && (
                <div className="p-3 border border-line bg-canvas space-y-1 font-mono text-xs">
                  <div className="font-bold text-ink">Key Offices inside AB2:</div>
                  <div className="text-muted">• Ground: NVIDIA GPU AI Workstation Center</div>
                  <div className="text-muted">• 2nd Floor: SEEE Electronics Fabrication Bay</div>
                  <div className="text-muted">• 4th Floor: SCSE Dean & Computing Labs</div>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/professors"
                  className="w-full py-3 border border-line bg-canvas text-ink font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-accent hover:text-on-accent hover:border-accent transition-colors"
                >
                  Locate Faculty Cabins in {selectedLocation.code}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Highway Access info */}
          <div className="border border-line bg-surface p-6 font-mono text-xs space-y-3">
            <h4 className="uppercase tracking-widest text-muted text-[10px]">
              Regional Connectivity
            </h4>
            <div className="flex justify-between border-b border-line pb-2">
              <span className="text-muted">Distance to Bhopal Junction:</span>
              <span className="text-ink font-bold">68 km</span>
            </div>
            <div className="flex justify-between border-b border-line pb-2">
              <span className="text-muted">Distance to Sehore Town:</span>
              <span className="text-ink font-bold">22 km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Distance to Indore Airport:</span>
              <span className="text-ink font-bold">128 km</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. PAGE: BUS TIMETABLES & CAMPUS TRANSIT
// ==========================================
function TransitPage() {
  const [directionFilter, setDirectionFilter] = useState<'all' | 'to_campus' | 'to_city'>('all');
  const [searchStop, setSearchStop] = useState('');

  const filteredBuses = useMemo(() => {
    return BUS_SCHEDULES.filter((bus) => {
      const matchesDir = directionFilter === 'all' || bus.direction === directionFilter;
      const matchesSearch =
        searchStop === '' ||
        bus.routeName.toLowerCase().includes(searchStop.toLowerCase()) ||
        bus.routeNumber.toLowerCase().includes(searchStop.toLowerCase()) ||
        bus.keyStops.some((stop) => stop.toLowerCase().includes(searchStop.toLowerCase()));
      return matchesDir && matchesSearch;
    });
  }, [directionFilter, searchStop]);

  return (
    <div className="space-y-12 py-8">
      {/* Header */}
      <div className="border-b border-line pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-widest mb-2">
              <Bus className="w-4 h-4" />
              Official Campus Transit Operations
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-ink">
              BUS TIMETABLES & SHUTTLE SCHEDULES
            </h1>
            <p className="text-sm text-muted max-w-2xl mt-2 font-body">
              Official university transport routes connecting Kotri Kalan to Bhopal (Habibganj/Lalghati), Sehore Crescent, and Ashta, plus continuous internal hostel shuttles.
            </p>
          </div>

          <div className="border border-line p-3 bg-surface font-mono text-xs">
            <span className="text-[10px] text-muted uppercase tracking-widest block">
              TRANSPORT CONTROL HELPLINE
            </span>
            <span className="font-bold text-ink flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-accent" />
              +91 7562 254500 (Ext. 204)
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by stop (e.g. Lalghati, MP Nagar, Sehore, Habibganj)..."
              value={searchStop}
              onChange={(e) => setSearchStop(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-line bg-surface text-ink placeholder:text-muted/60 text-xs font-mono focus:outline-none focus:border-accent"
            />
          </div>

          <div className="md:col-span-4 flex border border-line bg-surface font-mono text-xs">
            <button
              onClick={() => setDirectionFilter('all')}
              className={`flex-1 py-3 text-center transition-colors ${
                directionFilter === 'all'
                  ? 'bg-accent text-on-accent font-bold'
                  : 'text-ink hover:bg-canvas'
              }`}
            >
              All Routes
            </button>
            <button
              onClick={() => setDirectionFilter('to_campus')}
              className={`flex-1 py-3 text-center border-l border-line transition-colors ${
                directionFilter === 'to_campus'
                  ? 'bg-accent text-on-accent font-bold'
                  : 'text-ink hover:bg-canvas'
              }`}
            >
              To Campus (AM)
            </button>
            <button
              onClick={() => setDirectionFilter('to_city')}
              className={`flex-1 py-3 text-center border-l border-line transition-colors ${
                directionFilter === 'to_city'
                  ? 'bg-accent text-on-accent font-bold'
                  : 'text-ink hover:bg-canvas'
              }`}
            >
              To City (PM)
            </button>
          </div>
        </div>
      </div>

      {/* Bus Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBuses.map((bus) => (
          <div
            key={bus.id}
            className="border border-line bg-surface p-6 flex flex-col justify-between hover:border-accent transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 border border-line bg-canvas text-accent font-bold">
                      {bus.routeNumber}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-muted tracking-widest">
                      {bus.direction === 'to_campus' ? 'INBOUND TO KOTRI' : 'OUTBOUND TO CITY'}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-xl text-ink uppercase mt-2">
                    {bus.routeName}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="px-2 py-1 text-[10px] font-mono uppercase border border-line bg-canvas text-accent font-bold">
                    {bus.status}
                  </span>
                </div>
              </div>

              {/* Departure time callout */}
              <div className="mt-4 p-3 border border-line bg-canvas flex items-center justify-between font-mono text-xs">
                <span className="text-muted">Origin Departure:</span>
                <span className="font-bold text-ink text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-accent" />
                  {bus.departureTime}
                </span>
              </div>

              {/* Waypoints timeline */}
              <div className="mt-6 space-y-2">
                <span className="text-[10px] font-mono uppercase text-muted tracking-widest block">
                  Route Stops & Pick-up Sequence
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {bus.keyStops.map((stop, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 border border-line bg-surface text-ink"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {stop}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs font-mono text-muted">
              <span>Bus Tag: {bus.vehicle}</span>
              <span className="flex items-center gap-1 text-ink font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                RFID Validated Pass
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Transit Advisory Card */}
      <div className="p-8 border border-line bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="font-display font-black text-lg uppercase text-ink">
            Need Weekend Airport / Railway Station Link?
          </h4>
          <p className="text-xs text-muted max-w-xl font-body">
            Special Sunday evening express coaches run directly from Bhopal Rani Kamlapati (RKMP) Station to Kotri Kalan Gate 1 at 20:00 and 21:30. Ensure your VTOP transport QR is activated.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-4 py-2 border border-line bg-canvas text-ink">
            Token Required for Sunday Return
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ROOT APP COMPONENT WITH PAGES ROUTER
// ==========================================
export default function App() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex flex-col selection:bg-accent selection:text-on-accent">
      {/* Background grain and bespoke cursor */}
      <Grain />
      <Cursor />

      {/* Unified Global Brand Header */}
      <Header />

      {/* Main Pages Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Pages
          routes={{
            '/': <DashboardPage />,
            '/professors': <ProfessorsPage />,
            '/cgpa': <CGPACalculatorPage />,
            '/campus': <CampusMapPage />,
            '/transit': <TransitPage />
          }}
        />
      </main>

      {/* Editorial University Footer */}
      <Footer />
    </div>
  );
}