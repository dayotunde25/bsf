import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import type { User } from "@shared/types";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [location] = useLocation();
  const profileId = location.startsWith('/profile/') ? location.split('/')[2] : undefined;
  const effectiveUserId = profileId ?? authUser?.id;

  useEffect(() => {
    if (!effectiveUserId) return;
    setLoading(true);
    fetch(`/api/users/${effectiveUserId}`)
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then(setUser)
      .catch(() => setError("User not found"))
      .finally(() => setLoading(false));
  }, [effectiveUserId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!user) return null;

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
              {user.profileImageUrl && (
                <img src={user.profileImageUrl} alt={user.firstName} className="w-20 h-20 rounded-full object-cover" />
              )}
              <div>
                <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                <p className="text-gray-600">{user.email}</p>
                <Badge>{user.role}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div><strong>Phone:</strong> {user.phone || "-"}</div>
              <div><strong>Session:</strong> {user.session || "-"}</div>
              <div><strong>Bio:</strong> {user.bio || "-"}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
