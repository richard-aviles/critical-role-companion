#!/usr/bin/env python3
"""
Check if color_theme_override was saved for recent characters
"""
import json
import sys
import os
from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker
from models import Character, Base

# Database URL from .env
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_aE6v9DYOtkVi@ep-cool-heart-adbyj6oa-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

try:
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Get last 5 characters
    characters = session.query(Character).order_by(desc(Character.created_at)).limit(5).all()

    print("=" * 80)
    print("RECENT CHARACTERS - COLOR THEME OVERRIDE CHECK")
    print("=" * 80)

    if not characters:
        print("No characters found in database")
        sys.exit(0)

    for char in characters:
        print(f"\nCharacter: {char.name}")
        print(f"  ID: {char.id}")
        print(f"  Slug: {char.slug}")
        print(f"  Created: {char.created_at}")

        if char.color_theme_override:
            print(f"  [PRESENT] color_theme_override IS PRESENT")
            print(f"  Data type: {type(char.color_theme_override)}")
            print(f"  Raw value: {char.color_theme_override}")
            print(f"  Pretty printed:")
            print(json.dumps(char.color_theme_override, indent=4))
        else:
            print(f"  [NULL/EMPTY] color_theme_override IS NULL/EMPTY")

    print("\n" + "=" * 80)
    session.close()

except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
