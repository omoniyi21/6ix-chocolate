// 6IX Chocolate Co. menu. Names and prices match her current order form.
// `image` is null where we don't have her own photo yet: the card shows a
// styled placeholder instead of someone else's product.

export const DONATION_RATE = 0.2;
export const CHARITY = "Freedom Acres Ranch";
export const CHARITY_PLACE = "Yoder, Colorado";

// Placeholder until Nawal confirms her minimum notice for orders.
export const LEAD_TIME_LABEL = "[X] days";

export const MENU = [
  {
    id: "strawberry-dozen",
    name: "Chocolate Covered Strawberry Dozen Box",
    short: "Strawberry Dozen",
    price: 32,
    blurb: "Twelve hand-dipped strawberries, boxed and ready to give.",
    image: "/images/strawberry-dozen.webp",
    alt: "Chocolate covered strawberries in milk, dark and pink chocolate with gold and bow details",
  },
  {
    id: "cheesecake-cone",
    name: "Strawberry Cheesecake Crunch Cone",
    short: "Cheesecake Cone",
    price: 11,
    blurb: "Strawberries and cheesecake crunch, layered in a cone.",
    image: "/images/cheesecake-cone.webp",
    alt: "A row of crunch cones filled with strawberry cheesecake, drizzled in white chocolate",
  },
  {
    id: "cheesecake-shooter",
    name: "Strawberry Cheesecake Shooter",
    short: "Cheesecake Shooter",
    price: 6,
    blurb: "A single-serve cup of strawberry cheesecake.",
    image: "/images/cheesecake-shooter.webp",
    alt: "Strawberry cheesecake shooters in clear stemmed cups",
  },
  {
    id: "cake-pop-flight",
    name: "Gourmet Cake Pop Flight",
    short: "Cake Pop Flight",
    price: 13,
    blurb: "A flight of hand-decorated cake pops.",
    image: null,
  },
  {
    id: "krispy-wand-duo",
    name: "Rice Krispy Wand Duo (Halal)",
    short: "Krispy Wand Duo",
    price: 11,
    blurb: "Two dipped and decorated rice krispy wands. Halal.",
    image: "/images/krispy-wand-duo.webp",
    alt: "A star-shaped rice krispy wand drizzled in chocolate with gold ribbon",
  },
  {
    id: "teacher-box",
    name: "Sponsor a Local Teacher Treat Box",
    short: "Teacher Treat Box",
    price: 30,
    blurb: "A treat box delivered to a local educator, on you.",
    image: null,
    teacher: true,
  },
];

export const money = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: n % 1 ? 2 : 0 });
