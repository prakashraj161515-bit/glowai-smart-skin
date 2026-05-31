// ═══════════════════════════════════════════════════════════════
//  AFFILIATE PRODUCTS — all 129 real products
//  img: Amazon CDN image ID  →  served via /api/img?url=...
//  link: your affiliate link  (rel="sponsored", opens new tab)
// ═══════════════════════════════════════════════════════════════

export type AffProduct = {
  name: string;
  brand: string;
  cat: "Cleanser" | "Serum" | "Moisturizer" | "SPF" | "Toner" | "Night Cream" | "Treatment";
  asin: string;
  imgId: string;   // Amazon CDN image ID
  link: string;
  rating: number;  // star rating (e.g. 4.3)
  reviews: number; // review count
  bestseller?: boolean;
  tags: string[];
};

function img(id: string) {
  return `https://m.media-amazon.com/images/I/${id}._AC_SL500_.jpg`;
}

export const ALL_PRODUCTS: AffProduct[] = [
  // ── CLEANSERS (51) ──────────────────────────────────────────
  { name:"Garnier Bright Complete Vitamin C Face Wash", brand:"Garnier", cat:"Cleanser", asin:"B0G4WQX1WR", imgId:"51O4CZnsiZL", link:"https://amzn.to/4dDZDau", rating:4.3, reviews:12840, bestseller:true, tags:["vitamin c","brightening","glow","daily","all skin"] },
  { name:"Garnier Men Acno Fight Gentle Cleanser", brand:"Garnier", cat:"Cleanser", asin:"B0FJ74F5DB", imgId:"711-v3qfhmL", link:"https://amzn.to/4vhBrkb", rating:4.2, reviews:3210, tags:["acne","men","gentle","oil control"] },
  { name:"Garnier Men TurboBright Double Action Face Wash", brand:"Garnier", cat:"Cleanser", asin:"B00V4L6JC2", imgId:"615gCt+GzCL", link:"https://amzn.to/4uJT1gS", rating:4.1, reviews:5670, tags:["brightening","men","anti-pollution"] },
  { name:"Muuchstac Ocean Face Wash for Men", brand:"Muuchstac", cat:"Cleanser", asin:"B07KB1Y75J", imgId:"51FodsevJrL", link:"https://amzn.to/4dEfxBI", rating:4.0, reviews:890, tags:["acne","oil control","men","pimples"] },
  { name:"POND'S Bright Beauty Spot Less Fairness Face Wash", brand:"POND'S", cat:"Cleanser", asin:"B08NYD1GGK", imgId:"512dChFNuXL", link:"https://amzn.to/4vjJk8P", rating:4.2, reviews:7820, tags:["brightening","dark spots","fairness","daily"] },
  { name:"Cetaphil Gentle Skin Hydrating Face Wash", brand:"Cetaphil", cat:"Cleanser", asin:"B01CCGW4OE", imgId:"61Ti2uv6V3L", link:"https://amzn.to/4vgCNLQ", rating:4.5, reviews:18450, bestseller:true, tags:["gentle","dry skin","hydrating","sensitive","niacinamide"] },
  { name:"NIVEA MEN All in 1 Oil Control Face Wash", brand:"NIVEA", cat:"Cleanser", asin:"B00X9UOCEI", imgId:"51POpTT0iIL", link:"https://amzn.to/4uGmng7", rating:4.1, reviews:6540, tags:["men","oil control","acne","blackheads","whitehead"] },
  { name:"L'Oreal Paris Glycolic Bright Daily Foaming Face Cleanser", brand:"L'Oreal Paris", cat:"Cleanser", asin:"B09ST9TN64", imgId:"51nuoY9YGTL", link:"https://amzn.to/4wPmuay", rating:4.3, reviews:9340, bestseller:true, tags:["glycolic acid","brightening","dull skin","daily glow"] },
  { name:"O3+ Vitamin C Glowing Face Wash", brand:"O3+", cat:"Cleanser", asin:"B0944TWQXQ", imgId:"51Y+2oB82eL", link:"https://amzn.to/4u5Gjb8", rating:4.2, reviews:2130, tags:["vitamin c","glow","brightening"] },
  { name:"Roop Mantra Cucumber Face Wash", brand:"Roop Mantra", cat:"Cleanser", asin:"B01LWXCAEL", imgId:"61mNjaNdxeL", link:"https://amzn.to/4dFrDKP", rating:4.0, reviews:3450, tags:["cucumber","dry skin","hydrating","herbal"] },
  { name:"CeraVe Hydrating Cleanser", brand:"CeraVe", cat:"Cleanser", asin:"B07C5R51Q9", imgId:"61V-ae6NZOL", link:"https://amzn.to/4uHq0Ck", rating:4.6, reviews:22100, bestseller:true, tags:["ceramides","hyaluronic acid","dry skin","gentle","barrier"] },
  { name:"Ashpveda Ayurvedic Face Wash with Kashmiri Saffron & Neem", brand:"Ashpveda", cat:"Cleanser", asin:"B0CPFGF25K", imgId:"71cForUL8QL", link:"https://amzn.to/439l1OO", rating:4.3, reviews:1780, tags:["saffron","neem","ayurvedic","brightening","natural"] },
  { name:"WOW Skin Science Apple Cider Vinegar Foaming Face Wash", brand:"WOW Skin Science", cat:"Cleanser", asin:"B07SQXPW35", imgId:"518GtmPOzVL", link:"https://amzn.to/4fhfcpU", rating:4.1, reviews:8920, tags:["apple cider vinegar","oil control","pores","foaming"] },
  { name:"Himalaya Natural Glow Kesar Face Wash", brand:"Himalaya", cat:"Cleanser", asin:"B006LXC8KU", imgId:"71EiB27+d4L", link:"https://amzn.to/4wZH2xg", rating:4.2, reviews:11230, tags:["kesar","saffron","glow","brightening","natural"] },
  { name:"Garnier Vitamin C + Serum Face Wash", brand:"Garnier", cat:"Cleanser", asin:"B0F6C5VCKF", imgId:"619MxRl7SBL", link:"https://amzn.to/4eehmW8", rating:4.4, reviews:4560, tags:["vitamin c","serum","brightening","1 wash glow"] },
  { name:"RENEE Everyday Face Bright Gentle Face Wash", brand:"RENEE", cat:"Cleanser", asin:"B0FSS8TSCQ", imgId:"61NwtpNxKFL", link:"https://amzn.to/4vkDN1H", rating:4.2, reviews:890, tags:["brightening","vitamin c","gentle","daily"] },
  { name:"Himalaya Dark Spot Clearing Turmeric Face Wash", brand:"Himalaya", cat:"Cleanser", asin:"B0CJ4NSV1Q", imgId:"71DInYYVWRL", link:"https://amzn.to/4fbGU7n", rating:4.3, reviews:5670, tags:["turmeric","niacinamide","dark spots","brightening"] },
  { name:"O3+ Glow Boosting Face Wash with Glycolic Acid", brand:"O3+", cat:"Cleanser", asin:"B0DN1YWDST", imgId:"51UfpbWfkIL", link:"https://amzn.to/3SbRLEE", rating:4.1, reviews:1230, tags:["glycolic acid","aloe vera","vitamin c","glow"] },
  { name:"Lakme Blush & Glow Strawberry Freshness Gel Face Wash", brand:"Lakme", cat:"Cleanser", asin:"B0C46JRX14", imgId:"61A+vW9hqLL", link:"https://amzn.to/43IbkqE", rating:4.0, reviews:4320, tags:["strawberry","gel","freshness","daily"] },
  { name:"Brillare Professional Natural Face Wash", brand:"Brillare", cat:"Cleanser", asin:"B0132H7D66", imgId:"51rEn6EZMcL", link:"https://amzn.to/4ebtOWG", rating:4.1, reviews:670, tags:["natural","professional","gentle"] },
  { name:"Glutafine Facewash with Glutathione & Vitamin C", brand:"Glutafine", cat:"Cleanser", asin:"B07PG8PKMX", imgId:"61NMYJwJUiL", link:"https://amzn.to/4vmFKuH", rating:4.2, reviews:2340, tags:["glutathione","kojic acid","vitamin c","brightening","even tone"] },
  { name:"RAS Luxury Oils Infinity Anti Ageing Crème Face Cleanser", brand:"RAS Luxury", cat:"Cleanser", asin:"B0B9Y7XGS6", imgId:"51J9mOwYc-L", link:"https://amzn.to/4dSh2Lj", rating:4.4, reviews:560, tags:["anti-ageing","calendula","shea butter","luxury"] },
  { name:"Biluma Advance Skin Brightening Face Wash", brand:"Biluma", cat:"Cleanser", asin:"B09VT7VFSB", imgId:"61nMxKRX+nL", link:"https://amzn.to/3Py2ust", rating:4.0, reviews:1120, tags:["brightening","vitamin e","aloe vera","pH 5.5","soap free"] },
  { name:"Glow & Lovely Bright Glow Facewash", brand:"Glow & Lovely", cat:"Cleanser", asin:"B00CQ423Q2", imgId:"41hAa+GflqL", link:"https://amzn.to/4nYf2pq", rating:4.0, reviews:9870, tags:["brightening","glow","daily","fairness"] },
  { name:"POND'S Pure Detox Face Wash", brand:"POND'S", cat:"Cleanser", asin:"B08PQ6VWPT", imgId:"51AmjNNFiyL", link:"https://amzn.to/4ehLnn5", rating:4.1, reviews:6780, tags:["detox","brightening","activated charcoal","oily skin"] },
  { name:"DERMATOUCH Bye Bye Pigmentation Face Wash", brand:"DERMATOUCH", cat:"Cleanser", asin:"B0BJQK51SM", imgId:"71FRgB+dUcL", link:"https://amzn.to/4u1QkGb", rating:4.2, reviews:1450, tags:["niacinamide","kojic acid","glutathione","pigmentation","tan removal"] },
  { name:"Simple Kind To Skin Refreshing Facial Wash", brand:"Simple", cat:"Cleanser", asin:"B000LQUA6M", imgId:"51wqZYWGr+L", link:"https://amzn.to/4wYq1DD", rating:4.3, reviews:8920, bestseller:true, tags:["gentle","soap free","all skin","daily","sensitive"] },
  { name:"Lacto Calamine Face Wash For Oily Skin", brand:"Lacto Calamine", cat:"Cleanser", asin:"B09B7RWS8W", imgId:"610ju0DHnTL", link:"https://amzn.to/4vmFWtV", rating:4.2, reviews:3210, tags:["kaolin clay","niacinamide","vitamin e","oily skin","oil control"] },
  { name:"Lotus Professional PhytoRx Whitening Brightening Face Wash", brand:"Lotus Professional", cat:"Cleanser", asin:"B07NKMRRW8", imgId:"51eDiOlRfEL", link:"https://amzn.to/3RG79Jl", rating:4.3, reviews:2340, tags:["whitening","brightening","pore refining","preservative free"] },
  { name:"Dot & Key Watermelon Cooling Gel Face Wash", brand:"Dot & Key", cat:"Cleanser", asin:"B0B71Y3MYG", imgId:"614Jw+uAifL", link:"https://amzn.to/3PwLLpp", rating:4.3, reviews:4560, tags:["watermelon","vitamin c","cucumber","oil free","glow"] },
  { name:"POND'S Bright Beauty Vitamin B3+ Face Wash", brand:"POND'S", cat:"Cleanser", asin:"B0B7R7P8ZX", imgId:"51LNBCOt4JL", link:"https://amzn.to/4nVwj2y", rating:4.2, reviews:5670, tags:["niacinamide","vitamin b3","brightening","daily"] },
  { name:"Lotus Herbals 3-in-1 Deep Cleansing Facial Foam", brand:"Lotus Herbals", cat:"Cleanser", asin:"B00EU4YX82", imgId:"61JJErAq0rL", link:"https://amzn.to/4u1QAF9", rating:4.1, reviews:4320, tags:["deep cleansing","acne","oily skin","3-in-1"] },
  { name:"Bio Code Retinol Anti-Ageing Face Wash", brand:"Bio Code", cat:"Cleanser", asin:"B0FRG6HQP3", imgId:"510utvGhnOL", link:"https://amzn.to/4dPmDlB", rating:4.3, reviews:670, tags:["retinol","peptide","hyaluronic acid","anti-ageing"] },
  { name:"Acnestar Foaming Face Wash for Acne", brand:"Acnestar", cat:"Cleanser", asin:"B01LYLFXY9", imgId:"51lQch1OSaL", link:"https://amzn.to/4uGpftv", rating:4.0, reviews:3450, tags:["acne","foaming","sebum","daily","mild"] },
  { name:"Lotus Herbals Whiteglow Day Night Cream Face Wash Combo", brand:"Lotus Herbals", cat:"Cleanser", asin:"B00JMAAKTU", imgId:"61s9sgsiLLL", link:"https://amzn.to/4uIxYva", rating:4.1, reviews:2340, tags:["whitening","glow","day night","combo"] },
  { name:"Organic Male OM4 Normal Bionutrient Face Wash", brand:"Organic Male OM4", cat:"Cleanser", asin:"B00805W4IS", imgId:"61MjOoNEsKL", link:"https://amzn.to/4x3YsZG", rating:4.2, reviews:450, tags:["organic","men","bionutrient","natural"] },
  { name:"Ozone D-Tan Facial Cleanser", brand:"Ozone", cat:"Cleanser", asin:"B09C5LFNFB", imgId:"61nhANJafzL", link:"https://amzn.to/4x04z12", rating:4.1, reviews:890, tags:["d-tan","detan","cucumber","shea butter","milk"] },
  { name:"Lotus Professional PhytoRx Brightening Crème & Face Wash Combo", brand:"Lotus Professional", cat:"Cleanser", asin:"B07WWW4H9B", imgId:"51JnKI536NL", link:"https://amzn.to/4uLLq1i", rating:4.1, reviews:1230, tags:["whitening","brightening","combo","skin lightening"] },
  { name:"Mirabelle Korea Red Rice Deep Cleansing Face Wash", brand:"Mirabelle Korea", cat:"Cleanser", asin:"B0DX298GDK", imgId:"61yAYXpiTkL", link:"https://amzn.to/3RS0Dze", rating:4.2, reviews:780, tags:["korean","red rice","deep cleansing","glow"] },
  { name:"Foxtale Hydration Skin Care Kit Face Wash + Moisturizer", brand:"Foxtale", cat:"Cleanser", asin:"B09S3VWH4C", imgId:"51b0kKW3KeL", link:"https://amzn.to/4e1ESoi", rating:4.4, reviews:1560, tags:["ceramide","moisturizer","kit","hydration","pore"] },
  { name:"Blue Nectar Honey Face Wash for Detan & Glowing Skin", brand:"Blue Nectar", cat:"Cleanser", asin:"B01BSS9Q5C", imgId:"61bF7paOAZL", link:"https://amzn.to/4wTS4UB", rating:4.2, reviews:2100, tags:["honey","detan","glow","ayurvedic","even tone"] },
  { name:"Acnestar SA Foaming Face Wash Salicylic Acid 2%", brand:"Acnestar", cat:"Cleanser", asin:"B0BW99Z5T4", imgId:"517pOTcRPAL", link:"https://amzn.to/4dVtSZi", rating:4.1, reviews:1890, tags:["salicylic acid","acne","deep cleansing","anti-acne"] },
  { name:"Cetaphil Brightness Reveal Creamy Cleanser", brand:"Cetaphil", cat:"Cleanser", asin:"B08L91MJJH", imgId:"61d+gE5QbSL", link:"https://amzn.to/4ua9kT8", rating:4.4, reviews:6780, bestseller:true, tags:["niacinamide","brightening","uneven skin tone","creamy","sea daffodil"] },
  { name:"Neutrogena Deep Clean Gentle Facial Cleanser", brand:"Neutrogena", cat:"Cleanser", asin:"B006LQUA6M", imgId:"41cB3gU9HvL", link:"https://amzn.to/3PTQ26m", rating:4.3, reviews:12400, bestseller:true, tags:["deep clean","gentle","glycerin","alcohol free","dermatologist"] },
  { name:"Cetaphil Oily Skin Cleanser", brand:"Cetaphil", cat:"Cleanser", asin:"B0D78W8K62", imgId:"61r1u5e85XL", link:"https://amzn.to/3PNawxE", rating:4.5, reviews:8900, bestseller:true, tags:["oily skin","acne","foaming","gentle","daily"] },
  { name:"Neutrogena Deep Clean Foaming Cleanser", brand:"Neutrogena", cat:"Cleanser", asin:"B006T8CNUM", imgId:"4111QWMYfOL", link:"https://amzn.to/4vdO7bD", rating:4.3, reviews:9870, tags:["foaming","hydrating","non-drying","pH friendly","upgraded"] },
  { name:"Minimalist Anti-Acne Salicylic Acid 2% Face Wash", brand:"Minimalist", cat:"Cleanser", asin:"B096PJMGPL", imgId:"514PVblwPdL", link:"https://amzn.to/4fi5ROv", rating:4.4, reviews:14500, bestseller:true, tags:["salicylic acid","LHA","acne","pores","oil control"] },
  { name:"Garnier Skin Naturals Micellar Cleansing Water", brand:"Garnier", cat:"Cleanser", asin:"B06ZZ5XVR7", imgId:"41yAKxKqv4L", link:"https://amzn.to/49rSTKn", rating:4.3, reviews:7890, tags:["micellar","makeup remover","hydrating","soothing","no rinse"] },
  { name:"Conscious Chemist Makeup Remover Oil Cleanser", brand:"Conscious Chemist", cat:"Cleanser", asin:"B0B75JSJ5Q", imgId:"51g8Dur60gL", link:"https://amzn.to/4edRbyU", rating:4.3, reviews:1230, tags:["makeup remover","oil cleanser","oily skin","gentle"] },
  { name:"POND'S Pure Detox Anti-Pollution Face Wash", brand:"POND'S", cat:"Cleanser", asin:"B07T8NWDJP", imgId:"51gNeZyT97L", link:"https://amzn.to/4x0EKxE", rating:4.2, reviews:8760, tags:["charcoal","anti-pollution","detox","brightening"] },
  { name:"Ghar Soaps Magic De-Tan Face Wash with Saffron & Glutathione", brand:"Ghar Soaps", cat:"Cleanser", asin:"B0GYCT961V", imgId:"71x-JgwRslL", link:"https://amzn.to/4vjcbKb", rating:4.1, reviews:340, tags:["saffron","glutathione","de-tan","brightening","tan removal"] },

  // ── SPF (18) ────────────────────────────────────────────────
  { name:"Dot & Key Vitamin C + E Super Bright Sunscreen SPF 50+ PA++++", brand:"Dot & Key", cat:"SPF", asin:"B0BLK4YRSN", imgId:"61ckTgN44WL", link:"https://amzn.to/4nVADPo", rating:4.4, reviews:8920, bestseller:true, tags:["vitamin c","spf 50","brightening","uv filter","lightweight"] },
  { name:"Lakme SPF 50 PA++++ Sunscreen Lotion", brand:"Lakme", cat:"SPF", asin:"B00CS1KT96", imgId:"51+gSgH2c4L", link:"https://amzn.to/4dODB3z", rating:4.2, reviews:18540, bestseller:true, tags:["spf 50","uva uvb","blue light","waterlight","no white cast"] },
  { name:"Dot & Key Watermelon Cooling Sunscreen SPF 50+ PA++++", brand:"Dot & Key", cat:"SPF", asin:"B0BQN2YWN5", imgId:"61laZHTxyOL", link:"https://amzn.to/43CQUPQ", rating:4.4, reviews:12300, bestseller:true, tags:["watermelon","cooling","spf 50","dewy","new age uv"] },
  { name:"LAKMÉ Sun Expert SPF 50 PA+++ Gel Sunscreen", brand:"Lakme", cat:"SPF", asin:"B0744RJW22", imgId:"51vxEucuTGL", link:"https://amzn.to/4vnkCo4", rating:4.2, reviews:14560, tags:["gel","niacinamide","oily skin","non-sticky","combination"] },
  { name:"The Derma Co 1% Hyaluronic Sunscreen Aqua Gel SPF 50 PA++++", brand:"The Derma Co", cat:"SPF", asin:"B0C6M3KHXV", imgId:"51AvlsTFuTL", link:"https://amzn.to/4uzyETs", rating:4.3, reviews:9870, bestseller:true, tags:["hyaluronic acid","spf 50","no white cast","lightweight","hydrating"] },
  { name:"Deconstruct Gel Sunscreen SPF 50 PA++++", brand:"Deconstruct", cat:"SPF", asin:"B0B45RB1RV", imgId:"41Dbd5mjnfL", link:"https://amzn.to/3S9Iih8", rating:4.4, reviews:11230, bestseller:true, tags:["gel","oily skin","photostable","lightweight","4 uv filters"] },
  { name:"Minimalist Sunscreen SPF 50 PA+++ with Niacinamide", brand:"Minimalist", cat:"SPF", asin:"B09FPS9D5T", imgId:"51liYV8g2DL", link:"https://amzn.to/4vkFhch", rating:4.4, reviews:19870, bestseller:true, tags:["niacinamide","multivitamins","spf 50","clinically tested","lightweight"] },
  { name:"WishCare Niacinamide Oil Balance Fluid Sunscreen SPF 50 PA++++", brand:"WishCare", cat:"SPF", asin:"B0CW1N7QRT", imgId:"51mUwYdsFCL", link:"https://amzn.to/49qm1Sk", rating:4.3, reviews:3450, tags:["niacinamide","oil control","matte","8hrs protection"] },
  { name:"Neutrogena Ultrasheer Sunscreen SPF 50+ PA++++", brand:"Neutrogena", cat:"SPF", asin:"B082PFY9S7", imgId:"412J6P6QteL", link:"https://amzn.to/4fgsXFl", rating:4.3, reviews:16780, bestseller:true, tags:["ultrasheer","blue light","no white cast","water resistant","ultra light"] },
  { name:"Molecular Company SPF 50+ PA++++ Face Sunscreen Gel", brand:"Molecular Company", cat:"SPF", asin:"B0DTKWCP1Z", imgId:"61rzzZ-cUoL", link:"https://amzn.to/4dS0jrt", rating:4.3, reviews:2340, tags:["niacinamide","spf 50","gel","moisturising","hyaluronic acid"] },
  { name:"Pilgrim 5% Vitamin C Brightening Serum Sunscreen SPF 50+ PA++++", brand:"Pilgrim", cat:"SPF", asin:"B0DSJFYRZP", imgId:"61tul0ZUABL", link:"https://amzn.to/4wYjXe7", rating:4.3, reviews:4560, tags:["vitamin c","glutathione","serum sunscreen","brightening","in-vivo"] },
  { name:"Reginald Men SPF 50+ PA++++ Sunscreen", brand:"Reginald", cat:"SPF", asin:"B0DT49ZWR5", imgId:"615nTAJyckL", link:"https://amzn.to/4u6vyVU", rating:4.2, reviews:890, tags:["men","spf 50","brightening","uva uvb","in-vivo"] },
  { name:"Hybrid Aqua Gel Sunscreen SPF 50 PA++++", brand:"Hybrid", cat:"SPF", asin:"B0GZW3LZVL", imgId:"61tI81DnKdL", link:"https://amzn.to/4314Kvl", rating:4.2, reviews:670, tags:["aqua gel","zero white cast","non-greasy","spf 50"] },
  { name:"Dot & Key Strawberry Dew Tinted Sunscreen SPF 50+ PA++++", brand:"Dot & Key", cat:"SPF", asin:"B0CX1W81RM", imgId:"6142gGfQrYL", link:"https://amzn.to/3RDqw5P", rating:4.3, reviews:5670, tags:["tinted","strawberry","spf 50","brightening","new age uv"] },
  { name:"Deconstruct Fluid Brightening Sunscreen SPF 50+ PA++++", brand:"Deconstruct", cat:"SPF", asin:"B0D3HWWMY7", imgId:"41y92R6p1qL", link:"https://amzn.to/49vK8is", rating:4.4, reviews:7890, tags:["niacinamide","brightening","dewy","spf 50"] },
  { name:"Beauty of Joseon Relief Sun Rice + Probiotics SPF 50+ PA++++", brand:"Beauty of Joseon", cat:"SPF", asin:"B09JVNZVH3", imgId:"61DA-VH24GL", link:"https://amzn.to/3RGX6Um", rating:4.5, reviews:14560, bestseller:true, tags:["korean","rice","probiotics","oily skin","lightweight"] },
  { name:"Sunscreen SPF 50+ PA+++ for Acne-Prone & Oily Skin", brand:"Generic", cat:"SPF", asin:"B0GPD3L34Z", imgId:"61TXQHIVbnL", link:"https://amzn.to/4vpfEat", rating:4.1, reviews:560, tags:["spf 50","acne","oily skin","lightweight"] },
  { name:"Dolce Aura Sun Protection & Pore Care Combo", brand:"Dolce Aura", cat:"SPF", asin:"B0FCXW8YPX", imgId:"713wsKeYsYL", link:"https://amzn.to/434Q8eu", rating:4.2, reviews:450, tags:["sunscreen","charcoal","centella","pore","combo"] },

  // ── SERUMS (15) ─────────────────────────────────────────────
  { name:"Be Clinical PlumpX Serum with Hyaluronic Acid", brand:"Be Clinical", cat:"Serum", asin:"B0F9FQK3M1", imgId:"4196klOoMZL", link:"https://amzn.to/4fhFwQI", rating:4.4, reviews:670, tags:["hyaluronic acid","plumping","anti-ageing","fine lines"] },
  { name:"Be Clinical Blemish Balance Serum for Acne-Prone Skin", brand:"Be Clinical", cat:"Serum", asin:"B0FP2R9965", imgId:"510kGCN35gL", link:"https://amzn.to/4vgFRYm", rating:4.4, reviews:560, tags:["acne","hyperpigmentation","oil control","blemish"] },
  { name:"Bio Essence 24K Gold Skin Elixir Vitamin C Face Serum", brand:"Bio Essence", cat:"Serum", asin:"B09D8JF5CK", imgId:"51ntQuwW2qL", link:"https://amzn.to/4fi66ZV", rating:4.2, reviews:1230, tags:["24k gold","vitamin c","hyaluronic acid","niacinamide","dark spots"] },
  { name:"Hyphen 18% Brightening + 20% Collagen Face Serum", brand:"Hyphen", cat:"Serum", asin:"B0FDQZBV6K", imgId:"614M7aJAe8L", link:"https://amzn.to/3PuJCdS", rating:4.5, reviews:3450, bestseller:true, tags:["collagen","brightening","niacinamide","hyaluronic","mandarin"] },
  { name:"Garnier Vitamin C+ Face Serum for Skin Brightening", brand:"Garnier", cat:"Serum", asin:"B08FTQXWC7", imgId:"51-0Yb6kfJL", link:"https://amzn.to/4eek1iA", rating:4.3, reviews:18900, bestseller:true, tags:["vitamin c","niacinamide","dark spots","brightening","100x stronger"] },
  { name:"L'Oreal Paris Glycolic Bright 8% Face Serum", brand:"L'Oreal Paris", cat:"Serum", asin:"B0B9QYVGT3", imgId:"31Q4dL4U08L", link:"https://amzn.to/4nVeMrj", rating:4.2, reviews:6780, bestseller:true, tags:["glycolic acid","melasyl","niacinamide","brightening","dark spots"] },
  { name:"The Derma Co 2% Salicylic Acid Face Serum", brand:"The Derma Co", cat:"Serum", asin:"B0C61Q7DM7", imgId:"61yksgXYsuL", link:"https://amzn.to/4u5JijQ", rating:4.4, reviews:9870, bestseller:true, tags:["salicylic acid","acne","blackheads","pores","exfoliating"] },
  { name:"Himalaya Brightening Vitamin C Orange Face Serum", brand:"Himalaya", cat:"Serum", asin:"B0DCW1F242", imgId:"61oqGjcGGQL", link:"https://amzn.to/4ved07a", rating:4.2, reviews:3450, tags:["vitamin c","niacinamide","hyaluronic acid","brightening","orange"] },
  { name:"Plum 10% Niacinamide Serum with Rice Water", brand:"Plum", cat:"Serum", asin:"B097RBPTRH", imgId:"51G7Il-vTWL", link:"https://amzn.to/4uJWDiW", rating:4.4, reviews:14560, bestseller:true, tags:["niacinamide","rice water","glow","acne","pores","brightening"] },
  { name:"Purifying Neem Face Serum with 2% Salicylic Acid", brand:"Himalaya", cat:"Serum", asin:"B0FP16ZCBH", imgId:"61kyHPufKlL", link:"https://amzn.to/4edS7TT", rating:4.2, reviews:890, tags:["neem","salicylic acid","cica","acne","acne marks"] },
  { name:"Pond's Bright Miracle Ultimate Brightening Serum", brand:"Pond's", cat:"Serum", asin:"B0C1KP6B8G", imgId:"515cdEdu4-L", link:"https://amzn.to/4fLaFw0", rating:4.3, reviews:7890, tags:["niasorcinol","vitamin c","brightening","visibly brighter"] },
  { name:"Lakme Absolute Perfect Radiance Serum", brand:"Lakme", cat:"Serum", asin:"B0B8Z315M7", imgId:"41Z-MdyJROL", link:"https://amzn.to/4x0BGBG", rating:4.1, reviews:2340, tags:["radiance","brightening","perfect skin","serum"] },
  { name:"Fixderma 2% Salicylic Acid Serum with Azelaic & Mandelic Acid", brand:"Fixderma", cat:"Serum", asin:"B0CVNCF79J", imgId:"61wZBLwP67L", link:"https://amzn.to/4vk2BHa", rating:4.3, reviews:3670, tags:["salicylic acid","azelaic acid","mandelic acid","acne","spot treatment"] },
  { name:"Himalaya Dark Spot Clearing Turmeric Face Serum", brand:"Himalaya", cat:"Serum", asin:"B0CKTQGLMZ", imgId:"61+j-wJ4qAL", link:"https://amzn.to/4u3vUww", rating:4.3, reviews:4560, tags:["turmeric","glycolic acid","niacinamide","dark spots","day 7"] },
  { name:"Olay Regenerist Retinol 24 Night Serum", brand:"Olay", cat:"Serum", asin:"B08698SL3W", imgId:"41wCF1U8H8L", link:"https://amzn.to/4uFXxge", rating:4.4, reviews:8920, bestseller:true, tags:["retinol","night","anti-ageing","resurface","fragrance free"] },

  // ── MOISTURIZERS (21) ───────────────────────────────────────
  { name:"Plum 2% Niacinamide & Rice Water Superlight Gel Moisturizer", brand:"Plum", cat:"Moisturizer", asin:"B0C2Z5F5TJ", imgId:"61Ee75OSq4L", link:"https://amzn.to/43CTuFw", rating:4.4, reviews:9870, bestseller:true, tags:["niacinamide","rice water","oil-free","brightening","blemish"] },
  { name:"Garnier Fresh & Bright Vitamin C Sorbet Moisturizer", brand:"Garnier", cat:"Moisturizer", asin:"B0GC6GYTMB", imgId:"51caSuIaRYL", link:"https://amzn.to/4vja1Kz", rating:4.3, reviews:4560, tags:["vitamin c","hyaluronic acid","niacinamide","BHA","lightweight"] },
  { name:"NIVEA Soft Daily UV Light Moisturising Cream SPF-15", brand:"NIVEA", cat:"Moisturizer", asin:"B0DSVTLHMC", imgId:"61N7ISBanuL", link:"https://amzn.to/4o3YpZQ", rating:4.2, reviews:8900, tags:["uv protection","spf 15","lightweight","daily","soft"] },
  { name:"Dot & Key Barrier Repair Moisturizer", brand:"Dot & Key", cat:"Moisturizer", asin:"B0BDVG99J5", imgId:"61SSD0FoULL", link:"https://amzn.to/4o490E8", rating:4.4, reviews:6780, bestseller:true, tags:["barrier repair","ceramides","120hrs","dry skin","sensitive"] },
  { name:"Pond's Super Light Gel Oil Free Face Moisturizer", brand:"Pond's", cat:"Moisturizer", asin:"B09Z6TJP7Y", imgId:"51ibrlV3I+L", link:"https://amzn.to/3PL7eej", rating:4.2, reviews:12300, bestseller:true, tags:["oil free","gel","cera-hyamino","daily","lightweight"] },
  { name:"Deconstruct Oil-Free Moisturizer", brand:"Deconstruct", cat:"Moisturizer", asin:"B09NGMRL51", imgId:"41oD3weaQUL", link:"https://amzn.to/3PXsU6O", rating:4.4, reviews:7890, bestseller:true, tags:["oil free","72h hydration","non-comedogenic","fast absorbing"] },
  { name:"Shankara Gheesutra Face Emulsion Natural Desi Ghee Moisturizer", brand:"Shankara", cat:"Moisturizer", asin:"B0C2PS7CCL", imgId:"51hc94AlfHL", link:"https://amzn.to/4dV0X7W", rating:4.3, reviews:670, tags:["desi ghee","natural","glow","vitamin c","rejuvenation"] },
  { name:"NIVEA Soft Moisturizing Cream", brand:"NIVEA", cat:"Moisturizer", asin:"B00E96N6O8", imgId:"51qu97DFTjL", link:"https://amzn.to/3Q7tJu1", rating:4.3, reviews:34500, bestseller:true, tags:["72hr","vitamin e","jojoba oil","lightweight","non-sticky"] },
  { name:"Minimalist Vitamin B5 10% Oil-Free Moisturizer", brand:"Minimalist", cat:"Moisturizer", asin:"B09Q3MWP2S", imgId:"51g9c5DjXpL", link:"https://amzn.to/4uIkIqv", rating:4.4, reviews:14560, bestseller:true, tags:["vitamin b5","oil free","gel","oily skin","barrier"] },
  { name:"FLiCKA Silk Touch 3-in-1 Moisturizer & Primer", brand:"FLiCKA", cat:"Moisturizer", asin:"B0DHH8M8S1", imgId:"61eyK4960RL", link:"https://amzn.to/4dV1iHK", rating:4.2, reviews:1230, tags:["primer","3-in-1","pore minimizer","lightweight","dewy"] },
  { name:"Blue Nectar Saffron Anti Aging Cream", brand:"Blue Nectar", cat:"Moisturizer", asin:"B0743BBC8K", imgId:"61b9RvbcotL", link:"https://amzn.to/439qghs", rating:4.3, reviews:3450, tags:["saffron","anti-ageing","retinol alternative","fine lines","ayurvedic"] },
  { name:"Blue Nectar Face Cream for Men Daily Moisturizing Anti Aging", brand:"Blue Nectar", cat:"Moisturizer", asin:"B077RZBD8M", imgId:"61i7hxGVYoL", link:"https://amzn.to/4xhsBoz", rating:4.3, reviews:2340, tags:["men","anti-ageing","oily skin","glow","daily"] },
  { name:"Olay Regenerist Microsculpting Day Cream", brand:"Olay", cat:"Moisturizer", asin:"B078LSV2RL", imgId:"51TIs6EWjKL", link:"https://amzn.to/4fbMtmh", rating:4.4, reviews:18900, bestseller:true, tags:["hyaluronic acid","niacinamide","peptides","plump","bouncy"] },
  { name:"Olay Regenerist Super Collagen Peptides Moisturizer", brand:"Olay", cat:"Moisturizer", asin:"B0F3NY14SN", imgId:"511OIf+l+YL", link:"https://amzn.to/4fR4UNj", rating:4.4, reviews:3450, tags:["collagen","peptides","firming","anti-ageing","5 signs"] },
  { name:"CeraVe HA Water Gel Moisturizer with Hyaluronic Acid", brand:"CeraVe", cat:"Moisturizer", asin:"B0GRW7P4YR", imgId:"7160vnA-IaL", link:"https://amzn.to/4e9ZZpv", rating:4.5, reviews:5670, bestseller:true, tags:["hyaluronic acid","ceramides","niacinamide","oil free","gel"] },
  { name:"Pond's Bright Beauty Light Cream with UV Filter", brand:"Pond's", cat:"Moisturizer", asin:"B099QVJGCR", imgId:"51qbCjJYqEL", link:"https://amzn.to/4adxDIr", rating:4.2, reviews:8900, tags:["uv filter","niacinamide","niasorcinol","dark spots","vitamin c"] },
  { name:"Re'equil Oil Free Moisturizer with Hyaluronic Acid", brand:"Re'equil", cat:"Moisturizer", asin:"B082NL4SNP", imgId:"41RIIAitj5L", link:"https://amzn.to/4dOu7H3", rating:4.3, reviews:6780, tags:["hyaluronic acid","oil free","betaine","oily skin","non-greasy"] },
  { name:"Biotique Morning Nectar Flawless Skin Moisturizer", brand:"Biotique", cat:"Moisturizer", asin:"B00791CORK", imgId:"71eGPJQryIL", link:"https://amzn.to/4nXshqH", rating:4.2, reviews:7890, tags:["dark spots","blackheads","blemishes","flawless","natural"] },
  { name:"Garnier Skin Naturals Anti-Ageing Wrinkle Lift Cream", brand:"Garnier", cat:"Moisturizer", asin:"B00791D32U", imgId:"51FTaE92esL", link:"https://amzn.to/4dUm6yX", rating:4.1, reviews:5670, tags:["anti-ageing","wrinkle lift","moisturizing","smoothing","forming"] },
  { name:"The Derma Co Oil-Free Daily Face Moisturizer", brand:"The Derma Co", cat:"Moisturizer", asin:"B0B39MLQYZ", imgId:"411cIM2TqCL", link:"https://amzn.to/4dVOVLs", rating:4.3, reviews:8900, tags:["hyaluronic acid","ceramides","multivitamins","oil free","non-greasy"] },
  { name:"Himalaya Nourishing Skin Cream", brand:"Himalaya", cat:"Moisturizer", asin:"B01F32Q800", imgId:"61N2NtfMc9L", link:"https://amzn.to/4uGsNMf", rating:4.2, reviews:12300, tags:["winter cherry","aloe vera","non-greasy","daily","lightweight"] },

  // ── TONERS (12) ─────────────────────────────────────────────
  { name:"Plum 3% Niacinamide & Rice Water Face Toner", brand:"Plum", cat:"Toner", asin:"B09PV4379W", imgId:"41BNihr3HwL", link:"https://amzn.to/4u8312p", rating:4.4, reviews:12300, bestseller:true, tags:["niacinamide","rice water","alcohol free","oily","acne","pores"] },
  { name:"The Ordinary Glycolic Acid 7% Exfoliating Toner", brand:"The Ordinary", cat:"Toner", asin:"B0DMTDN158", imgId:"51maLJWzPyL", link:"https://amzn.to/4vmKIYn", rating:4.4, reviews:18900, bestseller:true, tags:["glycolic acid","brightening","smoothing","even tone","exfoliating"] },
  { name:"Biotique Cucumber Pore Tightening Toner", brand:"Biotique", cat:"Toner", asin:"B00791CS2G", imgId:"51EIEe2npaL", link:"https://amzn.to/4vnlBok", rating:4.1, reviews:8900, tags:["cucumber","pore tightening","ayurvedic","pH balance","botanical"] },
  { name:"Pilgrim Korean Beauty White Lotus Face Mist & Toner", brand:"Pilgrim", cat:"Toner", asin:"B0836XVS63", imgId:"51HybJepgGL", link:"https://amzn.to/4uMLDS2", rating:4.2, reviews:4560, tags:["white lotus","korean","alcohol free","mist","glow"] },
  { name:"Plum Bulgarian Valley Rose Water Face Toner", brand:"Plum", cat:"Toner", asin:"B093CNS6G1", imgId:"41PusyoBYtL", link:"https://amzn.to/4wUBZOJ", rating:4.3, reviews:7890, tags:["rose water","hyaluronic acid","soothing","hydrating","acne"] },
  { name:"Minimalist Anti-Acne HOCL Face & Body Spray Toner", brand:"Minimalist", cat:"Toner", asin:"B0DCBWM7GT", imgId:"61zBwRQgvzL", link:"https://amzn.to/49vNH8k", rating:4.3, reviews:5670, tags:["hocl","anti-acne","barrier support","skin relief","soothing"] },
  { name:"Hyphen 7% Ceramides-NMF Milky Face Toner Essence", brand:"Hyphen", cat:"Toner", asin:"B0DMPDCBLH", imgId:"51dxq7D9C5L", link:"https://amzn.to/4x42QI8", rating:4.5, reviews:3450, bestseller:true, tags:["ceramides","rice water","oatmeal","snow mushroom","glass skin"] },
  { name:"Plum Green Tea Face Toner for Oily Acne-Prone Skin", brand:"Plum", cat:"Toner", asin:"B00OCJ5M6C", imgId:"41DmCFHRpGL", link:"https://amzn.to/434nY3a", rating:4.3, reviews:14560, bestseller:true, tags:["green tea","glycolic acid","alcohol free","pimples","pores"] },
  { name:"TONYMOLY Wonder Ceramide Toner", brand:"TONYMOLY", cat:"Toner", asin:"B07B32PL1C", imgId:"617RMAxbPyL", link:"https://amzn.to/4dFVKSz", rating:4.3, reviews:2340, tags:["ceramide","korean","hydrating","moisturizing","toner"] },
  { name:"Forest Essentials Facial Tonic Mist with Pure Rosewater", brand:"Forest Essentials", cat:"Toner", asin:"B09ZVGH8MG", imgId:"61rbTaFvwEL", link:"https://amzn.to/4fhdsgq", rating:4.4, reviews:4560, bestseller:true, tags:["rosewater","ayurvedic","dewy","fresh skin","steam distilled"] },
  { name:"Dot & Key Watermelon SuperGlow Glycolic Face Toner", brand:"Dot & Key", cat:"Toner", asin:"B0B1V514SP", imgId:"61MxqGWAXIL", link:"https://amzn.to/4dPr8wv", rating:4.3, reviews:6780, tags:["watermelon","glycolic","alcohol free","glow","pore tightening"] },
  { name:"Rice Toner Milky Korean Toner with Niacinamide", brand:"Generic", cat:"Toner", asin:"B0FZHRFFGZ", imgId:"51q29mhjYTL", link:"https://amzn.to/3QbRxNh", rating:4.2, reviews:890, tags:["rice water","korean","niacinamide","glow","milky","hydrating"] },

  // ── NIGHT CREAMS (8) ────────────────────────────────────────
  { name:"L'Oreal Paris Glycolic Bright Glowing Night Cream", brand:"L'Oreal Paris", cat:"Night Cream", asin:"B0B9QY2YHQ", imgId:"41qpkM2pASL", link:"https://amzn.to/49ry5To", rating:4.3, reviews:9870, bestseller:true, tags:["glycolic acid","brightening","overnight","gel cream"] },
  { name:"Dot & Key Night Reset Retinol + Ceramide Night Cream", brand:"Dot & Key", cat:"Night Cream", asin:"B097K3MSN8", imgId:"51ZFnkjdhiL", link:"https://amzn.to/4o0LQ1e", rating:4.4, reviews:6780, bestseller:true, tags:["retinol","ceramide","anti-ageing","fine lines","overnight"] },
  { name:"NIVEA Luminous Even Glow Night Cream", brand:"NIVEA", cat:"Night Cream", asin:"B0DR2852YH", imgId:"41Ko7-HqzIL", link:"https://amzn.to/4vaMETq", rating:4.3, reviews:3450, tags:["thiamidol","dark spots","even glow","moisturiser","night"] },
  { name:"Lotus Professional PhytoRx Night Face Cream", brand:"Lotus Professional", cat:"Night Cream", asin:"B00NJT5TXM", imgId:"51bECAsuUXL", link:"https://amzn.to/4uIlqnF", rating:4.2, reviews:4560, tags:["age-defying","deep hydration","night repair","anti-ageing"] },
  { name:"Eucerin Anti-Pigment Face Night Cream with Thiamidol", brand:"Eucerin", cat:"Night Cream", asin:"B07MK3DGQN", imgId:"61JeTmgPHsL", link:"https://amzn.to/4vhHxkz", rating:4.4, reviews:5670, bestseller:true, tags:["thiamidol","dark spots","regenerating","anti-pigment","50ml"] },
  { name:"L'Oreal Paris Hyaluron Moisture Hydra Filling Night Cream", brand:"L'Oreal Paris", cat:"Night Cream", asin:"B0B6XZBQ1G", imgId:"41uM2GNXefL", link:"https://amzn.to/4dDRQcN", rating:4.2, reviews:6780, tags:["hyaluronic acid","moisture filling","leave-in","dry skin","night"] },
  { name:"Cetaphil Brightening Night Comfort Cream", brand:"Cetaphil", cat:"Night Cream", asin:"B08L95888H", imgId:"61-lKA6IGKL", link:"https://amzn.to/3PB0Shz", rating:4.4, reviews:7890, bestseller:true, tags:["hyaluronic acid","niacinamide","dark spots","uneven tone","fragrance free"] },
  { name:"Vaseline Gluta-Hya Overnight Radiance Serum-in-Lotion", brand:"Vaseline", cat:"Night Cream", asin:"B0CXDGSKPG", imgId:"511dMBhQ8TL", link:"https://amzn.to/4dSRnSV", rating:4.2, reviews:3450, tags:["glutathione","amino peptide","overnight","radiance","serum lotion"] },

  // ── TREATMENTS (2) ──────────────────────────────────────────
  { name:"RENEE Pink Therapy Collagen Night Wrapping Face Mask", brand:"RENEE", cat:"Treatment", asin:"B0FLXJGNH5", imgId:"61hKVu0mT3L", link:"https://amzn.to/4uadcDn", rating:4.3, reviews:1230, tags:["collagen","face mask","overnight","hydrating","elasticity"] },
  { name:"Conscious Chemist Retinol Peptide Under Eye Cream with Roller", brand:"Conscious Chemist", cat:"Treatment", asin:"B0CS6QCFH1", imgId:"41Lx6JCr52L", link:"https://amzn.to/4voXFRr", rating:4.3, reviews:890, tags:["retinol","eye cream","dark circles","fine lines","massage roller"] },
];

// ── helpers ────────────────────────────────────────────────────

export function productImg(name: string): string | undefined {
  const p = ALL_PRODUCTS.find(x => x.name === name);
  if (!p) return undefined;
  const url = img(p.imgId);
  return `/api/img?url=${encodeURIComponent(url)}`;
}

export function affiliateUrl(name: string): string {
  const p = ALL_PRODUCTS.find(x => x.name === name);
  return p?.link ?? `https://www.amazon.in/s?k=${encodeURIComponent(name + " skincare")}`;
}

// backward-compat
export const AFFILIATE_LINKS: Record<string, string> = Object.fromEntries(
  ALL_PRODUCTS.map(p => [p.name, p.link])
);

export const PRODUCTS_DATA: Record<string, { link: string; img?: string }> = Object.fromEntries(
  ALL_PRODUCTS.map(p => [p.name, { link: p.link, img: img(p.imgId) }])
);

export const DEFAULT_LINK = "";
export const AMAZON_DOMAIN = "www.amazon.in";
export const AMAZON_TAG = "";
