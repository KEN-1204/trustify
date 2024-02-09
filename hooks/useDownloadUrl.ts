import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";

// type UseDownloadUrlReturn = {
//   isLoading: boolean;
// };
type UseDownloadUrlReturn = {
  isLoading: boolean;
  fullUrl: string | null;
  setFullUrl: React.Dispatch<React.SetStateAction<string | null>>;
};

export const useDownloadUrl = (
  filePath: string | undefined | null,
  // key: "avatars" | "documents"
  key: "avatars" | "documents" | "customer_company_logos" | "signature_stamps" | "company_seals",
  isLocal: boolean | undefined = false
): UseDownloadUrlReturn => {
  const supabase = useSupabaseClient();
  // const [isLoading, setIsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fullUrl, setFullUrl] = useState<string | null>("");
  const setAvatarImgURL = useDashboardStore((state) => state.setAvatarImgURL);
  const setCompanyLogoImgURL = useDashboardStore((state) => state.setCompanyLogoImgURL);
  const setMyStampImgURL = useDashboardStore((state) => state.setMyStampImgURL);
  const setCompanySealImgURL = useDashboardStore((state) => state.setCompanySealImgURL);

  const [prevURL, setPrevURL] = useState<string | null>(null);

  // const bucketName = key === "avatars" ? "avatars" : "documents";
  const bucketName = key;

  console.log("🌠🌠🌠🌠🌠🌠🌠 useDownloadUrl", "key", key, "filePath", filePath);

  const mappingDispatch = {
    avatars: setAvatarImgURL,
    customer_company_logos: setCompanyLogoImgURL,
    signature_stamps: setMyStampImgURL,
    company_seals: setCompanySealImgURL,
  } as { [key: string]: Dispatch<SetStateAction<string | null>> };

  useEffect(() => {
    // if (!isEnabled) {
    //   setIsLoading(false);
    //   return;
    // }
    if (prevURL === filePath) {
      setIsLoading(false);
      return;
    }

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
          if (isLocal) {
            setFullUrl(URL.createObjectURL(data));
          } else {
            mappingDispatch[key](URL.createObjectURL(data));
          }
          // 元々のurlを保存
          setPrevURL(filePath);
          setIsLoading(false);
        } catch (e: any) {
          console.error("画像ダウンロード失敗", e);
          // 元々のurlをnullにリセット
          setPrevURL(null);
          setIsLoading(false);
        }
      };
      download();
    }
    // filePathがnullの場合
    else {
      if (isLocal) {
        setFullUrl(null);
      } else {
        mappingDispatch[key](null);
      }
      setIsLoading(false);
    }
  }, [filePath, bucketName]);
  // return {
  //   isLoading,
  // };
  return {
    isLoading,
    fullUrl,
    setFullUrl,
  };
};
