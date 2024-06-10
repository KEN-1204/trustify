import useDashboardStore from "@/store/useDashboardStore";
import { DragEvent, memo, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import styles from "./ImportModal.module.css";
import { SlCloudDownload, SlCloudUpload } from "react-icons/sl";
import useStore from "@/store";
import Papa from "papaparse";

const ImportModalMemo = () => {
  const language = useStore((state) => state.language);
  const setIsOpenImportModal = useDashboardStore((state) => state.setIsOpenImportModal);

  const uploadIconRef = useRef<HTMLDivElement | null>(null);
  const fileUploadBoxRef = useRef<HTMLDivElement | null>(null);
  const dropIconRef = useRef<HTMLDivElement | null>(null);
  const uploadTextRef = useRef<HTMLHeadingElement | null>(null);
  const fileBrowseTextRef = useRef<HTMLSpanElement | null>(null);

  const [step, setStep] = useState(1);

  // ---------------- 🌠キャンセル🌠 ----------------
  const handleCancel = () => {
    setIsOpenImportModal(false);
  };
  // ----------------------------------------------
  // ---------------- 🌠Browse選択クリック🌠 ----------------
  const handleClickBrowseButton = () => {
    console.log("Browseクリック");
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
          const endTime = performance.now(); // 終了時間
          console.log("Time: ", endTime - startTime, "ms");
          console.log("Result: ", result, _columns);
          // setUploadedColumns(_columns);
          // setUploadedData(result.data || []);
        },
        error: (error) => {
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

  return (
    <>
      {/* モーダルオーバーレイ */}
      <div className={`modal_overlay`} onClick={handleCancel} />

      {/* モーダルコンテナ */}
      <div className={`${styles.modal_container} fade03 text-[var(--color-text-title)]`}>
        {/* <button
          className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
          onClick={handleCancel}
        >
          <MdClose className="text-[20px] text-[#fff]" />
        </button> */}
        <button
          type="button"
          className={`flex-center z-100 absolute right-[24px] top-[22px] h-[32px] w-[32px] cursor-pointer rounded-full hover:text-[#999]`}
          onClick={handleCancel}
        >
          <MdClose className="pointer-events-none text-[24px]" />
        </button>
        {/* ----------------------- 保存・タイトル・キャンセルエリア ----------------------- */}
        <div className={`${styles.title_area} flex h-auto w-full flex-col rounded-t-[9px] p-[24px] pb-[12px]`}>
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

            <div className={`${styles.right_wrapper} flex h-full w-[40%] items-end justify-end`}>
              {step === 1 && (
                <div
                  className={`transition-bg02 brand_btn_active rounded-[6px] px-[13px] py-[4px] text-[14px]`}
                  onClick={() => {}}
                >
                  <span>続ける</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* ----------------------- 保存・タイトル・キャンセルエリア ここまで ----------------------- */}
        {/* ----------------------- メインコンテナ ----------------------- */}
        <div className={`${styles.contents_container} flex h-full w-full flex-col rounded-b-[9px] px-[24px] pb-[24px]`}>
          <div
            className={`${styles.file_upload_box_container} h-full w-full bg-[var(--color-modal-solid-bg-main)] p-[12px]`}
          >
            <div
              ref={fileUploadBoxRef}
              onDragEnter={handleDragEnterUploadBox}
              onDragOver={handleDragOverUploadBox}
              onDragLeave={handleDragLeaveUploadBox}
              onDrop={handleDropUploadBox}
              className={`${styles.file_upload_box} flex-center h-full w-full flex-col`}
            >
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
            </div>
          </div>
        </div>
        {/* ----------------------- メインコンテナ ここまで ----------------------- */}
      </div>
    </>
  );
};

export const ImportModal = memo(ImportModalMemo);
