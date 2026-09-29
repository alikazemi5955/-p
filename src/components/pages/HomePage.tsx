import React from 'react';
import { HeroBanner } from '../home/HeroBanner.tsx';
import { QuickShortcutsBar } from '../home/QuickShortcutsBar.tsx';
import { SpecialDealsSection } from '../home/SpecialDealsSection.tsx';
import { CategoriesGrid } from '../home/CategoriesGrid.tsx';
import { PromoBanners } from '../home/PromoBanners.tsx';
import { BestsellersShowcase } from '../home/BestsellersShowcase.tsx';
import { NewArrivalsSection } from '../home/NewArrivalsSection.tsx';
import { BrandsCarousel } from '../home/BrandsCarousel.tsx';
import { BenefitsBar } from '../home/BenefitsBar.tsx';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8 pb-8" id="home-page-wrapper">
      <HeroBanner />
      <QuickShortcutsBar />
      <SpecialDealsSection />
      <CategoriesGrid />
      <PromoBanners />
      <BestsellersShowcase />
      <NewArrivalsSection />
      <BrandsCarousel />
      <BenefitsBar />
    </div>
  );
};
