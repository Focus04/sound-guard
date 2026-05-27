import { Router } from 'express';

import Alert from '../models/Alert.js';

const router = Router();

router.post('/', async (req, res) => {
  const { alertType, severity, location, timestamp } = req.body;

  if (!location || !location.lat || !location.lng) {
    return res.status(400).json({ error: 'Coordinates are required' });
  }

  const alertTime = timestamp ? new Date(timestamp) : new Date();
  const timeWindow = new Date(alertTime.getTime() - 15 * 60000);

  const existingAlert = await Alert.findOne({
    alertType: alertType,
    timestamp: { $gte: timeWindow },
    location: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [location.lng, location.lat]
        },
        $maxDistance: 200
      }
    }
  });

  if (existingAlert) {
    existingAlert.reportCount += 1;

    await existingAlert.save();
    return res.status(200).json({
      message: 'Alert grouped with an existing nearby event.',
      alert: existingAlert
    });
  }

  const newAlert = new Alert({
    reportCount: 1,
    alertType,
    severity,
    location: {
      type: 'Point',
      coordinates: [location.lng, location.lat]
    },
    timestamp: alertTime
  });

  await newAlert.save();
  res.status(201).json({
    message: 'New localized alert registered successfully!',
    alert: newAlert
  });
});

export default router;