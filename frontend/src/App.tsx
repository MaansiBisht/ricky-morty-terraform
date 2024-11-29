import React, { useState } from 'react';
import axios from 'axios';
import CharacterSearch from './components/CharacterSearch';
import CharacterDetails from './components/CharacterCard';
import Loading from './components/Loading';
import Error from './components/Error';

interface Episode {
  name: string;
  air_date: string;
}

interface Character {
  id: string;
  name: string;
  image: string;
  episodes: Episode[];
}

const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [displayedCharacters, setDisplayedCharacters] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);  // Current page number
  const [itemsPerPage] = useState<number>(4);  // Number of items per page
  const totalPages = Math.ceil(characters.length / itemsPerPage);


  const handleSearch = async (name: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:8000/character', {
        params: { name }, // Send the search term
      });

      const characterData = response.data;

      const charactersWithEpisodes = await Promise.all(
        characterData.map(async (character: any) => {
          const episodes = await Promise.all(
            character.episode.map((episodeUrl: string) =>
              axios.get(episodeUrl).then((res) => res.data)
            )
          );
          return {
            ...character,
            episodes: episodes.map((episode) => ({
              name: episode.name,
              air_date: episode.air_date,
            })),
          };
        })
      );

      // If search term is empty, return all characters
      if (name.trim() === '') {
        setFilteredCharacters(charactersWithEpisodes);
        setDisplayedCharacters(charactersWithEpisodes.slice(0, itemsPerPage)); 
      } else {
        // Filter characters by partial name match
        const filtered = charactersWithEpisodes.filter((character) =>
          character.name.toLowerCase().includes(name.toLowerCase())
        );
        setFilteredCharacters(filtered);
        setDisplayedCharacters(filtered.slice(0, itemsPerPage)); 
      }

      setCharacters(charactersWithEpisodes); // Set all characters (if empty search term)
    } catch (err) {
      setError('Failed to fetch characters');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change (when user clicks pagination button)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedCharacters(characters.slice(startIndex, endIndex));
  };

  return (
    <div className="app min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w">
        <CharacterSearch onSearch={handleSearch} />
        
        {loading && <div className="flex justify-center items-center py-4"><Loading /></div>}
        {error && <div className="flex justify-center items-center py-4"><Error message={error} /></div>}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedCharacters.map((character) => (
            <CharacterDetails
              key={character.id}
              name={character.name}
              image={character.image}
              episodes={character.episodes}
            />
          ))}
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
              >
                Prev
              </button>
              <span className="text-lg">{currentPage} / {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
              >
                Last
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default App;
