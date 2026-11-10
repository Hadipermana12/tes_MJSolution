import express from 'express';
import {
  getDevices,
  getDeviceById,
  getCurrentContent,
  createDevice,
  updateDevice,
  deleteDevice,
  pushContentToDevice,
  heartbeatDevice
} from '../controllers/deviceController.js';

const router = express.Router();

router.get('/', getDevices);
router.get('/:id', getDeviceById);
router.get('/:id/current-content', getCurrentContent);
router.post('/', createDevice);
router.put('/:id', updateDevice);
router.delete('/:id', deleteDevice);
router.post('/:id/push', pushContentToDevice);
router.post('/:id/heartbeat', heartbeatDevice);

export default router;
