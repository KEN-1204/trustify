import React, { CSSProperties, KeyboardEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import styles from "./InsertNewClientCompanyModal.module.css";
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
  productCategoryLargeToMappingMediumMap,
  productCategoryLargeToOptionsMediumMap,
  productCategoryLargeToOptionsMediumObjMap,
} from "@/utils/productCategoryM";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { convertToMillions } from "@/utils/Helpers/convertToMillions";
import { BsChevronLeft } from "react-icons/bs";
import { formatJapaneseAddress } from "@/utils/Helpers/formatJapaneseAddress";
import {
  CountryOption,
  RegionArray,
  RegionJp,
  countryArray,
  getNumberOfEmployeesClass,
  mappingCountries,
  mappingIndustryType,
  mappingRegionsJp,
  regionArrayJP,
  optionsIndustryType,
  optionsMonth,
  optionsNumberOfEmployeesClass,
  optionsProductL,
  mappingProductL,
  optionsProductLNameOnly,
} from "@/utils/selectOptions";
import useStore from "@/store";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { useQueryCities } from "@/hooks/useQueryCities";
import { CustomSelectInput } from "@/components/Parts/CustomSelectInput/CustomSelectInput";
import { HiChevronDown } from "react-icons/hi2";
import { Cities, ProductCategoriesLarge, ProductCategoriesMedium } from "@/types";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { InputBoxCity } from "./InputBoxCity";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { FallbackInputBox } from "./FallbackInputBox";
import { useQueryClient } from "@tanstack/react-query";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { CustomSelectMultiple } from "@/components/Parts/CustomSelectMultiple/CustomSelectMultiple";
import {
  ProductCategoriesSmall,
  productCategoryMediumToMappingSmallMap,
  productCategoryMediumToOptionsSmallMap_All,
  productCategoryMediumToOptionsSmallMap_All_obj,
  productCategoryMediumToOptionsSmallMap_business_support_services,
  productCategoryMediumToOptionsSmallMap_control_electrical_equipment,
  productCategoryMediumToOptionsSmallMap_design_production_support,
  productCategoryMediumToOptionsSmallMap_electronic_components_modules,
  productCategoryMediumToOptionsSmallMap_image_processing,
  productCategoryMediumToOptionsSmallMap_it_network,
  productCategoryMediumToOptionsSmallMap_manufacturing_processing_machines,
  productCategoryMediumToOptionsSmallMap_materials,
  productCategoryMediumToOptionsSmallMap_measurement_analysis,
  productCategoryMediumToOptionsSmallMap_mechanical_parts,
  productCategoryMediumToOptionsSmallMap_office,
  productCategoryMediumToOptionsSmallMap_others,
  productCategoryMediumToOptionsSmallMap_scientific_chemical_equipment,
  productCategoryMediumToOptionsSmallMap_seminars_skill_up,
  productCategoryMediumToOptionsSmallMap_tools_consumables_supplies,
} from "@/utils/productCategoryS";
import { formatAddress } from "@/utils/Helpers/formatStringHelpers/formatAddress";

export const InsertNewClientCompanyModal = () => {
  const language = useStore((state) => state.language);
  const setIsOpenInsertNewClientCompanyModal = useDashboardStore((state) => state.setIsOpenInsertNewClientCompanyModal);
  // const [isLoading, setIsLoading] = useState(false);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // 「会社_複製」クリックかどうかを判定するstate
  const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const isDuplicateCompany = useDashboardStore((state) => state.isDuplicateCompany);
  const setIsDuplicateCompany = useDashboardStore((state) => state.setIsDuplicateCompany);

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
  const [countryId, setCountryId] = useState("153");
  const prevCountryIdRef = useRef("153");
  const [regionId, setRegionId] = useState(
    isDuplicateCompany && selectedRowDataCompany?.region_id ? selectedRowDataCompany.region_id.toString() : ""
  );
  // const [cityId, setCityId] = useState("");
  const [cityId, setCityId] = useState("");
  const [countryName, setCountryName] = useState("日本");
  const [regionName, setRegionName] = useState("");
  const [cityName, setCityName] = useState("");
  // 町名・番地
  const [streetAddress, setStreetAddress] = useState("");
  // 建物名・部屋番号
  const [buildingName, setBuildingName] = useState("");
  //
  // ----------------------- 🌟製品分類(大分類・中分類)関連🌟 -----------------------
  const [productCategoryL, setProductCategoryL] = useState("");
  const [productCategoryM, setProductCategoryM] = useState("");
  const [productCategoryS, setProductCategoryS] = useState("");
  // 会社複製の場合は、大分類、中分類、小分類それぞれ配列に要素が存在すれば初期値をセット
  // 大分類
  const initialCategoryLargeArray = useMemo(() => {
    if (!isDuplicateCompany || !selectedRowDataCompany) return [];
    return !!selectedRowDataCompany.product_categories_large_array?.length
      ? selectedRowDataCompany.product_categories_large_array
      : [];
  }, []);
  // 中分類
  const initialCategoryMediumArray = useMemo(() => {
    if (!isDuplicateCompany || !selectedRowDataCompany) return [];
    return !!selectedRowDataCompany.product_categories_medium_array?.length
      ? selectedRowDataCompany.product_categories_medium_array
      : [];
  }, []);
  // 小分類
  const initialCategorySmallArray = useMemo(() => {
    if (!isDuplicateCompany || !selectedRowDataCompany) return [];
    return !!selectedRowDataCompany.product_categories_small_array?.length
      ? selectedRowDataCompany.product_categories_small_array
      : [];
  }, []);

  // 大分類
  const [productCategoryLargeArray, setProductCategoryLargeArray] =
    useState<ProductCategoriesLarge[]>(initialCategoryLargeArray);
  // 中分類
  const [productCategoryMediumArray, setProductCategoryMediumArray] =
    useState<ProductCategoriesMedium[]>(initialCategoryMediumArray);
  // 小分類
  const [productCategorySmallArray, setProductCategorySmallArray] =
    useState<ProductCategoriesSmall[]>(initialCategorySmallArray);

  // カスタムセレクトボックス用にnameのみで選択中のSetオブジェクトを作成
  // ---------------- 🔸大分類🔸 ----------------
  const selectedProductCategoryLargeSet = useMemo(() => {
    return new Set([...productCategoryLargeArray]);
  }, [productCategoryLargeArray]);

  const getProductCategoryLargeName = (option: ProductCategoriesLarge) => {
    return mappingProductL[option][language];
  };

  // ---------------- 🔸中分類🔸 ----------------
  const selectedProductCategoryMediumSet = useMemo(() => {
    return new Set([...productCategoryMediumArray]);
  }, [productCategoryMediumArray]);

  // 中分類のoptions 大分類で複数選択している場合には、選択中の大分類に紐づく全ての中分類をoptionsにセット
  const optionsProductCategoryMediumAll = useMemo(() => {
    const filteredOptionsNameOnly = optionsProductLNameOnly.filter((name) => selectedProductCategoryLargeSet.has(name));
    const newOptionsM = filteredOptionsNameOnly
      .map((option) => {
        return productCategoryLargeToOptionsMediumMap[option];
      })
      .flatMap((array) => array);

    return newOptionsM;
  }, [optionsProductLNameOnly, selectedProductCategoryLargeSet, productCategoryLargeToOptionsMediumMap]);

  // 名称変換マップ
  const mappingProductCategoryMediumAll = useMemo(() => {
    let mappingObj = {} as {
      [x: string]: {
        [key: string]: string;
      };
    };

    Array.from(selectedProductCategoryLargeSet).forEach((option) => {
      mappingObj = { ...mappingObj, ...productCategoryLargeToMappingMediumMap[option] };
    });

    // if (selectedProductCategoryLargeSet.has("electronic_components_modules"))
    //   mappingObj = { ...mappingObj, ...mappingModuleCategoryM };
    // if (selectedProductCategoryLargeSet.has("mechanical_parts"))
    //   mappingObj = { ...mappingObj, ...mappingMachinePartsCategoryM };
    // if (selectedProductCategoryLargeSet.has("manufacturing_processing_machines"))
    //   mappingObj = { ...mappingObj, ...mappingProcessingMachineryCategoryM };
    // if (selectedProductCategoryLargeSet.has("scientific_chemical_equipment"))
    //   mappingObj = { ...mappingObj, ...mappingScienceCategoryM };
    // if (selectedProductCategoryLargeSet.has("materials")) mappingObj = { ...mappingObj, ...mappingMaterialCategoryM };
    // if (selectedProductCategoryLargeSet.has("measurement_analysis"))
    //   mappingObj = { ...mappingObj, ...mappingAnalysisCategoryM };
    // if (selectedProductCategoryLargeSet.has("image_processing"))
    //   mappingObj = { ...mappingObj, ...mappingImageProcessingCategoryM };
    // if (selectedProductCategoryLargeSet.has("control_electrical_equipment"))
    //   mappingObj = { ...mappingObj, ...mappingControlEquipmentCategoryM };
    // if (selectedProductCategoryLargeSet.has("tools_consumables_supplies"))
    //   mappingObj = { ...mappingObj, ...mappingToolCategoryM };
    // if (selectedProductCategoryLargeSet.has("design_production_support"))
    //   mappingObj = { ...mappingObj, ...mappingDesignCategoryM };
    // if (selectedProductCategoryLargeSet.has("it_network")) mappingObj = { ...mappingObj, ...mappingITCategoryM };
    // if (selectedProductCategoryLargeSet.has("office")) mappingObj = { ...mappingObj, ...mappingOfficeCategoryM };
    // if (selectedProductCategoryLargeSet.has("business_support_services"))
    //   mappingObj = { ...mappingObj, ...mappingBusinessSupportCategoryM };
    // if (selectedProductCategoryLargeSet.has("seminars_skill_up"))
    //   mappingObj = { ...mappingObj, ...mappingSkillUpCategoryM };
    // if (selectedProductCategoryLargeSet.has("others")) mappingObj = { ...mappingObj, ...mappingOthersCategoryM };

    return new Map(Object.entries(mappingObj).map(([key, value]) => [key, value]));
  }, [selectedProductCategoryLargeSet]);

  const getProductCategoryMediumNameAll = (option: ProductCategoriesMedium) => {
    const mappingObj = mappingProductCategoryMediumAll.get(option);
    return mappingObj ? mappingObj[language] : "-";
    // return mappingProductCategoryMediumAll[option][language];
  };

  // 🌠中分類が選択されている状態で大分類のチェックが外された場合には、外された大分類に紐づく中分類を削除する
  useEffect(() => {
    // 大分類に紐づくoptionのみで作成したoptionsProductCategoryMediumAllに含まれていない選択中の中分類は削除
    const optionsProductCategoryMediumAllSet = new Set(optionsProductCategoryMediumAll);
    const newMediumArray = [...productCategoryMediumArray].filter((option) =>
      optionsProductCategoryMediumAllSet.has(option as any)
    );
    console.log("🔥大分類が変更されたため中分類を更新");
    setProductCategoryMediumArray(newMediumArray);
  }, [optionsProductCategoryMediumAll]);

  // ---------------- 🔸中分類🔸 ここまで ----------------

  // ---------------- 🔸小分類🔸 ----------------
  const selectedProductCategorySmallSet = useMemo(() => {
    return new Set([...productCategorySmallArray]);
  }, [productCategorySmallArray]);

  // 小分類のoptions 中分類で複数選択している場合には、選択中の中分類に紐づく全ての小分類をoptionsにセット
  const optionsProductCategorySmallAll = useMemo(() => {
    // 取得した現在選択可能な全ての中分類のoptionsから既に選択中の中分類を取得
    const filteredOptionsMediumNameOnly = Array.from(selectedProductCategoryMediumSet);

    // 選択中の中分類の選択肢に紐づく小分類のoptionsを全て取得
    const newOptionsSmall = filteredOptionsMediumNameOnly
      .map((optionName) => {
        // 選択中の大分類に応じて中分類のMapを使用
        return productCategoryMediumToOptionsSmallMap_All[optionName];
      })
      .flatMap((array) => array);

    return newOptionsSmall;
  }, [selectedProductCategoryMediumSet]);

  // 🌠小分類が選択されている状態で中分類のチェックが外された場合には、外された中分類に紐づく小分類を削除する
  useEffect(() => {
    // 中分類に紐づくoptionのみで作成したoptionsProductCategorySmallAllに含まれていない選択中の小分類は削除
    const optionsProductCategorySmallAllSet = new Set(optionsProductCategorySmallAll);
    const newSmallArray = [...productCategorySmallArray].filter((option) =>
      optionsProductCategorySmallAllSet.has(option as any)
    );
    console.log("🔥中分類が変更されたため小分類を更新");
    setProductCategorySmallArray(newSmallArray);
  }, [optionsProductCategorySmallAll]);

  // 名称変換マップ
  const mappingProductCategorySmallAll = useMemo(() => {
    let mappingObj = {} as {
      [x: string]: {
        [key: string]: string;
      };
    };

    productCategoryMediumArray.forEach((option) => {
      mappingObj = { ...mappingObj, ...productCategoryMediumToMappingSmallMap[option] };
    });

    return new Map(Object.entries(mappingObj).map(([key, value]) => [key, value]));
  }, [selectedProductCategoryMediumSet]);

  const getProductCategorySmallNameAll = (option: ProductCategoriesSmall) => {
    const mappingObj = mappingProductCategorySmallAll.get(option);
    return mappingObj ? mappingObj[language] : "-";
    // return mappingProductCategorySmallAll[option][language];
  };
  // ---------------- 🔸小分類🔸 ここまで ----------------
  // ----------------------- 🌟製品分類(大分類・中分類)関連🌟 ここまで -----------------------

  const [numberOfEmployeesClass, setNumberOfEmployeesClass] = useState("");
  const [fiscalEndMonth, setFiscalEndMonth] = useState("");
  const [capital, setCapital] = useState<string>("");
  // const [capital, setCapital] = useState<string | null>("");
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

  // const supabase = useSupabaseClient();
  const { createClientCompanyWithProductCategoriesMutation } = useMutateClientCompany();

  // // // ======================= 🌟市区町村のuseQuery🌟 =======================
  // const { data: citiesArray, isLoading: isLoadingCities } = useQueryCities(regionId ? Number(regionId) : null);
  // // // ======================= ✅市区町村のuseQuery✅ =======================

  // ======================= 🌟「会社_複製」の場合はデータを複製🌟 =======================
  // 初回マウント時に選択中の担当者&会社の列データの情報をStateに格納
  useEffect(() => {
    if (!selectedRowDataCompany) return;
    if (!isDuplicateCompany) return;
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
    // 業種別
    // let _industry_type = selectedRowDataCompany.industry_type ? selectedRowDataCompany.industry_type : "";
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
    // 業種別
    // setIndustryType(_industry_type);
    setIndustryType(_industry_type_id);
    // 国別・都道府県別・市区町村別
    setCountryId(_country_id);
    prevCountryIdRef.current = _country_id;
    setRegionId(_region_id);
    setCityId(_city_id);
    setCountryName(
      selectedRowDataCompany.country_id ? mappingCountries[selectedRowDataCompany.country_id][language] : "日本"
    );
    console.log(
      "🔥🔥🔥🔥🔥selectedRowDataCompany.country_id",
      selectedRowDataCompany.country_id,
      "🔥🔥🔥🔥🔥selectedRowDataCompany.region_id",
      selectedRowDataCompany.region_id,
      "🔥🔥🔥🔥🔥mappingCountries[selectedRowDataCompany.country_id][language]",
      selectedRowDataCompany.country_id && mappingCountries[selectedRowDataCompany.country_id][language],
      "mappingRegionsJp[selectedRowDataCompany.region_id][language]",
      selectedRowDataCompany.region_id && mappingRegionsJp[selectedRowDataCompany.region_id][language]
    );
    setRegionName(
      selectedRowDataCompany.country_id === 153 && selectedRowDataCompany.region_id
        ? mappingRegionsJp[selectedRowDataCompany.region_id][language]
        : ""
    );
    // 町名・番地と建物名が入力されていなかった場合は、抽出してセット

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
  // ======================= ✅「会社_複製」の場合はデータを複製✅ =======================

  const [isMounted, setIsMounted] = useState(false);
  // const queryClient = useQueryClient()

  // ✅「会社_複製」の場合はstreetAddressとbuildingNameをセット
  useEffect(() => {
    if (!isDuplicateCompany) return setIsMounted(true);
    if (isMounted) return;
    if (streetAddress) return;
    if (!regionName) return;
    if (!cityName) return;

    // const citiesArray = queryClient.getQueryData(["cities", regionId]) as Cities[];
    // if (!citiesArray) return;

    if (address && countryId === "153") {
      let _streetAddress;
      // 住所から都道府県を削除
      const addressWithoutRegion = address.replace(regionName, "").trim();
      // const addressWithoutRegion = regionArrayJP.reduce((acc: any, region: RegionArray) => {
      //   if (acc.includes(region.name_ja)) {
      //     return acc.replace(region.name_ja, "").trim();
      //   }
      // }, address as string);

      // 市区町村を削除
      const addressWithoutCity = addressWithoutRegion.replace(cityName, "").trim();
      // const addressWithoutCity = citiesArray.reduce((acc, city) => {
      //   if (acc.includes(city.city_name_ja)) {
      //     return acc.replace(city.city_name_ja, "").trim();
      //   }
      // }, addressWithoutRegion);

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

  // console.log("InsertNewClientCompanyModalコンポーネント レンダリング selectedRowDataCompany", selectedRowDataCompany);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    if (loadingGlobalState) return;
    setIsOpenInsertNewClientCompanyModal(false);
    if (isDuplicateCompany) setIsDuplicateCompany(false);
  };
  const handleSaveAndClose = async () => {
    if (!name) return alert("会社名を入力してください");
    if (!mainPhoneNumber) return alert("代表TELを入力してください");
    if (!departmentName) return alert("部署名を入力してください");
    // if (!address) return alert("住所を入力してください");
    if (!countryName) return alert("国名を入力してください");
    if (!regionName) return alert("都道府県を入力してください");
    if (!cityName) return alert("市区町村を入力してください");

    setLoadingGlobalState(true);

    // 🔸住所の前処理
    const _address = (
      formatAddress(regionName) +
      formatAddress(cityName) +
      (formatAddress(streetAddress) ?? "") +
      " " +
      (formatAddress(buildingName, true) ?? "")
    ).trim();

    // --------------------- 🔸製品分類関連の前処理 ---------------------
    // 製品分類をnameからidに変換して配列にまとめる
    // 大分類
    let productCategoryLargeIdsArray: number[] = [];
    if (0 < productCategoryLargeArray.length) {
      console.log("============================ 大分類実行🔥");
      const largeNameToIdMap = new Map(optionsProductL.map((obj) => [obj.name, obj.id]));
      productCategoryLargeIdsArray = productCategoryLargeArray
        .map((name) => {
          return largeNameToIdMap.get(name);
        })
        .filter((id): id is number => id !== undefined && id !== null);
    }
    // 中分類
    let productCategoryMediumIdsArray: number[] = [];
    if (0 < productCategoryMediumArray.length) {
      console.log("============================ 中分類実行🔥");
      // 選択中の大分類に紐づく全ての中分類のオブジェクトを取得 productCategoryLargeToOptionsMediumObjMap
      const optionsMediumObj = productCategoryLargeArray
        .map((name) => productCategoryLargeToOptionsMediumObjMap[name])
        .flatMap((array) => array);
      const mediumNameToIdMap = new Map(optionsMediumObj.map((obj) => [obj.name, obj.id]));
      productCategoryMediumIdsArray = productCategoryMediumArray
        .map((name) => {
          return mediumNameToIdMap.get(name);
        })
        .filter((id): id is number => id !== undefined && id !== null);
    }
    // 小分類
    let productCategorySmallIdsArray: number[] = [];
    if (0 < productCategorySmallArray.length) {
      console.log("============================ 小分類実行🔥");
      // 選択中の大分類に紐づく全ての中分類のオブジェクトを取得 productCategoryMediumToOptionsSmallMap_All_obj
      const optionsSmallObj = productCategoryMediumArray
        .map((name) => productCategoryMediumToOptionsSmallMap_All_obj[name])
        .flatMap((array) => array);
      const mediumNameToIdMap = new Map(optionsSmallObj.map((obj) => [obj.name, obj.id]));
      productCategorySmallIdsArray = productCategorySmallArray
        .map((name) => {
          return mediumNameToIdMap.get(name);
        })
        .filter((id): id is number => id !== undefined && id !== null);
    }

    // 大分類・中分類・小分類を全て１つの配列にまとめてINSERT => INSERTは中間テーブルに会社idと製品分類idを割り当てるだけなので一括にまとめてOK
    const productCategoryAllIdsArray = [
      ...productCategoryLargeIdsArray,
      ...productCategoryMediumIdsArray,
      ...productCategorySmallIdsArray,
    ];

    console.log(
      "製品分類 INSERT対象の全ての製品分類",
      productCategoryAllIdsArray,
      "製品分類 大分類",
      productCategoryLargeIdsArray,
      productCategoryLargeArray,
      "製品分類 中分類",
      productCategoryMediumIdsArray,
      productCategoryMediumArray,
      "製品分類 小分類",
      productCategorySmallIdsArray,
      productCategorySmallArray
    );
    // --------------------- 🔸製品分類関連の前処理 ここまで ---------------------

    // if (true) {
    //   console.log("================================================================================");
    //   // console.log("製品分類 大分類", productCategoryLargeIdsArray, productCategoryLargeArray);
    //   // console.log("製品分類 中分類", productCategoryMediumIdsArray, productCategoryMediumArray);
    //   // console.log("製品分類 小分類", productCategorySmallIdsArray, productCategorySmallArray);

    //   console.log("================================================================================");
    //   setLoadingGlobalState(false);
    //   return;
    // }

    // 🔸新規作成するデータをオブジェクトにまとめる
    const newClientCompany = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      // created_by_department_of_user: userProfileState?.department ? userProfileState.department : null,
      created_by_department_of_user: userProfileState?.assigned_department_id
        ? userProfileState.assigned_department_id
        : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      created_by_section_of_user: userProfileState?.assigned_section_id ? userProfileState.assigned_section_id : null,
      created_by_unit_of_user: userProfileState?.assigned_unit_id ? userProfileState.assigned_unit_id : null,
      created_by_office_of_user: userProfileState?.assigned_office_id ? userProfileState.assigned_office_id : null,
      name: name ? name : null,
      department_name: departmentName ? departmentName : null,
      main_fax: mainFax ? mainFax : null,
      zipcode: zipcode ? zipcode : null,
      // address: address ? address : null,
      address: _address ? _address : null,
      department_contacts: departmentContacts ? departmentContacts : null,
      industry_large: industryL ? industryL : null,
      industry_small: industryS ? industryS : null,
      // 業種
      // industry_type: industryType ? industryType : null,
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
      // product_category_large: isValidNumber(productCategoryL) ? parseInt(productCategoryL, 10) : null,
      // product_category_medium: isValidNumber(productCategoryM) ? parseInt(productCategoryM, 10) : null,
      // product_category_small: isValidNumber(productCategoryS) ? parseInt(productCategoryS, 10) : null,
      number_of_employees_class: numberOfEmployeesClass ? numberOfEmployeesClass : null,
      fiscal_end_month: fiscalEndMonth ? fiscalEndMonth : null,
      // capital: capital ? capital : null,
      capital: isNaN(parseInt(capital, 10)) ? null : parseInt(capital, 10),
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
      // 追加 製品分類(大分類・中分類・小分類)の配列
      product_categories_all_ids: productCategoryAllIdsArray,
      // product_categories_large_ids: productCategoryLargeIdsArray,
      // product_categories_medium_ids: productCategoryMediumIdsArray,
      // product_categories_small_ids: productCategorySmallIdsArray,
    };

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    // createClientCompanyMutation.mutate(newClientCompany);
    // 製品分類を同時にINSERT(複製の場合も新たに顧客専用の会社として新規に作成するためcreate関数でOK)
    createClientCompanyWithProductCategoriesMutation.mutate(newClientCompany);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewClientCompanyModal(false);
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
      containerHeight: modalPosition?.height ?? 0,
      containerWidth: modalPosition?.width ?? 0,
      containerTop: modalPosition?.y ?? 0,
      containerLeft: modalPosition?.x ?? 0,
    });
  };
  // ============================================================================================
  // ================================ ツールチップを非表示 ================================
  const handleCloseTooltip = () => {
    if (hoveredItemPosModal) setHoveredItemPosModal(null);
  };
  // ============================================================================================

  // 紹介予定inputタグからfocus、blurで予測メニューをhidden切り替え
  const resultCountryRefs = useRef<HTMLDivElement | null>(null);
  const resultRegionRefs = useRef<HTMLDivElement | null>(null);
  const resultCityRefs = useRef<HTMLDivElement | null>(null);
  const inputCountryRef = useRef<HTMLInputElement | null>(null);
  const inputRegionRef = useRef<HTMLInputElement | null>(null);
  const inputCityRef = useRef<HTMLInputElement | null>(null);
  type SuggestedObj = { id: string; fullName: string };
  // const [suggestedCountryIdNameArray, setSuggestedCountryIdNameArray] = useState<CountryOption[]>(countryArray);
  // const [suggestedRegionIdNameArray, setSuggestedRegionIdNameArray] = useState<RegionArray[]>(regionArrayJP);
  const [suggestedCountryIdNameArray, setSuggestedCountryIdNameArray] = useState<CountryOption[]>();
  const [suggestedRegionIdNameArray, setSuggestedRegionIdNameArray] = useState<RegionArray[]>();
  const [suggestedCityIdNameArray, setSuggestedCityIdNameArray] = useState<Cities[]>([]);

  // 市区町村の配列取得時にsuggestedCityIdNameArrayに格納
  // useEffect(() => {
  //   if (!citiesArray || citiesArray.length) {
  //     setSuggestedCityIdNameArray([]);
  //     return;
  //   }
  //   setSuggestedCityIdNameArray(citiesArray);
  // }, [citiesArray]);

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

      // if (title === "city") {
      //   if (!citiesArray) {
      //     return setSuggestedCityIdNameArray([]);
      //   }
      //   const filteredResult = citiesArray.filter((obj) => {
      //     if (language === "ja") return obj.city_name_ja?.toLowerCase().includes(e.currentTarget.value.toLowerCase());
      //     if (language === "en") return obj.city_name_en?.toLowerCase().includes(e.currentTarget.value.toLowerCase());
      //   });
      //   console.log("🌟filteredResult", filteredResult, "🌟入力あり", e.currentTarget.value);
      //   setSuggestedCityIdNameArray(filteredResult);
      //   return;
      // }
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

      // if (title === "city") {
      //   if (!citiesArray) {
      //     return setSuggestedCityIdNameArray([]);
      //   }
      //   const filteredResult = citiesArray.filter((obj) => {
      //     if (language === "ja") return obj.city_name_ja?.toLowerCase().includes(currentInputState.toLowerCase());
      //     if (language === "en") return obj.city_name_en?.toLowerCase().includes(currentInputState.toLowerCase());
      //   });
      //   console.log("🌟filteredResult", filteredResult, "🌟入力あり", currentInputState);
      //   setSuggestedCityIdNameArray(filteredResult);
      //   return;
      // }
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
    // if (title === "city" && regionId && !!citiesArray?.length) {
    //   const matchCityId = citiesArray.find(
    //     (obj) => (language === "ja" ? obj.city_name_ja : obj.city_name_en) === currentInputState
    //   )?.city_id;
    //   if (matchCityId && cityId !== matchCityId.toString()) setCityId(matchCityId.toString());
    //   if (!matchCityId && cityId) setCityId("");
    // }
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

  const modalPosition = useMemo(() => {
    if (!modalContainerRef.current) return null;
    const { x, y, width, height } = modalContainerRef.current.getBoundingClientRect();
    return { x, y, width, height };
  }, [modalContainerRef.current]);

  console.log(
    "InsertNewClientCompanyModalレンダリング",
    "productCategoryLargeArray",
    productCategoryLargeArray,
    "selectedProductCategoryLargeSet",
    selectedProductCategoryLargeSet
  );
  console.log("========================================================================");
  console.log(
    "productCategoryMediumArray",
    productCategoryMediumArray,
    "optionsProductCategoryMediumAll",
    optionsProductCategoryMediumAll,
    "mappingProductCategoryMediumAll",
    mappingProductCategoryMediumAll
  );
  console.log("========================================================================");
  console.log(
    "productCategorySmallArray",
    productCategorySmallArray,
    "selectedProductCategorySmallSet",
    selectedProductCategorySmallSet,
    "optionsProductCategorySmallAll",
    optionsProductCategorySmallAll,
    "mappingProductCategorySmallAll",
    mappingProductCategorySmallAll
  );
  // console.log("countryName", countryName, "countryId", countryId, "国リスト候補", suggestedCountryIdNameArray);
  // console.log("regionName", regionName, "regionId", regionId, "都道府県リスト候補", suggestedRegionIdNameArray);
  // console.log("cityName", cityName, "cityId", cityId, "市区町村リスト候補", suggestedCityIdNameArray);

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
          {/* キャンセル */}
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
          <div className="min-w-[150px] select-none font-bold">会社 作成</div>
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
                    placeholder="※入力必須　例：株式会社○○　　個人事業主・フリーランスの場合は電話番号を入力してください"
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
                    placeholder="※入力必須　例：代表取締役、営業部など　　部署名が不明の場合は.(ピリオド)を入力してください"
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
              {/* ●代表TEL */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.required_title}`}>●代表TEL</span>
                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                    </span> */}
                    <input
                      type="text"
                      placeholder="※入力必須　例：03-1234-5678、06-1234-5678など"
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
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={fiscalEndMonth}
                      onChange={(e) => setFiscalEndMonth(e.target.value)}
                    >
                      <option value=""></option>
                      {/* <option value="">回答を選択してください</option> */}
                      {optionsMonth.map((option) => (
                        <option key={option} value={option}>
                          {option}月
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
                    {/* <input
                      type="text"
                      placeholder="例："
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
                        onMouseLeave={handleCloseTooltip}
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
                        {/* <HiChevronDown className="stroke-[1] text-[13px] text-[var(--color-text-sub)]" /> */}
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
                            // if (isOpenDropdownMenuFilterProducts) return;
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              content: "フィルターされた都道府県リストを表示します。",
                              content2: "アイコンをクリックしてフィルターの切り替えが可能です。",
                              // content3: "商品紹介が無い面談の場合は「他」を選択してください。",
                              // marginTop: 57,
                              // marginTop: 38,
                              marginTop: 12,
                              itemsPosition: "center",
                              whiteSpace: "nowrap",
                            });
                          }}
                          onMouseLeave={handleCloseTooltip}
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
                            // if (!isOpenDropdownMenuFilterProducts || hoveredItemPosModal) handleCloseTooltip();
                            if (hoveredItemPosModal) handleCloseTooltip();
                          }}
                        >
                          {/* <HiChevronDown className="stroke-[1] text-[13px] text-[var(--color-text-sub)]" /> */}
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
                            isDuplicateOrUpdateCompany={isDuplicateCompany}
                          />
                        </Suspense>
                      </ErrorBoundary>
                    )}
                    {/* {!!regionName && (
                      <div className={`input_container relative z-[100] flex h-[32px] w-full items-start`}>
                        <input
                          ref={inputCityRef}
                          type="text"
                          placeholder="キーワード入力後、市区町村を選択してください。"
                          required
                          className={`${styles.input_box}`}
                          value={cityName}
                          onChange={(e) => setCityName(e.target.value)}
                          onKeyUp={(e) => handleSuggestedName(e, "city")}
                          onFocus={(e) => {
                            handleFocusSuggestedName(cityName, "city");
                            if (!!resultCityRefs.current) resultCityRefs.current.style.opacity = "1";
                          }}
                          onBlur={() => {
                            if (!!resultCityRefs.current) resultCityRefs.current.style.opacity = "0";
                            handleBlurSetId(cityName, "city");
                          }}
                        />
                        {suggestedCityIdNameArray &&
                          suggestedCityIdNameArray &&
                          suggestedCityIdNameArray?.length > 0 && (
                            <div
                              ref={resultCityRefs}
                              className={`${styles.result_box}`}
                              style={
                                {
                                  "--color-border-custom": "#ccc",
                                } as CSSProperties
                              }
                            >
                              {suggestedCityIdNameArray &&
                                suggestedCityIdNameArray &&
                                suggestedCityIdNameArray?.length > 0 && (
                                  <div className="sticky top-0 flex min-h-[5px] w-full flex-col items-center justify-end">
                                    <hr className={`min-h-[4px] w-full bg-[var(--color-bg-under-input)]`} />
                                    <hr className={`min-h-[1px] w-[93%] bg-[#ccc]`} />
                                  </div>
                                )}
                              <ul>
                                {suggestedCityIdNameArray?.map((city, index) => (
                                  <li
                                    key={city.city_id.toString() + index.toString()}
                                    onClick={(e) => {
                                      // console.log("🌟innerText", e.currentTarget.innerText);
                                      const productName = language === "ja" ? city.city_name_ja : city.city_name_en;
                                      const productId = city.city_id;
                                      // setPlannedProduct1(e.currentTarget.innerText);
                                      setCityName(productName ?? "");
                                      setCityId(productId ? productId.toString() : "");
                                      setSuggestedCityIdNameArray([]);
                                    }}
                                  >
                                    {language === "ja" ? city.city_name_ja : city.city_name_en}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        <div
                          className={`flex-center absolute right-[3px] top-[50%] min-h-[20px] min-w-[20px] translate-y-[-50%] cursor-pointer rounded-full hover:bg-[var(--color-bg-sub-icon)]`}
                          onMouseEnter={(e) => {
                            // if (isOpenDropdownMenuFilterProducts) return;
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              content: "フィルターされた市区町村リストを表示します。",
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
                            if (inputCityRef.current) {
                              // フォーカス状態でリスト表示されている場合はフォーカスを切ってリストを削除
                              if (!!suggestedCityIdNameArray?.length) {
                                inputCityRef.current.blur();
                                setSuggestedCityIdNameArray([]);
                              }
                              // まだフォーカスされていない場合
                              else {
                                inputCityRef.current.focus();
                                // 矢印クリック 全商品をリストで表示
                                if (!suggestedCityIdNameArray?.length && citiesArray && citiesArray.length > 0) {
                                  setSuggestedCityIdNameArray(citiesArray);
                                }
                              }
                            }
                            if (hoveredItemPosModal) handleCloseTooltip();
                          }}
                        >
                          <HiChevronDown className="stroke-[1] text-[13px] text-[var(--color-text-brand-f)]" />
                        </div>
                      </div>
                    )} */}
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
                    {/* <span className={`${styles.title}`}>
                      {language === "ja" ? `建物名・部屋番号` : `Building name/Room number`}
                    </span> */}
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
            {/* <div className={`${styles.row_area} ${styles.text_area} flex w-full items-center`}> */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-end`} style={{ minHeight: "28px" }}>
                  {/* <span className={`${styles.title} ${styles.required_title}`}>●住所</span> */}
                  <span className={`${styles.title} ${styles.required_title}`}>●住所</span>
                  <p className={`text-[14px] text-[var(--color-text-under-input)]`}>
                    {(regionName ?? "") + (cityName ?? "") + (streetAddress ?? "") + " " + (buildingName ?? "")}
                  </p>
                  {/* <textarea
                    cols={30}
                    rows={10}
                    placeholder="※入力必須　住所を入力してください （例：東京都千代田区千代田1-1）"
                    required
                    className={`${styles.textarea_box}`}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    // onBlur={() => setAddress(toHalfWidth(address.trim()))}
                    onBlur={() => setAddress(formatJapaneseAddress(address.trim()))}
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
              {/* 資本金(万) 入力はtextで自由、簡単に10億など入力してもらい、保存するときにnumber型に変換する */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>資本金(万)</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={!!capital ? capital : ""}
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
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: managingDirector,
                            marginTop: 12,
                            itemsPosition: "left",
                          });
                      }}
                      onMouseLeave={handleCloseTooltip}
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
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: director,
                            marginTop: 12,
                            itemsPosition: "left",
                          });
                      }}
                      onMouseLeave={handleCloseTooltip}
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
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: boardMember,
                            marginTop: 12,
                            itemsPosition: "left",
                          });
                      }}
                      onMouseLeave={handleCloseTooltip}
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
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: auditor,
                            marginTop: 12,
                            itemsPosition: "left",
                          });
                      }}
                      onMouseLeave={handleCloseTooltip}
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
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: manager,
                            marginTop: 12,
                            itemsPosition: "left",
                          });
                      }}
                      onMouseLeave={handleCloseTooltip}
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
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: member,
                            marginTop: 12,
                            itemsPosition: "left",
                          });
                      }}
                      onMouseLeave={handleCloseTooltip}
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
                      <option key={option} value={option}>
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
                    {/* <span className={`${styles.title}`}>製品分類(大分類)</span> */}
                    <div className={`flex flex-col ${styles.title} ${styles.double}`}>
                      <span>製品分類</span>
                      <span>(大分類)</span>
                    </div>
                    <CustomSelectMultiple
                      stateArray={productCategoryLargeArray}
                      dispatch={setProductCategoryLargeArray}
                      selectedSetObj={selectedProductCategoryLargeSet}
                      options={optionsProductLNameOnly}
                      getOptionName={getProductCategoryLargeName}
                      withBorder={true}
                      modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                      customClass="font-normal"
                      bgDark={false}
                      maxWidth={420}
                      maxHeight={32}
                    />
                    {/* <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={productCategoryL}
                      onChange={(e) => setProductCategoryL(e.target.value)}
                    >
                      <option value=""></option>
                      {optionsProductL.map((option) => (
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
              {/* 製品分類(中分類) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title}`}>製品分類(中分類)</span> */}
                    <div className={`flex flex-col ${styles.title} ${styles.double}`}>
                      <span>製品分類</span>
                      <span>(中分類)</span>
                    </div>
                    {0 < productCategoryLargeArray.length && (
                      <>
                        <CustomSelectMultiple
                          stateArray={productCategoryMediumArray}
                          dispatch={setProductCategoryMediumArray}
                          selectedSetObj={selectedProductCategoryMediumSet}
                          options={optionsProductCategoryMediumAll}
                          getOptionName={getProductCategoryMediumNameAll}
                          withBorder={true}
                          modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                          customClass="font-normal"
                          bgDark={false}
                          maxWidth={420}
                          maxHeight={32}
                        />
                      </>
                    )}
                    {/*  // <select
                      //   value={productCategoryM}
                      //   onChange={(e) => setProductCategoryM(e.target.value)}
                      //   className={`${
                      //     !!productCategoryLargeArray.length ? "" : "hidden"
                      //   } ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      // >

                      //   <option key="" value=""></option>
                      //   {inputProductL === "electronic_components_modules" &&
                      //     productCategoriesM.moduleCategoryM.map((option) => (
                      //       <option key={`moduleCategoryM${option.name}`} value={option.id}>
                      //         {mappingModuleCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      //   {inputProductL === "mechanical_parts" &&
                      //     productCategoriesM.machinePartsCategoryM.map((option) => (
                      //       <option key={`machinePartsCategoryM${option.name}`} value={option.id}>
                      //         {mappingMachinePartsCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      //   {inputProductL === "manufacturing_processing_machines" &&
                      //     productCategoriesM.processingMachineryCategoryM.map((option) => (
                      //       <option key={`processingMachineryCategoryM${option.name}`} value={option.id}>
                      //         {mappingProcessingMachineryCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      //   {inputProductL === "scientific_chemical_equipment" &&
                      //     productCategoriesM.scienceCategoryM.map((option) => (
                      //       <option key={`processingMachineryCategoryM${option.name}`} value={option.id}>
                      //         {mappingScienceCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      //   {inputProductL === "materials" &&
                      //     productCategoriesM.materialCategoryM.map((option) => (
                      //       <option key={`materialCategoryM${option.name}`} value={option.id}>
                      //         {mappingMaterialCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      //   {inputProductL === "measurement_analysis" &&
                      //     productCategoriesM.analysisCategoryM.map((option) => (
                      //       <option key={`analysisCategoryM${option.name}`} value={option.id}>
                      //         {mappingAnalysisCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      //   {inputProductL === "image_processing" &&
                      //     productCategoriesM.imageProcessingCategoryM.map((option) => (
                      //       <option key={`imageProcessingCategoryM${option.name}`} value={option.id}>
                      //         {mappingImageProcessingCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      //   {inputProductL === "control_electrical_equipment" &&
                      //     productCategoriesM.controlEquipmentCategoryM.map((option) => (
                      //       <option key={`controlEquipmentCategoryM${option.name}`} value={option.id}>
                      //         {mappingControlEquipmentCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      //   {inputProductL === "tools_consumables_supplies" &&
                      //     productCategoriesM.toolCategoryM.map((option) => (
                      //       <option key={`toolCategoryM${option.name}`} value={option.id}>
                      //         {mappingToolCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      //   {inputProductL === "design_production_support" &&
                      //     productCategoriesM.designCategoryM.map((option) => (
                      //       <option key={`designCategoryM${option.name}`} value={option.id}>
                      //         {mappingDesignCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      //   {inputProductL === "it_network" &&
                      //     productCategoriesM.ITCategoryM.map((option) => (
                      //       <option key={`ITCategoryM${option.name}`} value={option.id}>
                      //         {mappingITCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      //   {inputProductL === "office" &&
                      //     productCategoriesM.OfficeCategoryM.map((option) => (
                      //       <option key={`OfficeCategoryM${option.name}`} value={option.id}>
                      //         {mappingOfficeCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      //   {inputProductL === "business_support_services" &&
                      //     productCategoriesM.businessSupportCategoryM.map((option) => (
                      //       <option key={`businessSupportCategoryM${option.name}`} value={option.id}>
                      //         {mappingBusinessSupportCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      //   {inputProductL === "seminars_skill_up" &&
                      //     productCategoriesM.skillUpCategoryM.map((option) => (
                      //       <option key={`skillUpCategoryM${option.name}`} value={option.id}>
                      //         {mappingSkillUpCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      //   {inputProductL === "others" &&
                      //     productCategoriesM.othersCategoryM.map((option) => (
                      //       <option key={`othersCategoryM${option.name}`} value={option.id}>
                      //         {mappingOthersCategoryM[option.name][language]}
                      //       </option>
                      //     ))}
                      // </select> */}
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
              {/* 製品分類(小分類) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title}`}>製品分類(大分類)</span> */}
                    <div className={`flex flex-col ${styles.title} ${styles.double}`}>
                      <span>製品分類</span>
                      <span>(小分類)</span>
                    </div>
                    {0 < productCategoryMediumArray.length && (
                      <>
                        <CustomSelectMultiple
                          stateArray={productCategorySmallArray}
                          dispatch={setProductCategorySmallArray}
                          selectedSetObj={selectedProductCategorySmallSet}
                          options={optionsProductCategorySmallAll}
                          getOptionName={getProductCategorySmallNameAll}
                          withBorder={true}
                          modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                          customClass="font-normal"
                          bgDark={false}
                          maxWidth={420}
                          maxHeight={32}
                        />
                      </>
                    )}
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
                {/* <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`flex flex-col ${styles.title} ${styles.double}`}>
                      <span>製品分類</span>
                      <span>(中分類)</span>
                    </div>
                    {0 < productCategoryLargeArray.length && (
                      <>
                        <CustomSelectMultiple
                          stateArray={productCategoryMediumArray}
                          dispatch={setProductCategoryMediumArray}
                          selectedSetObj={selectedProductCategoryMediumSet}
                          options={optionsProductCategoryMediumAll}
                          getOptionName={getProductCategoryMediumNameAll}
                          withBorder={true}
                          modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                          customClass="font-normal"
                          bgDark={false}
                          maxWidth={420}
                          maxHeight={32}
                        />
                      </>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div> */}
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
                    onBlur={() => toHalfWidth(websiteURL.trim())}
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
