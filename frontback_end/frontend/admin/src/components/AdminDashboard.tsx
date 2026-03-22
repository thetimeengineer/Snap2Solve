import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { IssueDetailModal } from './IssueDetailModal';
import { ChartTooltip } from './ui/chart';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Download,
  Calendar as CalendarIcon,
  BarChart3,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  Calendar as CalendarOrig,
  Shield,
  UserPlus,
  Mail,
  Phone,
  Ban,
  CheckCircle2
} from 'lucide-react';
import { categoryIcons, statusColors, priorityColors } from '../utils/constants';
import { fetchIssues, fetchAnalytics, fetchUsers, updateIssue, deleteIssue } from '../utils/api';

interface AdminDashboardProps {
  key?: number;
}

export function AdminDashboard({ key }: AdminDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    avgResolutionTime: 0
  });

  const [realTimeRangeData, setRealTimeRangeData] = useState<any>({
    week: [],
    month: [],
    quarter: []
  });

  const [realResolutionTrend, setRealResolutionTrend] = useState<any>([]);

  const loadAnalytics = React.useCallback(async () => {
    try {
      const data = await fetchAnalytics();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  }, []);

  const loadUsers = React.useCallback(async () => {
    try {
      const allUsers = await fetchUsers();
      setUsers(allUsers.filter((u: any) => u.role !== 'admin'));
      setAdminUsers(allUsers.filter((u: any) => u.role === 'admin'));
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  const computeCharts = (data: any[]) => {
    // 1. Compute Trends (Week/Month/Quarter)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    
    // Week data
    const weekData = weekDays.map((day, idx) => {
      const dayIssues = data.filter(i => {
        const d = new Date(i.createdAt);
        return d.getDay() === idx && (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
      });
      return {
        name: day,
        reports: dayIssues.length,
        resolved: dayIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length,
        pending: dayIssues.filter(i => i.status !== 'resolved' && i.status !== 'closed').length
      };
    });

    // Month data (by week)
    const monthData = [1, 2, 3, 4].map(w => {
      const weekIssues = data.filter(i => {
        const d = new Date(i.createdAt);
        const diff = (now.getTime() - d.getTime()) / (7 * 24 * 60 * 60 * 1000);
        return diff >= (4 - w) && diff < (5 - w);
      });
      return {
        name: `Week ${w}`,
        reports: weekIssues.length,
        resolved: weekIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length,
        pending: weekIssues.filter(i => i.status !== 'resolved' && i.status !== 'closed').length
      };
    });

    setRealTimeRangeData({
      week: weekData,
      month: monthData,
      quarter: monthData // simplified for now
    });

    // 2. Compute Resolution vs Target
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = months.map((m, idx) => {
      const monthIssues = data.filter(i => new Date(i.createdAt).getMonth() === idx);
      const resolved = monthIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
      return {
        month: m,
        resolved: resolved,
        target: Math.max(10, Math.floor(monthIssues.length * 0.7)) // target is 70% of reports
      };
    }).filter(m => m.resolved > 0 || months.indexOf(m.month) <= now.getMonth());

    setRealResolutionTrend(trend.slice(-6)); // last 6 months
  };

  const loadIssues = React.useCallback(async () => {
    try {
      const { issues: data } = await fetchIssues();
      const mapped = data.map((i: any) => ({
        ...i,
        id: i._id || i.id,
        createdAt: i.createdAt ? new Date(i.createdAt) : new Date(),
        priority: i.priority || 'medium',
        status: i.status || 'reported',
        category: i.category || 'other',
        location: i.location && i.location.coordinates ? {
          address: i.location.address || 'Geo-location provided',
          lat: i.location.coordinates[1],
          lng: i.location.coordinates[0]
        } : (i.location || { address: 'Unknown' }),
        reportedBy: i.reporterId || { name: 'Citizen' },
        images: i.image ? [`http://localhost:5002/${i.image.replace(/\\/g, '/')}`] : (i.images || [])
      }));
      setIssues(mapped);
      computeCharts(mapped);
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    }
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await updateIssue(id, { status: newStatus });
      console.log('Update response:', response);
      toast.success(`Status updated to ${newStatus}`);
      await loadIssues();
      // Update stats as well
      await loadAnalytics();
    } catch (err: any) {
      console.error('Update failed:', err);
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      await deleteIssue(id);
      toast.success("Issue deleted successfully");
      loadIssues();
    } catch (err) {
      toast.error("Failed to delete issue");
    }
  };

  React.useEffect(() => {
    loadIssues();
    loadAnalytics();
    loadUsers();
    const interval = setInterval(() => {
      loadIssues();
      loadAnalytics();
      loadUsers();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadIssues, loadAnalytics, loadUsers]);

  const handleDownloadReport = async (type: 'excel' | 'pdf' | 'csv') => {
    setIsDownloading(true);
    
    try {
      if (type === 'csv' || type === 'excel') {
        const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Location', 'Reported By', 'Date Reported'];
        const csvRows = [headers.join(',')];

        issues.forEach(issue => {
          const row = [
            issue.id,
            `"${issue.title.replace(/"/g, '""')}"`,
            issue.category,
            issue.priority,
            issue.status,
            `"${issue.location?.address || 'Unknown'}"`,
            `"${issue.reportedBy?.name || 'Citizen'}"`,
            issue.createdAt.toISOString()
          ];
          csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `Civic_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Report downloaded successfully`);
      } else {
        toast.error('PDF download is currently unsupported');
      }
    } catch (err) {
      toast.error('Failed to generate report');
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (status: string) => (
    <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
      {status.replace('-', ' ')}
    </Badge>
  );

  const getPriorityBadge = (priority: string) => (
    <Badge className={priorityColors[priority] || 'bg-gray-100 text-gray-800'}>
      {priority}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Administrative Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage civic issue reports across Maharashtra</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-40">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {dateRange.from ? format(dateRange.from, 'MMM dd') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-3xl font-bold">{stats.totalReports || issues.length}</p>
                <p className="text-sm text-green-600 mt-1">Live data</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved Issues</p>
                <p className="text-3xl font-bold">{stats.resolvedReports || issues.filter(i => i.status === 'resolved' || i.status === 'closed').length}</p>
                <p className="text-sm text-green-600 mt-1">Live data</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
                <p className="text-3xl font-bold">{stats.avgResolutionTime || 0}</p>
                <p className="text-sm text-orange-600 mt-1">days</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Issues</p>
                <p className="text-3xl font-bold">{stats.pendingReports || issues.filter(i => i.status !== 'resolved' && i.status !== 'closed').length}</p>
                <p className="text-sm text-red-600 mt-1">Live data</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="exports">Downloads</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Reports Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={realTimeRangeData[selectedTimeRange as keyof typeof realTimeRangeData]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip />
                    <Area 
                      type="monotone" 
                      dataKey="reports" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="resolved" 
                      stackId="2"
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Resolution Performance vs Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realResolutionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip />
                    <Line type="monotone" dataKey="resolved" stroke="#0f4c81" strokeWidth={2} />
                    <Line type="monotone" dataKey="target" stroke="#6c757d" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{categoryIcons[issue.category]}</span>
                      <div>
                        <h4 className="font-medium">{issue.title}</h4>
                        <p className="text-sm text-muted-foreground">{issue.location.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select 
                        defaultValue={issue.status} 
                        onValueChange={(val) => handleStatusUpdate(issue.id, val)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reported">Reported</SelectItem>
                          <SelectItem value="acknowledged">Acknowledged</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="escalated">Escalated</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      {getPriorityBadge(issue.priority)}
                      <div className="flex border-l pl-2 ml-2 gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedIssue(issue);
                            setIsIssueModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(issue.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Generate Reports
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Download comprehensive reports in multiple formats for analysis and compliance
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Quick Downloads</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="text-center space-y-2">
                      <BarChart3 className="h-8 w-8 mx-auto text-sky-800" />
                      <h4 className="font-medium">Monthly Report</h4>
                      <p className="text-sm text-muted-foreground">Current month data</p>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadReport('excel')}
                          disabled={isDownloading}
                        >
                          Excel
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadReport('pdf')}
                          disabled={isDownloading}
                        >
                          PDF
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Custom Report Builder */}
              <div>
                <h3 className="font-medium mb-3">Custom Report Builder</h3>
                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium">Time Period</Label>
                      <Select defaultValue="month">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Last Week</SelectItem>
                          <SelectItem value="month">Last Month</SelectItem>
                          <SelectItem value="quarter">Last Quarter</SelectItem>
                          <SelectItem value="year">Last Year</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Department</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          <SelectItem value="public-works">Public Works</SelectItem>
                          <SelectItem value="sanitation">Sanitation</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="traffic-police">Traffic Police</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Format</Label>
                      <Select defaultValue="excel">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                          <SelectItem value="pdf">PDF Report</SelectItem>
                          <SelectItem value="csv">CSV Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => handleDownloadReport('excel')}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate Custom Report
                      </>
                    )}
                  </Button>
                </Card>
              </div>

              <div>
                <h3 className="font-medium mb-3">Recent Downloads</h3>
                <Card className="p-4">
                  <div className="space-y-2">
                    {[
                      { name: 'Monthly_Civic_Report_2025-03.xlsx', date: '2025-03-15', size: '2.4 MB' },
                      { name: 'Monthly_Civic_Report_2025-02.xlsx', date: '2025-02-14', size: '2.3 MB' },
                      { name: 'Custom_Report_2025-03-10.pdf', date: '2025-03-10', size: '1.1 MB' }
                    ].map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.date} • {file.size}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other existing tabs content would continue here... */}
        <TabsContent value="reports">
          {/* Issues List with filters and actions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Issues</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search issues..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="reported">Reported</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{categoryIcons[issue.category]}</span>
                      <div className="flex-1">
                        <h4 className="font-medium">{issue.title}</h4>
                        <p className="text-sm text-muted-foreground">{issue.location?.address || 'Location provided via coordinate'}</p>
                        <p className="text-xs text-muted-foreground">
                          Reported on {issue.createdAt?.toLocaleDateString()} by {issue.reportedBy?.name || 'Citizen'}
                        </p>
                        {issue.images && issue.images.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {issue.images.slice(0, 3).map((image: string, idx: number) => (
                              <img
                                key={idx}
                                src={image}
                                alt={`Issue ${issue.id}`}
                                className="w-12 h-12 object-cover rounded border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXZpYyUyMGlzc3VlJTIwcGxhY2Vob2xkZXJ8ZW58MXx8fHwxNzU3NjAxNTQzfDA&ixlib=rb-4.1.0&q=80&w=100&utm_source=figma&utm_medium=referral`;
                                }}
                              />
                            ))}
                            {issue.images.length > 3 && (
                              <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs">
                                +{issue.images.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select 
                        defaultValue={issue.status} 
                        onValueChange={(val) => handleStatusUpdate(issue.id, val)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reported">Reported</SelectItem>
                          <SelectItem value="acknowledged">Acknowledged</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="escalated">Escalated</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>

                      {getPriorityBadge(issue.priority)}
                      
                      <div className="flex border-l pl-2 ml-2 gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedIssue(issue);
                            setIsIssueModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(issue.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <div className="space-y-6">
            {/* Citizen Users Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Citizen Users
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user._id || user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {user.status || 'active'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.status === 'suspended' ? (
                          <Button variant="ghost" size="sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm">
                            <Ban className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Admin Users Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Administrator Users
                  </CardTitle>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminUsers.map((admin) => (
                    <div key={admin._id || admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {admin.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{admin.name}</h4>
                            {admin.employeeId && <Badge variant="secondary">{admin.employeeId}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{admin.role || 'Admin'} • {admin.department || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {admin.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined: {new Date(admin.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {admin.status || 'active'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>
      </Tabs>

      {/* Issue Detail Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        open={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setSelectedIssue(null);
        }}
        onUpdate={() => {
          // Trigger a refresh
          loadIssues();
        }}
      />
    </div>
  );
}
