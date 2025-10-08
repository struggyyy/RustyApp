require('dotenv').config();

export default {
  "expo": {
    "name": "Rusty",
    "slug": "Rusty",
    "scheme": "rusty",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/CAR.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/CAR.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.anonymous.rusty",
      "associatedDomains": [
        "applinks:rusty-7faf0.firebaseapp.com"
      ],
      "config": {
        "googleMapsApiKey": process.env.GOOGLE_MAPS_API_KEY
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/CAR.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.anonymous.rusty",
      "config": {
        "googleMaps": {
          "apiKey": process.env.GOOGLE_MAPS_API_KEY
        }
      },
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "rusty-7faf0.firebaseapp.com",
              "pathPrefix": "/__/auth/action"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    },
    "web": {
      "bundler": "metro"
    },
    "extra": {
      "eas": {
        "projectId": "4efc6c8c-f689-49a0-844d-846ef14a0e67"
      }
    },
    "newArchEnabled": true,
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Rusty to access your location to show nearby abandoned vehicles."
        }
      ]
    ]
  }
}
