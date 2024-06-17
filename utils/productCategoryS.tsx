// 電子部品 小分類

import {
  AnalysisProductCategoriesS_distance_measuring_machine,
  AnalysisProductCategoriesS_electronic_measuring_machine,
  AnalysisProductCategoriesS_weight_measuring_machine,
  MachineProductCategoriesS_automotive_parts,
  MachineProductCategoriesS_bearings,
  MachineProductCategoriesS_jigs,
  MachineProductCategoriesS_mechanical_elements,
  MachineProductCategoriesS_molds,
  MachineProductCategoriesS_motors,
  MachineProductCategoriesS_piping_components,
  MachineProductCategoriesS_pumps,
  MachineProductCategoriesS_screws,
  MachineProductCategoriesS_vacuum_equipment,
  MachineProductCategoriesS_water_oil_hydraulic_pneumatic_equipment,
  MaterialProductCategoriesS_ceramics,
  MaterialProductCategoriesS_chemicals,
  MaterialProductCategoriesS_glass,
  MaterialProductCategoriesS_metal_materials,
  MaterialProductCategoriesS_organic_natural_materials,
  MaterialProductCategoriesS_paper_pulps,
  MaterialProductCategoriesS_polymer_materials,
  MaterialProductCategoriesS_wood,
  ModuleProductCategoriesSBatteries,
  ModuleProductCategoriesSConnectors,
  ModuleProductCategoriesSElectronicComponents,
  ModuleProductCategoriesSFpdTouchPanel,
  ModuleProductCategoriesSLed,
  ModuleProductCategoriesSPowerSources,
  ModuleProductCategoriesSSemiconductorsIc,
  ModuleProductCategoriesSSmallMotors,
  ModuleProductCategoriesSTerminalBlocks,
  ModuleProductCategoriesS_cables,
  ModuleProductCategoriesS_contracted_services,
  ModuleProductCategoriesS_optical_components,
  ModuleProductCategoriesS_rfid_ic_tag,
  ProcessingMachineryProductCategoriesS_assembly_machines,
  ProcessingMachineryProductCategoriesS_chemical_equipment,
  ProcessingMachineryProductCategoriesS_cleaning_machines,
  ProcessingMachineryProductCategoriesS_contracted_services,
  ProcessingMachineryProductCategoriesS_conveying_machines,
  ProcessingMachineryProductCategoriesS_food_machines,
  ProcessingMachineryProductCategoriesS_heating_equipment_furnaces,
  ProcessingMachineryProductCategoriesS_industrial_robots,
  ProcessingMachineryProductCategoriesS_laboratory_equipment_supplies,
  ProcessingMachineryProductCategoriesS_machine_tools,
  ProcessingMachineryProductCategoriesS_marking,
  ProcessingMachineryProductCategoriesS_mounting_machines,
  ProcessingMachineryProductCategoriesS_packaging_machines,
  ProcessingMachineryProductCategoriesS_painting_machines,
  ProcessingMachineryProductCategoriesS_powder_equipment,
  ProcessingMachineryProductCategoriesS_processing_machines,
  ProcessingMachineryProductCategoriesS_semiconductor_manufacturing_equipment,
  ProcessingMachineryProductCategoriesS_surface_treatment_equipment,
} from "@/types";

/**
 * export const moduleCategoryM: { id: number; name: ProductCategoriesMediumModule }[] = [
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
 */

// ========================= ✅「電子部品・モジュール」 大分類の小分類関連✅ =========================
// ------------------------- 🌠16. 「電子部品」 小分類 electronic_components -------------------------
// 最後が 130. others(中分類)

export const categoryS_electronicComponents_NameOnly: ModuleProductCategoriesSElectronicComponents[] = [
  "electron_tubes",
  "resistors",
  "capacitors",
  "transformers",
  "inductors_coils",
  "filters",
  "oscillators",
  "amplifiers",
  "power_sources",
  "ac_adapters",
  "rf_microwave_components",
  "antennas",
  "piezoelectric_devices",
  "lamps_emitters",
  "transducers",
  "isolators",
  "converters",
  "inverters",
  "relays",
  "sound_components",
  "fans",
  "solenoids_actuators",
  "fuses",
  "peltier_device",
  "couplers",
  "encoders",
  "emc_solutions",
  "printed_circuit_boards",
  "ultrasonic_generators",
  "switches",
  "sensors",
  "other_electronic_components",
];
export const categoryS_electronicComponents: { id: number; name: ModuleProductCategoriesSElectronicComponents }[] = [
  { id: 131, name: "electron_tubes" },
  { id: 132, name: "resistors" },
  { id: 133, name: "capacitors" },
  { id: 134, name: "transformers" },
  { id: 135, name: "inductors_coils" },
  { id: 136, name: "filters" },
  { id: 137, name: "oscillators" },
  { id: 138, name: "amplifiers" },
  { id: 139, name: "power_sources" },
  { id: 140, name: "ac_adapters" },
  { id: 141, name: "rf_microwave_components" },
  { id: 142, name: "antennas" },
  { id: 143, name: "piezoelectric_devices" },
  { id: 144, name: "lamps_emitters" },
  { id: 145, name: "transducers" },
  { id: 146, name: "isolators" },
  { id: 147, name: "converters" },
  { id: 148, name: "inverters" },
  { id: 149, name: "relays" },
  { id: 150, name: "sound_components" },
  { id: 151, name: "fans" },
  { id: 152, name: "solenoids_actuators" },
  { id: 153, name: "fuses" },
  { id: 154, name: "peltier_device" },
  { id: 155, name: "couplers" },
  { id: 156, name: "encoders" },
  { id: 157, name: "emc_solutions" },
  { id: 158, name: "printed_circuit_boards" },
  { id: 159, name: "ultrasonic_generators" },
  { id: 160, name: "switches" },
  { id: 161, name: "sensors" },
  { id: 162, name: "other_electronic_components" },
];
export const mappingCategoryS_ElectronicComponents: {
  [K in ModuleProductCategoriesSElectronicComponents | string]: { [key: string]: string };
} = {
  electron_tubes: { ja: "電子管", en: `` },
  resistors: { ja: "抵抗器", en: `` },
  capacitors: { ja: "コンデンサ", en: `` },
  transformers: { ja: "トランス", en: `` },
  inductors_coils: { ja: "インダクタ・コイル", en: `` },
  filters: { ja: "フィルタ", en: `` },
  oscillators: { ja: "発振子", en: `` },
  amplifiers: { ja: "アンプ", en: `` },
  power_sources: { ja: "電源", en: `` },
  ac_adapters: { ja: "ACアダプター", en: `` },
  rf_microwave_components: { ja: "高周波・マイクロ波部品", en: `` },
  antennas: { ja: "アンテナ", en: `` },
  piezoelectric_devices: { ja: "圧電デバイス", en: `` },
  lamps_emitters: { ja: "ランプ・発光素子", en: `` },
  transducers: { ja: "変換機・トランスデューサ", en: `` },
  isolators: { ja: "アイソレーター", en: `` },
  converters: { ja: "コンバーター", en: `` },
  inverters: { ja: "インバーター", en: `` },
  relays: { ja: "リレー", en: `` },
  sound_components: { ja: "発音部品", en: `` },
  fans: { ja: "ファン", en: `` },
  solenoids_actuators: { ja: "ソレノイド・アクチュエータ", en: `` },
  fuses: { ja: "ヒューズ", en: `` },
  peltier_device: { ja: "ペルチェ素子", en: `` },
  couplers: { ja: "カプラ", en: `` },
  encoders: { ja: "エンコーダー", en: `` },
  emc_solutions: { ja: "EMC対策製品", en: `` },
  printed_circuit_boards: { ja: "プリント基板", en: `` },
  ultrasonic_generators: { ja: "超音波発振器", en: `` },
  switches: { ja: "スイッチ", en: `` },
  sensors: { ja: "センサ", en: `` },
  other_electronic_components: { ja: "その他電子部品", en: `` },
};
// -------------------------------------------------------------------------------------

// { id: 17, name: "connectors" },
// ------------------------- 🌠17. 「コネクタ」 小分類 connectors -------------------------
// 163から

/**
 * 【コネクタ】Connectors
同軸コネクタ → coaxial_connectors
丸型コネクタ → circular_connectors
角型コネクタ → rectangular_connectors
基板間コネクタ → board_to_board_connectors
基板ケーブル間コネクタ → board_to_cable_connectors
基板FPC間コネクタ → board_to_fpc_connectors
光コネクタ → optical_connectors
自動車用コネクタ → automotive_connectors
その他コネクタ → other_connectors
 */

export const categoryS_connectors_NameOnly: ModuleProductCategoriesSConnectors[] = [
  "coaxial_connectors",
  "circular_connectors",
  "rectangular_connectors",
  "board_to_board_connectors",
  "board_to_cable_connectors",
  "board_to_fpc_connectors",
  "optical_connectors",
  "automotive_connectors",
  "other_connectors",
];
export const categoryS_connectors: { id: number; name: ModuleProductCategoriesSConnectors }[] = [
  { id: 163, name: "coaxial_connectors" },
  { id: 164, name: "circular_connectors" },
  { id: 165, name: "rectangular_connectors" },
  { id: 166, name: "board_to_board_connectors" },
  { id: 167, name: "board_to_cable_connectors" },
  { id: 168, name: "board_to_fpc_connectors" },
  { id: 169, name: "optical_connectors" },
  { id: 170, name: "automotive_connectors" },
  { id: 171, name: "other_connectors" },
];
export const mappingCategoryS_Connectors: {
  [K in ModuleProductCategoriesSConnectors | string]: { [key: string]: string };
} = {
  coaxial_connectors: { ja: "同軸コネクタ", en: `` },
  circular_connectors: { ja: "丸型コネクタ", en: `` },
  rectangular_connectors: { ja: "角型コネクタ", en: `` },
  board_to_board_connectors: { ja: "基板間コネクタ", en: `` },
  board_to_cable_connectors: { ja: "基板ケーブル間コネクタ", en: `` },
  board_to_fpc_connectors: { ja: "基板FPC間コネクタ", en: `` },
  optical_connectors: { ja: "光コネクタ", en: `` },
  automotive_connectors: { ja: "自動車用コネクタ", en: `` },
  other_connectors: { ja: "その他コネクタ", en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 18, name: "terminal_blocks" },
// ------------------------- 🌠18. 「端子台」 小分類 terminal_blocks -------------------------
// 172から

/**
 * 【端子台】Terminal Blocks
    圧着端子 → crimp_terminals
    ソケット → sockets
    防水コネクタ → waterproof_connectors
    プリント基板用端子台 → pcb_terminal_blocks
    コネクタ端子台 → connector_terminal_blocks
    その他端子台 → other_terminal_blocks

 */

export const categoryS_terminalBlocks_NameOnly: ModuleProductCategoriesSTerminalBlocks[] = [
  "crimp_terminals",
  "sockets",
  "waterproof_connectors",
  "pcb_terminal_blocks",
  "connector_terminal_blocks",
  "other_terminal_blocks",
];
export const categoryS_terminalBlocks: { id: number; name: ModuleProductCategoriesSTerminalBlocks }[] = [
  { id: 172, name: "crimp_terminals" },
  { id: 173, name: "sockets" },
  { id: 174, name: "waterproof_connectors" },
  { id: 175, name: "pcb_terminal_blocks" },
  { id: 176, name: "connector_terminal_blocks" },
  { id: 177, name: "other_terminal_blocks" },
];
export const mappingCategoryS_TerminalBlocks: {
  [K in ModuleProductCategoriesSTerminalBlocks | string]: { [key: string]: string };
} = {
  crimp_terminals: { ja: "圧着端子", en: `` },
  sockets: { ja: "ソケット", en: `` },
  waterproof_connectors: { ja: "防水コネクタ", en: `` },
  pcb_terminal_blocks: { ja: "プリント基板用端子台", en: `` },
  connector_terminal_blocks: { ja: "コネクタ端子台", en: `` },
  other_terminal_blocks: { ja: "その他端子台", en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 19, name: "led" },
// ------------------------- 🌠18. 「LED」 小分類 led -------------------------
// 178から

/**
 * 【LED】LEDs
    砲弾型LED → bullet_type_leds ✅bullet_leds
    チップ型LED → chip_type_leds　✅chip_leds
    LEDモジュール → led_modules
 */

export const categoryS_led_NameOnly: ModuleProductCategoriesSLed[] = [
  "bullet_type_led",
  "chip_type_led",
  "led_modules",
];
export const categoryS_led: { id: number; name: ModuleProductCategoriesSLed }[] = [
  { id: 178, name: "bullet_type_led" },
  { id: 179, name: "chip_type_led" },
  { id: 180, name: "led_modules" },
];
export const mappingCategoryS_Led: {
  [K in ModuleProductCategoriesSLed | string]: { [key: string]: string };
} = {
  bullet_type_led: { ja: "砲弾型LED", en: `` },
  chip_type_led: { ja: "チップ型LED", en: `` },
  led_modules: { ja: "LEDモジュール", en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 20, name: "fpd_touch_panel" },
// ------------------------- 🌠19. 「FPD・タッチパネル」 小分類 fpd_touch_panel -------------------------
// 181から

/**
 * 【FPD・タッチパネル】FPD & Touch Panels
    有機EL → organic_leds ✅oled
    液晶ディスプレイ → lcd_displays ✅lcd
    タッチパネル → touch_panels
    その他FPD関連 → other_fpd_related
 */

export const categoryS_fpdTouchPanel_NameOnly: ModuleProductCategoriesSFpdTouchPanel[] = [
  "organic_led",
  "lcd_displays",
  "touch_panels",
  "other_fpd_related",
];
export const categoryS_fpdTouchPanel: { id: number; name: ModuleProductCategoriesSFpdTouchPanel }[] = [
  { id: 181, name: "organic_led" },
  { id: 182, name: "lcd_displays" },
  { id: 183, name: "touch_panels" },
  { id: 184, name: "other_fpd_related" },
];
export const mappingCategoryS_FpdTouchPanel: {
  [K in ModuleProductCategoriesSFpdTouchPanel | string]: { [key: string]: string };
} = {
  organic_led: { ja: "有機EL", en: `` },
  lcd_displays: { ja: "液晶ディスプレイ", en: `` },
  touch_panels: { ja: "タッチパネル", en: `` },
  other_fpd_related: { ja: "その他FPD関連", en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 21, name: "small_motors" },
// ------------------------- 🌠21. 「小型モータ」 小分類 small_motors -------------------------
// 185から

/**
 * 【小型モータ】Small Motors
    DCモータ → dc_motors
    振動モータ → vibration_motors
    ブラシレスDCモータ → brushless_dc_motors
    ステッピングモータ → stepping_motors ✅stepper_motors
    ファンモータ → fan_motors
    ACモータ → ac_motors
 */

export const categoryS_smallMotors_NameOnly: ModuleProductCategoriesSSmallMotors[] = [
  "dc_motors",
  "vibration_motors",
  "brushless_dc_motors",
  "stepping_motors",
  "fan_motors",
  "ac_motors",
];
export const categoryS_smallMotors: { id: number; name: ModuleProductCategoriesSSmallMotors }[] = [
  { id: 185, name: "dc_motors" },
  { id: 186, name: "vibration_motors" },
  { id: 187, name: "brushless_dc_motors" },
  { id: 188, name: "stepping_motors" },
  { id: 189, name: "fan_motors" },
  { id: 190, name: "ac_motors" },
];
export const mappingCategoryS_SmallMotors: {
  [K in ModuleProductCategoriesSSmallMotors | string]: { [key: string]: string };
} = {
  dc_motors: { ja: "DCモータ", en: `` },
  vibration_motors: { ja: "振動モータ", en: `` },
  brushless_dc_motors: { ja: "ブラシレスDCモータ", en: `` },
  stepping_motors: { ja: "ステッピングモータ", en: `` },
  fan_motors: { ja: "ファンモータ", en: `` },
  ac_motors: { ja: "ACモータ", en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 22, name: "power_supplies" },
// ------------------------- 🌠22. 「電源」 小分類 power_supplies -------------------------
// 191から

/**
 * 【電源】Power Sources
    その他電源 → other_power_sources ✅other_power_supplies
    スイッチング電源 → switching_power_supplies
 */

export const categoryS_powerSources_NameOnly: ModuleProductCategoriesSPowerSources[] = [
  "other_power_sources",
  "switching_power_sources",
];
export const categoryS_powerSources: { id: number; name: ModuleProductCategoriesSPowerSources }[] = [
  { id: 191, name: "other_power_sources" },
  { id: 192, name: "switching_power_sources" },
];
export const mappingCategoryS_PowerSources: {
  [K in ModuleProductCategoriesSPowerSources | string]: { [key: string]: string };
} = {
  other_power_sources: { ja: "その他電源", en: `` },
  switching_power_sources: { ja: "スイッチング電源", en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 23, name: "batteries" },
// ------------------------- 🌠23. 「電池・バッテリー」 小分類 batteries -------------------------
// 193から

/**
 * 【電池・バッテリー】Batteries
    2次電池・バッテリー → secondary_batteries
    水素電池 → hydrogen_cells ✅hydrogen_batteries
    リチウムイオン電池 → lithium_ion_batteries
    充電器 → chargers
 */

export const categoryS_batteries_NameOnly: ModuleProductCategoriesSBatteries[] = [
  "secondary_batteries",
  "hydrogen_batteries",
  "lithium_ion_batteries",
  "chargers",
];
export const categoryS_batteries: { id: number; name: ModuleProductCategoriesSBatteries }[] = [
  { id: 193, name: "secondary_batteries" },
  { id: 194, name: "hydrogen_batteries" },
  { id: 195, name: "lithium_ion_batteries" },
  { id: 196, name: "chargers" },
];
export const mappingCategoryS_Batteries: {
  [K in ModuleProductCategoriesSBatteries | string]: { [key: string]: string };
} = {
  secondary_batteries: { ja: "2次電池", en: `` },
  hydrogen_batteries: { ja: "水素電池", en: `` },
  lithium_ion_batteries: { ja: "リチウムイオン電池", en: `` },
  chargers: { ja: "充電器", en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 24, name: "semiconductors_ic" },
// ------------------------- 🌠24. 「半導体・IC」 小分類 semiconductors_ic -------------------------
// 197から

/**
 * 【半導体・IC】Semiconductors & ICs
    ウエハー → wafers
    ダイオード → diodes
    トランジスタ → transistors
    メモリ → memory
    マイクロコンピュータ → microcomputers
    ASIC → asic
    専用IC → custom_ics
    その他半導体 → other_semiconductors
 */

export const CategoryS_semiconductorsIc_NameOnly: ModuleProductCategoriesSSemiconductorsIc[] = [
  "wafers",
  "diodes",
  "transistors",
  "memory",
  "microcomputers",
  "asic",
  "custom_ics",
  "other_semiconductors",
];
export const categoryS_semiconductorsIc: { id: number; name: ModuleProductCategoriesSSemiconductorsIc }[] = [
  { id: 197, name: "wafers" },
  { id: 198, name: "diodes" },
  { id: 199, name: "transistors" },
  { id: 200, name: "memory" },
  { id: 201, name: "microcomputers" },
  { id: 202, name: "asic" },
  { id: 203, name: "custom_ics" },
  { id: 204, name: "other_semiconductors" },
];
export const mappingCategoryS_SemiconductorsIc: {
  [K in ModuleProductCategoriesSSemiconductorsIc | string]: { [key: string]: string };
} = {
  wafers: { ja: "ウエハー", en: `` },
  diodes: { ja: "ダイオード", en: `` },
  transistors: { ja: "トランジスタ", en: `` },
  memory: { ja: "メモリ", en: `` },
  microcomputers: { ja: "マイクロコンピュータ", en: `` },
  asic: { ja: "ASIC", en: `` },
  custom_ics: { ja: "専用IC", en: `` },
  other_semiconductors: { ja: "ASその他半導体IC", en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 25, name: "rfid_ic_tag" },
// ------------------------- 🌠25. 「RFIC・ICタグ」 小分類 rfid_ic_tag -------------------------
// 205から

/**
 * 【RFID・ICタグ】RFID & IC Tags
    ICタグ → ic_tags
 */

export const categoryS_rfid_ic_tag_NameOnly: ModuleProductCategoriesS_rfid_ic_tag[] = ["ic_tags"];
export const categoryS_rfid_ic_tag: { id: number; name: ModuleProductCategoriesS_rfid_ic_tag }[] = [
  { id: 205, name: "ic_tags" },
];
export const mappingCategoryS_rfid_ic_tag: {
  [K in ModuleProductCategoriesS_rfid_ic_tag | string]: { [key: string]: string };
} = {
  ic_tags: { ja: "ICタグ", en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 26, name: "optical_components" },
// ------------------------- 🌠26. 「光学部品」 小分類 optical_components -------------------------
// 206から

/**
 * 【光学部品】Optical Components
    レンズ → lenses
    プリズム → prisms
    ミラー → mirrors
    光学実験部品 → optical_lab_components
    レーザ部品 → laser_components
    その他光学部品 → other_optical_components
 */

export const categoryS_optical_components_NameOnly: ModuleProductCategoriesS_optical_components[] = [
  "lenses",
  "prisms",
  "mirrors",
  "optical_lab_components",
  "laser_components",
  "other_optical_components",
];
export const categoryS_optical_components: { id: number; name: ModuleProductCategoriesS_optical_components }[] = [
  { id: 206, name: "lenses" },
  { id: 207, name: "prisms" },
  { id: 208, name: "mirrors" },
  { id: 209, name: "optical_lab_components" },
  { id: 210, name: "laser_components" },
  { id: 211, name: "other_optical_components" },
];
export const mappingCategoryS_optical_components: {
  [K in ModuleProductCategoriesS_optical_components | string]: { [key: string]: string };
} = {
  lenses: { ja: "レンズ", en: `` },
  prisms: { ja: "プリズム", en: `` },
  mirrors: { ja: "ミラー", en: `` },
  optical_lab_components: { ja: "光学実験部品", en: `` },
  laser_components: { ja: "レーザ部品", en: `` },
  other_optical_components: { ja: "その他光学部品", en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 27, name: "cables" },
// ------------------------- 🌠27. 「ケーブル」 小分類 cables -------------------------
// 212から

/**
 * 【ケーブル】Cables
    ケーブル → cables
    ハーネス → harnesses
    LAN・光ケーブル → lan_optical_cables
    フェライトコア → ferrite_cores
    配線部材 → wiring_components ✅wiring_materials
    その他ケーブル関連製品 → other_cable_related_products
 */

export const categoryS_cables_NameOnly: ModuleProductCategoriesS_cables[] = [
  "cables",
  "harnesses",
  "lan_optical_cables",
  "ferrite_cores",
  "wiring_materials",
  "other_cable_related_products",
];
export const categoryS_cables: { id: number; name: ModuleProductCategoriesS_cables }[] = [
  { id: 212, name: "cables" },
  { id: 213, name: "harnesses" },
  { id: 214, name: "lan_optical_cables" },
  { id: 215, name: "ferrite_cores" },
  { id: 216, name: "wiring_materials" },
  { id: 217, name: "other_cable_related_products" },
];
export const mappingCategoryS_cables: {
  [K in ModuleProductCategoriesS_cables | string]: { [key: string]: string };
} = {
  cables: { ja: "ケーブル", en: `` },
  harnesses: { ja: "ハーネス", en: `` },
  lan_optical_cables: { ja: "LAN・光ケーブル", en: `` },
  ferrite_cores: { ja: "フェライトコア", en: `` },
  wiring_materials: { ja: "配線部材", en: `` },
  other_cable_related_products: { ja: "その他ケーブル関連製品", en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 28, name: "contracted_services" },
// ------------------------- 🌠28. 受託サービス 小分類 contracted_services -------------------------
// 218から

/**
 * 【受託サービス】Contracted Services
    基板設計・製造 → pcb_design_manufacturing
    EMS → electronic_manufacturing_services ✅ems
 */

export const categoryS_contracted_services_NameOnly: ModuleProductCategoriesS_contracted_services[] = [
  "pcb_design_manufacturing",
  "electronic_manufacturing_services",
];
export const categoryS_contracted_services: { id: number; name: ModuleProductCategoriesS_contracted_services }[] = [
  { id: 218, name: "pcb_design_manufacturing" },
  { id: 219, name: "electronic_manufacturing_services" },
];
export const mappingCategoryS_contracted_services: {
  [K in ModuleProductCategoriesS_contracted_services | string]: { [key: string]: string };
} = {
  pcb_design_manufacturing: { ja: "基板設計・製造", en: `` },
  electronic_manufacturing_services: { ja: "EMS", en: `` },
};

// -------------------------------------------------------------------------------------
// ========================= ✅「電子部品・モジュール」 大分類の小分類関連✅ ここまで =========================

// ========================= ✅「機械部品」 大分類 mechanical_parts の小分類関連✅ =========================
/**
 * export const machinePartsCategoryM: { id: number; name: ProductCategoriesMediumMachine }[] = [
  { id: 29, name: "mechanical_elements" },
  { id: 30, name: "bearings" },
  { id: 31, name: "screws" },
  { id: 32, name: "motors" },
  { id: 33, name: "pumps" },
  { id: 34, name: "piping_components" },
  { id: 35, name: "water_oil_hydraulic_pneumatic_equipment" },
  { id: 36, name: "vacuum_equipment" },
  { id: 37, name: "molds" },
  { id: 38, name: "jigs" },
  { id: 39, name: "automotive_parts" },
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
 */

// { id: 29, name: "contracted_services" },
// ------------------------- 🌠29. 機械要素 小分類 mechanical_elements -------------------------
// 220から

/**
 * 【機械要素】Mechanical Elements
    歯車 → gears
    ファスナー → fasteners
    ばね → springs
    軸 → shafts
    チェーン・スプロケット → chains_sprockets
    ベルト・プーリ → belts_pulleys
    動力伝達機器 → power_transmission_equipment
    カップリング → couplings
    車輪 → wheels
    クラッチ → clutches
    ブレーキ → brakes
    減速機 → reducers
    スリップリング → slip_rings
    ローラー → rollers
    アクチュエーター → actuators
    ベルト → belts
    ジョイント → joints
    シリンダー → cylinders
    変速機 → transmissions
    キャスター → casters
    ノズル → nozzles
    その他機械要素 → other_mechanical_elements
 */

export const categoryS_mechanical_elements_NameOnly: MachineProductCategoriesS_mechanical_elements[] = [
  "gears",
  "fasteners",
  "springs",
  "shafts",
  "chains_sprockets",
  "belts_pulleys",
  "power_transmission_equipment",
  "couplings",
  "wheels",
  "clutches",
  "brakes",
  "reducers",
  "slip_rings",
  "rollers",
  "actuators",
  "belts",
  "joints",
  "cylinders",
  "transmissions",
  "casters",
  "nozzles",
  "other_mechanical_elements",
];
export const categoryS_mechanical_elements: { id: number; name: MachineProductCategoriesS_mechanical_elements }[] = [
  { id: 220, name: "gears" },
  { id: 221, name: "fasteners" },
  { id: 222, name: "springs" },
  { id: 223, name: "shafts" },
  { id: 224, name: "chains_sprockets" },
  { id: 225, name: "belts_pulleys" },
  { id: 226, name: "power_transmission_equipment" },
  { id: 227, name: "couplings" },
  { id: 228, name: "wheels" },
  { id: 229, name: "clutches" },
  { id: 230, name: "brakes" },
  { id: 231, name: "reducers" },
  { id: 232, name: "slip_rings" },
  { id: 233, name: "rollers" },
  { id: 234, name: "actuators" },
  { id: 235, name: "belts" },
  { id: 236, name: "joints" },
  { id: 237, name: "cylinders" },
  { id: 238, name: "transmissions" },
  { id: 239, name: "casters" },
  { id: 240, name: "nozzles" },
  { id: 241, name: "other_mechanical_elements" },
];
export const mappingCategoryS_mechanical_elements: {
  [K in MachineProductCategoriesS_mechanical_elements | string]: { [key: string]: string };
} = {
  gears: { ja: "歯車", en: `` },
  fasteners: { ja: "ファスナー", en: `` },
  springs: { ja: "ばね", en: `` },
  shafts: { ja: "軸", en: `` },
  chains_sprockets: { ja: "チェーン・スプロケット", en: `` },
  belts_pulleys: { ja: "ベルト・プーリ", en: `` },
  power_transmission_equipment: { ja: "動力伝達機器", en: `` },
  couplings: { ja: "カップリング", en: `` },
  wheels: { ja: "車輪", en: `` },
  clutches: { ja: "クラッチ", en: `` },
  brakes: { ja: "ブレーキ", en: `` },
  reducers: { ja: "減速機", en: `` },
  slip_rings: { ja: "スリップリング", en: `` },
  rollers: { ja: "ローラー", en: `` },
  actuators: { ja: "アクチュエーター", en: `` },
  belts: { ja: "ベルト", en: `` },
  joints: { ja: "ジョイント", en: `` },
  cylinders: { ja: "シリンダー", en: `` },
  transmissions: { ja: "変速機", en: `` },
  casters: { ja: "キャスター", en: `` },
  nozzles: { ja: "ノズル", en: `` },
  other_mechanical_elements: { ja: "その他機械要素", en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 30, name: "bearings" },
// ------------------------- 🌠30. 軸受・ベアリング 小分類 bearings -------------------------
// 242から

/**
 * 【軸受・ベアリング】Bearings
    金属軸受・ベアリング → metal_bearings
    樹脂軸受・ベアリング → plastic_bearings
 */

export const categoryS_bearings_NameOnly: MachineProductCategoriesS_bearings[] = ["metal_bearings", "plastic_bearings"];
export const categoryS_bearings: { id: number; name: MachineProductCategoriesS_bearings }[] = [
  { id: 242, name: "metal_bearings" },
  { id: 243, name: "plastic_bearings" },
];
export const mappingCategoryS_bearings: {
  [K in MachineProductCategoriesS_bearings | string]: { [key: string]: string };
} = {
  metal_bearings: { ja: "金属軸受・ベアリング", en: `` },
  plastic_bearings: { ja: "樹脂軸受・ベアリング", en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 31, name: "screws" },
// ------------------------- 🌠31. ねじ 小分類 screws -------------------------
// 244から

/**
 * 【ねじ】Screws
    ナット → nuts
    ボルト → bolts
 */

export const categoryS_screws_NameOnly: MachineProductCategoriesS_screws[] = ["nuts", "bolts"];
export const categoryS_screws: { id: number; name: MachineProductCategoriesS_screws }[] = [
  { id: 244, name: "nuts" },
  { id: 245, name: "bolts" },
];
export const mappingCategoryS_screws: {
  [K in MachineProductCategoriesS_screws | string]: { [key: string]: string };
} = {
  nuts: { ja: "ナット", en: `` },
  bolts: { ja: "ボルト", en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 32, name: "motors" },
// ------------------------- 🌠32. モータ 小分類 motors -------------------------
// 246から

/**
 * 【モータ】Motors
    サーボモータ → servo_motors
    ステッピングモータ → stepping_motors
    リニアモータ → linear_motors
    インダクションモータ → induction_motors
    PMモータ → permanent_magnet_motors ✅pm_motors
    ACモータ → ac_motors
    DCモータ → dc_motors
    電磁石 → electromagnets
    その他モータ → other_motors
 */

export const categoryS_motors_NameOnly: MachineProductCategoriesS_motors[] = [
  "servo_motors",
  "stepping_motors",
  "linear_motors",
  "induction_motors",
  "pm_motors",
  "ac_motors",
  "dc_motors",
  "electromagnets",
  "other_motors",
];
export const categoryS_motors: { id: number; name: MachineProductCategoriesS_motors }[] = [
  { id: 246, name: "servo_motors" },
  { id: 247, name: "stepping_motors" },
  { id: 248, name: "linear_motors" },
  { id: 249, name: "induction_motors" },
  { id: 250, name: "pm_motors" },
  { id: 251, name: "ac_motors" },
  { id: 252, name: "dc_motors" },
  { id: 253, name: "electromagnets" },
  { id: 254, name: "other_motors" },
];
export const mappingCategoryS_motors: {
  [K in MachineProductCategoriesS_motors | string]: { [key: string]: string };
} = {
  servo_motors: { ja: `サーボモータ`, en: `` },
  stepping_motors: { ja: `ステッピングモータ`, en: `` },
  linear_motors: { ja: `リニアモータ`, en: `` },
  induction_motors: { ja: `インダクションモータ`, en: `` },
  pm_motors: { ja: `PMモータ`, en: `` },
  ac_motors: { ja: `ACモータ`, en: `` },
  dc_motors: { ja: `DCモータ`, en: `` },
  electromagnets: { ja: `電磁石`, en: `` },
  other_motors: { ja: `その他モータ`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 33, name: "pumps" },
// ------------------------- 🌠33. ポンプ 小分類 pumps -------------------------
// 255から

/**
 * 【ポンプ】Pumps
    シリンジポンプ → syringe_pumps
    容積型ポンプ → positive_displacement_pumps
    ターボ型ポンプ → turbo_pumps
    特殊ポンプ → special_pumps
    その他ポンプ → other_pumps
 */

export const categoryS_pumps_NameOnly: MachineProductCategoriesS_pumps[] = [
  "syringe_pumps",
  "positive_displacement_pumps",
  "turbo_pumps",
  "special_pumps",
  "other_pumps",
];
export const categoryS_pumps: { id: number; name: MachineProductCategoriesS_pumps }[] = [
  { id: 255, name: "syringe_pumps" },
  { id: 256, name: "positive_displacement_pumps" },
  { id: 257, name: "turbo_pumps" },
  { id: 258, name: "special_pumps" },
  { id: 259, name: "other_pumps" },
];
export const mappingCategoryS_pumps: {
  [K in MachineProductCategoriesS_pumps | string]: { [key: string]: string };
} = {
  syringe_pumps: { ja: `シリンジポンプ`, en: `` },
  positive_displacement_pumps: { ja: `容積型ポンプ`, en: `` },
  turbo_pumps: { ja: `ターボ型ポンプ`, en: `` },
  special_pumps: { ja: `特殊ポンプ`, en: `` },
  other_pumps: { ja: `その他ポンプ`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 34, name: "piping_components" },
// ------------------------- 🌠33. 配管部品 小分類 piping_components -------------------------
// 260から

/**
 * 【配管部品】Piping Components
    バルブ → valves
    フィルタ → filters
    管継手 → pipe_fittings
    チューブ → tubes
    ホース → hoses
    配管材 → piping_materials
 */

export const categoryS_piping_components_NameOnly: MachineProductCategoriesS_piping_components[] = [
  "valves",
  "filters",
  "pipe_fittings",
  "tubes",
  "hoses",
  "piping_materials",
];
export const categoryS_piping_components: { id: number; name: MachineProductCategoriesS_piping_components }[] = [
  { id: 260, name: "valves" },
  { id: 261, name: "filters" },
  { id: 262, name: "pipe_fittings" },
  { id: 263, name: "tubes" },
  { id: 264, name: "hoses" },
  { id: 265, name: "piping_materials" },
];
export const mappingCategoryS_piping_components: {
  [K in MachineProductCategoriesS_piping_components | string]: { [key: string]: string };
} = {
  valves: { ja: `バルブ`, en: `` },
  filters: { ja: `フィルタ`, en: `` },
  pipe_fittings: { ja: `管継手`, en: `` },
  tubes: { ja: `チューブ`, en: `` },
  hoses: { ja: `ホース`, en: `` },
  piping_materials: { ja: `配管材`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 35, name: "water_oil_hydraulic_pneumatic_equipment" },
// ------------------------- 🌠35. 油空水圧機器 小分類 water_oil_hydraulic_pneumatic_equipment -------------------------
// 266から

/**
 * 【油空水圧機器】Hydraulic and Pneumatic Equipment
    水圧機器 → water_pressure_equipment
    油圧機器 → oil_pressure_equipment ✅pneumatic_equipment
    空圧機器 → pneumatic_equipment ✅
 */

export const categoryS_water_oil_hydraulic_pneumatic_equipment_NameOnly: MachineProductCategoriesS_water_oil_hydraulic_pneumatic_equipment[] =
  ["water_pressure_equipment", "oil_pressure_equipment", "pneumatic_equipment"];
export const categoryS_water_oil_hydraulic_pneumatic_equipment: {
  id: number;
  name: MachineProductCategoriesS_water_oil_hydraulic_pneumatic_equipment;
}[] = [
  { id: 266, name: "water_pressure_equipment" },
  { id: 267, name: "oil_pressure_equipment" },
  { id: 268, name: "pneumatic_equipment" },
];
export const mappingCategoryS_water_oil_hydraulic_pneumatic_equipment: {
  [K in MachineProductCategoriesS_water_oil_hydraulic_pneumatic_equipment | string]: { [key: string]: string };
} = {
  water_pressure_equipment: { ja: `水圧機器`, en: `` },
  oil_pressure_equipment: { ja: `油圧機器`, en: `` },
  pneumatic_equipment: { ja: `空圧機器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 36, name: "vacuum_equipment" },
// ------------------------- 🌠36. 真空機器 小分類 vacuum_equipment -------------------------
// 269から

/**
 * 【真空機器】Vacuum Equipment
    真空機器 → vacuum_equipment
    シール・密封 → seals_gaskets ✅seals
    真空ポンプ → vacuum_pumps
 */

export const categoryS_vacuum_equipment_NameOnly: MachineProductCategoriesS_vacuum_equipment[] = [
  "vacuum_equipment",
  "seals_gaskets",
  "vacuum_pumps",
];
export const categoryS_vacuum_equipment: {
  id: number;
  name: MachineProductCategoriesS_vacuum_equipment;
}[] = [
  { id: 269, name: "vacuum_equipment" },
  { id: 270, name: "seals_gaskets" },
  { id: 271, name: "vacuum_pumps" },
];
export const mappingCategoryS_vacuum_equipment: {
  [K in MachineProductCategoriesS_vacuum_equipment | string]: { [key: string]: string };
} = {
  vacuum_equipment: { ja: `真空機器`, en: `` },
  seals_gaskets: { ja: `シール・密封`, en: `` },
  vacuum_pumps: { ja: `真空ポンプ`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 37, name: "molds" },
// ------------------------- 🌠37. 金型 小分類 molds -------------------------
// 272から

/**
 * 【金型】Molds
    ゴム金型 → rubber_molds
    プラスチック金型 → plastic_molds
    樹脂金型 → resin_molds
    プレス金型 → press_molds
    金型設計 → mold_design
    その他金型 → other_molds
 */

export const categoryS_molds_NameOnly: MachineProductCategoriesS_molds[] = [
  "rubber_molds",
  "plastic_molds",
  "resin_molds",
  "press_molds",
  "mold_design",
  "other_molds",
];
export const categoryS_molds: {
  id: number;
  name: MachineProductCategoriesS_molds;
}[] = [
  { id: 272, name: "rubber_molds" },
  { id: 273, name: "plastic_molds" },
  { id: 274, name: "resin_molds" },
  { id: 275, name: "press_molds" },
  { id: 276, name: "mold_design" },
  { id: 277, name: "other_molds" },
];
export const mappingCategoryS_molds: {
  [K in MachineProductCategoriesS_molds | string]: { [key: string]: string };
} = {
  rubber_molds: { ja: `ゴム金型`, en: `` },
  plastic_molds: { ja: `プラスチック金型`, en: `` },
  resin_molds: { ja: `樹脂金型`, en: `` },
  press_molds: { ja: `プレス金型`, en: `` },
  mold_design: { ja: `金型設計`, en: `` },
  other_molds: { ja: `その他金型`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 38, name: "jigs" },
// ------------------------- 🌠38. 治具 小分類 jigs -------------------------
// 278から

/**
 * 【治具】Jigs
    検査治具 → inspection_jigs
    加工治具 → machining_jigs
    組立治具 → assembly_jigs
    ブラケット → brackets
 */

export const categoryS_jigs_NameOnly: MachineProductCategoriesS_jigs[] = [
  "inspection_jigs",
  "machining_jigs",
  "assembly_jigs",
  "brackets",
];
export const categoryS_jigs: {
  id: number;
  name: MachineProductCategoriesS_jigs;
}[] = [
  { id: 278, name: "inspection_jigs" },
  { id: 279, name: "machining_jigs" },
  { id: 280, name: "assembly_jigs" },
  { id: 281, name: "brackets" },
];
export const mappingCategoryS_jigs: {
  [K in MachineProductCategoriesS_jigs | string]: { [key: string]: string };
} = {
  inspection_jigs: { ja: `検査治具`, en: `` },
  machining_jigs: { ja: `加工治具`, en: `` },
  assembly_jigs: { ja: `組立治具`, en: `` },
  brackets: { ja: `ブラケット`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 39, name: "automotive_parts" },
// ------------------------- 🌠39. 自動車部品 小分類 automotive_parts -------------------------
// 282から

/**
 * 【自動車部品】Automotive Parts
    エンジン系部品 → engine_parts
    自動車触媒評価試験装置 → automotive_catalyst_test_equipment
    O2センサー評価試験装置 → o2_sensor_test_equipment
    燃料系部品 → fuel_system_parts
    キャニスター評価装置 → canister_test_device
    ミッション系部品 → transmission_parts
    ブレーキ品 → brake_components
    駆動系部品 → drivetrain_parts
    車軸系部品 - axle_parts
    車体系部品 → body_parts
    操縦系部品 → steering_system_parts ✅steering_parts
    電装備部品 → electrical_components ✅electrical_parts
    内装部品 → interior_parts
    その他自動車部品 → other_automotive_parts
 */

export const categoryS_automotive_parts_NameOnly: MachineProductCategoriesS_automotive_parts[] = [
  "engine_parts",
  "automotive_catalyst_test_equipment",
  "o2_sensor_test_equipment",
  "fuel_system_parts",
  "canister_test_device",
  "transmission_parts",
  "brake_components",
  "drivetrain_parts",
  "axle_parts",
  "body_parts",
  "steering_system_parts",
  "electrical_parts",
  "interior_parts",
  "other_automotive_parts",
];
export const categoryS_automotive_parts: {
  id: number;
  name: MachineProductCategoriesS_automotive_parts;
}[] = [
  { id: 282, name: "engine_parts" },
  { id: 283, name: "automotive_catalyst_test_equipment" },
  { id: 284, name: "o2_sensor_test_equipment" },
  { id: 285, name: "fuel_system_parts" },
  { id: 286, name: "canister_test_device" },
  { id: 287, name: "transmission_parts" },
  { id: 288, name: "brake_components" },
  { id: 289, name: "drivetrain_parts" },
  { id: 290, name: "axle_parts" },
  { id: 291, name: "body_parts" },
  { id: 292, name: "steering_system_parts" },
  { id: 293, name: "electrical_parts" },
  { id: 294, name: "interior_parts" },
  { id: 295, name: "other_automotive_parts" },
];
export const mappingCategoryS_automotive_parts: {
  [K in MachineProductCategoriesS_automotive_parts | string]: { [key: string]: string };
} = {
  engine_parts: { ja: `エンジン系部品`, en: `` },
  automotive_catalyst_test_equipment: { ja: `自動車触媒評価試験装置`, en: `` },
  o2_sensor_test_equipment: { ja: `O2センサー評価試験装置`, en: `` },
  fuel_system_parts: { ja: `燃料系部品`, en: `` },
  canister_test_device: { ja: `キャニスター評価装置`, en: `` },
  transmission_parts: { ja: `ミッション系部品`, en: `` },
  brake_components: { ja: `ブレーキ品`, en: `` },
  drivetrain_parts: { ja: `駆動系部品`, en: `` },
  axle_parts: { ja: `車軸系部品`, en: `` },
  body_parts: { ja: `車体系部品`, en: `` },
  steering_system_parts: { ja: `操縦系部品`, en: `` },
  electrical_parts: { ja: `電装備部品`, en: `` },
  interior_parts: { ja: `内装部品`, en: `` },
  other_automotive_parts: { ja: `その他自動車部品`, en: `` },
};

// -------------------------------------------------------------------------------------

// ========================= ✅「機械部品」 大分類 mechanical_parts の小分類関連✅ ここまで =========================

// =================== ✅「製造・加工機械」 大分類 manufacturing_processing_machines の小分類関連✅ ===================

/**
 * export const processingMachineryCategoryM: { id: number; name: ProductCategoriesMediumProcessingMachinery }[] = [
  { id: 40, name: "machine_tools" },
  { id: 41, name: "processing_machines" },
  { id: 42, name: "semiconductor_manufacturing_equipment" },
  { id: 43, name: "mounting_machines" },
  { id: 44, name: "industrial_robots" },
  { id: 45, name: "assembly_machines" },
  { id: 46, name: "painting_machines" },
  { id: 47, name: "food_machines" },
  { id: 48, name: "packaging_machines" },
  { id: 49, name: "conveying_machines" },
  { id: 50, name: "marking" },
  { id: 51, name: "contracted_services" },
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
 */

// { id: 40, name: "machine_tools" },
// ------------------------- 🌠40. 工作機械 小分類 machine_tools -------------------------
// 296から

/**
 * 【工作機械】Machine Tools
    旋盤 → lathes
    ボール盤 → drill_presses ✅drilling_machines
    中ぐり盤 → boring_machines
    フライス盤 → milling_machines
    平削り盤・形削り盤・立削り盤 → planing_shaping_slotting_machines ✅planers_shapers_slotters
    研削盤 → grinding_machines
    歯切り盤・歯車仕上げ機械 → gear_cutting_finishing_machines
    特殊加工機械 → special_processing_machines
    放電加工機 → edm_machines
    その他工作機械 → other_machine_tools
 */

export const categoryS_machine_tools_NameOnly: ProcessingMachineryProductCategoriesS_machine_tools[] = [
  "lathes",
  "drilling_machines",
  "boring_machines",
  "milling_machines",
  "planers_shapers_slotters",
  "grinding_machines",
  "gear_cutting_finishing_machines",
  "special_processing_machines",
  "edm_machines",
  "other_machine_tools",
];
export const categoryS_machine_tools: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_machine_tools;
}[] = [
  { id: 296, name: "lathes" },
  { id: 297, name: "drilling_machines" },
  { id: 298, name: "boring_machines" },
  { id: 299, name: "milling_machines" },
  { id: 300, name: "planers_shapers_slotters" },
  { id: 301, name: "grinding_machines" },
  { id: 302, name: "gear_cutting_finishing_machines" },
  { id: 303, name: "special_processing_machines" },
  { id: 304, name: "edm_machines" },
  { id: 305, name: "other_machine_tools" },
];
export const mappingCategoryS_machine_tools: {
  [K in ProcessingMachineryProductCategoriesS_machine_tools | string]: { [key: string]: string };
} = {
  lathes: { ja: `旋盤`, en: `` },
  drilling_machines: { ja: `ボール盤`, en: `` },
  boring_machines: { ja: `中ぐり盤`, en: `` },
  milling_machines: { ja: `フライス盤`, en: `` },
  planers_shapers_slotters: { ja: `平削り盤・形削り盤・立削り盤`, en: `` },
  grinding_machines: { ja: `研削盤`, en: `` },
  gear_cutting_finishing_machines: { ja: `歯切り盤・歯車仕上げ機械`, en: `` },
  special_processing_machines: { ja: `特殊加工機械`, en: `` },
  edm_machines: { ja: `放電加工機`, en: `` },
  other_machine_tools: { ja: `その他工作機械`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 41, name: "processing_machines" },
// ------------------------- 🌠41. 加工機械 小分類 processing_machines -------------------------
// 306から

/**
 * 【加工機械】Processing Machinery
    塑性加工機械(切断・圧延) → ✅plastic_working_machines
    溶接機械 → welding_machines
    鍛圧機械 → heading_machines
    巻線機 → winding_machines
    印刷機械 → printing_machines ✅printing_machines
    射出成形機 → injection_molding_machines
    中空成形機 → blow_molding_machines
    押出成形機 → extrusion_molding_machines
    真空成形機 → vacuum_molding_machines
    樹脂加工機 → plastic_processing_machines
    ゴム加工機 → rubber_processing_machines
    粉末成形機 → powder_molding_machines
    鍛造機械 → forging_machines
    繊維加工機械 → textile_processing_machines ✅textile_processing_machines
    紙工機械 → paper_machines ✅paper_processing_machines
    木材加工機械 → woodworking_machines ✅wood_processing_machines
    石材加工機械 → stone_processing_machines ✅stone_processing_machines
    その他加工機械 → other_processing_machines ✅other_processing_machines
 */

export const categoryS_processing_machines_NameOnly: ProcessingMachineryProductCategoriesS_processing_machines[] = [
  "plastic_working_machines",
  "welding_machines",
  "heading_machines",
  "winding_machines",
  "printing_machines",
  "injection_molding_machines",
  "blow_molding_machines",
  "extrusion_molding_machines",
  "vacuum_molding_machines",
  "plastic_processing_machines",
  "rubber_processing_machines",
  "powder_molding_machines",
  "forging_machines",
  "textile_processing_machines",
  "paper_processing_machines",
  "wood_processing_machines",
  "stone_processing_machines",
  "other_processing_machines",
];
export const categoryS_processing_machines: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_processing_machines;
}[] = [
  { id: 306, name: "plastic_working_machines" },
  { id: 307, name: "welding_machines" },
  { id: 308, name: "heading_machines" },
  { id: 309, name: "winding_machines" },
  { id: 310, name: "printing_machines" },
  { id: 311, name: "injection_molding_machines" },
  { id: 312, name: "blow_molding_machines" },
  { id: 313, name: "extrusion_molding_machines" },
  { id: 314, name: "vacuum_molding_machines" },
  { id: 315, name: "plastic_processing_machines" },
  { id: 316, name: "rubber_processing_machines" },
  { id: 317, name: "powder_molding_machines" },
  { id: 318, name: "forging_machines" },
  { id: 319, name: "textile_processing_machines" },
  { id: 320, name: "paper_processing_machines" },
  { id: 321, name: "wood_processing_machines" },
  { id: 322, name: "stone_processing_machines" },
  { id: 323, name: "other_processing_machines" },
];
export const mappingCategoryS_processing_machines: {
  [K in ProcessingMachineryProductCategoriesS_processing_machines | string]: { [key: string]: string };
} = {
  plastic_working_machines: { ja: `塑性加工機械(切断・圧延)`, en: `` },
  welding_machines: { ja: `溶接機械`, en: `` },
  heading_machines: { ja: `鍛圧機械`, en: `` },
  winding_machines: { ja: `巻線機`, en: `` },
  printing_machines: { ja: `印刷機械`, en: `` },
  injection_molding_machines: { ja: `射出成形機`, en: `` },
  blow_molding_machines: { ja: `中空成形機`, en: `` },
  extrusion_molding_machines: { ja: `押出成形機`, en: `` },
  vacuum_molding_machines: { ja: `真空成形機`, en: `` },
  plastic_processing_machines: { ja: `樹脂加工機`, en: `` },
  rubber_processing_machines: { ja: `ゴム加工機`, en: `` },
  powder_molding_machines: { ja: `粉末成形機`, en: `` },
  forging_machines: { ja: `鍛造機械`, en: `` },
  textile_processing_machines: { ja: `繊維加工機械`, en: `` },
  paper_processing_machines: { ja: `紙工機械`, en: `` },
  wood_processing_machines: { ja: `木材加工機械`, en: `` },
  stone_processing_machines: { ja: `石材加工機械`, en: `` },
  other_processing_machines: { ja: `その他加工機械`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 42, name: "semiconductor_manufacturing_equipment" },
// ------------------------- 🌠42. 半導体製造装置 小分類 semiconductor_manufacturing_equipment -------------------------
// 324から

/**
 * 【半導体製造装置】Semiconductor Manufacturing Equipment
    CVD装置 → cvd_equipment
    スパッタリング装置 → sputtering_equipment
    アニール路 → annealing_furnaces
    コーター → coaters
    レジスト装置 → resist_processing_equipment
    酸化・拡散装置 → oxidation_diffusion_equipment
    ステッパー → steppers
    エッチング装置 → etching_equipment
    イオン注入装置 → ion_implantation_equipment
    アッシング装置 → ashing_equipment
    蒸着装置 → deposition_equipment ✅evaporation_equipment
    電子ビーム描画装置 → electron_beam_printing_equipment
    テスタ → semiconductor_testers ✅testers
    半導体検査・試験装置 → semiconductor_inspection_testing_equipment
    ウエハ加工・研磨装置 → wafer_processing_polishing_equipment
    モールディング装置 → molding_equipment
    ボンディング装置 → bonding_equipment
    CMP装置 → cmp_equipment
    フォトマスク → photomasks
    その他半導体製造装置 → other_semiconductor_manufacturing_equipment
 */

export const categoryS_semiconductor_manufacturing_equipment_NameOnly: ProcessingMachineryProductCategoriesS_semiconductor_manufacturing_equipment[] =
  [
    "cvd_equipment",
    "sputtering_equipment",
    "annealing_furnaces",
    "coaters",
    "resist_processing_equipment",
    "oxidation_diffusion_equipment",
    "steppers",
    "etching_equipment",
    "ion_implantation_equipment",
    "ashing_equipment",
    "deposition_equipment",
    "electron_beam_printing_equipment",
    "semiconductor_testers",
    "semiconductor_inspection_testing_equipment",
    "wafer_processing_polishing_equipment",
    "molding_equipment",
    "bonding_equipment",
    "cmp_equipment",
    "photomasks",
    "other_semiconductor_manufacturing_equipment",
  ];
export const categoryS_semiconductor_manufacturing_equipment: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_semiconductor_manufacturing_equipment;
}[] = [
  { id: 324, name: "cvd_equipment" },
  { id: 325, name: "sputtering_equipment" },
  { id: 326, name: "annealing_furnaces" },
  { id: 327, name: "coaters" },
  { id: 328, name: "resist_processing_equipment" },
  { id: 329, name: "oxidation_diffusion_equipment" },
  { id: 330, name: "steppers" },
  { id: 331, name: "etching_equipment" },
  { id: 332, name: "ion_implantation_equipment" },
  { id: 333, name: "ashing_equipment" },
  { id: 334, name: "deposition_equipment" },
  { id: 335, name: "electron_beam_printing_equipment" },
  { id: 336, name: "semiconductor_testers" },
  { id: 337, name: "semiconductor_inspection_testing_equipment" },
  { id: 338, name: "wafer_processing_polishing_equipment" },
  { id: 339, name: "molding_equipment" },
  { id: 340, name: "bonding_equipment" },
  { id: 341, name: "cmp_equipment" },
  { id: 342, name: "photomasks" },
  { id: 343, name: "other_semiconductor_manufacturing_equipment" },
];
export const mappingCategoryS_semiconductor_manufacturing_equipment: {
  [K in ProcessingMachineryProductCategoriesS_semiconductor_manufacturing_equipment | string]: {
    [key: string]: string;
  };
} = {
  cvd_equipment: { ja: `CVD装置`, en: `` },
  sputtering_equipment: { ja: `スパッタリング装置`, en: `` },
  annealing_furnaces: { ja: `アニール路`, en: `` },
  coaters: { ja: `コーター`, en: `` },
  resist_processing_equipment: { ja: `レジスト装置`, en: `` },
  oxidation_diffusion_equipment: { ja: `酸化・拡散装置`, en: `` },
  steppers: { ja: `ステッパー`, en: `` },
  etching_equipment: { ja: `エッチング装置`, en: `` },
  ion_implantation_equipment: { ja: `イオン注入装置`, en: `` },
  ashing_equipment: { ja: `アッシング装置`, en: `` },
  deposition_equipment: { ja: `蒸着装置`, en: `` },
  electron_beam_printing_equipment: { ja: `電子ビーム描画装置`, en: `` },
  semiconductor_testers: { ja: `テスタ`, en: `` },
  semiconductor_inspection_testing_equipment: { ja: `半導体検査・試験装置`, en: `` },
  wafer_processing_polishing_equipment: { ja: `ウエハ加工・研磨装置`, en: `` },
  molding_equipment: { ja: `モールディング装置`, en: `` },
  bonding_equipment: { ja: `ボンディング装置`, en: `` },
  cmp_equipment: { ja: `CMP装置`, en: `` },
  photomasks: { ja: `フォトマスク`, en: `` },
  other_semiconductor_manufacturing_equipment: { ja: `その他半導体製造装置`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 43, name: "mounting_machines" },
// ------------------------- 🌠43. 実装機械 小分類 mounting_machines -------------------------
// 344から

/**
 * 【実装機械】Assembly Machinery
    マウンター → mounters
    インサータ → inserters
    リフロー装置 → reflow_oven ✅reflow_equipment
    基板加工機 → pcb_processing_machines
    テーピングマシン → taping_machines
    はんだ付け装置 → soldering_equipment
    基盤搬送装置(ローダ・アンローダ) → pcb_transport_equipment_loaders_unloaders ✅pcb_conveying_equipment
    キャリア → carriers
    その他実装機械 → other_assembly_machinery ✅other_mounting_machines
 */

export const categoryS_mounting_machines_NameOnly: ProcessingMachineryProductCategoriesS_mounting_machines[] = [
  "mounters",
  "inserters",
  "reflow_equipment",
  "pcb_processing_machines",
  "taping_machines",
  "soldering_equipment",
  "pcb_transport_equipment_loaders_unloaders",
  "other_mounting_machines",
];
export const categoryS_mounting_machines: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_mounting_machines;
}[] = [
  { id: 344, name: "mounters" },
  { id: 345, name: "inserters" },
  { id: 346, name: "reflow_equipment" },
  { id: 347, name: "pcb_processing_machines" },
  { id: 348, name: "taping_machines" },
  { id: 349, name: "soldering_equipment" },
  { id: 350, name: "pcb_transport_equipment_loaders_unloaders" },
  { id: 351, name: "other_mounting_machines" },
];
export const mappingCategoryS_mounting_machines: {
  [K in ProcessingMachineryProductCategoriesS_mounting_machines | string]: {
    [key: string]: string;
  };
} = {
  mounters: { ja: `マウンター`, en: `` },
  inserters: { ja: `インサータ`, en: `` },
  reflow_equipment: { ja: `リフロー装置`, en: `` },
  pcb_processing_machines: { ja: `基板加工機`, en: `` },
  taping_machines: { ja: `テーピングマシン`, en: `` },
  soldering_equipment: { ja: `はんだ付け装置`, en: `` },
  pcb_transport_equipment_loaders_unloaders: { ja: `基盤搬送装置(ローダ・アンローダ)`, en: `` },
  other_mounting_machines: { ja: `その他実装機械`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 44, name: "industrial_robots" },
// ------------------------- 🌠44. 産業用ロボット 小分類 industrial_robots -------------------------
// 352から

/**
 * 【産業用ロボット】Industrial Robots
    マシニングセンタ → machining_centers
    スカラロボット → scara_robots
    多間接ロボット → articulated_robots ✅multi_joint_robots
    直行ロボット → cartesian_robots
    組立ロボット → assembly_robots
    搬送・ハンドリングロボット → handling_robots ✅conveying_handling_robots
    溶接ロボット → welding_robots
    検査ロボット → inspection_robots
    その他産業用ロボット → other_industrial_robots
 */

export const categoryS_industrial_robots_NameOnly: ProcessingMachineryProductCategoriesS_industrial_robots[] = [
  "machining_centers",
  "scara_robots",
  "multi_joint_robots",
  "cartesian_robots",
  "assembly_robots",
  "conveying_handling_robots",
  "welding_robots",
  "inspection_robots",
  "other_industrial_robots",
];
export const categoryS_industrial_robots: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_industrial_robots;
}[] = [
  { id: 352, name: "machining_centers" },
  { id: 353, name: "scara_robots" },
  { id: 354, name: "multi_joint_robots" },
  { id: 355, name: "cartesian_robots" },
  { id: 356, name: "assembly_robots" },
  { id: 357, name: "conveying_handling_robots" },
  { id: 358, name: "welding_robots" },
  { id: 359, name: "inspection_robots" },
  { id: 360, name: "other_industrial_robots" },
];
export const mappingCategoryS_industrial_robots: {
  [K in ProcessingMachineryProductCategoriesS_industrial_robots | string]: {
    [key: string]: string;
  };
} = {
  machining_centers: { ja: `マシニングセンタ`, en: `` },
  scara_robots: { ja: `スカラロボット`, en: `` },
  multi_joint_robots: { ja: `多間接ロボット`, en: `` },
  cartesian_robots: { ja: `直行ロボット`, en: `` },
  assembly_robots: { ja: `組立ロボット`, en: `` },
  conveying_handling_robots: { ja: `搬送・ハンドリングロボット`, en: `` },
  welding_robots: { ja: `溶接ロボット`, en: `` },
  inspection_robots: { ja: `検査ロボット`, en: `` },
  other_industrial_robots: { ja: `その他産業用ロボット`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 45, name: "assembly_machines" },
// ------------------------- 🌠45. 組立機械 小分類 assembly_machines -------------------------
// 361から

/**
 * 【組立機械】Assembly Machines
    ディスペンサー → dispensers
    組立機械 → assembly_machines
    自動選別機 → automatic_sorters ✅automatic_sorting_machines
    パーツフィーダー → parts_feeders
    その他組立機械 → other_assembly_machines
 */

export const categoryS_assembly_machines_NameOnly: ProcessingMachineryProductCategoriesS_assembly_machines[] = [
  "dispensers",
  "assembly_machines",
  "automatic_sorters",
  "parts_feeders",
  "other_assembly_machines",
];
export const categoryS_assembly_machines: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_assembly_machines;
}[] = [
  { id: 361, name: "dispensers" },
  { id: 362, name: "assembly_machines" },
  { id: 363, name: "automatic_sorters" },
  { id: 364, name: "parts_feeders" },
  { id: 365, name: "other_assembly_machines" },
];
export const mappingCategoryS_assembly_machines: {
  [K in ProcessingMachineryProductCategoriesS_assembly_machines | string]: {
    [key: string]: string;
  };
} = {
  dispensers: { ja: `ディスペンサー`, en: `` },
  assembly_machines: { ja: `組立機械`, en: `` },
  automatic_sorters: { ja: `自動選別機`, en: `` },
  parts_feeders: { ja: `パーツフィーダー`, en: `` },
  other_assembly_machines: { ja: `その他組立機械`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 46, name: "painting_machines" },
// ------------------------- 🌠46. 塗装機械 小分類 painting_machines -------------------------
// 366から

/**
 * 【塗装機械】Painting Machinery
    塗装機械 → painting_machines
    スプレー → sprayers
    その他塗装機械 → other_painting_machinery ✅other_painting_machines
 */

export const categoryS_painting_machines_NameOnly: ProcessingMachineryProductCategoriesS_painting_machines[] = [
  "painting_machines",
  "sprayers",
  "other_painting_machines",
];
export const categoryS_painting_machines: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_painting_machines;
}[] = [
  { id: 366, name: "painting_machines" },
  { id: 367, name: "sprayers" },
  { id: 368, name: "other_painting_machines" },
];
export const mappingCategoryS_painting_machines: {
  [K in ProcessingMachineryProductCategoriesS_painting_machines | string]: {
    [key: string]: string;
  };
} = {
  painting_machines: { ja: `塗装機械`, en: `` },
  sprayers: { ja: `スプレー`, en: `` },
  other_painting_machines: { ja: `その他塗装機械`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 47, name: "food_machines" },
// ------------------------- 🌠47. 食品機械 小分類 food_machines -------------------------
// 369から

/**
 * 【食品機械】Food Machinery
    食品加工装置 → food_processing_equipment
    食品切断装置 → food_cutting_equipment
    食品洗浄装置 → food_washing_equipment ✅food_cleaning_equipment
    飲料製造装置 → beverage_manufacturing_equipment
    冷菓製造加工装置 → confectionery_processing_equipment ✅frozen_treats_manufacturing_equipment
    食品包装機械 → food_packaging_machinery ✅food_packaging_machines
    食品環境衛生・汚染防止装置 → food_sanitation_pollution_control_equipment ✅food_hygiene_contamination_prevention_equipment
    食品試験・分析・測定機器 → food_testing_analysis_measuring_instruments ✅
    食品貯蔵保管装置・設備 → food_storage_facilities ✅
    食品搬送装置 → food_conveying_equipment
    その他食品機械 → other_food_machinery
 */

export const categoryS_food_machines_NameOnly: ProcessingMachineryProductCategoriesS_food_machines[] = [
  "food_processing_equipment",
  "food_cutting_equipment",
  "food_washing_equipment",
  "beverage_manufacturing_equipment",
  "frozen_treats_manufacturing_equipment",
  "food_packaging_machines",
  "food_hygiene_contamination_prevention_equipment",
  "food_testing_analysis_measuring_equipment",
  "food_storage_facilities",
  "food_conveying_equipment",
  "other_food_machinery",
];
export const categoryS_food_machines: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_food_machines;
}[] = [
  { id: 370, name: "food_processing_equipment" },
  { id: 371, name: "food_cutting_equipment" },
  { id: 372, name: "food_washing_equipment" },
  { id: 373, name: "beverage_manufacturing_equipment" },
  { id: 374, name: "frozen_treats_manufacturing_equipment" },
  { id: 375, name: "food_packaging_machines" },
  { id: 376, name: "food_hygiene_contamination_prevention_equipment" },
  { id: 377, name: "food_testing_analysis_measuring_equipment" },
  { id: 378, name: "food_storage_facilities" },
  { id: 379, name: "food_conveying_equipment" },
  { id: 380, name: "other_food_machinery" },
];
export const mappingCategoryS_food_machines: {
  [K in ProcessingMachineryProductCategoriesS_food_machines | string]: {
    [key: string]: string;
  };
} = {
  food_processing_equipment: { ja: `食品加工装置`, en: `` },
  food_cutting_equipment: { ja: `食品切断装置`, en: `` },
  food_washing_equipment: { ja: `食品洗浄装置`, en: `` },
  beverage_manufacturing_equipment: { ja: `飲料製造装置`, en: `` },
  frozen_treats_manufacturing_equipment: { ja: `冷菓製造加工装置`, en: `` },
  food_packaging_machines: { ja: `食品包装機械`, en: `` },
  food_hygiene_contamination_prevention_equipment: { ja: `食品環境衛生・汚染防止装置`, en: `` },
  food_testing_analysis_measuring_equipment: { ja: `食品試験・分析・測定機器`, en: `` },
  food_storage_facilities: { ja: `食品貯蔵保管装置・設備`, en: `` },
  food_conveying_equipment: { ja: `食品搬送装置`, en: `` },
  other_food_machinery: { ja: `その他食品機械`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 48, name: "packaging_machines" },
// ------------------------- 🌠48. 包装機械 小分類 packaging_machines -------------------------
// 381から

/**
 * 【包装機械】Packaging Machinery
    製袋機・スリッター → bag_making_slitting_machines ✅bag_making_slitter_machines
    製函機 → case_former box_making_machines ✅carton_making_machines
    充填機・びん詰め機 → filling_bottling_machines
    箱詰機械 → case_packer boxing_machines ✅cartoning_machines
    真空包装機 → vacuum_packaging_machines
    上包機 → overwrapping_machines
    シール機 → sealing_machines
    シュリンク包装機 → shrink_wrapping_machines ✅shrink_wrap_machines
    結束・梱包機 → strapping_packaging_machines
    その他包装機械 → other_packaging_machinery
 */

export const categoryS_packaging_machines_NameOnly: ProcessingMachineryProductCategoriesS_packaging_machines[] = [
  "bag_making_slitting_machines",
  "case_former",
  "filling_bottling_machines",
  "case_packer",
  "vacuum_packaging_machines",
  "overwrapping_machines",
  "sealing_machines",
  "shrink_wrapping_machines",
  "strapping_packaging_machines",
  "other_packaging_machinery",
];
export const categoryS_packaging_machines: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_packaging_machines;
}[] = [
  { id: 381, name: "bag_making_slitting_machines" },
  { id: 382, name: "case_former" },
  { id: 383, name: "filling_bottling_machines" },
  { id: 384, name: "case_packer" },
  { id: 385, name: "vacuum_packaging_machines" },
  { id: 386, name: "overwrapping_machines" },
  { id: 387, name: "sealing_machines" },
  { id: 388, name: "shrink_wrapping_machines" },
  { id: 389, name: "strapping_packaging_machines" },
  { id: 390, name: "other_packaging_machinery" },
];
export const mappingCategoryS_packaging_machines: {
  [K in ProcessingMachineryProductCategoriesS_packaging_machines | string]: {
    [key: string]: string;
  };
} = {
  bag_making_slitting_machines: { ja: `製袋機・スリッター`, en: `` },
  case_former: { ja: `製函機`, en: `` },
  filling_bottling_machines: { ja: `充填機・びん詰め機`, en: `` },
  case_packer: { ja: `箱詰機械`, en: `` },
  vacuum_packaging_machines: { ja: `真空包装機`, en: `` },
  overwrapping_machines: { ja: `上包機`, en: `` },
  sealing_machines: { ja: `シール機`, en: `` },
  shrink_wrapping_machines: { ja: `シュリンク包装機`, en: `` },
  strapping_packaging_machines: { ja: `結束・梱包機`, en: `` },
  other_packaging_machinery: { ja: `その他包装機械`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 49, name: "conveying_machines" },
// ------------------------- 🌠49. 搬送機械 小分類 conveying_machines -------------------------
// 391から

/**
 * 【搬送機械】Conveying Machinery
    クレーン → cranes
    コンベヤ → conveyors
    仕分け機 → sorting_machines
    パレタイザ → palletizers
    バランサー → balancers
    リフト → lifts
    台車 → trolleys ✅carts
    パレット → pallets
    その他搬送機械 → other_conveying_machinery ✅other_conveying_machines
 */

export const categoryS_conveying_machines_NameOnly: ProcessingMachineryProductCategoriesS_conveying_machines[] = [
  "cranes",
  "conveyors",
  "sorting_machines",
  "palletizers",
  "balancers",
  "lifts",
  "carts",
  "other_conveying_machines",
];
export const categoryS_conveying_machines: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_conveying_machines;
}[] = [
  { id: 391, name: "cranes" },
  { id: 392, name: "conveyors" },
  { id: 393, name: "sorting_machines" },
  { id: 394, name: "palletizers" },
  { id: 395, name: "balancers" },
  { id: 396, name: "lifts" },
  { id: 397, name: "carts" },
  { id: 398, name: "other_conveying_machines" },
];
export const mappingCategoryS_conveying_machines: {
  [K in ProcessingMachineryProductCategoriesS_conveying_machines | string]: {
    [key: string]: string;
  };
} = {
  cranes: { ja: `クレーン`, en: `` },
  conveyors: { ja: `コンベヤ`, en: `` },
  sorting_machines: { ja: `仕分け機`, en: `` },
  palletizers: { ja: `パレタイザ`, en: `` },
  balancers: { ja: `バランサー`, en: `` },
  lifts: { ja: `リフト`, en: `` },
  carts: { ja: `台車`, en: `` },
  other_conveying_machines: { ja: `その他搬送機械`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 50, name: "marking" },
// ------------------------- 🌠50. マーキング 小分類 marking -------------------------
// 399から

/**
 * 【マーキング】Marking
    業務用プリンタ → commercial_printers
    ラベラー → labelers
    ラベル → labels
    特殊ラベル → special_labels
    銘板 → nameplates
    刻印機 → engraving_machines
    レーザーマーカー → laser_markers
    その他マーキング → other_marking ✅other_marking_equipment
 */

export const categoryS_marking_NameOnly: ProcessingMachineryProductCategoriesS_marking[] = [
  "commercial_printers",
  "labelers",
  "labels",
  "special_labels",
  "nameplates",
  "engraving_machines",
  "laser_markers",
  "other_marking",
];
export const categoryS_marking: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_marking;
}[] = [
  { id: 399, name: "commercial_printers" },
  { id: 400, name: "labelers" },
  { id: 401, name: "labels" },
  { id: 402, name: "special_labels" },
  { id: 403, name: "nameplates" },
  { id: 404, name: "engraving_machines" },
  { id: 405, name: "laser_markers" },
  { id: 406, name: "other_marking" },
];
export const mappingCategoryS_marking: {
  [K in ProcessingMachineryProductCategoriesS_marking | string]: {
    [key: string]: string;
  };
} = {
  commercial_printers: { ja: `業務用プリンタ`, en: `` },
  labelers: { ja: `ラベラー`, en: `` },
  labels: { ja: `ラベル`, en: `` },
  special_labels: { ja: `特殊ラベル`, en: `` },
  nameplates: { ja: `銘板`, en: `` },
  engraving_machines: { ja: `刻印機`, en: `` },
  laser_markers: { ja: `レーザーマーカー`, en: `` },
  other_marking: { ja: `その他マーキング`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 51, name: "contracted_services" },
// ------------------------- 🌠51. 受託サービス 小分類 contracted_services -------------------------
// 407から

/**
 * 【受託サービス】Contracted Services
    機械設計 → machine_design ✅mechanical_design
    製造受託 → manufacturing_outsourcing ✅manufacturing_services
    加工受託 → processing_outsourcing ✅processing_services
 */

export const categoryS_contracted_services_processing_machinery_NameOnly: ProcessingMachineryProductCategoriesS_contracted_services[] =
  ["machine_design", "manufacturing_services", "processing_services"];
export const categoryS_contracted_services_processing_machinery: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_contracted_services;
}[] = [
  { id: 407, name: "machine_design" },
  { id: 408, name: "manufacturing_services" },
  { id: 409, name: "processing_services" },
];
export const mappingCategoryS_contracted_services_processing_machinery: {
  [K in ProcessingMachineryProductCategoriesS_contracted_services | string]: {
    [key: string]: string;
  };
} = {
  machine_design: { ja: `機械設計`, en: `` },
  manufacturing_services: { ja: `製造受託`, en: `` },
  processing_services: { ja: `加工受託`, en: `` },
};

// -------------------------------------------------------------------------------------

// =================== ✅「製造・加工機械」 大分類 manufacturing_processing_machines の小分類関連✅ ここまで ===================

// =================== ✅「科学・理化学」 大分類 scientific_chemical_equipment の小分類関連✅ ===================
/**
 * export const scienceCategoryM: { id: number; name: ProductCategoriesMediumScience }[] = [
  { id: 52, name: "chemical_equipment" },
  { id: 53, name: "cleaning_machines" },
  { id: 54, name: "powder_equipment" },
  { id: 55, name: "heating_equipment_furnaces" },
  { id: 56, name: "surface_treatment_equipment" },
  { id: 57, name: "laboratory_equipment_supplies" },
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
 */

// { id: 52, name: "chemical_equipment" },
// ------------------------- 🌠52. 理化学機器 小分類 chemical_equipment -------------------------
// 410から

/**
 * 【理化学機器】Chemical Laboratory Equipment
    インキュベータ → incubators
    冷蔵庫・冷凍庫 → refrigerators_freezers
    乾燥機器 → drying_equipment
    オートクレーブ → autoclaves
    滅菌器 → sterilizers
    恒温水槽 → constant_temperature_water_baths
    純水製造装置 → pure_water_production_equipment
    遠心分離機 → centrifuges
    分注器 → dispensers
    ピペット → pipettes
    スターラー → stirrers
    濃縮装置 → concentration_equipment ✅concentrators
    ステンレス容器 → stainless_containers ✅stainless_steel_containers
    分離装置 → separation_equipment
    蒸留装置 → distillation_equipment
    脱気装置 → degassing_equipment
    紫外線照射装置 → ultraviolet_irradiation_equipment ✅uv_exposure_equipment
    プラズマ発生装置 → plasma_generators
    オゾン発生装置 → ozone_generators
    ガス発生装置 → gas_generators
    窒素ガス発生装置 → nitrogen_gas_generators
    乳化・分散機 → emulsifying_dispersion_machines ✅emulsifiers_dispersers
    ミキサー・攪拌器 → mixers_agitators
    その他理化学機器 → other_chemical_laboratory_equipment ✅other_laboratory_equipment
 */

export const categoryS_chemical_equipment_NameOnly: ProcessingMachineryProductCategoriesS_chemical_equipment[] = [
  "incubators",
  "refrigerators_freezers",
  "drying_equipment",
  "autoclaves",
  "sterilizers",
  "constant_temperature_water_baths",
  "pure_water_production_equipment",
  "centrifuges",
  "dispensers",
  "pipettes",
  "stirrers",
  "concentrators",
  "stainless_containers",
  "separation_equipment",
  "distillation_equipment",
  "degassing_equipment",
  "uv_exposure_equipment",
  "plasma_generators",
  "ozone_generators",
  "gas_generators",
  "nitrogen_gas_generators",
  "emulsifiers_dispersers",
  "mixers_agitators",
  "other_chemical_equipment",
];
export const categoryS_chemical_equipment: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_chemical_equipment;
}[] = [
  { id: 410, name: "incubators" },
  { id: 411, name: "refrigerators_freezers" },
  { id: 412, name: "drying_equipment" },
  { id: 413, name: "autoclaves" },
  { id: 414, name: "sterilizers" },
  { id: 415, name: "constant_temperature_water_baths" },
  { id: 416, name: "pure_water_production_equipment" },
  { id: 417, name: "centrifuges" },
  { id: 418, name: "dispensers" },
  { id: 419, name: "pipettes" },
  { id: 420, name: "stirrers" },
  { id: 421, name: "concentrators" },
  { id: 422, name: "stainless_containers" },
  { id: 423, name: "separation_equipment" },
  { id: 424, name: "distillation_equipment" },
  { id: 425, name: "degassing_equipment" },
  { id: 426, name: "uv_exposure_equipment" },
  { id: 427, name: "plasma_generators" },
  { id: 428, name: "ozone_generators" },
  { id: 429, name: "gas_generators" },
  { id: 430, name: "nitrogen_gas_generators" },
  { id: 431, name: "emulsifiers_dispersers" },
  { id: 432, name: "mixers_agitators" },
  { id: 433, name: "other_chemical_equipment" },
];
export const mappingCategoryS_chemical_equipment: {
  [K in ProcessingMachineryProductCategoriesS_chemical_equipment | string]: {
    [key: string]: string;
  };
} = {
  incubators: { ja: `インキュベータ`, en: `` },
  refrigerators_freezers: { ja: `冷蔵庫・冷凍庫`, en: `` },
  drying_equipment: { ja: `乾燥機器`, en: `` },
  autoclaves: { ja: `オートクレーブ`, en: `` },
  sterilizers: { ja: `滅菌器`, en: `` },
  constant_temperature_water_baths: { ja: `恒温水槽`, en: `` },
  pure_water_production_equipment: { ja: `純水製造装置`, en: `` },
  centrifuges: { ja: `遠心分離機`, en: `` },
  dispensers: { ja: `分注器`, en: `` },
  pipettes: { ja: `ピペット`, en: `` },
  stirrers: { ja: `スターラー`, en: `` },
  concentrators: { ja: `濃縮装置`, en: `` },
  stainless_containers: { ja: `ステンレス容器`, en: `` },
  separation_equipment: { ja: `分離装置`, en: `` },
  distillation_equipment: { ja: `蒸留装置`, en: `` },
  degassing_equipment: { ja: `脱気装置`, en: `` },
  uv_exposure_equipment: { ja: `紫外線照射装置`, en: `` },
  plasma_generators: { ja: `プラズマ発生装置`, en: `` },
  ozone_generators: { ja: `オゾン発生装置`, en: `` },
  gas_generators: { ja: `ガス発生装置`, en: `` },
  nitrogen_gas_generators: { ja: `窒素ガス発生装置`, en: `` },
  emulsifiers_dispersers: { ja: `乳化・分散機`, en: `` },
  mixers_agitators: { ja: `ミキサー・攪拌器`, en: `` },
  other_chemical_equipment: { ja: `その他理化学機器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 53, name: "cleaning_machines" },
// ------------------------- 🌠53. 洗浄機 小分類 cleaning_machines -------------------------
// 434から

/**
 * 【洗浄機】Washing Machines
    高圧洗浄機 → high_pressure_washing_machines ✅high_pressure_cleaners
    超音波洗浄機 → ultrasonic_cleaning_machines ✅ultrasonic_cleaners
    その他洗浄機 → other_washing_machines ✅other_cleaning_machines
 */

export const categoryS_cleaning_machines_NameOnly: ProcessingMachineryProductCategoriesS_cleaning_machines[] = [
  "high_pressure_cleaners",
  "ultrasonic_cleaners",
  "other_cleaning_machines",
];
export const categoryS_cleaning_machines: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_cleaning_machines;
}[] = [
  { id: 434, name: "high_pressure_cleaners" },
  { id: 435, name: "ultrasonic_cleaners" },
  { id: 436, name: "other_cleaning_machines" },
];
export const mappingCategoryS_cleaning_machines: {
  [K in ProcessingMachineryProductCategoriesS_cleaning_machines | string]: {
    [key: string]: string;
  };
} = {
  high_pressure_cleaners: { ja: `高圧洗浄機`, en: `` },
  ultrasonic_cleaners: { ja: `超音波洗浄機`, en: `` },
  other_cleaning_machines: { ja: `その他洗浄機`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 54, name: "powder_equipment" },
// ------------------------- 🌠54. 粉体機器 小分類 powder_equipment -------------------------
// 437から

/**
 * 【粉体機器】Powder Equipment
    粉砕機 → grinding_machines ✅crushers
    微粉砕機 → micro_grinding_machines ✅fine_crushers
    ふるい・振とう器 → sieves_shakers
    造粒装置 → granulating_devices ✅granulators
    粉体供給装置 → powder_feeding_devices ✅powder_feeders
    ホモジナイザー → homogenizers
    シェーカー → shakers
    粉体搬送装置 → powder_conveying_equipment ✅powder_conveyors
    その他粉体機器 → other_powder_equipment
 */

export const categoryS_powder_equipment_NameOnly: ProcessingMachineryProductCategoriesS_powder_equipment[] = [
  "crushers",
  "fine_crushers",
  "sieves_shakers",
  "granulators",
  "powder_feeders",
  "homogenizers",
  "shakers",
  "powder_conveyors",
  "other_powder_equipment",
];
export const categoryS_powder_equipment: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_powder_equipment;
}[] = [
  { id: 437, name: "crushers" },
  { id: 438, name: "fine_crushers" },
  { id: 439, name: "sieves_shakers" },
  { id: 440, name: "granulators" },
  { id: 441, name: "powder_feeders" },
  { id: 442, name: "homogenizers" },
  { id: 443, name: "shakers" },
  { id: 444, name: "powder_conveyors" },
  { id: 445, name: "other_powder_equipment" },
];
export const mappingCategoryS_powder_equipment: {
  [K in ProcessingMachineryProductCategoriesS_powder_equipment | string]: {
    [key: string]: string;
  };
} = {
  crushers: { ja: `粉砕機`, en: `` },
  fine_crushers: { ja: `微粉砕機`, en: `` },
  sieves_shakers: { ja: `ふるい・振とう器`, en: `` },
  granulators: { ja: `造粒装置`, en: `` },
  powder_feeders: { ja: `粉体供給装置`, en: `` },
  homogenizers: { ja: `ホモジナイザー`, en: `` },
  shakers: { ja: `シェーカー`, en: `` },
  powder_conveyors: { ja: `粉体搬送装置`, en: `` },
  other_powder_equipment: { ja: `その他粉体機器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 55, name: "heating_equipment_furnaces" },
// ------------------------- 🌠55. 加熱装置・炉 小分類 heating_equipment_furnaces -------------------------
// 446から

/**
 * 【加熱装置・炉】Heating Equipment & Furnaces
    加熱装置 → heating_devices ✅heating_equipment
    アルミヒータ → aluminum_heaters
    セラミックヒータ → ceramic_heaters
    シリコンヒータ → silicon_heaters
    その他ヒータ → other_heaters
    電気炉 → electric_furnaces
    工業炉 → industrial_furnaces
 */

export const categoryS_heating_equipment_furnaces_NameOnly: ProcessingMachineryProductCategoriesS_heating_equipment_furnaces[] =
  [
    "heating_equipment",
    "aluminum_heaters",
    "ceramic_heaters",
    "silicon_heaters",
    "other_heaters",
    "electric_furnaces",
    "industrial_furnaces",
  ];
export const categoryS_heating_equipment_furnaces: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_heating_equipment_furnaces;
}[] = [
  { id: 446, name: "heating_equipment" },
  { id: 447, name: "aluminum_heaters" },
  { id: 448, name: "ceramic_heaters" },
  { id: 449, name: "silicon_heaters" },
  { id: 450, name: "other_heaters" },
  { id: 451, name: "electric_furnaces" },
  { id: 452, name: "industrial_furnaces" },
];
export const mappingCategoryS_heating_equipment_furnaces: {
  [K in ProcessingMachineryProductCategoriesS_heating_equipment_furnaces | string]: {
    [key: string]: string;
  };
} = {
  heating_equipment: { ja: `加熱装置`, en: `` },
  aluminum_heaters: { ja: `アルミヒータ`, en: `` },
  ceramic_heaters: { ja: `セラミックヒータ`, en: `` },
  silicon_heaters: { ja: `シリコンヒータ`, en: `` },
  other_heaters: { ja: `その他ヒータ`, en: `` },
  electric_furnaces: { ja: `電気炉`, en: `` },
  industrial_furnaces: { ja: `工業炉`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 56, name: "surface_treatment_equipment" },
// ------------------------- 🌠56. 表面処理装置 小分類 surface_treatment_equipment -------------------------
// 453から

/**
 * 【表面処理装置】Surface Treatment Equipment
    めっき装置 → plating_devices ✅plating_equipment
    プラズマ表面処理装置 → plasma_surface_treatment_equipment
    表面処理受託サービス → surface_treatment_contracting_services ✅surface_treatment_services
    その他表面処理装置 → other_surface_treatment_equipment
 */

export const categoryS_surface_treatment_equipment_NameOnly: ProcessingMachineryProductCategoriesS_surface_treatment_equipment[] =
  [
    "plating_equipment",
    "plasma_surface_treatment_equipment",
    "surface_treatment_services",
    "other_surface_treatment_equipment",
  ];
export const categoryS_surface_treatment_equipment: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_surface_treatment_equipment;
}[] = [
  { id: 453, name: "plating_equipment" },
  { id: 454, name: "plasma_surface_treatment_equipment" },
  { id: 455, name: "surface_treatment_services" },
  { id: 456, name: "other_surface_treatment_equipment" },
];
export const mappingCategoryS_surface_treatment_equipment: {
  [K in ProcessingMachineryProductCategoriesS_surface_treatment_equipment | string]: {
    [key: string]: string;
  };
} = {
  plating_equipment: { ja: `めっき装置`, en: `` },
  plasma_surface_treatment_equipment: { ja: `プラズマ表面処理装置`, en: `` },
  surface_treatment_services: { ja: `表面処理受託サービス`, en: `` },
  other_surface_treatment_equipment: { ja: `その他表面処理装置`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 57, name: "laboratory_equipment_supplies" },
// ------------------------- 🌠57. 実験器具・消耗品 小分類 laboratory_equipment_supplies -------------------------
// 457から

/**
 * 【実験器具・消耗品】Laboratory Instruments & Supplies
    ガラス器具・容器 → glass_instruments_containers
    樹脂器具・容器 → plastic_instruments_containers
    ステンレス器具・容器 → stainless_instruments_containers ✅stainless_steel_instruments_containers
    その他実験器具・容器 → other_laboratory_instruments_containers
 */

export const categoryS_laboratory_equipment_supplies_NameOnly: ProcessingMachineryProductCategoriesS_laboratory_equipment_supplies[] =
  [
    "glass_instruments_containers",
    "plastic_instruments_containers",
    "stainless_instruments_containers",
    "other_laboratory_instruments_containers",
  ];
export const categoryS_laboratory_equipment_supplies: {
  id: number;
  name: ProcessingMachineryProductCategoriesS_laboratory_equipment_supplies;
}[] = [
  { id: 457, name: "glass_instruments_containers" },
  { id: 458, name: "plastic_instruments_containers" },
  { id: 459, name: "stainless_instruments_containers" },
  { id: 460, name: "other_laboratory_instruments_containers" },
];
export const mappingCategoryS_laboratory_equipment_supplies: {
  [K in ProcessingMachineryProductCategoriesS_laboratory_equipment_supplies | string]: {
    [key: string]: string;
  };
} = {
  glass_instruments_containers: { ja: `ガラス器具・容器`, en: `` },
  plastic_instruments_containers: { ja: `樹脂器具・容器`, en: `` },
  stainless_instruments_containers: { ja: `ステンレス器具・容器`, en: `` },
  other_laboratory_instruments_containers: { ja: `その他実験器具・容器`, en: `` },
};

// -------------------------------------------------------------------------------------
// =================== ✅「科学・理化学」 大分類 scientific_chemical_equipment の小分類関連✅ ここまで ===================

// =================== ✅「素材・材料」 大分類 materials の小分類関連✅ ここまで ===================
/**
 * export const materialCategoryM: { id: number; name: ProductCategoriesMediumMaterial }[] = [
  { id: 58, name: "metal_materials" },
  { id: 59, name: "polymer_materials" },
  { id: 60, name: "glass" },
  { id: 61, name: "ceramics" },
  { id: 62, name: "wood" },
  { id: 63, name: "paper_pulps" },
  { id: 64, name: "organic_natural_materials" },
  { id: 65, name: "chemicals" },
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
 */

// { id: 58, name: "metal_materials" },
// ------------------------- 🌠58. 金属材料 小分類 metal_materials -------------------------
// 461から

/**
 * 【金属材料】Metal Materials
    鉄鋼 → steel
    合金 → alloys
    特殊鋼 → special_steel
    非鉄金属 → non_ferrous_metals
    ステンレス → stainless_steel
    アルミニウム → aluminum
    レアメタル → rare_metals
    磁石 → magnets
    はんだ → solder ✅solders
    その他金属材料 → other_metal_materials
 */

export const categoryS_metal_materials_NameOnly: MaterialProductCategoriesS_metal_materials[] = [
  "steel",
  "alloys",
  "special_steel",
  "non_ferrous_metals",
  "stainless_steel",
  "aluminum",
  "rare_metals",
  "magnets",
  "solders",
  "other_metal_materials",
];
export const categoryS_metal_materials: {
  id: number;
  name: MaterialProductCategoriesS_metal_materials;
}[] = [
  { id: 461, name: "steel" },
  { id: 462, name: "alloys" },
  { id: 463, name: "special_steel" },
  { id: 464, name: "non_ferrous_metals" },
  { id: 465, name: "stainless_steel" },
  { id: 466, name: "aluminum" },
  { id: 467, name: "rare_metals" },
  { id: 468, name: "magnets" },
  { id: 469, name: "solders" },
  { id: 470, name: "other_metal_materials" },
];
export const mappingCategoryS_metal_materials: {
  [K in MaterialProductCategoriesS_metal_materials | string]: {
    [key: string]: string;
  };
} = {
  steel: { ja: `鉄鋼`, en: `` },
  alloys: { ja: `合金`, en: `` },
  special_steel: { ja: `特殊鋼`, en: `` },
  non_ferrous_metals: { ja: `非鉄金属`, en: `` },
  stainless_steel: { ja: `ステンレス`, en: `` },
  aluminum: { ja: `アルミニウム`, en: `` },
  rare_metals: { ja: `レアメタル`, en: `` },
  magnets: { ja: `磁石`, en: `` },
  solders: { ja: `はんだ`, en: `` },
  other_metal_materials: { ja: `その他金属材料`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 59, name: "polymer_materials" },
// ------------------------- 🌠59. 高分子材料 小分類 polymer_materials -------------------------
// 471から

/**
 * 【高分子材料】Polymer Materials
    プラスチック → plastics
    エンジニアリングプラスチック → engineering_plastics
    ゴム → rubber
    繊維 → fibers
    複合材料 → composite_materials
    その他高分子材料 → other_polymer_materials
 */

export const categoryS_polymer_materials_NameOnly: MaterialProductCategoriesS_polymer_materials[] = [
  "plastics",
  "engineering_plastics",
  "rubber",
  "fibers",
  "composite_materials",
  "other_polymer_materials",
];
export const categoryS_polymer_materials: {
  id: number;
  name: MaterialProductCategoriesS_polymer_materials;
}[] = [
  { id: 471, name: "plastics" },
  { id: 472, name: "engineering_plastics" },
  { id: 473, name: "rubber" },
  { id: 474, name: "fibers" },
  { id: 475, name: "composite_materials" },
  { id: 476, name: "other_polymer_materials" },
];
export const mappingCategoryS_polymer_materials: {
  [K in MaterialProductCategoriesS_polymer_materials | string]: {
    [key: string]: string;
  };
} = {
  plastics: { ja: `プラスチック`, en: `` },
  engineering_plastics: { ja: `エンジニアリングプラスチック`, en: `` },
  rubber: { ja: `ゴム`, en: `` },
  fibers: { ja: `繊維`, en: `` },
  composite_materials: { ja: `複合材料`, en: `` },
  other_polymer_materials: { ja: `その他高分子材料`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 60, name: "glass" },
// ------------------------- 🌠60. ガラス 小分類 glass -------------------------
// 477から

/**
 * 【ガラス】Glass
    ガラス → glass  
 */

export const categoryS_glass_NameOnly: MaterialProductCategoriesS_glass[] = ["glass"];
export const categoryS_glass: {
  id: number;
  name: MaterialProductCategoriesS_glass;
}[] = [{ id: 477, name: "glass" }];
export const mappingCategoryS_glass: {
  [K in MaterialProductCategoriesS_glass | string]: {
    [key: string]: string;
  };
} = {
  glass: { ja: `ガラス`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 61, name: "ceramics" },
// ------------------------- 🌠61. セラミックス 小分類 ceramics -------------------------
// 478から

/**
 * 【セラミックス】Ceramics
    セラミックス → ceramics
    ファインセラミックス → fine_ceramics  
 */

export const categoryS_ceramics_NameOnly: MaterialProductCategoriesS_ceramics[] = ["ceramics", "fine_ceramics"];
export const categoryS_ceramics: {
  id: number;
  name: MaterialProductCategoriesS_ceramics;
}[] = [
  { id: 478, name: "ceramics" },
  { id: 479, name: "fine_ceramics" },
];
export const mappingCategoryS_ceramics: {
  [K in MaterialProductCategoriesS_ceramics | string]: {
    [key: string]: string;
  };
} = {
  ceramics: { ja: `セラミックス`, en: `` },
  fine_ceramics: { ja: `ファインセラミックス`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 62, name: "wood" },
// ------------------------- 🌠62. 木材 小分類 wood -------------------------
// 480から

/**
 * 【木材】Wood
    木材 → wood
    木材加工品 → processed_wood_products
 */

export const categoryS_wood_NameOnly: MaterialProductCategoriesS_wood[] = ["wood", "processed_wood_products"];
export const categoryS_wood: {
  id: number;
  name: MaterialProductCategoriesS_wood;
}[] = [
  { id: 480, name: "wood" },
  { id: 481, name: "processed_wood_products" },
];
export const mappingCategoryS_wood: {
  [K in MaterialProductCategoriesS_wood | string]: {
    [key: string]: string;
  };
} = {
  wood: { ja: `木材`, en: `` },
  processed_wood_products: { ja: `木材加工品`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 63, name: "paper_pulps" },
// ------------------------- 🌠63. 紙・パルプ 小分類 paper_pulps -------------------------
// 482から

/**
 * 【紙・パルプ】Paper & Pulp
    紙・パルプ → paper_pulp
    紙・パルプ加工品 → processed_paper_pulp_products
 */

export const categoryS_paper_pulps_NameOnly: MaterialProductCategoriesS_paper_pulps[] = [
  "paper_pulp",
  "processed_paper_pulp_products",
];
export const categoryS_paper_pulps: {
  id: number;
  name: MaterialProductCategoriesS_paper_pulps;
}[] = [
  { id: 482, name: "paper_pulp" },
  { id: 483, name: "processed_paper_pulp_products" },
];
export const mappingCategoryS_paper_pulps: {
  [K in MaterialProductCategoriesS_paper_pulps | string]: {
    [key: string]: string;
  };
} = {
  paper_pulp: { ja: `紙・パルプ`, en: `` },
  processed_paper_pulp_products: { ja: `紙・パルプ加工品`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 64, name: "organic_natural_materials" },
// ------------------------- 🌠64. 有機天然材料 小分類 organic_natural_materials -------------------------
// 484から

/**
 * 【有機天然材料】Organic Natural Materials
    油脂 → fats_oils
    有機天然材料 → organic_natural_materials
 */

export const categoryS_organic_natural_materials_NameOnly: MaterialProductCategoriesS_organic_natural_materials[] = [
  "fats_oils",
  "organic_natural_materials",
];
export const categoryS_organic_natural_materials: {
  id: number;
  name: MaterialProductCategoriesS_organic_natural_materials;
}[] = [
  { id: 484, name: "fats_oils" },
  { id: 485, name: "organic_natural_materials" },
];
export const mappingCategoryS_organic_natural_materials: {
  [K in MaterialProductCategoriesS_organic_natural_materials | string]: {
    [key: string]: string;
  };
} = {
  fats_oils: { ja: `油脂`, en: `` },
  organic_natural_materials: { ja: `有機天然材料`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 65, name: "chemicals" },
// ------------------------- 🌠65. 薬品 小分類 chemicals -------------------------
// 486から

/**
 * 【薬品】Chemicals
  化学薬品 → chemicals✅chemical_products
 */

export const categoryS_chemicals_NameOnly: MaterialProductCategoriesS_chemicals[] = ["chemicals"];
export const categoryS_chemicals: {
  id: number;
  name: MaterialProductCategoriesS_chemicals;
}[] = [{ id: 486, name: "chemicals" }];
export const mappingCategoryS_chemicals: {
  [K in MaterialProductCategoriesS_chemicals | string]: {
    [key: string]: string;
  };
} = {
  chemicals: { ja: `化学薬品`, en: `` },
};

// -------------------------------------------------------------------------------------

// =================== ✅「素材・材料」 大分類 materials の小分類関連✅ ここまで ===================

// =================== ✅「測定・分析」 大分類 measurement_analysis の小分類関連✅ ===================
/**
 * export const analysisCategoryM: { id: number; name: ProductCategoriesMediumAnalysis }[] = [
  { id: 66, name: "distance_measuring_machine" },
  { id: 67, name: "weight_measuring_machine" },
  { id: 68, name: "electronic_measuring_machine" },
  { id: 69, name: "temperature_humidity_machine" },
  { id: 70, name: "electrical_machine" },
  { id: 71, name: "coordinate_measuring_machine" },
  { id: 72, name: "other_measuring_machine" },
  { id: 73, name: "testing_machine" },
  { id: 74, name: "inspection_machine" },
  { id: 75, name: "microscopes" },
  { id: 76, name: "recorders_loggers" },
  { id: 77, name: "analytical_machine" },
  { id: 78, name: "environmental_analysis_machine" },
  { id: 79, name: "contracted_services" },
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
 */

// { id: 66, name: "distance_measuring_machine" },
// ------------------------- 🌠66. 距離測定器 小分類 distance_measuring_machine -------------------------
// 487から

/**
 *【距離測定器】Distance Measuring Instruments
  距離関連測定器 → distance_related_measuring_instruments ✅distance_measuring_instruments
 */

export const categoryS_distance_measuring_machine_NameOnly: AnalysisProductCategoriesS_distance_measuring_machine[] = [
  "distance_measuring_instruments",
];
export const categoryS_distance_measuring_machine: {
  id: number;
  name: AnalysisProductCategoriesS_distance_measuring_machine;
}[] = [{ id: 487, name: "distance_measuring_instruments" }];
export const mappingCategoryS_distance_measuring_machine: {
  [K in AnalysisProductCategoriesS_distance_measuring_machine | string]: {
    [key: string]: string;
  };
} = {
  distance_measuring_instruments: { ja: `距離関連測定器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 67, name: "weight_measuring_machine" },
// ------------------------- 🌠67. 重量測定器 小分類 weight_measuring_machine -------------------------
// 488から

/**
 *【重量測定器】Weight Measuring Instruments
  重量関連測定器 → weight_related_measuring_instruments✅weight_measuring_instruments
  はかり → scales
  計量機 → weighing_machines
  その他重量測定器 → other_weight_measuring_instruments
 */

export const categoryS_weight_measuring_machine_NameOnly: AnalysisProductCategoriesS_weight_measuring_machine[] = [
  "weight_measuring_instruments",
  "scales",
  "weighing_machines",
  "other_weight_measuring_instruments",
];
export const categoryS_weight_measuring_machine: {
  id: number;
  name: AnalysisProductCategoriesS_weight_measuring_machine;
}[] = [
  { id: 489, name: "weight_measuring_instruments" },
  { id: 490, name: "scales" },
  { id: 491, name: "weighing_machines" },
  { id: 492, name: "other_weight_measuring_instruments" },
];
export const mappingCategoryS_weight_measuring_machine: {
  [K in AnalysisProductCategoriesS_weight_measuring_machine | string]: {
    [key: string]: string;
  };
} = {
  weight_measuring_instruments: { ja: `重量関連測定器`, en: `` },
  scales: { ja: `はかり`, en: `` },
  weighing_machines: { ja: `計量機`, en: `` },
  other_weight_measuring_instruments: { ja: `その他重量測定器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 68, name: "electronic_measuring_machine" },
// ------------------------- 🌠68. 電子計測器 小分類 electronic_measuring_machine -------------------------
// 493から

/**
 *【電子計測器】Electronic Measuring Instruments
  オシロスコープ → oscilloscopes
  ロジックアナライザ → logic_analyzers
  電圧計 → voltmeters
  電流計 → ampermeters✅ammeters
  電力計 → power_meters✅wattmeters
  LCRメータ → lcr_meters
  時間・周波数測定 → time_frequency_measurement_instruments✅time_frequency_measurement
  信号発生器 → signal_generators
  電源装置 → power_supplies
  電子負荷装置 → electronic_load_devices✅electronic_loads
  その他電子計測器 → other_electronic_measuring_instruments
  光学測定器 → optical_measuring_instruments
 */

export const categoryS_electronic_measuring_machine_NameOnly: AnalysisProductCategoriesS_electronic_measuring_machine[] =
  [
    "oscilloscopes",
    "logic_analyzers",
    "voltmeters",
    "ammeters",
    "power_meters",
    "lcr_meters",
    "time_frequency_measurement",
    "signal_generators",
    "power_supplies",
    "electronic_loads",
    "other_electronic_measuring_instruments",
    "optical_measuring_instruments",
  ];
export const categoryS_electronic_measuring_machine: {
  id: number;
  name: AnalysisProductCategoriesS_electronic_measuring_machine;
}[] = [
  { id: 493, name: "oscilloscopes" },
  { id: 494, name: "logic_analyzers" },
  { id: 495, name: "voltmeters" },
  { id: 496, name: "ammeters" },
  { id: 497, name: "power_meters" },
  { id: 498, name: "lcr_meters" },
  { id: 499, name: "time_frequency_measurement" },
  { id: 500, name: "signal_generators" },
  { id: 501, name: "power_supplies" },
  { id: 502, name: "electronic_loads" },
  { id: 503, name: "other_electronic_measuring_instruments" },
  { id: 504, name: "optical_measuring_instruments" },
];
export const mappingCategoryS_electronic_measuring_machine: {
  [K in AnalysisProductCategoriesS_electronic_measuring_machine | string]: {
    [key: string]: string;
  };
} = {
  oscilloscopes: { ja: `オシロスコープ`, en: `` },
  logic_analyzers: { ja: `ロジックアナライザ`, en: `` },
  voltmeters: { ja: `電圧計`, en: `` },
  ammeters: { ja: `電流計`, en: `` },
  power_meters: { ja: `電力計`, en: `` },
  lcr_meters: { ja: `LCRメータ`, en: `` },
  time_frequency_measurement: { ja: `時間・周波数測定`, en: `` },
  signal_generators: { ja: `信号発生器`, en: `` },
  power_supplies: { ja: `電源装置`, en: `` },
  electronic_loads: { ja: `電子負荷装置`, en: `` },
  other_electronic_measuring_instruments: { ja: `その他電子計測器`, en: `` },
  optical_measuring_instruments: { ja: `光学測定器`, en: `` },
};

/**
 *【電子計測器】Electronic Measuring Instruments
  オシロスコープ → oscilloscopes
  ロジックアナライザ → logic_analyzers
  電圧計 → voltmeters
  電流計 → ampermeters✅ammeters
  電力計 → power_meters✅wattmeters
  LCRメータ → lcr_meters
  時間・周波数測定 → time_frequency_measurement_instruments✅time_frequency_measurement
  信号発生器 → signal_generators
  電源装置 → power_supplies
  電子負荷装置 → electronic_load_devices✅electronic_loads
  その他電子計測器 → other_electronic_measuring_instruments
  光学測定器 → optical_measuring_instruments
 */

// -------------------------------------------------------------------------------------
// =================== ✅「測定・分析」 大分類 measurement_analysis の小分類関連✅ ここまで ===================
