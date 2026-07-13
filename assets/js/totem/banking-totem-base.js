(function () {
  const DEFAULT_SCORE_PATTERNS = [
    /Score:\s*\*{0,2}(\d+)\*{0,2}/i,
    /Scoring:\s*(\d+)/i,
    /Scoring\s*:\s*(\d+)/i,
    /score\s*:\s*(\d+)/i
  ];

  const DEFAULT_POSITIVE_PATTERNS = [
    '- sugerir videollamada: si',
    '- sugerir videollamada: sí',
    'sugerir videollamada: si',
    'sugerir videollamada: sí',
    '**sugerir videollamada:** si',
    '**sugerir videollamada:** sí',
    '**sugerir videollamada:**si',
    '**sugerir videollamada:**sí',
    '**sugerir videollamada**: si',
    '**sugerir videollamada**: sí',
    '**sugerir videollamada**:si',
    '**sugerir videollamada**:sí',
    'tipo de atención sugerida: videollamada',
    'tipo de atención sugerida:videollamada',
    '**tipo de atención sugerida**: videollamada',
    '**tipo de atención sugerida**:videollamada',
    '**tipo de atención sugerida**: videollamada.',
    '**tipo de atención sugerida**:videollamada.',
    'tipo de atención sugerida videollamada'
  ];

  const DEFAULT_NEGATIVE_PATTERNS = [
    'sugerir videollamada: no',
    'sugerir videollamada:no',
    '**sugerir videollamada:** no',
    '**sugerir videollamada:**no',
    'tipo de atención sugerida: presencial',
    'tipo de atención sugerida:presencial',
    '**tipo de atención sugerida**: presencial',
    '**tipo de atención sugerida**:presencial'
  ];

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }

    callback();
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function qs(root, selector) {
    return root ? root.querySelector(selector) : null;
  }

  function qsa(root, selector) {
    return root ? Array.from(root.querySelectorAll(selector)) : [];
  }

  function createElement(tagName, className, textContent) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }

    if (typeof textContent === 'string') {
      element.textContent = textContent;
    }

    return element;
  }

  function clearChildren(element) {
    if (!element) {
      return;
    }

    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function toggleHidden(element, isHidden) {
    if (element) {
      element.hidden = Boolean(isHidden);
    }
  }

  function toggleActive(element, isActive) {
    if (element) {
      element.classList.toggle('active', Boolean(isActive));
    }
  }

  function toggleClass(element, className, enabled) {
    if (element) {
      element.classList.toggle(className, Boolean(enabled));
    }
  }

  function setText(element, value) {
    if (element) {
      element.textContent = value;
    }
  }

  function formatFriendlyToolName(toolName) {
    if (!toolName || typeof toolName !== 'string') {
      return 'Herramienta desconocida';
    }

    const trimmed = toolName.trim();
    if (!trimmed) {
      return 'Herramienta desconocida';
    }

    if (/\s/.test(trimmed) && !/[a-z][A-Z]/.test(trimmed)) {
      return trimmed;
    }

    return trimmed
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, function (letter) {
        return letter.toUpperCase();
      })
      .trim()
      .replace(/\b\w/g, function (letter) {
        return letter.toUpperCase();
      });
  }

  function setMessageLines(container, lines) {
    clearChildren(container);

    if (!container) {
      return;
    }

    lines.forEach(function (line, index) {
      container.appendChild(document.createTextNode(line));
      if (index < lines.length - 1) {
        container.appendChild(document.createElement('br'));
      }
    });
  }

  function setAssignedMessage(container, prefix, strongText) {
    clearChildren(container);

    if (!container) {
      return;
    }

    container.appendChild(document.createTextNode(prefix + ' '));
    const strong = createElement('strong', 'totem-confirmation-strong', strongText);
    container.appendChild(strong);
  }

  function buildIcon(iconClass) {
    const icon = document.createElement('i');
    icon.className = iconClass;
    return icon;
  }

  function readNestedMessage(candidate) {
    if (typeof candidate === 'string') {
      return candidate;
    }

    if (candidate && typeof candidate === 'object') {
      if (typeof candidate.message === 'string') {
        return candidate.message;
      }

      return JSON.stringify(candidate);
    }

    return null;
  }

  class BankingTotemApp {
    constructor(config) {
      this.config = Object.assign(
        {
          requireAuth: false,
          hasInitialMenu: false,
          avatarRedirectUrl: null,
          analysisMode: 'static',
          analysisStepDelay: 800,
          analysisResultDelay: 1000,
          loadingMessage: 'Conectando con el asistente...',
          noAnalysisMessage: 'No se recibió el texto de análisis de la API.',
          recommendation: {
            scoreThreshold: 640,
            positivePatterns: DEFAULT_POSITIVE_PATTERNS,
            negativePatterns: DEFAULT_NEGATIVE_PATTERNS,
            scorePatterns: DEFAULT_SCORE_PATTERNS
          },
          journey: {
            flowKey: ''
          },
          enqueue: {
            branchId: '',
            presencialQueueId: '',
            videoQueueId: '',
            payloadMode: 'extraFields',
            detailFieldName: 'Detalle',
            defaultDetail:
              'El cliente registra un Score crediticio >700. Adicionalmente registro el abandono de un proceso de oboarding digital. Se recomienda ofrecer Prestamo personal',
            showable: [{ in: 'workstation', format: 'both' }],
            fixedFields: {}
          },
          texts: {
            serviceTitle: '¿Cómo podemos ayudarlo?',
            serviceSubtitle: 'Seleccione el servicio que necesita',
            preferenceTitle: 'Seleccione su preferencia',
            preferenceSubtitle: 'Elija cómo desea ser atendido',
            confirmationTitle: '¡Atención solicitada!',
            confirmationMessageLines: [
              'En breve uno de nuestros asesores lo atenderá.',
              'Por favor, manténgase en línea.'
            ],
            assignedTurnTitle: 'Tu turno fue asignado',
            assignedTurnPrefix: 'Lo llamaremos por su DNI:',
            waitingLabel: 'Tiempo de espera estimado'
          },
          analysisSteps: [],
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
              themeClass: 'opcion-card--theme-brand'
            },
            {
              key: 'inversiones',
              title: 'Inversiones',
              iconClass: 'bi bi-graph-up-arrow',
              themeClass: 'opcion-card--theme-brand'
            }
          ]
        },
        config || {}
      );

      this.config.recommendation = Object.assign(
        {
          scoreThreshold: 640,
          positivePatterns: DEFAULT_POSITIVE_PATTERNS,
          negativePatterns: DEFAULT_NEGATIVE_PATTERNS,
          scorePatterns: DEFAULT_SCORE_PATTERNS
        },
        this.config.recommendation || {}
      );

      this.config.journey = Object.assign(
        {
          flowKey: ''
        },
        this.config.journey || {}
      );

      this.config.enqueue = Object.assign(
        {
          branchId: '',
          presencialQueueId: '',
          videoQueueId: '',
          payloadMode: 'extraFields',
          detailFieldName: 'Detalle',
          defaultDetail:
            'El cliente registra un Score crediticio >700. Adicionalmente registro el abandono de un proceso de oboarding digital. Se recomienda ofrecer Prestamo personal',
          showable: [{ in: 'workstation', format: 'both' }],
          fixedFields: {}
        },
        this.config.enqueue || {}
      );

      this.config.texts = Object.assign(
        {
          serviceTitle: '¿Cómo podemos ayudarlo?',
          serviceSubtitle: 'Seleccione el servicio que necesita',
          preferenceTitle: 'Seleccione su preferencia',
          preferenceSubtitle: 'Elija cómo desea ser atendido',
          confirmationTitle: '¡Atención solicitada!',
          confirmationMessageLines: [
            'En breve uno de nuestros asesores lo atenderá.',
            'Por favor, manténgase en línea.'
          ],
          assignedTurnTitle: 'Tu turno fue asignado',
          assignedTurnPrefix: 'Lo llamaremos por su DNI:',
          waitingLabel: 'Tiempo de espera estimado'
        },
        this.config.texts || {}
      );

      this.state = {
        dniIngresado: '',
        recomendacionVideollamada: false,
        ultimoDetalleExtraFields: this.config.enqueue.defaultDetail || '',
        lastMessageText: null
      };
    }

    init() {
      this.cacheDom();
      this.bindEvents();
      this.syncStaticTexts();
      this.resetConfirmationCopy();
      this.actualizarDisplay();

      if (this.config.hasInitialMenu && this.screenMenuInicial) {
        this.showInitialMenu();
      } else {
        this.showDniScreen();
      }
    }

    cacheDom() {
      this.screenMenuInicial = document.getElementById('screenMenuInicial');
      this.screenAvatar = document.getElementById('screenAvatar');
      this.opcionAvatar = document.getElementById('opcionAvatar');
      this.opcionMenu = document.getElementById('opcionMenu');
      this.closeButtons = qsa(document, '.btn-cerrar-avatar');
      this.screenDni = document.getElementById('screenDni');
      this.screenOpciones = document.getElementById('screenOpciones');
      this.screenConfirmacion = document.getElementById('screenConfirmacion');
      this.dniDisplay = document.getElementById('dniDisplay');
      this.btnContinuar = document.getElementById('btnContinuar');
      this.btnDelete = document.getElementById('btnDelete');
      this.opcionesGrid = document.getElementById('opcionesGrid');
      this.atencionSection = document.getElementById('atencionSection');
      this.stepsContainer = document.getElementById('stepsContainer');
      this.summarySection = document.getElementById('summarySection');
      this.summaryContent = document.getElementById('summaryContent');
      this.logContainer = qs(document, '.log-container');
      this.totemHeader = qs(document, '.totem-header');
      this.totemContent = qs(document, '.totem-content');
      this.tiempoEspera = document.getElementById('tiempoEspera');
      this.tiempoEsperaValor = document.getElementById('tiempoEsperaValor');
      this.videoLinkContainer = document.getElementById('videoLinkContainer');
      this.btnVideoLink = document.getElementById('btnVideoLink');
      this.confirmacionTitle = this.screenConfirmacion ? qs(this.screenConfirmacion, 'h2') : null;
      this.confirmacionMessage = this.screenConfirmacion ? qs(this.screenConfirmacion, '.message') : null;
      this.screenOpcionesTitle = this.screenOpciones ? qs(this.screenOpciones, 'h2') : null;
      this.screenOpcionesSubtitle = this.screenOpciones ? qs(this.screenOpciones, '.subtitle') : null;
      this.keypadButtons = qsa(document, '.keypad-btn[data-number]');
    }

    bindEvents() {
      this.keypadButtons.forEach(
        function (button) {
          button.addEventListener(
            'click',
            function (event) {
              event.preventDefault();
              this.agregarNumero(button.getAttribute('data-number'));
            }.bind(this)
          );
        }.bind(this)
      );

      if (this.btnDelete) {
        this.btnDelete.addEventListener(
          'click',
          function (event) {
            event.preventDefault();
            this.eliminarUltimo();
          }.bind(this)
        );
      }

      if (this.btnContinuar) {
        this.btnContinuar.addEventListener(
          'click',
          function () {
            if (!this.state.dniIngresado) {
              return;
            }

            this.showServiceSelection();
          }.bind(this)
        );
      }

      if (this.opcionAvatar && this.config.avatarRedirectUrl) {
        this.opcionAvatar.addEventListener(
          'click',
          function () {
            window.location.href = this.config.avatarRedirectUrl;
          }.bind(this)
        );
      }

      if (this.opcionMenu) {
        this.opcionMenu.addEventListener(
          'click',
          function () {
            this.showDniScreen();
          }.bind(this)
        );
      }

      this.closeButtons.forEach(
        function (button) {
          button.addEventListener(
            'click',
            function (event) {
              event.preventDefault();
              event.stopPropagation();
              this.resetToEntryPoint();
            }.bind(this)
          );
        }.bind(this)
      );

      document.addEventListener(
        'keydown',
        function (event) {
          this.handlePhysicalKeyboard(event);
        }.bind(this)
      );
    }

    syncStaticTexts() {
      if (this.dniDisplay && !this.dniDisplay.dataset.emptyLabel) {
        this.dniDisplay.dataset.emptyLabel = 'Ingrese su DNI';
      }

      if (this.screenOpcionesTitle) {
        this.screenOpcionesTitle.textContent = this.config.texts.preferenceTitle;
      }

      if (this.screenOpcionesSubtitle) {
        this.screenOpcionesSubtitle.textContent = this.config.texts.preferenceSubtitle;
      }
    }

    resetConfirmationCopy() {
      setText(this.confirmacionTitle, this.config.texts.confirmationTitle);
      setMessageLines(this.confirmacionMessage, this.config.texts.confirmationMessageLines);
      toggleHidden(this.tiempoEspera, true);
      toggleHidden(this.videoLinkContainer, true);
      toggleHidden(this.summarySection, true);
    }

    handlePhysicalKeyboard(event) {
      const screenDniVisible = this.screenDni && !this.screenDni.hidden;
      const screenOpcionesActive = this.screenOpciones && this.screenOpciones.classList.contains('active');
      const screenConfirmacionActive =
        this.screenConfirmacion && this.screenConfirmacion.classList.contains('active');

      if (!screenDniVisible || screenOpcionesActive || screenConfirmacionActive) {
        return;
      }

      if (event.key >= '0' && event.key <= '9') {
        event.preventDefault();
        event.stopPropagation();
        this.agregarNumero(event.key);
        return;
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        event.stopPropagation();
        this.eliminarUltimo();
        return;
      }

      if (event.key === 'Enter' && this.state.dniIngresado && this.btnContinuar && !this.btnContinuar.disabled) {
        event.preventDefault();
        event.stopPropagation();
        this.btnContinuar.click();
      }
    }

    agregarNumero(numero) {
      if (!numero || this.state.dniIngresado.length >= 15) {
        return;
      }

      this.state.dniIngresado += numero;
      this.actualizarDisplay();
    }

    eliminarUltimo() {
      this.state.dniIngresado = this.state.dniIngresado.slice(0, -1);
      this.actualizarDisplay();
    }

    actualizarDisplay() {
      if (!this.dniDisplay) {
        return;
      }

      if (!this.state.dniIngresado) {
        this.dniDisplay.textContent = '';
        this.dniDisplay.classList.add('empty');
        if (this.btnContinuar) {
          this.btnContinuar.disabled = true;
          this.btnContinuar.classList.remove('active');
        }
        return;
      }

      this.dniDisplay.textContent = this.state.dniIngresado;
      this.dniDisplay.classList.remove('empty');
      if (this.btnContinuar) {
        this.btnContinuar.disabled = false;
        this.btnContinuar.classList.add('active');
      }
    }

    showInitialMenu() {
      toggleHidden(this.screenMenuInicial, false);
      toggleHidden(this.screenDni, true);
      toggleActive(this.screenAvatar, false);
      toggleActive(this.screenOpciones, false);
      toggleActive(this.screenConfirmacion, false);
      this.hideAnalysis();
      this.resetConfirmationCopy();
    }

    showDniScreen() {
      toggleHidden(this.screenMenuInicial, true);
      toggleActive(this.screenAvatar, false);
      toggleHidden(this.screenDni, false);
      toggleActive(this.screenOpciones, false);
      toggleActive(this.screenConfirmacion, false);
      this.hideAnalysis();
      this.resetConfirmationCopy();
    }

    resetToEntryPoint() {
      if (this.config.hasInitialMenu && this.screenMenuInicial) {
        this.showInitialMenu();
        return;
      }

      this.showDniScreen();
    }

    hideAnalysis() {
      toggleClass(this.logContainer, 'visible', false);
      toggleActive(this.atencionSection, false);
      toggleHidden(this.summarySection, true);
      if (this.stepsContainer) {
        clearChildren(this.stepsContainer);
      }
    }

    showAnalysisArea() {
      toggleClass(this.logContainer, 'visible', true);
      toggleActive(this.atencionSection, true);
      toggleHidden(this.summarySection, true);
      if (this.summaryContent) {
        this.summaryContent.textContent = '';
      }
    }

    setOptionsHeading(title, subtitle) {
      setText(this.screenOpcionesTitle, title);
      setText(this.screenOpcionesSubtitle, subtitle);
    }

    showServiceSelection() {
      toggleHidden(this.screenDni, true);
      toggleActive(this.screenOpciones, true);
      toggleActive(this.screenConfirmacion, false);
      this.setOptionsHeading(this.config.texts.serviceTitle, this.config.texts.serviceSubtitle);
      this.renderOptionCards(
        this.config.primaryOptions,
        function (option) {
          return this.callJourneyForOption(option.key);
        }.bind(this)
      );
    }

    showAttentionOptions() {
      toggleActive(this.screenOpciones, true);
      toggleActive(this.screenConfirmacion, false);
      this.setOptionsHeading(this.config.texts.preferenceTitle, this.config.texts.preferenceSubtitle);

      const cards = [];

      if (this.state.recomendacionVideollamada) {
        cards.push({
          key: 'videollamada',
          title: 'Videollamada',
          iconClass: 'bi bi-camera-video',
          themeClass: 'opcion-card--theme-video',
          extraClass: 'videollamada',
          badge: 'Menos espera',
          description: 'Atención inmediata desde donde estés'
        });
      }

      cards.push({
        key: 'presencial',
        title: 'Continuar presencial',
        iconClass: 'bi bi-geo-alt',
        themeClass: 'opcion-card--theme-presential',
        extraClass: 'presencial',
        badge: this.state.recomendacionVideollamada ? 'Opción menos recomendada' : null,
        badgeClass: this.state.recomendacionVideollamada ? 'less-recommended' : '',
        description: 'Atención en sucursal'
      });

      this.renderOptionCards(
        cards,
        function (option) {
          return this.solicitarAtencion(option.key);
        }.bind(this)
      );
    }

    renderOptionCards(cards, handler) {
      clearChildren(this.opcionesGrid);

      if (!this.opcionesGrid) {
        return;
      }

      cards.forEach(
        function (card) {
          const button = createElement(
            'button',
            ['opcion-card', 'opcion-card--button', card.themeClass, card.extraClass].filter(Boolean).join(' ')
          );
          button.type = 'button';

          const iconWrapper = createElement('div', 'opcion-icon');
          iconWrapper.appendChild(buildIcon(card.iconClass));
          button.appendChild(iconWrapper);

          button.appendChild(createElement('div', 'opcion-title', card.title));

          if (card.badge) {
            button.appendChild(
              createElement(
                'div',
                ['opcion-badge', card.badgeClass].filter(Boolean).join(' '),
                card.badge
              )
            );
          }

          if (card.description) {
            button.appendChild(createElement('div', 'opcion-desc', card.description));
          }

          button.addEventListener(
            'click',
            function () {
              handler(card);
            }.bind(this)
          );

          this.opcionesGrid.appendChild(button);
        }.bind(this)
      );
    }

    renderStatusMessage(type, text) {
      clearChildren(this.stepsContainer);

      if (!this.stepsContainer) {
        return;
      }

      const className = ['log-message'];
      if (type === 'loading') {
        className.push('log-message--loading');
      }

      if (type === 'error') {
        className.push('log-message--error');
      }

      const message = createElement('div', className.join(' '));
      const iconClass = type === 'error' ? 'bi bi-exclamation-triangle' : 'bi bi-hourglass-split';
      message.appendChild(buildIcon(iconClass));
      message.appendChild(createElement('div', '', text));
      this.stepsContainer.appendChild(message);
    }

    startStaticAnalysisAnimation() {
      clearChildren(this.stepsContainer);

      const steps = Array.isArray(this.config.analysisSteps) ? this.config.analysisSteps : [];
      const delay = this.config.analysisStepDelay || 800;
      const startedAt = Date.now();

      steps.forEach(
        function (step, index) {
          window.setTimeout(
            function () {
              this.addStep({
                name: step.titulo || step.name || 'Paso',
                output: step.detalle || step.output || 'Completado'
              });
            }.bind(this),
            index * delay
          );
        }.bind(this)
      );

      return {
        startedAt: startedAt,
        totalMs: steps.length ? steps.length * delay + 500 : 0
      };
    }

    async waitForAnimation(animation) {
      if (!animation || !animation.totalMs) {
        return;
      }

      const elapsed = Date.now() - animation.startedAt;
      const remaining = animation.totalMs - elapsed;
      if (remaining > 0) {
        await sleep(remaining);
      }
    }

    addStep(content) {
      if (!this.stepsContainer) {
        return;
      }

      const stepItem = createElement('div', 'step-item processing');
      stepItem.appendChild(
        createElement('div', 'step-title', formatFriendlyToolName(content.name || content.tool_name))
      );

      const outputWrapper = createElement('div', 'step-output-content');
      const detail =
        typeof content.output === 'string' && content.output.trim()
          ? content.output.trim()
          : 'Completado';
      outputWrapper.appendChild(createElement('em', '', detail));
      stepItem.appendChild(outputWrapper);
      this.stepsContainer.appendChild(stepItem);

      window.setTimeout(function () {
        stepItem.classList.remove('processing');
        stepItem.classList.add('completed');
      }, 600);
    }

    extractToolUses(data) {
      const toolUses = [];
      const contents = data?.outputs?.[0]?.outputs?.[0]?.results?.message?.content_blocks || [];

      contents.forEach(function (block) {
        (block.contents || []).forEach(function (content) {
          if (content.type === 'tool_use' && content.name) {
            toolUses.push({
              name: content.name,
              tool_name: content.name,
              output:
                typeof content.output === 'string'
                  ? content.output
                  : content.output?.message || 'Herramienta ejecutada correctamente'
            });
          }
        });
      });

      return toolUses;
    }

    async renderToolUseAnimation(data) {
      const toolUses = this.extractToolUses(data);
      if (!toolUses.length) {
        return;
      }

      clearChildren(this.stepsContainer);
      const delay = this.config.analysisStepDelay || 800;
      toolUses.forEach(
        function (toolUse, index) {
          window.setTimeout(
            function () {
              this.addStep(toolUse);
            }.bind(this),
            index * delay
          );
        }.bind(this)
      );

      await sleep(toolUses.length * delay + 500);
    }

    extractMessageText(data) {
      const innerOutput = data?.outputs?.[0]?.outputs?.[0];
      if (!innerOutput) {
        return null;
      }

      const artifactMessage = readNestedMessage(innerOutput.artifacts?.message);
      if (artifactMessage) {
        return artifactMessage;
      }

      const outputMessage = readNestedMessage(innerOutput.outputs?.message?.message);
      if (outputMessage) {
        return outputMessage;
      }

      const resultMessage = readNestedMessage(innerOutput.results?.message?.text);
      if (resultMessage) {
        return resultMessage;
      }

      const nestedResultMessage = readNestedMessage(innerOutput.results?.message?.message);
      if (nestedResultMessage) {
        return nestedResultMessage;
      }

      return null;
    }

    mostrarResumen(message) {
      if (!this.summaryContent || !this.summarySection) {
        return;
      }

      const messageText = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
      if (
        this.config.enqueue.payloadMode === 'extraFields' &&
        messageText &&
        !messageText.startsWith(this.config.noAnalysisMessage)
      ) {
        this.state.ultimoDetalleExtraFields = messageText;
      }

      this.summaryContent.textContent = messageText;
      toggleHidden(this.summarySection, false);
    }

    extractScore(text) {
      if (!text) {
        return null;
      }

      const patterns = this.config.recommendation.scorePatterns || DEFAULT_SCORE_PATTERNS;
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const score = parseInt(match[1], 10);
          if (!Number.isNaN(score)) {
            return score;
          }
        }
      }

      return null;
    }

    shouldRecommendVideo(messageText) {
      if (!messageText) {
        return false;
      }

      const lower = messageText.toLowerCase();
      const negativePatterns = this.config.recommendation.negativePatterns || DEFAULT_NEGATIVE_PATTERNS;
      const positivePatterns = this.config.recommendation.positivePatterns || DEFAULT_POSITIVE_PATTERNS;

      const hasNegativeSignal = negativePatterns.some(function (pattern) {
        return lower.includes(pattern);
      });

      let hasPositiveSignal = false;
      if (!hasNegativeSignal) {
        hasPositiveSignal = positivePatterns.some(function (pattern) {
          return lower.includes(pattern);
        });
      }

      const score = this.extractScore(messageText);
      return hasPositiveSignal || (score !== null && score > this.config.recommendation.scoreThreshold);
    }

    aplicarResumenYFlujo(messageText) {
      const resumen = messageText || this.config.noAnalysisMessage;
      this.state.lastMessageText = messageText;
      this.mostrarResumen(resumen);

      if (!messageText) {
        window.setTimeout(
          function () {
            this.solicitarAtencionPresencialDirecta();
          }.bind(this),
          this.config.analysisResultDelay || 1000
        );
        return;
      }

      this.state.recomendacionVideollamada = this.shouldRecommendVideo(messageText);

      window.setTimeout(
        function () {
          if (this.state.recomendacionVideollamada) {
            this.showAttentionOptions();
            return;
          }

          this.solicitarAtencionPresencialDirecta();
        }.bind(this),
        this.config.analysisResultDelay || 1000
      );
    }

    buildJourneyPayload(optionKey) {
      return {
        input_value: 'Necesito atención sobre ' + optionKey + '. DNI: ' + this.state.dniIngresado,
        input_type: 'chat'
      };
    }

    async callJourneyForOption(optionKey) {
      try {
        toggleActive(this.screenOpciones, false);
        this.showAnalysisArea();

        let staticAnimation = null;
        if (this.config.analysisMode === 'tool-uses') {
          this.renderStatusMessage('loading', this.config.loadingMessage);
        } else {
          staticAnimation = this.startStaticAnalysisAnimation();
        }

        if (!this.config.journey.flowKey || !window.NumiaJourneyApi) {
          throw new Error('Journey no configurado (requiere proxy backend)');
        }

        const data = await window.NumiaJourneyApi.runJourney(
          this.config.journey.flowKey,
          this.buildJourneyPayload(optionKey)
        );

        if (this.config.analysisMode === 'tool-uses') {
          await this.renderToolUseAnimation(data);
        } else {
          await this.waitForAnimation(staticAnimation);
        }

        this.aplicarResumenYFlujo(this.extractMessageText(data));
      } catch (error) {
        this.renderStatusMessage('error', 'Error: ' + error.message);
      }
    }

    buildEnqueuePayload() {
      if (this.config.enqueue.payloadMode === 'identity') {
        return Object.assign({}, this.config.enqueue.fixedFields || {}, {
          dni: this.state.dniIngresado
        });
      }

      const detailKey = this.config.enqueue.detailFieldName || 'Detalle';
      return {
        dni: this.state.dniIngresado,
        extraFields: [
          Object.assign(
            {
              showable: this.config.enqueue.showable || [{ in: 'workstation', format: 'both' }]
            },
            {
              [detailKey]: this.state.ultimoDetalleExtraFields || this.config.enqueue.defaultDetail
            }
          )
        ]
      };
    }

    async postEnqueue(queueId) {
      if (!window.NumiaDemoUsers || !window.NumiaDemoUsers.enqueueFilaVirtual) {
        throw new Error('Proxy de fila virtual no disponible');
      }

      return window.NumiaDemoUsers.enqueueFilaVirtual(
        queueId,
        this.config.enqueue.branchId,
        this.buildEnqueuePayload()
      );
    }

    async solicitarAtencionPresencialDirecta() {
      try {
        await this.postEnqueue(this.config.enqueue.presencialQueueId);
        this.mostrarPantallaConfirmacionPresencial();
      } catch (error) {
        window.alert('Error: ' + error.message);
      }
    }

    async solicitarAtencion(tipo) {
      try {
        const queueId =
          tipo === 'videollamada'
            ? this.config.enqueue.videoQueueId
            : this.config.enqueue.presencialQueueId;

        const data = await this.postEnqueue(queueId);
        this.mostrarPantallaConfirmacion(data, tipo);
      } catch (error) {
        window.alert('Error: ' + error.message);
      }
    }

    mostrarPantallaConfirmacion(data, tipo) {
      toggleActive(this.screenOpciones, false);
      toggleActive(this.screenConfirmacion, true);
      setText(this.confirmacionTitle, this.config.texts.confirmationTitle);
      setMessageLines(this.confirmacionMessage, this.config.texts.confirmationMessageLines);
      toggleHidden(this.tiempoEspera, true);
      toggleHidden(this.videoLinkContainer, true);

      if (data && data.averageWaitingTime !== undefined && this.tiempoEsperaValor) {
        const minutes = Math.floor(data.averageWaitingTime / 60);
        const seconds = data.averageWaitingTime % 60;
        this.tiempoEsperaValor.textContent = minutes + ' min ' + seconds + ' seg';
        toggleHidden(this.tiempoEspera, false);
      }

      if (tipo === 'videollamada' && data && data.videoCallUrl && this.btnVideoLink) {
        const videoUrl =
          data.videoCallUrl + (data.videoCallUrl.includes('?') ? '&' : '?') + 'videocallUser=mobile';
        this.btnVideoLink.href = videoUrl;
        toggleHidden(this.videoLinkContainer, false);
      }
    }

    mostrarPantallaConfirmacionPresencial() {
      toggleActive(this.screenOpciones, false);
      toggleActive(this.screenConfirmacion, true);
      setText(this.confirmacionTitle, this.config.texts.assignedTurnTitle);
      setAssignedMessage(
        this.confirmacionMessage,
        this.config.texts.assignedTurnPrefix,
        this.state.dniIngresado
      );
      toggleHidden(this.tiempoEspera, true);
      toggleHidden(this.videoLinkContainer, true);
    }
  }

  window.initBankingTotem = function initBankingTotem(config) {
    if (config && config.requireAuth && window.AuthPortal && typeof window.AuthPortal.require === 'function') {
      window.AuthPortal.require();
    }

    onReady(function () {
      window.currentBankingTotem = new BankingTotemApp(config);
      window.currentBankingTotem.init();
    });
  };
})();
