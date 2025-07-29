import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  UserCheck, 
  Users, 
  HandHeart, 
  Plus, 
  MessageCircle, 
  CheckCircle,
  Clock,
  Target
} from "lucide-react";

export default function Mentorship() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [isMentorMode, setIsMentorMode] = useState(true);

  const { data: mentors } = useQuery({
    queryKey: ['/api/mentorship/mentors'],
  });

  const { data: mentees } = useQuery({
    queryKey: ['/api/mentorship/mentees'],
  });

  const { data: matches } = useQuery({
    queryKey: ['/api/mentorship/matches'],
  });

  const joinMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/mentorship", data);
    },
    onSuccess: () => {
      toast({
        title: "Successfully joined mentorship program",
        description: `You've been registered as a ${isMentorMode ? 'mentor' : 'mentee'}.`,
      });
      setJoinDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/mentors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/mentees'] });
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
        title: "Error joining program",
        description: "There was an error joining the mentorship program. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const mentorshipData = {
      isMentor: isMentorMode,
      interests: formData.get('interests') as string,
      department: formData.get('department') as string,
      status: "available",
    };

    joinMutation.mutate(mentorshipData);
  };

  const handleStartChat = (userId: string) => {
    window.location.href = `/chat?user=${userId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <HandHeart className="text-bsf-green" size={24} />
                Mentorship Program
              </CardTitle>
              
              <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-bsf-green text-white hover:bg-bsf-green-dark">
                    <Plus className="mr-2" size={16} />
                    Join Program
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Mentorship Program</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={isMentorMode ? "default" : "outline"}
                        onClick={() => setIsMentorMode(true)}
                        className={isMentorMode ? "bg-bsf-green text-white" : ""}
                      >
                        <UserCheck className="mr-2" size={16} />
                        Become a Mentor
                      </Button>
                      <Button
                        type="button"
                        variant={!isMentorMode ? "default" : "outline"}
                        onClick={() => setIsMentorMode(false)}
                        className={!isMentorMode ? "bg-bsf-green text-white" : ""}
                      >
                        <Users className="mr-2" size={16} />
                        Find a Mentor
                      </Button>
                    </div>
                    
                    <form onSubmit={handleJoin} className="space-y-4">
                      <div>
                        <Label htmlFor="interests">Interests/Skills</Label>
                        <Textarea
                          id="interests"
                          name="interests"
                          placeholder={
                            isMentorMode 
                              ? "What skills/experience can you share? (e.g., Software Development, Marketing, Leadership)"
                              : "What areas would you like guidance in? (e.g., Career transition, Technical skills, Leadership)"
                          }
                          required
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="department">Department/Industry</Label>
                        <Input
                          id="department"
                          name="department"
                          placeholder="e.g., Technology, Healthcare, Finance"
                          required
                          className="mt-1"
                        />
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={joinMutation.isPending}
                        className="w-full bg-bsf-green text-white hover:bg-bsf-green-dark"
                      >
                        {joinMutation.isPending ? 'Joining...' : `Join as ${isMentorMode ? 'Mentor' : 'Mentee'}`}
                      </Button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-bsf-green-light rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="text-bsf-green" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-dark-gray">{mentors?.length || 0}</h3>
              <p className="text-gray-600">Available Mentors</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-accent-blue" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-dark-gray">{mentees?.length || 0}</h3>
              <p className="text-gray-600">Seeking Mentors</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-dark-gray">{matches?.length || 0}</h3>
              <p className="text-gray-600">Successful Matches</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="mentors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mentors">Available Mentors</TabsTrigger>
            <TabsTrigger value="mentees">Seeking Mentors</TabsTrigger>
            <TabsTrigger value="matches">Active Matches</TabsTrigger>
          </TabsList>

          {/* Available Mentors */}
          <TabsContent value="mentors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors?.map((mentorship: any) => (
                <Card key={mentorship.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-bsf-green rounded-full flex items-center justify-center mx-auto mb-3">
                        <UserCheck className="text-white" size={24} />
                      </div>
                      <h3 className="font-semibold text-dark-gray">Mentor Available</h3>
                      <Badge className="bg-bsf-green-light text-bsf-green mt-2">
                        {mentorship.department}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700">Expertise</h4>
                        <p className="text-sm text-gray-600">{mentorship.interests}</p>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>Available since {new Date(mentorship.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <Button
                      className="w-full mt-4 bg-bsf-green text-white hover:bg-bsf-green-dark"
                      onClick={() => handleStartChat(mentorship.mentorId)}
                    >
                      <MessageCircle className="mr-2" size={16} />
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {!mentors?.length && (
              <Card>
                <CardContent className="py-12 text-center">
                  <UserCheck className="mx-auto mb-4 text-gray-300" size={64} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors available</h3>
                  <p className="text-gray-500">Be the first to offer mentorship to fellow alumni</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Seeking Mentors */}
          <TabsContent value="mentees" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentees?.map((mentorship: any) => (
                <Card key={mentorship.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Target className="text-accent-blue" size={24} />
                      </div>
                      <h3 className="font-semibold text-dark-gray">Seeking Mentor</h3>
                      <Badge className="bg-blue-100 text-accent-blue mt-2">
                        {mentorship.department}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700">Looking for guidance in</h4>
                        <p className="text-sm text-gray-600">{mentorship.interests}</p>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>Requested {new Date(mentorship.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <Button
                      className="w-full mt-4 bg-accent-blue text-white hover:bg-blue-600"
                      onClick={() => handleStartChat(mentorship.mentorId)}
                    >
                      <MessageCircle className="mr-2" size={16} />
                      Offer Help
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {!mentees?.length && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="mx-auto mb-4 text-gray-300" size={64} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No mentorship requests</h3>
                  <p className="text-gray-500">Alumni seeking mentorship will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Active Matches */}
          <TabsContent value="matches" className="space-y-6">
            <div className="grid gap-6">
              {matches?.map((match: any) => (
                <Card key={match.mentorship.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="text-green-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-dark-gray">
                            {match.mentor.firstName} {match.mentor.lastName} → {match.mentee.firstName} {match.mentee.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{match.mentorship.department}</p>
                          <Badge className="bg-green-100 text-green-800 mt-1">
                            Active Match
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Matched {new Date(match.mentorship.createdAt).toLocaleDateString()}
                        </p>
                        <Button
                          size="sm"
                          className="mt-2 bg-bsf-green text-white hover:bg-bsf-green-dark"
                          onClick={() => handleStartChat(match.mentor.id)}
                        >
                          View Chat
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Focus Area:</span> {match.mentorship.interests}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {!matches?.length && (
              <Card>
                <CardContent className="py-12 text-center">
                  <HandHeart className="mx-auto mb-4 text-gray-300" size={64} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active matches</h3>
                  <p className="text-gray-500">Successful mentorship connections will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
