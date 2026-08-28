import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  AlertTriangle, 
  Search, 
  HelpCircle, 
  Building2, 
  Layers, 
  ArrowLeft, 
  Sparkles,
  BookOpen,
  Info,
  ShieldCheck,
  CheckCircle2,
  ListFilter
} from 'lucide-react';

const HERO_VIDEO_URL = '/hero.mp4';

const STATUTORY_FRAMEWORKS = [
  {
    id: 'lm-rules-2011-administrative',
    act: 'Legal Metrology Act, 2009 (Act No. 1 of 2010)',
    title: 'Legal Metrology (Packaged Commodities) Rules, 2011 — Administrative & Scope Articles',
    nodal_body: 'Department of Consumer Affairs, Ministry of Consumer Affairs, Food & Public Distribution, Govt. of India',
    authority_scope: 'Constitutional basis, statutory definitions, packaging prohibitions, and standard bulk thresholds.',
    sections: [
      {
        rule_num: 'Rule 1',
        subject: 'Short Title, Scope & National Commencement',
        type: 'ADMINISTRATIVE SCOPE',
        penal_clause: 'Legal Metrology Gazette Notification G.S.R. 202(E)',
        summary: 'Formally titles the framework as the Legal Metrology (Packaged Commodities) Rules, 2011. Came into full national enforcement across all States and Union Territories on 1st April 2011.'
      },
      {
        rule_num: 'Rule 2',
        subject: 'Statutory Metrological Definitions',
        type: 'LEGAL DEFINITIONS',
        penal_clause: 'Statutory Interpretation Clause',
        summary: 'Defines critical enforcement terms including "Pre-packaged Commodity" (Rule 2(l)), "Principal Display Panel" (Rule 2(h)), "Retail Package", "Wholesale Package", "Manufacturer", "Packer", and "Net Quantity".'
      },
      {
        rule_num: 'Rule 3',
        subject: 'Applicability & Exempted Package Thresholds',
        type: 'JURISDICTIONAL SCOPE',
        penal_clause: 'Enforcement Boundary Directive',
        summary: 'Applies to all retail pre-packed commodities. Explicitly exempts packages with net weight/volume exceeding 25 kg or 25 liters (except cement and fertilizers) and packages intended exclusively for industrial or institutional consumers.'
      },
      {
        rule_num: 'Rule 4',
        subject: 'Statutory Regulation of Pre-Packing, Sale & Distribution',
        type: 'PROHIBITORY INJUNCTION',
        penal_clause: 'Section 36(1) of LM Act, 2009',
        summary: 'No person, manufacturer, packer, distributor, or e-commerce entity shall pre-pack, distribute, store, display, or sell any commodity unless the package strictly conforms with the mandatory declaration requirements.'
      },
      {
        rule_num: 'Rule 5',
        subject: 'Specific Commodity Quantities (Schedule II Standard Sizes)',
        type: 'METROLOGICAL STANDARD',
        penal_clause: 'Rule 5 Compounding Section',
        summary: 'Commodities listed under Schedule II (such as tea, biscuits, baby food, cereals, edible oils) must be packed and sold only in standard metric rational quantities to prevent deceptive downsizing.'
      }
    ]
  },
  {
    id: 'lm-rules-2011-declarations',
    act: 'Legal Metrology Act, 2009 (Act No. 1 of 2010)',
    title: 'Legal Metrology Rules, 2011 — Mandatory Package Declarations (Rule 6)',
    nodal_body: 'Department of Consumer Affairs, Govt. of India',
    authority_scope: 'Mandatory labeling items required on every retail packaged product sold in India.',
    sections: [
      {
        rule_num: 'Rule 6(1)(a)',
        subject: 'Identity & Address of Manufacturer / Packer / Importer',
        type: 'ENTITY TRANSPARENCY',
        penal_clause: 'Section 36(1) Notice of Violation',
        summary: 'Every package must display the complete name and definite physical address (including premise/factory details) of the manufacturer, packer, or importer. Country of origin must be stated for all imported items.'
      },
      {
        rule_num: 'Rule 6(1)(b)',
        subject: 'Generic / Common Name of the Commodity',
        type: 'COMMODITY IDENTITY',
        penal_clause: 'Rule 32 Misbranding Penalty',
        summary: 'The generic or common commercial identity of the goods contained in the package must be prominently declared, eliminating misleading visual deception or ambiguity.'
      },
      {
        rule_num: 'Rule 6(1)(c)',
        subject: 'Net Quantity in Standard Metric Units',
        type: 'METRIC ACCURACY',
        penal_clause: 'Section 36(2) Short Measure Penalty',
        summary: 'Net quantity must be declared in metric units of mass (g, kg), volume (ml, L), or count (number). Non-standard fractions or non-metric imperial units are illegal. Schedule II Maximum Permissible Error (MPE) limits apply.'
      },
      {
        rule_num: 'Rule 6(1)(d)',
        subject: 'Month & Year of Manufacture / Pre-Packing / Import',
        type: 'CHRONOLOGICAL LOG',
        penal_clause: 'Rule 6(1)(d) Enforcement Notice',
        summary: 'Mandatory chronological disclosure in Month and Year format (e.g., "Mfg: 08/2026" or "Aug 2026"). For commodities with limited shelf-life, "Best Before" or "Expiry Date" must be printed alongside.'
      },
      {
        rule_num: 'Rule 6(1)(da)',
        subject: 'Unit Sale Price (USP) Display Mandate',
        type: 'PRICE TRANSPARENCY',
        penal_clause: 'G.S.R. 779(E) Compounding Clause',
        summary: 'Packages exceeding 1 kg or 1 liter must declare price per kg/liter (₹ / kg). Packages under 1 kg or 1 liter must declare price per gram/ml (₹ / g or ₹ / ml) rounded to two decimal places directly beside the MRP.'
      },
      {
        rule_num: 'Rule 6(1)(e)',
        subject: 'Maximum Retail Price (MRP) Declaration Format',
        type: 'FISCAL DISCLOSURE',
        penal_clause: 'Section 36(1) Overcharging Penalty',
        summary: 'The retail price must be formatted as "Maximum or Max. Retail Price ₹ / Rs. ... (inclusive of all taxes)". Dual pricing, scratching off, or affixing secondary stickers over original MRP is strictly prohibited.'
      },
      {
        rule_num: 'Rule 6(1)(f)',
        subject: 'Physical Dimensions / Size of Commodity',
        type: 'DIMENSIONAL ACCURACY',
        penal_clause: 'Rule 6 Compliance Order',
        summary: 'For commodities where size impacts usability (textiles, garments, paper, bedding, sheet metal), dimensions (length, width, diameter) in standard metric meters/centimeters must be declared.'
      },
      {
        rule_num: 'Rule 6(1)(n)',
        subject: 'Consumer Grievance Redressal Mechanism',
        type: 'CONSUMER PROTECTION',
        penal_clause: 'Rule 6(1)(n) Strict Liability',
        summary: 'Every pre-packaged item must state the contact details of the official grievance officer: Name, physical address, active telephone/helpline number, and official corporate email ID.'
      }
    ]
  },
  {
    id: 'lm-rules-2011-enforcement',
    act: 'Legal Metrology Act, 2009 (Act No. 1 of 2010)',
    title: 'Legal Metrology Rules, 2011 — Typography, Registration & Compounding',
    nodal_body: 'State Controllers of Legal Metrology & Central Metrology Directorate',
    authority_scope: 'Font geometry, Principal Display Panel calculations, corporate registration, and legal offenses.',
    sections: [
      {
        rule_num: 'Rule 7 & Table 1',
        subject: 'Principal Display Panel (PDP) Ratio & Minimum Font Heights',
        type: 'GEOMETRIC PROPORTION',
        penal_clause: 'Rule 7 Table 1 Citation',
        summary: 'Mandates minimum font heights between 1.0 mm and 6.0 mm based on calculated surface area of the Principal Display Panel (PDP) to guarantee legibility.'
      },
      {
        rule_num: 'Rule 9 & 10',
        subject: 'Manner & Placement of Declarations',
        type: 'VISUAL LEGIBILITY',
        penal_clause: 'Rule 9 Visibility Order',
        summary: 'All statutory text must appear in conspicuous contrast to the package background. Declarations must not be obscured by illustrations, background patterns, or wrapping folds.'
      },
      {
        rule_num: 'Rule 11',
        subject: 'Net Weight Calculation & Tare Weight Exclusion',
        type: 'WEIGHT DETERMINATION',
        penal_clause: 'Section 36(2) Fraudulent Measure',
        summary: 'Packaging material, wrappers, and containers must not be included in the declared net mass. Inspection samples are weighed net of tare.'
      },
      {
        rule_num: 'Rule 27',
        subject: 'Mandatory Registration of Manufacturers, Packers & Importers',
        type: 'STATUTORY REGISTRATION',
        penal_clause: 'Rule 27 Non-Registration Citation',
        summary: 'Every commercial entity packing or importing commodities must obtain an official LMPC registration certificate from the Director or State Controller of Legal Metrology.'
      },
      {
        rule_num: 'Rule 32',
        subject: 'Compounding of Offenses & Notice of Violation',
        type: 'PENAL JURISPRUDENCE',
        penal_clause: 'Section 48 Compounding Directive',
        summary: 'Authorizes Legal Metrology Inspectors to seize non-compliant goods, issue Form V notices, impose monetary compounding fees, or file prosecution before a Magistrate.'
      }
    ]
  },
  {
    id: 'fssai-labelling-2020',
    act: 'Food Safety and Standards Act, 2006 (Act No. 34 of 2006)',
    title: 'FSSAI (Labelling and Display) Regulations, 2020',
    nodal_body: 'Food Safety and Standards Authority of India (FSSAI)',
    authority_scope: 'Applies to all packaged food, beverages, supplements, and edible formulations sold in India.',
    sections: [
      {
        rule_num: 'Regulation 5(1)',
        subject: 'FSSAI Logo & 14-Digit State / Central License Number',
        type: 'STATUTORY VALIDATION',
        penal_clause: 'Section 58 of FSS Act, 2006',
        summary: 'The official FSSAI emblem alongside the 14-digit manufacturing/marketing license number must be clearly printed on the primary package.'
      },
      {
        rule_num: 'Regulation 5(2)',
        subject: 'Complete Ingredient List in Descending Order',
        type: 'COMPOSITION DISCLOSURE',
        penal_clause: 'Section 52 Misbranded Food Penalty',
        summary: 'All raw materials, food additives, and nutritional ingredients must be listed in descending order of incoming weight or volume at the time of manufacture.'
      },
      {
        rule_num: 'Regulation 5(3)',
        subject: 'Tabular Nutritional Information per 100g / 100ml / Serve',
        type: 'NUTRITIONAL CODEX',
        penal_clause: 'FSSAI Strict Compliance Clause',
        summary: 'Tabular reporting of Energy (kcal), Protein (g), Carbohydrates (g), Total Sugars & Added Sugars (g), Total Fat, Saturated Fat, Trans Fat (with cholesterol metrics where applicable), and Sodium (mg).'
      },
      {
        rule_num: 'Regulation 5(4)',
        subject: 'Vegetarian / Non-Vegetarian / Vegan Symbol Display',
        type: 'DIETARY IDENTITY',
        penal_clause: 'Regulation 5(4)(c) Misclassification',
        summary: 'Prescribes green circular emblem in a square for Vegetarian products and brown triangular emblem in a square for Non-Vegetarian items with statutory stroke dimension ratios.'
      },
      {
        rule_num: 'Regulation 8',
        subject: 'Mandatory Allergen & Food Additive Warnings',
        type: 'SAFETY & TOXICOLOGY',
        penal_clause: 'FSSAI Allergen Directive',
        summary: 'Bold declarations for common food allergens (Gluten, Crustaceans, Milk, Tree Nuts, Soy, Sulphites) and specific statutory codes (INS numbers) for added colors, flavors, or sweeteners.'
      }
    ]
  },
  {
    id: 'drugs-cosmetics-1945',
    act: 'Drugs and Cosmetics Act, 1940',
    title: 'Drugs and Cosmetics Rules, 1945 (Part IX & Part XV)',
    nodal_body: 'Central Drugs Standard Control Organisation (CDSCO)',
    authority_scope: 'Pharmaceutical products, formulations, cosmetics, medical devices, and OTC items.',
    sections: [
      {
        rule_num: 'Rule 96',
        subject: 'Batch Number, Mfg License & Indelible Expiry Dates',
        type: 'PHARMA SURVEILLANCE',
        penal_clause: 'Section 27 of D&C Act, 1940',
        summary: 'Medicines and medical solutions must display Batch/Lot No. preceded by "B.No.", Manufacturing License Number ("Mfg. Lic. No."), and Expiration Date ("Exp. Date") in indelible print.'
      },
      {
        rule_num: 'Rule 97',
        subject: 'Schedule H / H1 / X Prescription Red Box Warnings',
        type: 'PRESCRIPTION SAFETY',
        penal_clause: 'Section 18 & 27 Strict Liability',
        summary: 'Mandatory red-bordered warning boxes for Schedule H, H1, and narcotic/psychotropic drugs with distinct "Rx" or "NRx" headers.'
      }
    ]
  }
];

export default function GovRulesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const play = video.play();
    if (play?.catch) play.catch(() => {});
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      setVideoReady(true);
    }
  }, []);

  // Filter frameworks while keeping all rules visible by default
  const filteredFrameworks = STATUTORY_FRAMEWORKS.filter((fw) => {
    if (selectedFramework !== 'all' && fw.id !== selectedFramework) return false;
    return true;
  }).map((fw) => {
    const matchingSections = fw.sections.filter((sec) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        sec.rule_num.toLowerCase().includes(q) ||
        sec.subject.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.type.toLowerCase().includes(q) ||
        sec.penal_clause.toLowerCase().includes(q)
      );
    });
    return { ...fw, sections: matchingSections };
  }).filter((fw) => fw.sections.length > 0);

  const totalRulesCount = STATUTORY_FRAMEWORKS.reduce((acc, curr) => acc + curr.sections.length, 0);

  return (
    <div className="relative isolate min-h-screen w-full overflow-x-hidden bg-[radial-gradient(65%_55%_at_50%_15%,rgba(99,102,241,0.3)_0%,rgba(30,27,75,0)_100%),radial-gradient(120%_90%_at_50%_0%,#1e1b4b_0%,#0f172a_100%)] text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Background Video Layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <video
          ref={videoRef}
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            videoReady ? 'opacity-40' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(90%_65%_at_50%_35%,rgba(15,23,42,0.25)_10%,rgba(15,23,42,0.85)_100%),linear-gradient(180deg,rgba(15,23,42,0.7)_0%,rgba(15,23,42,0.4)_40%,rgba(15,23,42,0.92)_100%)]" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10 backdrop-blur-md">
          <Link
            to="/inspector"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 hover:text-white bg-slate-900/60 hover:bg-indigo-600/40 border border-white/10 px-3.5 py-2 rounded-xl transition backdrop-blur-lg shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Workstation</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-bold tracking-wider text-indigo-200 uppercase shadow-[0_0_15px_rgba(99,102,241,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            Statutory Codex 2026
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center mx-auto shadow-inner shadow-indigo-500/20">
            <Scale className="w-7 h-7 text-indigo-300" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Indian Statutory <span className="bg-gradient-to-r from-indigo-200 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">Packaging Rules</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            Unrestricted complete legal codex of the Legal Metrology (Packaged Commodities) Rules 2011, FSSAI regulations, and Drugs &amp; Cosmetics packaging mandates.
          </p>
        </div>

        {/* Legal Hierarchy Explainer Card */}
        <div className="bg-slate-900/70 border border-indigo-500/30 backdrop-blur-2xl p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Understanding Legal Metrology Numbering (e.g. Rule 6(1)(e))</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="font-mono text-indigo-300 font-bold">Rule 6</span>
              <p className="text-[11px] text-slate-400">Main Rule Category: Prescribes all mandatory declarations that must appear on packaging.</p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="font-mono text-indigo-300 font-bold">Sub-rule (1)</span>
              <p className="text-[11px] text-slate-400">Operational Scope: Applies to retail pre-packaged commodities sold in India.</p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="font-mono text-indigo-300 font-bold">Clause (e)</span>
              <p className="text-[11px] text-slate-400">Specific Mandate: Declares that Maximum Retail Price (MRP) must be prominently printed.</p>
            </div>
          </div>
        </div>

        {/* Master Comparison Matrix */}
        <div className="bg-slate-900/60 border border-indigo-500/20 backdrop-blur-2xl rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-indigo-400 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                Master Statutory Matrix for Pre-Packaged Goods
              </h3>
            </div>
            <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/30 font-semibold">
              All Rules Open &amp; Visible
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/15 bg-indigo-950/40 text-slate-200 font-semibold">
                  <th className="p-2.5">Act / Code</th>
                  <th className="p-2.5">Section / Rule</th>
                  <th className="p-2.5">Mandated Declaration</th>
                  <th className="p-2.5">Physical Target on Package</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-bold text-white">Legal Metrology PCR 2011</td>
                  <td className="p-2.5 font-mono text-indigo-300">Rule 6(1)(a)</td>
                  <td className="p-2.5">Manufacturer / Packer / Importer Name &amp; Address</td>
                  <td className="p-2.5">Back / Side Panel</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-bold text-white">Legal Metrology PCR 2011</td>
                  <td className="p-2.5 font-mono text-indigo-300">Rule 6(1)(b)</td>
                  <td className="p-2.5">Generic / Common Commodity Name</td>
                  <td className="p-2.5">Front (Principal Display Panel)</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-bold text-white">Legal Metrology PCR 2011</td>
                  <td className="p-2.5 font-mono text-indigo-300">Rule 6(1)(c)</td>
                  <td className="p-2.5">Net Quantity in Metric Units (g, kg, ml, L)</td>
                  <td className="p-2.5">Principal Display Panel</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-bold text-white">Legal Metrology PCR 2011</td>
                  <td className="p-2.5 font-mono text-indigo-300">Rule 6(1)(d)</td>
                  <td className="p-2.5">Month &amp; Year of Mfg / Packing / Import</td>
                  <td className="p-2.5">Top Flap / Back Panel</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-bold text-white">Legal Metrology PCR 2011</td>
                  <td className="p-2.5 font-mono text-indigo-300">Rule 6(1)(da)</td>
                  <td className="p-2.5">Unit Sale Price (USP in ₹/g or ₹/ml)</td>
                  <td className="p-2.5">Beside MRP</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-bold text-white">Legal Metrology PCR 2011</td>
                  <td className="p-2.5 font-mono text-indigo-300">Rule 6(1)(e)</td>
                  <td className="p-2.5">Max Retail Price (MRP ₹ incl. of all taxes)</td>
                  <td className="p-2.5">Top Flap / Back Panel</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-bold text-white">Legal Metrology PCR 2011</td>
                  <td className="p-2.5 font-mono text-indigo-300">Rule 6(1)(n)</td>
                  <td className="p-2.5">Consumer Care (Email, Phone, Physical Address)</td>
                  <td className="p-2.5">Side / Back Panel</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-bold text-white">Legal Metrology PCR 2011</td>
                  <td className="p-2.5 font-mono text-indigo-300">Rule 7 &amp; Table 1</td>
                  <td className="p-2.5">Minimum Font Heights (1.0 mm to 6.0 mm)</td>
                  <td className="p-2.5">Across All Declarations</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-bold text-white">FSSAI Regulations 2020</td>
                  <td className="p-2.5 font-mono text-indigo-300">Reg 5(1) &amp; 5(4)</td>
                  <td className="p-2.5">14-Digit License No. &amp; Veg/Non-Veg Symbol</td>
                  <td className="p-2.5">Front / Back Panel</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-bold text-white">FSSAI Regulations 2020</td>
                  <td className="p-2.5 font-mono text-indigo-300">Reg 5(3)</td>
                  <td className="p-2.5">Tabular Nutritional Information Table</td>
                  <td className="p-2.5">Back Panel</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-bold text-white">Drugs &amp; Cosmetics 1945</td>
                  <td className="p-2.5 font-mono text-indigo-300">Rule 96 &amp; 97</td>
                  <td className="p-2.5">Batch No., Mfg Lic. No., Rx Red Warning Box</td>
                  <td className="p-2.5">Front / Top Panel</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Rule 7 Typography Standards Card */}
        <div className="bg-slate-900/60 border border-indigo-500/20 backdrop-blur-2xl rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Rule 7 Table 1: Prescribed Minimum Font Heights by PDP Area
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/15 bg-indigo-950/40 text-slate-200 font-semibold">
                  <th className="p-2.5">Principal Display Panel Area (A)</th>
                  <th className="p-2.5">Minimum Height (Normal Print)</th>
                  <th className="p-2.5">Minimum Height (Blown/Moulded)</th>
                  <th className="p-2.5">Sample Commodity Sizes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-mono">A &le; 50 cm²</td>
                  <td className="p-2.5 font-bold text-emerald-300">1.0 mm</td>
                  <td className="p-2.5 text-amber-300">2.0 mm</td>
                  <td className="p-2.5">Small cosmetics, eye drops, sachets</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-mono">50 cm² &lt; A &le; 100 cm²</td>
                  <td className="p-2.5 font-bold text-emerald-300">1.5 mm</td>
                  <td className="p-2.5 text-amber-300">3.0 mm</td>
                  <td className="p-2.5">Medium pouches, toothpaste, syrups</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-mono">100 cm² &lt; A &le; 500 cm²</td>
                  <td className="p-2.5 font-bold text-emerald-300">2.5 mm</td>
                  <td className="p-2.5 text-amber-300">4.0 mm</td>
                  <td className="p-2.5">Standard FMCG cartons, cereal boxes</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-mono">500 cm² &lt; A &le; 2500 cm²</td>
                  <td className="p-2.5 font-bold text-emerald-300">4.0 mm</td>
                  <td className="p-2.5 text-amber-300">6.0 mm</td>
                  <td className="p-2.5">1kg - 5kg bulk packs, detergent bags</td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-2.5 font-mono">A &gt; 2500 cm²</td>
                  <td className="p-2.5 font-bold text-emerald-300">6.0 mm</td>
                  <td className="p-2.5 text-amber-300">6.0 mm</td>
                  <td className="p-2.5">Industrial shipping crates, multi-packs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Filter Bar Placed Directly Above Detailed Cards */}
        <div className="bg-slate-900/80 border border-white/20 backdrop-blur-2xl p-4 rounded-2xl shadow-xl space-y-3 sticky top-4 z-20">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold flex items-center gap-1.5 text-indigo-300">
              <ListFilter className="w-4 h-4" /> Filter or Search Detailed Articles
            </span>
            <span className="text-[11px] text-slate-400">
              Showing {filteredFrameworks.reduce((a, c) => a + c.sections.length, 0)} of {totalRulesCount} total rules
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to filter specific rule (e.g., 'Rule 6(1)(e)', 'MRP', 'Font Height', 'FSSAI', 'Batch', 'Rule 3')..."
                className="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Frameworks' },
                { id: 'lm-rules-2011-administrative', label: 'Rules 1-5 (Scope)' },
                { id: 'lm-rules-2011-declarations', label: 'Rule 6 (Declarations)' },
                { id: 'lm-rules-2011-enforcement', label: 'Rules 7-32 (Font/Audit)' },
                { id: 'fssai-labelling-2020', label: 'FSSAI 2020' },
                { id: 'drugs-cosmetics-1945', label: 'D&C Rules 1945' }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setSelectedFramework(id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    selectedFramework === id
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Statute Cards Grid (Rendered by Default) */}
        <div className="space-y-8">
          {filteredFrameworks.map((fw) => (
            <div
              key={fw.id}
              className="bg-slate-900/70 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="space-y-2 pb-4 border-b border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-mono font-bold">
                    {fw.act}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {fw.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{fw.nodal_body}</span>
                </div>
                <p className="text-xs text-slate-300 italic pt-1">
                  Scope: {fw.authority_scope}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fw.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/60 border border-white/10 hover:border-indigo-400/50 rounded-2xl p-4 space-y-3 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono font-bold text-xs bg-indigo-950 border border-indigo-600/50 text-indigo-300 px-2.5 py-1 rounded-lg">
                          {sec.rule_num}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded uppercase">
                          {sec.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {sec.subject}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-light">
                        {sec.summary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-rose-400 flex items-center gap-1 font-mono">
                        <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                        {sec.penal_clause}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredFrameworks.length === 0 && (
            <div className="text-center py-16 bg-slate-900/60 border border-white/10 rounded-3xl backdrop-blur-xl space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Matching Legal Rules Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No statutory articles matched your search query. Try clearing the search box to view all articles.
              </p>
            </div>
          )}
        </div>

        {/* Footer Authority Note */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-center text-xs text-slate-400 backdrop-blur-md">
          <p>
            Enforced by Metronox Automated Optical Compliance Scanner under Rule 6, 7 &amp; 32 of Legal Metrology Rules, 2011.
          </p>
        </div>

      </div>
    </div>
  );
}