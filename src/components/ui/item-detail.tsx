import React, { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { X, Mail, ChevronLeft, ChevronRight, Zap, FileText, ExternalLink, Share2, Link, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { cn } from "@/src/lib/utils";

const SITE_URL = "https://jaylan-solutions.vercel.app";

interface ItemDetailProps {
  isOpen: boolean;
  onClose: () => void;
  itemData: any | null;
  categoryName: string;
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
      <span className="text-sm font-semibold text-zinc-800 leading-snug">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">{title}</span>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>
      {children}
    </div>
  );
}

class ItemDetailErrorBoundary extends React.Component<
  { children: ReactNode; onClose: () => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidUpdate(prevProps: any) {
    if (prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <p className="text-zinc-500 mb-6">Unable to display this item. Please try again or contact us directly.</p>
            <button onClick={this.props.onClose} className="px-6 py-3 bg-zinc-900 text-white rounded-full font-bold text-sm">
              Close
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// LinkedIn SVG icon (brand icon not in all lucide versions)
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// X / Twitter SVG icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function ItemDetail({ isOpen, onClose, itemData, categoryName }: ItemDetailProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [imgAspect, setImgAspect] = useState<number>(4 / 3);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const images = useMemo<string[]>(() => {
    if (itemData?.images?.length > 0) return itemData.images as string[];
    if (itemData?.image) return [itemData.image as string];
    return [];
  }, [itemData]);

  useEffect(() => {
    setActiveImg(0);
    setImgAspect(4 / 3);
    setShowShare(false);
    setCopied(false);
  }, [itemData]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close share panel on outside click
  useEffect(() => {
    if (!showShare) return;
    const handleClick = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShare(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showShare]);

  if (!itemData) return null;

  const shareUrl = `${SITE_URL}/?item=${itemData.id}`;
  const ogUrl = `${SITE_URL}/api/og?id=${itemData.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Equipment Listing: ${itemData.name}`);
    const body = encodeURIComponent(`Check out this equipment listing from Jaylan Solutions:\n\n${itemData.name}\n\nView it here: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setShowShare(false);
  };

  const handleLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(ogUrl)}`, "_blank");
    setShowShare(false);
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`${itemData.name} — available from Jaylan Solutions`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(ogUrl)}`, "_blank");
    setShowShare(false);
  };

  const handleInquiry = () => {
    const subject = encodeURIComponent(`Inquiry: ${itemData.name}`);
    window.location.href = `mailto:connect@jaylansolutions.com?subject=${subject}`;
  };

  const prevImg = () => setActiveImg((i) => Math.max(0, i - 1));
  const nextImg = () => setActiveImg((i) => Math.min(images.length - 1, i + 1));

  const isPortrait  = imgAspect < 0.85;
  const isUltraWide = imgAspect > 2;
  const panelW = isPortrait ? "lg:w-[35%]" : isUltraWide ? "lg:w-[65%]" : "lg:w-[50%]";

  const shareBtnBase = "flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-colors";

  return (
    <ItemDetailErrorBoundary onClose={onClose}>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col lg:flex-row bg-white overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* ── Image panel ── */}
          <motion.div
            className={cn("flex-shrink-0 bg-zinc-950 flex flex-col w-full h-[50vh] lg:h-full transition-all duration-500", panelW)}
          >
            <div className="relative flex-1 flex items-center justify-center overflow-hidden min-h-0">
              {images.length > 0 ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${activeImg}-${images[activeImg]}`}
                      src={images[activeImg]}
                      alt={itemData.name}
                      className="max-w-full max-h-full object-contain"
                      style={{ maxHeight: "calc(100vh - 120px)" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        if (img.naturalWidth && img.naturalHeight) {
                          setImgAspect(img.naturalWidth / img.naturalHeight);
                        }
                      }}
                    />
                  </AnimatePresence>

                  {images.length > 1 && (
                    <>
                      <button onClick={prevImg} disabled={activeImg === 0}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition disabled:opacity-20 z-10">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={nextImg} disabled={activeImg === images.length - 1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition disabled:opacity-20 z-10">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {images.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
                      {activeImg + 1} / {images.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-zinc-600">
                  <Zap className="w-16 h-16" />
                  <span className="text-xs font-bold uppercase tracking-widest">No Photos Available</span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex-shrink-0 bg-zinc-900 px-3 py-2 overflow-x-auto">
                <div className="flex gap-2 w-max">
                  {images.map((src, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={cn("flex-shrink-0 h-14 w-20 rounded-lg overflow-hidden border-2 transition-all",
                        i === activeImg ? "border-green-400 opacity-100" : "border-transparent opacity-40 hover:opacity-70")}>
                      <img src={src} alt="" className="w-full h-full object-contain bg-zinc-800" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile dots */}
            {images.length > 1 && (
              <div className="lg:hidden flex-shrink-0 flex justify-center gap-2 py-2 bg-zinc-950">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={cn("h-1.5 rounded-full transition-all",
                      i === activeImg ? "bg-green-400 w-5" : "bg-white/30 w-1.5 hover:bg-white/60")} />
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Details panel ── */}
          <div className="flex-1 overflow-y-auto bg-white relative min-w-0">
            {/* Sticky header — share + close */}
            <div className="sticky top-0 z-10 flex justify-between items-center px-6 pt-5 pb-2 bg-white/90 backdrop-blur-sm">
              {/* Share button + panel */}
              <div className="relative" ref={shareRef}>
                <button
                  onClick={() => setShowShare((v) => !v)}
                  className={cn(
                    "flex items-center gap-1.5 h-9 px-3 rounded-full border text-[11px] font-black uppercase tracking-wider transition-all",
                    showShare
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white border-zinc-200 text-zinc-600 hover:border-amber-400 hover:text-amber-700"
                  )}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>

                <AnimatePresence>
                  {showShare && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.14 }}
                      className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-200 p-2 w-52 z-50"
                    >
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 px-3 py-2">
                        Share this listing
                      </p>
                      <div className="h-px bg-zinc-100 mb-1" />

                      <button onClick={handleCopyLink} className={shareBtnBase}>
                        {copied
                          ? <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          : <Link className="w-4 h-4 text-zinc-400 flex-shrink-0" />}
                        <span className={copied ? "text-green-700" : ""}>{copied ? "Copied!" : "Copy Link"}</span>
                      </button>

                      <button onClick={handleEmailShare} className={shareBtnBase}>
                        <Mail className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        Email
                      </button>

                      <div className="h-px bg-zinc-100 my-1" />

                      <button onClick={handleLinkedIn} className={shareBtnBase}>
                        <LinkedInIcon className="w-4 h-4 text-[#0077B5] flex-shrink-0" />
                        LinkedIn
                      </button>

                      <button onClick={handleTwitter} className={shareBtnBase}>
                        <XIcon className="w-4 h-4 text-zinc-800 flex-shrink-0" />
                        X / Twitter
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Close */}
              <button onClick={onClose}
                className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition group">
                <X className="w-5 h-5 text-zinc-500 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            <div className="px-8 pb-12 lg:px-12 pt-1">

              {/* Category breadcrumb */}
              {(categoryName || itemData.subcategory) && (
                <div className="flex items-center gap-2 mb-3">
                  {categoryName && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">{categoryName}</span>}
                  {categoryName && itemData.subcategory && <span className="text-zinc-300 text-xs">›</span>}
                  {itemData.subcategory && <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{itemData.subcategory}</span>}
                </div>
              )}

              {/* Title */}
              <h2 className="text-xl lg:text-2xl font-black tracking-tight text-zinc-900 mb-1 leading-tight">
                {itemData.name}
              </h2>

              {/* Equipment ID */}
              {itemData.equipmentId && (
                <p className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">
                  ID: {itemData.equipmentId}
                </p>
              )}

              {/* Status badges */}
              {itemData.status && (
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-green-50 text-green-700 border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                    {itemData.status}
                  </span>
                  {itemData.condition && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-zinc-50 text-zinc-600 border-zinc-200">
                      {itemData.condition}
                    </span>
                  )}
                  {itemData.systemStatus && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-zinc-50 text-zinc-600 border-zinc-200">
                      {itemData.systemStatus}
                    </span>
                  )}
                </div>
              )}

              {/* Public Description */}
              {itemData.publicDescription && (
                <div className="mb-6 pb-6 border-b border-zinc-100">
                  <p className="text-sm text-zinc-600 font-medium leading-relaxed whitespace-pre-line">
                    {itemData.publicDescription}
                  </p>
                </div>
              )}

              {/* Asking Price */}
              {itemData.askingPrice && (
                <div className="mb-6 pb-6 border-b border-zinc-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Asking Price</span>
                  <span className="text-2xl font-black text-green-600">{itemData.askingPrice}</span>
                </div>
              )}

              {/* Attachment Summary */}
              {itemData.attachmentSummary && (
                <div className="mb-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Attachment Summary</span>
                  <p className="text-sm text-zinc-600 leading-relaxed">{itemData.attachmentSummary}</p>
                </div>
              )}

              {/* Specifications */}
              <Section title="Specifications">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <Field label="Manufacturer"       value={itemData.manufacturer} />
                  <Field label="Model / Series"     value={itemData.modelSeries} />
                  <Field label="Voltage / Capacity" value={itemData.voltageCapacity} />
                  <Field label="Year Manufactured"  value={itemData.yearManufactured} />
                  <Field label="Serial Number(s)"   value={itemData.serialNumbers} />
                  <Field label="Runtime / Hours"    value={itemData.runtimeHours} />
                  <Field label="Quantity"           value={itemData.quantity} />
                  <Field label="Location"           value={itemData.location} />
                  <Field label="KW / MW Rating"     value={itemData.kw} />
                  <Field label="MVA Rating"         value={itemData.mva} />
                  <Field label="Phase"              value={itemData.phase} />
                  <Field label="Frequency"          value={itemData.frequency} />
                  <Field label="Cooling Type"       value={itemData.coolingType} />
                  <Field label="Weight"             value={itemData.weight} />
                  <Field label="Dimensions"         value={itemData.dimensions} />
                  <Field label="Certifications"     value={itemData.certifications} />
                </div>
              </Section>

              {/* Status details */}
              {(itemData.removalStatus || itemData.storageConditions) && (
                <Section title="Status Details">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <Field label="Removal Status"     value={itemData.removalStatus} />
                    <Field label="Storage Conditions" value={itemData.storageConditions} />
                  </div>
                </Section>
              )}

              {/* Nameplate Data */}
              {itemData.nameplateData && (
                <Section title="Nameplate Data">
                  <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line font-mono bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                    {itemData.nameplateData}
                  </p>
                </Section>
              )}

              {/* Technical Notes */}
              {itemData.technicalNotes && (
                <Section title="Technical Notes">
                  <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                    {itemData.technicalNotes}
                  </p>
                </Section>
              )}

              {/* Pairing / Notes */}
              {itemData.pairingNotes && (
                <Section title="Pairing / Notes">
                  <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                    {itemData.pairingNotes}
                  </p>
                </Section>
              )}

              {/* Spec Sheet PDF */}
              {itemData.specSheetUrl && (
                <div className="mb-6">
                  <a
                    href={itemData.specSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-all font-bold text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    {itemData.specSheetName || "Spec Sheet / Flier PDF"}
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>
                </div>
              )}

              {/* CTA */}
              <div className="pt-6 border-t border-zinc-100">
                <Button
                  className="w-full h-12 rounded-full bg-zinc-900 text-white font-black gap-2 hover:bg-zinc-800 text-sm"
                  onClick={handleInquiry}
                >
                  <Mail className="w-4 h-4" />
                  Inquire About This Unit
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </ItemDetailErrorBoundary>
  );
}
