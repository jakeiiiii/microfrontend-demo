(function () {
  'use strict';

  var MFE_REGISTRY = {
    angular14: {
      scripts: ['/mfe/angular14/runtime.js', '/mfe/angular14/main.js'],
      element: '<mfe-angular14></mfe-angular14>'
    },
    angular20: {
      scripts: ['/mfe/angular20/main.js'],
      element: '<mfe-angular20></mfe-angular20>'
    }
  };

  var loadedScripts = {};
  var container = document.getElementById('mfe-container');

  function loadScript(src) {
    if (loadedScripts[src]) return loadedScripts[src];
    loadedScripts[src] = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.body.appendChild(script);
    });
    return loadedScripts[src];
  }

  function loadMfe(name) {
    var mfe = MFE_REGISTRY[name];
    if (!mfe) return Promise.reject(new Error('Unknown MFE: ' + name));
    return Promise.all(mfe.scripts.map(loadScript)).then(function () {
      return mfe.element;
    });
  }

  function renderHome() {
    container.innerHTML =
      '<div class="home-content">' +
        '<h2>Welcome to the Microfrontend Demo</h2>' +
        '<p>This demo shows two Angular microfrontends (v14 and v20) running simultaneously in a framework-agnostic shell.</p>' +
        '<p>Each MFE is packaged as a Web Component using @angular/elements. Zone.js is loaded once by the shell and shared across all MFEs.</p>' +
        '<p>Use the navigation above to load each MFE individually or both at once.</p>' +
      '</div>';
  }

  function renderMfe(name) {
    container.innerHTML = '<p style="text-align:center;padding:2rem;color:#888;">Loading ' + name + '...</p>';
    loadMfe(name).then(function (element) {
      container.innerHTML = element;
    }).catch(function (err) {
      container.innerHTML = '<p style="text-align:center;padding:2rem;color:#c44;">Error loading ' + name + ': ' + err.message + '</p>';
    });
  }

  function renderBoth() {
    container.innerHTML = '<p style="text-align:center;padding:2rem;color:#888;">Loading microfrontends...</p>';
    Promise.all([loadMfe('angular14'), loadMfe('angular20')]).then(function (elements) {
      container.innerHTML = '<div class="mfe-row">' + elements.join('') + '</div>';
    }).catch(function (err) {
      container.innerHTML = '<p style="text-align:center;padding:2rem;color:#c44;">Error: ' + err.message + '</p>';
    });
  }

  function getRoute() {
    var hash = window.location.hash || '#/home';
    return hash.replace('#/', '') || 'home';
  }

  function updateActiveNav(route) {
    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-route') === route);
    });
  }

  function navigate() {
    var route = getRoute();
    updateActiveNav(route);

    switch (route) {
      case 'angular14':
        renderMfe('angular14');
        break;
      case 'angular20':
        renderMfe('angular20');
        break;
      case 'both':
        renderBoth();
        break;
      default:
        renderHome();
    }
  }

  window.addEventListener('hashchange', navigate);
  navigate();
})();
