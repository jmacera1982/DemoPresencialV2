window.initBankingTotem({
  requireAuth: false,
  hasInitialMenu: false,
  analysisMode: 'tool-uses',
  analysisStepDelay: 800,
  analysisResultDelay: 1000,
  loadingMessage: 'Conectando con el asistente...',
  journey: {
    flowKey: 'TOTEM_BANKING'
  },
  enqueue: {
    branchId: '10750',
    presencialQueueId: '16221',
    videoQueueId: '16223',
    payloadMode: 'identity',
    fixedFields: {
      firstName: 'Jorge',
      lastName: 'Macera',
      email: 'mail@mail.com',
      phone: '12345678'
    }
  },
  primaryOptions: [
    {
      key: 'prestamos',
      title: 'Préstamos',
      iconClass: 'bi bi-cash-coin',
      themeClass: 'opcion-card--theme-brand'
    },
    {
      key: 'tarjetas',
      title: 'Tarjetas',
      iconClass: 'bi bi-credit-card',
      themeClass: 'opcion-card--theme-brand-alt'
    },
    {
      key: 'inversiones',
      title: 'Inversiones',
      iconClass: 'bi bi-graph-up-arrow',
      themeClass: 'opcion-card--theme-brand'
    }
  ]
});
