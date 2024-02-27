import { Dispatch, SetStateAction, memo } from "react";
import styles from "./DealBoard.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { FiLayout } from "react-icons/fi";
import { MdOutlineClose } from "react-icons/md";
import { HiOutlineMenuAlt1 } from "react-icons/hi";

type CardType = { id: string; taskTitle: string; contents: string | null; columnTitle: string };

type Props = {
  setIsOpenEditModal: Dispatch<SetStateAction<boolean>>;
};

const EditModalDealCardMemo = ({ setIsOpenEditModal }: Props) => {
  const editedDealCard = useDashboardStore((state) => state.editedDealCard);
  const setEditedDealCard = useDashboardStore((state) => state.setEditedDealCard);

  if (!editedDealCard) return null;

  // 閉じる
  const handleClose = () => {
    setEditedDealCard(null);
    setIsOpenEditModal(false);
  };

  console.log("EditModalDealCardレンダリング editedDealCard", editedDealCard);
  return (
    <>
      <div className={`${styles.edit_modal_overlay} fade05`} onClick={handleClose}></div>
      <div className={`${styles.edit_modal} fade05`}>
        <div className={`${styles.container}`}>
          <div className={`${styles.title_area} h-[90px] bg-[green]/[0]`}>
            <div className={`${styles.icon_area} min-w-[39px] bg-[red]/[0]`}>
              <div className={`flex h-[36px] w-full items-center`}>
                <FiLayout className={`text-[24px]`} />
              </div>
            </div>
            <div className={`${styles.contents_area} min-w-[600px] bg-[aqua]/[0]`}>
              <h2 className={`${styles.title} text-[24px] font-bold`}>{editedDealCard.taskTitle}</h2>
              <div className="flex items-center space-x-[6px] text-[13px] text-[var(--color-text-sub)]">
                <span>リスト:</span>
                <span className="underline">{editedDealCard.columnTitle}</span>
              </div>
            </div>
          </div>

          <div className={`${styles.description_area} h-[120px] bg-[aqua]/[0]`}>
            <div className={`${styles.title_area} h-full bg-[green]/[0]`}>
              <div className={`${styles.icon_area} min-w-[39px] bg-[red]/[0]`}>
                <div className={`flex h-[36px] w-full items-center`}>
                  <HiOutlineMenuAlt1 className={`text-[24px]`} />
                </div>
              </div>
              <div className={`${styles.contents_area} min-w-[450px] bg-[aqua]/[0]`}>
                <h2 className={`${styles.section_title}`}>{editedDealCard.taskTitle}</h2>
                <div className={`${styles.edit_textarea}`}></div>
              </div>
              <div className={`${styles.action_area} min-w-[150px] bg-[red]/[0]`}>
                <h3 className={`${styles.sub_title}`}>アクション</h3>
                <div className={`${styles.edit_textarea}`}></div>
              </div>
            </div>
          </div>
          {/* バツボタン */}
          <div className={`${styles.close_btn} flex-center rounded-[6px]`}>
            <MdOutlineClose className={`text-[24px]`} />
          </div>
        </div>
      </div>
    </>
  );
};

export const EditModalDealCard = memo(EditModalDealCardMemo);
