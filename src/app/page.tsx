"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle, // <-- Added this import
} from "@/components/ui/sheet";
import {
  ShieldCheck,
  Headset,
  ArrowRight,
  ChevronRight,
  Settings,
  Phone,
  MapPin,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const router = useRouter();

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-[#050B10] text-white font-sans selection:bg-[#64c5c3] selection:text-black overflow-x-hidden">
      {/* NAVIGATION (Glassmorphic) */}
      <nav className="fixed top-0 w-full z-50 bg-[#050B10]/80 backdrop-blur-xl border-b border-white/5 py-4 px-4 sm:px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        <div className="text-xl md:text-2xl font-black tracking-tighter uppercase">
          MC Ormoc
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-400">
          <Link href="#" className="hover:text-[#64c5c3] transition-colors">
            Home
          </Link>
          <Link href="#" className="hover:text-[#64c5c3] transition-colors">
            Fleet
          </Link>
          <Link href="#" className="hover:text-[#64c5c3] transition-colors">
            Services
          </Link>
          <Link href="#" className="hover:text-[#64c5c3] transition-colors">
            About Us
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/auth/login">
            <Button
              variant="ghost"
              className="text-xs font-bold uppercase tracking-widest text-white hover:text-[#64c5c3] hover:bg-white/10 rounded-full px-6"
            >
              Log In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-full px-6 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(100,197,195,0.2)] transition-all">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile Navigation Sheet */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-full"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-[#050B10] border-l border-white/10 p-6 flex flex-col justify-between w-[85vw] sm:w-80"
            >
              {/* Fix: Added hidden title for screen readers */}
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

              <div className="flex flex-col gap-8 mt-12">
                <Link
                  href="#"
                  className="text-xl font-black uppercase text-white hover:text-[#64c5c3] transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="#"
                  className="text-xl font-black uppercase text-white hover:text-[#64c5c3] transition-colors"
                >
                  Fleet
                </Link>
                <Link
                  href="#"
                  className="text-xl font-black uppercase text-white hover:text-[#64c5c3] transition-colors"
                >
                  Services
                </Link>
                <Link
                  href="#"
                  className="text-xl font-black uppercase text-white hover:text-[#64c5c3] transition-colors"
                >
                  About Us
                </Link>
              </div>
              <div className="flex flex-col gap-4 mb-8">
                <Link href="/auth/login" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white bg-transparent hover:bg-white/10 h-14 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="w-full">
                  <Button className="w-full bg-[#64c5c3] text-black hover:bg-[#52a3a1] h-14 rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(100,197,195,0.2)] transition-all">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2000"
            alt="Cool dark car background"
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050B10]/80 to-[#050B10]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-6 mt-8 lg:mt-0">
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="max-w-2xl text-center lg:text-left w-full"
          >
            <motion.h1
              variants={fadeIn}
              className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9]"
            >
              Explore <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                Leyte
              </span>
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="mt-4 sm:mt-6 text-gray-400 text-xs sm:text-sm max-w-md mx-auto lg:mx-0 uppercase tracking-widest leading-relaxed"
            >
              Hassle-Free Bookings • Self-Drive & Chauffeur • Premium Fleet
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="mt-8 flex justify-center lg:justify-start"
            >
              <Button
                onClick={() => router.push("/customer/fleet")}
                className="bg-[#64c5c3] hover:bg-[#52a3a1] text-[#050B10] font-black uppercase tracking-widest rounded-xl px-8 py-6 sm:py-7 text-xs sm:text-sm shadow-[0_0_20px_rgba(100,197,195,0.3)] transition-all w-full sm:w-auto group"
              >
                Book a Vehicle{" "}
                <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating Hero Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex flex-row justify-center gap-3 sm:gap-4 w-full lg:w-auto"
          >
            <div className="w-36 sm:w-48 h-56 sm:h-64 rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md p-2 shadow-2xl translate-y-4 lg:translate-y-8 flex flex-col">
              <img
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=400"
                className="w-full h-24 sm:h-32 object-cover rounded-xl mb-2 sm:mb-3"
                alt="Toyota Fortuner"
              />
              <div className="px-2 flex-1 flex flex-col justify-end pb-2">
                <p className="text-[9px] sm:text-xs text-[#64c5c3] font-bold tracking-widest mb-1 truncate">
                  TOYOTA FORTUNER
                </p>
                <p className="text-xs sm:text-sm font-bold text-white uppercase">
                  Premium SUV
                </p>
              </div>
            </div>

            <div className="w-36 sm:w-48 h-56 sm:h-64 rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md p-2 shadow-2xl -translate-y-4 lg:-translate-y-8 flex flex-col">
              <img
                src="https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=400"
                className="w-full h-24 sm:h-32 object-cover rounded-xl mb-2 sm:mb-3"
                alt="Hatchback"
              />
              <div className="px-2 flex-1 flex flex-col justify-end pb-2">
                <p className="text-[9px] sm:text-xs text-[#64c5c3] font-bold tracking-widest mb-1 truncate">
                  COMPACT HATCH
                </p>
                <p className="text-xs sm:text-sm font-bold text-white uppercase">
                  Urban Explorer
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES / HIGHLIGHTS */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto -mt-10 sm:-mt-20 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              icon: ShieldCheck,
              title: "Verified Fleet",
              desc: "Every vehicle undergoes strict quality and safety checks between client uses.",
            },
            {
              icon: Settings,
              title: "Instant Booking",
              desc: "Fast and hassle-free reservation process to guarantee your preferred vehicle.",
            },
            {
              icon: Headset,
              title: "Customer Focused",
              desc: "Excellent customer accommodation and support for a worry-free experience.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <Card className="bg-[#0a1118]/80 backdrop-blur-xl border-white/5 rounded-2xl hover:border-[#64c5c3]/30 transition-colors group cursor-pointer h-full shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#64c5c3]/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#64c5c3] group-hover:text-black transition-colors">
                    <item.icon
                      className="text-[#64c5c3] group-hover:text-black transition-colors"
                      size={20}
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black uppercase mb-2 sm:mb-3 text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ABOUT US / IMAGE BREAK */}
      <section className="py-16 sm:py-24 relative mt-8 sm:mt-12">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2000"
            className="w-full h-full object-cover opacity-30"
            alt="Sleek car on road"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050B10] via-[#050B10]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B10] via-transparent to-[#050B10]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <p className="text-[#64c5c3] font-bold tracking-widest text-[10px] sm:text-xs mb-3 sm:mb-4">
              — ABOUT MC ORMOC CAR RENTAL
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight mb-4 sm:mb-6">
              The No. 1 choice for hassle-free exploration.
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 font-medium">
              Based in Ormoc City, we are the leading car rental and travel
              agency in the region. Whether you're on a business trip or a
              family vacation, we offer a diverse, well-maintained fleet to
              guarantee a safe, dependable, and secure journey—always at a
              reasonable price.
            </p>
            <Button
              variant="outline"
              className="border-white/20 text-white bg-transparent hover:bg-white hover:text-black rounded-xl px-8 h-12 sm:h-14 text-[10px] sm:text-xs font-bold uppercase tracking-widest w-full sm:w-auto transition-all"
            >
              Learn Our Story
            </Button>
          </motion.div>
        </div>
      </section>

      {/* SERVICES LIST */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-[#64c5c3] font-bold tracking-widest text-[10px] sm:text-xs mb-3 sm:mb-4">
              — OUR SERVICES
            </p>
            <h2 className="text-3xl sm:text-4xl font-black uppercase mb-4 sm:mb-6">
              Flexible, Affordable, <br className="hidden sm:block" /> And
              Reliable.
            </h2>
            <p className="text-gray-400 text-sm sm:text-base font-medium mb-6 lg:mb-8">
              Choose from a variety of rental options tailored to your specific
              travel and corporate needs across Region VIII.
            </p>
          </div>

          <div className="space-y-2 border-t border-white/10 pt-2">
            {[
              {
                num: "01",
                title: "Self-Drive Rentals",
                desc: "Enjoy independence on a daily, weekly, or monthly basis.",
              },
              {
                num: "02",
                title: "Chauffeur Drive",
                desc: "Hassle-free travel with professional drivers for a relaxing journey.",
              },
              {
                num: "03",
                title: "Airport Transfers",
                desc: "Trustworthy and on-time one-way pickup and drop-off service.",
              },
              {
                num: "04",
                title: "Special Events",
                desc: "The perfect choice for weddings, conventions, and city tours.",
              },
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group flex justify-between items-center py-5 sm:py-6 border-b border-white/10 hover:bg-white/5 transition-all cursor-pointer px-4 rounded-xl"
              >
                <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                  <span className="text-[#64c5c3] font-black text-xs sm:text-sm mt-1 sm:mt-0 shrink-0">
                    {service.num}
                  </span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black uppercase group-hover:text-[#64c5c3] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                      {service.desc}
                    </p>
                  </div>
                </div>
                <div className="bg-white/5 p-2 sm:p-3 rounded-full group-hover:bg-[#64c5c3] group-hover:text-black transition-colors shrink-0 ml-4">
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CARS GRID */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-10 sm:mb-16">
          <p className="text-[#64c5c3] font-bold tracking-widest text-[10px] sm:text-xs mb-3 sm:mb-4">
            — THE FLEET
          </p>
          <h2 className="text-3xl sm:text-4xl font-black uppercase">
            Find Your Perfect Drive
          </h2>

          <div className="flex justify-center gap-2 sm:gap-4 mt-6 sm:mt-8 flex-wrap">
            {[
              "All Vehicles",
              "Sedans",
              "Hatchbacks",
              "MPVs / SUVs",
              "Vans",
            ].map((filter, i) => (
              <button
                key={i}
                className={cn(
                  "px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all",
                  i === 0
                    ? "bg-[#64c5c3] text-black shadow-[0_0_15px_rgba(100,197,195,0.3)]"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5",
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Toyota Fortuner",
              type: "SUV",
              img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800",
            },
            {
              name: "Toyota Innova",
              type: "MPV",
              img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800",
            },
            {
              name: "Toyota Vios",
              type: "Sedan",
              img: "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=800",
            },
            {
              name: "Toyota Avanza",
              type: "MPV",
              img: "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=800",
            },
            {
              name: "Mitsubishi Mirage",
              type: "Hatchback",
              img: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=800",
            },
            {
              name: "Nissan Urvan",
              type: "Van",
              img: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=800",
            },
          ].map((car, i) => (
            <motion.div key={i} whileHover={{ y: -8 }} className="group">
              <div className="rounded-3xl overflow-hidden bg-[#0a1118] border border-white/5 h-full flex flex-col shadow-lg">
                <div className="relative h-48 sm:h-60 overflow-hidden bg-black">
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors z-10" />
                  <img
                    src={car.img}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-bold text-white border border-white/10 uppercase tracking-widest">
                    {car.type}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1118] via-transparent to-transparent z-10" />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between relative z-20 -mt-8">
                  <div className="mb-6">
                    <h3 className="text-xl sm:text-2xl font-black uppercase mb-1 text-white leading-tight">
                      {car.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                      Available for self-drive or with chauffeur
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push("/customer/fleet")}
                    className="w-full bg-white/5 hover:bg-[#64c5c3] text-white hover:text-black border border-white/10 transition-all rounded-xl h-12 text-[10px] font-bold uppercase tracking-widest"
                  >
                    Check Availability
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 sm:mt-16 flex justify-center">
          <Button
            onClick={() => router.push("/customer/fleet")}
            variant="outline"
            className="border-white/20 bg-transparent hover:bg-white hover:text-black text-white rounded-xl px-8 h-14 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all w-full sm:w-auto"
          >
            View Full Inventory
          </Button>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 bg-[#0a1118]/80 backdrop-blur-xl p-5 sm:p-10 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl">
          {/* Subtle gradient blob behind form */}
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#64c5c3]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 w-full lg:w-1/2">
            <h2 className="text-3xl sm:text-4xl font-black uppercase mb-3 sm:mb-4 text-white leading-tight">
              Got Questions? <br /> We're Here To Help!
            </h2>
            <p className="text-gray-400 text-sm sm:text-base font-medium mb-8 sm:mb-10 w-full lg:max-w-md">
              Whether you need help with a booking, want to inquire about
              long-term rentals, or just have a general question, our local team
              in Ormoc is ready to assist.
            </p>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-4 text-gray-300">
                <div className="bg-[#64c5c3]/10 p-3 rounded-xl text-[#64c5c3] shrink-0">
                  <Phone size={20} />
                </div>
                <span className="font-bold text-xs sm:text-sm tracking-widest break-all">
                  +63 967 701 5349
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <div className="bg-[#64c5c3]/10 p-3 rounded-xl text-[#64c5c3] shrink-0">
                  <Headset size={20} />
                </div>
                <span className="font-bold text-xs sm:text-sm tracking-wider uppercase break-all">
                  mcormoccarrental@gmail.com
                </span>
              </div>
              <div className="flex items-start sm:items-center gap-4 text-gray-300">
                <div className="bg-[#64c5c3]/10 p-3 rounded-xl text-[#64c5c3] shrink-0">
                  <MapPin size={20} />
                </div>
                <span className="flex-1 font-bold text-xs sm:text-sm tracking-wider uppercase leading-relaxed">
                  Brgy. Cogon, Ormoc City, Philippines, 6541
                </span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-4 relative z-10 mt-2 lg:mt-0 flex flex-col">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="FIRST NAME"
                className="bg-black/50 border-white/10 h-14 rounded-xl focus-visible:ring-[#64c5c3] text-white placeholder:text-gray-600 text-[10px] sm:text-xs font-bold tracking-widest w-full"
              />
              <Input
                placeholder="LAST NAME"
                className="bg-black/50 border-white/10 h-14 rounded-xl focus-visible:ring-[#64c5c3] text-white placeholder:text-gray-600 text-[10px] sm:text-xs font-bold tracking-widest w-full"
              />
            </div>
            <Input
              placeholder="EMAIL ADDRESS"
              className="bg-black/50 border-white/10 h-14 rounded-xl focus-visible:ring-[#64c5c3] text-white placeholder:text-gray-600 text-[10px] sm:text-xs font-bold tracking-widest w-full"
            />
            <Textarea
              placeholder="HOW CAN WE HELP YOU?"
              className="bg-black/50 border-white/10 min-h-[120px] rounded-xl focus-visible:ring-[#64c5c3] text-white placeholder:text-gray-600 text-[10px] sm:text-xs font-bold tracking-widest resize-none pt-4 w-full"
            />
            <Button className="w-full bg-[#64c5c3] hover:bg-[#52a3a1] text-black font-black text-[10px] sm:text-xs uppercase tracking-widest h-14 rounded-xl mt-2 transition-all shadow-[0_0_15px_rgba(100,197,195,0.2)] shrink-0">
              Send Message
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-black py-10 sm:py-16 px-6 text-center text-gray-500 text-sm">
        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-white/5 uppercase tracking-tighter mb-4 sm:mb-8">
          MC ORMOC
        </h2>
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-600">
          © {new Date().getFullYear()} MC Ormoc Car Rental. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
