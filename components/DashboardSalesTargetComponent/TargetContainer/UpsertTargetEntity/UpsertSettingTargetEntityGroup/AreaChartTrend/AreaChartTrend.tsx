import { AreaChartComponent, LabelValue } from "@/components/Parts/Charts/AreaChart/AreaChart";
import useDashboardStore from "@/store/useDashboardStore";
import styles from "../../../../DashboardSalesTargetComponent.module.css";
import { useMemo } from "react";

export const AreaChartTrend = () => {
  const upsertSettingEntitiesObj = useDashboardStore((state) => state.upsertSettingEntitiesObj);

  if (!upsertSettingEntitiesObj) return;
  if (!upsertSettingEntitiesObj.fiscalYear) return;

  // エリアチャート用labelValueArray メインターゲット用
  const labelValueArrayMain = useMemo(() => {
    return upsertSettingEntitiesObj.entities.map(
      (obj) =>
        ({
          id: obj.entity_id,
          // value: obj.
          value: 1230000,
          label: obj.entity_name,
        } as LabelValue)
    );
  }, [upsertSettingEntitiesObj.entities]);
  return (
    <div
      // className={`${styles.area_chart_container} mt-[16px] h-[288px] w-full bg-[red]/[0]`}
      className={`${styles.area_chart_container}  w-full bg-[red]/[0]`}
    >
      {/* エリアチャート */}
      <AreaChartComponent labelType="" labelValueArray={labelValueArrayMain} delay={600} />
      {/* エリアチャート ここまで */}
    </div>
  );
};
