"use client";

import { ArrowUpRight, Mail, X, Search, Filter, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { JAYLAN_CATEGORIES, type Category } from "@/src/data";
import React, { useState, useMemo, useEffect } from "react";
import { getAirtableInventory } from "@/src/services/airtable";
import { ItemDetail } from "@/src/components/ui/item-detail";
import { cn } from "@/src/lib/utils";

type AugmentedCategory = Category & {
  _isLive: boolean;
  _matchCount: number;
};

const STATUS_PILL_ACTIVE: Record<string, string> = {
  "Available":           "bg-green-500 text-white border-green-500",
  "Reserved":            "bg-amber-500 text-white border-amber-500",
  "Pending Inspection":  "bg-blue-500 text-white border-blue-500",
  "Sold":                "bg-zinc-500 text-white border-zinc-500",
  "Internal Hold":       "bg-orange-500 text-white border-orange-500",
};

function statusCardColors(status: string) {
  switch (status) {
    case "Available":
      return { border: "border-green-100 hover:border-green-300",   dot: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200" };
    case "Reserved":
      return { border: "border-amber-100 hover:border-amber-300",   dot: "bg-amber-500",  badge: "bg-amber-50 text-amber-700 border-amber-200" };
    case "Pending Inspection":
      return { border: "border-blue-100 hover:border-blue-300",     dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700 border-blue-200" };
    case "Sold":
      return { border: "border-zinc-100 hover:border-zinc-200",     dot: "bg-zinc-400",   badge: "bg-zinc-100 text-zinc-500 border-zinc-200" };
    case "Internal Hold":
      return { border: "border-orange-100 hover:border-orange-300", dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-200" };
    default:
      return { border: "border-zinc-100 hover:border-zinc-200",     dot: "bg-zinc-400",   badge: "bg-zinc-50 text-zinc-500 border-zinc-200" };
  }
}

export function CommerceHero() {
  const [categories, setCategories] = useState<Category[]>(JAYLAN_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemCategory, setItemCategory] = useState<string>("");
  const [fetchStatus, setFetchStatus] = useState<"idle" | "loading" | "success" | "error" | "no-credentials">("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const [sortBy, setSortBy] = useState<"number" | "title-asc" | "title-desc" | "manufacturer-asc" | "year-desc" | "price-asc">("number");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubcategory, setFilterSubcategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  const [filterSystemStatus] = useState("all");
  const [allItems, setAllItems] = useState<any[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const activeFilterCount = [
    filterSubcategory !== "all",
    filterStatus !== "all",
    filterCondition !== "all",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setFilterSubcategory("all");
    setFilterStatus("all");
    setFilterCondition("all");
  };

  useEffect(() => {
    async function loadData() {
      setFetchStatus("loading");
      try {
        const items = await getAirtableInventory();

        if (items) {
          setItemCount(items.length);
          setAllItems(items);
          setFetchStatus("success");

          const updatedCategories = JAYLAN_CATEGORIES.map((baseCat) => {
            const categoryItems = items.filter((item) => {
              const itemCat = String(item.category).toUpperCase();
              const catTitle = baseCat.title.toUpperCase();
              const catNum = baseCat.number;
              return (
                itemCat.includes(catTitle) ||
                itemCat.includes(catNum) ||
                catTitle.includes(itemCat)
              );
            });

            if (categoryItems.length > 0) {
              return {
                ...baseCat,
                image: categoryItems[0].image || baseCat.image,
                subCategories: [
                  {
                    title: "Live Inventory",
                    items: categoryItems.map((i) => i.name),
                    _fullItems: categoryItems,
                  },
                ],
              };
            }
            return { ...baseCat, subCategories: [] };
          });
          setCategories(updatedCategories);

          const urlParams = new URLSearchParams(window.location.search);
          const itemId = urlParams.get("item");
          if (itemId) {
            const item = items.find((i) => i.id === itemId || i.name === itemId);
            if (item) {
              setSelectedItem(item);
              const itemCat = String(item.category ?? "").toUpperCase();
              const cat = updatedCategories.find(
                (c) =>
                  itemCat.includes(c.title.toUpperCase()) ||
                  c.title.toUpperCase().includes(itemCat)
              );
              if (cat) setItemCategory(cat.title);
            }
          }
        } else {
          setFetchStatus("no-credentials");
        }
      } catch (e: any) {
        console.error("Error in loadData:", e);
        setFetchStatus("error");
        setErrorDetail(e.message ?? String(e));
      }
    }
    loadData();
  }, []);

  const openItem = (fullItem: any, categoryTitle: string) => {
    setItemCategory(categoryTitle);
    setSelectedCategory(null);
    setSelectedItem(fullItem);
    const url = new URL(window.location.href);
    url.searchParams.set("item", fullItem.id);
    window.history.replaceState({}, "", url.toString());
  };

  const closeItem = () => {
    setSelectedItem(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("item");
    window.history.replaceState({}, "", url.toString());
  };

  const handleInquiryAction = (e: React.MouseEvent, itemName: string) => {
    e.stopPropagation();
    const subject = encodeURIComponent(`Inquiry: ${itemName}`);
    window.location.href = `mailto:connect@jaylansolutions.com?subject=${subject}`;
  };

  const filteredCategories = useMemo((): AugmentedCategory[] => {
    let result: AugmentedCategory[] = categories.map((cat) => {
      const liveSubcatIndex =
        cat.subCategories?.findIndex((s) => s.title === "Live Inventory") ?? -1;

      if (liveSubcatIndex !== -1) {
        const liveSub = cat.subCategories![liveSubcatIndex] as any;
        const originalItems: any[] = liveSub._fullItems ?? [];

        const filteredLiveItems = originalItems.filter((item: any) => {
          const matchSubcat = filterSubcategory === "all" || item.subcategory === filterSubcategory;
          const matchStatus = filterStatus === "all" || item.status === filterStatus;
          const matchCondition = filterCondition === "all" || item.condition === filterCondition;
          const matchSystem = filterSystemStatus === "all" || item.systemStatus === filterSystemStatus;
          return matchSubcat && matchStatus && matchCondition && matchSystem;
        });

        return {
          ...cat,
          _isLive: true,
          _matchCount: filteredLiveItems.length,
          subCategories: [
            {
              ...cat.subCategories![liveSubcatIndex],
              items: filteredLiveItems.map((i: any) => i.name),
              _fullItems: filteredLiveItems,
            } as any,
          ],
        };
      }
      return { ...cat, _isLive: false, _matchCount: 0 };
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (cat) =>
          cat.title.toLowerCase().includes(q) ||
          cat.description.toLowerCase().includes(q) ||
          (cat._isLive &&
            (cat.subCategories?.[0] as any)?._fullItems?.some(
              (i: any) =>
                i.name.toLowerCase().includes(q) ||
                i.manufacturer?.toLowerCase().includes(q) ||
                i.model?.toLowerCase().includes(q)
            ))
      );
    }

    if (filterCategory !== "all") {
      result = result.filter((cat) => cat.title === filterCategory);
    }

    const anyLiveFilterActive =
      filterSubcategory !== "all" ||
      filterStatus !== "all" ||
      filterCondition !== "all" ||
      filterSystemStatus !== "all";

    if (anyLiveFilterActive) {
      result = result.filter((cat) => cat._isLive && cat._matchCount > 0);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "title-asc": return a.title.localeCompare(b.title);
        case "title-desc": return b.title.localeCompare(a.title);
        case "manufacturer-asc": {
          const getM = (c: AugmentedCategory) =>
            (c.subCategories?.[0] as any)?._fullItems?.[0]?.manufacturer ?? "ZZZZ";
          return getM(a).localeCompare(getM(b));
        }
        case "year-desc": {
          const getY = (c: AugmentedCategory) =>
            Math.max(
              ...((c.subCategories?.[0] as any)?._fullItems?.map(
                (i: any) => parseInt(i.year) || 0
              ) ?? [0])
            );
          return getY(b) - getY(a);
        }
        case "price-asc": {
          const getP = (c: AugmentedCategory) => {
            const prices: number[] =
              (c.subCategories?.[0] as any)?._fullItems?.map(
                (i: any) =>
                  parseFloat(String(i.askingPrice || i.price).replace(/[^0-9.]/g, "")) || Infinity
              ) ?? [Infinity];
            return Math.min(...prices);
          };
          return getP(a) - getP(b);
        }
        case "number":
        default:
          return a.number.localeCompare(b.number);
      }
    });

    return result;
  }, [searchQuery, categories, sortBy, filterCategory, filterSubcategory, filterStatus, filterCondition, filterSystemStatus]);

  // Reset subcategory when category changes so stale selections don't linger
  useEffect(() => {
    setFilterSubcategory("all");
  }, [filterCategory]);

  // Derive filter options directly from live Airtable data so they always match exactly
  const liveStatuses = useMemo(() => {
    const vals = Array.from(new Set(allItems.map((i) => i.status))).filter(Boolean) as string[];
    return vals.sort();
  }, [allItems]);

  const liveConditions = useMemo(() => {
    const vals = Array.from(new Set(allItems.map((i) => i.condition))).filter(Boolean) as string[];
    return vals.sort();
  }, [allItems]);

  // Subcategories scoped to the currently selected category filter
  const visibleSubcategories = useMemo(() => {
    let relevantItems = allItems;
    if (filterCategory !== "all") {
      const catTitle = filterCategory.toUpperCase();
      relevantItems = allItems.filter((item) => {
        const itemCat = String(item.category).toUpperCase();
        return itemCat.includes(catTitle) || catTitle.includes(itemCat);
      });
    }
    const subcats = Array.from(new Set(relevantItems.map((i) => i.subcategory))).filter(Boolean) as string[];
    return subcats.sort();
  }, [allItems, filterCategory]);

  return (
    <div className="w-full relative container px-2 mx-auto max-w-7xl font-sans selection:bg-orange-500/30">

      {/* ── Equipment Line Card ── */}
      <div className="mt-8 mb-24">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-6 px-2">
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">
            Equipment Line Card
            <div className="h-1 w-12 bg-amber-500 mt-1" />
          </h2>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Search */}
            <div className="relative group w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-amber-600 transition-colors" />
              <Input
                placeholder="Search inventory..."
                className="pl-10 h-9 bg-white border-zinc-200 focus:bg-white rounded-full text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200">
              <span className="text-[9px] font-black uppercase text-zinc-400 pl-3 pr-1 tracking-widest">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-transparent text-[11px] font-bold text-zinc-700 focus:outline-none cursor-pointer pr-3"
              >
                <option value="number">Featured (No.)</option>
                <option value="title-asc">A to Z</option>
                <option value="title-desc">Z to A</option>
                <option value="manufacturer-asc">By Manufacturer</option>
                <option value="year-desc">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
              </select>
            </div>

            {/* Category */}
            <div className="flex items-center gap-2 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200">
              <span className="text-[9px] font-black uppercase text-zinc-400 pl-3 pr-1 tracking-widest">Category</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-zinc-700 focus:outline-none cursor-pointer pr-3 max-w-[130px]"
              >
                <option value="all">All Categories</option>
                {JAYLAN_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.title}>{cat.number} – {cat.title}</option>
                ))}
              </select>
            </div>

            {/* Filters toggle — only shown when live data is loaded */}
            {fetchStatus === "success" && (
              <button
                onClick={() => setShowFilterPanel((v) => !v)}
                className={cn(
                  "flex items-center gap-2 h-9 px-4 rounded-full border text-[11px] font-black uppercase tracking-wider transition-all",
                  showFilterPanel || activeFilterCount > 0
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:border-zinc-400"
                )}
              >
                <Filter className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-zinc-900 text-[9px] font-black flex items-center justify-center leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            {/* Status badges */}
            <div className="flex items-center gap-2 ml-auto lg:ml-0">
              {fetchStatus === "success" && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-green-200">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  Live: {itemCount} Items
                </span>
              )}
              {fetchStatus === "loading" && (
                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[9px] font-black uppercase tracking-wider rounded-md border border-zinc-200 animate-pulse">
                  Syncing...
                </span>
              )}
              {fetchStatus === "error" && (
                <span
                  className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-red-200 cursor-help"
                  title={errorDetail ?? "Failed to sync with Airtable."}
                >
                  Sync Error
                </span>
              )}
              {fetchStatus === "no-credentials" && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-wider rounded-md border border-amber-100 italic">
                  Local Mode
                </span>
              )}
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {filteredCategories.length} Categories
              </span>
            </div>
          </div>
        </div>

        {/* ── Filter Panel ── */}
        <AnimatePresence>
          {showFilterPanel && fetchStatus === "success" && (
            <motion.div
              key="filter-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden px-2"
            >
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">
                    Filter Inventory
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* STATUS — values read live from Airtable */}
                  {liveStatuses.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Status</p>
                    <div className="flex flex-wrap gap-1.5">
                      {liveStatuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => setFilterStatus((f) => (f === s ? "all" : s))}
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all",
                            filterStatus === s
                              ? (STATUS_PILL_ACTIVE[s] ?? "bg-amber-500 text-white border-amber-500")
                              : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-700"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* CONDITION — values read live from Airtable */}
                  {liveConditions.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Condition</p>
                    <div className="flex flex-wrap gap-1.5">
                      {liveConditions.map((c) => (
                        <button
                          key={c}
                          onClick={() => setFilterCondition((f) => (f === c ? "all" : c))}
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all",
                            filterCondition === c
                              ? "bg-amber-500 text-white border-amber-500"
                              : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-700"
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* SUBCATEGORY — scoped to selected category, all subcats when no category selected */}
                  {visibleSubcategories.length > 0 && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
                        Subcategory
                        {filterCategory !== "all" && (
                          <span className="ml-2 text-amber-600 normal-case font-bold tracking-normal">({filterCategory})</span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {visibleSubcategories.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => setFilterSubcategory((f) => (f === sub ? "all" : sub))}
                            className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all",
                              filterSubcategory === sub
                                ? "bg-amber-500 text-white border-amber-500"
                                : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-700"
                            )}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Category Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCategories.map((category, index) => (
              <motion.div
                layout
                key={category.id}
                className="group cursor-pointer relative bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:border-amber-500/50 hover:shadow-2xl transition-all duration-500 p-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                onClick={() => setSelectedCategory(category)}
              >
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-100 relative">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black tracking-widest border border-white/20">
                    {category.number}
                  </div>
                  {(category as AugmentedCategory)._isLive && (category as AugmentedCategory)._matchCount > 0 && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-[9px] font-black text-white uppercase tracking-wider">
                        {(category as AugmentedCategory)._matchCount} Units
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-base font-black text-zinc-900 mb-1 group-hover:text-amber-600 transition-colors leading-tight">
                    {category.title}
                  </h3>
                  <p className="text-sm font-bold text-zinc-400 uppercase tracking-wide">
                    {category.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                      View Inventory
                    </span>
                    <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Category Detail Modal ── */}
      <AnimatePresence>
        {selectedCategory && (() => {
          const liveItems: any[] =
            (selectedCategory.subCategories as any)?.find(
              (s: any) => s.title === "Live Inventory"
            )?._fullItems ?? [];
          const showEmpty = fetchStatus === "success" && liveItems.length === 0;

          return (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xl pointer-events-auto"
                onClick={() => setSelectedCategory(null)}
              />
              <motion.div
                className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden pointer-events-auto border border-zinc-200"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
              >
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="absolute top-8 right-8 w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-all z-20 group"
                >
                  <X className="w-6 h-6 text-zinc-500 group-hover:rotate-90 transition-transform" />
                </button>

                <div className="flex flex-col lg:flex-row h-full max-h-[85vh] overflow-y-auto lg:overflow-hidden font-sans">
                  {/* Left panel */}
                  <div className="w-full lg:w-2/5 p-8 lg:p-12 bg-zinc-50 border-r border-zinc-200/50">
                    <span className="text-xs font-black tracking-[0.3em] text-amber-600 mb-4 block">
                      CATEGORY {selectedCategory.number}
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-zinc-900 mb-6 leading-tight">
                      {selectedCategory.title}
                    </h2>
                    <p className="text-zinc-500 font-medium mb-8 text-sm">
                      {selectedCategory.description}
                    </p>
                    <div className="aspect-square rounded-3xl overflow-hidden shadow-xl border border-zinc-200">
                      <img
                        src={selectedCategory.image}
                        alt={selectedCategory.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Right panel */}
                  <div className="flex-1 p-6 lg:p-10 lg:overflow-y-auto bg-white">
                    {showEmpty ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
                          <ArrowUpRight className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">
                          No Active Inventory
                        </h3>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-sm mb-8">
                          We apologize, there is no active inventory to show here. However, our inventory page is not inclusive. We handle equipment needs not shown — please contact us directly with your needs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                          <Button
                            className="flex-1 h-12 rounded-full bg-zinc-900 text-white font-black gap-2 text-sm hover:bg-zinc-800"
                            onClick={() => {
                              window.location.href = "mailto:connect@jaylansolutions.com?subject=New Equipment Inquiry";
                            }}
                          >
                            <Mail className="w-4 h-4" />
                            Email Us
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-full font-black gap-2 text-sm border-zinc-200 hover:border-amber-500 hover:text-amber-600"
                            onClick={() => window.open("https://jaylansolutions.com/procurement-services", "_blank")}
                          >
                            Schedule Discovery Call
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* ── Item Cards ── */
                      <div>
                        {selectedCategory.subCategories?.map((sub, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.08 }}
                          >
                            <div className="flex items-center gap-3 mb-5">
                              <h4 className="text-xs font-black tracking-[0.2em] text-zinc-400 uppercase">
                                {sub.title}
                              </h4>
                              <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                {(sub as any)._fullItems?.length ?? sub.items?.length ?? 0} Units
                              </span>
                              <div className="h-[1px] flex-1 bg-zinc-100" />
                            </div>

                            <div className="space-y-2 mb-8">
                              {((sub as any)._fullItems ?? []).map((fullItem: any, i: number) => {
                                const sc = statusCardColors(fullItem.status);
                                return (
                                  <div
                                    key={fullItem.id ?? i}
                                    className={cn(
                                      "flex items-center gap-3 p-3 rounded-2xl border bg-white transition-all duration-200 cursor-pointer group",
                                      sc.border
                                    )}
                                    onClick={() => openItem(fullItem, selectedCategory.title)}
                                  >
                                    {/* Thumbnail */}
                                    <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-100">
                                      {fullItem.image ? (
                                        <img
                                          src={fullItem.image}
                                          alt={fullItem.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Zap className="w-5 h-5 text-zinc-300" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-zinc-900 text-sm leading-tight truncate group-hover:text-amber-700 transition-colors">
                                        {fullItem.name}
                                      </p>
                                      {(fullItem.manufacturer || fullItem.yearManufactured) && (
                                        <p className="text-[11px] text-zinc-400 font-medium mt-0.5 truncate">
                                          {[fullItem.manufacturer, fullItem.yearManufactured].filter(Boolean).join(" • ")}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        {fullItem.status && (
                                          <span className={cn(
                                            "inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                            sc.badge
                                          )}>
                                            <span className={cn("w-1 h-1 rounded-full inline-block flex-shrink-0", sc.dot)} />
                                            {fullItem.status}
                                          </span>
                                        )}
                                        {fullItem.askingPrice && (
                                          <span className="text-[10px] font-black text-green-700">
                                            {fullItem.askingPrice}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Quick inquiry */}
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="flex-shrink-0 h-8 w-8 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-400 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 transition-all shadow-sm"
                                      onClick={(e) => { e.stopPropagation(); handleInquiryAction(e, fullItem.name); }}
                                      title="Inquire about this unit"
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── Full-Screen Item Detail ── */}
      <ItemDetail
        isOpen={!!selectedItem}
        onClose={closeItem}
        itemData={selectedItem}
        categoryName={itemCategory}
      />

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-zinc-200 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
            <p className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-2">Partnering with</p>
            <span className="text-lg font-black tracking-tighter text-zinc-400 leading-none block">
              IRONVALE ENERGY GROUP
            </span>
          </div>
          <div className="max-w-md">
            <p className="text-xs font-medium text-zinc-500 leading-relaxed italic">
              Industrial Fluids & Lubrication • Motor Oils • Hydraulic Fluids • Turbine Oils • Coolants.
              Contact us for equipment not listed.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <span className="text-sm font-black text-zinc-900">jaylansolutions.com</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nationwide Coverage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
