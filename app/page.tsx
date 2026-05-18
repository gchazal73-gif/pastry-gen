'use client';

import { useState } from 'react';
import RecipeForm from '@/components/RecipeForm';
import RecipeFiche from '@/components/RecipeFiche';

export default function Home() {
  const [recette, setRecette] = useState(null);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Créer une recette</h1>
        <p className="page-subtitle">Mousse aux fruits · Crémeux · Ganache montée · Sorbet</p>
      </div>
      <div className="layout">
        <RecipeForm onRecette={setRecette} />
        <RecipeFiche recette={recette} />
      </div>
    </div>
  );
}
