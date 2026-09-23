"use client";

import React, { useState } from "react";
import { X, Check, Trash2, Plus, Sparkles, MapPin, Building, ShieldCheck, Image as ImageIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { GooglePlacesInput, PlaceResult } from "@/components/google-places-input";

interface AdminPropertyModalProps {
  property: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedProp: any) => void;
  onDeleted?: (propertyId: string) => void;
}

export function AdminPropertyModal({
  property,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
}: AdminPropertyModalProps) {
  if (!isOpen || !property) return null;

  const [formData, setFormData] = useState({
    title: property.title || "",
    rentMonthly: property.rentMonthly || 0,
    deposit: property.deposit || 0,
    maintenanceCharges: property.maintenanceCharges || 0,
    propertyType: property.propertyType || "Apartment",
    roomType: property.roomType || "Single",
    furnishing: property.furnishing || "Fully furnished",
    city: property.city || "",
    area: property.area || "",
    address: property.address || "",
    landmark: property.landmark || "",
    latitude: property.latitude || 25.4526,
    longitude: property.longitude || 81.8349,
    description: property.description || "",
    status: property.status || "PUBLISHED",
    isVerified: property.isVerified ?? true,
    featured: property.featured ?? false,
    images: property.images?.map((img: any) => (typeof img === "string" ? img : img.url)) || [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
    ],
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update property");
      }

      onUpdated({ ...property, ...formData });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete property");
      }
      if (onDeleted) onDeleted(property.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()],
    }));
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_: string, i: number) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 amoled:border-zinc-800 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 amoled:border-zinc-800 bg-slate-50 dark:bg-slate-850 amoled:bg-zinc-900">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              🛠️
            </span>
            <div>
              <h3 className="text-base font-extrabold text-navy-900 dark:text-white font-heading">
                Admin Property Editor
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ID: {property.id} • Owner: {property.owner?.name || "Host"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-3">
            <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider">
              Listing Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Pricing & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-1">
                Monthly Rent (₹)
              </label>
              <input
                type="number"
                value={formData.rentMonthly}
                onChange={(e) => setFormData({ ...formData, rentMonthly: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-1">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-semibold"
              >
                <option value="PUBLISHED">PUBLISHED (Live)</option>
                <option value="DRAFT">DRAFT</option>
                <option value="RENTED">RENTED</option>
                <option value="PAUSED">PAUSED</option>
              </select>
            </div>
          </div>

          {/* Room & Property Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-1">
                Room Type
              </label>
              <select
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Shared">Shared</option>
                <option value="Studio">Studio</option>
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-1">
                Property Type
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white"
              >
                <option value="Apartment">Apartment</option>
                <option value="Independent House">Independent House</option>
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Flat">Flat</option>
                <option value="Co-living">Co-living</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-1">
                Furnishing
              </label>
              <select
                value={formData.furnishing}
                onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white"
              >
                <option value="Fully furnished">Fully furnished</option>
                <option value="Semi furnished">Semi furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>

          {/* Location Details with Google Places Search */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 amoled:bg-zinc-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              Location & Coordinates
            </label>
            <GooglePlacesInput
              placeholder="Search address or area on Google Maps..."
              onPlaceSelect={(place: PlaceResult) => {
                setFormData((prev) => ({
                  ...prev,
                  city: place.city || prev.city,
                  area: place.area || prev.area,
                  address: place.formattedAddress || prev.address,
                  latitude: place.latitude,
                  longitude: place.longitude,
                }));
              }}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div>
                <label className="text-[10px] text-slate-400">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Area</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Admin Badges */}
          <div className="flex items-center gap-6 p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-900 dark:text-purple-300">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>🛡️ Verified Badge</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900 dark:text-amber-300">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span>⭐ Featured on Homepage</span>
            </label>
          </div>

          {/* Photos Manager */}
          <div className="space-y-3">
            <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-brand-500" />
              Property Photos
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste image URL (Unsplash or direct image link)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Photo
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
              {formData.images.map((url: string, index: number) => (
                <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-24 bg-slate-100 dark:bg-slate-800">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-brand-600 text-[9px] font-bold text-white uppercase tracking-wider">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 amoled:border-zinc-800 bg-slate-50 dark:bg-slate-850 amoled:bg-zinc-900 flex items-center justify-between gap-4">
          <button
            disabled={loading}
            onClick={handleDelete}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
              deleteConfirm
                ? "bg-rose-600 text-white hover:bg-rose-700 animate-pulse"
                : "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {deleteConfirm ? "Confirm Delete Listing?" : "Delete Listing"}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-soft flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {loading ? "Saving Changes..." : "Save All Changes"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
