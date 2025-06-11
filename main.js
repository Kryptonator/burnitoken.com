// main.js: Core functionality for Burni Token website
document.addEventListener('DOMContentLoaded', () => {
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();

  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      mobileMenuButton.setAttribute('aria-expanded', String(!isExpanded));
      mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('active');
    });
  }

  const headerOffset = 80;
  const navLinks = document.querySelectorAll('header nav a.nav-link, #mobile-menu a');
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      if (link.hash) {
        e.preventDefault();
        const targetElement = document.querySelector(link.hash);
        if (targetElement) {
          const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
          navLinks.forEach((nav) => nav.classList.remove('active'));
          document
            .querySelectorAll(
              `header nav a[href="${link.hash}"], #mobile-menu a[href="${link.hash}"]`,
            )
            .forEach((activeLink) => activeLink.classList.add('active'));
          if (mobileMenu?.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            mobileMenu.classList.add('hidden');
            if (mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });
  });

  window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('main section[id]');
    sections.forEach((section) => {
      if (window.pageYOffset >= section.offsetTop - headerOffset - 10) current = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href')?.includes(current)) link.classList.add('active');
    });
    if (sections.length > 0 && window.pageYOffset < sections[0].offsetTop - headerOffset - 10) {
      navLinks.forEach((link) => link.classList.remove('active'));
      document
        .querySelectorAll(`header nav a[href="#hero"], #mobile-menu a[href="#hero"]`)
        .forEach((heroLink) => heroLink.classList.add('active'));
    }
  });

  let supplyChartInstance, athAtlChartInstance, scheduleChartInstance;
  let currentLang = 'en';

  const locales = {
    en: 'en-US',
    de: 'de-DE',
    es: 'es-ES',
    fr: 'fr-FR',
    ar: 'ar-SA',
    bn: 'bn-BD',
    pt: 'pt-BR',
    ru: 'ru-RU',
    ko: 'ko-KR',
    tr: 'tr-TR',
    zh: 'zh-CN',
    hi: 'hi-IN',
    ja: 'ja-JP',
    it: 'it-IT',
  };

  const priceErrorMessageElement = document.getElementById('price-error-message');

  function generateSchedule(startDate, initialCoins, processes, locale, currentTranslations) {
    const schedule = [];
    let coins = initialCoins;
    let date = new Date(startDate);

    for (let i = 1; i <= processes; i++) {
      coins = coins * (1 - 0.03) * (1 - 0.02); // Burn 3%, lock 2%
      schedule.push({
        date: date.toLocaleDateString(locales[locale] || 'en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        day: date.toLocaleDateString(locales[locale] || 'en-US', { weekday: 'long' }),
        process: i,
        coins: new Intl.NumberFormat(locales[locale] || 'en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(coins),
      });
      date.setDate(date.getDate() + 3);
    }
    return schedule;
  }

  function renderScheduleTable(schedule, lang) {
    const tableContainer = document.getElementById('scheduleTable');
    if (!tableContainer) return;

    const currentTranslations = translations[lang] || translations.en;

    let displaySchedule = [];
    if (schedule.length <= 7) {
      displaySchedule = schedule;
    } else {
      displaySchedule = schedule.slice(0, 4);
      if (schedule.length > 6) {
        displaySchedule.push({ date: '...', day: '...', process: '...', coins: '...' });
      }
      displaySchedule = displaySchedule.concat(schedule.slice(-3));
    }

    tableContainer.innerHTML = `
            <table class="min-w-full bg-white">
                <thead>
                    <tr class="bg-orange-200 text-orange-800 uppercase text-sm leading-normal">
                        <th class="py-3 px-6 text-left">${currentTranslations.date || 'Date'}</th>
                        <th class="py-3 px-6 text-left">${currentTranslations.day || 'Day'}</th>
                        <th class="py-3 px-6 text-left">${currentTranslations.process_no || 'Process No.'}</th>
                        <th class="py-3 px-6 text-right">${currentTranslations.remaining_coins || 'Remaining Coins (approx.)'}</th>
                    </tr>
                </thead>
                <tbody class="text-gray-700 text-sm font-light">
                    ${displaySchedule
                      .map(
                        (row) => `
                        <tr class="border-b border-gray-200 hover:bg-orange-50">
                            <td class="py-3 px-6 text-left whitespace-nowrap">${row.date}</td>
                            <td class="py-3 px-6 text-left">${row.day}</td>
                            <td class="py-3 px-6 text-left">${row.process}</td>
                            <td class="py-3 px-6 text-right">${row.coins}</td>
                        </tr>
                    `,
                      )
                      .join('')}
                </tbody>
            </table>
        `;
  }

  async function fetchBurniMetrics() {
    const burniIssuerAddress = 'rJzQVveWEob6x6PJQqXm9sdcFjGbACBwv2';
    const burniCurrencyCode = 'BURNI';
    try {
      // HINWEIS: Dies ist eine beispielhafte API-Implementierung.
      // Ersetzen Sie dies durch Ihre robuste Implementierung mit Caching und Fehlerbehandlung.
      return { circulatingSupply: 450000, holders: 102, trustlines: 115 }; // Fallback-Daten
    } catch (error) {
      console.error('Error fetching Burni metrics:', error);
      return { circulatingSupply: 450000, holders: 102, trustlines: 115 };
    }
  }

  async function fetchXPMMetrics(xrpToUsdRate) {
    const xpmIssuerAddress = 'rXPMxBeefHGxx2K7g5qmmWq3gFsgawkoa';
    const xpmCurrencyCode = 'XPM';
    try {
      // HINWEIS: Dies ist eine beispielhafte API-Implementierung.
      return { priceUSD: 0.000000229 * xrpToUsdRate }; // Fallback-Berechnung
    } catch (error) {
      console.error('Error fetching XPM metrics:', error);
      return { priceUSD: 0.000000229 * xrpToUsdRate }; // Fallback-Berechnung
    }
  }

  async function fetchBurniPriceXRP() {
    const fallbackPriceXRP = 0.0025;
    try {
      // HINWEIS: Dies ist eine beispielhafte API-Implementierung.
      return fallbackPriceXRP;
    } catch (error) {
      console.error('Error fetching Burni/XRP price:', error);
      return fallbackPriceXRP;
    }
  }

  async function fetchLivePrices() {
    let prices;
    const fallbackPrices = {
      burni: { priceXRP: 0.0025, circulatingSupply: 450000, holders: 102, trustlines: 115 },
      xrp: { priceUSD: 0.5234 },
      xpm: { priceXRP: 0.000000229 },
    };
    const currentLocale = locales[currentLang] || 'en-US';

    try {
      let xrpUsdPrice = fallbackPrices.xrp.priceUSD;
      try {
        const xrpPriceResponse = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd',
        );
        if (xrpPriceResponse.ok) {
          const xrpPriceData = await xrpPriceResponse.json();
          xrpUsdPrice = xrpPriceData.ripple?.usd || fallbackPrices.xrp.priceUSD;
        } else {
          console.warn(`CoinGecko API request for XRP price failed: ${xrpPriceResponse.status}`);
        }
      } catch (e) {
        console.warn('Could not fetch XRP price from CoinGecko, using fallback.', e);
      }

      const burniMetrics = await fetchBurniMetrics();
      const burniPriceXRP = await fetchBurniPriceXRP();
      const xpmMetrics = await fetchXPMMetrics(xrpUsdPrice);

      prices = {
        burni: {
          priceUSD: burniPriceXRP * xrpUsdPrice,
          priceXRP: burniPriceXRP,
          circulatingSupply: burniMetrics.circulatingSupply,
          holders: burniMetrics.holders,
          trustlines: burniMetrics.trustlines,
        },
        xrp: { priceUSD: xrpUsdPrice },
        xpm: {
          priceUSD: xpmMetrics.priceUSD,
        },
      };

      if (priceErrorMessageElement) priceErrorMessageElement.classList.add('hidden');
    } catch (error) {
      console.error('Error fetching live prices:', error);
      prices = {
        burni: {
          priceUSD: fallbackPrices.burni.priceXRP * fallbackPrices.xrp.priceUSD,
          priceXRP: fallbackPrices.burni.priceXRP,
          circulatingSupply: fallbackPrices.burni.circulatingSupply,
          holders: fallbackPrices.burni.holders,
          trustlines: fallbackPrices.burni.trustlines,
        },
        xrp: { priceUSD: fallbackPrices.xrp.priceUSD },
        xpm: { priceUSD: fallbackPrices.xpm.priceXRP * fallbackPrices.xrp.priceUSD },
      };

      if (priceErrorMessageElement && translations[currentLang]) {
        const errorMsgKey =
          translations[currentLang].price_error_message || translations.en.price_error_message;
        priceErrorMessageElement.innerHTML = errorMsgKey;
        priceErrorMessageElement.classList.remove('hidden');
      }
    }

    // DOM Updates
    const burniPriceElement = document.getElementById('burniPriceValue');
    const circulatingSupplyElement = document.getElementById('circulatingSupplyValue');
    const holdersElement = document.getElementById('kpi_holders_value');
    const trustlinesElement = document.getElementById('kpi_trustlines_value');

    if (burniPriceElement)
      burniPriceElement.textContent = new Intl.NumberFormat(currentLocale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 6,
        maximumFractionDigits: 8,
      }).format(prices.burni.priceUSD);
    if (circulatingSupplyElement)
      circulatingSupplyElement.textContent = `${new Intl.NumberFormat(currentLocale, { maximumFractionDigits: 1 }).format(prices.burni.circulatingSupply / 1000)}K`;
    if (holdersElement)
      holdersElement.textContent = new Intl.NumberFormat(currentLocale).format(
        prices.burni.holders,
      );
    if (trustlinesElement)
      trustlinesElement.textContent = new Intl.NumberFormat(currentLocale).format(
        prices.burni.trustlines,
      );

    const xrpPriceElement = document.getElementById('xrpPriceValue');
    if (xrpPriceElement)
      xrpPriceElement.textContent = new Intl.NumberFormat(currentLocale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
      }).format(prices.xrp.priceUSD);

    const xpmPriceElement = document.getElementById('xpmPriceValue');
    if (xpmPriceElement)
      xpmPriceElement.textContent = new Intl.NumberFormat(currentLocale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 10,
        maximumFractionDigits: 12,
      }).format(prices.xpm.priceUSD);

    const lastUpdatedTimestampElement = document.getElementById('lastUpdatedTimestamp');
    if (lastUpdatedTimestampElement)
      lastUpdatedTimestampElement.textContent = new Date().toLocaleString(currentLocale);

    if (
      supplyChartInstance &&
      translations[currentLang] &&
      prices.burni.circulatingSupply !== undefined
    ) {
      supplyChartInstance.data.datasets[0].data = [
        prices.burni.circulatingSupply,
        1000000 - prices.burni.circulatingSupply,
      ];
      const supplyLabelKey =
        translations[currentLang].kpi_circulating_supply || translations.en.kpi_circulating_supply;
      const maxSupplyLabelKey =
        translations[currentLang].kpi_max_supply || translations.en.kpi_max_supply;
      supplyChartInstance.data.labels[0] = `${supplyLabelKey} (${new Intl.NumberFormat(currentLocale, { maximumFractionDigits: 1 }).format(prices.burni.circulatingSupply / 1000)}K)`;
      supplyChartInstance.data.labels[1] = maxSupplyLabelKey;
      supplyChartInstance.update();
    }
  }

  fetchLivePrices();
  setInterval(fetchLivePrices, 60000);

  try {
    const supplyCtx = document.getElementById('supplyChart')?.getContext('2d');
    if (supplyCtx) {
      supplyChartInstance = new Chart(supplyCtx, {
        type: 'doughnut',
        data: {
          labels: ['Circulating Supply', 'Max Supply'],
          datasets: [
            {
              label: 'Token Supply',
              data: [387900, 1000000 - 387900],
              backgroundColor: ['#FDBA74', '#D1D5DB'],
              borderColor: ['#F97316', '#9CA3AF'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: '#374151' } },
            tooltip: {
              callbacks: {
                label: (context) => {
                  let label = context.dataset.label || '';
                  if (context.label) label = context.label;
                  if (label) label += ': ';
                  if (context.parsed !== null)
                    label +=
                      new Intl.NumberFormat(locales[currentLang]).format(context.parsed) +
                      ' Tokens';
                  return label;
                },
              },
            },
          },
        },
      });
    }
  } catch (error) {
    console.error('Error initializing supply chart:', error);
  }

  try {
    const athAtlCtx = document.getElementById('athAtlChart')?.getContext('2d');
    if (athAtlCtx) {
      athAtlChartInstance = new Chart(athAtlCtx, {
        type: 'bar',
        data: {
          labels: ['All-Time Low (ATL) May 17, 2025', 'All-Time High (ATH) May 19, 2025'],
          datasets: [
            {
              label: 'Price in XRP',
              data: [0.0011, 0.0528],
              backgroundColor: ['#FCA5A5', '#6EE7B7'],
              borderColor: ['#EF4444', '#10B981'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              title: { display: true, text: 'Price in XRP', color: '#374151' },
              ticks: {
                color: '#374151',
                callback: (value) => new Intl.NumberFormat(locales[currentLang]).format(value),
              },
            },
            y: { ticks: { color: '#374151', font: { size: 10 } } },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) =>
                  context.dataset.label +
                  ': ' +
                  new Intl.NumberFormat(locales[currentLang]).format(context.parsed.x) +
                  ' XRP',
              },
            },
          },
        },
      });
    }
  } catch (error) {
    console.error('Error initializing ATH/ATL chart:', error);
  }

  try {
    const scheduleCtx = document.getElementById('scheduleChart')?.getContext('2d');
    if (scheduleCtx) {
      const scheduleData = generateSchedule('2025-06-01', 500000, 260, currentLang, translations);
      const chartLabels = scheduleData
        .map((row) => row.date)
        .slice(0, 4)
        .concat(['...'])
        .concat(scheduleData.map((row) => row.date).slice(-3));
      const chartDatasetData = scheduleData
        .map((row) => parseFloat(row.coins))
        .slice(0, 4)
        .concat([null])
        .concat(scheduleData.map((row) => parseFloat(row.coins)).slice(-3));

      scheduleChartInstance = new Chart(scheduleCtx, {
        type: 'line',
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: 'Remaining Coins',
              data: chartDatasetData,
              borderColor: '#F97316',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              title: { display: true, text: 'Number of Coins', color: '#374151' },
              ticks: {
                color: '#374151',
                callback: (value) => new Intl.NumberFormat(locales[currentLang]).format(value),
              },
            },
            x: {
              title: { display: true, text: 'Date', color: '#374151' },
              ticks: { color: '#374151' },
            },
          },
          plugins: {
            legend: { display: true, position: 'top', labels: { color: '#374151' } },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return value !== null
                    ? label + ': ' + new Intl.NumberFormat(locales[currentLang]).format(value)
                    : '';
                },
              },
            },
          },
        },
      });
      renderScheduleTable(scheduleData, currentLang);
    }
  } catch (error) {
    console.error('Error initializing schedule chart:', error);
  }

  setTimeout(() => {
    const twitterTimeline = document.querySelector('.twitter-timeline');
    if (
      twitterTimeline &&
      (twitterTimeline.offsetHeight === 0 || twitterTimeline.offsetWidth === 0) &&
      !twitterTimeline.querySelector('iframe')
    ) {
      const fallback = document.getElementById('twitter-fallback');
      if (fallback) fallback.classList.remove('hidden');
    }
  }, 1500);

  const translations = {
    en: {
      /* ... Alle englischen Übersetzungen ... */
    },
    de: {
      /* ... Alle deutschen Übersetzungen ... */
    },
    es: {
      /* ... Alle spanischen Übersetzungen ... */
    },
    fr: {
      /* ... Alle französischen Übersetzungen ... */
    },
    ar: {
      /* ... Alle arabischen Übersetzungen ... */
    },
    bn: {
      /* ... Alle bengalischen Übersetzungen ... */
    },
    ja: {
      /* ... Alle japanischen Übersetzungen ... */
    },
    pt: {
      /* ... Alle portugiesischen Übersetzungen ... */
    },
    ko: {
      /* ... Alle koreanischen Übersetzungen ... */
    },
    ru: {
      /* ... Alle russischen Übersetzungen ... */
    },
    tr: {
      /* ... Alle türkischen Übersetzungen ... */
    },
    zh: {
      /* ... Alle chinesischen Übersetzungen ... */
    },
    hi: {
      /* ... Alle Hindi Übersetzungen ... */
    },
    it: {
      /* ... Alle italienischen Übersetzungen ... */
    },
  };

  Object.keys(locales).forEach((langCode) => {
    if (!translations[langCode]) {
      translations[langCode] = {};
    }
    for (const key in translations.en) {
      if (translations.en.hasOwnProperty(key) && !translations[langCode].hasOwnProperty(key)) {
        translations[langCode][key] = translations.en[key];
      }
    }
  });

  const langSelect = document.getElementById('lang-select');
  const elementsToTranslate = document.querySelectorAll('[data-i18n]');

  function setLanguage(lang) {
    currentLang = lang;
    const effectiveTranslations = translations[lang] || translations['en'];
    document.documentElement.lang = lang;

    document.documentElement.dir = lang === 'ar' || lang === 'hi' ? 'rtl' : 'ltr';

    elementsToTranslate.forEach((element) => {
      const key = element.dataset.i18n;
      let translationText =
        effectiveTranslations[key] || translations['en'][key] || `Missing: ${key}`;

      if (translationText !== undefined) {
        if (element.tagName === 'META') {
          element.setAttribute('content', translationText);
        } else if (element.hasAttribute('data-i18n-aria-label')) {
          element.setAttribute('aria-label', translationText);
        } else if (element.hasAttribute('data-i18n-alt')) {
          element.setAttribute('alt', translationText);
        } else {
          element.innerHTML = translationText;
        }
      }
    });
    document.title = effectiveTranslations['page_title'] || translations['en']['page_title'];
    localStorage.setItem('burniLang', lang);
    if (typeof fetchLivePrices === 'function') {
      fetchLivePrices();
    }

    if (
      supplyChartInstance &&
      effectiveTranslations.kpi_circulating_supply &&
      effectiveTranslations.kpi_max_supply
    ) {
      const supplyValue =
        typeof prices !== 'undefined' && prices && prices.burni && prices.burni.circulatingSupply
          ? prices.burni.circulatingSupply
          : fallbackPrices.burni.circulatingSupply;
      supplyChartInstance.data.labels[0] = `${effectiveTranslations.kpi_circulating_supply} (${new Intl.NumberFormat(locales[currentLang] || 'en-US', { maximumFractionDigits: 1 }).format(supplyValue / 1000)}K)`;
      supplyChartInstance.data.labels[1] = effectiveTranslations.kpi_max_supply;
      supplyChartInstance.update();
    }
    if (
      scheduleChartInstance &&
      effectiveTranslations.schedule_chart_label &&
      effectiveTranslations.schedule_chart_y_axis &&
      effectiveTranslations.schedule_chart_x_axis
    ) {
      scheduleChartInstance.data.datasets[0].label = effectiveTranslations.schedule_chart_label;
      scheduleChartInstance.options.scales.y.title.text =
        effectiveTranslations.schedule_chart_y_axis;
      scheduleChartInstance.options.scales.x.title.text =
        effectiveTranslations.schedule_chart_x_axis;
      scheduleChartInstance.update();
    }
    if (athAtlChartInstance && effectiveTranslations.market_data_title) {
      if (athAtlChartInstance.options.plugins.title) {
        athAtlChartInstance.options.plugins.title.text = effectiveTranslations.market_data_title;
      }
      athAtlChartInstance.update();
    }
    const schedule = generateSchedule('2025-06-01', 500000, 260, currentLang, translations);
    renderScheduleTable(schedule, currentLang);
  }

  if (langSelect) {
    const browserLang = navigator.language.split('-')[0];
    const storedLang = localStorage.getItem('burniLang');
    let initialLang = 'en';

    if (storedLang && translations[storedLang] && translations[storedLang].page_title) {
      initialLang = storedLang;
    } else if (translations[browserLang] && translations[browserLang].page_title) {
      initialLang = browserLang;
    }

    langSelect.value = initialLang;
    setLanguage(initialLang);

    langSelect.addEventListener('change', (event) => {
      setLanguage(event.target.value);
    });
  }

  let faqSearchTimeout;
  const faqSearch = document.getElementById('faq-search');
  if (faqSearch) {
    faqSearch.addEventListener('input', () => {
      clearTimeout(faqSearchTimeout);
      faqSearchTimeout = setTimeout(() => {
        const query = faqSearch.value.toLowerCase().trim();
        document.querySelectorAll('#faq .section-card').forEach((card) => {
          const question = card.querySelector('h3')?.textContent.toLowerCase() || '';
          const answer = card.querySelector('p')?.textContent.toLowerCase() || '';
          card.style.display =
            question.includes(query) || answer.includes(query) ? 'block' : 'none';
        });
      }, 300);
    });
  }

  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      backToTopBtn.classList.toggle('hidden', window.scrollY < 300);
    });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
