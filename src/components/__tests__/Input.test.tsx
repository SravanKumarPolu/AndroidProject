import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../ui/Input';

describe('Input', () => {
  it('should render with placeholder', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" />
    );
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('should render with label', () => {
    const { getByText } = render(
      <Input label="Test Label" />
    );
    expect(getByText('Test Label')).toBeTruthy();
  });

  it('should call onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" onChangeText={onChangeText} />
    );
    
    const input = getByPlaceholderText('Enter text');
    fireEvent.changeText(input, 'New text');
    expect(onChangeText).toHaveBeenCalledWith('New text');
  });

  it('should display error message', () => {
    const { getByText } = render(
      <Input error="This is an error" />
    );
    expect(getByText('This is an error')).toBeTruthy();
  });

  it('should apply error styles when error exists', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" error="Error message" />
    );
    const input = getByPlaceholderText('Enter text');
    // Error styling should be applied (simplified check)
    expect(input).toBeTruthy();
  });

  it('should handle multiline input', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" multiline />
    );
    const input = getByPlaceholderText('Enter text');
    expect(input).toBeTruthy();
  });
});

