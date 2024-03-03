import React, {
  CSSProperties,
  Dispatch,
  FC,
  Fragment,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./ProductListTable.module.css";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import { mappingPositionClass } from "@/utils/mappings";
import { QuotationProductsDetail } from "@/types";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { toast } from "react-toastify";
import { convertHalfWidthRoundNumOnly } from "@/utils/Helpers/convertHalfWidthRoundNumOnly";
import { convertToYen } from "@/utils/Helpers/convertToYen";
import { checkNotFalsyExcludeZero } from "@/utils/Helpers/checkNotFalsyExcludeZero";
import { toHalfWidth } from "@/utils/Helpers/toHalfWidth";
import { calculateTotalPriceProducts } from "@/utils/Helpers/calculateTotalPriceProducts";
import { calculateTotalAmount } from "@/utils/Helpers/calculateTotalAmount";
import { calculateDiscountRate } from "@/utils/Helpers/calculateDiscountRate";

type Props = {
  productsArray: QuotationProductsDetail[];
  setSelectedProductsArray?: Dispatch<SetStateAction<QuotationProductsDetail[]>>;
  isInsertMode?: boolean;
  isUpdateMode?: boolean;
};

const ProductListTableMemo: FC<Props> = ({
  productsArray,
  setSelectedProductsArray,
  isInsertMode = false,
  isUpdateMode = false,
}) => {
  const language = useStore((state) => state.language);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);
  // --------------- 🔹モード設定 ---------------
  const evenRowColorChange = useDashboardStore((state) => state.evenRowColorChange);
  // --------------- 🔹モード設定ここまで ---------------

  // 見積価格関連 価格合計・値引金額・値引率・合計金額の4つの計算が必要なグローバルstate
  const inputTotalPriceEdit = useDashboardStore((state) => state.inputTotalPriceEdit);
  const setInputTotalPriceEdit = useDashboardStore((state) => state.setInputTotalPriceEdit);
  const inputDiscountAmountEdit = useDashboardStore((state) => state.inputDiscountAmountEdit);
  const setInputDiscountAmountEdit = useDashboardStore((state) => state.setInputDiscountAmountEdit);
  const inputDiscountRateEdit = useDashboardStore((state) => state.inputDiscountRateEdit);
  const setInputDiscountRateEdit = useDashboardStore((state) => state.setInputDiscountRateEdit);
  const inputTotalAmountEdit = useDashboardStore((state) => state.inputTotalAmountEdit);
  const setInputTotalAmountEdit = useDashboardStore((state) => state.setInputTotalAmountEdit);
  // 見積価格関連ここまで

  const [isComposing, setIsComposing] = useState(false);

  // ダブルクリックでセルの詳細を確認
  const setIsOpenEditModal = useDashboardStore((state) => state.setIsOpenEditModal);
  const textareaInput = useDashboardStore((state) => state.textareaInput);
  const setTextareaInput = useDashboardStore((state) => state.setTextareaInput);
  // 編集中のセル
  // const [editPosition, setEditPosition] = useState<{ row: number | null; col: number | null }>({
  //   row: null,
  //   col: null,
  // });
  const editPosition = useDashboardStore((state) => state.editPosition);
  const setEditPosition = useDashboardStore((state) => state.setEditPosition);
  const isEditingCell = useDashboardStore((state) => state.isEditingCell);
  const setIsEditingCell = useDashboardStore((state) => state.setIsEditingCell);

  // カラム列全てにindex付きのrefを渡す
  const colsRef = useRef<(HTMLDivElement | null)[]>([]);
  // カラムのテキストの3点リーダー適用有無確認のためのテキストサイズ保持Ref
  const columnHeaderInnerTextRef = useRef<(HTMLSpanElement | null)[]>([]);
  // カラムのリサイズ用オーバーレイ
  const draggableOverlaysRef = useRef<(HTMLDivElement | null)[]>([]);
  // スクロールコンテナDOM
  const parentGridScrollContainer = useRef<HTMLDivElement | null>(null);
  // Rowグループコンテナ(Virtualize収納用インナー)
  const gridRowGroupContainerRef = useRef<HTMLDivElement | null>(null);
  // それぞれのセル 大規模なテーブルや動的に変更されるテーブルのセルに対してrefオブジェクトを付与する場合はオブジェクトで管理する
  /*
  1行1列目のセルのキー: row-0-col-0
  ここで、rowIndex は 0（最初の行）、colIndex は 0（最初の列）
  2行3列目のセルのキー: row-1-col-2
  ここで、rowIndex は 1（2番目の行）、colIndex は 2（3番目の列）
  {
  "row-0-col-0": refObject1, // 1行1列目のセルのref
  "row-0-col-1": refObject2, // 1行2列目のセルのref
  "row-0-col-2": refObject3, // 1行3列目のセルのref
  "row-1-col-0": refObject4, // 2行1列目のセルのref
  "row-1-col-1": refObject5, // 2行2列目のセルのref
  "row-1-col-2": refObject6, // 2行3列目のセルのref
  "row-2-col-0": refObject7, // 3行1列目のセルのref
  "row-2-col-1": refObject8, // 3行2列目のセルのref
  "row-2-col-2": refObject9  // 3行3列目のセルのref
  }
  */
  const gridcellsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  // const truncatedCellsRef = useRef<{ [key: string]: {el: HTMLDivElement | null, isOverflow: boolean} }>({});

  // --------------------- 🌟見積

  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    content3?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    content3,
    marginTop = 0,
    itemsPosition = "start",
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
      content3: content2,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    setHoveredItemPos(null);
  };
  // ===================== ✅ツールチップ 3点リーダーの時にツールチップ表示✅ =====================

  const columnNameToJapanese = (columnName: string) => {
    switch (columnName) {
      case "quotation_product_name":
        return "商品名（見積記載）";
        break;
      case "quotation_product_outside_short_name":
        return "型式（見積記載）";
        break;
      //   case "quotation_inside_short_name":
      //     return "同席者";
      //     break;
      case "quotation_product_unit_price":
        return "価格（見積記載）";
        break;
      case "quotation_product_quantity":
        return "数量（見積記載）";
        break;
      case "quotation_product_priority":
        return "見積記載順";
        break;
      case "product_name":
        return "商品名";
        break;
      case "outside_short_name":
        return "型式";
        break;
      case "inside_short_name":
        return "型式略称";
        break;
      case "unit_price":
        return "価格";
        break;

      default:
        break;
    }
  };

  // 活動タイプ、概要、日付、営業担当、事業部、営業所
  type ColumnExcludeKeys =
    | "product_id"
    | "product_created_by_user_id"
    | "product_created_by_company_id"
    | "product_created_by_department_of_user"
    | "product_created_by_unit_of_user"
    | "product_created_by_office_of_user"
    | "quotation_inside_short_name"
    | "quotation_product_priority"; // 除外するキー
  type ColumnNames = Exclude<keyof QuotationProductsDetail, ColumnExcludeKeys>; // Quotation_row_dataタイプのプロパティ名のみのデータ型を取得
  const columnHeaderListArray: ColumnNames[] = [
    "quotation_product_name",
    "quotation_product_outside_short_name",
    "quotation_product_unit_price",
    // "quotation_product_priority",
    "quotation_product_quantity",
    "inside_short_name",
    "product_name",
    "outside_short_name",
    "unit_price",
  ];
  const columnHeaderList = columnHeaderListArray.map((item, index) => {
    const newItem = {
      columnId: index,
      columnName: item,
      columnIndex: index + 2,
    };
    return newItem;
  });

  // 🌟現在のカラム.map((obj) => Object.values(row)[obj.columnId])で展開してGridセルを表示する
  // カラムNameの値のみ配列バージョンで順番入れ替え
  const columnOrder = [...columnHeaderList].map((item, index) => item.columnName as keyof QuotationProductsDetail); // columnNameのみの配列を取得

  // 見積記載順(追加順)に商品リストを並び替え
  const sortedProductsList = [...productsArray].sort((a, b) => {
    if (a.quotation_product_priority === null) return 1; // null値をリストの最後に移動
    if (b.quotation_product_priority === null) return -1;
    return a.quotation_product_priority - b.quotation_product_priority;
  });

  // ================== 🌟セル シングルクリック、ダブルクリックイベント ==================
  // クリックで概要の詳細を確認
  const setTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [clickActiveRow, setClickedActiveRow] = useState<number | null>(null);
  const selectedRowDataQuotationProduct = useDashboardStore((state) => state.selectedRowDataQuotationProduct);
  const setSelectedRowDataQuotationProduct = useDashboardStore((state) => state.setSelectedRowDataQuotationProduct);
  // フォーカス中、選択中のセルを保持
  const selectedGridCellRef = useRef<HTMLDivElement | null>(null);
  const [activeCell, setActiveCell] = useState<HTMLDivElement | null>(null);
  // 前回のアクティブセル
  const prevSelectedGridCellRef = useRef<HTMLDivElement | null>(null);

  const handleSingleClickGridCell = useCallback(
    // (e: React.MouseEvent<HTMLDivElement>,  isEditable: boolean) => {
    (e: React.MouseEvent<HTMLDivElement>, index: number, columnName: string, rowIndex: number, isEditable: boolean) => {
      if (!isEditable) return;
      if (setTimeoutRef.current !== null) return;

      setTimeoutRef.current = setTimeout(() => {
        setTimeoutRef.current = null;
        // シングルクリック時に実行したい処理
        // 0.2秒後に実行されてしまうためここには書かない
      }, 200);

      console.log("シングルクリック");
      // すでにselectedセル(アクティブセル)のrefが存在するなら、一度aria-selectedをfalseに変更
      if (selectedGridCellRef.current?.getAttribute("aria-selected") === "true") {
        // 保持していたアクティブセルを前回のアクティブセルprevSelectedGridCellRefに格納
        prevSelectedGridCellRef.current = selectedGridCellRef.current;

        selectedGridCellRef.current.setAttribute("aria-selected", "false");
        selectedGridCellRef.current.setAttribute("tabindex", "-1");
      }
      // クリックしたセルの属性setAttributeでクリックしたセルのaria-selectedをtrueに変更
      e.currentTarget.setAttribute("aria-selected", "true");
      e.currentTarget.setAttribute("tabindex", "0");

      // クリックしたセルを新たなアクティブセルとしてrefに格納して更新
      selectedGridCellRef.current = e.currentTarget;
      setActiveCell(e.currentTarget);

      console.log(
        `前回アクティブセルの行と列: ${prevSelectedGridCellRef.current?.ariaColIndex}, ${prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex}, 今回アクティブの行と列: ${selectedGridCellRef.current?.ariaColIndex}, ${selectedGridCellRef.current?.parentElement?.ariaRowIndex}`
      );
      // クリックした列を選択中の状態の色に変更する aria-selectedをtrueにする
      if (typeof selectedGridCellRef.current?.parentElement?.ariaRowIndex === "undefined") return;
      if (Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex) === 1) {
        setClickedActiveRow(null);
        return;
      }
      setClickedActiveRow(Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex));
      // クリックした列要素の列データをZustandに挿入 indexは0から rowIndexは2から
      setSelectedRowDataQuotationProduct(
        productsArray[Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex) - 2]
      );

      // --------------- セルのテキストとpositionを格納 ---------------
      let text;
      if (["quotation_product_unit_price", "unit_price"].includes(columnName)) {
        console.log("🔥 columnName", columnName);
        console.log("🔥 rowIndex", rowIndex);
        console.log("🔥 sortedProductsList", sortedProductsList);
        console.log(
          "🔥 sortedProductsList[rowIndex][columnName as keyof QuotationProductsDetail]",
          sortedProductsList[rowIndex]
        );
        console.log(
          "🔥 sortedProductsList[rowIndex]",
          sortedProductsList[rowIndex][columnName as keyof QuotationProductsDetail]
        );
        if (columnName in sortedProductsList[rowIndex]) {
          text = sortedProductsList[rowIndex][columnName as keyof QuotationProductsDetail];
        }
      } else {
        text = e.currentTarget.innerHTML;
      }
      console.log("🔥 text", text);
      if (typeof text === "number") {
        text = text.toString();
      }
      // setIsOpenEditModal(true);
      originalValueFieldEdit.current = text ?? "";
      setTextareaInput((text ?? "") as string);
      setEditPosition({ row: rowIndex, col: index });

      // 既に選択中なら選択を解除
      // if (e.currentTarget.getAttribute("aria-selected") === "true") {
      //   if (!selectedGridCellRef.current) return;
      //   if (!prevSelectedGridCellRef.current) return;
      //   prevSelectedGridCellRef.current.setAttribute("aria-selected", "false");
      //   prevSelectedGridCellRef.current.setAttribute("tabindex", "-1");
      //   selectedGridCellRef.current.setAttribute("aria-selected", "false");
      //   selectedGridCellRef.current.setAttribute("tabindex", "-1");
      //   setActiveCell(null);
      //   setClickedActiveRow(null);
      //   setSelectedRowDataQuotationProduct(null);
      // }
      // // 未選択なら選択中にする
      // else {
      //   // すでにselectedセル(アクティブセル)のrefが存在するなら、一度aria-selectedをfalseに変更
      //   if (selectedGridCellRef.current?.getAttribute("aria-selected") === "true") {
      //     // 保持していたアクティブセルを前回のアクティブセルprevSelectedGridCellRefに格納
      //     prevSelectedGridCellRef.current = selectedGridCellRef.current;

      //     selectedGridCellRef.current.setAttribute("aria-selected", "false");
      //     selectedGridCellRef.current.setAttribute("tabindex", "-1");
      //   }
      //   // クリックしたセルの属性setAttributeでクリックしたセルのaria-selectedをtrueに変更
      //   e.currentTarget.setAttribute("aria-selected", "true");
      //   e.currentTarget.setAttribute("tabindex", "0");

      //   // クリックしたセルを新たなアクティブセルとしてrefに格納して更新
      //   selectedGridCellRef.current = e.currentTarget;
      //   setActiveCell(e.currentTarget);

      //   console.log(
      //     `前回アクティブセルの行と列: ${prevSelectedGridCellRef.current?.ariaColIndex}, ${prevSelectedGridCellRef.current?.parentElement?.ariaRowIndex}, 今回アクティブの行と列: ${selectedGridCellRef.current?.ariaColIndex}, ${selectedGridCellRef.current?.parentElement?.ariaRowIndex}`
      //   );
      //   // クリックした列を選択中の状態の色に変更する aria-selectedをtrueにする
      //   if (typeof selectedGridCellRef.current?.parentElement?.ariaRowIndex === "undefined") return;
      //   if (Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex) === 1) {
      //     setClickedActiveRow(null);
      //     return;
      //   }
      //   setClickedActiveRow(Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex));
      //   // クリックした列要素の列データをZustandに挿入 indexは0から rowIndexは2から
      //   setSelectedRowDataQuotationProduct(
      //     productsArray[Number(selectedGridCellRef.current?.parentElement?.ariaRowIndex) - 2]
      //   );
      // }
    },
    [productsArray, sortedProductsList]
  );

  // セルダブルクリック
  const handleDoubleClickGridCell = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement>,
      index: number,
      columnName: string,
      productListIndex: number,
      isEditable: boolean
    ) => {
      // 編集不能なセルはリターン
      if (!isEditable) return;
      console.log("ダブルクリック", e.currentTarget, "index", index);
      //   if (columnName !== "summary") return console.log("ダブルクリック summaryでないためリターン");

      if (setTimeoutRef.current) {
        clearTimeout(setTimeoutRef.current);

        // console.log(e.detail);
        setTimeoutRef.current = null;
        // ダブルクリック時に実行したい処理

        // クリックした要素のテキストを格納
        // const text = e.currentTarget.innerText;

        // let text;
        // if (["quotation_product_unit_price", "unit_price"].includes(columnName)) {
        //   console.log("🔥 columnName", columnName);
        //   console.log("🔥 productListIndex", productListIndex);
        //   console.log("🔥 sortedProductsList", sortedProductsList);
        //   console.log(
        //     "🔥 sortedProductsList[productListIndex][columnName as keyof QuotationProductsDetail]",
        //     sortedProductsList[productListIndex]
        //   );
        //   console.log(
        //     "🔥 sortedProductsList[productListIndex]",
        //     sortedProductsList[productListIndex][columnName as keyof QuotationProductsDetail]
        //   );
        //   if (columnName in sortedProductsList[productListIndex]) {
        //     text = sortedProductsList[productListIndex][columnName as keyof QuotationProductsDetail];
        //   }
        // } else {
        //   text = e.currentTarget.innerHTML;
        // }
        // console.log("🔥 text", text);
        // if (typeof text === "number") {
        //   text = text.toString();
        // }

        // セルのテキストとpositionを格納
        // setTextareaInput((text ?? "") as string);
        // setEditPosition({ row: productListIndex, col: index });
        // セル編集モードをON
        setIsEditingCell(true);
        // setIsOpenEditModal(true);
      }
    },
    [setTextareaInput, setIsOpenEditModal, setIsEditingCell]
  );
  // ================== 🌟セル シングルクリック、ダブルクリックイベント ここまで ==================

  // ================== 🌟エンターキーで個別フィールドをアップデート inputタグ ==================
  type ExcludeKeys =
    | "product_id"
    | "product_name"
    | "outside_short_name"
    | "inside_short_name"
    | "unit_price"
    | "product_created_by_user_id"
    | "product_created_by_company_id"
    | "product_created_by_department_of_user"
    | "product_created_by_unit_of_user"
    | "product_created_by_office_of_user"
    | "quotation_inside_short_name"
    | "quotation_product_priority"; // 除外するキー
  type EditProductFieldNames = Exclude<keyof QuotationProductsDetail, ExcludeKeys>; // Quotation_row_dataタイプのプロパティ名のみのデータ型を取得
  type EditableFieldNames =
    | "quotation_product_name"
    | "quotation_product_outside_short_name"
    | "quotation_product_unit_price"
    | "quotation_product_quantity";

  const originalValueFieldEdit = useRef<string | null>("");

  const handleKeyDownUpdateField = async ({
    e,
    fieldName,
    // fieldNameForSelectedRowData,
    originalValue,
    newValue,
    id,
    required,
    rowIndex,
    colIndex,
  }: {
    e: React.KeyboardEvent<HTMLInputElement>;
    // fieldName: string;
    fieldName: EditableFieldNames;
    // fieldNameForSelectedRowData: EditableFieldNames;
    originalValue: any;
    newValue: any;
    id: string | undefined;
    required: boolean;
    rowIndex: number;
    colIndex: number;
  }) => {
    // 日本語入力変換中はtrueで変換確定のエンターキーではUPDATEクエリが実行されないようにする
    // 英語などの入力変換が存在しない言語ではisCompositionStartは発火しないため常にfalse
    if (e.key === "Enter" && !isComposing) {
      if (required && (newValue === "" || newValue === null)) return toast.info(`この項目は入力が必須です。`);
      if (fieldName === "quotation_product_quantity" && ["0", "０", ""].includes(newValue)) {
        return toast.info(`数量は1以上の入力が必須です。`);
      }

      // 編集していたセルのポジションをrefに格納 useEffect内でセルを特定
      positionRef.current = `row-${rowIndex}-col-${colIndex}`;
      const el = e.currentTarget;
      console.log("オーバーフローかどうか", el.offsetWidth < el.scrollWidth, el.offsetWidth, el.scrollWidth);
      if (el.offsetWidth < el.scrollWidth) {
        console.log("オーバーフロー");
        setIsOverflow(true);
      }

      // 🔹INSERTモード
      if (isInsertMode && fieldName) {
        let _newQuantity;
        let _newPrice;
        const updatedArray = productsArray.map((item) => {
          if (item.product_id === selectedRowDataQuotationProduct?.product_id) {
            if (["quotation_product_quantity"].includes(fieldName)) {
              // 数量 0以外の整数値の場合のみ変更を許可
              const parsedQuantity = parseInt(newValue, 10);
              // 0の場合は元の値を返す
              const newQuantity = !isNaN(parsedQuantity) && parsedQuantity !== 0 ? parsedQuantity : originalValue;
              _newQuantity = newQuantity;
              return { ...item, [fieldName]: newQuantity };
            } else if (["quotation_product_unit_price"].includes(fieldName)) {
              // 価格 0と小数点を許容(海外は小数点あり)
              const convertedValue = checkNotFalsyExcludeZero(newValue) ? newValue : Number(originalValue);
              _newPrice = convertedValue;
              return { ...item, [fieldName]: convertedValue };
            } else {
              // それ以外の商品名と型式はそのままの値で変更
              return { ...item, [fieldName]: newValue };
            }
          }
          return item;
        });
        // console.log("🔥fieldName", fieldName);
        // console.log("🔥newValue", newValue);
        // console.log("🔥originalValue", originalValue);
        // console.log("🔥updatedArray", updatedArray);
        if (setSelectedProductsArray) {
          setSelectedProductsArray(updatedArray);
        }

        //
        // 価格合計・値引率・合計金額を算出(元の値と異なる新たな値なら再計算する)
        // 🔹数量・価格の変更、かつ、元の値と異なる場合
        if (
          (fieldName === "quotation_product_quantity" && _newQuantity !== originalValue) ||
          (fieldName === "quotation_product_unit_price" && _newPrice !== Number(originalValue))
        ) {
          // 🔹価格合計
          const newTotalPrice = calculateTotalPriceProducts(updatedArray, language === "ja" ? 0 : 2);
          setInputTotalPriceEdit(newTotalPrice);
          // 🔹合計金額 = 価格合計 - 値引金額
          // 値引価格の数字と小数点以外は除去
          const replacedDiscountAmount = inputDiscountAmountEdit.replace(/[^\d.]/g, "");
          const newTotalAmount = calculateTotalAmount(
            Number(newTotalPrice),
            Number(replacedDiscountAmount) || 0,
            language === "ja" ? 0 : 2
          );
          setInputTotalAmountEdit(newTotalAmount);
          // 🔹値引率
          const result = calculateDiscountRate({
            salesPriceStr: newTotalPrice,
            discountPriceStr: replacedDiscountAmount || "0",
            salesQuantityStr: "1",
            showPercentSign: false,
            decimalPlace: 2,
          });
          if (result.error) {
            toast.error(`エラー：${result.error}🙇‍♀️`);
            console.error("エラー：値引率の取得に失敗", result.error);
            setInputDiscountRateEdit("");
          } else if (result.discountRate) {
            console.log("result.discountRate");
            const newDiscountRate = result.discountRate;
            setInputDiscountRateEdit(newDiscountRate);
          }
        }

        originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
        setIsEditingCell(false);
        setTextareaInput("");
        setEditPosition({ row: null, col: null });
      }
      // 🔹UPDATEモード
      else {
        if (!id || !selectedRowDataQuotationProduct) {
          toast.error(`エラー：データが見つかりませんでした。`);
          return;
        }
        console.log(
          "フィールドアップデート エンターキー",
          " ・フィールド名:",
          fieldName,
          // " ・結合フィールド名:",
          // fieldNameForSelectedRowData,
          " ・元の値:",
          originalValue,
          " ・新たな値:",
          newValue
        );
        // 入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン
        if (originalValue === newValue) {
          console.log("同じためリターン");
          // setIsEditModeField(null); // エディットモードを終了
          setIsEditingCell(false);
          setTextareaInput("");
          setEditPosition({ row: null, col: null });
          return;
        }

        // const updatePayload = {
        //   fieldName: fieldName,
        //   fieldNameForSelectedRowData: fieldNameForSelectedRowData,
        //   newValue: newValue,
        //   id: id,
        // };
        // 入力変換確定状態でエンターキーが押された場合の処理
        // console.log("onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 updatePayload", updatePayload);
        // await updateQuotationFieldMutation.mutateAsync(updatePayload);
        originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
        // setIsEditModeField(null); // エディットモードを終了
        setIsEditingCell(false);
        setTextareaInput("");
        setEditPosition({ row: null, col: null });
      }
    }
  };
  // ================== ✅エンターキーで個別フィールドをアップデート inputタグ✅ ==================

  // ------------------------ 🌟初回マウント時 3点リーダー表示有無🌟 ------------------------
  useEffect(() => {
    Object.entries(gridcellsRef.current).forEach(([key, ref]) => {
      if (ref && ref.offsetWidth < ref.scrollWidth) {
        // refが存在し、かつ、テキストが省略されている場合
        ref.classList.add(`${styles.text_truncated}`);
      }
    });
  }, []);
  // useEffect(() => {
  //   Object.entries(truncatedCells.current).forEach(([key, obj]) => {
  //     const ref = obj.;
  //     if (ref && ref.offsetWidth < ref.scrollWidth) {
  //       // refが存在し、かつ、テキストが省略されている場合
  //       // ref.classList.add(`${styles.text_truncated}`);
  //       obj.isOverflow = true
  //     } else {
  //       obj.isOverflow = false;
  //     }
  //   });
  // }, []);
  // ------------------------ ✅初回マウント時 3点リーダー表示有無✅ ------------------------

  // ------------------------ 🌟セル編集完了時 オーバーフロー状態なら3点リーダークラス付与🌟 ------------------------
  // 編集開始時に「row-${rowIndex}-col-${colIndex}」形式のセルのpositionを保持するref
  const positionRef = useRef<string | null>(null);
  // 編集完了時のinputタグのサイズでdivタグがオーバーフロー状態かどうかを判定する
  const [isOverflow, setIsOverflow] = useState(false);
  useEffect(() => {
    if (!isEditingCell && positionRef.current) {
      // scrollWidthがoffsetWidthを超えている場合は3点リーダーにする
      // const ref = gridcellsRef.current[`row-${rowIndex}-col-${colIndex}`];
      const ref = gridcellsRef.current[positionRef.current];
      console.log(
        "ref?.classList.contains(`${styles.text_truncated}`)",
        ref?.classList.contains(`${styles.text_truncated}`)
      );
      if (ref) {
        if (isOverflow) {
          ref.classList.add(`${styles.text_truncated}`);
        } else if (ref?.classList.contains(`${styles.text_truncated}`)) {
          ref.classList.remove(`${styles.text_truncated}`);
        }
        if (isOverflow) setIsOverflow(false);
      }
      positionRef.current = null;
      if (hoveredItemPos) handleCloseTooltip();
    }
  }, [isEditingCell]);
  // ------------------------ ✅セル編集完了時 オーバーフロー状態なら3点リーダークラス付与✅ ------------------------

  // ------------------------ 🌟商品リストから商品削除時 リセット🌟 ------------------------
  // 選択中の商品データが削除されたらstateとrefを非アクティブにする
  useEffect(() => {
    if (selectedRowDataQuotationProduct === null) {
      console.log("selectedRowDataQuotationProductなし 全てリセット");
      if (!selectedGridCellRef.current) return;
      if (!prevSelectedGridCellRef.current) return;
      prevSelectedGridCellRef.current.setAttribute("aria-selected", "false");
      prevSelectedGridCellRef.current.setAttribute("tabindex", "-1");
      selectedGridCellRef.current.setAttribute("aria-selected", "false");
      selectedGridCellRef.current.setAttribute("tabindex", "-1");
      if (activeCell) setActiveCell(null);
      if (clickActiveRow) setClickedActiveRow(null);
    }
  }, [selectedRowDataQuotationProduct]);
  // ------------------------ ✅商品リストから商品削除時 リセット✅ ------------------------

  // ---------------- 🌟insert/updateモード終了時 or アンマウント時に商品リスト関連をリセット🌟 ----------------
  useEffect(() => {
    if (isUpdateMode) return;
    // インサートモードが終了したら、商品リスト関連のstateを全てリセット
    if (!isInsertMode) {
      setEditPosition({ row: null, col: null });
      setTextareaInput("");
      if (isEditingCell) setIsEditingCell(false);
      if (setSelectedProductsArray) setSelectedProductsArray([]);

      if (!selectedGridCellRef.current) return;
      if (!prevSelectedGridCellRef.current) return;
      prevSelectedGridCellRef.current.setAttribute("aria-selected", "false");
      prevSelectedGridCellRef.current.setAttribute("tabindex", "-1");
      selectedGridCellRef.current.setAttribute("aria-selected", "false");
      selectedGridCellRef.current.setAttribute("tabindex", "-1");
      if (activeCell) setActiveCell(null);
      if (clickActiveRow) setClickedActiveRow(null);
      if (selectedRowDataQuotationProduct) setSelectedRowDataQuotationProduct(null);
    }

    return () => {
      console.log("✅商品リストコンポーネント アンマウント");
      setEditPosition({ row: null, col: null });
      setTextareaInput("");
      if (isEditingCell) setIsEditingCell(false);
      if (setSelectedProductsArray) setSelectedProductsArray([]);

      if (activeCell) setActiveCell(null);
      if (clickActiveRow) setClickedActiveRow(null);
      if (selectedRowDataQuotationProduct) setSelectedRowDataQuotationProduct(null);
    };
  }, [isInsertMode]);
  useEffect(() => {
    if (isInsertMode) return;
    // インサートモードが終了したら、商品リスト関連のstateを全てリセット
    if (!isUpdateMode) {
      setEditPosition({ row: null, col: null });
      setTextareaInput("");
      if (isEditingCell) setIsEditingCell(false);
      if (setSelectedProductsArray) setSelectedProductsArray([]);

      if (!selectedGridCellRef.current) return;
      if (!prevSelectedGridCellRef.current) return;
      prevSelectedGridCellRef.current.setAttribute("aria-selected", "false");
      prevSelectedGridCellRef.current.setAttribute("tabindex", "-1");
      selectedGridCellRef.current.setAttribute("aria-selected", "false");
      selectedGridCellRef.current.setAttribute("tabindex", "-1");
      if (activeCell) setActiveCell(null);
      if (clickActiveRow) setClickedActiveRow(null);
      if (selectedRowDataQuotationProduct) setSelectedRowDataQuotationProduct(null);
    }

    return () => {
      console.log("✅商品リストコンポーネント アンマウント");
      setEditPosition({ row: null, col: null });
      setTextareaInput("");
      if (isEditingCell) setIsEditingCell(false);
      if (setSelectedProductsArray) setSelectedProductsArray([]);

      if (activeCell) setActiveCell(null);
      if (clickActiveRow) setClickedActiveRow(null);
      if (selectedRowDataQuotationProduct) setSelectedRowDataQuotationProduct(null);
    };
  }, [isUpdateMode]);
  // ---------------- ✅insert/updateモード終了 or アンマウント時に商品リスト関連をリセット✅ ----------------

  // ------------------------ 🌟セル編集時のセル以外のクリック監視 編集モード終了🌟 ------------------------
  // 編集中のinputタグ以外をクリックしたら編集モードを解除
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setEditPosition({ row: null, col: null });
        setTextareaInput("");
        setIsEditingCell(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputRef]);
  // ------------------------ ✅セル編集時のセル以外のクリック監視 編集モード終了✅ ------------------------

  console.log(
    "見積商品リストテーブルレンダリング",
    "productsArray",
    productsArray,
    "clickActiveRow",
    clickActiveRow,
    "🔥 activeCell",
    activeCell,
    "🔥 clickActiveRow",
    clickActiveRow,
    "🔥 selectedRowDataQuotationProduct",
    selectedRowDataQuotationProduct
  );

  const editableColumnNameArray = [
    "quotation_product_name",
    "quotation_product_outside_short_name",
    "quotation_product_unit_price",
    "quotation_product_quantity",
  ];

  // 編集後にエンターキーで値を更新するhandleKeyDownUpdateField関数の引数のnewValueに渡す際の前処理関数
  const getNewValueAfterEdit = (text: string, columnName: string, originalValue: any) => {
    if (columnName === "quotation_product_quantity") {
      // 数量は0以外の整数値の場合のみ変更を許可
      const convertedText = convertHalfWidthRoundNumOnly(text);
      const convertedNum = convertedText ? Number(convertedText) : "1";
      // return convertedNum ? convertedNum : originalValue;
      return convertedNum;
    } else if (columnName === "quotation_product_unit_price") {
      // 価格は0と小数点を許容 (多くの通貨では、小数点以下2桁（セント単位）が一般的, 特定の通貨（例: クウェートディナール）では、小数点以下3桁を使用)
      // if (!text || text === "") return "0";
      // const convertedNum = language === "ja" ? convertToYen(text) : Number(convertHalfWidthRoundNumOnly(text, 3));
      const convertedNum = language === "ja" ? convertToYen(text) : Number(convertHalfWidthRoundNumOnly(text, 2));
      return checkNotFalsyExcludeZero(convertedNum) ? convertedNum : Number(originalValue);
    } else {
      return text;
    }
  };

  return (
    <>
      <div
        className={`${styles.right_activity_log_container} ${
          underDisplayFullScreen && `${styles.full_screen}`
        }  w-full bg-[var(--color-bg-under-back)] ${
          isOpenSidebar ? `${styles.open} transition-base02` : `${styles.close} transition-base01`
        } ${tableContainerSize === "half" ? `${styles.company_table_screen_pr}` : ``} ${
          tableContainerSize === "all" ? `${styles.company_table_screen_pr}` : ``
        }`}
      >
        {/* ================== テーブルタブヘッダー ================== */}
        <div className={`${styles.right_table_tab_header}`}>
          <span>商品リスト</span>
        </div>
        {/* ================== Gridスクロールコンテナ ================== */}
        <div
          ref={parentGridScrollContainer}
          role="grid"
          aria-multiselectable="true"
          style={{ width: "100%" }}
          // style={{ height: "100%", "--header-row-height": "35px" } as any}
          className={`${styles.under_grid_scroll_container}`}
        >
          {/* ======================== 🌟Grid列トラック Rowヘッダー🌟 ======================== */}
          <div
            role="row"
            tabIndex={-1}
            aria-rowindex={1}
            aria-selected={false}
            className={`${styles.grid_header_row}`}
            style={
              {
                display: "grid",
                // gridTemplateColumns: `2fr 1fr repeat(6, 1fr)`,
                // gridTemplateColumns: `2fr repeat(3, 1fr) 2fr repeat(3, 1fr)`,
                gridTemplateColumns: `2fr repeat(4, 1fr) 2fr repeat(2, 1fr)`,
                minHeight: "25px",
                //   width: `100%`,
                minWidth: `calc(100vw - var(--sidebar-width) - 20px - 10px - (100vw - var(--sidebar-width) - 20px - 10px) / 3 - 3px)`,
                width: `var(--row-width)`,
                // "--row-width": "800px",
                // "--row-width": "888px",
                // "--row-width": "1200px",
                "--row-width": "1300px",
                // "--row-width": "1170px",
                // "--row-width":
                //   "calc(100vw - var(--sidebar-width) - 20px - 10px - (100vw - var(--sidebar-width) - 20px - 10px) / 3 - 1px + 500px)",
              } as CSSProperties
            }
          >
            {/* ======== ヘッダーセル 全てのプロパティ(フィールド)Column ここから  ======== */}
            {columnHeaderList.map((key, index) => (
              <div
                // key={index}
                key={`ProductList_${key.columnName}`}
                ref={(ref) => (colsRef.current[index] = ref)}
                role="columnheader"
                draggable={false}
                aria-colindex={index + 1}
                aria-selected={false}
                tabIndex={-1}
                className={`${styles.grid_column_header_all}`}
                // style={{ gridColumnStart: index + 1 }}
                style={{
                  gridColumnStart: index + 1,
                  //   ...(columnHeaderList.length - 1 === index && { borderRightStyle: "none" }),
                  ...(index === columnHeaderList.length - 1 && { borderRight: "none" }),
                }}
              >
                <div className={`draggable_column_header pointer-events-none w-full`}>
                  <div
                    className={`${styles.grid_column_header} ${
                      index === 0 && styles.grid_column_header_cursor
                    } pointer-events-none touch-none select-none`}
                  >
                    <div className={`${styles.grid_column_header_inner} pointer-events-none`}>
                      <span
                        className={`${styles.grid_column_header_inner_name} pointer-events-none`}
                        ref={(ref) => (columnHeaderInnerTextRef.current[index] = ref)}
                      >
                        {language === "en" && key.columnName}
                        {language === "ja" && columnNameToJapanese(key.columnName)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* {rowVirtualizer.getVirtualItems().length === 0 && !!selectedRowDataContact && !isLoading && (
            <div className={`flex-col-center h-[calc(100%-25px)] w-full`}>
              <span className={`text-[var(--color-text-sub)]`}>この客先への活動履歴はまだありません。</span>
            </div>
          )} */}
          {/* {!(allRows.length > 0) && !!selectedRowDataContact && isLoading && (
            <div className={`flex h-[calc(100%-25px)] w-full flex-col space-y-[22px] px-[15px] py-[15px]`}>
              <div className="flex flex-col space-y-[10px]">
                <SkeletonLoadingLineFull rounded="rounded-[6px]" />
                <SkeletonLoadingLineFull rounded="rounded-[6px]" />
                <SkeletonLoadingLineMedium rounded="rounded-[6px]" />
              </div>
              <div className="flex flex-col space-y-[10px]">
                <SkeletonLoadingLineLong rounded="rounded-[6px]" />
                <SkeletonLoadingLineShort rounded="rounded-[6px]" />
              </div>
            </div>
          )} */}

          {/* ======================== 🌟Grid列トラック Rowグループコンテナ🌟 ======================== */}
          {/* Rowアイテム収納のためのインナー要素 */}
          {productsArray.length > 0 && (
            <div
              ref={gridRowGroupContainerRef}
              role="rowgroup"
              style={
                {
                  height: `${productsArray.length * 25}px`,
                  //   height: `${10 * 25}px`,
                  width: `var(--row-width)`,
                  position: "relative",
                  "--header-row-height": "25px",
                  "--row-width": "",
                } as any
              }
              className={`${styles.grid_rowgroup_virtualized_container}`}
            >
              {/* {[...productsArray]
                .sort((a, b) => {
                  if (a.quotation_product_priority === null) return 1; // null値をリストの最後に移動
                  if (b.quotation_product_priority === null) return -1;
                  return a.quotation_product_priority - b.quotation_product_priority;
                }) */}
              {sortedProductsList
                // .map((product: { [key: string]: string | number | null }, index: number) => {
                .map((product: QuotationProductsDetail, rowIndex: number) => {
                  return (
                    <div
                      key={`ProductList_${product.product_id}`}
                      role="row"
                      tabIndex={-1}
                      aria-rowindex={rowIndex + 2} // ヘッダーの次からで+1、indexは0からなので+1で、index0に+2
                      aria-selected={clickActiveRow === rowIndex + 2}
                      className={`${styles.grid_row} ${evenRowColorChange ? `${styles.even_color_change}` : ``}`}
                      style={
                        {
                          display: "grid",
                          // gridTemplateColumns: `2fr 1fr repeat(5, 1fr)`,
                          // gridTemplateColumns: `2fr repeat(3, 1fr) 2fr repeat(3, 1fr)`,
                          gridTemplateColumns: `2fr repeat(4, 1fr) 2fr repeat(2, 1fr)`,
                          minHeight: "25px",
                          // width: `100%`,
                          minWidth: `calc(100vw - var(--sidebar-width) - 20px - 10px - (100vw - var(--sidebar-width) - 20px - 10px) / 3 - 3px)`,
                          width: `var(--row-width)`,
                          "--row-width": "1300px",
                          // "--row-width": "1170px",
                          top: ((rowIndex + 0) * 25).toString() + "px", // +1か0か
                        } as CSSProperties
                      }
                    >
                      {columnOrder.map((value, colIndex) => {
                        const columnName = columnHeaderList[colIndex].columnName;
                        //   let displayValue = value;
                        //   // 「日付」のカラムのセルには、formatして表示する
                        //   if (columnName in formatMapping && !!value) {
                        //     displayValue = format(new Date(value), formatMapping[columnName]);
                        //   }
                        let displayValue = (product as { [key: string]: string | number | null })[columnName];
                        if (
                          ["quotation_product_unit_price", "unit_price"].includes(columnName) &&
                          typeof displayValue === "number"
                        ) {
                          displayValue = formatToJapaneseYen(displayValue);
                        }

                        if (
                          editPosition.row === rowIndex &&
                          editPosition.col === colIndex &&
                          isEditingCell &&
                          editableColumnNameArray.includes(columnName)
                        ) {
                          return (
                            <input
                              ref={inputRef}
                              key={`ProductList_Row:${rowIndex}_Col:${colIndex}`}
                              role="gridcell"
                              // aria-colindex={index + 1} // カラムヘッダーの列StateのcolumnIndexと一致させる
                              aria-colindex={
                                columnHeaderList[colIndex] ? columnHeaderList[colIndex]?.columnIndex : colIndex + 2
                              } // カラムヘッダーの列StateのcolumnIndexと一致させる
                              // aria-selected={false}
                              // tabIndex={-1}
                              aria-selected={true}
                              tabIndex={0}
                              type="text"
                              autoFocus
                              autoCapitalize="none"
                              value={textareaInput}
                              // onChange={(e) => setTextareaInput(e.target.value)}
                              onCompositionStart={() => setIsComposing(true)}
                              onCompositionEnd={() => setIsComposing(false)}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (["quotation_product_quantity"].includes(columnName)) {
                                  if (val === "0" || val === "０") {
                                    setTextareaInput("1");
                                  } else {
                                    setTextareaInput(e.target.value);
                                  }
                                } else {
                                  setTextareaInput(e.target.value);
                                }
                              }}
                              onKeyDown={(e) => {
                                // 編集内容を更新
                                handleKeyDownUpdateField({
                                  e,
                                  fieldName: columnName as EditableFieldNames,
                                  // fieldNameForSelectedRowData: columnName as EditableFieldNames,
                                  originalValue: originalValueFieldEdit.current,
                                  newValue: getNewValueAfterEdit(
                                    textareaInput,
                                    columnName,
                                    originalValueFieldEdit.current
                                  ),
                                  id: sortedProductsList[rowIndex]?.product_id,
                                  required: ["quotation_product_quantity"].includes(columnName),
                                  rowIndex: rowIndex,
                                  colIndex: colIndex,
                                });
                              }}
                              className={`${styles.grid_cell} ${styles.grid_cell_resizable} ${styles.edit_mode} ${
                                editableColumnNameArray.includes(columnHeaderList[colIndex].columnName)
                                  ? `${styles.editable}`
                                  : ``
                              }`}
                              style={{
                                gridColumnStart: colIndex + 1,
                                ...(editableColumnNameArray.includes(columnHeaderList[colIndex].columnName) && {
                                  cursor: "text",
                                }),
                                // ...(columnHeaderList.length - 1 === index && { borderRight: "none" }),
                                ...(colIndex === columnHeaderList.length - 1 && { borderRight: "none" }),
                                width: "100%",
                              }}
                            />
                          );
                        } else {
                          return (
                            <div
                              ref={(ref) => (gridcellsRef.current[`row-${rowIndex}-col-${colIndex}`] = ref)}
                              // ref={(ref) => (truncatedCellsRef.current[`row-${rowIndex}-col-${colIndex}`].el = ref)}
                              key={`ProductList_Row:${rowIndex}_Col:${colIndex}`}
                              role="gridcell"
                              // aria-colindex={index + 1} // カラムヘッダーの列StateのcolumnIndexと一致させる
                              aria-colindex={
                                columnHeaderList[colIndex] ? columnHeaderList[colIndex]?.columnIndex : colIndex + 2
                              } // カラムヘッダーの列StateのcolumnIndexと一致させる
                              aria-selected={false}
                              tabIndex={-1}
                              className={`${styles.grid_cell} ${styles.grid_cell_resizable} ${
                                editableColumnNameArray.includes(columnHeaderList[colIndex].columnName) &&
                                (isInsertMode || isUpdateMode)
                                  ? `${styles.editable}`
                                  : ``
                              }`}
                              style={{
                                gridColumnStart: colIndex + 1,
                                ...(editableColumnNameArray.includes(columnHeaderList[colIndex].columnName) &&
                                  (isInsertMode || isUpdateMode) && {
                                    cursor: "pointer",
                                  }),
                                // ...(columnHeaderList.length - 1 === index && { borderRight: "none" }),
                                ...(colIndex === columnHeaderList.length - 1 && { borderRight: "none" }),
                              }}
                              onMouseEnter={(e) => {
                                if (e.currentTarget.classList.contains(`${styles.text_truncated}`)) {
                                  handleOpenTooltip({
                                    e: e,
                                    display: "top",
                                    content:
                                      typeof displayValue === "number" ? displayValue.toString() : displayValue ?? "",
                                    // marginTop: 48,
                                    // marginTop: 27,
                                    marginTop: 9,
                                  });
                                }
                              }}
                              onMouseLeave={() => {
                                if (hoveredItemPos) handleCloseTooltip();
                              }}
                              onClick={(e) => {
                                // handleSingleClickGridCell(
                                //   e,
                                //   [
                                //     "quotation_product_name",
                                //     "quotation_product_outside_short_name",
                                //     "quotation_product_unit_price",
                                //   ].includes(columnHeaderList[colIndex].columnName)
                                // )
                                handleSingleClickGridCell(
                                  e,
                                  colIndex,
                                  columnHeaderList[colIndex].columnName,
                                  rowIndex,
                                  editableColumnNameArray.includes(columnHeaderList[colIndex].columnName) &&
                                    (isInsertMode || isUpdateMode)
                                );
                              }}
                              onDoubleClick={(e) =>
                                handleDoubleClickGridCell(
                                  e,
                                  colIndex,
                                  columnHeaderList[colIndex].columnName,
                                  rowIndex,
                                  editableColumnNameArray.includes(columnHeaderList[colIndex].columnName) &&
                                    (isInsertMode || isUpdateMode)
                                )
                              }
                            >
                              {/* <span className="truncate">{displayValue}</span> */}
                              {displayValue}
                            </div>
                          );
                        }
                      })}
                    </div>
                  );
                })}

              {/* {Array(10)
                .fill(null)
                .map((item, index) => (
                  <div
                    key={"temp" + index.toString()}
                    role="row"
                    tabIndex={-1}
                    aria-rowindex={index + 0 + 2} // ヘッダーの次からで+1、indexは0からなので+1で、index0に+2
                    aria-selected={false}
                    className={`${styles.grid_row}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: `2fr 1fr repeat(5, 1fr)`,
                      minHeight: "25px",
                      width: `100%`,
                      top: ((index + 0 + 0) * 25).toString() + "px", // +1か0か
                    }}
                  >
                    {columnOrder.map((value, index) => {
                      return (
                        <div
                          key={"tempRow" + index.toString()}
                          role="gridcell"
                          aria-colindex={index + 1} // カラムヘッダーの列StateのcolumnIndexと一致させる
                          aria-selected={false}
                          tabIndex={-1}
                          className={`${styles.grid_cell} ${styles.grid_cell_resizable}`}
                          style={{
                            gridColumnStart: index + 1,
                            ...(columnHeaderList[index] === "summary" && { cursor: "pointer" }),
                            ...(columnHeaderList.length - 1 === index && { borderRight: "none" }),
                          }}
                          onClick={handleSingleClickGridCell}
                          onDoubleClick={(e) => handleDoubleClickGridCell(e, index, columnHeaderList[index])}
                        >
                          佐藤
                        </div>
                      );
                    })}
                  </div>
                ))} */}
            </div>
          )}
          {/* ======================== Grid列トラック Row ======================== */}
        </div>
        {/* <div ref={shadowRef} className={`${styles.show}`}></div> */}
        {/* ================== Gridスクロールコンテナ ここまで ================== */}
        {/* =============== Gridフッター ここから スクロールコンテナと同列で配置 =============== */}
        {/* <ContactUnderRightGridTableFooter getItemCount={allRows.length} /> */}
        {/* <UnderRightGridTableFooter getItemCount={allRows.length} getTotalCount={data ? data.pages[0].count : 0} /> */}
        <div className={styles.grid_footer}>
          <div className={styles.grid_footer_inner}>
            <div className={`${styles.grid_pagination} space-x-3 px-[10px] `}>
              <div className=" focus:outline-scale-600 pointer-events-none flex rounded bg-transparent  p-0 outline-offset-1 transition-all focus:outline-4">
                <span className=" font-regular text-scale-1200 bordershadow-scale-600 hover:bordershadow-scale-700 dark:bordershadow-scale-800 hover:dark:bordershadow-scale-900 focus-visible:outline-scale-700 relative inline-flex items-center space-x-2 rounded border border-[#777] bg-transparent px-[0px] text-center text-[12px] shadow-sm  duration-200 ease-out focus-visible:outline-4 focus-visible:outline-offset-1">
                  <span className="truncate ">
                    {language === "ja" &&
                      `${
                        productsArray !== null && productsArray !== undefined && productsArray.length > 0
                          ? productsArray.length
                          : `-`
                      } 件`}
                    {language === "en" &&
                      `${
                        productsArray !== null && productsArray !== undefined && productsArray.length > 0
                          ? productsArray.length
                          : `-`
                      } rows`}
                  </span>
                </span>
              </div>
              {/* <p className="pointer-events-none space-x-2 text-[13px] font-medium text-[#bbb]">
                <span>/</span>
                <span>
                  {language === "ja" && `${productsArray.length === null ? "-" : productsArray.length} 件`}
                  {language === "en" && `${productsArray.length === null ? "-" : productsArray.length} records`}
                </span>
              </p> */}
            </div>
          </div>
        </div>
        {/* ================== Gridフッター ここまで ================== */}
      </div>
    </>
  );
};

export const ProductListTable = memo(ProductListTableMemo);
