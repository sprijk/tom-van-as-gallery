# Handleiding OCR-script voor Nummerdetectie

Dit script extraheert automatisch handgeschreven nummers uit afbeeldingen van schilderijen in Cloudinary en voegt deze nummers toe als caption aan de afbeeldingen.

## Vereisten

1. Python 3.7 of hoger
2. Tesseract OCR moet geïnstalleerd zijn op het systeem
3. De benodigde Python packages (zie requirements.txt)

## Installatie

### 1. Installeer Tesseract OCR

#### Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

#### macOS (met Homebrew):

```bash
brew install tesseract
```

#### Windows:

Download en installeer Tesseract van de [UB Mannheim GitHub pagina](https://github.com/UB-Mannheim/tesseract/wiki)

### 2. Installeer Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Configureer Cloudinary credentials

Stel de volgende omgevingsvariabelen in of maak een `.env` bestand in dezelfde map als het script met deze inhoud:

```
CLOUDINARY_CLOUD_NAME=jouw_cloud_naam
CLOUDINARY_API_KEY=jouw_api_key
CLOUDINARY_API_SECRET=jouw_api_secret
```

## Gebruik

### Basisgebruik

```bash
python extract_numbers_and_update_captions.py
```

### Opties

- `--dry-run`: Voer het script uit zonder daadwerkelijk wijzigingen aan te brengen in Cloudinary (voor testen)
- `--force`: Update alle captions, ook als er al een caption bestaat

Voorbeeld met opties:

```bash
python extract_numbers_and_update_captions.py --dry-run
```

## Werking van het script

1. Het script haalt alle afbeeldingen op uit de 'Tom van As Kunst' map in Cloudinary en zijn submappen
2. Voor elke afbeelding:
   - Downloadt het script de afbeelding
   - Focust op het onderste deel (15%) van de afbeelding waar het label waarschijnlijk is
   - Voert beeldverwerking uit om het nummer duidelijker te maken (contrast verhogen, ruis verminderen)
   - Voert OCR uit met Tesseract, specifiek geoptimaliseerd voor getallen
   - Extraheert de gevonden getallen
3. Als er een nummer is gevonden, wordt dit toegevoegd als caption aan de Cloudinary resource

## Logboeken

Het script maakt een logbestand aan (`cloudinary_ocr.log`) waarin alle uitgevoerde acties worden vastgelegd. Raadpleeg dit bestand voor gedetailleerde informatie over de uitvoering en eventuele fouten.

## Probleemoplossing

### Geen nummer gedetecteerd

Als het script geen nummers detecteert in bepaalde afbeeldingen:

1. Controleer of de afbeelding inderdaad een nummer bevat
2. Pas de `crop_percentage` parameter aan in de `preprocess_image_for_ocr` functie (standaard 15%)
3. Overweeg om de voorverwerking aan te passen voor afbeeldingen met laag contrast of onduidelijke nummers

### API-beperkingen

Het script houdt rekening met Cloudinary API-limieten door korte pauzes in te lassen. Als je toch problemen ondervindt met API-beperkingen, verhoog de wachttijd in de `time.sleep()` functie in de `process_paintings` functie.
