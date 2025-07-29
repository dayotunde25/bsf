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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  BookOpen, 
  Upload, 
  Download, 
  FileText, 
  Headphones, 
  Play,
  Filter,
  Search
} from "lucide-react";

const categories = [
  { value: "devotional", label: "Devotionals", icon: "📖", color: "bg-purple-100 text-purple-800" },
  { value: "sermon", label: "Sermons", icon: "🎤", color: "bg-green-100 text-green-800" },
  { value: "training", label: "Training", icon: "🎯", color: "bg-blue-100 text-blue-800" },
];

export default function Resources() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: resources, isLoading } = useQuery({
    queryKey: ['/api/resources', selectedCategory],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/resources', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Resource uploaded",
        description: "Your resource has been uploaded and is pending approval.",
      });
      setUploadDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
    },
    onError: (error) => {
      if (error.message.includes('401')) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resource.",
        variant: "destructive",
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      return await apiRequest("POST", `/api/resources/${resourceId}/download`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
    },
  });

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    uploadMutation.mutate(formData);
  };

  const handleDownload = (resource: any) => {
    downloadMutation.mutate(resource.id);
    // In a real app, you'd also trigger the actual file download
    const link = document.createElement('a');
    link.href = `/api/uploads/${resource.fileName}`;
    link.download = resource.originalName;
    link.click();
  };

  const getCategoryConfig = (category: string) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="text-red-500" size={20} />;
    if (mimeType.includes('audio')) return <Headphones className="text-green-500" size={20} />;
    if (mimeType.includes('video')) return <Play className="text-blue-500" size={20} />;
    return <FileText className="text-gray-500" size={20} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-bsf-green" size={24} />
                Resource Hub
              </CardTitle>
              
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-bsf-green text-white hover:bg-bsf-green-dark">
                    <Upload className="mr-2" size={16} />
                    Upload Resource
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Resource</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                      <Label htmlFor="file">Select File</Label>
                      <Input
                        id="file"
                        name="file"
                        type="file"
                        accept=".pdf,.doc,.docx,.mp3,.mp4,.wav,.m4a"
                        required
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: PDF, DOC, DOCX, MP3, MP4, WAV, M4A
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g., Daily Devotional Guide"
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" required>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.icon} {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe the resource and its purpose..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={uploadMutation.isPending}
                      className="w-full bg-bsf-green text-white hover:bg-bsf-green-dark"
                    >
                      {uploadMutation.isPending ? 'Uploading...' : 'Upload Resource'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" onClick={() => setSelectedCategory("")}>
              All Resources
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger 
                key={category.value} 
                value={category.value}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.icon} {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <ResourceGrid resources={resources} onDownload={handleDownload} />
          </TabsContent>
          
          {categories.map((category) => (
            <TabsContent key={category.value} value={category.value} className="space-y-6">
              <ResourceGrid 
                resources={resources?.filter((r: any) => r.category === category.value)} 
                onDownload={handleDownload} 
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function ResourceGrid({ resources, onDownload }: { resources: any[], onDownload: (resource: any) => void }) {
  const getCategoryConfig = (category: string) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="text-red-500" size={20} />;
    if (mimeType.includes('audio')) return <Headphones className="text-green-500" size={20} />;
    if (mimeType.includes('video')) return <Play className="text-blue-500" size={20} />;
    return <FileText className="text-gray-500" size={20} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources?.map((resource: any) => {
        const categoryConfig = getCategoryConfig(resource.category);
        
        return (
          <Card key={resource.id} className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getFileIcon(resource.mimeType)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-dark-gray text-sm">{resource.title}</h3>
                    <p className="text-xs text-gray-500">{resource.originalName}</p>
                  </div>
                </div>
                <Badge className={categoryConfig.color}>
                  {categoryConfig.icon}
                </Badge>
              </div>
              
              {resource.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {resource.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{formatFileSize(resource.fileSize)}</span>
                <span>{resource.downloadCount} downloads</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(resource.createdAt).toLocaleDateString()}
                </span>
                
                <Button
                  size="sm"
                  onClick={() => onDownload(resource)}
                  className="bg-bsf-green text-white hover:bg-bsf-green-dark"
                >
                  <Download size={14} className="mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {!resources?.length && (
        <div className="col-span-full">
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 text-gray-300" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources available</h3>
              <p className="text-gray-500">Resources will appear here once uploaded and approved</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
