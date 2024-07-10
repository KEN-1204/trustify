import useDashboardStore from "@/store/useDashboardStore";
import { DragEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "../ImportModal.module.css";
import { SlCloudDownload, SlCloudUpload } from "react-icons/sl";
import useStore from "@/store";
import Papa from "papaparse";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";

import CheckingAnime from "@/components/assets/Animations/Checking";
import { FaCompress } from "react-icons/fa";
import { BiFullscreen } from "react-icons/bi";
import { BsCheck2, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { RiDragMove2Fill } from "react-icons/ri";
import { toast } from "react-toastify";
import { ConfirmationModal } from "@/components/DashboardCompanyComponent/Modal/SettingAccountModal/SettingCompany/ConfirmationModal/ConfirmationModal";
import { CustomSelectMapping } from "@/components/Parts/CustomSelectMapping/CustomSelectMapping";
import { IoIosArrowRoundDown } from "react-icons/io";
import { ImInfo } from "react-icons/im";
import { Towns } from "@/types";
import { RegionNameJpType, regionsNameToIdMapJp } from "@/utils/selectOptions";
import { regionNameToIdMapCitiesJp } from "@/utils/Helpers/AddressHelpers/citiesOptions";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ProgressCircleIncrement } from "@/components/Parts/Charts/ProgressCircle/ProgressCircleIncrement";
import { DotsLoaderBounceF } from "@/components/Parts/Loaders/LoaderDotsBounce/LoaderDotsBounce";
import { ProgressNumberIncrement } from "@/components/Parts/Charts/ProgressNumber/ProgressNumberIncrement";
import { MdClose } from "react-icons/md";

const ProviderImportModalMemo = () => {
  const language = useStore((state) => state.language);
  const setIsOpenProviderImportModal = useDashboardStore((state) => state.setIsOpenProviderImportModal);

  // infoアイコン
  const infoIconStep2Ref = useRef<HTMLDivElement | null>(null);

  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const uploadIconRef = useRef<HTMLDivElement | null>(null);
  const fileUploadBoxRef = useRef<HTMLDivElement | null>(null);
  const dropIconRef = useRef<HTMLDivElement | null>(null);
  const uploadTextRef = useRef<HTMLHeadingElement | null>(null);
  const uploadSubTextRef = useRef<HTMLDivElement | null>(null);
  const fileBrowseTextRef = useRef<HTMLSpanElement | null>(null);
  const inputFileUploadRef = useRef<HTMLInputElement | null>(null);
  const stepBtnRef = useRef<HTMLDivElement | null>(null);

  const [step, setStep] = useState(1);

  // ------------------ CSV to JSON変換中ローディングテキストアニメーション ------------------
  // CSV to JSON変換中ローディング 5MB以上
  const [isConverting, setIsConverting] = useState(false);
  const [isCompletedConvert, setIsCompletedConvert] = useState(false);
  const intervalIdRef = useRef<NodeJS.Timer | number | null>(null);
  // const [convertingText, setConvertingText] = useState("変換中");
  const convertingTextRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (!isConverting) {
      if (intervalIdRef.current) {
        console.log("🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟ローディング終了したためクリア clearInterval");
        clearInterval(intervalIdRef.current as NodeJS.Timer | number);
        intervalIdRef.current = null;
      }
      return;
    }

    const loadingTextEffect = () => {
      if (!convertingTextRef.current) return;

      const text = convertingTextRef.current.innerText;
      console.log("🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠loadingTextEffect実行", text);
      if (text === "読み込み中") {
        convertingTextRef.current.innerText = `読み込み中.`;
      } else if (text === "読み込み中.") {
        convertingTextRef.current.innerText = `読み込み中..`;
      } else if (text === "読み込み中..") {
        convertingTextRef.current.innerText = `読み込み中...`;
      } else if (text === "読み込み中...") convertingTextRef.current.innerText = `読み込み中`;
    };

    // 初回実行
    loadingTextEffect();

    // 0.5秒ごとにクラスを更新
    const intervalId = setInterval(loadingTextEffect, 1000);

    intervalIdRef.current = intervalId;

    // クリーンアップ
    return () => {
      if (intervalIdRef.current) {
        console.log("🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟クリーンアップ clearInterval");
        clearInterval(intervalIdRef.current as NodeJS.Timer | number);
        intervalIdRef.current = null;
      }
    };
  }, [isConverting]);
  // ------------------ CSV to JSON変換中ローディングテキストアニメーション ここまで ------------------

  // ---------------- 🌠キャンセル🌠 ----------------
  const [isOpenCancelConfirmationModal, setIsCancelConfirmationModal] = useState(false);
  const handleCancel = () => {
    if (isConverting) return;

    // ステップ2以降はデータが保存されずに破棄される旨をポップアップで伝える
    if (step === 2) {
      setIsCancelConfirmationModal(true);
      return;
    }

    setIsOpenProviderImportModal(false);
  };
  const handleCloseModal = () => {
    setIsOpenProviderImportModal(false);
  };
  // ----------------------------------------------
  // ---------------- 🌠Browse選択クリック🌠 ----------------
  const handleClickBrowseButton = () => {
    if (isConverting) return;
    console.log("Browseクリック");
    if (inputFileUploadRef.current) inputFileUploadRef.current.click();
  };
  // ----------------------------------------------

  // -------------------------- ステップ1 「CSVのパース・解析」用state --------------------------
  // 🔸パース後のCSVデータ配列 result.data
  // => 1000以上は10000個ずつの配列を配列に格納した出力される:
  // [[]] => [0...9999] => [[0...99], [100...199], [200...299], ..., [9900...9999]]
  // => 1000未満は
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  // 🔸パース後のCSVヘッダーカラム配列
  const [uploadedColumnFields, setUploadedColumnFields] = useState<string[]>([]);
  // 🔸アップロードファイル名
  const [uploadedCSVFile, setUploadedCSVFile] = useState<File | null>(null);
  // -------------------------- ステップ1 「CSVのパース・解析」用state ここまで --------------------------

  // -------------------------- ステップ2 「ユーザーによるカラムの紐付け」用state --------------------------
  // 🔸gridテーブルの各カラムで選択中のDB用フィールド
  const [selectedColumnFieldsArray, setSelectedColumnFieldsArray] = useState<string[]>([]);
  // 🔸テーブルに展開するための最初の5行
  const [uploadedDisplayRowList, setUploadedDisplayRowList] = useState<any[]>([]);
  // 🔸紐付け完了確認モーダル開閉state
  const [isOpenMappingConfirmationModal, setIsMappingConfirmationModal] = useState(false);
  // -------------------------- ステップ2 「ユーザーによるカラムの紐付け」用state ここまで --------------------------

  // -------------------------- ステップ3 「データ前処理」用state --------------------------
  // 🔸CSVカラム名 to データベースカラム名
  const [insertCsvColumnNameToDBColumnMap, setInsertCsvColumnNameToDBColumnMap] = useState<Map<string, string> | null>(
    null
  );
  // 🔸Web Worker(バックグラウンドスレッド)でデータ前処理中
  const [isTransformProcessing, setIsTransformProcessing] = useState(false);
  // 🔸データ前処理完了後の一括インサート用データ
  const [processedData, setProcessedData] = useState<any[]>([]);
  // -------------------------- ステップ3 「データ前処理」用state ここまで --------------------------

  // 🔸既に選択済みのカラムのSetオブジェクト 空文字は除去
  const alreadySelectColumnsSetObj = useMemo(() => {
    const setObj = new Set([...selectedColumnFieldsArray]);
    if (setObj.has("")) setObj.delete("");
    return setObj;
  }, [selectedColumnFieldsArray]);

  const [insertTableType, setInsertTableType] = useState<"towns" | "update_towns_en">("towns");

  const optionsForInsertArray = useMemo(() => {
    switch (insertTableType) {
      case "towns":
        return [
          "town_name_ja",
          "town_name_en",
          "town_name_kana",
          "normalized_name",
          "postal_code",
          "country_id",
          "region_id",
          "city_id",
        ] as (keyof Omit<Towns, "town_id" | "created_at" | "updated_at">)[];
        break;
      case "update_towns_en":
        return ["town_name_en"] as (keyof Omit<Towns, "town_id" | "created_at" | "updated_at">)[];
        break;

      default:
        return [];
        break;
    }
  }, []);

  // 🔸空文字を加えたカラム選択肢
  const optionsColumnsForInsertWithEmpty = useMemo(() => {
    return ["", ...optionsForInsertArray];
  }, []);
  // カラムの名称取得関数 空文字はスキップにして返す
  const getInsertColumnNames = (column: string) => {
    if (column === "") {
      return language === "ja" ? `スキップ` : `Skip`;
    } else {
      switch (insertTableType) {
        case "towns":
          return column;
          break;

        default:
          break;
      }
      return "-";
    }
  };

  // 🔸選択肢から選択するごとに既に選択された選択肢は取り除いていく
  // const remainingOptionsColumnFieldsArray = useMemo(() => {
  //   const remainingOptions = optionsClientCompaniesColumnFieldForInsertArray.filter(
  //     (column) => !alreadySelectColumnsSetObj.has(column)
  //   );
  //   return remainingOptions;
  // }, [alreadySelectColumnsSetObj]);

  // ------------------------------ 🌟step1🌟 ------------------------------

  // ---------------- 🌠ファイルを選択 or ファイルをドロップ CSV読み込み🌠 ----------------
  const handleSelectedFiles = (files: FileList | null) => {
    if (!files) return;
    if (files.length === 0) return;
    console.log("handleSelectedFiles関数実行 取得したFileList", files);

    const selectedFile = files[0];
    const availableFileType = "text/csv";

    const splitFileName = selectedFile.name.split(".");
    const extension = splitFileName[splitFileName.length - 1];

    if (selectedFile.type === availableFileType && extension === "csv") {
      // let reader = new FileReader()
      // reader.readAsArrayBuffer(selectedFile);
      // reader.onload = (e) => {
      //     setExcelFile(e.target?.result);
      // }

      // チェック通過後にファイルを格納
      setUploadedCSVFile(selectedFile);

      // ファイルサイズに基づいてworkerオプションを設定
      // 5MB以上の場合はworkerを使用
      const isRequiredWorker = selectedFile.size > 5 * 1024 * 1024;

      // 5MB以上の場合にはローディングを入れる デフォルトでローディングを入れる
      // if (isRequiredWorker) {
      //   setIsConverting(true);
      // }
      setIsConverting(true);

      console.log("------------------------------------------");
      console.log("チェック通過 ParseStart...", "isRequiredWorker: ", isRequiredWorker, selectedFile, extension);
      performance.mark("CSV_Parse_Start"); // 開始点
      const startTime = performance.now(); // 開始時間

      Papa.parse<any>(selectedFile, {
        header: true,
        skipEmptyLines: true,
        worker: isRequiredWorker,
        complete: (result: Papa.ParseResult<unknown>) => {
          console.log("------------------------------------------");
          performance.mark("CSV_Parse_End"); // 開始点
          performance.measure("CSV_Parse_Time", "CSV_Parse_Start", "CSV_Parse_End"); // 計測
          console.log("Measure Time: ", performance.getEntriesByName("CSV_Parse_Time")[0].duration);
          performance.clearMarks();
          performance.clearMeasures("CSV_Parse_Time");
          const endTime = performance.now(); // 終了時間
          console.log("Time: ", endTime - startTime, "ms");
          console.log("Result: ", result);
          console.log("result.data: ", result.data, result.data.length);
          setUploadedData(result.data || []);
          setUploadedColumnFields(result.meta.fields || []);

          // フィールド数分の選択中DB用カラムstateを作成 初期値は空文字でスキップをセット
          const newSelectedColumnFieldsArray = result.meta.fields
            ? (new Array(result.meta.fields.length).fill("") as string[])
            : [];

          setSelectedColumnFieldsArray(newSelectedColumnFieldsArray);

          // 最初の5行か5行未満の場合には、すべての行をテーブル表示用の行リストstateにセット
          let newRowListForDisplay = [] as any[];
          if (!result.data || result.data.length === 0) {
            newRowListForDisplay = [];
          } else if (result.data.length < 5) {
            newRowListForDisplay = result.data;
          } else if (5 < result.data.length) {
            for (let i = 0; i < 5; i++) {
              newRowListForDisplay.push(result.data[i]);
            }
          }
          setUploadedDisplayRowList(newRowListForDisplay);

          // 5MB以上の場合にはローディングを終了
          console.log("✅ローディング終了");
          setIsConverting(false);
          setIsCompletedConvert(true);

          // toast.success("CSVの読み込みが完了しました🌟");
        },
        error: (error) => {
          console.log("✅ローディング終了");
          setIsConverting(false);
          console.error(error);
          alert("CSVファイルの読み込みに失敗しました。IM001");
        },
      });
    } else {
      return alert("アップロード可能なファイルはCSV形式のみです。");
    }
    // if (!fileListRef.current) return;

    // setTotalFiles((prev) => (prev += files.length));

    // const fileArray = [...files];

    // let addingFileList = [] as JSX.Element[];

    // fileArray.forEach((file, index) => {
    //   if (!fileListRef.current) return;

    //   const uniqueIdentifier = Date.now() + index;

    // //   const fileItemHTML = createFileItemHTML(file, uniqueIdentifier);
    // //   if (!fileItemHTML) return;
    //   // Inserting each file item into file list
    // //   fileListRef.current.insertAdjacentHTML("afterbegin", fileItemHTML.outerHTML);

    //   // useStateで追加するパターン
    //   // addingFileList.push(fileItemHTML);

    // //   if (fileListItemRef.current) {
    // //     fileListItemRef.current.style.display = `none`;
    // //   }

    // });
  };

  // ------------------------------ 🌠ファイルを選択 or ファイルをドロップ CSV読み込み🌠 ------------------------------

  // Drag Enter
  const handleDragEnterUploadBox = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log("Drag Enter", e);

    if (fileUploadBoxRef.current && !fileUploadBoxRef.current.classList.contains(styles.active)) {
      fileUploadBoxRef.current?.classList.add(`${styles.active}`);
    }
    if (uploadIconRef.current) uploadIconRef.current.style.display = "none";
    if (fileBrowseTextRef.current) fileBrowseTextRef.current.style.display = "none";
    // if (uploadTextRef.current) uploadTextRef.current.style.display = "none";
    if (uploadTextRef.current) {
      const uploadText = uploadTextRef.current.querySelector(`.${styles.file_instruction}`) as HTMLSpanElement;
      uploadText.innerText = language === "ja" ? "ファイルをドロップしてください" : "Release to upload or";
      uploadText.style.color = `var(--main-color-f)`;
    }
    if (uploadSubTextRef.current) uploadSubTextRef.current.style.display = `none`;
    if (dropIconRef.current) dropIconRef.current.style.display = "block";
    if (dropIconRef.current) dropIconRef.current.classList.add(styles.animate_bounce);
  };

  // Drag Over
  const handleDragOverUploadBox = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // console.log("Drag Over");
  };

  // Drag Leave
  const handleDragLeaveUploadBox = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log("Drag Leave");

    if (fileUploadBoxRef.current && fileUploadBoxRef.current.classList.contains(styles.active)) {
      fileUploadBoxRef.current?.classList.remove(`${styles.active}`);
    }
    if (uploadIconRef.current) uploadIconRef.current.style.display = "block";
    if (fileBrowseTextRef.current) fileBrowseTextRef.current.style.display = "unset";
    // if (uploadTextRef.current) uploadTextRef.current.style.display = "block";
    if (uploadTextRef.current) {
      const uploadText = uploadTextRef.current.querySelector(`.${styles.file_instruction}`) as HTMLSpanElement;
      uploadText.innerText = language === "ja" ? "ここにファイルをドラッグするか" : "Drag files here or";
      uploadText.style.color = `var(--color-text-sub)`;
    }
    if (uploadSubTextRef.current) uploadSubTextRef.current.style.display = `flex`;
    if (dropIconRef.current) dropIconRef.current.style.display = "none";
    if (dropIconRef.current) dropIconRef.current.classList.remove(styles.animate_bounce);
  };

  // Drop
  const handleDropUploadBox = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log("Drop", e);

    handleSelectedFiles(e.dataTransfer.files);

    if (fileUploadBoxRef.current && fileUploadBoxRef.current.classList.contains(styles.active)) {
      fileUploadBoxRef.current?.classList.remove(`${styles.active}`);
    }
    if (uploadIconRef.current) uploadIconRef.current.style.display = "block";
    if (fileBrowseTextRef.current) fileBrowseTextRef.current.style.display = "unset";
    // if (uploadTextRef.current) uploadTextRef.current.style.display = "block";
    if (uploadTextRef.current) {
      const uploadText = uploadTextRef.current.querySelector(`.${styles.file_instruction}`) as HTMLSpanElement;
      uploadText.innerText = language === "ja" ? "ここにファイルをドラッグするか" : "Drag files here or";
      uploadText.style.color = `var(--color-text-sub)`;
    }
    if (uploadSubTextRef.current) uploadSubTextRef.current.style.display = `flex`;
    if (dropIconRef.current) dropIconRef.current.style.display = "none";
    if (dropIconRef.current) dropIconRef.current.classList.remove(styles.animate_bounce);
  };

  // ------------------------------ 🌠ファイルを選択 or ファイルをドロップ CSV読み込み🌠 ここまで ------------------------------

  // ------------------------------ 🌟step1🌟 ここまで ------------------------------

  // ------------------------------ 🌟step2🌟 ------------------------------
  // ------------------------------ 🌠紐付け確定🌠 ------------------------------

  const [isConfirmInsertModal, setIsConfirmInsertModal] = useState(false);
  const [isConfirmUpdateModal, setIsConfirmUpdateModal] = useState(false);
  const [isLoadingTransforming, setIsLoadingTransforming] = useState(false);
  type UploadTownsCsvType = {
    region_name: string;
    city_name: string;
    postal_code: string;
    town_name_ja: string;
    town_name_kana: string;
  };
  type InsertTownType = Omit<Towns, "town_id" | "created_at" | "updated_at">;
  type TownDetail = { region_name: string; city_name: string; town_name_ja: string; town_name_kana: string };
  const [transformedInsertTownsData, setTransformedInsertTownsData] = useState<InsertTownType[] | null>(null);

  // ----------------------------------- バルクインサート -----------------------------------
  // 前処理実行してインサート内容を確認モーダルを開く
  const startTransformData = () => {
    setIsLoadingTransforming(true);

    try {
      // 町域テーブル
      if (insertTableType === "towns") {
        // 🔸まずは一旦同じ郵便番号を持つ行データが１つの町域のデータかどうかを確認する
        // const filterDataByMultipleEntries = (data: UploadTownsCsvType[]) => {
        //   console.log("------------------------------------------");
        //   performance.mark("Filter_Start"); // 開始点
        //   const startTime = performance.now(); // 開始時間

        //   const postalCodeMap = new Map<string, TownDetail[]>();

        //   data.forEach((item) => {
        //     const { postal_code, ...townDetail } = item;
        //     if (postalCodeMap.has(postal_code)) {
        //       postalCodeMap.get(postal_code)!.push(townDetail);
        //     } else {
        //       postalCodeMap.set(postal_code, [townDetail]);
        //     }
        //   });

        //   // Filter entries with multiple town details
        //   const filteredMap = new Map<string, TownDetail[]>();
        //   postalCodeMap.forEach((details, postalCode) => {
        //     if (details.length > 1) {
        //       filteredMap.set(postalCode, details);
        //     }
        //   });

        //   // 同じ郵便番号でグループ化された町域名データを走査し、開き括弧「（」で始まり閉じ括弧「）」で終わらない行を検出します。次に、その行から閉じ括弧が現れるまでの全ての行を連結し、一つの町域名として処理します。この処理をすべての郵便番号に対して適用することで、必要な町域情報のみを正確に統合できます。

        //   // 同じ郵便番号に対する町域データを整形する関数
        //   const consolidateTownDetails = (
        //     townDetails: TownDetail[]
        //   ): { consolidatedDetails: TownDetail[]; consolidatedDetailsOnly: TownDetail[] } => {
        //     let newDetails: TownDetail[] = [];
        //     let consolidatedDetailsArrayOnly: TownDetail[] = [];
        //     let consolidatedDetail = "";
        //     let consolidatedDetailKana = "";
        //     let isOpen = false; // 括弧が開いているかのフラグ

        //     townDetails.forEach((detail) => {
        //       const { town_name_ja, town_name_kana } = detail;
        //       if (town_name_ja.includes("（") && !town_name_ja.includes("）")) {
        //         // 括弧が開始され、閉じられていない行
        //         consolidatedDetail += town_name_ja;
        //         consolidatedDetailKana += town_name_kana;
        //         isOpen = true;
        //       } else if (isOpen && !town_name_ja.includes("）")) {
        //         // 開始された括弧が閉じられていない間の行を連結
        //         consolidatedDetail += town_name_ja;
        //         consolidatedDetailKana += town_name_kana;
        //       } else if (isOpen && town_name_ja.includes("）")) {
        //         // 開始された括弧が閉じられる行
        //         consolidatedDetail += town_name_ja;
        //         consolidatedDetailKana += town_name_kana;
        //         // 閉じられたタイミングでpush
        //         const newDetail = {
        //           ...detail,
        //           town_name_ja: consolidatedDetail,
        //           town_name_kana: consolidatedDetailKana,
        //         } as TownDetail;
        //         newDetails.push(newDetail);
        //         consolidatedDetailsArrayOnly.push(newDetail);
        //         // リセット
        //         consolidatedDetail = "";
        //         consolidatedDetailKana = "";
        //         isOpen = false;
        //       } else if (!isOpen) {
        //         // 単独で完結している町域名
        //         // consolidatedDetail += (consolidatedDetail ? " " : "") + town_name_ja;
        //         newDetails.push(detail);
        //       }
        //     });

        //     // return consolidatedDetail;
        //     return { consolidatedDetails: newDetails, consolidatedDetailsOnly: consolidatedDetailsArrayOnly };
        //   };

        //   // 新たな処理後の同じ郵便番号を持つ町域グループ
        //   const consolidatedMap = new Map();
        //   const consolidatedMapOnly = new Map();
        //   // 郵便番号ごとにフィルタリングされたMapから町域名を統合
        //   filteredMap.forEach((details, postalCode) => {
        //     const { consolidatedDetails, consolidatedDetailsOnly } = consolidateTownDetails(details);
        //     consolidatedMap.set(postalCode, consolidatedDetails);
        //     if (0 < consolidatedDetailsOnly.length) {
        //       consolidatedMapOnly.set(postalCode, consolidatedDetailsOnly);
        //     }
        //     // console.log(`Postal Code: ${postalCode}, Consolidated Details: ${consolidatedDetails}`);
        //   });

        //   performance.mark("Filter_End"); // 開始点
        //   performance.measure("Filter_Time", "Filter_Start", "Filter_End"); // 計測
        //   console.log("Measure Time: ", performance.getEntriesByName("Filter_Time")[0].duration);
        //   performance.clearMarks();
        //   performance.clearMeasures("Filter_Time");
        //   const endTime = performance.now(); // 終了時間
        //   console.log("Time: ", endTime - startTime, "ms");
        //   console.log(
        //     "前処理完了✅ Result:",
        //     "統合後",
        //     consolidatedMap,
        //     "統合した町域のみ",
        //     consolidatedMapOnly,
        //     "統合前",
        //     filteredMap
        //   );
        //   console.log("------------------------------------------");

        //   //   return filteredMap;
        //   return consolidatedMap;
        // };

        // 🌠パースした全ての行データに対して、町域テーブルにインサート可能な状態にデータを整形

        // 1. 国コードを追加
        // 2. 都道府県名をregion_idに変換
        // 3. 市区町村名をcity_idに変換
        // 4. town_name_jaの値から（...）の部分を除去して、正規化した値をnormalized_nameにセット
        // 5. postal_codeはそのままセット

        // 🔸1~5の変換処理と町域名の統合を同時に行いインサート用リストを生成
        //   全行データから「町域（...」〜「...)」の複数行を「町域（...）」の一行に統合して新たなインサート用の町域リストを生成
        const transformCombinedDataByMultipleEntries = (
          uploadTownsData: UploadTownsCsvType[]
        ): {
          transformedTownsData: InsertTownType[];
          // transformedTownsData: (InsertTownType & {
          //   region_name: string;
          //   city_name: string;
          // })[];
          combinedTownsDataArrayOnly: UploadTownsCsvType[];
          unfinishedRowCount: number;
          invalidRows: UploadTownsCsvType[];
          normalizedNamesArray: string[];
          // onlyKakkoArray: { originalKakko: string; normalizedKakko: string }[];
          // consolidatedKakkoArray: { originalKakko: string; normalizedKakko: string }[];
          //   combinedTownNamesOnly: string[];
          //   combinedTownNamesKanaOnly: string[];
        } => {
          console.log("------------------------------------------");
          performance.mark("Filter_Start"); // 開始点
          const startTime = performance.now(); // 開始時間

          // const transformedTownsData: (InsertTownType & {
          //   region_name: string;
          //   city_name: string;
          // })[] = [];
          const transformedTownsData: InsertTownType[] = [];
          const combinedTownsDataArrayOnly: UploadTownsCsvType[] = [];
          const invalidRows: UploadTownsCsvType[] = []; // 無効な行
          const normalizedNamesArray: string[] = [];
          let consolidatedDetail = "";
          let consolidatedDetailKana = "";
          let isOpen = false; // 括弧が開いているかのフラグ
          let unfinishedRowCount = 0;
          // const onlyKakkoArray: { originalKakko: string; normalizedKakko: string }[] = [];
          // const consolidatedKakkoArray: { originalKakko: string; normalizedKakko: string }[] = [];

          uploadTownsData.forEach((townData) => {
            const { town_name_ja, town_name_kana, region_name, city_name, postal_code } = townData;

            if (town_name_ja.includes("（") && !town_name_ja.includes("）")) {
              unfinishedRowCount += 1;

              // 括弧が開始され、閉じられていない行
              consolidatedDetail += town_name_ja;
              consolidatedDetailKana += town_name_kana;
              isOpen = true;
            } else if (isOpen && !town_name_ja.includes("）")) {
              unfinishedRowCount += 1;

              // 開始された括弧が閉じられていない間の行を連結
              consolidatedDetail += town_name_ja;
              consolidatedDetailKana += town_name_kana;
            } else if (isOpen && town_name_ja.includes("）")) {
              // 🌠🌠開始された括弧が閉じられる行
              unfinishedRowCount += 1;
              consolidatedDetail += town_name_ja;
              consolidatedDetailKana += town_name_kana;

              // 閉じられたタイミングでpush

              // 2. 都道府県名からidを取得
              // const convertedRegionId = convertRegionNameToId(region_name);
              const convertedRegionId = regionsNameToIdMapJp.get(region_name) ?? null;
              if (convertedRegionId !== null) {
                // 取得した都道府県から対応する市区町村Mapオブジェクトを取り出して市区町村名からidを取得
                const cityNameToIdMap = regionNameToIdMapCitiesJp[region_name as RegionNameJpType];
                // 3. 市区町村idを取得
                // const convertedCityId = convertCityNameToId(city_name, cityNameToIdMap);
                const convertedCityId = cityNameToIdMap.get(city_name) ?? null;
                if (convertedCityId !== null) {
                  // 4. town_name_jaの値から（...）の部分を除去して、正規化した値をnormalized_nameにセット
                  // 「芝浦（１丁目）」 => 「芝浦」 「芝浦（２～４丁目）」 => 「芝浦」
                  //   const normalizedName = consolidatedDetail.split('(')[0];
                  // 正規表現を使用して、最初の括弧までのテキストを抽出
                  const match = consolidatedDetail.match(/^[^(^（]+/);
                  // if (match) {
                  //   const originalKakko = consolidatedDetail;
                  //   const normalizedKakko = match[0];
                  //   consolidatedKakkoArray.push({ normalizedKakko, originalKakko });
                  // }
                  let normalizedName = match ? match[0].trim() : consolidatedDetail.trim();

                  //
                  if (normalizedName.includes("の次に")) {
                    normalizedName = normalizedName.split("の次に")[0];
                  }

                  const newTownData = {
                    town_name_ja: consolidatedDetail,
                    town_name_kana: consolidatedDetailKana,
                    country_id: 153, // 国コードを追加
                    region_id: convertedRegionId, // 都道府県コード
                    city_id: convertedCityId, // 市区町村コード
                    town_name_en: null,
                    normalized_name: normalizedName,
                    postal_code: postal_code, // 郵便番号はそのまま格納
                    // region_name: region_name,
                    // city_name: city_name,
                  } as InsertTownType;
                  transformedTownsData.push(newTownData);

                  const combinedTownData = {
                    ...townData,
                    town_name_ja: consolidatedDetail,
                    town_name_kana: consolidatedDetailKana,
                  };
                  combinedTownsDataArrayOnly.push(combinedTownData);

                  normalizedNamesArray.push(normalizedName);
                } else {
                  // 市区町村idがnullのため無効な行として扱う
                  invalidRows.push(townData);
                }
              } else {
                // 都道府県idがnullのため無効な行として扱う
                invalidRows.push(townData);
              }
              // リセット
              consolidatedDetail = "";
              consolidatedDetailKana = "";
              isOpen = false;
            } else if (!isOpen) {
              // 🌠🌠単独で完結している町域名
              //   transformedTownsData.push(townData);

              // 2. 都道府県名からidを取得
              // const convertedRegionId = convertRegionNameToId(region_name);
              const convertedRegionId = regionsNameToIdMapJp.get(region_name) ?? null;
              if (convertedRegionId !== null) {
                // 取得した都道府県から対応する市区町村Mapオブジェクトを取り出して市区町村名からidを取得
                const cityNameToIdMap = regionNameToIdMapCitiesJp[region_name as RegionNameJpType];
                // 3. 市区町村idを取得
                // const convertedCityId = convertCityNameToId(city_name, cityNameToIdMap);
                const convertedCityId = cityNameToIdMap.get(city_name) ?? null;
                if (convertedCityId !== null) {
                  // 🔹normalized_name関連
                  // 🔸4. town_name_jaの値から（...）の部分を除去して町域名を正規化
                  // 「芝浦（１丁目）」 => 「芝浦」 「芝浦（２～４丁目）」 => 「芝浦」
                  //   const normalizedName = consolidatedDetail.split('(')[0];
                  // 正規表現を使用して、最初の括弧までのテキストを抽出
                  // /^[^(^（]+/: ここではキャプチャグループがないため、match[0] が全体のマッチを指します。つまり、括弧が現れる前のすべての文字にマッチし、その全体が match[0] に格納されます。

                  const match = townData.town_name_ja.match(/^[^(^（]+/);
                  // if (match && !match[0].includes("（") && townData.town_name_ja.includes("（")) {
                  //   const originalKakko = townData.town_name_ja;
                  //   const normalizedKakko = match[0];
                  //   onlyKakkoArray.push({ normalizedKakko, originalKakko });
                  // }
                  let normalizedName = match ? match[0].trim() : townData.town_name_ja.trim();

                  // // 🔸「の次に〜番地がくる場合」の前に町域名を正規化
                  // // 「"小菅村の次に１～６６３番地がくる場合"」 => 「小菅村」
                  if (normalizedName.includes("の次に")) {
                    const originalTsugini = normalizedName;
                    const normalizedTsugini = originalTsugini.split("の次に")[0];
                    console.log("🔵「の次に」を正規化", "🔹前", originalTsugini, "🔹後", normalizedTsugini);
                    normalizedName = normalizedTsugini;
                  }

                  // // 🔸地割が付いたパターンを正規化
                  // 1. 「町域名 + 第〜地割」のパターン:
                  //        「"種市第１地割～第３地割"」 => 「種市」
                  //        「"種市第２２地割～第２３地割"」 => 「種市」
                  // 2. 「町域名 + 〜地割」のパターン:
                  //        「"湯田１９地割～湯田２１地割"」 => 「湯田」
                  //        「"左草１地割～左草６地割"」 => 「左草」
                  //        「"小繋沢５４地割～小繋沢５６地割"」 => 「小繋沢」
                  if (normalizedName.includes("～") && normalizedName.includes("地割")) {
                    // 「/^.../」で文字列の先頭から、
                    // (.*?)非貪欲マッチングで最小限の文字列にマッチ
                    // (?=\s*(?:第)?[\d０-９]+地割)で「第〜地割」か「〜地割」が直後に来る文字列にマッチ
                    // (?=\s*(?:第)?\d+地割)で先読みアサーションで、キャプチャはしないが、マッチに指定
                    // [\d０-９]+で半角全角数字1つ以上の繰り返しにマッチ

                    const match = normalizedName.match(/^(.*?)(?=\s*(?:第)?[\d０-９]+地割)/u);
                    if (match) {
                      // キャプチャグループ (\p{Script=Han}+) があり、これがマッチした漢字部分を抽出します。match[1] はキャプチャグループにマッチした部分、つまり漢字部分を返します。
                      const originalChiwari = normalizedName;
                      const normalizedChiwari = match[1];
                      console.log("🔴「〜地割」を正規化", "🔹前", originalChiwari, "🔹後", normalizedChiwari);
                      normalizedName = normalizedChiwari; // matchがnullでなければマッチした部分を返し、そうでなければ元の名前を返す
                      // normalizedName = match[1]; // matchがnullでなければマッチした部分を返し、そうでなければ元の名前を返す
                    }
                  }

                  // 🔸山梨県北杜市 「(...)」の2段階で正規化
                  // 「"大泉町西井出８２４０－１（美森、たかね荘、清泉寮、サンメドウズスキー場）"」
                  // =>「"大泉町西井出８２４０－１"」
                  // => 「大泉町西井出」
                  if (normalizedName.includes("８２４０－１")) {
                    const match = normalizedName.match(/^(.*?)(?=８２４０－１)/u);
                    if (match) {
                      const originalHyphen = normalizedName;
                      const normalizedHyphen = match[1];
                      console.log(
                        "🟠「大泉町西井出８２４０－１」を正規化",
                        "🔹前",
                        originalHyphen,
                        "🔹後",
                        normalizedHyphen
                      );
                      normalizedName = normalizedHyphen; // matchがnullでなければマッチした部分を返し、そうでなければ元の名前を返す
                      // normalizedName = match[1]; // matchがnullでなければマッチした部分を返し、そうでなければ元の名前を返す
                    }
                  }

                  const newTownData = {
                    town_name_ja: town_name_ja,
                    town_name_en: null,
                    town_name_kana: town_name_kana,
                    normalized_name: normalizedName,
                    country_id: 153, // 日本
                    region_id: convertedRegionId,
                    city_id: convertedCityId,
                    postal_code: postal_code,
                  };
                  transformedTownsData.push(newTownData);

                  normalizedNamesArray.push(normalizedName);
                } else {
                  // 市区町村idがnullのため無効な行として扱う
                  invalidRows.push(townData);
                }
              } else {
                // 都道府県idがnullのため無効な行として扱う
                invalidRows.push(townData);
              }
            }
          });

          // 統合した町域名のみを抽出
          //   const combinedTownNamesOnly = combinedTownsDataArrayOnly.map((town) => town.town_name_ja);
          //   const combinedTownNamesKanaOnly = combinedTownsDataArrayOnly.map((town) => town.town_name_kana);
          //   const spaceNameOnlyArray = transformedTownsData.filter(
          //     (town) =>
          //       !town.town_name_ja || !town.city_name || !town.region_name || !town.postal_code || !town.town_name_kana
          //   );

          performance.mark("Filter_End"); // 開始点
          performance.measure("Filter_Time", "Filter_Start", "Filter_End"); // 計測
          console.log("Measure Time: ", performance.getEntriesByName("Filter_Time")[0].duration);
          performance.clearMarks();
          performance.clearMeasures("Filter_Time");
          const endTime = performance.now(); // 終了時間
          console.log("Time: ", endTime - startTime, "ms");
          console.log("------------------------------------------");

          return {
            transformedTownsData,
            combinedTownsDataArrayOnly,
            unfinishedRowCount,
            invalidRows,
            normalizedNamesArray,
            // onlyKakkoArray,
            // consolidatedKakkoArray,
            // combinedTownNamesOnly,
            // combinedTownNamesKanaOnly,
          };
        };

        const {
          transformedTownsData,
          combinedTownsDataArrayOnly,
          unfinishedRowCount,
          invalidRows,
          normalizedNamesArray,
          // onlyKakkoArray,
          // consolidatedKakkoArray,
          // combinedTownNamesOnly,
          // combinedTownNamesKanaOnly
        } = transformCombinedDataByMultipleEntries(uploadedData as UploadTownsCsvType[]);

        // const normalizedNameSet = new Set(normalizedNamesArray);
        const normalizedJoinedName = normalizedNamesArray.join("");
        /*
        a-zA-Z0-9: 半角英数字
        ａ-ｚＡ-Ｚ０-９: 全角英数字
        \u3040-\u309F: ひらがな
        \u30A0-\u30FF: カタカナ
        \u30FC: 全角の長音符(カタカナの長音符)
        \u4E00-\u9FFF：CJK統合漢字（基本漢字）
        \u3400-\u4DBF：CJK統合漢字拡張A（古典・難漢字）
        \u20000-\u2A6DF：CJK統合漢字拡張B（更に古典・難漢字）
        \uF900-\uFAFF：CJK互換漢字（他のフォントや古い文字の互換用）
        \u2F800-\u2FA1F：CJK互換漢字補助（さらに互換用）
        \u002D: 半角ハイフン（-） => なし
        〜(チルダ) => なし
        */
        const regexNotJaCharacter =
          /[^a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u30FC\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\uF900-\uFAFF\u2F800-\u2FA1F]/u;
        const isIncludedNotJaCharacter = regexNotJaCharacter.test(normalizedJoinedName);

        if (isIncludedNotJaCharacter) {
          const match = normalizedJoinedName.match(
            /[^a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u30FC\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\uF900-\uFAFF\u2F800-\u2FA1F]/gu
          );

          console.log("match: ", match);
          if (match) {
            console.log("非日本語文字: ", match.join(", "));
            const containsHyphen = normalizedNamesArray.filter((name) => name.includes("－"));
            console.log("containsHyphen", containsHyphen);

            // 🔹〜地割
            const containsTilde = normalizedNamesArray.filter((name) => name.includes("～") && name.includes("地割"));
            console.log("チルダcontainsTilde", containsTilde);

            // 🔹の次に〜場合
            const containsBaai = normalizedNamesArray.filter((name) => name.includes("の次に"));
            console.log("containsBaai", containsBaai);
          } else {
            console.log("全ての文字が日本語の範囲内です。");
          }
        }

        console.log(
          "前処理完了✅ Result: ",
          transformedTownsData,
          "transformedInsertTownsData[0]",
          transformedInsertTownsData && transformedInsertTownsData[0],
          "処理前uploadedData",
          uploadedData,
          "処理適用ずみ行combinedTownsDataArrayOnly",
          combinedTownsDataArrayOnly,
          "未完結の行数unfinishedRowCount",
          unfinishedRowCount,
          "新たに統合して生成された行",
          combinedTownsDataArrayOnly.length,
          "削減された数量uploadedData.length - transformedTownsData.length",
          uploadedData.length - transformedTownsData.length,
          "invalidRows",
          invalidRows,
          "normalizedNamesArray",
          normalizedNamesArray,
          "isIncludedNotJaCharacter",
          isIncludedNotJaCharacter
          //   "normalizedNameSet",
          //   normalizedNameSet
          //   "combinedTownNamesOnly",
          //   combinedTownNamesOnly,
          //   "combinedTownNamesKanaOnly",
          //   combinedTownNamesKanaOnly
        );
        console.log("------------------------------------------");

        // パースした全ての行データに対して、町域テーブルにインサート可能な状態にデータを整形

        // 1. 国コードを追加
        // 2. 都道府県名をregion_idに変換
        // 3. 市区町村名をcity_idに変換
        // 4. town_name_jaの値から（...）の部分を除去して、正規化した値をnormalized_nameにセット
        // 5. postal_codeはそのままセット

        if (0 < invalidRows.length) {
          console.log("エラー: 都道府県コード or 市区町村コードなし 無効な行データ発生", invalidRows);
          throw new Error("エラー: 都道府県コード or 市区町村コードなし 無効な行データ発生");
        }

        setTransformedInsertTownsData(transformedTownsData);

        // 確認モーダルを開く
        setIsConfirmInsertModal(true);
      }
      // インサート済みの町域テーブルに英語名を追加
      if (insertTableType === "towns") {
        // パースした全ての行データに対して、町域テーブルにインサート可能な状態にデータを整形
      }
    } catch (error: any) {
      alert("トランスフォームエラー");
      console.error(error);
    }
    setIsLoadingTransforming(false);
  };

  // ----------------------------------- バルクインサート ----------------------------------- ここまで

  // 🔸インサート実行
  const [isLoadingInsert, setIsLoadingInsert] = useState(false);
  const [isCompleteInsert, setIsCompleteInsert] = useState(false);
  const [isErrorInsert, setIsErrorInsert] = useState(false);
  // 進捗状況 INSERT済みのチャンク数 / 総チャンク数
  const [progressInserted, setProgressInserted] = useState<number | null>(null);

  const supabase = useSupabaseClient();

  // ----------------------------------- バルクインサート実行 -----------------------------------
  const handleStartBulkInsert = async () => {
    // ステップ3に移行
    setStep(3);

    setIsConfirmInsertModal(false);
    setInsertCsvColumnNameToDBColumnMap(null);

    // ローディング開始
    setIsLoadingInsert(true);

    try {
      if (!transformedInsertTownsData) throw new Error("データなし");

      console.log("------------------------------------------");
      performance.mark("Bulk_Insert_Start"); // 開始点
      const startTime = performance.now(); // 開始時間

      // 🔸インサートの開始とともにINSERT進捗をUIで表示
      setProgressInserted(0);

      // SupabaseはデフォルトでSQLステートメント実行時間のタイムアウト値が8秒のため、
      // １つのトランザクションがタイムアウト値を超えることなく処理できるよう
      // 2500行ごとにチャンクを分割し、バッチ処理(まとめて処理)をする

      // 🔸12万行を2500行ごとのチャンクに分割する関数
      const createChunkArray = (array: Omit<Towns, "town_id" | "created_at" | "updated_at">[], chunkSize: number) => {
        const chunksArray: Omit<Towns, "town_id" | "created_at" | "updated_at">[][] = [];

        for (let i = 0; i < array.length; i += chunkSize) {
          // chunkSize が 1000行 の場合は 1000行単位のチャンクを作成して、全てのチャンクをまとめた配列を返す
          chunksArray.push(array.slice(i, i + chunkSize));
        }

        return chunksArray;
      };

      // 🔸12万行を2500行ごとのチャンクに分割
      const baseChunkSize = 2500;
      let chunkSize = baseChunkSize; // 実際のチャンクサイズ
      const totalChunks = Math.ceil(transformedInsertTownsData.length / chunkSize);
      let chunkedTownsArray = createChunkArray(transformedInsertTownsData, chunkSize);

      let requestBodyBlob: null | Blob = new Blob([JSON.stringify(chunkedTownsArray)]);
      let chunkBlob: null | Blob = new Blob([JSON.stringify(chunkedTownsArray[0])]);
      console.log("全体サイズ(12万行): ", requestBodyBlob.size);
      console.log("チャンクサイズ(2500行): ", chunkBlob.size, ", チャンク数: ", chunkedTownsArray.length);

      // 1チャンクあたりのサイズが1MBを超えている場合は2500行ではなく、1000行ずつに分割し直して、
      // チャンクサイズを小さくする 1048576バイト: 1MB
      if (1048576 < chunkBlob.size) {
        chunkSize = 2000; // 2000行に変更
        chunkedTownsArray = createChunkArray(transformedInsertTownsData, chunkSize);
        chunkBlob = new Blob([JSON.stringify(chunkedTownsArray[0])]);
        console.log("変更後のチャンクサイズ(2000行): ", chunkBlob.size, ", チャンク数: ", chunkedTownsArray.length);
      }
      if (1048576 < chunkBlob.size) {
        chunkSize = 1500; // 1500行に変更
        chunkedTownsArray = createChunkArray(transformedInsertTownsData, chunkSize);
        chunkBlob = new Blob([JSON.stringify(chunkedTownsArray[0])]);
        console.log("変更後のチャンクサイズ(1500行): ", chunkBlob.size, ", チャンク数: ", chunkedTownsArray.length);
      }
      if (1048576 < chunkBlob.size) {
        chunkSize = 1000; // 1000行に変更
        chunkedTownsArray = createChunkArray(transformedInsertTownsData, chunkSize);
        chunkBlob = new Blob([JSON.stringify(chunkedTownsArray[0])]);
        console.log("変更後のチャンクサイズ(1000行): ", chunkBlob.size, ", チャンク数: ", chunkedTownsArray.length);
      }
      const bodySizePerRequest = chunkBlob.size;
      requestBodyBlob = null;
      chunkBlob = null;

      console.log(
        `合計${transformedInsertTownsData.length}行 ${baseChunkSize}行ずつ バルクインサート実行🔥 合計チャンク数: ${totalChunks}`,
        ", 1チャンク: ",
        chunkedTownsArray[0],
        ", 1チャンクサイズ(ボディサイズ): ",
        bodySizePerRequest,
        ", 分割後chunkedTownsArray: ",
        chunkedTownsArray,
        ", 分割前transformedInsertTownsData: ",
        transformedInsertTownsData
      );

      /* 🔺バルクインサート 行数・サイズ別インサート時間
      ※(SupabaseのSQLステートメント実行時間デフォルトタイムアウト値8秒)
      
      ----------------------------------- サンプルデータ -----------------------------------
      【12万行】
        ○全体サイズ 40440241 => 38.4MB

      【12万行】
      ○5000行 リクエストボディサイズ 1.6MB  秒数: 1.6秒
      ○10000行 リクエストボディサイズ 3.2MB  秒数: 4秒
      
      【12万行】
      ○1000行/チャンク サイズ:0.32MB/チャンク * 120 合計38.4MB  合計秒数147秒
      ○2500行/チャンク サイズ:0.8MB/チャンク * 48 合計38.4MB  合計秒数65秒
      ○5000行/チャンク サイズ:1.6MB/チャンク * 24 合計38.4MB  合計秒数43秒
      ○10000行/チャンク サイズ:3.2MB/チャンク * 12 合計38.4MB  合計秒数38秒
      ----------------------------------- サンプルデータ -----------------------------------
      ----------------------------------- 町域データ townsテーブル -----------------------------------      
      【12万2512行】
        ○全体サイズ 24246012 => 23MB

      【12万行】
      ○2500行/チャンク サイズ:0.48MB/チャンク * 50 合計23MB  合計秒数75秒
      ----------------------------------- 町域データ townsテーブル -----------------------------------

      */

      // 🔸分割したチャンクごとにバルクインサート Insert済みチャンク数を基に%で進捗状況をUIに表示
      for (const iterator of chunkedTownsArray.entries()) {
        const [index, chunkArray] = iterator;
        const chunkCount = index + 1;
        const insertCount = (index + 1) * chunkArray.length;

        console.log(`リクエスト送信実行${chunkCount}回目`);
        // const { error } = await supabase.from("tests").insert(chunkArray);
        const { error } = await supabase.rpc("bulk_insert_towns", { _towns_data: chunkArray });

        if (error) {
          throw error;
          break; // エラーが発生したら処理を中断
        }

        // 進行状況を更新
        const progress = Math.round((chunkCount / totalChunks) * 100);
        setProgressInserted(progress);

        // 1秒間隔をあけて次のリクエストを行う
        await new Promise((resolve, reject) => setTimeout(resolve, 1000));

        console.log(
          `イテレーション${chunkCount}回目 INSERT成功`,
          `, 進行状況progress: ${progress}%`,
          `, insertCount: ${insertCount}個`,
          `, totalChunks: ${totalChunks}個`
        );
      }

      performance.mark("Bulk_Insert_End"); // 開始点
      performance.measure("Bulk_Insert_Time", "Bulk_Insert_Start", "Bulk_Insert_End"); // 計測
      console.log("Measure Time: ", performance.getEntriesByName("Bulk_Insert_Time")[0].duration);
      performance.clearMarks();
      performance.clearMeasures("Bulk_Insert_Time");
      const endTime = performance.now(); // 終了時間
      console.log("Time: ", endTime - startTime, "ms");
      console.log("------------------------------------------");

      // let request = new Request("/api/hello", {
      //   method: "POST",
      //   body: JSON.stringify(transformedInsertTownsData),
      // });
      // console.log("リクエスト", request);
      // console.log("サイズ", new Blob([JSON.stringify(transformedInsertTownsData)]).size);

      toast.success("一括インサート成功✅");
      setIsCompleteInsert(true);
      setInsertCsvColumnNameToDBColumnMap(null);
      setIsConfirmInsertModal(false);
    } catch (error: any) {
      alert("インサートエラーが発生しました。");
      console.error("❌インサートエラー", error);
      setIsErrorInsert(true);
    }

    setProgressInserted(null);
    setIsLoadingInsert(false);
  };
  // ----------------------------------- バルクインサート実行 ----------------------------------- ここまで

  type UploadTownsEnCsvType = {
    region_name: string;
    city_name: string;
    postal_code: string;
    town_name_ja: string;
    town_name_en: string;
  };
  type UpdateTownType = Omit<Towns, "town_id" | "created_at" | "updated_at">;
  const [transformedUpdateTownsData, setTransformedUpdateTownsData] = useState<UpdateTownType[] | null>(null);

  const [isUpdate, setIsUpdate] = useState(false);
  const [updateTableType, setUpdateTableType] = useState("update_towns");

  // ----------------------------------- バルクアップデート -----------------------------------
  const startTransformDataForUpdate = () => {
    setIsLoadingTransforming(true);

    try {
      if (updateTableType === "update_towns") {
        // ----------------------------------- 町域ローマ字アップデート -----------------------------------
        const transformCombinedDataByMultipleEntriesForUpdate = (
          uploadTownsData: UploadTownsEnCsvType[]
        ): {
          transformedTownsData: UpdateTownType[];
          combinedTownsDataArrayOnly: UploadTownsEnCsvType[];
          unfinishedRowCount: number;
          invalidRows: UploadTownsEnCsvType[];
          normalizedNamesArray: string[];
          // onlyKakkoArray: { originalKakko: string; normalizedKakko: string }[];
          // consolidatedKakkoArray: { originalKakko: string; normalizedKakko: string }[];
          //   combinedTownNamesOnly: string[];
          //   combinedTownNamesKanaOnly: string[];
        } => {
          console.log("------------------------------------------");
          performance.mark("Filter_Start"); // 開始点
          const startTime = performance.now(); // 開始時間

          // const transformedTownsData: (InsertTownType & {
          //   region_name: string;
          //   city_name: string;
          // })[] = [];
          const transformedTownsData: InsertTownType[] = [];
          const combinedTownsDataArrayOnly: UploadTownsEnCsvType[] = [];
          const invalidRows: UploadTownsEnCsvType[] = []; // 無効な行
          const normalizedNamesArray: string[] = [];
          let consolidatedDetail = "";
          let consolidatedDetailEn = "";
          let isOpen = false; // 括弧が開いているかのフラグ
          let unfinishedRowCount = 0;
          // const onlyKakkoArray: { originalKakko: string; normalizedKakko: string }[] = [];
          // const consolidatedKakkoArray: { originalKakko: string; normalizedKakko: string }[] = [];

          uploadTownsData.forEach((townData) => {
            // const { town_name_ja, town_name_en, region_name, city_name, postal_code } = townData;
            const { town_name_en, region_name, postal_code } = townData;
            const town_name_ja = townData.town_name_ja.replace(/[\s　]+/g, "");
            const city_name = townData.city_name.replace(/[\s　]+/g, "");

            if (town_name_ja.includes("（") && !town_name_ja.includes("）")) {
              unfinishedRowCount += 1;

              // 括弧が開始され、閉じられていない行
              consolidatedDetail += town_name_ja;
              consolidatedDetailEn += town_name_en;
              isOpen = true;
            } else if (isOpen && !town_name_ja.includes("）")) {
              unfinishedRowCount += 1;

              // 開始された括弧が閉じられていない間の行を連結
              consolidatedDetail += town_name_ja;
              consolidatedDetailEn += town_name_en;
            } else if (isOpen && town_name_ja.includes("）")) {
              // 🌠🌠開始された括弧が閉じられる行
              unfinishedRowCount += 1;
              consolidatedDetail += town_name_ja;
              consolidatedDetailEn += town_name_en;

              // 閉じられたタイミングでpush

              // 2. 都道府県名からidを取得
              // const convertedRegionId = convertRegionNameToId(region_name);
              const convertedRegionId = regionsNameToIdMapJp.get(region_name) ?? null;
              if (convertedRegionId !== null) {
                // 取得した都道府県から対応する市区町村Mapオブジェクトを取り出して市区町村名からidを取得
                const cityNameToIdMap = regionNameToIdMapCitiesJp[region_name as RegionNameJpType];
                // 3. 市区町村idを取得
                // const convertedCityId = convertCityNameToId(city_name, cityNameToIdMap);
                const cityNameWithSpace = city_name.replace(/[\s　]+/g, "");
                const convertedCityId = cityNameToIdMap.get(cityNameWithSpace) ?? null;
                if (convertedCityId !== null) {
                  // 4. town_name_jaの値から（...）の部分を除去して、正規化した値をnormalized_nameにセット
                  // 「芝浦（１丁目）」 => 「芝浦」 「芝浦（２～４丁目）」 => 「芝浦」
                  //   const normalizedName = consolidatedDetail.split('(')[0];
                  // 正規表現を使用して、最初の括弧までのテキストを抽出
                  const match = consolidatedDetail.match(/^[^(^（]+/);
                  // if (match) {
                  //   const originalKakko = consolidatedDetail;
                  //   const normalizedKakko = match[0];
                  //   consolidatedKakkoArray.push({ normalizedKakko, originalKakko });
                  // }
                  let normalizedName = match ? match[0].trim() : consolidatedDetail.trim();

                  //
                  if (normalizedName.includes("の次に")) {
                    normalizedName = normalizedName.split("の次に")[0];
                  }

                  const newTownData = {
                    town_name_ja: consolidatedDetail,
                    town_name_en: consolidatedDetailEn,
                    country_id: 153, // 国コードを追加
                    region_id: convertedRegionId, // 都道府県コード
                    city_id: convertedCityId, // 市区町村コード
                    town_name_kana: null,
                    normalized_name: normalizedName,
                    postal_code: postal_code, // 郵便番号はそのまま格納
                    // region_name: region_name,
                    // city_name: city_name,
                  } as InsertTownType;
                  transformedTownsData.push(newTownData);

                  const combinedTownData = {
                    ...townData,
                    town_name_ja: consolidatedDetail,
                    town_name_en: consolidatedDetailEn,
                  };
                  combinedTownsDataArrayOnly.push(combinedTownData);

                  normalizedNamesArray.push(normalizedName);
                } else {
                  // 市区町村idがnullのため無効な行として扱う
                  invalidRows.push(townData);
                }
              } else {
                // 都道府県idがnullのため無効な行として扱う
                invalidRows.push(townData);
              }
              // リセット
              consolidatedDetail = "";
              consolidatedDetailEn = "";
              isOpen = false;
            }
            // 🔸半角括弧ルート
            else if (town_name_ja.includes("(") && !town_name_ja.includes(")")) {
              unfinishedRowCount += 1;

              // 括弧が開始され、閉じられていない行
              consolidatedDetail += town_name_ja;
              consolidatedDetailEn += town_name_en;
              isOpen = true;
            } else if (isOpen && !town_name_ja.includes(")")) {
              unfinishedRowCount += 1;

              // 開始された括弧が閉じられていない間の行を連結
              consolidatedDetail += town_name_ja;
              consolidatedDetailEn += town_name_en;
            } else if (isOpen && town_name_ja.includes(")")) {
              // 🌠🌠開始された括弧が閉じられる行
              unfinishedRowCount += 1;
              consolidatedDetail += town_name_ja;
              consolidatedDetailEn += town_name_en;

              // 閉じられたタイミングでpush

              // 2. 都道府県名からidを取得
              // const convertedRegionId = convertRegionNameToId(region_name);
              const convertedRegionId = regionsNameToIdMapJp.get(region_name) ?? null;
              if (convertedRegionId !== null) {
                // 取得した都道府県から対応する市区町村Mapオブジェクトを取り出して市区町村名からidを取得
                const cityNameToIdMap = regionNameToIdMapCitiesJp[region_name as RegionNameJpType];
                // 3. 市区町村idを取得
                // const convertedCityId = convertCityNameToId(city_name, cityNameToIdMap);
                const cityNameWithSpace = city_name.replace(/[\s　]+/g, "");
                const convertedCityId = cityNameToIdMap.get(cityNameWithSpace) ?? null;
                if (convertedCityId !== null) {
                  // 4. town_name_jaの値から(...)の部分を除去して、正規化した値をnormalized_nameにセット
                  // 「芝浦(１丁目)」 => 「芝浦」 「芝浦(２～４丁目)」 => 「芝浦」
                  //   const normalizedName = consolidatedDetail.split('(')[0];
                  // 正規表現を使用して、最初の括弧までのテキストを抽出
                  const match = consolidatedDetail.match(/^[^(^(]+/);
                  // if (match) {
                  //   const originalKakko = consolidatedDetail;
                  //   const normalizedKakko = match[0];
                  //   consolidatedKakkoArray.push({ normalizedKakko, originalKakko });
                  // }
                  let normalizedName = match ? match[0].trim() : consolidatedDetail.trim();

                  //
                  if (normalizedName.includes("の次に")) {
                    normalizedName = normalizedName.split("の次に")[0];
                  }

                  // 🔸山梨県北杜市 「(...)」の2段階で正規化
                  // 「"大泉町西井出　８２４０－１（美森、"」
                  // =>「"大泉町西井出８２４０－１"」
                  // => 「大泉町西井出」
                  if (normalizedName.includes("８２４０－１")) {
                    const match = normalizedName.match(/^(.*?)(?=８２４０－１)/u);
                    if (match) {
                      const originalHyphen = normalizedName;
                      const normalizedHyphen = match[1];
                      console.log(
                        "🟠「大泉町西井出８２４０－１」を正規化",
                        "🔹前",
                        originalHyphen,
                        "🔹後",
                        normalizedHyphen
                      );
                      normalizedName = normalizedHyphen; // matchがnullでなければマッチした部分を返し、そうでなければ元の名前を返す
                      // normalizedName = match[1]; // matchがnullでなければマッチした部分を返し、そうでなければ元の名前を返す
                    }
                  }

                  const newTownData = {
                    town_name_ja: consolidatedDetail,
                    town_name_en: consolidatedDetailEn,
                    country_id: 153, // 国コードを追加
                    region_id: convertedRegionId, // 都道府県コード
                    city_id: convertedCityId, // 市区町村コード
                    town_name_kana: null,
                    normalized_name: normalizedName,
                    postal_code: postal_code, // 郵便番号はそのまま格納
                    // region_name: region_name,
                    // city_name: city_name,
                  } as InsertTownType;
                  transformedTownsData.push(newTownData);

                  const combinedTownData = {
                    ...townData,
                    town_name_ja: consolidatedDetail,
                    town_name_en: consolidatedDetailEn,
                  };
                  combinedTownsDataArrayOnly.push(combinedTownData);

                  normalizedNamesArray.push(normalizedName);
                } else {
                  // 市区町村idがnullのため無効な行として扱う
                  invalidRows.push(townData);
                }
              } else {
                // 都道府県idがnullのため無効な行として扱う
                invalidRows.push(townData);
              }
              // リセット
              consolidatedDetail = "";
              consolidatedDetailEn = "";
              isOpen = false;
            }
            // 🔸括弧なし 全角半角両方なし
            else if (!isOpen) {
              // 🌠🌠単独で完結している町域名
              //   transformedTownsData.push(townData);

              // 2. 都道府県名からidを取得
              // const convertedRegionId = convertRegionNameToId(region_name);
              const convertedRegionId = regionsNameToIdMapJp.get(region_name) ?? null;
              if (convertedRegionId !== null) {
                // 取得した都道府県から対応する市区町村Mapオブジェクトを取り出して市区町村名からidを取得
                const cityNameToIdMap = regionNameToIdMapCitiesJp[region_name as RegionNameJpType];
                // 3. 市区町村idを取得
                // const convertedCityId = convertCityNameToId(city_name, cityNameToIdMap);
                const cityNameWithSpace = city_name.replace(/[\s　]+/g, "");
                const convertedCityId = cityNameToIdMap.get(cityNameWithSpace) ?? null;
                if (convertedCityId !== null) {
                  // 🔹normalized_name関連
                  // 🔸4. town_name_jaの値から（...）の部分を除去して町域名を正規化
                  // 「芝浦（１丁目）」 => 「芝浦」 「芝浦（２～４丁目）」 => 「芝浦」
                  //   const normalizedName = consolidatedDetail.split('(')[0];
                  // 正規表現を使用して、最初の括弧までのテキストを抽出
                  // /^[^(^（]+/: ここではキャプチャグループがないため、match[0] が全体のマッチを指します。つまり、括弧が現れる前のすべての文字にマッチし、その全体が match[0] に格納されます。

                  const match = townData.town_name_ja.match(/^[^(^（]+/);
                  // if (match && !match[0].includes("（") && townData.town_name_ja.includes("（")) {
                  //   const originalKakko = townData.town_name_ja;
                  //   const normalizedKakko = match[0];
                  //   onlyKakkoArray.push({ normalizedKakko, originalKakko });
                  // }
                  let normalizedName = match ? match[0].trim() : townData.town_name_ja.trim();

                  // // 🔸「の次に〜番地がくる場合」の前に町域名を正規化
                  // // 「"小菅村の次に１～６６３番地がくる場合"」 => 「小菅村」
                  if (normalizedName.includes("の次に")) {
                    const originalTsugini = normalizedName;
                    const normalizedTsugini = originalTsugini.split("の次に")[0];
                    console.log("🔵「の次に」を正規化", "🔹前", originalTsugini, "🔹後", normalizedTsugini);
                    normalizedName = normalizedTsugini;
                  }

                  // // 🔸地割が付いたパターンを正規化
                  // 1. 「町域名 + 第〜地割」のパターン:
                  //        「"種市第１地割～第３地割"」 => 「種市」
                  //        「"種市第２２地割～第２３地割"」 => 「種市」
                  // 2. 「町域名 + 〜地割」のパターン:
                  //        「"湯田１９地割～湯田２１地割"」 => 「湯田」
                  //        「"左草１地割～左草６地割"」 => 「左草」
                  //        「"小繋沢５４地割～小繋沢５６地割"」 => 「小繋沢」
                  if (normalizedName.includes("～") && normalizedName.includes("地割")) {
                    // 「/^.../」で文字列の先頭から、
                    // (.*?)非貪欲マッチングで最小限の文字列にマッチ
                    // (?=\s*(?:第)?[\d０-９]+地割)で「第〜地割」か「〜地割」が直後に来る文字列にマッチ
                    // (?=\s*(?:第)?\d+地割)で先読みアサーションで、キャプチャはしないが、マッチに指定
                    // [\d０-９]+で半角全角数字1つ以上の繰り返しにマッチ

                    const match = normalizedName.match(/^(.*?)(?=\s*(?:第)?[\d０-９]+地割)/u);
                    if (match) {
                      // キャプチャグループ (\p{Script=Han}+) があり、これがマッチした漢字部分を抽出します。match[1] はキャプチャグループにマッチした部分、つまり漢字部分を返します。
                      const originalChiwari = normalizedName;
                      const normalizedChiwari = match[1];
                      console.log("🔴「〜地割」を正規化", "🔹前", originalChiwari, "🔹後", normalizedChiwari);
                      normalizedName = normalizedChiwari; // matchがnullでなければマッチした部分を返し、そうでなければ元の名前を返す
                      // normalizedName = match[1]; // matchがnullでなければマッチした部分を返し、そうでなければ元の名前を返す
                    }
                  }

                  // 🔸山梨県北杜市 「(...)」の2段階で正規化
                  // 「"大泉町西井出８２４０－１（美森、たかね荘、清泉寮、サンメドウズスキー場）"」
                  // =>「"大泉町西井出８２４０－１"」 "大泉町西井出８２４０－１" "大泉町西井出８２４０－１"
                  // => 「大泉町西井出」
                  if (normalizedName.includes("８２４０－１")) {
                    const match = normalizedName.match(/^(.*?)(?=８２４０－１)/u);
                    if (match) {
                      const originalHyphen = normalizedName;
                      const normalizedHyphen = match[1];
                      console.log(
                        "🟠「大泉町西井出８２４０－１」を正規化",
                        "🔹前",
                        originalHyphen,
                        "🔹後",
                        normalizedHyphen
                      );
                      normalizedName = normalizedHyphen; // matchがnullでなければマッチした部分を返し、そうでなければ元の名前を返す
                      // normalizedName = match[1]; // matchがnullでなければマッチした部分を返し、そうでなければ元の名前を返す
                    }
                  }

                  const newTownData = {
                    town_name_ja: town_name_ja,
                    town_name_kana: null,
                    town_name_en: town_name_en,
                    normalized_name: normalizedName,
                    country_id: 153, // 日本
                    region_id: convertedRegionId,
                    city_id: convertedCityId,
                    postal_code: postal_code,
                  };
                  transformedTownsData.push(newTownData);

                  normalizedNamesArray.push(normalizedName);
                } else {
                  // 市区町村idがnullのため無効な行として扱う
                  invalidRows.push(townData);
                  console.log("❌無効な市区町村名です。", townData);
                  throw new Error("無効な市区町村名です。");
                }
              } else {
                // 都道府県idがnullのため無効な行として扱う
                invalidRows.push(townData);
                console.log("❌無効な都道府県名です。", townData);
                throw new Error("無効な都道府県名です。");
              }
            }
          });

          performance.mark("Filter_End"); // 開始点
          performance.measure("Filter_Time", "Filter_Start", "Filter_End"); // 計測
          console.log("Measure Time: ", performance.getEntriesByName("Filter_Time")[0].duration);
          performance.clearMarks();
          performance.clearMeasures("Filter_Time");
          const endTime = performance.now(); // 終了時間
          console.log("Time: ", endTime - startTime, "ms");
          console.log("------------------------------------------");

          return {
            transformedTownsData,
            combinedTownsDataArrayOnly,
            unfinishedRowCount,
            invalidRows,
            normalizedNamesArray,
            // onlyKakkoArray,
            // consolidatedKakkoArray,
            // combinedTownNamesOnly,
            // combinedTownNamesKanaOnly,
          };
        };
        // ----------------------------------- 町域ローマ字アップデート -----------------------------------

        const {
          transformedTownsData,
          combinedTownsDataArrayOnly,
          unfinishedRowCount,
          invalidRows,
          normalizedNamesArray,
          // onlyKakkoArray,
          // consolidatedKakkoArray,
          // combinedTownNamesOnly,
          // combinedTownNamesKanaOnly
        } = transformCombinedDataByMultipleEntriesForUpdate(uploadedData as UploadTownsEnCsvType[]);

        // const normalizedNameSet = new Set(normalizedNamesArray);
        const normalizedJoinedName = normalizedNamesArray.join("");
        /*
        a-zA-Z0-9: 半角英数字
        ａ-ｚＡ-Ｚ０-９: 全角英数字
        \u3040-\u309F: ひらがな
        \u30A0-\u30FF: カタカナ
        \u30FC: 全角の長音符(カタカナの長音符)
        \u4E00-\u9FFF：CJK統合漢字（基本漢字）
        \u3400-\u4DBF：CJK統合漢字拡張A（古典・難漢字）
        \u20000-\u2A6DF：CJK統合漢字拡張B（更に古典・難漢字）
        \uF900-\uFAFF：CJK互換漢字（他のフォントや古い文字の互換用）
        \u2F800-\u2FA1F：CJK互換漢字補助（さらに互換用）
        \u002D: 半角ハイフン（-） => なし
        〜(チルダ) => なし
        */
        const regexNotJaCharacter =
          /[^a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u30FC\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\uF900-\uFAFF\u2F800-\u2FA1F]/u;
        const isIncludedNotJaCharacter = regexNotJaCharacter.test(normalizedJoinedName);

        if (isIncludedNotJaCharacter) {
          const match = normalizedJoinedName.match(
            /[^a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u30FC\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\uF900-\uFAFF\u2F800-\u2FA1F]/gu
          );

          console.log("match: ", match);
          if (match) {
            console.log("非日本語文字: ", match.join(", "));
            // const tildeArray = transformedTownsData.filter((obj) => obj.town_name_ja?.includes("～"));
            // const kakkoArray = transformedTownsData.filter((obj) => obj.town_name_ja?.includes("）"));
            // const hyphenArray = transformedTownsData.filter((obj) => obj.town_name_ja?.includes("－"));
            const taneArray = transformedTownsData.filter((obj) => obj.town_name_ja?.includes("種市"));
            console.log("taneArray", taneArray);
            // console.log("tildeArray", tildeArray, "kakkoArray", kakkoArray, "hyphenArray", hyphenArray);

            const containsHyphen = normalizedNamesArray.filter((name) => name.includes("－"));
            console.log("containsHyphen", containsHyphen);

            // 🔹〜地割
            const containsTilde = normalizedNamesArray.filter((name) => name.includes("～") && name.includes("地割"));
            console.log("チルダcontainsTilde", containsTilde);

            // 🔹の次に〜場合
            const containsBaai = normalizedNamesArray.filter((name) => name.includes("の次に"));
            console.log("containsBaai", containsBaai);
          } else {
            console.log("全ての文字が日本語の範囲内です。");
          }
        }

        console.log(
          "前処理完了✅ Result: ",
          transformedTownsData,
          "transformedInsertTownsData[0]",
          transformedInsertTownsData && transformedInsertTownsData[0],
          "処理前uploadedData",
          uploadedData,
          "処理適用ずみ行combinedTownsDataArrayOnly",
          combinedTownsDataArrayOnly,
          "未完結の行数unfinishedRowCount",
          unfinishedRowCount,
          "新たに統合して生成された行",
          combinedTownsDataArrayOnly.length,
          "削減された数量uploadedData.length - transformedTownsData.length",
          uploadedData.length - transformedTownsData.length,
          "invalidRows",
          invalidRows,
          "normalizedNamesArray",
          normalizedNamesArray,
          "isIncludedNotJaCharacter",
          isIncludedNotJaCharacter
          //   "normalizedNameSet",
          //   normalizedNameSet
          //   "combinedTownNamesOnly",
          //   combinedTownNamesOnly,
          //   "combinedTownNamesKanaOnly",
          //   combinedTownNamesKanaOnly
        );
        console.log("------------------------------------------");

        // パースした全ての行データに対して、町域テーブルにインサート可能な状態にデータを整形

        // 1. 国コードを追加
        // 2. 都道府県名をregion_idに変換
        // 3. 市区町村名をcity_idに変換
        // 4. town_name_jaの値から（...）の部分を除去して、正規化した値をnormalized_nameにセット
        // 5. postal_codeはそのままセット

        if (0 < invalidRows.length) {
          console.log("エラー: 都道府県コード or 市区町村コードなし 無効な行データ発生", invalidRows);
          throw new Error("エラー: 都道府県コード or 市区町村コードなし 無効な行データ発生");
        }

        setTransformedInsertTownsData(transformedTownsData);

        // 確認モーダルを開く
        setIsConfirmInsertModal(true);
      }
      // インサート済みの町域テーブルに英語名を追加
      if (insertTableType === "towns") {
        // パースした全ての行データに対して、町域テーブルにインサート可能な状態にデータを整形
      }
    } catch (error: any) {
      alert("トランスフォームエラー");
      console.error(error);
    }
    setIsLoadingTransforming(false);
  };
  // ----------------------------------- バルクアップデート ----------------------------------- ここまで

  // ----------------------------------- バルクアップデート実行 -----------------------------------
  const handleStartBulkUpdate = async () => {
    // ステップ3に移行
    setStep(3);

    setIsConfirmInsertModal(false);
    setInsertCsvColumnNameToDBColumnMap(null);

    // ローディング開始
    setIsLoadingInsert(true);

    try {
      if (!transformedInsertTownsData) throw new Error("データなし");

      console.log("------------------------------------------");
      performance.mark("Bulk_Update_Start"); // 開始点
      const startTime = performance.now(); // 開始時間

      // 🔸アップデートの開始とともにINSERT進捗をUIで表示
      setProgressInserted(0);

      // SupabaseはデフォルトでSQLステートメント実行時間のタイムアウト値が8秒のため、
      // １つのトランザクションがタイムアウト値を超えることなく処理できるよう
      // 2500行ごとにチャンクを分割し、バッチ処理(まとめて処理)をする

      // 🔸12万行を2500行ごとのチャンクに分割する関数
      const createChunkArray = (array: Omit<Towns, "town_id" | "created_at" | "updated_at">[], chunkSize: number) => {
        const chunksArray: Omit<Towns, "town_id" | "created_at" | "updated_at">[][] = [];

        for (let i = 0; i < array.length; i += chunkSize) {
          // chunkSize が 1000行 の場合は 1000行単位のチャンクを作成して、全てのチャンクをまとめた配列を返す
          chunksArray.push(array.slice(i, i + chunkSize));
        }

        return chunksArray;
      };

      // 🔸12万行を2500行ごとのチャンクに分割
      const baseChunkSize = 2500;
      let chunkSize = baseChunkSize; // 実際のチャンクサイズ
      const totalChunks = Math.ceil(transformedInsertTownsData.length / chunkSize);
      let chunkedTownsArray = createChunkArray(transformedInsertTownsData, chunkSize);

      let requestBodyBlob: null | Blob = new Blob([JSON.stringify(chunkedTownsArray)]);
      let chunkBlob: null | Blob = new Blob([JSON.stringify(chunkedTownsArray[0])]);
      console.log("全体サイズ(12万行): ", requestBodyBlob.size);
      console.log("チャンクサイズ(2500行): ", chunkBlob.size, ", チャンク数: ", chunkedTownsArray.length);

      // 1チャンクあたりのサイズが1MBを超えている場合は2500行ではなく、1000行ずつに分割し直して、
      // チャンクサイズを小さくする 1048576バイト: 1MB
      if (1048576 < chunkBlob.size) {
        chunkSize = 2000; // 2000行に変更
        chunkedTownsArray = createChunkArray(transformedInsertTownsData, chunkSize);
        chunkBlob = new Blob([JSON.stringify(chunkedTownsArray[0])]);
        console.log("変更後のチャンクサイズ(2000行): ", chunkBlob.size, ", チャンク数: ", chunkedTownsArray.length);
      }
      if (1048576 < chunkBlob.size) {
        chunkSize = 1500; // 1500行に変更
        chunkedTownsArray = createChunkArray(transformedInsertTownsData, chunkSize);
        chunkBlob = new Blob([JSON.stringify(chunkedTownsArray[0])]);
        console.log("変更後のチャンクサイズ(1500行): ", chunkBlob.size, ", チャンク数: ", chunkedTownsArray.length);
      }
      if (1048576 < chunkBlob.size) {
        chunkSize = 1000; // 1000行に変更
        chunkedTownsArray = createChunkArray(transformedInsertTownsData, chunkSize);
        chunkBlob = new Blob([JSON.stringify(chunkedTownsArray[0])]);
        console.log("変更後のチャンクサイズ(1000行): ", chunkBlob.size, ", チャンク数: ", chunkedTownsArray.length);
      }
      const bodySizePerRequest = chunkBlob.size;
      requestBodyBlob = null;
      chunkBlob = null;

      console.log(
        `合計${transformedInsertTownsData.length}行 ${baseChunkSize}行ずつ バルクアップデート実行🔥 合計チャンク数: ${totalChunks}`,
        ", 1チャンク: ",
        chunkedTownsArray[0],
        ", 1チャンクサイズ(ボディサイズ): ",
        bodySizePerRequest,
        ", 分割後chunkedTownsArray: ",
        chunkedTownsArray,
        ", 分割前transformedInsertTownsData: ",
        transformedInsertTownsData
      );

      /* 🔺バルクアップデート 行数・サイズ別アップデート時間
      ※(SupabaseのSQLステートメント実行時間デフォルトタイムアウト値8秒)
      
      ----------------------------------- サンプルデータ -----------------------------------
      【12万行】
        ○全体サイズ 40440241 => 38.4MB

      【12万行】
      ○5000行 リクエストボディサイズ 1.6MB  秒数: 1.6秒
      ○10000行 リクエストボディサイズ 3.2MB  秒数: 4秒
      
      【12万行】
      ○1000行/チャンク サイズ:0.32MB/チャンク * 120 合計38.4MB  合計秒数147秒
      ○2500行/チャンク サイズ:0.8MB/チャンク * 48 合計38.4MB  合計秒数65秒
      ○5000行/チャンク サイズ:1.6MB/チャンク * 24 合計38.4MB  合計秒数43秒
      ○10000行/チャンク サイズ:3.2MB/チャンク * 12 合計38.4MB  合計秒数38秒
      ----------------------------------- サンプルデータ -----------------------------------
      ----------------------------------- 町域データ townsテーブル -----------------------------------      
      【12万2512行】
        ○全体サイズ 24246012 => 23MB

      【12万行】
      ○2500行/チャンク サイズ:0.48MB/チャンク * 50 合計23MB  合計秒数75秒
      ----------------------------------- 町域データ townsテーブル -----------------------------------

      */

      // 🔸分割したチャンクごとにバルクアップデート Insert済みチャンク数を基に%で進捗状況をUIに表示
      // for (const iterator of chunkedTownsArray.entries()) {
      //   const [index, chunkArray] = iterator;
      //   const chunkCount = index + 1;
      //   const insertCount = (index + 1) * chunkArray.length;

      //   console.log(`リクエスト送信実行${chunkCount}回目`);
      //   // const { error } = await supabase.from("tests").insert(chunkArray);
      //   const { error } = await supabase.rpc("bulk_update_towns", { _towns_data: chunkArray });

      //   if (error) {
      //     throw error;
      //     break; // エラーが発生したら処理を中断
      //   }

      //   // 進行状況を更新
      //   const progress = Math.round((chunkCount / totalChunks) * 100);
      //   setProgressInserted(progress);

      //   // 1秒間隔をあけて次のリクエストを行う
      //   await new Promise((resolve, reject) => setTimeout(resolve, 1000));

      //   console.log(
      //     `イテレーション${chunkCount}回目 INSERT成功`,
      //     `, 進行状況progress: ${progress}%`,
      //     `, insertCount: ${insertCount}個`,
      //     `, totalChunks: ${totalChunks}個`
      //   );
      // }

      console.log("一括アップデート成功✅");
      performance.mark("Bulk_Update_End"); // 開始点
      performance.measure("Bulk_Update_Time", "Bulk_Update_Start", "Bulk_Update_End"); // 計測
      console.log("Measure Time: ", performance.getEntriesByName("Bulk_Update_Time")[0].duration);
      performance.clearMarks();
      performance.clearMeasures("Bulk_Update_Time");
      const endTime = performance.now(); // 終了時間
      console.log("Time: ", endTime - startTime, "ms");
      console.log("------------------------------------------");

      // let request = new Request("/api/hello", {
      //   method: "POST",
      //   body: JSON.stringify(transformedInsertTownsData),
      // });
      // console.log("リクエスト", request);
      // console.log("サイズ", new Blob([JSON.stringify(transformedInsertTownsData)]).size);

      toast.success("一括アップデート成功✅");
      setIsCompleteInsert(true);
      setInsertCsvColumnNameToDBColumnMap(null);
      setIsConfirmInsertModal(false);
    } catch (error: any) {
      alert("アップデートエラーが発生しました。");
      console.error("❌アップデートエラー", error);
      setIsErrorInsert(true);
    }

    setProgressInserted(null);
    setIsLoadingInsert(false);
  };
  // ----------------------------------- バルクアップデート実行 ----------------------------------- ここまで

  // INSERTで必須カラムの選択済み個数
  // not nullableのカラム: 「会社名、部署名、住所」の3個 => 部署名は選択していなかった場合は「.(ピリオド)」をプレイスホルダーでセットしてINSERTする（代表番号も経済産業省のリストが載せていないデータも多いため入れない。業種は一旦入れない）
  // const [selectedRequiredColumnCount, setSelectedRequiredColumnCount] = useState(0);
  const requiredImportColumnOptionsSet = useMemo(() => {
    if (!isUpdate) {
      if (insertTableType === "towns")
        return new Set(["region_id", "city_id", "postal_code", "town_name_ja", "town_name_kana"]);
      return new Set([]);
    } else {
      if (updateTableType === "update_towns")
        return new Set(["region_id", "city_id", "postal_code", "town_name_ja", "town_name_en"]);
      return new Set([]);
    }
  }, [insertTableType, updateTableType, isUpdate]);
  const selectedRequiredColumnCount = useMemo(() => {
    return (
      Array.from(alreadySelectColumnsSetObj).filter((option) => requiredImportColumnOptionsSet.has(option)).length ?? 0
    );
  }, [alreadySelectColumnsSetObj]);
  // ------------------------------ 🌠紐付け確定🌠 ここまで ------------------------------
  // ------------------------------ 🌟step2🌟 ここまで ------------------------------

  // ================== 🌟ツールチップ ==================
  const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display?: "top" | "right" | "bottom" | "left" | "";
    content: string;
    content2?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({ e, display = "top", content, content2, marginTop, itemsPosition }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const content2DataSet = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    setHoveredItemPosWrap({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: content ?? ((e.target as HTMLDivElement).dataset.text as string),
      content2: content2 ?? content2DataSet,
      content3: content3,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    if (hoveredItemPosWrap) setHoveredItemPosWrap(null);
  };
  // ================== ✅ツールチップ ==================

  const getProgressLineStyle = (num: number) => {
    return step === num
      ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
      : `border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)] text-[var(--color-text-sub)]`;
  };

  const getNextBtnStyle = (step: number) => {
    const activeStyle = `brand_btn_active`;
    const inactiveStyle = `bg-[var(--color-bg-brand-f-disabled)] cursor-not-allowed text-[var(--color-text-disabled-on-brand)]`;
    if (step === 2) {
      // 必須カラム選択数が4に到達したらアクティブにする 会社名と住所の2つを含んでいたらアクティブに変更
      if (requiredImportColumnOptionsSet.size <= selectedRequiredColumnCount) {
        return activeStyle;
      } else {
        return inactiveStyle;
      }
    }
    return activeStyle;
  };

  // アップロードした行数
  const formattedUploadedRowCount = uploadedData.length.toLocaleString();

  // モーダルサイズ
  const modalHeight = modalContainerRef.current?.offsetHeight ?? null;

  // テーブルWidth
  const tableWidth = 1100;
  // テーブル上タイトルHeight
  const tableTitleAreaHeight = 50;
  // カラムヘッダーrow-height
  const tableColumnHeaderRowHeight = 96;
  // row-height
  const tableRowHeight = 60;
  // テーブル各列の最大width 180px - 12px * 2(padding-x)
  // const tableColumnWidth = 180;
  const tableColumnWidth = 185;
  // const tableColumnWidth = 190;
  // const tableColumnWidth = 200;
  const tableColumnContentBoxWidth = tableColumnWidth - 10; // 少し小さめにして余白を持たせる
  // const tableColumnContentBoxWidth = tableColumnWidth - 20; // 少し小さめにして余白を持たせる
  // 列ヘッダーwidth
  const tableRowHeaderWidth = 130;

  const modalPosition = useMemo(() => {
    if (!modalContainerRef.current) return null;
    const { x, y } = modalContainerRef.current.getBoundingClientRect();
    return { x, y };
  }, [modalContainerRef.current]);

  console.log(
    "ProviderImportModalレンダリング",
    // modalHeight,
    "uploadedDisplayRowList",
    uploadedDisplayRowList,
    // "uploadedColumnFields",
    // uploadedColumnFields,
    // "selectedColumnFieldsArray",
    // selectedColumnFieldsArray,
    // "alreadySelectColumnsSetObj",
    // alreadySelectColumnsSetObj,
    "regionsNameToIdMapJp",
    regionsNameToIdMapJp,
    "regionNameToIdMapCitiesJp",
    regionNameToIdMapCitiesJp,
    "tableColumnContentBoxWidth",
    tableColumnContentBoxWidth,
    "transformedInsertTownsData[0]",
    transformedInsertTownsData && transformedInsertTownsData[0]
    // "remainingOptionsColumnFieldsArray",
    // remainingOptionsColumnFieldsArray
  );

  const [isSmallWindow, setIsSmallWindow] = useState(false);
  const initialPosition = { top: `50%`, right: `unset`, left: "50%", transform: `translate(-50%, -50%)` };
  const smallInitialPosition = { top: `calc(100% - 100px - 70px)`, right: `30px`, left: "unset", transform: `unset` };

  const [isHide, setIsHide] = useState(false);
  const smallHidePosition = { top: `calc(100% - 100px - 70px)`, right: `-240px`, left: "unset", transform: `unset` };

  const handleSwitchSize = (isSmall: boolean) => {
    setIsSmallWindow(isSmall);
    if (modalContainerRef.current) {
      if (isSmall) {
        modalContainerRef.current.style.transition = `width 0.3s ease, height 0.3s ease, max-width 0.3s ease, max-height 0.3s ease, top 0.3s ease, left 0.3s ease, right 0.3s ease`;
        modalContainerRef.current.style.top = smallInitialPosition.top; // `80vh`;
        modalContainerRef.current.style.left = smallInitialPosition.left; // `unset`;
        modalContainerRef.current.style.right = smallInitialPosition.right; // `30px`;
        modalContainerRef.current.style.transform = smallInitialPosition.transform; // `unset`;
        setTimeout(() => {
          if (modalContainerRef.current)
            modalContainerRef.current.style.transition = `width 0.3s ease, height 0.3s ease, max-width 0.3s ease, max-height 0.3s ease`;
        }, 400);
      }
      // 最小化 => 元のサイズに戻す
      else {
        /**width: 80vw;
  height: 90vh;
  max-width: 1150px;
  max-height: 730px; */
        modalContainerRef.current.style.transition = `width 0.3s ease, height 0.3s ease, max-width 0.3s ease, max-height 0.3s ease, top 0.3s ease, left 0.3s ease, right 0.3s ease, transform 0.3s ease`;
        modalContainerRef.current.classList.remove(styles.small);
        modalContainerRef.current.style.top = initialPosition.top; // `80vh`;
        modalContainerRef.current.style.left = initialPosition.left;
        modalContainerRef.current.style.right = initialPosition.right; // `30px`;
        modalContainerRef.current.style.transform = initialPosition.transform;
        setTimeout(() => {
          if (modalContainerRef.current)
            modalContainerRef.current.style.transition = `width 0.3s ease, height 0.3s ease, max-width 0.3s ease, max-height 0.3s ease`;

          if (isHide) setIsHide(false);
        }, 400);
      }
    }
  };

  return (
    <>
      {/* モーダルオーバーレイ */}
      {<div className={`modal_overlay`} onClick={handleCancel} />}
      {isLoadingTransforming && (
        <>
          <div className={`flex-center fixed left-[-100vw] top-[-100vh] z-[10000] h-[200vh] w-[200vw]  bg-[#00000060]`}>
            {/* <SpinnerX /> */}
          </div>
          <div className={`flex-center fixed left-0 top-0 z-[12000] h-[100vh] w-[100vw]`}>
            <SpinnerX />
          </div>
        </>
      )}

      {/* モーダルコンテナ */}
      <div
        ref={modalContainerRef}
        className={`${styles.modal_container} fade03 text-[var(--color-text-title)] ${
          isSmallWindow ? `${styles.small}` : ``
        }`}
      >
        <button
          type="button"
          className={`flex-center absolute z-[100]  h-[32px] w-[32px] cursor-pointer rounded-full hover:text-[#999] ${
            isSmallWindow ? `right-[15px] top-[10px] text-[18px]` : `right-[24px] top-[22px] text-[24px]`
          }`}
          onClick={() => {
            if (!isSmallWindow) handleCancel();
            if (isSmallWindow) {
              handleSwitchSize(false);
            }
          }}
        >
          {!isSmallWindow && <MdClose className="pointer-events-none" />}
          {isSmallWindow && <BiFullscreen className="pointer-events-none" />}
        </button>
        {!isSmallWindow && (
          <>
            {/* ----------------------- 保存・タイトル・キャンセルエリア ----------------------- */}
            <div
              className={`${styles.title_area} fade08_forward flex h-auto w-full flex-col rounded-t-[9px] p-[24px] pb-[12px]`}
            >
              <div className={`mb-[15px] flex h-auto w-full min-w-max items-center`}>
                <div className={`mr-[20px] min-h-[36px] min-w-max text-[23px] font-bold`}>
                  <span>CSVインポート</span>
                </div>
                <div className="relative flex h-[25px] w-full items-center">
                  {/* プログレスライン */}
                  <div className="absolute left-0 top-[50%] z-[-1] h-[1px] w-[105px] bg-[var(--color-progress-bg)]"></div>
                  {/* ○ */}
                  <div
                    className={`flex-center mr-[15px] h-[25px] w-[25px] rounded-full border border-solid ${getProgressLineStyle(
                      1
                    )}`}
                  >
                    <span className={`text-[12px] font-bold`}>1</span>
                  </div>
                  {/* ○ */}
                  <div
                    className={`flex-center text-[var(--color-text-sub)]} mr-[15px] h-[25px] w-[25px] rounded-full border border-solid ${getProgressLineStyle(
                      2
                    )}`}
                  >
                    <span className={`text-[12px] font-bold`}>2</span>
                  </div>
                  {/* ○ */}
                  <div
                    className={`flex-center text-[var(--color-text-sub)]} mr-[15px] h-[25px] w-[25px] rounded-full border border-solid ${getProgressLineStyle(
                      3
                    )}`}
                  >
                    <span className={`text-[12px] font-bold`}>3</span>
                  </div>
                </div>
              </div>

              {/* <div className="min-h-[1px] w-full bg-[var(--color-border-base)]"></div> */}

              <div className={`${styles.section_step_area} space-between flex w-full`}>
                <div className={`${styles.left_wrapper} flex  w-[60%] max-w-[60%] flex-col`}>
                  <div className={`flex min-w-max items-center space-x-[6px] text-[16px] font-bold`}>
                    <span>ステップ{step}</span>
                    <span>：</span>
                    {step === 1 && (
                      <>
                        {!isConverting && !isCompletedConvert && <span>自社専用の企業リストを読み込む</span>}
                        {isConverting && !isCompletedConvert && <span>CSVを読み込み中...</span>}
                        {!isConverting && isCompletedConvert && <span>CSV読み込み完了</span>}
                      </>
                    )}
                    {step === 2 && (
                      <>
                        <span>列の項目名の紐付け設定</span>

                        <div
                          className="flex-center relative !ml-[15px] h-[15px] w-[15px] rounded-full"
                          onMouseEnter={(e) => {
                            if (
                              infoIconStep2Ref.current &&
                              infoIconStep2Ref.current.classList.contains("animate_ping")
                            ) {
                              infoIconStep2Ref.current.classList.remove("animate_ping");
                            }
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              content: `取り込んだCSVの各項目と紐付けるデータベース用項目を選択してください。\n紐付けする項目内で「会社名」と「住所」は必須項目です。\n保存しない項目、または、対応する項目がない場合は保存せずにスキップを指定してください。`,
                              itemsPosition: "left",
                              // marginTop: 66,
                            });
                          }}
                          onMouseLeave={handleCloseTooltip}
                        >
                          <div
                            ref={infoIconStep2Ref}
                            className={`flex-center animate_ping duration15 absolute left-0 top-0 h-[15px] w-[15px] rounded-full border border-solid border-[var(--color-bg-brand-f)]`}
                          ></div>
                          <ImInfo className={`min-h-[15px] min-w-[15px] text-[var(--color-bg-brand-f)]`} />
                        </div>
                      </>
                    )}
                    {step === 3 && (
                      <>
                        {isCompleteInsert && <span>{`インサートが完了しました！🌠`}</span>}
                        {isErrorInsert && <span>{`インサートに失敗しました。。。`}</span>}
                        {isLoadingInsert && <span>{`インサート実行中...`}</span>}
                      </>
                    )}
                  </div>
                  <div
                    className={`mt-[6px] flex min-h-[39px] whitespace-pre-wrap text-[12px] text-[var(--color-text-sub)]`}
                  >
                    {step === 1 && (
                      <>
                        {!isConverting && !isCompletedConvert && (
                          <p>{`下記のエリアにCSVファイルをドラッグ&ドロップするか、\n「ファイルを選択してください」のテキストをクリックしてCSVファイルを選択してください。`}</p>
                        )}
                        {isConverting && !isCompletedConvert && (
                          <p>{`CSVファイルを読み込み中です。ファイルサイズが大きい場合は少し時間がかかりますので、\n完了するまでミニサイズボタンで小さくできます。完了次第チェックでお知らせいたします。`}</p>
                        )}
                        {!isConverting && isCompletedConvert && (
                          <p>{`読み込みが完了しました！「次へ」ボタンから次のステップに進んでください。`}</p>
                        )}
                      </>
                    )}
                    {step === 2 && (
                      <>
                        <p>{`TRUSTiFYデータベースの項目名と紐付けるCSVファイルの項目名を選択してください。\n保存しない不要な列の項目名には「スキップ」を指定してください。`}</p>
                      </>
                    )}
                    {step === 3 && (
                      <>
                        {isCompleteInsert && <p>{`インサートが完了しました！🌠`}</p>}
                        {isErrorInsert && <p>{`インサートに失敗しました。。。`}</p>}
                        {isLoadingInsert && <p>{`インサート実行中...`}</p>}
                      </>
                    )}
                  </div>
                </div>

                <div
                  className={`${styles.right_wrapper} flex h-full w-[40%] min-w-max items-end justify-end space-x-[15px]`}
                >
                  <div
                    className={`flex-center max-h-[30px] cursor-pointer truncate rounded-[4px] px-[12px] py-[4px] text-[13px] text-[var(--color-text-title)]`}
                    style={{ boxShadow: `var(--color-bg-under-input-box-shadow)` }}
                    onClick={(e) => {
                      setIsUpdate(!isUpdate);
                    }}
                  >
                    <span>{isUpdate ? `アップデート` : `インサート`}</span>
                  </div>
                  <button
                    type="button"
                    className={`transition-bg02 flex-center brand_btn_active space-x-[5px] rounded-[6px] px-[12px] py-[5px] text-[12px]`}
                    style={{
                      transition: `background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease width 0.2s ease`,
                    }}
                    onClick={() => {
                      handleSwitchSize(!isSmallWindow);
                    }}
                  >
                    ミニサイズ
                  </button>
                  <button
                    type="button"
                    className={`transition-bg02 flex-center brand_btn_active space-x-[5px] rounded-[6px] px-[12px] py-[5px] text-[12px]`}
                    style={{
                      transition: `background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease width 0.2s ease`,
                    }}
                    onClick={async () => {
                      for (let i = 0; i <= 100; i += 10) {
                        setProgressInserted(i);
                        console.log("progress: ", i);

                        await new Promise((resolve, reject) => setTimeout(resolve, 1000));
                      }

                      setProgressInserted(0);
                    }}
                  >
                    ロード
                  </button>
                  {step === 2 && (
                    <div
                      ref={stepBtnRef}
                      className={`transition-bg02 flex-center space-x-[5px] rounded-[6px] px-[12px] py-[5px] text-[12px] ${getNextBtnStyle(
                        step
                      )}`}
                      style={{
                        transition: `background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease width 0.2s ease`,
                      }}
                      onMouseEnter={(e) => {
                        let tooltipContent = ``;
                        if (step === 2) {
                          if (selectedRequiredColumnCount < 2) tooltipContent = `未選択の必須項目があります`;
                          if (requiredImportColumnOptionsSet.size <= selectedRequiredColumnCount)
                            tooltipContent = `紐付け設定を完了する`;
                        }
                        if (tooltipContent === "") return;
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: tooltipContent,
                          itemsPosition: "left",
                        });
                      }}
                      onMouseLeave={handleCloseTooltip}
                      onClick={() => {
                        handleCloseTooltip();
                        if (step === 2) {
                          if (selectedRequiredColumnCount < requiredImportColumnOptionsSet.size)
                            return alert(
                              "紐付け必須の項目名が選択されていません。紐付け必須項目は「会社名・住所」の2つです。\nCSVファイルの項目とデータベース用の項目を選択肢から選んで紐付けしてください。\nデータベース用の項目に存在しない項目は「スキップ」でデータベースに保存しないか、代わりとなる項目を選択してください。"
                            );

                          setIsUpdate(true);

                          // 選択されているindexを取り出す => selectedColumnFieldsArrayから空文字でないindexのみのSetオブジェクトを作成
                          const selectedIndexesArray = selectedColumnFieldsArray
                            .map((column, index) => (column !== "" ? index : null))
                            .filter((num): num is number => num !== null);
                          // InsertするCsvデータのカラム名 to データベースのカラム名 のMapオブジェクトを作成
                          const _insertCsvColumnNameToDBColumnMap = new Map(
                            selectedIndexesArray.map((i) => [uploadedColumnFields[i], selectedColumnFieldsArray[i]])
                          );
                          setInsertCsvColumnNameToDBColumnMap(_insertCsvColumnNameToDBColumnMap);
                          // アップロードされたCSVデータから選択されたindexのみのカラムに絞ったデータを抽出
                          // const uploadCsvDataOnlySelectedColumns =
                          console.log(
                            "selectedIndexesArray",
                            selectedIndexesArray,
                            "insertCsvColumnNameToDBColumnMap",
                            _insertCsvColumnNameToDBColumnMap,
                            "uploadedData",
                            uploadedData
                          );
                        }
                      }}
                    >
                      <span>
                        アップデート ({`${selectedRequiredColumnCount} / ${requiredImportColumnOptionsSet.size}`})
                      </span>
                    </div>
                  )}
                  <div
                    ref={stepBtnRef}
                    className={`transition-bg02 flex-center space-x-[5px] rounded-[6px] px-[12px] py-[5px] text-[12px] ${getNextBtnStyle(
                      step
                    )}`}
                    style={{
                      transition: `background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease width 0.2s ease`,
                    }}
                    onMouseEnter={(e) => {
                      let tooltipContent = ``;
                      if (step === 2) {
                        if (selectedRequiredColumnCount < 2) tooltipContent = `未選択の必須項目があります`;
                        if (requiredImportColumnOptionsSet.size <= selectedRequiredColumnCount)
                          tooltipContent = `紐付け設定を完了する`;
                      }
                      if (tooltipContent === "") return;
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: tooltipContent,
                        itemsPosition: "left",
                      });
                    }}
                    onMouseLeave={handleCloseTooltip}
                    onClick={() => {
                      handleCloseTooltip();
                      if (step === 1) {
                        if (isConverting) return;
                        if (!isCompletedConvert) {
                          handleClickBrowseButton();
                        } else {
                          // ステップ2に進める
                          setStep(2);
                          // 読み込んだCSVファイルのヘッダーカラムとDBのカラムの統合ステップに移る
                          // 🔸まずはCSVのヘッダーと5行以上存在する場合は最初の5行を表示して、DBにINSERTする際のカラムを選択形式で表示する。デフォルトはスキップでINSERTせず、必要最低限のセットすべきRequiredカラムがあといくつかも表示する
                        }
                      }
                      if (step === 2) {
                        if (selectedRequiredColumnCount < requiredImportColumnOptionsSet.size)
                          return alert(
                            "紐付け必須の項目名が選択されていません。紐付け必須項目は「会社名・住所」の2つです。\nCSVファイルの項目とデータベース用の項目を選択肢から選んで紐付けしてください。\nデータベース用の項目に存在しない項目は「スキップ」でデータベースに保存しないか、代わりとなる項目を選択してください。"
                          );

                        // 選択されているindexを取り出す => selectedColumnFieldsArrayから空文字でないindexのみのSetオブジェクトを作成
                        const selectedIndexesArray = selectedColumnFieldsArray
                          .map((column, index) => (column !== "" ? index : null))
                          .filter((num): num is number => num !== null);
                        // InsertするCsvデータのカラム名 to データベースのカラム名 のMapオブジェクトを作成
                        const _insertCsvColumnNameToDBColumnMap = new Map(
                          selectedIndexesArray.map((i) => [uploadedColumnFields[i], selectedColumnFieldsArray[i]])
                        );
                        setInsertCsvColumnNameToDBColumnMap(_insertCsvColumnNameToDBColumnMap);
                        // アップロードされたCSVデータから選択されたindexのみのカラムに絞ったデータを抽出
                        // const uploadCsvDataOnlySelectedColumns =
                        console.log(
                          "selectedIndexesArray",
                          selectedIndexesArray,
                          "insertCsvColumnNameToDBColumnMap",
                          _insertCsvColumnNameToDBColumnMap,
                          "uploadedData",
                          uploadedData
                        );
                      }
                    }}
                  >
                    {step === 1 && (
                      <>
                        {!isCompletedConvert && (
                          <>
                            <SlCloudDownload className={`${styles.upload_icon_btn} text-[13px] text-[#fff]`} />
                            <span>ファイル選択</span>
                          </>
                        )}
                        {isCompletedConvert && <span>次へ</span>}
                      </>
                    )}
                    {step === 2 && (
                      <>
                        <span>次へ ({`${selectedRequiredColumnCount} / ${requiredImportColumnOptionsSet.size}`})</span>
                      </>
                    )}
                    {step === 3 && (
                      <>
                        <span>閉じる</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* ----------------------- 保存・タイトル・キャンセルエリア ここまで ----------------------- */}
            {/* ----------------------- メインコンテナ ----------------------- */}
            <div
              className={`${styles.contents_container} fade08_forward flex h-full w-full flex-col rounded-b-[9px] px-[24px] pb-[1px]`}
            >
              {/* -------------------------- step1 CSV読み込み -------------------------- */}
              {step === 1 && (
                <div
                  className={`${styles.file_upload_box_container} mb-[24px] h-full w-full bg-[var(--color-modal-solid-bg-main)] p-[12px]`}
                >
                  {isCompletedConvert && (
                    <div className={`${styles.file_upload_box} flex-center h-full w-full flex-col`}>
                      <div className={`mb-[6px] mt-[-60px]`}>
                        <BsCheck2 className="pointer-events-none stroke-1 text-[120px] text-[var(--bright-green)]" />
                      </div>
                      <h2 className={`flex flex-col items-center text-[16px] text-[var(--color-text-sub)]`}>
                        <span>{language === "ja" ? "CSVデータの読み込みが完了しました！" : ``}</span>
                        <span>{language === "ja" ? "次のステップに進んでください！" : ``}</span>
                        <div
                          className={`transition-bg02 brand_btn_active flex-center mb-[-13px] mt-[13px] space-x-[5px] rounded-[6px] px-[12px] py-[5px] text-[15px]`}
                          onClick={() => {
                            if (stepBtnRef.current) stepBtnRef.current.click();
                          }}
                        >
                          <span>次へ</span>
                        </div>
                      </h2>
                    </div>
                  )}
                  {!isCompletedConvert && (
                    <div
                      ref={fileUploadBoxRef}
                      onDragEnter={handleDragEnterUploadBox}
                      onDragOver={handleDragOverUploadBox}
                      onDragLeave={handleDragLeaveUploadBox}
                      onDrop={handleDropUploadBox}
                      className={`${styles.file_upload_box} flex-center h-full w-full flex-col`}
                    >
                      {isConverting && (
                        <>
                          {<CheckingAnime /> ?? <SpinnerX />}
                          <div className={`mr-[-2px] flex min-w-[45px] items-center`}>
                            <p ref={convertingTextRef} className={`text-[16px] text-[var(--color-text-sub)]`}>
                              読み込み中
                            </p>
                          </div>
                        </>
                      )}
                      {!isConverting && (
                        <>
                          <div ref={uploadIconRef} className={`${styles.upload_icon}`}>
                            <SlCloudUpload />
                          </div>
                          <div ref={dropIconRef} className={`${styles.drop_icon}`}>
                            <SlCloudDownload />
                          </div>

                          <h2 ref={uploadTextRef} className={styles.box_title}>
                            <span className={styles.file_instruction}>
                              {language === "ja" ? "ここにファイルをドラッグするか" : `Drag files here or`}
                            </span>
                            <label htmlFor="file_upload_csv">
                              <span ref={fileBrowseTextRef} className={styles.file_browse_button}>
                                {" "}
                                ファイルを選択してください
                              </span>
                            </label>
                          </h2>
                          <div
                            ref={uploadSubTextRef}
                            className={`mb-[-3px] mt-[3px] flex text-[13px] text-[var(--color-text-sub)]`}
                          >
                            <p>（最大ファイルサイズ：200MB / 読み込み上限：100万行）</p>
                          </div>
                          <input
                            ref={inputFileUploadRef}
                            id="file_upload_csv"
                            type="file"
                            accept=".csv"
                            // accept=".csv, .xlsx, "
                            // multiple // 一旦ファイル選択数は1つのみ
                            hidden
                            className={styles.file_browse_input}
                            onChange={(e) => handleSelectedFiles(e.target.files)}
                            // onChange={(e) => console.log(e)}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* -------------------------- step1 CSV読み込み ここまで -------------------------- */}
              {/* -------------------------- step2 マッピング -------------------------- */}
              {step === 2 && uploadedCSVFile && (
                <div
                  className={`${styles.mapping_container} flex h-full max-h-[calc(90vh-1px-156px)] w-full max-w-[1100px] flex-col`}
                  style={{
                    ...(modalHeight && { maxHeight: `${modalHeight - 1 - 156 - 2}px` }),
                    maxWidth: `${tableWidth}px`,
                  }}
                >
                  {/* 上画面 */}
                  <div
                    className={`${styles.title_wrapper} flex w-full max-w-[1100px] items-center space-x-[30px] overflow-x-auto whitespace-nowrap px-[24px] pt-[5px] text-[12px] text-[var(--color-text-sub)]`}
                    style={{
                      minHeight: `${tableTitleAreaHeight}px`,
                      height: `${tableTitleAreaHeight}px`,
                      maxWidth: `${tableWidth}px`,
                    }}
                  >
                    <div className="flex items-center">
                      <div className="flex flex-col items-center justify-center font-bold">
                        <span>CSVデータ数</span>
                        <span className={`text-[8px] `}>(ヘッダーを除く)</span>
                      </div>
                      <div className="mr-[6px] flex">
                        <span>：</span>
                      </div>
                      <div className="flex text-[var(--color-text-brand-f)]">
                        <span>{formattedUploadedRowCount}件</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex font-bold">
                        <span>ヘッダー項目数</span>
                      </div>
                      <div className="mr-[6px] flex">
                        <span>：</span>
                      </div>
                      <div className="flex text-[var(--color-text-brand-f)]">
                        <span>{uploadedColumnFields.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex font-bold">
                        <span>ファイル名</span>
                      </div>
                      <div className="mr-[6px] flex">
                        <span>：</span>
                      </div>
                      <div className="flex text-[var(--color-text-brand-f)]">
                        <span>{uploadedCSVFile.name}</span>
                      </div>
                    </div>
                  </div>
                  {/* 上画面 */}
                  {/* 下画面 */}
                  <div className={`${styles.main_wrapper} flex h-full w-full px-[12px]`}>
                    {/* 左サイド 説明タイトルテーブル */}
                    {/* <div className={`${styles.left_container} h-full w-[10%] bg-red-100`}></div> */}
                    {/* 左サイド 説明タイトルテーブル ここまで */}

                    {/* 右サイド マッピングテーブル */}
                    {/* <div className={`${styles.right_container} h-full w-[90%]`}></div> */}
                    {/* 右サイド マッピングテーブル ここまで */}
                    {/* テーブル */}
                    <div
                      role="grid"
                      className={`${styles.mapping_table} h-full max-h-[calc(90vh-1px-156px-50px)] w-full max-w-[calc(1100px-24px)] overflow-auto`}
                      // modalHeight - 1 - 156 - 50
                      style={{
                        ...(modalHeight && { maxHeight: `${modalHeight - 1 - 156 - 50}px` }),
                        gridTemplateRows: `${tableColumnHeaderRowHeight}px repeat(${uploadedDisplayRowList.length}, ${tableRowHeight}px)`,
                      }}
                    >
                      {/* カラム数量が7以上の場合はスクロールが必要となるため、右側にシャドウを表示する */}
                      {/* shadow-right */}
                      {/* <div
                        className="absolute right-0 top-0 z-10 h-full w-[30px]"
                        style={{ background: `var(--color-dashboard-table-right-shadow)` }}
                      /> */}
                      {/* shadow-right ここまで */}
                      {/* --------------- ヘッダー --------------- */}
                      <div
                        role="row"
                        className={`${styles.row} ${styles.column_header_row}`}
                        style={{
                          gridRowStart: 1,
                          gridTemplateColumns: `${tableRowHeaderWidth}px repeat(${uploadedColumnFields.length}, ${tableColumnWidth}px)`,
                        }}
                      >
                        {/* 行ヘッダーの列ヘッダー */}
                        <div
                          role="columnheader"
                          className={`${styles.column_header} ${styles.row_header} flex flex-col items-start justify-center`}
                          style={{
                            gridColumnStart: 1,
                          }}
                        >
                          <div className={`${styles.csv_field_name_box} flex w-max flex-col px-[7px]`}>
                            <div
                              className={`truncate`}
                              // cellのpadding-x: 12px, fieldName-boxのpl: 7px
                              style={{ maxWidth: `${tableColumnContentBoxWidth - 12 - 12 - 7}px` }}
                            >
                              <span className="">CSVの項目名</span>
                            </div>
                            <div className="flex-center min-h-[24px] w-full">
                              {/* <span>↓</span> */}
                              <IoIosArrowRoundDown
                                className={`stroke-[13px] text-[18px] text-[var(--color-text-sub)]`}
                              />
                            </div>
                          </div>
                          <div
                            className={`flex flex-col truncate px-[7px] text-[12px]`}
                            style={{ maxWidth: `${tableColumnContentBoxWidth - 12 - 12 - 7}px` }}
                          >
                            <span className="">データベース用</span>
                            <span className="">項目名</span>
                          </div>
                        </div>
                        {/* 行ヘッダーの列ヘッダーここまで */}
                        {/* CSVデータ 行ヘッダー */}
                        {uploadedColumnFields.map((fieldName, colIndex) => {
                          return (
                            <div
                              key={`mapping_table_columnheader_${colIndex}`}
                              role="columnheader"
                              className={`${styles.column_header} flex flex-col items-start justify-center`}
                              style={{
                                gridColumnStart: colIndex + 1 + 1, // 列ヘッダーが1番目のため2番目から
                                // borderRight: `1px solid var(--color-border-light)`,
                              }}
                            >
                              <div className={`${styles.csv_field_name_box} flex w-max flex-col px-[7px]`}>
                                <div
                                  className={`truncate`}
                                  // cellのpadding-x: 12px, fieldName-boxのpl: 7px
                                  style={{ maxWidth: `${tableColumnContentBoxWidth - 12 - 12 - 7}px` }}
                                  onMouseEnter={(e) => {
                                    if (!fieldName) return;
                                    const el = e.currentTarget;
                                    if (el.scrollWidth > el.offsetWidth)
                                      handleOpenTooltip({
                                        e: e,
                                        display: "top",
                                        content: fieldName,
                                        itemsPosition: "left",
                                      });
                                  }}
                                  onMouseLeave={handleCloseTooltip}
                                >
                                  {/* <span>CSVの項目</span> */}
                                  <span className="">{fieldName}</span>
                                </div>
                                <div className="flex-center min-h-[24px] w-full">
                                  {/* <span>↓</span> */}
                                  <IoIosArrowRoundDown
                                    className={`stroke-[13px] text-[18px] text-[var(--color-text-sub)]`}
                                  />
                                </div>
                              </div>
                              <CustomSelectMapping
                                stateArray={selectedColumnFieldsArray}
                                dispatch={setSelectedColumnFieldsArray}
                                targetIndex={colIndex}
                                options={optionsColumnsForInsertWithEmpty}
                                getOptionName={getInsertColumnNames}
                                selectedSetObj={alreadySelectColumnsSetObj}
                                withBorder={true}
                                modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                                customClass="font-normal"
                                // maxWidth={156}
                                maxWidth={tableColumnContentBoxWidth - 12 - 12}
                                bgDark
                                isSelectedActiveColor
                                activeColor="var(--color-active-fg)"
                                requiredOptionsSet={requiredImportColumnOptionsSet}
                              />
                            </div>
                          );
                        })}
                      </div>
                      {/* --------------- ヘッダー --------------- */}

                      {/* --------------- rowgroup --------------- */}
                      {uploadedDisplayRowList.map((row, rowIndex) => {
                        return (
                          <div
                            key={`mapping_table_datalist_${rowIndex}`}
                            role="row"
                            className={`${styles.row} ${styles.content_row}`}
                            style={{
                              gridRowStart: rowIndex + 2,
                              gridTemplateColumns: `${tableRowHeaderWidth}px repeat(${uploadedColumnFields.length}, ${tableColumnWidth}px)`,
                            }}
                          >
                            {/* 列ヘッダー */}
                            <div
                              role="gridcell"
                              className={`${styles.grid_cell} ${styles.row_header}`}
                              style={{ gridColumnStart: 1 }}
                            >
                              <span>{rowIndex + 1}行目のデータ</span>
                            </div>
                            {/* 列ヘッダーここまで */}
                            {/* CSVデータ */}
                            {uploadedColumnFields.map((fieldName, colIndex) => {
                              const value = Object.keys(row).includes(fieldName) ? row[fieldName] : `−`;
                              return (
                                <div
                                  key={`mapping_table_${rowIndex}_gridcell_${colIndex}`}
                                  role="gridcell"
                                  className={`${styles.grid_cell}`}
                                  style={{ gridColumnStart: colIndex + 1 + 1 }} // 列ヘッダーが１番目なので2から
                                >
                                  <span
                                    onMouseEnter={(e) => {
                                      if (!value) return;
                                      const el = e.currentTarget;
                                      if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
                                        handleOpenTooltip({
                                          e: e,
                                          display: "top",
                                          content: value,
                                          itemsPosition: "left",
                                          // marginTop: 15,
                                          // maxWidth: 390,
                                          // whiteSpace: "pre-wrap",
                                        });
                                    }}
                                    onMouseLeave={handleCloseTooltip}
                                  >
                                    {/* データ{rowIndex}_{colIndex} */}
                                    {value || "−"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                      {/* --------------- rowgroup ここまで --------------- */}
                      {/* フッター */}
                      <div
                        className={`${styles.table_footer} sticky bottom-0 left-0 min-h-[30px] min-w-[calc(1100px-24px)] max-w-[calc(1100px-24px)] bg-[var(--color-table-header-f6)]`}
                      >
                        <div className={`flex h-full items-center space-x-[12px] pl-[12px]`}>
                          <div className={`flex items-center text-[11px] text-[var(--color-text-sub)]`}>
                            <span className="mr-[9px] text-[var(--color-text-title)]">
                              {uploadedDisplayRowList.length}行
                            </span>
                            <span className="mr-[6px] font-bold">/</span>
                            <span className="font-bold">{formattedUploadedRowCount}行</span>
                          </div>
                        </div>
                      </div>
                      {/* フッター */}
                    </div>
                    {/* テーブル */}
                  </div>
                  {/* 下画面 */}
                </div>
              )}
              {/* -------------------------- step2 マッピング ここまで -------------------------- */}
              {/* -------------------------- step3 インサート -------------------------- */}
              {step === 3 && (
                <div
                  className={`${styles.file_upload_box_container} mb-[24px] h-full w-full bg-[var(--color-modal-solid-bg-main)] p-[12px]`}
                >
                  {isCompleteInsert && (
                    <div className={`${styles.file_upload_box} flex-center h-full w-full flex-col`}>
                      <div className={`mb-[6px] mt-[-60px]`}>
                        <BsCheck2 className="pointer-events-none stroke-1 text-[120px] text-[var(--bright-green)]" />
                      </div>
                      <h2 className={`flex flex-col items-center text-[16px] text-[var(--color-text-sub)]`}>
                        <span>{language === "ja" ? "インサートが完了しました！" : ``}</span>
                        <div
                          className={`transition-bg02 brand_btn_active flex-center mb-[-13px] mt-[13px] space-x-[5px] rounded-[6px] px-[12px] py-[5px] text-[15px]`}
                          onClick={() => {
                            handleCloseModal();
                          }}
                        >
                          <span>閉じる</span>
                        </div>
                      </h2>
                    </div>
                  )}
                  {!isCompleteInsert && (
                    <div
                      ref={fileUploadBoxRef}
                      className={`${styles.file_upload_box} flex-center h-full w-full flex-col`}
                    >
                      {isLoadingInsert && (
                        <>
                          {progressInserted !== null && (
                            <div className={`flex-col-center relative space-y-[10px]`}>
                              <ProgressCircleIncrement
                                circleId={`bulk_insert`}
                                textId={`bulk_insert`}
                                progress={progressInserted}
                                startProgress={progressInserted}
                                duration={5000}
                                easeFn="Quartic"
                                size={156}
                                fontSize={33}
                                // size={145}
                                // fontSize={30}
                                strokeWidth={13}
                                fontWeight={500}
                                fontFamily="var(--font-family-str)"
                                textColor="var(--color-text-title)"
                                isReady={true}
                                withShadow={false}
                                // fade={`fade08_forward`}
                                // customText="達成率"
                                // customFontSize={12}
                                // customTextTop={`calc(50% + 28px)`}
                              />
                            </div>
                          )}
                          <div className={`mb-[5px] mr-[-2px] mt-[13px] flex min-w-[45px] items-center`}>
                            <p ref={convertingTextRef} className={`text-[16px] text-[var(--color-text-sub)]`}>
                              インサート実行中...
                            </p>
                          </div>
                          <div className="flex-center mb-[-30px] pl-[2px]">
                            <DotsLoaderBounceF shadow={`unset`} />
                          </div>
                        </>
                      )}
                      {/* {!isLoadingInsert && (
                        <>
                          {!isErrorInsert && (
                            <>
                              <SpinnerX h="h-[24px]" w="w-[24px]" />
                              <div className={`mr-[-2px] mt-[10px] flex min-w-[45px] items-center`}>
                                <p ref={convertingTextRef} className={`text-[16px] text-[var(--color-text-sub)]`}>
                                  インサート準備中
                                </p>
                              </div>
                            </>
                          )}
                          {isErrorInsert && (
                            <div className={`mr-[-2px] flex min-w-[45px] items-center`}>
                              <p ref={convertingTextRef} className={`text-[16px] text-[var(--color-text-sub)]`}>
                                インサートに失敗しました...🙇‍♀️
                              </p>
                            </div>
                          )}
                        </>
                      )} */}
                    </div>
                  )}
                </div>
              )}
              {/* -------------------------- step3 インサート ここまで -------------------------- */}
            </div>
          </>
        )}
        {/* ------------------------------------ ミニサイズVer ------------------------------------ */}
        {isSmallWindow && (
          <>
            {/* ----------------------- 保存・タイトル・キャンセルエリア ----------------------- */}
            <div
              className={`${styles.small_title_area} z-[5] flex h-auto w-full flex-col rounded-t-[9px] px-[15px] pb-[0px] pt-[15px]`}
              // style={{...(isHide && {pointerEvents: 'unset'})}}
            >
              <div className={`mb-[0px] flex h-auto w-full min-w-max items-center`}>
                <div className={`mr-[0px] flex min-w-max items-center space-x-[6px] text-[12px] font-bold`}>
                  <span>CSVインポート</span>
                  <div
                    className={`flex-center h-[18px] max-h-[18px] w-[18px] max-w-[18px] rounded-full`}
                    style={{ boxShadow: `0 0 0 1px var(--main-color-f)` }}
                  >
                    <RiDragMove2Fill className={`text-[15px] text-[var(--main-color-f)]`} />
                  </div>
                </div>
              </div>

              {/* <div className="min-h-[1px] w-full bg-[var(--color-border-base)]"></div> */}
            </div>
            {/* ----------------------- 保存・タイトル・キャンセルエリア ここまで ----------------------- */}
            {/* ----------------------- メインコンテナ ----------------------- */}
            <div
              className={`${styles.small_contents_container} z-[5] flex h-full w-full flex-col rounded-b-[9px] px-[15px]`}
            >
              <div className={`flex h-full w-full justify-between`}>
                <div className={`flex h-full items-center`}>
                  {step === 1 && isConverting && (
                    <>
                      <SpinnerX h="h-[24px]" w="w-[24px]" />
                      <div className={`ml-[15px] flex min-w-max items-center`}>
                        <p ref={convertingTextRef} className={`text-[13px] text-[var(--color-text-sub)]`}>
                          読み込み中
                        </p>
                      </div>
                    </>
                  )}
                  {step === 1 && !isConverting && isCompletedConvert && (
                    <>
                      <BsCheck2 className="pointer-events-none min-h-[18px] min-w-[24px] stroke-1 text-[24px] text-[var(--bright-green)]" />
                      <div className={`ml-[15px] flex min-w-max items-center`}>
                        <p ref={convertingTextRef} className={`text-[13px] text-[var(--color-text-sub)]`}>
                          読み込み完了
                        </p>
                      </div>
                    </>
                  )}
                  {((step === 1 && !isConverting && !isCompletedConvert) || step === 2) && (
                    <div className="relative flex h-[25px] w-full items-center">
                      {/* プログレスライン */}
                      <div className="absolute left-0 top-[50%] z-[-1] h-[1px] w-[105px] bg-[var(--color-progress-bg)]"></div>
                      <div
                        className={`flex-center mr-[15px] h-[25px] w-[25px] rounded-full border border-solid ${getProgressLineStyle(
                          1
                        )}`}
                      >
                        <span className={`text-[12px] font-bold`}>1</span>
                      </div>
                      <div
                        className={`flex-center mr-[15px] h-[25px] w-[25px] rounded-full border border-solid ${getProgressLineStyle(
                          2
                        )}`}
                      >
                        <span className={`text-[12px] font-bold`}>2</span>
                      </div>
                      <div
                        className={`flex-center mr-[15px] h-[25px] w-[25px] rounded-full border border-solid ${getProgressLineStyle(
                          3
                        )}`}
                      >
                        <span className={`text-[12px] font-bold`}>3</span>
                      </div>
                    </div>
                  )}
                  {step === 3 && isTransformProcessing && (
                    <>
                      <SpinnerX h="h-[24px]" w="w-[24px]" />
                      <div className={`ml-[15px] flex min-w-max items-center`}>
                        <p ref={convertingTextRef} className={`text-[13px] text-[var(--color-text-sub)]`}>
                          変換処理中
                        </p>
                      </div>
                    </>
                  )}
                  {step === 3 && isLoadingInsert && (
                    <>
                      {progressInserted !== null && (
                        <div className={`flex-center relative h-[48px] w-[30px] pb-[6px] text-[12px]`}>
                          <ProgressCircleIncrement
                            circleId={`bulk_insert_mini`}
                            textId={`bulk_insert_mini`}
                            progress={progressInserted}
                            startProgress={progressInserted}
                            duration={5000}
                            easeFn="Quartic"
                            size={24}
                            strokeWidth={3}
                            hiddenCenterText={true}
                            oneColor="var(--main-color-f)"
                            notGrad={true}
                            isReady={true}
                            withShadow={false}
                            // fade={`fade03_forward`}
                          />
                          <ProgressNumberIncrement
                            targetNumber={progressInserted}
                            startNumber={progressInserted}
                            duration={5000}
                            easeFn="Quartic"
                            fontSize={9}
                            margin="0 0 0 0"
                            isReady={true}
                            isPrice={false}
                            isPercent={true}
                            // fade={`fade03_forward`}
                            customClass={`absolute bottom-0 left-[50%] translate-x-[-50%] text-[5px]`}
                            textColor={`var(--color-text-sub)`}
                          />
                        </div>
                      )}
                      <div className={`ml-[15px] flex min-w-max items-center`}>
                        <p ref={convertingTextRef} className={`text-[13px] text-[var(--color-text-sub)]`}>
                          インポート中...
                        </p>
                      </div>
                      {/* <DotsLoaderBounceF
                        shadow={`unset`}
                        scale="scale(0.3)"
                        width="90px"
                        height="18px"
                        positionX="0%"
                        centerX="40%"
                      /> */}
                    </>
                  )}
                  {/* {step === 3 && true && (
                    <>
                      <BsCheck2 className="pointer-events-none min-h-[18px] min-w-[24px] stroke-1 text-[24px] text-[var(--bright-green)]" />
                      <div className={`ml-[15px] flex min-w-max items-center`}>
                        <p ref={convertingTextRef} className={`text-[13px] text-[var(--color-text-sub)]`}>
                          インポート完了
                        </p>
                      </div>
                    </>
                  )} */}
                </div>

                <div className={`flex h-full items-center`}>
                  <div className="z-[30] mr-[6px]  cursor-pointer hover:text-[#999]">
                    <BsChevronRight className="stroke-[0.5] text-[15px]" />
                  </div>

                  {/* <BsChevronLeft className="z-1 absolute  left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" /> */}
                </div>
              </div>
            </div>
            {/* ----------------------- メインコンテナ ここまで ----------------------- */}
          </>
        )}
        {/* ------------------------------------ ミニサイズVer ここまで ------------------------------------ */}
        {/* ----------------------- メインコンテナ ここまで ----------------------- */}
      </div>

      {/* ----------------------- キャンセル確認モーダル ----------------------- */}
      {isOpenCancelConfirmationModal && (
        <ConfirmationModal
          titleText={`インポート画面を閉じてもよろしいですか？`}
          sectionP1={`CSVデータのインポートは完了していません。取り込んだデータは保存されず破棄されます。`}
          cancelText="戻る"
          submitText="閉じる"
          // buttonColor="red"
          buttonColor="brand"
          zIndex="3000px"
          zIndexOverlay="2800px"
          withAnnotation={false}
          // annotationText="注：この操作は少し時間がかかります。画面を閉じずにお待ちください。"
          // clickEventSubmit={handleResetA}
          withSelect={false}
          isOverlayBgBlack={true}
          clickEventClose={() => {
            setIsCancelConfirmationModal(false);
          }}
          clickEventSubmit={async () => {
            handleCloseModal();
            setIsCancelConfirmationModal(true);
          }}
          marginTopP1={`15px`}
        />
      )}
      {/* ----------------------- キャンセル確認モーダル ここまで ----------------------- */}
      {/* ----------------------- 前処理確認モーダル ----------------------- */}
      {!!insertCsvColumnNameToDBColumnMap && !isConfirmInsertModal && (
        <ConfirmationModal
          titleText={`前処理を実行してもよろしいですか？`}
          sectionP1={`マッピング内容をコンソールで確認してください。`}
          cancelText="戻る"
          submitText="前処理実行"
          // buttonColor="red"
          buttonColor="brand"
          zIndex="3000px"
          zIndexOverlay="2800px"
          withAnnotation={false}
          // annotationText="注：この操作は少し時間がかかります。画面を閉じずにお待ちください。"
          // clickEventSubmit={handleResetA}
          isLoadingState={isLoadingTransforming}
          withSelect={false}
          isOverlayBgBlack={true}
          clickEventClose={() => {
            setInsertCsvColumnNameToDBColumnMap(null);
          }}
          clickEventSubmit={() => {
            if (isUpdate) {
              startTransformDataForUpdate();
            } else {
              startTransformData();
            }
          }}
          marginTopP1={`15px`}
        />
      )}
      {/* ----------------------- 前処理確認モーダル ここまで ----------------------- */}
      {/* ----------------------- Insert確認モーダル ----------------------- */}
      {isConfirmInsertModal && !!transformedInsertTownsData && (
        <ConfirmationModal
          titleText={`インサートを実行してもよろしいですか？`}
          sectionP1={`インサート内容をコンソールで確認してください。`}
          cancelText="戻る"
          submitText="インサート実行"
          // buttonColor="red"
          buttonColor="brand"
          zIndex="3000px"
          zIndexOverlay="2800px"
          withAnnotation={false}
          // annotationText="注：この操作は少し時間がかかります。画面を閉じずにお待ちください。"
          // clickEventSubmit={handleResetA}
          withSelect={false}
          isOverlayBgBlack={true}
          clickEventClose={() => {
            setIsConfirmInsertModal(false);
            setInsertCsvColumnNameToDBColumnMap(null);
            setTransformedInsertTownsData(null);
          }}
          clickEventSubmit={handleStartBulkInsert}
          marginTopP1={`15px`}
        />
      )}
      {/* ----------------------- Insert確認モーダル ここまで ----------------------- */}
      {/* ----------------------- Update確認モーダル ----------------------- */}
      {isConfirmUpdateModal && !!transformedInsertTownsData && (
        <ConfirmationModal
          titleText={`アップデートを実行してもよろしいですか？`}
          sectionP1={`アップデート内容をコンソールで確認してください。`}
          cancelText="戻る"
          submitText="アップデート実行"
          // buttonColor="red"
          buttonColor="brand"
          zIndex="3000px"
          zIndexOverlay="2800px"
          withAnnotation={false}
          // annotationText="注：この操作は少し時間がかかります。画面を閉じずにお待ちください。"
          // clickEventSubmit={handleResetA}
          withSelect={false}
          isOverlayBgBlack={true}
          clickEventClose={() => {
            setIsConfirmUpdateModal(false);
            setInsertCsvColumnNameToDBColumnMap(null);
            setTransformedInsertTownsData(null);
          }}
          clickEventSubmit={handleStartBulkUpdate}
          marginTopP1={`15px`}
        />
      )}
      {/* ----------------------- Update確認モーダル ここまで ----------------------- */}
    </>
  );
};

export const ProviderImportModal = memo(ProviderImportModalMemo);
