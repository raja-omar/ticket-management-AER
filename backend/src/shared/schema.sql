-- =============================================
-- AER Service Desk - Azure SQL Database Schema
-- =============================================

-- Create database (run this separately if needed)
-- CREATE DATABASE AER;
-- GO
-- USE AER;
-- GO

-- =============================================
-- TICKETS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Tickets' AND xtype='U')
BEGIN
    CREATE TABLE Tickets (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        status NVARCHAR(50) NOT NULL DEFAULT 'Open',
        priority NVARCHAR(50) NOT NULL DEFAULT 'Medium',
        assignee NVARCHAR(255) NOT NULL DEFAULT 'Unassigned',
        createdAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        -- Indexes for common queries
        INDEX IX_Tickets_Status (status),
        INDEX IX_Tickets_Priority (priority),
        INDEX IX_Tickets_Assignee (assignee),
        INDEX IX_Tickets_CreatedAt (createdAt DESC)
    );
    PRINT 'Created Tickets table';
END
GO

-- =============================================
-- COMMENTS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Comments' AND xtype='U')
BEGIN
    CREATE TABLE Comments (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ticketId UNIQUEIDENTIFIER NOT NULL,
        author NVARCHAR(255) NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        createdAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        -- Foreign key to Tickets (with cascade delete)
        CONSTRAINT FK_Comments_Tickets 
            FOREIGN KEY (ticketId) 
            REFERENCES Tickets(id) 
            ON DELETE CASCADE,
        
        -- Index for querying comments by ticket
        INDEX IX_Comments_TicketId (ticketId),
        INDEX IX_Comments_CreatedAt (createdAt ASC)
    );
    PRINT 'Created Comments table';
END
GO

-- =============================================
-- ACTIVITIES TABLE (Audit Log)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Activities' AND xtype='U')
BEGIN
    CREATE TABLE Activities (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ticketId UNIQUEIDENTIFIER NOT NULL,
        type NVARCHAR(50) NOT NULL,
        actor NVARCHAR(255) NOT NULL DEFAULT 'System',
        description NVARCHAR(MAX),
        metadata NVARCHAR(MAX), -- JSON stored as string
        createdAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        -- Foreign key to Tickets (with cascade delete)
        CONSTRAINT FK_Activities_Tickets 
            FOREIGN KEY (ticketId) 
            REFERENCES Tickets(id) 
            ON DELETE CASCADE,
        
        -- Indexes for common queries
        INDEX IX_Activities_TicketId (ticketId),
        INDEX IX_Activities_Type (type),
        INDEX IX_Activities_CreatedAt (createdAt DESC)
    );
    PRINT 'Created Activities table';
END
GO

-- =============================================
-- OPTIONAL: Check constraint for valid status values
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Tickets_Status')
BEGIN
    ALTER TABLE Tickets
    ADD CONSTRAINT CK_Tickets_Status 
    CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed'));
    PRINT 'Added status check constraint';
END
GO

-- =============================================
-- OPTIONAL: Check constraint for valid priority values
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Tickets_Priority')
BEGIN
    ALTER TABLE Tickets
    ADD CONSTRAINT CK_Tickets_Priority 
    CHECK (priority IN ('Low', 'Medium', 'High', 'Critical'));
    PRINT 'Added priority check constraint';
END
GO

-- =============================================
-- OPTIONAL: Check constraint for valid activity types
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Activities_Type')
BEGIN
    ALTER TABLE Activities
    ADD CONSTRAINT CK_Activities_Type 
    CHECK (type IN ('TICKET_CREATED', 'TICKET_UPDATED', 'TICKET_DELETED', 'COMMENT_ADDED', 'COMMENT_DELETED'));
    PRINT 'Added activity type check constraint';
END
GO

PRINT 'Schema setup complete!';

