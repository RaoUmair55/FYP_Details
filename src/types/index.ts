export type ThemeMode = 'dark' | 'light';

export type ActiveTab = 
  | 'overview' 
  | 'architecture' 
  | 'modules' 
  | 'simulators' 
  | 'implementation' 
  | 'database' 
  | 'viva-defense';

export interface ModuleDetail {
  id: string;
  number: number;
  title: string;
  shortDesc: string;
  category: 'Candidate App' | 'AI Monitoring' | 'Server & Database' | 'Examiner Dashboard' | 'Security & Transport';
  purpose: string;
  howItWorks: string;
  technicalImplementation: {
    language: string;
    libraries: string[];
    coreFiles: string[];
    mechanisms: string[];
  };
  keyFormulasOrRules?: {
    name: string;
    formula?: string;
    explanation: string;
  }[];
  architectureFit: string;
  inputs: string[];
  outputs: string[];
  edgeCasesHandled: string[];
  codeSnippet: {
    language: string;
    filename: string;
    code: string;
    explanation: string;
  };
}

export interface ArchitectureNode {
  id: string;
  title: string;
  subtitle: string;
  tier: 'candidate' | 'backend' | 'examiner';
  technologies: string[];
  responsibilities: string[];
  connections: string[];
  x: number;
  y: number;
}

export interface DatabaseTable {
  name: string;
  description: string;
  columns: {
    name: string;
    type: string;
    constraints: string;
    description: string;
  }[];
  indexes: {
    name: string;
    fields: string;
    type: string;
    purpose: string;
  }[];
}

export interface ViolationEvent {
  id: string;
  sessionId: string;
  studentName: string;
  rollNumber: string;
  examId: string;
  type: 
    | 'head_turn_away'
    | 'second_person_detected'
    | 'second_voice_detected'
    | 'no_face_detected'
    | 'unauthorized_object'
    | 'unauthorized_app'
    | 'usb_device_detected'
    | 'multiple_displays_detected'
    | 'camera_occluded_or_dark';
  severity: 1 | 2 | 3 | 4 | 5;
  timestamp: string;
  relativeSeconds: number;
  details: Record<string, any>;
  reviewed: boolean;
  decision?: 'confirmed' | 'dismissed' | 'pending';
}

export interface VivaQuestion {
  question: string;
  category: 'Architecture' | 'AI & Algorithms' | 'Security & Privacy' | 'Performance & Database';
  shortAnswer: string;
  deepDive: string;
  codeOrFormulaRef?: string;
}
