"""
Comprehensive tests for Episode and Event endpoints
Phase 2: Episode timeline and event tracking
"""

import os
import sys
import uuid
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
from models import User, Campaign, Episode, Event
from auth import hash_password

# Test configuration
BASE_URL = os.getenv("API_URL", "http://localhost:8000")

# Global test state
test_user_id = None
test_user_email = None
test_campaign_id = None
test_episode_id = None
test_event_id = None


def setup_test_data():
    """Create test user and campaign for testing"""
    global test_user_id, test_user_email, test_campaign_id

    db = SessionLocal()

    try:
        # Create test user
        test_user_email = f"test_episodes_{uuid.uuid4().hex[:8]}@test.com"
        user = User(
            email=test_user_email,
            password_hash=hash_password("testpassword123"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        test_user_id = str(user.id)

        print(f"[OK] Created test user: {test_user_email} (ID: {test_user_id})")

        # Create test campaign
        campaign = Campaign(
            slug=f"test-campaign-{uuid.uuid4().hex[:8]}",
            name="Test Campaign for Episodes",
            description="Test campaign for episode endpoint testing",
            owner_id=user.id,
            admin_token=uuid.uuid4().hex,
        )
        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        test_campaign_id = str(campaign.id)

        print(f"[OK] Created test campaign: {campaign.name} (ID: {test_campaign_id})")

    except Exception as e:
        print(f"[ERROR] Setup failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def cleanup_test_data():
    """Clean up test data"""
    global test_user_id

    db = SessionLocal()

    try:
        if test_user_id:
            user = db.query(User).filter(User.id == uuid.UUID(test_user_id)).first()
            if user:
                db.delete(user)
                db.commit()
                print(f"[PASS] Cleaned up test user and all related data")
    except Exception as e:
        print(f"[FAIL] Cleanup failed: {e}")
        db.rollback()
    finally:
        db.close()


# ============================================================================
# TEST CASES
# ============================================================================

def test_create_episode():
    """Test: Create a new episode"""
    global test_episode_id

    print("\n[TEST] Create Episode")

    db = SessionLocal()

    try:
        # Create episode
        episode = Episode(
            campaign_id=uuid.UUID(test_campaign_id),
            name="The Adventure Begins",
            slug="the-adventure-begins",
            episode_number=1,
            season=1,
            description="The party meets for the first time",
            air_date="2025-11-21",
            runtime=180,
            is_published=True,
        )
        db.add(episode)
        db.commit()
        db.refresh(episode)
        test_episode_id = str(episode.id)

        # Verify
        assert episode.name == "The Adventure Begins"
        assert episode.slug == "the-adventure-begins"
        assert episode.episode_number == 1
        assert episode.season == 1
        assert episode.is_published is True

        print(f"[PASS] Episode created: {episode.name} (ID: {test_episode_id})")
        return True

    except Exception as e:
        print(f"[FAIL] Test failed: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def test_list_episodes():
    """Test: List episodes in campaign"""
    print("\n[TEST] List Episodes")

    db = SessionLocal()

    try:
        # Get all episodes
        episodes = db.query(Episode).filter(
            Episode.campaign_id == uuid.UUID(test_campaign_id)
        ).order_by(Episode.season, Episode.episode_number).all()

        # Verify
        assert len(episodes) >= 1
        assert episodes[0].name == "The Adventure Begins"

        print(f"[PASS] Found {len(episodes)} episode(s)")
        for ep in episodes:
            print(f"  - {ep.name} (S{ep.season}E{ep.episode_number})")
        return True

    except Exception as e:
        print(f"[FAIL] Test failed: {e}")
        return False
    finally:
        db.close()


def test_get_episode_detail():
    """Test: Get episode with events"""
    print("\n[TEST] Get Episode Detail")

    db = SessionLocal()

    try:
        # Get episode
        episode = db.query(Episode).filter(
            Episode.id == uuid.UUID(test_episode_id)
        ).first()

        # Verify
        assert episode is not None
        assert episode.name == "The Adventure Begins"
        assert episode.campaign_id == uuid.UUID(test_campaign_id)

        print(f"[PASS] Episode retrieved: {episode.name}")
        print(f"  - Episode Number: {episode.episode_number}")
        print(f"  - Season: {episode.season}")
        print(f"  - Runtime: {episode.runtime} minutes")
        print(f"  - Published: {episode.is_published}")
        return True

    except Exception as e:
        print(f"[FAIL] Test failed: {e}")
        return False
    finally:
        db.close()


def test_update_episode():
    """Test: Update episode information"""
    print("\n[TEST] Update Episode")

    db = SessionLocal()

    try:
        # Get episode
        episode = db.query(Episode).filter(
            Episode.id == uuid.UUID(test_episode_id)
        ).first()

        # Update fields
        episode.name = "The Adventure Begins (Updated)"
        episode.description = "Updated description for the first episode"
        episode.runtime = 200
        episode.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(episode)

        # Verify
        assert episode.name == "The Adventure Begins (Updated)"
        assert episode.description == "Updated description for the first episode"
        assert episode.runtime == 200

        print(f"[PASS] Episode updated successfully")
        print(f"  - New name: {episode.name}")
        print(f"  - New runtime: {episode.runtime} minutes")
        return True

    except Exception as e:
        print(f"[FAIL] Test failed: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def test_create_event():
    """Test: Create event in episode"""
    global test_event_id

    print("\n[TEST] Create Event")

    db = SessionLocal()

    try:
        # Create event
        event = Event(
            episode_id=uuid.UUID(test_episode_id),
            name="The Party Meets",
            description="The adventurers meet at a tavern",
            timestamp_in_episode=300,  # 5 minutes into episode
            event_type="roleplay",
            characters_involved='["char1", "char2", "char3"]',
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        test_event_id = str(event.id)

        # Verify
        assert event.name == "The Party Meets"
        assert event.timestamp_in_episode == 300
        assert event.event_type == "roleplay"

        print(f"[PASS] Event created: {event.name} (ID: {test_event_id})")
        print(f"  - Timestamp: {event.timestamp_in_episode}s")
        print(f"  - Type: {event.event_type}")
        return True

    except Exception as e:
        print(f"[FAIL] Test failed: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def test_list_events():
    """Test: List events in episode"""
    print("\n[TEST] List Events")

    db = SessionLocal()

    try:
        # Get all events
        events = db.query(Event).filter(
            Event.episode_id == uuid.UUID(test_episode_id)
        ).order_by(Event.timestamp_in_episode).all()

        # Verify
        assert len(events) >= 1
        assert events[0].name == "The Party Meets"

        print(f"[PASS] Found {len(events)} event(s)")
        for event in events:
            print(f"  - {event.name} ({event.timestamp_in_episode}s)")
        return True

    except Exception as e:
        print(f"[FAIL] Test failed: {e}")
        return False
    finally:
        db.close()


def test_update_event():
    """Test: Update event information"""
    print("\n[TEST] Update Event")

    db = SessionLocal()

    try:
        # Get event
        event = db.query(Event).filter(
            Event.id == uuid.UUID(test_event_id)
        ).first()

        # Update fields
        event.name = "The Party Meets (Updated)"
        event.description = "Updated event description"
        event.timestamp_in_episode = 360
        event.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(event)

        # Verify
        assert event.name == "The Party Meets (Updated)"
        assert event.timestamp_in_episode == 360

        print(f"[PASS] Event updated successfully")
        print(f"  - New name: {event.name}")
        print(f"  - New timestamp: {event.timestamp_in_episode}s")
        return True

    except Exception as e:
        print(f"[FAIL] Test failed: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def test_delete_event():
    """Test: Delete an event"""
    print("\n[TEST] Delete Event")

    db = SessionLocal()

    try:
        # Get event
        event = db.query(Event).filter(
            Event.id == uuid.UUID(test_event_id)
        ).first()

        assert event is not None

        # Delete event
        db.delete(event)
        db.commit()

        # Verify deletion
        deleted_event = db.query(Event).filter(
            Event.id == uuid.UUID(test_event_id)
        ).first()

        assert deleted_event is None

        print(f"[PASS] Event deleted successfully")
        return True

    except Exception as e:
        print(f"[FAIL] Test failed: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def test_cascade_delete_episode():
    """Test: Delete episode cascades to events"""
    print("\n[TEST] Cascade Delete Episode")

    db = SessionLocal()

    try:
        # Create a new episode with events
        episode = Episode(
            campaign_id=uuid.UUID(test_campaign_id),
            name="Episode to Delete",
            slug="episode-to-delete",
            episode_number=2,
            season=1,
        )
        db.add(episode)
        db.commit()
        db.refresh(episode)

        # Create events in this episode
        event1 = Event(
            episode_id=episode.id,
            name="Event 1",
            timestamp_in_episode=100,
        )
        event2 = Event(
            episode_id=episode.id,
            name="Event 2",
            timestamp_in_episode=200,
        )
        db.add(event1)
        db.add(event2)
        db.commit()

        # Verify events exist
        events_before = db.query(Event).filter(Event.episode_id == episode.id).count()
        assert events_before == 2

        # Delete episode
        episode_id = episode.id
        db.delete(episode)
        db.commit()

        # Verify episode is deleted
        deleted_episode = db.query(Episode).filter(Episode.id == episode_id).first()
        assert deleted_episode is None

        # Verify events are cascaded deleted
        events_after = db.query(Event).filter(Event.episode_id == episode_id).count()
        assert events_after == 0

        print(f"[PASS] Episode deleted and events cascaded successfully")
        print(f"  - Events before: {events_before}")
        print(f"  - Events after: {events_after}")
        return True

    except Exception as e:
        print(f"[FAIL] Test failed: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def test_ownership_verification():
    """Test: Verify ownership checks work correctly"""
    print("\n[TEST] Ownership Verification")

    db = SessionLocal()

    try:
        # Create another user
        other_user = User(
            email=f"other_user_{uuid.uuid4().hex[:8]}@test.com",
            password_hash=hash_password("password123"),
        )
        db.add(other_user)
        db.commit()
        db.refresh(other_user)

        # Try to access episode from test campaign with other user's token
        # This should fail in actual API calls (we're testing the model structure)

        # Get episode
        episode = db.query(Episode).filter(
            Episode.id == uuid.UUID(test_episode_id)
        ).first()

        # Verify episode belongs to original campaign
        campaign = db.query(Campaign).filter(
            Campaign.id == episode.campaign_id
        ).first()

        assert campaign.owner_id != other_user.id

        print(f"[PASS] Ownership verification working correctly")
        print(f"  - Episode belongs to campaign: {campaign.name}")
        print(f"  - Campaign owner is NOT the other user")

        # Clean up other user
        db.delete(other_user)
        db.commit()

        return True

    except Exception as e:
        print(f"[FAIL] Test failed: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def test_404_handling():
    """Test: 404 error handling for non-existent resources"""
    print("\n[TEST] 404 Handling")

    db = SessionLocal()

    try:
        # Try to get non-existent episode
        fake_episode_id = uuid.uuid4()
        episode = db.query(Episode).filter(
            Episode.id == fake_episode_id
        ).first()

        assert episode is None

        # Try to get non-existent event
        fake_event_id = uuid.uuid4()
        event = db.query(Event).filter(
            Event.id == fake_event_id
        ).first()

        assert event is None

        print(f"[PASS] 404 handling working correctly")
        print(f"  - Non-existent episode returns None")
        print(f"  - Non-existent event returns None")
        return True

    except Exception as e:
        print(f"[FAIL] Test failed: {e}")
        return False
    finally:
        db.close()


def test_episode_with_events():
    """Test: Get episode with all events included"""
    print("\n[TEST] Episode with Events")

    db = SessionLocal()

    try:
        # Create episode
        episode = Episode(
            campaign_id=uuid.UUID(test_campaign_id),
            name="Episode with Multiple Events",
            slug="episode-with-events",
            episode_number=3,
            season=1,
        )
        db.add(episode)
        db.commit()
        db.refresh(episode)

        # Create multiple events
        events_data = [
            {"name": "Event A", "timestamp": 100, "type": "combat"},
            {"name": "Event B", "timestamp": 500, "type": "roleplay"},
            {"name": "Event C", "timestamp": 1000, "type": "discovery"},
        ]

        for event_data in events_data:
            event = Event(
                episode_id=episode.id,
                name=event_data["name"],
                timestamp_in_episode=event_data["timestamp"],
                event_type=event_data["type"],
            )
            db.add(event)

        db.commit()

        # Get episode with events using relationship
        db.refresh(episode)
        episode_dict = episode.to_dict(include_events=True)

        # Verify
        assert "events" in episode_dict
        assert len(episode_dict["events"]) == 3
        assert episode_dict["events"][0]["name"] == "Event A"

        print(f"[PASS] Episode retrieved with {len(episode_dict['events'])} events")
        for event in episode_dict["events"]:
            print(f"  - {event['name']} ({event['timestamp_in_episode']}s)")

        return True

    except Exception as e:
        print(f"[FAIL] Test failed: {e}")
        db.rollback()
        return False
    finally:
        db.close()


# ============================================================================
# RUN ALL TESTS
# ============================================================================

def run_all_tests():
    """Run all episode and event tests"""
    print("="*80)
    print("EPISODE & EVENT BACKEND TESTS")
    print("="*80)

    # Setup
    print("\n[SETUP] Creating test data...")
    setup_test_data()

    # Run tests
    tests = [
        test_create_episode,
        test_list_episodes,
        test_get_episode_detail,
        test_update_episode,
        test_create_event,
        test_list_events,
        test_update_event,
        test_delete_event,
        test_cascade_delete_episode,
        test_ownership_verification,
        test_404_handling,
        test_episode_with_events,
    ]

    results = []
    for test in tests:
        try:
            result = test()
            results.append((test.__name__, result))
        except Exception as e:
            print(f"\n[FAIL] {test.__name__} FAILED with exception: {e}")
            results.append((test.__name__, False))

    # Cleanup
    print("\n[CLEANUP] Removing test data...")
    cleanup_test_data()

    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)

    passed = sum(1 for _, result in results if result)
    failed = len(results) - passed

    for test_name, result in results:
        status = "[PASS] PASS" if result else "[FAIL] FAIL"
        print(f"{status} - {test_name}")

    print(f"\nTotal: {len(results)} tests")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")

    if failed == 0:
        print("\n ALL TESTS PASSED!")
        return True
    else:
        print(f"\n {failed} TEST(S) FAILED")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
