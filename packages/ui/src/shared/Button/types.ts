import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Size = 'small' | 'medium' | 'large';
export type Color = 'primary' | 'secondary' | 'profile' | 'danger';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: Size;
    color?: Color;
    loading?: boolean;
    block?: boolean;
    icon?: ReactNode;
};
