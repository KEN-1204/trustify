// 電子部品 小分類

import {
  AnalysisProductCategoriesS_analytical_machine,
  ImageProcessingProductCategoriesS_barcode_readers,
  ImageProcessingProductCategoriesS_cameras,
  AnalysisProductCategoriesS_contracted_services,
  AnalysisProductCategoriesS_coordinate_measuring_machine,
  AnalysisProductCategoriesS_distance_measuring_machine,
  AnalysisProductCategoriesS_electrical_machine,
  AnalysisProductCategoriesS_electronic_measuring_machine,
  AnalysisProductCategoriesS_electronic_temperature_humidity_machine,
  AnalysisProductCategoriesS_environmental_analysis_machine,
  ImageProcessingProductCategoriesS_image_processing,
  AnalysisProductCategoriesS_inspection_machine,
  ImageProcessingProductCategoriesS_lenses,
  ImageProcessingProductCategoriesS_light_sources_lighting,
  AnalysisProductCategoriesS_microscopes,
  AnalysisProductCategoriesS_other_measuring_machine,
  AnalysisProductCategoriesS_recorders_loggers,
  ImageProcessingProductCategoriesS_security_surveillance_systems,
  AnalysisProductCategoriesS_testing_machine,
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
  ControlEquipmentProductCategoriesS_process_control_equipment,
  ControlEquipmentProductCategoriesS_fa_equipment,
  ControlEquipmentProductCategoriesS_safety_equipment,
  ControlEquipmentProductCategoriesS_environmental_equipment,
  ControlEquipmentProductCategoriesS_filters,
  ControlEquipmentProductCategoriesS_clean_rooms,
  ControlEquipmentProductCategoriesS_lighting,
  ControlEquipmentProductCategoriesS_air_conditioning_equipment,
  ControlEquipmentProductCategoriesS_water_treatment_equipment,
  ControlEquipmentProductCategoriesS_static_electricity_measures,
  ControlEquipmentProductCategoriesS_energy_equipment,
  ToolProductCategoriesS_cutting_tools,
  ToolProductCategoriesS_abrasives,
  ToolProductCategoriesS_hand_tools,
  ToolProductCategoriesS_power_pneumatic_tools,
  ToolProductCategoriesS_consumables,
  ToolProductCategoriesS_cleaning_tools,
  ToolProductCategoriesS_safety_hygiene_supplies,
  ToolProductCategoriesS_packaging_materials,
  ToolProductCategoriesS_supplies,
  ToolProductCategoriesS_storage_facilities,
  DesignProductCategoriesS_cad,
  DesignProductCategoriesS_cam,
  DesignProductCategoriesS_cae,
  DesignProductCategoriesS_prototype,
  DesignProductCategoriesS_contracted_services,
  ITProductCategoriesS_industrial_computers,
  ITProductCategoriesS_embedded_systems,
  ITProductCategoriesS_production_management,
  ITProductCategoriesS_information_systems,
  ITProductCategoriesS_network,
  ITProductCategoriesS_operating_systems,
  ITProductCategoriesS_servers,
  ITProductCategoriesS_security,
  ITProductCategoriesS_office_automation_equipment,
} from "@/types";
import { ITProductCategoriesS_core_systems } from "../types";

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

// -------------------------------------------------------------------------------------

// { id: 69, name: "temperature_humidity_machine" },
// ------------------------- 🌠69. 温湿度測定器 小分類 temperature_humidity_machine -------------------------
// 505から

/**
 *【温湿度測定器】Temperature and Humidity Measuring Instruments
  温湿度関連測定器 → temperature_humidity_related_measuring_instruments✅temperature_humidity_measuring_instruments
  サーモグラフィ → thermography_instruments✅thermography
  放射温度計 → radiation_thermometers
  温度計 → thermometers
  温湿度計 → hygrometers✅temperature_humidity_meters
  その他温湿度測定器 → other_temperature_humidity_measuring_instruments
 */

export const categoryS_temperature_humidity_machine_NameOnly: AnalysisProductCategoriesS_electronic_temperature_humidity_machine[] =
  [
    "temperature_humidity_measuring_instruments",
    "thermography",
    "radiation_thermometers",
    "thermometers",
    "temperature_humidity_meters",
    "other_temperature_humidity_measuring_instruments",
  ];
export const categoryS_temperature_humidity_machine: {
  id: number;
  name: AnalysisProductCategoriesS_electronic_temperature_humidity_machine;
}[] = [
  { id: 505, name: "temperature_humidity_measuring_instruments" },
  { id: 506, name: "thermography" },
  { id: 507, name: "radiation_thermometers" },
  { id: 508, name: "thermometers" },
  { id: 509, name: "temperature_humidity_meters" },
  { id: 510, name: "other_temperature_humidity_measuring_instruments" },
];
export const mappingCategoryS_temperature_humidity_machine: {
  [K in AnalysisProductCategoriesS_electronic_temperature_humidity_machine | string]: {
    [key: string]: string;
  };
} = {
  temperature_humidity_measuring_instruments: { ja: `温湿度関連測定器`, en: `` },
  thermography: { ja: `サーモグラフィ`, en: `` },
  radiation_thermometers: { ja: `放射温度計`, en: `` },
  thermometers: { ja: `温度計`, en: `` },
  temperature_humidity_meters: { ja: `温湿度計`, en: `` },
  other_temperature_humidity_measuring_instruments: { ja: `その他温湿度測定器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 70, name: "electrical_machine" },
// ------------------------- 🌠70. 電気計器・電位計 小分類 electrical_machine -------------------------
// 511から

/**
 *【電気計器・電位計】Electrical Instruments & Voltmeters
  電気計器・電位計 → electrical_instruments_voltmeters✅electrical_meters
  絶縁抵抗計 → insulation_resistance_meters
  EMC・静電気測定器 → emc_electrostatic_measuring_instruments✅emc_static_electricity_measuring_instruments
  その他電気計器 → other_electrical_instruments✅other_electrical_measuring_instruments
 */

export const categoryS_electrical_machine_NameOnly: AnalysisProductCategoriesS_electrical_machine[] = [
  "electrical_instruments_voltmeters",
  "insulation_resistance_meters",
  "emc_electrostatic_measuring_instruments",
  "other_electrical_measuring_instruments",
];
export const categoryS_electrical_machine: {
  id: number;
  name: AnalysisProductCategoriesS_electrical_machine;
}[] = [
  { id: 511, name: "electrical_instruments_voltmeters" },
  { id: 512, name: "insulation_resistance_meters" },
  { id: 513, name: "emc_electrostatic_measuring_instruments" },
  { id: 514, name: "other_electrical_measuring_instruments" },
];
export const mappingCategoryS_electrical_machine: {
  [K in AnalysisProductCategoriesS_electrical_machine | string]: {
    [key: string]: string;
  };
} = {
  electrical_instruments_voltmeters: { ja: `その他温湿度測定器`, en: `` },
  insulation_resistance_meters: { ja: `その他温湿度測定器`, en: `` },
  emc_electrostatic_measuring_instruments: { ja: `その他温湿度測定器`, en: `` },
  other_electrical_measuring_instruments: { ja: `その他温湿度測定器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 71, name: "coordinate_measuring_machine" },
// ------------------------- 🌠71. 3次元測定器 小分類 coordinate_measuring_machine -------------------------
// 515から

/**
 *【3次元測定器】Three-dimensional Measuring Instruments
  三次元測定機 → three_dimensional_measuring_machines✅coordinate_measuring_machine
 */

export const categoryS_coordinate_measuring_machine_NameOnly: AnalysisProductCategoriesS_coordinate_measuring_machine[] =
  ["coordinate_measuring_machine"];
export const categoryS_coordinate_measuring_machine: {
  id: number;
  name: AnalysisProductCategoriesS_coordinate_measuring_machine;
}[] = [{ id: 515, name: "coordinate_measuring_machine" }];
export const mappingCategoryS_coordinate_measuring_machine: {
  [K in AnalysisProductCategoriesS_coordinate_measuring_machine | string]: {
    [key: string]: string;
  };
} = {
  coordinate_measuring_machine: { ja: `三次元測定機`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 72, name: "other_measuring_machine" },
// ------------------------- 🌠72. その他計測器 小分類 other_measuring_machine -------------------------
// 516から

/**
 *【その他計測器】Other Measuring Instruments
  流量計 → flow_meters
  圧力計 → pressure_gauges
  パーティクルカウンター → particle_counters
  膜圧計 → diaphragm_pressure_gauges✅thickness_gauges
  粘度計 → viscometers
  トルク計 → torque_meters
  レベル計・レベルスイッチ → level_meters_level_switches✅level_meters_switches
  放射線測定器 → radiation_detectors✅radiation_measuring_instruments
  計数機 → counters
  その他計測・記録・測定器 → other_measurement_recording_devices✅other_measuring_recording_instruments
 */

export const categoryS_other_measuring_machine_NameOnly: AnalysisProductCategoriesS_other_measuring_machine[] = [
  "flow_meters",
  "pressure_gauges",
  "particle_counters",
  "diaphragm_pressure_gauges",
  "viscometers",
  "torque_meters",
  "level_meters_switches",
  "radiation_detectors",
  "counters",
  "other_measuring_recording_instruments",
];
export const categoryS_other_measuring_machine: {
  id: number;
  name: AnalysisProductCategoriesS_other_measuring_machine;
}[] = [
  { id: 516, name: "flow_meters" },
  { id: 517, name: "pressure_gauges" },
  { id: 518, name: "particle_counters" },
  { id: 519, name: "diaphragm_pressure_gauges" },
  { id: 520, name: "viscometers" },
  { id: 521, name: "torque_meters" },
  { id: 522, name: "level_meters_switches" },
  { id: 523, name: "radiation_detectors" },
  { id: 524, name: "counters" },
  { id: 525, name: "other_measuring_recording_instruments" },
];
export const mappingCategoryS_other_measuring_machine: {
  [K in AnalysisProductCategoriesS_other_measuring_machine | string]: {
    [key: string]: string;
  };
} = {
  flow_meters: { ja: `流量計`, en: `` },
  pressure_gauges: { ja: `圧力計`, en: `` },
  particle_counters: { ja: `パーティクルカウンター`, en: `` },
  diaphragm_pressure_gauges: { ja: `膜圧計`, en: `` },
  viscometers: { ja: `粘度計`, en: `` },
  torque_meters: { ja: `トルク計`, en: `` },
  level_meters_switches: { ja: `レベル計・レベルスイッチ`, en: `` },
  radiation_detectors: { ja: `放射線測定器`, en: `` },
  counters: { ja: `計数機`, en: `` },
  other_measuring_recording_instruments: { ja: `その他計測・記録・測定器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 73, name: "testing_machine" },
// ------------------------- 🌠73. 試験機器・装置 小分類 testing_machine -------------------------
// 526から

/**
 *【試験機器・装置】Testing Equipment and Devices
  試験機器・装置 → testing_equipment_devices✅testing_equipment
  恒温槽 → constant_temperature_baths✅constant_temperature_chambers
  振動試験 → vibration_tests✅vibration_testing
  深傷試験 → deep_scratch_tests✅hardness_testing
  強度試験装置 → strength_testing_equipment
  衝撃試験 → impact_tests✅impact_testing
  リーク試験装置 → leak_testing_equipment
  耐候試験 → weather_resistance_tests✅耐候試験 - weather_resistance_testing
  EMC試験 → emc_tests✅emc_testing
  環境試験装置 → environmental_testing_equipment
 */

export const categoryS_testing_machine_NameOnly: AnalysisProductCategoriesS_testing_machine[] = [
  "testing_equipment",
  "constant_temperature_chambers",
  "vibration_test",
  "deep_scratch_test",
  "strength_testing_equipment",
  "impact_test",
  "leak_testing_equipment",
  "weather_resistance_test",
  "emc_test",
  "environmental_testing_equipment",
];
export const categoryS_testing_machine: {
  id: number;
  name: AnalysisProductCategoriesS_testing_machine;
}[] = [
  { id: 526, name: "testing_equipment" },
  { id: 527, name: "constant_temperature_chambers" },
  { id: 528, name: "vibration_test" },
  { id: 529, name: "deep_scratch_test" },
  { id: 530, name: "strength_testing_equipment" },
  { id: 531, name: "impact_test" },
  { id: 532, name: "leak_testing_equipment" },
  { id: 533, name: "weather_resistance_test" },
  { id: 534, name: "emc_test" },
  { id: 535, name: "environmental_testing_equipment" },
];
export const mappingCategoryS_testing_machine: {
  [K in AnalysisProductCategoriesS_testing_machine | string]: {
    [key: string]: string;
  };
} = {
  testing_equipment: { ja: `試験機器・装置`, en: `` },
  constant_temperature_chambers: { ja: `恒温槽`, en: `` },
  vibration_test: { ja: `振動試験`, en: `` },
  deep_scratch_test: { ja: `深傷試験`, en: `` },
  strength_testing_equipment: { ja: `強度試験装置`, en: `` },
  impact_test: { ja: `衝撃試験`, en: `` },
  leak_testing_equipment: { ja: `リーク試験装置`, en: `` },
  weather_resistance_test: { ja: `耐候試験`, en: `` },
  emc_test: { ja: `EMC試験`, en: `` },
  environmental_testing_equipment: { ja: `環境試験装置`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 74, name: "inspection_machine" },
// ------------------------- 🌠74. 検査機器・装置 小分類 inspection_machine -------------------------
// 536から

/**
 *【検査機器・装置】Inspection Equipment and Devices
  その他検査機器・装置 → other_inspection_equipment_devices✅other_inspection_equipment
  X線検査装置 → x_ray_inspection_equipment
  外観検査装置 → appearance_inspection_equipment✅visual_inspection_equipment
  欠陥検査装置 → defect_inspection_equipment
  プローブ → probes
  評価ボード → evaluation_boards
  基盤検査装置 → circuit_board_inspection_equipment✅pcb_inspection_equipment
 */

export const categoryS_inspection_machine_NameOnly: AnalysisProductCategoriesS_inspection_machine[] = [
  "other_inspection_equipment",
  "x_ray_inspection_equipment",
  "visual_inspection_equipment",
  "defect_inspection_equipment",
  "probes",
  "evaluation_boards",
  "pcb_inspection_equipment",
];
export const categoryS_inspection_machine: {
  id: number;
  name: AnalysisProductCategoriesS_inspection_machine;
}[] = [
  { id: 536, name: "other_inspection_equipment" },
  { id: 537, name: "x_ray_inspection_equipment" },
  { id: 538, name: "visual_inspection_equipment" },
  { id: 539, name: "defect_inspection_equipment" },
  { id: 540, name: "probes" },
  { id: 541, name: "evaluation_boards" },
  { id: 542, name: "pcb_inspection_equipment" },
];
export const mappingCategoryS_inspection_machine: {
  [K in AnalysisProductCategoriesS_inspection_machine | string]: {
    [key: string]: string;
  };
} = {
  other_inspection_equipment: { ja: `その他検査機器・装置`, en: `` },
  x_ray_inspection_equipment: { ja: `X線検査装置`, en: `` },
  visual_inspection_equipment: { ja: `外観検査装置`, en: `` },
  defect_inspection_equipment: { ja: `欠陥検査装置`, en: `` },
  probes: { ja: `プローブ`, en: `` },
  evaluation_boards: { ja: `評価ボード`, en: `` },
  pcb_inspection_equipment: { ja: `基盤検査装置`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 75, name: "microscopes" },
// ------------------------- 🌠75. 顕微鏡・マイクロスコープ 小分類 microscopes -------------------------
// 543から

/**
 *【顕微鏡・マイクロスコープ】Microscopes
  光学顕微鏡 → optical_microscopes
  電子顕微鏡 → electron_microscopes
  レーザー顕微鏡 → laser_microscopes
  工業用内視鏡 → industrial_endoscopes
  その他顕微鏡・マイクロスコープ → other_microscopes
 */

export const categoryS_microscopes_NameOnly: AnalysisProductCategoriesS_microscopes[] = [
  "optical_microscopes",
  "electron_microscopes",
  "laser_microscopes",
  "industrial_endoscopes",
  "other_microscopes",
];
export const categoryS_microscopes: {
  id: number;
  name: AnalysisProductCategoriesS_microscopes;
}[] = [
  { id: 543, name: "optical_microscopes" },
  { id: 544, name: "electron_microscopes" },
  { id: 545, name: "laser_microscopes" },
  { id: 546, name: "industrial_endoscopes" },
  { id: 547, name: "other_microscopes" },
];
export const mappingCategoryS_microscopes: {
  [K in AnalysisProductCategoriesS_microscopes | string]: {
    [key: string]: string;
  };
} = {
  optical_microscopes: { ja: `基盤検査装置`, en: `` },
  electron_microscopes: { ja: `基盤検査装置`, en: `` },
  laser_microscopes: { ja: `基盤検査装置`, en: `` },
  industrial_endoscopes: { ja: `基盤検査装置`, en: `` },
  other_microscopes: { ja: `基盤検査装置`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 76, name: "recorders_loggers" },
// ------------------------- 🌠76. 記録計・ロガー 小分類 recorders_loggers -------------------------
// 548から

/**
 *【記録計・ロガー】Recorders and Loggers
  データロガー → data_loggers
  記録計・レコーダ → recorders
 */

export const categoryS_recorders_loggers_NameOnly: AnalysisProductCategoriesS_recorders_loggers[] = [
  "data_loggers",
  "recorders",
];
export const categoryS_recorders_loggers: {
  id: number;
  name: AnalysisProductCategoriesS_recorders_loggers;
}[] = [
  { id: 548, name: "data_loggers" },
  { id: 549, name: "recorders" },
];
export const mappingCategoryS_recorders_loggers: {
  [K in AnalysisProductCategoriesS_recorders_loggers | string]: {
    [key: string]: string;
  };
} = {
  data_loggers: { ja: `データロガー`, en: `` },
  recorders: { ja: `記録計・レコーダ`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 77, name: "analytical_machine" },
// ------------------------- 🌠77. 分析機器 小分類 analytical_machine -------------------------
// 550から

/**
 *【分析機器】Analytical Instruments
  分析機器・装置 → analytical_instruments_devices✅analytical_equipment
  蛍光X線分析装置 → fluorescent_x_ray_analysis_equipment✅xrf_analyzers
  分光分析装置 → spectroscopy_analysis_equipment✅spectral_analyzers
 */

export const categoryS_analytical_machine_NameOnly: AnalysisProductCategoriesS_analytical_machine[] = [
  "analytical_equipment",
  "xrf_analyzers",
  "spectral_analyzers",
];
export const categoryS_analytical_machine: {
  id: number;
  name: AnalysisProductCategoriesS_analytical_machine;
}[] = [
  { id: 550, name: "analytical_equipment" },
  { id: 551, name: "xrf_analyzers" },
  { id: 552, name: "spectral_analyzers" },
];
export const mappingCategoryS_analytical_machine: {
  [K in AnalysisProductCategoriesS_analytical_machine | string]: {
    [key: string]: string;
  };
} = {
  analytical_equipment: { ja: `分析機器・装置`, en: `` },
  xrf_analyzers: { ja: `蛍光X線分析装置`, en: `` },
  spectral_analyzers: { ja: `分光分析装置`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 78, name: "environmental_analysis_machine" },
// ------------------------- 🌠78. 環境分析機器 小分類 environmental_analysis_machine -------------------------
// 553から

/**
 *【環境分析機器】Environmental Analysis Equipment
  風速・風量計 → wind_speed_volume_meters✅anemometers
  水質検査 → water_quality_testing
  土壌検査 → soil_testing
  騒音検査 → noise_testing
  振動検査 → vibration_testing
  悪臭検査 → odor_testing
  その他環境分析機器 → other_environmental_analysis_instruments✅other_environmental_analysis_equipment
 */

export const categoryS_environmental_analysis_machine_NameOnly: AnalysisProductCategoriesS_environmental_analysis_machine[] =
  [
    "anemometers",
    "water_quality_testing",
    "soil_testing",
    "noise_testing",
    "vibration_testing",
    "odor_testing",
    "other_environmental_analysis_equipment",
  ];
export const categoryS_environmental_analysis_machine: {
  id: number;
  name: AnalysisProductCategoriesS_environmental_analysis_machine;
}[] = [
  { id: 553, name: "anemometers" },
  { id: 554, name: "water_quality_testing" },
  { id: 555, name: "soil_testing" },
  { id: 556, name: "noise_testing" },
  { id: 557, name: "vibration_testing" },
  { id: 558, name: "odor_testing" },
  { id: 559, name: "other_environmental_analysis_equipment" },
];
export const mappingCategoryS_environmental_analysis_machine: {
  [K in AnalysisProductCategoriesS_environmental_analysis_machine | string]: {
    [key: string]: string;
  };
} = {
  anemometers: { ja: `風速・風量計`, en: `` },
  water_quality_testing: { ja: `水質検査`, en: `` },
  soil_testing: { ja: `土壌検査`, en: `` },
  noise_testing: { ja: `騒音検査`, en: `` },
  vibration_testing: { ja: `振動検査`, en: `` },
  odor_testing: { ja: `悪臭検査`, en: `` },
  other_environmental_analysis_equipment: { ja: `その他環境分析機器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 79, name: "contracted_services" },
// ------------------------- 🌠79. 受託サービス 小分類 contracted_services -------------------------
// 560から

/**
 *【受託サービス】Contracted Services
  受託解析 → contracted_analysis
  受託測定 → contracted_measurement
  受託検査 → contracted_inspection
 */

export const categoryS_contracted_services_analysis_NameOnly: AnalysisProductCategoriesS_contracted_services[] = [
  "contracted_analysis",
  "contracted_measurement",
  "contracted_inspection",
];
export const categoryS_contracted_services_analysis: {
  id: number;
  name: AnalysisProductCategoriesS_contracted_services;
}[] = [
  { id: 560, name: "contracted_analysis" },
  { id: 561, name: "contracted_measurement" },
  { id: 562, name: "contracted_inspection" },
];
export const mappingCategoryS_contracted_services_analysis: {
  [K in AnalysisProductCategoriesS_contracted_services | string]: {
    [key: string]: string;
  };
} = {
  contracted_analysis: { ja: `受託解析`, en: `` },
  contracted_measurement: { ja: `受託測定`, en: `` },
  contracted_inspection: { ja: `受託検査`, en: `` },
};

// -------------------------------------------------------------------------------------
// =================== ✅「測定・分析」 大分類 measurement_analysis の小分類関連✅ ここまで ===================

// =================== ✅「画像処理」 大分類 image_processing の小分類関連✅ ===================
/**
 * export const imageProcessingCategoryM: { id: number; name: ProductCategoriesMediumImageProcessing }[] = [
  { id: 80, name: "cameras" },
  { id: 81, name: "lenses" },
  { id: 82, name: "light_sources_lighting" },
  { id: 83, name: "image_processing" },
  { id: 84, name: "security_surveillance_systems" },
  { id: 85, name: "barcode_readers" },
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
 */

// { id: 80, name: "cameras" },
// ------------------------- 🌠80. カメラ 小分類 cameras -------------------------
// 563から

/**
 *【カメラ】Cameras
  カラーカメラ → color_cameras
  モノクロカメラ → monochrome_cameras
  ハイスピードカメラ → high_speed_cameras
 */

export const categoryS_cameras_NameOnly: ImageProcessingProductCategoriesS_cameras[] = [
  "color_cameras",
  "monochrome_cameras",
  "high_speed_cameras",
];
export const categoryS_cameras: {
  id: number;
  name: ImageProcessingProductCategoriesS_cameras;
}[] = [
  { id: 563, name: "color_cameras" },
  { id: 564, name: "monochrome_cameras" },
  { id: 565, name: "high_speed_cameras" },
];
export const mappingCategoryS_cameras: {
  [K in ImageProcessingProductCategoriesS_cameras | string]: {
    [key: string]: string;
  };
} = {
  color_cameras: { ja: `カラーカメラ`, en: `` },
  monochrome_cameras: { ja: `モノクロカメラ`, en: `` },
  high_speed_cameras: { ja: `ハイスピードカメラ`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 81, name: "lenses" },
// ------------------------- 🌠81. レンズ 小分類 lenses -------------------------
// 566から

/**
 *【レンズ】Lenses
  レンズ → lenses
 */

export const categoryS_lenses_NameOnly: ImageProcessingProductCategoriesS_lenses[] = ["lenses"];
export const categoryS_lenses: {
  id: number;
  name: ImageProcessingProductCategoriesS_lenses;
}[] = [{ id: 566, name: "lenses" }];
export const mappingCategoryS_lenses: {
  [K in ImageProcessingProductCategoriesS_lenses | string]: {
    [key: string]: string;
  };
} = {
  lenses: { ja: `レンズ`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 82, name: "light_sources_lighting" },
// ------------------------- 🌠82. 光源・照明 小分類 light_sources_lighting -------------------------
// 567から

/**
 *【光源・照明】Light Sources & Lighting
  画像処理用照明 → image_processing_lights✅illumination_for_image_processing
  その他照明機器 → other_lighting_equipment
 */

export const categoryS_light_sources_lighting_NameOnly: ImageProcessingProductCategoriesS_light_sources_lighting[] = [
  "image_processing_lights",
  "other_lighting_equipment",
];
export const categoryS_light_sources_lighting: {
  id: number;
  name: ImageProcessingProductCategoriesS_light_sources_lighting;
}[] = [
  { id: 567, name: "image_processing_lights" },
  { id: 568, name: "other_lighting_equipment" },
];
export const mappingCategoryS_light_sources_lighting: {
  [K in ImageProcessingProductCategoriesS_light_sources_lighting | string]: {
    [key: string]: string;
  };
} = {
  image_processing_lights: { ja: `画像処理用照明`, en: `` },
  other_lighting_equipment: { ja: `その他照明機器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 83, name: "image_processing" },
// ------------------------- 🌠83. 画像処理 小分類 image_processing -------------------------
// 569から

/**
 *【画像処理】image_processing
  画像入力ボード → image_input_boards
  画像処理ボード → image_processing_boards
  画像処理ソフト → image_processing_software
  画像処理機器 → image_processing_equipment
  画像解析ソフト → image_analysis_software
  エンコーダ・デコーダ → encoders_decoders
  ビデオレコーダ → video_recorders
  画像伝送機器 → image_transmission_equipment
  バーチャルリアリティ関連 → virtual_reality_related
  その他画像関連機器 → other_image_related_equipment
 */

export const categoryS_image_processing_NameOnly: ImageProcessingProductCategoriesS_image_processing[] = [
  "image_input_boards",
  "image_processing_boards",
  "image_processing_software",
  "image_processing_equipment",
  "image_analysis_software",
  "encoders_decoders",
  "video_recorders",
  "image_transmission_equipment",
  "virtual_reality_related",
  "other_image_related_equipment",
];
export const categoryS_image_processing: {
  id: number;
  name: ImageProcessingProductCategoriesS_image_processing;
}[] = [
  { id: 569, name: "image_input_boards" },
  { id: 570, name: "image_processing_boards" },
  { id: 571, name: "image_processing_software" },
  { id: 572, name: "image_processing_equipment" },
  { id: 573, name: "image_analysis_software" },
  { id: 574, name: "encoders_decoders" },
  { id: 575, name: "video_recorders" },
  { id: 576, name: "image_transmission_equipment" },
  { id: 577, name: "virtual_reality_related" },
  { id: 578, name: "other_image_related_equipment" },
];
export const mappingCategoryS_image_processing: {
  [K in ImageProcessingProductCategoriesS_image_processing | string]: {
    [key: string]: string;
  };
} = {
  image_input_boards: { ja: `画像入力ボード`, en: `` },
  image_processing_boards: { ja: `画像処理ボード`, en: `` },
  image_processing_software: { ja: `画像処理ソフト`, en: `` },
  image_processing_equipment: { ja: `画像処理機器`, en: `` },
  image_analysis_software: { ja: `画像解析ソフト`, en: `` },
  encoders_decoders: { ja: `エンコーダ・デコーダ`, en: `` },
  video_recorders: { ja: `ビデオレコーダ`, en: `` },
  image_transmission_equipment: { ja: `画像伝送機器`, en: `` },
  virtual_reality_related: { ja: `バーチャルリアリティ関連`, en: `` },
  other_image_related_equipment: { ja: `その他画像関連機器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 84, name: "security_surveillance_systems" },
// ------------------------- 🌠84. セキュリティ・監視システム 小分類 security_surveillance_systems -------------------------
// 579から

/**
 *【セキュリティ・監視システム】Security & Surveillance Systems
  監視カメラ → surveillance_cameras
  監視カメラシステム → surveillance_camera_systems
  その他セキュリティ・監視システム → other_security_surveillance_systems
 */

export const categoryS_security_surveillance_systems_NameOnly: ImageProcessingProductCategoriesS_security_surveillance_systems[] =
  ["surveillance_cameras", "surveillance_camera_systems", "other_security_surveillance_systems"];
export const categoryS_security_surveillance_systems: {
  id: number;
  name: ImageProcessingProductCategoriesS_security_surveillance_systems;
}[] = [
  { id: 579, name: "surveillance_cameras" },
  { id: 580, name: "surveillance_camera_systems" },
  { id: 581, name: "other_security_surveillance_systems" },
];
export const mappingCategoryS_security_surveillance_systems: {
  [K in ImageProcessingProductCategoriesS_security_surveillance_systems | string]: {
    [key: string]: string;
  };
} = {
  surveillance_cameras: { ja: `監視カメラ`, en: `` },
  surveillance_camera_systems: { ja: `監視カメラシステム`, en: `` },
  other_security_surveillance_systems: { ja: `その他セキュリティ・監視システム`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 85, name: "barcode_readers" },
// ------------------------- 🌠85. バーコードリーダー 小分類 barcode_readers -------------------------
// 582から

/**
 *【バーコードリーダー】Barcode Readers
  固定式バーコードリーダ → fixed_barcode_readers
  ハンディ式バーコードリーダ → handheld_barcode_readers
  2次元コードリーダ → two_dimensional_code_readers✅2d_code_readers
  その他コードリーダ → other_code_readers
  ICタグリーダ・ライタ → ic_tag_readers_writers
 */

export const categoryS_barcode_readers_NameOnly: ImageProcessingProductCategoriesS_barcode_readers[] = [
  "fixed_barcode_readers",
  "handheld_barcode_readers",
  "two_dimensional_code_readers",
  "other_code_readers",
  "ic_tag_readers_writers",
];
export const categoryS_barcode_readers: {
  id: number;
  name: ImageProcessingProductCategoriesS_barcode_readers;
}[] = [
  { id: 582, name: "fixed_barcode_readers" },
  { id: 583, name: "handheld_barcode_readers" },
  { id: 584, name: "two_dimensional_code_readers" },
  { id: 585, name: "other_code_readers" },
  { id: 586, name: "ic_tag_readers_writers" },
];
export const mappingCategoryS_barcode_readers: {
  [K in ImageProcessingProductCategoriesS_barcode_readers | string]: {
    [key: string]: string;
  };
} = {
  fixed_barcode_readers: { ja: `固定式バーコードリーダ`, en: `` },
  handheld_barcode_readers: { ja: `ハンディ式バーコードリーダ`, en: `` },
  two_dimensional_code_readers: { ja: `2次元コードリーダ`, en: `` },
  other_code_readers: { ja: `その他コードリーダ`, en: `` },
  ic_tag_readers_writers: { ja: `ICタグリーダ・ライタ`, en: `` },
};

// -------------------------------------------------------------------------------------

// =================== ✅「画像処理」 大分類 image_processing の小分類関連✅ ここまで ===================

// =================== ✅「制御・電機機器」 大分類 control_electrical_equipment の小分類関連✅ ===================
/**
 * export const controlEquipmentCategoryM: { id: number; name: ProductCategoriesMediumControlEquipment }[] = [
  { id: 86, name: "process_control_equipment" },
  { id: 87, name: "fa_equipment" },
  { id: 88, name: "safety_equipment" },
  { id: 89, name: "environmental_equipment" },
  { id: 90, name: "filters" },
  { id: 91, name: "clean_rooms" },
  { id: 92, name: "lighting" },
  { id: 93, name: "air_conditioning_equipment" },
  { id: 94, name: "water_treatment_equipment" },
  { id: 95, name: "static_electricity_measures" },
  { id: 96, name: "energy_equipment" },
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
 */

// { id: 86, name: "process_control_equipment" },
// ------------------------- 🌠86. プロセス制御機器 小分類 process_control_equipment -------------------------
// 587から

/**
 *【プロセス制御機器】Process Control Equipment
  流量制御 → flow_control
  圧力制御 → pressure_control
  温湿度制御 → temperature_humidity_control
  液面制御・レベルスイッチ → liquid_level_control_level_switches
  計量制御 → measurement_control✅weighing_control
  遠隔制御 → remote_control
  計装制御システム → instrumentation_control_systems
  トルク制御 → torque_control
  振動監視 → vibration_monitoring
  その他プロセス制御 → other_process_control
 */

export const categoryS_process_control_equipment_NameOnly: ControlEquipmentProductCategoriesS_process_control_equipment[] =
  [
    "flow_control",
    "pressure_control",
    "temperature_humidity_control",
    "liquid_level_control_level_switches",
    "weighing_control",
    "remote_control",
    "instrumentation_control_systems",
    "torque_control",
    "vibration_monitoring",
    "other_process_control",
  ];
export const categoryS_process_control_equipment: {
  id: number;
  name: ControlEquipmentProductCategoriesS_process_control_equipment;
}[] = [
  { id: 587, name: "flow_control" },
  { id: 588, name: "pressure_control" },
  { id: 589, name: "temperature_humidity_control" },
  { id: 590, name: "liquid_level_control_level_switches" },
  { id: 591, name: "weighing_control" },
  { id: 592, name: "remote_control" },
  { id: 593, name: "instrumentation_control_systems" },
  { id: 594, name: "torque_control" },
  { id: 595, name: "vibration_monitoring" },
  { id: 596, name: "other_process_control" },
];
export const mappingCategoryS_process_control_equipment: {
  [K in ControlEquipmentProductCategoriesS_process_control_equipment | string]: {
    [key: string]: string;
  };
} = {
  flow_control: { ja: `流量制御`, en: `` },
  pressure_control: { ja: `圧力制御`, en: `` },
  temperature_humidity_control: { ja: `温湿度制御`, en: `` },
  liquid_level_control_level_switches: { ja: `液面制御・レベルスイッチ`, en: `` },
  weighing_control: { ja: `計量制御`, en: `` },
  remote_control: { ja: `遠隔制御`, en: `` },
  instrumentation_control_systems: { ja: `計装制御システム`, en: `` },
  torque_control: { ja: `トルク制御`, en: `` },
  vibration_monitoring: { ja: `振動監視`, en: `` },
  other_process_control: { ja: `その他プロセス制御`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 87, name: "fa_equipment" },
// ------------------------- 🌠87. FA機器 小分類 fa_equipment -------------------------
// 597から

/**
 *【FA機器】Factory Automation Equipment
  PLC → plc
  コントローラ → controllers
  NC装置 → nc_devices✅nc_equipment
  表示器 → displays
  サーボ → servos
  インバータ → inverters
  リレー → relays
  タイマー → timers
  カウンタ → counters
  スイッチ → switches
  センサ → sensors
  電源 → power_supplies
  トランス・変圧器 → transformers
  制御盤 → control_panels
  分電器 → distribution_boards
  キャビネット・ボックス → cabinets_boxes
  ラック → racks
  その他ボックス → other_boxes
  コネクタ → connectors
  端子台 → terminal_blocks
  盤用部材 → panel_components
  その他FA機器 → other_fa_equipment
 */

export const categoryS_fa_equipment_NameOnly: ControlEquipmentProductCategoriesS_fa_equipment[] = [
  "plc",
  "controllers",
  "nc_equipment",
  "displays",
  "servos",
  "inverters",
  "relays",
  "timers",
  "counters",
  "switches",
  "sensors",
  "power_supplies",
  "transformers",
  "control_panels",
  "distribution_boards",
  "cabinets_boxes",
  "racks",
  "other_boxes",
  "connectors",
  "terminal_blocks",
  "panel_components",
  "other_fa_equipment",
];
export const categoryS_fa_equipment: {
  id: number;
  name: ControlEquipmentProductCategoriesS_fa_equipment;
}[] = [
  { id: 597, name: "plc" },
  { id: 598, name: "controllers" },
  { id: 599, name: "nc_equipment" },
  { id: 600, name: "displays" },
  { id: 601, name: "servos" },
  { id: 602, name: "inverters" },
  { id: 603, name: "relays" },
  { id: 604, name: "timers" },
  { id: 605, name: "counters" },
  { id: 606, name: "switches" },
  { id: 607, name: "sensors" },
  { id: 608, name: "power_supplies" },
  { id: 609, name: "transformers" },
  { id: 610, name: "control_panels" },
  { id: 611, name: "distribution_boards" },
  { id: 612, name: "cabinets_boxes" },
  { id: 613, name: "racks" },
  { id: 614, name: "other_boxes" },
  { id: 615, name: "connectors" },
  { id: 616, name: "terminal_blocks" },
  { id: 617, name: "panel_components" },
  { id: 618, name: "other_fa_equipment" },
];
export const mappingCategoryS_fa_equipment: {
  [K in ControlEquipmentProductCategoriesS_fa_equipment | string]: {
    [key: string]: string;
  };
} = {
  plc: { ja: `PLC`, en: `` },
  controllers: { ja: `コントローラ`, en: `` },
  nc_equipment: { ja: `NC装置`, en: `` },
  displays: { ja: `表示器`, en: `` },
  servos: { ja: `サーボ`, en: `` },
  inverters: { ja: `インバータ`, en: `` },
  relays: { ja: `リレー`, en: `` },
  timers: { ja: `タイマー`, en: `` },
  counters: { ja: `カウンタ`, en: `` },
  switches: { ja: `スイッチ`, en: `` },
  sensors: { ja: `センサ`, en: `` },
  power_supplies: { ja: `電源`, en: `` },
  transformers: { ja: `トランス・変圧器`, en: `` },
  control_panels: { ja: `制御盤`, en: `` },
  distribution_boards: { ja: `分電器`, en: `` },
  cabinets_boxes: { ja: `キャビネット・ボックス`, en: `` },
  racks: { ja: `ラック`, en: `` },
  other_boxes: { ja: `その他ボックス`, en: `` },
  connectors: { ja: `コネクタ`, en: `` },
  terminal_blocks: { ja: `端子台`, en: `` },
  panel_components: { ja: `盤用部材`, en: `` },
  other_fa_equipment: { ja: `その他FA機器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 88, name: "safety_equipment" },
// ------------------------- 🌠88. 安全機器 小分類 safety_equipment -------------------------
// 619から

/**
 *【安全機器】Safety Equipment
  表示灯 → indicator_lights
  ライトカーテン → light_curtains
  エリアセンサ → area_sensors
  安全コントローラ → safety_controllers
  安全スイッチ → safety_switches
  安全ドアスイッチ → safety_door_switches
  安全センサ → safety_sensors
  安全リレー → safety_relays
  信号灯・回転灯 → signal_lights_rotating_lights
  遮断器・開閉器 → circuit_breakers_switches
  その他安全機器 → other_safety_equipment
 */

export const categoryS_safety_equipment_NameOnly: ControlEquipmentProductCategoriesS_safety_equipment[] = [
  "indicator_lights",
  "light_curtains",
  "area_sensors",
  "safety_controllers",
  "safety_switches",
  "safety_door_switches",
  "safety_sensors",
  "safety_relays",
  "signal_lights_rotating_lights",
  "circuit_breakers_switches",
  "other_safety_equipment",
];
export const categoryS_safety_equipment: {
  id: number;
  name: ControlEquipmentProductCategoriesS_safety_equipment;
}[] = [
  { id: 619, name: "indicator_lights" },
  { id: 620, name: "light_curtains" },
  { id: 621, name: "area_sensors" },
  { id: 622, name: "safety_controllers" },
  { id: 623, name: "safety_switches" },
  { id: 624, name: "safety_door_switches" },
  { id: 625, name: "safety_sensors" },
  { id: 626, name: "safety_relays" },
  { id: 627, name: "signal_lights_rotating_lights" },
  { id: 628, name: "circuit_breakers_switches" },
  { id: 629, name: "other_safety_equipment" },
];
export const mappingCategoryS_safety_equipment: {
  [K in ControlEquipmentProductCategoriesS_safety_equipment | string]: {
    [key: string]: string;
  };
} = {
  indicator_lights: { ja: `表示灯`, en: `` },
  light_curtains: { ja: `ライトカーテン`, en: `` },
  area_sensors: { ja: `エリアセンサ`, en: `` },
  safety_controllers: { ja: `安全コントローラ`, en: `` },
  safety_switches: { ja: `安全スイッチ`, en: `` },
  safety_door_switches: { ja: `安全ドアスイッチ`, en: `` },
  safety_sensors: { ja: `安全センサ`, en: `` },
  safety_relays: { ja: `安全リレー`, en: `` },
  signal_lights_rotating_lights: { ja: `信号灯・回転灯`, en: `` },
  circuit_breakers_switches: { ja: `遮断器・開閉器`, en: `` },
  other_safety_equipment: { ja: `その他安全機器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 89, name: "environmental_equipment" },
// ------------------------- 🌠89. 環境機器 小分類 environmental_equipment -------------------------
// 630から

/**
 *【環境機器】Environmental Equipment
  空気清浄機 → air_purifiers
  オイルミストコレクタ → oil_mist_collectors
  集塵機 → dust_collectors
  除湿装置 → dehumidifiers
  加湿装置 → humidifiers
  ガス回収・処理装置 → gas_recovery_processing_units✅gas_recovery_treatment_equipment
  焼却炉・焼却装置 → incinerators
  防振・耐震・免震装置 → anti_vibration_earthquake_protection_devices✅vibration_resistant_devices
  有害物質処理 → hazardous_material_processing✅hazardous_materials_treatment
  その他環境機器 → other_environmental_equipment
  冷却装置 → cooling_devices✅cooling_equipment
  ボイラ → boilers
  熱交換器 → heat_exchangers
  チラー → chillers
 */

export const categoryS_environmental_equipment_NameOnly: ControlEquipmentProductCategoriesS_environmental_equipment[] =
  [
    "air_purifiers",
    "oil_mist_collectors",
    "dust_collectors",
    "dehumidifiers",
    "humidifiers",
    "gas_recovery_treatment_equipment",
    "incinerators",
    "vibration_resistant_devices",
    "hazardous_materials_treatment",
    "other_environmental_equipment",
    "cooling_equipment",
    "boilers",
    "heat_exchangers",
    "chillers",
  ];
export const categoryS_environmental_equipment: {
  id: number;
  name: ControlEquipmentProductCategoriesS_environmental_equipment;
}[] = [
  { id: 630, name: "air_purifiers" },
  { id: 631, name: "oil_mist_collectors" },
  { id: 632, name: "dust_collectors" },
  { id: 633, name: "dehumidifiers" },
  { id: 634, name: "humidifiers" },
  { id: 635, name: "gas_recovery_treatment_equipment" },
  { id: 636, name: "incinerators" },
  { id: 637, name: "vibration_resistant_devices" },
  { id: 638, name: "hazardous_materials_treatment" },
  { id: 639, name: "other_environmental_equipment" },
  { id: 640, name: "cooling_equipment" },
  { id: 641, name: "boilers" },
  { id: 642, name: "heat_exchangers" },
  { id: 643, name: "chillers" },
];
export const mappingCategoryS_environmental_equipment: {
  [K in ControlEquipmentProductCategoriesS_environmental_equipment | string]: {
    [key: string]: string;
  };
} = {
  air_purifiers: { ja: `空気清浄機`, en: `` },
  oil_mist_collectors: { ja: `オイルミストコレクタ`, en: `` },
  dust_collectors: { ja: `集塵機`, en: `` },
  dehumidifiers: { ja: `除湿装置`, en: `` },
  humidifiers: { ja: `加湿装置`, en: `` },
  gas_recovery_treatment_equipment: { ja: `ガス回収・処理装置`, en: `` },
  incinerators: { ja: `焼却炉・焼却装置`, en: `` },
  vibration_resistant_devices: { ja: `防振・耐震・免震装置`, en: `` },
  hazardous_materials_treatment: { ja: `有害物質処理`, en: `` },
  other_environmental_equipment: { ja: `その他環境機器`, en: `` },
  cooling_equipment: { ja: `冷却装置`, en: `` },
  boilers: { ja: `ボイラ`, en: `` },
  heat_exchangers: { ja: `熱交換器`, en: `` },
  chillers: { ja: `チラー`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 90, name: "filters" },
// ------------------------- 🌠90. フィルタ 小分類 filters -------------------------
// 644から

/**
 *【フィルタ】Filters
  その他フィルタ → other_filters
  バッグフィルタ → bag_filters
  ガスフィルタ → gas_filters
  固液分離フィルタ → solid_liquid_separation_filters
  液液分離フィルタ → liquid_liquid_separation_filters
 */

export const categoryS_filters_NameOnly: ControlEquipmentProductCategoriesS_filters[] = [
  "other_filters",
  "bag_filters",
  "gas_filters",
  "solid_liquid_separation_filters",
  "liquid_liquid_separation_filters",
];
export const categoryS_filters: {
  id: number;
  name: ControlEquipmentProductCategoriesS_filters;
}[] = [
  { id: 644, name: "other_filters" },
  { id: 645, name: "bag_filters" },
  { id: 646, name: "gas_filters" },
  { id: 647, name: "solid_liquid_separation_filters" },
  { id: 648, name: "liquid_liquid_separation_filters" },
];
export const mappingCategoryS_filters: {
  [K in ControlEquipmentProductCategoriesS_filters | string]: {
    [key: string]: string;
  };
} = {
  other_filters: { ja: `その他フィルタ`, en: `` },
  bag_filters: { ja: `バッグフィルタ`, en: `` },
  gas_filters: { ja: `ガスフィルタ`, en: `` },
  solid_liquid_separation_filters: { ja: `固液分離フィルタ`, en: `` },
  liquid_liquid_separation_filters: { ja: `液液分離フィルタ`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 91, name: "clean_rooms" },
// ------------------------- 🌠91. クリーンルーム 小分類 clean_rooms -------------------------
// 649から

/**
 *【クリーンルーム】Cleanrooms
  ドラフトチャンバー → draft_chambers
  ファンフィルタユニット → fan_filter_units
  フィルタユニット → filter_units
  エアシャワー → air_showers
  靴底洗浄機 → shoe_sole_cleaners
  パスボックス → pass_boxes
  グローブボックス → glove_boxes
  クリーンベンチ → clean_benches
  クリーンブース → clean_booths
  その他クリーンルーム用機器・設備 → other_cleanroom_equipment_facilities✅other_cleanroom_equipment
 */

export const categoryS_clean_rooms_NameOnly: ControlEquipmentProductCategoriesS_clean_rooms[] = [
  "draft_chambers",
  "fan_filter_units",
  "filter_units",
  "air_showers",
  "shoe_sole_cleaners",
  "pass_boxes",
  "glove_boxes",
  "clean_benches",
  "clean_booths",
  "other_cleanroom_equipment",
];
export const categoryS_clean_rooms: {
  id: number;
  name: ControlEquipmentProductCategoriesS_clean_rooms;
}[] = [
  { id: 648, name: "draft_chambers" },
  { id: 649, name: "fan_filter_units" },
  { id: 650, name: "filter_units" },
  { id: 651, name: "air_showers" },
  { id: 652, name: "shoe_sole_cleaners" },
  { id: 653, name: "pass_boxes" },
  { id: 654, name: "glove_boxes" },
  { id: 655, name: "clean_benches" },
  { id: 656, name: "clean_booths" },
  { id: 657, name: "other_cleanroom_equipment" },
];
export const mappingCategoryS_clean_rooms: {
  [K in ControlEquipmentProductCategoriesS_clean_rooms | string]: {
    [key: string]: string;
  };
} = {
  draft_chambers: { ja: `ドラフトチャンバー`, en: `` },
  fan_filter_units: { ja: `ファンフィルタユニット`, en: `` },
  filter_units: { ja: `フィルタユニット`, en: `` },
  air_showers: { ja: `エアシャワー`, en: `` },
  shoe_sole_cleaners: { ja: `靴底洗浄機`, en: `` },
  pass_boxes: { ja: `パスボックス`, en: `` },
  glove_boxes: { ja: `グローブボックス`, en: `` },
  clean_benches: { ja: `クリーンベンチ`, en: `` },
  clean_booths: { ja: `クリーンブース`, en: `` },
  other_cleanroom_equipment: { ja: `その他クリーンルーム用機器・設備`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 92, name: "lighting" },
// ------------------------- 🌠92. 照明 小分類 lighting -------------------------
// 658から

/**
 *【照明】Lighting
  その他照明器具 → other_lighting_fixtures
  作業灯 → work_lights
  メタルハライドランプ → metal_halide_lamps
  水銀灯 → mercury_lamps
  蛍光灯 → fluorescent_lamps
  LED蛍光灯 → led_fluorescent_lamps
  LED照明 → led_lighting
  投光器 → floodlights
 */

export const categoryS_lighting_NameOnly: ControlEquipmentProductCategoriesS_lighting[] = [
  "other_lighting_fixtures",
  "work_lights",
  "metal_halide_lamps",
  "mercury_lamps",
  "fluorescent_lamps",
  "led_fluorescent_lamps",
  "led_lighting",
  "floodlights",
];
export const categoryS_lighting: {
  id: number;
  name: ControlEquipmentProductCategoriesS_lighting;
}[] = [
  { id: 658, name: "other_lighting_fixtures" },
  { id: 659, name: "work_lights" },
  { id: 660, name: "metal_halide_lamps" },
  { id: 661, name: "mercury_lamps" },
  { id: 662, name: "fluorescent_lamps" },
  { id: 663, name: "led_fluorescent_lamps" },
  { id: 664, name: "led_lighting" },
  { id: 665, name: "floodlights" },
];
export const mappingCategoryS_lighting: {
  [K in ControlEquipmentProductCategoriesS_lighting | string]: {
    [key: string]: string;
  };
} = {
  other_lighting_fixtures: { ja: `その他照明器具`, en: `` },
  work_lights: { ja: `作業灯`, en: `` },
  metal_halide_lamps: { ja: `メタルハライドランプ`, en: `` },
  mercury_lamps: { ja: `水銀灯`, en: `` },
  fluorescent_lamps: { ja: `蛍光灯`, en: `` },
  led_fluorescent_lamps: { ja: `LED蛍光灯`, en: `` },
  led_lighting: { ja: `LED照明`, en: `` },
  floodlights: { ja: `投光器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 93, name: "air_conditioning_equipment" },
// ------------------------- 🌠93. 空調機器 小分類 air_conditioning_equipment -------------------------
// 666から

/**
 *【空調機器】Air Conditioning Equipment
  空調 → air_conditioning
  換気・排気 → ventilation_exhaust
  制御盤クーラー → control_panel_coolers
  クーリングタワー → cooling_towers
  その他空調機器 → other_air_conditioning_equipment
 */

export const categoryS_air_conditioning_equipment_NameOnly: ControlEquipmentProductCategoriesS_air_conditioning_equipment[] =
  [
    "air_conditioning",
    "ventilation_exhaust",
    "control_panel_coolers",
    "cooling_towers",
    "other_air_conditioning_equipment",
  ];
export const categoryS_air_conditioning_equipment: {
  id: number;
  name: ControlEquipmentProductCategoriesS_air_conditioning_equipment;
}[] = [
  { id: 666, name: "air_conditioning" },
  { id: 667, name: "ventilation_exhaust" },
  { id: 668, name: "control_panel_coolers" },
  { id: 669, name: "cooling_towers" },
  { id: 670, name: "other_air_conditioning_equipment" },
];
export const mappingCategoryS_air_conditioning_equipment: {
  [K in ControlEquipmentProductCategoriesS_air_conditioning_equipment | string]: {
    [key: string]: string;
  };
} = {
  air_conditioning: { ja: `空調`, en: `` },
  ventilation_exhaust: { ja: `換気・排気`, en: `` },
  control_panel_coolers: { ja: `制御盤クーラー`, en: `` },
  cooling_towers: { ja: `クーリングタワー`, en: `` },
  other_air_conditioning_equipment: { ja: `その他空調機器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 94, name: "water_treatment_equipment" },
// ------------------------- 🌠94. 水処理装置 小分類 water_treatment_equipment -------------------------
// 671から

/**
 *【水処理装置】Water Treatment Devices
  水処理装置 → water_treatment_devices✅water_treatment_equipment
  活水装置 → water_activators
  ろ過装置 → filtration_devices✅water_activators
  曝気・散気装置 → aeration_diffusion_devices✅aeration_diffusion_equipment
  廃液・排水処理装置 → waste_water_treatment_devices✅wastewater_treatment_equipment
  油水分離装置 → oil_water_separators✅oil_water_separation_equipment
  その他水処理装置 → other_water_treatment_devices✅other_water_treatment_equipment
 */

export const categoryS_water_treatment_equipment_NameOnly: ControlEquipmentProductCategoriesS_water_treatment_equipment[] =
  [
    "water_treatment_equipment",
    "water_activators",
    "filtration_devices",
    "aeration_diffusion_equipment",
    "wastewater_treatment_equipment",
    "oil_water_separators",
    "other_water_treatment_equipment",
  ];
export const categoryS_water_treatment_equipment: {
  id: number;
  name: ControlEquipmentProductCategoriesS_water_treatment_equipment;
}[] = [
  { id: 671, name: "water_treatment_equipment" },
  { id: 672, name: "water_activators" },
  { id: 673, name: "filtration_devices" },
  { id: 674, name: "aeration_diffusion_equipment" },
  { id: 675, name: "wastewater_treatment_equipment" },
  { id: 676, name: "oil_water_separators" },
  { id: 677, name: "other_water_treatment_equipment" },
];
export const mappingCategoryS_water_treatment_equipment: {
  [K in ControlEquipmentProductCategoriesS_water_treatment_equipment | string]: {
    [key: string]: string;
  };
} = {
  water_treatment_equipment: { ja: `水処理装置`, en: `` },
  water_activators: { ja: `活水装置`, en: `` },
  filtration_devices: { ja: `ろ過装置`, en: `` },
  aeration_diffusion_equipment: { ja: `曝気・散気装置`, en: `` },
  wastewater_treatment_equipment: { ja: `廃液・排水処理装置`, en: `` },
  oil_water_separators: { ja: `油水分離装置`, en: `` },
  other_water_treatment_equipment: { ja: `その他水処理装置`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 95, name: "static_electricity_measures" },
// ------------------------- 🌠95. 静電気対策 小分類 static_electricity_measures -------------------------
// 678から

/**
 *【静電気対策】Electrostatic Discharge Protection
  静電気除去装置 → electrostatic_discharge_removers✅static_electricity_removal_equipment
  イオナイザ・除電器 → ionizers_deionizers✅ionizers
  導電マット → conductive_mats
  静電気対策グッズ → electrostatic_protection_items✅static_electricity_prevention_goods
  その他静電気対策機器 → other_electrostatic_protection_equipment✅other_static_electricity_prevention_equipment
 */

export const categoryS_static_electricity_measures_NameOnly: ControlEquipmentProductCategoriesS_static_electricity_measures[] =
  [
    "electrostatic_discharge_removers",
    "ionizers_deionizers",
    "conductive_mats",
    "electrostatic_protection_items",
    "other_electrostatic_protection_equipment",
  ];
export const categoryS_static_electricity_measures: {
  id: number;
  name: ControlEquipmentProductCategoriesS_static_electricity_measures;
}[] = [
  { id: 678, name: "electrostatic_discharge_removers" },
  { id: 679, name: "ionizers_deionizers" },
  { id: 680, name: "conductive_mats" },
  { id: 681, name: "electrostatic_protection_items" },
  { id: 682, name: "other_electrostatic_protection_equipment" },
];
export const mappingCategoryS_static_electricity_measures: {
  [K in ControlEquipmentProductCategoriesS_static_electricity_measures | string]: {
    [key: string]: string;
  };
} = {
  electrostatic_discharge_removers: { ja: `静電気除去装置`, en: `` },
  ionizers_deionizers: { ja: `イオナイザ・除電器`, en: `` },
  conductive_mats: { ja: `導電マット`, en: `` },
  electrostatic_protection_items: { ja: `静電気対策グッズ`, en: `` },
  other_electrostatic_protection_equipment: { ja: `その他静電気対策機器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 96, name: "energy_equipment" },
// ------------------------- 🌠96. エネルギー機器 小分類 energy_equipment -------------------------
// 683から

/**
 *【エネルギー機器】Energy Equipment
  発電機・伝動モータ → generators_transmission_motors
  風力発電器 → wind_turbines
  太陽光発電機 → solar_power_generators
  燃料電池 → fuel_cells
  蓄電装置 → energy_storage_systems✅energy_storage_devices
  電力監視機器 → power_monitoring_equipment
  デマンド監視 → demand_monitoring
  その他エネルギー機器 → other_energy_equipment
 */

export const categoryS_energy_equipment_NameOnly: ControlEquipmentProductCategoriesS_energy_equipment[] = [
  "generators_transmission_motors",
  "wind_turbines",
  "solar_power_generators",
  "fuel_cells",
  "energy_storage_systems",
  "power_monitoring_equipment",
  "demand_monitoring",
  "other_energy_equipment",
];
export const categoryS_energy_equipment: {
  id: number;
  name: ControlEquipmentProductCategoriesS_energy_equipment;
}[] = [
  { id: 683, name: "generators_transmission_motors" },
  { id: 684, name: "wind_turbines" },
  { id: 685, name: "solar_power_generators" },
  { id: 686, name: "fuel_cells" },
  { id: 687, name: "energy_storage_systems" },
  { id: 688, name: "power_monitoring_equipment" },
  { id: 689, name: "demand_monitoring" },
  { id: 690, name: "other_energy_equipment" },
];
export const mappingCategoryS_energy_equipment: {
  [K in ControlEquipmentProductCategoriesS_energy_equipment | string]: {
    [key: string]: string;
  };
} = {
  generators_transmission_motors: { ja: `発電機・伝動モータ`, en: `` },
  wind_turbines: { ja: `風力発電器`, en: `` },
  solar_power_generators: { ja: `太陽光発電機`, en: `` },
  fuel_cells: { ja: `燃料電池`, en: `` },
  energy_storage_systems: { ja: `蓄電装置`, en: `` },
  power_monitoring_equipment: { ja: `電力監視機器`, en: `` },
  demand_monitoring: { ja: `デマンド監視`, en: `` },
  other_energy_equipment: { ja: `その他エネルギー機器`, en: `` },
};

// -------------------------------------------------------------------------------------

// =================== ✅「制御・電機機器」 大分類 control_electrical_equipment の小分類関連✅ ここまで ===================

// =================== ✅「工具・消耗品・備品」 大分類 tools_consumables_supplies の小分類関連✅  ===================
/**
 * export const toolCategoryM: { id: number; name: ProductCategoriesMediumTool }[] = [
  { id: 97, name: "cutting_tools" },
  { id: 98, name: "abrasives" },
  { id: 99, name: "hand_tools" },
  { id: 100, name: "power_pneumatic_tools" },
  { id: 101, name: "consumables" },
  { id: 102, name: "cleaning_tools" },
  { id: 103, name: "safety_hygiene_supplies" },
  { id: 104, name: "packaging_materials" },
  { id: 105, name: "supplies" },
  { id: 106, name: "storage_facilities" },
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
 */

// { id: 97, name: "cutting_tools" },
// ------------------------- 🌠97. 切削工具 小分類 cutting_tools -------------------------
// 691から

/**
 *【切削工具】Cutting Tools
  ドリル → drills
  バイト → turning_tools✅lathe_tools
  フライス → milling_cutters
  エンドミル → end_mills
  リーマ → reamers
  タップ → taps
  ホブ → hobs
  ピニオンカッター → pinion_cutters
  ダイス → dies
  ブローチ → broaches
  カッター → cutters
  チャック → chucks
  その他切削工具 → other_cutting_tools

 */

export const categoryS_cutting_tools_NameOnly: ToolProductCategoriesS_cutting_tools[] = [
  "drills",
  "lathe_tools",
  "milling_cutters",
  "end_mills",
  "reamers",
  "taps",
  "hobs",
  "pinion_cutters",
  "dies",
  "broaches",
  "cutters",
  "chucks",
  "other_cutting_tools",
];
export const categoryS_cutting_tools: {
  id: number;
  name: ToolProductCategoriesS_cutting_tools;
}[] = [
  { id: 691, name: "drills" },
  { id: 692, name: "lathe_tools" },
  { id: 693, name: "milling_cutters" },
  { id: 694, name: "end_mills" },
  { id: 695, name: "reamers" },
  { id: 696, name: "taps" },
  { id: 697, name: "hobs" },
  { id: 698, name: "pinion_cutters" },
  { id: 699, name: "dies" },
  { id: 700, name: "broaches" },
  { id: 701, name: "cutters" },
  { id: 702, name: "chucks" },
  { id: 703, name: "other_cutting_tools" },
];
export const mappingCategoryS_cutting_tools: {
  [K in ToolProductCategoriesS_cutting_tools | string]: {
    [key: string]: string;
  };
} = {
  drills: { ja: `ドリル`, en: `` },
  lathe_tools: { ja: `バイト`, en: `` },
  milling_cutters: { ja: `フライス`, en: `` },
  end_mills: { ja: `エンドミル`, en: `` },
  reamers: { ja: `リーマ`, en: `` },
  taps: { ja: `タップ`, en: `` },
  hobs: { ja: `ホブ`, en: `` },
  pinion_cutters: { ja: `ピニオンカッター`, en: `` },
  dies: { ja: `ダイス`, en: `` },
  broaches: { ja: `ブローチ`, en: `` },
  cutters: { ja: `カッター`, en: `` },
  chucks: { ja: `チャック`, en: `` },
  other_cutting_tools: { ja: `その他切削工具`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 98, name: "abrasives" },
// ------------------------- 🌠98. 研磨材 小分類 abrasives -------------------------
// 704から

/**
 *【研磨材】Abrasive Materials
  砥石 → grinding_wheels✅grindstones
  ダイヤモンドカッター → diamond_cutters
  手研磨・ヤスリ → hand_abrasives_files✅hand_files
  ブラシ → brushes
  その他研磨材 → other_abrasive_materials✅other_abrasives
 */

export const categoryS_abrasives_NameOnly: ToolProductCategoriesS_abrasives[] = [
  "grindstones",
  "diamond_cutters",
  "hand_files",
  "brushes",
  "other_abrasives",
];
export const categoryS_abrasives: {
  id: number;
  name: ToolProductCategoriesS_abrasives;
}[] = [
  { id: 704, name: "grindstones" },
  { id: 705, name: "diamond_cutters" },
  { id: 706, name: "hand_files" },
  { id: 707, name: "brushes" },
  { id: 708, name: "other_abrasives" },
];
export const mappingCategoryS_abrasives: {
  [K in ToolProductCategoriesS_abrasives | string]: {
    [key: string]: string;
  };
} = {
  grindstones: { ja: `砥石`, en: `` },
  diamond_cutters: { ja: `ダイヤモンドカッター`, en: `` },
  hand_files: { ja: `手研磨・ヤスリ`, en: `` },
  brushes: { ja: `ブラシ`, en: `` },
  other_abrasives: { ja: `その他研磨材`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 99, name: "hand_tools" },
// ------------------------- 🌠99. 作業工具 小分類 hand_tools -------------------------
// 709から

/**
 *【作業工具】Hand Tools
  工具セット → tool_sets
  ドライバー → screwdrivers
  ベンチ・プライヤ・ニッパ → pliers_cutters
  スパナ・レンチ → spanners_wrenches
  ハンマー → hammers
  パイプ・ケーブルカッター → pipe_cable_cutters
  バイス・クランプ → vises_clamps
  カッター・ハサミ → cutters_scissors
  トルクレンチ → torque_wrenches
  ソケットレンチ → socket_wrenches
  その他作業工具 → other_hand_tools
 */

export const categoryS_hand_tools_NameOnly: ToolProductCategoriesS_hand_tools[] = [
  "tool_sets",
  "screwdrivers",
  "pliers_cutters",
  "spanners_wrenches",
  "hammers",
  "pipe_cable_cutters",
  "vises_clamps",
  "cutters_scissors",
  "torque_wrenches",
  "socket_wrenches",
  "other_hand_tools",
];
export const categoryS_hand_tools: {
  id: number;
  name: ToolProductCategoriesS_hand_tools;
}[] = [
  { id: 709, name: "tool_sets" },
  { id: 710, name: "screwdrivers" },
  { id: 711, name: "pliers_cutters" },
  { id: 712, name: "spanners_wrenches" },
  { id: 713, name: "hammers" },
  { id: 714, name: "pipe_cable_cutters" },
  { id: 715, name: "vises_clamps" },
  { id: 716, name: "cutters_scissors" },
  { id: 717, name: "torque_wrenches" },
  { id: 718, name: "socket_wrenches" },
  { id: 719, name: "other_hand_tools" },
];
export const mappingCategoryS_hand_tools: {
  [K in ToolProductCategoriesS_hand_tools | string]: {
    [key: string]: string;
  };
} = {
  tool_sets: { ja: `工具セット`, en: `` },
  screwdrivers: { ja: `ドライバー`, en: `` },
  pliers_cutters: { ja: `ベンチ・プライヤ・ニッパ`, en: `` },
  spanners_wrenches: { ja: `スパナ・レンチ`, en: `` },
  hammers: { ja: `ハンマー`, en: `` },
  pipe_cable_cutters: { ja: `パイプ・ケーブルカッター`, en: `` },
  vises_clamps: { ja: `バイス・クランプ`, en: `` },
  cutters_scissors: { ja: `カッター・ハサミ`, en: `` },
  torque_wrenches: { ja: `トルクレンチ`, en: `` },
  socket_wrenches: { ja: `ソケットレンチ`, en: `` },
  other_hand_tools: { ja: `その他作業工具`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 100, name: "power_pneumatic_tools" },
// ------------------------- 🌠100. 電動・空圧工具 小分類 power_pneumatic_tools -------------------------
// 720から

/**
 *【電動・空圧工具】Power and Pneumatic Tools
  電動工具 → electric_tools✅power_tools
  空圧工具 → pneumatic_tools
 */

export const categoryS_power_pneumatic_tools_NameOnly: ToolProductCategoriesS_power_pneumatic_tools[] = [
  "power_tools",
  "pneumatic_tools",
];
export const categoryS_power_pneumatic_tools: {
  id: number;
  name: ToolProductCategoriesS_power_pneumatic_tools;
}[] = [
  { id: 720, name: "power_tools" },
  { id: 721, name: "pneumatic_tools" },
];
export const mappingCategoryS_power_pneumatic_tools: {
  [K in ToolProductCategoriesS_power_pneumatic_tools | string]: {
    [key: string]: string;
  };
} = {
  power_tools: { ja: `電動工具`, en: `` },
  pneumatic_tools: { ja: `空圧工具`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 101, name: "consumables" },
// ------------------------- 🌠101. 消耗品 小分類 consumables -------------------------
// 722から

/**
 *【消耗品】Consumables
  接着剤 → adhesives
  補修剤 → repair_compounds
  粘着テープ → adhesive_tapes
  切削油 → cutting_oils
  潤滑油 → lubricants
  防錆剤 → rust_preventatives
  洗浄剤 → cleaning_agents
  塗料 → paints
  コーティング剤 → coatings✅coating_agents
  その他消耗品 → other_consumables
 */

export const categoryS_consumables_NameOnly: ToolProductCategoriesS_consumables[] = [
  "adhesives",
  "repair_compounds",
  "adhesive_tapes",
  "cutting_oils",
  "lubricants",
  "rust_preventatives",
  "cleaning_agents",
  "paints",
  "coating_agents",
  "other_consumables",
];
export const categoryS_consumables: {
  id: number;
  name: ToolProductCategoriesS_consumables;
}[] = [
  { id: 722, name: "adhesives" },
  { id: 723, name: "repair_compounds" },
  { id: 724, name: "adhesive_tapes" },
  { id: 725, name: "cutting_oils" },
  { id: 726, name: "lubricants" },
  { id: 727, name: "rust_preventatives" },
  { id: 728, name: "cleaning_agents" },
  { id: 729, name: "paints" },
  { id: 730, name: "coating_agents" },
  { id: 731, name: "other_consumables" },
];
export const mappingCategoryS_consumables: {
  [K in ToolProductCategoriesS_consumables | string]: {
    [key: string]: string;
  };
} = {
  adhesives: { ja: `接着剤`, en: `` },
  repair_compounds: { ja: `補修剤`, en: `` },
  adhesive_tapes: { ja: `粘着テープ`, en: `` },
  cutting_oils: { ja: `切削油`, en: `` },
  lubricants: { ja: `潤滑油`, en: `` },
  rust_preventatives: { ja: `防錆剤`, en: `` },
  cleaning_agents: { ja: `洗浄剤`, en: `` },
  paints: { ja: `塗料`, en: `` },
  coating_agents: { ja: `コーティング剤`, en: `` },
  other_consumables: { ja: `その他消耗品`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 102, name: "cleaning_tools" },
// ------------------------- 🌠102. 清掃用具 小分類 cleaning_tools -------------------------
// 732から

/**
 *【清掃用具】Cleaning Tools
  洗剤 → detergents
  消毒液 → disinfectants
  工業用掃除機 → industrial_vacuum_cleaners
  ワイパー → wipers
  ウエス → rags✅wiping_cloths
  モップ → mops
  その他清掃用具 → other_cleaning_tools
 */

export const categoryS_cleaning_tools_NameOnly: ToolProductCategoriesS_cleaning_tools[] = [
  "detergents",
  "disinfectants",
  "industrial_vacuum_cleaners",
  "wipers",
  "rags",
  "mops",
  "other_cleaning_tools",
];
export const categoryS_cleaning_tools: {
  id: number;
  name: ToolProductCategoriesS_cleaning_tools;
}[] = [
  { id: 732, name: "detergents" },
  { id: 733, name: "disinfectants" },
  { id: 734, name: "industrial_vacuum_cleaners" },
  { id: 735, name: "wipers" },
  { id: 736, name: "rags" },
  { id: 737, name: "mops" },
  { id: 738, name: "other_cleaning_tools" },
];
export const mappingCategoryS_cleaning_tools: {
  [K in ToolProductCategoriesS_cleaning_tools | string]: {
    [key: string]: string;
  };
} = {
  detergents: { ja: `洗剤`, en: `` },
  disinfectants: { ja: `消毒液`, en: `` },
  industrial_vacuum_cleaners: { ja: `工業用掃除機`, en: `` },
  wipers: { ja: `ワイパー`, en: `` },
  rags: { ja: `ウエス`, en: `` },
  mops: { ja: `モップ`, en: `` },
  other_cleaning_tools: { ja: `その他清掃用具`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 103, name: "safety_hygiene_supplies" },
// ------------------------- 🌠103. 安全・衛生用品 小分類 safety_hygiene_supplies -------------------------
// 739から

/**
 *【安全・衛生用品】Safety and Hygiene Products
  安全靴・安全スニーカー → safety_shoes_sneakers
  作業用手袋 → work_gloves
  マスク → masks
  メガネ・ゴーグル → glasses_goggles
  ハンドクリーナー → hand_cleaners
  保護クリーム → protective_creams
  その他安全・衛生用品 → other_safety_hygiene_products
 */

export const categoryS_safety_hygiene_supplies_NameOnly: ToolProductCategoriesS_safety_hygiene_supplies[] = [
  "safety_shoes_sneakers",
  "work_gloves",
  "masks",
  "glasses_goggles",
  "hand_cleaners",
  "protective_creams",
  "other_safety_hygiene_products",
];
export const categoryS_safety_hygiene_supplies: {
  id: number;
  name: ToolProductCategoriesS_safety_hygiene_supplies;
}[] = [
  { id: 739, name: "safety_shoes_sneakers" },
  { id: 740, name: "work_gloves" },
  { id: 741, name: "masks" },
  { id: 742, name: "glasses_goggles" },
  { id: 743, name: "hand_cleaners" },
  { id: 744, name: "protective_creams" },
  { id: 745, name: "other_safety_hygiene_products" },
];
export const mappingCategoryS_safety_hygiene_supplies: {
  [K in ToolProductCategoriesS_safety_hygiene_supplies | string]: {
    [key: string]: string;
  };
} = {
  safety_shoes_sneakers: { ja: `安全靴・安全スニーカー`, en: `` },
  work_gloves: { ja: `作業用手袋`, en: `` },
  masks: { ja: `マスク`, en: `` },
  glasses_goggles: { ja: `メガネ・ゴーグル`, en: `` },
  hand_cleaners: { ja: `ハンドクリーナー`, en: `` },
  protective_creams: { ja: `保護クリーム`, en: `` },
  other_safety_hygiene_products: { ja: `その他安全・衛生用品`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 104, name: "packaging_materials" },
// ------------------------- 🌠104. 梱包材 小分類 packaging_materials -------------------------
// 746から

/**
 *【梱包材】Packaging Materials
  コンテナ → containers
  パレット → pallets
  緩衝材 → cushioning_materials
  包装用袋 → packaging_bags
  トレー → trays
  その他梱包材 → other_packaging_materials
 */

export const categoryS_packaging_materials_NameOnly: ToolProductCategoriesS_packaging_materials[] = [
  "containers",
  "pallets",
  "cushioning_materials",
  "packaging_bags",
  "trays",
  "other_packaging_materials",
];
export const categoryS_packaging_materials: {
  id: number;
  name: ToolProductCategoriesS_packaging_materials;
}[] = [
  { id: 746, name: "containers" },
  { id: 747, name: "pallets" },
  { id: 748, name: "cushioning_materials" },
  { id: 749, name: "packaging_bags" },
  { id: 750, name: "trays" },
  { id: 751, name: "other_packaging_materials" },
];
export const mappingCategoryS_packaging_materials: {
  [K in ToolProductCategoriesS_packaging_materials | string]: {
    [key: string]: string;
  };
} = {
  containers: { ja: `コンテナ`, en: `` },
  pallets: { ja: `パレット`, en: `` },
  cushioning_materials: { ja: `緩衝材`, en: `` },
  packaging_bags: { ja: `包装用袋`, en: `` },
  trays: { ja: `トレー`, en: `` },
  other_packaging_materials: { ja: `その他梱包材`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 105, name: "supplies" },
// ------------------------- 🌠105. 備品 小分類 supplies -------------------------
// 752から

/**
 *【備品】Supplies
  カーテン → curtains
  マット → mats
  ロッカー → lockers
  キャビネット → cabinets
  什器 → fixtures
 */

export const categoryS_supplies_NameOnly: ToolProductCategoriesS_supplies[] = [
  "curtains",
  "mats",
  "lockers",
  "cabinets",
  "fixtures",
];
export const categoryS_supplies: {
  id: number;
  name: ToolProductCategoriesS_supplies;
}[] = [
  { id: 752, name: "curtains" },
  { id: 753, name: "mats" },
  { id: 754, name: "lockers" },
  { id: 755, name: "cabinets" },
  { id: 756, name: "fixtures" },
];
export const mappingCategoryS_supplies: {
  [K in ToolProductCategoriesS_supplies | string]: {
    [key: string]: string;
  };
} = {
  curtains: { ja: `カーテン`, en: `` },
  mats: { ja: `マット`, en: `` },
  lockers: { ja: `ロッカー`, en: `` },
  cabinets: { ja: `キャビネット`, en: `` },
  fixtures: { ja: `什器`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 106, name: "storage_facilities" },
// ------------------------- 🌠106. 保管設備 小分類 storage_facilities -------------------------
// 757から

/**
 *【保管設備】Storage Facilities
  タンク → tanks
  サイロ → silos
 */

export const categoryS_storage_facilities_NameOnly: ToolProductCategoriesS_storage_facilities[] = ["tanks", "silos"];
export const categoryS_storage_facilities: {
  id: number;
  name: ToolProductCategoriesS_storage_facilities;
}[] = [
  { id: 757, name: "tanks" },
  { id: 758, name: "silos" },
];
export const mappingCategoryS_storage_facilities: {
  [K in ToolProductCategoriesS_storage_facilities | string]: {
    [key: string]: string;
  };
} = {
  tanks: { ja: `タンク`, en: `` },
  silos: { ja: `サイロ`, en: `` },
};

// -------------------------------------------------------------------------------------

// =================== ✅「工具・消耗品・備品」 大分類 tools_consumables_supplies の小分類関連✅ ここまで ===================

// =================== ✅「設計・生産支援」 大分類 design_production_support の小分類関連✅ ===================
/**
 * export const designCategoryM: { id: number; name: ProductCategoriesMediumDesign }[] = [
  { id: 107, name: "cad" },
  { id: 108, name: "cam" },
  { id: 109, name: "cae" },
  { id: 110, name: "prototype" },
  { id: 111, name: "contracted_services" },
];
export const mappingDesignCategoryM: { [K in ProductCategoriesMediumDesign | string]: { [key: string]: string } } = {
  cad: { ja: "CAD", en: `` }, // 1
  cam: { ja: "CAM", en: `` }, // 2
  cae: { ja: "CAE", en: `` }, // 3
  prototype: { ja: "試作", en: `` }, // 4
  contracted_services: { ja: "受託サービス", en: `` }, // 5
};
 */

// { id: 107, name: "cad" },
// ------------------------- 🌠107. CAD 小分類 cad -------------------------
// 759から

/**
 *【CAD】Computer-Aided Design
  2次元CAD建設 → two_dimensional_cad_construction
  2次元CAD機械 → two_dimensional_cad_mechanical
  2次元CAD電気 → two_dimensional_cad_electrical
  3次元CAD → three_dimensional_cad
  その他CAD → other_cad
  データ変換ソフト → data_conversion_software
  レンダリングソフト → rendering_software
  モデラー → modelers
  その他CAD関連ソフト → other_cad_related_software✅other_cad_software
 */

export const categoryS_cad_NameOnly: DesignProductCategoriesS_cad[] = [
  "two_dimensional_cad_construction",
  "two_dimensional_cad_mechanical",
  "two_dimensional_cad_electrical",
  "three_dimensional_cad",
  "other_cad",
  "data_conversion_software",
  "rendering_software",
  "modelers",
  "other_cad_software",
];
export const categoryS_cad: {
  id: number;
  name: DesignProductCategoriesS_cad;
}[] = [
  { id: 759, name: "two_dimensional_cad_construction" },
  { id: 760, name: "two_dimensional_cad_mechanical" },
  { id: 761, name: "two_dimensional_cad_electrical" },
  { id: 762, name: "three_dimensional_cad" },
  { id: 763, name: "other_cad" },
  { id: 764, name: "data_conversion_software" },
  { id: 765, name: "rendering_software" },
  { id: 766, name: "modelers" },
  { id: 767, name: "other_cad_software" },
];
export const mappingCategoryS_cad: {
  [K in DesignProductCategoriesS_cad | string]: {
    [key: string]: string;
  };
} = {
  two_dimensional_cad_construction: { ja: `2次元CAD建設`, en: `` },
  two_dimensional_cad_mechanical: { ja: `2次元CAD機械`, en: `` },
  two_dimensional_cad_electrical: { ja: `2次元CAD電気`, en: `` },
  three_dimensional_cad: { ja: `3次元CAD`, en: `` },
  other_cad: { ja: `その他CAD`, en: `` },
  data_conversion_software: { ja: `データ変換ソフト`, en: `` },
  rendering_software: { ja: `レンダリングソフト`, en: `` },
  modelers: { ja: `モデラー`, en: `` },
  other_cad_software: { ja: `その他CAD関連ソフト`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 108, name: "cam" },
// ------------------------- 🌠108. CAM 小分類 cam -------------------------
// 768から

/**
 *【CAM】Computer-Aided Manufacturing
  2次元CAM → two_dimensional_cam
  3次元CAM → three_dimensional_cam
  その他CAM関連ソフト → other_cam_related_software✅other_cam_software
 */

export const categoryS_cam_NameOnly: DesignProductCategoriesS_cam[] = [
  "two_dimensional_cam",
  "three_dimensional_cam",
  "other_cam_software",
];
export const categoryS_cam: {
  id: number;
  name: DesignProductCategoriesS_cam;
}[] = [
  { id: 768, name: "two_dimensional_cam" },
  { id: 769, name: "three_dimensional_cam" },
  { id: 770, name: "other_cam_software" },
];
export const mappingCategoryS_cam: {
  [K in DesignProductCategoriesS_cam | string]: {
    [key: string]: string;
  };
} = {
  two_dimensional_cam: { ja: `2次元CAM`, en: `` },
  three_dimensional_cam: { ja: `3次元CAM`, en: `` },
  other_cam_software: { ja: `その他CAM関連ソフト`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 109, name: "cae" },
// ------------------------- 🌠109. CAE 小分類 cae -------------------------
// 771から

/**
 *【CAE】Computer-Aided Engineering
  シミュレーター → simulators
  構造解析 → structural_analysis
  応力解析 → stress_analysis
  熱流体解析 → thermo_fluid_analysis
  磁場解析・電磁波解析 → magnetic_field_electromagnetic_analysis✅magnetic_electromagnetic_analysis
  音響解析 → acoustic_analysis
  機構解析 → mechanical_analysis
  その他解析 → other_analysis
  受託解析 → contracted_analysis_services✅contract_analysis
  解析サービス → analysis_services
 */

export const categoryS_cae_NameOnly: DesignProductCategoriesS_cae[] = [
  "simulators",
  "structural_analysis",
  "stress_analysis",
  "thermo_fluid_analysis",
  "magnetic_electromagnetic_analysis",
  "acoustic_analysis",
  "mechanical_analysis",
  "other_analysis",
  "contract_analysis",
  "analysis_services",
];
export const categoryS_cae: {
  id: number;
  name: DesignProductCategoriesS_cae;
}[] = [
  { id: 771, name: "simulators" },
  { id: 772, name: "structural_analysis" },
  { id: 773, name: "stress_analysis" },
  { id: 774, name: "thermo_fluid_analysis" },
  { id: 775, name: "magnetic_electromagnetic_analysis" },
  { id: 776, name: "acoustic_analysis" },
  { id: 777, name: "mechanical_analysis" },
  { id: 778, name: "other_analysis" },
  { id: 779, name: "contract_analysis" },
  { id: 780, name: "analysis_services" },
];
export const mappingCategoryS_cae: {
  [K in DesignProductCategoriesS_cae | string]: {
    [key: string]: string;
  };
} = {
  simulators: { ja: `シミュレーター`, en: `` },
  structural_analysis: { ja: `構造解析`, en: `` },
  stress_analysis: { ja: `応力解析`, en: `` },
  thermo_fluid_analysis: { ja: `熱流体解析`, en: `` },
  magnetic_electromagnetic_analysis: { ja: `磁場解析・電磁波解析`, en: `` },
  acoustic_analysis: { ja: `音響解析`, en: `` },
  mechanical_analysis: { ja: `機構解析`, en: `` },
  other_analysis: { ja: `その他解析`, en: `` },
  contract_analysis: { ja: `受託解析`, en: `` },
  analysis_services: { ja: `解析サービス`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 110, name: "prototype" },
// ------------------------- 🌠110. 試作 小分類 prototype -------------------------
// 781から

/**
 *【試作】Prototyping
  試作サービス → prototyping_services
  3Dプリンタ → three_d_printers
 */

export const categoryS_prototype_NameOnly: DesignProductCategoriesS_prototype[] = [
  "prototyping_services",
  "three_d_printers",
];
export const categoryS_prototype: {
  id: number;
  name: DesignProductCategoriesS_prototype;
}[] = [
  { id: 781, name: "prototyping_services" },
  { id: 782, name: "three_d_printers" },
];
export const mappingCategoryS_prototype: {
  [K in DesignProductCategoriesS_prototype | string]: {
    [key: string]: string;
  };
} = {
  prototyping_services: { ja: `試作サービス`, en: `` },
  three_d_printers: { ja: `3Dプリンタ`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 111, name: "contracted_services" },
// ------------------------- 🌠111. 受託サービス 小分類 contracted_services -------------------------
// 783から

/**
 *【受託サービス】Contracted Services
  試作サービス → prototyping_services✅contract_prototype_services
  3Dプリンタ → three_d_printer_services
 */

export const categoryS_contracted_services_design_NameOnly: DesignProductCategoriesS_contracted_services[] = [
  "contract_prototype_services",
  "three_d_printer_services",
];
export const categoryS_contracted_services_design: {
  id: number;
  name: DesignProductCategoriesS_contracted_services;
}[] = [
  { id: 783, name: "contract_prototype_services" },
  { id: 784, name: "three_d_printer_services" },
];
export const mappingCategoryS_contracted_services_design: {
  [K in DesignProductCategoriesS_contracted_services | string]: {
    [key: string]: string;
  };
} = {
  contract_prototype_services: { ja: `試作サービス`, en: `` },
  three_d_printer_services: { ja: `3Dプリンタ`, en: `` },
};

// -------------------------------------------------------------------------------------

// =================== ✅「設計・生産支援」 大分類 design_production_support の小分類関連✅ ここまで ===================

// =================== ✅「IT・ネットワーク」 大分類 it_network の小分類関連✅ ===================
/**
 * export const ITCategoryM: { id: number; name: ProductCategoriesMediumIT }[] = [
  { id: 112, name: "industrial_computers" },
  { id: 113, name: "embedded_systems" },
  { id: 114, name: "core_systems" },
  { id: 115, name: "production_management" },
  { id: 116, name: "information_systems" },
  { id: 117, name: "network" },
  { id: 118, name: "operating_systems" },
  { id: 119, name: "servers" },
  { id: 120, name: "security" },
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
 */

// { id: 112, name: "industrial_computers" },
// ------------------------- 🌠112. 産業用パソコン 小分類 industrial_computers -------------------------
// 785から

/**
 *【産業用パソコン】Industrial PCs
  産業用PC → industrial_pcs
  拡張ボード → expansion_boards
  メモリ → memory
  ストレージ → storage
  ラック・ケース → racks_cases
  キーボード → keyboards
  SSD → ssds
 */

export const categoryS_industrial_computers_NameOnly: ITProductCategoriesS_industrial_computers[] = [
  "industrial_pcs",
  "expansion_boards",
  "memory",
  "storage",
  "racks_cases",
  "keyboards",
  "ssds",
];
export const categoryS_industrial_computers: {
  id: number;
  name: ITProductCategoriesS_industrial_computers;
}[] = [
  { id: 785, name: "industrial_pcs" },
  { id: 786, name: "expansion_boards" },
  { id: 787, name: "memory" },
  { id: 788, name: "storage" },
  { id: 789, name: "racks_cases" },
  { id: 790, name: "keyboards" },
  { id: 791, name: "ssds" },
];
export const mappingCategoryS_industrial_computers: {
  [K in ITProductCategoriesS_industrial_computers | string]: {
    [key: string]: string;
  };
} = {
  industrial_pcs: { ja: `産業用PC`, en: `` },
  expansion_boards: { ja: `拡張ボード`, en: `` },
  memory: { ja: `メモリ`, en: `` },
  storage: { ja: `ストレージ`, en: `` },
  racks_cases: { ja: `ラック・ケース`, en: `` },
  keyboards: { ja: `キーボード`, en: `` },
  ssds: { ja: `SSD`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 113, name: "embedded_systems" },
// ------------------------- 🌠113. 組込みシステム 小分類 embedded_systems -------------------------
// 792から

/**
 *【組込みシステム】Embedded Systems
組込みボード・コンピュータ → embedded_boards_computers
組込みOS → embedded_operating_systems✅embedded_os
開発支援ツール → development_support_tools
携帯電話・PDA用組込みアプリ → mobile_pda_embedded_apps✅embedded_apps_for_mobile_pda
通信関連 → communication_related
組込みシステム設計受託サービス → embedded_system_design_services
ソフトウェア → software_middleware_drivers_security✅software_middle_driver_security
その他組込み系 → other_embedded_systems✅other_embedded_software_hardware
 */

export const categoryS_embedded_systems_NameOnly: ITProductCategoriesS_embedded_systems[] = [
  "embedded_boards_computers",
  "embedded_os",
  "development_support_tools",
  "embedded_apps_for_mobile_pda",
  "communication_related",
  "embedded_system_design_services",
  "software_middle_driver_security",
  "other_embedded_systems",
];
export const categoryS_embedded_systems: {
  id: number;
  name: ITProductCategoriesS_embedded_systems;
}[] = [
  { id: 792, name: "embedded_boards_computers" },
  { id: 793, name: "embedded_os" },
  { id: 794, name: "development_support_tools" },
  { id: 795, name: "embedded_apps_for_mobile_pda" },
  { id: 796, name: "communication_related" },
  { id: 797, name: "embedded_system_design_services" },
  { id: 798, name: "software_middle_driver_security" },
  { id: 799, name: "other_embedded_systems" },
];
export const mappingCategoryS_embedded_systems: {
  [K in ITProductCategoriesS_embedded_systems | string]: {
    [key: string]: string;
  };
} = {
  embedded_boards_computers: { ja: `組込みボード・コンピュータ`, en: `` },
  embedded_os: { ja: `組込みOS`, en: `` },
  development_support_tools: { ja: `開発支援ツール`, en: `` },
  embedded_apps_for_mobile_pda: { ja: `携帯電話・PDA用組込みアプリ`, en: `` },
  communication_related: { ja: `通信関連`, en: `` },
  embedded_system_design_services: { ja: `組込みシステム設計受託サービス`, en: `` },
  software_middle_driver_security: { ja: `ソフトウェア(ミドル・ドライバ・セキュリティ)`, en: `` },
  other_embedded_systems: { ja: `その他組込み系(ソフト・ハード)`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 114, name: "core_systems" },
// ------------------------- 🌠114. 基幹システム 小分類 core_systems -------------------------
// 800から

/**
 *【基幹システム】Core Systems
  ERPパッケージ → erp_packages
  会計・財務 → accounting_finance
  人事・労務 → hr_labor
  販売管理 → sales_management
  内部統制・運用管理 → internal_control_operations_management
  電子帳票 → electronic_forms✅electronic_document_management
  データベース → databases
  EAI・ETL・WEBアプリケーションサーバ → eai_etl_web_application_servers
  その他基幹システム → other_core_systems
 */

export const categoryS_core_systems_NameOnly: ITProductCategoriesS_core_systems[] = [
  "erp_packages",
  "accounting_finance",
  "hr_labor",
  "sales_management",
  "internal_control_operations_management",
  "electronic_document_management",
  "databases",
  "eai_etl_web_application_servers",
  "other_core_systems",
];
export const categoryS_core_systems: {
  id: number;
  name: ITProductCategoriesS_core_systems;
}[] = [
  { id: 800, name: "erp_packages" },
  { id: 801, name: "accounting_finance" },
  { id: 802, name: "hr_labor" },
  { id: 803, name: "sales_management" },
  { id: 804, name: "internal_control_operations_management" },
  { id: 805, name: "electronic_document_management" },
  { id: 806, name: "databases" },
  { id: 807, name: "eai_etl_web_application_servers" },
  { id: 808, name: "other_core_systems" },
];
export const mappingCategoryS_core_systems: {
  [K in ITProductCategoriesS_core_systems | string]: {
    [key: string]: string;
  };
} = {
  erp_packages: { ja: `ERPパッケージ`, en: `` },
  accounting_finance: { ja: `会計・財務`, en: `` },
  hr_labor: { ja: `人事・労務`, en: `` },
  sales_management: { ja: `販売管理`, en: `` },
  internal_control_operations_management: { ja: `内部統制・運用管理`, en: `` },
  electronic_document_management: { ja: `電子帳票`, en: `` },
  databases: { ja: `データベース`, en: `` },
  eai_etl_web_application_servers: { ja: `EAI・ETL・WEBアプリケーションサーバ`, en: `` },
  other_core_systems: { ja: `その他基幹システム`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 115, name: "production_management" },
// ------------------------- 🌠115. SCM・生産管理 小分類 production_management -------------------------
// 809から

/**
 *【SCM・生産管理】Supply Chain & Production Management
  生産管理システム → production_management_systems
  生産スケジューラー → production_schedulers
  工程管理システム → process_management_systems
  購買管理システム → procurement_management_systems
  原価管理システム → cost_management_systems
  PDM → product_data_management✅pdm
  その他生産管理システム → other_production_management_systems
 */

export const categoryS_production_management_NameOnly: ITProductCategoriesS_production_management[] = [
  "production_management_systems",
  "production_schedulers",
  "process_management_systems",
  "procurement_management_systems",
  "cost_management_systems",
  "product_data_management",
  "other_production_management_systems",
];
export const categoryS_production_management: {
  id: number;
  name: ITProductCategoriesS_production_management;
}[] = [
  { id: 809, name: "production_management_systems" },
  { id: 810, name: "production_schedulers" },
  { id: 811, name: "process_management_systems" },
  { id: 812, name: "procurement_management_systems" },
  { id: 813, name: "cost_management_systems" },
  { id: 814, name: "product_data_management" },
  { id: 815, name: "other_production_management_systems" },
];
export const mappingCategoryS_production_management: {
  [K in ITProductCategoriesS_production_management | string]: {
    [key: string]: string;
  };
} = {
  production_management_systems: { ja: `生産管理システム`, en: `` },
  production_schedulers: { ja: `生産スケジューラー`, en: `` },
  process_management_systems: { ja: `工程管理システム`, en: `` },
  procurement_management_systems: { ja: `購買管理システム`, en: `` },
  cost_management_systems: { ja: `原価管理システム`, en: `` },
  product_data_management: { ja: `PDM`, en: `` },
  other_production_management_systems: { ja: `その他生産管理システム`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 116, name: "information_systems" },
// ------------------------- 🌠116. 情報システム 小分類 information_systems -------------------------
// 816から

/**
 *【情報システム】Information Systems
  企業情報ポータル・グループウェア → enterprise_portals_groupware
  メール・FAX送信 → email_fax_transmission✅email_fax_sending
  音声認識ソフト → voice_recognition_software
  SFA・営業支援システム → sfa_sales_support_systems
  CTI・サポートセンター → cti_support_centers
  ビジネスインテリジェンス・データ分析 → business_intelligence_data_analysis
  文書・データ管理 → document_data_management
  プロジェクト管理 → project_management
  ワークフローシステム → workflow_systems
  データ検索ソフト → data_search_software
  その他情報システム → other_information_systems
 */

export const categoryS_information_systems_NameOnly: ITProductCategoriesS_information_systems[] = [
  "enterprise_portals_groupware",
  "email_fax_sending",
  "voice_recognition_software",
  "sfa_sales_support_systems",
  "cti_support_centers",
  "business_intelligence_data_analysis",
  "document_data_management",
  "project_management",
  "workflow_systems",
  "data_search_software",
  "other_information_systems",
];
export const categoryS_information_systems: {
  id: number;
  name: ITProductCategoriesS_information_systems;
}[] = [
  { id: 816, name: "enterprise_portals_groupware" },
  { id: 817, name: "email_fax_sending" },
  { id: 818, name: "voice_recognition_software" },
  { id: 819, name: "sfa_sales_support_systems" },
  { id: 820, name: "cti_support_centers" },
  { id: 821, name: "business_intelligence_data_analysis" },
  { id: 822, name: "document_data_management" },
  { id: 823, name: "project_management" },
  { id: 824, name: "workflow_systems" },
  { id: 825, name: "data_search_software" },
  { id: 826, name: "other_information_systems" },
];
export const mappingCategoryS_information_systems: {
  [K in ITProductCategoriesS_information_systems | string]: {
    [key: string]: string;
  };
} = {
  enterprise_portals_groupware: { ja: `企業情報ポータル・グループウェア`, en: `` },
  email_fax_sending: { ja: `メール・FAX送信`, en: `` },
  voice_recognition_software: { ja: `音声認識ソフト`, en: `` },
  sfa_sales_support_systems: { ja: `SFA・営業支援システム`, en: `` },
  cti_support_centers: { ja: `CTI・サポートセンター`, en: `` },
  business_intelligence_data_analysis: { ja: `ビジネスインテリジェンス・データ分析`, en: `` },
  document_data_management: { ja: `文書・データ管理`, en: `` },
  project_management: { ja: `プロジェクト管理`, en: `` },
  workflow_systems: { ja: `ワークフローシステム`, en: `` },
  data_search_software: { ja: `データ検索ソフト`, en: `` },
  other_information_systems: { ja: `その他情報システム`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 117, name: "network" },
// ------------------------- 🌠117. ネットワーク・通信 小分類 network -------------------------
// 827から

/**
 *【ネットワーク・通信】Network & Communication
  無線LAN・通信 → wireless_lan_communication
  ルータ・スイッチ・ハブ → routers_switches_hubs
  VPN・広域イーサネット → vpn_wide_area_ethernet
  PBX・IP電話 → pbx_ip_phones
  LAN構築・配管工事 → lan_construction_piping
  その他ネットワークツール → other_network_tools
 */

export const categoryS_network_NameOnly: ITProductCategoriesS_network[] = [
  "wireless_lan_communication",
  "routers_switches_hubs",
  "vpn_wide_area_ethernet",
  "pbx_ip_phones",
  "lan_construction_piping",
  "other_network_tools",
];
export const categoryS_network: {
  id: number;
  name: ITProductCategoriesS_network;
}[] = [
  { id: 827, name: "wireless_lan_communication" },
  { id: 828, name: "routers_switches_hubs" },
  { id: 829, name: "vpn_wide_area_ethernet" },
  { id: 830, name: "pbx_ip_phones" },
  { id: 831, name: "lan_construction_piping" },
  { id: 832, name: "other_network_tools" },
];
export const mappingCategoryS_network: {
  [K in ITProductCategoriesS_network | string]: {
    [key: string]: string;
  };
} = {
  wireless_lan_communication: { ja: `無線LAN・通信`, en: `` },
  routers_switches_hubs: { ja: `ルータ・スイッチ・ハブ`, en: `` },
  vpn_wide_area_ethernet: { ja: `VPN・広域イーサネット`, en: `` },
  pbx_ip_phones: { ja: `PBX・IP電話`, en: `` },
  lan_construction_piping: { ja: `LAN構築・配管工事`, en: `` },
  other_network_tools: { ja: `その他ネットワークツール`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 118, name: "operating_systems" },
// ------------------------- 🌠118. 運用システム 小分類 operating_systems -------------------------
// 833から

/**
 *【運用システム】Operations Systems
  統合運用管理 → integrated_operations_management
  サーバ監視・ネットワーク管理ツール → server_network_management_tools✅server_monitoring_network_management_tools
  その他運用管理ソフト → other_operations_management_software
 */

export const categoryS_operating_systems_NameOnly: ITProductCategoriesS_operating_systems[] = [
  "integrated_operations_management",
  "server_monitoring_network_management_tools",
  "other_operations_management_software",
];
export const categoryS_operating_systems: {
  id: number;
  name: ITProductCategoriesS_operating_systems;
}[] = [
  { id: 833, name: "integrated_operations_management" },
  { id: 834, name: "server_monitoring_network_management_tools" },
  { id: 835, name: "other_operations_management_software" },
];
export const mappingCategoryS_operating_systems: {
  [K in ITProductCategoriesS_operating_systems | string]: {
    [key: string]: string;
  };
} = {
  integrated_operations_management: { ja: `統合運用管理`, en: `` },
  server_monitoring_network_management_tools: { ja: `サーバ監視・ネットワーク管理ツール`, en: `` },
  other_operations_management_software: { ja: `その他運用管理ソフト`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 119, name: "servers" },
// ------------------------- 🌠119. サーバ 小分類 servers -------------------------
// 836から

/**
 *【サーバ】Servers
  サーバー → servers
  サーバラック → server_racks
  サーバクーラー → server_coolers
  その他サーバ関連 → other_server_related
  ストレージ・バックアップ → storage_backup
  UPS・無停電電源装置 → ups_uninterruptible_power_supplies
 */

export const categoryS_servers_NameOnly: ITProductCategoriesS_servers[] = [
  "servers",
  "server_racks",
  "server_coolers",
  "other_server_related",
  "storage_backup",
  "ups_uninterruptible_power_supplies",
];
export const categoryS_servers: {
  id: number;
  name: ITProductCategoriesS_servers;
}[] = [
  { id: 836, name: "servers" },
  { id: 837, name: "server_racks" },
  { id: 838, name: "server_coolers" },
  { id: 839, name: "other_server_related" },
  { id: 840, name: "storage_backup" },
  { id: 841, name: "ups_uninterruptible_power_supplies" },
];
export const mappingCategoryS_servers: {
  [K in ITProductCategoriesS_servers | string]: {
    [key: string]: string;
  };
} = {
  servers: { ja: `サーバー`, en: `` },
  server_racks: { ja: `サーバラック`, en: `` },
  server_coolers: { ja: `サーバクーラー`, en: `` },
  other_server_related: { ja: `その他サーバ関連`, en: `` },
  storage_backup: { ja: `ストレージ・バックアップ`, en: `` },
  ups_uninterruptible_power_supplies: { ja: `UPS・無停電電源装置`, en: `` },
};

// -------------------------------------------------------------------------------------

// { id: 120, name: "security" },
// ------------------------- 🌠120. セキュリティ 小分類 security -------------------------
// 842から

/**
 *【セキュリティ】Security
  フィルタリング → filtering
  ウイルスソフト → antivirus_software
  ファイアウォール・不正侵入防止 → firewalls_intrusion_prevention
  暗号化・認証 → encryption_authentication
  その他セキュリティ → other_security
  入退場システム → entry_exit_systems✅access_control_systems
  個人認証 → personal_authentication
  データ消去 → data_erasure
 */

export const categoryS_security_NameOnly: ITProductCategoriesS_security[] = [
  "filtering",
  "antivirus_software",
  "firewalls_intrusion_prevention",
  "encryption_authentication",
  "other_security",
  "entry_exit_systems",
  "personal_authentication",
  "data_erasure",
];
export const categoryS_security: {
  id: number;
  name: ITProductCategoriesS_security;
}[] = [
  { id: 842, name: "filtering" },
  { id: 843, name: "antivirus_software" },
  { id: 844, name: "firewalls_intrusion_prevention" },
  { id: 845, name: "encryption_authentication" },
  { id: 846, name: "other_security" },
  { id: 847, name: "entry_exit_systems" },
  { id: 848, name: "personal_authentication" },
  { id: 849, name: "data_erasure" },
];
export const mappingCategoryS_security: {
  [K in ITProductCategoriesS_security | string]: {
    [key: string]: string;
  };
} = {
  filtering: { ja: `フィルタリング`, en: `` },
  antivirus_software: { ja: `ウイルスソフト`, en: `` },
  firewalls_intrusion_prevention: { ja: `ファイアウォール・不正侵入防止`, en: `` },
  encryption_authentication: { ja: `暗号化・認証`, en: `` },
  other_security: { ja: `その他セキュリティ`, en: `` },
  entry_exit_systems: { ja: `入退場システム`, en: `` },
  personal_authentication: { ja: `個人認証`, en: `` },
  data_erasure: { ja: `データ消去`, en: `` },
};

// -------------------------------------------------------------------------------------

// =================== ✅「IT・ネットワーク」 大分類 it_network の小分類関連✅ ここまで ===================

// =================== ✅「オフィス」 大分類 office の小分類関連✅  ===================
/**
 * export const OfficeCategoryM: { id: number; name: ProductCategoriesMediumOffice }[] = [
  { id: 121, name: "office_automation_equipment" },
  { id: 122, name: "consumables" },
  { id: 123, name: "supplies" },
];
export const mappingOfficeCategoryM: { [K in ProductCategoriesMediumOffice | string]: { [key: string]: string } } = {
  office_automation_equipment: { ja: "PC・OA機器", en: `` }, // 1
  consumables: { ja: "消耗品", en: `` }, // 2
  supplies: { ja: "備品", en: `` }, // 3
};
 */

// { id: 121, name: "office_automation_equipment" },
// ------------------------- 🌠121. PC・OA機器 小分類 office_automation_equipment -------------------------
// 850から

/**
 *【PC・OA機器】PC & Office Automation Equipment
  デスクトップPC → desktop_pcs
  ノートPC → laptop_pcs✅notebook_pcs
  携帯電話・PHS・データ通信カード → mobile_phones_phs_data_cards✅mobile_phones_phs_data_communication_cards
  PDA・ハンディターミナル → pda_handheld_terminals
  プロジェクタ → projectors
  プリンタ → printers
  スキャナ → scanners
  複合機 → multifunction_devices✅multi_function_devices
  WEB・テレビ会議 → web_tv_conferencing✅web_teleconferencing
  その他PC・OA機器 → other_pc_oa_equipment
 */

export const categoryS_office_automation_equipment_NameOnly: ITProductCategoriesS_office_automation_equipment[] = [
  "desktop_pcs",
  "laptop_pcs",
  "mobile_phones_phs_data_cards",
  "pda_handheld_terminals",
  "projectors",
  "printers",
  "scanners",
  "multi_function_devices",
  "web_teleconferencing",
  "other_pc_oa_equipment",
];
export const categoryS_office_automation_equipment: {
  id: number;
  name: ITProductCategoriesS_office_automation_equipment;
}[] = [
  { id: 850, name: "desktop_pcs" },
  { id: 851, name: "laptop_pcs" },
  { id: 852, name: "mobile_phones_phs_data_cards" },
  { id: 853, name: "pda_handheld_terminals" },
  { id: 854, name: "projectors" },
  { id: 855, name: "printers" },
  { id: 856, name: "scanners" },
  { id: 857, name: "multi_function_devices" },
  { id: 858, name: "web_teleconferencing" },
  { id: 859, name: "other_pc_oa_equipment" },
];
export const mappingCategoryS_office_automation_equipment: {
  [K in ITProductCategoriesS_office_automation_equipment | string]: {
    [key: string]: string;
  };
} = {
  desktop_pcs: { ja: `デスクトップPC`, en: `` },
  laptop_pcs: { ja: `ノートPC`, en: `` },
  mobile_phones_phs_data_cards: { ja: `携帯電話・PHS・データ通信カード`, en: `` },
  pda_handheld_terminals: { ja: `PDA・ハンディターミナル`, en: `` },
  projectors: { ja: `プロジェクタ`, en: `` },
  printers: { ja: `プリンタ`, en: `` },
  scanners: { ja: `スキャナ`, en: `` },
  multi_function_devices: { ja: `複合機`, en: `` },
  web_teleconferencing: { ja: `WEB・テレビ会議`, en: `` },
  other_pc_oa_equipment: { ja: `その他PC・OA機器`, en: `` },
};

/**
 *【PC・OA機器】PC & Office Automation Equipment
  デスクトップPC → desktop_pcs
  ノートPC → laptop_pcs✅notebook_pcs
  携帯電話・PHS・データ通信カード → mobile_phones_phs_data_cards✅mobile_phones_phs_data_communication_cards
  PDA・ハンディターミナル → pda_handheld_terminals
  プロジェクタ → projectors
  プリンタ → printers
  スキャナ → scanners
  複合機 → multifunction_devices✅multi_function_devices
  WEB・テレビ会議 → web_tv_conferencing✅web_teleconferencing
  その他PC・OA機器 → other_pc_oa_equipment
 */

// -------------------------------------------------------------------------------------

// =================== ✅「オフィス」 大分類 office の小分類関連✅ ここまで ===================
