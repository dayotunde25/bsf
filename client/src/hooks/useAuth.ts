import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/types";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
