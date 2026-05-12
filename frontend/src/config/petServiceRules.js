/**
 * Pet Service Compatibility Rules
 * Centralized configuration for service eligibility based on pet species
 * Used across all service booking components and backend validation
 */

import { getSpeciesCategory } from './petSpeciesConfig';

// Service compatibility rules by species
export const SPECIES_SERVICE_RULES = {
  "Dog": {
    category: "standard",
    petHotel: {
      allowed: true,
      autoPricing: true,
      staffApproval: "normal",
      message: ""
    },
    veterinary: {
      allowed: true,
      consultationType: "standard",
      autoPricing: true,
      staffApproval: "normal",
      message: ""
    },
    grooming: {
      allowed: true,
      autoPricing: true,
      staffApproval: "normal",
      message: ""
    }
  },
  "Cat": {
    category: "standard",
    petHotel: {
      allowed: true,
      autoPricing: true,
      staffApproval: "normal",
      message: ""
    },
    veterinary: {
      allowed: true,
      consultationType: "standard",
      autoPricing: true,
      staffApproval: "normal",
      message: ""
    },
    grooming: {
      allowed: true,
      autoPricing: true,
      staffApproval: "normal",
      message: ""
    }
  },
  "Rabbit": {
    category: "small_animal",
    petHotel: {
      allowed: true,
      autoPricing: false,
      staffApproval: "required",
      message: "This pet may require special handling. The request will be reviewed by staff before approval.",
      specialCare: {
        cageProvided: true,
        feedingSchedule: true,
        medicationNotes: true,
        handlingInstructions: true
      }
    },
    veterinary: {
      allowed: true,
      consultationType: "small_animal",
      autoPricing: true,
      staffApproval: "normal",
      message: "This pet may require small animal/exotic veterinary care."
    },
    grooming: {
      allowed: false,
      autoPricing: false,
      staffApproval: "required",
      message: "Grooming service is not available for the selected pet species."
    }
  },
  "Bird": {
    category: "exotic",
    petHotel: {
      allowed: true,
      autoPricing: false,
      staffApproval: "required",
      message: "This pet may require special handling. The request will be reviewed by staff before approval.",
      specialCare: {
        cageProvided: true,
        feedingSchedule: true,
        medicationNotes: true,
        handlingInstructions: true
      }
    },
    veterinary: {
      allowed: true,
      consultationType: "exotic",
      autoPricing: true,
      staffApproval: "normal",
      message: "This pet may require exotic veterinary care."
    },
    grooming: {
      allowed: false,
      autoPricing: false,
      staffApproval: "required",
      message: "Grooming service is not available for the selected pet species."
    }
  },
  "Hamster": {
    category: "small_animal",
    petHotel: {
      allowed: true,
      autoPricing: false,
      staffApproval: "required",
      message: "This pet may require special handling. The request will be reviewed by staff before approval.",
      specialCare: {
        cageProvided: true,
        feedingSchedule: true,
        medicationNotes: true,
        handlingInstructions: true
      }
    },
    veterinary: {
      allowed: true,
      consultationType: "small_animal",
      autoPricing: true,
      staffApproval: "normal",
      message: "This pet may require small animal/exotic veterinary care."
    },
    grooming: {
      allowed: false,
      autoPricing: false,
      staffApproval: "required",
      message: "Grooming service is not available for the selected pet species."
    }
  },
  "Fish": {
    category: "aquatic",
    petHotel: {
      allowed: false,
      autoPricing: false,
      staffApproval: "required",
      message: "Standard pet hotel boarding is currently available for dogs and cats only. Fish require aquatic care and must be reviewed manually.",
      specialRequestOnly: true
    },
    veterinary: {
      allowed: true,
      consultationType: "aquatic",
      autoPricing: false,
      staffApproval: "required",
      message: "This pet requires aquatic veterinary consultation. Availability may depend on veterinarian review."
    },
    grooming: {
      allowed: false,
      autoPricing: false,
      staffApproval: "required",
      message: "Grooming service is not available for the selected pet species."
    }
  },
  "Reptile": {
    category: "reptile",
    petHotel: {
      allowed: false,
      autoPricing: false,
      staffApproval: "required",
      message: "Standard pet hotel boarding is currently available for dogs and cats only. Reptiles require special enclosure, temperature, and handling requirements.",
      specialRequestOnly: true
    },
    veterinary: {
      allowed: true,
      consultationType: "reptile",
      autoPricing: false,
      staffApproval: "required",
      message: "This pet requires reptile/exotic veterinary consultation. Availability may depend on veterinarian review."
    },
    grooming: {
      allowed: false,
      autoPricing: false,
      staffApproval: "required",
      message: "Grooming service is not available for the selected pet species."
    }
  },
  "Other": {
    category: "custom",
    petHotel: {
      allowed: false,
      autoPricing: false,
      staffApproval: "required",
      message: "This pet requires staff review for hotel boarding. Please submit a special care request.",
      specialRequestOnly: true
    },
    veterinary: {
      allowed: true,
      consultationType: "custom",
      autoPricing: false,
      staffApproval: "required",
      message: "This pet requires staff review for veterinary consultation."
    },
    grooming: {
      allowed: false,
      autoPricing: false,
      staffApproval: "required",
      message: "Grooming service is not available for the selected pet species."
    }
  }
};

/**
 * Get service rules for a specific species
 * @param {string} species - The species to get rules for
 * @returns {object} Service rules for the species
 */
export const getPetServiceRules = (species) => {
  return SPECIES_SERVICE_RULES[species] || SPECIES_SERVICE_RULES["Other"];
};

/**
 * Check if pet can book hotel service
 * @param {string} species - Pet species
 * @returns {boolean} True if hotel booking is allowed
 */
export const canBookHotel = (species) => {
  return getPetServiceRules(species).petHotel.allowed;
};

/**
 * Check if pet can book veterinary service
 * @param {string} species - Pet species
 * @returns {boolean} True if veterinary booking is allowed
 */
export const canBookVeterinary = (species) => {
  return getPetServiceRules(species).veterinary.allowed;
};

/**
 * Check if pet can book grooming service
 * @param {string} species - Pet species
 * @returns {boolean} True if grooming booking is allowed
 */
export const canBookGrooming = (species) => {
  return getPetServiceRules(species).grooming.allowed;
};

/**
 * Check if service requires staff approval
 * @param {string} species - Pet species
 * @param {string} serviceType - Type of service (petHotel, veterinary, grooming)
 * @returns {boolean} True if staff approval is required
 */
export const requiresStaffApproval = (species, serviceType) => {
  const rules = getPetServiceRules(species);
  const serviceRules = rules[serviceType];
  return serviceRules.staffApproval === "required";
};

/**
 * Check if service requires manual quotation
 * @param {string} species - Pet species
 * @param {string} serviceType - Type of service (petHotel, veterinary, grooming)
 * @returns {boolean} True if manual quotation is required
 */
export const requiresManualQuotation = (species, serviceType) => {
  const rules = getPetServiceRules(species);
  const serviceRules = rules[serviceType];
  return !serviceRules.autoPricing;
};

/**
 * Get unavailable service message
 * @param {string} species - Pet species
 * @param {string} serviceType - Type of service (petHotel, veterinary, grooming)
 * @returns {string} Message explaining why service is unavailable
 */
export const getUnavailableServiceMessage = (species, serviceType) => {
  const rules = getPetServiceRules(species);
  const serviceRules = rules[serviceType];
  return serviceRules.message || "Service is not available for this pet species.";
};

/**
 * Get special care warning for service
 * @param {string} species - Pet species
 * @param {string} serviceType - Type of service (petHotel, veterinary, grooming)
 * @returns {string} Warning message about special care requirements
 */
export const getSpecialCareWarning = (species, serviceType) => {
  const rules = getPetServiceRules(species);
  const serviceRules = rules[serviceType];
  return serviceRules.message || "";
};

/**
 * Get consultation type for veterinary service
 * @param {string} species - Pet species
 * @returns {string} Consultation type (standard, small_animal, exotic, aquatic, reptile, custom)
 */
export const getVeterinaryConsultationType = (species) => {
  const rules = getPetServiceRules(species);
  return rules.veterinary.consultationType;
};

/**
 * Check if hotel booking requires special care notes
 * @param {string} species - Pet species
 * @returns {object} Special care requirements object
 */
export const getHotelSpecialCareRequirements = (species) => {
  const rules = getPetServiceRules(species);
  return rules.petHotel.specialCare || {};
};

/**
 * Check if hotel booking is special request only
 * @param {string} species - Pet species
 * @returns {boolean} True if only special requests are allowed
 */
export const isHotelSpecialRequestOnly = (species) => {
  const rules = getPetServiceRules(species);
  return rules.petHotel.specialRequestOnly || false;
};

/**
 * Get species category badge information
 * @param {string} species - Pet species
 * @returns {object} Category badge info
 */

export const getSpeciesCategoryBadge = (species) => {
  const categories = {
    'dog': { label: 'Dog', color: 'blue' },
    'cat': { label: 'Cat', color: 'orange' },
    'bird': { label: 'Bird', color: 'purple' },
    'reptile': { label: 'Reptile', color: 'green' },
    'amphibian': { label: 'Amphibian', color: 'teal' },
    'fish': { label: 'Fish', color: 'cyan' },
    'exotic': { label: 'Exotic', color: 'magenta' },
  };
  return categories[species?.toLowerCase()] || { label: 'Unknown', color: 'gray' };
};

/**
 * Validate service compatibility
 * @param {string} species - Pet species
 * @param {string} serviceType - Type of service
 * @returns {object} Validation result with isValid and message
 */
export const validateServiceCompatibility = (species, serviceType) => {
  const rules = getPetServiceRules(species);
  const serviceRules = rules[serviceType];
  
  const isValid = serviceRules?.allowed !== false;
  const requiresApproval = serviceRules?.staffApproval === 'required';
  const requiresManualQuote = serviceRules?.manualQuotation === true;
  
  return {
    isValid,
    requiresApproval,
    requiresManualQuote,
    message: isValid ? null : serviceRules?.message || 'This service is not available for this pet species.'
  };
};

export default {
  SPECIES_SERVICE_RULES,
  getPetServiceRules,
  canBookHotel,
  canBookVeterinary,
  canBookGrooming,
  requiresStaffApproval,
  requiresManualQuotation,
  getSpeciesCategoryBadge,
  validateServiceCompatibility,
  getVeterinaryConsultationType,
  getSpecialCareWarning,
  getHotelSpecialCareRequirements,
  isHotelSpecialRequestOnly
};
