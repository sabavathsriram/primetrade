import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', trim: true, maxlength: 1000 },
    status:      { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model('Task', taskSchema);
