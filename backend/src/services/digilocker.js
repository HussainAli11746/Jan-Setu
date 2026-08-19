export const generateAuthUrl = (sessionId, schemeId, requiredDocs) => {
  const baseUrl = "https://api.digitallocker.gov.in/public/oauth2/1/authorize";
  const state = Buffer.from(JSON.stringify({ sessionId, schemeId, requiredDocs })).toString('base64');
  return `${baseUrl}?response_type=code&client_id=mock_client&redirect_uri=${process.env.DIGILOCKER_REDIRECT_URI}&state=${state}`;
};

export const handleCallback = async (code, state) => {
  // Sandbox mode mock
  return {
    aadhaar: { name: 'Ramesh Kumar', dob: '1985-03-15', gender: 'M', address: { city: 'Varanasi', state: 'UP' }, aadhaar_last4: '1234' },
    income_certificate: { annual_income: 85000, issued_by: 'District Collector', valid_until: '2025-12-31' },
    land_record: { area_acres: 2.5, village: 'Rampur', district: 'Varanasi', owner: 'Ramesh Kumar' }
  };
};

export const extractDocumentFields = (documentData) => {
  const fields = {};
  if (documentData.aadhaar) {
    fields.name = documentData.aadhaar.name;
    fields.dob = documentData.aadhaar.dob;
    fields.gender = documentData.aadhaar.gender;
  }
  if (documentData.income_certificate) {
    fields.annual_income = documentData.income_certificate.annual_income;
  }
  if (documentData.land_record) {
    fields.land_area = documentData.land_record.area_acres;
  }
  return fields;
};

export const getRequiredDocs = (schemeId) => {
  // Normally would fetch from DB, mocking some common ones based on ID
  const docs = ['aadhaar'];
  if (schemeId === 'pmkisan') docs.push('land_record', 'bank_passbook');
  if (schemeId === 'pmayg') docs.push('bpl_certificate', 'bank_passbook');
  return docs;
};
