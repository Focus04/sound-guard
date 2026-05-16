import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  reportCount: { type: Number, default: 1 },

  alertType: { type: String, required: true },
  severity: { type: String },

  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },

  timestamp: { type: Date, default: Date.now }
});

alertSchema.index({ location: '2dsphere' });

export default mongoose.model('Alert', alertSchema);