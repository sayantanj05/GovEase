-- GovEase AI Database Schema Visualization
-- This SQL schema represents the logical data model for visualization purposes.
-- The production system uses MongoDB, but these tables illustrate entity
-- relationships, fields, and constraints for architecture and design review.

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Deleted')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
    admin_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    role VARCHAR(50) NOT NULL CHECK (role IN ('USER', 'ADMIN', 'CONTENT_MANAGER', 'VERIFICATION_MANAGER', 'SUPER_ADMIN')),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(255) REFERENCES users(user_id),
    UNIQUE(user_id, role)
);

-- ============================================
-- PROFILE MODULE
-- ============================================

CREATE TABLE profiles (
    profile_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(user_id),
    full_name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    category VARCHAR(50) CHECK (category IN ('General', 'OBC', 'SC', 'ST', 'EWS', 'Other')),
    income_range VARCHAR(50),
    disability_status VARCHAR(50) DEFAULT 'None',
    disability_percentage INTEGER CHECK (disability_percentage BETWEEN 0 AND 100),
    domicile_state VARCHAR(100),
    domicile_district VARCHAR(100),
    completeness_score INTEGER DEFAULT 0 CHECK (completeness_score BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
    address_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    pin_code VARCHAR(10) NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE identities (
    identity_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    id_type VARCHAR(20) NOT NULL CHECK (id_type IN ('Aadhaar', 'PAN', 'Other')),
    id_number_encrypted TEXT NOT NULL,
    masked_number VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE education (
    education_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    qualification VARCHAR(100) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    board_university VARCHAR(255),
    course VARCHAR(255),
    specialization VARCHAR(255),
    passing_year INTEGER CHECK (passing_year BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE) + 10),
    percentage_cgpa DECIMAL(5,2),
    subjects JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE experience (
    experience_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    employment_status VARCHAR(50) NOT NULL,
    organization VARCHAR(255),
    role VARCHAR(255),
    start_date DATE,
    end_date DATE,
    duration_months INTEGER GENERATED ALWAYS AS (
        CASE
            WHEN end_date IS NOT NULL THEN
                EXTRACT(YEAR FROM end_date) * 12 + EXTRACT(MONTH FROM end_date) -
                (EXTRACT(YEAR FROM start_date) * 12 + EXTRACT(MONTH FROM start_date))
            ELSE NULL
        END
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
    skill_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    skill_type VARCHAR(50) NOT NULL CHECK (skill_type IN ('Technical', 'Soft', 'Language', 'Certification')),
    name VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DOCUMENT VAULT
-- ============================================

CREATE TABLE documents (
    document_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    checksum CHAR(64) NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'Unverified' CHECK (verification_status IN ('Unverified', 'Pending', 'Verified', 'Rejected')),
    verified_by VARCHAR(255) REFERENCES users(user_id),
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE document_versions (
    version_id VARCHAR(255) PRIMARY KEY,
    document_id VARCHAR(255) NOT NULL REFERENCES documents(document_id),
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    checksum CHAR(64) NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- OPPORTUNITIES
-- ============================================

CREATE TABLE opportunities (
    opportunity_id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    opportunity_type VARCHAR(50) NOT NULL CHECK (opportunity_type IN ('Job', 'Internship', 'Scholarship', 'Scheme', 'Fellowship', 'Training', 'Exam', 'Other')),
    description TEXT,
    location VARCHAR(255),
    work_model VARCHAR(20) CHECK (work_model IN ('Remote', 'Hybrid', 'On-site')),
    min_age INTEGER,
    max_age INTEGER,
    educational_qualifications JSONB,
    required_skills JSONB,
    experience_required JSONB,
    category_requirements JSONB,
    income_requirements JSONB,
    disability_requirements JSONB,
    domicile_requirements JSONB,
    application_start_date TIMESTAMP,
    application_deadline TIMESTAMP,
    exam_date TIMESTAMP,
    interview_date TIMESTAMP,
    document_verification_date TIMESTAMP,
    result_date TIMESTAMP,
    official_application_url TEXT,
    required_documents JSONB,
    eligibility_rules JSONB NOT NULL,
    source VARCHAR(50) NOT NULL CHECK (source IN ('OFFICIAL_API', 'GOVERNMENT_WEBSITE', 'ADMIN_INPUT', 'PARTNER_API')),
    source_url TEXT NOT NULL,
    last_verified_at TIMESTAMP,
    verification_status VARCHAR(20) DEFAULT 'Unverified' CHECK (verification_status IN ('Unverified', 'Verified', 'Stale', 'Disputed')),
    status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Closed', 'Expired', 'Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- EXAMS
-- ============================================

CREATE TABLE exams (
    exam_id VARCHAR(255) PRIMARY KEY,
    exam_name VARCHAR(500) NOT NULL,
    exam_body VARCHAR(255) NOT NULL,
    exam_category VARCHAR(100) CHECK (exam_category IN ('Civil Services', 'SSC', 'Banking', 'Railway', 'Defence', 'Police', 'Teaching', 'State PSC', 'PSU', 'Other')),
    exam_type VARCHAR(100) CHECK (exam_type IN ('Preliminary', 'Mains', 'Interview', 'Physical Test', 'Skill Test', 'Document Verification', 'Other')),
    exam_mode VARCHAR(50) CHECK (exam_mode IN ('Online', 'Offline', 'Hybrid')),
    total_vacancies INTEGER,
    application_fee DECIMAL(10,2),
    subjects JSONB,
    total_marks INTEGER,
    duration_minutes INTEGER,
    negative_marking BOOLEAN DEFAULT FALSE,
    negative_marking_value DECIMAL(5,2),
    cutoff_marks INTEGER,
    number_of_attempts_allowed INTEGER,
    age_relaxation JSONB,
    educational_qualifications JSONB,
    physical_requirements JSONB,
    application_start_date TIMESTAMP,
    application_deadline TIMESTAMP,
    exam_date TIMESTAMP,
    result_date TIMESTAMP,
    score_validity_years INTEGER,
    official_website TEXT,
    eligibility_rules JSONB NOT NULL,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Active', 'Closed', 'Expired', 'Cancelled')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ELIGIBILITY ENGINE
-- ============================================

CREATE TABLE eligibility_checks (
    check_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    exam_id VARCHAR(255) REFERENCES exams(exam_id),
    opportunity_id VARCHAR(255) REFERENCES opportunities(opportunity_id),
    result VARCHAR(50) NOT NULL CHECK (result IN ('Eligible', 'Probably Eligible', 'Not Eligible', 'Insufficient Information', 'Requires Manual Verification')),
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    explanations JSONB NOT NULL,
    missing_fields JSONB,
    rule_snapshot JSONB NOT NULL,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE eligibility_rules (
    rule_id VARCHAR(255) PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    field VARCHAR(100) NOT NULL,
    operator VARCHAR(50) NOT NULL,
    params JSONB NOT NULL,
    failure_message TEXT,
    required BOOLEAN DEFAULT TRUE,
    rule_version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- RECOMMENDATIONS
-- ============================================

CREATE TABLE recommendation_events (
    event_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    opportunity_id VARCHAR(255) NOT NULL REFERENCES opportunities(opportunity_id),
    score DECIMAL(3,2) CHECK (score BETWEEN 0 AND 1),
    reasons JSONB,
    model_version VARCHAR(50),
    feature_version VARCHAR(50),
    interaction_type VARCHAR(50) CHECK (interaction_type IN ('impression', 'click', 'save', 'apply', 'dismiss')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- APPLICATIONS
-- ============================================

CREATE TABLE applications (
    application_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    opportunity_id VARCHAR(255) NOT NULL REFERENCES opportunities(opportunity_id),
    application_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Selected', 'Expired', 'Withdrawn')),
    form_data JSONB,
    documents JSONB,
    official_portal_url TEXT,
    notes TEXT,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE application_status_history (
    history_id VARCHAR(255) PRIMARY KEY,
    application_id VARCHAR(255) NOT NULL REFERENCES applications(application_id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(50) CHECK (changed_by IN ('user', 'system', 'admin')),
    notes TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_opportunities (
    saved_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    opportunity_id VARCHAR(255) NOT NULL REFERENCES opportunities(opportunity_id),
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, opportunity_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    notification_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('DEADLINE', 'STATUS', 'REMINDER', 'SYSTEM')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('EMAIL', 'WHATSAPP', 'PUSH', 'IN_APP')),
    read BOOLEAN DEFAULT FALSE,
    scheduled_at TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    delivery_status VARCHAR(20) DEFAULT 'queued' CHECK (delivery_status IN ('queued', 'sent', 'delivered', 'failed', 'bounced')),
    idempotency_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_preferences (
    preference_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(user_id),
    deadline_reminders BOOLEAN DEFAULT TRUE,
    status_updates BOOLEAN DEFAULT TRUE,
    new_opportunities BOOLEAN DEFAULT TRUE,
    document_expiry BOOLEAN DEFAULT TRUE,
    channels JSONB NOT NULL,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER PREFERENCES
-- ============================================

CREATE TABLE user_preferences (
    preference_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(user_id),
    preferred_languages JSONB DEFAULT '["en"]',
    notification_channels JSONB DEFAULT '["in_app", "email"]',
    location_preferences JSONB,
    opportunity_type_preferences JSONB,
    salary_range_min INTEGER,
    salary_range_max INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUDIT & COMPLIANCE
-- ============================================

CREATE TABLE audit_logs (
    log_id VARCHAR(255) PRIMARY KEY,
    actor_id VARCHAR(255) REFERENCES users(user_id),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100),
    target_id VARCHAR(255),
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);

-- Profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_category ON profiles(category);
CREATE INDEX idx_profiles_completeness ON profiles(completeness_score);

-- Documents
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_verification_status ON documents(verification_status);
CREATE INDEX idx_documents_expires_at ON documents(expires_at);

-- Opportunities
CREATE INDEX idx_opportunities_type ON opportunities(opportunity_type);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_deadline ON opportunities(application_deadline);
CREATE INDEX idx_opportunities_location ON opportunities(location);
CREATE INDEX idx_opportunities_source ON opportunities(source);
CREATE INDEX idx_opportunities_verification_status ON opportunities(verification_status);

-- Exams
CREATE INDEX idx_exams_exam_body ON exams(exam_body);
CREATE INDEX idx_exams_exam_category ON exams(exam_category);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_exam_date ON exams(exam_date);
CREATE INDEX idx_exams_application_deadline ON exams(application_deadline);
CREATE INDEX idx_exams_notification_sent ON exams(notification_sent);

-- Applications
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_opportunity_id ON applications(opportunity_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX idx_notifications_delivery_status ON notifications(delivery_status);

-- Audit logs
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Eligibility checks
CREATE INDEX idx_eligibility_checks_user_id ON eligibility_checks(user_id);
CREATE INDEX idx_eligibility_checks_opportunity_id ON eligibility_checks(opportunity_id);
CREATE INDEX idx_eligibility_checks_result ON eligibility_checks(result);

-- Recommendations
CREATE INDEX idx_recommendation_events_user_id ON recommendation_events(user_id);
CREATE INDEX idx_recommendation_events_created_at ON recommendation_events(created_at);

-- ============================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ============================================

-- Insert a test user
-- INSERT INTO users (user_id, email, password_hash, email_verified) VALUES
-- ('550e8400-e29b-41d4-a716-446655440000', 'test@govease.ai', '$2b$10$...', TRUE);

-- Insert a test opportunity
-- INSERT INTO opportunities (opportunity_id, title, organization, opportunity_type, description, application_deadline, source, source_url, eligibility_rules, status) VALUES
-- ('660e8400-e29b-41d4-a716-446655440001', 'Sample Scholarship', 'Government of India', 'Scholarship', 'Description here', '2026-12-31T23:59:59Z', 'GOVERNMENT_WEBSITE', 'https://example.com', '{}', 'Active');

-- ============================================
-- ENTITY RELATIONSHIP SUMMARY
-- ============================================
-- users 1--1 profiles
-- users 1--* addresses
-- users 1--* identities
-- users 1--* education
-- users 1--* experience
-- users 1--* skills
-- users 1--* documents
-- documents 1--* document_versions
-- users 1--* applications
-- opportunities 1--* applications
-- opportunities 1--* eligibility_checks
-- exams 1--* eligibility_checks
-- users 1--* eligibility_checks
-- users 1--* recommendation_events
-- opportunities 1--* recommendation_events
-- users 1--* notifications
-- users 1--* saved_opportunities
-- opportunities 1--* saved_opportunities
-- users 1--* audit_logs (as actor)
-- applications 1--* application_status_history
