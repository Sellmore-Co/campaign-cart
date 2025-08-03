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
var hasRequiredReact_production;
function requireReact_production() {
  if (hasRequiredReact_production) return react_production;
  hasRequiredReact_production = 1;
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
  react_production.version = "19.1.1";
  return react_production;
}
var hasRequiredReact;
function requireReact() {
  if (hasRequiredReact) return react.exports;
  hasRequiredReact = 1;
  {
    react.exports = requireReact_production();
  }
  return react.exports;
}
var reactExports = requireReact();
const ReactExports = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);
var withSelector = { exports: {} };
var withSelector_production = {};
var shim = { exports: {} };
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
var hasRequiredUseSyncExternalStoreShim_production;
function requireUseSyncExternalStoreShim_production() {
  if (hasRequiredUseSyncExternalStoreShim_production) return useSyncExternalStoreShim_production;
  hasRequiredUseSyncExternalStoreShim_production = 1;
  var React = requireReact();
  function is(x, y) {
    return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
  }
  var objectIs = "function" === typeof Object.is ? Object.is : is, useState = React.useState, useEffect = React.useEffect, useLayoutEffect = React.useLayoutEffect, useDebugValue2 = React.useDebugValue;
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
    useEffect(
      function() {
        checkIfSnapshotChanged(inst) && forceUpdate({ inst });
        return subscribe(function() {
          checkIfSnapshotChanged(inst) && forceUpdate({ inst });
        });
      },
      [subscribe]
    );
    useDebugValue2(value);
    return value;
  }
  function checkIfSnapshotChanged(inst) {
    var latestGetSnapshot = inst.getSnapshot;
    inst = inst.value;
    try {
      var nextValue = latestGetSnapshot();
      return !objectIs(inst, nextValue);
    } catch (error) {
      return true;
    }
  }
  function useSyncExternalStore$1(subscribe, getSnapshot) {
    return getSnapshot();
  }
  var shim2 = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
  useSyncExternalStoreShim_production.useSyncExternalStore = void 0 !== React.useSyncExternalStore ? React.useSyncExternalStore : shim2;
  return useSyncExternalStoreShim_production;
}
var hasRequiredShim;
function requireShim() {
  if (hasRequiredShim) return shim.exports;
  hasRequiredShim = 1;
  {
    shim.exports = requireUseSyncExternalStoreShim_production();
  }
  return shim.exports;
}
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredWithSelector_production;
function requireWithSelector_production() {
  if (hasRequiredWithSelector_production) return withSelector_production;
  hasRequiredWithSelector_production = 1;
  var React = requireReact(), shim2 = requireShim();
  function is(x, y) {
    return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
  }
  var objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = shim2.useSyncExternalStore, useRef = React.useRef, useEffect = React.useEffect, useMemo = React.useMemo, useDebugValue2 = React.useDebugValue;
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
    useDebugValue2(value);
    return value;
  };
  return withSelector_production;
}
var hasRequiredWithSelector;
function requireWithSelector() {
  if (hasRequiredWithSelector) return withSelector.exports;
  hasRequiredWithSelector = 1;
  {
    withSelector.exports = requireWithSelector_production();
  }
  return withSelector.exports;
}
var withSelectorExports = requireWithSelector();
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
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["ERROR"] = 0] = "ERROR";
  LogLevel2[LogLevel2["WARN"] = 1] = "WARN";
  LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
  LogLevel2[LogLevel2["DEBUG"] = 3] = "DEBUG";
  return LogLevel2;
})(LogLevel || {});
const isDebugModeEnabled = () => {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("debug") === "true" || params.get("debugger") === "true";
};
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
    if (!isDebugModeEnabled()) {
      return;
    }
    if (_Logger.globalLevel >= 1) {
      console.warn(`[${this.context}] ${message}`, ...args);
    }
  }
  info(message, ...args) {
    if (!isDebugModeEnabled()) {
      return;
    }
    if (_Logger.globalLevel >= 2) {
      console.info(`[${this.context}] ${message}`, ...args);
    }
  }
  debug(message, ...args) {
    if (!isDebugModeEnabled()) {
      return;
    }
    if (_Logger.globalLevel >= 3) {
      console.debug(`[${this.context}] ${message}`, ...args);
    }
  }
};
_Logger.globalLevel = 2;
let Logger = _Logger;
class ProductionLogger extends Logger {
  constructor(context) {
    super(context);
  }
  warn(message, ...args) {
    if (isDebugModeEnabled()) {
      super.warn(message, ...args);
    }
  }
  info(message, ...args) {
    if (isDebugModeEnabled()) {
      super.info(message, ...args);
    }
  }
  debug(message, ...args) {
    if (isDebugModeEnabled()) {
      super.debug(message, ...args);
    }
  }
}
function createLogger(context) {
  {
    return new ProductionLogger(context);
  }
}
createLogger("SDK");
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
const logger$2 = createLogger("CartStore");
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
            logger$2.debug(`Adding upsell item:`, {
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
        logger$2.debug("syncWithAPI not yet implemented");
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
const logger$1 = createLogger("CampaignStore");
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
        logger$1.info("🎯 Using cached campaign data (expires in " + Math.round((CACHE_EXPIRY_MS - (now - cachedData.timestamp)) / 1e3) + " seconds)");
        const { useConfigStore: useConfigStore2 } = await Promise.resolve().then(() => configStore$1);
        if (cachedData.campaign.payment_env_key) {
          useConfigStore2.getState().setSpreedlyEnvironmentKey(cachedData.campaign.payment_env_key);
        }
        set({
          data: cachedData.campaign,
          packages: cachedData.campaign.packages,
          isLoading: false,
          error: null
        });
        return;
      }
      logger$1.info("🌐 Fetching fresh campaign data from API...");
      const { ApiClient: ApiClient2 } = await Promise.resolve().then(() => client);
      const client$1 = new ApiClient2(apiKey);
      const campaign = await client$1.getCampaigns();
      if (!campaign) {
        throw new Error("Campaign data not found");
      }
      const { useConfigStore } = await Promise.resolve().then(() => configStore$1);
      if (campaign.payment_env_key) {
        useConfigStore.getState().setSpreedlyEnvironmentKey(campaign.payment_env_key);
        logger$1.info("💳 Spreedly environment key updated from campaign API: " + campaign.payment_env_key);
      }
      const cacheData = {
        campaign,
        timestamp: now,
        apiKey
      };
      sessionStorageManager.set(CAMPAIGN_STORAGE_KEY, cacheData);
      logger$1.info("💾 Campaign data cached for 5 minutes");
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
    logger$1.info("🗑️ Campaign cache cleared");
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
const logger = createLogger("OrderStore");
const initialState$2 = {
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
        ...initialState$2,
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
          set(initialState$2);
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
const initialState$1 = {
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
  // Error monitoring removed - add externally via HTML/scripts
};
const configStore = create((set, _get) => ({
  ...initialState$1,
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
    set(initialState$1);
  }
}));
const configStore$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  configStore,
  useConfigStore: configStore
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
    const headers = {
      "Authorization": this.apiKey,
      "Content-Type": "application/json",
      ...options?.headers
    };
    this.logger.debug(`API Request: ${method} ${url}`);
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const message = `Rate limited. Retry after ${retryAfter} seconds`;
        this.logger.warn(message);
        throw new Error(message);
      }
      if (!response.ok) {
        const errorMessage = `API Error: ${response.status} ${response.statusText}`;
        let errorData = {};
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch (parseError) {
          this.logger.warn("Failed to parse error response body");
        }
        this.logger.error(errorMessage, errorData);
        const error = new Error(errorMessage);
        error.status = response.status;
        error.statusText = response.statusText;
        error.responseData = errorData;
        throw error;
      }
      const data = await response.json();
      this.logger.debug(`API Response: ${response.status}`, data);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error("API request failed:", error.message);
      } else {
        this.logger.error("API request failed:", String(error));
      }
      throw error;
    }
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
        const { nextAnalytics } = await import("./index-CcJHaemV.js");
        nextAnalytics.trackViewItemList(packageIds, listName);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackViewItem(packageId) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-CcJHaemV.js");
        nextAnalytics.trackViewItem(packageId);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackAddToCart(packageId, quantity) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-CcJHaemV.js");
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
        const { nextAnalytics, EcommerceEvents } = await import("./index-CcJHaemV.js");
        nextAnalytics.track(EcommerceEvents.createRemoveFromCartEvent({ packageId, quantity: quantity || 1 }));
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackBeginCheckout() {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-CcJHaemV.js");
        nextAnalytics.trackBeginCheckout();
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackPurchase(orderData) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-CcJHaemV.js");
        nextAnalytics.trackPurchase(orderData);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackCustomEvent(eventName, data) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-CcJHaemV.js");
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
        const { nextAnalytics } = await import("./index-CcJHaemV.js");
        nextAnalytics.trackSignUp(email);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackLogin(email) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-CcJHaemV.js");
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
        const { nextAnalytics } = await import("./index-CcJHaemV.js");
        nextAnalytics.setDebugMode(enabled);
      } catch (error) {
        this.logger.debug("Analytics debug mode failed (non-critical):", error);
      }
    });
  }
  async invalidateAnalyticsContext() {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./index-CcJHaemV.js");
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
        const { ExitIntentEnhancer } = await import("./SimpleExitIntentEnhancer-Kgb8YcWw.js");
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
        const { FomoPopupEnhancer } = await import("./FomoPopupEnhancer-By2IMVpd.js");
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
  // Upsell methods
  async addUpsell(options) {
    const orderStore = useOrderStore.getState();
    const configStore$12 = configStore.getState();
    if (!orderStore.order) {
      throw new Error("No order found. Upsells can only be added after order completion.");
    }
    if (!orderStore.canAddUpsells()) {
      throw new Error("Order does not support post-purchase upsells or is currently processing.");
    }
    const apiClient = new ApiClient(configStore$12.apiKey);
    let lines = [];
    if (options.items && options.items.length > 0) {
      lines = options.items.map((item) => ({
        package_id: item.packageId,
        quantity: item.quantity || 1
      }));
    } else if (options.packageId) {
      lines = [{
        package_id: options.packageId,
        quantity: options.quantity || 1
      }];
    } else {
      throw new Error("Either packageId or items array must be provided");
    }
    const upsellData = { lines };
    this.logger.info("Adding upsell(s) via SDK:", upsellData);
    try {
      const previousLineIds = orderStore.order?.lines?.map((line) => line.id) || [];
      const updatedOrder = await orderStore.addUpsell(upsellData, apiClient);
      if (!updatedOrder) {
        throw new Error("Failed to add upsell - no updated order returned");
      }
      const addedLines = updatedOrder.lines?.filter(
        (line) => line.is_upsell && !previousLineIds.includes(line.id)
      ) || [];
      const totalUpsellValue = addedLines.reduce((sum, line) => {
        return sum + (line.price_incl_tax ? parseFloat(line.price_incl_tax) : 0);
      }, 0);
      lines.forEach((line, index) => {
        const addedLine = addedLines[index];
        const value = addedLine?.price_incl_tax ? parseFloat(addedLine.price_incl_tax) : 0;
        this.eventBus.emit("upsell:added", {
          packageId: line.package_id,
          quantity: line.quantity,
          order: updatedOrder,
          value
        });
      });
      return {
        order: updatedOrder,
        addedLines,
        totalValue: totalUpsellValue
      };
    } catch (error) {
      this.logger.error("Failed to add upsell(s) via SDK:", error);
      throw error;
    }
  }
  canAddUpsells() {
    const orderStore = useOrderStore.getState();
    return orderStore.canAddUpsells();
  }
  getCompletedUpsells() {
    const orderStore = useOrderStore.getState();
    return orderStore.completedUpsells;
  }
  isUpsellAlreadyAdded(packageId) {
    const orderStore = useOrderStore.getState();
    if (orderStore.completedUpsells.includes(packageId.toString())) {
      return true;
    }
    const acceptedInJourney = orderStore.upsellJourney.some(
      (entry) => entry.packageId === packageId.toString() && entry.action === "accepted"
    );
    return acceptedInJourney;
  }
}
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
          const { AttributionCollector } = await import("./AttributionCollector-BvkCtsE0.js");
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
    if (element.hasAttribute("data-next-component") && element.getAttribute("data-next-component") === "scroll-hint") {
      types.push("scroll-hint");
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
        '[data-next-express-checkout="container"]',
        '[data-next-component="scroll-hint"]'
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
            const { CartDisplayEnhancer } = await import("./CartDisplayEnhancer-BEq49aNQ.js");
            return new CartDisplayEnhancer(element);
          } else if (parsed.object === "selection") {
            this.logger.debug("Using SelectionDisplayEnhancer");
            const { SelectionDisplayEnhancer } = await import("./SelectionDisplayEnhancer-DA-IxSyV.js");
            return new SelectionDisplayEnhancer(element);
          } else if (parsed.object === "package" || parsed.object === "campaign") {
            this.logger.debug("Using ProductDisplayEnhancer");
            const { ProductDisplayEnhancer } = await import("./ProductDisplayEnhancer-DomyhbQ1.js");
            return new ProductDisplayEnhancer(element);
          } else if (parsed.object === "order") {
            this.logger.debug("Using OrderDisplayEnhancer");
            const { OrderDisplayEnhancer } = await import("./OrderDisplayEnhancer-Bn8fEucQ.js");
            return new OrderDisplayEnhancer(element);
          } else if (parsed.object === "shipping") {
            this.logger.debug("Using ShippingDisplayEnhancer");
            const { ShippingDisplayEnhancer } = await import("./ShippingDisplayEnhancer-D9GkcM9e.js");
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
              const { ProductDisplayEnhancer } = await import("./ProductDisplayEnhancer-DomyhbQ1.js");
              return new ProductDisplayEnhancer(element);
            } else {
              this.logger.debug(`Using CartDisplayEnhancer (fallback without package context)`);
              const { CartDisplayEnhancer } = await import("./CartDisplayEnhancer-BEq49aNQ.js");
              return new CartDisplayEnhancer(element);
            }
          }
        case "toggle":
          const { CartToggleEnhancer } = await import("./CartToggleEnhancer-Dey2QI9A.js");
          return new CartToggleEnhancer(element);
        case "action":
          const action = element.getAttribute("data-next-action");
          switch (action) {
            case "add-to-cart":
              const { AddToCartEnhancer } = await import("./AddToCartEnhancer-CABF_pva.js");
              return new AddToCartEnhancer(element);
            case "accept-upsell":
              const { AcceptUpsellEnhancer } = await import("./AcceptUpsellEnhancer-CFMeKSVc.js");
              return new AcceptUpsellEnhancer(element);
            default:
              this.logger.warn(`Unknown action type: ${action}`);
              return null;
          }
        case "selector":
          const { PackageSelectorEnhancer } = await import("./PackageSelectorEnhancer-t337IJZU.js");
          return new PackageSelectorEnhancer(element);
        case "timer":
          const { TimerEnhancer } = await import("./TimerEnhancer-CjGmCGjM.js");
          return new TimerEnhancer(element);
        case "conditional":
          const { ConditionalDisplayEnhancer } = await import("./ConditionalDisplayEnhancer-D5JWvGfe.js");
          return new ConditionalDisplayEnhancer(element);
        case "checkout":
          const { CheckoutFormEnhancer } = await import("./CheckoutFormEnhancer-6uYgNsyy.js");
          return new CheckoutFormEnhancer(element);
        case "express-checkout":
          this.logger.debug("Skipping individual express checkout button - managed by container");
          return null;
        case "express-checkout-container":
          const { ExpressCheckoutContainerEnhancer } = await import("./ExpressCheckoutContainerEnhancer-Dtr5I1FG.js");
          return new ExpressCheckoutContainerEnhancer(element);
        // REMOVED: form-validator, payment, address, phone, validation enhancers
        // These are now handled by the main CheckoutFormEnhancer (simplified approach)
        case "cart-items":
          const { CartItemListEnhancer } = await import("./CartItemListEnhancer-DrWY0TSS.js");
          return new CartItemListEnhancer(element);
        case "order-items":
          const { OrderItemListEnhancer } = await import("./OrderItemListEnhancer-8mcmrXZy.js");
          return new OrderItemListEnhancer(element);
        case "quantity":
          const { QuantityControlEnhancer } = await import("./QuantityControlEnhancer-DUWY44j1.js");
          return new QuantityControlEnhancer(element);
        case "remove-item":
          const { RemoveItemEnhancer } = await import("./RemoveItemEnhancer-cVLnLFX9.js");
          return new RemoveItemEnhancer(element);
        // 'order' case removed - order display now handled via data-next-display="order.xxx" pattern
        case "upsell":
          const { UpsellEnhancer } = await import("./UpsellEnhancer-DyMqgUS_.js");
          return new UpsellEnhancer(element);
        case "coupon":
          const { CouponEnhancer } = await import("./CouponEnhancer-CHWDb-wh.js");
          return new CouponEnhancer(element);
        case "accordion":
          const { AccordionEnhancer } = await import("./AccordionEnhancer-ZSazmF6Q.js");
          return new AccordionEnhancer(element);
        case "tooltip":
          const { TooltipEnhancer } = await import("./TooltipEnhancer-yrvS3A8_.js");
          return new TooltipEnhancer(element);
        case "scroll-hint":
          const { ScrollHintEnhancer } = await import("./ScrollHintEnhancer-Ccp9O9xM.js");
          return new ScrollHintEnhancer(element);
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
const _SDKInitializer = class _SDKInitializer {
  static async initialize() {
    if (this.initialized) {
      this.logger.warn("SDK already initialized");
      return;
    }
    try {
      this.logger.info("Initializing 29Next Campaign Cart SDK v2...");
      await this.waitForDOM();
      await this.loadConfiguration();
      await this.initializeAttribution();
      await this.loadCampaignData();
      await this.initializeAnalytics();
      this.initializeErrorHandler();
      await this.checkAndLoadOrder();
      await this.scanAndEnhanceDOM();
      this.setupReadyCallbacks();
      await this.initializeDebugMode();
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
        const { UtmTransfer } = await import("./UtmTransfer-BLC_E-40.js");
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
        this.logger.info("Initializing analytics v2 (lazy)...");
        const { nextAnalytics } = await import("./index-CcJHaemV.js");
        await nextAnalytics.initialize();
        this.logger.debug("Analytics v2 initialized successfully (lazy)");
      } catch (error) {
        this.logger.warn("Analytics v2 initialization failed (non-critical):", error);
      }
    }, 0);
  }
  static initializeErrorHandler() {
    try {
      import("./errorHandler-DfEdndmH.js").then(({ errorHandler }) => {
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
  static async initializeDebugMode() {
    const configStore$12 = configStore.getState();
    if (configStore$12.debug) {
      this.logger.info("Debug mode enabled - initializing debug utilities");
      Logger.setLogLevel(LogLevel.DEBUG);
      this.logger.info("Logger level set to DEBUG");
      const { debugOverlay } = await import("./DebugOverlay-BXyjBRYo.js");
      debugOverlay.initialize();
      this.setupGlobalDebugUtils();
      this.logger.info("Debug utilities initialized ✅");
    }
  }
  static setupGlobalDebugUtils() {
    if (typeof window !== "undefined") {
      window.nextDebug = {
        overlay: () => import("./DebugOverlay-BXyjBRYo.js").then((m) => m.debugOverlay),
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
            const { nextAnalytics } = await import("./index-CcJHaemV.js");
            return nextAnalytics.getStatus();
          },
          getProviders: async () => {
            const { nextAnalytics } = await import("./index-CcJHaemV.js");
            return nextAnalytics.getStatus().providers;
          },
          track: async (name, data) => {
            const { nextAnalytics } = await import("./index-CcJHaemV.js");
            return nextAnalytics.track({ event: name, ...data });
          },
          setDebugMode: async (enabled) => {
            const { nextAnalytics } = await import("./index-CcJHaemV.js");
            return nextAnalytics.setDebugMode(enabled);
          },
          invalidateContext: async () => {
            const { nextAnalytics } = await import("./index-CcJHaemV.js");
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
          this.logger.debug(`🎯 Highlighting element: ${selector}`);
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
 * 29Next Campaign Cart SDK v2
 * 
 * Modern TypeScript SDK for seamless e-commerce integration via data attributes.
 * Provides progressive enhancement without disrupting existing HTML/CSS.
 * 
 * @version 0.2.0
 * @author NextCommerce
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
        import("./CartDisplayEnhancer-BEq49aNQ.js");
        import("./CartToggleEnhancer-Dey2QI9A.js");
        import("./PackageSelectorEnhancer-t337IJZU.js");
        import("./ProductDisplayEnhancer-DomyhbQ1.js");
        import("./SelectionDisplayEnhancer-DA-IxSyV.js");
        import("./TimerEnhancer-CjGmCGjM.js");
      }, { timeout: 5e3 });
      requestIdleCallback(() => {
        import("./CheckoutFormEnhancer-6uYgNsyy.js");
        import("./ExpressCheckoutContainerEnhancer-Dtr5I1FG.js");
        import("./OrderDisplayEnhancer-Bn8fEucQ.js");
        import("./UpsellEnhancer-DyMqgUS_.js");
        import("./AttributionCollector-BvkCtsE0.js");
        import("./CartItemListEnhancer-DrWY0TSS.js");
        import("./QuantityControlEnhancer-DUWY44j1.js");
      }, { timeout: 5e3 });
      requestIdleCallback(() => {
        import("./AccordionEnhancer-ZSazmF6Q.js");
        import("./CouponEnhancer-CHWDb-wh.js");
        import("./SimpleExitIntentEnhancer-Kgb8YcWw.js");
      }, { timeout: 5e3 });
    } else {
      setTimeout(() => {
        import("./CartDisplayEnhancer-BEq49aNQ.js");
        import("./ProductDisplayEnhancer-DomyhbQ1.js");
        import("./analytics-PoivRRJ8.js");
      }, 1e3);
    }
  });
}
export {
  AttributeParser as A,
  EventBus as E,
  Logger as L,
  NextCommerce as N,
  SDKInitializer as S,
  VERSION as V,
  useCampaignStore as a,
  useCheckoutStore as b,
  createLogger as c,
  configStore as d,
  ApiClient as e,
  useAttributionStore as f,
  useOrderStore as g,
  useCartStore as u
};
