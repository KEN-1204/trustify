import { useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";

export const useDownloadUrl = (filePath: string | undefined, key: "avatars" | "documents") => {
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const [fullUrl, setFullUrl] = useState("");
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
  }, [filePath, bucketName]);
  return {
    isLoading,
    fullUrl,
    setFullUrl,
  };
};
