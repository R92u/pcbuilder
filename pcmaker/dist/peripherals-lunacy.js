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
