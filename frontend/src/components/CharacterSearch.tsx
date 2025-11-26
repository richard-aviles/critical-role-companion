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
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-elevated dark:shadow-elevated border border-sky-100 dark:border-sky-900/30 p-6 mb-8 transition-all duration-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Search & Filter</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Search by Name
          </label>
          <input
            type="text"
            placeholder="Enter character name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-sky-300 dark:border-sky-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Class Filter */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 border border-sky-300 dark:border-sky-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 focus:border-transparent transition-all duration-200"
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
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Race
          </label>
          <select
            value={selectedRace}
            onChange={(e) => setSelectedRace(e.target.value)}
            className="w-full px-4 py-2 border border-sky-300 dark:border-sky-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 focus:border-transparent transition-all duration-200"
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
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full px-4 py-2 border border-sky-300 dark:border-sky-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 focus:border-transparent transition-all duration-200"
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
            className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              hasActiveFilters
                ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-800/40 border border-sky-300 dark:border-sky-700 hover:-translate-y-0.5 shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-300 dark:border-gray-600'
            }`}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
        Showing <span className="font-semibold text-sky-600 dark:text-sky-400">{filteredCharacters.length}</span> of{' '}
        <span className="font-semibold">{characters.length}</span> characters
      </div>
    </div>
  );
}
