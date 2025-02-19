import * as tf from '@tensorflow/tfjs';
import { loadLayersModel } from '@tensorflow/tfjs-layers';
import { DesignAnalysis, AnalysisConfig } from '@/types/analysis';

export class DesignAnalyzer {
  private compositionModel: tf.LayersModel | null = null;
  private colorModel: tf.LayersModel | null = null;
  private techniqueModel: tf.LayersModel | null = null;

  constructor() {
    this.initializeModels();
  }

  private async initializeModels() {
    try {
      // Modelleri yükle
      const modelPath = '/models';
      this.compositionModel = await loadLayersModel(`${modelPath}/composition-model/model.json`);
      this.colorModel = await loadLayersModel(`${modelPath}/color-model/model.json`);
      this.techniqueModel = await loadLayersModel(`${modelPath}/technique-model/model.json`);

      // Modelleri ısıt
      const warmupData = tf.zeros([1, 224, 224, 3]);
      await this.compositionModel.predict(warmupData);
      await this.colorModel.predict(warmupData);
      await this.techniqueModel.predict(warmupData);
      warmupData.dispose();
    } catch (error) {
      console.error('Model yükleme hatası:', error);
      throw new Error('Analiz modelleri yüklenemedi');
    }
  }

  public async analyzeDesign(image: HTMLImageElement | ImageData, config: AnalysisConfig): Promise<DesignAnalysis> {
    try {
      // Görüntüyü tensor formatına dönüştür
      const tensor = await this.preprocessImage(image);

      // Paralel analiz işlemleri
      const [compositionAnalysis, colorAnalysis, techniqueAnalysis] = await Promise.all([
        this.analyzeComposition(tensor, config),
        this.analyzeColors(tensor, config),
        this.analyzeTechniques(tensor, config)
      ]);

      // Tensoru temizle
      tensor.dispose();

      // Sonuçları birleştir ve öneriler oluştur
      const recommendations = this.generateRecommendations({
        composition: compositionAnalysis,
        colors: colorAnalysis,
        techniques: techniqueAnalysis
      });

      return {
        composition: compositionAnalysis,
        colors: colorAnalysis,
        techniques: techniqueAnalysis,
        recommendations
      };
    } catch (error) {
      console.error('Analiz hatası:', error);
      throw new Error('Tasarım analizi sırasında bir hata oluştu');
    }
  }

  private async preprocessImage(image: HTMLImageElement | ImageData): Promise<tf.Tensor3D> {
    // Görüntüyü tensora dönüştür
    const tensor = tf.browser.fromPixels(image);
    
    // Yeniden boyutlandır
    const resized = tf.image.resizeBilinear(tensor, [224, 224]);
    
    // Normalize et
    const normalized = resized.div(255.0);
    
    // Orijinal tensoru temizle
    tensor.dispose();
    resized.dispose();
    
    return normalized;
  }

  private async analyzeComposition(tensor: tf.Tensor3D, config: AnalysisConfig) {
    if (!this.compositionModel) throw new Error('Kompozisyon modeli hazır değil');

    // Kompozisyon analizi yap
    const predictions = await this.compositionModel.predict(tensor.expandDims());
    
    // Sonuçları işle
    const compositionFeatures = await this.extractCompositionFeatures(predictions);
    
    return this.interpretCompositionResults(compositionFeatures, config);
  }

  private async analyzeColors(tensor: tf.Tensor3D, config: AnalysisConfig) {
    if (!this.colorModel) throw new Error('Renk modeli hazır değil');

    // Renk analizi yap
    const predictions = await this.colorModel.predict(tensor.expandDims());
    
    // Sonuçları işle
    const colorFeatures = await this.extractColorFeatures(predictions);
    
    return this.interpretColorResults(colorFeatures, config);
  }

  private async analyzeTechniques(tensor: tf.Tensor3D, config: AnalysisConfig) {
    if (!this.techniqueModel) throw new Error('Teknik analiz modeli hazır değil');

    // Teknik analizi yap
    const predictions = await this.techniqueModel.predict(tensor.expandDims());
    
    // Sonuçları işle
    const techniqueFeatures = await this.extractTechniqueFeatures(predictions);
    
    return this.interpretTechniqueResults(techniqueFeatures, config);
  }

  private generateRecommendations(analysis: DesignAnalysis) {
    const recommendations = [];

    // Kompozisyon önerileri
    if (analysis.composition.balance.score < 0.6) {
      recommendations.push({
        principle: 'Denge',
        issue: 'Görsel ağırlık dağılımı dengesiz',
        suggestion: 'Öğeleri daha dengeli yerleştirmeyi deneyin',
        priority: 'high'
      });
    }

    // Renk önerileri
    if (analysis.colors.harmony.score < 0.5) {
      recommendations.push({
        principle: 'Renk Uyumu',
        issue: 'Renk paleti uyumu zayıf',
        suggestion: 'Tamamlayıcı renkler kullanmayı deneyin',
        priority: 'medium'
      });
    }

    // Teknik öneriler
    if (analysis.techniques.qualityMetrics.precision < 0.7) {
      recommendations.push({
        principle: 'Teknik Hassasiyet',
        issue: 'Çizgi kontrolü geliştirilebilir',
        suggestion: 'Hassas çizgi egzersizleri yapın',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  public dispose() {
    // Modelleri temizle
    if (this.compositionModel) this.compositionModel.dispose();
    if (this.colorModel) this.colorModel.dispose();
    if (this.techniqueModel) this.techniqueModel.dispose();
  }
}