export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: Priority;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  reportedBy: {
    name: string;
    email: string;
    phone?: string;
  };
  assignedTo?: string;
  department: Department;
  images: string[];
  audioNote?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  votes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
  isOfficial: boolean;
}

export type IssueCategory = 
  | 'pothole'
  | 'streetlight'
  | 'garbage'
  | 'drainage'
  | 'traffic'
  | 'park'
  | 'other';

export type IssueStatus = 
  | 'reported'
  | 'acknowledged'
  | 'in-progress'
  | 'resolved'
  | 'closed';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Department = 
  | 'public-works'
  | 'sanitation'
  | 'traffic-police'
  | 'parks'
  | 'electrical';

export interface Analytics {
  totalReports: number;
  resolvedReports: number;
  avgResolutionTime: number;
  reportsByCategory: Record<IssueCategory, number>;
  reportsByDepartment: Record<Department, number>;
  reportsByStatus: Record<IssueStatus, number>;
  trendsData: {
    date: string;
    reports: number;
    resolved: number;
  }[];
}

export interface Citizen {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  joinedAt: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    language: 'en' | 'hi';
    privacy: {
      showProfile: boolean;
      shareLocation: boolean;
    };
  };
  statistics: {
    totalReports: number;
    resolvedReports: number;
    votesReceived: number;
    commentsReceived: number;
    reputationScore: number;
  };
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  type: 'reporter' | 'community' | 'civic' | 'special';
}