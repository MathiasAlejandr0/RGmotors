/**
 * Tasas efectivas Autofin (all-in) calibradas a spider/fee.
 * Regenerar:
 *   node scripts/scrape-autofin-rate-matrix.mjs
 *   node scripts/generate-autofin-rate-table.mjs
 *
 * scrapedAt: 2026-09-07T20:53:17.733Z
 */
export type AutofinRateAnchor = {
  productCode: number;
  price: number;
  downPct: number;
  termMonths: number;
  valorCuota: number;
  rate: number;
};

export const AUTOFIN_RATE_TABLE_META = {
  scrapedAt: "2026-09-07T20:53:17.733Z",
  source: "webapi.autofin.cl/v1/spider/fee",
  productCode: 2 as const,
  productName: "AUTOPLAN USADOS" as const,
  fallbackRate: 0.03366229,
  conservativeFloor: 0.03798487,
};

export const AUTOFIN_RATE_ANCHORS: AutofinRateAnchor[] = [
  {
    "productCode": 2,
    "price": 8000000,
    "downPct": 20,
    "termMonths": 24,
    "valorCuota": 412179,
    "rate": 0.03822891
  },
  {
    "productCode": 2,
    "price": 8000000,
    "downPct": 20,
    "termMonths": 36,
    "valorCuota": 321249,
    "rate": 0.03628015
  },
  {
    "productCode": 2,
    "price": 8000000,
    "downPct": 20,
    "termMonths": 48,
    "valorCuota": 282208,
    "rate": 0.03603258
  },
  {
    "productCode": 2,
    "price": 8000000,
    "downPct": 30,
    "termMonths": 24,
    "valorCuota": 361826,
    "rate": 0.03854249
  },
  {
    "productCode": 2,
    "price": 8000000,
    "downPct": 30,
    "termMonths": 36,
    "valorCuota": 282004,
    "rate": 0.03650762
  },
  {
    "productCode": 2,
    "price": 8000000,
    "downPct": 30,
    "termMonths": 48,
    "valorCuota": 247733,
    "rate": 0.03621902
  },
  {
    "productCode": 2,
    "price": 8000000,
    "downPct": 40,
    "termMonths": 24,
    "valorCuota": 311472,
    "rate": 0.03895949
  },
  {
    "productCode": 2,
    "price": 8000000,
    "downPct": 40,
    "termMonths": 36,
    "valorCuota": 242759,
    "rate": 0.03681036
  },
  {
    "productCode": 2,
    "price": 8000000,
    "downPct": 40,
    "termMonths": 48,
    "valorCuota": 213257,
    "rate": 0.03646695
  },
  {
    "productCode": 2,
    "price": 8000000,
    "downPct": 50,
    "termMonths": 24,
    "valorCuota": 261119,
    "rate": 0.03954216
  },
  {
    "productCode": 2,
    "price": 8000000,
    "downPct": 50,
    "termMonths": 36,
    "valorCuota": 203514,
    "rate": 0.03723317
  },
  {
    "productCode": 2,
    "price": 8000000,
    "downPct": 50,
    "termMonths": 48,
    "valorCuota": 178781,
    "rate": 0.03681328
  },
  {
    "productCode": 2,
    "price": 10000000,
    "downPct": 20,
    "termMonths": 24,
    "valorCuota": 495487,
    "rate": 0.03448407
  },
  {
    "productCode": 2,
    "price": 10000000,
    "downPct": 20,
    "termMonths": 36,
    "valorCuota": 381005,
    "rate": 0.03263972
  },
  {
    "productCode": 2,
    "price": 10000000,
    "downPct": 20,
    "termMonths": 48,
    "valorCuota": 330809,
    "rate": 0.03240332
  },
  {
    "productCode": 2,
    "price": 10000000,
    "downPct": 30,
    "termMonths": 24,
    "valorCuota": 449944,
    "rate": 0.03804057
  },
  {
    "productCode": 2,
    "price": 10000000,
    "downPct": 30,
    "termMonths": 36,
    "valorCuota": 350682,
    "rate": 0.03614336
  },
  {
    "productCode": 2,
    "price": 10000000,
    "downPct": 30,
    "termMonths": 48,
    "valorCuota": 308065,
    "rate": 0.03592072
  },
  {
    "productCode": 2,
    "price": 10000000,
    "downPct": 40,
    "termMonths": 24,
    "valorCuota": 387003,
    "rate": 0.03837544
  },
  {
    "productCode": 2,
    "price": 10000000,
    "downPct": 40,
    "termMonths": 36,
    "valorCuota": 301626,
    "rate": 0.03638623
  },
  {
    "productCode": 2,
    "price": 10000000,
    "downPct": 40,
    "termMonths": 48,
    "valorCuota": 264970,
    "rate": 0.03611951
  },
  {
    "productCode": 2,
    "price": 10000000,
    "downPct": 50,
    "termMonths": 24,
    "valorCuota": 324061,
    "rate": 0.03884298
  },
  {
    "productCode": 2,
    "price": 10000000,
    "downPct": 50,
    "termMonths": 36,
    "valorCuota": 252570,
    "rate": 0.03672558
  },
  {
    "productCode": 2,
    "price": 10000000,
    "downPct": 50,
    "termMonths": 48,
    "valorCuota": 221876,
    "rate": 0.03639757
  },
  {
    "productCode": 2,
    "price": 12000000,
    "downPct": 20,
    "termMonths": 24,
    "valorCuota": 592778,
    "rate": 0.03419533
  },
  {
    "productCode": 2,
    "price": 12000000,
    "downPct": 20,
    "termMonths": 36,
    "valorCuota": 455816,
    "rate": 0.03243178
  },
  {
    "productCode": 2,
    "price": 12000000,
    "downPct": 20,
    "termMonths": 48,
    "valorCuota": 395764,
    "rate": 0.03223452
  },
  {
    "productCode": 2,
    "price": 12000000,
    "downPct": 30,
    "termMonths": 24,
    "valorCuota": 519810,
    "rate": 0.03440166
  },
  {
    "productCode": 2,
    "price": 12000000,
    "downPct": 30,
    "termMonths": 36,
    "valorCuota": 399708,
    "rate": 0.03258038
  },
  {
    "productCode": 2,
    "price": 12000000,
    "downPct": 30,
    "termMonths": 48,
    "valorCuota": 347047,
    "rate": 0.032355
  },
  {
    "productCode": 2,
    "price": 12000000,
    "downPct": 40,
    "termMonths": 24,
    "valorCuota": 462533,
    "rate": 0.03798487
  },
  {
    "productCode": 2,
    "price": 12000000,
    "downPct": 40,
    "termMonths": 36,
    "valorCuota": 360494,
    "rate": 0.036103
  },
  {
    "productCode": 2,
    "price": 12000000,
    "downPct": 40,
    "termMonths": 48,
    "valorCuota": 316684,
    "rate": 0.03588756
  },
  {
    "productCode": 2,
    "price": 12000000,
    "downPct": 50,
    "termMonths": 24,
    "valorCuota": 387003,
    "rate": 0.03837544
  },
  {
    "productCode": 2,
    "price": 12000000,
    "downPct": 50,
    "termMonths": 36,
    "valorCuota": 301626,
    "rate": 0.03638623
  },
  {
    "productCode": 2,
    "price": 12000000,
    "downPct": 50,
    "termMonths": 48,
    "valorCuota": 264970,
    "rate": 0.03611951
  },
  {
    "productCode": 2,
    "price": 15000000,
    "downPct": 20,
    "termMonths": 24,
    "valorCuota": 738714,
    "rate": 0.03390606
  },
  {
    "productCode": 2,
    "price": 15000000,
    "downPct": 20,
    "termMonths": 36,
    "valorCuota": 568034,
    "rate": 0.0322237
  },
  {
    "productCode": 2,
    "price": 15000000,
    "downPct": 20,
    "termMonths": 48,
    "valorCuota": 493197,
    "rate": 0.03206555
  },
  {
    "productCode": 2,
    "price": 15000000,
    "downPct": 30,
    "termMonths": 24,
    "valorCuota": 647504,
    "rate": 0.03407141
  },
  {
    "productCode": 2,
    "price": 15000000,
    "downPct": 30,
    "termMonths": 36,
    "valorCuota": 497898,
    "rate": 0.03234267
  },
  {
    "productCode": 2,
    "price": 15000000,
    "downPct": 30,
    "termMonths": 48,
    "valorCuota": 432301,
    "rate": 0.03216209
  },
  {
    "productCode": 2,
    "price": 15000000,
    "downPct": 40,
    "termMonths": 24,
    "valorCuota": 556294,
    "rate": 0.03429165
  },
  {
    "productCode": 2,
    "price": 15000000,
    "downPct": 40,
    "termMonths": 36,
    "valorCuota": 427762,
    "rate": 0.03250115
  },
  {
    "productCode": 2,
    "price": 15000000,
    "downPct": 40,
    "termMonths": 48,
    "valorCuota": 371406,
    "rate": 0.03229083
  },
  {
    "productCode": 2,
    "price": 15000000,
    "downPct": 50,
    "termMonths": 24,
    "valorCuota": 465084,
    "rate": 0.03459953
  },
  {
    "productCode": 2,
    "price": 15000000,
    "downPct": 50,
    "termMonths": 36,
    "valorCuota": 357626,
    "rate": 0.0327227
  },
  {
    "productCode": 2,
    "price": 15000000,
    "downPct": 50,
    "termMonths": 48,
    "valorCuota": 310510,
    "rate": 0.03247067
  },
  {
    "productCode": 2,
    "price": 18000000,
    "downPct": 20,
    "termMonths": 24,
    "valorCuota": 884650,
    "rate": 0.03371297
  },
  {
    "productCode": 2,
    "price": 18000000,
    "downPct": 20,
    "termMonths": 36,
    "valorCuota": 680251,
    "rate": 0.03208471
  },
  {
    "productCode": 2,
    "price": 18000000,
    "downPct": 20,
    "termMonths": 48,
    "valorCuota": 590630,
    "rate": 0.03195277
  },
  {
    "productCode": 2,
    "price": 18000000,
    "downPct": 30,
    "termMonths": 24,
    "valorCuota": 775198,
    "rate": 0.03385091
  },
  {
    "productCode": 2,
    "price": 18000000,
    "downPct": 30,
    "termMonths": 36,
    "valorCuota": 596088,
    "rate": 0.03218398
  },
  {
    "productCode": 2,
    "price": 18000000,
    "downPct": 30,
    "termMonths": 48,
    "valorCuota": 517555,
    "rate": 0.03203331
  },
  {
    "productCode": 2,
    "price": 18000000,
    "downPct": 40,
    "termMonths": 24,
    "valorCuota": 665746,
    "rate": 0.03403468
  },
  {
    "productCode": 2,
    "price": 18000000,
    "downPct": 40,
    "termMonths": 36,
    "valorCuota": 511925,
    "rate": 0.03231622
  },
  {
    "productCode": 2,
    "price": 18000000,
    "downPct": 40,
    "termMonths": 48,
    "valorCuota": 444481,
    "rate": 0.03214074
  },
  {
    "productCode": 2,
    "price": 18000000,
    "downPct": 50,
    "termMonths": 24,
    "valorCuota": 556294,
    "rate": 0.03429165
  },
  {
    "productCode": 2,
    "price": 18000000,
    "downPct": 50,
    "termMonths": 36,
    "valorCuota": 427762,
    "rate": 0.03250115
  },
  {
    "productCode": 2,
    "price": 18000000,
    "downPct": 50,
    "termMonths": 48,
    "valorCuota": 371406,
    "rate": 0.03229083
  },
  {
    "productCode": 2,
    "price": 22000000,
    "downPct": 20,
    "termMonths": 24,
    "valorCuota": 1079231,
    "rate": 0.03353722
  },
  {
    "productCode": 2,
    "price": 22000000,
    "downPct": 20,
    "termMonths": 36,
    "valorCuota": 829874,
    "rate": 0.03195826
  },
  {
    "productCode": 2,
    "price": 22000000,
    "downPct": 20,
    "termMonths": 48,
    "valorCuota": 720541,
    "rate": 0.03185018
  },
  {
    "productCode": 2,
    "price": 22000000,
    "downPct": 30,
    "termMonths": 24,
    "valorCuota": 945457,
    "rate": 0.03365026
  },
  {
    "productCode": 2,
    "price": 22000000,
    "downPct": 30,
    "termMonths": 36,
    "valorCuota": 727008,
    "rate": 0.03203954
  },
  {
    "productCode": 2,
    "price": 22000000,
    "downPct": 30,
    "termMonths": 48,
    "valorCuota": 631227,
    "rate": 0.03191613
  },
  {
    "productCode": 2,
    "price": 22000000,
    "downPct": 40,
    "termMonths": 24,
    "valorCuota": 811682,
    "rate": 0.03380076
  },
  {
    "productCode": 2,
    "price": 22000000,
    "downPct": 40,
    "termMonths": 36,
    "valorCuota": 624142,
    "rate": 0.03214785
  },
  {
    "productCode": 2,
    "price": 22000000,
    "downPct": 40,
    "termMonths": 48,
    "valorCuota": 541914,
    "rate": 0.0320041
  },
  {
    "productCode": 2,
    "price": 22000000,
    "downPct": 50,
    "termMonths": 24,
    "valorCuota": 677907,
    "rate": 0.03401126
  },
  {
    "productCode": 2,
    "price": 22000000,
    "downPct": 50,
    "termMonths": 36,
    "valorCuota": 521276,
    "rate": 0.03229934
  },
  {
    "productCode": 2,
    "price": 22000000,
    "downPct": 50,
    "termMonths": 48,
    "valorCuota": 452600,
    "rate": 0.03212703
  },
  {
    "productCode": 2,
    "price": 25000000,
    "downPct": 20,
    "termMonths": 24,
    "valorCuota": 1225167,
    "rate": 0.03344226
  },
  {
    "productCode": 2,
    "price": 25000000,
    "downPct": 20,
    "termMonths": 36,
    "valorCuota": 942092,
    "rate": 0.03188998
  },
  {
    "productCode": 2,
    "price": 25000000,
    "downPct": 20,
    "termMonths": 48,
    "valorCuota": 817974,
    "rate": 0.03179473
  },
  {
    "productCode": 2,
    "price": 25000000,
    "downPct": 30,
    "termMonths": 24,
    "valorCuota": 1073151,
    "rate": 0.03354179
  },
  {
    "productCode": 2,
    "price": 25000000,
    "downPct": 30,
    "termMonths": 36,
    "valorCuota": 825199,
    "rate": 0.03196157
  },
  {
    "productCode": 2,
    "price": 25000000,
    "downPct": 30,
    "termMonths": 48,
    "valorCuota": 716481,
    "rate": 0.0318528
  },
  {
    "productCode": 2,
    "price": 25000000,
    "downPct": 40,
    "termMonths": 24,
    "valorCuota": 921134,
    "rate": 0.03367432
  },
  {
    "productCode": 2,
    "price": 25000000,
    "downPct": 40,
    "termMonths": 36,
    "valorCuota": 708305,
    "rate": 0.03205687
  },
  {
    "productCode": 2,
    "price": 25000000,
    "downPct": 40,
    "termMonths": 48,
    "valorCuota": 614989,
    "rate": 0.03193027
  },
  {
    "productCode": 2,
    "price": 25000000,
    "downPct": 50,
    "termMonths": 24,
    "valorCuota": 769117,
    "rate": 0.0338597
  },
  {
    "productCode": 2,
    "price": 25000000,
    "downPct": 50,
    "termMonths": 36,
    "valorCuota": 591412,
    "rate": 0.03219029
  },
  {
    "productCode": 2,
    "price": 25000000,
    "downPct": 50,
    "termMonths": 48,
    "valorCuota": 513496,
    "rate": 0.03203854
  }
];

export const AUTOFIN_RATE_BAND_STATS = [
  {
    "termMonths": 24,
    "downPct": 20,
    "rateMedian": 0.03390606,
    "rateP90": 0.03822891,
    "n": 7
  },
  {
    "termMonths": 36,
    "downPct": 20,
    "rateMedian": 0.0322237,
    "rateP90": 0.03628015,
    "n": 7
  },
  {
    "termMonths": 48,
    "downPct": 20,
    "rateMedian": 0.03206555,
    "rateP90": 0.03603258,
    "n": 7
  },
  {
    "termMonths": 24,
    "downPct": 30,
    "rateMedian": 0.03407141,
    "rateP90": 0.03854249,
    "n": 7
  },
  {
    "termMonths": 36,
    "downPct": 30,
    "rateMedian": 0.03234267,
    "rateP90": 0.03650762,
    "n": 7
  },
  {
    "termMonths": 48,
    "downPct": 30,
    "rateMedian": 0.03216209,
    "rateP90": 0.03621902,
    "n": 7
  },
  {
    "termMonths": 24,
    "downPct": 40,
    "rateMedian": 0.03429165,
    "rateP90": 0.03895949,
    "n": 7
  },
  {
    "termMonths": 36,
    "downPct": 40,
    "rateMedian": 0.03250115,
    "rateP90": 0.03681036,
    "n": 7
  },
  {
    "termMonths": 48,
    "downPct": 40,
    "rateMedian": 0.03229083,
    "rateP90": 0.03646695,
    "n": 7
  },
  {
    "termMonths": 24,
    "downPct": 50,
    "rateMedian": 0.03459953,
    "rateP90": 0.03954216,
    "n": 7
  },
  {
    "termMonths": 36,
    "downPct": 50,
    "rateMedian": 0.0327227,
    "rateP90": 0.03723317,
    "n": 7
  },
  {
    "termMonths": 48,
    "downPct": 50,
    "rateMedian": 0.03247067,
    "rateP90": 0.03681328,
    "n": 7
  }
] as const;
