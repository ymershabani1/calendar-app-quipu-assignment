import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import AuthScreen from '../screens/AuthScreen';
import { authService } from '../services/authService';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Placeholder component for Main screen (will be replaced with tabs later)
function MainScreen() {
  return null;
}

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  const checkAuth = React.useCallback(async () => {
    const authenticated = await authService.isAuthenticated();
    setIsAuthenticated(authenticated);
  }, []);

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!isAuthenticated) {
        checkAuth();
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, checkAuth]);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}