export type FlowPhaseId = "reporting" | "verification" | "activation";

export type FlowStepId =
  | "iot-sensor"
  | "worker-report"
  | "alert-activation"
  | "initial-notification"
  | "field-verification"
  | "risk-classification"
  | "incident-decision"
  | "response-coordination"
  | "info-update"
  | "info-distribution";

export type FlowScenarioId = "gas-leakage" | "fire-incident" | "smoke-detection";

export type DetectionSourceMode = "iot-sensor" | "worker-report" | "combined";

export type VerificationOutcome = "pending" | "confirmed" | "not-confirmed";

export type SimulationStage =
  | "idle"
  | "detected"
  | "reported"
  | "verifying"
  | "confirmed"
  | "activated";

export type HierarchyLevelId = "SCP" | "ICC" | "BSC" | "CMC" | "EST";

export type FlowRouteStatus = "Available" | "Caution" | "Blocked";

export interface FlowPhaseMeta {
  id: FlowPhaseId;
  number: string;
  shortTitle: string;
  title: string;
  subtitle: string;
  accentLabel: string;
}

export interface FlowStepMeta {
  id: FlowStepId;
  phase: FlowPhaseId;
  code: string;
  shortTitle: string;
  title: string;
  branchTag?: string;
  summary: string;
  description: string;
  inputs: string[];
  outputs: string[];
  actors: string[];
  disclaimerNote: string;
}

export interface HierarchyTierMeta {
  id: HierarchyLevelId;
  order: number;
  name: string;
  scopeLabel: string;
  roleSummary: string;
  coordinationFocus: string[];
  proceduralNote: string;
}

export interface ScenarioRouteState {
  routeCode: string;
  routeName: string;
  destination: string;
  directionHint: string;
  status: FlowRouteStatus;
  note: string;
}

export interface ScenarioHierarchyState {
  levelId: HierarchyLevelId;
  activationRole: "Primary (Demo)" | "Alerted (Demo)" | "Standby" | "As Needed per SOP";
  acknowledgmentStatus: string;
  note: string;
}

export interface FlowScenarioConfig {
  id: FlowScenarioId;
  demoIncidentId: string;
  title: string;
  shortTitle: string;
  area: string;
  hazardTypeLabel: string;
  simTimeLabel: string;
  sensorNodeLabel: string;
  sensorReadingDemo: string;
  workerReportChannelDemo: string;
  environmentalCondition: string;
  riskCategoryDemo: string;
  affectedZoneSummary: string;
  sensorHealthSummary: string;
  recommendedAction: string;
  primarySignageNode: string;
  signageDirectionLabel: string;
  signageSafeTarget: string;
  signageWarningLine: string;
  mobileTitle: string;
  mobileBody: string;
  dashboardDispatchSummary: string;
  routes: ScenarioRouteState[];
  hierarchyPlan: Record<HierarchyLevelId, ScenarioHierarchyState>;
}

export const FLOW_PHASES: FlowPhaseMeta[] = [
  {
    id: "reporting",
    number: "Phase 1",
    shortTitle: "Reporting",
    title: "Emergency Incident Reporting",
    subtitle: "Sumber indikasi sensor maupun laporan pekerja membentuk notifikasi awal.",
    accentLabel: "Deteksi & Laporan Awal",
  },
  {
    id: "verification",
    number: "Phase 2",
    shortTitle: "Verification",
    title: "Emergency Incident Verification",
    subtitle: "Pemeriksaan kondisi lapangan, parameter klasifikasi risiko, dan keputusan insiden.",
    accentLabel: "Pemeriksaan & Keputusan",
  },
  {
    id: "activation",
    number: "Phase 3",
    shortTitle: "Response Activation",
    title: "Emergency Response Activation",
    subtitle: "Koordinasi hierarki tanggap darurat, pembaruan EVORA, dan distribusi informasi.",
    accentLabel: "Eskalasi & Distribusi",
  },
];

export const FLOW_STEPS: FlowStepMeta[] = [
  {
    id: "iot-sensor",
    phase: "reporting",
    code: "1A",
    shortTitle: "IoT Sensor Detection",
    title: "IoT Sensor Detection (Simulasi)",
    branchTag: "INCIDENT INPUT",
    summary: "Gas, temperature, smoke, flame, dan wind sensor (simulasi).",
    description:
      "Menerima indikasi perubahan kondisi lingkungan dari node sensor simulasi di area fasilitas (Gas detector, Temperature sensor, Smoke detector, Flame detector, serta Wind speed & direction sensor). Seluruh pembacaan pada tampilan ini adalah data simulasi dan bukan telemetri perangkat nyata.",
    inputs: [
      "Gas detector (indikasi simulasi)",
      "Temperature sensor (indikasi simulasi)",
      "Smoke detector & Flame detector (indikasi simulasi)",
      "Wind speed & direction sensor (kondisi pendukung simulasi)",
    ],
    outputs: [
      "Sinyal indikasi awal (Demo threshold reached)",
      "Timestamp dan area titik deteksi simulasi",
    ],
    actors: ["EVORA Simulation Sensor Layer", "Operator Monitoring Role"],
    disclaimerNote:
      "Data sensor pada halaman ini bersifat simulasi demonstrasi, bukan koneksi telemetri perangkat lapangan nyata.",
  },
  {
    id: "worker-report",
    phase: "reporting",
    code: "1B",
    shortTitle: "Worker Manual Report",
    title: "Worker Incident Report",
    branchTag: "INCIDENT INPUT",
    summary: "Manual report, call point (konsep), dan plant phone (referensi).",
    description:
      "Menyediakan jalur pelaporan manual ketika pekerja melihat atau mengalami potensi keadaan darurat di area fasilitas. Mencakup pelaporan insiden manual, rancangan emergency call point / tombol pelaporan sebagai konsep, serta referensi kanal telepon pabrik / komunikasi lapangan.",
    inputs: [
      "Manual incident report oleh pekerja di area kerja",
      "Emergency call point / tombol pelaporan (konsep rancangan)",
      "Plant phone / kanal komunikasi lapangan (kanal referensi SOP)",
    ],
    outputs: [
      "Catatan laporan manual beserta area temuan dan waktu simulasi",
      "Identifikasi pelapor berbasis ID/peran simulasi (tanpa data pribadi)",
    ],
    actors: ["Field Worker Role (ID Simulasi)", "Area Safety Watcher Role"],
    disclaimerNote:
      "Emergency call point ditampilkan sebagai konsep jika belum terpasang; plant phone merupakan kanal referensi prosedural dan belum diklaim terintegrasi otomatis.",
  },
  {
    id: "alert-activation",
    phase: "reporting",
    code: "1C",
    shortTitle: "EVORA Alert Activation",
    title: "EVORA Alert Activation",
    summary: "Menggabungkan indikasi sensor dan laporan manual menjadi alert awal.",
    description:
      "Mengonsolidasikan indikasi dari sensor IoT simulasi dan/atau laporan manual pekerja untuk membentuk draf notifikasi awal insiden di dalam EVORA, lengkap dengan jenis kejadian, lokasi/area, waktu simulasi, sumber laporan, dan status awal.",
    inputs: [
      "Indikasi sensor simulasi (1A) dan/atau laporan pekerja (1B)",
      "Konteks zona fasilitas",
    ],
    outputs: [
      "Incident ID demonstrasi beserta jenis kejadian, lokasi, waktu, dan sumber",
      "Transisi status awal: Detected → Reported",
    ],
    actors: ["EVORA Alert Aggregation Engine (Demo)"],
    disclaimerNote:
      "Pembentukan notifikasi awal berjalan secara lokal pada mode demonstrasi frontend tanpa pengiriman ke server atau perangkat Pertamina.",
  },
  {
    id: "initial-notification",
    phase: "reporting",
    code: "1D",
    shortTitle: "Initial Incident Notification",
    title: "Initial Incident Notification",
    summary: "Ditampilkan ke operator di panel EVORA; radio/telepon tetap kanal prosedural.",
    description:
      "Menyampaikan notifikasi insiden awal kepada petugas atau operator melalui antarmuka dashboard/panel insiden EVORA agar segera ditindaklanjuti ke tahap verifikasi. Kanal radio, telepon pabrik, dan kanal komunikasi resmi lainnya tetap dijalankan sebagai kanal prosedural sesuai SOP fasilitas.",
    inputs: [
      "Paket notifikasi awal insiden dari EVORA Alert Activation (1C)",
    ],
    outputs: [
      "Tampilan insiden berstatus Reported pada dashboard & panel operator",
      "Rujukan tindak lanjut melalui kanal komunikasi resmi sesuai SOP",
    ],
    actors: ["Control Room Operator Role", "Duty HSE Supervisor Role"],
    disclaimerNote:
      "Radio lapangan, telepon pabrik, dan sistem komunikasi resmi hanya direpresentasikan sebagai kanal prosedural SOP, bukan integrasi otomatis.",
  },
  {
    id: "field-verification",
    phase: "verification",
    code: "2A",
    shortTitle: "Field Verification",
    title: "Field Verification",
    summary: "Pemeriksaan kondisi lapangan & pencatatan status verifikasi.",
    description:
      "Petugas lapangan atau personel berwenang menerima laporan awal, lalu memeriksa kesesuaian indikasi sensor maupun laporan pekerja dengan kondisi faktual di lokasi. Status verifikasi dicatat sebagai Pending, Confirmed, atau Not Confirmed.",
    inputs: [
      "Notifikasi insiden awal berstatus Reported (1D)",
      "Hasil observasi lapangan oleh personel berwenang",
    ],
    outputs: [
      "Catatan status verifikasi: Pending, Confirmed, atau Not Confirmed",
      "Transisi status proses: Verifying",
    ],
    actors: ["Field Safety Inspector Role", "Site HSE Officer Role"],
    disclaimerNote:
      "Verifikasi lapangan merupakan langkah konfirmasi manusiawi sebelum keputusan aktivasi penuh dijalankan.",
  },
  {
    id: "risk-classification",
    phase: "verification",
    code: "2B",
    shortTitle: "Risk Classification",
    title: "Risk Classification",
    summary: "Parameter bahaya, lokasi, sensor, kondisi angin, dan kategori risiko.",
    description:
      "Menyajikan parameter penilaian risiko insiden secara terstruktur meliputi jenis bahaya, lokasi/area terdampak, pembacaan sensor yang tersedia, kondisi lingkungan pendukung (seperti arah dan kecepatan angin), serta kategori tingkat keparahan untuk mendukung evaluasi petugas.",
    inputs: [
      "Jenis bahaya dan lokasi / area terdampak",
      "Pembacaan sensor simulasi & kondisi angin pendukung",
      "Hasil pemeriksaan lapangan (2A)",
    ],
    outputs: [
      "Ringkasan parameter klasifikasi risiko (Demo)",
      "Dasar pertimbangan penentuan keputusan insiden (2C)",
    ],
    actors: ["HSE Risk Assessor Role", "Incident Screening Team Role"],
    disclaimerNote:
      "EVORA tidak menetapkan ambang batas numerik, rumus, atau level resmi secara sepihak. Klasifikasi final wajib mengikuti kajian risiko dan SOP fasilitas yang berlaku.",
  },
  {
    id: "incident-decision",
    phase: "verification",
    code: "2C",
    shortTitle: "Incident Decision",
    title: "Incident Decision",
    summary: "Confirmed → Aktivasi; Pending → Cek tambahan; Not Confirmed → Tutup.",
    description:
      "Menentukan tindak lanjut insiden berdasarkan verifikasi dan klasifikasi risiko: Confirmed Incident meneruskan alur ke aktivasi respons, Pending Verification menahan alur untuk pemeriksaan tambahan, sedangkan Not Confirmed menutup atau meninjau ulang laporan sesuai prosedur.",
    inputs: [
      "Status verifikasi lapangan (2A) & parameter risiko (2B)",
      "Konfirmasi keputusan oleh personel berwenang",
    ],
    outputs: [
      "Confirmed Incident → lanjut ke Response Coordination & Escalation (Phase 3)",
      "Pending Verification → pemeriksaan / informasi tambahan",
      "Not Confirmed → review ulang / penutupan laporan sesuai SOP",
    ],
    actors: ["Authorized Site Safety Authority Role"],
    disclaimerNote:
      "EVORA diposisikan sebagai sistem pendukung informasi dan keputusan, bukan pengganti kewenangan keputusan personel resmi.",
  },
  {
    id: "response-coordination",
    phase: "activation",
    code: "3A",
    shortTitle: "Response Coordination & Escalation",
    title: "Response Coordination & Escalation",
    summary: "Koordinasi hierarki SCP, ICC, BSC, CMC, dan EST sesuai eskalasi.",
    description:
      "Meneruskan informasi insiden terkonfirmasi kepada tingkat koordinasi yang relevan pada struktur referensi SCP, ICC, BSC, CMC, dan EST, menampilkan status penerimaan (acknowledgment) serta pembaruan insiden. Eskalasi dilakukan sesuai tingkat keparahan dan prosedur, tidak selalu mengaktifkan seluruh level secara berurutan.",
    inputs: [
      "Incident Decision berstatus Confirmed Incident (2C)",
      "Kategori risiko dan dampak area (2B)",
    ],
    outputs: [
      "Status penerimaan / acknowledgment pada unit koordinasi terkait",
      "Transisi status: Response Activated",
    ],
    actors: [
      "Site Command Post (SCP)",
      "Incident Command Center (ICC)",
      "Business Support Center (BSC)",
      "Crisis Management Center (CMC)",
      "Executive Support Team (EST)",
    ],
    disclaimerNote:
      "Menampilkan struktur koordinasi referensi tanpa mengarang SLA, kewenangan internal, maupun aturan eskalasi wajib. Aktivasi aktual mengacu SOP resmi.",
  },
  {
    id: "info-update",
    phase: "activation",
    code: "3B",
    shortTitle: "EVORA Information Update",
    title: "EVORA Information Update",
    summary: "Pembaruan status insiden, zona bahaya, sensor, risiko, dan rute evakuasi.",
    description:
      "Setelah informasi insiden diperbarui dan respons diaktifkan, EVORA memutakhirkan status insiden, hazard area / zona terdampak, status sensor terkait, klasifikasi risiko demonstrasi, serta rekomendasi rute evakuasi dengan status Available, Caution, atau Blocked.",
    inputs: [
      "Pembaruan keputusan koordinasi respons (3A)",
      "Kondisi zona bahaya dan kondisi lingkungan simulasi",
    ],
    outputs: [
      "Pembaruan status rute evakuasi: Available, Caution, atau Blocked",
      "Pembaruan zona terdampak & rekomendasi assembly point aman",
    ],
    actors: ["EVORA Evacuation & Information Engine (Demo)"],
    disclaimerNote:
      "Status zona dan jalur evakuasi pada modul ini bersifat demonstrasi konseptual guna memperjelas alur pembaruan informasi.",
  },
  {
    id: "info-distribution",
    phase: "activation",
    code: "3C",
    shortTitle: "Emergency Information Distribution",
    title: "Emergency Information Distribution",
    summary: "EVORA dashboard, mobile notification (jika tersedia), dan dynamic signage.",
    description:
      "Menyalurkan informasi status insiden dan panduan evakuasi melalui antarmuka EVORA Dashboard untuk operator, mockup notifikasi mobile untuk pekerja terdaftar (bila fitur tersedia), rancangan Dynamic Evacuation Signage, serta merujuk kanal komunikasi resmi lain sesuai prosedur fasilitas.",
    inputs: [
      "Paket informasi terbarui dari EVORA Information Update (3B)",
    ],
    outputs: [
      "Pembaruan EVORA Dashboard untuk operator & personel terkait",
      "Simulasi Mobile Notification (bila fitur tersedia) & rancangan Dynamic Signage",
      "Referensi distribusi kanal resmi sesuai SOP fasilitas",
    ],
    actors: ["Operators & Field Personnel", "Registered Workforce (Conceptual)"],
    disclaimerNote:
      "Dynamic Evacuation Signage dan Mobile Notification direpresentasikan sebagai rancangan/mockup konseptual dan tidak diklaim sudah terintegrasi penuh di lapangan.",
  },
];

export const HIERARCHY_LEVELS: HierarchyTierMeta[] = [
  {
    id: "SCP",
    order: 1,
    name: "Site Command Post (SCP)",
    scopeLabel: "Tingkat Lokasi / Site",
    roleSummary: "Koordinasi awal dan respons langsung pada lokasi kejadian.",
    coordinationFocus: [
      "Mengonfirmasi kondisi lapangan bersama personel site berwenang",
      "Mengarahkan pengendalian awal di sekitar area terdampak",
      "Memantau status evakuasi pekerja dan kondisi jalur akses site",
    ],
    proceduralNote:
      "Representasi struktur referensi tingkat lokasi. Kewenangan detail dan protokol aktivasi mengikuti SOP fasilitas.",
  },
  {
    id: "ICC",
    order: 2,
    name: "Incident Command Center (ICC)",
    scopeLabel: "Tingkat Zona",
    roleSummary: "Koordinasi penanganan insiden pada tingkat zona.",
    coordinationFocus: [
      "Menyelaraskan informasi insiden dan dukungan antar-area dalam satu zona",
      "Memantau pembaruan status verifikasi, zona bahaya, dan kebutuhan dukungan SCP",
      "Menjadi penghubung informasi zona bila eskalasi diperlukan",
    ],
    proceduralNote:
      "Diaktifkan berdasarkan tingkat keparahan dan prosedur zona yang berlaku, bukan selalu otomatis aktif untuk seluruh kejadian.",
  },
  {
    id: "BSC",
    order: 3,
    name: "Business Support Center (BSC)",
    scopeLabel: "Tingkat Regional / Entitas",
    roleSummary: "Dukungan koordinasi pada tingkat regional atau entitas.",
    coordinationFocus: [
      "Menyediakan dukungan koordinasi operasional lintas unit pada entitas/regional",
      "Menerima pembaruan status insiden bila insiden memerlukan dukungan tingkat entitas",
    ],
    proceduralNote:
      "Pelibatan BSC bergantung pada penilaian keparahan insiden serta ketentuan eskalasi resmi yang berlaku.",
  },
  {
    id: "CMC",
    order: 4,
    name: "Crisis Management Center (CMC)",
    scopeLabel: "Manajemen Krisis",
    roleSummary: "Koordinasi manajemen krisis untuk eskalasi berskala lebih luas.",
    coordinationFocus: [
      "Mengkoordinasikan respons krisis apabila eskalasi melampaui penanganan tingkat zona/entitas",
      "Mengkaji pembaruan status risiko dan informasi strategis insiden",
    ],
    proceduralNote:
      "Hanya direpresentasikan sebagai bagian dari struktur referensi EVORA; tidak menetapkan kriteria atau SLA aktivasi internal.",
  },
  {
    id: "EST",
    order: 5,
    name: "Executive Support Team (EST)",
    scopeLabel: "Dukungan Strategis",
    roleSummary: "Dukungan pengambilan keputusan strategis pada tingkat pimpinan.",
    coordinationFocus: [
      "Menerima ringkasan status insiden kritis untuk dukungan keputusan strategis",
      "Mendukung koordinasi eksekutif sesuai mekanisme manajemen krisis resmi",
    ],
    proceduralNote:
      "Aktivasi dan mekanisme pelaporan ke EST sepenuhnya mengikuti pedoman resmi perusahaan/fasilitas.",
  },
];

export const SIMULATION_STATUS_STEPS: {
  id: Exclude<SimulationStage, "idle">;
  label: string;
  phase: FlowPhaseId;
  helper: string;
}[] = [
  {
    id: "detected",
    label: "Detected",
    phase: "reporting",
    helper: "Indikasi sensor / input laporan masuk",
  },
  {
    id: "reported",
    label: "Reported",
    phase: "reporting",
    helper: "Notifikasi insiden awal terbentuk di EVORA",
  },
  {
    id: "verifying",
    label: "Verifying",
    phase: "verification",
    helper: "Pemeriksaan lapangan & kajian parameter risiko",
  },
  {
    id: "confirmed",
    label: "Confirmed",
    phase: "verification",
    helper: "Insiden terkonfirmasi untuk aktivasi respons",
  },
  {
    id: "activated",
    label: "Response Activated",
    phase: "activation",
    helper: "Koordinasi aktif & distribusi informasi evakuasi",
  },
];

export const FLOW_SCENARIOS: Record<FlowScenarioId, FlowScenarioConfig> = {
  "gas-leakage": {
    id: "gas-leakage",
    demoIncidentId: "DEMO-INC-GAS-01",
    title: "Gas Leakage — Storage Area",
    shortTitle: "Gas Leakage",
    area: "Storage Area (Perimeter Tangki T-101 / T-102)",
    hazardTypeLabel: "Gas Leakage (Simulasi)",
    simTimeLabel: "09:51:04 WIB (Simulation Time)",
    sensorNodeLabel: "Gas Detector GD-101 · Area Penyimpanan (Simulasi)",
    sensorReadingDemo: "Demo threshold reached (Konsentrasi gas di atas ambang simulasi)",
    workerReportChannelDemo: "Manual Report via Worker Role ID: OPR-STOR-02 / Call Point (Konsep)",
    environmentalCondition: "Angin dominan mengarah ke Barat (Simulasi pendukung dispersi)",
    riskCategoryDemo: "Tinggi — Kategori Demonstrasi (Klasifikasi final mengikuti SOP fasilitas)",
    affectedZoneSummary:
      "Storage Area bagian barat & koridor arah barat dinyatakan sebagai zona bahaya demonstrasi.",
    sensorHealthSummary:
      "Gas Detector GD-101: Demo threshold reached · Wind Sensor WS-01: Active (Simulasi)",
    recommendedAction:
      "Hindari koridor barat area tangki; gunakan Route Alpha (Upwind) menuju Assembly Point AP-ALPHA dan ikuti arahan SCP serta SOP fasilitas.",
    primarySignageNode: "SGN-STOR-W01 (Conceptual)",
    signageDirectionLabel: "ARAH EVAKUASI: TIMUR LAUT / UPWIND → AP-ALPHA",
    signageSafeTarget: "Assembly Point AP-ALPHA (Status: Available)",
    signageWarningLine: "PERINGATAN DEMO: JALUR BARAT TERDAMPAK INDIKASI GAS",
    mobileTitle: "EVORA Demo Alert — Gas Leakage (Storage Area)",
    mobileBody:
      "Indikasi kebocoran gas simulasi di Storage Area telah terkonfirmasi (Demo). Menjauh ke arah upwind melalui Route Alpha menuju AP-ALPHA.",
    dashboardDispatchSummary:
      "Insiden DEMO-INC-GAS-01 berstatus Response Activated. SCP menerima notifikasi lokasi; zona barat Storage Area ditandai untuk pembatasan akses dan rute upwind diprioritaskan.",
    routes: [
      {
        routeCode: "Route Alpha",
        routeName: "North-East Upwind Corridor",
        destination: "Assembly Point AP-ALPHA",
        directionHint: "Upwind Timur Laut",
        status: "Available",
        note: "Direkomendasikan pada simulasi (arah berlawanan angin dominan).",
      },
      {
        routeCode: "Route Gamma",
        routeName: "South Service Perimeter",
        destination: "Assembly Point AP-CHARLIE",
        directionHint: "Selatan",
        status: "Caution",
        note: "Alternatif dengan pemantauan kondisi angin dan arahan petugas.",
      },
      {
        routeCode: "Route Beta",
        routeName: "West Tank Manifold Path",
        destination: "West Perimeter Gate",
        directionHint: "Barat",
        status: "Blocked",
        note: "Terlewati area terdampak indikasi gas pada skenario simulasi.",
      },
    ],
    hierarchyPlan: {
      SCP: {
        levelId: "SCP",
        activationRole: "Primary (Demo)",
        acknowledgmentStatus: "Acknowledged (Demo)",
        note: "Mengoordinasikan respons awal dan pemeriksaan area Storage Area.",
      },
      ICC: {
        levelId: "ICC",
        activationRole: "Alerted (Demo)",
        acknowledgmentStatus: "Notified — Monitoring (Demo)",
        note: "Menerima pembaruan status zona untuk kesiapan dukungan bila diperlukan.",
      },
      BSC: {
        levelId: "BSC",
        activationRole: "As Needed per SOP",
        acknowledgmentStatus: "Standby (Tidak otomatis aktif)",
        note: "Dihubungi hanya apabila eskalasi melampaui lingkup zona sesuai SOP.",
      },
      CMC: {
        levelId: "CMC",
        activationRole: "As Needed per SOP",
        acknowledgmentStatus: "Standby (Sesuai SOP)",
        note: "Belum diaktifkan pada skenario demonstrasi tingkat area ini.",
      },
      EST: {
        levelId: "EST",
        activationRole: "As Needed per SOP",
        acknowledgmentStatus: "Standby (Sesuai SOP)",
        note: "Dukungan strategis mengikuti ketentuan manajemen krisis resmi.",
      },
    },
  },
  "fire-incident": {
    id: "fire-incident",
    demoIncidentId: "DEMO-INC-FIR-02",
    title: "Fire Incident — Manifold & Pump Area",
    shortTitle: "Fire Incident",
    area: "Central Pipe Manifold & Pump Station",
    hazardTypeLabel: "Fire Incident (Simulasi)",
    simTimeLabel: "10:14:22 WIB (Simulation Time)",
    sensorNodeLabel: "Flame Detector FL-202 & Temp Sensor TT-204 (Simulasi)",
    sensorReadingDemo: "Demo threshold reached (Indikasi nyala api & kenaikan suhu simulasi)",
    workerReportChannelDemo: "Emergency Call Point (Konsep) / Plant Phone (Referensi SOP)",
    environmentalCondition: "Kecepatan angin sedang ke Tenggara (Simulasi pendukung)",
    riskCategoryDemo: "Tinggi / Kritis — Kategori Demonstrasi (Mengacu SOP fasilitas)",
    affectedZoneSummary:
      "Zona Central Manifold & jalur tengah ditandai sebagai zona bahaya termal simulasi.",
    sensorHealthSummary:
      "Flame Detector FL-202 & Temp TT-204: Demo threshold reached (Simulasi)",
    recommendedAction:
      "Jauhi area Central Manifold; evakuasi melalui koridor utara (Route Alpha) atau akses perimeter aman yang berstatus Available sesuai arahan petugas.",
    primarySignageNode: "SGN-MAN-C02 (Conceptual)",
    signageDirectionLabel: "ARAH EVAKUASI: UTARA PERIMETER → AP-ALPHA",
    signageSafeTarget: "Assembly Point AP-ALPHA (Status: Available)",
    signageWarningLine: "PERINGATAN DEMO: HINDARI CENTRAL MANIFOLD CORRIDOR",
    mobileTitle: "EVORA Demo Alert — Fire Incident (Central Manifold)",
    mobileBody:
      "Simulasi insiden api pada Central Pipe Manifold berstatus terkonfirmasi (Demo). Gunakan koridor utara yang berstatus Available menuju AP-ALPHA.",
    dashboardDispatchSummary:
      "Insiden DEMO-INC-FIR-02 mengaktifkan koordinasi SCP dan notifikasi ICC tingkat zona pada skenario demonstrasi serta memperbarui status rute tengah menjadi Blocked.",
    routes: [
      {
        routeCode: "Route Alpha",
        routeName: "North Perimeter Access",
        destination: "Assembly Point AP-ALPHA",
        directionHint: "Utara",
        status: "Available",
        note: "Jalur aman terjauh dari area Central Manifold pada simulasi.",
      },
      {
        routeCode: "Route Delta",
        routeName: "East Loading Gate Corridor",
        destination: "Assembly Point AP-BRAVO",
        directionHint: "Timur",
        status: "Caution",
        note: "Dapat digunakan dengan pengawasan arah sebaran asap dan petugas.",
      },
      {
        routeCode: "Route Beta",
        routeName: "Central Pipe Corridor",
        destination: "West Gate",
        directionHint: "Tengah-Barat",
        status: "Blocked",
        note: "Berada dekat sumber indikasi nyala api pada simulasi.",
      },
    ],
    hierarchyPlan: {
      SCP: {
        levelId: "SCP",
        activationRole: "Primary (Demo)",
        acknowledgmentStatus: "Acknowledged (Demo)",
        note: "Koordinasi langsung respons site dan pengendalian area manifold.",
      },
      ICC: {
        levelId: "ICC",
        activationRole: "Primary (Demo)",
        acknowledgmentStatus: "Acknowledged (Demo)",
        note: "Koordinasi lintas area dalam zona operasional selama skenario berlangsung.",
      },
      BSC: {
        levelId: "BSC",
        activationRole: "Alerted (Demo)",
        acknowledgmentStatus: "Notified — Standby Support (Demo)",
        note: "Menerima notifikasi kesiapan dukungan entitas/regional sesuai SOP.",
      },
      CMC: {
        levelId: "CMC",
        activationRole: "As Needed per SOP",
        acknowledgmentStatus: "Standby (Sesuai SOP)",
        note: "Eskalasi lanjutan bergantung pada evaluasi tingkat keparahan resmi.",
      },
      EST: {
        levelId: "EST",
        activationRole: "As Needed per SOP",
        acknowledgmentStatus: "Standby (Sesuai SOP)",
        note: "Dukungan strategis sesuai pedoman manajemen krisis.",
      },
    },
  },
  "smoke-detection": {
    id: "smoke-detection",
    demoIncidentId: "DEMO-INC-SMK-03",
    title: "Smoke Detection — Utility & Corridor Area",
    shortTitle: "Smoke Detection",
    area: "Utility Building & West Loading Corridor",
    hazardTypeLabel: "Smoke Detection (Simulasi)",
    simTimeLabel: "11:05:18 WIB (Simulation Time)",
    sensorNodeLabel: "Smoke Detector SM-301 (Simulasi)",
    sensorReadingDemo: "Demo threshold reached (Indikasi akumulasi asap simulasi)",
    workerReportChannelDemo: "Manual Incident Report oleh Utility Operator Role (Demo)",
    environmentalCondition: "Sirkulasi udara rendah / kecenderungan asap mengendap (Simulasi)",
    riskCategoryDemo: "Sedang / Waspada — Kategori Demonstrasi (Mengacu SOP fasilitas)",
    affectedZoneSummary:
      "Koridor akses Utility Building & Loading Bay Barat mengalami penurunan jarak pandang pada simulasi.",
    sensorHealthSummary:
      "Smoke Detector SM-301: Demo threshold reached (Simulasi)",
    recommendedAction:
      "Arahkan personel menjauhi koridor utilitas tertutup menggunakan jalur terbuka Route Alpha atau Route Gamma yang berstatus Available.",
    primarySignageNode: "SGN-UTL-E03 (Conceptual)",
    signageDirectionLabel: "ARAH EVAKUASI: KORIDOR TERBUKA TIMUR → AP-BRAVO",
    signageSafeTarget: "Assembly Point AP-BRAVO (Status: Available)",
    signageWarningLine: "PERINGATAN DEMO: PENURUNAN VISIBILITAS DI KORIDOR UTILITAS",
    mobileTitle: "EVORA Demo Alert — Smoke Detection (Utility Corridor)",
    mobileBody:
      "Deteksi asap simulasi terkonfirmasi di koridor utilitas (Demo). Gunakan jalur evakuasi terbuka menuju Assembly Point AP-BRAVO.",
    dashboardDispatchSummary:
      "Insiden DEMO-INC-SMK-03 terverifikasi pada tingkat site (SCP). Status rute koridor utilitas diperbarui menjadi Caution / Blocked pada segmen terdampak.",
    routes: [
      {
        routeCode: "Route Alpha",
        routeName: "Open East Service Road",
        destination: "Assembly Point AP-BRAVO",
        directionHint: "Timur Terbuka",
        status: "Available",
        note: "Akses terbuka dengan visibilitas baik pada skenario demonstrasi.",
      },
      {
        routeCode: "Route Gamma",
        routeName: "South Loading Apron",
        destination: "Assembly Point AP-CHARLIE",
        directionHint: "Selatan",
        status: "Caution",
        note: "Dapat dilalui dengan kewaspadaan terhadap arah hembusan asap.",
      },
      {
        routeCode: "Route West-Bay",
        routeName: "Enclosed Utility Walkway",
        destination: "West Exit",
        directionHint: "Koridor Tertutup",
        status: "Blocked",
        note: "Visibilitas koridor tertutup terdampak asap pada simulasi.",
      },
    ],
    hierarchyPlan: {
      SCP: {
        levelId: "SCP",
        activationRole: "Primary (Demo)",
        acknowledgmentStatus: "Acknowledged (Demo)",
        note: "Menangani pemeriksaan sumber asap serta koordinasi pengosongan koridor.",
      },
      ICC: {
        levelId: "ICC",
        activationRole: "Alerted (Demo)",
        acknowledgmentStatus: "Notified — Log Only (Demo)",
        note: "Menerima pembaruan informasi status insiden tingkat site.",
      },
      BSC: {
        levelId: "BSC",
        activationRole: "As Needed per SOP",
        acknowledgmentStatus: "Standby (Tidak aktif pada skenario ini)",
        note: "Tidak diaktifkan apabila insiden tertangani pada tingkat site sesuai SOP.",
      },
      CMC: {
        levelId: "CMC",
        activationRole: "As Needed per SOP",
        acknowledgmentStatus: "Standby (Sesuai SOP)",
        note: "Mengikuti ketentuan eskalasi berjenjang bila kondisi berkembang.",
      },
      EST: {
        levelId: "EST",
        activationRole: "As Needed per SOP",
        acknowledgmentStatus: "Standby (Sesuai SOP)",
        note: "Dukungan strategis mengikuti pedoman resmi fasilitas.",
      },
    },
  },
};
