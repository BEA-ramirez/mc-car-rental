"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Wrench,
  ShieldCheck,
  Headset,
  ArrowRight,
  ChevronRight,
  Settings,
  Phone,
  MapPin,
} from "lucide-react";

export default function LandingPage() {
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
      <nav className="fixed top-0 w-full z-50 bg-[#050B10]/50 backdrop-blur-lg border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="text-xl md:text-2xl font-black tracking-tighter uppercase">
          MC Ormoc
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
          <a href="#" className="hover:text-[#64c5c3] transition-colors">
            Home
          </a>
          <a href="#" className="hover:text-[#64c5c3] transition-colors">
            Fleet
          </a>
          <a href="#" className="hover:text-[#64c5c3] transition-colors">
            Services
          </a>
          <a href="#" className="hover:text-[#64c5c3] transition-colors">
            About Us
          </a>
        </div>
        <Button className="bg-[#64c5c3]/10 hover:bg-[#64c5c3]/20 border border-[#64c5c3]/50 text-[#64c5c3] rounded-full px-6">
          Sign In
        </Button>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2000"
            alt="Cool dark car background"
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050B10]/80 to-[#050B10]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.h1
              variants={fadeIn}
              className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9]"
            >
              Explore <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                Leyte
              </span>
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="mt-6 text-gray-400 text-lg max-w-md uppercase tracking-widest text-sm"
            >
              Hassle-Free Bookings • Self-Drive & Chauffeur • Premium Fleet
            </motion.p>

            <motion.div variants={fadeIn} className="mt-8 flex gap-4">
              <Button className="bg-[#64c5c3] hover:bg-[#52a3a1] text-[#050B10] font-bold rounded-full px-8 py-6 text-lg shadow-[0_0_20px_rgba(100,197,195,0.3)]">
                Book a Vehicle <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating Hero Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden lg:flex gap-4 mt-12 md:mt-0"
          >
            <div className="w-48 h-64 rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md p-2 shadow-2xl translate-y-8 flex flex-col">
              <img
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=400"
                className="w-full h-32 object-cover rounded-xl mb-3"
                alt="Toyota Fortuner"
              />
              <div className="px-2">
                <p className="text-xs text-[#64c5c3] font-bold tracking-wider mb-1">
                  TOYOTA FORTUNER
                </p>
                <p className="text-sm font-semibold">Premium SUV</p>
              </div>
            </div>
            <div className="w-48 h-64 rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md p-2 shadow-2xl -translate-y-8 flex flex-col">
              <img
                src="https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=400"
                className="w-full h-32 object-cover rounded-xl mb-3"
                alt="Hatchback"
              />
              <div className="px-2">
                <p className="text-xs text-[#64c5c3] font-bold tracking-wider mb-1">
                  COMPACT HATCH
                </p>
                <p className="text-sm font-semibold">Urban Explorer</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES / HIGHLIGHTS */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto -mt-20 relative z-20">
        <div className="grid md:grid-cols-3 gap-6">
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
              <Card className="bg-[#0a1118]/80 backdrop-blur-xl border-white/5 rounded-2xl hover:border-[#64c5c3]/30 transition-colors group cursor-pointer h-full">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-[#64c5c3]/10 flex items-center justify-center mb-6 group-hover:bg-[#64c5c3]/20 transition-colors">
                    <item.icon className="text-[#64c5c3]" size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#64c5c3]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ABOUT US / IMAGE BREAK */}
      <section className="py-24 relative mt-12">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2000"
            className="w-full h-full object-cover opacity-30"
            alt="Sleek car on road"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050B10] via-[#050B10]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B10] via-transparent to-[#050B10]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <p className="text-[#64c5c3] font-bold tracking-widest text-sm mb-4">
              — ABOUT MC ORMOC CAR RENTAL
            </p>
            <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight mb-6">
              The No. 1 choice for hassle-free exploration.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Based in Ormoc City, we are the leading car rental and travel
              agency in the region. Whether you're on a business trip or a
              family vacation, we offer a diverse, well-maintained fleet to
              guarantee a safe, dependable, and secure journey—always at a
              reasonable price.
            </p>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white hover:text-black rounded-full px-8 py-6"
            >
              Learn Our Story
            </Button>
          </motion.div>
        </div>
      </section>

      {/* SERVICES LIST */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#64c5c3] font-bold tracking-widest text-sm mb-4">
              — OUR SERVICES
            </p>
            <h2 className="text-4xl font-black uppercase mb-6">
              Flexible, Affordable, <br /> And Reliable.
            </h2>
            <p className="text-gray-400 mb-8">
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
                className="group flex justify-between items-center py-6 border-b border-white/10 hover:bg-white/5 transition-all cursor-pointer px-4 rounded-lg"
              >
                <div className="flex items-center gap-6">
                  <span className="text-[#64c5c3] font-mono text-sm">
                    {service.num}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold uppercase group-hover:text-[#64c5c3] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 hidden sm:block">
                      {service.desc}
                    </p>
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-full group-hover:bg-[#64c5c3] group-hover:text-black transition-colors">
                  <ChevronRight size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CARS GRID */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <p className="text-[#64c5c3] font-bold tracking-widest text-sm mb-4">
            — THE FLEET
          </p>
          <h2 className="text-4xl font-black uppercase">
            Find Your Perfect Drive
          </h2>

          <div className="flex justify-center gap-4 mt-8 flex-wrap">
            {[
              "All Vehicles",
              "Sedans",
              "Hatchbacks",
              "MPVs / SUVs",
              "Vans",
            ].map((filter, i) => (
              <button
                key={i}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${i === 0 ? "bg-[#64c5c3] text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <motion.div key={i} whileHover={{ y: -10 }} className="group">
              <div className="rounded-2xl overflow-hidden bg-[#0a1118] border border-white/5 h-full flex flex-col">
                <div className="relative h-60 overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  <img
                    src={car.img}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase tracking-widest">
                    {car.type}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold uppercase mb-1">
                      {car.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Available for self-drive or with chauffeur
                    </p>
                  </div>
                  <Button className="w-full bg-white/5 hover:bg-[#64c5c3] hover:text-black border border-white/10 transition-all rounded-lg">
                    Check Availability
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            className="border-[#64c5c3]/50 text-[#050b10] hover:bg-[#64c5c3] hover:text-black rounded-full px-8 py-6"
          >
            View Full Inventory
          </Button>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 bg-[#0a1118]/50 p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden">
          {/* Subtle gradient blob behind form */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#64c5c3]/10 rounded-full blur-[100px] pointer-events-none" />

          <div>
            <h2 className="text-4xl font-black uppercase mb-4">
              Got Questions? <br /> We're Here To Help!
            </h2>
            <p className="text-gray-400 mb-10 max-w-md">
              Whether you need help with a booking, want to inquire about
              long-term rentals, or just have a general question, our local team
              in Ormoc is ready to assist.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-gray-300">
                <div className="bg-white/5 p-3 rounded-full text-[#64c5c3]">
                  <Phone size={20} />
                </div>
                <span className="font-mono">+63 967 701 5349</span>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <div className="bg-white/5 p-3 rounded-full text-[#64c5c3]">
                  <Headset size={20} />
                </div>
                <span>mcormoccarrental@gmail.com</span>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <div className="bg-white/5 p-3 rounded-full text-[#64c5c3]">
                  <MapPin size={20} />
                </div>
                <span className="max-w-[250px]">
                  Brgy. Cogon, Ormoc City, Philippines, 6541
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                className="bg-black/40 border-white/10 h-14 rounded-xl focus-visible:ring-[#64c5c3]"
              />
              <Input
                placeholder="Last Name"
                className="bg-black/40 border-white/10 h-14 rounded-xl focus-visible:ring-[#64c5c3]"
              />
            </div>
            <Input
              placeholder="Email Address"
              className="bg-black/40 border-white/10 h-14 rounded-xl focus-visible:ring-[#64c5c3]"
            />
            <Textarea
              placeholder="How can we help you?"
              className="bg-black/40 border-white/10 min-h-[120px] rounded-xl focus-visible:ring-[#64c5c3]"
            />
            <Button className="w-full bg-[#64c5c3] hover:bg-[#52a3a1] text-black font-bold h-14 rounded-xl mt-2">
              Send Message
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-black py-12 px-6 text-center text-gray-500 text-sm">
        <h2 className="text-5xl md:text-8xl font-black text-white/5 uppercase tracking-tighter mb-8">
          MC ORMOC
        </h2>
        <p>
          © {new Date().getFullYear()} MC Ormoc Car Rental. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
