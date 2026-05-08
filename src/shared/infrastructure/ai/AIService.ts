import { GoogleGenerativeAI, type GenerationConfig } from '@google/generative-ai'
import { SALES_BRAIN_PROMPTS, type AIPromptContext } from '@/shared/infrastructure/ai/prompts'
import { ACTIVITY_LABELS, AI_SYSTEM_DEFAULTS } from '@/modules/leads/domain/constants'
import { formatLocalDate } from '@/shared/utils/formatDate'

export interface AIContext {
  leadName: string
  leadSource?: string
  leadStatus?: string
  leadSector?: string
  attempts?: number
  sellerName?: string
  companyName?: string
  productBenefits?: string
  history?: Array<{
    type: string
    description: string | null
    created_at: string
  }>
  userContext?: string
  firstContactAt?: string | null
}

export class AIService {
  private genAI: GoogleGenerativeAI
  private model: any

  private static readonly generationConfig: GenerationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 1024,
    responseMimeType: 'text/plain',
  }

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      console.warn('AIService: VITE_GEMINI_API_KEY is missing')
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '')
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SALES_BRAIN_PROMPTS.SYSTEM,
    })
  }

  private formatHistory(history?: AIContext['history']): string {
    if (!history?.length) return 'No hay historial previo registrado.'

    return history
      .map((h) => {
        const label = ACTIVITY_LABELS[h.type] ?? '🟦 AGENTE'
        const date = new Date(h.created_at).toLocaleString('es-CR', {
          short: 'medium',
        } as any)
        return `[${date}] ${label}: ${h.description || 'Sin descripción'}`
      })
      .join('\n')
  }

  async generateResponse(context: AIContext): Promise<string> {
    const promptContext: AIPromptContext = {
      leadName: context.leadName,
      leadSource: context.leadSource,
      leadStatus: context.leadStatus,
      leadSector: context.leadSector,
      attempts: context.attempts ?? 0,
      sellerName: context.sellerName || AI_SYSTEM_DEFAULTS.SELLER_NAME,
      companyName: context.companyName || AI_SYSTEM_DEFAULTS.COMPANY_NAME,
      productBenefits: context.productBenefits?.trim() || null,
      historyText: this.formatHistory(context.history),
      userContext: context.userContext?.trim(),
      contactDateLabel: formatLocalDate(context.firstContactAt, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    }

    const prompt = SALES_BRAIN_PROMPTS.buildUserPrompt(promptContext)

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: AIService.generationConfig,
      })
      const response = await result.response
      return response.text().trim()
    } catch (error: unknown) {
      this.handleError(error)
      return '' // Unreachable due to handleError throwing
    }
  }

  private handleError(error: unknown): never {
    const message = error instanceof Error ? error.message : String(error)

    if (
      message.includes('429') ||
      message.toLowerCase().includes('credits are depleted') ||
      message.toLowerCase().includes('quota')
    ) {
      throw new Error(
        'Sin créditos de IA disponibles. Recarga tu saldo en aistudio.google.com para continuar usando el Sales Brain.',
      )
    }

    if (message.includes('404') || message.toLowerCase().includes('not found')) {
      throw new Error('El modelo de IA no está disponible. Contacta al administrador.')
    }

    throw new Error('Error al conectar con el Sales Brain. Inténtalo de nuevo más tarde.')
  }
}
