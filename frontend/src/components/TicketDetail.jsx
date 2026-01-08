import { useState, useEffect } from 'react';
import { updateTicket, deleteTicket, getComments, createComment, getActivities } from '../api/tickets';
import './TicketDetail.css';

const priorityColors = {
    Critical: '#d13438',
    High: '#ff8c00',
    Medium: '#ffaa44',
    Low: '#107c10'
};

function TicketDetail({ ticket, onUpdate, onDelete, onClose }) {
    const [comments, setComments] = useState([]);
    const [activities, setActivities] = useState([]);
    const [activeTab, setActiveTab] = useState('comments');
    const [newComment, setNewComment] = useState('');
    const [commentAuthor, setCommentAuthor] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (ticket?.id) {
            loadComments();
            loadActivities();
        }
    }, [ticket?.id]);

    const loadComments = async () => {
        try {
            const data = await getComments(ticket.id);
            setComments(data);
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    };

    const loadActivities = async () => {
        try {
            const data = await getActivities(ticket.id);
            setActivities(data);
        } catch (error) {
            console.error('Failed to load activities:', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !commentAuthor.trim()) return;

        try {
            const comment = await createComment(ticket.id, {
                author: commentAuthor,
                content: newComment
            });
            setComments([...comments, comment]);
            setNewComment('');
            loadActivities(); // Refresh activities
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            setLoading(true);
            const updated = await updateTicket(ticket.id, { 
                status: newStatus,
                updatedBy: commentAuthor || 'User'
            });
            onUpdate(updated);
            loadActivities();
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEdit = async () => {
        try {
            setLoading(true);
            const updated = await updateTicket(ticket.id, {
                ...editForm,
                updatedBy: commentAuthor || 'User'
            });
            onUpdate(updated);
            setIsEditing(false);
            loadActivities();
        } catch (error) {
            console.error('Failed to update ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this ticket?')) return;
        try {
            await deleteTicket(ticket.id);
            onDelete(ticket.id);
        } catch (error) {
            console.error('Failed to delete ticket:', error);
        }
    };

    const startEditing = () => {
        setEditForm({
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            assignee: ticket.assignee
        });
        setIsEditing(true);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'TICKET_CREATED': return '●';
            case 'TICKET_UPDATED': return '○';
            case 'TICKET_DELETED': return '×';
            case 'COMMENT_ADDED': return '○';
            case 'COMMENT_DELETED': return '×';
            default: return '○';
        }
    };

    return (
        <div className="ticket-detail">
            <div className="detail-header">
                <button className="btn-icon" onClick={onClose}>×</button>
                <div className="header-actions">
                    {!isEditing && (
                        <>
                            <button className="btn-secondary" onClick={startEditing}>Edit</button>
                            <button className="btn-danger" onClick={handleDelete}>Delete</button>
                        </>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="edit-form">
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            rows={4}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Priority</label>
                            <select
                                value={editForm.priority}
                                onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                            >
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Assignee</label>
                            <input
                                type="text"
                                value={editForm.assignee}
                                onChange={(e) => setEditForm({...editForm, assignee: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                        <button className="btn-primary" onClick={handleSaveEdit} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="ticket-info">
                        <h2>{ticket.title}</h2>
                        <div className="ticket-badges">
                            <span 
                                className="priority-badge"
                                style={{ backgroundColor: priorityColors[ticket.priority] }}
                            >
                                {ticket.priority}
                            </span>
                            <span className={`status-badge status-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                                {ticket.status}
                            </span>
                        </div>
                        
                        {ticket.description && (
                            <p className="description">{ticket.description}</p>
                        )}

                        <div className="ticket-metadata">
                            <div className="meta-item">
                                <span className="meta-label">Assignee</span>
                                <span className="meta-value">{ticket.assignee}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Created</span>
                                <span className="meta-value">{formatDate(ticket.createdAt)}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Updated</span>
                                <span className="meta-value">{formatDate(ticket.updatedAt)}</span>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <label>Quick Status:</label>
                            <div className="status-buttons">
                                {['Open', 'In Progress', 'Resolved', 'Closed'].map(status => (
                                    <button
                                        key={status}
                                        className={`status-btn ${ticket.status === status ? 'active' : ''}`}
                                        onClick={() => handleStatusChange(status)}
                                        disabled={loading || ticket.status === status}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="tabs">
                        <button 
                            className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('comments')}
                        >
                            Comments ({comments.length})
                        </button>
                        <button 
                            className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
                            onClick={() => setActiveTab('activity')}
                        >
                            History ({activities.length})
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'comments' ? (
                            <div className="comments-section">
                                <div className="comments-list">
                                    {comments.length === 0 ? (
                                        <p className="no-comments">No comments yet</p>
                                    ) : (
                                        comments.map(comment => (
                                            <div key={comment.id} className="comment">
                                                <div className="comment-header">
                                                    <span className="comment-author">{comment.author}</span>
                                                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                                </div>
                                                <p className="comment-content">{comment.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <form className="comment-form" onSubmit={handleAddComment}>
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        value={commentAuthor}
                                        onChange={(e) => setCommentAuthor(e.target.value)}
                                        required
                                    />
                                    <textarea
                                        placeholder="Write a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows={3}
                                        required
                                    />
                                    <button type="submit" className="btn-primary">Add Comment</button>
                                </form>
                            </div>
                        ) : (
                            <div className="activity-section">
                                {activities.length === 0 ? (
                                    <p className="no-activity">No activity yet</p>
                                ) : (
                                    <div className="activity-timeline">
                                        {activities.map(activity => (
                                            <div key={activity.id} className="activity-item">
                                                <span className="activity-icon">{getActivityIcon(activity.type)}</span>
                                                <div className="activity-content">
                                                    <p className="activity-description">{activity.description}</p>
                                                    <span className="activity-meta">
                                                        by {activity.actor} • {formatDate(activity.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default TicketDetail;

