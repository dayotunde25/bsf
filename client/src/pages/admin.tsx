import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Shield, 
  Users, 
  Images, 
  BookOpen, 
  HandHelping, 
  Briefcase,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  TrendingUp,
  Activity,
  FileText,
  Download
} from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  }, [user, toast]);

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: pendingMedia } = useQuery({
    queryKey: ['/api/admin/pending-media'],
  });

  const { data: pendingResources } = useQuery({
    queryKey: ['/api/admin/pending-resources'],
  });

  const { data: pendingPrayers } = useQuery({
    queryKey: ['/api/admin/pending-prayers'],
  });

  const { data: pendingJobs } = useQuery({
    queryKey: ['/api/admin/pending-jobs'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/directory'],
  });

  const approveMediaMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      return await apiRequest("POST", `/api/admin/approve-media/${mediaId}`);
    },
    onSuccess: () => {
      toast({ title: "Media approved", description: "The media has been approved and published." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
    },
    onError: handleMutationError,
  });

  const approveResourceMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      return await apiRequest("POST", `/api/admin/approve-resource/${resourceId}`);
    },
    onSuccess: () => {
      toast({ title: "Resource approved", description: "The resource has been approved and published." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-resources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
    },
    onError: handleMutationError,
  });

  const approvePrayerMutation = useMutation({
    mutationFn: async (prayerId: string) => {
      return await apiRequest("POST", `/api/admin/approve-prayer/${prayerId}`);
    },
    onSuccess: () => {
      toast({ title: "Prayer approved", description: "The prayer request/testimony has been approved." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-prayers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/prayer-wall'] });
    },
    onError: handleMutationError,
  });

  const approveJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return await apiRequest("POST", `/api/admin/approve-job/${jobId}`);
    },
    onSuccess: () => {
      toast({ title: "Job approved", description: "The job posting has been approved and published." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    },
    onError: handleMutationError,
  });

  function handleMutationError(error: any) {
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
      title: "Error",
      description: "There was an error processing your request.",
      variant: "destructive",
    });
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You don't have admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="text-bsf-green" size={24} />
              Admin Dashboard
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-dark-gray">{users?.length || 0}</p>
                </div>
                <div className="bg-bsf-green-light p-2 rounded-lg">
                  <Users className="text-bsf-green" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-dark-gray">
                    {(pendingMedia?.length || 0) + (pendingResources?.length || 0) + (pendingPrayers?.length || 0) + (pendingJobs?.length || 0)}
                  </p>
                </div>
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Activity className="text-yellow-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-dark-gray">{stats?.totalJobs || 0}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Briefcase className="text-accent-blue" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-dark-gray">{stats?.totalEvents || 0}</p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <Calendar className="text-green-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="media" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="media" className="relative">
              Media
              {pendingMedia?.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 min-w-5">
                  {pendingMedia.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="resources" className="relative">
              Resources
              {pendingResources?.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 min-w-5">
                  {pendingResources.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="prayers" className="relative">
              Prayers
              {pendingPrayers?.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 min-w-5">
                  {pendingPrayers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="jobs" className="relative">
              Jobs
              {pendingJobs?.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 min-w-5">
                  {pendingJobs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Pending Media */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Images className="text-bsf-green" size={20} />
                  Pending Media Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {pendingMedia?.map((media: any) => (
                    <div key={media.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Images className="text-gray-500" size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium">{media.originalName}</h4>
                          <p className="text-sm text-gray-600">{media.eventType} • {media.session}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded on {new Date(media.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye size={14} className="mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => approveMediaMutation.mutate(media.id)}
                          disabled={approveMediaMutation.isPending}
                          className="bg-bsf-green text-white hover:bg-bsf-green-dark"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {!pendingMedia?.length && (
                    <div className="text-center py-8 text-gray-500">
                      <Images className="mx-auto mb-4 text-gray-300" size={48} />
                      <p>No pending media approvals</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Resources */}
          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="text-bsf-green" size={20} />
                  Pending Resource Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {pendingResources?.map((resource: any) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FileText className="text-gray-500" size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium">{resource.title}</h4>
                          <p className="text-sm text-gray-600">{resource.category} • {resource.originalName}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded on {new Date(resource.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Download size={14} className="mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => approveResourceMutation.mutate(resource.id)}
                          disabled={approveResourceMutation.isPending}
                          className="bg-bsf-green text-white hover:bg-bsf-green-dark"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {!pendingResources?.length && (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="mx-auto mb-4 text-gray-300" size={48} />
                      <p>No pending resource approvals</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Prayers */}
          <TabsContent value="prayers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HandHelping className="text-purple-600" size={20} />
                  Pending Prayer Wall Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {pendingPrayers?.map((prayer: any) => (
                    <div key={prayer.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={prayer.type === 'prayer' ? 'bg-purple-100 text-purple-800' : 'bg-bsf-green-light text-bsf-green'}>
                            {prayer.type === 'prayer' ? '🙏 Prayer' : '👑 Testimony'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {prayer.isAnonymous ? 'Anonymous' : 'Public'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2 line-clamp-3">"{prayer.content}"</p>
                        <p className="text-xs text-gray-500">
                          Posted on {new Date(prayer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => approvePrayerMutation.mutate(prayer.id)}
                          disabled={approvePrayerMutation.isPending}
                          className="bg-purple-600 text-white hover:bg-purple-700"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {!pendingPrayers?.length && (
                    <div className="text-center py-8 text-gray-500">
                      <HandHelping className="mx-auto mb-4 text-gray-300" size={48} />
                      <p>No pending prayer wall approvals</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Jobs */}
          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="text-bsf-green" size={20} />
                  Pending Job Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {pendingJobs?.map((job: any) => (
                    <div key={job.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{job.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{job.company} • {job.location}</p>
                        <p className="text-gray-700 mb-2 line-clamp-2">{job.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                          {job.salary && <span>{job.salary}</span>}
                          <Badge>{job.jobType}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => approveJobMutation.mutate(job.id)}
                          disabled={approveJobMutation.isPending}
                          className="bg-bsf-green text-white hover:bg-bsf-green-dark"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {!pendingJobs?.length && (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="mx-auto mb-4 text-gray-300" size={48} />
                      <p>No pending job approvals</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="text-bsf-green" size={20} />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {users?.slice(0, 10).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-bsf-green rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.isAdmin && (
                          <Badge className="bg-bsf-green text-white">Admin</Badge>
                        )}
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {users?.length > 10 && (
                    <div className="text-center py-4">
                      <Button variant="outline">Load More Users</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
