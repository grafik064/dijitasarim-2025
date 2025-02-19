import { prisma } from '@/lib/prisma';
import { DesignAnalysisResult } from '@/lib/analysis/content-analyzer';
import { UserProgress } from './progress-tracking';

export interface FeedbackData {
  userId: string;
  resourceId: string;
  rating: number;
  comments?: string;
  strengths?: string[];
  improvements?: string[];
  designAnalysis?: DesignAnalysisResult;
  tags?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  learningContext?: {
    difficulty: 'too_easy' | 'appropriate' | 'too_difficult';
    timeSpent: number;
    comprehension: number;
    technicalIssues?: string[];
  };
}

export interface RecommendationData {
  userId: string;
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  relevanceScore: number;
  resources?: Array<{
    id: string;
    title: string;
    type: 'video' | 'article' | 'exercise';
    duration: string;
    prerequisites?: string[];
  }>;
  skills?: Array<{
    name: string;
    currentLevel: number;
    targetLevel: number;
    requiredPractice?: string;
  }>;
  timeline?: {
    estimatedDuration: string;
    milestones: Array<{
      title: string;
      description: string;
      deadline: Date;
    }>;
  };
}

export class FeedbackService {
  async submitFeedback(feedback: FeedbackData): Promise<void> {
    try {
      // Geri bildirimi işle ve kaydet
      const sentiment = this.analyzeSentiment(feedback);
      const enrichedFeedback = this.enrichFeedbackData(feedback);

      await prisma.userFeedback.create({
        data: {
          userId: feedback.userId,
          resourceId: feedback.resourceId,
          rating: feedback.rating,
          comments: feedback.comments,
          strengths: enrichedFeedback.strengths as any,
          improvements: enrichedFeedback.improvements as any,
          designAnalysis: feedback.designAnalysis as any,
          tags: enrichedFeedback.tags as any,
          sentiment,
          learningContext: feedback.learningContext as any,
          createdAt: new Date()
        }
      });

      // Kullanıcı ilerlemesini güncelle
      await prisma.userProgress.update({
        where: {
          userId_resourceId: {
            userId: feedback.userId,
            resourceId: feedback.resourceId
          }
        },
        data: {
          feedback: {
            rating: feedback.rating,
            comments: feedback.comments,
            strengths: enrichedFeedback.strengths,
            improvements: enrichedFeedback.improvements,
            timestamp: new Date()
          }
        }
      });

      // Önerileri güncelle
      await this.updateRecommendations(feedback.userId);

    } catch (error) {
      console.error('Geri bildirim kaydetme hatası:', error);
      throw new Error('Geri bildirim kaydedilemedi');
    }
  }

  async getRecommendations(userId: string): Promise<RecommendationData[]> {
    try {
      // Kullanıcının öğrenme geçmişini getir
      const progress = await prisma.userProgress.findMany({
        where: { userId },
        include: {
          feedback: true
        }
      });

      // Kullanıcının beceri seviyelerini hesapla
      const skillLevels = this.calculateSkillLevels(progress);

      // Kullanıcının öğrenme tarzını analiz et
      const learningStyle = await this.analyzeLearningStyle(userId);

      // Kişiselleştirilmiş öneriler oluştur
      const recommendations = this.generatePersonalizedRecommendations(
        progress,
        skillLevels,
        learningStyle
      );

      // Önerileri önceliklendirme ve sıralama
      return this.prioritizeRecommendations(recommendations);

    } catch (error) {
      console.error('Önerileri getirme hatası:', error);
      throw new Error('Öneriler alınamadı');
    }
  }

  private analyzeSentiment(feedback: FeedbackData): 'positive' | 'neutral' | 'negative' {
    const sentimentScore = this.calculateSentimentScore(feedback);
    
    if (sentimentScore > 0.6) return 'positive';
    if (sentimentScore < 0.4) return 'negative';
    return 'neutral';
  }

  private calculateSentimentScore(feedback: FeedbackData): number {
    let score = 0;
    const weights = {
      rating: 0.4,
      comments: 0.3,
      learningContext: 0.3
    };

    // Puanlama değerlendirmesi
    score += (feedback.rating / 5) * weights.rating;

    // Yorum analizi
    if (feedback.comments) {
      const commentSentiment = this.analyzeCommentSentiment(feedback.comments);
      score += commentSentiment * weights.comments;
    }

    // Öğrenme bağlamı değerlendirmesi
    if (feedback.learningContext) {
      const contextScore = this.analyzeLearningContext(feedback.learningContext);
      score += contextScore * weights.learningContext;
    }

    return score;
  }

  private analyzeCommentSentiment(comment: string): number {
    // Basit duygu analizi
    const positiveWords = ['iyi', 'güzel', 'harika', 'mükemmel', 'faydalı', 'yararlı'];
    const negativeWords = ['kötü', 'zor', 'karışık', 'yetersiz', 'zayıf', 'anlamsız'];

    const words = comment.toLowerCase().split(' ');
    let score = 0.5; // Nötr başlangıç

    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.1;
      if (negativeWords.includes(word)) score -= 0.1;
    });

    return Math.max(0, Math.min(1, score));
  }

  private analyzeLearningContext(context: FeedbackData['learningContext']): number {
    if (!context) return 0.5;

    let score = 0.5;

    // Zorluk seviyesi değerlendirmesi
    if (context.difficulty === 'appropriate') score += 0.2;
    if (context.difficulty === 'too_difficult') score -= 0.2;

    // Anlama seviyesi değerlendirmesi
    score += (context.comprehension - 0.5) * 0.2;

    // Teknik sorunları değerlendir
    if (context.technicalIssues && context.technicalIssues.length > 0) {
      score -= 0.1 * Math.min(context.technicalIssues.length, 3);
    }

    return Math.max(0, Math.min(1, score));
  }

  private enrichFeedbackData(feedback: FeedbackData): FeedbackData {
    const enriched = { ...feedback };

    // Güçlü yönleri zenginleştir
    if (feedback.strengths) {
      enriched.strengths = feedback.strengths.map(strength => 
        this.expandStrength(strength)
      );
    }

    // İyileştirme alanlarını zenginleştir
    if (feedback.improvements) {
      enriched.improvements = feedback.improvements.map(improvement =>
        this.addImprovementSuggestions(improvement)
      );
    }

    // Etiketleri genişlet
    if (feedback.designAnalysis) {
      enriched.tags = [
        ...(feedback.tags || []),
        ...this.generateTags(feedback.designAnalysis)
      ];
    }

    return enriched;
  }

  private expandStrength(strength: string): string {
    const expansions: Record<string, string> = {
      'renk': 'Renk kullanımı ve uyumu',
      'kompozisyon': 'Kompozisyon ve görsel hiyerarşi',
      'teknik': 'Teknik uygulama ve hassasiyet',
      'yaratıcılık': 'Yaratıcı yaklaşım ve özgünlük'
    };

    const baseStrength = Object.keys(expansions).find(key => 
      strength.toLowerCase().includes(key)
    );

    return baseStrength ? expansions[baseStrength] : strength;
  }

  private addImprovementSuggestions(improvement: string): string {
    const suggestions: Record<string, string[]> = {
      'renk': [
        'Renk teorisi çalışmaları yapın',
        'Renk harmonisi egzersizleri deneyin',
        'Renk psikolojisi konusunu araştırın'
      ],
      'kompozisyon': [
        'Temel tasarım ilkelerini gözden geçirin',
        'Görsel hiyerarşi alıştırmaları yapın',
        'Denge ve orantı çalışmaları yapın'
      ],
      'teknik': [
        'Temel teknik egzersizler yapın',
        'Farklı araçları deneyimleyin',
        'Uygulama tekniklerini geliştirin'
      ]
    };

    const category = Object.keys(suggestions).find(key =>
      improvement.toLowerCase().includes(key)
    );

    if (category) {
      const randomSuggestion = suggestions[category][
        Math.floor(Math.random() * suggestions[category].length)
      ];
      return `${improvement} - Öneri: ${randomSuggestion}`;
    }

    return improvement;
  }

  private generateTags(analysis: DesignAnalysisResult): string[] {
    const tags: string[] = [];

    // Kompozisyon etiketleri
    if (analysis.composition.score > 0.7) tags.push('güçlü-kompozisyon');
    if (analysis.composition.score < 0.4) tags.push('kompozisyon-geliştirme');

    // Renk etiketleri
    if (analysis.color.score > 0.7) tags.push('etkili-renk-kullanımı');
    if (analysis.color.score < 0.4) tags.push('renk-geliştirme');

    // Teknik etiketler
    if (analysis.technique.score > 0.7) tags.push('teknik-ustalık');
    if (analysis.technique.score < 0.4) tags.push('teknik-geliştirme');

    return tags;
  }

  private async updateRecommendations(userId: string): Promise<void> {
    try {
      const recommendations = await this.getRecommendations(userId);

      await prisma.userRecommendations.upsert({
        where: { userId },
        update: {
          recommendations: recommendations as any,
          updatedAt: new Date()
        },
        create: {
          userId,
          recommendations: recommendations as any,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Önerileri güncelleme hatası:', error);
      throw new Error('Öneriler güncellenemedi');
    }
  }
}

export const feedbackService = new FeedbackService();