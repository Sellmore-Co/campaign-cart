const __vite_import_meta_env__$2 = {};
const createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState2;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const destroy = () => {
    if ((__vite_import_meta_env__$2 ? "production" : void 0) !== "production") {
      console.warn(
        "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
      );
    }
    listeners.clear();
  };
  const api = { setState, getState, getInitialState, subscribe, destroy };
  const initialState2 = state = createState(setState, getState, api);
  return api;
};
const createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var react = { exports: {} };
var react_production = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
function getIteratorFn(maybeIterable) {
  if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
  maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
  return "function" === typeof maybeIterable ? maybeIterable : null;
}
var ReactNoopUpdateQueue = {
  isMounted: function() {
    return false;
  },
  enqueueForceUpdate: function() {
  },
  enqueueReplaceState: function() {
  },
  enqueueSetState: function() {
  }
}, assign = Object.assign, emptyObject = {};
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
Component.prototype.isReactComponent = {};
Component.prototype.setState = function(partialState, callback) {
  if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
    throw Error(
      "takes an object of state variables to update or a function which returns an object of state variables."
    );
  this.updater.enqueueSetState(this, partialState, callback, "setState");
};
Component.prototype.forceUpdate = function(callback) {
  this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
};
function ComponentDummy() {
}
ComponentDummy.prototype = Component.prototype;
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
pureComponentPrototype.constructor = PureComponent;
assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;
var isArrayImpl = Array.isArray, ReactSharedInternals = { H: null, A: null, T: null, S: null, V: null }, hasOwnProperty = Object.prototype.hasOwnProperty;
function ReactElement(type, key, self, source, owner, props) {
  self = props.ref;
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref: void 0 !== self ? self : null,
    props
  };
}
function cloneAndReplaceKey(oldElement, newKey) {
  return ReactElement(
    oldElement.type,
    newKey,
    void 0,
    void 0,
    void 0,
    oldElement.props
  );
}
function isValidElement(object) {
  return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
}
function escape(key) {
  var escaperLookup = { "=": "=0", ":": "=2" };
  return "$" + key.replace(/[=:]/g, function(match) {
    return escaperLookup[match];
  });
}
var userProvidedKeyEscapeRegex = /\/+/g;
function getElementKey(element, index) {
  return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
}
function noop$1() {
}
function resolveThenable(thenable) {
  switch (thenable.status) {
    case "fulfilled":
      return thenable.value;
    case "rejected":
      throw thenable.reason;
    default:
      switch ("string" === typeof thenable.status ? thenable.then(noop$1, noop$1) : (thenable.status = "pending", thenable.then(
        function(fulfilledValue) {
          "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
        },
        function(error) {
          "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
        }
      )), thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
      }
  }
  throw thenable;
}
function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
  var type = typeof children;
  if ("undefined" === type || "boolean" === type) children = null;
  var invokeCallback = false;
  if (null === children) invokeCallback = true;
  else
    switch (type) {
      case "bigint":
      case "string":
      case "number":
        invokeCallback = true;
        break;
      case "object":
        switch (children.$$typeof) {
          case REACT_ELEMENT_TYPE:
          case REACT_PORTAL_TYPE:
            invokeCallback = true;
            break;
          case REACT_LAZY_TYPE:
            return invokeCallback = children._init, mapIntoArray(
              invokeCallback(children._payload),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
        }
    }
  if (invokeCallback)
    return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
      return c;
    })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
      callback,
      escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
        userProvidedKeyEscapeRegex,
        "$&/"
      ) + "/") + invokeCallback
    )), array.push(callback)), 1;
  invokeCallback = 0;
  var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
  if (isArrayImpl(children))
    for (var i = 0; i < children.length; i++)
      nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
        nameSoFar,
        array,
        escapedPrefix,
        type,
        callback
      );
  else if (i = getIteratorFn(children), "function" === typeof i)
    for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
      nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
        nameSoFar,
        array,
        escapedPrefix,
        type,
        callback
      );
  else if ("object" === type) {
    if ("function" === typeof children.then)
      return mapIntoArray(
        resolveThenable(children),
        array,
        escapedPrefix,
        nameSoFar,
        callback
      );
    array = String(children);
    throw Error(
      "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
    );
  }
  return invokeCallback;
}
function mapChildren(children, func, context) {
  if (null == children) return children;
  var result = [], count = 0;
  mapIntoArray(children, result, "", "", function(child) {
    return func.call(context, child, count++);
  });
  return result;
}
function lazyInitializer(payload) {
  if (-1 === payload._status) {
    var ctor = payload._result;
    ctor = ctor();
    ctor.then(
      function(moduleObject) {
        if (0 === payload._status || -1 === payload._status)
          payload._status = 1, payload._result = moduleObject;
      },
      function(error) {
        if (0 === payload._status || -1 === payload._status)
          payload._status = 2, payload._result = error;
      }
    );
    -1 === payload._status && (payload._status = 0, payload._result = ctor);
  }
  if (1 === payload._status) return payload._result.default;
  throw payload._result;
}
var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
  if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
    var event = new window.ErrorEvent("error", {
      bubbles: true,
      cancelable: true,
      message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
      error
    });
    if (!window.dispatchEvent(event)) return;
  } else if ("object" === typeof process && "function" === typeof process.emit) {
    process.emit("uncaughtException", error);
    return;
  }
  console.error(error);
};
function noop() {
}
react_production.Children = {
  map: mapChildren,
  forEach: function(children, forEachFunc, forEachContext) {
    mapChildren(
      children,
      function() {
        forEachFunc.apply(this, arguments);
      },
      forEachContext
    );
  },
  count: function(children) {
    var n = 0;
    mapChildren(children, function() {
      n++;
    });
    return n;
  },
  toArray: function(children) {
    return mapChildren(children, function(child) {
      return child;
    }) || [];
  },
  only: function(children) {
    if (!isValidElement(children))
      throw Error(
        "React.Children.only expected to receive a single React element child."
      );
    return children;
  }
};
react_production.Component = Component;
react_production.Fragment = REACT_FRAGMENT_TYPE;
react_production.Profiler = REACT_PROFILER_TYPE;
react_production.PureComponent = PureComponent;
react_production.StrictMode = REACT_STRICT_MODE_TYPE;
react_production.Suspense = REACT_SUSPENSE_TYPE;
react_production.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
react_production.__COMPILER_RUNTIME = {
  __proto__: null,
  c: function(size) {
    return ReactSharedInternals.H.useMemoCache(size);
  }
};
react_production.cache = function(fn) {
  return function() {
    return fn.apply(null, arguments);
  };
};
react_production.cloneElement = function(element, config, children) {
  if (null === element || void 0 === element)
    throw Error(
      "The argument must be a React element, but you passed " + element + "."
    );
  var props = assign({}, element.props), key = element.key, owner = void 0;
  if (null != config)
    for (propName in void 0 !== config.ref && (owner = void 0), void 0 !== config.key && (key = "" + config.key), config)
      !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
  var propName = arguments.length - 2;
  if (1 === propName) props.children = children;
  else if (1 < propName) {
    for (var childArray = Array(propName), i = 0; i < propName; i++)
      childArray[i] = arguments[i + 2];
    props.children = childArray;
  }
  return ReactElement(element.type, key, void 0, void 0, owner, props);
};
react_production.createContext = function(defaultValue) {
  defaultValue = {
    $$typeof: REACT_CONTEXT_TYPE,
    _currentValue: defaultValue,
    _currentValue2: defaultValue,
    _threadCount: 0,
    Provider: null,
    Consumer: null
  };
  defaultValue.Provider = defaultValue;
  defaultValue.Consumer = {
    $$typeof: REACT_CONSUMER_TYPE,
    _context: defaultValue
  };
  return defaultValue;
};
react_production.createElement = function(type, config, children) {
  var propName, props = {}, key = null;
  if (null != config)
    for (propName in void 0 !== config.key && (key = "" + config.key), config)
      hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
  var childrenLength = arguments.length - 2;
  if (1 === childrenLength) props.children = children;
  else if (1 < childrenLength) {
    for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
      childArray[i] = arguments[i + 2];
    props.children = childArray;
  }
  if (type && type.defaultProps)
    for (propName in childrenLength = type.defaultProps, childrenLength)
      void 0 === props[propName] && (props[propName] = childrenLength[propName]);
  return ReactElement(type, key, void 0, void 0, null, props);
};
react_production.createRef = function() {
  return { current: null };
};
react_production.forwardRef = function(render) {
  return { $$typeof: REACT_FORWARD_REF_TYPE, render };
};
react_production.isValidElement = isValidElement;
react_production.lazy = function(ctor) {
  return {
    $$typeof: REACT_LAZY_TYPE,
    _payload: { _status: -1, _result: ctor },
    _init: lazyInitializer
  };
};
react_production.memo = function(type, compare) {
  return {
    $$typeof: REACT_MEMO_TYPE,
    type,
    compare: void 0 === compare ? null : compare
  };
};
react_production.startTransition = function(scope) {
  var prevTransition = ReactSharedInternals.T, currentTransition = {};
  ReactSharedInternals.T = currentTransition;
  try {
    var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
    null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
    "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
  } catch (error) {
    reportGlobalError(error);
  } finally {
    ReactSharedInternals.T = prevTransition;
  }
};
react_production.unstable_useCacheRefresh = function() {
  return ReactSharedInternals.H.useCacheRefresh();
};
react_production.use = function(usable) {
  return ReactSharedInternals.H.use(usable);
};
react_production.useActionState = function(action, initialState2, permalink) {
  return ReactSharedInternals.H.useActionState(action, initialState2, permalink);
};
react_production.useCallback = function(callback, deps) {
  return ReactSharedInternals.H.useCallback(callback, deps);
};
react_production.useContext = function(Context) {
  return ReactSharedInternals.H.useContext(Context);
};
react_production.useDebugValue = function() {
};
react_production.useDeferredValue = function(value, initialValue) {
  return ReactSharedInternals.H.useDeferredValue(value, initialValue);
};
react_production.useEffect = function(create2, createDeps, update) {
  var dispatcher = ReactSharedInternals.H;
  if ("function" === typeof update)
    throw Error(
      "useEffect CRUD overload is not enabled in this build of React."
    );
  return dispatcher.useEffect(create2, createDeps);
};
react_production.useId = function() {
  return ReactSharedInternals.H.useId();
};
react_production.useImperativeHandle = function(ref, create2, deps) {
  return ReactSharedInternals.H.useImperativeHandle(ref, create2, deps);
};
react_production.useInsertionEffect = function(create2, deps) {
  return ReactSharedInternals.H.useInsertionEffect(create2, deps);
};
react_production.useLayoutEffect = function(create2, deps) {
  return ReactSharedInternals.H.useLayoutEffect(create2, deps);
};
react_production.useMemo = function(create2, deps) {
  return ReactSharedInternals.H.useMemo(create2, deps);
};
react_production.useOptimistic = function(passthrough, reducer) {
  return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
};
react_production.useReducer = function(reducer, initialArg, init) {
  return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
};
react_production.useRef = function(initialValue) {
  return ReactSharedInternals.H.useRef(initialValue);
};
react_production.useState = function(initialState2) {
  return ReactSharedInternals.H.useState(initialState2);
};
react_production.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
  return ReactSharedInternals.H.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
};
react_production.useTransition = function() {
  return ReactSharedInternals.H.useTransition();
};
react_production.version = "19.1.0";
{
  react.exports = react_production;
}
var reactExports = react.exports;
const ReactExports = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);
var withSelector = { exports: {} };
var withSelector_production = {};
var shim$2 = { exports: {} };
var useSyncExternalStoreShim_production = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React$1 = reactExports;
function is$1(x, y) {
  return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
}
var objectIs$1 = "function" === typeof Object.is ? Object.is : is$1, useState = React$1.useState, useEffect$1 = React$1.useEffect, useLayoutEffect = React$1.useLayoutEffect, useDebugValue$2 = React$1.useDebugValue;
function useSyncExternalStore$2(subscribe, getSnapshot) {
  var value = getSnapshot(), _useState = useState({ inst: { value, getSnapshot } }), inst = _useState[0].inst, forceUpdate = _useState[1];
  useLayoutEffect(
    function() {
      inst.value = value;
      inst.getSnapshot = getSnapshot;
      checkIfSnapshotChanged(inst) && forceUpdate({ inst });
    },
    [subscribe, value, getSnapshot]
  );
  useEffect$1(
    function() {
      checkIfSnapshotChanged(inst) && forceUpdate({ inst });
      return subscribe(function() {
        checkIfSnapshotChanged(inst) && forceUpdate({ inst });
      });
    },
    [subscribe]
  );
  useDebugValue$2(value);
  return value;
}
function checkIfSnapshotChanged(inst) {
  var latestGetSnapshot = inst.getSnapshot;
  inst = inst.value;
  try {
    var nextValue = latestGetSnapshot();
    return !objectIs$1(inst, nextValue);
  } catch (error) {
    return true;
  }
}
function useSyncExternalStore$1(subscribe, getSnapshot) {
  return getSnapshot();
}
var shim$1 = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
useSyncExternalStoreShim_production.useSyncExternalStore = void 0 !== React$1.useSyncExternalStore ? React$1.useSyncExternalStore : shim$1;
{
  shim$2.exports = useSyncExternalStoreShim_production;
}
var shimExports = shim$2.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = reactExports, shim = shimExports;
function is(x, y) {
  return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
}
var objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = shim.useSyncExternalStore, useRef = React.useRef, useEffect = React.useEffect, useMemo = React.useMemo, useDebugValue$1 = React.useDebugValue;
withSelector_production.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
  var instRef = useRef(null);
  if (null === instRef.current) {
    var inst = { hasValue: false, value: null };
    instRef.current = inst;
  } else inst = instRef.current;
  instRef = useMemo(
    function() {
      function memoizedSelector(nextSnapshot) {
        if (!hasMemo) {
          hasMemo = true;
          memoizedSnapshot = nextSnapshot;
          nextSnapshot = selector(nextSnapshot);
          if (void 0 !== isEqual && inst.hasValue) {
            var currentSelection = inst.value;
            if (isEqual(currentSelection, nextSnapshot))
              return memoizedSelection = currentSelection;
          }
          return memoizedSelection = nextSnapshot;
        }
        currentSelection = memoizedSelection;
        if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
        var nextSelection = selector(nextSnapshot);
        if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
          return memoizedSnapshot = nextSnapshot, currentSelection;
        memoizedSnapshot = nextSnapshot;
        return memoizedSelection = nextSelection;
      }
      var hasMemo = false, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
      return [
        function() {
          return memoizedSelector(getSnapshot());
        },
        null === maybeGetServerSnapshot ? void 0 : function() {
          return memoizedSelector(maybeGetServerSnapshot());
        }
      ];
    },
    [getSnapshot, getServerSnapshot, selector, isEqual]
  );
  var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
  useEffect(
    function() {
      inst.hasValue = true;
      inst.value = value;
    },
    [value]
  );
  useDebugValue$1(value);
  return value;
};
{
  withSelector.exports = withSelector_production;
}
var withSelectorExports = withSelector.exports;
const useSyncExternalStoreExports = /* @__PURE__ */ getDefaultExportFromCjs(withSelectorExports);
const __vite_import_meta_env__$1 = {};
const { useDebugValue } = ReactExports;
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;
let didWarnAboutEqualityFn = false;
const identity = (arg) => arg;
function useStore(api, selector = identity, equalityFn) {
  if ((__vite_import_meta_env__$1 ? "production" : void 0) !== "production" && equalityFn && !didWarnAboutEqualityFn) {
    console.warn(
      "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
    );
    didWarnAboutEqualityFn = true;
  }
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getInitialState,
    selector,
    equalityFn
  );
  useDebugValue(slice);
  return slice;
}
const createImpl = (createState) => {
  if ((__vite_import_meta_env__$1 ? "production" : void 0) !== "production" && typeof createState !== "function") {
    console.warn(
      "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
    );
  }
  const api = typeof createState === "function" ? createStore(createState) : createState;
  const useBoundStore = (selector, equalityFn) => useStore(api, selector, equalityFn);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
const create = (createState) => createState ? createImpl(createState) : createImpl;
const __vite_import_meta_env__ = { "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SSR": false };
const trackedConnections = /* @__PURE__ */ new Map();
const getTrackedConnectionState = (name) => {
  const api = trackedConnections.get(name);
  if (!api) return {};
  return Object.fromEntries(
    Object.entries(api.stores).map(([key, api2]) => [key, api2.getState()])
  );
};
const extractConnectionInformation = (store, extensionConnector, options) => {
  if (store === void 0) {
    return {
      type: "untracked",
      connection: extensionConnector.connect(options)
    };
  }
  const existingConnection = trackedConnections.get(options.name);
  if (existingConnection) {
    return { type: "tracked", store, ...existingConnection };
  }
  const newConnection = {
    connection: extensionConnector.connect(options),
    stores: {}
  };
  trackedConnections.set(options.name, newConnection);
  return { type: "tracked", store, ...newConnection };
};
const devtoolsImpl = (fn, devtoolsOptions = {}) => (set, get, api) => {
  const { enabled, anonymousActionType, store, ...options } = devtoolsOptions;
  let extensionConnector;
  try {
    extensionConnector = (enabled != null ? enabled : (__vite_import_meta_env__ ? "production" : void 0) !== "production") && window.__REDUX_DEVTOOLS_EXTENSION__;
  } catch (_e) {
  }
  if (!extensionConnector) {
    if ((__vite_import_meta_env__ ? "production" : void 0) !== "production" && enabled) {
      console.warn(
        "[zustand devtools middleware] Please install/enable Redux devtools extension"
      );
    }
    return fn(set, get, api);
  }
  const { connection, ...connectionInformation } = extractConnectionInformation(store, extensionConnector, options);
  let isRecording = true;
  api.setState = (state, replace, nameOrAction) => {
    const r = set(state, replace);
    if (!isRecording) return r;
    const action = nameOrAction === void 0 ? { type: anonymousActionType || "anonymous" } : typeof nameOrAction === "string" ? { type: nameOrAction } : nameOrAction;
    if (store === void 0) {
      connection == null ? void 0 : connection.send(action, get());
      return r;
    }
    connection == null ? void 0 : connection.send(
      {
        ...action,
        type: `${store}/${action.type}`
      },
      {
        ...getTrackedConnectionState(options.name),
        [store]: api.getState()
      }
    );
    return r;
  };
  const setStateFromDevtools = (...a) => {
    const originalIsRecording = isRecording;
    isRecording = false;
    set(...a);
    isRecording = originalIsRecording;
  };
  const initialState2 = fn(api.setState, get, api);
  if (connectionInformation.type === "untracked") {
    connection == null ? void 0 : connection.init(initialState2);
  } else {
    connectionInformation.stores[connectionInformation.store] = api;
    connection == null ? void 0 : connection.init(
      Object.fromEntries(
        Object.entries(connectionInformation.stores).map(([key, store2]) => [
          key,
          key === connectionInformation.store ? initialState2 : store2.getState()
        ])
      )
    );
  }
  if (api.dispatchFromDevtools && typeof api.dispatch === "function") {
    let didWarnAboutReservedActionType = false;
    const originalDispatch = api.dispatch;
    api.dispatch = (...a) => {
      if ((__vite_import_meta_env__ ? "production" : void 0) !== "production" && a[0].type === "__setState" && !didWarnAboutReservedActionType) {
        console.warn(
          '[zustand devtools middleware] "__setState" action type is reserved to set state from the devtools. Avoid using it.'
        );
        didWarnAboutReservedActionType = true;
      }
      originalDispatch(...a);
    };
  }
  connection.subscribe((message) => {
    var _a;
    switch (message.type) {
      case "ACTION":
        if (typeof message.payload !== "string") {
          console.error(
            "[zustand devtools middleware] Unsupported action format"
          );
          return;
        }
        return parseJsonThen(
          message.payload,
          (action) => {
            if (action.type === "__setState") {
              if (store === void 0) {
                setStateFromDevtools(action.state);
                return;
              }
              if (Object.keys(action.state).length !== 1) {
                console.error(
                  `
                    [zustand devtools middleware] Unsupported __setState action format. 
                    When using 'store' option in devtools(), the 'state' should have only one key, which is a value of 'store' that was passed in devtools(),
                    and value of this only key should be a state object. Example: { "type": "__setState", "state": { "abc123Store": { "foo": "bar" } } }
                    `
                );
              }
              const stateFromDevtools = action.state[store];
              if (stateFromDevtools === void 0 || stateFromDevtools === null) {
                return;
              }
              if (JSON.stringify(api.getState()) !== JSON.stringify(stateFromDevtools)) {
                setStateFromDevtools(stateFromDevtools);
              }
              return;
            }
            if (!api.dispatchFromDevtools) return;
            if (typeof api.dispatch !== "function") return;
            api.dispatch(action);
          }
        );
      case "DISPATCH":
        switch (message.payload.type) {
          case "RESET":
            setStateFromDevtools(initialState2);
            if (store === void 0) {
              return connection == null ? void 0 : connection.init(api.getState());
            }
            return connection == null ? void 0 : connection.init(getTrackedConnectionState(options.name));
          case "COMMIT":
            if (store === void 0) {
              connection == null ? void 0 : connection.init(api.getState());
              return;
            }
            return connection == null ? void 0 : connection.init(getTrackedConnectionState(options.name));
          case "ROLLBACK":
            return parseJsonThen(message.state, (state) => {
              if (store === void 0) {
                setStateFromDevtools(state);
                connection == null ? void 0 : connection.init(api.getState());
                return;
              }
              setStateFromDevtools(state[store]);
              connection == null ? void 0 : connection.init(getTrackedConnectionState(options.name));
            });
          case "JUMP_TO_STATE":
          case "JUMP_TO_ACTION":
            return parseJsonThen(message.state, (state) => {
              if (store === void 0) {
                setStateFromDevtools(state);
                return;
              }
              if (JSON.stringify(api.getState()) !== JSON.stringify(state[store])) {
                setStateFromDevtools(state[store]);
              }
            });
          case "IMPORT_STATE": {
            const { nextLiftedState } = message.payload;
            const lastComputedState = (_a = nextLiftedState.computedStates.slice(-1)[0]) == null ? void 0 : _a.state;
            if (!lastComputedState) return;
            if (store === void 0) {
              setStateFromDevtools(lastComputedState);
            } else {
              setStateFromDevtools(lastComputedState[store]);
            }
            connection == null ? void 0 : connection.send(
              null,
              // FIXME no-any
              nextLiftedState
            );
            return;
          }
          case "PAUSE_RECORDING":
            return isRecording = !isRecording;
        }
        return;
    }
  });
  return initialState2;
};
const devtools = devtoolsImpl;
const parseJsonThen = (stringified, f) => {
  let parsed;
  try {
    parsed = JSON.parse(stringified);
  } catch (e) {
    console.error(
      "[zustand devtools middleware] Could not parse the received json",
      e
    );
  }
  if (parsed !== void 0) f(parsed);
};
const subscribeWithSelectorImpl = (fn) => (set, get, api) => {
  const origSubscribe = api.subscribe;
  api.subscribe = (selector, optListener, options) => {
    let listener = selector;
    if (optListener) {
      const equalityFn = (options == null ? void 0 : options.equalityFn) || Object.is;
      let currentSlice = selector(api.getState());
      listener = (state) => {
        const nextSlice = selector(state);
        if (!equalityFn(currentSlice, nextSlice)) {
          const previousSlice = currentSlice;
          optListener(currentSlice = nextSlice, previousSlice);
        }
      };
      if (options == null ? void 0 : options.fireImmediately) {
        optListener(currentSlice, currentSlice);
      }
    }
    return origSubscribe(listener);
  };
  const initialState2 = fn(set, get, api);
  return initialState2;
};
const subscribeWithSelector = subscribeWithSelectorImpl;
function createJSONStorage(getStorage, options) {
  let storage;
  try {
    storage = getStorage();
  } catch (_e) {
    return;
  }
  const persistStorage = {
    getItem: (name) => {
      var _a;
      const parse = (str2) => {
        if (str2 === null) {
          return null;
        }
        return JSON.parse(str2, void 0);
      };
      const str = (_a = storage.getItem(name)) != null ? _a : null;
      if (str instanceof Promise) {
        return str.then(parse);
      }
      return parse(str);
    },
    setItem: (name, newValue) => storage.setItem(
      name,
      JSON.stringify(newValue, void 0)
    ),
    removeItem: (name) => storage.removeItem(name)
  };
  return persistStorage;
}
const toThenable = (fn) => (input) => {
  try {
    const result = fn(input);
    if (result instanceof Promise) {
      return result;
    }
    return {
      then(onFulfilled) {
        return toThenable(onFulfilled)(result);
      },
      catch(_onRejected) {
        return this;
      }
    };
  } catch (e) {
    return {
      then(_onFulfilled) {
        return this;
      },
      catch(onRejected) {
        return toThenable(onRejected)(e);
      }
    };
  }
};
const oldImpl = (config, baseOptions) => (set, get, api) => {
  let options = {
    getStorage: () => localStorage,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    partialize: (state) => state,
    version: 0,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState
    }),
    ...baseOptions
  };
  let hasHydrated = false;
  const hydrationListeners = /* @__PURE__ */ new Set();
  const finishHydrationListeners = /* @__PURE__ */ new Set();
  let storage;
  try {
    storage = options.getStorage();
  } catch (_e) {
  }
  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api
    );
  }
  const thenableSerialize = toThenable(options.serialize);
  const setItem = () => {
    const state = options.partialize({ ...get() });
    let errorInSync;
    const thenable = thenableSerialize({ state, version: options.version }).then(
      (serializedValue) => storage.setItem(options.name, serializedValue)
    ).catch((e) => {
      errorInSync = e;
    });
    if (errorInSync) {
      throw errorInSync;
    }
    return thenable;
  };
  const savedSetState = api.setState;
  api.setState = (state, replace) => {
    savedSetState(state, replace);
    void setItem();
  };
  const configResult = config(
    (...args) => {
      set(...args);
      void setItem();
    },
    get,
    api
  );
  let stateFromStorage;
  const hydrate = () => {
    var _a;
    if (!storage) return;
    hasHydrated = false;
    hydrationListeners.forEach((cb) => cb(get()));
    const postRehydrationCallback = ((_a = options.onRehydrateStorage) == null ? void 0 : _a.call(options, get())) || void 0;
    return toThenable(storage.getItem.bind(storage))(options.name).then((storageValue) => {
      if (storageValue) {
        return options.deserialize(storageValue);
      }
    }).then((deserializedStorageValue) => {
      if (deserializedStorageValue) {
        if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
          if (options.migrate) {
            return options.migrate(
              deserializedStorageValue.state,
              deserializedStorageValue.version
            );
          }
          console.error(
            `State loaded from storage couldn't be migrated since no migrate function was provided`
          );
        } else {
          return deserializedStorageValue.state;
        }
      }
    }).then((migratedState) => {
      var _a2;
      stateFromStorage = options.merge(
        migratedState,
        (_a2 = get()) != null ? _a2 : configResult
      );
      set(stateFromStorage, true);
      return setItem();
    }).then(() => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(stateFromStorage, void 0);
      hasHydrated = true;
      finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
    }).catch((e) => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
    });
  };
  api.persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions
      };
      if (newOptions.getStorage) {
        storage = newOptions.getStorage();
      }
    },
    clearStorage: () => {
      storage == null ? void 0 : storage.removeItem(options.name);
    },
    getOptions: () => options,
    rehydrate: () => hydrate(),
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => {
        finishHydrationListeners.delete(cb);
      };
    }
  };
  hydrate();
  return stateFromStorage || configResult;
};
const newImpl = (config, baseOptions) => (set, get, api) => {
  let options = {
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => state,
    version: 0,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState
    }),
    ...baseOptions
  };
  let hasHydrated = false;
  const hydrationListeners = /* @__PURE__ */ new Set();
  const finishHydrationListeners = /* @__PURE__ */ new Set();
  let storage = options.storage;
  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api
    );
  }
  const setItem = () => {
    const state = options.partialize({ ...get() });
    return storage.setItem(options.name, {
      state,
      version: options.version
    });
  };
  const savedSetState = api.setState;
  api.setState = (state, replace) => {
    savedSetState(state, replace);
    void setItem();
  };
  const configResult = config(
    (...args) => {
      set(...args);
      void setItem();
    },
    get,
    api
  );
  api.getInitialState = () => configResult;
  let stateFromStorage;
  const hydrate = () => {
    var _a, _b;
    if (!storage) return;
    hasHydrated = false;
    hydrationListeners.forEach((cb) => {
      var _a2;
      return cb((_a2 = get()) != null ? _a2 : configResult);
    });
    const postRehydrationCallback = ((_b = options.onRehydrateStorage) == null ? void 0 : _b.call(options, (_a = get()) != null ? _a : configResult)) || void 0;
    return toThenable(storage.getItem.bind(storage))(options.name).then((deserializedStorageValue) => {
      if (deserializedStorageValue) {
        if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
          if (options.migrate) {
            return [
              true,
              options.migrate(
                deserializedStorageValue.state,
                deserializedStorageValue.version
              )
            ];
          }
          console.error(
            `State loaded from storage couldn't be migrated since no migrate function was provided`
          );
        } else {
          return [false, deserializedStorageValue.state];
        }
      }
      return [false, void 0];
    }).then((migrationResult) => {
      var _a2;
      const [migrated, migratedState] = migrationResult;
      stateFromStorage = options.merge(
        migratedState,
        (_a2 = get()) != null ? _a2 : configResult
      );
      set(stateFromStorage, true);
      if (migrated) {
        return setItem();
      }
    }).then(() => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(stateFromStorage, void 0);
      stateFromStorage = get();
      hasHydrated = true;
      finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
    }).catch((e) => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
    });
  };
  api.persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions
      };
      if (newOptions.storage) {
        storage = newOptions.storage;
      }
    },
    clearStorage: () => {
      storage == null ? void 0 : storage.removeItem(options.name);
    },
    getOptions: () => options,
    rehydrate: () => hydrate(),
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => {
        finishHydrationListeners.delete(cb);
      };
    }
  };
  if (!options.skipHydration) {
    hydrate();
  }
  return stateFromStorage || configResult;
};
const persistImpl = (config, baseOptions) => {
  if ("getStorage" in baseOptions || "serialize" in baseOptions || "deserialize" in baseOptions) {
    if ((__vite_import_meta_env__ ? "production" : void 0) !== "production") {
      console.warn(
        "[DEPRECATED] `getStorage`, `serialize` and `deserialize` options are deprecated. Use `storage` option instead."
      );
    }
    return oldImpl(config, baseOptions);
  }
  return newImpl(config, baseOptions);
};
const persist = persistImpl;
const _Logger = class _Logger {
  constructor(context) {
    this.context = context;
  }
  static setLogLevel(level) {
    _Logger.globalLevel = level;
  }
  static getLogLevel() {
    return _Logger.globalLevel;
  }
  error(message, ...args) {
    if (_Logger.globalLevel >= 0) {
      console.error(`[${this.context}] ${message}`, ...args);
    }
  }
  warn(message, ...args) {
    if (_Logger.globalLevel >= 1) {
      console.warn(`[${this.context}] ${message}`, ...args);
    }
  }
  info(message, ...args) {
    if (_Logger.globalLevel >= 2) {
      console.info(`[${this.context}] ${message}`, ...args);
    }
  }
  debug(message, ...args) {
    if (_Logger.globalLevel >= 3) {
      console.debug(`[${this.context}] ${message}`, ...args);
    }
  }
};
_Logger.globalLevel = 2;
let Logger = _Logger;
function createLogger(context) {
  return new Logger(context);
}
class StorageManager {
  constructor(options = {}) {
    this.logger = createLogger("StorageManager");
    this.storage = options.storage ?? sessionStorage;
    this.serialize = options.serialize ?? JSON.stringify;
    this.deserialize = options.deserialize ?? JSON.parse;
  }
  set(key, value) {
    try {
      const serialized = this.serialize(value);
      this.storage.setItem(key, serialized);
      this.logger.debug(`Stored value for key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to store value for key ${key}:`, error);
      return false;
    }
  }
  get(key, defaultValue) {
    try {
      const item = this.storage.getItem(key);
      if (item === null) {
        this.logger.debug(`No value found for key: ${key}`);
        return defaultValue;
      }
      const deserialized = this.deserialize(item);
      this.logger.debug(`Retrieved value for key: ${key}`);
      return deserialized;
    } catch (error) {
      this.logger.error(`Failed to retrieve value for key ${key}:`, error);
      return defaultValue;
    }
  }
  remove(key) {
    try {
      this.storage.removeItem(key);
      this.logger.debug(`Removed value for key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove value for key ${key}:`, error);
      return false;
    }
  }
  clear() {
    try {
      this.storage.clear();
      this.logger.debug("Cleared all storage");
      return true;
    } catch (error) {
      this.logger.error("Failed to clear storage:", error);
      return false;
    }
  }
  has(key) {
    return this.storage.getItem(key) !== null;
  }
  keys() {
    const keys = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }
    return keys;
  }
  size() {
    let total = 0;
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key !== null) {
        const value = this.storage.getItem(key);
        if (value !== null) {
          total += key.length + value.length;
        }
      }
    }
    return total;
  }
}
const sessionStorageManager = new StorageManager({
  storage: sessionStorage
});
new StorageManager({
  storage: localStorage
});
const CART_STORAGE_KEY = "next-cart-state";
const CAMPAIGN_STORAGE_KEY = "next-campaign-cache";
class EventBus {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(handler);
  }
  emit(event, data) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Event handler error for ${String(event)}:`, error);
        }
      });
    }
  }
  off(event, handler) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
const initialState$5 = {
  items: [],
  subtotal: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  totalQuantity: 0,
  isEmpty: true,
  appliedCoupons: [],
  enrichedItems: [],
  totals: {
    subtotal: { value: 0, formatted: "$0.00" },
    shipping: { value: 0, formatted: "$0.00" },
    tax: { value: 0, formatted: "$0.00" },
    discounts: { value: 0, formatted: "$0.00" },
    total: { value: 0, formatted: "$0.00" },
    count: 0,
    isEmpty: true,
    savings: { value: 0, formatted: "$0.00" },
    savingsPercentage: { value: 0, formatted: "0%" },
    compareTotal: { value: 0, formatted: "$0.00" },
    hasSavings: false,
    totalSavings: { value: 0, formatted: "$0.00" },
    totalSavingsPercentage: { value: 0, formatted: "0%" },
    hasTotalSavings: false
  }
};
const cartStoreInstance = create()(
  persist(
    subscribeWithSelector((set, get) => ({
      ...initialState$5,
      addItem: async (item) => {
        const { useCampaignStore: useCampaignStore2 } = await Promise.resolve().then(() => campaignStore);
        const campaignStore$1 = useCampaignStore2.getState();
        const packageData = campaignStore$1.getPackage(item.packageId ?? 0);
        if (!packageData) {
          throw new Error(`Package ${item.packageId} not found in campaign data`);
        }
        set((state) => {
          const newItem = {
            id: Date.now(),
            packageId: item.packageId ?? 0,
            quantity: item.quantity ?? 1,
            price: parseFloat(packageData.price_total),
            // Use total package price, not per-unit
            title: item.title ?? packageData.name,
            is_upsell: item.isUpsell ?? false,
            image: item.image ?? void 0,
            sku: item.sku ?? void 0,
            // Add campaign response data for display
            price_per_unit: packageData.price,
            qty: packageData.qty,
            price_total: packageData.price_total,
            price_retail: packageData.price_retail,
            price_retail_total: packageData.price_retail_total,
            price_recurring: packageData.price_recurring,
            is_recurring: packageData.is_recurring,
            interval: packageData.interval,
            interval_count: packageData.interval_count
          };
          if (item.isUpsell) {
            console.log(`[CartStore] Adding upsell item:`, {
              packageId: newItem.packageId,
              isUpsell: item.isUpsell,
              finalItemIsUpsell: newItem.is_upsell,
              itemData: newItem
            });
          }
          const existingIndex = state.items.findIndex(
            (existing) => existing.packageId === newItem.packageId
          );
          let newItems;
          if (existingIndex >= 0) {
            newItems = [...state.items];
            newItems[existingIndex].quantity += newItem.quantity;
          } else {
            newItems = [...state.items, newItem];
          }
          return { ...state, items: newItems };
        });
        get().calculateTotals();
        const eventBus = EventBus.getInstance();
        eventBus.emit("cart:item-added", {
          packageId: item.packageId ?? 0,
          quantity: item.quantity ?? 1
        });
        eventBus.emit("cart:updated", get());
      },
      removeItem: async (packageId) => {
        const removedItem = get().items.find((item) => item.packageId === packageId);
        set((state) => {
          const newItems = state.items.filter((item) => item.packageId !== packageId);
          return { ...state, items: newItems };
        });
        get().calculateTotals();
        if (removedItem) {
          const eventBus = EventBus.getInstance();
          eventBus.emit("cart:item-removed", {
            packageId
          });
          eventBus.emit("cart:updated", get());
        }
      },
      updateQuantity: async (packageId, quantity) => {
        if (quantity <= 0) {
          return get().removeItem(packageId);
        }
        const currentItem = get().items.find((item) => item.packageId === packageId);
        const oldQuantity = currentItem?.quantity ?? 0;
        set((state) => {
          const newItems = state.items.map(
            (item) => item.packageId === packageId ? { ...item, quantity } : item
          );
          return { ...state, items: newItems };
        });
        get().calculateTotals();
        if (currentItem) {
          const eventBus = EventBus.getInstance();
          eventBus.emit("cart:quantity-changed", {
            packageId,
            quantity,
            oldQuantity
          });
          eventBus.emit("cart:updated", get());
        }
      },
      swapPackage: async (removePackageId, addItem) => {
        set((state) => ({ ...state, swapInProgress: true }));
        try {
          await get().removeItem(removePackageId);
          await get().addItem(addItem);
        } finally {
          set((state) => ({ ...state, swapInProgress: false }));
        }
      },
      clear: async () => {
        set((state) => ({
          ...state,
          items: []
        }));
        get().calculateTotals();
      },
      syncWithAPI: async () => {
        console.log("syncWithAPI not yet implemented");
      },
      calculateTotals: async () => {
        try {
          const { useCampaignStore: useCampaignStore2 } = await Promise.resolve().then(() => campaignStore);
          const campaignState = useCampaignStore2.getState();
          const state = get();
          const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
          const isEmpty = state.items.length === 0;
          const formatCurrency = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
          const compareTotal = state.items.reduce((sum, item) => {
            const packageData = campaignState.getPackage(item.packageId);
            let retailTotal = 0;
            if (packageData?.price_retail_total) {
              retailTotal = parseFloat(packageData.price_retail_total);
            } else if (packageData?.price_total) {
              retailTotal = parseFloat(packageData.price_total);
            }
            return sum + retailTotal * item.quantity;
          }, 0);
          const savings = Math.max(0, compareTotal - subtotal);
          const savingsPercentage = compareTotal > 0 ? savings / compareTotal * 100 : 0;
          const hasSavings = savings > 0;
          const shipping = get().calculateShipping();
          const tax = get().calculateTax();
          let totalDiscounts = 0;
          const appliedCoupons = state.appliedCoupons || [];
          const updatedCoupons = appliedCoupons.map((appliedCoupon) => {
            const discountAmount = get().calculateDiscountAmount(appliedCoupon.definition);
            totalDiscounts += discountAmount;
            return {
              ...appliedCoupon,
              discount: discountAmount
            };
          });
          if (updatedCoupons.length > 0) {
            set((currentState) => ({
              ...currentState,
              appliedCoupons: updatedCoupons
            }));
          }
          const total = subtotal + shipping + tax - totalDiscounts;
          const totalSavings = savings + totalDiscounts;
          const totalSavingsPercentage = compareTotal > 0 ? totalSavings / compareTotal * 100 : 0;
          const hasTotalSavings = totalSavings > 0;
          const totals = {
            subtotal: { value: subtotal, formatted: formatCurrency(subtotal) },
            shipping: { value: shipping, formatted: formatCurrency(shipping) },
            tax: { value: tax, formatted: formatCurrency(tax) },
            discounts: { value: totalDiscounts, formatted: formatCurrency(totalDiscounts) },
            total: { value: total, formatted: formatCurrency(total) },
            count: totalQuantity,
            isEmpty,
            savings: { value: savings, formatted: formatCurrency(savings) },
            savingsPercentage: { value: savingsPercentage, formatted: `${Math.round(savingsPercentage)}%` },
            compareTotal: { value: compareTotal, formatted: formatCurrency(compareTotal) },
            hasSavings,
            totalSavings: { value: totalSavings, formatted: formatCurrency(totalSavings) },
            totalSavingsPercentage: { value: totalSavingsPercentage, formatted: `${Math.round(totalSavingsPercentage)}%` },
            hasTotalSavings
          };
          set({
            subtotal,
            shipping,
            tax,
            total,
            totalQuantity,
            isEmpty,
            totals
          });
          await get().calculateEnrichedItems();
        } catch (error) {
          console.error("Error calculating totals:", error);
          set({
            subtotal: 0,
            shipping: 0,
            tax: 0,
            total: 0,
            totalQuantity: 0,
            isEmpty: true,
            totals: {
              subtotal: { value: 0, formatted: "$0.00" },
              shipping: { value: 0, formatted: "$0.00" },
              tax: { value: 0, formatted: "$0.00" },
              discounts: { value: 0, formatted: "$0.00" },
              total: { value: 0, formatted: "$0.00" },
              count: 0,
              isEmpty: true,
              savings: { value: 0, formatted: "$0.00" },
              savingsPercentage: { value: 0, formatted: "0%" },
              compareTotal: { value: 0, formatted: "$0.00" },
              hasSavings: false,
              totalSavings: { value: 0, formatted: "$0.00" },
              totalSavingsPercentage: { value: 0, formatted: "0%" },
              hasTotalSavings: false
            }
          });
        }
      },
      hasItem: (packageId) => {
        const state = get();
        return state.items.some((item) => item.packageId === packageId);
      },
      getItem: (packageId) => {
        const state = get();
        return state.items.find((item) => item.packageId === packageId);
      },
      getItemQuantity: (packageId) => {
        const state = get();
        const item = state.items.find((item2) => item2.packageId === packageId);
        return item?.quantity ?? 0;
      },
      calculateShipping: () => {
        const state = get();
        if (state.isEmpty || state.items.length === 0) {
          return 0;
        }
        if (state.shippingMethod) {
          return state.shippingMethod.price;
        }
        return 0;
      },
      calculateTax: () => {
        return 0;
      },
      setShippingMethod: async (methodId) => {
        try {
          const { useCampaignStore: useCampaignStore2 } = await Promise.resolve().then(() => campaignStore);
          const { useCheckoutStore: useCheckoutStore2 } = await Promise.resolve().then(() => checkoutStore);
          const campaignStore$1 = useCampaignStore2.getState();
          const checkoutStore$1 = useCheckoutStore2.getState();
          const campaignData = campaignStore$1.data;
          if (!campaignData?.shipping_methods) {
            throw new Error("No shipping methods available");
          }
          const shippingMethod = campaignData.shipping_methods.find(
            (method) => method.ref_id === methodId
          );
          if (!shippingMethod) {
            throw new Error(`Shipping method ${methodId} not found`);
          }
          const price = parseFloat(shippingMethod.price || "0");
          set((state) => ({
            ...state,
            shippingMethod: {
              id: shippingMethod.ref_id,
              name: shippingMethod.code,
              price,
              code: shippingMethod.code
            }
          }));
          checkoutStore$1.setShippingMethod({
            id: shippingMethod.ref_id,
            name: shippingMethod.code,
            price,
            code: shippingMethod.code
          });
          get().calculateTotals();
          const eventBus = EventBus.getInstance();
          eventBus.emit("shipping:method-changed", {
            methodId,
            method: shippingMethod
          });
        } catch (error) {
          console.error("Failed to set shipping method:", error);
          throw error;
        }
      },
      getTotalWeight: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },
      getTotalItemCount: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },
      calculateEnrichedItems: async () => {
        try {
          const { useCampaignStore: useCampaignStore2 } = await Promise.resolve().then(() => campaignStore);
          const campaignState = useCampaignStore2.getState();
          const state = get();
          const formatCurrency = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
          const enrichedItems = state.items.map((item) => {
            const packageData = campaignState.getPackage(item.packageId);
            const actualUnitPrice = parseFloat(packageData?.price || "0");
            const retailUnitPrice = parseFloat(packageData?.price_retail || packageData?.price || "0");
            const packagePrice = item.price;
            const lineTotal = packagePrice * item.quantity;
            let retailPackagePrice = 0;
            if (packageData?.price_retail_total) {
              retailPackagePrice = parseFloat(packageData.price_retail_total);
            } else if (packageData?.price_total) {
              retailPackagePrice = parseFloat(packageData.price_total);
            }
            const retailLineTotal = retailPackagePrice * item.quantity;
            const unitSavings = Math.max(0, retailUnitPrice - actualUnitPrice);
            const lineSavings = Math.max(0, retailLineTotal - lineTotal);
            const savingsPct = retailUnitPrice > actualUnitPrice ? Math.round(unitSavings / retailUnitPrice * 100) : 0;
            const hasRecurring = packageData?.is_recurring === true;
            const recurringPrice = hasRecurring ? parseFloat(packageData?.price_recurring || "0") : 0;
            const frequencyText = hasRecurring ? packageData?.interval_count && packageData.interval_count > 1 ? `Every ${packageData.interval_count} ${packageData.interval}s` : `Per ${packageData.interval}` : "One time";
            return {
              id: item.id,
              packageId: item.packageId,
              quantity: item.quantity,
              price: {
                excl_tax: { value: actualUnitPrice, formatted: formatCurrency(actualUnitPrice) },
                incl_tax: { value: actualUnitPrice, formatted: formatCurrency(actualUnitPrice) },
                original: { value: retailUnitPrice, formatted: formatCurrency(retailUnitPrice) },
                savings: { value: unitSavings, formatted: formatCurrency(unitSavings) },
                recurring: { value: recurringPrice, formatted: formatCurrency(recurringPrice) },
                // Line totals
                lineTotal: { value: lineTotal, formatted: formatCurrency(lineTotal) },
                lineCompare: { value: retailLineTotal, formatted: formatCurrency(retailLineTotal) },
                lineSavings: { value: lineSavings, formatted: formatCurrency(lineSavings) },
                // Calculated fields
                savingsPct: { value: savingsPct, formatted: `${savingsPct}%` }
              },
              product: {
                title: item.title || packageData?.name || "",
                sku: packageData?.external_id?.toString() || "",
                image: item.image || packageData?.image || ""
              },
              is_upsell: item.is_upsell ?? false,
              is_recurring: hasRecurring,
              interval: packageData?.interval || void 0,
              interval_count: packageData?.interval_count,
              frequency: frequencyText,
              is_bundle: false,
              bundleComponents: void 0,
              // Conditional flags for templates
              hasSavings: lineSavings > 0,
              hasComparePrice: retailUnitPrice > actualUnitPrice,
              showCompare: retailUnitPrice > actualUnitPrice ? "show" : "hide",
              showSavings: lineSavings > 0 ? "show" : "hide",
              showRecurring: hasRecurring ? "show" : "hide"
            };
          });
          set({ enrichedItems });
        } catch (error) {
          console.error("Error calculating enriched items:", error);
        }
      },
      // Coupon methods
      applyCoupon: async (code) => {
        const { useConfigStore } = await Promise.resolve().then(() => configStore$1);
        const configState = useConfigStore.getState();
        const state = get();
        const normalizedCode = code.toUpperCase().trim();
        if ((state.appliedCoupons || []).some((c) => c.code === normalizedCode)) {
          return { success: false, message: "Coupon already applied" };
        }
        const discount = configState.discounts[normalizedCode];
        if (!discount) {
          return { success: false, message: "Invalid coupon code" };
        }
        const validation = get().validateCoupon(normalizedCode);
        if (!validation.valid) {
          return { success: false, message: validation.message || "Coupon cannot be applied" };
        }
        set((state2) => ({
          ...state2,
          appliedCoupons: [...state2.appliedCoupons, {
            code: normalizedCode,
            discount: 0,
            // Will be calculated dynamically in calculateTotals
            definition: discount
          }]
        }));
        get().calculateTotals();
        return { success: true, message: `Coupon ${normalizedCode} applied successfully` };
      },
      removeCoupon: (code) => {
        set((state) => ({
          ...state,
          appliedCoupons: (state.appliedCoupons || []).filter((c) => c.code !== code)
        }));
        get().calculateTotals();
      },
      getCoupons: () => {
        return get().appliedCoupons || [];
      },
      validateCoupon: (code) => {
        const state = get();
        const windowConfig = window.nextConfig;
        if (!windowConfig?.discounts) {
          return { valid: false, message: "No discounts configured" };
        }
        const discount = windowConfig.discounts[code];
        if (!discount) {
          return { valid: false, message: "Invalid coupon code" };
        }
        if (discount.minOrderValue && state.subtotal < discount.minOrderValue) {
          return { valid: false, message: `Minimum order value of $${discount.minOrderValue} required` };
        }
        if (!discount.combinable && (state.appliedCoupons || []).length > 0) {
          return { valid: false, message: "Cannot combine with other coupons" };
        }
        return { valid: true };
      },
      calculateDiscountAmount: (coupon) => {
        const state = get();
        let discountAmount = 0;
        if (coupon.scope === "order") {
          if (coupon.type === "percentage") {
            discountAmount = state.subtotal * (coupon.value / 100);
            if (coupon.maxDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
          } else {
            discountAmount = coupon.value;
          }
        } else if (coupon.scope === "package" && coupon.packageIds) {
          const eligibleTotal = state.items.filter((item) => coupon.packageIds?.includes(item.packageId)).reduce((sum, item) => sum + item.price * item.quantity, 0);
          if (coupon.type === "percentage") {
            discountAmount = eligibleTotal * (coupon.value / 100);
            if (coupon.maxDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
          } else {
            discountAmount = Math.min(coupon.value, eligibleTotal);
          }
        }
        return Math.min(discountAmount, state.subtotal);
      },
      reset: () => {
        set(initialState$5);
      }
    })),
    {
      name: CART_STORAGE_KEY,
      storage: {
        getItem: (name) => {
          const value = sessionStorageManager.get(name);
          return value;
        },
        setItem: (name, value) => {
          sessionStorageManager.set(name, value);
        },
        removeItem: (name) => {
          sessionStorageManager.remove(name);
        }
      },
      partialize: (state) => ({
        items: state.items,
        appliedCoupons: state.appliedCoupons,
        subtotal: state.subtotal,
        shipping: state.shipping,
        shippingMethod: state.shippingMethod,
        // Include shipping method to persist selection
        tax: state.tax,
        total: state.total,
        totalQuantity: state.totalQuantity,
        isEmpty: state.isEmpty,
        totals: state.totals,
        enrichedItems: []
        // Include but keep empty - will be recalculated
      })
    }
  )
);
const useCartStore = cartStoreInstance;
const CACHE_EXPIRY_MS = 5 * 60 * 1e3;
const initialState$4 = {
  data: null,
  packages: [],
  isLoading: false,
  error: null
};
const campaignStoreInstance = create((set, get) => ({
  ...initialState$4,
  loadCampaign: async (apiKey) => {
    set({ isLoading: true, error: null });
    try {
      const cachedData = sessionStorageManager.get(CAMPAIGN_STORAGE_KEY);
      const now = Date.now();
      if (cachedData && cachedData.apiKey === apiKey && now - cachedData.timestamp < CACHE_EXPIRY_MS) {
        console.log(
          "🎯 Using cached campaign data (expires in",
          Math.round((CACHE_EXPIRY_MS - (now - cachedData.timestamp)) / 1e3),
          "seconds)"
        );
        const { useConfigStore: useConfigStore2 } = await Promise.resolve().then(() => configStore$1);
        if (cachedData.campaign.payment_env_key) {
          useConfigStore2.getState().setSpreedlyEnvironmentKey(cachedData.campaign.payment_env_key);
          console.log("💳 Spreedly environment key updated from cached campaign data");
        }
        set({
          data: cachedData.campaign,
          packages: cachedData.campaign.packages,
          isLoading: false,
          error: null
        });
        return;
      }
      console.log("🌐 Fetching fresh campaign data from API...");
      const { ApiClient: ApiClient2 } = await Promise.resolve().then(() => client);
      const client$1 = new ApiClient2(apiKey);
      const campaign = await client$1.getCampaigns();
      if (!campaign) {
        throw new Error("Campaign data not found");
      }
      const { useConfigStore } = await Promise.resolve().then(() => configStore$1);
      if (campaign.payment_env_key) {
        useConfigStore.getState().setSpreedlyEnvironmentKey(campaign.payment_env_key);
        console.log("💳 Spreedly environment key updated from campaign API:", campaign.payment_env_key);
      }
      const cacheData = {
        campaign,
        timestamp: now,
        apiKey
      };
      sessionStorageManager.set(CAMPAIGN_STORAGE_KEY, cacheData);
      console.log("💾 Campaign data cached for 5 minutes");
      set({
        data: campaign,
        packages: campaign.packages,
        isLoading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load campaign";
      set({
        data: null,
        packages: [],
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },
  getPackage: (id) => {
    const { packages } = get();
    return packages.find((pkg) => pkg.ref_id === id) ?? null;
  },
  getProduct: (id) => {
    return get().getPackage(id);
  },
  setError: (error) => {
    set({ error });
  },
  reset: () => {
    set(initialState$4);
  },
  clearCache: () => {
    sessionStorageManager.remove(CAMPAIGN_STORAGE_KEY);
    console.log("🗑️ Campaign cache cleared");
  },
  getCacheInfo: () => {
    const cachedData = sessionStorageManager.get(CAMPAIGN_STORAGE_KEY);
    if (!cachedData) {
      return { cached: false };
    }
    const now = Date.now();
    const timeLeft = CACHE_EXPIRY_MS - (now - cachedData.timestamp);
    return {
      cached: true,
      expiresIn: Math.max(0, Math.round(timeLeft / 1e3)),
      // seconds until expiry
      apiKey: cachedData.apiKey
    };
  }
}));
const useCampaignStore = campaignStoreInstance;
const campaignStore = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  useCampaignStore
}, Symbol.toStringTag, { value: "Module" }));
const initialState$3 = {
  step: 1,
  isProcessing: false,
  errors: {},
  formData: {},
  paymentMethod: "credit-card",
  sameAsShipping: true,
  testMode: false,
  vouchers: []
};
const useCheckoutStore = create((set) => ({
  ...initialState$3,
  setStep: (step) => {
    set({ step });
  },
  setProcessing: (isProcessing) => {
    set({ isProcessing });
  },
  setError: (field, error) => {
    set((state) => ({
      errors: { ...state.errors, [field]: error }
    }));
  },
  clearError: (field) => {
    set((state) => {
      const { [field]: _, ...errors } = state.errors;
      return { errors };
    });
  },
  clearAllErrors: () => {
    set({ errors: {} });
  },
  updateFormData: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data }
    }));
  },
  setPaymentToken: (paymentToken) => {
    set({ paymentToken });
  },
  setPaymentMethod: (paymentMethod) => {
    set({ paymentMethod });
  },
  setShippingMethod: (shippingMethod) => {
    set({ shippingMethod });
  },
  setBillingAddress: (billingAddress) => {
    set({ billingAddress });
  },
  setSameAsShipping: (sameAsShipping) => {
    set({ sameAsShipping });
  },
  setTestMode: (testMode) => {
    set({ testMode });
  },
  addVoucher: (code) => {
    set((state) => ({
      vouchers: [...state.vouchers, code]
    }));
  },
  removeVoucher: (code) => {
    set((state) => ({
      vouchers: state.vouchers.filter((v) => v !== code)
    }));
  },
  reset: () => {
    set(initialState$3);
  }
}));
const checkoutStore = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  useCheckoutStore
}, Symbol.toStringTag, { value: "Module" }));
class NextCommerce {
  constructor() {
    this.callbacks = /* @__PURE__ */ new Map();
    this.exitIntentEnhancer = null;
    this.fomoEnhancer = null;
    this.logger = new Logger("NextCommerce");
    this.eventBus = EventBus.getInstance();
  }
  static getInstance() {
    if (!NextCommerce.instance) {
      NextCommerce.instance = new NextCommerce();
    }
    return NextCommerce.instance;
  }
  // Cart manipulation methods
  hasItemInCart(options) {
    const cartStore = useCartStore.getState();
    if (options.packageId) {
      return cartStore.items.some((item) => item.packageId === options.packageId);
    }
    return false;
  }
  async addItem(options) {
    const cartStore = useCartStore.getState();
    const quantity = options.quantity ?? 1;
    if (options.packageId) {
      await cartStore.addItem({
        packageId: options.packageId,
        quantity,
        isUpsell: false
      });
    }
  }
  async removeItem(options) {
    const cartStore = useCartStore.getState();
    if (options.packageId) {
      await cartStore.removeItem(options.packageId);
    }
  }
  async updateQuantity(options) {
    const cartStore = useCartStore.getState();
    if (options.packageId) {
      await cartStore.updateQuantity(options.packageId, options.quantity);
    }
  }
  async clearCart() {
    const cartStore = useCartStore.getState();
    await cartStore.clear();
  }
  // Cart data access
  getCartData() {
    const cartStore = useCartStore.getState();
    const campaignStore2 = useCampaignStore.getState();
    return {
      cartLines: cartStore.enrichedItems,
      cartTotals: cartStore.totals,
      campaignData: campaignStore2.data,
      appliedCoupons: cartStore.getCoupons()
    };
  }
  getCartTotals() {
    const cartStore = useCartStore.getState();
    return cartStore.totals;
  }
  getCartCount() {
    const cartStore = useCartStore.getState();
    return cartStore.totalQuantity;
  }
  // Campaign data access
  getCampaignData() {
    const campaignStore2 = useCampaignStore.getState();
    return campaignStore2.data;
  }
  getPackage(id) {
    const campaignStore2 = useCampaignStore.getState();
    return campaignStore2.getPackage(id);
  }
  // Event and callback registration
  on(event, handler) {
    this.eventBus.on(event, handler);
  }
  off(event, handler) {
    this.eventBus.off(event, handler);
  }
  registerCallback(type, callback) {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, /* @__PURE__ */ new Set());
    }
    this.callbacks.get(type).add(callback);
  }
  unregisterCallback(type, callback) {
    this.callbacks.get(type)?.delete(callback);
  }
  triggerCallback(type, data) {
    this.callbacks.get(type)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        this.logger.error(`Callback error for ${type}:`, error);
      }
    });
  }
  // Analytics methods (v2 system)
  async trackViewItemList(packageIds, _listId, listName) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-BpSKXVqT.js");
        nextAnalytics.trackViewItemList(packageIds, listName);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackViewItem(packageId) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-BpSKXVqT.js");
        nextAnalytics.trackViewItem(packageId);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackAddToCart(packageId, quantity) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-BpSKXVqT.js");
        const item = {
          id: String(packageId),
          packageId,
          quantity: quantity || 1
        };
        nextAnalytics.trackAddToCart(item);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackRemoveFromCart(packageId, quantity) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics, EcommerceEvents } = await import("./index-BpSKXVqT.js");
        nextAnalytics.track(EcommerceEvents.createRemoveFromCartEvent({ packageId, quantity: quantity || 1 }));
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackBeginCheckout() {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-BpSKXVqT.js");
        nextAnalytics.trackBeginCheckout();
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackPurchase(orderData) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-BpSKXVqT.js");
        nextAnalytics.trackPurchase(orderData);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackCustomEvent(eventName, data) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-BpSKXVqT.js");
        nextAnalytics.track({ event: eventName, ...data });
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  // User tracking methods
  async trackSignUp(email) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-BpSKXVqT.js");
        nextAnalytics.trackSignUp(email);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackLogin(email) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-BpSKXVqT.js");
        nextAnalytics.trackLogin(email);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  // Advanced analytics methods
  async setDebugMode(enabled) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-BpSKXVqT.js");
        nextAnalytics.setDebugMode(enabled);
      } catch (error) {
        this.logger.debug("Analytics debug mode failed (non-critical):", error);
      }
    });
  }
  async invalidateAnalyticsContext() {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-BpSKXVqT.js");
        nextAnalytics.invalidateContext();
      } catch (error) {
        this.logger.debug("Analytics context invalidation failed (non-critical):", error);
      }
    });
  }
  // Shipping methods
  getShippingMethods() {
    const campaignStore2 = useCampaignStore.getState();
    return campaignStore2.data?.shipping_methods || [];
  }
  getSelectedShippingMethod() {
    const checkoutStore2 = useCheckoutStore.getState();
    return checkoutStore2.shippingMethod || null;
  }
  async setShippingMethod(methodId) {
    const cartStore = useCartStore.getState();
    await cartStore.setShippingMethod(methodId);
  }
  // Utility methods
  formatPrice(amount, currency) {
    const campaignStore2 = useCampaignStore.getState();
    const useCurrency = currency ?? campaignStore2.data?.currency ?? "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: useCurrency
    }).format(amount);
  }
  validateCheckout() {
    const cartStore = useCartStore.getState();
    const errors = [];
    if (cartStore.items.length === 0) {
      errors.push("Cart is empty");
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
  // Coupon methods
  async applyCoupon(code) {
    const cartStore = useCartStore.getState();
    return await cartStore.applyCoupon(code);
  }
  removeCoupon(code) {
    const cartStore = useCartStore.getState();
    cartStore.removeCoupon(code);
  }
  getCoupons() {
    const cartStore = useCartStore.getState();
    return cartStore.getCoupons();
  }
  validateCoupon(code) {
    const cartStore = useCartStore.getState();
    return cartStore.validateCoupon(code);
  }
  calculateDiscountAmount(coupon) {
    const cartStore = useCartStore.getState();
    return cartStore.calculateDiscountAmount(coupon);
  }
  // Exit Intent - Simple approach
  async exitIntent(options) {
    try {
      if (!this.exitIntentEnhancer) {
        const { ExitIntentEnhancer } = await import("./SimpleExitIntentEnhancer-pK8KY1wA.js");
        this.exitIntentEnhancer = new ExitIntentEnhancer();
        await this.exitIntentEnhancer.initialize();
      }
      this.exitIntentEnhancer.setup(options);
      this.logger.debug("Exit intent configured with image:", options.image);
    } catch (error) {
      this.logger.error("Failed to setup exit intent:", error);
      throw error;
    }
  }
  disableExitIntent() {
    if (this.exitIntentEnhancer) {
      this.exitIntentEnhancer.disable();
    }
  }
  async fomo(config) {
    try {
      if (!this.fomoEnhancer) {
        const { FomoPopupEnhancer } = await import("./FomoPopupEnhancer-D_EfB-YE.js");
        this.fomoEnhancer = new FomoPopupEnhancer();
        await this.fomoEnhancer.initialize();
      }
      this.fomoEnhancer.setup(config);
      this.fomoEnhancer.start();
      this.logger.debug("FOMO popup started");
    } catch (error) {
      this.logger.error("Failed to start FOMO popup:", error);
      throw error;
    }
  }
  stopFomo() {
    if (this.fomoEnhancer) {
      this.fomoEnhancer.stop();
    }
  }
}
const initialState$2 = {
  apiKey: "",
  campaignId: "",
  debug: false,
  pageType: "product",
  // spreedlyEnvironmentKey: undefined, - omitted to avoid exactOptionalPropertyTypes issue
  paymentConfig: {},
  googleMapsConfig: {},
  addressConfig: {},
  // Additional configuration with enterprise defaults
  autoInit: true,
  rateLimit: 4,
  cacheTtl: 300,
  retryAttempts: 3,
  timeout: 1e4,
  testMode: false,
  // API and performance settings
  maxRetries: 3,
  requestTimeout: 3e4,
  enableAnalytics: true,
  enableDebugMode: false,
  // Environment and deployment settings
  environment: "production",
  // version: undefined, - omitted
  // buildTimestamp: undefined, - omitted
  // Discount system
  discounts: {},
  // Attribution
  // utmTransfer: undefined, - omitted
  // Tracking configuration
  tracking: "auto"
  // 'auto', 'manual', 'disabled'
  // Monitoring configuration (not set by default)
  // monitoring: undefined - omitted,
};
const configStore = create((set, _get) => ({
  ...initialState$2,
  loadFromMeta: () => {
    if (typeof document === "undefined") return;
    const updates = {};
    const apiKeyMeta = document.querySelector('meta[name="next-api-key"]');
    if (apiKeyMeta) {
      updates.apiKey = apiKeyMeta.getAttribute("content") ?? "";
    }
    const campaignIdMeta = document.querySelector('meta[name="next-campaign-id"]');
    if (campaignIdMeta) {
      updates.campaignId = campaignIdMeta.getAttribute("content") ?? "";
    }
    const debugMeta = document.querySelector('meta[name="next-debug"]');
    if (debugMeta) {
      updates.debug = debugMeta.getAttribute("content") === "true";
    }
    const pageTypeMeta = document.querySelector('meta[name="next-page-type"]');
    if (pageTypeMeta) {
      updates.pageType = pageTypeMeta.getAttribute("content");
    }
    const spreedlyKeyMeta = document.querySelector('meta[name="next-spreedly-key"]') || document.querySelector('meta[name="next-payment-env-key"]');
    if (spreedlyKeyMeta) {
      const spreedlyKey = spreedlyKeyMeta.getAttribute("content");
      if (spreedlyKey) {
        updates.spreedlyEnvironmentKey = spreedlyKey;
      }
    }
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },
  loadFromWindow: () => {
    if (typeof window === "undefined") return;
    const windowConfig = window.nextConfig;
    if (!windowConfig || typeof windowConfig !== "object") return;
    const updates = {};
    if (typeof windowConfig.apiKey === "string") {
      updates.apiKey = windowConfig.apiKey;
    }
    if (typeof windowConfig.campaignId === "string") {
      updates.campaignId = windowConfig.campaignId;
    }
    if (typeof windowConfig.debug === "boolean") {
      updates.debug = windowConfig.debug;
    }
    if (typeof windowConfig.pageType === "string") {
      updates.pageType = windowConfig.pageType;
    }
    if (typeof windowConfig.spreedlyEnvironmentKey === "string") {
      updates.spreedlyEnvironmentKey = windowConfig.spreedlyEnvironmentKey;
    }
    if (windowConfig.payment && typeof windowConfig.payment === "object") {
      updates.paymentConfig = windowConfig.payment;
    }
    if (windowConfig.paymentConfig && typeof windowConfig.paymentConfig === "object") {
      updates.paymentConfig = windowConfig.paymentConfig;
    }
    if (windowConfig.googleMaps && typeof windowConfig.googleMaps === "object") {
      updates.googleMapsConfig = windowConfig.googleMaps;
    }
    if (windowConfig.addressConfig && typeof windowConfig.addressConfig === "object") {
      updates.addressConfig = windowConfig.addressConfig;
    }
    if (windowConfig.discounts && typeof windowConfig.discounts === "object") {
      updates.discounts = windowConfig.discounts;
    }
    if (typeof windowConfig.tracking === "string") {
      updates.tracking = windowConfig.tracking;
    }
    if (windowConfig.analytics && typeof windowConfig.analytics === "object") {
      updates.analytics = windowConfig.analytics;
    }
    if (windowConfig.monitoring && typeof windowConfig.monitoring === "object") {
      updates.monitoring = windowConfig.monitoring;
    }
    if (windowConfig.utmTransfer && typeof windowConfig.utmTransfer === "object") {
      updates.utmTransfer = windowConfig.utmTransfer;
    }
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },
  updateConfig: (config) => {
    set((state) => ({ ...state, ...config }));
  },
  setSpreedlyEnvironmentKey: (key) => {
    set({ spreedlyEnvironmentKey: key });
  },
  reset: () => {
    set(initialState$2);
  }
}));
const configStore$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  configStore,
  useConfigStore: configStore
}, Symbol.toStringTag, { value: "Module" }));
const logger = createLogger("OrderStore");
const initialState$1 = {
  order: null,
  refId: null,
  orderLoadedAt: null,
  isLoading: false,
  isProcessingUpsell: false,
  error: null,
  upsellError: null,
  pendingUpsells: [],
  completedUpsells: [],
  completedUpsellPages: [],
  viewedUpsells: [],
  viewedUpsellPages: [],
  upsellJourney: []
};
const useOrderStore = create()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState$1,
        // Order management
        setOrder: (order) => {
          logger.debug("Setting order data:", order);
          set({
            order,
            error: null,
            orderLoadedAt: Date.now()
          });
        },
        setRefId: (refId) => {
          logger.debug("Setting ref ID:", refId);
          set({ refId });
        },
        loadOrder: async (refId, apiClient) => {
          const state = get();
          if (state.order && state.refId === refId && !get().isOrderExpired()) {
            logger.info("Using cached order data:", refId);
            return;
          }
          if (state.isLoading) {
            logger.warn("Order loading already in progress");
            return;
          }
          logger.info("Loading order:", refId);
          set({ isLoading: true, error: null, refId });
          try {
            const order = await apiClient.getOrder(refId);
            logger.info("Order loaded successfully:", order);
            const upsellPackageIds = [];
            if (order.lines && Array.isArray(order.lines)) {
              order.lines.forEach((line) => {
                if (line.is_upsell && line.product_sku) {
                  const skuMatch = line.product_sku.match(/(\d+)/);
                  if (skuMatch) {
                    upsellPackageIds.push(skuMatch[1]);
                  } else {
                    upsellPackageIds.push(line.product_sku);
                  }
                  logger.debug("Detected upsell line:", {
                    sku: line.product_sku,
                    title: line.product_title,
                    extractedId: skuMatch ? skuMatch[1] : line.product_sku
                  });
                }
              });
            }
            set({
              order,
              isLoading: false,
              isProcessingUpsell: false,
              // Reset processing state when loading order
              error: null,
              orderLoadedAt: Date.now(),
              completedUpsells: upsellPackageIds,
              // Reset journey when loading a new order
              upsellJourney: [],
              viewedUpsells: [],
              viewedUpsellPages: []
            });
            logger.debug("Populated completed upsells from order:", upsellPackageIds);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to load order";
            logger.error("Failed to load order:", error);
            set({
              isLoading: false,
              error: errorMessage,
              order: null
            });
          }
        },
        clearOrder: () => {
          logger.debug("Clearing order data");
          set({
            order: null,
            refId: null,
            error: null,
            orderLoadedAt: null
          });
        },
        isOrderExpired: () => {
          const state = get();
          if (!state.orderLoadedAt) return true;
          const EXPIRY_TIME = 15 * 60 * 1e3;
          const now = Date.now();
          const isExpired = now - state.orderLoadedAt > EXPIRY_TIME;
          if (isExpired) {
            logger.info("Order data has expired (>15 minutes old)");
          }
          return isExpired;
        },
        // Upsell management
        addUpsell: async (upsellData, apiClient) => {
          const state = get();
          if (!state.refId) {
            const error = "No order reference ID available";
            logger.error(error);
            set({ upsellError: error });
            return null;
          }
          if (state.isProcessingUpsell) {
            logger.warn("Upsell processing already in progress");
            return null;
          }
          logger.info("Adding upsell to order:", state.refId, upsellData);
          set({ isProcessingUpsell: true, upsellError: null });
          try {
            const updatedOrder = await apiClient.addUpsell(state.refId, upsellData);
            logger.info("Upsell added successfully:", updatedOrder);
            const currentPagePath = window.location.pathname;
            const packageIds = upsellData.lines.map((line) => line.package_id.toString());
            const journeyEntries = packageIds.map((id) => ({
              packageId: id,
              pagePath: currentPagePath,
              action: "accepted",
              timestamp: Date.now()
            }));
            set({
              order: updatedOrder,
              isProcessingUpsell: false,
              upsellError: null,
              orderLoadedAt: Date.now(),
              // Refresh the timestamp
              completedUpsells: [...state.completedUpsells, ...packageIds],
              // Keep for backward compatibility
              completedUpsellPages: state.completedUpsellPages.includes(currentPagePath) ? state.completedUpsellPages : [...state.completedUpsellPages, currentPagePath],
              upsellJourney: [...state.upsellJourney, ...journeyEntries]
            });
            return updatedOrder;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to add upsell";
            logger.error("Failed to add upsell:", error);
            set({
              isProcessingUpsell: false,
              upsellError: errorMessage
            });
            return null;
          }
        },
        addPendingUpsell: (upsellData) => {
          const state = get();
          logger.debug("Adding pending upsell:", upsellData);
          set({
            pendingUpsells: [...state.pendingUpsells, upsellData]
          });
        },
        removePendingUpsell: (index) => {
          const state = get();
          const newPendingUpsells = [...state.pendingUpsells];
          newPendingUpsells.splice(index, 1);
          logger.debug("Removing pending upsell at index:", index);
          set({ pendingUpsells: newPendingUpsells });
        },
        clearPendingUpsells: () => {
          logger.debug("Clearing pending upsells");
          set({ pendingUpsells: [] });
        },
        markUpsellCompleted: (packageId) => {
          const state = get();
          if (!state.completedUpsells.includes(packageId)) {
            logger.debug("Marking upsell as completed:", packageId);
            set({
              completedUpsells: [...state.completedUpsells, packageId]
            });
          }
        },
        markUpsellViewed: (packageId) => {
          const state = get();
          if (!state.viewedUpsells.includes(packageId)) {
            logger.debug("Marking upsell as viewed:", packageId);
            const journeyEntry = {
              packageId,
              action: "viewed",
              timestamp: Date.now()
            };
            set({
              viewedUpsells: [...state.viewedUpsells, packageId],
              upsellJourney: [...state.upsellJourney, journeyEntry]
            });
          }
        },
        markUpsellPageViewed: (pagePath) => {
          const state = get();
          if (!state.viewedUpsellPages.includes(pagePath)) {
            logger.debug("Marking upsell page as viewed:", pagePath);
            const journeyEntry = {
              pagePath,
              action: "viewed",
              timestamp: Date.now()
            };
            set({
              viewedUpsellPages: [...state.viewedUpsellPages, pagePath],
              upsellJourney: [...state.upsellJourney, journeyEntry],
              isProcessingUpsell: false,
              // Reset processing state when viewing new page
              upsellError: null
              // Clear any previous errors
            });
          }
        },
        markUpsellSkipped: (packageId, pagePath) => {
          const state = get();
          logger.debug("Marking upsell as skipped:", { packageId, pagePath });
          const journeyEntry = {
            action: "skipped",
            timestamp: Date.now()
          };
          if (packageId !== void 0) journeyEntry.packageId = packageId;
          if (pagePath !== void 0) journeyEntry.pagePath = pagePath;
          set({
            upsellJourney: [...state.upsellJourney, journeyEntry],
            isProcessingUpsell: false,
            // Reset processing state when skipping
            upsellError: null
            // Clear any errors
          });
        },
        // Error handling
        setError: (error) => set({ error }),
        setUpsellError: (error) => set({ upsellError: error }),
        clearErrors: () => set({ error: null, upsellError: null }),
        // Loading states
        setLoading: (loading) => set({ isLoading: loading }),
        setProcessingUpsell: (processing) => set({ isProcessingUpsell: processing }),
        // Utility methods
        hasUpsellPageBeenCompleted: (pagePath) => {
          const state = get();
          return state.completedUpsellPages.includes(pagePath);
        },
        hasUpsellBeenViewed: (packageId) => {
          const state = get();
          return state.viewedUpsells.includes(packageId);
        },
        hasUpsellPageBeenViewed: (pagePath) => {
          const state = get();
          return state.viewedUpsellPages.includes(pagePath);
        },
        getUpsellJourney: () => {
          const state = get();
          return state.upsellJourney;
        },
        getOrderTotal: () => {
          const state = get();
          if (!state.order) return 0;
          return parseFloat(state.order.total_incl_tax || "0");
        },
        canAddUpsells: () => {
          const state = get();
          return !!(state.order && state.order.supports_post_purchase_upsells && !state.isProcessingUpsell);
        },
        reset: () => {
          logger.debug("Resetting order store");
          set(initialState$1);
        }
      }),
      {
        name: "next-order",
        storage: {
          getItem: (name) => {
            const str = sessionStorage.getItem(name);
            return str ? JSON.parse(str) : null;
          },
          setItem: (name, value) => {
            sessionStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name) => {
            sessionStorage.removeItem(name);
          }
        }
      }
    ),
    {
      name: "order-store"
    }
  )
);
const initialState = {
  // Attribution fields
  affiliate: "",
  funnel: "",
  gclid: "",
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: "",
  subaffiliate1: "",
  subaffiliate2: "",
  subaffiliate3: "",
  subaffiliate4: "",
  subaffiliate5: "",
  // Metadata
  metadata: {
    landing_page: "",
    referrer: "",
    device: "",
    device_type: "desktop",
    domain: "",
    timestamp: Date.now()
  },
  // Timestamps
  first_visit_timestamp: Date.now(),
  current_visit_timestamp: Date.now()
};
const useAttributionStore = create()(
  persist(
    (set, get) => ({
      ...initialState,
      initialize: async () => {
        try {
          const { AttributionCollector } = await import("./AttributionCollector-C2WwjCQi.js");
          const collector = new AttributionCollector();
          const data = await collector.collect();
          set((state) => ({
            ...state,
            ...data,
            // Preserve first visit timestamp if it exists
            first_visit_timestamp: state.first_visit_timestamp || data.first_visit_timestamp
          }));
        } catch (error) {
          console.error("[AttributionStore] Error initializing attribution:", error);
        }
      },
      updateAttribution: (data) => {
        set((state) => ({
          ...state,
          ...data,
          metadata: data.metadata ? { ...state.metadata, ...data.metadata } : state.metadata,
          current_visit_timestamp: Date.now()
        }));
      },
      setFunnelName: (funnel) => {
        if (!funnel) {
          console.warn("[AttributionStore] Cannot set empty funnel name");
          return;
        }
        const currentState = get();
        if (currentState.funnel) {
          console.info(`[AttributionStore] Funnel already set to: ${currentState.funnel}, ignoring new value: ${funnel}`);
          return;
        }
        const persistedFunnel = localStorage.getItem("next_funnel_name") || sessionStorage.getItem("next_funnel_name");
        if (persistedFunnel) {
          console.info(`[AttributionStore] Funnel already persisted as: ${persistedFunnel}, ignoring new value: ${funnel}`);
          set({ funnel: persistedFunnel });
          return;
        }
        set({ funnel });
        try {
          sessionStorage.setItem("next_funnel_name", funnel);
          localStorage.setItem("next_funnel_name", funnel);
          console.info(`[AttributionStore] Funnel name set and persisted: ${funnel}`);
        } catch (error) {
          console.error("[AttributionStore] Error persisting funnel name:", error);
        }
      },
      setEverflowClickId: (evclid) => {
        if (!evclid) {
          console.warn("[AttributionStore] Cannot set empty Everflow click ID");
          return;
        }
        localStorage.setItem("evclid", evclid);
        sessionStorage.setItem("evclid", evclid);
        set((state) => ({
          ...state,
          metadata: {
            ...state.metadata,
            everflow_transaction_id: evclid
          }
        }));
        console.info(`[AttributionStore] Everflow click ID set to: ${evclid}`);
      },
      getAttributionForApi: () => {
        const state = get();
        const attribution = {};
        if (state.affiliate !== void 0) attribution.affiliate = state.affiliate;
        if (state.funnel !== void 0) attribution.funnel = state.funnel;
        if (state.gclid !== void 0) attribution.gclid = state.gclid;
        if (state.metadata !== void 0) attribution.metadata = state.metadata;
        if (state.utm_source !== void 0) attribution.utm_source = state.utm_source;
        if (state.utm_medium !== void 0) attribution.utm_medium = state.utm_medium;
        if (state.utm_campaign !== void 0) attribution.utm_campaign = state.utm_campaign;
        if (state.utm_content !== void 0) attribution.utm_content = state.utm_content;
        if (state.utm_term !== void 0) attribution.utm_term = state.utm_term;
        if (state.subaffiliate1 !== void 0) attribution.subaffiliate1 = state.subaffiliate1;
        if (state.subaffiliate2 !== void 0) attribution.subaffiliate2 = state.subaffiliate2;
        if (state.subaffiliate3 !== void 0) attribution.subaffiliate3 = state.subaffiliate3;
        if (state.subaffiliate4 !== void 0) attribution.subaffiliate4 = state.subaffiliate4;
        if (state.subaffiliate5 !== void 0) attribution.subaffiliate5 = state.subaffiliate5;
        if (state.metadata.everflow_transaction_id) {
          attribution.everflow_transaction_id = state.metadata.everflow_transaction_id;
        }
        return attribution;
      },
      debug: () => {
        const state = get();
        console.group("🔍 Attribution Debug Info");
        console.log("📊 Key Attribution Values:");
        console.log("- Affiliate:", state.affiliate || "(not set)");
        console.log("- Funnel:", state.funnel || "(not set)");
        console.log("- GCLID:", state.gclid || "(not set)");
        console.log("\n📈 UTM Parameters:");
        console.log("- Source:", state.utm_source || "(not set)");
        console.log("- Medium:", state.utm_medium || "(not set)");
        console.log("- Campaign:", state.utm_campaign || "(not set)");
        console.log("- Content:", state.utm_content || "(not set)");
        console.log("- Term:", state.utm_term || "(not set)");
        console.log("\n👥 Subaffiliates:");
        for (let i = 1; i <= 5; i++) {
          const key = `subaffiliate${i}`;
          console.log(`- Subaffiliate ${i}:`, state[key] || "(not set)");
        }
        console.log("\n🔄 Everflow:");
        console.log("- Transaction ID:", state.metadata.everflow_transaction_id || "(not set)");
        console.log("- SG EVCLID:", state.metadata.sg_evclid || "(not set)");
        console.log("- localStorage evclid:", localStorage.getItem("evclid") || "(not set)");
        console.log("- sessionStorage evclid:", sessionStorage.getItem("evclid") || "(not set)");
        console.log("\n📘 Facebook:");
        console.log("- fbclid:", state.metadata.fbclid || "(not set)");
        console.log("- fb_fbp:", state.metadata.fb_fbp || "(not set)");
        console.log("- fb_fbc:", state.metadata.fb_fbc || "(not set)");
        console.log("- fb_pixel_id:", state.metadata.fb_pixel_id || "(not set)");
        console.log("\n📋 Metadata:");
        console.log("- Landing Page:", state.metadata.landing_page);
        console.log("- Referrer:", state.metadata.referrer || "(direct)");
        console.log("- Domain:", state.metadata.domain);
        console.log("- Device Type:", state.metadata.device_type);
        console.log("- First Visit:", new Date(state.first_visit_timestamp).toLocaleString());
        console.log("- Current Visit:", new Date(state.current_visit_timestamp).toLocaleString());
        if (state.metadata.conversion_timestamp) {
          console.log("- Conversion Time:", new Date(state.metadata.conversion_timestamp).toLocaleString());
        }
        console.log("\n📤 API Format:");
        console.log(JSON.stringify(get().getAttributionForApi(), null, 2));
        console.log("\n🔗 Current URL Parameters:");
        console.log(window.location.search || "(none)");
        console.groupEnd();
        return "Attribution debug info logged to console.";
      },
      reset: () => {
        set(initialState);
      },
      clearPersistedFunnel: () => {
        try {
          localStorage.removeItem("next_funnel_name");
          sessionStorage.removeItem("next_funnel_name");
          set({ funnel: "" });
          console.info("[AttributionStore] Cleared persisted funnel name");
        } catch (error) {
          console.error("[AttributionStore] Error clearing persisted funnel:", error);
        }
      }
    }),
    {
      name: "next-attribution",
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        }
      }
    }
  )
);
const _AttributeParser = class _AttributeParser {
  static parseDataAttribute(element, attribute) {
    const value = element.getAttribute(attribute);
    return {
      raw: value,
      parsed: this.parseValue(value),
      type: this.inferType(value)
    };
  }
  static parseValue(value) {
    if (value === null || value === "") {
      return null;
    }
    if (value.startsWith("{") || value.startsWith("[")) {
      try {
        return JSON.parse(value);
      } catch {
      }
    }
    if (value === "true") return true;
    if (value === "false") return false;
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      const num = parseFloat(value);
      return Number.isNaN(num) ? value : num;
    }
    return value;
  }
  static inferType(value) {
    if (value === null || value === "") {
      return "string";
    }
    if (value === "true" || value === "false") {
      return "boolean";
    }
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return "number";
    }
    if (value.startsWith("{") && value.endsWith("}")) {
      return "object";
    }
    if (value.startsWith("[") && value.endsWith("]")) {
      return "array";
    }
    return "string";
  }
  static getEnhancerTypes(element) {
    const types = [];
    if (element.hasAttribute("data-next-display")) {
      types.push("display");
    }
    if (element.hasAttribute("data-next-toggle")) {
      types.push("toggle");
    }
    if (element.hasAttribute("data-next-action")) {
      types.push("action");
    }
    if (element.hasAttribute("data-next-timer")) {
      types.push("timer");
    }
    if (element.hasAttribute("data-next-show") || element.hasAttribute("data-next-hide")) {
      types.push("conditional");
    }
    if (element instanceof HTMLFormElement && element.hasAttribute("data-next-checkout")) {
      types.push("checkout");
    }
    if (element.hasAttribute("data-next-express-checkout")) {
      const checkoutType = element.getAttribute("data-next-express-checkout");
      if (checkoutType === "container") {
        types.push("express-checkout-container");
      } else if (checkoutType === "paypal" || checkoutType === "apple_pay" || checkoutType === "google_pay") {
        types.push("express-checkout");
      }
    }
    if (element.hasAttribute("data-next-cart-items")) {
      types.push("cart-items");
    }
    if (element.hasAttribute("data-next-order-items")) {
      types.push("order-items");
    }
    if (element.hasAttribute("data-next-quantity")) {
      const quantityAction = element.getAttribute("data-next-quantity");
      if (quantityAction && ["increase", "decrease", "set"].includes(quantityAction)) {
        types.push("quantity");
      }
    }
    if (element.hasAttribute("data-next-remove-item")) {
      types.push("remove-item");
    }
    if (element.hasAttribute("data-next-selector") || element.hasAttribute("data-next-cart-selector") || element.hasAttribute("data-next-selector-id") && !element.hasAttribute("data-next-action")) {
      types.push("selector");
    }
    if (element.hasAttribute("data-next-upsell") || element.hasAttribute("data-next-upsell-selector") || element.hasAttribute("data-next-upsell-select")) {
      types.push("upsell");
    }
    if (element.hasAttribute("data-next-coupon")) {
      const couponType = element.getAttribute("data-next-coupon");
      if (couponType === "input" || couponType === "") {
        types.push("coupon");
      }
    }
    if (element.hasAttribute("data-next-accordion")) {
      types.push("accordion");
    }
    if (element.hasAttribute("data-next-tooltip")) {
      types.push("tooltip");
    }
    return [...new Set(types)];
  }
  static parseDisplayPath(path) {
    const parts = path.split(".");
    if (parts.length === 1) {
      return { object: "cart", property: parts[0] ?? "" };
    }
    return {
      object: parts[0] ?? "cart",
      property: parts.slice(1).join(".")
    };
  }
  static parseCondition(condition) {
    try {
      if (condition.includes("(") && condition.includes(")")) {
        const match = condition.match(/^(\w+)\.(\w+)\(([^)]*)\)$/);
        if (match) {
          return {
            type: "function",
            object: match[1] ?? "",
            method: match[2] ?? "",
            args: match[3] ? match[3].split(",").map((arg) => this.parseValue(arg.trim())) : []
          };
        }
      }
      if (condition.includes(" ")) {
        const operators = [">=", "<=", ">", "<", "===", "==", "!==", "!="];
        for (const op of operators) {
          if (condition.includes(op)) {
            const [left, right] = condition.split(op).map((s) => s.trim());
            return {
              type: "comparison",
              left: this.parseDisplayPath(left ?? ""),
              operator: op,
              right: this.parseValue(right ?? "")
            };
          }
        }
      }
      return {
        type: "property",
        ...this.parseDisplayPath(condition)
      };
    } catch (error) {
      this.logger.error("Failed to parse condition:", condition, error);
      return { type: "property", object: "cart", property: "isEmpty" };
    }
  }
};
_AttributeParser.logger = createLogger("AttributeParser");
let AttributeParser = _AttributeParser;
class DOMObserver {
  constructor(config = {}) {
    this.handlers = /* @__PURE__ */ new Set();
    this.isObserving = false;
    this.pendingChanges = /* @__PURE__ */ new Set();
    this.logger = createLogger("DOMObserver");
    this.config = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "data-next-display",
        "data-next-toggle",
        "data-next-timer",
        "data-next-show",
        "data-next-hide",
        "data-next-checkout",
        "data-next-validate",
        "data-next-express-checkout"
      ],
      ...config
    };
    this.observer = new MutationObserver(this.handleMutations.bind(this));
  }
  /**
   * Add a change handler
   */
  addHandler(handler) {
    this.handlers.add(handler);
    this.logger.debug(`Added handler, total: ${this.handlers.size}`);
  }
  /**
   * Remove a change handler
   */
  removeHandler(handler) {
    this.handlers.delete(handler);
    this.logger.debug(`Removed handler, total: ${this.handlers.size}`);
  }
  /**
   * Start observing DOM changes
   */
  start(target = document.body) {
    if (this.isObserving) {
      this.logger.warn("Already observing, ignoring start request");
      return;
    }
    try {
      this.observer.observe(target, this.config);
      this.isObserving = true;
      this.logger.debug("Started observing DOM changes", { target: target.tagName });
    } catch (error) {
      this.logger.error("Failed to start DOM observation:", error);
    }
  }
  /**
   * Stop observing DOM changes
   */
  stop() {
    if (!this.isObserving) {
      return;
    }
    this.observer.disconnect();
    this.isObserving = false;
    this.clearThrottle();
    this.pendingChanges.clear();
    this.logger.debug("Stopped observing DOM changes");
  }
  /**
   * Temporarily pause observation
   */
  pause() {
    if (this.isObserving) {
      this.observer.disconnect();
      this.isObserving = false;
      this.logger.debug("Paused DOM observation");
    }
  }
  /**
   * Resume observation after pause
   */
  resume(target = document.body) {
    if (!this.isObserving) {
      this.start(target);
      this.logger.debug("Resumed DOM observation");
    }
  }
  /**
   * Check if currently observing
   */
  isActive() {
    return this.isObserving;
  }
  /**
   * Handle mutation records from MutationObserver
   */
  handleMutations(mutations) {
    const relevantMutations = mutations.filter((mutation) => this.isRelevantMutation(mutation));
    if (relevantMutations.length === 0) {
      return;
    }
    this.logger.debug(`Processing ${relevantMutations.length} relevant mutations`);
    for (const mutation of relevantMutations) {
      this.processMutation(mutation);
    }
    this.throttleNotifications();
  }
  /**
   * Check if a mutation is relevant to our data attributes
   */
  isRelevantMutation(mutation) {
    switch (mutation.type) {
      case "childList":
        return this.hasRelevantNodes(mutation.addedNodes) || this.hasRelevantNodes(mutation.removedNodes);
      case "attributes":
        const attrName = mutation.attributeName;
        return attrName !== null && this.config.attributeFilter?.includes(attrName) === true;
      default:
        return false;
    }
  }
  /**
   * Check if a NodeList contains relevant elements
   */
  hasRelevantNodes(nodeList) {
    for (const node of nodeList) {
      if (node instanceof HTMLElement) {
        if (this.hasRelevantAttributes(node) || this.hasRelevantDescendants(node)) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Check if an element has relevant data attributes
   */
  hasRelevantAttributes(element) {
    return this.config.attributeFilter?.some((attr) => element.hasAttribute(attr)) === true;
  }
  /**
   * Check if an element has descendants with relevant attributes
   */
  hasRelevantDescendants(element) {
    if (!this.config.attributeFilter) return false;
    const selector = this.config.attributeFilter.map((attr) => `[${attr}]`).join(",");
    return element.querySelector(selector) !== null;
  }
  /**
   * Process a single mutation record
   */
  processMutation(mutation) {
    switch (mutation.type) {
      case "childList":
        this.processChildListMutation(mutation);
        break;
      case "attributes":
        this.processAttributeMutation(mutation);
        break;
    }
  }
  /**
   * Process child list mutations (added/removed nodes)
   */
  processChildListMutation(mutation) {
    for (const node of mutation.addedNodes) {
      if (node instanceof HTMLElement) {
        this.addElementForProcessing(node, "added");
        if (this.config.attributeFilter) {
          const selector = this.config.attributeFilter.map((attr) => `[${attr}]`).join(",");
          const descendants = node.querySelectorAll(selector);
          descendants.forEach((desc) => {
            if (desc instanceof HTMLElement) {
              this.addElementForProcessing(desc, "added");
            }
          });
        }
      }
    }
    for (const node of mutation.removedNodes) {
      if (node instanceof HTMLElement) {
        this.addElementForProcessing(node, "removed");
      }
    }
  }
  /**
   * Process attribute mutations
   */
  processAttributeMutation(mutation) {
    if (mutation.target instanceof HTMLElement && mutation.attributeName) {
      const element = mutation.target;
      const attributeName = mutation.attributeName;
      const oldValue = mutation.oldValue;
      const newValue = element.getAttribute(attributeName);
      this.notifyHandlers({
        type: "attributeChanged",
        element,
        attributeName,
        oldValue: oldValue || void 0,
        newValue: newValue || void 0
      });
    }
  }
  /**
   * Add an element to the pending changes queue
   */
  addElementForProcessing(element, type) {
    if (this.hasRelevantAttributes(element)) {
      this.pendingChanges.add(element);
      if (type === "removed") {
        this.notifyHandlers({
          type: "removed",
          element,
          attributeName: void 0,
          oldValue: void 0,
          newValue: void 0
        });
      }
    }
  }
  /**
   * Throttle notifications to avoid excessive processing
   */
  throttleNotifications() {
    if (this.throttleTimeout) {
      return;
    }
    this.throttleTimeout = window.setTimeout(() => {
      this.processePendingChanges();
      this.throttleTimeout = void 0;
    }, 16);
  }
  /**
   * Process all pending changes
   */
  processePendingChanges() {
    if (this.pendingChanges.size === 0) {
      return;
    }
    this.logger.debug(`Processing ${this.pendingChanges.size} pending changes`);
    for (const element of this.pendingChanges) {
      this.notifyHandlers({
        type: "added",
        element,
        attributeName: void 0,
        oldValue: void 0,
        newValue: void 0
      });
    }
    this.pendingChanges.clear();
  }
  /**
   * Notify all handlers of a change
   */
  notifyHandlers(event) {
    for (const handler of this.handlers) {
      try {
        handler(event);
      } catch (error) {
        this.logger.error("Handler error:", error);
      }
    }
  }
  /**
   * Clear throttle timeout
   */
  clearThrottle() {
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
      this.throttleTimeout = void 0;
    }
  }
  /**
   * Cleanup and destroy observer
   */
  destroy() {
    this.stop();
    this.handlers.clear();
    this.logger.debug("DOM observer destroyed");
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Update configuration (requires restart)
   */
  updateConfig(newConfig) {
    const wasObserving = this.isObserving;
    let target;
    if (wasObserving) {
      target = document.body;
      this.stop();
    }
    this.config = { ...this.config, ...newConfig };
    if (wasObserving && target) {
      this.start(target);
    }
    this.logger.debug("Updated configuration", this.config);
  }
}
class AttributeScanner {
  constructor() {
    this.enhancers = /* @__PURE__ */ new WeakMap();
    this.enhancerCount = 0;
    this.isScanning = false;
    this.scanQueue = /* @__PURE__ */ new Set();
    this.enhancerStats = /* @__PURE__ */ new Map();
    this.isDebugMode = false;
    this.processQueueDebounced = this.debounce(() => {
      this.processQueue();
    }, 50);
    this.logger = createLogger("AttributeScanner");
    this.domObserver = new DOMObserver();
    this.domObserver.addHandler(this.handleDOMChange.bind(this));
    this.isDebugMode = new URLSearchParams(location.search).get("debug") === "true";
    if (this.isDebugMode) {
      console.log("🐛 AttributeScanner: Debug mode enabled for performance tracking");
    }
  }
  async scanAndEnhance(root) {
    if (this.isScanning) {
      this.logger.warn("Already scanning, queuing request");
      return;
    }
    this.isScanning = true;
    this.logger.debug("Scanning for data attributes...", { root: root.tagName });
    try {
      const selector = [
        "[data-next-display]",
        "[data-next-toggle]",
        "[data-next-action]",
        "[data-next-timer]",
        "[data-next-show]",
        "[data-next-hide]",
        "form[data-next-checkout]",
        "[data-next-express-checkout]",
        "[data-next-timer-display]",
        "[data-next-timer-expired]",
        "[data-next-cart-items]",
        "[data-next-order-items]",
        '[data-next-quantity="increase"]',
        '[data-next-quantity="decrease"]',
        '[data-next-quantity="set"]',
        "[data-next-remove-item]",
        "[data-next-selector]",
        "[data-next-selector-id]",
        "[data-next-cart-selector]",
        "[data-next-upsell]",
        "[data-next-upsell-selector]",
        "[data-next-upsell-select]",
        '[data-next-coupon="input"]',
        '[data-next-coupon=""]',
        "[data-next-accordion]",
        "[data-next-tooltip]",
        '[data-next-express-checkout="container"]'
      ].join(", ");
      const elements = root.querySelectorAll(selector);
      this.logger.debug(`Found ${elements.length} elements with data attributes`);
      let enhancedCount = 0;
      const enhancePromises = [];
      const batchSize = 10;
      for (let i = 0; i < elements.length; i += batchSize) {
        const batch = Array.from(elements).slice(i, i + batchSize);
        for (const element of batch) {
          if (element instanceof HTMLElement) {
            enhancePromises.push(
              this.enhanceElement(element).then(() => {
                enhancedCount++;
              })
            );
          }
        }
        await Promise.all(enhancePromises.splice(0, batchSize));
        if (i + batchSize < elements.length) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
      await Promise.all(enhancePromises);
      this.logger.debug(`Enhanced ${enhancedCount} elements successfully`);
      if (this.isDebugMode && this.enhancerStats.size > 0) {
        this.showPerformanceReport();
      }
      document.documentElement.classList.add("next-display-ready");
      this.logger.debug("Added next-display-ready class to HTML element");
      window.dispatchEvent(new CustomEvent("next:display-ready", {
        detail: {
          enhancedCount,
          root: root.tagName
        }
      }));
      this.startObserving(root);
    } catch (error) {
      this.logger.error("Error during scan and enhance:", error);
    } finally {
      this.isScanning = false;
    }
  }
  async enhanceElement(element) {
    if (this.enhancers.has(element)) {
      this.logger.debug("Element already enhanced, skipping", element);
      return;
    }
    const cartItemsContainer = element.closest("[data-next-cart-items]");
    if (cartItemsContainer && cartItemsContainer !== element) {
      this.logger.debug("Skipping element inside cart items template", element);
      return;
    }
    const packageId = element.getAttribute("data-package-id");
    if (packageId && packageId.includes("{") && packageId.includes("}")) {
      this.logger.debug("Skipping element with template variable", element, packageId);
      return;
    }
    try {
      const enhancerTypes = AttributeParser.getEnhancerTypes(element);
      if (enhancerTypes.length === 0) {
        this.logger.debug("No enhancer types found for element", element);
        return;
      }
      const elementEnhancers = [];
      for (const type of enhancerTypes) {
        const enhancer = await this.createEnhancer(type, element);
        if (enhancer) {
          elementEnhancers.push(enhancer);
          try {
            if (this.isDebugMode) {
              const enhancerStart = performance.now();
              await enhancer.initialize();
              const enhancerTime = performance.now() - enhancerStart;
              this.updateEnhancerStats(type, enhancerTime);
              this.logger.debug(`Initialized ${type} enhancer for element`, element);
            } else {
              await enhancer.initialize();
              this.logger.debug(`Initialized ${type} enhancer for element`, element);
            }
          } catch (initError) {
            this.logger.error(`Failed to initialize ${type} enhancer:`, initError, element);
            enhancer.destroy();
          }
        }
      }
      if (elementEnhancers.length > 0) {
        this.enhancers.set(element, elementEnhancers);
        this.enhancerCount += elementEnhancers.length;
        this.logger.debug(`Enhanced element with ${elementEnhancers.length} enhancer(s)`, {
          element: element.tagName,
          types: enhancerTypes,
          attributes: Array.from(element.attributes).map((attr) => attr.name)
        });
      }
    } catch (error) {
      this.logger.error("Failed to enhance element:", error, element);
    }
  }
  async createEnhancer(type, element) {
    try {
      switch (type) {
        case "display":
          const displayPath = element.getAttribute("data-next-display") || "";
          const parsed = AttributeParser.parseDisplayPath(displayPath);
          this.logger.debug(`Creating display enhancer for path: "${displayPath}"`, {
            parsed,
            element: element.tagName,
            elementHtml: element.outerHTML.substring(0, 200) + "..."
          });
          if (parsed.object === "cart") {
            this.logger.debug("Using CartDisplayEnhancer");
            const { CartDisplayEnhancer } = await import("./CartDisplayEnhancer-CceBZGbM.js");
            return new CartDisplayEnhancer(element);
          } else if (parsed.object === "selection") {
            this.logger.debug("Using SelectionDisplayEnhancer");
            const { SelectionDisplayEnhancer } = await import("./SelectionDisplayEnhancer-Bw12RfkJ.js");
            return new SelectionDisplayEnhancer(element);
          } else if (parsed.object === "package" || parsed.object === "campaign") {
            this.logger.debug("Using ProductDisplayEnhancer");
            const { ProductDisplayEnhancer } = await import("./ProductDisplayEnhancer-DsbYJp1t.js");
            return new ProductDisplayEnhancer(element);
          } else if (parsed.object === "order") {
            this.logger.debug("Using OrderDisplayEnhancer");
            const { OrderDisplayEnhancer } = await import("./OrderDisplayEnhancer-1vSIu1rc.js");
            return new OrderDisplayEnhancer(element);
          } else if (parsed.object === "shipping") {
            this.logger.debug("Using ShippingDisplayEnhancer");
            const { ShippingDisplayEnhancer } = await import("./ShippingDisplayEnhancer-Am6hR9rm.js");
            return new ShippingDisplayEnhancer(element);
          } else {
            let currentElement = element.parentElement;
            let hasPackageContext = false;
            while (currentElement && !hasPackageContext) {
              if (currentElement.hasAttribute("data-next-package-id") || currentElement.hasAttribute("data-next-package") || currentElement.hasAttribute("data-package-id")) {
                hasPackageContext = true;
              }
              currentElement = currentElement.parentElement;
            }
            if (hasPackageContext) {
              this.logger.debug(`Using ProductDisplayEnhancer (fallback with package context)`);
              const { ProductDisplayEnhancer } = await import("./ProductDisplayEnhancer-DsbYJp1t.js");
              return new ProductDisplayEnhancer(element);
            } else {
              this.logger.debug(`Using CartDisplayEnhancer (fallback without package context)`);
              const { CartDisplayEnhancer } = await import("./CartDisplayEnhancer-CceBZGbM.js");
              return new CartDisplayEnhancer(element);
            }
          }
        case "toggle":
          const { CartToggleEnhancer } = await import("./CartToggleEnhancer-CtjfrpKw.js");
          return new CartToggleEnhancer(element);
        case "action":
          const action = element.getAttribute("data-next-action");
          switch (action) {
            case "add-to-cart":
              const { AddToCartEnhancer } = await import("./AddToCartEnhancer-Z07QVaCT.js");
              return new AddToCartEnhancer(element);
            case "accept-upsell":
              const { AcceptUpsellEnhancer } = await import("./AcceptUpsellEnhancer-DLk__m62.js");
              return new AcceptUpsellEnhancer(element);
            default:
              this.logger.warn(`Unknown action type: ${action}`);
              return null;
          }
        case "selector":
          const { PackageSelectorEnhancer } = await import("./PackageSelectorEnhancer-DpKFbThY.js");
          return new PackageSelectorEnhancer(element);
        case "timer":
          const { TimerEnhancer } = await import("./TimerEnhancer-DgAHHvrf.js");
          return new TimerEnhancer(element);
        case "conditional":
          const { ConditionalDisplayEnhancer } = await import("./ConditionalDisplayEnhancer-Bv-d7Eu3.js");
          return new ConditionalDisplayEnhancer(element);
        case "checkout":
          const { CheckoutFormEnhancer } = await import("./CheckoutFormEnhancer-CaTaw0sX.js");
          return new CheckoutFormEnhancer(element);
        case "express-checkout":
          this.logger.debug("Skipping individual express checkout button - managed by container");
          return null;
        case "express-checkout-container":
          const { ExpressCheckoutContainerEnhancer } = await import("./ExpressCheckoutContainerEnhancer-fOPpemKX.js");
          return new ExpressCheckoutContainerEnhancer(element);
        case "cart-items":
          const { CartItemListEnhancer } = await import("./CartItemListEnhancer-4vCb0xsk.js");
          return new CartItemListEnhancer(element);
        case "order-items":
          const { OrderItemListEnhancer } = await import("./OrderItemListEnhancer-XwGDFWKh.js");
          return new OrderItemListEnhancer(element);
        case "quantity":
          const { QuantityControlEnhancer } = await import("./QuantityControlEnhancer-C13iIxno.js");
          return new QuantityControlEnhancer(element);
        case "remove-item":
          const { RemoveItemEnhancer } = await import("./RemoveItemEnhancer-CrQupqGU.js");
          return new RemoveItemEnhancer(element);
        case "upsell":
          const { UpsellEnhancer } = await import("./UpsellEnhancer-C0ZnDLU_.js");
          return new UpsellEnhancer(element);
        case "coupon":
          const { CouponEnhancer } = await import("./CouponEnhancer-BJ9IfdKm.js");
          return new CouponEnhancer(element);
        case "accordion":
          const { AccordionEnhancer } = await import("./AccordionEnhancer-D5-AwpCs.js");
          return new AccordionEnhancer(element);
        case "tooltip":
          const { TooltipEnhancer } = await import("./TooltipEnhancer-BdYnGKZF.js");
          return new TooltipEnhancer(element);
        default:
          this.logger.warn(`Unknown enhancer type: ${type}`);
          return null;
      }
    } catch (error) {
      this.logger.error(`Failed to create enhancer of type ${type}:`, error);
      return null;
    }
  }
  startObserving(root) {
    if (!this.domObserver.isActive()) {
      this.domObserver.start(root);
      this.logger.debug("Started DOM observation");
    }
  }
  handleDOMChange(event) {
    switch (event.type) {
      case "added":
        this.queueElementForEnhancement(event.element);
        break;
      case "removed":
        this.cleanupElement(event.element);
        break;
      case "attributeChanged":
        if (event.attributeName?.startsWith("data-next-")) {
          this.logger.debug("Data attribute changed, re-enhancing element", {
            element: event.element.tagName,
            attribute: event.attributeName,
            oldValue: event.oldValue,
            newValue: event.newValue
          });
          this.cleanupElement(event.element);
          this.queueElementForEnhancement(event.element);
        }
        break;
    }
  }
  queueElementForEnhancement(element) {
    this.scanQueue.add(element);
    this.processQueueDebounced();
  }
  async processQueue() {
    if (this.scanQueue.size === 0) {
      return;
    }
    const elements = Array.from(this.scanQueue);
    this.scanQueue.clear();
    this.logger.debug(`Processing ${elements.length} queued elements`);
    for (const element of elements) {
      try {
        await this.enhanceElement(element);
      } catch (error) {
        this.logger.error("Failed to enhance queued element:", error, element);
      }
    }
  }
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func.apply(this, args), wait);
    };
  }
  cleanupElement(element) {
    const enhancers = this.enhancers.get(element);
    if (enhancers) {
      enhancers.forEach((enhancer) => enhancer.destroy());
      this.enhancerCount -= enhancers.length;
      this.enhancers.delete(element);
    }
  }
  destroy() {
    this.domObserver.destroy();
    this.scanQueue.clear();
    this.enhancerCount = 0;
    this.logger.debug("AttributeScanner destroyed");
  }
  pause() {
    this.domObserver.pause();
    this.logger.debug("AttributeScanner paused");
  }
  resume(root = document.body) {
    this.domObserver.resume(root);
    this.logger.debug("AttributeScanner resumed");
  }
  updateEnhancerStats(type, time) {
    const current = this.enhancerStats.get(type) || { totalTime: 0, count: 0 };
    current.totalTime += time;
    current.count += 1;
    this.enhancerStats.set(type, current);
  }
  showPerformanceReport() {
    console.group("🚀 Enhancement Performance Report");
    const sortedStats = Array.from(this.enhancerStats.entries()).map(([type, stats]) => ({
      Enhancer: type,
      "Total Time (ms)": stats.totalTime.toFixed(2),
      "Average Time (ms)": (stats.totalTime / stats.count).toFixed(2),
      "Count": stats.count,
      "Impact": stats.totalTime > 50 ? "🔴 High" : stats.totalTime > 20 ? "🟡 Medium" : "🟢 Low"
    })).sort((a, b) => parseFloat(b["Total Time (ms)"]) - parseFloat(a["Total Time (ms)"]));
    console.table(sortedStats);
    const topSlow = sortedStats.slice(0, 3);
    if (topSlow.length > 0) {
      console.log("🐌 Slowest enhancers:");
      topSlow.forEach((stat, index) => {
        console.log(`${index + 1}. ${stat.Enhancer}: ${stat["Total Time (ms)"]}ms (${stat.Count} instances)`);
      });
    }
    const totalTime = Array.from(this.enhancerStats.values()).reduce((sum, stats) => sum + stats.totalTime, 0);
    const totalCount = Array.from(this.enhancerStats.values()).reduce((sum, stats) => sum + stats.count, 0);
    console.log(`📊 Total enhancement time: ${totalTime.toFixed(2)}ms across ${totalCount} enhancers`);
    console.groupEnd();
  }
  getStats() {
    const stats = {
      enhancedElements: this.enhancerCount,
      queuedElements: this.scanQueue.size,
      isObserving: this.domObserver.isActive(),
      isScanning: this.isScanning
    };
    if (this.isDebugMode && this.enhancerStats.size > 0) {
      stats.performanceStats = {};
      for (const [type, data] of this.enhancerStats.entries()) {
        stats.performanceStats[type] = {
          totalTime: data.totalTime,
          averageTime: data.totalTime / data.count,
          count: data.count
        };
      }
    }
    return stats;
  }
}
class DebugEventManager {
  constructor() {
    this.eventLog = [];
    this.maxEvents = 100;
    this.initializeEventCapture();
  }
  initializeEventCapture() {
    const events = [
      "next:cart-updated",
      "next:checkout-step",
      "next:item-added",
      "next:item-removed",
      "next:timer-expired",
      "next:validation-error",
      "next:payment-success",
      "next:payment-error"
    ];
    events.forEach((eventType) => {
      document.addEventListener(eventType, (e) => {
        this.logEvent(eventType.replace("next:", ""), e.detail, "CustomEvent");
      });
    });
    this.interceptFetch();
  }
  interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0].toString();
      if (url.includes("29next.com") || url.includes("campaigns.")) {
        this.logEvent("api-request", {
          url,
          method: args[1]?.method || "GET"
        }, "API");
      }
      return originalFetch.apply(window, args);
    };
  }
  logEvent(type, data, source) {
    this.eventLog.push({
      timestamp: /* @__PURE__ */ new Date(),
      type,
      data,
      source
    });
    if (this.eventLog.length > this.maxEvents) {
      this.eventLog.shift();
    }
  }
  getEvents(limit) {
    const events = limit ? this.eventLog.slice(-limit) : this.eventLog;
    return events.reverse();
  }
  clearEvents() {
    this.eventLog = [];
  }
  exportEvents() {
    return JSON.stringify(this.eventLog, null, 2);
  }
}
class EnhancedDebugUI {
  static createOverlayHTML(panels, activePanel, isExpanded, activePanelTab) {
    const activePanelData = panels.find((p) => p.id === activePanel);
    return `
      <div class="enhanced-debug-overlay ${isExpanded ? "expanded" : "collapsed"}">
        ${this.createBottomBar(isExpanded)}
        ${isExpanded ? this.createExpandedContent(panels, activePanelData, activePanel, activePanelTab) : ""}
      </div>
    `;
  }
  static createBottomBar(isExpanded) {
    return `
      <div class="debug-bottom-bar">
        <div class="debug-logo-section">
          ${this.get29NextLogo()}
          <span class="debug-title">Debug Tools</span>
          <div class="debug-status">
            <div class="status-indicator active"></div>
            <span class="status-text">Active</span>
          </div>
        </div>
        
        <div class="debug-quick-stats">
          <div class="stat-item">
            <span class="stat-value" data-debug-stat="cart-items">0</span>
            <span class="stat-label">Items</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" data-debug-stat="cart-total">$0.00</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" data-debug-stat="enhanced-elements">0</span>
            <span class="stat-label">Enhanced</span>
          </div>
        </div>

        <div class="debug-controls">
          <button class="debug-control-btn" data-action="toggle-mini-cart" title="Toggle Mini Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z"/>
            </svg>
          </button>
          <button class="debug-control-btn" data-action="clear-cart" title="Clear Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
          <button class="debug-control-btn" data-action="toggle-xray" title="Toggle X-Ray View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3C3.89 3 3 3.9 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.9 20.11 3 19 3H5M5 5H19V19H5V5M7 7V9H9V7H7M11 7V9H13V7H11M15 7V9H17V7H15M7 11V13H9V11H7M11 11V13H13V11H11M15 11V13H17V11H15M7 15V17H9V15H7M11 15V17H13V15H11M15 15V17H17V15H15Z"/>
            </svg>
          </button>
          <button class="debug-control-btn" data-action="export-data" title="Export Debug Data">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
            </svg>
          </button>
          <button class="debug-expand-btn" data-action="toggle-expand" title="${isExpanded ? "Collapse" : "Expand"}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="expand-icon ${isExpanded ? "rotated" : ""}">
              <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
            </svg>
          </button>
          <button class="debug-control-btn close-btn" data-action="close" title="Close Debug Tools">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }
  static createExpandedContent(panels, activePanel, activePanelId, activePanelTab) {
    return `
      <div class="debug-expanded-content">
        <div class="debug-sidebar">
          ${this.createPanelTabs(panels, activePanelId)}
        </div>
        
        <div class="debug-main-content">
          ${this.createPanelContent(activePanel, activePanelTab)}
        </div>
      </div>
    `;
  }
  static createPanelTabs(panels, activePanel) {
    return `
      <div class="debug-panel-tabs">
        ${panels.map((panel) => `
          <button class="debug-panel-tab ${panel.id === activePanel ? "active" : ""}" 
                  data-panel="${panel.id}">
            <span class="tab-icon">${panel.icon}</span>
            <span class="tab-label">${panel.title}</span>
            ${panel.id === "events" ? '<div class="tab-badge" data-debug-badge="events">0</div>' : ""}
          </button>
        `).join("")}
      </div>
    `;
  }
  static createPanelContent(activePanel, activePanelTab) {
    if (!activePanel) return "";
    const tabs = activePanel.getTabs?.() || [];
    const hasHorizontalTabs = tabs.length > 0;
    if (hasHorizontalTabs) {
      const activeTabId = activePanelTab || tabs[0]?.id;
      const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];
      return `
        <div class="debug-panel-container">
          <div class="panel-header">
            <div class="panel-title">
              <span class="panel-icon">${activePanel.icon}</span>
              <h2>${activePanel.title}</h2>
            </div>
            ${activePanel.getActions ? `
              <div class="panel-actions">
                ${activePanel.getActions().map((action) => `
                  <button class="panel-action-btn ${action.variant || "primary"}" 
                          data-panel-action="${action.label}">
                    ${action.label}
                  </button>
                `).join("")}
              </div>
            ` : ""}
          </div>
          
          <div class="panel-horizontal-tabs">
            ${tabs.map((tab) => `
              <button class="horizontal-tab ${tab.id === activeTabId ? "active" : ""}" 
                      data-panel-tab="${tab.id}">
                ${tab.icon ? `<span class="tab-icon">${tab.icon}</span>` : ""}
                <span class="tab-label">${tab.label}</span>
              </button>
            `).join("")}
          </div>
          
          <div class="panel-content">
            ${activeTab ? activeTab.getContent() : ""}
          </div>
        </div>
      `;
    }
    return `
      <div class="debug-panel-container">
        <div class="panel-header">
          <div class="panel-title">
            <span class="panel-icon">${activePanel.icon}</span>
            <h2>${activePanel.title}</h2>
          </div>
          ${activePanel.getActions ? `
            <div class="panel-actions">
              ${activePanel.getActions().map((action) => `
                <button class="panel-action-btn ${action.variant || "primary"}" 
                        data-panel-action="${action.label}">
                  ${action.label}
                </button>
              `).join("")}
            </div>
          ` : ""}
        </div>
        <div class="panel-content">
          ${activePanel.getContent()}
        </div>
      </div>
    `;
  }
  static get29NextLogo() {
    return `
      <svg class="debug-logo" width="32" height="32" viewBox="0 0 518.2 99" fill="none">
        <g>
          <path d="M17.5,0c3.4,0,6.8,1,9.6,2.9l58.8,40v12.6L20.7,12.6c-1-0.6-2.1-1-3.2-1c-3.2,0-5.8,2.6-5.8,5.8v64c0,3.2,2.6,5.8,5.8,5.8h3.1V99h-3.1C7.8,99,0,91.2,0,81.5v-64C0,7.8,7.8,0,17.5,0z" fill="currentColor"/>
          <path d="M95.4,99c-3.4,0-6.8-1-9.6-2.9L27,56.1V43.5l65.2,42.8c1,0.6,2.1,1,3.2,1c3.2,0,5.8-2.6,5.8-5.8v-64c0-3.2-2.6-5.8-5.8-5.8h-3.1V0h3.1c9.7,0,17.5,7.8,17.5,17.5v64C112.9,91.2,105.1,99,95.4,99z" fill="currentColor"/>
        </g>
        <g>
          <path d="M161.1,69.5c1.9-1.9,3.8-3.5,5.9-4.9l10.1-7.5c4.4-3.2,7.9-6.6,10.4-10.2c2.5-3.7,3.8-7.8,3.8-12.5c0-4.6-1-8.7-3.2-12.2c-2.2-3.5-5.2-6.3-9.2-8.3s-8.8-3-14.3-3c-4.8,0-9.1,1-12.9,2.9c-3.8,1.9-6.9,4.4-9.2,7.5c-2.4,3.1-3.9,6.5-4.6,10.1l15,2.6c0.4-1.7,1.1-3.3,2.2-4.7c1.1-1.5,2.4-2.6,4.1-3.5c1.7-0.9,3.6-1.3,5.7-1.3c2.5,0,4.6,0.4,6.3,1.3c1.7,0.9,3,2.1,3.9,3.6c0.9,1.5,1.3,3.2,1.3,5.1c0,1.5-0.4,3.1-1.3,4.7c-0.9,1.6-2,3.1-3.4,4.5c-1.4,1.4-2.8,2.6-4.4,3.7L156,55.6c-3.1,2.1-5.7,4.5-8,7c-2.2,2.6-4,5.1-5.3,7.6s-1.9,4.8-1.9,6.9l0.1,0.1V88h51.5V75h-35.2C158.3,73,159.6,71.1,161.1,69.5z" fill="currentColor"/>
          <path d="M248.3,20.8c-2.2-3.2-5.1-5.7-8.6-7.6c-3.5-1.9-7.8-2.8-12.8-2.8c-5.3,0-10,1-14.2,3.1c-4,2.1-7.1,5-9.3,8.6c-2.2,3.6-3.3,7.8-3.3,12.6c0,4.9,1,9.2,3.1,13c2,3.8,4.9,6.8,8.6,9.1s7.9,3.4,12.6,3.4c4.7,0,8.8-1.2,12.2-3.6c1.7-1.2,3.2-2.6,4.5-4.2c-0.4,6.9-1.8,12.2-4.2,15.9c-3.1,4.9-7.5,7.4-13,7.4c-2.1,0-4.4-0.3-6.9-1.1c-2.5-0.8-4.9-1.9-7.2-3.4L202.7,82c3,2.1,6.4,3.7,10.1,4.9c3.7,1.2,7.5,1.8,11.4,1.8c5.4,0,10-1.1,13.8-3.4s7-5.4,9.4-9.3c2.5-3.9,4.3-8.4,5.5-13.6c1.2-5.2,1.8-10.7,1.8-16.5c0-4.9-0.5-9.5-1.5-13.8C252.2,27.8,250.5,24,248.3,20.8z M237.6,41.9c-1.1,1.9-2.6,3.4-4.4,4.5c-1.9,1.1-4,1.6-6.3,1.6c-2.4,0-4.5-0.5-6.3-1.6c-1.9-1-3.3-2.6-4.4-4.5c-1.1-1.9-1.6-4.1-1.6-6.6s0.5-4.6,1.6-6.5c1.1-1.8,2.6-3.3,4.4-4.4c1.9-1.1,4-1.6,6.3-1.6c2.4,0,4.5,0.5,6.3,1.6c1.8,1,3.3,2.5,4.4,4.4c1.1,1.9,1.6,4,1.6,6.5S238.7,40,237.6,41.9z" fill="currentColor"/>
        </g>
      </svg>
    `;
  }
  static addStyles() {
    console.log("Debug styles loaded via CSS modules");
  }
  static removeStyles() {
    console.log("Debug styles will be cleaned up by DebugStyleLoader");
  }
}
function generateXrayStyles() {
  return `
    /* X-RAY WIREFRAME CSS - PURE CSS, NO JS */

    /* Subtle outlines for all data attributes */
    [data-next-display],
    [data-next-show],
    [data-next-checkout],
    [data-next-selector-id],
    [data-next-cart-selector],
    [data-next-selection-mode],
    [data-next-shipping-id],
    [data-next-selector-card],
    [data-next-package-id],
    [data-next-quantity],
    [data-next-selected],
    [data-next-await],
    [data-next-in-cart],
    [data-next-express-checkout],
    [data-next-payment-method],
    [data-next-checkout-field],
    [data-next-payment-form] {
      position: relative !important;
      outline: 1px dashed rgba(0, 0, 0, 0.3) !important;
      outline-offset: -1px !important;
    }

    /* Color coding for different attribute types */
    [data-next-display] {
      outline-color: #4ecdc4 !important;
    }

    [data-next-show] {
      outline-color: #ffe66d !important;
    }

    [data-next-checkout] {
      outline-color: #ff6b6b !important;
    }

    [data-next-selector-id] {
      outline-color: #a8e6cf !important;
    }

    [data-next-selector-card] {
      outline-color: #95e1d3 !important;
    }

    [data-next-in-cart] {
      outline-color: #c7ceea !important;
    }

    [data-next-selected] {
      outline-color: #ffa502 !important;
    }

    [data-next-package-id] {
      outline-color: #ff8b94 !important;
    }

    /* Small corner labels */
    [data-next-selector-id]::before {
      content: attr(data-next-selector-id) !important;
      position: absolute !important;
      top: 2px !important;
      right: 2px !important;
      background: rgba(168, 230, 207, 0.9) !important;
      color: #333 !important;
      padding: 2px 4px !important;
      font-size: 9px !important;
      font-family: monospace !important;
      line-height: 1 !important;
      border-radius: 2px !important;
      pointer-events: none !important;
      z-index: 10 !important;
    }

    [data-next-package-id]::before {
      content: "PKG " attr(data-next-package-id) !important;
      position: absolute !important;
      top: 2px !important;
      left: 2px !important;
      background: rgba(255, 139, 148, 0.9) !important;
      color: white !important;
      padding: 2px 4px !important;
      font-size: 9px !important;
      font-family: monospace !important;
      font-weight: bold !important;
      line-height: 1 !important;
      border-radius: 2px !important;
      pointer-events: none !important;
      z-index: 10 !important;
    }

    /* Special highlighting for active states */
    [data-next-selected="true"] {
      outline-width: 2px !important;
      outline-style: solid !important;
    }

    [data-next-in-cart="true"] {
      background-color: rgba(199, 206, 234, 0.1) !important;
    }

    /* Hover tooltips */
    [data-next-display]:hover::after,
    [data-next-show]:hover::after,
    [data-next-selector-card]:hover::after {
      position: absolute !important;
      z-index: 99999 !important;
      pointer-events: none !important;
      font-family: monospace !important;
      font-size: 10px !important;
      padding: 4px 6px !important;
      border-radius: 3px !important;
      white-space: nowrap !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
      bottom: 100% !important;
      left: 0 !important;
      margin-bottom: 4px !important;
    }

    [data-next-display]:hover::after {
      content: "display: " attr(data-next-display) !important;
      background: #4ecdc4 !important;
      color: white !important;
    }

    [data-next-show]:hover::after {
      content: "show: " attr(data-next-show) !important;
      background: #ffe66d !important;
      color: #333 !important;
    }

    [data-next-selector-card]:hover::after {
      content: "pkg:" attr(data-next-package-id) " | selected:" attr(data-next-selected) " | in-cart:" attr(data-next-in-cart) !important;
      background: #95e1d3 !important;
      color: #333 !important;
    }
  `;
}
const _XrayManager = class _XrayManager {
  static initialize() {
    const savedState = localStorage.getItem(this.STORAGE_KEY);
    if (savedState === "true") {
      this.activate();
    }
  }
  static toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
    return this.isActive;
  }
  static activate() {
    if (this.isActive) return;
    this.styleElement = document.createElement("style");
    this.styleElement.id = "debug-xray-styles";
    this.styleElement.textContent = generateXrayStyles();
    document.head.appendChild(this.styleElement);
    document.body.classList.add("debug-xray-active");
    this.isActive = true;
    localStorage.setItem(this.STORAGE_KEY, "true");
    console.log("🔍 X-Ray mode activated");
  }
  static deactivate() {
    if (!this.isActive) return;
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    document.body.classList.remove("debug-xray-active");
    this.isActive = false;
    localStorage.setItem(this.STORAGE_KEY, "false");
    console.log("🔍 X-Ray mode deactivated");
  }
  static isXrayActive() {
    return this.isActive;
  }
};
_XrayManager.styleElement = null;
_XrayManager.isActive = false;
_XrayManager.STORAGE_KEY = "debug-xray-active";
let XrayManager = _XrayManager;
class CartPanel {
  constructor() {
    this.id = "cart";
    this.title = "Cart State";
    this.icon = "🛒";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "items",
        label: "Items",
        icon: "📦",
        getContent: () => this.getItemsContent()
      },
      {
        id: "raw",
        label: "Raw Data",
        icon: "🔧",
        getContent: () => this.getRawDataContent()
      }
    ];
  }
  getOverviewContent() {
    const cartState = useCartStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📦</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.items.length}</div>
              <div class="metric-label">Unique Items</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔢</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totalQuantity}</div>
              <div class="metric-label">Total Quantity</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totals.subtotal.formatted}</div>
              <div class="metric-label">Subtotal</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🚚</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totals.shipping.formatted}</div>
              <div class="metric-label">Shipping</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totals.tax.formatted}</div>
              <div class="metric-label">Tax</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💳</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totals.total.formatted}</div>
              <div class="metric-label">Total</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getItemsContent() {
    const cartState = useCartStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          ${cartState.items.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">🛒</div>
              <div class="empty-text">Cart is empty</div>
              <button class="empty-action" onclick="window.nextDebug.addTestItems()">Add Test Items</button>
            </div>
          ` : `
            <div class="cart-items-list">
              ${cartState.items.map((item) => `
                <div class="cart-item-card">
                  <div class="item-info">
                    <div class="item-title">${item.title}</div>
                    <div class="item-details">
                      Package ID: ${item.packageId} • Price: $${item.price}
                    </div>
                  </div>
                  <div class="item-quantity">
                    <button onclick="window.nextDebug.updateQuantity(${item.packageId}, ${item.quantity - 1})" 
                            class="qty-btn">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button onclick="window.nextDebug.updateQuantity(${item.packageId}, ${item.quantity + 1})" 
                            class="qty-btn">+</button>
                  </div>
                  <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                  <button onclick="window.nextDebug.removeItem(${item.packageId})" 
                          class="remove-btn">×</button>
                </div>
              `).join("")}
            </div>
          `}
        </div>
      </div>
    `;
  }
  getRawDataContent() {
    const cartState = useCartStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="json-viewer">
            <pre><code>${JSON.stringify(cartState, null, 2)}</code></pre>
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Clear Cart",
        action: () => useCartStore.getState().clear(),
        variant: "danger"
      },
      {
        label: "Add Test Items",
        action: this.addTestItems,
        variant: "secondary"
      },
      {
        label: "Recalculate",
        action: () => useCartStore.getState().calculateTotals(),
        variant: "primary"
      },
      {
        label: "Export Cart",
        action: this.exportCart,
        variant: "secondary"
      }
    ];
  }
  addTestItems() {
    const cartStore = useCartStore.getState();
    const testItems = [
      { packageId: 999, quantity: 1, price: 19.99, title: "Debug Test Item 1", isUpsell: false },
      { packageId: 998, quantity: 2, price: 29.99, title: "Debug Test Item 2", isUpsell: false },
      { packageId: 997, quantity: 1, price: 9.99, title: "Debug Test Item 3", isUpsell: false }
    ];
    testItems.forEach((item) => cartStore.addItem(item));
  }
  exportCart() {
    const cartState = useCartStore.getState();
    const data = JSON.stringify(cartState, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cart-state-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
class EventsPanel {
  constructor(events) {
    this.events = events;
    this.id = "events";
    this.title = "Event Timeline";
    this.icon = "📋";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "timeline",
        label: "Timeline",
        icon: "⏰",
        getContent: () => this.getTimelineContent()
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: "📈",
        getContent: () => this.getAnalyticsContent()
      }
    ];
  }
  getOverviewContent() {
    const eventTypes = [...new Set(this.events.map((e) => e.type))];
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">${this.events.length}</div>
              <div class="metric-label">Total Events</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🎯</div>
            <div class="metric-content">
              <div class="metric-value">${eventTypes.length}</div>
              <div class="metric-label">Event Types</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">⏱️</div>
            <div class="metric-content">
              <div class="metric-value">${this.getEventsPerMinute()}</div>
              <div class="metric-label">Events/min</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Event Types</h3>
          <div class="event-types">
            ${eventTypes.map((type) => {
      const count = this.events.filter((e) => e.type === type).length;
      return `
                <div class="event-type-card" onclick="window.nextDebug.filterEvents('${type}')">
                  <div class="event-type-name">${type}</div>
                  <div class="event-type-count">${count}</div>
                </div>
              `;
    }).join("")}
          </div>
        </div>
      </div>
    `;
  }
  getTimelineContent() {
    const recentEvents = this.events.slice(0, 30);
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="events-timeline">
            ${recentEvents.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-text">No events logged yet</div>
              </div>
            ` : recentEvents.map((event) => `
              <div class="timeline-event">
                <div class="event-time">${event.timestamp.toLocaleTimeString()}</div>
                <div class="event-content">
                  <div class="event-header">
                    <span class="event-type-badge">${event.type}</span>
                    <span class="event-source">${event.source}</span>
                  </div>
                  <div class="event-data-preview">
                    ${this.formatEventData(event.data)}
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }
  getAnalyticsContent() {
    const eventTypes = [...new Set(this.events.map((e) => e.type))];
    const sourceStats = this.getSourceStatistics();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <h3 class="section-title">Event Distribution</h3>
          <div class="analytics-charts">
            ${eventTypes.map((type) => {
      const count = this.events.filter((e) => e.type === type).length;
      const percentage = this.events.length > 0 ? (count / this.events.length * 100).toFixed(1) : 0;
      return `
                <div class="analytics-bar">
                  <div class="bar-label">${type}</div>
                  <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                    <div class="bar-value">${count} (${percentage}%)</div>
                  </div>
                </div>
              `;
    }).join("")}
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Source Statistics</h3>
          <div class="source-stats">
            ${Object.entries(sourceStats).map(([source, count]) => `
              <div class="source-stat-item">
                <span class="source-name">${source}</span>
                <span class="source-count">${count}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Clear Events",
        action: () => this.clearEvents(),
        variant: "danger"
      },
      {
        label: "Export Timeline",
        action: () => this.exportEvents(),
        variant: "secondary"
      },
      {
        label: "Start Recording",
        action: () => this.startRecording(),
        variant: "primary"
      }
    ];
  }
  getEventsPerMinute() {
    const now = /* @__PURE__ */ new Date();
    const oneMinuteAgo = new Date(now.getTime() - 6e4);
    const recentEvents = this.events.filter((e) => e.timestamp > oneMinuteAgo);
    return recentEvents.length;
  }
  getSourceStatistics() {
    const stats = {};
    this.events.forEach((event) => {
      stats[event.source] = (stats[event.source] || 0) + 1;
    });
    return stats;
  }
  formatEventData(data) {
    if (typeof data === "object" && data !== null) {
      const keys = Object.keys(data);
      if (keys.length === 0) return "No data";
      if (keys.length === 1) {
        const firstKey = keys[0];
        return firstKey ? `${firstKey}: ${data[firstKey] || "undefined"}` : "No data";
      }
      return `${keys.slice(0, 2).join(", ")}${keys.length > 2 ? "..." : ""}`;
    }
    return String(data);
  }
  clearEvents() {
    this.events.length = 0;
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  exportEvents() {
    const data = JSON.stringify(this.events, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-events-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  startRecording() {
    console.log("Event recording started");
  }
}
class EventTimelinePanel {
  constructor() {
    this.id = "event-timeline";
    this.title = "Events";
    this.icon = "⚡";
    this.events = [];
    this.maxEvents = 1e3;
    this.isRecording = true;
    this.filters = {
      types: /* @__PURE__ */ new Set(["dataLayer", "internal", "dom"]),
      sources: /* @__PURE__ */ new Set(),
      search: "",
      timeRange: 30
      // last 30 minutes
    };
    this.startTime = Date.now();
    this.eventBus = EventBus.getInstance();
    this.initializeEventWatching();
  }
  initializeEventWatching() {
    this.watchDataLayer();
    this.watchInternalEvents();
    this.watchDOMEvents();
    this.watchPerformanceEvents();
  }
  watchDataLayer() {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    const originalPush = window.dataLayer.push;
    window.dataLayer.push = (...args) => {
      if (this.isRecording) {
        args.forEach((event) => {
          let source = "GTM DataLayer";
          if (event.event && event.event.startsWith("gtm_")) {
            source = "GTM Internal";
          } else if (event.timestamp || event.event_context) {
            source = "Analytics Manager";
          }
          this.addEvent({
            type: "dataLayer",
            name: event.event || "dataLayer.push",
            data: event,
            source
          });
        });
      }
      return originalPush.apply(window.dataLayer, args);
    };
    if (window.dataLayer.length > 0) {
      window.dataLayer.forEach((event, index) => {
        if (typeof event === "object" && event.event) {
          this.addEvent({
            type: "dataLayer",
            name: event.event,
            data: event,
            source: "GTM DataLayer (existing)",
            timestamp: this.startTime + index * 10
            // Approximate timing
          });
        }
      });
    }
  }
  watchInternalEvents() {
    const internalEvents = [
      "cart:updated",
      "cart:item-added",
      "cart:item-removed",
      "cart:quantity-changed",
      "campaign:loaded",
      "checkout:started",
      "checkout:form-initialized",
      "order:completed",
      "payment:tokenized",
      "payment:error",
      "coupon:applied",
      "coupon:removed",
      "upsell:added",
      "upsell:skipped",
      "config:updated",
      "error:occurred"
    ];
    internalEvents.forEach((eventName) => {
      this.eventBus.on(eventName, (data) => {
        if (this.isRecording) {
          this.addEvent({
            type: "internal",
            name: eventName,
            data,
            source: "SDK Internal"
          });
        }
      });
    });
  }
  watchDOMEvents() {
    if (typeof document === "undefined") return;
    const domEvents = [
      "next:initialized",
      "next:cart-updated",
      "next:item-added",
      "next:item-removed",
      "next:checkout-started",
      "next:payment-success",
      "next:payment-error",
      "next:timer-expired",
      "next:coupon-applied",
      "next:display-ready"
    ];
    domEvents.forEach((eventName) => {
      document.addEventListener(eventName, (event) => {
        if (this.isRecording) {
          const customEvent = event;
          this.addEvent({
            type: "dom",
            name: eventName,
            data: customEvent.detail,
            source: "DOM CustomEvent"
          });
        }
      });
    });
  }
  watchPerformanceEvents() {
    if (typeof window === "undefined" || !window.performance) return;
    const originalMark = performance.mark;
    const originalMeasure = performance.measure;
    const self = this;
    performance.mark = function(name) {
      const result = originalMark.call(performance, name);
      if (self.isRecording) {
        self.addEvent({
          type: "performance",
          name: `mark: ${name}`,
          data: { markName: name, timestamp: performance.now() },
          source: "Performance API"
        });
      }
      return result;
    };
    performance.measure = function(name, startMark, endMark) {
      const result = originalMeasure.call(performance, name, startMark, endMark);
      if (self.isRecording) {
        self.addEvent({
          type: "performance",
          name: `measure: ${name}`,
          data: { measureName: name, startMark, endMark },
          source: "Performance API"
        });
      }
      return result;
    };
  }
  addEvent(eventData) {
    const now = Date.now();
    const event = {
      id: `event_${now}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: eventData.timestamp || now,
      type: eventData.type || "internal",
      name: eventData.name || "unknown",
      data: eventData.data || {},
      source: eventData.source || "Unknown",
      relativeTime: this.formatRelativeTime(eventData.timestamp || now)
    };
    this.events.unshift(event);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }
    if (event.source && event.source !== "Unknown") {
      this.filters.sources.add(event.source);
    }
    if (typeof document !== "undefined") {
      const activeElement = document.activeElement;
      const isUserTyping = activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "SELECT");
      if (!isUserTyping) {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("debug:update-content"));
        }, 100);
      }
    }
  }
  formatRelativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1e3);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s ago`;
    if (seconds > 0) return `${seconds}s ago`;
    return "just now";
  }
  getFilteredEvents() {
    const cutoffTime = Date.now() - this.filters.timeRange * 60 * 1e3;
    return this.events.filter((event) => {
      if (event.timestamp < cutoffTime) return false;
      if (!this.filters.types.has(event.type)) return false;
      if (this.filters.sources.size > 0 && !this.filters.sources.has(event.source)) return false;
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        return event.name.toLowerCase().includes(searchLower) || event.source.toLowerCase().includes(searchLower) || JSON.stringify(event.data).toLowerCase().includes(searchLower);
      }
      return true;
    });
  }
  // getEventIcon method removed - unused
  getEventTypeColor(type) {
    const colors = {
      dataLayer: "#4CAF50",
      // Green
      internal: "#2196F3",
      // Blue  
      dom: "#FF9800",
      // Orange
      performance: "#9C27B0"
      // Purple
    };
    return colors[type] || "#666";
  }
  getTabs() {
    return [
      {
        id: "timeline",
        label: "Events",
        icon: "📅",
        getContent: () => this.getTimelineContent()
      },
      {
        id: "analytics",
        label: "Stats",
        icon: "📊",
        getContent: () => this.getAnalyticsContent()
      },
      {
        id: "filters",
        label: "Filter",
        icon: "🔍",
        getContent: () => this.getFiltersContent()
      }
    ];
  }
  getTimelineContent() {
    const filteredEvents = this.getFilteredEvents();
    if (filteredEvents.length === 0) {
      return `<div style="padding: 20px; text-align: center; color: #666;">No events yet</div>`;
    }
    let eventsHtml = "";
    filteredEvents.slice(0, 20).forEach((event) => {
      eventsHtml += `
        <div style="border-bottom: 1px solid #333; padding: 8px; background: #1a1a1a;">
          <div style="font-weight: bold; color: ${this.getEventTypeColor(event.type)};">
            ${event.name} <span style="float: right; font-weight: normal; color: #999;">${event.relativeTime}</span>
          </div>
          <div style="color: #999; font-size: 11px; margin: 4px 0;">${event.source}</div>
          <div style="background: #2a2a2a; padding: 4px; border-radius: 3px; font-family: monospace; font-size: 10px; overflow: hidden; color: #ccc;">
            ${JSON.stringify(event.data).length > 100 ? JSON.stringify(event.data).substring(0, 100) + "..." : JSON.stringify(event.data)}
          </div>
        </div>
      `;
    });
    return `
      <div style="padding: 10px; border-bottom: 1px solid #444; background: #2a2a2a; color: #fff;">
        <strong>Total Events: ${this.events.length}</strong>
        <span style="float: right;">
          <button onclick="this.closest('.debug-panel').dispatchEvent(new CustomEvent('timeline-action', {detail: 'toggle'}))" style="margin-right: 5px; background: #444; color: #fff; border: 1px solid #666; padding: 4px 8px; cursor: pointer;">
            ${this.isRecording ? "Pause" : "Record"}
          </button>
          <button onclick="this.closest('.debug-panel').dispatchEvent(new CustomEvent('timeline-action', {detail: 'clear'}))" style="background: #444; color: #fff; border: 1px solid #666; padding: 4px 8px; cursor: pointer;">
            Clear
          </button>
        </span>
      </div>
      <div style="max-height: 300px; overflow-y: auto; background: #1a1a1a;">
        ${eventsHtml}
      </div>
    `;
  }
  getAnalyticsContent() {
    const stats = this.getEventStats();
    const typeDistribution = this.getTypeDistribution();
    return `
      <div style="padding: 15px; background: #1a1a1a; color: #fff;">
        <h4 style="color: #fff;">Event Statistics</h4>
        <p>Total Events: <strong>${stats.total}</strong></p>
        <p>Events Per Minute: <strong>${stats.eventsPerMinute}</strong></p>
        <p>Most Active Type: <strong>${stats.mostActiveType}</strong></p>
        
        <h4 style="margin-top: 20px; color: #fff;">Event Types</h4>
        ${Object.entries(typeDistribution).map(([type, count]) => `
          <p style="margin: 5px 0;">
            <span style="color: ${this.getEventTypeColor(type)};">${type}:</span> 
            <strong>${count}</strong>
          </p>
        `).join("")}
      </div>
    `;
  }
  getFiltersContent() {
    const availableTypes = ["dataLayer", "internal", "dom", "performance"];
    return `
      <div style="padding: 15px; background: #1a1a1a; color: #fff;">
        <h4 style="color: #fff;">Search Events</h4>
        <input type="text" 
               placeholder="Search event names or data..." 
               value="${this.filters.search || ""}"
               style="width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #666; border-radius: 4px; background: #2a2a2a; color: #fff;">
        
        <h4 style="color: #fff;">Event Types</h4>
        ${availableTypes.map((type) => `
          <label style="display: block; margin: 8px 0; color: #fff;">
            <input type="checkbox" ${this.filters.types.has(type) ? "checked" : ""} style="margin-right: 8px;">
            ${type}
          </label>
        `).join("")}
        
        <h4 style="margin-top: 20px; color: #fff;">Time Range</h4>
        <select style="width: 100%; padding: 8px; border: 1px solid #666; border-radius: 4px; background: #2a2a2a; color: #fff;">
          <option value="5">Last 5 minutes</option>
          <option value="15">Last 15 minutes</option>
          <option value="30" selected>Last 30 minutes</option>
          <option value="60">Last hour</option>
        </select>
      </div>
    `;
  }
  getEventStats() {
    const now = Date.now();
    const oneMinuteAgo = now - 6e4;
    const recentEvents = this.events.filter((e) => e?.timestamp && e.timestamp > oneMinuteAgo);
    const typeCounts = this.events.reduce((acc, event) => {
      if (event?.type) {
        acc[event.type] = (acc[event.type] || 0) + 1;
      }
      return acc;
    }, {});
    const mostActiveType = Object.entries(typeCounts).sort(([, a], [, b]) => (b || 0) - (a || 0))[0]?.[0];
    return {
      total: this.events.length,
      eventsPerMinute: recentEvents.length,
      mostActiveType: mostActiveType || "None"
    };
  }
  getTypeDistribution() {
    return this.events.reduce((acc, event) => {
      if (event?.type) {
        acc[event.type] = (acc[event.type] || 0) + 1;
      }
      return acc;
    }, {});
  }
  getSourceDistribution() {
    return this.events.reduce((acc, event) => {
      if (event?.source) {
        acc[event.source] = (acc[event.source] || 0) + 1;
      }
      return acc;
    }, {});
  }
  // getTimelineChart method removed - unused
  getActions() {
    return [
      {
        label: this.isRecording ? "⏸️ Pause Recording" : "▶️ Start Recording",
        action: () => {
          this.isRecording = !this.isRecording;
          console.log(`Event recording ${this.isRecording ? "started" : "paused"}`);
        }
      },
      {
        label: "🗑️ Clear Events",
        action: () => {
          this.events = [];
          console.log("Event timeline cleared");
        }
      },
      {
        label: "💾 Export Events",
        action: () => this.exportEvents()
      },
      {
        label: "🧪 Test Events",
        action: () => this.generateTestEvents()
      }
    ];
  }
  exportEvents() {
    const exportData = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      totalEvents: this.events.length,
      filters: {
        types: Array.from(this.filters.types),
        sources: Array.from(this.filters.sources),
        search: this.filters.search,
        timeRange: this.filters.timeRange
      },
      events: this.events,
      stats: this.getEventStats(),
      typeDistribution: this.getTypeDistribution(),
      sourceDistribution: this.getSourceDistribution()
    };
    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-timeline-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  generateTestEvents() {
    const testEvents = [
      { type: "dataLayer", name: "add_to_cart", data: { item_id: "123", value: 29.99 }, source: "Test" },
      { type: "internal", name: "cart:updated", data: { itemCount: 2 }, source: "Test" },
      { type: "dom", name: "next:item-added", data: { packageId: 123 }, source: "Test" },
      { type: "performance", name: "navigation", data: { loadTime: 1234 }, source: "Test" }
    ];
    testEvents.forEach((event, index) => {
      setTimeout(() => {
        this.addEvent(event);
      }, index * 200);
    });
    console.log("Generated test events for timeline");
  }
  getContent() {
    return this.getTimelineContent();
  }
}
class ConfigPanel {
  constructor() {
    this.id = "config";
    this.title = "Configuration";
    this.icon = "⚙️";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "settings",
        label: "Settings",
        icon: "⚙️",
        getContent: () => this.getSettingsContent()
      },
      {
        id: "raw",
        label: "Raw Data",
        icon: "🔧",
        getContent: () => this.getRawDataContent()
      }
    ];
  }
  getOverviewContent() {
    const config = configStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">🔧</div>
            <div class="metric-content">
              <div class="metric-value">${config.debug ? "ON" : "OFF"}</div>
              <div class="metric-label">Debug Mode</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🌍</div>
            <div class="metric-content">
              <div class="metric-value">${config.environment || "production"}</div>
              <div class="metric-label">Environment</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔑</div>
            <div class="metric-content">
              <div class="metric-value">${config.apiKey ? "SET" : "MISSING"}</div>
              <div class="metric-label">API Key</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📋</div>
            <div class="metric-content">
              <div class="metric-value">${config.campaignId || "NONE"}</div>
              <div class="metric-label">Campaign ID</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getSettingsContent() {
    const config = configStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="config-groups">
            <div class="config-group">
              <h4 class="config-group-title">Core Settings</h4>
              <div class="config-items">
                <div class="config-item">
                  <span class="config-key">Campaign ID:</span>
                  <span class="config-value">${config.campaignId || "Not set"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">API Key:</span>
                  <span class="config-value">${config.apiKey ? `${config.apiKey.substring(0, 8)}...` : "Not set"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Environment:</span>
                  <span class="config-value">${config.environment || "production"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Base URL:</span>
                  <span class="config-value">https://campaigns.apps.29next.com</span>
                </div>
              </div>
            </div>

            <div class="config-group">
              <h4 class="config-group-title">Feature Flags</h4>
              <div class="config-items">
                <div class="config-item">
                  <span class="config-key">Debug Mode:</span>
                  <span class="config-value ${config.debug ? "enabled" : "disabled"}">${config.debug ? "Enabled" : "Disabled"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Test Mode:</span>
                  <span class="config-value ${config.testMode ?? false ? "enabled" : "disabled"}">${config.testMode ?? false ? "Enabled" : "Disabled"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Analytics:</span>
                  <span class="config-value ${config.enableAnalytics ?? true ? "enabled" : "disabled"}">${config.enableAnalytics ?? true ? "Enabled" : "Disabled"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Auto Initialize:</span>
                  <span class="config-value ${config.autoInit ?? true ? "enabled" : "disabled"}">${config.autoInit ?? true ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            </div>

            <div class="config-group">
              <h4 class="config-group-title">Performance</h4>
              <div class="config-items">
                <div class="config-item">
                  <span class="config-key">Rate Limit:</span>
                  <span class="config-value">${config.rateLimit ?? 4} req/sec</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Cache TTL:</span>
                  <span class="config-value">${config.cacheTtl ?? 300}s</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Retry Attempts:</span>
                  <span class="config-value">${config.retryAttempts ?? 3}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Timeout:</span>
                  <span class="config-value">${config.timeout ?? 1e4}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getRawDataContent() {
    const config = configStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="json-viewer">
            <pre><code>${JSON.stringify(config, null, 2)}</code></pre>
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Toggle Debug",
        action: () => this.toggleDebug(),
        variant: "primary"
      },
      {
        label: "Toggle Test Mode",
        action: () => this.toggleTestMode(),
        variant: "secondary"
      },
      {
        label: "Export Config",
        action: () => this.exportConfig(),
        variant: "secondary"
      },
      {
        label: "Reset Config",
        action: () => this.resetConfig(),
        variant: "danger"
      }
    ];
  }
  toggleDebug() {
    const configStore$12 = configStore.getState();
    configStore$12.updateConfig({ debug: !configStore$12.debug });
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  toggleTestMode() {
    const configStore$12 = configStore.getState();
    configStore$12.updateConfig({ testMode: !(configStore$12.testMode ?? false) });
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  exportConfig() {
    const config = configStore.getState();
    const data = JSON.stringify(config, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `next-config-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  resetConfig() {
    if (confirm("Are you sure you want to reset the configuration to defaults?")) {
      const configStore$12 = configStore.getState();
      configStore$12.reset();
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
}
class CheckoutPanel {
  constructor() {
    this.id = "checkout";
    this.title = "Checkout State";
    this.icon = "💳";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "customer",
        label: "Customer Info",
        icon: "👤",
        getContent: () => this.getCustomerContent()
      },
      {
        id: "validation",
        label: "Validation",
        icon: "✅",
        getContent: () => this.getValidationContent()
      },
      {
        id: "raw",
        label: "Raw Data",
        icon: "🔧",
        getContent: () => this.getRawDataContent()
      }
    ];
  }
  getOverviewContent() {
    const checkoutState = useCheckoutStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📋</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.step || "Not Started"}</div>
              <div class="metric-label">Current Step</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">${checkoutState.isProcessing ? "⏳" : "✅"}</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.isProcessing ? "PROCESSING" : "READY"}</div>
              <div class="metric-label">Form Status</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔒</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.paymentMethod || "None"}</div>
              <div class="metric-label">Payment Method</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🚚</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.shippingMethod?.name || "None"}</div>
              <div class="metric-label">Shipping Method</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Form Fields Status</h3>
          <div class="form-fields-grid">
            ${this.renderFormFields(checkoutState)}
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Current Form Data</h3>
          <div class="form-data-summary">
            ${Object.keys(checkoutState.formData).length > 0 ? Object.entries(checkoutState.formData).map(([key, value]) => `
                <div class="form-field-row">
                  <span class="field-name">${this.formatFieldName(key)}</span>
                  <span class="field-value">${value || "Empty"}</span>
                </div>
              `).join("") : '<div class="empty-state">No form data yet</div>'}
          </div>
        </div>
      </div>
    `;
  }
  getCustomerContent() {
    const checkoutState = useCheckoutStore.getState();
    const formData = checkoutState.formData;
    const hasFormData = Object.keys(formData).length > 0;
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="customer-info">
            ${hasFormData ? `
              <div class="info-card">
                <h4>Contact Information</h4>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${formData.email || "Not provided"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">${formData.phone || "Not provided"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${formData.fname || ""} ${formData.lname || ""}</span>
                </div>
              </div>
              
              <div class="info-card">
                <h4>Shipping Address</h4>
                <div class="address-info">
                  ${formData.address1 ? `
                    <div class="info-row">
                      <span class="info-label">Address:</span>
                      <span class="info-value">${formData.address1}</span>
                    </div>
                    ${formData.address2 ? `
                      <div class="info-row">
                        <span class="info-label">Address 2:</span>
                        <span class="info-value">${formData.address2}</span>
                      </div>
                    ` : ""}
                    <div class="info-row">
                      <span class="info-label">City:</span>
                      <span class="info-value">${formData.city || "Not provided"}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">State/Province:</span>
                      <span class="info-value">${formData.province || "Not provided"}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Postal Code:</span>
                      <span class="info-value">${formData.postal || "Not provided"}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Country:</span>
                      <span class="info-value">${formData.country || "Not provided"}</span>
                    </div>
                  ` : '<div class="info-empty">Not provided</div>'}
                </div>
              </div>

              <div class="info-card">
                <h4>Billing Address</h4>
                <div class="address-info">
                  ${checkoutState.sameAsShipping ? `
                    <div class="info-same">Same as shipping address</div>
                  ` : checkoutState.billingAddress ? `
                    <div class="info-row">
                      <span class="info-label">Name:</span>
                      <span class="info-value">${checkoutState.billingAddress.first_name} ${checkoutState.billingAddress.last_name}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Address:</span>
                      <span class="info-value">${checkoutState.billingAddress.address1}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">City:</span>
                      <span class="info-value">${checkoutState.billingAddress.city}, ${checkoutState.billingAddress.province} ${checkoutState.billingAddress.postal}</span>
                    </div>
                  ` : '<div class="info-empty">Not provided</div>'}
                </div>
              </div>
            ` : `
              <div class="empty-state">
                <div class="empty-icon">👤</div>
                <div class="empty-text">No customer information yet</div>
                <div class="empty-subtitle">Fill out the checkout form to see data here</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }
  getValidationContent() {
    const checkoutState = useCheckoutStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="validation-errors">
            ${checkoutState.errors && Object.keys(checkoutState.errors).length > 0 ? `
              ${Object.entries(checkoutState.errors).map(([field, error]) => `
                <div class="error-item">
                  <span class="error-field">${field}:</span>
                  <span class="error-message">${error}</span>
                </div>
              `).join("")}
            ` : `
              <div class="empty-state">
                <div class="empty-icon">✅</div>
                <div class="empty-text">No validation errors</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }
  getRawDataContent() {
    const checkoutState = useCheckoutStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="json-viewer">
            <pre><code>${JSON.stringify(checkoutState, null, 2)}</code></pre>
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Fill Test Data",
        action: () => this.fillTestData(),
        variant: "primary"
      },
      {
        label: "Validate Form",
        action: () => this.validateForm(),
        variant: "secondary"
      },
      {
        label: "Clear Errors",
        action: () => this.clearErrors(),
        variant: "secondary"
      },
      {
        label: "Reset Checkout",
        action: () => this.resetCheckout(),
        variant: "danger"
      },
      {
        label: "Export State",
        action: () => this.exportState(),
        variant: "secondary"
      }
    ];
  }
  renderFormFields(checkoutState) {
    const requiredFields = [
      "email",
      "fname",
      "lname",
      "address1",
      "city",
      "province",
      "postal",
      "phone",
      "country"
    ];
    return requiredFields.map((field) => {
      const hasValue = this.hasFieldValue(checkoutState, field);
      const hasError = checkoutState.errors && checkoutState.errors[field];
      return `
        <div class="field-status-card ${hasValue ? "filled" : "empty"} ${hasError ? "error" : ""}">
          <div class="field-name">${this.formatFieldName(field)}</div>
          <div class="field-status">
            ${hasValue ? "✅" : "⏳"}
            ${hasError ? " ❌" : ""}
          </div>
        </div>
      `;
    }).join("");
  }
  hasFieldValue(checkoutState, field) {
    if (checkoutState.formData && checkoutState.formData[field]) {
      return checkoutState.formData[field].toString().trim().length > 0;
    }
    if (checkoutState.billingAddress && checkoutState.billingAddress[field]) {
      return checkoutState.billingAddress[field].toString().trim().length > 0;
    }
    return false;
  }
  formatFieldName(field) {
    const fieldNames = {
      fname: "First Name",
      lname: "Last Name",
      email: "Email",
      phone: "Phone",
      address1: "Address",
      address2: "Address 2",
      city: "City",
      province: "State/Province",
      postal: "Postal Code",
      country: "Country",
      accepts_marketing: "Accepts Marketing"
    };
    return fieldNames[field] || field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
  }
  fillTestData() {
    const checkoutStore2 = useCheckoutStore.getState();
    const testFormData = {
      email: "test@test.com",
      fname: "Test",
      lname: "Order",
      phone: "+14807581224",
      address1: "Test Address 123",
      address2: "",
      city: "Tempe",
      province: "AZ",
      postal: "85281",
      country: "US",
      accepts_marketing: false
    };
    checkoutStore2.clearAllErrors();
    checkoutStore2.updateFormData(testFormData);
    checkoutStore2.setPaymentMethod("credit-card");
    checkoutStore2.setSameAsShipping(true);
    checkoutStore2.setShippingMethod({
      id: 1,
      name: "Standard Shipping",
      price: 0,
      code: "standard"
    });
    console.log("✅ Test data filled successfully");
    document.dispatchEvent(new CustomEvent("debug:update-content"));
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent("checkout:test-data-filled", {
        detail: testFormData
      }));
    }, 100);
  }
  validateForm() {
    const checkoutStore2 = useCheckoutStore.getState();
    const formData = checkoutStore2.formData;
    const requiredFields = ["email", "fname", "lname", "address1", "city", "country"];
    let hasErrors = false;
    checkoutStore2.clearAllErrors();
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        checkoutStore2.setError(field, `${this.formatFieldName(field)} is required`);
        hasErrors = true;
      }
    });
    if (!hasErrors) {
      console.log("✅ Form validation passed");
    }
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  clearErrors() {
    const checkoutStore2 = useCheckoutStore.getState();
    checkoutStore2.clearAllErrors();
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  resetCheckout() {
    if (confirm("Are you sure you want to reset the checkout state?")) {
      const checkoutStore2 = useCheckoutStore.getState();
      checkoutStore2.reset();
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
  exportState() {
    const checkoutState = useCheckoutStore.getState();
    const data = JSON.stringify(checkoutState, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkout-state-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
class StoragePanel {
  constructor() {
    this.id = "storage";
    this.title = "Storage";
    this.icon = "💾";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "next-data",
        label: "Next Data",
        icon: "🏷️",
        getContent: () => this.getNextContent()
      },
      {
        id: "local-storage",
        label: "Local Storage",
        icon: "💾",
        getContent: () => this.getLocalStorageContent()
      },
      {
        id: "session-storage",
        label: "Session Storage",
        icon: "⏰",
        getContent: () => this.getSessionStorageContent()
      }
    ];
  }
  getOverviewContent() {
    const localStorage2 = this.getLocalStorageData();
    const sessionStorage2 = this.getSessionStorageData();
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">💾</div>
            <div class="metric-content">
              <div class="metric-value">${localStorage2.length}</div>
              <div class="metric-label">LocalStorage Items</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">⏰</div>
            <div class="metric-content">
              <div class="metric-value">${sessionStorage2.length}</div>
              <div class="metric-label">SessionStorage Items</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">${this.getStorageSize()}KB</div>
              <div class="metric-label">Total Size</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🏷️</div>
            <div class="metric-content">
              <div class="metric-value">${this.getNextItems().length}</div>
              <div class="metric-label">Next Items</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getNextContent() {
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="storage-items">
            ${this.getNextItems().length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">💾</div>
                <div class="empty-text">No Next storage items found</div>
              </div>
            ` : `
              ${this.getNextItems().map((item) => `
                <div class="storage-item-card next-item">
                  <div class="storage-item-header">
                    <span class="storage-key">${item.key}</span>
                    <span class="storage-type ${item.type}">${item.type}</span>
                    <button class="storage-delete-btn" onclick="window.nextDebug.deleteStorageItem('${item.key}', '${item.type}')">×</button>
                  </div>
                  <div class="storage-item-size">${item.size} bytes</div>
                  <div class="storage-item-value">
                    <pre><code>${item.formattedValue}</code></pre>
                  </div>
                </div>
              `).join("")}
            `}
          </div>
        </div>
      </div>
    `;
  }
  getLocalStorageContent() {
    const localStorage2 = this.getLocalStorageData();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="storage-items">
            ${localStorage2.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">💾</div>
                <div class="empty-text">No localStorage items</div>
              </div>
            ` : `
              ${localStorage2.map((item) => `
                <div class="storage-item-card ${item.key.includes("next") ? "next-item" : ""}">
                  <div class="storage-item-header">
                    <span class="storage-key">${item.key}</span>
                    <span class="storage-type local">local</span>
                    <button class="storage-delete-btn" onclick="window.nextDebug.deleteStorageItem('${item.key}', 'local')">×</button>
                  </div>
                  <div class="storage-item-size">${item.size} bytes</div>
                  <div class="storage-item-value">
                    <pre><code>${item.formattedValue}</code></pre>
                  </div>
                </div>
              `).join("")}
            `}
          </div>
        </div>
      </div>
    `;
  }
  getSessionStorageContent() {
    const sessionStorage2 = this.getSessionStorageData();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="storage-items">
            ${sessionStorage2.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">⏰</div>
                <div class="empty-text">No sessionStorage items</div>
              </div>
            ` : `
              ${sessionStorage2.map((item) => `
                <div class="storage-item-card ${item.key.includes("next") ? "next-item" : ""}">
                  <div class="storage-item-header">
                    <span class="storage-key">${item.key}</span>
                    <span class="storage-type session">session</span>
                    <button class="storage-delete-btn" onclick="window.nextDebug.deleteStorageItem('${item.key}', 'session')">×</button>
                  </div>
                  <div class="storage-item-size">${item.size} bytes</div>
                  <div class="storage-item-value">
                    <pre><code>${item.formattedValue}</code></pre>
                  </div>
                </div>
              `).join("")}
            `}
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Clear Next Data",
        action: () => this.clearNextStorage(),
        variant: "danger"
      },
      {
        label: "Clear All Local",
        action: () => this.clearLocalStorage(),
        variant: "danger"
      },
      {
        label: "Clear All Session",
        action: () => this.clearSessionStorage(),
        variant: "danger"
      },
      {
        label: "Export Storage",
        action: () => this.exportStorage(),
        variant: "secondary"
      }
    ];
  }
  getLocalStorageData() {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || "";
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value)
        });
      }
    }
    return items.sort((a, b) => a.key.localeCompare(b.key));
  }
  getSessionStorageData() {
    const items = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key) || "";
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value)
        });
      }
    }
    return items.sort((a, b) => a.key.localeCompare(b.key));
  }
  getNextItems() {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes("next") || key.includes("29next") || key.includes("campaign"))) {
        const value = localStorage.getItem(key) || "";
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value),
          type: "local"
        });
      }
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes("next") || key.includes("29next") || key.includes("campaign"))) {
        const value = sessionStorage.getItem(key) || "";
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value),
          type: "session"
        });
      }
    }
    return items.sort((a, b) => a.key.localeCompare(b.key));
  }
  formatValue(value) {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      if (value.length > 200) {
        return value.substring(0, 200) + "...";
      }
      return value;
    }
  }
  getStorageSize() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || "";
        total += new Blob([key + value]).size;
      }
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key) || "";
        total += new Blob([key + value]).size;
      }
    }
    return Math.round(total / 1024);
  }
  clearNextStorage() {
    if (confirm("Are you sure you want to clear all Next storage data?")) {
      const nextItems = this.getNextItems();
      nextItems.forEach((item) => {
        if (item.type === "local") {
          localStorage.removeItem(item.key);
        } else {
          sessionStorage.removeItem(item.key);
        }
      });
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
  clearLocalStorage() {
    if (confirm("Are you sure you want to clear ALL localStorage data?")) {
      localStorage.clear();
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
  clearSessionStorage() {
    if (confirm("Are you sure you want to clear ALL sessionStorage data?")) {
      sessionStorage.clear();
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
  exportStorage() {
    const data = {
      localStorage: this.getLocalStorageData(),
      sessionStorage: this.getSessionStorageData(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `storage-data-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
class EnhancedCampaignPanel {
  constructor() {
    this.id = "campaign";
    this.title = "Campaign Data";
    this.icon = "📊";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "packages",
        label: "Packages",
        icon: "📦",
        getContent: () => this.getPackagesContent()
      },
      {
        id: "shipping",
        label: "Shipping",
        icon: "🚚",
        getContent: () => this.getShippingContent()
      },
      {
        id: "raw",
        label: "Raw Data",
        icon: "🔧",
        getContent: () => this.getRawDataContent()
      }
    ];
  }
  getOverviewContent() {
    const campaignState = useCampaignStore.getState();
    const campaignData = campaignState.data;
    if (!campaignData) {
      return `
        <div class="enhanced-panel">
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <div class="empty-text">No campaign data loaded</div>
            <button class="empty-action" onclick="window.nextDebug.loadCampaign()">Load Campaign</button>
          </div>
        </div>
      `;
    }
    return `
      <div class="enhanced-panel">
        ${this.getCampaignOverview(campaignData)}
      </div>
    `;
  }
  getPackagesContent() {
    const campaignState = useCampaignStore.getState();
    const cartState = useCartStore.getState();
    const campaignData = campaignState.data;
    if (!campaignData) {
      return `
        <div class="enhanced-panel">
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <div class="empty-text">No campaign data loaded</div>
          </div>
        </div>
      `;
    }
    return `
      <div class="enhanced-panel">
        ${this.getPackagesSection(campaignData.packages, cartState)}
      </div>
    `;
  }
  getShippingContent() {
    const campaignState = useCampaignStore.getState();
    const campaignData = campaignState.data;
    if (!campaignData) {
      return `
        <div class="enhanced-panel">
          <div class="empty-state">
            <div class="empty-icon">🚚</div>
            <div class="empty-text">No campaign data loaded</div>
          </div>
        </div>
      `;
    }
    return `
      <div class="enhanced-panel">
        ${this.getShippingMethodsSection(campaignData.shipping_methods)}
      </div>
    `;
  }
  getRawDataContent() {
    const campaignState = useCampaignStore.getState();
    const campaignData = campaignState.data;
    if (!campaignData) {
      return `
        <div class="enhanced-panel">
          <div class="empty-state">
            <div class="empty-icon">🔧</div>
            <div class="empty-text">No campaign data loaded</div>
          </div>
        </div>
      `;
    }
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="json-viewer">
            <pre><code>${JSON.stringify(campaignData, null, 2)}</code></pre>
          </div>
        </div>
      </div>
    `;
  }
  getCampaignOverview(data) {
    return `
      <div class="campaign-overview">
        <div class="campaign-header">
          <h2 class="campaign-name">${data.name}</h2>
          <div class="campaign-badges">
            <span class="campaign-badge currency">${data.currency}</span>
            <span class="campaign-badge language">${data.language.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📦</div>
            <div class="metric-content">
              <div class="metric-value">${data.packages.length}</div>
              <div class="metric-label">Total Packages</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🚚</div>
            <div class="metric-content">
              <div class="metric-value">${data.shipping_methods.length}</div>
              <div class="metric-label">Shipping Methods</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔄</div>
            <div class="metric-content">
              <div class="metric-value">${data.packages.filter((p) => p.is_recurring).length}</div>
              <div class="metric-label">Recurring Items</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-content">
              <div class="metric-value">${this.getPriceRange(data.packages)}</div>
              <div class="metric-label">Price Range</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getPackagesSection(packages, cartState) {
    return `
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">Available Packages</h3>
          <div class="section-controls">
            <button class="sort-btn" onclick="window.nextDebug.sortPackages('price')">Sort by Price</button>
            <button class="sort-btn" onclick="window.nextDebug.sortPackages('name')">Sort by Name</button>
          </div>
        </div>
        
        <div class="packages-grid">
          ${packages.map((pkg) => this.getPackageCard(pkg, cartState)).join("")}
        </div>
      </div>
    `;
  }
  getPackageCard(pkg, cartState) {
    const isInCart = cartState.items.some((item) => item.packageId === pkg.ref_id);
    const cartItem = cartState.items.find((item) => item.packageId === pkg.ref_id);
    const savings = parseFloat(pkg.price_retail_total) - parseFloat(pkg.price_total);
    const savingsPercent = Math.round(savings / parseFloat(pkg.price_retail_total) * 100);
    return `
      <div class="package-card ${isInCart ? "in-cart" : ""}" data-package-id="${pkg.ref_id}">
        <div class="package-image-container">
          <img src="${pkg.image}" alt="${pkg.name}" class="package-image" loading="lazy" />
          ${pkg.is_recurring ? '<div class="recurring-badge">🔄 Recurring</div>' : ""}
          ${isInCart ? `<div class="cart-badge">In Cart (${cartItem?.quantity || 0})</div>` : ""}
        </div>
        
        <div class="package-info">
          <div class="package-header">
            <h4 class="package-name">${pkg.name}</h4>
            <div class="package-id">ID: ${pkg.ref_id}</div>
          </div>
          
          <div class="package-details">
            <div class="package-qty">Quantity: ${pkg.qty}</div>
            <div class="package-external-id">External ID: ${pkg.external_id}</div>
          </div>
          
          <div class="package-pricing">
            <div class="price-row">
              <span class="price-label">Sale Price:</span>
              <span class="price-value sale-price">$${pkg.price_total}</span>
            </div>
            ${pkg.price_retail_total !== pkg.price_total ? `
              <div class="price-row">
                <span class="price-label">Retail Price:</span>
                <span class="price-value retail-price">$${pkg.price_retail_total}</span>
              </div>
              <div class="savings">
                Save $${savings.toFixed(2)} (${savingsPercent}%)
              </div>
            ` : ""}
            
            ${pkg.is_recurring && pkg.price_recurring ? `
              <div class="recurring-pricing">
                <div class="price-row recurring">
                  <span class="price-label">Recurring:</span>
                  <span class="price-value recurring-price">
                    $${pkg.price_recurring_total}/${pkg.interval}
                  </span>
                </div>
              </div>
            ` : ""}
          </div>
          
          <div class="package-actions">
            ${isInCart ? `
              <button class="package-btn remove-btn" onclick="window.nextDebug.removeFromCart(${pkg.ref_id})">
                Remove from Cart
              </button>
              <div class="qty-controls">
                <button onclick="window.nextDebug.updateQuantity(${pkg.ref_id}, ${(cartItem?.quantity || 1) - 1})">-</button>
                <span>${cartItem?.quantity || 0}</span>
                <button onclick="window.nextDebug.updateQuantity(${pkg.ref_id}, ${(cartItem?.quantity || 1) + 1})">+</button>
              </div>
            ` : `
              <button class="package-btn add-btn" onclick="window.nextDebug.addToCart(${pkg.ref_id})">
                Add to Cart - $${pkg.price_total}
              </button>
            `}
            <button class="package-btn inspect-btn" onclick="window.nextDebug.inspectPackage(${pkg.ref_id})">
              Inspect
            </button>
          </div>
        </div>
      </div>
    `;
  }
  getShippingMethodsSection(shippingMethods) {
    return `
      <div class="section">
        <h3 class="section-title">Shipping Methods</h3>
        
        <div class="shipping-methods">
          ${shippingMethods.map((method) => `
            <div class="shipping-method-card">
              <div class="shipping-info">
                <div class="shipping-name">${method.code}</div>
                <div class="shipping-id">ID: ${method.ref_id}</div>
              </div>
              <div class="shipping-price">
                ${parseFloat(method.price) === 0 ? "FREE" : `$${method.price}`}
              </div>
              <button class="shipping-test-btn" onclick="window.nextDebug.testShippingMethod(${method.ref_id})">
                Test
              </button>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
  getPriceRange(packages) {
    const prices = packages.map((p) => parseFloat(p.price_total)).filter((p) => p > 0);
    if (prices.length === 0) return "Free";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `$${min}`;
    return `$${min} - $${max}`;
  }
  getActions() {
    return [
      {
        label: "Refresh Campaign",
        action: () => {
          const configStore$12 = configStore.getState();
          const campaignStore2 = useCampaignStore.getState();
          if (configStore$12.apiKey) {
            campaignStore2.loadCampaign(configStore$12.apiKey);
          } else {
            console.error("No API key available to load campaign");
          }
        },
        variant: "primary"
      },
      {
        label: "Export Packages",
        action: () => this.exportPackages(),
        variant: "secondary"
      },
      {
        label: "Test All Packages",
        action: () => this.testAllPackages(),
        variant: "secondary"
      },
      {
        label: "Clear Cart",
        action: () => useCartStore.getState().clear(),
        variant: "danger"
      }
    ];
  }
  exportPackages() {
    const campaignState = useCampaignStore.getState();
    const data = campaignState.data;
    if (!data) return;
    const exportData = {
      campaign: data.name,
      packages: data.packages,
      shipping_methods: data.shipping_methods,
      export_date: (/* @__PURE__ */ new Date()).toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-packages-${data.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  testAllPackages() {
    const campaignState = useCampaignStore.getState();
    const cartStore = useCartStore.getState();
    const data = campaignState.data;
    if (!data) return;
    data.packages.slice(0, 3).forEach((pkg) => {
      cartStore.addItem({
        packageId: pkg.ref_id,
        quantity: 1,
        title: pkg.name,
        isUpsell: false
      });
    });
  }
}
const _DebugOverlay = class _DebugOverlay {
  constructor() {
    this.visible = false;
    this.isExpanded = false;
    this.container = null;
    this.activePanel = "cart";
    this.updateInterval = null;
    this.logger = new Logger("DebugOverlay");
    this.panels = [];
    this.handleContainerClick = (event) => {
      const target = event.target;
      const action = target.getAttribute("data-action") || target.closest("[data-action]")?.getAttribute("data-action");
      if (action) {
        switch (action) {
          case "toggle-expand":
            this.isExpanded = !this.isExpanded;
            localStorage.setItem(_DebugOverlay.EXPANDED_STORAGE_KEY, this.isExpanded.toString());
            this.updateBodyHeight();
            this.updateOverlay();
            break;
          case "close":
            this.hide();
            break;
          case "clear-cart":
            this.clearCart();
            break;
          case "export-data":
            this.exportAllData();
            break;
          case "toggle-mini-cart":
            this.toggleMiniCart();
            break;
          case "toggle-xray":
            this.toggleXray();
            break;
        }
        return;
      }
      const panelTab = target.closest(".debug-panel-tab");
      if (panelTab) {
        const panelId = panelTab.getAttribute("data-panel");
        if (panelId && panelId !== this.activePanel) {
          this.activePanel = panelId;
          this.activePanelTab = void 0;
          this.updateOverlay();
        }
        return;
      }
      const horizontalTab = target.closest(".horizontal-tab");
      if (horizontalTab) {
        const tabId = horizontalTab.getAttribute("data-panel-tab");
        if (tabId && tabId !== this.activePanelTab) {
          this.activePanelTab = tabId;
          this.updateOverlay();
        }
        return;
      }
      const panelActionBtn = target.closest(".panel-action-btn");
      if (panelActionBtn) {
        const actionLabel = panelActionBtn.getAttribute("data-panel-action");
        const activePanel = this.panels.find((p) => p.id === this.activePanel);
        const panelAction = activePanel?.getActions?.()?.find((a) => a.label === actionLabel);
        if (panelAction) {
          panelAction.action();
          setTimeout(() => this.updateContent(), 100);
        }
        return;
      }
    };
    this.eventManager = new DebugEventManager();
    this.initializePanels();
    this.setupEventListeners();
    const savedExpandedState = localStorage.getItem(_DebugOverlay.EXPANDED_STORAGE_KEY);
    if (savedExpandedState === "true") {
      this.isExpanded = true;
    }
  }
  static getInstance() {
    if (!_DebugOverlay.instance) {
      _DebugOverlay.instance = new _DebugOverlay();
    }
    return _DebugOverlay.instance;
  }
  initializePanels() {
    this.panels = [
      new CartPanel(),
      new ConfigPanel(),
      new EnhancedCampaignPanel(),
      new CheckoutPanel(),
      new EventTimelinePanel(),
      new StoragePanel()
    ];
  }
  setupEventListeners() {
    document.addEventListener("debug:update-content", () => {
      this.updateContent();
    });
  }
  initialize() {
    const urlParams = new URLSearchParams(window.location.search);
    const isDebugMode = urlParams.get("debugger") === "true";
    if (isDebugMode) {
      this.show();
      this.logger.info("Debug overlay initialized");
    }
  }
  async show() {
    if (this.visible) return;
    this.visible = true;
    await this.createOverlay();
    this.startAutoUpdate();
    XrayManager.initialize();
    if (XrayManager.isXrayActive()) {
      const xrayButton = this.container?.querySelector('[data-action="toggle-xray"]');
      if (xrayButton) {
        xrayButton.classList.add("active");
        xrayButton.setAttribute("title", "Disable X-Ray View");
      }
    }
    const savedMiniCartState = localStorage.getItem("debug-mini-cart-visible");
    if (savedMiniCartState === "true") {
      this.toggleMiniCart();
    }
  }
  hide() {
    if (!this.visible) return;
    this.visible = false;
    this.stopAutoUpdate();
    document.body.classList.remove("debug-body-expanded");
    document.documentElement.classList.remove("debug-body-expanded");
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    EnhancedDebugUI.removeStyles();
  }
  async toggle() {
    if (this.visible) {
      this.hide();
    } else {
      await this.show();
    }
  }
  isVisible() {
    return this.visible;
  }
  async createOverlay() {
    const { DebugStyleLoader } = await import("./DebugStyleLoader-C5EOCirb.js");
    await DebugStyleLoader.loadDebugStyles();
    this.container = document.createElement("div");
    this.container.className = "debug-overlay";
    this.updateOverlay();
    this.addEventListeners();
    document.body.appendChild(this.container);
  }
  updateOverlay() {
    if (!this.container) return;
    this.panels = this.panels.map(
      (panel) => panel.id === "events" ? new EventsPanel(this.eventManager.getEvents()) : panel
    );
    this.container.innerHTML = EnhancedDebugUI.createOverlayHTML(
      this.panels,
      this.activePanel,
      this.isExpanded,
      this.activePanelTab
    );
    this.addEventListeners();
    this.updateButtonStates();
  }
  updateContent() {
    if (!this.container) return;
    const panelContent = this.container.querySelector(".panel-content");
    if (panelContent) {
      const activePanel = this.panels.find((p) => p.id === this.activePanel);
      if (activePanel) {
        const tabs = activePanel.getTabs?.() || [];
        if (tabs.length > 0) {
          const activeTabId = this.activePanelTab || tabs[0]?.id;
          const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];
          if (activeTab) {
            panelContent.innerHTML = activeTab.getContent();
          }
        } else {
          panelContent.innerHTML = activePanel.getContent();
        }
      }
    }
  }
  addEventListeners() {
    if (!this.container) return;
    this.container.removeEventListener("click", this.handleContainerClick);
    this.container.addEventListener("click", this.handleContainerClick);
  }
  updateBodyHeight() {
    if (this.isExpanded) {
      document.body.classList.add("debug-body-expanded");
      document.documentElement.classList.add("debug-body-expanded");
    } else {
      document.body.classList.remove("debug-body-expanded");
      document.documentElement.classList.remove("debug-body-expanded");
    }
  }
  startAutoUpdate() {
    this.updateInterval = window.setInterval(() => {
      this.updateQuickStats();
      if (this.activePanel === "cart" || this.activePanel === "config") {
        this.updateContent();
      }
    }, 1e3);
  }
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  // Public API for external access
  getEventManager() {
    return this.eventManager;
  }
  getPanels() {
    return this.panels;
  }
  setActivePanel(panelId) {
    if (this.panels.find((p) => p.id === panelId)) {
      this.activePanel = panelId;
      this.updateOverlay();
    }
  }
  logEvent(type, data, source = "Manual") {
    this.eventManager.logEvent(type, data, source);
  }
  // Enhanced debug methods for global access
  clearCart() {
    useCartStore.getState().clear();
    this.updateContent();
  }
  exportAllData() {
    const debugData = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      cart: useCartStore.getState(),
      config: configStore.getState(),
      events: this.eventManager.getEvents(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    const data = JSON.stringify(debugData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-session-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  toggleMiniCart() {
    let miniCart = document.getElementById("debug-mini-cart-display");
    if (!miniCart) {
      miniCart = document.createElement("div");
      miniCart.id = "debug-mini-cart-display";
      miniCart.className = "debug-mini-cart-display";
      document.body.appendChild(miniCart);
      useCartStore.subscribe(() => {
        if (miniCart && miniCart.classList.contains("show")) {
          this.updateMiniCart();
        }
      });
      const savedState = localStorage.getItem("debug-mini-cart-visible");
      if (savedState === "true") {
        miniCart.classList.add("show");
        this.updateMiniCart();
      }
    } else {
      miniCart.classList.toggle("show");
      localStorage.setItem("debug-mini-cart-visible", miniCart.classList.contains("show").toString());
      if (miniCart.classList.contains("show")) {
        this.updateMiniCart();
      }
    }
    const cartButton = this.container?.querySelector('[data-action="toggle-mini-cart"]');
    if (cartButton && miniCart) {
      if (miniCart.classList.contains("show")) {
        cartButton.classList.add("active");
        cartButton.setAttribute("title", "Hide Mini Cart");
      } else {
        cartButton.classList.remove("active");
        cartButton.setAttribute("title", "Toggle Mini Cart");
      }
    }
  }
  updateMiniCart() {
    const miniCart = document.getElementById("debug-mini-cart-display");
    if (!miniCart || !miniCart.classList.contains("show")) return;
    const cartState = useCartStore.getState();
    if (!cartState.items || cartState.items.length === 0) {
      miniCart.innerHTML = `
        <div class="debug-mini-cart-header">
          <span>🛒 Debug Cart</span>
          <button class="mini-cart-close" onclick="document.getElementById('debug-mini-cart-display').classList.remove('show'); localStorage.setItem('debug-mini-cart-visible', 'false')">×</button>
        </div>
        <div class="debug-mini-cart-empty">Cart empty</div>
      `;
      return;
    }
    let itemsHtml = "";
    cartState.items.forEach((item) => {
      const isUpsell = item.is_upsell;
      const upsellBadge = isUpsell ? '<span class="mini-cart-upsell-badge">UPSELL</span>' : "";
      itemsHtml += `
        <div class="debug-mini-cart-item">
          <div class="mini-cart-item-info">
            <span class="mini-cart-item-id">ID: ${item.packageId}</span>
            ${upsellBadge}
            <span class="mini-cart-item-qty">×${item.quantity}</span>
          </div>
          <div class="mini-cart-item-title">${item.title || "Unknown"}</div>
          <div class="mini-cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      `;
    });
    miniCart.innerHTML = `
      <div class="debug-mini-cart-header">
        <span>🛒 Debug Cart</span>
        <button class="mini-cart-close" onclick="document.getElementById('debug-mini-cart-display').classList.remove('show'); localStorage.setItem('debug-mini-cart-visible', 'false')">×</button>
      </div>
      <div class="debug-mini-cart-items">${itemsHtml}</div>
      <div class="debug-mini-cart-footer">
        <div class="mini-cart-stat">
          <span>Items:</span>
          <span>${cartState.totalQuantity}</span>
        </div>
        <div class="mini-cart-stat">
          <span>Total:</span>
          <span class="mini-cart-total">${cartState.totals.total.formatted}</span>
        </div>
      </div>
    `;
  }
  toggleXray() {
    const isActive = XrayManager.toggle();
    const xrayButton = this.container?.querySelector('[data-action="toggle-xray"]');
    if (xrayButton) {
      if (isActive) {
        xrayButton.classList.add("active");
        xrayButton.setAttribute("title", "Disable X-Ray View");
      } else {
        xrayButton.classList.remove("active");
        xrayButton.setAttribute("title", "Toggle X-Ray View");
      }
    }
    this.eventManager.logEvent("debug:xray-toggled", { active: isActive }, "Debug");
  }
  updateButtonStates() {
    if (XrayManager.isXrayActive()) {
      const xrayButton = this.container?.querySelector('[data-action="toggle-xray"]');
      if (xrayButton) {
        xrayButton.classList.add("active");
        xrayButton.setAttribute("title", "Disable X-Ray View");
      }
    }
    const miniCart = document.getElementById("debug-mini-cart-display");
    if (miniCart && miniCart.classList.contains("show")) {
      const cartButton = this.container?.querySelector('[data-action="toggle-mini-cart"]');
      if (cartButton) {
        cartButton.classList.add("active");
        cartButton.setAttribute("title", "Hide Mini Cart");
      }
    }
  }
  updateQuickStats() {
    if (!this.container) return;
    const cartState = useCartStore.getState();
    const cartItemsEl = this.container.querySelector('[data-debug-stat="cart-items"]');
    const cartTotalEl = this.container.querySelector('[data-debug-stat="cart-total"]');
    const enhancedElementsEl = this.container.querySelector('[data-debug-stat="enhanced-elements"]');
    if (cartItemsEl) cartItemsEl.textContent = cartState.totalQuantity.toString();
    if (cartTotalEl) cartTotalEl.textContent = cartState.totals.total.formatted;
    if (enhancedElementsEl) enhancedElementsEl.textContent = document.querySelectorAll("[data-next-]").length.toString();
  }
};
_DebugOverlay.EXPANDED_STORAGE_KEY = "debug-overlay-expanded";
let DebugOverlay = _DebugOverlay;
const debugOverlay = DebugOverlay.getInstance();
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    debugOverlay.initialize();
  });
}
class TestModeManager {
  constructor() {
    this.isTestMode = false;
    this.konamiSequence = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "KeyB",
      "KeyA"
    ];
    this.keySequence = [];
    this.testCards = [
      {
        number: "4111111111111111",
        name: "Visa Test Card",
        cvv: "123",
        expiry: "12/25",
        type: "visa"
      },
      {
        number: "5555555555554444",
        name: "Mastercard Test Card",
        cvv: "123",
        expiry: "12/25",
        type: "mastercard"
      },
      {
        number: "378282246310005",
        name: "American Express Test Card",
        cvv: "1234",
        expiry: "12/25",
        type: "amex"
      },
      {
        number: "6011111111111117",
        name: "Discover Test Card",
        cvv: "123",
        expiry: "12/25",
        type: "discover"
      }
    ];
    this.initializeKonamiCode();
    this.checkUrlTestMode();
  }
  static getInstance() {
    if (!TestModeManager.instance) {
      TestModeManager.instance = new TestModeManager();
    }
    return TestModeManager.instance;
  }
  initializeKonamiCode() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }
  handleKeyDown(event) {
    this.keySequence.push(event.code);
    if (this.keySequence.length > this.konamiSequence.length) {
      this.keySequence.shift();
    }
    if (this.keySequence.length === this.konamiSequence.length) {
      const isMatch = this.keySequence.every(
        (key, index) => key === this.konamiSequence[index]
      );
      if (isMatch) {
        this.activateKonamiCode();
        this.keySequence = [];
      }
    }
  }
  checkUrlTestMode() {
    const params = new URLSearchParams(window.location.search);
    const debugMode = params.get("debugger") === "true";
    const testMode = params.get("test") === "true";
    if (debugMode || testMode) {
      this.isTestMode = true;
    }
  }
  activateKonamiCode() {
    console.log("🎮 Konami Code activated!");
    this.isTestMode = true;
    this.showKonamiMessage();
    const url = new URL(window.location.href);
    url.searchParams.set("test", "true");
    window.history.replaceState({}, "", url.toString());
    if (this.konamiCallback) {
      setTimeout(() => {
        this.konamiCallback?.();
      }, 2e3);
    }
    document.dispatchEvent(new CustomEvent("next:test-mode-activated", {
      detail: { method: "konami" }
    }));
  }
  showKonamiMessage() {
    const message = document.createElement("div");
    message.className = "konami-activation-message";
    message.innerHTML = `
      <div class="konami-content">
        <h3>🎮 Konami Code Activated!</h3>
        <p>Test mode enabled. You can now use test payment methods.</p>
        <div class="konami-progress">
          <div class="konami-progress-bar"></div>
        </div>
      </div>
    `;
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      text-align: center;
      min-width: 300px;
    `;
    const progressBar = message.querySelector(".konami-progress-bar");
    if (progressBar) {
      progressBar.style.cssText = `
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.3);
        border-radius: 2px;
        overflow: hidden;
        margin-top: 1rem;
      `;
      progressBar.innerHTML = '<div style="width: 0; height: 100%; background: white; transition: width 2s ease-in-out;"></div>';
    }
    document.body.appendChild(message);
    setTimeout(() => {
      const bar = progressBar?.querySelector("div");
      if (bar) {
        bar.style.width = "100%";
      }
    }, 100);
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 2500);
  }
  setTestMode(enabled) {
    this.isTestMode = enabled;
    if (enabled) {
      const url = new URL(window.location.href);
      url.searchParams.set("test", "true");
      window.history.replaceState({}, "", url.toString());
    }
  }
  isActive() {
    return this.isTestMode;
  }
  onKonamiCode(callback) {
    this.konamiCallback = callback;
  }
  getTestCards() {
    return [...this.testCards];
  }
  getTestCard(type) {
    if (type) {
      const card = this.testCards.find((c) => c.type === type);
      if (card) return card;
    }
    const defaultCard = this.testCards[0];
    if (!defaultCard) {
      throw new Error("No test cards available");
    }
    return defaultCard;
  }
  fillTestCardData(cardType = "visa") {
    if (!this.isTestMode) return;
    const testCard = this.getTestCard(cardType);
    const numberField = document.querySelector('input[data-spreedly="number"], input[name*="card_number"], input[name*="cardNumber"]');
    if (numberField) {
      numberField.value = testCard.number;
      numberField.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const cvvField = document.querySelector('input[data-spreedly="cvv"], input[name*="cvv"], input[name*="security"]');
    if (cvvField) {
      cvvField.value = testCard.cvv;
      cvvField.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const expiryField = document.querySelector('input[name*="expiry"], input[name*="exp"]');
    if (expiryField) {
      expiryField.value = testCard.expiry;
      expiryField.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      const monthField = document.querySelector('select[name*="month"], input[name*="month"]');
      const yearField = document.querySelector('select[name*="year"], input[name*="year"]');
      if (monthField && yearField) {
        const [month, year] = testCard.expiry.split("/");
        if (month && year) {
          monthField.value = month;
          yearField.value = `20${year}`;
          monthField.dispatchEvent(new Event("change", { bubbles: true }));
          yearField.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    }
    const nameField = document.querySelector('input[name*="cardholder"], input[name*="card_name"]');
    if (nameField) {
      nameField.value = "Test Cardholder";
      nameField.dispatchEvent(new Event("input", { bubbles: true }));
    }
    console.log(`Filled test card data: ${testCard.name}`);
  }
  showTestCardMenu() {
    if (!this.isTestMode) return;
    const menu = document.createElement("div");
    menu.className = "test-card-menu";
    menu.innerHTML = `
      <div class="test-card-content">
        <h4>Test Card Numbers</h4>
        <div class="test-card-options">
          ${this.testCards.map((card) => `
            <button class="test-card-option" data-card-type="${card.type}">
              <div class="card-name">${card.name}</div>
              <div class="card-number">${card.number}</div>
            </button>
          `).join("")}
        </div>
        <button class="test-card-close">Close</button>
      </div>
    `;
    menu.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: Arial, sans-serif;
      min-width: 250px;
    `;
    menu.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("test-card-option") || target.closest(".test-card-option")) {
        const button = target.closest(".test-card-option");
        const cardType = button.getAttribute("data-card-type");
        if (cardType) {
          this.fillTestCardData(cardType);
          menu.remove();
        }
      } else if (target.classList.contains("test-card-close")) {
        menu.remove();
      }
    });
    document.body.appendChild(menu);
    setTimeout(() => {
      if (menu.parentNode) {
        menu.remove();
      }
    }, 3e4);
  }
}
const testModeManager = TestModeManager.getInstance();
class SentryManager {
  constructor() {
    this.initialized = false;
    this.sentryLib = null;
    this.logger = new Logger("SentryManager");
  }
  static getInstance() {
    if (!SentryManager.instance) {
      SentryManager.instance = new SentryManager();
    }
    return SentryManager.instance;
  }
  async initialize(config) {
    if (this.initialized || !config.monitoring?.sentry?.enabled) {
      return;
    }
    try {
      const Sentry = await import("./index-BkrrHRaT.js");
      this.sentryLib = Sentry;
      const sentryConfig = config.monitoring.sentry;
      Sentry.init({
        dsn: sentryConfig.dsn,
        environment: sentryConfig.environment || (config.debug ? "development" : "production"),
        release: sentryConfig.release || `campaign-cart@${"0.2.0"}`,
        // Send default PII (user IP, headers) as recommended in sentry.md
        sendDefaultPii: true,
        // Performance monitoring
        tracesSampleRate: sentryConfig.tracesSampleRate || (config.debug ? 1 : 0.1),
        // Distributed tracing configuration
        // Note: Removed campaigns.apps.29next.com due to CORS issues with baggage header
        tracePropagationTargets: sentryConfig.tracePropagationTargets || [
          "localhost"
          // Add other domains here that support the baggage header
        ],
        // Session replay
        replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate || 0,
        replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate || 0.1,
        // Enable logging as per error-rules.md
        _experiments: {
          enableLogs: true
        },
        // SDK metadata
        beforeSend: (event) => {
          event.tags = {
            ...event.tags,
            sdk_version: "0.2.0",
            merchant_id: config.apiKey.slice(0, 8),
            // First 8 chars of API key
            debug_mode: config.debug
          };
          event.contexts = {
            ...event.contexts,
            campaign_cart: {
              page_type: this.detectPageType(),
              enhancers_loaded: this.getLoadedEnhancers(),
              config_source: window.nextConfig ? "inline" : "external"
            }
          };
          if (sentryConfig.beforeSend) {
            return sentryConfig.beforeSend(event);
          }
          return event;
        },
        // Integrations
        integrations: [
          Sentry.browserTracingIntegration(),
          // Console logging integration
          Sentry.captureConsoleIntegration({
            levels: ["error", "warn"]
          }),
          // Only include Replay if sample rates are set
          ...sentryConfig.replaysSessionSampleRate || sentryConfig.replaysOnErrorSampleRate ? [Sentry.replayIntegration({
            maskAllText: false,
            maskAllInputs: true,
            blockAllMedia: false,
            // Mask sensitive data
            mask: [
              "[data-next-payment]",
              "[data-next-cvv]",
              '[type="password"]'
            ]
          })] : []
        ]
      });
      this.setUserContext(config);
      this.initialized = true;
      this.logger.debug("Sentry initialized successfully");
      if (config.debug) {
        window.Sentry = this.sentryLib;
      }
    } catch (error) {
      this.logger.error("Failed to initialize Sentry:", error);
    }
  }
  captureException(error, context) {
    if (!this.initialized || !this.sentryLib) return;
    this.sentryLib.captureException(error, {
      extra: context
    });
  }
  captureMessage(message, level = "info") {
    if (!this.initialized || !this.sentryLib) return;
    this.sentryLib.captureMessage(message, level);
  }
  addBreadcrumb(breadcrumb) {
    if (!this.initialized || !this.sentryLib) return;
    this.sentryLib.addBreadcrumb(breadcrumb);
  }
  setUserContext(config) {
    if (!this.initialized || !this.sentryLib) return;
    this.sentryLib.setUser({
      id: config.apiKey.slice(0, 8),
      // Merchant identifier
      merchant_api_key: config.apiKey.slice(0, 8) + "..."
    });
  }
  startSpan(options, callback) {
    if (!this.initialized || !this.sentryLib) {
      return callback(null);
    }
    return this.sentryLib.startSpan(options, callback);
  }
  // Access to Sentry logger as per error-rules.md
  getLogger() {
    if (!this.initialized || !this.sentryLib) return null;
    return this.sentryLib;
  }
  detectPageType() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes("checkout")) return "checkout";
    if (path.includes("upsell")) return "upsell";
    if (path.includes("thank")) return "thank-you";
    if (path.includes("cart")) return "cart";
    if (path.includes("product")) return "product";
    return "unknown";
  }
  getLoadedEnhancers() {
    const enhancers = [];
    document.querySelectorAll("[data-next-enhanced]").forEach((el) => {
      const enhancer = el.getAttribute("data-next-enhanced");
      if (enhancer && !enhancers.includes(enhancer)) {
        enhancers.push(enhancer);
      }
    });
    return enhancers;
  }
}
const sentryManager = SentryManager.getInstance();
const SentryManager$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  sentryManager
}, Symbol.toStringTag, { value: "Module" }));
class ApiClient {
  constructor(apiKey) {
    this.baseURL = "https://campaigns.apps.29next.com";
    this.apiKey = apiKey;
    this.logger = createLogger("ApiClient");
  }
  // Campaign endpoints
  async getCampaigns() {
    return this.request("/api/v1/campaigns/");
  }
  // Cart endpoints
  async createCart(data) {
    return this.request("/api/v1/carts/", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  // Order endpoints
  async createOrder(data) {
    return this.request("/api/v1/orders/", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  async getOrder(refId) {
    return this.request(`/api/v1/orders/${refId}/`);
  }
  async addUpsell(refId, data) {
    return this.request(`/api/v1/orders/${refId}/upsells/`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  // Prospect Cart endpoints
  async createProspectCart(data) {
    return this.request("/api/v1/prospect-carts/", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  async updateProspectCart(cartId, data) {
    return this.request(`/api/v1/prospect-carts/${cartId}/`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  }
  async getProspectCart(cartId) {
    return this.request(`/api/v1/prospect-carts/${cartId}/`);
  }
  async abandonProspectCart(cartId) {
    return this.request(`/api/v1/prospect-carts/${cartId}/abandon/`, {
      method: "POST"
    });
  }
  async convertProspectCart(cartId) {
    return this.request(`/api/v1/prospect-carts/${cartId}/convert/`, {
      method: "POST"
    });
  }
  // Generic request handler with error handling and rate limiting
  async request(endpoint, options) {
    const method = options?.method || "GET";
    const url = `${this.baseURL}${endpoint}`;
    return sentryManager.startSpan(
      {
        op: "http.client",
        name: `${method} ${endpoint}`,
        attributes: {
          "http.method": method,
          "http.url": url,
          "api.key_prefix": this.apiKey.slice(0, 8)
        }
      },
      async (span) => {
        const headers = {
          "Authorization": this.apiKey,
          "Content-Type": "application/json",
          ...options?.headers
        };
        this.logger.debug(`API Request: ${method} ${url}`);
        if (options?.body && typeof options.body === "string") {
          span?.setAttribute("http.request.body.size", options.body.length);
        }
        try {
          const startTime = performance.now();
          const response = await fetch(url, {
            ...options,
            headers
          });
          const duration = performance.now() - startTime;
          span?.setAttribute("http.status_code", response.status);
          span?.setAttribute("http.response.duration", duration);
          if (response.status === 429) {
            const retryAfter = response.headers.get("Retry-After");
            span?.setAttribute("rate_limit.retry_after", retryAfter);
            const message = `Rate limited. Retry after ${retryAfter} seconds`;
            this.logger.warn(message);
            throw new Error(message);
          }
          if (!response.ok) {
            const errorMessage = `API Error: ${response.status} ${response.statusText}`;
            span?.setAttribute("error", true);
            span?.setAttribute("error.message", errorMessage);
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
          }
          const data = await response.json();
          const responseSize = JSON.stringify(data).length;
          span?.setAttribute("http.response.body.size", responseSize);
          this.logger.debug(`API Response: ${response.status}`, data);
          return data;
        } catch (error) {
          span?.setAttribute("error", true);
          if (error instanceof Error) {
            span?.setAttribute("error.type", error.name);
            span?.setAttribute("error.message", error.message);
            this.logger.error("API request failed:", error.message);
          } else {
            span?.setAttribute("error.type", "unknown");
            span?.setAttribute("error.message", String(error));
            this.logger.error("API request failed:", String(error));
          }
          throw error;
        }
      }
    );
  }
  // Update API key
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }
  // Get current API key
  getApiKey() {
    return this.apiKey;
  }
}
const client = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ApiClient
}, Symbol.toStringTag, { value: "Module" }));
const _SDKInitializer = class _SDKInitializer {
  static async initialize() {
    if (this.initialized) {
      this.logger.warn("SDK already initialized");
      return;
    }
    try {
      this.logger.info("Initializing 29Next Campaign Cart SDKv v0.2.0...");
      await this.waitForDOM();
      await this.loadConfiguration();
      await this.initializeAttribution();
      await this.loadCampaignData();
      await this.initializeAnalytics();
      await this.initializeSentry();
      this.initializeErrorHandler();
      await this.checkAndLoadOrder();
      await this.scanAndEnhanceDOM();
      this.setupReadyCallbacks();
      this.initializeDebugMode();
      this.initialized = true;
      this.retryAttempts = 0;
      this.logger.info("SDK initialization complete ✅");
      this.emitInitializedEvent();
    } catch (error) {
      this.logger.error("SDK initialization failed:", error);
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        this.logger.warn(`Retrying initialization (attempt ${this.retryAttempts}/${this.maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, 1e3 * this.retryAttempts));
        return this.initialize();
      }
      throw error;
    }
  }
  static async loadConfiguration() {
    const configStore$12 = configStore.getState();
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = urlParams.get("debugger") === "true";
    const forcePackageId = urlParams.get("forcePackageId");
    configStore$12.loadFromMeta();
    configStore$12.loadFromWindow();
    if (debugMode) {
      configStore$12.updateConfig({ debug: true });
    }
    if (forcePackageId) {
      this.logger.info("forcePackageId parameter detected:", forcePackageId);
      window._nextForcePackageId = forcePackageId;
    }
    this.logger.debug("Configuration loaded:", configStore$12);
  }
  static async loadCampaignData() {
    const configStore$12 = configStore.getState();
    const campaignStore2 = useCampaignStore.getState();
    if (!configStore$12.apiKey) {
      throw new Error("API key not found. Please set next-api-key meta tag or window.nextConfig.apiKey");
    }
    await campaignStore2.loadCampaign(configStore$12.apiKey);
    this.logger.debug("Campaign data loaded");
    await this.processForcePackageId();
  }
  static async processForcePackageId() {
    const forcePackageId = window._nextForcePackageId;
    if (!forcePackageId) {
      return;
    }
    try {
      this.logger.info("Processing forcePackageId parameter:", forcePackageId);
      const cartStore = useCartStore.getState();
      const campaignStore2 = useCampaignStore.getState();
      await cartStore.clear();
      this.logger.debug("Cart cleared for forcePackageId");
      const packageSpecs = forcePackageId.split(",").map((spec) => {
        const [idStr, quantityStr] = spec.trim().split(":");
        const packageId = parseInt(idStr || "", 10);
        const quantity = quantityStr ? parseInt(quantityStr, 10) : 1;
        if (isNaN(packageId) || packageId <= 0) {
          throw new Error(`Invalid package ID: ${idStr}`);
        }
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity: ${quantityStr}`);
        }
        return { packageId, quantity };
      });
      this.logger.debug("Parsed package specifications:", packageSpecs);
      for (const spec of packageSpecs) {
        const packageData = campaignStore2.getPackage(spec.packageId);
        if (!packageData) {
          this.logger.warn(`Package ${spec.packageId} not found in campaign data, skipping`);
          continue;
        }
        await cartStore.addItem({
          packageId: spec.packageId,
          quantity: spec.quantity,
          isUpsell: false
        });
        this.logger.debug(`Added package ${spec.packageId} with quantity ${spec.quantity} to cart`);
      }
      this.logger.info(`Successfully processed forcePackageId: added ${packageSpecs.length} package(s) to cart`);
      delete window._nextForcePackageId;
    } catch (error) {
      this.logger.error("Error processing forcePackageId parameter:", error);
    }
  }
  static async initializeAttribution() {
    try {
      this.logger.info("Initializing attribution...");
      const attributionStore = useAttributionStore.getState();
      const configStore$12 = configStore.getState();
      await attributionStore.initialize();
      this.setupAttributionListeners();
      if (configStore$12.utmTransfer?.enabled) {
        const { UtmTransfer } = await import("./UtmTransfer-D6R6qi45.js");
        const utmTransfer = new UtmTransfer(configStore$12.utmTransfer);
        utmTransfer.init();
        this.logger.debug("UTM transfer initialized");
      }
      this.logger.debug("Attribution initialized");
    } catch (error) {
      this.logger.error("Attribution initialization failed:", error);
    }
  }
  static setupAttributionListeners() {
    const eventBus = EventBus.getInstance();
    const attributionStore = useAttributionStore.getState();
    eventBus.on("campaign:loaded", (campaign) => {
      if (campaign?.name && !attributionStore.funnel) {
        attributionStore.setFunnelName(campaign.name);
        this.logger.debug("Set funnel name from campaign:", campaign.name);
      }
    });
    eventBus.on("cart:updated", () => {
      attributionStore.updateAttribution({
        metadata: {
          ...attributionStore.metadata,
          conversion_timestamp: Date.now()
        }
      });
      this.logger.debug("Updated attribution with conversion timestamp");
    });
    window.addEventListener("popstate", () => {
      attributionStore.updateAttribution({
        metadata: {
          ...attributionStore.metadata,
          landing_page: window.location.href
        }
      });
    });
  }
  static async initializeAnalytics() {
    setTimeout(async () => {
      try {
        this.logger.info("Initializing analyticsv v0.2.0 (lazy)...");
        const { nextAnalytics } = await import("./index-BpSKXVqT.js");
        await nextAnalytics.initialize();
        this.logger.debug("Analyticsv v0.2.0 initialized successfully (lazy)");
      } catch (error) {
        this.logger.warn("Analyticsv v0.2.0 initialization failed (non-critical):", error);
      }
    }, 0);
  }
  static async initializeSentry() {
    const configStore$12 = configStore.getState();
    if (!configStore$12.monitoring?.sentry?.enabled) {
      return;
    }
    try {
      this.logger.info("Initializing Sentry error monitoring...");
      const { sentryManager: sentryManager2 } = await Promise.resolve().then(() => SentryManager$1);
      await sentryManager2.initialize(configStore$12);
      this.logger.debug("Sentry initialized successfully");
    } catch (error) {
      this.logger.warn("Sentry initialization failed (non-critical):", error);
    }
  }
  static initializeErrorHandler() {
    try {
      import("./errorHandler-DzG-Fuf1.js").then(({ errorHandler }) => {
        errorHandler.initialize();
        this.logger.debug("Error handler initialized");
      });
    } catch (error) {
      this.logger.warn("Error handler initialization failed:", error);
    }
  }
  static async checkAndLoadOrder() {
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get("ref_id");
    if (refId) {
      this.logger.info("Page loaded with ref_id parameter, auto-loading order:", refId);
      try {
        const configStore$12 = configStore.getState();
        const orderStore = useOrderStore.getState();
        const apiClient = new ApiClient(configStore$12.apiKey);
        await orderStore.loadOrder(refId, apiClient);
        this.logger.info("Order loaded successfully:", orderStore.order);
        if (orderStore.order) {
          this.logger.info("Order supports upsells:", orderStore.order.supports_post_purchase_upsells);
        }
      } catch (error) {
        this.logger.error("Failed to auto-load order:", error);
      }
    }
  }
  static async scanAndEnhanceDOM() {
    if (this.attributeScanner) {
      this.attributeScanner.destroy();
    }
    this.attributeScanner = new AttributeScanner();
    await this.attributeScanner.scanAndEnhance(document.body);
    const stats = this.attributeScanner.getStats();
    this.logger.info("DOM scanning and enhancement complete", stats);
  }
  static setupReadyCallbacks() {
    const sdk = NextCommerce.getInstance();
    if (typeof window !== "undefined") {
      if (Array.isArray(window.nextReady)) {
        const readyQueue = window.nextReady;
        readyQueue.forEach((callback) => {
          try {
            callback(sdk);
          } catch (error) {
            this.logger.error("Ready callback error:", error);
          }
        });
      }
      window.next = sdk;
      window.nextReady = {
        push: (callback) => {
          try {
            callback(sdk);
          } catch (error) {
            this.logger.error("Ready callback error:", error);
          }
        }
      };
      this.logger.debug("nextReady callback system and window.next API initialized");
    }
  }
  static initializeDebugMode() {
    const configStore$12 = configStore.getState();
    if (configStore$12.debug) {
      this.logger.info("Debug mode enabled - initializing debug utilities");
      debugOverlay.initialize();
      this.setupGlobalDebugUtils();
      this.logger.info("Debug utilities initialized ✅");
    }
  }
  static setupGlobalDebugUtils() {
    if (typeof window !== "undefined") {
      window.nextDebug = {
        overlay: debugOverlay,
        testMode: testModeManager,
        stores: {
          cart: useCartStore,
          campaign: useCampaignStore,
          config: configStore,
          checkout: useCheckoutStore,
          order: useOrderStore,
          attribution: useAttributionStore
        },
        sdk: NextCommerce.getInstance(),
        reinitialize: () => this.reinitialize(),
        getStats: () => this.getInitializationStats(),
        // Enhanced cart methods
        addToCart: (packageId, quantity = 1) => {
          const cartStore = useCartStore.getState();
          const campaignStore2 = useCampaignStore.getState();
          const packageData = campaignStore2.getPackage(packageId);
          if (packageData) {
            cartStore.addItem({
              packageId,
              quantity,
              price: parseFloat(packageData.price),
              title: packageData.name,
              isUpsell: false
            });
          }
        },
        removeFromCart: (packageId) => {
          useCartStore.getState().removeItem(packageId);
        },
        updateQuantity: (packageId, quantity) => {
          useCartStore.getState().updateQuantity(packageId, quantity);
        },
        // Analytics methods (removed - will be combined with analytics below)
        // Campaign methods
        loadCampaign: () => {
          const configStore$12 = configStore.getState();
          return useCampaignStore.getState().loadCampaign(configStore$12.apiKey);
        },
        clearCampaignCache: () => {
          useCampaignStore.getState().clearCache();
        },
        getCacheInfo: () => {
          const info = useCampaignStore.getState().getCacheInfo();
          console.table(info);
          return info;
        },
        inspectPackage: (packageId) => {
          const campaignStore2 = useCampaignStore.getState();
          const packageData = campaignStore2.getPackage(packageId);
          console.group(`📦 Package ${packageId} Details`);
          console.table(packageData);
          console.groupEnd();
        },
        testShippingMethod: async (methodId) => {
          console.log(`🚚 Testing shipping method ${methodId}`);
          try {
            const cartStore = useCartStore.getState();
            await cartStore.setShippingMethod(methodId);
            console.log(`✅ Shipping method ${methodId} set successfully`);
            const state = cartStore;
            const shippingMethod = state.shippingMethod;
            if (shippingMethod) {
              console.log(`📦 Shipping: ${shippingMethod.code} - $${shippingMethod.price}`);
            }
            document.dispatchEvent(new CustomEvent("debug:update-content"));
          } catch (error) {
            console.error(`❌ Failed to set shipping method ${methodId}:`, error);
          }
        },
        sortPackages: (sortBy) => {
          console.log(`🔄 Sorting packages by ${sortBy}`);
          document.dispatchEvent(new CustomEvent("debug:update-content"));
        },
        // Analytics utilities - lazy loaded to avoid blocking
        analytics: {
          getStatus: async () => {
            const { nextAnalytics } = await import("./index-BpSKXVqT.js");
            return nextAnalytics.getStatus();
          },
          getProviders: async () => {
            const { nextAnalytics } = await import("./index-BpSKXVqT.js");
            return nextAnalytics.getStatus().providers;
          },
          track: async (name, data) => {
            const { nextAnalytics } = await import("./index-BpSKXVqT.js");
            return nextAnalytics.track({ event: name, ...data });
          },
          setDebugMode: async (enabled) => {
            const { nextAnalytics } = await import("./index-BpSKXVqT.js");
            return nextAnalytics.setDebugMode(enabled);
          },
          invalidateContext: async () => {
            const { nextAnalytics } = await import("./index-BpSKXVqT.js");
            return nextAnalytics.invalidateContext();
          }
        },
        // Attribution utilities
        attribution: {
          debug: () => useAttributionStore.getState().debug(),
          get: () => useAttributionStore.getState().getAttributionForApi(),
          setFunnel: (funnel) => useAttributionStore.getState().setFunnelName(funnel),
          setEvclid: (evclid) => useAttributionStore.getState().setEverflowClickId(evclid),
          clearFunnel: () => useAttributionStore.getState().clearPersistedFunnel(),
          getFunnel: () => {
            const state = useAttributionStore.getState();
            const persisted = localStorage.getItem("next_funnel_name") || sessionStorage.getItem("next_funnel_name");
            console.log("Current funnel:", state.funnel);
            console.log("Persisted funnel:", persisted);
            return state.funnel || persisted || "(not set)";
          }
        },
        // Element highlighting
        highlightElement: (selector) => {
          console.log(`🎯 Highlighting element: ${selector}`);
        },
        addTestItems: () => {
          const cartStore = useCartStore.getState();
          [2, 7, 9].forEach((packageId) => {
            cartStore.addItem({
              packageId,
              quantity: 1,
              price: 19.99,
              title: `Test Package ${packageId}`,
              isUpsell: false
            });
          });
        },
        // Accordion utilities
        accordion: {
          open: (id) => {
            document.dispatchEvent(new CustomEvent("next:accordion-open", { detail: { id } }));
          },
          close: (id) => {
            document.dispatchEvent(new CustomEvent("next:accordion-close", { detail: { id } }));
          },
          toggle: (id) => {
            document.dispatchEvent(new CustomEvent("next:accordion-toggle", { detail: { id } }));
          }
        },
        // Order and upsell utilities
        order: {
          getJourney: () => {
            const orderStore = useOrderStore.getState();
            const journey = orderStore.getUpsellJourney();
            console.table(journey);
            return journey;
          },
          isExpired: () => useOrderStore.getState().isOrderExpired(),
          clearCache: () => {
            useOrderStore.getState().clearOrder();
            console.log("Order cache cleared");
          },
          getStats: () => {
            const orderStore = useOrderStore.getState();
            return {
              hasOrder: !!orderStore.order,
              refId: orderStore.refId,
              orderAge: orderStore.orderLoadedAt ? `${Math.floor((Date.now() - orderStore.orderLoadedAt) / 1e3 / 60)} minutes` : "N/A",
              viewedUpsells: orderStore.viewedUpsells,
              viewedUpsellPages: orderStore.viewedUpsellPages,
              completedUpsells: orderStore.completedUpsells,
              journeyLength: orderStore.upsellJourney.length
            };
          }
        }
      };
    }
  }
  static isInitialized() {
    return this.initialized;
  }
  static async reinitialize() {
    this.logger.info("Reinitializing SDK...");
    if (this.attributeScanner) {
      this.attributeScanner.destroy();
      this.attributeScanner = null;
    }
    this.initialized = false;
    this.retryAttempts = 0;
    await this.initialize();
  }
  static async waitForDOM() {
    if (document.readyState === "loading") {
      return new Promise((resolve) => {
        const onReady = () => {
          document.removeEventListener("DOMContentLoaded", onReady);
          document.removeEventListener("readystatechange", onReady);
          resolve();
        };
        document.addEventListener("DOMContentLoaded", onReady);
        document.addEventListener("readystatechange", onReady);
      });
    }
  }
  static emitInitializedEvent() {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("next:initialized", {
        detail: {
          version: "0.2.0",
          timestamp: Date.now(),
          stats: this.attributeScanner?.getStats()
        }
      });
      window.dispatchEvent(event);
    }
  }
  static getAttributeScanner() {
    return this.attributeScanner;
  }
  static getInitializationStats() {
    return {
      initialized: this.initialized,
      retryAttempts: this.retryAttempts,
      ...this.attributeScanner && { scannerStats: this.attributeScanner.getStats() }
    };
  }
};
_SDKInitializer.logger = createLogger("SDKInitializer");
_SDKInitializer.initialized = false;
_SDKInitializer.attributeScanner = null;
_SDKInitializer.retryAttempts = 0;
_SDKInitializer.maxRetries = 3;
let SDKInitializer = _SDKInitializer;
/**
 * 29Next Campaign Cart SDKv v0.2.0
 * 
 * Modern TypeScript SDK for seamless e-commerce integration via data attributes.
 * Provides progressive enhancement without disrupting existing HTML/CSS.
 * 
 * @version 0.2.0
 * @author Next Commerce
 * @license MIT
 */
const VERSION = "__VERSION__";
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      SDKInitializer.initialize();
    });
  } else {
    SDKInitializer.initialize();
  }
  window.addEventListener("next:ready", () => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        import("./CartDisplayEnhancer-CceBZGbM.js");
        import("./CartToggleEnhancer-CtjfrpKw.js");
        import("./PackageSelectorEnhancer-DpKFbThY.js");
        import("./ProductDisplayEnhancer-DsbYJp1t.js");
        import("./SelectionDisplayEnhancer-Bw12RfkJ.js");
        import("./TimerEnhancer-DgAHHvrf.js");
      }, { timeout: 5e3 });
      requestIdleCallback(() => {
        import("./CheckoutFormEnhancer-CaTaw0sX.js");
        import("./ExpressCheckoutContainerEnhancer-fOPpemKX.js");
        import("./OrderDisplayEnhancer-1vSIu1rc.js");
        import("./UpsellEnhancer-C0ZnDLU_.js");
        import("./AttributionCollector-C2WwjCQi.js");
        import("./CartItemListEnhancer-4vCb0xsk.js");
        import("./QuantityControlEnhancer-C13iIxno.js");
      }, { timeout: 5e3 });
      requestIdleCallback(() => {
        import("./AccordionEnhancer-D5-AwpCs.js");
        import("./CouponEnhancer-BJ9IfdKm.js");
        import("./SimpleExitIntentEnhancer-pK8KY1wA.js");
        Promise.resolve().then(() => AddressService);
      }, { timeout: 5e3 });
    } else {
      setTimeout(() => {
        import("./CartDisplayEnhancer-CceBZGbM.js");
        import("./ProductDisplayEnhancer-DsbYJp1t.js");
        Promise.resolve().then(() => analytics);
      }, 1e3);
    }
  });
}
const AddressService = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: "Module" }));
const analytics = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: "Module" }));
export {
  AttributeParser as A,
  EventBus as E,
  Logger as L,
  NextCommerce as N,
  SDKInitializer as S,
  VERSION as V,
  useCampaignStore as a,
  useOrderStore as b,
  configStore as c,
  ApiClient as d,
  createLogger as e,
  useCheckoutStore as f,
  useAttributionStore as g,
  sentryManager as s,
  useCartStore as u
};
