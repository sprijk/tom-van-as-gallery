import io
import os
from minio import Minio
from minio.error import S3Error
from pillow_heif import register_heif_opener
from PIL import Image

# Register the HEIF opener to work with HEIC files
register_heif_opener()

# Minio connection parameters
MINIO_ENDPOINT = 'localhost:9000'
MINIO_ACCESS_KEY = 'minio-root-user'  # Replace with your actual access key
MINIO_SECRET_KEY = 'minio-root-password'  # Replace with your actual secret key
MINIO_BUCKET = 'tomvanas-kunst'     # Replace with your actual bucket name
USE_SSL = False                       # Set to True if your Minio uses HTTPS

def convert_heic_to_jpg(override=False):
    # Initialize Minio client
    client = Minio(
        MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=USE_SSL
    )

    # Base prefix for the directory structure
    base_prefix = 'Tom van As Kunst/'

    # Get all objects with the base prefix
    objects = client.list_objects(MINIO_BUCKET, prefix=base_prefix, recursive=True)

    # Filter for HEIC files
    heic_objects = [obj for obj in objects if obj.object_name.lower().endswith('.heic')]

    print(f"Found {len(list(heic_objects))} HEIC files to convert")

    # Process each HEIC file
    for obj in heic_objects:
        try:
            heic_path = obj.object_name
            jpg_path = os.path.splitext(heic_path)[0] + '.jpg'

            # Check if JPG already exists
            try:
                client.stat_object(MINIO_BUCKET, jpg_path)
                if not override:
                    print(f"Skipping {heic_path} - JPG already exists")
                    continue
                print(f"Overriding existing JPG: {jpg_path}")
            except S3Error as err:
                if err.code == 'NoSuchKey':
                    # JPG doesn't exist, proceed with conversion
                    pass
                else:
                    raise

            # # Check if JPG already exists
            # try:
            #     client.stat_object(MINIO_BUCKET, jpg_path)
            #     print(f"Skipping {heic_path} - JPG already exists")
            #     continue
            # except S3Error as err:
            #     if err.code == 'NoSuchKey':
            #         # JPG doesn't exist, proceed with conversion
            #         pass
            #     else:
            #         raise

            print(f"Processing: {heic_path}")

            # Download the HEIC file
            response = client.get_object(MINIO_BUCKET, heic_path)
            heic_data = response.read()
            response.close()

            # Convert HEIC to JPG
            heic_image = Image.open(io.BytesIO(heic_data))
            jpg_buffer = io.BytesIO()
            heic_image.convert('RGB').save(jpg_buffer, 'JPEG', quality=90)
            jpg_buffer.seek(0)

            # Upload the JPG file
            client.put_object(
                MINIO_BUCKET,
                jpg_path,
                jpg_buffer,
                length=jpg_buffer.getbuffer().nbytes,
                content_type='image/jpeg'
            )

            print(f"Converted: {heic_path} -> {jpg_path}")

        except Exception as e:
            print(f"Error processing {obj.object_name}: {e}")

    print("Conversion complete!")

if __name__ == "__main__":
    convert_heic_to_jpg(override=True)
