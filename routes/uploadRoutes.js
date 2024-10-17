import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

// const uploadSingleImage = upload.single('image');
const uploadMultipleImages = upload.array('images', 5); // Allow up to 5 images

router.post('/', (req, res) => {
   uploadMultipleImages(req, res, async function (err) {
      if (err) {
         return res.status(400).send({ message: err.message });
      }

      const files = req.files;
      if (!files || files.length === 0) {
         return res.status(400).send({ message: 'No files uploaded' });
      }

      try {
         // Store uploaded image URLs
         const uploadedImages = [];

         for (const file of files) {
            // Generate a unique file key
            const fileKey = `${crypto.randomUUID()}-${Date.now()}.${mime.extension(file.mimetype)}`;

            // S3 upload parameters
            const params = {
               Bucket: process.env.LIARA_BUCKET_NAME,
               Key: fileKey,
               Body: file.buffer,
               ContentType: file.mimetype,
            };

            // Upload each file to S3
            await s3.send(new PutObjectCommand(params));

            // Add the uploaded image URL to the list
            uploadedImages.push({
               url: `${process.env.LIARA_ENDPOINT}/${process.env.LIARA_BUCKET_NAME}/${fileKey}`,
               altText: file.originalname, // Optional: Use the original file name as alt text
            });
         }

         // Send success response with all uploaded image URLs
         res.status(200).send({
            message: 'Images uploaded successfully',
            images: uploadedImages,  // Array of image URLs
         });
      } catch (error) {
         console.error('Error uploading to S3:', error);
         res.status(500).send({ message: 'File upload failed', error });
      }
   });
});

// Route to get all images from the bucket
router.get('/', async (req, res) => {
   const params = {
      Bucket: process.env.LIARA_BUCKET_NAME,
   };

   try {
      const data = await s3.send(new ListObjectsV2Command(params));
      const files = data.Contents.map(file => ({
         key: file.Key,
         url: `${process.env.LIARA_ENDPOINT}/${process.env.LIARA_BUCKET_NAME}/${file.Key}`
      }));

      res.status(200).json(files);
   } catch (error) {
      res.status(500).json({ message: 'Failed to fetch media files', error });
   }
});

// Route to delete an image from the bucket
router.delete('/:key', async (req, res) => {
   const params = {
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: req.params.key, // Image key from URL
   };

   try {
      await s3.send(new DeleteObjectCommand(params));
      res.status(200).json({ message: 'Image deleted successfully' });
   } catch (error) {
      res.status(500).json({ message: 'Failed to delete image', error });
   }
});

export default router;
