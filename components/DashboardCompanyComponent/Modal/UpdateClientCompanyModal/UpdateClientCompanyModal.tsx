import React, { useEffect, useState } from "react";
import styles from "./UpdateClientCompanyModal.module.css";
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

export const UpdateClientCompanyModal = () => {
  const setIsOpenUpdateClientCompanyModal = useDashboardStore((state) => state.setIsOpenUpdateClientCompanyModal);
  // const [isLoading, setIsLoading] = useState(false);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // const theme = useThemeStore((state) => state.theme);
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
  const { updateClientCompanyMutation } = useMutateClientCompany();

  // console.log("UpdateClientCompanyModalコンポーネント レンダリング selectedRowDataCompany", selectedRowDataCompany);

  // 初回マウント時に選択中の担当者&会社の列データの情報をStateに格納
  useEffect(() => {
    if (!selectedRowDataCompany) return;
    let _name = selectedRowDataCompany.name ? selectedRowDataCompany.name : "";
    let _department_name = selectedRowDataCompany.department_name ? selectedRowDataCompany.department_name : "";
    let _main_fax = selectedRowDataCompany.main_fax ? selectedRowDataCompany.main_fax : "";
    let _zipcode = selectedRowDataCompany.zipcode ? selectedRowDataCompany.zipcode : "";
    let _address = selectedRowDataCompany.address ? selectedRowDataCompany.address : "";
    let _department_contacts = selectedRowDataCompany.department_contacts
      ? selectedRowDataCompany.department_contacts
      : "";
    let _industry_large = selectedRowDataCompany.industry_large ? selectedRowDataCompany.industry_large : "";
    let _industry_small = selectedRowDataCompany.industry_small ? selectedRowDataCompany.industry_small : "";
    let _industry_type = selectedRowDataCompany.industry_type ? selectedRowDataCompany.industry_type : "";
    let _product_category_large = selectedRowDataCompany.product_category_large
      ? selectedRowDataCompany.product_category_large
      : "";
    let _product_category_medium = selectedRowDataCompany.product_category_medium
      ? selectedRowDataCompany.product_category_medium
      : "";
    let _product_category_small = selectedRowDataCompany.product_category_small
      ? selectedRowDataCompany.product_category_small
      : "";
    let _number_of_employees_class = selectedRowDataCompany.number_of_employees_class
      ? selectedRowDataCompany.number_of_employees_class
      : "";
    let _fiscal_end_month = selectedRowDataCompany.fiscal_end_month ? selectedRowDataCompany.fiscal_end_month : "";
    let _capital = selectedRowDataCompany.capital ? selectedRowDataCompany.capital : "";
    let _budget_request_month1 = selectedRowDataCompany.budget_request_month1
      ? selectedRowDataCompany.budget_request_month1
      : "";
    let _budget_request_month2 = selectedRowDataCompany.budget_request_month2
      ? selectedRowDataCompany.budget_request_month2
      : "";
    let _website_url = selectedRowDataCompany.website_url ? selectedRowDataCompany.website_url : "";
    let _clients = selectedRowDataCompany.clients ? selectedRowDataCompany.clients : "";
    let _supplier = selectedRowDataCompany.supplier ? selectedRowDataCompany.supplier : "";
    let _business_content = selectedRowDataCompany.business_content ? selectedRowDataCompany.business_content : "";
    let _established_in = selectedRowDataCompany.established_in ? selectedRowDataCompany.established_in : "";
    let _representative_name = selectedRowDataCompany.representative_name
      ? selectedRowDataCompany.representative_name
      : "";
    let _chairperson = selectedRowDataCompany.chairperson ? selectedRowDataCompany.chairperson : "";
    let _senior_vice_president = selectedRowDataCompany.senior_vice_president
      ? selectedRowDataCompany.senior_vice_president
      : "";
    let _senior_managing_director = selectedRowDataCompany.senior_managing_director
      ? selectedRowDataCompany.senior_managing_director
      : "";
    let _managing_director = selectedRowDataCompany.managing_director ? selectedRowDataCompany.managing_director : "";
    let _director = selectedRowDataCompany.director ? selectedRowDataCompany.director : "";
    let _auditor = selectedRowDataCompany.auditor ? selectedRowDataCompany.auditor : "";
    let _manager = selectedRowDataCompany.manager ? selectedRowDataCompany.manager : "";
    let _member = selectedRowDataCompany.member ? selectedRowDataCompany.member : "";
    let _facility = selectedRowDataCompany.facility ? selectedRowDataCompany.facility : "";
    let _business_sites = selectedRowDataCompany.business_sites ? selectedRowDataCompany.business_sites : "";
    let _overseas_bases = selectedRowDataCompany.overseas_bases ? selectedRowDataCompany.overseas_bases : "";
    let _group_company = selectedRowDataCompany.group_company ? selectedRowDataCompany.group_company : "";
    let _email = selectedRowDataCompany.email ? selectedRowDataCompany.email : "";
    let _main_phone_number = selectedRowDataCompany.main_phone_number ? selectedRowDataCompany.main_phone_number : "";
    let _corporate_number = selectedRowDataCompany.corporate_number ? selectedRowDataCompany.corporate_number : "";
    let _board_member = selectedRowDataCompany.board_member ? selectedRowDataCompany.board_member : "";
    let _number_of_employees = selectedRowDataCompany.number_of_employees
      ? selectedRowDataCompany.number_of_employees
      : "";
    setName(_name);
    setDepartmentName(_department_name);
    setMainFax(_main_fax);
    setZipcode(_zipcode);
    setAddress(_address);
    setDepartmentContacts(_department_contacts);
    setIndustryL(_industry_large);
    setIndustryS(_industry_small);
    setIndustryType(_industry_type);
    setProductCategoryL(_product_category_large);
    setProductCategoryM(_product_category_medium);
    setProductCategoryS(_product_category_small);
    setNumberOfEmployeesClass(_number_of_employees_class);
    setFiscalEndMonth(_fiscal_end_month);
    setCapital(_capital);
    setBudgetRequestMonth1(_budget_request_month1);
    setBudgetRequestMonth2(_budget_request_month2);
    setWebsiteURL(_website_url);
    setClients(_clients);
    setSupplier(_supplier);
    setBusinessContent(_business_content);
    setEstablishedIn(_established_in);
    setRepresentativeName(_representative_name);
    setChairperson(_chairperson);
    setSeniorVicePresident(_senior_vice_president);
    setSeniorManagingDirector(_senior_managing_director);
    setManagingDirector(_managing_director);
    setDirector(_director);
    setAuditor(_auditor);
    setManager(_manager);
    setMember(_member);
    setFacility(_facility);
    setBusinessSites(_business_sites);
    setOverseasBases(_overseas_bases);
    setGroupCompany(_group_company);
    setEmail(_email);
    setMainPhoneNumber(_main_phone_number);
    setCorporateNumber(_corporate_number);
    setBoardMember(_board_member);
    setNumberOfEmployees(_number_of_employees);
  }, []);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    if (loadingGlobalState) return;
    setIsOpenUpdateClientCompanyModal(false);
  };
  const handleSaveAndClose = async () => {
    if (!name) return alert("会社名を入力してください");
    if (!mainPhoneNumber) return alert("代表TELを入力してください");
    if (!departmentName) return alert("部署名を入力してください");
    if (!address) return alert("住所を入力してください");

    if (!selectedRowDataCompany) {
      alert("選択した会社情報が見つかりません");
      setIsOpenUpdateClientCompanyModal(false);
      return;
    }

    setLoadingGlobalState(true);

    // 新規作成するデータをオブジェクトにまとめる
    const newClientCompany = {
      id: selectedRowDataCompany.id,
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: userProfileState?.department ? userProfileState.department : null,
      created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      name: name,
      department_name: departmentName,
      main_fax: mainFax ? mainFax : null,
      zipcode: zipcode ? zipcode : null,
      address: address ? address : null,
      department_contacts: departmentContacts ? departmentContacts : null,
      industry_large: industryL ? industryL : null,
      industry_small: industryS ? industryS : null,
      industry_type: industryType ? industryType : null,
      product_category_large: productCategoryL ? productCategoryL : null,
      product_category_medium: productCategoryM ? productCategoryM : null,
      product_category_small: productCategoryS ? productCategoryS : null,
      number_of_employees_class: numberOfEmployeesClass ? numberOfEmployeesClass : null,
      fiscal_end_month: fiscalEndMonth ? fiscalEndMonth : null,
      capital: capital ? capital : null,
      budget_request_month1: budgetRequestMonth1 ? budgetRequestMonth1 : null,
      budget_request_month2: budgetRequestMonth2 ? budgetRequestMonth2 : null,
      website_url: websiteURL ? websiteURL : null,
      clients: clients ? clients : null,
      supplier: supplier ? supplier : null,
      business_content: businessContent ? businessContent : null,
      established_in: establishedIn ? establishedIn : null,
      representative_name: representativeName ? representativeName : null,
      chairperson: chairperson ? chairperson : null,
      senior_vice_president: seniorVicePresident ? seniorVicePresident : null,
      senior_managing_director: seniorManagingDirector ? seniorManagingDirector : null,
      managing_director: managingDirector ? managingDirector : null,
      director: director ? director : null,
      auditor: auditor ? auditor : null,
      manager: manager ? manager : null,
      member: member ? member : null,
      facility: facility ? facility : null,
      business_sites: businessSites ? businessSites : null,
      overseas_bases: overseasBases ? overseasBases : null,
      group_company: groupCompany ? groupCompany : null,
      email: email ? email : null,
      main_phone_number: mainPhoneNumber ? mainPhoneNumber : null,
      corporate_number: corporateNumber ? corporateNumber : null,
      board_member: boardMember ? boardMember : null,
      number_of_employees: numberOfEmployees ? numberOfEmployees : null,
    };

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    updateClientCompanyMutation.mutate(newClientCompany);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenUpdateClientCompanyModal(false);
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

  type Era = "昭和" | "平成" | "令和";
  const eras = {
    昭和: 1925, // 昭和の開始年 - 1
    平成: 1988, // 平成の開始年 - 1
    令和: 2018, // 令和の開始年 - 1
  };
  // 昭和や平成、令和の元号を西暦に変換する 例："平成4年12月" を "1992年12月" に変換
  function matchEraToYear(value: string): string {
    const pattern = /(?<era>昭和|平成|令和)(?<year>\d+)(?:年)?(?<month>\d+)?/;
    const match = pattern.exec(value);

    if (!match) return value; // 元号の形式でなければ元の文字列をそのまま返す

    const era: Era = match.groups?.era as Era;
    const year = eras[era] + parseInt(match.groups?.year || "0", 10);
    const month = match.groups?.month ? `${match.groups?.month}月` : "";

    return `${year}年${month}`;
  }

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

  // 資本金 100万円の場合は100、18億9,190万円は189190、12,500,000円は1250、のように変換する方法
  function convertToNumber(inputString: string) {
    // 全角数字を半角に変換
    inputString = zenkakuToHankaku(inputString);

    // 「億」「万」「円」がすべて含まれていなければ変換をスキップ
    if (
      !inputString.includes("億") &&
      !inputString.includes("万") &&
      !inputString.includes("円") &&
      !inputString.includes(",")
    ) {
      return inputString;
    }

    // 億、万、円で分けてそれぞれの数値を取得
    const billion = (inputString.includes("億") ? parseInt(inputString.split("億")[0].replace(/,/g, ""), 10) : 0) || 0;
    const million =
      (inputString.includes("万") && !inputString.includes("億")
        ? parseInt(inputString.split("万")[0].replace(/,/g, ""), 10)
        : inputString.includes("億") && inputString.includes("万")
        ? parseInt(inputString.split("億")[1].split("万")[0].replace(/,/g, ""), 10)
        : 0) || 0;
    const thousand =
      (!inputString.includes("万") && !inputString.includes("億")
        ? Math.floor(parseInt(inputString.replace(/,/g, "").replace("円", ""), 10) / 10000)
        : 0) || 0;

    // 最終的な数値を計算
    const total = billion * 10000 + million + thousand;

    return total;
  }

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />

      <div className={`${styles.container} fade03`}>
        {loadingGlobalState && (
          <div className={`${styles.loading_overlay_modal} `}>
            {/* <SpinnerIDS scale={"scale-[0.5]"} /> */}
            <SpinnerComet w="48px" h="48px" />
            {/* <SpinnerX w="w-[42px]" h="h-[42px]" /> */}
          </div>
        )}
        {/* 保存・タイトル・キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[20px] text-center text-[18px]">
          <div
            className="min-w-[150px] cursor-pointer select-none text-start font-semibold hover:text-[#aaa]"
            onClick={handleCancelAndReset}
          >
            キャンセル
          </div>
          <div className="min-w-[150px] select-none font-bold">会社 編集</div>
          <div
            className={`min-w-[150px] cursor-pointer select-none text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text}`}
            onClick={handleSaveAndClose}
          >
            保存
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
                  {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                    {selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                  </span> */}
                  <input
                    type="text"
                    placeholder="会社名を入力してください *入力必須  個人の場合は電話番号を入力してください"
                    required
                    autoFocus
                    className={`${styles.input_box}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setName(toHalfWidth(name.trim()))}
                    // onBlur={() => setName(name.trim())}
                  />
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 部署名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title} ${styles.required_title}`}>●部署名</span>
                  {/* <span className={`${styles.value}`}>
                    {selectedRowDataCompany?.department_name ? selectedRowDataCompany?.department_name : ""}
                  </span> */}
                  <input
                    type="text"
                    placeholder="部署名を入力してください *入力必須  部署名が不明の場合は.(ピリオド)を入力してください"
                    required
                    className={`${styles.input_box}`}
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
                    // onBlur={() => setDepartmentName(departmentName.trim())}
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
                    <span className={`${styles.title} ${styles.required_title}`}>●代表TEL</span>
                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                    </span> */}
                    <input
                      type="text"
                      placeholder="代表電話番号を入力してください *入力必須"
                      required
                      className={`${styles.input_box}`}
                      value={mainPhoneNumber}
                      onChange={(e) => setMainPhoneNumber(e.target.value)}
                      onBlur={() => setMainPhoneNumber(toHalfWidth(mainPhoneNumber.trim()))}
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
                      value={zipcode}
                      onChange={(e) => setZipcode(e.target.value)}
                      onBlur={() => setZipcode(toHalfWidth(zipcode.trim()))}
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
                      value={mainFax}
                      onChange={(e) => setMainFax(e.target.value)}
                      onBlur={() => setMainFax(toHalfWidth(mainFax.trim()))}
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
                      value={fiscalEndMonth}
                      onChange={(e) => setFiscalEndMonth(e.target.value)}
                      onBlur={() => setFiscalEndMonth(toHalfWidth(fiscalEndMonth.trim()))}
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
                  <span className={`${styles.title} ${styles.required_title}`}>●住所</span>
                  <textarea
                    name="call_careful_reason"
                    id="call_careful_reason"
                    cols={30}
                    rows={10}
                    placeholder="住所を入力してください *入力必須"
                    required
                    className={`${styles.textarea_box}`}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={() => setAddress(toHalfWidth(address.trim()))}
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
                      value={numberOfEmployeesClass}
                      onChange={(e) => setNumberOfEmployeesClass(e.target.value)}
                    >
                      <option value=""></option>
                      {/* <option value="">回答を選択してください</option> */}
                      <option value="A 1000名以上">A 1000名以上</option>
                      <option value="B 500〜999名">B 500〜999名</option>
                      <option value="C 300〜499名">C 300〜499名</option>
                      <option value="D 200〜299名">D 200〜299名</option>
                      <option value="E 100〜199名">E 100〜199名</option>
                      <option value="F 50〜99名">F 50〜99名</option>
                      <option value="G 1〜49名">G 1〜49名</option>
                      {/* <option value=""></option>
                      <option value="A 1000名以上">A 1000名以上</option>
                      <option value="B 500-999名">B 500-999名</option>
                      <option value="C 300-499名">C 300-499名</option>
                      <option value="D 200-299名">D 200-299名</option>
                      <option value="E 100-199名">E 100-199名</option>
                      <option value="F 50-99名">F 50-99名</option>
                      <option value="G 50名未満">G 50名未満</option> */}
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
                      value={numberOfEmployees}
                      onChange={(e) => setNumberOfEmployees(e.target.value)}
                      onBlur={() => setNumberOfEmployees(toHalfWidth(numberOfEmployees.trim()))}
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
              {/* 資本金(万) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>資本金(万)</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={capital}
                      onChange={(e) => setCapital(e.target.value)}
                      // onBlur={() => setCapital(toHalfWidth(capital.trim()))}
                      onBlur={() => setCapital(convertToNumber(capital.trim()).toString())}
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
                      value={establishedIn}
                      onChange={(e) => setEstablishedIn(e.target.value)}
                      onBlur={() => {
                        const converted = matchEraToYear(toHalfWidth(establishedIn.trim()));
                        setEstablishedIn(converted.toString());
                      }}
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
              {/* 代表者 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>代表者</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={representativeName}
                      onChange={(e) => setRepresentativeName(e.target.value)}
                      onBlur={() => setRepresentativeName(toHalfWidthAndSpace(representativeName.trim()))}
                    />
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
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={chairperson}
                      onChange={(e) => setChairperson(e.target.value)}
                      onBlur={() => setChairperson(toHalfWidthAndSpace(chairperson.trim()))}
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
              {/* 副社長 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>副社長</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={seniorVicePresident}
                      onChange={(e) => setSeniorVicePresident(e.target.value)}
                      onBlur={() => setSeniorVicePresident(toHalfWidthAndSpace(seniorVicePresident.trim()))}
                    />
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
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={seniorManagingDirector}
                      onChange={(e) => setSeniorManagingDirector(e.target.value)}
                      onBlur={() => setSeniorManagingDirector(toHalfWidthAndSpace(seniorManagingDirector.trim()))}
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
              {/* 常務取締役 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>常務取締役</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={managingDirector}
                      onChange={(e) => setManagingDirector(e.target.value)}
                      onBlur={() => setManagingDirector(toHalfWidthAndSpace(managingDirector.trim()))}
                    />
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
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={director}
                      onChange={(e) => setDirector(e.target.value)}
                      onBlur={() => setDirector(toHalfWidthAndSpace(director.trim()))}
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
              {/* 役員 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>役員</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={boardMember}
                      onChange={(e) => setBoardMember(e.target.value)}
                      onBlur={() => setBoardMember(toHalfWidthAndSpace(boardMember.trim()))}
                    />
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
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={auditor}
                      onChange={(e) => setAuditor(e.target.value)}
                      onBlur={() => setAuditor(toHalfWidthAndSpace(auditor.trim()))}
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
              {/* 部長 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>部長</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={manager}
                      onChange={(e) => setManager(e.target.value)}
                      onBlur={() => setManager(toHalfWidthAndSpace(manager.trim()))}
                    />
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
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={member}
                      onChange={(e) => setMember(e.target.value)}
                      onBlur={() => setMember(toHalfWidthAndSpace(member.trim()))}
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
                    value={businessContent}
                    onChange={(e) => setBusinessContent(e.target.value)}
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
                    value={websiteURL}
                    onChange={(e) => setWebsiteURL(e.target.value)}
                    onBlur={() => setWebsiteURL(toHalfWidth(websiteURL.trim()))}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmail(toHalfWidth(email.trim()))}
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
            <div className={`${styles.row_area} ${styles.text_area_large} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>主要取引先</span>
                  <textarea
                    name="clients"
                    id="clients"
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={clients}
                    onChange={(e) => setClients(e.target.value)}
                  ></textarea>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 主要仕入先 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>主要仕入先</span>
                  <textarea
                    name="supplier"
                    id="supplier"
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                  ></textarea>
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
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                  ></textarea>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 事業拠点 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>事業拠点</span>
                  <textarea
                    name="business_sites"
                    id="business_sites"
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={businessSites}
                    onChange={(e) => setBusinessSites(e.target.value)}
                  ></textarea>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 海外拠点 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>海外拠点</span>
                  <textarea
                    name="business_sites"
                    id="business_sites"
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={overseasBases}
                    onChange={(e) => setOverseasBases(e.target.value)}
                  ></textarea>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* グループ会社 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>グループ会社</span>
                  <textarea
                    name="business_sites"
                    id="business_sites"
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={groupCompany}
                    onChange={(e) => setGroupCompany(e.target.value)}
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
              {/* 予算申請月1 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>予算申請月1</span>
                    <select
                      name="budget_request_month1"
                      id="budget_request_month1"
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={budgetRequestMonth1}
                      onChange={(e) => setBudgetRequestMonth1(e.target.value)}
                    >
                      <option value=""></option>
                      <option value="1月">1月</option>
                      <option value="2月">2月</option>
                      <option value="3月">3月</option>
                      <option value="4月">4月</option>
                      <option value="5月">5月</option>
                      <option value="6月">6月</option>
                      <option value="7月">7月</option>
                      <option value="8月">8月</option>
                      <option value="9月">9月</option>
                      <option value="10月">10月</option>
                      <option value="11月">11月</option>
                      <option value="12月">12月</option>
                    </select>
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
                    <select
                      name="budget_request_month2"
                      id="budget_request_month2"
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={budgetRequestMonth2}
                      onChange={(e) => setBudgetRequestMonth2(e.target.value)}
                    >
                      <option value=""></option>
                      <option value="1月">1月</option>
                      <option value="2月">2月</option>
                      <option value="3月">3月</option>
                      <option value="4月">4月</option>
                      <option value="5月">5月</option>
                      <option value="6月">6月</option>
                      <option value="7月">7月</option>
                      <option value="8月">8月</option>
                      <option value="9月">9月</option>
                      <option value="10月">10月</option>
                      <option value="11月">11月</option>
                      <option value="12月">12月</option>
                    </select>
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
            {/* 法人番号 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>法人番号</span>
                  <input
                    type="text"
                    placeholder=""
                    className={`${styles.input_box}`}
                    value={corporateNumber}
                    onChange={(e) => setCorporateNumber(e.target.value)}
                    onBlur={() => setCorporateNumber(toHalfWidth(corporateNumber.trim()))}
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
