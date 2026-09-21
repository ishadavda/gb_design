# Icons

The three files `app/manifest.ts` references:

- `icon-192.png` - 192x192, purpose "any". Supplied artwork.
- `icon-512.png` - 512x512, purpose "any". Supplied artwork.
- `icon-maskable-512.png` - 512x512, purpose "maskable". Derived from the 512:
  the supplied icon is a rounded square with transparent corners, and a maskable
  icon is cropped to whatever shape the OS chooses, so this one paints the
  artwork's own gradient edge to edge and insets the artwork to 78% - the safe
  zone every mask shape respects (https://web.dev/articles/maskable-icon).

Replace all three together if the brand artwork changes; the maskable one is the
only one that cannot simply be the same file at a different size.
