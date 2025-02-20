import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';
import { analyzeDesign } from '@/lib/design-analyzer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Lütfen bir tasarım dosyası yükleyin.' },
        { status: 400 }
      );
    }

    // Dosya formatını kontrol et
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Sadece JPG, PNG ve GIF formatları desteklenir.' },
        { status: 400 }
      );
    }

    // Dosya boyutunu kontrol et (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu 10MB\'dan küçük olmalıdır.' },
        { status: 400 }
      );
    }

    // Dosyayı geçici olarak kaydet
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'uploads');
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Tasarım analizini gerçekleştir
    const analysis = await analyzeDesign(filePath);

    // Analiz sonuçlarını döndür
    return NextResponse.json({
      success: true,
      fileName,
      analysis,
      preview: `/uploads/${fileName}`
    });

  } catch (error) {
    console.error('Analiz hatası:', error);
    return NextResponse.json(
      { error: 'Tasarım analizi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}