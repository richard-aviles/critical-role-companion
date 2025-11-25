/**
 * Character Search & Filter Component
 * Provides search by name, filter by class/race, and sorting
 */

import { useState, useMemo, useEffect } from 'react';
import { Character } from '@/lib/api';

interface CharacterSearchProps {
  characters: Character[];
  onFilteredCharactersChange: (characters: Character[]) => void;
}

type SortOption = 'name' | 'class' | 'race';

export function CharacterSearch({ characters, onFilteredCharactersChange }: CharacterSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  // Get unique classes and races
  const classes = useMemo(() => {
    const unique = new Set(
      characters
        .filter((c) => c.class_name)
        .map((c) => c.class_name || '')
    );
    return Array.from(unique).sort();
  }, [characters]);

  const races = useMemo(() => {
    const unique = new Set(
      characters
        .filter((c) => c.race)
        .map((c) => c.race || '')
    );
    return Array.from(unique).sort();
  }, [characters]);

  // Filter and sort characters
  const filteredCharacters = useMemo(() => {
    let result = characters.filter((char) => {
      // Search by name
      if (searchQuery && !char.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Filter by class
      if (selectedClass && char.class_name !== selectedClass) {
        return false;
      }
      // Filter by race
      if (selectedRace && char.race !== selectedRace) {
        return false;
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'class':
          return (a.class_name || '').localeCompare(b.class_name || '');
        case 'race':
          return (a.race || '').localeCompare(b.race || '');
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [characters, searchQuery, selectedClass, selectedRace, sortBy]);

  // Notify parent of filtered results
  useEffect(() => {
    onFilteredCharactersChange(filteredCharacters);
  }, [filteredCharacters, onFilteredCharactersChange]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedClass('');
    setSelectedRace('');
    setSortBy('name');
  };

  const hasActiveFilters = searchQuery || selectedClass || selectedRace;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#111827' }}>Search & Filter</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
            Search by Name
          </label>
          <input
            type="text"
            placeholder="Enter character name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg placeholder:text-gray-900 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Class Filter */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
            Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Race Filter */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
            Race
          </label>
          <select
            value={selectedRace}
            onChange={(e) => setSelectedRace(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Races</option>
            {races.map((race) => (
              <option key={race} value={race}>
                {race}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="name">Name</option>
            <option value="class">Class</option>
            <option value="race">Race</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              hasActiveFilters
                ? 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 text-sm text-gray-800 dark:text-gray-400">
        Showing <span className="font-semibold">{filteredCharacters.length}</span> of{' '}
        <span className="font-semibold">{characters.length}</span> characters
      </div>
    </div>
  );
}
