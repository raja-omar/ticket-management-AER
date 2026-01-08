const { app } = require('@azure/functions');
const { executeQuery } = require('../../shared/sqlClient');

app.http('GetTickets', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'tickets',
    handler: async (request, context) => {
        context.log('Getting all tickets');
        
        try {
            const result = await executeQuery(`
                SELECT id, title, description, status, priority, assignee, createdAt, updatedAt
                FROM Tickets
                ORDER BY createdAt DESC
            `);

            const tickets = result.recordset.map(row => ({
                id: row.id,
                title: row.title,
                description: row.description,
                status: row.status,
                priority: row.priority,
                assignee: row.assignee,
                createdAt: row.createdAt.toISOString(),
                updatedAt: row.updatedAt.toISOString()
            }));

            return { jsonBody: tickets };
        } catch (error) {
            context.log('Error getting tickets:', error);
            return { status: 500, jsonBody: { error: 'Failed to get tickets' } };
        }
    }
});
