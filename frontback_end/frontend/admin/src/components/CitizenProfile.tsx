import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Trophy, 
  TrendingUp,
  Settings,
  Bell,
  Lock,
  Edit,
  Save,
  Star,
  Award,
  Target,
  ChevronRight
} from 'lucide-react';
import { statusColors, categoryIcons } from '../utils/constants';
import { fetchIssues } from '../utils/api';
import { mockCitizen } from '../utils/mockData';
import { Citizen, Issue } from '../types';

export function CitizenProfile() {
  const [citizen, setCitizen] = useState<Citizen>(mockCitizen);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: citizen.name,
    phone: citizen.phone || '',
    address: citizen.address || { street: '', city: '', state: '', pincode: '' }
  });

  const [userIssues, setUserIssues] = useState<Issue[]>([]);

  React.useEffect(() => {
    let mounted = true;
    fetchIssues().then(({ issues: data }) => {
      if (!mounted) return;
      const normalized = data.map((i: any) => ({ 
        ...i, 
        id: i._id || i.id,
        createdAt: i.createdAt ? new Date(i.createdAt) : new Date() 
      }));
      setUserIssues(normalized.filter((issue: any) => issue.reportedBy?.email === citizen.email));
    }).catch(() => {
      setUserIssues([]);
    });
    return () => { mounted = false; };
  }, [citizen.email]);

  const handleSaveProfile = () => {
    setCitizen(prev => ({
      ...prev,
      name: editData.name,
      phone: editData.phone,
      address: editData.address
    }));
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handlePreferenceChange = (
    category: keyof Citizen['preferences'],
    preference: string,
    value: boolean
  ) => {
    setCitizen(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...(prev.preferences[category] as Record<string, boolean>),
          [preference]: value
        }
      }
    }));
    toast.success('Preference updated');
  };

  const getReputationLevel = (score: number) => {
    if (score >= 500) return { level: 'Champion', color: 'text-purple-600', progress: 100 };
    if (score >= 300) return { level: 'Leader', color: 'text-blue-600', progress: (score - 300) / 200 * 100 };
    if (score >= 150) return { level: 'Active', color: 'text-green-600', progress: (score - 150) / 150 * 100 };
    if (score >= 50) return { level: 'Contributor', color: 'text-orange-600', progress: (score - 50) / 100 * 100 };
    return { level: 'Beginner', color: 'text-gray-600', progress: score / 50 * 100 };
  };

  const reputationInfo = getReputationLevel(citizen.statistics.reputationScore);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={citizen.avatar} alt={citizen.name} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {citizen.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                {isEditing ? (
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-lg font-semibold"
                  />
                ) : (
                  <h1 className="text-2xl font-bold">{citizen.name}</h1>
                )}
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{citizen.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {citizen.joinedAt.getFullYear()}</span>
                </div>
              </div>
            </div>

            <div className="flex-1" />

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Star className={`h-5 w-5 ${reputationInfo.color}`} />
                <span className={`font-semibold ${reputationInfo.color}`}>
                  {reputationInfo.level}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Reputation Score</p>
                <p className="text-2xl font-bold">{citizen.statistics.reputationScore}</p>
              </div>
              <Button
                variant={isEditing ? 'default' : 'outline'}
                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                className="mt-2"
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Reputation Progress */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress to next level</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(reputationInfo.progress)}%
              </span>
            </div>
            <Progress value={reputationInfo.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{citizen.statistics.totalReports}</div>
            <div className="text-sm text-muted-foreground">Total Reports</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{citizen.statistics.resolvedReports}</div>
            <div className="text-sm text-muted-foreground">Resolved Issues</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{citizen.statistics.votesReceived}</div>
            <div className="text-sm text-muted-foreground">Community Votes</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{citizen.badges.length}</div>
            <div className="text-sm text-muted-foreground">Badges Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  {isEditing ? (
                    <Input
                      value={editData.phone}
                      onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 XXXXXXXXXX"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{citizen.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editData.address.street}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          address: { ...prev.address, street: e.target.value }
                        }))}
                        placeholder="Street Address"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          value={editData.address.city}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            address: { ...prev.address, city: e.target.value }
                          }))}
                          placeholder="City"
                        />
                        <Input
                          value={editData.address.state}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            address: { ...prev.address, state: e.target.value }
                          }))}
                          placeholder="State"
                        />
                        <Input
                          value={editData.address.pincode}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            address: { ...prev.address, pincode: e.target.value }
                          }))}
                          placeholder="Pincode"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <div>
                        {citizen.address ? (
                          <>
                            <p>{citizen.address.street}</p>
                            <p>{citizen.address.city}, {citizen.address.state} {citizen.address.pincode}</p>
                          </>
                        ) : (
                          <span>Not provided</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userIssues.slice(0, 3).map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{categoryIcons[issue.category]}</span>
                      <div>
                        <p className="font-medium">{issue.title}</p>
                        <p className="text-sm text-muted-foreground">{issue.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[issue.status]}>
                        {issue.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All My Reports ({userIssues.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userIssues.map((issue) => (
                  <div key={issue.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryIcons[issue.category]}</span>
                        <h3 className="font-semibold">{issue.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={statusColors[issue.status]}>
                          {issue.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-2">{issue.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {issue.location.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {issue.createdAt.toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {issue.votes} votes
                      </span>
                    </div>

                    {issue.images.length > 0 && (
                      <div className="mt-3">
                        <ImageWithFallback
                          src={issue.images[0]}
                          alt="Issue photo"
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievement Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {citizen.badges.map((badge) => (
                  <div key={badge.id} className="border rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <h3 className="font-semibold mb-1">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                    <div className="text-xs text-muted-foreground">
                      Earned on {badge.earnedAt.toLocaleDateString()}
                    </div>
                    <Badge variant="outline" className="mt-2 capitalize">
                      {badge.type}
                    </Badge>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="font-semibold mb-3">Available Badges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Photo Expert', description: 'Upload 10 photos with reports', icon: '📸', type: 'reporter' },
                    { name: 'Night Owl', description: 'Report an issue after 10 PM', icon: '🦉', type: 'special' },
                    { name: 'Trend Setter', description: 'Get 50+ votes on a single report', icon: '🔥', type: 'community' }
                  ].map((badge, index) => (
                    <div key={index} className="border rounded-lg p-4 text-center opacity-50">
                      <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                      <h3 className="font-semibold mb-1">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                      <Badge variant="outline" className="capitalize">
                        {badge.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Email Notifications</label>
                  <p className="text-sm text-muted-foreground">Get updates via email</p>
                </div>
                  <Switch
                    checked={citizen.preferences.notifications.email}
                    onCheckedChange={(checked: boolean) => 
                      handlePreferenceChange('notifications', 'email', checked)
                    }
                  />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">SMS Notifications</label>
                  <p className="text-sm text-muted-foreground">Get updates via SMS</p>
                </div>
                  <Switch
                    checked={citizen.preferences.notifications.sms}
                    onCheckedChange={(checked: boolean) => 
                      handlePreferenceChange('notifications', 'sms', checked)
                    }
                  />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Push Notifications</label>
                  <p className="text-sm text-muted-foreground">Get updates on your device</p>
                </div>
                  <Switch
                    checked={citizen.preferences.notifications.push}
                    onCheckedChange={(checked: boolean) => 
                      handlePreferenceChange('notifications', 'push', checked)
                    }
                  />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Show Public Profile</label>
                  <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
                </div>
                  <Switch
                    checked={citizen.preferences.privacy.showProfile}
                    onCheckedChange={(checked: boolean) => 
                      handlePreferenceChange('privacy', 'showProfile', checked)
                    }
                  />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Share Location Automatically</label>
                  <p className="text-sm text-muted-foreground">Auto-detect location when reporting</p>
                </div>
                  <Switch
                    checked={citizen.preferences.privacy.shareLocation}
                    onCheckedChange={(checked: boolean) => 
                      handlePreferenceChange('privacy', 'shareLocation', checked)
                    }
                  />
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" className="w-full">
                Download My Data
              </Button>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
