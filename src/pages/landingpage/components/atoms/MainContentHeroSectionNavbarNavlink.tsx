import { Link, useSearch } from '@tanstack/react-router';

interface MainContentHeroSectionNavbarNavlinkProps {
  textArg: string;
  urlArg: string;
}

export const MainContentHeroSectionNavbarNavlink = (props: MainContentHeroSectionNavbarNavlinkProps) => {
  // TanStack Router's useSearch returns the validation object directly
  // For now we'll assume a loose type if strict search params aren't defined yet
  const search = useSearch({ strict: false }) as { page?: string };
  const currentPage = search.page;

  const isActive = currentPage === props.urlArg || (!currentPage && props.urlArg === '');

  return (
    <Link
      to="/landing"
      search={{ page: props.urlArg || undefined }}
      className={`
                text-body-base 
                cursor-pointer 
                transition-all 
                duration-300 
                hover:text-royal-violet-base
                ${isActive
          ? "font-semibold text-royal-violet-base"
          : "font-normal text-gray-500"
        }
            `}
    >
      {props.textArg}
    </Link>
  );
};