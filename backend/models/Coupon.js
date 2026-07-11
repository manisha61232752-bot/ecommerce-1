import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: [true, 'Discount percentage is required'],
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  expirationDate: {
    type: Date,
    required: [true, 'Expiration date is required']
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Check if coupon is expired
couponSchema.methods.isExpired = function() {
  return Date.now() > this.expirationDate;
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
