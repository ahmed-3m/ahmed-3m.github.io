/**
 * Curated empirical data extracted from public/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
 * and the raw PyTorch score tensors (seed42_*.pt, lambda0_three_seed) and ablation JSON artefacts
 * published at https://huggingface.co/ahmed-3m/DiffusionOOD.
 */

export type OodDatasetKey =
  | 'within_cifar'
  | 'cifar100'
  | 'places365'
  | 'fashionmnist'
  | 'textures'
  | 'svhn'

export interface EmpiricalHistogram {
  lo: number
  hi: number
  bins: number
  n_id: number
  n_ood: number
  id_pct: readonly number[]
  ood_pct: readonly number[]
  roc: readonly (readonly [number, number])[]
}

export interface BenchmarkDatasetMeta {
  key: OodDatasetKey
  category: 'within' | 'near_ood' | 'far_ood'
  auroc: number
  fpr95: number
  auprc: number
  tauTpr95: number
  tauYouden: number
  youdenJ: number
  nId: number
  nOod: number
  histogram: EmpiricalHistogram
}

/**
 * Shared 48-bin empirical percentage histogram for the 1,000 CIFAR-10 airplane ID test samples
 * (seed 42, lambda = 0.02, K = 100, bins spanning [-0.0080, +0.0100]).
 */
export const SEED42_ID_PCT: readonly number[] = [0.3, 0.0, 0.3, 0.2, 0.5, 0.5, 0.6, 0.6, 0.7, 1.8, 1.8, 2.4, 2.3, 3.2, 4.8, 7.6, 9.8, 12.0, 12.8, 11.6, 9.7, 6.9, 4.9, 2.2, 1.0, 1.2, 0.1, 0.0, 0.1, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

/** Headline operating-point metrics for the lambda = 0.0 baseline (Within-CIFAR-10, seed 42). */
export const LAMBDA0_SEED42_META = {
  auroc: 79.73,
  fpr95: 60.2,
  tauTpr95: 0.013591,
  tauYouden: 0.022778,
} as const

export const LAMBDA0_SEED42_HISTOGRAM: EmpiricalHistogram = {
  lo: -0.018955152481794357,
  hi: 0.09857774525880814,
  bins: 48,
  n_id: 1000,
  n_ood: 9000,
  id_pct: [0.2, 0.0, 0.2, 0.7, 1.1, 0.7, 0.7, 1.7, 3.8, 4.4, 7.6, 9.6, 6.9, 7.9, 9.0, 8.1, 7.6, 5.2, 4.2, 4.3, 3.7, 3.0, 2.1, 2.5, 1.8, 1.2, 0.7, 0.2, 0.4, 0.2, 0.1, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  ood_pct: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.011, 0.033, 0.144, 0.467, 1.178, 2.256, 3.167, 4.156, 5.922, 6.6, 7.522, 8.6, 8.556, 8.3, 7.278, 6.889, 5.5, 5.422, 4.289, 3.8, 2.811, 2.056, 1.456, 1.022, 0.7, 0.589, 0.356, 0.256, 0.267, 0.122, 0.122, 0.067, 0.044, 0.011, 0.0, 0.011, 0.011, 0.0, 0.0, 0.0, 0.011],
  roc: [[0.0, 0.0], [0.0, 0.0001], [0.002, 0.0277], [0.006, 0.055], [0.009, 0.0824], [0.012, 0.1099], [0.018, 0.137], [0.027, 0.1638], [0.031, 0.1911], [0.041, 0.2178], [0.052, 0.2443], [0.062, 0.271], [0.074, 0.2974], [0.084, 0.3241], [0.093, 0.3509], [0.096, 0.3783], [0.116, 0.4039], [0.124, 0.4308], [0.135, 0.4573], [0.147, 0.4838], [0.157, 0.5104], [0.176, 0.5361], [0.182, 0.5632], [0.201, 0.5889], [0.212, 0.6154], [0.223, 0.642], [0.234, 0.6686], [0.256, 0.6939], [0.271, 0.72], [0.283, 0.7464], [0.313, 0.7709], [0.338, 0.7959], [0.368, 0.8203], [0.396, 0.845], [0.428, 0.8692], [0.467, 0.8927], [0.519, 0.9147], [0.565, 0.9373], [0.623, 0.9587], [0.681, 0.98], [0.803, 0.9942], [1.0, 1.0]],
}

export const BENCHMARK_DATASETS: Record<OodDatasetKey, BenchmarkDatasetMeta> = {
  within_cifar: {
    key: 'within_cifar',
    category: 'within',
    auroc: 98.98,
    fpr95: 4.7,
    auprc: 99.87,
    tauTpr95: 0.000612,
    tauYouden: 0.000589,
    youdenJ: 90.46,
    nId: 1000,
    nOod: 9000,
    histogram: {
      lo: -0.008,
      hi: 0.01,
      bins: 48,
      n_id: 1000,
      n_ood: 9000,
      id_pct: SEED42_ID_PCT,
      ood_pct: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.033, 0.222, 0.456, 1.422, 3.011, 5.422, 7.522, 10.3, 10.8, 10.511, 9.911, 8.6, 6.833, 6.111, 4.989, 3.644, 2.811, 2.2, 1.533, 0.822, 0.878, 0.633, 0.422, 0.3, 0.178, 0.167, 0.078, 0.089, 0.056, 0.044],
      roc: [[0.0, 0.0], [0.0, 0.0001], [0.0, 0.0279], [0.0, 0.0557], [0.0, 0.0834], [0.0, 0.1112], [0.0, 0.139], [0.0, 0.1668], [0.0, 0.1946], [0.0, 0.2223], [0.0, 0.2501], [0.0, 0.2779], [0.001, 0.3056], [0.001, 0.3333], [0.001, 0.3611], [0.001, 0.3889], [0.001, 0.4167], [0.001, 0.4444], [0.001, 0.4722], [0.002, 0.4999], [0.002, 0.5277], [0.002, 0.5554], [0.002, 0.5832], [0.002, 0.611], [0.002, 0.6388], [0.002, 0.6666], [0.003, 0.6942], [0.003, 0.722], [0.006, 0.7494], [0.009, 0.7769], [0.013, 0.8042], [0.015, 0.8318], [0.019, 0.8591], [0.024, 0.8863], [0.029, 0.9136], [0.042, 0.9399], [0.067, 0.9649], [0.121, 0.9867], [0.273, 0.9976], [0.501, 1.0], [0.751, 1.0], [1.0, 1.0]],
    },
  },
  cifar100: {
    key: 'cifar100',
    category: 'near_ood',
    auroc: 96.97,
    fpr95: 14.8,
    auprc: 99.65,
    tauTpr95: -0.000052,
    tauYouden: 0.000302,
    youdenJ: 81.96,
    nId: 1000,
    nOod: 10000,
    histogram: {
      lo: -0.008,
      hi: 0.01,
      bins: 48,
      n_id: 1000,
      n_ood: 10000,
      id_pct: SEED42_ID_PCT,
      ood_pct: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.01, 0.0, 0.0, 0.0, 0.0, 0.0, 0.01, 0.04, 0.02, 0.03, 0.12, 0.42, 1.16, 2.55, 4.59, 7.47, 10.57, 11.84, 11.7, 10.75, 9.4, 7.49, 5.85, 4.9, 3.86, 2.55, 1.73, 1.11, 0.61, 0.44, 0.29, 0.14, 0.15, 0.11, 0.03, 0.03, 0.02, 0.01, 0.0, 0.0, 0.0],
      roc: [[0.0, 0.0], [0.0, 0.0001], [0.0, 0.0276], [0.0, 0.0551], [0.0, 0.0826], [0.0, 0.1101], [0.001, 0.1375], [0.001, 0.165], [0.001, 0.1925], [0.001, 0.22], [0.001, 0.2475], [0.002, 0.2749], [0.002, 0.3024], [0.002, 0.3299], [0.002, 0.3574], [0.002, 0.3849], [0.002, 0.4124], [0.002, 0.4399], [0.003, 0.4673], [0.003, 0.4948], [0.005, 0.5221], [0.008, 0.5493], [0.011, 0.5765], [0.014, 0.6037], [0.015, 0.6311], [0.019, 0.6582], [0.019, 0.6857], [0.023, 0.7128], [0.025, 0.7401], [0.029, 0.7672], [0.035, 0.7941], [0.043, 0.8208], [0.052, 0.8474], [0.064, 0.8737], [0.082, 0.8994], [0.11, 0.9241], [0.143, 0.9483], [0.209, 0.9692], [0.302, 0.9874], [0.482, 0.9969], [0.733, 0.9993], [1.0, 1.0]],
    },
  },
  places365: {
    key: 'places365',
    category: 'far_ood',
    auroc: 96.50,
    fpr95: 15.4,
    auprc: 99.57,
    tauTpr95: -0.000072,
    tauYouden: 0.000115,
    youdenJ: 81.08,
    nId: 1000,
    nOod: 10000,
    histogram: {
      lo: -0.008,
      hi: 0.01,
      bins: 48,
      n_id: 1000,
      n_ood: 10000,
      id_pct: SEED42_ID_PCT,
      ood_pct: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.02, 0.0, 0.0, 0.0, 0.0, 0.02, 0.0, 0.01, 0.06, 0.03, 0.08, 0.16, 0.29, 1.06, 2.75, 5.7, 9.65, 12.96, 13.91, 13.55, 11.89, 9.38, 6.9, 4.17, 2.88, 1.75, 1.16, 0.63, 0.42, 0.16, 0.13, 0.1, 0.08, 0.03, 0.02, 0.03, 0.01, 0.01, 0.0, 0.0, 0.0, 0.0],
      roc: [[0.0, 0.0], [0.0, 0.0001], [0.0, 0.0276], [0.0, 0.0551], [0.001, 0.0825], [0.001, 0.11], [0.001, 0.1375], [0.001, 0.165], [0.002, 0.1924], [0.002, 0.2199], [0.002, 0.2474], [0.002, 0.2749], [0.002, 0.3024], [0.002, 0.3299], [0.002, 0.3574], [0.003, 0.3848], [0.003, 0.4123], [0.007, 0.4394], [0.009, 0.4667], [0.011, 0.494], [0.014, 0.5212], [0.015, 0.5486], [0.016, 0.576], [0.019, 0.6032], [0.021, 0.6305], [0.024, 0.6577], [0.025, 0.6851], [0.028, 0.7123], [0.034, 0.7392], [0.04, 0.7661], [0.046, 0.793], [0.052, 0.8199], [0.062, 0.8464], [0.076, 0.8725], [0.095, 0.8981], [0.113, 0.9238], [0.148, 0.9478], [0.203, 0.9698], [0.298, 0.9878], [0.491, 0.996], [0.74, 0.9986], [1.0, 1.0]],
    },
  },
  fashionmnist: {
    key: 'fashionmnist',
    category: 'far_ood',
    auroc: 94.03,
    fpr95: 20.5,
    auprc: 99.16,
    tauTpr95: -0.000290,
    tauYouden: -0.000173,
    youdenJ: 74.98,
    nId: 1000,
    nOod: 10000,
    histogram: {
      lo: -0.008,
      hi: 0.01,
      bins: 48,
      n_id: 1000,
      n_ood: 10000,
      id_pct: SEED42_ID_PCT,
      ood_pct: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.01, 0.07, 0.21, 1.54, 7.25, 13.9, 17.37, 16.31, 14.57, 10.4, 6.91, 4.77, 2.83, 1.79, 0.9, 0.44, 0.26, 0.17, 0.11, 0.06, 0.06, 0.06, 0.01, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      roc: [[0.0, 0.0], [0.0, 0.0001], [0.001, 0.0275], [0.001, 0.055], [0.002, 0.0824], [0.002, 0.1099], [0.002, 0.1374], [0.003, 0.1648], [0.003, 0.1923], [0.008, 0.2193], [0.01, 0.2466], [0.014, 0.2737], [0.015, 0.3011], [0.017, 0.3284], [0.019, 0.3557], [0.02, 0.3831], [0.023, 0.4103], [0.025, 0.4376], [0.027, 0.4649], [0.03, 0.4921], [0.035, 0.5191], [0.04, 0.5461], [0.043, 0.5733], [0.047, 0.6004], [0.052, 0.6274], [0.057, 0.6544], [0.067, 0.6809], [0.074, 0.7077], [0.08, 0.7346], [0.09, 0.7611], [0.106, 0.787], [0.113, 0.8138], [0.124, 0.8402], [0.138, 0.8663], [0.153, 0.8923], [0.172, 0.9179], [0.2, 0.9426], [0.224, 0.9677], [0.293, 0.9883], [0.463, 0.9988], [0.726, 1.0], [1.0, 1.0]],
    },
  },
  textures: {
    key: 'textures',
    category: 'far_ood',
    auroc: 92.84,
    fpr95: 30.1,
    auprc: 95.97,
    tauTpr95: -0.000625,
    tauYouden: -0.000171,
    youdenJ: 71.42,
    nId: 1000,
    nOod: 1880,
    histogram: {
      lo: -0.008,
      hi: 0.01,
      bins: 48,
      n_id: 1000,
      n_ood: 1880,
      id_pct: SEED42_ID_PCT,
      ood_pct: [0.106, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.106, 0.0, 0.0, 0.16, 0.106, 0.053, 0.053, 0.106, 0.372, 0.798, 0.638, 1.117, 2.553, 6.383, 8.83, 12.128, 12.394, 10.16, 10.266, 7.447, 6.968, 5.372, 4.468, 2.287, 2.287, 1.596, 0.851, 0.638, 0.585, 0.319, 0.213, 0.053, 0.106, 0.053, 0.16, 0.0, 0.0, 0.106, 0.053, 0.106, 0.0],
      roc: [[0.0, 0.0], [0.0, 0.0005], [0.0, 0.0388], [0.0, 0.0771], [0.001, 0.1149], [0.001, 0.1532], [0.002, 0.191], [0.002, 0.2293], [0.002, 0.2676], [0.002, 0.3059], [0.003, 0.3436], [0.008, 0.3793], [0.012, 0.4154], [0.015, 0.4521], [0.019, 0.4883], [0.023, 0.5245], [0.026, 0.5612], [0.033, 0.5957], [0.04, 0.6303], [0.047, 0.6649], [0.054, 0.6995], [0.069, 0.7298], [0.079, 0.7628], [0.097, 0.7915], [0.118, 0.8186], [0.14, 0.8452], [0.164, 0.8707], [0.19, 0.8952], [0.218, 0.9186], [0.257, 0.9362], [0.302, 0.9505], [0.353, 0.9617], [0.415, 0.967], [0.478, 0.9718], [0.542, 0.9761], [0.608, 0.9793], [0.67, 0.9846], [0.731, 0.9904], [0.798, 0.9931], [0.868, 0.9941], [0.934, 0.9973], [1.0, 1.0]],
    },
  },
  svhn: {
    key: 'svhn',
    category: 'far_ood',
    auroc: 90.50,
    fpr95: 27.0,
    auprc: 99.38,
    tauTpr95: -0.000527,
    tauYouden: -0.000405,
    youdenJ: 69.70,
    nId: 1000,
    nOod: 26032,
    histogram: {
      lo: -0.008,
      hi: 0.01,
      bins: 48,
      n_id: 1000,
      n_ood: 26032,
      id_pct: SEED42_ID_PCT,
      ood_pct: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.027, 0.134, 1.049, 4.299, 12.654, 21.12, 22.288, 17.098, 10.764, 5.543, 2.804, 1.279, 0.569, 0.254, 0.065, 0.035, 0.008, 0.012, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      roc: [[0.0, 0.0], [0.0, 0.0], [0.002, 0.0259], [0.003, 0.0518], [0.01, 0.0774], [0.015, 0.1032], [0.016, 0.1291], [0.019, 0.1549], [0.022, 0.1807], [0.024, 0.2066], [0.026, 0.2324], [0.028, 0.2583], [0.031, 0.2841], [0.036, 0.3098], [0.04, 0.3356], [0.045, 0.3613], [0.047, 0.3872], [0.052, 0.4129], [0.054, 0.4388], [0.059, 0.4645], [0.068, 0.4901], [0.073, 0.5158], [0.076, 0.5416], [0.082, 0.5673], [0.09, 0.593], [0.098, 0.6186], [0.106, 0.6442], [0.113, 0.6699], [0.116, 0.6957], [0.128, 0.7212], [0.136, 0.7468], [0.143, 0.7724], [0.159, 0.7977], [0.168, 0.8233], [0.186, 0.8486], [0.202, 0.8739], [0.215, 0.8993], [0.23, 0.9247], [0.27, 0.9491], [0.319, 0.9731], [0.435, 0.9946], [0.969, 1.0], [1.0, 1.0]],
    },
  },
}

// Thesis Figure 6.7 / timestep_strategy_results.json (per_timestep block)
export interface TimestepErrorPoint {
  t: number
  alphaBar: number
  idC0Mean: number
  idC0Std: number
  idC1Mean: number
  idC1Std: number
  oodC0Mean: number
  oodC0Std: number
  oodC1Mean: number
  oodC1Std: number
}

export const PER_TIMESTEP_ERRORS: readonly TimestepErrorPoint[] = [
  { t: 50,  alphaBar: 0.9698, idC0Mean: 0.16123, idC0Std: 0.05786, idC1Mean: 0.16164, idC1Std: 0.05788, oodC0Mean: 0.22906, oodC0Std: 0.06500, oodC1Mean: 0.22520, oodC1Std: 0.06433 },
  { t: 100, alphaBar: 0.9301, idC0Mean: 0.10443, idC0Std: 0.03873, idC1Mean: 0.10665, idC1Std: 0.03953, oodC0Mean: 0.15223, oodC0Std: 0.04274, oodC1Mean: 0.15000, oodC1Std: 0.04188 },
  { t: 150, alphaBar: 0.8795, idC0Mean: 0.07751, idC0Std: 0.02979, idC1Mean: 0.07938, idC1Std: 0.03032, oodC0Mean: 0.11632, oodC0Std: 0.03304, oodC1Mean: 0.11322, oodC1Std: 0.03250 },
  { t: 200, alphaBar: 0.8192, idC0Mean: 0.06271, idC0Std: 0.02426, idC1Mean: 0.06441, idC1Std: 0.02475, oodC0Mean: 0.09287, oodC0Std: 0.02636, oodC1Mean: 0.08937, oodC1Std: 0.02512 },
  { t: 250, alphaBar: 0.7506, idC0Mean: 0.05240, idC0Std: 0.02019, idC1Mean: 0.05425, idC1Std: 0.02067, oodC0Mean: 0.07722, oodC0Std: 0.02263, oodC1Mean: 0.07323, oodC1Std: 0.02184 },
  { t: 300, alphaBar: 0.6755, idC0Mean: 0.04459, idC0Std: 0.01662, idC1Mean: 0.04684, idC1Std: 0.01770, oodC0Mean: 0.06502, oodC0Std: 0.01952, oodC1Mean: 0.06205, oodC1Std: 0.01827 },
  { t: 350, alphaBar: 0.5957, idC0Mean: 0.03880, idC0Std: 0.01450, idC1Mean: 0.04029, idC1Std: 0.01479, oodC0Mean: 0.05568, oodC0Std: 0.01651, oodC1Mean: 0.05242, oodC1Std: 0.01607 },
  { t: 400, alphaBar: 0.5132, idC0Mean: 0.03374, idC0Std: 0.01321, idC1Mean: 0.03526, idC1Std: 0.01342, oodC0Mean: 0.04731, oodC0Std: 0.01377, oodC1Mean: 0.04498, oodC1Std: 0.01482 },
  { t: 450, alphaBar: 0.4301, idC0Mean: 0.02908, idC0Std: 0.01096, idC1Mean: 0.03097, idC1Std: 0.01146, oodC0Mean: 0.04149, oodC0Std: 0.01285, oodC1Mean: 0.03946, oodC1Std: 0.01282 },
  { t: 500, alphaBar: 0.3484, idC0Mean: 0.02625, idC0Std: 0.00972, idC1Mean: 0.02735, idC1Std: 0.01012, oodC0Mean: 0.03469, oodC0Std: 0.01057, oodC1Mean: 0.03323, oodC1Std: 0.01006 },
  { t: 550, alphaBar: 0.2703, idC0Mean: 0.02242, idC0Std: 0.00826, idC1Mean: 0.02350, idC1Std: 0.00851, oodC0Mean: 0.03003, oodC0Std: 0.00945, oodC1Mean: 0.02763, oodC1Std: 0.00924 },
  { t: 600, alphaBar: 0.1977, idC0Mean: 0.01921, idC0Std: 0.00684, idC1Mean: 0.01996, idC1Std: 0.00704, oodC0Mean: 0.02520, oodC0Std: 0.00757, oodC1Mean: 0.02335, oodC1Std: 0.00742 },
  { t: 650, alphaBar: 0.1325, idC0Mean: 0.01615, idC0Std: 0.00620, idC1Mean: 0.01686, idC1Std: 0.00642, oodC0Mean: 0.02071, oodC0Std: 0.00704, oodC1Mean: 0.01983, oodC1Std: 0.00665 },
  { t: 700, alphaBar: 0.0764, idC0Mean: 0.01318, idC0Std: 0.00462, idC1Mean: 0.01390, idC1Std: 0.00478, oodC0Mean: 0.01673, oodC0Std: 0.00529, oodC1Mean: 0.01560, oodC1Std: 0.00492 },
  { t: 750, alphaBar: 0.0310, idC0Mean: 0.01048, idC0Std: 0.00368, idC1Mean: 0.01089, idC1Std: 0.00381, oodC0Mean: 0.01303, oodC0Std: 0.00411, oodC1Mean: 0.01250, oodC1Std: 0.00425 },
  { t: 800, alphaBar: 0.0095, idC0Mean: 0.00802, idC0Std: 0.00285, idC1Mean: 0.00841, idC1Std: 0.00297, oodC0Mean: 0.00945, oodC0Std: 0.00306, oodC1Mean: 0.00966, oodC1Std: 0.00328 },
  { t: 850, alphaBar: 0.0055, idC0Mean: 0.00572, idC0Std: 0.00221, idC1Mean: 0.00598, idC1Std: 0.00232, oodC0Mean: 0.00629, oodC0Std: 0.00218, oodC1Mean: 0.00629, oodC1Std: 0.00205 },
  { t: 900, alphaBar: 0.0024, idC0Mean: 0.00349, idC0Std: 0.00134, idC1Mean: 0.00359, idC1Std: 0.00140, oodC0Mean: 0.00360, oodC0Std: 0.00125, oodC1Mean: 0.00346, oodC1Std: 0.00127 },
  { t: 950, alphaBar: 0.0006, idC0Mean: 0.00142, idC0Std: 0.00046, idC1Mean: 0.00146, idC1Std: 0.00045, oodC0Mean: 0.00140, oodC0Std: 0.00049, oodC1Mean: 0.00147, oodC1Std: 0.00054 },
] as const

// Thesis Table 6.5 & D.3 — OOD Scoring Method Ablation (seed 42, lambda=0.01, K=50)
export type ScoringRuleKey = 'difference' | 'ratio' | 'id_error'

export interface ScoringMethodEntry {
  key: ScoringRuleKey
  formulaLatex: string
  cifarAuroc: number
  cifarFpr95: number
  cifarAupr: number
  svhnAuroc: number
  svhnFpr95: number
  svhnAupr: number
}

export const SCORING_METHODS: Record<ScoringRuleKey, ScoringMethodEntry> = {
  difference: {
    key: 'difference',
    formulaLatex: 's_\\text{OOD}(x) = \\hat{e}_0(x) - \\hat{e}_1(x)',
    cifarAuroc: 98.69,
    cifarFpr95: 6.3,
    cifarAupr: 99.84,
    svhnAuroc: 94.13,
    svhnFpr95: 19.6,
    svhnAupr: 99.67,
  },
  ratio: {
    key: 'ratio',
    formulaLatex: 's_\\text{ratio}(x) = \\hat{e}_0(x) / \\hat{e}_1(x)',
    cifarAuroc: 98.62,
    cifarFpr95: 6.6,
    cifarAupr: 99.83,
    svhnAuroc: 96.06,
    svhnFpr95: 22.5,
    svhnAupr: 99.83,
  },
  id_error: {
    key: 'id_error',
    formulaLatex: 's_\\text{id-only}(x) = \\hat{e}_0(x)',
    cifarAuroc: 78.30,
    cifarFpr95: 67.0,
    cifarAupr: 96.54,
    svhnAuroc: 20.23,
    svhnFpr95: 96.5,
    svhnAupr: 90.81,
  },
}

// Thesis Table 6.4 — Timestep Sampling Strategy (seed 42, lambda=0.01, K=50)
export interface TimestepStrategyEntry {
  key: 'uniform' | 'stratified' | 'mid_focus'
  distribution: string
  cifarAuroc: number
  cifarFpr95: number
  svhnAuroc: number
  svhnFpr95: number
}

export const TIMESTEP_STRATEGIES: readonly TimestepStrategyEntry[] = [
  { key: 'uniform',    distribution: 't ~ U[1, 1000]',              cifarAuroc: 98.87, cifarFpr95: 5.4, svhnAuroc: 95.44, svhnFpr95: 14.6 },
  { key: 'stratified', distribution: 'K equal bins over [1, 1000]', cifarAuroc: 98.81, cifarFpr95: 5.9, svhnAuroc: 94.98, svhnFpr95: 16.3 },
  { key: 'mid_focus',  distribution: 'N_trunc(mu=300, sigma=150)',  cifarAuroc: 98.55, cifarFpr95: 7.6, svhnAuroc: 93.80, svhnFpr95: 19.7 },
] as const

// Thesis Table 6.3 & D.2 — Monte Carlo Trials K Ablation (seed 42, lambda=0.01)
export interface KAblationEntry {
  k: 1 | 5 | 10 | 25 | 50 | 100
  auroc: number
  fpr95: number
  aupr: number
  timeSeconds10k: number
  msPerSample: number
  resnetMultiple: string
  recommended?: boolean
}

export const K_ABLATION_TABLE: readonly KAblationEntry[] = [
  { k: 1,   auroc: 91.00, fpr95: 40.8, aupr: 98.77, timeSeconds10k: 97.9,   msPerSample: 9.8,   resnetMultiple: 'Fast triage (un-retimed)' },
  { k: 5,   auroc: 97.24, fpr95: 14.3, aupr: 99.66, timeSeconds10k: 486.3,  msPerSample: 48.6,  resnetMultiple: '~34.3x ResNet-18' },
  { k: 10,  auroc: 98.19, fpr95: 9.4,  aupr: 99.78, timeSeconds10k: 972.9,  msPerSample: 97.3,  resnetMultiple: '68.6x ResNet-18 (5x speedup)', recommended: true },
  { k: 25,  auroc: 98.52, fpr95: 7.3,  aupr: 99.82, timeSeconds10k: 2431.8, msPerSample: 243.2, resnetMultiple: '~246x ResNet-18' },
  { k: 50,  auroc: 98.64, fpr95: 6.6,  aupr: 99.84, timeSeconds10k: 4861.1, msPerSample: 486.1, resnetMultiple: '492.4x ResNet-18 (Default)' },
  { k: 100, auroc: 98.69, fpr95: 6.6,  aupr: 99.84, timeSeconds10k: 9723.6, msPerSample: 972.4, resnetMultiple: '~985x ResNet-18 (Core Eval)' },
] as const

// Thesis Table 6.6 & D.1 — Within-CIFAR Lambda Sweep
export interface LambdaSweepEntry {
  lambda: string
  withinCifarMean: number
  withinCifarStd: number | null
  seeds: readonly number[]
  bestEpochSeed42: number
  svhnAuroc: number
  svhnArtefact?: boolean
  isOptimal?: boolean
}

export const CIFAR_LAMBDA_SWEEP: readonly LambdaSweepEntry[] = [
  { lambda: '0.0',   withinCifarMean: 92.52, withinCifarStd: 11.07, seeds: [79.73, 98.81, 99.01], bestEpochSeed42: 79,  svhnAuroc: 100.0, svhnArtefact: true },
  { lambda: '0.001', withinCifarMean: 97.32, withinCifarStd: null,  seeds: [97.32],               bestEpochSeed42: 19,  svhnAuroc: 92.0 },
  { lambda: '0.01',  withinCifarMean: 98.82, withinCifarStd: 0.06,  seeds: [98.73, 98.86, 98.87], bestEpochSeed42: 19,  svhnAuroc: 90.5 },
  { lambda: '0.02',  withinCifarMean: 99.03, withinCifarStd: 0.07,  seeds: [99.11, 98.95, 99.04], bestEpochSeed42: 29,  svhnAuroc: 96.6,  isOptimal: true },
  { lambda: '0.05',  withinCifarMean: 98.51, withinCifarStd: null,  seeds: [98.51],               bestEpochSeed42: 19,  svhnAuroc: 97.3 },
  { lambda: '0.1',   withinCifarMean: 96.67, withinCifarStd: null,  seeds: [96.67],               bestEpochSeed42: 149, svhnAuroc: 86.9,  svhnArtefact: true },
] as const

// Thesis Table 6.7 & 6.8 — Inkjet QC (FTI_Zer0P, 5-Fold Stratified Image-Level CV, K=100)
export type InkjetLambdaKey = '0.0' | '0.01' | '0.02' | '0.05'

export interface InkjetOverallEntry {
  lambda: InkjetLambdaKey
  aurocMean: number
  aurocStd: number
  accMean: number
  accStd: number
  fpr95Mean: number
  fpr95Std: number
  rawPValue: number | null
  holmPValue: number | null
}

export const INKJET_OVERALL_SWEEP: Record<InkjetLambdaKey, InkjetOverallEntry> = {
  '0.0':  { lambda: '0.0',  aurocMean: 0.8673, aurocStd: 0.0230, accMean: 0.8094, accStd: 0.0151, fpr95Mean: 0.5631, fpr95Std: 0.1697, rawPValue: null,  holmPValue: null },
  '0.01': { lambda: '0.01', aurocMean: 0.8628, aurocStd: 0.0286, accMean: 0.7928, accStd: 0.0291, fpr95Mean: 0.5516, fpr95Std: 0.1841, rawPValue: 0.371, holmPValue: 0.742 },
  '0.02': { lambda: '0.02', aurocMean: 0.8510, aurocStd: 0.0326, accMean: 0.8003, accStd: 0.0246, fpr95Mean: 0.6240, fpr95Std: 0.1334, rawPValue: 0.143, holmPValue: 0.429 },
  '0.05': { lambda: '0.05', aurocMean: 0.8670, aurocStd: 0.0256, accMean: 0.8071, accStd: 0.0241, fpr95Mean: 0.5700, fpr95Std: 0.1948, rawPValue: 0.967, holmPValue: 0.967 },
}

export interface InkjetFeatureRow {
  feature: string
  goodBadRatio: string
  unreliableNote?: boolean
  byLambda: Record<InkjetLambdaKey, { mean: number; std: number }>
}

export const INKJET_PER_FEATURE: readonly InkjetFeatureRow[] = [
  {
    feature: 'Dots',
    goodBadRatio: '3.45 : 1',
    byLambda: {
      '0.0':  { mean: 0.9557, std: 0.0353 },
      '0.01': { mean: 0.9655, std: 0.0247 },
      '0.02': { mean: 0.9474, std: 0.0400 },
      '0.05': { mean: 0.9413, std: 0.0394 },
    },
  },
  {
    feature: 'Distance 6',
    goodBadRatio: '1.94 : 1',
    byLambda: {
      '0.0':  { mean: 0.9362, std: 0.0666 },
      '0.01': { mean: 0.9423, std: 0.0737 },
      '0.02': { mean: 0.9393, std: 0.0750 },
      '0.05': { mean: 0.9473, std: 0.0710 },
    },
  },
  {
    feature: 'Distance 1',
    goodBadRatio: '1.82 : 1',
    byLambda: {
      '0.0':  { mean: 0.8866, std: 0.0729 },
      '0.01': { mean: 0.8508, std: 0.0768 },
      '0.02': { mean: 0.8274, std: 0.1457 },
      '0.05': { mean: 0.8828, std: 0.0581 },
    },
  },
  {
    feature: 'Angle†',
    goodBadRatio: '9.67 : 1',
    unreliableNote: true,
    byLambda: {
      '0.0':  { mean: 0.8166, std: 0.1381 },
      '0.01': { mean: 0.7727, std: 0.1580 },
      '0.02': { mean: 0.7682, std: 0.1836 },
      '0.05': { mean: 0.7378, std: 0.1593 },
    },
  },
  {
    feature: 'Edge 2',
    goodBadRatio: '1.68–2.31 : 1',
    byLambda: {
      '0.0':  { mean: 0.8129, std: 0.0307 },
      '0.01': { mean: 0.8426, std: 0.0443 },
      '0.02': { mean: 0.7993, std: 0.0602 },
      '0.05': { mean: 0.8402, std: 0.0283 },
    },
  },
  {
    feature: 'Edge 1',
    goodBadRatio: '1.68–2.31 : 1',
    byLambda: {
      '0.0':  { mean: 0.7958, std: 0.1376 },
      '0.01': { mean: 0.8410, std: 0.1379 },
      '0.02': { mean: 0.7823, std: 0.1607 },
      '0.05': { mean: 0.8574, std: 0.1283 },
    },
  },
  {
    feature: 'Edge 4',
    goodBadRatio: '1.68–2.31 : 1',
    byLambda: {
      '0.0':  { mean: 0.7617, std: 0.0985 },
      '0.01': { mean: 0.7529, std: 0.0543 },
      '0.02': { mean: 0.7643, std: 0.0898 },
      '0.05': { mean: 0.7775, std: 0.1125 },
    },
  },
  {
    feature: 'Edge 3',
    goodBadRatio: '1.68–2.31 : 1',
    byLambda: {
      '0.0':  { mean: 0.7441, std: 0.0757 },
      '0.01': { mean: 0.7008, std: 0.0390 },
      '0.02': { mean: 0.7774, std: 0.0647 },
      '0.05': { mean: 0.7349, std: 0.0596 },
    },
  },
] as const
