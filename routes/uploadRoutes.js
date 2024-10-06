import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import crypto from 'crypto';  // For generating unique filenames
import mime from 'mime-types'; // To handle file mime types

dotenv.config();
const router = express.Router();

// Initialize S3 client
const s3 = new S3Client({
   region: 'default',
   endpoint: process.env.LIARA_ENDPOINT,
   credentials: {
      accessKeyId: process.env.LIARA_ACCESS_KEY,
      secretAccessKey: process.env.LIARA_SECRET_KEY,
   },
});

// Configure multer to handle file uploads
const storage = multer.memoryStorage(); // Store file in memory for upload
const upload = multer({
   storage,
   fileFilter(req, file, cb) {
      const filetypes = /jpe?g|png|webp/;
      const mimetypes = /image\/jpe?g|image\/png|image\/webp/;
      const extname = filetypes.test(mime.extension(file.mimetype).toLowerCase());
      const mimetype = mimetypes.test(file.mimetype);

      if (extname && mimetype) {
         cb(null, true);
      } else {
         cb(new Error('Images only!'), false);
      }
   },
});

const uploadSingleImage = upload.single('image');

router.post('/', (req, res) => {
   uploadSingleImage(req, res, async function (err) {
      if (err) {
         return res.status(400).send({ message: err.message });
      }

      const file = req.file;
      if (!file) {
         return res.status(400).send({ message: 'No file uploaded' });
      }

      // Generate a unique file key
      const fileKey = `${crypto.randomUUID()}-${Date.now()}.${mime.extension(file.mimetype)}`;

      // S3 upload parameters
      const params = {
         Bucket: process.env.LIARA_BUCKET_NAME,
         Key: fileKey,  // Unique file key for S3
         Body: file.buffer,  // File buffer from multer
         ContentType: file.mimetype,
      };

      try {
         // Upload the file to S3
         await s3.send(new PutObjectCommand(params));

         // Send success response with S3 file URL
         res.status(200).send({
            message: 'Image uploaded successfully',
            imageUrl: `${process.env.LIARA_ENDPOINT}/${process.env.LIARA_BUCKET_NAME}/${fileKey}`,
         });
      } catch (error) {
         console.error('Error uploading to S3:', error);
         res.status(500).send({ message: 'File upload failed', error });
      }
   });
});

export default router;
