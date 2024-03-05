import React, { useEffect, useRef, useState } from "react";
import styles from "./UpdateProductModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { useMutateProduct } from "@/hooks/useMutateProduct";
import useStore from "@/store";
import { ImInfo } from "react-icons/im";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { convertToYen } from "@/utils/Helpers/convertToYen";
import { useQueryClient } from "@tanstack/react-query";
import { Department, Office, Section, Unit } from "@/types";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";

export const UpdateProductModal = () => {
  const setIsOpenUpdateProductModal = useDashboardStore((state) => state.setIsOpenUpdateProductModal);
  const editedProduct = useDashboardStore((state) => state.editedProduct);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  const [productName, setProductName] = useState(editedProduct.product_name);
  // const [unitPrice, setUnitPrice] = useState<number | null>(editedProduct.unit_price);
  const [unitPrice, setUnitPrice] = useState<string>(editedProduct.unit_price);
  const [insideShortName, setInsideShortName] = useState(editedProduct.inside_short_name);
  const [outsideShortName, setOutsideShortName] = useState(editedProduct.outside_short_name);
  const [createdByDepartment, setCreatedByDepartment] = useState(
    editedProduct.created_by_department_of_user ? editedProduct.created_by_department_of_user : ""
  );
  const [createdBySection, setCreatedBySection] = useState(
    editedProduct.created_by_section_of_user ? editedProduct.created_by_section_of_user : ""
  );
  const [createdByUnit, setCreatedByUnit] = useState(
    editedProduct.created_by_unit_of_user ? editedProduct.created_by_unit_of_user : ""
  );
  const [createdByOffice, setCreatedByOffice] = useState(
    editedProduct.created_by_office_of_user ? editedProduct.created_by_office_of_user : ""
  );

  const queryClient = useQueryClient();
  const { updateProductMutation } = useMutateProduct();

  // ================================ 🌟事業部、係、事業所リスト取得useQuery🌟 ================================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const sectionDataArray: Section[] | undefined = queryClient.getQueryData(["sections"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ================================ ✅事業部、係、事業所リスト取得useQuery✅ ================================

  // 課ありパターン
  // ======================= 🌟現在の選択した事業部で課を絞り込むuseEffect🌟 =======================
  const [filteredSectionBySelectedDepartment, setFilteredSectionBySelectedDepartment] = useState<Section[]>([]);
  useEffect(() => {
    // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
    if (!sectionDataArray || sectionDataArray?.length === 0 || !createdByDepartment)
      return setFilteredSectionBySelectedDepartment([]);

    // 選択中の事業部が変化するか、sectionDataArrayの内容に変更があったら新たに絞り込んで更新する
    if (sectionDataArray && sectionDataArray.length >= 1 && createdByDepartment) {
      const filteredSectionArray = sectionDataArray.filter(
        (section) => section.created_by_department_id === createdByDepartment
      );
      setFilteredSectionBySelectedDepartment(filteredSectionArray);
    }
  }, [sectionDataArray, createdByDepartment]);
  // ======================= ✅現在の選択した事業部で課を絞り込むuseEffect✅ =======================

  // 課ありパターン
  // ======================= 🌟現在の選択した課で係・チームを絞り込むuseEffect🌟 =======================
  const [filteredUnitBySelectedSection, setFilteredUnitBySelectedSection] = useState<Unit[]>([]);
  useEffect(() => {
    // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
    if (!unitDataArray || unitDataArray?.length === 0 || !createdBySection) return setFilteredUnitBySelectedSection([]);

    // 選択中の課が変化するか、unitDataArrayの内容に変更があったら新たに絞り込んで更新する
    if (unitDataArray && unitDataArray.length >= 1 && createdBySection) {
      const filteredUnitArray = unitDataArray.filter((unit) => unit.created_by_section_id === createdBySection);
      setFilteredUnitBySelectedSection(filteredUnitArray);
    }
  }, [unitDataArray, createdBySection]);
  // ======================= ✅現在の選択した課で係・チームを絞り込むuseEffect✅ =======================

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    setIsOpenUpdateProductModal(false);
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

    // 更新するデータをオブジェクトにまとめる
    const newProduct = {
      id: editedProduct.id,
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: createdByDepartment ? createdByDepartment : null,
      created_by_section_of_user: createdBySection ? createdBySection : null,
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

    // supabaseにUPDATE
    updateProductMutation.mutate(newProduct);

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

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {/* ローディングオーバーレイ */}
      {loadingGlobalState && (
        <div className={`${styles.loading_overlay_modal} `}>
          {/* <SpinnerComet w="48px" h="48px" s="5px" /> */}
          <div className={`${styles.loading_overlay_modal_inside}`}>
            <SpinnerBrand withBorder withShadow />
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
          <div className="-translate-x-[25px] select-none font-bold">自社商品・サービス 編集</div>

          <div
            className={`cursor-pointer select-none font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text}`}
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
                    {/* <span className={`${styles.title} !min-w-[140px]`}>商品・サービス名</span> */}
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
                          marginTop: 12,
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
                      placeholder=""
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
                    {/* <span className={`${styles.title} !min-w-[140px]`}>単価</span> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "円単位でデータを管理します。",
                          content2: "600万円と入力しても円単位に自動補完されます。",
                          // marginTop: 57,
                          // marginTop: 39,
                          marginTop: 12,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`mr-[6px]`}>単価（円）</span>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
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
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
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
                      placeholder=""
                      className={`${styles.input_box}`}
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
              {/* 事業部 */}
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
                      <span className={`mr-[8px] min-w-[80px]`}>事業部</span>
                      {/* <div className={`mr-[8px] flex flex-col text-[15px]`}>
                        <span className={``}>型式・名称</span>
                        <span className={``}>(顧客向け)</span>
                      </div> */}
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={createdByDepartment ? createdByDepartment : ""}
                      onChange={(e) => {
                        setCreatedByDepartment(e.target.value);
                        // 課・係リセット
                        if (createdBySection) setCreatedBySection("");
                        if (createdByUnit) setCreatedByUnit("");
                      }}
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
              {/* 課・セクション */}
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
                          content: "課・セクション別に商品を作成する場合に使用します。",
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
                      {/* <span className={`mr-[8px]`}>課・セクション</span> */}
                      <div className={`mr-[8px] flex min-w-[80px] flex-col text-[15px]`}>
                        <span className={``}>課・</span>
                        <span className={``}>セクション</span>
                      </div>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    {filteredSectionBySelectedDepartment && filteredSectionBySelectedDepartment.length >= 1 && (
                      <select
                        className={`ml-auto h-full w-full rounded-[4px] ${styles.select_box} ${styles.min} ${
                          !filteredSectionBySelectedDepartment || filteredSectionBySelectedDepartment?.length === 0
                            ? `cursor-not-allowed`
                            : `cursor-pointer`
                        }`}
                        value={createdBySection ? createdBySection : ""}
                        onChange={(e) => {
                          if (
                            !filteredSectionBySelectedDepartment ||
                            filteredSectionBySelectedDepartment?.length === 0
                          ) {
                            return;
                          }
                          setCreatedBySection(e.target.value);
                          // 係リセット
                          if (createdBySection) setCreatedBySection("");
                        }}
                      >
                        {/* {(!filteredSectionBySelectedDepartment || filteredSectionBySelectedDepartment?.length === 0) && (
                        <option value="">先に事業部を選択してください</option>
                      )} */}
                        {/* {filteredSectionBySelectedDepartment && filteredSectionBySelectedDepartment.length >= 1 && (
                        <option value=""></option>
                      )} */}
                        <option value=""></option>
                        {filteredSectionBySelectedDepartment &&
                          filteredSectionBySelectedDepartment.length >= 1 &&
                          filteredSectionBySelectedDepartment.map((section) => (
                            <option key={section.id} value={section.id}>
                              {section.section_name}
                            </option>
                          ))}
                      </select>
                    )}
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
              {/* 係・チーム */}
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
                      <span className={`mr-[8px] min-w-[80px]`}>係・チーム</span>
                      {/* <div className={`mr-[8px] flex flex-col text-[15px]`}>
                        <span className={``}>型式・略称</span>
                        <span className={``}>(社内向け)</span>
                      </div> */}
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    {filteredUnitBySelectedSection && filteredUnitBySelectedSection.length >= 1 && (
                      <select
                        className={`ml-auto h-full w-full rounded-[4px] ${styles.select_box} ${styles.min} ${
                          !filteredUnitBySelectedSection || filteredUnitBySelectedSection?.length === 0
                            ? `cursor-not-allowed`
                            : `cursor-pointer`
                        }`}
                        value={createdByUnit ? createdByUnit : ""}
                        onChange={(e) => {
                          setCreatedByUnit(e.target.value);
                        }}
                      >
                        {/* {(!filteredUnitBySelectedSection || filteredUnitBySelectedSection?.length === 0) && (
                        <option value="">先に事業部を選択してください</option>
                      )} */}
                        {/* {filteredUnitBySelectedSection && filteredUnitBySelectedSection.length >= 1 && (
                        <option value=""></option>
                      )} */}
                        <option value=""></option>
                        {filteredUnitBySelectedSection &&
                          filteredUnitBySelectedSection.length >= 1 &&
                          filteredUnitBySelectedSection.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.unit_name}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 事業所 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full  w-full flex-col pr-[20px]">
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
                      <div className={`mr-[8px] flex min-w-[80px] flex-col text-[15px]`}>
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
