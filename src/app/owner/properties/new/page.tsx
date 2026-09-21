"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  IndianRupee,
  Home,
  Sparkles,
  Camera,
  Calendar,
  Users,
  ShieldAlert,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AmenityIcon } from "@/components/amenity-icon";
import { Footer } from "@/components/footer";

const AMENITY_CHOICES = [
  { key: "wifi", name: "High-Speed Wi-Fi", category: "Essentials" },
  { key: "ac", name: "Air Conditioning", category: "Comfort" },
  { key: "bath", name: "Attached Bathroom", category: "Features" },
  { key: "power", name: "Power Backup", category: "Essentials" },
  { key: "cctv", name: "CCTV Security", category: "Safety" },
  { key: "parking", name: "Reserved Parking", category: "Features" },
  { key: "washer", name: "Washing Machine", category: "Essentials" },
  { key: "geyser", name: "Geyser / Water Heater", category: "Comfort" },
  { key: "food", name: "Daily Meals Provided", category: "Services" },
  { key: "cleaning", name: "Daily Housekeeping", category: "Services" },
  { key: "tv", name: "Smart TV", category: "Entertainment" },
  { key: "fridge", name: "Refrigerator", category: "Features" },
];

export default function NewPropertyWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: "Premium Sunlit Single Room in Civil Lines",
    propertyType: "Independent House",
    roomType: "Single",
    description:
      "Fully renovated private room with attached washroom, dedicated work-from-home desk, and high speed optic fiber. Located in a quiet green lane close to restaurants and transit.",
    // Step 2: Location
    country: "India",
    state: "Uttar Pradesh",
    city: "Prayagraj",
    area: "Civil Lines",
    address: "Plot 18, Tashkent Marg, Civil Lines",
    landmark: "Behind Coffee House",
    latitude: 25.4526,
    longitude: 81.8349,
    distanceToHub: "500m to Railway Junction",
    // Step 3: Pricing
    rentMonthly: 8500,
    deposit: 8500,
    maintenanceCharges: 400,
    electricityIncluded: false,
    waterIncluded: true,
    foodIncluded: false,
    // Step 4: Details
    furnishing: "Fully furnished",
    floor: 2,
    totalFloors: 3,
    roomSizeSqft: 220,
    bathrooms: 1,
    balconies: 1,
    kitchenType: "Shared",
    parkingType: "Two Wheeler",
    // Step 5: Amenities
    amenities: ["wifi", "ac", "bath", "power", "cctv", "geyser"],
    // Step 6: Photos
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1000",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000",
    ],
    videoUrl: "",
    // Step 7: Availability
    availableFrom: new Date().toISOString().split("T")[0],
    minStayMonths: 2,
    maxStayMonths: 12,
    // Step 8: Preferences
    genderPreference: "Any",
    tenantPreference: "Working Professionals",
    // Step 9: Rules
    rules: [
      { ruleText: "Quiet hours after 10:30 PM", ruleType: "ALLOWED" },
      { ruleText: "No smoking inside the room", ruleType: "NOT_ALLOWED" },
      { ruleText: "Visitors welcome during daytime", ruleType: "ALLOWED" },
    ],
  });

  const handleNext = () => {
    if (currentStep < 10) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAmenityToggle = (key: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(key);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((k) => k !== key)
          : [...prev.amenities, key],
      };
    });
  };

  const handleAddImageUrl = (url: string) => {
    if (!url.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url.trim()],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Map amenity keys to objects
      const selectedAmenities = formData.amenities.map((k) => {
        const choice = AMENITY_CHOICES.find((c) => c.key === k);
        return {
          name: choice?.name || k,
          category: choice?.category || "General",
          iconKey: k,
        };
      });

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amenities: selectedAmenities,
          images: formData.images.map((url, idx) => ({
            url,
            caption: idx === 0 ? "Cover Photo" : `Interior Photo ${idx + 1}`,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish listing");
      }

      router.push(`/property/${data.property.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to publish listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 amoled:bg-black transition-colors">
      
      {/* Wizard Header with Progress Bar */}
      <div className="bg-white dark:bg-slate-900 amoled:bg-black border-b border-slate-200/80 dark:border-slate-800 amoled:border-zinc-850 px-4 py-6 sticky top-20 z-30 shadow-soft">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              Step {currentStep} of 10
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-semibold">
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Location & Landmark"}
              {currentStep === 3 && "Pricing & Deposit"}
              {currentStep === 4 && "Room & Space Details"}
              {currentStep === 5 && "Amenities Selection"}
              {currentStep === 6 && "Photos & Media"}
              {currentStep === 7 && "Availability & Terms"}
              {currentStep === 8 && "Tenant Preferences"}
              {currentStep === 9 && "House Rules"}
              {currentStep === 10 && "Review & Publish"}
            </span>
          </div>

          {/* Progress bar line */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 amoled:bg-zinc-900 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft p-6 sm:p-10 space-y-8">
          
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-navy-900 dark:text-white font-heading">
                  Property Basic Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Give your room listing an attractive title and clear description.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                  Listing Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Property Type
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-900 focus:outline-none"
                  >
                    <option value="Independent House">Independent House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="PG">PG (Paying Guest)</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Flat">Flat</option>
                    <option value="Co-living">Co-living Space</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Room Type
                  </label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-900 focus:outline-none"
                  >
                    <option value="Single">Single Private Room</option>
                    <option value="Double">Double Sharing</option>
                    <option value="Triple">Triple Sharing</option>
                    <option value="Studio">Studio Apartment</option>
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-navy-900 font-heading">
                  Property Location
                </h2>
                <p className="text-xs text-slate-500">
                  Help prospective tenants find your room easily.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                  Full Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Nearby Landmark
                  </label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Distance to Major Hub / Transit
                  </label>
                  <input
                    type="text"
                    value={formData.distanceToHub}
                    onChange={(e) => setFormData({ ...formData, distanceToHub: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Pricing */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-navy-900 font-heading">
                  Rent & Pricing Structure
                </h2>
                <p className="text-xs text-slate-500">
                  Set transparent pricing with clear inclusions for utilities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Monthly Rent (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.rentMonthly}
                    onChange={(e) => setFormData({ ...formData, rentMonthly: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-navy-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-navy-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Maintenance Charges (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.maintenanceCharges}
                    onChange={(e) => setFormData({ ...formData, maintenanceCharges: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-navy-900"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-navy-900">
                  <input
                    type="checkbox"
                    checked={formData.foodIncluded}
                    onChange={(e) => setFormData({ ...formData, foodIncluded: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span>Food / Daily Meals included in monthly rent</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-navy-900">
                  <input
                    type="checkbox"
                    checked={formData.waterIncluded}
                    onChange={(e) => setFormData({ ...formData, waterIncluded: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span>24/7 Water Supply included in monthly rent</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-navy-900">
                  <input
                    type="checkbox"
                    checked={formData.electricityIncluded}
                    onChange={(e) => setFormData({ ...formData, electricityIncluded: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span>Electricity included (otherwise sub-meter rates apply)</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Property Details */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-navy-900 font-heading">
                  Room & Space Details
                </h2>
                <p className="text-xs text-slate-500">
                  Furnishing, floor, dimensions, and attached utilities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Furnishing
                  </label>
                  <select
                    value={formData.furnishing}
                    onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="Fully furnished">Fully furnished</option>
                    <option value="Semi furnished">Semi furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Room Size (sq.ft)
                  </label>
                  <input
                    type="number"
                    value={formData.roomSizeSqft}
                    onChange={(e) => setFormData({ ...formData, roomSizeSqft: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Floor Number
                  </label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Attached Bathrooms
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Balconies
                  </label>
                  <input
                    type="number"
                    value={formData.balconies}
                    onChange={(e) => setFormData({ ...formData, balconies: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Parking Type
                  </label>
                  <select
                    value={formData.parkingType}
                    onChange={(e) => setFormData({ ...formData, parkingType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="Two Wheeler">Two Wheeler</option>
                    <option value="Four Wheeler">Four Wheeler</option>
                    <option value="Both">Both</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Amenities */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-navy-900 font-heading">
                  Amenities & Facilities
                </h2>
                <p className="text-xs text-slate-500">
                  Select all the facilities available for the tenant.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AMENITY_CHOICES.map((choice) => {
                  const isChecked = formData.amenities.includes(choice.key);
                  return (
                    <button
                      type="button"
                      key={choice.key}
                      onClick={() => handleAmenityToggle(choice.key)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        isChecked
                          ? "bg-brand-50 border-brand-500 text-brand-900 font-bold shadow-soft"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <AmenityIcon iconKey={choice.key} className="w-5 h-5 text-brand-600 shrink-0" />
                      <span className="text-xs truncate">{choice.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Photos */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-navy-900 font-heading">
                  Photos & Media
                </h2>
                <p className="text-xs text-slate-500">
                  High quality photos increase tenant inquiries by 300%.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-brand-600 text-white text-[10px] font-bold">
                        Cover Photo
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Quick photo url adder */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-navy-900">
                  Add Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    id="newImgInput"
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("newImgInput") as HTMLInputElement;
                      if (input && input.value) {
                        handleAddImageUrl(input.value);
                        input.value = "";
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-brand-600"
                  >
                    Add Photo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Availability */}
          {currentStep === 7 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-navy-900 font-heading">
                  Availability & Lease Terms
                </h2>
                <p className="text-xs text-slate-500">
                  Specify move-in dates and minimum commitment period.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Available From
                  </label>
                  <input
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Minimum Stay (Months)
                  </label>
                  <input
                    type="number"
                    value={formData.minStayMonths}
                    onChange={(e) => setFormData({ ...formData, minStayMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Maximum Stay (Months)
                  </label>
                  <input
                    type="number"
                    value={formData.maxStayMonths}
                    onChange={(e) => setFormData({ ...formData, maxStayMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Preferences */}
          {currentStep === 8 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-navy-900 font-heading">
                  Tenant Preferences
                </h2>
                <p className="text-xs text-slate-500">
                  Target the appropriate tenants for your property.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Gender Preference
                  </label>
                  <select
                    value={formData.genderPreference}
                    onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="Any">Any Gender</option>
                    <option value="Male">Male Tenants Only</option>
                    <option value="Female">Female Tenants Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                    Tenant Profile
                  </label>
                  <select
                    value={formData.tenantPreference}
                    onChange={(e) => setFormData({ ...formData, tenantPreference: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="Any">Anyone (Students & Professionals)</option>
                    <option value="Students">College / University Students</option>
                    <option value="Working Professionals">Working Professionals</option>
                    <option value="Family">Families</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: House Rules */}
          {currentStep === 9 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-navy-900 font-heading">
                  House Rules & Policies
                </h2>
                <p className="text-xs text-slate-500">
                  Set clear guidelines to prevent disputes.
                </p>
              </div>

              <div className="space-y-3">
                {formData.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-medium text-navy-900 flex-1">{rule.ruleText}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          rules: formData.rules.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-slate-400 hover:text-rose-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 10: Review & Publish */}
          {currentStep === 10 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-navy-900 font-heading">
                    Preview & Publish Listing
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review your room details before publishing to tenants.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Ready to Publish
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex gap-4">
                  <div className="w-28 h-20 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                    <img src={formData.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-navy-900">{formData.title}</h3>
                    <p className="text-xs text-slate-500">{formData.area}, {formData.city}</p>
                    <p className="text-sm font-extrabold text-brand-700 mt-1">
                      {formatCurrency(formData.rentMonthly)}/mo • Deposit {formatCurrency(formData.deposit)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block">Type</span>
                    <span className="font-bold text-navy-900">{formData.roomType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Furnishing</span>
                    <span className="font-bold text-navy-900">{formData.furnishing}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Available</span>
                    <span className="font-bold text-navy-900">{formData.availableFrom}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Suitable For</span>
                    <span className="font-bold text-navy-900">{formData.tenantPreference}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            ) : <div />}

            {currentStep < 10 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-navy-900 hover:bg-brand-600 transition-colors shadow-soft"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="px-8 py-3 rounded-2xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-md shadow-brand-600/30 flex items-center gap-2"
              >
                {submitting ? "Publishing Listing..." : "Publish Listing Now 🚀"}
              </button>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
