import express from 'express';
import {
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addPlaylistItem,
  removePlaylistItem,
  pushPlaylistToDevice
} from '../controllers/playlistController.js';

const router = express.Router();

router.get('/', getPlaylists);
router.get('/:id', getPlaylistById);
router.post('/', createPlaylist);
router.put('/:id', updatePlaylist);
router.delete('/:id', deletePlaylist);
router.post('/:id/items', addPlaylistItem);
router.post('/:id/push', pushPlaylistToDevice);    // ← Push playlist ke device
router.delete('/items/:itemId', removePlaylistItem);

export default router;
