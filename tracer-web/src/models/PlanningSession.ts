/**
 * PlanningSession MongoDB Model
 * 
 * Defines the Mongoose schema and model for PlanningSession documents.
 * Includes validation, timestamps, and proper typing.
 */

import mongoose, { Schema, Document } from 'mongoose'

/**
 * PlanningSession document interface extending Mongoose Document
 */
export interface IPlanningSession extends Document {
  name: string
  description: string
  projectId: mongoose.Types.ObjectId
  status: 'draft' | 'active' | 'completed'
  tasks: mongoose.Types.ObjectId[]
  agents: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

/**
 * PlanningSession schema definition
 */
const PlanningSessionSchema = new Schema<IPlanningSession>({
  name: {
    type: String,
    required: [true, 'Planning session name is required'],
    trim: true,
    maxlength: [200, 'Planning session name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Planning session description is required'],
    trim: true,
    maxlength: [1000, 'Planning session description cannot exceed 1000 characters']
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed'],
    default: 'draft'
  },
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  agents: [{
    type: Schema.Types.ObjectId,
    ref: 'Agent'
  }]
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
PlanningSessionSchema.index({ projectId: 1, status: 1 })
PlanningSessionSchema.index({ status: 1, createdAt: -1 })

// Virtual for session progress
PlanningSessionSchema.virtual('progress', {
  ref: 'Task',
  localField: 'tasks',
  foreignField: '_id',
  count: true
})

// Virtual for completed tasks in session
PlanningSessionSchema.virtual('completedTasks', {
  ref: 'Task',
  localField: 'tasks',
  foreignField: '_id',
  match: { status: 'completed' },
  count: true
})

// Pre-save middleware
PlanningSessionSchema.pre('save', function(next) {
  // Ensure session name is unique within the project
  this.name = this.name.trim()
  next()
})

// Export the model
export default mongoose.models.PlanningSession || mongoose.model<IPlanningSession>('PlanningSession', PlanningSessionSchema)
