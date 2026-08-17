import React from 'react';
import clsx from 'clsx';
import styles from './badge.module.css';
import { DisponibilidadeProduto, DisponibilidadeLabels } from '@/types/stock';
import { StatusPedido, StatusPedidoLabels, TipoPedido, TipoPedidoLabels } from '@/types/order';

interface BadgeProps {
  variant?: 'availability' | 'orderStatus' | 'orderType' | 'community' | 'default';
  value?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', value, children, className }: BadgeProps) {
  let label = children as string;
  let colorClass = styles.default;

  if (variant === 'availability' && value) {
    label = DisponibilidadeLabels[value as DisponibilidadeProduto] || value;
    colorClass = styles[`avail_${value}`] || styles.default;
  } else if (variant === 'orderStatus' && value) {
    label = StatusPedidoLabels[value as StatusPedido] || value;
    colorClass = styles[`status_${value}`] || styles.default;
  } else if (variant === 'orderType' && value) {
    label = TipoPedidoLabels[value as TipoPedido] || value;
    colorClass = styles[`type_${value}`] || styles.default;
  }

  return (
    <span className={clsx(styles.badge, colorClass, className)}>
      {label}
    </span>
  );
}
