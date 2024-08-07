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
import { FaFire, FaRegStar, FaStar } from "react-icons/fa";
import { AddCard } from "./AddCard";
import { EditModalDealCard } from "../EditModalDealCard/EditModalDealCard";
import useDashboardStore from "@/store/useDashboardStore";
import { mappingOrderCertaintyStartOfMonth, mappingOrderCertaintyStartOfMonthToast } from "@/utils/selectOptions";
import useStore from "@/store";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { toast } from "react-toastify";
import { splitCompanyNameWithPosition } from "@/utils/Helpers/splitCompanyName";
import { MdOutlineMoreTime } from "react-icons/md";
import { ImFire, ImInfo } from "react-icons/im";
import { AiFillFire, AiOutlineFire } from "react-icons/ai";
import { BsFire } from "react-icons/bs";
import { DealCardType, MemberAccounts, MemberAccountsDealBoard } from "@/types";
import { companyColumnHeaderItemListData } from "@/utils/companyColumnHeaderItemListData";
import { SEED_CARDS } from "./data";
import { format } from "date-fns";
import { useQueryDealCards } from "@/hooks/useQueryDealCards";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { runFireworks } from "@/utils/confetti";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { TbSnowflake, TbSnowflakeOff } from "react-icons/tb";
import { ProgressCircle } from "@/components/Parts/Charts/ProgressCircle/ProgressCircle";
import { ProgressNumber } from "@/components/Parts/Charts/ProgressNumber/ProgressNumber";
import { AvatarIcon } from "@/components/Parts/AvatarIcon/AvatarIcon";
import { FallbackDealBoard } from "./FallbackDealBoard";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import Decimal from "decimal.js";

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

// type DealCardType = {
//   property_id: string;
//   company_name: string; // 会社名
//   company_department_name: string | null; // 部署名
//   column_title_num: number; // 月初確度 or 中間確度 中間確度があればこちらを優先
//   expansion_year_month: number; // 展開日付 => 当月発生の場合はネタ外として扱う
//   rejected_flag: boolean; // 物件没フラグ => 没の場合は、その確度の最後尾に並べて、斜線を引きdraggableをfalseにする
//   pending_flag: boolean; // ペンディングフラグ => 没の場合は、その確度の最後尾に並べて、斜線を引きdraggableをfalseにする
// };

// const propertyColumnNameObj: { [key: string]: any } = companyColumnHeaderItemListData.reduce((acc, obj) => {
//   const newObj = { [obj.columnName]: null };
//   acc[obj.columnName] = newObj;
//   return acc;
// }, {} as { [key: string]: any });

// 列のインデックスとタイトルのマッピング
const mappingColumnIndexToTitle: { [key: number]: number } = {
  0: 1, //"A (受注済み)"
  1: 2, //"○ (80%以上の確率で受注)"
  2: 3, //"△ (50%以上の確率で受注)"
  3: 4, //"▲ (30%以上の確率で受注)"
};

// 担当者idや事業部idなどのエンティティのidとタイプをPropsで受け取る
type Props = {
  companyId: string;
  userId: string;
  // memberObj: MemberAccounts & {
  memberObj: MemberAccountsDealBoard & {
    company_id: string;
    company_name: string;
    current_sales_amount: number | null;
    current_sales_target: number | null;
    current_achievement_rate: number | null;
  };
  stickyRow: string | null;
  setStickyRow: Dispatch<SetStateAction<string | null>>;
  // periodType: string;
  // period: number;
  onFetchComplete?: () => void;
  fetchEnabled?: boolean; // trueに変更されたらフェッチを許可する
  isRenderProgress?: boolean; // ProgressCircleレンダリングを許可
};

const DealBoardMemo = ({
  companyId,
  userId,
  memberObj,
  stickyRow,
  setStickyRow,
  onFetchComplete,
  fetchEnabled,
  isRenderProgress,
}: Props) => {
  const language = useStore((state) => state.language);
  // const [cards, setCards] = useState<DealCardType[]>([]);

  // 受注済み変更後に売上入力モーダルへの遷移のためのグローバルstate
  const setIsOpenCongratulationsModal = useDashboardStore((state) => state.setIsOpenCongratulationsModal);
  // const setIsOpenUpdatePropertyModal = useDashboardStore((state) => state.setIsOpenUpdatePropertyModal);
  const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);
  // ローカルstateをリフレッシュ(選択中のカードの最新状態を反映)
  const isRequiredRefreshDealCards = useDashboardStore((state) => state.isRequiredRefreshDealCards);
  const setIsRequiredRefreshDealCards = useDashboardStore((state) => state.setIsRequiredRefreshDealCards);
  const isRequiredInputSoldProduct = useDashboardStore((state) => state.isRequiredInputSoldProduct);
  const isOpenDealCardModal = useDashboardStore((state) => state.isOpenDealCardModal);
  // A受注済み => 他に移った時に売上データをリセットするかどうか確認モーダル
  const setIsOpenResetSalesConfirmationModal = useDashboardStore((state) => state.setIsOpenResetSalesConfirmationModal);

  const activePeriodSDB = useDashboardStore((state) => state.activePeriodSDB);
  const selectedFiscalYearTargetSDB = useDashboardStore((state) => state.selectedFiscalYearTargetSDB);

  // 選択されたメンバーのidをDealBoardにpropsで渡す
  const activeThemeColor = useDashboardStore((state) => state.activeThemeColor);

  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();

  if (!activePeriodSDB) return null;
  if (!companyId || !userId) return null;

  const periodType = activePeriodSDB.periodType;
  const period = activePeriodSDB.period;

  // ---------------------------- useQuery ----------------------------
  // 🔸Propsで受け取ったuserIdを使ってuseQueryで指定された期間のネタリストを取得し、useEffectでcardsのローカルstateに格納
  // cards変更の度にDBを更新とともにqueryClient.setQueryDataでキャッシュを更新していく
  // useQueryで指定された期間とエンティティのネタを取得してローカルstateに格納

  // ・メンバー：userId
  // ・現ステータス：「展開・申請・受注」
  // ・期間：period「年月度」 or 「四半期」 or 「半期」 or 「年度」

  const [cards, setCards] = useState<DealCardType[]>([]);
  const [isMountedQuery, setIsMountedQuery] = useState(false);

  // 現在のA(受注済み)の売上金額の合計をProgressNumberに渡して達成率と同時に更新する
  // const [awardSalesAmount, setAwardSalesAmount] = useState(0);

  const awardSalesAmount = useMemo(() => {
    if (!cards) return 0;
    if (cards.length === 0) return 0;

    // 売上日付は未定で受注する場合もあるため、フィルター条件は売上日付を除く
    // 「月初確度 or 中間見直確度」「現ステータス」「売上金額」「売上商品」
    // const awardCards = cards.filter(
    //   (card) =>
    //     (!!card.review_order_certainty
    //       ? card.review_order_certainty === 1
    //       : card.order_certainty_start_of_month === 1) &&
    //     card.current_status === "D Order Received" &&
    //     card.sales_price !== null &&
    //     card.sold_product !== null
    // );

    // 「現ステータス」「売上金額」「売上商品」のみを売上済みフィルター条件として「月初確度 or 中間見直確度」は条件に入れない
    const awardCards = cards.filter(
      (card) =>
        (!!card.order_certainty_start_of_month || !!card.review_order_certainty) &&
        card.current_status === "D Order Received" &&
        card.sales_price !== null &&
        card.sold_product !== null
    );

    let _salesAmount = 0;
    if (awardCards && awardCards.length >= 1) {
      awardCards.forEach((card) => {
        if (isValidNumber(card.sales_price)) {
          _salesAmount += Number(card.sales_price) ?? 0;
        }
      });
    }

    const formattedAmount = Number(_salesAmount.toFixed(0));

    console.log(
      "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥awardCards",
      awardCards,
      "cards",
      cards,
      "_salesAmount",
      _salesAmount,
      "formattedAmount",
      formattedAmount,
      `${memberObj.profile_name}`
    );

    return formattedAmount;
  }, [cards]);

  const achievementRate = useMemo(() => {
    if (!awardSalesAmount) return null;
    if (!memberObj?.current_sales_target) return null;

    const salesAmountDecimal = new Decimal(awardSalesAmount);
    const targetDecimal = new Decimal(memberObj?.current_sales_target);

    if (targetDecimal.isZero()) return null;

    return Number(salesAmountDecimal.dividedBy(targetDecimal).times(100).toFixed(0, Decimal.ROUND_HALF_UP)) ?? null;
  }, [awardSalesAmount, memberObj?.current_sales_target]);

  // 現在のクエリキー(queryKey) キャッシュ更新時に使用
  const currentQueryKey = ["deals", userId, periodType, period];

  // 期間変更時のローディング
  const isLoadingSDB = useDashboardStore((state) => state.isLoadingSDB);

  const {
    data: queryData,
    error,
    isLoading: isLoadingQuery,
    isSuccess,
  } = useQueryDealCards({
    companyId,
    userId,
    periodType,
    period,
    isReady: fetchEnabled,
  });

  if (error) return null;

  // 🌟ローカルstateに格納
  useEffect(() => {
    if (isMountedQuery) return; // 既にマウント済みの場合はリターン

    // 期間変更中はリターン
    if (isLoadingSDB) return;
    if (isLoadingQuery) return;

    if (isSuccess) {
      const initialCards = !!queryData?.length
        ? queryData.map((obj, index) => {
            const newColumnTitleNum = !!obj?.review_order_certainty
              ? obj.review_order_certainty
              : !!obj?.order_certainty_start_of_month
              ? obj.order_certainty_start_of_month
              : null;
            if (newColumnTitleNum === null) return null;
            const newCard = { column_title_num: newColumnTitleNum, ...obj };
            // console.log(
            //   "mapメソッド内 newColumnTitleNum",
            //   newColumnTitleNum,
            //   "obj.review_order_certainty",
            //   obj.review_order_certainty,
            //   "obj.order_certainty_start_of_month",
            //   obj.order_certainty_start_of_month
            // );
            return newCard;
          })
        : [];
      const filteredCards = initialCards.filter((obj) => obj && obj.column_title_num !== null) as DealCardType[];
      console.log("ローカルstateにネタカードを格納 initialCards", initialCards, "filteredCards", filteredCards);

      setCards(filteredCards);

      // クエリを完了
      setIsMountedQuery(true);

      // フェッチ完了を通知して次のネタ表ボードのフェッチを許可する
      console.log("案件をネタ表テーブルのローカルstateに格納 フェッチ完了を通知");
      if (onFetchComplete) onFetchComplete();
    }
  }, [isSuccess, queryData, isLoadingSDB, isLoadingQuery]);

  // 🌟ローカルstateをリフレッシュ(選択中のカードの最新状態を反映)
  useEffect(() => {
    if (!isRequiredRefreshDealCards) return;
    if (isRequiredRefreshDealCards !== userId) return;
    if (selectedDealCard) {
      // mapメソッドでローカルの現在のカード順を崩さずに選択中のカードの内容のみ更新
      const newDealCards: DealCardType[] = cards.map((obj) => {
        if (obj.property_id === selectedDealCard.dealCard.property_id) {
          return selectedDealCard.dealCard;
        } else {
          return obj;
        }
      });
      console.log(
        "🔥🔥🔥🔥🔥🔥🌠🌠🌠🌠🌠ローカルstateを最新状態に更新 新たなネタカード配列",
        newDealCards,
        "選択中のカード",
        selectedDealCard,
        "memberObj.profile_name",
        memberObj.profile_name
      );
      setCards(newDealCards);
    }
    // ローカルstateの更新が完了したらfalseにして、選択中のカードを空にする
    // setIsRequiredRefreshDealCards(false);
    setIsRequiredRefreshDealCards(null);
    // ネタカードの詳細モーダルを開いていなければ選択中のカードを空にする => useMutateで売上入力後、state反映後に空にする
    if (!isOpenDealCardModal) setSelectedDealCard(null);
  }, [isRequiredRefreshDealCards]);

  // ---------------------------- useQueryここまで ----------------------------

  // 🔸マウント時のアニメーション
  const [animate, setAnimate] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMountedQuery) return; // まだクエリ後のcardsセットが終わってない場合はリターン
    // コンポーネントがマウントされたらアニメーションを開始
    setAnimate(true);

    // 2秒後にはフェードアニメーションを削除
    setTimeout(() => {
      setIsMounted(true);
      setAnimate(false);
    }, 2000);
  }, [isMountedQuery]);

  // const [hasChecked, setHasChecked] = useState(false);
  // const [cards, setCards] = useState<DealCardType[]>(SEED_CARDS);
  const hasCheckedRef = useRef(false);
  // 編集モーダル
  const selectedDealCard = useDashboardStore((state) => state.selectedDealCard);
  const setSelectedDealCard = useDashboardStore((state) => state.setSelectedDealCard);
  // ネタカードクリック時に表示するネタ概要モーダル
  const setIsOpenDealCardModal = useDashboardStore((state) => state.setIsOpenDealCardModal);

  // useEffect(() => {
  //   hasCheckedRef.current && localStorage.setItem("cards", JSON.stringify(cards));
  // }, [cards]);

  // useEffect(() => {
  //   const cardData = localStorage.getItem("cards");

  //   setCards(cardData ? JSON.parse(cardData) : []);

  //   hasCheckedRef.current = true;
  // }, []);

  // ----------------------------- 🌟Column関連🌟
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
  const handleDragEndCard = async ({
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

    // console.log(
    //   "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 ",
    //   "draggingCardIndexRef.current.currentColumnIndex",
    //   draggingCardIndexRef.current.currentColumnIndex,
    //   "originDraggingCardIndexRef.current.originColumnIndex",
    //   originDraggingCardIndexRef.current.originColumnIndex,
    //   "ドラッグ先タイトル",
    //   mappingColumnIndexToTitle[draggingCardIndexRef.current.currentColumnIndex],
    //   "ドラッグ元タイトル",
    //   mappingColumnIndexToTitle[originDraggingCardIndexRef.current.originColumnIndex]
    // );

    // ドロップ先のカラムタイトル
    const originDragColumnTitle = mappingColumnIndexToTitle[originDraggingCardIndexRef.current.originColumnIndex];
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

    // スプレッドでシャローコピーをしておけば、spliceの破壊的なメソッドをnewCardsに加えてもprevCardsはcardsの内容を保持する
    const prevCards = [...cards]; // 更新失敗時にリセットする用
    const newCards = [...cards];
    // ドラッグしてるカードを削除して、ドロップした位置に挿入
    const deleteAt = newCards.findIndex((card) => card.property_id === draggingCardObj.property_id);
    const deleteCard = newCards.splice(deleteAt, 1)[0];
    // -------------------- テスト 前 --------------------
    // const newInsertCard =  {
    //   ...deleteCard,
    //   property_id: deleteCard.property_id,
    //   company_name: deleteCard.company_name,
    //   company_department_name: deleteCard.company_department_name,
    //   column_title_num: dropColumnTitle,
    // } as DealCardType;
    // -------------------- テスト 前 --------------------
    // -------------------- テスト 後 --------------------
    const newInsertCard =
      originDragColumnTitle !== 1 && dropColumnTitle === 1
        ? ({
            ...deleteCard,
            property_id: deleteCard.property_id,
            company_name: deleteCard.company_name,
            company_department_name: deleteCard.company_department_name,
            column_title_num: dropColumnTitle,
            current_status: "D Order Received", // 「A (受注済み)」に変更
          } as DealCardType)
        : originDragColumnTitle === 1 && dropColumnTitle !== 1 && deleteCard.current_status === "D Order Received"
        ? ({
            ...deleteCard,
            property_id: deleteCard.property_id,
            company_name: deleteCard.company_name,
            company_department_name: deleteCard.company_department_name,
            column_title_num: dropColumnTitle,
            current_status: "B Deal Development", // 「展開」に変更
          } as DealCardType)
        : ({
            ...deleteCard,
            property_id: deleteCard.property_id,
            company_name: deleteCard.company_name,
            company_department_name: deleteCard.company_department_name,
            column_title_num: dropColumnTitle,
          } as DealCardType);
    // -------------------- テスト 後 --------------------

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

    // 🔹カラムが変更された場合 中間見直確度が存在するなら中間見直確度を更新 なければ月初確度を更新 => ローカルstateにセットするカードの「月初確度or中間見直確度」カラムの値をドロップ位置の値に変更してからsetCardsのstate更新関数を実行する
    if (dropColumnIndex !== originDragColumnIndex) {
      // 既に中間見直確度が存在する場合は、中間見直確度を「受注」に変更する
      if (!!newInsertCard.review_order_certainty) {
        newInsertCard.review_order_certainty = newInsertCard.column_title_num;
      }
      // 中間見直確度がnullで月初確度の入力されている場合は、月初確度をそのまま保持し、中間見直確度を「受注」に変更する
      else if (!!newInsertCard.order_certainty_start_of_month) {
        newInsertCard.review_order_certainty = newInsertCard.column_title_num;
        // newInsertCard.order_certainty_start_of_month = newInsertCard.column_title_num;
      }
      // 中間見直確度と月初確度がどちらもnullの場合には、月初確度を「受注」に変更する
      else if (newInsertCard.order_certainty_start_of_month) {
        newInsertCard.order_certainty_start_of_month = newInsertCard.column_title_num;
      } else {
        return console.error("❌エラー：月初確度、中間見直確度ともにデータが見つかりませんでした。");
      }
    }
    console.log("🌠更新後のカードと配列", newInsertCard, newCards, "🌠元々のカードの配列", prevCards);

    // 🔹先にローカルstateを更新してブラウザに反映
    setCards(newCards);
    setUpdateCardsMapTrigger(Date.now()); // メモ化したMapオブジェクトを再計算して生成

    // 🔹カラムが異なる場合はトーストを表示
    if (dropColumnIndex !== originDragColumnIndex) {
      try {
        // カラムが異なる場合はDBの確度を変更
        // 中間見直確度が存在するなら中間見直確度を更新 なければ月初確度を更新 => payload用に更新するカラムと更新する値をオブジェクトにセット
        const updatePayload: { [key: string]: number | string } = {};
        // 既に中間見直確度が存在する場合は、中間見直確度を「受注」に変更する
        if (!!newInsertCard.review_order_certainty) {
          updatePayload.review_order_certainty = newInsertCard.column_title_num;
        }
        // 中間見直確度がnullで月初確度の入力されている場合は、月初確度をそのまま保持し、中間見直確度を「受注」に変更する
        else if (!!newInsertCard.order_certainty_start_of_month) {
          updatePayload.review_order_certainty = newInsertCard.column_title_num;
          // updatePayload.order_certainty_start_of_month = newInsertCard.column_title_num;
        }
        // 中間見直確度と月初確度がどちらもnullの場合には、月初確度を「受注」に変更する
        else if (!newInsertCard.order_certainty_start_of_month) {
          updatePayload.order_certainty_start_of_month = newInsertCard.column_title_num;
        } else {
          throw new Error("❌エラー：月初確度、中間見直確度ともにデータが見つかりませんでした。");
        }

        // -------------------- テスト 後 --------------------
        // 🔹現ステータスも更新(理由は売上の取得クエリの条件が現ステータスが「D Order Received」である案件を売上データとして取得するため)
        // 売上フィルター条件：current_status, sales_price, sold_product
        // dropColumnTitleが1の「A(受注済み)」にドロップされた場合には、「月初確度or中間見直確度」を1に変更すると共に「現ステータス」も「展開」から「受注済み」に変更する
        if (originDragColumnTitle !== 1 && dropColumnTitle === 1) {
          updatePayload["current_status"] = "D Order Received";
        }
        // 元々のドラッグ位置が「A(受注済み)」から別に移った時には、「月初確度or中間見直確度」と共に「現ステータス」が「受注済み」の場合には「展開」に変更する
        if (originDragColumnTitle === 1 && dropColumnTitle !== 1) {
          // 現ステータスを「受注」から「展開」
          updatePayload["current_status"] = "B Deal Development";
        }
        // -------------------- テスト 後 --------------------

        console.log(
          "🚀ネタの確度を更新 updatePayload",
          updatePayload,
          "ドラッグ元",
          originDragColumnTitle,
          "ドロップ先",
          dropColumnTitle,
          "現在のcurrent_status",
          newInsertCard.current_status
        );

        const { data, error } = await supabase
          .from("properties")
          .update(updatePayload)
          .eq("id", newInsertCard.property_id)
          .select();

        if (error) throw error;
        if (data?.length !== 1) {
          console.log("❌data", data);
          throw new Error("エラー：正常に更新できませんでした...");
        }

        // DBの更新成功 => 更新結果をキャッシュにも反映
        // column_title_numを除いたProperty_row_data型で格納
        const newCachePropertyArray = newCards.map((obj) => {
          // 分割代入と残余演算子でcolumn_title_numを除いたキャッシュ更新用を作成
          const { column_title_num, ...newPropertyRowData } = obj;
          return newPropertyRowData;
        });

        console.log("✅supabase確度更新成功 data", data);

        queryClient.setQueryData(currentQueryKey, [...newCachePropertyArray]);

        toast.success(
          `${deleteCard.company_name}を${mappingOrderCertaintyStartOfMonthToast[dropColumnTitle][language]}に変更しました🌟`
        );

        // 🔹🔸受注済みに変更、かつ、売上商品・売上価格・売上日付の３つが全て入力されていない場合は、モーダル表示入力画面に遷移させるオプションを表示
        // if (
        //   newInsertCard.column_title_num === 1 &&
        //   (!newInsertCard.sales_date ||
        //     !newInsertCard.sales_year_month ||
        //     !newInsertCard.sales_quarter ||
        //     !newInsertCard.sales_half_year ||
        //     !newInsertCard.sales_fiscal_year ||
        //     !newInsertCard.product_sales ||
        //     !newInsertCard.sales_price)
        // ) {
        if (newInsertCard.column_title_num === 1) {
          // 新たな売物件をZustandに格納 分割代入の残余演算子の組み合わせで、DealCardType型からcolumn_title_numプロパティを除いた残りのプロパティ全て(Property_row_data型)をpropertyRowData変数に格納 column_title_numプロパティはcolumn_title_num変数に格納(除去用なので使用はしない)
          // キャッシュを更新
          await queryClient.invalidateQueries({ queryKey: ["properties"] });
          // await queryClient.invalidateQueries({ queryKey: ["activities"] });
          // 花吹雪の後に1秒後に開く
          // setTimeout(() => {
          // }, 1000);
          setTimeout(() => {
            runFireworks();
            setSelectedDealCard({ ownerId: userId, dealCard: newInsertCard }); // column_title_numありのネタカード
            // 分割代入でcolumn_title_numとpropertyRowDataを分割して、案件テーブルの選択行保持stateのZustandにpropertyRowDataをセット => Updateモーダルに受注済みデータを渡す
            const { column_title_num, ...propertyRowData } = newInsertCard;
            setSelectedRowDataProperty(propertyRowData); // 案件RowData
            setIsOpenCongratulationsModal(true);
          }, 900);
          // setIsOpenUpdatePropertyModal(true); // 売上入力するオプションモーダルで入力を選択した時に編集モーダルを開く
        }

        // 🔹受注済み => 他へ移動した時には、売上データをリセットして、売上実績と達成率に反映させるか確認モーダルを表示する => 売上データをリセットをユーザーに選んでもらってから、ネタ表ボードの実績と達成率、売上推移チャートと達成率チャートに反映する
        // 元々のドラッグ位置が「A(受注済み)」から別に移った時
        if (originDragColumnTitle === 1 && dropColumnTitle !== 1) {
          // 確度と共に現ステータスも「受注」から「展開」に変更しているため、売上フィルター条件に該当しているため、
          // useMemoの売上実績・達成率は反映される => 売上データリセット確認モーダルでチャートも同時に更新

          // キャッシュを更新
          await queryClient.invalidateQueries({ queryKey: ["properties"] });
          // await queryClient.invalidateQueries({ queryKey: ["activities"] });

          // 移動した案件の「売上商品・売上金額」が入力済みだったならキャッシュを更新
          if (!!newInsertCard.sales_price && !!newInsertCard.sold_product && !!newInsertCard.sold_product_id) {
            // 🔹売上進捗キャッシュを更新 ---------------------------------
            // ["sales_trends", selectedFiscalYear, entityLevel, basePeriod, yearsBack, entityIdsStrKey, periodType]
            const queryKeySalesTrend = [
              "sales_trends",
              selectedFiscalYearTargetSDB,
              "member",
              activePeriodSDB?.period,
              3,
            ];
            await queryClient.invalidateQueries({ queryKey: queryKeySalesTrend });
            // 🔹売上進捗キャッシュを更新 ここまで ---------------------------------

            // 🔹達成率キャッシュを更新 ---------------------------------
            // ["sales_processes_for_progress", fiscalYear, periodTypeForProperty, basePeriod, entityId]
            const queryKeySalesProcesses = [
              "sales_processes_for_progress",
              selectedFiscalYearTargetSDB,
              activePeriodSDB?.periodType,
              activePeriodSDB?.period,
              // selectedDealCard.ownerId,
            ];
            await queryClient.invalidateQueries({ queryKey: queryKeySalesProcesses });
            // 🔹達成率キャッシュを更新 ここまで ---------------------------------

            // 売上データリセットモーダルを表示
            setTimeout(() => {
              setSelectedDealCard({ ownerId: userId, dealCard: newInsertCard }); // column_title_numありのネタカード
              const { column_title_num, ...propertyRowData } = newInsertCard;
              setSelectedRowDataProperty(propertyRowData); // 案件RowData
              setIsOpenResetSalesConfirmationModal(true);
            }, 100);
          }
        }
      } catch (error: any) {
        console.error("エラー", error);
        // DBへの更新が失敗した場合は、prevCardsを使ってローカルstateを元々の確度に戻す
        setCards(prevCards);
        toast.error(
          `${deleteCard.company_name}の${mappingOrderCertaintyStartOfMonthToast[dropColumnTitle][language]}への更新に失敗しました...🙇‍♀️`
        );
      }
    }
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
  const handleDropTrash = async () => {
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

    // -------------- 🔹カードをcardsの配列から削除パターン🔹 --------------
    // const deleteCardObj = draggingCardObjRef.current;
    // if (!deleteCardObj) return;

    // const cardIdsMapObj = new Map(cards.map((obj) => [obj.property_id, obj]));

    // cardIdsMapObj.delete(deleteCardObj.property_id);

    // // 削除
    // // setCards((pv) => pv.filter((c) => c.id !== deleteCardObj.id));
    // setCards(Array.from(cardIdsMapObj.values()));
    // -------------- 🔹カードをcardsの配列から削除パターン🔹 ここまで --------------

    // -------------- 🔹rejectedをtrueにしてdraggableをfalseで物件没(置き物)に変更🔹 --------------
    const cardObjToUpdate = draggingCardObjRef.current;
    if (!cardObjToUpdate) return;
    const cardIdToUpdate = cardObjToUpdate.property_id;

    // 既存のcards配列からMapオブジェクトを作成 key:idとvalue:obj本体
    const cardIdsMapObj = new Map(cards.map((obj) => [obj.property_id, obj]));
    const prevCards = [...Array.from(cardIdsMapObj.values())]; // 更新失敗時のリセット用 シャローコピー

    // 特定のオブジェクトを取得し、プロパティを更新
    if (cardIdsMapObj.has(cardIdToUpdate)) {
      // const cardToUpdate = cardIdsMapObj.get(draggingCardId);
      const updatedCardObj = { ...cardObjToUpdate, rejected_flag: true } as DealCardType;
      cardIdsMapObj.set(cardIdToUpdate, updatedCardObj);
    }
    // Mapオブジェクトから新しい配列を生成し、stateを更新
    const newCardsArray = Array.from(cardIdsMapObj.values());
    setCards(newCardsArray);

    // -------------- 🔹rejectedをtrueにしてdraggableをfalseで置き物に変更🔹 --------------

    // -------------- 🔹DBを案件没に更新🔹 --------------
    try {
      const { data, error } = await supabase
        .from("properties")
        .update({ rejected_flag: true })
        .eq("id", cardIdToUpdate)
        .select();

      if (error) throw error;
      if (data?.length !== 1) {
        console.log("❌data", data);
        throw new Error("エラー：正常に更新できませんでした...");
      }

      console.log("✅supabase確度更新成功 data", data);

      // DBの更新成功 => 更新結果をキャッシュにも反映
      // column_title_numを除いたProperty_row_data型で格納
      const newCachePropertyArray = newCardsArray.map((obj) => {
        const { column_title_num, ...newPropertyRowData } = obj;
        return newPropertyRowData;
      });
      queryClient.setQueryData(currentQueryKey, [...newCachePropertyArray]);

      // トーストを表示
      toast.success(`${cardObjToUpdate.company_name}を案件没に変更しました。`);
    } catch (error: any) {
      console.error("エラー", error);
      // DBへの更新が失敗した場合は、prevCardsを使ってローカルstateを元々の確度に戻す
      setCards(prevCards);
      toast.success(`${cardObjToUpdate.company_name}の案件没への更新に失敗しました...🙇‍♀️`);
    }
    // -------------- 🔹DBを案件没に更新🔹 --------------
  };
  // --------------- ゴミ箱 受 Drop ここまで ---------------
  /* ---------------------------------- ✅ゴミ箱✅ ---------------------------------- */

  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    marginTop = 0,
    itemsPosition = "center",
  }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);

    setHoveredItemPos({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: content,
      content2: content2,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    if (hoveredItemPos) setHoveredItemPos(null);
  };
  // ==================================================================================

  const getStyleTheme = () => {
    switch (activeThemeColor) {
      case "theme-brand-f":
        return ``;
      case "theme-brand-f-gradient":
        return `${styles.theme_f_gradient}`;
      case "theme-black-gradient":
        return `${styles.theme_black}`;
      case "theme-simple17":
        return `${styles.theme_simple17}`;
      case "theme-simple12":
        return `${styles.theme_simple12}`;
        break;
      default:
        return ``;
        break;
    }
  };

  // const formattedSalesTarget = useMemo(() => {
  //   if (memberObj.current_sales_target === null) return "-";

  // }, [memberObj?.current_sales_target]);

  /** memberObj
   * current_sales_amount: number | null;
    current_sales_target: number | null;
    current_achievement_rate: number | null;
   */

  console.log(
    "DealBoardレンダリング",
    "cards",
    cards,
    "queryData",
    queryData,
    "periodType",
    periodType,
    "period",
    period,
    // "awardSalesAmount",
    // awardSalesAmount,
    // "achievementRate",
    // achievementRate,
    `${memberObj.profile_name}`
    // "categorizedCardsMapObj",
    // categorizedCardsMapObj,
    // "dealColumnList",
    // dealColumnList,
    // "✅ボード isLoadingQuery",
    // isLoadingQuery,
    // "isSuccess",
    // isSuccess,
    // "cards",
    // cards,
    // "selectedDealCard",
    // selectedDealCard,
    // "isRequiredRefreshDealCards",
    // isRequiredRefreshDealCards,
    // "isRequiredInputSoldProduct",
    // isRequiredInputSoldProduct
  );

  // useQueryの取得中とcardsの初期値がまだセットされていない場合はローディングを返す h: 48(タイトル) 288(ボード)
  if (isLoadingQuery || !isMountedQuery) {
    return (
      <>
        <FallbackDealBoard memberObj={memberObj} />
      </>
      // <div className={`flex-center h-[336px] w-full px-[24px] py-[12px]`}>
      //   <SpinnerX />
      // </div>
    );
  }

  return (
    <>
      {/* ------------------------ タイトルエリア ------------------------ */}
      <div className={`${styles.entity_detail_container} bg-[green]/[0]`}>
        <div className={`${styles.entity_detail_wrapper}`}>
          <div className={`${styles.entity_detail} space-x-[12px] text-[12px]`}>
            <AvatarIcon
              // size={33}
              size={36}
              name={memberObj.profile_name ?? "未設定"}
              withCircle={false}
              hoverEffect={false}
              textSize={16}
              // imgUrl={memberObj.avatar_url ?? null}
            />
            <div className={`${styles.entity_name} text-[19px] font-bold`}>
              <span>{memberObj.profile_name}</span>
            </div>
            <div className={`${styles.sub_info} pt-[6px]`}>{memberObj.position_name ?? "役職未設定"}</div>
            <div className={`${styles.sub_info} pt-[6px]`}>{memberObj.assigned_employee_id_name ?? ""}</div>
            <div
              // className={`relative !ml-[24px] !mr-[12px] flex h-full min-h-[56px] w-auto items-end bg-[red]/[0]`}
              className={`relative !ml-[24px] !mr-[12px] flex h-full min-h-[56px] w-auto items-end bg-[red]/[0]`}
            >
              <div className="flex h-full min-w-[150px] items-end justify-end">
                {memberObj.current_sales_amount !== null ? (
                  <ProgressNumber
                    // targetNumber={memberObj.current_sales_amount}
                    targetNumber={awardSalesAmount}
                    // targetNumber={6200000}
                    // targetNumber={0}
                    // startNumber={Math.round(68000 / 2)}
                    // startNumber={Number((68000 * 0.1).toFixed(0))}
                    startNumber={0}
                    duration={3000}
                    easeFn="Quintic"
                    fontSize={27}
                    fontWeight={500}
                    margin="0 0 -3px 0"
                    isReady={isRenderProgress}
                    fade={`fade08_forward`}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: `27px`,
                      fontWeight: 500,
                      color: `var(--color-text-title)`,
                      margin: "0 0 -3px 0",
                    }}
                    className={`${!isRenderProgress ? `opacity-0` : ``} ${isRenderProgress ? `fade08_forward` : ``}`}
                  >
                    {formatToJapaneseYen(0, true)}
                  </span>
                )}
              </div>
              <div className="relative h-full min-w-[33px]">
                <div className="absolute left-[66%] top-[68%] min-h-[2px] w-[30px] translate-x-[-50%] translate-y-[-50%] rotate-[120deg] bg-[var(--color-text-title)]"></div>
              </div>
              <div
                // className="mr-[12px] flex h-full min-w-max items-end justify-start"
                className="mr-[9px] flex h-full min-w-max items-end justify-start"
              >
                <span className="ml-[6px] text-[16px]">
                  {memberObj.current_sales_target !== null
                    ? `${formatToJapaneseYen(memberObj.current_sales_target, false)}`
                    : `-`}
                </span>
                {/* <span className="ml-[6px] text-[16px]">9,000,000</span> */}
                {/* <span className="ml-[0px] text-[16px]">-</span> */}
                {/* <span className="ml-[12px] text-[16px]">-</span> */}
              </div>
            </div>
            <div className={`relative h-[56px] w-[56px]`} style={{ margin: `0` }}>
              <div className="absolute bottom-[-6px] right-0">
                <ProgressCircle
                  circleId={`${userId}_board`}
                  textId={`${userId}_board`}
                  // progress={
                  //   memberObj.current_achievement_rate !== null
                  //     ? 100 <= memberObj.current_achievement_rate
                  //       ? 100
                  //       : Number(memberObj.current_achievement_rate.toFixed(0))
                  //     : 0
                  // }
                  progress={achievementRate !== null ? (100 <= achievementRate ? 100 : achievementRate) : 0}
                  // progress={24}
                  // progress={100}
                  // progress={0}
                  duration={5000}
                  easeFn="Quartic"
                  size={56}
                  strokeWidth={6}
                  // fontSize={11}
                  fontSize={13}
                  fontWeight={500}
                  fontFamily="var(--font-family-str)"
                  textColor="var(--color-text-title)"
                  isReady={isRenderProgress}
                  fade={`fade08_forward`}
                  // fade={`fade10_forward`}
                  withShadow={false}
                  // withShadow={true}
                  // boxShadow={`var(--color-progress-chart-shadow-white)`}
                  // boxShadow={`0 0 1px 1px #ffffff90, 0 0 3px 2px #ffffff36, 0 0 3px 3px #ffffff15`}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={`${styles.status_col_wrapper}`}>
          <div className={`flex h-full items-start pt-[10px]`}>
            <div
              className={`${styles.btn} ${styles.basic} space-x-[4px]`}
              onMouseEnter={(e) => {
                // 売上目標が設定されていない状態ではエンティティidが存在せず、stickyが機能しなくなるので、main_entity_targetの文字列をセット
                const entityId = "main_entity_target";
                handleOpenTooltip({
                  e: e,
                  display: "top",
                  content: stickyRow === entityId ? `固定を解除` : `画面内に固定`,
                  marginTop: 9,
                });
              }}
              onMouseLeave={handleCloseTooltip}
              onClick={() => {
                const entityId = `deal_board_${userId}`;
                if (!entityId) return;
                if (entityId === stickyRow) {
                  setStickyRow(null);
                } else {
                  setStickyRow(entityId);
                }
                handleCloseTooltip();
              }}
            >
              {stickyRow === `deal_board_${userId}` && <TbSnowflakeOff />}
              {stickyRow !== `deal_board_${userId}` && <TbSnowflake />}
              {stickyRow === `deal_board_${userId}` && <span>解除</span>}
              {stickyRow !== `deal_board_${userId}` && <span>固定</span>}
            </div>
          </div>
        </div>
      </div>
      {/* ------------------------ タイトルエリア ------------------------ */}
      {/* ------------------------ ボード ------------------------ */}
      {/* <div ref={boardRef} className={`${styles.board} flex  w-full overflow-scroll ${getStyleTheme()}`}> */}
      <div ref={boardRef} className={`${styles.board} flex  w-full overflow-y-scroll ${getStyleTheme()}`}>
        {/* ------------ Columnレーングループ ------------ */}
        {dealColumnList.map((column: ColumnLane, columnIndex: number) => {
          // const filteredCards = categorizedCardsMapObj.get(column.titleNum);
          const filteredCards = column.cards;
          // console.log("filteredCards", filteredCards, "column.title", column.titleNum);
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
                <h3 className={`flex items-center font-medium ${column.headingColor}`}>
                  <span>{columnTitle}</span>
                  {columnIndex === 0 && (
                    <div className={`${styles.info_area} flex-center ml-[9px] min-h-[22px]`}>
                      <div
                        className="flex-center relative h-[16px] w-[16px] rounded-full"
                        onMouseEnter={(e) => {
                          // handleEnterInfoIcon(e, infoIconProgressRef.current);
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: `「月初確度」か「中間見直確度」が「A (受注済み)」で、\nかつ「現ステータス」が「受注」の案件に星マークが付き売上実績に反映されます。`,
                            marginTop: 39,
                            // content: `期間を「月次・四半期・半期・年度」のタイプと期間を選択することで`,
                            // content2: `その期間内でフィルターしたデータをダッシュボードに反映します。`,
                            // marginTop: 27,
                            itemsPosition: "left",
                          });
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                        }}
                      >
                        {/* <div
                          // ref={infoIconProgressRef}
                          className={`flex-center absolute left-0 top-0 h-[18px] w-[18px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                        ></div> */}
                        <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
                      </div>
                    </div>
                  )}
                </h3>
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
                  const isRejected = card.rejected_flag;
                  const isPending = card.pending_flag;
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
                      {/* 🌟Rowカード */}
                      <div
                        ref={(ref) => (rowCardsRef.current[rowIndex] = ref)}
                        draggable={!isRejected && !isPending}
                        data-card-column-title={card.column_title_num}
                        data-card-row-index={rowIndex}
                        className={`${styles.row_card} ${animate ? `${styles.fade_in}` : ``} ${
                          isMounted ? `${styles.is_mount}` : ``
                        }  transition-bg05 cursor-grab rounded bg-neutral-800 active:cursor-grabbing ${
                          rowIndex === filteredCards.length - 1 ? `last` : ``
                        } ${isRejected ? `${styles.rejected}` : ``} ${isPending ? `${styles.pending}` : ``}`}
                        style={{ ...(animate && { animationDelay: `${(rowIndex + 1) * 0.3}s` }) }} // 各カードのアニメーションの遅延を設定
                        onClick={() => {
                          setSelectedDealCard({
                            ownerId: userId,
                            dealCard: card,
                          });
                          setIsOpenDealCardModal(true);
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
                        {isPending && !isRejected && (
                          <div className={`${styles.pending_icon}`}>
                            <MdOutlineMoreTime className="text-[18px] text-[#fff]" />
                          </div>
                        )}
                        {isRejected && !isPending && (
                          <div className={`${styles.rejected_icon}`}>
                            <BsFire className="text-[18px]" />
                          </div>
                        )}
                        {isRejected && isPending && (
                          <div>
                            <div className={`${styles.rejected_icon}`}>
                              <div className="flex space-x-[12px] ">
                                <BsFire className="text-[18px]" />
                                <MdOutlineMoreTime className="text-[18px]" />
                              </div>
                            </div>
                          </div>
                        )}
                        {columnIndex === 0 && card.current_status === "D Order Received" && (
                          <div className="relative ml-[-3px] mr-[6px]">
                            <FaStar
                              className={` ${styles.star_icon_up} z-[10]  min-h-[15px] min-w-[15px] text-[15px]`}
                            />
                            <FaRegStar
                              className={`${styles.star_icon_single} z-0 min-h-[15px] min-w-[15px] text-[15px]`}
                            />
                          </div>
                        )}
                        {/* {columnIndex === 0 && (
                          <FaRegStar
                            className={`${styles.star_icon_single} ml-[-3px] mr-[6px] min-h-[15px] min-w-[15px] text-[15px]`}
                          />
                        )} */}
                        {/* {columnIndex === 0 && (
                          <div className={`${styles.star_icon_wrapper} flex-center`}>
                            <FaRegStar className={`${styles.star_icon}  min-h-[15px] min-w-[15px] text-[15px]`} />
                          </div>
                        )} */}
                        {/* <p className={`pointer-events-none whitespace-pre-wrap text-sm`}>{card.company_name}</p> */}
                        <div className={`pointer-events-none flex w-full items-center justify-between`}>
                          <div
                            className={`${styles.left_contents} flex min-w-[140px] flex-col justify-center bg-[red]/[0]`}
                          >
                            <div className={`${styles.main} truncate`}>
                              {/* <span>{card.company_name}</span> */}
                              <span>
                                {card.company_name
                                  ? splitCompanyNameWithPosition(card.company_name).company_name
                                  : "未設定"}
                              </span>
                            </div>
                            <div className={`${styles.sub} flex items-center space-x-[6px] truncate`}>
                              {/* <div className="max-w-[80px] truncate bg-[aqua]/[0]"> */}
                              <div className="max-w-[140px] truncate bg-[aqua]/[0]">
                                {/* <span className={``}>2024/04~</span> */}
                                <span className={``}>
                                  {card.expansion_date
                                    ? `${`${format(new Date(card.expansion_date), "yyyy/M/d")}〜`}`
                                    : "展開日付不明"}
                                  {columnIndex === 0
                                    ? card.sales_date
                                      ? `${format(new Date(card.sales_date), "yyyy/M/d")}`
                                      : `売上日付不明`
                                    : ``}
                                </span>
                                {/* <span className={``}>ネタ外</span> */}
                              </div>
                              {/* <div className="max-w-[75px] truncate bg-[purple]/[0]">
                                <span className={`truncate`}>3,600,000</span>
                              </div> */}
                            </div>
                          </div>
                          <div
                            className={`pointer-events-none flex min-w-[65px] max-w-[68px] flex-col items-end justify-center bg-[green]/[0]`}
                          >
                            {/* <span className={`${styles.right_first} pointer-events-none truncate`}>2024/04~</span> */}
                            <span
                              className={`${styles.right_main} pointer-events-none inline-block max-w-[68px] truncate`}
                            >
                              {columnIndex !== 0
                                ? card.expected_product
                                  ? card.expected_product
                                  : `予定商品不明`
                                : ``}
                              {columnIndex === 0 ? (card.sold_product ? card.sold_product : `売商品不明`) : ``}
                            </span>
                            <span
                              className={`${styles.right_second} pointer-events-none inline-block max-w-[68px] truncate`}
                            >
                              {columnIndex !== 0
                                ? card.expected_sales_price
                                  ? Number(card.expected_sales_price).toLocaleString()
                                  : `予定金額不明`
                                : ``}
                              {columnIndex === 0
                                ? card.sales_price
                                  ? Number(card.sales_price).toLocaleString()
                                  : `売上金額不明`
                                : ``}
                            </span>
                            {/* <span className={`${styles.right_first} pointer-events-none truncate`}>ネタ外</span> */}
                          </div>
                        </div>
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
            {/* <FaFire className={`animate-bounce`} /> */}
            {/* <AiOutlineFire className={`animate-bounce`} /> */}
            {/* <AiFillFire className={`animate-bounce`} /> */}
            <BsFire className={`animate-bounce`} />
          </div>
        </div>
        {/* ------------------- ゴミ箱レーン ここまで ------------------- */}
        {/* ------------------- 編集モーダル ------------------- */}
        {/* {isOpenEditModal && selectedDealCard && <EditModalDealCard setIsOpenEditModal={setIsOpenEditModal} />} */}
        {/* ------------------- 編集モーダル ここまで ------------------- */}
      </div>
      {/* ------------------------ ボード ここまで ------------------------ */}
    </>
  );
};

export const DealBoard = memo(DealBoardMemo);
