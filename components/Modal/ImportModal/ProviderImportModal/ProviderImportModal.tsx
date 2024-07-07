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
import { regionsNameToIdMapJp } from "@/utils/selectOptions";

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

  // INSERTで必須カラムの選択済み個数
  // not nullableのカラム: 「会社名、部署名、住所」の3個 => 部署名は選択していなかった場合は「.(ピリオド)」をプレイスホルダーでセットしてINSERTする（代表番号も経済産業省のリストが載せていないデータも多いため入れない。業種は一旦入れない）
  // const [selectedRequiredColumnCount, setSelectedRequiredColumnCount] = useState(0);
  const requiredImportColumnOptionsSet = useMemo(() => {
    if (insertTableType === "towns")
      return new Set(["region_id", "city_id", "postal_code", "town_name_ja", "town_name_kana"]);
    return new Set([]);
  }, [insertTableType]);
  const selectedRequiredColumnCount = useMemo(() => {
    return (
      Array.from(alreadySelectColumnsSetObj).filter((option) => requiredImportColumnOptionsSet.has(option)).length ?? 0
    );
  }, [alreadySelectColumnsSetObj]);

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
  const [isLoadingTransforming, setIsLoadingTransforming] = useState(false);
  // 前処理実行してインサート内容を確認モーダルを開く
  const startTransformData = () => {
    setIsLoadingTransforming(true);

    try {
      // 町域テーブル
      if (insertTableType === "towns") {
        type UploadTownsCsvType = {
          region_name: string;
          city_name: string;
          postal_code: string;
          town_name_ja: string;
          town_name_kana: string;
        };
        type InsertTownType = Omit<Towns, "town_id" | "created_at" | "updated_at">;
        type TownDetail = { region_name: string; city_name: string; town_name_ja: string; town_name_kana: string };

        // まずは一旦同じ郵便番号を持つ行データが１つの町域のデータかどうかを確認する
        const filterDataByMultipleEntries = (data: UploadTownsCsvType[]) => {
          console.log("------------------------------------------");
          performance.mark("Filter_Start"); // 開始点
          const startTime = performance.now(); // 開始時間

          const postalCodeMap = new Map<string, TownDetail[]>();

          data.forEach((item) => {
            const { postal_code, ...townDetail } = item;
            if (postalCodeMap.has(postal_code)) {
              postalCodeMap.get(postal_code)!.push(townDetail);
            } else {
              postalCodeMap.set(postal_code, [townDetail]);
            }
          });

          // Filter entries with multiple town details
          const filteredMap = new Map<string, TownDetail[]>();
          postalCodeMap.forEach((details, postalCode) => {
            if (details.length > 1) {
              filteredMap.set(postalCode, details);
            }
          });

          // 同じ郵便番号でグループ化された町域名データを走査し、開き括弧「（」で始まり閉じ括弧「）」で終わらない行を検出します。次に、その行から閉じ括弧が現れるまでの全ての行を連結し、一つの町域名として処理します。この処理をすべての郵便番号に対して適用することで、必要な町域情報のみを正確に統合できます。

          // 同じ郵便番号に対する町域データを整形する関数
          const consolidateTownDetails = (
            townDetails: TownDetail[]
          ): { consolidatedDetails: TownDetail[]; consolidatedDetailsOnly: TownDetail[] } => {
            let newDetails: TownDetail[] = [];
            let consolidatedDetailsArrayOnly: TownDetail[] = [];
            let consolidatedDetail = "";
            let consolidatedDetailKana = "";
            let isOpen = false; // 括弧が開いているかのフラグ

            townDetails.forEach((detail) => {
              const { town_name_ja, town_name_kana } = detail;
              if (town_name_ja.includes("（") && !town_name_ja.includes("）")) {
                // 括弧が開始され、閉じられていない行
                consolidatedDetail += town_name_ja;
                consolidatedDetailKana += town_name_kana;
                isOpen = true;
              } else if (isOpen && !town_name_ja.includes("）")) {
                // 開始された括弧が閉じられていない間の行を連結
                consolidatedDetail += town_name_ja;
                consolidatedDetailKana += town_name_kana;
              } else if (isOpen && town_name_ja.includes("）")) {
                // 開始された括弧が閉じられる行
                consolidatedDetail += town_name_ja;
                consolidatedDetailKana += town_name_kana;
                // 閉じられたタイミングでpush
                const newDetail = {
                  ...detail,
                  town_name_ja: consolidatedDetail,
                  town_name_kana: consolidatedDetailKana,
                } as TownDetail;
                newDetails.push(newDetail);
                consolidatedDetailsArrayOnly.push(newDetail);
                // リセット
                consolidatedDetail = "";
                consolidatedDetailKana = "";
                isOpen = false;
              } else if (!isOpen) {
                // 単独で完結している町域名
                // consolidatedDetail += (consolidatedDetail ? " " : "") + town_name_ja;
                newDetails.push(detail);
              }
            });

            // return consolidatedDetail;
            return { consolidatedDetails: newDetails, consolidatedDetailsOnly: consolidatedDetailsArrayOnly };
          };

          // 新たな処理後の同じ郵便番号を持つ町域グループ
          const consolidatedMap = new Map();
          const consolidatedMapOnly = new Map();
          // 郵便番号ごとにフィルタリングされたMapから町域名を統合
          filteredMap.forEach((details, postalCode) => {
            const { consolidatedDetails, consolidatedDetailsOnly } = consolidateTownDetails(details);
            consolidatedMap.set(postalCode, consolidatedDetails);
            if (0 < consolidatedDetailsOnly.length) {
              consolidatedMapOnly.set(postalCode, consolidatedDetailsOnly);
            }
            // console.log(`Postal Code: ${postalCode}, Consolidated Details: ${consolidatedDetails}`);
          });

          performance.mark("Filter_End"); // 開始点
          performance.measure("Filter_Time", "Filter_Start", "Filter_End"); // 計測
          console.log("Measure Time: ", performance.getEntriesByName("Filter_Time")[0].duration);
          performance.clearMarks();
          performance.clearMeasures("Filter_Time");
          const endTime = performance.now(); // 終了時間
          console.log("Time: ", endTime - startTime, "ms");
          console.log(
            "前処理完了✅ Result:",
            "統合後",
            consolidatedMap,
            "統合した町域のみ",
            consolidatedMapOnly,
            "統合前",
            filteredMap
          );
          console.log("------------------------------------------");

          //   return filteredMap;
          return consolidatedMap;
        };

        // const filteredData = filterDataByMultipleEntries(uploadedData as UploadTownsCsvType[]);

        // 🌠パースした全ての行データに対して、町域テーブルにインサート可能な状態にデータを整形

        // 1. 国コードを追加
        // 2. 都道府県名をregion_idに変換
        // 3. 市区町村名をcity_idに変換
        // 4. town_name_jaの値から（...）の部分を除去して、正規化した値をnormalized_nameにセット
        // 5. postal_codeはそのままセット

        // 1. region_nameから国コードregion_idに変換する関数
        const convertRegionNameToId = (regionName: string) => {
          if (regionsNameToIdMapJp.has(regionName)) {
            return regionsNameToIdMapJp.get(regionName)!;
          } else {
            return null;
          }
        };

        // 🔸1~5の変換処理と町域名の統合を同時に行いインサート用リストを生成
        //   全行データから「町域（...」〜「...)」の複数行を「町域（...）」の一行に統合して新たなインサート用の町域リストを生成
        const transformCombinedDataByMultipleEntries = (
          uploadTownsData: UploadTownsCsvType[]
        ): {
          transformedTownsData: InsertTownType[];
          combinedTownsDataArrayOnly: UploadTownsCsvType[];
          unfinishedRowCount: number;
          //   combinedTownNamesOnly: string[];
          //   combinedTownNamesKanaOnly: string[];
        } => {
          console.log("------------------------------------------");
          performance.mark("Filter_Start"); // 開始点
          const startTime = performance.now(); // 開始時間

          const transformedTownsData: InsertTownType[] = [];
          const combinedTownsDataArrayOnly: UploadTownsCsvType[] = [];
          let consolidatedDetail = "";
          let consolidatedDetailKana = "";
          let isOpen = false; // 括弧が開いているかのフラグ
          let unfinishedRowCount = 0;
          let invalidRow: UploadTownsCsvType[] = []; // 無効な行

          uploadTownsData.forEach((townData) => {
            const { town_name_ja, town_name_kana } = townData;

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
              unfinishedRowCount += 1;
              // 開始された括弧が閉じられる行
              consolidatedDetail += town_name_ja;
              consolidatedDetailKana += town_name_kana;

              // 閉じられたタイミングでpush
              const convertedRegionId = convertRegionNameToId(townData.region_name);
              if (convertedRegionId !== null) {
                const newTownData = {
                  ...townData,
                  town_name_ja: consolidatedDetail,
                  town_name_kana: consolidatedDetailKana,
                  country_id: 153, // 日本
                  region_id: convertedRegionId,
                  city_id: 11,
                  town_name_en: null,
                  normalized_name: null,
                } as InsertTownType;
                transformedTownsData.push(newTownData);

                const combinedTownData = {
                  ...townData,
                  town_name_ja: consolidatedDetail,
                  town_name_kana: consolidatedDetailKana,
                };
                combinedTownsDataArrayOnly.push(combinedTownData);
              } else {
              }
              // リセット
              consolidatedDetail = "";
              consolidatedDetailKana = "";
              isOpen = false;
            } else if (!isOpen) {
              // 単独で完結している町域名
              //   transformedTownsData.push(townData);
              const newTownData = {
                ...townData,
                town_name_ja: null,
                town_name_kana: null,
                country_id: 153, // 日本
                region_id: null,
                city_id: 11,
                town_name_en: null,
                normalized_name: null,
              } as InsertTownType;
              transformedTownsData.push(newTownData);
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
            // combinedTownNamesOnly,
            // combinedTownNamesKanaOnly,
          };
        };

        const {
          transformedTownsData,
          combinedTownsDataArrayOnly,
          unfinishedRowCount,
          // combinedTownNamesOnly,
          // combinedTownNamesKanaOnly
        } = transformCombinedDataByMultipleEntries(uploadedData as UploadTownsCsvType[]);

        console.log(
          "前処理完了✅ Result: ",
          transformedTownsData,
          "処理前uploadedData",
          uploadedData,
          "処理適用ずみ行combinedTownsDataArrayOnly",
          combinedTownsDataArrayOnly,
          "未完結の行数unfinishedRowCount",
          unfinishedRowCount,
          "新たに統合して生成された行",
          combinedTownsDataArrayOnly.length,
          "削減された数量uploadedData.length - transformedTownsData.length",
          uploadedData.length - transformedTownsData.length
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

        setIsConfirmInsertModal(true);
      }
      // インサート済みの町域テーブルに英語名を追加
      if (insertTableType === "towns") {
        // パースした全ての行データに対して、町域テーブルにインサート可能な状態にデータを整形
      }
    } catch (error: any) {}
    setIsLoadingTransforming(false);
  };

  const handleStartTransformDataPreInsert = async () => {};

  // 🔸紐付け確認モーダルに渡してモーダル側で実行する
  const handleCompleteMappingColumns = () => {
    // ステップ3に移行
    setStep(3);

    setIsConfirmInsertModal(false);

    // データ前処理を実行
    handleStartTransformDataPreInsert();
  };
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
    "uploadedColumnFields",
    uploadedColumnFields,
    "selectedColumnFieldsArray",
    selectedColumnFieldsArray,
    "alreadySelectColumnsSetObj",
    alreadySelectColumnsSetObj
    // "remainingOptionsColumnFieldsArray",
    // remainingOptionsColumnFieldsArray
  );

  return (
    <>
      {/* モーダルオーバーレイ */}
      {<div className={`modal_overlay`} onClick={handleCancel} />}
      {isLoadingTransforming && (
        <div className={`flex-center fixed inset-0 z-[10000] h-screen w-screen bg-[00000020]`}>
          <SpinnerX />
        </div>
      )}

      {/* モーダルコンテナ */}
      <div ref={modalContainerRef} className={`${styles.modal_container} fade03 text-[var(--color-text-title)]`}>
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
                          if (infoIconStep2Ref.current && infoIconStep2Ref.current.classList.contains("animate_ping")) {
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
                </div>
              </div>

              <div className={`${styles.right_wrapper} flex h-full w-[40%] items-end justify-end space-x-[15px]`}>
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
                            <IoIosArrowRoundDown className={`stroke-[13px] text-[18px] text-[var(--color-text-sub)]`} />
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
          </div>
        </>

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
          withSelect={false}
          isOverlayBgBlack={true}
          clickEventClose={() => {
            setInsertCsvColumnNameToDBColumnMap(null);
          }}
          clickEventSubmit={startTransformData}
          marginTopP1={`15px`}
        />
      )}
      {/* ----------------------- 前処理確認モーダル ここまで ----------------------- */}
      {/* ----------------------- Insert確認モーダル ----------------------- */}
      {isConfirmInsertModal && (
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
          }}
          clickEventSubmit={handleCompleteMappingColumns}
          marginTopP1={`15px`}
        />
      )}
      {/* ----------------------- Insert確認モーダル ここまで ----------------------- */}
    </>
  );
};

export const ProviderImportModal = memo(ProviderImportModalMemo);
