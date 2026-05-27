import express from 'express';
import mongoose from 'mongoose';
import { engine } from 'express-handlebars';
import cors from 'cors';
import Alert from './models/Alert.js';
import { config } from 'dotenv';

import alertsRoutes from './routes/alertsRoutes.js';
import checkLocationRoutes from './routes/checkLocationRoutes.js';

config({ quiet: true });
mongoose.connect(process.env.MONGODB_URI);
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.engine('handlebars', engine({
  extname: '.hbs',
  helpers: {
    json: context => JSON.stringify(context),
    eq: (v1, v2) => v1 === v2
  }
}));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use('/api/alerts', alertsRoutes);
app.use('/api/check-location', checkLocationRoutes);

app.get('/', async (req, res) => {
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
});

app.listen(PORT, () => console.log(`Server started.`));