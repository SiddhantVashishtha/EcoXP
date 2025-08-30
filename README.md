# EcoXP - Community Recycling Platform

A modern web application that encourages community recycling through a rewards system and easy pickup scheduling.

## Features

### 🏠 Landing Page
- **Google Authentication** - Quick sign-in with Google accounts
- **Email/Password Authentication** - Traditional sign-up and sign-in
- **Responsive Design** - Beautiful green-themed UI that works on all devices
- **Feature Showcase** - Highlights key app capabilities

### 📊 Dashboard
- **Recycling Pickup Scheduling** - Easy form to schedule pickups with material type, quantity, and date
- **Progress Tracking** - Visual charts showing recycling progress over time
- **Reward Points System** - Earn 1 point per kg of recycled materials
- **Pickup History** - View all scheduled and completed pickups
- **Achievement System** - Unlock badges for recycling milestones
- **Real-time Stats** - Live updates of total points, pickups, and weight

### 🎨 Design Features
- **Green Theme** - Environmentally conscious color scheme
- **Modern UI** - Clean, intuitive interface with smooth animations
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Interactive Elements** - Hover effects, smooth transitions, and visual feedback

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google sign-in
   - Enable Email/Password sign-in
4. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in test mode
   - Set security rules to allow authenticated users

### 2. Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web
4. Copy the configuration object
5. Open `app.js` and replace the `firebaseConfig` object with your actual configuration:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

### 3. Firestore Security Rules

Update your Firestore security rules to allow authenticated users to read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /pickups/{pickupId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 4. Run the Application

1. **Local Development**: Open `index.html` in a web browser
2. **Live Server**: Use VS Code Live Server extension or similar
3. **Static Hosting**: Deploy to Firebase Hosting, Netlify, or GitHub Pages

## File Structure

```
EcoCircle/
├── index.html          # Landing page with authentication
├── dashboard.html      # Main application dashboard
├── style.css          # All styling and responsive design
├── app.js             # Firebase integration and app logic
└── README.md          # This file
```

## Key Functions

### Authentication
- `signInWithGoogle()` - Google OAuth sign-in
- `handleEmailAuth()` - Email/password authentication
- `toggleAuthMode()` - Switch between sign-in and sign-up

### Dashboard Operations
- `loadDashboardData()` - Fetch user stats and history
- `handlePickupSubmission()` - Schedule new recycling pickups
- `updateUserStats()` - Update user points and statistics
- `initProgressChart()` - Initialize Chart.js progress visualization

### Data Management
- **Users Collection**: Stores user profiles and statistics
- **Pickups Subcollection**: Tracks individual recycling pickups
- **Real-time Updates**: Automatic UI updates when data changes

## Customization

### Adding New Material Types
Edit the material type options in `dashboard.html`:

```html
<select id="materialType" required>
    <option value="">Select material</option>
    <option value="plastic">Plastic</option>
    <option value="paper">Paper & Cardboard</option>
    <option value="glass">Glass</option>
    <option value="metal">Metal</option>
    <option value="electronics">Electronics</option>
    <option value="organic">Organic Waste</option>
    <!-- Add new options here -->
</select>
```

### Modifying Point System
Change the points calculation in `app.js`:

```javascript
// Current: 1 point per kg
totalPoints: firebase.firestore.FieldValue.increment(Math.floor(weight))

// Custom: 2 points per kg
totalPoints: firebase.firestore.FieldValue.increment(Math.floor(weight * 2))
```

### Adding New Achievements
Extend the achievements system in `dashboard.html` and `app.js`:

```html
<div class="achievement" id="newAchievement">
    <i class="fas fa-star"></i>
    <div>
        <h4>New Achievement</h4>
        <p>Description of the achievement</p>
    </div>
</div>
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Features

- **Lazy Loading** - Data loaded only when needed
- **Efficient Queries** - Firestore queries with proper indexing
- **Optimized Charts** - Chart.js with responsive design
- **Minimal Dependencies** - Only essential external libraries

## Security Features

- **Authentication Required** - All data operations require valid user session
- **User Isolation** - Users can only access their own data
- **Input Validation** - Form validation on both client and server side
- **Secure Rules** - Firestore security rules prevent unauthorized access

## Future Enhancements

- **Push Notifications** - Remind users of upcoming pickups
- **Social Features** - Community leaderboards and challenges
- **Mobile App** - React Native or Flutter mobile application
- **Analytics Dashboard** - Detailed recycling insights and trends
- **Integration APIs** - Connect with local recycling services

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Check console for configuration errors
2. **Authentication not working**: Verify Firebase project settings
3. **Database errors**: Check Firestore security rules
4. **Chart not displaying**: Ensure Chart.js is loaded before initialization

### Debug Mode

Enable debug logging by adding this to `app.js`:

```javascript
// Enable Firebase debug mode
firebase.firestore().settings({
    debug: true
});
```

## Contributing

This is a hackathon project designed for demonstration purposes. Feel free to fork and extend the functionality!

## License

MIT License - Feel free to use this project for educational and commercial purposes.

---


**Built with ❤️ for a greener future! 🌱** 
