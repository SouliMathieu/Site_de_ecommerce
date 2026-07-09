import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const MAX_WIDTH = 1600;

@Injectable()
export class MediaService {
  async saveImage(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu.');
    }

    let processed: Buffer;
    try {
      processed = await sharp(file.buffer)
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    } catch {
      throw new BadRequestException("Le fichier envoyé n'est pas une image valide.");
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${randomUUID()}.webp`;
    await writeFile(join(UPLOAD_DIR, filename), processed);

    return { url: `/uploads/${filename}` };
  }
}
