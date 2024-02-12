import React, { useEffect, useRef, useState } from "react";
import styles from "./ClientCompanyDetailModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN } from "lodash";
import { useMutateClientCompany } from "@/hooks/useMutateClientCompany";
import productCategoriesM from "@/utils/productCategoryM";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { convertToMillions } from "@/utils/Helpers/convertToMillions";
import { BsChevronLeft } from "react-icons/bs";
import {
  getNumberOfEmployeesClass,
  mappingIndustryType,
  optionsMonth,
  optionsNumberOfEmployeesClass,
} from "@/utils/selectOptions";
import { useQueryClientCompanyOnly } from "@/hooks/useQueryCientCompanyOnly";
import useStore from "@/store";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { Zoom } from "@/utils/Helpers/toastHelpers";

export const ClientCompanyDetailModal = () => {
  const language = useStore((state) => state.language);
  const setIsOpenClientCompanyDetailModal = useDashboardStore((state) => state.setIsOpenClientCompanyDetailModal);
  // const [isLoading, setIsLoading] = useState(false);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  //   const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
  const selectedRowDataQuotation = useDashboardStore((state) => state.selectedRowDataQuotation);
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  const getRowData = () => {
    if (selectedRowDataContact) return selectedRowDataContact;
    if (selectedRowDataActivity) return selectedRowDataActivity;
    if (selectedRowDataMeeting) return selectedRowDataMeeting;
    if (selectedRowDataProperty) return selectedRowDataProperty;
    if (selectedRowDataQuotation) return selectedRowDataQuotation;
  };

  const selectedRowData = getRowData();

  const { data: company, isLoading, isError } = useQueryClientCompanyOnly(selectedRowData?.company_id);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    setIsOpenClientCompanyDetailModal(false);
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

  console.log("company", company);

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
        <div className="min-w-[150px] select-none font-bold">会社 詳細</div>
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
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[20px] text-center text-[18px]">
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
          <div className="min-w-[150px] select-none font-bold">会社 詳細</div>
          <div
            className={`min-w-[150px] cursor-pointer select-none text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text}`}
            // onClick={handleSaveAndClose}
          >
            {/* 保存 */}
          </div>
        </div>

        <div className="min-h-[2px] w-full bg-[var(--color-bg-brand-f)]"></div>

        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 会社名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title} ${styles.required_title}`}>●会社名</span>
                  <span className={`${styles.value} ${styles.value_highlight}`}>
                    {company?.name ? company?.name : ""}
                  </span>
                  {/* <input
                    type="text"
                    placeholder="会社名を入力してください *入力必須  個人の場合は電話番号を入力してください"
                    required
                    autoFocus
                    className={`${styles.input_box}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setName(toHalfWidth(name.trim()))}
                    // onBlur={() => setName(name.trim())}
                  /> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 部署名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title} ${styles.required_title}`}>●部署名</span>
                  <span className={`${styles.value}`}>{company?.department_name ? company?.department_name : ""}</span>
                  {/* <input
                    type="text"
                    placeholder="部署名を入力してください *入力必須  部署名が不明の場合は.(ピリオド)を入力してください"
                    required
                    className={`${styles.input_box}`}
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
                    // onBlur={() => setDepartmentName(departmentName.trim())}
                  /> */}
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
                    <span className={`${styles.title} ${styles.required_title}`}>●代表TEL</span>
                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                    </span> */}
                    <span className={`${styles.value}`}>{company?.main_phone_number ?? ""}</span>
                    {/* <input
                      type="text"
                      placeholder="代表電話番号を入力してください *入力必須"
                      required
                      className={`${styles.input_box}`}
                      value={mainPhoneNumber}
                      onChange={(e) => setMainPhoneNumber(e.target.value)}
                      onBlur={() => setMainPhoneNumber(toHalfWidth(mainPhoneNumber.trim()))}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 郵便番号 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>郵便番号</span>
                    <span className={`${styles.value}`}>{company?.zipcode ?? ""}</span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={zipcode}
                      onChange={(e) => setZipcode(e.target.value)}
                      onBlur={() => setZipcode(toHalfWidth(zipcode.trim()))}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 代表FAX */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>代表FAX</span>
                    <span className={`${styles.value}`}>{company?.main_fax ?? ""}</span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={mainFax}
                      onChange={(e) => setMainFax(e.target.value)}
                      onBlur={() => setMainFax(toHalfWidth(mainFax.trim()))}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 決算月 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>決算月</span>
                    <span className={`${styles.value}`}>
                      {company?.fiscal_end_month ? company.fiscal_end_month.toString() + "月" : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={fiscalEndMonth}
                      onChange={(e) => setFiscalEndMonth(e.target.value)}
                      onBlur={() => setFiscalEndMonth(toHalfWidth(fiscalEndMonth.trim()))}
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
            {/* 住所 */}
            <div className={`${styles.row_area} ${styles.text_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title} ${styles.required_title}`}>●住所</span>
                  <textarea
                    readOnly
                    className={`${styles.textarea_box}`}
                    value={company?.address ? company?.address : ""}
                  ></textarea>
                  {/* <textarea
                    cols={30}
                    rows={10}
                    placeholder="住所を入力してください *入力必須"
                    required
                    className={`${styles.textarea_box}`}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={() => setAddress(toHalfWidth(address.trim()))}
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
              {/* 規模(ﾗﾝｸ) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>規模(ﾗﾝｸ)</span>
                    <span className={`${styles.value}`}>
                      {company?.number_of_employees_class
                        ? getNumberOfEmployeesClass(company.number_of_employees_class)
                        : ""}
                    </span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 従業員数 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>従業員数</span>
                    <span className={`${styles.value}`}>
                      {company?.number_of_employees ? company.number_of_employees + "人" : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={numberOfEmployees}
                      onChange={(e) => setNumberOfEmployees(e.target.value)}
                      onBlur={() => setNumberOfEmployees(toHalfWidth(numberOfEmployees.trim()))}
                    /> */}
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
              {/* 資本金(万) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>資本金(万)</span>
                    <span className={`${styles.value}`}>
                      {company?.capital ? formatDisplayPrice(company.capital) : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={capital}
                      onChange={(e) => setCapital(e.target.value)}
                      // onBlur={() => setCapital(toHalfWidth(capital.trim()))}
                      // onBlur={() => setCapital(convertToNumber(capital.trim()).toString())}
                      onBlur={() =>
                        setCapital(
                          !!capital && capital !== "" ? (convertToMillions(capital.trim()) as number).toString() : ""
                        )
                      }
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 設立 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>設立</span>
                    <span className={`${styles.value}`}>{company?.established_in ? company.established_in : ""}</span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={establishedIn}
                      onChange={(e) => setEstablishedIn(e.target.value)}
                      onBlur={() => {
                        const converted = matchEraToYear(toHalfWidth(establishedIn.trim()));
                        setEstablishedIn(converted.toString());
                      }}
                    /> */}
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
              {/* 代表者 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>代表者</span>
                    <span className={`${styles.value}`}>
                      {company?.representative_name ? company.representative_name : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={representativeName}
                      onChange={(e) => setRepresentativeName(e.target.value)}
                      onBlur={() => setRepresentativeName(toHalfWidthAndSpace(representativeName.trim()))}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 会長 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>会長</span>
                    <span className={`${styles.value}`}>{company?.chairperson ? company.chairperson : ""}</span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={chairperson}
                      onChange={(e) => setChairperson(e.target.value)}
                      onBlur={() => setChairperson(toHalfWidthAndSpace(chairperson.trim()))}
                    /> */}
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
              {/* 副社長 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>副社長</span>
                    <span className={`${styles.value}`}>
                      {company?.senior_vice_president ? company.senior_vice_president : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={seniorVicePresident}
                      onChange={(e) => setSeniorVicePresident(e.target.value)}
                      onBlur={() => setSeniorVicePresident(toHalfWidthAndSpace(seniorVicePresident.trim()))}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 専務取締役 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>専務取締役</span>
                    <span className={`${styles.value}`}>
                      {company?.senior_managing_director ? company.senior_managing_director : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={seniorManagingDirector}
                      onChange={(e) => setSeniorManagingDirector(e.target.value)}
                      onBlur={() => setSeniorManagingDirector(toHalfWidthAndSpace(seniorManagingDirector.trim()))}
                    /> */}
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
              {/* 常務取締役 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>常務取締役</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth)
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: company?.managing_director ? company.managing_director : "",
                            // content2: "この商品名が見積書の品名に記載されます。",
                            // marginTop: 57,
                            // marginTop: 38,
                            marginTop: 12,
                            // marginTop: 9,
                            itemsPosition: "center",
                            // whiteSpace: "nowrap",
                            maxWidth: 600,
                          });
                      }}
                      onMouseLeave={handleCloseTooltip}
                    >
                      {company?.managing_director ? company.managing_director : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={managingDirector}
                      onChange={(e) => setManagingDirector(e.target.value)}
                      onBlur={() => setManagingDirector(toHalfWidthAndSpace(managingDirector.trim()))}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 取締役 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>取締役</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth)
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: company?.director ? company.director : "",
                            // content2: "この商品名が見積書の品名に記載されます。",
                            // marginTop: 57,
                            // marginTop: 38,
                            marginTop: 12,
                            // marginTop: 9,
                            itemsPosition: "center",
                            // whiteSpace: "nowrap",
                            maxWidth: 600,
                          });
                      }}
                      onMouseLeave={handleCloseTooltip}
                    >
                      {company?.director ? company.director : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={director}
                      onChange={(e) => setDirector(e.target.value)}
                      onBlur={() => setDirector(toHalfWidthAndSpace(director.trim()))}
                    /> */}
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
              {/* 役員 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>役員</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth)
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: company?.board_member ? company.board_member : "",
                            // content2: "この商品名が見積書の品名に記載されます。",
                            // marginTop: 57,
                            // marginTop: 38,
                            marginTop: 12,
                            // marginTop: 9,
                            itemsPosition: "center",
                            // whiteSpace: "nowrap",
                            maxWidth: 600,
                          });
                      }}
                      onMouseLeave={handleCloseTooltip}
                    >
                      {company?.board_member ? company.board_member : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={boardMember}
                      onChange={(e) => setBoardMember(e.target.value)}
                      onBlur={() => setBoardMember(toHalfWidthAndSpace(boardMember.trim()))}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 監査役 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>監査役</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth)
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: company?.auditor ? company.auditor : "",
                            // content2: "この商品名が見積書の品名に記載されます。",
                            // marginTop: 57,
                            // marginTop: 38,
                            marginTop: 12,
                            // marginTop: 9,
                            itemsPosition: "center",
                            // whiteSpace: "nowrap",
                            maxWidth: 600,
                          });
                      }}
                      onMouseLeave={handleCloseTooltip}
                    >
                      {company?.auditor ? company.auditor : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={auditor}
                      onChange={(e) => setAuditor(e.target.value)}
                      onBlur={() => setAuditor(toHalfWidthAndSpace(auditor.trim()))}
                    /> */}
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
              {/* 部長 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>部長</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth)
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: company?.manager ? company.manager : "",
                            // content2: "この商品名が見積書の品名に記載されます。",
                            // marginTop: 57,
                            // marginTop: 38,
                            marginTop: 12,
                            // marginTop: 9,
                            itemsPosition: "center",
                            // whiteSpace: "nowrap",
                            maxWidth: 600,
                          });
                      }}
                      onMouseLeave={handleCloseTooltip}
                    >
                      {company?.manager ? company.manager : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={manager}
                      onChange={(e) => setManager(e.target.value)}
                      onBlur={() => setManager(toHalfWidthAndSpace(manager.trim()))}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 担当者 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>担当者</span>
                    <span
                      className={`${styles.value}`}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth)
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: company?.member ? company.member : "",
                            // content2: "この商品名が見積書の品名に記載されます。",
                            // marginTop: 57,
                            // marginTop: 38,
                            marginTop: 12,
                            // marginTop: 9,
                            itemsPosition: "center",
                            // whiteSpace: "nowrap",
                            maxWidth: 600,
                          });
                      }}
                      onMouseLeave={handleCloseTooltip}
                    >
                      {company?.member ? company.member : ""}
                    </span>
                    {/* <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={member}
                      onChange={(e) => setMember(e.target.value)}
                      onBlur={() => setMember(toHalfWidthAndSpace(member.trim()))}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 業種 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>業種</span>
                  <span className={`${styles.value}`}>
                    {company?.industry_type_id ? mappingIndustryType[company.industry_type_id][language] : ""}
                  </span>
                  {/* <select
                    className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                    value={industryType}
                    onChange={(e) => setIndustryType(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="機械要素・部品">機械要素・部品</option>
                    <option value="自動車・輸送機器">自動車・輸送機器</option>
                    <option value="電子部品・半導体">電子部品・半導体</option>
                    <option value="製造・加工受託">製造・加工受託</option>
                    <option value="産業用機械">産業用機械</option>
                    <option value="産業用電気機器">産業用電気機器</option>
                    <option value="IT・情報通信">IT・情報通信</option>
                    <option value="ソフトウェア">ソフトウェア</option>
                    <option value="医薬品・バイオ">医薬品・バイオ</option>
                    <option value="樹脂・プラスチック">樹脂・プラスチック</option>
                    <option value="ゴム製品">ゴム製品</option>
                    <option value="鉄/非鉄金属">鉄/非鉄金属</option>
                    <option value="民生用電気機器">民生用電気機器</option>
                    <option value="航空・宇宙">航空・宇宙</option>
                    <option value="CAD/CAM">CAD/CAM</option>
                    <option value="建材・資材・什器">建材・資材・什器</option>
                    <option value="小売">小売</option>
                    <option value="飲食料品">飲食料品</option>
                    <option value="飲食店・宿泊業">飲食店・宿泊業</option>
                    <option value="公益・特殊・独立行政法人">公益・特殊・独立行政法人</option>
                    <option value="水産・農林業">水産・農林業</option>
                    <option value="繊維">繊維</option>
                    <option value="ガラス・土石製品">ガラス・土石製品</option>
                    <option value="造船・重機">造船・重機</option>
                    <option value="環境">環境</option>
                    <option value="印刷業">印刷業</option>
                    <option value="運輸業">運輸業</option>
                    <option value="金融・証券・保険業">金融・証券・保険業</option>
                    <option value="警察・消防・自衛隊">警察・消防・自衛隊</option>
                    <option value="鉱業">鉱業</option>
                    <option value="紙・バルブ">紙・バルブ</option>
                    <option value="木材">木材</option>
                    <option value="ロボット">ロボット</option>
                    <option value="試験・分析・測定">試験・分析・測定</option>
                    <option value="エネルギー">エネルギー</option>
                    <option value="電気・ガス・水道業">電気・ガス・水道業</option>
                    <option value="医療・福祉">医療・福祉</option>
                    <option value="サービス業">サービス業</option>
                    <option value="その他">その他</option>
                    <option value="化学">化学</option>
                    <option value="セラミックス">セラミックス</option>
                    <option value="食品機械">食品機械</option>
                    <option value="光学機器">光学機器</option>
                    <option value="医療機器">医療機器</option>
                    <option value="その他製造">その他製造</option>
                    <option value="倉庫・運輸関連業">倉庫・運輸関連業</option>
                    <option value="教育・研究機関">教育・研究機関</option>
                    <option value="石油・石炭製品">石油・石炭製品</option>
                    <option value="商社・卸売">商社・卸売</option>
                    <option value="官公庁">官公庁</option>
                    <option value="個人">個人</option>
                    <option value="不明">不明</option>
                  </select> */}
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
              {/* 製品分類(大分類) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>製品分類(大分類)</span>
                    <span className={`${styles.value}`}>
                      {company?.product_category_large ? company.product_category_large : ""}
                    </span>
                    {/* <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={productCategoryL}
                      onChange={(e) => setProductCategoryL(e.target.value)}
                    >
                      <option value=""></option>
                      <option value="電子部品・モジュール">電子部品・モジュール</option>
                      <option value="機械部品">機械部品</option>
                      <option value="製造・加工機械">製造・加工機械</option>
                      <option value="科学・理化学機器">科学・理化学機器</option>
                      <option value="素材・材料">素材・材料</option>
                      <option value="測定・分析">測定・分析</option>
                      <option value="画像処理">画像処理</option>
                      <option value="制御・電機機器">制御・電機機器</option>
                      <option value="工具・消耗品・備品">工具・消耗品・備品</option>
                      <option value="設計・生産支援">設計・生産支援</option>
                      <option value="IT・ネットワーク">IT・ネットワーク</option>
                      <option value="オフィス">オフィス</option>
                      <option value="業務支援サービス">業務支援サービス</option>
                      <option value="セミナー・スキルアップ">セミナー・スキルアップ</option>
                      <option value="その他">その他</option>
                    </select> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 製品分類(中分類) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>製品分類(中分類)</span>
                    <span className={`${styles.value}`}>
                      {company?.product_category_medium ? company.product_category_medium : ""}
                    </span>
                    {/* {!!productCategoryL && (
                      <select
                        value={productCategoryM}
                        onChange={(e) => setProductCategoryM(e.target.value)}
                        className={`${
                          productCategoryL ? "" : "hidden"
                        } ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      >
                        {productCategoryL === "電子部品・モジュール" &&
                          productCategoriesM.moduleCategoryM.map((option) => option)}
                        {productCategoryL === "機械部品" &&
                          productCategoriesM.machinePartsCategoryM.map((option) => option)}
                        {productCategoryL === "製造・加工機械" &&
                          productCategoriesM.processingMachineryCategoryM.map((option) => option)}
                        {productCategoryL === "科学・理化学機器" &&
                          productCategoriesM.scienceCategoryM.map((option) => option)}
                        {productCategoryL === "素材・材料" &&
                          productCategoriesM.materialCategoryM.map((option) => option)}
                        {productCategoryL === "測定・分析" &&
                          productCategoriesM.analysisCategoryM.map((option) => option)}
                        {productCategoryL === "画像処理" &&
                          productCategoriesM.imageProcessingCategoryM.map((option) => option)}
                        {productCategoryL === "制御・電機機器" &&
                          productCategoriesM.controlEquipmentCategoryM.map((option) => option)}
                        {productCategoryL === "工具・消耗品・備品" &&
                          productCategoriesM.toolCategoryM.map((option) => option)}
                        {productCategoryL === "設計・生産支援" &&
                          productCategoriesM.designCategoryM.map((option) => option)}
                        {productCategoryL === "IT・ネットワーク" &&
                          productCategoriesM.ITCategoryM.map((option) => option)}
                        {productCategoryL === "オフィス" && productCategoriesM.OfficeCategoryM.map((option) => option)}
                        {productCategoryL === "業務支援サービス" &&
                          productCategoriesM.businessSupportCategoryM.map((option) => option)}
                        {productCategoryL === "セミナー・スキルアップ" &&
                          productCategoriesM.skillUpCategoryM.map((option) => option)}
                        {productCategoryL === "その他" && productCategoriesM.othersCategoryM.map((option) => option)}
                      </select>
                    )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 事業概要 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>事業概要</span>
                  <p className={`${styles.textarea_box} min-h-max whitespace-pre-wrap`}>
                    {company?.business_content ? company.business_content : ""}
                  </p>
                  {/* <textarea
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={businessContent}
                    onChange={(e) => setBusinessContent(e.target.value)}
                  ></textarea> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* HP */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>HP</span>
                  {/* <span className={`${styles.value}`}>{company?.website_url ? company.website_url : ""}</span> */}
                  {company?.website_url ? (
                    <a
                      href={company?.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.value} ${styles.anchor}`}
                    >
                      {company?.website_url}
                    </a>
                  ) : (
                    <span></span>
                  )}
                  {/* <input
                    type="text"
                    placeholder=""
                    className={`${styles.input_box}`}
                    value={websiteURL}
                    onChange={(e) => setWebsiteURL(e.target.value)}
                    onBlur={() => setWebsiteURL(toHalfWidth(websiteURL.trim()))}
                  /> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* Email */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>Email</span>
                  {/* <span className={`${styles.value}`}>{company?.email ? company.email : ""}</span> */}
                  <span
                    className={`${styles.value} ${styles.email_value}`}
                    onClick={async () => {
                      if (!company?.email) return;
                      try {
                        await navigator.clipboard.writeText(company?.email);
                        toast.success(`コピーしました!`, {
                          position: "bottom-center",
                          autoClose: 1000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          transition: Zoom,
                        });
                      } catch (e: any) {
                        toast.error(`コピーできませんでした!`, {
                          position: "bottom-center",
                          autoClose: 1000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          transition: Zoom,
                        });
                      }
                    }}
                  >
                    {company?.email ? company?.email : ""}
                  </span>
                  {/* <input
                    type="text"
                    placeholder=""
                    className={`${styles.input_box}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmail(toHalfWidth(email.trim()))}
                  /> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 主要取引先 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>主要取引先</span>
                  <p className={`${styles.textarea_box} min-h-max whitespace-pre-wrap`}>
                    {company?.clients ? company.clients : ""}
                  </p>
                  {/* <span className={`${styles.value}`}>{company?.email ? company.email : ""}</span> */}
                  {/* <textarea
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={clients}
                    onChange={(e) => setClients(e.target.value)}
                  ></textarea> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 主要仕入先 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>主要仕入先</span>
                  <p className={`${styles.textarea_box} min-h-max whitespace-pre-wrap`}>
                    {company?.supplier ? company.supplier : ""}
                  </p>
                  {/* {/* <span className={`${styles.value}`}>{company?.email ? company.email : ""}</span> */}
                  {/* <textarea
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                  ></textarea> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 設備 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>設備</span>
                  <p className={`${styles.textarea_box} min-h-max whitespace-pre-wrap`}>
                    {company?.facility ? company.facility : ""}
                  </p>
                  {/* {/* <span className={`${styles.value}`}>{company?.email ? company.email : ""}</span> */}
                  {/* <textarea
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                  ></textarea> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 事業拠点 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>事業拠点</span>
                  <p className={`${styles.textarea_box} min-h-max whitespace-pre-wrap`}>
                    {company?.business_sites ? company.business_sites : ""}
                  </p>
                  {/* <span className={`${styles.value}`}>{company?.email ? company.email : ""}</span> */}
                  {/* <textarea
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={businessSites}
                    onChange={(e) => setBusinessSites(e.target.value)}
                  ></textarea> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 海外拠点 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>海外拠点</span>
                  <p className={`${styles.textarea_box} min-h-max whitespace-pre-wrap`}>
                    {company?.overseas_bases ? company.overseas_bases : ""}
                  </p>
                  {/* <span className={`${styles.value}`}>{company?.email ? company.email : ""}</span> */}
                  {/* <textarea
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={overseasBases}
                    onChange={(e) => setOverseasBases(e.target.value)}
                  ></textarea> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* グループ会社 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>グループ会社</span>
                  <p className={`${styles.textarea_box} min-h-max whitespace-pre-wrap`}>
                    {company?.group_company ? company.group_company : ""}
                  </p>
                  {/* <span className={`${styles.value}`}>{company?.email ? company.email : ""}</span> */}
                  {/* <textarea
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={groupCompany}
                    onChange={(e) => setGroupCompany(e.target.value)}
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
              {/* 予算申請月1 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>予算申請月1</span>
                    <span className={`${styles.value}`}>
                      {company?.budget_request_month1 ? company.budget_request_month1 : ""}
                    </span>
                    {/* <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={budgetRequestMonth1}
                      onChange={(e) => setBudgetRequestMonth1(e.target.value)}
                    >
                      <option value=""></option>
                      {optionsMonth.map((option) => (
                        <option key={option} value={option}>
                          {option}
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
              {/* 予算申請月2 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>予算申請月2</span>
                    <span className={`${styles.value}`}>
                      {company?.budget_request_month2 ? company.budget_request_month2 : ""}
                    </span>
                    {/* <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={budgetRequestMonth2}
                      onChange={(e) => setBudgetRequestMonth2(e.target.value)}
                    >
                      <option value=""></option>
                      {optionsMonth.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 法人番号 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>法人番号</span>
                    <span className={`${styles.value}`}>
                      {company?.corporate_number ? company.corporate_number : ""}
                    </span>
                    {/* <input
                    type="text"
                    placeholder=""
                    className={`${styles.input_box}`}
                    value={corporateNumber}
                    onChange={(e) => setCorporateNumber(e.target.value)}
                    onBlur={() => setCorporateNumber(toHalfWidth(corporateNumber.trim()))}
                  /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
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
