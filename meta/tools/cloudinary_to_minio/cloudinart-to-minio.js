// cloudinary-to-minio.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Minio = require('minio');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dgvqkqvv1',
  api_key: '167276225166461',
  api_secret: 'rl3Hk2oGmwFN91ED0pEi_5BzjMU',
});

// Configure MinIO client
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minio-root-user',
  secretKey: 'minio-root-password',
  // accessKey: 'console-svcacct',
  // secretKey: 'console-secret',
});

// Ensure the images bucket exists
async function setupBucket() {
  const bucketName = 'tomvanas-kunst';
  const exists = await minioClient.bucketExists(bucketName);

  if (!exists) {
    process.exit(1);
    await minioClient.makeBucket(bucketName);
    console.log(`Bucket '${bucketName}' created successfully`);

    // Set bucket policy to allow public read access
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    console.log('Bucket policy set to public-read');
  } else {
    console.log(`Bucket '${bucketName}' already exists`);
  }
}

// Download image from Cloudinary and upload to MinIO
async function migrateImage(publicId, folder = '') {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const folderDir = path.join(__dirname, 'temp', folder);
  if (!fs.existsSync(folderDir)) {
    fs.mkdirSync(folderDir);
  }

  try {
    // Get image metadata from Cloudinary
    const resource = await cloudinary.api.resource(publicId);
    const format = resource.format;
    const url = resource.secure_url;

    // Download image from Cloudinary
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
    });

    const tempFilePath = path.join(folderDir, `${publicId}.${format}`);
    const writer = fs.createWriteStream(tempFilePath);

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Upload to MinIO
    const destPath = folder ? `${folder}/${publicId}.${format}` : `${publicId}.${format}`;
    console.log(`Uploading to MinIO: ${destPath}`);
    await minioClient.fPutObject('tomvanas-kunst', destPath, tempFilePath, {
      'Content-Type': `image/${format}`,
    });

    console.log(`Migrated: ${publicId}.${format} to ${destPath}`);

    // Clean up temp file
    // fs.unlinkSync(tempFilePath);

    return {
      publicId,
      oldUrl: url,
      newUrl: `http://localhost:9000/images/${destPath}`,
      destPath,
    };
  } catch (error) {
    console.error(`Error migrating ${publicId}:`, error.message);
    return null;
  }
}

// Migrate all images from a Cloudinary folder
async function migrateFolder(folderPath = '') {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  if (folderPath) {
    const folderDir = path.join(__dirname, 'temp', folderPath);
    if (!fs.existsSync(folderDir)) {
      fs.mkdirSync(folderDir);
    }
  }

  try {
    await setupBucket();

    console.log(`Migrating images from Cloudinary folder: ${folderPath || 'root'}`);

    // const options = folderPath ? { type: 'upload', prefix: folderPath } : { type: 'upload' };
    const foldersResult = await cloudinary.api.sub_folders(folderPath);
    const folders = foldersResult.folders;

    // Voor elke folder, haal de schilderijen op
    const migrations = [];

    // let folderCount = 0;
    let paintingCounter = 0;
    for (const folder of folders) {
      // if (folderCount++ > 2) {
      //   break;
      // }
      const folderPath = folder.path;

      // Haal alle schilderijen op uit deze folder met resources_by_asset_folder
      const result = await cloudinary.api.resources_by_asset_folder(folderPath, {
        type: 'upload',
        max_results: 500,
        context: true,
      });

      // Verwerk de schilderijen
      // let resourceCount = 0;
      for (const resource of result.resources) {
        let doSleep = true;
        // if (resourceCount++ > 2) {
        //   return;
        // }
        const publicId = resource.public_id;
        const labelNumber = resource.context?.custom?.label_number;
        const publishedStr = resource.context?.custom?.published;
        const published =
          publishedStr === undefined || publishedStr === null
            ? true // Default to published if not specified
            : publishedStr === 'true';

        console.log(`Migrating: ${resource.public_id}, ${labelNumber}, published ${published}`);
        let migrationInfo = null;

        // make sure the migration-info.json file exists
        if (!fs.existsSync('migration-info.json')) {
          fs.writeFileSync('migration-info.json', '');
        }

        // find the line with the publicId in the migration-info.json file
        const migrationInfoLine = fs
          .readFileSync('migration-info.json')
          .toString()
          .split('\n')
          .find((line) => line.includes(publicId));
        if (migrationInfoLine) {
          console.log('Migration info found for in file', publicId);
          doSleep = false;
          migrationInfo = JSON.parse(migrationInfoLine);
        } else {
          console.log('Migration info not found for in file', publicId);
          const migration = await migrateImage(publicId, folderPath);
          if (migration) {
            migrationInfo = { ...migration, publicId, labelNumber, published };
            // add migration info to a file on a new line.
            fs.appendFileSync('migration-info.json', JSON.stringify(migrationInfo) + '\n');
          }
        }
        if (migrationInfo) {
          paintingCounter++;
          console.log('Painting ', paintingCounter);
          migrations.push(migrationInfo);
        } else {
          console.log('Migration failed for', publicId);
        }

        if (doSleep) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    // Write migration map to a file for reference
    fs.writeFileSync('migration-map.json', JSON.stringify(migrations, null, 2));

    console.log(`Migration complete. Migrated ${migrations.length} images.`);
    console.log('Migration map saved to migration-map.json');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Start migration
// migrateFolder('tomvanas-kunst'); // Or use '' for root folder
migrateFolder('Tom van As Kunst'); // Or use '' for root folder
