# Starboard Watersports Shopify Plus Checkout with Dealer Assignment

This project demonstrates a custom Shopify Plus checkout experience for watersports equipment (windsurf boards, paddleboards, wingfoil wings) with the ability for customers to assign a dealer or shop during checkout.

## Features

- **Dealer/Shop Assignment**: Customers can select from a list of authorized dealers or shops during checkout
- **Product-Specific Logic**: Different dealer options based on product categories (windsurf, SUP, wingfoil)
- **Geolocation Support**: Automatic dealer suggestions based on customer location
- **Expert Consultation**: Option to schedule product consultation with selected dealer
- **Custom Fields**: Collection of dealer preferences, delivery instructions, and consultation requests
- **Validation**: Ensures selected dealer can service the chosen products
- **Professional Branding**: Matches Starboard's blue and eco-friendly design aesthetic

## Technology Stack

- **Shopify Plus** with Checkout Extensibility
- **Checkout UI Extensions** for custom components
- **Shopify Functions** for validation and business logic
- **React/TypeScript** for the frontend extensions
- **Branding API** for consistent design

## Project Structure

```
shopify-checkout-example/
├── README.md
├── extensions/
│   ├── dealer-assignment/
│   │   ├── src/
│   │   │   ├── Checkout.tsx
│   │   │   ├── DealerSelector.tsx
│   │   │   ├── ConsultationBooking.tsx
│   │   │   └── index.ts
│   │   ├── shopify.extension.toml
│   │   └── package.json
│   └── dealer-validation/
│       ├── src/
│       │   └── index.ts
│       └── shopify.extension.toml
├── web/
│   ├── frontend/
│   │   ├── components/
│   │   │   ├── CheckoutPreview.tsx
│   │   │   └── DealerManagement.tsx
│   │   └── styles/
│   │       └── starboard-theme.css
│   └── backend/
│       ├── routes/
│       │   ├── dealers.js
│       │   └── consultations.js
│       └── services/
│           ├── geolocation.js
│           └── dealerService.js
├── docs/
│   ├── installation.md
│   ├── configuration.md
│   └── api-reference.md
└── package.json
```

## Installation & Setup

1. **Prerequisites**
   - Shopify Plus store
   - Shopify CLI installed
   - Node.js 16+ and npm/yarn

2. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd shopify-checkout-example
   npm install
   ```

3. **Configure Shopify App**
   ```bash
   shopify app dev
   ```

4. **Install Extensions**
   ```bash
   shopify app deploy
   ```

## Key Components

### 1. Dealer Assignment Extension
- **Location**: `Checkout::Dynamic::Render`
- **Purpose**: Allows customers to select authorized dealers/shops
- **Features**: Geolocation-based suggestions, product compatibility checking

### 2. Consultation Booking
- **Integration**: Embedded within dealer selection
- **Purpose**: Schedule expert consultation calls
- **Data**: Collects preferred time, consultation type, contact method

### 3. Validation Function
- **Type**: Cart and Checkout Validation
- **Purpose**: Ensures dealer can service selected products
- **Logic**: Product category matching, geographic coverage validation

### 4. Custom Fields
- **Delivery Instructions**: Special handling for watersports equipment
- **Dealer Notes**: Customer preferences and requirements
- **Equipment Setup**: Installation and setup preferences

## Business Logic

### Dealer Assignment Rules
- **Windsurf Boards**: Authorized windsurf retailers only
- **Paddleboards**: SUP specialists and general dealers
- **Wingfoil Equipment**: Specialized wingfoil dealers preferred
- **Geographic Coverage**: Dealers limited by service area

### Consultation Types
- **Product Selection**: Help choosing the right equipment
- **Technical Setup**: Installation and rigging guidance  
- **Skill Assessment**: Matching products to skill level
- **Local Conditions**: Equipment recommendations for local waters

## Customization Options

### Merchant Configuration
- Upload dealer database (CSV/API)
- Set geographic boundaries
- Configure consultation availability
- Customize validation rules

### Customer Experience
- Automatic dealer suggestions
- Manual dealer search
- Consultation scheduling
- Special delivery instructions

## API Integration

### Geolocation Service
```javascript
// Get dealer suggestions based on customer location
GET /api/dealers/nearby?lat={lat}&lng={lng}&category={category}
```

### Consultation Booking
```javascript
// Schedule consultation with selected dealer
POST /api/consultations/book
{
  "dealerId": "dealer_123",
  "customerId": "customer_456", 
  "consultationType": "product_selection",
  "preferredTime": "2024-01-15T14:00:00Z"
}
```

## Styling & Branding

The checkout maintains Starboard's distinctive brand identity:
- **Colors**: Ocean blue (#0066CC), Eco green (#00B386)
- **Typography**: Modern, clean fonts matching the main site
- **Layout**: Minimalist design emphasizing sustainability
- **Icons**: Water-themed iconography

## Testing

### Test Scenarios
1. **Geographic Assignment**: Test dealer suggestions for different locations
2. **Product Validation**: Verify dealer-product compatibility
3. **Consultation Flow**: End-to-end booking process
4. **Mobile Experience**: Responsive design testing
5. **Performance**: Load testing with large dealer databases

### Test Data
- Sample dealer database with global coverage
- Mock product catalog with all Starboard categories
- Test consultation availability schedules

## Deployment

1. **Staging Environment**
   ```bash
   shopify app deploy --environment=staging
   ```

2. **Production Deployment**
   ```bash
   shopify app deploy --environment=production
   ```

3. **Merchant Configuration**
   - Upload dealer data via admin interface
   - Configure geographic regions
   - Set up consultation calendars
   - Test checkout flow

## Analytics & Monitoring

### Key Metrics
- Dealer assignment completion rate
- Consultation booking conversion
- Geographic distribution of orders
- Customer satisfaction with dealer experience

### Tracking Implementation
- Custom events for dealer selection
- Consultation funnel analysis  
- Geographic performance monitoring
- A/B testing framework for dealer presentation

## Support & Documentation

- **Merchant Guide**: Step-by-step setup instructions
- **Customer FAQ**: Common questions about dealer assignment
- **Developer API**: Technical implementation details
- **Troubleshooting**: Common issues and solutions

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions about this implementation or Starboard's watersports equipment:
- **Technical Support**: dev@star-board.com
- **Business Inquiries**: sales@star-board.com
- **Documentation**: [Starboard Developer Portal](https://developers.star-board.com)