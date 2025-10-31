import { render, screen, fireEvent } from '@testing-library/react';
import FieldGroup from './FieldGroup';

describe('FieldGroup Molecule', () => {
  const mockOnChange = jest.fn();
  
  const defaultProps = {
    label: 'Product Name',
    id: 'productName',
    value: 'Initial Value',
    onChange: mockOnChange,
  };

  // Test 1: Memastikan Label dan Input muncul
  test('renders label and input correctly', () => {
    render(<FieldGroup {...defaultProps} />);
    
    // Verifikasi Label
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    
    // Verifikasi Input
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveValue('Initial Value');
  });

  // Test 2: Memastikan fungsi onChange dipanggil saat input diubah
  test('calls onChange handler when input value changes', () => {
    render(<FieldGroup {...defaultProps} />);
    
    const inputElement = screen.getByRole('textbox');
    
    // Simulasikan perubahan nilai input
    fireEvent.change(inputElement, { target: { value: 'New Value' } });
    
    // Verifikasi mock function dipanggil
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});