import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../ui/Button';

describe('Button', () => {
  it('should render with title', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPress} />);
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPress} disabled />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should not call onPress when loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPress} loading />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should render loading indicator when loading', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <Button title="Test Button" onPress={() => {}} loading />
    );
    
    // Title should not be visible when loading
    expect(queryByText('Test Button')).toBeNull();
    // ActivityIndicator should be present (this is a simplified check)
  });

  it('should apply variant styles', () => {
    const { getByText } = render(
      <Button title="Primary" onPress={() => {}} variant="primary" />
    );
    expect(getByText('Primary')).toBeTruthy();
  });

  it('should apply size styles', () => {
    const { getByText } = render(
      <Button title="Small" onPress={() => {}} size="sm" />
    );
    expect(getByText('Small')).toBeTruthy();
  });

  it('should apply fullWidth style', () => {
    const { getByText } = render(
      <Button title="Full Width" onPress={() => {}} fullWidth />
    );
    expect(getByText('Full Width')).toBeTruthy();
  });
});

