// ----------------------------------- Web Workerスクリプト内で使用するヘルパー関数 -----------------------------------
// ----------------------------------- 🔸半角カタカナ => 半角カタカナ🔸 -----------------------------------
export function convertKanaHalfWidthToFullWidth(kanaText) {
  const kanaMap = {
    ｶﾞ: "ガ",
    ｷﾞ: "ギ",
    ｸﾞ: "グ",
    ｹﾞ: "ゲ",
    ｺﾞ: "ゴ",
    ｻﾞ: "ザ",
    ｼﾞ: "ジ",
    ｽﾞ: "ズ",
    ｾﾞ: "ゼ",
    ｿﾞ: "ゾ",
    ﾀﾞ: "ダ",
    ﾁﾞ: "ヂ",
    ﾂﾞ: "ヅ",
    ﾃﾞ: "デ",
    ﾄﾞ: "ド",
    ﾊﾞ: "バ",
    ﾋﾞ: "ビ",
    ﾌﾞ: "ブ",
    ﾍﾞ: "ベ",
    ﾎﾞ: "ボ",
    ﾊﾟ: "パ",
    ﾋﾟ: "ピ",
    ﾌﾟ: "プ",
    ﾍﾟ: "ペ",
    ﾎﾟ: "ポ",
    ｳﾞ: "ヴ",
    ﾜﾞ: "ヷ",
    ｦﾞ: "ヺ",
    ｱ: "ア",
    ｲ: "イ",
    ｳ: "ウ",
    ｴ: "エ",
    ｵ: "オ",
    ｶ: "カ",
    ｷ: "キ",
    ｸ: "ク",
    ｹ: "ケ",
    ｺ: "コ",
    ｻ: "サ",
    ｼ: "シ",
    ｽ: "ス",
    ｾ: "セ",
    ｿ: "ソ",
    ﾀ: "タ",
    ﾁ: "チ",
    ﾂ: "ツ",
    ﾃ: "テ",
    ﾄ: "ト",
    ﾅ: "ナ",
    ﾆ: "ニ",
    ﾇ: "ヌ",
    ﾈ: "ネ",
    ﾉ: "ノ",
    ﾊ: "ハ",
    ﾋ: "ヒ",
    ﾌ: "フ",
    ﾍ: "ヘ",
    ﾎ: "ホ",
    ﾏ: "マ",
    ﾐ: "ミ",
    ﾑ: "ム",
    ﾒ: "メ",
    ﾓ: "モ",
    ﾔ: "ヤ",
    ﾕ: "ユ",
    ﾖ: "ヨ",
    ﾗ: "ラ",
    ﾘ: "リ",
    ﾙ: "ル",
    ﾚ: "レ",
    ﾛ: "ロ",
    ﾜ: "ワ",
    ｦ: "ヲ",
    ﾝ: "ン",
    ｧ: "ァ",
    ｨ: "ィ",
    ｩ: "ゥ",
    ｪ: "ェ",
    ｫ: "ォ",
    ｯ: "ッ",
    ｬ: "ャ",
    ｭ: "ュ",
    ｮ: "ョ",
    "｡": "。",
    "､": "、",
    ｰ: "ー",
    "｢": "「",
    "｣": "」",
    "･": "・",
  };

  return kanaText
    .split("")
    .map((char) => (Object.hasOwn(kanaMap, char) ? kanaMap[char] : char))
    .join("");
}

// 🔹文字数制限関数
function limitStringLength(input, maxLength) {
  if (input.length > maxLength) {
    return input.substring(0, maxLength);
  }
  return input;
}

// 🔹「兆」「億」「万」「円」を万円単位の数字に変換する関数
function convertToMillions(inputString, isDecimalPoint = false) {
  // 小数点なし
  if (!isDecimalPoint) {
    // 入力文字列が空の場合にはnullを返す
    if (inputString.trim() === "") return null;

    // 全角数字を半角に変換
    inputString = zenkakuToHankaku(inputString);

    // 「兆」「億」「万」「円」が含まれていなければ変換をスキップ 1250 => 1250万円
    if (
      !inputString.includes("兆") &&
      !inputString.includes("億") &&
      !inputString.includes("万") &&
      !inputString.includes("円") &&
      !inputString.includes(",")
    ) {
      return parseInt(inputString, 10);
    }

    // 兆、億、万、円で分割して数値を計算
    let total = 0;
    const trillionMatch = inputString.match(/(\d+(,\d+)*)兆/); // 数字一つ以上とカンマ数字一つ以上か、カンマ無し数字
    const billionMatch = inputString.match(/(\d+(,\d+)*)億/);
    const millionMatch = inputString.match(/(\d+(,\d+)*)万/);

    // 1,000や1,000,000のように単位無しで区切り文字のみ存在する場合は区切り文字を取り除いてそのまま返す
    if (!trillionMatch && !billionMatch && !millionMatch && inputString.includes(","))
      return parseInt(inputString.replace(/,/g, "").replace(/[^\d]/g, ""), 10);

    // trillionMatch[1]はキャプチャグループによって抽出された値 => 今回は\dで任意の数値、+で\dが一回以上の連続した数字
    if (trillionMatch) total += parseInt(trillionMatch[1].replace(/,/g, ""), 10) * 100000000; // 兆の計算
    if (billionMatch) total += parseInt(billionMatch[1].replace(/,/g, ""), 10) * 10000; // 億の計算
    if (millionMatch) total += parseInt(millionMatch[1].replace(/,/g, ""), 10); // 万の計算

    return total;
  } else {
    // 入力文字列が空の場合にはnullを返す
    if (inputString.trim() === "") return null;

    // 全角数字を半角に変換
    inputString = zenkakuToHankaku(inputString);

    // 「兆」「億」「万」「円」が含まれていなければ変換をスキップ 1250 => 1250万円
    if (
      !inputString.includes("兆") &&
      !inputString.includes("億") &&
      !inputString.includes("万") &&
      !inputString.includes("円") &&
      !inputString.includes(",")
    ) {
      return parseFloat(inputString);
    }

    // 兆、億、万、円で分割して数値を計算
    let total = 0;
    const trillionMatch = inputString.match(/(\d+(,\d+)*)兆/); // 数字一つ以上とカンマ数字一つ以上か、カンマ無し数字
    const billionMatch = inputString.match(/(\d+(,\d+)*)億/);
    const millionMatch = inputString.match(/(\d+(,\d+)*)万/);

    // 1,000や1,000,000のように単位無しで区切り文字のみ存在する場合は区切り文字を取り除いてそのまま返す
    if (!trillionMatch && !billionMatch && !millionMatch && inputString.includes(","))
      return parseFloat(inputString.replace(/,/g, "").replace(/[^\d]/g, ""));

    // trillionMatch[1]はキャプチャグループによって抽出された値 => 今回は\dで任意の数値、+で\dが一回以上の連続した数字
    if (trillionMatch) total += parseFloat(trillionMatch[1].replace(/,/g, "")) * 100000000; // 兆の計算
    if (billionMatch) total += parseFloat(billionMatch[1].replace(/,/g, "")) * 10000; // 億の計算
    if (millionMatch) total += parseFloat(millionMatch[1].replace(/,/g, "")); // 万の計算

    return total;
  }
}

// ----------------------------------- Web Workerスクリプト内で使用するヘルパー関数 -----------------------------------ここまで

// Next.jsのコンポーネントのビジネスロジックから
// new Worker('/workers/worker.js')
// new Worker()に「'/workers/worker.js'」のエンドポイントを渡すことで専用ワーカーのインスタンスを作成できる

// new Worker()に渡す引数について:
// new Worker() の引数には、ワーカーが実行するJavaScriptのスクリプトファイルのパスを渡します。ワーカー用のスクリプトファイル（例：worker.js）内に onmessage イベントハンドラを定義し、そこでメッセージを受信して処理を行います。

// Next.js と TypeScript を使用している場合のファイル形式:
// Web Worker はブラウザで直接実行されるJavaScriptのコードが必要です。TypeScriptを使用している場合でも、ワーカー用のスクリプトは純粋なJavaScript（.js）ファイルである必要があります。TypeScriptで書かれたコードはトランスパイルされた後のJavaScriptコードをワーカーに渡す必要があります。

// Next.js プロジェクトでのWeb Workerファイルの置き場所:
// Next.js プロジェクトでは、静的ファイルは通常 public ディレクトリに置かれます。Web Workerのスクリプトも public ディレクトリに配置することが推奨されます。そうすることで、new Worker('/worker.js') のようにパスを指定して簡単にアクセスできます。

// -----------------------------------🔸主なデータ前処理ステップ🔸-----------------------------------
/*
🔴
supabase.jsライブラリのrpcメソッドを使用する場合、基本的にはSupabaseが自動的にSQLインジェクション防止のためのパラメータバインディングを行います。これにより、直接的なSQLインジェクション攻撃から保護されます。しかし、データ前処理を行う際には、以下のような操作が引き続き有効です：

🔹1. データのトリミングと標準化：

・文字列の前後から不要な空白を削除する。
・必要に応じて、全角文字を半角文字に変換するなど、一貫したデータフォーマットを保証する。

🔹2. 文字列の安全なクリーニング：

・不適切な文字や特殊記号の除去（例：制御文字や非表示文字）。
・不必要な特殊文字が入力された場合のサニタイズ処理を行う。

🔹3. 文字数の制限：

・データベースのフィールドサイズに基づいて、適切な文字数制限を設定する。
・これにより、データの整合性を保ちながら、過度に長い文字列による問題を防ぐことができます。

🔹4. エスケープ処理の回避：

・rpcメソッドを使用する場合、サーバーサイドで適切にパラメータがバインドされるため、クライアントサイドでのSQLキーワードのエスケープ処理（シングルクォートを二重にするなど）は必要ありません。
・ただし、サーバーサイドのセキュリティが確実であると信じている場合でも、アプリケーションレベルでの最低限のサニタイズは推奨されます。

🔹5. 入力バリデーション：

・ユーザーからの入力が予期したフォーマットやデータ型であるかを確認する。
・例えば、数値が期待されるフィールドに文字列が入力されていないか等をチェックします。

これらの前処理は、主にデータの整合性を保ち、予期せぬエラーやデータの不整合を防ぐために重要です。Supabaseが多くの安全対策を提供しているとはいえ、アプリケーションレベルで適切なデータ処理を行うことが最良です。


🔴
🔹2. 文字列の安全なクリーニングの実装例
・不適切な文字や特殊記号の除去
特にWebアプリケーションにおいては、制御文字や非表示文字が混入することは珍しくありません。これらは表示上は見えないものの、データベースやアプリケーションの挙動に悪影響を及ぼすことがあります。JavaScriptでの実装例は以下の通りです：

function sanitizeString(input) {
  // 制御文字と非表示文字の除去
  const sanitized = input.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  return sanitized;
}

・不必要な特殊文字の除去
SQLインジェクションやXSS（クロスサイトスクリプティング）を防ぐために、特定の記号を削除することも考えられます。
例として、
;, --, /* ... */
/*
を削除する方法を示しますが、これらは通常SQLインジェクション攻撃に使われる記号です。

function cleanUpSymbols(input) {
  // SQLインジェクション攻撃に使われる記号の除去
  const cleanInput = input.replace(/;|--|\/\*|\*\//g, "");
  return cleanInput;
}

・SQL危険な文字のエスケープ シングルクォートとダブルクォート
Web Workerで事前にいくつかのエスケープ処理を行う場合は、例えばシングルクォートをエスケープする基本的な方法

processedValue = processedValue.replace(/'/g, "''"); // シングルクォートを二重にする

シングルクォートを二重にする意味
SQLにおいてシングルクォート（'）は、文字列リテラルの開始と終了を示すために使用されます。もしユーザー入力の文字列がシングルクォートを含んでいる場合、そのままSQL文に挿入されるとクエリが意図しない方法で終了してしまい、SQLインジェクションの原因となる可能性があります。例えば、ユーザーが 'Robert'; DROP TABLE students; -- といった入力を行った場合、これが処理されないと危険です。

シングルクォートを二重にする（''）ことにより、SQLインタープリタはこれを文字列内のシングルクォートとして解釈し、文字列の一部として適切に扱います。これにより、SQLインジェクションのリスクを軽減します。

ダブルクォート
PostgreSQLでは、ダブルクォート(")は主に識別子（テーブル名、カラム名など）を囲むのに使用されます。特に、識別子がPostgreSQLのキーワードや、大文字・小文字を区別する必要がある場合、またはスペースなどの特殊文字を含む場合にダブルクォートが必要になります。

ダブルクォートのエスケープ処理
SQLインジェクションを防ぐためにユーザー入力から来る識別子やSQLの一部としてダブルクォートをエスケープする必要がある場合、ダブルクォートは通常、それ自体を重ねることでエスケープされます。つまり、ダブルクォート内でダブルクォートを使用するには、それを二重にします。

let input = 'some "risky" string';
input = input.replace(/"/g, '""'); // ダブルクォートを二重にする



🔹3. 文字数の制限の実装例
データベースの各カラムに設定されている最大文字数に基づいて、入力されるデータの文字数を制限することが重要です。これはデータベースへの挿入前に行うべき処理で、例えば以下のように実装することができます：
この関数を使用して、ユーザー入力をデータベースのカラムサイズに合わせて制限します。例えば、部署名が最大50文字の場合は以下のように呼び出します：
これにより、データの整合性を保ちながら、データベースエラーの発生を防ぐことができます。また、セキュリティの観点からも、過度に長い入力を制限することで、潜在的な攻撃のリスクを軽減することができます。

function limitStringLength(input, maxLength) {
  return input.substring(0, maxLength);
}
const departmentName = limitStringLength(userInput, 50);

🔹4. エスケープ処理の回避の実装例
アプリケーションレベルでのサニタイズは、セキュリティを向上させるための重要な手段です。以下は、アプリケーションレベルで行うべきサニタイズのベストプラクティスです：

1. ユーザー入力の検証
入力検証（Validation）：データが期待される形式であることを確認します。例えば、電話番号や郵便番号は数字のみで構成されるべきですし、Eメールアドレスには特定の形式が求められます。
型検証：入力されたデータが適切なデータ型であるかを検証します（例：文字列、数値、日付）。

2. 文字列の正規化とクリーニング
トリミング：余分な空白を削除します。
エンコーディングの正規化：文字列を適切なエンコーディング形式（例：UTF-8）に正規化します。
制御文字の削除：非表示文字や制御文字を削除することで、SQLインジェクションやXSS攻撃のリスクを低減します。

3. SQLインジェクションの防止
パラメータ化クエリの使用：ユーザー入力を直接SQL文に組み込むのではなく、パラメータとして渡すことでSQLインジェクション攻撃を防ぎます。
エスケープ処理の回避：可能な限りエスケープ処理に頼らず、パラメータ化クエリを使用します。

4. XSS攻撃（クロスサイトスクリプティング）の防止
HTMLエスケープ：ユーザーからの入力をHTMLとしてレンダリングする前に、HTML特殊文字（例：<, >, &）をエスケープします。
コンテンツセキュリティポリシー（CSP）の設定：ブラウザに対し、どのスクリプトが実行されるべきかを指示するポリシーを設定します。

5. APIレベルでのセキュリティ
APIリクエストのレート制限：DDoS攻撃やブルートフォース攻撃を防ぐため、APIエンドポイントに対するリクエスト数を制限します。
APIキーの使用：APIキーを使用して、APIの利用を認証し、未承認アクセスを防ぎます。

これらの手法を適切に組み合わせて使用することで、アプリケーションのセキュリティを向上させることができます。各アプリケーションの具体的なニーズに応じて、これらのプラクティスをカスタマイズすることが重要です。

*/
// -----------------------------------🔸主なデータ前処理ステップ🔸-----------------------------------ここまで

// -----------------------------------🔸カラムごとの前処理関数🔸-----------------------------------
// 🔸法人名(corporate_name)の正規化・標準化 -----------------------------------
// 会社名は「法人名 拠点名」で最終的に結合してセット
// 【正規表現の構成要素】
// 半角に変換 「\uFF01-\uFF5D」 => 「\u0021-\u007D
// 「ａ-ｚＡ-Ｚ０-９」 全角英数字(ａ-ｚＡ-Ｚ０-９) 記号(（）＋％＆など)はそのまま
// 「\uFF01-\uFF5D」 全角英数字(ａ-ｚＡ-Ｚ０-９)と記号(（）＋％＆など) 全角チルダ（\uFF5E）を除外

// 【下記の指定した文字のみ会社名として許可 それ以外は空文字にリプレイス [^...]】

// ・a-zA-Z0-9: 半角英数字
// ・ （半角スペース）
// ・\u3000-\u303F：全角の記号と句読点(\u3000：全角スペース)
// ・\u3040-\u309F: ひらがな   (\p{Hiragana})
// ・\u30A0-\u30FF: 全角カタカナ  (\p{Katakana})
// ・\uFF65-\uFF9F: 半角ｶﾀｶﾅ
// ・\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u3005: 漢字 \u3005: 「々」（繰り返し記号）  (\p{Han})
// ・\u30FC: 全角の長音符(カタカナの長音符)
// ・\u002D: 半角ハイフン（-）
// ・\u002E: 半角ピリオド（.）
// ・\u0027: 半角アポストロフィ（'） - 企業名における所有格や略語でよく使用されます（例: O'Reilly, Ben's）
// ・\u005F: アンダースコア（_） - 特に技術関連の企業や製品名に使われることがあります
// ・\uFF08\uFF09\u0028\u0029: 全角半角括弧
//   ・\uFF08: （ 全角括弧
//   ・\uFF09: ） 全角括弧
//   ・「(」（左半角括弧）: \u0028
//   ・「)」（右半角括弧）: \u0029
// ・「・」（全角中点）: \u30FB
// ・「･」（半角中点）: 通常、この文字は特定のUnicode値を持たず、一般的なJISやシフトJISの文字セットに存在するため、そのままセット
// ・\u301C\uFF5F: 「〜」(全角チルダ) Windowsでは\uFF5F
// ・\u300C-\u3011: 鉤括弧
//    ・\u300C: 「
//    ・\u300D: 」
//    ・\u300E: 『
//    ・\u300F: 』
//    ・\u3010: 【
//    ・\u3011: 】

// 許容しない
// ・ａ-ｚＡ-Ｚ０-９: 全角英数字
// ・\u3000-\u303D：全角の記号と句読点(\u3000：全角スペース)
// ・\uFF65-\uFF9F: 半角ｶﾀｶﾅ

function normalizeCompanyName(name) {
  // 全角英数字と全角スペースを半角に変換 「\uFF01-\uFF5D」 全角英数字(ａ-ｚＡ-Ｚ０-９)と記号(（）＋％＆など)「〜」は除く
  let halfName = name
    .replace(/[\uFF01-\uFF5D]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[\s　]+/g, " ")
    .trim();

  // 半角ｶﾀｶﾅを全角に変換
  let formattedName = convertKanaHalfWidthToFullWidth(halfName);

  // limitStringLength
  let normalizedCompanyName = formattedName.replace(
    /[^a-zA-Z0-9 \u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF65-\uFF9F\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u3005\u30FC\u002D\u002E\u0027\u005F\uFF08\uFF09\u0028\u0029\u30FB･\u301C\uFF5F\u300C-\u3011]+/gu,
    ""
  );

  // 60 文字以上の場合は文字数を 60 文字までに制限
  return limitStringLength(normalizedCompanyName, 60);
}

// 🔸拠点名(branch_name)の正規化・標準化 -----------------------------------
function normalizeBranchName(branchName) {
  // 【正規表現の構成要素】
  // => 会社名と同じ

  // 空文字の場合はnullをセット
  return branchName ? normalizeCompanyName(branchName) : null;
}

// 🔸部署名(department_name)の正規化・標準化 -----------------------------------
function normalizeDepartmentName(department) {
  // 【正規表現の構成要素】
  // => 会社名と同じ

  // 部署名が空文字の場合はピリオドをセット
  return department ? normalizeCompanyName(department) : ".";
}

// 🔸代表TEL・電話番号(main_phone_number)の正規化・標準化 -----------------------------------
function normalizePhoneNumber(phoneNum) {
  // 全角数字、ハイフン、プラス、括弧を半角に変換
  const halfWidthTel = phoneNum
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/[\-−ー－]/g, "-") // ハイフンの種類を統一
    .replace(/＋/g, "+")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/[\s　]+/g, ""); // 全角・半角スペースを削除

  // 不適切な文字の削除（数字、ハイフン、プラス、括弧以外を削除）
  const formattedNumber = halfWidthTel.replace(/[^\d\-\+\(\)]/g, "");

  // バリデーションチェック
  const regexPhone = /^[\d\-\+\(\)]+$/;
  const isValid = regexPhone.test(formattedNumber);
  return isValid ? limitStringLength(formattedNumber, 15) : null;
}

// 🔸代表Fax(main_fax)の正規化・標準化 -----------------------------------
function normalizeFax(fax) {
  // => 代表TELと同じ
  return normalizePhoneNumber(fax);
}

// 🔸郵便番号(zipcode)の正規化・標準化 -----------------------------------
function normalizePostalCode(postalCode, useJapanPostalFormat = true) {
  /*
日本の郵便番号の形式: 123-4567 または 1234567

英語圏（例：アメリカ、イギリス）
アメリカ（ZIP Code）: 基本形式は5桁の数字（例: 12345）、拡張形式では4桁の数字をハイフンで区切って追加（例: 12345-6789）。
イギリス: 英字と数字の組み合わせで構成される複雑な形式（例: SW1A 1AA）。
中国
中国: 一般的に6桁の数字で構成される（例: 100000）。
インド
インド: 6桁の数字で構成されることが多い（例: 110001）。

イギリス: 英字と数字を組み合わせ、スペースで区切る形式（例: SW1A 1AA）。
アメリカ合衆国: 数字のみ、または数字にハイフンを含む形式（例: 12345、12345-6789）。
カナダ: 英字と数字の組み合わせ、スペースまたはハイフンで区切る形式（例: K1A 0B1）。
ヨーロッパの多くの国: 数字のみ、または数字と英字の組み合わせ（例: 1010、75008）。
オーストラリア、インド、中国など: 主に数字のみの形式。
*/
  let formattedPostalCode = postalCode.trim(); // 基本的なトリミング;

  // 日本の郵便番号フォーマット 7桁の数字のみ許可
  if (useJapanPostalFormat) {
    // フォーマット
    const halfWidth = postalCode
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)) // 全角数字を半角に変換
      .replace(/[^0-9]/g, ""); // 半角数字のみ除去

    formattedPostalCode = halfWidth;

    // 半角数字7桁を許容
    const regex = /^[0-9]{7}$/; // 半角数字7桁のみかチェック
    const isValid = regex.test(formattedPostalCode);

    return isValid ? formattedPostalCode : null;
    // return { isValid, formattedPostalCode };
  }
  // 国際郵便番号フォーマット 半角英数字 ハイフンスペース
  else {
    const halfWidth = formattedPostalCode
      .replace(/[Ａ-Ｚａ-ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)) //
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      .replace(/[\s　]+/g, " ") // 全角スペースを半角スペースに変換
      .replace(/ー/g, "-") // 「ソニー」の「ー」長音符を半角ハイフンに変換
      .replace(/－/g, "-") // 全角ハイフンを半角に変換
      .replace(/−/g, "-"); // 全角ハイフンを半角に変換 // カタカナの長音記号も半角ハイフンに変換

    // 郵便番号は7桁でハイフンなしにフォーマット (郵便局の町域データの郵便番号もハイフンなしのため)
    formattedPostalCode = halfWidth.replace("-", "");

    // 数字、英字、ハイフン、スペースを許容
    const regex = /^[0-9A-Za-z\s\-]+$/;
    const isValid = regex.test(formattedPostalCode);

    return isValid ? formattedPostalCode : null;
  }
}

// 🔸住所の正規化・標準化 データクレンジング -----------------------------------

// 【日本と英語圏の住所標準化】
/*
 1. 正規化：
    ・全角文字を半角に変換
    ・不要なスペース、記号の削除 ・日本住所では、全角数字と全角ハイフンを半角に変換
 2. 型式の統一(住所要素を一定の順序で配置)
    ・日本：国名・郵便番号・都道府県・市区町村・番地・建物名
    ・英語圏：通りの名前・番地・市名・襲名・郵便番号
 3. 不要な情報の削除
    ・住所以外の「角の薬局まで来てください」などの指示などを削除
 4. データ検証
    ・可能であれば、郵便番号の正確性を検証し、存在しない住所や誤った郵便番号を修正

// ・\uFF01-\uFF5E: 全角の英数字や記号の範囲
// ・ch.charCodeAt(0) - 0xFEE0: 各文字のUnicodeコードポイントから 0xFEE0 を引くことで、対応する半角文字のコードポイントに変換します。
*/

// -----------------------------------🔸address🔸-----------------------------------
function normalizeAddress(address, groupedTownsByRegionCity) {
  address = address.trim(); // 基本的なトリミング
  // 🔹1. 正規化
  // 全角英数字と全角記号の両方を半角に変換 「\uFF01-\uFF5E」\uFF5E(全角チルダ)含める 全角英数字(ａ-ｚＡ-Ｚ０-９)と記号(（）＋％＆など)
  address = address.replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));

  // 全角ハイフンと全角スペースを半角に変換(長音「ー」はそのまま残す) *3
  address = address.replace(/ー/g, "-").replace(/\u3000/g, " ");

  // 連続するスペースを1つに正規化
  address = address.replace(/[\s+]/g, " "); // 全角スペースを半角に変換後、連続するスペースを１つの半角スペースに正規化 (\s: すべての空白文字（半角スペース、タブ、改行など(全角スペースは含まない))

  // 🔹2. 形式の統一
  // 2-1. 各住所の要素を取り出しやすくするため住所の全ての空白を除去した変数を作成
  // 2-2. 日本か英語圏かの識別 都道府県Setオブジェクトにマッチすれば日本の住所 / 番地から始まっていれば英語圏の住所
  // 【日本の住所の形式統一】
  // 2-3. 都道府県Setオブジェクトにマッチした場合は変数から都道府県を取り出す
  // 2-4. 取り出した都道府県に対応する市区町村Setオブジェクトにマッチするかチェックし、マッチしたら市区町村を取り出す
  // 2-5. 「町域名・丁目・番地・号・建物名」はstreet_addressに格納
  // 2-6. 取り出した住所の各要素を結合して、番地と建物名の間に半角スペースをセットする

  // 日本の住所 形式統一

  // 各住所のセクションごとに格納
  // townは一致する町域名が抽出できた時にそのtown_idをtown_idカラムにセットする
  const addressElements = {
    prefecture: null,
    city: null,
    street_address: null,
  };

  // region_id, city_id, town_id
  const responseElements = {
    address: null, // addressElementsを結合した値
    prefecture: null,
    city: null,
    street_address: null,
    country_id: 153,
    region_id: null,
    city_id: null,
    normalized_town_name: null,
    grouped_towns_by_cities: null, // 都道府県名・市区町村名に対応する町域リストとzipcodeの値を使用して、町域データを取得するため
  };

  try {
    // 🔸都道府県の抽出
    const prefectureMatch = address.match(regExpPrefecture);
    // 適切な住所が入力されていなければ、この行データ自体をnullで返し、最後に削除
    if (!prefectureMatch) throw new Error("都道府県が見つかりませんでした。");
    addressElements.prefecture = prefectureMatch[1];
    // region_idセット
    responseElements.region_id = regionsNameToIdMapJp.get(prefectureMatch[1]) ?? null;

    // 🔸市区町村の抽出
    const regExpCity = regionNameToRegExpCitiesJp[addressElements.prefecture];
    const cityMatch = address.match(regExpCity);
    if (!cityMatch) throw new Error("市区町村が見つかりませんでした。");
    addressElements.city = cityMatch[1]; // 0はマッチ全体の文字列で 1はキャプチャグループでマッチした１つ目の文字
    // city_idセット
    const cityNameToIdMap = regionNameToIdMapCitiesJp[addressElements.prefecture];
    responseElements.city_id = cityNameToIdMap.get(cityMatch[1]) ?? null;

    // 🔸正規化された町域名の取得
    // 抽出した都道府県名と市区町村名に一致する町域リストを取得
    let townsList = [];
    if (Object.hasOwn(groupedTownsByRegionCity, addressElements.prefecture)) {
      const prefectureObj = groupedTownsByRegionCity[addressElements.prefecture];
      if (Object.hasOwn(prefectureObj, addressElements.city)) {
        townsList = prefectureObj[addressElements.city];
      }
    }

    // 町域リストが取得できなかった場合は、都道府県名と市区町村名を除く残りの値をstreet_addressにセットしてリターン
    if (0 < townsList.length) {
      // 町域リストを格納
      responseElements.grouped_towns_by_cities = townsList;

      // 正規化した町域名のみ配列にまとめて、重複があるので、Setオブジェクトに変換して一意にする
      const townNamesSet = new Set(townsList.map((obj) => obj.normalized_name));

      // 一意な町域名の一覧を使用して正規表現を作成(キャプチャグループ)
      const regexTowns = new RegExp("(" + Array.from(townNamesSet).join("|") + ")", "g");

      // 都道府県名と市区町村名を除く住所を変数に格納
      const addressWithoutCity = address
        .replace(addressElements.prefecture, "")
        .replace(addressElements.city, "")
        .trim();

      // 町域名をチェック マッチしたならtown_idをセット 町域名は完全でないので、そのままstreet_addressに残りをセット
      const matchTown = addressWithoutCity.match(regexTowns);
      if (matchTown) {
        responseElements.normalized_town_name = matchTown[1];
      }
    }

    // 🔸市区町村以下の情報を一括して扱う; 結城市大字七五三場六百四十五番地七 建物名 のように
    // 「丁目・番地(番)・号」が漢数字の場合、「町名(地名)」と「丁目・番地(番)・号」や
    // 「六百四十五番地七」と「一二三ビル」のように両者の末尾と先頭が漢数字場合の境界を正確に特定するのが困難のため
    addressElements.street_address = addressWithoutCity;

    // 🔸prefecture, city, street_addressを全て結合して標準化したaddressを返す
    const { prefecture, city, street_address } = addressElements;
    responseElements.address = prefecture + city + street_address ?? "";

    return responseElements;
  } catch (error) {
    console.log("❌addressカラムの標準化に失敗しました エラー：", error);
    return null;
  }
}
// -----------------------------------🔸address🔸-----------------------------------ここまで

// 🔸代表者名(representative_name)の正規化・標準化 -----------------------------------
// 会長(chairperson)・副社長(senior_vice_president)・専務取締役(senior_managing_director)・常務取締役(managing_director)・取締役(director)・役員(board_member)・監査役(auditor)・部長(manager)・担当者(member)でも使用
// 【正規表現の構成要素】
// 半角に変換
// 「\uFF01-\uFF5E」 全角英数字(ａ-ｚＡ-Ｚ０-９)と記号(（）＋％＆など)

// 許容
// ・a-zA-Z: 半角英字
// ・0-9: 半角数字  (衛宮士郎(~部第2課)なども許容するため)
// ・` `（半角スペース）
// ・\u3040-\u309F: ひらがな   (\p{Hiragana})
// ・\u30A0-\u30FF: 全角カタカナ  (\p{Katakana})
// ・\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u3005: 漢字 \u3005: 「々」（繰り返し記号）  (\p{Han})
// ・\u30FC: 全角の長音符(カタカナの長音符)
// ・\uFF08\uFF09\u0028\u0029: 全角半角括弧
//    \uFF08: （ 全角括弧
//    \uFF09: ） 全角括弧
//    「(」（左半角括弧）: \u0028
//    「)」（右半角括弧）: \u0029
// ・
// ・\u002D: 半角ハイフン（-）
// ・\u005F: アンダースコア（_） - 特に技術関連の企業や製品名に使われることがあります
// ・「・」（全角中点）: \u30FB
// ・「･」（半角中点）: 通常、この文字は特定のUnicode値を持たず、一般的なJISやシフトJISの文字セットに存在するため、そのままセット
// ・\u002E: 半角ピリオド（.）
// ・\u0027: 半角アポストロフィ（'） - 企業名における所有格や略語でよく使用されます（例: O'Reilly, Ben's）
// ・\u301C\uFF5F: 「〜」(全角チルダ) Windowsでは\uFF5F

// 許容しない
// ・０-９: 全角数字
// ・ａ-ｚＡ-Ｚ: 全角英数字
// ・\u3000-\u303F：全角の記号と句読点(\u3000：全角スペース)
// ・\uFF65-\uFF9F: 半角ｶﾀｶﾅ

function normalizeRepresentativeName(name) {
  // 「\uFF01-\uFF5E」 全角英数字(ａ-ｚＡ-Ｚ０-９)と記号(（）＋％＆など)
  let halfName = name
    .replace(/[ａ-ｚＡ-Ｚ０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)) // 全角英字を半角に変換
    .replace(/[\s　]+/g, " ") // 全角スペースを半角スペースに変換
    .trim();

  // 半角ｶﾀｶﾅを全角に変換
  let formattedName = convertKanaHalfWidthToFullWidth(halfName);

  // 【下記の指定した文字のみ許可 それ以外は空文字にリプレイス [^...]】 結果が空文字ならnullをセット
  formattedName =
    formattedName.replace(
      /[^a-zA-Z0-9 \u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u3005\u30FC\uFF08\uFF09\u0028\u0029\u002D\u005F\u30FB･\u002E\u0027\u301C\uFF5F]+/gu,
      ""
    ) || null;

  if (!!formattedName) {
    // 50文字まで
    return limitStringLength(formattedName, 50);
  } else {
    return null;
  }
}

// 🔸会長(chairperson)の正規化・標準化 -----------------------------------
// "chairperson": // 会長
// "senior_vice_president": // 副社長
// "senior_managing_director": // 専務取締役
// "managing_director": // 常務取締役
// "director": // 取締役
// "board_member": // 役員
// "auditor": // 監査役
// "manager": // 部長
// "member": // 担当者

// 半角に変換 「\uFF01-\uFF5D」 => 「\u0021-\u007D」
// 「\uFF01-\uFF5D」 全角英数字(ａ-ｚＡ-Ｚ０-９)と記号(（）＋％＆など)「〜」除く

// 許容
// ・「\u0021-\u007E」: 半角英数字~記号(全角から変換後) 半角の「/」（\u002F）含む 全角の「／」（\uFF0F）から「0xFEE0」を引いたもの
// ・「\uFF01-\uFF5E」: 全角英数字~記号
// ・\uFF5F\u301C: 「〜」(全角チルダ) Windowsでは\uFF5F
// ・a-zA-Z: 半角英字
// ・0-9: 半角数字  (衛宮士郎(~部第2課)なども許容するため)
// ・\uFF65-\uFF9F: 半角ｶﾀｶﾅ
// ・` `（半角スペース）
// ・\u3040-\u309F: ひらがな   (\p{Hiragana})
// ・\u30A0-\u30FF: 全角カタカナ  (\p{Katakana})
// ・\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u3005: 漢字 \u3005: 「々」（繰り返し記号）  (\p{Han})
// ・\u30FC: 全角の長音符(カタカナの長音符)
// ・\u002D: 半角ハイフン（-）
// ・\u002E: 半角ピリオド（.）
// ・\u0027: 半角アポストロフィ（'） - 企業名における所有格や略語でよく使用されます（例: O'Reilly, Ben's）
// ・\u005F: アンダースコア（_） - 特に技術関連の企業や製品名に使われることがあります
// ・\uFF08\uFF09\u0028\u0029: 全角半角括弧
//    ・\uFF08: （ 全角括弧
//    ・\uFF09: ） 全角括弧
//    ・「(」（左半角括弧）: \u0028
//    ・「)」（右半角括弧）: \u0029
// ・\u30FB: 「・」（全角中点）
// ・「･」（半角中点）: 通常、この文字は特定のUnicode値を持たず、一般的なJISやシフトJISの文字セットに存在するため、そのままセット
// ・\u300C-\u3011: 鉤括弧
//    ・\u300C: 「
//    ・\u300D: 」
//    ・\u300E: 『
//    ・\u300F: 』
//    ・\u3010: 【
//    ・\u3011: 】
// ・\u3012: 「〒」
// ・\u3001: 「、」
// ・\n: 改行

// 許容しない
// ・ａ-ｚＡ-Ｚ０-９: 全角英数字
// ・\u3000-\u303D：全角の記号と句読点(\u3000：全角スペース)

// 複数名を許可: 下記が例
// 【常務執行役員】阿黒  大輔、【執行役員】高橋  正行　　辻井  幸弘　　友澤  俊一　関澤  正人　　高橋  敬　　　小泉  修司
// 常務取締役 ／ 塩貝 哲也
function normalizeContactNames(name) {
  // 全角英数字と全角スペースを半角に変換 記号はそのままにしておく 「\uFF01-\uFF5D」 全角英数字(ａ-ｚＡ-Ｚ０-９)と記号(（）＋％＆など)「〜」は除く
  let halfName = name
    .replace(/[ａ-ｚＡ-Ｚ０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[\s　]+/g, " ")
    .trim();

  // 「a-zA-Z0-9」 => 「\uFF01-\uFF5D\u0021-\u007D」
  let normalizedCompanyName = halfName.replace(
    /[^\u0021-\u007E\uFF01-\uFF5E\u301C \u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF65-\uFF9F\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u3005\u30FC\u002D\u002E\u0027\u005F\uFF08\uFF09\u0028\u0029\u30FB･\u300C-\u3011\u3012\u3001\n]+/gu,
    ""
  );

  // 300 文字以上の場合は文字数を 300 文字までに制限
  return limitStringLength(normalizedCompanyName, 300);
}

// 🔸ホームページURL・Webサイト URL(website_url)の正規化・標準化 -----------------------------------

// 「https://www.example.com/dashboard」のURLの構成 => DBにはオリジン部分を保存する
// protocol(scheme): https:
// host: www.example.com
// pathname: /dashboard
// origin: https://www.example.com
// href: https://www.example.com/dashboard

function normalizeWebSiteURL(url) {
  // トリミングとプロトコルの確認と追加
  let normalizedUrl = url.trim();

  if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  // new URL() を使用して、URLが有効かどうかを確認し、さらに正規化することも可能です。不完全または相対URLが渡された場合、new URL() はエラーを投げるので、これをトライ・キャッチブロックで捕捉できます。

  try {
    // new URL() を使用して、URLが有効かどうかチェック 無効なURLの場合はエラーを投げるためcatchブロックで補足
    const urlObj = new URL(normalizedUrl);

    // ドメイン名のみ小文字に変換
    urlObj.hostname = urlObj.hostname.toLowerCase();

    // urlObj.origin プロパティはスキーマ(プロトコル)、ホスト名（小文字に変換された後のもの）、およびポート（存在する場合）を含む完全なオリジンを返します。これにより、ウェブサイトの基本アドレスのみを保存し、余分なパスやクエリパラメータは除外されます。
    return urlObj.origin; // オリジン部分だけを返す(プロトコル、ドメイン名、必要に応じてポート番号)
  } catch (error) {
    // 無効なURLのためnullを返す
    return null;
  }
}
// 🔸Email(email)の正規化・標準化 -----------------------------------
// RFC5322はInternet Message Format(IMF)となっており、電子メールの形式を定義
/*
🔹メールアドレスの構成

  local@domain

・local: 最大64文字まで
・domain: 最大255文字
・@ の直前(local部分)に . を置くことや連続して . を置くことは禁止
・メールアドレスのlocal部分の文字列にはdot-atom形式とquoted-string形式が許可されていて
・domain部分には、dot-atom形式の文字が許可されている

🔹dot-atom形式
・RFC 5322によると、atextで定義される一連の文字に基づく形式。
atext には英数字（A-Z, a-z, 0-9）や特定の記号（!#$%&'*+-/=?^_`{|}~）が含まれる。
この形式では、これらの文字の間に点（.）が入ることができますが、連続した点（..）や点で始まることは許されません。

・dot-atom形式のlocal部分の使用例：「++*start_{}@domain.com」でもOK

🔹quoted-string形式
quoted-string: この形式では、ダブルクォート（"）で囲まれた任意のテキストが使用できます。この中では、ほぼすべてのASCII文字（バックスラッシュ \ とダブルクォートを除く）が使用可能で、バックスラッシュ \ はエスケープ文字として機能し、通常は禁止されている文字（例えば、改行やダブルクォート自体）を含めることができます。

・quoted-string形式のlocal部分の使用例：「"start \s-"@domain.com」

解釈の確認
dot-atom形式: おっしゃる通り、アルファベット、数字、特定の記号から成り、ピリオドを含むことができますが、ピリオドの使用には制限があります。
quoted-string形式: バックスラッシュでエスケープされた任意の文字やスペースを含むことができ、ダブルクォートで囲まれている必要があります。

はい、おっしゃる通りです。メールアドレスのlocal部分で、quoted-string形式とdot-atom形式はそれぞれ異なる種類の使用を許可しています。

Quoted-string形式
quoted-string 形式では、ダブルクォートで囲まれた内部であれば、スペースやエスケープされた特殊文字を含めることが可能です。例えば、「"start \s-"@domain.com」のようなメールアドレスは、この形式で正当です。
Dot-atom形式
dot-atom 形式では、英数字や指定された記号を使用できます。記号間にスペースを入れることはできませんが、連続して使用することは可能です。したがって、「++*start_{}@domain.com」というメールアドレスも、local部分がdot-atom形式に適合していれば有効です。

*/
function normalizeEmail(email) {
  // const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // 🌠正式にフロントエンドで使用するlocal部分とDomain部分の正規表現をdot-atom形式に対応したバリデーションチェック
  // local部分とdomain部分を合わせた形でメールアドレス全体のバリデーションチェックをする際にdot-atom形式のみに対応した正規表現
  // (quoted-string形式には対応せず、dot-atom形式のみに対応した正規表現)

  // 【2段階のバリデーションチェック】

  try {
    // トリミングと小文字化
    const normalizedEmail = email.trim().toLowerCase();
    // 1. メールアドレスがdot-atom形式に対応しているか構文チェック atextと(.)ドットのみ許可 連続したdotは禁止,先頭末尾のdotも禁止
    // atext: 英数字（A-Z, a-z, 0-9）や特定の記号（!#$%&'*+-/=?^_`{|}~）
    const regexEmailDotAtom =
      /^[a-zA-Z0-9_+%\-]+(\.[a-zA-Z0-9_+%\-]+)*@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,}$/;
    const isValidDotAtom = regexEmailDotAtom.test(normalizedEmail);

    if (!isValidDotAtom) throw new Error("メールアドレスの形式が有効ではありません。");

    // 2. 文字数チェック local部分: 最大64文字, domain部分: 最大255文字
    const regexEmailLength = /^(?=.{1,64}@)(?=.{1,255}$)/;
    const isValidLength = regexEmailLength.test(normalizedEmail);

    if (!isValidLength) throw new Error("メールアドレスの長さが規定を超えています。");

    return normalizedEmail;
  } catch (error) {
    console.log("Worker: email前処理エラー: ", error);
    return null;
  }
}

// 🔸業種(industry_type_id)の正規化・標準化 -----------------------------------
// 業種別のキーワードセット
const industryKeywords = {
  1: ["自動車", "輸送", "モビリティ", "AUTOMOTIVE", "車"], // 自動車・輸送機器
  2: ["電子", "半導体", "光学", "基板", "チップ", "FPC", "コイル", "フレキ", "ケーブル", "端子", "コネクタ", "電池"], // 電子部品・半導体
  3: ["IT", "ソフト", "テクノロジー", "SaaS", "データベース", "DX", "情報", "通信", "ネットワーク"], // IT・情報通信・ソフトウェア
  4: ["機械要素", "部品", "ねじ", "ボルト", "ベアリング", "ファスナー", "パーツ", "シャフト"], // 機械要素・部品
  5: ["加工", "プレス", "切削", "旋盤", "マシニング", "フライス"], // 製造・加工受託
  6: ["鉄", "非鉄"], // 鉄/非鉄金属
  7: ["産業用機械", "空調用ヒーター", "熱交換器", "洗浄機"], // 産業用機械
  8: ["産業用電気機器", "電機"], // 産業用電気機器
  9: ["民生用電気機器"], // 民生用電気機器
  10: ["樹脂", "プラスチック", "化成", "樹脂切削", "FRP", "GFRP", "CFRP"], // 樹脂・プラスチック
  11: ["ゴム", "シリコーン", "シール", "パッキン", "Oリング"], // ゴム製品
  12: ["化学", "ケミカル"], // 化学
  13: ["セラミック", "石英", "ダイヤモンド", "ジルコニア", "アルミナ"], // セラミックス
  14: ["繊維", , "フエルト", "フェルト", "糸", "ファイバー", "不繊布"], // 繊維
  15: ["ガラス", "硝子"], // ガラス製品
  16: ["CAD", "CAM", "CAE"], // CAD/CAM
  17: ["航空", "宇宙", "エアロ", "スペース", "SPACE"], // 航空・宇宙
  18: ["建材", "資材", "什器"], // 建材・資材・什器
  19: ["造船", "重機", "船舶"], // 造船・重機
  20: ["環境", "プラント", "水処理", "廃棄物"], // 環境
  21: ["印刷", "銘板", "転写", "PRINT", "ラベル", "プリンタ"], // 印刷業
  22: ["鉱業", "鉱物"], // 鉱業
  23: ["紙", "包装", "パルプ", "段ボール", "ダンボール"], // 紙・包装資材・パルプ
  24: ["ロボット", "ROBOT", ""], // ロボット
  25: ["試験", "分析", "測定"], // 試験・分析・測定
  26: ["エネルギー"], // エネルギー
  28: ["食品機械"], // 食品機械
  27: ["飲料", "食料", "食品"], // 飲食料品
  29: ["光学機器"], // 光学機器
  30: ["医療機器"], // 医療機器
  31: ["その他製造"], // その他製造
  32: ["金融", "証券", "保険"], // 金融・証券・保険業
  33: ["商社", "卸売"], // 商社・卸売
  34: ["広告", "メディア"], // 広告・メディア
  35: ["不動産"], // 不動産
  36: ["建設", "建築"], // 建設
  37: ["物流", "運送", "倉庫"], // 物流・運送・倉庫関連
  38: ["教育"], // 教育・研究機関
  39: ["石油", "石炭"], // 石油・石炭関連
  40: ["製薬", "医薬"], // 製薬・医薬品・バイオ
  41: ["医療", "福祉"], // 医療・福祉
  42: ["化粧品"], // 化粧品
  43: ["小売"], // 小売
  44: ["飲食", "レストラン", "居酒屋", "カフェ"], // 飲食店
  45: ["宿泊", "ホテル", "民泊"], // 宿泊業
  46: ["サービス"], // サービス業
  47: ["水産", "農林"], // 水産・農林業
  48: ["警察", "消防", "自衛隊"], // 警察・消防・自衛隊
  49: ["公益", "独立行政法人", "NPO", "公共団体"], // 公益・特殊・独立行政法人
  50: ["電力", "火力", "水力", "発電", "ガス", "水道", "エネルギー"], // 電気・ガス・水道業
  51: ["官公庁"], // 官公庁
  52: ["自営業", "個人", "フリーランス"], // 自営業・個人
  53: ["その他"], // その他
};

function normalizeIndustryType(industryName) {
  if (!industryName) return null;

  // 全角英数字を半角に 「\uFF01-\uFF5E」 全角英数字(ａ-ｚＡ-Ｚ０-９)と記号(（）＋％＆など)
  let normalizedName = industryName
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)) // 全角英字を半角に変換
    .replace(/[\s　]+/g, "") // スペースを除去
    .trim();

  // 半角ｶﾀｶﾅを全角に変換
  normalizedName = convertKanaHalfWidthToFullWidth(halfName);

  // それぞれの業種に関連するキーワードにマッチした業種idをリターン
  function findIndustryId(industryName) {
    for (const [industryId, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some((keyword) => industryName.includes(keyword))) {
        return industryId; // マッチした業種IDを返す
      }
    }
    return null; // マッチする業種がなかった場合はnullを返す
  }

  // 大文字に変換して大文字小文字関係なくキーワードマッチを実行
  return findIndustryId(normalizedName.toUpperCase());
}

// 🔸業界大分類(industry_large)の正規化・標準化 -----------------------------------
function normalizeIndustryLarge(industryName) {
  if (!industryName) return null;
  // 全角英数字を半角に
  let normalizedName = industryName
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)) // 全角英字を半角に変換
    .replace(/[\s　]+/g, "") // スペースを除去
    .trim();

  // 半角ｶﾀｶﾅを全角に変換
  normalizedName = halfName.replace(
    /[^a-zA-Z0-9 \u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF65-\uFF9F\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u3005\u30FC\u002D\u002E\u0027\u005F\uFF08\uFF09\u0028\u0029\u30FB･]+/gu,
    ""
  );

  // 30 文字以上の場合は文字数を 30 文字までに制限
  return limitStringLength(normalizedName, 30);
}

// 🔸業界小分類(industry_small)の正規化・標準化 -----------------------------------
function normalizeIndustrySmall(industryName) {
  // 業界大分類と同じ
  return normalizeIndustryLarge(industryName);
}

// 🔸従業員数(number_of_employees)の正規化・標準化 -----------------------------------
function normalizeNumberOfEmployees(num) {
  // null, undefined, '', 0は全てnullを返す
  if (!num) return null;

  // 100名 => 100 に標準化 全角数字を半角に変換し、半角数字以外を削除
  let normalizedNum = phoneNum
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/[^\d]/g, "");

  // INTEGER型のためparseIntで整数値に変換し、7桁未満100万人未満であることをチェック
  const employeeCount = parseInt(normalizedNum, 10);
  if (!isNaN(employeeCount) && employeeCount.toString().length < 7) {
    return employeeCount;
  }
  return null; // バリデーションに合格しない場合にはnullを返す
}

// 🔸決算月(fiscal_end_month)の正規化・標準化 -----------------------------------
// 予算申請月1, 2も同じ関数を使用
function normalizeMonth(month) {
  if (!month) return null;
  // 半角数字のみ残す
  let formattedMonth = month
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/[^0-9]/, ""); // 数字以外の文字を削除

  // 数字を検証してから、1~12の範囲にあるか確認
  const monthNumber = parseInt(formattedMonth, 10);
  if (1 <= monthNumber && monthNumber < 12) {
    return monthNumber.toString(); // 月はtext型で管理しているため文字列に変換
  } else {
    return null; // 範囲外の場合はnullを返す
  }

  // 1~12までを許容 全角は半角へ、12月の月は除去するフォーマット
  // // 「月」が含まれている場合は削除 $1は最初のキャプチャグループの(\d+) 1~12のみ残す(1~12月なら)
  // formattedMonth = formattedMonth.replace(/(\d+)(月)($)/g, "$1");

  // // 1~12までの値のどれかに一致しているかをチェック
  // const isValid =
  //   /^(1[0-2]|[1-9])$/.test(formattedMonth) && parseInt(formattedMonth, 10) >= 1 && parseInt(formattedMonth, 10) <= 12;

  // // isValidとformattedMonthをリターン
  // return isValid ? formattedMonth : null;
}

// 🔸資本金(capital)の正規化・標準化 -----------------------------------
// ~万単位にフォーマット
// 1000のみの場合は1000, (兆,億,万,円が付いていない場合はそのまま)
// 12,500,000円 => 1250,
// 100万 => 100,
// 1億 => 10000
function normalizeCapital(value) {
  if (!value) return null;

  let normalizedValue = value
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)) // 全角数字を半角に変換
    .replace(/[\s　]/g, ""); // スペースを削除

  // 「半角数字と兆億万円」以外の文字を削除
  const formattedValue = normalizedValue.replace(/[^0-9兆億万円]/g, "");

  // 「兆」「億」「万」「円」を万円単位の数字に変換
  const convertedMillions = convertToMillions(formattedValue);

  if (convertedMillions !== null && !isNaN(convertedMillions)) {
    return convertedMillions;
  } else {
    return null;
  }
}

// 🔸設立年(設立年月・年月日)(established_in)の正規化・標準化 -----------------------------------
/* 形式統一 日本・英語圏両方に対応可能なフォーマットに変換 (ISO 8601形式（YYYY-MM-DD))
// postgreSQL: 1999-01-08	ISO 8601。すべてのモードで1月8日になります（推奨書式）。

1992年1月 => 1992-01 
1992年1月1日 => 1992-01-01
昭和45年12月 => 1970-12
平成4年 => 1992

*/

function normalizeDate(inputDate) {
  if (!inputDate) return null;
  str = str.trim(); // 基本的なトリミング

  // 元号を西暦に変換するマップ
  const eraToYear = {
    大正: 1911, // 大正元年は1912年
    昭和: 1925, // 昭和元年は1926年ですが、計算のために1925を基準にする
    平成: 1988, // 平成元年は1989年
    令和: 2018, // 令和元年は2017年
  };

  // 日付の全角数字を半角に変換
  let normalizedDate = inputDate.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

  // 元号があるか確認し、あれば西暦に変換
  Object.keys(eraToYear).forEach((era) => {
    if (normalizedDate.includes(era)) {
      const yearOffset = eraToYear[era];
      const yearRegex = new RegExp(`${era}([0-9]+)年`);
      const yearMatch = normalizedDate.match(yearRegex);
      if (yearMatch) {
        const year = parseInt(yearMatch[1], 10) + yearOffset; // 平成4年なら1988から4年プラスにオフセットすると1992年
        normalizedDate = normalizedDate.replace(yearRegex, `${year}年`); // 平成4年12月 => 1992年12月に変換
      }
    }
  });

  // 日付フォーマットを ISO 8601 に変換
  normalizedDate = normalizedDate
    .replace(/(\d{4})年(\d{1,2})月(\d{1,2})日?/, "$1-$2-$3") // yyyy-MM-ddの形式にフォーマット
    .replace(/(\d{4})年(\d{1,2})月/, "$1-$2") // yyyy-MMの形式にフォーマット
    .replace(/(\d{4})年/, "$1"); // yyyyの形式にフォーマット

  // 日付が正しいフォーマットになっているか確認
  const regexPatterns = [
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // yyyy-MM-dd
    /^(\d{4})-(\d{1,2})$/, // yyyy-MM
    /^(\d{4})$/, // yyyy
  ];

  // パターンに一致するか確認し、最初に合致したフォーマットに基づいて日付を返す
  for (const pattern of regexPatterns) {
    if (pattern.test(normalizedDate)) {
      return normalizedDate;
    }
  }

  return null; // フォーマットが正しくない場合は null を返す
}

// 🔸法人番号(corporate_number)の正規化・標準化 -----------------------------------
// 13桁で保存されているためこのままチェック
// 4120001051530: 株式会社キーエンス
function normalizeCorporateNumber(input) {
  // 数字を半角に変換して、半角数字以外を除去
  const normalizedNumber = input
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)) // 全角数字を半角に変換
    .replace(/[^0-9]/g, ""); // 半角数字のみ除去

  // 半角数字7桁を許容
  const regex = /^[0-9]{13}$/; // 半角数字13桁のみかチェック
  const isValid = regex.test(normalizedNumber);

  return isValid ? normalizedNumber : null;
}

// 🔸取引先(clients)の正規化・標準化 -----------------------------------
// "clients": // 取引先(納入先)
// "supplier": // 仕入先
// "business_sites": // 事業拠点
// "overseas_bases": // 海外拠点
// "group_company": // グループ会社

// normalizeContactNames と同じ

function normalizeClients(input) {
  // 全角英数字と全角スペースを半角に変換 記号はそのままにしておく 「\uFF01-\uFF5D」 全角英数字(ａ-ｚＡ-Ｚ０-９)と記号(（）＋％＆など)「〜」は除く
  let halfName = input
    .replace(/[ａ-ｚＡ-Ｚ０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[ \t　]+/g, " ") // 半角スペース、タブ、全角スペースの連続を半角スペースに変換(改行はそのまま)
    .trim();

  // 「a-zA-Z0-9」 => 「\uFF01-\uFF5D\u0021-\u007D」
  let normalizedName = halfName.replace(
    /[^\u0021-\u007E\uFF01-\uFF5E\u301C \u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF65-\uFF9F\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u3005\u30FC\u002D\u002E\u0027\u005F\uFF08\uFF09\u0028\u0029\u30FB･\u300C-\u3011\u3012\u3001\n]+/gu,
    ""
  );

  // 300 文字以上の場合は文字数を 300 文字までに制限
  return limitStringLength(normalizedName, 300);
}

// 🔸事業概要(clients)の正規化・標準化 -----------------------------------
// "business_content": // 事業概要
// "facility": // 設備

// normalizeContactNames と同じ
function normalizeSummary(input) {
  let halfName = input
    .replace(/[ａ-ｚＡ-Ｚ０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[ \t　]+/g, " ") // 半角スペース、タブ、全角スペースの連続を半角スペースに変換
    // .replace(/[\s　]+/g, " ")
    .trim();

  // 「a-zA-Z0-9」 => 「\uFF01-\uFF5D\u0021-\u007D」
  let normalizedName = halfName.replace(
    /[^\u0021-\u007E\uFF01-\uFF5E\u301C \u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF65-\uFF9F\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u3005\u30FC\u002D\u002E\u0027\u005F\uFF08\uFF09\u0028\u0029\u30FB･\u300C-\u3011\u3012\u3001\n]+/gu,
    ""
  );

  // 500 文字以上の場合は文字数を 500 文字までに制限
  return limitStringLength(normalizedName, 500);
}

// 🔸日付変換のヘルパー関数 -----------------------------------
function transformToDate(dateStr) {
  dateStr = dateStr.trim(); // 基本的なトリミング
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) ? date.toISOString().substring(0, 10) : null;
}

// -----------------------------------🔸カラムごとの前処理関数🔸-----------------------------------

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

// -------------------- 🔸client_companiesテーブルのフィールドに応じた各カラムのデータ前処理を実行🔸 --------------------
function transformData(csvValue, dbField) {
  // ここで型変換やデータクリーニングを行う
  // 例: 日付の変換、数値の変換、文字列のトリム等

  let processedValue = csvValue === "" ? null : csvValue.trim(); // 基本的なトリミング;

  switch (dbField) {
    case "corporate_name": // 法人名
      if (!processedValue) throw new Error("会社名が空文字のためこの行はスルー");
      // 法人名の前処理: 特定の不適切な文字を削除する例
      processedValue = normalizeCompanyName(processedValue);
      break;

    case "branch_name": // 拠点名
      processedValue = normalizeBranchName(processedValue);
      break;

    case "department_name": // 部署名
      processedValue = normalizeDepartmentName(processedValue);
      break;

    case "main_phone_number": // 代表TEL
      processedValue = normalizePhoneNumber(processedValue);
      break;

    case "main_fax": // 代表FAX
      processedValue = normalizeFax(processedValue);
      break;

    case "zipcode": // 郵便番号
      processedValue = normalizePostalCode(processedValue);
      break;

    case "address": // 住所
      // 引数が別途必要のため別ルートで処理;
      // processedValue = normalizeAddress(processedValue);
      break;

    case "representative_name": // 代表者名
      processedValue = normalizeRepresentativeName(processedValue);
      break;

    case "website_url": // ホームページURL・WebサイトURL
      processedValue = normalizeWebSiteURL(processedValue);
      break;

    case "email": // Email
      processedValue = normalizeEmail(processedValue);
      break;

    case "industry_type_id": // 業種
      processedValue = normalizeIndustryType(processedValue);
      break;

    case "industry_large": // 業界(大分類)
      processedValue = normalizeIndustryLarge(processedValue);
      break;

    case "industry_small": // 業界(小分類)
      processedValue = normalizeIndustrySmall(processedValue);
      break;

    case "number_of_employees": // 従業員数
      processedValue = normalizeNumberOfEmployees(processedValue);
      break;

    case "fiscal_end_month": // 決算月
    case "budget_request_month1": // 予算申請月
    case "budget_request_month2": // 予算申請月
      processedValue = normalizeMonth(processedValue);
      break;

    case "capital": // 資本金
      processedValue = normalizeCapital(processedValue);
      break;

    case "established_in": // 設立
      processedValue = normalizeDate(processedValue);
      break;

    case "corporate_number": // 法人番号
      processedValue = normalizeCorporateNumber(processedValue);
      break;

    case "chairperson": // 会長
    case "senior_vice_president": // 副社長
    case "senior_managing_director": // 専務取締役
    case "managing_director": // 常務取締役
    case "director": // 取締役
    case "board_member": // 役員
    case "auditor": // 監査役
    case "manager": // 部長
    case "member": // 担当者
      // 織田信長（取締役会長）・伊達政宗(専務取締役・COO)、佐藤 健(CSO)など複数記述の可能性があるため余裕を持たせる
      processedValue = normalizeContactNames(processedValue);
      break;

    case "clients": // 取引先(納入先)
    case "supplier": // 仕入先
    case "business_sites": // 事業拠点
    case "overseas_bases": // 海外拠点
    case "group_company": // グループ会社
    case "department_contacts": // 連絡先(部署別)
      processedValue = normalizeClients(processedValue);
      break;

    case "business_content": // 事業概要
    case "facility": // 設備
      processedValue = normalizeSummary(processedValue);
      break;

    default:
      // その他のカラムに対してのデフォルトの処理
      break;
  }

  return processedValue; // 変換後の値を返す
}
// -------------------- 🔸client_companiesテーブルのフィールドに応じた各カラムのデータ前処理を実行🔸 --------------------

// ----------------------------------- 🌠Web Worker Script🌠-----------------------------------
self.onmessage = function (e) {
  console.log("Worker: Message received from main thread");

  // postMessage が呼び出されたときにメッセージを送ったウィンドウのオリジンが正しいことをチェック
  // publicフォルダ内のスクリプトでは、環境変数を使用できないためオリジンをハードコーディング
  const clientUrl = "http://localhost:3000";
  // if (e.origin !== process.env.CLIENT_URL) return console.log("❌オリジンチェックに失敗 リターン");
  if (e.data.origin !== clientUrl)
    return console.log(`Worker: ❌オリジンチェックに失敗 リターン 受け取ったオリジン: ${e.data.origin}`);

  const { parsedData, columnMap, groupedTownsByRegionCity } = e.data;

  // 1行ずつ取り出して必要なカラムのみ前処理してインサート用配列データを生成
  const processedData = parsedData
    .map((row) => {
      // 行の前処理
      const processedRow = {}; // 最終的にインサートする処理後の行

      try {
        let townsByCities = [];
        let countryId = null;
        let regionId = null;
        let cityId = null;
        let townId = null; // 郵便番号とaddress処理で得た町域リストを組み合わせてtown_idを取得
        let normalizedTownName = null;
        let streetAddress = null;
        let postalCode = null;

        // ----------------------------------- カラムごとの前処理 -----------------------------------
        // columnMap: CSVカラムヘッダー名 to DBフィールド名
        Array.from(columnMap.entries()).forEach(([csvHeader, dbField]) => {
          // 住所カラム
          if (dbField === "address") {
            if (!row[csvHeader]) throw new Error(`Worker: ${dbField}カラム アドレスが空文字のためスルー`);
            // addressの場合は、address以外に町域リストを取り出す
            // 住所の前処理: 文字の正規化、例えば全角を半角に変換
            const responseAddress = normalizeAddress(row[csvHeader], groupedTownsByRegionCity);
            // const responseAddress = transformData(row[csvHeader], dbField);

            if (responseAddress === null) throw new Error(`${dbField}カラム 無効な住所のためこの行をスルー`);

            const {
              address,
              prefecture,
              city,
              street_address,
              country_id,
              region_id,
              city_id,
              normalized_town_name,
              grouped_towns_by_cities,
            } = responseAddress;
            townsByCities = grouped_towns_by_cities ?? [];
            countryId = country_id;
            regionId = region_id;
            cityId = city_id;
            normalizedTownName = normalized_town_name;
            streetAddress = street_address;

            processedRow["address"] = address;
          }

          // 通常のカラム
          else {
            processedRow[dbField] = transformData(row[csvHeader], dbField);
          }
        });
        // ----------------------------------- カラムごとの前処理 -----------------------------------ここまで

        // ----------------------------------- town_idの取得 -----------------------------------
        // 郵便番号と正規化した町域名の2つで抽出するが、同じ組み合わせがある場合は後で手動で修正する
        if (0 < townsByCities.length && !!normalizedTownName) {
          // dbFieldにzipcodeカラムとaddressカラムが存在する場合は、town_idを取得する
          const dbFieldsArray = Array.from(columnMap.values());
          if (
            dbFieldsArray.includes("address") &&
            dbFieldsArray.includes("zipcode") &&
            Object.hasOwn(processedRow, "zipcode") &&
            !!processedRow["zipcode"]
          ) {
            // 町域データから取得した郵便番号とnormalized_nameと一致する行を取得
            const gotTown = townsByCities.find(
              (obj) => obj.postal_code === processedRow["zipcode"] && obj.normalized_name === normalizedTownName
            );
            if (!!gotTown) {
              townId = gotTown.town_id;
            }
          }
        }
        // ----------------------------------- town_idの取得 -----------------------------------ここまで

        // ----------------------------------- 🔸処理後の行に不足分のカラムを追加🔸 -----------------------------------
        // ○必須カラム：
        // ・会社名(name) => 選択・前処理済みの法人名と拠点名を結合
        // ・住所 => 選択済み
        // ・部署名(department_name) => 選択されていない場合はピリオドをセット
        // ・代表TEL(main_phone_number) => なくてもOK(メールやSNSのみでの営業にも対応するため)

        // columnMap: CSVカラムヘッダー名 to DBフィールド名
        const selectedDBFieldNamesArray = Array.from(columnMap.values());

        // ○【会社名(name)】
        if (!Object.hasOwn(processedRow, "corporate_name")) throw new Error(`無効な法人名: `);
        const _branch_name =
          selectedDBFieldNamesArray.includes("branch_name") && Object.hasOwn(processedRow, "branch_name")
            ? processedRow["branch_name"]
            : "";
        const name = (processedRow["corporate_name"] + " " + _branch_name).trim();

        let addColumns = {
          name: name, // 会社名(法人名 拠点名)
          country_id: countryId ?? null, // 国コード
          region_id: regionId ?? null, // 都道府県コード
          city_id: cityId ?? null, // 市区町村コード
          town_id: townId ?? null, // 町域コード
          street_address: streetAddress || null, // 町域名+丁目+番地(番)+号+建物名
        };

        // ○【部署名(department_name)】
        // カラムマップのvalue側のDBフィールド名の配列の中にdepartment_nameが存在しない場合はピリオドをセット
        if (!selectedDBFieldNamesArray.includes("department_name")) {
          addColumns = { ...addColumns, department_name: "." };
        }

        // ○【規模(ランク)(number_of_employees_class)】
        // number_of_employeesカラムが存在し、数字なら範囲でランク分け
        if (
          selectedDBFieldNamesArray.includes("number_of_employees") &&
          Object.hasOwn(processedRow, "number_of_employees")
        ) {
          const EmployeesNum = processedRow["number_of_employees"];
          if (EmployeesNum !== null && EmployeesNum !== undefined && typeof EmployeesNum === "number") {
            let numberOfEmployeeClass = null;
            if (0 < EmployeesNum && EmployeesNum < 50) numberOfEmployeeClass = "G";
            if (50 <= EmployeesNum && EmployeesNum < 100) numberOfEmployeeClass = "F";
            if (100 <= EmployeesNum && EmployeesNum < 200) numberOfEmployeeClass = "E";
            if (200 <= EmployeesNum && EmployeesNum < 300) numberOfEmployeeClass = "D";
            if (300 <= EmployeesNum && EmployeesNum < 500) numberOfEmployeeClass = "C";
            if (500 <= EmployeesNum && EmployeesNum < 1000) numberOfEmployeeClass = "B";
            if (1000 <= EmployeesNum) numberOfEmployeeClass = "A";
            addColumns = { ...addColumns, number_of_employees_class: numberOfEmployeeClass };
          }
        }

        const responseRow = { ...processedRow, ...addColumns };
        // ----------------------------------- 🔸処理後の行に不足分のカラムを追加🔸 -----------------------------------ここまで

        // 🔸mapイテレーションの結果として前処理完了後の行をリターン
        return responseRow;
      } catch (error) {
        // エラーが発生した場合は、その行は無効としてnullを返し最終的にfilter()で無効な行は取り除きインサート対象から除外する
        console.log("Worker: transformData関数エラー 無効な行のためスルー", error);

        // 🔸mapイテレーションの結果として無効な行はnullをリターン
        return null;
      }
    })
    .filter((row) => row !== null); // 無効な行として扱われたnullの行を削除

  // 🔸アップロードされたCSVデータの全ての行の前処理完了 => クライアントサイドに処理済みデータを返すとともに完了を通知
  return self.postMessage({ processedData });
};

// ----------------------------------- 🌠Web Worker Script🌠-----------------------------------ここまで
