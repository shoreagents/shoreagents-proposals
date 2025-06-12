import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const resolvedParams = await params;
    const filename = resolvedParams.filename;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    if (!existsSync(filepath)) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }

    // Security check: ensure file is in uploads directory
    if (!filepath.includes(path.join(process.cwd(), 'public', 'uploads'))) {
      return NextResponse.json(
        { message: 'Invalid file path' },
        { status: 403 }
      );
    }

    const fileContent = await readFile(filepath);
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/typescript',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { message: 'Download failed' },
      { status: 500 }
    );
  }
} 