import React, { useState } from "react";
import styles from "./InsertNewClientCompanyModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN } from "lodash";
import { useMutateClientCompany } from "@/hooks/useMutateClientCompany";
import productCategoriesM from "@/utils/productCategoryM";

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
  const [industryType, setIndustryType] = useState("");
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

  console.log("InsertNewClientCompanyModalコンポーネント レンダリング selectedRowDataCompany", selectedRowDataCompany);

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
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[20px] text-center text-[18px]">
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
                    placeholder="部署名を入力してください *入力必須"
                    required
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
                    <span className={`${styles.title}`}>●代表TEL</span>
                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                    </span> */}
                    <input
                      type="text"
                      placeholder="代表電話番号を入力してください *入力必須"
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

              {/* 郵便番号 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>郵便番号</span>
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
              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 代表FAX */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>代表FAX</span>
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

              {/* 決算月 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>決算月</span>
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
                  <span className={`${styles.title}`}>住所</span>
                  <textarea
                    name="call_careful_reason"
                    id="call_careful_reason"
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    // value={callCarefulReason}
                    // onChange={(e) => setCallCarefulReason(e.target.value)}
                  ></textarea>
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
                    <select
                      name="number_of_employees_class"
                      id="number_of_employees_class"
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      // value={inputEmployeesClass}
                      // onChange={(e) => setInputEmployeesClass(e.target.value)}
                    >
                      <option value=""></option>
                      <option value="A 1000名以上">A 1000名以上</option>
                      <option value="B 500-999名">B 500-999名</option>
                      <option value="C 300-499名">C 300-499名</option>
                      <option value="D 200-299名">D 200-299名</option>
                      <option value="E 100-199名">E 100-199名</option>
                      <option value="F 50-99名">F 50-99名</option>
                      <option value="G 50名未満">G 50名未満</option>
                    </select>
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

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 資本金 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>資本金</span>
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

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 設立 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>設立</span>
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

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 業界(大分類) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>業界(大分類)</span>
                    <select
                      name="number_of_employees_class"
                      id="number_of_employees_class"
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      // value={inputEmployeesClass}
                      // onChange={(e) => setInputEmployeesClass(e.target.value)}
                    >
                      <option value=""></option>
                      <option value="A 1000名以上">A 1000名以上</option>
                      <option value="B 500-999名">B 500-999名</option>
                      <option value="C 300-499名">C 300-499名</option>
                      <option value="D 200-299名">D 200-299名</option>
                      <option value="E 100-199名">E 100-199名</option>
                      <option value="F 50-99名">F 50-99名</option>
                      <option value="G 50名未満">G 50名未満</option>
                    </select>
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
                  <select
                    name="position_class"
                    id="position_class"
                    className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                    // value={inputIndustryType}
                    // onChange={(e) => setInputIndustryType(e.target.value)}
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
                  </select>
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
                    <select
                      name="position_class"
                      id="position_class"
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
                    </select>
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
                    {!!productCategoryL && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductM}
                      //   onChange={(e) => setInputProductM(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
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
                    )}
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
            <div className={`${styles.row_area} ${styles.text_area_large} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>事業概要</span>
                  <textarea
                    name="call_careful_reason"
                    id="call_careful_reason"
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    // value={callCarefulReason}
                    // onChange={(e) => setCallCarefulReason(e.target.value)}
                  ></textarea>
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
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

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
                    //   value={directLine}
                    //   onChange={(e) => setDirectLine(e.target.value)}
                  />
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}
          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 主要取引先 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>主要取引先</span>
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
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}
          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 主要仕入先 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>主要仕入先</span>
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
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 設備 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>設備</span>
                  <textarea
                    name="call_careful_reason"
                    id="call_careful_reason"
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    // value={callCarefulReason}
                    // onChange={(e) => setCallCarefulReason(e.target.value)}
                  ></textarea>
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
              {/* 事業拠点 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>事業拠点</span>
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

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 海外拠点 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>海外拠点</span>
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

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* グループ会社 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>グループ会社</span>
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
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}
          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 法人番号 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>法人番号</span>
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
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* メインコンテンツ コンテナ ここまで */}
        </div>
      </div>
    </>
  );
};
