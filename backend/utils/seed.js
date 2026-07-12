// Seeds the database with demo users and courses.
// Run with: npm run seed  (make sure MONGO_URI is set in .env)
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');

const seedDemoData = async ({ reset = false } = {}) => {
  await connectDB();

  const hasUsers = await User.countDocuments();
  const hasCourses = await Course.countDocuments();

  if (!reset && hasUsers > 0 && hasCourses > 0) {
    return { created: false, message: 'Demo data already exists. Skipping seed.' };
  }

  if (reset) {
    console.log('Clearing existing demo data...');
    await Promise.all([User.deleteMany({}), Course.deleteMany({})]);
  }

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Alex Admin',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin',
  });

  const instructor = await User.create({
    name: 'Priya Sharma',
    email: 'instructor@demo.com',
    password: 'password123',
    role: 'instructor',
    bio: 'Full-stack developer and educator with 8 years of teaching experience.',
  });

  const student = await User.create({
    name: 'Sam Student',
    email: 'student@demo.com',
    password: 'password123',
    role: 'student',
  });

  console.log('Creating courses...');
  await Course.create([
    {
      title: 'Complete Web Development Bootcamp',
      description:
        'Learn HTML, CSS, JavaScript, React, Node.js and MongoDB from scratch and build real projects.',
      shortDescription: 'Become a full-stack developer from zero to job-ready.',
      category: 'Web Development',
      level: 'Beginner',
      price: 49.99,
      isPaid: true,
      instructor: instructor._id,
      tags: ['javascript', 'react', 'node', 'mongodb'],
      published: true,
    },
    {
      title: 'Introduction to Data Structures & Algorithms',
      description:
        'Master the fundamentals of DSA with hands-on problem solving in JavaScript and Python.',
      shortDescription: 'Ace your technical interviews with strong DSA fundamentals.',
      category: 'Computer Science',
      level: 'Intermediate',
      price: 0,
      isPaid: false,
      instructor: instructor._id,
      tags: ['dsa', 'algorithms', 'interview-prep'],
      published: true,
    },
    {
      title: 'UI/UX Design Fundamentals',
      description:
        'Learn design thinking, wireframing, prototyping and how to build beautiful, usable interfaces.',
      shortDescription: 'Design products people love to use.',
      category: 'Design',
      level: 'Beginner',
      price: 29.99,
      isPaid: true,
      instructor: instructor._id,
      tags: ['design', 'figma', 'ux'],
      published: true,
    },
  ]);

  console.log('Seed complete!');
  console.log('----------------------------------------');
  console.log('Admin:      admin@demo.com / password123');
  console.log('Instructor: instructor@demo.com / password123');
  console.log('Student:    student@demo.com / password123');
  console.log('----------------------------------------');

  return { created: true, admin, instructor, student };
};

const run = async () => {
  const result = await seedDemoData({ reset: true });
  await mongoose.connection.close();
  return result;
};

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seedDemoData, run };
