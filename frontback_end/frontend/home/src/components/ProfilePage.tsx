import { useEffect, useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { 
  User as UserIcon, 
  MapPin, 
  Calendar, 
  CheckCircle,
  ThumbsUp,
  ArrowLeft,
  Edit,
  Bell,
  Camera,
  Save,
  Trophy,
  Target
} from 'lucide-react';
import type { Issue, User as UserType } from '../App';
import { API_BASE, getToken } from '../utils/api';

interface ProfilePageProps {
  currentUser: UserType;
  issues: Issue[];
  leaderboard: UserType[];
  onNavigate: (page: string) => void;
  onUpdateUser: (user: UserType) => void;
}

export function ProfilePage({ currentUser, issues, leaderboard, onNavigate, onUpdateUser }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userReportedIssues = issues.filter(issue => issue.reportedBy === currentUser.name);
  const resolvedIssues = userReportedIssues.filter(issue => issue.status === 'resolved' || issue.status === 'Resolved');

  const globalRank = leaderboard.findIndex(u => (u.id || u._id) === (currentUser.id || currentUser._id)) + 1;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('phone', editPhone);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Backend returns avatarUrl, map it to avatar for frontend
        const updatedUser = {
          ...data.user,
          avatar: data.user.avatarUrl ? `${API_BASE.replace('/api', '')}/${data.user.avatarUrl}` : undefined
        };
        onUpdateUser(updatedUser);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // Generate real notifications based on status changes
    const newNotifications = userReportedIssues.map(issue => ({
      id: issue.id,
      title: `Issue Update: ${issue.title}`,
      message: `Your reported issue status has been updated to: ${issue.status.replace('-', ' ')}`,
      date: new Date(),
      read: false,
      type: 'update' as const
    }));
    
    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 10));
    }
  }, [issues.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('home')}
            className="mb-2 text-gray-700 hover:text-gray-900 transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Card className="mb-8 shadow-lg border border-slate-100">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={avatarPreview || currentUser.avatar} />
                  <AvatarFallback className="text-3xl bg-blue-600 text-white">
                    {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="text-lg font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={editPhone} 
                        onChange={(e) => setEditPhone(e.target.value)} 
                        placeholder="Add phone number"
                      />
                    </div>
                    <div className="flex justify-center md:justify-start space-x-3">
                      <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                      </Button>
                      <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{currentUser.name}</h1>
                      <div className="flex gap-2">
                        <Badge className="bg-blue-100 text-blue-800 border-none">
                          <UserIcon className="w-3 h-3 mr-1" />
                          Citizen
                        </Badge>
                        <Badge className="bg-amber-100 text-amber-800 border-none">
                          <Trophy className="w-3 h-3 mr-1" />
                          Level {Math.floor((currentUser.points || 0) / 100) + 1}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">{currentUser.email}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="text-2xl font-bold text-blue-600">{currentUser.points || 0}</div>
                        <div className="text-xs font-medium text-blue-600 uppercase tracking-wider">Total Points</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <div className="text-2xl font-bold text-green-600">{userReportedIssues.length}</div>
                        <div className="text-xs font-medium text-green-600 uppercase tracking-wider">Issues Reported</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <div className="text-2xl font-bold text-purple-600">{resolvedIssues.length}</div>
                        <div className="text-xs font-medium text-purple-600 uppercase tracking-wider">Resolved</div>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <div className="text-2xl font-bold text-amber-600">
                          {globalRank > 0 ? `#${globalRank}` : 'N/A'}
                        </div>
                        <div className="text-xs font-medium text-amber-600 uppercase tracking-wider">Global Rank</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {!isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-150 hover:shadow-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-slate-200 rounded-lg p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">My Reports</TabsTrigger>
            <TabsTrigger value="leaderboard">Global Leaderboard</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    Points Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Progress to Level {Math.floor((currentUser.points || 0) / 100) + 2}</span>
                      <span className="font-bold text-blue-600">{(currentUser.points || 0) % 100}/100</span>
                    </div>
                    <Progress value={(currentUser.points || 0) % 100} className="h-3 bg-blue-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                      <div className="text-xs text-gray-500 uppercase font-bold">Points per Report</div>
                      <div className="text-lg font-bold text-slate-700">+10</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                      <div className="text-xs text-gray-500 uppercase font-bold">Total Activity</div>
                      <div className="text-lg font-bold text-slate-700">{userReportedIssues.length} reports</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-amber-600" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {userReportedIssues.length >= 1 && <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">First Reporter</Badge>}
                    {userReportedIssues.length >= 5 && <Badge className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">Active Citizen</Badge>}
                    {resolvedIssues.length >= 1 && <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1">Issue Resolver</Badge>}
                    {(currentUser.points || 0) >= 100 && <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">Centurion</Badge>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="border-none shadow-md">
              <CardContent className="p-0">
                {userReportedIssues.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {userReportedIssues.map((issue) => (
                      <div key={issue.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900">{issue.title}</h4>
                          <p className="text-sm text-gray-500 line-clamp-1">{issue.description}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-400">
                            <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(issue.createdAt || '').toLocaleDateString()}</span>
                            <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {issue.category}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={
                            issue.status === 'resolved' ? 'bg-green-100 text-green-700 border-none' : 
                            issue.status === 'in-progress' ? 'bg-blue-100 text-blue-700 border-none' : 
                            'bg-amber-100 text-amber-700 border-none'
                          }>
                            {issue.status}
                          </Badge>
                          <div className="text-[10px] font-bold text-blue-600 uppercase">+10 Points Earned</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-20 text-center space-y-4">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <Edit className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-gray-500 font-medium">You haven't reported any issues yet.</p>
                    <Button variant="outline" onClick={() => onNavigate('report')}>Start Reporting</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-amber-500" />
                  Top Active Citizens
                </CardTitle>
                <CardDescription>Ranked by contribution and points</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {leaderboard.map((user, index) => (
                    <div 
                      key={user.id || user._id} 
                      className={`p-6 flex items-center space-x-4 ${ (user.id || user._id) === (currentUser.id || currentUser._id) ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="w-8 text-center font-bold text-slate-400">
                        {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : `#${index + 1}`}
                      </div>
                      <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                        <AvatarImage src={user.avatarUrl ? `${API_BASE.replace('/api', '')}/${user.avatarUrl}` : undefined} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 flex items-center">
                          {user.name}
                          {(user.id || user._id) === (currentUser.id || currentUser._id) && (
                            <Badge className="ml-2 bg-blue-100 text-blue-700 text-[10px] h-4">You</Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">Citizen Level {Math.floor((user.points || 0) / 100) + 1}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{user.points || 0}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-4">
              {notifications.length > 0 ? notifications.map((notif) => (
                <Card key={notif.id} className={`border-none shadow-sm ${notif.read ? 'opacity-60' : 'border-l-4 border-l-blue-500'}`}>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Bell className={`w-4 h-4 mr-2 ${notif.read ? 'text-gray-400' : 'text-blue-500'}`} />
                        <CardTitle className="text-base font-bold">{notif.title}</CardTitle>
                      </div>
                      <span className="text-xs text-gray-400">{notif.date.toLocaleDateString()}</span>
                    </div>
                    <CardDescription className="pl-6 text-slate-600">{notif.message}</CardDescription>
                  </CardHeader>
                </Card>
              )) : (
                <div className="p-20 text-center text-gray-500">No new notifications</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
