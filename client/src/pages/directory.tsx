import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Search, MessageCircle, UserPlus, Filter } from "lucide-react";

export default function Directory() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users } = useQuery({
    queryKey: ['/api/directory', searchQuery],
  });

  const handleStartChat = (userId: string) => {
    // Navigate to chat with specific user
    window.location.href = `/chat?user=${userId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="text-bsf-green" size={24} />
              Alumni Directory
            </CardTitle>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <Input
                  placeholder="Search alumni by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                Filters
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users?.map((user: any) => (
            <Card key={user.id} className="hover-lift">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-bsf-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-lg font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                
                <h3 className="font-semibold text-dark-gray mb-1">
                  {user.firstName} {user.lastName}
                </h3>
                
                <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                
                {user.attendanceYears && (
                  <Badge variant="secondary" className="mb-3">
                    Class of {user.attendanceYears.split('-')[1]}
                  </Badge>
                )}
                
                {user.phone && (
                  <p className="text-xs text-gray-500 mb-3">{user.phone}</p>
                )}
                
                <div className="flex justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartChat(user.id)}
                    className="text-bsf-green border-bsf-green hover:bg-bsf-green-light"
                  >
                    <MessageCircle size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-bsf-green border-bsf-green hover:bg-bsf-green-light"
                  >
                    <UserPlus size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!users?.length && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto mb-4 text-gray-300" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No alumni found' : 'No alumni yet'}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Alumni will appear here once they join the platform'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
