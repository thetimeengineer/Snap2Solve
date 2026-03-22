import { Issue, Analytics, Citizen } from '../types';

export const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Large Pothole on Main Road',
    description: 'Deep pothole causing vehicle damage near the market intersection',
    category: 'pothole',
    status: 'in-progress',
    priority: 'high',
    location: {
      lat: 23.3441,
      lng: 85.3096,
      address: 'Main Roadt, Bakori phata, Maharashtra'
    },
    reportedBy: {
      name: 'Shree Joshi',
      email: 'shreejoshi@gmail.com',
      phone: '+91 9876543210'
    },
    assignedTo: 'Swaroop Jadhav',
    department: 'public-works',
    images: ['https://images.unsplash.com/photo-1709934730506-fba12664d4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3Rob2xlJTIwcm9hZCUyMGRhbWFnZXxlbnwxfHx8fDE3NTc2MDE0MjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-16'),
    votes: 15,
    comments: [
      {
        id: 'c1',
        text: 'This is causing major traffic issues',
        author: 'Local Resident',
        createdAt: new Date('2026-01-15'),
        isOfficial: false
      },
      {
        id: 'c2',
        text: 'Work has been assigned to our road maintenance team. Expected completion in 3 days.',
        author: 'Public Works Department',
        createdAt: new Date('2026-01-16'),
        isOfficial: true
      }
    ]
  },
  {
    id: '2',
    title: 'Broken Streetlight',
    description: 'Street light not working for past week, creating safety concerns',
    category: 'streetlight',
    status: 'acknowledged',
    priority: 'medium',
    location: {
      lat: 23.3629,
      lng: 85.3371,
      address: 'Alka Chowk, Pune, Maharashtra'
    },
    reportedBy: {
      name: 'Saloni Jadhav',
      email: 'salonijadhav@email.com'
    },
    department: 'electrical',
    images: ['https://images.unsplash.com/photo-1695236200077-f61c1450f21a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9rZW4lMjBzdHJlZXRsaWdodCUyMHVyYmFufGVufDF8fHx8MTc1NzUyMTQyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
    createdAt: new Date('2026-01-14'),
    updatedAt: new Date('2026-01-14'),
    votes: 8,
    comments: []
  },
  {
    id: '3',
    title: 'Overflowing Garbage Bin',
    description: 'Municipal garbage bin overflowing, attracting stray animals',
    category: 'garbage',
    status: 'resolved',
    priority: 'medium',
    location: {
      lat: 23.3568,
      lng: 85.3240,
      address: 'Kokane Road, Nigdi, Maharashtra'
    },
    reportedBy: {
      name: 'Shravani Gaikwad',
      email: 'shravanigaikwad@email.com'
    },
    assignedTo: 'Sanitation Team A',
    department: 'sanitation',
    images: ['https://images.unsplash.com/photo-1741565697191-be7da831643c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdmVyZmxvd2luZyUyMGdhcmJhZ2UlMjB0cmFzaCUyMGJpbnxlbnwxfHx8fDE3NTc2MDE0MzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-12'),
    resolvedAt: new Date('2026-01-12'),
    votes: 5,
    comments: [
      {
        id: 'c3',
        text: 'Issue has been resolved. Garbage collected and bin cleaned.',
        author: 'Sanitation Department',
        createdAt: new Date('2026-01-12'),
        isOfficial: true
      }
    ]
  },
  {
    id: '4',
    title: 'Water Leakage',
    description: 'Continuous water leakage from municipal pipeline',
    category: 'water',
    status: 'reported',
    priority: 'urgent',
    location: {
      lat: 23.3494,
      lng: 85.3194,
      address: 'Circular Road, Nagar Road, Maharashtra'
    },
    reportedBy: {
      name: 'Vaishnavi Kadam',
      email: 'vaishnavikadam@email.com',
      phone: '+91 9876543211'
    },
    department: 'water-dept',
    images: [],
    createdAt: new Date('2026-01-17'),
    updatedAt: new Date('2026-01-17'),
    votes: 12,
    comments: []
  },
  {
    id: '5',
    title: 'Blocked Drainage',
    description: 'Storm drain blocked causing water logging during rain',
    category: 'drainage',
    status: 'in-progress',
    priority: 'high',
    location: {
      lat: 23.3776,
      lng: 85.3389,
      address: 'bhakti-shakti, Nigdi, Maharashtra'
    },
    reportedBy: {
      name: 'Shravani Gaikwad',
      email: 'shravanigaikwad@email.com'
    },
    assignedTo: 'Drainage Team B',
    department: 'public-works',
    images: [],
    createdAt: new Date('2026-01-13'),
    updatedAt: new Date('2026-01-15'),
    votes: 20,
    comments: [
      {
        id: 'c4',
        text: 'This causes flooding in our area every monsoon',
        author: 'Resident',
        createdAt: new Date('2026-01-13'),
        isOfficial: false
      }
    ]
  }
];

export const mockAnalytics: Analytics = {
  totalReports: 150,
  resolvedReports: 89,
  avgResolutionTime: 4.2,
  reportsByCategory: {
    pothole: 35,
    streetlight: 25,
    garbage: 30,
    drainage: 15,
    traffic: 12,
    park: 8,
    other: 5
  },
  reportsByDepartment: {
    'public-works': 55,
    'sanitation': 30,
    'traffic-police': 12,
    'parks': 8,
    'electrical': 25
  },
  reportsByStatus: {
    'reported': 25,
    'acknowledged': 20,
    'in-progress': 16,
    'resolved': 78,
    'closed': 11
  },
  trendsData: [
    { date: '2026-01-01', reports: 8, resolved: 5 },
    { date: '2026-01-02', reports: 12, resolved: 7 },
    { date: '2026-01-03', reports: 15, resolved: 9 },
    { date: '2026-01-04', reports: 10, resolved: 12 },
    { date: '2026-01-05', reports: 18, resolved: 15 },
    { date: '2026-01-06', reports: 22, resolved: 18 },
    { date: '2026-01-07', reports: 14, resolved: 16 }
  ]
};

export const categoryIcons: Record<string, string> = {
  pothole: '🕳️',
  streetlight: '💡',
  garbage: '🗑️',
  drainage: '🌊',
  traffic: '🚦',
  park: '🌳',
  other: '📋'
};

export const statusColors: Record<string, string> = {
  reported: 'bg-red-100 text-red-800',
  acknowledged: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};

export const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export const mockCitizen: Citizen = {
  id: 'citizen-1',
  name: 'Gayatri Hule',
  email: 'gayatrihule@email.com',
  phone: '+91 9876543210',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTc2MDE1NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  joinedAt: new Date('2026-01-15'),
  address: {
    street: '123 JSPM Road',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001'
  },
  preferences: {
    notifications: {
      email: true,
      sms: true,
      push: true
    },
    language: 'en',
    privacy: {
      showProfile: true,
      shareLocation: true
    }
  },
  statistics: {
    totalReports: 8,
    resolvedReports: 5,
    votesReceived: 45,
    commentsReceived: 12,
    reputationScore: 285
  },
  badges: [
    {
      id: 'b1',
      name: 'First Reporter',
      description: 'Reported your first civic issue',
      icon: '🎯',
      earnedAt: new Date('2026-01-20'),
      type: 'reporter'
    },
    {
      id: 'b2',
      name: 'Community Helper',
      description: 'Received 10+ votes on your reports',
      icon: '🤝',
      earnedAt: new Date('2026-01-10'),
      type: 'community'
    },
    {
      id: 'b3',
      name: 'Problem Solver',
      description: '5 of your reports have been resolved',
      icon: '✅',
      earnedAt: new Date('2026-01-05'),
      type: 'civic'
    },
    {
      id: 'b4',
      name: 'Active Citizen',
      description: 'Consistently reporting civic issues',
      icon: '⭐',
      earnedAt: new Date('2026-01-15'),
      type: 'special'
    }
  ]
};

// Mock user data for admin management
export const mockUsers = [
  {
    id: 'user-1',
    name: 'Swaroop Jadhav',
    email: 'swaroopjadhav@email.com',
    phone: '+91 9876543210',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTc2MDE1NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    joinedAt: new Date('2026-01-15'),
    status: 'active',
    reportsCount: 8,
    lastActive: new Date('2026-01-17'),
    address: 'Kharadi, Maharashtra',
    verified: true
  },
  {
    id: 'user-2',
    name: 'Gayatri Hule',
    email: 'Hulegayatri@gmail.com',
    phone: '+91 9876543211',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b6b40602?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc1NzYwMTU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    joinedAt: new Date('2026-01-20'),
    status: 'active',
    reportsCount: 12,
    lastActive: new Date('2026-01-16'),
    address: 'Bhosari, Maharashtra',
    verified: true
  },
  {
    id: 'user-3',
    name: 'Tushar Jadhav',
    email: 'tusharjadhav@email.com',
    phone: '+91 9876543212',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NTc2MDE1NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    joinedAt: new Date('2026-01-05'),
    status: 'active',
    reportsCount: 6,
    lastActive: new Date('2026-01-15'),
    address: 'Wakad, Maharashtra',
    verified: false
  },
  {
    id: 'user-4',
    name: 'bhakti Kale',
    email: 'bhaktishakti@email.com',
    phone: '+91 9876543213',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc1NzYwMTU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    joinedAt: new Date('2026-01-12'),
    status: 'suspended',
    reportsCount: 3,
    lastActive: new Date('2026-01-10'),
    address: 'Kothrud, Maharashtra',
    verified: true
  },
  {
    id: 'user-5',
    name: 'Ranjit Bhoi',
    email: 'ranjitbhoi@email.com',
    phone: '+91 9876543214',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NTc2MDE1NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    joinedAt: new Date('2026-01-01'),
    status: 'active',
    reportsCount: 15,
    lastActive: new Date('2026-01-17'),
    address: 'Pimple Saudagar, Maharashtra',
    verified: true
  },
  {
    id: 'user-6',
    name: 'Gayatri Giram',
    email: 'gayatrigiram@email.com',
    phone: '+91 9876543215',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc1NzYwMTU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    joinedAt: new Date('2026-01-05'),
    status: 'active',
    reportsCount: 2,
    lastActive: new Date('2026-01-16'),
    address: 'Kondhwa, Maharashtra',
    verified: false
  }
];

// Mock admin users for user management
export const mockAdminUsers = [
  {
    id: 'admin-1',
    name: 'Shree Joshi',
    email: 'shreejoshi@email.com',
    phone: '+91 9876543220',
    role: 'Senior Administrator',
    department: 'Pune Municipal Corporation',
    employeeId: 'MH2026001',
    status: 'active',
    permissions: ['user_management', 'report_management', 'analytics', 'system_admin'],
    lastLogin: new Date('2026-01-17'),
    createdAt: new Date('2026-01-01')
  },
  {
    id: 'admin-2',
    name: 'Saloni Jadhav',
    email: 'salonijadhav@email.com',
    phone: '+91 9876543221',
    role: 'Department Head',
    department: 'Sanitation',
    employeeId: 'MH2026002',
    status: 'active',
    permissions: ['report_management', 'analytics'],
    lastLogin: new Date('2026-01-16'),
    createdAt: new Date('2026-07-15')
  },
  {
    id: 'admin-3',
    name: 'Shravani Gaikwad',
    email: 'shravanigaikwad@email.com',
    phone: '+91 9876543222',
    role: 'Field Officer',
    department: 'Water Department',
    employeeId: 'MH2026003',
    status: 'active',
    permissions: ['report_management'],
    lastLogin: new Date('2026-01-15'),
    createdAt: new Date('2026-08-20')
  },
  {
    id: 'admin-4',
    name: 'Vaishnavi Kadam',
    email: 'vaishnavikadam@email.com',
    phone: '+91 9876543223',
    role: 'System Operator',
    department: 'IT & Systems',
    employeeId: 'MH2026004',
    status: 'inactive',
    permissions: ['analytics', 'system_admin'],
    lastLogin: new Date('2026-01-10'),
    createdAt: new Date('2026-09-10')
  }
];

// Mock work management data
export const mockWorkItems = [
  {
    id: 'work-1',
    title: 'Road Repairs',
    tasksAvailable: 23,
    staffAssigned: 8,
    priority: 'high',
    department: 'Public Works',
    status: 'active',
    deadline: new Date('2024-02-15'),
    description: 'Pothole repairs and road maintenance across major streets'
  },
  {
    id: 'work-2',
    title: 'Garbage Collection',
    tasksAvailable: 45,
    staffAssigned: 12,
    priority: 'urgent',
    department: 'Sanitation',
    status: 'active',
    deadline: new Date('2024-01-25'),
    description: 'Daily waste collection and disposal management'
  },
  {
    id: 'work-3',
    title: 'Tree Plantation',
    tasksAvailable: 15,
    staffAssigned: 6,
    priority: 'medium',
    department: 'Parks & Gardens',
    status: 'active',
    deadline: new Date('2024-03-10'),
    description: 'Monsoon tree plantation drive in public spaces'
  },
  {
    id: 'work-4',
    title: 'Streetlight Maintenance',
    tasksAvailable: 31,
    staffAssigned: 5,
    priority: 'medium',
    department: 'Electrical',
    status: 'active',
    deadline: new Date('2024-02-28'),
    description: 'Installation and repair of street lighting systems'
  },
  {
    id: 'work-5',
    title: 'Water Pipeline Inspection',
    tasksAvailable: 18,
    staffAssigned: 7,
    priority: 'high',
    department: 'Water Department',
    status: 'active',
    deadline: new Date('2024-02-20'),
    description: 'Regular inspection and maintenance of water supply lines'
  },
  {
    id: 'work-6',
    title: 'Drainage Cleaning',
    tasksAvailable: 27,
    staffAssigned: 9,
    priority: 'urgent',
    department: 'Public Works',
    status: 'active',
    deadline: new Date('2024-01-30'),
    description: 'Pre-monsoon drainage system cleaning and unclogging'
  },
  {
    id: 'work-7',
    title: 'Traffic Signal Repair',
    tasksAvailable: 8,
    staffAssigned: 3,
    priority: 'high',
    department: 'Traffic Police',
    status: 'active',
    deadline: new Date('2024-02-05'),
    description: 'Repair and calibration of traffic control systems'
  },
  {
    id: 'work-8',
    title: 'Public Toilet Maintenance',
    tasksAvailable: 12,
    staffAssigned: 4,
    priority: 'medium',
    department: 'Sanitation',
    status: 'active',
    deadline: new Date('2024-02-12'),
    description: 'Regular cleaning and maintenance of public facilities'
  }
];

// API helpers — use backend when available; fall back to in-file mocks if network fails.
const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000/api';

async function safeFetchJson(url: string, options: any = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API fetch failed:', err);
    throw err;
  }
}

// Token helpers (localStorage)
const TOKEN_KEY = 'civicfix_token';
export function setToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
}
export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
}

async function authFetchJson(url: string, options: any = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return await safeFetchJson(url, { ...options, headers });
}

export const fetchIssues = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/issues');
    if (!res.ok) return mockIssues;
    const data = await res.json();
    return data.issues || data;
  } catch {
    return mockIssues;
  }
};

export async function fetchIssue(id: string): Promise<Issue | null> {
  try {
    return await safeFetchJson(`${API_BASE}/issues/${id}`);
  } catch {
    return mockIssues.find((i) => i.id === id) || null;
  }
}

export async function fetchComments(issueId: string) {
  try {
    return await safeFetchJson(`${API_BASE}/issues/${issueId}/comments`);
  } catch {
    const issue = mockIssues.find((i) => i.id === issueId);
    return issue ? issue.comments || [] : [];
  }
}

export async function createComment(issueId: string, body: string, token?: string) {
  try {
    return await authFetchJson(`${API_BASE}/issues/${issueId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body })
    });
  } catch (err) {
    throw err;
  }
}

export async function createIssue(data: Partial<Issue>, token?: string) {
  try {
    return await authFetchJson(`${API_BASE}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    throw err;
  }
}

export async function updateIssue(id: string, data: Partial<Issue>) {
  try {
    const token = getToken();
    const res = await fetch(`http://localhost:5000/api/issues/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Update failed');
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export async function login(email: string, password: string) {
  const res = await safeFetchJson(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (res && res.token) setToken(res.token);
  return res;
}

export async function register(name: string, email: string, password: string) {
  const res = await safeFetchJson(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (res && res.token) setToken(res.token);
  return res;
}

export async function uploadAttachment(issueId: string, file: File, token?: string) {
  const form = new FormData();
  form.append('file', file);
  try {
    const tokenToUse = token || getToken();
    const headers: any = {};
    if (tokenToUse) headers['Authorization'] = `Bearer ${tokenToUse}`;
    const res = await fetch(`${API_BASE}/issues/${issueId}/attachments`, {
      method: 'POST',
      headers,
      body: form
    });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  } catch (err) {
    console.warn('Attachment upload failed:', err);
    throw err;
  }
}

export async function getAttachmentSignedUrl(attachmentId: string) {
  try {
    return await authFetchJson(`${API_BASE}/attachments/${attachmentId}/signed-url`);
  } catch (err) {
    throw err;
  }
}
