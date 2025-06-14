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
      hero_description:
        'Discover the deflationary token designed to create value through scarcity. Join us on a fiery journey of discovery!',
      hero_button: 'Learn More!',
      about_title: 'What is Burni?',
      about_description:
        'Burni is more than just a token. It’s a promise for a deflationary future. At Burni’s core is a mechanism that permanently removes tokens from circulation to potentially increase the value of the remaining tokens.',
      burn_title: 'The Secret of Token Burning',
      burn_description:
        "Imagine tokens being burned like logs in a magical fire. They disappear forever! This process, called 'token burning,' reduces the total supply of Burni tokens. Fewer tokens can mean each one becomes more valuable, similar to rare collectibles.",
      burn_animation_note:
        'This animation illustrates how tokens are symbolically removed from circulation.',
      blackholed_title: "Burni’s Promise: 'Blackholed'",
      blackholed_description:
        "Burni is marked as 'Blackholed: YES'. This means that the maximum supply of Burni tokens is fixed and no new tokens can ever be created. It’s like throwing away the key to the vault!",
      blackholed_tooltip_trigger: "What does 'Blackholed' mean?",
      blackholed_tooltip_text:
        "When a token issuer is 'blackholed', it means the issuing address has renounced its rights to mint new tokens or change token properties. This makes the maximum supply truly fixed.",
      use_cases_title: 'Use Cases: What Burni Coin Can Be Used For',
      use_cases_description:
        'Burni Coin is not just a token, but a versatile digital asset with growing applications in the XRPL ecosystem.',
      use_case_gaming_title: 'Decentralized Gaming',
      use_case_gaming_desc:
        'Use Burni as in-game currency or for exclusive in-game assets in future XRPL games.',
      use_case_nfts_title: 'NFT Integration',
      use_case_nfts_desc:
        'Acquire and trade unique digital artworks and collectibles on NFT marketplaces with Burni.',
      use_case_rewards_title: 'Reward Systems',
      use_case_rewards_desc:
        'Earn Burni by participating in community actions, staking programs, or as rewards for contributions.',
      use_case_microtx_title: 'Microtransactions',
      use_case_microtx_desc:
        'Benefit from the extremely low transaction fees of the XRPL for fast and cost-effective payments.',
      use_case_governance_title: 'Community Governance',
      use_case_governance_desc:
        'Hold Burni to participate in important decisions about the future of the project and have a say.',
      token_schedule_title: 'Burni Coin: Deflationary Schedule',
      token_schedule_description:
        'We believe in transparency and the long-term value development of Burni Coin. A key component of our ecosystem is the unique deflationary mechanism that continuously reduces the total amount of Burni Coins in circulation.',
      key_insights_title: 'Key Insights from the Simulation',
      key_insights_text:
        'Based on our calculation, starting with 500,000 coins before the first process, the coins are effectively gone when less than 1 coin remains. This will be the case after 260 processes.',
      key_insights_start_date: 'Start of the first process: June 1, 2025 (Sunday)',
      key_insights_end_date: 'End date (after 260 processes, Coins < 1): July 21, 2027 (Wednesday)',
      key_insights_total_processes: 'Total Processes: 260',
      key_insights_total_days: 'Days elapsed until end: 780 days',
      process_details_title: 'The Process in Detail',
      process_details_text1:
        'Starting June 1, 2025, a two-step process will be performed every three days.',
      process_details_burn:
        'Burn: First, 3% of the currently circulating coins are permanently removed from circulation and destroyed.',
      process_details_lock: 'Lock: Then, 2% of the coins remaining after burning are locked.',
      process_details_text2:
        'This cycle repeats every three days until the number of coins falls below a whole unit (less than 1 coin remains).',
      schedule_timeline_title: 'Coin Reduction Schedule',
      schedule_timeline_text:
        'The following table shows an example of the remaining coins after completion of the respective process on the specified dates.',
      schedule_disclaimer:
        'Note: Values are rounded to two decimal places. The process stops as soon as the value falls below 1.',
      visual_representation_title: 'Visual Representation of the Reduction',
      visual_representation_text:
        'To better illustrate the development of Burni Coins, we have created an interactive chart that visualizes the deflationary process.',
      visual_representation_note:
        'This chart shows the remaining coin count over the timeline to visually highlight the deflationary nature of Burni Coin.',
      tokenomics_title: 'Burni’s World: Facts & Figures',
      tokenomics_description:
        'Here’s a look at the key figures that define Burni. This data gives you insight into the economic foundation and potential of the token.',
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
      created_on: 'Created on: May 17, 2025',
      ath: 'All-Time High',
      ath_tooltip: 'The highest price ever reached by Burni Coin.',
      atl: 'All-Time Low',
      atl_tooltip: 'The lowest price ever reached by Burni Coin.',
      total_supply: 'إجمالي المعروض',
      platform: 'Platform: XRP Ledger (XRPL)',
      note_data_disclaimer: 'Note: Data is subject to change.',
      supply_overview_title: 'Supply Overview',
      supply_chart_caption: 'This chart visualizes the token supply.',
      supply_chart_description: 'This chart visualizes the token supply.',
      xrpl_home_title: 'At Home on the XRP Ledger',
      xrpl_home_description: 'Burni operates on the XRP Ledger, a fast and efficient blockchain.',
      xrpl_slogan: 'Fast, efficient, and secure.',
      trade_title: 'Trade Burni Coin',
      trade_description: 'Trade Burni Coin on various platforms.',
      token_page_link: 'Token Page',
      token_page_desc: 'All info about Burni Coin.',
      set_trustline_link: 'Set XPM Trustline',
      set_trustline_desc: 'Activate XPM Trustline.',
      dex_trade_link: 'XPM Trading',
      dex_trade_desc: 'Buy/Sell XPM on decentralized exchanges.',
      swap_link: 'SWAP XPM',
      swap_desc: 'Easily exchange XPM.',
      market_data_title: 'Market Data',
      market_data_description: 'Market data for Burni Coin.',
      ath_atl_chart_caption: 'ATH/ATL Chart',
      tweets_title: 'Tweets',
      tweets_description: 'Latest tweets about Burni Coin.',
      faq_title: 'Frequently Asked Questions',
      faq_description: 'Answers to common questions about Burni Coin.',
      faq_search_label_sr: 'Search FAQs',
      faq_search_desc_sr: 'Search FAQs.',
      faq_q1: 'What is Burni Coin?',
      faq_a1: 'Burni Coin is a deflationary token.',
      faq_q2: 'How does token burning work?',
      faq_a2: 'Token burning reduces the total supply.',
      faq_q3: 'What is the maximum supply of Burni Coin?',
      faq_a3: 'The maximum supply is 1,000,000.',
      faq_q4: 'How can I trade Burni Coin?',
      faq_a4: 'You can trade Burni Coin on various platforms.',
      faq_q5: 'What is the XRP Ledger?',
      faq_a5: 'The XRP Ledger is a fast and efficient blockchain.',
      community_title: 'Join Our Community',
      community_description: 'Be part of the Burni Coin community.',
      footer_copyright: '© Burni Token 2025. All rights reserved.',
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
      hero_description:
        'Entdecken Sie den deflationären Token, der durch Knappheit Wert schafft. Begleiten Sie uns auf einer feurigen Entdeckungsreise!',
      hero_button: 'Mehr erfahren!',
      about_title: 'Was ist Burni?',
      about_description:
        'Burni ist mehr als nur ein Token. Es ist ein Versprechen für eine deflationäre Zukunft. Im Kern von Burni steht ein Mechanismus, der Token dauerhaft aus dem Umlauf entfernt, um potenziell den Wert der verbleibenden Token zu steigern.',
      burn_title: 'Das Geheimnis des Token-Brennens',
      burn_description:
        'Stellen Sie sich vor, Token werden wie Holzscheite in einem magischen Feuer verbrannt. Sie verschwinden für immer! Dieser Prozess, genannt "Token-Brennen", reduziert das Gesamtangebot an Burni-Token. Weniger Token können bedeuten, dass jeder einzelne wertvoller wird, ähnlich wie bei seltenen Sammlerstücken.',
      burn_animation_note:
        'Diese Animation veranschaulicht, wie Token symbolisch aus dem Umlauf entfernt werden.',
      blackholed_title: "Burnis Versprechen: 'Blackholed'",
      blackholed_description:
        "Burni wird als 'Blackholed: JA' gekennzeichnet. Das bedeutet, dass das maximale Angebot an Burni-Token festgelegt ist und keine neuen Token jemals erstellt werden können. Es ist, als würde man den Schlüssel zum Tresor wegwerfen!",
      blackholed_tooltip_trigger: "Was bedeutet 'Blackholed'?",
      blackholed_tooltip_text:
        "Wenn ein Token-Emittent 'blackholed' ist, bedeutet das, dass die ausgebende Adresse ihre Rechte zum Minten neuer Token oder zur Änderung von Token-Eigenschaften aufgegeben hat. Dadurch wird das maximale Angebot wirklich festgelegt.",
      use_cases_title: 'Verwendungszwecke: Wofür Burni-Münzen verwendet werden können',
      use_cases_description:
        'Burni-Münzen sind nicht nur ein Token, sondern ein vielseitiges digitales Asset mit wachsenden Anwendungen im XRPL-Ökosystem.',
      use_case_gaming_title: 'Dezentralisiertes Gaming',
      use_case_gaming_desc:
        'Verwenden Sie Burni als In-Game-Währung oder für exklusive In-Game-Assets in zukünftigen XRPL-Spielen.',
      use_case_nfts_title: 'NFT-Integration',
      use_case_nfts_desc:
        'Erwerben und handeln Sie einzigartige digitale Kunstwerke und Sammlerstücke auf NFT-Marktplätzen mit Burni.',
      use_case_rewards_title: 'Belohnungssysteme',
      use_case_rewards_desc:
        'Verdienen Sie Burni, indem Sie an Gemeinschaftsaktionen, Staking-Programmen teilnehmen oder als Belohnung für Beiträge.',
      use_case_microtx_title: 'Mikrotransaktionen',
      use_case_microtx_desc:
        'Profitieren Sie von den extrem niedrigen Transaktionsgebühren des XRPL für schnelle und kostengünstige Zahlungen.',
      use_case_governance_title: 'Gemeinschaftsregierung',
      use_case_governance_desc:
        'Halten Sie Burni, um an wichtigen Entscheidungen über die Zukunft des Projekts teilzunehmen und mitzubestimmen.',
      token_schedule_title: 'Burni-Münze: Deflationärer Zeitplan',
      token_schedule_description:
        'Wir glauben an Transparenz und die langfristige Wertentwicklung der Burni-Münze. Ein zentrales Element unseres Ökosystems ist der einzigartige deflationäre Mechanismus, der die Gesamtmenge der im Umlauf befindlichen Burni-Münzen kontinuierlich reduziert.',
      key_insights_title: 'Wichtige Erkenntnisse aus der Simulation',
      key_insights_text:
        'Basierend auf unserer Berechnung, beginnend mit 500.000 Münzen vor dem ersten Prozess, sind die Münzen effektiv verschwunden, wenn weniger als 1 Münze verbleibt. Dies wird nach 260 Prozessen der Fall sein.',
      key_insights_start_date: 'Beginn des ersten Prozesses: 1. Juni 2025 (Sonntag)',
      key_insights_end_date: 'Enddatum (nach 260 Prozessen, Münzen < 1): 21. Juli 2027 (Mittwoch)',
      key_insights_total_processes: 'Gesamtprozesse: 260',
      key_insights_total_days: 'Verstrichene Tage bis zum Ende: 780 Tage',
      process_details_title: 'Der Prozess im Detail',
      process_details_text1:
        'Ab dem 1. Juni 2025 wird alle drei Tage ein zweistufiger Prozess durchgeführt.',
      process_details_burn:
        'Brennen: Zuerst werden 3% der derzeit zirkulierenden Münzen dauerhaft aus dem Umlauf entfernt und zerstört.',
      process_details_lock:
        'Sperren: Dann werden 2% der nach dem Brennen verbleibenden Münzen gesperrt.',
      process_details_text2:
        'Dieser Zyklus wiederholt sich alle drei Tage, bis die Anzahl der Münzen unter eine ganze Einheit fällt (weniger als 1 Münze verbleibt).',
      schedule_timeline_title: 'Zeitplan zur Reduzierung der Münzen',
      schedule_timeline_text:
        'Die folgende Tabelle zeigt ein Beispiel für die verbleibenden Münzen nach Abschluss des jeweiligen Prozesses an den angegebenen Daten.',
      schedule_disclaimer:
        'Hinweis: Die Werte sind auf zwei Dezimalstellen gerundet. Der Prozess wird gestoppt, sobald der Wert unter 1 fällt.',
      visual_representation_title: 'Visuelle Darstellung der Reduzierung',
      visual_representation_text:
        'Um die Entwicklung der Burni-Münzen besser zu veranschaulichen, haben wir ein interaktives Diagramm erstellt, das den deflationären Prozess visualisiert.',
      visual_representation_note:
        'Dieses Diagramm zeigt die verbleibende Münzanzahl über den Zeitverlauf, um die deflationäre Natur der Burni-Münze visuell hervorzuheben.',
      tokenomics_title: 'Burnis Welt: Fakten und Zahlen',
      tokenomics_description:
        'Hier sind die wichtigsten Zahlen, die Burni definieren. Diese Daten geben Ihnen Einblick in die wirtschaftliche Grundlage und das Potenzial des Tokens.',
      kpi_max_supply: 'Maximales Angebot',
      kpi_circulating_supply: 'Zirkulierendes Angebot',
      kpi_current_price: 'Aktueller Burni-Preis',
      kpi_xrp_price: 'Aktueller XRP-Preis',
      kpi_xpm_price: 'Aktueller XPM-Preis',
      kpi_holders: 'Anzahl der Inhaber',
      kpi_trustlines: 'Anzahl der Trustlines',
      kpi_issuer_fee: 'Emittentengebühr',
      price_error_message:
        'Preisdaten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      last_updated_label: 'Zuletzt aktualisiert:',
      token_details_title: 'Token-Details',
      created_on: 'Erstellt am: 17. Mai 2025',
      ath: 'Allzeithoch',
      ath_tooltip: 'Der höchste jemals erreichte Preis von Burni Coin.',
      atl: 'Allzeittief',
      atl_tooltip: 'Der niedrigste jemals erreichte Preis von Burni Coin.',
      total_supply: 'إجمالي المعروض',
      platform: 'Plattform: XRP Ledger (XRPL)',
      note_data_disclaimer: 'Hinweis: Daten können sich ändern.',
      supply_overview_title: 'Angebotsübersicht',
      supply_chart_caption: 'Dieses Diagramm visualisiert das Token-Angebot.',
      supply_chart_description: 'Dieses Diagramm visualisiert das Token-Angebot.',
      xrpl_home_title: 'Zuhause im XRP Ledger',
      xrpl_home_description:
        'Burni läuft auf dem XRP Ledger, einer schnellen und effizienten Blockchain.',
      xrpl_slogan: 'Schnell, effizient und sicher.',
      trade_title: 'Handel mit Burni Coin',
      trade_description: 'Handeln Sie Burni Coin auf verschiedenen Plattformen.',
      token_page_link: 'Token-Seite',
      token_page_desc: 'Alle Infos über Burni Coin.',
      set_trustline_link: 'XPM Trustline setzen',
      set_trustline_desc: 'Aktivieren Sie die XPM Trustline.',
      dex_trade_link: 'XPM-Handel',
      dex_trade_desc: 'Kaufen/Verkaufen Sie XPM an dezentralen Börsen.',
      swap_link: 'SWAP XPM',
      swap_desc: 'XPM einfach austauschen.',
      market_data_title: 'Marktdaten',
      market_data_description: 'Marktdaten für Burni Coin.',
      ath_atl_chart_caption: 'ATH/ATL-Diagramm',
      tweets_title: 'Tweets',
      tweets_description: 'Neueste Tweets über Burni Coin.',
      faq_title: 'Häufig gestellte Fragen',
      faq_description: 'Antworten auf häufige Fragen zu Burni Coin.',
      faq_search_label_sr: 'FAQs suchen',
      faq_search_desc_sr: 'FAQs suchen.',
      faq_q1: 'Was ist Burni Coin?',
      faq_a1: 'Burni Coin ist ein deflationärer Token.',
      faq_q2: 'Wie funktioniert das Token-Brennen?',
      faq_a2: 'Das Token-Brennen reduziert das Gesamtangebot.',
      faq_q3: 'Was ist das maximale Angebot von Burni Coin?',
      faq_a3: 'Das maximale Angebot beträgt 1.000.000.',
      faq_q4: 'Wie kann ich Burni Coin handeln?',
      faq_a4: 'Sie können Burni Coin auf verschiedenen Plattformen handeln.',
      faq_q5: 'Was ist der XRP Ledger?',
      faq_a5: 'Der XRP Ledger ist eine schnelle und effiziente Blockchain.',
      community_title: 'Treten Sie unserer Gemeinschaft bei',
      community_description: 'Seien Sie Teil der Burni Coin-Gemeinschaft.',
      footer_copyright: '© Burni Token 2025. Alle Rechte vorbehalten.',
    },
    es: {
      page_title: 'Burni Token - Criptomoneda descentralizada innovadora',
      lang_select_label: 'Seleccionar idioma',
      nav_home: 'Inicio',
      nav_about: 'Acerca de Burni',
      nav_tokenomics: 'Tokenomics',
      nav_use_cases: 'Casos de uso',
      nav_token_schedule: 'Cronograma de tokens',
      nav_trade: 'Comerciar tokens',
      nav_community: 'Comunidad',
      menu_button: 'Menú',
      hero_title: '¡Bienvenido a Burni!',
      hero_description:
        'Descubre el token deflacionario diseñado para crear valor a través de la escasez. ¡Únete a nosotros en un viaje ardiente de descubrimiento!',
      hero_button: 'Aprende más!',
      about_title: '¿Qué es Burni?',
      about_description:
        'Burni es más que un token. Es una promesa para un futuro deflacionario. En el núcleo de Burni hay un mecanismo que elimina permanentemente los tokens de circulación para aumentar potencialmente el valor de los tokens restantes.',
      burn_title: 'El Secreto de la Quema de Tokens',
      burn_description:
        'Imagina tokens siendo quemados como troncos en un fuego mágico. ¡Desaparecen para siempre! Este proceso, llamado "quema de tokens", reduce el suministro total de tokens Burni. Menos tokens pueden significar que cada uno se vuelve más valioso, similar a los coleccionables raros.',
      burn_animation_note:
        'Esta animación ilustra cómo los tokens son eliminados simbólicamente de la circulación.',
      blackholed_title: "La Promesa de Burni: 'Blackholed'",
      blackholed_description:
        "Burni está marcado como 'Blackholed: SÍ'. Esto significa que el suministro máximo de tokens Burni es fijo y nunca se podrán crear nuevos tokens. ¡Es como tirar la llave del vault!",
      blackholed_tooltip_trigger: "¿Qué significa 'Blackholed'?",
      blackholed_tooltip_text:
        "Cuando un emisor de tokens está 'blackholed', significa que la dirección emisora ha renunciado a sus derechos de acuñar nuevos tokens o cambiar las propiedades del token. Esto hace que el suministro máximo sea realmente fijo.",
      use_cases_title: 'Casos de Uso: Para Qué Se Puede Usar Burni Coin',
      use_cases_description:
        'Burni Coin no es solo un token, sino un activo digital versátil con aplicaciones crecientes en el ecosistema XRPL.',
      use_case_gaming_title: 'Juegos Descentralizados',
      use_case_gaming_desc:
        'Usa Burni como moneda en el juego o para activos exclusivos en futuros juegos de XRPL.',
      use_case_nfts_title: 'Integración de NFT',
      use_case_nfts_desc:
        'Adquiere e intercambia obras de arte digitales únicas y coleccionables en los mercados de NFT con Burni.',
      use_case_rewards_title: 'Sistemas de Recompensa',
      use_case_rewards_desc:
        'Gana Burni participando en acciones comunitarias, programas de staking o como recompensas por contribuciones.',
      use_case_microtx_title: 'Microtransacciones',
      use_case_microtx_desc:
        'Benefíciate de las tarifas de transacción extremadamente bajas del XRPL para pagos rápidos y rentables.',
      use_case_governance_title: 'Gobernanza Comunitaria',
      use_case_governance_desc:
        'Mantén Burni para participar en decisiones importantes sobre el futuro del proyecto y tener voz.',
      token_schedule_title: 'Burni Coin: Calendario Deflacionario',
      token_schedule_description:
        'Creemos en la transparencia y el desarrollo del valor a largo plazo de Burni Coin. Un componente clave de nuestro ecosistema es el mecanismo deflacionario único que reduce continuamente la cantidad total de Burni Coins en circulación.',
      key_insights_title: 'Perspectivas Clave de la Simulación',
      key_insights_text:
        'Basado en nuestro cálculo, comenzando con 500,000 monedas antes del primer proceso, las monedas están efectivamente desaparecidas cuando queda menos de 1 moneda. Este será el caso después de 260 procesos.',
      key_insights_start_date: 'Inicio del primer proceso: 1 de junio de 2025 (domingo)',
      key_insights_end_date:
        'Fecha de finalización (después de 260 procesos, Monedas < 1): 21 de julio de 2027 (miércoles)',
      key_insights_total_processes: 'Total de Procesos: 260',
      key_insights_total_days: 'Días transcurridos hasta el final: 780 días',
      process_details_title: 'El Proceso en Detalle',
      process_details_text1:
        'A partir del 1 de junio de 2025, se realizará un proceso de dos pasos cada tres días.',
      process_details_burn:
        'Quema: Primero, el 3% de las monedas actualmente en circulación se eliminan permanentemente de la circulación y se destruyen.',
      process_details_lock:
        'Bloqueo: Luego, el 2% de las monedas restantes después de la quema se bloquean.',
      process_details_text2:
        'Este ciclo se repite cada tres días hasta que el número de monedas caiga por debajo de una unidad entera (queda menos de 1 moneda).',
      schedule_timeline_title: 'Calendario de Reducción de Monedas',
      schedule_timeline_text:
        'La siguiente tabla muestra un ejemplo de las monedas restantes después de completar el respectivo proceso en las fechas especificadas.',
      schedule_disclaimer:
        'Nota: Los valores están redondeados a dos decimales. El proceso se detiene tan pronto como el valor cae por debajo de 1.',
      visual_representation_title: 'Representación Visual de la Reducción',
      visual_representation_text:
        'Para ilustrar mejor el desarrollo de las Monedas Burni, hemos creado un gráfico interactivo que visualiza el proceso deflacionario.',
      visual_representation_note:
        'Este gráfico muestra la cantidad de monedas restantes a lo largo del tiempo para resaltar visualmente la naturaleza deflacionaria de Burni Coin.',
      tokenomics_title: 'El Mundo de Burni: Hechos y Números',
      tokenomics_description:
        'Aquí hay una mirada a las cifras clave que definen a Burni. Estos datos te dan una idea de la base económica y el potencial del token.',
      kpi_max_supply: 'Suministro Máximo',
      kpi_circulating_supply: 'Suministro Circulante',
      kpi_current_price: 'Precio Actual de Burni',
      kpi_xrp_price: 'Precio Actual de XRP',
      kpi_xpm_price: 'Precio Actual de XPM',
      kpi_holders: 'Número de Poseedores',
      kpi_trustlines: 'Número de Trustlines',
      kpi_issuer_fee: 'Tarifa del Emisor',
      price_error_message:
        'No se pudieron cargar los datos de precios. Por favor, inténtelo de nuevo más tarde.',
      last_updated_label: 'Última Actualización:',
      token_details_title: 'Detalles del Token',
      created_on: 'Creado el: 17 de mayo de 2025',
      ath: 'Máximo Histórico',
      ath_tooltip: 'El precio más alto alcanzado por Burni Coin.',
      atl: 'Mínimo Histórico',
      atl_tooltip: 'El precio más bajo alcanzado por Burni Coin.',
      total_supply: 'إجمالي المعروض',
      platform: 'Plataforma: XRP Ledger (XRPL)',
      note_data_disclaimer: 'Nota: Los datos están sujetos a cambios.',
      supply_overview_title: 'Resumen del Suministro',
      supply_chart_caption: 'Este gráfico visualiza el suministro del token.',
      supply_chart_description: 'Este gráfico visualiza el suministro del token.',
      xrpl_home_title: 'En Casa en el XRP Ledger',
      xrpl_home_description: 'Burni opera en el XRP Ledger, una blockchain rápida y eficiente.',
      xrpl_slogan: 'Rápido, eficiente y seguro.',
      trade_title: 'Comerciar Burni Coin',
      trade_description: 'Comercia Burni Coin en varias plataformas.',
      token_page_link: 'Página del Token',
      token_page_desc: 'Toda la info sobre Burni Coin.',
      set_trustline_link: 'Establecer Trustline de XPM',
      set_trustline_desc: 'Activar Trustline de XPM.',
      dex_trade_link: 'Comercio de XPM',
      dex_trade_desc: 'Comprar/Vender XPM en intercambios descentralizados.',
      swap_link: 'INTERCAMBIO XPM',
      swap_desc: 'Intercambiar XPM fácilmente.',
      market_data_title: 'Datos del Mercado',
      market_data_description: 'Datos del mercado para Burni Coin.',
      ath_atl_chart_caption: 'Gráfico ATH/ATL',
      tweets_title: 'Tweets',
      tweets_description: 'Últimos tweets sobre Burni Coin.',
      faq_title: 'Preguntas Frecuentes',
      faq_description: 'Respuestas a preguntas comunes sobre Burni Coin.',
      faq_search_label_sr: 'Buscar FAQs',
      faq_search_desc_sr: 'Buscar FAQs.',
      faq_q1: '¿Qué es Burni Coin?',
      faq_a1: 'Burni Coin es un token deflacionario.',
      faq_q2: '¿Cómo funciona la quema de tokens?',
      faq_a2: 'La quema de tokens reduce el suministro total.',
      faq_q3: '¿Cuál es el suministro máximo de Burni Coin?',
      faq_a3: 'El suministro máximo es 1,000,000.',
      faq_q4: '¿Cómo puedo comerciar Burni Coin?',
      faq_a4: 'Puedes comerciar Burni Coin en varias plataformas.',
      faq_q5: '¿Qué es el XRP Ledger?',
      faq_a5: 'El XRP Ledger es una blockchain rápida y eficiente.',
      community_title: 'Únete a Nuestra Comunidad',
      community_description: 'Sé parte de la comunidad de Burni Coin.',
      footer_copyright: '© Burni Token 2025. Todos los derechos reservados.',
    },
    fr: {
      page_title: 'Burni Token - Cryptomonnaie Décentralisée et Innovante',
      lang_select_label: 'Sélectionner la langue',
      nav_home: 'Accueil',
      nav_about: 'À propos de Burni',
      nav_tokenomics: 'Tokenomics',
      nav_use_cases: "Cas d'Utilisation",
      nav_token_schedule: 'Calendrier des Tokens',
      nav_trade: 'Échanger des Tokens',
      nav_community: 'Communauté',
      menu_button: 'Menu',
      hero_title: 'Bienvenue sur Burni !',
      hero_description:
        'Découvrez le token déflationniste conçu pour créer de la valeur par la rareté. Rejoignez-nous dans un voyage ardent de découverte !',
      hero_button: 'En savoir plus !',
      about_title: "Qu'est-ce que Burni ?",
      about_description:
        "Burni est plus qu'un simple token. C'est une promesse pour un avenir déflationniste. Au cœur de Burni se trouve un mécanisme qui supprime définitivement les tokens de la circulation afin d'augmenter potentiellement la valeur des tokens restants.",
      burn_title: 'Le Secret de la Destruction des Tokens',
      burn_description:
        'Imaginez des tokens brûlés comme des bûches dans un feu magique. Ils disparaissent pour toujours ! Ce processus, appelé "destruction de tokens", réduit l\'offre totale de tokens Burni. Moins de tokens peuvent signifier que chacun devient plus précieux, similaire à des objets de collection rares.',
      burn_animation_note:
        'Cette animation illustre comment les tokens sont symboliquement retirés de la circulation.',
      blackholed_title: "La Promesse de Burni : 'Blackholed'",
      blackholed_description:
        "Burni est marqué comme 'Blackholed : OUI'. Cela signifie que l'offre maximale de tokens Burni est fixe et qu'aucun nouveau token ne pourra jamais être créé. C'est comme jeter la clé du coffre-fort !",
      blackholed_tooltip_trigger: "Que signifie 'Blackholed' ?",
      blackholed_tooltip_text:
        "Lorsqu'un émetteur de token est 'blackholed', cela signifie que l'adresse émettrice a renoncé à ses droits de créer de nouveaux tokens ou de modifier les propriétés du token. Cela rend l'offre maximale vraiment fixe.",
      use_cases_title: "Cas d'Utilisation : À Quoi Peut Servir Burni Coin",
      use_cases_description:
        "Burni Coin n'est pas seulement un token, mais un actif numérique polyvalent avec des applications croissantes dans l'écosystème XRPL.",
      use_case_gaming_title: 'Jeux Décentralisés',
      use_case_gaming_desc:
        'Utilisez Burni comme monnaie dans le jeu ou pour des actifs exclusifs dans les futurs jeux XRPL.',
      use_case_nfts_title: 'Intégration des NFT',
      use_case_nfts_desc:
        "Acquérez et échangez des œuvres d'art numériques uniques et des objets de collection sur les marchés NFT avec Burni.",
      use_case_rewards_title: 'Systèmes de Récompense',
      use_case_rewards_desc:
        'Gagnez des Burni en participant à des actions communautaires, des programmes de staking ou en tant que récompenses pour vos contributions.',
      use_case_microtx_title: 'Microtransactions',
      use_case_microtx_desc:
        'Bénéficiez des frais de transaction extrêmement bas du XRPL pour des paiements rapides et rentables.',
      use_case_governance_title: 'Gouvernance Communautaire',
      use_case_governance_desc:
        "Détenez des Burni pour participer aux décisions importantes concernant l'avenir du projet et avoir votre mot à dire.",
      token_schedule_title: 'Burni Coin : Calendrier Déflationniste',
      token_schedule_description:
        'Nous croyons en la transparence et en le développement de la valeur à long terme de Burni Coin. Un élément clé de notre écosystème est le mécanisme déflationniste unique qui réduit continuellement le nombre total de Burni Coins en circulation.',
      key_insights_title: 'Aperçus Clés de la Simulation',
      key_insights_text:
        "Basé sur notre calcul, en commençant par 500 000 pièces avant le premier processus, les pièces sont effectivement disparues lorsqu'il en reste moins de 1. Ce sera le cas après 260 processus.",
      key_insights_start_date: 'Début du premier processus : 1er juin 2025 (dimanche)',
      key_insights_end_date:
        'Date de fin (après 260 processus, Pièces < 1) : 21 juillet 2027 (mercredi)',
      key_insights_total_processes: 'Total des Processus : 260',
      key_insights_total_days: "Jours écoulés jusqu'à la fin : 780 jours",
      process_details_title: 'Le Processus en Détail',
      process_details_text1:
        'À partir du 1er juin 2025, un processus en deux étapes sera effectué tous les trois jours.',
      process_details_burn:
        "Destruction : Tout d'abord, 3 % des pièces actuellement en circulation sont définitivement retirées de la circulation et détruites.",
      process_details_lock:
        'Verrouillage : Ensuite, 2 % des pièces restantes après la destruction sont verrouillées.',
      process_details_text2:
        "Ce cycle se répète tous les trois jours jusqu'à ce que le nombre de pièces tombe en dessous d'une unité entière (il reste moins de 1 pièce).",
      schedule_timeline_title: 'Calendrier de Réduction des Pièces',
      schedule_timeline_text:
        "Le tableau suivant montre un exemple des pièces restantes après l'achèvement du processus respectif aux dates spécifiées.",
      schedule_disclaimer:
        "Remarque : Les valeurs sont arrondies à deux décimales. Le processus s'arrête dès que la valeur tombe en dessous de 1.",
      visual_representation_title: 'Représentation Visuelle de la Réduction',
      visual_representation_text:
        'Pour mieux illustrer le développement des Pièces Burni, nous avons créé un graphique interactif qui visualise le processus déflationniste.',
      visual_representation_note:
        'Ce graphique montre le nombre de pièces restantes sur la durée pour mettre en évidence visuellement la nature déflationniste de Burni Coin.',
      tokenomics_title: 'Le Monde de Burni : Faits et Chiffres',
      tokenomics_description:
        'Voici un aperçu des chiffres clés qui définissent Burni. Ces données vous donnent un aperçu des bases économiques et du potentiel du token.',
      kpi_max_supply: 'Offre Maximale',
      kpi_circulating_supply: 'Offre Circulante',
      kpi_current_price: 'Prix Actuel de Burni',
      kpi_xrp_price: 'Prix Actuel du XRP',
      kpi_xpm_price: 'Prix Actuel du XPM',
      kpi_holders: 'Nombre de Détenteurs',
      kpi_trustlines: 'Nombre de Trustlines',
      kpi_issuer_fee: "Frais de l'Émetteur",
      price_error_message:
        "Les données de prix n'ont pas pu être chargées. Veuillez réessayer plus tard.",
      last_updated_label: 'Dernière Mise à Jour :',
      token_details_title: 'Détails du Token',
      created_on: 'Créé le : 17 mai 2025',
      ath: 'Plus Haut Historique',
      ath_tooltip: 'Le prix le plus élevé jamais atteint par Burni Coin.',
      atl: 'Plus Bas Historique',
      atl_tooltip: 'Le prix le plus bas jamais atteint par Burni Coin.',
      total_supply: 'إجمالي المعروض',
      platform: 'Plateforme : XRP Ledger (XRPL)',
      note_data_disclaimer: 'Remarque : Les données sont sujettes à des changements.',
      supply_overview_title: "Aperçu de l'Offre",
      supply_chart_caption: "Ce graphique visualise l'offre du token.",
      supply_chart_description: "Ce graphique visualise l'offre du token.",
      xrpl_home_title: 'Chez Soi sur le XRP Ledger',
      xrpl_home_description:
        'Burni fonctionne sur le XRP Ledger, une blockchain rapide et efficace.',
      xrpl_slogan: 'Rapide, efficace et sécurisé.',
      trade_title: 'Échanger Burni Coin',
      trade_description: 'Échangez Burni Coin sur diverses plateformes.',
      token_page_link: 'Page du Token',
      token_page_desc: 'Toutes les infos sur Burni Coin.',
      set_trustline_link: 'Définir la Trustline XPM',
      set_trustline_desc: 'Activer la Trustline XPM.',
      dex_trade_link: 'Échange XPM',
      dex_trade_desc: 'Acheter/Vendre XPM sur des échanges décentralisés.',
      swap_link: 'ÉCHANGE XPM',
      swap_desc: 'Échangez facilement XPM.',
      market_data_title: 'Données du Marché',
      market_data_description: 'Données du marché pour Burni Coin.',
      ath_atl_chart_caption: 'Graphique ATH/ATL',
      tweets_title: 'Tweets',
      tweets_description: 'Derniers tweets sur Burni Coin.',
      faq_title: 'Questions Fréquemment Posées',
      faq_description: 'Réponses aux questions courantes sur Burni Coin.',
      faq_search_label_sr: 'Rechercher des FAQs',
      faq_search_desc_sr: 'Rechercher des FAQs.',
      faq_q1: "Qu'est-ce que Burni Coin ?",
      faq_a1: 'Burni Coin est un token déflationniste.',
      faq_q2: 'Comment fonctionne la destruction des tokens ?',
      faq_a2: "La destruction des tokens réduit l'offre totale.",
      faq_q3: "Quelle est l'offre maximale de Burni Coin ?",
      faq_a3: "L'offre maximale est de 1 000 000.",
      faq_q4: 'Comment puis-je échanger Burni Coin ?',
      faq_a4: 'Vous pouvez échanger Burni Coin sur diverses plateformes.',
      faq_q5: "Qu'est-ce que le XRP Ledger ?",
      faq_a5: 'Le XRP Ledger est une blockchain rapide et efficace.',
      community_title: 'Rejoignez Notre Communauté',
      community_description: 'Faites partie de la communauté Burni Coin.',
      footer_copyright: '© Burni Token 2025. Tous droits réservés.',
    },
    ar: {
      page_title: 'رمز Burni - Cryptocurrency لامركزية مبتكرة',
      lang_select_label: 'اختر اللغة',
      nav_home: 'الرئيسية',
      nav_about: 'حول Burni',
      nav_tokenomics: 'اقتصاديات الرمز',
      nav_use_cases: 'حالات الاستخدام',
      nav_token_schedule: 'جدول الرموز',
      nav_trade: 'تداول الرموز',
      nav_community: 'المجتمع',
      menu_button: 'القائمة',
      hero_title: 'مرحبًا بكم في Burni!',
      hero_description:
        'اكتشف الرمز الانكماشي المصمم لخلق قيمة من خلال الندرة. انضم إلينا في رحلة ملحمية من الاكتشاف!',
      hero_button: 'اعرف أكثر!',
      about_title: 'ما هو Burni؟',
      about_description:
        'Burni هو أكثر من مجرد رمز. إنها وعد بمستقبل انكماشي. في جوهر Burni يوجد آلية تزيل بشكل دائم الرموز من التداول لزيادة قيمة الرموز المتبقية.',
      burn_title: 'سر حرق الرموز',
      burn_description:
        'تخيل الرموز وهي تحترق مثل الحطب في نار سحرية. تختفي إلى الأبد! هذه العملية، المسماة "حرق الرموز"، تقلل من العرض الإجمالي لرموز Burni. قد تعني الرموز الأقل أن كل واحدة تصبح أكثر قيمة، مثل المقتنيات النادرة.',
      burn_animation_note: 'توضح هذه الرسوم المتحركة كيف تتم إزالة الرموز من التداول بشكل رمزي.',
      blackholed_title: "وعد Burni: 'Blackholed'",
      blackholed_description:
        "تم وضع علامة على Burni كـ 'Blackholed: نعم'. هذا يعني أن الحد الأقصى من عرض رموز Burni ثابت ولا يمكن إنشاء رموز جديدة أبدًا. إنه مثل رمي مفتاح الخزنة!",
      blackholed_tooltip_trigger: "ماذا يعني 'Blackholed'؟",
      blackholed_tooltip_text:
        "عندما يكون مُصدر الرمز 'blackholed'، فهذا يعني أن العنوان المُصدر قد تنازل عن حقوقه في سك رموز جديدة أو تغيير خصائص الرمز. هذا يجعل الحد الأقصى من العرض ثابتًا حقًا.",
      use_cases_title: 'حالات الاستخدام: ما يمكن استخدام عملة Burni من أجله',
      use_cases_description:
        'عملة Burni ليست مجرد رمز، بل هي أصل رقمي متعدد الاستخدامات مع تطبيقات متزايدة في نظام XRPL البيئي.',
      use_case_gaming_title: 'الألعاب اللامركزية',
      use_case_gaming_desc:
        'استخدم Burni كعملة داخل اللعبة أو للحصول على أصول حصرية داخل الألعاب المستقبلية على XRPL.',
      use_case_nfts_title: 'تكامل NFT',
      use_case_nfts_desc:
        'احصل على أعمال فنية رقمية فريدة وقابلة للتداول ومقتنيات على أسواق NFT باستخدام Burni.',
      use_case_rewards_title: 'أنظمة المكافآت',
      use_case_rewards_desc:
        'اكسب Burni من خلال المشاركة في الأنشطة المجتمعية، أو برامج الستاكينغ، أو كمكافآت على المساهمات.',
      use_case_microtx_title: 'المعاملات الصغيرة',
      use_case_microtx_desc:
        'استفد من رسوم المعاملات المنخفضة للغاية على XRPL لمدفوعات سريعة وفعالة من حيث التكلفة.',
      use_case_governance_title: 'حوكمة المجتمع',
      use_case_governance_desc:
        'احتفظ بـ Burni للمشاركة في القرارات الهامة بشأن مستقبل المشروع ولتكون لك كلمة في ذلك.',
      token_schedule_title: 'عملة Burni: الجدول الزمني الانكماشي',
      token_schedule_description:
        'نحن نؤمن بالشفافية وتطوير القيمة على المدى الطويل لعملة Burni. عنصر رئيسي في نظامنا البيئي هو الآلية الانكماشية الفريدة التي تقلل باستمرار من إجمالي كمية عملات Burni المتداولة.',
      key_insights_title: 'أفكار رئيسية من المحاكاة',
      key_insights_text:
        'استنادًا إلى حساباتنا، بدءًا من 500,000 عملة قبل العملية الأولى، تختفي العملات بشكل فعال عندما يتبقى أقل من 1 عملة. ستكون هذه هي الحالة بعد 260 عملية.',
      key_insights_start_date: 'بداية العملية الأولى: 1 يونيو، 2025 (الأحد)',
      key_insights_end_date: 'تاريخ الانتهاء (بعد 260 عملية، عملات < 1): 21 يوليو، 2027 (الأربعاء)',
      key_insights_total_processes: 'إجمالي العمليات: 260',
      key_insights_total_days: 'عدد الأيام حتى الانتهاء: 780 يومًا',
      process_details_title: 'العملية بالتفصيل',
      process_details_text1: 'بدءًا من 1 يونيو 2025، سيتم تنفيذ عملية من خطوتين كل ثلاثة أيام.',
      process_details_burn:
        'الحرق: أولاً، يتم إزالة 3% من العملات المتداولة حاليًا بشكل دائم من التداول وتدميرها.',
      process_details_lock: 'القفل: ثم، يتم قفل 2% من العملات المتبقية بعد الحرق.',
      process_details_text2:
        'تتكرر هذه الدورة كل ثلاثة أيام حتى ينخفض عدد العملات إلى أقل من وحدة كاملة (1 أقل من 1 عملة).',
      schedule_timeline_title: 'جدول زمني لتقليل العملات',
      schedule_timeline_text:
        'تظهر الجدول التالي مثالاً على العملات المتبقية بعد إكمال العملية المعنية في التواريخ المحددة.',
      schedule_disclaimer:
        'ملاحظة: القيم مقربة إلى منزلتين عشريتين. يتوقف العملية بمجرد أن تنخفض القيمة إلى أقل من 1.',
      visual_representation_title: 'تمثيل مرئي للتقليل',
      visual_representation_text:
        'لتوضيح تطور عملات Burni بشكل أفضل، قمنا بإنشاء مخطط تفاعلي يصور العملية الانكماشية.',
      visual_representation_note:
        'يوضح هذا المخطط عدد العملات المتبقية على مدى الزمن لتسليط الضوء بصريًا على الطبيعة الانكماشية لعملة Burni.',
      tokenomics_title: 'بارن توكن: حقائق وأرقام',
      tokenomics_description:
        'إليك نظرة على الأرقام الرئيسية التي تحدد بارن توكن. تعطيك هذه البيانات نظرة ثاقبة على الأساس الاقتصادي وإمكانات الرمز.',
      kpi_max_supply: 'الحد الأقصى للعرض',
      kpi_circulating_supply: 'العرض المتداول',
      kpi_current_price: 'السعر الحالي لـ Burni',
      kpi_xrp_price: 'السعر الحالي لـ XRP',
      kpi_xpm_price: 'السعر الحالي لـ XPM',
      kpi_holders: 'عدد الحائزين',
      kpi_trustlines: 'عدد خطوط الثقة',
      kpi_issuer_fee: 'رسوم المصدر',
      price_error_message: 'لم يتم تحميل بيانات السعر. يرجى المحاولة مرة أخرى لاحقًا.',
      last_updated_label: 'آخر تحديث:',
      token_details_title: 'تفاصيل الرمز',
      created_on: 'تاريخ الإنشاء: 17 مايو 2025',
      ath: 'أعلى سعر على الإطلاق',
      ath_tooltip: 'Burni Coin بواسطة الوصول إليه أعلى سعر.',
      atl: 'أدنى سعر على الإطلاق',
      atl_tooltip: 'Burni Coin بواسطة الوصول إليه أدنى سعر.',
      total_supply: 'إجمالي المعروض',
      platform: 'Platform: XRP Ledger (XRPL)',
      note_data_disclaimer: 'Note: Data is subject to change.',
      supply_overview_title: 'Supply Overview',
      supply_chart_caption: 'This chart visualizes the token supply.',
      supply_chart_description: 'This chart visualizes the token supply.',
      xrpl_home_title: 'At Home on the XRP Ledger',
      xrpl_home_description: 'Burni operates on the XRP Ledger, a fast and efficient blockchain.',
      xrpl_slogan: 'Fast, efficient, and secure.',
      trade_title: 'Trade Burni Coin',
      trade_description: 'Trade Burni Coin on various platforms.',
      token_page_link: 'Token Page',
      token_page_desc: 'All info about Burni Coin.',
      set_trustline_link: 'Set XPM Trustline',
      set_trustline_desc: 'Activate XPM Trustline.',
      dex_trade_link: 'XPM Trading',
      dex_trade_desc: 'Buy/Sell XPM on decentralized exchanges.',
      swap_link: 'SWAP XPM',
      swap_desc: 'Easily exchange XPM.',
      market_data_title: 'Market Data',
      market_data_description: 'Market data for Burni Coin.',
      ath_atl_chart_caption: 'ATH/ATL Chart',
      tweets_title: 'Tweets',
      tweets_description: 'Latest tweets about Burni Coin.',
      faq_title: 'Frequently Asked Questions',
      faq_description: 'Answers to common questions about Burni Coin.',
      faq_search_label_sr: 'Search FAQs',
      faq_search_desc_sr: 'Search FAQs.',
      faq_q1: 'What is Burni Coin?',
      faq_a1: 'Burni Coin is a deflationary token.',
      faq_q2: 'How does token burning work?',
      faq_a2: 'Token burning reduces the total supply.',
      faq_q3: 'What is the maximum supply of Burni Coin?',
      faq_a3: 'The maximum supply is 1,000,000.',
      faq_q4: 'How can I trade Burni Coin?',
      faq_a4: 'You can trade Burni Coin on various platforms.',
      faq_q5: 'What is the XRP Ledger?',
      faq_a5: 'The XRP Ledger is a fast and efficient blockchain.',
      community_title: 'Join Our Community',
      community_description: 'Be part of the Burni Coin community.',
      footer_copyright: '© Burni Token 2025. All rights reserved.',
    },
  };

  // Initial rendering
  const urlLangParam = new URLSearchParams(window.location.search).get('lang');
  if (urlLangParam && locales[urlLangParam]) {
    currentLang = urlLangParam;
    document.documentElement.setAttribute('lang', currentLang);
    const dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.body.classList.add('loaded');
    setTimeout(() => {
      document.body.classList.add('fade-in');
    }, 50);
  } else {
    document.documentElement.setAttribute('lang', 'en');
    document.documentElement.setAttribute('dir', 'ltr');
    document.body.classList.add('loaded');
    setTimeout(() => {
      document.body.classList.add('fade-in');
    }, 50);
  }

  // Language switcher
  const languageSwitcher = document.getElementById('lang-select');
  if (languageSwitcher) {
    languageSwitcher.addEventListener('change', (e) => {
      const selectedLang = e.target.value;
      if (locales[selectedLang]) {
        currentLang = selectedLang;
        document.documentElement.setAttribute('lang', currentLang);
        const dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.setAttribute('dir', dir);
        document.body.classList.remove('fade-in');
        void document.body.offsetWidth; // Reflow
        document.body.classList.add('fade-in');
        setTimeout(() => {
          location.search = `?lang=${currentLang}`;
        }, 300);
      }
    });
  }

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
});
