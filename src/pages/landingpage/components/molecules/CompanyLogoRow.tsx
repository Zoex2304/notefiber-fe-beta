import { LogoCompanyPot } from '../atoms/LogoCompanyPot';

// Data placeholder untuk 7 perusahaan
const DUMMY_COMPANIES = [
  { name: 'Company A' },
  { name: 'Company B' },
  { name: 'Company C' },
  { name: 'Company D' },
  { name: 'Company E' },
  { name: 'Company F' },
  { name: 'Company G' },
];

const LOGO_PATH = '/src/assets/images/landing/logo/logo_symbol.svg';

/**
 * Komponen "Trailer"
 * FIXED: Menambahkan flex-shrink-0 untuk memastikan tidak di-compress
 */
export function CompanyLogoRow() {
  return (
    <div
      className="
        flex flex-nowrap flex-shrink-0 items-center 
        gap-8 lg:gap-16
      "
    >
      {DUMMY_COMPANIES.map((company) => (
        <LogoCompanyPot
          key={company.name}
          companyName={company.name}
          iconSrc={LOGO_PATH}
        />
      ))}
    </div>
  );
}