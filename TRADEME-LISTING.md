# Trade Me listing record: Kings Road cottage

Saved 5 November 2026 so the cottage can be relisted quickly. The cottage was let (privately) on 5 Nov 2026 and the listing withdrawn.

- **Listing:** #6207152831, listed Sat 31 Oct 2026, seller `steveab`
- **Category:** Property > Residential > Rent > Auckland > Auckland City > Panmure
- **Result:** 528 views, 34 watchers, 9 open home registrations in 5 days

## Listing fields

| Field | Value |
|---|---|
| Address shown | Kings Road, Panmure (street number deliberately left blank; registrants get it by email) |
| Rent | $650 per week |
| Property type | House |
| Bedrooms / bathrooms | 2 / 1 |
| Living areas | 1 |
| Parking | 2 off-street |
| Available | Sat 7 Nov 2026 |
| Furnishings | Table and chairs, fridge, front-loader washing machine, condenser dryer |
| Ideal tenants | Professional couple, no pets |
| Maximum tenants | 2 |
| Smokers | No |
| Property ID# | JZL005 |
| Contact | 021 932 611, best contact time any time |

## Photos (in upload order, first is the main photo)

All in `images/` (1600px, EXIF/GPS stripped). Originals are in the Google Photos album "Cottage".

1. exterior.jpg (Janette's photo, main)
2. living.jpg
3. living-kitchen.jpg
4. kitchen-2.jpg
5. deck.jpg
6. deck-2.jpg
7. pergola.jpg
8. bedroom-1.jpg
9. bedroom-1-wardrobe.jpg
10. bedroom-2.jpg
11. bathroom-new-1.jpg
12. bathroom-new-2.jpg
13. garden.jpg

Do not use `kitchen.jpg`: it shows the old gas hob. The kitchen now has induction and a new rangehood, and still needs a new photo.

## Title

Panmure, 2 bedrooms, $650 pw

## Description

```
Freshly repainted, private two-bedroom cottage tucked away on a large Panmure section.

The cottage sits on our property behind a secure gate, surrounded by large mature trees. It has just had a full repaint, inside and out. It's quiet and private, and it feels a world away from the city while still being close to everything.

LIVING
The open-plan living area has polished timber floors, a fireplace and big windows that bring in lovely morning sun. The kitchen opens off the living space, with induction cooking, a new rangehood, plenty of cupboard space and a second bench with a double sink.

BEDROOMS & BATHROOM
There are two bedrooms, both with built-in wardrobes and leafy garden outlooks. The bathroom has been newly renovated, with floor-to-ceiling tiles, a frameless glass shower and a wall-hung timber vanity.

OUTDOORS
French doors open straight onto a large private deck under a pergola, enclosed by high hedging and established gardens. It's perfect for morning coffee or summer evenings outside.

INCLUDED
Table and chairs, fridge, front-loader washing machine and condenser dryer.

FEATURES
- Full repaint inside and out
- Secure gated entry
- Large private deck with pergola
- Surrounded by mature trees and gardens
- Open-plan living with fireplace
- Polished timber floors
- Induction cooking and new rangehood
- Newly renovated bathroom with frameless glass shower
- Built-in wardrobes
- Off-street parking for 2 cars
- Healthy Homes compliant

$650 per week. Available from 7 November 2026.

OPEN HOME: Saturday 7 November, 2:00-3:30pm
Please register here and we'll email you the address and an application form:
https://stevebonnici.github.io/kings-road/

Questions? Send us a message through Trade Me or call 021 932 611.
```

## To relist

1. Update the rent, the available date and the open home date in the description above.
2. Reopen the page. In `index.html`, change `<body class="let">` to `<body>`. In `worker/wrangler.jsonc`, set `REGISTRATIONS_CLOSED` to `"0"`. Both were switched on 5 Nov 2026 when the cottage was let.
3. On the page, change the open home date in `index.html`, and in `worker/src/index.js` change the admin subtitle. In `apps-script/Code.gs`, update the email text (the live copy is in the Apps Script project).
4. Clear the old rows from the D1 `registrations` table, deploy the Worker, and push the page.
5. On Trade Me, use "Sell similar" from the Unsold list, or start a new rental listing. Paste the fields and description, then upload the 13 photos in the order above.
