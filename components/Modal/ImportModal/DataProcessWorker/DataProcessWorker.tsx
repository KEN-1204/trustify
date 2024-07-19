import { GroupedTownsByRegionCity } from "@/types";
import { RegionNameJpType } from "@/utils/selectOptions";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { toast } from "react-toastify";

type WorkerMessageEventType = {
  parsedData: any[];
  columnMap: Map<string, string>;
};
// type ReceivedData = {
//   type: "progress" | "complete" | "error";
//   processedData: any[];
//   error: string | null;
//   progress: number;
// };
type ReceivedData = {
  type: "complete" | "error";
  processedData: any[];
  error: string | null;
  errorMessages: { [key: string]: { [key: string]: number[] } }; // { CSVカラムヘッダー名: { エラー理由: [1, 3, 9] } } // [...]の要素はエラーが発生した〜行目の行数
};

type Props = {
  parsedData: any[];
  columnMap: Map<string, string>;
  setIsTransformProcessing: Dispatch<SetStateAction<boolean>>;
  setProcessedData: Dispatch<SetStateAction<any[]>>;
  groupedTownsByRegionCity: GroupedTownsByRegionCity; // 町域名の正規表現で使用するリスト
  setProgress: Dispatch<SetStateAction<number | null>>;
  setProcessingName: Dispatch<
    SetStateAction<
      "fetching_address" | "transforming" | "ready_bulk_insert" | "bulk_inserting" | "complete" | "error" | null
    >
  >;
  detailsTransform: {
    capital: "default" | "million";
  };
  setRemovedErrorData: Dispatch<SetStateAction<{ [key: string]: { [key: string]: number[] } } | null>>;
  setProcessedRowCount: Dispatch<SetStateAction<number>>;
};

// Web Worker起動用コンポーネント
// Web Worker(バックグラウンドスレッド)で数十万行のデータを全てINSERT可能な形に前処理
export const DataProcessWorker = ({
  parsedData,
  columnMap,
  setIsTransformProcessing,
  setProcessedData,
  groupedTownsByRegionCity,
  setProgress,
  setProcessingName,
  detailsTransform,
  setRemovedErrorData,
  setProcessedRowCount,
}: Props) => {
  // チャンク分割数と現在処理中のチャンク番号 (チャンク番号はカウントの保持のみで更新時にUIを再描画する必要はないためuseRefで管理)
  const currentChunkIndex = useRef(0);

  useEffect(() => {
    // 🔸数十万行のデータを指定した行ごとのチャンクに分割する関数
    const createChunkArray = (dataArray: any[], chunkSize: number) => {
      let chunksArray = [];

      for (let i = 0; i < dataArray.length; i += chunkSize) {
        chunksArray.push(dataArray.slice(i, i + chunkSize));
      }

      return chunksArray;
    };

    const allProcessedData: any[] = []; // 最終的に全ての処理済みデータを格納するリスト
    const chunkSize = 5000;
    // const chunkSize = 2500;
    // const chunkSize = 1000;
    // const chunkSize = 25;
    const dataChunksArray = createChunkArray(parsedData, chunkSize); // 会社リストデータをチャンクに分割
    const totalChunksCount = dataChunksArray.length; // 総チャンク数
    // 最終的に全てのチャンクのエラーメッセージを集約するオブジェクト
    const allErrorMessages: { [key: string]: { [key: string]: number[] } } = {}; // { CSVカラムヘッダー名: { エラー理由: [1, 3, 9] } }

    // チャンクサイズを確認
    let totalChunkBlob: null | Blob = new Blob([JSON.stringify(dataChunksArray)]);
    let chunkBlob: null | Blob = new Blob([JSON.stringify(dataChunksArray[0])]);
    console.log(
      `総チャンク(${totalChunksCount}個)合計${parsedData.length}行 サイズ: ${(
        totalChunkBlob.size /
        1024 /
        1024
      ).toFixed(2)}MB(${totalChunkBlob.size}Byte)`,
      `1チャンク/${chunkSize}行 サイズ: ${(chunkBlob.size / 1024 / 1024).toFixed(2)}MB(${chunkBlob.size}Byte)`
    );
    totalChunkBlob = null;
    chunkBlob = null;

    // 🔸データ前処理用のWeb Workerスクリプトを「public/workers/csv/dataProcessor-worker.js」に配置
    const worker = new Worker("/workers/csv/dataProcessor-worker.js");

    // 🔸Workerの前処理結果を受信するイベントリスナーをアタッチ
    worker.onmessage = async function (e: MessageEvent<ReceivedData>) {
      console.log(`メインスレッド: Message received from worker. message event: `, e);

      const { data } = e;

      // Workerからのメッセージイベントのtypeで処理を分岐
      // 🔸completeルート: 進捗を更新して、次のチャンクをWorkerに渡してデータ前処理を実行
      if (data.type === "complete") {
        // 進捗更新
        const processedChunkCount = currentChunkIndex.current + 1;
        // const progress = Math.round((processedChunkCount / totalChunksCount) * 100);
        const progress = parseFloat(((processedChunkCount / totalChunksCount) * 100).toFixed(1)); // 0.1%単位で表示
        setProgress(progress ?? null);
        // 「処理済み行数 / 合計行数」形式の進捗を更新
        setProcessedRowCount(processedChunkCount * chunkSize);
        // setProcessedRowCount(Math.ceil(processedChunkCount * chunkSize));

        // 🔹データ前処理が完了したチャンクのデータを集約 allProcessedData
        allProcessedData.push(...data.processedData);

        // 🔹除外された行のカラムとエラー理由を集約
        if (Object.hasOwn(data, "errorMessages") && !!Object.keys(data.errorMessages).length) {
          const { errorMessages } = data; // { CSVカラムヘッダー名: { エラー理由: [1, 3, 9] } }
          // 全てのキー(csvカラムヘッダー名)をforEachループで処理
          Object.entries(errorMessages).forEach(([csvHeader, errorObj]) => {
            if (!Object.hasOwn(allErrorMessages, csvHeader)) {
              allErrorMessages[csvHeader] = {};
            }
            if (!!Object.keys(errorObj).length) {
              Object.entries(errorObj).forEach(([errorMessage, rowIndexesArray]) => {
                if (!Object.hasOwn(allErrorMessages[csvHeader], errorMessage)) {
                  allErrorMessages[csvHeader][errorMessage] = [];
                }
                allErrorMessages[csvHeader][errorMessage] = [
                  ...allErrorMessages[csvHeader][errorMessage],
                  ...rowIndexesArray,
                ];
              });
            }
          });
        }

        console.log(
          `Main thread: type: complete, 進捗: ${progress}%`,
          `, 現在の完了済みチャンク数: ${processedChunkCount}個目`,
          `, 合計チャンク数: ${totalChunksCount}個`,
          `, ✅チャンクデータ処理完了 データを集約 Chunk data processed: `,
          data.processedData.length,
          `, 除外された行のエラー理由: `,
          data.errorMessages,
          `allProcessedData.length: `,
          allProcessedData.length
        );

        if (!!performance.getEntriesByName(`Worker_Process_Start_chunk_index_${currentChunkIndex.current}`).length) {
          performance.mark(`Worker_Process_End_chunk_index_${currentChunkIndex.current}`); // チャンク終了点
          performance.measure(
            `Worker_Process_Time_chunk_index_${currentChunkIndex.current}`,
            `Worker_Process_Start_chunk_index_${currentChunkIndex.current}`,
            `Worker_Process_End_chunk_index_${currentChunkIndex.current}`
          ); // 計測
          console.log(
            `${chunkSize}行ずつデータ処理タイム_`,
            `Measure Time: `,
            performance.getEntriesByName(`Worker_Process_Time_chunk_index_${currentChunkIndex.current}`)[0].duration
          );
          performance.clearMarks(`Worker_Process_Start_chunk_index_${currentChunkIndex.current}`);
          performance.clearMarks(`Worker_Process_End_chunk_index_${currentChunkIndex.current}`);
          performance.clearMeasures(`Worker_Process_Time_chunk_index_${currentChunkIndex.current}`);
          console.log(
            `------------------------------------------ タイム終了 index: ${currentChunkIndex.current} ------------------------------------------`
          );
        }

        // 🔹次のチャンク番号を取り出して、Workerに渡してデータ前処理実行
        if (processedChunkCount < totalChunksCount) {
          currentChunkIndex.current += 1; // チャンクインデックスを次に進める
          const messageData = {
            origin: process.env.NEXT_PUBLIC_CLIENT_URL,
            parsedData: dataChunksArray[currentChunkIndex.current],
            columnMap: columnMap,
            groupedTownsByRegionCity: groupedTownsByRegionCity,
            detailsTransform: detailsTransform,
            currentChunkCount: currentChunkIndex.current + 1,
          } as WorkerMessageEventType;
          console.log(
            `Main thread: Next chunk index: ${currentChunkIndex.current},  Message posted to worker. messageData: `,
            messageData
          );
          // DBや外部APIのリソースへアクセスしない場合はディレイは不要 *2
          // await new Promise((resolve, reject) => setTimeout(resolve, 2000));
          worker.postMessage(messageData);

          console.log(
            `------------------------------------------ タイム開始 index: ${currentChunkIndex.current} ------------------------------------------`
          );
          performance.mark(`Worker_Process_Start_chunk_index_${currentChunkIndex.current}`); // チャンク開始点

          return; // 次のチャンクのデータ前処理があるためここでリターン
        }
        // 🔹全てのチャンクのデータ前処理が完了
        else if (totalChunksCount <= processedChunkCount) {
          performance.mark("Worker_Process_End"); // 開始点
          performance.measure("Worker_Process_Time", "Worker_Process_Start", "Worker_Process_End"); // 計測
          console.log(
            `${chunkSize}行ずつ合計チャンク${totalChunksCount}個のデータ処理の合計タイム_`,
            "Measure Time: ",
            performance.getEntriesByName("Worker_Process_Time")[0].duration
          );
          performance.clearMarks();
          performance.clearMeasures("Worker_Process_Time");
          const endTime = performance.now(); // 終了時間
          console.log("Time: ", endTime - startTime, "ms");
          console.log(
            "------------------------------------------ タイム終了 全チャンク ------------------------------------------"
          );

          toast.success(`全てのデータ処理が完了しました！✅`);
          // Insert前の変換処理の結果をstateに格納
          console.log(
            "Main thread: ✅全てのチャンクデータ処理完了(バルクインサート準備完了✅)",
            ", 前処理完了後 allProcessedData: ",
            allProcessedData,
            ", 前処理前 parsedData: ",
            parsedData,
            ", 除外された行のエラーデータ allErrorMessages: ",
            allErrorMessages
          );
          setProcessedData(allProcessedData);
          setRemovedErrorData(allErrorMessages); // 除外されたエラーデータを格納
          setProcessingName("ready_bulk_insert"); // バルクインサート準備完了
        }
      }
      // 🔸errorルート
      else if (data.type === "error") {
        toast.error(`データ処理に失敗しました...🙇‍♀️`);
        console.log(`Main thread: ❌type: error: `, data.error);
        setProcessingName("error");
      } else {
        toast.error(`データ処理に失敗しました。...🙇‍♀️`);
        console.log(`Main thread: ❌予期せぬエラーが発生しました`);
        setProcessingName("error");
      }

      // 🔸complete(全てのチャンク処理完了時)とerrorの共通ルート
      worker.terminate(); // Workerを終了させてメモリリソースを解放
      setProgress(null);
      setIsTransformProcessing(false); // コンポーネントをアンマウント
    };

    // 🔸onerrorイベント Workerをクリーンアップ
    worker.onerror = function (event) {
      console.error("Main thread: Unhandled worker error: ", event);

      toast.error("予期せぬエラーが発生しました...🙇‍♀️");
      worker.terminate(); // Workerを終了させてリソースを解放
      setProcessingName("error");
      setProgress(null);
      setIsTransformProcessing(false);
    };

    console.log(
      "------------------------------------------ タイム開始 全チャンク ------------------------------------------"
    );
    performance.mark("Worker_Process_Start"); // 開始点
    const startTime = performance.now(); // 開始時間

    console.log(
      `------------------------------------------ タイム開始 index: ${currentChunkIndex.current} ------------------------------------------`
    );
    performance.mark(`Worker_Process_Start_chunk_index_${currentChunkIndex.current}`); // チャンク開始点

    // Workerにメッセージを送信して、データ前処理を実行// 初めてのチャンクをWorkerに送信
    const messageData = {
      origin: process.env.NEXT_PUBLIC_CLIENT_URL, // オリジンをWorkerに送信, オリジン: プロトコル、ホスト名、ポート *1
      parsedData: dataChunksArray[currentChunkIndex.current], // Papa Parseで解析されたデータ
      columnMap: columnMap, // csvカラムヘッダー名 to データベースのclient_companiesテーブルのカラム名
      groupedTownsByRegionCity: groupedTownsByRegionCity, // 会社リストで使用される都道府県・市区町村別の町域リスト
      detailsTransform: detailsTransform, // 各カラムの前処理の詳細(資本金の入力値が円単位or万単位どちらで入力されているか等)
      currentChunkIndex: currentChunkIndex.current,
      chunkSize: chunkSize,
    } as WorkerMessageEventType;
    console.log(`Main thread: First chunk Message posted to worker. messageData: `, messageData);
    worker.postMessage(messageData);

    return () => {
      console.log("メインスレッド TestDataProcessWorkerコンポーネントアンマウント worker.terminate()実行🔥✅");
      worker.terminate();
    };
  }, []);

  // Worker側でデータ前処理を行うだけでUIは不要なためフラグメントのみセット
  return <></>;
};
// *1 Next.jsのプロジェクトで「https://www.example.com/dashboard」ページからWorkerにデータを送信する場合、オリジンとしては「https://www.example.com」の部分のみを送るのが適切

/*
*2
クライアントサイドの処理においては、データベースや外部APIのようなリソースに依存しない限り、ディレイを設ける必要はありません。データの処理速度を最適化するためにも、不要なディレイは除去するのが一般的です。メモリの圧迫は、処理するデータの量や処理の方法に依存しますが、ディレイを入れること自体がメモリ圧迫に直接的な影響を与えるわけではありません。
*/
