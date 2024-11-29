import React, { useState } from 'react';

interface CharacterSearchProps {
  onSearch: (name: string) => void;
}

const CharacterSearch: React.FC<CharacterSearchProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 p-4 bg-gray-100 rounded-lg shadow-md">
      <input
        type="text"
        placeholder="Search character by name"
        value={searchTerm}
        onChange={handleChange}
        className="px-4 py-2 w-full max-w-md border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        onClick={handleSearch}
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Search
      </button>
    </div>
  );
};

export default CharacterSearch;
