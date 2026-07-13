(function () {
  const eventTypes = ['click', 'submit', 'change', 'input'];

  function resolveTarget(event, attrName) {
    if (!event.target) {
      return null;
    }
    if (event.type === 'submit') {
      return event.target.matches?.(`[${attrName}]`) ? event.target : null;
    }
    return event.target.closest?.(`[${attrName}]`) || null;
  }

  function splitArgs(rawArgs) {
    const args = [];
    let current = '';
    let quote = null;

    for (let i = 0; i < rawArgs.length; i += 1) {
      const char = rawArgs[i];
      const prev = rawArgs[i - 1];

      if ((char === '"' || char === "'") && prev !== '\\') {
        if (quote === char) {
          quote = null;
        } else if (!quote) {
          quote = char;
        }
        current += char;
        continue;
      }

      if (char === ',' && !quote) {
        args.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }

    if (current.trim()) {
      args.push(current.trim());
    }

    return args.filter(Boolean);
  }

  function resolveToken(token, element, event) {
    if (token === 'event') {
      return event;
    }
    if (token === 'this') {
      return element;
    }
    if (token === 'window.lastTurnInfo') {
      return window.lastTurnInfo;
    }
    if (/^["'].*["']$/.test(token)) {
      return token.slice(1, -1);
    }
    if (/^-?\d+(?:\.\d+)?$/.test(token)) {
      return Number(token);
    }
    if (token === 'true') {
      return true;
    }
    if (token === 'false') {
      return false;
    }
    if (token === 'null') {
      return null;
    }
    return token;
  }

  function resolveWindowPath(path) {
    return path.split('.').reduce((value, key) => (value == null ? value : value[key]), window);
  }

  function runHandler(element, expression, event) {
    const trimmed = expression.trim().replace(/;$/, '');

    if (!trimmed) {
      return;
    }

    if (trimmed === 'return false') {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const preventAlert = trimmed.match(/^event\.preventDefault\(\);\s*alert\((["'])(.*)\1\)$/);
    if (preventAlert) {
      event.preventDefault();
      alert(preventAlert[2]);
      return;
    }

    const styleSetter = trimmed.match(
      /^document\.getElementById\((["'])([^"']+)\1\)\.style\.([a-zA-Z$][\w$]*)\s*=\s*(["'])(.*?)\4$/
    );
    if (styleSetter) {
      const target = document.getElementById(styleSetter[2]);
      if (target) {
        target.style[styleSetter[3]] = styleSetter[5];
      }
      return;
    }

    if (trimmed === 'this.parentElement.parentElement.remove()') {
      element.parentElement?.parentElement?.remove();
      return;
    }

    const fnCall = trimmed.match(/^(?:return\s+)?([A-Za-z_$][\w$.]*)\((.*)\)$/);
    if (!fnCall) {
      console.error('Unsupported delegated handler:', expression);
      return;
    }

    const fn = resolveWindowPath(fnCall[1]);
    if (typeof fn !== 'function') {
      console.error('Delegated handler target is not a function:', fnCall[1]);
      return;
    }

    const args = splitArgs(fnCall[2]).map((token) => resolveToken(token, element, event));
    const result = fn.apply(window, args);
    if (result === false) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  eventTypes.forEach((type) => {
    document.addEventListener(
      type,
      (event) => {
        const attrName = `data-on${type}`;
        const element = resolveTarget(event, attrName);
        if (!element) {
          return;
        }
        runHandler(element, element.getAttribute(attrName) || '', event);
      },
      true
    );
  });
})();
