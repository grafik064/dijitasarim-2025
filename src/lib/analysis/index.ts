import * as tf from '@tensorflow/tfjs'
import { processImage } from './image-processing'
import { analyzeColors } from './color-analysis'
import { analyzeComposition } from './composition-analysis'
import { analyzeTechniques } from './technique-analysis'

export async function analyzeDesign(file: File) {
  // Dosyayı tensor formatına dönüştür
  const image = await processImage(file)
  
  // Renk analizi
  const colorAnalysis = await analyzeColors(image)
  
  // Kompozisyon analizi
  const compositionAnalysis = await analyzeComposition(image)
  
  // Teknik analizi
  const techniqueAnalysis = await analyzeTechniques(image)
  
  return {
    colors: colorAnalysis,
    composition: compositionAnalysis,
    techniques: techniqueAnalysis
  }
}