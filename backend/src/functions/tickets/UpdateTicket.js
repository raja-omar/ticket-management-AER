const { app } = require('@azure/functions');
const { executeQuery } = require('../../shared/sqlClient');
const { logActivity, ActivityType } = require('../../shared/activityLogger');

app.http('UpdateTicket', {
    methods: ['PUT', 'PATCH'],
    authLevel: 'anonymous',
    route: 'tickets/{ticketId}',
    handler: async (request, context) => {
        const ticketId = request.params.ticketId;
        context.log(`Updating ticket: ${ticketId}`);
        
        try {
            const body = await request.json();
            const { title, description, status, priority, assignee, updatedBy } = body;

            const existingResult = await executeQuery(`
                SELECT id, title, description, status, priority, assignee, createdAt, updatedAt
                FROM Tickets
                WHERE id = @ticketId
            `, { ticketId });

            if (existingResult.recordset.length === 0) {
                return { status: 404, jsonBody: { error: 'Ticket not found' } };
            }

            const existing = existingResult.recordset[0];

            const changes = [];
            if (title !== undefined && title !== existing.title) changes.push(`title: "${existing.title}" → "${title}"`);
            if (status !== undefined && status !== existing.status) changes.push(`status: ${existing.status} → ${status}`);
            if (priority !== undefined && priority !== existing.priority) changes.push(`priority: ${existing.priority} → ${priority}`);
            if (assignee !== undefined && assignee !== existing.assignee) changes.push(`assignee: ${existing.assignee} → ${assignee}`);
            if (description !== undefined && description !== existing.description) changes.push('description updated');

            const updatedTitle = title ?? existing.title;
            const updatedDescription = description ?? existing.description;
            const updatedStatus = status ?? existing.status;
            const updatedPriority = priority ?? existing.priority;
            const updatedAssignee = assignee ?? existing.assignee;
            const updatedAt = new Date().toISOString();

            await executeQuery(`
                UPDATE Tickets
                SET title = @title,
                    description = @description,
                    status = @status,
                    priority = @priority,
                    assignee = @assignee,
                    updatedAt = @updatedAt
                WHERE id = @ticketId
            `, {
                ticketId,
                title: updatedTitle,
                description: updatedDescription,
                status: updatedStatus,
                priority: updatedPriority,
                assignee: updatedAssignee,
                updatedAt
            });

            const updatedTicket = {
                id: ticketId,
                title: updatedTitle,
                description: updatedDescription,
                status: updatedStatus,
                priority: updatedPriority,
                assignee: updatedAssignee,
                createdAt: existing.createdAt.toISOString(),
                updatedAt
            };

            if (changes.length > 0) {
                await logActivity({
                    ticketId,
                    type: ActivityType.TICKET_UPDATED,
                    actor: updatedBy || 'System',
                    description: `Ticket updated: ${changes.join(', ')}`,
                    metadata: { changes, previousValues: { status: existing.status, priority: existing.priority, assignee: existing.assignee } }
                });
            }

            return { jsonBody: updatedTicket };
        } catch (error) {
            context.log('Error updating ticket:', error);
            return { status: 500, jsonBody: { error: 'Failed to update ticket' } };
        }
    }
});
