import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Users,
  MapPin,
  Filter,
  Download,
  ArrowLeft,
  Eye,
  Edit,
  FileText
} from 'lucide-react';
import type { Issue } from '../App';

interface AdminDashboardProps {
  issues: Issue[];
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ issues, onNavigate }: AdminDashboardProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate statistics
  const totalReports = issues.length;
  const pendingReports = issues.filter(issue => issue.status === 'Pending').length;
  const inProgressReports = issues.filter(issue => issue.status === 'In Progress').length;
  const highPriorityReports = issues.filter(issue => issue.priority === 'High').length;

  // Department data
  const departments = [
    'Roads & Transportation',
    'Electrical Services', 
    'Sanitation Department',
    'Water Department',
    'Maintenance Services',
    'Parks & Recreation'
  ];

  // Filter issues based on admin filters
  const filteredIssues = issues.filter(issue => {
    const matchesDepartment = selectedDepartment === 'all' || issue.assignedDepartment === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || issue.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDepartment && matchesStatus && matchesSearch;
  });

  const updateIssueStatus = (
    issueId: string,
    newStatus: Issue['status'],
    department?: Issue['assignedDepartment']
  ) => {
    // In a real app, this would update the backend
    console.log(`Updating issue ${issueId} to status: ${newStatus}`, department ? `Department: ${department}` : '');
  };

  const getStatusBadge = (status: Issue['status']) => {
    const variants: { [K in Issue['status']]: { className: string } } = {
      'Pending': { className: 'bg-yellow-100 text-yellow-800' },
      'In Progress': { className: 'bg-blue-100 text-blue-800' },
      'Resolved': { className: 'bg-green-100 text-green-800' },
      'Escalated': { className: 'bg-red-100 text-red-800' }
    };
    return variants[status];
  };

  const getPriorityBadge = (priority: Issue['priority']) => {
    const variants: { [K in Issue['priority']]: { className: string } } = {
      'High': { className: 'bg-red-100 text-red-800' },
      'Medium': { className: 'bg-orange-100 text-orange-800' },
      'Low': { className: 'bg-gray-100 text-gray-800' }
    };
    return variants[priority];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('home')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">
                Manage and track civic issues across all departments
              </p>
            </div>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Reports</p>
                      <p className="text-3xl font-bold text-gray-900">{totalReports}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Updated
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-3xl font-bold text-orange-600">{pendingReports}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Live data
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">In Progress</p>
                      <p className="text-3xl font-bold text-blue-600">{inProgressReports}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Live data
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">High Priority</p>
                      <p className="text-3xl font-bold text-red-600">{highPriorityReports}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-red-600">
                    Live data
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Latest issues reported by citizens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {issues.slice(0, 5).map(issue => (
                    <div key={issue.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      {issue.imageUrl && (
                        <ImageWithFallback
                          src={issue.imageUrl}
                          alt={issue.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{issue.title}</h4>
                          <Badge {...getPriorityBadge(issue.priority)}>{issue.priority}</Badge>
                          <Badge {...getStatusBadge(issue.status)}>{issue.status}</Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          {issue.location}
                          <span className="mx-2">•</span>
                          <span>{issue.dateReported.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3 mr-1" />
                          Assign
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Management Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reports Table */}
            <Card>
              <CardHeader>
                <CardTitle>Reports Management</CardTitle>
                <CardDescription>
                  Showing {filteredIssues.length} of {issues.length} reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredIssues.map(issue => (
                    <div key={issue.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{issue.title}</h4>
                            <Badge variant="outline" className="text-xs">{issue.id}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {issue.location}
                            </span>
                            <span>Reported by {issue.reportedBy}</span>
                            <span>{issue.dateReported.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge {...getPriorityBadge(issue.priority)}>{issue.priority}</Badge>
                          <Badge {...getStatusBadge(issue.status)}>{issue.status}</Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700">{issue.description}</p>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="text-sm text-gray-600">
                          {issue.assignedDepartment ? (
                            <span>Assigned to: <strong>{issue.assignedDepartment}</strong></span>
                          ) : (
                            <span className="text-orange-600">Unassigned</span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Select
                            value={issue.assignedDepartment || ''}
                            onValueChange={(dept: Issue['assignedDepartment']) =>
                              updateIssueStatus(issue.id, issue.status, dept)
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Assign Dept." />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={issue.status}
                            onValueChange={(status: Issue['status']) =>
                              updateIssueStatus(issue.id, status)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                              <SelectItem value="Escalated">Escalated</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resolution Rate</CardTitle>
                  <CardDescription>Issues resolved over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Chart visualization would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Resolution Time</CardTitle>
                  <CardDescription>By department and priority</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Roads & Transportation</span>
                      <span className="font-medium">2.1 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Electrical Services</span>
                      <span className="font-medium">1.8 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sanitation</span>
                      <span className="font-medium">0.9 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Water Department</span>
                      <span className="font-medium">4.2 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Issue Heatmap</CardTitle>
                <CardDescription>Geographic distribution of reported issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Interactive heatmap would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map(department => {
                const deptIssues = issues.filter(issue => issue.assignedDepartment === department);
                const resolved = deptIssues.filter(issue => issue.status === 'Resolved').length;
                const pending = deptIssues.filter(issue => issue.status === 'Pending').length;
                const inProgress = deptIssues.filter(issue => issue.status === 'In Progress').length;
                
                return (
                  <Card key={department}>
                    <CardHeader>
                      <CardTitle className="text-lg">{department}</CardTitle>
                      <CardDescription>{deptIssues.length} total issues</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Resolved</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{resolved}</span>
                          <Badge className="bg-green-100 text-green-800">
                            {deptIssues.length > 0 ? Math.round((resolved / deptIssues.length) * 100) : 0}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">In Progress</span>
                        <span className="font-medium">{inProgress}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pending</span>
                        <span className="font-medium">{pending}</span>
                      </div>
                      
                      <Button className="w-full" variant="outline" size="sm">
                        View Department Details
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
