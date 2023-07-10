import React, { FC, useRef, useState } from "react";
import styles from "./EditColumns.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { MdOutlineDragIndicator } from "react-icons/md";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { ImArrowRight2, ImArrowLeft2, ImArrowUp2, ImArrowDown2 } from "react-icons/im";
import useStore from "@/store";
import { Tooltip } from "@/components/Parts/Tooltip/Tooltip";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { GrPowerReset } from "react-icons/gr";

// const data: Array<{ id: number; name: string; img: StaticImageData }> = [
const dataLeft: Array<{ id: number; name: string }> = [
  {
    id: 1,
    name: "name1234567890123456789012345678901234567",
    // img: img1,
  },
  {
    id: 2,
    name: "name2",
    // img: img2,
  },
  {
    id: 3,
    name: "name3",
    // img: img3,
  },
  {
    id: 4,
    name: "name4",
    // img: img4,
  },
  {
    id: 5,
    name: "name5",
    // img: img5,
  },
  {
    id: 6,
    name: "name6",
    // img: img6,
  },
  {
    id: 7,
    name: "name7",
    // img: img6,
  },
  {
    id: 8,
    name: "name8",
    // img: img6,
  },
  {
    id: 9,
    name: "name9",
    // img: img6,
  },
  {
    id: 10,
    name: "name10",
    // img: img6,
  },
  {
    id: 11,
    name: "name11",
    // img: img6,
  },
  {
    id: 12,
    name: "name12",
    // img: img6,
  },
  {
    id: 13,
    name: "name13",
    // img: img6,
  },
  {
    id: 14,
    name: "name14",
    // img: img6,
  },
  {
    id: 15,
    name: "name15",
    // img: img6,
  },
  {
    id: 16,
    name: "name16",
    // img: img6,
  },
  {
    id: 17,
    name: "name17",
    // img: img6,
  },
  {
    id: 18,
    name: "name18",
    // img: img6,
  },
  {
    id: 19,
    name: "name19",
    // img: img6,
  },
  {
    id: 20,
    name: "name20",
    // img: img6,
  },
];
const dataRight: Array<{ id: number; name: string }> = [
  {
    id: 21,
    name: "name21234567890123456789012345678901234567",
    // img: img1,
  },
  {
    id: 22,
    name: "name22",
    // img: img2,
  },
  {
    id: 23,
    name: "name23",
    // img: img3,
  },
  {
    id: 24,
    name: "name24",
    // img: img4,
  },
  {
    id: 25,
    name: "name25",
    // img: img5,
  },
  {
    id: 26,
    name: "name26",
    // img: img6,
  },
  {
    id: 27,
    name: "name27",
    // img: img6,
  },
  {
    id: 28,
    name: "name28",
    // img: img6,
  },
  {
    id: 29,
    name: "name29",
    // img: img6,
  },
  {
    id: 30,
    name: "name30",
    // img: img6,
  },
  {
    id: 31,
    name: "name31",
    // img: img6,
  },
  {
    id: 32,
    name: "name32",
    // img: img6,
  },
  {
    id: 33,
    name: "name33",
    // img: img6,
  },
  {
    id: 34,
    name: "name34",
    // img: img6,
  },
  {
    id: 35,
    name: "name35",
    // img: img6,
  },
  {
    id: 36,
    name: "name36",
    // img: img6,
  },
  {
    id: 37,
    name: "name37",
    // img: img6,
  },
  {
    id: 38,
    name: "name38",
    // img: img6,
  },
  {
    id: 39,
    name: "name39",
    // img: img6,
  },
  {
    id: 40,
    name: "name40",
    // img: img6,
  },
];

export const EditColumns: FC = () => {
  const setIsOpenEditColumns = useDashboardStore((state) => state.setIsOpenEditColumns);

  const [listItemsLeft, setListItemsLeft] = useState(dataLeft);
  const [listItemsRight, setListItemsRight] = useState(dataRight);
  const [dragIndexLeft, setDragIndexLeft] = useState<number | null>(null);
  const [dragIndexRight, setDragIndexRight] = useState<number | null>(null);
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const selectedLeftItemsRef = useRef<number[]>([]);
  const selectedRightItemsRef = useRef<number[]>([]);
  const addArrowRef = useRef<HTMLDivElement | null>(null);
  const removeArrowRef = useRef<HTMLDivElement | null>(null);
  const upArrowRef = useRef<HTMLDivElement | null>(null);
  const downArrowRef = useRef<HTMLDivElement | null>(null);
  const resetLeftRef = useRef<HTMLDivElement | null>(null);
  const resetRightRef = useRef<HTMLDivElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollBottomRef = useRef<HTMLSpanElement | null>(null);
  console.log(`listItems`, listItemsLeft);
  console.log(`listItems`, listItemsRight);
  console.log(`dragIndex`, dragIndexLeft);
  console.log(`dragIndex`, dragIndexRight);

  // ====================== 左側 ======================
  const handleDragStartLeft = (index: number) => {
    console.log("dragStart🔥", index);
    setDragIndexLeft(index);
  };

  const handleDragEnterLeft = (index: number) => {
    console.log("dragEnter DroppableIndex, dragIndex", index, dragIndexLeft);
    if (index === dragIndexLeft) return;

    setListItemsLeft((prevState) => {
      let newListItems = JSON.parse(JSON.stringify(prevState));
      const deleteElement = newListItems.splice(dragIndexLeft, 1)[0];
      newListItems.splice(index, 0, deleteElement);
      return newListItems;
    });

    setDragIndexLeft(index);
  };

  const handleDragEndLeft = () => {
    console.log("Drop");
    // 並び替えが完了した後のlistItems配列をDBに送信して更新する処理を追加

    // 全ての更新が終わったら、Indexをnullにして初期化
    setDragIndexLeft(null);
  };

  // ====================== 右側 ======================
  const handleDragStartRight = (index: number) => {
    console.log("dragStart🔥", index);
    setDragIndexRight(index);
  };

  const handleDragEnterRight = (index: number) => {
    console.log("dragEnter DroppableIndex, dragIndex", index, dragIndexRight);
    if (index === dragIndexRight) return;

    setListItemsRight((prevState) => {
      let newListItems = JSON.parse(JSON.stringify(prevState));
      const deleteElement = newListItems.splice(dragIndexRight, 1)[0];
      newListItems.splice(index, 0, deleteElement);
      return newListItems;
    });

    setDragIndexRight(index);
  };

  const handleDragEndRight = () => {
    console.log("Drop");
    // 並び替えが完了した後のlistItems配列をDBに送信して更新する処理を追加

    // 全ての更新が終わったら、Indexをnullにして初期化
    setDragIndexRight(null);
  };

  // ============================== 左側のカラムをクリックでアクティブ化 ==============================
  const handleClickActiveLeft = (e: React.MouseEvent<HTMLElement, MouseEvent>, id: number) => {
    console.log("クリック");
    e.currentTarget.classList.toggle(`${styles.active_left}`);
    if (e.currentTarget.classList.contains(`${styles.active_left}`)) {
      selectedLeftItemsRef.current.push(id);
      console.log(`プッシュ selectedLeftItemsRef`, selectedLeftItemsRef.current);
    } else {
      //   const index = selectedLeftItemsRef.current.indexOf(id);
      //   selectedLeftItemsRef.current.splice(index, 1);
      selectedLeftItemsRef.current = selectedLeftItemsRef.current.filter((item) => item !== id);
      console.log(`フィルターリムーブ selectedLeftItemsRef`, selectedLeftItemsRef.current);
    }
    if (!!selectedLeftItemsRef.current.length) {
      addArrowRef.current?.classList.add(`${styles.arrow_add_active}`);
      resetLeftRef.current?.classList.add(`${styles.arrow_left_reset_active}`);
      setLeftCount(selectedLeftItemsRef.current.length);
    } else {
      addArrowRef.current?.classList.remove(`${styles.arrow_add_active}`);
      resetLeftRef.current?.classList.remove(`${styles.arrow_left_reset_active}`);
      setLeftCount(selectedLeftItemsRef.current.length);
    }
  };
  // ============================== 右側のカラムをクリックでアクティブ化 ==============================
  const handleClickActiveRight = (e: React.MouseEvent<HTMLElement, MouseEvent>, id: number) => {
    console.log("クリック");
    e.currentTarget.classList.toggle(`${styles.active_right}`);
    if (e.currentTarget.classList.contains(`${styles.active_right}`)) {
      selectedRightItemsRef.current.push(id);
      console.log(`プッシュ selectedRightItemsRef`, selectedRightItemsRef.current);
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

  // ==================== レフトエリアのアイテムをライトエリアに追加する関数 ====================
  const handleAddVisible = () => {
    if (!selectedLeftItemsRef.current.length) return console.log("左無し");
    // Refに格納している左の選択中のアイテムのidを右のStateに追加して左のStateから削除
    const copyRightArray = [...listItemsRight];
    const copyLeftArray = [...listItemsLeft];
    // Setオブジェクトに変換して、hasメソッドで瞬時に渡された値を持つかどうか判定する
    const removedArray = new Set(selectedLeftItemsRef.current);
    // ================ 右のグループに追加する処理 ================
    const pushItemArray = copyLeftArray.filter((item) => removedArray.has(item.id));
    console.log("pushItemObject", pushItemArray);
    const newRightArray = [...copyRightArray, ...pushItemArray];
    console.log("newRightArray", newRightArray);
    setListItemsRight(newRightArray);

    // ================ 左のグループから削除する処理 ================
    const newLeftArray = copyLeftArray.filter((value) => !removedArray.has(value.id));
    console.log("newLeftArray", newLeftArray);
    setListItemsLeft(newLeftArray);

    // 更新が終わったら選択中のRefを空にして、かつ、activeクラスを削除する
    selectedLeftItemsRef.current = [];
    addArrowRef.current?.classList.remove(`${styles.arrow_add_active}`);
  };

  // ==================== ライトエリアのアイテムをレフトエリアに追加する関数 ====================
  const handleAddHidden = () => {
    if (!selectedRightItemsRef.current.length) return console.log("右無し");
    // Refに格納している左の選択中のアイテムのidを右のStateに追加して左のStateから削除
    const copyLeftArray = [...listItemsLeft];
    const copyRightArray = [...listItemsRight];
    // Setオブジェクトに変換して、hasメソッドで瞬時に渡された値を持つかどうか判定する
    const removedArray = new Set(selectedRightItemsRef.current);
    // ================ 左のグループに追加する処理 ================
    const pushItemArray = copyRightArray.filter((item) => removedArray.has(item.id));
    console.log("pushItemArray", pushItemArray);
    const newLeftArray = [...copyLeftArray, ...pushItemArray];
    console.log("newRightArray", newLeftArray);
    setListItemsLeft(newLeftArray);

    // ================ 右のグループから削除する処理 ================
    const newRightArray = copyRightArray.filter((value) => !removedArray.has(value.id));
    console.log("newLeftArray", newRightArray);
    setListItemsRight(newRightArray);

    // 更新が終わったら選択中のRefを空にして、かつ、activeクラスを削除する
    selectedRightItemsRef.current = [];
    removeArrowRef.current?.classList.remove(`${styles.arrow_remove_active}`);
  };

  // ================================ 最下部にカラムを移動する関数 ===============================
  const handleMoveLast = () => {
    if (!selectedRightItemsRef.current.length) return console.log("右無し");
    const copyRightArray = [...listItemsRight];
    // Setオブジェクトに変換して、hasメソッドで瞬時に渡された値を持つかどうか判定する
    const pushItemObject = new Set(selectedRightItemsRef.current);
    const pushItemArray = copyRightArray.filter((item) => pushItemObject.has(item.id));
    const afterRemovedItemArray = copyRightArray.filter((item) => !pushItemObject.has(item.id));
    console.log("pushItemArray", pushItemArray);
    console.log("afterRemovedItemArray", afterRemovedItemArray);
    const newRightArray = [...afterRemovedItemArray, ...pushItemArray];
    setListItemsRight(newRightArray);
  };

  // ================================ 最上部にカラムを移動する関数 ===============================
  const handleMoveFirst = () => {
    if (!selectedRightItemsRef.current.length) return console.log("右無し");
    const copyRightArray = [...listItemsRight];
    // Setオブジェクトに変換して、hasメソッドで瞬時に渡された値を持つかどうか判定する
    const pushItemObject = new Set(selectedRightItemsRef.current);
    const pushItemArray = copyRightArray.filter((item) => pushItemObject.has(item.id));
    const afterRemovedItemArray = copyRightArray.filter((item) => !pushItemObject.has(item.id));
    console.log("pushItemArray", pushItemArray);
    console.log("afterRemovedItemArray", afterRemovedItemArray);
    const newRightArray = [...pushItemArray, ...afterRemovedItemArray];
    setListItemsRight(newRightArray);
  };

  // ================================ 左側の選択したカラムを全てリセットする関数 ===============================
  const handleResetLeft = () => {
    if (!selectedLeftItemsRef.current.length) return console.log("左無し");
    if (!modalContainerRef.current) return console.log("無し");
    selectedLeftItemsRef.current = [];
    resetLeftRef.current?.classList.remove(`${styles.arrow_left_reset_active}`);
    const leftActiveColumns = modalContainerRef.current.querySelectorAll(`.${styles.active_left}`);
    leftActiveColumns.forEach((item) => item.classList.remove(`${styles.active_left}`));
    addArrowRef.current?.classList.remove(`${styles.arrow_add_active}`);
    setLeftCount(0);
  };
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

  // ================================ ツールチップ ================================
  const hoveredItemPosModal = useStore((state) => state.hoveredItemPosModal);
  const setHoveredItemPosModal = useStore((state) => state.setHoveredItemPosModal);
  const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
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
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    setHoveredItemPosModal(null);
  };

  return (
    <>
      <div className={`${styles.overlay} `} onClick={() => setIsOpenEditColumns(false)} />
      <div className={`${styles.container} fade01 `} ref={modalContainerRef}>
        {/* 保存キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[30px] text-center text-[18px]">
          <div className="font-samibold cursor-pointer hover:text-[#aaa]" onClick={() => setIsOpenEditColumns(false)}>
            キャンセル
          </div>
          <div className="-translate-x-[25px] font-bold">カラム並び替え・追加/削除</div>
          <div
            className={`cursor-pointer font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text}`}
            onClick={() => console.log("クリック")}
          >
            保存
          </div>
        </div>
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {/* 左コンテンツボックス */}
          <div className={`flex h-full basis-5/12 flex-col items-center ${styles.content_box}`}>
            {/* タイトルエリア */}
            <div className={`${styles.title} space-x-4 `}>
              <span className="text-[#0D99FF]">非表示</span>
              <div
                ref={resetLeftRef}
                className={`flex-center h-[30px] w-[30px] cursor-not-allowed rounded-full bg-[var(--color-edit-arrow-disable)] text-[var(--color-sub-text)]`}
                // onClick={handleMoveFirst}
                data-text="選択したカラムをリセットする"
                onMouseEnter={(e) => handleOpenTooltip(e, "top")}
                onMouseLeave={handleCloseTooltip}
                onClick={handleResetLeft}
              >
                <GrPowerReset className="pointer-events-none text-[16px]" />
              </div>
              {!!selectedLeftItemsRef.current.length && (
                <div className="ml-auto flex h-full w-fit flex-1 items-center justify-end">
                  <span className="text-[14px] text-[var(--color-text-brand-f)]">{leftCount}件選択中</span>
                </div>
              )}
            </div>
            <ul className={`${styles.sortable_list} `}>
              {listItemsLeft.map((item, index) => (
                <li
                  key={`left-${item.id}`}
                  className={`${styles.item} ${item.id} ${index === dragIndexLeft ? `${styles.dragging}` : ""} ${
                    styles.item_left
                  }`}
                  draggable={true}
                  onDragStart={() => handleDragStartLeft(index)}
                  onDragEnter={() => handleDragEnterLeft(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDragEnd={handleDragEndLeft}
                  onClick={(e) => handleClickActiveLeft(e, item.id)}
                >
                  <div className={styles.details}>
                    {/* <Image src={item.img} alt="" /> */}
                    <span className="truncate">{item.name}</span>
                  </div>
                  {/* <MdOutlineDragIndicator /> */}
                  <div className="min-h-[19px] w-[18px]"></div>
                </li>
              ))}
            </ul>
          </div>

          {/* 中央コンテンツボックス */}
          <div className="flex h-full w-full basis-2/12 flex-col items-center justify-center space-y-[60px] text-[24px]">
            <div
              className={`flex-center h-[50px] w-[50px] cursor-not-allowed rounded-full bg-[var(--color-edit-arrow-disable)] text-[var(--color-text-sub)]`}
              ref={addArrowRef}
              onClick={handleAddVisible}
              data-text="選択したカラムを表示する"
              onMouseEnter={(e) => handleOpenTooltip(e, "center")}
              onMouseLeave={handleCloseTooltip}
            >
              <ImArrowRight2 className="pointer-events-none" />
            </div>
            <div
              className="flex-center h-[50px] w-[50px] cursor-not-allowed rounded-full bg-[var(--color-edit-arrow-disable)] text-[var(--color-text-sub)]"
              ref={removeArrowRef}
              onClick={handleAddHidden}
              data-text="選択したカラムを非表示にする"
              onMouseEnter={(e) => handleOpenTooltip(e, "center")}
              onMouseLeave={handleCloseTooltip}
            >
              <ImArrowLeft2 className="pointer-events-none" />
            </div>
          </div>

          {/* 右コンテンツボックス */}
          <div className={`flex h-full  basis-5/12 flex-col items-center ${styles.content_box}`}>
            {/* タイトルエリア */}
            <div className={`${styles.title} w-full space-x-4 text-[var(--color-sub-text)]`}>
              <span className="text-[#0D99FF]">表示</span>
              <div
                ref={downArrowRef}
                className={`flex-center h-[30px] w-[30px] cursor-not-allowed rounded-full bg-[var(--color-edit-arrow-disable)]`}
                onClick={handleMoveLast}
                data-text="選択したカラムを一番下に移動する"
                onMouseEnter={(e) => handleOpenTooltip(e, "top")}
                onMouseLeave={handleCloseTooltip}
              >
                <ImArrowDown2 className="pointer-events-none text-[16px]" />
              </div>
              <div
                ref={upArrowRef}
                className={`flex-center h-[30px] w-[30px] cursor-not-allowed rounded-full bg-[var(--color-edit-arrow-disable)] `}
                onClick={handleMoveFirst}
                data-text="選択したカラムを一番上に移動する"
                onMouseEnter={(e) => handleOpenTooltip(e, "top")}
                onMouseLeave={handleCloseTooltip}
              >
                <ImArrowUp2 className="pointer-events-none text-[16px]" />
              </div>
              <div
                ref={resetRightRef}
                className={`flex-center h-[30px] w-[30px] cursor-not-allowed rounded-full bg-[var(--color-edit-arrow-disable)]`}
                // onClick={handleMoveFirst}
                data-text="選択したカラムをリセットする"
                onMouseEnter={(e) => handleOpenTooltip(e, "top")}
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
                  key={`right-${item.id}`}
                  className={`${styles.item} ${item.id} ${index === dragIndexRight ? `${styles.dragging}` : ""} ${
                    styles.item_right
                  }`}
                  draggable={true}
                  onDragStart={() => handleDragStartRight(index)}
                  onDragEnter={() => handleDragEnterRight(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDragEnd={handleDragEndRight}
                  onClick={(e) => handleClickActiveRight(e, item.id)}
                >
                  <div className={styles.details}>
                    {/* <Image src={item.img} alt="" /> */}
                    <span className="truncate">{item.name}</span>
                  </div>
                  <MdOutlineDragIndicator />
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
