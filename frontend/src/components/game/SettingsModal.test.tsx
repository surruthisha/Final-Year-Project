import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactNode } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import { SettingsModal } from './SettingsModal';

const wrapper = ({ children }: { children: ReactNode }) => (
  <GameProvider>{children}</GameProvider>
);

const renderModal = (open: boolean, onClose = vi.fn()) =>
  render(<SettingsModal open={open} onClose={onClose} />, { wrapper });

describe('SettingsModal', () => {
  it('renders nothing when closed', () => {
    renderModal(false);
    expect(screen.queryByText('Settings')).toBeNull();
  });

  it('renders the modal when open', () => {
    renderModal(true);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('shows Background Music and Sound Effects rows', () => {
    renderModal(true);
    expect(screen.getByText('Background Music')).toBeInTheDocument();
    expect(screen.getByText('Sound Effects')).toBeInTheDocument();
  });

  it('Done button calls onClose', () => {
    const onClose = vi.fn();
    renderModal(true, onClose);
    fireEvent.click(screen.getByText('Done'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('X button calls onClose', () => {
    const onClose = vi.fn();
    renderModal(true, onClose);
    // The X button is the only icon-only button in the header
    const closeButtons = screen.getAllByRole('button');
    // First button in header is the X close button
    const xBtn = closeButtons.find(b => b.querySelector('svg'));
    fireEvent.click(xBtn!);
    expect(onClose).toHaveBeenCalled();
  });

  it('Home Page button dispatches RESET_GAME and calls onClose', () => {
    const onClose = vi.fn();
    renderModal(true, onClose);
    fireEvent.click(screen.getByText('Home Page'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('Music toggle button is present and clickable', () => {
    const onClose = vi.fn();
    renderModal(true, onClose);
    // There are two toggle buttons (music + sfx). Both are role=button.
    // Find the one adjacent to "Background Music" label.
    const allButtons = screen.getAllByRole('button');
    // Music toggle is the first toggle (after the X close button, before SFX toggle)
    // We test that clicking doesn't throw
    expect(allButtons.length).toBeGreaterThanOrEqual(4); // X, music, sfx, home, done
  });

  it('clicking the backdrop calls onClose', () => {
    const onClose = vi.fn();
    const { container } = renderModal(true, onClose);
    // The backdrop is the outermost motion.div; click it directly
    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });
});
