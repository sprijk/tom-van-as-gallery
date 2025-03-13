// File: server/api/inquiry.js
// server/api/inquiry.js
import { appendToGoogleSheet } from '../utils/googleSheetsHelper';

export default defineEventHandler(async (event) => {
  try {
    // Get the form data from the request body
    const body = await readBody(event);

    // Validate required fields
    if (!body.name || !body.email || !body.paintings || body.paintings.length === 0) {
      return createError({
        statusCode: 400,
        statusMessage: 'Missing required fields',
      });
    }

    // Log the received inquiry
    console.log('Received inquiry form submission:', body);

    // Attempt to add the data to Google Sheets
    const sheetResult = await appendToGoogleSheet(body);

    // Log the result (but still continue even if Google Sheets fails)
    if (!sheetResult.success) {
      console.warn('Google Sheets integration failed:', sheetResult.message);
    } else {
      console.log('Successfully added to Google Sheets');
    }

    // You could also send an email notification here

    return {
      success: true,
      message: 'Inquiry submitted successfully',
      sheetResult: sheetResult.success
        ? 'Data added to Google Sheets'
        : 'Google Sheets integration unavailable',
    };
  } catch (error) {
    console.error('Error processing inquiry:', error);

    return createError({
      statusCode: 500,
      statusMessage: 'Failed to submit inquiry',
      data: error,
    });
  }
});
