// Entry-level models. Specification evidence: research/verification-budget.json.
export const catalogBudget={
  "cpu": [
    {
      "id": "r3-4100",
      "name": "AMD Ryzen 3 4100 OEM",
      "short": "Ryzen 3 4100",
      "brand": "AMD",
      "sku": "100-000000510",
      "socket": "AM4",
      "memory": "DDR4",
      "cores": 4,
      "threads": 8,
      "tdp": 65,
      "peakPower": 88,
      "powerAssumed": true,
      "tmax": 95,
      "baseGHz": 3.8,
      "boostGHz": 4.0,
      "cacheMB": 4,
      "maxRam": 128,
      "officialMemoryMaxMTs": 3200,
      "pcieGeneration": 3,
      "integratedGraphics": false,
      "detail": "4 ядер / 8 потоков · AM4 · DDR4 · без встроенной графики",
      "notes": "OEM: кулер приобретается отдельно. Нужна дискретная видеокарта. Предел мощности 88 Вт — допущение учебной симуляции; TDP 65 Вт не равен максимальному потреблению.",
      "sources": [
        "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-4000-series/amd-ryzen-3-4100.html"
      ],
      "budgetTier": true
    },
    {
      "id": "r5-4500",
      "name": "AMD Ryzen 5 4500 OEM",
      "short": "Ryzen 5 4500",
      "brand": "AMD",
      "sku": "100-000000644",
      "socket": "AM4",
      "memory": "DDR4",
      "cores": 6,
      "threads": 12,
      "tdp": 65,
      "peakPower": 88,
      "powerAssumed": true,
      "tmax": 95,
      "baseGHz": 3.6,
      "boostGHz": 4.1,
      "cacheMB": 8,
      "maxRam": 128,
      "officialMemoryMaxMTs": 3200,
      "pcieGeneration": 3,
      "integratedGraphics": false,
      "detail": "6 ядер / 12 потоков · AM4 · DDR4 · без встроенной графики",
      "notes": "OEM: кулер приобретается отдельно. Нужна дискретная видеокарта. Предел мощности 88 Вт — допущение учебной симуляции; TDP 65 Вт не равен максимальному потреблению.",
      "sources": [
        "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-4000-series/amd-ryzen-5-4500.html"
      ],
      "budgetTier": true
    }
  ],
  "motherboard": [
    {
      "id": "a520m-a-pro",
      "name": "MSI A520M-A PRO",
      "short": "A520M-A PRO",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "AM4",
      "chipset": "AMD A520",
      "memory": "DDR4",
      "form": "Micro-ATX",
      "slots": 2,
      "maxRam": 64,
      "m2": true,
      "m2Slots": 1,
      "sataPorts": 4,
      "epsConnectors": 1,
      "cpuPowerPinCounts": [
        4
      ],
      "usbCHeader": false,
      "systemFanHeaders": 1,
      "dimensions": [
        236,
        200
      ],
      "ports": [
        {
          "type": "usbA",
          "count": 4,
          "label": "USB 3.2 Gen 1 Type-A",
          "location": "rear"
        },
        {
          "type": "usb2",
          "count": 2,
          "label": "USB 2.0 Type-A",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI",
          "location": "rear"
        },
        {
          "type": "dvi",
          "count": 1,
          "label": "DVI",
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
          "label": "Аудио 3,5 мм",
          "location": "rear"
        },
        {
          "type": "ps2",
          "count": 1,
          "label": "PS/2 клавиатура / мышь",
          "location": "rear"
        }
      ],
      "lan": "1 Гбит/с",
      "wifi": false,
      "detail": "Micro-ATX · AM4 · 2 слота DDR4 · 1× M.2",
      "biosNote": "Перед покупкой сверь процессор и версию BIOS со списком поддержки MSI.",
      "notes": "Видеовыходы платы работают только с процессором со встроенной графикой. Один SYS_FAN: для нескольких корпусных вентиляторов нужен подходящий разветвитель или хаб; проверь допустимый ток.",
      "sources": [
        "https://www.msi.com/Motherboard/A520M-A-PRO/Specification"
      ],
      "budgetTier": true
    },
    {
      "id": "h610m-e-ddr4",
      "name": "MSI PRO H610M-E DDR4",
      "short": "PRO H610M-E DDR4",
      "brand": "MSI",
      "manufacturer": "MSI",
      "socket": "LGA1700",
      "chipset": "Intel H610",
      "memory": "DDR4",
      "form": "Micro-ATX",
      "slots": 2,
      "maxRam": 64,
      "m2": true,
      "m2Slots": 1,
      "sataPorts": 4,
      "epsConnectors": 1,
      "cpuPowerPinCounts": [
        8
      ],
      "usbCHeader": false,
      "systemFanHeaders": 2,
      "dimensions": [
        236,
        200
      ],
      "ports": [
        {
          "type": "usbA",
          "count": 2,
          "label": "USB 3.2 Gen 1 Type-A",
          "location": "rear"
        },
        {
          "type": "usb2",
          "count": 4,
          "label": "USB 2.0 Type-A",
          "location": "rear"
        },
        {
          "type": "hdmi",
          "count": 1,
          "label": "HDMI",
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
          "count": 3,
          "label": "Аудио 3,5 мм",
          "location": "rear"
        },
        {
          "type": "ps2",
          "count": 1,
          "label": "PS/2 клавиатура / мышь",
          "location": "rear"
        }
      ],
      "lan": "1 Гбит/с",
      "wifi": false,
      "detail": "Micro-ATX · LGA1700 · 2 слота DDR4 · 1× M.2",
      "biosNote": "Перед покупкой сверь процессор и версию BIOS со списком поддержки MSI.",
      "notes": "Видеовыходы платы работают только с процессором со встроенной графикой. Разгон памяти выше штатного режима контроллера CPU не поддерживается чипсетом H610.",
      "sources": [
        "https://www.msi.com/Motherboard/PRO-H610M-E-DDR4/Specification"
      ],
      "budgetTier": true
    }
  ],
  "gpu": [
    {
      "id": "gt1030-aero-oc",
      "name": "MSI GeForce GT 1030 AERO ITX 2G OC",
      "short": "GeForce GT 1030",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "vram": 2,
      "vramType": "GDDR5",
      "length": 147,
      "width": 102,
      "thickness": 38,
      "dimensions": [
        147,
        102,
        38
      ],
      "power": 30,
      "tmax": 90,
      "recommendedPsu": 300,
      "connectorType": "none",
      "connectors": 0,
      "fans": 1,
      "boostMHz": 1518,
      "busBits": 64,
      "cudaCores": 384,
      "ports": [
        "1 × HDMI 2.0b",
        "1 × SL-DVI-D"
      ],
      "modelStyle": "compact-budget",
      "detail": "2 ГБ GDDR5 · 147 мм · 30 Вт · без кабеля питания",
      "notes": "Точная модификация GeForce GT 1030 AERO ITX 2G OC. Питание через слот PCIe. Версия GDDR5, не DDR4 и не OCV1. Температурный предел 90 °C в учебной модели условный.",
      "sources": [
        "https://www.msi.com/Graphics-Card/GeForce-GT-1030-AERO-ITX-2G-OC/Specification"
      ],
      "budgetTier": true
    },
    {
      "id": "gtx1650-d6-ventus-xs-oc",
      "name": "MSI GeForce GTX 1650 D6 VENTUS XS OC",
      "short": "GeForce GTX 1650",
      "brand": "NVIDIA",
      "manufacturer": "MSI",
      "vram": 4,
      "vramType": "GDDR6",
      "length": 178,
      "width": 111,
      "thickness": 38,
      "dimensions": [
        178,
        111,
        38
      ],
      "power": 75,
      "tmax": 90,
      "recommendedPsu": 300,
      "connectorType": "none",
      "connectors": 0,
      "fans": 2,
      "boostMHz": 1620,
      "busBits": 128,
      "cudaCores": 896,
      "ports": [
        "1 × DisplayPort 1.4a",
        "1 × HDMI 2.0b",
        "1 × DL-DVI-D"
      ],
      "modelStyle": "compact-budget",
      "detail": "4 ГБ GDDR6 · 178 мм · 75 Вт · без кабеля питания",
      "notes": "Точная модификация GeForce GTX 1650 D6 VENTUS XS OC. Питание через слот PCIe. Версия D6 VENTUS XS OC, не OCV3. Температурный предел 90 °C в учебной модели условный.",
      "sources": [
        "https://www.msi.com/Graphics-Card/GeForce-GTX-1650-D6-VENTUS-XS-OC/Specification"
      ],
      "budgetTier": true
    }
  ],
  "ram": [
    {
      "id": "patriot-8-3200",
      "name": "Patriot Signature Line 8 ГБ DDR4-3200",
      "short": "Signature 8 ГБ DDR4",
      "brand": "PATRIOT",
      "sku": "PSD48G320081",
      "memory": "DDR4",
      "capacity": 8,
      "modules": 1,
      "speed": 3200,
      "cl": 22,
      "latency": "22-22-22-52",
      "voltage": 1.2,
      "profile": "JEDEC",
      "height": 31,
      "dimensions": [
        133,
        31,
        3.2
      ],
      "heatspreader": false,
      "rgb": false,
      "detail": "1 × 8 ГБ · DDR4-3200 · CL22 · без подсветки",
      "notes": "Один модуль, без радиатора. Одноканальная установка; для двухканального режима требуется подходящий второй модуль. Реальная скорость зависит от CPU и платы.",
      "sources": [
        "https://assets.website-files.com/62d47b34a77cc16dd813922c/62d47b35a77cc10ca4139891_PSD48G320081%20Sku%20Sheet_042220%20Copyable.pdf"
      ],
      "budgetTier": true
    },
    {
      "id": "patriot-16-3200",
      "name": "Patriot Signature Line 16 ГБ DDR4-3200",
      "short": "Signature 16 ГБ DDR4",
      "brand": "PATRIOT",
      "sku": "PSD416G320081",
      "memory": "DDR4",
      "capacity": 16,
      "modules": 1,
      "speed": 3200,
      "cl": 22,
      "latency": "22-22-22-52",
      "voltage": 1.2,
      "profile": "JEDEC",
      "height": 31,
      "dimensions": [
        133,
        31,
        3.2
      ],
      "heatspreader": false,
      "rgb": false,
      "detail": "1 × 16 ГБ · DDR4-3200 · CL22 · без подсветки",
      "notes": "Один модуль, без радиатора. Одноканальная установка; для двухканального режима требуется подходящий второй модуль. Реальная скорость зависит от CPU и платы.",
      "sources": [
        "https://www.shoprbc.com/images/products/rbc_icecat/_documents_/795/mmo_85959795_1603791722_521_15484.pdf"
      ],
      "budgetTier": true
    }
  ],
  "storage": [
    {
      "id": "p300-256",
      "name": "Patriot P300 256 ГБ",
      "short": "P300 256 ГБ",
      "brand": "PATRIOT",
      "sku": "P300P256GM28",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "3.0 x4",
      "pcieGeneration": 3,
      "pcieLanes": 4,
      "capacity": 256,
      "power": 3,
      "powerAssumed": true,
      "operatingMaxC": 70,
      "dimensions": [
        80,
        22,
        3.8
      ],
      "detail": "256 ГБ · M.2 2280 · PCIe 3.0 ×4",
      "notes": "Мощность 3 Вт — допущение симуляции. Скорость, ресурс записи и гарантия различаются между редакциями документации P300: перед покупкой сверь конкретную поставку. Эти значения не подменяются характеристиками 2 ТБ или серии P310.",
      "sources": [
        "https://assets-global.website-files.com/62d47b34a77cc14cdd139230/659e48eb94b1373cf9b7a272_Patriot_Product_Sheet_P300.pdf"
      ],
      "budgetTier": true
    },
    {
      "id": "p300-512",
      "name": "Patriot P300 512 ГБ",
      "short": "P300 512 ГБ",
      "brand": "PATRIOT",
      "sku": "P300P512GM28",
      "interface": "M.2 NVMe",
      "form": "M.2 2280",
      "pcie": "3.0 x4",
      "pcieGeneration": 3,
      "pcieLanes": 4,
      "capacity": 512,
      "power": 3,
      "powerAssumed": true,
      "operatingMaxC": 70,
      "dimensions": [
        80,
        22,
        3.8
      ],
      "detail": "512 ГБ · M.2 2280 · PCIe 3.0 ×4",
      "notes": "Мощность 3 Вт — допущение симуляции. Скорость, ресурс записи и гарантия различаются между редакциями документации P300: перед покупкой сверь конкретную поставку. Эти значения не подменяются характеристиками 2 ТБ или серии P310.",
      "sources": [
        "https://assets-global.website-files.com/62d47b34a77cc14cdd139230/659e48eb94b1373cf9b7a272_Patriot_Product_Sheet_P300.pdf"
      ],
      "budgetTier": true
    }
  ],
  "cooler": [
    {
      "id": "ag200",
      "name": "DeepCool AG200",
      "short": "AG200",
      "brand": "DeepCool",
      "sku": "R-AG200-BKNNMN-G",
      "type": "air",
      "height": 133,
      "dimensions": [
        119,
        77,
        133
      ],
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700",
        "LGA1200",
        "LGA1151",
        "LGA1150",
        "LGA1155",
        "LGA1851"
      ],
      "efficiency": 0.95,
      "ramClearanceUnknown": true,
      "towers": 1,
      "heatpipes": 2,
      "fans": 1,
      "fanSizeMm": 92,
      "minRpm": 500,
      "maxRpm": 3050,
      "fanAirflowCFM": 36.75,
      "fanRGB": false,
      "detail": "133 мм · 2 тепловые трубки · PWM 92 мм · AM4/AM5/LGA1700",
      "notes": "Без RGB. Численный зазор с высокой памятью производитель не указал: проверь посадку. Эффективность в симуляции — авторская оценка, не измеренная рассеиваемая мощность.",
      "sources": [
        "https://www.deepcool.com/products/Cooling/cpuaircoolers/AG200-Single-Tower-CPU-Cooler-1851-1700-AM5/2022/16203.shtml"
      ],
      "budgetTier": true
    },
    {
      "id": "ag300",
      "name": "DeepCool AG300",
      "short": "AG300",
      "brand": "DeepCool",
      "sku": "R-AG300-BKNNMN-G",
      "type": "air",
      "height": 129,
      "dimensions": [
        119,
        77,
        129
      ],
      "sockets": [
        "AM4",
        "AM5",
        "LGA1700",
        "LGA1200",
        "LGA1151",
        "LGA1150",
        "LGA1155"
      ],
      "efficiency": 1.0,
      "ramClearanceUnknown": true,
      "towers": 1,
      "heatpipes": 3,
      "fans": 1,
      "fanSizeMm": 92,
      "minRpm": 500,
      "maxRpm": 3050,
      "fanAirflowCFM": 36.75,
      "fanRGB": false,
      "detail": "129 мм · 3 тепловые трубки · PWM 92 мм · AM4/AM5/LGA1700",
      "notes": "Без RGB. Численный зазор с высокой памятью производитель не указал: проверь посадку. Эффективность в симуляции — авторская оценка, не измеренная рассеиваемая мощность.",
      "sources": [
        "https://www.deepcool.com/products/Cooling/cpuaircoolers/AG300-Single-Tower-CPU-Cooler-1700-AM5/2022/16202.shtml"
      ],
      "budgetTier": true
    }
  ],
  "psu": [
    {
      "id": "pf450",
      "name": "DeepCool PF450",
      "short": "PF450 · 450 Вт",
      "brand": "DeepCool",
      "sku": "R-PF450D-HA0B-EU",
      "watts": 450,
      "length": 140,
      "dimensions": [
        150,
        140,
        86
      ],
      "form": "ATX",
      "modular": false,
      "certification": "80 PLUS 230V EU White",
      "connectors": 2,
      "epsConnectors": 1,
      "connector16pin": false,
      "sataConnectors": 6,
      "pcieCableCount": 1,
      "fanSizeMm": 120,
      "detail": "450 Вт · 80 PLUS 230V EU · 140 мм · несъёмные кабели",
      "notes": "Два штекера PCIe 6+2 находятся на одном кабеле. CPU: один EPS 4+4; SATA: 6. Нативного 16 pin нет. Сертификат эффективности не заменяет проверку мощности и подключений.",
      "sources": [
        "https://www.deepcool.com/products/PowerSupplyUnits/powersupplyunits/PF450D-230V-Power-Supply-Unit/2021/15141.shtml"
      ],
      "budgetTier": true
    },
    {
      "id": "pf500",
      "name": "DeepCool PF500",
      "short": "PF500 · 500 Вт",
      "brand": "DeepCool",
      "sku": "R-PF500D-HA0B-EU",
      "watts": 500,
      "length": 140,
      "dimensions": [
        150,
        140,
        86
      ],
      "form": "ATX",
      "modular": false,
      "certification": "80 PLUS 230V EU White",
      "connectors": 2,
      "epsConnectors": 1,
      "connector16pin": false,
      "sataConnectors": 6,
      "pcieCableCount": 1,
      "fanSizeMm": 120,
      "detail": "500 Вт · 80 PLUS 230V EU · 140 мм · несъёмные кабели",
      "notes": "Два штекера PCIe 6+2 находятся на одном кабеле. CPU: один EPS 4+4; SATA: 6. Нативного 16 pin нет. Сертификат эффективности не заменяет проверку мощности и подключений.",
      "sources": [
        "https://www.deepcool.com/products/PowerSupplyUnits/powersupplyunits/PF500D-230V-Power-Supply-Unit/2021/15140.shtml"
      ],
      "budgetTier": true
    }
  ],
  "case": [
    {
      "id": "matrexx40",
      "name": "DeepCool MATREXX 40",
      "short": "MATREXX 40",
      "brand": "DeepCool",
      "sku": "DP-MATX-MATREXX40",
      "color": "black",
      "forms": [
        "Micro-ATX",
        "Mini-ITX"
      ],
      "gpuLimit": 320,
      "coolerLimit": 165,
      "psuLimit": 160,
      "dimensions": [
        400,
        215,
        431
      ],
      "frontStyle": "mesh",
      "frontFanMounts": 3,
      "frontFanCount": 0,
      "rearFanCount": 1,
      "topFanCount": 0,
      "fanSizeMm": 120,
      "frontRGB": false,
      "expansionSlots": 4,
      "usbA": 1,
      "usb2": 1,
      "usbC": 0,
      "audio": "Комбинированный 3,5 мм",
      "detail": "Micro-ATX · 1 задний вентилятор 120 мм · GPU до 320 мм",
      "notes": "Без блока питания. Крепления под вентиляторы не означают наличие вентиляторов в комплекте. 3D — схематический макет, не точный CAD; для покупки используй паспортные размеры.",
      "sources": [
        "https://global.deepcool.com/products/Cases/fulltowercases/2021/11876.shtml"
      ],
      "budgetTier": true
    },
    {
      "id": "matrexx55-mesh",
      "name": "DeepCool MATREXX 55 MESH",
      "short": "MATREXX 55 MESH",
      "brand": "DeepCool",
      "sku": "DP-ATX-MATREXX55-MESH",
      "color": "black",
      "forms": [
        "ATX",
        "Micro-ATX",
        "Mini-ITX"
      ],
      "gpuLimit": 380,
      "coolerLimit": 160,
      "psuLimit": 170,
      "dimensions": [
        460,
        215,
        480
      ],
      "frontStyle": "mesh",
      "frontFanMounts": 3,
      "frontFanCount": 0,
      "rearFanCount": 0,
      "topFanCount": 0,
      "fanSizeMm": 120,
      "frontRGB": false,
      "expansionSlots": 7,
      "usbA": 1,
      "usb2": 2,
      "usbC": 0,
      "audio": "2 × 3,5 мм",
      "detail": "ATX · без вентиляторов в комплекте · GPU до 380 мм",
      "notes": "Без блока питания. Крепления под вентиляторы не означают наличие вентиляторов в комплекте. 3D — схематический макет, не точный CAD; для покупки используй паспортные размеры.",
      "sources": [
        "https://www.deepcool.com/products/Cases/Matrexx-55-Mesh-Mid-Tower-ATX-Case/2021/4655.shtml",
        "https://www.kns.ru/product/korpus-deepcool-matrexx-55-mesh/"
      ],
      "budgetTier": true
    }
  ]
};
