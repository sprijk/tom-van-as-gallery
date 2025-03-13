// File: server/utils/googleSheetsHelper.js
// server/utils/googleSheetsHelper.js
import { google } from 'googleapis';

/**
 * Helper function to append data to a Google Sheet
 *
 * @param {Object} data - The data to append to the sheet
 * @returns {Promise<Object>} - The response from Google Sheets API
 */
export async function appendToGoogleSheet(data) {
  try {
    const config = useRuntimeConfig();

    // Check if Google Sheets configuration is available
    if (!config.googleServiceAccountEmail || !config.googlePrivateKey || !config.googleSheetId) {
      console.warn('Google Sheets API credentials are not configured');
      return { success: false, message: 'Google Sheets API not configured' };
    }

    // Configure auth
    const auth = new google.auth.JWT(
      config.googleServiceAccountEmail,
      null,
      // config.googlePrivateKey,
      config.googlePrivateKey.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets('v4');

    // Format data as row
    const row = [
      new Date().toISOString(), // Timestamp
      data.name,
      data.email,
      data.phone || '',
      data.subject || '',
      data.message || '',
      data.paintings ? data.paintings.length : 0,
      data.paintings
        ? data.paintings.map((p) => `${p.title} (${p.category || 'Geen categorie'})`).join(', ')
        : '',
    ];

    // Append row to Google Sheet
    const response = await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: config.googleSheetId,
      range: 'Inquiries!A:H', // Adjust range as needed
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [row],
      },
    });

    return {
      success: true,
      message: 'Data appended to Google Sheet',
      response,
    };
  } catch (error) {
    console.error('Error appending data to Google Sheet:', error);
    return {
      success: false,
      message: 'Failed to append data to Google Sheet',
      error: error.message,
    };
  }
}
