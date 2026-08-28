const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      sparse: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    profilePicture: {
      type: String,
      default: ''
    },
    contactNumber: {
      type: String,
      default: ''
    },
    organization: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['Student', 'Recruiter', 'Admin'],
      default: 'Student',
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

module.exports = mongoose.model('User', userSchema);
