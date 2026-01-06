interface LinkItem {
  name: string;
  href: string;
}

interface FooterLinkGroupProps {
  title: string;
  links: LinkItem[];
}

/**
 * Komponen Reusable Footer Link Group
 *
 * Menerima 'title' dan array 'links'
 * untuk membangun satu grup link di footer.
 */
export function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
  return (
    // Wrapper (Specs: flex-col, gap-[17.169px])
    <div
      className="
        flex w-full flex-col items-start 
        gap-3 lg:gap-[17.169px] 
        lg:w-auto
      "
    >
      {/* 1. Header Link (Specs: 19.622px) */}
      <h3
        className="
          font-normal text-customFont-dark-base 
          text-body-1 lg:text-[19.622px] 
          leading-[1.4]
        "
      >
        {title}
      </h3>

      {/* 2. Frame 2 (Links Wrapper) */}
      <div className="flex flex-col items-start gap-2">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="
              font-normal text-customFont-base 
              text-body-base lg:text-[18px] 
              leading-[1.4] 
              hover:text-royal-violet-base 
              transition-colors
            "
          >
            {link.name}
          </a>
        ))}
      </div>
    </div>
  );
}
