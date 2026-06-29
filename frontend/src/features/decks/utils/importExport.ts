export interface ImportedDeck {
  title: string;
  description: string;
  cards: { frontText: string; backText: string }[];
}

/**
 * Triggers a file download in the browser.
 */
export const triggerDownload = (
  content: string,
  filename: string,
  mimeType: string,
) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports deck data to JSON.
 */
export const exportToJSON = (
  title: string,
  description: string,
  cards: { frontText: string; backText: string }[],
) => {
  const data: ImportedDeck = { title, description, cards };
  const jsonContent = JSON.stringify(data, null, 2);
  triggerDownload(
    jsonContent,
    `${title.replace(/\s+/g, "_")}.json`,
    "application/json",
  );
};

/**
 * Exports deck data to CSV.
 * Columns: Front Text, Back Text
 */
export const exportToCSV = (
  title: string,
  cards: { frontText: string; backText: string }[],
) => {
  const headers = "Front Text,Back Text\n";
  const rows = cards
    .map((c) => {
      // Escape double quotes in CSV fields
      const front = c.frontText.replace(/"/g, '""');
      const back = c.backText.replace(/"/g, '""');
      return `"${front}","${back}"`;
    })
    .join("\n");

  triggerDownload(
    headers + rows,
    `${title.replace(/\s+/g, "_")}.csv`,
    "text/csv",
  );
};

/**
 * Exports deck data to HTML format.
 */
export const exportToHTML = (
  title: string,
  description: string,
  cards: { frontText: string; backText: string }[],
) => {
  const cardsHtml = cards
    .map(
      (c) => `
      <div class="card">
        <div class="front">${c.frontText}</div>
        <div class="back">${c.backText}</div>
      </div>
    `,
    )
    .join("\n");

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="description" content="${description.replace(/"/g, "&quot;")}">
  <title>${title}</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .card { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
    .front { font-weight: bold; margin-bottom: 5px; }
    .back { color: #555; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <div class="cards-list">
    ${cardsHtml}
  </div>
</body>
</html>`;

  triggerDownload(
    htmlContent,
    `${title.replace(/\s+/g, "_")}.html`,
    "text/html",
  );
};

/**
 * Parses JSON content into an ImportedDeck object.
 */
export const parseJSONDeck = (content: string): ImportedDeck => {
  const parsed = JSON.parse(content);
  if (!parsed.title || !Array.isArray(parsed.cards)) {
    throw new Error("Invalid JSON deck format");
  }
  return {
    title: parsed.title,
    description: parsed.description || "",
    cards: parsed.cards.map((c: { frontText?: string; backText?: string }) => ({
      frontText: c.frontText || "",
      backText: c.backText || "",
    })),
  };
};

/**
 * Parses CSV content into an ImportedDeck object.
 */
export const parseCSVDeck = (
  content: string,
  fileName: string,
): ImportedDeck => {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) {
    throw new Error("CSV must contain a header and at least one card");
  }

  const cards: { frontText: string; backText: string }[] = [];

  const parseCSVLine = (lineStr: string): string[] => {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < lineStr.length; j++) {
      const char = lineStr[j];
      if (char === '"') {
        if (inQuotes && lineStr[j + 1] === '"') {
          current += '"';
          j++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        parts.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current);
    return parts;
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = parseCSVLine(line);
    const frontText = parts[0] || '';
    const backText = parts[1] || '';

    cards.push({ frontText, backText });
  }

  // Deduce the deck title from the file name
  const title = fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

  return {
    title,
    description: "Imported from CSV",
    cards,
  };
};

/**
 * Parses HTML content using DOMParser into an ImportedDeck object.
 */
export const parseHTMLDeck = (content: string): ImportedDeck => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  const title = doc.querySelector('h1')?.textContent || doc.title || 'Imported Deck';
  const description =
    doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
    doc.querySelector('p')?.textContent ||
    '';

  const cardElements = doc.querySelectorAll('.card');
  const cards = Array.from(cardElements).map(el => {
    const frontText = el.querySelector('.front')?.textContent || '';
    const backText = el.querySelector('.back')?.textContent || '';
    return { frontText, backText };
  });

  return {
    title,
    description,
    cards,
  };
};
