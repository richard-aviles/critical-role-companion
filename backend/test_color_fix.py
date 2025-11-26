#!/usr/bin/env python3
"""
Test script to verify color_theme_override is being processed correctly
"""
import json
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Character
from database import SessionLocal

# Get the most recent character
session = SessionLocal()

try:
    # Get last character that has color_theme_override
    char_with_colors = session.query(Character).filter(
        Character.color_theme_override != None
    ).order_by(Character.created_at.desc()).first()

    print("=" * 80)
    print("CHARACTER WITH SAVED COLOR OVERRIDE")
    print("=" * 80)

    if char_with_colors:
        print(f"Name: {char_with_colors.name}")
        print(f"Created: {char_with_colors.created_at}")
        print(f"Has color_theme_override: YES")
        print(f"Data: {json.dumps(char_with_colors.color_theme_override, indent=2)}")
    else:
        print("No characters with color_theme_override found!")

    print("\n" + "=" * 80)
    print("LAST 3 CHARACTERS")
    print("=" * 80)

    last_chars = session.query(Character).order_by(
        Character.created_at.desc()
    ).limit(3).all()

    for i, char in enumerate(last_chars, 1):
        has_color = "YES" if char.color_theme_override else "NO"
        print(f"\n{i}. {char.name}")
        print(f"   Created: {char.created_at}")
        print(f"   Has color_theme_override: {has_color}")
        if char.color_theme_override:
            print(f"   Border colors: {char.color_theme_override.get('border_colors')}")

    print("\n" + "=" * 80)

finally:
    session.close()
