const CONFIG = {
  business: {
    name: "USF Luxury Cars",
    tagline: "Location de voitures à Tanger",
    description: "USF Luxury Cars est une agence de location de voitures basée à Tanger, offrant des véhicules fiables, propres et bien entretenus aux touristes et aux locaux. Nous nous concentrons sur la satisfaction client, la réservation rapide et des tarifs compétitifs.",
    whatsapp: "212617462173",
    whatsappMessage: "Bonjour USF Luxury Cars ! Je souhaite réserver une voiture.",
    email: "usf.luxuys@gmail.com",
    address: "Tanger, Maroc",
    hours: "Lun–Dim : 08h00 – 20h00",
    instagram: "usf.luxuys",
    facebook: "USF Luxury Cars",
    googleAnalyticsId: "G-XXXXXXXXXX" // Replace with real GA4 ID
  },

  // Cloudinary config — replace cloudName with your actual cloud name
  // imagePublicId from cars.json is passed to getImageUrl() in main.js
  cloudinary: {
    cloudName: "dut4finmu", // e.g. "usf-luxury-cars"
    defaultTransform: "f_auto,q_auto,w_800,c_fill,g_auto"
  },

  hero: {
    headline: "Conduisez en Classe",
    headlineSub: "à Tanger",
    subheadline: "Location de voitures premium et économiques — disponibles 7j/7, livraison rapide, réservation via WhatsApp.",
    cta: "Réserver Maintenant",
    ctaSub: "Réponse en moins de 30 minutes"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FALLBACK FLEET — used only when /data/cars.json is unreachable (criterion 13)
  // In production the fleet is served from /data/cars.json via GitHub Action.
  // Keep this list in sync with Google Sheets initial data.
  // ─────────────────────────────────────────────────────────────────────────
  fleet: [
    {
      id: "economy-1",
      category: "Économique",
      name: "Dacia Logan / Similaire",
      price: "250",
      unit: "MAD/jour",
      features: ["Climatisation", "Kilométrage illimité", "Assurance incluse", "Idéal ville & route"],
      badge: "Populaire",
      // Fallback uses local images; production uses imagePublicId via Cloudinary
      image: "images/car-economy-1.webp",
      imagePublicId: null,
      imageAlt: "Voiture économique disponible à la location à Tanger",
      active: true
    },
    {
      id: "economy-2",
      category: "Économique",
      name: "Renault Clio / Similaire",
      price: "300",
      unit: "MAD/jour",
      features: ["Climatisation", "Bluetooth", "Faible consommation", "Compact & maniable"],
      badge: null,
      image: "images/car-economy-2.webp",
      imagePublicId: null,
      imageAlt: "Citadine compacte à louer à Tanger",
      active: true
    },
    {
      id: "suv-1",
      category: "SUV",
      name: "Duster / Similaire",
      price: "400",
      unit: "MAD/jour",
      features: ["7 places disponible", "Grand coffre", "Idéal famille", "Tout-terrain"],
      badge: "Famille",
      image: "images/car-suv-1.webp",
      imagePublicId: null,
      imageAlt: "SUV spacieux à louer pour famille à Tanger",
      active: true
    },
    {
      id: "suv-2",
      category: "SUV",
      name: "Hyundai Tucson / Similaire",
      price: "550",
      unit: "MAD/jour",
      features: ["Confort premium", "GPS intégré", "Caméra recul", "Toit panoramique"],
      badge: null,
      image: "images/car-suv-2.webp",
      imagePublicId: null,
      imageAlt: "SUV premium Hyundai à louer à Tanger",
      active: true
    },
    {
      id: "luxury-1",
      category: "Luxe",
      name: "Mercedes Classe C / Similaire",
      price: "900",
      unit: "MAD/jour",
      features: ["Finition cuir", "Système audio haut de gamme", "Confort maximal", "Prestige garanti"],
      badge: "Premium",
      image: "images/car-luxury-1.webp",
      imagePublicId: null,
      imageAlt: "Mercedes de luxe à louer à Tanger",
      active: true
    },
    {
      id: "luxury-2",
      category: "Luxe",
      name: "BMW Série 3 / Similaire",
      price: "1100",
      unit: "MAD/jour",
      features: ["Sportivité & élégance", "Toit ouvrant", "Navigation avancée", "Expérience unique"],
      badge: "VIP",
      image: "images/car-luxury-2.webp",
      imagePublicId: null,
      imageAlt: "BMW série 3 disponible à la location à Tanger",
      active: true
    }
  ],

  whyUs: [
    {
      icon: "shield-check",
      title: "Véhicules Vérifiés",
      desc: "Chaque voiture est rigoureusement inspectée, nettoyée et assurée avant chaque location."
    },
    {
      icon: "clock",
      title: "Disponible 7j/7",
      desc: "Nous sommes joignables tous les jours de 8h à 20h, y compris les jours fériés."
    },
    {
      icon: "whatsapp",
      title: "Réservation Express",
      desc: "Réservez en quelques messages sur WhatsApp. Réponse garantie en moins de 30 minutes."
    },
    {
      icon: "map-pin",
      title: "Livraison à Tanger",
      desc: "Livraison et récupération à votre hôtel, appartement ou à l'aéroport Ibn Batouta."
    },
    {
      icon: "tag",
      title: "Tarifs Transparents",
      desc: "Aucuns frais cachés. Le prix affiché est le prix final — assurance incluse."
    },
    {
      icon: "star",
      title: "Service 5 Étoiles",
      desc: "Des dizaines de clients satisfaits. La satisfaction de nos clients est notre priorité absolue."
    }
  ],

  process: [
    {
      step: "01",
      title: "Choisissez votre voiture",
      desc: "Parcourez notre flotte et sélectionnez le véhicule qui correspond à vos besoins et votre budget."
    },
    {
      step: "02",
      title: "Contactez-nous sur WhatsApp",
      desc: "Envoyez-nous un message avec vos dates, lieu de prise en charge et le véhicule souhaité."
    },
    {
      step: "03",
      title: "Confirmation rapide",
      desc: "Nous confirmons la disponibilité et vous envoyons tous les détails en moins de 30 minutes."
    },
    {
      step: "04",
      title: "Profitez de votre trajet",
      desc: "Récupérez votre voiture propre et prête. Conduisez l'esprit tranquille avec notre assurance incluse."
    }
  ],

  testimonials: [
    {
      text: "Service exceptionnel et voitures impeccables. La réservation via WhatsApp était ultra rapide. Je reviendrai sans hésiter !",
      author: "Ahmed R.",
      location: "Tanger, Maroc"
    },
    {
      text: "Très professionnel et réactif sur WhatsApp. La voiture était propre, bien entretenue. Parfait pour notre séjour à Tanger.",
      author: "Sarah L.",
      location: "Paris, France"
    },
    {
      text: "Excellent rapport qualité-prix. Livraison à l'aéroport à l'heure. Je recommande vivement USF Luxury Cars.",
      author: "Youssef M.",
      location: "Casablanca, Maroc"
    }
  ],

  faq: [
    {
      q: "Quels documents sont nécessaires pour louer une voiture ?",
      a: "Un permis de conduire valide, une pièce d'identité nationale ou passeport, et un acompte (en espèces ou virement). C'est tout — pas de paperasse excessive."
    },
    {
      q: "Proposez-vous la livraison à l'aéroport Ibn Batouta ?",
      a: "Oui, nous livrons et récupérons votre véhicule directement à l'aéroport Ibn Batouta de Tanger, sans frais supplémentaires selon les conditions convenues."
    },
    {
      q: "L'assurance est-elle incluse dans le tarif ?",
      a: "Oui, l'assurance de base est incluse dans tous nos tarifs. Des options complémentaires sont disponibles selon vos besoins."
    },
    {
      q: "Puis-je louer pour une seule journée ?",
      a: "Absolument. Nous proposons des locations à la journée, au week-end, à la semaine ou au mois avec des tarifs dégressifs."
    },
    {
      q: "Comment effectuer une réservation ?",
      a: "Contactez-nous directement via WhatsApp au +212 617 462 173. Indiquez vos dates, le type de véhicule souhaité et le lieu de prise en charge. Nous confirmons sous 30 minutes."
    },
    {
      q: "Puis-je voyager en dehors de Tanger ?",
      a: "Oui, nos véhicules peuvent être utilisés sur tout le territoire marocain. Indiquez-le lors de votre demande pour que nous puissions adapter les conditions."
    }
  ],

  contact: {
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102979.9!2d-5.8326!3d35.7595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0b875cf0e3c32d%3A0x8e4c25f4c2dc4d6a!2sTanger!5e0!3m2!1sfr!2sma!4v1"
  }
};