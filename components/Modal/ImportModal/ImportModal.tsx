import useDashboardStore from "@/store/useDashboardStore";
import { DragEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import styles from "./ImportModal.module.css";
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
import {
  mappingClientCompaniesFiledToNameForInsert,
  optionsClientCompaniesColumnFieldForInsertArray,
} from "@/utils/selectOptions";
import { columnNameToJapanese } from "@/utils/columnNameToJapanese";
import { CustomSelectMapping } from "@/components/Parts/CustomSelectMapping/CustomSelectMapping";

const ImportModalMemo = () => {
  const language = useStore((state) => state.language);
  const setIsOpenImportModal = useDashboardStore((state) => state.setIsOpenImportModal);

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
  // INSERTで必須カラムの選択済み個数
  // not nullableのカラム: 「会社名、部署名、住所」の3個 => 部署名は選択していなかった場合は「.(ピリオド)」をプレイスホルダーでセットしてINSERTする（代表番号も経済産業省のリストが載せていないデータも多いため入れない。業種は一旦入れない）
  const [selectedRequiredColumnCount, setSelectedRequiredColumnCount] = useState(0);

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
  };
  // ----------------------------------------------
  // ---------------- 🌠Browse選択クリック🌠 ----------------
  const handleClickBrowseButton = () => {
    if (isConverting) return;
    console.log("Browseクリック");
    if (inputFileUploadRef.current) inputFileUploadRef.current.click();
  };
  // ----------------------------------------------

  // 🔸パース後のCSVデータ配列 result.data
  // => 1000以上は10000個ずつの配列を配列に格納した出力される:
  // [[]] => [0...9999] => [[0...99], [100...199], [200...299], ..., [9900...9999]]
  // => 1000未満は
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  // 🔸パース後のCSVヘッダーカラム配列
  const [uploadedColumnFields, setUploadedColumnFields] = useState<string[]>([]);
  // 🔸アップロードファイル名
  const [uploadedCSVFile, setUploadedCSVFile] = useState<File | null>(null);
  // --------- ステップ2用state ---------
  // 🔸gridテーブルの各カラムで選択中のDB用フィールド
  const [selectedColumnFieldsArray, setSelectedColumnFieldsArray] = useState<string[]>([]);
  // 🔸テーブルに展開するための最初の5行
  const [uploadedRowList, setUploadedRowList] = useState<any[]>([]);
  // --------- ステップ2用state ここまで ---------

  // 🔸既に選択済みのカラムのSetオブジェクト 空文字は除去
  const alreadySelectColumnsSetObj = useMemo(() => {
    const setObj = new Set([...selectedColumnFieldsArray]);
    if (setObj.has("")) setObj.delete("");
    return setObj;
  }, [selectedColumnFieldsArray]);

  // 空文字を加えたカラム選択肢
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

  // 🔸選択肢から選択するごとに既に選択された選択肢は取り除いていく
  // const remainingOptionsColumnFieldsArray = useMemo(() => {
  //   const remainingOptions = optionsClientCompaniesColumnFieldForInsertArray.filter(
  //     (column) => !alreadySelectColumnsSetObj.has(column)
  //   );
  //   return remainingOptions;
  // }, [alreadySelectColumnsSetObj]);

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
          setUploadedRowList(newRowListForDisplay);

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

  // --------------- 🌠ファイルを選択 or ファイルをドロップ CSV読み込み🌠 ---------------

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

  // --------------- 🌠ドラッグ&ドロップ🌠 ここまで ---------------

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

  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    e: React.MouseEvent<HTMLDivElement | HTMLSpanElement, globalThis.MouseEvent>;
    // e: MouseEvent;
    display: string;
    content: string;
    content2?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    marginTop = 0,
    itemsPosition = "center",
  }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);

    setHoveredItemPos({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: content,
      content2: content2,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    if (hoveredItemPos) setHoveredItemPos(null);
  };
  // ==================================================================================

  const getProgressLineStyle = (num: number) => {
    return step === num
      ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
      : `border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)] text-[var(--color-text-sub)]`;
  };

  const getNextBtnStyle = (step: number) => {
    const activeStyle = `brand_btn_active`;
    const inactiveStyle = `bg-[var(--color-bg-brand-f-disabled)] cursor-not-allowed text-[var(--color-text-disabled-on-brand)]`;
    if (step === 2) {
      // 必須カラム選択数が4に到達したらアクティブにする
      if (4 <= selectedRequiredColumnCount) {
        return activeStyle;
      } else {
        return inactiveStyle;
      }
    }
    return activeStyle;
  };

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
  const tableColumnWidth = 180;

  const modalPosition = useMemo(() => {
    if (!modalContainerRef.current) return null;
    const { x, y } = modalContainerRef.current.getBoundingClientRect();
    return { x, y };
  }, [modalContainerRef.current]);

  console.log(
    "ImportModalレンダリング",
    modalHeight,
    "uploadedRowList",
    uploadedRowList,
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
              marginTop: 0,
              itemsPosition: "left",
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
                    marginTop: 18,
                    itemsPosition: "left",
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
                <div className={`mr-[20px] min-w-max text-[24px] font-bold`}>
                  <span>CSVインポート</span>
                </div>
                <div className="relative flex h-[25px] w-full items-center">
                  {/* プログレスライン */}
                  <div className="absolute left-0 top-[50%] z-[-1] h-[1px] w-[105px] bg-[var(--color-progress-bg)]"></div>
                  {/* ○ */}
                  <div
                    className={`flex-center mr-[15px] h-[25px] w-[25px] cursor-pointer rounded-full border border-solid ${getProgressLineStyle(
                      1
                    )}`}
                  >
                    <span className={`text-[12px] font-bold`}>1</span>
                  </div>
                  {/* ○ */}
                  <div
                    className={`flex-center text-[var(--color-text-sub)]} mr-[15px] h-[25px] w-[25px] cursor-not-allowed rounded-full border border-solid ${getProgressLineStyle(
                      2
                    )}`}
                  >
                    <span className={`text-[12px] font-bold`}>2</span>
                  </div>
                  {/* ○ */}
                  <div
                    className={`flex-center text-[var(--color-text-sub)]} mr-[15px] h-[25px] w-[25px] cursor-not-allowed rounded-full border border-solid ${getProgressLineStyle(
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
                      </>
                    )}
                  </div>
                  <div className={`mt-[6px] flex whitespace-pre-wrap text-[13px] text-[var(--color-text-sub)]`}>
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
                        marginTop: 9,
                        itemsPosition: "left",
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
                    onClick={() => {
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
                        if (selectedRequiredColumnCount < 4)
                          return alert(
                            "紐付け必須の項目名が選択されていません。紐付け必須項目は「会社名・住所」の2つです。\nCSVファイルの項目とデータベース用の項目を選択肢から選んで紐付けしてください。\nデータベース用の項目に存在しない項目は「スキップ」でデータベースに保存しないか、代わりとなる項目を選択してください。"
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
                        <span>次へ ({`${selectedRequiredColumnCount} / 4`})</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* ----------------------- 保存・タイトル・キャンセルエリア ここまで ----------------------- */}
            {/* ----------------------- メインコンテナ ----------------------- */}
            <div
              className={`${styles.contents_container} fade08_forward flex h-full w-full flex-col rounded-b-[9px] px-[24px] pb-[2px]`}
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
                          {/* <SpinnerX /> */}
                          {/* {CheckingAnimeView ?? <SpinnerX />} */}
                          {<CheckingAnime /> ?? <SpinnerX />}
                          <div className={`mr-[-2px] flex min-w-[45px] items-center`}>
                            <p ref={convertingTextRef} className={`text-[16px] text-[var(--color-text-sub)]`}>
                              読み込み中
                            </p>
                            {/* <p ref={convertingTextRef} className={`mt-[10px] text-[13px] text-[var(--color-text-sub)]`}>
                      変換中
                    </p> */}
                          </div>
                        </>
                      )}
                      {!isConverting && (
                        <>
                          <div ref={uploadIconRef} className={`${styles.upload_icon}`}>
                            <SlCloudUpload />
                            {/* <SlCloudDownload /> */}
                          </div>
                          <div ref={dropIconRef} className={`${styles.drop_icon}`}>
                            {/* <BsCloudArrowDown /> */}
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
                    ...(modalHeight && { maxHeight: `${modalHeight - 1 - 156 - 4}px` }),
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
                        {/* <span
                          className={`absolute left-[50%] top-[calc(100%)] min-w-max translate-x-[-50%] text-[9px]`}
                        >
                          (ヘッダーを除く)
                        </span> */}
                      </div>
                      <div className="mr-[6px] flex">
                        <span>：</span>
                      </div>
                      <div className="flex">
                        <span>{uploadedData.length}件</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex font-bold">
                        <span>ヘッダー項目数</span>
                      </div>
                      <div className="mr-[6px] flex">
                        <span>：</span>
                      </div>
                      <div className="flex">
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
                      <div className="flex">
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
                        gridTemplateRows: `${tableColumnHeaderRowHeight}px repeat(${uploadedRowList.length}, minmax(max-content, ${tableRowHeight}px))`,
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
                          gridTemplateColumns: `repeat(${uploadedColumnFields.length}, minmax(max-content, ${tableColumnWidth}px))`,
                        }}
                      >
                        {uploadedColumnFields.map((fieldName, colIndex) => {
                          return (
                            <div
                              key={`mapping_table_columnheader_${colIndex}`}
                              role="columnheader"
                              className={`${styles.column_header} flex flex-col items-start justify-center`}
                              style={{
                                gridColumnStart: colIndex + 1,
                                // borderRight: `1px solid var(--color-border-light)`,
                              }}
                            >
                              <div className={`${styles.csv_field_name_box} flex w-max flex-col pl-[7px]`}>
                                <div
                                  className={`min-w-max`}
                                  // cellのpadding-x: 12px, fieldName-boxのpl: 7px
                                  style={{ maxWidth: `${tableColumnWidth - 12 - 12 - 7}px` }}
                                >
                                  {/* <span>CSVの項目</span> */}

                                  <span>{fieldName}</span>
                                </div>
                                <div className="flex-center min-h-[24px] w-full">
                                  <span>↓</span>
                                </div>
                              </div>
                              {/* <span>データベース項目</span> */}
                              {/* <span>{mappingClientCompaniesFiledToNameForInsert[fieldName][language]}</span> */}
                              {/* <select
                                className={`h-full max-h-[30px] w-full min-w-max max-w-max cursor-pointer ${styles.select_box}`}
                                value={selectedColumnFieldsArray[colIndex]}
                                onChange={(e) => {
                                  setSelectedColumnFieldsArray((prev) => {
                                    const updatedArray = [...prev];
                                    updatedArray[colIndex] = e.target.value;
                                    return updatedArray;
                                  });
                                }}
                              >
                                <option value="">スキップ</option>
                                {remainingOptionsColumnFieldsArray.map((field) => (
                                  <option key={field} value={field}>
                                    {mappingClientCompaniesFiledToNameForInsert[field][language]}
                                  </option>
                                ))}
                              </select> */}
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
                                maxWidth={tableColumnWidth - 12 - 12}
                                bgDark
                                isSelectedActiveColor
                                activeColor="var(--color-active-fg)"
                              />
                            </div>
                          );
                        })}
                      </div>
                      {/* --------------- ヘッダー --------------- */}

                      {/* --------------- rowgroup --------------- */}
                      {uploadedRowList.map((row, rowIndex) => {
                        return (
                          <div
                            key={`mapping_table_datalist_${rowIndex}`}
                            role="row"
                            className={`${styles.row} ${styles.content_row}`}
                            style={{
                              gridRowStart: rowIndex + 2,
                              gridTemplateColumns: `repeat(${uploadedColumnFields.length}, minmax(max-content, ${tableColumnWidth}px))`,
                            }}
                          >
                            {uploadedColumnFields.map((fieldName, colIndex) => {
                              const value = Object.keys(row).includes(fieldName) ? row[fieldName] : `-`;
                              return (
                                <div
                                  key={`mapping_table_${rowIndex}_gridcell_${colIndex}`}
                                  role="gridcell"
                                  className={`${styles.grid_cell}`}
                                  style={{ gridColumnStart: colIndex + 1 }}
                                >
                                  <span>
                                    {/* データ{rowIndex}_{colIndex} */}
                                    {value}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                      {/* --------------- rowgroup ここまで --------------- */}
                    </div>
                    {/* テーブル */}
                  </div>
                  {/* 下画面 */}
                </div>
              )}
              {/* -------------------------- step2 マッピング ここまで -------------------------- */}
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
                        marginTop: 18,
                        itemsPosition: "left",
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
                        marginTop: 18,
                        itemsPosition: "left",
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
          buttonColor="red"
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
    </>
  );
};

export const ImportModal = memo(ImportModalMemo);
