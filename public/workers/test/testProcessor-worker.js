// ----------------------------------- 🌠Web Worker Script🌠-----------------------------------
// 🔸onmessageイベントリスナー
self.onmessage = async function (e) {
  try {
    console.log("Worker: Message received from main thread. event: ", e);

    // postMessage が呼び出されたときにメッセージを送ったウィンドウのオリジンが正しいことをチェック
    // publicフォルダ内のスクリプトでは、環境変数を使用できないためオリジンをハードコーディング
    const clientUrl = "http://localhost:3000";
    if (e.data.origin !== clientUrl) {
      console.log(`Worker: ❌オリジンチェックに失敗 リターン 受け取ったオリジン: ${e.data.origin}`);
      throw new Error("❌オリジンチェックに失敗しました");
    }

    const { testData } = e.data;

    if (!testData || testData.length === 0) {
      throw new Error("❌データが見つかりません");
    }

    // // [Promise, Promise, Promise, ...]が生成される
    // const promises = testData.map(async (obj, index) => {
    //   await new Promise((resolve, reject) => setTimeout(resolve, 1000));
    //   console.log(`Worker: mapメソッド${index + 1}回目処理終了`);
    //   return { ...obj, value: `処理済み: ${index + 10}` };
    // });

    // // Promise.allを使用して全てのPromiseが解決するのを待つ
    // const processedData = await Promise.all(promises);

    const totalCount = testData.length;
    let processedCount = 0;
    let processedData = [];

    for (const obj of testData) {
      await new Promise((resolve, reject) => setTimeout(resolve, 1000));
      const newObj = { id: processedCount, value: `処理済み: ${processedCount + 10}` };

      processedData.push(newObj);
      processedCount++; // 処理済みカウントを更新
      const updateProgressInterval = 3;

      // 特定の件数ごとに進捗率をメインスレッドに送信
      if (processedCount % updateProgressInterval === 0 || processedCount === totalCount) {
        const progress = Math.floor((processedCount / totalCount) * 100);
        self.postMessage({ type: "progress", progress: progress });
      }
    }

    // 🔸アップロードされたCSVデータの全ての行の前処理完了 => クライアントサイドに処理済みデータを返すとともに完了を通知
    const responseMessageData = { type: "complete", processedData: processedData };
    console.log("✅Worker: Message posted to main thread. responseMessageData: ", responseMessageData);
    self.postMessage(responseMessageData);
  } catch (error) {
    console.log("❌Worker: エラー", error.message);
    self.postMessage({ type: "error", error: `Worker側でエラーが発生しました。` });
  }
};

// 🔸onerrorイベントリスナー
// self.onerrorはWorker自体内で、自身が発生させたエラーを処理するのに適しています。
// Worker内でself.onerror()を使用すると、Worker内部で発生したエラーをWorker自身で捕捉し、特定のエラーログを記録したり、エラーに応じて特定の回復処理を行ったりすることができます。これはWorkerが自己完結型でエラー処理を行いたい場合に有効です。
self.onerror = function (event) {
  // メインスレッドへの伝搬を阻止 => メインスレッドとWorker側で同時にonerrorイベントが実行されないようにするため
  event.preventDefault();

  // エラー詳細を処理
  console.error("❌Worker onerror: ", event.message);

  // メインスレッドにエラー情報を送信
  self.postMessage({
    type: `error`,
    error: event,
  });
};

// ----------------------------------- 🌠Web Worker Script🌠-----------------------------------ここまで
