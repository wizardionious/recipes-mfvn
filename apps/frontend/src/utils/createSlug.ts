const cyrillicMap: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  ґ: 'g',
  д: 'd',
  е: 'e',
  є: 'ye',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  і: 'i',
  ї: 'yi',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
  ы: 'y',
  ъ: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

function transliterate(text: string) {
    return text
        .split('')
        .map((char) => {
            const lowerChar = char.toLowerCase();
            
            return cyrillicMap[lowerChar] ?? char;
        })
        .join('');
}

export function createSlug(text: string) {
    return transliterate(text)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
    
}