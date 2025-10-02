/**
 * Task MongoDB Model
 * 
 * Defines the Mongoose schema and model for Task documents.
 * Includes validation, timestamps, and proper typing.
 */

import mongoose, { Schema, Document } from 'mongoose'

/**
 * Task document interface extending Mongoose Document
 */
export interface ITask extends Document {
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  agentId?: mongoose.Types.ObjectId
  projectId: mongoose.Types.ObjectId
  dependencies: mongoose.Types.ObjectId[]
  estimatedHours?: number
  actualHours?: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Task schema definition
 */
const TaskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'blocked'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    default: null
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  dependencies: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [1000, 'Estimated hours cannot exceed 1000']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    max: [1000, 'Actual hours cannot exceed 1000'],
    default: 0
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
TaskSchema.index({ projectId: 1, status: 1 })
TaskSchema.index({ agentId: 1 })
TaskSchema.index({ priority: 1, status: 1 })

// Virtual for task progress percentage
TaskSchema.virtual('progressPercentage').get(function() {
  if (this.status === 'completed') return 100
  if (this.status === 'in-progress') return 50
  if (this.status === 'blocked') return 0
  return 0
})

// Pre-save middleware to validate dependencies
TaskSchema.pre('save', function(next) {
  // Prevent circular dependencies
  if (this.dependencies.includes(this._id)) {
    return next(new Error('Task cannot depend on itself'))
  }
  next()
})

// Export the model
export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema)
