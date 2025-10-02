/**
 * Agent MongoDB Model
 * 
 * Defines the Mongoose schema and model for Agent documents.
 * Includes validation, timestamps, and proper typing.
 */

import mongoose, { Schema, Document } from 'mongoose'

/**
 * Agent document interface extending Mongoose Document
 */
export interface IAgent extends Document {
  name: string
  type: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'ai'
  status: 'idle' | 'working' | 'busy' | 'suspended'
  currentTaskId?: mongoose.Types.ObjectId
  projectId: mongoose.Types.ObjectId
  capabilities: string[]
  efficiency: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Agent schema definition
 */
const AgentSchema = new Schema<IAgent>({
  name: {
    type: String,
    required: [true, 'Agent name is required'],
    trim: true,
    maxlength: [100, 'Agent name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['frontend', 'backend', 'fullstack', 'devops', 'ai'],
    required: [true, 'Agent type is required']
  },
  status: {
    type: String,
    enum: ['idle', 'working', 'busy', 'suspended'],
    default: 'idle'
  },
  currentTaskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  capabilities: [{
    type: String,
    trim: true,
    maxlength: [50, 'Capability name cannot exceed 50 characters']
  }],
  efficiency: {
    type: Number,
    min: [0, 'Efficiency cannot be negative'],
    max: [1, 'Efficiency cannot exceed 1'],
    default: 0.8
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
AgentSchema.index({ projectId: 1, status: 1 })
AgentSchema.index({ type: 1, status: 1 })
AgentSchema.index({ currentTaskId: 1 })

// Virtual for agent workload
AgentSchema.virtual('workload').get(function() {
  if (this.status === 'working' || this.status === 'busy') return 'high'
  if (this.status === 'idle') return 'low'
  return 'none'
})

// Virtual for agent availability
AgentSchema.virtual('isAvailable').get(function() {
  return this.status === 'idle'
})

// Pre-save middleware to validate efficiency
AgentSchema.pre('save', function(next) {
  // Ensure efficiency is between 0 and 1
  if (this.efficiency < 0 || this.efficiency > 1) {
    return next(new Error('Efficiency must be between 0 and 1'))
  }
  next()
})

// Export the model
export default mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema)
