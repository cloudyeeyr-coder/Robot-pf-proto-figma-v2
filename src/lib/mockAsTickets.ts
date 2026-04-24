// Mock data for AS tickets

export type AsTicketStatus = 'reported' | 'assigned' | 'dispatched' | 'resolved';
export type AsPriority = 'normal' | 'urgent';

export interface AsTicket {
  id: string;
  contract_id: string;
  buyer_company_id: string;
  si_partner_id: string;
  symptom_description: string;
  priority: AsPriority;
  photos?: string[];
  status: AsTicketStatus;
  reported_at: string;
  assigned_at?: string;
  dispatched_at?: string;
  resolved_at?: string;
  engineer_name?: string;
  engineer_contact?: string;
  ticket_number: string;
}

// Mock AS tickets
export const MOCK_AS_TICKETS: { [key: string]: AsTicket } = {
  'ticket-001': {
    id: 'ticket-001',
    contract_id: 'contract-002',
    buyer_company_id: 'company-buyer',
    si_partner_id: 'si-0002',
    symptom_description: '로봇 팔이 정해진 위치로 이동하지 않고 계속 에러가 발생합니다. 생산 라인이 멈춰있는 상태입니다.',
    priority: 'urgent',
    status: 'resolved',
    reported_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    assigned_at: new Date(Date.now() - 24.5 * 60 * 60 * 1000).toISOString(),
    dispatched_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    engineer_name: '김기술',
    engineer_contact: '010-1234-5678',
    ticket_number: 'AS-2026-001',
  },
};

// Simulate AS ticket state progression
let ticketStateSimulation: { [key: string]: number } = {};

export function simulateAsTicketProgress(ticketId: string): AsTicketStatus {
  if (!MOCK_AS_TICKETS[ticketId]) return 'reported';

  if (!ticketStateSimulation[ticketId]) {
    ticketStateSimulation[ticketId] = 0;
  }

  const ticket = MOCK_AS_TICKETS[ticketId];
  ticketStateSimulation[ticketId]++;

  const cycles = ticketStateSimulation[ticketId];

  // Simulate progression: reported (0-2) → assigned (3-5) → dispatched (6-8) → resolved (9+)
  if (cycles >= 9 && ticket.status !== 'resolved') {
    ticket.status = 'resolved';
    ticket.resolved_at = new Date().toISOString();
  } else if (cycles >= 6 && ticket.status === 'assigned') {
    ticket.status = 'dispatched';
    ticket.dispatched_at = new Date().toISOString();
  } else if (cycles >= 3 && ticket.status === 'reported') {
    ticket.status = 'assigned';
    ticket.assigned_at = new Date().toISOString();
    ticket.engineer_name = '김기술';
    ticket.engineer_contact = '010-1234-5678';
  }

  return ticket.status;
}

export function getAsTicketById(ticketId: string): AsTicket | undefined {
  return MOCK_AS_TICKETS[ticketId];
}

export function createAsTicket(data: {
  contract_id: string;
  buyer_company_id: string;
  si_partner_id: string;
  symptom_description: string;
  priority: AsPriority;
  photos?: string[];
}): AsTicket {
  const ticketNumber = `AS-2026-${String(Object.keys(MOCK_AS_TICKETS).length + 1).padStart(3, '0')}`;
  const newTicket: AsTicket = {
    id: `ticket-${Date.now()}`,
    ...data,
    status: 'reported',
    reported_at: new Date().toISOString(),
    ticket_number: ticketNumber,
  };

  MOCK_AS_TICKETS[newTicket.id] = newTicket;
  return newTicket;
}

// Calculate SLA compliance
export function checkSlaCompliance(ticket: AsTicket): boolean {
  if (!ticket.resolved_at) return false;

  const reportedTime = new Date(ticket.reported_at).getTime();
  const resolvedTime = new Date(ticket.resolved_at).getTime();
  const elapsedHours = (resolvedTime - reportedTime) / (1000 * 60 * 60);

  return elapsedHours <= 24;
}

// Calculate elapsed time from target
export function getElapsedTime(startTime: string, targetHours: number): {
  elapsed: number;
  target: number;
  isOverdue: boolean;
} {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  const elapsedHours = Math.floor((now - start) / (1000 * 60 * 60));

  return {
    elapsed: elapsedHours,
    target: targetHours,
    isOverdue: elapsedHours > targetHours,
  };
}
