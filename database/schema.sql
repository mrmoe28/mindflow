-- MindFlow Database Schema
-- PostgreSQL database schema for storing mind maps, nodes, and edges

-- Mind Maps table
CREATE TABLE IF NOT EXISTS mind_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Untitled Map',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_dark_mode BOOLEAN DEFAULT false,
    user_id VARCHAR(255), -- Optional: for future user authentication
    CONSTRAINT mind_maps_name_check CHECK (char_length(name) > 0)
);

-- Nodes table
CREATE TABLE IF NOT EXISTS nodes (
    id VARCHAR(255) NOT NULL,
    mind_map_id UUID NOT NULL REFERENCES mind_maps(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'mindMap',
    label TEXT NOT NULL,
    position_x DOUBLE PRECISION NOT NULL,
    position_y DOUBLE PRECISION NOT NULL,
    width DOUBLE PRECISION,
    height DOUBLE PRECISION,
    parent_id VARCHAR(255),
    deletable BOOLEAN DEFAULT true,
    
    -- Style data (JSONB for flexibility)
    style JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata (JSONB for flexibility)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id, mind_map_id),
    CONSTRAINT nodes_parent_fk FOREIGN KEY (parent_id, mind_map_id) 
        REFERENCES nodes(id, mind_map_id) ON DELETE SET NULL
);

-- Edges table
CREATE TABLE IF NOT EXISTS edges (
    id VARCHAR(255) PRIMARY KEY,
    mind_map_id UUID NOT NULL REFERENCES mind_maps(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'floating',
    animated BOOLEAN DEFAULT false,
    source_handle VARCHAR(255),
    target_handle VARCHAR(255),
    style JSONB DEFAULT '{}'::jsonb,
    marker_end JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT edges_source_fk FOREIGN KEY (source, mind_map_id) 
        REFERENCES nodes(id, mind_map_id) ON DELETE CASCADE,
    CONSTRAINT edges_target_fk FOREIGN KEY (target, mind_map_id) 
        REFERENCES nodes(id, mind_map_id) ON DELETE CASCADE,
    CONSTRAINT edges_mind_map_fk FOREIGN KEY (mind_map_id) 
        REFERENCES mind_maps(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_nodes_mind_map_id ON nodes(mind_map_id);
CREATE INDEX IF NOT EXISTS idx_nodes_parent_id ON nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_edges_mind_map_id ON edges(mind_map_id);
CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target);
CREATE INDEX IF NOT EXISTS idx_mind_maps_updated_at ON mind_maps(updated_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_mind_maps_updated_at 
    BEFORE UPDATE ON mind_maps 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nodes_updated_at 
    BEFORE UPDATE ON nodes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

