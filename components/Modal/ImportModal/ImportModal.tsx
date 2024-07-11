import useDashboardStore from "@/store/useDashboardStore";
import { DragEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import styles from "./ImportModal.module.css";
import { SlCloudDownload, SlCloudUpload } from "react-icons/sl";
import useStore from "@/store";
import Papa from "papaparse";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";

import { FaCompress } from "react-icons/fa";
import { BiFullscreen } from "react-icons/bi";
import { BsCheck2, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { RiDragMove2Fill } from "react-icons/ri";
import { toast } from "react-toastify";
import { ConfirmationModal } from "@/components/DashboardCompanyComponent/Modal/SettingAccountModal/SettingCompany/ConfirmationModal/ConfirmationModal";
import {
  RegionNameJpType,
  mappingClientCompaniesFiledToNameForInsert,
  optionsClientCompaniesColumnFieldForInsertArray,
  requiredImportColumnOptionsSet,
} from "@/utils/selectOptions";
import { CustomSelectMapping } from "@/components/Parts/CustomSelectMapping/CustomSelectMapping";
import { IoIosArrowRoundDown } from "react-icons/io";
import { ImInfo } from "react-icons/im";
import { ConfirmationMappingModal } from "../ConfirmationModal/ConfirmationMappingModal/ConfirmationMappingModal";
import { DataProcessWorker } from "./DataProcessWorker/DataProcessWorker";
import { isPlainObject } from "@/utils/Helpers/isObjectPlain";
import { regExpPrefecture, regionNameToRegExpCitiesJp } from "@/utils/Helpers/AddressHelpers/regExpAddress";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ProgressCircleIncrement } from "@/components/Parts/Charts/ProgressCircle/ProgressCircleIncrement";
import { DotsLoaderBounceF } from "@/components/Parts/Loaders/LoaderDotsBounce/LoaderDotsBounce";
import { AnimeCheck, AnimeChecking, AnimeUploading } from "@/components/assets/Animations";

const ImportModalMemo = () => {
  const supabase = useSupabaseClient();
  const language = useStore((state) => state.language);
  const setIsOpenImportModal = useDashboardStore((state) => state.setIsOpenImportModal);

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

    setIsOpenImportModal(false);
  };
  const handleCloseModal = () => {
    setIsOpenImportModal(false);
    if (processingName !== null) setProcessingName(null);
    if (step !== 1) setStep(1);
  };
  // ----------------------------------------------
  // ---------------- 🌠Browse選択クリック🌠 ----------------
  const handleClickBrowseButton = () => {
    if (isConverting) return;
    console.log("Browseクリック");
    if (inputFileUploadRef.current) inputFileUploadRef.current.click();
  };
  // ----------------------------------------------

  const [step, setStep] = useState(1);
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
  // 🔸進捗状況 INSERT済みのチャンク数 / 総チャンク数
  const [progressProcessing, setProgressProcessing] = useState<number | null>(null);

  // 🔸現在の処理内容をユーザーに明示するためのstate
  const [processingName, setProcessingName] = useState<
    "fetching_address" | "transforming" | "bulk_inserting" | "complete" | null
  >(null);
  // >("complete");
  // 🔸会社リストの全ての住所で使用されている市区町村に対応した町域データのみを格納するstate: Workerに渡して使用
  type TownsByCitiesType = {
    town_id: string;
    normalized_name: string;
    postal_code: string;
    country_id: string;
    region_id: string;
    city_id: string;
    region_name_ja: RegionNameJpType;
    city_name_ja: string;
  };
  type GroupedTownsByRegionCity = { [K in RegionNameJpType]: { [key: string]: TownsByCitiesType[] } };
  const [groupedTownsByRegionCity, setGroupedTownsByRegionCity] = useState<GroupedTownsByRegionCity | null>(null);

  // 🔸CSVカラム名 to データベースカラム名
  const [insertCsvColumnNameToDBColumnMap, setInsertCsvColumnNameToDBColumnMap] = useState<Map<string, string> | null>(
    null
  );
  // 🔸Web Worker(バックグラウンドスレッド)でデータ前処理中
  const [isTransformProcessing, setIsTransformProcessing] = useState(false);
  // 🔸データ前処理完了後の一括インサート用データ
  const [transformProcessedData, setTransformProcessedData] = useState<any[]>([]);

  // -------------------------- ステップ3 「データ前処理」用state ここまで --------------------------

  // -------------------------- テスト --------------------------
  const [uploadPrefectures, setUploadPrefectures] = useState<any[]>([]);
  const [uploadCities, setUploadCities] = useState<any[]>([]);
  const [gotPrefectures, setGotPrefectures] = useState<any[]>([]);
  const [gotCities, setGotCities] = useState<any[]>([]);
  // -------------------------- テスト --------------------------

  // 🔸既に選択済みのカラムのSetオブジェクト 空文字は除去
  const alreadySelectColumnsSetObj = useMemo(() => {
    const setObj = new Set([...selectedColumnFieldsArray]);
    if (setObj.has("")) setObj.delete("");
    return setObj;
  }, [selectedColumnFieldsArray]);

  // 🔸空文字を加えたカラム選択肢
  const optionsColumnsForInsertWithEmpty = useMemo(() => {
    return ["", ...optionsClientCompaniesColumnFieldForInsertArray];
  }, []);
  // カラムの名称取得関数 空文字はスキップにして返す
  const getInsertColumnNames = (column: string) => {
    if (column === "") {
      return language === "ja" ? `スキップ` : `Skip`;
    } else {
      return mappingClientCompaniesFiledToNameForInsert[column][language];
    }
  };

  // INSERTで必須カラムの選択済み個数
  // not nullableのカラム: 「会社名、部署名、住所」の3個 => 部署名は選択していなかった場合は「.(ピリオド)」をプレイスホルダーでセットしてINSERTする（代表番号も経済産業省のリストが載せていないデータも多いため入れない。業種は一旦入れない）
  // const [selectedRequiredColumnCount, setSelectedRequiredColumnCount] = useState(0);
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

  // parse開始時点のisSmallの値が適用されてしまうため、parse実行以降でisSmallかどうかでトーストを表示するか否かを決める場合はuseEffectを使用する
  useEffect(() => {
    // ステップ1のCSV読み込み専用の処理
    if (step !== 1) return;
    // CSV読み込み完了時のみ
    if (isConverting) return;
    if (!isCompletedConvert) return;

    // ミニサイズの場合にはトーストを表示
    if (isSmallWindow && isCompletedConvert) {
      toast.success("CSVの読み込みが完了しました🌟");
    }
  }, [isCompletedConvert]);

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
  // 🔸紐付け確定ボタンクリックと同時にstep3に移行して全ての行データの保存するカラムに対応するデータ型へと変換するINSERT前処理を実行を実行
  // => 5MBを超える大きなファイルサイズはWorkerに依頼してバックグラウンドスレッドで行う
  // 【変換が必要なカラム】
  // 「-」は変換不要
  /**
   * id: -
   * created_at: -
   * updated_at: -
   * created_company_id: -
   * created_user_id: -
   * created_department_id: -
   * name: TEXT
   * department_name: TEXT => 入力されていない場合は「.」でピリオドを付与してINSERT
   * main_fax: TEXT
   * zipcode: TEXT => 「-」ハイフンを削除して数字のみ抽出 7桁のみか確認 7桁でない場合には住所から算出
   * address: TEXT => 都道府県、市区町村が入っているかチェック 数字は全角から半角へ変換 ・地区コードテーブルのid(数字)と紐付け
   * department_contacts: TEXT => 数字とハイフンと+(プラス)番号のみ許可
   * industry_large: TEXT => 業界(大分類)セールスフォース用 => セールスフォースの項目のSetオブジェクトでチェック
   * industry_small: TEXT => 業界(小分類)セールスフォース用 => 大分類が含まれていれば、小分類をチェック
   * industry_type_id: INTEGER => 業種 テーブル(ipros)の業種一覧にマッチする文字列なら対応する番号を付与 Setオブジェクトで確認
   * product_category_large: TEXT => 製品分類(大分類) それぞれの製品分類に類する特定の文字列を用意して、マッチしていれば
   */

  // 🔸紐付けを完了してデータ前処理へ移行
  const handleCompleteMappingColumnsAndStartTransformDataPreInsert = async (
    csvColumnNameToDBColumnMap: Map<string, string>
  ) => {
    // ユーザーのブラウザーがWeb Workerをサポートしているかチェックしてからデータ前処理を実行

    if (!csvColumnNameToDBColumnMap) return alert("紐付けデータが存在しません。エラー：IM02");

    if (window.Worker) {
      try {
        // 🔸ステップ3に移行
        setStep(3);

        // 🔸全国の住所データをフェッチングをユーザーに明示
        setProcessingName("fetching_address");

        // 進行状況を明示
        setProgressProcessing(0);

        console.log("-----------------------------------🌠-----------------------------------");
        performance.mark("fetch_towns_Start"); // 開始点
        const startTime = performance.now(); // 開始時間

        // 🔸addressフィールドに対応するcsvカラムヘッダーを取得
        const entryForCsvColumnAddress = Array.from(csvColumnNameToDBColumnMap.entries()).find(
          ([key, value]) => value === "address"
        );

        if (!entryForCsvColumnAddress) throw new Error(`住所カラムが存在しません。 エラー：IM03`);

        const [columnHeaderForAddress, addressField] = entryForCsvColumnAddress;

        // 🔸パースしたCSVデータから住所のみを抽出
        const addresses = uploadedData
          .map((row) => {
            if (isPlainObject(row) && Object.hasOwn(row, columnHeaderForAddress)) {
              return row[columnHeaderForAddress];
            }
            return null;
          })
          .filter((row) => !!row);

        console.log("🔸パースしたCSVデータから住所のみを抽出", addresses);

        // 🔸会社住所リストの全ての住所データから、今回の住所リストで使用されている都道府県と市区町村を特定してリストを作成
        const identifyRegionsAndCities = (addresses: string[]) => {
          const prefecturesSet: Set<RegionNameJpType> = new Set();
          const citiesSet: Set<string> = new Set();
          const filteredCitiesByPrefectures = {} as { [K in RegionNameJpType]: Set<string> };

          addresses.forEach((address) => {
            // 🔹都道府県を抽出
            const prefectureMatch = address.match(regExpPrefecture);
            if (prefectureMatch) {
              const prefecture = prefectureMatch[1] as RegionNameJpType;
              prefecturesSet.add(prefecture); // キャプチャグループではないためindexは0で文字列全体マッチ
              // 新たな都道府県ならキーを追加
              if (!Object.hasOwn(filteredCitiesByPrefectures, prefecture)) {
                filteredCitiesByPrefectures[prefecture] = new Set();
              }

              // 🔺マッチした都道府県に対応する市区町村の正規表現リストを取り出して、市区町村を抽出
              if (Object.hasOwn(regionNameToRegExpCitiesJp, prefecture)) {
                const regexCities = regionNameToRegExpCitiesJp[prefecture];
                // 市区町村を抽出
                const cityMatch = address.match(regexCities);
                if (cityMatch) {
                  const city = cityMatch[1];
                  citiesSet.add(city);

                  // 新たな市区町村ならSetに追加
                  if (!filteredCitiesByPrefectures[prefecture].has(city))
                    filteredCitiesByPrefectures[prefecture].add(city);
                }
              }
            }
          });

          return {
            prefectures: Array.from(prefecturesSet),
            cities: Array.from(citiesSet),
            filteredCitiesByPrefectures: filteredCitiesByPrefectures,
          };
        };

        const regionsCities = identifyRegionsAndCities(addresses);
        const { prefectures, cities, filteredCitiesByPrefectures } = regionsCities;

        console.log(
          "🔸住所リストで使用されている都道府県と市区町村を特定してリストを作成",
          regionsCities,
          "都道府県ごとの市区町村filteredCitiesByPrefectures",
          filteredCitiesByPrefectures
        );

        // 抽出した全住所リスト内で使用されている市区町村データに紐づく町域リストを取得

        // 都道府県内の町域データの最大数は北海道の8002件
        // 全ての市区町村内で町域データが多い市区町村順
        // 富山市：1146件、
        // 港区：970件、
        // 岐阜市：836件、
        // 上越市：754件、
        // 新宿区：695件、

        // 🔸市区町村リストに紐づく町域データを1000件ずつ取得 ('normalized_name', 'region_name', 'city_name')
        const fetchAllTownsByPrefecturesCities = async (
          prefectures: RegionNameJpType[],
          cities: string[],
          pageSize: number,
          totalCount: number
        ): Promise<GroupedTownsByRegionCity> => {
          let offset = 0;
          let allTowns: TownsByCitiesType[] = [];
          let hasNext = true;

          /* allTowns = {
                        北海道: {
                          札幌市中央区: [...],
                          札幌市北区: [...],
                          札幌市東区: [...],
                        },
                        青森: {...},
                        秋田: {...},
                        ...
                      }
           */

          // 🔸全てのtownデータを取得するまで、1000行ずつオフセットしながら取得
          while (hasNext) {
            const currentRange = offset + pageSize;
            console.log(`${offset}行目〜${currentRange}行目までリクエスト送信実行🔥, 目標取得数: ${totalCount}`);
            const { data: towns, error } = await supabase.rpc("select_filtered_towns_by_city_names", {
              _prefecture_names: prefectures,
              _city_names: cities,
              _offset: offset,
              _limit: pageSize,
            });

            if (error) {
              console.error("Error fetching towns: ", error);
              throw new Error("町域データを取得できませんでした。IM05");
              break;
            }

            // 取得した行をallTownsに追加
            allTowns.push(...towns);

            // 進行状況を更新
            const progress = Math.round((allTowns.length / totalCount) * 100);
            setProgressProcessing(100 <= progress ? 100 : progress);

            console.log(`取得成功✅ 達成率: ${progress}%, ${towns.length}行取得 現在の取得行数: ${allTowns.length}行`);

            if (towns.length < pageSize) {
              console.log(
                `要求した${pageSize}行よりも取得した行数(${towns.length})が下回っているため全て取得完了 リクエスト終了✅✅✅`
              );
              hasNext = false; // データがページサイズより少ない場合は終了
            } else {
              offset += pageSize; // 次のチャンクのデータを取得
            }

            await new Promise((resolve, reject) => setTimeout(resolve, 1000)); // 1秒間隔で次のリクエスト
          }

          console.log("✅✅✅全てのtownsリスト取得成功 allTowns: ", allTowns);

          // -------------------------- テスト --------------------------
          // 青森チェック
          const prefNames = allTowns.map((obj) => obj.region_name_ja);
          const prefNamesSet = new Set(prefNames);
          const _cityNames = allTowns.map((obj) => obj.city_name_ja);
          const _cityNamesSet = new Set(_cityNames);
          const excludesCities = cities.filter((cityName) => !_cityNamesSet.has(cityName));

          setGotPrefectures(Array.from(prefNamesSet));
          setGotCities(Array.from(_cityNamesSet));
          setUploadPrefectures(prefectures);
          setUploadCities(cities);
          console.log(
            "アップロードprefectures",
            prefectures,
            "prefNamesSet",
            prefNamesSet,
            "prefNames",
            prefNames,
            "アップロードcities",
            cities,
            "_cityNamesSet",
            _cityNamesSet,
            "取得結果に含まれていないアップロードcity",
            excludesCities,
            "_cityNames",
            _cityNames,
            "アップロードした都道府県ごとの市区町村filteredCitiesByPrefectures",
            filteredCitiesByPrefectures,
            "allTowns",
            allTowns
          );
          // -------------------------- テスト --------------------------

          // 🔸インポートする会社リストに必要な全てのtownsテーブルの町域データが取得後
          // 都道府県ごと、市区町村ごとに町域データをグループ化
          const groupedTownsData = (allTowns as TownsByCitiesType[]).reduce((acc, town) => {
            const { region_name_ja, city_name_ja, normalized_name } = town;
            // 都道府県グループ トップレベル 未挿入の都道府県名のプロパティの場合は新たにregion_name_jaをキーに追加
            if (!Object.hasOwn(acc, region_name_ja)) {
              acc[region_name_ja] = {};
            }
            // 市区町村 ネスト region_name_jaの都道府県名オブジェクト内で未挿入の市区町村名のプロパティの場合は新たにcity_name_jaをキーに追加
            if (!Object.hasOwn(acc[region_name_ja], city_name_ja)) {
              // keyが市区町村名のvalueはtownsのrowが配列に格納されるため空の配列をセット
              acc[region_name_ja][city_name_ja] = [];
            }
            acc[region_name_ja][city_name_ja].push(town);

            return acc;
          }, {} as { [K in RegionNameJpType]: { [key: string]: TownsByCitiesType[] } });

          return groupedTownsData;
        };

        // 🔸先に今回使用される市区町村名に紐づく町域データの合計数を取得する(進捗UI用)
        const { data: totalTownsCount, error: totalError } = await supabase.rpc("select_filtered_total_towns_count", {
          _prefecture_names: prefectures,
          _city_names: cities,
        });

        console.log("✅今回の取得合計数: ", totalTownsCount);

        if (totalError) {
          console.log("❌住所データの合計行数が見つかりませんでした。エラー: IM07");
          throw totalError;
        }

        // 🔸1000行ずつ取得し、抽出した市区町村名に対応する町域リストを全て取得
        // SupabaseダッシュボードのData API SettingsのMax rowsがデフォルトで1000になっている これはそのままにしておきmax_rowsに準じる形で取得する
        const _groupedTownsByRegionCity = await fetchAllTownsByPrefecturesCities(
          prefectures,
          cities,
          1000,
          totalTownsCount
        );

        if (!_groupedTownsByRegionCity) throw new Error("町域データが見つかりませんでした。IM06");

        console.log(
          "✅townsリストを都道府県ごと、市区町村ごとにグループ化したリスト取得成功: ",
          _groupedTownsByRegionCity
        );

        if (true) {
          // データベースから取得したグループから都道府県別に市区町村のキーがいくつあるか取得
          const groupedCitiesCountByPrefectures = Array.from(Object.entries(_groupedTownsByRegionCity)).map(
            ([key, value]) => {
              const citiesArray = Object.keys(value);
              return { [key]: citiesArray };
            }
          );
          console.log(
            "✅終了 _groupedTownsByRegionCity: ",
            _groupedTownsByRegionCity,
            "DBから取得した都道府県ごとの市区町村groupedCitiesCountByPrefectures",
            groupedCitiesCountByPrefectures,
            "アップロードした都道府県ごとの市区町村filteredCitiesByPrefectures",
            filteredCitiesByPrefectures,
            prefectures,
            cities,
            addresses
          );
          // console.log("✅groupedTownsData: ", _groupedTownsByRegionCity);
          setProgressProcessing(null); // 完了したため進捗を一度リセット
          setProcessingName("complete");

          performance.mark("fetch_towns_End"); // 開始点
          performance.measure("fetch_towns_Time", "fetch_towns_Start", "fetch_towns_End"); // 計測
          console.log("Measure Time: ", performance.getEntriesByName("fetch_towns_Time")[0].duration);
          performance.clearMarks();
          performance.clearMeasures("fetch_towns_Time");
          const endTime = performance.now(); // 終了時間
          console.log("Time: ", endTime - startTime, "ms");
          console.log("-----------------------------------🌠-----------------------------------");
          return;
        }

        setGroupedTownsByRegionCity(_groupedTownsByRegionCity); // townsリストを格納

        setProgressProcessing(null); // 完了したため進捗を一度リセット

        // 🔸プロセス内容をデータ前処理に移行
        setProcessingName("transforming");

        setIsTransformProcessing(true); // 🔸Web Workerを起動してデータ前処理を実行
      } catch (error: any) {
        console.error("❌町域リストプロセスエラーIM04：", error);
        alert("エラー：アップロードした会社リスト内で無効な住所が存在します。 IM04");
      }
    } else {
      alert("Your Browser doesn't support web workers.");
    }
  };

  // ------------------------------ 🌠紐付け確定🌠 ここまで ------------------------------
  // ------------------------------ 🌟step2🌟 ここまで ------------------------------

  // ------------------------------ 🌠ミニサイズ関連🌠 ------------------------------
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

  // 隠す
  const handleHide = () => {
    handleCloseTooltip();
    if (modalContainerRef.current) {
      modalContainerRef.current.style.transition = `width 0.3s ease, height 0.3s ease, max-width 0.3s ease, max-height 0.3s ease, top 0.3s ease, left 0.3s ease, right 0.3s ease`;
      modalContainerRef.current.style.left = smallHidePosition.left; // `unset`;
      modalContainerRef.current.style.right = smallHidePosition.right; // `30px`;

      setIsHide(true);

      setTimeout(() => {
        if (modalContainerRef.current) {
          modalContainerRef.current.style.transition = `width 0.3s ease, height 0.3s ease, max-width 0.3s ease, max-height 0.3s ease`;

          // modalContainerRef.current.removeEventListener("mousemove", handleDraggingDiv);

          // if (draggingRef.current) {
          //   draggingRef.current.style.cursor = `grab`;
          // }
        }
      }, 400);
    }
  };
  // 現す
  const handleShow = () => {
    handleCloseTooltip();
    if (modalContainerRef.current) {
      modalContainerRef.current.style.transition = `width 0.3s ease, height 0.3s ease, max-width 0.3s ease, max-height 0.3s ease, top 0.3s ease, left 0.3s ease, right 0.3s ease`;
      modalContainerRef.current.style.left = smallInitialPosition.left; // `unset`;
      modalContainerRef.current.style.right = smallInitialPosition.right; // `30px`;

      setIsHide(false);

      setTimeout(() => {
        if (modalContainerRef.current) {
          modalContainerRef.current.style.transition = `width 0.3s ease, height 0.3s ease, max-width 0.3s ease, max-height 0.3s ease`;

          // modalContainerRef.current.removeEventListener("mousemove", handleDraggingDiv);

          // if (draggingRef.current) {
          //   draggingRef.current.style.cursor = `grab`;
          // }
        }
      }, 400);
    }
  };

  // -------------------- 小窓状態の時にドラッグで移動させる --------------------
  const draggingRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  const handleDraggingDiv = (e: MouseEvent) => {
    // ドラッグ状態でなければ何もしない
    if (!isDraggingRef.current) return;
    // // isHideの時はリターン
    // if (isHide) {
    //   return;
    // }

    if (!modalContainerRef.current) return;

    let getStyleContainer = window.getComputedStyle(modalContainerRef.current);

    let containerLeft = parseInt(getStyleContainer.left, 10);
    let containerTop = parseInt(getStyleContainer.top, 10);

    console.log("Dragging");

    modalContainerRef.current.style.left = `${containerLeft + e.movementX}px`;
    modalContainerRef.current.style.top = `${containerTop + e.movementY}px`;
  };

  const handleMouseDownDiv = useCallback(() => {
    // isHideの時にはリターン useCallbackを使用していて作成した関数をremoveEventListenerに指定する必要があるため新たな関数に再生成されないようにするためここでは記述しない

    // ドラッグを開始
    isDraggingRef.current = true;

    console.log("🔥🔥🔥🔥🔥Mouse Down");
    if (modalContainerRef.current) {
      modalContainerRef.current.addEventListener("mousemove", handleDraggingDiv);
    }
    if (draggingRef.current) {
      draggingRef.current.style.cursor = `grabbing`;
    }
  }, [modalContainerRef.current, draggingRef.current]);
  // }, []);

  const removeEvent = useCallback(() => {
    if (!modalContainerRef.current) return;

    modalContainerRef.current.removeEventListener("mousemove", handleDraggingDiv);

    console.log("✅✅✅✅✅Mouse Up");

    // 画面ギリギリになったら元の位置に戻す
    const { top, left, right } = modalContainerRef.current.getBoundingClientRect();
    if (left < -200 || window.innerWidth + 260 < right || top < -70 || window.innerHeight - 30 < top) {
      console.log("⚠️元に戻す", top, left);
      modalContainerRef.current.style.left = smallInitialPosition.left;
      modalContainerRef.current.style.top = smallInitialPosition.top;
    }

    // ドラッグを終了
    isDraggingRef.current = false;
  }, [handleMouseDownDiv]);

  useEffect(() => {
    if (!isSmallWindow) return;

    if (modalContainerRef.current) {
      // グローバルでMouseUpイベントを付与してどこでもマウスアップしたらremoveEventされるようにする
      document.addEventListener("mouseup", removeEvent);
    }

    // クリーンアップ
    return () => {
      console.log("✅✅✅✅✅✅✅クリーンアップMouse Up");
      document.removeEventListener("mouseup", removeEvent);
    };
  }, [isSmallWindow]);
  // -------------------- 小窓状態の時にドラッグで移動させる --------------------

  // ------------------------------ 🌠ミニサイズ関連🌠 ここまで ------------------------------

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
      if (2 <= selectedRequiredColumnCount) {
        return activeStyle;
      } else {
        return inactiveStyle;
      }
    }
    if (step === 3) {
      // 必須カラム選択数が4に到達したらアクティブにする 会社名と住所の2つを含んでいたらアクティブに変更
      if (processingName === "complete") {
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
    "ImportModalレンダリング",
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
      {!isSmallWindow && <div className={`modal_overlay`} onClick={handleCancel} />}

      {/* モーダルコンテナ */}
      <div
        ref={modalContainerRef}
        className={`${styles.modal_container} fade03 text-[var(--color-text-title)] ${
          isSmallWindow ? `${styles.small}` : ``
        }`}
      >
        {/* <button
          className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
          onClick={handleCancel}
        >
          <MdClose className="text-[20px] text-[#fff]" />
        </button> */}
        <button
          type="button"
          className={`flex-center absolute z-[100]  h-[32px] w-[32px] cursor-pointer rounded-full hover:text-[#999] ${
            isSmallWindow ? `right-[15px] top-[10px] text-[18px]` : `right-[24px] top-[22px] text-[24px]`
          }`}
          onMouseEnter={(e) => {
            if (!isSmallWindow) return;
            if (isDraggingRef.current) return;
            handleOpenTooltip({
              e: e,
              display: "top",
              content: `サイズを戻す`,
              itemsPosition: "left",
              // marginTop: 0,
            });
          }}
          onMouseLeave={handleCloseTooltip}
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
        {/* ---------------------- Draggable Overlay 最小化時に使用 ---------------------- */}
        {/* ドラッグ用 */}
        <div
          ref={draggingRef}
          className={`absolute left-0 top-[1px] z-[10] hidden h-[calc(100%-2px)] w-[80%] cursor-grab rounded-l-[9px]  active:cursor-grabbing`}
          style={{
            ...(isSmallWindow && { display: `block` }),
            ...(isHide && { cursor: "default", pointerEvents: "none" }),
          }}
          onMouseDown={() => {
            if (!isSmallWindow) return;
            if (isHide) {
            } else {
              handleMouseDownDiv();
              handleCloseTooltip();
            }
          }}
          onMouseUp={() => {
            if (isHide) {
              // mouseUpDivReset();
            } else {
              removeEvent();
              if (draggingRef.current) {
                draggingRef.current.style.cursor = `grab`;
              }
            }
          }}
        >
          <div className="flex flex-col">
            <div className="flex h-[33px] w-[130px] items-end pl-[15px]">
              <div
                className="flex w-max"
                onMouseEnter={(e) => {
                  if (isHide) return;
                  if (isDraggingRef.current) return;
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `ドラッグで位置を移動`,
                    itemsPosition: "left",
                    // marginTop: 18,
                  });
                }}
                onMouseLeave={handleCloseTooltip}
              >
                <div className="mr-[6px] h-full w-[87px]"></div>
                <div className="z-[80] h-[18px] w-[18px]"></div>
              </div>
            </div>
            <div className="h-[65px] w-full"></div>
          </div>
        </div>
        {/* ドラッグ用 */}
        {/* 背景色用 */}
        <div
          className={`pointer-events-none absolute left-[1px] top-[1px] z-[3] hidden h-[calc(100%-2px)] w-[80%] rounded-[9px] border-r border-solid border-[var(--color-border-light)] bg-[var(--color-modal-solid-bg)]`}
          style={{
            ...(isSmallWindow && { display: `block` }),
          }}
        ></div>
        {/* 背景色用 */}
        {/* ---------------------- Draggable Overlay 最小化時に使用 ここまで ---------------------- */}

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
                        {processingName === "fetching_address" && <span>{`CSVデータ変換処理の準備中...`}</span>}
                        {processingName === "transforming" && <span>{`CSVデータ変換処理中...`}</span>}
                        {processingName === "bulk_inserting" && <span>{`CSVデータインポート中...`}</span>}
                        {processingName === "complete" && <span>{`CSVデータインポート完了`}</span>}
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
                        {processingName === "fetching_address" && <span>{`住所データ取得しています...`}</span>}
                        {processingName === "transforming" && isTransformProcessing && (
                          <span>{`アップロードしたCSVデータをデータベースへインポート可能な形式に変換処理中...`}</span>
                        )}
                        {processingName === "bulk_inserting" && (
                          <span>{`アップロードしたCSVデータをデータベースへインポート中...`}</span>
                        )}
                        {processingName === "complete" && (
                          <span>{`CSVデータからデータベースへのインポートが完了しました！🌠`}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className={`${styles.right_wrapper} flex h-full w-[40%] items-end justify-end space-x-[15px]`}>
                  {/* <button
                    type="button"
                    className={`transition-bg02 flex-center brand_btn_active space-x-[5px] rounded-[6px] px-[12px] py-[5px] text-[12px]`}
                    style={{
                      transition: `background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease width 0.2s ease`,
                    }}
                    onClick={async () => {
                      const testProgress = async () => {
                        setProcessingName("fetching_address");
                        for (let i = 0; i <= 100; i += 5) {
                          setProgressProcessing(i);
                          console.log("progress: ", i);

                          await new Promise((resolve, reject) => setTimeout(resolve, 1000));
                        }

                        setProgressProcessing(null);
                        setProcessingName(null);
                      };
                      const testAnime = async () => {
                        setProcessingName("fetching_address");
                        for (let i = 0; i <= 100; i += 10) {
                          setProgressProcessing(i);
                          console.log("progress: ", i);

                          await new Promise((resolve, reject) => setTimeout(resolve, 1000));
                        }
                        setProgressProcessing(null);

                        // 🔸LottieAnimeのみ ❌フリーズ 3回〜4回目
                        setProcessingName("transforming");
                        await new Promise((resolve, reject) => setTimeout(resolve, 5000));
                        setProcessingName("bulk_inserting");
                        await new Promise((resolve, reject) => setTimeout(resolve, 5000));
                        setProcessingName("complete");
                        await new Promise((resolve, reject) => setTimeout(resolve, 5000));

                        // 🔸LottieAnimeのみ
                        // setProcessingName("transforming");
                        // await new Promise((resolve, reject) => setTimeout(resolve, 5000));
                        // setProcessingName("bulk_inserting");
                        // await new Promise((resolve, reject) => setTimeout(resolve, 5000));
                        // setProcessingName("transforming");
                        // await new Promise((resolve, reject) => setTimeout(resolve, 5000));
                        // setProcessingName("bulk_inserting");
                        // await new Promise((resolve, reject) => setTimeout(resolve, 5000));

                        setProcessingName(null);
                      };

                      // testProgress();
                      testAnime();
                    }}
                  >
                    ロード
                  </button> */}
                  <div
                    className={`transition-bg02 flex-center basic_btn space-x-[5px] rounded-[6px] px-[12px] py-[5px] text-[12px]`}
                    // text-[#b9b9b9]
                    onClick={() => {
                      handleCloseTooltip();
                      handleSwitchSize(!isSmallWindow);
                    }}
                    onMouseEnter={(e) => {
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: `インポート画面を小さくする`,
                        itemsPosition: "left",
                        // marginTop: 9,
                      });
                    }}
                    onMouseLeave={handleCloseTooltip}
                  >
                    {isSmallWindow ? (
                      <BiFullscreen className="pointer-events-none" />
                    ) : (
                      <FaCompress className="pointer-events-none" />
                    )}
                    <span>ミニサイズ</span>
                  </div>
                  <div
                    ref={stepBtnRef}
                    className={`transition-bg02 flex-center space-x-[5px] rounded-[6px] px-[12px] py-[5px] text-[12px] ${getNextBtnStyle(
                      step
                    )}`}
                    style={{
                      transition: `background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease width 0.2s ease`,
                    }}
                    onMouseEnter={(e) => {
                      if (step === 3) return;
                      let tooltipContent = ``;
                      if (step === 2) {
                        if (selectedRequiredColumnCount < 2) tooltipContent = `未選択の必須項目があります`;
                        if (2 <= selectedRequiredColumnCount) tooltipContent = `紐付け設定を完了する`;
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
                      if (step === 3) return;
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
                        if (selectedRequiredColumnCount < 2)
                          return alert(
                            "紐付け必須の項目名が選択されていません。紐付け必須項目は「会社名・住所」の2つです。\nCSVファイルの項目とデータベース用の項目を選択肢から選んで紐付けしてください。\nデータベース用の項目に存在しない項目は「スキップ」でデータベースに保存しないか、代わりとなる項目を選択してください。"
                          );

                        // 前処理を実行する前に本当に現在のカラム内容でINSERTして良いかアラームで確認
                        setIsMappingConfirmationModal(true);
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
                    {step === 2 && <span>次へ ({`${selectedRequiredColumnCount} / 2`})</span>}
                    {step === 3 && (
                      <>
                        {processingName !== "complete" && <span>次へ</span>}
                        {processingName === "complete" && <span>閉じる</span>}
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
                        {/* <BsCheck2 className="fade08_forward pointer-events-none stroke-1 text-[120px] text-[var(--bright-green)]" /> */}
                        <AnimeCheck />
                      </div>
                      <h2 className={`mt-[-30px] flex flex-col items-center text-[16px] text-[var(--color-text-sub)]`}>
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
                          {<AnimeChecking /> ?? <SpinnerX />}
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
              {/* -------------------------- step3 データ前処理 Web Worker -------------------------- */}
              {step === 3 && (
                <>
                  <div
                    className={`${styles.file_upload_box_container} flex-col-center mb-[24px] h-full w-full bg-[var(--color-modal-solid-bg-main)] p-[12px]`}
                  >
                    {processingName === "fetching_address" && (
                      <>
                        {progressProcessing !== null && (
                          <div className={`flex-col-center relative space-y-[10px]`}>
                            <ProgressCircleIncrement
                              circleId={`csv_bulk_insert`}
                              textId={`csv_bulk_insert`}
                              progress={progressProcessing}
                              startProgress={progressProcessing}
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
                        <div className={`flex-col-center mb-[5px] mr-[-2px] mt-[13px] min-w-[45px]`}>
                          <p ref={convertingTextRef} className={`text-[16px] text-[var(--color-text-sub)]`}>
                            チェック・変換処理の準備中...
                          </p>
                        </div>
                        <div className="flex-center mb-[-10px] pl-[2px]">
                          <DotsLoaderBounceF shadow={`unset`} />
                        </div>
                      </>
                    )}
                    {processingName === "transforming" && (
                      <>
                        {<AnimeChecking /> ?? <SpinnerX />}
                        <div className={`flex-col-center mr-[-2px] flex min-w-[45px]`}>
                          <p ref={convertingTextRef} className={`text-[16px] text-[var(--color-text-sub)]`}>
                            CSVデータのチェック・変換処理中...
                          </p>
                          <p className={`text-[16px] text-[var(--color-text-sub)]`}>しばらくお待ちください。</p>
                        </div>
                      </>
                    )}
                    {/* {true && ( */}
                    {processingName === "bulk_inserting" && (
                      <>
                        {<AnimeUploading /> ?? <SpinnerX />}
                        <div className={`flex-col-center mr-[-2px] flex min-w-[45px]`}>
                          <p ref={convertingTextRef} className={`text-[16px] text-[var(--color-text-sub)]`}>
                            CSVデータをインポート中...
                          </p>
                          <p className={`text-[16px] text-[var(--color-text-sub)]`}>しばらくお待ちください。</p>
                        </div>
                      </>
                    )}
                    {processingName === "complete" && (
                      <>
                        <div className={`${styles.file_upload_box} flex-center h-full w-full flex-col`}>
                          <div className={`mb-[6px] mt-[-60px]`}>
                            {/* <BsCheck2 className="fade08_forward pointer-events-none stroke-1 text-[120px] text-[var(--bright-green)]" /> */}
                            <AnimeCheck />
                          </div>
                          <h2
                            className={`mt-[-30px] flex flex-col items-center text-[16px] text-[var(--color-text-sub)]`}
                          >
                            <span>{language === "ja" ? "CSVデータのインポートが完了しました！" : ``}</span>
                            <div
                              className={`transition-bg02 brand_btn_active flex-center mb-[-13px] mt-[13px] space-x-[5px] rounded-[6px] px-[12px] py-[5px] text-[15px]`}
                              onClick={handleCloseModal}
                            >
                              <span>閉じる</span>
                            </div>
                          </h2>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
              {/* -------------------------- step3 データ前処理 Web Worker ここまで -------------------------- */}
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
                {!isHide && (
                  <div className={`mr-[0px] flex min-w-max items-center space-x-[6px] text-[12px] font-bold`}>
                    <span>CSVインポート</span>
                    <div
                      className={`flex-center h-[18px] max-h-[18px] w-[18px] max-w-[18px] rounded-full`}
                      style={{ boxShadow: `0 0 0 1px var(--main-color-f)` }}
                    >
                      <RiDragMove2Fill className={`text-[15px] text-[var(--main-color-f)]`} />
                    </div>
                  </div>
                )}
                {isHide && (
                  <div
                    className={`z-[30] flex max-h-[18px] w-full cursor-pointer hover:text-[#999]`}
                    onClick={handleShow}
                    onMouseEnter={(e) => {
                      if (isDraggingRef.current) return;
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: `元の位置に戻す`,
                        itemsPosition: "left",
                        // marginTop: 18,
                      });
                    }}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <BsChevronLeft className="z-1 mr-[6px] stroke-[0.5] text-[15px]" />
                  </div>
                )}
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
                  {/* ミニサイズ */}
                  {/* {true && ( */}
                  {step === 3 && (
                    <>
                      {processingName === "complete" && (
                        <>
                          <BsCheck2 className="pointer-events-none min-h-[18px] min-w-[24px] stroke-1 text-[24px] text-[var(--bright-green)]" />
                          <div className={`ml-[15px] flex min-w-max items-center`}>
                            <p ref={convertingTextRef} className={`text-[13px] text-[var(--color-text-sub)]`}>
                              読み込み完了
                            </p>
                          </div>
                        </>
                      )}
                      {processingName !== "complete" && (
                        <>
                          <SpinnerX h="h-[24px]" w="w-[24px]" />
                          <div className={`ml-[15px] flex min-w-max items-center`}>
                            <p ref={convertingTextRef} className={`text-[13px] text-[var(--color-text-sub)]`}>
                              変換処理中
                            </p>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                <div className={`flex h-full items-center`}>
                  <div
                    className="z-[30] mr-[6px]  cursor-pointer hover:text-[#999]"
                    onClick={handleHide}
                    onMouseEnter={(e) => {
                      if (isDraggingRef.current) return;
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: `画面外に移動する`,
                        itemsPosition: "left",
                        // marginTop: 18,
                      });
                    }}
                    onMouseLeave={handleCloseTooltip}
                  >
                    <BsChevronRight className="stroke-[0.5] text-[15px]" />
                  </div>

                  {/* <BsChevronLeft className="z-1 absolute  left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" /> */}
                </div>
              </div>
            </div>
            {/* ----------------------- メインコンテナ ここまで ----------------------- */}
          </>
        )}
        {/* ------------------------------------ ミニサイズVer ------------------------------------ */}
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
      {/* ----------------------- step2 紐付け設定完了確認モーダル ----------------------- */}
      {isOpenMappingConfirmationModal && (
        <ConfirmationMappingModal
          submitText="紐付けを確定して次へ"
          cancelText="戻る"
          clickEventClose={() => {
            setIsMappingConfirmationModal(false);
          }}
          clickEventSubmit={() => {
            // 選択されているindexを取り出す => selectedColumnFieldsArrayから空文字でないindexのみのSetオブジェクトを作成
            const selectedIndexesArray = selectedColumnFieldsArray
              .map((column, index) => (column !== "" ? index : null))
              .filter((num): num is number => num !== null);
            // InsertするCsvデータのカラム名 to データベースのカラム名 のMapオブジェクトを作成
            const _insertCsvColumnNameToDBColumnMap = new Map(
              selectedIndexesArray.map((i) => [uploadedColumnFields[i], selectedColumnFieldsArray[i]])
            );
            // アップロードされたCSVデータから選択されたindexのみのカラムに絞ったデータを抽出
            // const uploadCsvDataOnlySelectedColumns =
            console.log(
              "selectedIndexesArray",
              selectedIndexesArray,
              "_insertCsvColumnNameToDBColumnMap",
              _insertCsvColumnNameToDBColumnMap,
              "uploadedData",
              uploadedData
            );
            setInsertCsvColumnNameToDBColumnMap(_insertCsvColumnNameToDBColumnMap);

            handleCompleteMappingColumnsAndStartTransformDataPreInsert(_insertCsvColumnNameToDBColumnMap);

            setIsMappingConfirmationModal(false);
          }}
          buttonColor="brand"
          zIndexModal="3000px"
          zIndexOverlay="2800px"
          handleOpenTooltip={handleOpenTooltip}
          handleCloseTooltip={handleCloseTooltip}
          uploadedColumnFields={uploadedColumnFields}
          selectedColumnFieldsArray={selectedColumnFieldsArray}
          alreadySelectColumnsSetObj={alreadySelectColumnsSetObj}
          skipCount={selectedColumnFieldsArray.length - alreadySelectColumnsSetObj.size}
          formattedUploadedRowCount={formattedUploadedRowCount}
          getInsertColumnNames={getInsertColumnNames}
        />
      )}
      {/* ----------------------- step2 紐付け設定完了確認モーダル ここまで ----------------------- */}

      {/* ----------------------- step3 データ前処理Web Workerコンポーネント起動 ----------------------- */}
      {step === 3 &&
        isTransformProcessing &&
        !!uploadedData.length &&
        insertCsvColumnNameToDBColumnMap !== null &&
        groupedTownsByRegionCity && (
          <DataProcessWorker
            parsedData={uploadedData}
            columnMap={insertCsvColumnNameToDBColumnMap}
            setIsTransformProcessing={setIsTransformProcessing}
            setProcessedData={setTransformProcessedData}
            groupedTownsByRegionCity={groupedTownsByRegionCity}
          />
        )}
      {/* ----------------------- step3 データ前処理Web Workerコンポーネント起動 ここまで ----------------------- */}
    </>
  );
};

export const ImportModal = memo(ImportModalMemo);
