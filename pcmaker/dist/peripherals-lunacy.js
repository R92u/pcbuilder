// Exact editions selected from the manufacturer's store. Dimensions describe
// the device, not the conflicting 398 × 172 × 104 mm packaging-sized listing.
const date='2026-11-16';
const moonlight='https://shop.lunacy.ru/products/mehanicheskaya-igrovaya-klaviatura-dlya-kompytera-lunacy-moonlight-g3ms-onyx-lspck01-white-100016';
const iskra='https://shop.lunacy.ru/products/mehanicheskaya-igrovaya-klaviatura-dlya-kompytera-lunacy-x-honkai-star-rail-iskra-g3ms-aquamarine-chernaya-lhmnlght85kbb-101017';
const common={category:'keyboard',brand:'Lunacy',format:'TKL',keys:85,wired:true,connectionModes:['usb'],rgb:true,lowProfile:false,knob:false,keyboardFamily:'lunacy-moonlight',shineThrough:false,verifiedAt:date,photoCredit:'Lunacy',legendLanguage:'ru-en'};
const offer=(price,url,availability)=>({ru:{price,currency:'RUB',date,store:'Lunacy · официальный магазин',kind:'store',availability,url}});
const commonSpecs={
 'Формат':'TKL, ANSI; без цифрового блока',
 'Клавиши':'85 клавиш и отдельный регулятор громкости',
 'Подключение':'Проводное USB; беспроводного режима нет',
 'Механизм':'Механический',
 'Замена переключателей':'Hot Swap, без пайки',
 'Кабель':'Съёмный, USB Type-C, 1,8 м, оплётка',
 'Подсветка':'RGB; в 3D рисунки остаются непрозрачными',
 'Корпус':'Пластик',
 'Регулятор':'Модульный роллер громкости сверху справа',
 'Совместимость':'Windows, macOS, Linux',
 'Гарантия':'12 месяцев',
 'Проверено':date,
};
export const lunacyKeyboards=[
 {...common,id:'lunacy-moonlight-white',name:'Lunacy Moonlight G3MS Onyx — белая',sku:'LSPCK01',color:'Белый / графитовый',colors:['white'],dimensions:[368,145,42],printStyle:'moonlight',appearance:{body:'#dedfdf',keys:'#e9e9e7',modifiers:'#e9e9e7',deck:'#36383a'},description:'TKL · 85 клавиш · G3MS Onyx · USB · RGB',source:moonlight,offers:offer(9990,moonlight,'out-of-stock'),
  specs:{...commonSpecs,'Переключатели':'G3MS Onyx V1, линейные; заводская смазка','Кейкапы':'PBT, двойное литьё; профиль CSA','Конструкция':'Spring Mount, поликарбонатный плейт','Шумоизоляция':'Два слоя силикона','Стабилизаторы':'PCB-mount, смазанные','USB-хаб':'Есть дополнительный USB-порт','Масса':'850 г','Габариты устройства':'368 × 145 × 42 мм (ширина × глубина × высота), по карточке М.Видео','Источник габаритов':'https://www.mvideo.ru/products/50176818/specification','Примечание к размерам':'В магазине бренда указаны 398 × 172 × 104 мм, близкие к упаковке; для 3D использованы размеры устройства М.Видео','Дизайн':'Белые клавиши, синие акценты и рисунок Moonlight на пробеле','Комплект':'Кабель, пуллер, четыре запасных свитча, дополнительные Esc/Space/Fn, пылезащитная крышка, документация'}},
 {...common,id:'lunacy-moonlight-iskra',name:'Lunacy Moonlight × Honkai: Star Rail «Искра»',sku:'LHMNLGHT85KBB',color:'Чёрный / красный / белый',colors:['black'],dimensions:[369,143,45],printStyle:'iskra',appearance:{body:'#b9202a',keys:'#141619',modifiers:'#bd2630',deck:'#17191c'},description:'TKL · 85 клавиш · G3MS Aquamarine · USB · RGB',source:iskra,offers:offer(11990,iskra,'in-stock'),
  specs:{...commonSpecs,'Переключатели':'G3MS Aquamarine, линейные','Издание':'Лимитированная коллаборация Lunacy × Honkai: Star Rail','Дизайн':'Искра: рисунки на клавишах, красная рамка, ромбический узор корпуса','Стабилизаторы':'С заводской смазкой','Габариты устройства':'369 × 143 × 45 мм (ширина × глубина × высота), по карточке производителя на Яндекс Маркете','Масса':'950 г по карточке Яндекс Маркета; не переносится значение 850 г базовой Moonlight','Источник габаритов':'https://market.yandex.ru/card/mekhanicheskaya-igrovaya-klaviatura-dlya-kompyutera-lunacy-x-honkai-star-rail-iskra-g3ms-aquamarine-chernaya-lhmnlght85kbb/6184297926','Источник особенностей':'https://www.lunacy.ru/lunacy-moonlight-iskra-keyboard','Комплект':'Кабель, пуллер, 32 дополнительных кейкапа, четыре свитча, акриловый стенд, стикеры, документация, карточка с кодом','Комплектация издания':'Состав указан по выбранной карточке официального магазина; промоматериалы описывают разные наборы стендов'}},
];
// Lunacy One collaboration edition; manufacturer specs and dated store observation.
const iskraMouse='https://shop.lunacy.ru/products/mysh-besprovodnaya-lunacy-x-honkai-star-rail-limitirovannoe-izdanie-iskra-101016';
export const lunacyMice=[{
 id:'lunacy-one-hsr-iskra',category:'mouse',brand:'Lunacy',name:'Lunacy x Honkai: Star Rail «Искра»',sku:'LMOHSR',
 color:'Красный / белый / чёрный',colors:['red','white','black'],dimensions:[62.4,118.7,39.4],
 wired:false,connectionModes:['usb','receiver'],rgb:false,dpiButtons:0,sideButtons:2,printStyle:'hsr-iskra',
 photoCredit:'Lunacy · официальный магазин',
 verifiedAt:date,description:'Lunacy One · Искра · PAW3395 · 26 000 DPI · 1000 Гц · 57 г',source:iskraMouse,
 offers:offer(8490,iskraMouse,'unknown'),
 specs:{'Издание':'Лимитированная коллаборация Lunacy x Honkai: Star Rail, персонаж Искра',
 'Сенсор':'PixArt PAW3395','Разрешение':'До 26 000 DPI','Частота опроса':'125–1000 Гц','Скорость':'До 650 IPS','Ускорение':'До 50 g',
 'Подключение':'Радиоканал 2,4 ГГц через USB-ресивер; проводное USB-C. Bluetooth не заявлен',
 'Масса':'57 г','Кнопки':'5: левая, правая, нажатие колеса и две боковые',
 'Переключатели':'Huano Transparent Blue Shell Pink Dot; основные поддерживают Hot Swap',
 'Аккумулятор':'300 мА·ч, Li-ion','Автономность':'40 ч при 1000 Гц; до 100 ч при 125 Гц, радио 2,4 ГГц',
 'Кабель':'Съёмный USB-A — USB-C, паракорд, 1,8 м','Подсветка':'Нет RGB; индикатор состояния',
 'Габариты устройства':'62,4 × 118,7 × 39,4 мм (Ш × Г × В)',
 'Источник габаритов':'https://market.yandex.ru/card/mysh-besprovodnaya-lunacy-x-honkai-star-rail-limitirovannoye-izdaniye-iskra/6184113395',
 'Источник характеристик':'https://hsr.lunacy.ru/mishka-lunacy',
 'Дизайн 3D':'Упрощённая модель по фотографиям: красный корпус, ромбы, контрастные кнопки и маска кролика; мелкая маркировка условная',
 'Гарантия':'1 год','Проверено':date}
}];
