import { useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

type UseDownloadUrlReturn = {
  isLoading: boolean;
  fullUrl: string | null;
  setFullUrl: React.Dispatch<React.SetStateAction<string | null>>;
};

export const useDownloadUrl = (
  filePath: string | undefined | null,
  // key: "avatars" | "documents"
  key: "avatars" | "documents" | "customer_company_logos" | "signature_stamps"
): UseDownloadUrlReturn => {
  const supabase = useSupabaseClient();
  // const [isLoading, setIsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fullUrl, setFullUrl] = useState<string | null>("");
  // const bucketName = key === "avatars" ? "avatars" : "documents";
  const bucketName = key;

  useEffect(() => {
    if (filePath) {
      const download = async () => {
        try {
          setIsLoading(true);

          const { data, error } = await supabase.storage.from(bucketName).download(filePath);

          if (error) {
            setIsLoading(false);
            toast.error("画像のダウンロードに失敗しました");
            throw error;
          }
          // ストレージからダウンロードした画像URLをURLstringの形に変換してから更新関数に渡す
          setFullUrl(URL.createObjectURL(data));
          setIsLoading(false);
        } catch (e: any) {
          console.error("画像ダウンロード失敗", e);
          setIsLoading(false);
        }
      };
      download();
    }
    // filePathがnullの場合
    else {
      setFullUrl(null);
      setIsLoading(false);
    }
  }, [filePath, bucketName]);
  return {
    isLoading,
    fullUrl,
    setFullUrl,
  };
};
