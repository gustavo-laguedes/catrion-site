import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'text';
  className?: string;
  to?: string;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

export function Button({ children, variant = 'primary', className = '', to, href, type = 'button', disabled = false }: ButtonProps) {
  const classes = `button button--${variant} ${className}`;
  if (to) return <Link to={to} className={classes}>{children}</Link>;
  if (href) return <a href={href} className={classes}>{children}</a>;
  return <button type={type} disabled={disabled} className={classes}>{children}</button>;
}
