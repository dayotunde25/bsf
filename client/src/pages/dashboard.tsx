import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import BirthdayBanner from "@/components/BirthdayBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Briefcase, 
  BellRing,
  GraduationCap,
  Images,
  MessageCircle,
  UserPlus,
  CalendarPlus,
  HandHelping,
  Heart,
  Bell
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: announcements } = useQuery({
    queryKey: ['/api/announcements'],
  });

  const { data: conversations } = useQuery({
    queryKey: ['/api/chat/conversations'],
  });

  const { data: gallery } = useQuery({
    queryKey: ['/api/gallery'],
  });

  const { data: prayerWall } = useQuery({
    queryKey: ['/api/prayer-wall'],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BirthdayBanner />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Left Column - Main Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Alumni</p>
                      <p className="text-2xl font-bold text-dark-gray">{stats?.totalAlumni || 0}</p>
                    </div>
                    <div className="bg-bsf-green-light p-2 rounded-lg">
                      <Users className="text-bsf-green" size={20} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Members</p>
                      <p className="text-2xl font-bold text-dark-gray">{stats?.activeMembers || 0}</p>
                    </div>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <UserCheck className="text-green-600" size={20} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Events</p>
                      <p className="text-2xl font-bold text-dark-gray">{stats?.totalEvents || 0}</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Calendar className="text-accent-blue" size={20} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Job Posts</p>
                      <p className="text-2xl font-bold text-dark-gray">{stats?.totalJobs || 0}</p>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Briefcase className="text-yellow-600" size={20} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Announcements */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BellRing className="text-bsf-green" size={20} />
                    Recent Announcements
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-bsf-green hover:text-bsf-green-dark">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {announcements?.slice(0, 2).map((announcement: any) => (
                  <div key={announcement.id} className="flex items-start space-x-4">
                    <div className="bg-bsf-green-light p-2 rounded-lg">
                      {announcement.isEvent ? (
                        <Calendar className="text-bsf-green" size={16} />
                      ) : (
                        <BellRing className="text-bsf-green" size={16} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-dark-gray">{announcement.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{announcement.content.substring(0, 100)}...</p>
                      <div className="flex items-center mt-3 space-x-4">
                        <span className="text-xs text-gray-500">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                        {announcement.isEvent && (
                          <Button size="sm" variant="outline" className="text-bsf-green border-bsf-green hover:bg-bsf-green-light">
                            RSVP
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {!announcements?.length && (
                  <p className="text-gray-500 text-center py-8">No announcements yet</p>
                )}
              </CardContent>
            </Card>

            {/* Gallery Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Images className="text-bsf-green" size={20} />
                    Recent Gallery
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-bsf-green hover:text-bsf-green-dark">
                    View Gallery
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {gallery?.slice(0, 4).map((media: any) => (
                    <div key={media.id} className="aspect-square rounded-lg overflow-hidden hover-lift cursor-pointer">
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Images className="text-gray-400" size={24} />
                      </div>
                    </div>
                  ))}
                  
                  {!gallery?.length && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No media uploaded yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Chat Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="text-bsf-green" size={20} />
                    Recent Messages
                  </CardTitle>
                  {conversations?.some((conv: any) => conv.unreadCount > 0) && (
                    <Badge className="bg-red-500">
                      {conversations.reduce((total: number, conv: any) => total + conv.unreadCount, 0)} new
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {conversations?.slice(0, 3).map((conversation: any) => (
                  <div key={conversation.user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-10 h-10 bg-bsf-green rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {conversation.user.firstName?.[0]}{conversation.user.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark-gray text-sm">
                        {conversation.user.firstName} {conversation.user.lastName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))}
                
                {!conversations?.length && (
                  <p className="text-gray-500 text-center py-4">No conversations yet</p>
                )}
              </CardContent>
              <div className="p-4 border-t">
                <Button className="w-full bg-bsf-green text-white hover:bg-bsf-green-dark">
                  Open Chat
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-dark-gray">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <UserPlus className="mr-3 text-bsf-green" size={16} />
                  Invite Alumni
                </Button>
                
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <CalendarPlus className="mr-3 text-accent-blue" size={16} />
                  Create Event
                </Button>
                
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Briefcase className="mr-3 text-yellow-600" size={16} />
                  Post Job
                </Button>
                
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <HandHelping className="mr-3 text-purple-600" size={16} />
                  Prayer Request
                </Button>
              </CardContent>
            </Card>

            {/* Prayer Wall Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <HandHelping className="text-purple-600" size={20} />
                    Prayer Wall
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-bsf-green hover:text-bsf-green-dark">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {prayerWall?.slice(0, 2).map((prayer: any) => (
                  <div key={prayer.id} className="border-l-4 border-bsf-green pl-4">
                    <p className="text-sm text-gray-700">"{prayer.content.substring(0, 80)}..."</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        - {prayer.isAnonymous ? 'Anonymous' : 'Fellowship Member'}
                      </p>
                      <div className="flex items-center space-x-1 text-bsf-green">
                        <Heart size={12} />
                        <span className="text-xs">{prayer.prayingCount} praying</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {!prayerWall?.length && (
                  <p className="text-gray-500 text-center py-4">No prayer requests yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
