import { GroupedTownsByRegionCity } from "@/types";
import { RegionNameJpType } from "@/utils/selectOptions";
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
  groupedTownsByRegionCity: GroupedTownsByRegionCity; // 町域名の正規表現で使用するリスト
};

// Web Worker起動用コンポーネント
// Web Worker(バックグラウンドスレッド)で数十万行のデータを全てINSERT可能な形に前処理
export const DataProcessWorker = ({
  parsedData,
  columnMap,
  setIsTransformProcessing,
  setProcessedData,
  groupedTownsByRegionCity,
}: Props) => {
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
      origin: process.env.CLIENT_URL, // オリジンをWorkerに送信, オリジン: プロトコル、ホスト名、ポート *1
      parsedData: parsedData, // Papa Parseで解析されたデータ
      columnMap: columnMap, // csvカラムヘッダー名 to データベースのclient_companiesテーブルのカラム名
      groupedTownsByRegionCity: groupedTownsByRegionCity, // 会社リストで使用される都道府県・市区町村別の町域リスト
    } as WorkerMessageEventType);

    return () => worker.terminate();
  }, []);

  // Worker側でデータ前処理を行うだけでUIは不要なためフラグメントのみセット
  return <></>;
};
// *1 Next.jsのプロジェクトで「https://www.example.com/dashboard」ページからWorkerにデータを送信する場合、オリジンとしては「https://www.example.com」の部分のみを送るのが適切
