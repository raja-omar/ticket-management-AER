import { useState } from 'react';
import { createTicket } from '../api/tickets';
import './CreateTicketModal.css';

function CreateTicketModal({ onClose, onCreate }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        assignee: '',
        createdBy: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            setError('Title is required');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const ticket = await createTicket({
                ...form,
                createdBy: form.createdBy || form.assignee || 'System'
            });
            onCreate(ticket);
        } catch (err) {
            setError('Failed to create ticket. Please try again.');
            console.error('Failed to create ticket:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>New Work Item</h2>
                    <button className="btn-icon" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({...form, title: e.target.value})}
                            placeholder="Brief description of the issue"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({...form, description: e.target.value})}
                            placeholder="Detailed description of the issue..."
                            rows={4}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Priority</label>
                            <select
                                value={form.priority}
                                onChange={(e) => setForm({...form, priority: e.target.value})}
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
                                value={form.assignee}
                                onChange={(e) => setForm({...form, assignee: e.target.value})}
                                placeholder="Who should handle this?"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Created By</label>
                        <input
                            type="text"
                            value={form.createdBy}
                            onChange={(e) => setForm({...form, createdBy: e.target.value})}
                            placeholder="Your name"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateTicketModal;

