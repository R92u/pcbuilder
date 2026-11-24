const focusG = {
  "family": "focus-g",
  "brand": "Fractal Design",
  "manufacturer": "Fractal Design",
  "gpuLimit": 380,
  "coolerLimit": 165,
  "psuLimit": 230,
  "forms": [
    "ATX",
    "Micro-ATX",
    "Mini-ITX"
  ],
  "dimensions": {
    "length": 464,
    "width": 205,
    "height": 444
  },
  "radiators": {
    "top": [
      240
    ],
    "front": [
      240
    ]
  },
  "frontFanCount": 2,
  "frontFanMounts": 2,
  "rearFanCount": 0,
  "leftFanCount": 0,
  "usbA": 1,
  "usb2": 1,
  "usbC": 0,
  "audio": "2 × 3,5 мм",
  "entryAddedAt": "2026-11-24"
};

const view270 = {
  "family": "view-270",
  "brand": "Thermaltake",
  "manufacturer": "Thermaltake",
  "gpuLimit": 420,
  "coolerLimit": 180,
  "psuLimit": 220,
  "forms": [
    "ATX",
    "Micro-ATX",
    "Mini-ITX",
    "E-ATX"
  ],
  "dimensions": {
    "length": 454,
    "width": 230,
    "height": 456
  },
  "radiators": {
    "top": [
      240,
      360
    ],
    "front": []
  },
  "frontFanCount": 0,
  "frontFanMounts": 0,
  "rearFanCount": 1,
  "leftFanCount": 2,
  "usbA": 2,
  "usb2": 0,
  "usbC": 1,
  "audio": "1 × комбинированный 3,5 мм",
  "entryAddedAt": "2026-11-24"
};

export const colorCases = [
  {
    ...focusG,
    id: "focus-g-red",
    short: "Focus G Mystic Red",
    name: "Fractal Design Focus G Mystic Red",
    sku: "FD-CA-FOCUS-RD-W",
    color: "red",
    paint: "#aa272c",
    detail: "Mystic Red · Сетчатый фасад · 2×120 мм LED спереди",
    sources: ["https://www.fractal-design.cn/products/cases/focus/focus-g/mystic-red/"]
  },
  {
    ...focusG,
    id: "focus-g-blue",
    short: "Focus G Petrol Blue",
    name: "Fractal Design Focus G Petrol Blue",
    sku: "FD-CA-FOCUS-BU-W",
    color: "blue",
    paint: "#346a80",
    detail: "Petrol Blue · Сетчатый фасад · 2×120 мм LED спереди",
    sources: ["https://www.fractal-design.cn/products/cases/focus/focus-g/petrol-blue/"]
  },
  {
    ...focusG,
    id: "focus-g-gray",
    short: "Focus G Gunmetal Gray",
    name: "Fractal Design Focus G Gunmetal Gray",
    sku: "FD-CA-FOCUS-GY-W",
    color: "gray",
    paint: "#67696b",
    detail: "Gunmetal Gray · Сетчатый фасад · 2×120 мм LED спереди",
    sources: ["https://www.fractal-design.cn/products/cases/focus/focus-g/gunmetal-gray/"]
  },
  {
    ...view270,
    id: "view-270-green",
    short: "View 270 Plus Matcha Green",
    name: "Thermaltake View 270 Plus TG ARGB Matcha Green",
    sku: "CA-1Y7-00MEWN-01",
    color: "green",
    paint: "#a5b393",
    detail: "Matcha Green · Панорамное стекло · 2×120 мм ARGB сбоку + 1×120 мм сзади",
    sources: ["https://ru.thermaltake.com/view-270-tg-argb-plus-matcha-green-mid-tower-chassis.html"]
  },
  {
    ...view270,
    id: "view-270-pink",
    short: "View 270 Plus Bubble Pink",
    name: "Thermaltake View 270 Plus TG ARGB Bubble Pink",
    sku: "CA-1Y7-00MAWN-00",
    color: "pink",
    paint: "#edb4cb",
    detail: "Bubble Pink · Панорамное стекло · 2×120 мм ARGB сбоку + 1×120 мм сзади",
    sources: ["https://ru.thermaltake.com/view-270-plus-tg-argb-bubble-pink-mid-tower-chassis.html"]
  }
];
