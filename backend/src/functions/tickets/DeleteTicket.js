const { app } = require('@azure/functions');
const { executeQuery } = require('../../shared/sqlClient');
const { logActivity, ActivityType } = require('../../shared/activityLogger');

app.http('DeleteTicket', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'tickets/{ticketId}',
    handler: async (request, context) => {
        const ticketId = request.params.ticketId;
        const deletedBy = request.query.get('deletedBy') || 'System';
        context.log(`Deleting ticket: ${ticketId}`);
        
        try {
            let ticketTitle = 'Unknown';
            const existingResult = await executeQuery(`
                SELECT title FROM Tickets WHERE id = @ticketId
            `, { ticketId });

            if (existingResult.recordset.length > 0) {
                ticketTitle = existingResult.recordset[0].title;
            }

            const deleteResult = await executeQuery(`
                DELETE FROM Tickets WHERE id = @ticketId
            `, { ticketId });

            if (deleteResult.rowsAffected[0] === 0) {
                return { status: 404, jsonBody: { error: 'Ticket not found' } };
            }

            context.log(`Ticket "${ticketTitle}" was deleted by ${deletedBy}`);

            return { status: 204 };
        } catch (error) {
            context.log('Error deleting ticket:', error);
            return { status: 500, jsonBody: { error: 'Failed to delete ticket' } };
        }
    }
});
