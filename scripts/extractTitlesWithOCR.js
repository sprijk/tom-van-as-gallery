// Check if OCR add-on is available via a test request
async function checkOCRAvailability() {
  try {
    logMessage("Controleren of OCR-addon beschikbaar is...");

    // Probeer een eenvoudig OCR verzoek om te testen of het werkt
    // We gebruiken een willekeurige test afbeelding
    const testPublicId = "sample"; // Standaard sample afbeelding in Cloudinary

    try {
      // Test of de OCR functionaliteit beschikbaar is
      await cloudinary.uploader.explicit(testPublicId, {
        type: "upload",
        ocr: "adv_ocr",
      });

      logMessage("OCR add-on lijkt beschikbaar te zijn!");
      return true;
    } catch (testError) {
      // Als we een specifieke fout krijgen over OCR niet beschikbaar, toon waarschuwing
      if (
        testError.message &&
        (testError.message.includes("ocr") ||
          testError.message.includes("add-on") ||
          testError.message.includes("addon") ||
          testError.message.includes("Advanced OCR"))
      ) {
        logMessage(
          "WAARSCHUWING: OCR add-on test mislukt. Het lijkt erop dat Advanced OCR niet beschikbaar is.",
        );
        logMessage(`Foutmelding: ${testError.message}`);
        logMessage(
          "Ga naar https://cloudinary.com/console/addons om add-ons te activeren.",
        );
      } else {
        // Als het een andere fout is (bijv. sample afbeelding niet beschikbaar), negeer dit
        logMessage(
          "OCR beschikbaarheidstest gaf een fout, maar het kan zijn dat de test afbeelding niet beschikbaar is.",
        );
        logMessage(`Foutmelding: ${testError.message}`);
        logMessage("We gaan door met de aanname dat OCR beschikbaar is.");
        return true;
      }
    }

    // Als OCR niet beschikbaar lijkt, maar gebruiker wil toch doorgaan
    if (!args.includes("--ignore-availability")) {
      logMessage(
        "Script wordt gestopt. Gebruik --ignore-availability om toch door te gaan.",
      );
      process.exit(1);
    }

    logMessage(
      "Doorgaan ondanks mogelijke problemen met OCR beschikbaarheid...",
    );
    return false;
  } catch (error) {
    logMessage(
      `Fout bij controleren van OCR beschikbaarheid: ${error.message}`,
    );

    if (!args.includes("--ignore-availability")) {
      logMessage(
        "Script wordt gestopt. Gebruik --ignore-availability om toch door te gaan.",
      );
      process.exit(1);
    }

    return false;
  }
} // Alternative OCR function that uses the explicit OCR URL
async function performAlternativeOCR(publicId) {
  try {
    logMessage(`Alternatieve OCR methode proberen voor ${publicId}...`);

    // Genereer een specifieke OCR URL
    const ocrUrl = cloudinary.url(publicId, {
      resource_type: "image",
      raw_transformation: "adv_ocr:true",
    });

    logMessage(`OCR URL: ${ocrUrl}`, true);

    // Wacht even zodat de OCR kan worden uitgevoerd
    await delay(3000);

    // Probeer de OCR resultaten op te halen
    const ocrInfo = await cloudinary.api.resource(publicId, {
      ocr: "adv_ocr",
    });

    if (ocrInfo.info && ocrInfo.info.ocr && ocrInfo.info.ocr.adv_ocr) {
      const ocrResult = ocrInfo.info.ocr.adv_ocr;

      // Controleer de OCR-status
      logMessage(`  OCR status: ${ocrResult.status || "Onbekend"}`, true);

      if (
        ocrResult.status === "complete" &&
        ocrResult.data &&
        ocrResult.data[0]
      ) {
        // Als er fullTextAnnotation aanwezig is, haal de tekst eruit
        if (ocrResult.data[0].fullTextAnnotation) {
          const text = ocrResult.data[0].fullTextAnnotation.text;
          logMessage(`  OCR-tekst gevonden: "${text}"`, true);
          return { text };
        }
        // Als er textAnnotations zijn, gebruik de description van de eerste (volledige tekst)
        else if (
          ocrResult.data[0].textAnnotations &&
          ocrResult.data[0].textAnnotations.length > 0
        ) {
          const text = ocrResult.data[0].textAnnotations[0].description;
          logMessage(
            `  OCR-tekst gevonden in textAnnotations: "${text}"`,
            true,
          );
          return { text };
        }
      }
    }

    logMessage(`Alternatieve OCR methode gaf geen resultaat voor ${publicId}`);
    return null;
  } catch (error) {
    logMessage(`FOUT bij alternatieve OCR voor ${publicId}: ${error.message}`);
    return null;
  }
} // scripts/extractTitlesWithOCR.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Initialization
config();

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
      "DRY RUN MODUS: Er worden geen wijzigingen aangebracht in Cloudinary",
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
            `Bestaande caption gevonden voor ${painting.public_id}: "${existingCaption}"`,
          );
          logMessage(
            `Wil je deze overschrijven? Gebruik --force om bestaande captions te overschrijven.`,
            true,
          );

          // Als de --force flag niet is meegegeven, sla deze over
          if (!args.includes("--force") && !args.includes("-f")) {
            logMessage(
              `Overgeslagen: bestaande caption behouden voor ${painting.public_id}`,
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
              `Nummer gevonden: ${extractedNumber} in ${painting.public_id}`,
            );

            // Update de caption in de resource
            if (!isDryRun) {
              await updateCaption(painting.public_id, extractedNumber);
              logMessage(
                `Caption bijgewerkt voor ${painting.public_id}: "${extractedNumber}"`,
              );
              updated++;
            } else {
              logMessage(
                `DRY RUN: Caption ZOU bijgewerkt worden voor ${painting.public_id}: "${extractedNumber}"`,
              );
              updated++; // Voor statistieken in dry run
            }
          } else {
            logMessage(
              `Geen nummer gevonden in OCR tekst voor ${painting.public_id}`,
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
          `FOUT bij verwerken van ${painting.public_id}: ${error.message}`,
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
      },
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
      error.message,
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
      error.message,
    );
    return null;
  }
}

// Functie om OCR uit te voeren met Cloudinary
async function performOCR(publicId) {
  try {
    logMessage(`OCR activeren voor ${publicId}...`);

    // Activeer OCR voor deze resource en sla resultaat op
    const explicitResult = await cloudinary.uploader.explicit(publicId, {
      type: "upload",
      ocr: "adv_ocr",
    });

    // Log het resultaat van de OCR activatie voor debug
    logMessage(`OCR activatie resultaat voor ${publicId}:`, true);

    // Controleer of er OCR-resultaten beschikbaar zijn
    if (
      explicitResult.info &&
      explicitResult.info.ocr &&
      explicitResult.info.ocr.adv_ocr
    ) {
      const ocrResult = explicitResult.info.ocr.adv_ocr;

      // Controleer de OCR-status
      logMessage(`  OCR status: ${ocrResult.status || "Onbekend"}`, true);

      if (
        ocrResult.status === "complete" &&
        ocrResult.data &&
        ocrResult.data[0]
      ) {
        // Als er fullTextAnnotation aanwezig is, haal de tekst eruit
        if (ocrResult.data[0].fullTextAnnotation) {
          const text = ocrResult.data[0].fullTextAnnotation.text;
          logMessage(`  OCR-tekst gevonden: "${text}"`, true);
          return { text };
        }
        // Als er textAnnotations zijn, gebruik de description van de eerste (volledige tekst)
        else if (
          ocrResult.data[0].textAnnotations &&
          ocrResult.data[0].textAnnotations.length > 0
        ) {
          const text = ocrResult.data[0].textAnnotations[0].description;
          logMessage(
            `  OCR-tekst gevonden in textAnnotations: "${text}"`,
            true,
          );
          return { text };
        }
      } else {
        logMessage(
          `  OCR niet compleet of geen data gevonden. Status: ${ocrResult.status}`,
          true,
        );
      }
    } else {
      logMessage(`  Geen OCR informatie gevonden in de response`, true);

      // Volledige respons loggen voor debugging
      if (logToFile) {
        fs.appendFileSync(
          logFilePath,
          `  Volledige OCR activatie respons: ${JSON.stringify(
            explicitResult,
            null,
            2,
          )}\n`,
        );
      }
    }

    // Als we hier komen, hebben we geen OCR-resultaten gevonden
    // Probeer opnieuw met een vertraging
    logMessage(`  Wachten en OCR resultaten opnieuw ophalen...`, true);
    await delay(3000);

    // Haal de resource opnieuw op met OCR informatie
    const resourceInfo = await cloudinary.api.resource(publicId, {
      ocr: "adv_ocr",
    });

    if (
      resourceInfo.info &&
      resourceInfo.info.ocr &&
      resourceInfo.info.ocr.adv_ocr
    ) {
      const ocrResult = resourceInfo.info.ocr.adv_ocr;

      if (
        ocrResult.status === "complete" &&
        ocrResult.data &&
        ocrResult.data[0]
      ) {
        // Als er fullTextAnnotation aanwezig is, haal de tekst eruit
        if (ocrResult.data[0].fullTextAnnotation) {
          const text = ocrResult.data[0].fullTextAnnotation.text;
          logMessage(`  OCR-tekst gevonden bij tweede poging: "${text}"`, true);
          return { text };
        }
        // Als er textAnnotations zijn, gebruik de description van de eerste (volledige tekst)
        else if (
          ocrResult.data[0].textAnnotations &&
          ocrResult.data[0].textAnnotations.length > 0
        ) {
          const text = ocrResult.data[0].textAnnotations[0].description;
          logMessage(
            `  OCR-tekst gevonden in textAnnotations bij tweede poging: "${text}"`,
            true,
          );
          return { text };
        }
      }
    }

    // Als we nog steeds geen resultaat hebben, probeer de alternatieve methode
    logMessage(
      `  Geen OCR resultaat gevonden, alternatieve methode proberen...`,
    );
    return await performAlternativeOCR(publicId);
  } catch (error) {
    logMessage(`FOUT bij OCR uitvoeren voor ${publicId}: ${error.message}`);
    // Extra debug info over de fout
    if (error.http_code) {
      logMessage(`  HTTP code: ${error.http_code}`, true);
    }
    if (error.error) {
      logMessage(
        `  Error details: ${
          error.error.message || JSON.stringify(error.error)
        }`,
        true,
      );
    }

    // Als er een fout is, probeer de alternatieve methode
    logMessage(`  Proberen met alternatieve OCR methode na fout...`);
    return await performAlternativeOCR(publicId);
  }
}

// Functie om een nummer te extraheren uit OCR tekst
function extractNumberFromText(text) {
  if (!text) return null;

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
      error.message,
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
  -d, --dry-run            Voer een simulatie uit zonder wijzigingen aan te brengen
  -l, --log-to-file        Log alle resultaten naar een bestand (ocr-results.log)
  -f, --force              Overschrijf bestaande captions
  --ignore-availability    Negeer controle op OCR add-on beschikbaarheid
  --skip-ocr-check         Sla de OCR beschikbaarheidstest over
  -h, --help               Toon deze help tekst

Voorbeelden:
  node scripts/extractTitlesWithOCR.js --dry-run               Simuleer het proces
  node scripts/extractTitlesWithOCR.js --force                 Voer uit en overschrijf bestaande captions
  node scripts/extractTitlesWithOCR.js --dry-run --log-to-file Simuleer en log resultaten naar bestand
  node scripts/extractTitlesWithOCR.js --skip-ocr-check        Voer uit zonder OCR beschikbaarheid te controleren
  `);
  process.exit(0);
}

// Start het script
async function main() {
  try {
    // Als gebruiker forced OCR controle overslaan, skip de check
    if (!args.includes("--skip-ocr-check")) {
      // Controleer OCR beschikbaarheid
      await checkOCRAvailability();
    } else {
      logMessage(
        "OCR beschikbaarheidscontrole overgeslagen door --skip-ocr-check optie",
      );
    }

    // Start OCR extractie
    await extractTitlesWithOCR();
    console.log("Script succesvol uitgevoerd");
    process.exit(0);
  } catch (err) {
    console.error("Fatale fout in script:", err);
    process.exit(1);
  }
}

// Controleer op help argument
if (args.includes("--help") || args.includes("-h")) {
  showHelp();
} else {
  // Start het script
  main();
}
