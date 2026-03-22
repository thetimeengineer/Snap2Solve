import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Search, 
  ArrowUpDown, 
  MapPin, 
  Calendar,
  ThumbsUp,
  ArrowLeft,
  Eye
} from 'lucide-react';
import type { Issue } from '../App';

interface IssueListPageProps {
  issues: Issue[];
  onNavigate: (page: string) => void;
  onVote?: (issueId: string) => void;
}

export function IssueListPage({ issues, onNavigate, onVote }: IssueListPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const categories = ['all', 'Roads', 'Lighting', 'Sanitation', 'Water', 'Vandalism', 'Traffic', 'Parks'];
  const statuses = ['all', 'Pending', 'In Progress', 'Resolved', 'Escalated'];

  // Filter and sort issues
  const filteredIssues = issues.filter(issue => {
    const searchStr = (searchTerm || '').toLowerCase();
    const matchesSearch = 
      (issue.title || '').toLowerCase().includes(searchStr) ||
      (issue.description || '').toLowerCase().includes(searchStr);
    const matchesCategory = filterCategory === 'all' || issue.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder: { [key: string]: number } = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      case 'votes':
        return (b.votes || 0) - (a.votes || 0);
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      case 'date':
      default:
        const dateA = a.dateReported instanceof Date ? a.dateReported.getTime() : 0;
        const dateB = b.dateReported instanceof Date ? b.dateReported.getTime() : 0;
        return dateB - dateA;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIssues = sortedIssues.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { className: string } } = {
      'reported': { className: 'bg-yellow-100 text-yellow-800' },
      'acknowledged': { className: 'bg-indigo-100 text-indigo-800' },
      'in-progress': { className: 'bg-blue-100 text-blue-800' },
      'resolved': { className: 'bg-green-100 text-green-800' },
      'escalated': { className: 'bg-red-100 text-red-800' },
      'closed': { className: 'bg-gray-100 text-gray-800' },
      // Legacy support
      'Pending': { className: 'bg-yellow-100 text-yellow-800' },
      'In Progress': { className: 'bg-blue-100 text-blue-800' },
      'Resolved': { className: 'bg-green-100 text-green-800' },
      'Escalated': { className: 'bg-red-100 text-red-800' }
    };
    return variants[status] || { className: 'bg-gray-100 text-gray-800' };
  };

  const getPriorityBadge = (priority: string) => {
    const variants: { [key: string]: { className: string } } = {
      'High': { className: 'bg-red-100 text-red-800' },
      'high': { className: 'bg-red-100 text-red-800' },
      'Medium': { className: 'bg-orange-100 text-orange-800' },
      'medium': { className: 'bg-orange-100 text-orange-800' },
      'Low': { className: 'bg-gray-100 text-gray-800' },
      'low': { className: 'bg-gray-100 text-gray-800' },
      'Urgent': { className: 'bg-purple-100 text-purple-800 font-bold' },
      'urgent': { className: 'bg-purple-100 text-purple-800 font-bold' }
    };
    return variants[priority] || { className: 'bg-gray-100 text-gray-800' };
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Issues</h1>
          <p className="text-gray-600">
            Browse and track all reported civic issues in your community
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date (Newest)</SelectItem>
                  <SelectItem value="priority">Priority (High-Low)</SelectItem>
                  <SelectItem value="votes">Most Voted</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {paginatedIssues.length} of {filteredIssues.length} issues
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Issues Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedIssues.map(issue => (
            <Card key={issue.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {issue.imageUrl && (
                  <ImageWithFallback
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  {/* Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-blue-100 text-blue-800">
                      {issue.category}
                    </Badge>
                    <div className="flex space-x-2">
                      <Badge {...getPriorityBadge(issue.priority)}>
                        {issue.priority}
                      </Badge>
                      <Badge {...getStatusBadge(issue.status)}>
                        {issue.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="font-semibold mb-2 line-clamp-2">{issue.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {issue.description}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                      {issue.coordinates ? (
                        <a 
                          href={`https://www.google.com/maps?q=${issue.coordinates.lat},${issue.coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View on Map
                        </a>
                      ) : (
                        <span className="truncate">{typeof issue.location === 'string' ? issue.location : 'Location unknown'}</span>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1 text-green-500" />
                      {issue.dateReported instanceof Date ? issue.dateReported.toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Reported by {issue.reportedBy || "Citizen"}
                    </div>
                    {issue.assignedDepartment && (
                      <div className="text-xs text-gray-500">
                        Assigned to: {issue.assignedDepartment}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 mr-2"
                      onClick={() => onVote && issue._id && onVote(issue._id)}
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Vote ({issue.votes || 0})
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredIssues.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setFilterStatus('all');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
