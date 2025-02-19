import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { analyzeDesign } from '@/lib/analysis'

export function DesignAnalysis() {
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setLoading(true)

    try {
      const results = await analyzeDesign(selectedFile)
      setAnalysis(results)
    } catch (error) {
      console.error('Analiz sırasında hata:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>DijiTasarım - Grafik Tasarım Analiz Sistemi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className={cn(
            'border-2 border-dashed border-gray-200 rounded-lg p-12',
            'hover:border-primary cursor-pointer transition-colors',
            'flex flex-col items-center justify-center text-center'
          )}>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              id="design-upload"
            />
            <label htmlFor="design-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium">Tasarımınızı Yükleyin</h3>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG veya GIF formatında dosyaları sürükleyip bırakın veya seçin
              </p>
            </label>
          </div>

          {loading && (
            <div className="text-center">
              <p>Tasarımınız analiz ediliyor...</p>
            </div>
          )}

          {analysis && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Analiz Sonuçları</h2>
              {/* Analiz sonuçlarının detaylı gösterimi */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}