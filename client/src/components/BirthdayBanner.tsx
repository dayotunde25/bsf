import { useQuery } from "@tanstack/react-query";
import { Gift, PartyPopper, Cake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  profileImageUrl?: string;
}

function BirthdayBanner() {
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Get today's date
  const today = new Date();
  const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Filter users with birthdays today
  const birthdayUsers = Array.isArray(users) ? users.filter(user => {
    if (!user.birthDate) return false;
    const birthDate = new Date(user.birthDate);
    const birthStr = `${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
    return birthStr === todayStr;
  }) : [];

  // Get upcoming birthdays (next 7 days)
  const upcomingBirthdays = Array.isArray(users) ? users.filter(user => {
    if (!user.birthDate) return false;
    const birthDate = new Date(user.birthDate);
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    // Create this year's birthday
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    return thisYearBirthday > today && thisYearBirthday <= nextWeek;
  }).slice(0, 3) : []; // Show max 3 upcoming

  if (birthdayUsers.length === 0 && upcomingBirthdays.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Today's Birthdays */}
      {birthdayUsers.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-pink-50 dark:from-yellow-900/20 dark:to-pink-900/20 border-yellow-200 dark:border-yellow-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <PartyPopper className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                🎉 Birthday Celebration! 🎉
              </h3>
              <Cake className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            
            <div className="text-center">
              <p className="text-yellow-700 dark:text-yellow-300 mb-2">
                {birthdayUsers.length === 1 ? "Today is" : "Today are"} {birthdayUsers[0]?.firstName}'s 
                {birthdayUsers.length > 1 && ` and ${birthdayUsers.length - 1} other${birthdayUsers.length > 2 ? 's' : ''}`} 
                {" birthday"}{birthdayUsers.length > 1 ? "s" : ""}!
              </p>
              
              <div className="flex justify-center space-x-3">
                {birthdayUsers.map(user => (
                  <div key={user.id} className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center mb-1">
                      {user.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-yellow-700 dark:text-yellow-300 font-semibold">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                      {user.firstName}
                    </p>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                Let's celebrate our BSF family members! 🎂
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="text-md font-medium text-blue-800 dark:text-blue-200">
                Upcoming Birthdays
              </h4>
            </div>
            
            <div className="flex justify-center space-x-4">
              {upcomingBirthdays.map(user => {
                const birthDate = new Date(user.birthDate);
                const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={user.id} className="text-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-1">
                      {user.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      {user.firstName}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {daysUntil} day{daysUntil > 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BirthdayBanner;