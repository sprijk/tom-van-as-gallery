// scripts/extractTitlesWithOCR.js
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
require("dotenv").config();

// Command line argumenten verwerken
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run") || args.includes("-d");
const logToFile = args.includes("--log-to-file") || args.includes("-l");
const logFilePath = "ocr-results.log";

// Cloudinary configureren
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Functie om OCR tekst uit te halen en op te slaan als caption
async function extractTitlesWithOCR() {
  console.log("Start OCR extractie voor schilderijen van Tom van As...");

  if (isDryRun) {
    console.log(
      "DRY RUN MODUS: Er worden geen wijzigingen aangebracht in Cloudinary"
    );
  }

  // Logbestand initialiseren indien nodig
  if (logToFile) {
    const header =
      `OCR Extractie Resultaten - ${new Date().toISOString()}\n` +
      `Modus: ${isDryRun ? "Dry Run" : "Live"}\n` +
      "==========================================\n\n";
    fs.writeFileSync(logFilePath, header);
    console.log(`Resultaten worden opgeslagen in: ${logFilePath}`);
  }

  // Statistieken bijhouden
  let processed = 0;
  let updated = 0;
  let failed = 0;
  let skipped = 0;

  try {
    // Alle resources ophalen uit de Tom van As Kunst map
    const result = await getAllPaintings("Tom van As Kunst");

    console.log(`${result.length} schilderijen gevonden`);

    // Voor elke afbeelding OCR uitvoeren
    for (const painting of result) {
      processed++;
      try {
        console.log(`Verwerken van: ${painting.public_id}`);

        // Eerst checken of er al een caption is
        const existingCaption = await getExistingCaption(painting.public_id);
        if (existingCaption) {
          logMessage(
            `Bestaande caption gevonden voor ${painting.public_id}: "${existingCaption}"`
          );
          logMessage(
            `Wil je deze overschrijven? Gebruik --force om bestaande captions te overschrijven.`,
            true
          );

          // Als de --force flag niet is meegegeven, sla deze over
          if (!args.includes("--force") && !args.includes("-f")) {
            logMessage(
              `Overgeslagen: bestaande caption behouden voor ${painting.public_id}`
            );
            skipped++;
            continue;
          }
        }

        // OCR uitvoeren met Cloudinary
        const ocrResult = await performOCR(painting.public_id);

        if (ocrResult && ocrResult.text) {
          // Extraheer een nummer uit de OCR tekst
          const extractedNumber = extractNumberFromText(ocrResult.text);

          if (extractedNumber) {
            logMessage(
              `Nummer gevonden: ${extractedNumber} in ${painting.public_id}`
            );

            // Update de caption in de resource
            if (!isDryRun) {
              await updateCaption(painting.public_id, extractedNumber);
              logMessage(
                `Caption bijgewerkt voor ${painting.public_id}: "${extractedNumber}"`
              );
              updated++;
            } else {
              logMessage(
                `DRY RUN: Caption ZOU bijgewerkt worden voor ${painting.public_id}: "${extractedNumber}"`
              );
              updated++; // Voor statistieken in dry run
            }
          } else {
            logMessage(
              `Geen nummer gevonden in OCR tekst voor ${painting.public_id}`
            );
            logMessage(`  OCR tekst: "${ocrResult.text}"`, true);
            skipped++;
          }
        } else {
          logMessage(`Geen OCR resultaat voor ${painting.public_id}`);
          skipped++;
        }
      } catch (error) {
        failed++;
        logMessage(
          `FOUT bij verwerken van ${painting.public_id}: ${error.message}`
        );
      }

      // Kleine pauze om rate limits te voorkomen
      await delay(500);
    }

    // Toon samenvatting
    printSummary(processed, updated, failed, skipped);

    logMessage("OCR extractie voltooid");
  } catch (error) {
    console.error("Fout bij OCR extractie proces:", error);
  }
}

// Functie om alle schilderijen recursief op te halen, inclusief in submappen
async function getAllPaintings(folderPath) {
  console.log(`Map doorzoeken: ${folderPath}`);
  let allPaintings = [];

  try {
    // Haal resources op uit de huidige map
    const resources = await cloudinary.api.resources_by_asset_folder(
      folderPath,
      {
        resource_type: "image",
        max_results: 500,
      }
    );

    // Voeg resources toe aan resultatenlijst
    allPaintings = [...resources.resources];

    // Controleer of er submappen zijn
    const folders = await cloudinary.api.sub_folders(folderPath);

    // Recursief door submappen gaan
    for (const folder of folders.folders) {
      const subfolderPaintings = await getAllPaintings(folder.path);
      allPaintings = [...allPaintings, ...subfolderPaintings];
    }
  } catch (error) {
    console.error(
      `Fout bij ophalen resources uit map ${folderPath}:`,
      error.message
    );
  }

  return allPaintings;
}

// Functie om de bestaande caption op te halen
async function getExistingCaption(publicId) {
  try {
    const result = await cloudinary.api.resource(publicId, {
      context: true,
    });

    return result.context?.custom?.caption || null;
  } catch (error) {
    console.error(
      `Fout bij ophalen van bestaande caption voor ${publicId}:`,
      error.message
    );
    return null;
  }
}

// Functie om OCR uit te voeren met Cloudinary
async function performOCR(publicId) {
  try {
    // Gebruik Cloudinary OCR add-on
    const ocrUrl = cloudinary.url(publicId, {
      resource_type: "image",
      raw_transformation: "adv_ocr:true", // OCR add-on activeren
    });

    // OCR informatie ophalen
    const ocrInfo = await cloudinary.api.resource(publicId, {
      ocr: "adv_ocr",
    });

    return ocrInfo.info?.ocr?.adv_ocr || null;
  } catch (error) {
    console.error(`Fout bij OCR uitvoeren voor ${publicId}:`, error.message);
    return null;
  }
}

// Functie om een nummer te extraheren uit OCR tekst
function extractNumberFromText(text) {
  // Zoek naar een nummer in de tekst
  // Dit patroon zoekt naar cijfers in de tekst, mogelijk met extra karakters eromheen
  const numberMatch = text.match(/\d+/);

  if (numberMatch) {
    return numberMatch[0]; // Geef het eerste gevonden nummer terug
  }

  return null;
}

// Functie om de caption bij te werken
async function updateCaption(publicId, caption) {
  try {
    await cloudinary.api.update(publicId, {
      context: `caption=${caption}`,
    });
    return true;
  } catch (error) {
    console.error(
      `Fout bij bijwerken caption voor ${publicId}:`,
      error.message
    );
    return false;
  }
}

// Functie om berichten te loggen naar console en optioneel naar bestand
function logMessage(message, detailOnly = false) {
  if (!detailOnly) {
    console.log(message);
  }

  if (logToFile) {
    fs.appendFileSync(logFilePath, message + "\n");
  }
}

// Helper functie voor het maken van een vertraging
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Functie om een overzichtsrapport te tonen
function printSummary(processed, updated, failed, skipped) {
  const summary = `
==========================================
OCR EXTRACTIE SAMENVATTING
==========================================
Modus: ${
    isDryRun ? "DRY RUN (geen wijzigingen)" : "LIVE (wijzigingen toegepast)"
  }
Verwerkte afbeeldingen:    ${processed}
Bijgewerkte captions:      ${updated}
Mislukte verwerking:       ${failed}
Overgeslagen (geen nummer): ${skipped}
==========================================
`;

  console.log(summary);

  if (logToFile) {
    fs.appendFileSync(logFilePath, summary);
    console.log(`Volledig rapport opgeslagen in: ${logFilePath}`);
  }
}

// Help functie om de gebruiksaanwijzing weer te geven
function showHelp() {
  console.log(`
Gebruik: node scripts/extractTitlesWithOCR.js [opties]

Dit script extraheert nummers uit schilderijen van Tom van As via OCR en slaat deze op als captions in Cloudinary.

Opties:
  -d, --dry-run     Voer een simulatie uit zonder wijzigingen aan te brengen
  -l, --log-to-file Log alle resultaten naar een bestand (ocr-results.log)
  -f, --force       Overschrijf bestaande captions
  -h, --help        Toon deze help tekst

Voorbeelden:
  node scripts/extractTitlesWithOCR.js --dry-run               Simuleer het proces
  node scripts/extractTitlesWithOCR.js --force                 Voer uit en overschrijf bestaande captions
  node scripts/extractTitlesWithOCR.js --dry-run --log-to-file Simuleer en log resultaten naar bestand
  `);
  process.exit(0);
}

// Controleer op help argument
if (args.includes("--help") || args.includes("-h")) {
  showHelp();
}

// Start het script
extractTitlesWithOCR()
  .then(() => {
    console.log("Script succesvol uitgevoerd");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fatale fout in script:", err);
    process.exit(1);
  });
