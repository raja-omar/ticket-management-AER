const { app } = require('@azure/functions');
const { executeQuery } = require('../../shared/sqlClient');
const { logActivity, ActivityType } = require('../../shared/activityLogger');
const { v4: uuidv4 } = require('uuid');

app.http('CreateTicket', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'tickets',
    handler: async (request, context) => {
        context.log('Creating new ticket');
        
        try {
            const body = await request.json();
            const { title, description, priority, assignee, createdBy } = body;

            if (!title) {
                return { status: 400, jsonBody: { error: 'Title is required' } };
            }

            const ticketId = uuidv4();
            const now = new Date().toISOString();
            const actor = createdBy || assignee || 'System';
            const ticketPriority = priority || 'Medium';
            const ticketAssignee = assignee || 'Unassigned';

            await executeQuery(`
                INSERT INTO Tickets (id, title, description, status, priority, assignee, createdAt, updatedAt)
                VALUES (@id, @title, @description, @status, @priority, @assignee, @createdAt, @updatedAt)
            `, {
                id: ticketId,
                title,
                description: description || '',
                status: 'Open',
                priority: ticketPriority,
                assignee: ticketAssignee,
                createdAt: now,
                updatedAt: now
            });

            const ticket = {
                id: ticketId,
                title,
                description: description || '',
                status: 'Open',
                priority: ticketPriority,
                assignee: ticketAssignee,
                createdAt: now,
                updatedAt: now
            };

            await logActivity({
                ticketId,
                type: ActivityType.TICKET_CREATED,
                actor,
                description: `Ticket "${title}" was created`,
                metadata: { title, priority: ticketPriority, assignee: ticketAssignee }
            });

            return { 
                status: 201, 
                jsonBody: ticket 
            };
        } catch (error) {
            context.log('Error creating ticket:', error);
            return { status: 500, jsonBody: { error: 'Failed to create ticket' } };
        }
    }
});
