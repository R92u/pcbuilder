import {catalogExtra} from './catalog-extra.js';
export const categories = [
  ['cpu','Процессор','CPU'], ['motherboard','Материнская плата','MB'],
  ['gpu','Видеокарта','GPU'], ['ram','Оперативная память','RAM'],
  ['storage','Накопитель','SSD'], ['cooler','Охлаждение','FAN'],
  ['psu','Блок питания','PSU'], ['case','Корпус','CASE']
];
// Electrical limits and dimensions are catalog facts. Thermal resistances and
// workload fractions are educational model assumptions, not benchmark results.
export const catalog = {
  "cpu": [
    {
      "id": "r5-5600",
      "name": "AMD Ryzen 5 5600",
      "short": "Ryzen 5 5600",
      "brand": "AMD",
      "socket": "AM4",
      "memory": "DDR4",
      "cores": 6,
      "tdp": 65,
      "peakPower": 88,
      "powerAssumed": true,
      "tmax": 90,
      "detail": "6 ядер / 12 потоков · AM4 · 65 Вт",
      "sources": [
        "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5600.html"
      ],
      "threads": 12,
      "baseGHz": 3.5,
      "boostGHz": 4.4,
      "integratedGraphics": false,
      "officialMemoryMaxMTs": 3200
    },
    {
      "id": "r5-7600",
      "name": "AMD Ryzen 5 7600",
      "short": "Ryzen 5 7600",
      "brand": "AMD",
      "socket": "AM5",
      "memory": "DDR5",
      "cores": 6,
      "tdp": 65,
      "peakPower": 88,
      "tmax": 95,
      "detail": "6 ядер / 12 потоков · AM5 · 65 Вт",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7600.html",
        "https://community.amd.com/t5/gaming/ryzen-7000-series-processors-let-s-talk-about-power-temperature/ba-p/554629"
      ],
      "threads": 12,
      "baseGHz": 3.8,
      "boostGHz": 5.1,
      "integratedGraphics": true,
      "officialMemoryMaxMTs": 5200
    },
    {
      "id": "r9-7900x",
      "name": "AMD Ryzen 9 7900X",
      "short": "Ryzen 9 7900X",
      "brand": "AMD",
      "socket": "AM5",
      "memory": "DDR5",
      "cores": 12,
      "tdp": 170,
      "peakPower": 230,
      "tmax": 95,
      "detail": "12 ядер / 24 потока · AM5 · 170 Вт",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-9-7900x.html",
        "https://community.amd.com/t5/gaming/ryzen-7000-series-processors-let-s-talk-about-power-temperature/ba-p/554629"
      ],
      "threads": 24,
      "baseGHz": 4.7,
      "boostGHz": 5.6,
      "integratedGraphics": true,
      "officialMemoryMaxMTs": 5200
    },
    {
      "id": "r5-5600x",
      "name": "AMD Ryzen 5 5600X",
      "short": "Ryzen 5 5600X",
      "brand": "AMD",
      "socket": "AM4",
      "memory": "DDR4",
      "cores": 6,
      "threads": 12,
      "tdp": 65,
      "peakPower": 88,
      "powerAssumed": true,
      "tmax": 95,
      "baseGHz": 3.7,
      "boostGHz": 4.6,
      "cacheMB": 32,
      "integratedGraphics": false,
      "detail": "6 ядер / 12 потоков · AM4 · DDR4 · 32 МБ L3",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-5-5600x.html"
      ],
      "notes": [
        "tdp — Default TDP AMD, тепловая проектная характеристика; это не фактическое электрическое потребление.",
        "peakPower — условный предел учебной симуляции round(TDP × 1,35). Значение PPT для этого SKU в открытой карточке AMD не указано; peakPower не выдавать за подтверждённый PPT. powerAssumed=true.",
        "cacheMB — только L3; L2 не включён.",
        "Встроенной графики нет; AMD указывает необходимость дискретной видеокарты.",
        "boostGHz — заявленная максимальная частота Boost, а не гарантированная частота всех ядер.",
        "Совместимость зависит также от списка поддерживаемых CPU и версии BIOS конкретной материнской платы."
      ]
    },
    {
      "id": "r7-5700x",
      "name": "AMD Ryzen 7 5700X",
      "short": "Ryzen 7 5700X",
      "brand": "AMD",
      "socket": "AM4",
      "memory": "DDR4",
      "cores": 8,
      "threads": 16,
      "tdp": 65,
      "peakPower": 88,
      "powerAssumed": true,
      "tmax": 90,
      "baseGHz": 3.4,
      "boostGHz": 4.6,
      "cacheMB": 32,
      "integratedGraphics": false,
      "detail": "8 ядер / 16 потоков · AM4 · DDR4 · 32 МБ L3",
      "sources": [
        "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-7-5700x.html"
      ],
      "notes": [
        "tdp — Default TDP AMD, тепловая проектная характеристика; это не фактическое электрическое потребление.",
        "peakPower — условный предел учебной симуляции round(TDP × 1,35). Значение PPT для этого SKU в открытой карточке AMD не указано; peakPower не выдавать за подтверждённый PPT. powerAssumed=true.",
        "cacheMB — только L3; L2 не включён.",
        "Встроенной графики нет; AMD указывает необходимость дискретной видеокарты.",
        "boostGHz — заявленная максимальная частота Boost, а не гарантированная частота всех ядер.",
        "Совместимость зависит также от списка поддерживаемых CPU и версии BIOS конкретной материнской платы."
      ]
    },
    {
      "id": "r7-5800x",
      "name": "AMD Ryzen 7 5800X",
      "short": "Ryzen 7 5800X",
      "brand": "AMD",
      "socket": "AM4",
      "memory": "DDR4",
      "cores": 8,
      "threads": 16,
      "tdp": 105,
      "peakPower": 142,
      "powerAssumed": true,
      "tmax": 90,
      "baseGHz": 3.8,
      "boostGHz": 4.7,
      "cacheMB": 32,
      "integratedGraphics": false,
      "detail": "8 ядер / 16 потоков · AM4 · DDR4 · 32 МБ L3",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-7-5800x.html"
      ],
      "notes": [
        "tdp — Default TDP AMD, тепловая проектная характеристика; это не фактическое электрическое потребление.",
        "peakPower — условный предел учебной симуляции round(TDP × 1,35). Значение PPT для этого SKU в открытой карточке AMD не указано; peakPower не выдавать за подтверждённый PPT. powerAssumed=true.",
        "cacheMB — только L3; L2 не включён.",
        "Встроенной графики нет; AMD указывает необходимость дискретной видеокарты.",
        "boostGHz — заявленная максимальная частота Boost, а не гарантированная частота всех ядер.",
        "Совместимость зависит также от списка поддерживаемых CPU и версии BIOS конкретной материнской платы."
      ]
    },
    {
      "id": "r7-5800x3d",
      "name": "AMD Ryzen 7 5800X3D",
      "short": "Ryzen 7 5800X3D",
      "brand": "AMD",
      "socket": "AM4",
      "memory": "DDR4",
      "cores": 8,
      "threads": 16,
      "tdp": 105,
      "peakPower": 142,
      "powerAssumed": true,
      "tmax": 90,
      "baseGHz": 3.4,
      "boostGHz": 4.5,
      "cacheMB": 96,
      "integratedGraphics": false,
      "detail": "8 ядер / 16 потоков · AM4 · DDR4 · 96 МБ L3 с 3D V-Cache",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-7-5800x3d.html"
      ],
      "notes": [
        "tdp — Default TDP AMD, тепловая проектная характеристика; это не фактическое электрическое потребление.",
        "peakPower — условный предел учебной симуляции round(TDP × 1,35). Значение PPT для этого SKU в открытой карточке AMD не указано; peakPower не выдавать за подтверждённый PPT. powerAssumed=true.",
        "cacheMB — только L3; L2 не включён.",
        "Встроенной графики нет; AMD указывает необходимость дискретной видеокарты.",
        "boostGHz — заявленная максимальная частота Boost, а не гарантированная частота всех ядер.",
        "Совместимость зависит также от списка поддерживаемых CPU и версии BIOS конкретной материнской платы."
      ]
    },
    {
      "id": "r7-7700x",
      "name": "AMD Ryzen 7 7700X",
      "short": "Ryzen 7 7700X",
      "brand": "AMD",
      "socket": "AM5",
      "memory": "DDR5",
      "cores": 8,
      "threads": 16,
      "tdp": 105,
      "peakPower": 142,
      "powerAssumed": true,
      "tmax": 95,
      "baseGHz": 4.5,
      "boostGHz": 5.4,
      "cacheMB": 32,
      "integratedGraphics": true,
      "detail": "8 ядер / 16 потоков · AM5 · DDR5 · 32 МБ L3",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700x.html"
      ],
      "notes": [
        "tdp — Default TDP AMD, тепловая проектная характеристика; это не фактическое электрическое потребление.",
        "peakPower — условный предел учебной симуляции round(TDP × 1,35). Значение PPT для этого SKU в открытой карточке AMD не указано; peakPower не выдавать за подтверждённый PPT. powerAssumed=true.",
        "cacheMB — только L3; L2 не включён.",
        "Встроенная AMD Radeon Graphics: 2 графических ядра, 2200 МГц.",
        "boostGHz — заявленная максимальная частота Boost, а не гарантированная частота всех ядер.",
        "Совместимость зависит также от списка поддерживаемых CPU и версии BIOS конкретной материнской платы."
      ]
    },
    {
      "id": "r7-7800x3d",
      "name": "AMD Ryzen 7 7800X3D",
      "short": "Ryzen 7 7800X3D",
      "brand": "AMD",
      "socket": "AM5",
      "memory": "DDR5",
      "cores": 8,
      "threads": 16,
      "tdp": 120,
      "peakPower": 162,
      "powerAssumed": true,
      "tmax": 89,
      "baseGHz": 4.2,
      "boostGHz": 5,
      "cacheMB": 96,
      "integratedGraphics": true,
      "detail": "8 ядер / 16 потоков · AM5 · DDR5 · 96 МБ L3 с 3D V-Cache",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800X3d.html"
      ],
      "notes": [
        "tdp — Default TDP AMD, тепловая проектная характеристика; это не фактическое электрическое потребление.",
        "peakPower — условный предел учебной симуляции round(TDP × 1,35). Значение PPT для этого SKU в открытой карточке AMD не указано; peakPower не выдавать за подтверждённый PPT. powerAssumed=true.",
        "cacheMB — только L3; L2 не включён.",
        "Встроенная AMD Radeon Graphics: 2 графических ядра, 2200 МГц.",
        "boostGHz — заявленная максимальная частота Boost, а не гарантированная частота всех ядер.",
        "Совместимость зависит также от списка поддерживаемых CPU и версии BIOS конкретной материнской платы."
      ]
    },
    {
      "id": "i3-12100f",
      "name": "Intel Core i3-12100F",
      "short": "Core i3-12100F",
      "brand": "Intel",
      "socket": "LGA1700",
      "memory": [
        "DDR4",
        "DDR5"
      ],
      "cores": 4,
      "threads": 8,
      "tdp": 58,
      "peakPower": 89,
      "powerAssumed": false,
      "tmax": 100,
      "baseGHz": 3.3,
      "boostGHz": 4.3,
      "cacheMB": 12,
      "integratedGraphics": false,
      "detail": "4 ядер / 8 потоков · LGA1700 · DDR4 или DDR5",
      "sources": [
        "https://www.intel.com/content/www/us/en/products/sku/132223/intel-core-i312100f-processor-12m-cache-up-to-4-30-ghz/specifications.html"
      ],
      "notes": [
        "tdp — Processor Base Power (PBP), не классический TDP; peakPower — Maximum Turbo Power (MTP) из Intel ARK. Фактическая мощность зависит от нагрузки и настроек питания платы.",
        "cacheMB — Intel Smart Cache (L3); Total L2 Cache не включён.",
        "Все ядра — P-ядра; E-ядер нет.",
        "Контроллер поддерживает DDR4-3200 или DDR5-4800. Тип установленной памяти выбирается по материнской плате; обе генерации нельзя считать взаимозаменяемыми или одновременно поддерживаемыми её слотами.",
        "Модель с суффиксом F: встроенная графика отсутствует, требуется дискретная видеокарта.",
        "Сокет в Intel ARK называется FCLGA1700; в каталоге нормализован до LGA1700.",
        "Максимальная Turbo-частота не означает постоянную частоту всех ядер. Перед подбором платы проверить её список CPU и требуемую версию BIOS."
      ]
    },
    {
      "id": "i5-12400f",
      "name": "Intel Core i5-12400F",
      "short": "Core i5-12400F",
      "brand": "Intel",
      "socket": "LGA1700",
      "memory": [
        "DDR4",
        "DDR5"
      ],
      "cores": 6,
      "threads": 12,
      "tdp": 65,
      "peakPower": 117,
      "powerAssumed": false,
      "tmax": 100,
      "baseGHz": 2.5,
      "boostGHz": 4.4,
      "cacheMB": 18,
      "integratedGraphics": false,
      "detail": "6 ядер / 12 потоков · LGA1700 · DDR4 или DDR5",
      "sources": [
        "https://www.intel.com/content/www/us/en/products/sku/134587/intel-core-i512400f-processor-18m-cache-up-to-4-40-ghz/specifications.html"
      ],
      "notes": [
        "tdp — Processor Base Power (PBP), не классический TDP; peakPower — Maximum Turbo Power (MTP) из Intel ARK. Фактическая мощность зависит от нагрузки и настроек питания платы.",
        "cacheMB — Intel Smart Cache (L3); Total L2 Cache не включён.",
        "Все ядра — P-ядра; E-ядер нет.",
        "Контроллер поддерживает DDR4-3200 или DDR5-4800. Тип установленной памяти выбирается по материнской плате; обе генерации нельзя считать взаимозаменяемыми или одновременно поддерживаемыми её слотами.",
        "Модель с суффиксом F: встроенная графика отсутствует, требуется дискретная видеокарта.",
        "Сокет в Intel ARK называется FCLGA1700; в каталоге нормализован до LGA1700.",
        "Максимальная Turbo-частота не означает постоянную частоту всех ядер. Перед подбором платы проверить её список CPU и требуемую версию BIOS."
      ]
    },
    {
      "id": "i5-12600k",
      "name": "Intel Core i5-12600K",
      "short": "Core i5-12600K",
      "brand": "Intel",
      "socket": "LGA1700",
      "memory": [
        "DDR4",
        "DDR5"
      ],
      "cores": 10,
      "threads": 16,
      "tdp": 125,
      "peakPower": 150,
      "powerAssumed": false,
      "tmax": 100,
      "baseGHz": 3.7,
      "boostGHz": 4.9,
      "cacheMB": 20,
      "integratedGraphics": true,
      "detail": "10 ядер (6P + 4E) / 16 потоков · LGA1700 · DDR4 или DDR5",
      "sources": [
        "https://www.intel.com/content/www/us/en/products/sku/134589/intel-core-i512600k-processor-20m-cache-up-to-4-90-ghz/specifications.html"
      ],
      "notes": [
        "tdp — Processor Base Power (PBP), не классический TDP; peakPower — Maximum Turbo Power (MTP) из Intel ARK. Фактическая мощность зависит от нагрузки и настроек питания платы.",
        "cacheMB — Intel Smart Cache (L3); Total L2 Cache не включён.",
        "baseGHz и boostGHz относятся к P-ядрам. E-ядра: база 2.8 ГГц, максимум 3.6 ГГц.",
        "Контроллер поддерживает DDR4-3200 или DDR5-4800. Тип установленной памяти выбирается по материнской плате; обе генерации нельзя считать взаимозаменяемыми или одновременно поддерживаемыми её слотами.",
        "Встроенная графика — Intel UHD Graphics 770.",
        "Сокет в Intel ARK называется FCLGA1700; в каталоге нормализован до LGA1700.",
        "Максимальная Turbo-частота не означает постоянную частоту всех ядер. Перед подбором платы проверить её список CPU и требуемую версию BIOS."
      ]
    },
    {
      "id": "i5-13400f",
      "name": "Intel Core i5-13400F",
      "short": "Core i5-13400F",
      "brand": "Intel",
      "socket": "LGA1700",
      "memory": [
        "DDR4",
        "DDR5"
      ],
      "cores": 10,
      "threads": 16,
      "tdp": 65,
      "peakPower": 148,
      "powerAssumed": false,
      "tmax": 100,
      "baseGHz": 2.5,
      "boostGHz": 4.6,
      "cacheMB": 20,
      "integratedGraphics": false,
      "detail": "10 ядер (6P + 4E) / 16 потоков · LGA1700 · DDR4 или DDR5",
      "sources": [
        "https://www.intel.com/content/www/us/en/products/sku/230501/intel-core-i513400f-processor-20m-cache-up-to-4-60-ghz/specifications.html"
      ],
      "notes": [
        "tdp — Processor Base Power (PBP), не классический TDP; peakPower — Maximum Turbo Power (MTP) из Intel ARK. Фактическая мощность зависит от нагрузки и настроек питания платы.",
        "cacheMB — Intel Smart Cache (L3); Total L2 Cache не включён.",
        "baseGHz и boostGHz относятся к P-ядрам. E-ядра: база 1.8 ГГц, максимум 3.3 ГГц.",
        "Контроллер поддерживает DDR4-3200 или DDR5-4800. Тип установленной памяти выбирается по материнской плате; обе генерации нельзя считать взаимозаменяемыми или одновременно поддерживаемыми её слотами.",
        "Модель с суффиксом F: встроенная графика отсутствует, требуется дискретная видеокарта.",
        "Сокет в Intel ARK называется FCLGA1700; в каталоге нормализован до LGA1700.",
        "Максимальная Turbo-частота не означает постоянную частоту всех ядер. Перед подбором платы проверить её список CPU и требуемую версию BIOS."
      ]
    },
    {
      "id": "i5-13600k",
      "name": "Intel Core i5-13600K",
      "short": "Core i5-13600K",
      "brand": "Intel",
      "socket": "LGA1700",
      "memory": [
        "DDR4",
        "DDR5"
      ],
      "cores": 14,
      "threads": 20,
      "tdp": 125,
      "peakPower": 181,
      "powerAssumed": false,
      "tmax": 100,
      "baseGHz": 3.5,
      "boostGHz": 5.1,
      "cacheMB": 24,
      "integratedGraphics": true,
      "detail": "14 ядер (6P + 8E) / 20 потоков · LGA1700 · DDR4 или DDR5",
      "sources": [
        "https://www.intel.com/content/www/us/en/products/sku/230493/intel-core-i513600k-processor-24m-cache-up-to-5-10-ghz/specifications.html"
      ],
      "notes": [
        "tdp — Processor Base Power (PBP), не классический TDP; peakPower — Maximum Turbo Power (MTP) из Intel ARK. Фактическая мощность зависит от нагрузки и настроек питания платы.",
        "cacheMB — Intel Smart Cache (L3); Total L2 Cache не включён.",
        "baseGHz и boostGHz относятся к P-ядрам. E-ядра: база 2.6 ГГц, максимум 3.9 ГГц.",
        "Контроллер поддерживает DDR4-3200 или DDR5-5600. Тип установленной памяти выбирается по материнской плате; обе генерации нельзя считать взаимозаменяемыми или одновременно поддерживаемыми её слотами.",
        "Встроенная графика — Intel UHD Graphics 770.",
        "Сокет в Intel ARK называется FCLGA1700; в каталоге нормализован до LGA1700.",
        "Максимальная Turbo-частота не означает постоянную частоту всех ядер. Перед подбором платы проверить её список CPU и требуемую версию BIOS."
      ]
    },
    {
      "id": "i5-14600k",
      "name": "Intel Core i5-14600K",
      "short": "Core i5-14600K",
      "brand": "Intel",
      "socket": "LGA1700",
      "memory": [
        "DDR4",
        "DDR5"
      ],
      "cores": 14,
      "threads": 20,
      "tdp": 125,
      "peakPower": 181,
      "powerAssumed": false,
      "tmax": 100,
      "baseGHz": 3.5,
      "boostGHz": 5.3,
      "cacheMB": 24,
      "integratedGraphics": true,
      "detail": "14 ядер (6P + 8E) / 20 потоков · LGA1700 · DDR4 или DDR5",
      "sources": [
        "https://www.intel.com/content/www/us/en/products/sku/236799/intel-core-i5-processor-14600k-24m-cache-up-to-5-30-ghz/specifications.html"
      ],
      "notes": [
        "tdp — Processor Base Power (PBP), не классический TDP; peakPower — Maximum Turbo Power (MTP) из Intel ARK. Фактическая мощность зависит от нагрузки и настроек питания платы.",
        "cacheMB — Intel Smart Cache (L3); Total L2 Cache не включён.",
        "baseGHz и boostGHz относятся к P-ядрам. E-ядра: база 2.6 ГГц, максимум 4 ГГц.",
        "Контроллер поддерживает DDR4-3200 или DDR5-5600. Тип установленной памяти выбирается по материнской плате; обе генерации нельзя считать взаимозаменяемыми или одновременно поддерживаемыми её слотами.",
        "Встроенная графика — Intel UHD Graphics 770.",
        "Сокет в Intel ARK называется FCLGA1700; в каталоге нормализован до LGA1700.",
        "Максимальная Turbo-частота не означает постоянную частоту всех ядер. Перед подбором платы проверить её список CPU и требуемую версию BIOS."
      ]
    },
    {
      "id": "r5-5500",
      "name": "AMD Ryzen 5 5500",
      "short": "Ryzen 5 5500",
      "brand": "AMD",
      "socket": "AM4",
      "memory": "DDR4",
      "cores": 6,
      "threads": 12,
      "tdp": 65,
      "peakPower": 88,
      "powerAssumed": true,
      "tmax": 90,
      "baseGHz": 3.6,
      "boostGHz": 4.2,
      "cacheMB": 16,
      "integratedGraphics": false,
      "officialMemoryMaxMTs": 3200,
      "pcie": "3.0",
      "detail": "6 ядер / 12 потоков · AM4 · DDR4 · 65 Вт",
      "sources": [
        "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5500.html"
      ],
      "notes": [
        "TDP — тепловая проектная характеристика AMD, не измеренное электрическое потребление.",
        "peakPower — условный предел учебной модели round(TDP × 1,35); не подтверждённый PPT этого SKU. powerAssumed=true.",
        "cacheMB содержит только L3. Частота Boost — максимум для подходящих условий, не частота всех ядер.",
        "Поддержка процессора зависит от BIOS и официального CPU Support List платы."
      ]
    },
    {
      "id": "r5-5600g",
      "name": "AMD Ryzen 5 5600G",
      "short": "Ryzen 5 5600G",
      "brand": "AMD",
      "socket": "AM4",
      "memory": "DDR4",
      "cores": 6,
      "threads": 12,
      "tdp": 65,
      "peakPower": 88,
      "powerAssumed": true,
      "tmax": 95,
      "baseGHz": 3.9,
      "boostGHz": 4.4,
      "cacheMB": 16,
      "integratedGraphics": true,
      "officialMemoryMaxMTs": 3200,
      "pcie": "3.0",
      "detail": "6 ядер / 12 потоков · AM4 · DDR4 · 65 Вт",
      "sources": [
        "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5600g.html"
      ],
      "notes": [
        "TDP — тепловая проектная характеристика AMD, не измеренное электрическое потребление.",
        "peakPower — условный предел учебной модели round(TDP × 1,35); не подтверждённый PPT этого SKU. powerAssumed=true.",
        "cacheMB содержит только L3. Частота Boost — максимум для подходящих условий, не частота всех ядер.",
        "Поддержка процессора зависит от BIOS и официального CPU Support List платы."
      ]
    },
    {
      "id": "r7-5700g",
      "name": "AMD Ryzen 7 5700G",
      "short": "Ryzen 7 5700G",
      "brand": "AMD",
      "socket": "AM4",
      "memory": "DDR4",
      "cores": 8,
      "threads": 16,
      "tdp": 65,
      "peakPower": 88,
      "powerAssumed": true,
      "tmax": 95,
      "baseGHz": 3.8,
      "boostGHz": 4.6,
      "cacheMB": 16,
      "integratedGraphics": true,
      "officialMemoryMaxMTs": 3200,
      "pcie": "3.0",
      "detail": "8 ядер / 16 потоков · AM4 · DDR4 · 65 Вт",
      "sources": [
        "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-7-5700g.html"
      ],
      "notes": [
        "TDP — тепловая проектная характеристика AMD, не измеренное электрическое потребление.",
        "peakPower — условный предел учебной модели round(TDP × 1,35); не подтверждённый PPT этого SKU. powerAssumed=true.",
        "cacheMB содержит только L3. Частота Boost — максимум для подходящих условий, не частота всех ядер.",
        "Поддержка процессора зависит от BIOS и официального CPU Support List платы."
      ]
    },
    {
      "id": "r9-5900x",
      "name": "AMD Ryzen 9 5900X",
      "short": "Ryzen 9 5900X",
      "brand": "AMD",
      "socket": "AM4",
      "memory": "DDR4",
      "cores": 12,
      "threads": 24,
      "tdp": 105,
      "peakPower": 142,
      "powerAssumed": true,
      "tmax": 90,
      "baseGHz": 3.7,
      "boostGHz": 4.8,
      "cacheMB": 64,
      "integratedGraphics": false,
      "officialMemoryMaxMTs": 3200,
      "pcie": "4.0",
      "detail": "12 ядер / 24 потоков · AM4 · DDR4 · 105 Вт",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-9-5900x.html"
      ],
      "notes": [
        "TDP — тепловая проектная характеристика AMD, не измеренное электрическое потребление.",
        "peakPower — условный предел учебной модели round(TDP × 1,35); не подтверждённый PPT этого SKU. powerAssumed=true.",
        "cacheMB содержит только L3. Частота Boost — максимум для подходящих условий, не частота всех ядер.",
        "Поддержка процессора зависит от BIOS и официального CPU Support List платы."
      ]
    },
    {
      "id": "r9-5950x",
      "name": "AMD Ryzen 9 5950X",
      "short": "Ryzen 9 5950X",
      "brand": "AMD",
      "socket": "AM4",
      "memory": "DDR4",
      "cores": 16,
      "threads": 32,
      "tdp": 105,
      "peakPower": 142,
      "powerAssumed": true,
      "tmax": 90,
      "baseGHz": 3.4,
      "boostGHz": 4.9,
      "cacheMB": 64,
      "integratedGraphics": false,
      "officialMemoryMaxMTs": 3200,
      "pcie": "4.0",
      "detail": "16 ядер / 32 потоков · AM4 · DDR4 · 105 Вт",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-9-5950x.html"
      ],
      "notes": [
        "TDP — тепловая проектная характеристика AMD, не измеренное электрическое потребление.",
        "peakPower — условный предел учебной модели round(TDP × 1,35); не подтверждённый PPT этого SKU. powerAssumed=true.",
        "cacheMB содержит только L3. Частота Boost — максимум для подходящих условий, не частота всех ядер.",
        "Поддержка процессора зависит от BIOS и официального CPU Support List платы."
      ]
    },
    {
      "id": "r5-7600x",
      "name": "AMD Ryzen 5 7600X",
      "short": "Ryzen 5 7600X",
      "brand": "AMD",
      "socket": "AM5",
      "memory": "DDR5",
      "cores": 6,
      "threads": 12,
      "tdp": 105,
      "peakPower": 142,
      "powerAssumed": true,
      "tmax": 95,
      "baseGHz": 4.7,
      "boostGHz": 5.3,
      "cacheMB": 32,
      "integratedGraphics": true,
      "officialMemoryMaxMTs": 5200,
      "pcie": "5.0",
      "detail": "6 ядер / 12 потоков · AM5 · DDR5 · 105 Вт",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7600x.html"
      ],
      "notes": [
        "TDP — тепловая проектная характеристика AMD, не измеренное электрическое потребление.",
        "peakPower — условный предел учебной модели round(TDP × 1,35); не подтверждённый PPT этого SKU. powerAssumed=true.",
        "cacheMB содержит только L3. Частота Boost — максимум для подходящих условий, не частота всех ядер.",
        "Поддержка процессора зависит от BIOS и официального CPU Support List платы."
      ]
    },
    {
      "id": "r7-7700",
      "name": "AMD Ryzen 7 7700",
      "short": "Ryzen 7 7700",
      "brand": "AMD",
      "socket": "AM5",
      "memory": "DDR5",
      "cores": 8,
      "threads": 16,
      "tdp": 65,
      "peakPower": 88,
      "powerAssumed": true,
      "tmax": 95,
      "baseGHz": 3.8,
      "boostGHz": 5.3,
      "cacheMB": 32,
      "integratedGraphics": true,
      "officialMemoryMaxMTs": 5200,
      "pcie": "5.0",
      "detail": "8 ядер / 16 потоков · AM5 · DDR5 · 65 Вт",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700.html"
      ],
      "notes": [
        "TDP — тепловая проектная характеристика AMD, не измеренное электрическое потребление.",
        "peakPower — условный предел учебной модели round(TDP × 1,35); не подтверждённый PPT этого SKU. powerAssumed=true.",
        "cacheMB содержит только L3. Частота Boost — максимум для подходящих условий, не частота всех ядер.",
        "Поддержка процессора зависит от BIOS и официального CPU Support List платы."
      ]
    },
    {
      "id": "r9-7900",
      "name": "AMD Ryzen 9 7900",
      "short": "Ryzen 9 7900",
      "brand": "AMD",
      "socket": "AM5",
      "memory": "DDR5",
      "cores": 12,
      "threads": 24,
      "tdp": 65,
      "peakPower": 88,
      "powerAssumed": true,
      "tmax": 95,
      "baseGHz": 3.7,
      "boostGHz": 5.4,
      "cacheMB": 64,
      "integratedGraphics": true,
      "officialMemoryMaxMTs": 5200,
      "pcie": "5.0",
      "detail": "12 ядер / 24 потоков · AM5 · DDR5 · 65 Вт",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-9-7900.html"
      ],
      "notes": [
        "TDP — тепловая проектная характеристика AMD, не измеренное электрическое потребление.",
        "peakPower — условный предел учебной модели round(TDP × 1,35); не подтверждённый PPT этого SKU. powerAssumed=true.",
        "cacheMB содержит только L3. Частота Boost — максимум для подходящих условий, не частота всех ядер.",
        "Поддержка процессора зависит от BIOS и официального CPU Support List платы."
      ]
    },
    {
      "id": "r9-7950x",
      "name": "AMD Ryzen 9 7950X",
      "short": "Ryzen 9 7950X",
      "brand": "AMD",
      "socket": "AM5",
      "memory": "DDR5",
      "cores": 16,
      "threads": 32,
      "tdp": 170,
      "peakPower": 230,
      "powerAssumed": true,
      "tmax": 95,
      "baseGHz": 4.5,
      "boostGHz": 5.7,
      "cacheMB": 64,
      "integratedGraphics": true,
      "officialMemoryMaxMTs": 5200,
      "pcie": "5.0",
      "detail": "16 ядер / 32 потоков · AM5 · DDR5 · 170 Вт",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-9-7950x.html"
      ],
      "notes": [
        "TDP — тепловая проектная характеристика AMD, не измеренное электрическое потребление.",
        "peakPower — условный предел учебной модели round(TDP × 1,35); не подтверждённый PPT этого SKU. powerAssumed=true.",
        "cacheMB содержит только L3. Частота Boost — максимум для подходящих условий, не частота всех ядер.",
        "Поддержка процессора зависит от BIOS и официального CPU Support List платы."
      ]
    },
    {
      "id": "r5-9600x",
      "name": "AMD Ryzen 5 9600X",
      "short": "Ryzen 5 9600X",
      "brand": "AMD",
      "socket": "AM5",
      "memory": "DDR5",
      "cores": 6,
      "threads": 12,
      "tdp": 65,
      "peakPower": 88,
      "powerAssumed": true,
      "tmax": 95,
      "baseGHz": 3.9,
      "boostGHz": 5.4,
      "cacheMB": 32,
      "integratedGraphics": true,
      "officialMemoryMaxMTs": 5600,
      "pcie": "5.0",
      "detail": "6 ядер / 12 потоков · AM5 · DDR5 · 65 Вт",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-5-9600x.html"
      ],
      "notes": [
        "TDP — тепловая проектная характеристика AMD, не измеренное электрическое потребление.",
        "peakPower — условный предел учебной модели round(TDP × 1,35); не подтверждённый PPT этого SKU. powerAssumed=true.",
        "cacheMB содержит только L3. Частота Boost — максимум для подходящих условий, не частота всех ядер.",
        "Поддержка процессора зависит от BIOS и официального CPU Support List платы.",
        "Используется штатный TDP из карточки AMD; дополнительные режимы мощности BIOS/PBO симуляция не воспроизводит. Для плат AM5 ранних выпусков проверь BIOS для Ryzen 9000."
      ]
    },
    {
      "id": "r7-9700x",
      "name": "AMD Ryzen 7 9700X",
      "short": "Ryzen 7 9700X",
      "brand": "AMD",
      "socket": "AM5",
      "memory": "DDR5",
      "cores": 8,
      "threads": 16,
      "tdp": 65,
      "peakPower": 88,
      "powerAssumed": true,
      "tmax": 95,
      "baseGHz": 3.8,
      "boostGHz": 5.5,
      "cacheMB": 32,
      "integratedGraphics": true,
      "officialMemoryMaxMTs": 5600,
      "pcie": "5.0",
      "detail": "8 ядер / 16 потоков · AM5 · DDR5 · 65 Вт",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9700x.html"
      ],
      "notes": [
        "TDP — тепловая проектная характеристика AMD, не измеренное электрическое потребление.",
        "peakPower — условный предел учебной модели round(TDP × 1,35); не подтверждённый PPT этого SKU. powerAssumed=true.",
        "cacheMB содержит только L3. Частота Boost — максимум для подходящих условий, не частота всех ядер.",
        "Поддержка процессора зависит от BIOS и официального CPU Support List платы.",
        "Используется штатный TDP из карточки AMD; дополнительные режимы мощности BIOS/PBO симуляция не воспроизводит. Для плат AM5 ранних выпусков проверь BIOS для Ryzen 9000."
      ]
    },
    {
      "id": "r9-9900x",
      "name": "AMD Ryzen 9 9900X",
      "short": "Ryzen 9 9900X",
      "brand": "AMD",
      "socket": "AM5",
      "memory": "DDR5",
      "cores": 12,
      "threads": 24,
      "tdp": 120,
      "peakPower": 162,
      "powerAssumed": true,
      "tmax": 95,
      "baseGHz": 4.4,
      "boostGHz": 5.6,
      "cacheMB": 64,
      "integratedGraphics": true,
      "officialMemoryMaxMTs": 5600,
      "pcie": "5.0",
      "detail": "12 ядер / 24 потоков · AM5 · DDR5 · 120 Вт",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9900x.html"
      ],
      "notes": [
        "TDP — тепловая проектная характеристика AMD, не измеренное электрическое потребление.",
        "peakPower — условный предел учебной модели round(TDP × 1,35); не подтверждённый PPT этого SKU. powerAssumed=true.",
        "cacheMB содержит только L3. Частота Boost — максимум для подходящих условий, не частота всех ядер.",
        "Поддержка процессора зависит от BIOS и официального CPU Support List платы.",
        "Используется штатный TDP из карточки AMD; дополнительные режимы мощности BIOS/PBO симуляция не воспроизводит. Для плат AM5 ранних выпусков проверь BIOS для Ryzen 9000."
      ]
    },
    {
      "id": "r9-9950x",
      "name": "AMD Ryzen 9 9950X",
      "short": "Ryzen 9 9950X",
      "brand": "AMD",
      "socket": "AM5",
      "memory": "DDR5",
      "cores": 16,
      "threads": 32,
      "tdp": 170,
      "peakPower": 230,
      "powerAssumed": true,
      "tmax": 95,
      "baseGHz": 4.3,
      "boostGHz": 5.7,
      "cacheMB": 64,
      "integratedGraphics": true,
      "officialMemoryMaxMTs": 5600,
      "pcie": "5.0",
      "detail": "16 ядер / 32 потоков · AM5 · DDR5 · 170 Вт",
      "sources": [
        "https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x.html"
      ],
      "notes": [
        "TDP — тепловая проектная характеристика AMD, не измеренное электрическое потребление.",
        "peakPower — условный предел учебной модели round(TDP × 1,35); не подтверждённый PPT этого SKU. powerAssumed=true.",
        "cacheMB содержит только L3. Частота Boost — максимум для подходящих условий, не частота всех ядер.",
        "Поддержка процессора зависит от BIOS и официального CPU Support List платы.",
        "Используется штатный TDP из карточки AMD; дополнительные режимы мощности BIOS/PBO симуляция не воспроизводит. Для плат AM5 ранних выпусков проверь BIOS для Ryzen 9000."
      ]
    },
    {
      "id": "i7-12700k",
      "name": "Intel Core i7-12700K",
      "short": "Core i7-12700K",
      "brand": "Intel",
      "socket": "LGA1700",
      "memory": [
        "DDR4",
        "DDR5"
      ],
      "cores": 12,
      "threads": 20,
      "tdp": 125,
      "peakPower": 190,
      "powerAssumed": false,
      "tmax": 100,
      "baseGHz": 3.6,
      "boostGHz": 5,
      "cacheMB": 25,
      "integratedGraphics": true,
      "officialMemoryMaxMTs": {
        "DDR4": 3200,
        "DDR5": 4800
      },
      "maxRam": 128,
      "dimensions": [
        45,
        37.5
      ],
      "pcie": "5.0 / 4.0",
      "detail": "12 ядер / 20 потоков · LGA1700 · DDR4/DDR5 · UHD 770",
      "sources": [
        "https://www.intel.com/content/www/us/en/products/sku/134594/intel-core-i712700k-processor-25m-cache-up-to-5-00-ghz/specifications.html"
      ],
      "notes": [
        "tdp — Processor Base Power (PBP); peakPower — официальный Maximum Turbo Power (MTP) Intel.",
        "baseGHz — базовая частота P-ядер; boostGHz — Max Turbo Frequency с Turbo Boost Max 3.0.",
        "Тип памяти определяется материнской платой: DDR4 и DDR5 нельзя установить одновременно."
      ]
    },
    {
      "id": "i7-14700k",
      "name": "Intel Core i7-14700K",
      "short": "Core i7-14700K",
      "brand": "Intel",
      "socket": "LGA1700",
      "memory": [
        "DDR4",
        "DDR5"
      ],
      "cores": 20,
      "threads": 28,
      "tdp": 125,
      "peakPower": 253,
      "powerAssumed": false,
      "tmax": 100,
      "baseGHz": 3.4,
      "boostGHz": 5.6,
      "cacheMB": 33,
      "integratedGraphics": true,
      "officialMemoryMaxMTs": {
        "DDR4": 3200,
        "DDR5": 5600
      },
      "maxRam": 192,
      "dimensions": [
        45,
        37.5
      ],
      "pcie": "5.0 / 4.0",
      "detail": "20 ядер / 28 потоков · LGA1700 · DDR4/DDR5 · UHD 770",
      "sources": [
        "https://www.intel.com/content/www/us/en/products/sku/236783/intel-core-i7-processor-14700k-33m-cache-up-to-5-60-ghz/specifications.html"
      ],
      "notes": [
        "tdp — Processor Base Power (PBP); peakPower — официальный Maximum Turbo Power (MTP) Intel. Фактическое потребление зависит от нагрузки и настроек платы.",
        "baseGHz — базовая частота P-ядер; boostGHz — Max Turbo Frequency с Turbo Boost Max 3.0.",
        "Тип памяти определяется материнской платой: DDR4 и DDR5 нельзя установить одновременно.",
        "Для Core 14-го поколения нужен совместимый BIOS с актуальным микрокодом производителя платы."
      ]
    }
  ],
  "motherboard": [
    {
      "id": "b550",
      "name": "MSI B550-A PRO",
      "short": "B550-A PRO",
      "socket": "AM4",
      "memory": "DDR4",
      "form": "ATX",
      "slots": 4,
      "maxRam": 128,
      "m2": true,
      "detail": "ATX · AM4 · 4 слота DDR4 · M.2",
      "biosNote": "Для Ryzen 5 5600 может потребоваться обновление BIOS.",
      "sources": [
        "https://www.msi.com/Motherboard/B550-A-PRO/Specification",
        "https://www.msi.com/Motherboard/B550-A-PRO/support#cpu"
      ],
      "dimensions": [
        305,
        244
      ],
      "m2Slots": 2,
      "epsConnectors": 1,
      "brand": "MSI",
      "usbCHeader": true
    },
    {
      "id": "b650",
      "name": "MSI PRO B650-S WIFI",
      "short": "PRO B650-S WIFI",
      "socket": "AM5",
      "memory": "DDR5",
      "form": "ATX",
      "slots": 4,
      "maxRam": 256,
      "m2": true,
      "detail": "ATX · AM5 · 4 слота DDR5 · Wi-Fi",
      "biosNote": "Перед покупкой сверь версию BIOS со списком поддержки CPU.",
      "sources": [
        "https://uk.msi.com/Motherboard/PRO-B650-S-WIFI/Specification",
        "https://download.msi.com/archive/mnu_exe/mb/PROB650-SWIFI.pdf",
        "https://www.msi.com/Motherboard/PRO-B650-S-WIFI/support#cpu"
      ],
      "dimensions": [
        304.8,
        243.84
      ],
      "m2Slots": 2,
      "epsConnectors": 2,
      "brand": "MSI",
      "usbCHeader": true
    },
    {
      "id": "b760m-p-ddr4",
      "name": "MSI PRO B760M-P DDR4",
      "short": "PRO B760M-P DDR4",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "LGA1700",
      "chipset": "Intel B760",
      "memory": "DDR4",
      "form": "Micro-ATX",
      "slots": 4,
      "maxRam": 128,
      "m2": true,
      "m2Slots": 2,
      "sataPorts": 4,
      "epsConnectors": 1,
      "usbCHeader": false,
      "ports": [
        {
          "type": "usb2",
          "count": 4,
          "label": "USB 2.0 Type-A",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 1,
          "label": "USB Type-A 5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbC",
          "count": 1,
          "label": "USB Type-C 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 1.4",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort 1.4",
          "location": "rear"
        },
        {
          "type": "vga",
          "count": 1,
          "label": "VGA",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 1 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "label": "Аудио 3,5 мм: Line-in, Line-out, Mic-in",
          "location": "rear",
          "count": 3
        },
        {
          "type": "ps2",
          "label": "PS/2: отдельные клавиатура и мышь",
          "location": "rear",
          "count": 2
        }
      ],
      "detail": "Micro-ATX · LGA1700 · 4 слота DDR4 · 2× M.2",
      "biosNote": "Для Core 14-го поколения проверь версию BIOS и список поддерживаемых процессоров.",
      "notes": "Порт USB-C сзади есть, внутреннего разъёма USB-C для передней панели нет. Видеовыходы платы работают только с процессором со встроенной графикой.",
      "sources": [
        "https://www.msi.com/Motherboard/PRO-B760M-P-DDR4/Specification"
      ]
    },
    {
      "id": "b760-p-wifi",
      "name": "MSI PRO B760-P WIFI",
      "short": "PRO B760-P WIFI",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "LGA1700",
      "chipset": "Intel B760",
      "memory": "DDR5",
      "form": "ATX",
      "slots": 4,
      "maxRam": 256,
      "m2": true,
      "m2Slots": 2,
      "sataPorts": 4,
      "epsConnectors": 2,
      "usbCHeader": true,
      "ports": [
        {
          "type": "usb2",
          "count": 4,
          "label": "USB 2.0 Type-A",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 2,
          "label": "USB Type-A 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbC",
          "count": 1,
          "label": "USB Type-C 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort 1.4",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 2,5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "label": "Аналоговые аудиоразъёмы 3,5 мм",
          "location": "rear",
          "count": 5
        },
        {
          "type": "spdif",
          "label": "Оптический S/PDIF OUT",
          "location": "rear",
          "count": 1
        },
        {
          "type": "ps2",
          "label": "PS/2 Combo: клавиатура или мышь",
          "location": "rear",
          "count": 1
        },
        {
          "type": "wifi",
          "label": "Разъёмы антенн Wi-Fi / Bluetooth",
          "location": "rear",
          "count": 2
        }
      ],
      "detail": "ATX · LGA1700 · 4 слота DDR5 · Wi-Fi 6E",
      "biosNote": "Для Core 14-го поколения проверь версию BIOS и список поддерживаемых процессоров.",
      "notes": "Видеовыходы платы работают только с процессором со встроенной графикой. Указано число физических разъёмов CPU_PWR; необходимость второго зависит от руководства и нагрузки.",
      "sources": [
        "https://www.msi.com/Motherboard/PRO-B760-P-WIFI/Specification"
      ]
    },
    {
      "id": "b550-tomahawk",
      "name": "MSI MAG B550 TOMAHAWK",
      "short": "MAG B550 TOMAHAWK",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "AM4",
      "chipset": "AMD B550",
      "memory": "DDR4",
      "form": "ATX",
      "slots": 4,
      "maxRam": 128,
      "m2": true,
      "m2Slots": 2,
      "sataPorts": 6,
      "epsConnectors": 1,
      "usbCHeader": true,
      "ports": [
        {
          "type": "usb2",
          "count": 2,
          "label": "USB 2.0 Type-A",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 2,
          "label": "USB Type-A 5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 1,
          "label": "USB Type-A 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbC",
          "count": 1,
          "label": "USB Type-C 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 2,5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 1 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "label": "Аналоговые аудиоразъёмы 3,5 мм",
          "location": "rear",
          "count": 5
        },
        {
          "type": "spdif",
          "label": "Оптический S/PDIF OUT",
          "location": "rear",
          "count": 1
        },
        {
          "type": "ps2",
          "label": "PS/2 Combo: клавиатура или мышь",
          "location": "rear",
          "count": 1
        }
      ],
      "detail": "ATX · AM4 · 4 слота DDR4 · 2× M.2 · два LAN",
      "biosNote": "Для Ryzen 5000 может потребоваться обновление BIOS; сверь точную модель CPU со списком поддержки.",
      "notes": "Видеовыходы работают с процессором со встроенной графикой. Основной M.2 поддерживает PCIe 4.0/3.0 в зависимости от CPU, второй — PCIe 3.0.",
      "sources": [
        "https://www.msi.com/Motherboard/MAG-B550-TOMAHAWK/Specification"
      ]
    },
    {
      "id": "b550m-pro-vdh-wifi",
      "name": "MSI B550M PRO-VDH WIFI",
      "short": "B550M PRO-VDH WIFI",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "AM4",
      "chipset": "AMD B550",
      "memory": "DDR4",
      "form": "Micro-ATX",
      "slots": 4,
      "maxRam": 128,
      "m2": true,
      "m2Slots": 2,
      "sataPorts": 4,
      "epsConnectors": 1,
      "usbCHeader": true,
      "ports": [
        {
          "type": "usb2",
          "count": 2,
          "label": "USB 2.0 Type-A",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 4,
          "label": "USB Type-A 5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort",
          "location": "rear"
        },
        {
          "type": "vga",
          "count": 1,
          "label": "VGA",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 1 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "label": "Аудио 3,5 мм: Line-in, Line-out, Mic-in",
          "location": "rear",
          "count": 3
        },
        {
          "type": "ps2",
          "label": "PS/2 Combo: клавиатура или мышь",
          "location": "rear",
          "count": 1
        },
        {
          "type": "wifi",
          "label": "Разъёмы антенн Wi-Fi / Bluetooth",
          "location": "rear",
          "count": 2
        }
      ],
      "detail": "Micro-ATX · AM4 · 4 слота DDR4 · Wi-Fi ac",
      "biosNote": "Для Ryzen 5000 может потребоваться обновление BIOS; сверь точную модель CPU со списком поддержки.",
      "notes": "Видеовыходы работают с процессором со встроенной графикой. Есть внутренний USB-C 5 Гбит/с, но USB-C на задней панели нет.",
      "sources": [
        "https://www.msi.com/Motherboard/B550M-PRO-VDH-WIFI/Specification"
      ]
    },
    {
      "id": "b650-tomahawk-wifi",
      "name": "MSI MAG B650 TOMAHAWK WIFI",
      "short": "MAG B650 TOMAHAWK",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "AM5",
      "chipset": "AMD B650",
      "memory": "DDR5",
      "form": "ATX",
      "slots": 4,
      "maxRam": 256,
      "m2": true,
      "m2Slots": 3,
      "sataPorts": 6,
      "epsConnectors": 2,
      "usbCHeader": true,
      "ports": [
        {
          "type": "usb2",
          "count": 2,
          "label": "USB 2.0 Type-A",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 4,
          "label": "USB Type-A 5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 3,
          "label": "USB Type-A 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbC",
          "count": 1,
          "label": "USB Type-C 20 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort 1.4",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 2,5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "label": "Аналоговые аудиоразъёмы 3,5 мм",
          "location": "rear",
          "count": 5
        },
        {
          "type": "spdif",
          "label": "Оптический S/PDIF OUT",
          "location": "rear",
          "count": 1
        },
        {
          "type": "wifi",
          "label": "Разъёмы антенн Wi-Fi / Bluetooth",
          "location": "rear",
          "count": 2
        }
      ],
      "detail": "ATX · AM5 · 4 слота DDR5 · 3× M.2 · Wi-Fi 6E",
      "biosNote": "Для Ryzen 8000/9000 проверь версию BIOS по списку поддержки CPU.",
      "notes": "Доступность линий PCIe и M.2 зависит от процессора. Указано число физических разъёмов CPU_PWR; это не означает, что второй обязателен при любой нагрузке.",
      "sources": [
        "https://www.msi.com/Motherboard/MAG-B650-TOMAHAWK-WIFI/Specification"
      ]
    },
    {
      "id": "b650m-a-wifi",
      "name": "MSI PRO B650M-A WIFI",
      "short": "PRO B650M-A WIFI",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "AM5",
      "chipset": "AMD B650",
      "memory": "DDR5",
      "form": "Micro-ATX",
      "slots": 4,
      "maxRam": 256,
      "m2": true,
      "m2Slots": 2,
      "sataPorts": 4,
      "epsConnectors": 2,
      "usbCHeader": true,
      "ports": [
        {
          "type": "usbA",
          "count": 4,
          "label": "USB Type-A 5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 4,
          "label": "USB Type-A 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort 1.4",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 2,5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "label": "Аудио 3,5 мм: Line-in, Line-out, Mic-in",
          "location": "rear",
          "count": 3
        },
        {
          "type": "wifi",
          "label": "Разъёмы антенн Wi-Fi / Bluetooth",
          "location": "rear",
          "count": 2
        }
      ],
      "detail": "Micro-ATX · AM5 · 4 слота DDR5 · 2× M.2 · Wi-Fi",
      "biosNote": "Для Ryzen 8000/9000 проверь версию BIOS по списку поддержки CPU.",
      "notes": "Внутренний USB-C 10 Гбит/с присутствует; сзади USB-C нет. Доступность M.2 зависит от модели CPU. Число CPU_PWR отражает физические разъёмы.",
      "sources": [
        "https://www.msi.com/Motherboard/PRO-B650M-A-WIFI/Specification"
      ]
    },
    {
      "id": "mpg-b550-gaming-plus",
      "name": "MSI MPG B550 GAMING PLUS",
      "short": "MPG B550 GAMING PLUS",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "AM4",
      "chipset": "AMD B550",
      "memory": "DDR4",
      "form": "ATX",
      "slots": 4,
      "maxRam": 128,
      "m2": true,
      "m2Slots": 2,
      "sataPorts": 6,
      "epsConnectors": 1,
      "cpuPowerPinCounts": [
        8
      ],
      "usbCHeader": true,
      "ports": [
        {
          "type": "usb2",
          "count": 4,
          "label": "USB 2.0 Type-A",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 2,
          "label": "USB Type-A 5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 1,
          "label": "USB Type-A 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbC",
          "count": 1,
          "label": "USB Type-C 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 1 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "count": 5,
          "label": "Аудиоразъёмы 3,5 мм",
          "location": "rear"
        },
        {
          "type": "spdif",
          "count": 1,
          "label": "Оптический S/PDIF OUT",
          "location": "rear"
        },
        {
          "type": "ps2",
          "count": 1,
          "label": "PS/2 Combo",
          "location": "rear"
        }
      ],
      "dimensions": [
        305,
        244
      ],
      "wifi": false,
      "lan": "1 Гбит/с",
      "detail": "ATX · AM4 · 4 слота DDR4 · 2× M.2",
      "biosNote": "Для Ryzen 5000/5000G сверь точную модель CPU и требуемую версию BIOS в CPU Support List.",
      "notes": "Видеовыходы платы работают только с процессором со встроенной графикой. Число EPS отражает физические разъёмы; необходимость дополнительного питания уточняется в руководстве платы.",
      "sources": [
        "https://www.msi.com/Motherboard/MPG-B550-GAMING-PLUS/Specification",
        "https://www.msi.com/Motherboard/MPG-B550-GAMING-PLUS/support#cpu"
      ]
    },
    {
      "id": "b550m-pro-vdh",
      "name": "MSI B550M PRO-VDH",
      "short": "B550M PRO-VDH",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "AM4",
      "chipset": "AMD B550",
      "memory": "DDR4",
      "form": "Micro-ATX",
      "slots": 4,
      "maxRam": 128,
      "m2": true,
      "m2Slots": 2,
      "sataPorts": 4,
      "epsConnectors": 1,
      "cpuPowerPinCounts": [
        8
      ],
      "usbCHeader": true,
      "ports": [
        {
          "type": "usb2",
          "count": 2,
          "label": "USB 2.0 Type-A",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 4,
          "label": "USB Type-A 5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort",
          "location": "rear"
        },
        {
          "type": "vga",
          "count": 1,
          "label": "VGA / D-Sub",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 1 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "count": 3,
          "label": "Аудиоразъёмы 3,5 мм",
          "location": "rear"
        },
        {
          "type": "ps2",
          "count": 1,
          "label": "PS/2 Combo",
          "location": "rear"
        }
      ],
      "dimensions": [
        244,
        244
      ],
      "wifi": false,
      "lan": "1 Гбит/с",
      "detail": "Micro-ATX · AM4 · 4 слота DDR4 · 2× M.2",
      "biosNote": "Для Ryzen 5000/5000G сверь точную модель CPU и требуемую версию BIOS в CPU Support List.",
      "notes": "Это версия без Wi-Fi. Внутренний USB-C 5 Гбит/с есть, заднего USB-C нет. Видеовыходы требуют CPU со встроенной графикой.",
      "sources": [
        "https://www.msi.com/Motherboard/B550M-PRO-VDH/Specification",
        "https://www.msi.com/Motherboard/B550M-PRO-VDH/support#cpu"
      ]
    },
    {
      "id": "mpg-b550-gaming-edge-wifi",
      "name": "MSI MPG B550 GAMING EDGE WIFI",
      "short": "MPG B550 GAMING EDGE WIFI",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "AM4",
      "chipset": "AMD B550",
      "memory": "DDR4",
      "form": "ATX",
      "slots": 4,
      "maxRam": 128,
      "m2": true,
      "m2Slots": 2,
      "sataPorts": 6,
      "epsConnectors": 1,
      "cpuPowerPinCounts": [
        8
      ],
      "usbCHeader": true,
      "ports": [
        {
          "type": "usb2",
          "count": 2,
          "label": "USB 2.0 Type-A",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 2,
          "label": "USB Type-A 5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 1,
          "label": "USB Type-A 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbC",
          "count": 1,
          "label": "USB Type-C 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 2,5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "count": 5,
          "label": "Аудиоразъёмы 3,5 мм",
          "location": "rear"
        },
        {
          "type": "wifi",
          "count": 2,
          "label": "Разъёмы антенн Wi-Fi / Bluetooth",
          "location": "rear"
        },
        {
          "type": "spdif",
          "count": 1,
          "label": "Оптический S/PDIF OUT",
          "location": "rear"
        },
        {
          "type": "ps2",
          "count": 1,
          "label": "PS/2 Combo",
          "location": "rear"
        }
      ],
      "dimensions": [
        305,
        244
      ],
      "wifi": true,
      "lan": "2,5 Гбит/с",
      "detail": "ATX · AM4 · 4 слота DDR4 · 2× M.2 · Wi-Fi",
      "biosNote": "Для Ryzen 5000/5000G сверь точную модель CPU и требуемую версию BIOS в CPU Support List.",
      "notes": "Wi-Fi 6 AX200/AX210 зависит от партии. При одновременном использовании M2_2/PCI_E2/PCI_E3 часть линий разделяется; см. руководство. Видеовыходы требуют встроенной графики.",
      "sources": [
        "https://www.msi.com/Motherboard/MPG-B550-GAMING-EDGE-WIFI/Specification",
        "https://www.msi.com/Motherboard/MPG-B550-GAMING-EDGE-WIFI/support#cpu"
      ]
    },
    {
      "id": "pro-b650-p-wifi",
      "name": "MSI PRO B650-P WIFI",
      "short": "PRO B650-P WIFI",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "AM5",
      "chipset": "AMD B650",
      "memory": "DDR5",
      "form": "ATX",
      "slots": 4,
      "maxRam": 256,
      "m2": true,
      "m2Slots": 2,
      "sataPorts": 6,
      "epsConnectors": 2,
      "cpuPowerPinCounts": [
        8,
        8
      ],
      "usbCHeader": true,
      "ports": [
        {
          "type": "usbA",
          "count": 4,
          "label": "USB Type-A 5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 3,
          "label": "USB Type-A 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbC",
          "count": 1,
          "label": "USB Type-C 20 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 2,5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "count": 6,
          "label": "Аудиоразъёмы 3,5 мм",
          "location": "rear"
        },
        {
          "type": "wifi",
          "count": 2,
          "label": "Разъёмы антенн Wi-Fi / Bluetooth",
          "location": "rear"
        }
      ],
      "dimensions": [
        304.8,
        243.84
      ],
      "wifi": true,
      "lan": "2,5 Гбит/с",
      "detail": "ATX · AM5 · 4 слота DDR5 · 2× M.2 · Wi-Fi",
      "biosNote": "Для Ryzen 9000 на плате раннего выпуска может потребоваться обновление BIOS; сверь точную модель CPU в CPU Support List.",
      "notes": "Видеовыходы платы работают только с процессором со встроенной графикой. Число EPS отражает физические разъёмы; необходимость дополнительного питания уточняется в руководстве платы.",
      "sources": [
        "https://www.msi.com/Motherboard/PRO-B650-P-WIFI/Specification",
        "https://www.msi.com/Motherboard/PRO-B650-P-WIFI/support#cpu"
      ]
    },
    {
      "id": "b650-gaming-plus-wifi",
      "name": "MSI B650 GAMING PLUS WIFI",
      "short": "B650 GAMING PLUS WIFI",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "AM5",
      "chipset": "AMD B650",
      "memory": "DDR5",
      "form": "ATX",
      "slots": 4,
      "maxRam": 256,
      "m2": true,
      "m2Slots": 2,
      "sataPorts": 4,
      "epsConnectors": 2,
      "cpuPowerPinCounts": [
        8,
        8
      ],
      "usbCHeader": true,
      "ports": [
        {
          "type": "usbA",
          "count": 4,
          "label": "USB Type-A 5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 3,
          "label": "USB Type-A 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbC",
          "count": 1,
          "label": "USB Type-C 20 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 2,5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "count": 6,
          "label": "Аудиоразъёмы 3,5 мм",
          "location": "rear"
        },
        {
          "type": "wifi",
          "count": 2,
          "label": "Разъёмы антенн Wi-Fi / Bluetooth",
          "location": "rear"
        }
      ],
      "dimensions": [
        304.8,
        243.84
      ],
      "wifi": true,
      "lan": "2,5 Гбит/с",
      "detail": "ATX · AM5 · 4 слота DDR5 · 2× M.2 · Wi-Fi",
      "biosNote": "Для Ryzen 9000 на плате раннего выпуска может потребоваться обновление BIOS; сверь точную модель CPU в CPU Support List.",
      "notes": "Видеовыходы платы работают только с процессором со встроенной графикой. Число EPS отражает физические разъёмы; необходимость дополнительного питания уточняется в руководстве платы.",
      "sources": [
        "https://www.msi.com/Motherboard/B650-GAMING-PLUS-WIFI/Specification",
        "https://www.msi.com/Motherboard/B650-GAMING-PLUS-WIFI/support#cpu"
      ]
    },
    {
      "id": "mag-b760-tomahawk-wifi-ddr4",
      "name": "MSI MAG B760 TOMAHAWK WIFI DDR4",
      "short": "MAG B760 TOMAHAWK WIFI DDR4",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "LGA1700",
      "chipset": "Intel B760",
      "memory": "DDR4",
      "form": "ATX",
      "slots": 4,
      "maxRam": 128,
      "m2": true,
      "m2Slots": 3,
      "sataPorts": 4,
      "epsConnectors": 2,
      "cpuPowerPinCounts": [
        8,
        8
      ],
      "usbCHeader": true,
      "ports": [
        {
          "type": "usb2",
          "count": 4,
          "label": "USB 2.0 Type-A",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 4,
          "label": "USB Type-A 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbC",
          "count": 1,
          "label": "USB Type-C 20 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 2,5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "count": 5,
          "label": "Аудиоразъёмы 3,5 мм",
          "location": "rear"
        },
        {
          "type": "wifi",
          "count": 2,
          "label": "Разъёмы антенн Wi-Fi / Bluetooth",
          "location": "rear"
        },
        {
          "type": "spdif",
          "count": 1,
          "label": "Оптический S/PDIF OUT",
          "location": "rear"
        }
      ],
      "dimensions": [
        304.8,
        243.84
      ],
      "wifi": true,
      "lan": "2,5 Гбит/с",
      "detail": "ATX · LGA1700 · 4 слота DDR4 · 3× M.2 · Wi-Fi",
      "biosNote": "Для Core 14-го поколения проверь поддерживаемую версию BIOS и актуальный микрокод производителя платы.",
      "notes": "Видеовыходы платы работают только с процессором со встроенной графикой. Число EPS отражает физические разъёмы; необходимость дополнительного питания уточняется в руководстве платы.",
      "sources": [
        "https://www.msi.com/Motherboard/MAG-B760-TOMAHAWK-WIFI-DDR4/Specification",
        "https://www.msi.com/Motherboard/MAG-B760-TOMAHAWK-WIFI-DDR4/support#cpu"
      ]
    },
    {
      "id": "mag-z790-tomahawk-wifi",
      "name": "MSI MAG Z790 TOMAHAWK WIFI",
      "short": "MAG Z790 TOMAHAWK WIFI",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "LGA1700",
      "chipset": "Intel Z790",
      "memory": "DDR5",
      "form": "ATX",
      "slots": 4,
      "maxRam": 256,
      "m2": true,
      "m2Slots": 4,
      "sataPorts": 7,
      "epsConnectors": 2,
      "cpuPowerPinCounts": [
        8,
        8
      ],
      "usbCHeader": true,
      "ports": [
        {
          "type": "usbA",
          "count": 4,
          "label": "USB Type-A 5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 4,
          "label": "USB Type-A 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbC",
          "count": 1,
          "label": "USB Type-C 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbC",
          "count": 1,
          "label": "USB Type-C 20 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 2,5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "count": 5,
          "label": "Аудиоразъёмы 3,5 мм",
          "location": "rear"
        },
        {
          "type": "wifi",
          "count": 2,
          "label": "Разъёмы антенн Wi-Fi / Bluetooth",
          "location": "rear"
        },
        {
          "type": "spdif",
          "count": 1,
          "label": "Оптический S/PDIF OUT",
          "location": "rear"
        }
      ],
      "dimensions": [
        304.8,
        243.84
      ],
      "wifi": true,
      "lan": "2,5 Гбит/с",
      "detail": "ATX · LGA1700 · 4 слота DDR5 · 4× M.2 · Wi-Fi",
      "biosNote": "Для Core 14-го поколения проверь поддерживаемую версию BIOS и актуальный микрокод производителя платы.",
      "notes": "Видеовыходы платы работают только с процессором со встроенной графикой. Число EPS отражает физические разъёмы; необходимость дополнительного питания уточняется в руководстве платы.",
      "sources": [
        "https://www.msi.com/Motherboard/MAG-Z790-TOMAHAWK-WIFI/Specification",
        "https://www.msi.com/Motherboard/MAG-Z790-TOMAHAWK-WIFI/support#cpu"
      ]
    },
    {
      "id": "prime-b550m-a",
      "name": "ASUS PRIME B550M-A",
      "short": "PRIME B550M-A",
      "brand": "ASUS",
      "manufacturer": "ASUS",
      "socket": "AM4",
      "chipset": "AMD B550",
      "memory": "DDR4",
      "form": "Micro-ATX",
      "slots": 4,
      "maxRam": 128,
      "m2": true,
      "m2Slots": 2,
      "sataPorts": 4,
      "epsConnectors": 1,
      "cpuPowerPinCounts": [
        8
      ],
      "usbCHeader": false,
      "ports": [
        {
          "type": "usbA",
          "count": 4,
          "label": "USB Type-A 5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 2,
          "label": "USB Type-A 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "vga",
          "count": 1,
          "label": "VGA / D-Sub",
          "location": "rear"
        },
        {
          "type": "dvi",
          "count": 1,
          "label": "DVI-D",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 1 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "count": 3,
          "label": "Аудиоразъёмы 3,5 мм",
          "location": "rear"
        },
        {
          "type": "ps2",
          "count": 1,
          "label": "PS/2 Combo",
          "location": "rear"
        }
      ],
      "dimensions": [
        244,
        244
      ],
      "wifi": false,
      "lan": "1 Гбит/с",
      "detail": "Micro-ATX · AM4 · 4 слота DDR4 · 2× M.2",
      "biosNote": "Для Ryzen 5000/5000G сверь точную модель CPU и требуемую версию BIOS в CPU Support List.",
      "notes": "Видеовыходы платы работают только с процессором со встроенной графикой. Число EPS отражает физические разъёмы; необходимость дополнительного питания уточняется в руководстве платы.",
      "sources": [
        "https://www.asus.com/bt/motherboards-components/motherboards/prime/prime-b550m-a/techspec/"
      ]
    },
    {
      "id": "tuf-b650-plus-wifi",
      "name": "ASUS TUF GAMING B650-PLUS WIFI",
      "short": "TUF GAMING B650-PLUS WIFI",
      "brand": "ASUS",
      "manufacturer": "ASUS",
      "socket": "AM5",
      "chipset": "AMD B650",
      "memory": "DDR5",
      "form": "ATX",
      "slots": 4,
      "maxRam": 256,
      "m2": true,
      "m2Slots": 3,
      "sataPorts": 4,
      "epsConnectors": 2,
      "cpuPowerPinCounts": [
        8,
        4
      ],
      "usbCHeader": true,
      "ports": [
        {
          "type": "usb2",
          "count": 4,
          "label": "USB 2.0 Type-A",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 2,
          "label": "USB Type-A 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbC",
          "count": 1,
          "label": "USB Type-C 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbC",
          "count": 1,
          "label": "USB Type-C 20 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 2,5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "count": 5,
          "label": "Аудиоразъёмы 3,5 мм",
          "location": "rear"
        },
        {
          "type": "wifi",
          "count": 2,
          "label": "Разъёмы антенн Wi-Fi / Bluetooth",
          "location": "rear"
        }
      ],
      "dimensions": [
        305,
        244
      ],
      "wifi": true,
      "lan": "2,5 Гбит/с",
      "detail": "ATX · AM5 · 4 слота DDR5 · 3× M.2 · Wi-Fi",
      "biosNote": "Для Ryzen 9000 на плате раннего выпуска может потребоваться обновление BIOS; сверь точную модель CPU в CPU Support List.",
      "notes": "Питание CPU: один 8-pin и один 4-pin, а не два 8-pin. Wi-Fi 6. Задний USB-C есть в вариантах 10 и 20 Гбит/с; внутренний USB-C 5 Гбит/с. M2_3 делит линии с PCIEX16_2. Видеовыходы требуют встроенной графики.",
      "sources": [
        "https://www.asus.com/in/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b650-plus-wifi/techspec/"
      ]
    },
    {
      "id": "b650-eagle-ax",
      "name": "Gigabyte B650 EAGLE AX (rev. 1.0/1.1)",
      "short": "B650 EAGLE AX (rev. 1.0/1.1)",
      "brand": "Gigabyte",
      "manufacturer": "Gigabyte",
      "socket": "AM5",
      "chipset": "AMD B650",
      "memory": "DDR5",
      "form": "ATX",
      "slots": 4,
      "maxRam": 256,
      "m2": true,
      "m2Slots": 3,
      "sataPorts": 4,
      "epsConnectors": 1,
      "cpuPowerPinCounts": [
        8
      ],
      "usbCHeader": true,
      "ports": [
        {
          "type": "usb2",
          "count": 6,
          "label": "USB 2.0 Type-A",
          "location": "rear"
        },
        {
          "type": "usbA",
          "count": 2,
          "label": "USB Type-A 10 Гбит/с",
          "location": "rear"
        },
        {
          "type": "usbC",
          "count": 1,
          "label": "USB Type-C 5 Гбит/с",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI 2.1",
          "location": "rear"
        },
        {
          "type": "displayport",
          "count": 1,
          "label": "DisplayPort",
          "location": "rear"
        },
        {
          "type": "ethernet",
          "count": 1,
          "label": "LAN 1 Гбит/с",
          "location": "rear"
        },
        {
          "type": "audio",
          "count": 3,
          "label": "Аудиоразъёмы 3,5 мм",
          "location": "rear"
        },
        {
          "type": "wifi",
          "count": 2,
          "label": "Разъёмы антенн Wi-Fi / Bluetooth",
          "location": "rear"
        },
        {
          "type": "ps2",
          "count": 1,
          "label": "PS/2 Combo",
          "location": "rear"
        }
      ],
      "dimensions": [
        305,
        244
      ],
      "wifi": true,
      "lan": "1 Гбит/с",
      "detail": "ATX · AM5 · 4 слота DDR5 · 3× M.2 · Wi-Fi",
      "biosNote": "Для Ryzen 9000 на плате раннего выпуска может потребоваться обновление BIOS; сверь точную модель CPU в CPU Support List.",
      "notes": "Характеристики для rev.1.0/1.1. LAN 1 Гбит/с. Wi-Fi 6E: RTL8852CE в rev.1.0, Intel AX210 в rev.1.1. M2P_CPU работает PCIe 4.0 x2; M2A_CPU — до PCIe 5.0 x4 с Ryzen 7000/9000. Видеовыходы требуют встроенной графики.",
      "sources": [
        "https://www.gigabyte.com/Motherboard/B650-EAGLE-AX-rev-10-11/sp"
      ]
    }
  ],
  "gpu": [
    {
      "id": "rtx3060",
      "name": "MSI GeForce RTX 3060 VENTUS 2X 12G OC",
      "short": "GeForce RTX 3060",
      "brand": "NVIDIA",
      "vram": 12,
      "length": 235,
      "power": 170,
      "recommendedPsu": 550,
      "connectors": 1,
      "fans": 2,
      "tmax": 93,
      "detail": "12 ГБ GDDR6 · 235 мм · 170 Вт",
      "sources": [
        "https://my.msi.com/Graphics-Card/GeForce-RTX-3060-VENTUS-2X-12G-OC/Specification",
        "https://storage-asset.msi.com/datasheet/vga/us/GeForce-RTX-3060-VENTUS-2X-12G-OC.pdf"
      ],
      "dimensions": [
        235,
        124,
        42
      ],
      "pcieGeneration": 4,
      "pcieLanes": 16,
      "vramType": "GDDR6",
      "manufacturer": "MSI",
      "connectorType": "8pin",
      "tmaxAssumed": true
    },
    {
      "id": "rtx4060",
      "name": "MSI GeForce RTX 4060 VENTUS 2X BLACK 8G",
      "short": "GeForce RTX 4060",
      "brand": "NVIDIA",
      "vram": 8,
      "length": 199,
      "power": 115,
      "recommendedPsu": 550,
      "connectors": 1,
      "fans": 2,
      "tmax": 90,
      "detail": "8 ГБ GDDR6 · 199 мм · 115 Вт",
      "sources": [
        "https://uk.msi.com/Graphics-Card/GeForce-RTX-4060-VENTUS-2X-BLACK-8G/Specification"
      ],
      "dimensions": [
        199,
        120,
        41
      ],
      "pcieGeneration": 4,
      "pcieLanes": 8,
      "vramType": "GDDR6",
      "manufacturer": "MSI",
      "connectorType": "8pin",
      "tmaxAssumed": true
    },
    {
      "id": "rtx3090",
      "name": "ZOTAC GAMING GeForce RTX 3090 Trinity",
      "short": "GeForce RTX 3090",
      "brand": "NVIDIA",
      "vram": 24,
      "length": 317.8,
      "power": 350,
      "recommendedPsu": 750,
      "connectors": 2,
      "fans": 3,
      "tmax": 93,
      "detail": "24 ГБ GDDR6X · 318 мм · 350 Вт",
      "sources": [
        "https://www.zotac.com/us/product/graphics_card/zotac-gaming-geforce-rtx-3090-trinity"
      ],
      "dimensions": [
        317.8,
        120.7,
        58
      ],
      "pcieGeneration": 4,
      "pcieLanes": 16,
      "vramType": "GDDR6X",
      "manufacturer": "ZOTAC",
      "connectorType": "8pin",
      "tmaxAssumed": true
    },
    {
      "id": "rtx3050",
      "name": "MSI GeForce RTX 3050 VENTUS 2X 8G OC",
      "short": "GeForce RTX 3050",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "vram": 8,
      "vramType": "GDDR6",
      "length": 235,
      "power": 130,
      "recommendedPsu": 550,
      "connectors": 1,
      "connectorType": "8pin",
      "fans": 2,
      "boostMHz": 1807,
      "busBits": 128,
      "tmax": 93,
      "tmaxAssumed": true,
      "detail": "8 ГБ GDDR6 · 235 мм · 130 Вт · 1 × 8-pin",
      "ports": [
        "3 × DisplayPort 1.4a",
        "1 × HDMI 2.1"
      ],
      "sources": [
        "https://www.msi.com/Graphics-Card/GeForce-RTX-3050-VENTUS-2X-8G-OC/Specification",
        "https://www.msi.com/Graphics-Card/GeForce-RTX-3050-VENTUS-2X-8G-OC/Overview",
        "https://www.nvidia.com/en-sg/geforce/graphics-cards/30-series/rtx-3050/"
      ],
      "notes": [
        "Выбрано исходное исполнение OC: 130 Вт и 8-pin; не смешивать с OCV1 115 Вт / 6-pin.",
        "Размеры производителя: 235 × 124 × 42 мм.",
        "Для учебной модели tmax взят из официального максимума NVIDIA для референсного RTX 3050 (93 °C); MSI не публикует отдельный предел этой платы. Это не гарантированный порог её BIOS."
      ]
    },
    {
      "id": "rtx3060ti",
      "name": "MSI GeForce RTX 3060 Ti VENTUS 2X 8G OCV1 LHR",
      "short": "GeForce RTX 3060 Ti",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "vram": 8,
      "vramType": "GDDR6",
      "length": 235,
      "power": 200,
      "recommendedPsu": 600,
      "connectors": 1,
      "connectorType": "8pin",
      "fans": 2,
      "boostMHz": 1695,
      "busBits": 256,
      "tmax": 93,
      "tmaxAssumed": true,
      "detail": "8 ГБ GDDR6 · 235 мм · 200 Вт · 1 × 8-pin",
      "ports": [
        "3 × DisplayPort 1.4a",
        "1 × HDMI 2.1"
      ],
      "sources": [
        "https://www.msi.com/Graphics-Card/GeForce-RTX-3060-Ti-VENTUS-2X-8G-OCV1-LHR/Specification",
        "https://storage-asset.msi.com/datasheet/vga/us/GeForce-RTX-3060-Ti-VENTUS-2X-8G-OCV1-LHR.pdf",
        "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3060-3060ti/"
      ],
      "notes": [
        "Точное исполнение OCV1 LHR с GDDR6; характеристики иных VENTUS 2X и GDDR6X не переносить.",
        "Размеры производителя: 235 × 124 × 42 мм.",
        "Для учебной модели tmax взят из официального максимума NVIDIA для референсного RTX 3060 Ti (93 °C); MSI не публикует отдельный предел этой платы. Это не гарантированный порог её BIOS."
      ]
    },
    {
      "id": "rtx4060ti",
      "name": "MSI GeForce RTX 4060 Ti VENTUS 2X BLACK 8G OC",
      "short": "GeForce RTX 4060 Ti",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "vram": 8,
      "vramType": "GDDR6",
      "length": 199,
      "power": 160,
      "recommendedPsu": 550,
      "connectors": 1,
      "connectorType": "8pin",
      "fans": 2,
      "boostMHz": 2565,
      "busBits": 128,
      "tmax": 90,
      "tmaxAssumed": true,
      "detail": "8 ГБ GDDR6 · 199 мм · 160 Вт · 1 × 8-pin",
      "ports": [
        "3 × DisplayPort 1.4a",
        "1 × HDMI 2.1a"
      ],
      "sources": [
        "https://www.msi.com/Graphics-Card/GeForce-RTX-4060-Ti-VENTUS-2X-BLACK-8G-OC/Specification",
        "https://www.msi.com/Graphics-Card/GeForce-RTX-4060-Ti-VENTUS-2X-BLACK-8G-OC/Overview",
        "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4060-4060ti/"
      ],
      "notes": [
        "Указан штатный Boost 2565 МГц; режим Extreme Performance 2580 МГц требует MSI Center.",
        "Размеры производителя: 199 × 120 × 42 мм.",
        "Для учебной модели tmax взят из официального максимума NVIDIA для референсного RTX 4060 Ti (90 °C); MSI не публикует отдельный предел этой платы. Это не гарантированный порог её BIOS."
      ]
    },
    {
      "id": "rtx4070",
      "name": "MSI GeForce RTX 4070 VENTUS 3X 12G OC",
      "short": "GeForce RTX 4070",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "vram": 12,
      "vramType": "GDDR6X",
      "length": 308,
      "power": 200,
      "recommendedPsu": 650,
      "connectors": 1,
      "connectorType": "8pin",
      "fans": 3,
      "boostMHz": 2505,
      "busBits": 192,
      "tmax": 90,
      "tmaxAssumed": true,
      "detail": "12 ГБ GDDR6X · 308 мм · 200 Вт · 1 × 8-pin",
      "ports": [
        "3 × DisplayPort 1.4a",
        "1 × HDMI 2.1a"
      ],
      "sources": [
        "https://www.msi.com/Graphics-Card/GeForce-RTX-4070-VENTUS-3X-12G-OC/Specification",
        "https://www.msi.com/Graphics-Card/GeForce-RTX-4070-VENTUS-3X-12G-OC/Overview",
        "https://www.nvidia.com/en-gb/geforce/graphics-cards/40-series/rtx-4070-family/"
      ],
      "notes": [
        "Исходное исполнение VENTUS 3X 12G OC с GDDR6X и одним 8-pin; не версия E/E1.",
        "Указан штатный Boost 2505 МГц; 2520 МГц — режим MSI Center.",
        "Размеры производителя: 308 × 120 × 43 мм.",
        "Для учебной модели tmax взят из официального максимума NVIDIA для референсного RTX 4070 (90 °C); MSI не публикует отдельный предел этой платы. Это не гарантированный порог её BIOS."
      ]
    },
    {
      "id": "rtx4070super",
      "name": "MSI GeForce RTX 4070 SUPER 12G VENTUS 3X OC",
      "short": "GeForce RTX 4070 SUPER",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "vram": 12,
      "vramType": "GDDR6X",
      "length": 308,
      "power": 220,
      "recommendedPsu": 650,
      "connectors": 2,
      "connectorType": "16pin",
      "fans": 3,
      "boostMHz": 2505,
      "busBits": 192,
      "tmax": 90,
      "tmaxAssumed": true,
      "detail": "12 ГБ GDDR6X · 308 мм · 220 Вт · 1 × 16-pin",
      "ports": [
        "3 × DisplayPort 1.4a",
        "1 × HDMI 2.1a"
      ],
      "sources": [
        "https://www.msi.com/Graphics-Card/GeForce-RTX-4070-SUPER-12G-VENTUS-3X-OC/Specification",
        "https://www.msi.com/Graphics-Card/GeForce-RTX-4070-SUPER-12G-VENTUS-3X-OC/Overview",
        "https://www.nvidia.com/en-gb/geforce/graphics-cards/40-series/rtx-4070-family/"
      ],
      "notes": [
        "На плате один 16-pin, а connectors=2 обозначает два PCIe 8-pin кабеля при подключении через соответствующий адаптер по схеме NVIDIA; это не два разъёма на карте. Альтернатива — подходящий штатный PCIe Gen 5 кабель БП ≥300 Вт.",
        "Комплектность адаптера именно MSI не подтверждена открытой таблицей спецификаций; для покупки сверять комплект и руководство.",
        "Указан штатный Boost 2505 МГц; 2520 МГц — режим MSI Center.",
        "Размеры производителя: 308 × 120 × 43 мм.",
        "Для учебной модели tmax взят из официального максимума NVIDIA для референсного RTX 4070 SUPER (90 °C); MSI не публикует отдельный предел этой платы. Это не гарантированный порог её BIOS."
      ]
    },
    {
      "id": "rx6600",
      "name": "SAPPHIRE PULSE AMD Radeon RX 6600 8GB",
      "short": "Radeon RX 6600",
      "brand": "AMD",
      "manufacturer": "SAPPHIRE",
      "sku": "11310-01-20G",
      "vram": 8,
      "vramType": "GDDR6",
      "length": 193,
      "power": 140,
      "recommendedPsu": 500,
      "connectors": 1,
      "connectorType": "8pin",
      "fans": 2,
      "boostMHz": 2491,
      "busBits": 128,
      "tmax": 90,
      "tmaxAssumed": true,
      "detail": "8 ГБ GDDR6 · 193 мм · 140 Вт · 1 × 8-pin",
      "ports": [
        "3 × DisplayPort 1.4",
        "1 × HDMI"
      ],
      "sources": [
        "https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-6600-8g-gddr6",
        "https://www.sapphiretech.com/en/news/sapphire-pulse-rx-6600"
      ],
      "notes": [
        "Обычный SKU 11310-01-20G с четырьмя выходами; не Lite Edition 11310-04-20G с двумя выходами.",
        "Размеры производителя: 193 × 120,05 × 40,05 мм; 2 слота.",
        "power=140 Вт — Board Power именно SAPPHIRE PULSE.",
        "90 °C — условный порог только учебной модели температуры GPU: максимальная температура этой платы на странице SAPPHIRE не указана. Не трактовать как официальный предел или температуру hotspot."
      ]
    },
    {
      "id": "rx6650xt",
      "name": "SAPPHIRE PULSE AMD Radeon RX 6650 XT 8GB",
      "short": "Radeon RX 6650 XT",
      "brand": "AMD",
      "manufacturer": "SAPPHIRE",
      "sku": "11319-03-20G",
      "vram": 8,
      "vramType": "GDDR6",
      "length": 240,
      "power": 176,
      "recommendedPsu": 500,
      "connectors": 1,
      "connectorType": "8pin",
      "fans": 2,
      "boostMHz": 2635,
      "busBits": 128,
      "tmax": 90,
      "tmaxAssumed": true,
      "detail": "8 ГБ GDDR6 · 240 мм · 176 Вт · 1 × 8-pin",
      "ports": [
        "3 × DisplayPort 1.4",
        "1 × HDMI"
      ],
      "sources": [
        "https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-6650-xt-8g-gddr6"
      ],
      "notes": [
        "Выбрано исполнение SKU 11319-03-20G.",
        "Размеры производителя: 240 × 119,85 × 44,75 мм; 2 слота.",
        "power=176 Вт — Total Board Power именно SAPPHIRE PULSE.",
        "90 °C — условный порог только учебной модели температуры GPU: максимальная температура этой платы на странице SAPPHIRE не указана. Не трактовать как официальный предел или температуру hotspot."
      ]
    },
    {
      "id": "rx7600",
      "name": "SAPPHIRE PULSE AMD Radeon RX 7600 8GB",
      "short": "Radeon RX 7600",
      "brand": "AMD",
      "manufacturer": "SAPPHIRE",
      "sku": "11324-01-20G",
      "vram": 8,
      "vramType": "GDDR6",
      "length": 240,
      "power": 185,
      "recommendedPsu": 550,
      "connectors": 1,
      "connectorType": "8pin",
      "fans": 2,
      "boostMHz": 2755,
      "busBits": 128,
      "tmax": 90,
      "tmaxAssumed": true,
      "detail": "8 ГБ GDDR6 · 240 мм · 185 Вт · 1 × 8-pin",
      "ports": [
        "3 × DisplayPort 1.4",
        "1 × HDMI"
      ],
      "sources": [
        "https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-7600-8g-gddr6",
        "https://www.sapphiretech.com/en/news/pulse-rx-7600"
      ],
      "notes": [
        "Размеры производителя: 240 × 107,1 × 44,07 мм; 2 слота.",
        "power=185 Вт — Total Board Power именно SAPPHIRE PULSE.",
        "90 °C — условный порог только учебной модели температуры GPU: максимальная температура этой платы на странице SAPPHIRE не указана. Не трактовать как официальный предел или температуру hotspot."
      ]
    },
    {
      "id": "rx7700xt",
      "name": "SAPPHIRE PULSE AMD Radeon RX 7700 XT 12GB",
      "short": "Radeon RX 7700 XT",
      "brand": "AMD",
      "manufacturer": "SAPPHIRE",
      "sku": "11335-04-20G",
      "vram": 12,
      "vramType": "GDDR6",
      "length": 280,
      "power": 230,
      "recommendedPsu": 700,
      "connectors": 2,
      "connectorType": "8pin",
      "fans": 2,
      "boostMHz": 2544,
      "busBits": 192,
      "tmax": 90,
      "tmaxAssumed": true,
      "detail": "12 ГБ GDDR6 · 280 мм · 230 Вт · 2 × 8-pin",
      "ports": [
        "2 × DisplayPort 2.1",
        "2 × HDMI"
      ],
      "sources": [
        "https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-7700-xt-12g-gddr6"
      ],
      "notes": [
        "Размеры производителя: 280 × 128,75 × 52,57 мм; 2,5 слота.",
        "power=230 Вт — Total Board Power именно SAPPHIRE PULSE.",
        "90 °C — условный порог только учебной модели температуры GPU: максимальная температура этой платы на странице SAPPHIRE не указана. Не трактовать как официальный предел или температуру hotspot."
      ]
    },
    {
      "id": "rx7800xt",
      "name": "SAPPHIRE PULSE AMD Radeon RX 7800 XT 16GB",
      "short": "Radeon RX 7800 XT",
      "brand": "AMD",
      "manufacturer": "SAPPHIRE",
      "sku": "11330-02-20G",
      "vram": 16,
      "vramType": "GDDR6",
      "length": 280,
      "power": 266,
      "recommendedPsu": 700,
      "connectors": 2,
      "connectorType": "8pin",
      "fans": 2,
      "boostMHz": 2430,
      "busBits": 256,
      "tmax": 90,
      "tmaxAssumed": true,
      "detail": "16 ГБ GDDR6 · 280 мм · 266 Вт · 2 × 8-pin",
      "ports": [
        "2 × DisplayPort 2.1",
        "2 × HDMI"
      ],
      "sources": [
        "https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-7800-xt-16g-gddr6"
      ],
      "notes": [
        "Размеры производителя: 280 × 128,75 × 52,57 мм; 2,5 слота.",
        "power=266 Вт — Total Board Power именно SAPPHIRE PULSE.",
        "90 °C — условный порог только учебной модели температуры GPU: максимальная температура этой платы на странице SAPPHIRE не указана. Не трактовать как официальный предел или температуру hotspot."
      ]
    },
    {
      "id": "rtx3050-6-ventus2x-e-oc",
      "name": "MSI GeForce RTX 3050 VENTUS 2X E 6G OC",
      "short": "RTX 3050 6 ГБ",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "sku": "GeForce RTX 3050 VENTUS 2X E 6G OC",
      "vram": 6,
      "vramType": "GDDR6",
      "dimensions": [
        189,
        109,
        42
      ],
      "length": 189,
      "width": 109,
      "thickness": 42,
      "power": 70,
      "recommendedPsu": 300,
      "connectors": 0,
      "connectorType": "none",
      "connectorCount": 0,
      "fans": 2,
      "boostMHz": 1492,
      "busBits": 96,
      "pcieGeneration": 4,
      "pcieLanes": 8,
      "ports": [
        "1 × DisplayPort 1.4a",
        "2 × HDMI 2.1"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "6 ГБ GDDR6 · 189 мм · 70 Вт · без дополнительного питания",
      "sources": [
        "https://www.msi.com/Graphics-Card/GeForce-RTX-3050-VENTUS-2X-E-6G-OC/Specification"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов.",
        "Указана штатная частота Boost; режим MSI Center Extreme Performance не используется.",
        "Точное исполнение E 6G OC: 70 Вт, без внешнего питания, 1 DisplayPort и 2 HDMI. Не путать с 8G OC."
      ]
    },
    {
      "id": "rtx4060ti-16-ventus2x-oc",
      "name": "MSI GeForce RTX 4060 Ti VENTUS 2X BLACK 16G OC",
      "short": "RTX 4060 Ti 16 ГБ",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "sku": "GeForce RTX 4060 Ti VENTUS 2X BLACK 16G OC",
      "vram": 16,
      "vramType": "GDDR6",
      "dimensions": [
        199,
        120,
        42
      ],
      "length": 199,
      "width": 120,
      "thickness": 42,
      "power": 165,
      "recommendedPsu": 550,
      "connectors": 1,
      "connectorType": "8pin",
      "connectorCount": 1,
      "fans": 2,
      "boostMHz": 2610,
      "busBits": 128,
      "pcieGeneration": 4,
      "pcieLanes": 8,
      "ports": [
        "3 × DisplayPort 1.4a",
        "1 × HDMI 2.1a"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "16 ГБ GDDR6 · 199 мм · 165 Вт · 1 × 8-pin",
      "sources": [
        "https://www.msi.com/Graphics-Card/GeForce-RTX-4060-Ti-VENTUS-2X-BLACK-16G-OC/Specification"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов.",
        "Указана штатная частота Boost; режим MSI Center Extreme Performance не используется."
      ]
    },
    {
      "id": "rtx4070tisuper-ventus3x-oc",
      "name": "MSI GeForce RTX 4070 Ti SUPER 16G VENTUS 3X OC",
      "short": "RTX 4070 Ti SUPER",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "sku": "GeForce RTX 4070 Ti SUPER 16G VENTUS 3X OC",
      "vram": 16,
      "vramType": "GDDR6X",
      "dimensions": [
        308,
        120,
        50
      ],
      "length": 308,
      "width": 120,
      "thickness": 50,
      "power": 285,
      "recommendedPsu": 700,
      "connectors": 0,
      "connectorType": "16pin",
      "connectorCount": 1,
      "fans": 3,
      "boostMHz": 2640,
      "busBits": 256,
      "pcieGeneration": 4,
      "pcieLanes": 16,
      "ports": [
        "3 × DisplayPort 1.4a",
        "1 × HDMI 2.1a"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "16 ГБ GDDR6X · 308 мм · 285 Вт · 1 × 16-pin",
      "sources": [
        "https://us.msi.com/Graphics-Card/GeForce-RTX-4070-Ti-SUPER-16G-VENTUS-3X-OC/Specification"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов.",
        "Указана штатная частота Boost; режим MSI Center Extreme Performance не используется.",
        "Используется нативный кабель 16-pin; количество входов возможного адаптера не предполагается. connectors=0 означает отсутствие разъёмов 8-pin на самой карте."
      ]
    },
    {
      "id": "rtx4080super-ventus3x-oc",
      "name": "MSI GeForce RTX 4080 SUPER 16G VENTUS 3X OC",
      "short": "RTX 4080 SUPER",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "sku": "GeForce RTX 4080 SUPER 16G VENTUS 3X OC",
      "vram": 16,
      "vramType": "GDDR6X",
      "dimensions": [
        322,
        136,
        62
      ],
      "length": 322,
      "width": 136,
      "thickness": 62,
      "power": 320,
      "recommendedPsu": 750,
      "connectors": 0,
      "connectorType": "16pin",
      "connectorCount": 1,
      "fans": 3,
      "boostMHz": 2580,
      "busBits": 256,
      "pcieGeneration": 4,
      "pcieLanes": 16,
      "ports": [
        "2 × DisplayPort 1.4a",
        "2 × HDMI 2.1a"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "16 ГБ GDDR6X · 322 мм · 320 Вт · 1 × 16-pin",
      "sources": [
        "https://us.msi.com/Graphics-Card/GeForce-RTX-4080-SUPER-16G-VENTUS-3X-OC/Specification"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов.",
        "Указана штатная частота Boost; режим MSI Center Extreme Performance не используется.",
        "Используется нативный кабель 16-pin; количество входов возможного адаптера не предполагается. connectors=0 означает отсутствие разъёмов 8-pin на самой карте."
      ]
    },
    {
      "id": "rtx4090-ventus3x-oc",
      "name": "MSI GeForce RTX 4090 VENTUS 3X 24G OC",
      "short": "RTX 4090",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "sku": "GeForce RTX 4090 VENTUS 3X 24G OC",
      "vram": 24,
      "vramType": "GDDR6X",
      "dimensions": [
        322,
        136,
        62
      ],
      "length": 322,
      "width": 136,
      "thickness": 62,
      "power": 450,
      "recommendedPsu": 850,
      "connectors": 0,
      "connectorType": "16pin",
      "connectorCount": 1,
      "fans": 3,
      "boostMHz": 2550,
      "busBits": 384,
      "pcieGeneration": 4,
      "pcieLanes": 16,
      "ports": [
        "3 × DisplayPort 1.4a",
        "1 × HDMI 2.1a"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "24 ГБ GDDR6X · 322 мм · 450 Вт · 1 × 16-pin",
      "sources": [
        "https://www.msi.com/Graphics-Card/GeForce-RTX-4090-VENTUS-3X-24G-OC/Specification"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов.",
        "Указана штатная частота Boost; режим MSI Center Extreme Performance не используется.",
        "Используется нативный кабель 16-pin; количество входов возможного адаптера не предполагается. connectors=0 означает отсутствие разъёмов 8-pin на самой карте."
      ]
    },
    {
      "id": "rtx5050-ventus2x-oc",
      "name": "MSI GeForce RTX 5050 8G VENTUS 2X OC",
      "short": "RTX 5050",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "sku": "G5050-8V2C",
      "vram": 8,
      "vramType": "GDDR6",
      "dimensions": [
        197,
        120,
        41
      ],
      "length": 197,
      "width": 120,
      "thickness": 41,
      "power": 130,
      "recommendedPsu": 550,
      "connectors": 1,
      "connectorType": "8pin",
      "connectorCount": 1,
      "fans": 2,
      "boostMHz": 2602,
      "busBits": 128,
      "pcieGeneration": 5,
      "pcieLanes": 8,
      "ports": [
        "3 × DisplayPort 2.1b",
        "1 × HDMI 2.1b"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "8 ГБ GDDR6 · 197 мм · 130 Вт · 1 × 8-pin",
      "sources": [
        "https://www.msi.com/Graphics-Card/GeForce-RTX-5050-8G-VENTUS-2X-OC/Specification"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов.",
        "Указана штатная частота Boost; режим MSI Center Extreme Performance не используется."
      ]
    },
    {
      "id": "rtx5060-ventus2x-oc",
      "name": "MSI GeForce RTX 5060 8G VENTUS 2X OC",
      "short": "RTX 5060",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "sku": "GeForce RTX 5060 8G VENTUS 2X OC",
      "vram": 8,
      "vramType": "GDDR7",
      "dimensions": [
        197,
        120,
        41
      ],
      "length": 197,
      "width": 120,
      "thickness": 41,
      "power": 145,
      "recommendedPsu": 550,
      "connectors": 1,
      "connectorType": "8pin",
      "connectorCount": 1,
      "fans": 2,
      "boostMHz": 2527,
      "busBits": 128,
      "pcieGeneration": 5,
      "pcieLanes": 8,
      "ports": [
        "3 × DisplayPort 2.1b",
        "1 × HDMI 2.1b"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "8 ГБ GDDR7 · 197 мм · 145 Вт · 1 × 8-pin",
      "sources": [
        "https://my.msi.com/Graphics-Card/GeForce-RTX-5060-8G-VENTUS-2X-OC/Specification"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов.",
        "Указана штатная частота Boost; режим MSI Center Extreme Performance не используется."
      ]
    },
    {
      "id": "rtx5060ti-16-ventus2x-oc-plus",
      "name": "MSI GeForce RTX 5060 Ti 16G VENTUS 2X OC PLUS",
      "short": "RTX 5060 Ti 16 ГБ",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "sku": "G506T-16V2CP",
      "vram": 16,
      "vramType": "GDDR7",
      "dimensions": [
        227,
        126,
        41
      ],
      "length": 227,
      "width": 126,
      "thickness": 41,
      "power": 180,
      "recommendedPsu": 600,
      "connectors": 1,
      "connectorType": "8pin",
      "connectorCount": 1,
      "fans": 2,
      "boostMHz": 2602,
      "busBits": 128,
      "pcieGeneration": 5,
      "pcieLanes": 8,
      "ports": [
        "3 × DisplayPort 2.1b",
        "1 × HDMI 2.1b"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "16 ГБ GDDR7 · 227 мм · 180 Вт · 1 × 8-pin",
      "sources": [
        "https://www.msi.com/Graphics-Card/GeForce-RTX-5060-Ti-16G-VENTUS-2X-OC-PLUS/Specification"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов.",
        "Указана штатная частота Boost; режим MSI Center Extreme Performance не используется."
      ]
    },
    {
      "id": "rtx5070-ventus2x-oc-white",
      "name": "MSI GeForce RTX 5070 12G VENTUS 2X OC WHITE",
      "short": "RTX 5070 White",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "sku": "G5070-12V2CW",
      "vram": 12,
      "vramType": "GDDR7",
      "dimensions": [
        236,
        126,
        50
      ],
      "length": 236,
      "width": 126,
      "thickness": 50,
      "power": 250,
      "recommendedPsu": 650,
      "connectors": 0,
      "connectorType": "16pin",
      "connectorCount": 1,
      "fans": 2,
      "boostMHz": 2542,
      "busBits": 192,
      "pcieGeneration": 5,
      "pcieLanes": 16,
      "ports": [
        "3 × DisplayPort 2.1b",
        "1 × HDMI 2.1b"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "12 ГБ GDDR7 · 236 мм · 250 Вт · 1 × 16-pin",
      "sources": [
        "https://www.msi.com/Graphics-Card/GeForce-RTX-5070-12G-VENTUS-2X-OC-WHITE/Specification"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов.",
        "Указана штатная частота Boost; режим MSI Center Extreme Performance не используется.",
        "Используется нативный кабель 16-pin; количество входов возможного адаптера не предполагается. connectors=0 означает отсутствие разъёмов 8-pin на самой карте."
      ],
      "color": "#e6e8eb"
    },
    {
      "id": "rtx5070ti-ventus3x-oc",
      "name": "MSI GeForce RTX 5070 Ti 16G VENTUS 3X OC",
      "short": "RTX 5070 Ti",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "sku": "G507T-16V3C",
      "vram": 16,
      "vramType": "GDDR7",
      "dimensions": [
        303,
        121,
        49
      ],
      "length": 303,
      "width": 121,
      "thickness": 49,
      "power": 300,
      "recommendedPsu": 750,
      "connectors": 0,
      "connectorType": "16pin",
      "connectorCount": 1,
      "fans": 3,
      "boostMHz": 2482,
      "busBits": 256,
      "pcieGeneration": 5,
      "pcieLanes": 16,
      "ports": [
        "3 × DisplayPort 2.1b",
        "1 × HDMI 2.1b"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "16 ГБ GDDR7 · 303 мм · 300 Вт · 1 × 16-pin",
      "sources": [
        "https://us.msi.com/Graphics-Card/GeForce-RTX-5070-Ti-16G-VENTUS-3X-OC/Specification"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов.",
        "Указана штатная частота Boost; режим MSI Center Extreme Performance не используется.",
        "Используется нативный кабель 16-pin; количество входов возможного адаптера не предполагается. connectors=0 означает отсутствие разъёмов 8-pin на самой карте."
      ]
    },
    {
      "id": "rtx5080-ventus3x-oc",
      "name": "MSI GeForce RTX 5080 16G VENTUS 3X OC",
      "short": "RTX 5080",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "sku": "G5080-16V3C",
      "vram": 16,
      "vramType": "GDDR7",
      "dimensions": [
        303,
        121,
        49
      ],
      "length": 303,
      "width": 121,
      "thickness": 49,
      "power": 360,
      "recommendedPsu": 850,
      "connectors": 0,
      "connectorType": "16pin",
      "connectorCount": 1,
      "fans": 3,
      "boostMHz": 2640,
      "busBits": 256,
      "pcieGeneration": 5,
      "pcieLanes": 16,
      "ports": [
        "3 × DisplayPort 2.1b",
        "1 × HDMI 2.1b"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "16 ГБ GDDR7 · 303 мм · 360 Вт · 1 × 16-pin",
      "sources": [
        "https://ca.msi.com/Graphics-Card/GeForce-RTX-5080-16G-VENTUS-3X-OC/Specification"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов.",
        "Указана штатная частота Boost; режим MSI Center Extreme Performance не используется.",
        "Используется нативный кабель 16-pin; количество входов возможного адаптера не предполагается. connectors=0 означает отсутствие разъёмов 8-pin на самой карте."
      ]
    },
    {
      "id": "rtx5090-ventus3x-oc",
      "name": "MSI GeForce RTX 5090 32G VENTUS 3X OC",
      "short": "RTX 5090",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "sku": "G5090-32V3C",
      "vram": 32,
      "vramType": "GDDR7",
      "dimensions": [
        325,
        139,
        67
      ],
      "length": 325,
      "width": 139,
      "thickness": 67,
      "power": 575,
      "recommendedPsu": 1000,
      "connectors": 0,
      "connectorType": "16pin",
      "connectorCount": 1,
      "fans": 3,
      "boostMHz": 2437,
      "busBits": 512,
      "pcieGeneration": 5,
      "pcieLanes": 16,
      "ports": [
        "3 × DisplayPort 2.1b",
        "1 × HDMI 2.1b"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "32 ГБ GDDR7 · 325 мм · 575 Вт · 1 × 16-pin",
      "sources": [
        "https://www.msi.com/Graphics-Card/GeForce-RTX-5090-32G-VENTUS-3X-OC/Specification"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов.",
        "Указана штатная частота Boost; режим MSI Center Extreme Performance не используется.",
        "Используется нативный кабель 16-pin; количество входов возможного адаптера не предполагается. connectors=0 означает отсутствие разъёмов 8-pin на самой карте."
      ]
    },
    {
      "id": "rx7600xt-pulse",
      "name": "SAPPHIRE PULSE AMD Radeon RX 7600 XT 16GB",
      "short": "Radeon RX 7600 XT 16 ГБ",
      "brand": "AMD",
      "manufacturer": "SAPPHIRE",
      "sku": "11339-04-20G",
      "vram": 16,
      "vramType": "GDDR6",
      "dimensions": [
        250,
        129.25,
        44.56
      ],
      "length": 250,
      "width": 129.25,
      "thickness": 44.56,
      "power": 192,
      "recommendedPsu": 600,
      "connectors": 2,
      "connectorType": "8pin",
      "connectorCount": 2,
      "fans": 2,
      "boostMHz": 2810,
      "busBits": 128,
      "pcieGeneration": 4,
      "pcieLanes": 8,
      "ports": [
        "2 × DisplayPort 2.1",
        "2 × HDMI"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "16 ГБ GDDR6 · 250 мм · 192 Вт · 2 × 8-pin",
      "sources": [
        "https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-7600-xt-16g-gddr6"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов."
      ]
    },
    {
      "id": "rx7900gre-pulse",
      "name": "SAPPHIRE PULSE AMD Radeon RX 7900 GRE 16GB",
      "short": "Radeon RX 7900 GRE 16 ГБ",
      "brand": "AMD",
      "manufacturer": "SAPPHIRE",
      "sku": "11325-04",
      "vram": 16,
      "vramType": "GDDR6",
      "dimensions": [
        320,
        128.75,
        52.57
      ],
      "length": 320,
      "width": 128.75,
      "thickness": 52.57,
      "power": 268,
      "recommendedPsu": 700,
      "connectors": 2,
      "connectorType": "8pin",
      "connectorCount": 2,
      "fans": 3,
      "boostMHz": 2293,
      "busBits": 256,
      "pcieGeneration": 4,
      "pcieLanes": 16,
      "ports": [
        "2 × DisplayPort 2.1",
        "2 × HDMI"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "16 ГБ GDDR6 · 320 мм · 268 Вт · 2 × 8-pin",
      "sources": [
        "https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-7900-gre-16g-gddr6"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов.",
        "Производитель на этой странице публикует SKU 11325-04 без суффикса упаковки."
      ]
    },
    {
      "id": "rx7900xt-pulse",
      "name": "SAPPHIRE PULSE AMD Radeon RX 7900 XT 20GB",
      "short": "Radeon RX 7900 XT 20 ГБ",
      "brand": "AMD",
      "manufacturer": "SAPPHIRE",
      "sku": "11323-02-20G",
      "vram": 20,
      "vramType": "GDDR6",
      "dimensions": [
        313,
        133.75,
        52.67
      ],
      "length": 313,
      "width": 133.75,
      "thickness": 52.67,
      "power": 331,
      "recommendedPsu": 750,
      "connectors": 2,
      "connectorType": "8pin",
      "connectorCount": 2,
      "fans": 3,
      "boostMHz": 2450,
      "busBits": 320,
      "pcieGeneration": 4,
      "pcieLanes": 16,
      "ports": [
        "2 × DisplayPort 2.1",
        "2 × HDMI"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "20 ГБ GDDR6 · 313 мм · 331 Вт · 2 × 8-pin",
      "sources": [
        "https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-7900-xt-20g-gddr6"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов."
      ]
    },
    {
      "id": "rx7900xtx-pulse",
      "name": "SAPPHIRE PULSE AMD Radeon RX 7900 XTX 24GB",
      "short": "Radeon RX 7900 XTX 24 ГБ",
      "brand": "AMD",
      "manufacturer": "SAPPHIRE",
      "sku": "11322-02-20G",
      "vram": 24,
      "vramType": "GDDR6",
      "dimensions": [
        313,
        133.75,
        52.67
      ],
      "length": 313,
      "width": 133.75,
      "thickness": 52.67,
      "power": 370,
      "recommendedPsu": 800,
      "connectors": 3,
      "connectorType": "8pin",
      "connectorCount": 3,
      "fans": 3,
      "boostMHz": 2525,
      "busBits": 384,
      "pcieGeneration": 4,
      "pcieLanes": 16,
      "ports": [
        "2 × DisplayPort 2.1",
        "2 × HDMI"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "24 ГБ GDDR6 · 313 мм · 370 Вт · 3 × 8-pin",
      "sources": [
        "https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-7900-xtx-24g-gddr6"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов."
      ]
    },
    {
      "id": "rx9060xt-8-pulse",
      "name": "SAPPHIRE PULSE AMD Radeon RX 9060 XT 8GB",
      "short": "Radeon RX 9060 XT 8 ГБ",
      "brand": "AMD",
      "manufacturer": "SAPPHIRE",
      "sku": "11350-05-20G",
      "vram": 8,
      "vramType": "GDDR6",
      "dimensions": [
        200,
        109.25,
        40.6
      ],
      "length": 200,
      "width": 109.25,
      "thickness": 40.6,
      "power": 150,
      "recommendedPsu": 450,
      "connectors": 1,
      "connectorType": "8pin",
      "connectorCount": 1,
      "fans": 2,
      "boostMHz": 3130,
      "busBits": 128,
      "pcieGeneration": 5,
      "pcieLanes": 16,
      "ports": [
        "1 × DisplayPort 2.1a",
        "2 × HDMI"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "8 ГБ GDDR6 · 200 мм · 150 Вт · 1 × 8-pin",
      "sources": [
        "https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-9060-xt-8g-m-gddr6"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов.",
        "Компактное исполнение без OC 11350-05-20G, 200 мм. Не версия OC 11350-04."
      ]
    },
    {
      "id": "rx9060xt-16-pulse-oc",
      "name": "SAPPHIRE PULSE AMD Radeon RX 9060 XT OC 16GB",
      "short": "Radeon RX 9060 XT OC 16 ГБ",
      "brand": "AMD",
      "manufacturer": "SAPPHIRE",
      "sku": "11350-03-20G",
      "vram": 16,
      "vramType": "GDDR6",
      "dimensions": [
        240,
        111.25,
        46.08
      ],
      "length": 240,
      "width": 111.25,
      "thickness": 46.08,
      "power": 170,
      "recommendedPsu": 450,
      "connectors": 1,
      "connectorType": "8pin",
      "connectorCount": 1,
      "fans": 2,
      "boostMHz": 3290,
      "busBits": 128,
      "pcieGeneration": 5,
      "pcieLanes": 16,
      "ports": [
        "1 × DisplayPort 2.1a",
        "2 × HDMI"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "16 ГБ GDDR6 · 240 мм · 170 Вт · 1 × 8-pin",
      "sources": [
        "https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-9060-xt-16g-gddr6"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов."
      ]
    },
    {
      "id": "rx9070-pulse",
      "name": "SAPPHIRE PULSE AMD Radeon RX 9070 16GB",
      "short": "Radeon RX 9070 16 ГБ",
      "brand": "AMD",
      "manufacturer": "SAPPHIRE",
      "sku": "11349-03-20G",
      "vram": 16,
      "vramType": "GDDR6",
      "dimensions": [
        280,
        120.25,
        51.5
      ],
      "length": 280,
      "width": 120.25,
      "thickness": 51.5,
      "power": 220,
      "recommendedPsu": 650,
      "connectors": 2,
      "connectorType": "8pin",
      "connectorCount": 2,
      "fans": 2,
      "boostMHz": 2520,
      "busBits": 256,
      "pcieGeneration": 5,
      "pcieLanes": 16,
      "ports": [
        "2 × DisplayPort 2.1a",
        "2 × HDMI"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "16 ГБ GDDR6 · 280 мм · 220 Вт · 2 × 8-pin",
      "sources": [
        "https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-9070-16g-gddr6"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов."
      ]
    },
    {
      "id": "rx9070xt-pulse",
      "name": "SAPPHIRE PULSE AMD Radeon RX 9070 XT 16GB",
      "short": "Radeon RX 9070 XT 16 ГБ",
      "brand": "AMD",
      "manufacturer": "SAPPHIRE",
      "sku": "11348-03-20G",
      "vram": 16,
      "vramType": "GDDR6",
      "dimensions": [
        320,
        120.25,
        61.6
      ],
      "length": 320,
      "width": 120.25,
      "thickness": 61.6,
      "power": 304,
      "recommendedPsu": 750,
      "connectors": 2,
      "connectorType": "8pin",
      "connectorCount": 2,
      "fans": 3,
      "boostMHz": 2970,
      "busBits": 256,
      "pcieGeneration": 5,
      "pcieLanes": 16,
      "ports": [
        "2 × DisplayPort 2.1a",
        "2 × HDMI"
      ],
      "tmax": 90,
      "tmaxAssumed": true,
      "thermalAssumed": true,
      "detail": "16 ГБ GDDR6 · 320 мм · 304 Вт · 2 × 8-pin",
      "sources": [
        "https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-9070-xt-16g-gddr6"
      ],
      "notes": [
        "90 °C — условный температурный предел учебной модели, не подтверждённый порог BIOS и не температура hotspot; коэффициенты нагрева симуляции не являются результатами тестов."
      ]
    }
  ],
  "ram": [
    {
      "id": "ddr4-32",
      "name": "Kingston FURY Beast 32 ГБ DDR4",
      "short": "FURY Beast DDR4",
      "sku": "KF432C16BBK2/32",
      "memory": "DDR4",
      "capacity": 32,
      "modules": 2,
      "speed": 3200,
      "height": 34.1,
      "detail": "2 × 16 ГБ · DDR4-3200 · CL16",
      "sources": [
        "https://www.kingston.com/dataSheets/KF432C16BBK2_32.pdf"
      ],
      "cl": 16,
      "voltage": 1.35,
      "profile": "XMP 2.0",
      "brand": "Kingston"
    },
    {
      "id": "ddr5-32",
      "name": "Kingston FURY Beast 32 ГБ DDR5",
      "short": "FURY Beast DDR5",
      "sku": "KF560C36BBEK2-32",
      "memory": "DDR5",
      "capacity": 32,
      "modules": 2,
      "speed": 6000,
      "height": 34.9,
      "detail": "2 × 16 ГБ · DDR5-6000 · CL36",
      "sources": [
        "https://www.kingston.com/datasheets/KF560C36BBEK2-32.pdf"
      ],
      "cl": 36,
      "voltage": 1.35,
      "profile": "AMD EXPO 1.0 / Intel XMP 3.0",
      "brand": "Kingston"
    },
    {
      "id": "ddr4-16-3200",
      "name": "Kingston FURY Beast 16 ГБ DDR4-3200",
      "short": "FURY Beast 16 ГБ DDR4",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "KF432C16BBK2/16",
      "memory": "DDR4",
      "capacity": 16,
      "modules": 2,
      "speed": 3200,
      "height": 34,
      "latency": 16,
      "voltage": 1.35,
      "profile": "XMP 2.0",
      "detail": "2 × 8 ГБ · DDR4-3200 · CL16",
      "notes": "3200 МТ/с — профиль XMP; штатный JEDEC в даташите — 2400 МТ/с. Для заявленной скорости нужны поддержка платы/CPU и включение профиля.",
      "sources": [
        "https://www.kingston.com/dataSheets/KF432C16BBK2_16.pdf"
      ]
    },
    {
      "id": "ddr4-32-3600",
      "name": "Kingston FURY Beast 32 ГБ DDR4-3600",
      "short": "FURY Beast DDR4-3600",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "KF436C18BBK2/32",
      "memory": "DDR4",
      "capacity": 32,
      "modules": 2,
      "speed": 3600,
      "height": 34,
      "latency": 18,
      "voltage": 1.35,
      "profile": "XMP 2.0",
      "detail": "2 × 16 ГБ · DDR4-3600 · CL18",
      "notes": "3600 МТ/с — профиль XMP; штатный JEDEC в даташите — 2400 МТ/с. Разгон памяти зависит от CPU, BIOS и конфигурации DIMM.",
      "sources": [
        "https://www.kingston.com/datasheets/KF436C18BBK2_32.pdf"
      ]
    },
    {
      "id": "ddr5-16-5200",
      "name": "Kingston FURY Beast 16 ГБ DDR5-5200",
      "short": "FURY Beast 16 ГБ DDR5",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "KF552C40BBK2-16",
      "memory": "DDR5",
      "capacity": 16,
      "modules": 2,
      "speed": 5200,
      "height": 34.9,
      "latency": 40,
      "voltage": 1.25,
      "profile": "XMP 3.0",
      "detail": "2 × 8 ГБ · DDR5-5200 · CL40",
      "notes": "5200 МТ/с — профиль XMP; штатный JEDEC — 4800 МТ/с. Фактическая скорость зависит от поддержки профиля платой и процессором.",
      "sources": [
        "https://www.kingston.com/datasheets/KF552C40BBK2-16.pdf"
      ]
    },
    {
      "id": "ddr5-64-6000",
      "name": "Kingston FURY Beast 64 ГБ DDR5-6000",
      "short": "FURY Beast 64 ГБ DDR5",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "KF560C36BBEK2-64",
      "memory": "DDR5",
      "capacity": 64,
      "modules": 2,
      "speed": 6000,
      "height": 34.9,
      "latency": 36,
      "voltage": 1.35,
      "profile": "AMD EXPO / XMP 3.0",
      "detail": "2 × 32 ГБ · DDR5-6000 · CL36",
      "notes": "6000 МТ/с — профиль EXPO/XMP; штатный JEDEC — 4800 МТ/с. Заявленная скорость не гарантирована для любой платы и процессора.",
      "sources": [
        "https://www.kingston.com/datasheets/KF560C36BBEK2-64.pdf"
      ]
    },
    {
      "id": "ddr4-16-3600-cl17",
      "name": "Kingston FURY Beast 16 ГБ DDR4-3600 CL17",
      "short": "FURY Beast 16 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "KF436C17BBK2/16",
      "memory": "DDR4",
      "capacity": 16,
      "modules": 2,
      "speed": 3600,
      "height": 34,
      "cl": 17,
      "latency": "17-21-21",
      "voltage": 1.35,
      "profile": "XMP 2.0",
      "detail": "2 × 8 ГБ · DDR4-3600 · CL17 · 34 мм",
      "notes": "3600 МТ/с — профиль XMP 2.0, а не гарантированная скорость на любой плате. JEDEC по умолчанию — 2400 МТ/с; нужны совместимые CPU/плата/BIOS и включение профиля.",
      "sources": [
        "https://www.kingston.com/datasheets/KF436C17BBK2_16.pdf"
      ]
    },
    {
      "id": "ddr4-64-3200",
      "name": "Kingston FURY Beast 64 ГБ DDR4-3200 CL16",
      "short": "FURY Beast 64 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "KF432C16BBK2/64",
      "memory": "DDR4",
      "capacity": 64,
      "modules": 2,
      "speed": 3200,
      "height": 34,
      "cl": 16,
      "latency": "16-20-20",
      "voltage": 1.35,
      "profile": "XMP 2.0",
      "detail": "2 × 32 ГБ · DDR4-3200 · CL16 · 34 мм",
      "notes": "3200 МТ/с — профиль XMP 2.0, а не гарантированная скорость на любой плате. JEDEC по умолчанию — 2400 МТ/с; нужны совместимые CPU/плата/BIOS и включение профиля.",
      "sources": [
        "https://www.kingston.com/datasheets/KF432C16BBK2_64.pdf"
      ]
    },
    {
      "id": "ddr4-64-3600",
      "name": "Kingston FURY Beast 64 ГБ DDR4-3600 CL18",
      "short": "FURY Beast 64 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "KF436C18BBK2/64",
      "memory": "DDR4",
      "capacity": 64,
      "modules": 2,
      "speed": 3600,
      "height": 34,
      "cl": 18,
      "latency": "18-22-22",
      "voltage": 1.35,
      "profile": "XMP 2.0",
      "detail": "2 × 32 ГБ · DDR4-3600 · CL18 · 34 мм",
      "notes": "3600 МТ/с — профиль XMP 2.0, а не гарантированная скорость на любой плате. JEDEC по умолчанию — 2400 МТ/с; нужны совместимые CPU/плата/BIOS и включение профиля.",
      "sources": [
        "https://www.kingston.com/datasheets/KF436C18BBK2_64.pdf"
      ]
    },
    {
      "id": "renegade-ddr4-32-3600",
      "name": "Kingston FURY Renegade 32 ГБ DDR4-3600 CL16",
      "short": "FURY Renegade 32 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "KF436C16RB1K2/32",
      "memory": "DDR4",
      "capacity": 32,
      "modules": 2,
      "speed": 3600,
      "height": 42.2,
      "cl": 16,
      "latency": "16-20-20",
      "voltage": 1.35,
      "profile": "XMP 2.0",
      "detail": "2 × 16 ГБ · DDR4-3600 · CL16 · 42.2 мм",
      "notes": "3600 МТ/с — профиль XMP 2.0, а не гарантированная скорость на любой плате. JEDEC по умолчанию — 2400 МТ/с; нужны совместимые CPU/плата/BIOS и включение профиля.",
      "sources": [
        "https://www.kingston.com/datasheets/KF436C16RB1K2_32.pdf"
      ]
    },
    {
      "id": "ddr5-32-5200",
      "name": "Kingston FURY Beast 32 ГБ DDR5-5200 CL40",
      "short": "FURY Beast 32 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "KF552C40BBK2-32",
      "memory": "DDR5",
      "capacity": 32,
      "modules": 2,
      "speed": 5200,
      "height": 34.9,
      "cl": 40,
      "latency": "40-40-40",
      "voltage": 1.25,
      "profile": "XMP 3.0",
      "detail": "2 × 16 ГБ · DDR5-5200 · CL40 · 34.9 мм",
      "notes": "5200 МТ/с — профиль XMP 3.0, а не гарантированная скорость на любой плате. JEDEC по умолчанию — 4800 МТ/с; нужны совместимые CPU/плата/BIOS и включение профиля.",
      "sources": [
        "https://www.kingston.com/datasheets/KF552C40BBK2-32.pdf"
      ]
    },
    {
      "id": "ddr5-32-5600",
      "name": "Kingston FURY Beast 32 ГБ DDR5-5600 CL40",
      "short": "FURY Beast 32 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "KF556C40BBK2-32",
      "memory": "DDR5",
      "capacity": 32,
      "modules": 2,
      "speed": 5600,
      "height": 34.9,
      "cl": 40,
      "latency": "40-40-40",
      "voltage": 1.25,
      "profile": "XMP 3.0",
      "detail": "2 × 16 ГБ · DDR5-5600 · CL40 · 34.9 мм",
      "notes": "5600 МТ/с — профиль XMP 3.0, а не гарантированная скорость на любой плате. JEDEC по умолчанию — 4800 МТ/с; нужны совместимые CPU/плата/BIOS и включение профиля.",
      "sources": [
        "https://www.kingston.com/datasheets/KF556C40BBK2-32.pdf"
      ]
    },
    {
      "id": "ddr5-32-6000-cl30",
      "name": "Kingston FURY Beast 32 ГБ DDR5-6000 CL30",
      "short": "FURY Beast 32 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "KF560C30BBEK2-32",
      "memory": "DDR5",
      "capacity": 32,
      "modules": 2,
      "speed": 6000,
      "height": 34.9,
      "cl": 30,
      "latency": "30-36-36",
      "voltage": 1.4,
      "profile": "AMD EXPO 1.1 / Intel XMP 3.0",
      "detail": "2 × 16 ГБ · DDR5-6000 · CL30 · 34.9 мм",
      "notes": "6000 МТ/с — профиль AMD EXPO 1.1 / Intel XMP 3.0, а не гарантированная скорость на любой плате. JEDEC по умолчанию — 4800 МТ/с; нужны совместимые CPU/плата/BIOS и включение профиля.",
      "sources": [
        "https://www.kingston.com/datasheets/KF560C30BBEK2-32.pdf"
      ]
    },
    {
      "id": "ddr5-64-5600",
      "name": "Kingston FURY Beast 64 ГБ DDR5-5600 CL40",
      "short": "FURY Beast 64 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "KF556C40BBK2-64",
      "memory": "DDR5",
      "capacity": 64,
      "modules": 2,
      "speed": 5600,
      "height": 34.9,
      "cl": 40,
      "latency": "40-40-40",
      "voltage": 1.25,
      "profile": "XMP 3.0",
      "detail": "2 × 32 ГБ · DDR5-5600 · CL40 · 34.9 мм",
      "notes": "5600 МТ/с — профиль XMP 3.0, а не гарантированная скорость на любой плате. JEDEC по умолчанию — 4800 МТ/с; нужны совместимые CPU/плата/BIOS и включение профиля.",
      "sources": [
        "https://www.kingston.com/datasheets/KF556C40BBK2-64.pdf"
      ]
    },
    {
      "id": "renegade-ddr5-32-6400",
      "name": "Kingston FURY Renegade Silver 32 ГБ DDR5-6400 CL32",
      "short": "FURY Renegade Silver 32 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "KF564C32RSK2-32",
      "memory": "DDR5",
      "capacity": 32,
      "modules": 2,
      "speed": 6400,
      "height": 39.2,
      "cl": 32,
      "latency": "32-39-39",
      "voltage": 1.4,
      "profile": "XMP 3.0",
      "detail": "2 × 16 ГБ · DDR5-6400 · CL32 · 39.2 мм",
      "notes": "6400 МТ/с — профиль XMP 3.0, а не гарантированная скорость на любой плате. JEDEC по умолчанию — 4800 МТ/с; нужны совместимые CPU/плата/BIOS и включение профиля.",
      "sources": [
        "https://www.kingston.com/datasheets/KF564C32RSK2-32.pdf"
      ]
    },
    {
      "id": "renegade-ddr5-32-7200",
      "name": "Kingston FURY Renegade Silver 32 ГБ DDR5-7200 CL38",
      "short": "FURY Renegade Silver 32 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "KF572C38RSK2-32",
      "memory": "DDR5",
      "capacity": 32,
      "modules": 2,
      "speed": 7200,
      "height": 39.2,
      "cl": 38,
      "latency": "38-44-44",
      "voltage": 1.45,
      "profile": "XMP 3.0",
      "detail": "2 × 16 ГБ · DDR5-7200 · CL38 · 39.2 мм",
      "notes": "7200 МТ/с — профиль XMP 3.0, а не гарантированная скорость на любой плате. JEDEC по умолчанию — 4800 МТ/с; нужны совместимые CPU/плата/BIOS и включение профиля.",
      "sources": [
        "https://www.kingston.com/datasheets/KF572C38RSK2-32.pdf"
      ]
    }
  ],
  "storage": [
    {
      "id": "nv2",
      "name": "Kingston NV2 1 ТБ",
      "short": "Kingston NV2",
      "interface": "M.2 NVMe",
      "capacity": 1000,
      "power": 5,
      "detail": "1 ТБ · M.2 2280 · PCIe 4.0",
      "sources": [
        "https://www.kingston.com/datasheets/snv2s_en.pdf"
      ],
      "dimensions": [
        80,
        22,
        2.2
      ],
      "pcieGeneration": 4,
      "pcieLanes": 4,
      "readMBs": 3500,
      "writeMBs": 2100,
      "operatingMaxC": 70,
      "tbw": 320
    },
    {
      "id": "980",
      "name": "Samsung 980 1 ТБ",
      "short": "Samsung 980",
      "interface": "M.2 NVMe",
      "capacity": 1000,
      "power": 6,
      "detail": "1 ТБ · M.2 2280 · PCIe 3.0",
      "sources": [
        "https://semiconductor.samsung.com/emea/consumer-storage/internal-ssd/980/"
      ],
      "pcieGeneration": 3,
      "pcieLanes": 4,
      "operatingMaxC": 70,
      "tbw": 600
    },
    {
      "id": "990-pro-1tb",
      "name": "Samsung 990 PRO 1 ТБ",
      "short": "Samsung 990 PRO",
      "brand": "Samsung",
      "manufacturer": "Samsung",
      "sku": "MZ-V9P1T0BW",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "4.0 x4",
      "capacity": 1000,
      "power": 7.8,
      "powerAssumed": false,
      "readSpeed": 7450,
      "writeSpeed": 6900,
      "detail": "1 ТБ · M.2 2280 · PCIe 4.0 · до 7450 МБ/с",
      "notes": "Мощность 7,8 Вт — опубликованный максимум в burst-режиме, не постоянное потребление. Скорости — максимальные последовательные значения производителя.",
      "sources": [
        "https://www.samsung.com/uk/business/memory-storage/nvme-ssd/990-pro-1tb-nvme-pcie-gen-4-mz-v9p1t0bw/",
        "https://www.samsung.com/be_fr/memory-storage/nvme-ssd/990-pro-1tb-nvme-pcie-gen-4-mz-v9p1t0bw/"
      ]
    },
    {
      "id": "kc3000-1tb",
      "name": "Kingston KC3000 1024 ГБ",
      "short": "Kingston KC3000",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "SKC3000S/1024G",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "4.0 x4",
      "capacity": 1024,
      "power": 6.3,
      "powerAssumed": false,
      "readSpeed": 7000,
      "writeSpeed": 6000,
      "tbw": 800,
      "detail": "1024 ГБ · M.2 2280 · PCIe 4.0 · TLC",
      "notes": "6,3 Вт — максимальная мощность при записи из даташита; среднее потребление там указано 0,33 Вт. Скорости — до 7000/6000 МБ/с.",
      "sources": [
        "https://www.kingston.com/unitedkingdom/en/ssd/kc3000-nvme-m2-solid-state-drive?capacity=1024gb",
        "https://www.kingston.com/datasheets/KC3000_us.pdf?_=v1"
      ]
    },
    {
      "id": "p3-plus-1tb",
      "name": "Crucial P3 Plus 1 ТБ",
      "short": "Crucial P3 Plus",
      "brand": "Crucial",
      "manufacturer": "Micron / Crucial",
      "sku": "CT1000P3PSSD8",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "4.0 x4",
      "capacity": 1000,
      "power": 5,
      "powerAssumed": true,
      "readSpeed": 5000,
      "writeSpeed": 3600,
      "tbw": 220,
      "detail": "1 ТБ · M.2 2280 · PCIe 4.0 · до 5000 МБ/с",
      "notes": "5 Вт — допущение учебной модели энергопотребления, не спецификация производителя. Скорости до 5000/3600 МБ/с и 220 TBW относятся к версии 1 ТБ.",
      "sources": [
        "https://eu.crucial.com/ssd/p3-plus/ct1000p3pssd8/ct21662099",
        "https://it.crucial.com/content/dam/crucial/ssd-products/p3-plus/flyers/b2c/crucial-p3plus-productflyer-consumer_itIT.pdf"
      ]
    },
    {
      "id": "sn850x-2tb",
      "name": "WD_BLACK SN850X 2 ТБ",
      "short": "WD_BLACK SN850X 2 ТБ",
      "brand": "WD_BLACK",
      "manufacturer": "SanDisk",
      "sku": "WDS200T2X0E",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "4.0 x4",
      "capacity": 2000,
      "power": 7,
      "powerAssumed": true,
      "readSpeed": 7300,
      "writeSpeed": 6600,
      "tbw": 1200,
      "detail": "2 ТБ · M.2 2280 · PCIe 4.0 · до 7300 МБ/с",
      "notes": "Версия без радиатора. 7 Вт — допущение учебной модели, не паспортная мощность. Скорости производителя до 7300/6600 МБ/с.",
      "sources": [
        "https://www.sandisk.com/products/ssd/internal-ssd/wd-black-sn850x-nvme-ssd",
        "https://documents.westerndigital.com/content/dam/doc-library/en_us/assets/public/western-digital/product/internal-drives/wd-black-ssd/data-sheet-wd-black-sn850x-nvme-ssd.pdf"
      ]
    },
    {
      "id": "nv2-500gb",
      "name": "Kingston NV2 500 ГБ",
      "short": "NV2 500 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "SNV2S/500G",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "4.0 x4",
      "pcieGeneration": 4,
      "pcieLanes": 4,
      "capacity": 500,
      "power": 5,
      "powerAssumed": true,
      "readSpeed": 3500,
      "writeSpeed": 2100,
      "tbw": 160,
      "operatingMaxC": 70,
      "dimensions": [
        80,
        22,
        2.2
      ],
      "detail": "500 ГБ · M.2 2280 · PCIe 4.0 ×4 · до 3500 МБ/с",
      "notes": "5 Вт — допущение учебной модели: электрическая мощность не указана в даташите. Скорости — максимальные последовательные значения для этой ёмкости, зависят от условий и кэша. Версия без отдельного радиатора.",
      "sources": [
        "https://www.kingston.com/datasheets/snv2s_en.pdf"
      ]
    },
    {
      "id": "nv2-2tb",
      "name": "Kingston NV2 2000 ГБ",
      "short": "NV2 2000 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "SNV2S/2000G",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "4.0 x4",
      "pcieGeneration": 4,
      "pcieLanes": 4,
      "capacity": 2000,
      "power": 5,
      "powerAssumed": true,
      "readSpeed": 3500,
      "writeSpeed": 2800,
      "tbw": 640,
      "operatingMaxC": 70,
      "dimensions": [
        80,
        22,
        2.2
      ],
      "detail": "2000 ГБ · M.2 2280 · PCIe 4.0 ×4 · до 3500 МБ/с",
      "notes": "5 Вт — допущение учебной модели: электрическая мощность не указана в даташите. Скорости — максимальные последовательные значения для этой ёмкости, зависят от условий и кэша. Версия без отдельного радиатора.",
      "sources": [
        "https://www.kingston.com/datasheets/snv2s_en.pdf"
      ]
    },
    {
      "id": "kc3000-512gb",
      "name": "Kingston KC3000 512 ГБ",
      "short": "KC3000 512 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "SKC3000S/512G",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "4.0 x4",
      "pcieGeneration": 4,
      "pcieLanes": 4,
      "capacity": 512,
      "power": 4.1,
      "powerAssumed": false,
      "readSpeed": 7000,
      "writeSpeed": 3900,
      "tbw": 400,
      "operatingMaxC": 70,
      "dimensions": [
        80,
        22,
        2.21
      ],
      "detail": "512 ГБ · M.2 2280 · PCIe 4.0 ×4 · до 7000 МБ/с",
      "notes": "4.1 Вт — максимальная мощность записи из даташита. Скорости — максимальные последовательные значения для этой ёмкости, зависят от условий и кэша. Версия без отдельного радиатора.",
      "sources": [
        "https://www.kingston.com/datasheets/KC3000_us.pdf"
      ]
    },
    {
      "id": "kc3000-2tb",
      "name": "Kingston KC3000 2048 ГБ",
      "short": "KC3000 2048 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "SKC3000D/2048G",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "4.0 x4",
      "pcieGeneration": 4,
      "pcieLanes": 4,
      "capacity": 2048,
      "power": 9.9,
      "powerAssumed": false,
      "readSpeed": 7000,
      "writeSpeed": 7000,
      "tbw": 1600,
      "operatingMaxC": 70,
      "dimensions": [
        80,
        22,
        3.5
      ],
      "detail": "2048 ГБ · M.2 2280 · PCIe 4.0 ×4 · до 7000 МБ/с",
      "notes": "9.9 Вт — максимальная мощность записи из даташита. Скорости — максимальные последовательные значения для этой ёмкости, зависят от условий и кэша. Версия без отдельного радиатора.",
      "sources": [
        "https://www.kingston.com/datasheets/KC3000_us.pdf"
      ]
    },
    {
      "id": "kc3000-4tb",
      "name": "Kingston KC3000 4096 ГБ",
      "short": "KC3000 4096 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "SKC3000D/4096G",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "4.0 x4",
      "pcieGeneration": 4,
      "pcieLanes": 4,
      "capacity": 4096,
      "power": 10.2,
      "powerAssumed": false,
      "readSpeed": 7000,
      "writeSpeed": 7000,
      "tbw": 3200,
      "operatingMaxC": 70,
      "dimensions": [
        80,
        22,
        3.5
      ],
      "detail": "4096 ГБ · M.2 2280 · PCIe 4.0 ×4 · до 7000 МБ/с",
      "notes": "10.2 Вт — максимальная мощность записи из даташита. Скорости — максимальные последовательные значения для этой ёмкости, зависят от условий и кэша. Версия без отдельного радиатора.",
      "sources": [
        "https://www.kingston.com/datasheets/KC3000_us.pdf"
      ]
    },
    {
      "id": "nv3-1tb",
      "name": "Kingston NV3 1000 ГБ",
      "short": "NV3 1000 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "SNV3S/1000G",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "4.0 x4",
      "pcieGeneration": 4,
      "pcieLanes": 4,
      "capacity": 1000,
      "power": 5,
      "powerAssumed": true,
      "readSpeed": 6000,
      "writeSpeed": 4000,
      "tbw": 320,
      "operatingMaxC": 70,
      "dimensions": [
        80,
        22,
        2.3
      ],
      "detail": "1000 ГБ · M.2 2280 · PCIe 4.0 ×4 · до 6000 МБ/с",
      "notes": "5 Вт — допущение учебной модели: электрическая мощность не указана в даташите. Скорости — максимальные последовательные значения для этой ёмкости, зависят от условий и кэша. Версия без отдельного радиатора.",
      "sources": [
        "https://www.kingston.com/datasheets/SNV3S_en.pdf"
      ]
    },
    {
      "id": "nv3-2tb",
      "name": "Kingston NV3 2000 ГБ",
      "short": "NV3 2000 ГБ",
      "brand": "Kingston",
      "manufacturer": "Kingston",
      "sku": "SNV3S/2000G",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "4.0 x4",
      "pcieGeneration": 4,
      "pcieLanes": 4,
      "capacity": 2000,
      "power": 5,
      "powerAssumed": true,
      "readSpeed": 6000,
      "writeSpeed": 5000,
      "tbw": 640,
      "operatingMaxC": 70,
      "dimensions": [
        80,
        22,
        2.3
      ],
      "detail": "2000 ГБ · M.2 2280 · PCIe 4.0 ×4 · до 6000 МБ/с",
      "notes": "5 Вт — допущение учебной модели: электрическая мощность не указана в даташите. Скорости — максимальные последовательные значения для этой ёмкости, зависят от условий и кэша. Версия без отдельного радиатора.",
      "sources": [
        "https://www.kingston.com/datasheets/SNV3S_en.pdf"
      ]
    },
    {
      "id": "990-pro-2tb",
      "name": "Samsung 990 PRO 2000 ГБ",
      "short": "990 PRO 2000 ГБ",
      "brand": "Samsung",
      "manufacturer": "Samsung",
      "sku": "MZ-V9P2T0BW",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "4.0 x4",
      "pcieGeneration": 4,
      "pcieLanes": 4,
      "capacity": 2000,
      "power": 6.1,
      "powerAssumed": false,
      "readSpeed": 7450,
      "writeSpeed": 6900,
      "tbw": 1200,
      "operatingMaxC": 70,
      "dimensions": [
        80,
        22,
        2.3
      ],
      "detail": "2000 ГБ · M.2 2280 · PCIe 4.0 ×4 · до 7450 МБ/с",
      "notes": "6.1 Вт — средняя активная мощность чтения из даташита, не пиковая мощность. Скорости — максимальные последовательные значения для этой ёмкости, зависят от условий и кэша. Версия без отдельного радиатора.",
      "sources": [
        "https://download.semiconductor.samsung.com/resources/data-sheet/samsung_nvme_ssd_990_pro_datasheet_rev.2.0.pdf"
      ]
    },
    {
      "id": "990-pro-4tb",
      "name": "Samsung 990 PRO 4000 ГБ",
      "short": "990 PRO 4000 ГБ",
      "brand": "Samsung",
      "manufacturer": "Samsung",
      "sku": "MZ-V9P4T0BW",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "4.0 x4",
      "pcieGeneration": 4,
      "pcieLanes": 4,
      "capacity": 4000,
      "power": 6.5,
      "powerAssumed": false,
      "readSpeed": 7450,
      "writeSpeed": 6900,
      "tbw": 2400,
      "operatingMaxC": 70,
      "dimensions": [
        80,
        22,
        2.3
      ],
      "detail": "4000 ГБ · M.2 2280 · PCIe 4.0 ×4 · до 7450 МБ/с",
      "notes": "6.5 Вт — средняя активная мощность чтения из даташита, не пиковая мощность. Скорости — максимальные последовательные значения для этой ёмкости, зависят от условий и кэша. Версия без отдельного радиатора.",
      "sources": [
        "https://download.semiconductor.samsung.com/resources/data-sheet/samsung_nvme_ssd_990_pro_datasheet_rev.2.0.pdf"
      ]
    },
    {
      "id": "980-500gb",
      "name": "Samsung 980 500 ГБ",
      "short": "980 500 ГБ",
      "brand": "Samsung",
      "manufacturer": "Samsung",
      "sku": "MZ-V8V500BW",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "3.0 x4",
      "pcieGeneration": 3,
      "pcieLanes": 4,
      "capacity": 500,
      "power": 4.3,
      "powerAssumed": false,
      "readSpeed": 3100,
      "writeSpeed": 2600,
      "tbw": 300,
      "operatingMaxC": 70,
      "dimensions": [
        80.15,
        22.15,
        2.38
      ],
      "detail": "500 ГБ · M.2 2280 · PCIe 3.0 ×4 · до 3100 МБ/с",
      "notes": "4.3 Вт — средняя активная мощность чтения из даташита, не пиковая мощность. Скорости — максимальные последовательные значения для этой ёмкости, зависят от условий и кэша. Версия без отдельного радиатора.",
      "sources": [
        "https://download.semiconductor.samsung.com/resources/data-sheet/Samsung_NVMe_SSD_980_Data_Sheet_Rev.1.1.pdf"
      ]
    }
  ],
  "cooler": [
    {
      "id": "ak400",
      "name": "DeepCool AK400",
      "short": "AK400",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1851",
        "LGA1700",
        "LGA1200",
        "LGA1151",
        "LGA1150",
        "LGA1155"
      ],
      "height": 155,
      "ramClearance": 99,
      "efficiency": 1,
      "maxRpm": 1850,
      "towers": 1,
      "detail": "Башенный · 155 мм · до 1850 об/мин",
      "sources": [
        "https://jp.deepcool.com/products/Cooling/cpuaircoolers/AK400-Performance-CPU-Cooler-1851-1700-AM5/2024/15349.shtml",
        "https://www.deepcool.com/download/pdf/AK400.pdf"
      ],
      "dimensions": [
        127,
        97,
        155
      ],
      "heatpipes": 4,
      "fans": 1,
      "fanSizeMm": 120,
      "minRpm": 500,
      "fanAirflowCFM": 66.47,
      "brand": "DeepCool"
    },
    {
      "id": "ak620",
      "name": "DeepCool AK620",
      "short": "AK620",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1851",
        "LGA1700",
        "LGA1200",
        "LGA1151",
        "LGA1150",
        "LGA1155",
        "LGA2066",
        "LGA2011"
      ],
      "height": 160,
      "ramClearance": 43,
      "efficiency": 1.45,
      "maxRpm": 1850,
      "towers": 2,
      "detail": "Две башни · 160 мм · до 1850 об/мин",
      "sources": [
        "https://global.deepcool.com/products/Cooling/cpuaircoolers/AK620-High-Performance-CPU-Cooler-1851-1700-AM5/2024/13067.shtml"
      ],
      "dimensions": [
        129,
        138,
        160
      ],
      "heatpipes": 6,
      "fans": 2,
      "fanSizeMm": 120,
      "minRpm": 500,
      "fanAirflowCFM": 68.99,
      "brand": "DeepCool"
    },
    {
      "id": "ag400",
      "name": "DeepCool AG400",
      "short": "AG400",
      "brand": "DeepCool",
      "manufacturer": "DeepCool",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700"
      ],
      "height": 150,
      "ramClearance": 99,
      "ramUnrestricted": true,
      "efficiency": 0.95,
      "thermalAssumed": true,
      "maxRpm": 2000,
      "towers": 1,
      "fans": 1,
      "heatpipes": 4,
      "detail": "Башенный · 150 мм · 4 теплотрубки · до 2000 об/мин",
      "notes": "Коэффициент efficiency 0,95 — допущение учебной тепловой модели, не измерение. Производитель заявляет полную совместимость с RAM; число 99 в ramClearance — технический маркер отсутствия перекрытия, не измеренный зазор.",
      "sources": [
        "https://uk.deepcool.com/products/Cooling/cpuaircoolers/GAMMAXX-AG400-Single-Tower-CPU-Cooler/2022/15908.shtml"
      ]
    },
    {
      "id": "nh-u12s-redux",
      "name": "Noctua NH-U12S redux",
      "short": "NH-U12S redux",
      "brand": "Noctua",
      "manufacturer": "Noctua",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700"
      ],
      "height": 158,
      "ramClearance": 99,
      "ramUnrestricted": true,
      "efficiency": 1.1,
      "thermalAssumed": true,
      "maxRpm": 1700,
      "towers": 1,
      "fans": 1,
      "heatpipes": 4,
      "detail": "Башенный · 158 мм · до 1700 об/мин · RAM без перекрытия",
      "notes": "efficiency 1,1 — допущение учебной модели. 99 — технический маркер отсутствия перекрытия RAM. Для старых комплектов до Q4 2021 может понадобиться отдельное крепление LGA1700.",
      "sources": [
        "https://noctua.at/en/nh-u12s-redux?tab=comp",
        "https://cdn.noctua.at/media/noctua_nh_u12s_redux_infosheet_en_web.pdf"
      ]
    },
    {
      "id": "nh-d15",
      "name": "Noctua NH-D15",
      "short": "NH-D15",
      "brand": "Noctua",
      "manufacturer": "Noctua",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700"
      ],
      "height": 165,
      "ramClearance": 32,
      "ramClearanceSingleFan": 64,
      "adjustableFrontFan": true,
      "efficiency": 1.55,
      "thermalAssumed": true,
      "maxRpm": 1500,
      "towers": 2,
      "fans": 2,
      "heatpipes": 6,
      "detail": "Две башни · 165 мм · 2 вентилятора · до 1500 об/мин",
      "notes": "efficiency 1,55 — допущение учебной модели. С двумя вентиляторами штатный зазор RAM 32 мм; передний вентилятор можно поднять, увеличив общую высоту. С одним вентилятором зазор 64 мм. Для старых комплектов сверь наличие крепления LGA1700.",
      "sources": [
        "https://cdn.noctua.at/media/noctua_nh_d15_infosheet_en_web.pdf?download=true"
      ]
    },
    {
      "id": "ak500",
      "name": "DeepCool AK500",
      "short": "AK500",
      "brand": "DeepCool",
      "manufacturer": "DeepCool",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700"
      ],
      "height": 158,
      "ramClearance": 99,
      "ramUnrestricted": true,
      "efficiency": 1.25,
      "thermalAssumed": true,
      "maxRpm": 1850,
      "towers": 1,
      "fans": 1,
      "heatpipes": 5,
      "fanSizeMm": 120,
      "dimensions": [
        127,
        117,
        158
      ],
      "detail": "1 башн. · 158 мм · 1 вент. · 5 теплотрубок",
      "notes": "efficiency 1.25 — условный коэффициент учебной тепловой модели, не измерение и не паспортный TDP. 99 — технический маркер: радиатор не перекрывает RAM на перечисленных платформах. ",
      "sources": [
        "https://global.deepcool.com/products/Cooling/cpuaircoolers/AK500-High-Performance-CPU-Cooler-1851-1700-AM5/2022/16040.shtml"
      ],
      "sku": "R-AK500-BKNNMT-G"
    },
    {
      "id": "ag500",
      "name": "DeepCool AG500",
      "short": "AG500",
      "brand": "DeepCool",
      "manufacturer": "DeepCool",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700"
      ],
      "height": 155,
      "ramClearance": 99,
      "ramUnrestricted": true,
      "efficiency": 1.15,
      "thermalAssumed": true,
      "maxRpm": 1850,
      "towers": 1,
      "fans": 1,
      "heatpipes": 5,
      "fanSizeMm": 120,
      "dimensions": [
        125,
        95,
        155
      ],
      "detail": "1 башн. · 155 мм · 1 вент. · 5 теплотрубок",
      "notes": "efficiency 1.15 — условный коэффициент учебной тепловой модели, не измерение и не паспортный TDP. 99 — технический маркер: радиатор не перекрывает RAM на перечисленных платформах. ",
      "sources": [
        "https://www.deepcool.com/products/Cooling/cpuaircoolers/AG500-Performance-CPU-Cooler/2022/16250.shtml"
      ],
      "sku": "R-AG500-BKNNMN-G"
    },
    {
      "id": "assassin-iv",
      "name": "DeepCool ASSASSIN IV",
      "short": "ASSASSIN IV",
      "brand": "DeepCool",
      "manufacturer": "DeepCool",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700"
      ],
      "height": 164,
      "ramClearance": 99,
      "ramUnrestricted": true,
      "efficiency": 1.6,
      "thermalAssumed": true,
      "maxRpm": 1700,
      "towers": 2,
      "fans": 2,
      "heatpipes": 7,
      "fanSizeMm": [
        140,
        120
      ],
      "dimensions": [
        144,
        147,
        164
      ],
      "detail": "2 башн. · 164 мм · 2 вент. · 7 теплотрубок",
      "notes": "efficiency 1.6 — условный коэффициент учебной тепловой модели, не измерение и не паспортный TDP. 99 — технический маркер: радиатор не перекрывает RAM на перечисленных платформах. Штатные вентиляторы — 140 и 120 мм, режим Performance. Не устанавливается на ASUS ROG STRIX Z790-H, ROG STRIX Z690-E, MSI MEG X570 GODLIKE, MSI B650M APE WIFI, ROG CROSSHAIR X670E GENE по перечню производителя.",
      "sources": [
        "https://global.deepcool.com/products/Cooling/cpuaircoolers/Assassin-IV-Premium-CPU-Air-Cooler/2023/17129.shtml"
      ],
      "sku": "R-ASN4-BKNNMT-G"
    },
    {
      "id": "nh-u12a",
      "name": "Noctua NH-U12A",
      "short": "NH-U12A",
      "brand": "Noctua",
      "manufacturer": "Noctua",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700"
      ],
      "height": 158,
      "ramClearance": 99,
      "ramUnrestricted": true,
      "efficiency": 1.4,
      "thermalAssumed": true,
      "maxRpm": 2000,
      "towers": 1,
      "fans": 2,
      "heatpipes": 7,
      "fanSizeMm": 120,
      "dimensions": [
        112,
        125,
        158
      ],
      "detail": "1 башн. · 158 мм · 2 вент. · 7 теплотрубок",
      "notes": "efficiency 1.4 — условный коэффициент учебной тепловой модели, не измерение и не паспортный TDP. 99 — технический маркер: радиатор не перекрывает RAM на перечисленных платформах. Для старой упаковки проверь наличие креплений AM4/AM5 и LGA1700. ",
      "sources": [
        "https://www.noctua.at/en/products/nh-u12a/specifications",
        "https://www.noctua.at/en/support/faqs/what-is-the-ram-clearance-of-my-noctua-cpu-cooler"
      ]
    },
    {
      "id": "nh-u14s",
      "name": "Noctua NH-U14S",
      "short": "NH-U14S",
      "brand": "Noctua",
      "manufacturer": "Noctua",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700"
      ],
      "height": 165,
      "ramClearance": 32,
      "ramUnrestricted": false,
      "efficiency": 1.3,
      "thermalAssumed": true,
      "maxRpm": 1500,
      "towers": 1,
      "fans": 1,
      "heatpipes": 6,
      "fanSizeMm": 140,
      "dimensions": [
        78,
        150,
        165
      ],
      "detail": "1 башн. · 165 мм · 1 вент. · 6 теплотрубок",
      "notes": "efficiency 1.3 — условный коэффициент учебной тепловой модели, не измерение и не паспортный TDP. Штатный зазор над RAM — 32 мм. Для старой упаковки проверь наличие креплений AM4/AM5 и LGA1700. На AM4/AM5 RAM не перекрывается; для Intel штатный зазор 32 мм. Подъём вентилятора увеличивает общую высоту.",
      "sources": [
        "https://cdn.noctua.at/media/noctua_nh_u14s_infosheet_en_web.pdf",
        "https://www.noctua.at/en/support/faqs/what-is-the-ram-clearance-of-my-noctua-cpu-cooler"
      ],
      "ramUnrestrictedSockets": [
        "AM4",
        "AM5"
      ],
      "adjustableFrontFan": true
    },
    {
      "id": "nh-d15s-chromax",
      "name": "Noctua NH-D15S chromax.black",
      "short": "NH-D15S chromax.black",
      "brand": "Noctua",
      "manufacturer": "Noctua",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700"
      ],
      "height": 160,
      "ramClearance": 66,
      "ramUnrestricted": false,
      "efficiency": 1.45,
      "thermalAssumed": true,
      "maxRpm": 1500,
      "towers": 2,
      "fans": 1,
      "heatpipes": 6,
      "fanSizeMm": 140,
      "dimensions": [
        135,
        150,
        160
      ],
      "detail": "2 башн. · 160 мм · 1 вент. · 6 теплотрубок",
      "notes": "efficiency 1.45 — условный коэффициент учебной тепловой модели, не измерение и не паспортный TDP. Штатный зазор над RAM — 66 мм. Для старой упаковки проверь наличие креплений AM4/AM5 и LGA1700. ",
      "sources": [
        "https://www.noctua.at/en/products/nh-d15s-chromax-black/specifications",
        "https://cdn.noctua.at/media/noctua_nh-d15s_chromax.black_infosheet_en_web.pdf",
        "https://www.noctua.at/en/support/faqs/what-is-the-ram-clearance-of-my-noctua-cpu-cooler"
      ]
    },
    {
      "id": "nh-d12l",
      "name": "Noctua NH-D12L",
      "short": "NH-D12L",
      "brand": "Noctua",
      "manufacturer": "Noctua",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700"
      ],
      "height": 145,
      "ramClearance": 99,
      "ramUnrestricted": true,
      "efficiency": 1.2,
      "thermalAssumed": true,
      "maxRpm": 2000,
      "towers": 2,
      "fans": 1,
      "heatpipes": 5,
      "fanSizeMm": 120,
      "dimensions": [
        113,
        125,
        145
      ],
      "detail": "2 башн. · 145 мм · 1 вент. · 5 теплотрубок",
      "notes": "efficiency 1.2 — условный коэффициент учебной тепловой модели, не измерение и не паспортный TDP. 99 — технический маркер: радиатор не перекрывает RAM на перечисленных платформах. Для старой упаковки проверь наличие креплений AM4/AM5 и LGA1700. ",
      "sources": [
        "https://cdn.noctua.at/media/noctua_nh_d12l_infosheet_en_web.pdf",
        "https://www.noctua.at/en/support/faqs/what-is-the-ram-clearance-of-my-noctua-cpu-cooler"
      ]
    },
    {
      "id": "nh-u9s",
      "name": "Noctua NH-U9S",
      "short": "NH-U9S",
      "brand": "Noctua",
      "manufacturer": "Noctua",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700"
      ],
      "height": 125,
      "ramClearance": 99,
      "ramUnrestricted": true,
      "efficiency": 0.95,
      "thermalAssumed": true,
      "maxRpm": 2000,
      "towers": 1,
      "fans": 1,
      "heatpipes": 5,
      "fanSizeMm": 92,
      "dimensions": [
        93.5,
        95,
        125
      ],
      "detail": "1 башн. · 125 мм · 1 вент. · 5 теплотрубок",
      "notes": "efficiency 0.95 — условный коэффициент учебной тепловой модели, не измерение и не паспортный TDP. 99 — технический маркер: радиатор не перекрывает RAM на перечисленных платформах. Для старой упаковки проверь наличие креплений AM4/AM5 и LGA1700.  Глубина 93,5 мм взята с актуальной страницы спецификаций; старый PDF приводит 97 мм.",
      "sources": [
        "https://www.noctua.at/en/products/nh-u9s/specifications",
        "https://cdn.noctua.at/media/noctua_nh_u9s_infosheet_en_web.pdf",
        "https://www.noctua.at/en/support/faqs/what-is-the-ram-clearance-of-my-noctua-cpu-cooler"
      ]
    },
    {
      "id": "nh-d15-g2",
      "name": "Noctua NH-D15 G2",
      "short": "NH-D15 G2",
      "brand": "Noctua",
      "manufacturer": "Noctua",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700"
      ],
      "height": 168,
      "ramClearance": 32,
      "ramUnrestricted": false,
      "efficiency": 1.7,
      "thermalAssumed": true,
      "maxRpm": 1500,
      "towers": 2,
      "fans": 2,
      "heatpipes": 8,
      "fanSizeMm": 140,
      "dimensions": [
        152,
        150,
        168
      ],
      "detail": "2 башн. · 168 мм · 2 вент. · 8 теплотрубок",
      "notes": "efficiency 1.7 — условный коэффициент учебной тепловой модели, не измерение и не паспортный TDP. Штатный зазор над RAM — 32 мм. Для старой упаковки проверь наличие креплений AM4/AM5 и LGA1700. Передний вентилятор можно поднять над высокой памятью; высота кулера увеличится на ту же величину. Стандартная версия G2, не HBC/LBC.",
      "sources": [
        "https://cdn.noctua.at/media/noctua_nh_d15_g2_infosheet_en_web.pdf",
        "https://www.noctua.at/en/support/faqs/what-is-the-ram-clearance-of-my-noctua-cpu-cooler"
      ],
      "adjustableFrontFan": true
    },
    {
      "id": "nh-u12s",
      "name": "Noctua NH-U12S",
      "short": "NH-U12S",
      "brand": "Noctua",
      "manufacturer": "Noctua",
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700"
      ],
      "height": 158,
      "ramClearance": 99,
      "ramUnrestricted": true,
      "efficiency": 1.15,
      "thermalAssumed": true,
      "maxRpm": 1500,
      "towers": 1,
      "fans": 1,
      "heatpipes": 5,
      "fanSizeMm": 120,
      "dimensions": [
        71,
        125,
        158
      ],
      "detail": "1 башн. · 158 мм · 1 вент. · 5 теплотрубок",
      "notes": "efficiency 1.15 — условный коэффициент учебной тепловой модели, не измерение и не паспортный TDP. 99 — технический маркер: радиатор не перекрывает RAM на перечисленных платформах. Для старой упаковки проверь наличие креплений AM4/AM5 и LGA1700. ",
      "sources": [
        "https://www.noctua.at/en/products/nh-u12s/specifications",
        "https://www.noctua.at/en/support/faqs/what-is-the-ram-clearance-of-my-noctua-cpu-cooler"
      ]
    }
  ],
  "psu": [
    {
      "id": "pk550",
      "name": "DeepCool PK550D",
      "short": "PK550D · 550 Вт",
      "watts": 550,
      "connectors": 2,
      "form": "ATX",
      "length": 140,
      "detail": "550 Вт · 80 PLUS Bronze · ATX",
      "sources": [
        "https://www.deepcool.com/products/PowerSupplyUnits/powersupplyunits/PK550D-80-PLUS-Bronze-Power-Supply/2022/15621.shtml",
        "https://www.dns-shop.ru/product/characteristics/7cbe7b3e83c12334/blok-pitania-deepcool-pk550d-r-pk550d-fa0b-eu-cernyj/"
      ],
      "dimensions": [
        140,
        150,
        86
      ],
      "epsConnectors": 2,
      "modular": false,
      "certification": "80 PLUS Bronze",
      "connector16pin": false
    },
    {
      "id": "a850",
      "name": "MSI MAG A850GL PCIE5",
      "short": "A850GL · 850 Вт",
      "watts": 850,
      "connectors": 4,
      "form": "ATX",
      "length": 140,
      "detail": "850 Вт · 80 PLUS Gold · модульный",
      "sources": [
        "https://us.msi.com/Power-Supply/MAG-A850GL-PCIE5/Specification"
      ],
      "dimensions": [
        140,
        150,
        86
      ],
      "epsConnectors": 2,
      "modular": true,
      "certification": "80 PLUS Gold",
      "connector16pin": true
    },
    {
      "id": "a650bn",
      "name": "MSI MAG A650BN",
      "short": "A650BN · 650 Вт",
      "brand": "MSI",
      "manufacturer": "MSI",
      "watts": 650,
      "connectors": 2,
      "connector16pin": false,
      "epsConnectors": 1,
      "sataConnectors": 5,
      "form": "ATX",
      "length": 140,
      "modular": false,
      "efficiency": "80 PLUS Bronze",
      "detail": "650 Вт · 80 PLUS Bronze · 2× PCIe 6+2-pin",
      "notes": "connectors — количество разъёмов PCIe 6+2-pin, не число отдельных кабелей. EPS 4+4-pin предназначен для процессора.",
      "sources": [
        "https://www.msi.com/Power-Supply/MAG-A650BN/Specification"
      ]
    },
    {
      "id": "a750gl",
      "name": "MSI MAG A750GL PCIE5",
      "short": "A750GL · 750 Вт",
      "brand": "MSI",
      "manufacturer": "MSI",
      "watts": 750,
      "connectors": 3,
      "connector16pin": true,
      "connector16pinWatts": 450,
      "epsConnectors": 2,
      "sataConnectors": 8,
      "form": "ATX",
      "length": 140,
      "modular": true,
      "efficiency": "80 PLUS Gold",
      "detail": "750 Вт · 80 PLUS Gold · модульный · 16-pin 450 Вт",
      "notes": "3 разъёма PCIe 6+2-pin и один штатный 16-pin с паспортной мощностью 450 Вт. Число разъёмов не равно числу отдельных кабелей.",
      "sources": [
        "https://www.msi.com/Power-Supply/MAG-A750GL-PCIE5/Specification"
      ]
    },
    {
      "id": "a1000g",
      "name": "MSI MPG A1000G PCIE5",
      "short": "A1000G · 1000 Вт",
      "brand": "MSI",
      "manufacturer": "MSI",
      "watts": 1000,
      "connectors": 6,
      "connector16pin": true,
      "connector16pinWatts": 600,
      "epsConnectors": 2,
      "sataConnectors": 12,
      "form": "ATX",
      "length": 150,
      "modular": true,
      "efficiency": "80 PLUS Gold",
      "detail": "1000 Вт · 80 PLUS Gold · модульный · 16-pin 600 Вт",
      "notes": "6 разъёмов PCIe 6+2-pin и один штатный 16-pin 600 Вт. Число разъёмов не равно числу отдельных кабелей.",
      "sources": [
        "https://www.msi.com/Power-Supply/MPG-A1000G-PCIE5/Specification"
      ]
    },
    {
      "id": "a550bn",
      "name": "MSI MAG A550BN",
      "short": "MAG A550BN · 550 Вт",
      "brand": "MSI",
      "manufacturer": "MSI",
      "watts": 550,
      "connectors": 2,
      "connector16pin": false,
      "epsConnectors": 1,
      "sataConnectors": 5,
      "form": "ATX",
      "length": 140,
      "dimensions": [
        140,
        150,
        86
      ],
      "modular": false,
      "certification": "80 PLUS Bronze",
      "detail": "550 Вт · 80 PLUS Bronze · фиксированные кабели",
      "notes": "connectors — количество штекеров PCIe 6+2 pin в комплекте, а не кабелей. EPS — отдельные разъёмы питания CPU. Кабели разных блоков питания не взаимозаменяемы.",
      "sources": [
        "https://storage-asset.msi.com/datasheet/power-supply/global/MAG-A550BN.pdf"
      ]
    },
    {
      "id": "a650gl",
      "name": "MSI MAG A650GL",
      "short": "MAG A650GL · 650 Вт",
      "brand": "MSI",
      "manufacturer": "MSI",
      "watts": 650,
      "connectors": 4,
      "connector16pin": false,
      "epsConnectors": 2,
      "sataConnectors": 6,
      "form": "ATX",
      "length": 140,
      "dimensions": [
        140,
        150,
        86
      ],
      "modular": true,
      "certification": "80 PLUS Gold",
      "detail": "650 Вт · 80 PLUS Gold · модульный",
      "notes": "connectors — количество штекеров PCIe 6+2 pin в комплекте, а не кабелей. EPS — отдельные разъёмы питания CPU. Кабели разных блоков питания не взаимозаменяемы.",
      "sources": [
        "https://storage-asset.msi.com/datasheet/power-supply/global/MAG-A650GL.pdf"
      ]
    },
    {
      "id": "a1000gl",
      "name": "MSI MAG A1000GL PCIE5",
      "short": "MAG A1000GL PCIE5 · 1000 Вт",
      "brand": "MSI",
      "manufacturer": "MSI",
      "watts": 1000,
      "connectors": 4,
      "connector16pin": true,
      "epsConnectors": 2,
      "sataConnectors": 12,
      "form": "ATX",
      "length": 150,
      "dimensions": [
        150,
        150,
        86
      ],
      "modular": true,
      "certification": "80 PLUS Gold",
      "detail": "1000 Вт · 80 PLUS Gold · модульный",
      "notes": "connectors — количество штекеров PCIe 6+2 pin в комплекте, а не кабелей. EPS — отдельные разъёмы питания CPU. Кабели разных блоков питания не взаимозаменяемы.",
      "sources": [
        "https://storage-asset.msi.com/datasheet/power-supply/global/MAG-A1000GL-PCIE5.pdf"
      ],
      "connector16pinWatts": 600
    },
    {
      "id": "a1250gl",
      "name": "MSI MAG A1250GL PCIE5",
      "short": "MAG A1250GL PCIE5 · 1250 Вт",
      "brand": "MSI",
      "manufacturer": "MSI",
      "watts": 1250,
      "connectors": 4,
      "connector16pin": true,
      "epsConnectors": 2,
      "sataConnectors": 12,
      "form": "ATX",
      "length": 150,
      "dimensions": [
        150,
        150,
        86
      ],
      "modular": true,
      "certification": "80 PLUS Gold",
      "detail": "1250 Вт · 80 PLUS Gold · модульный",
      "notes": "connectors — количество штекеров PCIe 6+2 pin в комплекте, а не кабелей. EPS — отдельные разъёмы питания CPU. Кабели разных блоков питания не взаимозаменяемы.",
      "sources": [
        "https://storage-asset.msi.com/datasheet/power-supply/global/MAG-A1250GL-PCIE5.pdf"
      ],
      "connector16pinWatts": 600
    },
    {
      "id": "a750g",
      "name": "MSI MPG A750G PCIE5",
      "short": "MPG A750G PCIE5 · 750 Вт",
      "brand": "MSI",
      "manufacturer": "MSI",
      "watts": 750,
      "connectors": 6,
      "connector16pin": true,
      "epsConnectors": 2,
      "sataConnectors": 8,
      "form": "ATX",
      "length": 150,
      "dimensions": [
        150,
        150,
        86
      ],
      "modular": true,
      "certification": "80 PLUS Gold",
      "detail": "750 Вт · 80 PLUS Gold · модульный",
      "notes": "connectors — количество штекеров PCIe 6+2 pin в комплекте, а не кабелей. EPS — отдельные разъёмы питания CPU. Кабели разных блоков питания не взаимозаменяемы.",
      "sources": [
        "https://storage-asset.msi.com/datasheet/power-supply/global/MPG-A750G-PCIE5.pdf"
      ],
      "connector16pinWatts": 450
    },
    {
      "id": "a850g",
      "name": "MSI MPG A850G PCIE5",
      "short": "MPG A850G PCIE5 · 850 Вт",
      "brand": "MSI",
      "manufacturer": "MSI",
      "watts": 850,
      "connectors": 6,
      "connector16pin": true,
      "epsConnectors": 2,
      "sataConnectors": 8,
      "form": "ATX",
      "length": 150,
      "dimensions": [
        150,
        150,
        86
      ],
      "modular": true,
      "certification": "80 PLUS Gold",
      "detail": "850 Вт · 80 PLUS Gold · модульный",
      "notes": "connectors — количество штекеров PCIe 6+2 pin в комплекте, а не кабелей. EPS — отдельные разъёмы питания CPU. Кабели разных блоков питания не взаимозаменяемы.",
      "sources": [
        "https://storage-asset.msi.com/datasheet/power-supply/global/MPG-A850G-PCIE5.pdf"
      ],
      "connector16pinWatts": 600
    },
    {
      "id": "ai1300p",
      "name": "MSI MEG Ai1300P PCIE5",
      "short": "MEG Ai1300P PCIE5 · 1300 Вт",
      "brand": "MSI",
      "manufacturer": "MSI",
      "watts": 1300,
      "connectors": 8,
      "connector16pin": true,
      "epsConnectors": 2,
      "sataConnectors": 16,
      "form": "ATX",
      "length": 160,
      "dimensions": [
        160,
        150,
        86
      ],
      "modular": true,
      "certification": "80 PLUS Platinum",
      "detail": "1300 Вт · 80 PLUS Platinum · модульный",
      "notes": "connectors — количество штекеров PCIe 6+2 pin в комплекте, а не кабелей. EPS — отдельные разъёмы питания CPU. Кабели разных блоков питания не взаимозаменяемы. CPU: один EPS 8 pin и один EPS 4+4 pin.",
      "sources": [
        "https://storage-asset.msi.com/datasheet/power-supply/global/MEG-Ai1300P-PCIE5.pdf"
      ],
      "connector16pinWatts": 600
    },
    {
      "id": "pk650d",
      "name": "DeepCool PK650D",
      "short": "PK650D · 650 Вт",
      "brand": "DeepCool",
      "manufacturer": "DeepCool",
      "watts": 650,
      "connectors": 4,
      "connector16pin": false,
      "epsConnectors": 2,
      "sataConnectors": 7,
      "form": "ATX",
      "length": 140,
      "dimensions": [
        140,
        150,
        86
      ],
      "modular": false,
      "certification": "80 PLUS Bronze",
      "detail": "650 Вт · 80 PLUS Bronze · фиксированные кабели",
      "notes": "connectors — количество штекеров PCIe 6+2 pin в комплекте, а не кабелей. EPS — отдельные разъёмы питания CPU. Кабели разных блоков питания не взаимозаменяемы.",
      "sources": [
        "https://www.deepcool.com/products/PowerSupplyUnits/powersupplyunits/PK650D-80-PLUS-Bronze-Power-Supply/2022/15619.shtml"
      ],
      "sku": "R-PK650D-FA0B-EU"
    },
    {
      "id": "pq650m",
      "name": "DeepCool PQ650M",
      "short": "PQ650M · 650 Вт",
      "brand": "DeepCool",
      "manufacturer": "DeepCool",
      "watts": 650,
      "connectors": 3,
      "connector16pin": false,
      "epsConnectors": 2,
      "sataConnectors": 8,
      "form": "ATX",
      "length": 140,
      "dimensions": [
        140,
        150,
        86
      ],
      "modular": true,
      "certification": "80 PLUS Gold",
      "detail": "650 Вт · 80 PLUS Gold · модульный",
      "notes": "connectors — количество штекеров PCIe 6+2 pin в комплекте, а не кабелей. EPS — отдельные разъёмы питания CPU. Кабели разных блоков питания не взаимозаменяемы. Комплект с тремя отдельными PCIe 6+2 pin по официальной странице; у последующих ревизий набор кабелей может отличаться.",
      "sources": [
        "https://www.deepcool.com/products/PowerSupplyUnits/powersupplyunits/PQ650M-80-PLUS-Gold-Modular-Power-Supply/2021/14012.shtml"
      ],
      "sku": "R-PQ650M-FA0B-EU"
    },
    {
      "id": "pq750m",
      "name": "DeepCool PQ750M",
      "short": "PQ750M · 750 Вт",
      "brand": "DeepCool",
      "manufacturer": "DeepCool",
      "watts": 750,
      "connectors": 3,
      "connector16pin": false,
      "epsConnectors": 2,
      "sataConnectors": 8,
      "form": "ATX",
      "length": 140,
      "dimensions": [
        140,
        150,
        86
      ],
      "modular": true,
      "certification": "80 PLUS Gold",
      "detail": "750 Вт · 80 PLUS Gold · модульный",
      "notes": "connectors — количество штекеров PCIe 6+2 pin в комплекте, а не кабелей. EPS — отдельные разъёмы питания CPU. Кабели разных блоков питания не взаимозаменяемы. Комплект с тремя отдельными PCIe 6+2 pin по официальной странице; у последующих ревизий набор кабелей может отличаться.",
      "sources": [
        "https://es.deepcool.com/products/PowerSupplyUnits/powersupplyunits/PQ750M-80-PLUS-Gold-Modular-Power-Supply/2021/14059.shtml"
      ],
      "sku": "R-PQ750M-FA0B-EU"
    },
    {
      "id": "pq850m",
      "name": "DeepCool PQ850M",
      "short": "PQ850M · 850 Вт",
      "brand": "DeepCool",
      "manufacturer": "DeepCool",
      "watts": 850,
      "connectors": 3,
      "connector16pin": false,
      "epsConnectors": 2,
      "sataConnectors": 10,
      "form": "ATX",
      "length": 140,
      "dimensions": [
        140,
        150,
        86
      ],
      "modular": true,
      "certification": "80 PLUS Gold",
      "detail": "850 Вт · 80 PLUS Gold · модульный",
      "notes": "connectors — количество штекеров PCIe 6+2 pin в комплекте, а не кабелей. EPS — отдельные разъёмы питания CPU. Кабели разных блоков питания не взаимозаменяемы. Комплект с тремя отдельными PCIe 6+2 pin по официальной странице; у последующих ревизий набор кабелей может отличаться.",
      "sources": [
        "https://deepcool.com/products/PowerSupplyUnits/powersupplyunits/PQ850M-80-PLUS-Gold-Modular-Power-Supply/2021/14032.shtml"
      ],
      "sku": "R-PQ850M-FA0B-EU"
    }
  ],
  "case": [
    {
      "id": "cc560",
      "name": "DeepCool CC560 V2",
      "short": "CC560 V2",
      "forms": [
        "ATX",
        "Micro-ATX",
        "Mini-ITX"
      ],
      "gpuLimit": 320,
      "coolerLimit": 165,
      "psuLimit": 170,
      "detail": "Mid-Tower · ATX · 3 вентилятора на вдув + 1 на выдув",
      "sources": [
        "https://www.deepcool.com/products/Cases/fulltowercases/CC560-V2-Mid-Tower-Airflow-Case/2023/17782.shtml",
        "https://de.deepcool.com/products/Cases/CC560-V2-Mid-Tower-Airflow-Case/2023/17809.shtml"
      ],
      "dimensions": [
        432,
        215,
        483
      ],
      "frontFanCount": 3,
      "rearFanCount": 1,
      "brand": "DeepCool",
      "usbA": 1,
      "usb2": 1,
      "usbC": 0,
      "audio": "1 × комбинированный 3,5 мм"
    },
    {
      "id": "4000d-airflow",
      "name": "Corsair 4000D AIRFLOW Black",
      "short": "4000D AIRFLOW",
      "brand": "Corsair",
      "manufacturer": "Corsair",
      "sku": "CC-9011200-WW",
      "forms": [
        "ATX",
        "Micro-ATX",
        "Mini-ITX",
        "E-ATX"
      ],
      "gpuLimit": 360,
      "coolerLimit": 170,
      "psuLimit": 220,
      "dimensions": {
        "length": 453,
        "width": 230,
        "height": 466
      },
      "frontFanCount": 1,
      "rearFanCount": 1,
      "usbA": 1,
      "usb2": 0,
      "usbC": 1,
      "detail": "Mid-Tower · ATX · 1 вентилятор спереди + 1 сзади · USB-C",
      "notes": "Указана обычная 4000D AIRFLOW, не RGB и не FRAME 4000D. Штатно два вентилятора 120 мм: один спереди, один сзади. E-ATX ограничен 305×277 мм. Предел 360 мм для GPU приведён без переднего радиатора; кабелям БП нужно дополнительное место.",
      "sources": [
        "https://www.corsair.com/ww/en/p/pc-cases/cc-9011200-ww/40",
        "https://assets.corsair.com/image/upload/v1684779868/corsairmedia/sys_master/productcontent/WW_4000D_4000D_Airflow_QSG_AB.pdf"
      ],
      "audio": "1 × комбинированный аудиоразъём 3,5 мм: наушники + микрофон"
    },
    {
      "id": "pop-air",
      "name": "Fractal Design Pop Air Black TG Clear Tint",
      "short": "Pop Air Black TG",
      "brand": "Fractal Design",
      "manufacturer": "Fractal Design",
      "sku": "FD-C-POA1A-02",
      "forms": [
        "ATX",
        "Micro-ATX",
        "Mini-ITX"
      ],
      "gpuLimit": 405,
      "coolerLimit": 170,
      "psuLimit": 170,
      "dimensions": {
        "length": 473.5,
        "width": 215,
        "height": 454
      },
      "frontFanCount": 2,
      "rearFanCount": 1,
      "usbA": 2,
      "usb2": 0,
      "usbC": 0,
      "detail": "Mid-Tower · ATX · 2 вентилятора спереди + 1 сзади",
      "notes": "Штатно 2× Aspect 12 спереди и 1× Aspect 12 сзади. USB-C — отдельный опциональный комплект, поэтому в базовом корпусе его нет. GPU до 405 мм с установленным передним вентилятором. Размеры производителя 473,5×215×454 мм; руководство округляет длину до 474 мм.",
      "sources": [
        "https://www.fractal-design.com/products/cases/pop-series/pop-air/pop-air-black-tg-clear-tint/",
        "https://www.fractal-design.com/app/uploads/2022/06/Pop-Air-RGB-Pop-Air_Product-Sheet_EN.pdf"
      ],
      "audio": "2 × раздельных разъёма 3,5 мм: 1 выход для наушников + 1 вход микрофона"
    },
    {
      "id": "pop-air-white",
      "name": "Fractal Design Pop Air White TG Clear Tint",
      "short": "Pop Air White TG",
      "brand": "Fractal Design",
      "manufacturer": "Fractal Design",
      "sku": "FD-C-POA1A-03",
      "forms": [
        "ATX",
        "Micro-ATX",
        "Mini-ITX"
      ],
      "gpuLimit": 405,
      "coolerLimit": 170,
      "psuLimit": 170,
      "dimensions": {
        "length": 473.5,
        "width": 215,
        "height": 454
      },
      "frontFanCount": 2,
      "rearFanCount": 1,
      "fanSizeMm": 120,
      "frontFanSizeMm": 120,
      "rearFanSizeMm": 120,
      "color": "white",
      "frontStyle": "pop",
      "frontRGB": false,
      "usbA": 2,
      "usb2": 0,
      "usbC": 0,
      "audio": "2 × раздельных разъёма 3,5 мм: наушники и микрофон",
      "detail": "Mid-Tower · белый · ATX · 2×120 мм спереди + 1×120 мм сзади",
      "notes": "Точное белое исполнение FD-C-POA1A-03 без RGB. Штатные вентиляторы Aspect 12. USB-C доступен отдельным комплектом и не входит в базовую комплектацию. GPU до 405 мм с установленным передним вентилятором; передний радиатор уменьшает доступную длину. Верхний радиатор до 240 мм требует RAM не выше 46 мм.",
      "sources": [
        "https://www.fractal-design.com/app/uploads/2022/06/Pop-Air-RGB-Pop-Air_Product-Sheet_EN.pdf",
        "https://support.fractal-design.com/support/solutions/articles/4000191452--missing-top-radiator-extension-brackets-pop-air-pop-mini-air-focus-2"
      ]
    },
    {
      "id": "h7-flow",
      "name": "NZXT H7 Flow (2022) Black",
      "short": "H7 Flow 2022",
      "brand": "NZXT",
      "manufacturer": "NZXT",
      "sku": "CM-H71FB-01",
      "forms": [
        "ATX",
        "Micro-ATX",
        "Mini-ITX",
        "E-ATX"
      ],
      "gpuLimit": 400,
      "coolerLimit": 185,
      "psuLimit": null,
      "psuLimitUnknown": true,
      "dimensions": {
        "length": 480,
        "width": 230,
        "height": 505
      },
      "frontFanCount": 1,
      "rearFanCount": 1,
      "fanSizeMm": 120,
      "frontFanSizeMm": 120,
      "rearFanSizeMm": 120,
      "color": "black",
      "frontStyle": "mesh",
      "frontRGB": false,
      "usbA": 2,
      "usb2": 0,
      "usbC": 1,
      "audio": "1 × комбинированный аудиоразъём 3,5 мм: наушники + микрофон",
      "detail": "Mid-Tower · версия 2022 · E-ATX до 272 мм · 1×120 мм спереди + 1×120 мм сзади",
      "notes": "Именно H7 Flow 2022 CM-H71FB-01 с нижним горизонтальным БП, не H7 Flow 2024/2025 CM-H72FB-01. Штатно два F120Q Quiet 120 мм без RGB; чёрное исполнение имеет тонированное стекло. E-ATX ограничен шириной 272 мм. psuLimit не указан в официальной таблице и руководстве, поэтому null: не считать это безусловной совместимостью любого БП. Высота 505 мм включает ножки. USB-C указан без скорости из-за расхождения старой страницы и руководства.",
      "sources": [
        "https://support.nzxt.com/hc/en-us/articles/47607864027547-H7-Series-2022-2023-Specs",
        "https://support.nzxt.com/hc/en-us/articles/15972028671643-NZXT-H7-2022-Series-FAQ",
        "https://cdn-g.nzxt.com/dl/1653378503-case_h7-flow_digital-manual-ru_pdf_2203.pdf"
      ]
    },
    {
      "id": "ch560-white",
      "name": "DeepCool CH560 WH",
      "short": "CH560 WH",
      "brand": "DeepCool",
      "manufacturer": "DeepCool",
      "sku": "R-CH560-WHAPE4-G-1",
      "forms": [
        "ATX",
        "Micro-ATX",
        "Mini-ITX",
        "E-ATX"
      ],
      "gpuLimit": 380,
      "coolerLimit": 175,
      "psuLimit": 170,
      "dimensions": {
        "length": 458,
        "width": 230,
        "height": 471
      },
      "frontFanCount": 3,
      "rearFanCount": 1,
      "fanSizeMm": 140,
      "frontFanSizeMm": 140,
      "rearFanSizeMm": 120,
      "color": "white",
      "frontStyle": "mesh",
      "frontRGB": true,
      "rearRGB": true,
      "usbA": 1,
      "usb2": 0,
      "usbC": 1,
      "audio": "1 × комбинированный аудиоразъём 3,5 мм: наушники + микрофон",
      "detail": "Mid-Tower · белый · E-ATX · 3×140 мм ARGB спереди + 1×120 мм ARGB сзади",
      "notes": "Точное CH560 WH, не CH560 DIGITAL WH. Штатные передние вентиляторы 140 мм ARGB PWM; задний 120 мм ARGB PWM. Боковая панель сочетает закалённое стекло и перфорацию. Указан один USB-A по таблице Technical Spec; повторный рекламный абзац ошибочно говорит о двух. Для платы E-ATX производитель не указывает предельную ширину.",
      "sources": [
        "https://pl.deepcool.com/products/Cases/CH560-WH-New-Generation-of-Airflow-Case/2023/17124.shtml",
        "https://global.deepcool.com/products/Cases/CH560-New-Generation-of-Airflow-Case/2023/17101.shtml"
      ]
    }
  ]
};
// Author-designed exhibition cases, not retail products.
catalog.case.push(...[
  {
    "id": "pcmaker-panorama",
    "name": "PCmaker Panorama",
    "short": "Panorama",
    "brand": "PCmaker",
    "concept": "panorama",
    "color": "white",
    "forms": [
      "ATX",
      "Micro-ATX",
      "Mini-ITX"
    ],
    "gpuLimit": 420,
    "coolerLimit": 190,
    "psuLimit": 200,
    "frontFanCount": 0,
    "rearFanCount": 0,
    "topFanCount": 3,
    "sideFanCount": 3,
    "fanSizeMm": 120,
    "frontRGB": true,
    "usbA": 1,
    "usb2": 0,
    "usbC": 1,
    "audio": "Комбинированный 3,5 мм",
    "detail": "Панорамные панели · боковой вдув и верхний выдув · учебный корпус",
    "notes": "Авторский учебный корпус PCmaker. Не серийный товар; размеры, крепления и вентиляторы условные. 18 точек на шести стенках; соседние крепления могут конфликтовать.",
    "sources": []
  },
  {
    "id": "pcmaker-dual",
    "name": "PCmaker Duo Chamber",
    "short": "Duo Chamber",
    "brand": "PCmaker",
    "concept": "dual",
    "color": "black",
    "forms": [
      "ATX",
      "Micro-ATX",
      "Mini-ITX"
    ],
    "gpuLimit": 400,
    "coolerLimit": 190,
    "psuLimit": 200,
    "frontFanCount": 3,
    "rearFanCount": 3,
    "fanSizeMm": 120,
    "frontRGB": true,
    "usbA": 1,
    "usb2": 0,
    "usbC": 1,
    "audio": "Комбинированный 3,5 мм",
    "detail": "Широкое шасси · отдельный отсек для кабелей · 3 спереди + 3 сзади · учебный корпус",
    "notes": "Авторский учебный корпус PCmaker. Не серийный товар; размеры, крепления и вентиляторы условные. 18 точек на шести стенках; соседние крепления могут конфликтовать.",
    "sources": []
  },
  {
    "id": "pcmaker-compact",
    "name": "PCmaker Compact Lab",
    "short": "Compact Lab",
    "brand": "PCmaker",
    "concept": "compact",
    "color": "black",
    "forms": [
      "ATX",
      "Micro-ATX",
      "Mini-ITX"
    ],
    "gpuLimit": 350,
    "coolerLimit": 190,
    "psuLimit": 200,
    "frontFanCount": 3,
    "rearFanCount": 0,
    "topFanCount": 3,
    "fanSizeMm": 92,
    "frontRGB": true,
    "usbA": 1,
    "usb2": 0,
    "usbC": 1,
    "audio": "Комбинированный 3,5 мм",
    "detail": "Короткое шасси · компактные вентиляторы · верхняя вентиляция · учебный корпус",
    "notes": "Авторский учебный корпус PCmaker. Не серийный товар; размеры, крепления и вентиляторы условные. 18 точек на шести стенках; соседние крепления могут конфликтовать.",
    "sources": []
  }
]);
const existingBrands=new Map(Object.values(catalog).flat().filter(p=>p.brand).map(p=>[p.brand.toLowerCase(),p.brand]));
for(const [category,parts] of Object.entries(catalogExtra))catalog[category].push(...parts.map(p=>({...p,brand:existingBrands.get(p.brand.toLowerCase())||p.brand})));
export const byId = Object.fromEntries(Object.values(catalog).flat().map(p=>[p.id,p]));
export const emptyBuild = ()=>Object.fromEntries(categories.map(([key])=>[key,key==='case'?'cc560':null]));
export const demoBuild = {cpu:'r5-7600',motherboard:'b650',gpu:'rtx4060',ram:'ddr5-32',storage:'nv2',cooler:'ak400',psu:'a850',case:'cc560'};
export const resolve = build => Object.fromEntries(categories.map(([key])=>[key,catalog[key].find(p=>p.id===build[key])||null]));
export function sanitizeBuild(input) { const result=emptyBuild(); if(!input||typeof input!=='object')return result; for(const [key] of categories) if(catalog[key].some(p=>p.id===input[key]))result[key]=input[key]; return result; }
