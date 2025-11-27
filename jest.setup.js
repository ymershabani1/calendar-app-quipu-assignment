jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native').View;
    return {
      Swipeable: View,
      DrawerLayout: View,
      State: {},
      ScrollView: View,
      Slider: View,
      Switch: View,
      TextInput: View,
      ToolbarAndroid: View,
      ViewPagerAndroid: View,
      DrawerLayoutAndroid: View,
      WebView: View,
      NativeViewGestureHandler: View,
      TapGestureHandler: View,
      ForceTouchGestureHandler: View,
      LongPressGestureHandler: View,
      PanGestureHandler: View,
      PinchGestureHandler: View,
      RotationGestureHandler: View,
      RawButton: View,
      BaseButton: View,
      BorderlessButton: View,
      FlatList: View,
      gestureHandlerRootHOC: jest.fn((fn) => fn),
      Directions: {},
    };
  });
  
  jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
  );
  
  jest.mock('react-native-biometrics', () => {
    const mockInstance = {
      isSensorAvailable: jest.fn().mockResolvedValue({ available: false }),
      simplePrompt: jest.fn().mockResolvedValue({ success: false }),
    };
    return jest.fn().mockImplementation(() => mockInstance);
  });