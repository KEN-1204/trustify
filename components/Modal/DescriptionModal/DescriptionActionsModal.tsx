import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import { Fragment, memo } from "react";
import { BsChevronLeft } from "react-icons/bs";
import { RxDot } from "react-icons/rx";

const DescriptionActionsModalMemo = () => {
  const language = useStore((state) => state.language);
  const setIsOpenModalSDB = useDashboardStore((state) => state.setIsOpenModalSDB);

  // 戻る・オーバーレイクリック
  const handleCancel = () => {
    setIsOpenModalSDB(null);
  };

  const columnHeaderList: { key: string; value: { [key: string]: string } }[] = [
    { key: "action_item", value: { ja: `アクション項目`, en: `Action Item` } },
    { key: "filter_condition", value: { ja: `フィルター条件`, en: `Filter Condition` } },
    { key: "aim", value: { ja: `狙い・集計結果から確認する内容`, en: `Reason` } },
  ];

  const rowHeaderList: { key: string; value: { [key: string]: string } }[] = [
    { key: "call_pr", value: { ja: `TEL PR`, en: `Call PR` } },
    { key: "call_all", value: { ja: `TEL All`, en: `Call All` } },
    { key: "meeting_new", value: { ja: `新規面談`, en: `New Meeting` } },
    { key: "meeting_all", value: { ja: `面談All`, en: `All Meeting` } },
    { key: "expansion_all", value: { ja: `展開数`, en: `Deal Development` } },
    { key: "expansion_rate", value: { ja: `展開率`, en: `Deal Development Rate` } },
    { key: "f_expansion", value: { ja: `展開F`, en: `Deal F Development` } },
    { key: "f_expansion_rate", value: { ja: `展開F率`, en: `Deal F Development Rate` } },
    { key: "award", value: { ja: `A数`, en: `Award` } },
    { key: "half_year_f_expansion_award", value: { ja: `F獲得数（半期）`, en: `Half Year Deal F Award` } },
    { key: "half_year_f_expansion_award_rate", value: { ja: `F獲得率（半期）`, en: `Half Year Deal F Award Rate` } },
  ];

  console.log("DescriptionActionsModalレンダリング");

  return (
    <>
      {/* モーダルオーバーレイ */}
      <div className={`modal_overlay`} onClick={handleCancel} />

      {/* モーダルコンテナ */}
      <div className={`modal_container fade03`}>
        {/* 保存・タイトル・キャンセルエリア */}
        <div
          className="modal_title_area"
          // className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[20px] text-center text-[18px]"
        >
          <div className="relative min-w-[150px] text-start font-semibold">
            <div
              className="flex max-w-max cursor-pointer select-none items-center hover:text-[#aaa]"
              onClick={handleCancel}
            >
              <div className="h-full min-w-[20px]"></div>
              <BsChevronLeft className="z-1 absolute  left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" />
              <span>戻る</span>
            </div>
          </div>
          <div className="min-w-[150px] select-none font-bold">営業プロセス アクション項目概要</div>

          <div
            className={`min-w-[150px] cursor-pointer select-none text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)]`}
            //   onClick={handleSaveAndCloseFromProperty}
          >
            {/* 保存 */}
          </div>
        </div>

        {/* <div className="min-h-[1px] w-full bg-[var(--color-border-base)]"></div> */}

        {/* メインコンテンツ コンテナ */}
        <div className={`modal_main_contents_container mt-[15px]`} style={{ overflowY: `hidden` }}>
          {/* 最下部のshadow */}
          <div
            className={`absolute bottom-[10px] left-[40px] z-[100] min-h-[30px] w-[calc(100%-80px)] rounded-b-[0px]`}
            style={{ background: `linear-gradient(to top, var(--color-modal-solid-bg) 27%, transparent)` }}
          />
          {/* 最下部のshadow ここまで */}
          <div role="grid" className={`relative grid h-full w-full overflow-y-auto`} style={{ padding: `0 40px 30px` }}>
            {/* gridヘッダー */}
            <div
              role="row"
              aria-rowindex={1}
              //   className={`sticky top-0 z-10 grid h-[30px] w-full bg-[#f7f9fb]`}
              className={`sticky top-0 z-10 grid h-[30px] w-full bg-[var(--color-modal-solid-bg)]`}
              style={{ borderBottom: `1px solid var(--color-border-light)`, gridTemplateColumns: `12% 44% 44%` }}
            >
              {columnHeaderList.map((obj, index) => {
                return (
                  <div
                    key={obj.key}
                    role="columnheader"
                    className={`flex items-center text-[13px] font-semibold text-[var(--color-text-sub)]`}
                  >
                    {obj.value[language]}
                  </div>
                );
              })}
            </div>

            {/* rowgroup */}
            {rowHeaderList.map((rowObj, rowIndex) => {
              return (
                <div
                  key={`row_${rowObj.key}`}
                  role="row"
                  aria-rowindex={rowIndex + 1}
                  className={`grid h-max min-h-[100px] w-full`}
                  style={{
                    // borderBottom: `1px solid var(--color-border)`,
                    borderBottom: `1px solid var(--color-border-chart)`,
                    gridTemplateColumns: `12% 44% 44%`,
                  }}
                >
                  {columnHeaderList.map((colObj, colIndex) => {
                    return (
                      <Fragment key={`row_${rowObj.key}_col_${colObj.key}`}>
                        {colIndex === 0 && (
                          <div role="gridcell" className={`flex items-center justify-start text-[13px] font-bold`}>
                            <div className="flex items-center">
                              <RxDot className={`min-h-[18px] min-w-[18px] text-[var(--color-bg-brand-f)]`} />
                              <span>{rowObj.value[language]}</span>
                            </div>
                          </div>
                        )}
                        {colIndex !== 0 && (
                          <div
                            role="gridcell"
                            className={`flex items-center justify-start py-[15px] pr-[20px] text-[12px]`}
                          >
                            {colObj.key === "filter_condition" && (
                              <>
                                {rowObj.key === "call_pr" && (
                                  <div className={`flex flex-col`}>
                                    <p className={`font-bold`}>【TELPR件数】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      下記条件に該当する活動データの件数（活動画面で取得する活動データ）
                                    </p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>活動タイプ：
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      「TEL発信（能動）」「TEL発信（受動）」「TEL発信（展示会）」「TEL発信（案件介入）」
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "call_all" && (
                                  <div className={`flex flex-col`}>
                                    <p className={`font-bold`}>【総電話件数件数】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      下記条件に該当する活動データの件数（活動画面で取得する活動データ）
                                    </p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>活動タイプ：
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      「TEL発信（不在）」「TEL発信（能動）」「TEL発信（受動）」「TEL発信（展示会）」「TEL発信（案件介入）」「TEL発信（売前ﾌｫﾛｰ）」「TEL発信（売後ﾌｫﾛｰ）」「TEL発信（ｱﾎﾟ組み）」「TEL発信（その他）」
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "meeting_new" && (
                                  <div className={`flex flex-col`}>
                                    <p className={`font-bold`}>【新規面談件数】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      下記条件に該当する面談データの件数（面談画面で取得する面談データ）
                                    </p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>面談目的：
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      「TEL発信（不在）」「TEL発信（能動）」「TEL発信（受動）」「TEL発信（展示会）」「TEL発信（案件介入）」「TEL発信（売前ﾌｫﾛｰ）」「TEL発信（売後ﾌｫﾛｰ）」「TEL発信（ｱﾎﾟ組み）」「TEL発信（その他）」
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>面談日（結果）：今月度
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>面談結果が入力済み
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "meeting_all" && (
                                  <div className={`flex flex-col`}>
                                    <p className={`font-bold`}>【総面談件数】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      下記条件に該当する面談データの件数（面談画面で取得する面談データ）
                                    </p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>面談目的：全て
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>面談日（結果）：今月度
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>面談結果が入力済み
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "expansion_all" && (
                                  <div className={`flex flex-col`}>
                                    <p className={`font-bold`}>【総展開数】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      下記条件に該当する面談データの件数（面談画面で取得する面談データ）
                                    </p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>面談結果：
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      「展開F(当期中に導入の可能性あり)」「展開N(来期導入の可能性あり)」
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>面談日（結果）：今月度
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "expansion_rate" && (
                                  <div className={`flex flex-col`}>
                                    <p className={`font-bold`}>【展開率】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>下記から算出される結果</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>展開率 = 総展開件数 /
                                      新規面談件数
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "f_expansion" && (
                                  <div className={`flex flex-col`}>
                                    <p className={`font-bold`}>【展開F件数（Fiscal period）】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      下記条件に該当する面談データの件数（面談画面で取得する面談データ）
                                    </p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>面談結果：
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      「展開F(当期中に導入の可能性あり)」
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>面談日（結果）：今月度
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "f_expansion_rate" && (
                                  <div className={`flex flex-col`}>
                                    <p className={`font-bold`}>【展開F率】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>下記から算出される結果</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>展開率 = 展開F件数 /
                                      新規面談件数
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "award" && (
                                  <div className={`flex flex-col`}>
                                    <p className={`font-bold`}>【A件数（Award）】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      下記条件に該当する案件データの件数（案件画面で取得する案件データ）
                                    </p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>現ステータス：受注
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>売上日：今月度
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>売上商品が入力済み
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>売上合計が入力済み
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "half_year_f_expansion_award" && (
                                  <div className={`flex flex-col`}>
                                    <p className={`font-bold`}>【F獲得数・FA数（Fiscal period）】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      下記条件に該当する案件データの件数（案件画面で取得する案件データ）
                                    </p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>現ステータス：受注
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>今期・来期区分：今期
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>展開日付：今期内
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>売上日付：今期内
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>売上商品が入力済み
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>売上合計が入力済み
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "half_year_f_expansion_award_rate" && (
                                  <div className={`flex flex-col`}>
                                    <p className={`font-bold`}>【F獲得率・FA率（Fiscal period）】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>下記から算出される結果</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▶︎</span>F獲得率（FA率）=
                                      F獲得数（FA数）/ 展開F件数
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                            {colObj.key === "aim" && (
                              <>
                                {rowObj.key === "call_pr" && (
                                  <div className={`flex flex-col`}>
                                    <p>【客先接触面積・良い行き先・良い環境（上長・面談人数）】</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>客先接触面積
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○各客先に対する架電時にアポイントを取るための刺さるポイントや流れは事前に抑えられているか？`}
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○架電先の担当者の活動履歴や、担当者の所属部署の過去の履歴、他部書の最近の動向などを把握した状態で架電できているか？（過去に自社でコンタクトがある場合）`}
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      良い行き先
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○未コンタクト先で自社商品のニーズがあるかわからない客先に対する架電の場合には、攻めるべき良い行き先かどうかフィルタリングのための聞き出しはできているか？`}
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      良い環境（上長・面談人数）
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○リードやアポが取れた先が決裁者などの上長でない場合に、上長への同席依頼など一回の面談で売れる環境を整えられているか？`}
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "call_all" && (
                                  <div className={`flex flex-col`}>
                                    <p>【客先接触面積】</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>客先接触面積
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○客先の営業時間「8:30~17:30」の480分の限られた時間を客先へ最大限使えているか？`}
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○8:30の開始時点で架電リストは十分か？480分の間にどこに架電するかピック時間に費やしていないか？`}
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○各客先に対する架電時にアポイントを取るための刺さるポイントや流れは事前に抑えられているか？`}
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "meeting_new" && (
                                  <div className={`flex flex-col`}>
                                    <p>【客先接触面積・良い行き先・良い環境（上長・面談人数）】</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>客先接触面積
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○訪問による面談の場合、1日4、5件のアポイントが取れた状態での外出を徹底して客先接触面積を最大化できているか？ 移動効率は最適か？`}
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○面談後に客先から他の客先の紹介を頂くアクションが徹底できているか？`}
                                    </p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      良い環境（上長・面談人数）
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○面談時の最上位役職者、同席人数は十分か？ 決裁者や上長・実務担当者が揃っていない場合に同席依頼が徹底できているか？`}
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "meeting_all" && (
                                  <div className={`flex flex-col`}>
                                    <p>【客先接触面積・良い商品開発】</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      客先接触面積
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○1日の面談件数は十分か？ 空き時間がある場合もう1件アポを入れられないか、客先接触面積を最大化できているか？`}
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○即売りには至らなかった展開先（案件先・商談先）に対して売り前フォローは十分か？`}
                                    </p>
                                    <p
                                      className={`mt-[6px] whitespace-pre-wrap`}
                                    >{`○導入頂いた売れ先に対する売り後フォローは十分か？ 満足度を上げた上で、他部書・他拠点など増設余地があれば増設提案は十分か？`}</p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      良い商品開発
                                    </p>
                                    <p
                                      className={`mt-[6px] whitespace-pre-wrap`}
                                    >{`○導入に至らなかった客先からのネックや導入後のサポートでの客先からの要望を商品開発に繋げられているか？`}</p>
                                  </div>
                                )}
                                {rowObj.key === "expansion_all" && (
                                  <div className={`flex flex-col`}>
                                    <p>【良い環境・欲しい度の最大化・クロージング】</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      良い環境・欲しい度の最大化・クロージング
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○即売りには至らなかった展開先（案件先・商談先）に対して売り前フォロー面談で客先のネックを解消してからクロージング・商売の話ができているか？`}
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○客先ごとに最適な買い方の提案ができているか？ 導入に対して緊急度の低い客先でもサブスクリプション・ファイナンスリース・オペレーティングリース・補助金・割賦など検討してみましょう。`}
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "expansion_rate" && (
                                  <div className={`flex flex-col`}>
                                    <p>【良い行き先・良い環境・良い提案（欲しい度の最大化）】</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      良い行き先
                                    </p>
                                    <p
                                      className={`mt-[6px] whitespace-pre-wrap`}
                                    >{`○そもそも行き先は合っているか？`}</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      良い環境
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○良い行き先への面談で、決裁者や実務担当者などの良い面談環境を整えられているか？`}
                                    </p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      良い提案
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○良い行き先、良い環境で客先に刺さる面談内容になっているか？`}
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "f_expansion" && (
                                  <div className={`flex flex-col`}>
                                    <p>【良い環境・良い提案（欲しい度の最大化）・クロージング】</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      良い環境
                                    </p>
                                    <p
                                      className={`mt-[6px] whitespace-pre-wrap`}
                                    >{`○今購入するか否かを決められる決裁者と面談するアクションが取れているか？`}</p>
                                    <p className={`mt-[9px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      欲しい度の最大化・クロージング
                                    </p>
                                    <p
                                      className={`mt-[6px] whitespace-pre-wrap`}
                                    >{`○客先の導入までの懸念点を解消できているか？`}</p>
                                    <p
                                      className={`mt-[6px] whitespace-pre-wrap`}
                                    >{`○客先に今買う理由・メリットを伝えて、最短の時間で売るための動きができているか？`}</p>
                                  </div>
                                )}
                                {rowObj.key === "f_expansion_rate" && (
                                  <div className={`flex flex-col`}>
                                    <p>【良い行き先・良い環境・良い提案・クロージング】</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      良い行き先・良い環境
                                    </p>
                                    <p
                                      className={`mt-[6px] whitespace-pre-wrap`}
                                    >{`○そもそも行き先は合っているか？`}</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○良い行き先への面談で、今購入するか否かを決められる決裁者と面談するアクションが取れているか？ 決裁者や実務担当者などの良い面談環境を整えられているか？`}
                                    </p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      良い提案・クロージング
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○欲しい度を最大化する面談内容になっているか？`}
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○決裁者に対してそれなら今導入するよと言ってもらうための最短で売るアクションが取れているか？`}
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "award" && (
                                  <div className={`flex flex-col`}>
                                    <p>【良い提案・クロージング】</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      クロージング
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○客先に最適な買い方の提案ができているか？`}
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○稟議書の場合は雛形作成や根回しなど滞りなく決裁が進むよう動けているか？`}
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "half_year_f_expansion_award" && (
                                  <div className={`flex flex-col`}>
                                    <p>【良い提案・クロージング】</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      クロージング
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○客先に最適な買い方の提案ができているか？`}
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○決裁者に対してそれなら今導入するよと言ってもらうための最短で売るアクションが取れているか？`}
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "half_year_f_expansion_award_rate" && (
                                  <div className={`flex flex-col`}>
                                    <p>【良い行き先・良い環境・良い提案・クロージング】</p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▼</span>
                                      良い環境・良い提案・クロージング
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○F獲得率が悪い場合、そもそも行き先は合っているか？`}
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○そもそも行き先が合っている場合、面談環境は整えられているか？`}
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○行き先、環境が合っている場合、客先に刺さる提案、欲しい度の最大化はできていたか？`}
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○欲しい度を最大化した後、決裁者と商売の話はできているか？`}
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      {`○即売りができなかった場合の案件で、時間が経過して客先の熱が冷めてしまっていないか？ 最短で取り切る動きはできているか？`}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export const DescriptionActionsModal = memo(DescriptionActionsModalMemo);
