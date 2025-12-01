import React from "react";
import HeroSection from "./HeroSection";
import ThreeDCard from "./ThreeDCard";
import SectionNoFees from "./SectionNoFees";
import StickyScrollSections from "./StickyScrollSections";
import SymbolOfPurchasePowerSection from "./SymbolOfPurchasePowerSection";
import FastTransaction from "./FastTransaction";
import FinalSection from "./FinalSection";
import ContactUs from "./ContactUs";
import Footer from "./Footer";
import "../../styles/ziko/ziko.css";

const Home = () => {
  return (
    <>
      <ThreeDCard />
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
