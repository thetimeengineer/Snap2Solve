import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MapPin, Eye, MessageCircle, ThumbsUp } from 'lucide-react';
import { categoryIcons, statusColors, priorityColors } from '../utils/constants';
import { fetchIssues, updateIssue, deleteIssue } from '../utils/api';
import { Issue } from '../types';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function IssueMap() {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [issues, setIssues] = useState<Issue[]>([]);

  const loadIssues = React.useCallback(async () => {
    try {
      const { issues: data } = await fetchIssues();
      const normalized = data.map((i: any) => ({ 
        ...i, 
        id: i._id || i.id,
        createdAt: i.createdAt ? new Date(i.createdAt) : new Date(),
        location: i.location && i.location.coordinates ? {
          address: i.location.address || 'Geo-location provided',
          lat: i.location.coordinates[1],
          lng: i.location.coordinates[0]
        } : (i.location || { address: 'Unknown' })
      }));
      setIssues(normalized);
    } catch (err) {
      toast.error('Failed to load issues');
    }
  }, []);

  React.useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateIssue(id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      loadIssues();
      if (selectedIssue?.id === id) {
        setSelectedIssue(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this issue permanently?")) return;
    try {
      await deleteIssue(id);
      toast.success("Issue deleted");
      setSelectedIssue(null);
      loadIssues();
    } catch (err) {
      toast.error("Failed to delete issue");
    }
  };

  const filteredIssues = issues.filter(issue =>
    filter === 'all' || issue.status === filter
  );

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Issue Map - Pune, Maharashtra
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            {['all', 'reported', 'in-progress', 'resolved'].map(status => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'All Issues' : status.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {/* Map Area */}
          <div className="relative bg-muted rounded-lg h-96 mb-4 overflow-hidden border">
            {selectedIssue && selectedIssue.location && selectedIssue.location.lat ? (
              <iframe
                title="Issue Map"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps?q=${selectedIssue.location.lat},${selectedIssue.location.lng}&z=15&output=embed`}
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500">
                <MapPin className="h-12 w-12 mb-2 opacity-20" />
                <p>Select an issue to view its location on the map</p>
              </div>
            )}
            
            {/* Legend Overlay */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border text-xs space-y-2 z-10">
              <p className="font-semibold border-b pb-1 mb-2">Priority Legend</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Urgent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span>Low</span>
              </div>
            </div>
          </div>

          {/* Issue Quick List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredIssues.slice(0, 6).map((issue) => (
              <div 
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedIssue?.id === issue.id 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{categoryIcons[issue.category] || '📍'}</span>
                  <Badge className={statusColors[issue.status] || 'bg-gray-100'}>
                    {issue.status}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm truncate">{issue.title}</h4>
                <p className="text-xs text-slate-500 truncate">{issue.location.address || 'Location provided'}</p>
              </div>
            ))}
          </div>

          {/* Issue Details */}
          {selectedIssue && (
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{selectedIssue.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedIssue.location.address}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Select 
                      defaultValue={selectedIssue.status} 
                      onValueChange={(val) => handleStatusUpdate(selectedIssue.id, val)}
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
                    <Badge variant="outline">
                      {selectedIssue.priority}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm mb-3">{selectedIssue.description}</p>

                {selectedIssue.images.length > 0 && (
                  <div className="mb-3">
                    <ImageWithFallback
                      src={selectedIssue.images[0]}
                      alt="Issue photo"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {selectedIssue.votes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {selectedIssue.comments.length}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(selectedIssue.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {selectedIssue.assignedTo && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                    <p><strong>Assigned to:</strong> {selectedIssue.assignedTo}</p>
                    <p><strong>Department:</strong> {selectedIssue.department}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
