import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CircularGauge,
  BarChart,
  RadarChart,
  ColorPalette
} from '@/components/visualizations';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Lightbulb,
  Target,
  TrendingUp,
  Zap,
  Palette,
  Brush,
  Eye
} from 'lucide-react';
import { DesignAnalysisResult } from '@/lib/analysis/content-analyzer';

interface AnalysisVisualizationProps {
  analysis: DesignAnalysisResult;
  showDetails?: boolean;
  onSectionClick?: (section: keyof DesignAnalysisResult) => void;
}

export function AnalysisVisualization({
  analysis,
  showDetails = true,
  onSectionClick
}: AnalysisVisualizationProps) {
  return (
    <div className="space-y-6">
      {/* Genel Değerlendirme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Genel Değerlendirme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-6">
              <p className="text-gray-600 mb-4">{analysis.overall.summary}</p>
              <div className="space-y-2">
                {analysis.overall.improvements.map((improvement, index) => (
                  <Alert key={index}>
                    <Lightbulb className="w-4 h-4" />
                    <AlertDescription>{improvement}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0">
              <CircularGauge
                value={analysis.overall.score}
                size="large"
                label="Toplam Skor"
                colorScale={[
                  { value: 0.3, color: '#ef4444' },
                  { value: 0.7, color: '#f59e0b' },
                  { value: 1, color: '#22c55e' }
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detaylı Analiz Bölümleri */}
      {showDetails && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Kompozisyon Analizi */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Kompozisyon Analizi
                </CardTitle>
                <Badge variant="outline">
                  Skor: {Math.round(analysis.composition.score * 100)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <RadarChart
                  data={[
                    { label: 'Denge', value: analysis.composition.score },
                    { label: 'Harmoni', value: analysis.color.score },
                    { label: 'Ritim', value: analysis.composition.score * 0.8 },
                    { label: 'Vurgu', value: analysis.composition.score * 0.9 },
                    { label: 'Bütünlük', value: analysis.composition.score * 0.85 }
                  ]}
                  size={300}
                />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Bulgular</h4>
                  {analysis.composition.findings.map((finding, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Info className="w-4 h-4 mt-1 text-blue-500" />
                      <p className="text-sm text-gray-600">{finding}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Öneriler</h4>
                  {analysis.composition.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 mt-1 text-yellow-500" />
                      <p className="text-sm text-gray-600">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Renk Analizi */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Renk Analizi
                </CardTitle>
                <Badge variant="outline">
                  Skor: {Math.round(analysis.color.score * 100)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <BarChart
                  data={[
                    { label: 'Harmoni', value: analysis.color.score },
                    { label: 'Kontrast', value: analysis.color.score * 0.9 },
                    { label: 'Denge', value: analysis.color.score * 0.85 }
                  ]}
                  height={150}
                />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Bulgular</h4>
                  {analysis.color.findings.map((finding, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Info className="w-4 h-4 mt-1 text-blue-500" />
                      <p className="text-sm text-gray-600">{finding}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Öneriler</h4>
                  {analysis.color.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 mt-1 text-yellow-500" />
                      <p className="text-sm text-gray-600">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teknik Analiz */}
          <Card className="md:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Brush className="w-5 h-5 mr-2" />
                  Teknik Analiz
                </CardTitle>
                <Badge variant="outline">
                  Skor: {Math.round(analysis.technique.score * 100)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <BarChart
                    data={[
                      { label: 'Hassasiyet', value: analysis.technique.score },
                      { label: 'Tutarlılık', value: analysis.technique.score * 0.95 },
                      { label: 'Detay', value: analysis.technique.score * 0.85 },
                      { label: 'Netlik', value: analysis.technique.score * 0.9 }
                    ]}
                    height={200}
                  />
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Teknik Detaylar</h4>
                    {analysis.technique.findings.map((finding, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Eye className="w-4 h-4 mt-1 text-purple-500" />
                        <p className="text-sm text-gray-600">{finding}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">İyileştirme Önerileri</h4>
                  <div className="space-y-2">
                    {analysis.technique.suggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Lightbulb className="w-4 h-4" />
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export interface AnalysisMetric {
  label: string;
  value: number;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface AnalysisSection {
  title: string;
  metrics: AnalysisMetric[];
  findings: string[];
  suggestions: string[];
}

export function MetricsDisplay({ metrics }: { metrics: AnalysisMetric[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500 mb-1">{metric.label}</div>
            <div className="text-2xl font-bold">
              {typeof metric.value === 'number' 
                ? `${Math.round(metric.value * 100)}%`
                : metric.value}
            </div>
            {metric.description && (
              <div className="text-xs text-gray-400 mt-1">{metric.description}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SectionAnalysis({ section }: { section: AnalysisSection }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <MetricsDisplay metrics={section.metrics} />
          
          <div className="space-y-4">
            <h4 className="font-medium">Bulgular</h4>
            <div className="space-y-2">
              {section.findings.map((finding, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Info className="w-4 h-4 mt-1 text-blue-500" />
                  <p className="text-sm text-gray-600">{finding}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Öneriler</h4>
            <div className="space-y-2">
              {section.suggestions.map((suggestion, index) => (
                <Alert key={index}>
                  <Lightbulb className="w-4 h-4" />
                  <AlertDescription>{suggestion}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { AnalysisVisualization };