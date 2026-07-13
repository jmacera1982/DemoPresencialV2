window.initBankingTotem({
  requireAuth: true,
  hasInitialMenu: true,
  avatarRedirectUrl: 'avatar.html',
  analysisMode: 'static',
  analysisStepDelay: 800,
  analysisResultDelay: 1000,
  journey: {
    flowKey: 'APP_CLIENTE'
  },
  enqueue: {
    branchId: '10750',
    presencialQueueId: '16221',
    videoQueueId: '16223',
    payloadMode: 'extraFields',
    detailFieldName: 'Detalle',
    defaultDetail:
      'El cliente registra un Score crediticio >700. Adicionalmente registro el abandono de un proceso de oboarding digital. Se recomienda ofrecer Prestamo personal',
    showable: [{ in: 'workstation', format: 'both' }]
  },
  analysisSteps: [
    { titulo: 'Comportamiento digital', detalle: 'Evaluación de onboarding y señales digitales.' },
    { titulo: 'Scoring', detalle: 'Puntuación y mejor oferta disponible.' },
    { titulo: 'Sugerencia de canal', detalle: 'Priorización del canal de atención.' },
    {
      titulo: 'Calcular prioridad',
      detalle: 'Análisis del estado actual de la sucursal comparado con el cliente.'
    }
  ]
});
