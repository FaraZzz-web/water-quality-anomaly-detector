import React, { useState } from "react";

const CitizenPortal = () => {
  // 👇 Pop-up (Modal) aur Search Logic ke liye States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  // Fake API Function (Jab tak backend connect nahi hota)
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true); // Loading shuru

    // Simulate a 1.5-second network delay
    setTimeout(() => {
      // Generate Fake Mock Data for now
      setSearchResult({
        location: searchQuery.toUpperCase(),
        status: "SAFE",
        ph: "7.2 (Ideal)",
        tds: "145 mg/L (Excellent)",
        turbidity: "0.2 NTU (Clear)",
        coliform: "0 (Safe)",
        date: new Date().toLocaleDateString(),
      });
      setIsSearching(false); // Loading khatam
    }, 1500);
  };

  // Modal band karne ka function (aur state reset karne ka)
  const closeModal = () => {
    setIsModalOpen(false);
    // Modal band hone ke baad purana result clear kar do
    setTimeout(() => {
      setSearchResult(null);
      setSearchQuery("");
    }, 300);
  };

  // 1. BENEFITS DATA
  const benefits = [
    {
      title: "Deep Cellular Hydration — The Foundation of Life",
      desc: "At the most fundamental level, every single cell in the human body depends on water to survive. Water is not merely a thirst-quencher — it is the medium in which every biological reaction in your body takes place. When you drink pure, uncontaminated water, it is absorbed through the walls of your small intestine and transported via the bloodstream to cells throughout your body. Inside each cell, water facilitates the transport of nutrients, enables the production of energy, and carries away waste products. When the water you consume is contaminated with heavy metals, industrial chemicals, or microbial agents, these toxins hitch a ride on this same delivery system. Pure water ensures that your body's internal environment remains stable (homeostasis).",
      image: "/images/cellular.jpg",
    },
    {
      title: "A Fortified Immune System",
      desc: "Your immune system is your body's defence force, and clean water is its supply line. The lymphatic system — the network of vessels and nodes that carries immune cells throughout your body — is almost entirely water-based. Pure water helps produce lymph fluid, which transports white blood cells to wherever they are needed. Beyond this, the kidneys filter approximately 200 litres of blood every single day, removing waste, bacteria, and toxins through urine. When water is contaminated with pathogens like E. coli or Giardia, the immune system is placed under constant siege. Clean water does not just prevent waterborne disease — it gives your entire immune system the operational capacity to protect you from everything else too.",
      image: "/images/immunity.jpg",
    },
    {
      title: "Kidney Health and Natural Detoxification",
      desc: "The kidneys are among the most hardworking organs in your body, and they have one non-negotiable requirement: clean water in sufficient quantity. Each kidney contains approximately one million tiny filtering units called nephrons. These nephrons filter your blood continuously, separating waste products from nutrients. When the water supply is contaminated with heavy metals such as arsenic, lead, or cadmium, these substances pass through the kidney's filtration system and accumulate in kidney tissue over time. The result is nephrotoxicity — gradual kidney damage that often shows no symptoms until significant harm has already occurred. Drinking pure, adequate water keeps your kidneys flushed, functional, and protected.",
      image: "/images/kidneys.jpg",
    },
    {
      title: "Cognitive Function and Mental Clarity",
      desc: "The human brain is composed of approximately 73% water, making it one of the most hydration-sensitive organs in the body. A loss of just 1–2% of body water leads to measurable reductions in concentration, short-term memory, and reaction speed. The danger of contaminated water here is twofold. First, waterborne heavy metals — particularly lead and mercury — are potent neurotoxins. Lead exposure in children is clinically proven to reduce IQ and cause behavioural disorders. Second, when water is contaminated and children avoid drinking it out of taste aversion, they suffer the cognitive effects of chronic dehydration. Access to clean water is a foundational requirement for educational achievement.",
      image: "/images/cognition.jpg",
    },
  ];

  // 2. DISEASES DATA
  const diseases = [
    {
      name: "Cholera",
      risk: "SEVERE — Potentially Fatal Within Hours",
      desc: "Caused by the bacterium Vibrio cholerae, which thrives in water contaminated by human faecal matter. It is one of the fastest-killing infectious diseases known to medicine. The bacterium produces a toxin in the intestines that triggers a catastrophic outflow of water and electrolytes, resulting in profuse, watery diarrhoea. What makes cholera particularly dangerous is its explosive epidemic potential. A single breach in a water treatment facility can expose thousands of people simultaneously. Prevention requires consistent access to treated water, proper sewage management, and immediate oral rehydration therapy.",
      image: "/images/cholera.jpg",
    },
    {
      name: "Typhoid Fever",
      risk: "HIGH — Serious and Potentially Fatal Without Treatment",
      desc: "Caused by the bacterium Salmonella typhi, transmitted almost exclusively through the consumption of water or food contaminated with infected faeces. Unlike cholera, typhoid is an insidious disease — it builds slowly and silently. Symptoms include a sustained high fever, severe abdominal pain, debilitating fatigue, headache, and a characteristic rose-coloured rash on the abdomen. In its most dangerous stage, typhoid can cause intestinal perforation. Consistent access to treated, piped water and robust sewage infrastructure would eliminate the vast majority of cases.",
      image: "/images/typhoid.jpg",
    },
    {
      name: "Fluorosis",
      risk: "CHRONIC — Irreversible Long-Term Damage",
      desc: "A disease caused by a naturally occurring mineral — fluoride — present at dangerously elevated concentrations in groundwater. It is uniquely deceptive: the water looks clean and tastes normal. Dental fluorosis affects children, causing permanent brown mottling and structural weakening of tooth enamel. Skeletal fluorosis causes fluoride to deposit in bone tissue, leading to joint stiffness and spinal deformity. Unlike most waterborne diseases, fluorosis cannot be treated once it has occurred — the damage is permanent. The only effective prevention is the use of a certified Reverse Osmosis (RO) filtration system.",
      image: "/images/fluorosis.jpg",
    },
    {
      name: "Lead Poisoning",
      risk: "SEVERE — Silent, Cumulative, and Irreversible",
      desc: "Lead enters drinking water primarily through the corrosion of old lead pipes, lead-soldered plumbing joints, and brass fixtures. It has no colour, no smell, and no taste. Once consumed, lead embeds itself in bones, teeth, and brain tissue. In children under six, even extremely low-level lead exposure causes permanent neurological damage: reduced IQ, impaired language development, and hyperactivity. In adults, chronic lead exposure causes hypertension and kidney damage. Prevention requires replacing lead pipes and using NSF-certified filters.",
      image: "/images/Lead.jpg",
    },
  ];

  // 3. PARAMETERS DATA
  const parameters = [
    {
      title: "pH Level",
      range: "Ideal Range: 6.5 – 8.5",
      desc: "The pH scale (0-14) measures acidity or alkalinity. When drinking water falls below 6.5, it becomes acidic and actively dissolves metal from pipes, leaching lead and copper into the water supply. Water above 8.5 is excessively alkaline, which can cause a bitter taste and reduce the effectiveness of chlorine disinfection.",
      icon: "🌡️",
      color: "border-blue-400",
    },
    {
      title: "Turbidity (NTU)",
      range: "Ideal Range: Less than 1 NTU",
      desc: "Measures water's optical clarity (how cloudy it appears) caused by suspended particles like silt, clay, or micro-plastics. High turbidity acts as a physical shield for bacteria, protecting them from UV disinfection and chlorine. Highly turbid water must be filtered before it can be effectively disinfected.",
      icon: "🌫️",
      color: "border-gray-400",
    },
    {
      title: "TDS (Total Dissolved Solids)",
      range: "Ideal Range: 50 – 300 mg/L",
      desc: "The combined concentration of all dissolved substances (minerals, salts, heavy metals). Very low TDS (below 50) is aggressive and leaches minerals from the body. High TDS (above 500) tastes bitter and increases the risk of consuming harmful substances like nitrates from agricultural runoff.",
      icon: "💎",
      color: "border-cyan-400",
    },
    {
      title: "Dissolved Oxygen (DO)",
      range: "Ideal Range: 6 – 8 mg/L",
      desc: "Indicates overall water ecosystem health. When organic pollutants (sewage, agricultural runoff) enter water, bacteria decompose them, consuming massive amounts of oxygen. Low DO causes hypoxia, killing beneficial life and allowing harmful anaerobic bacteria to produce toxic compounds like hydrogen sulphide.",
      icon: "🫧",
      color: "border-teal-400",
    },
    {
      title: "Water Hardness",
      range: "Ideal Range: 60 – 200 mg/L",
      desc: "Determined by dissolved calcium and magnesium ions. While moderate hardness is beneficial for health, levels above 500 mg/L can cause gastrointestinal discomfort and contribute to kidney stones. It also causes severe white scaling in pipes, ruins appliances, and stops soap from lathering.",
      icon: "🪨",
      color: "border-slate-400",
    },
    {
      title: "Coliform Bacteria",
      range: "Ideal Level: ZERO",
      desc: "Originates in the intestines of warm-blooded animals. Their presence is definitive evidence of faecal contamination. Where coliforms go, dangerous pathogens (cholera, typhoid, polio) follow. The WHO standard is unambiguous: zero detectable coliform bacteria in any treated drinking water.",
      icon: "🦠",
      color: "border-red-400",
    },
  ];

  // 4. CONSERVATION DATA
  const conservationTips = [
    {
      title: "Rooftop Rainwater Harvesting",
      desc: "Capture what the sky gives you for free. A standard system consists of a sloped roof, gutters, a first-flush diverter, and a storage tank. In a city receiving 600-2400mm of rain, a 100 sq meter roof can collect up to 240,000 litres annually. This reduces reliance on municipal supply and recharges local groundwater aquifers.",
    },
    {
      title: "The Arithmetic of Leaks",
      desc: "A leaking tap dripping once per second wastes 31 litres a day (11,000 litres/year). A faulty toilet cistern can silently waste 400 litres daily. If 10% of households in a city have a leaking tap, hundreds of millions of litres are lost. Replacing a worn tap washer takes 10 minutes and costs ₹20—a massive return on investment for conservation.",
    },
    {
      title: "Greywater Recycling",
      desc: "Greywater is wastewater from showers, basins, and laundry (excluding toilets). It makes up 50-80% of household wastewater. Diverting laundry or shower water for garden irrigation or toilet flushing can reduce a household's total freshwater consumption by 30-40%, drastically reducing the strain on city reservoirs.",
    },
  ];

  // Smooth Scroll Function
  const scrollToScience = () => {
    document
      .getElementById("science-section")
      .scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-[#005461] font-sans selection:bg-[#00B7B5] selection:text-white">
      {/* 🌊 HERO SECTION */}
      <section className="relative h-[60vh] flex items-center justify-center text-center text-white overflow-hidden bg-[#005461]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-[#005461]/90 z-10"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[150%] h-[150%] bg-[#00B7B5] opacity-20 rounded-full animate-pulse blur-3xl duration-1000"></div>

        <div className="relative z-20 px-6 max-w-5xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            Water is Life,{" "}
            <span className="text-[#00B7B5]">Purity is Health.</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
            Luqora Public Portal: The definitive encyclopedia for water safety,
            health impacts, and local conservation.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {/* 👇 Check Quality Button -> Opens Modal 👇 */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#00B7B5] hover:bg-white hover:text-[#005461] text-white px-8 py-4 rounded-full font-bold transition-all transform hover:-translate-y-1 shadow-2xl"
            >
              Check Quality Near Me
            </button>
            {/* 👇 Explore Science Button -> Scrolls Down 👇 */}
            <button
              onClick={scrollToScience}
              className="border-2 border-white/50 hover:border-white hover:bg-white/10 text-white px-8 py-4 rounded-full font-bold transition-all backdrop-blur-sm"
            >
              Explore The Science
            </button>
          </div>
        </div>
      </section>

      {/* 🌿 SECTION 1: THE MAGIC OF CLEAN WATER */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            The Magic of Clean Water
          </h2>
          <div className="w-24 h-1.5 bg-[#00B7B5] mx-auto rounded-full"></div>
        </div>

        <div className="space-y-20">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`flex flex-col gap-10 items-center ${index % 2 !== 0 ? "lg:flex-row-reverse" : "lg:flex-row"}`}
            >
              {/* ASLI IMAGE BLOCK */}
              <div className="w-full lg:w-1/2">
                <div className="relative group w-full rounded-3xl overflow-hidden shadow-lg bg-gray-100">
                  <img
                    src={benefit.image}
                    alt={benefit.title}
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105 block"
                  />
                  <div className="absolute inset-0 bg-[#00B7B5]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* TEXT CONTENT */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center">
                <span className="text-[#00B7B5] font-black text-7xl opacity-20 mb-4 inline-block">
                  0{index + 1}
                </span>
                <h3 className="text-3xl font-bold text-[#005461] mb-5 leading-tight">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ⚠️ SECTION 2: THE HIDDEN DANGERS */}
      <section className="py-24 px-6 bg-red-50/50 border-y border-red-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-red-800">
              The Hidden Dangers
            </h2>
            <p className="text-red-600/80 font-medium text-lg max-w-2xl mx-auto">
              Microscopic threats that exist in unverified water sources.
            </p>
            <div className="w-24 h-1.5 bg-red-500 mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {diseases.map((disease, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-xl border-t-8 border-red-500 hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-black text-red-900 mb-2">
                    {disease.name}
                  </h3>
                  <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
                    {disease.risk}
                  </span>
                  <p className="text-gray-600 leading-relaxed mb-8">
                    {disease.desc}
                  </p>
                </div>

                {/* ASLI IMAGE BLOCK */}
                <div className="w-full rounded-xl overflow-hidden mt-auto">
                  <img
                    src={disease.image}
                    alt={disease.name}
                    className="w-full h-auto transition-transform duration-500 hover:scale-105 block"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔬 SECTION 3: DECODING WATER QUALITY */}
      <section id="science-section" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Decoding Water Science
            </h2>
            <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
              The exact parameters Luqora sensors measure to ensure your safety.
            </p>
            <div className="w-24 h-1.5 bg-[#005461] mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {parameters.map((p, index) => (
              <div
                key={index}
                className={`p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-t-4 ${p.color}`}
              >
                <div className="text-5xl mb-6 bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">
                  {p.icon}
                </div>
                <h3 className="text-xl font-bold mb-1 text-[#005461]">
                  {p.title}
                </h3>
                <p className="text-sm font-bold text-[#00B7B5] mb-4 bg-[#00B7B5]/10 inline-block px-3 py-1 rounded-md">
                  {p.range}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🌍 SECTION 4: SOURCES & CONSERVATION */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#005461] to-[#002b32] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Where Does Our Drinking Water Come From?
              </h2>
              <div className="w-24 h-1.5 bg-[#00B7B5] rounded-full mb-8"></div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Less than 1% of all freshwater on the planet is accessible. In
                India, 85% of rural drinking water comes from groundwater, and
                urban areas rely on rivers and reservoirs. Both are under
                accelerating pressure.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                India extracts more groundwater than the US and China combined,
                with water tables declining up to 1 metre per year. The water
                crisis is not a future possibility—it is a present reality
                unfolding in slow motion.
              </p>
            </div>

            {/* ASLI CONSERVATION HERO IMAGE YAHAN HAI */}
            <div className="w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
              <img
                src="/images/rainwater.png"
                alt="Water Conservation Impact"
                className="w-full h-auto block"
              />
            </div>
          </div>

          <h3 className="text-3xl font-bold text-center mb-12">
            Pro Conservation Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {conservationTips.map((tip, index) => (
              <div
                key={index}
                className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
              >
                <h4 className="font-bold text-xl text-[#00B7B5] mb-4">
                  {tip.title}
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📬 FOOTER */}
      <footer className="py-12 bg-white text-center border-t border-gray-100">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/logo.png"
            alt="Luqora Logo"
            className="h-10 grayscale opacity-50"
          />
          <p className="text-gray-400 text-sm font-medium">
            © 2026 Luqora Project - Awareness for a Better Tomorrow.
          </p>
          <p className="text-[#00B7B5] font-black text-xs tracking-widest uppercase bg-[#00B7B5]/10 px-4 py-2 rounded-full">
            Developed by Faraz Ahmed
          </p>
        </div>
      </footer>

      {/* 👇 ADVANCED SEARCH MODAL (POP-UP) 👇 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#005461]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="bg-[#00B7B5] p-6 text-white relative">
              <h3 className="text-2xl font-black mb-1">Check Your Area</h3>
              <p className="text-white/80 text-sm">
                Real-time mock analysis for your location.
              </p>

              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:rotate-90 transition-transform p-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body - Dynamic Content */}
            <div className="p-8">
              {/* STATE 1: Default Search Form */}
              {!isSearching && !searchResult && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    City or Pincode
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., New Delhi or 110001"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00B7B5] focus:outline-none mb-6 text-gray-800"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim()}
                    className={`w-full font-bold py-3 px-4 rounded-xl transition-colors ${searchQuery.trim() ? "bg-[#005461] hover:bg-[#003840] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                  >
                    Analyze Water Quality
                  </button>
                </div>
              )}

              {/* STATE 2: Loading Spinner */}
              {isSearching && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-[#00B7B5] rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 font-medium animate-pulse">
                    Connecting to Luqora Sensors...
                  </p>
                </div>
              )}

              {/* STATE 3: The Result Card */}
              {searchResult && !isSearching && (
                <div className="animate-fade-in-up">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6">
                    <div className="flex items-center gap-3 mb-4 border-b border-emerald-100 pb-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <h4 className="font-bold text-emerald-900 leading-none">
                          {searchResult.location}
                        </h4>
                        <span className="text-xs text-emerald-600 font-medium">
                          As of {searchResult.date}
                        </span>
                      </div>
                      <span className="ml-auto bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {searchResult.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-emerald-600 font-medium mb-1">
                          pH Level
                        </p>
                        <p className="font-bold text-emerald-900 text-sm">
                          {searchResult.ph}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 font-medium mb-1">
                          TDS
                        </p>
                        <p className="font-bold text-emerald-900 text-sm">
                          {searchResult.tds}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 font-medium mb-1">
                          Turbidity
                        </p>
                        <p className="font-bold text-emerald-900 text-sm">
                          {searchResult.turbidity}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 font-medium mb-1">
                          Coliform
                        </p>
                        <p className="font-bold text-emerald-900 text-sm">
                          {searchResult.coliform}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSearchResult(null);
                      setSearchQuery("");
                    }}
                    className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    Search Another Area
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenPortal;
