const { app } = require('@azure/functions');
const { getActivitiesForTicket } = require('../../shared/activityLogger');

app.http('GetActivities', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'tickets/{ticketId}/activities',
    handler: async (request, context) => {
        const ticketId = request.params.ticketId;
        context.log(`Getting activities for ticket: ${ticketId}`);
        
        try {
            const activities = await getActivitiesForTicket(ticketId);
            return { jsonBody: activities };
        } catch (error) {
            context.log('Error getting activities:', error);
            return { status: 500, jsonBody: { error: 'Failed to get activities' } };
        }
    }
});
