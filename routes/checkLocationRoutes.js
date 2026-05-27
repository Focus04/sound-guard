import { Router } from 'express';

import Alert from '../models/Alert.js';

const router = Router();

router.post('/', async (req, res) => {
  const { deviceId, location } = req.body;
  const hoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const nearbyAlerts = await Alert.find({
    timestamp: { $gte: hoursAgo },
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

  const isDangerous = nearbyAlerts.length > 0;

  let totalReports = 0;
  nearbyAlerts.forEach(alert => {
    totalReports += alert.reportCount;
  });

  // res.status(200).json({
  //   isDangerous: isDangerous,
  //   nearbyAlertsCount: nearbyAlerts.length,
  // });
  res.send('Hello world!')
});

export default router;