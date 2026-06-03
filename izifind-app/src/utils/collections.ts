import type { SelectOption } from '@/components/SelectField';

export const toSelectOptions = <T extends Record<string, any>>(
  items: T[] | undefined,
  labelKey: keyof T,
  valueKey: keyof T = 'id' as keyof T
): SelectOption[] =>
  (items ?? []).map((item) => ({
    label: String(item[labelKey] ?? ''),
    value: item[valueKey] as string | number,
  }));

