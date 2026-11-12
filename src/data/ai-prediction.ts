import { AIExplosionPrediction } from "@/types/evora";

export const INITIAL_AI_EXPLOSION_PREDICTION: AIExplosionPrediction = {
  facilityId: "depot-alpha",
  targetAssetId: "asset-t102",
  targetAssetName: "Tangki Timbun T-102 (Pertalite RON 90)",
  tankProduct: "Pertalite (RON 90, 15,000 kL)",
  explosionType: "BLEVE (Boiling Liquid Expanding Vapor Explosion)",
  probabilityPct: 84.6,
  threatLevel: "CRITICAL",
  estimatedTimeToFailureSeconds: 680, // 11 Menit 20 Detik
  blastWaveRadii: {
    lethalOverpressureMeters: 48, // > 5.0 psi / 35 kPa (zona letalitas tinggi)
    structuralDamageMeters: 88,   // > 2.0 psi / 14 kPa (kerusakan baja struktural)
    glassBreakageMeters: 145,     // > 0.5 psi / 3.5 kPa (radius evakuasi aman)
  },
  telemetryFactors: {
    shellTemperatureC: 78.4,
    internalPressureBar: 3.42, // Batas kritis rupture disk: 3.50 bar
    vaporHeadLelPct: 44.2,
    reliefValveVentingKgS: 18.4,
    acousticMicroStressDb: 82.6, // Tegangan mikro pada sambungan las seam #3
  },
  mitigationActions: [
    {
      id: "act-deluge",
      title: "Aktifkan Sistem Pendingin Deluge Spray T-102",
      description: "Menyemprotkan tirai air pendingin bertekanan (1,400 L/menit) pada cangkang tangki untuk menurunkan temperatur permukaan dan mencegah BLEVE.",
      status: "recommended",
      autoDeployable: true,
    },
    {
      id: "act-transfer",
      title: "Transfer Darurat Bahan Bakar T-102 ke T-104",
      description: "Pompa transfer darurat memindahkan 4,000 kL bahan bakar dari tangki terancam T-102 ke tangki cadangan T-104 untuk mengurangi beban uap internal.",
      status: "recommended",
      autoDeployable: true,
    },
    {
      id: "act-evac-level3",
      title: "Perintahkan Evakuasi Darurat Penuh Seluruh Pos Stasioner",
      description: "Membunyikan Smart Siren tingkat 3 dan mengevakuasi seluruh pekerja di pos stasioner radius 150 meter ke Titik Kumpul AP-ALPHA dan AP-BRAVO.",
      status: "executing",
      autoDeployable: true,
    },
  ],
};
