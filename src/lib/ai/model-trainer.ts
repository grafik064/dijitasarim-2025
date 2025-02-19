import * as tf from '@tensorflow/tfjs';
import { ModelConfig, TrainingConfig, DataSet } from '@/types/training';

export class DesignModelTrainer {
  private model: tf.LayersModel | null = null;
  private datasetCache: Map<string, tf.TensorContainer>;
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
    this.datasetCache = new Map();
  }

  public async buildModel() {
    const { inputShape, architecture } = this.config;

    const model = tf.sequential();

    // Temel model mimarisi
    model.add(tf.layers.conv2d({
      inputShape,
      filters: 32,
      kernelSize: 3,
      activation: 'relu'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // Derin özellik çıkarımı
    model.add(tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }));

    // Özellik vektörü oluşturma
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.5 }));

    // Çıktı katmanı
    model.add(tf.layers.dense({
      units: this.config.outputUnits,
      activation: this.config.outputActivation
    }));

    // Modeli derle
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: this.config.lossFunction,
      metrics: ['accuracy']
    });

    this.model = model;
    return model;
  }

  public async prepareDataset(dataset: DataSet) {
    const { images, labels } = dataset;

    // Görüntüleri tensora dönüştür
    const imageTensors = await this.preprocessImages(images);
    const labelTensors = tf.tensor2d(labels);

    // Veri setini karıştır ve böl
    const shuffledIndices = tf.util.createShuffledIndices(images.length);
    const numTrain = Math.floor(images.length * 0.8);

    const trainIndices = shuffledIndices.slice(0, numTrain);
    const valIndices = shuffledIndices.slice(numTrain);

    // Eğitim ve doğrulama setlerini oluştur
    const trainImages = tf.gather(imageTensors, trainIndices);
    const trainLabels = tf.gather(labelTensors, trainIndices);
    const valImages = tf.gather(imageTensors, valIndices);
    const valLabels = tf.gather(labelTensors, valIndices);

    // Veri setlerini önbellekte sakla
    this.datasetCache.set('trainImages', trainImages);
    this.datasetCache.set('trainLabels', trainLabels);
    this.datasetCache.set('valImages', valImages);
    this.datasetCache.set('valLabels', valLabels);

    return {
      trainDataset: { images: trainImages, labels: trainLabels },
      valDataset: { images: valImages, labels: valLabels }
    };
  }

  public async trainModel(config: TrainingConfig) {
    if (!this.model) throw new Error('Model henüz oluşturulmadı');

    const trainImages = this.datasetCache.get('trainImages');
    const trainLabels = this.datasetCache.get('trainLabels');
    const valImages = this.datasetCache.get('valImages');
    const valLabels = this.datasetCache.get('valLabels');

    if (!trainImages || !trainLabels || !valImages || !valLabels) {
      throw new Error('Veri seti hazır değil');
    }

    // Eğitim konfigürasyonu
    const trainConfig = {
      epochs: config.epochs,
      batchSize: config.batchSize,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch: number, logs: tf.Logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
        }
      }
    };

    // Modeli eğit
    const history = await this.model.fit(trainImages, trainLabels, trainConfig);

    // Modeli değerlendir
    const evaluation = await this.model.evaluate(valImages, valLabels);
    
    return {
      history,
      evaluation: {
        loss: evaluation[0].dataSync()[0],
        accuracy: evaluation[1].dataSync()[0]
      }
    };
  }

  private async preprocessImages(images: HTMLImageElement[]): Promise<tf.Tensor4D> {
    const tensors = await Promise.all(images.map(async (image) => {
      // Görüntüyü tensora dönüştür
      const tensor = tf.browser.fromPixels(image);
      
      // Yeniden boyutlandır
      const resized = tf.image.resizeBilinear(tensor, [
        this.config.inputShape[0],
        this.config.inputShape[1]
      ]);
      
      // Normalize et
      const normalized = resized.div(255.0);
      
      // Orijinal tensoru temizle
      tensor.dispose();
      resized.dispose();
      
      return normalized;
    }));

    // Tensörleri birleştir
    return tf.stack(tensors) as tf.Tensor4D;
  }

  public async saveModel(path: string) {
    if (!this.model) throw new Error('Model henüz oluşturulmadı');
    await this.model.save(`file://${path}`);
  }

  public async loadModel(path: string) {
    this.model = await tf.loadLayersModel(`file://${path}`);
    return this.model;
  }

  public dispose() {
    // Modeli ve önbelleği temizle
    if (this.model) this.model.dispose();
    this.datasetCache.forEach(tensor => tensor.dispose());
    this.datasetCache.clear();
  }
}