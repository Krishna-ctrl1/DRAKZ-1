import React from 'react';
import HeroSection from './HeroSection';
import SectionNoFees from './SectionNoFees';
import StickyScrollSections from './StickyScrollSections';
import SymbolOfPurchasePowerSection from './SymbolOfPurchasePowerSection';
import FastTransaction from './FastTransaction';
import FinalSection from './FinalSection';
import ContactUs from './ContactUs';
import Footer from './Footer';

const Home = () => {
  return (
    <>
      <HeroSection />
      <SectionNoFees />
      <StickyScrollSections />
      <SymbolOfPurchasePowerSection />
      <FastTransaction />
      <FinalSection />
      <ContactUs />
      <Footer />
    </>
  );
};

export default Home;
