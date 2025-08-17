import cron from 'node-cron';
import './scripts/expirePremiumUsers.js'; // this will run on schedule

// ⏰ Run every day at 12:00 AM (midnight)
cron.schedule('0 0 * * *', () => {
  console.log('⏰ Running daily expiry check...');
});
