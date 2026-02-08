const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  allowRegistrations: { type: Boolean, default: true },
  commissionRate: { type: Number, default: 5 }, // Percentage
  supportEmail: { type: String, default: 'support@drakz.com' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' }
}, { timestamps: true });

// Prevent multiple settings documents
settingsSchema.statics.getSettings = async function() {
  const settings = await this.findOne();
  if (settings) return settings;
  return await this.create({});
};

module.exports = mongoose.model('Settings', settingsSchema);
