#!/usr/bin/env python3
"""
Script to check for duplicate slugs in campaigns and fix them
"""

import os
import sys
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in .env")
    sys.exit(1)

# Import models
from models import Campaign

# Create database connection
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

try:
    # Get all campaigns
    campaigns = session.query(Campaign).order_by(Campaign.slug).all()

    print(f"\n{'='*60}")
    print("SLUG UNIQUENESS CHECK")
    print(f"{'='*60}\n")

    print(f"Total campaigns in database: {len(campaigns)}\n")

    # Check for duplicates
    slug_counts = session.query(Campaign.slug, func.count(Campaign.id)).group_by(Campaign.slug).having(func.count(Campaign.id) > 1).all()

    if slug_counts:
        print(f"[WARNING] FOUND {len(slug_counts)} DUPLICATE SLUG(S):\n")

        duplicates_to_fix = []

        for slug, count in slug_counts:
            print(f"  Slug '{slug}' appears {count} times:")
            campaigns_with_slug = session.query(Campaign).filter(Campaign.slug == slug).order_by(Campaign.created_at).all()

            for idx, campaign in enumerate(campaigns_with_slug):
                is_first = (idx == 0)
                status = "[KEEP]" if is_first else "[WILL FIX]"
                print(f"    {status} {campaign.name} (ID: {campaign.id}, created: {campaign.created_at})")

                if not is_first:
                    duplicates_to_fix.append(campaign)
            print()

        # Fix duplicates
        if duplicates_to_fix:
            print(f"{'='*60}")
            print("FIXING DUPLICATES")
            print(f"{'='*60}\n")

            for campaign in duplicates_to_fix:
                # Find a unique slug
                original_slug = campaign.slug
                counter = 2

                while True:
                    new_slug = f"{original_slug}-{counter}"
                    existing = session.query(Campaign).filter(Campaign.slug == new_slug).first()
                    if not existing:
                        break
                    counter += 1

                # Update the campaign
                campaign.slug = new_slug
                session.commit()

                print(f"[FIXED] {campaign.name}")
                print(f"  Old slug: {original_slug}")
                print(f"  New slug: {new_slug}\n")
    else:
        print("[OK] NO DUPLICATES FOUND - All slugs are unique!\n")

    # Show all campaigns
    print(f"{'='*60}")
    print("ALL CAMPAIGNS (FINAL STATE)")
    print(f"{'='*60}\n")

    all_campaigns = session.query(Campaign).order_by(Campaign.slug).all()
    for campaign in all_campaigns:
        print(f"  - {campaign.name}")
        print(f"    Slug: {campaign.slug}")
        print(f"    ID: {campaign.id}\n")

    print(f"{'='*60}\n")

except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
finally:
    session.close()
