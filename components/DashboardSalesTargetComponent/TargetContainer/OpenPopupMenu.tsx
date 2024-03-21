import { RxDot } from "react-icons/rx";
import styles from "../DashboardSalesTargetComponent.module.css";

type Props = {
  openPopupMenu: {
    x?: number | undefined;
    y: number;
    title: string;
    displayX?: string | undefined;
    maxWidth?: number | undefined;
    minWidth?: number | undefined;
    fadeType?: string | undefined;
    isHoverable?: boolean | undefined;
    sectionMenuWidth?: number | undefined;
  };
  openSectionMenu: {
    x?: number | undefined;
    y: number;
    title?: string | undefined;
    displayX?: string | undefined;
    maxWidth?: number | undefined;
    minWidth?: number | undefined;
    fadeType?: string | undefined;
  } | null;
  mappingPopupTitle: {
    [key: string]: {
      [key: string]: string;
    };
  };
  mappingDescriptions: {
    [key: string]: {
      [key: string]: string;
    }[];
  };
  language: string;
};

export const OpenPopupMenu = ({
  openPopupMenu,
  openSectionMenu,
  mappingPopupTitle,
  mappingDescriptions,
  language = "ja",
}: Props) => {
  return (
    <>
      <div
        className={`${styles.description_menu} shadow-all-md border-real-with-shadow pointer-events-none fixed z-[3500] flex min-h-max flex-col rounded-[6px]`}
        style={{
          top: `${openPopupMenu.y}px`,
          ...(openPopupMenu.maxWidth && { maxWidth: `${openPopupMenu.maxWidth}px` }),
          ...(openPopupMenu.minWidth && { minWidth: `${openPopupMenu.minWidth}px` }),
          ...(openPopupMenu?.displayX === "right" && {
            left: `${openPopupMenu.x}px`,
          }),
          ...(openPopupMenu?.displayX === "left" && {
            right: `${openPopupMenu.x}px`,
          }),
          ...(openPopupMenu?.displayX === "bottom_left" && {
            right: `${openPopupMenu.x}px`,
          }),
          ...(["settingSalesTarget"].includes(openSectionMenu?.title ?? "") && {
            animationDelay: `0.2s`,
            animationDuration: `0.5s`,
          }),
        }}
      >
        <div className={`min-h-max w-full font-bold ${styles.title}`}>
          <div className="flex max-w-max flex-col">
            <span>{mappingPopupTitle[openPopupMenu.title][language]}</span>
            <div className={`${styles.underline} w-full`} />
          </div>
        </div>

        <ul className={`flex flex-col rounded-[6px] ${styles.u_list}`}>
          {["guide"].includes(openPopupMenu.title) &&
            mappingDescriptions[openPopupMenu.title].map((item, index) => (
              <li
                key={item.title + index.toString()}
                className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}
                style={{ ...(openPopupMenu.title === "printTips" && { padding: "3px 14px" }) }}
              >
                <div className="flex min-w-max items-center space-x-[3px]">
                  <RxDot className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
                  <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                    {item.title}
                  </span>
                </div>
                <p className="select-none text-[12px]" style={{ whiteSpace: "pre-wrap" }}>
                  {item.content}
                </p>
              </li>
            ))}
          {!["guide"].includes(openPopupMenu.title) && (
            <li className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}>
              <p className="select-none whitespace-pre-wrap text-[12px] leading-[20px]">
                {openPopupMenu.title === "settingSalesTarget" &&
                  "下記メニューから「全社・事業部・課/セクション・係/チーム・メンバー個人・事業所」を選択して、各フェーズに応じた目標設定が可能です。\n目標設定は、各フェーズ毎に親のフェーズの目標が確定している状態で設定が可能となるため、最上位フェーズから設定してください。"}
                {openPopupMenu.title === "edit_mode" &&
                  "定休日を適用後、個別に日付を「営業日から休日へ」または「休日から営業日へ」変更が可能です。"}
                {openPopupMenu.title === "displayFiscalYear" &&
                  `選択中の会計年度の営業カレンダーを表示します。\n会計年度は2020年から当年度まで選択可能で、翌年度のカレンダーはお客様の決算日から現在の日付が3ヶ月を切ると表示、設定、編集が可能となります。`}
                {openPopupMenu.title === "working_to_closing" &&
                  `「営業日 → 休日」を選択後、カレンダーから会計期間内の営業日を選択して下の適用ボタンをクリックすることで休日へ変更できます。\n日付は複数選択して一括で更新が可能です。`}
              </p>
            </li>
          )}
          {openPopupMenu.title === "print" && <hr className="mb-[6px] min-h-[1px] w-full bg-[#666]" />}
          {/* {openPopupMenu.title === "print" &&
              descriptionPrintTips.map((obj, index) => (
                <li key={obj.title} className={`flex w-full space-x-[3px] px-[14px] py-[3px] text-[12px]`}>
                  <span className="min-w-[80px] max-w-[80px] font-bold">・{obj.title}：</span>
                  <p className="whitespace-pre-wrap">{obj.content}</p>
                </li>
              ))} */}
        </ul>
      </div>
    </>
  );
};
