/**
 * {
  electronic_components_modules: { ja: "電子部品・モジュール", en: `` },
  mechanical_parts: { ja: "機械部品", en: `` },
  manufacturing_processing_machines: { ja: "製造・加工機械", en: `` },
  scientific_chemical_equipment: { ja: "科学・理化学機器", en: `` },
  materials: { ja: "素材・材料", en: `` },
  measurement_analysis: { ja: "測定・分析", en: `` },
  image_processing: { ja: "画像処理", en: `` },
  control_electrical_equipment: { ja: "制御・電機機器", en: `` },
  tools_consumables_supplies: { ja: "工具・消耗品・備品", en: `` },
  design_production_support: { ja: "設計・生産支援", en: `` },
  it_network: { ja: "IT・ネットワーク", en: `` },
  office: { ja: "オフィス", en: `` },
  business_support_services: { ja: "業務支援サービス", en: `` },
  seminars_skill_up: { ja: "セミナー・スキルアップ", en: `` },
  others: { ja: "その他", en: `` },
};
 */

import {
  ProductCategoriesLarge,
  ProductCategoriesMedium,
  ProductCategoriesMediumAnalysis,
  ProductCategoriesMediumBusinessSupport,
  ProductCategoriesMediumControlEquipment,
  ProductCategoriesMediumDesign,
  ProductCategoriesMediumIT,
  ProductCategoriesMediumImageProcessing,
  ProductCategoriesMediumMachine,
  ProductCategoriesMediumMaterial,
  ProductCategoriesMediumModule,
  ProductCategoriesMediumOffice,
  ProductCategoriesMediumProcessingMachinery,
  ProductCategoriesMediumScience,
  ProductCategoriesMediumSkillUp,
  ProductCategoriesMediumTool,
} from "@/types";

/**
 * 電子部品 - electronic_components / electronic_parts
  コネクタ - connectors
  端子台 - terminal_blocks
  小型モータ - small_motors
  電源 - power_supplies
  電池・バッテリー - batteries
  半導体 - semiconductors
  光学部品 - optical_components
  ケーブル - cables
  受託サービス - contracted_services / contract_services
 */
// 1. 「電子部品・モジュール」 中分類 1. electronic_components_modules
export const moduleCategoryMNameOnly: ProductCategoriesMediumModule[] = [
  "electronic_components",
  "connectors",
  "terminal_blocks",
  "led",
  "fpd_touch_panel",
  "small_motors",
  "power_supplies",
  "batteries",
  "semiconductors_ic",
  "rfid_ic_tag",
  "optical_components",
  "cables",
  "contracted_services",
];
export const moduleCategoryM: { id: number; name: ProductCategoriesMediumModule }[] = [
  { id: 16, name: "electronic_components" },
  { id: 17, name: "connectors" },
  { id: 18, name: "terminal_blocks" },
  { id: 19, name: "led" },
  { id: 20, name: "fpd_touch_panel" },
  { id: 21, name: "small_motors" },
  { id: 22, name: "power_supplies" },
  { id: 23, name: "batteries" },
  { id: 24, name: "semiconductors_ic" },
  { id: 25, name: "rfid_ic_tag" },
  { id: 26, name: "optical_components" },
  { id: 27, name: "cables" },
  { id: 28, name: "contracted_services" },
];
export const mappingModuleCategoryM: { [K in ProductCategoriesMediumModule | string]: { [key: string]: string } } = {
  electronic_components: { ja: "電子部品", en: `` }, // 1 - 16 - 1
  connectors: { ja: "コネクタ", en: `` }, // 1 - 17 - 2
  terminal_blocks: { ja: "端子台", en: `` }, // 1 - 18 - 3
  led: { ja: "LED", en: `` }, // 1 - 19 - 4
  fpd_touch_panel: { ja: "FPD・タッチパネル", en: `` }, // 1 - 20 - 5
  small_motors: { ja: "小型モータ", en: `` }, // 1 - 21 - 6
  power_supplies: { ja: "電源", en: `` }, // 1 - 22 - 7
  batteries: { ja: "電池・バッテリー", en: `` }, // 1 - 23 - 8
  semiconductors_ic: { ja: "半導体・IC", en: `` }, // 1 - 24 - 9
  rfid_ic_tag: { ja: "RFID・ICタグ", en: `` }, // 1 - 25 - 10
  optical_components: { ja: "光学部品", en: `` }, // 1 - 26 - 11
  cables: { ja: "ケーブル", en: `` }, // 1 - 27 - 12
  contracted_services: { ja: "受託サービス", en: `` }, // 1 - 28 - 13
};
// export const moduleCategoryM = Array(13)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingModuleCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "電子部品", en: `` },
//   2: { ja: "コネクタ", en: `` },
//   3: { ja: "端子台", en: `` },
//   4: { ja: "LED", en: `` },
//   5: { ja: "FPD・タッチパネル", en: `` },
//   6: { ja: "小型モータ", en: `` },
//   7: { ja: "電源", en: `` },
//   8: { ja: "電池・バッテリー", en: `` },
//   9: { ja: "半導体・IC", en: `` },
//   10: { ja: "RFID・ICタグ", en: `` },
//   11: { ja: "光学部品", en: `` },
//   12: { ja: "ケーブル", en: `` },
//   13: { ja: "受託サービス", en: `` },
// };
// export const moduleCategoryM = [
//     <option key="" value=""></option>,
//     <option key="電子部品" value="電子部品">電子部品</option>,
//     <option key="コネクタ" value="コネクタ">コネクタ</option>,
//     <option key="端子台" value="端子台">端子台</option>,
//     <option key="LED" value="LED">LED</option>,
//     <option key="FPD・タッチパネル" value="FPD・タッチパネル">FPD・タッチパネル</option>,
//     <option key="小型モータ" value="小型モータ">小型モータ</option>,
//     <option key="電源" value="電源">電源</option>,
//     <option key="電池・バッテリー" value="電池・バッテリー">電池・バッテリー</option>,
//     <option key="半導体・IC" value="半導体・IC">半導体・IC</option>,
//     <option key="RFID・ICタグ" value="RFID・ICタグ">RFID・ICタグ</option>,
//     <option key="光学部品" value="光学部品">光学部品</option>,
//     <option key="ケーブル" value="ケーブル">ケーブル</option>,
//     <option key="受託サービス" value="受託サービス">受託サービス</option>,
// ]

// 2. 「機械部品」 中分類 2. mechanical_parts
export const machinePartsCategoryMNameOnly: ProductCategoriesMediumMachine[] = [
  "mechanical_elements",
  "bearings",
  "screws",
  "motors",
  "pumps",
  "piping_components",
  "water_oil_hydraulic_pneumatic_equipment",
  "vacuum_equipment",
  "molds",
  "jigs",
  "automotive_parts",
];
export const machinePartsCategoryM: { id: number; name: ProductCategoriesMediumMachine }[] = [
  { id: 29, name: "mechanical_elements" }, // 220から241
  { id: 30, name: "bearings" }, // 242から243
  { id: 31, name: "screws" }, // 244から245
  { id: 32, name: "motors" }, // 246から254
  { id: 33, name: "pumps" }, // 255から259
  { id: 34, name: "piping_components" }, // 260から265
  { id: 35, name: "water_oil_hydraulic_pneumatic_equipment" }, // 266から268
  { id: 36, name: "vacuum_equipment" }, // 269から271
  { id: 37, name: "molds" }, // 272から277
  { id: 38, name: "jigs" }, // 278から281
  { id: 39, name: "automotive_parts" }, // 282から295
];
export const mappingMachinePartsCategoryM:
  | {
      [K in ProductCategoriesMediumMachine | string]: { [key: string]: string };
    } = {
  mechanical_elements: { ja: "機械要素", en: `` }, // 1
  bearings: { ja: "軸受・ベアリング", en: `` }, // 2
  screws: { ja: "ねじ", en: `` }, // 3
  motors: { ja: "モータ", en: `` }, // 4
  pumps: { ja: "ポンプ", en: `` }, // 5
  piping_components: { ja: "配管部品", en: `` }, // 6
  water_oil_hydraulic_pneumatic_equipment: { ja: "油空水圧機器", en: `` }, // 7
  vacuum_equipment: { ja: "真空機器", en: `` }, // 8
  molds: { ja: "金型", en: `` }, // 9
  jigs: { ja: "治具", en: `` }, // 10
  automotive_parts: { ja: "自動車部品", en: `` }, // 11
};
// export const machinePartsCategoryM = Array(11)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingMachinePartsCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "機械要素", en: `` },
//   2: { ja: "軸受・ベアリング", en: `` },
//   3: { ja: "ねじ", en: `` },
//   4: { ja: "モータ", en: `` },
//   5: { ja: "ポンプ", en: `` },
//   6: { ja: "配管部品", en: `` },
//   7: { ja: "油空水圧機器", en: `` },
//   8: { ja: "真空機器", en: `` },
//   9: { ja: "金型", en: `` },
//   10: { ja: "治具", en: `` },
//   11: { ja: "自動車部品", en: `` },
// };
// export const machinePartsCategoryM = [
//   <option key="" value=""></option>,
//   <option key="機械要素" value="機械要素">
//     機械要素
//   </option>,
//   <option key="軸受・ベアリング" value="軸受・ベアリング">
//     軸受・ベアリング
//   </option>,
//   <option key="ねじ" value="ねじ">
//     ねじ
//   </option>,
//   <option key="モータ" value="モータ">
//     モータ
//   </option>,
//   <option key="ポンプ" value="ポンプ">
//     ポンプ
//   </option>,
//   <option key="配管部品" value="配管部品">
//     配管部品
//   </option>,
//   <option key="油空水圧機器" value="油空水圧機器">
//     油空水圧機器
//   </option>,
//   <option key="真空機器" value="真空機器">
//     真空機器
//   </option>,
//   <option key="金型" value="金型">
//     金型
//   </option>,
//   <option key="治具" value="治具">
//     治具
//   </option>,
//   <option key="自動車部品" value="自動車部品">
//     自動車部品
//   </option>,
// ];

// 3. 「製造・加工機械」 中分類 3. manufacturing_processing_machines
export const processingMachineryCategoryMNameOnly: ProductCategoriesMediumProcessingMachinery[] = [
  "machine_tools",
  "processing_machines",
  "semiconductor_manufacturing_equipment",
  "mounting_machines",
  "industrial_robots",
  "assembly_machines",
  "painting_machines",
  "food_machines",
  "packaging_machines",
  "conveying_machines",
  "marking",
  "contracted_services",
];
export const processingMachineryCategoryM: { id: number; name: ProductCategoriesMediumProcessingMachinery }[] = [
  { id: 40, name: "machine_tools" }, // 296から305
  { id: 41, name: "processing_machines" }, // 306から323
  { id: 42, name: "semiconductor_manufacturing_equipment" }, // 324から343
  { id: 43, name: "mounting_machines" }, // 344から352
  { id: 44, name: "industrial_robots" }, // 353から361
  { id: 45, name: "assembly_machines" }, // 362から366
  { id: 46, name: "painting_machines" }, // 367から369
  { id: 47, name: "food_machines" }, // 370から380
  { id: 48, name: "packaging_machines" }, // 381から390
  { id: 49, name: "conveying_machines" }, // 391から399
  { id: 50, name: "marking" }, // 400から407
  { id: 51, name: "contracted_services" }, // 408から410
];
export const mappingProcessingMachineryCategoryM: {
  [K in ProductCategoriesMediumProcessingMachinery | string | string]: { [key: string]: string };
} = {
  machine_tools: { ja: "工作機械", en: `` }, // 1
  processing_machines: { ja: "加工機械", en: `` }, // 2
  semiconductor_manufacturing_equipment: { ja: "半導体製造装置", en: `` }, // 3
  mounting_machines: { ja: "実装機械", en: `` }, // 4
  industrial_robots: { ja: "産業用ロボット", en: `` }, // 5
  assembly_machines: { ja: "組立機械", en: `` }, // 6
  painting_machines: { ja: "塗装機械", en: `` }, // 7
  food_machines: { ja: "食品機械", en: `` }, // 8
  packaging_machines: { ja: "包装機械", en: `` }, // 9
  conveying_machines: { ja: "搬送機械", en: `` }, // 10
  marking: { ja: "マーキング", en: `` }, // 11
  contracted_services: { ja: "受託サービス", en: `` }, // 12
};
// export const processingMachineryCategoryM = Array(12)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingProcessingMachineryCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "工作機械", en: `` },
//   2: { ja: "加工機械", en: `` },
//   3: { ja: "半導体製造装置", en: `` },
//   4: { ja: "実装機械", en: `` },
//   5: { ja: "産業用ロボット", en: `` },
//   6: { ja: "組立機械", en: `` },
//   7: { ja: "塗装機械", en: `` },
//   8: { ja: "食品機械", en: `` },
//   9: { ja: "包装機械", en: `` },
//   10: { ja: "搬送機械", en: `` },
//   11: { ja: "マーキング", en: `` },
//   12: { ja: "受託サービス", en: `` },
// };
// export const processingMachineryCategoryM = [
//   <option key="" value=""></option>,
//   <option key="工作機械" value="工作機械">
//     工作機械
//   </option>,
//   <option key="加工機械" value="加工機械">
//     加工機械
//   </option>,
//   <option key="半導体製造装置" value="半導体製造装置">
//     半導体製造装置
//   </option>,
//   <option key="実装機械" value="実装機械">
//     実装機械
//   </option>,
//   <option key="産業用ロボット" value="産業用ロボット">
//     産業用ロボット
//   </option>,
//   <option key="組立機械" value="組立機械">
//     組立機械
//   </option>,
//   <option key="塗装機械" value="塗装機械">
//     塗装機械
//   </option>,
//   <option key="食品機械" value="食品機械">
//     食品機械
//   </option>,
//   <option key="包装機械" value="包装機械">
//     包装機械
//   </option>,
//   <option key="搬送機械" value="搬送機械">
//     搬送機械
//   </option>,
//   <option key="マーキング" value="マーキング">
//     マーキング
//   </option>,
//   <option key="受託サービス" value="受託サービス">
//     受託サービス
//   </option>,
// ];

// 4. 「科学・理化学」 中分類 4. scientific_chemical_equipment
export const scienceCategoryMNameOnly: ProductCategoriesMediumScience[] = [
  "chemical_equipment",
  "cleaning_machines",
  "powder_equipment",
  "heating_equipment_furnaces",
  "surface_treatment_equipment",
  "laboratory_equipment_supplies",
];
export const scienceCategoryM: { id: number; name: ProductCategoriesMediumScience }[] = [
  { id: 52, name: "chemical_equipment" }, // 411から434
  { id: 53, name: "cleaning_machines" }, // 435から437
  { id: 54, name: "powder_equipment" }, // 438から447
  { id: 55, name: "heating_equipment_furnaces" }, // 448から454
  { id: 56, name: "surface_treatment_equipment" }, // 455から458
  { id: 57, name: "laboratory_equipment_supplies" }, // 459から462
];
export const mappingScienceCategoryM: {
  [K in ProductCategoriesMediumScience | string]: { [key: string]: string };
} = {
  chemical_equipment: { ja: "理化学機器", en: `` }, // 1
  cleaning_machines: { ja: "洗浄機", en: `` }, // 2
  powder_equipment: { ja: "粉体機器", en: `` }, // 3
  heating_equipment_furnaces: { ja: "加熱装置・炉", en: `` }, // 4
  surface_treatment_equipment: { ja: "表面処理装置", en: `` }, // 5
  laboratory_equipment_supplies: { ja: "実験器具・消耗品", en: `` }, // 6
};
// export const scienceCategoryM = Array(6)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingScienceCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "理化学機器", en: `` },
//   2: { ja: "洗浄機", en: `` },
//   3: { ja: "粉体機器", en: `` },
//   4: { ja: "加熱装置・炉", en: `` },
//   5: { ja: "表面処理装置", en: `` },
//   6: { ja: "実験器具・消耗品", en: `` },
// };
// export const scienceCategoryM = [
//   <option key="" value=""></option>,
//   <option key="理化学機器" value="理化学機器">
//     理化学機器
//   </option>,
//   <option key="洗浄機" value="洗浄機">
//     洗浄機
//   </option>,
//   <option key="粉体機器" value="粉体機器">
//     粉体機器
//   </option>,
//   <option key="加熱装置・炉" value="加熱装置・炉">
//     加熱装置・炉
//   </option>,
//   <option key="表面処理装置" value="表面処理装置">
//     表面処理装置
//   </option>,
//   <option key="実験器具・消耗品" value="実験器具・消耗品">
//     実験器具・消耗品
//   </option>,
// ];

// 5. 「素材・材料」 中分類 5. materials
export const materialCategoryMNameOnly: ProductCategoriesMediumMaterial[] = [
  "metal_materials",
  "polymer_materials",
  "glass",
  "ceramics",
  "wood",
  "paper_pulps",
  "organic_natural_materials",
  "chemicals",
];
export const materialCategoryM: { id: number; name: ProductCategoriesMediumMaterial }[] = [
  { id: 58, name: "metal_materials" }, // 463から472
  { id: 59, name: "polymer_materials" }, // 473から478
  { id: 60, name: "glass" }, // 479から479
  { id: 61, name: "ceramics" }, // 480から481
  { id: 62, name: "wood" }, // 482から483
  { id: 63, name: "paper_pulps" }, // 484から485
  { id: 64, name: "organic_natural_materials" }, // 486から487
  { id: 65, name: "chemicals" }, // 488から488
];
export const mappingMaterialCategoryM: { [K in ProductCategoriesMediumMaterial | string]: { [key: string]: string } } =
  {
    metal_materials: { ja: "金属材料", en: `` }, // 1
    polymer_materials: { ja: "高分子材料", en: `` }, // 2
    glass: { ja: "ガラス", en: `` }, // 3
    ceramics: { ja: "セラミックス", en: `` }, // 4
    wood: { ja: "木材", en: `` }, // 5
    paper_pulps: { ja: "紙・パルプ", en: `` }, // 6
    organic_natural_materials: { ja: "有機天然材料", en: `` }, // 7
    chemicals: { ja: "薬品", en: `` }, // 8
  };
// export const materialCategoryM = Array(8)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingMaterialCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "金属材料", en: `` },
//   2: { ja: "高分子材料", en: `` },
//   3: { ja: "ガラス", en: `` },
//   4: { ja: "セラミックス", en: `` },
//   5: { ja: "木材", en: `` },
//   6: { ja: "紙・バルブ", en: `` },
//   7: { ja: "有機天然材料", en: `` },
//   8: { ja: "薬品", en: `` },
// };
// export const materialCategoryM = [
//   <option key="" value=""></option>,
//   <option key="金属材料" value="金属材料">
//     金属材料
//   </option>,
//   <option key="高分子材料" value="高分子材料">
//     高分子材料
//   </option>,
//   <option key="ガラス" value="ガラス">
//     ガラス
//   </option>,
//   <option key="セラミックス" value="セラミックス">
//     セラミックス
//   </option>,
//   <option key="木材" value="木材">
//     木材
//   </option>,
//   <option key="紙・バルブ" value="紙・バルブ">
//     紙・バルブ
//   </option>,
//   <option key="有機天然材料" value="有機天然材料">
//     有機天然材料
//   </option>,
//   <option key="薬品" value="薬品">
//     薬品
//   </option>,
// ];

// 6. 「測定・分析」 中分類 6. measurement_analysis
export const analysisCategoryMNameOnly: ProductCategoriesMediumAnalysis[] = [
  "distance_measuring_machine",
  "weight_measuring_machine",
  "electronic_measuring_machine",
  "temperature_humidity_machine",
  "electrical_machine",
  "coordinate_measuring_machine",
  "other_measuring_machine",
  "testing_machine",
  "inspection_machine",
  "microscopes",
  "recorders_loggers",
  "analytical_machine",
  "environmental_analysis_machine",
  "contracted_services",
];
export const analysisCategoryM: { id: number; name: ProductCategoriesMediumAnalysis }[] = [
  { id: 66, name: "distance_measuring_machine" }, // 489から489
  { id: 67, name: "weight_measuring_machine" }, // 490から493
  { id: 68, name: "electronic_measuring_machine" }, // 494から505
  { id: 69, name: "temperature_humidity_machine" }, // 506から511
  { id: 70, name: "electrical_machine" }, // 512から515
  { id: 71, name: "coordinate_measuring_machine" }, // 516から516
  { id: 72, name: "other_measuring_machine" }, // 517から526
  { id: 73, name: "testing_machine" }, // 527から536
  { id: 74, name: "inspection_machine" }, // 537から543
  { id: 75, name: "microscopes" }, // 544から549
  { id: 76, name: "recorders_loggers" }, // 550から551
  { id: 77, name: "analytical_machine" }, // 552から554
  { id: 78, name: "environmental_analysis_machine" }, // 555から561
  { id: 79, name: "contracted_services" }, // 562から564
];
export const mappingAnalysisCategoryM: { [K in ProductCategoriesMediumAnalysis | string]: { [key: string]: string } } =
  {
    distance_measuring_machine: { ja: "距離測定器", en: `` }, // 1
    weight_measuring_machine: { ja: "重量測定器", en: `` }, // 2
    electronic_measuring_machine: { ja: "電子計測器", en: `` }, // 3
    temperature_humidity_machine: { ja: "温湿度測定器", en: `` }, // 4
    electrical_machine: { ja: "電気計器・電位計", en: `` }, // 5
    coordinate_measuring_machine: { ja: "3次元測定器", en: `` }, // 6
    other_measuring_machine: { ja: "その他計測器", en: `` }, // 7
    testing_machine: { ja: "試験機器・装置", en: `` }, // 8
    inspection_machine: { ja: "検査機器・装置", en: `` }, // 9
    microscopes: { ja: "顕微鏡・マイクロスコープ", en: `` }, // 10
    recorders_loggers: { ja: "記録計・ロガー", en: `` }, // 11
    analytical_machine: { ja: "分析機器", en: `` }, // 12
    environmental_analysis_machine: { ja: "環境分析機器", en: `` }, // 13
    contracted_services: { ja: "受託サービス", en: `` }, // 14
  };
// export const analysisCategoryM = Array(14)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingAnalysisCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "距離測定器", en: `` },
//   2: { ja: "重量測定器", en: `` },
//   3: { ja: "電子計測器", en: `` },
//   4: { ja: "温湿度測定器", en: `` },
//   5: { ja: "電気計器・電位計", en: `` },
//   6: { ja: "3次元測定器", en: `` },
//   7: { ja: "その他計測器", en: `` },
//   8: { ja: "試験機器・装置", en: `` },
//   9: { ja: "検査機器・装置", en: `` },
//   10: { ja: "顕微鏡・マイクロスコープ", en: `` },
//   11: { ja: "記録計・ロガー", en: `` },
//   12: { ja: "分析機器", en: `` },
//   13: { ja: "環境分析機器", en: `` },
//   14: { ja: "受託サービス", en: `` },
// };
// export const analysisCategoryM = [
//   <option key="" value=""></option>,
//   <option key="距離測定器" value="距離測定器">
//     距離測定器
//   </option>,
//   <option key="重量測定器" value="重量測定器">
//     重量測定器
//   </option>,
//   <option key="電子計測器" value="電子計測器">
//     電子計測器
//   </option>,
//   <option key="温湿度測定器" value="温湿度測定器">
//     温湿度測定器
//   </option>,
//   <option key="電気計器・電位計" value="電気計器・電位計">
//     電気計器・電位計
//   </option>,
//   <option key="3次元測定器" value="3次元測定器">
//     3次元測定器
//   </option>,
//   <option key="その他計測器" value="その他計測器">
//     その他計測器
//   </option>,
//   <option key="試験機器・装置" value="試験機器・装置">
//     試験機器・装置
//   </option>,
//   <option key="検査機器・装置" value="検査機器・装置">
//     検査機器・装置
//   </option>,
//   <option key="顕微鏡・マイクロスコープ" value="顕微鏡・マイクロスコープ">
//     顕微鏡・マイクロスコープ
//   </option>,
//   <option key="記録計・ロガー" value="記録計・ロガー">
//     記録計・ロガー
//   </option>,
//   <option key="分析機器" value="分析機器">
//     分析機器
//   </option>,
//   <option key="環境分析機器" value="環境分析機器">
//     環境分析機器
//   </option>,
//   <option key="受託サービス" value="受託サービス">
//     受託サービス
//   </option>,
// ];

// 7. 「画像処理」 中分類 7. image_processing
export const imageProcessingCategoryMNameOnly: ProductCategoriesMediumImageProcessing[] = [
  "cameras",
  "lenses",
  "light_sources_lighting",
  "image_processing",
  "security_surveillance_systems",
  "barcode_readers",
];
export const imageProcessingCategoryM: { id: number; name: ProductCategoriesMediumImageProcessing }[] = [
  { id: 80, name: "cameras" }, // 565から567
  { id: 81, name: "lenses" }, // 568から568
  { id: 82, name: "light_sources_lighting" }, // 569から570
  { id: 83, name: "image_processing" }, // 571から580
  { id: 84, name: "security_surveillance_systems" }, // 581から583
  { id: 85, name: "barcode_readers" }, // 584から588
];
export const mappingImageProcessingCategoryM: {
  [K in ProductCategoriesMediumImageProcessing | string]: { [key: string]: string };
} = {
  cameras: { ja: "カメラ", en: `` }, // 1
  lenses: { ja: "レンズ", en: `` }, // 2
  light_sources_lighting: { ja: "光源・照明", en: `` }, // 3
  image_processing: { ja: "画像処理", en: `` }, // 4
  security_surveillance_systems: { ja: "セキュリティ・監視システム", en: `` }, // 5
  barcode_readers: { ja: "バーコードリーダー", en: `` }, // 6
};
// export const imageProcessingCategoryM = Array(6)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingImageProcessingCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "カメラ", en: `` },
//   2: { ja: "レンズ", en: `` },
//   3: { ja: "光源・照明", en: `` },
//   4: { ja: "画像処理", en: `` },
//   5: { ja: "セキュリティ・監視システム", en: `` },
//   6: { ja: "バーコードリーダー", en: `` },
// };
// export const imageProcessingCategoryM = [
//   <option key="" value=""></option>,
//   <option key="カメラ" value="カメラ">
//     カメラ
//   </option>,
//   <option key="レンズ" value="レンズ">
//     レンズ
//   </option>,
//   <option key="光源・照明" value="光源・照明">
//     光源・照明
//   </option>,
//   <option key="画像処理" value="画像処理">
//     画像処理
//   </option>,
//   <option key="セキュリティ・監視システム" value="セキュリティ・監視システム">
//     セキュリティ・監視システム
//   </option>,
//   <option key="バーコードリーダー" value="バーコードリーダー">
//     バーコードリーダー
//   </option>,
// ];

// 8. 「制御・電機機器」 中分類 8. control_electrical_equipment
export const controlEquipmentCategoryMNameOnly: ProductCategoriesMediumControlEquipment[] = [
  "process_control_equipment",
  "fa_equipment",
  "safety_equipment",
  "environmental_equipment",
  "filters",
  "clean_rooms",
  "lighting",
  "air_conditioning_equipment",
  "water_treatment_equipment",
  "static_electricity_measures",
  "energy_equipment",
];
export const controlEquipmentCategoryM: { id: number; name: ProductCategoriesMediumControlEquipment }[] = [
  { id: 86, name: "process_control_equipment" }, // 589から598
  { id: 87, name: "fa_equipment" }, // 599から620
  { id: 88, name: "safety_equipment" }, // 621から631
  { id: 89, name: "environmental_equipment" }, // 632から645
  { id: 90, name: "filters" }, // 646から650
  { id: 91, name: "clean_rooms" }, // 651から660
  { id: 92, name: "lighting" }, // 661から668
  { id: 93, name: "air_conditioning_equipment" }, // 669から673
  { id: 94, name: "water_treatment_equipment" }, // 674から680
  { id: 95, name: "static_electricity_measures" }, // 681から685
  { id: 96, name: "energy_equipment" }, // 686から693
];
export const mappingControlEquipmentCategoryM: {
  [K in ProductCategoriesMediumControlEquipment | string]: { [key: string]: string };
} = {
  process_control_equipment: { ja: "プロセス制御機器", en: `` }, // 1
  fa_equipment: { ja: "FA機器", en: `` }, // 2
  safety_equipment: { ja: "安全機器", en: `` }, // 3
  environmental_equipment: { ja: "環境機器", en: `` }, // 4
  filters: { ja: "フィルタ", en: `` }, // 5
  clean_rooms: { ja: "クリーンルーム", en: `` }, // 6
  lighting: { ja: "照明", en: `` }, // 7
  air_conditioning_equipment: { ja: "空調機器", en: `` }, // 8
  water_treatment_equipment: { ja: "水処理装置", en: `` }, // 9
  static_electricity_measures: { ja: "静電気対策", en: `` }, // 10
  energy_equipment: { ja: "エネルギー機器", en: `` }, // 11
};
// export const controlEquipmentCategoryM = Array(11)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingControlEquipmentCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "プロセス制御機器", en: `` },
//   2: { ja: "FA機器", en: `` },
//   3: { ja: "安全機器", en: `` },
//   4: { ja: "環境機器", en: `` },
//   5: { ja: "フィルタ", en: `` },
//   6: { ja: "クリーンルーム", en: `` },
//   7: { ja: "照明", en: `` },
//   8: { ja: "空調機器", en: `` },
//   9: { ja: "水処理装置", en: `` },
//   10: { ja: "静電気対策", en: `` },
//   11: { ja: "エネルギー機器", en: `` },
// };
// export const controlEquipmentCategoryM = [
//   <option key="" value=""></option>,
//   <option key="プロセス制御機器" value="プロセス制御機器">
//     プロセス制御機器
//   </option>,
//   <option key="FA機器" value="FA機器">
//     FA機器
//   </option>,
//   <option key="安全機器" value="安全機器">
//     安全機器
//   </option>,
//   <option key="環境機器" value="環境機器">
//     環境機器
//   </option>,
//   <option key="フィルタ" value="フィルタ">
//     フィルタ
//   </option>,
//   <option key="クリーンルーム" value="クリーンルーム">
//     クリーンルーム
//   </option>,
//   <option key="照明" value="照明">
//     照明
//   </option>,
//   <option key="空調機器" value="空調機器">
//     空調機器
//   </option>,
//   <option key="水処理装置" value="水処理装置">
//     水処理装置
//   </option>,
//   <option key="静電気対策" value="静電気対策">
//     静電気対策
//   </option>,
//   <option key="エネルギー機器" value="エネルギー機器">
//     エネルギー機器
//   </option>,
// ];

// 9. 「工具・消耗品・備品」 9. 中分類 tools_consumables_supplies
export const toolCategoryMNameOnly: ProductCategoriesMediumTool[] = [
  "cutting_tools",
  "abrasives",
  "hand_tools",
  "power_pneumatic_tools",
  "consumables",
  "cleaning_tools",
  "safety_hygiene_supplies",
  "packaging_materials",
  "supplies",
  "storage_facilities",
];
export const toolCategoryM: { id: number; name: ProductCategoriesMediumTool }[] = [
  { id: 97, name: "cutting_tools" }, // 694から706
  { id: 98, name: "abrasives" }, // 707から711
  { id: 99, name: "hand_tools" }, // 712から722
  { id: 100, name: "power_pneumatic_tools" }, // 723から724
  { id: 101, name: "consumables" }, // 725から734
  { id: 102, name: "cleaning_tools" }, // 735から741
  { id: 103, name: "safety_hygiene_supplies" }, // 742から748
  { id: 104, name: "packaging_materials" }, // 749から754
  { id: 105, name: "supplies" }, // 755から759
  { id: 106, name: "storage_facilities" }, // 760から761
];
export const mappingToolCategoryM: { [K in ProductCategoriesMediumTool | string]: { [key: string]: string } } = {
  cutting_tools: { ja: "切削工具", en: `` }, // 1
  abrasives: { ja: "研磨材", en: `` }, // 2
  hand_tools: { ja: "作業工具", en: `` }, // 3
  power_pneumatic_tools: { ja: "電動・空圧工具", en: `` }, // 4
  consumables: { ja: "消耗品", en: `` }, // 5
  cleaning_tools: { ja: "清掃用具", en: `` }, // 6
  safety_hygiene_supplies: { ja: "安全・衛生用品", en: `` }, // 7
  packaging_materials: { ja: "梱包材", en: `` }, // 8
  supplies: { ja: "備品", en: `` }, // 9
  storage_facilities: { ja: "保管設備", en: `` }, // 10
};
// export const toolCategoryM = Array(10)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingToolCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "切削工具", en: `` },
//   2: { ja: "研磨材", en: `` },
//   3: { ja: "作業工具", en: `` },
//   4: { ja: "電動・空圧工具", en: `` },
//   5: { ja: "消耗品", en: `` },
//   6: { ja: "清掃用具", en: `` },
//   7: { ja: "安全・衛生用品", en: `` },
//   8: { ja: "梱包材", en: `` },
//   9: { ja: "備品", en: `` },
//   10: { ja: "保管設備", en: `` },
// };
// export const toolCategoryM = [
//   <option key="" value=""></option>,
//   <option key="切削工具" value="切削工具">
//     切削工具
//   </option>,
//   <option key="研磨材" value="研磨材">
//     研磨材
//   </option>,
//   <option key="作業工具" value="作業工具">
//     作業工具
//   </option>,
//   <option key="電動・空圧工具" value="電動・空圧工具">
//     電動・空圧工具
//   </option>,
//   <option key="消耗品" value="消耗品">
//     消耗品
//   </option>,
//   <option key="清掃用具" value="清掃用具">
//     清掃用具
//   </option>,
//   <option key="安全・衛生用品" value="安全・衛生用品">
//     安全・衛生用品
//   </option>,
//   <option key="梱包材" value="梱包材">
//     梱包材
//   </option>,
//   <option key="備品" value="備品">
//     備品
//   </option>,
//   <option key="保管設備" value="保管設備">
//     保管設備
//   </option>,
// ];

// 10. 「設計・生産支援」 中分類 10. design_production_support
export const designCategoryMNameOnly: ProductCategoriesMediumDesign[] = [
  "cad",
  "cam",
  "cae",
  "prototype",
  "contracted_services",
];
export const designCategoryM: { id: number; name: ProductCategoriesMediumDesign }[] = [
  { id: 107, name: "cad" }, // 762から770
  { id: 108, name: "cam" }, // 771から773
  { id: 109, name: "cae" }, // 774から783
  { id: 110, name: "prototype" }, // 784から785
  { id: 111, name: "contracted_services" }, // 786から787
];
export const mappingDesignCategoryM: { [K in ProductCategoriesMediumDesign | string]: { [key: string]: string } } = {
  cad: { ja: "CAD", en: `` }, // 1
  cam: { ja: "CAM", en: `` }, // 2
  cae: { ja: "CAE", en: `` }, // 3
  prototype: { ja: "試作", en: `` }, // 4
  contracted_services: { ja: "受託サービス", en: `` }, // 5
};
// export const designCategoryM = Array(5)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingDesignCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "CAD", en: `` },
//   2: { ja: "CAM", en: `` },
//   3: { ja: "CAE", en: `` },
//   4: { ja: "試作", en: `` },
//   5: { ja: "受託サービス", en: `` },
// };
// export const designCategoryM = [
//   <option key="" value=""></option>,
//   <option key="CAD" value="CAD">
//     CAD
//   </option>,
//   <option key="CAM" value="CAM">
//     CAM
//   </option>,
//   <option key="CAE" value="CAE">
//     CAE
//   </option>,
//   <option key="試作" value="試作">
//     試作
//   </option>,
//   <option key="受託サービス" value="受託サービス">
//     受託サービス
//   </option>,
// ];

// 11. 「IT・ネットワーク」 中分類 11. it_network
export const ITCategoryMNameOnly: ProductCategoriesMediumIT[] = [
  "industrial_computers",
  "embedded_systems",
  "core_systems",
  "production_management",
  "information_systems",
  "network",
  "operating_systems",
  "servers",
  "security",
];
export const ITCategoryM: { id: number; name: ProductCategoriesMediumIT }[] = [
  { id: 112, name: "industrial_computers" }, // 788から794
  { id: 113, name: "embedded_systems" }, // 795から802
  { id: 114, name: "core_systems" }, // 803から811
  { id: 115, name: "production_management" }, // 812から818
  { id: 116, name: "information_systems" }, // 819から829
  { id: 117, name: "network" }, // 830から835
  { id: 118, name: "operating_systems" }, // 836から838
  { id: 119, name: "servers" }, // 839から844
  { id: 120, name: "security" }, // 845から852
];
export const mappingITCategoryM: { [K in ProductCategoriesMediumIT | string]: { [key: string]: string } } = {
  industrial_computers: { ja: "産業用パソコン", en: `` }, // 1
  embedded_systems: { ja: "組込みシステム", en: `` }, // 2
  core_systems: { ja: "基幹システム", en: `` }, // 3
  production_management: { ja: "SCM・生産管理", en: `` }, // 4
  information_systems: { ja: "情報システム", en: `` }, // 5
  network: { ja: "ネットワーク", en: `` }, // 6
  operating_systems: { ja: "運用システム", en: `` }, // 7
  servers: { ja: "サーバ", en: `` }, // 8
  security: { ja: "セキュリティ", en: `` }, // 9
};
// export const ITCategoryM = Array(9)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingITCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "産業用パソコン", en: `` },
//   2: { ja: "組込みシステム", en: `` },
//   3: { ja: "基幹システム", en: `` },
//   4: { ja: "SCM・生産管理", en: `` },
//   5: { ja: "情報システム", en: `` },
//   6: { ja: "ネットワーク", en: `` },
//   7: { ja: "運用システム", en: `` },
//   8: { ja: "サーバ", en: `` },
//   9: { ja: "セキュリティ", en: `` },
// };
// export const ITCategoryM = [
//   <option key="" value=""></option>,
//   <option key="産業用パソコン" value="産業用パソコン">
//     産業用パソコン
//   </option>,
//   <option key="組込みシステム" value="組込みシステム">
//     組込みシステム
//   </option>,
//   <option key="基幹システム" value="基幹システム">
//     基幹システム
//   </option>,
//   <option key="SCM・生産管理" value="SCM・生産管理">
//     SCM・生産管理
//   </option>,
//   <option key="情報システム" value="情報システム">
//     情報システム
//   </option>,
//   <option key="ネットワーク" value="ネットワーク">
//     ネットワーク
//   </option>,
//   <option key="運用システム" value="運用システム">
//     運用システム
//   </option>,
//   <option key="サーバ" value="サーバ">
//     サーバ
//   </option>,
//   <option key="セキュリティ" value="セキュリティ">
//     セキュリティ
//   </option>,
// ];

// 12. 「オフィス」 中分類 12. office
export const OfficeCategoryMNameOnly: ProductCategoriesMediumOffice[] = [
  "office_automation_equipment",
  "consumables",
  "supplies",
];
export const OfficeCategoryM: { id: number; name: ProductCategoriesMediumOffice }[] = [
  { id: 121, name: "office_automation_equipment" }, // 853から862
  { id: 122, name: "consumables" }, // 863から864
  { id: 123, name: "supplies" }, // 865から872
];
export const mappingOfficeCategoryM: { [K in ProductCategoriesMediumOffice | string]: { [key: string]: string } } = {
  office_automation_equipment: { ja: "PC・OA機器", en: `` }, // 1
  consumables: { ja: "消耗品", en: `` }, // 2
  supplies: { ja: "備品", en: `` }, // 3
};
// export const OfficeCategoryM = Array(3)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingOfficeCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "PC・OA機器", en: `` },
//   2: { ja: "消耗品", en: `` },
//   3: { ja: "備品", en: `` },
// };
// export const OfficeCategoryM = [
//   <option key="" value=""></option>,
//   <option key="PC・OA機器" value="PC・OA機器">
//     PC・OA機器
//   </option>,
//   <option key="消耗品" value="消耗品">
//     消耗品
//   </option>,
//   <option key="備品" value="備品">
//     備品
//   </option>,
// ];

// 13. 「業務支援サービス」 中分類 13. business_support_services
export const businessSupportCategoryMNameOnly: ProductCategoriesMediumBusinessSupport[] = [
  "consultants",
  "rental_lease",
  "human_resources_services",
  "services",
];
export const businessSupportCategoryM: { id: number; name: ProductCategoriesMediumBusinessSupport }[] = [
  { id: 124, name: "consultants" }, // 873から879
  { id: 125, name: "rental_lease" }, // 880から880
  { id: 126, name: "human_resources_services" }, // 881から882
  { id: 127, name: "services" }, // 883から891
];
export const mappingBusinessSupportCategoryM: {
  [K in ProductCategoriesMediumBusinessSupport | string]: { [key: string]: string };
} = {
  consultants: { ja: "コンサルタント", en: `` }, // 1
  rental_lease: { ja: "レンタル・リース", en: `` }, // 2
  human_resources_services: { ja: "人材サービス", en: `` }, // 3
  services: { ja: "サービス", en: `` }, // 4
};
// export const businessSupportCategoryM = Array(4)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingBusinessSupportCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "コンサルタント", en: `` },
//   2: { ja: "レンタル・リース", en: `` },
//   3: { ja: "人材サービス", en: `` },
//   4: { ja: "サービス", en: `` },
// };
// export const businessSupportCategoryM = [
//   <option key="" value=""></option>,
//   <option key="コンサルタント" value="コンサルタント">
//     コンサルタント
//   </option>,
//   <option key="レンタル・リース" value="レンタル・リース">
//     レンタル・リース
//   </option>,
//   <option key="人材サービス" value="人材サービス">
//     人材サービス
//   </option>,
//   <option key="サービス" value="サービス">
//     サービス
//   </option>,
// ];

// 14. 「セミナー・スキルアップ」 14. 中分類 seminars_skill_up
export const skillUpCategoryMNameOnly: ProductCategoriesMediumSkillUp[] = ["for_engineer", "for_management"];
export const skillUpCategoryM: { id: number; name: ProductCategoriesMediumSkillUp }[] = [
  { id: 128, name: "for_engineer" }, // 892から895
  { id: 129, name: "for_management" }, // 896から904
];
export const mappingSkillUpCategoryM: { [K in ProductCategoriesMediumSkillUp | string]: { [key: string]: string } } = {
  for_engineer: { ja: "技術者向け", en: `` }, // 1
  for_management: { ja: "管理・経営向け", en: `` }, // 2
};
// export const skillUpCategoryM = Array(2)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingSkillUpCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "技術者向け", en: `` },
//   2: { ja: "管理・経営向け", en: `` },
// };
// export const skillUpCategoryM = [
//   <option key="" value=""></option>,
//   <option key="技術者向け" value="技術者向け">
//     技術者向け
//   </option>,
//   <option key="管理・経営向け" value="管理・経営向け">
//     管理・経営向け
//   </option>,
// ];

// 15. 「その他」 15. 中分類 others
export const othersCategoryMNameOnly: "others"[] = ["others"];
export const othersCategoryM: { id: number; name: "others" }[] = [{ id: 130, name: "others" }];
export const mappingOthersCategoryM: { [key: "others" | string]: { [key: string]: string } } = {
  others: { ja: "その他", en: `` }, // 1 // 905から906
};
// export const othersCategoryM = Array(1)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingOthersCategoryM: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "その他", en: `` },
// };
// export const othersCategoryM = [
//   <option key="" value=""></option>,
//   <option key="その他" value="その他">
//     その他
//   </option>,
// ];

/**
 * { id: 1, name: "electronic_components_modules" },
  { id: 2, name: "mechanical_parts" },
  { id: 3, name: "manufacturing_processing_machines" },
  { id: 4, name: "scientific_chemical_equipment" },
  { id: 5, name: "materials" },
  { id: 6, name: "measurement_analysis" },
  { id: 7, name: "image_processing" },
  { id: 8, name: "control_electrical_equipment" },
  { id: 9, name: "tools_consumables_supplies" },
  { id: 10, name: "design_production_support" },
  { id: 11, name: "it_network" },
  { id: 12, name: "office" },
  { id: 13, name: "business_support_services" },
  { id: 14, name: "seminars_skill_up" },
  { id: 15, name: "others" },
 */
// 大分類に紐づくそれぞれのオプションMap
export const productCategoryLargeToOptionsMediumMap: {
  [K in ProductCategoriesLarge]:
    | ProductCategoriesMediumModule[]
    | ProductCategoriesMediumMachine[]
    | ProductCategoriesMediumProcessingMachinery[]
    | ProductCategoriesMediumScience[]
    | ProductCategoriesMediumMaterial[]
    | ProductCategoriesMediumAnalysis[]
    | ProductCategoriesMediumImageProcessing[]
    | ProductCategoriesMediumControlEquipment[]
    | ProductCategoriesMediumTool[]
    | ProductCategoriesMediumDesign[]
    | ProductCategoriesMediumIT[]
    | ProductCategoriesMediumOffice[]
    // | ProductCategoriesMediumTool[]
    | ProductCategoriesMediumBusinessSupport[]
    | ProductCategoriesMediumSkillUp[]
    | "others"[];
} = {
  electronic_components_modules: moduleCategoryMNameOnly,
  mechanical_parts: machinePartsCategoryMNameOnly,
  manufacturing_processing_machines: processingMachineryCategoryMNameOnly,
  scientific_chemical_equipment: scienceCategoryMNameOnly,
  materials: materialCategoryMNameOnly,
  measurement_analysis: analysisCategoryMNameOnly,
  image_processing: imageProcessingCategoryMNameOnly,
  control_electrical_equipment: controlEquipmentCategoryMNameOnly,
  tools_consumables_supplies: toolCategoryMNameOnly,
  design_production_support: designCategoryMNameOnly,
  it_network: ITCategoryMNameOnly,
  office: OfficeCategoryMNameOnly,
  business_support_services: businessSupportCategoryMNameOnly,
  seminars_skill_up: skillUpCategoryMNameOnly,
  others: othersCategoryMNameOnly,
};

const productCategoriesM = {
  moduleCategoryM,
  machinePartsCategoryM,
  processingMachineryCategoryM,
  scienceCategoryM,
  materialCategoryM,
  analysisCategoryM,
  imageProcessingCategoryM,
  controlEquipmentCategoryM,
  toolCategoryM,
  designCategoryM,
  ITCategoryM,
  OfficeCategoryM,
  businessSupportCategoryM,
  skillUpCategoryM,
  othersCategoryM,
};

export default productCategoriesM;
