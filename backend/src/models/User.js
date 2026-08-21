import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  language: {
    type: String,
    default: 'en',
  },
  // Onboarding profile fields
  profile: {
    language: { type: String, default: 'en' },
    ageCategory: { type: String, default: null },   // '18-25', '26-40', '41-60', '60+'
    gender: { type: String, default: null },          // 'male', 'female', 'other'
    state: { type: String, default: null },
    incomeBracket: { type: String, default: null },   // '<1L', '1-3L', '3-8L', '8L+'
    occupation: { type: String, default: null },
    employmentStatus: { type: String, default: null },
    onboardingComplete: { type: Boolean, default: false },
  },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
