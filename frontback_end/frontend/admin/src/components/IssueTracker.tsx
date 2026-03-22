import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import {
  Search,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Trash2,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Send,
  AlertTriangle
} from 'lucide-react';
import { statusColors, priorityColors, categoryIcons } from '../utils/constants';
import { createComment } from '../utils/api';
import { Issue } from '../types';

interface IssueTrackerProps {
  issues: Issue[];
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteIssue: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { dot: string; bg: string; text: string; stripe: string }> = {
  resolved:    { dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700',  text: 'Resolved',   stripe: 'bg-emerald-500' },
  'in-progress':{ dot: 'bg-blue-500',   bg: 'bg-blue-50 text-blue-700',        text: 'In Progress', stripe: 'bg-blue-500'    },
  acknowledged:{ dot: 'bg-indigo-500',  bg: 'bg-indigo-50 text-indigo-700',    text: 'Acknowledged',stripe: 'bg-indigo-500'  },
  escalated:   { dot: 'bg-purple-500',  bg: 'bg-purple-50 text-purple-700',    text: 'Escalated',  stripe: 'bg-purple-500'  },
  reported:    { dot: 'bg-amber-500',   bg: 'bg-amber-50 text-amber-700',      text: 'Reported',   stripe: 'bg-amber-500'   },
  pending:     { dot: 'bg-amber-500',   bg: 'bg-amber-50 text-amber-700',      text: 'Pending',    stripe: 'bg-amber-500'   },
};

const PRIORITY_CONFIG: Record<string, { bg: string }> = {
  high:   { bg: 'bg-red-100 text-red-700 border border-red-200'     },
  medium: { bg: 'bg-amber-100 text-amber-700 border border-amber-200' },
  low:    { bg: 'bg-gray-100 text-gray-600 border border-gray-200'   },
};

export function IssueTracker({ issues, onUpdateStatus, onDeleteIssue }: IssueTrackerProps) {
  const [searchTerm,    setSearchTerm]    = useState('');
  const [activeFilter,  setActiveFilter]  = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [newComment,    setNewComment]    = useState('');
  const [localIssues,   setLocalIssues]   = useState<Issue[]>([]);
  const [exporting,     setExporting]     = useState(false);

  React.useEffect(() => { setLocalIssues(issues); }, [issues]);

  const filteredIssues = localIssues.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || issue.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleDownloadReport = async () => {
    setExporting(true);
    try {
      const csv = 'data:text/csv;charset=utf-8,ID,Title,Category,Status,Priority,CreatedAt\n'
        + filteredIssues.map(i => `${i.id},"${i.title}","${i.category}","${i.status}","${i.priority}",${i.createdAt}`).join('\n');
      const a = document.createElement('a');
      a.href = encodeURI(csv);
      a.download = `civic_reports_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast.success('CSV exported successfully.');
    } catch { toast.error('Failed to generate CSV.'); }
    finally { setExporting(false); }
  };

  const addComment = () => {
    if (!newComment.trim() || !selectedIssue) return;
    createComment(selectedIssue.id, newComment)
      .then((saved: any) => {
        const created = { _id: saved._id, body: saved.body, authorId: { name: 'Admin', role: 'admin' }, createdAt: new Date() };
        setLocalIssues(prev => prev.map(iss => String(iss.id) === String(selectedIssue.id) ? { ...iss, comments: [...(iss.comments || []), created as any] } : iss));
        setSelectedIssue(prev => prev ? { ...prev, comments: [...(prev.comments || []), created as any] } : null);
        setNewComment('');
        toast.success('Official update added');
      })
      .catch(() => {
        const created = { _id: Math.random().toString(), body: newComment, authorId: { name: 'Admin', role: 'admin' }, createdAt: new Date(), isOfficial: true };
        setLocalIssues(prev => prev.map(iss => String(iss.id) === String(selectedIssue.id) ? { ...iss, comments: [...(iss.comments || []), created as any] } : iss));
        setSelectedIssue(prev => prev ? { ...prev, comments: [...(prev.comments || []), created as any] } : null);
        setNewComment('');
        toast.success('Official update posted (offline mode)');
      });
  };

  const filterButtons = [
    { id: 'all',         label: 'All',         dot: 'bg-gray-400'    },
    { id: 'reported',    label: 'Reported',     dot: 'bg-amber-400'   },
    { id: 'in-progress', label: 'In Progress',  dot: 'bg-blue-500'    },
    { id: 'resolved',    label: 'Resolved',     dot: 'bg-emerald-500' },
    { id: 'escalated',   label: 'Escalated',    dot: 'bg-purple-500'  },
  ];

  return (
    <div className="space-y-5">
      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by title, location, or description…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 border-gray-200 rounded-xl bg-gray-50 focus-visible:ring-blue-500 text-sm font-medium"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar flex-shrink-0">
            {filterButtons.map(({ id, label, dot }) => (
              <button
                key={id}
                onClick={() => setActiveFilter(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  activeFilter === id
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
                }`}
              >
                {id !== 'all' && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
                {id === 'all' && <Filter className="h-3 w-3" />}
                {label}
              </button>
            ))}
          </div>

          {/* Export */}
          <Button
            size="sm"
            onClick={handleDownloadReport}
            disabled={exporting}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl font-bold flex-shrink-0 text-xs h-9 px-4 flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
        </div>

        {/* Result count */}
        <p className="text-xs text-gray-400 font-medium mt-2.5 pl-0.5">
          Showing <span className="font-bold text-gray-700">{filteredIssues.length}</span> of {localIssues.length} reports
        </p>
      </div>

      {/* ── Issue Cards ──────────────────────────────────── */}
      <div className="space-y-3">
        {filteredIssues.map((issue) => {
          const sc = STATUS_CONFIG[issue.status] ?? STATUS_CONFIG.pending;
          const pc = PRIORITY_CONFIG[issue.priority] ?? PRIORITY_CONFIG.low;
          const isOpen = selectedIssue?.id === issue.id;

          return (
            <div
              key={issue.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
            >
              {/* Status stripe */}
              <div className={`h-1 w-full ${sc.stripe}`} />

              <div className="p-5 md:p-6">
                {/* Header row */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  {/* Left: icon + title */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border border-gray-200">
                      {categoryIcons[issue.category] || '📋'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-gray-900 text-base leading-snug group-hover:text-blue-700 transition-colors truncate">
                        {issue.title}
                      </h3>
                      <p className="text-[11px] font-mono text-gray-400 mt-0.5">#{String(issue.id).slice(-8)}</p>
                      <p className="text-sm text-gray-500 font-medium mt-2 leading-relaxed line-clamp-2">{issue.description}</p>
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="truncate max-w-[200px]">{issue.location.address}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {issue.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: badges + actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${sc.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                      {sc.text}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${pc.bg}`}>
                      {issue.priority} priority
                    </span>
                  </div>
                </div>

                {/* Images */}
                {issue.images && issue.images.length > 0 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {issue.images.slice(0, 3).map((image, idx) => (
                      <ImageWithFallback
                        key={idx}
                        src={image}
                        alt={`Attachment ${idx + 1}`}
                        className="w-36 h-24 object-cover rounded-xl border border-gray-200 hover:opacity-90 cursor-pointer flex-shrink-0 shadow-sm"
                      />
                    ))}
                  </div>
                )}

                {/* Action bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedIssue(isOpen ? null : issue)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isOpen
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700'
                    }`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Timeline ({(issue.comments || []).length})
                    {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs font-bold border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl"
                      onClick={() => onUpdateStatus(issue.id, 'resolved')}
                      disabled={issue.status === 'resolved'}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      {issue.status === 'resolved' ? 'Resolved ✓' : 'Mark Resolved'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs font-bold border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl"
                      onClick={() => onDeleteIssue(issue.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Timeline panel */}
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/60 -mx-5 md:-mx-6 -mb-5 md:-mb-6 p-5 md:p-6 rounded-b-2xl">
                    <h4 className="text-sm font-extrabold text-gray-800 mb-3 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                      Official Timeline Updates
                    </h4>

                    <div className="space-y-2.5 mb-4 max-h-56 overflow-y-auto pr-1">
                      {(issue.comments || []).map((comment: any, idx: number) => {
                        const isAdmin = comment.isOfficial || comment.authorId?.role === 'admin';
                        return (
                          <div
                            key={comment._id || idx}
                            className={`p-3.5 rounded-xl border text-sm ${isAdmin ? 'bg-blue-50 border-blue-200 ml-4' : 'bg-white border-gray-200 mr-4'}`}
                          >
                            <div className="flex justify-between items-center mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${isAdmin ? 'bg-blue-600' : 'bg-gray-400'}`}>
                                  {(comment.authorId?.name || 'U')[0].toUpperCase()}
                                </div>
                                <span className="font-bold text-gray-900 text-xs">{comment.authorId?.name || comment.author || 'User'}</span>
                                {isAdmin && (
                                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Official</span>
                                )}
                              </div>
                              <span className="text-[10px] font-medium text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <p className="text-gray-700 font-medium leading-relaxed text-xs pl-8">{comment.text || comment.body}</p>
                          </div>
                        );
                      })}
                      {(issue.comments || []).length === 0 && (
                        <p className="text-center text-xs text-gray-400 font-medium italic py-4">No updates on this timeline yet.</p>
                      )}
                    </div>

                    <div className="flex gap-2.5 items-end">
                      <Textarea
                        placeholder="Post an official administrative update…"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                        className="flex-1 rounded-xl border-gray-200 bg-white text-sm font-medium focus-visible:ring-blue-500 resize-none"
                      />
                      <Button
                        onClick={addComment}
                        disabled={!newComment.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-auto py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1.5 flex-shrink-0 text-xs"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Post
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredIssues.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 shadow-none p-14 text-center">
          <div className="h-14 w-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-7 w-7 text-gray-300" />
          </div>
          <h3 className="font-extrabold text-gray-700 mb-1.5">No Reports Found</h3>
          <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto">
            {searchTerm || activeFilter !== 'all'
              ? 'No reports match your current search or filter.'
              : 'The system is clear — no civic issues in the selected time period.'}
          </p>
        </div>
      )}
    </div>
  );
}
