import {
  Dispatch,
  DragEvent,
  FormEvent,
  Fragment,
  SetStateAction,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BurnBarrel } from "./BurnBarel";
import styles from "./DealBoard.module.css";
import { FiPlus, FiTrash } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { AddCard } from "./AddCard";
import { EditModalDealCard } from "./EditModalDealCard";
import useDashboardStore from "@/store/useDashboardStore";
import { mappingOrderCertaintyStartOfMonth, mappingOrderCertaintyStartOfMonthToast } from "@/utils/selectOptions";
import useStore from "@/store";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { toast } from "react-toastify";

type ColumnSizeInfo = {
  prevColumnHeight: number;
  columnHeight: number;
  prevRowLength: number;
  rowLength: number;
  isResizedColumnHeight: boolean;
};

type ColumnLane = {
  // title: string;
  titleNum: number; // 1: A (受注済み),2: ○ (80%以上の確率で受注), 3: ...
  headingColor: string;
  cards: DealCardType[];
  setCards: Dispatch<SetStateAction<DealCardType[]>>;
};
// type ColumnLane = {
//   // title: string;
//   titleNum: number; // 1: A (受注済み),2: ○ (80%以上の確率で受注), 3: ...
//   headingColor: string;
//   cards: DealCardType[];
//   setCards: Dispatch<SetStateAction<DealCardType[]>>;
//   columnInfo: ColumnSizeInfo;
//   setColumnInfo: Dispatch<SetStateAction<ColumnSizeInfo>>;
// };

// type DealCardType = { id: string; taskTitle: string; contents: string | null; columnTitle: string };

type DealCardType = {
  property_id: string;
  company_name: string; // 会社名
  company_department_name: string | null; // 部署名
  column_title_num: number; // 月初確度 or 中間確度 中間確度があればこちらを優先
  expansion_year_month: number; // 展開日付 => 当月発生の場合はネタ外として扱う
};
// type DealCardType = Property_row_data;

const DEFAULT_CARDS = Array(11)
  .fill(null)
  .map((_, index) => {
    let columnName = 1;
    if (4 < index && index < 8) columnName = 2;
    if (8 <= index && index <= 9) columnName = 3;
    if (10 <= index) columnName = 4;
    return {
      property_id: index.toString(),
      company_name: `株式会社X ${index}`,
      company_department_name: "開発本部開発第二課",
      column_title_num: columnName,
      expansion_year_month: 202403,
    };
  });

// 列のインデックスとタイトルのマッピング
const mappingColumnIndexToTitle: { [key: number]: number } = {
  0: 1, //"A (受注済み)"
  1: 2, //"○ (80%以上の確率で受注)"
  2: 3, //"△ (50%以上の確率で受注)"
  3: 4, //"▲ (30%以上の確率で受注)"
};

const DealBoardMemo = () => {
  const language = useStore((state) => state.language);
  // const [cards, setCards] = useState<DealCardType[]>([]);
  const [cards, setCards] = useState<DealCardType[]>(DEFAULT_CARDS);
  // const [hasChecked, setHasChecked] = useState(false);
  const hasCheckedRef = useRef(false);
  // 編集モーダル
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const editedDealCard = useDashboardStore((state) => state.editedDealCard);
  const setEditedDealCard = useDashboardStore((state) => state.setEditedDealCard);

  // useEffect(() => {
  //   hasCheckedRef.current && localStorage.setItem("cards", JSON.stringify(cards));
  // }, [cards]);

  // useEffect(() => {
  //   const cardData = localStorage.getItem("cards");

  //   setCards(cardData ? JSON.parse(cardData) : []);

  //   hasCheckedRef.current = true;
  // }, []);

  // ----------------------------- 🌟Column関連🌟

  const isHighlightIndicatorRef = useRef(false);
  // --------------- 🔹ボード
  const boardRef = useRef<HTMLDivElement | null>(null);
  // --------------- 🔹Columnレーン
  const columnsRef = useRef<(HTMLDivElement | null)[]>([]);
  const columnLanesRef = useRef<(HTMLDivElement | null)[]>([]);
  // カラムレーンホバー時のアクティブ状態
  const columnActiveRef = useRef(false);
  // column最後のインジケータ
  const lastIndicators = useRef<(HTMLDivElement | null)[]>([]);
  // --------------- 🔹カード
  // １列分の全てのカードのrefオブジェクトの配列
  const rowCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  // ドラッグしているカラムの情報
  const prevDraggingColumnIndexRef = useRef<number | null>(null);
  const draggingColumnIndexRef = useRef<number | null>(null);
  // ドラッグしているカードの情報
  const originDraggingCardIndexRef = useRef<{ originColumnIndex: number; originRowIndex: number } | null>(null);
  const draggingCardIndexRef = useRef<{ currentColumnIndex: number; currentRowIndex: number } | null>(null);
  const draggingCardSizeY = useRef(0);
  // const [draggingCardSizeY, setDraggingCardSizeY] = useState(0);
  const draggingCardObjRef = useRef<DealCardType | null>(null);
  // カードホバー時のアクティブ状態
  const rowCardActiveRef = useRef(false);
  // ドラッグ中のカードのDOM
  const draggingCardElRef = useRef<HTMLDivElement | null>(null);
  // ドラッグ中のカードを掴んだ位置からカード上部までの距離
  const offsetDragCardPositionRef = useRef({ x: 0, y: 0, bottom: 0 });
  // ゴミ箱関連
  const trashAreaRef = useRef<HTMLDivElement | null>(null);
  const trashIconRef = useRef<HTMLDivElement | null>(null);
  const burnBarrelIconRef = useRef<HTMLDivElement | null>(null);
  const trashActiveRef = useRef(false);

  const [updateCardsMapTrigger, setUpdateCardsMapTrigger] = useState(Date.now());
  // カテゴライズしたカードリストMapオブジェクト
  const categorizedCardsMapObj = useMemo(() => {
    // reduceパターンだと列に１枚もカードが存在しなくなった場合に対応できないため下記に変更
    // const categorizedCards: Map<number, DealCardType[]> = cards.reduce((map, card) => {
    //   // 既にそのtitleのキーがMapに存在するか確認
    //   if (!map.has(card.column_title_num)) {
    //     map.set(card.column_title_num, []); // 存在しなければ新しい配列と共にキーを追加
    //   }

    //   map.get(card.column_title_num).push(card); // カードを適切な配列に追加

    //   return map; // 更新されたMapを返す
    // }, new Map());

    // Mapオブジェクトを作成
    const categorizedCards = new Map<number, DealCardType[]>();

    // 4列全てに対して空の配列を初期値として設定 月初確度の値は1~4までのINTEGER型のため1~4のkey, 空の配列をvalueとしたエントリをMapオブジェクトにセット
    for (let i = 1; i <= 4; i++) {
      categorizedCards.set(i, []);
    }

    // カードデータを適切な列に追加
    cards.forEach((card) => {
      // 取り出したカードの確度に対応する数字のkey(列)のvalue(配列)を取得して、この配列にカードを追加
      categorizedCards.get(card.column_title_num)?.push(card);
    });

    console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅再生成", "cards", cards, "categorizedCards", categorizedCards);
    return categorizedCards;
  }, [cards]);
  // }, [cards, updateCardsMapTrigger]);

  const awardArray = useMemo(() => {
    return categorizedCardsMapObj.get(1);
  }, [categorizedCardsMapObj]);
  const eightyArray = useMemo(() => {
    return categorizedCardsMapObj.get(2);
  }, [categorizedCardsMapObj]);
  const fiftyArray = useMemo(() => {
    return categorizedCardsMapObj.get(3);
  }, [categorizedCardsMapObj]);
  const thirtyArray = useMemo(() => {
    return categorizedCardsMapObj.get(4);
  }, [categorizedCardsMapObj]);

  // const dealColumnList: ColumnLane[] = [
  //   { titleNum: 1, headingColor: "text-pink-400", cards: cards, setCards: setCards },
  //   { titleNum: 2, headingColor: "text-red-400", cards: cards, setCards: setCards },
  //   { titleNum: 3, headingColor: "text-emerald-400", cards: cards, setCards: setCards },
  //   { titleNum: 4, headingColor: "text-blue-400", cards: cards, setCards: setCards },
  // ];
  //  const dealColumnList: ColumnLane[] = [
  //    { titleNum: 1, headingColor: styles.award, cards: cards, setCards: setCards },
  //    { titleNum: 2, headingColor: styles.eighty, cards: cards, setCards: setCards },
  //    { titleNum: 3, headingColor: styles.fifty, cards: cards, setCards: setCards },
  //    { titleNum: 4, headingColor: styles.thirty, cards: cards, setCards: setCards },
  //  ];
  const dealColumnList: ColumnLane[] = [
    {
      titleNum: 1,
      headingColor: styles.award,
      // headingColor: "text-pink-500",
      cards: awardArray ?? [],
      setCards: setCards,
    },
    {
      titleNum: 2,
      headingColor: styles.eighty,
      // headingColor: "text-red-500",
      cards: eightyArray ?? [],
      setCards: setCards,
    },
    {
      titleNum: 3,
      headingColor: styles.fifty,
      // headingColor: "text-emerald-500",
      cards: fiftyArray ?? [],
      setCards: setCards,
    },
    {
      titleNum: 4,
      headingColor: styles.thirty,
      // headingColor: "text-blue-500",
      cards: thirtyArray ?? [],
      setCards: setCards,
    },
  ];

  // 🔹ボードの高さをカラム全体の高さから余白を設けて再計算 cardsの内容が変更されるごとに再計算
  useEffect(() => {}, [cards]);

  // ------------------------ ❌一旦無し❌ ------------------------
  // const [awardColumnInfo, setAwardColumnInfo] = useState<ColumnSizeInfo>({
  //   prevColumnHeight: 0,
  //   columnHeight: 0,
  //   prevRowLength: 0,
  //   rowLength: 0,
  //   isResizedColumnHeight: false,
  // });
  // const [eightyColumnInfo, setEightyColumnInfo] = useState<ColumnSizeInfo>({
  //   prevColumnHeight: 0,
  //   columnHeight: 0,
  //   prevRowLength: 0,
  //   rowLength: 0,
  //   isResizedColumnHeight: false,
  // });
  // const [fiftyColumnInfo, setFiftyColumnInfo] = useState<ColumnSizeInfo>({
  //   prevColumnHeight: 0,
  //   columnHeight: 0,
  //   prevRowLength: 0,
  //   rowLength: 0,
  //   isResizedColumnHeight: false,
  // });
  // const [thirtyColumnInfo, setThirtyColumnInfo] = useState<ColumnSizeInfo>({
  //   prevColumnHeight: 0,
  //   columnHeight: 0,
  //   prevRowLength: 0,
  //   rowLength: 0,
  //   isResizedColumnHeight: false,
  // });

  // const dealColumnList: ColumnLane[] = [
  //   {
  //     titleNum: 1,
  //     headingColor: styles.award,
  //     cards: awardArray ?? [],
  //     setCards: setCards,
  //     columnInfo: awardColumnInfo,
  //     setColumnInfo: setAwardColumnInfo,
  //   },
  //   {
  //     titleNum: 2,
  //     headingColor: styles.eighty,
  //     cards: eightyArray ?? [],
  //     setCards: setCards,
  //     columnInfo: eightyColumnInfo,
  //     setColumnInfo: setEightyColumnInfo,
  //   },
  //   {
  //     titleNum: 3,
  //     headingColor: styles.fifty,
  //     cards: fiftyArray ?? [],
  //     setCards: setCards,
  //     columnInfo: fiftyColumnInfo,
  //     setColumnInfo: setFiftyColumnInfo,
  //   },
  //   {
  //     titleNum: 4,
  //     headingColor: styles.thirty,
  //     cards: thirtyArray ?? [],
  //     setCards: setCards,
  //     columnInfo: awardColumnInfo,
  //     setColumnInfo: setAwardColumnInfo,
  //   },
  // ];

  // それぞれのColumnのheightをインラインスタイルに返す
  // const getColumnHeight = (columnIndex: number) => {
  //   if (columnIndex === 0 && awardColumnInfo.columnHeight !== 0)
  //     return { minHeight: `${awardColumnInfo.columnHeight}px` };
  //   else if (columnIndex === 1 && eightyColumnInfo.columnHeight !== 0)
  //     return { minHeight: `${eightyColumnInfo.columnHeight}px` };
  //   else if (columnIndex === 2 && fiftyColumnInfo.columnHeight !== 0)
  //     return { minHeight: `${fiftyColumnInfo.columnHeight}px` };
  //   else if (columnIndex === 3 && thirtyColumnInfo.columnHeight !== 0)
  //     return { minHeight: `${thirtyColumnInfo.columnHeight}px` };
  //   else {
  //     return {};
  //   }
  // };

  // // 現在のカラムの高さと最大の要素数を格納
  // useEffect(() => {
  //   if (!columnLanesRef.current) return;
  //   if (!columnLanesRef.current[0]) return;
  //   if (!awardArray) return;
  //   // 初回マウント時のカラムの高さを取得して保存
  //   // columnHeightRef.current = columnLanesRef.current[0].offsetHeight;
  //   // setColumnHeight(columnLanesRef.current[0].offsetHeight);
  //   // setPrevColumnHeight(columnLanesRef.current[0].offsetHeight);
  //   const newHeight = columnLanesRef.current[0].offsetHeight;
  //   const maxLength = awardArray.length;
  //   const newInfo = {
  //     ...awardColumnInfo,
  //     prevColumnHeight: newHeight,
  //     columnHeight: newHeight,
  //     prevRowLength: maxLength,
  //     rowLength: maxLength,
  //   };
  //   setAwardColumnInfo(newInfo);
  //   console.log("useEffect高さセット 0", newInfo);
  // }, []);
  // useEffect(() => {
  //   if (!columnLanesRef.current) return;
  //   if (!columnLanesRef.current[1]) return;
  //   if (!eightyArray) return;
  //   // 初回マウント時のカラムの高さを取得して保存
  //   const newHeight = columnLanesRef.current[1].offsetHeight;
  //   const maxLength = eightyArray.length;
  //   const newInfo = {
  //     ...eightyColumnInfo,
  //     prevColumnHeight: newHeight,
  //     columnHeight: newHeight,
  //     prevRowLength: maxLength,
  //     rowLength: maxLength,
  //   };
  //   setEightyColumnInfo(newInfo);
  //   console.log("useEffect高さセット 1", newInfo);
  // }, []);
  // useEffect(() => {
  //   if (!columnLanesRef.current) return;
  //   if (!columnLanesRef.current[2]) return;
  //   if (!fiftyArray) return;
  //   // 初回マウント時のカラムの高さを取得して保存
  //   const newHeight = columnLanesRef.current[2].offsetHeight;
  //   const maxLength = fiftyArray.length;
  //   const newInfo = {
  //     ...fiftyColumnInfo,
  //     prevColumnHeight: newHeight,
  //     columnHeight: newHeight,
  //     prevRowLength: maxLength,
  //     rowLength: maxLength,
  //   };
  //   setFiftyColumnInfo(newInfo);
  //   console.log("useEffect高さセット 2", newInfo);
  // }, []);
  // useEffect(() => {
  //   if (!columnLanesRef.current) return;
  //   if (!columnLanesRef.current[3]) return;
  //   if (!thirtyArray) return;
  //   // 初回マウント時のカラムの高さを取得して保存
  //   // columnHeightRef.current = columnLanesRef.current[0].offsetHeight;
  //   // setColumnHeight(columnLanesRef.current[0].offsetHeight);
  //   // setPrevColumnHeight(columnLanesRef.current[0].offsetHeight);
  //   const newHeight = columnLanesRef.current[3].offsetHeight;
  //   const maxLength = thirtyArray.length;
  //   const newInfo = {
  //     ...thirtyColumnInfo,
  //     prevColumnHeight: newHeight,
  //     columnHeight: newHeight,
  //     prevRowLength: maxLength,
  //     rowLength: maxLength,
  //   };
  //   setThirtyColumnInfo(newInfo);
  //   console.log("useEffect高さセット 3", newInfo);
  // }, []);
  // ------------------------ ❌一旦無し❌ ------------------------

  // ----------------------- 🌟Columnレーン🌟 -----------------------

  // 前回のレーンDOM
  const prevActiveColumnDom = useRef<HTMLDivElement | null>(null);

  // ----------------------- 受Columnレーン Enter -----------------------
  const handleDragEnterColumnLane = ({
    e,
    columnIndex,
    columnTitleNum,
    columnLastCardIndex,
  }: {
    e: DragEvent<HTMLDivElement>;
    columnIndex: number;
    columnTitleNum: number;
    columnLastCardIndex: number;
  }) => {
    // ドラッグ中のカード
    if (!draggingCardElRef.current) return console.log("1");
    if (!draggingCardIndexRef.current) return console.log("1");
    if (!originDraggingCardIndexRef.current) return console.log("1");

    // ------------------------ ❌一旦無し❌ ------------------------
    // if (!isValidNumber(prevDraggingColumnIndexRef.current))
    //   return console.log("1", "前回のカラム", prevDraggingColumnIndexRef.current);

    // // 前回のホバーしていたカラム
    // const { columnInfo: columnInfoPrev, setColumnInfo: setColumnInfoPrev } =
    //   dealColumnList[prevDraggingColumnIndexRef.current!];
    // const {
    //   isResizedColumnHeight: isResizedColumnHeightPrev,
    //   prevRowLength: prevRowLengthPrev,
    //   prevColumnHeight: prevColumnHeightPrev,
    // } = columnInfoPrev;

    // // ドラッグ中の列を格納
    // draggingColumnIndexRef.current = columnIndex;

    // console.log(
    //   "Columnレーン Leave🔹✅",
    //   "前回のカラム",
    //   prevDraggingColumnIndexRef.current,
    //   "Leaveしたカラム",
    //   columnIndex,
    //   "リサイズ中",
    //   isResizedColumnHeightPrev
    // );

    // // 🔹前のカラムと今回のカラムが別で、かつ前回のカラムのisResizedがtrue(最後尾にドラッグしていた)場合は、前のカラムの高さを元に戻す
    // if (prevDraggingColumnIndexRef.current === columnIndex && isResizedColumnHeightPrev) {
    //   // 現在のカラムDOM要素
    //   // const hoveredColumnElPrev = columnLanesRef.current[prevDraggingColumnIndexRef.current!];
    //   // if (!hoveredColumnElPrev) return console.log("1");
    //   const newInfo = {
    //     ...columnInfoPrev,
    //     columnHeight: prevColumnHeightPrev,
    //     isResizedColumnHeight: false,
    //   } as ColumnSizeInfo;
    //   console.log(
    //     "Columnレーン Leave 高さを元に戻す✅",
    //     "前回のcolumnInfo",
    //     columnInfoPrev,
    //     "更新後のcolumnInfo",
    //     newInfo
    //   );
    //   setColumnInfoPrev(newInfo);
    // }

    // // // 高さを戻したらカラムindexをnullに変更
    // // prevDraggingColumnIndexRef.current = null;

    // ------------------------ ❌一旦無し❌ ------------------------

    // Columnレーンをアクティブにする前に前回のactiveなColumnと異なるColumnかチェック
    if (prevActiveColumnDom.current) {
      const isSameColumn = Number(prevActiveColumnDom.current.dataset.columnTitle) === columnTitleNum;
      if (
        !isSameColumn &&
        prevActiveColumnDom.current &&
        prevActiveColumnDom.current.classList.contains(styles.active)
      ) {
        prevActiveColumnDom.current.classList.remove(`${styles.active}`);
      }
    }

    // Columnレーンをアクティブ
    const hoveredColumn = columnLanesRef.current[columnIndex];
    if (!hoveredColumn) return;

    if (!hoveredColumn.classList.contains(styles.active)) {
      hoveredColumn.classList.add(`${styles.active}`);
      // activeにしたカラムを記憶
      prevActiveColumnDom.current = hoveredColumn as HTMLDivElement;
    }

    // 最下部以下にドラッグしている場合は末尾のインジケータをactiveに更新
    // 現在のポインターの位置からとカードのtopまで距離をオフセットtopの位置
    const draggingCardTop = e.clientY - offsetDragCardPositionRef.current.y;

    // 最後のカード
    // const lastCardInCurrentColumn = lastIndicators.current[columnIndex];
    const lastCardInCurrentColumn = hoveredColumn.querySelector(`.${styles.row_card}.last`);

    if (!lastCardInCurrentColumn) {
      // 前回のインジケータのactiveクラスを削除
      // if (!boardRef.current) return;
      // const activeIndicatorAll = boardRef.current.querySelectorAll(`.${styles.drop_indicator}.${styles.active}`);
      const activeIndicator = prevIndicatorRef.current;
      console.log(
        "Columnレーン Enter 最後のカード無し!!!!!!!!!!!✅ indexをrowIndex-1で格納 activeIndicator",
        activeIndicator
      );
      if (activeIndicator && activeIndicator.classList.contains(styles.active)) {
        activeIndicator.classList.remove(styles.active);
      }

      // 末尾のインジケータをアクティブに
      const lastIndicator = hoveredColumn.querySelector(`.${styles.drop_indicator}.last`);
      if (lastIndicator && !lastIndicator.classList.contains(styles.active)) {
        lastIndicator.classList.add(`${styles.active}`);
        prevIndicatorRef.current = lastIndicator as HTMLDivElement;
      }
      // ドラッグ中の列行indexを現在ホバー中のカラムと末尾に設定
      draggingCardIndexRef.current = {
        currentColumnIndex: columnIndex,
        currentRowIndex: -1,
      };
      return;
    }
    // const lastCardBottomInCurrentColumn = lastCardInCurrentColumn.getBoundingClientRect().bottom;
    // if (!lastCardBottomInCurrentColumn) return;
    const lastCardTopInCurrentColumn = lastCardInCurrentColumn.getBoundingClientRect().top;
    if (!lastCardTopInCurrentColumn) return;

    console.log(
      "Columnレーン Enter 変更前ドラッグ中のindex",
      draggingCardIndexRef.current,
      "ホバー中のカラムindex",
      columnIndex,
      "前回のカラムindex",
      prevDraggingColumnIndexRef.current,
      "最後のカードTop",
      lastCardTopInCurrentColumn,
      "ドラッグ中のカードTop",
      draggingCardTop
    );

    // 末尾のカードの最下部よりドラッグ中のカードの上部が下の場合は末尾のインジケータをactiveにする
    // 初期位置が別のカラムの場合で、かつ既にホバー先のカラムの最終カードindexとドラッグ中のrowIndexが同じ場合は-1せずリターン
    if (
      originDraggingCardIndexRef.current.originColumnIndex !== columnIndex &&
      draggingCardIndexRef.current.currentRowIndex === columnLastCardIndex
    ) {
      console.log(
        "Columnレーン Enter ✅既に最後のindexのため-1せずリターン",
        draggingCardIndexRef.current,
        "最後のカードindex",
        columnLastCardIndex
      );
      return;
    }
    // ------------------------ ❌一旦無し❌ ------------------------
    // 🔹エンター先が別のカラムで、かつドラッグしている行が最後尾の場合は高さを増やす
    // 現在ホバー中のカラム
    // const { columnInfo, setColumnInfo } = dealColumnList[columnIndex];
    // const { isResizedColumnHeight, rowLength, columnHeight } = columnInfo;
    // ------------------------ ❌一旦無し❌ ------------------------
    if (lastCardTopInCurrentColumn < draggingCardTop) {
      console.log(
        "🔥 Columnレーン 末尾をアクティブに変更",
        lastCardTopInCurrentColumn < draggingCardTop,
        "前回のカラム",
        prevDraggingColumnIndexRef.current,
        "今回のカラム",
        columnIndex
      );

      // ------------------------ ❌一旦無し❌ ------------------------
      // if (prevDraggingColumnIndexRef.current !== columnIndex && !isResizedColumnHeight) {
      //   // 現在のカラムDOM要素
      //   const hoveredColumnEl = columnLanesRef.current[columnIndex];
      //   if (!hoveredColumnEl) return;
      //   // hoveredColumnEl.style.height = `${columnHeightRef.current + draggingCardElRef.current.offsetHeight}px`;
      //   const newInfo = {
      //     ...columnInfo,
      //     columnHeight: columnHeight + draggingCardElRef.current.offsetHeight,
      //     isResizedColumnHeight: true,
      //   } as ColumnSizeInfo;
      //   console.log("高さを更新✅", "現在のcolumnInfo", columnInfo, "更新後のcolumnInfo", newInfo);
      //   setColumnInfo(newInfo);
      // }
      // ------------------------ ❌一旦無し❌ ------------------------

      // 前回のインジケータを非アクティブ化 同じカラムの末尾以外
      if (prevIndicatorRef.current) {
        const isSame =
          Number(prevIndicatorRef.current.dataset.columnIndex) === columnIndex &&
          Number(prevIndicatorRef.current.dataset.rowIndex) === -1;
        if (!isSame && prevIndicatorRef.current && prevIndicatorRef.current.classList.contains(styles.active)) {
          prevIndicatorRef.current.classList.remove(`${styles.active}`);
        }
      }
      const lastIndicator = hoveredColumn.querySelector(`.${styles.drop_indicator}.last`);
      // console.log("✅✅✅✅hoveredColumn", hoveredColumn, "lastIndicator", lastIndicator);
      if (lastIndicator && !lastIndicator.classList.contains(styles.active)) {
        lastIndicator.classList.add(`${styles.active}`);

        prevIndicatorRef.current = lastIndicator as HTMLDivElement;
      }
      // カラム下にホバーしている場合は、ドロップする際に、該当のカラムの末尾に追加する
      if (draggingCardIndexRef.current) {
        // 現在記録しているDOMの列と行
        const draggingColIndex = draggingCardIndexRef.current.currentColumnIndex;
        const draggingRowIndex = draggingCardIndexRef.current.currentRowIndex;

        // 現在ホバー中のカードと現在保持しているDOMの列と行が異なれば更新する
        if (draggingColIndex !== columnIndex || draggingRowIndex !== -1) {
          draggingCardIndexRef.current = {
            currentColumnIndex: columnIndex,
            currentRowIndex: -1,
          };
        }
      }
    }

    // ------------------------ ❌一旦無し❌ ------------------------
    // // 🔹前回のドラッグ中の列を現在の列に更新
    // prevDraggingColumnIndexRef.current = columnIndex;
    // ------------------------ ❌一旦無し❌ ------------------------

    console.log(
      "Columnレーン Enter🔹✅ ドラッグ中のindex",
      draggingCardIndexRef.current,
      "draggingCardTop",
      draggingCardTop,
      "lastCardTopInCurrentColumn",
      lastCardTopInCurrentColumn,
      "更新後の前回のカラムindex",
      prevDraggingColumnIndexRef.current
    );
  };
  // ----------------------- 受Columnレーン Enter -----------------------

  // ----------------------- 受Columnレーン Over -----------------------
  const handleDragOverColumnLane = ({ e, columnIndex }: { e: DragEvent<HTMLDivElement>; columnIndex: number }) => {
    e.preventDefault();
  };
  // ----------------------- 受Columnレーン Drop -----------------------
  // 🌟onDrop
  const handleDropColumnLane = () => {
    console.log("Columnレーン Drop🔹✅");
  };

  // ----------------------- 受Columnレーン onDragLeave -----------------------
  const handleDragLeaveColumnLane = ({
    e,
    columnIndex,
    columnTitleNum,
    columnLastCardIndex,
  }: {
    e: DragEvent<HTMLDivElement>;
    columnIndex: number;
    columnTitleNum: number;
    columnLastCardIndex: number;
  }) => {};

  // ----------------------- 🌟Columnレーン🌟 -----------------------

  // ------------------------------------ 🌟カード関連🌟 ------------------------------------

  // ---------------------------- 🌟カードドラッグスタート🌟 ----------------------------

  const handleDragStartCard = ({
    e,
    card,
    columnIndex,
    rowIndex,
  }: {
    e: DragEvent<HTMLDivElement>;
    card: DealCardType;
    columnIndex: number;
    rowIndex: number;
  }) => {
    // ドラッグ開始時の列と行を保存
    originDraggingCardIndexRef.current = { originColumnIndex: columnIndex, originRowIndex: rowIndex };
    draggingCardIndexRef.current = { currentColumnIndex: columnIndex, currentRowIndex: rowIndex };
    draggingCardObjRef.current = card;
    draggingCardSizeY.current = e.currentTarget.getBoundingClientRect().height;
    // setDraggingCardSizeY(e.currentTarget.getBoundingClientRect().height);
    // ------------------------ ❌一旦無し❌ ------------------------
    // ドラッグ開始時の列を格納
    // prevDraggingColumnIndexRef.current = columnIndex;
    // draggingColumnIndexRef.current = columnIndex;
    // ------------------------ ❌一旦無し❌ ------------------------

    // is_draggingクラス付与
    e.currentTarget.classList.add(styles.is_dragging);

    draggingCardElRef.current = e.currentTarget as HTMLDivElement;

    // 実際にドラッグしたマウスポインタの位置と、実際のカードの左端、上部の差分の距離を記憶しておく(ドラッグ後に使用)
    const cardRect = e.currentTarget.getBoundingClientRect();
    offsetDragCardPositionRef.current = {
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top,
      bottom: cardRect.bottom - e.clientY,
    };

    // e.dataTransfer.setData("cardId", card.id);
    console.log("Rowカード Start🌠 初期位置 columnIndex", columnIndex, "rowIndex", rowIndex);

    // ドラッグ元のドラッグ中のDOMの残像を非表示
    // e.currentTarget.style.display =  'none'

    // // ドラッグ中のカスタムプレビューを設定
    // const draggingCard = document.createElement('div')
    // draggingCard.classList.add(
    //   `${styles.row_card} cursor-grab rounded border border-solid border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing`
    // );
    // // pタグ生成
    // const p = document.createElement("p");
    // p.textContent = card.taskTitle
    // draggingCard.appendChild(p)
  };
  // ---------------------------- ✅主カードドラッグスタート✅ ----------------------------

  // ---------------------------- 🌟受カード Enter🌟 ----------------------------
  // 最終行の-1かどうか
  // const isLast;
  const prevIndicatorRef = useRef<HTMLDivElement | null>(null);
  const prevSpacerRef = useRef<HTMLDivElement | null>(null);
  const handleDragEnterCard = ({
    e,
    card,
    columnTitleNum,
    columnIndex,
    rowIndex,
    columnLastCardIndex,
  }: {
    e: DragEvent<HTMLDivElement>;
    card: DealCardType;
    columnTitleNum: number;
    columnIndex: number;
    rowIndex: number;
    columnLastCardIndex: number;
  }) => {
    console.log(
      "Rowカード Enter 変更前ドラッグ中のindex",
      draggingCardIndexRef.current,
      "ホバー中のindex",
      "columnIndex",
      columnIndex,
      "rowIndex",
      rowIndex,
      "前回のカラム",
      prevDraggingColumnIndexRef.current
    );
    // console.log("handleDragStartCard 🌟カードドラッグエンター hoveredAboveIndicator", hoveredAboveIndicator);

    if (!draggingCardObjRef.current) return;
    if (!draggingCardIndexRef.current) return;
    if (!boardRef.current) return;

    // ドラッグ中のカードより
    const currentColumn = columnLanesRef.current[columnIndex];
    if (!currentColumn) return;

    if (!columnLanesRef.current) return;

    // 最下部以下にドラッグしている場合は末尾のインジケータをactiveに更新
    // 現在のポインターの位置からとカードのtopまで距離をオフセットtopの位置
    const draggingCardTop = e.clientY - offsetDragCardPositionRef.current.y;
    const draggingCardBottom = e.clientY + offsetDragCardPositionRef.current.bottom;

    // 現在のカラム
    const hoveredColumn = columnLanesRef.current[columnIndex];
    if (!hoveredColumn) return;

    // 最後のカード
    const lastCardInCurrentColumn = hoveredColumn.querySelector(`.${styles.row_card}.last`);
    if (!lastCardInCurrentColumn) return;
    const lastCardTopInCurrentColumn = lastCardInCurrentColumn.getBoundingClientRect().top;
    if (!lastCardTopInCurrentColumn) return;
    const lastCardBottomInCurrentColumn = lastCardInCurrentColumn.getBoundingClientRect().bottom;
    if (!lastCardBottomInCurrentColumn) return;

    // 前回のactiveなインジケータを削除するかどうかチェック
    if (prevIndicatorRef.current) {
      const isSame =
        Number(prevIndicatorRef.current.dataset.columnIndex) === columnIndex &&
        Number(prevIndicatorRef.current.dataset.rowIndex) === rowIndex;
      if (!isSame && prevIndicatorRef.current && prevIndicatorRef.current.classList.contains(styles.active)) {
        prevIndicatorRef.current.classList.remove(`${styles.active}`);
      }
    }

    // インジケータをactiveに変更
    // カード上のインジケータをアクティブに
    const aboveIndicator = currentColumn.querySelector(
      `.${styles.drop_indicator}[data-column-index="${columnIndex}"][data-row-index="${rowIndex}"]`
    );
    if (aboveIndicator && !aboveIndicator.classList.contains(styles.active)) {
      aboveIndicator.classList.add(`${styles.active}`);
      // prevインジケータを現在のactiveインジケータに更新
      prevIndicatorRef.current = aboveIndicator as HTMLDivElement;
    }

    // 現在記録しているDOMの列と行
    const draggingColIndex = draggingCardIndexRef.current.currentColumnIndex;
    const draggingRowIndex = draggingCardIndexRef.current.currentRowIndex;

    // 現在ホバー中のカードと現在保持しているDOMの列と行が異なれば更新する
    if (draggingColIndex !== columnIndex || draggingRowIndex !== rowIndex) {
      draggingCardIndexRef.current = {
        currentColumnIndex: columnIndex,
        currentRowIndex: rowIndex,
      };

      // if (prevSpacerRef.current) {
      //   (prevSpacerRef.current as HTMLDivElement).style.height = `0px`;
      // }
      // // 前のスペーサーがあれば高さを0にしてから新たなスペーサーの高さを確保する
      // // 現在のドラッグ中のカードTopがエンターしたカードの下部の位置より上なら上のスペーサー、違うなら下のスペーサーを表示
      // const spacer = currentColumn.querySelector(
      //   `.${styles.spacer}[data-column-index="${columnIndex}"][data-row-index="${rowIndex}"]`
      // );
      // (spacer as HTMLDivElement).style.height = `${draggingCardSizeY.current}px`;
      // prevSpacerRef.current = spacer as HTMLDivElement;
    }

    // ------------------------ ❌一旦無し❌ ------------------------
    // // ドラッグ中の列を格納
    // draggingColumnIndexRef.current = columnIndex;
    // // 現在ホバー中のカラム
    // const { columnInfo, setColumnInfo } = dealColumnList[columnIndex];
    // const { isResizedColumnHeight, rowLength, columnHeight } = columnInfo;

    // // 🔹前のカラムと今回のカラムが一緒で、かつisResizedがtrue(最後尾にドラッグしていた)、かつ今回のrowが最終行でない場合は現在ホバー中のカラムの高さを元に戻す
    // if (
    //   prevDraggingColumnIndexRef.current === columnIndex &&
    //   isResizedColumnHeight &&
    //   draggingCardIndexRef.current.currentRowIndex !== -1
    // ) {
    //   // 現在のカラムDOM要素
    //   const hoveredColumnEl = columnLanesRef.current[columnIndex];
    //   if (!hoveredColumnEl) return;
    //   // hoveredColumnEl.style.height = `${columnHeightRef.current}px`;
    //   const newInfo = {
    //     ...columnInfo,
    //     columnHeight: columnHeight,
    //     // rowLength: RowLength,
    //     isResizedColumnHeight: false,
    //   } as ColumnSizeInfo;
    //   console.log("高さを元に戻す✅", "前回のcolumnInfo", columnInfo, "更新後のcolumnInfo", newInfo);
    //   setColumnInfo(newInfo);
    // }
    // // 🔹前回のドラッグ中の列と現在の列が同じため格納は不要だが格納しておく
    // prevDraggingColumnIndexRef.current = columnIndex;
    // ------------------------ ❌一旦無し❌ ------------------------

    console.log(
      "Rowカード Enter🔥",
      "ドラッグ先のindex",
      "columnIndex",
      columnIndex,
      "rowIndex",
      rowIndex,
      "ドラッグ中のindex",
      draggingCardIndexRef.current,
      "初期位置",
      originDraggingCardIndexRef.current,
      "最後のカードのindex",
      columnLastCardIndex,
      "ドラッグ中のカードTop",
      draggingCardTop,
      "最後のカードのTop",
      lastCardTopInCurrentColumn,
      "ドラッグ中のカードBottom",
      draggingCardBottom,
      "最後のカードのBottom",
      lastCardBottomInCurrentColumn,
      e.clientY,
      "前回のカラム",
      prevDraggingColumnIndexRef.current
    );
  };
  // ---------------------------- ✅受カード Enter✅ ----------------------------
  // ---------------------------- 🌟受カード Over🌟 ----------------------------
  const handleDragOverCard = ({ e }: { e: DragEvent<HTMLDivElement> }) => {
    e.preventDefault();

    // if (rowCardActiveRef.current) return console.log("🔹 Overリターン");

    // const hoveredAboveIndicator = e.currentTarget.previousElementSibling;
    // if (hoveredAboveIndicator && !hoveredAboveIndicator.classList.contains(styles.active)) {
    //   hoveredAboveIndicator.classList.add(`${styles.active}`);
    // }

    // console.log("✅ Over インケータactive");

    // rowCardActiveRef.current = true;
  };
  // ---------------------------- ✅受カード Over✅ ----------------------------
  // ---------------------------- 🌟受カード Leaveホバー🌟 ----------------------------
  const handleDragLeaveCard = ({
    e,
    card,
    columnTitleNum,
    columnIndex,
    rowIndex,
    columnLastCardIndex,
  }: {
    e: DragEvent<HTMLDivElement>;
    card: DealCardType;
    columnTitleNum: number;
    columnIndex: number;
    rowIndex: number;
    columnLastCardIndex: number;
  }) => {
    if (!columnLanesRef.current) return;

    // 最下部以下にドラッグしている場合は末尾のインジケータをactiveに更新
    // 現在のポインターの位置からとカードのtopまで距離をオフセットtopの位置
    const draggingCardTop = e.clientY - offsetDragCardPositionRef.current.y;
    const draggingCardBottom = e.clientY + offsetDragCardPositionRef.current.bottom;

    // 現在のカラム
    const hoveredColumn = columnLanesRef.current[columnIndex];
    if (!hoveredColumn) return;

    // 最後のカード
    const lastCardInCurrentColumn = hoveredColumn.querySelector(`.${styles.row_card}.last`);
    if (!lastCardInCurrentColumn) return;
    const lastCardBottomInCurrentColumn = lastCardInCurrentColumn.getBoundingClientRect().bottom;
    if (!lastCardBottomInCurrentColumn) return;
    const lastCardTopInCurrentColumn = lastCardInCurrentColumn.getBoundingClientRect().top;
    if (!lastCardBottomInCurrentColumn) return;

    console.log(
      "Rowカード Leave🌟",
      "columnIndex",
      columnIndex,
      "rowIndex",
      rowIndex,
      "ドラッグ中のindex",
      draggingCardIndexRef.current,
      "columnLastCardIndex",
      columnLastCardIndex,
      "ドラッグ中のカードTop",
      draggingCardTop,
      "最後のカードのTop",
      lastCardTopInCurrentColumn,
      "ドラッグ中のカードBottom",
      draggingCardBottom,
      "最後のカードのBottom",
      lastCardBottomInCurrentColumn,
      "e.clientY",
      e.clientY,
      "前回のカラム",
      prevDraggingColumnIndexRef.current
    );

    // 最後のカード上部よりドラッグ中のカード上部を下にある(topが超えている)場合、かつ、現在の列が同じで行が最終行の場合は-1
    if (!draggingCardIndexRef.current) return;
    console.log(
      "🔥🔥🔥🔥🔥カード Leave lastCardTopInCurrentColumn < draggingCardTop",
      lastCardTopInCurrentColumn < draggingCardTop,
      "最終カードtop",
      lastCardTopInCurrentColumn,
      "clientY",
      e.clientY,
      "ドラッグtop",
      draggingCardTop
    );
    if (
      draggingCardIndexRef.current.currentColumnIndex === columnIndex &&
      draggingCardIndexRef.current.currentRowIndex === columnLastCardIndex &&
      rowIndex === columnLastCardIndex &&
      draggingCardIndexRef.current.currentRowIndex === rowIndex &&
      lastCardTopInCurrentColumn < draggingCardTop
    ) {
      // 前回のactiveなインジケータを削除するかどうかチェック
      if (prevIndicatorRef.current) {
        prevIndicatorRef.current.classList.remove(`${styles.active}`);
      }
      // 現在のカラム
      const currentColumn = columnLanesRef.current[columnIndex];
      if (!currentColumn) return;

      // インジケータをactiveに変更
      // カード上のインジケータをアクティブに
      const lastIndicator = currentColumn.querySelector(
        `.${styles.drop_indicator}[data-column-index="${columnIndex}"][data-row-index="${-1}"]`
      );
      if (lastIndicator && !lastIndicator.classList.contains(styles.active)) {
        lastIndicator.classList.add(`${styles.active}`);
        // prevインジケータを現在のactiveインジケータに更新
        prevIndicatorRef.current = lastIndicator as HTMLDivElement;
      }

      // 現在ホバー中のカードと現在保持しているDOMの列と行が異なれば更新する
      draggingCardIndexRef.current = {
        currentColumnIndex: columnIndex,
        currentRowIndex: -1,
      };

      // ------------------------ ❌一旦無し❌ ------------------------
      // // ドラッグ中の列を格納
      // draggingColumnIndexRef.current = columnIndex;
      // if (!draggingCardElRef.current) return;
      // // エンター先が別のカラムで、かつ最後尾の場合は記録されてるカラム最大長さと、現在の最大長さが一致する場合のみカラムの高さをドラッグ中のカードの高さ分加算する (columnLastCardIndex + 1はindexで0から始まるので+1)
      // // 🔹エンター先が別のカラムで、かつドラッグしている行が最後尾の場合は高さを増やす
      // // 現在ホバー中のカラム
      // const { columnInfo, setColumnInfo } = dealColumnList[columnIndex];
      // const { isResizedColumnHeight, rowLength, columnHeight } = columnInfo;
      // if (
      //   originDraggingCardIndexRef.current?.originColumnIndex !== columnIndex &&
      //   rowLength - 1 === columnLastCardIndex &&
      //   (draggingCardIndexRef.current.currentRowIndex === -1 ||
      //     draggingCardIndexRef.current.currentRowIndex === columnLastCardIndex) &&
      //   !isResizedColumnHeight
      // ) {
      //   // 現在のカラムDOM要素
      //   const hoveredColumnEl = columnLanesRef.current[columnIndex];
      //   if (!hoveredColumnEl) return;
      //   // hoveredColumnEl.style.height = `${columnHeightRef.current + draggingCardElRef.current.offsetHeight}px`;
      //   const newInfo = {
      //     ...columnInfo,
      //     columnHeight: columnHeight + draggingCardElRef.current.offsetHeight,
      //     isResizedColumnHeight: true,
      //   } as ColumnSizeInfo;
      //   console.log("高さを更新✅", "現在のcolumnInfo", columnInfo, "更新後のcolumnInfo", newInfo);
      //   setColumnInfo(newInfo);
      // }
      // // 🔹前回のドラッグ中の列を現在の列に更新
      // prevDraggingColumnIndexRef.current = columnIndex;
      // ------------------------ ❌一旦無し❌ ------------------------

      return;
    }
  };
  // ---------------------------- ✅受カード Leaveホバー✅ ----------------------------
  // ---------------------------- 🌟主カード End🌟 ----------------------------
  const handleDragEndCard = ({
    e,
    card,
    columnTitleNum,
    columnIndex,
    rowIndex,
    columnLastCardIndex,
  }: {
    e: DragEvent<HTMLDivElement>;
    card: DealCardType;
    columnTitleNum: number;
    columnIndex: number;
    rowIndex: number;
    columnLastCardIndex: number;
  }) => {
    // is_draggingクラス付与
    e.currentTarget.classList.remove(styles.is_dragging);
    console.log(
      "Rowカード End✅",
      "最終ドロップ位置",
      draggingCardIndexRef.current,
      "初回スタート位置",
      originDraggingCardIndexRef.current
    );

    // インジケータのactiveクラスを全て削除
    if (!boardRef.current) return;
    const activeIndicatorAll = boardRef.current.querySelectorAll(`.${styles.drop_indicator}.${styles.active}`);
    // const activeIndicator = prevIndicatorRef.current;
    console.log(
      "Endここまで prevIndicatorRef.current",
      prevIndicatorRef.current,
      "activeIndicatorAll",
      activeIndicatorAll
    );
    if (activeIndicatorAll.length > 0) {
      Array.from(activeIndicatorAll).forEach((activeIndicator) => {
        console.log("Endここまで 削除 activeIndicator.classList", activeIndicator);
        if (activeIndicator.classList.contains(styles.active)) {
          console.log("Endここまで indicatorがアクティブのため削除", activeIndicator.classList);
          activeIndicator.classList.remove(styles.active);
        }
      });
      // 記録用のインジケータをnullにリセット
      prevIndicatorRef.current = null;
    }

    // Columnレーンも非アクティブにリセット
    if (prevActiveColumnDom.current && prevActiveColumnDom.current.classList.contains(styles.active)) {
      prevActiveColumnDom.current.classList.remove(`${styles.active}`);
    }

    // スペーサーもリセット
    if (prevSpacerRef.current) {
      (prevSpacerRef.current as HTMLDivElement).style.height = `0px`;
    }

    // 🔹カード入れ替え
    // ドラッグ元のカードオブジェクト
    const draggingCardObj = draggingCardObjRef.current;
    if (!draggingCardObj) return;
    if (!draggingCardIndexRef.current) return;
    if (!originDraggingCardIndexRef.current) return;

    console.log("Endここまで");

    // ドロップ先のColumnインデックス
    const dropColumnIndex = draggingCardIndexRef.current.currentColumnIndex;
    const dropRowIndex = draggingCardIndexRef.current?.currentRowIndex;
    // 大ラッグ
    const originDragColumnIndex = originDraggingCardIndexRef.current.originColumnIndex;
    const originDragRowIndex = originDraggingCardIndexRef.current.originRowIndex;

    // 🔹ゴミ箱の上でDropした場合はこのままリターン
    if (dropColumnIndex === -3 && dropRowIndex === -3) {
      console.log("End🌟 ゴミ箱エンド", dropColumnIndex, dropRowIndex);
      return;
    }

    // 初回ドラッグ位置と最終ドロップ先の位置が一緒の場合はこのままリターン
    if (dropColumnIndex === originDragColumnIndex && dropRowIndex === originDragRowIndex) {
      console.log(
        "End✅ 元のドラッグ初期位置と一緒のためリターン 列",
        dropColumnIndex,
        originDragColumnIndex,
        "行",
        dropRowIndex,
        originDragRowIndex
      );
      return;
    }
    // 初回カラムとドロップ先のカラムが同じで、rowIndexが１増えてるだけの場合は入れ替え不要なのでリターン
    if (dropColumnIndex === originDragColumnIndex && dropRowIndex === originDragRowIndex + 1) {
      console.log(
        "End✅ rowIndexが1増えてるだけ、入れ替え不要のためリターン 列",
        dropColumnIndex,
        originDragColumnIndex,
        "行",
        dropRowIndex,
        originDragRowIndex
      );
      return;
    }

    // 初回ドラッグ位置が最終行で、初回カラムとドロップカラムが一緒の場合はリターン
    if (
      dropRowIndex === -1 &&
      originDragRowIndex === columnLastCardIndex &&
      originDragColumnIndex === dropColumnIndex
    ) {
      console.log(
        "End✅ 初回ドラッグ位置が最終行で、初回カラムとドロップカラムが一緒の場合はリターン 列",
        dropColumnIndex,
        originDragColumnIndex,
        "行",
        dropRowIndex,
        originDragRowIndex,
        "最終行 columnLastCardIndex",
        columnLastCardIndex
      );
      return;
    }

    // ドロップ先のカラムタイトル
    const dropColumnTitle = mappingColumnIndexToTitle[draggingCardIndexRef.current.currentColumnIndex];
    // ドロップ先の列のカード配列
    const cardListInCurrentColumn = categorizedCardsMapObj.get(dropColumnTitle);
    console.log(
      "Endここまで",
      "mappingColumnIndexToTitle",
      mappingColumnIndexToTitle,
      "categorizedCardsMapObj",
      categorizedCardsMapObj,
      "dropColumnTitle",
      dropColumnTitle
    );
    if (!cardListInCurrentColumn)
      return console.log(
        "End リターン mappingColumnIndexToTitle",
        mappingColumnIndexToTitle,
        "categorizedCardsMapObj",
        categorizedCardsMapObj,
        "dropColumnTitle",
        dropColumnTitle
      );
    // ドロップ先のカードオブジェクト
    let dropCardObj: DealCardType | null;
    // columnIndexが最後の2で、rowIndexが-1だった場合、そのカラムの最後尾に挿入
    if (dropColumnIndex === -1) {
      // 列Indexが2以外は次の列の先頭を指定
      const nextColumnTitle = mappingColumnIndexToTitle[dropColumnIndex + 1];
      // 次のカラムのカードリスト
      const cardListInNextColumn = categorizedCardsMapObj.get(nextColumnTitle);
      const firstCardObjInNextColumn = !!cardListInNextColumn?.length ? cardListInNextColumn[0] : null;
      dropCardObj = firstCardObjInNextColumn;
    }
    // 最後尾以外
    else {
      dropCardObj = cardListInCurrentColumn[dropRowIndex];
    }

    // ------------------------ ❌一旦無し❌ ------------------------
    // // 1. 別のカラムの最終行にドロップされた場合は、その列のサイズをドラッグ要素の高さ分heightを加算し、
    // // 2. 最終行が開始位置で、別のカラムの行にドロップされた場合は開始位置の列の高さをドラッグ要素の高さ分引き算する
    // // ドラッグ中の列を格納
    // draggingColumnIndexRef.current = columnIndex;
    // // ドロップされたカラムinfo
    // const { columnInfo, setColumnInfo } = dealColumnList[dropColumnIndex];
    // const { isResizedColumnHeight, columnHeight, prevColumnHeight, rowLength, prevRowLength } = columnInfo;
    // // ドラッグ元のカラムinfo
    // const { columnInfo: columnInfoOrigin, setColumnInfo: setColumnInfoOrigin } = dealColumnList[originDragColumnIndex];

    // // 1. 加算 カラム高さ、長さ
    // if (
    //   originDragColumnIndex !== dropColumnIndex &&
    //   isResizedColumnHeight &&
    //   (dropRowIndex === -1 || dropRowIndex === rowLength - 1)
    // ) {
    //   // 現在のカラムDOM要素
    //   // const hoveredColumnEl = columnLanesRef.current[dropColumnIndex];
    //   // if (!hoveredColumnEl) return;
    //   const newInfo = {
    //     rowLength: columnHeight + 1,
    //     prevRowLength: columnHeight + 1,
    //     columnHeight: columnHeight,
    //     prevColumnHeight: columnHeight,
    //     isResizedColumnHeight: false,
    //   } as ColumnSizeInfo;
    //   console.log("高さと最大長を更新", "前回のcolumnInfo", columnInfo, "更新後のcolumnInfo", newInfo);
    //   setColumnInfo(newInfo);
    // }
    // // 2. 引き算 カラム高さ、長さ
    // else if (
    //   (originDragRowIndex === -1 || originDragRowIndex === rowLength - 1) &&
    //   originDragColumnIndex !== dropColumnIndex
    // ) {
    //   if (!draggingCardElRef.current) return;
    //   // 現在のカラムDOM要素
    //   // const originColumnEl = columnLanesRef.current[originDragColumnIndex];
    //   // if (!originColumnEl) return;
    //   const newInfo = {
    //     rowLength: columnInfoOrigin.columnHeight - 1,
    //     prevRowLength: columnInfoOrigin.columnHeight - 1,
    //     columnHeight: columnInfoOrigin.columnHeight - draggingCardElRef.current.offsetHeight,
    //     prevColumnHeight: columnInfoOrigin.columnHeight - draggingCardElRef.current.offsetHeight,
    //     isResizedColumnHeight: false,
    //   } as ColumnSizeInfo;
    //   console.log("高さと最大長を更新", "前回のcolumnInfo", columnInfo, "更新後のcolumnInfo", newInfo);
    //   setColumnInfoOrigin(newInfo);
    // }
    // // ドラッグindexをnullに
    // draggingColumnIndexRef.current = null;
    // prevDraggingColumnIndexRef.current = null;
    // ------------------------ ❌一旦無し❌ ------------------------

    console.log("Endここまで");

    // 🔹更新
    // setCards((prev) => {
    //   const newCards = [...prev];
    //   // ドラッグしてるカードを削除して、ドロップした位置に挿入
    //   const deleteAt = newCards.findIndex((card) => card.property_id === draggingCardObj.property_id);
    //   const deleteCard = newCards.splice(deleteAt, 1)[0];
    //   const newInsertCard = {
    //     property_id: deleteCard.property_id,
    //     company_name: deleteCard.company_name,
    //     company_department_name: deleteCard.company_department_name,
    //     column_title_num: dropColumnTitle,
    //   } as DealCardType;

    //   if (draggingCardIndexRef.current?.currentRowIndex === -1) {
    //     newCards.push(newInsertCard);
    //   } else {
    //     const insertAt = newCards.findIndex((card) => card.property_id === (dropCardObj as DealCardType).property_id);
    //     if (insertAt === -1) {
    //       // ドロップ先のカードが見つからない場合は末尾に追加
    //       newCards.push(newInsertCard);
    //     } else {
    //       newCards.splice(insertAt, 0, newInsertCard);
    //     }
    //   }

    //   return newCards;
    // });

    const newCards = [...cards];
    // ドラッグしてるカードを削除して、ドロップした位置に挿入
    const deleteAt = newCards.findIndex((card) => card.property_id === draggingCardObj.property_id);
    const deleteCard = newCards.splice(deleteAt, 1)[0];
    const newInsertCard = {
      property_id: deleteCard.property_id,
      company_name: deleteCard.company_name,
      company_department_name: deleteCard.company_department_name,
      column_title_num: dropColumnTitle,
    } as DealCardType;

    if (draggingCardIndexRef.current?.currentRowIndex === -1) {
      newCards.push(newInsertCard);
    } else {
      const insertAt = newCards.findIndex((card) => card.property_id === (dropCardObj as DealCardType).property_id);
      if (insertAt === -1) {
        // ドロップ先のカードが見つからない場合は末尾に追加
        newCards.push(newInsertCard);
      } else {
        newCards.splice(insertAt, 0, newInsertCard);
      }
    }
    setCards(newCards);
    setUpdateCardsMapTrigger(Date.now()); // メモ化したMapオブジェクトを再計算して生成

    // トーストを表示
    toast.success(
      `${deleteCard.company_name}を${mappingOrderCertaintyStartOfMonthToast[dropColumnTitle][language]}に変更しました🌟`
    );

    /**
     *  console.log(
        "🌟🌟🌟🌟更新",
        "prev",
        prev,
        "newCards",
        newCards,
        "deleteAt",
        deleteAt,
        "deleteCard",
        deleteCard,
        "insertAt",
        insertAt,
        "dropCardObj",
        dropCardObj,
        "draggingCardObj",
        draggingCardObj
      );
     */
  };
  // ---------------------------- ✅主カード End✅ ----------------------------

  // ----------------------------- ✅Column関連✅

  /* ------------------- 🌟AddCard🌟 ------------------- */
  // const [text, setText] = useState("");
  // const [adding, setAdding] = useState(false);

  // const handleSubmit = ({ e, columnTitle }: { e: FormEvent; columnTitle: string }) => {
  //   e.preventDefault();

  //   if (!text.trim().length) return setAdding(false);

  //   const newCard = {
  //     id: Math.random().toString(),
  //     taskTitle: text.trim(),
  //     contents: null,
  //     columnTitle: columnTitle,
  //   };

  //   setCards((pv) => [...pv, newCard]);

  //   setText("");
  //   setAdding(false);
  // };
  /* ------------------- ✅AddCard✅ ここまで ------------------- */

  /* ---------------------------------- 🌟ゴミ箱🌟 ---------------------------------- */
  // --------------- ゴミ箱 受 Enter ---------------
  const handleDragEnterTrash = (e: DragEvent<HTMLDivElement>) => {
    draggingCardIndexRef.current = {
      currentColumnIndex: -3,
      currentRowIndex: -3,
    };
    console.log("ゴミ箱Enter🌟", draggingCardIndexRef.current);

    if (trashAreaRef.current && !trashAreaRef.current.classList.contains(styles.active)) {
      trashAreaRef.current?.classList.add(`${styles.active}`);
    }
    if (trashIconRef.current && burnBarrelIconRef.current) {
      trashIconRef.current.style.display = "none";
      burnBarrelIconRef.current.style.display = "block";
    }

    // Columnレーンを非アクティブにする
    if (prevActiveColumnDom.current && prevActiveColumnDom.current.classList.contains(styles.active)) {
      prevActiveColumnDom.current.classList.remove(`${styles.active}`);
    }

    // インジケータを非アクティブ
    if (prevIndicatorRef.current && prevIndicatorRef.current.classList.contains(styles.active)) {
      prevIndicatorRef.current.classList.remove(`${styles.active}`);
    }
  };
  // --------------- ゴミ箱 受 Enter ここまで ---------------

  // --------------- ゴミ箱 受 Over ---------------
  const handleDragOverTrash = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  // --------------- ゴミ箱 受 Over ここまで ---------------

  // --------------- ゴミ箱 受 Leave ---------------
  const handleDragLeaveTrash = (e: DragEvent<HTMLDivElement>) => {
    if (originDraggingCardIndexRef.current) {
      draggingCardIndexRef.current = {
        currentColumnIndex: originDraggingCardIndexRef.current.originColumnIndex,
        currentRowIndex: originDraggingCardIndexRef.current.originRowIndex,
      };
    }
    console.log("ゴミ箱Leave🌟", draggingCardIndexRef.current);

    if (trashAreaRef.current && trashAreaRef.current.classList.contains(styles.active)) {
      trashAreaRef.current?.classList.remove(`${styles.active}`);
    }
    if (trashIconRef.current && burnBarrelIconRef.current) {
      trashIconRef.current.style.display = "block";
      burnBarrelIconRef.current.style.display = "none";
    }
  };
  // --------------- ゴミ箱 受 Leave ここまで ---------------

  // --------------- ゴミ箱 受 Drop ---------------
  const handleDropTrash = () => {
    console.log("ゴミ箱ドロップ🌟");

    // インジケータのactiveクラスを全て削除
    if (!boardRef.current) return;
    const activeIndicatorAll = boardRef.current.querySelectorAll(`.${styles.drop_indicator}.${styles.active}`);
    // const activeIndicator = prevIndicatorRef.current;
    console.log(
      "ゴミ箱ドロップ ここまで prevIndicatorRef.current",
      prevIndicatorRef.current,
      "activeIndicatorAll",
      activeIndicatorAll
    );
    if (activeIndicatorAll.length > 0) {
      Array.from(activeIndicatorAll).forEach((activeIndicator) => {
        console.log("Endここまで 削除 activeIndicator.classList", activeIndicator);
        if (activeIndicator.classList.contains(styles.active)) {
          console.log("Endここまで indicatorがアクティブのため削除", activeIndicator.classList);
          activeIndicator.classList.remove(styles.active);
        }
      });
      // 記録用のインジケータをnullにリセット
      prevIndicatorRef.current = null;
    }

    if (trashAreaRef.current && trashAreaRef.current.classList.contains(styles.active)) {
      trashAreaRef.current?.classList.remove(`${styles.active}`);
    }
    if (trashIconRef.current && burnBarrelIconRef.current) {
      trashIconRef.current.style.display = "block";
      burnBarrelIconRef.current.style.display = "none";
    }

    const deleteCardObj = draggingCardObjRef.current;

    if (!deleteCardObj) return;

    const cardIdsMapObj = new Map(cards.map((obj) => [obj.property_id, obj]));

    cardIdsMapObj.delete(deleteCardObj.property_id);

    // 削除
    // setCards((pv) => pv.filter((c) => c.id !== deleteCardObj.id));
    setCards(Array.from(cardIdsMapObj.values()));

    // トーストを表示
    toast.success(`${deleteCardObj.company_name}を案件没に変更しました。`);
  };
  // --------------- ゴミ箱 受 Drop ここまで ---------------
  /* ---------------------------------- ✅ゴミ箱✅ ---------------------------------- */

  console.log(
    "DealBoardレンダリング",
    "cards",
    cards,
    "categorizedCardsMapObj",
    categorizedCardsMapObj,
    "dealColumnList",
    dealColumnList
  );

  const getCardStyle = () => {};

  const [animate, setAnimate] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // コンポーネントがマウントされたらアニメーションを開始
    setAnimate(true);

    // 2秒後にはフェードアニメーションを削除
    setTimeout(() => {
      setIsMounted(true);
      setAnimate(false);
    }, 2000);
  }, []);

  return (
    <>
      {/* ------------------------ ボード ------------------------ */}
      <div ref={boardRef} className={`${styles.board} flex  w-full overflow-scroll p-[48px]`}>
        {/* ------------ Columnレーングループ ------------ */}
        {dealColumnList.map((column: ColumnLane, columnIndex: number) => {
          // const filteredCards = categorizedCardsMapObj.get(column.titleNum);
          const filteredCards = column.cards;
          console.log("filteredCards", filteredCards, "column.title", column.titleNum);
          if (!filteredCards) return;
          if (!column.titleNum) return;

          const columnTitle = mappingOrderCertaintyStartOfMonth[column.titleNum][language];

          return (
            <div
              key={"column" + columnTitle}
              ref={(ref) => (columnLanesRef.current[columnIndex] = ref)}
              className={`${styles.column} ${animate ? `${styles.animate}` : ``} ${
                isMounted ? `${styles.is_mount}` : ``
              } ${columnIndex === 3 ? `${styles.last}` : ``} ${column.headingColor}  w-56 shrink-0`}
              // style={getColumnHeight(columnIndex)}
            >
              {/* ------------ Columnタイトル ------------ */}
              <div className={`${styles.title_area} mb-3 flex items-center justify-between`}>
                <h3 className={`font-medium ${column.headingColor}`}>{columnTitle}</h3>
                <span className={`${styles.card_count} rounded text-sm text-neutral-400`}>{filteredCards.length}</span>
              </div>
              {/* ------------ Columnレーン ------------ */}
              <div
                // ref={(ref) => (columnLanesRef.current[columnIndex] = ref)}
                data-column-title={column.titleNum}
                onDrop={(e) => handleDropColumnLane()}
                onDragEnter={(e) =>
                  handleDragEnterColumnLane({
                    e: e,
                    columnIndex: columnIndex,
                    columnTitleNum: column.titleNum,
                    columnLastCardIndex: filteredCards.length - 1,
                  })
                }
                onDragOver={(e) => handleDragOverColumnLane({ e: e, columnIndex: columnIndex })}
                onDragLeave={(e) =>
                  handleDragLeaveColumnLane({
                    e: e,
                    columnIndex: columnIndex,
                    columnTitleNum: column.titleNum,
                    columnLastCardIndex: filteredCards.length - 1,
                  })
                }
                className={`${styles.column_lane}  h-full w-full transition-colors`}
              >
                {/* ------------ Rowグループ ------------ */}
                {filteredCards.map((card: DealCardType, rowIndex: number) => {
                  return (
                    <Fragment key={"row_card" + card.property_id}>
                      {/* Row上インジケータ */}
                      <div
                        data-indicator-id={card.property_id}
                        data-column={card.column_title_num}
                        data-column-index={columnIndex}
                        data-row-index={rowIndex}
                        // className={`${styles.drop_indicator} my-0.5 h-0.5 min-h-[2px] w-full bg-violet-400 opacity-0`}
                        className={`${styles.drop_indicator} pointer-events-none my-0.5 h-0.5 min-h-[2px] w-full  opacity-0`}
                      />
                      {/* Row上インジケータ ここまで */}
                      {/* スペーサーtop ドラッグ位置に空間を空ける用 */}
                      {/* <div
                        data-column-index={columnIndex}
                        data-row-index={rowIndex}
                        className={`${styles.spacer} top h-0 w-full rounded`}
                      ></div> */}
                      {/* スペーサーtop */}
                      {/* Rowカード */}
                      <div
                        ref={(ref) => (rowCardsRef.current[rowIndex] = ref)}
                        draggable={true}
                        data-card-column-title={card.column_title_num}
                        data-card-row-index={rowIndex}
                        className={`${styles.row_card} ${animate ? `${styles.fade_in}` : ``} ${
                          isMounted ? `${styles.is_mount}` : ``
                        }  cursor-grab rounded border border-solid border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing  ${
                          rowIndex === filteredCards.length - 1 ? `last` : ``
                        }`}
                        style={{ ...(animate && { animationDelay: `${(rowIndex + 1) * 0.3}s` }) }} // 各カードのアニメーションの遅延を設定
                        onClick={() => {
                          setEditedDealCard(card);
                          setIsOpenEditModal(true);
                        }}
                        onDragStart={(e) =>
                          handleDragStartCard({ e: e, card: card, columnIndex: columnIndex, rowIndex: rowIndex })
                        }
                        onDragEnter={(e) =>
                          handleDragEnterCard({
                            e: e,
                            card: card,
                            columnTitleNum: card.column_title_num,
                            columnIndex: columnIndex,
                            rowIndex: rowIndex,
                            columnLastCardIndex: filteredCards.length - 1,
                          })
                        }
                        onDragOver={(e) =>
                          handleDragOverCard({
                            e: e,
                          })
                        }
                        onDragLeave={(e) =>
                          handleDragLeaveCard({
                            e: e,
                            card: card,
                            columnTitleNum: card.column_title_num,
                            columnIndex: columnIndex,
                            rowIndex: rowIndex,
                            columnLastCardIndex: filteredCards.length - 1,
                          })
                        }
                        onDragEnd={(e) =>
                          handleDragEndCard({
                            e: e,
                            card: card,
                            columnTitleNum: card.column_title_num,
                            columnIndex: columnIndex,
                            rowIndex: rowIndex,
                            columnLastCardIndex: filteredCards.length - 1,
                          })
                        }
                      >
                        <p className={`pointer-events-none whitespace-pre-wrap text-sm`}>{card.company_name}</p>
                      </div>
                      {/* Rowカード ここまで */}
                    </Fragment>
                  );
                })}
                {/* ------------ Rowグループ ここまで ------------ */}
                {/* ------------ 末尾インジケータ ------------ */}
                <div
                  ref={(ref) => (lastIndicators.current[columnIndex] = ref)}
                  data-column={column.titleNum.toString() + "_last"}
                  data-column-index={columnIndex}
                  data-row-index={-1}
                  className={`${styles.drop_indicator} last pointer-events-none my-0.5 h-0.5 w-full bg-violet-400 opacity-0`}
                />
                {/* ------------ 末尾インジケータ ここまで ------------ */}
                {/* スペーサーtop ドラッグ位置に空間を空ける用 */}
                {/* <div className={`${styles.spacer} bottom pointer-events-none h-[24px] w-full rounded`}></div> */}
                <div className={`${styles.spacer} bottom pointer-events-none h-[90px] w-full rounded`}></div>
                {/* <div
                        data-column-index={columnIndex}
                        data-row-index={rowIndex}
                        className={`${styles.spacer} top h-0 w-full rounded`}
                      ></div> */}
                {/* スペーサーtop */}
                {/* ------------------- Addカードボタン ------------------- */}
                {/* <AddCard setCards={setCards} columnTitle={column.title} /> */}
                {/* ------------------- Addカードボタン ここまで ------------------- */}
              </div>
            </div>
          );
        })}
        {/* ------------ Columnレーングループ ------------ */}
        {/* ------------------- ゴミ箱レーン ------------------- */}
        {/* <BurnBarrel setCards={setCards} /> */}
        <div
          ref={trashAreaRef}
          onDrop={handleDropTrash}
          onDragEnter={handleDragEnterTrash}
          onDragOver={handleDragOverTrash}
          onDragLeave={handleDragLeaveTrash}
          // className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border border-solid text-3xl ${
          //   active ? `border-red-800 bg-red-800/20 text-red-500` : `border-neutral-500 bg-neutral-500/20 text-neutral-500`
          // }`}
          className={`${styles.barrel} mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border border-solid text-3xl`}
        >
          <div ref={trashIconRef} className={`${styles.trash_icon} pointer-events-none`}>
            <FiTrash />
          </div>
          <div ref={burnBarrelIconRef} className={`${styles.fire_icon} pointer-events-none`}>
            <FaFire className={`animate-bounce`} />
          </div>
        </div>
        {/* ------------------- ゴミ箱レーン ここまで ------------------- */}
        {/* ------------------- 編集モーダル ------------------- */}
        {isOpenEditModal && editedDealCard && <EditModalDealCard setIsOpenEditModal={setIsOpenEditModal} />}
        {/* ------------------- 編集モーダル ここまで ------------------- */}
      </div>
      {/* ------------------------ ボード ここまで ------------------------ */}
    </>
  );
};

export const DealBoard = memo(DealBoardMemo);
