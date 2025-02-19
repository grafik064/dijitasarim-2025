import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ExternalLink, Book, Video, PlayCircle, FileText, PenTool } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Resource {
  type: 'video' | 'article' | 'exercise' | 'book';
  title: string;
  description: string;
  url?: string;
  duration: string;
  difficulty: 'Kolay' | 'Orta' | 'İleri';
  tags: string[];
}

interface ResourceCategory {
  title: string;
  description: string;
  resources: Resource[];
}

interface LearningResourcesProps {
  category: 'composition' | 'color' | 'technique';
  level: 'beginner' | 'intermediate' | 'advanced';
}

const resourceData: Record<
  LearningResourcesProps['category'],
  Record<LearningResourcesProps['level'], ResourceCategory[]>
> = {
  composition: {
    beginner: [
      {
        title: 'Temel Tasarım İlkeleri',
        description: 'Görsel kompozisyonun temel yapı taşları',
        resources: [
          {
            type: 'video',
            title: 'Görsel Hiyerarşi Temelleri',
            description: 'Tasarımda görsel hiyerarşiyi etkili kullanma yöntemleri',
            duration: '15 dakika',
            difficulty: 'Kolay',
            tags: ['temel', 'kompozisyon', 'hiyerarşi']
          },
          {
            type: 'exercise',
            title: 'Denge Alıştırmaları',
            description: 'Simetrik ve asimetrik denge üzerine pratik çalışmalar',
            duration: '30 dakika',
            difficulty: 'Kolay',
            tags: ['pratik', 'denge', 'kompozisyon']
          }
        ]
      }
    ],
    intermediate: [
      {
        title: 'İleri Kompozisyon Teknikleri',
        description: 'Karmaşık görsel düzenlemeler ve örüntüler',
        resources: [
          {
            type: 'video',
            title: 'Dinamik Kompozisyon',
            description: 'Hareket ve enerji yaratan kompozisyon teknikleri',
            duration: '25 dakika',
            difficulty: 'Orta',
            tags: ['ileri', 'dinamik', 'hareket']
          }
        ]
      }
    ],
    advanced: [
      {
        title: 'Usta Seviye Kompozisyon',
        description: 'Profesyonel tasarım teknikleri',
        resources: [
          {
            type: 'book',
            title: 'Kompozisyon Teorisi',
            description: 'Kapsamlı kompozisyon teorisi ve uygulamaları',
            duration: '400 sayfa',
            difficulty: 'İleri',
            tags: ['teori', 'profesyonel', 'kompozisyon']
          }
        ]
      }
    ]
  },
  color: {
    beginner: [
      {
        title: 'Renk Teorisi Temelleri',
        description: 'Renk kullanımının temel prensipleri',
        resources: [
          {
            type: 'video',
            title: 'Renk Çemberi',
            description: 'Renk çemberi ve temel renk ilişkileri',
            duration: '20 dakika',
            difficulty: 'Kolay',
            tags: ['temel', 'renk teorisi']
          }
        ]
      }
    ],
    intermediate: [
      {
        title: 'İleri Renk Kullanımı',
        description: 'Renk kombinasyonları ve psikolojisi',
        resources: [
          {
            type: 'article',
            title: 'Renk Psikolojisi',
            description: 'Renklerin insan psikolojisine etkileri',
            duration: '15 dakika okuma',
            difficulty: 'Orta',
            tags: ['psikoloji', 'renk', 'etki']
          }
        ]
      }
    ],
    advanced: [
      {
        title: 'Profesyonel Renk Yönetimi',
        description: 'Endüstriyel standartlar ve renk kalibrasyonu',
        resources: [
          {
            type: 'video',
            title: 'Renk Kalibrasyonu',
            description: 'Profesyonel renk yönetimi teknikleri',
            duration: '45 dakika',
            difficulty: 'İleri',
            tags: ['kalibrasyon', 'profesyonel', 'yönetim']
          }
        ]
      }
    ]
  },
  technique: {
    beginner: [
      {
        title: 'Temel İllüstrasyon Teknikleri',
        description: 'İllüstrasyona giriş ve temel teknikler',
        resources: [
          {
            type: 'exercise',
            title: 'Çizgi Çalışmaları',
            description: 'Temel çizgi ve form alıştırmaları',
            duration: '1 saat',
            difficulty: 'Kolay',
            tags: ['çizim', 'temel', 'pratik']
          }
        ]
      }
    ],
    intermediate: [
      {
        title: 'Dijital İllüstrasyon',
        description: 'Dijital ortamda illüstrasyon teknikleri',
        resources: [
          {
            type: 'video',
            title: 'Dijital Çizim Temelleri',
            description: 'Temel dijital çizim teknikleri ve araçları',
            duration: '35 dakika',
            difficulty: 'Orta',
            tags: ['dijital', 'çizim', 'araçlar']
          }
        ]
      }
    ],
    advanced: [
      {
        title: 'Profesyonel İllüstrasyon',
        description: 'İleri seviye illüstrasyon teknikleri',
        resources: [
          {
            type: 'book',
            title: 'İllüstrasyon Uzmanlığı',
            description: 'Profesyonel illüstrasyon teknikleri ve iş akışları',
            duration: '350 sayfa',
            difficulty: 'İleri',
            tags: ['profesyonel', 'illüstrasyon', 'teknik']
          }
        ]
      }
    ]
  }
};

export function LearningResources({ category, level }: LearningResourcesProps) {
  const resources = resourceData[category][level];

  return (
    <div className="space-y-6">
      <ScrollArea className="h-[600px] pr-4">
        {resources.map((section, index) => (
          <Card key={index} className="mb-6">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <p className="text-sm text-gray-500">{section.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {section.resources.map((resource, resourceIndex) => (
                  <ResourceCard key={resourceIndex} resource={resource} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  const icons = {
    video: Video,
    article: FileText,
    exercise: PenTool,
    book: Book
  };
  
  const Icon = icons[resource.type];
  
  const difficultyColors = {
    'Kolay': 'bg-green-100 text-green-800',
    'Orta': 'bg-yellow-100 text-yellow-800',
    'İleri': 'bg-red-100 text-red-800'
  };

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between">
            <h4 className="font-medium">{resource.title}</h4>
            <Badge variant="outline">{resource.duration}</Badge>
          </div>
          <p className="text-sm text-gray-500">{resource.description}</p>
          <div className="flex items-center space-x-2 pt-2">
            <Badge className={difficultyColors[resource.difficulty]}>
              {resource.difficulty}
            </Badge>
            {resource.tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>
      {resource.url && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 w-full"
          onClick={() => window.open(resource.url, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Kaynağa Git
        </Button>
      )}
    </div>
  );
}

export default LearningResources;