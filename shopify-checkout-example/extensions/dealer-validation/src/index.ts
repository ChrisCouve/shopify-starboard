import type {
  RunInput,
  FunctionRunResult,
  CartAndCheckoutValidationFunction,
} from '../generated/api';

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

export default function validation(input: RunInput): FunctionRunResult {
  const { cart } = input;

  // Get dealer assignment data from cart attributes
  const dealerData = cart.attributes.find(attr => 
    attr.key === 'dealer_assignment_data'
  );

  if (!dealerData?.value) {
    // No dealer assigned - this might be optional depending on configuration
    return NO_CHANGES;
  }

  try {
    const assignment = JSON.parse(dealerData.value);
    
    // Validate dealer assignment
    const validationErrors = validateDealerAssignment(cart, assignment);
    
    if (validationErrors.length > 0) {
      return {
        operations: [
          {
            hide: {
              errors: validationErrors,
            },
          },
        ],
      };
    }

    return NO_CHANGES;
  } catch (error) {
    console.error('Error parsing dealer assignment data:', error);
    return {
      operations: [
        {
          hide: {
            errors: [
              {
                message: 'Invalid dealer assignment data. Please select a dealer again.',
                target: 'cart',
              },
            ],
          },
        },
      ],
    };
  }
}

function validateDealerAssignment(cart: any, assignment: any) {
  const errors = [];

  // Check if dealer ID exists
  if (!assignment.dealerId) {
    errors.push({
      message: 'No dealer selected. Please choose an authorized Starboard dealer.',
      target: 'cart',
    });
    return errors;
  }

  // Get product categories from cart
  const productCategories = new Set<string>();
  cart.lines.forEach((line: any) => {
    const productType = line.merchandise.product?.productType?.toLowerCase() || '';
    if (productType.includes('windsurf') || productType.includes('wind')) {
      productCategories.add('windsurf');
    } else if (productType.includes('sup') || productType.includes('paddle')) {
      productCategories.add('sup');
    } else if (productType.includes('wing') || productType.includes('foil')) {
      productCategories.add('wingfoil');
    }
  });

  // Mock dealer validation - in real implementation, fetch dealer data from API
  const dealerValidation = validateDealerCapabilities(
    assignment.dealerId, 
    Array.from(productCategories)
  );

  if (!dealerValidation.isValid) {
    errors.push({
      message: dealerValidation.reason || 'Selected dealer cannot service your products.',
      target: 'cart',
    });
  }

  // Validate geographic coverage
  const shippingAddress = cart.deliveryGroups?.[0]?.deliveryAddress;
  if (shippingAddress) {
    const geographicValidation = validateGeographicCoverage(
      assignment.dealerId,
      shippingAddress
    );

    if (!geographicValidation.isValid) {
      errors.push({
        message: geographicValidation.reason || 'Selected dealer does not service your delivery area.',
        target: 'cart',
      });
    }
  }

  // Validate consultation booking if present
  if (assignment.consultation) {
    const consultationValidation = validateConsultationBooking(assignment.consultation);
    if (!consultationValidation.isValid) {
      errors.push({
        message: consultationValidation.reason || 'Invalid consultation booking.',
        target: 'cart',
      });
    }
  }

  return errors;
}

function validateDealerCapabilities(dealerId: string, productCategories: string[]) {
  // Mock dealer capabilities - in real implementation, fetch from database
  const dealerCapabilities: Record<string, string[]> = {
    'dealer_1': ['windsurf', 'wingfoil'],
    'dealer_2': ['sup', 'wingfoil'],
    'dealer_3': ['windsurf', 'sup', 'wingfoil'],
  };

  const supportedProducts = dealerCapabilities[dealerId] || [];
  const unsupportedCategories = productCategories.filter(
    category => !supportedProducts.includes(category)
  );

  if (unsupportedCategories.length > 0) {
    return {
      isValid: false,
      reason: `Selected dealer does not support ${unsupportedCategories.join(', ')} products. Please choose a different dealer.`,
    };
  }

  return { isValid: true };
}

function validateGeographicCoverage(dealerId: string, shippingAddress: any) {
  // Mock geographic validation - in real implementation, check dealer service areas
  const dealerServiceAreas: Record<string, string[]> = {
    'dealer_1': ['CA', 'OR', 'WA'], // US states
    'dealer_2': ['CA', 'NV'],
    'dealer_3': ['CA', 'OR', 'WA', 'NV', 'AZ'],
  };

  const serviceArea = dealerServiceAreas[dealerId] || [];
  const customerState = shippingAddress.province || shippingAddress.provinceCode;

  if (!serviceArea.includes(customerState)) {
    return {
      isValid: false,
      reason: `Selected dealer does not service deliveries to ${customerState}. Please choose a dealer in your area.`,
    };
  }

  return { isValid: true };
}

function validateConsultationBooking(consultation: any) {
  if (!consultation.type || !consultation.preferredDate || !consultation.preferredTime) {
    return {
      isValid: false,
      reason: 'Incomplete consultation booking information.',
    };
  }

  // Validate consultation date is in the future
  const consultationDate = new Date(consultation.preferredDate);
  const now = new Date();
  
  if (consultationDate <= now) {
    return {
      isValid: false,
      reason: 'Consultation date must be in the future.',
    };
  }

  // Validate consultation type
  const validTypes = ['product_selection', 'technical_setup', 'skill_assessment', 'local_conditions'];
  if (!validTypes.includes(consultation.type)) {
    return {
      isValid: false,
      reason: 'Invalid consultation type selected.',
    };
  }

  return { isValid: true };
}