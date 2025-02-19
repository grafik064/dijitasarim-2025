import { prisma } from '@/lib/prisma';
import { DesignAnalysisResult } from '@/lib/analysis/content-analyzer';

export interface UserProgress {
  userId: string;
  resourceId: string;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  lastAccessedAt: Date;
  timeSpent: number;
  analysisResults?: DesignAnalysisResult;
  feedback?: {
    rating: number;
    comments?: string;
    strengths?: string[];
    improvements?: string[];
  };
}

export interface LearningMetrics {
  completedResources: number;
  totalResources: number;
  averageScore: number;
  strongestAreas: string[];
  areasForImprovement: string[];
  learningTrend: Array<{
    date: Date;
    score: number;
    category: string;
  }>;
  recentFeedback: Array<{
    resourceId: string;
    feedback: UserProgress['feedback'];
    date: Date;
  }>;
  skillLevels: Record<string, number>;
  recommendations: Array<{
    area: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export class ProgressTrackingService {
  async updateProgress(progress: UserProgress): Promise<void> {
    try {
      await prisma.userProgress.upsert({
        where: {
          userId_resourceId: {
            userId: progress.userId,
            resourceId: progress.resourceId
          }
        },
        update: {
          completionStatus: progress.completionStatus,
          lastAccessedAt: progress.lastAccessedAt,
          timeSpent: progress.timeSpent,
          analysisResults: progress.analysisResults as any,
          feedback: progress.feedback as any
        },
        create: {
          userId: progress.userId,
          resourceId: progress.resourceId,
          completionStatus: progress.completionStatus,
          lastAccessedAt: progress.lastAccessedAt,
          timeSpent: progress.timeSpent,
          analysisResults: progress.analysisResults as any,
          feedback: progress.feedback as any
        }
      });

      await this.updateLearningMetrics(progress.userId);
    } catch (error) {
      console.error('İlerleme güncelleme hatası:', error);
      throw new Error('Kullanıcı ilerlemesi güncellenemedi');
    }
  }

  async getLearningMetrics(userId: string): Promise<LearningMetrics> {
    try {
      const progress = await prisma.userProgress.findMany({
        where: { userId },
        orderBy: { lastAccessedAt: 'desc' }
      });

      const metrics = this.calculateLearningMetrics(progress);
      const recommendations = this.generateRecommendations(metrics);
      const skillLevels = this.calculateSkillLevels(progress);

      return {
        ...metrics,
        recommendations,
        skillLevels
      };
    } catch (error) {
      console.error('Öğrenme metrikleri alma hatası:', error);
      throw new Error('Öğrenme metrikleri alınamadı');
    }
  }

  private async updateLearningMetrics(userId: string): Promise<void> {
    try {
      const metrics = await this.getLearningMetrics(userId);
      
      await prisma.userMetrics.upsert({
        where: { userId },
        update: {
          completedResources: metrics.completedResources,
          totalResources: metrics.totalResources,
          averageScore: metrics.averageScore,
          strongestAreas: metrics.strongestAreas,
          areasForImprovement: metrics.areasForImprovement,
          learningTrend: metrics.learningTrend as any,
          skillLevels: metrics.skillLevels as any,
          updatedAt: new Date()
        },
        create: {
          userId,
          completedResources: metrics.completedResources,
          totalResources: metrics.totalResources,
          averageScore: metrics.averageScore,
          strongestAreas: metrics.strongestAreas,
          areasForImprovement: metrics.areasForImprovement,
          learningTrend: metrics.learningTrend as any,
          skillLevels: metrics.skillLevels as any
        }
      });
    } catch (error) {
      console.error('Metrik güncelleme hatası:', error);
      throw new Error('Öğrenme metrikleri güncellenemedi');
    }
  }

  private calculateLearningMetrics(progress: any[]): Partial<LearningMetrics> {
    const completedResources = progress.filter(p => p.completionStatus === 'completed').length;
    const totalResources = progress.length;

    const averageScore = progress.reduce((sum, p) => {
      if (p.analysisResults) {
        return sum + p.analysisResults.overall.score;
      }
      return sum;
    }, 0) / completedResources;

    const categoryScores = this.calculateCategoryScores(progress);
    const strongestAreas = this.identifyStrongestAreas(categoryScores);
    const areasForImprovement = this.identifyAreasForImprovement(categoryScores);

    const learningTrend = this.calculateLearningTrend(progress);
    const recentFeedback = this.getRecentFeedback(progress);

    return {
      completedResources,
      totalResources,
      averageScore,
      strongestAreas,
      areasForImprovement,
      learningTrend,
      recentFeedback
    };
  }

  private calculateCategoryScores(progress: any[]): Record<string, number> {
    const categories = {
      composition: [] as number[],
      color: [] as number[],
      technique: [] as number[]
    };

    progress.forEach(p => {
      if (p.analysisResults) {
        categories.composition.push(p.analysisResults.composition.score);
        categories.color.push(p.analysisResults.color.score);
        categories.technique.push(p.analysisResults.technique.score);
      }
    });

    return {
      composition: this.calculateAverage(categories.composition),
      color: this.calculateAverage(categories.color),
      technique: this.calculateAverage(categories.technique)
    };
  }

  private calculateSkillLevels(progress: any[]): Record<string, number> {
    const skills = {
      'Görsel Hiyerarşi': [] as number[],
      'Renk Uyumu': [] as number[],
      'Kompozisyon': [] as number[],
      'İllüstrasyon Teknikleri': [] as number[],
      'Tipografi': [] as number[]
    };

    progress.forEach(p => {
      if (p.analysisResults) {
        // Her beceri için ilgili metrikleri topla
        const results = p.analysisResults;
        
        skills['Görsel Hiyerarşi'].push(
          (results.composition.score + results.technique.score) / 2
        );
        
        skills['Renk Uyumu'].push(results.color.score);
        
        skills['Kompozisyon'].push(
          (results.composition.score * 0.7 + results.color.score * 0.3)
        );
        
        skills['İllüstrasyon Teknikleri'].push(
          results.technique.score
        );
        
        if (results.composition.typography) {
          skills['Tipografi'].push(results.composition.typography);
        }
      }
    });

    // Her beceri için ortalama seviyeyi hesapla
    return Object.entries(skills).reduce((acc, [skill, scores]) => {
      acc[skill] = this.calculateAverage(scores);
      return acc;
    }, {} as Record<string, number>);
  }

  private generateRecommendations(metrics: Partial<LearningMetrics>) {
    const recommendations: LearningMetrics['recommendations'] = [];

    // Zayıf alanlar için öneriler
    metrics.areasForImprovement?.forEach(area => {
      recommendations.push({
        area,
        suggestion: this.getAreaSuggestion(area),
        priority: 'high'
      });
    });

    // Orta seviyedeki alanlar için geliştirme önerileri
    Object.entries(metrics.skillLevels || {}).forEach(([skill, level]) => {
      if (level < 0.7 && level > 0.4) {
        recommendations.push({
          area: skill,
          suggestion: this.getSkillSuggestion(skill),
          priority: 'medium'
        });
      }
    });

    return recommendations;
  }

  private calculateLearningTrend(progress: any[]) {
    return progress
      .filter(p => p.analysisResults)
      .map(p => ({
        date: p.lastAccessedAt,
        score: p.analysisResults.overall.score,
        category: this.determinePrimaryCategory(p.analysisResults)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private getRecentFeedback(progress: any[]) {
    return progress
      .filter(p => p.feedback)
      .sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime())
      .slice(0, 5)
      .map(p => ({
        resourceId: p.resourceId,
        feedback: p.feedback,
        date: p.lastAccessedAt
      }));
  }

  private identifyStrongestAreas(scores: Record<string, number>): string[] {
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([area]) => area);
  }

  private identifyAreasForImprovement(scores: Record<string, number>): string[] {
    return Object.entries(scores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 3)
      .map(([area]) => area);
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  private determinePrimaryCategory(results: DesignAnalysisResult): string {
    const scores = {
      composition: results.composition.score,
      color: results.color.score,
      technique: results.technique.score
    };

    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)[0][0];
  }

  private getAreaSuggestion(area: string): string {
    const suggestions: Record<string, string> = {
      composition: 'Kompozisyon egzersizleri ve temel tasarım ilkelerini çalışın',
      color: 'Renk teorisi ve renk uyumu konularında pratik yapın',
      technique: 'Temel illüstrasyon tekniklerini geliştirin'
    };

    return suggestions[area] || 'Bu alan için özel çalışmalar yapın';
  }

  private getSkillSuggestion(skill: string): string {
    const suggestions: Record<string, string> = {
      'Görsel Hiyerarşi': 'Görsel öğelerin önem sıralamasını ve düzenini geliştirin',
      'Renk Uyumu': 'Renk paletleri oluşturma ve renk kombinasyonları üzerine çalışın',
      'Kompozisyon': 'Denge ve orantı ilkelerini uygulayarak kompozisyon çalışmaları yapın',
      'İllüstrasyon Teknikleri': 'Farklı illüstrasyon tekniklerini deneyimleyin',
      'Tipografi': 'Font seçimi ve tipografik hiyerarşi konularında kendinizi geliştirin'
    };

    return suggestions[skill] || 'Bu beceri için özel alıştırmalar yapın';
  }
}

export const progressTrackingService = new ProgressTrackingService();