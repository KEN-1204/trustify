import {
  CSSProperties,
  Dispatch,
  KeyboardEvent,
  MutableRefObject,
  SetStateAction,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";
import { HiChevronDown } from "react-icons/hi2";
import styles from "./InsertNewClientCompanyModal.module.css";
import { Cities, hoveredItemPosModal } from "@/types";
import { useQueryCities } from "@/hooks/useQueryCities";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";

type TooltipParams = {
  e: React.MouseEvent<HTMLElement, MouseEvent>;
  display: string;
  content: string;
  content2?: string | undefined | null;
  content3?: string | undefined | null;
  marginTop?: number;
  itemsPosition?: string;
  whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
};

type Props = {
  cityName: string;
  setCityName: Dispatch<SetStateAction<string>>;
  cityId: string;
  setCityId: Dispatch<SetStateAction<string>>;
  regionName: string;
  regionId: string;
  hoveredItemPosModal: hoveredItemPosModal;
  handleOpenTooltip: ({
    e,
    display,
    content,
    content2,
    content3,
    marginTop,
    itemsPosition,
    whiteSpace,
  }: TooltipParams) => void;
  handleCloseTooltip: () => void;
  isDuplicateCompany: boolean;
};

const InputBoxCityMemo = ({
  cityName,
  setCityName,
  cityId,
  setCityId,
  regionName,
  regionId,
  hoveredItemPosModal,
  handleOpenTooltip,
  handleCloseTooltip,
  isDuplicateCompany,
}: Props) => {
  const language = useStore((state) => state.language);
  const inputCityRef = useRef<HTMLInputElement | null>(null);
  const resultCityRefs = useRef<HTMLDivElement | null>(null);
  const [suggestedCityIdNameArray, setSuggestedCityIdNameArray] = useState<Cities[]>([]);
  const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const [prevRegionName, setPrevRegionName] = useState("");
  const [prevRegionId, setPrevRegionId] = useState("");

  // ======================= 🌟市区町村のuseQuery🌟 =======================
  const { data: citiesArray, isLoading: isLoadingCities } = useQueryCities(regionId ? Number(regionId) : null);
  // ======================= ✅市区町村のuseQuery✅ =======================

  // 会社複製時の初回マウント時にNameをセット
  useEffect(() => {
    if (!selectedRowDataCompany) return;
    if (!isDuplicateCompany) return;
    const _cityObj = citiesArray?.find((obj) => obj.city_id === selectedRowDataCompany.city_id);
    const _cityName = language === "ja" ? _cityObj?.city_name_ja : _cityObj?.city_name_en;
    setCityName(_cityName ?? "");
    setCityId(_cityObj?.city_id ? _cityObj?.city_id.toString() : "");
  }, []);

  // regionIdが変更された時にsuggestedを空に
  useEffect(() => {
    if (citiesArray) setSuggestedCityIdNameArray([]);
    if (regionId && prevRegionId !== regionId) {
      setPrevRegionName(regionName);
      setPrevRegionId(regionId);
    }
    // if (!citiesArray) setSuggestedCityIdNameArray([]);
  }, [regionId]);

  // regionIdが存在していてregionNameが変更されたらcityNameとcityIdを空に
  useEffect(() => {
    if (prevRegionName !== regionName && regionId !== "") {
      if (cityId) setCityId("");
      if (cityName) setCityName("");
    }
  }, [regionName]);

  const handleSuggestedName = (e: KeyboardEvent<HTMLInputElement>, title: string) => {
    let filteredResult = [];

    // 入力されていない場合
    if (!e.currentTarget.value.length) {
      console.log("🌟入力されていない e.currentTarget.value", e.currentTarget.value);
      if (title === "city") setSuggestedCityIdNameArray([]);
    }
    // 入力値が存在する場合は、入力値に一致するavailableKeywordsをフィルター
    if (e.currentTarget.value.length) {
      if (title === "city") {
        if (!citiesArray) {
          return setSuggestedCityIdNameArray([]);
        }
        const filteredResult = citiesArray.filter((obj) => {
          if (language === "ja") return obj.city_name_ja?.toLowerCase().includes(e.currentTarget.value.toLowerCase());
          if (language === "en") return obj.city_name_en?.toLowerCase().includes(e.currentTarget.value.toLowerCase());
        });
        console.log("🌟filteredResult", filteredResult, "🌟入力あり", e.currentTarget.value);
        setSuggestedCityIdNameArray(filteredResult);
        return;
      }
    }
  };

  const handleFocusSuggestedName = (currentInputState: string | null, title: string) => {
    if (!currentInputState) return;
    let filteredResult = [];

    // 入力されていない場合
    if (!currentInputState.length) {
      console.log("🌟入力されていない currentInputState", currentInputState);

      if (title === "city") setSuggestedCityIdNameArray([]);
    }
    // 入力値が存在する場合は、入力値に一致するavailableKeywordsをフィルター
    if (currentInputState.length) {
      if (title === "city") {
        if (!citiesArray) {
          return setSuggestedCityIdNameArray([]);
        }
        const filteredResult = citiesArray.filter((obj) => {
          if (language === "ja") return obj.city_name_ja?.toLowerCase().includes(currentInputState.toLowerCase());
          if (language === "en") return obj.city_name_en?.toLowerCase().includes(currentInputState.toLowerCase());
        });
        console.log("🌟filteredResult", filteredResult, "🌟入力あり", currentInputState);
        setSuggestedCityIdNameArray(filteredResult);
        return;
      }
    }
  };

  const handleBlurSetId = (currentInputState: string, title: string) => {
    if (!currentInputState) return;
    if (title === "city" && regionId && !!citiesArray?.length) {
      if (/市|区|町|村/.test(currentInputState)) {
        const matchCityId = citiesArray.find(
          (obj) => (language === "ja" ? obj.city_name_ja : obj.city_name_en) === currentInputState
        )?.city_id;
        if (matchCityId && cityId !== matchCityId.toString()) setCityId(matchCityId.toString());
        if (!matchCityId && cityId) setCityId("");
      }
      // 市区町村が含まれていなくて、かつ候補が一つならその候補をidとNameにセット
      else if (suggestedCityIdNameArray?.length === 1) {
        const newCityName = suggestedCityIdNameArray[0].city_name_ja;
        const matchCityId = citiesArray.find(
          (obj) => (language === "ja" ? obj.city_name_ja : obj.city_name_en) === newCityName
        )?.city_id;
        if (matchCityId && cityId !== matchCityId.toString()) setCityId(matchCityId.toString());
        if (!matchCityId && cityId) setCityId("");
        setCityName(newCityName ?? "");
      } else {
        if (cityId) setCityId("");
      }
    }
  };

  console.log(
    "cityName",
    cityName,
    "cityId",
    cityId,
    "regionName",
    regionName,
    "prevRegionName",
    prevRegionName,
    "regionId",
    regionId,
    "prevRegionId",
    prevRegionId,
    "市区町村リスト候補",
    suggestedCityIdNameArray,
    "citiesArray",
    citiesArray
  );

  return (
    <>
      <div className={`input_container relative z-[100] flex h-[32px] w-full items-start`}>
        <input
          ref={inputCityRef}
          type="text"
          placeholder="キーワード入力後、市区町村を選択してください。"
          required
          className={`${styles.input_box}`}
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          onKeyUp={(e) => handleSuggestedName(e, "city")}
          onFocus={(e) => {
            handleFocusSuggestedName(cityName, "city");
            if (!!resultCityRefs.current) resultCityRefs.current.style.opacity = "1";
          }}
          onBlur={() => {
            if (!!resultCityRefs.current) resultCityRefs.current.style.opacity = "0";
            handleBlurSetId(cityName, "city");
          }}
        />
        {/* 予測変換結果 */}
        {suggestedCityIdNameArray && suggestedCityIdNameArray && suggestedCityIdNameArray?.length > 0 && (
          <div
            ref={resultCityRefs}
            className={`${styles.result_box}`}
            style={
              {
                "--color-border-custom": "#ccc",
              } as CSSProperties
            }
          >
            {suggestedCityIdNameArray && suggestedCityIdNameArray && suggestedCityIdNameArray?.length > 0 && (
              <div className="sticky top-0 flex min-h-[5px] w-full flex-col items-center justify-end">
                <hr className={`min-h-[4px] w-full bg-[var(--color-bg-under-input)]`} />
                <hr className={`min-h-[1px] w-[93%] bg-[#ccc]`} />
              </div>
            )}
            <ul>
              {suggestedCityIdNameArray?.map((city, index) => (
                <li
                  key={city.city_id.toString() + index.toString()}
                  onClick={(e) => {
                    // console.log("🌟innerText", e.currentTarget.innerText);
                    const productName = language === "ja" ? city.city_name_ja : city.city_name_en;
                    const productId = city.city_id;
                    // setPlannedProduct1(e.currentTarget.innerText);
                    setCityName(productName ?? "");
                    setCityId(productId ? productId.toString() : "");
                    setSuggestedCityIdNameArray([]);
                  }}
                >
                  {language === "ja" ? city.city_name_ja : city.city_name_en}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* 予測変換結果 */}
        <div
          className={`flex-center absolute right-[3px] top-[50%] min-h-[20px] min-w-[20px] translate-y-[-50%] cursor-pointer rounded-full hover:bg-[var(--color-bg-sub-icon)]`}
          onMouseEnter={(e) => {
            // if (isOpenDropdownMenuFilterProducts) return;
            handleOpenTooltip({
              e: e,
              display: "top",
              content: "フィルターされた市区町村リストを表示します。",
              content2: "アイコンをクリックしてフィルターの切り替えが可能です。",
              // content3: "商品紹介が無い面談の場合は「他」を選択してください。",
              // marginTop: 57,
              // marginTop: 38,
              marginTop: 12,
              itemsPosition: "center",
              whiteSpace: "nowrap",
            });
          }}
          onMouseLeave={() => {
            if (hoveredItemPosModal) handleCloseTooltip();
          }}
          onClick={() => {
            if (inputCityRef.current) {
              // フォーカス状態でリスト表示されている場合はフォーカスを切ってリストを削除
              if (!!suggestedCityIdNameArray?.length) {
                inputCityRef.current.blur();
                setSuggestedCityIdNameArray([]);
              }
              // まだフォーカスされていない場合
              else {
                inputCityRef.current.focus();
                // 矢印クリック 全商品をリストで表示
                if (!suggestedCityIdNameArray?.length && citiesArray && citiesArray.length > 0) {
                  setSuggestedCityIdNameArray(citiesArray);
                }
              }
            }
            if (hoveredItemPosModal) handleCloseTooltip();
          }}
        >
          <HiChevronDown className="stroke-[1] text-[13px] text-[var(--color-text-brand-f)]" />
        </div>
      </div>
    </>
  );
};

export const InputBoxCity = memo(InputBoxCityMemo);
