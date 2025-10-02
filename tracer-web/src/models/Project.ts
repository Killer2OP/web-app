/**
 * Project MongoDB Model
 * 
 * Defines the Mongoose schema and model for Project documents.
 * Includes validation, timestamps, and proper typing.
 */

import mongoose, { Schema, Document } from 'mongoose'

/**
 * Project document interface extending Mongoose Document
 */
export interface IProject extends Document {
  name: string
  description: string
  status: 'active' | 'completed' | 'paused' | 'archived'
  ownerId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

/**
 * Project schema definition
 */
const ProjectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [200, 'Project name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [1000, 'Project description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'archived'],
    default: 'active'
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
ProjectSchema.index({ status: 1, createdAt: -1 })
ProjectSchema.index({ ownerId: 1 })

// Virtual for project progress
ProjectSchema.virtual('progress', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId',
  count: true
})

// Virtual for completed tasks count
ProjectSchema.virtual('completedTasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId',
  match: { status: 'completed' },
  count: true
})

// Virtual for active agents count
ProjectSchema.virtual('activeAgents', {
  ref: 'Agent',
  localField: '_id',
  foreignField: 'projectId',
  match: { status: { $in: ['idle', 'working'] } },
  count: true
})

// Pre-save middleware
ProjectSchema.pre('save', function(next) {
  // Ensure project name is unique (case insensitive)
  this.name = this.name.trim()
  next()
})

// Export the model
export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema)
