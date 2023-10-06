import { useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";

type UseDownloadUrlReturn = {
  isLoading: boolean;
  fullUrl: string | null;
  setFullUrl: React.Dispatch<React.SetStateAction<string | null>>;
};

export const useDownloadUrl = (
  filePath: string | undefined | null,
  key: "avatars" | "documents"
): UseDownloadUrlReturn => {
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const [fullUrl, setFullUrl] = useState<string | null>("");
  const bucketName = key === "avatars" ? "avatars" : "documents";

  useEffect(() => {
    if (filePath) {
      const download = async () => {
        setIsLoading(true);

        const { data, error } = await supabase.storage.from(bucketName).download(filePath);

        if (error) {
          setIsLoading(false);
          alert("画像のダウンロードに失敗しました" + error.message);
          throw new Error();
        }
        // ストレージからダウンロードした画像URLをURLstringの形に変換してから更新関数に渡す
        setFullUrl(URL.createObjectURL(data));
        setIsLoading(false);
      };
      download();
    }
    // filePathがnullの場合
    else {
      setFullUrl(null);
    }
  }, [filePath, bucketName]);
  return {
    isLoading,
    fullUrl,
    setFullUrl,
  };
};
