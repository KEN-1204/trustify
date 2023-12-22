import React, { useState } from "react";
import styles from "./InsertNewContactModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN } from "lodash";
import { useMutateContact } from "@/hooks/useMutateContact";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { BsChevronLeft } from "react-icons/bs";
import { convertToMillions } from "@/utils/Helpers/convertToMillions";

export const InsertNewContactModal = () => {
  const setIsOpenInsertNewContactModal = useDashboardStore((state) => state.setIsOpenInsertNewContactModal);
  // const [isLoading, setIsLoading] = useState(false);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // 職位selectタグ選択用state
  // const [selectedPositionClass, setSelectedPositionClass] = useState("1 代表者");
  const [selectedPositionClass, setSelectedPositionClass] = useState("");
  // 担当職種selectタグ選択用state
  // const [selectedOccupation, setSelectedOccupation] = useState("1 社長・専務");
  const [selectedOccupation, setSelectedOccupation] = useState("");
  const [name, setName] = useState("");
  const [directLine, setDirectLine] = useState("");
  const [directFax, setDirectFax] = useState("");
  const [extension, setExtension] = useState("");
  const [companyCellPhone, setCompanyCellPhone] = useState("");
  const [personalCellPhone, setPersonalCellPhone] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  // const [positionClass, setPositionClass] = useState('')
  // const [occupation, setOccupation] = useState('')
  const [approvalAmount, setApprovalAmount] = useState("");

  const supabase = useSupabaseClient();
  const { createContactMutation } = useMutateContact();

  console.log(
    "InsertNewContactModalコンポーネント レンダリング",
    "職位セレクトタグ",
    selectedPositionClass,
    "担当職種タグ",
    selectedOccupation
  );

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    if (loadingGlobalState) return;
    setIsOpenInsertNewContactModal(false);
  };
  const handleSaveAndClose = async () => {
    if (name === "") return alert("担当者名の入力は必須です。");
    setLoadingGlobalState(true);

    // 新規作成するデータをオブジェクトにまとめる
    const newContact = {
      name: name,
      direct_line: directLine ? directLine : null,
      direct_fax: directFax ? directFax : null,
      extension: extension ? extension : null,
      company_cell_phone: companyCellPhone ? companyCellPhone : null,
      personal_cell_phone: personalCellPhone ? personalCellPhone : null,
      email: email ? email : null,
      position_name: position ? position : null,
      position_class: selectedPositionClass ? selectedPositionClass : null,
      occupation: selectedOccupation ? selectedOccupation : null,
      approval_amount: approvalAmount ? parseInt(approvalAmount, 10) : null,
      email_ban_flag: false,
      sending_materials_ban_flag: false,
      fax_dm_ban_flag: false,
      ban_reason: null,
      claim: null,
      call_careful_flag: false,
      call_careful_reason: null,
      client_company_id: selectedRowDataCompany!.id,
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: userProfileState?.department ? userProfileState.department : null,
      created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
    };

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createContactMutation.mutate(newContact);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewContactModal(false);
  };

  // 全角文字を半角に変換する関数
  const toHalfWidth = (strVal: string) => {
    // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
    return strVal.replace(/[！-～]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
    });
    // .replace(/　/g, " "); // 全角スペースを半角スペースに
  };
  const toHalfWidthAndSpace = (strVal: string) => {
    // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
    return strVal
      .replace(/[！-～]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
      })
      .replace(/　/g, " "); // 全角スペースを半角スペースに
  };
  const toHalfWidthAndSpaceAndHyphen = (strVal: string) => {
    // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
    return strVal
      .replace(/[！-～]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
      })
      .replace(/　/g, " ") // 全角スペースを半角スペースに
      .replace(/ー/g, "-"); // 全角ハイフンを半角ハイフンに
  };
  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {/* {loadingGlobalState && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )} */}
      <div className={`${styles.container} fade03`}>
        {loadingGlobalState && (
          <div className={`${styles.loading_overlay_modal} `}>
            {/* <SpinnerIDS scale={"scale-[0.5]"} /> */}
            <SpinnerComet w="48px" h="48px" />
            {/* <SpinnerX w="w-[42px]" h="h-[42px]" /> */}
          </div>
        )}
        {/* 保存・タイトル・キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[30px] text-center text-[18px]">
          {/* <div
            className="min-w-[150px] cursor-pointer select-none text-start font-semibold hover:text-[#aaa]"
            onClick={handleCancelAndReset}
          >
            キャンセル
          </div> */}
          <div className="relative min-w-[150px] text-start font-semibold">
            <div
              className="flex max-w-max cursor-pointer select-none items-center hover:text-[#aaa]"
              onClick={handleCancelAndReset}
            >
              <div className="h-full min-w-[20px]"></div>
              <BsChevronLeft className="z-1 absolute  left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" />
              <span>戻る</span>
            </div>
          </div>
          <div className="min-w-[150px] select-none font-bold">担当者 新規作成</div>
          <div
            className={`min-w-[150px] cursor-pointer select-none text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text}`}
            onClick={handleSaveAndClose}
          >
            保存
          </div>
        </div>

        <div className="min-h-[2px] w-full bg-[var(--color-bg-brand-f)]"></div>

        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 会社名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>会社名</span>
                  <span className={`${styles.value} ${styles.value_highlight}`}>
                    {selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                  </span>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 部署名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>部署名</span>
                  <span className={`${styles.value}`}>
                    {selectedRowDataCompany?.department_name ? selectedRowDataCompany?.department_name : ""}
                  </span>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* ●担当名 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.required_title}`}>●担当名</span>
                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                    </span> */}
                    <input
                      type="text"
                      placeholder="※入力必須　担当者名を入力してください"
                      required
                      autoFocus
                      className={`${styles.input_box}`}
                      value={name}
                      // onChange={(e) => setName(e.target.value)}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setName(toHalfWidthAndSpace(name.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 直通TEL */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>直通TEL</span>
                    <input
                      type="text"
                      placeholder="例：03-1234-5678"
                      className={`${styles.input_box}`}
                      value={directLine}
                      // onChange={(e) => setDirectLine(e.target.value)}
                      onChange={(e) => setDirectLine(e.target.value)}
                      onBlur={() => setDirectLine(toHalfWidthAndSpaceAndHyphen(directLine.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 内線TEL */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>内線TEL</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={extension}
                      onChange={(e) => setExtension(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 社用携帯 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>社用携帯</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={companyCellPhone}
                      onChange={(e) => setCompanyCellPhone(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 空白 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}></span>
                  </div>
                  {/* <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* 直通Fax */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>直通Fax</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={directFax}
                      onChange={(e) => setDirectFax(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 私用携帯 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>私用携帯</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={personalCellPhone}
                      onChange={(e) => setPersonalCellPhone(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 右ラッパーここまで */}
            </div>
            {/* --------- 横幅全体ラッパーここまで --------- */}
          </div>
          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* Email */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>Email</span>
                  <input
                    type="text"
                    placeholder=""
                    className={`${styles.input_box}`}
                    //   value={inputDepartment}
                    //   onChange={(e) => setInputDepartment(e.target.value)}
                  />
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 役職名 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>役職名</span>
                    <input
                      type="text"
                      placeholder="例：代表取締役社長、部長、マネージャーなど"
                      className={`${styles.input_box}`}
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 担当職種 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>担当職種</span>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}  ${
                        !selectedOccupation ? `text-[#9ca3af]` : ``
                      }`}
                      value={selectedOccupation}
                      onChange={(e) => setSelectedOccupation(e.target.value)}
                    >
                      <option value="">選択してください</option>
                      <option value="社長・専務">社長・専務</option>
                      <option value="取締役・役員">取締役・役員</option>
                      <option value="プロジェクト管理">プロジェクト管理</option>
                      <option value="営業">営業</option>
                      <option value="マーケティング">マーケティング</option>
                      <option value="クリエイティブ">クリエイティブ</option>
                      <option value="ソフトウェア開発">ソフトウェア開発</option>
                      <option value="開発・設計">開発・設計</option>
                      <option value="製造">製造</option>
                      <option value="品質管理・品質保証">品質管理・品質保証</option>
                      <option value="生産管理">生産管理</option>
                      <option value="生産技術">生産技術</option>
                      <option value="人事">人事</option>
                      <option value="経理">経理</option>
                      <option value="総務">総務</option>
                      <option value="法務">法務</option>
                      <option value="財務">財務</option>
                      <option value="購買">購買</option>
                      <option value="情報システム/IT管理者">情報システム/IT管理者</option>
                      <option value="CS/カスタマーサービス">CS/カスタマーサービス</option>
                      <option value="その他">その他</option>
                      {/* <option value="社長/CEO">社長/CEO</option>
                      <option value="取締役・役員">取締役・役員</option>
                      <option value="プロジェクト/プログラム管理">プロジェクト/プログラム管理</option>
                      <option value="営業">営業</option>
                      <option value="マーケティング">マーケティング</option>
                      <option value="クリエイティブ">クリエイティブ</option>
                      <option value="ソフトウェア開発">ソフトウェア開発</option>
                      <option value="開発・設計">開発・設計</option>
                      <option value="生産技術">生産技術</option>
                      <option value="製造">製造</option>
                      <option value="品質管理・品質保証">品質管理・品質保証</option>
                      <option value="人事">人事</option>
                      <option value="経理">経理</option>
                      <option value="総務">総務</option>
                      <option value="法務">法務</option>
                      <option value="財務">財務</option>
                      <option value="情報システム/IT管理者">情報システム/IT管理者</option>
                      <option value="CS/カスタマーサービス">CS/カスタマーサービス</option>
                      <option value="購買">購買</option>
                      <option value="その他">その他</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 職位 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>職位</span>
                    <select
                      name="position_class"
                      id="position_class"
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box} ${
                        !selectedPositionClass ? `text-[#9ca3af]` : ``
                      }`}
                      value={selectedPositionClass}
                      onChange={(e) => setSelectedPositionClass(e.target.value)}
                    >
                      <option value="">選択してください</option>
                      <option value="1 代表者">1 代表者</option>
                      <option value="2 取締役/役員">2 取締役/役員</option>
                      <option value="3 部長">3 部長</option>
                      <option value="4 課長">4 課長</option>
                      <option value="5 課長未満">5 課長未満</option>
                      <option value="6 所長・工場長">6 所長・工場長</option>
                      <option value="7 フリーランス・個人事業主">7 フリーランス・個人事業主</option>
                      <option value="8 不明">8 不明</option>
                      {/* <option value="executive">1 代表者</option>
                      <option value="Director">2 取締役/役員</option>
                      <option value="department_manager">3 部長</option>
                      <option value="section_manager">4 課長</option>
                      <option value="below_section_manager">5 課長未満</option>
                      <option value="chief_factory_manager">6 所長・工場長</option>
                      <option value="section_chief">7 不明</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 決裁金額 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>決裁金額(万)</span>
                    <input
                      // type="number"
                      // min={"0"}
                      type="text"
                      placeholder="例：100、300など"
                      className={`${styles.input_box}`}
                      // value={approvalAmount !== null ? approvalAmount : ""}
                      value={!!approvalAmount ? approvalAmount : ""}
                      onChange={(e) => setApprovalAmount(e.target.value)}
                      onBlur={() =>
                        setApprovalAmount(
                          !!approvalAmount && approvalAmount !== ""
                            ? (convertToMillions(approvalAmount.trim()) as number).toString()
                            : ""
                        )
                      }
                      // onChange={(e) => {
                      //   // プラスの数値と空文字以外をstateに格納
                      //   // if (e.target.value === "" || e.target.value.search(/^[0-9]+$/) === 0) {
                      //   //   console.log("OK", e.target.value.search(/^[-]?[0-9]+$/));
                      //   //   setApprovalAmount(e.target.value === "" ? null : Number(e.target.value));
                      //   // } else {
                      //   //   console.log("NG", e.target.value.search(/^[0-9]+$/));
                      //   // }
                      //   setApprovalAmount(e.target.value);
                      // }}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
            {/* --------- 横幅全体ラッパーここまで --------- */}
          </div>
          {/* メインコンテンツ コンテナ ここまで */}
        </div>
      </div>
    </>
  );
};
