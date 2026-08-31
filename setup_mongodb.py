"""
GovEase AI - MongoDB Collection Setup Script
Reads MONGO_URI and MONGO_DB_NAME from Backend_Node.js/.env
and creates all required collections with indexes in MongoDB.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import pymongo
from pymongo.errors import ConnectionFailure, CollectionInvalid, OperationFailure

# --- Load .env from Backend_Node.js directory ---
DOTENV_PATH = Path(__file__).parent / "Backend_Node.js" / ".env"
if not DOTENV_PATH.exists():
    DOTENV_PATH = Path(".") / "Backend_Node.js" / ".env"
if not DOTENV_PATH.exists():
    DOTENV_PATH = Path(".env")

load_dotenv(DOTENV_PATH)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB_NAME", "GovEase")

# --- Collection definitions based on schema.sql ---
collections = {
    "users": [
        {"keys": [("email", 1)], "name": "idx_users_email", "unique": True},
        {"keys": [("phone", 1)], "name": "idx_users_phone", "unique": True, "sparse": True},
        {"keys": [("status", 1)], "name": "idx_users_status"},
    ],
    "admin_users": [
        {"keys": [("user_id", 1)], "name": "idx_admin_users_user_id"},
        {"keys": [("role", 1)], "name": "idx_admin_users_role"},
    ],
    "profiles": [
        {"keys": [("user_id", 1)], "name": "idx_profiles_user_id", "unique": True},
        {"keys": [("category", 1)], "name": "idx_profiles_category"},
        {"keys": [("completeness_score", 1)], "name": "idx_profiles_completeness"},
    ],
    "addresses": [
        {"keys": [("user_id", 1)], "name": "idx_addresses_user_id"},
        {"keys": [("is_primary", 1)], "name": "idx_addresses_primary"},
    ],
    "identities": [
        {"keys": [("user_id", 1)], "name": "idx_identities_user_id"},
        {"keys": [("id_type", 1)], "name": "idx_identities_type"},
        {"keys": [("verified", 1)], "name": "idx_identities_verified"},
    ],
    "education": [
        {"keys": [("user_id", 1)], "name": "idx_education_user_id"},
        {"keys": [("passing_year", 1)], "name": "idx_education_year"},
    ],
    "experience": [
        {"keys": [("user_id", 1)], "name": "idx_experience_user_id"},
        {"keys": [("start_date", 1)], "name": "idx_experience_start"},
    ],
    "skills": [
        {"keys": [("user_id", 1)], "name": "idx_skills_user_id"},
        {"keys": [("skill_type", 1)], "name": "idx_skills_type"},
    ],
    "documents": [
        {"keys": [("user_id", 1)], "name": "idx_documents_user_id"},
        {"keys": [("type", 1)], "name": "idx_documents_type"},
        {"keys": [("verification_status", 1)], "name": "idx_documents_verification_status"},
        {"keys": [("expires_at", 1)], "name": "idx_documents_expires_at"},
        {"keys": [("is_deleted", 1)], "name": "idx_documents_deleted"},
    ],
    "document_versions": [
        {"keys": [("document_id", 1)], "name": "idx_doc_versions_document_id"},
    ],
    "opportunities": [
        {"keys": [("opportunity_type", 1)], "name": "idx_opportunities_type"},
        {"keys": [("status", 1)], "name": "idx_opportunities_status"},
        {"keys": [("application_deadline", 1)], "name": "idx_opportunities_deadline"},
        {"keys": [("location", 1)], "name": "idx_opportunities_location"},
        {"keys": [("source", 1)], "name": "idx_opportunities_source"},
        {"keys": [("verification_status", 1)], "name": "idx_opportunities_verification_status"},
        {"keys": [("category", 1)], "name": "idx_opportunities_category"},
        {"keys": [("min_age", 1), ("max_age", 1)], "name": "idx_opportunities_age_range"},
    ],
    "exams": [
        {"keys": [("exam_body", 1)], "name": "idx_exams_exam_body"},
        {"keys": [("exam_category", 1)], "name": "idx_exams_exam_category"},
        {"keys": [("status", 1)], "name": "idx_exams_status"},
        {"keys": [("exam_date", 1)], "name": "idx_exams_exam_date"},
        {"keys": [("application_deadline", 1)], "name": "idx_exams_application_deadline"},
        {"keys": [("notification_sent", 1)], "name": "idx_exams_notification_sent"},
        {"keys": [("is_active", 1)], "name": "idx_exams_is_active"},
    ],
    "eligibility_checks": [
        {"keys": [("user_id", 1)], "name": "idx_eligibility_checks_user_id"},
        {"keys": [("opportunity_id", 1)], "name": "idx_eligibility_checks_opportunity_id"},
        {"keys": [("exam_id", 1)], "name": "idx_eligibility_checks_exam_id"},
        {"keys": [("result", 1)], "name": "idx_eligibility_checks_result"},
        {"keys": [("evaluated_at", 1)], "name": "idx_eligibility_checks_evaluated_at"},
    ],
    "eligibility_rules": [
        {"keys": [("is_active", 1)], "name": "idx_eligibility_rules_active"},
        {"keys": [("rule_name", 1)], "name": "idx_eligibility_rules_name"},
    ],
    "recommendation_events": [
        {"keys": [("user_id", 1)], "name": "idx_recommendations_user_id"},
        {"keys": [("opportunity_id", 1)], "name": "idx_recommendations_opportunity_id"},
        {"keys": [("created_at", 1)], "name": "idx_recommendations_created_at"},
        {"keys": [("interaction_type", 1)], "name": "idx_recommendations_interaction"},
    ],
    "applications": [
        {"keys": [("user_id", 1)], "name": "idx_applications_user_id"},
        {"keys": [("opportunity_id", 1)], "name": "idx_applications_opportunity_id"},
        {"keys": [("status", 1)], "name": "idx_applications_status"},
        {"keys": [("created_at", 1)], "name": "idx_applications_created_at"},
        {"keys": [("submitted_at", 1)], "name": "idx_applications_submitted_at"},
    ],
    "application_status_history": [
        {"keys": [("application_id", 1)], "name": "idx_status_history_application_id"},
        {"keys": [("changed_at", 1)], "name": "idx_status_history_changed_at"},
    ],
    "saved_opportunities": [
        {"keys": [("user_id", 1)], "name": "idx_saved_opps_user_id"},
        {"keys": [("opportunity_id", 1)], "name": "idx_saved_opps_opportunity_id"},
        {"keys": [("saved_at", 1)], "name": "idx_saved_opps_saved_at"},
    ],
    "notifications": [
        {"keys": [("user_id", 1)], "name": "idx_notifications_user_id"},
        {"keys": [("read", 1)], "name": "idx_notifications_read"},
        {"keys": [("scheduled_at", 1)], "name": "idx_notifications_scheduled_at"},
        {"keys": [("delivery_status", 1)], "name": "idx_notifications_delivery_status"},
        {"keys": [("type", 1)], "name": "idx_notifications_type"},
        {"keys": [("channel", 1)], "name": "idx_notifications_channel"},
        {"keys": [("idempotency_key", 1)], "name": "idx_notifications_idempotency", "unique": True, "sparse": True},
    ],
    "notification_preferences": [
        {"keys": [("user_id", 1)], "name": "idx_notification_prefs_user_id", "unique": True},
    ],
    "user_preferences": [
        {"keys": [("user_id", 1)], "name": "idx_user_prefs_user_id", "unique": True},
    ],
    "audit_logs": [
        {"keys": [("actor_id", 1)], "name": "idx_audit_logs_actor_id"},
        {"keys": [("action", 1)], "name": "idx_audit_logs_action"},
        {"keys": [("created_at", 1)], "name": "idx_audit_logs_created_at"},
        {"keys": [("target_entity", 1)], "name": "idx_audit_logs_target_entity"},
    ],
}

def main():
    # Set encoding for Windows
    os.environ["PYTHONIOENCODING"] = "utf-8"
    
    if not MONGO_URI:
        print("ERROR: MONGO_URI not found in .env file!")
        sys.exit(1)
    if not DB_NAME:
        print("ERROR: MONGO_DB_NAME not found in .env file!")
        sys.exit(1)

    print(f"Connecting to MongoDB database: {DB_NAME}")
    print(f"Using URI: {MONGO_URI[:50]}...")

    try:
        client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
        client.admin.command("ping")
        print("[OK] Connected to MongoDB successfully!")
    except ConnectionFailure as e:
        print(f"[FAIL] Failed to connect to MongoDB: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"[FAIL] Error connecting to MongoDB: {e}")
        sys.exit(1)

    db = client[DB_NAME]
    created_count = 0
    already_exists = []
    index_count = 0

    for coll_name, indexes in collections.items():
        try:
            db.create_collection(coll_name)
            print(f"  [OK] Created collection: {coll_name}")
            created_count += 1
        except (CollectionInvalid, OperationFailure) as e:
            if "already exists" in str(e).lower() or "existing" in str(e).lower():
                print(f"  [--] Collection already exists: {coll_name}")
                already_exists.append(coll_name)
            else:
                print(f"  [!] Error creating collection '{coll_name}': {e}")
                continue

        # Create indexes
        collection = db[coll_name]
        for idx in indexes:
            try:
                index_keys = idx["keys"]
                kwargs = {"name": idx["name"]}
                for k in ["unique", "sparse"]:
                    if k in idx:
                        kwargs[k] = idx[k]
                collection.create_index(index_keys, **kwargs)
                index_count += 1
            except OperationFailure:
                pass  # Index already exists

    # Final report
    print(f"\n{'='*60}")
    print(f"SETUP COMPLETE: {DB_NAME}")
    print(f"{'='*60}")
    print(f"Collections created: {created_count}")
    print(f"Collections already existed: {len(already_exists)}")
    print(f"Total indexes created: {index_count}")

    # List existing collections
    print(f"\nExisting collections in '{DB_NAME}':")
    for name in sorted(db.list_collection_names()):
        count = db[name].estimated_document_count()
        print(f"  - {name} ({count} documents)")

    client.close()
    print(f"\n[OK] Setup finished. Disconnected from MongoDB.")

if __name__ == "__main__":
    main()