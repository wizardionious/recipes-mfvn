const pr = new Intl.PluralRules("uk-UA");

type PluralForms = {
  one: string;
  few: string;
  many: string;
};

export function pluralize(count: number, forms: PluralForms) {
  const rule = pr.select(count) as keyof PluralForms;

  return `${count} ${forms[rule]}`;
}
