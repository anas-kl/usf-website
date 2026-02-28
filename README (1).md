# USF Luxury Cars — Site Web

## Comment mettre à jour le contenu

**IMPORTANT : Toutes les modifications se font uniquement dans `js/config.js`.**
Ne modifiez jamais `index.html` ou `js/main.js` pour du contenu.

---

## 📁 Structure des fichiers

```
usf-luxury-cars/
├── index.html          ← structure HTML (ne pas modifier)
├── css/
│   └── style.css       ← design (ne modifier que si nécessaire)
├── js/
│   ├── config.js       ← ✅ TOUT LE CONTENU EST ICI
│   └── main.js         ← logique (ne pas modifier)
└── images/             ← ajouter vos photos ici (.webp recommandé)
```

---

## ✏️ Modifications courantes

### Changer le numéro WhatsApp
Dans `config.js`, ligne `whatsapp`:
```js
whatsapp: "212XXXXXXXXX",  // format international sans le +
```

### Changer l'email
```js
email: "votre@email.com",
```

### Ajouter/modifier une voiture
Dans le tableau `fleet`, copiez un bloc existant :
```js
{
  id: "nouveau-id",          // identifiant unique
  category: "Économique",    // Économique | SUV | Luxe
  name: "Nom voiture",
  price: "300",
  unit: "MAD/jour",
  features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  badge: null,               // ou "Nouveau", "Populaire", etc.
  image: "images/ma-voiture.webp",
  imageAlt: "Description de la voiture pour accessibilité"
},
```

### Ajouter des photos de voitures
1. Convertir vos photos en `.webp` (utilisez https://squoosh.app)
2. Nommer le fichier (ex: `car-suv-3.webp`)
3. Copier dans le dossier `images/`
4. Mettre à jour le champ `image` dans `config.js`

### Changer les horaires
```js
hours: "Lun–Dim : 08h00 – 20h00",
```

### Activer Google Analytics
1. Remplacer `G-XXXXXXXXXX` dans `config.js` et dans `index.html`
2. Décommenter le bloc GA4 dans `index.html`

### Modifier Google Maps
Obtenir un lien embed depuis Google Maps → Partager → Intégrer une carte → copier l'URL `src`
```js
mapEmbed: "https://www.google.com/maps/embed?pb=..."
```

---

## 🚀 Déploiement sur GitHub Pages

1. Créer un repository sur GitHub
2. Uploader tous les fichiers
3. Settings → Pages → Source: Deploy from branch → main → /root
4. URL: `https://votre-username.github.io/usf-luxury-cars`

---

## 📱 Test mobile

Ouvrir `index.html` directement dans Chrome, puis F12 → mode mobile.

---

*Site créé par Web Presence Service*
