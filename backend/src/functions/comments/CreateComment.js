const { app } = require('@azure/functions');
const { executeQuery } = require('../../shared/sqlClient');
const { logActivity, ActivityType } = require('../../shared/activityLogger');
const { v4: uuidv4 } = require('uuid');

app.http('CreateComment', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'tickets/{ticketId}/comments',
    handler: async (request, context) => {
        const ticketId = request.params.ticketId;
        context.log(`Creating comment for ticket: ${ticketId}`);
        
        try {
            const body = await request.json();
            const { author, content } = body;

            if (!content) {
                return { status: 400, jsonBody: { error: 'Content is required' } };
            }

            if (!author) {
                return { status: 400, jsonBody: { error: 'Author is required' } };
            }

            const ticketResult = await executeQuery(`
                SELECT id FROM Tickets WHERE id = @ticketId
            `, { ticketId });

            if (ticketResult.recordset.length === 0) {
                return { status: 404, jsonBody: { error: 'Ticket not found' } };
            }

            const commentId = uuidv4();
            const now = new Date().toISOString();

            await executeQuery(`
                INSERT INTO Comments (id, ticketId, author, content, createdAt)
                VALUES (@id, @ticketId, @author, @content, @createdAt)
            `, {
                id: commentId,
                ticketId,
                author,
                content,
                createdAt: now
            });

            const comment = {
                id: commentId,
                ticketId,
                author,
                content,
                createdAt: now
            };

            await logActivity({
                ticketId,
                type: ActivityType.COMMENT_ADDED,
                actor: author,
                description: `${author} added a comment`,
                metadata: { commentId, contentPreview: content.substring(0, 100) }
            });

            return { 
                status: 201, 
                jsonBody: comment
            };
        } catch (error) {
            context.log('Error creating comment:', error);
            return { status: 500, jsonBody: { error: 'Failed to create comment' } };
        }
    }
});
