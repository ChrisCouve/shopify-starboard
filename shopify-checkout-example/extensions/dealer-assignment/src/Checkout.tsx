import React, { useState, useEffect } from 'react';
import {
  Banner,
  BlockStack,
  Button,
  Checkbox,
  ChoiceList,
  Divider,
  Grid,
  GridItem,
  Heading,
  InlineLayout,
  Text,
  TextField,
  View,
  useApi,
  useApplyAttributeChange,
  useCartLines,
  useShippingAddress,
  useCustomer,
  reactExtension,
} from '@shopify/checkout-ui-extensions-react';

import { DealerSelector } from './DealerSelector';
import { ConsultationBooking } from './ConsultationBooking';

interface Dealer {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  specialties: string[];
  certifications: string[];
  distance?: number;
  rating: number;
  reviewCount: number;
  isAuthorized: boolean;
  supportedProducts: string[];
  consultationAvailable: boolean;
  languages: string[];
}

interface ConsultationRequest {
  type: 'product_selection' | 'technical_setup' | 'skill_assessment' | 'local_conditions';
  preferredDate: string;
  preferredTime: string;
  contactMethod: 'phone' | 'email' | 'video_call';
  notes: string;
}

export default reactExtension('purchase.checkout.block.render', () => <CheckoutExtension />);

function CheckoutExtension() {
  const { query, i18n } = useApi();
  const cartLines = useCartLines();
  const shippingAddress = useShippingAddress();
  const customer = useCustomer();
  const applyAttributeChange = useApplyAttributeChange();

  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);
  const [consultationRequest, setConsultationRequest] = useState<ConsultationRequest | null>(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [setupPreference, setSetupPreference] = useState<string>('');
  const [agreesToTerms, setAgreesToTerms] = useState(false);

  // Determine product categories in cart
  const productCategories = cartLines.reduce((categories: Set<string>, line) => {
    const productType = line.merchandise.product?.productType?.toLowerCase() || '';
    if (productType.includes('windsurf') || productType.includes('wind')) {
      categories.add('windsurf');
    } else if (productType.includes('sup') || productType.includes('paddle')) {
      categories.add('sup');
    } else if (productType.includes('wing') || productType.includes('foil')) {
      categories.add('wingfoil');
    }
    return categories;
  }, new Set<string>());

  const categoriesArray = Array.from(productCategories);

  // Load dealers based on location and product categories
  useEffect(() => {
    const loadDealers = async () => {
      if (!shippingAddress?.countryCode) return;

      setLoading(true);
      try {
        // In a real implementation, this would call your backend API
        const mockDealers: Dealer[] = [
          {
            id: 'dealer_1',
            name: 'Pacific Windsurf Center',
            address: '123 Ocean Blvd',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
            zipCode: '94105',
            phone: '+1-415-555-0123',
            email: 'info@pacificwindsurf.com',
            website: 'https://pacificwindsurf.com',
            specialties: ['windsurf', 'wingfoil'],
            certifications: ['Starboard Certified', 'IWA Instructor'],
            distance: 2.5,
            rating: 4.8,
            reviewCount: 127,
            isAuthorized: true,
            supportedProducts: ['windsurf', 'wingfoil'],
            consultationAvailable: true,
            languages: ['English', 'Spanish']
          },
          {
            id: 'dealer_2',
            name: 'Bay Area SUP Shop',
            address: '456 Marina Way',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
            zipCode: '94123',
            phone: '+1-415-555-0456',
            email: 'contact@bayareasup.com',
            specialties: ['sup', 'wingfoil'],
            certifications: ['SUP Instructor Alliance', 'Starboard Authorized'],
            distance: 4.2,
            rating: 4.6,
            reviewCount: 89,
            isAuthorized: true,
            supportedProducts: ['sup', 'wingfoil'],
            consultationAvailable: true,
            languages: ['English']
          },
          {
            id: 'dealer_3',
            name: 'Complete Watersports',
            address: '789 Surf Street',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
            zipCode: '94110',
            phone: '+1-415-555-0789',
            email: 'support@completewatersports.com',
            website: 'https://completewatersports.com',
            specialties: ['windsurf', 'sup', 'wingfoil'],
            certifications: ['Starboard Master Dealer', 'IWA Certified', 'SUP Instructor'],
            distance: 6.8,
            rating: 4.9,
            reviewCount: 203,
            isAuthorized: true,
            supportedProducts: ['windsurf', 'sup', 'wingfoil'],
            consultationAvailable: true,
            languages: ['English', 'French', 'German']
          }
        ];

        // Filter dealers based on product categories
        const filteredDealers = mockDealers.filter(dealer => 
          categoriesArray.some(category => dealer.supportedProducts.includes(category))
        );

        setDealers(filteredDealers);
      } catch (error) {
        console.error('Error loading dealers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDealers();
  }, [shippingAddress?.countryCode, categoriesArray.join(',')]);

  // Apply attributes to order when dealer or consultation changes
  useEffect(() => {
    const attributes = [];

    if (selectedDealer) {
      attributes.push({
        key: 'assigned_dealer_id',
        value: selectedDealer.id
      });
      attributes.push({
        key: 'assigned_dealer_name',
        value: selectedDealer.name
      });
      attributes.push({
        key: 'assigned_dealer_contact',
        value: `${selectedDealer.phone} | ${selectedDealer.email}`
      });
    }

    if (consultationRequest) {
      attributes.push({
        key: 'consultation_requested',
        value: 'true'
      });
      attributes.push({
        key: 'consultation_type',
        value: consultationRequest.type
      });
      attributes.push({
        key: 'consultation_date',
        value: consultationRequest.preferredDate
      });
      attributes.push({
        key: 'consultation_time',
        value: consultationRequest.preferredTime
      });
      attributes.push({
        key: 'consultation_method',
        value: consultationRequest.contactMethod
      });
      if (consultationRequest.notes) {
        attributes.push({
          key: 'consultation_notes',
          value: consultationRequest.notes
        });
      }
    }

    if (deliveryInstructions) {
      attributes.push({
        key: 'delivery_instructions',
        value: deliveryInstructions
      });
    }

    if (setupPreference) {
      attributes.push({
        key: 'equipment_setup_preference',
        value: setupPreference
      });
    }

    if (attributes.length > 0) {
      applyAttributeChange({
        key: 'dealer_assignment_data',
        value: JSON.stringify({
          dealerId: selectedDealer?.id,
          dealerName: selectedDealer?.name,
          consultation: consultationRequest,
          deliveryInstructions,
          setupPreference,
          timestamp: new Date().toISOString()
        })
      });
    }
  }, [selectedDealer, consultationRequest, deliveryInstructions, setupPreference, applyAttributeChange]);

  const handleDealerSelect = (dealer: Dealer) => {
    setSelectedDealer(dealer);
    setShowConsultation(dealer.consultationAvailable);
  };

  const handleConsultationRequest = (request: ConsultationRequest) => {
    setConsultationRequest(request);
  };

  const getProductCategoryText = () => {
    if (categoriesArray.length === 0) return 'watersports equipment';
    if (categoriesArray.length === 1) {
      return categoriesArray[0] === 'sup' ? 'paddleboard' : categoriesArray[0] + ' equipment';
    }
    return categoriesArray.join(', ') + ' equipment';
  };

  if (loading) {
    return (
      <View padding="base">
        <BlockStack spacing="base">
          <Heading level={2}>🏄‍♂️ Loading Dealer Options...</Heading>
          <Text>Finding authorized Starboard dealers near you...</Text>
        </BlockStack>
      </View>
    );
  }

  if (dealers.length === 0) {
    return (
      <View padding="base">
        <Banner status="info">
          <BlockStack spacing="base">
            <Heading level={2}>🌊 Dealer Assignment</Heading>
            <Text>
              No authorized Starboard dealers found in your area for {getProductCategoryText()}. 
              Your order will be processed directly through our fulfillment center.
            </Text>
            <Text size="small">
              For expert advice, you can still contact our customer service team at support@star-board.com
            </Text>
          </BlockStack>
        </Banner>
      </View>
    );
  }

  return (
    <View padding="base">
      <BlockStack spacing="large">
        {/* Header */}
        <BlockStack spacing="base">
          <Heading level={2}>🏄‍♂️ Choose Your Starboard Expert</Heading>
          <Text>
            Connect with an authorized Starboard dealer for expert advice and local support 
            with your {getProductCategoryText()}.
          </Text>
        </BlockStack>

        {/* Dealer Selection */}
        <DealerSelector
          dealers={dealers}
          selectedDealer={selectedDealer}
          onDealerSelect={handleDealerSelect}
          productCategories={categoriesArray}
        />

        {/* Consultation Booking */}
        {selectedDealer && showConsultation && (
          <BlockStack spacing="base">
            <Divider />
            <ConsultationBooking
              dealer={selectedDealer}
              onConsultationRequest={handleConsultationRequest}
              productCategories={categoriesArray}
            />
          </BlockStack>
        )}

        {/* Delivery Instructions */}
        <BlockStack spacing="base">
          <Divider />
          <Heading level={3}>📦 Special Delivery Instructions</Heading>
          <TextField
            label="Delivery Notes (Optional)"
            value={deliveryInstructions}
            onChange={setDeliveryInstructions}
            placeholder="Any special instructions for delivering your watersports equipment..."
            multiline={3}
          />
        </BlockStack>

        {/* Setup Preferences */}
        <BlockStack spacing="base">
          <Heading level={3}>🔧 Equipment Setup</Heading>
          <ChoiceList
            name="setupPreference"
            value={setupPreference}
            onChange={setSetupPreference}
            choices={[
              { id: 'self_setup', label: 'I\'ll set up the equipment myself' },
              { id: 'dealer_setup', label: 'I\'d like dealer assistance with setup', disabled: !selectedDealer },
              { id: 'consultation_setup', label: 'I want a consultation about setup options' }
            ]}
          />
        </BlockStack>

        {/* Terms Agreement */}
        {selectedDealer && (
          <BlockStack spacing="base">
            <Divider />
            <Checkbox
              id="dealer-terms"
              checked={agreesToTerms}
              onChange={setAgreesToTerms}
            >
              I agree to be contacted by the selected dealer for order coordination and support
            </Checkbox>
          </BlockStack>
        )}

        {/* Summary Banner */}
        {selectedDealer && (
          <Banner status="success">
            <BlockStack spacing="tight">
              <Text emphasis="bold">✅ Dealer Assigned: {selectedDealer.name}</Text>
              <Text size="small">
                Your order will be coordinated with {selectedDealer.name} for expert local support.
                {consultationRequest && ` A ${consultationRequest.type.replace('_', ' ')} consultation has been requested.`}
              </Text>
            </BlockStack>
          </Banner>
        )}
      </BlockStack>
    </View>
  );
}