import React, { useState } from 'react';
import {
  Badge,
  BlockStack,
  Button,
  Card,
  Grid,
  GridItem,
  Heading,
  InlineLayout,
  Link,
  SkeletonText,
  Text,
  TextField,
  View,
} from '@shopify/checkout-ui-extensions-react';

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

interface DealerSelectorProps {
  dealers: Dealer[];
  selectedDealer: Dealer | null;
  onDealerSelect: (dealer: Dealer) => void;
  productCategories: string[];
}

export function DealerSelector({
  dealers,
  selectedDealer,
  onDealerSelect,
  productCategories,
}: DealerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllDealers, setShowAllDealers] = useState(false);

  // Filter dealers based on search term
  const filteredDealers = dealers.filter(dealer =>
    dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort dealers by distance and rating
  const sortedDealers = filteredDealers.sort((a, b) => {
    // Prioritize dealers that support all product categories
    const aSupportsAll = productCategories.every(cat => a.supportedProducts.includes(cat));
    const bSupportsAll = productCategories.every(cat => b.supportedProducts.includes(cat));
    
    if (aSupportsAll && !bSupportsAll) return -1;
    if (!aSupportsAll && bSupportsAll) return 1;
    
    // Then sort by distance (if available) and rating
    if (a.distance && b.distance) {
      return a.distance - b.distance;
    }
    return b.rating - a.rating;
  });

  // Show only top 3 dealers by default, unless user wants to see all
  const dealersToShow = showAllDealers ? sortedDealers : sortedDealers.slice(0, 3);

  const getSpecialtyBadgeVariant = (specialty: string) => {
    const variants = {
      windsurf: 'info',
      sup: 'success', 
      wingfoil: 'warning',
    } as const;
    return variants[specialty as keyof typeof variants] || 'neutral';
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
  };

  const renderStarRating = (rating: number) => {
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    return `${stars} ${rating.toFixed(1)}`;
  };

  const getProductCompatibilityText = (dealer: Dealer) => {
    const supportedCategories = productCategories.filter(cat => 
      dealer.supportedProducts.includes(cat)
    );
    const unsupportedCategories = productCategories.filter(cat => 
      !dealer.supportedProducts.includes(cat)
    );

    if (unsupportedCategories.length === 0) {
      return { text: 'Supports all your products', status: 'success' as const };
    } else {
      return { 
        text: `Supports ${supportedCategories.join(', ')} only`, 
        status: 'warning' as const 
      };
    }
  };

  return (
    <BlockStack spacing="base">
      <Heading level={3}>🏪 Available Dealers</Heading>
      
      {/* Search */}
      <TextField
        label="Search dealers"
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search by name, location, or specialty..."
      />

      {/* Dealers Grid */}
      {dealersToShow.length === 0 ? (
        <Text>No dealers found matching your search criteria.</Text>
      ) : (
        <BlockStack spacing="base">
          {dealersToShow.map((dealer) => {
            const isSelected = selectedDealer?.id === dealer.id;
            const compatibility = getProductCompatibilityText(dealer);
            
            return (
              <Card key={dealer.id} padding="base">
                <BlockStack spacing="base">
                  {/* Dealer Header */}
                  <InlineLayout
                    spacing="base"
                    blockAlignment="center"
                    columns={['auto', 'fill', 'auto']}
                  >
                    <View>
                      <BlockStack spacing="extraTight">
                        <Heading level={4}>{dealer.name}</Heading>
                        <Text size="small" appearance="subdued">
                          {dealer.address}, {dealer.city}, {dealer.state} {dealer.zipCode}
                        </Text>
                      </BlockStack>
                    </View>
                    
                    <View />
                    
                    <View>
                      <BlockStack spacing="extraTight">
                        {dealer.distance && (
                          <Text size="small" emphasis="bold">
                            📍 {formatDistance(dealer.distance)} away
                          </Text>
                        )}
                        <Text size="small">
                          {renderStarRating(dealer.rating)} ({dealer.reviewCount} reviews)
                        </Text>
                      </BlockStack>
                    </View>
                  </InlineLayout>

                  {/* Dealer Details */}
                  <Grid
                    columns={['fill', 'fill']}
                    spacing="base"
                  >
                    <GridItem>
                      <BlockStack spacing="extraTight">
                        <Text size="small" emphasis="bold">Contact</Text>
                        <Text size="small">{dealer.phone}</Text>
                        <Text size="small">{dealer.email}</Text>
                        {dealer.website && (
                          <Link to={dealer.website} external>
                            <Text size="small">Visit Website</Text>
                          </Link>
                        )}
                      </BlockStack>
                    </GridItem>
                    
                    <GridItem>
                      <BlockStack spacing="extraTight">
                        <Text size="small" emphasis="bold">Services</Text>
                        <InlineLayout spacing="extraTight">
                          {dealer.specialties.map((specialty) => (
                            <Badge
                              key={specialty}
                              tone={getSpecialtyBadgeVariant(specialty)}
                            >
                              {specialty.toUpperCase()}
                            </Badge>
                          ))}
                        </InlineLayout>
                        {dealer.consultationAvailable && (
                          <Text size="small">💬 Consultation available</Text>
                        )}
                      </BlockStack>
                    </GridItem>
                  </Grid>

                  {/* Certifications */}
                  {dealer.certifications.length > 0 && (
                    <BlockStack spacing="extraTight">
                      <Text size="small" emphasis="bold">Certifications</Text>
                      <InlineLayout spacing="extraTight">
                        {dealer.certifications.map((cert) => (
                          <Badge key={cert} tone="neutral">
                            {cert}
                          </Badge>
                        ))}
                      </InlineLayout>
                    </BlockStack>
                  )}

                  {/* Product Compatibility */}
                  <BlockStack spacing="extraTight">
                    <Badge tone={compatibility.status}>
                      {compatibility.text}
                    </Badge>
                  </BlockStack>

                  {/* Languages */}
                  {dealer.languages.length > 1 && (
                    <Text size="small">
                      🗣️ Languages: {dealer.languages.join(', ')}
                    </Text>
                  )}

                  {/* Selection Button */}
                  <Button
                    kind={isSelected ? "primary" : "secondary"}
                    onPress={() => onDealerSelect(dealer)}
                    accessibilityLabel={`${isSelected ? 'Selected' : 'Select'} ${dealer.name} as your dealer`}
                  >
                    {isSelected ? '✅ Selected' : 'Choose This Dealer'}
                  </Button>
                </BlockStack>
              </Card>
            );
          })}
        </BlockStack>
      )}

      {/* Show More/Less Button */}
      {sortedDealers.length > 3 && (
        <InlineLayout blockAlignment="center">
          <Button
            kind="plain"
            onPress={() => setShowAllDealers(!showAllDealers)}
          >
            {showAllDealers 
              ? `Show Less (${sortedDealers.length - 3} hidden)` 
              : `Show All ${sortedDealers.length} Dealers`
            }
          </Button>
        </InlineLayout>
      )}

      {/* Info Banner */}
      {filteredDealers.length > 0 && (
        <View border="base" padding="base" cornerRadius="base">
          <BlockStack spacing="extraTight">
            <Text size="small" emphasis="bold">ℹ️ About Starboard Dealers</Text>
            <Text size="small">
              All listed dealers are authorized Starboard partners trained to provide 
              expert advice on equipment selection, setup, and local conditions. 
              Your order will be coordinated with your chosen dealer for the best 
              possible customer experience.
            </Text>
          </BlockStack>
        </View>
      )}
    </BlockStack>
  );
}