export interface User { id: string; email: string; name?: string }
export interface AuthResponse { token: string; user: User }
export interface Service { name: string; technology: string; responsibility: string; port?: number; type: string }
export interface Architecture { services: Service[]; tech_stack: Record<string, string>; communication_patterns: string[]; summary: string }
export interface Column { name: string; type: string; constraints: string[]; description: string }
export interface DBTable { name: string; purpose: string; columns: Column[]; indexes: string[] }
export interface Database { tables: DBTable[]; total_tables: number; sql_preview: string }
export interface Endpoint { path: string; method: 'GET'|'POST'|'PUT'|'DELETE'|'PATCH'; description: string; auth_required: boolean }
export interface ApiDesign { endpoints: Endpoint[]; auth_strategy: string; base_url: string }
export interface CostTier { description: string; monthly_usd: number; services: Array<{name: string; cost_usd: number}> }
export interface CostEstimate { tiers: { small: CostTier; medium: CostTier; large: CostTier }; cost_saving_tips: string[] }
export interface GenerationResult { id: string; projectName: string; summary: string; input: string; architecture: Architecture; database: Database; apiDesign: ApiDesign; cost: CostEstimate; createdAt: string }
