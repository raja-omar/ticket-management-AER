const { app } = require('@azure/functions');
const { executeQuery } = require('../../shared/sqlClient');

app.http('GetTicket', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'tickets/{ticketId}',
    handler: async (request, context) => {
        const ticketId = request.params.ticketId;
        context.log(`Getting ticket: ${ticketId}`);
        
        try {
            const result = await executeQuery(`
                SELECT id, title, description, status, priority, assignee, createdAt, updatedAt
                FROM Tickets
                WHERE id = @ticketId
            `, { ticketId });

            if (result.recordset.length === 0) {
                return { status: 404, jsonBody: { error: 'Ticket not found' } };
            }

            const row = result.recordset[0];
            return { 
                jsonBody: {
                    id: row.id,
                    title: row.title,
                    description: row.description,
                    status: row.status,
                    priority: row.priority,
                    assignee: row.assignee,
                    createdAt: row.createdAt.toISOString(),
                    updatedAt: row.updatedAt.toISOString()
                }
            };
        } catch (error) {
            context.log('Error getting ticket:', error);
            return { status: 500, jsonBody: { error: 'Failed to get ticket' } };
        }
    }
});
