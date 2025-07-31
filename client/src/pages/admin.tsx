import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Form, FormField, FormLabel, FormControl, FormMessage, FormItem } from "@/components/ui/form";
import type { User } from "@shared/schema";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { History, X } from "lucide-react";

// Types
interface ExtendedUser extends Omit<User, 'profileImageUrl'> {
  isAdmin: boolean;
  profileImageUrl: string | null;
  canPostAnnouncements: boolean;
}

interface UpdateUserRole {
  userId: string;
  role: string;
  canPostAnnouncements: boolean;
}

type QueryData<T> = T[] | undefined;

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
  Download,
  UserPlus,
  Crown,
  Edit
} from "lucide-react";

// Executive posts available in BSF
const EXECUTIVE_POSTS = [
  "Pastor(President)", "Bishop(Vice President)", "General Secretary", "Treasurer(CBN)", 
  "Evangelism coordinator", "Discipleship coordinator", "Sister's coordinator(Mummy)", 
  "Brother's coordinator(Daddy)", "Choir coordinator(CM)", "Drama coordinator", 
  "Chief Usher", "Library Secretary", "Bible Coordinator", "Prayer coordinator", 
  "Publicity/Editorial coordinator", "Organizing Coordinator"
];

const OTHER_POSTS = [
  "Building chairperson", "FYB chairperson", "Academic chairman", "House coordinator", "Assistant House coordinator"
];

const ACADEMIC_LEVELS = ["ND1", "ND2", "HND1", "HND2"];

export default function Admin() {
  const auth = useAuth();
  const user = auth.user ? {
    ...auth.user,
    isAdmin: auth.user.role === 'Admin',
    canPostAnnouncements: false,
    profileImageUrl: auth.user.profileImageUrl || null,
    password: '',
    birthday: '',
    attendanceYears: [],
    department: '',
    academicLevel: ''
  } as unknown as ExtendedUser : null;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState({
    role: '',
    withoutPosts: false,
    session: ''
  });

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

  function handleMutationError(error: any) {
    console.error('Mutation error:', error);
    toast({
      title: "Error",
      description: isUnauthorizedError(error) 
        ? "You are not authorized to perform this action" 
        : error?.message || "An error occurred",
      variant: "destructive",
    });
  }

  const { data: stats, error: statsError } = useQuery<{
    totalUsers: number;
    totalJobs: number;
    totalEvents: number;
  }>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: () => apiRequest("GET", '/api/dashboard/stats'),
  });

  const { data: pendingMedia, error: pendingMediaError } = useQuery<any[]>({
    queryKey: ['/api/admin/pending-media'],
    queryFn: () => apiRequest("GET", '/api/admin/pending-media'),
    initialData: [],
  });

  const { data: pendingResources, error: pendingResourcesError } = useQuery<any[]>({
    queryKey: ['/api/admin/pending-resources'],
    queryFn: () => apiRequest("GET", '/api/admin/pending-resources'),
    initialData: [],
  });

  const { data: pendingPrayers, error: pendingPrayersError } = useQuery<any[]>({
    queryKey: ['/api/admin/pending-prayers'],
    queryFn: () => apiRequest("GET", '/api/admin/pending-prayers'),
    initialData: [],
  });

  const { data: pendingJobs, error: pendingJobsError } = useQuery<any[]>({
    queryKey: ['/api/admin/pending-jobs'],
    queryFn: () => apiRequest("GET", '/api/admin/pending-jobs'),
    initialData: [],
  });

  const { data: users } = useQuery<ExtendedUser[]>({
    queryKey: ['/api/directory'],
    initialData: [],
  });

  const { data: filteredUsers } = useQuery<ExtendedUser[]>({
    queryKey: ['/api/admin/users/filter', filterOptions],
    enabled: !!(filterOptions.role || filterOptions.withoutPosts || filterOptions.session),
    initialData: [],
  });

  const { data: userHistory } = useQuery({
    queryKey: ['/api/admin/user', selectedUser?.id, 'history'],
    enabled: !!selectedUser && isHistoryDialogOpen,
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

  // Role management mutations
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role, canPostAnnouncements }: { userId: string; role: string; canPostAnnouncements: boolean }) => {
      return await apiRequest("POST", `/api/admin/update-user-role/${userId}`, { role, canPostAnnouncements });
    },
    onSuccess: () => {
      toast({ title: "User role updated", description: "The user's role and permissions have been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['/api/directory'] });
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
    },
    onError: handleMutationError,
  });

  const assignPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return await apiRequest("POST", "/api/admin/assign-post", postData);
    },
    onSuccess: () => {
      toast({ title: "Post assigned", description: "The post has been assigned successfully." });
      queryClient.invalidateQueries({ queryKey: ['/api/directory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/filter', filterOptions] });
      setIsPostDialogOpen(false);
      setSelectedUser(null);
    },
    onError: handleMutationError,
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: UpdateUserRole[]) => {
      return await apiRequest("POST", "/api/admin/bulk-update-roles", { updates });
    },
    onSuccess: () => {
      toast({ title: "Bulk update completed", description: "User roles have been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['/api/directory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/filter', filterOptions] });
      setIsBulkDialogOpen(false);
      setSelectedUsers([]);
    },
    onError: handleMutationError,
  });

  const displayUsers = filteredUsers || users || [];
  
  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const resetFilters = () => {
    setFilterOptions({ role: '', withoutPosts: false, session: '' });
  };

// handleMutationError is already defined above

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

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">
              <Crown className="mr-2" size={16} />
              User Management
            </TabsTrigger>
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
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* User Role Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="text-bsf-green" size={20} />
                  User Role Management
                </CardTitle>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex gap-2">
                    <Select value={filterOptions.role} onValueChange={(value) => setFilterOptions(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Roles</SelectItem>
                        <SelectItem value="Alumni">Alumni</SelectItem>
                        <SelectItem value="Mentor">Mentor</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterOptions.session} onValueChange={(value) => setFilterOptions(prev => ({ ...prev, session: value }))}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by session" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Sessions</SelectItem>
                        <SelectItem value="2020/2021">2020/2021</SelectItem>
                        <SelectItem value="2021/2022">2021/2022</SelectItem>
                        <SelectItem value="2022/2023">2022/2023</SelectItem>
                        <SelectItem value="2023/2024">2023/2024</SelectItem>
                        <SelectItem value="2024/2025">2024/2025</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="withoutPosts"
                        checked={filterOptions.withoutPosts}
                        onChange={(e) => setFilterOptions(prev => ({ ...prev, withoutPosts: e.target.checked }))}
                        className="rounded"
                      />
                      <label htmlFor="withoutPosts" className="text-sm">Without Posts</label>
                    </div>
                    
                    <Button onClick={resetFilters} variant="outline" size="sm">
                      <X size={14} className="mr-1" />
                      Clear Filters
                    </Button>
                  </div>
                  
                  {selectedUsers.length > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setIsBulkDialogOpen(true)}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Edit size={14} className="mr-1" />
                        Bulk Update ({selectedUsers.length})
                      </Button>
                      <Button 
                        onClick={() => setSelectedUsers([])}
                        size="sm"
                        variant="outline"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayUsers?.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelection(user.id)}
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-bsf-green-light rounded-full flex items-center justify-center">
                          {user.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt={user.firstName} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-bsf-green font-medium">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Mentor' ? 'default' : 'secondary'}>
                              {user.role || 'Alumni'}
                            </Badge>
                            {user.canPostAnnouncements && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                Can Post
                              </Badge>
                            )}
                            {user.department && (
                              <Badge variant="outline" className="text-green-600">
                                {user.department}
                              </Badge>
                            )}
                            {user.academicLevel && (
                              <Badge variant="outline" className="text-purple-600">
                                {user.academicLevel}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog open={isRoleDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsRoleDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Crown size={14} className="mr-1" />
                              Manage Role
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Manage User Role - {user.firstName} {user.lastName}</DialogTitle>
                            </DialogHeader>
                            <RoleManagementForm 
                              user={user} 
                              onSubmit={(data) => updateUserRoleMutation.mutate({ userId: user.id, ...data })}
                              isLoading={updateUserRoleMutation.isPending}
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={isPostDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsPostDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="default"
                              className="bg-bsf-green hover:bg-bsf-green-dark"
                              onClick={() => setSelectedUser(user)}
                            >
                              <UserPlus size={14} className="mr-1" />
                              Assign Post
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Post - {user.firstName} {user.lastName}</DialogTitle>
                            </DialogHeader>
                            <PostAssignmentForm 
                              user={user} 
                              onSubmit={(data) => assignPostMutation.mutate({ userId: user.id, ...data })}
                              isLoading={assignPostMutation.isPending}
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsHistoryDialogOpen(true);
                          }}
                        >
                          <History size={14} className="mr-1" />
                          History
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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

      {/* Bulk Update Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Roles ({selectedUsers.length} users)</DialogTitle>
          </DialogHeader>
          <BulkUpdateForm 
            selectedUsers={selectedUsers}
            users={displayUsers}
            onSubmit={(updates) => bulkUpdateMutation.mutate(updates)}
            isLoading={bulkUpdateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* User History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>User History - {selectedUser?.firstName} {selectedUser?.lastName}</DialogTitle>
          </DialogHeader>
          <UserHistoryView history={userHistory} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Bulk Update Form Component
interface BulkUpdateFormProps {
  selectedUsers: string[];
  users: ExtendedUser[];
  onSubmit: (updates: UpdateUserRole[]) => void;
  isLoading: boolean;
}

interface BulkUpdateFormData {
  role: string;
  canPostAnnouncements: boolean;
  changeReason: string;
}

function BulkUpdateForm({ selectedUsers, users, onSubmit, isLoading }: BulkUpdateFormProps) {
  const form = useForm<BulkUpdateFormData>({
    defaultValues: {
      role: '',
      canPostAnnouncements: false,
      changeReason: ''
    }
  });

  const handleSubmit = (data: BulkUpdateFormData) => {
    const updates: UpdateUserRole[] = selectedUsers.map((userId) => ({
      userId,
      role: data.role,
      canPostAnnouncements: data.canPostAnnouncements
    }));
    onSubmit(updates);
  };

  const selectedUserNames = users
    ?.filter((user: any) => selectedUsers.includes(user.id))
    .map((user: any) => `${user.firstName} ${user.lastName}`)
    .join(', ');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Selected Users ({selectedUsers.length}):</h4>
          <p className="text-sm text-gray-600">{selectedUserNames}</p>
        </div>

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Alumni">Alumni</SelectItem>
                  <SelectItem value="Mentor">Mentor</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="canPostAnnouncements"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="rounded"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Can Post Announcements
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="changeReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Change (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter reason for this bulk update..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Updating...' : `Update ${selectedUsers.length} Users`}
        </Button>
      </form>
    </Form>
  );
}

// User History View Component
function UserHistoryView({ history }: any) {
  if (!history) {
    return <div className="p-4 text-center text-gray-500">Loading history...</div>;
  }

  const { roleHistory = [], activityLog = [] } = history;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Role History</h3>
        {roleHistory.length === 0 ? (
          <p className="text-gray-500">No role changes recorded.</p>
        ) : (
          <div className="space-y-2">
            {roleHistory.map((entry: any) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm">
                    <span className="text-red-600">{entry.previousRole || 'None'}</span>
                    {' → '}
                    <span className="text-green-600">{entry.newRole}</span>
                  </p>
                  {entry.changeReason && (
                    <p className="text-xs text-gray-600 mt-1">{entry.changeReason}</p>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
        {activityLog.length === 0 ? (
          <p className="text-gray-500">No activities recorded.</p>
        ) : (
          <div className="space-y-2">
            {activityLog.map((entry: any) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{entry.activityType.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-xs text-gray-600">{entry.description}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Role Management Form Component
function RoleManagementForm({ user, onSubmit, isLoading }: { user: any; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [role, setRole] = useState(user.role || 'Alumni');
  const [canPostAnnouncements, setCanPostAnnouncements] = useState(user.canPostAnnouncements || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ role, canPostAnnouncements });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="role">User Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alumni">Alumni</SelectItem>
            <SelectItem value="Mentor">Mentor</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="canPostAnnouncements"
          checked={canPostAnnouncements}
          onChange={(e) => setCanPostAnnouncements(e.target.checked)}
          className="rounded border-gray-300"
        />
        <Label htmlFor="canPostAnnouncements">Can Post Announcements</Label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading} className="bg-bsf-green hover:bg-bsf-green-dark">
          {isLoading ? "Updating..." : "Update Role"}
        </Button>
      </div>
    </form>
  );
}

// Post Assignment Form Component
function PostAssignmentForm({ user, onSubmit, isLoading }: { user: any; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [postType, setPostType] = useState("executive");
  const [executivePost, setExecutivePost] = useState("");
  const [otherPost, setOtherPost] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [workerUnit, setWorkerUnit] = useState("");
  const [session, setSession] = useState("");
  const [department, setDepartment] = useState(user.department || "");
  const [academicLevel, setAcademicLevel] = useState(user.academicLevel || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const postData: any = { 
      postType, 
      session, 
      department, 
      academicLevel,
      userId: user.id 
    };

    if (postType === "executive") {
      postData.position = executivePost;
    } else if (postType === "family") {
      postData.familyName = familyName;
    } else if (postType === "worker") {
      postData.unitName = workerUnit;
    } else if (postType === "other") {
      postData.postName = otherPost;
    }

    onSubmit(postData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department/Course</Label>
          <Input
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g., Computer Science"
          />
        </div>
        
        <div>
          <Label htmlFor="academicLevel">Academic Level</Label>
          <Select value={academicLevel} onValueChange={setAcademicLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {ACADEMIC_LEVELS.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="session">Fellowship Session</Label>
        <Input
          id="session"
          value={session}
          onChange={(e) => setSession(e.target.value)}
          placeholder="e.g., 2023/2024"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="postType">Post Type</Label>
        <Select value={postType} onValueChange={setPostType}>
          <SelectTrigger>
            <SelectValue placeholder="Select post type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="executive">Executive Post</SelectItem>
            <SelectItem value="family">Family Head</SelectItem>
            <SelectItem value="worker">Worker Unit</SelectItem>
            <SelectItem value="other">Other Post</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {postType === "executive" && (
        <div>
          <Label htmlFor="executivePost">Executive Position</Label>
          <Select value={executivePost} onValueChange={setExecutivePost}>
            <SelectTrigger>
              <SelectValue placeholder="Select executive position" />
            </SelectTrigger>
            <SelectContent>
              {EXECUTIVE_POSTS.map(post => (
                <SelectItem key={post} value={post}>{post}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {postType === "family" && (
        <div>
          <Label htmlFor="familyName">Family Name</Label>
          <Input
            id="familyName"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="e.g., House of David"
            required
          />
        </div>
      )}
      
      {postType === "worker" && (
        <div>
          <Label htmlFor="workerUnit">Worker Unit</Label>
          <Input
            id="workerUnit"
            value={workerUnit}
            onChange={(e) => setWorkerUnit(e.target.value)}
            placeholder="e.g., Ushering Unit"
            required
          />
        </div>
      )}
      
      {postType === "other" && (
        <div>
          <Label htmlFor="otherPost">Other Post</Label>
          <Select value={otherPost} onValueChange={setOtherPost}>
            <SelectTrigger>
              <SelectValue placeholder="Select other post" />
            </SelectTrigger>
            <SelectContent>
              {OTHER_POSTS.map(post => (
                <SelectItem key={post} value={post}>{post}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading} className="bg-bsf-green hover:bg-bsf-green-dark">
          {isLoading ? "Assigning..." : "Assign Post"}
        </Button>
      </div>
    </form>
  );
}
