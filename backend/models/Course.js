const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      maxlength: 5000,
    },
    shortDescription: {
      type: String,
      maxlength: 200,
      default: '',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [{ type: String, trim: true }],
    published: {
      type: Boolean,
      default: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
