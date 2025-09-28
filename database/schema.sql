-- Amchigale Konkani Dictionary Database Schema
-- Supports multilingual entries, crowdsourcing, and version control

-- Extensions for better text search and UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- CORE DICTIONARY TABLES
-- =====================================================

-- Main dictionary entries table (matches your spreadsheet structure)
CREATE TABLE dictionary_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Core word data (matching your spreadsheet columns)
    entry_number INTEGER UNIQUE,                    -- "Number" column from spreadsheet
    word_konkani_devanagari TEXT,                   -- "Konkani Word in Devnagiri"
    word_konkani_english_alphabet TEXT,             -- "Konkani word in English alphabet"
    english_meaning TEXT NOT NULL,                  -- "English Meaning"
    context_usage_sentence TEXT,                    -- "Context/usage in a sentence"
    
    -- Correction flags from spreadsheet
    devanagari_needs_correction BOOLEAN DEFAULT FALSE,  -- "Does the Devnagiri Spelling need correction? (Y/N)"
    meaning_needs_correction BOOLEAN DEFAULT FALSE,     -- "Does the meaning need correction? (Y/N)"
    
    -- User corrections (supporting multiple users as per your columns)
    corrected_devanagari_user_x TEXT,              -- "Corrected Devnagiri Spelling by user X"
    corrected_devanagari_user_y TEXT,              -- "Corrected Devnagiri Spelling by user Y"
    corrected_meaning_user_x TEXT,                 -- "Corrected English meaning by user X"
    corrected_meaning_user_y TEXT,                 -- "Corrected English meaning by user Y"
    
    -- Additional metadata for future expansion
    part_of_speech VARCHAR(50),                    -- For linguistic categorization
    dialect_region VARCHAR(100),                   -- Goa, Karnataka, etc.
    usage_frequency VARCHAR(20),                   -- common, uncommon, rare
    
    -- Administrative fields
    status VARCHAR(20) DEFAULT 'active',           -- active, under_review, archived
    data_source VARCHAR(50) DEFAULT 'spreadsheet', -- spreadsheet, user_submission, verified
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Full-text search optimization
    search_vector tsvector
);

-- User corrections and submissions (extends your crowdsourcing workflow)
CREATE TABLE user_corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference to original dictionary entry
    entry_id UUID REFERENCES dictionary_entries(id) NOT NULL,
    
    -- What field is being corrected
    correction_type VARCHAR(30) NOT NULL,   -- 'devanagari_spelling', 'english_meaning', 'context_sentence', 'new_word'
    
    -- Original and corrected values
    original_value TEXT,
    corrected_value TEXT NOT NULL,
    correction_reason TEXT,
    
    -- User information
    user_identifier VARCHAR(10),            -- 'user_x', 'user_y', 'user_z', etc.
    submitter_email VARCHAR(255),
    submitter_name VARCHAR(100),
    submitter_location VARCHAR(100),        -- For tracking dialect variations
    
    -- Validation and consensus
    confidence_level INTEGER DEFAULT 50,    -- How confident is the user (0-100)
    votes_for INTEGER DEFAULT 0,            -- Community voting
    votes_against INTEGER DEFAULT 0,
    verification_status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected, disputed
    
    -- Administrative
    verified_by VARCHAR(255),               -- Admin who verified this correction
    verification_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- New word submissions (for words not in original spreadsheet)
CREATE TABLE new_word_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Word data
    word_konkani_devanagari TEXT,
    word_konkani_english_alphabet TEXT NOT NULL,
    english_meaning TEXT NOT NULL,
    context_usage_sentence TEXT,
    
    -- Submission metadata
    part_of_speech VARCHAR(50),
    dialect_region VARCHAR(100),
    
    -- Submitter information
    submitter_email VARCHAR(255),
    submitter_name VARCHAR(100),
    submitter_location VARCHAR(100),
    
    -- Review workflow
    status VARCHAR(20) DEFAULT 'pending',   -- pending, approved, rejected, merged_to_dictionary
    reviewed_by VARCHAR(255),
    review_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- User management for the platform
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    
    -- Role-based access
    role VARCHAR(20) DEFAULT 'contributor',  -- contributor, moderator, admin
    
    -- Profile
    location VARCHAR(100),                   -- For understanding dialect context
    native_speaker BOOLEAN DEFAULT FALSE,
    contribution_count INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 0,
    
    -- Authentication (simplified for now)
    password_hash TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- =====================================================
-- LINGUISTIC METADATA TABLES
-- =====================================================

-- Parts of speech reference
CREATE TABLE parts_of_speech (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    konkani_term VARCHAR(100)  -- Konkani term for this grammatical concept
);

-- Dialectal variations
CREATE TABLE dialect_variations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES dictionary_entries(id),
    
    dialect_region VARCHAR(100),            -- Goa, Karnataka, Maharashtra, etc.
    variant_devanagari TEXT,
    variant_roman TEXT,
    variant_pronunciation TEXT,
    
    usage_frequency VARCHAR(20),            -- common, uncommon, rare
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ANALYTICS AND USAGE TRACKING
-- =====================================================

-- Search analytics for improving the system
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    search_query TEXT NOT NULL,
    search_type VARCHAR(20),                -- exact, fuzzy, semantic
    results_count INTEGER,
    clicked_result_id UUID,
    
    -- User context
    user_ip INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    
    -- Performance metrics
    search_duration_ms INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Full-text search indexes (updated for new column names)
CREATE INDEX idx_dictionary_search_vector ON dictionary_entries USING gin(search_vector);
CREATE INDEX idx_dictionary_konkani_devanagari ON dictionary_entries USING gin(word_konkani_devanagari gin_trgm_ops);
CREATE INDEX idx_dictionary_konkani_english ON dictionary_entries USING gin(word_konkani_english_alphabet gin_trgm_ops);
CREATE INDEX idx_dictionary_english_meaning ON dictionary_entries USING gin(english_meaning gin_trgm_ops);
CREATE INDEX idx_dictionary_entry_number ON dictionary_entries(entry_number);

-- Status and workflow indexes
CREATE INDEX idx_dictionary_status ON dictionary_entries(status);
CREATE INDEX idx_submissions_status ON entry_submissions(status);
CREATE INDEX idx_submissions_type ON entry_submissions(submission_type);

-- Foreign key indexes
CREATE INDEX idx_submissions_original_entry ON entry_submissions(original_entry_id);
CREATE INDEX idx_dialect_variations_entry ON dialect_variations(entry_id);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update the search vector (updated for new column names)
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.english_meaning, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.word_konkani_english_alphabet, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.word_konkani_devanagari, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.context_usage_sentence, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
CREATE TRIGGER update_dictionary_search_vector
    BEFORE INSERT OR UPDATE ON dictionary_entries
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_dictionary_entries_updated_at
    BEFORE UPDATE ON dictionary_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entry_submissions_updated_at
    BEFORE UPDATE ON entry_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA FOR PARTS OF SPEECH
-- =====================================================

INSERT INTO parts_of_speech (name, description, konkani_term) VALUES
('noun', 'A person, place, thing, or idea', 'नाम'),
('verb', 'An action or state of being', 'क्रियापद'),
('adjective', 'Describes a noun', 'विशेषण'),
('adverb', 'Describes a verb, adjective, or other adverb', 'क्रियाविशेषण'),
('pronoun', 'Replaces a noun', 'सर्वनाम'),
('preposition', 'Shows relationship between words', 'परसर्ग'),
('conjunction', 'Connects words or phrases', 'योजक'),
('interjection', 'Expresses emotion', 'उद्गार');

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active dictionary entries with full context
CREATE VIEW active_dictionary AS
SELECT 
    d.*,
    pos.name as part_of_speech_name,
    COUNT(ds.id) as submission_count,
    AVG(ds.confidence_level) as avg_submission_confidence
FROM dictionary_entries d
LEFT JOIN parts_of_speech pos ON d.part_of_speech = pos.name
LEFT JOIN entry_submissions ds ON d.id = ds.original_entry_id
WHERE d.status = 'verified'
GROUP BY d.id, pos.name;

-- Pending submissions for review
CREATE VIEW pending_submissions AS
SELECT 
    s.*,
    d.word_english as original_word_english,
    d.word_konkani_roman as original_word_konkani_roman,
    u.name as submitter_name,
    u.reputation_score as submitter_reputation
FROM entry_submissions s
LEFT JOIN dictionary_entries d ON s.original_entry_id = d.id
LEFT JOIN users u ON s.submitter_email = u.email
WHERE s.status = 'pending'
ORDER BY s.created_at ASC;