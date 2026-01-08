const { executeQuery } = require('./sqlClient');
const { v4: uuidv4 } = require('uuid');

const ActivityType = {
    TICKET_CREATED: 'TICKET_CREATED',
    TICKET_UPDATED: 'TICKET_UPDATED',
    TICKET_DELETED: 'TICKET_DELETED',
    COMMENT_ADDED: 'COMMENT_ADDED',
    COMMENT_DELETED: 'COMMENT_DELETED'
};

async function logActivity({ ticketId, type, actor, description, metadata = {} }) {
    try {
        const activityId = uuidv4();
        const now = new Date().toISOString();

        await executeQuery(`
            INSERT INTO Activities (id, ticketId, type, actor, description, metadata, createdAt)
            VALUES (@id, @ticketId, @type, @actor, @description, @metadata, @createdAt)
        `, {
            id: activityId,
            ticketId,
            type,
            actor: actor || 'System',
            description,
            metadata: JSON.stringify(metadata),
            createdAt: now
        });

        return {
            id: activityId,
            ticketId,
            type,
            actor: actor || 'System',
            description,
            metadata,
            createdAt: now
        };
    } catch (error) {
        console.error('Failed to log activity:', error);
        return null;
    }
}

async function getActivitiesForTicket(ticketId) {
    const result = await executeQuery(`
        SELECT id, ticketId, type, actor, description, metadata, createdAt
        FROM Activities
        WHERE ticketId = @ticketId
        ORDER BY createdAt DESC
    `, { ticketId });

    return result.recordset.map(row => ({
        id: row.id,
        ticketId: row.ticketId,
        type: row.type,
        actor: row.actor,
        description: row.description,
        metadata: JSON.parse(row.metadata || '{}'),
        createdAt: row.createdAt.toISOString()
    }));
}

module.exports = { logActivity, getActivitiesForTicket, ActivityType };
