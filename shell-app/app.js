(function () {
  'use strict';

  var container = document.getElementById('mfe-container');

  // =========================================================================
  // Module Federation loader (for Angular 14 MFEs)
  // =========================================================================

  var MF_REMOTES = {
    mfeAngular14: {
      remoteEntry: '/mfe/angular14/remoteEntry.js',
      exposedModule: './bootstrap',
      element: '<mfe-angular14></mfe-angular14>'
    },
    mfeAngular14B: {
      remoteEntry: '/mfe/angular14-b/remoteEntry.js',
      exposedModule: './bootstrap',
      element: '<mfe-angular14-b></mfe-angular14-b>'
    },
    mfeAngular14C: {
      remoteEntry: '/mfe/angular14-c/remoteEntry.js',
      exposedModule: './bootstrap',
      element: '<mfe-angular14-c></mfe-angular14-c>'
    }
  };

  var mfScriptsLoaded = {};

  function loadRemoteEntryScript(url) {
    if (mfScriptsLoaded[url]) return mfScriptsLoaded[url];
    mfScriptsLoaded[url] = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = function () { reject(new Error('Failed to load ' + url)); };
      document.head.appendChild(script);
    });
    return mfScriptsLoaded[url];
  }

  var mfSharedScope = null;

  function initMFContainer(containerName) {
    var cont = window[containerName];
    if (!cont) throw new Error('Container ' + containerName + ' not found on window');

    if (!mfSharedScope) {
      mfSharedScope = {};
    }

    return Promise.resolve(cont.init(mfSharedScope)).then(function () {
      return cont;
    });
  }

  function loadMFExposedModule(containerName, moduleName) {
    var cont = window[containerName];
    return cont.get(moduleName).then(function (factory) {
      return factory();
    });
  }

  var mfInitialized = {};

  function loadAngular14Mfe(name) {
    var remote = MF_REMOTES[name];
    if (!remote) return Promise.reject(new Error('Unknown MF remote: ' + name));

    if (mfInitialized[name]) return Promise.resolve(remote.element);

    return loadRemoteEntryScript(remote.remoteEntry)
      .then(function () { return initMFContainer(name); })
      .then(function () { return loadMFExposedModule(name, remote.exposedModule); })
      .then(function () {
        mfInitialized[name] = true;
        return remote.element;
      });
  }

  function loadAllAngular14Mfes() {
    var names = Object.keys(MF_REMOTES);
    // Load all remote entry scripts first
    return Promise.all(names.map(function (n) {
      return loadRemoteEntryScript(MF_REMOTES[n].remoteEntry);
    })).then(function () {
      // Init containers sequentially so shared scope is populated by the first
      var chain = Promise.resolve();
      names.forEach(function (n) {
        chain = chain.then(function () {
          if (mfInitialized[n]) return;
          return initMFContainer(n);
        });
      });
      return chain;
    }).then(function () {
      // Load exposed modules
      return Promise.all(names.map(function (n) {
        if (mfInitialized[n]) return Promise.resolve(MF_REMOTES[n].element);
        return loadMFExposedModule(n, MF_REMOTES[n].exposedModule).then(function () {
          mfInitialized[n] = true;
          return MF_REMOTES[n].element;
        });
      }));
    });
  }

  // =========================================================================
  // React MFE loader (Webpack Module Federation)
  // =========================================================================

  var REACT_REMOTES = {
    mfeReact: {
      remoteEntry: '/mfe/react/remoteEntry.js',
      exposedModule: './bootstrap',
      element: '<mfe-react></mfe-react>'
    }
  };

  var reactSharedScope = null;
  var reactInitialized = {};

  function loadAllReactMfes() {
    var names = Object.keys(REACT_REMOTES);
    return Promise.all(names.map(function (n) {
      return loadRemoteEntryScript(REACT_REMOTES[n].remoteEntry);
    })).then(function () {
      var chain = Promise.resolve();
      names.forEach(function (n) {
        chain = chain.then(function () {
          if (reactInitialized[n]) return;
          var cont = window[n];
          if (!cont) throw new Error('Container ' + n + ' not found on window');
          if (!reactSharedScope) reactSharedScope = {};
          return Promise.resolve(cont.init(reactSharedScope)).then(function () {
            return cont;
          });
        });
      });
      return chain;
    }).then(function () {
      return Promise.all(names.map(function (n) {
        if (reactInitialized[n]) return Promise.resolve(REACT_REMOTES[n].element);
        return loadMFExposedModule(n, REACT_REMOTES[n].exposedModule).then(function () {
          reactInitialized[n] = true;
          return REACT_REMOTES[n].element;
        });
      }));
    });
  }

  // =========================================================================
  // Native Federation loader (for Angular 20 MFEs)
  // =========================================================================

  var NF_REMOTES = {
    'mfe-angular20': {
      remoteEntry: '/mfe/angular20/remoteEntry.json',
      baseUrl: '/mfe/angular20/',
      element: '<mfe-angular20></mfe-angular20>'
    },
    'mfe-angular20-b': {
      remoteEntry: '/mfe/angular20-b/remoteEntry.json',
      baseUrl: '/mfe/angular20-b/',
      element: '<mfe-angular20-b></mfe-angular20-b>'
    },
    'mfe-angular20-c': {
      remoteEntry: '/mfe/angular20-c/remoteEntry.json',
      baseUrl: '/mfe/angular20-c/',
      element: '<mfe-angular20-c></mfe-angular20-c>'
    }
  };

  var nfInitialized = false;
  var nfImportMapInjected = false;
  var nfEntries = {};

  function waitForImportShim() {
    if (typeof importShim !== 'undefined') return Promise.resolve();
    return new Promise(function (resolve) {
      var check = setInterval(function () {
        if (typeof importShim !== 'undefined') {
          clearInterval(check);
          resolve();
        }
      }, 50);
    });
  }

  function fetchRemoteEntry(name) {
    var remote = NF_REMOTES[name];
    return fetch(remote.remoteEntry)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to fetch ' + remote.remoteEntry);
        return res.json();
      })
      .then(function (entry) {
        nfEntries[name] = entry;
        return entry;
      });
  }

  function buildImportMap(entries) {
    var imports = {};

    // Collect shared deps from all entries, first provider wins (dedup)
    Object.keys(entries).forEach(function (name) {
      var entry = entries[name];
      var baseUrl = NF_REMOTES[name].baseUrl;

      // shared contains array of shared package descriptors
      if (entry.shared) {
        entry.shared.forEach(function (pkg) {
          var key = pkg.packageName || pkg.id;
          if (key && !imports[key]) {
            imports[key] = baseUrl + pkg.outFileName;
          }
        });
      }
    });

    return { imports: imports };
  }

  function injectImportMap(map) {
    if (nfImportMapInjected) return;
    nfImportMapInjected = true;

    var script = document.createElement('script');
    script.type = 'importmap-shim';
    script.textContent = JSON.stringify(map);
    document.head.appendChild(script);
  }

  function loadNFExposedModule(name) {
    var entry = nfEntries[name];
    var baseUrl = NF_REMOTES[name].baseUrl;

    // Find the exposed bootstrap module
    var exposed = null;
    if (entry.exposes) {
      entry.exposes.forEach(function (e) {
        if (e.key === './bootstrap') {
          exposed = e;
        }
      });
    }

    if (!exposed) {
      throw new Error('No ./bootstrap exposed in ' + name);
    }

    var moduleUrl = baseUrl + exposed.outFileName;
    return importShim(moduleUrl);
  }

  function loadAllAngular20Mfes() {
    var names = Object.keys(NF_REMOTES);

    if (nfInitialized) {
      return Promise.resolve(names.map(function (n) {
        return NF_REMOTES[n].element;
      }));
    }

    // Fetch all remote entries in parallel
    return Promise.all(names.map(function (n) {
      return fetchRemoteEntry(n);
    })).then(function () {
      // Build and inject import map
      var map = buildImportMap(nfEntries);
      injectImportMap(map);

      // Wait for es-module-shims to be ready, then small delay to process import map
      return waitForImportShim().then(function () {
        return new Promise(function (resolve) { setTimeout(resolve, 50); });
      });
    }).then(function () {
      // Load exposed modules
      return Promise.all(names.map(function (n) {
        return loadNFExposedModule(n);
      }));
    }).then(function () {
      nfInitialized = true;
      return names.map(function (n) {
        return NF_REMOTES[n].element;
      });
    });
  }

  function loadSingleAngular20Mfe(name) {
    if (nfInitialized) {
      return Promise.resolve(NF_REMOTES[name].element);
    }
    // For single load, we still need to load all NF entries to build the import map
    return loadAllAngular20Mfes().then(function () {
      return NF_REMOTES[name].element;
    });
  }

  // =========================================================================
  // Router
  // =========================================================================

  function renderHome() {
    container.innerHTML =
      '<div class="home-content">' +
        '<h2>Welcome to the Microfrontend Demo</h2>' +
        '<p>This demo shows seven microfrontends (three Angular 14, three Angular 20, one React) running simultaneously in a framework-agnostic shell.</p>' +
        '<p>Angular 14 and React MFEs share dependencies via <strong>Webpack Module Federation</strong>. Angular 20 MFEs share theirs via <strong>Native Federation</strong> (import maps).</p>' +
        '<p>Use the navigation above to load each group individually or all at once.</p>' +
      '</div>';
  }

  function renderLoading(msg) {
    container.innerHTML = '<p style="text-align:center;padding:2rem;color:#888;">' + msg + '</p>';
  }

  function renderError(err) {
    container.innerHTML = '<p style="text-align:center;padding:2rem;color:#c44;">Error: ' + err.message + '</p>';
    console.error(err);
  }

  function renderAngular14() {
    renderLoading('Loading Angular 14 MFEs (Module Federation)...');
    loadAllAngular14Mfes().then(function (elements) {
      container.innerHTML = '<div class="mfe-row">' + elements.join('') + '</div>';
    }).catch(renderError);
  }

  function renderAngular20() {
    renderLoading('Loading Angular 20 MFEs (Native Federation)...');
    loadAllAngular20Mfes().then(function (elements) {
      container.innerHTML = '<div class="mfe-row">' + elements.join('') + '</div>';
    }).catch(renderError);
  }

  function renderReact() {
    renderLoading('Loading React MFEs (Module Federation)...');
    loadAllReactMfes().then(function (elements) {
      container.innerHTML = '<div class="mfe-row">' + elements.join('') + '</div>';
    }).catch(renderError);
  }

  function renderAll() {
    renderLoading('Loading all microfrontends...');
    Promise.all([
      loadAllAngular14Mfes(),
      loadAllAngular20Mfes(),
      loadAllReactMfes()
    ]).then(function (results) {
      var mf14Elements = results[0];
      var nfElements = results[1];
      var reactElements = results[2];
      container.innerHTML =
        '<h3 class="section-label">Angular 14 (Module Federation)</h3>' +
        '<div class="mfe-row">' + mf14Elements.join('') + '</div>' +
        '<h3 class="section-label">Angular 20 (Native Federation)</h3>' +
        '<div class="mfe-row">' + nfElements.join('') + '</div>' +
        '<h3 class="section-label">React (Module Federation)</h3>' +
        '<div class="mfe-row">' + reactElements.join('') + '</div>';
    }).catch(renderError);
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
        renderAngular14();
        break;
      case 'angular20':
        renderAngular20();
        break;
      case 'react':
        renderReact();
        break;
      case 'all':
        renderAll();
        break;
      default:
        renderHome();
    }
  }

  window.addEventListener('hashchange', navigate);
  navigate();
})();
