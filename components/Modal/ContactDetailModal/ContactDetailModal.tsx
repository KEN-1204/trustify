import React, { useEffect, useRef, useState } from "react";
import styles from "./ContactDetailModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN } from "lodash";
import { useMutateContact } from "@/hooks/useMutateContact";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { BsChevronLeft } from "react-icons/bs";
import { convertToMillions } from "@/utils/Helpers/convertToMillions";
import {
  getOccupationName,
  getPositionClassName,
  optionsOccupation,
  optionsPositionsClass,
} from "@/utils/selectOptions";
import { useQueryContactOnly } from "@/hooks/useQueryContactOnly";
import useStore from "@/store";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { Zoom } from "@/utils/Helpers/toastHelpers";

export const ContactDetailModal = () => {
  const language = useStore((state) => state.language);
  const setIsOpenContactDetailModal = useDashboardStore((state) => state.setIsOpenContactDetailModal);
  // const [isLoading, setIsLoading] = useState(false);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  //   const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  // const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
  const selectedRowDataQuotation = useDashboardStore((state) => state.selectedRowDataQuotation);
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  const getRowData = () => {
    // if (selectedRowDataContact) return selectedRowDataContact;
    if (selectedRowDataActivity) return selectedRowDataActivity;
    if (selectedRowDataMeeting) return selectedRowDataMeeting;
    if (selectedRowDataProperty) return selectedRowDataProperty;
    if (selectedRowDataQuotation) return selectedRowDataQuotation;
  };

  const selectedRowData = getRowData();

  const { data: companyContact, isLoading, isError } = useQueryContactOnly(selectedRowData?.contact_id);

  console.log("companyContact", companyContact, "selectedRowData", selectedRowData);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    setIsOpenContactDetailModal(false);
  };

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
    maxWidth?: number;
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
    maxWidth,
  }: TooltipParams) => {
    // モーダルコンテナのleftを取得する
    if (!modalContainerRef.current) return;
    const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
    const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
    const containerWidth = modalContainerRef.current?.getBoundingClientRect().width;
    const containerHeight = modalContainerRef.current?.getBoundingClientRect().height;
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
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
      maxWidth: maxWidth,
    });
  };
  // ============================================================================================
  // ================================ ツールチップを非表示 ================================
  const handleCloseTooltip = () => {
    setHoveredItemPosModal(null);
  };
  // ============================================================================================

  const formatDisplayPrice = (price: number | string): string => {
    switch (language) {
      case "ja":
        const priceNum = typeof price === "number" ? price : Number(price);
        // return formatToJapaneseYen(priceNum, true, false);
        return priceNum.toLocaleString();
        break;
      default:
        return typeof price === "number" ? price.toString() : price;
        break;
    }
  };

  const Fallback = () => (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[20px] text-center text-[18px]">
        <div className="relative min-w-[150px] text-start font-semibold">
          <div
            className="flex max-w-max cursor-pointer select-none items-center hover:text-[#aaa]"
            onClick={handleCancelAndReset}
          >
            <div className="h-full min-w-[20px]"></div>
            <BsChevronLeft className="z-1 absolute  left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" />
            <span>戻る</span>
          </div>
        </div>
        <div className="min-w-[150px] select-none font-bold">担当者 詳細</div>
        <div
          className={`min-w-[150px] cursor-pointer select-none text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text}`}
          // onClick={handleSaveAndClose}
        >
          {/* 保存 */}
        </div>
      </div>
      <div className={`${styles.main_contents_container} flex-center`}>
        {isError && <span>エラーが発生しました。</span>}
      </div>
    </>
  );

  if (isError)
    return (
      <>
        <Fallback />
      </>
    );

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      <div className={`${styles.container} fade03`} ref={modalContainerRef}>
        {/* ツールチップ */}
        {hoveredItemPosModal && <TooltipModal />}
        {/* 保存・タイトル・キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[30px] text-center text-[18px]">
          {/* <div
            className="min-w-[150px] cursor-pointer select-none text-start font-semibold hover:text-[#aaa]"
            onClick={handleCancelAndReset}
          >
            キャンセル
          </div> */}
          <div className="relative min-w-[150px] text-start font-semibold">
            <div
              className="flex max-w-max cursor-pointer select-none items-center hover:text-[#aaa]"
              onClick={handleCancelAndReset}
            >
              <div className="h-full min-w-[20px]"></div>
              <BsChevronLeft className="z-1 absolute  left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" />
              <span>戻る</span>
            </div>
          </div>
          <div className="min-w-[150px] select-none font-bold">担当者 詳細</div>
          <div
            className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
            // onClick={handleSaveAndClose}
          >
            {/* 保存 */}
          </div>
        </div>

        <div className="min-h-[2px] w-full bg-[var(--color-bg-brand-f)]"></div>

        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container} `}>
          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 会社名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>会社名</span>
                  <span className={`${styles.value} ${styles.value_highlight}`}>
                    {companyContact?.company_name ? companyContact?.company_name : ""}
                  </span>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 部署名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>部署名</span>
                  <span className={`${styles.value}`}>
                    {companyContact?.company_department_name ? companyContact?.company_department_name : ""}
                  </span>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* ●担当名 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.required_title}`}>●担当名</span>
                    <span className={`${styles.value} ${styles.value_highlight}`}>
                      {companyContact?.contact_name ? companyContact?.contact_name : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder="担当者名を入力してください *入力必須"
                      required
                      autoFocus
                      className={`${styles.input_box}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 直通TEL */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>直通TEL</span>
                    <span className={`${styles.value}`}>
                      {companyContact?.direct_line ? companyContact?.direct_line : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={directLine}
                      onChange={(e) => setDirectLine(e.target.value)}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 内線TEL */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>内線TEL</span>
                    <span className={`${styles.value}`}>
                      {companyContact?.extension ? companyContact?.extension : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={extension}
                      onChange={(e) => setExtension(e.target.value)}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 社用携帯 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>社用携帯</span>
                    <span className={`${styles.value}`}>
                      {companyContact?.company_cell_phone ? companyContact?.company_cell_phone : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={companyCellPhone}
                      onChange={(e) => setCompanyCellPhone(e.target.value)}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 空白 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}></span>
                  </div>
                  {/* <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* 直通Fax */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>直通Fax</span>
                    <span className={`${styles.value}`}>
                      {companyContact?.direct_fax ? companyContact?.direct_fax : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={directFax}
                      onChange={(e) => setDirectFax(e.target.value)}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 私用携帯 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>私用携帯</span>
                    <span className={`${styles.value}`}>
                      {companyContact?.personal_cell_phone ? companyContact?.personal_cell_phone : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={personalCellPhone}
                      onChange={(e) => setPersonalCellPhone(e.target.value)}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 右ラッパーここまで */}
            </div>
            {/* --------- 横幅全体ラッパーここまで --------- */}
          </div>
          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* Email */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>Email</span>
                  {/* <span className={`${styles.value}`}>
                    {companyContact?.contact_email ? companyContact?.contact_email : ""}
                  </span> */}
                  <span
                    className={`${styles.value} ${styles.email_value}`}
                    onClick={async () => {
                      if (!companyContact?.contact_email) return;
                      try {
                        await navigator.clipboard.writeText(companyContact?.contact_email);
                        toast.success(`コピーしました!`, {
                          autoClose: 1000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                        });
                      } catch (e: any) {
                        toast.error(`コピーできませんでした!`, {
                          autoClose: 1000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                        });
                      }
                    }}
                  >
                    {companyContact?.contact_email ? companyContact?.contact_email : ""}
                  </span>
                  {/* <input
                    type="text"
                    placeholder=""
                    className={`${styles.input_box}`}
                    //   value={inputDepartment}
                    //   onChange={(e) => setInputDepartment(e.target.value)}
                  /> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
            {/* --------- 横幅全部ラッパーここまで --------- */}
          </div>

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 役職名 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>役職名</span>
                    <span className={`${styles.value}`}>
                      {companyContact?.position_name ? companyContact?.position_name : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 担当職種 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>担当職種</span>
                    <span className={`${styles.value}`}>
                      {companyContact?.occupation ? getOccupationName(companyContact?.occupation) : ""}
                    </span>
                    {/* <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={selectedOccupation}
                      onChange={(e) => setSelectedOccupation(e.target.value)}
                    >
                      {optionsOccupation.map((num) => (
                        <option key={num} value={`${num}`}>
                          {getOccupationName(num)}
                        </option>
                      ))}
                    </select> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 職位 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>職位</span>
                    <span className={`${styles.value}`}>
                      {companyContact?.position_class ? getPositionClassName(companyContact?.position_class) : ""}
                    </span>
                    {/* <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={selectedPositionClass}
                      onChange={(e) => setSelectedPositionClass(e.target.value)}
                    >
                      {optionsPositionsClass.map((classNum) => (
                        <option key={classNum} value={`${classNum}`}>
                          {getPositionClassName(classNum)}
                        </option>
                      ))}
                    </select> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 決裁金額 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>決裁金額(万)</span>
                    <span className={`${styles.value}`}>
                      {companyContact?.approval_amount ? formatDisplayPrice(companyContact?.approval_amount) : ""}
                    </span>
                    {/* <input
                      // min={"0"}
                      type="text"
                      placeholder="例：100、300など"
                      className={`${styles.input_box}`}
                      // value={approvalAmount !== null ? approvalAmount : ""}
                      value={!!approvalAmount ? approvalAmount : ""}
                      onChange={(e) => setApprovalAmount(e.target.value)}
                      onBlur={() =>
                        setApprovalAmount(
                          !!approvalAmount && approvalAmount !== ""
                            ? (convertToMillions(approvalAmount.trim()) as number).toString()
                            : ""
                        )
                      }
                      // value={approvalAmount !== null ? approvalAmount : ""}
                      // onChange={(e) => {
                      //   // Number型の場合
                      //   // プラスの数値と空文字以外をstateに格納
                      //   // if (e.target.value === "" || e.target.value.search(/^[0-9]+$/) === 0) {
                      //   //   console.log("OK", e.target.value.search(/^[-]?[0-9]+$/));
                      //   //   setApprovalAmount(e.target.value === "" ? null : Number(e.target.value));
                      //   // } else {
                      //   //   console.log("NG", e.target.value.search(/^[0-9]+$/));
                      //   // }
                      //   setApprovalAmount(e.target.value);
                      // }}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
            {/* --------- 横幅全体ラッパーここまで --------- */}
          </div>

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* TEL要注意 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title}`}>TEL要注意</span>

                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        // checked={!!checkedColumnHeader} // 初期値
                        checked={companyContact?.call_careful_flag ? companyContact?.call_careful_flag : false}
                        readOnly
                        className={`${styles.grid_select_cell_header_input}`}
                        // onChange={() => setCallCarefulFlag(!callCarefulFlag)}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                    {/* <span className={`${styles.value}`}>
                      {companyContact?.approval_amount ? formatDisplayPrice(companyContact?.approval_amount) : ""}
                    </span> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>
            {/* --------- 横幅全体ラッパーここまで --------- */}
          </div>

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* TEL注意理由 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>TEL注意理由</span>
                  <p className={`${styles.textarea_box} min-h-max whitespace-pre-wrap`}>
                    {companyContact?.call_careful_reason ? companyContact.call_careful_reason : ""}
                  </p>
                  {/* <textarea
                    cols={30}
                    rows={10}
                    placeholder="架電時の注意事項を記入し、チームに共有しましょう"
                    className={`${styles.textarea_box} ${callCarefulFlag ? "" : "hidden"}`}
                    value={callCarefulReason}
                    onChange={(e) => setCallCarefulReason(e.target.value)}
                  ></textarea> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* メール禁止フラグ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title}`}>メール禁止フラグ</span>

                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        // checked={!!checkedColumnHeader} // 初期値
                        // checked={!!selectedRowDataContact?.call_careful_flag}
                        // checked={emailBanFlag}
                        checked={companyContact?.email_ban_flag ? companyContact?.email_ban_flag : false}
                        readOnly
                        // onChange={() => setEmailBanFlag(!emailBanFlag)}
                        className={`${styles.grid_select_cell_header_input}`}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 資料禁止フラグ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title}`}>資料禁止フラグ</span>

                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        // checked={sendingMaterialBanFlag}
                        checked={
                          companyContact?.sending_materials_ban_flag
                            ? companyContact?.sending_materials_ban_flag
                            : false
                        }
                        readOnly
                        // onChange={() => setSendingMaterialBanFlag(!sendingMaterialBanFlag)}
                        className={`${styles.grid_select_cell_header_input}`}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
            {/* --------- 横幅全体ラッパーここまで --------- */}
          </div>

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* FAX・DM禁止フラグ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title}`}>FAX・DM禁止フラグ</span>

                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        checked={companyContact?.fax_dm_ban_flag ? companyContact?.fax_dm_ban_flag : false}
                        readOnly
                        // checked={faxDmBanFlag}
                        // onChange={() => setFaxDmBanFlag(!faxDmBanFlag)}
                        className={`${styles.grid_select_cell_header_input}`}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 左ラッパーここまで */}
            </div>
            {/* --------- 横幅全体ラッパーここまで --------- */}
          </div>

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 禁止理由 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full  `}>
                  <span className={`${styles.title}`}>禁止理由</span>
                  <p className={`${styles.textarea_box} min-h-max whitespace-pre-wrap`}>
                    {companyContact?.ban_reason ? companyContact.ban_reason : ""}
                  </p>

                  {/* <textarea
                    cols={30}
                    rows={10}
                    placeholder="メール・資料送付・FAX・DMの禁止理由を記載してください"
                    className={`${styles.textarea_box} ${
                      emailBanFlag || sendingMaterialBanFlag || faxDmBanFlag ? "" : "hidden"
                    }`}
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                  ></textarea> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* クレーム */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>クレーム</span>
                  <p className={`${styles.textarea_box} min-h-max whitespace-pre-wrap`}>
                    {companyContact?.claim ? companyContact.claim : ""}
                  </p>
                  {/* <textarea
                    cols={30}
                    rows={10}
                    placeholder="クレームを受けた場合はチーム全体に共有しましょう"
                    className={`${styles.textarea_box} `}
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                  ></textarea> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* メインコンテンツ コンテナ ここまで */}
        </div>
      </div>
    </>
  );
};
