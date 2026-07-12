const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['free', 'pending', 'confirmed', 'failed'],
      default: 'free',
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedMaterials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
      },
    ],
    completed: {
      type: Boolean,
      default: false,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
