#!/usr/bin/env python3
"""
Script om handgeschreven nummers uit schilderijenafbeeldingen te extraheren met OCR
en deze als caption toe te voegen aan Cloudinary resources.
Inclusief ondersteuning voor HEIC bestandsformaat.

Vereisten:
- Python 3.7+
- pip install cloudinary pytesseract pillow requests numpy opencv-python-headless pyheif pillow-heif
- Tesseract OCR moet geïnstalleerd zijn op het systeem
  - Ubuntu/Debian: sudo apt-get install tesseract-ocr libheif-dev
  - macOS: brew install tesseract libheif
  - Windows: Download en installeer van https://github.com/UB-Mannheim/tesseract/wiki
"""

import os
import re
import io
import sys
import time
import requests
import cloudinary
import cloudinary.api
import cloudinary.uploader
from PIL import Image, UnidentifiedImageError
import numpy as np
import cv2
import pytesseract
from pathlib import Path
import argparse
import logging

# Configuratie logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("cloudinary_ocr.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("cloudinary_ocr")

# Probeer de HEIF/HEIC ondersteuning te laden
try:
    import pyheif
    has_pyheif = True
    logger.info("pyheif bibliotheek succesvol geladen voor HEIC ondersteuning")
except ImportError:
    has_pyheif = False
    logger.warning("pyheif bibliotheek niet gevonden. HEIC-bestanden worden mogelijk niet ondersteund.")
    logger.warning("Installeer het met: pip install pyheif")

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
    has_pillow_heif = True
    logger.info("pillow_heif bibliotheek succesvol geladen voor HEIC ondersteuning")
except ImportError:
    has_pillow_heif = False
    if not has_pyheif:
        logger.warning("pillow_heif bibliotheek niet gevonden. HEIC-bestanden worden mogelijk niet ondersteund.")
        logger.warning("Installeer het met: pip install pillow-heif")

def setup_cloudinary():
    """Configureer Cloudinary met credentials uit omgevingsvariabelen of .env bestand."""
    try:
        from dotenv import load_dotenv
        load_dotenv()  # .env file laden indien aanwezig
    except ImportError:
        logger.warning("python-dotenv niet geïnstalleerd. Omgevingsvariabelen moeten handmatig ingesteld zijn.")

    # Configureer Cloudinary met omgevingsvariabelen
    cloudinary.config(
        cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
        api_key=os.environ.get("CLOUDINARY_API_KEY"),
        api_secret=os.environ.get("CLOUDINARY_API_SECRET")
    )

    # Controleer of de configuratie volledig is
    if not all([cloudinary.config().cloud_name, cloudinary.config().api_key, cloudinary.config().api_secret]):
        logger.error("Cloudinary configuratie ontbreekt. Stel de CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY en CLOUDINARY_API_SECRET omgevingsvariabelen in.")
        sys.exit(1)

    logger.info(f"Cloudinary geconfigureerd voor cloud: {cloudinary.config().cloud_name}")

def read_heic_image(content):
    """
    Leest HEIC afbeeldingsgegevens en converteert naar PIL Image.

    Args:
        content: Binaire inhoud van de HEIC afbeelding

    Returns:
        PIL Image object of None bij fout
    """
    # Probeer eerst pillow_heif als het beschikbaar is
    if has_pillow_heif:
        try:
            logger.debug("HEIC afbeelding laden met pillow_heif")
            with io.BytesIO(content) as f:
                return Image.open(f)
        except Exception as e:
            logger.warning(f"Fout bij het laden van HEIC met pillow_heif: {e}")

    # Probeer pyheif als het beschikbaar is
    if has_pyheif:
        try:
            logger.debug("HEIC afbeelding laden met pyheif")
            heif_file = pyheif.read(content)
            image = Image.frombytes(
                heif_file.mode,
                heif_file.size,
                heif_file.data,
                "raw",
                heif_file.mode,
                heif_file.stride,
            )
            return image
        except Exception as e:
            logger.warning(f"Fout bij het laden van HEIC met pyheif: {e}")

    logger.error("Kan HEIC afbeelding niet laden. Geen werkende HEIC bibliotheek gevonden.")
    return None

def download_image(url):
    """Download een afbeelding van een URL en geef deze terug als een PIL Image object."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        content = response.content

        # Debug informatie
        content_type = response.headers.get('Content-Type', 'Niet beschikbaar')
        logger.debug(f"Content-Type header: {content_type}")
        logger.debug(f"Content lengte: {len(content)} bytes")

        # Controleer of het een HEIC afbeelding is
        is_heic = content_type.lower() in ['image/heic', 'image/heif'] or url.lower().endswith(('.heic', '.heif'))

        if is_heic:
            logger.info("HEIC afbeeldingsformaat gedetecteerd")
            image = read_heic_image(content)
            if image:
                return image
            # Als het niet lukt met specifieke HEIC handlers, ga door naar algemene methoden

        # Probeer de afbeelding te openen met PIL
        try:
            image = Image.open(io.BytesIO(content))
            # Controleer of de afbeelding geldig is door er een operatie op uit te voeren
            image.verify()  # Dit sluit het bestand

            # Heropen na verify
            image = Image.open(io.BytesIO(content))
            logger.debug(f"Afbeelding succesvol geladen: {image.format} {image.size}")
            return image
        except UnidentifiedImageError as e:
            logger.error(f"Kan bestandsformaat niet identificeren: {e}")

            # Als het een HEIC is en we hebben het nog niet geprobeerd met de HEIC handlers
            if not is_heic and (url.lower().endswith(('.heic', '.heif')) or b'ftypheic' in content[:100]):
                logger.info("Probeer HEIC formaat te detecteren op basis van inhoud")
                image = read_heic_image(content)
                if image:
                    return image

            # Probeer als alternatief om het bestand op te slaan en met OpenCV te openen
            try:
                temp_path = "temp_image.jpg"
                with open(temp_path, 'wb') as f:
                    f.write(content)

                cv_image = cv2.imread(temp_path)
                if cv_image is not None:
                    # Converteer OpenCV naar PIL
                    cv_image_rgb = cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB)
                    pil_image = Image.fromarray(cv_image_rgb)
                    logger.info(f"Afbeelding succesvol geladen via OpenCV: {pil_image.size}")

                    # Verwijder tijdelijk bestand
                    os.remove(temp_path)
                    return pil_image
                else:
                    logger.error("OpenCV kon de afbeelding niet laden")
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                    return None
            except Exception as cv_error:
                logger.error(f"Fout bij alternatieve laadmethode: {cv_error}")
                if os.path.exists("temp_image.jpg"):
                    os.remove("temp_image.jpg")
                return None
        except Exception as e:
            logger.error(f"Algemene fout bij openen afbeelding: {e}")
            return None
    except Exception as e:
        logger.error(f"Fout bij downloaden van afbeelding: {e}")
        return None

def preprocess_image_for_ocr(image, crop_percentage=0.15):
    """
    Voorbewerkt de afbeelding voor OCR door te focussen op het label gebied.

    Args:
        image: PIL Image object
        crop_percentage: Percentage van de afbeelding (vanaf onderkant) om te analyseren

    Returns:
        Een voor OCR geoptimaliseerde numpy array afbeelding
    """
    try:
        # Controleer of afbeelding geldig is
        if image is None:
            logger.error("Ongeldige afbeelding voor voorverwerking")
            return None

        # Converteer PIL naar OpenCV formaat
        img_array = np.array(image)

        # Controleer of de array geldig is
        if img_array.size == 0:
            logger.error("Lege afbeeldingsarray")
            return None

        # Converteer kleurruimte indien nodig
        if len(img_array.shape) == 3 and img_array.shape[2] == 3:
            img = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        elif len(img_array.shape) == 2:
            # Grijswaarden afbeelding, geen conversie nodig
            img = img_array
        else:
            logger.warning(f"Onverwacht afbeeldingsformaat met vorm {img_array.shape}, probeer toch door te gaan")
            img = img_array

        # Haal vorm op, met foutafhandeling
        if hasattr(img, 'shape') and len(img.shape) >= 2:
            height, width = img.shape[:2]
        else:
            logger.error("Kan afbeeldingsdimensies niet bepalen")
            return None

        # Crop de afbeelding om alleen het onderste gedeelte te behouden waar het label waarschijnlijk is
        crop_height = max(1, int(height * crop_percentage))  # Tenminste 1 pixel
        cropped_img = img[max(0, height - crop_height):height, 0:width]

        # Controleer of gecropte afbeelding geldig is
        if cropped_img.size == 0:
            logger.error("Lege gecropte afbeelding")
            return None

        # Converteer naar grijswaarden als dat nog niet is gebeurd
        if len(cropped_img.shape) == 3:
            gray = cv2.cvtColor(cropped_img, cv2.COLOR_BGR2GRAY)
        else:
            gray = cropped_img

        # Verbeter het contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # Ruis verminderen
        denoised = cv2.fastNlMeansDenoising(enhanced, None, 10, 7, 21)

        # Binarisatie met adaptieve drempelwaarde
        binary = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                      cv2.THRESH_BINARY_INV, 11, 2)

        # Dilatatie en erosie om tekst te verbeteren
        kernel = np.ones((1, 1), np.uint8)
        dilated = cv2.dilate(binary, kernel, iterations=1)
        eroded = cv2.erode(dilated, kernel, iterations=1)

        # Sla voorbewerkte afbeelding op voor debugging (optioneel)
        # cv2.imwrite("preprocessed.png", eroded)

        return eroded
    except Exception as e:
        logger.error(f"Fout tijdens voorverwerking van afbeelding: {e}")
        return None

def extract_number_from_image(image):
    """
    Extraheert een nummer uit de afbeelding met OCR.

    Args:
        image: PIL Image object

    Returns:
        Geëxtraheerd nummer als string, of None als er niets gevonden is
    """
    if image is None:
        return None

    # Voorverwerk de afbeelding
    processed_img = preprocess_image_for_ocr(image)

    if processed_img is None:
        logger.error("Voorverwerking van afbeelding mislukt")
        return None

    # OCR configuratie voor getallen
    custom_config = r'--oem 3 --psm 7 -c tessedit_char_whitelist=0123456789'

    # OCR uitvoeren met pytesseract
    try:
        # Eerst probeer getallen te extraheren
        text = pytesseract.image_to_string(processed_img, config=custom_config).strip()

        # Als dat niet werkt, probeer algemene tekst extractie
        if not text:
            text = pytesseract.image_to_string(processed_img).strip()

        # Zoek alleen naar nummers in de geëxtraheerde tekst
        numbers = re.findall(r'\d+', text)

        if numbers:
            # Neem het langste gevonden nummer
            return max(numbers, key=len)
        else:
            logger.warning("Geen nummer gevonden in de OCR-tekst")
            return None
    except Exception as e:
        logger.error(f"OCR fout: {e}")
        return None

def get_all_paintings():
    """Haalt alle schilderijen op uit de 'Tom van As Kunst' map in Cloudinary."""
    try:
        # Eerst alle submappen ophalen
        folders_result = cloudinary.api.subfolders("Tom van As Kunst")
        folders = folders_result.get('folders', [])

        all_paintings = []

        # Voor elke submap, haal de resources op
        for folder in folders:
            folder_path = folder['path']
            logger.info(f"Resources ophalen uit map: {folder_path}")

            try:
                result = cloudinary.api.resources_by_asset_folder(
                    folder_path,
                    type="upload",
                    max_results=500,
                    context=True
                )

                resources = result.get('resources', [])
                logger.info(f"Aantal resources gevonden in {folder_path}: {len(resources)}")

                for resource in resources:
                    all_paintings.append(resource)
            except Exception as e:
                logger.error(f"Fout bij ophalen van resources in map {folder_path}: {e}")

        logger.info(f"Totaal aantal schilderijen opgehaald: {len(all_paintings)}")
        return all_paintings

    except Exception as e:
        logger.error(f"Fout bij ophalen van mappen of resources: {e}")
        return []

def update_caption(public_id, caption):
    """Update de caption (context) van een Cloudinary resource."""
    try:
        result = cloudinary.uploader.explicit(
            public_id,
            type="upload",
            context=f"caption={caption}"
        )
        logger.info(f"Caption bijgewerkt voor {public_id}: {caption}")
        return True
    except Exception as e:
        logger.error(f"Fout bij bijwerken caption voor {public_id}: {e}")
        return False

def process_paintings(dry_run=False, force_update=False):
    """
    Verwerk alle schilderijen, haal nummers op en update captions.

    Args:
        dry_run: Als True, worden geen wijzigingen aangebracht in Cloudinary
        force_update: Als True, worden alle captions bijgewerkt, ook als ze al bestaan
    """
    paintings = get_all_paintings()

    if not paintings:
        logger.error("Geen schilderijen gevonden om te verwerken.")
        return

    logger.info(f"Start verwerking van {len(paintings)} schilderijen...")

    processed_count = 0
    updated_count = 0
    error_count = 0
    skipped_count = 0

    for painting in paintings:
        public_id = painting.get('public_id')
        current_caption = None

        # Controleer of er al een caption bestaat
        if 'context' in painting and painting['context'] and 'custom' in painting['context']:
            current_caption = painting['context']['custom'].get('caption')

        # Sla over als er al een caption is en force_update niet is ingeschakeld
        if current_caption and not force_update:
            logger.info(f"Overgeslagen {public_id}: heeft al caption '{current_caption}'")
            skipped_count += 1
            continue

        logger.info(f"Verwerken van schilderij: {public_id}")

        # Download de afbeelding
        image_url = painting.get('secure_url')
        logger.info(f"Downloaden van afbeelding: {image_url}")
        image = download_image(image_url)

        if image:
            # Extraheer nummer met OCR
            number = extract_number_from_image(image)

            if number:
                logger.info(f"Gevonden nummer voor {public_id}: {number}")

                if dry_run:
                    logger.info(f"DRY RUN: Zou caption bijwerken voor {public_id} naar: {number}")
                    updated_count += 1
                else:
                    # Update caption in Cloudinary
                    if update_caption(public_id, number):
                        updated_count += 1
                    else:
                        error_count += 1
            else:
                logger.warning(f"Geen nummer gevonden voor {public_id}")
                error_count += 1
        else:
            logger.error(f"Kon afbeelding niet downloaden voor {public_id}")
            error_count += 1

        processed_count += 1

        # Wacht even om API rate limits te respecteren
        time.sleep(0.5)

    logger.info(f"Verwerking voltooid. Totaal verwerkt: {processed_count}, Bijgewerkt: {updated_count}, Fouten: {error_count}, Overgeslagen: {skipped_count}")

def main():
    """Hoofdfunctie voor het script."""
    parser = argparse.ArgumentParser(description="Extract handwritten numbers from paintings and update Cloudinary captions")
    parser.add_argument("--dry-run", action="store_true", help="Voer een proefbewerking uit zonder wijzigingen aan te brengen")
    parser.add_argument("--force", action="store_true", help="Update alle captions, ook als ze al bestaan")
    parser.add_argument("--debug", action="store_true", help="Toon debug informatie")
    args = parser.parse_args()

    # Stel debug niveau in als flag aanwezig is
    if args.debug:
        logger.setLevel(logging.DEBUG)
        logger.debug("Debug logging ingeschakeld")

    logger.info("Start OCR script voor handgeschreven nummers in schilderijen")

    # Configureer Cloudinary
    setup_cloudinary()

    # Controleer of Tesseract geïnstalleerd is
    try:
        pytesseract.get_tesseract_version()
    except pytesseract.TesseractNotFoundError:
        logger.error("Tesseract OCR niet gevonden. Installeer Tesseract OCR op je systeem.")
        sys.exit(1)

    # Verwerk schilderijen
    process_paintings(dry_run=args.dry_run, force_update=args.force)

    logger.info("Script voltooid")

if __name__ == "__main__":
    main()
