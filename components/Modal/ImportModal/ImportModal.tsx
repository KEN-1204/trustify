import useDashboardStore from "@/store/useDashboardStore";
import { DragEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import styles from "./ImportModal.module.css";
import { SlCloudDownload, SlCloudUpload } from "react-icons/sl";
import useStore from "@/store";
import Papa from "papaparse";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";

import CheckingAnime from "@/components/assets/Animations/Checking";
import { FaCompress } from "react-icons/fa";
import { BiFullscreen } from "react-icons/bi";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { RiDragMove2Fill } from "react-icons/ri";

const ImportModalMemo = () => {
  const language = useStore((state) => state.language);
  const setIsOpenImportModal = useDashboardStore((state) => state.setIsOpenImportModal);

  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const uploadIconRef = useRef<HTMLDivElement | null>(null);
  const fileUploadBoxRef = useRef<HTMLDivElement | null>(null);
  const dropIconRef = useRef<HTMLDivElement | null>(null);
  const uploadTextRef = useRef<HTMLHeadingElement | null>(null);
  const fileBrowseTextRef = useRef<HTMLSpanElement | null>(null);
  const inputFileUploadRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState(1);

  // ------------------ CSV to JSON変換中ローディングテキストアニメーション ------------------
  // CSV to JSON変換中ローディング 5MB以上
  const [isConverting, setIsConverting] = useState(false);
  const intervalIdRef = useRef<NodeJS.Timer | number | null>(null);
  // const [convertingText, setConvertingText] = useState("変換中");
  const convertingTextRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (!isConverting) {
      if (intervalIdRef.current) {
        console.log("🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟ローディング終了したためクリア");
        clearInterval(intervalIdRef.current as NodeJS.Timer | number);
        intervalIdRef.current = null;
      }
      return;
    }

    const loadingTextEffect = () => {
      if (!convertingTextRef.current) return;

      const text = convertingTextRef.current.innerText;
      console.log("🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠loadingTextEffect実行", text);
      if (text === "変換中") {
        convertingTextRef.current.innerText = `変換中.`;
      } else if (text === "変換中.") {
        convertingTextRef.current.innerText = `変換中..`;
      } else if (text === "変換中..") {
        convertingTextRef.current.innerText = `変換中...`;
      } else if (text === "変換中...") convertingTextRef.current.innerText = `変換中`;
    };

    // 初回実行
    loadingTextEffect();

    // 0.5秒ごとにクラスを更新
    const intervalId = setInterval(loadingTextEffect, 1000);

    intervalIdRef.current = intervalId;

    // クリーンアップ
    return () => {
      if (intervalIdRef.current) {
        console.log("🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟クリーンアップ");
        clearInterval(intervalIdRef.current as NodeJS.Timer | number);
        intervalIdRef.current = null;
      }
    };
  }, [isConverting]);
  // ------------------ CSV to JSON変換中ローディングテキストアニメーション ここまで ------------------

  // ---------------- 🌠キャンセル🌠 ----------------
  const handleCancel = () => {
    if (isConverting) return;
    setIsOpenImportModal(false);
  };
  // ----------------------------------------------
  // ---------------- 🌠Browse選択クリック🌠 ----------------
  const handleClickBrowseButton = () => {
    console.log("Browseクリック");
    if (inputFileUploadRef.current) inputFileUploadRef.current.click();
  };
  // ----------------------------------------------

  // const [excelFile, setExcelFile] = useState(null);
  // ユーザーがアップロードしたカラム
  const [uploadedColumns, setUploadedColumns] = useState<string[]>([]);

  // アップロードした結果 result.data
  // => 1000以上は10000個ずつの配列を配列に格納した出力される:
  // [[]] => [0...9999] => [[0...99], [100...199], [200...299], ..., [9900...9999]]
  // => 1000未満は
  const [uploadedData, setUploadedData] = useState<any[]>([]);

  // ---------------- 🌠ファイルを選択 or ファイルをドロップ🌠 ----------------
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

      // ファイルサイズに基づいてworkerオプションを設定
      // 5MB以上の場合はworkerを使用
      const isRequiredWorker = selectedFile.size > 5 * 1024 * 1024;

      // 5MB以上の場合にはローディングを入れる
      if (isRequiredWorker) {
        setIsConverting(true);
      }

      console.log("------------------------------------------");
      console.log("チェック通過 ParseStart...", "isRequiredWorker: ", isRequiredWorker, selectedFile, extension);
      performance.mark("CSV_Parse_Start"); // 開始点
      const startTime = performance.now(); // 開始時間

      Papa.parse<any>(selectedFile, {
        header: true,
        skipEmptyLines: true,
        worker: isRequiredWorker,
        complete: (result: Papa.ParseResult<unknown>) => {
          const _columns = result.meta.fields || [];
          console.log("------------------------------------------");
          performance.mark("CSV_Parse_End"); // 開始点
          performance.measure("CSV_Parse_Time", "CSV_Parse_Start", "CSV_Parse_End"); // 計測
          console.log("Measure Time: ", performance.getEntriesByName("CSV_Parse_Time")[0].duration);
          performance.clearMarks();
          performance.clearMeasures("CSV_Parse_Time");
          const endTime = performance.now(); // 終了時間
          console.log("Time: ", endTime - startTime, "ms");
          console.log("Result: ", result, _columns);
          // setUploadedColumns(_columns);
          // setUploadedData(result.data || []);

          // 5MB以上の場合にはローディングを終了
          console.log("✅ローディング終了");
          setIsConverting(false);
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

  // --------------- 🌠ドラッグ&ドロップ🌠 ---------------

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
  // 現せる
  const handleShow = () => {
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

  const handleDraggingDiv = ({ movementX, movementY }: MouseEvent) => {
    // ドラッグ状態でなければ何もしない
    if (!isDraggingRef.current) return;
    // isHideの時はリターン
    if (isHide) {
      return;
    }

    if (!modalContainerRef.current) return;

    let getStyleContainer = window.getComputedStyle(modalContainerRef.current);

    let containerLeft = parseInt(getStyleContainer.left, 10);
    let containerTop = parseInt(getStyleContainer.top, 10);

    console.log("Dragging");

    // if (isNaN(containerLeft)) return;
    // if (isNaN(containerTop)) return;

    // const newLeft = containerLeft + movementX;
    // const newTop = containerTop + movementY;

    modalContainerRef.current.style.left = `${containerLeft + movementX}px`;
    modalContainerRef.current.style.top = `${containerTop + movementY}px`;
  };

  const handleMouseDownDiv = useCallback(() => {
    // isHideの時にはリターン useCallbackを使用していて作成した関数をremoveEventListenerに指定する必要があるため新たな関数に再生成されないようにするためここでは記述しない
    // if (isHide) return;

    if (!isSmallWindow) return;

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

  // const mouseUpDivReset = () => {
  //   if (!modalContainerRef.current) return;

  //   // 画面ギリギリになったら元の位置に戻す
  //   const { top, left, right } = modalContainerRef.current.getBoundingClientRect();
  //   if (left < -200 || window.innerWidth + 260 < right || top < -70 || window.innerHeight - 30 < top) {
  //     console.log("⚠️元に戻す", top, left);
  //     modalContainerRef.current.style.left = smallInitialPosition.left;
  //     modalContainerRef.current.style.top = smallInitialPosition.top;
  //   }
  // };

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
        <div
          ref={draggingRef}
          className={`absolute left-0 top-[1px] z-[10] hidden h-[calc(100%-2px)] w-[80%] cursor-grab rounded-l-[9px]  active:cursor-grabbing`}
          style={{
            ...(isSmallWindow && { display: `block` }),
            ...(isHide && { cursor: "default", pointerEvents: "none" }),
          }}
          onMouseDown={() => {
            if (isHide) {
            } else {
              handleMouseDownDiv();
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
        ></div>
        <div
          className={`pointer-events-none absolute left-[1px] top-[1px] z-[3] hidden h-[calc(100%-2px)] w-[80%] rounded-[9px] border-r border-solid border-[var(--color-border-light)] bg-[var(--color-modal-solid-bg)]`}
          style={{
            ...(isSmallWindow && { display: `block` }),
          }}
        ></div>

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
                  <div className="absolute left-0 top-[50%] z-[-1] h-[1px] w-[65px] bg-[var(--color-progress-bg)]"></div>
                  {/* ○ */}
                  <div
                    className={`flex-center mr-[15px] h-[25px] w-[25px] cursor-pointer rounded-full border border-solid ${
                      step === 1
                        ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
                        : `border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)] text-[var(--color-text-sub)]`
                    }`}
                  >
                    <span className={`text-[12px] font-bold`}>1</span>
                  </div>
                  {/* ○ */}
                  <div
                    className={`flex-center text-[var(--color-text-sub)]} mr-[15px] h-[25px] w-[25px] cursor-not-allowed rounded-full border border-solid border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)]`}
                  >
                    <span className={`text-[12px] font-bold`}>2</span>
                  </div>
                </div>
              </div>

              {/* <div className="min-h-[1px] w-full bg-[var(--color-border-base)]"></div> */}

              <div className={`${styles.section_step_area} space-between flex w-full`}>
                <div className={`${styles.left_wrapper} flex  w-[60%] max-w-[60%] flex-col`}>
                  <div className={`flex min-w-max items-center space-x-[6px] text-[16px] font-bold`}>
                    <span>ステップ{step}</span>
                    <span>：</span>
                    <span>自社専用の企業リストを読み込む</span>
                  </div>
                  <div className={`mt-[6px] flex whitespace-pre-wrap text-[13px] text-[var(--color-text-sub)]`}>
                    <p>{`下記のエリアにCSVファイルをドラッグ&ドロップするか、\n「ファイルを選択してください」のテキストをクリックしてCSVファイルを選択してください。`}</p>
                  </div>
                </div>

                <div className={`${styles.right_wrapper} flex h-full w-[40%] items-end justify-end space-x-[15px]`}>
                  <div
                    className={`transition-bg02 flex-center basic_btn space-x-[5px] rounded-[6px] px-[12px] py-[5px] text-[12px]`}
                    // text-[#b9b9b9]
                    onClick={() => handleSwitchSize(!isSmallWindow)}
                  >
                    {isSmallWindow ? (
                      <BiFullscreen className="pointer-events-none" />
                    ) : (
                      <FaCompress className="pointer-events-none" />
                    )}
                    {!isSmallWindow && <span>最小化</span>}
                  </div>
                  {step === 1 && (
                    <div
                      className={`transition-bg02 brand_btn_active flex-center space-x-[5px] rounded-[6px] px-[12px] py-[5px] text-[12px]`}
                      style={{
                        transition: `background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease width 0.2s ease`,
                      }}
                      onClick={() => {
                        if (step === 1) handleClickBrowseButton();
                      }}
                    >
                      {step === 1 && (
                        <SlCloudDownload className={`${styles.upload_icon_btn} text-[13px] text-[#fff]`} />
                      )}
                      <span>ファイル選択</span>
                      {/* <span>続ける</span> */}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* ----------------------- 保存・タイトル・キャンセルエリア ここまで ----------------------- */}
            {/* ----------------------- メインコンテナ ----------------------- */}
            <div
              className={`${styles.contents_container} fade08_forward flex h-full w-full flex-col rounded-b-[9px] px-[24px]`}
            >
              <div
                className={`${styles.file_upload_box_container} mb-[24px] h-full w-full bg-[var(--color-modal-solid-bg-main)] p-[12px]`}
              >
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
                          変換中
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
              </div>
            </div>
          </>
        )}
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
                  <SpinnerX h="h-[24px]" w="w-[24px]" />
                  <div className={`ml-[15px] flex min-w-max items-center`}>
                    <p ref={convertingTextRef} className={`text-[13px] text-[var(--color-text-sub)]`}>
                      変換中
                    </p>
                  </div>
                </div>

                <div className={`flex h-full items-center`}>
                  <div className="z-[30] cursor-pointer hover:text-[#999]" onClick={handleHide}>
                    <BsChevronRight className="mr-[6px] stroke-[0.5] text-[15px]" />
                  </div>

                  {/* <BsChevronLeft className="z-1 absolute  left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" /> */}
                </div>
              </div>
            </div>
            {/* ----------------------- メインコンテナ ここまで ----------------------- */}
          </>
        )}
        {/* ----------------------- メインコンテナ ここまで ----------------------- */}
      </div>
    </>
  );
};

export const ImportModal = memo(ImportModalMemo);
