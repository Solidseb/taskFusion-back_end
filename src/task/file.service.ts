import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

@Injectable()
export class FileService {
  // Configuration for storing files
  storage = diskStorage({
    destination: './uploads', // Define upload directory
    filename: (req, file, cb) => {
      // Generate unique file name
      const filename = `${uuid()}${extname(file.originalname)}`;
      cb(null, filename);
    },
  });

  // Multer upload options
  uploadOptions = {
    storage: this.storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Set file size limit (5MB)
  };
}
