//

import { SignatureStamp } from "@/types";
import { Dispatch, SetStateAction, memo, useEffect } from "react";
import styles from "../UpdateMeetingModal.module.css";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import { SkeletonLoadingLineCustom } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineCustom";
import NextImage from "next/image";

type Props = {
  stamp: SignatureStamp;
  selectedStampObj: SignatureStamp | null;
  setSelectedStampObj: Dispatch<SetStateAction<SignatureStamp | null>>;
};

const StampListitemMemo = ({ stamp, selectedStampObj, setSelectedStampObj }: Props) => {
  // const { fullUrl: stampUrl, isLoading } = useDownloadUrl(stamp.image_url, "signature_stamps");
  const { fullUrl: stampUrl, isLoading, setFullUrl } = useDownloadUrl(stamp.image_url, "signature_stamps", true);

  // ローカルstateで画像のオブジェクトURL文字列を生成しているため、行コンポーネントがアンマウントした時点でリソースを解放
  useEffect(() => {
    return () => {
      if (stampUrl) {
        URL.revokeObjectURL(stampUrl);
        setFullUrl(null);
      }
    };
  }, []);

  console.log(
    "StampListitemコンポーネント 🔥stamp",
    stamp,
    "🔥selectedStampObj",
    selectedStampObj,
    "🔥stampUrl",
    stampUrl
  );

  return (
    <li
      key={stamp.id}
      className={`${styles.attendees_list} flex min-h-[44px] w-full cursor-pointer items-center truncate ${
        selectedStampObj && selectedStampObj.id === stamp.id ? styles.active : ``
      }`}
      onClick={() => {
        // 存在の確認のみなので、findではなくsome
        if (selectedStampObj && selectedStampObj.id === stamp.id) {
          // 既に選択している場合はリセット
          setSelectedStampObj(null);
          return;
        } else {
          // 存在しない場合は新たに選択中に追加する
          setSelectedStampObj(stamp);
        }
      }}
    >
      {/* {!stampUrl && !isLoading && (
        <div
          className={`${styles.stamp_list_item_Icon} flex-center cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
        >
          <span className={`text-[27px]`}>N</span>
        </div>
      )} */}
      {/* {!stampUrl && !isLoading && (
        <div className={`mr-[15px] min-h-[60px] min-w-[60px] rounded-full`}>
          <SkeletonLoadingLineCustom rounded="50%" h="60px" w="60px" />
        </div>
      )} */}
      {stampUrl && !isLoading && (
        <div
          className={`${styles.stamp_list_item_Icon} flex-center cursor-pointer rounded-full ${styles.tooltip} mr-[15px]`}
        >
          <NextImage
            src={stampUrl}
            alt="stamp"
            className={`h-full w-full object-cover text-[#fff]`}
            width={60}
            height={60}
          />
        </div>
      )}
      {(isLoading || !stampUrl) && (
        <div className={`mr-[15px] min-h-[60px] min-w-[60px] rounded-full`}>
          <SkeletonLoadingLineCustom rounded="50%" h="60px" w="60px" />
        </div>
      )}
      <div className={`${styles.stamp_list_item_lines_group} flex h-full items-center pl-[12px] text-[18px]`}>
        {/* 漢字 */}
        <div className={`${styles.stamp_list_item_line} flex items-center space-x-[10px]`}>
          {stamp.kanji && <span className="">{stamp.kanji}</span>}
          {/* {stamp.furigana && (
            <div className="">
              <span className="mr-[10px]">/</span>
              <span className="">{stamp.furigana}</span>
            </div>
          )}
          {stamp.romaji && (
            <div className="">
              <span className="mr-[10px]">/</span>
              <span className="">{stamp.romaji}</span>
            </div>
          )} */}
        </div>
      </div>
    </li>
  );
};

export const StampListitem = memo(StampListitemMemo);
