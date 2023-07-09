import React, { FC, useRef, useState } from "react";
import styles from "./EditColumns.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { MdOutlineDragIndicator } from "react-icons/md";

// const data: Array<{ id: number; name: string; img: StaticImageData }> = [
const data: Array<{ id: number; name: string }> = [
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

export const EditColumns: FC = () => {
  const setIsOpenEditColumns = useDashboardStore((state) => state.setIsOpenEditColumns);

  const [listItemsLeft, setListItemsLeft] = useState(data);
  const [listItemsRight, setListItemsRight] = useState(data);
  const [dragIndexLeft, setDragIndexLeft] = useState<number | null>(null);
  const [dragIndexRight, setDragIndexRight] = useState<number | null>(null);
  const selectedLeftItemsRef = useRef<number[]>([]);
  const selectedRightItemsRef = useRef<number[]>([]);
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
  };
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
  };

  return (
    <>
      <div className={`${styles.overlay} `} onClick={() => setIsOpenEditColumns(false)} />
      <div className={`${styles.container} fade02 `}>
        {/* 保存キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[30px] text-center text-[18px]">
          <div className="cursor-pointer hover:text-[#aaa]" onClick={() => console.log("🌟")}>
            キャンセル
          </div>
          <div className="-translate-x-[25px] font-bold">カラム並び替え・表示/非表示</div>
          <div
            className={`cursor-pointer font-bold text-[#0D99FF] ${styles.save_text}`}
            onClick={() => console.log("クリック")}
          >
            保存
          </div>
        </div>
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          <div className={`flex h-full basis-5/12 flex-col items-center ${styles.content_box}`}>
            <div className={`${styles.title} text-[#0D99FF]`}>非表示</div>
            <ul className={`${styles.sortable_list} `}>
              {listItemsLeft.map((item, index) => (
                <li
                  key={item.id}
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
                  <MdOutlineDragIndicator />
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-col-center h-full w-full basis-2/12 "></div>

          <div className={`flex h-full  basis-5/12 flex-col items-center ${styles.content_box}`}>
            <div className={`${styles.title} text-[#0D99FF] `}>表示</div>
            <ul className={`${styles.sortable_list}`}>
              {listItemsRight.map((item, index) => (
                <li
                  key={item.id}
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
          </div>
        </div>
      </div>
      ;
    </>
  );
};
