import { useState, useRef, useEffect } from "react";
import { Camera, Video, MapPin, ArrowLeft, RotateCcw, X, Check, Eye, Share2, Loader2, PlayCircle, StopCircle, CircleDot } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

import { API_BASE, getToken } from '../utils/api';

interface ReportIssueProps {
  onBack: () => void;
  onSubmit: (title: string, description: string, category: string, file: File, coordinates: { lat: number; lng: number } | null, labels?: string[]) => Promise<string | null>;
}

export function ReportIssue({ onBack, onSubmit }: ReportIssueProps) {

  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priority, setPriority] = useState("Low");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedTokenId, setSubmittedTokenId] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);



  const categories = [
    { id: "roads", name: "Roads" },
    { id: "lighting", name: "Lighting" },
    { id: "sanitation", name: "Sanitation" },
    { id: "water", name: "Water" },
    { id: "vandalism", name: "Vandalism" },
    { id: "traffic", name: "Traffic" },
    { id: "parks", name: "Parks" }
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);

    const priorityMap: Record<string, string> = {
      roads: "High",
      lighting: "Medium",
      sanitation: "Medium",
      water: "High",
      vandalism: "Medium",
      traffic: "Medium",
      parks: "Low"
    };
    setPriority(priorityMap[categoryId] || "Low");
  }



  const instantCapture = async () => {
    setIsCapturing(true);
    try {
      const [stream, coords] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }),
        getCoordinates(),
      ]);

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for metadata to load
      await new Promise(resolve => { video.onloadedmetadata = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Stop the camera stream immediately to free up resources
      stream.getTracks().forEach(track => track.stop());

      // Add watermark and update location
      if (coords) {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)}`, 20, canvas.height - 20);
        setCoordinates(coords);
        setLocation(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
      }

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg'));
      if (!blob) throw new Error("Could not create blob from canvas");

      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      const objectUrl = URL.createObjectURL(file);
      
      setPreviewUrl(objectUrl);
      setSelectedImage(file);

      // Now run the AI detection and wait for it to finish
      const aiResult = await runAiDetection(file);
      processAiResult(aiResult);

    } catch (err) {
      console.error("Instant capture failed:", err);
      alert("Could not access camera. Please check permissions and try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const getCoordinates = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const runAiDetection = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_BASE}/issues/detect`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body: formData
      });

      const data = await res.json();
      console.log("AI Result:", data);
      setAiAnalysis(data);

      // AUTO SELECT CATEGORY
      const prediction = data.prediction?.toLowerCase() || "";
      
      if (prediction.includes("road") || prediction.includes("pothole")) {
        setSelectedCategory("roads")
        setPriority("High")
      } else if (prediction.includes("lighting") || prediction.includes("streetlight")) {
        setSelectedCategory("lighting")
        setPriority("Medium")
      } else if (prediction.includes("sanitation") || prediction.includes("garbage") || prediction.includes("waste")) {
        setSelectedCategory("sanitation")
        setPriority("Medium")
      } else if (prediction.includes("water") || prediction.includes("leak") || prediction.includes("flood")) {
        setSelectedCategory("water")
        setPriority("High")
      } else if (prediction.includes("vandalism") || prediction.includes("graffiti")) {
        setSelectedCategory("vandalism")
        setPriority("Medium")
      } else if (prediction.includes("traffic") || prediction.includes("signal")) {
        setSelectedCategory("traffic")
        setPriority("Medium")
      } else if (prediction.includes("park") || prediction.includes("tree")) {
        setSelectedCategory("parks")
        setPriority("Low")
      }
    } catch (error) {
      console.error("AI detection failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processAiResult = (aiResult: any) => {
    if (!aiResult) return;
    setAiAnalysis(aiResult);

    const prediction = aiResult.prediction?.toLowerCase() || "";
    const categoryMap: { [key: string]: { category: string; priority: string } } = {
      pothole: { category: "roads", priority: "High" },
      road: { category: "roads", priority: "High" },
      streetlight: { category: "lighting", priority: "Medium" },
      lighting: { category: "lighting", priority: "Medium" },
      garbage: { category: "sanitation", priority: "Medium" },
      waste: { category: "sanitation", priority: "Medium" },
      sanitation: { category: "sanitation", priority: "Medium" },
      leak: { category: "water", priority: "High" },
      flood: { category: "water", priority: "High" },
      water: { category: "water", priority: "High" },
      vandalism: { category: "vandalism", priority: "Medium" },
      graffiti: { category: "vandalism", priority: "Medium" },
      traffic: { category: "traffic", priority: "Medium" },
      signal: { category: "traffic", priority: "Medium" },
      tree: { category: "parks", priority: "Low" },
      park: { category: "parks", priority: "Low" },
    };

    for (const key in categoryMap) {
      if (prediction.includes(key)) {
        setSelectedCategory(categoryMap[key].category);
        setPriority(categoryMap[key].priority);
        break;
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
      await runAiDetection(file) // Now async
    }
  }

  const capturePhoto = async () => {
    setIsCapturing(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      const video = document.createElement("video")
      video.srcObject = stream
      video.onloadedmetadata = () => {
        video.play()
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const context = canvas.getContext("2d")
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          stream.getTracks().forEach(track => track.stop())
          canvas.toBlob(async (blob) => {
            if (blob) {
              const capturedFile = new File([blob], "captured-photo.jpg", { type: "image/jpeg" })
              setSelectedImage(capturedFile)
              setPreviewUrl(URL.createObjectURL(capturedFile))
              await runAiDetection(capturedFile) // Run AI detection
            }
          }, "image/jpeg")
        }
      }
    } catch (err) {
      console.error("Error accessing camera: ", err)
      alert("Could not access camera. Please make sure you have given permission.")
    } finally {
      setIsCapturing(false)
    }
  }

  // GEO LOCATION
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCoordinates({ lat, lng })
        setLocation(`${lat}, ${lng}`)
      }
    )
  }

  // SUBMIT
  const handleSubmit = async () => {
    if (!selectedImage) {
      alert("Please upload an image")
      return
    }

    if (!selectedCategory) {
      alert("Please select a category")
      return
    }

    setIsSubmitting(true)

    try {
      // FAKE ISSUE CHECK: Block if AI finds no relevant objects
      if (!aiAnalysis || !aiAnalysis.all_detections || aiAnalysis.all_detections.length === 0) {
        alert("This does not appear to be a valid civic issue. Please submit a photo of a real issue like a pothole, garbage, or vandalism.");
        setIsSubmitting(false);
        return;
      }

      const title = categories.find(c => c.id === selectedCategory)?.name || "Civic Issue"
      const labels = aiAnalysis?.all_detections?.map((d: any) => d.label) || [];
      const tokenId = await onSubmit(title, description, selectedCategory, selectedImage, coordinates, labels)

      if (tokenId) {
        setSubmittedTokenId(tokenId)
        setShowSuccessModal(true)
      }
    } catch (err) {
      console.error(err)
      alert("Submission failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setDescription("")
    setSelectedCategory("")
    setPriority("Low")
    setLocation("")
    setSelectedImage(null)
    setPreviewUrl(null)
    setCoordinates(null)
    setAiAnalysis(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto max-w-4xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Report Civic Issue</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* DESCRIPTION */}
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e)=>setDescription(e.target.value)}
                placeholder="Describe the issue..."
              />
            </div>

            {/* IMAGE SECTION */}
            <div className="space-y-4">
              <Label>Photo of the Issue</Label>
              
              <div className="flex flex-wrap gap-3">
                {/* Media Upload Button */}
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button 
                    variant="outline" 
                    asChild
                    className="cursor-pointer"
                  >
                    <label htmlFor="image-upload">
                      <Share2 className="mr-2 h-4 w-4" />
                      Upload Media
                    </label>
                  </Button>
                </div>

                {/* Live Capture Button */}
                <Button 
                  variant="outline" 
                  onClick={instantCapture}
                  disabled={isCapturing}
                >
                  <Camera className="mr-2 h-4 w-4" /> 
                  {isCapturing ? 'Capturing...' : 'Capture Live Photo'}
                </Button>
              </div>

              {isCapturing && (
                <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                  <Loader2 className="h-16 w-16 animate-spin text-white" />
                  <p className="mt-4 text-white text-xl font-semibold">Capturing...</p>
                </div>
              )}



              {/* Image Preview */}
              {previewUrl && (
                <div className="mt-4 relative rounded-lg overflow-hidden border max-w-sm">
                  <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 rounded-full"
                    onClick={() => {
                      setSelectedImage(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {selectedImage && (
                <p className="text-sm text-green-600">
                  Image Selected: {selectedImage.name}
                </p>
              )}
            </div>

            {/* CATEGORY */}
            <div>
              <Label>Category</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {categories.map((cat)=> (
                  <Button
                    key={cat.id}
                    variant={selectedCategory===cat.id ? "default":"outline"}
                    onClick={()=>handleCategorySelect(cat.id)}
                    className="text-xs sm:text-sm"
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* PRIORITY */}
            <div className="flex items-center gap-4">
              <Label>Priority:</Label>
              <Badge variant={priority === "High" ? "destructive" : priority === "Medium" ? "default" : "secondary"}>
                {priority}
              </Badge>
            </div>

            {/* LOCATION */}
            <div className="space-y-3">
              <Label>Location</Label>
              <div className="flex gap-2">
                <Input
                  value={location}
                  onChange={(e)=>setLocation(e.target.value)}
                  placeholder="Coordinates or address..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                >
                  <MapPin className="h-4 w-4"/>
                </Button>
              </div>

              {/* MAP DISPLAY */}
              {coordinates && (
                <div className="mt-4 rounded-lg overflow-hidden border h-64 w-full">
                  <iframe
                    title="Location Preview"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=16&output=embed`}
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* SUBMIT BUTTONS */}
            <div className="flex flex-wrap gap-4 pt-4 border-t">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1 min-w-[150px]"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Check className="mr-2 h-4 w-4" /> Submit Complaint</>
                )}
              </Button>

              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4"/> Reset
              </Button>

              <Button variant="outline" onClick={onBack}>
                <X className="mr-2 h-4 w-4"/> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SUCCESS MODAL */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Complaint Submitted Successfully</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-6 py-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600"/>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-500">Your tracking ID is:</p>
              <p className="font-bold text-2xl tracking-wider text-blue-600">{submittedTokenId}</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none px-4 py-1">
              Status: Reported
            </Badge>
            <Button className="w-full" onClick={() => setShowSuccessModal(false)}>
              Great, thank you!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}