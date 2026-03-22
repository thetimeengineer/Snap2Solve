import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { Camera, MapPin, Mic, Upload, CheckCircle } from 'lucide-react';
import { IssueCategory, Priority } from '../types';
import { createIssue } from '../utils/api';

interface ReportIssueProps {
  onReportSubmitted: () => void;
}

export function ReportIssue({ onReportSubmitted }: ReportIssueProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as IssueCategory,
    priority: 'medium' as Priority,
    images: [] as File[],
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     // In a real app, this would upload to your storage service
  //     setFormData(prev => ({
  //       ...prev,
  //       images: [...prev.images, file]
  //     }));
  //     toast.success('Image uploaded successfully');
  //   }
  // };
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {

  const file = e.target.files?.[0];

  if (!file) return;

  setFormData(prev => ({
    ...prev,
    images: [...prev.images, file]
  }));

  toast.success("Image selected");

};

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
          setLocationDetected(true);
          toast.success('Location detected successfully');
        },
        () => {
          toast.error('Unable to detect location');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      
      if (formData.location) {
        const [lat, lng] = formData.location.split(',').map(n => parseFloat(n.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          formDataToSend.append('location', JSON.stringify({ coordinates: [lng, lat] }));
        }
      }

      formData.images.forEach((image) => {
        formDataToSend.append('image', image);
      });

      await createIssue(formDataToSend);
      toast.success('Issue reported successfully!');
      setFormData({
        title: '',
        description: '',
        category: '' as IssueCategory,
        priority: 'medium' as Priority,
        images: [] as File[],
        location: ''
      });
      onReportSubmitted();
    } catch (err: any) {
      toast.error(err.message || 'Failed to report issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Report a Civic Issue
          </CardTitle>
          <p className="text-muted-foreground">
            Help improve your community by reporting civic issues that need attention
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block mb-2">Issue Title *</label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief title describing the issue"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block mb-2">Category *</label>
              <Select
                value={formData.category}
                onValueChange={(value: IssueCategory) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select issue category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pothole">🕳️ Pothole</SelectItem>
                  <SelectItem value="streetlight">💡 Street Light</SelectItem>
                  <SelectItem value="garbage">🗑️ Garbage/Waste</SelectItem>
                  <SelectItem value="drainage">🌊 Drainage</SelectItem>
                  <SelectItem value="traffic">🚦 Traffic</SelectItem>
                  <SelectItem value="park">🌳 Parks & Recreation</SelectItem>
                  <SelectItem value="other">📋 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="priority" className="block mb-2">Priority Level</label>
              <Select
                value={formData.priority}
                onValueChange={(value: Priority) => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="description" className="block mb-2">Description *</label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed description of the issue"
                rows={4}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="block">Location</label>
              <div className="flex gap-2">
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter address or coordinates"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={detectLocation}
                  className="px-3"
                >
                  {locationDetected ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {locationDetected && (
                <Badge variant="secondary" className="text-green-700">
                  Location detected successfully
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <label className="block">Add Photos</label>
              <div className="flex gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </span>
                  </Button>
                </label>
                <Button type="button" variant="outline" className="px-3">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <ImageWithFallback
                        src={image}
                        alt={`Issue photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
