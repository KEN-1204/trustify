import { Dispatch, SetStateAction, useEffect } from "react";

type WorkerMessageEventType = {
  parsedData: any[];
  columnMap: Map<string, string>;
};
type ReceivedData = {
  processedData: any[];
};

type Props = {
  parsedData: any[];
  columnMap: Map<string, string>;
  setIsTransformProcessing: Dispatch<SetStateAction<boolean>>;
  setProcessedData: Dispatch<SetStateAction<any[]>>;
};

// Web Worker起動用コンポーネント
// Web Worker(バックグラウンドスレッド)で数十万行のデータを全てINSERT可能な形に前処理
export const DataProcessWorker = ({ parsedData, columnMap, setIsTransformProcessing, setProcessedData }: Props) => {
  useEffect(() => {
    // データ前処理用のWeb Workerスクリプトを「public/workers/csv/dataProcessor-worker.js」に配置
    const worker = new Worker("/workers/csv/dataProcessor-worker.js");

    // Workerの前処理結果を受信するイベントリスナーをアタッチ
    worker.onmessage = function (e: MessageEvent<ReceivedData>) {
      // Insert前の変換処理の結果をstateに格納
      setProcessedData(e.data.processedData);
      console.log("Message received from worker. Data processed: ", e.data.processedData);

      // 前処理完了後はコンポーネントをアンマウントさせてクリーンアップ関数のworker.terminate()を実行してWorkerを終了させてリソースを解放
      setIsTransformProcessing(false);
    };

    // Workerにメッセージを送信して、データ前処理を実行
    console.log("Message posted to worker");
    worker.postMessage({
      parsedData: parsedData, // Papa Parseで解析されたデータ
      columnMap: columnMap, // csvカラムヘッダー名 to データベースのclient_companiesテーブルのカラム名
    } as WorkerMessageEventType);

    return () => worker.terminate();
  }, []);

  // Worker側でデータ前処理を行うだけでUIは不要なためフラグメントのみセット
  return <></>;
};
