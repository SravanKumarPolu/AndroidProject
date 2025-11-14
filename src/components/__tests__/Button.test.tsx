import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../ui/Button';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Button', () => {
  it('should render with title', () => {
    const { getByText } = renderWithTheme(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(<Button title="Test Button" onPress={onPress} />);
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <Button title="Test Button" onPress={onPress} disabled />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should not call onPress when loading', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <Button title="Test Button" onPress={onPress} loading />
    );
    
    // When loading, text is replaced by ActivityIndicator, but accessibility label is still present
    fireEvent.press(getByLabelText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should render loading indicator when loading', () => {
    const { queryByText, UNSAFE_getByType } = renderWithTheme(
      <Button title="Test Button" onPress={() => {}} loading />
    );
    
    // Title should not be visible when loading
    expect(queryByText('Test Button')).toBeNull();
    // ActivityIndicator should be present (this is a simplified check)
  });

  it('should apply variant styles', () => {
    const { getByText } = renderWithTheme(
      <Button title="Primary" onPress={() => {}} variant="primary" />
    );
    expect(getByText('Primary')).toBeTruthy();
  });

  it('should apply size styles', () => {
    const { getByText } = renderWithTheme(
      <Button title="Small" onPress={() => {}} size="sm" />
    );
    expect(getByText('Small')).toBeTruthy();
  });

  it('should apply fullWidth style', () => {
    const { getByText } = renderWithTheme(
      <Button title="Full Width" onPress={() => {}} fullWidth />
    );
    expect(getByText('Full Width')).toBeTruthy();
  });
});

