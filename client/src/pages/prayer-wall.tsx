import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  HandHelping, 
  Plus, 
  Heart, 
  HandHeart,
  MessageCircle,
  Crown,
  Calendar,
  Eye,
  EyeOff
} from "lucide-react";

export default function PrayerWall() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [postType, setPostType] = useState<"prayer" | "testimony">("prayer");

  const { data: prayerWall, isLoading } = useQuery({
    queryKey: ['/api/prayer-wall'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const postMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/prayer-wall", data);
    },
    onSuccess: () => {
      toast({
        title: `${postType === 'prayer' ? 'Prayer request' : 'Testimony'} posted`,
        description: "Your post is pending approval and will appear soon.",
      });
      setPostDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/prayer-wall'] });
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
        title: "Error posting",
        description: "There was an error posting your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const supportMutation = useMutation({
    mutationFn: async (prayerId: string) => {
      return await apiRequest("POST", `/api/prayer-wall/${prayerId}/support`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prayer-wall'] });
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
    },
  });

  const handlePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const postData = {
      content: formData.get('content') as string,
      type: postType,
      isAnonymous: formData.get('anonymous') === 'on',
    };

    postMutation.mutate(postData);
  };

  const handleSupport = (prayerId: string) => {
    supportMutation.mutate(prayerId);
  };

  const prayerRequests = prayerWall?.filter((item: any) => item.type === 'prayer') || [];
  const testimonies = prayerWall?.filter((item: any) => item.type === 'testimony') || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="grid gap-6">
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
                <HandHelping className="text-purple-600" size={24} />
                Prayer Wall & Testimonies
              </CardTitle>
              
              <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 text-white hover:bg-purple-700">
                    <Plus className="mr-2" size={16} />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share with the Fellowship</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={postType === 'prayer' ? "default" : "outline"}
                        onClick={() => setPostType('prayer')}
                        className={postType === 'prayer' ? "bg-purple-600 text-white" : ""}
                      >
                        <HandHelping className="mr-2" size={16} />
                        Prayer Request
                      </Button>
                      <Button
                        type="button"
                        variant={postType === 'testimony' ? "default" : "outline"}
                        onClick={() => setPostType('testimony')}
                        className={postType === 'testimony' ? "bg-bsf-green text-white" : ""}
                      >
                        <Crown className="mr-2" size={16} />
                        Testimony
                      </Button>
                    </div>
                    
                    <form onSubmit={handlePost} className="space-y-4">
                      <div>
                        <Label htmlFor="content">
                          {postType === 'prayer' ? 'Prayer Request' : 'Testimony'}
                        </Label>
                        <Textarea
                          id="content"
                          name="content"
                          placeholder={
                            postType === 'prayer' 
                              ? "Share your prayer request with the fellowship..."
                              : "Share how God has blessed you..."
                          }
                          rows={5}
                          required
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="anonymous" name="anonymous" />
                        <Label htmlFor="anonymous" className="text-sm cursor-pointer">
                          Post anonymously
                        </Label>
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={postMutation.isPending}
                        className={`w-full ${
                          postType === 'prayer' 
                            ? 'bg-purple-600 hover:bg-purple-700' 
                            : 'bg-bsf-green hover:bg-bsf-green-dark'
                        } text-white`}
                      >
                        {postMutation.isPending ? 'Posting...' : `Share ${postType === 'prayer' ? 'Prayer Request' : 'Testimony'}`}
                      </Button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="prayers">Prayer Requests</TabsTrigger>
            <TabsTrigger value="testimonies">Testimonies</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <PostGrid posts={prayerWall} onSupport={handleSupport} />
          </TabsContent>
          
          <TabsContent value="prayers" className="space-y-6">
            <PostGrid posts={prayerRequests} onSupport={handleSupport} />
          </TabsContent>
          
          <TabsContent value="testimonies" className="space-y-6">
            <PostGrid posts={testimonies} onSupport={handleSupport} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PostGrid({ posts, onSupport }: { posts: any[], onSupport: (id: string) => void }) {
  return (
    <div className="grid gap-6">
      {posts?.map((post: any) => (
        <Card key={post.id} className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  post.type === 'prayer' ? 'bg-purple-100' : 'bg-bsf-green-light'
                }`}>
                  {post.type === 'prayer' ? (
                    <HandHelping className={post.type === 'prayer' ? 'text-purple-600' : 'text-bsf-green'} size={20} />
                  ) : (
                    <Crown className="text-bsf-green" size={20} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-dark-gray">
                    {post.isAnonymous ? 'Anonymous' : 'Fellowship Member'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()} • {post.type === 'prayer' ? 'Prayer Request' : 'Testimony'}
                  </p>
                </div>
              </div>
              
              <Badge className={
                post.type === 'prayer' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-bsf-green-light text-bsf-green'
              }>
                {post.type === 'prayer' ? '🙏 Prayer' : '👑 Testimony'}
              </Badge>
            </div>
            
            <div className={`border-l-4 pl-4 mb-4 ${
              post.type === 'prayer' ? 'border-purple-300' : 'border-bsf-green'
            }`}>
              <p className="text-gray-700 leading-relaxed">"{post.content}"</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                
                {post.isAnonymous ? (
                  <div className="flex items-center space-x-1">
                    <EyeOff size={14} />
                    <span>Anonymous</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Eye size={14} />
                    <span>Public</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-gray-600">
                  <Heart size={14} className={post.type === 'prayer' ? 'text-purple-600' : 'text-bsf-green'} />
                  <span className="text-sm">{post.prayingCount}</span>
                  <span className="text-sm">{post.type === 'prayer' ? 'praying' : 'hearts'}</span>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSupport(post.id)}
                  className={`${
                    post.type === 'prayer' 
                      ? 'text-purple-600 border-purple-200 hover:bg-purple-50' 
                      : 'text-bsf-green border-bsf-green hover:bg-bsf-green-light'
                  }`}
                >
                  <HandHeart size={14} className="mr-1" />
                  {post.type === 'prayer' ? "I'm Praying" : 'Amen'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {!posts?.length && (
        <Card>
          <CardContent className="py-12 text-center">
            <HandHelping className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to share a prayer request or testimony</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
