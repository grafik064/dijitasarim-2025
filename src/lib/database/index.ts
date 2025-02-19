import { PrismaClient } from '@prisma/client';
import { DesignAnalysis } from '@/types/analysis';

const prisma = new PrismaClient();

export interface AnalysisData {
  userId: string;
  imageUrl: string;
  analysis: DesignAnalysis;
  metadata: {
    filename: string;
    fileSize: number;
    mimeType: string;
    analyzedAt: Date;
  };
}

export async function saveAnalysisResult(data: AnalysisData) {
  try {
    const result = await prisma.analysisResult.create({
      data: {
        userId: data.userId,
        imageUrl: data.imageUrl,
        analysisData: data.analysis as any,
        metadata: data.metadata as any,
        createdAt: new Date()
      }
    });

    // İlişkili verileri kaydet
    await Promise.all([
      saveCompositionAnalysis(result.id, data.analysis.composition),
      saveColorAnalysis(result.id, data.analysis.colors),
      saveTechniqueAnalysis(result.id, data.analysis.techniques)
    ]);

    return result;
  } catch (error) {
    console.error('Veritabanı kayıt hatası:', error);
    throw new Error('Analiz sonuçları kaydedilemedi');
  }
}

export async function getAnalysisHistory(userId: string) {
  try {
    return await prisma.analysisResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        compositionAnalysis: true,
        colorAnalysis: true,
        techniqueAnalysis: true
      }
    });
  } catch (error) {
    console.error('Analiz geçmişi getirme hatası:', error);
    throw new Error('Analiz geçmişi alınamadı');
  }
}

export async function getAnalysisDetails(analysisId: string) {
  try {
    return await prisma.analysisResult.findUnique({
      where: { id: analysisId },
      include: {
        compositionAnalysis: true,
        colorAnalysis: true,
        techniqueAnalysis: true,
        recommendations: true
      }
    });
  } catch (error) {
    console.error('Analiz detayları getirme hatası:', error);
    throw new Error('Analiz detayları alınamadı');
  }
}

export async function saveUserFeedback(
  analysisId: string,
  feedback: {
    rating: number;
    comments: string;
    categories: string[];
  }
) {
  try {
    return await prisma.analysisFeedback.create({
      data: {
        analysisId,
        rating: feedback.rating,
        comments: feedback.comments,
        categories: feedback.categories,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Geri bildirim kayıt hatası:', error);
    throw new Error('Kullanıcı geri bildirimi kaydedilemedi');
  }
}

async function saveCompositionAnalysis(analysisId: string, data: any) {
  return await prisma.compositionAnalysis.create({
    data: {
      analysisId,
      hierarchy: data.hierarchy as any,
      balance: data.balance as any,
      rhythm: data.rhythm as any,
      unity: data.unity as any,
      designPrinciples: data.designPrinciples as any
    }
  });
}

async function saveColorAnalysis(analysisId: string, data: any) {
  return await prisma.colorAnalysis.create({
    data: {
      analysisId,
      distribution: data.distribution as any,
      harmony: data.harmony as any,
      contrast: data.contrast as any,
      palette: data.palette as any
    }
  });
}

async function saveTechniqueAnalysis(analysisId: string, data: any) {
  return await prisma.techniqueAnalysis.create({
    data: {
      analysisId,
      detectedTechniques: data.detectedTechniques as any,
      materialAnalysis: data.materialAnalysis as any,
      applicationMethods: data.applicationMethods as any,
      qualityMetrics: data.qualityMetrics as any
    }
  });
}

export { prisma };