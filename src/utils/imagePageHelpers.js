
const templates = {
  "bucket_a": [
    "Pobierz darmową kolorowankę przedstawiającą motyw: [NAZWA].",
    "Szukasz kreatywnego zajęcia? Oto gotowy do druku rysunek: [NAZWA].",
    "Przygotowaliśmy dla Ciebie wysokiej jakości szablon: [NAZWA].",
    "Twoje dziecko uwielbia malować? Sprawdź obrazek o tytule: [NAZWA].",
    "Darmowy plik PDF do pobrania z kategorii [KATEGORIA]: [NAZWA].",
    "Odkryj świat kolorów z naszą nową propozycją: [NAZWA].",
    "Oto wspaniała malowanka, której bohaterem jest [NAZWA].",
    "Pobierz i wydrukuj bezpieczny dla dzieci szablon: [NAZWA]."
  ],
  "bucket_b": [
    "Ten obrazek posiada wyraźne kontury, dzięki czemu jest idealny do kolorowania kredkami, flamastrami lub farbami.",
    "Format pliku został zoptymalizowany do wydruku na domowej drukarce w standardzie A4, oszczędzając Twój tusz.",
    "Kolorowanie to doskonałe ćwiczenie, które rozwija motorykę małą i pobudza wyobraźnię dziecka.",
    "Zapewnij swojemu maluchowi chwilę relaksu i kreatywnej zabawy z dala od ekranu komputera.",
    "Prosty i czytelny wzór sprawia, że jest to idealna propozycja zarówno dla przedszkolaków, jak i starszych dzieci.",
    "Wspólne kolorowanie to świetny sposób na spędzenie czasu z rodziną w deszczowe popołudnie.",
    "Nasze szablony są zaprojektowane tak, aby dawać radość tworzenia i satysfakcję z ukończonego dzieła."
  ],
  "bucket_c": [
    "Kliknij przycisk 'Drukuj', aby pobrać plik PDF całkowicie za darmo i bez logowania.",
    "Nie czekaj! Pobierz ten szablon teraz i stwórz własną, unikalną wersję kolorystyczną.",
    "Drukuj tyle kopii, ile chcesz – nasze materiały są zawsze darmowe dla użytku domowego.",
    "Pobierz plik PDF jednym kliknięciem i ciesz się zabawą już za chwilę.",
    "Sprawdź również inne darmowe kolorowanki, które znajdziesz w sekcji 'Zobacz także' poniżej.",
    "Gotowy do zabawy? Kliknij przycisk poniżej i uruchom swoją drukarkę!"
  ],
  "title_suffixes": [
    " - Kolorowanka do druku (PDF)",
    " - Darmowy szablon A4",
    " - Rysunek do pokolorowania",
    " - Malowanka dla dzieci PDF",
    " - Obrazek do wydruku",
    " - Darmowa kolorowanka"
  ]
};

import imageIds from '../data/image_ids.js';

export function getPageData(image, categoryKey, categoryTitle, categoryImages) {
  const idString = `${categoryKey}__${image.key}`;
  let imageId = imageIds[idString];

  if (imageId === undefined) {
    // Fallback to a simple hash if ID is missing
    imageId = idString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  const worek_a_index = imageId % templates.bucket_a.length;
  const worek_b_index = imageId % templates.bucket_b.length;
  const worek_c_index = imageId % templates.bucket_c.length;

  const generatedDescription = [
    templates.bucket_a[worek_a_index].replaceAll('[NAZWA]', image.title).replaceAll('[KATEGORIA]', categoryTitle),
    templates.bucket_b[worek_b_index],
    templates.bucket_c[worek_c_index].replaceAll('[NAZWA]', image.title)
  ].join(' ');

  const description = image.description ? `${image.description} ${generatedDescription}` : generatedDescription;

  const title_suffix_index = imageId % templates.title_suffixes.length;
  const pageTitle = `${image.title}${templates.title_suffixes[title_suffix_index]}`;
  
  const otherImages = categoryImages
    .filter((img) => img.key !== image.key)
    .sort(() => Math.random() - 0.5);
  
  const seeAlsoImages = otherImages.slice(0, 4);

  return {
    imageId,
    description,
    pageTitle,
    seeAlsoImages
  };
}
