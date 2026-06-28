import mongoose from 'mongoose';
import { PASSWORD } from '../../shared/constants/index.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: {
    type: String,
    required: true,
  },
  profilePhoto: { type: String, default: '' },
  cloudinaryId: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 200 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  cartData: { type: Object, default: {} },
  refreshTokens: { type: [String], default: [] } // For tracking active sessions/refresh token rotation
}, { minimize: false, timestamps: true });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
