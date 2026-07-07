/*
 * Ryzlink — data hotelu (obsah + znalostní báze ČESKY). Vygenerováno automaticky.
 * UMD: prohlížeč (window.RYZLINK_DATA) + Node (module.exports).
 */
(function (root, factory) {
  var data = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  if (typeof window !== 'undefined') window.RYZLINK_DATA = data;
})(this, function () {
  'use strict';
  return {
  "rooms": [
    {
      "id": "classic",
      "name": "Pokoje Classic",
      "short": "Dvoulůžkové pokoje",
      "desc": "Krásné dvoulůžkové pokoje s moderním nábytkem v pastelových tónech připomínajících barvy vína a květů typických pro Mikulovsko. Některé pokoje lze rozšířit o přistýlku.",
      "capacity": 2,
      "size": 22,
      "price": 2490,
      "features": [
        "Manželská postel",
        "Klimatizace",
        "Wi-Fi",
        "Snídaně v ceně"
      ],
      "img": "assets/gallery/pokoje-01.jpg",
      "gallery": [
        "assets/gallery/pokoje-01.jpg",
        "assets/gallery/pokoje-02.jpg",
        "assets/gallery/pokoje-03.jpg"
      ]
    },
    {
      "id": "exclusive",
      "name": "Apartmány Exclusive",
      "short": "Dvoupokojové apartmány",
      "desc": "Prostorné dvoupokojové apartmány s masivním dřevěným nábytkem ze starých trámů, vyrobeným ručně na zakázku uměleckým řezbářem. Apartmán nabízí pohodlné ubytování až pro čtyři osoby.",
      "capacity": 4,
      "size": 42,
      "price": 3690,
      "features": [
        "2 pokoje",
        "Nábytek ruční výroby",
        "Rozkládací pohovka",
        "Snídaně v ceně"
      ],
      "img": "assets/gallery/pokoje-04.jpg",
      "gallery": [
        "assets/gallery/pokoje-04.jpg",
        "assets/gallery/pokoje-05.jpg",
        "assets/gallery/pokoje-06.jpg"
      ]
    },
    {
      "id": "diamond",
      "name": "Pokoje Diamond",
      "short": "Podkrovní pokoje",
      "desc": "Nádherné podkrovní pokoje s masivním dřevěným nábytkem ze starých trámů ruční výroby. Pokoj je vybaven klimatizací a nabízí pohodlné ubytování pro dva hosty.",
      "capacity": 2,
      "size": 26,
      "price": 2990,
      "features": [
        "Podkroví",
        "Masivní nábytek",
        "Klimatizace",
        "Snídaně v ceně"
      ],
      "img": "assets/gallery/pokoje-07.jpg",
      "gallery": [
        "assets/gallery/pokoje-07.jpg",
        "assets/gallery/pokoje-08.jpg",
        "assets/gallery/pokoje-09.jpg"
      ]
    },
    {
      "id": "diamond-royal",
      "name": "Diamond Royal",
      "short": "Prostorný podkrovní apartmán",
      "desc": "Luxusní prostorný podkrovní pokoj s masivním dřevěným nábytkem ze starých trámů ruční výroby. Vybaven klimatizací; více prostoru a světla.",
      "capacity": 3,
      "size": 32,
      "price": 3490,
      "features": [
        "Podkrovní apartmán",
        "Klimatizace",
        "Odpočinkový koutek",
        "Snídaně v ceně"
      ],
      "img": "assets/gallery/pokoje-10.jpg",
      "gallery": [
        "assets/gallery/pokoje-10.jpg",
        "assets/gallery/pokoje-11.jpg",
        "assets/gallery/pokoje-12.jpg"
      ]
    },
    {
      "id": "royal-terrace",
      "name": "Apartmán Royal s terasou",
      "short": "Královský apartmán",
      "desc": "Jedinečný královský apartmán: dva pokoje, koupelna a samostatné WC a luxusní obývací prostor, ze kterého vyjdete na prostornou terasu s úchvatným výhledem na vinice.",
      "capacity": 4,
      "size": 55,
      "price": 4990,
      "features": [
        "Panoramatická terasa",
        "Obývací prostor",
        "Samostatné WC",
        "Snídaně v ceně"
      ],
      "img": "assets/gallery/pokoje-13.jpg",
      "gallery": [
        "assets/gallery/pokoje-13.jpg",
        "assets/gallery/pokoje-14.jpg",
        "assets/gallery/pokoje-15.jpg"
      ]
    }
  ],
  "packages": [
    {
      "id": "weekend",
      "name": "Víkendový odpočinek v Ryzlinku",
      "badge": "Víkend!",
      "nights": 2,
      "price": 10990,
      "desc": "Nabitý víkend ve vinařském kraji: ubytování, wine-wellness, degustace a večeře s vinným doprovodem.",
      "includes": [
        "2 noci",
        "Wine-wellness",
        "Degustace vín",
        "Večeře s doprovodem"
      ],
      "img": "assets/gallery/vevinici-01.jpg"
    },
    {
      "id": "wellness30",
      "name": "Sleva 30% na wellness balíček",
      "badge": "Novinka",
      "nights": 2,
      "price": 7000,
      "desc": "Obnova těla i ducha: vinné lázně, sauny a vířivka pod hvězdami se slevou 30% na wellness.",
      "includes": [
        "2 noci",
        "Vinné lázně",
        "Sauny",
        "-30% wellness"
      ],
      "img": "assets/gallery/wellness-02.jpg"
    },
    {
      "id": "romantic",
      "name": "Romantický pobyt pod Svatým kopečkem se slevou 30%",
      "badge": "Speciální nabídka",
      "nights": 2,
      "price": 8000,
      "desc": "Romantika pro dva pod Svatým kopečkem: večeře při svíčkách, láhev vína Fučík a wine-wellness se slevou 30%.",
      "includes": [
        "2 noci",
        "Večeře při svíčkách",
        "Láhev vína",
        "-30%"
      ],
      "img": "assets/gallery/vinarstvi-01.jpg"
    },
    {
      "id": "classika",
      "name": "Mikulovská (ne)vinná klasika se slevou 30%",
      "badge": "Sleva 30%",
      "nights": 2,
      "price": 6900,
      "desc": "Klasický Mikulov: procházky, gastronomie a vína Pálavy — s příjemnou slevou 30%.",
      "includes": [
        "2 noci",
        "Snídaně",
        "Degustace",
        "-30%"
      ],
      "img": "assets/gallery/hotel-01.jpg"
    }
  ],
  "gallery": [
    {
      "key": "hotel",
      "label": "Hotel",
      "images": [
        "assets/gallery/hotel-01.jpg",
        "assets/gallery/hotel-02.jpg",
        "assets/gallery/hotel-03.jpg",
        "assets/gallery/hotel-04.jpg",
        "assets/gallery/hotel-05.jpg",
        "assets/gallery/hotel-06.jpg",
        "assets/gallery/hotel-07.jpg",
        "assets/gallery/hotel-08.jpg",
        "assets/gallery/hotel-09.jpg"
      ]
    },
    {
      "key": "pokoje",
      "label": "Pokoje",
      "images": [
        "assets/gallery/pokoje-01.jpg",
        "assets/gallery/pokoje-02.jpg",
        "assets/gallery/pokoje-03.jpg",
        "assets/gallery/pokoje-04.jpg",
        "assets/gallery/pokoje-05.jpg",
        "assets/gallery/pokoje-06.jpg",
        "assets/gallery/pokoje-07.jpg",
        "assets/gallery/pokoje-08.jpg",
        "assets/gallery/pokoje-09.jpg",
        "assets/gallery/pokoje-10.jpg",
        "assets/gallery/pokoje-11.jpg",
        "assets/gallery/pokoje-12.jpg",
        "assets/gallery/pokoje-13.jpg",
        "assets/gallery/pokoje-14.jpg",
        "assets/gallery/pokoje-15.jpg",
        "assets/gallery/pokoje-16.jpg"
      ]
    },
    {
      "key": "wellness",
      "label": "Wellness",
      "images": [
        "assets/gallery/wellness-01.jpg",
        "assets/gallery/wellness-02.jpg",
        "assets/gallery/wellness-03.jpg",
        "assets/gallery/wellness-04.jpg",
        "assets/gallery/wellness-05.jpg",
        "assets/gallery/wellness-06.jpg",
        "assets/gallery/wellness-07.jpg",
        "assets/gallery/wellness-08.jpg",
        "assets/gallery/wellness-09.jpg",
        "assets/gallery/wellness-10.jpg",
        "assets/gallery/wellness-11.jpg",
        "assets/gallery/wellness-12.jpg",
        "assets/gallery/wellness-13.jpg",
        "assets/gallery/wellness-14.jpg"
      ]
    },
    {
      "key": "vevinici",
      "label": "Ve vinici",
      "images": [
        "assets/gallery/vevinici-01.jpg",
        "assets/gallery/vevinici-02.jpg",
        "assets/gallery/vevinici-03.jpg",
        "assets/gallery/vevinici-04.jpg",
        "assets/gallery/vevinici-05.jpg",
        "assets/gallery/vevinici-06.jpg",
        "assets/gallery/vevinici-07.jpg",
        "assets/gallery/vevinici-08.jpg",
        "assets/gallery/vevinici-09.jpg",
        "assets/gallery/vevinici-10.jpg",
        "assets/gallery/vevinici-11.jpg",
        "assets/gallery/vevinici-12.jpg"
      ]
    },
    {
      "key": "restaurace",
      "label": "Restaurace",
      "images": [
        "assets/gallery/restaurace-01.jpg",
        "assets/gallery/restaurace-02.jpg",
        "assets/gallery/restaurace-03.jpg",
        "assets/gallery/restaurace-04.jpg",
        "assets/gallery/restaurace-05.jpg",
        "assets/gallery/restaurace-06.jpg",
        "assets/gallery/restaurace-07.jpg",
        "assets/gallery/restaurace-08.jpg",
        "assets/gallery/restaurace-09.jpg",
        "assets/gallery/restaurace-10.jpg",
        "assets/gallery/restaurace-11.jpg",
        "assets/gallery/restaurace-12.jpg",
        "assets/gallery/restaurace-13.jpg",
        "assets/gallery/restaurace-14.jpg"
      ]
    },
    {
      "key": "vinarstvi",
      "label": "Vinařství",
      "images": [
        "assets/gallery/vinarstvi-01.jpg",
        "assets/gallery/vinarstvi-02.jpg",
        "assets/gallery/vinarstvi-03.jpg",
        "assets/gallery/vinarstvi-04.jpg",
        "assets/gallery/vinarstvi-05.jpg",
        "assets/gallery/vinarstvi-06.jpg",
        "assets/gallery/vinarstvi-07.jpg",
        "assets/gallery/vinarstvi-08.jpg",
        "assets/gallery/vinarstvi-09.jpg",
        "assets/gallery/vinarstvi-10.jpg",
        "assets/gallery/vinarstvi-11.jpg",
        "assets/gallery/vinarstvi-12.jpg"
      ]
    }
  ],
  "banners": {
    "wellness": {
      "eyebrow": "Vinné wellness",
      "title": "Obnovte své síly a harmonizujte své tělo i mysl",
      "button": "Relaxujte",
      "target": "#wellness",
      "images": [
        "assets/gallery/wellness-01.jpg",
        "assets/gallery/wellness-05.jpg",
        "assets/gallery/wellness-08.jpg"
      ]
    },
    "restaurant": {
      "eyebrow": "Restaurace",
      "title": "Restaurace Ryzlink",
      "button": "Menu",
      "target": "#restaurant",
      "images": [
        "assets/gallery/restaurace-01.jpg",
        "assets/gallery/restaurace-04.jpg",
        "assets/gallery/restaurace-07.jpg"
      ]
    },
    "winery": {
      "eyebrow": "Vinařství",
      "title": "Vinařství Fučík",
      "button": "Degustace",
      "target": "#tasting",
      "images": [
        "assets/gallery/vinarstvi-02.jpg",
        "assets/gallery/vinarstvi-05.jpg",
        "assets/gallery/vinarstvi-08.jpg"
      ]
    }
  },
  "hero": {
    "stars": 4,
    "tagline": "MÍSTO, KDE SE RODÍ ZÁŽITKY",
    "images": [
      "assets/gallery/wellness-01.jpg",
      "assets/gallery/hotel-02.jpg",
      "assets/gallery/vevinici-01.jpg",
      "assets/gallery/restaurace-01.jpg"
    ]
  },
  "faq": {
    "location": "Hotel Ryzlink se nachází v Mikulově (Jižní Morava) — srdce vinařského kraje Pálava, přibližně 50 km od Brna a v blízkosti rakouské hranice.",
    "breakfast": "Snídaně je zahrnuta v ceně všech pokojů: místní produkty regionu a vína z vinařství Fučík.",
    "parking": "Bezplatné parkování na území hotelu.",
    "pets": "Pobyt se zvířaty je možný po předchozí domluvě.",
    "checkin": "Příjezd od 14:00, odjezd do 11:00. Časný příjezd / pozdní odjezd — dle dostupnosti.",
    "children": "Děti jsou vítány: rodinné apartmány a dětské menu v restauraci.",
    "wellness": "Vinný wellness: finská sauna, vinná bio-sauna, vinné lázně a vířivka pod hvězdami.",
    "restaurant": "Restaurace «Riesling» — regionální kuchyně s vinným doprovodem od vinařství Fučík.",
    "winery": "Vinařství Fučík: degustace, vinný obchod a exkurze do sklepa.",
    "tasting": "Degustace vín Fučík — po předchozí rezervaci, od slámových vín po prémiové Ryzlinky.",
    "languages": "Personál mluví ukrajinsky, česky a anglicky.",
    "vouchers": "Dárkové poukazy na ubytování, wellness a degustace lze zakoupit online.",
    "payment": "Toto je demo-koncept: skutečná platba se neprovádí, rezervace je potvrzena symbolickým číslem."
  },
  "knowledge": [
    {
      "id": "about",
      "category": "Hotel",
      "title": "O hotelu Ryzlink",
      "keywords": [
        "hotel",
        "o hotelu",
        "ryzlink",
        "víno",
        "design",
        "mikulov",
        "jaký hotel"
      ],
      "content": "Hotel Ryzlink — 4★ vinný butikový hotel v Mikulově (jižní Morava) s designovými pokoji, vlastním vinařstvím Fučík, restaurací a Wine Wellness. Spojuje moderní bydlení, přírodní vína a výhled na Svatý kopeček."
    },
    {
      "id": "location",
      "category": "Hotel",
      "title": "Poloha a jak se dostat",
      "keywords": [
        "kde",
        "adresa",
        "poloha",
        "dostat se",
        "brno",
        "centrum",
        "vzdálenost",
        "nádraží",
        "stanice",
        "mapa"
      ],
      "content": "Adresa: Zlámalova 1809/2, Mikulov, 692 01. Hotel je ~800 m od historického centra (10 minut pěšky, 2–3 minuty autem) a ~15 minut pěšky od vlakových stanic. Asi 50 km od Brna, blízko rakouské hranice. Vinice — hned za hotelem."
    },
    {
      "id": "checkin",
      "category": "Ubytování",
      "title": "Příjezd a odjezd",
      "keywords": [
        "příjezd",
        "odjezd",
        "čas",
        "kdy",
        "ubytování",
        "ranný",
        "pozdní",
        "check"
      ],
      "content": "Příjezd od 15:00, odjezd do 11:00. Ranný příjezd nebo pozdní odjezd — po dohodě, 300 Kč za každou započatou hodinu."
    },
    {
      "id": "reception",
      "category": "Ubytování",
      "title": "Otevírací doba recepce",
      "keywords": [
        "recepce",
        "hodiny",
        "otevírací doba",
        "kdy funguje"
      ],
      "content": "Recepce je otevřena denně od 8:00 do 20:00. Pozdní příjezd — po předchozí domluvě."
    },
    {
      "id": "parking",
      "category": "Ubytování",
      "title": "Parkování",
      "keywords": [
        "parkování",
        "auto",
        "automobil",
        "parkoviště",
        "nabíjení",
        "elektromobil"
      ],
      "content": "Jedno auto na pokoj — zdarma, na území hotelu. Každé další auto — 250 Kč za noc. Nabíječky pro elektromobily nemáme; personál poradí s nejbližší v Mikulově."
    },
    {
      "id": "wifi",
      "category": "Ubytování",
      "title": "Wi-Fi",
      "keywords": [
        "wifi",
        "wi-fi",
        "wai",
        "faj",
        "internet",
        "síť",
        "připojení"
      ],
      "content": "Bezplatné Wi-Fi ve všech pokojích a na území hotelu."
    },
    {
      "id": "breakfast",
      "category": "Restaurace",
      "title": "Snídaně",
      "keywords": [
        "snídaně",
        "ráno",
        "zahrnuto",
        "čas snídaně"
      ],
      "content": "Snídaně je zahrnuta v ceně ubytování, podává se od 7:00 do 10:00 — z lokálních produktů a vín Fučík. Na přání — snídaně s sebou."
    },
    {
      "id": "dinner",
      "category": "Restaurace",
      "title": "Večeře / polopenze",
      "keywords": [
        "večeře",
        "polopenze",
        "příplatek",
        "penze"
      ],
      "content": "Večeři lze doobjednat k ubytování za 550 Kč na osobu za noc. V sezóně je restaurace otevřena minimálně do 21:00."
    },
    {
      "id": "restaurant",
      "category": "Restaurace",
      "title": "Restaurace Riesling",
      "keywords": [
        "restaurace",
        "kuchyně",
        "menu",
        "riesling",
        "gastronomie",
        "jídlo"
      ],
      "content": "Restaurace Riesling — autorská regionální kuchyně s důrazem na sezónnost a lokální produkty, s vinným doprovodem Fučík. Menu se obměňuje každý měsíc s tematickými gastrovíkendy."
    },
    {
      "id": "restaurant-hours",
      "category": "Restaurace",
      "title": "Otevírací doba restaurace",
      "keywords": [
        "restaurace",
        "hodiny",
        "otevírací doba",
        "kdy otevřeno"
      ],
      "content": "Po–Čt: 12:00–22:00. Pá–So: 11:30–23:00."
    },
    {
      "id": "restaurant-reservation",
      "category": "Restaurace",
      "title": "Rezervace stolu",
      "keywords": [
        "stolek",
        "rezervace",
        "objednání",
        "stůl",
        "objednat stůl"
      ],
      "content": "Stůl lze rezervovat online nebo na telefonu +420 774 255 022. Pro větší skupiny rezervujte s předstihem."
    },
    {
      "id": "gaultmillau",
      "category": "Restaurace",
      "title": "Ocenění Gault&Millau",
      "keywords": [
        "ocenění",
        "gault",
        "millau",
        "uznání",
        "hodnocení",
        "hvězda"
      ],
      "content": "Restaurace je oceněna v průvodci Gault&Millau — 12 bodů a jeden «kuchařský klobouk» (toque); první taková restaurace v Mikulově."
    },
    {
      "id": "diets",
      "category": "Restaurace",
      "title": "Speciální stravování",
      "keywords": [
        "vegetariánské",
        "veganské",
        "bezlepkové",
        "bez laktózy",
        "alergie",
        "dieta"
      ],
      "content": "V menu jsou vegetariánská a veganská jídla. Bezlepkové a bez laktózy — po předchozí domluvě."
    },
    {
      "id": "wellness",
      "category": "Wellness",
      "title": "Wine Wellness (obecně)",
      "keywords": [
        "wellness",
        "spa",
        "odpočinek",
        "procedury",
        "vinné zdraví"
      ],
      "content": "Wine Wellness: finská sauna, vinná bio-sauna, vinné lázně a horká vířivka (jacuzzi) pod hvězdami. Jeden vstup zahrnuje finskou saunu, vinnou saunu a jacuzzi."
    },
    {
      "id": "wellness-hours",
      "category": "Wellness",
      "title": "Otevírací doba a rezervace Wellness",
      "keywords": [
        "wellness",
        "spa",
        "hodiny",
        "čas",
        "otevřeno",
        "rezervace",
        "objednání",
        "zapsat se"
      ],
      "content": "Wellness je otevřen denně 11:00–20:30, po předchozí rezervaci (online nebo přes recepci). Platí se samostatně od ubytování. Ručníky a župany jsou poskytnuty ve wellness centru."
    },
    {
      "id": "sauna-finnish",
      "category": "Wellness",
      "title": "Finská sauna",
      "keywords": [
        "finská",
        "sauna",
        "teplo",
        "teplota"
      ],
      "content": "Klasická finská sauna 85–95 °C se suchým teplem a vůní dřeva — pro hlubokou relaxaci; následné ochlazení posílí imunitu."
    },
    {
      "id": "sauna-wine",
      "category": "Wellness",
      "title": "Vinná bio-sauna",
      "keywords": [
        "vinná",
        "biosauna",
        "sauna",
        "sůl",
        "aromaterapie"
      ],
      "content": "Šetrná bio-sauna ~65 °C s vlhkostí ~50%, vůněmi bylin a vína Fučík a osvětlenou stěnou z himalájské soli."
    },
    {
      "id": "wine-bath",
      "category": "Wellness",
      "title": "Vinné lázně",
      "keywords": [
        "vinné lázně",
        "koupel",
        "antioxidanty",
        "pokožka",
        "vana"
      ],
      "content": "Privátní vinné koupele s extraktem z hroznových slupek, kvasnic z místních vinic a solí z Mrtvého moře — pro harmonii a uvolnění stresu."
    },
    {
      "id": "hot-tub",
      "category": "Wellness",
      "title": "Vířivka pod hvězdami",
      "keywords": [
        "vířivka",
        "horká koupel",
        "bazén",
        "hvězdy",
        "výhled"
      ],
      "content": "Venkovní vířivka (~35 °C) pro 4 osoby s lehátky a panoramatem na Svatý Kopeček; ke koupeli podáváme víno."
    },
    {
      "id": "tasting-public",
      "category": "Degustace",
      "title": "Prohlídka a degustace (veřejné)",
      "keywords": [
        "degustace",
        "prohlídka",
        "víno",
        "sklep",
        "cena",
        "kolik stojí"
      ],
      "content": "Prohlídka vinařství — 390 Kč (16:00–17:00), degustace ve sklepě — 390 Kč (18:00–19:30, 6 vzorků), kombo — 690 Kč. Ve středu, pátek a sobotu. Voucher 100 Kč (200 Kč za kombo) na nákup vína."
    },
    {
      "id": "tasting-sensory",
      "category": "Degustace",
      "title": "Senzorická degustace",
      "keywords": [
        "senzorická",
        "degustace",
        "vůně",
        "skupina"
      ],
      "content": "Senzorická degustace 5 vín s nácvikem rozpoznávání vůní — 595 Kč na osobu, minimálně 10 účastníků."
    },
    {
      "id": "tasting-group",
      "category": "Degustace",
      "title": "Soukromá degustace pro skupiny",
      "keywords": [
        "soukromá",
        "skupina",
        "degustace",
        "6 vín",
        "12 vín"
      ],
      "content": "Pro skupiny (minimálně 8 osob): 6 vzorků — 450 Kč, 12 vzorků — 650 Kč na osobu; včetně občerstvení z místních farem."
    },
    {
      "id": "tasting-two",
      "category": "Degustace",
      "title": "Degustace pro dva",
      "keywords": [
        "pro dva",
        "pár",
        "sommelier",
        "romantická degustace"
      ],
      "content": "Privátní degustace pro dva se sommelierem: 2 hodiny, 12 vzorků vín a občerstvení — 2500 Kč za pár."
    },
    {
      "id": "tasting-book",
      "category": "Degustace",
      "title": "Jak objednat degustaci",
      "keywords": [
        "objednat",
        "rezervace",
        "degustace",
        "zápis",
        "kontakt"
      ],
      "content": "Objednávky: recepce@hotelryzlink.cz nebo +420 770 139 407. Soukromé degustace rezervujte nejméně týden předem."
    },
    {
      "id": "winery",
      "category": "Vinařství",
      "title": "Vinařství Fučík",
      "keywords": [
        "vinařství",
        "fučík",
        "fučík",
        "vína",
        "sklep"
      ],
      "content": "Vlastní vinařství Fučík: prohlídky sklepem, degustace a vinný obchůdek. Vína jsou oceňovaná a dala jméno hotelu (Ryzlink = Riesling)."
    },
    {
      "id": "wine-shop",
      "category": "Vinařství",
      "title": "Nákup vína",
      "keywords": [
        "koupit víno",
        "obchod",
        "vinotéka",
        "láhev"
      ],
      "content": "Vína Fučík si můžete zakoupit na recepci, která zároveň slouží jako hotelová vinotéka."
    },
    {
      "id": "events-concerts",
      "category": "Program",
      "title": "Letní večery s cimbálem",
      "keywords": [
        "koncert",
        "hudba",
        "cimbál",
        "akce",
        "léto",
        "program 2026"
      ],
      "content": "Soubor Musica Moravica hraje každé pondělí v 18:00: červenec — 06, 13, 20, 27; srpen — 03, 10, 17. Místa omezena, doporučujeme rezervaci."
    },
    {
      "id": "events-tastings",
      "category": "Program",
      "title": "Týdenní program degustací 2026",
      "keywords": [
        "program",
        "degustace",
        "středa",
        "čtvrtek",
        "pátek",
        "sobota",
        "kvíz"
      ],
      "content": "St/Pá/So — prohlídky a degustace (390 Kč každá, 690 Kč kombo). Čt — vinný kvíz se sommelierem, 4 vína, 490 Kč. Termíny: červenec–srpen 2026."
    },
    {
      "id": "children",
      "category": "Pro hosty",
      "title": "Děti a rodiny",
      "keywords": [
        "děti",
        "dítě",
        "rodina",
        "rodina",
        "miminko",
        "postýlka",
        "židlička"
      ],
      "content": "Děti jsou vítány. Dětská postýlka (do 2 let) — zdarma na předchozí požádání; dětské židličky v restauraci. K dispozici venkovní hřiště a vnitřní hrací koutek; personál ohřeje dětskou stravu."
    },
    {
      "id": "family-rooms",
      "category": "Pokoje",
      "title": "Pokoje pro rodiny",
      "keywords": [
        "rodina",
        "děti",
        "apartmán",
        "exclusive",
        "prostor",
        "velká rodina"
      ],
      "content": "Prostorné dvoupokojové apartmány Exclusive v prvním patře — ideální pro rodiny. Maximální obsazení pokoje — 4 osoby; pro 5 osob doporučujeme dva sousední pokoje."
    },
    {
      "id": "accessible",
      "category": "Pro hosty",
      "title": "Bezbariérový pokoj a výtah",
      "keywords": [
        "invalida",
        "bezbariérový",
        "přístupnost",
        "mobilita",
        "výtah"
      ],
      "content": "Jeden pokoj v přízemí je přizpůsoben hostům s omezenou mobilitou (upravená koupelna). Výtah není k dispozici (hotel má 2 patra) — personál rád pomůže s zavazadly."
    },
    {
      "id": "pets",
      "category": "Ubytování",
      "title": "Domácí mazlíčci",
      "keywords": [
        "zvířata",
        "pes",
        "kočka",
        "mazlíček",
        "se zvířetem",
        "pejsek",
        "psem",
        "psa",
        "psi",
        "psů"
      ],
      "content": "Psy ubytováváme pouze ve vybraných pokojích, na vodítku, pod dohledem a nesmí zůstat sami; vždy po předchozí domluvě."
    },
    {
      "id": "smoking",
      "category": "Ubytování",
      "title": "Kouření",
      "keywords": [
        "kouření",
        "kouřit",
        "cigarety",
        "cigára",
        "zákaz",
        "pokuta"
      ],
      "content": "V celém hotelu platí zákaz kouření. Při porušení bude účtována pokuta 2000 Kč."
    },
    {
      "id": "quiet",
      "category": "Ubytování",
      "title": "Noční klid",
      "keywords": [
        "ticho",
        "noční klid",
        "hluk",
        "tichá hodina"
      ],
      "content": "Noční klid trvá od 22:00 do 7:00."
    },
    {
      "id": "cancellation",
      "category": "Ubytování",
      "title": "Storno podmínky",
      "keywords": [
        "storno",
        "zrušení",
        "vrácení peněz",
        "podmínky"
      ],
      "content": "Storno podmínky závisí na typu rezervace; nejčastěji je možné zrušit zdarma do 7 dnů před příjezdem. Upřesníme vám je na recepci."
    },
    {
      "id": "payment",
      "category": "Ubytování",
      "title": "Platby a faktury",
      "keywords": [
        "platba",
        "karta",
        "faktura",
        "účet",
        "fksp",
        "bezhotovostně"
      ],
      "content": "Přijímáme platby kartou i hotově; vystavíme faktury pro firmy a akceptujeme platby z FKSP — sdělte nám to prosím předem na recepci. (V demo verzi není skutečná platba prováděna.)"
    },
    {
      "id": "luggage",
      "category": "Pro hosty",
      "title": "Úschova zavazadel",
      "keywords": [
        "zavazadla",
        "kufry",
        "úschova",
        "úschovná"
      ],
      "content": "Zavazadla můžete bezplatně uložit na recepci před check-inem i po check-outu."
    },
    {
      "id": "room-amenities",
      "category": "Pokoje",
      "title": "Vybavení pokojů",
      "keywords": [
        "televize",
        "klimatizace",
        "minibar",
        "fén",
        "káva",
        "rychlovarná konvice",
        "vybavení"
      ],
      "content": "Všechny pokoje mají TV, klimatizaci, minibar (vinotéka) a fén. Župan a žehličku si můžete vyzvednout na recepci či ve wellness, rychlovarnou konvici na recepci. Kávovar najdete v pokojích Diamond Royal."
    },
    {
      "id": "room-terrace",
      "category": "Pokoje",
      "title": "Pokoj s terasou",
      "keywords": [
        "terasa",
        "výhled",
        "panorama",
        "royal"
      ],
      "content": "Apartmán Royal nabízí prostornou terasu s nádherným výhledem na vinice a Svatý Kopeček."
    },
    {
      "id": "room-diff",
      "category": "Pokoje",
      "title": "Diamond vs Exclusive",
      "keywords": [
        "rozdíl",
        "diamond",
        "exclusive",
        "odlišnost",
        "který vybrat"
      ],
      "content": "Diamond je prostorný studiový pokoj ve druhém patře; Exclusive nabízí apartmán s oddělenými pokoji, ideální pro rodiny a delší pobyty. Přistýlka je možná v Exclusive i Diamond."
    },
    {
      "id": "corporate",
      "category": "Akce",
      "title": "Firemní akce a svatby",
      "keywords": [
        "firemní akce",
        "konference",
        "business",
        "sál",
        "event",
        "svatba"
      ],
      "content": "Pořádáme firemní akce i svatby: 2 konferenční sály (TV, projektor, Wi-Fi), ubytování, catering a doprovodné programy. Kontakt: eventy@hotelryzlink.cz."
    },
    {
      "id": "taxi",
      "category": "Pro hosty",
      "title": "Taxi a transfer",
      "keywords": [
        "taxi",
        "transfer",
        "doprava",
        "nádraží"
      ],
      "content": "Recepce vám ráda zavolá taxi nebo doporučí ověřené kontakty; poradíme také s dopravou od nádraží."
    },
    {
      "id": "vouchers",
      "category": "Hotel",
      "title": "Dárkové poukazy",
      "keywords": [
        "poukaz",
        "dárek",
        "certifikát",
        "gift"
      ],
      "content": "Dárkové poukazy na pobyt, wellness i degustace si můžete zakoupit online nebo na recepci."
    },
    {
      "id": "bikes",
      "category": "Pro hosty",
      "title": "Kola a trasy",
      "keywords": [
        "kolo",
        "úschova",
        "trasa",
        "cyklo",
        "výlet"
      ],
      "content": "Máme uzamykatelnou místnost pro kola i kočárky. Na recepci vám zapůjčíme mapy a poradíme turistické i cyklistické trasy po Pálavě."
    },
    {
      "id": "picnic",
      "category": "Pro hosty",
      "title": "Piknikový koš",
      "keywords": [
        "piknik",
        "koš",
        "delikatesy",
        "do přírody"
      ],
      "content": "Můžete si objednat piknikový koš pro dva s místními delikatesami a lahví vína."
    }
  ],
  "hotel": {
    "name": "Hotel Ryzlink",
    "stars": 4,
    "tagline": "MÍSTO, KDE SE RODÍ ZÁŽITKY",
    "city": "Мікулов",
    "address": "Zlámalova 1809/2, Mikulov, 692 01, Чехія",
    "phone": "+420 770 139 407",
    "email": "recepce@hotelryzlink.cz",
    "currency": "CZK",
    "social": {
      "facebook": "https://www.facebook.com/hotelryzlink",
      "instagram": "https://www.instagram.com/hotelryzlink",
      "linkedin": "https://www.linkedin.com/company/vinarstvifucik"
    }
  }
};
});
