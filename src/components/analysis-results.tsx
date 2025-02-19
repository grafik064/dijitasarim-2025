import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DesignAnalysis } from '@/types/analysis';

interface AnalysisResultsProps {
  analysis: DesignAnalysis;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tasarım Analiz Sonuçları</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="composition">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="composition">Kompozisyon</TabsTrigger>
            <TabsTrigger value="color">Renk</TabsTrigger>
            <TabsTrigger value="technique">Teknik</TabsTrigger>
          </TabsList>

          <TabsContent value="composition">
            <CompositionAnalysisPanel composition={analysis.composition} />
          </TabsContent>

          <TabsContent value="color">
            <ColorAnalysisPanel colors={analysis.colors} />
          </TabsContent>

          <TabsContent value="technique">
            <TechniqueAnalysisPanel techniques={analysis.techniques} />
          </TabsContent>
        </Tabs>

        <RecommendationsPanel recommendations={analysis.recommendations} />
      </CardContent>
    </Card>
  );
}

function CompositionAnalysisPanel({ composition }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-4">Temel Tasarım İlkeleri</h3>
        <div className="grid gap-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Denge</span>
              <span>{Math.round(composition.balance.score * 100)}%</span>
            </div>
            <Progress value={composition.balance.score * 100} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span>Ritim</span>
              <span>{Math.round(composition.rhythm.score * 100)}%</span>
            </div>
            <Progress value={composition.rhythm.score * 100} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span>Bütünlük</span>
              <span>{Math.round(composition.unity.coherenceScore * 100)}%</span>
            </div>
            <Progress value={composition.unity.coherenceScore * 100} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Görsel Hiyerarşi</h3>
        <div className="space-y-4">
          {composition.hierarchy.dominantElements.map((element, index) => (
            <div key={index} className="flex justify-between items-center">
              <span>{element.type}</span>
              <span>Önem: {Math.round(element.importance * 100)}%</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ColorAnalysisPanel({ colors }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-4">Renk Uyumu</h3>
        <div className="grid gap-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Uyum Skoru</span>
              <span>{Math.round(colors.harmony.score * 100)}%</span>
            </div>
            <Progress value={colors.harmony.score * 100} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span>Kontrast</span>
              <span>{Math.round(colors.contrast.score * 100)}%</span>
            </div>
            <Progress value={colors.contrast.score * 100} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Renk Paleti</h3>
        <div className="grid grid-cols-3 gap-4">
          {colors.palette.primary.map((color, index) => (
            <div
              key={index}
              className="h-12 rounded-md"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function TechniqueAnalysisPanel({ techniques }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-4">Tespit Edilen Teknikler</h3>
        <div className="space-y-4">
          {techniques.detectedTechniques.map((technique, index) => (
            <div key={index}>
              <div className="flex justify-between mb-2">
                <span>{technique.name}</span>
                <span>Güven: {Math.round(technique.confidence * 100)}%</span>
              </div>
              <Progress value={technique.confidence * 100} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Teknik Kalite</h3>
        <div className="grid gap-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Hassasiyet</span>
              <span>{Math.round(techniques.qualityMetrics.precision * 100)}%</span>
            </div>
            <Progress value={techniques.qualityMetrics.precision * 100} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span>Tutarlılık</span>
              <span>{Math.round(techniques.qualityMetrics.consistency * 100)}%</span>
            </div>
            <Progress value={techniques.qualityMetrics.consistency * 100} />
          </div>
        </div>
      </section>
    </div>
  );
}

function RecommendationsPanel({ recommendations }) {
  return (
    <section className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Öneriler ve İyileştirmeler</h3>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{rec.principle}</span>
                {rec.priority && (
                  <span className={`px-2 py-1 rounded text-sm ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rec.priority === 'high' ? 'Yüksek' :
                     rec.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-2">{rec.issue}</p>
              <p className="text-sm text-gray-800">{rec.suggestion}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}