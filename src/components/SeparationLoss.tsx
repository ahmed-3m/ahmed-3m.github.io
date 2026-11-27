'use client'

import ResearchFigure from '@/components/ResearchFigure'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { QUALIFIERS } from '@/lib/claims'
import { CIFAR_LAMBDA_SWEEP } from '@/lib/ood-explorer-data'
import { separationNoiseTraining } from '@/lib/research-figures'
import { useTheme } from '@/lib/ThemeContext'

const baseline = CIFAR_LAMBDA_SWEEP.find(({ lambda }) => lambda === '0.0')
const withSeparation = CIFAR_LAMBDA_SWEEP.find(({ lambda }) => lambda === '0.02')

const copy = {
  title: {
    en: 'How separation loss helps detect unfamiliar images',
    de: 'Wie Separation Loss unbekannte Bilder erkennen hilft',
    fr: 'Comment la perte de séparation aide à détecter les images inconnues',
    es: 'Cómo ayuda la pérdida de separación a detectar imágenes desconocidas',
    ar: 'كيف تساعد خسارة الفصل على اكتشاف الصور غير المألوفة',
  },
  intro: {
    en: 'The model predicts noise in the same image under two conditions. Separation loss pushes those predictions apart during training. Later, the gap between their errors helps flag unfamiliar images.',
    de: 'Das Modell sagt das Rauschen im selben Bild unter zwei Bedingungen voraus. Die Separation Loss vergrößert beim Training den Abstand zwischen diesen Vorhersagen. Später hilft der Unterschied zwischen ihren Fehlern, unbekannte Bilder zu erkennen.',
    fr: 'Le modèle prédit le bruit de la même image sous deux conditions. La perte de séparation éloigne ces prédictions pendant l’entraînement. L’écart entre leurs erreurs aide ensuite à repérer les images inconnues.',
    es: 'El modelo predice el ruido de la misma imagen bajo dos condiciones. La pérdida de separación aleja esas predicciones durante el entrenamiento. La diferencia entre sus errores ayuda después a detectar imágenes desconocidas.',
    ar: 'يتنبأ النموذج بالضوضاء في الصورة نفسها تحت شرطين. تزيد خسارة الفصل المسافة بين التنبؤين أثناء التدريب. ثم يساعد الفرق بين خطأيهما على اكتشاف الصور غير المألوفة.',
  },
  baseline: { en: 'Baseline', de: 'Basiswert', fr: 'Référence', es: 'Referencia', ar: 'خط الأساس' },
  separation: { en: 'With separation loss', de: 'Mit Separation Loss', fr: 'Avec la perte de séparation', es: 'Con pérdida de separación', ar: 'مع خسارة الفصل' },
  benchmark: {
    en: 'CIFAR-10 airplanes vs. the other nine classes · AUROC, mean ± standard deviation across three runs',
    de: 'CIFAR-10: Flugzeuge gegen die übrigen neun Klassen · AUROC, Mittelwert ± Standardabweichung aus drei Läufen',
    fr: 'CIFAR-10 : avions contre les neuf autres classes · AUROC, moyenne ± écart-type sur trois essais',
    es: 'CIFAR-10: aviones frente a las otras nueve clases · AUROC, media ± desviación estándar de tres pruebas',
    ar: 'CIFAR-10، الطائرات مقابل الفئات التسع الأخرى · AUROC، المتوسط ± الانحراف المعياري عبر ثلاث تجارب',
  },
  predict: { en: 'Learn to predict noise', de: 'Rauschen vorhersagen lernen', fr: 'Apprendre à prédire le bruit', es: 'Aprender a predecir el ruido', ar: 'تعلّم التنبؤ بالضوضاء' },
  separate: { en: 'Separate the predictions', de: 'Vorhersagen trennen', fr: 'Séparer les prédictions', es: 'Separar las predicciones', ar: 'افصل بين التنبؤين' },
  denoisingOnly: { en: 'Denoising loss alone', de: 'Nur Entrauschungsverlust', fr: 'Perte de débruitage seule', es: 'Solo pérdida de eliminación de ruido', ar: 'خسارة إزالة الضوضاء وحدها' },
  distance: {
    en: 'For the same noisy input, the model predicts noise under the airplane condition (c = 0) and the other classes (c = 1). Separation loss pushes the predictions farther apart, as sketched above.',
    de: 'Für dieselbe verrauschte Eingabe sagt das Modell das Rauschen für Flugzeuge (c = 0) und für die übrigen Klassen (c = 1) voraus. Die Separation Loss vergrößert den Abstand, wie oben skizziert.',
    fr: 'Pour la même image bruitée, le modèle prédit le bruit sous la condition « avion » (c = 0) et celle des autres classes (c = 1). Le schéma illustre comment la perte de séparation éloigne les prédictions.',
    es: 'Con la misma imagen ruidosa, el modelo predice el ruido para la condición de avión (c = 0) y para las demás clases (c = 1). El esquema ilustra cómo la pérdida de separación aleja las predicciones.',
    ar: 'للصورة المشوشة نفسها، يتنبأ النموذج بالضوضاء تحت شرط الطائرة (c = 0) وشرط الفئات الأخرى (c = 1). يوضّح الرسم كيف تزيد خسارة الفصل المسافة بين التنبؤين.',
  },
  decide: { en: 'Score and classify the image', de: 'Bild bewerten und einordnen', fr: 'Calculer le score et classer l’image', es: 'Puntuar y clasificar la imagen', ar: 'احسب درجة الصورة وصنّفها' },
  example: { en: 'Illustrative example', de: 'Rechenbeispiel', fr: 'Exemple illustratif', es: 'Ejemplo ilustrativo', ar: 'مثال توضيحي' },
  score: { en: 'Anomaly score', de: 'Anomaliewert', fr: 'Score d’anomalie', es: 'Puntuación de anomalía', ar: 'درجة الشذوذ' },
  belowThreshold: {
    en: 'Below the calibrated threshold',
    de: 'Unter der kalibrierten Schwelle',
    fr: 'Sous le seuil calibré',
    es: 'Por debajo del umbral calibrado',
    ar: 'أقل من العتبة المعايرة',
  },
  familiar: { en: 'Classified as familiar', de: 'Als vertraut eingestuft', fr: 'Classée comme familière', es: 'Clasificada como familiar', ar: 'صُنّفت على أنها مألوفة' },
  decision: {
    en: 'Subtract the two average noise-prediction errors. Flag the image as unfamiliar when the score reaches or exceeds the calibrated threshold.',
    de: 'Ziehe die beiden mittleren Fehler der Rauschvorhersage voneinander ab. Erreicht oder überschreitet der Wert die kalibrierte Schwelle, wird das Bild als unbekannt markiert.',
    fr: 'Soustraire les deux erreurs moyennes de prédiction du bruit. Signaler l’image comme inconnue si le score atteint ou dépasse le seuil calibré.',
    es: 'Resta los dos errores medios de predicción del ruido. Marca la imagen como desconocida si la puntuación alcanza o supera el umbral calibrado.',
    ar: 'احسب الفرق بين متوسّطَي خطأ التنبؤ بالضوضاء. صنّف الصورة على أنها غير مألوفة إذا بلغت الدرجة العتبة المعايرة أو تجاوزتها.',
  },
  details: { en: 'Technical details', de: 'Technische Details', fr: 'Détails techniques', es: 'Detalles técnicos', ar: 'التفاصيل التقنية' },
  symbols: {
    en: 'At inference, e₀ and e₁ are the average squared prediction errors against the known added noise under the two conditions. Both use the same noise and timestep in each trial. The calibrated threshold τ can be positive or negative.',
    de: 'Bei der Inferenz sind e₀ und e₁ die mittleren quadratischen Vorhersagefehler gegenüber dem bekannten hinzugefügten Rauschen. Beide Bedingungen nutzen in jedem Versuch dasselbe Rauschen und denselben Zeitschritt. Die kalibrierte Schwelle τ kann positiv oder negativ sein.',
    fr: 'À l’inférence, e₀ et e₁ sont les erreurs quadratiques moyennes par rapport au bruit connu ajouté, sous les deux conditions. Chaque essai utilise le même bruit et le même pas de temps pour les deux. Le seuil calibré τ peut être positif ou négatif.',
    es: 'En la inferencia, e₀ y e₁ son los errores cuadráticos medios respecto al ruido conocido añadido bajo las dos condiciones. Ambas usan el mismo ruido y paso temporal en cada ensayo. El umbral calibrado τ puede ser positivo o negativo.',
    ar: 'عند الاستدلال، يمثّل e₀ وe₁ متوسّطَي مربّع خطأ التنبؤ مقارنةً بالضوضاء المضافة المعروفة تحت الشرطين. يستخدم الشرطان الضوضاء نفسها والخطوة الزمنية نفسها في كل تجربة. وقد تكون العتبة المعايرة τ موجبة أو سالبة.',
  },
  explore: { en: 'Try the threshold yourself', de: 'Schwelle selbst ausprobieren', fr: 'Essayer le seuil', es: 'Probar el umbral', ar: 'جرّب العتبة بنفسك' },
} satisfies Record<string, TranslationMap>

export default function SeparationLoss() {
  const { t } = useI18n()
  const { theme } = useTheme()
  const trainingFigure = {
    ...separationNoiseTraining,
    src: theme === 'light' ? separationNoiseTraining.lightSrc : separationNoiseTraining.src,
  }

  return (
    <section className="cd-rf-formula-box" aria-labelledby="separation-loss">
      <h4 id="separation-loss" className="cd-rfc-title">{t(copy.title)}</h4>
      <p className="cd-rfc-summary">{t(copy.intro)}</p>

      {baseline?.withinCifarStd != null && withSeparation?.withinCifarStd != null && (
        <div className="cd-rfc-evidence">
          <dl className="cd-rfc-result">
            {[
              { label: copy.baseline, entry: baseline },
              { label: copy.separation, entry: withSeparation },
            ].map(({ label, entry }) => (
              <div key={entry.lambda}>
                <dt>{t(label)} <bdi>λ = {Number(entry.lambda)}</bdi> · {t(QUALIFIERS.threeSeeds.text)}</dt>
                <dd><bdi dir="ltr">{entry.withinCifarMean.toFixed(2)}% ± {entry.withinCifarStd?.toFixed(2)}%</bdi></dd>
              </div>
            ))}
          </dl>
          <p>{t(copy.benchmark)}</p>
        </div>
      )}

      <ol className="cd-rfc-flow" role="list">
        <li>
          <h5>{t(copy.predict)}</h5>
          <ResearchFigure figure={trainingFigure} />
          <p>{t(separationNoiseTraining.caption)}</p>
        </li>
        <li>
          <h5>{t(copy.separate)}</h5>
          <div className="cd-rfc-diagram cd-rfc-distance" aria-hidden="true">
            <div className="cd-rfc-gap-row">
              <span>{t(copy.denoisingOnly)}</span>
              <div className="cd-rfc-gap" dir="ltr"><bdi>c = 0</bdi><bdi>c = 1</bdi></div>
            </div>
            <div className="cd-rfc-gap-row">
              <span>{t(copy.separation)}</span>
              <div className="cd-rfc-gap cd-rfc-gap-wide" dir="ltr"><bdi>c = 0</bdi><bdi>c = 1</bdi></div>
            </div>
          </div>
          <p>{t(copy.distance)}</p>
        </li>
        <li className="cd-rfc-decision">
          <h5>{t(copy.decide)}</h5>
          <div className="cd-rfc-diagram cd-rfc-rule">
            <span className="cd-rfc-example">{t(copy.example)}</span>
            <div className="cd-rfc-score">
              <span>{t(copy.score)}</span>
              <bdi dir="ltr">0.7 − 0.5 = +0.2</bdi>
            </div>
            <div className="cd-rfc-check">
              <bdi dir="ltr">+0.2 &lt; +0.3</bdi>
              <span>{t(copy.belowThreshold)}</span>
            </div>
            <div className="cd-rfc-threshold-track" dir="ltr" aria-hidden="true" />
            <span className="cd-rfc-verdict">{t(copy.familiar)}</span>
          </div>
          <p>{t(copy.decision)}</p>
        </li>
      </ol>

      <div className="cd-rfc-actions">
        <details>
          <summary>{t(copy.details)}</summary>
          <div className="cd-rfc-compact-formula" dir="ltr">
            <span>L<sub>total</sub> = L<sub>denoise</sub> + λ L<sub>sep</sub></span>
            <span>L<sub>sep</sub> = −MSE(ε̂₀, ε̂₁)</span>
            <span>s<sub>OOD</sub>(x) = e₀(x) − e₁(x)</span>
          </div>
          <p>{t(copy.symbols)}</p>
        </details>
        <a className="cd-proj-link" href="#ood-explorer">
          {t(copy.explore)} <span className="inline-block rtl:rotate-180" aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </section>
  )
}
