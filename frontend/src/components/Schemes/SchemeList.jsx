import React, { useState } from 'react';
import SchemeCard from './SchemeCard';

const categories = ['All', 'Agriculture', 'Housing', 'Health', 'Education', 'Women', 'Employment'];

const SchemeList = ({ schemes, onApply }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredSchemes = activeCategory === 'All' 
    ? schemes 
    : schemes.filter(s => s.category === activeCategory);

  return (
    <div className="w-full">
      <div className="flex overflow-x-auto pb-4 mb-4 hide-scrollbar space-x-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === category
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSchemes.map(scheme => (
          <SchemeCard key={scheme.id} scheme={scheme} onApply={onApply} />
        ))}
      </div>
      
      {filteredSchemes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No schemes found in this category.
        </div>
      )}
    </div>
  );
};

export default SchemeList;
