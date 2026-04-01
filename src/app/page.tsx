"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  MapPin,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  Key,
  Menu,
  Target,
  Compass,
  Settings2,
  Users,
  Fuel,
  ChevronRight,
  ChevronLeft,
  Car,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CarCardSkeleton } from "@/components/skeletons";

// Fetch the real units hook
import { useUnits } from "../../hooks/use-units";

// --- ANIMATION VARIANTS ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const lineReveal: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.5, ease: "easeInOut" } },
};

// --- CUSTOM HIGH-END LOGO ---
const PremiumLogo = () => (
  <div className="relative w-7 h-7 flex items-center justify-center group cursor-pointer">
    <div className="absolute w-full h-full border-[1.5px] border-white/80 rounded-sm transform rotate-45 transition-transform duration-700 group-hover:rotate-90" />
    <div className="absolute w-full h-full border-[1.5px] border-blue-500/80 rounded-sm transform -rotate-45 transition-transform duration-700 group-hover:-rotate-90" />
    <span className="relative z-10 text-[9px] font-black text-white tracking-tighter">
      M
    </span>
  </div>
);

export default function LandingPage() {
  const router = useRouter();
  const { units, isUnitsLoading } = useUnits();

  // Carousel State
  const [currentCarIndex, setCurrentCarIndex] = useState(0);

  // Format data and grab only the first 3
  const featuredCars = units
    .map((unit: any) => {
      const sortedImages = [...(unit.images || [])].sort((a: any, b: any) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return 0;
      });

      const imageUrls =
        sortedImages.length > 0
          ? sortedImages.map((img: any) => img.image_url)
          : ["https://placehold.co/1200x800?text=No+Image"];

      return {
        id: unit.car_id,
        brand: unit.brand,
        model: unit.model,
        year: unit.year,
        type: unit.specifications?.body_type || "Vehicle",
        transmission: unit.specifications?.transmission || "Auto/Manual",
        seats: unit.specifications?.passenger_capacity || 5,
        fuel: unit.specifications?.fuel_type || "Fuel",
        price: Number(unit.rental_rate_per_day) || 0,
        images: imageUrls,
      };
    })
    .slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/customer/fleet");
  };

  const nextCar = () => {
    setCurrentCarIndex((prev) => (prev + 1) % featuredCars.length);
  };

  const prevCar = () => {
    setCurrentCarIndex((prev) =>
      prev === 0 ? featuredCars.length - 1 : prev - 1,
    );
  };

  return (
    <div className="font-sans bg-[#0A0C10] text-slate-300 min-h-screen selection:bg-blue-900 selection:text-white overflow-x-hidden">
      {/* --- HORIZONTAL TOP NAV (Shorter & Refined) --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0C10]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <div
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <PremiumLogo />
            <span className="text-xs font-light text-white tracking-[0.3em] uppercase hidden sm:block ml-2 mt-0.5">
              MC ORMOC
            </span>
          </div>

          {/* Center: Main Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-10 font-medium text-[9px] uppercase tracking-[0.2em] text-white/60 mt-0.5">
            <Link
              href="#about"
              className="hover:text-blue-400 transition-colors"
            >
              Heritage
            </Link>
            <Link
              href="#process"
              className="hover:text-blue-400 transition-colors"
            >
              Process
            </Link>
            <Link
              href="#fleet"
              className="hover:text-blue-400 transition-colors"
            >
              Portfolio
            </Link>
            <Link
              href="#partner"
              className="hover:text-blue-400 transition-colors"
            >
              Partnership
            </Link>
            <Link
              href="#contact"
              className="hover:text-blue-400 transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Right: Actions (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 text-[9px] font-medium tracking-[0.2em] text-white/60 uppercase mt-0.5">
            <Link href="/login" className="hover:text-white transition-colors">
              Login
            </Link>
            <Button
              onClick={() => router.push("/login")}
              className="bg-blue-600 text-white hover:bg-white hover:text-black rounded-none px-5 py-2.5 h-auto uppercase tracking-widest font-bold transition-colors duration-300"
            >
              Register
            </Button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="lg:hidden cursor-pointer">
            <Menu className="w-5 h-5 text-white/70 hover:text-white transition-colors" />
          </div>
        </div>
      </nav>

      {/* HERO SECTION (Floating Wheel Concept)  */}
      <section className="relative min-h-screen flex flex-col justify-center bg-[#0A0C10] overflow-hidden pt-16 lg:pt-0">
        {/* Subtle Ambient Background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0A0C10] to-[#0A0C10]" />

        <div className="relative z-10 w-full max-w-[90rem] mx-auto px-6 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* Left: Typography & Form */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex-1 max-w-2xl w-full z-20 mt-12 lg:mt-0"
          >
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-6 mb-8"
            >
              <div className="h-[1px] w-16 bg-blue-500/50" />
              <span className="text-blue-400 text-[9px] font-medium uppercase tracking-[0.4em]">
                Premium Mobility • Leyte
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-6xl md:text-[6.5rem] lg:text-[7.5rem] font-light text-white tracking-tighter mb-8 leading-[0.9]"
            >
              Refine <br />
              <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-500 pr-4">
                the drive.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-base md:text-lg text-slate-400 mb-16 max-w-lg font-light leading-relaxed"
            >
              Elevating the standard of everyday travel. Impeccably maintained
              vehicles, zero friction, absolute discretion.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              variants={fadeUp}
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-0 max-w-3xl border border-white/10 rounded-xl bg-[#111623]/80 backdrop-blur-md overflow-hidden"
            >
              <div className="flex-1 flex flex-col justify-center px-6 py-4 border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 transition-colors duration-300">
                <p className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-blue-500" /> Location
                </p>
                <Input
                  placeholder="Ormoc Hub"
                  className="border-none shadow-none p-0 h-auto text-sm font-medium text-slate-200 placeholder:text-slate-600 focus-visible:ring-0 bg-transparent rounded-none"
                />
              </div>

              <div className="flex-1 flex flex-col justify-center px-6 py-4 hover:bg-white/5 transition-colors duration-300">
                <p className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                  <CalendarDays className="w-3 h-3 text-blue-500" /> Schedule
                </p>
                <Input
                  placeholder="Select Dates"
                  className="border-none shadow-none p-0 h-auto text-sm font-medium text-slate-200 placeholder:text-slate-600 focus-visible:ring-0 bg-transparent rounded-none"
                />
              </div>

              <Button
                type="submit"
                className="bg-white text-[#0A0C10] hover:bg-blue-600 hover:text-white rounded-none h-auto py-5 px-8 font-bold text-[10px] uppercase tracking-[0.2em] shrink-0 w-full md:w-auto transition-all duration-300"
              >
                Reserve
              </Button>
            </motion.form>
          </motion.div>

          {/* Right: Floating Wheel Concept */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="flex-1 w-full relative hidden lg:flex items-center justify-center min-h-[70vh]"
          >
            {/* The mesmerizing floating animation */}
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 3, -2, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10 w-full max-w-[450px] aspect-square rounded-full overflow-hidden border border-white/5 shadow-[0_0_80px_rgba(37,99,235,0.15)]"
            >
              {/* https://i.pinimg.com/1200x/20/9d/09/209d0926785d62f34b7207752ac40a16.jpg
              https://i.pinimg.com/1200x/a8/fe/97/a8fe97c9631968e0bed36a865fec3b64.jpg
              https://i.pinimg.com/1200x/41/0b/2f/410b2f79457f13c04e661ec74430caf1.jpg
              https://i.pinimg.com/1200x/7d/3f/ea/7d3feabcf804ef2fe8890b28876a519a.jpg
              */}
              {/* Image of a high-end alloy wheel */}
              <img
                src="https://i.pinimg.com/1200x/41/0b/2f/410b2f79457f13c04e661ec74430caf1.jpg"
                alt="Precision Engineering"
                className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000 scale-105 hover:scale-100 opacity-60"
              />
              {/* Vignette mask so it fades into the background naturally */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0A0C10_100%)] pointer-events-none" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- 2. HERITAGE & ETHOS (About) --- */}
      <section
        id="about"
        className="min-h-screen flex flex-col justify-center py-32 bg-[#050608] relative border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-16 w-full pt-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="mb-24"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-6xl font-light tracking-tighter text-white mb-8"
            >
              A legacy of{" "}
              <span className="italic font-normal text-white/50">
                excellence.
              </span>
            </motion.h2>
            <div className="w-full h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-20"
          >
            <motion.div variants={fadeUp} className="relative group">
              <Compass className="w-6 h-6 text-slate-600 mb-8 group-hover:text-blue-500 transition-colors duration-500" />
              <h3 className="text-[10px] font-medium uppercase tracking-[0.4em] text-slate-400 mb-6">
                Our Vision
              </h3>
              <p className="text-slate-300 font-light leading-relaxed text-lg md:text-xl">
                To establish the benchmark for premium mobility in Eastern
                Visayas, providing an understated, seamless digital experience
                that respects the time and comfort of our clientele.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="relative group">
              <Target className="w-6 h-6 text-slate-600 mb-8 group-hover:text-blue-500 transition-colors duration-500" />
              <h3 className="text-[10px] font-medium uppercase tracking-[0.4em] text-slate-400 mb-6">
                Our Mission
              </h3>
              <p className="text-slate-300 font-light leading-relaxed text-lg md:text-xl">
                To bridge the gap between vehicle owners and discerning renters
                through a meticulously curated fleet, rigorous standards, and
                innovative, frictionless technology.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- 3. THE PROCESS (Shiny Metallic Cards) --- */}
      <section
        id="process"
        className="min-h-screen flex flex-col justify-center relative py-32 bg-[#0A0C10] text-slate-300 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10 w-full pt-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-white mb-8">
                The acquisition{" "}
                <span className="italic font-normal text-white/50">
                  process.
                </span>
              </h2>
              <div className="w-24 h-[1px] bg-blue-500/50" />
            </div>
            <p className="text-slate-500 font-light text-base max-w-sm">
              We have eliminated friction. Our digital concierges ensure you are
              on the road with absolute minimal delay.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "01",
                title: "Curate",
                desc: "Peruse our selection of vehicles, filtering by your specific requirements and preferences.",
              },
              {
                step: "02",
                title: "Authenticate",
                desc: "Submit your credentials through our secure portal for immediate, encrypted verification.",
              },
              {
                step: "03",
                title: "Depart",
                desc: "Collect your keys at our lounge, or request discreet delivery directly to your location.",
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                className="relative p-[1px] rounded-2xl bg-gradient-to-br from-slate-600 via-slate-800 to-black overflow-hidden group"
              >
                <div className="bg-gradient-to-br from-slate-800 via-[#0B0F19] to-black h-full p-10 rounded-2xl relative overflow-hidden transition-all duration-500">
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none" />

                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                        <span className="text-[10px] font-medium tracking-[0.4em] text-blue-400 uppercase">
                          Phase {item.step}
                        </span>
                        <span className="text-4xl font-light text-white/20 group-hover:text-blue-500/50 transition-colors duration-500">
                          {item.step}
                        </span>
                      </div>
                      <h3 className="text-2xl font-light text-white mb-4">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 font-light leading-relaxed text-sm">
                        {item.desc}
                      </p>
                    </div>

                    <div className="flex justify-end mt-12 pt-6 border-t border-white/5">
                      <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-blue-400 group-hover:translate-x-2 transition-all duration-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- 4. THE PORTFOLIO (Interactive Carousel) --- */}
      <section
        id="fleet"
        className="relative min-h-screen flex flex-col justify-center py-32 bg-[#050608] border-t border-white/5 overflow-hidden"
      >
        <div className="max-w-[90rem] mx-auto px-6 lg:px-16 relative z-10 w-full pt-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex flex-col md:flex-row justify-between md:items-end mb-20 gap-8"
          >
            <div>
              <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-white mb-8">
                The{" "}
                <span className="italic font-normal text-white/50">
                  portfolio.
                </span>
              </h2>
              <div className="w-24 h-[1px] bg-blue-500/50" />
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={prevCar}
                disabled={isUnitsLoading || featuredCars.length === 0}
                className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-[#050608] hover:border-white text-white transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextCar}
                disabled={isUnitsLoading || featuredCars.length === 0}
                className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-[#050608] hover:border-white text-white transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          <div className="relative min-h-[500px]">
            {isUnitsLoading ? (
              <div className="text-center py-32 text-slate-600 font-light border border-white/5 rounded-2xl">
                Curating fleet data...
              </div>
            ) : featuredCars.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCarIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24"
                >
                  {/* Image Side */}
                  <div className="w-full lg:w-3/5 relative aspect-video lg:aspect-[16/9] overflow-hidden rounded-sm bg-[#0A0C10] border border-white/5">
                    <img
                      src={featuredCars[currentCarIndex].images[0]}
                      alt={`${featuredCars[currentCarIndex].brand} ${featuredCars[currentCarIndex].model}`}
                      className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000 ease-out scale-105 hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent opacity-50 pointer-events-none" />

                    {/* Carousel Counter */}
                    <div className="absolute top-6 right-6 text-white/50 font-mono text-xs tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                      0{currentCarIndex + 1} / 0{featuredCars.length}
                    </div>
                  </div>

                  {/* Metadata Side */}
                  <div className="w-full lg:w-2/5 flex flex-col">
                    <p className="text-[10px] font-medium text-blue-500 uppercase tracking-[0.4em] mb-4">
                      {featuredCars[currentCarIndex].year} •{" "}
                      {featuredCars[currentCarIndex].brand}
                    </p>
                    <h3 className="text-4xl md:text-5xl font-light text-white mb-10 tracking-tight">
                      {featuredCars[currentCarIndex].model}
                    </h3>

                    {/* Specs Blueprint */}
                    <div className="flex flex-col gap-4 mb-10 border-y border-white/5 py-8">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-light flex items-center gap-3">
                          <Settings2 className="w-4 h-4" /> Transmission
                        </span>
                        <span className="text-slate-300">
                          {featuredCars[currentCarIndex].transmission}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-light flex items-center gap-3">
                          <Users className="w-4 h-4" /> Capacity
                        </span>
                        <span className="text-slate-300">
                          {featuredCars[currentCarIndex].seats} Passengers
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-light flex items-center gap-3">
                          <Fuel className="w-4 h-4" /> Powertrain
                        </span>
                        <span className="text-slate-300">
                          {featuredCars[currentCarIndex].fuel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-[0.3em] mb-2">
                          Daily Rate
                        </p>
                        <p className="text-3xl font-light text-white">
                          ₱
                          {featuredCars[currentCarIndex].price.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => router.push("/customer/fleet")}
                        variant="outline"
                        className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-[#0A0C10] rounded-none h-14 px-8 font-medium text-[10px] uppercase tracking-[0.2em] transition-all duration-300"
                      >
                        Reserve Now
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="col-span-full text-center py-20 text-slate-600 font-light border border-white/5 rounded-2xl">
                The portfolio is currently unavailable.
              </div>
            )}
          </div>

          {/* View All Button */}
          <div className="mt-20 flex justify-center">
            <Button
              onClick={() => router.push("/customer/fleet")}
              variant="link"
              className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors duration-300"
            >
              Explore Complete Catalog
            </Button>
          </div>
        </div>
      </section>

      {/* --- 5. PARTNER CTA --- */}
      <section
        id="partner"
        className="min-h-screen flex flex-col justify-center relative py-32 bg-[#0A0C10] text-white border-t border-white/5 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10 w-full text-center pt-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fadeUp} className="flex justify-center mb-10">
              <div className="w-16 h-[1px] bg-blue-500/50" />
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-6xl font-light tracking-tighter mb-10 leading-tight"
            >
              Convert assets <br /> into{" "}
              <span className="italic font-normal text-white/50">revenue.</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-slate-400 mb-16 font-light leading-relaxed text-lg max-w-xl mx-auto"
            >
              The Partnership Program allows private owners to list premium
              vehicles on our platform. We manage client curation, logistics,
              and security. You collect the yield.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row justify-center gap-6"
            >
              <Button
                onClick={() => router.push("/customer/list-vehicle")}
                className="bg-white text-[#0A0C10] hover:bg-blue-600 hover:text-white rounded-none h-14 px-10 font-bold text-[10px] uppercase tracking-[0.3em] transition-colors duration-300"
              >
                Inquire About Partnership
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- 6. FOOTER & CONTACT --- */}
      <footer
        id="contact"
        className="bg-[#050608] pt-32 pb-12 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10 flex flex-col md:flex-row justify-between gap-16 mb-24">
          <div className="max-w-xs">
            <div className="flex items-center gap-4 mb-8">
              <PremiumLogo />
              <span className="text-xl font-light text-white tracking-[0.3em] uppercase">
                MC ORMOC
              </span>
            </div>
            <p className="text-slate-500 text-sm font-light leading-relaxed">
              Elevating the standard of mobility in the Eastern Visayas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-16">
            <div className="flex flex-col gap-6">
              <h4 className="text-slate-200 font-medium uppercase tracking-[0.3em] text-[10px] mb-2 border-b border-white/10 pb-4">
                Direct Line
              </h4>
              <span className="font-light text-slate-400 text-sm hover:text-white transition-colors cursor-pointer tracking-widest">
                +63 912 345 6789
              </span>
              <span className="font-light text-slate-400 text-sm hover:text-white transition-colors cursor-pointer tracking-widest">
                concierge@mcormoc.com
              </span>
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="text-slate-200 font-medium uppercase tracking-[0.3em] text-[10px] mb-2 border-b border-white/10 pb-4">
                Headquarters
              </h4>
              <span className="font-light text-slate-400 text-sm tracking-widest">
                Ormoc City Proper
              </span>
              <span className="font-light text-slate-400 text-sm tracking-widest">
                Leyte, Philippines 6541
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5">
          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest">
            © {new Date().getFullYear()} MC Ormoc. All rights reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-medium text-slate-500 uppercase tracking-widest">
            <Link href="#" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
