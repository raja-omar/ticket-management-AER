const { app } = require('@azure/functions');
const { executeQuery } = require('../../shared/sqlClient');

app.http('GetComments', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'tickets/{ticketId}/comments',
    handler: async (request, context) => {
        const ticketId = request.params.ticketId;
        context.log(`Getting comments for ticket: ${ticketId}`);
        
        try {
            const result = await executeQuery(`
                SELECT id, ticketId, author, content, createdAt
                FROM Comments
                WHERE ticketId = @ticketId
                ORDER BY createdAt ASC
            `, { ticketId });

            const comments = result.recordset.map(row => ({
                id: row.id,
                ticketId: row.ticketId,
                author: row.author,
                content: row.content,
                createdAt: row.createdAt.toISOString()
            }));

            return { jsonBody: comments };
        } catch (error) {
            context.log('Error getting comments:', error);
            return { status: 500, jsonBody: { error: 'Failed to get comments' } };
        }
    }
});
