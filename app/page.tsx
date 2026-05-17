'use client';

import { useState } from 'react';
import RecipeForm from '@/components/RecipeForm';
import RecipeFiche from '@/components/RecipeFiche';

export default function Home() {
  const [recette, setRecette] = useState(null);

  return (
    <div className="wrap">
      <header>
        <h1>Générateur de recettes pâtissières</h1>
        <p>Mousse aux fruits · Crémeux</p>
      </header>
      <div className="layout">
        <RecipeForm onRecette={setRecette} />
        <RecipeFiche recette={recette} />
      </div>
    </div>
  );
}
