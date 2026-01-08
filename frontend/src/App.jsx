import { useState, useEffect } from 'react';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import CreateTicketModal from './components/CreateTicketModal';
import { getTickets } from './api/tickets';
import './App.css';

function App() {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: 'all', priority: 'all' });

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await getTickets();
            setTickets(data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const filteredTickets = tickets.filter(ticket => {
        if (filter.status !== 'all' && ticket.status !== filter.status) return false;
        if (filter.priority !== 'all' && ticket.priority !== filter.priority) return false;
        return true;
    });

    const handleTicketCreated = (newTicket) => {
        setTickets([newTicket, ...tickets]);
        setShowCreateModal(false);
    };

    const handleTicketUpdated = (updatedTicket) => {
        setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
    };

    const handleTicketDeleted = (ticketId) => {
        setTickets(tickets.filter(t => t.id !== ticketId));
        setSelectedTicket(null);
    };

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content">
                    <h1>Boards</h1>
                </div>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                    New Work Item
                </button>
            </header>

            <main className="app-main">
                <aside className="sidebar">
                    <div className="filters">
                        <h3>Filters</h3>
                        <div className="filter-group">
                            <label>Status</label>
                            <select 
                                value={filter.status} 
                                onChange={(e) => setFilter({...filter, status: e.target.value})}
                            >
                                <option value="all">All</option>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Priority</label>
                            <select 
                                value={filter.priority} 
                                onChange={(e) => setFilter({...filter, priority: e.target.value})}
                            >
                                <option value="all">All</option>
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="stats">
                        <h3>Overview</h3>
                        <div className="stat-item">
                            <span className="stat-label">Total</span>
                            <span className="stat-value">{tickets.length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Open</span>
                            <span className="stat-value">{tickets.filter(t => t.status === 'Open').length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">In Progress</span>
                            <span className="stat-value">{tickets.filter(t => t.status === 'In Progress').length}</span>
                        </div>
                    </div>
                </aside>

                <section className="ticket-list-container">
                    {loading ? (
                        <div className="loading">Loading tickets...</div>
                    ) : (
                        <TicketList 
                            tickets={filteredTickets} 
                            selectedId={selectedTicket?.id}
                            onSelect={setSelectedTicket}
                        />
                    )}
                </section>

                <section className="ticket-detail-container">
                    {selectedTicket ? (
                        <TicketDetail 
                            ticket={selectedTicket}
                            onUpdate={handleTicketUpdated}
                            onDelete={handleTicketDeleted}
                            onClose={() => setSelectedTicket(null)}
                        />
                    ) : (
                        <div className="no-selection">
                            <div className="no-selection-content">
                                <p>Select a ticket to view details</p>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {showCreateModal && (
                <CreateTicketModal 
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleTicketCreated}
                />
            )}
        </div>
    );
}

export default App;
