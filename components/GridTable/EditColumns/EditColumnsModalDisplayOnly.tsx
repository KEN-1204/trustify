import React, { FC, memo, useRef, useState } from "react";
import styles from "./EditColumnsModalDisplayOnly.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { MdOutlineDragIndicator } from "react-icons/md";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { ImArrowRight2, ImArrowLeft2, ImArrowUp2, ImArrowDown2 } from "react-icons/im";
import useStore from "@/store";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { GrPowerReset } from "react-icons/gr";
import { columnNameToJapanese } from "@/utils/columnNameToJapanese";
import { columnNameToJapaneseContacts } from "@/utils/columnNameToJapaneseContacts";
import { columnNameToJapaneseActivity } from "@/utils/columnNameToJapaneseActivity";
import { columnNameToJapaneseMeeting } from "@/utils/columnNameToJapaneseMeeting";
import { BsChevronLeft } from "react-icons/bs";
import { columnNameToJapaneseProperty } from "@/utils/columnNameToJapaneseProperty";
import { columnNameToJapaneseQuotation } from "@/utils/columnNameToJapaneseQuotation";

// const data: Array<{ id: number; name: string; img: StaticImageData }> = [

type ColumnHeaderItemList = {
  columnId: number;
  columnName: string;
  columnIndex: number;
  columnWidth: string;
  isOverflow: boolean;
  isFrozen: boolean;
};

type Props = {
  columnHeaderItemList: ColumnHeaderItemList[];
};

const EditColumnsModalDisplayOnlyMemo: FC<Props> = ({ columnHeaderItemList }) => {
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const setIsOpenEditColumns = useDashboardStore((state) => state.setIsOpenEditColumns);
  const editedColumnHeaderItemList = useDashboardStore((state) => state.editedColumnHeaderItemList);
  const setEditedColumnHeaderItemList = useDashboardStore((state) => state.setEditedColumnHeaderItemList);

  // リセットできるように初期値を別のStateで保持しておく
  const [listItemsRight, setListItemsRight] = useState(columnHeaderItemList);
  const resetColumnHeaderItemList = useDashboardStore((state) => state.resetColumnHeaderItemList);
  const [dragIndexRight, setDragIndexRight] = useState<number | null>(null);
  // ○件選択中のState
  const [rightCount, setRightCount] = useState(0);
  const selectedRightItemsRef = useRef<number[]>([]);
  const removeArrowRef = useRef<HTMLDivElement | null>(null);
  const upArrowRef = useRef<HTMLDivElement | null>(null);
  const downArrowRef = useRef<HTMLDivElement | null>(null);
  const resetRightRef = useRef<HTMLDivElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollBottomRef = useRef<HTMLSpanElement | null>(null);
  console.log("🔥🔥🔥 EditColumnsModalレンダリング", resetColumnHeaderItemList);
  console.log(`listItemsRight`, listItemsRight);
  console.log(`dragIndexRight`, dragIndexRight);
  console.log(`columnHeaderItemList`, columnHeaderItemList);

  // ====================== 右側 ドラッグでカラム順番入れ替え ======================
  const handleDragStartRight = (index: number) => {
    console.log("dragStart🔥", index);
    setDragIndexRight(index);
  };

  const handleDragEnterRight = (index: number) => {
    console.log("dragEnter DroppableIndex, dragIndex", index, dragIndexRight);
    if (index === dragIndexRight) return;

    // 右側の表示中のカラムリストをエンターした内容で更新
    setListItemsRight((prevState) => {
      let newListItems = JSON.parse(JSON.stringify(prevState));
      const deleteElement = newListItems.splice(dragIndexRight, 1)[0];
      newListItems.splice(index, 0, deleteElement);
      // columnRowIndexを変更した順番の内容で更新する
      (newListItems as ColumnHeaderItemList[]).forEach((item, index) => {
        item.columnIndex = index + 2;
      });
      console.log("newListItems", newListItems);
      return newListItems;
    });
    // 順番が入れ替わった状態のドラッグしているアイテムの現在のindexをStateに保持
    setDragIndexRight(index);
  };

  const handleDragEndRight = () => {
    console.log("Drop");
    console.log("ドラッグID", dragIndexRight);
    console.log("selectedRightItemsRef.current", selectedRightItemsRef.current);
    // 選択中のアイテムは非アクティブ化する
    if (dragIndexRight) {
      // 入れ替え後のアイテムリストのindexで指定したターゲットを取得する
      const target = listItemsRight[dragIndexRight];
      console.log("target", target);
      selectedRightItemsRef.current = selectedRightItemsRef.current.filter((item) => item !== target.columnId);
      console.log("selectedRightItemsRef.current", selectedRightItemsRef.current);
      setRightCount(selectedRightItemsRef.current.length);
      if (!selectedRightItemsRef.current.length) {
        removeArrowRef.current?.classList.remove(`${styles.arrow_remove_active}`);
        upArrowRef.current?.classList.remove(`${styles.arrow_up_active}`);
        downArrowRef.current?.classList.remove(`${styles.arrow_down_active}`);
        resetRightRef.current?.classList.remove(`${styles.arrow_right_reset_active}`);
      }
    }
    // 並び替えが完了した後のlistItems配列をDBに送信して更新する処理を追加
    // 入れ替えが完了した状態でZustandにグローバルStateとしてcolumnHeaderItemListの更新内容を保存する
    setEditedColumnHeaderItemList(listItemsRight);

    // 全ての更新が終わったら、Indexをnullにして初期化
    setDragIndexRight(null);
  };
  // ============================================================================================
  // ============================== 右側のカラムをクリックでアクティブ化 ==============================
  const handleClickActiveRight = (e: React.MouseEvent<HTMLElement, MouseEvent>, id: number) => {
    console.log("クリック");
    e.currentTarget.classList.toggle(`${styles.active_right}`);
    if (e.currentTarget.classList.contains(`${styles.active_right}`)) {
      selectedRightItemsRef.current.push(id);
      console.log(
        `プッシュ selectedRightItemsRef selectedRightItemsRef.current.length`,
        selectedRightItemsRef.current,
        selectedRightItemsRef.current.length
      );
    } else {
      //   const index = selectedRightItemsRef.current.indexOf(id);
      //   selectedRightItemsRef.current.splice(index, 1);
      selectedRightItemsRef.current = selectedRightItemsRef.current.filter((item) => item !== id);
      console.log(`フィルターリムーブ selectedRightItemsRef`, selectedRightItemsRef.current);
    }
    if (!!selectedRightItemsRef.current.length) {
      removeArrowRef.current?.classList.add(`${styles.arrow_remove_active}`);
      upArrowRef.current?.classList.add(`${styles.arrow_up_active}`);
      downArrowRef.current?.classList.add(`${styles.arrow_down_active}`);
      resetRightRef.current?.classList.add(`${styles.arrow_right_reset_active}`);
      setRightCount(selectedRightItemsRef.current.length);
    } else {
      removeArrowRef.current?.classList.remove(`${styles.arrow_remove_active}`);
      upArrowRef.current?.classList.remove(`${styles.arrow_up_active}`);
      downArrowRef.current?.classList.remove(`${styles.arrow_down_active}`);
      resetRightRef.current?.classList.remove(`${styles.arrow_right_reset_active}`);
      setRightCount(selectedRightItemsRef.current.length);
    }
  };

  // ============================================================================================

  // ================================ 最下部にカラムを移動する関数 ===============================
  const handleMoveLast = () => {
    if (!selectedRightItemsRef.current.length) return console.log("右無し");
    const copyRightArray = [...listItemsRight];
    // Setオブジェクトに変換して、hasメソッドで瞬時に渡された値を持つかどうか判定する
    const pushItemObject = new Set(selectedRightItemsRef.current);
    // リストから選択されたアイテムを取り除いて、変数に格納
    const pushItemArray = copyRightArray.filter((item) => pushItemObject.has(item.columnId));
    // リストから選択されたアイテムを削除後の残りのリストを変数に格納
    const afterRemovedItemArray = copyRightArray.filter((item) => !pushItemObject.has(item.columnId));
    console.log("pushItemArray", pushItemArray);
    console.log("afterRemovedItemArray", afterRemovedItemArray);
    // 残りのリストを最初に展開し、取り除いたアイテムを最後に展開することで、最下部にカラムを移動
    const newRightArray = [...afterRemovedItemArray, ...pushItemArray];
    // ヘッダーカラムリストのcolumnIndexプロパティの値を順番入れ替え後の並び順で再度2,3,4と書き換える
    // 2から始まるのはチェックボックスカラムのcolumnIndexが1となるため
    newRightArray.forEach((item, index) => {
      console.log("columnIndex", item.columnIndex);
      return (item.columnIndex = index + 2);
    });

    // カラム順番入れ替え後のローカルStateを更新
    console.log("🔥後 newRightArray", newRightArray);
    setListItemsRight(newRightArray);

    // 並び替えが完了した後のlistItems配列をDBに送信して更新する処理を追加
    // カラム順番入れ替え後のZustandにグローバルStateとしてcolumnHeaderItemListの更新内容を保存する
    // setEditedColumnHeaderItemList(newRightArray);
  };
  // ============================================================================================

  // ================================ 最上部にカラムを移動する関数 ===============================
  // 注意点：isFrozenで固定されているカラムよりも前に行かないようにする
  const handleMoveFirst = () => {
    if (!selectedRightItemsRef.current.length) return console.log("右無し");
    const copyRightArray = [...listItemsRight];
    // Setオブジェクトに変換して、hasメソッドで瞬時に渡された値を持つかどうか判定する
    const pushItemObject = new Set(selectedRightItemsRef.current);
    // リストから選択されたアイテムを取り除いて、変数に格納
    const pushItemArray = copyRightArray.filter((item) => pushItemObject.has(item.columnId));
    // リストから選択されたアイテムを削除後の残りのリストを変数に格納
    const afterRemovedItemArray = copyRightArray.filter((item) => !pushItemObject.has(item.columnId));
    // 🔹元のコード
    // console.log("pushItemArray", pushItemArray);
    // console.log("afterRemovedItemArray", afterRemovedItemArray);
    // // 残りのリストを最初に展開し、取り除いたアイテムを最後に展開することで、最下部にカラムを移動
    // const newRightArray = [...pushItemArray, ...afterRemovedItemArray];
    // 🔹元のコード
    // 🔹テストコード
    // 選択アイテムを除外した配列からisFrozenが付いているアイテムと付いていないアイテムをそれぞれ分けて配列に保持する
    const isFrozenItemArray = afterRemovedItemArray.filter((item) => item.isFrozen);
    const notIsFrozenItemArray = afterRemovedItemArray.filter((item) => !item.isFrozen);
    console.log("pushItemArray", pushItemArray);
    console.log("afterRemovedItemArray", afterRemovedItemArray);
    // 残りのリストを最初に展開し、取り除いたアイテムを最後に展開することで、最下部にカラムを移動
    const newRightArray = [...isFrozenItemArray, ...pushItemArray, ...notIsFrozenItemArray];
    // 🔹テストコード
    // ヘッダーカラムリストのcolumnIndexプロパティの値を順番入れ替え後の並び順で再度2,3,4と書き換える
    // 2から始まるのはチェックボックスカラムのcolumnIndexが1となるため
    newRightArray.forEach((item, index) => {
      // console.log("columnIndex", item.columnIndex);
      return (item.columnIndex = index + 2);
    });
    // カラム順番入れ替え後のローカルStateを更新
    console.log("🔥後 newRightArray", newRightArray);
    setListItemsRight(newRightArray);

    // 並び替えが完了した後のlistItems配列をDBに送信して更新する処理を追加
    // 入れ替えが完了した状態でZustandにグローバルStateとしてcolumnHeaderItemListの更新内容を保存する
    // setEditedColumnHeaderItemList(newRightArray);
  };
  // ============================================================================================

  // ================================ 右側の選択したカラムを全てリセットする関数 ===============================
  const handleResetRight = () => {
    if (!selectedRightItemsRef.current.length) return console.log("右無し");
    if (!modalContainerRef.current) return console.log("無し");
    selectedRightItemsRef.current = [];
    resetRightRef.current?.classList.remove(`${styles.arrow_right_reset_active}`);

    const rightActiveColumns = modalContainerRef.current.querySelectorAll(`.${styles.active_right}`);
    rightActiveColumns.forEach((item) => item.classList.remove(`${styles.active_right}`));
    removeArrowRef.current?.classList.remove(`${styles.arrow_remove_active}`);
    downArrowRef.current?.classList.remove(`${styles.arrow_down_active}`);
    upArrowRef.current?.classList.remove(`${styles.arrow_up_active}`);
    setRightCount(0);
  };
  // ============================================================================================
  // ================================ ツールチップ ================================
  const hoveredItemPosModal = useStore((state) => state.hoveredItemPosModal);
  const setHoveredItemPosModal = useStore((state) => state.setHoveredItemPosModal);
  const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string, marginTop: number = 0) => {
    // モーダルコンテナのleftを取得する
    if (!modalContainerRef.current) return;
    const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
    const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    setHoveredItemPosModal({
      x: x - containerLeft,
      y: y - containerTop,
      itemWidth: width,
      itemHeight: height,
      content: (e.target as HTMLDivElement).dataset.text as string,
      content2: content2,
      content3: content3,
      display: display,
      marginTop: marginTop,
    });
  };
  // ============================================================================================
  // ================================ ツールチップを非表示 ================================
  const handleCloseTooltip = () => {
    setHoveredItemPosModal(null);
  };
  // ============================================================================================

  // キャンセルクリックでモーダルを開いた時の最初のカラムの状態にリセットする関数
  const handleCancelAndReset = () => {
    // ZustandのグローバルStateのカラム編集リストを初期状態に格納して
    // 親コンポーネント側のuseEffectでリセットさせる
    console.log("🔥🔥🔥キャンセル モーダル閉じた 格納したresetColumnHeaderItemList", resetColumnHeaderItemList);
    setEditedColumnHeaderItemList(resetColumnHeaderItemList);
    setIsOpenEditColumns(false);
    setListItemsRight([]);
  };

  const handleSaveAndClose = () => {
    setEditedColumnHeaderItemList(listItemsRight);
    setIsOpenEditColumns(false);
    console.log("🔥🔥🔥セーブ モーダル閉じた 格納したlistItemsRight", listItemsRight);
  };

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      <div className={`${styles.container} fade03`} ref={modalContainerRef}>
        {/* 保存キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[30px] text-center text-[18px]">
          <div
            className="relative flex min-w-[125px] cursor-pointer select-none items-center pl-[10px] text-start font-semibold hover:text-[#aaa]"
            onClick={handleCancelAndReset}
          >
            {/* <span>キャンセル</span> */}
            <BsChevronLeft className="z-1 absolute  left-[-25px] top-[50%] translate-y-[-50%] text-[24px]" />
            <span>戻る</span>
          </div>
          <div className="select-none font-bold">カラム並び替え</div>
          {/* <div className="-translate-x-[25px] font-bold">カラム並び替え・追加/削除</div> */}
          <div
            className={`min-w-[125px] cursor-pointer select-none text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text}`}
            onClick={handleSaveAndClose}
          >
            保存
          </div>
        </div>
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {/* 右コンテンツボックス */}
          <div className={`flex h-full  basis-5/12 flex-col items-center ${styles.content_box}`}>
            {/* タイトルエリア */}
            <div className={`${styles.title} w-full space-x-4 text-[var(--color-edit-arrow-disable-color)]`}>
              {/* <span className="text-[#0D99FF]">表示</span> */}
              <div
                ref={downArrowRef}
                className={`flex-center h-[30px] w-[30px] cursor-not-allowed rounded-full  ${styles.icon_button}`}
                onClick={handleMoveLast}
                data-text="選択したカラムを一番下に移動する"
                onMouseEnter={(e) => handleOpenTooltip(e, "top", 9)}
                onMouseLeave={handleCloseTooltip}
              >
                <ImArrowDown2 className="pointer-events-none text-[16px]" />
              </div>
              <div
                ref={upArrowRef}
                className={`flex-center h-[30px] w-[30px] cursor-not-allowed rounded-full  ${styles.icon_button}`}
                onClick={handleMoveFirst}
                data-text="選択したカラムを一番上に移動する"
                onMouseEnter={(e) => handleOpenTooltip(e, "top", 9)}
                onMouseLeave={handleCloseTooltip}
              >
                <ImArrowUp2 className="pointer-events-none text-[16px]" />
              </div>
              <div
                ref={resetRightRef}
                className={`flex-center h-[30px] w-[30px] cursor-not-allowed rounded-full  ${styles.icon_button}`}
                // onClick={handleMoveFirst}
                data-text="選択したカラムをリセットする"
                onMouseEnter={(e) => handleOpenTooltip(e, "top", 9)}
                onMouseLeave={handleCloseTooltip}
                onClick={handleResetRight}
              >
                <GrPowerReset className="pointer-events-none text-[16px]" />
              </div>
              {!!selectedRightItemsRef.current.length && (
                <div className="ml-auto flex h-full w-fit flex-1 items-center justify-end">
                  <span className="text-[14px] text-[var(--color-text-brand-f)]">{rightCount}件選択中</span>
                </div>
              )}
            </div>
            {/* カラムリストエリア */}
            <ul className={`${styles.sortable_list}`}>
              {listItemsRight.map((item, index) => (
                <li
                  key={`right-${item.columnId}`}
                  className={`${styles.item} ${item.columnId} ${index === dragIndexRight ? `${styles.dragging}` : ""} ${
                    styles.item_right
                  } ${item.isFrozen ? `${styles.frozen}` : ``}`}
                  //   draggable={true}
                  draggable={item.isFrozen === false}
                  onDragStart={() => handleDragStartRight(index)}
                  onDragEnter={() => handleDragEnterRight(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDragEnd={handleDragEndRight}
                  onClick={(e) => handleClickActiveRight(e, item.columnId)}
                >
                  <div className={styles.details}>
                    {/* <Image src={item.img} alt="" /> */}
                    {/* <span className="truncate">{item.columnName}</span> */}
                    {activeMenuTab === "Company" && (
                      <span className="truncate">{columnNameToJapanese(item.columnName)}</span>
                    )}
                    {activeMenuTab === "Contacts" && (
                      <span className="truncate">{columnNameToJapaneseContacts(item.columnName)}</span>
                    )}
                    {activeMenuTab === "Activity" && (
                      <span className="truncate">{columnNameToJapaneseActivity(item.columnName)}</span>
                    )}
                    {activeMenuTab === "Meeting" && (
                      <span className="truncate">{columnNameToJapaneseMeeting(item.columnName)}</span>
                    )}
                    {activeMenuTab === "Property" && (
                      <span className="truncate">{columnNameToJapaneseProperty(item.columnName)}</span>
                    )}
                    {activeMenuTab === "Quotation" && (
                      <span className="truncate">{columnNameToJapaneseQuotation(item.columnName)}</span>
                    )}
                    {/* {item.isFrozen && <span className="absolute -right-3">固定されています</span>} */}
                  </div>
                  <MdOutlineDragIndicator className="fill-[var(--color-text)]" />
                </li>
              ))}
            </ul>
            <span ref={scrollBottomRef}></span>
          </div>
        </div>
        {hoveredItemPosModal && <TooltipModal />}
      </div>
    </>
  );
};

export const EditColumnsModalDisplayOnly = memo(EditColumnsModalDisplayOnlyMemo);
