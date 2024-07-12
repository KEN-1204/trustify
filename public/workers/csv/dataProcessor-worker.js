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

  // postMessage が呼び出されたときにメッセージを送ったウィンドウのオリジンが正しいことをチェック
  if (e.origin !== process.env.CLIENT_URL) return console.log("❌オリジンチェックに失敗 リターン");

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
        // カラムごとの前処理
        Array.from(columnMap.entries()).forEach(([csvHeader, dbField]) => {
          // 住所カラム
          if (dbField === "address") {
            // addressの場合は、address以外に町域リストを取り出す
            const responseAddress = transformData(row[csvHeader], dbField);

            if (responseAddress === null) throw new Error("無効な住所のためこの行をスルー");

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

            processedRow[dbField] = address;
          }
          // 通常のカラム
          processedRow[dbField] = transformData(row[csvHeader], dbField);
        });

        // ----------------------------------- town_idの取得 -----------------------------------
        // 郵便番号と正規化した町域名の2つで抽出するが、同じ組み合わせがある場合は後で手動で修正する
        if (0 < townsByCities.length && !!normalized_town_name) {
          // dbFieldにzipcodeカラムとaddressカラムが存在する場合は、town_idを取得する
          const dbFieldsArray = Array.from(columnMap.values());
          if (dbFieldsArray.includes("address") && dbFieldsArray.includes("zipcode")) {
            // 町域データから取得した郵便番号とnormalized_nameと一致する行を取得
            const gotTown = townsByCities.find(
              (obj) => obj.postal_code === processedRow["zipcode"] && obj.normalized_name === normalized_town_name
            );
            if (!!gotTown) {
              townId = gotTown.town_id;
            }
          }
        }
        // ----------------------------------- town_idの取得 -----------------------------------

        // 🔸処理後の行にcounty_idやregion_id, city_id, town_id, street_addressなどを追加してリターン
        const addColumns = {
          country_id: countryId ?? null,
          region_id: regionId ?? null,
          city_id: cityId ?? null,
          town_id: townId ?? null,
          street_address: streetAddress || null,
        };

        const responseRow = { ...processedRow, ...addColumns };

        return responseRow;
      } catch (error) {
        // エラーが発生した場合は、その行は無効としてnullを返し最終的にfilter()で無効な行は取り除きインサート対象から除外する
        console.log("Worker: transformData関数エラー 無効な行のためスルー", error);
        return null;
      }
    })
    .filter((row) => row !== null);

  return self.postMessage({ processedData });
};

// 🔸client_companiesテーブルのフィールドに応じた各カラムのデータ前処理を実行
function transformData(csvValue, dbField) {
  // ここで型変換やデータクリーニングを行う
  // 例: 日付の変換、数値の変換、文字列のトリム等

  let processedValue = csvValue.trim(); // 基本的なトリミング

  switch (dbField) {
    case "name":
      // 会社名の前処理: 特定の不適切な文字を削除する例
      processedValue = normalizeCompanyName(processedValue);
      break;

    case "address":
      // 住所の前処理: 文字の正規化、例えば全角を半角に変換
      processedValue = normalizeAddress(processedValue);
      break;

    case "established_in":
      // 設立日の前処理: 日付形式の検証と変換
      processedValue = transformToDate(processedValue);
      break;

    case "capital":
      // 資本金の前処理: 数値変換
      processedValue = parseInt(processedValue.replace(/,/g, ""), 10);
      if (isNaN(processedValue)) processedValue = 0;
      break;

    default:
      // その他のカラムに対してのデフォルトの処理
      break;
  }

  return processedValue; // 変換後の値を返す
}

// 🔸会社名の正規化・標準化 -----------------------------------

// 【正規表現の構成要素】
// ・a-zA-Z0-9: 英数字
// ・ （半角スペース）
// ・\u3000-\u303F：全角の記号と句読点(\u3000：全角スペース)
// ・\u3040-\u309F: ひらがな
// ・\u30A0-\u30FF: カタカナ
// ・\u30FC: 全角の長音符(カタカナの長音符)
// ・\u002D: 半角ハイフン（-）
// ・\u002E: 半角ピリオド（.）
// ・\u0027: 半角アポストロフィ（'） - 企業名における所有格や略語でよく使用されます（例: O'Reilly, Ben's）
// ・\u005F: アンダースコア（_） - 特に技術関連の企業や製品名に使われることがあります

function normalizeCompanyName(name) {
  name = name.trim(); // 基本的なトリミング
  return name.replace(/[^a-zA-Z0-9 \u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u30FC\u002D\u002E\u0027\u005F]+/g, "");
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
function normalizeAddress(address) {
  address = address.trim(); // 基本的なトリミング
  // 🔹1. 正規化
  // 全角英数字と全角記号の両方を半角に変換
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
    grouped_towns_by_cities: null,
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

// 🔸郵便番号の正規化・標準化 -----------------------------------
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

function validateAndNormalizePostalCode(postalCode) {
  postalCode = postalCode.trim(); // 基本的なトリミング
  let formattedPostalCodeCode;

  // フォーマット
  const halfWidth = postalCode
    .replace(/[Ａ-Ｚａ-ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)) //
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/　/g, " ") // 全角スペースを半角スペースに変換
    .replace(/ー/g, "-") // 「ソニー」の「ー」長音符を半角ハイフンに変換
    .replace(/－/g, "-") // 全角ハイフンを半角に変換
    .replace(/−/g, "-"); // 全角ハイフンを半角に変換 // カタカナの長音記号も半角ハイフンに変換

  // 郵便番号は7桁でハイフンなしにフォーマット (郵便局の町域データの郵便番号もハイフンなしのため)
  formattedPostalCodeCode = halfWidth.replace("-", "");

  // 数字、英字、ハイフン、スペースを許容
  const regex = /^[0-9A-Za-z\s\-]+$/;
  const isValid = regex.test(formattedPostalCodeCode);

  return isValid ? formattedPostalCodeCode : null;
}

// 🔸設立年(設立年月・年月日)の正規化・標準化 -----------------------------------
/* 形式統一 日本・英語圏両方に対応可能なフォーマットに変換
1992年1月 => 1992/01 
1992年1月1日 => 1992/01/01
*/

function validateAndNormalizeEstablish(dateStr) {
  dateStr = dateStr.trim(); // 基本的なトリミング
}

// 🔸日付変換のヘルパー関数 -----------------------------------
function transformToDate(dateStr) {
  dateStr = dateStr.trim(); // 基本的なトリミング
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) ? date.toISOString().substring(0, 10) : null;
}

// 🔸電話番号の正規化・標準化 -----------------------------------
function validateAndNormalizePhoneNumber(phoneNumber) {
  // 全角数字、ハイフン、プラス、括弧を半角に変換
  const halfWidth = phoneNumber
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/－/g, "-")
    .replace(/ー/g, "-")
    .replace(/−/g, "-")
    .replace(/＋/g, "+")
    .replace(/（/g, "(")
    .replace(/）/g, ")");

  // スペースを削除
  const formattedNumber = halfWidth.replace(/\s/g, "");

  // バリデーションチェック 数字、半角ハイフン、プラス記号、括弧を許容
  const isValid = /^[\d\-\+\(\)]+$/.test(formattedNumber);

  return isValid ? formattedNumber : null;
}

// 🔸決算月の正規化・標準化 -----------------------------------
function validateAndNormalizeOnlyMonth(month) {
  month = month.trim(); // 基本的なトリミング
  // 1~12までを許容 全角は半角へ、12月の月は除去するフォーマット
  let formattedMonth;
  formattedMonth = month.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

  // 「月」が含まれている場合は削除 $1は最初のキャプチャグループの(\d+) 1~12のみ残す(1~12月なら)
  formattedMonth = formattedMonth.replace(/(\d+)(月)($)/g, "$1");

  // 1~12までの値のどれかに一致しているかをチェック
  const isValid =
    /^(1[0-2]|[1-9])$/.test(formattedMonth) && parseInt(formattedMonth, 10) >= 1 && parseInt(formattedMonth, 10) <= 12;

  // isValidとformattedMonthをリターン
  return isValid ? formattedMonth : null;
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
