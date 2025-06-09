styles.css

.pixar-button {
    @apply bg-orange-500 text-white font-bold py-2 px-4 rounded-full shadow-lg transform transition-all duration-300;
}
.pixar-button:hover {
    @apply bg-orange-600 scale-105;
}

.nav-link {
    @apply text-gray-600 hover:text-orange-600 font-semibold px-3 py-2 rounded-md text-sm transition-colors duration-300;
}
.nav-link.active {
    @apply text-orange-600;
}

.section-card {
    @apply bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300;
}
.kpi-card {
    @apply bg-white p-4 rounded-xl shadow-md text-center;
}
.kpi-value {
    @apply text-3xl font-bold text-orange-600;
}
.kpi-label {
    @apply text-sm text-gray-500 mt-1;
}
.tooltip {
  @apply relative inline-block;
}
.tooltip .tooltiptext {
  @apply invisible w-48 bg-gray-800 text-white text-center rounded-md py-2 px-3 absolute z-10 bottom-full left-1/2 -ml-24 opacity-0 transition-opacity duration-300;
}
.tooltip:hover .tooltiptext {
  @apply visible opacity-100;
}
.burni-mascot {
    @apply w-40 h-40 md:w-52 md:h-52 object-contain;
}
.chart-container {
    height: 300px; /* Feste Höhe für die Diagramm-Container */
    width: 100%;
}