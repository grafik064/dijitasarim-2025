import { NextRequest, NextResponse } from 'next/server';
import { DesignAnalyzer } from '@/lib/ai/design-analyzer';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { saveAnalysisResult } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const config = JSON.parse(formData.get('config') as string);

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya yüklenemedi' },
        { status: 400 }
      );
    }

    // Görüntüyü işle
    const buffer = Buffer.from(await file.arrayBuffer());
    const image = await sharp(buffer)
      .resize(800, 800, { fit: 'inside' })
      .toFormat('png')
      .toBuffer();

    // Analiz et
    const analyzer = new DesignAnalyzer();
    const imageData = await createImageData(image);
    const analysis = await analyzer.analyzeDesign(imageData, config);

    // Sonuçları kaydet
    const savedAnalysis = await saveAnalysisResult({
      userId,
      imageUrl: `/uploads/${file.name}`,
      analysis,
      metadata: {
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        analyzedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      analysis: savedAnalysis
    });

  } catch (error) {
    console.error('Analiz hatası:', error);
    return NextResponse.json(
      { error: 'Analiz sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

async function createImageData(buffer: Buffer): Promise<ImageData> {
  const { width, height } = await sharp(buffer).metadata();
  const pixels = await sharp(buffer)
    .raw()
    .toBuffer();

  return {
    data: new Uint8ClampedArray(pixels),
    width: width!,
    height: height!
  };
}
