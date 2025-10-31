import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Atom', () => {

  // Test 1: Memastikan tombol merender dengan teks yang benar
  test('renders with correct children text', () => {
    render(<Button>Click Me</Button>);
    // Menggunakan RTL screen.getByText
    const buttonElement = screen.getByText(/click me/i); 
    expect(buttonElement).toBeInTheDocument();
  });

  // Test 2: Memastikan fungsi onClick dipanggil saat tombol diklik
  test('calls onClick handler when clicked', () => {
    // Membuat mock function menggunakan Jest
    const handleClick = jest.fn(); 
    render(<Button onClick={handleClick}>Submit</Button>);
    
    const buttonElement = screen.getByText(/submit/i);
    
    // Simulasikan event klik
    fireEvent.click(buttonElement); 
    
    // Verifikasi mock function telah dipanggil SATU kali
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  // Test 3: Memastikan tombol 'danger' memiliki atribut yang benar (misalnya role)
  test('applies correct role attribute', () => {
      render(<Button variant="danger">Delete</Button>);
      const buttonElement = screen.getByRole('button', { name: /delete/i });
      expect(buttonElement).toBeInTheDocument();
  });
});