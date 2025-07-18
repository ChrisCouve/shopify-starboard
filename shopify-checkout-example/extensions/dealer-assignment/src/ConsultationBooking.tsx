import React, { useState, useEffect } from 'react';
import {
  Banner,
  BlockStack,
  Button,
  ChoiceList,
  DateField,
  Heading,
  InlineLayout,
  Select,
  Text,
  TextField,
  ToggleButton,
  View,
} from '@shopify/checkout-ui-extensions-react';
import { format, addDays, isWeekend, startOfTomorrow } from 'date-fns';

interface Dealer {
  id: string;
  name: string;
  phone: string;
  email: string;
  languages: string[];
  consultationAvailable: boolean;
}

interface ConsultationRequest {
  type: 'product_selection' | 'technical_setup' | 'skill_assessment' | 'local_conditions';
  preferredDate: string;
  preferredTime: string;
  contactMethod: 'phone' | 'email' | 'video_call';
  notes: string;
}

interface ConsultationBookingProps {
  dealer: Dealer;
  onConsultationRequest: (request: ConsultationRequest) => void;
  productCategories: string[];
}

export function ConsultationBooking({
  dealer,
  onConsultationRequest,
  productCategories,
}: ConsultationBookingProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [consultationType, setConsultationType] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [contactMethod, setContactMethod] = useState<string>('phone');
  const [notes, setNotes] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Generate available dates (next 14 days, excluding weekends)
  const getAvailableDates = () => {
    const dates = [];
    let currentDate = startOfTomorrow();
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(currentDate, i);
      if (!isWeekend(date)) {
        dates.push({
          value: format(date, 'yyyy-MM-dd'),
          label: format(date, 'EEEE, MMMM d')
        });
      }
    }
    return dates;
  };

  // Generate time slots based on dealer availability
  const generateTimeSlots = (date: string) => {
    // Mock dealer availability - in real implementation, this would call an API
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    // Filter out already booked slots (mock logic)
    const availableSlots = timeSlots.filter((time, index) => {
      // Mock: remove some random slots to simulate bookings
      return Math.random() > 0.3;
    });

    return availableSlots;
  };

  useEffect(() => {
    if (preferredDate) {
      const slots = generateTimeSlots(preferredDate);
      setAvailableTimeSlots(slots);
      if (preferredTime && !slots.includes(preferredTime)) {
        setPreferredTime('');
      }
    }
  }, [preferredDate]);

  const handleBookConsultation = () => {
    if (!consultationType || !preferredDate || !preferredTime || !contactMethod) {
      return;
    }

    const request: ConsultationRequest = {
      type: consultationType as ConsultationRequest['type'],
      preferredDate,
      preferredTime,
      contactMethod: contactMethod as ConsultationRequest['contactMethod'],
      notes,
    };

    onConsultationRequest(request);
    setIsExpanded(false);
  };

  const getConsultationTypeOptions = () => {
    const baseOptions = [
      {
        id: 'product_selection',
        label: '🎯 Product Selection',
        helpText: 'Get help choosing the right equipment for your skill level and local conditions'
      },
      {
        id: 'technical_setup',
        label: '🔧 Technical Setup',
        helpText: 'Learn how to properly set up and tune your equipment'
      },
      {
        id: 'skill_assessment',
        label: '📊 Skill Assessment', 
        helpText: 'Get personalized recommendations based on your current abilities'
      },
      {
        id: 'local_conditions',
        label: '🌊 Local Conditions',
        helpText: 'Learn about the best spots and conditions in your area'
      }
    ];

    return baseOptions;
  };

  const getContactMethodOptions = () => [
    { value: 'phone', label: `📞 Phone Call (${dealer.phone})` },
    { value: 'email', label: `📧 Email Exchange (${dealer.email})` },
    { value: 'video_call', label: '💻 Video Call (Zoom/Teams)' }
  ];

  const availableDates = getAvailableDates();

  if (!dealer.consultationAvailable) {
    return null;
  }

  return (
    <BlockStack spacing="base">
      <InlineLayout
        spacing="base"
        blockAlignment="center"
        columns={['fill', 'auto']}
      >
        <BlockStack spacing="extraTight">
          <Heading level={3}>💬 Book Expert Consultation</Heading>
          <Text size="small" appearance="subdued">
            Schedule a consultation with {dealer.name} for personalized advice
          </Text>
        </BlockStack>
        
        <ToggleButton
          pressed={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          accessibilityLabel="Toggle consultation booking form"
        >
          {isExpanded ? 'Cancel' : 'Book Now'}
        </ToggleButton>
      </InlineLayout>

      {isExpanded && (
        <View border="base" padding="base" cornerRadius="base">
          <BlockStack spacing="base">
            {/* Consultation Type */}
            <BlockStack spacing="tight">
              <Text emphasis="bold">What type of consultation do you need?</Text>
              <ChoiceList
                name="consultationType"
                value={consultationType}
                onChange={setConsultationType}
                choices={getConsultationTypeOptions()}
              />
            </BlockStack>

            {/* Date Selection */}
            <BlockStack spacing="tight">
              <Text emphasis="bold">Preferred Date</Text>
              <Select
                label="Choose a date"
                value={preferredDate}
                onChange={setPreferredDate}
                options={[
                  { value: '', label: 'Select a date...' },
                  ...availableDates
                ]}
              />
            </BlockStack>

            {/* Time Selection */}
            {preferredDate && (
              <BlockStack spacing="tight">
                <Text emphasis="bold">Preferred Time</Text>
                {availableTimeSlots.length > 0 ? (
                  <Select
                    label="Choose a time"
                    value={preferredTime}
                    onChange={setPreferredTime}
                    options={[
                      { value: '', label: 'Select a time...' },
                      ...availableTimeSlots.map(time => ({
                        value: time,
                        label: time
                      }))
                    ]}
                  />
                ) : (
                  <Banner status="warning">
                    <Text>No available time slots for this date. Please choose another date.</Text>
                  </Banner>
                )}
              </BlockStack>
            )}

            {/* Contact Method */}
            <BlockStack spacing="tight">
              <Text emphasis="bold">How would you like to connect?</Text>
              <ChoiceList
                name="contactMethod"
                value={contactMethod}
                onChange={setContactMethod}
                choices={getContactMethodOptions()}
              />
            </BlockStack>

            {/* Additional Notes */}
            <BlockStack spacing="tight">
              <TextField
                label="Additional Notes (Optional)"
                value={notes}
                onChange={setNotes}
                placeholder="Any specific questions or topics you'd like to discuss..."
                multiline={3}
              />
            </BlockStack>

            {/* Dealer Languages */}
            {dealer.languages.length > 1 && (
              <Banner status="info">
                <Text size="small">
                  🗣️ {dealer.name} can provide consultations in: {dealer.languages.join(', ')}
                </Text>
              </Banner>
            )}

            {/* Product Categories Context */}
            {productCategories.length > 0 && (
              <Banner status="info">
                <Text size="small">
                  📋 This consultation will focus on your {productCategories.join(', ')} equipment
                </Text>
              </Banner>
            )}

            {/* Book Button */}
            <Button
              kind="primary"
              onPress={handleBookConsultation}
              disabled={!consultationType || !preferredDate || !preferredTime || !contactMethod}
              accessibilityLabel="Book consultation with dealer"
            >
              📅 Book Consultation
            </Button>

            {/* Disclaimer */}
            <View border="base" padding="tight" cornerRadius="base">
              <Text size="small" appearance="subdued">
                ℹ️ Your consultation request will be sent to {dealer.name}. 
                They will contact you within 24 hours to confirm the appointment. 
                Consultations are complimentary for Starboard customers.
              </Text>
            </View>
          </BlockStack>
        </View>
      )}
    </BlockStack>
  );
}