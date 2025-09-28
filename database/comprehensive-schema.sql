-- Comprehensive Konkani Language Platform Database Schema
-- Supports: Dictionary, ASR Training, WhatsApp Validation, Multi-Geography
-- Author: AI Assistant for Milind Kopikar
-- Date: September 28, 2025

-- Extensions for advanced functionality
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geographic data if needed

-- =====================================================
-- GEOGRAPHIC & REGIONAL MANAGEMENT
-- =====================================================

-- Geographic regions and their linguistic characteristics
CREATE TABLE geographic_regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Geographic identification
    region_name VARCHAR(100) NOT NULL,  -- "North Goa", "South Karnataka", etc.
    country VARCHAR(50) DEFAULT 'India',
    state_province VARCHAR(100),
    district VARCHAR(100),
    coordinates POINT, -- Geographic coordinates for mapping
    
    -- Linguistic characteristics
    dialect_code VARCHAR(20) UNIQUE NOT NULL, -- "NG_KON", "SK_KON", etc.
    primary_script VARCHAR(20) DEFAULT 'Devanagari', -- "Devanagari", "Roman", "Kannada"
    secondary_scripts TEXT[], -- Alternative scripts used
    linguistic_notes TEXT,
    phonetic_characteristics TEXT,
    
    -- Demographics and usage
    estimated_speakers INTEGER,
    speaker_density VARCHAR(20), -- "high", "medium", "low"
    urbanization_level VARCHAR(20), -- "urban", "semi-urban", "rural"
    literacy_rate DECIMAL(5,2),
    
    -- Language vitality
    vitality_status VARCHAR(30) DEFAULT 'stable', -- "thriving", "stable", "endangered", "critically_endangered"
    intergenerational_transmission BOOLEAN DEFAULT TRUE,
    
    -- System fields
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expert contributors with enhanced geographic and expertise mapping
CREATE TABLE expert_contributors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Personal information
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    whatsapp_number VARCHAR(20) UNIQUE,
    
    -- Geographic expertise
    primary_region_id UUID REFERENCES geographic_regions(id) NOT NULL,
    secondary_regions UUID[], -- Array of region IDs
    native_speaker BOOLEAN DEFAULT TRUE,
    years_in_region INTEGER,
    
    -- Expertise classification
    expertise_level VARCHAR(30) DEFAULT 'contributor', 
    -- Values: contributor, expert, senior_expert, regional_authority, linguistic_researcher
    specialization TEXT[], -- ['grammar', 'vocabulary', 'pronunciation', 'literature', 'folklore']
    academic_background TEXT,
    professional_experience TEXT,
    
    -- Validation authority in tiered system
    validation_tier INTEGER DEFAULT 1, -- 1=contributor, 2=expert, 3=authority, 4=final_validator
    can_validate_others BOOLEAN DEFAULT FALSE,
    max_validations_per_day INTEGER DEFAULT 10,
    
    -- Performance and reputation metrics
    total_contributions INTEGER DEFAULT 0,
    successful_validations INTEGER DEFAULT 0,
    disputed_validations INTEGER DEFAULT 0,
    validation_accuracy DECIMAL(5,2) DEFAULT 0.0, -- Calculated accuracy percentage
    average_response_time_hours DECIMAL(8,2),
    reputation_score INTEGER DEFAULT 100,
    community_rating DECIMAL(3,2) DEFAULT 5.0, -- 1-5 star rating from peers
    
    -- WhatsApp bot integration
    whatsapp_verified BOOLEAN DEFAULT FALSE,
    whatsapp_bot_session_id VARCHAR(100),
    preferred_communication_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50),
    availability_hours JSONB, -- {"monday": ["09:00", "17:00"], ...}
    
    -- ASR contribution tracking
    audio_contributions_count INTEGER DEFAULT 0,
    total_audio_duration_minutes INTEGER DEFAULT 0,
    audio_quality_average DECIMAL(3,2),
    
    -- System status
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP,
    last_validation_at TIMESTAMP
);

-- =====================================================
-- ENHANCED DICTIONARY MANAGEMENT
-- =====================================================

-- Main dictionary entries with comprehensive metadata
CREATE TABLE dictionary_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Original spreadsheet data preserved
    entry_number INTEGER,
    word_konkani_devanagari TEXT,
    word_konkani_english_alphabet TEXT NOT NULL,
    english_meaning TEXT NOT NULL,
    context_usage_sentence TEXT,
    
    -- Original correction flags from spreadsheet
    devanagari_needs_correction BOOLEAN DEFAULT FALSE,
    meaning_needs_correction BOOLEAN DEFAULT FALSE,
    corrected_devanagari_user_x TEXT,
    corrected_devanagari_user_y TEXT,
    corrected_meaning_user_x TEXT,
    corrected_meaning_user_y TEXT,
    
    -- Geographic and dialectal context
    primary_region_id UUID REFERENCES geographic_regions(id),
    regional_variations JSONB, -- {"NG_KON": {"spelling": "...", "pronunciation": "...", "usage": "..."}}
    cross_regional_usage BOOLEAN DEFAULT FALSE, -- Used across multiple regions
    
    -- Enhanced validation workflow
    validation_status VARCHAR(30) DEFAULT 'imported', 
    -- Values: imported, pending_review, expert_review, tier2_review, validated, disputed, archived
    current_validation_tier INTEGER DEFAULT 0,
    validation_confidence DECIMAL(5,2) DEFAULT 0.0,
    consensus_score DECIMAL(5,2) DEFAULT 0.0, -- Agreement among validators
    
    -- Linguistic classification
    part_of_speech VARCHAR(50),
    grammatical_gender VARCHAR(20), -- masculine, feminine, neuter
    word_class VARCHAR(50), -- native, borrowed, hybrid
    etymology TEXT,
    semantic_field VARCHAR(100), -- family, food, nature, etc.
    
    -- Usage characteristics
    frequency_rating VARCHAR(20) DEFAULT 'common', -- "very_common", "common", "uncommon", "rare", "archaic"  
    register VARCHAR(20) DEFAULT 'neutral', -- "formal", "informal", "literary", "colloquial", "religious"
    age_group_usage TEXT[], -- ["children", "adults", "elderly"]
    social_context VARCHAR(50), -- "general", "religious", "ceremonial", "professional"
    
    -- Audio and pronunciation
    has_audio_samples BOOLEAN DEFAULT FALSE,
    audio_samples_count INTEGER DEFAULT 0,
    ipa_transcription TEXT, -- International Phonetic Alphabet
    phonetic_variants JSONB, -- Regional pronunciation differences
    stress_pattern VARCHAR(50),
    
    -- Relationships to other words
    synonyms UUID[], -- Array of related entry IDs
    antonyms UUID[],
    related_words UUID[],
    compound_word_parts UUID[], -- If this is a compound word
    root_word_id UUID REFERENCES dictionary_entries(id),
    
    -- Version control and history
    version INTEGER DEFAULT 1,
    parent_entry_id UUID REFERENCES dictionary_entries(id),
    change_summary TEXT,
    major_revision BOOLEAN DEFAULT FALSE,
    
    -- Quality and reliability
    data_source VARCHAR(50) DEFAULT 'spreadsheet_import',
    source_reliability INTEGER DEFAULT 5, -- 1-10 scale
    peer_review_count INTEGER DEFAULT 0,
    citation_count INTEGER DEFAULT 0, -- How often referenced by others
    
    -- Usage analytics
    search_count INTEGER DEFAULT 0,
    last_searched_at TIMESTAMP,
    user_feedback_positive INTEGER DEFAULT 0,
    user_feedback_negative INTEGER DEFAULT 0,
    
    -- System fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP,
    last_modified_by UUID REFERENCES expert_contributors(id),
    
    -- Full-text search
    search_vector tsvector
);

-- =====================================================
-- WHATSAPP VALIDATION WORKFLOW
-- =====================================================

-- WhatsApp validation requests and expert workflow
CREATE TABLE validation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- What's being validated
    entry_id UUID REFERENCES dictionary_entries(id) NOT NULL,
    validation_type VARCHAR(30) NOT NULL, 
    -- Values: "spelling_devanagari", "spelling_roman", "meaning", "pronunciation", "context", "new_word", "deletion"
    
    -- Original and suggested changes
    field_name VARCHAR(50), -- Which database field is being changed
    original_value TEXT,
    suggested_value TEXT NOT NULL,
    change_reason TEXT,
    change_justification TEXT,
    
    -- Geographic and linguistic context
    region_id UUID REFERENCES geographic_regions(id) NOT NULL,
    dialect_specific BOOLEAN DEFAULT FALSE,
    affects_other_regions BOOLEAN DEFAULT FALSE,
    linguistic_notes TEXT,
    
    -- Assignment and workflow
    requested_by UUID REFERENCES expert_contributors(id),
    assigned_expert_id UUID REFERENCES expert_contributors(id),
    assignment_method VARCHAR(20) DEFAULT 'automatic', -- automatic, manual, escalated
    priority_level INTEGER DEFAULT 3, -- 1=urgent, 5=low priority
    
    -- WhatsApp integration
    whatsapp_thread_id VARCHAR(100),
    whatsapp_message_ids TEXT[], -- Array of related message IDs
    sent_to_whatsapp_at TIMESTAMP,
    expert_notified_at TIMESTAMP,
    
    -- Expert response
    expert_response VARCHAR(30), -- "approved", "rejected", "modified", "needs_clarification", "escalate"
    expert_comments TEXT,
    expert_suggested_alternative TEXT,
    expert_confidence_level INTEGER CHECK (expert_confidence_level BETWEEN 1 AND 5),
    response_time_minutes INTEGER,
    
    -- Escalation management
    escalation_required BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    escalated_to UUID REFERENCES expert_contributors(id),
    escalation_tier INTEGER DEFAULT 1,
    max_escalation_tier INTEGER DEFAULT 3,
    
    -- Community consensus (for disputed cases)
    additional_expert_opinions JSONB, -- [{"expert_id": "...", "opinion": "...", "confidence": 4}]
    community_vote_for INTEGER DEFAULT 0,
    community_vote_against INTEGER DEFAULT 0,
    consensus_reached BOOLEAN DEFAULT FALSE,
    
    -- Final resolution
    status VARCHAR(30) DEFAULT 'pending',
    -- Values: pending, assigned, in_review, approved, rejected, escalated, disputed, resolved, archived
    final_decision VARCHAR(30),
    resolved_by UUID REFERENCES expert_contributors(id),
    resolution_notes TEXT,
    implemented_in_dictionary BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP,
    responded_at TIMESTAMP,
    resolved_at TIMESTAMP,
    
    -- Performance tracking
    total_processing_time_hours DECIMAL(8,2)
);

-- =====================================================
-- ASR TRAINING DATA MANAGEMENT
-- =====================================================

-- Audio recordings for ASR model training
CREATE TABLE asr_audio_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Associated dictionary entry and text
    entry_id UUID REFERENCES dictionary_entries(id),
    text_content TEXT NOT NULL,
    text_normalized TEXT, -- Preprocessing for ML training
    text_phonetic TEXT, -- Phonetic representation
    sentence_type VARCHAR(30) DEFAULT 'word', -- "word", "phrase", "sentence", "paragraph"
    
    -- Audio file management
    audio_file_path VARCHAR(500) NOT NULL,
    cloud_storage_url VARCHAR(500),
    backup_storage_url VARCHAR(500),
    file_size_bytes BIGINT,
    checksum_md5 VARCHAR(32),
    
    -- Audio technical specifications
    duration_seconds DECIMAL(8,3) NOT NULL,
    sample_rate INTEGER DEFAULT 16000,
    bit_depth INTEGER DEFAULT 16,
    channels INTEGER DEFAULT 1, -- mono
    audio_format VARCHAR(10) DEFAULT 'wav',
    compression_codec VARCHAR(20),
    
    -- Speaker information
    speaker_id UUID REFERENCES expert_contributors(id) NOT NULL,
    speaker_gender VARCHAR(20),
    speaker_age_range VARCHAR(20), -- "18-25", "26-35", etc.
    speaker_education_level VARCHAR(30),
    native_speaker BOOLEAN DEFAULT TRUE,
    years_speaking_konkani INTEGER,
    
    -- Geographic and dialectal context
    region_id UUID REFERENCES geographic_regions(id) NOT NULL,
    recording_location VARCHAR(100),
    dialect_code VARCHAR(20),
    accent_notes TEXT,
    
    -- Recording environment and quality
    recording_device VARCHAR(100), -- "smartphone", "professional_mic", etc.
    recording_app VARCHAR(50), -- "whatsapp", "custom_app", etc.
    recording_environment VARCHAR(50), -- "quiet_room", "home", "outdoors", etc.
    background_noise_level VARCHAR(20), -- "none", "low", "medium", "high"
    audio_quality_score DECIMAL(3,2) CHECK (audio_quality_score BETWEEN 1.0 AND 5.0),
    technical_issues TEXT[], -- ["echo", "distortion", "background_music"]
    
    -- ML training metadata
    dataset_split VARCHAR(15) DEFAULT 'unassigned', -- "train", "validation", "test", "unassigned"
    training_weight DECIMAL(4,3) DEFAULT 1.0, -- Importance weighting for training
    data_augmentation_applied JSONB, -- Record of augmentations applied
    used_in_training_runs UUID[], -- Array of training run IDs that used this sample
    
    -- Transcription and validation
    auto_transcription TEXT, -- ASR-generated transcription
    human_verified_transcription TEXT, -- Human-corrected version
    transcription_accuracy DECIMAL(5,3), -- WER score if available
    transcription_verified BOOLEAN DEFAULT FALSE,
    transcription_verified_by UUID REFERENCES expert_contributors(id),
    
    -- WhatsApp integration
    whatsapp_message_id VARCHAR(100),
    whatsapp_thread_id VARCHAR(100),
    received_via_whatsapp BOOLEAN DEFAULT TRUE,
    whatsapp_metadata JSONB, -- Original message metadata
    
    -- Processing pipeline status
    preprocessing_status VARCHAR(20) DEFAULT 'pending',
    -- Values: pending, processing, processed, failed, archived
    preprocessing_errors TEXT[],
    feature_extraction_completed BOOLEAN DEFAULT FALSE,
    quality_control_passed BOOLEAN DEFAULT FALSE,
    
    -- Usage and analytics
    times_used_in_training INTEGER DEFAULT 0,
    contribution_to_model_accuracy DECIMAL(6,4), -- Measured impact on model performance
    flagged_for_review BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    
    -- System timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    last_used_in_training TIMESTAMP,
    verified_at TIMESTAMP
);

-- ASR model training runs and experiments
CREATE TABLE asr_training_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Model identification
    run_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50),
    experiment_description TEXT,
    base_model_name VARCHAR(100) DEFAULT 'ai4bharat/indicconformer_hi',
    base_model_language VARCHAR(10) DEFAULT 'marathi',
    training_framework VARCHAR(50) DEFAULT 'NeMo',
    framework_version VARCHAR(20),
    
    -- Training dataset composition
    total_audio_hours DECIMAL(10,2),
    total_training_samples INTEGER,
    total_validation_samples INTEGER,
    total_test_samples INTEGER,
    unique_speakers_count INTEGER,
    
    -- Geographic and dialectal distribution
    target_regions UUID[] NOT NULL, -- Array of region IDs
    regional_distribution JSONB, -- {"NG_KON": {"hours": 45.2, "samples": 1200}}
    dialect_balance_strategy VARCHAR(30) DEFAULT 'weighted', -- "equal", "weighted", "proportional"
    regional_weights JSONB, -- {"NG_KON": 0.4, "SK_KON": 0.6}
    
    -- Training configuration
    training_config JSONB NOT NULL, -- Complete NeMo configuration
    model_architecture VARCHAR(50),
    learning_rate DECIMAL(12,8),
    batch_size INTEGER,
    max_epochs INTEGER,
    early_stopping_patience INTEGER,
    optimizer VARCHAR(30),
    learning_rate_schedule VARCHAR(50),
    
    -- Data augmentation
    augmentation_strategies TEXT[], -- ["speed_perturbation", "noise_addition", "spectral_masking"]
    augmentation_parameters JSONB,
    
    -- Training progress and results
    epochs_completed INTEGER DEFAULT 0,
    training_loss_final DECIMAL(10,6),
    validation_loss_final DECIMAL(10,6),
    final_wer DECIMAL(6,3), -- Word Error Rate on test set
    final_cer DECIMAL(6,3), -- Character Error Rate on test set
    final_bleu_score DECIMAL(6,3), -- If applicable
    
    -- Performance breakdown
    regional_performance JSONB, -- {"NG_KON": {"wer": 0.15, "cer": 0.08, "samples": 300}}
    speaker_performance JSONB, -- Performance by speaker demographics
    phoneme_level_accuracy JSONB, -- Accuracy for specific Konkani phonemes
    
    -- Computational resources
    gpu_type VARCHAR(50),
    gpu_count INTEGER DEFAULT 1,
    total_training_time_minutes INTEGER,
    peak_memory_usage_gb DECIMAL(8,2),
    compute_cost_usd DECIMAL(10,2),
    
    -- Model artifacts and outputs
    model_checkpoint_path VARCHAR(500),
    final_model_path VARCHAR(500),
    tensorboard_logs_path VARCHAR(500),
    evaluation_reports_path VARCHAR(500),
    model_size_mb DECIMAL(10,2),
    
    -- Training status and monitoring
    status VARCHAR(30) DEFAULT 'pending',
    -- Values: pending, queued, training, evaluating, completed, failed, cancelled
    failure_reason TEXT,
    training_started_at TIMESTAMP,
    training_completed_at TIMESTAMP,
    
    -- Model deployment and usage
    deployed_to_production BOOLEAN DEFAULT FALSE,
    deployment_date TIMESTAMP,
    model_api_endpoint VARCHAR(300),
    usage_statistics JSONB, -- API calls, accuracy in production, etc.
    
    -- Research and collaboration
    research_notes TEXT,
    research_team_members TEXT[],
    related_publications TEXT[],
    experiment_hypothesis TEXT,
    results_summary TEXT,
    
    -- System fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES expert_contributors(id)
);

-- =====================================================
-- COMMUNITY AND COLLABORATION
-- =====================================================

-- Expert collaboration and peer review
CREATE TABLE expert_collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    primary_expert_id UUID REFERENCES expert_contributors(id),
    collaborating_expert_id UUID REFERENCES expert_contributors(id),
    collaboration_type VARCHAR(30), -- "peer_review", "joint_validation", "mentorship", "regional_coordination"
    
    -- Scope of collaboration
    regions_covered UUID[],
    specialization_areas TEXT[],
    
    -- Performance metrics
    joint_validations_count INTEGER DEFAULT 0,
    agreement_rate DECIMAL(5,2), -- How often they agree
    collaboration_quality_score DECIMAL(3,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, paused, ended
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

-- User feedback and community input (for web/app users)
CREATE TABLE community_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    entry_id UUID REFERENCES dictionary_entries(id),
    feedback_type VARCHAR(30), -- "correction_suggestion", "usage_example", "pronunciation_note", "rating"
    
    -- User information (can be anonymous)
    user_email VARCHAR(255),
    user_location VARCHAR(100),
    user_is_native_speaker BOOLEAN,
    
    -- Feedback content
    feedback_text TEXT,
    suggested_correction TEXT,
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
    
    -- Processing
    reviewed_by_expert BOOLEAN DEFAULT FALSE,
    expert_response TEXT,
    incorporated_into_dictionary BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ANALYTICS AND REPORTING
-- =====================================================

-- Platform usage analytics
CREATE TABLE usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event details
    event_type VARCHAR(50) NOT NULL, -- "dictionary_search", "validation_request", "audio_contribution"
    entity_type VARCHAR(30), -- "dictionary_entry", "validation_request", "audio_recording"
    entity_id UUID,
    
    -- User context
    user_id UUID, -- Could reference expert_contributors or be anonymous
    user_type VARCHAR(20), -- "expert", "contributor", "public_user", "api_client"
    user_location VARCHAR(100),
    region_context UUID REFERENCES geographic_regions(id),
    
    -- Usage details
    search_query TEXT,
    result_count INTEGER,
    interaction_duration_seconds INTEGER,
    success_indicator BOOLEAN,
    
    -- Technical context
    platform VARCHAR(20), -- "web", "mobile_app", "whatsapp_bot", "api"
    user_agent TEXT,
    ip_address INET,
    
    -- Performance metrics
    response_time_ms INTEGER,
    error_occurred BOOLEAN DEFAULT FALSE,
    error_type VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Dictionary entries indexes
CREATE INDEX idx_dictionary_entries_search_vector ON dictionary_entries USING gin(search_vector);
CREATE INDEX idx_dictionary_konkani_devanagari ON dictionary_entries USING gin(word_konkani_devanagari gin_trgm_ops);
CREATE INDEX idx_dictionary_konkani_english ON dictionary_entries USING gin(word_konkani_english_alphabet gin_trgm_ops);
CREATE INDEX idx_dictionary_english_meaning ON dictionary_entries USING gin(english_meaning gin_trgm_ops);
CREATE INDEX idx_dictionary_region ON dictionary_entries(primary_region_id);
CREATE INDEX idx_dictionary_validation_status ON dictionary_entries(validation_status);
CREATE INDEX idx_dictionary_entry_number ON dictionary_entries(entry_number);

-- Expert contributors indexes
CREATE INDEX idx_experts_whatsapp ON expert_contributors(whatsapp_number);
CREATE INDEX idx_experts_region ON expert_contributors(primary_region_id);
CREATE INDEX idx_experts_tier ON expert_contributors(validation_tier);
CREATE INDEX idx_experts_active ON expert_contributors(is_active);

-- Validation requests indexes
CREATE INDEX idx_validation_status ON validation_requests(status);
CREATE INDEX idx_validation_assigned_expert ON validation_requests(assigned_expert_id);
CREATE INDEX idx_validation_region ON validation_requests(region_id);
CREATE INDEX idx_validation_priority ON validation_requests(priority_level);
CREATE INDEX idx_validation_created_at ON validation_requests(created_at);

-- ASR audio recordings indexes
CREATE INDEX idx_audio_speaker ON asr_audio_recordings(speaker_id);
CREATE INDEX idx_audio_region ON asr_audio_recordings(region_id);
CREATE INDEX idx_audio_dataset_split ON asr_audio_recordings(dataset_split);
CREATE INDEX idx_audio_quality ON asr_audio_recordings(audio_quality_score);
CREATE INDEX idx_audio_verified ON asr_audio_recordings(transcription_verified);

-- Geographic regions indexes
CREATE INDEX idx_regions_dialect_code ON geographic_regions(dialect_code);
CREATE INDEX idx_regions_active ON geographic_regions(is_active);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Update search vector for dictionary entries
CREATE OR REPLACE FUNCTION update_dictionary_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.english_meaning, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.word_konkani_english_alphabet, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.word_konkani_devanagari, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.context_usage_sentence, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dictionary_search_vector_trigger
    BEFORE INSERT OR UPDATE ON dictionary_entries
    FOR EACH ROW EXECUTE FUNCTION update_dictionary_search_vector();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_dictionary_entries_updated_at
    BEFORE UPDATE ON dictionary_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_validation_requests_updated_at
    BEFORE UPDATE ON validation_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geographic_regions_updated_at
    BEFORE UPDATE ON geographic_regions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Track expert performance
CREATE OR REPLACE FUNCTION update_expert_stats() RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        UPDATE expert_contributors 
        SET 
            total_contributions = total_contributions + 1,
            last_validation_at = CURRENT_TIMESTAMP
        WHERE id = NEW.resolved_by;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expert_stats_trigger
    AFTER UPDATE ON validation_requests
    FOR EACH ROW EXECUTE FUNCTION update_expert_stats();

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert sample geographic regions
INSERT INTO geographic_regions (region_name, dialect_code, primary_script, country, state_province) VALUES
('North Goa', 'NG_KON', 'Devanagari', 'India', 'Goa'),
('South Goa', 'SG_KON', 'Devanagari', 'India', 'Goa'),
('North Karnataka', 'NK_KON', 'Kannada', 'India', 'Karnataka'),
('South Karnataka', 'SK_KON', 'Kannada', 'India', 'Karnataka'),
('Maharashtra Konkan', 'MH_KON', 'Devanagari', 'India', 'Maharashtra');

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active dictionary with regional context
CREATE VIEW active_dictionary_with_regions AS
SELECT 
    d.*,
    gr.region_name,
    gr.dialect_code,
    gr.primary_script,
    COUNT(vr.id) as pending_validations,
    COUNT(ar.id) as audio_samples
FROM dictionary_entries d
LEFT JOIN geographic_regions gr ON d.primary_region_id = gr.id
LEFT JOIN validation_requests vr ON d.id = vr.entry_id AND vr.status = 'pending'
LEFT JOIN asr_audio_recordings ar ON d.id = ar.entry_id
WHERE d.validation_status != 'archived'
GROUP BY d.id, gr.region_name, gr.dialect_code, gr.primary_script;

-- Expert performance dashboard
CREATE VIEW expert_performance_summary AS
SELECT 
    ec.*,
    gr.region_name as primary_region_name,
    COUNT(vr.id) as total_validation_requests,
    COUNT(CASE WHEN vr.status = 'resolved' THEN 1 END) as completed_validations,
    COUNT(CASE WHEN vr.status = 'pending' THEN 1 END) as pending_validations,
    AVG(vr.total_processing_time_hours) as avg_processing_time,
    COUNT(ar.id) as audio_contributions
FROM expert_contributors ec
LEFT JOIN geographic_regions gr ON ec.primary_region_id = gr.id
LEFT JOIN validation_requests vr ON ec.id = vr.assigned_expert_id
LEFT JOIN asr_audio_recordings ar ON ec.id = ar.speaker_id
GROUP BY ec.id, gr.region_name;

-- Regional language statistics
CREATE VIEW regional_language_stats AS
SELECT 
    gr.*,
    COUNT(DISTINCT de.id) as dictionary_entries_count,
    COUNT(DISTINCT ec.id) as expert_contributors_count,
    COUNT(DISTINCT ar.id) as audio_recordings_count,
    SUM(ar.duration_seconds)/3600 as total_audio_hours,
    AVG(de.validation_confidence) as avg_validation_confidence
FROM geographic_regions gr
LEFT JOIN dictionary_entries de ON gr.id = de.primary_region_id
LEFT JOIN expert_contributors ec ON gr.id = ec.primary_region_id
LEFT JOIN asr_audio_recordings ar ON gr.id = ar.region_id
GROUP BY gr.id;