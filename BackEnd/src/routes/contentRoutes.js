import express from 'express';
import {
  getContents,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  uploadContent
} from '../controllers/contentController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Upload file (harus sebelum /:id agar tidak terambil sebagai ID)
router.post('/upload', upload.single('file'), uploadContent);

router.get('/', getContents);
router.get('/:id', getContentById);
router.post('/', createContent);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);

export default router;
