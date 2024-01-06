import React, { useEffect, useRef, useState } from "react";
import styles from "./InsertNewProductModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { useMutateProduct } from "@/hooks/useMutateProduct";
import { ImInfo } from "react-icons/im";
import useStore from "@/store";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { convertToYen } from "@/utils/Helpers/convertToYen";
import { Department, Office, Unit } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

export const InsertNewProductModal = () => {
  const setIsOpenInsertNewProductModal = useDashboardStore((state) => state.setIsOpenInsertNewProductModal);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  const [productName, setProductName] = useState("");
  // const [unitPrice, setUnitPrice] = useState<number | null>(null);
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [insideShortName, setInsideShortName] = useState("");
  const [outsideShortName, setOutsideShortName] = useState("");
  const [createdByDepartment, setCreatedByDepartment] = useState("");
  const [createdByUnit, setCreatedByUnit] = useState("");
  const [createdByOffice, setCreatedByOffice] = useState("");

  const queryClient = useQueryClient();
  const { createProductMutation } = useMutateProduct();

  // ================================ 🌟事業部、係、事業所リスト取得useQuery🌟 ================================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ================================ ✅事業部、係、事業所リスト取得useQuery✅ ================================
  // ======================= 🌟現在の選択した事業部で係・チームを絞り込むuseEffect🌟 =======================
  const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  useEffect(() => {
    // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
    if (!unitDataArray || unitDataArray?.length === 0 || !createdByDepartment)
      return setFilteredUnitBySelectedDepartment([]);

    // 選択中の事業部が変化するか、unitDataArrayの内容に変更があったら新たに絞り込んで更新する
    if (unitDataArray && unitDataArray.length >= 1 && createdByDepartment) {
      const filteredUnitArray = unitDataArray.filter((unit) => unit.created_by_department_id === createdByDepartment);
      setFilteredUnitBySelectedDepartment(filteredUnitArray);
      // 選択中の係が現在選択中の事業部と異なるなら係をリセットする
      setCreatedByUnit("");
    }
  }, [unitDataArray, createdByDepartment]);
  // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    setIsOpenInsertNewProductModal(false);
  };
  const handleSaveAndClose = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!ProductType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    // if (!selectedRowDataActivity?.company_id) return alert("相手先の会社情報が存在しません");
    // if (!selectedRowDataActivity?.contact_id) return alert("担当者情報が存在しません");
    if (productName === "") return alert("製品・サービス名を入力してください");
    if (!unitPrice) return alert("単価を入力してください");

    setLoadingGlobalState(true);

    // 新規作成するデータをオブジェクトにまとめる
    const newProduct = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: createdByDepartment ? createdByDepartment : null,
      created_by_unit_of_user: createdByUnit ? createdByUnit : null,
      created_by_office_of_user: createdByOffice ? createdByOffice : null,
      product_name: productName,
      // unit_price: unitPrice,
      unit_price:
        unitPrice !== null && unitPrice !== undefined && unitPrice !== ""
          ? parseInt(unitPrice.replace(/,/g, ""), 10)
          : null, // 0以外のfalsyならnullをセット 0円は許容
      inside_short_name: insideShortName ? insideShortName : null,
      outside_short_name: outsideShortName ? outsideShortName : null,
    };

    // supabaseにINSERT
    createProductMutation.mutate(newProduct);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewProductModal(false);
  };

  // 全角文字を半角に変換する関数
  const toHalfWidth = (strVal: string) => {
    // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
    return strVal.replace(/[！-～]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
    });
    // .replace(/　/g, " "); // 全角スペースを半角スペースに
  };
  const toHalfWidthAndSpace = (strVal: string) => {
    // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
    return strVal
      .replace(/[！-～]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
      })
      .replace(/　/g, " "); // 全角スペースを半角スペースに
  };

  // 全角を半角に変換する関数
  function zenkakuToHankaku(str: string) {
    const zen = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];
    const han = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    for (let i = 0; i < zen.length; i++) {
      const regex = new RegExp(zen[i], "g");
      str = str.replace(regex, han[i]);
    }

    return str;
  }

  // ================================ ツールチップ ================================
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    content3?: string | undefined | null;
    content4?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
    whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
  };
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemPosModal = useStore((state) => state.hoveredItemPosModal);
  const setHoveredItemPosModal = useStore((state) => state.setHoveredItemPosModal);
  // const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    content3,
    content4,
    marginTop,
    itemsPosition = "center",
    whiteSpace,
  }: TooltipParams) => {
    // モーダルコンテナのleftを取得する
    if (!modalContainerRef.current) return;
    const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
    const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
    const containerWidth = modalContainerRef.current?.getBoundingClientRect().width;
    const containerHeight = modalContainerRef.current?.getBoundingClientRect().height;
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
    //   ? ((e.target as HTMLDivElement).dataset.text2 as string)
    //   : "";
    // const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
    //   ? ((e.target as HTMLDivElement).dataset.text3 as string)
    //   : "";
    setHoveredItemPosModal({
      x: x - containerLeft,
      y: y - containerTop,
      itemWidth: width,
      itemHeight: height,
      containerLeft: containerLeft,
      containerTop: containerTop,
      containerWidth: containerWidth,
      containerHeight: containerHeight,
      content: content,
      content2: content2,
      content3: content3,
      content4: content4,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
      whiteSpace: whiteSpace,
    });
  };
  // ============================================================================================
  // ================================ ツールチップを非表示 ================================
  const handleCloseTooltip = () => {
    setHoveredItemPosModal(null);
  };
  // ============================================================================================

  console.log("面談予定作成モーダル ");

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {/* ローディングオーバーレイ */}
      {loadingGlobalState && (
        <div className={`${styles.loading_overlay_modal_outside}`}>
          <div className={`${styles.loading_overlay_modal_inside}`}>
            <SpinnerIDS scale={"scale-[0.5]"} />
          </div>
        </div>
      )}
      <div className={`${styles.container} `} ref={modalContainerRef}>
        {/* ツールチップ */}
        {hoveredItemPosModal && <TooltipModal />}
        {/* 保存・タイトル・キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[20px] text-center text-[18px]">
          <div className="cursor-pointer select-none font-semibold hover:text-[#aaa]" onClick={handleCancelAndReset}>
            キャンセル
          </div>
          <div className="-translate-x-[25px] select-none font-bold">自社商品 追加</div>

          <div
            className={`cursor-pointer font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
            onClick={handleSaveAndClose}
          >
            保存
          </div>
        </div>
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 製品・サービス名 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} !min-w-[140px]`}>製品・サービス名</span> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "商品ごとにデータを管理することが可能となります。",
                          content2: "この商品名が見積書の品名に記載されます。",
                          // marginTop: 57,
                          // marginTop: 38,
                          marginTop: 9,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      {/* <span className={`mr-[6px]`}>展開四半期</span> */}
                      <div className={`mr-[8px] flex flex-col text-[15px]`}>
                        <span className={``}>商品名・</span>
                        <span className={``}>サービス名</span>
                      </div>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <input
                      type="text"
                      placeholder="商品名を入力"
                      required
                      className={`${styles.input_box}`}
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      onBlur={() => setProductName(toHalfWidth(productName.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 単価 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} !min-w-[140px]`}>単価（円）</span> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "円単位でデータを管理します。",
                          content2: "600万円と入力しても円単位に自動補完されます。",
                          // marginTop: 57,
                          marginTop: 39,
                          // marginTop: 10,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`mr-[6px]`}>単価（円）</span>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    {/* <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder="例：600万円 → 6000000　※半角で入力"
                      value={unitPrice === null ? "" : unitPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setUnitPrice(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setUnitPrice(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setUnitPrice(numValue);
                          }
                        }
                      }}
                    /> */}
                    <input
                      type="text"
                      placeholder="例：600万円 → 6000000　※半角で入力"
                      className={`${styles.input_box}`}
                      value={!!unitPrice ? unitPrice : ""}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      onBlur={() =>
                        setUnitPrice(
                          !!unitPrice && unitPrice !== ""
                            ? (convertToYen(unitPrice.trim()) as number).toLocaleString()
                            : ""
                        )
                      }
                      // onBlur={() =>
                      //   setUnitPrice(
                      //     !!unitPrice && unitPrice !== "" ? (convertToYen(unitPrice.trim()) as number).toString() : ""
                      //   )
                      // }
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 型式・名称(顧客向け) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <div className={`${styles.title} flex !min-w-[140px] flex-col !text-[15px]`}>
                      <span>型式・名称</span>
                      <span>(顧客向け)</span>
                    </div> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "型式が存在する場合に使用します。",
                          content2: "型式を入力した場合、顧客向けの見積書の品名の隣に型式が記載されます。",
                          // marginTop: 57,
                          // marginTop: 38,
                          marginTop: 12,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      {/* <span className={`mr-[6px]`}>展開四半期</span> */}
                      <div className={`mr-[8px] flex flex-col text-[15px]`}>
                        <span className={``}>型式・名称</span>
                        <span className={``}>(顧客向け)</span>
                      </div>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <input
                      type="text"
                      placeholder="型式が存在する商品は入力"
                      required
                      className={`${styles.input_box} placeholder:text-[14px]`}
                      value={outsideShortName}
                      onChange={(e) => setOutsideShortName(e.target.value)}
                      onBlur={() => setOutsideShortName(toHalfWidth(outsideShortName.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 略称(社内向け) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <div className={`${styles.title} flex !min-w-[140px] flex-col !text-[15px]`}>
                      <span>型式・略称</span>
                      <span>(社内向け)</span>
                    </div> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          // content: "社内向け商品を略称で使用している場合に使用します。",
                          content: "情報漏洩対策など社内向けに商品の略称を使用している場合に使用します。",
                          content2: "こちらを入力することでデータベース上での表記に使用されます。",
                          // marginTop: 57,
                          // marginTop: 39,
                          // marginTop: 33,
                          marginTop: 12,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      {/* <span className={`mr-[6px]`}>展開四半期</span> */}
                      <div className={`mr-[8px] flex flex-col text-[15px]`}>
                        <span className={``}>型式・略称</span>
                        <span className={``}>(社内向け)</span>
                      </div>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <input
                      type="text"
                      placeholder="社内で使用する略称があれば入力　例：KI2, KIX 等"
                      className={`${styles.input_box} placeholder:text-[13px]`}
                      value={insideShortName}
                      onChange={(e) => setInsideShortName(e.target.value)}
                      onBlur={() => setInsideShortName(toHalfWidth(insideShortName.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 型式・名称(顧客向け) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <div className={`${styles.title} flex !min-w-[140px] flex-col !text-[15px]`}>
                      <span>型式・名称</span>
                      <span>(顧客向け)</span>
                    </div> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "事業部別に商品を作成する場合に使用します。",
                          // content2: "型式を入力した場合、顧客向けの見積書の品名の隣に型式が記載されます。",
                          // marginTop: 57,
                          // marginTop: 38,
                          marginTop: 12,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`mr-[0px]`}>事業部</span>
                      {/* <div className={`mr-[8px] flex flex-col text-[15px]`}>
                        <span className={``}>型式・名称</span>
                        <span className={``}>(顧客向け)</span>
                      </div> */}
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={createdByDepartment ? createdByDepartment : ""}
                      onChange={(e) => setCreatedByDepartment(e.target.value)}
                    >
                      <option value=""></option>
                      {departmentDataArray &&
                        departmentDataArray.length >= 1 &&
                        departmentDataArray.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.department_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 略称(社内向け) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <div className={`${styles.title} flex !min-w-[140px] flex-col !text-[15px]`}>
                      <span>型式・略称</span>
                      <span>(社内向け)</span>
                    </div> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          // content: "社内向け商品を略称で使用している場合に使用します。",
                          content: "係・チーム別に商品を作成する場合に使用します。",
                          // content2: "こちらを入力することでデータベース上での表記に使用されます。",
                          // marginTop: 57,
                          // marginTop: 39,
                          // marginTop: 33,
                          marginTop: 12,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`mr-[8px]`}>係・チーム</span>
                      {/* <div className={`mr-[8px] flex flex-col text-[15px]`}>
                        <span className={``}>型式・略称</span>
                        <span className={``}>(社内向け)</span>
                      </div> */}
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <select
                      className={`ml-auto h-full w-full rounded-[4px] ${styles.select_box} ${styles.min} ${
                        !filteredUnitBySelectedDepartment || filteredUnitBySelectedDepartment?.length === 0
                          ? `cursor-not-allowed`
                          : `cursor-pointer`
                      }`}
                      value={createdByUnit ? createdByUnit : ""}
                      onChange={(e) => setCreatedByUnit(e.target.value)}
                    >
                      {/* {(!filteredUnitBySelectedDepartment || filteredUnitBySelectedDepartment?.length === 0) && (
                        <option value="">先に事業部を選択してください</option>
                      )} */}
                      {filteredUnitBySelectedDepartment && filteredUnitBySelectedDepartment.length >= 1 && (
                        <option value=""></option>
                      )}
                      {filteredUnitBySelectedDepartment &&
                        filteredUnitBySelectedDepartment.length >= 1 &&
                        filteredUnitBySelectedDepartment.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.unit_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 型式・名称(顧客向け) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <div className={`${styles.title} flex !min-w-[140px] flex-col !text-[15px]`}>
                      <span>型式・名称</span>
                      <span>(顧客向け)</span>
                    </div> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "事業所・営業所別に商品を作成する場合に使用します。",
                          // content2: "型式を入力した場合、顧客向けの見積書の品名の隣に型式が記載されます。",
                          // marginTop: 57,
                          // marginTop: 38,
                          marginTop: 12,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      {/* <span className={`mr-[8px]`}>事業所・営業所</span> */}
                      <div className={`mr-[0px] flex flex-col text-[15px]`}>
                        <span className={``}>事業所・</span>
                        <span className={``}>営業所</span>
                      </div>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={createdByOffice ? createdByOffice : ""}
                      onChange={(e) => setCreatedByOffice(e.target.value)}
                    >
                      <option value=""></option>
                      {officeDataArray &&
                        officeDataArray.length >= 1 &&
                        officeDataArray.map((office) => (
                          <option key={office.id} value={office.id}>
                            {office.office_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 略称(社内向け) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}></div>
                  {/* <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* メインコンテンツ コンテナ ここまで */}
        </div>
      </div>
    </>
  );
};
