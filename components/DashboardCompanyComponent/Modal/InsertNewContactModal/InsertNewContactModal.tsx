import React, { useState } from "react";
import styles from "./InsertNewContactModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";

export const InsertNewContactModal = () => {
  const setIsOpenInsertNewContactModal = useDashboardStore((state) => state.setIsOpenInsertNewContactModal);
  // 上画面の選択中の列データ会社
  const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  // 職位selectタグ選択用state
  const [selectedPositionClass, setSelectedPositionClass] = useState("1 代表者");
  // 担当職種selectタグ選択用state
  const [selectedOccupation, setSelectedOccupation] = useState("1 社長・専務");
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

  console.log(
    "InsertNewContactModalコンポーネント レンダリング",
    "職位セレクトタグ",
    selectedPositionClass,
    "担当職種タグ",
    selectedOccupation
  );

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    setIsOpenInsertNewContactModal(false);
  };
  const handleSaveAndClose = () => {
    setIsOpenInsertNewContactModal(false);
  };
  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      <div className={`${styles.container} `}>
        {/* 保存・タイトル・キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[30px] text-center text-[18px]">
          <div className="font-samibold cursor-pointer hover:text-[#aaa]" onClick={handleCancelAndReset}>
            キャンセル
          </div>
          <div className="-translate-x-[25px] font-bold">担当者 新規作成</div>
          <div
            className={`cursor-pointer font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text}`}
            onClick={handleSaveAndClose}
          >
            保存
          </div>
        </div>
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
                    <span className={`${styles.title}`}>●担当名</span>
                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
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

              {/* 決済金額 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>決済金額</span>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={approvalAmount}
                      onChange={(e) => setApprovalAmount(e.target.value)}
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
