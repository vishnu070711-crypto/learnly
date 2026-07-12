const mongoose = require('mongoose');
const Course = require('../models/Course');
const connectDB = require('../config/db');

(async () => {
  try {
    await connectDB();
    const result = await Course.updateMany(
      { $or: [{ published: { $exists: false } }, { published: false }] },
      { $set: { published: true } }
    );

    console.log(`Updated ${result.modifiedCount} course(s) to published.`);
    const count = await Course.countDocuments({ published: true });
    console.log(`Published courses now: ${count}`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
