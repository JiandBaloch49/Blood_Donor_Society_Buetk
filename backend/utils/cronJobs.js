const cron = require('node-cron');
const Request = require('../models/Request');

/**
 * Phase 3: Auto-Expiration of Emergency Requests
 *
 * Runs every hour. Marks any 'pending' or 'verified' requests older than
 * 72 hours as 'expired' to keep the active dashboard clean.
 */
const startCronJobs = () => {
  // Run at the start of every hour: '0 * * * *'
  cron.schedule('0 * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000); // 72 hours ago

      const result = await Request.updateMany(
        {
          status: { $in: ['pending', 'verified'] },
          createdAt: { $lte: cutoff }
        },
        { $set: { status: 'expired' } }
      );

      if (result.modifiedCount > 0) {
        console.log(`⏰ CRON: Auto-expired ${result.modifiedCount} stale request(s)`);
      }
    } catch (err) {
      console.error('❌ CRON ERROR (auto-expire):', err.message);
    }
  });

  console.log('✅ Cron jobs initialized — requests auto-expire after 72h');
};

module.exports = { startCronJobs };
