'use client'

import { motion } from 'framer-motion'
import { Loader2, Zap, Users, CheckSquare, Activity } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  )
}

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="text-gray-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4 max-w-sm mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}

interface StatusIndicatorProps {
  status: 'idle' | 'working' | 'busy' | 'completed' | 'pending' | 'in-progress' | 'blocked'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function StatusIndicator({ status, size = 'md', showLabel = false }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  }

  const statusConfig = {
    idle: { color: 'bg-green-500', label: 'Idle' },
    working: { color: 'bg-blue-500', label: 'Working' },
    busy: { color: 'bg-orange-500', label: 'Busy' },
    completed: { color: 'bg-green-500', label: 'Completed' },
    pending: { color: 'bg-gray-400', label: 'Pending' },
    'in-progress': { color: 'bg-blue-500', label: 'In Progress' },
    blocked: { color: 'bg-red-500', label: 'Blocked' },
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center space-x-2">
      <motion.div
        className={`${sizeClasses[size]} ${config.color} rounded-full`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {showLabel && <span className="text-sm text-gray-600">{config.label}</span>}
    </div>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  color?: 'blue' | 'green' | 'red' | 'yellow'
}

export function ProgressBar({ 
  value, 
  max = 100, 
  label, 
  showPercentage = false, 
  color = 'blue' 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  }

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          {showPercentage && <span className="text-gray-500">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

interface NotificationToastProps {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
  duration?: number
}

export function NotificationToast({ message, type, onClose }: NotificationToastProps) {
  const typeConfig = {
    success: { icon: CheckSquare, color: 'bg-green-500', textColor: 'text-green-800' },
    error: { icon: Activity, color: 'bg-red-500', textColor: 'text-red-800' },
    info: { icon: Users, color: 'bg-blue-500', textColor: 'text-blue-800' },
    warning: { icon: Zap, color: 'bg-yellow-500', textColor: 'text-yellow-800' },
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <div className={`${config.color} text-white p-4 rounded-lg shadow-lg flex items-center space-x-3`}>
        <Icon className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          ×
        </button>
      </div>
    </motion.div>
  )
}

