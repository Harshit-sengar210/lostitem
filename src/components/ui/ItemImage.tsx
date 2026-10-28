'use client';

import React, { useState } from 'react';
import { Package, Smartphone, Wallet, ShoppingBag, FileText, Key, Gem, Laptop, HelpCircle } from 'lucide-react';
import { ItemCategory } from '@/data/mockItems';

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  phone: '/images/iphone.jpg',
  wallet: '/images/wallet.jpg',
  bag: '/images/backpack.jpg',
  document: '/images/id_card.jpg',
  keys: '/images/keys.jpg',
  jewellery: '/images/sunglasses.jpg',
  electronics: '/images/airpods.jpg',
  other: '/images/laptop_bag.jpg',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  phone: Smartphone,
  wallet: Wallet,
  bag: ShoppingBag,
  document: FileText,
  keys: Key,
  jewellery: Gem,
  electronics: Laptop,
  other: HelpCircle,
};

interface ItemImageProps {
  src?: string | null;
  alt: string;
  category?: ItemCategory | string;
  className?: string;
  containerClassName?: string;
}

export const ItemImage: React.FC<ItemImageProps> = ({
  src,
  alt,
  category = 'other',
  className = 'w-full h-full object-cover',
  containerClassName = 'relative w-full h-full overflow-hidden bg-slate-800 flex items-center justify-center',
}) => {
  const [hasError, setHasError] = useState(false);
  const normalizedCategory = (category || 'other').toLowerCase();
  const fallbackImage = CATEGORY_DEFAULT_IMAGES[normalizedCategory] || '/images/backpack.jpg';
  const IconComponent = CATEGORY_ICONS[normalizedCategory] || Package;

  const validSrc = src && src.trim() !== '' && !src.startsWith('blob:') ? src : fallbackImage;

  if (hasError) {
    return (
      <div className={containerClassName}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fallbackImage}
          alt={alt}
          className={className}
          onError={(e) => {
            // Hide image and show icon if local fallback also fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-indigo-950/40 text-indigo-300">
          <IconComponent className="w-1/3 h-1/3 stroke-[1.5]" />
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={validSrc}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
};
