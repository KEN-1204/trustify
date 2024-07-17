import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";

type WorkerMessageEventType = {
  testData: any[];
};
type ReceivedData = {
  type: "progress" | "complete" | "error";
  processedData: any[];
  error: string | null;
  progress: number;
};

type Props = {
  testData: any[];
  setIsTestProcessing: Dispatch<SetStateAction<boolean>>;
  setIsLoadingTest: Dispatch<SetStateAction<boolean>>;
  setTestProcessedData: Dispatch<SetStateAction<any[]>>;
  setProgressTest: Dispatch<SetStateAction<number | null>>;
  setProcessingName: Dispatch<
    SetStateAction<
      "fetching_address" | "transforming" | "ready_bulk_insert" | "bulk_inserting" | "complete" | "error" | null
    >
  >;
};

// Web Worker起動用コンポーネント
// Web Worker(バックグラウンドスレッド)で数十万行のデータを全てINSERT可能な形に前処理
export const TestDataProcessWorker = ({
  testData,
  setIsTestProcessing,
  setIsLoadingTest,
  setTestProcessedData,
  setProgressTest,
  setProcessingName,
}: Props) => {
  useEffect(() => {
    // データ前処理用のWeb Workerスクリプトを「public/workers/csv/dataProcessor-worker.js」に配置
    const worker = new Worker("/workers/test/testProcessor-worker.js");

    // Workerの前処理結果を受信するイベントリスナーをアタッチ
    worker.onmessage = function (e: MessageEvent<ReceivedData>) {
      console.log("Main thread: Message received from worker. message event: ", e);
      const { data } = e;
      // メッセージイベントのtypeによって処理を動的に変更する
      if (data.type === "progress") {
        setProgressTest(data.progress ?? null);
        return;
      }

      if (data.type === "complete") {
        toast.success(`データ処理が完了しました！✅`);
        // Insert前の変換処理の結果をstateに格納
        setTestProcessedData(data.processedData);
        console.log("✅処理完了 Data processed: ", data.processedData);
        setProcessingName("ready_bulk_insert");
      } else if (data.type === "error") {
        toast.error(`データ処理に失敗しました...🙇‍♀️`);
        console.log("Message received from worker.  error: ", data.error);
        setProcessingName("error");
      } else {
        toast.error(`データ処理に失敗しました。...🙇‍♀️`);
        console.log("❌Main thread: 予期せぬエラーが発生しました");
        setProcessingName("error");
      }

      // ローディング終了
      setIsLoadingTest(false);
      setProgressTest(null);
      // 前処理完了後はコンポーネントをアンマウントさせてクリーンアップ関数のworker.terminate()を実行してWorkerを終了させてリソースを解放
      setIsTestProcessing(false);
    };

    // 🔸onerrorイベント Workerをクリーンアップ
    worker.onerror = function (event) {
      console.error("メインスレッド Unhandled worker error: ", event);

      toast.error("予期せぬエラーが発生しました...🙇‍♀️");
      // ローディング終了
      setIsLoadingTest(false);
      setProcessingName("error");
      setProgressTest(null);
      setIsTestProcessing(false);
    };

    // Workerにメッセージを送信して、データ前処理を実行
    const messageData = {
      origin: process.env.NEXT_PUBLIC_CLIENT_URL, // オリジンをWorkerに送信, オリジン: プロトコル、ホスト名、ポート *1
      testData: testData,
    } as WorkerMessageEventType;
    console.log("🔥Message posted to worker. messageData: ", messageData);
    worker.postMessage(messageData);

    return () => {
      console.log("メインスレッド TestDataProcessWorkerコンポーネントアンマウント worker.terminate()実行🔥");
      worker.terminate();
      // ローディング終了
      if (setIsLoadingTest) setIsLoadingTest(false);
    };
  }, []);

  // Worker側でデータ前処理を行うだけでUIは不要なためフラグメントのみセット
  return <></>;
};
// *1 Next.jsのプロジェクトで「https://www.example.com/dashboard」ページからWorkerにデータを送信する場合、オリジンとしては「https://www.example.com」の部分のみを送るのが適切
