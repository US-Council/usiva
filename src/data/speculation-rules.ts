/**
 * Speculation Rules for every layout: prerender same-origin HTML pages when a
 * reader signals intent (hover or pointer-down, "moderate" eagerness), so
 * navigation between the static pages feels instant. Browsers without support
 * ignore the script. XML routes and links marked external or nofollow are
 * excluded.
 */
const speculationRules = {
  prerender: [
    {
      where: {
        and: [
          { href_matches: '/*' },
          { not: { href_matches: '/*.xml' } },
          { not: { selector_matches: '[rel~=nofollow], [data-external]' } },
        ],
      },
      eagerness: 'moderate',
    },
  ],
} as const;

export const speculationRulesJson: string = JSON.stringify(speculationRules).replace(/</g, '\\u003c');
