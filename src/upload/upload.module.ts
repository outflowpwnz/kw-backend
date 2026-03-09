// src/upload/upload.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadController } from './upload.controller';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();
          const filename = `${uuidv4()}${extension}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
      },
      fileFilter: (_req, file, callback) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new Error(`Недопустимый тип файла. Разрешены: ${ALLOWED_MIME_TYPES.join(', ')}`),
            false,
          );
        }
      },
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}
