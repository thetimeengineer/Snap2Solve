import { useState, useEffect } from 'react'
import axios from 'axios'

import { Navigation } from './components/Navigation'
import { LandingPage } from './components/LandingPage'
import { ReportIssue } from './components/ReportIssue'
import { IssueListPage } from './components/IssueListPage'
import { ProfilePage } from './components/ProfilePage'
import { AuthForm } from './components/AuthForm'
import { API_BASE, getToken, clearToken } from './utils/api'

export type Issue = {
  _id?: string
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'closed'
  location: { type: string; coordinates: [number, number] }
  coordinates?: { lat: number; lng: number } // Legacy mapping if needed
  reporterId?: string
  reportedBy?: string // Legacy mapping
  createdAt?: string
  dateReported?: Date // Legacy mapping
  imageUrl?: string
  image?: string // From Backend
  votes?: number
  assignedDepartment?: string
  labels?: string[]
}

export type User = {
  id?: string
  _id?: string
  name: string
  email: string
  avatar?: string
  avatarUrl?: string
  phone?: string
  points?: number
  role?: string
  issuesReported?: number
  issuesResolved?: number
  badges?: string[]
  isAdmin?: boolean
  totalReports?: number
}

export default function App() {

  const [currentPage, setCurrentPage] = useState('home')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState<User[]>([])

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
  };

  // Fetch all issues periodically
  useEffect(() => {
    let interval: any;

    const fetchIssues = async () => {
      try {
        const res = await fetch(`${API_BASE}/issues`);
        if (res.ok) {
          const data = await res.json();
          // map backend issues to frontend expected shape
          const mappedIssues = data.issues
            .filter((i: any) => i.status !== 'resolved' && i.status !== 'closed')
            .map((i: any) => ({
            ...i,
            id: i._id,
            dateReported: new Date(i.createdAt),
            priority: i.priority ? (i.priority.charAt(0).toUpperCase() + i.priority.slice(1)) : 'Medium',
            status: i.status === 'reported' ? 'reported' : 
                    i.status === 'acknowledged' ? 'acknowledged' : 
                    i.status === 'in-progress' ? 'in-progress' : 
                    i.status === 'resolved' ? 'resolved' : 
                    i.status === 'escalated' ? 'escalated' :
                    i.status === 'closed' ? 'closed' : i.status,
            coordinates: {
               lat: i.location?.coordinates?.[1] || 0,
               lng: i.location?.coordinates?.[0] || 0
            },
            imageUrl: i.image ? `${API_BASE.replace('/api', '')}/${i.image.replace(/\\/g, '/')}` : undefined,
            reportedBy: i.reporterId?.name || "Citizen",
            reporterId: i.reporterId?._id || i.reporterId // Normalize reporterId to string if it's an object
          }));
          setIssues(mappedIssues);
        }
      } catch (err) {
        console.error("Failed to fetch issues", err);
      }
    };

    fetchIssues();
    fetchLeaderboard();
    interval = setInterval(() => {
      fetchIssues();
      fetchLeaderboard();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Restore session
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          const userData = data.user;
          // Simplified user setting
          setCurrentUser({
            ...userData,
            id: userData._id,
            avatar: userData.avatarUrl ? `${API_BASE.replace('/api', '')}/${userData.avatarUrl}` : undefined
          });
        } else {
          clearToken();
        }
      } catch (err) {
        console.error("Auth check failed", err);
        clearToken();
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // ----------- AI DETECTION FUNCTION -----------
  // Legacy detectIssue removed due to direct fetch in createIssue

  // ----------- GEOLOCATION FUNCTION -----------

  const getLocation = (): Promise<{ lat: number; lng: number }> => {

    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(

        (position) => {

          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })

        },

        (error) => reject(error)

      )

    })

  }

  // ----------- CREATE ISSUE -----------

  const createIssue = async (
    title: string,
    description: string,
    category: string,
    file: File,
    coords: { lat: number; lng: number } | null,
    labels?: string[]
  ) => {

    try {
      // If coordinates are not provided, try to get them
      let locationData = coords;
      if (!locationData) {
        try {
          locationData = await getLocation();
        } catch (err) {
          console.warn("Location not available", err);
        }
      }

      // 1. Submit issue with file
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("image", file); // Ensure the backend expects 'image'
      
      if (labels && labels.length > 0) {
        labels.forEach(label => formData.append("labels[]", label));
      }

      if (locationData) {
        formData.append("location", JSON.stringify({
          type: "Point",
          coordinates: [locationData.lng, locationData.lat]
        }));
      }

      const res = await fetch(`${API_BASE}/issues`, {
         method: "POST",
         headers: {
           Authorization: `Bearer ${getToken()}`
         },
         body: formData
      });

      if (res.ok) {
         const data = await res.json();
         console.log("Issue Created Successfully", data);
         return data.tokenId || data._id;
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create issue");
      }

    } catch (error: any) {
      console.error("Issue creation failed", error)
      alert(error.message || "Issue creation failed");
      return null;
    }

  }

  const handleVote = async (issueId: string) => {
    try {
      const res = await fetch(`${API_BASE}/issues/${issueId}/vote`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (res.ok) {
        console.log("Vote recorded");
        // Issue list will refresh via polling
      } else {
        const data = await res.json();
        alert(data.message || "Voting failed");
      }
    } catch (err) {
      console.error("Vote failed", err);
    }
  }

  const onLogin = (user: any) => {
    // Map initial user data on login
    const mappedUser = {
      ...user,
      id: user._id,
      avatar: user.avatarUrl ? `${API_BASE.replace('/api', '')}/${user.avatarUrl}` : undefined
    };
    setCurrentUser(mappedUser);
    setCurrentPage('home');
  }

  const handleLogout = () => {
    clearToken();
    setCurrentUser(null);
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    return <AuthForm onLogin={onLogin} />;
  }

  const renderCurrentPage = () => {

    switch (currentPage) {

      case 'home':
        return <LandingPage onNavigate={handleNavigate} />

      case 'report':
        return (
          <ReportIssue
            onBack={() => handleNavigate('home')}
            onSubmit={createIssue}
          />
        )

      case 'issues':
        return (
          <IssueListPage
            issues={issues}
            onNavigate={handleNavigate}
            onVote={handleVote}
          />
        )

      case 'profile':
        return (
          <ProfilePage
            currentUser={currentUser}
            issues={issues}
            leaderboard={leaderboard}
            onNavigate={handleNavigate}
            onUpdateUser={setCurrentUser}
          />
        )

      default:
        return <LandingPage onNavigate={handleNavigate} />
    }

  }

  return (

    <div className="min-h-screen bg-background">

      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={currentUser}
        onLogout={handleLogout}
      />

      <main className="pt-16">
        {renderCurrentPage()}
      </main>

    </div>

  )

}