import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchInput from './SearchInput';

describe('SearchInput', () => {
  it('calls onChange', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abba' } });
    expect(onChange).toHaveBeenCalledWith('abba');
  });
});
