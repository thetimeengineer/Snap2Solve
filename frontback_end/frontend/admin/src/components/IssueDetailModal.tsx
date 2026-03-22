import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import {
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  MessageCircle,
  ThumbsUp,
  Trash2,
  X,
  Building2,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { Issue } from '../types';
import { categoryIcons } from '../utils/constants';
import { fetchComments, updateIssue, deleteIssue } from '../utils/api';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface IssueDetailModalProps {
  issue: Issue | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  resolved:     { pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'in-progress':{ pill: 'bg-blue-100 text-blue-700 border-blue-200',          dot: 'bg-blue-500'    },
  acknowledged: { pill: 'bg-indigo-100 text-indigo-700 border-indigo-200',    dot: 'bg-indigo-500'  },
  escalated:    { pill: 'bg-purple-100 text-purple-700 border-purple-200',    dot: 'bg-purple-500'  },
  reported:     { pill: 'bg-amber-100 text-amber-700 border-amber-200',       dot: 'bg-amber-500'   },
  pending:      { pill: 'bg-amber-100 text-amber-700 border-amber-200',       dot: 'bg-amber-500'   },
  closed:       { pill: 'bg-gray-100 text-gray-600 border-gray-200',          dot: 'bg-gray-400'    },
};

const PRIORITY_STYLES: Record<string, string> = {
  high:   'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low:    'bg-gray-100 text-gray-600 border-gray-200',
};

function SectionHeader({ icon: Icon, label, color = 'text-gray-600', bg = 'bg-gray-100' }: { icon: any; label: string; color?: string; bg?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={`h-7 w-7 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-3.5 w-3.5 ${color}`} />
      </span>
      <h3 className="text-sm font-extrabold text-gray-800">{label}</h3>
    </div>
  );
}

export function IssueDetailModal({ issue, open, onClose, onUpdate }: IssueDetailModalProps) {
  const [comments,       setComments]       = useState<any[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting,       setDeleting]       = useState(false);

  useEffect(() => { if (issue) setComments(issue.comments || []); }, [issue]);

  useEffect(() => {
    if (!issue) return;
    let mounted = true;
    fetchComments(issue.id)
      .then((c: any) => {
        if (!mounted) return;
        setComments(Array.isArray(c)
          ? c.map((x: any) => ({ ...x, createdAt: x.createdAt ? new Date(x.createdAt) : new Date() }))
          : []);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [issue?.id]);

  if (!issue) return null;

  const statusStyle   = STATUS_STYLES[issue.status]   ?? STATUS_STYLES.pending;
  const priorityStyle = PRIORITY_STYLES[issue.priority] ?? PRIORITY_STYLES.low;

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try { await updateIssue(issue.id, { status: newStatus }); toast.success(`Status → ${newStatus}`); if (onUpdate) onUpdate(); }
    catch { toast.error('Failed to update status'); }
    finally { setUpdatingStatus(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue? This cannot be undone.')) return;
    setDeleting(true);
    try { await deleteIssue(issue.id); toast.success('Issue deleted'); onClose(); if (onUpdate) onUpdate(); }
    catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const fmt = (d: Date) => d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden p-0 gap-0 rounded-2xl border-gray-200 shadow-2xl">

        {/* Header bar */}
        <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-start justify-between gap-4 sticky top-0 z-10">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-11 w-11 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-gray-200">
              {categoryIcons[issue.category] || '📋'}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-extrabold text-gray-900 leading-snug pr-4">{issue.title}</DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusStyle.pill}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                  {issue.status.replace('-', ' ')}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${priorityStyle}`}>
                  {issue.priority} priority
                </span>
                <span className="text-[11px] font-mono text-gray-400">#{String(issue.id).slice(-8)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0 mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-6">

            {/* Images */}
            {issue.images && issue.images.length > 0 && (
              <div>
                <SectionHeader icon={Calendar} label="Reported Images" bg="bg-blue-50" color="text-blue-600" />
                <div className="grid grid-cols-2 gap-3">
                  {issue.images.map((img, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-xl border border-gray-200">
                      <img
                        src={img}
                        alt={`Issue img ${idx + 1}`}
                        className="w-full h-44 object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=No+Image'; }}
                      />
                      <button
                        onClick={() => window.open(img, '_blank')}
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center"
                      >
                        <span className="text-white font-bold text-xs bg-black/60 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          View Full
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <SectionHeader icon={AlertTriangle} label="Description" bg="bg-amber-50" color="text-amber-600" />
              <p className="text-sm text-gray-600 font-medium leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                {issue.description}
              </p>
            </div>

            {/* Location + Reporter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <SectionHeader icon={MapPin} label="Location" bg="bg-rose-50" color="text-rose-600" />
                <p className="text-sm text-gray-800 font-semibold">{issue.location.address}</p>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  {issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}
                </p>
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${issue.location.lat},${issue.location.lng}`, '_blank')}
                  className="mt-2 text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <MapPin className="h-3 w-3" /> Open in Maps
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <SectionHeader icon={User} label="Reported By" bg="bg-violet-50" color="text-violet-600" />
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="h-8 w-8 bg-violet-100 rounded-full flex items-center justify-center font-extrabold text-violet-600 text-sm">
                    {issue.reportedBy?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <p className="text-sm font-bold text-gray-900">{issue.reportedBy?.name || 'Unknown'}</p>
                </div>
                {issue.reportedBy?.email && (
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" /> {issue.reportedBy.email}
                  </p>
                )}
                {issue.reportedBy?.phone && (
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" /> {issue.reportedBy.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Admin Actions + Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status control */}
              <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                <SectionHeader icon={Shield} label="Administrative Actions" bg="bg-blue-100" color="text-blue-700" />
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Update Status</label>
                <Select defaultValue={issue.status} onValueChange={handleStatusChange} disabled={updatingStatus}>
                  <SelectTrigger className="w-full bg-white border-blue-200 rounded-lg text-sm font-semibold h-9">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reported">Reported (Pending)</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved ✓</SelectItem>
                    <SelectItem value="escalated">Escalated ⚠</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dates + assignment */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <SectionHeader icon={Clock} label="Timeline" bg="bg-gray-200" color="text-gray-600" />
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Reported</span>
                    <span className="font-bold text-gray-800">{fmt(issue.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Updated</span>
                    <span className="font-bold text-gray-800">{fmt(issue.updatedAt)}</span>
                  </div>
                  {issue.resolvedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Resolved</span>
                      <span className="font-bold text-emerald-600">{fmt(issue.resolvedAt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-gray-200 mt-2">
                    <span className="text-gray-500 font-medium">Department</span>
                    <span className="font-bold text-gray-800 capitalize">{issue.department?.replace('-', ' ')}</span>
                  </div>
                  {issue.assignedTo && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Assigned to</span>
                      <span className="font-bold text-gray-800">{issue.assignedTo}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Community */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                <ThumbsUp className="h-3.5 w-3.5 text-blue-500" /> {issue.votes} votes
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-500" /> {comments.length} comments
              </div>
            </div>

            {/* Comments */}
            {comments.length > 0 && (
              <div>
                <SectionHeader icon={MessageCircle} label="Comments & Updates" bg="bg-emerald-50" color="text-emerald-600" />
                <div className="space-y-2.5">
                  {comments.map((comment) => {
                    const isAdmin = comment.authorId?.role === 'admin';
                    return (
                      <div
                        key={comment._id || comment.id}
                        className={`p-3.5 rounded-xl border text-sm ${isAdmin ? 'bg-blue-50 border-blue-200 ml-4' : 'bg-white border-gray-200 mr-4'}`}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${isAdmin ? 'bg-blue-600' : 'bg-gray-400'}`}>
                              {(comment.authorId?.name || 'U')[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-xs text-gray-900">{comment.authorId?.name || 'Anonymous'}</span>
                            {isAdmin && (
                              <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Official</span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">{fmt(comment.createdAt)}</span>
                        </div>
                        <p className="text-xs text-gray-700 font-medium leading-relaxed pl-8">{comment.body}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Button
                variant="destructive"
                className="flex-1 h-9 text-xs font-bold rounded-xl shadow-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {deleting ? 'Deleting…' : 'Delete Issue'}
              </Button>
              {issue.status !== 'resolved' && (
                <Button
                  className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
                  onClick={() => handleStatusChange('resolved')}
                  disabled={updatingStatus}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Mark Solved
                </Button>
              )}
              {issue.status === 'resolved' && (
                <Button
                  variant="outline"
                  className="flex-1 h-9 text-xs font-bold rounded-xl border-gray-200"
                  onClick={() => handleStatusChange('closed')}
                  disabled={updatingStatus}
                >
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  Archive / Close
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}