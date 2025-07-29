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
import { isUnauthorizedError } from "@/lib/authUtils";
import { useState } from "react";
import { 
  Clock, 
  Plus, 
  Trophy, 
  Users, 
  Calendar, 
  Cross,
  Heart,
  Star,
  Award,
  BookOpen
} from "lucide-react";

const historyTypes = [
  { value: "leadership", label: "Leadership", icon: Users, color: "bg-bsf-green" },
  { value: "event", label: "Event", icon: Calendar, color: "bg-blue-500" },
  { value: "milestone", label: "Milestone", icon: Trophy, color: "bg-yellow-500" },
];

export default function Timeline() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addHistoryDialogOpen, setAddHistoryDialogOpen] = useState(false);

  const { data: history, isLoading } = useQuery({
    queryKey: ['/api/timeline'],
  });

  const addHistoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/timeline", data);
    },
    onSuccess: () => {
      toast({
        title: "History entry added",
        description: "The new timeline entry has been added successfully.",
      });
      setAddHistoryDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/timeline'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
        title: "Error adding entry",
        description: "There was an error adding the timeline entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddHistory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const historyData = {
      year: formData.get('year') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as string,
    };

    addHistoryMutation.mutate(historyData);
  };

  const getTypeConfig = (type: string) => {
    return historyTypes.find(t => t.value === type) || historyTypes[0];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "leadership":
        return "👑";
      case "event":
        return "🎉";
      case "milestone":
        return "🏆";
      default:
        return "📅";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
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
                <Clock className="text-bsf-green" size={24} />
                Fellowship History Timeline
              </CardTitle>
              
              {user?.isAdmin && (
                <Dialog open={addHistoryDialogOpen} onOpenChange={setAddHistoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-bsf-green text-white hover:bg-bsf-green-dark">
                      <Plus className="mr-2" size={16} />
                      Add Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Timeline Entry</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddHistory} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="year">Year</Label>
                          <Input
                            id="year"
                            name="year"
                            placeholder="e.g., 2024"
                            required
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Select name="type" required>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {historyTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="e.g., Annual Fellowship Camp"
                          required
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Describe this milestone or event in fellowship history..."
                          rows={4}
                          className="mt-1"
                        />
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={addHistoryMutation.isPending}
                        className="w-full bg-bsf-green text-white hover:bg-bsf-green-dark"
                      >
                        {addHistoryMutation.isPending ? 'Adding...' : 'Add Entry'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Timeline */}
        <div className="relative">
          <div className="space-y-8">
            {history?.map((entry: any, index: number) => {
              const typeConfig = getTypeConfig(entry.type);
              const isLast = index === history.length - 1;
              
              return (
                <div key={entry.id} className="relative timeline-item pl-12">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-4 top-12 w-0.5 h-full bg-bsf-green opacity-30"></div>
                  )}
                  
                  {/* Timeline marker */}
                  <div className={`absolute left-0 top-2 w-8 h-8 ${typeConfig.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-sm font-bold">{entry.year.slice(-2)}</span>
                  </div>
                  
                  {/* Content */}
                  <Card className="hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getTypeIcon(entry.type)}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-dark-gray">{entry.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`${typeConfig.color} text-white text-xs`}>
                                {typeConfig.label}
                              </Badge>
                              <span className="text-sm text-gray-500">{entry.year}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {entry.description && (
                        <p className="text-gray-700 mt-3">{entry.description}</p>
                      )}
                      
                      {entry.type === "leadership" && (
                        <div className="mt-4 p-3 bg-bsf-green-light rounded-lg">
                          <p className="text-sm text-bsf-green font-medium">
                            Fellowship leadership and governance for {entry.year}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Year Summary */}
        <Card className="mt-12 bsf-gradient text-white">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Cross className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Baptist Student Fellowship 2024</h2>
            <p className="text-bsf-green-light mb-6 max-w-2xl mx-auto">
              Continuing our legacy of faith, fellowship, and service. Join us as we write the next chapter 
              in our fellowship's history together.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl mb-2">👥</div>
                <h4 className="font-semibold">Growing Community</h4>
                <p className="text-sm text-bsf-green-light">1,200+ Alumni Strong</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-2">🙏</div>
                <h4 className="font-semibold">Faithful Service</h4>
                <p className="text-sm text-bsf-green-light">Serving God & Community</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-2">🌟</div>
                <h4 className="font-semibold">Bright Future</h4>
                <p className="text-sm text-bsf-green-light">Making Impact Together</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!history?.length && (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="mx-auto mb-4 text-gray-300" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No timeline entries yet</h3>
              <p className="text-gray-500 mb-4">
                Fellowship history and milestones will be displayed here
              </p>
              {user?.isAdmin && (
                <Button 
                  onClick={() => setAddHistoryDialogOpen(true)}
                  className="bg-bsf-green text-white hover:bg-bsf-green-dark"
                >
                  <Plus className="mr-2" size={16} />
                  Add First Entry
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
