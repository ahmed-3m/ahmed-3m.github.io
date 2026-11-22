'use client'

import ResearchFigure from '@/components/ResearchFigure'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { CIFAR_LAMBDA_SWEEP } from '@/lib/ood-explorer-data'
import { separationIllustrations } from '@/lib/research-figures'

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
  predict: { en: 'Predict the noise twice', de: 'Rauschen zweimal vorhersagen', fr: 'Prédire le bruit deux fois', es: 'Predecir el ruido dos veces', ar: 'تنبّأ بالضوضاء مرتين' },
  separate: { en: 'Separate the predictions', de: 'Vorhersagen trennen', fr: 'Séparer les prédictions', es: 'Separar las predicciones', ar: 'افصل بين التنبؤين' },
  decide: { en: 'Apply the threshold', de: 'Schwelle anwenden', fr: 'Appliquer le seuil', es: 'Aplicar el umbral', ar: 'طبّق العتبة' },
  score: { en: 'Anomaly score', de: 'Anomaliewert', fr: 'Score d’anomalie', es: 'Puntuación de anomalía', ar: 'درجة الشذوذ' },
  compare: {
    en: 'Compare with threshold',
    de: 'Mit Schwelle vergleichen',
    fr: 'Comparer au seuil',
    es: 'Comparar con el umbral',
    ar: 'قارن بالعتبة',
  },
  familiar: { en: 'Familiar', de: 'Vertraut', fr: 'Familière', es: 'Familiar', ar: 'مألوفة' },
  unfamiliar: { en: 'Flag as unfamiliar', de: 'Als unbekannt markieren', fr: 'Signaler comme inconnue', es: 'Marcar como desconocida', ar: 'صنّفها كغير مألوفة' },
  decision: {
    en: 'Subtract the two noise prediction errors to get the score, then compare it with the calibrated threshold.',
    de: 'Ziehe die beiden Fehler der Rauschvorhersage voneinander ab und vergleiche den Wert mit der kalibrierten Schwelle.',
    fr: 'Soustraire les deux erreurs de prédiction du bruit pour obtenir le score, puis le comparer au seuil calibré.',
    es: 'Resta los dos errores de predicción del ruido para obtener la puntuación y compárala con el umbral calibrado.',
    ar: 'احسب الفرق بين خطأَي التنبؤ بالضوضاء للحصول على الدرجة، ثم قارنها بالعتبة المعايرة.',
  },
  details: { en: 'Technical details', de: 'Technische Details', fr: 'Détails techniques', es: 'Detalles técnicos', ar: 'التفاصيل التقنية' },
  symbols: {
    en: 'During inference, e₀ and e₁ are the noise prediction errors under the familiar and other conditions. The calibrated threshold τ can be positive or negative.',
    de: 'Bei der Inferenz sind e₀ und e₁ die Fehler der Rauschvorhersage unter der vertrauten bzw. der anderen Bedingung. Die kalibrierte Schwelle τ kann positiv oder negativ sein.',
    fr: 'À l’inférence, e₀ et e₁ sont les erreurs de prédiction du bruit sous les conditions familière et autre. Le seuil calibré τ peut être positif ou négatif.',
    es: 'En la inferencia, e₀ y e₁ son los errores de predicción del ruido bajo las condiciones familiar y otra. El umbral calibrado τ puede ser positivo o negativo.',
    ar: 'عند الاستدلال، يمثّل e₀ وe₁ خطأَي التنبؤ بالضوضاء تحت الشرطين المألوف والآخر. وقد تكون العتبة المعايرة τ موجبة أو سالبة.',
  },
  explore: { en: 'Try the threshold yourself', de: 'Schwelle selbst ausprobieren', fr: 'Essayer le seuil', es: 'Probar el umbral', ar: 'جرّب العتبة بنفسك' },
} satisfies Record<string, TranslationMap>

const trainingSteps = [copy.predict, copy.separate].map((title, index) => ({
  title,
  figure: separationIllustrations[index],
}))

export default function SeparationLoss() {
  const { t } = useI18n()

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
                <dt>{t(label)} <bdi>λ = {Number(entry.lambda)}</bdi></dt>
                <dd><bdi dir="ltr">{entry.withinCifarMean.toFixed(2)}% ± {entry.withinCifarStd?.toFixed(2)}%</bdi></dd>
              </div>
            ))}
          </dl>
          <p>{t(copy.benchmark)}</p>
        </div>
      )}

      <ol className="cd-rfc-flow" role="list">
        {trainingSteps.map(({ title, figure }) => (
          <li key={figure.src}>
            <h5>{t(title)}</h5>
            <ResearchFigure figure={figure} />
            <p>{t(figure.caption)}</p>
          </li>
        ))}
        <li className="cd-rfc-decision">
          <h5>{t(copy.decide)}</h5>
          <div className="cd-rfc-rule">
            <div className="cd-rfc-score">
              <span>{t(copy.score)}</span>
              <bdi dir="ltr">e₀ − e₁</bdi>
            </div>
            <div className="cd-rfc-compare">{t(copy.compare)} <bdi>τ</bdi></div>
            <div className="cd-rfc-outcomes">
              <div>
                <bdi dir="ltr">&lt; τ</bdi>
                <span>{t(copy.familiar)}</span>
              </div>
              <div>
                <bdi dir="ltr">≥ τ</bdi>
                <span>{t(copy.unfamiliar)}</span>
              </div>
            </div>
          </div>
          <p>{t(copy.decision)}</p>
        </li>
      </ol>

      <div className="cd-rfc-actions">
        <details>
          <summary>{t(copy.details)}</summary>
          <div className="cd-rfc-compact-formula" dir="ltr">
            <span>L<sub>total</sub> = L<sub>denoise</sub> + λ L<sub>sep</sub></span>
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
