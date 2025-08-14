import React from 'react';
import HeroSection from './HeroSection';
import SectionNoFees from './SectionNoFees';
import StickyScrollSections from './StickyScrollSections';
import SymbolOfPurchasePowerSection from './SymbolOfPurchasePowerSection';
import FastTransaction from './FastTransaction';
import FinalSection from './FinalSection';

const Home = () => {
  return (
    <>
      <HeroSection />
      <SectionNoFees />
      <StickyScrollSections />
      <SymbolOfPurchasePowerSection />
      <FastTransaction />
      <FinalSection />
    </>
  );
};

export default Home;
