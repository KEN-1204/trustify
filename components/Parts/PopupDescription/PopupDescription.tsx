import { Dispatch, SetStateAction } from "react";
import styles from "./PopupDescription.module.css";
import useStore from "@/store";

type DescriptionObj = { title: string; content: string; titleEn?: string; contentEn?: string };

type DescriptionArray = DescriptionObj[];

type Props = {
  openPopupMenu: { x: number; y: number; title: string } | null;
  setOpenPopupMenu: Dispatch<SetStateAction<{ y: number; title: string } | null>>;
  displayX: string;
  darkTheme?: boolean;
  descriptionArray?: DescriptionArray;
};

export const PopupDescription = ({
  openPopupMenu,
  setOpenPopupMenu,
  displayX,
  darkTheme = true,
  descriptionArray,
}: Props) => {
  if (!openPopupMenu) return;
  const language = useStore((state) => state.language);
  const mappingPopupTitle: { [key: string]: { [key: string]: string } } = {
    compressionRatio: { en: "Compression Ratio", ja: "解像度" },
    footnotes: { en: "footnotes", ja: "脚注" },
  };
  return (
    <>
      {/* 説明ポップアップ */}

      <div
        className={`${styles.description_menu} shadow-all-md border-real-with-shadow fixed right-[-18px] z-[3500] flex min-h-max flex-col rounded-[6px]`}
        style={{
          top: `${openPopupMenu.y}px`,
          ...(displayX === "left" && { left: `${openPopupMenu.x}px` }),
          ...(displayX === "right" && { right: `${openPopupMenu.x}px` }),
        }}
      >
        <div className={`min-h-max w-full font-bold ${styles.title}`}>
          <div className="flex max-w-max flex-col">
            <span>{mappingPopupTitle[openPopupMenu.title][language]}</span>
            <div className={`${styles.underline} w-full`} />
          </div>
        </div>

        <ul className={`flex flex-col rounded-[6px] ${styles.u_list}`}>
          {openPopupMenu.title === "compressionRatio" &&
            descriptionArray &&
            descriptionArray.length > 0 &&
            descriptionArray.map((item, index) => (
              <li
                key={item.title + index.toString()}
                className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}
              >
                <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                  {item.title}
                </span>
                <p className="select-none text-[12px]">{item.content}</p>
              </li>
            ))}
          {!["compressionRatio"].includes(openPopupMenu.title) && (
            <li className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}>
              <p className="select-none text-[12px]">
                {openPopupMenu.title === "footnotes" &&
                  "見積書末尾に記載される脚注を自由に編集が可能です。デフォルトテキストで保存したデータはブラウザを更新しても内容が保存されるため、自チームで常に使用している脚注がある場合は一度設定することでそれ以降の入力不要となります。"}
              </p>
            </li>
          )}
        </ul>
      </div>
    </>
  );
};
