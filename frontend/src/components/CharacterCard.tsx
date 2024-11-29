import React from 'react';

interface Episode {
  name: string;
  air_date: string;
}

interface CharacterDetailsProps {
  name: string;
  image: string;
  episodes: Episode[];
}

const CharacterDetails: React.FC<CharacterDetailsProps> = ({ name, image, episodes }) => {
    return (
        <div className="max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="relative">
            <img src={image} alt={name} className="w-full h-48 object-cover rounded-t-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-30"></div>
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">{name}</h2>
            
            {/* Episodes Section */}
            <ul className="list-none pl-0 text-sm text-gray-700 space-y-2 max-h-48 overflow-y-auto">
              {episodes.map((episode, index) => (
                <li key={index} className="transition duration-200 hover:text-blue-600 hover:underline">
                  <span className="text-sm">{episode.name}</span> - {episode.air_date}
                </li>
              ))}
            </ul>
          </div>
        </div>
    );
};

export default CharacterDetails;
