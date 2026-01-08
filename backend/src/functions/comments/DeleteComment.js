const { app } = require('@azure/functions');
const { executeQuery } = require('../../shared/sqlClient');
const { logActivity, ActivityType } = require('../../shared/activityLogger');

app.http('DeleteComment', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'tickets/{ticketId}/comments/{commentId}',
    handler: async (request, context) => {
        const { ticketId, commentId } = request.params;
        const deletedBy = request.query.get('deletedBy') || 'System';
        context.log(`Deleting comment ${commentId} from ticket ${ticketId}`);
        
        try {
            let author = 'Unknown';
            const existingResult = await executeQuery(`
                SELECT author FROM Comments WHERE id = @commentId AND ticketId = @ticketId
            `, { commentId, ticketId });

            if (existingResult.recordset.length > 0) {
                author = existingResult.recordset[0].author;
            }

            const deleteResult = await executeQuery(`
                DELETE FROM Comments WHERE id = @commentId AND ticketId = @ticketId
            `, { commentId, ticketId });

            if (deleteResult.rowsAffected[0] === 0) {
                return { status: 404, jsonBody: { error: 'Comment not found' } };
            }

            await logActivity({
                ticketId,
                type: ActivityType.COMMENT_DELETED,
                actor: deletedBy,
                description: `Comment by ${author} was deleted`,
                metadata: { commentId, originalAuthor: author }
            });

            return { status: 204 };
        } catch (error) {
            context.log('Error deleting comment:', error);
            return { status: 500, jsonBody: { error: 'Failed to delete comment' } };
        }
    }
});
