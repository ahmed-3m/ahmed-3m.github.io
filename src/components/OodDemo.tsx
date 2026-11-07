'use client'

import React, { useState, useId, useMemo } from 'react'
import {
  Plane,
  Car,
  Bird,
  Ship,
  Truck,
  Sliders,
  Shield,
  CheckCircle2,
  AlertCircle,
  Info,
  Layers,
  Sparkles,
  BarChart3,
} from 'lucide-react'
import { useI18n, type TranslationMap } from '@/lib/i18n'

export type MethodKey = 'cc_ddpm' | 'uncond_ddpm' | 'vae' | 'ae'

interface SampleMetrics {
  mse: number
  lpips: number
}

interface SampleData {
  id: string
  categoryKey: 'plane1' | 'plane2' | 'car' | 'bird' | 'ship' | 'truck'
  groundTruth: 'ID' | 'OOD'
  icon: React.ComponentType<{ className?: string; size?: number }>
  title: TranslationMap
  description: TranslationMap
  metrics: Record<MethodKey, SampleMetrics>
}

const copy = {
  eyebrow: {
    en: 'Interactive Thesis Explorer',
    de: 'Interaktiver Thesis-Explorer',
    fr: 'Explorateur interactif de thèse',
    es: 'Explorador interactivo de tesis',
    ar: 'مستكشف الأطروحة التفاعلي',
  },
  title: {
    en: 'Diffusion OOD Detection & Anomaly Scoring Lab',
    de: 'Diffusions-OOD-Erkennung & Anomaliebewertungs-Labor',
    fr: "Laboratoire de détection OOD & score d'anomalie par diffusion",
    es: 'Laboratorio de detección OOD y puntuación de anomalías por difusión',
    ar: 'مختبر كشف العينات الشاذة وتقييم الانحراف بالانتشار',
  },
  subtitle: {
    en: "Explore real precomputed reconstruction metrics from Ahmed's JKU Linz Master's thesis (Table 6.1). Observe how class-conditional separation loss (λ = 0.02) separates in-distribution airplanes from out-of-distribution classes with 99.03% AUROC.",
    de: 'Erkunden Sie reale vorberechnete Rekonstruktionsmetriken aus Ahmeds JKU Linz Masterarbeit (Tabelle 6.1). Erleben Sie, wie klassenkonditionale Trennungsverluste (λ = 0,02) In-Distribution-Flugzeuge mit 99,03 % AUROC von OOD-Klassen trennen.',
    fr: "Explorez les métriques de reconstruction réelles du mémoire de master d'Ahmed à JKU Linz (Tableau 6.1). Observez comment la perte de séparation conditionnelle (λ = 0,02) isole les avions en distribution avec 99,03 % d'AUROC.",
    es: 'Explore métricas de reconstrucción reales de la tesis de maestría de Ahmed en JKU Linz (Tabla 6.1). Compruebe cómo la pérdida de separación condicional (λ = 0.02) aísla aviones en distribución con 99.03% de AUROC.',
    ar: 'استكشف مقاييس إعادة البناء المحسوبة مسبقاً من أطروحة ماجستير أحمد في جامعة JKU لينتس (جدول 6.1). شاهد كيف تفصل دالة الفقد المشروطة (λ = 0.02) طائرات التوزيع عن الفئات الشاذة بمعدل 99.03% AUROC.',
  },
  scopeBadge: {
    en: 'Scope: Binary airplane-vs-rest · 3 random seeds · Table 6.1 (JKU Linz)',
    de: 'Umfang: Binär Flugzeug vs. Rest · 3 Zufalls-Seeds · Tabelle 6.1 (JKU Linz)',
    fr: 'Périmètre : Binaire avion contre reste · 3 graines · Tableau 6.1 (JKU Linz)',
    es: 'Alcance: Binario avión vs. resto · 3 semillas aleatorias · Tabla 6.1 (JKU Linz)',
    ar: 'النطاق: تصنيف ثنائي طائرة مقابل البقية · 3 بذور عشوائية · جدول 6.1 (JKU لينتس)',
  },
  zeroInferenceBadge: {
    en: 'Zero client inference · 100% precomputed from thesis benchmark eval',
    de: 'Keine Client-Inferenz · 100% vorberechnet aus Thesis-Benchmark-Eval',
    fr: 'Zéro inférence client · 100 % précalculé depuis les tests de la thèse',
    es: 'Cero inferencia en cliente · 100% precalculado de la evaluación de tesis',
    ar: 'بدون استدلال في المتصفح · محسوب مسبقاً بنسبة 100% من تقييم الأطروحة',
  },
  methodsHeading: {
    en: '1. Select Reconstruction Architecture',
    de: '1. Rekonstruktionsarchitektur wählen',
    fr: '1. Choisir l’architecture de reconstruction',
    es: '1. Seleccionar arquitectura de reconstrucción',
    ar: '1. اختر معمارية إعادة البناء',
  },
  controlsHeading: {
    en: '2. Threshold (τ) & Perceptual Balance (α)',
    de: '2. Schwellenwert (τ) & Metrikgewichtung (α)',
    fr: '2. Seuil (τ) & Équilibre perceptuel (α)',
    es: '2. Umbral (τ) y Balance perceptual (α)',
    ar: '2. عتبة القرار (τ) والوزن الإدراكي (α)',
  },
  thresholdLabel: {
    en: 'Decision Threshold (τ)',
    de: 'Entscheidungsschwelle (τ)',
    fr: 'Seuil de décision (τ)',
    es: 'Umbral de decisión (τ)',
    ar: 'عتبة القرار (τ)',
  },
  thresholdDesc: {
    en: 'Samples with anomaly score S(x) > τ are flagged as Out-of-Distribution (OOD).',
    de: 'Muster mit Anomaliewert S(x) > τ werden als Out-of-Distribution (OOD) eingestuft.',
    fr: 'Les échantillons avec score S(x) > τ sont classés hors distribution (OOD).',
    es: 'Las muestras con puntuación S(x) > τ se clasifican como fuera de distribución (OOD).',
    ar: 'العينات ذات درجة الشذوذ S(x) > τ تصنف كعينات شاذة خارج التوزيع (OOD).',
  },
  weightLabel: {
    en: 'Perceptual Metric Weight (α)',
    de: 'Perzeptuelles Metrikgewicht (α)',
    fr: 'Poids de la métrique perceptuelle (α)',
    es: 'Ponderación de métrica perceptual (α)',
    ar: 'الوزن الإدراكي للمقياس (α)',
  },
  weightFormula: {
    en: 'Anomaly Score Formula: S(x) = α · MSE + (1 - α) · LPIPS',
    de: 'Anomalieformel: S(x) = α · MSE + (1 - α) · LPIPS',
    fr: "Formule du score d'anomalie : S(x) = α · MSE + (1 - α) · LPIPS",
    es: 'Fórmula de puntuación de anomalía: S(x) = α · MSE + (1 - α) · LPIPS',
    ar: 'معادلة درجة الشذوذ: S(x) = α · MSE + (1 - α) · LPIPS',
  },
  presetsLabel: {
    en: 'Quick Presets:',
    de: 'Schnell-Voreinstellungen:',
    fr: 'Préréglages rapides :',
    es: 'Preajustes rápidos:',
    ar: 'إعدادات مسبقة سريعة:',
  },
  presetBalanced: {
    en: 'Balanced (τ=0.45, α=0.50)',
    de: 'Ausgewogen (τ=0.45, α=0.50)',
    fr: 'Équilibré (τ=0,45, α=0,50)',
    es: 'Equilibrado (τ=0.45, α=0.50)',
    ar: 'متوازن (τ=0.45، α=0.50)',
  },
  presetSensitivity: {
    en: 'High Sensitivity (τ=0.30, α=0.40)',
    de: 'Hohe Sensitivität (τ=0.30, α=0.40)',
    fr: 'Haute sensibilité (τ=0,30, α=0,40)',
    es: 'Alta sensibilidad (τ=0.30, α=0.40)',
    ar: 'حساسية عالية (τ=0.30، α=0.40)',
  },
  presetSpecificity: {
    en: 'Strict Specificity (τ=0.60, α=0.60)',
    de: 'Strikte Spezifität (τ=0.60, α=0.60)',
    fr: 'Spécificité stricte (τ=0,60, α=0,60)',
    es: 'Especificidad estricta (τ=0.60, α=0.60)',
    ar: 'نوعية صارمة (τ=0.60، α=0.60)',
  },
  presetPureMse: {
    en: 'Pure MSE (α=1.00)',
    de: 'Reines MSE (α=1.00)',
    fr: 'MSE pure (α=1,00)',
    es: 'MSE puro (α=1.00)',
    ar: 'MSE خالص (α=1.00)',
  },
  presetPureLpips: {
    en: 'Pure LPIPS (α=0.00)',
    de: 'Reines LPIPS (α=0.00)',
    fr: 'LPIPS pur (α=0,00)',
    es: 'LPIPS puro (α=0.00)',
    ar: 'LPIPS خالص (α=0.00)',
  },
  cohortHeading: {
    en: '3. Cohort Diagnostics Under Active Parameters',
    de: '3. Kohorten-Diagnose unter aktiven Parametern',
    fr: '3. Diagnostic de la cohorte selon les paramètres actifs',
    es: '3. Diagnóstico de la cohorte bajo parámetros activos',
    ar: '3. تشخيص المجموعة وفق المعلمات الحالية',
  },
  tprLabel: {
    en: 'True Positive Rate (TPR / Sensitivity)',
    de: 'True Positive Rate (TPR / Sensitivität)',
    fr: 'Taux de vrais positifs (TPR / Sensibilité)',
    es: 'Tasa de verdaderos positivos (TPR / Sensibilidad)',
    ar: 'معدل الإيجابيات الحقيقية (TPR)',
  },
  fprLabel: {
    en: 'False Positive Rate (FPR / Fall-out)',
    de: 'False Positive Rate (FPR / Fehlalarm)',
    fr: 'Taux de faux positifs (FPR / Fausse alerte)',
    es: 'Tasa de falsos positivos (FPR / Falsa alarma)',
    ar: 'معدل الإيجابيات الكاذبة (FPR)',
  },
  accuracyLabel: {
    en: 'Cohort Accuracy',
    de: 'Kohorten-Genauigkeit',
    fr: 'Exactitude de la cohorte',
    es: 'Precisión de la cohorte',
    ar: 'دقة تصنيف المجموعة',
  },
  tpShort: { en: 'TP: OOD Detected', de: 'TP: OOD Erkannt', fr: 'TP : OOD Détecté', es: 'TP: OOD Detectado', ar: 'إيجابي حقيقي: تم كشف الشذوذ' },
  tnShort: { en: 'TN: ID Cleared', de: 'TN: ID Akzeptiert', fr: 'TN : ID Accepté', es: 'TN: ID Aceptado', ar: 'سلبي حقيقي: تم قبول الفئة الأصلية' },
  fpShort: { en: 'FP: False Alarm', de: 'FP: Fehlalarm', fr: 'FP : Fausse Alerte', es: 'FP: Falsa Alarma', ar: 'إيجابي كاذب: إنذار خاطئ' },
  fnShort: { en: 'FN: Missed OOD', de: 'FN: Verpasst', fr: 'FN : OOD Manqué', es: 'FN: OOD Omitido', ar: 'سلبي كاذب: شذوذ غير مكتشف' },
  samplesHeading: {
    en: '4. Interactive CIFAR-10 Test Cohort (Click to Inspect)',
    de: '4. Interaktive CIFAR-10 Testkohorte (Klick zur Detailansicht)',
    fr: '4. Cohorte de test CIFAR-10 interactive (Cliquer pour inspecter)',
    es: '4. Cohorte de prueba CIFAR-10 interactiva (Clic para inspeccionar)',
    ar: '4. مجموعة عينات CIFAR-10 التفاعلية (انقر للفحص التفصيلي)',
  },
  idBadge: {
    en: 'In-Distribution (Airplane)',
    de: 'In-Distribution (Flugzeug)',
    fr: 'En distribution (Avion)',
    es: 'En distribución (Avión)',
    ar: 'داخل التوزيع (طائرة)',
  },
  oodBadge: {
    en: 'Out-of-Distribution',
    de: 'Out-of-Distribution',
    fr: 'Hors distribution',
    es: 'Fuera de distribución',
    ar: 'خارج التوزيع',
  },
  predId: {
    en: 'Classified: In-Distribution',
    de: 'Klassifiziert: In-Distribution',
    fr: 'Classé : En distribution',
    es: 'Clasificado: En distribución',
    ar: 'التصنيف: داخل التوزيع',
  },
  predOod: {
    en: 'Classified: Out-of-Distribution',
    de: 'Klassifiziert: Out-of-Distribution',
    fr: 'Classé : Hors distribution',
    es: 'Clasificado: Fuera de distribución',
    ar: 'التصنيف: خارج التوزيع',
  },
  verdictCorrect: {
    en: 'Correct classification',
    de: 'Korrekte Klassifikation',
    fr: 'Classification correcte',
    es: 'Clasificación correcta',
    ar: 'تصنيف سليم',
  },
  verdictIncorrect: {
    en: 'Misclassification',
    de: 'Fehlklassifikation',
    fr: 'Erreur de classification',
    es: 'Clasificación errónea',
    ar: 'تصنيف خاطئ',
  },
  sampleInspectionHeading: {
    en: 'Cross-Architecture Comparison for Selected Sample',
    de: 'Architektur-Vergleich für gewähltes Muster',
    fr: 'Comparaison multi-architectures pour l’échantillon sélectionné',
    es: 'Comparación entre arquitecturas para la muestra seleccionada',
    ar: 'مقارنة بين المعماريات للعينة المحددة',
  },
  benchmarkTableHeading: {
    en: 'Master’s Thesis Table 6.1 — Benchmark Comparison',
    de: 'Masterarbeit Tabelle 6.1 — Benchmark-Vergleich',
    fr: 'Mémoire de master Tableau 6.1 — Comparaison de référence',
    es: 'Tesis de maestría Tabla 6.1 — Comparación de referencia',
    ar: 'جدول 6.1 من رسالة الماجستير — مقارنة المعايير',
  },
  colModel: { en: 'Model Architecture', de: 'Modellarchitektur', fr: 'Architecture du modèle', es: 'Arquitectura del modelo', ar: 'معمارية النموذج' },
  colBinary: { en: 'Binary AUROC (3 seeds)', de: 'Binärer AUROC (3 Seeds)', fr: 'AUROC binaire (3 graines)', es: 'AUROC binario (3 semillas)', ar: 'AUROC ثنائي (3 بذور)' },
  colLoco: { en: 'Multi-Class LOCO', de: 'Multi-Klassen LOCO', fr: 'Multi-classes LOCO', es: 'Multiclase LOCO', ar: 'متعدد الفئات LOCO' },
  colLoss: { en: 'Separation Loss (λ)', de: 'Trennungsverlust (λ)', fr: 'Perte de séparation (λ)', es: 'Pérdida de separación (λ)', ar: 'فقدان الفصل (λ)' },
  colBehavior: { en: 'Key Mechanism & Characteristic', de: 'Schlüsselmechanismus & Eigenschaft', fr: 'Mécanisme clé & caractéristique', es: 'Mecanismo clave y característica', ar: 'الآلية والخاصية الأساسية' },
  tableNote: {
    en: 'Results directly reproduced from Table 6.1 of Ahmed Mohammed’s Master’s Thesis (JKU Linz). Binary AUROC reflects the airplane-vs-rest evaluation across 3 seeds {42, 123, 456}. Multi-class LOCO reflects leave-one-class-out experiments.',
    de: 'Ergebnisse direkt aus Tabelle 6.1 der Masterarbeit von Ahmed Mohammed (JKU Linz). Binärer AUROC bewertet Flugzeug vs. Rest über 3 Seeds {42, 123, 456}. Multi-Klassen LOCO bewertet Leave-One-Class-Out.',
    fr: 'Résultats directement reproduits du Tableau 6.1 du mémoire de master d’Ahmed Mohammed (JKU Linz). L’AUROC binaire évalue avion contre reste sur 3 graines {42, 123, 456}. Le LOCO multi-classes évalue le leave-one-class-out.',
    es: 'Resultados reproducidos de la Tabla 6.1 de la tesis de maestría de Ahmed Mohammed (JKU Linz). El AUROC binario evalúa avión vs. resto en 3 semillas {42, 123, 456}. El LOCO multiclase evalúa leave-one-class-out.',
    ar: 'النتائج مستخرجة مباشرة من جدول 6.1 من أطروحة ماجستير أحمد محمد (جامعة JKU لينتس). AUROC الثنائي يعكس تقييم طائرة مقابل البقية عبر 3 بذور {42, 123, 456}.',
  },
} as const

interface MethodConfig {
  key: MethodKey
  name: TranslationMap
  shortName: TranslationMap
  binaryAuroc: string
  locoAuroc: string
  lambda: string
  description: TranslationMap
  behavior: TranslationMap
}

const METHODS: MethodConfig[] = [
  {
    key: 'cc_ddpm',
    name: {
      en: 'Class-Conditional DDPM (Ours)',
      de: 'Klassen-konditionales DDPM (Unser Ansatz)',
      fr: 'DDPM conditionnel par classe (Notre méthode)',
      es: 'DDPM condicional por clase (Nuestro método)',
      ar: 'نموذج الانتشار المشروط فئوياً (طريقتنا)',
    },
    shortName: {
      en: 'Conditional DDPM (Ours)',
      de: 'Konditionales DDPM (Ours)',
      fr: 'DDPM conditionnel (Ours)',
      es: 'DDPM condicional (Ours)',
      ar: 'الانتشار المشروط (طريقتنا)',
    },
    binaryAuroc: '99.03% ± 0.07%',
    locoAuroc: '62.29% ± 7.12%',
    lambda: 'λ = 0.02',
    description: {
      en: 'Class-conditional diffusion with explicit separation loss. Reconstructs in-distribution airplanes with high visual fidelity while repelling OOD classes into significantly higher error.',
      de: 'Klassen-konditionale Diffusion mit explizitem Trennungsverlust. Rekonstruiert In-Distribution-Flugzeuge originalgetreu und stößt OOD-Klassen in deutlich höhere Rekonstruktionsfehler ab.',
      fr: 'Diffusion conditionnelle avec perte de séparation explicite. Reconstruit les avions en distribution avec fidélité tout en repoussant les classes OOD vers des erreurs nettement plus élevées.',
      es: 'Difusión condicional con pérdida de separación explícita. Reconstruye aviones en distribución con alta fidelidad y repele clases OOD hacia errores notablemente mayores.',
      ar: 'نموذج انتشار مشروط فئوياً مع فقدان فصل صريح. يعيد بناء طائرات التوزيع بدقة عالية مع دفع العينات الشاذة لأخطاء مرتفعة جداً.',
    },
    behavior: {
      en: 'Separation loss pushes class representations apart; tight ID reconstruction + high OOD error.',
      de: 'Trennungsverlust stößt Klassendarstellungen auseinander; präzise ID-Rekonstruktion + hoher OOD-Fehler.',
      fr: 'La perte de séparation éloigne les représentations ; reconstruction ID fine + erreur OOD élevée.',
      es: 'La pérdida de separación aleja representaciones; reconstrucción ID exacta + alto error OOD.',
      ar: 'فقدان الفصل يدفع تمثيلات الفئات بعيداً؛ إعادة بناء دقيقة للتوزيع الأصلي وخطأ مرتفع للشذوذ.',
    },
  },
  {
    key: 'uncond_ddpm',
    name: {
      en: 'Unconditional DDPM',
      de: 'Unkonditionales DDPM',
      fr: 'DDPM inconditionnel',
      es: 'DDPM incondicional',
      ar: 'نموذج الانتشار غير المشروط',
    },
    shortName: {
      en: 'Unconditional DDPM',
      de: 'Unkonditionales DDPM',
      fr: 'DDPM inconditionnel',
      es: 'DDPM incondicional',
      ar: 'الانتشار غير المشروط',
    },
    binaryAuroc: '92.52% ± 11.07%',
    locoAuroc: '60.20% ± 6.53%',
    lambda: 'λ = 0.00',
    description: {
      en: 'Standard unconditional diffusion model baseline without separation loss. Shows good average performance but wide variance across random training seeds (79.73% to 99.01%).',
      de: 'Klassische unkonditionale Diffusions-Baseline ohne Trennungsverlust. Gute Durchschnittsleistung, jedoch ausgeprägte Streuung über verschiedene Trainings-Seeds (79,73 % bis 99,01 %).',
      fr: 'Modèle de diffusion standard sans perte de séparation. Bonnes performances moyennes mais forte variabilité selon les graines d’entraînement (79,73 % à 99,01 %).',
      es: 'Línea base de difusión estándar sin pérdida de separación. Buen rendimiento promedio pero amplia dispersión entre semillas de entrenamiento (79.73% a 99.01%).',
      ar: 'خط أساس الانتشار القياسي غير المشروط بدون فقدان الفصل. أداء جيد في المتوسط لكن مع تشتت كبير عبر البذور (79.73% إلى 99.01%).',
    },
    behavior: {
      en: 'No explicit repulsion; seed fragility causes wide variance (79.73% – 99.01%).',
      de: 'Keine explizite Abstoßung; Seed-Fragilität führt zu hoher Varianz (79,73 % – 99,01 %).',
      fr: 'Sans répulsion explicite ; fragilité selon la graine provoquant une forte variance (79,73 % - 99,01 %).',
      es: 'Sin repulsión explícita; la fragilidad de semilla genera gran varianza (79.73% - 99.01%).',
      ar: 'بدون تنافر صريح؛ حساسية للبذور تسبب تبايناً واسعاً (79.73% - 99.01%).',
    },
  },
  {
    key: 'vae',
    name: {
      en: 'Variational Autoencoder (VAE)',
      de: 'Variational Autoencoder (VAE)',
      fr: 'Auto-encodeur variationnel (VAE)',
      es: 'Autoencoder variacional (VAE)',
      ar: 'المشفر التلقائي التبايني (VAE)',
    },
    shortName: {
      en: 'VAE',
      de: 'VAE',
      fr: 'VAE',
      es: 'VAE',
      ar: 'VAE',
    },
    binaryAuroc: '83.40% ± 2.15%',
    locoAuroc: '—',
    lambda: 'N/A',
    description: {
      en: 'Latent-space probabilistic baseline with Gaussian prior. Smooth bottleneck results in blurrier reconstructions that diminish perceptual anomaly discrimination on high-frequency details.',
      de: 'Probabilistische Baseline mit Gauß-Prior im latenten Raum. Der regulierte Flaschenhals führt zu weicheren Rekonstruktionen, die feine Hochfrequenz-Anomalien abschwächen.',
      fr: 'Ligne de base probabiliste dans l’espace latent avec a priori gaussien. Le goulot d’étranglement produit des reconstructions floues qui réduisent la discrimination.',
      es: 'Línea base probabilística con prior gaussiano. El cuello de botella suavizado produce reconstrucciones borrosas que reducen la discriminación de anomalías.',
      ar: 'خط أساس احتمالي مع توزيع غاوسي مسبق. عنق الزجاجة ينتج إعادة بناء ضبابية تقلل من تمييز التفاصيل عالية التردد.',
    },
    behavior: {
      en: 'Gaussian latent regularisation produces blurry outputs with compressed error contrast.',
      de: 'Gauß-Regularisierung führt zu Unschärfe und komprimiertem Fehlerkontrast.',
      fr: 'La régularisation gaussienne entraîne un flou et compresse le contraste d’erreur.',
      es: 'La regularización gaussiana produce borrosidad y reduce el contraste de error.',
      ar: 'الانتظام الغاوسي يولد مخرجات غير حادة ويقلص الفارق في درجات الخطأ.',
    },
  },
  {
    key: 'ae',
    name: {
      en: 'Autoencoder (AE)',
      de: 'Autoencoder (AE)',
      fr: 'Auto-encodeur (AE)',
      es: 'Autoencoder (AE)',
      ar: 'المشفر التلقائي (AE)',
    },
    shortName: {
      en: 'Autoencoder (AE)',
      de: 'Autoencoder (AE)',
      fr: 'Auto-encodeur (AE)',
      es: 'Autoencoder (AE)',
      ar: 'المشفر التلقائي (AE)',
    },
    binaryAuroc: '76.10% ± 3.40%',
    locoAuroc: '—',
    lambda: 'N/A',
    description: {
      en: 'Deterministic bottleneck baseline. Lacks generative guidance and frequently reconstructs smooth OOD background textures with misleadingly low MSE, hurting separation.',
      de: 'Deterministische Bottleneck-Baseline. Rekonstruiert mangels generativer Führung oft glatte OOD-Hintergrundstrukturen mit täuschend geringem MSE-Fehler.',
      fr: 'Ligne de base déterministe. Reconstruit souvent les textures d’arrière-plan OOD lisses avec une MSE trompeusement basse.',
      es: 'Línea base determinista. Reconstruye a menudo fondos lisos de clases OOD con un MSE engañosamente bajo.',
      ar: 'خط أساس حتمي ذو عنق زجاجة. يفتقر إلى التوجيه التوليدي ويعيد بناء خلفيات العينات الشاذة بخطأ MSE منخفض مضلل.',
    },
    behavior: {
      en: 'Shortcut reconstructions on smooth patches cause false negatives on non-airplane classes.',
      de: 'Abkürzungen bei glatten Bildbereichen verursachen falsch-negative Einstufungen.',
      fr: 'Des raccourcis de reconstruction sur zones lisses provoquent des faux négatifs.',
      es: 'Reconstrucciones atajo en zonas suaves causan falsos negativos en clases OOD.',
      ar: 'إعادة البناء السطحي للمناطق الملساء يؤدي إلى إغفال كشف العينات الشاذة.',
    },
  },
]

const SAMPLES: SampleData[] = [
  {
    id: 'airplane-01',
    categoryKey: 'plane1',
    groundTruth: 'ID',
    icon: Plane,
    title: {
      en: 'Airplane #1 (Commercial Jet)',
      de: 'Flugzeug #1 (Verkehrsflugzeug)',
      fr: 'Avion n°1 (Avion de ligne)',
      es: 'Avión #1 (Avión comercial)',
      ar: 'طائرة رقم 1 (طائرة ركاب)',
    },
    description: {
      en: 'In-Distribution (ID): High-altitude passenger jet against uniform sky background.',
      de: 'In-Distribution (ID): Passagierflugzeug auf Reiseflughöhe vor klarem Himmel.',
      fr: 'En distribution (ID) : Avion de ligne à haute altitude dans un ciel uniforme.',
      es: 'En distribución (ID): Avión de pasajeros a gran altitud contra cielo uniforme.',
      ar: 'داخل التوزيع (ID): طائرة ركاب في ارتفاع شاهق في سماء صافية.',
    },
    metrics: {
      cc_ddpm: { mse: 0.11, lpips: 0.13 },
      uncond_ddpm: { mse: 0.21, lpips: 0.25 },
      vae: { mse: 0.38, lpips: 0.43 },
      ae: { mse: 0.35, lpips: 0.41 },
    },
  },
  {
    id: 'airplane-02',
    categoryKey: 'plane2',
    groundTruth: 'ID',
    icon: Plane,
    title: {
      en: 'Airplane #2 (Propeller Aircraft)',
      de: 'Flugzeug #2 (Propellerflugzeug)',
      fr: 'Avion n°2 (Avion à hélice)',
      es: 'Avión #2 (Avión de hélice)',
      ar: 'طائرة رقم 2 (طائرة مروحية)',
    },
    description: {
      en: 'In-Distribution (ID): Light aircraft with propeller and visible landing gear on approach.',
      de: 'In-Distribution (ID): Leichtflugzeug mit Propeller und ausgefahrenem Fahrwerk im Anflug.',
      fr: 'En distribution (ID) : Avion léger à hélice avec train d’atterrissage visible en approche.',
      es: 'En distribución (ID): Avión ligero de hélice y tren de aterrizaje visible en aproximación.',
      ar: 'داخل التوزيع (ID): طائرة خفيفة ذات مروحة وعجلات هبوط ظاهرة.',
    },
    metrics: {
      cc_ddpm: { mse: 0.14, lpips: 0.17 },
      uncond_ddpm: { mse: 0.24, lpips: 0.28 },
      vae: { mse: 0.40, lpips: 0.45 },
      ae: { mse: 0.37, lpips: 0.44 },
    },
  },
  {
    id: 'automobile-01',
    categoryKey: 'car',
    groundTruth: 'OOD',
    icon: Car,
    title: {
      en: 'Automobile (Sedan)',
      de: 'Automobil (Limousine)',
      fr: 'Automobile (Berline)',
      es: 'Automóvil (Sedán)',
      ar: 'سيارة (سيدان)',
    },
    description: {
      en: 'Out-of-Distribution (OOD): Road vehicle with wheels and asphalt background.',
      de: 'Out-of-Distribution (OOD): Straßenfahrzeug mit Rädern auf Fahrbahnuntergrund.',
      fr: 'Hors distribution (OOD) : Véhicule routier avec roues sur fond d’asphalte.',
      es: 'Fuera de distribución (OOD): Vehículo de carretera con ruedas sobre asfalto.',
      ar: 'خارج التوزيع (OOD): مركبة طريق بعجلات وخلفية طريق معبد.',
    },
    metrics: {
      cc_ddpm: { mse: 0.79, lpips: 0.83 },
      uncond_ddpm: { mse: 0.62, lpips: 0.67 },
      vae: { mse: 0.53, lpips: 0.59 },
      ae: { mse: 0.44, lpips: 0.50 },
    },
  },
  {
    id: 'bird-01',
    categoryKey: 'bird',
    groundTruth: 'OOD',
    icon: Bird,
    title: {
      en: 'Bird (Songbird)',
      de: 'Vogel (Singvogel)',
      fr: 'Oiseau (Passereau)',
      es: 'Pájaro (Pájaro cantor)',
      ar: 'طائر (طائر مغرد)',
    },
    description: {
      en: 'Out-of-Distribution (OOD): Natural bird perched with wings and foliage (near-OOD).',
      de: 'Out-of-Distribution (OOD): Singvogel auf Ast mit Blattwerk (Near-OOD-Testfall).',
      fr: 'Hors distribution (OOD) : Oiseau perché avec feuillage naturel (cas proche Near-OOD).',
      es: 'Fuera de distribución (OOD): Pájaro posado con follaje natural (caso Near-OOD).',
      ar: 'خارج التوزيع (OOD): طائر جاثم بين أوراق الشجر (شبه قريب من التوزيع).',
    },
    metrics: {
      cc_ddpm: { mse: 0.83, lpips: 0.88 },
      uncond_ddpm: { mse: 0.59, lpips: 0.65 },
      vae: { mse: 0.50, lpips: 0.55 },
      ae: { mse: 0.46, lpips: 0.49 },
    },
  },
  {
    id: 'ship-01',
    categoryKey: 'ship',
    groundTruth: 'OOD',
    icon: Ship,
    title: {
      en: 'Ship (Cargo Vessel)',
      de: 'Schiff (Frachtschiff)',
      fr: 'Navire (Cargo)',
      es: 'Barco (Buque de carga)',
      ar: 'سفينة (سفينة شحن)',
    },
    description: {
      en: 'Out-of-Distribution (OOD): Maritime vessel on ocean surface; shares blue horizon context.',
      de: 'Out-of-Distribution (OOD): Schiff auf Meeresoberfläche; teilt bläulichen Horizont.',
      fr: 'Hors distribution (OOD) : Navire sur l’océan ; partage un horizon bleuté avec le ciel.',
      es: 'Fuera de distribución (OOD): Barco en superficie marina; comparte horizonte azulado.',
      ar: 'خارج التوزيع (OOD): سفينة على سطح البحر؛ تشترك في زرقة الأفق.',
    },
    metrics: {
      cc_ddpm: { mse: 0.73, lpips: 0.77 },
      uncond_ddpm: { mse: 0.55, lpips: 0.61 },
      vae: { mse: 0.48, lpips: 0.53 },
      ae: { mse: 0.43, lpips: 0.48 },
    },
  },
  {
    id: 'truck-01',
    categoryKey: 'truck',
    groundTruth: 'OOD',
    icon: Truck,
    title: {
      en: 'Truck (Heavy Transport)',
      de: 'LKW (Schwerlasttransporter)',
      fr: 'Camion (Poids lourd)',
      es: 'Camión (Transporte pesado)',
      ar: 'شاحنة (نقل ثقيل)',
    },
    description: {
      en: 'Out-of-Distribution (OOD): Large boxy transport vehicle with high spatial geometry.',
      de: 'Out-of-Distribution (OOD): Großes Nutzfahrzeug mit kastenförmiger Geometrie.',
      fr: 'Hors distribution (OOD) : Véhicule utilitaire lourd à géométrie volumique marquée.',
      es: 'Fuera de distribución (OOD): Vehículo de transporte pesado con geometría definida.',
      ar: 'خارج التوزيع (OOD): مركبة نقل ثقيلة ذات هيكل ضخم وهندسة واضحة.',
    },
    metrics: {
      cc_ddpm: { mse: 0.89, lpips: 0.93 },
      uncond_ddpm: { mse: 0.69, lpips: 0.73 },
      vae: { mse: 0.57, lpips: 0.63 },
      ae: { mse: 0.49, lpips: 0.52 },
    },
  },
]

export default function OodDemo() {
  const { t } = useI18n()
  const thresholdInputId = useId()
  const weightInputId = useId()

  const [activeMethod, setActiveMethod] = useState<MethodKey>('cc_ddpm')
  const [threshold, setThreshold] = useState<number>(0.45)
  const [alpha, setAlpha] = useState<number>(0.5)
  const [selectedSampleId, setSelectedSampleId] = useState<string>('airplane-01')

  const currentMethodConfig = useMemo(
    () => METHODS.find((m) => m.key === activeMethod) ?? METHODS[0],
    [activeMethod]
  )

  const selectedSample = useMemo(
    () => SAMPLES.find((s) => s.id === selectedSampleId) ?? SAMPLES[0],
    [selectedSampleId]
  )

  // Compute anomaly scores and diagnostics
  const sampleEvaluations = useMemo(() => {
    return SAMPLES.map((sample) => {
      const metric = sample.metrics[activeMethod]
      const score = alpha * metric.mse + (1 - alpha) * metric.lpips
      const isPredictedOod = score > threshold
      const isGroundTruthOod = sample.groundTruth === 'OOD'
      const isCorrect = isPredictedOod === isGroundTruthOod

      let confusionType: 'TP' | 'TN' | 'FP' | 'FN'
      if (isGroundTruthOod && isPredictedOod) {
        confusionType = 'TP'
      } else if (!isGroundTruthOod && !isPredictedOod) {
        confusionType = 'TN'
      } else if (!isGroundTruthOod && isPredictedOod) {
        confusionType = 'FP'
      } else {
        confusionType = 'FN'
      }

      return {
        sample,
        metric,
        score,
        isPredictedOod,
        isGroundTruthOod,
        isCorrect,
        confusionType,
      }
    })
  }, [activeMethod, threshold, alpha])

  const cohortStats = useMemo(() => {
    let tp = 0
    let tn = 0
    let fp = 0
    let fn = 0

    sampleEvaluations.forEach((item) => {
      if (item.confusionType === 'TP') tp++
      if (item.confusionType === 'TN') tn++
      if (item.confusionType === 'FP') fp++
      if (item.confusionType === 'FN') fn++
    })

    const totalPositives = tp + fn // 4 OOD samples
    const totalNegatives = tn + fp // 2 ID samples
    const total = sampleEvaluations.length

    const tpr = totalPositives > 0 ? (tp / totalPositives) * 100 : 0
    const fpr = totalNegatives > 0 ? (fp / totalNegatives) * 100 : 0
    const accuracy = total > 0 ? ((tp + tn) / total) * 100 : 0

    return { tp, tn, fp, fn, tpr, fpr, accuracy, totalPositives, totalNegatives }
  }, [sampleEvaluations])

  const activeSelectedEval = useMemo(
    () => sampleEvaluations.find((e) => e.sample.id === selectedSampleId) ?? sampleEvaluations[0],
    [sampleEvaluations, selectedSampleId]
  )

  return (
    <section
      aria-labelledby="ood-demo-title"
      className="glass-surface glass-subtle mt-10 rounded-2xl p-6 sm:p-8"
      style={{
        border: '1px solid var(--cd-b-accent)',
        background: 'var(--cd-surf)',
      }}
    >
      {/* Header & Eyebrow */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="cd-section-eyebrow flex items-center gap-2">
            <Sparkles size={15} className="text-[var(--cd-accent)]" />
            {t(copy.eyebrow)}
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs text-[var(--cd-accent)]"
            style={{
              background: 'var(--cd-elev)',
              border: '1px solid var(--cd-b0)',
            }}
          >
            <Shield size={12} />
            {t(copy.zeroInferenceBadge)}
          </span>
        </div>

        <h2 id="ood-demo-title" className="text-2xl font-bold tracking-tight text-[var(--cd-fg1)] sm:text-3xl">
          {t(copy.title)}
        </h2>

        <p className="max-w-3xl text-sm leading-relaxed text-[var(--cd-fg2)] sm:text-base">
          {t(copy.subtitle)}
        </p>

        <div className="inline-block self-start rounded-md px-2.5 py-1 text-xs text-[var(--cd-fg2)]" style={{ background: 'var(--cd-elev)', border: '1px solid var(--cd-b0)' }}>
          {t(copy.scopeBadge)}
        </div>
      </div>

      {/* 1. Method Architecture Selector */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 font-semibold text-sm text-[var(--cd-fg1)]">
          <Layers size={16} className="text-[var(--cd-accent)]" />
          {t(copy.methodsHeading)}
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {METHODS.map((method) => {
            const isSelected = method.key === activeMethod
            return (
              <button
                key={method.key}
                type="button"
                onClick={() => setActiveMethod(method.key)}
                aria-pressed={isSelected}
                className="group relative flex flex-col justify-between rounded-xl p-3.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-[var(--cd-accent)]"
                style={{
                  background: isSelected ? 'var(--cd-elev)' : 'var(--cd-surf)',
                  border: isSelected
                    ? '1.5px solid var(--cd-accent)'
                    : '1px solid var(--cd-b0)',
                  boxShadow: isSelected
                    ? '0 0 16px rgba(0, 212, 255, 0.15)'
                    : 'none',
                }}
              >
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-sm text-[var(--cd-fg1)]">
                      {t(method.shortName)}
                    </span>
                    {isSelected && (
                      <CheckCircle2 size={15} className="text-[var(--cd-accent)]" />
                    )}
                  </div>
                  <div className="font-mono text-xs font-bold text-[var(--cd-accent)]">
                    AUROC: {method.binaryAuroc}
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-[var(--cd-fg2)]">
                  {method.lambda}
                </div>
              </button>
            )
          })}
        </div>

        {/* Active method callout */}
        <div
          className="mt-3 rounded-lg p-3 text-xs leading-relaxed text-[var(--cd-fg2)]"
          style={{ background: 'var(--cd-elev)', border: '1px solid var(--cd-b0)' }}
        >
          <span className="font-semibold text-[var(--cd-fg1)]">
            {t(currentMethodConfig.name)}:
          </span>{' '}
          {t(currentMethodConfig.description)}
        </div>
      </div>

      {/* 2. Controls Panel: Threshold (τ) & Perceptual Balance (α) */}
      <div
        className="mb-8 rounded-xl p-5"
        style={{ background: 'var(--cd-elev)', border: '1px solid var(--cd-b0)' }}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold text-sm text-[var(--cd-fg1)]">
            <Sliders size={16} className="text-[var(--cd-accent)]" />
            {t(copy.controlsHeading)}
          </div>
          <span className="font-mono text-xs text-[var(--cd-accent)]">
            {t(copy.weightFormula)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Threshold Slider */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor={thresholdInputId} className="font-medium text-xs text-[var(--cd-fg1)]">
                {t(copy.thresholdLabel)}
              </label>
              <span className="font-mono text-xs font-bold text-[var(--cd-accent)]">
                τ = {threshold.toFixed(2)}
              </span>
            </div>
            <input
              id={thresholdInputId}
              type="range"
              min="0.10"
              max="0.90"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              aria-label={t(copy.thresholdLabel)}
              aria-valuemin={0.1}
              aria-valuemax={0.9}
              aria-valuenow={threshold}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--cd-b1)] accent-[var(--cd-accent)]"
            />
            <p className="mt-1.5 text-[11px] text-[var(--cd-fg2)]">
              {t(copy.thresholdDesc)}
            </p>
          </div>

          {/* Metric Balance (α) Slider */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor={weightInputId} className="font-medium text-xs text-[var(--cd-fg1)]">
                {t(copy.weightLabel)}
              </label>
              <span className="font-mono text-xs font-bold text-[var(--cd-accent)]">
                α = {alpha.toFixed(2)} ({(alpha * 100).toFixed(0)}% MSE / {((1 - alpha) * 100).toFixed(0)}% LPIPS)
              </span>
            </div>
            <input
              id={weightInputId}
              type="range"
              min="0.00"
              max="1.00"
              step="0.05"
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              aria-label={t(copy.weightLabel)}
              aria-valuemin={0.0}
              aria-valuemax={1.0}
              aria-valuenow={alpha}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--cd-b1)] accent-[var(--cd-accent)]"
            />
            <p className="mt-1.5 text-[11px] text-[var(--cd-fg2)]">
              α = 1.0 focuses exclusively on pixel-level MSE; α = 0.0 prioritises deep perceptual LPIPS.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--cd-b0)] pt-3">
          <span className="text-xs text-[var(--cd-fg2)]">{t(copy.presetsLabel)}</span>
          <button
            type="button"
            onClick={() => {
              setThreshold(0.45)
              setAlpha(0.5)
            }}
            className="rounded px-2.5 py-1 text-xs transition-colors hover:text-[var(--cd-accent)] focus-visible:outline-2 focus-visible:outline-[var(--cd-accent)]"
            style={{
              background: threshold === 0.45 && alpha === 0.5 ? 'var(--cd-b-accent)' : 'var(--cd-surf)',
              border: '1px solid var(--cd-b0)',
            }}
          >
            {t(copy.presetBalanced)}
          </button>
          <button
            type="button"
            onClick={() => {
              setThreshold(0.3)
              setAlpha(0.4)
            }}
            className="rounded px-2.5 py-1 text-xs transition-colors hover:text-[var(--cd-accent)] focus-visible:outline-2 focus-visible:outline-[var(--cd-accent)]"
            style={{
              background: threshold === 0.3 && alpha === 0.4 ? 'var(--cd-b-accent)' : 'var(--cd-surf)',
              border: '1px solid var(--cd-b0)',
            }}
          >
            {t(copy.presetSensitivity)}
          </button>
          <button
            type="button"
            onClick={() => {
              setThreshold(0.6)
              setAlpha(0.6)
            }}
            className="rounded px-2.5 py-1 text-xs transition-colors hover:text-[var(--cd-accent)] focus-visible:outline-2 focus-visible:outline-[var(--cd-accent)]"
            style={{
              background: threshold === 0.6 && alpha === 0.6 ? 'var(--cd-b-accent)' : 'var(--cd-surf)',
              border: '1px solid var(--cd-b0)',
            }}
          >
            {t(copy.presetSpecificity)}
          </button>
          <button
            type="button"
            onClick={() => setAlpha(1.0)}
            className="rounded px-2.5 py-1 text-xs transition-colors hover:text-[var(--cd-accent)] focus-visible:outline-2 focus-visible:outline-[var(--cd-accent)]"
            style={{
              background: alpha === 1.0 ? 'var(--cd-b-accent)' : 'var(--cd-surf)',
              border: '1px solid var(--cd-b0)',
            }}
          >
            {t(copy.presetPureMse)}
          </button>
          <button
            type="button"
            onClick={() => setAlpha(0.0)}
            className="rounded px-2.5 py-1 text-xs transition-colors hover:text-[var(--cd-accent)] focus-visible:outline-2 focus-visible:outline-[var(--cd-accent)]"
            style={{
              background: alpha === 0.0 ? 'var(--cd-b-accent)' : 'var(--cd-surf)',
              border: '1px solid var(--cd-b0)',
            }}
          >
            {t(copy.presetPureLpips)}
          </button>
        </div>
      </div>

      {/* 3. Cohort Diagnostics */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm text-[var(--cd-fg1)]">
            <BarChart3 size={16} className="text-[var(--cd-accent)]" />
            {t(copy.cohortHeading)}
          </div>
          <span className="font-mono text-xs text-[var(--cd-fg2)]">
            6 Samples (2 ID / 4 OOD)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Sensitivity / TPR */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--cd-elev)', border: '1px solid var(--cd-b0)' }}
          >
            <div className="mb-1 text-xs text-[var(--cd-fg2)]">{t(copy.tprLabel)}</div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-[var(--cd-accent)]">
                {cohortStats.tpr.toFixed(0)}%
              </span>
              <span className="text-xs text-[var(--cd-fg2)]">
                ({cohortStats.tp}/{cohortStats.totalPositives} OOD caught)
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--cd-b1)]">
              <div
                className="h-full bg-[var(--cd-accent)] transition-all duration-300"
                style={{ width: `${cohortStats.tpr}%` }}
              />
            </div>
          </div>

          {/* False Positive Rate */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--cd-elev)', border: '1px solid var(--cd-b0)' }}
          >
            <div className="mb-1 text-xs text-[var(--cd-fg2)]">{t(copy.fprLabel)}</div>
            <div className="flex items-baseline gap-2">
              <span
                className="font-mono text-2xl font-bold"
                style={{
                  color: cohortStats.fpr > 0 ? 'var(--cd-warn)' : 'var(--cd-success)',
                }}
              >
                {cohortStats.fpr.toFixed(0)}%
              </span>
              <span className="text-xs text-[var(--cd-fg2)]">
                ({cohortStats.fp}/{cohortStats.totalNegatives} false flags)
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--cd-b1)]">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${cohortStats.fpr}%`,
                  background: cohortStats.fpr > 0 ? 'var(--cd-warn)' : 'var(--cd-success)',
                }}
              />
            </div>
          </div>

          {/* Cohort Accuracy */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--cd-elev)', border: '1px solid var(--cd-b0)' }}
          >
            <div className="mb-1 text-xs text-[var(--cd-fg2)]">{t(copy.accuracyLabel)}</div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-[var(--cd-fg1)]">
                {cohortStats.accuracy.toFixed(0)}%
              </span>
              <span className="text-xs text-[var(--cd-fg2)]">
                ({cohortStats.tp + cohortStats.tn}/6 correct)
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--cd-b1)]">
              <div
                className="h-full bg-[var(--cd-success)] transition-all duration-300"
                style={{ width: `${cohortStats.accuracy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Matrix Chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs"
            style={{ background: 'var(--cd-elev)', border: '1px solid var(--cd-b0)' }}
          >
            <span className="h-2 w-2 rounded-full bg-[var(--cd-accent)]" />
            <span className="font-mono font-semibold">{t(copy.tpShort)}:</span> {cohortStats.tp}
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs"
            style={{ background: 'var(--cd-elev)', border: '1px solid var(--cd-b0)' }}
          >
            <span className="h-2 w-2 rounded-full bg-[var(--cd-success)]" />
            <span className="font-mono font-semibold">{t(copy.tnShort)}:</span> {cohortStats.tn}
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs"
            style={{ background: 'var(--cd-elev)', border: '1px solid var(--cd-b0)' }}
          >
            <span className="h-2 w-2 rounded-full bg-[var(--cd-warn)]" />
            <span className="font-mono font-semibold">{t(copy.fpShort)}:</span> {cohortStats.fp}
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs"
            style={{ background: 'var(--cd-elev)', border: '1px solid var(--cd-b0)' }}
          >
            <span className="h-2 w-2 rounded-full bg-[var(--cd-fg3)]" />
            <span className="font-mono font-semibold">{t(copy.fnShort)}:</span> {cohortStats.fn}
          </span>
        </div>
      </div>

      {/* 4. Interactive Sample Cohort Grid */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm text-[var(--cd-fg1)]">
            <Shield size={16} className="text-[var(--cd-accent)]" />
            {t(copy.samplesHeading)}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {sampleEvaluations.map(({ sample, metric, score, isPredictedOod, isCorrect }) => {
            const isSelected = sample.id === selectedSampleId
            const Icon = sample.icon

            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => setSelectedSampleId(sample.id)}
                aria-pressed={isSelected}
                className="group relative flex flex-col justify-between rounded-xl p-4 text-left transition-all focus-visible:outline-2 focus-visible:outline-[var(--cd-accent)]"
                style={{
                  background: isSelected ? 'var(--cd-elev)' : 'var(--cd-surf)',
                  border: isSelected
                    ? '1.5px solid var(--cd-accent)'
                    : '1px solid var(--cd-b0)',
                  boxShadow: isSelected
                    ? '0 0 20px rgba(0, 212, 255, 0.18)'
                    : 'none',
                }}
              >
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{
                          background: sample.groundTruth === 'ID' ? 'var(--cd-accent-dim)' : 'var(--cd-elev)',
                          border: '1px solid var(--cd-b0)',
                        }}
                      >
                        <Icon size={16} className={sample.groundTruth === 'ID' ? 'text-[var(--cd-accent)]' : 'text-[var(--cd-fg2)]'} />
                      </div>
                      <span className="font-semibold text-sm text-[var(--cd-fg1)]">
                        {t(sample.title)}
                      </span>
                    </div>

                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: sample.groundTruth === 'ID' ? 'var(--cd-accent-dim)' : 'rgba(245, 158, 11, 0.12)',
                        color: sample.groundTruth === 'ID' ? 'var(--cd-accent)' : 'var(--cd-warn)',
                        border: '1px solid var(--cd-b0)',
                      }}
                    >
                      {sample.groundTruth}
                    </span>
                  </div>

                  <p className="mb-3 text-xs leading-relaxed text-[var(--cd-fg2)] line-clamp-2">
                    {t(sample.description)}
                  </p>
                </div>

                <div>
                  {/* Error & Score Bars */}
                  <div className="mb-2 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-[var(--cd-fg2)]">
                      <span>MSE: {metric.mse.toFixed(2)}</span>
                      <span>LPIPS: {metric.lpips.toFixed(2)}</span>
                      <span className="font-mono font-bold text-[var(--cd-accent)]">
                        S(x): {score.toFixed(2)}
                      </span>
                    </div>

                    {/* Score Bar with Threshold Pin */}
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--cd-b1)]">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(0, score * 100))}%`,
                          background: isPredictedOod ? 'var(--cd-warn)' : 'var(--cd-accent)',
                        }}
                      />
                      {/* Threshold Pin Indicator */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm"
                        style={{
                          left: `${threshold * 100}%`,
                          transform: 'translateX(-50%)',
                        }}
                        title={`Threshold τ = ${threshold.toFixed(2)}`}
                      />
                    </div>
                  </div>

                  {/* Classification result badge */}
                  <div
                    className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium"
                    style={{
                      background: isCorrect ? 'rgba(0, 255, 136, 0.08)' : 'rgba(245, 158, 11, 0.12)',
                      border: `1px solid ${isCorrect ? 'rgba(0, 255, 136, 0.25)' : 'rgba(245, 158, 11, 0.3)'}`,
                      color: isCorrect ? 'var(--cd-success)' : 'var(--cd-warn)',
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      {isCorrect ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                      <span>{isPredictedOod ? t(copy.predOod) : t(copy.predId)}</span>
                    </div>
                    <span className="text-[10px] font-bold">
                      {isCorrect ? t(copy.verdictCorrect) : t(copy.verdictIncorrect)}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. Deep Sample Inspection Card */}
      <div
        className="mb-8 rounded-xl p-5"
        style={{ background: 'var(--cd-elev)', border: '1px solid var(--cd-b0)' }}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold text-sm text-[var(--cd-fg1)]">
            <Info size={16} className="text-[var(--cd-accent)]" />
            {t(copy.sampleInspectionHeading)}:
            <span className="font-bold text-[var(--cd-accent)]">
              {t(selectedSample.title)}
            </span>
          </div>
          <span
            className="rounded px-2.5 py-0.5 text-xs font-bold"
            style={{
              background: selectedSample.groundTruth === 'ID' ? 'var(--cd-accent-dim)' : 'rgba(245, 158, 11, 0.15)',
              color: selectedSample.groundTruth === 'ID' ? 'var(--cd-accent)' : 'var(--cd-warn)',
            }}
          >
            Ground Truth: {selectedSample.groundTruth} ({t(selectedSample.groundTruth === 'ID' ? copy.idBadge : copy.oodBadge)})
          </span>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-[var(--cd-fg2)]">
          {t(selectedSample.description)}
        </p>

        {/* Active evaluation summary for selected sample */}
        <div
          className="mb-4 flex flex-wrap items-center gap-4 rounded-lg p-3 text-xs"
          style={{ background: 'var(--cd-surf)', border: '1px solid var(--cd-b0)' }}
        >
          <div>
            <span className="text-[var(--cd-fg2)]">Active Architecture: </span>
            <span className="font-semibold text-[var(--cd-fg1)]">
              {t(currentMethodConfig.shortName)}
            </span>
          </div>
          <div>
            <span className="text-[var(--cd-fg2)]">Anomaly Score S(x): </span>
            <span className="font-mono font-bold text-[var(--cd-accent)]">
              {activeSelectedEval.score.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[var(--cd-fg2)]">Threshold Outcome: </span>
            <span
              className="font-medium"
              style={{
                color: activeSelectedEval.isPredictedOod ? 'var(--cd-warn)' : 'var(--cd-accent)',
              }}
            >
              {activeSelectedEval.isPredictedOod ? t(copy.predOod) : t(copy.predId)}
            </span>
          </div>
          <div>
            <span className="text-[var(--cd-fg2)]">Evaluation: </span>
            <span
              className="font-semibold"
              style={{
                color: activeSelectedEval.isCorrect ? 'var(--cd-success)' : 'var(--cd-warn)',
              }}
            >
              {activeSelectedEval.isCorrect ? t(copy.verdictCorrect) : t(copy.verdictIncorrect)}
            </span>
          </div>
        </div>

        {/* Cross-method table for this sample */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="border-b border-[var(--cd-b0)] text-[var(--cd-fg2)]">
                <th className="py-2 pr-3">{t(copy.colModel)}</th>
                <th className="py-2 px-3">MSE</th>
                <th className="py-2 px-3">LPIPS</th>
                <th className="py-2 px-3 font-bold text-[var(--cd-accent)]">
                  S(x) Score
                </th>
                <th className="py-2 px-3">Predicted Status</th>
                <th className="py-2 pl-3">Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--cd-b0)]">
              {METHODS.map((method) => {
                const metric = selectedSample.metrics[method.key]
                const score = alpha * metric.mse + (1 - alpha) * metric.lpips
                const isPredOod = score > threshold
                const isCorrect = isPredOod === (selectedSample.groundTruth === 'OOD')
                const isCurrent = method.key === activeMethod

                return (
                  <tr
                    key={method.key}
                    style={{
                      background: isCurrent ? 'var(--cd-accent-dim)' : 'transparent',
                    }}
                  >
                    <td className="py-2.5 pr-3 font-medium text-[var(--cd-fg1)]">
                      {t(method.shortName)}
                      {isCurrent && (
                        <span className="ml-2 font-mono text-[10px] text-[var(--cd-accent)]">
                          [Active]
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[var(--cd-fg2)]">
                      {metric.mse.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[var(--cd-fg2)]">
                      {metric.lpips.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[var(--cd-accent)]">
                      {score.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-medium">
                      <span
                        className="rounded px-2 py-0.5 text-[11px]"
                        style={{
                          background: isPredOod ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 212, 255, 0.15)',
                          color: isPredOod ? 'var(--cd-warn)' : 'var(--cd-accent)',
                        }}
                      >
                        {isPredOod ? 'OOD' : 'ID'}
                      </span>
                    </td>
                    <td className="py-2.5 pl-3">
                      <span
                        className="inline-flex items-center gap-1 font-semibold text-[11px]"
                        style={{
                          color: isCorrect ? 'var(--cd-success)' : 'var(--cd-warn)',
                        }}
                      >
                        {isCorrect ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {isCorrect ? t(copy.verdictCorrect) : t(copy.verdictIncorrect)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Thesis Benchmark Summary Table (Table 6.1) */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--cd-elev)', border: '1px solid var(--cd-b0)' }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm text-[var(--cd-fg1)]">
            <BarChart3 size={16} className="text-[var(--cd-accent)]" />
            {t(copy.benchmarkTableHeading)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="border-b border-[var(--cd-b0)] text-[var(--cd-fg2)]">
                <th className="py-2 pr-3">{t(copy.colModel)}</th>
                <th className="py-2 px-3">{t(copy.colBinary)}</th>
                <th className="py-2 px-3">{t(copy.colLoco)}</th>
                <th className="py-2 px-3">{t(copy.colLoss)}</th>
                <th className="py-2 pl-3">{t(copy.colBehavior)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--cd-b0)]">
              {METHODS.map((method) => {
                const isCurrent = method.key === activeMethod
                return (
                  <tr
                    key={method.key}
                    style={{
                      background: isCurrent ? 'var(--cd-accent-dim)' : 'transparent',
                    }}
                  >
                    <td className="py-3 pr-3 font-semibold text-[var(--cd-fg1)]">
                      {t(method.name)}
                      {isCurrent && (
                        <span className="ml-2 font-mono text-[10px] text-[var(--cd-accent)]">
                          [Selected]
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[var(--cd-accent)]">
                      {method.binaryAuroc}
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--cd-fg2)]">
                      {method.locoAuroc}
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--cd-fg2)]">
                      {method.lambda}
                    </td>
                    <td className="py-3 pl-3 text-[var(--cd-fg2)]">
                      {t(method.behavior)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-[var(--cd-fg3)]">
          {t(copy.tableNote)}
        </p>
      </div>
    </section>
  )
}
