export interface SubCategory {
  title: string;
  items: string[];
  _fullItems?: any[];
}

export interface Category {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
  subCategories?: SubCategory[];
}

export const JAYLAN_CATEGORIES: Category[] = [
  {
    id: "large-power-transformers",
    number: "01",
    title: "LARGE POWER TRANSFORMERS",
    description: "500kV–800kV • Autotransformers • Phase Shifters",
    image: "https://images.pexels.com/photos/13287446/pexels-photo-13287446.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: "hv-gis-ais-substation-switchgear",
    number: "02",
    title: "HV GIS / AIS SUBSTATION SWITCHGEAR",
    description: "Gas-Insulated • Air-Insulated • 69kV–500kV",
    image: "https://images.unsplash.com/photo-1693013112835-5f3128bb555f?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "medium-voltage-switchgear",
    number: "03",
    title: "MEDIUM VOLTAGE SWITCHGEAR",
    description: "Metal-Clad • Drawout • 5kV–38kV",
    image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "high-voltage-circuit-breakers",
    number: "04",
    title: "HIGH VOLTAGE CIRCUIT BREAKERS",
    description: "SF6 • Vacuum • Dead Tank • 69kV–500kV",
    image: "https://images.unsplash.com/photo-1521905219644-65e6d65124cf?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "mv-hv-cable-accessories",
    number: "05",
    title: "MV / HV CABLE & ACCESSORIES",
    description: "XLPE • EPR • Accessories & Terminations",
    image: "https://images.unsplash.com/photo-1517373116369-9bdb8cdc9f62?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "protection-control-automation",
    number: "06",
    title: "PROTECTION, CONTROL & AUTOMATION",
    description: "Relays • RTUs • SCADA • IEDs",
    image: "https://images.unsplash.com/photo-1761141535640-c78744c4f369?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "generator-interconnect",
    number: "07",
    title: "GENERATOR INTERCONNECT",
    description: "Synchronizing • Paralleling • Metering",
    image: "https://images.unsplash.com/photo-1509390144018-eeaf65052242?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "utility-scale-gas-turbines",
    number: "08",
    title: "UTILITY-SCALE GAS TURBINES",
    description: "Frame • Aeroderivative • 25MW–500MW+",
    image: "https://images.unsplash.com/photo-1636887584784-954392022b75?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "power-generation-systems",
    number: "09",
    title: "POWER GENERATION SYSTEMS",
    description: "Diesel • Gas • Combined Cycle",
    image: "https://images.unsplash.com/photo-1758797899402-dcf2e762b5cc?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "data-center-cooling-systems",
    number: "10",
    title: "DATA CENTER COOLING SYSTEMS",
    description: "CRAC • CRAH • Chillers • Precision Cooling",
    image: "https://images.unsplash.com/photo-1695668548342-c0c1ad479aee?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "reactive-power-equipment",
    number: "11",
    title: "REACTIVE POWER EQUIPMENT",
    description: "Capacitor Banks • SVCs • STATCOMs",
    image: "https://images.unsplash.com/photo-1728808668151-1ff0b42866a3?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "hvdc-converter-station-equipment",
    number: "12",
    title: "HVDC CONVERTER STATION EQUIPMENT",
    description: "Converter Transformers • Thyristor Valves",
    image: "https://images.unsplash.com/photo-1643829434890-1b9cd0de680b?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "bus-systems",
    number: "13",
    title: "BUS SYSTEMS",
    description: "Switchboard • Isolated Phase • GIB",
    image: "https://images.unsplash.com/photo-1566417110090-6b15a06ec800?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "substation-packages",
    number: "14",
    title: "SUBSTATION PACKAGES",
    description: "Turnkey • Mobile • Packaged",
    image: "https://images.pexels.com/photos/13820151/pexels-photo-13820151.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: "substation-primary-equipment",
    number: "15",
    title: "SUBSTATION PRIMARY EQUIPMENT",
    description: "Disconnect Switches • CTs • VTs • Surge Arresters",
    image: "https://images.unsplash.com/photo-1623925715413-bddadf317be7?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "facts-grid-stabilization",
    number: "16",
    title: "FACTS & GRID STABILIZATION",
    description: "SVC • STATCOM • Series Compensation",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "synchronous-condenser-systems",
    number: "17",
    title: "SYNCHRONOUS CONDENSER SYSTEMS",
    description: "Synchronous Machines • Rotating Condensers",
    image: "https://images.unsplash.com/photo-1680372669297-f299308e437a?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "ai-gpus-components",
    number: "18",
    title: "AI GPUs & COMPONENTS",
    description: "H100 • A100 • DGX Systems • AI Infrastructure",
    image: "https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "automatic-transfer-switches",
    number: "19",
    title: "AUTOMATIC TRANSFER SWITCHES",
    description: "ATS • Manual • Bypass Isolation",
    image: "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: "ups-systems-power-conditioning",
    number: "20",
    title: "UPS SYSTEMS & POWER CONDITIONING",
    description: "Online • Modular • 3-Phase • Battery Backup",
    image: "https://images.pexels.com/photos/8488029/pexels-photo-8488029.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: "switchgear-power-distribution",
    number: "21",
    title: "SWITCHGEAR & POWER DISTRIBUTION",
    description: "LV Switchgear • PDU • Distribution Boards",
    image: "https://images.unsplash.com/photo-1658870901055-665c9621d7a9?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "distribution-transformers",
    number: "22",
    title: "DISTRIBUTION TRANSFORMERS",
    description: "Pad Mount • Pole Mount • 15kV–34.5kV",
    image: "https://images.pexels.com/photos/13875374/pexels-photo-13875374.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
];
