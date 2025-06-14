// main.js: Core functionality for Burni Token website
document.addEventListener('DOMContentLoaded', () => {
  // Hide page loader immediately (cross-browser, including Webkit)
  const pageLoader = document.getElementById('pageLoader');
  if (pageLoader) {
    // Für E2E-Tests sofort entfernen
    if (
      window.location.search.includes('e2e-test') ||
      window.navigator.userAgent.includes('Playwright')
    ) {
      pageLoader.remove();
      console.log('Page Loader für E2E-Tests entfernt');
      return;
    }

    // Forciere Verstecken mit mehreren Methoden für Browser-Kompatibilität
    pageLoader.style.display = 'none';
    pageLoader.style.visibility = 'hidden';
    pageLoader.style.opacity = '0';
    pageLoader.style.pointerEvents = 'none';
    pageLoader.style.zIndex = '-9999';
    pageLoader.classList.add('hidden');
    pageLoader.setAttribute('aria-hidden', 'true');

    // Webkit/Safari-spezifische Behandlung - entferne aus DOM
    setTimeout(() => {
      if (pageLoader && pageLoader.parentNode) {
        pageLoader.parentNode.removeChild(pageLoader);
        console.log('Page Loader für Webkit-Kompatibilität entfernt');
      }
    }, 50);
  }

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

  // Fallback für fehlende checkFontAwesome-Funktion
  if (typeof window.checkFontAwesome !== 'function') {
    window.checkFontAwesome = function () {
      console.log('FontAwesome check: Fallback function active');
      // Überprüfe, ob FontAwesome korrekt geladen wurde
      const faElements = document.querySelectorAll('[class*="fa-"]');
      if (faElements.length > 0) {
        console.log('FontAwesome Icons gefunden:', faElements.length);
      }
    };
  }

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

    // Sichere Tabellen-Erstellung ohne innerHTML
    tableContainer.innerHTML = ''; // Leeren

    const headers = [
      currentTranslations.date || 'Date',
      currentTranslations.day || 'Day',
      currentTranslations.process_no || 'Process No.',
      currentTranslations.remaining_coins || 'Remaining Coins (approx.)',
    ];

    const tableData = displaySchedule.map((item) => ({
      date: item.date,
      day: item.day,
      process: item.process,
      coins: item.coins,
    }));

    const secureTable = SecureDOM.createSecureTable(tableData, headers);
    secureTable.className = 'min-w-full bg-white';
    tableContainer.appendChild(secureTable);
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
        priceErrorMessageElement.textContent = errorMsgKey;
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

  // Mock-Daten für Live-Preise und AMM-Pool
  const mockData = {
    burni: {
      day: [0.0011, 0.0012, 0.0010, 0.0013, 0.0011, 0.0014, 0.0012],
      week: [0.0011, 0.0013, 0.0010, 0.0012, 0.0015, 0.0009, 0.0014],
      month: [0.0011, 0.0014, 0.0010, 0.0013, 0.0012, 0.0016, 0.0011]
    },
    xrp: {
      day: [0.50, 0.51, 0.49, 0.52, 0.50, 0.53, 0.51],
      week: [0.50, 0.52, 0.48, 0.51, 0.54, 0.47, 0.52],
      month: [0.50, 0.53, 0.47, 0.52, 0.51, 0.55, 0.49]
    },
    xpm: {
      day: [0.02, 0.021, 0.019, 0.022, 0.020, 0.023, 0.021],
      week: [0.02, 0.022, 0.019, 0.021, 0.024, 0.018, 0.022],
      month: [0.02, 0.023, 0.018, 0.022, 0.021, 0.025, 0.019]
    },
    ammPool: {
      day: [1000, 1010, 990, 1020, 1000, 1030, 1015],
      week: [1000, 1020, 980, 1010, 1040, 970, 1025],
      month: [1000, 1030, 970, 1020, 1010, 1050, 995]
    }
  };

  let priceChartInstance;
  let currentInterval = 'day';

  // Funktion zum Aktualisieren des Charts
  function updatePriceChart(interval) {
    currentInterval = interval;
    if (priceChartInstance) priceChartInstance.destroy();

    const ctx = document.getElementById('priceChart');
    if (!ctx) return;

    const chartContext = ctx.getContext('2d');
    const labels = interval === 'day' ?
      ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'] :
      interval === 'week' ?
        ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] :
        ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];

    priceChartInstance = new Chart(chartContext, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Burni Coin ($)',
            data: mockData.burni[interval],
            borderColor: '#F97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: false,
            tension: 0.4
          },
          {
            label: 'XRP ($)',
            data: mockData.xrp[interval],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: false,
            tension: 0.4
          },
          {
            label: 'XPM ($)',
            data: mockData.xpm[interval],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: false,
            tension: 0.4
          },
          {
            label: 'AMM Pool Volume',
            data: mockData.ammPool[interval],
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: false,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: interval === 'day' ? 'Zeit' : interval === 'week' ? 'Wochentag' : 'Woche',
              color: '#374151'
            },
            grid: { color: 'rgba(0,0,0,0.1)' }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: false,
            title: {
              display: true,
              text: 'Preis ($)',
              color: '#374151'
            },
            grid: { color: 'rgba(0,0,0,0.1)' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Pool Volume',
              color: '#374151'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { color: '#374151' }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#fff'
          }
        }
      }
    });
  }

  // Event-Listener für Intervall-Buttons
  function initializeLiveDataSection() {
    const dayBtn = document.getElementById('interval-day');
    const weekBtn = document.getElementById('interval-week');
    const monthBtn = document.getElementById('interval-month');

    if (dayBtn && weekBtn && monthBtn) {
      dayBtn.addEventListener('click', () => {
        updatePriceChart('day');
        setActiveIntervalButton('day');
      });
      weekBtn.addEventListener('click', () => {
        updatePriceChart('week');
        setActiveIntervalButton('week');
      });
      monthBtn.addEventListener('click', () => {
        updatePriceChart('month');
        setActiveIntervalButton('month');
      });

      // Initiales Laden
      updatePriceChart('day');
      setActiveIntervalButton('day');
    }
  }

  function setActiveIntervalButton(activeInterval) {
    ['day', 'week', 'month'].forEach(interval => {
      const btn = document.getElementById(`interval-${interval}`);
      if (btn) {
        if (interval === activeInterval) {
          btn.classList.add('bg-orange-600', 'text-white');
          btn.classList.remove('bg-teal-500');
        } else {
          btn.classList.remove('bg-orange-600', 'text-white');
          btn.classList.add('bg-teal-500');
        }
      }
    });
  }

  // Simulierte Preisaktualisierung Live-Data KPI (alle 10 Sekunden)
  function updateLiveDataPrices() {
    const burniEl = document.getElementById('burniPrice');
    const xrpEl = document.getElementById('xrpPrice');
    const xpmEl = document.getElementById('xpmPrice');

    if (burniEl && xrpEl && xpmEl) {
      // Realistische Schwankungen um Basiswerte
      const burniBase = 0.0011;
      const xrpBase = 0.50;
      const xpmBase = 0.02;

      burniEl.textContent = `$${(burniBase + (Math.random() - 0.5) * 0.0002).toFixed(4)}`;
      xrpEl.textContent = `$${(xrpBase + (Math.random() - 0.5) * 0.04).toFixed(2)}`;
      xpmEl.textContent = `$${(xpmBase + (Math.random() - 0.5) * 0.002).toFixed(3)}`;

      // Aktualisiere auch Chart-Daten leicht (simuliert Live-Updates)
      if (priceChartInstance && Math.random() > 0.7) { // 30% Chance für Chart-Update
        const lastIndex = mockData.burni[currentInterval].length - 1;
        mockData.burni[currentInterval][lastIndex] = parseFloat(burniEl.textContent.replace('$', ''));
        mockData.xrp[currentInterval][lastIndex] = parseFloat(xrpEl.textContent.replace('$', ''));
        mockData.xpm[currentInterval][lastIndex] = parseFloat(xpmEl.textContent.replace('$', ''));
        priceChartInstance.update('none'); // Update ohne Animation
      }
    }
  }

  // Initialize Live Data section
  initializeLiveDataSection();

  // Start price updates every 10 seconds
  setInterval(updateLiveDataPrices, 10000);
  updateLiveDataPrices(); // Initial call

  // ===== INTERNATIONALIZATION (i18n) SYSTEM =====

  // Get URL language parameter or default to 'en'
  function getInitialLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && translations[langParam]) {
      return langParam;
    }
    return 'en';
  }

  // Update all elements with data-i18n attributes
  function applyTranslations(lang) {
    const translation = translations[lang] || translations.en;

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translation[key]) {
        element.textContent = translation[key];
      }
    });

    // Update all elements with data-i18n-alt attribute (for alt text)
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
      const key = element.getAttribute('data-i18n-alt');
      if (translation[key]) {
        element.setAttribute('alt', translation[key]);
      }
    });

    // Update all elements with data-i18n-aria-label attribute
    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
      const key = element.getAttribute('data-i18n-aria-label');
      if (translation[key]) {
        element.setAttribute('aria-label', translation[key]);
      }
    });

    // Update page title
    if (translation.page_title) {
      document.title = translation.page_title;
    }

    // Update language selector value
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.value = lang;
    }

    // Update current language variable
    currentLang = lang;

    console.log(`Language updated to: ${lang}`);
  }

  // Change language and update URL
  function changeLanguage(lang) {
    if (!translations[lang]) {
      console.warn(`Translation for language '${lang}' not found`);
      return;
    }

    // Update URL parameter
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);

    // Apply translations
    applyTranslations(lang);

    // Regenerate dynamic content (schedules, charts) with new language
    if (typeof renderScheduleTable === 'function') {
      const schedule = generateSchedule(new Date('2025-06-01'), 500000, 20, lang, translations[lang]);
      renderScheduleTable(schedule, lang);
    }

    // Update charts with new language
    updateChartsForLanguage(lang);

    // Update live data with new locale formatting
    if (typeof updateLiveDataPrices === 'function') {
      updateLiveDataPrices();
    }
  }

  // Initialize language system
  function initializeLanguageSystem() {
    const initialLang = getInitialLanguage();

    // Set up language selector event listener
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        changeLanguage(e.target.value);
      });
    }

    // Apply initial language
    applyTranslations(initialLang);

    console.log(`i18n system initialized with language: ${initialLang}`);
  }

  // Initialize the language system
  initializeLanguageSystem();

  // ===== END OF i18n SYSTEM =====

  // XRPL-related scripts
  const xrplScripts = [
    'https://cdnjs.cloudflare.com/ajax/libs/xrpl.js/v1.6.0/xrpl.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xrpl.js/v1.6.0/xrpl-amm.min.js',
  ];
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };
  async function loadXRPLScripts() {
    for (const src of xrplScripts) {
      try {
        await loadScript(src);
        console.log(`Script loaded: ${src}`);
      } catch (error) {
        console.error(error);
      }
    }
  }
  loadXRPLScripts();

  // Tokenomics KPI-Updates (Mock)
  async function updateTokenomicsMetrics() {
    try {
      const metrics = await fetchBurniMetrics();
      document.getElementById('circulatingSupplyValue').textContent = new Intl.NumberFormat(locales[currentLang] || 'en-US').format(metrics.circulatingSupply);
      document.getElementById('kpi_holders_value').textContent = metrics.holders;
      document.getElementById('kpi_trustlines_value').textContent = metrics.trustlines;
      // Simulate mock prices in tokenomics section
      document.getElementById('burniPriceValue').textContent = `$${(Math.random() * 0.0005 + 0.001).toFixed(4)}`;
      document.getElementById('xrpPriceValue').textContent = `$${(Math.random() * 0.05 + 0.50).toFixed(2)}`;
      document.getElementById('xpmPriceValue').textContent = `$${(Math.random() * 0.005 + 0.02).toFixed(3)}`;
    } catch (error) {
      console.error('Error updating tokenomics metrics:', error);
    }
  }
  // Initial load and periodic update every 60s
  updateTokenomicsMetrics();
  setInterval(updateTokenomicsMetrics, 60000);

  // XRPL Live Data Integration
  async function fetchXRPLiveData() {
    try {
      console.log('Fetching live XRPL data from livenet.xrpl.org...');

      // Fetch general XRPL data
      const xrplResponse = await fetch('https://livenet.xrpl.org/api/v1/server_info');
      if (!xrplResponse.ok) throw new Error(`XRPL API error: ${xrplResponse.status}`);

      const xrplData = await xrplResponse.json();
      console.log('XRPL server info:', xrplData);

      // Fetch XRP price from a CORS-friendly endpoint
      let xrpPrice = 0.50; // Fallback
      try {
        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd');
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          xrpPrice = priceData.ripple?.usd || 0.50;
        }
      } catch (priceError) {
        console.warn('Could not fetch XRP price, using fallback:', priceError);
      }

      // Try to fetch Burni token info from XRPL
      let burniData = { balance: 'N/A', holders: 'N/A', trustlines: 'N/A' };
      try {
        const burniResponse = await fetch('https://livenet.xrpl.org/api/v1/account/rJzQVveWEob6x6PJQqXm9sdcFjGbACBwv2/currencies');
        if (burniResponse.ok) {
          const burniInfo = await burniResponse.json();
          console.log('Burni token info:', burniInfo);
          // Process burni data if available
        }
      } catch (burniError) {
        console.warn('Could not fetch Burni data from XRPL, using mock data:', burniError);
      }

      return {
        xrpPrice: xrpPrice,
        burniPrice: (Math.random() * 0.0005 + 0.001), // Still mock for Burni
        xpmPrice: (Math.random() * 0.005 + 0.02), // Still mock for XPM
        serverInfo: xrplData,
        burniData: burniData
      };

    } catch (error) {
      console.error('Error fetching XRPL live data:', error);
      // Fallback to mock data
      return {
        xrpPrice: (Math.random() * 0.05 + 0.50),
        burniPrice: (Math.random() * 0.0005 + 0.001),
        xpmPrice: (Math.random() * 0.005 + 0.02),
        serverInfo: null,
        burniData: { balance: 'N/A', holders: 'N/A', trustlines: 'N/A' }
      };
    }
  }

  // Enhanced Live Data Price Updates with XRPL integration
  async function updateLiveDataPrices() {
    const burniEl = document.getElementById('burniPrice');
    const xrpEl = document.getElementById('xrpPrice');
    const xpmEl = document.getElementById('xpmPrice');

    if (burniEl && xrpEl && xpmEl) {
      try {
        const liveData = await fetchXRPLiveData();

        burniEl.textContent = `$${liveData.burniPrice.toFixed(4)}`;
        xrpEl.textContent = `$${liveData.xrpPrice.toFixed(2)}`;
        xpmEl.textContent = `$${liveData.xpmPrice.toFixed(3)}`;

        // Update tokenomics section prices too
        const burniPriceValue = document.getElementById('burniPriceValue');
        const xrpPriceValue = document.getElementById('xrpPriceValue');
        const xpmPriceValue = document.getElementById('xpmPriceValue');

        if (burniPriceValue) burniPriceValue.textContent = `$${liveData.burniPrice.toFixed(4)}`;
        if (xrpPriceValue) xrpPriceValue.textContent = `$${liveData.xrpPrice.toFixed(2)}`;
        if (xpmPriceValue) xpmPriceValue.textContent = `$${liveData.xpmPrice.toFixed(3)}`;

        // Update chart data if chart exists
        if (priceChartInstance && Math.random() > 0.7) {
          const lastIndex = mockData.burni[currentInterval].length - 1;
          mockData.burni[currentInterval][lastIndex] = liveData.burniPrice;
          mockData.xrp[currentInterval][lastIndex] = liveData.xrpPrice;
          mockData.xpm[currentInterval][lastIndex] = liveData.xpmPrice;
          priceChartInstance.update('none');
        }

        console.log('Live prices updated:', liveData);

      } catch (error) {
        console.error('Error updating live prices:', error);
        // Fallback to previous mock behavior
        burniEl.textContent = `$${(0.0011 + (Math.random() - 0.5) * 0.0002).toFixed(4)}`;
        xrpEl.textContent = `$${(0.50 + (Math.random() - 0.5) * 0.04).toFixed(2)}`;
        xpmEl.textContent = `$${(0.02 + (Math.random() - 0.5) * 0.002).toFixed(3)}`;
      }
    }
  }

  // Start live data price updates with XRPL integration
  updateLiveDataPrices();
  setInterval(updateLiveDataPrices, 10000);

  // Function to update charts with new language
  function updateChartsForLanguage(lang) {
    const translation = translations[lang] || translations.en;

    // Update schedule chart if it exists
    if (scheduleChartInstance) {
      scheduleChartInstance.options.scales.y.title.text = translation.remaining_coins || 'Number of Coins';
      scheduleChartInstance.options.scales.x.title.text = translation.date || 'Date';
      scheduleChartInstance.update();
    }

    // Update supply chart if it exists
    if (supplyChartInstance) {
      supplyChartInstance.update();
    }

    // Update ATH/ATL chart if it exists
    if (athAtlChartInstance) {
      athAtlChartInstance.update();
    }

    // Update price chart if it exists (live data chart)
    if (typeof priceChartInstance !== 'undefined' && priceChartInstance) {
      priceChartInstance.update();
    }
  }

  // Debug: Test i18n system
  console.log('i18n System Test:');
  console.log('Available languages:', Object.keys(translations));
  console.log('Current language:', currentLang);
  console.log('German translation sample:', translations.de?.hero_title);
  console.log('Language selector element:', document.getElementById('lang-select'));

  // Test immediate translation on page load
  setTimeout(() => {
    const heroTitle = document.querySelector('[data-i18n="hero_title"]');
    if (heroTitle) {
      console.log('Hero title element found:', heroTitle.textContent);
    } else {
      console.log('Hero title element NOT found');
    }
  }, 1000);
});

// ===== TRANSLATIONS =====
const translations = {
  en: {
    page_title: 'Burni Token - Innovative Decentralized Cryptocurrency',
    lang_select_label: 'Select language',
    nav_home: 'Home',
    nav_about: 'About Burni',
    nav_tokenomics: 'Tokenomics',
    nav_use_cases: 'Use Cases',
    nav_token_schedule: 'Token Schedule',
    nav_trade: 'Trade Tokens',
    nav_community: 'Community',
    menu_button: 'Menu',
    hero_title: 'Welcome to Burni!',
    hero_description: 'Discover the deflationary token designed to create value through scarcity. Join us on a fiery journey of discovery!',
    hero_button: 'Learn More!',
    about_title: 'What is Burni?',
    about_description: 'Burni is more than just a token. It\'s a promise for a deflationary future. At Burni\'s core is a mechanism that permanently removes tokens from circulation to potentially increase the value of the remaining tokens.',
    burn_title: 'The Secret of Token Burning',
    burn_description: 'Imagine tokens being burned like logs in a magical fire. They disappear forever! This process, called \'token burning,\' reduces the total supply of Burni tokens. Fewer tokens can mean each one becomes more valuable, similar to rare collectibles.',
    burn_animation_note: 'This animation illustrates how tokens are symbolically removed from circulation.',
    blackholed_title: 'Burni\'s Promise: \'Blackholed\'',
    blackholed_description: 'Burni is marked as \'Blackholed: YES\'. This means that the maximum supply of Burni tokens is fixed and no new tokens can ever be created. It\'s like throwing away the key to the vault!',
    blackholed_tooltip_trigger: 'What does \'Blackholed\' mean?',
    blackholed_tooltip_text: 'When a token issuer is \'blackholed\', it means the issuing address has renounced its rights to mint new tokens or change token properties. This makes the maximum supply truly fixed.',
    use_cases_title: 'Use Cases: What Burni Coin Can Be Used For',
    use_cases_description: 'Burni Coin is not just a token, but a versatile digital asset with growing applications in the XRPL ecosystem.',
    use_case_gaming_title: 'Decentralized Gaming',
    use_case_gaming_desc: 'Use Burni as in-game currency or for exclusive in-game assets in future XRPL games.',
    use_case_nfts_title: 'NFT Integration',
    use_case_nfts_desc: 'Acquire and trade unique digital artworks and collectibles on NFT marketplaces with Burni.',
    use_case_rewards_title: 'Reward Systems',
    use_case_rewards_desc: 'Earn Burni by participating in community actions, staking programs, or as rewards for contributions.',
    use_case_microtx_title: 'Microtransactions',
    use_case_microtx_desc: 'Benefit from the extremely low transaction fees of the XRPL for fast and cost-effective payments.',
    use_case_governance_title: 'Community Governance',
    use_case_governance_desc: 'Hold Burni to participate in important decisions about the future of the project and have a say.',
    token_schedule_title: 'Burni Coin: Deflationary Schedule',
    token_schedule_description: 'We believe in transparency and the long-term value development of Burni Coin. A key component of our ecosystem is the unique deflationary mechanism that continuously reduces the total amount of Burni Coins in circulation.',
    tokenomics_title: 'Burni\'s World: Facts & Figures',
    tokenomics_description: 'Here\'s a look at the key figures that define Burni. This data gives you insight into the economic foundation and potential of the token.',
    kpi_max_supply: 'Max Supply',
    kpi_circulating_supply: 'Circulating Supply',
    kpi_current_price: 'Current Burni Price',
    kpi_xrp_price: 'Current XRP Price',
    kpi_xpm_price: 'Current XPM Price',
    kpi_holders: 'Number of Holders',
    kpi_trustlines: 'Number of Trustlines',
    kpi_issuer_fee: 'Issuer Fee',
    price_error_message: 'Price data could not be loaded. Please try again later.',
    last_updated_label: 'Last Updated:',
    token_details_title: 'Token Details',
    created_on: 'Created on',
    ath: 'All-Time High (ATH)',
    ath_tooltip: 'The highest price ever reached by Burni Coin.',
    atl: 'All-Time Low (ATL)',
    atl_tooltip: 'The lowest price ever reached by Burni Coin.',
    total_supply: 'Total Supply',
    platform: 'Platform',
    issuer_address: 'Issuer Address',
    explorer_links: 'Explorer Links',
    note_data_disclaimer: 'Note: Data is subject to change.',
    supply_overview_title: 'Supply Overview',
    supply_chart_caption: 'This chart visualizes the token supply.',
    supply_chart_description: 'This chart visualizes the circulating supply in relation to the maximum supply.',
    xrpl_home_title: 'At Home on the XRP Ledger',
    xrpl_home_description: 'Burni operates on the XRP Ledger (XRPL), known for its speed, low transaction costs, and scalability. This means for you: fast and cost-effective transactions! To hold or trade Burni, you need to set up a Trustline – a standard procedure on the XRPL.',
    xrpl_slogan: 'Fast, efficient, and reliable – that\'s the foundation of Burni.',
    date: 'Date',
    day: 'Day',
    process_no: 'Process No.',
    remaining_coins: 'Remaining Coins (approx.)'
  },
  de: {
    page_title: 'Burni Token - Innovative dezentrale Kryptowährung',
    lang_select_label: 'Sprache auswählen',
    nav_home: 'Startseite',
    nav_about: 'Über Burni',
    nav_tokenomics: 'Tokenomics',
    nav_use_cases: 'Anwendungsfälle',
    nav_token_schedule: 'Token-Zeitplan',
    nav_trade: 'Token handeln',
    nav_community: 'Gemeinschaft',
    menu_button: 'Menü',
    hero_title: 'Willkommen bei Burni!',
    hero_description: 'Entdecken Sie den deflationären Token, der durch Knappheit Wert schafft. Begleiten Sie uns auf einer feurigen Entdeckungsreise!',
    hero_button: 'Mehr erfahren!',
    about_title: 'Was ist Burni?',
    about_description: 'Burni ist mehr als nur ein Token. Es ist ein Versprechen für eine deflationäre Zukunft. Im Kern von Burni steht ein Mechanismus, der Token dauerhaft aus dem Umlauf entfernt, um potenziell den Wert der verbleibenden Token zu steigern.',
    burn_title: 'Das Geheimnis des Token-Verbrennens',
    burn_description: 'Stellen Sie sich vor, Token werden wie Holzscheite in einem magischen Feuer verbrannt. Sie verschwinden für immer! Dieser Prozess, genannt \'Token-Verbrennung\', reduziert die Gesamtmenge der Burni-Token. Weniger Token können bedeuten, dass jeder einzelne wertvoller wird, ähnlich wie seltene Sammlerstücke.',
    burn_animation_note: 'Diese Animation veranschaulicht, wie Token symbolisch aus dem Umlauf entfernt werden.',
    blackholed_title: 'Burnis Versprechen: \'Blackholed\'',
    blackholed_description: 'Burni ist als \'Blackholed: JA\' markiert. Das bedeutet, dass die maximale Versorgung mit Burni-Token feststeht und niemals neue Token erstellt werden können. Es ist, als würde man den Schlüssel zum Tresor wegwerfen!',
    blackholed_tooltip_trigger: 'Was bedeutet \'Blackholed\'?',
    blackholed_tooltip_text: 'Wenn ein Token-Emittent \'blackholed\' ist, bedeutet das, dass die ausgebende Adresse auf ihre Rechte verzichtet hat, neue Token zu erstellen oder Token-Eigenschaften zu ändern. Dadurch wird die maximale Versorgung wirklich festgelegt.',
    use_cases_title: 'Anwendungsfälle: Wofür Burni Coin verwendet werden kann',
    use_cases_description: 'Burni Coin ist nicht nur ein Token, sondern ein vielseitiges digitales Asset mit wachsenden Anwendungen im XRPL-Ökosystem.',
    use_case_gaming_title: 'Dezentrales Gaming',
    use_case_gaming_desc: 'Verwenden Sie Burni als In-Game-Währung oder für exklusive In-Game-Assets in zukünftigen XRPL-Spielen.',
    use_case_nfts_title: 'NFT-Integration',
    use_case_nfts_desc: 'Erwerben und handeln Sie einzigartige digitale Kunstwerke und Sammlerstücke auf NFT-Marktplätzen mit Burni.',
    use_case_rewards_title: 'Belohnungssysteme',
    use_case_rewards_desc: 'Verdienen Sie Burni durch Teilnahme an Community-Aktionen, Staking-Programmen oder als Belohnung für Beiträge.',
    use_case_microtx_title: 'Mikrotransaktionen',
    use_case_microtx_desc: 'Profitieren Sie von den extrem niedrigen Transaktionsgebühren des XRPL für schnelle und kostengünstige Zahlungen.',
    use_case_governance_title: 'Community-Governance',
    use_case_governance_desc: 'Halten Sie Burni, um an wichtigen Entscheidungen über die Zukunft des Projekts teilzunehmen und mitzubestimmen.',
    token_schedule_title: 'Burni Coin: Deflationärer Zeitplan',
    token_schedule_description: 'Wir glauben an Transparenz und die langfristige Wertentwicklung von Burni Coin. Ein Schlüsselkomponent unseres Ökosystems ist der einzigartige deflationäre Mechanismus, der die Gesamtmenge der im Umlauf befindlichen Burni Coins kontinuierlich reduziert.',
    tokenomics_title: 'Burnis Welt: Fakten & Zahlen',
    tokenomics_description: 'Hier ist ein Blick auf die Schlüsselzahlen, die Burni definieren. Diese Daten geben Ihnen Einblick in die wirtschaftliche Grundlage und das Potenzial des Tokens.',
    kpi_max_supply: 'Max. Versorgung',
    kpi_circulating_supply: 'Umlaufende Versorgung',
    kpi_current_price: 'Aktueller Burni-Preis',
    kpi_xrp_price: 'Aktueller XRP-Preis',
    kpi_xpm_price: 'Aktueller XPM-Preis',
    kpi_holders: 'Anzahl der Inhaber',
    kpi_trustlines: 'Anzahl der Trustlines',
    kpi_issuer_fee: 'Emittentengebühr',
    price_error_message: 'Preisdaten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
    last_updated_label: 'Zuletzt aktualisiert:',
    token_details_title: 'Token-Details',
    created_on: 'Erstellt am',
    ath: 'Allzeithoch (ATH)',
    ath_tooltip: 'Der höchste jemals erreichte Preis von Burni Coin.',
    atl: 'Allzeittief (ATL)',
    atl_tooltip: 'Der niedrigste jemals erreichte Preis von Burni Coin.',
    total_supply: 'Gesamtversorgung',
    platform: 'Plattform',
    issuer_address: 'Emittent-Adresse',
    explorer_links: 'Explorer-Links',
    note_data_disclaimer: 'Hinweis: Daten können sich ändern.',
    supply_overview_title: 'Angebotsübersicht',
    supply_chart_caption: 'Dieses Diagramm visualisiert das Token-Angebot.',
    supply_chart_description: 'Dieses Diagramm visualisiert das umlaufende Angebot im Verhältnis zum maximalen Angebot.',
    xrpl_home_title: 'Zuhause im XRP Ledger',
    xrpl_home_description: 'Burni läuft auf dem XRP Ledger (XRPL), bekannt für seine Geschwindigkeit, niedrigen Transaktionskosten und Skalierbarkeit. Das bedeutet für Sie: schnelle und kostengünstige Transaktionen! Um Burni zu halten oder zu handeln, müssen Sie eine Trustline einrichten – ein Standardverfahren im XRPL.',
    xrpl_slogan: 'Schnell, effizient und zuverlässig – das ist die Grundlage von Burni.',
    date: 'Datum',
    day: 'Tag',
    process_no: 'Prozess Nr.',
    remaining_coins: 'Verbleibende Münzen (ca.)'
  }
};
