import React, { CSSProperties, KeyboardEvent, Suspense, useEffect, useRef, useState } from "react";
import styles from "./UpdateClientCompanyModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN } from "lodash";
import { useMutateClientCompany } from "@/hooks/useMutateClientCompany";
import productCategoriesM, {
  mappingAnalysisCategoryM,
  mappingBusinessSupportCategoryM,
  mappingControlEquipmentCategoryM,
  mappingDesignCategoryM,
  mappingITCategoryM,
  mappingImageProcessingCategoryM,
  mappingMachinePartsCategoryM,
  mappingMaterialCategoryM,
  mappingModuleCategoryM,
  mappingOfficeCategoryM,
  mappingOthersCategoryM,
  mappingProcessingMachineryCategoryM,
  mappingScienceCategoryM,
  mappingSkillUpCategoryM,
  mappingToolCategoryM,
} from "@/utils/productCategoryM";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { convertToMillions } from "@/utils/Helpers/convertToMillions";
import { BsChevronLeft } from "react-icons/bs";
import {
  CountryOption,
  RegionArray,
  countryArray,
  getNumberOfEmployeesClass,
  mappingCountries,
  mappingIndustryType,
  mappingRegionsJp,
  optionsIndustryType,
  optionsMonth,
  optionsNumberOfEmployeesClass,
  regionArrayJP,
} from "@/utils/selectOptions";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import useStore from "@/store";
import { Cities } from "@/types";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { FallbackInputBox } from "../InsertNewClientCompnayModal/FallbackInputBox";
import { InputBoxCity } from "../InsertNewClientCompnayModal/InputBoxCity";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { HiChevronDown } from "react-icons/hi2";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";

export const UpdateClientCompanyModal = () => {
  const language = useStore((state) => state.language);
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
  // 業種
  const [industryType, setIndustryType] = useState("");
  // 国別・都道府県別・市区町村別
  const [countryId, setCountryId] = useState(
    selectedRowDataCompany?.country_id ? selectedRowDataCompany.country_id.toString() : ""
  );
  const prevCountryIdRef = useRef(
    selectedRowDataCompany?.country_id ? selectedRowDataCompany.country_id.toString() : ""
  );
  const [regionId, setRegionId] = useState(
    selectedRowDataCompany?.region_id ? selectedRowDataCompany.region_id.toString() : ""
  );
  const [cityId, setCityId] = useState(
    selectedRowDataCompany?.city_id ? selectedRowDataCompany.city_id.toString() : ""
  );
  const [countryName, setCountryName] = useState("");
  const [regionName, setRegionName] = useState("");
  const [cityName, setCityName] = useState("");
  // 町名・番地
  const [streetAddress, setStreetAddress] = useState("");
  // 建物名・部屋番号
  const [buildingName, setBuildingName] = useState("");
  //
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
    let _industry_type_id = isValidNumber(selectedRowDataCompany.industry_type_id)
      ? selectedRowDataCompany.industry_type_id!.toString()
      : "";

    // 国別・都道府県別・市区町村別
    let _country_id = isValidNumber(selectedRowDataCompany.country_id)
      ? selectedRowDataCompany.country_id!.toString()
      : "";
    let _region_id = isValidNumber(selectedRowDataCompany.region_id)
      ? selectedRowDataCompany.region_id!.toString()
      : "";
    let _city_id = isValidNumber(selectedRowDataCompany.city_id) ? selectedRowDataCompany.city_id!.toString() : "";
    let _street_address = selectedRowDataCompany.street_address ? selectedRowDataCompany.street_address : "";
    let _building_name = selectedRowDataCompany.building_name ? selectedRowDataCompany.building_name : "";
    //
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
    let _capital = selectedRowDataCompany.capital ? selectedRowDataCompany.capital.toString() : "";
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
    setIndustryType(_industry_type_id);
    // 国別・都道府県別・市区町村別
    setCountryId(_country_id);
    prevCountryIdRef.current = _country_id;
    setRegionId(_region_id);
    setCityId(_city_id);
    setCountryName(
      selectedRowDataCompany.country_id ? mappingCountries[selectedRowDataCompany.country_id][language] : ""
    );
    setRegionName(
      selectedRowDataCompany.country_id === 153 && selectedRowDataCompany.region_id
        ? mappingRegionsJp[selectedRowDataCompany.region_id][language]
        : ""
    );
    setStreetAddress(streetAddress);
    setBuildingName(_building_name);
    //
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
    // if (!address) return alert("住所を入力してください");
    if (!countryName) return alert("国名を入力してください");
    if (!regionName) return alert("都道府県を入力してください");
    if (!cityName) return alert("市区町村を入力してください");

    if (!selectedRowDataCompany) {
      alert("選択した会社情報が見つかりません");
      setIsOpenUpdateClientCompanyModal(false);
      return;
    }

    setLoadingGlobalState(true);

    // 住所
    const _address = (regionName + cityName + (streetAddress ?? "") + " " + (buildingName ?? "")).trim();

    // 新規作成するデータをオブジェクトにまとめる
    const newClientCompany = {
      id: selectedRowDataCompany.id,
      // created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      // created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_company_id: selectedRowDataCompany?.created_by_company_id
        ? selectedRowDataCompany.created_by_company_id
        : null,
      created_by_user_id: selectedRowDataCompany?.created_by_user_id ? selectedRowDataCompany.created_by_user_id : null,
      // created_by_department_of_user: userProfileState?.department ? userProfileState.department : null,
      created_by_department_of_user: userProfileState?.assigned_department_id
        ? userProfileState?.assigned_department_id
        : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      created_by_section_of_user: userProfileState?.assigned_section_id ? userProfileState.assigned_section_id : null,
      created_by_unit_of_user: userProfileState?.assigned_unit_id ? userProfileState.assigned_unit_id : null,
      created_by_office_of_user: userProfileState?.assigned_office_id ? userProfileState.assigned_office_id : null,
      name: name,
      department_name: departmentName,
      main_fax: mainFax ? mainFax : null,
      zipcode: zipcode ? zipcode : null,
      // address: address ? address : null,
      address: _address ? _address : null,
      department_contacts: departmentContacts ? departmentContacts : null,
      industry_large: industryL ? industryL : null,
      industry_small: industryS ? industryS : null,
      // 業種
      industry_type_id: isValidNumber(industryType) ? parseInt(industryType, 10) : null,
      // 国別・都道府県別・市区町村別
      country_id: isValidNumber(countryId) ? parseInt(countryId, 10) : null,
      region_id: isValidNumber(regionId) ? parseInt(regionId, 10) : null,
      city_id: isValidNumber(cityId) ? parseInt(cityId, 10) : null,
      street_address: streetAddress ? streetAddress : null,
      building_name: buildingName ? buildingName : null,
      //
      product_category_large: productCategoryL ? productCategoryL : null,
      product_category_medium: productCategoryM ? productCategoryM : null,
      product_category_small: productCategoryS ? productCategoryS : null,
      number_of_employees_class: numberOfEmployeesClass ? numberOfEmployeesClass : null,
      fiscal_end_month: fiscalEndMonth ? fiscalEndMonth : null,
      capital: !!capital ? parseInt(capital, 10) : null,
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

    // supabaseにUPDATE,ローディング終了, モーダルを閉じる
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

  // ================================ ツールチップ ================================
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    content3?: string | undefined | null;
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
    marginTop,
    itemsPosition = "center",
    whiteSpace,
  }: TooltipParams) => {
    // モーダルコンテナのleftを取得する
    if (!modalContainerRef.current) return;
    const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
    const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
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
      content: content,
      content2: content2,
      content3: content3,
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

  const [isMounted, setIsMounted] = useState(false);
  // const queryClient = useQueryClient()
  useEffect(() => {
    if (isMounted) return;
    if (streetAddress) return;
    if (!regionName) return;
    if (!cityName) return;

    if (address && countryId === "153") {
      let _streetAddress;
      // 住所から都道府県を削除
      const addressWithoutRegion = address.replace(regionName, "").trim();

      // 市区町村を削除
      const addressWithoutCity = addressWithoutRegion.replace(cityName, "").trim();

      // 建物名を削除
      if (buildingName) {
        _streetAddress = addressWithoutCity.replace(buildingName, "").trim();
      } else {
        if (addressWithoutCity.includes(" ")) {
          const streetAndBuilding = addressWithoutCity.split(" ");
          const _buildingName = streetAndBuilding[streetAndBuilding.length - 1];
          setBuildingName(_buildingName);
          _streetAddress = addressWithoutCity.replace(_buildingName, "").trim();
          console.log(
            "streetAndBuilding",
            streetAndBuilding,
            "streetAndBuilding[streetAndBuilding.length - 1]",
            _buildingName,
            "addressWithoutCity",
            addressWithoutCity,
            'addressWithoutCity.replace(_buildingName, "").trim()',
            _streetAddress
          );
        } else {
          _streetAddress = addressWithoutCity;
        }
      }

      setStreetAddress(_streetAddress);
    }
    setIsMounted(true);
  }, [regionName, cityName, isMounted]);

  // 紹介予定inputタグからfocus、blurで予測メニューをhidden切り替え
  const resultCountryRefs = useRef<HTMLDivElement | null>(null);
  const resultRegionRefs = useRef<HTMLDivElement | null>(null);
  const resultCityRefs = useRef<HTMLDivElement | null>(null);
  const inputCountryRef = useRef<HTMLInputElement | null>(null);
  const inputRegionRef = useRef<HTMLInputElement | null>(null);
  const inputCityRef = useRef<HTMLInputElement | null>(null);
  type SuggestedObj = { id: string; fullName: string };
  const [suggestedCountryIdNameArray, setSuggestedCountryIdNameArray] = useState<CountryOption[]>();
  const [suggestedRegionIdNameArray, setSuggestedRegionIdNameArray] = useState<RegionArray[]>();
  const [suggestedCityIdNameArray, setSuggestedCityIdNameArray] = useState<Cities[]>([]);

  // 紹介予定商品の入力値を商品リストから生成した予測変換リストから絞り込んで提案する
  const handleSuggestedName = (e: KeyboardEvent<HTMLInputElement>, title: string) => {
    let filteredResult = [];

    // 入力されていない場合
    if (!e.currentTarget.value.length) {
      console.log("🌟入力されていない e.currentTarget.value", e.currentTarget.value);
      if (title === "country") setSuggestedCountryIdNameArray([]);
      if (title === "region") setSuggestedRegionIdNameArray([]);
      if (title === "city") setSuggestedCityIdNameArray([]);
    }
    // 入力値が存在する場合は、入力値に一致するavailableKeywordsをフィルター
    if (e.currentTarget.value.length) {
      if (title === "country") {
        const filteredResult = countryArray.filter((obj) => {
          if (language === "ja") return obj.name_ja.toLowerCase().includes(e.currentTarget.value.toLowerCase());
          if (language === "en") return obj.name_en.toLowerCase().includes(e.currentTarget.value.toLowerCase());
        });
        console.log("🌟filteredResult", filteredResult, "🌟入力あり", e.currentTarget.value);
        setSuggestedCountryIdNameArray(filteredResult);
        return;
      }

      if (title === "region") {
        const filteredResult = regionArrayJP.filter((obj) => {
          if (language === "ja") return obj.name_ja.toLowerCase().includes(e.currentTarget.value.toLowerCase());
          if (language === "en") return obj.name_en.toLowerCase().includes(e.currentTarget.value.toLowerCase());
        });
        console.log("🌟filteredResult", filteredResult, "🌟入力あり", e.currentTarget.value);
        setSuggestedRegionIdNameArray(filteredResult);
        return;
      }
    }
  };

  const handleFocusSuggestedName = (currentInputState: string | null, title: string) => {
    if (!currentInputState) return;
    let filteredResult = [];

    // 入力されていない場合
    if (!currentInputState.length) {
      console.log("🌟入力されていない currentInputState", currentInputState);
      if (title === "country") setSuggestedCountryIdNameArray([]);
      if (title === "region") setSuggestedRegionIdNameArray([]);
      if (title === "city") setSuggestedCityIdNameArray([]);
    }
    // 入力値が存在する場合は、入力値に一致するavailableKeywordsをフィルター
    if (currentInputState.length) {
      if (title === "country") {
        const filteredResult = countryArray.filter((obj) => {
          if (language === "ja") return obj.name_ja.toLowerCase().includes(currentInputState.toLowerCase());
          if (language === "en") return obj.name_en.toLowerCase().includes(currentInputState.toLowerCase());
        });
        console.log("🌟filteredResult", filteredResult, "🌟入力あり", currentInputState);
        setSuggestedCountryIdNameArray(filteredResult);
        return;
      }

      if (title === "region") {
        const filteredResult = regionArrayJP.filter((obj) => {
          if (language === "ja") return obj.name_ja.toLowerCase().includes(currentInputState.toLowerCase());
          if (language === "en") return obj.name_en.toLowerCase().includes(currentInputState.toLowerCase());
        });
        console.log("🌟filteredResult", filteredResult, "🌟入力あり", currentInputState);
        setSuggestedRegionIdNameArray(filteredResult);
        return;
      }
    }
  };

  // 国以下を全てリセット
  const resetRegion = () => {
    if (countryId) setCountryId("");
    if (countryName) setCountryName("");
    if (regionId) setRegionId("");
    if (regionName) setRegionName("");
    if (cityId) setCityId("");
    if (cityName) setCityName("");
    if (streetAddress) setStreetAddress("");
    if (buildingName) setBuildingName("");
  };

  // onBlurで入力している国名と完全一致している選択肢があればidをセットする
  const handleBlurSetId = (currentInputState: string, title: string) => {
    if (!currentInputState) return;

    if (title === "country") {
      const matchCountryId = countryArray.find(
        (obj) => (language === "ja" ? obj.name_ja : obj.name_en) === currentInputState
      )?.id;
      if (matchCountryId) {
        const newCountryId = matchCountryId.toString();
        setCountryId(newCountryId);
        if (newCountryId !== prevCountryIdRef.current) {
          resetRegion();
          prevCountryIdRef.current = newCountryId;
        }
      }
      if (!matchCountryId && countryId) {
        setCountryId("");
        if (prevCountryIdRef.current !== "") {
          resetRegion();
          prevCountryIdRef.current = "";
        }
      }
    }
    if (title === "region" && countryName === "日本") {
      if (/都|道|府|県/.test(currentInputState)) {
        const matchRegionId = regionArrayJP.find(
          (obj) => (language === "ja" ? obj.name_ja : obj.name_en) === currentInputState
        )?.id;
        if (matchRegionId && regionId !== matchRegionId.toString()) setRegionId(matchRegionId.toString());
        if (!matchRegionId && regionId) setRegionId("");
      }
      // 都道府県が含まれていなくて、かつ候補が一つならその候補をidとNameにセット
      else if (suggestedRegionIdNameArray?.length === 1) {
        const newRegionName = suggestedRegionIdNameArray[0].name_ja;
        const matchRegionId = regionArrayJP.find(
          (obj) => (language === "ja" ? obj.name_ja : obj.name_en) === newRegionName
        )?.id;
        if (matchRegionId && regionId !== matchRegionId.toString()) setRegionId(matchRegionId.toString());
        if (!matchRegionId && regionId) setRegionId("");
        setRegionName(newRegionName);
      } else {
        if (regionId) setRegionId("");
      }
    }
  };

  // 住所の各セクションで空文字になったらセクション以下を全てリセットするuseEffect
  useEffect(() => {
    if (!isMounted) return;
    if (!countryName) {
      // if (address) setAddress("");
      if (suggestedRegionIdNameArray?.length !== 0) setSuggestedRegionIdNameArray([]);
      if (suggestedCityIdNameArray?.length !== 0) setSuggestedCityIdNameArray([]);
      if (countryId) setCountryId("");
      prevCountryIdRef.current = "";
      if (regionId) setRegionId("");
      if (regionName) setRegionName("");
      if (cityId) setCityId("");
      if (cityName) setCityName("");
      if (streetAddress) setStreetAddress("");
      if (buildingName) setBuildingName("");
      return;
    }
  }, [countryName]);
  useEffect(() => {
    if (!isMounted) return;
    if (!regionName) {
      if (regionId) setRegionId("");
      if (suggestedCityIdNameArray?.length !== 0) setSuggestedCityIdNameArray([]);
      if (cityId) setCityId("");
      if (cityName) setCityName("");
      if (streetAddress) setStreetAddress("");
      if (buildingName) setBuildingName("");
      return;
    }
  }, [regionName]);
  useEffect(() => {
    if (!isMounted) return;
    if (!cityName) {
      if (streetAddress) setStreetAddress("");
      if (buildingName) setBuildingName("");
      return;
    }
  }, [cityName]);
  useEffect(() => {
    if (!isMounted) return;
    if (!streetAddress) {
      if (buildingName) setBuildingName("");
      return;
    }
  }, [streetAddress]);

  console.log("countryName", countryName, "countryId", countryId, "国リスト候補", suggestedCountryIdNameArray);
  console.log("regionName", regionName, "regionId", regionId, "都道府県リスト候補", suggestedRegionIdNameArray);

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />

      <div className={`${styles.container} fade03`} ref={modalContainerRef}>
        {/* ツールチップ */}
        {hoveredItemPosModal && <TooltipModal />}
        {/* ローディングオーバーレイ */}
        {loadingGlobalState && (
          <div className={`${styles.loading_overlay_modal_outside} `}>
            {/* <SpinnerComet w="48px" h="48px" s="5px" /> */}
            <div className={`${styles.loading_overlay_modal_inside}`}>
              <SpinnerBrand withBorder withShadow />
            </div>
          </div>
        )}
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

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 国名 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>国名</span>
                    <div className={`input_container relative z-[1000] flex h-[32px] w-full items-start`}>
                      <input
                        ref={inputCountryRef}
                        type="text"
                        placeholder="キーワード入力後、国名を選択してください。"
                        required
                        className={`${styles.input_box}`}
                        value={countryName}
                        onChange={(e) => setCountryName(e.target.value)}
                        onKeyUp={(e) => handleSuggestedName(e, "country")}
                        onFocus={(e) => {
                          handleFocusSuggestedName(countryName, "country");
                          if (!!resultCountryRefs.current) resultCountryRefs.current.style.opacity = "1";
                        }}
                        onBlur={() => {
                          if (!!resultCountryRefs.current) resultCountryRefs.current.style.opacity = "0";
                          handleBlurSetId(countryName, "country");
                        }}
                      />
                      {/* 予測変換結果 */}
                      {suggestedCountryIdNameArray && suggestedCountryIdNameArray?.length > 0 && (
                        <div
                          ref={resultCountryRefs}
                          className={`${styles.result_box}`}
                          style={
                            {
                              "--color-border-custom": "#ccc",
                            } as CSSProperties
                          }
                        >
                          {suggestedCountryIdNameArray && suggestedCountryIdNameArray?.length > 0 && (
                            <div className="sticky top-0 z-[100] flex min-h-[5px] w-full flex-col items-center justify-end">
                              <hr className={`min-h-[4px] w-full bg-[var(--color-bg-under-input)]`} />
                              <hr className={`min-h-[1px] w-[93%] bg-[#ccc]`} />
                            </div>
                          )}
                          <ul>
                            {suggestedCountryIdNameArray?.map((country, index) => (
                              <li
                                key={country.id.toString() + index.toString()}
                                onClick={(e) => {
                                  // console.log("🌟innerText", e.currentTarget.innerText);
                                  const countryName = language === "ja" ? country.name_ja : country.name_en;
                                  const countryId = country.id;
                                  // setPlannedProduct1(e.currentTarget.innerText);
                                  setCountryName(countryName ?? "");
                                  setCountryId(countryId ? countryId.toString() : "");
                                  prevCountryIdRef.current = countryId ? countryId.toString() : "";
                                  setSuggestedCountryIdNameArray([]);
                                }}
                              >
                                {language === "ja" ? country.name_ja : country.name_en}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* 予測変換結果 */}
                      <div
                        className={`flex-center absolute right-[3px] top-[50%] min-h-[20px] min-w-[20px] translate-y-[-50%] cursor-pointer rounded-full hover:bg-[var(--color-bg-sub-icon)]`}
                        onMouseEnter={(e) => {
                          // if (isOpenDropdownMenuFilterProducts) return;
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: "フィルターされた国名リストを表示します。",
                            content2: "アイコンをクリックしてフィルターの切り替えが可能です。",
                            // content3: "商品紹介が無い面談の場合は「他」を選択してください。",
                            // marginTop: 57,
                            // marginTop: 38,
                            marginTop: 12,
                            itemsPosition: "center",
                            whiteSpace: "nowrap",
                          });
                        }}
                        onMouseLeave={() => {
                          if (hoveredItemPosModal) handleCloseTooltip();
                        }}
                        onClick={() => {
                          if (inputCountryRef.current) {
                            // フォーカス状態でリスト表示されている場合はフォーカスを切ってリストを削除
                            if (!!suggestedCountryIdNameArray?.length) {
                              inputCountryRef.current.blur();
                              setSuggestedCountryIdNameArray([]);
                            }
                            // まだフォーカスされていない場合
                            else {
                              inputCountryRef.current.focus();
                              // 矢印クリック 全商品をリストで表示
                              if (!suggestedCountryIdNameArray?.length && countryArray && countryArray.length > 0) {
                                setSuggestedCountryIdNameArray(countryArray);
                              }
                            }
                          }
                          if (hoveredItemPosModal) handleCloseTooltip();
                        }}
                      >
                        <HiChevronDown className="stroke-[1] text-[13px] text-[var(--color-text-brand-f)]" />
                      </div>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>{/* 右ラッパーここまで */}</div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 都道府県 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>都道府県</span>
                    {!!countryName && (
                      <div className={`input_container relative z-[100] flex h-[32px] w-full items-start`}>
                        <input
                          ref={inputRegionRef}
                          type="text"
                          placeholder="キーワード入力後、都道府県を選択してください。"
                          required
                          className={`${styles.input_box}`}
                          value={regionName}
                          onChange={(e) => setRegionName(e.target.value)}
                          onKeyUp={(e) => handleSuggestedName(e, "region")}
                          onFocus={(e) => {
                            handleFocusSuggestedName(regionName, "region");
                            if (!!resultRegionRefs.current) resultRegionRefs.current.style.opacity = "1";
                          }}
                          onBlur={() => {
                            if (!!resultRegionRefs.current) resultRegionRefs.current.style.opacity = "0";
                            handleBlurSetId(regionName, "region");
                          }}
                        />
                        {/* 予測変換結果 */}
                        {suggestedRegionIdNameArray && suggestedRegionIdNameArray?.length > 0 && (
                          <div
                            ref={resultRegionRefs}
                            className={`${styles.result_box}`}
                            style={
                              {
                                "--color-border-custom": "#ccc",
                                maxHeight: "240px",
                              } as CSSProperties
                            }
                          >
                            {suggestedRegionIdNameArray && suggestedRegionIdNameArray?.length > 0 && (
                              <div className="sticky top-0 flex min-h-[5px] w-full flex-col items-center justify-end">
                                <hr className={`min-h-[4px] w-full bg-[var(--color-bg-under-input)]`} />
                                <hr className={`min-h-[1px] w-[93%] bg-[#ccc]`} />
                              </div>
                            )}
                            <ul>
                              {suggestedRegionIdNameArray?.map((region, index) => (
                                <li
                                  key={region.id.toString() + index.toString()}
                                  onClick={(e) => {
                                    // console.log("🌟innerText", e.currentTarget.innerText);
                                    const regionName = language === "ja" ? region.name_ja : region.name_en;
                                    const regionId = region.id;
                                    // setPlannedProduct1(e.currentTarget.innerText);
                                    setRegionName(regionName ?? "");
                                    setRegionId(regionId ? regionId.toString() : "");
                                    setSuggestedRegionIdNameArray([]);
                                  }}
                                >
                                  {language === "ja" ? region.name_ja : region.name_en}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {/* 予測変換結果 */}
                        <div
                          className={`flex-center absolute right-[3px] top-[50%] min-h-[20px] min-w-[20px] translate-y-[-50%] cursor-pointer rounded-full hover:bg-[var(--color-bg-sub-icon)]`}
                          onMouseEnter={(e) => {
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              content: "フィルターされた都道府県リストを表示します。",
                              content2: "アイコンをクリックしてフィルターの切り替えが可能です。",
                              marginTop: 12,
                              itemsPosition: "center",
                              whiteSpace: "nowrap",
                            });
                          }}
                          onMouseLeave={() => {
                            if (hoveredItemPosModal) handleCloseTooltip();
                          }}
                          onClick={() => {
                            if (inputRegionRef.current) {
                              // フォーカス状態でリスト表示されている場合はフォーカスを切ってリストを削除
                              if (!!suggestedRegionIdNameArray?.length) {
                                inputRegionRef.current.blur();
                                setSuggestedRegionIdNameArray([]);
                              }
                              // まだフォーカスされていない場合
                              else {
                                // 矢印クリック 全商品をリストで表示
                                if (countryName === "日本") {
                                  inputRegionRef.current.focus();
                                  if (
                                    !suggestedRegionIdNameArray?.length &&
                                    regionArrayJP &&
                                    regionArrayJP.length > 0
                                  ) {
                                    setSuggestedRegionIdNameArray(regionArrayJP);
                                  }
                                }
                              }
                            }
                            if (hoveredItemPosModal) handleCloseTooltip();
                          }}
                        >
                          <HiChevronDown className="stroke-[1] text-[13px] text-[var(--color-text-brand-f)]" />
                        </div>
                      </div>
                    )}
                    {/* 予測変換input セレクトと組み合わせ ここまで */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 市区町村 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full min-h-[35px] items-center`}>
                    <span className={`${styles.title}`}>市区町村</span>
                    {/* <FallbackInputBox /> */}
                    {!!regionName && (
                      <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <Suspense fallback={<FallbackInputBox />}>
                          <InputBoxCity
                            cityName={cityName}
                            setCityName={setCityName}
                            cityId={cityId}
                            setCityId={setCityId}
                            regionName={regionName}
                            regionId={regionId}
                            hoveredItemPosModal={hoveredItemPosModal}
                            handleOpenTooltip={handleOpenTooltip}
                            handleCloseTooltip={handleCloseTooltip}
                            isDuplicateOrUpdateCompany={true}
                          />
                        </Suspense>
                      </ErrorBoundary>
                    )}
                    {/* 予測変換input セレクトと組み合わせ ここまで */}
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
              {/* 町名・番地 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>
                      {language === "ja" ? `町名・番地` : `Street address/Address line`}
                    </span>
                    {!!cityName && (
                      <input
                        type="text"
                        placeholder=""
                        className={`${styles.input_box}`}
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        onBlur={() => setStreetAddress(toHalfWidth(streetAddress.trim()))}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 建物名 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`flex flex-col ${styles.title} ${styles.double}`}>
                      <span>建物名・</span>
                      <span>部屋番号</span>
                    </div>
                    {cityName && (
                      <input
                        type="text"
                        placeholder=""
                        className={`${styles.input_box}`}
                        value={buildingName}
                        onChange={(e) => setBuildingName(e.target.value)}
                        onBlur={() => setBuildingName(toHalfWidth(buildingName).replace(/[\s\u3000]/g, ""))}
                      />
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
            {/* 住所 */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-end`} style={{ minHeight: "28px" }}>
                  <span className={`${styles.title} ${styles.required_title}`}>●住所</span>
                  <p className={`text-[14px] text-[var(--color-text-under-input)]`}>
                    {(regionName ?? "") + (cityName ?? "") + (streetAddress ?? "") + " " + (buildingName ?? "")}
                  </p>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          {/* 住所 */}
          {/* <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            <div className={`${styles.row_area} ${styles.text_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title} ${styles.required_title}`}>●住所</span>
                  <textarea
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
          </div> */}
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
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={numberOfEmployeesClass}
                      onChange={(e) => setNumberOfEmployeesClass(e.target.value)}
                    >
                      <option value=""></option>
                      {/* <option value="">回答を選択してください</option> */}
                      {optionsNumberOfEmployeesClass.map((option) => (
                        <option key={option} value={option}>
                          {getNumberOfEmployeesClass(option)}
                        </option>
                      ))}
                      {/* <option value="A 1000名以上">A 1000名以上</option>
                      <option value="B 500〜999名">B 500〜999名</option>
                      <option value="C 300〜499名">C 300〜499名</option>
                      <option value="D 200〜299名">D 200〜299名</option>
                      <option value="E 100〜199名">E 100〜199名</option>
                      <option value="F 50〜99名">F 50〜99名</option>
                      <option value="G 1〜49名">G 1〜49名</option> */}
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
                      // onBlur={() => setCapital(convertToNumber(capital.trim()).toString())}
                      onBlur={() =>
                        setCapital(
                          !!capital && capital !== "" ? (convertToMillions(capital.trim()) as number).toString() : ""
                        )
                      }
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
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>業種</span>
                  <select
                    className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                    value={industryType}
                    onChange={(e) => setIndustryType(e.target.value)}
                  >
                    <option value=""></option>
                    {optionsIndustryType.map((option) => (
                      <option key={option} value={option.toString()}>
                        {mappingIndustryType[option][language]}
                      </option>
                    ))}
                    {/* <option value="機械要素・部品">機械要素・部品</option>
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
                    <option value="不明">不明</option> */}
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
                        value={productCategoryM}
                        onChange={(e) => setProductCategoryM(e.target.value)}
                        className={`${
                          productCategoryL ? "" : "hidden"
                        } ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      >
                        <option key="" value=""></option>,{/* 1. 電子部品・モジュール */}
                        {inputProductL === "electronic_components_modules" &&
                          productCategoriesM.moduleCategoryM.map((option) => (
                            <option key={`moduleCategoryM${option.name}`} value={option.id}>
                              {mappingModuleCategoryM[option.name][language]}
                            </option>
                          ))}
                        {/* 2. 機械部品 */}
                        {inputProductL === "mechanical_parts" &&
                          productCategoriesM.machinePartsCategoryM.map((option) => (
                            <option key={`machinePartsCategoryM${option.name}`} value={option.id}>
                              {mappingMachinePartsCategoryM[option.name][language]}
                            </option>
                          ))}
                        {/* 3. 製造・加工機械 */}
                        {inputProductL === "manufacturing_processing_machines" &&
                          productCategoriesM.processingMachineryCategoryM.map((option) => (
                            <option key={`processingMachineryCategoryM${option.name}`} value={option.id}>
                              {mappingProcessingMachineryCategoryM[option.name][language]}
                            </option>
                          ))}
                        {/* 4. 科学・理化学機器 */}
                        {inputProductL === "scientific_chemical_equipment" &&
                          productCategoriesM.scienceCategoryM.map((option) => (
                            <option key={`processingMachineryCategoryM${option.name}`} value={option.id}>
                              {mappingScienceCategoryM[option.name][language]}
                            </option>
                          ))}
                        {/* 5. 素材・材料 */}
                        {inputProductL === "materials" &&
                          productCategoriesM.materialCategoryM.map((option) => (
                            <option key={`materialCategoryM${option.name}`} value={option.id}>
                              {mappingMaterialCategoryM[option.name][language]}
                            </option>
                          ))}
                        {/* 6. 測定・分析 */}
                        {inputProductL === "measurement_analysis" &&
                          productCategoriesM.analysisCategoryM.map((option) => (
                            <option key={`analysisCategoryM${option.name}`} value={option.id}>
                              {mappingAnalysisCategoryM[option.name][language]}
                            </option>
                          ))}
                        {/* 7. 画像処理 */}
                        {inputProductL === "image_processing" &&
                          productCategoriesM.imageProcessingCategoryM.map((option) => (
                            <option key={`imageProcessingCategoryM${option.name}`} value={option.id}>
                              {mappingImageProcessingCategoryM[option.name][language]}
                            </option>
                          ))}
                        {/* 8. 制御・電機機器 */}
                        {inputProductL === "control_electrical_equipment" &&
                          productCategoriesM.controlEquipmentCategoryM.map((option) => (
                            <option key={`controlEquipmentCategoryM${option.name}`} value={option.id}>
                              {mappingControlEquipmentCategoryM[option.name][language]}
                            </option>
                          ))}
                        {/* 9. 工具・消耗品・備品 */}
                        {inputProductL === "tools_consumables_supplies" &&
                          productCategoriesM.toolCategoryM.map((option) => (
                            <option key={`toolCategoryM${option.name}`} value={option.id}>
                              {mappingToolCategoryM[option.name][language]}
                            </option>
                          ))}
                        {/* 10. 設計・生産支援 */}
                        {inputProductL === "design_production_support" &&
                          productCategoriesM.designCategoryM.map((option) => (
                            <option key={`designCategoryM${option.name}`} value={option.id}>
                              {mappingDesignCategoryM[option.name][language]}
                            </option>
                          ))}
                        {/* 11. IT・ネットワーク */}
                        {inputProductL === "it_network" &&
                          productCategoriesM.ITCategoryM.map((option) => (
                            <option key={`ITCategoryM${option.name}`} value={option.id}>
                              {mappingITCategoryM[option.name][language]}
                            </option>
                          ))}
                        {/* 12. オフィス */}
                        {inputProductL === "office" &&
                          productCategoriesM.OfficeCategoryM.map((option) => (
                            <option key={`OfficeCategoryM${option.name}`} value={option.id}>
                              {mappingOfficeCategoryM[option.name][language]}
                            </option>
                          ))}
                        {/* 13. 業務支援サービス */}
                        {inputProductL === "business_support_services" &&
                          productCategoriesM.businessSupportCategoryM.map((option) => (
                            <option key={`businessSupportCategoryM${option.name}`} value={option.id}>
                              {mappingBusinessSupportCategoryM[option.name][language]}
                            </option>
                          ))}
                        {/* 14. セミナー・スキルアップ */}
                        {inputProductL === "seminars_skill_up" &&
                          productCategoriesM.skillUpCategoryM.map((option) => (
                            <option key={`skillUpCategoryM${option.name}`} value={option.id}>
                              {mappingSkillUpCategoryM[option.name][language]}
                            </option>
                          ))}
                        {/* 15. その他 */}
                        {inputProductL === "others" &&
                          productCategoriesM.othersCategoryM.map((option) => (
                            <option key={`othersCategoryM${option.name}`} value={option.id}>
                              {mappingOthersCategoryM[option.name][language]}
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

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 事業概要 */}
            <div className={`${styles.row_area} ${styles.text_area_large} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>事業概要</span>
                  <textarea
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
                      {/* <option value="1月">1月</option>
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
                      <option value="12月">12月</option> */}
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
