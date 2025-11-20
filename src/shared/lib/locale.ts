import { defaultLocale } from '@/config/locale';

export function getLocalizedPath(
  path: string,
  locale: string,
  baseLocale: string = defaultLocale
): string {
  if (!path) {
    return '/';
  }

  if (locale === baseLocale) {
    return path;
  }

  if (!path.startsWith('/')) {
    return path;
  }

  if (path.startsWith(`/${locale}`)) {
    return path;
  }

  return `/${locale}${path}`;
}
