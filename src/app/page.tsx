"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  Car,
  Clock,
  Star,
  Key,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CarCard from "@/components/customer/car-card";
import { MOCK_CARS } from "@/components/customer/mock-car";

export default function LandingPage() {
  const router = useRouter();

  // Grab the first 3 cars to feature on the homepage
  const featuredCars = MOCK_CARS.slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/customer/fleet");
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* --- NAVIGATION BAR --- */}
      <nav className="absolute top-0 w-full z-50 bg-transparent border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              MC Ormoc
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/90">
            <Link
              href="/customer/fleet"
              className="hover:text-white transition-colors"
            >
              Our Fleet
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-white transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="#partner"
              className="hover:text-white transition-colors"
            >
              Become a Partner
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden md:block text-sm font-bold text-white hover:text-blue-200 transition-colors"
            >
              Log In
            </Link>
            <Button className="bg-white text-slate-900 hover:bg-blue-50 font-bold rounded-xl shadow-lg">
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2000&auto=format&fit=crop"
            alt="Driving in Leyte"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest border border-blue-400/20 mb-6 backdrop-blur-md">
            <Star className="w-3.5 h-3.5" /> #1 Top Rated in Eastern Visayas
          </span>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
            Explore Leyte with{" "}
            <span className="text-blue-400">confidence.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Premium self-drive and chauffeur-driven car rentals in Ormoc City.
            Instant booking, transparent pricing, and meticulously maintained
            vehicles.
          </p>

          {/* Floating Search Bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2"
          >
            <div className="flex-1 flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <MapPin className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <div className="text-left w-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Pick-up Location
                </p>
                <Input
                  placeholder="Ormoc City Hub"
                  className="border-none shadow-none p-0 h-auto text-sm font-bold text-slate-900 placeholder:text-slate-900 focus-visible:ring-0 bg-transparent"
                />
              </div>
            </div>

            <div className="w-px bg-slate-200 hidden md:block my-2" />

            <div className="flex-1 flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <CalendarDays className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <div className="text-left w-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Dates
                </p>
                <Input
                  placeholder="Add dates"
                  className="border-none shadow-none p-0 h-auto text-sm font-medium text-slate-500 focus-visible:ring-0 bg-transparent"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-auto py-4 px-8 font-bold shadow-md shrink-0 w-full md:w-auto"
            >
              Search Cars
            </Button>
          </form>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Rent a car in 3 easy steps
            </h2>
            <p className="text-slate-500 font-medium">
              Skip the long lines and endless paperwork. We made it simple.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop only) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-200 z-0" />

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                <Car className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                1. Choose your ride
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Browse our wide selection of SUVs, sedans, and vans. Filter by
                your specific needs and budget.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                2. Verify & Book
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Upload your ID for a quick verification. Select your dates, add
                a driver if needed, and confirm your total.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-600 rounded-3xl shadow-md border border-blue-500 flex items-center justify-center mb-6">
                <Key className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                3. Hit the road
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Pick up the car at our Ormoc Hub or have it delivered right to
                your doorstep. Enjoy the journey!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURED FLEET --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                Our Top Rated Vehicles
              </h2>
              <p className="text-slate-500 font-medium">
                Meticulously maintained and ready for your next adventure.
              </p>
            </div>
            <Button
              onClick={() => router.push("/customer/fleet")}
              variant="outline"
              className="rounded-xl font-bold text-slate-700 border-slate-200 hidden md:flex group"
            >
              View Entire Fleet{" "}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <div
                key={car.id}
                onClick={() => router.push("/customer/fleet")}
                className="cursor-pointer"
              >
                {/* We render the CarCard here. 
                  We pass a dummy function for onViewDetails since clicking it on the landing page 
                  should just take them to the main fleet page! 
                */}
                <CarCard
                  car={car}
                  onViewDetails={() => router.push("/customer/fleet")}
                />
              </div>
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Button
              onClick={() => router.push("/customer/fleet")}
              variant="outline"
              className="rounded-xl font-bold text-slate-700 border-slate-200 w-full group"
            >
              View Entire Fleet{" "}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* --- PARTNER CTA --- */}
      <section
        id="partner"
        className="py-24 bg-slate-900 text-white relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Turn your idle car into <br className="hidden md:block" /> an
            earning asset.
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the MC Ormoc Fleet Partner program. We handle the marketing,
            the bookings, and the background checks. You just collect your
            revenue share.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => router.push("/customer/profile")}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 px-8 font-bold shadow-lg w-full sm:w-auto"
            >
              List Your Vehicle Today
            </Button>
            <Button
              size="lg"
              onClick={() => router.push("/customer/profile")}
              variant="outline"
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl h-14 px-8 font-bold w-full sm:w-auto"
            >
              Apply as a Driver
            </Button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
              <Car className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">
              MC Ormoc
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} MC Ormoc Car Rental. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
