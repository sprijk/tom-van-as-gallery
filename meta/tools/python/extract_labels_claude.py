#!/usr/bin/env python
# coding: utf-8

import os
import sys
import json
import argparse
import requests
import time
import base64
from io import BytesIO
from PIL import Image
import cloudinary
import cloudinary.api
import cloudinary.uploader
from dotenv import load_dotenv

def setup_cloudinary():
    """Configureer Cloudinary met de omgevingsvariabelen."""
    load_dotenv()

    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME')
    api_key = os.getenv('CLOUDINARY_API_KEY')
    api_secret = os.getenv('CLOUDINARY_API_SECRET')

    if not all([cloud_name, api_key, api_secret]):
        print("Fout: Een of meer Cloudinary omgevingsvariabelen ontbreken.")
        print("Zorg ervoor dat CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY en CLOUDINARY_API_SECRET zijn ingesteld.")
        sys.exit(1)

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret
    )

def check_anthropic_api_key():
    """Controleer of de Anthropic API key is ingesteld."""
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        print("Fout: ANTHROPIC_API_KEY omgevingsvariabele ontbreekt.")
        print("Stel de ANTHROPIC_API_KEY in in je .env bestand.")
        sys.exit(1)
    return api_key

def crop_top_area(image, percentage=30):
    """
    Snijd alleen het bovenste deel van de afbeelding bij om op het label te focussen.

    Args:
        image: PIL Image object
        percentage: Percentage van de hoogte van de afbeelding dat geknipt moet worden

    Returns:
        Gecropte PIL Image
    """
    width, height = image.size
    top_height = int(height * percentage / 100)
    return image.crop((0, 0, width, top_height))

def encode_image_base64(image):
    """
    Converteert een PIL Image naar een base64 string voor gebruik in de API.

    Args:
        image: PIL Image object

    Returns:
        base64 encoded string van de afbeelding
    """
    buffered = BytesIO()
    image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return img_str

def analyze_image_with_claude(image, api_key):
    """
    Gebruik Claude API om een afbeelding te analyseren en het labelnummer te extraheren.

    Args:
        image: PIL Image object
        api_key: Anthropic API sleutel

    Returns:
        Het gedetecteerde labelnummer of None
    """
    # Crop het bovenste deel van de afbeelding
    cropped_image = crop_top_area(image)

    # Converteer naar base64
    base64_image = encode_image_base64(cropped_image)

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }

    data = {
        "model": "claude-3-opus-20240229",
        "max_tokens": 1000,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": base64_image
                        }
                    },
                    {
                        "type": "text",
                        "text": "Zoek en identificeer een labelnummer in deze afbeelding. "
                               "Het label is waarschijnlijk een klein wit kaartje met een zwart handgeschreven nummer. "
                               "Geef alleen het nummer terug (bijv. '123'). Als je geen label of nummer kunt vinden, "
                               "zeg dan 'Geen label gevonden'."
                    }
                ]
            }
        ]
    }

    try:
        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=data
        )

        if response.status_code != 200:
            print(f"Fout bij API aanroep: {response.status_code} {response.text}")
            return None

        result = response.json()
        response_text = result["content"][0]["text"]

        # Eenvoudige parsing van het antwoord
        if "geen label gevonden" in response_text.lower():
            return None

        # Extract nummer met regex
        import re
        numbers = re.findall(r'\d+', response_text)
        if numbers:
            return numbers[0]

        return None
    except Exception as e:
        print(f"Fout bij het aanroepen van Claude API: {str(e)}")
        return None

def get_existing_label_number(public_id):
    """
    Haal een bestaand labelnummer op uit Cloudinary metadata.

    Args:
        public_id: Cloudinary public_id van de afbeelding

    Returns:
        Het bestaande labelnummer als string of None als het niet bestaat
    """
    try:
        resource = cloudinary.api.resource(public_id, context=True)
        context = resource.get('context', {})

        # Check voor custom context
        if 'custom' in context and 'label_number' in context['custom']:
            label_number = context['custom']['label_number']
            return label_number

        return None
    except Exception as e:
        print(f"Fout bij ophalen van metadata voor {public_id}: {str(e)}")
        return None

def load_previous_results(output_file):
    """
    Laad resultaten van eerdere runs uit een JSON-bestand.

    Args:
        output_file: Pad naar het JSON-bestand

    Returns:
        Dictionary met public_ids als sleutels en labelnummers als waarden
    """
    previous_results = {}

    if os.path.exists(output_file):
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                results = json.load(f)
                for result in results:
                    if result.get('success') and result.get('label_number'):
                        previous_results[result['public_id']] = result['label_number']
            print(f"Geladen resultaten uit vorige run: {len(previous_results)} items")
        except Exception as e:
            print(f"Fout bij laden van vorige resultaten: {str(e)}")

    return previous_results

def process_image(image_url, public_id, api_key, previous_results):
    """
    Verwerk een enkele afbeelding met Claude, tenzij deze al succesvol verwerkt is.

    Args:
        image_url: URL van de afbeelding
        public_id: Cloudinary public_id van de afbeelding
        api_key: Anthropic API sleutel
        previous_results: Dictionary met eerder gevonden labelnummers

    Returns:
        Dict met resultaten
    """
    try:
        print(f"Verwerken van afbeelding: {public_id}")

        # Controleer of we al een eerder resultaat hebben
        if public_id in previous_results:
            label_number = previous_results[public_id]
            print(f"Gebruikt eerder geïdentificeerd label: {label_number}")
            return {
                "public_id": public_id,
                "label_number": label_number,
                "success": True,
                "source": "previous_run"
            }

        # Controleer of er al een labelnummer in Cloudinary staat
        existing_label = get_existing_label_number(public_id)
        if existing_label:
            print(f"Gebruikt bestaand label uit Cloudinary: {existing_label}")
            return {
                "public_id": public_id,
                "label_number": existing_label,
                "success": True,
                "source": "cloudinary_metadata"
            }

        # Download de afbeelding en gebruik Claude om het label te analyseren
        response = requests.get(image_url)
        img = Image.open(BytesIO(response.content))
        label_number = analyze_image_with_claude(img, api_key)

        success = label_number is not None
        if success:
            print(f"Label nummer gevonden: {label_number}")
        else:
            print("Geen label nummer gevonden")

        # Even wachten tussen API calls om rate limits te respecteren
        time.sleep(1)

        return {
            "public_id": public_id,
            "label_number": label_number,
            "success": success,
            "source": "claude_api"
        }
    except Exception as e:
        print(f"Fout bij verwerken van afbeelding {public_id}: {str(e)}")
        return {
            "public_id": public_id,
            "label_number": None,
            "success": False,
            "error": str(e),
            "source": "error"
        }

def process_folder(folder_path, api_key, previous_results, limit=None):
    """
    Verwerk alle afbeeldingen in een specifieke folder.

    Args:
        folder_path: Pad naar de Cloudinary folder
        api_key: Anthropic API sleutel
        previous_results: Dictionary met eerder gevonden labelnummers
        limit: Optionele limiet voor het aantal te verwerken afbeeldingen

    Returns:
        Lijst met resultaten per afbeelding
    """
    print(f"Verwerken van folder: {folder_path}")
    results = []

    try:
        # Haal alle resources op uit de folder
        response = cloudinary.api.resources_by_asset_folder(folder_path, max_results=500)

        # Beperk aantal verwerkte afbeeldingen indien nodig
        resources = response['resources']
        if limit:
            resources = resources[:limit]

        # Verwerk elke afbeelding
        for resource in resources:
            result = process_image(resource['secure_url'], resource['public_id'], api_key, previous_results)
            results.append(result)

        return results
    except Exception as e:
        print(f"Fout bij verwerken van folder {folder_path}: {str(e)}")
        return []

def process_all_folders(main_folder="Tom van As Kunst", api_key=None, previous_results=None, limit_per_folder=None):
    """
    Verwerk alle subfolders in de opgegeven hoofdfolder.

    Args:
        main_folder: Naam van de hoofdfolder in Cloudinary
        api_key: Anthropic API sleutel
        previous_results: Dictionary met eerder gevonden labelnummers
        limit_per_folder: Optionele limiet voor het aantal te verwerken afbeeldingen per folder

    Returns:
        Lijst met resultaten van alle afbeeldingen
    """
    all_results = []

    try:
        # Haal alle subfolders op
        print(f"Ophalen van subfolders in {main_folder}...")
        folders_response = cloudinary.api.subfolders(main_folder)

        # Verwerk elke subfolder
        for folder in folders_response['folders']:
            folder_results = process_folder(folder['path'], api_key, previous_results, limit_per_folder)
            all_results.extend(folder_results)

        # Verwerk ook de hoofdfolder zelf als er afbeeldingen direct in zitten
        main_folder_results = process_folder(main_folder, api_key, previous_results, limit_per_folder)
        all_results.extend(main_folder_results)

        return all_results
    except Exception as e:
        print(f"Fout bij ophalen van folders: {str(e)}")

        # Fallback: probeer alleen de hoofdfolder
        try:
            print("Fallback: verwerken van alleen de hoofdfolder...")
            return process_folder(main_folder, api_key, previous_results, limit_per_folder)
        except Exception as fallback_error:
            print(f"Fallback fout: {str(fallback_error)}")
            return []

def update_cloudinary_metadata(results):
    """
    Update de metadata van de afbeeldingen in Cloudinary met de gevonden labelnummers.

    Args:
        results: Lijst met resultaten van de verwerking
    """
    updated_count = 0

    # Zorg dat de cloudinary modules correct zijn geïmporteerd
    import cloudinary
    import cloudinary.uploader
    import cloudinary.api

    for result in results:
        if result['success'] and result['label_number']:
            # Als de bron cloudinary_metadata is, hoeven we niet opnieuw bij te werken
            if result.get('source') == 'cloudinary_metadata':
                continue

            try:
                # Voeg het labelnummer toe als metadata
                cloudinary.uploader.add_context(
                    f'label_number={result["label_number"]}',
                    public_ids=[result['public_id']]
                )
                updated_count += 1
                print(f"Metadata bijgewerkt voor {result['public_id']}")
            except Exception as e:
                print(f"Fout bij updaten metadata voor {result['public_id']}: {str(e)}")
                print(f"Details: {type(e).__name__}")

                # Alternatieve methode proberen als de eerste methode faalt
                try:
                    print("Alternatieve methode proberen via cloudinary.api...")
                    # Gebruik cloudinary.api.update in plaats van uploader.add_context
                    cloudinary.api.update(
                        result['public_id'],
                        context=f'label_number={result["label_number"]}'
                    )
                    updated_count += 1
                    print(f"Metadata bijgewerkt voor {result['public_id']} via alternatieve methode")
                except Exception as alt_error:
                    print(f"Ook alternatieve methode faalde: {str(alt_error)}")

    print(f"Totaal {updated_count} afbeeldingen bijgewerkt in Cloudinary")

def main():
    """Hoofdfunctie van het script."""
    parser = argparse.ArgumentParser(description='Extraheer labelnummers uit afbeeldingen in Cloudinary met Claude API.')
    parser.add_argument('--folder', default='Tom van As Kunst', help='Cloudinary folder om te verwerken')
    parser.add_argument('--output', default='label_extraction_results.json', help='Output JSON bestand')
    parser.add_argument('--update-cloudinary', action='store_true', help='Update Cloudinary metadata met gevonden labels')
    parser.add_argument('--single-image', help='Verwerk alleen de opgegeven public_id')
    parser.add_argument('--limit', type=int, help='Limiteer het aantal te verwerken afbeeldingen per folder')
    parser.add_argument('--force-reprocess', action='store_true', help='Forceer het opnieuw verwerken van alle afbeeldingen')

    args = parser.parse_args()

    print("Start extractie van labelnummers met Claude...")
    setup_cloudinary()
    api_key = check_anthropic_api_key()

    # Laad eerdere resultaten indien niet geforceerd herverwerken
    previous_results = {} if args.force_reprocess else load_previous_results(args.output)

    # Verwerk afbeeldingen
    if args.single_image:
        # Verwerk een enkele afbeelding
        try:
            resource = cloudinary.api.resource(args.single_image)
            results = [process_image(resource['secure_url'], resource['public_id'], api_key, previous_results)]
        except Exception as e:
            print(f"Fout bij ophalen van afbeelding {args.single_image}: {str(e)}")
            results = []
    else:
        # Verwerk alle folders
        results = process_all_folders(args.folder, api_key, previous_results, args.limit)

    # Sla resultaten op in een JSON-bestand
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

    print(f"Resultaten opgeslagen in {args.output}")

    # Toon samenvatting
    successful = sum(1 for r in results if r['success'])
    total = len(results)

    # Statistieken per bron
    from_cloudinary = sum(1 for r in results if r.get('source') == 'cloudinary_metadata')
    from_previous = sum(1 for r in results if r.get('source') == 'previous_run')
    from_claude = sum(1 for r in results if r.get('source') == 'claude_api')

    print(f"Totaal verwerkt: {total}")
    print(f"Succesvol geïdentificeerd: {successful}")
    if total > 0:
        print(f"Percentage succesvol: {successful/total*100:.2f}%")

    print(f"Bronnen:")
    print(f"  - Uit Cloudinary metadata: {from_cloudinary}")
    print(f"  - Uit vorige resultaten: {from_previous}")
    print(f"  - Nieuw geanalyseerd door Claude: {from_claude}")

    # Update Cloudinary metadata indien gewenst
    if args.update_cloudinary:
        print("Bijwerken van Cloudinary metadata...")
        update_cloudinary_metadata(results)
    elif successful > 0 and not args.single_image:
        answer = input("Wil je de metadata bijwerken in Cloudinary? (j/n): ").lower()
        if answer == 'j':
            update_cloudinary_metadata(results)

if __name__ == "__main__":
    main()
