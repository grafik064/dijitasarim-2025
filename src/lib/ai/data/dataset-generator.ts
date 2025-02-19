import * as tf from '@tensorflow/tfjs';
import { prisma } from '@/lib/prisma';
import { DataAugmentation } from './augmentation';
import { ImageProcessor } from './image-processing';
import { DesignPrinciples } from '@/types/analysis';

export class DatasetGenerator {
  private augmentation: DataAugmentation;
  private imageProcessor: ImageProcessor;

  constructor() {
    this.augmentation = new DataAugmentation();
    this.imageProcessor = new ImageProcessor();
  }

  public async generateTrainingDataset(config: any) {
    try {
      // Veri setini getir
      const trainingData = await this.fetchTrainingData();

      // Veriyi hazırla
      const processedData = await this.preprocessData(trainingData);

      // Veri arttırma
      const augmentedData = await this.augmentData(processedData, config.augmentation);

      // Eğitim ve doğrulama setlerini ayır
      return this.splitDataset(augmentedData, config.training.validation_split);
    } catch (error) {
      console.error('Veri seti oluşturma hatası:', error);
      throw new Error('Eğitim veri seti oluşturulamadı');
    }
  }

  private async fetchTrainingData() {
    // Onaylanmış eğitim verilerini getir
    return await prisma.trainingData.findMany({
      where: {
        validated: true
      },
      include: {
        labels: true,
        metadata: true
      }
    });
  }

  private async preprocessData(data: any[]) {
    const processedData = await Promise.all(data.map(async (item) => {
      // Görüntüyü işle
      const processedImage = await this.imageProcessor.process(item.imageUrl);

      // Etiketleri normalize et
      const normalizedLabels = this.normalizeLabels(item.labels);

      return {
        image: processedImage,
        labels: normalizedLabels,
        metadata: item.metadata
      };
    }));

    return processedData;
  }

  private async augmentData(data: any[], augConfig: any) {
    if (!augConfig.enabled) return data;

    const augmentedData = [];

    for (const item of data) {
      // Orijinal veriyi ekle
      augmentedData.push(item);

      // Veri arttırma teknikleri uygula
      const augmentations = await this.augmentation.applyTechniques(
        item.image,
        augConfig.techniques
      );

      // Arttırılmış verileri ekle
      augmentations.forEach(augImage => {
        augmentedData.push({
          ...item,
          image: augImage
        });
      });
    }

    return augmentedData;
  }

  private splitDataset(data: any[], validationSplit: number) {
    const splitIndex = Math.floor(data.length * (1 - validationSplit));
    
    // Veriyi karıştır
    const shuffledData = tf.util.shuffle(data);

    // Eğitim ve doğrulama setlerini ayır
    const trainData = shuffledData.slice(0, splitIndex);
    const valData = shuffledData.slice(splitIndex);

    // Tensor formatına dönüştür
    const trainDataset = this.createTensorDataset(trainData);
    const valDataset = this.createTensorDataset(valData);

    return {
      trainDataset,
      valDataset,
      metadata: {
        numTrainExamples: trainData.length,
        numValExamples: valData.length,
        imageSize: trainData[0].image.shape,
        numClasses: Object.keys(trainData[0].labels).length
      }
    };
  }

  private createTensorDataset(data: any[]) {
    const images = data.map(item => item.image);
    const labels = data.map(item => item.labels);

    return tf.data.zip({
      xs: tf.data.array(images),
      ys: tf.data.array(labels)
    });
  }

  private normalizeLabels(labels: any): DesignPrinciples {
    // Etiketleri normalize et
    return {
      contrast: this.normalizeScore(labels.contrast),
      emphasis: this.normalizeScore(labels.emphasis),
      proportion: this.normalizeScore(labels.proportion),
      harmony: this.normalizeScore(labels.harmony),
      balance: this.normalizeScore(labels.balance),
      rhythm: this.normalizeScore(labels.rhythm),
      unity: this.normalizeScore(labels.unity)
    };
  }

  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(1, score));
  }
}