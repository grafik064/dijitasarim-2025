import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  PieChart, 
  CircularGauge, 
  ColorPalette 
} from '@/components/visualizations';
import { 
  Upload, 
  AlertCircle, 
  Check, 
  RefreshCw,
  Download,
  Share2,
  Book,
  Lightbulb
} from 'lucide-react';
import { DesignAnalysis } from '@/types/analysis';
import { LearningResources } from '@/components/learning-resources';

interface AnalysisDashboardProps {
  analysis: DesignAnalysis | null;
  onAnalyze: (file: File) => Promise<void>;
  isAnalyzing: boolean;
}

export function AnalysisDashboard({ 
  analysis, 
  onAnalyze,
  isAnalyzing 
}: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState('composition');
  const [showResources, setShowResources] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await onAnalyze(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">DijiTasarım Analiz Paneli</h1>
        <p className="text-gray-600">
          Yapay zeka destekli grafik tasarım analiz ve değerlendirme sistemi
        </p>
      </header>

      {!analysis ? (
        <UploadSection onUpload={handleFileUpload} isAnalyzing={isAnalyzing} />
      ) : (
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-8 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="composition">Kompozisyon</TabsTrigger>
                <TabsTrigger value="color">Renk</TabsTrigger>
                <TabsTrigger value="technique">Teknik</TabsTrigger>
              </TabsList>

              <TabsContent value="composition" className="space-y-4">
                <CompositionAnalysis data={analysis.composition} />
              </TabsContent>

              <TabsContent value="color" className="space-y-4">
                <ColorAnalysis data={analysis.color} />
              </TabsContent>

              <TabsContent value="technique" className="space-y-4">
                <TechniqueAnalysis data={analysis.technique} />
              </TabsContent>
            </Tabs>

            <ActionsPanel 
              onDownload={() => console.log('Download')}
              onShare={() => console.log('Share')}
              onNewAnalysis={() => window.location.reload()}
            />
          </div>

          <div className="md:col-span-4 space-y-6">
            <OverallScore score={calculateOverallScore(analysis)} />
            <RecommendationsPanel recommendations={analysis.recommendations} />
            <LearningResourcesPanel 
              category={activeTab as 'composition' | 'color' | 'technique'}
              level={determineLearningLevel(analysis)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function UploadSection({ onUpload, isAnalyzing }: { 
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isAnalyzing: boolean;
}) {
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="relative">
            <input
              type="file"
              className="hidden"
              id="design-upload"
              onChange={onUpload}
              accept="image/*"
              disabled={isAnalyzing}
            />
            <label
              htmlFor="design-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-12 h-12 text-gray-400 animate-spin" />
                  <p className="mt-4 text-sm text-gray-500">Analiz ediliyor...</p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400" />
                  <p className="mt-4 text-sm text-gray-500">
                    Tasarımınızı yüklemek için tıklayın veya sürükleyin
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    PNG, JPG veya GIF (max. 20MB)
                  </p>
                </>
              )}
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompositionAnalysis({ data }: { data: any }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Kompozisyon Değerlendirmesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Denge</span>
              <Progress value={data.balance * 100} className="w-2/3" />
            </div>
            <div className="flex justify-between items-center">
              <span>Ritim</span>
              <Progress value={data.rhythm * 100} className="w-2/3" />
            </div>
            <div className="flex justify-between items-center">
              <span>Vurgu</span>
              <Progress value={data.emphasis * 100} className="w-2/3" />
            </div>
            <div className="flex justify-between items-center">
              <span>Bütünlük</span>
              <Progress value={data.unity * 100} className="w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Görsel Hiyerarşi</CardTitle>
        </CardHeader>
        <CardContent>
          <CircularGauge 
            value={data.hierarchy.score}
            label="Hiyerarşi Skoru"
            description="Görsel öğelerin önem sıralaması ve düzeni"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ColorAnalysis({ data }: { data: any }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Renk Uyumu</CardTitle>
        </CardHeader>
        <CardContent>
          <ColorPalette 
            colors={data.palette}
            harmony={data.harmony}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Renk Metrikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Kontrast</span>
              <Progress value={data.contrast * 100} className="w-2/3" />
            </div>
            <div className="flex justify-between items-center">
              <span>Doygunluk</span>
              <Progress value={data.saturation * 100} className="w-2/3" />
            </div>
            <div className="flex justify-between items-center">
              <span>Sıcaklık</span>
              <Progress value={data.temperature * 100} className="w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TechniqueAnalysis({ data }: { data: any }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Teknik Değerlendirme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Hassasiyet</span>
              <Progress value={data.precision * 100} className="w-2/3" />
            </div>
            <div className="flex justify-between items-center">
              <span>Tutarlılık</span>
              <Progress value={data.consistency * 100} className="w-2/3" />
            </div>
            <div className="flex justify-between items-center">
              <span>Detay</span>
              <Progress value={data.detail * 100} className="w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teknik Özellikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.detectedTechniques.map((technique: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span>{technique.name}</span>
                <span className="text-sm text-gray-500">
                  {(technique.confidence * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActionsPanel({ 
  onDownload,
  onShare,
  onNewAnalysis 
}: {
  onDownload: () => void;
  onShare: () => void;
  onNewAnalysis: () => void;
}) {
  return (
    <div className="flex gap-4 justify-end">
      <Button variant="outline" onClick={onDownload}>
        <Download className="w-4 h-4 mr-2" />
        Raporu İndir
      </Button>
      <Button variant="outline" onClick={onShare}>
        <Share2 className="w-4 h-4 mr-2" />
        Paylaş
      </Button>
      <Button onClick={onNewAnalysis}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Yeni Analiz
      </Button>
    </div>
  );
}

function OverallScore({ score }: { score: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Genel Değerlendirme</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <CircularGauge
          value={score}
          label="Toplam Skor"
          size="large"
          colorScale={[
            { value: 0.3, color: '#ef4444' },
            { value: 0.7, color: '#f59e0b' },
            { value: 1, color: '#22c55e' }
          ]}
        />
      </CardContent>
    </Card>
  );
}

function RecommendationsPanel({ recommendations }: { recommendations: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>İyileştirme Önerileri</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <Alert key={index} variant={rec.priority === 'high' ? 'destructive' : 'default'}>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <p className="font-medium">{rec.title}</p>
                <p className="text-sm text-gray-500">{rec.description}</p>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LearningResourcesPanel({ 
  category,
  level 
}: { 
  category: 'composition' | 'color' | 'technique';
  level: 'beginner' | 'intermediate' | 'advanced';
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book className="w-5 h-5 mr-2" />
          Öğrenme Kaynakları
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LearningResources category={category} level={level} />
      </CardContent>
    </Card>
  );
}

function calculateOverallScore(analysis: DesignAnalysis): number {
  const weights = {
    composition: 0.4,
    color: 0.3,
    technique: 0.3
  };

  const compositionScore = (
    analysis.composition.balance +
    analysis.composition.rhythm +
    analysis.composition.unity +
    analysis.composition.emphasis
  ) / 4;

  const colorScore = (
    analysis.color.harmony +
    analysis.color.contrast +
    analysis.color.temperature
  ) / 3;

  const techniqueScore = (
    analysis.technique.precision +
    analysis.technique.consistency +
    analysis.technique.complexity
  ) / 3;

  return (
    compositionScore * weights.composition +
    colorScore * weights.color +
    techniqueScore * weights.technique
  );
}

function determineLearningLevel(analysis: DesignAnalysis): 'beginner' | 'intermediate' | 'advanced' {
  const score = calculateOverallScore(analysis);
  
  if (score < 0.4) return 'beginner';
  if (score < 0.7) return 'intermediate';
  return 'advanced';
}

export default AnalysisDashboard;