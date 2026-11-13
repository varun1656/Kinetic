import React from 'react';
import { RideTierId } from '../types/ride';

interface VehicleSilhouetteProps {
  tierId: RideTierId;
  className?: string;
}

export const VehicleSilhouette: React.FC<VehicleSilhouetteProps> = ({ tierId, className = 'w-14 h-9' }) => {
  switch (tierId) {
    case 'auto':
      return (
        <svg viewBox="0 0 64 40" fill="none" className={className} aria-hidden="true">
          <path
            d="M16 28V14C16 11.2 18.2 9 21 9H34L44 17V28H16Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M22 13H32L38 18H22V13Z" fill="currentColor" fillOpacity="0.22" />
          <path d="M12 28H48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="30" r="4.5" fill="currentColor" />
          <circle cx="20" cy="30" r="1.8" className="fill-white dark:fill-[#121212]" />
          <circle cx="43" cy="30" r="4.5" fill="currentColor" />
          <circle cx="43" cy="30" r="1.8" className="fill-white dark:fill-[#121212]" />
        </svg>
      );
    case 'green':
      return (
        <svg viewBox="0 0 64 40" fill="none" className={className} aria-hidden="true">
          <path
            d="M8 25L12 18L21 12H40L49 18L55 21V27H8V25Z"
            fill="currentColor"
            fillOpacity="0.08"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M22 14.5H39L45.5 19H17L22 14.5Z" fill="currentColor" fillOpacity="0.2" />
          <path d="M31 19.5L28.5 23.5H32.5L30 27" stroke="#05A357" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="18" cy="29" r="4.5" fill="currentColor" />
          <circle cx="18" cy="29" r="1.8" className="fill-white dark:fill-[#121212]" />
          <circle cx="46" cy="29" r="4.5" fill="currentColor" />
          <circle cx="46" cy="29" r="1.8" className="fill-white dark:fill-[#121212]" />
        </svg>
      );
    case 'premier':
      return (
        <svg viewBox="0 0 64 40" fill="none" className={className} aria-hidden="true">
          <path
            d="M6 25L10 19L20 12.5H41L50 18.5L58 21V27.5H6V25Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M21 15H39.5L46.5 19.5H16L21 15Z" className="fill-white/80 dark:fill-[#121212]/80" />
          <circle cx="17.5" cy="29" r="4.5" fill="currentColor" />
          <circle cx="17.5" cy="29" r="1.8" className="fill-white dark:fill-[#121212]" />
          <circle cx="47.5" cy="29" r="4.5" fill="currentColor" />
          <circle cx="47.5" cy="29" r="1.8" className="fill-white dark:fill-[#121212]" />
        </svg>
      );
    case 'xl':
      return (
        <svg viewBox="0 0 64 40" fill="none" className={className} aria-hidden="true">
          <path
            d="M7 26V17L12 11.5H45L52 18L57 20.5V27.5H7V26Z"
            fill="currentColor"
            fillOpacity="0.14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M14 14H28V19H12L14 14Z" fill="currentColor" fillOpacity="0.22" />
          <path d="M31 14H43L48 19H31V14Z" fill="currentColor" fillOpacity="0.22" />
          <circle cx="17.5" cy="29.5" r="4.8" fill="currentColor" />
          <circle cx="17.5" cy="29.5" r="1.9" className="fill-white dark:fill-[#121212]" />
          <circle cx="46.5" cy="29.5" r="4.8" fill="currentColor" />
          <circle cx="46.5" cy="29.5" r="1.9" className="fill-white dark:fill-[#121212]" />
        </svg>
      );
    case 'go':
    default:
      return (
        <svg viewBox="0 0 64 40" fill="none" className={className} aria-hidden="true">
          <path
            d="M9 26L12.5 18.5L21 12.5H39L46 18.5L54 21V27.5H9V26Z"
            fill="currentColor"
            fillOpacity="0.08"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M22 15H37.5L43 19.5H17L22 15Z" fill="currentColor" fillOpacity="0.2" />
          <circle cx="18.5" cy="29" r="4.4" fill="currentColor" />
          <circle cx="18.5" cy="29" r="1.7" className="fill-white dark:fill-[#121212]" />
          <circle cx="45.5" cy="29" r="4.4" fill="currentColor" />
          <circle cx="45.5" cy="29" r="1.7" className="fill-white dark:fill-[#121212]" />
        </svg>
      );
  }
};
