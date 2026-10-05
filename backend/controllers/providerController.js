const { pool } = require('../config/db');

/**
 * Helper to get provider profile by user_id
 */
const getProfileByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT id, user_id, business_name, phone, description, address, city, 
            latitude, longitude, is_verified, is_available, created_at, updated_at
     FROM provider_profiles 
     WHERE user_id = ?`,
    [userId]
  );
  return rows[0] || null;
};

/**
 * Format provider profile for response
 */
const formatProviderProfile = (profile) => {
  if (!profile) return null;
  return {
    id: profile.id,
    user_id: profile.user_id,
    business_name: profile.business_name,
    phone: profile.phone,
    description: profile.description || '',
    address: profile.address || '',
    city: profile.city || '',
    latitude: profile.latitude !== null && profile.latitude !== undefined ? Number(profile.latitude) : null,
    longitude: profile.longitude !== null && profile.longitude !== undefined ? Number(profile.longitude) : null,
    is_verified: Boolean(profile.is_verified),
    is_available: Boolean(profile.is_available),
    created_at: profile.created_at,
    updated_at: profile.updated_at
  };
};

/**
 * POST /api/providers/profile
 * Create provider profile for authenticated provider user
 */
const createProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { business_name, phone, description, address, city, latitude, longitude } = req.body;

    // Validate required fields
    if (!business_name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Business name and phone number are required'
      });
    }

    const trimmedBusiness = business_name.trim();
    const trimmedPhone = phone.trim();

    if (trimmedBusiness.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Business name must be at least 2 characters long'
      });
    }

    if (trimmedPhone.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number'
      });
    }

    // Check if profile already exists for this provider user
    const existing = await getProfileByUserId(userId);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A provider profile already exists for this account. Use PUT to update it.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO provider_profiles 
       (user_id, business_name, phone, description, address, city, latitude, longitude, is_verified, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, TRUE)`,
      [
        userId,
        trimmedBusiness,
        trimmedPhone,
        description ? description.trim() : null,
        address ? address.trim() : null,
        city ? city.trim() : null,
        latitude !== undefined && latitude !== null && latitude !== '' ? Number(latitude) : null,
        longitude !== undefined && longitude !== null && longitude !== '' ? Number(longitude) : null
      ]
    );

    const [newRows] = await pool.query(
      `SELECT id, user_id, business_name, phone, description, address, city, 
              latitude, longitude, is_verified, is_available, created_at, updated_at
       FROM provider_profiles WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Provider profile created successfully',
      provider: formatProviderProfile(newRows[0])
    });
  } catch (error) {
    console.error('Error creating provider profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating provider profile'
    });
  }
};

/**
 * GET /api/providers/profile
 * Get authenticated provider's own profile
 */
const getOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await getProfileByUserId(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found. Please create your provider profile.'
      });
    }

    return res.status(200).json({
      success: true,
      provider: {
        id: profile.id,
        business_name: profile.business_name,
        phone: profile.phone,
        description: profile.description || '',
        address: profile.address || '',
        city: profile.city || '',
        latitude: profile.latitude !== null && profile.latitude !== undefined ? Number(profile.latitude) : null,
        longitude: profile.longitude !== null && profile.longitude !== undefined ? Number(profile.longitude) : null,
        is_verified: Boolean(profile.is_verified),
        is_available: Boolean(profile.is_available)
      }
    });
  } catch (error) {
    console.error('Error fetching provider profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching provider profile'
    });
  }
};

/**
 * PUT /api/providers/profile
 * Update authenticated provider's profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const existing = await getProfileByUserId(userId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found. Please create your provider profile first.'
      });
    }

    const {
      business_name,
      phone,
      description,
      address,
      city,
      latitude,
      longitude,
      is_available
    } = req.body;

    // Disallow modifying protected fields: id, user_id, is_verified, created_at, updated_at
    const updatedBusinessName = business_name !== undefined ? business_name.trim() : existing.business_name;
    const updatedPhone = phone !== undefined ? phone.trim() : existing.phone;
    const updatedDescription = description !== undefined ? description.trim() : existing.description;
    const updatedAddress = address !== undefined ? address.trim() : existing.address;
    const updatedCity = city !== undefined ? city.trim() : existing.city;
    const updatedLatitude = latitude !== undefined && latitude !== '' && latitude !== null ? Number(latitude) : (latitude === null ? null : existing.latitude);
    const updatedLongitude = longitude !== undefined && longitude !== '' && longitude !== null ? Number(longitude) : (longitude === null ? null : existing.longitude);
    const updatedAvailability = is_available !== undefined ? (is_available === true || is_available === 1 || is_available === 'true') : Boolean(existing.is_available);

    if (!updatedBusinessName || !updatedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Business name and phone number cannot be empty'
      });
    }

    await pool.query(
      `UPDATE provider_profiles
       SET business_name = ?,
           phone = ?,
           description = ?,
           address = ?,
           city = ?,
           latitude = ?,
           longitude = ?,
           is_available = ?
       WHERE id = ?`,
      [
        updatedBusinessName,
        updatedPhone,
        updatedDescription,
        updatedAddress,
        updatedCity,
        updatedLatitude,
        updatedLongitude,
        updatedAvailability,
        existing.id
      ]
    );

    const [updatedRows] = await pool.query(
      `SELECT id, user_id, business_name, phone, description, address, city, 
              latitude, longitude, is_verified, is_available, created_at, updated_at
       FROM provider_profiles WHERE id = ?`,
      [existing.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Provider profile updated successfully',
      provider: formatProviderProfile(updatedRows[0])
    });
  } catch (error) {
    console.error('Error updating provider profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating provider profile'
    });
  }
};

/**
 * POST /api/providers/services
 * Select / update services offered by authenticated provider
 */
const selectServices = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.id;

    // 1. Get the authenticated provider profile
    const [profiles] = await connection.query(
      'SELECT id FROM provider_profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please create a provider profile before selecting services'
      });
    }

    const providerId = profiles[0].id;
    const { service_category_ids } = req.body;

    if (!Array.isArray(service_category_ids)) {
      return res.status(400).json({
        success: false,
        message: 'service_category_ids must be an array of category IDs'
      });
    }

    // Clean & deduplicate input IDs
    const categoryIds = [...new Set(service_category_ids.map(id => Number(id)).filter(id => !isNaN(id) && id > 0))];

    // 2. Check that the selected category IDs exist
    if (categoryIds.length > 0) {
      const [existingCategories] = await connection.query(
        'SELECT id FROM service_categories WHERE id IN (?)',
        [categoryIds]
      );

      const existingIds = new Set(existingCategories.map(c => c.id));
      const invalidIds = categoryIds.filter(id => !existingIds.has(id));

      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: `The following service category IDs do not exist: ${invalidIds.join(', ')}`
        });
      }
    }

    // 3. Update provider-service relationships
    await connection.beginTransaction();

    // Delete existing services for provider
    await connection.query(
      'DELETE FROM provider_services WHERE provider_id = ?',
      [providerId]
    );

    // 4. Insert selected relationships avoiding duplicates
    if (categoryIds.length > 0) {
      const values = categoryIds.map(catId => [providerId, catId]);
      await connection.query(
        'INSERT IGNORE INTO provider_services (provider_id, service_category_id) VALUES ?',
        [values]
      );
    }

    await connection.commit();

    // 5. Return the selected services
    const [selectedServices] = await pool.query(
      `SELECT sc.id, sc.name, sc.description
       FROM provider_services ps
       JOIN service_categories sc ON ps.service_category_id = sc.id
       WHERE ps.provider_id = ?
       ORDER BY sc.name ASC`,
      [providerId]
    );

    return res.status(200).json({
      success: true,
      message: 'Provider services updated successfully',
      services: selectedServices.map(s => ({
        id: s.id,
        name: s.name
      }))
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error selecting provider services:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving provider services'
    });
  } finally {
    connection.release();
  }
};

/**
 * GET /api/providers/services
 * Get services selected by the authenticated provider
 */
const getOwnServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await getProfileByUserId(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    const [rows] = await pool.query(
      `SELECT sc.id, sc.name
       FROM provider_services ps
       JOIN service_categories sc ON ps.service_category_id = sc.id
       WHERE ps.provider_id = ?
       ORDER BY sc.name ASC`,
      [profile.id]
    );

    return res.status(200).json({
      success: true,
      services: rows.map(r => ({
        id: r.id,
        name: r.name
      }))
    });
  } catch (error) {
    console.error('Error fetching provider services:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching provider services'
    });
  }
};

/**
 * GET /api/providers
 * Public endpoint to list service providers with optional filters:
 * - ?city=Coimbatore
 * - ?service=Electrician
 */
const listProviders = async (req, res) => {
  try {
    const { city, service } = req.query;

    let query = `
      SELECT p.id, p.business_name, p.city, p.description, p.is_available, p.is_verified
      FROM provider_profiles p
      WHERE 1=1
    `;
    const params = [];

    // Filter by city
    if (city && city.trim() !== '') {
      query += ' AND LOWER(TRIM(p.city)) = LOWER(TRIM(?))';
      params.push(city.trim());
    }

    // Filter by service
    if (service && service.trim() !== '') {
      query += `
        AND EXISTS (
          SELECT 1 
          FROM provider_services ps
          JOIN service_categories sc ON ps.service_category_id = sc.id
          WHERE ps.provider_id = p.id
            AND (LOWER(TRIM(sc.name)) = LOWER(TRIM(?)) OR sc.id = ?)
        )
      `;
      params.push(service.trim(), isNaN(service) ? -1 : Number(service));
    }

    query += ' ORDER BY p.is_available DESC, p.business_name ASC';

    const [providers] = await pool.query(query, params);

    if (providers.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        providers: []
      });
    }

    // Fetch services for all returned providers
    const providerIds = providers.map(p => p.id);
    const [servicesRows] = await pool.query(
      `SELECT ps.provider_id, sc.id, sc.name
       FROM provider_services ps
       JOIN service_categories sc ON ps.service_category_id = sc.id
       WHERE ps.provider_id IN (?)
       ORDER BY sc.name ASC`,
      [providerIds]
    );

    // Group services by provider_id
    const servicesByProvider = {};
    servicesRows.forEach(row => {
      if (!servicesByProvider[row.provider_id]) {
        servicesByProvider[row.provider_id] = [];
      }
      servicesByProvider[row.provider_id].push({
        id: row.id,
        name: row.name
      });
    });

    // Format final response without sensitive fields (passwords, JWT, private coordinates/home-address)
    const formattedProviders = providers.map(p => ({
      id: p.id,
      business_name: p.business_name,
      city: p.city || '',
      description: p.description || '',
      is_available: Boolean(p.is_available),
      is_verified: Boolean(p.is_verified),
      services: servicesByProvider[p.id] || []
    }));

    return res.status(200).json({
      success: true,
      count: formattedProviders.length,
      providers: formattedProviders
    });
  } catch (error) {
    console.error('Error listing providers:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving provider listing'
    });
  }
};

module.exports = {
  createProfile,
  getOwnProfile,
  updateProfile,
  selectServices,
  getOwnServices,
  listProviders
};
