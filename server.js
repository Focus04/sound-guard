import express from 'express';
import mongoose from 'mongoose';
import { engine } from 'express-handlebars';
import cors from 'cors';
import Alert from './models/Alert.js';
import { config } from 'dotenv'

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.engine('handlebars', engine({
  helpers: {
    json: function (context) {
      return JSON.stringify(context);
    },
    eq: function (v1, v2) {
      return v1 === v2;
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

config({ quiet: true });
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB.'))
  .catch(err => console.error('MongoDB connection error:', err));

app.post('/api/alerts', async (req, res) => {
  try {
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

  } catch (error) {
    console.error('Error saving alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/check-location', async (req, res) => {
  try {
    const { deviceId, location } = req.body;

    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ error: 'Coordinates are required' });
    }
    const hoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const nearbyAlerts = await Alert.find({
      timestamp: { $gte: hoursAgo },
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [location.lng, location.lat] // [Lng, Lat]
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

    res.status(200).json({
      isDangerous: isDangerous,
      nearbyAlertsCount: nearbyAlerts.length,
    });

  } catch (error) {
    console.error('Error checking location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 }).limit(20).lean();

    const formattedAlerts = alerts.map(alert => {
      let cleanType = alert.alertType.replace(/_/g, ' ').toLowerCase();
      cleanType = cleanType.replace(/\b\w/g, char => char.toUpperCase());

      return {
        ...alert,
        displayType: cleanType,
        date: new Date(alert.timestamp).toLocaleString('en-US')
      };
    });

    res.render('home', {
      alerts: formattedAlerts,
      title: 'SoundGuard',
      googleMapsApiKey: process.env.MAPS_API_KEY
    });
  } catch (error) {
    res.status(500).send('Error loading the dashboard');
  }
});

app.listen(PORT, () => {
  console.log(`Server started.`);
});