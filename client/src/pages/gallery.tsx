import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Images, Upload, Filter, Calendar, Church } from "lucide-react";
import type { Media } from "@shared/types";

const eventTypes = [
  "Bible Study",
  "Worship Service", 
  "Community Service",
  "Fellowship Dinner",
  "Conference",
  "Other"
];

export default function Gallery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEventType, setSelectedEventType] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data: media = [], isLoading: isLoadingMedia } = useQuery<Media[]>({
    queryKey: ['/api/gallery', selectedEventType, selectedSession],
    initialData: [],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Your media has been uploaded and is pending approval.",
      });
      setUploadDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your media.",
        variant: "destructive",
      });
    },
  });

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    uploadMutation.mutate(formData);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "Bible Study":
        return "📖";
      case "Worship Service":
        return "🙏";
      case "Community Service":
        return "❤️";
      case "Fellowship Dinner":
        return "🍽️";
      case "Conference":
        return "🎯";
      default:
        return "📸";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <img src="/assets/BSF_1753800735615.png" alt="BSF Logo" className="h-8 w-8" />
                <CardTitle className="flex items-center gap-2">
                  <Images className="text-bsf-green" size={24} />
                  Media Gallery
                </CardTitle>
              </div>
              
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-bsf-green text-white hover:bg-bsf-green-dark">
                    <Upload className="mr-2" size={16} />
                    Upload Media
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Media</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                      <Label htmlFor="file">Select File</Label>
                      <Input
                        id="file"
                        name="file"
                        type="file"
                        accept="image/*,video/*"
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="eventType">Event Type</Label>
                      <Select name="eventType" required>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="session">Session</Label>
                      <Input
                        id="session"
                        name="session"
                        placeholder="e.g., 2023/2024"
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe the event or moment captured..."
                        className="mt-1"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={uploadMutation.isPending}
                      className="w-full bg-bsf-green text-white hover:bg-bsf-green-dark"
                    >
                      {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Events</SelectItem>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Input
                  placeholder="Filter by session (e.g., 2023/2024)"
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                />
              </div>
              
              {(selectedEventType || selectedSession) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEventType("");
                    setSelectedSession("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Loading State */}
        {isLoadingMedia && (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <div className="animate-spin">
              <Images className="text-bsf-green h-8 w-8" />
            </div>
            <p className="mt-4 text-gray-600">Loading media...</p>
          </div>
        )}

        {/* Media Grid */}
        {!isLoadingMedia && media.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {media.map((item) => (
            <Card key={item.id} className="hover-lift overflow-hidden">
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                {item.mimeType.startsWith('image/') ? (
                  <div className="w-full h-full bg-gradient-to-br from-bsf-green-light to-bsf-green flex items-center justify-center">
                    <Images className="text-bsf-green" size={32} />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-2xl">🎥</span>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {getEventIcon(item.eventType)} {item.eventType}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.session}
                  </Badge>
                </div>
                
                <h3 className="font-medium text-sm text-dark-gray mb-1">
                  {item.originalName}
                </h3>
                
                {item.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  <span>{(item.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {!isLoadingMedia && media.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] w-full relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
              <img src="/assets/BSF_1753800735615.png" alt="BSF Logo" className="w-64 h-64 object-contain" />
            </div>
            <div className="relative z-10 text-center">
              <Images className="mx-auto mb-4 text-gray-300" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedEventType || selectedSession ? 'No media found' : 'No media uploaded yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {selectedEventType || selectedSession 
                  ? 'Try adjusting your filters'
                  : 'Be the first to share memories from fellowship events'
                }
              </p>
              {!selectedEventType && !selectedSession && (
                <Button 
                  onClick={() => setUploadDialogOpen(true)}
                  className="bg-bsf-green text-white hover:bg-bsf-green-dark"
                >
                  <Upload className="mr-2" size={16} />
                  Upload First Media
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
