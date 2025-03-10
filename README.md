# Tom van As - Kunstgalerie

Een online galerij voor de kunstwerken van Tom van As, gebouwd met Nuxt 3, Tailwind CSS en Cloudinary.

## Functionaliteiten

- Responsive design voor alle schermformaten
- Homepagina met uitgelichte werken
- Overzichtspagina met zoeken en filteren
- Detailpagina per kunstwerk
- Informatiepagina over de kunstenaar
- Integratie met Cloudinary voor afbeeldingsbeheer

## Technische stack

- [Nuxt 3](https://nuxt.com/) - Vue.js framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Cloudinary](https://cloudinary.com/) - Cloud-based afbeeldingsbeheer

## Aan de slag

### Vereisten

- Node.js 16.x of hoger
- Cloudinary account

### Installatie

1. Clone de repository:

   ```bash
   git clone https://github.com/jouw-gebruikersnaam/tom-van-as-gallery.git
   cd tom-van-as-gallery
   ```

2. Installeer de dependencies:

   ```bash
   npm install
   ```

3. Maak een `.env` bestand aan in de hoofdmap van het project en vul je Cloudinary gegevens in:

   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Start de ontwikkelingsserver:

   ```bash
   npm run dev
   ```

5. Open in je browser: `http://localhost:3000`

### Afbeeldingen voorbereiden in Cloudinary

Om de galerij correct te laten werken, moet je afbeeldingen in Cloudinary als volgt taggen:

- `title:Naam van het schilderij` - Vereist voor elk schilderij (anders wordt het niet weergegeven)
- `category:Landschap` - Optionele categorieën (meerdere mogelijk)
- `tags zonder prefix` - Reguliere tags voor extra filtering

### Productie build

```bash
npm run build
```

De productie build komt in de `.output` directory.

## Project structuur

- `app.vue` - Hoofdapplicatie component
- `components/` - Vue componenten
- `composables/` - Composables zoals useCloudinary
- `layouts/` - Pagina layouts
- `pages/` - Applicatie pagina's
- `public/` - Statische bestanden
- `server/api/` - Server API endpoints
- `assets/` - Assets zoals CSS

## Licentie

Dit project is bedoeld voor Tom van As en wordt niet publiek gedeeld.
