/**
 * Centralized, non-secret business configuration for Bloom & Bean.
 *
 * Nothing in this file is a secret. Components should read values from
 * here instead of hard-coding café details across the codebase. Values
 * marked "REVIEW:" are placeholders copied from the Stitch design and
 * must be confirmed by the café owner before launch — they were not
 * invented as real business facts.
 */

export const siteConfig = {
  cafeName: "Bloom & Bean",
  tagline: "Helio Coffee Roasters & Neighborhood Kitchen",
  neighborhood: "Salcedo Village, Makati",

  // REVIEW: confirm the exact street address before launch.
  addressLine1: "Ground Floor, Paseo Parkview Suites",
  addressLine2: "Valero St., Salcedo Village",
  addressLine3: "Makati City, Metro Manila",

  // REVIEW: confirm real opening hours before launch.
  hours: {
    weekday: "07:00 – 19:00 (Kitchen closes 18:00)",
    weekend: "07:00 – 18:00 (Sourdough until sold out)",
  },

  // REVIEW: replace with the café's real public landline/mobile number.
  publicPhonePlaceholder: "[ADD PHONE NUMBER — E.G., +63 2 8XXX XXXX]",

  // REVIEW: replace with the café's real public contact email.
  publicEmailPlaceholder: "morning@bloomandbean.ph",
  instagramHandle: "@bloomandbean.ph",

  // REVIEW: replace with a real Google Maps share link before launch.
  mapsUrlPlaceholder: "https://maps.google.com",

  // REVIEW: replace with a real Instagram profile URL before launch.
  instagramUrlPlaceholder: "https://instagram.com/bloomandbean.ph",

  // WhatsApp requires no API key or environment variable — it is a plain
  // link. Configured from the number supplied when this project was set up.
  whatsappUrl: "https://wa.me/639426529501",

  // Reservation business rules
  depositAmountPhp: 100,
  timezone: "Asia/Manila",
  reservationDurationMinutes: 90,
  currencySymbol: "₱",

  // Arrival-time windows offered on the reservation form. Keep these in
  // sync with the Zod schema in lib/validation.ts.
  seatingWindows: [
    { value: "morning", label: "Morning (8:00 AM – 11:30 AM)" },
    { value: "lunch", label: "Lunch & Pour-over (12:00 PM – 2:30 PM)" },
    { value: "afternoon", label: "Afternoon & Pastries (3:00 PM – 5:30 PM)" },
  ] as const,

  guestCountOptions: [
    { value: "1", label: "1 Guest (Bar / Table)" },
    { value: "2", label: "2 Guests" },
    { value: "3-4", label: "3 – 4 Guests" },
    { value: "5+", label: "5+ Group Seating" },
  ] as const,

  menu: {
    coffeeAndBar: {
      title: "Coffee & Bar",
      subtitle: "Single Origin Roasts",
      items: [
        {
          name: "Batch Brew (Rotating Single Origin)",
          description:
            "Light, floral, daily pour-over roast dialed in every morning.",
          price: 180,
        },
        {
          name: "Espresso & Tonic",
          description:
            "House espresso, chilled botanical tonic, expressed citrus peel over clear ice.",
          price: 210,
        },
        {
          name: "Flat White / Oat Latte",
          description:
            "Double shot extraction with textured local oat milk or creamy fresh grass-fed dairy.",
          price: 195,
        },
        {
          name: "Cascara Shakerato",
          description:
            "Dried Benguet coffee cherry infusion shaken vigorously over ice with a whisper of calamansi.",
          price: 190,
        },
      ],
    },
    breakfast: {
      title: "Breakfast",
      subtitle: "Until 2:00 PM",
      items: [
        {
          name: "Soft Scramble on Sourdough",
          description:
            "Local free-range eggs, slow-folded with French cultured butter, garden chives, sea salt flakes.",
          price: 340,
        },
        {
          name: "Honey & Ricotta Brioche",
          description:
            "Whipped house whole-milk ricotta, mountain wildflower honey, seasonal figs on thick-cut toasted brioche.",
          price: 290,
        },
        {
          name: "Morning Greens & Spelt Bowl",
          description:
            "Soft poached farm egg, Hass avocado, warm ancient grains, tossed with tender herbs and lemon olive oil.",
          price: 360,
        },
      ],
    },
    kitchenAndBakery: {
      title: "Kitchen & Bakery",
      subtitle: "All Day",
      items: [
        {
          name: "Toasted Ham & Gruyère Baguette",
          description:
            "Artisan Paris ham, melted cave-aged Gruyère, seeded Dijon butter, cornichons, organic wild greens.",
          price: 420,
        },
        {
          name: "Smoked Trout & Fennel Tartine",
          description:
            "Whipped strained labneh, pickled caper berries, shaved baby fennel, dill oil on seeded dark rye.",
          price: 440,
        },
        {
          name: "Cardamom & Cinnamon Knot",
          description:
            "Flaky Scandinavian laminated dough woven with fragrant crushed green cardamom and pearl sugar.",
          price: 160,
        },
        {
          name: "Classic Kouign-Amann",
          description:
            "Breton caramelized pastry layered with Brittany butter and golden crystalline sugar crust.",
          price: 175,
        },
      ],
    },
  },
} as const;

export type SeatingWindowValue = (typeof siteConfig.seatingWindows)[number]["value"];
export type GuestCountValue = (typeof siteConfig.guestCountOptions)[number]["value"];
