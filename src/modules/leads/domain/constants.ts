export const LEAD_STATUS = {
  NEW: 'Nuevo',
  CONTACTED: 'Contactado',
  QUALIFIED: 'Calificado',
  PROPOSAL: 'Propuesta',
  NEGOTIATION: 'Negociación',
  CLOSED_WON: 'Ganado',
  CLOSED_LOST: 'Perdido',
} as const

export type LeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS]

export const LEAD_PRIORITY = {
  LOW: 'baja',
  MEDIUM: 'media',
  HIGH: 'alta',
} as const

export type LeadPriority = (typeof LEAD_PRIORITY)[keyof typeof LEAD_PRIORITY]

export const FOLLOW_UP_CONFIG = {
  UPCOMING_WINDOW_DAYS: 3,
  INITIAL_CONTACT_DAYS: 1,
  DEFAULT_MAX_DAYS: 14,
} as const

export const CADENCE_STRATEGIES = {
  PROGRESSIVE: [1, 2, 3, 5, 7, 10, 14],
} as const

export const ACTIVITY_LABELS: Record<string, string> = {
  message: '🟩 LEAD respondió',
  note: '🟦 AGENTE anotó',
  followup: '🟦 AGENTE contactó',
  status_change: '⚙️ Sistema',
} as const

export const AI_SYSTEM_DEFAULTS = {
  SELLER_NAME: 'Marcos',
  COMPANY_NAME: 'NMSoftwarelab',
} as const
