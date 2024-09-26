import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
});

const UserModel = mongoose.model('User', userSchema);

export { UserModel, userSchema };
