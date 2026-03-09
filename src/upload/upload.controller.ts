// src/upload/upload.controller.ts
import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

interface UploadResponse {
  url: string;
}

@ApiTags('Upload')
@Controller('api/v1/admin/upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить файл (admin)', description: 'Загружает изображение. Допустимые форматы: JPG, JPEG, PNG, WebP. Макс. размер: 5MB.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл изображения (JPG/PNG/WebP, макс. 5MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, description: 'Файл загружен', schema: { properties: { url: { type: 'string', example: '/uploads/uuid.jpg' } } } })
  @ApiResponse({ status: 400, description: 'Файл не предоставлен или недопустимый тип/размер' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  uploadFile(@UploadedFile() file: Express.Multer.File | undefined): UploadResponse {
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    const url = `/uploads/${file.filename}`;
    this.logger.log(`File uploaded: ${file.filename} (${file.size} bytes)`);

    return { url };
  }
}
