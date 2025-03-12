// server/api/admin/verify-password.js
export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event);
    const { password } = body;

    if (!password) {
      return createError({
        statusCode: 400,
        statusMessage: 'Password is required',
      });
    }

    // Get runtime config to get admin password
    const config = useRuntimeConfig();

    // Check if password matches the one in environment variables
    // In a production environment, you would use a more secure approach
    // like bcrypt to hash and compare passwords
    const adminPassword = config.adminPassword;

    if (!adminPassword) {
      console.error('Admin password not configured in environment variables');
      return {
        success: false,
        message: 'Admin authentication not properly configured',
      };
    }

    const isValid = password === adminPassword;

    return {
      success: isValid,
      message: isValid ? 'Authentication successful' : 'Invalid password',
    };
  } catch (error) {
    console.error('Error verifying password:', error);

    return createError({
      statusCode: 500,
      statusMessage: 'Failed to verify password',
      data: error,
    });
  }
});
