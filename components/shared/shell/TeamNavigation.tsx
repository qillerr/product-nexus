import { Cog6ToothIcon, CodeBracketIcon, ChevronDoubleUpIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import NavigationItems from './NavigationItems';
import { NavigationProps, MenuItem } from './NavigationItems';

interface NavigationItemsProps extends NavigationProps {
  slug: string;
}

const TeamNavigation = ({ slug, activePathname }: NavigationItemsProps) => {
  const { t } = useTranslation('common');

  const menus: MenuItem[] = [
    {
      name: t('all-products'),
      href: `/teams/${slug}/products`,
      icon: CodeBracketIcon,
      active: activePathname === `/teams/${slug}/products`,
    },
      {
      name: t('okrs'),
      href: `/teams/${slug}/okrs`,
      icon: ChevronDoubleUpIcon,
      active: activePathname === `/teams/${slug}/okrs`,
    },
    {
      name: t('settings'),
      href: `/teams/${slug}/settings`,
      icon: Cog6ToothIcon,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        !(activePathname.includes('products') || activePathname.includes('okrs')),
    },
  ];

  return <NavigationItems menus={menus} />;
};

export default TeamNavigation;
