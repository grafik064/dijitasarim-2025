import * as tf from '@tensorflow/tfjs'

export async function processImage(file: File): Promise<tf.Tensor3D> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      const img = new Image()
      img.src = e.target?.result as string
      
      img.onload = () => {
        // Görüntüyü tensor formatına dönüştür
        const tensor = tf.browser.fromPixels(img)
        resolve(tensor)
      }
      
      img.onerror = () => {
        reject(new Error('Görüntü yüklenemedi'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Dosya okunamadı'))
    }
    
    reader.readAsDataURL(file)
  })
}