export interface MessageTemplate {
  id: string
  user_id: string
  status_id: string | null
  name: string
  content: string
  order: number
  created_at: string
}

export function applyTemplateVariables(content: string, variables: { nombre: string }): string {
  return content.replace(/\{\{nombre\}\}/g, variables.nombre)
}
