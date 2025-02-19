import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Code,
  Palette,
  Layout,
  Wand2,
  FileVideo,
  ExternalLink
} from 'lucide-react';

interface AIFeedback {
  category: 'composition' | 'color' | 'technique';
  title: string;
  description: string;
  score: number;
  priority: 'high' | 'medium' | 'low';
  suggestions: string[];
  details?: {
    strengths: string[];
    improvements: string[];
    technicalNotes?: string[];
  };
  resources?: {
    title: string;
    type: 'video' | 'article' | 'exercise';
    description?: string;
    duration?: string;
    url?: string;
  }[];
}

interface AIFeedbackProps {
  feedback: AIFeedback[];
  onResourceClick?: (resource: AIFeedback['resources'][0]) => void;
  showDetails?: boolean;
}

export function AIFeedback({ 
  feedback, 
  onResourceClick,
  showDetails = true 
}: AIFeedbackProps) {
  const sortedFeedback = [...feedback].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Yapay Zeka Değerlendirmesi</h2>
        <Badge variant="secondary" className="text-xs">
          AI Powered
        </Badge>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        {sortedFeedback.map((item, index) => (
          <FeedbackCard
            key={index}
            feedback={item}
            onResourceClick={onResourceClick}
            showDetails={showDetails}
          />
        ))}
      </ScrollArea>
    </div>
  );
}

function FeedbackCard({
  feedback,
  onResourceClick,
  showDetails
}: {
  feedback: AIFeedback;
  onResourceClick?: AIFeedbackProps['onResourceClick'];
  showDetails: boolean;
}) {
  const categoryIcons = {
    composition: Layout,
    color: Palette,
    technique: Wand2
  };

  const Icon = categoryIcons[feedback.category];
  
  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <Card className={`mb-4 border-l-4 ${priorityColors[feedback.priority]}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${
              feedback.priority === 'high' ? 'bg-red-100' :
              feedback.priority === 'medium' ? 'bg-yellow-100' :
              'bg-green-100'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{feedback.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{feedback.category}</Badge>
                <Badge variant="outline">
                  Skor: {Math.round(feedback.score * 100)}%
                </Badge>
              </div>
            </div>
          </div>
          <Badge className={priorityColors[feedback.priority]}>
            {feedback.priority === 'high' ? 'Yüksek Öncelik' :
             feedback.priority === 'medium' ? 'Orta Öncelik' :
             'Düşük Öncelik'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">{feedback.description}</p>
          
          <div className="space-y-2">
            <h4 className="font-medium flex items-center">
              <Lightbulb className="w-4 h-4 mr-2" />
              Öneriler
            </h4>
            <div className="pl-6 space-y-2">
              {feedback.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>

          {showDetails && feedback.details && (
            <div className="space-y-4 mt-4">
              {feedback.details.strengths.length > 0 && (
                <Alert variant="default">
                  <AlertTitle className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Güçlü Yönler
                  </AlertTitle>
                  <AlertDescription>
                    <div className="pl-6 mt-2 space-y-1">
                      {feedback.details.strengths.map((strength, index) => (
                        <p key={index} className="text-sm">{strength}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {feedback.details.improvements.length > 0 && (
                <Alert variant="destructive">
                  <AlertTitle className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Geliştirme Alanları
                  </AlertTitle>
                  <AlertDescription>
                    <div className="pl-6 mt-2 space-y-1">
                      {feedback.details.improvements.map((improvement, index) => (
                        <p key={index} className="text-sm">{improvement}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {feedback.details.technicalNotes && (
                <Alert>
                  <AlertTitle className="flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    Teknik Notlar
                  </AlertTitle>
                  <AlertDescription>
                    <div className="pl-6 mt-2 space-y-1">
                      {feedback.details.technicalNotes.map((note, index) => (
                        <p key={index} className="text-sm font-mono">{note}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {feedback.resources && feedback.resources.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium flex items-center mb-2">
                <BookOpen className="w-4 h-4 mr-2" />
                Önerilen Kaynaklar
              </h4>
              <div className="grid gap-2">
                {feedback.resources.map((resource, index) => (
                  <button
                    key={index}
                    className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                    onClick={() => onResourceClick?.(resource)}
                  >
                    {resource.type === 'video' ? (
                      <FileVideo className="w-4 h-4 mr-2 text-blue-500" />
                    ) : resource.type === 'article' ? (
                      <BookOpen className="w-4 h-4 mr-2 text-green-500" />
                    ) : (
                      <Code className="w-4 h-4 mr-2 text-purple-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{resource.title}</p>
                      {resource.description && (
                        <p className="text-xs text-gray-500">{resource.description}</p>
                      )}
                    </div>
                    {resource.duration && (
                      <Badge variant="outline" className="ml-2">
                        {resource.duration}
                      </Badge>
                    )}
                    {resource.url && (
                      <ExternalLink className="w-4 h-4 ml-2 text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AIFeedback;