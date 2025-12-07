// Dummy comment for git
export default {
  expo: {
    name: "Rusty",
    slug: "Rusty",
    platforms: ["ios", "android"],
    scheme: "rusty",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/AppIcon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/AdaptiveIcon.png",
      resizeMode: "contain",
      backgroundColor: "#BD5151",
    },
    assetBundlePatterns: ["**/*"],
    updates: {
      url: "https://u.expo.dev/4efc6c8c-f689-49a0-844d-846ef14a0e67",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.rusty",
      associatedDomains: ["applinks:rusty-7faf0.firebaseapp.com"],
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        UIViewControllerBasedStatusBarAppearance: true,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/AdaptiveIcon.png",
        backgroundColor: "#BD5151",
      },
      package: "com.anonymous.rusty",
      softwareKeyboardLayoutMode: "pan",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "rusty-7faf0.firebaseapp.com",
              pathPrefix: "/__/auth/action",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      googleServicesFile: "./google-services.json",
    },
    extra: {
      eas: {
        projectId: "4efc6c8c-f689-49a0-844d-846ef14a0e67",
      },
    },

    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow Rusty to access your location to show nearby abandoned vehicles.",
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/NotificationIcon.png",
          color: "#BD5151",
          defaultChannel: "default",
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            enableShrinkCodeInReleaseBuilds: true,
          },
        },
      ],
    ],
  },
};
