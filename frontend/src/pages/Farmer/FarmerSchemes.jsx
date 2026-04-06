import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Calendar, DollarSign, CheckCircle,
  ExternalLink, ArrowRight, Search, RefreshCw, Loader2, Wifi, WifiOff
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = 'http://localhost:8080/api/schemes';
const getToken = () => localStorage.getItem('agri_connect_token');

const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return { isMobile };
};

const STATIC_SCHEMES = [
  {
    id: 's1', title: 'PM-KISAN Scheme',
    description: 'Direct income support of ₹6,000/year to all landholding farmer families',
    category: 'income', eligibility: 'All landholding farmers',
    subsidy: '₹6,000 per year', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://pmkisan.gov.in',
    details: {
      fullDescription: 'Pradhan Mantri Kisan Samman Nidhi provides ₹6,000/year in three installments of ₹2,000 directly to farmers\' bank accounts.',
      requiredDocuments: ['Aadhaar Card', 'Land holding papers', 'Bank account details', 'Identity proof'],
      eligibilityCriteria: ['All landholding farmer families', 'Small and marginal farmers', 'Husband, wife and minor children count as one family'],
      benefits: ['₹6,000/year direct transfer', 'No middlemen', 'Quarterly installments'],
      applicationProcess: ['Visit nearest CSC center', 'Fill application form', 'Submit documents', 'Verification', 'First installment in 30 days']
    }
  },
  {
    id: 's2', title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'Comprehensive crop insurance for farmers against natural calamities',
    category: 'insurance', eligibility: 'All farmers growing notified crops',
    subsidy: '1.5–5% premium (rest paid by govt)', deadline: 'Before sowing season', status: 'active',
    officialLink: 'https://pmfby.gov.in',
    details: {
      fullDescription: 'PMFBY provides financial support to farmers suffering crop loss due to unforeseen events like drought, flood, hailstorm, cyclone, etc.',
      requiredDocuments: ['Land records (7/12)', 'Aadhaar', 'Bank passbook', 'Sowing certificate'],
      eligibilityCriteria: ['Farmers growing notified crops', 'Loanee and non-loanee farmers', 'Sharecroppers eligible'],
      benefits: ['Full crop loss coverage', 'Low premium', 'Quick claims via remote sensing'],
    }
  },
  {
    id: 's3', title: 'Soil Health Card Scheme',
    description: 'Free soil testing and personalized crop & fertilizer recommendations',
    category: 'testing', eligibility: 'All farmers',
    subsidy: 'Free testing', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://soilhealth.dac.gov.in',
    details: {
      fullDescription: 'Soil Health Cards are issued to farmers carrying crop-wise recommendations of nutrients and fertilizers for their individual farms.',
      requiredDocuments: ['Aadhaar Card', 'Land documents', 'Farmer registration'],
      eligibilityCriteria: ['All farmers in India', 'Both small and large farmers'],
      benefits: ['Free soil testing', 'Personalized recommendations', 'Improved yield'],
    }
  },
  {
    id: 's4', title: 'Kisan Credit Card (KCC)',
    description: 'Flexible revolving credit for crop cultivation, post-harvest and allied activities',
    category: 'credit', eligibility: 'All farmers, fishermen, animal husbandry farmers',
    subsidy: '4% interest rate (2% subvention + 3% prompt repayment)', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://www.nabard.org/content1.aspx?id=572',
    details: {
      fullDescription: 'KCC provides short-term credit requirements for crop cultivation, post-harvest expenses, maintenance of farm assets and allied activities.',
      requiredDocuments: ['Land records', 'Aadhaar', 'Passport photo', 'Bank account'],
      eligibilityCriteria: ['Farmers owning or leasing land', 'Fishermen', 'Animal husbandry farmers'],
      benefits: ['Credit limit up to ₹3 lakh at 4%', 'Flexible withdrawal', 'Repayment flexible with harvest'],
    }
  },
  {
    id: 's5', title: 'PM Krishi Sinchayee Yojana (PMKSY)',
    description: 'Har Khet Ko Pani — irrigation for every field, More Crop Per Drop',
    category: 'irrigation', eligibility: 'Farmers with or without irrigation',
    subsidy: '45–55% subsidy on drip/sprinkler systems', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://pmksy.gov.in',
    details: {
      fullDescription: 'PMKSY aims to extend the coverage of irrigation and improve water use efficiency through micro-irrigation.',
      requiredDocuments: ['Land records', 'Water source proof', 'Bank account', 'Installation estimate'],
      eligibilityCriteria: ['All categories of farmers', 'Landholding up to 5 hectares for full subsidy'],
      benefits: ['Up to 55% subsidy', 'Reduced water usage', 'Better crop yield'],
    }
  },
  {
    id: 's6', title: 'National Mission on Oilseeds & Oil Palm (NMOOP)',
    description: 'Support for oilseed cultivation to reduce edible oil imports',
    category: 'crop', eligibility: 'Oilseed and oil palm farmers',
    subsidy: 'Up to ₹50,000 per hectare', deadline: '31 Mar 2025', status: 'active',
    officialLink: 'https://agricoop.nic.in',
    details: {
      fullDescription: 'NMOOP aims to increase production of vegetable oils from oilseeds and oil palm to reduce import burden.',
      requiredDocuments: ['Land ownership proof', 'Aadhaar', 'Bank details', 'Crop cultivation proof'],
      eligibilityCriteria: ['Oilseed cultivating farmers', 'Minimum 0.5 hectare', 'Registered with state agriculture dept'],
    }
  },
  {
    id: 's7', title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    description: 'Support for organic farming clusters and certification',
    category: 'organic', eligibility: 'Farmers willing to adopt organic farming',
    subsidy: '₹50,000 per hectare over 3 years', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://pgsindia-ncof.gov.in/pkvy',
    details: {
      fullDescription: 'PKVY promotes organic farming through cluster approach. Farmers in groups of 50 cultivate 50 acres organically.',
      requiredDocuments: ['Group formation certificate', 'Land records', 'Aadhaar'],
      eligibilityCriteria: ['Cluster of min 50 farmers', 'Min 50 acres total land', 'Commitment for 3 years'],
      benefits: ['₹50,000/hectare financial aid', 'Free organic certification', 'Market linkage support'],
    }
  },
  {
    id: 's8', title: 'Rashtriya Krishi Vikas Yojana (RKVY)',
    description: 'State-specific agriculture development grants for innovation and infrastructure',
    category: 'infrastructure', eligibility: 'Farmers, FPOs, Agri-entrepreneurs',
    subsidy: 'Up to ₹25 lakh (project-based)', deadline: 'Varies by state', status: 'active',
    officialLink: 'https://rkvy.nic.in',
    details: {
      fullDescription: 'RKVY provides financial assistance for agricultural development including infrastructure, technology and market linkage.',
      requiredDocuments: ['Project proposal', 'Land records', 'Bank details', 'Business plan for entrepreneurs'],
      eligibilityCriteria: ['Individual farmers', 'FPOs', 'Agri-startups', 'State government projects'],
    }
  },
  {
    id: 's9', title: 'National Food Security Mission (NFSM)',
    description: 'Increase production of rice, wheat, pulses and coarse cereals',
    category: 'crop', eligibility: 'Farmers growing food crops',
    subsidy: '50% cost of seeds, implements, INM/IPM', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://nfsm.gov.in',
    details: {
      fullDescription: 'NFSM promotes sustainable agriculture growth by providing quality seeds, demonstration of technology packages and farm implements.',
      requiredDocuments: ['Farmer identity card', 'Land records', 'Bank account'],
      eligibilityCriteria: ['Farmers in identified districts', 'Growing rice, wheat, pulses or cereals'],
    }
  },
  {
    id: 's10', title: 'Sub-Mission on Agricultural Mechanisation (SMAM)',
    description: 'Subsidy on farm machinery and equipment',
    category: 'machinery', eligibility: 'Individual farmers and custom hiring centers',
    subsidy: '40–50% cost of machinery (SC/ST/women 50%)', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://agrimachinery.nic.in',
    details: {
      fullDescription: 'SMAM provides financial assistance for purchasing farm machinery to increase farm productivity and reduce drudgery.',
      requiredDocuments: ['Aadhaar', 'Land records', 'Bank account', 'Caste certificate if applicable'],
      eligibilityCriteria: ['All farmers', 'SC/ST/Women/Small farmers get higher subsidy', 'Custom hiring centers'],
      benefits: ['Up to 50% subsidy', 'Mechanisation of farm operations', 'Custom hiring to other farmers'],
    }
  },
  {
    id: 's11', title: 'PM Annadata Aay Sanrakshan Abhiyan (PM-AASHA)',
    description: 'Price support scheme to ensure farmers get MSP for their produce',
    category: 'msp', eligibility: 'Farmers growing oilseeds, pulses, copra',
    subsidy: 'Procurement at MSP', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://agricoop.nic.in',
    details: {
      fullDescription: 'PM-AASHA ensures remunerative prices to farmers through Price Support Scheme (PSS) and Price Deficiency Payment Scheme (PDPS).',
      requiredDocuments: ['Land records', 'Aadhaar', 'Bank account', 'Crop registration'],
      eligibilityCriteria: ['Farmers of notified oilseeds and pulses', 'Registered with state procurement agency'],
    }
  },
  {
    id: 's12', title: 'eNAM (National Agriculture Market)',
    description: 'Online trading platform for agricultural commodities across India',
    category: 'market', eligibility: 'Farmers, traders, FPOs with APMC registration',
    subsidy: 'Free platform registration', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://enam.gov.in',
    details: {
      fullDescription: 'eNAM is a pan-India electronic trading portal which networks the existing APMC mandis to create a unified national market for agricultural commodities.',
      requiredDocuments: ['APMC/mandi registration', 'Aadhaar', 'Bank account', 'Mobile number'],
      eligibilityCriteria: ['Farmers registered with local APMC', 'Traders with APMC license', 'FPOs'],
      benefits: ['Pan-India market access', 'Better price discovery', 'Online payment', 'Reduced mandi fees'],
    }
  },
  {
    id: 's13', title: 'Pradhan Mantri Kisan Maandhan Yojana (PM-KMY)',
    description: 'Pension scheme for small and marginal farmers (₹3,000/month at age 60)',
    category: 'pension', eligibility: 'Small/marginal farmers aged 18–40',
    subsidy: 'Govt matches monthly contribution', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://pmkmy.gov.in',
    details: {
      fullDescription: 'PM-KMY is a voluntary and contributory pension scheme for small and marginal farmers. The monthly contribution ranges from ₹55 to ₹200, matched by the government.',
      requiredDocuments: ['Aadhaar', 'Land records (up to 2 ha)', 'Bank/savings account', 'Age proof'],
      eligibilityCriteria: ['Small/marginal farmers', 'Land up to 2 hectares', 'Age 18–40 years', 'Not covered under any other pension scheme'],
      benefits: ['₹3,000/month pension after 60', 'Govt matches contribution', 'Family pension on death'],
    }
  },
  {
    id: 's14', title: 'Integrated Scheme for Agricultural Marketing (ISAM)',
    description: 'Development of agriculture marketing infrastructure and grading facilities',
    category: 'market', eligibility: 'FPOs, cooperative societies, individual farmers',
    subsidy: '25–33% capital subsidy on storage/grading', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://agmarknet.gov.in',
    details: {
      fullDescription: 'ISAM provides assistance for construction/expansion of rural godowns, grading/packing units, cold storage and other post-harvest infrastructure.',
      requiredDocuments: ['Project report', 'Land documents', 'Bank loan sanction letter', 'Registration certificate'],
      eligibilityCriteria: ['Cooperatives', 'FPOs', 'Individual farmers', 'State agencies', 'Agri-entrepreneurs'],
    }
  },
  {
    id: 's15', title: 'Micro Irrigation Fund (MIF) — NABARD',
    description: 'Low-interest loans to states for expanding micro-irrigation coverage',
    category: 'irrigation', eligibility: 'Farmers in states with MIF agreements',
    subsidy: 'Up to 55% subsidy + low interest loans', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://www.nabard.org',
    details: {
      fullDescription: 'MIF created with NABARD enables states to provide enhanced subsidy beyond PMKSY for drip and sprinkler irrigation.',
      requiredDocuments: ['Land records', 'Water source proof', 'Installation estimate', 'Bank details'],
      eligibilityCriteria: ['All categories of farmers', 'Drip/sprinkler eligible land', 'State scheme enrollment'],
    }
  },
  {
    id: 's16', title: 'Agriculture Infrastructure Fund (AIF)',
    description: 'Loans for post-harvest management and agri-infrastructure at farm level',
    category: 'infrastructure', eligibility: 'Farmers, FPOs, PACS, Agri-entrepreneurs',
    subsidy: '3% interest subvention for 7 years, up to ₹2 crore', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://agriinfra.dac.gov.in',
    details: {
      fullDescription: 'AIF provides medium-long term debt financing for building community farming assets and post-harvest management infrastructure.',
      requiredDocuments: ['Project report', 'Land/lease documents', 'Bank account', 'Business plan'],
      eligibilityCriteria: ['Individual farmers', 'FPOs', 'PACS', 'Agri-logistic providers', 'Startups'],
      benefits: ['3% interest subvention', 'Up to ₹2 crore per project', 'CGTMSE guarantee coverage'],
    }
  },
  {
    id: 's17', title: 'National Beekeeping & Honey Mission (NBHM)',
    description: 'Support for scientific beekeeping and honey production',
    category: 'allied', eligibility: 'Beekeepers, farmers, cooperatives',
    subsidy: '80% grant on equipment for SC/ST/Women (50% others)', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://nbb.gov.in',
    details: {
      fullDescription: 'NBHM promotes holistic development of beekeeping industry and ensures availability of quality honey.',
      requiredDocuments: ['Aadhaar', 'Bank account', 'Land/lease documents', 'Training certificate'],
      eligibilityCriteria: ['Individual beekeepers', 'Farmer cooperatives', 'SHGs involved in beekeeping'],
    }
  },
  {
    id: 's18', title: 'Pradhan Mantri Matsya Sampada Yojana (PMMSY)',
    description: 'Fisheries development — aquaculture, infrastructure and welfare of fishers',
    category: 'allied', eligibility: 'Fishers, fish farmers, FPOs',
    subsidy: '40–60% subsidy (60% for SC/ST/women)', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://pmmsy.dof.gov.in',
    details: {
      fullDescription: 'PMMSY aims to double fishermen income, create employment in fisheries sector and bring Blue Revolution.',
      requiredDocuments: ['Aadhaar', 'Fisherman identity card', 'Land/water body documents', 'Bank account'],
      eligibilityCriteria: ['Fish farmers', 'Fishers', 'FPOs in fisheries', 'SHGs', 'Fish processing units'],
      benefits: ['Pond construction subsidy', 'Boat & net subsidy', 'Insurance coverage', 'Market linkage'],
    }
  },
  {
    id: 's19', title: 'PM Formalisation of Micro Food Processing Enterprises (PM-FME)',
    description: 'Upgrade and formalize unorganized micro food processing units',
    category: 'processing', eligibility: 'Micro food processing enterprises, SHGs, FPOs',
    subsidy: '35% credit-linked capital subsidy (max ₹10 lakh)', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://mofpi.gov.in/pmfme',
    details: {
      fullDescription: 'PM-FME supports One District One Product (ODOP) approach and upgrades micro food enterprises through credit, technology and market access.',
      requiredDocuments: ['Business registration', 'Aadhaar', 'Project report', 'Bank loan application', 'FSSAI license'],
      eligibilityCriteria: ['Existing micro food processing units', 'SHGs in food processing', 'FPOs', 'Farmer cooperatives'],
    }
  },
  {
    id: 's20', title: 'National Livestock Mission (NLM)',
    description: 'Entrepreneurship development in poultry, small ruminants, and feed sector',
    category: 'allied', eligibility: 'Individual farmers, SHGs, FPOs in livestock',
    subsidy: '50% subsidy (SC/ST 60%) up to ₹50 lakh', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://dahd.nic.in/nlm',
    details: {
      fullDescription: 'NLM promotes entrepreneurship and employment generation in the livestock sector including poultry, sheep, goat and pig rearing.',
      requiredDocuments: ['Aadhaar', 'Project report', 'Land documents', 'Bank account', 'Caste certificate'],
      eligibilityCriteria: ['Individual farmers', 'SHGs', 'FPOs', 'Farmers societies in livestock'],
      benefits: ['50% capital subsidy', 'Breed improvement support', 'Feed & fodder development'],
    }
  },
  {
    id: 's21', title: 'Gramin Bhandaran Yojana (Rural Godown Scheme)',
    description: 'Scientific storage facility construction subsidy for farmers',
    category: 'infrastructure', eligibility: 'Individual farmers, cooperatives, FPOs',
    subsidy: '25% subsidy (33% SC/ST/NE/hill areas)', deadline: 'Ongoing', status: 'active',
    officialLink: 'https://nabard.org',
    details: {
      fullDescription: 'Creates durable storage capacity with scientific storage management to prevent distress sale and reduce post-harvest losses.',
      requiredDocuments: ['Land documents', 'Project report', 'Bank loan sanction', 'NOC from local authority'],
      eligibilityCriteria: ['Individual farmers', 'Cooperatives', 'Companies', 'NGOs', 'SHGs'],
      benefits: ['25–33% capital subsidy', 'Cold storage support', 'Scientific storage', 'Reduced post-harvest loss'],
    }
  },
  {
    id: 's22', title: 'Crop Diversification Programme (CDP)',
    description: 'Shift from paddy to maize, pulses, oilseeds in traditional rice-growing areas',
    category: 'crop', eligibility: 'Farmers in identified paddy-growing states',
    subsidy: '₹2,000–20,000 per hectare based on crop/activity', deadline: '31 Mar 2025', status: 'active',
    officialLink: 'https://nfsm.gov.in',
    details: {
      fullDescription: 'CDP promotes diversification from water-guzzling paddy to less water-intensive crops like pulses, oilseeds, maize and nutri-cereals.',
      requiredDocuments: ['Land records', 'Farmer ID', 'State-specific application form', 'Bank account'],
      eligibilityCriteria: ['Farmers in Punjab, Haryana, Western UP paddy districts', 'Willing to shift from paddy'],
    }
  },
];

const getCategories = (t) => [
  { id: 'all',            name: t.allSchemes       },
  { id: 'income',         name: t.incomeSupport    },
  { id: 'insurance',      name: t.insurance        },
  { id: 'credit',         name: t.creditLoans      },
  { id: 'irrigation',     name: t.irrigation       },
  { id: 'crop',           name: t.cropSpecific     },
  { id: 'organic',        name: t.organicFarming   },
  { id: 'infrastructure', name: t.infrastructure   },
  { id: 'machinery',      name: t.machinery        },
  { id: 'market',         name: t.marketMSP        },
  { id: 'pension',        name: t.pension          },
  { id: 'allied',         name: t.alliedSectors    },
  { id: 'processing',     name: t.foodProcessing   },
  { id: 'msp',            name: t.mspSupport       },
  { id: 'testing',        name: t.soilTesting      },
];

const FarmerSchemes = () => {
  const { t } = useLanguage();
  const { isMobile } = useResponsive();

  const [schemes, setSchemes]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [backendOnline, setBackendOnline]   = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch]                 = useState('');

  useEffect(() => { fetchSchemes(); }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const backendTitles = new Set(data.data.map(s => s.title?.toLowerCase()));
        const extras = STATIC_SCHEMES.filter(s => !backendTitles.has(s.title.toLowerCase()));
        setSchemes([...data.data, ...extras]);
        setBackendOnline(true);
      } else {
        setSchemes(STATIC_SCHEMES);
        setBackendOnline(false);
      }
    } catch {
      setSchemes(STATIC_SCHEMES);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const filtered = schemes.filter(s => {
    const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
    const q = search.toLowerCase();
    const matchSearch = !q
      || s.title?.toLowerCase().includes(q)
      || s.description?.toLowerCase().includes(q)
      || s.eligibility?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const S = {
    page: {
      flex: 1,
      padding: isMobile ? '14px 12px' : '20px 16px',
      background: 'linear-gradient(135deg,#f0fdf4,#f8fafc)',
      minHeight: '100vh',
      boxSizing: 'border-box',
      fontFamily: 'system-ui,sans-serif'
    },
    card: {
      background: 'white',
      borderRadius: 14,
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0,0,0,.06)',
      padding: isMobile ? '16px 14px' : 22,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    },
    badge: (color, bg) => ({ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color, background: bg }),
    btn: (bg, color, border) => ({
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: isMobile ? '8px 12px' : '8px 14px',
      background: bg, color, border: border || 'none', borderRadius: 9,
      fontSize: isMobile ? 11 : 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'none'
    }),
    filterBtn: (active) => ({
      padding: '5px 12px', borderRadius: 20, border: 'none', fontSize: isMobile ? 11 : 12,
      fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
      background: active ? '#dcfce7' : '#f9fafb', color: active ? '#15803d' : '#6b7280',
      outline: active ? '1.5px solid #86efac' : 'none',
    }),
    input: {
      width: '100%', padding: '10px 12px 10px 36px',
      border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13,
      outline: 'none', background: 'white', boxSizing: 'border-box',
    },
  };

  return (
    <main style={S.page}>
      <style>{`*{box-sizing:border-box}a{text-decoration:none}@keyframes spin{to{transform:rotate(360deg)}}.scheme-card:hover{box-shadow:0 6px 20px rgba(0,0,0,.1)!important;transform:translateY(-1px)}.scheme-card{transition:box-shadow .2s,transform .2s}`}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight:700, color:'#14532d', margin:0, fontFamily:'Georgia,serif' }}>{t.governmentSchemes}</h1>
          <p style={{ fontSize:12, color:'#6b7280', margin:'4px 0 0' }}>{t.browseAndApplyForSchemesDesignedForFarmers}</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, color: backendOnline ? '#15803d' : '#9ca3af' }}>
            {backendOnline ? <Wifi size={13}/> : <WifiOff size={13}/>}
            {backendOnline ? 'Live' : 'Static'}
          </div>
          <button onClick={fetchSchemes} style={{ ...S.btn('white','#16a34a','1px solid #d1fae5'), padding:'7px 12px' }}>
            <RefreshCw size={13}/>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'#dcfce7', borderRadius:10, padding:'6px 12px' }}>
            <FileText size={14} color="#15803d"/>
            <span style={{ fontSize:12, fontWeight:700, color:'#15803d' }}>{filtered.length} {t.schemes}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ position:'relative', marginBottom:14 }}>
        <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }}/>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder={t.searchSchemesByNameCropEligibility}
          style={S.input}
        />
      </div>

      {/* Category Filters — horizontal scroll on mobile */}
      <div style={{ display:'flex', gap:6, flexWrap: isMobile ? 'nowrap' : 'wrap', marginBottom:18, overflowX:'auto', paddingBottom:6, WebkitOverflowScrolling:'touch' }}>
        {getCategories(t).map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={S.filterBtn(selectedCategory === cat.id)}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'40vh' }}>
          <Loader2 size={32} color="#16a34a" style={{ animation:'spin 1s linear infinite' }}/>
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(320px,1fr))', gap:14 }}>
          {filtered.map(scheme => {
            const isActive = scheme.status === 'active' || scheme.isActive !== false;
            return (
              <div key={scheme.id} className="scheme-card" style={S.card}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 6px', lineHeight:1.4 }}>{scheme.title}</h3>
                    <p style={{ fontSize:12, color:'#6b7280', margin:0, lineHeight:1.5 }}>{scheme.description}</p>
                  </div>
                  <span style={{ ...S.badge(isActive?'#15803d':'#6b7280', isActive?'#dcfce7':'#f3f4f6'), flexShrink:0 }}>
                    {isActive ? 'Active' : 'Closed'}
                  </span>
                </div>

                {scheme.category && (
                  <span style={{ ...S.badge('#1d4ed8','#dbeafe'), alignSelf:'flex-start', textTransform:'capitalize' }}>
                    {scheme.category.replace(/_/g,' ')}
                  </span>
                )}

                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {scheme.eligibility && (
                    <div style={{ display:'flex', alignItems:'flex-start', gap:7 }}>
                      <CheckCircle size={13} color="#16a34a" style={{ flexShrink:0, marginTop:2 }}/>
                      <span style={{ fontSize:12, color:'#374151' }}>{scheme.eligibility}</span>
                    </div>
                  )}
                  {(scheme.subsidy || scheme.benefit) && (
                    <div style={{ display:'flex', alignItems:'flex-start', gap:7 }}>
                      <DollarSign size={13} color="#16a34a" style={{ flexShrink:0, marginTop:2 }}/>
                      <span style={{ fontSize:12, fontWeight:700, color:'#15803d' }}>{scheme.subsidy || scheme.benefit}</span>
                    </div>
                  )}
                  {(scheme.deadline || scheme.lastDate) && (
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <Calendar size={13} color="#d97706" style={{ flexShrink:0 }}/>
                      <span style={{ fontSize:12, color:'#92400e' }}>{t.deadline}: {scheme.deadline || scheme.lastDate}</span>
                    </div>
                  )}
                </div>

                <div style={{ display:'flex', gap:8, marginTop:4 }}>
                  <Link to={`/farmer/schemes/${scheme.id}`} state={{ scheme }}
                    style={{ ...S.btn('linear-gradient(135deg,#15803d,#059669)','white'), flex:1, justifyContent:'center' }}>
                    <ArrowRight size={12}/> {t.viewDetails}
                  </Link>
                  {scheme.officialLink && (
                    <a href={scheme.officialLink} target="_blank" rel="noopener noreferrer"
                      style={S.btn('#f0fdf4','#15803d','1px solid #86efac')}>
                      <ExternalLink size={12}/>{!isMobile && ' Website'}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 20px' }}>
          <FileText size={48} color="#d1fae5" style={{ margin:'0 auto 14px', display:'block' }}/>
          <h3 style={{ fontSize:16, color:'#374151', margin:'0 0 6px', fontWeight:700 }}>No Schemes Found</h3>
          <p style={{ fontSize:13, color:'#9ca3af', margin:0 }}>Try a different category or search term</p>
        </div>
      )}

      {/* How to Apply */}
      {!loading && (
        <div style={{ marginTop:24, background:'white', borderRadius:16, border:'1.5px solid #bbf7d0', padding: isMobile ? '16px 14px' : 22, boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
          <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <FileText size={18} color="#15803d"/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 10px' }}>How to Apply?</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  'Check eligibility criteria for each scheme',
                  'Gather all required documents before applying',
                  'Visit the official website or nearest CSC center',
                  'Submit application before the deadline',
                  'Track your application status online'
                ].map((step, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:'#dcfce7', border:'2px solid #86efac', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                      <span style={{ fontSize:10, fontWeight:800, color:'#15803d' }}>{i+1}</span>
                    </div>
                    <span style={{ fontSize:12, color:'#374151', lineHeight:1.5 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default FarmerSchemes;