// server/scripts/extractLabelNumbers.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import dotenv from 'dotenv'
import * as tesseract from 'node-tesseract-ocr'
import { v2 as cloudinary } from 'cloudinary'

// Laad environment variables
dotenv.config()

// Cloudinary configureren
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const resultsFilePath = path.join(__dirname, 'label_numbers.json')
const tempDir = path.join(__dirname, 'temp_labels')

// Zorg ervoor dat de temp directory bestaat
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

// Functie om een afbeelding te downloaden van URL
const downloadImage = (url, filePath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath)
    https
      .get(url, (response) => {
        response.pipe(file)
        file.on('finish', () => {
          file.close(resolve)
        })
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}

// Configuratie voor Tesseract OCR
const ocrConfig = {
  // lang: "eng", // Taal voor herkenning (Engels werkt meestal goed voor cijfers)
  oem: 1, // OCR Engine mode
  psm: 6, // Page segmentation mode (6 = enkele regel tekst)
  tessedit_char_whitelist: '0123456789', // Alleen cijfers herkennen
}

// Functie om OCR uit te voeren op een afbeelding met focus op het label
const performOcrOnLabel = async (imageUrl, id) => {
  try {
    // Bestandsnaam maken voor de tijdelijke afbeelding
    const safeId = id.replace(/\//g, '_')
    const tempFilePath = path.join(tempDir, `${safeId}.jpg`)

    // Download de afbeelding
    await downloadImage(imageUrl, tempFilePath)

    // OCR uitvoeren op de gedownloade afbeelding
    const text = await tesseract.recognize(tempFilePath, ocrConfig)

    // Tijdelijke bestanden worden NIET verwijderd, zodat je ze kunt bekijken
    console.log(`Afbeelding opgeslagen: ${tempFilePath}`)

    // Alleen cijfers behouden en spaties verwijderen
    return text.replace(/[^0-9]/g, '').trim()
  }
  catch (error) {
    console.error('OCR fout:', error)
    return ''
  }
}

// Functie om alle afbeeldingen te verwerken
const processAllPaintings = async () => {
  const results = []

  try {
    // Eerst proberen om alle folders in "Tom van As Kunst" te vinden
    let folders = []
    try {
      const foldersResult
        = await cloudinary.api.sub_folders('Tom van As Kunst')
      folders = foldersResult.folders.map(folder => folder.path)
    }
    catch (folderError) {
      console.error('Fout bij het ophalen van folders:', folderError)
      // Als fallback, proberen we direct alle afbeeldingen op te halen
    }

    // Als we folders hebben gevonden, verwerk elke folder
    if (folders.length > 0) {
      for (const folderPath of folders) {
        console.log(`Verwerken van folder: ${folderPath}`)

        const result = await cloudinary.api.resources_by_asset_folder(
          folderPath,
          {
            type: 'upload',
            max_results: 500,
            context: true,
          },
        )

        // Verwerk elke afbeelding in deze folder
        for (const resource of result.resources) {
          // Controleer of er een caption is
          if (resource.context?.custom?.caption) {
            const title = resource.context.custom.caption
            const id = resource.public_id

            // Focus op een kleinere versie van de afbeelding voor betere OCR resultaten
            // Gebruik Cloudinary transformaties om het label beter zichtbaar te maken
            const labelImageUrl = cloudinary.url(id, {
              secure: true,
              transformation: [
                // Eerste transformatie - crop naar rechteronderhoek waar het label meestal zit
                {
                  width: 1200,
                  height: 400,
                  crop: 'crop',
                  gravity: 'north',
                },
                // Tweede transformatie - verhoog contrast voor betere OCR
                { effect: 'contrast:50' },
              ],
            })

            try {
              // Voer OCR uit met de URL en ID (voor bestandsnaam)
              const labelNumber = await performOcrOnLabel(labelImageUrl, id)

              console.log(
                `Schilderij: ${title}, Label nummer: ${
                  labelNumber || 'Niet gevonden'
                }`,
              )

              results.push({
                id,
                title,
                labelNumber: labelNumber || null,
                labelImageUrl, // Voeg de URL toe zodat je deze kunt bekijken
              })
            }
            catch (error) {
              console.error(`Fout bij verwerken van afbeelding ${id}:`, error)
            }
          }
        }
      }
    }
    else {
      // Fallback: direct alle afbeeldingen ophalen
      console.log('Geen folders gevonden, alle afbeeldingen direct ophalen')

      const result = await cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        context: true,
        prefix: 'Tom van As Kunst',
      })

      // Verwerk elke afbeelding
      for (const resource of result.resources) {
        // Controleer of er een caption is
        if (resource.context?.custom?.caption) {
          const title = resource.context.custom.caption
          const id = resource.public_id

          const labelImageUrl = cloudinary.url(id, {
            secure: true,
            transformation: [
              {
                width: 1200,
                height: 400,
                crop: 'crop',
                gravity: 'north',
              },
              // Tweede transformatie - verhoog contrast voor betere OCR
              { effect: 'contrast:50' },
            ],
          })

          try {
            // Voer OCR uit met de URL en ID (voor bestandsnaam)
            const labelNumber = await performOcrOnLabel(labelImageUrl, id)

            console.log(
              `Schilderij: ${title}, Label nummer: ${
                labelNumber || 'Niet gevonden'
              }`,
            )

            results.push({
              id,
              title,
              labelNumber: labelNumber || null,
              labelImageUrl, // Voeg de URL toe zodat je deze kunt bekijken
            })
          }
          catch (error) {
            console.error(`Fout bij verwerken van afbeelding ${id}:`, error)
          }
        }
      }
    }

    // Sla de resultaten op in een JSON-bestand
    fs.writeFileSync(resultsFilePath, JSON.stringify(results, null, 2))

    console.log(
      `Verwerking voltooid. Resultaten opgeslagen in ${resultsFilePath}`,
    )
    console.log(`Totaal aantal verwerkte schilderijen: ${results.length}`)

    return results
  }
  catch (error) {
    console.error('Algemene fout bij het verwerken van schilderijen:', error)
    throw error
  }
}

// Voer het script uit
processAllPaintings().catch(console.error)
