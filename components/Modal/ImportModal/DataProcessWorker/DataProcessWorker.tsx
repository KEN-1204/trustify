import { GroupedTownsByRegionCity } from "@/types";
import { RegionNameJpType } from "@/utils/selectOptions";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";

type WorkerMessageEventType = {
  parsedData: any[];
  columnMap: Map<string, string>;
};
type ReceivedData = {
  type: "progress" | "complete" | "error";
  processedData: any[];
  error: string | null;
  progress: number;
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
}: Props) => {
  useEffect(() => {
    // データ前処理用のWeb Workerスクリプトを「public/workers/csv/dataProcessor-worker.js」に配置
    const worker = new Worker("/workers/csv/dataProcessor-worker.js");

    // Workerの前処理結果を受信するイベントリスナーをアタッチ
    worker.onmessage = function (e: MessageEvent<ReceivedData>) {
      console.log(`メインスレッド: Message received from worker. message event: `, e);

      const { data } = e;
      // メッセージイベントのtypeによって処理を動的に変更する
      if (data.type === "progress") {
        console.log(`メインスレッド: type: progress, 進捗: ${e.data.progress}%`);
        setProgress(data.progress ?? null);
        return;
      }

      if (data.type === "complete") {
        toast.success(`データ処理が完了しました！✅`);
        // Insert前の変換処理の結果をstateに格納
        console.log("メインスレッド: ✅処理完了 Data processed: ", data.processedData);
        setProcessedData(data.processedData);
        setProcessingName("ready_bulk_insert"); // バルクインサート準備完了
      } else if (data.type === "error") {
        toast.error(`データ処理に失敗しました...🙇‍♀️`);
        console.log("メインスレッド: ❌Message received from worker.  error: ", data.error);
        setProcessingName("error");
      } else {
        toast.error(`データ処理に失敗しました。...🙇‍♀️`);
        console.log("メインスレッド: ❌Main thread: 予期せぬエラーが発生しました");
        setProcessingName("error");
      }

      setProgress(null);

      // 前処理完了後はコンポーネントをアンマウントさせてクリーンアップ関数のworker.terminate()を実行してWorkerを終了させてリソースを解放
      setIsTransformProcessing(false);
    };

    // 🔸onerrorイベント Workerをクリーンアップ
    worker.onerror = function (event) {
      console.error("メインスレッド Unhandled worker error: ", event);

      toast.error("予期せぬエラーが発生しました...🙇‍♀️");
      setProcessingName("error");
      setProgress(null);
      setIsTransformProcessing(false);
    };

    // Workerにメッセージを送信して、データ前処理を実行
    const messageData = {
      origin: process.env.NEXT_PUBLIC_CLIENT_URL, // オリジンをWorkerに送信, オリジン: プロトコル、ホスト名、ポート *1
      parsedData: parsedData, // Papa Parseで解析されたデータ
      columnMap: columnMap, // csvカラムヘッダー名 to データベースのclient_companiesテーブルのカラム名
      groupedTownsByRegionCity: groupedTownsByRegionCity, // 会社リストで使用される都道府県・市区町村別の町域リスト
      detailsTransform: detailsTransform, // 各カラムの前処理の詳細(資本金の入力値が円単位or万単位どちらで入力されているか等)
    } as WorkerMessageEventType;
    console.log(`Message posted to worker. messageData: `, messageData);
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
