export const fillFormFields = (schemeId, extractedFields) => {
  const filled = {};
  const needs_manual = [];
  
  // A simplistic mock logic. In reality, we map based on DB form_fields schema
  if (extractedFields.name) filled.name = extractedFields.name;
  else needs_manual.push('name');
  
  if (schemeId === 'pmkisan') {
    if (extractedFields.land_area) filled.land_area = extractedFields.land_area;
    else needs_manual.push('land_area');
    
    if (extractedFields.bank_account) filled.bank_account = extractedFields.bank_account;
    else needs_manual.push('bank_account');
  }

  console.log(`Auto-filled fields for ${schemeId}:`, filled);
  
  return { filled, needs_manual };
};
