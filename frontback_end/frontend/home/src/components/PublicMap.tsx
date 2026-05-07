import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { API_BASE } from "../utils/api";
import { MapPin, Info, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

// Fix for default marker icons in Leaflet + React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface PublicMapProps {
  onBack: () => void;
}

export function PublicMap({ onBack }: PublicMapProps) {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch(`${API_BASE}/issues/all-for-map`);
        if (res.ok) {
          const data = await res.json();
          setIssues(data);
        }
      } catch (err) {
        console.error("Failed to fetch issues for map", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "#22c55e"; // green
      case "in-progress": return "#3b82f6"; // blue
      case "reported": return "#f59e0b"; // amber
      default: return "#94a3b8"; // slate
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "roads": return "🛣️";
      case "lighting": return "💡";
      case "sanitation": return "🧹";
      case "water": return "💧";
      case "vandalism": return "🎨";
      case "traffic": return "🚥";
      case "parks": return "🌳";
      default: return "📍";
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="p-4 bg-white border-b flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="text-red-500" />
          City Issue Heatmap
        </h1>
      </div>

      <div className="flex-1 relative">
        <MapContainer
          center={[19.076, 72.877]} // Mumbai coordinates as default
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {issues.map((issue) => (
            <div key={issue._id}>
              {/* Heatmap effect using circles */}
              <Circle
                center={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                radius={200}
                pathOptions={{ 
                  fillColor: getStatusColor(issue.status),
                  color: getStatusColor(issue.status),
                  fillOpacity: 0.2,
                  weight: 1
                }}
              />
              
              {/* Actual issue marker */}
              <Marker position={[issue.location.coordinates[1], issue.location.coordinates[0]]}>
                <Popup>
                  <Card className="border-none shadow-none w-48">
                    <CardHeader className="p-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-1">
                        {getCategoryEmoji(issue.category)} {issue.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 space-y-2">
                      <Badge variant={issue.status === "resolved" ? "secondary" : "default"} className="text-[10px]">
                        {issue.status}
                      </Badge>
                      <p className="text-[10px] text-slate-500">
                        Reported: {new Date(issue.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] font-semibold">
                        Priority: <span className={issue.priority === "High" ? "text-red-500" : ""}>{issue.priority}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Popup>
              </Marker>
            </div>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur p-4 rounded-lg border shadow-lg max-w-xs">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Legend
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>New / Reported</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Resolved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
