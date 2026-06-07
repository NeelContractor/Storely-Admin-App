// // src/utils/getDeviceToken.ts

// // import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { Platform } from 'react-native';
// import Constants from 'expo-constants';

// export async function getDeviceToken(): Promise<string> {
//   // Skip Expo Go
//   if (Constants.executionEnvironment === 'storeClient') {
//     return '';
//   }

//   // Push tokens only work on physical devices
//   if (!Device.isDevice) {
//     return '';
//   }

//   const projectId =
//     Constants.expoConfig?.extra?.eas?.projectId ??
//     Constants.easConfig?.projectId;

//   if (!projectId) {
//     return '';
//   }

//   const { status: existing } = await Notifications.getPermissionsAsync();
//   let finalStatus = existing;

//   if (existing !== 'granted') {
//     const { status } = await Notifications.requestPermissionsAsync();
//     finalStatus = status;
//   }

//   if (finalStatus !== 'granted') {
//     return '';
//   }

//   if (Platform.OS === 'android') {
//     await Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.DEFAULT,
//     });
//   }

//   const token = await Notifications.getExpoPushTokenAsync({
//     projectId,
//   });

//   return token.data;
// }