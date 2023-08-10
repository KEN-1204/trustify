import React, { useState } from "react";
import styles from "./InsertNewClientCompanyModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN } from "lodash";
import { useMutateClientCompany } from "@/hooks/useMutateClientCompany";

export const InsertNewClientCompanyModal = () => {
  const setIsOpenInsertNewClientCompanyModal = useDashboardStore((state) => state.setIsOpenInsertNewClientCompanyModal);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  const [name, setName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [mainFax, setMainFax] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [address, setAddress] = useState("");
  const [departmentContacts, setDepartmentContacts] = useState("");
  const [industryL, setIndustryL] = useState("");
  const [industryS, setIndustryS] = useState("");
  const [productCategoryL, setProductCategoryL] = useState("");
  const [productCategoryM, setProductCategoryM] = useState("");
  const [productCategoryS, setProductCategoryS] = useState("");
  const [numberOfEmployeesClass, setNumberOfEmployeesClass] = useState("");
  const [fiscalEndMonth, setFiscalEndMonth] = useState("");
  const [capital, setCapital] = useState("");
  const [budgetRequestMonth1, setBudgetRequestMonth1] = useState("");
  const [budgetRequestMonth2, setBudgetRequestMonth2] = useState("");
  const [websiteURL, setWebsiteURL] = useState("");
  const [clients, setClients] = useState("");
  const [supplier, setSupplier] = useState("");
  const [businessContent, setBusinessContent] = useState("");
  const [establishedIn, setEstablishedIn] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [chairperson, setChairperson] = useState("");
  const [seniorVicePresident, setSeniorVicePresident] = useState("");
  const [seniorManagingDirector, setSeniorManagingDirector] = useState("");
  const [managingDirector, setManagingDirector] = useState("");
  const [director, setDirector] = useState("");
  const [auditor, setAuditor] = useState("");
  const [manager, setManager] = useState("");
  const [member, setMember] = useState("");
  const [facility, setFacility] = useState("");
  const [businessSites, setBusinessSites] = useState("");
  const [overseasBases, setOverseasBases] = useState("");
  const [groupCompany, setGroupCompany] = useState("");
  const [email, setEmail] = useState("");
  const [mainPhoneNumber, setMainPhoneNumber] = useState("");
  const [corporateNumber, setCorporateNumber] = useState("");
  const [boardMember, setBoardMember] = useState("");
  const [numberOfEmployees, setNumberOfEmployees] = useState("");

  const supabase = useSupabaseClient();
  const { createClientCompanyMutation } = useMutateClientCompany();

  console.log(
    "InsertNewClientCompanyModalコンポーネント レンダリング selectedRowDataCompany",
    selectedRowDataCompany
  );

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    setIsOpenInsertNewClientCompanyModal(false);
  };
  const handleSaveAndClose = async () => {
    setLoadingGlobalState(true);

    // 新規作成するデータをオブジェクトにまとめる
    const newClientCompany = {
        created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
        created_by_user_id: userProfileState?.id ? userProfileState.id : null,
        created_by_department_of_user: userProfileState?.department ? userProfileState.department : null,
        created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
        name: name,
        department_name: departmentName,
        main_fax: mainFax,
      zipcode: zipcode,
      address: address,
      department_contacts: departmentContacts,
      industry_large: industryL,
      industry_small: industryS,
      industry_type: industryType,
      product_category_large: productCategoryL,
      product_category_medium: productCategoryM,
      product_category_small: productCategoryS,
      number_of_employees_class: numberOfEmployeesClass,
      fiscal_end_month: fiscalEndMonth,
      capital: capital,
      budget_request_month1: budgetRequestMonth1,
      budget_request_month2: budgetRequestMonth2,
      website_url: websiteURL,
      clients: clients,
      supplier: supplier,
      business_content: businessContent,
      established_in: establishedIn,
      representative_name: representativeName,
      chairperson: chairperson,
      senior_vice_president: seniorVicePresident,
      senior_managing_director: seniorManagingDirector,
      managing_director: managingDirector,
      director: director,
      auditor: auditor,
      manager: manager,
      member: member,
      facility: facility,
      business_sites: businessSites,
      overseas_bases: overseasBases,
      group_company: groupCompany,
      email: email,
      main_phone_number: mainPhoneNumber,
      corporate_number: corporateNumber,
      board_member: boardMember,
      number_of_employees: numberOfEmployees,
    };

    // supabaseにINSERT
    createClientCompanyMutation.mutate(newClientCompany);

    // const { error } = await supabase.from("contacts").insert(newClientCompany);

    // if (error) {
    //   alert(error);
    //   console.log("INSERTエラー", error);
    //   toast.error("担当者の作成に失敗しました!", {
    //     position: "top-right",
    //     autoClose: 4000,
    //     hideProgressBar: false,
    //     closeOnClick: true,
    //     pauseOnHover: true,
    //     draggable: true,
    //     progress: undefined,
    //     theme: `${theme === "light" ? "light" : "dark"}`,
    //   });
    // } else {
    //   toast.success("担当者の作成に完了しました!", {
    //     position: "top-right",
    //     autoClose: 4000,
    //     hideProgressBar: false,
    //     closeOnClick: true,
    //     pauseOnHover: true,
    //     draggable: true,
    //     progress: undefined,
    //     theme: `${theme === "light" ? "light" : "dark"}`,
    //   });
    // }

    setLoadingGlobalState(false);

    // モーダルを閉じる
    setIsOpenInsertNewClientCompanyModal(false);
  };
  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {loadingGlobalState && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )}
      <div className={`${styles.container} `}>
        {/* 保存・タイトル・キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[30px] text-center text-[18px]">
          <div className="font-samibold cursor-pointer hover:text-[#aaa]" onClick={handleCancelAndReset}>
            キャンセル
          </div>
          <div className="-translate-x-[25px] font-bold">担当者 新規作成</div>
          <div
            className={`cursor-pointer font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text}`}
            onClick={handleSaveAndClose}
          >
            保存
          </div>
        </div>
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 会社名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>●会社名</span>
                  {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                    {selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                  </span> */}
                  <input
                    type="text"
                    placeholder="会社名を入力してください *入力必須"
                    required
                    className={`${styles.input_box}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 部署名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>部署名</span>
                  {/* <span className={`${styles.value}`}>
                    {selectedRowDataCompany?.department_name ? selectedRowDataCompany?.department_name : ""}
                  </span> */}
                  <input
                    type="text"
                    placeholder=""
                    className={`${styles.input_box}`}
                      value={departmentName}
                      onChange={(e) => setDepartmentName(e.target.value)}
                  />
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
                    <span className={`${styles.title}`}>●担当名</span>
                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                    </span> */}
                    <input
                      type="text"
                      placeholder="担当者名を入力してください *入力必須"
                      required
                      autoFocus
                      className={`${styles.input_box}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 直通TEL */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>直通TEL</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                    //   value={directLine}
                    //   onChange={(e) => setDirectLine(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 内線TEL */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>内線TEL</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                    //   value={extension}
                    //   onChange={(e) => setExtension(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 社用携帯 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>社用携帯</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                    //   value={companyCellPhone}
                    //   onChange={(e) => setClientCompanyCellPhone(e.target.value)}
                    />
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
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                    //   value={directFax}
                    //   onChange={(e) => setDirectFax(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 私用携帯 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>私用携帯</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                    //   value={personalCellPhone}
                    //   onChange={(e) => setPersonalCellPhone(e.target.value)}
                    />
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
                  <input
                    type="text"
                    placeholder=""
                    className={`${styles.input_box}`}
                    //   value={inputDepartment}
                    //   onChange={(e) => setInputDepartment(e.target.value)}
                  />
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
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                    //   value={position}
                    //   onChange={(e) => setPosition(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 担当職種 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>担当職種</span>
                    <select
                      name="position_class"
                      id="position_class"
                    //   onChange={(e) => setSelectedOccupation(e.target.value)}
                    >
                      <option value="1">1 社長・専務</option>
                      <option value="2">2 取締役・役員</option>
                      <option value="3">3 開発・設計</option>
                      <option value="4">4 生産技術</option>
                      <option value="5">5 製造</option>
                      <option value="6">6 品質管理・品質保証</option>
                      <option value="7">7 人事</option>
                      <option value="8">8 経理</option>
                      <option value="9">9 総務</option>
                      <option value="10">10 法務</option>
                      <option value="11">11 財務</option>
                      <option value="12">12 情報システム</option>
                      <option value="13">13 マーケティング</option>
                      <option value="14">14 購買</option>
                      <option value="15">15 営業</option>
                      <option value="16">16 企画</option>
                      <option value="17">17 CS</option>
                      <option value="18">18 その他</option>
                    </select>
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
                    <select
                      name="position_class"
                      id="position_class"
                    //   value={selectedPositionClass}
                    //   onChange={(e) => setSelectedPositionClass(e.target.value)}
                    >
                      <option value=""></option>
                      <option value="1 代表者">1 代表者</option>
                      <option value="2 取締役/役員">2 取締役/役員</option>
                      <option value="3 部長">3 部長</option>
                      <option value="4 課長">4 課長</option>
                      <option value="5 課長未満">5 課長未満</option>
                      <option value="6 所長・工場長">6 所長・工場長</option>
                      <option value="7 不明">7 不明</option>
                      {/* <option value="executive">1 代表者</option>
                      <option value="Director">2 取締役/役員</option>
                      <option value="department_manager">3 部長</option>
                      <option value="section_manager">4 課長</option>
                      <option value="below_section_manager">5 課長未満</option>
                      <option value="chief_factory_manager">6 所長・工場長</option>
                      <option value="section_chief">7 不明</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 決裁金額 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>決裁金額(万)</span>
                    <input
                      type="number"
                      placeholder=""
                      className={`${styles.input_box}`}
                      min={"0"}
                    //   value={approvalAmount !== null ? approvalAmount : ""}
                      onChange={(e) => {
                        // プラスの数値と空文字以外をstateに格納
                        // if (e.target.value === "" || e.target.value.search(/^[0-9]+$/) === 0) {
                        //   console.log("OK", e.target.value.search(/^[-]?[0-9]+$/));
                        //   setApprovalAmount(e.target.value === "" ? null : Number(e.target.value));
                        // } else {
                        //   console.log("NG", e.target.value.search(/^[0-9]+$/));
                        // }
                        // setApprovalAmount(e.target.value);
                      }}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
            {/* --------- 横幅全体ラッパーここまで --------- */}
          </div>
          {/* メインコンテンツ コンテナ ここまで */}
        </div>
      </div>
    </>
  );
};
