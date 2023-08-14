import { Profile, UserProfile } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

export const useQueryAvatar = (userId: string | undefined) => {
  const supabase = useSupabaseClient();
  const getAvatarUrl = async () => {
    const { data, error } = await supabase.from("profiles").select("avatar_url").eq("id", userId).single();

    if (error) throw new Error(error.message);

    return data;
  };
  return useQuery({
    queryKey: ["avatar-url", userId],
    queryFn: getAvatarUrl,
    refetchOnWindowFocus: true,
  });
};
