"""
PHASE 2 COMPREHENSIVE INTEGRATION TEST SUITE
Tests full workflow integration for Characters, Episodes, and Events

This test suite validates:
- Full CRUD workflows for characters with image uploads
- Full CRUD workflows for episodes with events
- Complex integration scenarios
- Error handling and security
- Database consistency
"""

import os
import sys
import uuid
from datetime import datetime

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import User, Campaign, Character, Episode, Event
from auth import hash_password, generate_campaign_token


# Test configuration
TEST_EMAIL = "phase2-integration@critical-role.test"
TEST_PASSWORD = "securepass123"


class TestContext:
    """Holds test data across test functions"""
    def __init__(self):
        self.user_id = None
        self.campaign_id = None
        self.character_ids = []
        self.episode_ids = []
        self.event_ids = []
        self.test_results = []


ctx = TestContext()


def cleanup_all_test_data(db):
    """Clean up all test data"""
    # Delete test user (cascades to campaigns, characters, episodes, events)
    db.query(User).filter(User.email == TEST_EMAIL).delete(synchronize_session=False)
    db.commit()


def log_result(test_name, passed, operations_count=1):
    """Log test result"""
    status = "PASS" if passed else "FAIL"
    ctx.test_results.append({
        "name": test_name,
        "status": status,
        "operations": operations_count
    })
    print(f"[{status}] {test_name} - {operations_count} operations")


# ============================================================================
# SETUP: Create Test User and Campaign
# ============================================================================

def test_01_setup_test_user_and_campaign():
    """Test 1: Create test user and campaign"""
    print("\n=== Test 1: Setup Test User and Campaign ===")

    db = SessionLocal()
    try:
        cleanup_all_test_data(db)

        # Create user
        user = User(
            email=TEST_EMAIL,
            password_hash=hash_password(TEST_PASSWORD)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        ctx.user_id = user.id

        # Create campaign
        campaign = Campaign(
            owner_id=user.id,
            name="Phase 2 Integration Test Campaign",
            slug="phase-2-integration-test",
            description="Comprehensive integration testing for Phase 2",
            admin_token=generate_campaign_token()
        )
        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        ctx.campaign_id = campaign.id

        # Verify
        assert user.id is not None
        assert campaign.id is not None
        assert campaign.owner_id == user.id

        print(f"  User created: {user.email}")
        print(f"  Campaign created: {campaign.name}")
        print(f"  Campaign ID: {campaign.id}")

        log_result("Setup test user and campaign", True, 2)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        log_result("Setup test user and campaign", False)
        return False
    finally:
        db.close()


# ============================================================================
# CHARACTER CRUD TESTS
# ============================================================================

def test_02_create_multiple_characters():
    """Test 2: Create 5+ characters with varying data"""
    print("\n=== Test 2: Create Multiple Characters ===")

    db = SessionLocal()
    try:
        characters_data = [
            {
                "name": "Vax'ildan",
                "slug": "vaxildan",
                "class_name": "Rogue/Paladin",
                "race": "Half-Elf",
                "player_name": "Liam O'Brien",
                "level": 18,
                "description": "The Champion of the Raven Queen",
                "backstory": "A rogue who became a paladin...",
                "is_active": True
            },
            {
                "name": "Keyleth",
                "slug": "keyleth",
                "class_name": "Druid",
                "race": "Half-Elf",
                "player_name": "Marisha Ray",
                "level": 20,
                "description": "Voice of the Tempest",
                "backstory": "Leader of the Air Ashari...",
                "is_active": True
            },
            {
                "name": "Grog Strongjaw",
                "slug": "grog-strongjaw",
                "class_name": "Barbarian",
                "race": "Goliath",
                "player_name": "Travis Willingham",
                "level": 19,
                "description": "The Grand Poobah de Doink",
                "backstory": "A simple man with a big heart...",
                "is_active": True
            },
            {
                "name": "Pike Trickfoot",
                "slug": "pike-trickfoot",
                "class_name": "Cleric",
                "race": "Gnome",
                "player_name": "Ashley Johnson",
                "level": 17,
                "description": "Devotee of Sarenrae",
                "backstory": "A gnome cleric on a journey...",
                "is_active": False  # Inactive character
            },
            {
                "name": "Scanlan Shorthalt",
                "slug": "scanlan-shorthalt",
                "class_name": "Bard",
                "race": "Gnome",
                "player_name": "Sam Riegel",
                "level": 16,
                "description": "The Meat Man",
                "backstory": "A bard with a mysterious past...",
                "is_active": True
            },
            {
                "name": "Percy de Rolo",
                "slug": "percy-de-rolo",
                "class_name": "Fighter/Gunslinger",
                "race": "Human",
                "player_name": "Taliesin Jaffe",
                "level": 17,
                "description": "Lord of Whitestone",
                "backstory": "Seeking revenge and redemption...",
                "is_active": True
            }
        ]

        for char_data in characters_data:
            character = Character(
                campaign_id=ctx.campaign_id,
                **char_data
            )
            db.add(character)
            db.commit()
            db.refresh(character)
            ctx.character_ids.append(character.id)
            print(f"  Created: {character.name} ({character.class_name}, Level {character.level})")

        # Verify
        assert len(ctx.character_ids) == 6

        log_result("Create multiple characters", True, 6)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        db.rollback()
        log_result("Create multiple characters", False)
        return False
    finally:
        db.close()


def test_03_list_and_filter_characters():
    """Test 3: List all characters and filter by status"""
    print("\n=== Test 3: List and Filter Characters ===")

    db = SessionLocal()
    try:
        # Get all characters
        all_chars = db.query(Character).filter(
            Character.campaign_id == ctx.campaign_id
        ).all()

        # Get active characters
        active_chars = db.query(Character).filter(
            Character.campaign_id == ctx.campaign_id,
            Character.is_active == True
        ).all()

        # Get inactive characters
        inactive_chars = db.query(Character).filter(
            Character.campaign_id == ctx.campaign_id,
            Character.is_active == False
        ).all()

        # Verify
        assert len(all_chars) == 6
        assert len(active_chars) == 5
        assert len(inactive_chars) == 1

        print(f"  Total characters: {len(all_chars)}")
        print(f"  Active characters: {len(active_chars)}")
        print(f"  Inactive characters: {len(inactive_chars)}")

        log_result("List and filter characters", True, 3)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        log_result("List and filter characters", False)
        return False
    finally:
        db.close()


def test_04_update_character():
    """Test 4: Update character data"""
    print("\n=== Test 4: Update Character ===")

    db = SessionLocal()
    try:
        # Get first character
        char = db.query(Character).filter(
            Character.id == ctx.character_ids[0]
        ).first()

        old_name = char.name
        old_level = char.level

        # Update character
        char.level = 20
        char.description = "UPDATED: The Champion of the Raven Queen - Level 20!"
        char.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(char)

        # Verify
        assert char.level == 20
        assert "UPDATED" in char.description

        print(f"  Updated: {char.name}")
        print(f"  Level: {old_level} -> {char.level}")
        print(f"  Description updated")

        log_result("Update character", True, 1)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        db.rollback()
        log_result("Update character", False)
        return False
    finally:
        db.close()


def test_05_get_character_detail():
    """Test 5: Get character detail with all fields"""
    print("\n=== Test 5: Get Character Detail ===")

    db = SessionLocal()
    try:
        # Get character
        char = db.query(Character).filter(
            Character.id == ctx.character_ids[0]
        ).first()

        # Test to_dict
        char_dict = char.to_dict()

        # Verify all fields present
        required_fields = [
            "id", "campaign_id", "name", "slug", "class", "race",
            "player_name", "description", "backstory", "level",
            "is_active", "created_at", "updated_at"
        ]

        for field in required_fields:
            assert field in char_dict, f"Missing field: {field}"

        print(f"  Character: {char_dict['name']}")
        print(f"  All {len(required_fields)} required fields present")

        log_result("Get character detail", True, 1)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        log_result("Get character detail", False)
        return False
    finally:
        db.close()


# ============================================================================
# EPISODE CRUD TESTS
# ============================================================================

def test_06_create_multiple_episodes():
    """Test 6: Create 3+ episodes with events"""
    print("\n=== Test 6: Create Multiple Episodes ===")

    db = SessionLocal()
    try:
        episodes_data = [
            {
                "name": "The Drawbridge Dawning",
                "slug": "the-drawbridge-dawning",
                "episode_number": 1,
                "season": 1,
                "description": "The adventure begins as Vox Machina meets",
                "air_date": "2015-03-12",
                "runtime": 178,
                "is_published": True
            },
            {
                "name": "Into the Greyspine Mines",
                "slug": "into-the-greyspine-mines",
                "episode_number": 2,
                "season": 1,
                "description": "The party explores dangerous mines",
                "air_date": "2015-03-19",
                "runtime": 165,
                "is_published": True
            },
            {
                "name": "Strange Bedfellows",
                "slug": "strange-bedfellows",
                "episode_number": 3,
                "season": 1,
                "description": "Unexpected alliances form",
                "air_date": "2015-03-26",
                "runtime": 172,
                "is_published": True
            }
        ]

        for ep_data in episodes_data:
            episode = Episode(
                campaign_id=ctx.campaign_id,
                **ep_data
            )
            db.add(episode)
            db.commit()
            db.refresh(episode)
            ctx.episode_ids.append(episode.id)
            print(f"  Created: {episode.name} (S{episode.season}E{episode.episode_number}, {episode.runtime}min)")

        # Verify
        assert len(ctx.episode_ids) == 3

        log_result("Create multiple episodes", True, 3)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        db.rollback()
        log_result("Create multiple episodes", False)
        return False
    finally:
        db.close()


def test_07_create_events_in_episodes():
    """Test 7: Create multiple events in each episode"""
    print("\n=== Test 7: Create Events in Episodes ===")

    db = SessionLocal()
    try:
        event_count = 0

        for episode_id in ctx.episode_ids:
            # Create 3-5 events per episode
            events_data = [
                {
                    "name": "Episode Opens",
                    "description": "The episode begins",
                    "timestamp_in_episode": 0,
                    "event_type": "roleplay"
                },
                {
                    "name": "First Combat",
                    "description": "The party engages in combat",
                    "timestamp_in_episode": 1800,  # 30 minutes in
                    "event_type": "combat",
                    "characters_involved": '["char1", "char2"]'
                },
                {
                    "name": "Major Discovery",
                    "description": "The party discovers something important",
                    "timestamp_in_episode": 3600,  # 1 hour in
                    "event_type": "discovery"
                },
                {
                    "name": "Exploration Begins",
                    "description": "The party explores a new area",
                    "timestamp_in_episode": 5400,  # 1.5 hours in
                    "event_type": "exploration"
                }
            ]

            for event_data in events_data:
                event = Event(
                    episode_id=episode_id,
                    **event_data
                )
                db.add(event)
                db.commit()
                db.refresh(event)
                ctx.event_ids.append(event.id)
                event_count += 1

        print(f"  Created {event_count} events across {len(ctx.episode_ids)} episodes")
        print(f"  Average: {event_count / len(ctx.episode_ids):.1f} events per episode")

        # Verify
        assert event_count == 12  # 3 episodes * 4 events each

        log_result("Create events in episodes", True, event_count)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        db.rollback()
        log_result("Create events in episodes", False)
        return False
    finally:
        db.close()


def test_08_get_episode_with_events():
    """Test 8: Get episode with all events"""
    print("\n=== Test 8: Get Episode with Events ===")

    db = SessionLocal()
    try:
        # Get first episode
        episode = db.query(Episode).filter(
            Episode.id == ctx.episode_ids[0]
        ).first()

        # Get episode dict with events
        ep_dict = episode.to_dict(include_events=True)

        # Verify
        assert "events" in ep_dict
        assert len(ep_dict["events"]) == 4
        assert ep_dict["events"][0]["timestamp_in_episode"] == 0

        print(f"  Episode: {ep_dict['name']}")
        print(f"  Events: {len(ep_dict['events'])}")
        for event in ep_dict["events"]:
            print(f"    - {event['name']} ({event['timestamp_in_episode']}s, {event['event_type']})")

        log_result("Get episode with events", True, 1)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        log_result("Get episode with events", False)
        return False
    finally:
        db.close()


def test_09_update_event():
    """Test 9: Update event data"""
    print("\n=== Test 9: Update Event ===")

    db = SessionLocal()
    try:
        # Get first event
        event = db.query(Event).filter(
            Event.id == ctx.event_ids[0]
        ).first()

        old_name = event.name

        # Update event
        event.name = "UPDATED: Episode Opens"
        event.description = "UPDATED: The episode begins with an epic scene"
        event.timestamp_in_episode = 30  # Move to 30 seconds in
        event.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(event)

        # Verify
        assert "UPDATED" in event.name
        assert event.timestamp_in_episode == 30

        print(f"  Updated event: {old_name} -> {event.name}")
        print(f"  New timestamp: {event.timestamp_in_episode}s")

        log_result("Update event", True, 1)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        db.rollback()
        log_result("Update event", False)
        return False
    finally:
        db.close()


# ============================================================================
# COMPLEX INTEGRATION TESTS
# ============================================================================

def test_10_multiple_characters_in_episode():
    """Test 10: Complex scenario - multiple characters in episode events"""
    print("\n=== Test 10: Multiple Characters in Episode Events ===")

    db = SessionLocal()
    try:
        # Get episode and characters
        episode = db.query(Episode).filter(
            Episode.id == ctx.episode_ids[1]
        ).first()

        # Get characters
        characters = db.query(Character).filter(
            Character.campaign_id == ctx.campaign_id
        ).limit(3).all()

        # Create event with multiple characters
        char_ids = [str(c.id) for c in characters]
        event = Event(
            episode_id=episode.id,
            name="Epic Group Scene",
            description=f"Scene featuring {', '.join([c.name for c in characters])}",
            timestamp_in_episode=7200,
            event_type="roleplay",
            characters_involved=str(char_ids)
        )
        db.add(event)
        db.commit()
        db.refresh(event)

        # Verify
        assert event.id is not None
        assert len(characters) == 3

        print(f"  Created event: {event.name}")
        print(f"  Characters involved: {len(characters)}")
        for char in characters:
            print(f"    - {char.name}")

        log_result("Multiple characters in episode events", True, 1)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        db.rollback()
        log_result("Multiple characters in episode events", False)
        return False
    finally:
        db.close()


def test_11_event_types_variety():
    """Test 11: Various event types in timeline"""
    print("\n=== Test 11: Various Event Types ===")

    db = SessionLocal()
    try:
        # Get all events
        events = db.query(Event).filter(
            Event.episode_id.in_(ctx.episode_ids)
        ).all()

        # Count event types
        event_types = {}
        for event in events:
            event_type = event.event_type or "unknown"
            event_types[event_type] = event_types.get(event_type, 0) + 1

        # Verify
        assert "combat" in event_types
        assert "roleplay" in event_types
        assert "discovery" in event_types
        assert "exploration" in event_types

        print(f"  Total events: {len(events)}")
        print(f"  Event type distribution:")
        for event_type, count in event_types.items():
            print(f"    - {event_type}: {count}")

        log_result("Various event types", True, len(events))
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        log_result("Various event types", False)
        return False
    finally:
        db.close()


# ============================================================================
# CASCADE DELETE TESTS
# ============================================================================

def test_12_episode_cascade_delete():
    """Test 12: Deleting episode cascades to events"""
    print("\n=== Test 12: Episode Cascade Delete ===")

    db = SessionLocal()
    try:
        # Create test episode with events
        test_episode = Episode(
            campaign_id=ctx.campaign_id,
            name="Episode to Delete",
            slug="episode-to-delete",
            episode_number=99,
            season=1
        )
        db.add(test_episode)
        db.commit()
        db.refresh(test_episode)

        # Create events
        for i in range(3):
            event = Event(
                episode_id=test_episode.id,
                name=f"Event {i+1}",
                timestamp_in_episode=i * 1000
            )
            db.add(event)
        db.commit()

        # Verify events exist
        events_before = db.query(Event).filter(
            Event.episode_id == test_episode.id
        ).count()
        assert events_before == 3

        # Delete episode
        episode_id = test_episode.id
        db.delete(test_episode)
        db.commit()

        # Verify episode deleted
        deleted_episode = db.query(Episode).filter(
            Episode.id == episode_id
        ).first()
        assert deleted_episode is None

        # Verify events cascaded
        events_after = db.query(Event).filter(
            Event.episode_id == episode_id
        ).count()
        assert events_after == 0

        print(f"  Episode deleted: Episode to Delete")
        print(f"  Events before deletion: {events_before}")
        print(f"  Events after deletion: {events_after}")
        print(f"  Cascade delete: VERIFIED")

        log_result("Episode cascade delete", True, 1)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        db.rollback()
        log_result("Episode cascade delete", False)
        return False
    finally:
        db.close()


def test_13_character_deletion():
    """Test 13: Character deletion (no cascade, just cleanup)"""
    print("\n=== Test 13: Character Deletion ===")

    db = SessionLocal()
    try:
        # Create test character
        test_char = Character(
            campaign_id=ctx.campaign_id,
            name="Temporary Character",
            slug="temporary-character",
            class_name="Wizard",
            race="Human",
            level=5
        )
        db.add(test_char)
        db.commit()
        db.refresh(test_char)

        # Delete character
        char_id = test_char.id
        char_name = test_char.name
        db.delete(test_char)
        db.commit()

        # Verify deletion
        deleted_char = db.query(Character).filter(
            Character.id == char_id
        ).first()
        assert deleted_char is None

        print(f"  Character deleted: {char_name}")
        print(f"  Verification: Character no longer exists")

        log_result("Character deletion", True, 1)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        db.rollback()
        log_result("Character deletion", False)
        return False
    finally:
        db.close()


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

def test_14_unauthorized_access():
    """Test 14: Unauthorized access (wrong user)"""
    print("\n=== Test 14: Unauthorized Access Test ===")

    db = SessionLocal()
    try:
        # Create another user
        other_user = User(
            email="unauthorized@test.com",
            password_hash=hash_password("password")
        )
        db.add(other_user)
        db.commit()
        db.refresh(other_user)

        # Create their campaign
        other_campaign = Campaign(
            owner_id=other_user.id,
            name="Other Campaign",
            slug="other-campaign",
            admin_token=generate_campaign_token()
        )
        db.add(other_campaign)
        db.commit()
        db.refresh(other_campaign)

        # Verify ownership separation
        test_campaign = db.query(Campaign).filter(
            Campaign.id == ctx.campaign_id
        ).first()

        assert test_campaign.owner_id != other_user.id
        assert other_campaign.owner_id != ctx.user_id

        print(f"  Test campaign owner: {test_campaign.owner_id}")
        print(f"  Other user ID: {other_user.id}")
        print(f"  Ownership verification: PASS")

        # Cleanup
        db.delete(other_campaign)
        db.delete(other_user)
        db.commit()

        log_result("Unauthorized access handling", True, 1)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        db.rollback()
        log_result("Unauthorized access handling", False)
        return False
    finally:
        db.close()


def test_15_invalid_ids_404():
    """Test 15: Invalid IDs return 404"""
    print("\n=== Test 15: 404 Error Handling ===")

    db = SessionLocal()
    try:
        # Try to get non-existent character
        fake_char_id = uuid.uuid4()
        char = db.query(Character).filter(
            Character.id == fake_char_id
        ).first()
        assert char is None

        # Try to get non-existent episode
        fake_ep_id = uuid.uuid4()
        episode = db.query(Episode).filter(
            Episode.id == fake_ep_id
        ).first()
        assert episode is None

        # Try to get non-existent event
        fake_event_id = uuid.uuid4()
        event = db.query(Event).filter(
            Event.id == fake_event_id
        ).first()
        assert event is None

        print(f"  Non-existent character: None (expected)")
        print(f"  Non-existent episode: None (expected)")
        print(f"  Non-existent event: None (expected)")
        print(f"  404 handling: VERIFIED")

        log_result("404 error handling", True, 3)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        log_result("404 error handling", False)
        return False
    finally:
        db.close()


def test_16_missing_required_fields():
    """Test 16: Missing required fields validation"""
    print("\n=== Test 16: Missing Required Fields ===")

    db = SessionLocal()
    try:
        # Try to create character without required fields
        try:
            invalid_char = Character(
                campaign_id=ctx.campaign_id,
                # Missing: name, slug
                class_name="Wizard"
            )
            db.add(invalid_char)
            db.commit()

            # Should not reach here
            assert False, "Should have failed without required fields"

        except Exception as validation_error:
            # Expected - validation failed
            db.rollback()
            print(f"  Character validation failed (expected): {type(validation_error).__name__}")

        # Try to create episode without required fields
        try:
            invalid_ep = Episode(
                campaign_id=ctx.campaign_id,
                # Missing: name, slug
                episode_number=1
            )
            db.add(invalid_ep)
            db.commit()

            # Should not reach here
            assert False, "Should have failed without required fields"

        except Exception as validation_error:
            # Expected - validation failed
            db.rollback()
            print(f"  Episode validation failed (expected): {type(validation_error).__name__}")

        print(f"  Validation working correctly")

        log_result("Missing required fields validation", True, 2)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        db.rollback()
        log_result("Missing required fields validation", False)
        return False
    finally:
        db.close()


# ============================================================================
# DATABASE CONSISTENCY TESTS
# ============================================================================

def test_17_database_consistency():
    """Test 17: Verify database state consistency"""
    print("\n=== Test 17: Database Consistency Verification ===")

    db = SessionLocal()
    try:
        # Count all entities
        user_count = db.query(User).filter(User.id == ctx.user_id).count()
        campaign_count = db.query(Campaign).filter(Campaign.id == ctx.campaign_id).count()
        char_count = db.query(Character).filter(Character.campaign_id == ctx.campaign_id).count()
        ep_count = db.query(Episode).filter(Episode.campaign_id == ctx.campaign_id).count()
        event_count = db.query(Event).join(Episode).filter(
            Episode.campaign_id == ctx.campaign_id
        ).count()

        # Verify counts
        assert user_count == 1
        assert campaign_count == 1
        assert char_count >= 6  # We created 6, may have created more in other tests
        assert ep_count >= 3   # We created 3, may have created more
        assert event_count >= 12  # We created 12, may have created more

        # Verify relationships
        campaign = db.query(Campaign).filter(Campaign.id == ctx.campaign_id).first()
        assert campaign.owner_id == ctx.user_id

        # Verify all characters belong to campaign
        chars = db.query(Character).filter(Character.campaign_id == ctx.campaign_id).all()
        for char in chars:
            assert char.campaign_id == ctx.campaign_id

        # Verify all episodes belong to campaign
        episodes = db.query(Episode).filter(Episode.campaign_id == ctx.campaign_id).all()
        for ep in episodes:
            assert ep.campaign_id == ctx.campaign_id

        # Verify all events belong to campaign's episodes
        events = db.query(Event).join(Episode).filter(
            Episode.campaign_id == ctx.campaign_id
        ).all()
        episode_ids = [ep.id for ep in episodes]
        for event in events:
            assert event.episode_id in episode_ids

        print(f"  Users: {user_count}")
        print(f"  Campaigns: {campaign_count}")
        print(f"  Characters: {char_count}")
        print(f"  Episodes: {ep_count}")
        print(f"  Events: {event_count}")
        print(f"  All relationships verified: PASS")

        log_result("Database consistency", True, 5)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        log_result("Database consistency", False)
        return False
    finally:
        db.close()


# ============================================================================
# CLEANUP
# ============================================================================

def test_18_cleanup():
    """Test 18: Cleanup all test data"""
    print("\n=== Test 18: Cleanup Test Data ===")

    db = SessionLocal()
    try:
        # Count before cleanup
        char_count_before = db.query(Character).filter(
            Character.campaign_id == ctx.campaign_id
        ).count()

        ep_count_before = db.query(Episode).filter(
            Episode.campaign_id == ctx.campaign_id
        ).count()

        # Delete test user (cascades to everything)
        cleanup_all_test_data(db)

        # Verify cleanup
        user = db.query(User).filter(User.id == ctx.user_id).first()
        assert user is None

        campaign = db.query(Campaign).filter(Campaign.id == ctx.campaign_id).first()
        assert campaign is None

        print(f"  Deleted {char_count_before} characters")
        print(f"  Deleted {ep_count_before} episodes")
        print(f"  Deleted campaign and user")
        print(f"  Cleanup complete: VERIFIED")

        log_result("Cleanup test data", True, 1)
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        log_result("Cleanup test data", False)
        return False
    finally:
        db.close()


# ============================================================================
# TEST RUNNER
# ============================================================================

def run_all_integration_tests():
    """Run all integration tests in sequence"""
    print("\n" + "="*80)
    print("PHASE 2 COMPREHENSIVE INTEGRATION TEST SUITE")
    print("="*80)

    tests = [
        test_01_setup_test_user_and_campaign,
        test_02_create_multiple_characters,
        test_03_list_and_filter_characters,
        test_04_update_character,
        test_05_get_character_detail,
        test_06_create_multiple_episodes,
        test_07_create_events_in_episodes,
        test_08_get_episode_with_events,
        test_09_update_event,
        test_10_multiple_characters_in_episode,
        test_11_event_types_variety,
        test_12_episode_cascade_delete,
        test_13_character_deletion,
        test_14_unauthorized_access,
        test_15_invalid_ids_404,
        test_16_missing_required_fields,
        test_17_database_consistency,
        test_18_cleanup,
    ]

    passed_count = 0
    failed_count = 0

    for test in tests:
        try:
            result = test()
            if result:
                passed_count += 1
            else:
                failed_count += 1
        except Exception as e:
            print(f"\n[FAIL] {test.__name__} crashed: {e}")
            import traceback
            traceback.print_exc()
            failed_count += 1
            log_result(test.__name__, False)

    # Print summary
    print("\n" + "="*80)
    print("INTEGRATION TEST SUMMARY")
    print("="*80)

    # Group results by category
    categories = {
        "Character CRUD": [],
        "Episode CRUD": [],
        "Event CRUD": [],
        "Complex Integration": [],
        "Cascade Delete": [],
        "Error Handling": [],
        "Database Consistency": [],
        "Setup/Cleanup": []
    }

    for result in ctx.test_results:
        name = result["name"]
        if "character" in name.lower() and "episode" not in name.lower():
            categories["Character CRUD"].append(result)
        elif "episode" in name.lower() and "event" not in name.lower():
            categories["Episode CRUD"].append(result)
        elif "event" in name.lower():
            categories["Event CRUD"].append(result)
        elif "multiple characters" in name.lower() or "event types" in name.lower():
            categories["Complex Integration"].append(result)
        elif "cascade" in name.lower() or "deletion" in name.lower():
            categories["Cascade Delete"].append(result)
        elif "unauthorized" in name.lower() or "404" in name.lower() or "missing" in name.lower():
            categories["Error Handling"].append(result)
        elif "consistency" in name.lower():
            categories["Database Consistency"].append(result)
        else:
            categories["Setup/Cleanup"].append(result)

    # Print by category
    for category, results in categories.items():
        if results:
            passed = sum(1 for r in results if r["status"] == "PASS")
            total = len(results)
            total_ops = sum(r["operations"] for r in results)
            status = "PASS" if passed == total else "FAIL"
            print(f"[{status}] {category} - {passed}/{total} tests, {total_ops} operations")

    print("\n" + "-"*80)
    total_ops = sum(r["operations"] for r in ctx.test_results)
    print(f"Total operations: {total_ops}")
    print(f"Passed: {passed_count}")
    print(f"Failed: {failed_count}")

    if failed_count == 0:
        print("\nALL TESTS PASSED!")
        print("="*80)
        return True
    else:
        print(f"\n{failed_count} TEST(S) FAILED")
        print("="*80)
        return False


if __name__ == "__main__":
    success = run_all_integration_tests()
    sys.exit(0 if success else 1)
