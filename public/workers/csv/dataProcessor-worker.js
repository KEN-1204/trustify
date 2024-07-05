// Next.jsのコンポーネントのビジネスロジックから
// new Worker('/workers/worker.js')
// new Worker()に「'/workers/worker.js'」のエンドポイントを渡すことで専用ワーカーのインスタンスを作成できる

// new Worker()に渡す引数について:
// new Worker() の引数には、ワーカーが実行するJavaScriptのスクリプトファイルのパスを渡します。ワーカー用のスクリプトファイル（例：worker.js）内に onmessage イベントハンドラを定義し、そこでメッセージを受信して処理を行います。

// Next.js と TypeScript を使用している場合のファイル形式:
// Web Worker はブラウザで直接実行されるJavaScriptのコードが必要です。TypeScriptを使用している場合でも、ワーカー用のスクリプトは純粋なJavaScript（.js）ファイルである必要があります。TypeScriptで書かれたコードはトランスパイルされた後のJavaScriptコードをワーカーに渡す必要があります。

// Next.js プロジェクトでのWeb Workerファイルの置き場所:
// Next.js プロジェクトでは、静的ファイルは通常 public ディレクトリに置かれます。Web Workerのスクリプトも public ディレクトリに配置することが推奨されます。そうすることで、new Worker('/worker.js') のようにパスを指定して簡単にアクセスできます。

self.onmessage = function (e) {
  console.log("Worker: Message received from main thread");
  const { parsedData, columnMap } = e.data;

  // 1行ずつ取り出して必要なカラムのみ前処理してインサート用配列データを生成
  const processedData = parsedData.map((row) => {
    const processedRow = {};

    Array.from(columnMap.entries()).forEach(([csvHeader, dbField]) => {
      processedRow[dbField] = transformData(row[csvHeader], dbField);
    });
  });

  return self.postMessage({ processedData });
};

function transformData(csvValue, dbField) {
  // ここで型変換やデータクリーニングを行う
  // 例: 日付の変換、数値の変換、文字列のトリム等

  if (dbField === "name") {
    // カラム：会社名 の前処理
  }

  if (dbField === "address") {
    // カラム：住所 の前処理
  }

  return csvValue; // 変換後の値を返す
}

// ----------------------------------- 🔸業界大分類🔸 -----------------------------------
// 業界大分類 小分類はユーザーに自由に使用してもらう ユーザー独自の分類分け

// 業界小分類は大分類が一致していたらインサートを許可する

/**
// セールスフォース用業界大分類
  const industryLargeSFSet = new Set([
    "金融", // 1
    "IT・メディア", //2
    "自動車", //3
    "エネルギー", //4
    "電機", //5
    "食品", //6
    "生活関連", //7
    "衣料・装飾", //8
    "小売", //9
    "建設", //10
    "不動産", //12
    "物流・運送", //13
    "娯楽・レジャー", //14
    "飲食", //15
    "その他サービス", //16
    "官公庁・公共団体", //17
  ]);
 */

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
   * 
   * 
🔸 各カラムごとの前処理

○必須カラム：
・会社名
・部署名
・住所
・代表TEL


・会社名 TEXT:
文字数制限(記号どうするか) とりあえず記号も許可

・部署名 TEXT:
入力なしの場合はデフォルトで「.」ピリオドを付与

・代表TEL TEXT:
TEL バリデーション 半角にフォーマット

・代表FAX TEXT:
TEL バリデーション 半角にフォーマット

・郵便番号 TEXT:
文字数制限 バリデーション 半角にフォーマット

・住所・所在地 TEXT:
(必須でなくても良いかも)
国コード・都道府県・市区町村コードを抽出して当てはまれば割り当てる
○最初にトリム、空白文字(\s)を全て最初に取り除いた後、都道府県のSetオブジェクトに含まれていて、その該当部分が住所の先頭に来ていれば、国コードを日本、都道府県コードを該当の都道府県として登録、都道府県を取り除く
○取り除いた住所に該当する市区町村オプションに該当する市区町村が含まれていれば該当のコードを付与して取り除く
○

・ホームページURL
URLのチェック

・Email
メールバリデーションチェック

・業界・業種(industry_type_id)
オプションの業種ごとにキーワードを抜き出しSetオブジェクトを作成して、各業種ごとにキーワードを含んでいればid(number)をセット
テーブル(ipros)の業種一覧にマッチする文字列なら対応する番号を付与 Setオブジェクトで確認

・業界(大分類) TEXT
・業界(小分類) TEXT
文字数制限 30文字以内

・決算月
・予算申請月1
・予算申請月2
csvパース後はstringなのでparseIntで整数に変換してからmonthSetでhasでチェック

・資本金
stringなので、millionメソッドで万円単位に整形後にnumberに変換

・設立
文字数制限 11文字以内(1992年12月04日 or 1992/12/04)

・法人番号 住所が日本の場合は13桁かどうかをチェック

・取引先(納入先)
・仕入れ先
・設備
・事業拠点
・海外拠点
・グループ会社
特になし 文字数300文字以内 切り捨て

・事業概要
・連絡先
特になし 文字数500文字以内 切り捨て

・代表者名 TEXT
・会長
・副社長
特になし 文字数50文字以内 切り捨て

・専務取締役
・常務取締役
特になし 文字数100文字以内 切り捨て

・取締役
・役員
・監査役
・部長
・担当者
特になし 文字数300文字以内 切り捨て

   */
