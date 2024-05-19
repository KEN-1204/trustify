import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import styles from "./DealBoard.module.css";
import { AvatarIcon } from "@/components/Parts/AvatarIcon/AvatarIcon";
import { TbSnowflake } from "react-icons/tb";
import { MemberAccounts } from "@/types";

type Props = {
  memberObj: MemberAccounts & {
    company_id: string;
    company_name: string;
  };
  isFade?: boolean;
};

// useQueryの取得中とcardsの初期値がまだセットされていない場合はローディングを返す h: 48(タイトル) 288(ボード)
export const FallbackDealBoard = ({ memberObj, isFade = false }: Props) => {
  return (
    <>
      <div className={`${styles.entity_detail_container} min-h-[48px] ${isFade ? `fade08_forward` : ``}`}>
        <div className={`${styles.entity_detail_wrapper}`}>
          <div className={`${styles.entity_detail} space-x-[12px] text-[12px]`}>
            <AvatarIcon
              // size={33}
              size={36}
              name={memberObj.profile_name ?? "未設定"}
              withCircle={false}
              hoverEffect={false}
              textSize={16}
              // imgUrl={memberObj.avatar_url ?? null}
            />
            <div className={`${styles.entity_name} text-[19px] font-bold`}>
              <span>{memberObj.profile_name}</span>
            </div>
            <div className={`${styles.sub_info} pt-[6px]`}>{memberObj.position_name ?? "役職未設定"}</div>
            <div className={`${styles.sub_info} pt-[6px]`}>{memberObj.assigned_employee_id_name ?? ""}</div>
          </div>
        </div>
        <div className={`${styles.status_col_wrapper}`}>
          <div className={`flex h-full items-start pt-[10px]`}>
            <div className={`${styles.btn} ${styles.basic} space-x-[4px]`}>
              <TbSnowflake />
              <span>固定</span>
            </div>
          </div>
        </div>
      </div>
      <div className={`flex-center h-[288px] w-full px-[24px] py-[12px]`}>
        <SpinnerX />
      </div>
    </>
  );
};
