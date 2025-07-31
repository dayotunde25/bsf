import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { User } from "@shared/types";
import { Edit } from "lucide-react";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [location] = useLocation();
  const profileId = location.startsWith('/profile/') ? location.split('/')[2] : undefined;
  const effectiveUserId = profileId ?? authUser?.id;
  const isOwnProfile = !profileId || profileId === authUser?.id;

  useEffect(() => {
    if (!effectiveUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    
    fetch(`/api/users/${effectiveUserId}`, {
      credentials: 'include', // Important: include credentials for auth
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to fetch user data');
        }
        return res.json();
      })
      .then(setUser)
      .catch((err) => {
        console.error('Profile fetch error:', err);
        setError(err.message || "Failed to load user profile");
        // If not authenticated, redirect to login
        if (err.message?.toLowerCase().includes('unauthorized')) {
          window.location.href = '/login';
        }
      })
      .finally(() => setLoading(false));
    }, [effectiveUserId]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${effectiveUserId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditDialogOpen(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (err: any) {
      console.error('Profile update error:', err);
      toast({
        title: "Update failed",
        description: err.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleEditField = (field: keyof User, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bsf-green mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500">{error || "User not found"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profile</CardTitle>
            {isOwnProfile && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditForm(user)} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editForm.firstName || ''}
                        onChange={(e) => handleEditField('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editForm.lastName || ''}
                        onChange={(e) => handleEditField('lastName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => handleEditField('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio || ''}
                        onChange={(e) => handleEditField('bio', e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 rounded-full bg-bsf-green-light flex items-center justify-center">
                <span className="text-2xl font-bold text-bsf-green">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Bio</h3>
              <p className="text-gray-700">{user.bio || "No bio provided"}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Roles</h3>
              <div className="flex flex-wrap gap-2">
                {user.role && <Badge>{user.role}</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
// Remove extra closing brace and ensure correct scoping

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bsf-green mx-auto mb-4" />
            <p className="text-gray-500">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">👤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-500">The requested profile could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              {user!.profileImageUrl && (
                <img src={user!.profileImageUrl} alt={user!.firstName} className="w-20 h-20 rounded-full object-cover" />
              )}
              <div>
                <h2 className="text-xl font-bold">{user!.firstName} {user!.lastName}</h2>
                <p className="text-gray-600">{user!.email}</p>
                <Badge>{user!.role}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div><strong>Phone:</strong> {user!.phone || "-"}</div>
              <div><strong>Session:</strong> {user!.session || "-"}</div>
              <div><strong>Bio:</strong> {user!.bio || "-"}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
