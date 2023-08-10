import React, { useEffect, useState } from "react";
import styles from "./UpdateContactModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN } from "lodash";
import { useMutateContact } from "@/hooks/useMutateContact";

export const UpdateContactModal = () => {
  //   const setIsOpenInsertNewContactModal = useDashboardStore((state) => state.setIsOpenInsertNewContactModal);
  const setIsOpenUpdateContactModal = useDashboardStore((state) => state.setIsOpenUpdateContactModal);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // 担当職種selectタグ選択用state
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
  //   const [approvalAmount, setApprovalAmount] = useState<number | null>(null);
  const [callCarefulFlag, setCallCarefulFlag] = useState(false);
  const [callCarefulReason, setCallCarefulReason] = useState("");
  const [emailBanFlag, setEmailBanFlag] = useState(false);
  const [sendingMaterialBanFlag, setSendingMaterialBanFlag] = useState(false);
  const [faxDmBanFlag, setFaxDmBanFlag] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [claim, setClaim] = useState("");
  // 職位selectタグ選択用state
  const [selectedPositionClass, setSelectedPositionClass] = useState("1 代表者");
  const [selectedOccupation, setSelectedOccupation] = useState("1 社長・専務");

  const supabase = useSupabaseClient();
  const { updateContactMutation } = useMutateContact();

  console.log(
    "InsertNewContactModalコンポーネント レンダリング",
    "職位セレクトタグ",
    selectedPositionClass,
    "担当職種タグ",
    selectedOccupation
  );

  // 初回マウント時に選択中の担当者&会社の列データの情報をStateに格納
  useEffect(() => {
    if (!selectedRowDataContact) return;
    let _name = selectedRowDataContact.contact_name ? selectedRowDataContact.contact_name : "";
    let _direct_line = selectedRowDataContact.direct_line ? selectedRowDataContact.direct_line : "";
    let _direct_fax = selectedRowDataContact.direct_fax ? selectedRowDataContact.direct_fax : "";
    let _extension = selectedRowDataContact.extension ? selectedRowDataContact.extension : "";
    let _company_cell_phone = selectedRowDataContact.company_cell_phone
      ? selectedRowDataContact.company_cell_phone
      : "";
    let _personal_cell_phone = selectedRowDataContact.personal_cell_phone
      ? selectedRowDataContact.personal_cell_phone
      : "";
    let _contact_email = selectedRowDataContact.contact_email ? selectedRowDataContact.contact_email : "";
    let _position_name = selectedRowDataContact.position_name ? selectedRowDataContact.position_name : "";
    let _approval_amount = selectedRowDataContact.approval_amount ? selectedRowDataContact.approval_amount : "";
    let _position_class = selectedRowDataContact.position_class ? selectedRowDataContact.position_class : "";
    let _occupation = selectedRowDataContact.occupation ? selectedRowDataContact.occupation : "";
    let _call_careful_flag = selectedRowDataContact.call_careful_flag
      ? selectedRowDataContact.call_careful_flag
      : false;
    let _call_careful_reason = selectedRowDataContact.call_careful_reason
      ? selectedRowDataContact.call_careful_reason
      : "";
    let _email_ban_flag = selectedRowDataContact.email_ban_flag ? selectedRowDataContact.email_ban_flag : false;
    let _sending_materials_ban_flag = selectedRowDataContact.sending_materials_ban_flag
      ? selectedRowDataContact.sending_materials_ban_flag
      : false;
    let _fax_dm_ban_flag = selectedRowDataContact.fax_dm_ban_flag ? selectedRowDataContact.fax_dm_ban_flag : false;
    let _ban_reason = selectedRowDataContact.ban_reason ? selectedRowDataContact.ban_reason : "";
    let _claim = selectedRowDataContact.claim ? selectedRowDataContact.claim : "";
    setName(_name);
    setDirectLine(_direct_line);
    setDirectFax(_direct_fax);
    setExtension(_extension);
    setCompanyCellPhone(_company_cell_phone);
    setPersonalCellPhone(_personal_cell_phone);
    setEmail(_contact_email);
    setPosition(_position_name);
    setApprovalAmount(_approval_amount);
    setSelectedPositionClass(_position_class);
    setSelectedOccupation(_occupation);
    setCallCarefulFlag(_call_careful_flag);
    setCallCarefulReason(_call_careful_reason);
    setEmailBanFlag(_email_ban_flag);
    setSendingMaterialBanFlag(_sending_materials_ban_flag);
    setFaxDmBanFlag(_fax_dm_ban_flag);
    setBanReason(_ban_reason);
    setClaim(_claim);
  }, []);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    setIsOpenUpdateContactModal(false);
  };
  const handleSaveAndClose = async () => {
    // setLoadingGlobalState(true);

    // 編集、保存するデータをオブジェクトにまとめる
    const newContact = {
      id: selectedRowDataContact!.contact_id,
      name: name,
      direct_line: directLine,
      direct_fax: directFax,
      extension: extension,
      company_cell_phone: companyCellPhone,
      personal_cell_phone: personalCellPhone,
      email: email,
      position_name: position,
      position_class: selectedPositionClass,
      occupation: selectedOccupation,
      approval_amount: approvalAmount,
      email_ban_flag: emailBanFlag,
      //   email_ban_flag: false,
      sending_materials_ban_flag: sendingMaterialBanFlag,
      //   sending_materials_ban_flag: false,
      fax_dm_ban_flag: faxDmBanFlag,
      //   fax_dm_ban_flag: false,
      ban_reason: banReason ? banReason : null,
      //   ban_reason: null,
      claim: claim ? claim : null,
      //   claim: null,
      call_careful_flag: callCarefulFlag,
      //   call_careful_flag: false,
      call_careful_reason: callCarefulReason ? callCarefulReason : null,
      //   call_careful_reason: null,
      client_company_id: selectedRowDataContact!.company_id,
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: userProfileState?.department ? userProfileState.department : null,
      created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
    };

    // supabaseにUPDATE
    updateContactMutation.mutate(newContact);

    setLoadingGlobalState(false);

    // モーダルを閉じる
    setIsOpenUpdateContactModal(false);
  };
  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {loadingGlobalState && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )}
      <div className={`${styles.container} `}>
        {/* 保存・タイトル・キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[30px] text-center text-[18px]">
          <div className="font-samibold cursor-pointer hover:text-[#aaa]" onClick={handleCancelAndReset}>
            キャンセル
          </div>
          <div className="-translate-x-[25px] font-bold">担当者 編集</div>
          <div
            className={`cursor-pointer font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text}`}
            onClick={handleSaveAndClose}
          >
            保存
          </div>
        </div>
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container} `}>
          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 会社名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>会社名</span>
                  <span className={`${styles.value} ${styles.value_highlight}`}>
                    {selectedRowDataContact?.company_name ? selectedRowDataContact?.company_name : ""}
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
                    {selectedRowDataContact?.department_name ? selectedRowDataContact?.department_name : ""}
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
                    <span className={`${styles.title}`}>●担当名</span>
                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataContact?.name ? selectedRowDataContact?.name : ""}
                    </span> */}
                    <input
                      type="text"
                      placeholder="担当者名を入力してください *入力必須"
                      required
                      autoFocus
                      className={`${styles.input_box}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={directLine}
                      onChange={(e) => setDirectLine(e.target.value)}
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
            {/* --------- 横幅全部ラッパーここまで --------- */}
          </div>

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
                      placeholder=""
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
                      name="position_class"
                      id="position_class"
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={selectedOccupation}
                      onChange={(e) => setSelectedOccupation(e.target.value)}
                    >
                      <option value="1">1 社長・専務</option>
                      <option value="2">2 取締役・役員</option>
                      <option value="3">3 開発・設計</option>
                      <option value="4">4 生産技術</option>
                      <option value="5">5 製造</option>
                      <option value="6">6 品質管理・品質保証</option>
                      <option value="7">7 人事</option>
                      <option value="8">8 経理</option>
                      <option value="9">9 総務</option>
                      <option value="10">10 法務</option>
                      <option value="11">11 財務</option>
                      <option value="12">12 情報システム</option>
                      <option value="13">13 マーケティング</option>
                      <option value="14">14 購買</option>
                      <option value="15">15 営業</option>
                      <option value="16">16 企画</option>
                      <option value="17">17 CS</option>
                      <option value="18">18 その他</option>
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
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={selectedPositionClass}
                      onChange={(e) => setSelectedPositionClass(e.target.value)}
                    >
                      <option value="1">1 代表者</option>
                      <option value="2">2 取締役/役員</option>
                      <option value="3">3 部長</option>
                      <option value="4">4 課長</option>
                      <option value="5">5 課長未満</option>
                      <option value="6">6 所長・工場長</option>
                      <option value="7">7 不明</option>
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
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      min={"0"}
                      value={approvalAmount !== null ? approvalAmount : ""}
                      onChange={(e) => {
                        // Number型の場合
                        // プラスの数値と空文字以外をstateに格納
                        // if (e.target.value === "" || e.target.value.search(/^[0-9]+$/) === 0) {
                        //   console.log("OK", e.target.value.search(/^[-]?[0-9]+$/));
                        //   setApprovalAmount(e.target.value === "" ? null : Number(e.target.value));
                        // } else {
                        //   console.log("NG", e.target.value.search(/^[0-9]+$/));
                        // }
                        setApprovalAmount(e.target.value);
                      }}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
            {/* --------- 横幅全体ラッパーここまで --------- */}
          </div>

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* TEL要注意 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title}`}>TEL要注意</span>

                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        // checked={!!checkedColumnHeader} // 初期値
                        checked={callCarefulFlag}
                        onChange={() => setCallCarefulFlag(!callCarefulFlag)}
                        className={`${styles.grid_select_cell_header_input}`}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>
            {/* --------- 横幅全体ラッパーここまで --------- */}
          </div>

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* TEL注意理由 */}
            <div className={`${styles.row_area} ${styles.text_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>TEL注意理由</span>
                  <textarea
                    name="call_careful_reason"
                    id="call_careful_reason"
                    cols={30}
                    rows={10}
                    placeholder="架電時の注意事項を記入し、チームに共有しましょう"
                    className={`${styles.textarea_box} ${callCarefulFlag ? "" : "hidden"}`}
                    value={callCarefulReason}
                    onChange={(e) => setCallCarefulReason(e.target.value)}
                  ></textarea>
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
              {/* メール禁止フラグ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title}`}>メール禁止フラグ</span>

                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        // checked={!!checkedColumnHeader} // 初期値
                        // checked={!!selectedRowDataContact?.call_careful_flag}
                        checked={emailBanFlag}
                        onChange={() => setEmailBanFlag(!emailBanFlag)}
                        className={`${styles.grid_select_cell_header_input}`}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 資料禁止フラグ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title}`}>資料禁止フラグ</span>

                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        checked={sendingMaterialBanFlag}
                        onChange={() => setSendingMaterialBanFlag(!sendingMaterialBanFlag)}
                        className={`${styles.grid_select_cell_header_input}`}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
            {/* --------- 横幅全体ラッパーここまで --------- */}
          </div>

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* FAX・DM禁止フラグ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title}`}>FAX・DM禁止フラグ</span>

                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        checked={faxDmBanFlag}
                        onChange={() => setFaxDmBanFlag(!faxDmBanFlag)}
                        className={`${styles.grid_select_cell_header_input}`}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 左ラッパーここまで */}
            </div>
            {/* --------- 横幅全体ラッパーここまで --------- */}
          </div>

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 禁止理由 */}
            <div className={`${styles.row_area} ${styles.text_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full  `}>
                  <span className={`${styles.title}`}>禁止理由</span>
                  <textarea
                    name="address"
                    id="address"
                    cols={30}
                    rows={10}
                    placeholder="メール・資料送付・FAX・DMの禁止理由を記載してください"
                    className={`${styles.textarea_box} ${
                      emailBanFlag || sendingMaterialBanFlag || faxDmBanFlag ? "" : "hidden"
                    }`}
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                  ></textarea>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* クレーム */}
            <div className={`${styles.row_area} ${styles.text_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>クレーム</span>
                  <textarea
                    name="address"
                    id="address"
                    cols={30}
                    rows={10}
                    placeholder="クレームを受けた場合はチーム全体に共有しましょう"
                    className={`${styles.textarea_box} `}
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                  ></textarea>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* メインコンテンツ コンテナ ここまで */}
        </div>
      </div>
    </>
  );
};
