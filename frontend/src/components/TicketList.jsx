import './TicketList.css';

const priorityColors = {
    Critical: '#d13438',
    High: '#ff8c00',
    Medium: '#ffaa44',
    Low: '#107c10'
};

function TicketList({ tickets, selectedId, onSelect }) {
    if (tickets.length === 0) {
        return (
            <div className="ticket-list-empty">
                <span className="icon">📋</span>
                <p>No tickets found</p>
            </div>
        );
    }

    return (
        <div className="ticket-list">
            {tickets.map(ticket => (
                <div 
                    key={ticket.id}
                    className={`ticket-card ${selectedId === ticket.id ? 'selected' : ''}`}
                    onClick={() => onSelect(ticket)}
                >
                    <div className="ticket-header">
                        <span className={`status-dot status-${ticket.status.toLowerCase().replace(' ', '-')}`}></span>
                        <span 
                            className="priority-badge"
                            style={{ backgroundColor: priorityColors[ticket.priority] }}
                        >
                            {ticket.priority}
                        </span>
                    </div>
                    <h3 className="ticket-title">{ticket.title}</h3>
                    <div className="ticket-meta">
                        <span className="assignee">{ticket.assignee}</span>
                        <span className="date">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default TicketList;

