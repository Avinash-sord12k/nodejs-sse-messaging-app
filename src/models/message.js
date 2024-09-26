import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  content: String,
  timestamp: { type: Date, default: Date.now },
});

// Virtual field to populate user details based on userId
messageSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true, // Only return one user
});

// Enable virtuals to be included in JSON and object output
messageSchema.set('toObject', { virtuals: true });
messageSchema.set('toJSON', { virtuals: true });

const MessageModel = mongoose.model('Message', messageSchema);

export { MessageModel, messageSchema };
