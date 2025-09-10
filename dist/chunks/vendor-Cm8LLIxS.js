var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
  const getInitialState = () => initialState;
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
  const initialState = state = createState(setState, getState, api);
  return api;
};
const createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;
function getDefaultExportFromCjs(x2) {
  return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
}
var react = { exports: {} };
var react_production = {};
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
  function ReactElement(type, key, self2, source, owner, props) {
    self2 = props.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== self2 ? self2 : null,
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
  function escape2(key) {
    var escaperLookup = { "=": "=0", ":": "=2" };
    return "$" + key.replace(/[=:]/g, function(match) {
      return escaperLookup[match];
    });
  }
  var userProvidedKeyEscapeRegex = /\/+/g;
  function getElementKey(element, index2) {
    return "object" === typeof element && null !== element && null != element.key ? escape2("" + element.key) : index2.toString(36);
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
      return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c2) {
        return c2;
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
      for (var i2 = 0; i2 < children.length; i2++)
        nameSoFar = children[i2], type = nextNamePrefix + getElementKey(nameSoFar, i2), invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        );
    else if (i2 = getIteratorFn(children), "function" === typeof i2)
      for (children = i2.call(children), i2 = 0; !(nameSoFar = children.next()).done; )
        nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i2++), invokeCallback += mapIntoArray(
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
  function noop2() {
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
      var n2 = 0;
      mapChildren(children, function() {
        n2++;
      });
      return n2;
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
  react_production.cloneElement = function(element, config2, children) {
    if (null === element || void 0 === element)
      throw Error(
        "The argument must be a React element, but you passed " + element + "."
      );
    var props = assign({}, element.props), key = element.key, owner = void 0;
    if (null != config2)
      for (propName in void 0 !== config2.ref && (owner = void 0), void 0 !== config2.key && (key = "" + config2.key), config2)
        !hasOwnProperty.call(config2, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config2.ref || (props[propName] = config2[propName]);
    var propName = arguments.length - 2;
    if (1 === propName) props.children = children;
    else if (1 < propName) {
      for (var childArray = Array(propName), i2 = 0; i2 < propName; i2++)
        childArray[i2] = arguments[i2 + 2];
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
  react_production.createElement = function(type, config2, children) {
    var propName, props = {}, key = null;
    if (null != config2)
      for (propName in void 0 !== config2.key && (key = "" + config2.key), config2)
        hasOwnProperty.call(config2, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config2[propName]);
    var childrenLength = arguments.length - 2;
    if (1 === childrenLength) props.children = children;
    else if (1 < childrenLength) {
      for (var childArray = Array(childrenLength), i2 = 0; i2 < childrenLength; i2++)
        childArray[i2] = arguments[i2 + 2];
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
      "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop2, reportGlobalError);
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
  react_production.useActionState = function(action, initialState, permalink) {
    return ReactSharedInternals.H.useActionState(action, initialState, permalink);
  };
  react_production.useCallback = function(callback, deps) {
    return ReactSharedInternals.H.useCallback(callback, deps);
  };
  react_production.useContext = function(Context2) {
    return ReactSharedInternals.H.useContext(Context2);
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
  react_production.useReducer = function(reducer, initialArg, init2) {
    return ReactSharedInternals.H.useReducer(reducer, initialArg, init2);
  };
  react_production.useRef = function(initialValue) {
    return ReactSharedInternals.H.useRef(initialValue);
  };
  react_production.useState = function(initialState) {
    return ReactSharedInternals.H.useState(initialState);
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
    react.exports = /* @__PURE__ */ requireReact_production();
  }
  return react.exports;
}
var reactExports = /* @__PURE__ */ requireReact();
const ReactExports = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);
var withSelector = { exports: {} };
var withSelector_production = {};
var shim = { exports: {} };
var useSyncExternalStoreShim_production = {};
var hasRequiredUseSyncExternalStoreShim_production;
function requireUseSyncExternalStoreShim_production() {
  if (hasRequiredUseSyncExternalStoreShim_production) return useSyncExternalStoreShim_production;
  hasRequiredUseSyncExternalStoreShim_production = 1;
  var React = /* @__PURE__ */ requireReact();
  function is(x2, y2) {
    return x2 === y2 && (0 !== x2 || 1 / x2 === 1 / y2) || x2 !== x2 && y2 !== y2;
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
    shim.exports = /* @__PURE__ */ requireUseSyncExternalStoreShim_production();
  }
  return shim.exports;
}
var hasRequiredWithSelector_production;
function requireWithSelector_production() {
  if (hasRequiredWithSelector_production) return withSelector_production;
  hasRequiredWithSelector_production = 1;
  var React = /* @__PURE__ */ requireReact(), shim2 = /* @__PURE__ */ requireShim();
  function is(x2, y2) {
    return x2 === y2 && (0 !== x2 || 1 / x2 === 1 / y2) || x2 !== x2 && y2 !== y2;
  }
  var objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = shim2.useSyncExternalStore, useRef = React.useRef, useEffect = React.useEffect, useMemo = React.useMemo, useDebugValue2 = React.useDebugValue;
  withSelector_production.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual2) {
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
            if (void 0 !== isEqual2 && inst.hasValue) {
              var currentSelection = inst.value;
              if (isEqual2(currentSelection, nextSnapshot))
                return memoizedSelection = currentSelection;
            }
            return memoizedSelection = nextSnapshot;
          }
          currentSelection = memoizedSelection;
          if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
          var nextSelection = selector(nextSnapshot);
          if (void 0 !== isEqual2 && isEqual2(currentSelection, nextSelection))
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
      [getSnapshot, getServerSnapshot, selector, isEqual2]
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
    withSelector.exports = /* @__PURE__ */ requireWithSelector_production();
  }
  return withSelector.exports;
}
var withSelectorExports = /* @__PURE__ */ requireWithSelector();
const useSyncExternalStoreExports = /* @__PURE__ */ getDefaultExportFromCjs(withSelectorExports);
const __vite_import_meta_env__$1 = {};
const { useDebugValue } = ReactExports;
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;
let didWarnAboutEqualityFn = false;
const identity$1 = (arg) => arg;
function useStore(api, selector = identity$1, equalityFn) {
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
const __vite_import_meta_env__ = {};
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
    const r2 = set(state, replace);
    if (!isRecording) return r2;
    const action = nameOrAction === void 0 ? { type: anonymousActionType || "anonymous" } : typeof nameOrAction === "string" ? { type: nameOrAction } : nameOrAction;
    if (store === void 0) {
      connection == null ? void 0 : connection.send(action, get());
      return r2;
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
    return r2;
  };
  const setStateFromDevtools = (...a2) => {
    const originalIsRecording = isRecording;
    isRecording = false;
    set(...a2);
    isRecording = originalIsRecording;
  };
  const initialState = fn(api.setState, get, api);
  if (connectionInformation.type === "untracked") {
    connection == null ? void 0 : connection.init(initialState);
  } else {
    connectionInformation.stores[connectionInformation.store] = api;
    connection == null ? void 0 : connection.init(
      Object.fromEntries(
        Object.entries(connectionInformation.stores).map(([key, store2]) => [
          key,
          key === connectionInformation.store ? initialState : store2.getState()
        ])
      )
    );
  }
  if (api.dispatchFromDevtools && typeof api.dispatch === "function") {
    let didWarnAboutReservedActionType = false;
    const originalDispatch = api.dispatch;
    api.dispatch = (...a2) => {
      if ((__vite_import_meta_env__ ? "production" : void 0) !== "production" && a2[0].type === "__setState" && !didWarnAboutReservedActionType) {
        console.warn(
          '[zustand devtools middleware] "__setState" action type is reserved to set state from the devtools. Avoid using it.'
        );
        didWarnAboutReservedActionType = true;
      }
      originalDispatch(...a2);
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
            setStateFromDevtools(initialState);
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
  return initialState;
};
const devtools = devtoolsImpl;
const parseJsonThen = (stringified, f2) => {
  let parsed;
  try {
    parsed = JSON.parse(stringified);
  } catch (e2) {
    console.error(
      "[zustand devtools middleware] Could not parse the received json",
      e2
    );
  }
  if (parsed !== void 0) f2(parsed);
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
  const initialState = fn(set, get, api);
  return initialState;
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
  } catch (e2) {
    return {
      then(_onFulfilled) {
        return this;
      },
      catch(onRejected) {
        return toThenable(onRejected)(e2);
      }
    };
  }
};
const oldImpl = (config2, baseOptions) => (set, get, api) => {
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
    return config2(
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
    ).catch((e2) => {
      errorInSync = e2;
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
  const configResult = config2(
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
    }).catch((e2) => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e2);
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
const newImpl = (config2, baseOptions) => (set, get, api) => {
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
    return config2(
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
  const configResult = config2(
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
    }).catch((e2) => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e2);
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
const persistImpl = (config2, baseOptions) => {
  if ("getStorage" in baseOptions || "serialize" in baseOptions || "deserialize" in baseOptions) {
    if ((__vite_import_meta_env__ ? "production" : void 0) !== "production") {
      console.warn(
        "[DEPRECATED] `getStorage`, `serialize` and `deserialize` options are deprecated. Use `storage` option instead."
      );
    }
    return oldImpl(config2, baseOptions);
  }
  return newImpl(config2, baseOptions);
};
const persist = persistImpl;
var extendStatics = function(d2, b2) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d22, b22) {
    d22.__proto__ = b22;
  } || function(d22, b22) {
    for (var p2 in b22) if (Object.prototype.hasOwnProperty.call(b22, p2)) d22[p2] = b22[p2];
  };
  return extendStatics(d2, b2);
};
function __extends(d2, b2) {
  if (typeof b2 !== "function" && b2 !== null)
    throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
  extendStatics(d2, b2);
  function __() {
    this.constructor = d2;
  }
  d2.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
}
var __assign$1 = function() {
  __assign$1 = Object.assign || function __assign2(t2) {
    for (var s2, i2 = 1, n2 = arguments.length; i2 < n2; i2++) {
      s2 = arguments[i2];
      for (var p2 in s2) if (Object.prototype.hasOwnProperty.call(s2, p2)) t2[p2] = s2[p2];
    }
    return t2;
  };
  return __assign$1.apply(this, arguments);
};
function __rest(s2, e2) {
  var t2 = {};
  for (var p2 in s2) if (Object.prototype.hasOwnProperty.call(s2, p2) && e2.indexOf(p2) < 0)
    t2[p2] = s2[p2];
  if (s2 != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i2 = 0, p2 = Object.getOwnPropertySymbols(s2); i2 < p2.length; i2++) {
      if (e2.indexOf(p2[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s2, p2[i2]))
        t2[p2[i2]] = s2[p2[i2]];
    }
  return t2;
}
function __awaiter(thisArg, _arguments, P2, generator) {
  function adopt(value) {
    return value instanceof P2 ? value : new P2(function(resolve) {
      resolve(value);
    });
  }
  return new (P2 || (P2 = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e2) {
        reject(e2);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e2) {
        reject(e2);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _2 = { label: 0, sent: function() {
    if (t2[0] & 1) throw t2[1];
    return t2[1];
  }, trys: [], ops: [] }, f2, y2, t2, g2 = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g2.next = verb(0), g2["throw"] = verb(1), g2["return"] = verb(2), typeof Symbol === "function" && (g2[Symbol.iterator] = function() {
    return this;
  }), g2;
  function verb(n2) {
    return function(v2) {
      return step([n2, v2]);
    };
  }
  function step(op) {
    if (f2) throw new TypeError("Generator is already executing.");
    while (g2 && (g2 = 0, op[0] && (_2 = 0)), _2) try {
      if (f2 = 1, y2 && (t2 = op[0] & 2 ? y2["return"] : op[0] ? y2["throw"] || ((t2 = y2["return"]) && t2.call(y2), 0) : y2.next) && !(t2 = t2.call(y2, op[1])).done) return t2;
      if (y2 = 0, t2) op = [op[0] & 2, t2.value];
      switch (op[0]) {
        case 0:
        case 1:
          t2 = op;
          break;
        case 4:
          _2.label++;
          return { value: op[1], done: false };
        case 5:
          _2.label++;
          y2 = op[1];
          op = [0];
          continue;
        case 7:
          op = _2.ops.pop();
          _2.trys.pop();
          continue;
        default:
          if (!(t2 = _2.trys, t2 = t2.length > 0 && t2[t2.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _2 = 0;
            continue;
          }
          if (op[0] === 3 && (!t2 || op[1] > t2[0] && op[1] < t2[3])) {
            _2.label = op[1];
            break;
          }
          if (op[0] === 6 && _2.label < t2[1]) {
            _2.label = t2[1];
            t2 = op;
            break;
          }
          if (t2 && _2.label < t2[2]) {
            _2.label = t2[2];
            _2.ops.push(op);
            break;
          }
          if (t2[2]) _2.ops.pop();
          _2.trys.pop();
          continue;
      }
      op = body.call(thisArg, _2);
    } catch (e2) {
      op = [6, e2];
      y2 = 0;
    } finally {
      f2 = t2 = 0;
    }
    if (op[0] & 5) throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}
function __values$1(o2) {
  var s2 = typeof Symbol === "function" && Symbol.iterator, m2 = s2 && o2[s2], i2 = 0;
  if (m2) return m2.call(o2);
  if (o2 && typeof o2.length === "number") return {
    next: function() {
      if (o2 && i2 >= o2.length) o2 = void 0;
      return { value: o2 && o2[i2++], done: !o2 };
    }
  };
  throw new TypeError(s2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read$1(o2, n2) {
  var m2 = typeof Symbol === "function" && o2[Symbol.iterator];
  if (!m2) return o2;
  var i2 = m2.call(o2), r2, ar = [], e2;
  try {
    while ((n2 === void 0 || n2-- > 0) && !(r2 = i2.next()).done) ar.push(r2.value);
  } catch (error) {
    e2 = { error };
  } finally {
    try {
      if (r2 && !r2.done && (m2 = i2["return"])) m2.call(i2);
    } finally {
      if (e2) throw e2.error;
    }
  }
  return ar;
}
function __spreadArray(to, from2, pack) {
  if (pack || arguments.length === 2) for (var i2 = 0, l2 = from2.length, ar; i2 < l2; i2++) {
    if (ar || !(i2 in from2)) {
      if (!ar) ar = Array.prototype.slice.call(from2, 0, i2);
      ar[i2] = from2[i2];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from2));
}
function __await(v2) {
  return this instanceof __await ? (this.v = v2, this) : new __await(v2);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g2 = generator.apply(thisArg, _arguments || []), i2, q2 = [];
  return i2 = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i2[Symbol.asyncIterator] = function() {
    return this;
  }, i2;
  function awaitReturn(f2) {
    return function(v2) {
      return Promise.resolve(v2).then(f2, reject);
    };
  }
  function verb(n2, f2) {
    if (g2[n2]) {
      i2[n2] = function(v2) {
        return new Promise(function(a2, b2) {
          q2.push([n2, v2, a2, b2]) > 1 || resume(n2, v2);
        });
      };
      if (f2) i2[n2] = f2(i2[n2]);
    }
  }
  function resume(n2, v2) {
    try {
      step(g2[n2](v2));
    } catch (e2) {
      settle(q2[0][3], e2);
    }
  }
  function step(r2) {
    r2.value instanceof __await ? Promise.resolve(r2.value.v).then(fulfill, reject) : settle(q2[0][2], r2);
  }
  function fulfill(value) {
    resume("next", value);
  }
  function reject(value) {
    resume("throw", value);
  }
  function settle(f2, v2) {
    if (f2(v2), q2.shift(), q2.length) resume(q2[0][0], q2[0][1]);
  }
}
function __asyncValues(o2) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m2 = o2[Symbol.asyncIterator], i2;
  return m2 ? m2.call(o2) : (o2 = typeof __values$1 === "function" ? __values$1(o2) : o2[Symbol.iterator](), i2 = {}, verb("next"), verb("throw"), verb("return"), i2[Symbol.asyncIterator] = function() {
    return this;
  }, i2);
  function verb(n2) {
    i2[n2] = o2[n2] && function(v2) {
      return new Promise(function(resolve, reject) {
        v2 = o2[n2](v2), settle(resolve, reject, v2.done, v2.value);
      });
    };
  }
  function settle(resolve, reject, d2, v2) {
    Promise.resolve(v2).then(function(v22) {
      resolve({ value: v22, done: d2 });
    }, reject);
  }
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e2 = new Error(message);
  return e2.name = "SuppressedError", e2.error = error, e2.suppressed = suppressed, e2;
};
var IdentifyOperation$2;
(function(IdentifyOperation2) {
  IdentifyOperation2["SET"] = "$set";
  IdentifyOperation2["SET_ONCE"] = "$setOnce";
  IdentifyOperation2["ADD"] = "$add";
  IdentifyOperation2["APPEND"] = "$append";
  IdentifyOperation2["PREPEND"] = "$prepend";
  IdentifyOperation2["REMOVE"] = "$remove";
  IdentifyOperation2["PREINSERT"] = "$preInsert";
  IdentifyOperation2["POSTINSERT"] = "$postInsert";
  IdentifyOperation2["UNSET"] = "$unset";
  IdentifyOperation2["CLEAR_ALL"] = "$clearAll";
})(IdentifyOperation$2 || (IdentifyOperation$2 = {}));
var SpecialEventType$1;
(function(SpecialEventType2) {
  SpecialEventType2["IDENTIFY"] = "$identify";
  SpecialEventType2["GROUP_IDENTIFY"] = "$groupidentify";
  SpecialEventType2["REVENUE"] = "revenue_amount";
})(SpecialEventType$1 || (SpecialEventType$1 = {}));
var UNSET_VALUE = "-";
var AMPLITUDE_PREFIX = "AMP";
var STORAGE_PREFIX = "".concat(AMPLITUDE_PREFIX, "_unsent");
var DEFAULT_INSTANCE_NAME = "$default_instance";
var AMPLITUDE_SERVER_URL = "https://api2.amplitude.com/2/httpapi";
var EU_AMPLITUDE_SERVER_URL = "https://api.eu.amplitude.com/2/httpapi";
var AMPLITUDE_BATCH_SERVER_URL = "https://api2.amplitude.com/batch";
var EU_AMPLITUDE_BATCH_SERVER_URL = "https://api.eu.amplitude.com/batch";
var UTM_CAMPAIGN$1 = "utm_campaign";
var UTM_CONTENT$1 = "utm_content";
var UTM_ID$1 = "utm_id";
var UTM_MEDIUM$1 = "utm_medium";
var UTM_SOURCE$1 = "utm_source";
var UTM_TERM$1 = "utm_term";
var DCLID$1 = "dclid";
var FBCLID$1 = "fbclid";
var GBRAID$1 = "gbraid";
var GCLID$1 = "gclid";
var KO_CLICK_ID$1 = "ko_click_id";
var LI_FAT_ID$1 = "li_fat_id";
var MSCLKID$1 = "msclkid";
var RDT_CID$1 = "rdt_cid";
var TTCLID$1 = "ttclid";
var TWCLID$1 = "twclid";
var WBRAID$1 = "wbraid";
var BASE_CAMPAIGN$1 = {
  utm_campaign: void 0,
  utm_content: void 0,
  utm_id: void 0,
  utm_medium: void 0,
  utm_source: void 0,
  utm_term: void 0,
  referrer: void 0,
  referring_domain: void 0,
  dclid: void 0,
  gbraid: void 0,
  gclid: void 0,
  fbclid: void 0,
  ko_click_id: void 0,
  li_fat_id: void 0,
  msclkid: void 0,
  rdt_cid: void 0,
  ttclid: void 0,
  twclid: void 0,
  wbraid: void 0
};
var SAFE_HEADERS = [
  "access-control-allow-origin",
  "access-control-allow-credentials",
  "access-control-expose-headers",
  "access-control-max-age",
  "access-control-allow-methods",
  "access-control-allow-headers",
  "accept-patch",
  "accept-ranges",
  "age",
  "allow",
  "alt-svc",
  "cache-control",
  "connection",
  "content-disposition",
  "content-encoding",
  "content-language",
  "content-length",
  "content-location",
  "content-md5",
  "content-range",
  "content-type",
  "date",
  "delta-base",
  "etag",
  "expires",
  "im",
  "last-modified",
  "link",
  "location",
  "permanent",
  "p3p",
  "pragma",
  "proxy-authenticate",
  "public-key-pins",
  "retry-after",
  "server",
  "status",
  "strict-transport-security",
  "trailer",
  "transfer-encoding",
  "tk",
  "upgrade",
  "vary",
  "via",
  "warning",
  "www-authenticate",
  "x-b3-traceid",
  "x-frame-options"
];
var FORBIDDEN_HEADERS = ["authorization", "cookie", "set-cookie"];
var MAX_PROPERTY_KEYS = 1e3;
var isValidObject = function(properties) {
  if (Object.keys(properties).length > MAX_PROPERTY_KEYS) {
    return false;
  }
  for (var key in properties) {
    var value = properties[key];
    if (!isValidProperties(key, value))
      return false;
  }
  return true;
};
var isValidProperties = function(property, value) {
  var e_1, _a;
  if (typeof property !== "string")
    return false;
  if (Array.isArray(value)) {
    var isValid = true;
    try {
      for (var value_1 = __values$1(value), value_1_1 = value_1.next(); !value_1_1.done; value_1_1 = value_1.next()) {
        var valueElement = value_1_1.value;
        if (Array.isArray(valueElement)) {
          return false;
        } else if (typeof valueElement === "object") {
          isValid = isValid && isValidObject(valueElement);
        } else if (!["number", "string"].includes(typeof valueElement)) {
          return false;
        }
        if (!isValid) {
          return false;
        }
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (value_1_1 && !value_1_1.done && (_a = value_1.return)) _a.call(value_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
  } else if (value === null || value === void 0) {
    return false;
  } else if (typeof value === "object") {
    return isValidObject(value);
  } else if (!["number", "string", "boolean"].includes(typeof value)) {
    return false;
  }
  return true;
};
var Identify = (
  /** @class */
  function() {
    function Identify2() {
      this._propertySet = /* @__PURE__ */ new Set();
      this._properties = {};
    }
    Identify2.prototype.getUserProperties = function() {
      return __assign$1({}, this._properties);
    };
    Identify2.prototype.set = function(property, value) {
      this._safeSet(IdentifyOperation$1.SET, property, value);
      return this;
    };
    Identify2.prototype.setOnce = function(property, value) {
      this._safeSet(IdentifyOperation$1.SET_ONCE, property, value);
      return this;
    };
    Identify2.prototype.append = function(property, value) {
      this._safeSet(IdentifyOperation$1.APPEND, property, value);
      return this;
    };
    Identify2.prototype.prepend = function(property, value) {
      this._safeSet(IdentifyOperation$1.PREPEND, property, value);
      return this;
    };
    Identify2.prototype.postInsert = function(property, value) {
      this._safeSet(IdentifyOperation$1.POSTINSERT, property, value);
      return this;
    };
    Identify2.prototype.preInsert = function(property, value) {
      this._safeSet(IdentifyOperation$1.PREINSERT, property, value);
      return this;
    };
    Identify2.prototype.remove = function(property, value) {
      this._safeSet(IdentifyOperation$1.REMOVE, property, value);
      return this;
    };
    Identify2.prototype.add = function(property, value) {
      this._safeSet(IdentifyOperation$1.ADD, property, value);
      return this;
    };
    Identify2.prototype.unset = function(property) {
      this._safeSet(IdentifyOperation$1.UNSET, property, UNSET_VALUE);
      return this;
    };
    Identify2.prototype.clearAll = function() {
      this._properties = {};
      this._properties[IdentifyOperation$1.CLEAR_ALL] = UNSET_VALUE;
      return this;
    };
    Identify2.prototype._safeSet = function(operation, property, value) {
      if (this._validate(operation, property, value)) {
        var userPropertyMap = this._properties[operation];
        if (userPropertyMap === void 0) {
          userPropertyMap = {};
          this._properties[operation] = userPropertyMap;
        }
        userPropertyMap[property] = value;
        this._propertySet.add(property);
        return true;
      }
      return false;
    };
    Identify2.prototype._validate = function(operation, property, value) {
      if (this._properties[IdentifyOperation$1.CLEAR_ALL] !== void 0) {
        return false;
      }
      if (this._propertySet.has(property)) {
        return false;
      }
      if (operation === IdentifyOperation$1.ADD) {
        return typeof value === "number";
      }
      if (operation !== IdentifyOperation$1.UNSET && operation !== IdentifyOperation$1.REMOVE) {
        return isValidProperties(property, value);
      }
      return true;
    };
    return Identify2;
  }()
);
var IdentifyOperation$1;
(function(IdentifyOperation2) {
  IdentifyOperation2["SET"] = "$set";
  IdentifyOperation2["SET_ONCE"] = "$setOnce";
  IdentifyOperation2["ADD"] = "$add";
  IdentifyOperation2["APPEND"] = "$append";
  IdentifyOperation2["PREPEND"] = "$prepend";
  IdentifyOperation2["REMOVE"] = "$remove";
  IdentifyOperation2["PREINSERT"] = "$preInsert";
  IdentifyOperation2["POSTINSERT"] = "$postInsert";
  IdentifyOperation2["UNSET"] = "$unset";
  IdentifyOperation2["CLEAR_ALL"] = "$clearAll";
})(IdentifyOperation$1 || (IdentifyOperation$1 = {}));
var OrderedIdentifyOperations = [
  IdentifyOperation$1.CLEAR_ALL,
  IdentifyOperation$1.UNSET,
  IdentifyOperation$1.SET,
  IdentifyOperation$1.SET_ONCE,
  IdentifyOperation$1.ADD,
  IdentifyOperation$1.APPEND,
  IdentifyOperation$1.PREPEND,
  IdentifyOperation$1.PREINSERT,
  IdentifyOperation$1.POSTINSERT,
  IdentifyOperation$1.REMOVE
];
var SUCCESS_MESSAGE = "Event tracked successfully";
var UNEXPECTED_ERROR_MESSAGE$1 = "Unexpected error occurred";
var MAX_RETRIES_EXCEEDED_MESSAGE$1 = "Event rejected due to exceeded retry count";
var OPT_OUT_MESSAGE = "Event skipped due to optOut config";
var MISSING_API_KEY_MESSAGE = "Event rejected due to missing API key";
var INVALID_API_KEY = "Invalid API key";
var CLIENT_NOT_INITIALIZED = "Client not initialized";
var Status$1;
(function(Status2) {
  Status2["Unknown"] = "unknown";
  Status2["Skipped"] = "skipped";
  Status2["Success"] = "success";
  Status2["RateLimit"] = "rate_limit";
  Status2["PayloadTooLarge"] = "payload_too_large";
  Status2["Invalid"] = "invalid";
  Status2["Failed"] = "failed";
  Status2["Timeout"] = "Timeout";
  Status2["SystemError"] = "SystemError";
})(Status$1 || (Status$1 = {}));
var buildResult = function(event, code, message) {
  if (code === void 0) {
    code = 0;
  }
  if (message === void 0) {
    message = Status$1.Unknown;
  }
  return { event, code, message };
};
var getGlobalScope$1 = function() {
  var ampIntegrationContextName = "ampIntegrationContext";
  if (typeof globalThis !== "undefined" && typeof globalThis[ampIntegrationContextName] !== "undefined") {
    return globalThis[ampIntegrationContextName];
  }
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  return void 0;
};
var legacyUUID = function(a2) {
  return a2 ? (
    // a random number from 0 to 15
    (a2 ^ // unless b is 8,
    Math.random() * // in which case
    16 >> // a random number from
    a2 / 4).toString(16)
  ) : (
    // or otherwise a concatenated string:
    (String(1e7) + // 10000000 +
    String(-1e3) + // -1000 +
    String(-4e3) + // -4000 +
    String(-8e3) + // -80000000 +
    String(-1e11)).replace(
      // replacing
      /[018]/g,
      // zeroes, ones, and eights with
      UUID
    )
  );
};
var hex = __spreadArray([], __read$1(Array(256).keys()), false).map(function(index2) {
  return index2.toString(16).padStart(2, "0");
});
var UUID = function(a2) {
  var _a;
  var globalScope = getGlobalScope$1();
  if (!((_a = globalScope === null || globalScope === void 0 ? void 0 : globalScope.crypto) === null || _a === void 0 ? void 0 : _a.getRandomValues)) {
    return legacyUUID(a2);
  }
  var r2 = globalScope.crypto.getRandomValues(new Uint8Array(16));
  r2[6] = r2[6] & 15 | 64;
  r2[8] = r2[8] & 63 | 128;
  return __spreadArray([], __read$1(r2.entries()), false).map(function(_a2) {
    var _b = __read$1(_a2, 2), index2 = _b[0], int = _b[1];
    return [4, 6, 8, 10].includes(index2) ? "-".concat(hex[int]) : hex[int];
  }).join("");
};
var Timeline = (
  /** @class */
  function() {
    function Timeline2(client2) {
      this.client = client2;
      this.queue = [];
      this.applying = false;
      this.plugins = [];
    }
    Timeline2.prototype.register = function(plugin, config2) {
      var _a, _b;
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_c) {
          switch (_c.label) {
            case 0:
              if (this.plugins.some(function(existingPlugin) {
                return existingPlugin.name === plugin.name;
              })) {
                this.loggerProvider.warn("Plugin with name ".concat(plugin.name, " already exists, skipping registration"));
                return [
                  2
                  /*return*/
                ];
              }
              if (plugin.name === void 0) {
                plugin.name = UUID();
                this.loggerProvider.warn("Plugin name is undefined. \n      Generating a random UUID for plugin name: ".concat(plugin.name, ". \n      Set a name for the plugin to prevent it from being added multiple times."));
              }
              plugin.type = (_a = plugin.type) !== null && _a !== void 0 ? _a : "enrichment";
              return [4, (_b = plugin.setup) === null || _b === void 0 ? void 0 : _b.call(plugin, config2, this.client)];
            case 1:
              _c.sent();
              this.plugins.push(plugin);
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    Timeline2.prototype.deregister = function(pluginName, config2) {
      var _a;
      return __awaiter(this, void 0, void 0, function() {
        var index2, plugin;
        return __generator(this, function(_b) {
          switch (_b.label) {
            case 0:
              index2 = this.plugins.findIndex(function(plugin2) {
                return plugin2.name === pluginName;
              });
              if (index2 === -1) {
                config2.loggerProvider.warn("Plugin with name ".concat(pluginName, " does not exist, skipping deregistration"));
                return [
                  2
                  /*return*/
                ];
              }
              plugin = this.plugins[index2];
              this.plugins.splice(index2, 1);
              return [4, (_a = plugin.teardown) === null || _a === void 0 ? void 0 : _a.call(plugin)];
            case 1:
              _b.sent();
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    Timeline2.prototype.reset = function(client2) {
      this.applying = false;
      var plugins = this.plugins;
      plugins.map(function(plugin) {
        var _a;
        return (_a = plugin.teardown) === null || _a === void 0 ? void 0 : _a.call(plugin);
      });
      this.plugins = [];
      this.client = client2;
    };
    Timeline2.prototype.push = function(event) {
      var _this = this;
      return new Promise(function(resolve) {
        _this.queue.push([event, resolve]);
        _this.scheduleApply(0);
      });
    };
    Timeline2.prototype.scheduleApply = function(timeout2) {
      var _this = this;
      if (this.applying)
        return;
      this.applying = true;
      setTimeout(function() {
        void _this.apply(_this.queue.shift()).then(function() {
          _this.applying = false;
          if (_this.queue.length > 0) {
            _this.scheduleApply(0);
          }
        });
      }, timeout2);
    };
    Timeline2.prototype.apply = function(item) {
      return __awaiter(this, void 0, void 0, function() {
        var _a, event, _b, resolve, before, before_1, before_1_1, plugin, e2, e_1_1, enrichment, enrichment_1, enrichment_1_1, plugin, e2, e_2_1, destination, executeDestinations;
        var e_1, _c, e_2, _d;
        return __generator(this, function(_e) {
          switch (_e.label) {
            case 0:
              if (!item) {
                return [
                  2
                  /*return*/
                ];
              }
              _a = __read$1(item, 1), event = _a[0];
              _b = __read$1(item, 2), resolve = _b[1];
              this.loggerProvider.log("Timeline.apply: Initial event", event);
              before = this.plugins.filter(function(plugin2) {
                return plugin2.type === "before";
              });
              _e.label = 1;
            case 1:
              _e.trys.push([1, 6, 7, 8]);
              before_1 = __values$1(before), before_1_1 = before_1.next();
              _e.label = 2;
            case 2:
              if (!!before_1_1.done) return [3, 5];
              plugin = before_1_1.value;
              if (!plugin.execute) {
                return [3, 4];
              }
              return [4, plugin.execute(__assign$1({}, event))];
            case 3:
              e2 = _e.sent();
              if (e2 === null) {
                this.loggerProvider.log("Timeline.apply: Event filtered out by before plugin '".concat(String(plugin.name), "', event: ").concat(JSON.stringify(event)));
                resolve({ event, code: 0, message: "" });
                return [
                  2
                  /*return*/
                ];
              } else {
                event = e2;
                this.loggerProvider.log("Timeline.apply: Event after before plugin '".concat(String(plugin.name), "', event: ").concat(JSON.stringify(event)));
              }
              _e.label = 4;
            case 4:
              before_1_1 = before_1.next();
              return [3, 2];
            case 5:
              return [3, 8];
            case 6:
              e_1_1 = _e.sent();
              e_1 = { error: e_1_1 };
              return [3, 8];
            case 7:
              try {
                if (before_1_1 && !before_1_1.done && (_c = before_1.return)) _c.call(before_1);
              } finally {
                if (e_1) throw e_1.error;
              }
              return [
                7
                /*endfinally*/
              ];
            case 8:
              enrichment = this.plugins.filter(function(plugin2) {
                return plugin2.type === "enrichment" || plugin2.type === void 0;
              });
              _e.label = 9;
            case 9:
              _e.trys.push([9, 14, 15, 16]);
              enrichment_1 = __values$1(enrichment), enrichment_1_1 = enrichment_1.next();
              _e.label = 10;
            case 10:
              if (!!enrichment_1_1.done) return [3, 13];
              plugin = enrichment_1_1.value;
              if (!plugin.execute) {
                return [3, 12];
              }
              return [4, plugin.execute(__assign$1({}, event))];
            case 11:
              e2 = _e.sent();
              if (e2 === null) {
                this.loggerProvider.log("Timeline.apply: Event filtered out by enrichment plugin '".concat(String(plugin.name), "', event: ").concat(JSON.stringify(event)));
                resolve({ event, code: 0, message: "" });
                return [
                  2
                  /*return*/
                ];
              } else {
                event = e2;
                this.loggerProvider.log("Timeline.apply: Event after enrichment plugin '".concat(String(plugin.name), "', event: ").concat(JSON.stringify(event)));
              }
              _e.label = 12;
            case 12:
              enrichment_1_1 = enrichment_1.next();
              return [3, 10];
            case 13:
              return [3, 16];
            case 14:
              e_2_1 = _e.sent();
              e_2 = { error: e_2_1 };
              return [3, 16];
            case 15:
              try {
                if (enrichment_1_1 && !enrichment_1_1.done && (_d = enrichment_1.return)) _d.call(enrichment_1);
              } finally {
                if (e_2) throw e_2.error;
              }
              return [
                7
                /*endfinally*/
              ];
            case 16:
              destination = this.plugins.filter(function(plugin2) {
                return plugin2.type === "destination";
              });
              this.loggerProvider.log("Timeline.apply: Final event before destinations, event: ".concat(JSON.stringify(event)));
              executeDestinations = destination.map(function(plugin2) {
                var eventClone = __assign$1({}, event);
                return plugin2.execute(eventClone).catch(function(e3) {
                  return buildResult(eventClone, 0, String(e3));
                });
              });
              void Promise.all(executeDestinations).then(function(_a2) {
                var _b2 = __read$1(_a2, 1), result = _b2[0];
                var resolveResult = result || buildResult(event, 100, "Event not tracked, no destination plugins on the instance");
                resolve(resolveResult);
              });
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    Timeline2.prototype.flush = function() {
      return __awaiter(this, void 0, void 0, function() {
        var queue, destination, executeDestinations;
        var _this = this;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              queue = this.queue;
              this.queue = [];
              return [4, Promise.all(queue.map(function(item) {
                return _this.apply(item);
              }))];
            case 1:
              _a.sent();
              destination = this.plugins.filter(function(plugin) {
                return plugin.type === "destination";
              });
              executeDestinations = destination.map(function(plugin) {
                return plugin.flush && plugin.flush();
              });
              return [4, Promise.all(executeDestinations)];
            case 2:
              _a.sent();
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    Timeline2.prototype.onIdentityChanged = function(identity2) {
      this.plugins.forEach(function(plugin) {
        var _a;
        void ((_a = plugin.onIdentityChanged) === null || _a === void 0 ? void 0 : _a.call(plugin, identity2));
      });
    };
    Timeline2.prototype.onSessionIdChanged = function(sessionId) {
      this.plugins.forEach(function(plugin) {
        var _a;
        void ((_a = plugin.onSessionIdChanged) === null || _a === void 0 ? void 0 : _a.call(plugin, sessionId));
      });
    };
    Timeline2.prototype.onOptOutChanged = function(optOut) {
      this.plugins.forEach(function(plugin) {
        var _a;
        void ((_a = plugin.onOptOutChanged) === null || _a === void 0 ? void 0 : _a.call(plugin, optOut));
      });
    };
    return Timeline2;
  }()
);
var createTrackEvent = function(eventInput, eventProperties, eventOptions) {
  var baseEvent = typeof eventInput === "string" ? { event_type: eventInput } : eventInput;
  return __assign$1(__assign$1(__assign$1({}, baseEvent), eventOptions), eventProperties && { event_properties: eventProperties });
};
var createIdentifyEvent = function(identify2, eventOptions) {
  var identifyEvent = __assign$1(__assign$1({}, eventOptions), { event_type: SpecialEventType$1.IDENTIFY, user_properties: identify2.getUserProperties() });
  return identifyEvent;
};
var createGroupIdentifyEvent = function(groupType, groupName, identify2, eventOptions) {
  var _a;
  var groupIdentify2 = __assign$1(__assign$1({}, eventOptions), { event_type: SpecialEventType$1.GROUP_IDENTIFY, group_properties: identify2.getUserProperties(), groups: (_a = {}, _a[groupType] = groupName, _a) });
  return groupIdentify2;
};
var createGroupEvent = function(groupType, groupName, eventOptions) {
  var _a;
  var identify2 = new Identify();
  identify2.set(groupType, groupName);
  var groupEvent = __assign$1(__assign$1({}, eventOptions), { event_type: SpecialEventType$1.IDENTIFY, user_properties: identify2.getUserProperties(), groups: (_a = {}, _a[groupType] = groupName, _a) });
  return groupEvent;
};
var createRevenueEvent = function(revenue2, eventOptions) {
  return __assign$1(__assign$1({}, eventOptions), { event_type: SpecialEventType$1.REVENUE, event_properties: revenue2.getEventProperties() });
};
var returnWrapper = function(awaitable) {
  return {
    promise: awaitable || Promise.resolve()
  };
};
var AmplitudeCore = (
  /** @class */
  function() {
    function AmplitudeCore2(name) {
      if (name === void 0) {
        name = "$default";
      }
      this.initializing = false;
      this.isReady = false;
      this.q = [];
      this.dispatchQ = [];
      this.logEvent = this.track.bind(this);
      this.timeline = new Timeline(this);
      this.name = name;
    }
    AmplitudeCore2.prototype._init = function(config2) {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              this.config = config2;
              this.timeline.reset(this);
              this.timeline.loggerProvider = this.config.loggerProvider;
              return [4, this.runQueuedFunctions("q")];
            case 1:
              _a.sent();
              this.isReady = true;
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    AmplitudeCore2.prototype.runQueuedFunctions = function(queueName) {
      return __awaiter(this, void 0, void 0, function() {
        var queuedFunctions, queuedFunctions_1, queuedFunctions_1_1, queuedFunction, val, e_1_1;
        var e_1, _a;
        return __generator(this, function(_b) {
          switch (_b.label) {
            case 0:
              queuedFunctions = this[queueName];
              this[queueName] = [];
              _b.label = 1;
            case 1:
              _b.trys.push([1, 8, 9, 10]);
              queuedFunctions_1 = __values$1(queuedFunctions), queuedFunctions_1_1 = queuedFunctions_1.next();
              _b.label = 2;
            case 2:
              if (!!queuedFunctions_1_1.done) return [3, 7];
              queuedFunction = queuedFunctions_1_1.value;
              val = queuedFunction();
              if (!(val && "promise" in val)) return [3, 4];
              return [4, val.promise];
            case 3:
              _b.sent();
              return [3, 6];
            case 4:
              return [4, val];
            case 5:
              _b.sent();
              _b.label = 6;
            case 6:
              queuedFunctions_1_1 = queuedFunctions_1.next();
              return [3, 2];
            case 7:
              return [3, 10];
            case 8:
              e_1_1 = _b.sent();
              e_1 = { error: e_1_1 };
              return [3, 10];
            case 9:
              try {
                if (queuedFunctions_1_1 && !queuedFunctions_1_1.done && (_a = queuedFunctions_1.return)) _a.call(queuedFunctions_1);
              } finally {
                if (e_1) throw e_1.error;
              }
              return [
                7
                /*endfinally*/
              ];
            case 10:
              if (!this[queueName].length) return [3, 12];
              return [4, this.runQueuedFunctions(queueName)];
            case 11:
              _b.sent();
              _b.label = 12;
            case 12:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    AmplitudeCore2.prototype.track = function(eventInput, eventProperties, eventOptions) {
      var event = createTrackEvent(eventInput, eventProperties, eventOptions);
      return returnWrapper(this.dispatch(event));
    };
    AmplitudeCore2.prototype.identify = function(identify2, eventOptions) {
      var event = createIdentifyEvent(identify2, eventOptions);
      return returnWrapper(this.dispatch(event));
    };
    AmplitudeCore2.prototype.groupIdentify = function(groupType, groupName, identify2, eventOptions) {
      var event = createGroupIdentifyEvent(groupType, groupName, identify2, eventOptions);
      return returnWrapper(this.dispatch(event));
    };
    AmplitudeCore2.prototype.setGroup = function(groupType, groupName, eventOptions) {
      var event = createGroupEvent(groupType, groupName, eventOptions);
      return returnWrapper(this.dispatch(event));
    };
    AmplitudeCore2.prototype.revenue = function(revenue2, eventOptions) {
      var event = createRevenueEvent(revenue2, eventOptions);
      return returnWrapper(this.dispatch(event));
    };
    AmplitudeCore2.prototype.add = function(plugin) {
      if (!this.isReady) {
        this.q.push(this._addPlugin.bind(this, plugin));
        return returnWrapper();
      }
      return this._addPlugin(plugin);
    };
    AmplitudeCore2.prototype._addPlugin = function(plugin) {
      return returnWrapper(this.timeline.register(plugin, this.config));
    };
    AmplitudeCore2.prototype.remove = function(pluginName) {
      if (!this.isReady) {
        this.q.push(this._removePlugin.bind(this, pluginName));
        return returnWrapper();
      }
      return this._removePlugin(pluginName);
    };
    AmplitudeCore2.prototype._removePlugin = function(pluginName) {
      return returnWrapper(this.timeline.deregister(pluginName, this.config));
    };
    AmplitudeCore2.prototype.dispatchWithCallback = function(event, callback) {
      if (!this.isReady) {
        return callback(buildResult(event, 0, CLIENT_NOT_INITIALIZED));
      }
      void this.process(event).then(callback);
    };
    AmplitudeCore2.prototype.dispatch = function(event) {
      return __awaiter(this, void 0, void 0, function() {
        var _this = this;
        return __generator(this, function(_a) {
          if (!this.isReady) {
            return [2, new Promise(function(resolve) {
              _this.dispatchQ.push(_this.dispatchWithCallback.bind(_this, event, resolve));
            })];
          }
          return [2, this.process(event)];
        });
      });
    };
    AmplitudeCore2.prototype.getOperationAppliedUserProperties = function(userProperties) {
      var updatedProperties = {};
      if (userProperties === void 0) {
        return updatedProperties;
      }
      var nonOpProperties = {};
      Object.keys(userProperties).forEach(function(key) {
        if (!Object.values(IdentifyOperation$2).includes(key)) {
          nonOpProperties[key] = userProperties[key];
        }
      });
      OrderedIdentifyOperations.forEach(function(operation) {
        if (!Object.keys(userProperties).includes(operation))
          return;
        var opProperties = userProperties[operation];
        switch (operation) {
          case IdentifyOperation$2.CLEAR_ALL:
            Object.keys(updatedProperties).forEach(function(prop) {
              delete updatedProperties[prop];
            });
            break;
          case IdentifyOperation$2.UNSET:
            Object.keys(opProperties).forEach(function(prop) {
              delete updatedProperties[prop];
            });
            break;
          case IdentifyOperation$2.SET:
            Object.assign(updatedProperties, opProperties);
            break;
        }
      });
      Object.assign(updatedProperties, nonOpProperties);
      return updatedProperties;
    };
    AmplitudeCore2.prototype.process = function(event) {
      return __awaiter(this, void 0, void 0, function() {
        var userProperties, result, e_2, message, result;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              if (this.config.optOut) {
                return [2, buildResult(event, 0, OPT_OUT_MESSAGE)];
              }
              if (event.event_type === SpecialEventType$1.IDENTIFY) {
                userProperties = this.getOperationAppliedUserProperties(event.user_properties);
                this.timeline.onIdentityChanged({ userProperties });
              }
              return [4, this.timeline.push(event)];
            case 1:
              result = _a.sent();
              result.code === 200 ? this.config.loggerProvider.log(result.message) : result.code === 100 ? this.config.loggerProvider.warn(result.message) : this.config.loggerProvider.error(result.message);
              return [2, result];
            case 2:
              e_2 = _a.sent();
              message = String(e_2);
              this.config.loggerProvider.error(message);
              result = buildResult(event, 0, message);
              return [2, result];
            case 3:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    AmplitudeCore2.prototype.setOptOut = function(optOut) {
      if (!this.isReady) {
        this.q.push(this._setOptOut.bind(this, Boolean(optOut)));
        return;
      }
      this._setOptOut(optOut);
    };
    AmplitudeCore2.prototype._setOptOut = function(optOut) {
      if (this.config.optOut !== optOut) {
        this.timeline.onOptOutChanged(optOut);
        this.config.optOut = Boolean(optOut);
      }
    };
    AmplitudeCore2.prototype.flush = function() {
      return returnWrapper(this.timeline.flush());
    };
    AmplitudeCore2.prototype.plugin = function(name) {
      var plugin = this.timeline.plugins.find(function(plugin2) {
        return plugin2.name === name;
      });
      if (plugin === void 0) {
        this.config.loggerProvider.debug("Cannot find plugin with name ".concat(name));
        return void 0;
      }
      return plugin;
    };
    AmplitudeCore2.prototype.plugins = function(pluginClass) {
      return this.timeline.plugins.filter(function(plugin) {
        return plugin instanceof pluginClass;
      });
    };
    return AmplitudeCore2;
  }()
);
var RemoteConfigLocalStorage = (
  /** @class */
  function() {
    function RemoteConfigLocalStorage2(apiKey, logger) {
      this.key = "AMP_remote_config_".concat(apiKey.substring(0, 10));
      this.logger = logger;
    }
    RemoteConfigLocalStorage2.prototype.fetchConfig = function() {
      var result = null;
      var failedRemoteConfigInfo = {
        remoteConfig: null,
        lastFetch: /* @__PURE__ */ new Date()
      };
      try {
        result = localStorage.getItem(this.key);
      } catch (error) {
        this.logger.debug("Remote config localstorage failed to access: ", error);
        return Promise.resolve(failedRemoteConfigInfo);
      }
      if (result === null) {
        this.logger.debug("Remote config localstorage gets null because the key does not exist");
        return Promise.resolve(failedRemoteConfigInfo);
      }
      try {
        var remoteConfigInfo = JSON.parse(result);
        this.logger.debug("Remote config localstorage parsed successfully: ".concat(JSON.stringify(remoteConfigInfo)));
        return Promise.resolve({
          remoteConfig: remoteConfigInfo.remoteConfig,
          lastFetch: new Date(remoteConfigInfo.lastFetch)
        });
      } catch (error) {
        this.logger.debug("Remote config localstorage failed to parse: ", error);
        localStorage.removeItem(this.key);
        return Promise.resolve(failedRemoteConfigInfo);
      }
    };
    RemoteConfigLocalStorage2.prototype.setConfig = function(config2) {
      try {
        localStorage.setItem(this.key, JSON.stringify(config2));
        this.logger.debug("Remote config localstorage set successfully.");
        return Promise.resolve(true);
      } catch (error) {
        this.logger.debug("Remote config localstorage failed to set: ", error);
      }
      return Promise.resolve(false);
    };
    return RemoteConfigLocalStorage2;
  }()
);
var US_SERVER_URL = "https://sr-client-cfg.amplitude.com/config";
var EU_SERVER_URL = "https://sr-client-cfg.eu.amplitude.com/config";
var DEFAULT_MAX_RETRIES = 3;
var DEFAULT_TIMEOUT = 1e3;
var RemoteConfigClient = (
  /** @class */
  function() {
    function RemoteConfigClient2(apiKey, logger, serverZone) {
      if (serverZone === void 0) {
        serverZone = "US";
      }
      this.callbackInfos = [];
      this.apiKey = apiKey;
      this.serverUrl = serverZone === "US" ? US_SERVER_URL : EU_SERVER_URL;
      this.logger = logger;
      this.storage = new RemoteConfigLocalStorage(apiKey, logger);
    }
    RemoteConfigClient2.prototype.subscribe = function(key, deliveryMode, callback) {
      var id = UUID();
      var callbackInfo = {
        id,
        key,
        deliveryMode,
        callback
      };
      this.callbackInfos.push(callbackInfo);
      if (deliveryMode === "all") {
        void this.subscribeAll(callbackInfo);
      } else {
        void this.subscribeWaitForRemote(callbackInfo, deliveryMode.timeout);
      }
      return id;
    };
    RemoteConfigClient2.prototype.unsubscribe = function(id) {
      var index2 = this.callbackInfos.findIndex(function(callbackInfo) {
        return callbackInfo.id === id;
      });
      if (index2 === -1) {
        this.logger.debug("Remote config client unsubscribe failed because callback with id ".concat(id, " doesn't exist."));
        return false;
      }
      this.callbackInfos.splice(index2, 1);
      this.logger.debug("Remote config client unsubscribe succeeded removing callback with id ".concat(id, "."));
      return true;
    };
    RemoteConfigClient2.prototype.updateConfigs = function() {
      return __awaiter(this, void 0, void 0, function() {
        var result;
        var _this = this;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              return [4, this.fetch()];
            case 1:
              result = _a.sent();
              void this.storage.setConfig(result);
              this.callbackInfos.forEach(function(callbackInfo) {
                _this.sendCallback(callbackInfo, result, "remote");
              });
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    RemoteConfigClient2.prototype.subscribeAll = function(callbackInfo) {
      return __awaiter(this, void 0, void 0, function() {
        var remotePromise, cachePromise, result;
        var _this = this;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              remotePromise = this.fetch().then(function(result2) {
                _this.logger.debug("Remote config client subscription all mode fetched from remote: ".concat(JSON.stringify(result2)));
                _this.sendCallback(callbackInfo, result2, "remote");
                void _this.storage.setConfig(result2);
              });
              cachePromise = this.storage.fetchConfig().then(function(result2) {
                return result2;
              });
              return [4, Promise.race([remotePromise, cachePromise])];
            case 1:
              result = _a.sent();
              if (result !== void 0) {
                this.logger.debug("Remote config client subscription all mode fetched from cache: ".concat(JSON.stringify(result)));
                this.sendCallback(callbackInfo, result, "cache");
              }
              return [4, remotePromise];
            case 2:
              _a.sent();
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    RemoteConfigClient2.prototype.subscribeWaitForRemote = function(callbackInfo, timeout2) {
      return __awaiter(this, void 0, void 0, function() {
        var timeoutPromise, result, result;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              timeoutPromise = new Promise(function(_2, reject) {
                setTimeout(function() {
                  reject("Timeout exceeded");
                }, timeout2);
              });
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 5]);
              return [4, Promise.race([this.fetch(), timeoutPromise])];
            case 2:
              result = _a.sent();
              this.logger.debug("Remote config client subscription wait for remote mode returns from remote.");
              this.sendCallback(callbackInfo, result, "remote");
              void this.storage.setConfig(result);
              return [3, 5];
            case 3:
              _a.sent();
              this.logger.debug("Remote config client subscription wait for remote mode exceeded timeout. Try to fetch from cache.");
              return [4, this.storage.fetchConfig()];
            case 4:
              result = _a.sent();
              if (result.remoteConfig !== null) {
                this.logger.debug("Remote config client subscription wait for remote mode returns a cached copy.");
                this.sendCallback(callbackInfo, result, "cache");
              } else {
                this.logger.debug("Remote config client subscription wait for remote mode failed to fetch cache.");
                this.sendCallback(callbackInfo, result, "remote");
              }
              return [3, 5];
            case 5:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    RemoteConfigClient2.prototype.sendCallback = function(callbackInfo, remoteConfigInfo, source) {
      callbackInfo.lastCallback = /* @__PURE__ */ new Date();
      var filteredConfig;
      if (callbackInfo.key) {
        filteredConfig = callbackInfo.key.split(".").reduce(function(config2, key) {
          if (config2 === null) {
            return config2;
          }
          return key in config2 ? config2[key] : null;
        }, remoteConfigInfo.remoteConfig);
      } else {
        filteredConfig = remoteConfigInfo.remoteConfig;
      }
      callbackInfo.callback(filteredConfig, source, remoteConfigInfo.lastFetch);
    };
    RemoteConfigClient2.prototype.fetch = function(retries, timeout2) {
      if (retries === void 0) {
        retries = DEFAULT_MAX_RETRIES;
      }
      if (timeout2 === void 0) {
        timeout2 = DEFAULT_TIMEOUT;
      }
      return __awaiter(this, void 0, void 0, function() {
        var interval, failedRemoteConfigInfo, _loop_1, this_1, attempt, state_1;
        var _this = this;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              interval = timeout2 / retries;
              failedRemoteConfigInfo = {
                remoteConfig: null,
                lastFetch: /* @__PURE__ */ new Date()
              };
              _loop_1 = function(attempt2) {
                var abortController, timeoutId, res, body, remoteConfig, error_2;
                return __generator(this, function(_b) {
                  switch (_b.label) {
                    case 0:
                      abortController = new AbortController();
                      timeoutId = setTimeout(function() {
                        return abortController.abort();
                      }, timeout2);
                      _b.label = 1;
                    case 1:
                      _b.trys.push([1, 7, 8, 9]);
                      return [4, fetch(this_1.getUrlParams(), {
                        method: "GET",
                        headers: {
                          Accept: "*/*"
                        },
                        signal: abortController.signal
                      })];
                    case 2:
                      res = _b.sent();
                      if (!!res.ok) return [3, 4];
                      return [4, res.text()];
                    case 3:
                      body = _b.sent();
                      this_1.logger.debug("Remote config client fetch with retry time ".concat(retries, " failed with ").concat(res.status, ": ").concat(body));
                      return [3, 6];
                    case 4:
                      return [4, res.json()];
                    case 5:
                      remoteConfig = _b.sent();
                      return [2, { value: {
                        remoteConfig,
                        lastFetch: /* @__PURE__ */ new Date()
                      } }];
                    case 6:
                      return [3, 9];
                    case 7:
                      error_2 = _b.sent();
                      if (error_2 instanceof Error && error_2.name === "AbortError") {
                        this_1.logger.debug("Remote config client fetch with retry time ".concat(retries, " timed out after ").concat(timeout2, "ms"));
                      } else {
                        this_1.logger.debug("Remote config client fetch with retry time ".concat(retries, " is rejected because: "), error_2);
                      }
                      return [3, 9];
                    case 8:
                      clearTimeout(timeoutId);
                      return [
                        7
                        /*endfinally*/
                      ];
                    case 9:
                      if (!(attempt2 < retries - 1)) return [3, 11];
                      return [4, new Promise(function(resolve) {
                        return setTimeout(resolve, _this.getJitterDelay(interval));
                      })];
                    case 10:
                      _b.sent();
                      _b.label = 11;
                    case 11:
                      return [
                        2
                        /*return*/
                      ];
                  }
                });
              };
              this_1 = this;
              attempt = 0;
              _a.label = 1;
            case 1:
              if (!(attempt < retries)) return [3, 4];
              return [5, _loop_1(attempt)];
            case 2:
              state_1 = _a.sent();
              if (typeof state_1 === "object")
                return [2, state_1.value];
              _a.label = 3;
            case 3:
              attempt++;
              return [3, 1];
            case 4:
              return [2, failedRemoteConfigInfo];
          }
        });
      });
    };
    RemoteConfigClient2.prototype.getJitterDelay = function(baseDelay) {
      return Math.floor(Math.random() * baseDelay);
    };
    RemoteConfigClient2.prototype.getUrlParams = function() {
      var encodedApiKey = encodeURIComponent(this.apiKey);
      var urlParams = new URLSearchParams();
      urlParams.append("config_group", RemoteConfigClient2.CONFIG_GROUP);
      return "".concat(this.serverUrl, "/").concat(encodedApiKey, "?").concat(urlParams.toString());
    };
    RemoteConfigClient2.CONFIG_GROUP = "browser";
    return RemoteConfigClient2;
  }()
);
var LogLevel;
(function(LogLevel2) {
  LogLevel2[LogLevel2["None"] = 0] = "None";
  LogLevel2[LogLevel2["Error"] = 1] = "Error";
  LogLevel2[LogLevel2["Warn"] = 2] = "Warn";
  LogLevel2[LogLevel2["Verbose"] = 3] = "Verbose";
  LogLevel2[LogLevel2["Debug"] = 4] = "Debug";
})(LogLevel || (LogLevel = {}));
var PREFIX = "Amplitude Logger ";
var Logger = (
  /** @class */
  function() {
    function Logger2() {
      this.logLevel = LogLevel.None;
    }
    Logger2.prototype.disable = function() {
      this.logLevel = LogLevel.None;
    };
    Logger2.prototype.enable = function(logLevel) {
      if (logLevel === void 0) {
        logLevel = LogLevel.Warn;
      }
      this.logLevel = logLevel;
    };
    Logger2.prototype.log = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (this.logLevel < LogLevel.Verbose) {
        return;
      }
      console.log("".concat(PREFIX, "[Log]: ").concat(args.join(" ")));
    };
    Logger2.prototype.warn = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (this.logLevel < LogLevel.Warn) {
        return;
      }
      console.warn("".concat(PREFIX, "[Warn]: ").concat(args.join(" ")));
    };
    Logger2.prototype.error = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (this.logLevel < LogLevel.Error) {
        return;
      }
      console.error("".concat(PREFIX, "[Error]: ").concat(args.join(" ")));
    };
    Logger2.prototype.debug = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (this.logLevel < LogLevel.Debug) {
        return;
      }
      console.log("".concat(PREFIX, "[Debug]: ").concat(args.join(" ")));
    };
    return Logger2;
  }()
);
var Revenue = (
  /** @class */
  function() {
    function Revenue2() {
      this.productId = "";
      this.quantity = 1;
      this.price = 0;
    }
    Revenue2.prototype.setProductId = function(productId) {
      this.productId = productId;
      return this;
    };
    Revenue2.prototype.setQuantity = function(quantity) {
      if (quantity > 0) {
        this.quantity = quantity;
      }
      return this;
    };
    Revenue2.prototype.setPrice = function(price) {
      this.price = price;
      return this;
    };
    Revenue2.prototype.setRevenueType = function(revenueType) {
      this.revenueType = revenueType;
      return this;
    };
    Revenue2.prototype.setCurrency = function(currency) {
      this.currency = currency;
      return this;
    };
    Revenue2.prototype.setRevenue = function(revenue2) {
      this.revenue = revenue2;
      return this;
    };
    Revenue2.prototype.setReceipt = function(receipt) {
      this.receipt = receipt;
      return this;
    };
    Revenue2.prototype.setReceiptSig = function(receiptSig) {
      this.receiptSig = receiptSig;
      return this;
    };
    Revenue2.prototype.setEventProperties = function(properties) {
      if (isValidObject(properties)) {
        this.properties = properties;
      }
      return this;
    };
    Revenue2.prototype.getEventProperties = function() {
      var eventProperties = this.properties ? __assign$1({}, this.properties) : {};
      eventProperties[RevenueProperty$1.REVENUE_PRODUCT_ID] = this.productId;
      eventProperties[RevenueProperty$1.REVENUE_QUANTITY] = this.quantity;
      eventProperties[RevenueProperty$1.REVENUE_PRICE] = this.price;
      eventProperties[RevenueProperty$1.REVENUE_TYPE] = this.revenueType;
      eventProperties[RevenueProperty$1.REVENUE_CURRENCY] = this.currency;
      eventProperties[RevenueProperty$1.REVENUE] = this.revenue;
      eventProperties[RevenueProperty$1.RECEIPT] = this.receipt;
      eventProperties[RevenueProperty$1.RECEIPT_SIG] = this.receiptSig;
      return eventProperties;
    };
    return Revenue2;
  }()
);
var RevenueProperty$1;
(function(RevenueProperty2) {
  RevenueProperty2["REVENUE_PRODUCT_ID"] = "$productId";
  RevenueProperty2["REVENUE_QUANTITY"] = "$quantity";
  RevenueProperty2["REVENUE_PRICE"] = "$price";
  RevenueProperty2["REVENUE_TYPE"] = "$revenueType";
  RevenueProperty2["REVENUE_CURRENCY"] = "$currency";
  RevenueProperty2["REVENUE"] = "$revenue";
  RevenueProperty2["RECEIPT"] = "$receipt";
  RevenueProperty2["RECEIPT_SIG"] = "$receiptSig";
})(RevenueProperty$1 || (RevenueProperty$1 = {}));
var chunk = function(arr, size) {
  var chunkSize = Math.max(size, 1);
  return arr.reduce(function(chunks, element, index2) {
    var chunkIndex = Math.floor(index2 / chunkSize);
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = [];
    }
    chunks[chunkIndex].push(element);
    return chunks;
  }, []);
};
var getDefaultConfig = function() {
  return {
    flushMaxRetries: 12,
    flushQueueSize: 200,
    flushIntervalMillis: 1e4,
    instanceName: DEFAULT_INSTANCE_NAME,
    logLevel: LogLevel.Warn,
    loggerProvider: new Logger(),
    offline: false,
    optOut: false,
    serverUrl: AMPLITUDE_SERVER_URL,
    serverZone: "US",
    useBatch: false
  };
};
var Config = (
  /** @class */
  function() {
    function Config2(options) {
      var _a, _b, _c, _d;
      this._optOut = false;
      var defaultConfig = getDefaultConfig();
      this.apiKey = options.apiKey;
      this.flushIntervalMillis = (_a = options.flushIntervalMillis) !== null && _a !== void 0 ? _a : defaultConfig.flushIntervalMillis;
      this.flushMaxRetries = options.flushMaxRetries || defaultConfig.flushMaxRetries;
      this.flushQueueSize = options.flushQueueSize || defaultConfig.flushQueueSize;
      this.instanceName = options.instanceName || defaultConfig.instanceName;
      this.loggerProvider = options.loggerProvider || defaultConfig.loggerProvider;
      this.logLevel = (_b = options.logLevel) !== null && _b !== void 0 ? _b : defaultConfig.logLevel;
      this.minIdLength = options.minIdLength;
      this.plan = options.plan;
      this.ingestionMetadata = options.ingestionMetadata;
      this.offline = options.offline !== void 0 ? options.offline : defaultConfig.offline;
      this.optOut = (_c = options.optOut) !== null && _c !== void 0 ? _c : defaultConfig.optOut;
      this.serverUrl = options.serverUrl;
      this.serverZone = options.serverZone || defaultConfig.serverZone;
      this.storageProvider = options.storageProvider;
      this.transportProvider = options.transportProvider;
      this.useBatch = (_d = options.useBatch) !== null && _d !== void 0 ? _d : defaultConfig.useBatch;
      this.loggerProvider.enable(this.logLevel);
      var serverConfig = createServerConfig(options.serverUrl, options.serverZone, options.useBatch);
      this.serverZone = serverConfig.serverZone;
      this.serverUrl = serverConfig.serverUrl;
    }
    Object.defineProperty(Config2.prototype, "optOut", {
      get: function() {
        return this._optOut;
      },
      set: function(optOut) {
        this._optOut = optOut;
      },
      enumerable: false,
      configurable: true
    });
    return Config2;
  }()
);
var getServerUrl = function(serverZone, useBatch) {
  if (serverZone === "EU") {
    return useBatch ? EU_AMPLITUDE_BATCH_SERVER_URL : EU_AMPLITUDE_SERVER_URL;
  }
  return useBatch ? AMPLITUDE_BATCH_SERVER_URL : AMPLITUDE_SERVER_URL;
};
var createServerConfig = function(serverUrl, serverZone, useBatch) {
  if (serverUrl === void 0) {
    serverUrl = "";
  }
  if (serverZone === void 0) {
    serverZone = getDefaultConfig().serverZone;
  }
  if (useBatch === void 0) {
    useBatch = getDefaultConfig().useBatch;
  }
  if (serverUrl) {
    return { serverUrl, serverZone: void 0 };
  }
  var _serverZone = ["US", "EU"].includes(serverZone) ? serverZone : getDefaultConfig().serverZone;
  return {
    serverZone: _serverZone,
    serverUrl: getServerUrl(_serverZone, useBatch)
  };
};
var RequestMetadata = (
  /** @class */
  function() {
    function RequestMetadata2() {
      this.sdk = {
        metrics: {
          histogram: {}
        }
      };
    }
    RequestMetadata2.prototype.recordHistogram = function(key, value) {
      this.sdk.metrics.histogram[key] = value;
    };
    return RequestMetadata2;
  }()
);
function getErrorMessage(error) {
  if (error instanceof Error)
    return error.message;
  return String(error);
}
function getResponseBodyString(res) {
  var responseBodyString = "";
  try {
    if ("body" in res) {
      responseBodyString = JSON.stringify(res.body, null, 2);
    }
  } catch (_a) {
  }
  return responseBodyString;
}
var Destination = (
  /** @class */
  function() {
    function Destination2() {
      this.name = "amplitude";
      this.type = "destination";
      this.retryTimeout = 1e3;
      this.throttleTimeout = 3e4;
      this.storageKey = "";
      this.scheduleId = null;
      this.scheduledTimeout = 0;
      this.flushId = null;
      this.queue = [];
    }
    Destination2.prototype.setup = function(config2) {
      var _a;
      return __awaiter(this, void 0, void 0, function() {
        var unsent;
        var _this = this;
        return __generator(this, function(_b) {
          switch (_b.label) {
            case 0:
              this.config = config2;
              this.storageKey = "".concat(STORAGE_PREFIX, "_").concat(this.config.apiKey.substring(0, 10));
              return [4, (_a = this.config.storageProvider) === null || _a === void 0 ? void 0 : _a.get(this.storageKey)];
            case 1:
              unsent = _b.sent();
              if (unsent && unsent.length > 0) {
                void Promise.all(unsent.map(function(event) {
                  return _this.execute(event);
                })).catch();
              }
              return [2, Promise.resolve(void 0)];
          }
        });
      });
    };
    Destination2.prototype.execute = function(event) {
      var _this = this;
      if (!event.insert_id) {
        event.insert_id = UUID();
      }
      return new Promise(function(resolve) {
        var context = {
          event,
          attempts: 0,
          callback: function(result) {
            return resolve(result);
          },
          timeout: 0
        };
        _this.queue.push(context);
        _this.schedule(_this.config.flushIntervalMillis);
        _this.saveEvents();
      });
    };
    Destination2.prototype.removeEventsExceedFlushMaxRetries = function(list) {
      var _this = this;
      return list.filter(function(context) {
        context.attempts += 1;
        if (context.attempts < _this.config.flushMaxRetries) {
          return true;
        }
        void _this.fulfillRequest([context], 500, MAX_RETRIES_EXCEEDED_MESSAGE$1);
        return false;
      });
    };
    Destination2.prototype.scheduleEvents = function(list) {
      var _this = this;
      list.forEach(function(context) {
        _this.schedule(context.timeout === 0 ? _this.config.flushIntervalMillis : context.timeout);
      });
    };
    Destination2.prototype.schedule = function(timeout2) {
      var _this = this;
      if (this.config.offline) {
        return;
      }
      if (this.scheduleId === null || this.scheduleId && timeout2 > this.scheduledTimeout) {
        if (this.scheduleId) {
          clearTimeout(this.scheduleId);
        }
        this.scheduledTimeout = timeout2;
        this.scheduleId = setTimeout(function() {
          _this.queue = _this.queue.map(function(context) {
            context.timeout = 0;
            return context;
          });
          void _this.flush(true);
        }, timeout2);
        return;
      }
    };
    Destination2.prototype.resetSchedule = function() {
      this.scheduleId = null;
      this.scheduledTimeout = 0;
    };
    Destination2.prototype.flush = function(useRetry) {
      if (useRetry === void 0) {
        useRetry = false;
      }
      return __awaiter(this, void 0, void 0, function() {
        var list, later, batches;
        var _this = this;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              if (this.config.offline) {
                this.resetSchedule();
                this.config.loggerProvider.debug("Skipping flush while offline.");
                return [
                  2
                  /*return*/
                ];
              }
              if (this.flushId) {
                this.resetSchedule();
                this.config.loggerProvider.debug("Skipping flush because previous flush has not resolved.");
                return [
                  2
                  /*return*/
                ];
              }
              this.flushId = this.scheduleId;
              this.resetSchedule();
              list = [];
              later = [];
              this.queue.forEach(function(context) {
                return context.timeout === 0 ? list.push(context) : later.push(context);
              });
              batches = chunk(list, this.config.flushQueueSize);
              return [4, batches.reduce(function(promise, batch) {
                return __awaiter(_this, void 0, void 0, function() {
                  return __generator(this, function(_a2) {
                    switch (_a2.label) {
                      case 0:
                        return [4, promise];
                      case 1:
                        _a2.sent();
                        return [4, this.send(batch, useRetry)];
                      case 2:
                        return [2, _a2.sent()];
                    }
                  });
                });
              }, Promise.resolve())];
            case 1:
              _a.sent();
              this.flushId = null;
              this.scheduleEvents(this.queue);
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    Destination2.prototype.send = function(list, useRetry) {
      if (useRetry === void 0) {
        useRetry = true;
      }
      return __awaiter(this, void 0, void 0, function() {
        var payload, serverUrl, res, e_1, errorMessage;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              if (!this.config.apiKey) {
                return [2, this.fulfillRequest(list, 400, MISSING_API_KEY_MESSAGE)];
              }
              payload = {
                api_key: this.config.apiKey,
                events: list.map(function(context) {
                  var _a2 = context.event, eventWithoutExtra = __rest(_a2, ["extra"]);
                  return eventWithoutExtra;
                }),
                options: {
                  min_id_length: this.config.minIdLength
                },
                client_upload_time: (/* @__PURE__ */ new Date()).toISOString(),
                request_metadata: this.config.requestMetadata
              };
              this.config.requestMetadata = new RequestMetadata();
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              serverUrl = createServerConfig(this.config.serverUrl, this.config.serverZone, this.config.useBatch).serverUrl;
              return [4, this.config.transportProvider.send(serverUrl, payload)];
            case 2:
              res = _a.sent();
              if (res === null) {
                this.fulfillRequest(list, 0, UNEXPECTED_ERROR_MESSAGE$1);
                return [
                  2
                  /*return*/
                ];
              }
              if (!useRetry) {
                if ("body" in res) {
                  this.fulfillRequest(list, res.statusCode, "".concat(res.status, ": ").concat(getResponseBodyString(res)));
                } else {
                  this.fulfillRequest(list, res.statusCode, res.status);
                }
                return [
                  2
                  /*return*/
                ];
              }
              this.handleResponse(res, list);
              return [3, 4];
            case 3:
              e_1 = _a.sent();
              errorMessage = getErrorMessage(e_1);
              this.config.loggerProvider.error(errorMessage);
              this.handleResponse({ status: Status$1.Failed, statusCode: 0 }, list);
              return [3, 4];
            case 4:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    Destination2.prototype.handleResponse = function(res, list) {
      var status = res.status;
      switch (status) {
        case Status$1.Success: {
          this.handleSuccessResponse(res, list);
          break;
        }
        case Status$1.Invalid: {
          this.handleInvalidResponse(res, list);
          break;
        }
        case Status$1.PayloadTooLarge: {
          this.handlePayloadTooLargeResponse(res, list);
          break;
        }
        case Status$1.RateLimit: {
          this.handleRateLimitResponse(res, list);
          break;
        }
        default: {
          this.config.loggerProvider.warn(`{code: 0, error: "Status '`.concat(status, "' provided for ").concat(list.length, ' events"}'));
          this.handleOtherResponse(list);
          break;
        }
      }
    };
    Destination2.prototype.handleSuccessResponse = function(res, list) {
      this.fulfillRequest(list, res.statusCode, SUCCESS_MESSAGE);
    };
    Destination2.prototype.handleInvalidResponse = function(res, list) {
      var _this = this;
      if (res.body.missingField || res.body.error.startsWith(INVALID_API_KEY)) {
        this.fulfillRequest(list, res.statusCode, res.body.error);
        return;
      }
      var dropIndex = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read$1(Object.values(res.body.eventsWithInvalidFields)), false), __read$1(Object.values(res.body.eventsWithMissingFields)), false), __read$1(Object.values(res.body.eventsWithInvalidIdLengths)), false), __read$1(res.body.silencedEvents), false).flat();
      var dropIndexSet = new Set(dropIndex);
      var retry = list.filter(function(context, index2) {
        if (dropIndexSet.has(index2)) {
          _this.fulfillRequest([context], res.statusCode, res.body.error);
          return;
        }
        return true;
      });
      if (retry.length > 0) {
        this.config.loggerProvider.warn(getResponseBodyString(res));
      }
      var tryable = this.removeEventsExceedFlushMaxRetries(retry);
      this.scheduleEvents(tryable);
    };
    Destination2.prototype.handlePayloadTooLargeResponse = function(res, list) {
      if (list.length === 1) {
        this.fulfillRequest(list, res.statusCode, res.body.error);
        return;
      }
      this.config.loggerProvider.warn(getResponseBodyString(res));
      this.config.flushQueueSize /= 2;
      var tryable = this.removeEventsExceedFlushMaxRetries(list);
      this.scheduleEvents(tryable);
    };
    Destination2.prototype.handleRateLimitResponse = function(res, list) {
      var _this = this;
      var dropUserIds = Object.keys(res.body.exceededDailyQuotaUsers);
      var dropDeviceIds = Object.keys(res.body.exceededDailyQuotaDevices);
      var throttledIndex = res.body.throttledEvents;
      var dropUserIdsSet = new Set(dropUserIds);
      var dropDeviceIdsSet = new Set(dropDeviceIds);
      var throttledIndexSet = new Set(throttledIndex);
      var retry = list.filter(function(context, index2) {
        if (context.event.user_id && dropUserIdsSet.has(context.event.user_id) || context.event.device_id && dropDeviceIdsSet.has(context.event.device_id)) {
          _this.fulfillRequest([context], res.statusCode, res.body.error);
          return;
        }
        if (throttledIndexSet.has(index2)) {
          context.timeout = _this.throttleTimeout;
        }
        return true;
      });
      if (retry.length > 0) {
        this.config.loggerProvider.warn(getResponseBodyString(res));
      }
      var tryable = this.removeEventsExceedFlushMaxRetries(retry);
      this.scheduleEvents(tryable);
    };
    Destination2.prototype.handleOtherResponse = function(list) {
      var _this = this;
      var later = list.map(function(context) {
        context.timeout = context.attempts * _this.retryTimeout;
        return context;
      });
      var tryable = this.removeEventsExceedFlushMaxRetries(later);
      this.scheduleEvents(tryable);
    };
    Destination2.prototype.fulfillRequest = function(list, code, message) {
      this.removeEvents(list);
      list.forEach(function(context) {
        return context.callback(buildResult(context.event, code, message));
      });
    };
    Destination2.prototype.saveEvents = function() {
      if (!this.config.storageProvider) {
        return;
      }
      var updatedEvents = this.queue.map(function(context) {
        return context.event;
      });
      void this.config.storageProvider.set(this.storageKey, updatedEvents);
    };
    Destination2.prototype.removeEvents = function(eventsToRemove) {
      this.queue = this.queue.filter(function(queuedContext) {
        return !eventsToRemove.some(function(context) {
          return context.event.insert_id === queuedContext.event.insert_id;
        });
      });
      this.saveEvents();
    };
    return Destination2;
  }()
);
var ApplicationContextProviderImpl = (
  /** @class */
  function() {
    function ApplicationContextProviderImpl2() {
    }
    ApplicationContextProviderImpl2.prototype.getApplicationContext = function() {
      return {
        versionName: this.versionName,
        language: getLanguage$1(),
        platform: "Web",
        os: void 0,
        deviceModel: void 0
      };
    };
    return ApplicationContextProviderImpl2;
  }()
);
var getLanguage$1 = function() {
  return typeof navigator !== "undefined" && (navigator.languages && navigator.languages[0] || navigator.language) || "";
};
var EventBridgeImpl = (
  /** @class */
  function() {
    function EventBridgeImpl2() {
      this.queue = [];
    }
    EventBridgeImpl2.prototype.logEvent = function(event) {
      if (!this.receiver) {
        if (this.queue.length < 512) {
          this.queue.push(event);
        }
      } else {
        this.receiver(event);
      }
    };
    EventBridgeImpl2.prototype.setEventReceiver = function(receiver) {
      this.receiver = receiver;
      if (this.queue.length > 0) {
        this.queue.forEach(function(event) {
          receiver(event);
        });
        this.queue = [];
      }
    };
    return EventBridgeImpl2;
  }()
);
var __assign = function() {
  __assign = Object.assign || function __assign2(t2) {
    for (var s2, i2 = 1, n2 = arguments.length; i2 < n2; i2++) {
      s2 = arguments[i2];
      for (var p2 in s2) if (Object.prototype.hasOwnProperty.call(s2, p2)) t2[p2] = s2[p2];
    }
    return t2;
  };
  return __assign.apply(this, arguments);
};
function __values(o2) {
  var s2 = typeof Symbol === "function" && Symbol.iterator, m2 = s2 && o2[s2], i2 = 0;
  if (m2) return m2.call(o2);
  if (o2 && typeof o2.length === "number") return {
    next: function() {
      if (o2 && i2 >= o2.length) o2 = void 0;
      return {
        value: o2 && o2[i2++],
        done: !o2
      };
    }
  };
  throw new TypeError(s2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o2, n2) {
  var m2 = typeof Symbol === "function" && o2[Symbol.iterator];
  if (!m2) return o2;
  var i2 = m2.call(o2), r2, ar = [], e2;
  try {
    while ((n2 === void 0 || n2-- > 0) && !(r2 = i2.next()).done) ar.push(r2.value);
  } catch (error) {
    e2 = {
      error
    };
  } finally {
    try {
      if (r2 && !r2.done && (m2 = i2["return"])) m2.call(i2);
    } finally {
      if (e2) throw e2.error;
    }
  }
  return ar;
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e2 = new Error(message);
  return e2.name = "SuppressedError", e2.error = error, e2.suppressed = suppressed, e2;
};
var isEqual = function(obj1, obj2) {
  var e_1, _a;
  var primitive = ["string", "number", "boolean", "undefined"];
  var typeA = typeof obj1;
  var typeB = typeof obj2;
  if (typeA !== typeB) {
    return false;
  }
  try {
    for (var primitive_1 = __values(primitive), primitive_1_1 = primitive_1.next(); !primitive_1_1.done; primitive_1_1 = primitive_1.next()) {
      var p2 = primitive_1_1.value;
      if (p2 === typeA) {
        return obj1 === obj2;
      }
    }
  } catch (e_1_1) {
    e_1 = { error: e_1_1 };
  } finally {
    try {
      if (primitive_1_1 && !primitive_1_1.done && (_a = primitive_1.return)) _a.call(primitive_1);
    } finally {
      if (e_1) throw e_1.error;
    }
  }
  if (obj1 == null && obj2 == null) {
    return true;
  } else if (obj1 == null || obj2 == null) {
    return false;
  }
  if (obj1.length !== obj2.length) {
    return false;
  }
  var isArrayA = Array.isArray(obj1);
  var isArrayB = Array.isArray(obj2);
  if (isArrayA !== isArrayB) {
    return false;
  }
  if (isArrayA && isArrayB) {
    for (var i2 = 0; i2 < obj1.length; i2++) {
      if (!isEqual(obj1[i2], obj2[i2])) {
        return false;
      }
    }
  } else {
    var sorted1 = Object.keys(obj1).sort();
    var sorted2 = Object.keys(obj2).sort();
    if (!isEqual(sorted1, sorted2)) {
      return false;
    }
    var result_1 = true;
    Object.keys(obj1).forEach(function(key) {
      if (!isEqual(obj1[key], obj2[key])) {
        result_1 = false;
      }
    });
    return result_1;
  }
  return true;
};
var ID_OP_SET = "$set";
var ID_OP_UNSET = "$unset";
var ID_OP_CLEAR_ALL = "$clearAll";
if (!Object.entries) {
  Object.entries = function(obj) {
    var ownProps = Object.keys(obj);
    var i2 = ownProps.length;
    var resArray = new Array(i2);
    while (i2--) {
      resArray[i2] = [ownProps[i2], obj[ownProps[i2]]];
    }
    return resArray;
  };
}
var IdentityStoreImpl = (
  /** @class */
  function() {
    function IdentityStoreImpl2() {
      this.identity = { userProperties: {} };
      this.listeners = /* @__PURE__ */ new Set();
    }
    IdentityStoreImpl2.prototype.editIdentity = function() {
      var self2 = this;
      var actingUserProperties = __assign({}, this.identity.userProperties);
      var actingIdentity = __assign(__assign({}, this.identity), { userProperties: actingUserProperties });
      return {
        setUserId: function(userId) {
          actingIdentity.userId = userId;
          return this;
        },
        setDeviceId: function(deviceId) {
          actingIdentity.deviceId = deviceId;
          return this;
        },
        setUserProperties: function(userProperties) {
          actingIdentity.userProperties = userProperties;
          return this;
        },
        setOptOut: function(optOut) {
          actingIdentity.optOut = optOut;
          return this;
        },
        updateUserProperties: function(actions) {
          var e_1, _a, e_2, _b, e_3, _c;
          var actingProperties = actingIdentity.userProperties || {};
          try {
            for (var _d = __values(Object.entries(actions)), _e = _d.next(); !_e.done; _e = _d.next()) {
              var _f = __read(_e.value, 2), action = _f[0], properties = _f[1];
              switch (action) {
                case ID_OP_SET:
                  try {
                    for (var _g = (e_2 = void 0, __values(Object.entries(properties))), _h = _g.next(); !_h.done; _h = _g.next()) {
                      var _j = __read(_h.value, 2), key = _j[0], value = _j[1];
                      actingProperties[key] = value;
                    }
                  } catch (e_2_1) {
                    e_2 = { error: e_2_1 };
                  } finally {
                    try {
                      if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                    } finally {
                      if (e_2) throw e_2.error;
                    }
                  }
                  break;
                case ID_OP_UNSET:
                  try {
                    for (var _k = (e_3 = void 0, __values(Object.keys(properties))), _l = _k.next(); !_l.done; _l = _k.next()) {
                      var key = _l.value;
                      delete actingProperties[key];
                    }
                  } catch (e_3_1) {
                    e_3 = { error: e_3_1 };
                  } finally {
                    try {
                      if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
                    } finally {
                      if (e_3) throw e_3.error;
                    }
                  }
                  break;
                case ID_OP_CLEAR_ALL:
                  actingProperties = {};
                  break;
              }
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            } finally {
              if (e_1) throw e_1.error;
            }
          }
          actingIdentity.userProperties = actingProperties;
          return this;
        },
        commit: function() {
          self2.setIdentity(actingIdentity);
          return this;
        }
      };
    };
    IdentityStoreImpl2.prototype.getIdentity = function() {
      return __assign({}, this.identity);
    };
    IdentityStoreImpl2.prototype.setIdentity = function(identity2) {
      var originalIdentity = __assign({}, this.identity);
      this.identity = __assign({}, identity2);
      if (!isEqual(originalIdentity, this.identity)) {
        this.listeners.forEach(function(listener) {
          listener(identity2);
        });
      }
    };
    IdentityStoreImpl2.prototype.addIdentityListener = function(listener) {
      this.listeners.add(listener);
    };
    IdentityStoreImpl2.prototype.removeIdentityListener = function(listener) {
      this.listeners.delete(listener);
    };
    return IdentityStoreImpl2;
  }()
);
var safeGlobal = typeof globalThis !== "undefined" ? globalThis : typeof globalThis !== "undefined" ? globalThis : self;
var AnalyticsConnector = (
  /** @class */
  function() {
    function AnalyticsConnector2() {
      this.identityStore = new IdentityStoreImpl();
      this.eventBridge = new EventBridgeImpl();
      this.applicationContextProvider = new ApplicationContextProviderImpl();
    }
    AnalyticsConnector2.getInstance = function(instanceName) {
      if (!safeGlobal["analyticsConnectorInstances"]) {
        safeGlobal["analyticsConnectorInstances"] = {};
      }
      if (!safeGlobal["analyticsConnectorInstances"][instanceName]) {
        safeGlobal["analyticsConnectorInstances"][instanceName] = new AnalyticsConnector2();
      }
      return safeGlobal["analyticsConnectorInstances"][instanceName];
    };
    return AnalyticsConnector2;
  }()
);
var getAnalyticsConnector = function(instanceName) {
  if (instanceName === void 0) {
    instanceName = DEFAULT_INSTANCE_NAME;
  }
  return AnalyticsConnector.getInstance(instanceName);
};
var setConnectorUserId = function(userId, instanceName) {
  getAnalyticsConnector(instanceName).identityStore.editIdentity().setUserId(userId).commit();
};
var setConnectorDeviceId = function(deviceId, instanceName) {
  getAnalyticsConnector(instanceName).identityStore.editIdentity().setDeviceId(deviceId).commit();
};
var IdentityEventSender = (
  /** @class */
  function() {
    function IdentityEventSender2() {
      this.name = "identity";
      this.type = "before";
      this.identityStore = getAnalyticsConnector().identityStore;
    }
    IdentityEventSender2.prototype.execute = function(context) {
      return __awaiter(this, void 0, void 0, function() {
        var userProperties;
        return __generator(this, function(_a) {
          userProperties = context.user_properties;
          if (userProperties) {
            this.identityStore.editIdentity().updateUserProperties(userProperties).commit();
          }
          return [2, context];
        });
      });
    };
    IdentityEventSender2.prototype.setup = function(config2) {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          if (config2.instanceName) {
            this.identityStore = getAnalyticsConnector(config2.instanceName).identityStore;
          }
          return [
            2
            /*return*/
          ];
        });
      });
    };
    return IdentityEventSender2;
  }()
);
var isNewSession = function(sessionTimeout, lastEventTime) {
  if (lastEventTime === void 0) {
    lastEventTime = Date.now();
  }
  var currentTime = Date.now();
  var timeSinceLastEvent = currentTime - lastEventTime;
  return timeSinceLastEvent > sessionTimeout;
};
var getCookieName = function(apiKey, postKey, limit) {
  if (postKey === void 0) {
    postKey = "";
  }
  if (limit === void 0) {
    limit = 10;
  }
  return [AMPLITUDE_PREFIX, postKey, apiKey.substring(0, limit)].filter(Boolean).join("_");
};
var getOldCookieName = function(apiKey) {
  return "".concat(AMPLITUDE_PREFIX.toLowerCase(), "_").concat(apiKey.substring(0, 6));
};
var getLanguage = function() {
  var _a, _b, _c, _d;
  if (typeof navigator === "undefined")
    return "";
  var userLanguage = navigator.userLanguage;
  return (_d = (_c = (_b = (_a = navigator.languages) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : navigator.language) !== null && _c !== void 0 ? _c : userLanguage) !== null && _d !== void 0 ? _d : "";
};
var getQueryParams$1 = function() {
  var _a;
  var globalScope = getGlobalScope$1();
  if (!((_a = globalScope === null || globalScope === void 0 ? void 0 : globalScope.location) === null || _a === void 0 ? void 0 : _a.search)) {
    return {};
  }
  var pairs = globalScope.location.search.substring(1).split("&").filter(Boolean);
  var params = pairs.reduce(function(acc, curr) {
    var query = curr.split("=", 2);
    var key = tryDecodeURIComponent$1(query[0]);
    var value = tryDecodeURIComponent$1(query[1]);
    if (!value) {
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});
  return params;
};
var tryDecodeURIComponent$1 = function(value) {
  if (value === void 0) {
    value = "";
  }
  try {
    return decodeURIComponent(value);
  } catch (_a) {
    return "";
  }
};
var getStacktrace = function(ignoreDepth) {
  var trace = new Error().stack || "";
  return trace.split("\n").slice(2 + ignoreDepth).map(function(text) {
    return text.trim();
  });
};
var getClientLogConfig = function(client2) {
  return function() {
    var _a = __assign$1({}, client2.config), logger = _a.loggerProvider, logLevel = _a.logLevel;
    return {
      logger,
      logLevel
    };
  };
};
var getValueByStringPath = function(obj, path) {
  var e_1, _a;
  path = path.replace(/\[(\w+)\]/g, ".$1");
  path = path.replace(/^\./, "");
  try {
    for (var _b = __values$1(path.split(".")), _c = _b.next(); !_c.done; _c = _b.next()) {
      var attr = _c.value;
      if (attr in obj) {
        obj = obj[attr];
      } else {
        return;
      }
    }
  } catch (e_1_1) {
    e_1 = { error: e_1_1 };
  } finally {
    try {
      if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
    } finally {
      if (e_1) throw e_1.error;
    }
  }
  return obj;
};
var getClientStates = function(client2, paths) {
  return function() {
    var e_2, _a;
    var res = {};
    try {
      for (var paths_1 = __values$1(paths), paths_1_1 = paths_1.next(); !paths_1_1.done; paths_1_1 = paths_1.next()) {
        var path = paths_1_1.value;
        res[path] = getValueByStringPath(client2, path);
      }
    } catch (e_2_1) {
      e_2 = { error: e_2_1 };
    } finally {
      try {
        if (paths_1_1 && !paths_1_1.done && (_a = paths_1.return)) _a.call(paths_1);
      } finally {
        if (e_2) throw e_2.error;
      }
    }
    return res;
  };
};
var debugWrapper = function(fn, fnName, getLogConfig, getStates, fnContext) {
  if (fnContext === void 0) {
    fnContext = null;
  }
  return function() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    var _a = getLogConfig(), logger = _a.logger, logLevel = _a.logLevel;
    if (logLevel && logLevel < LogLevel.Debug || !logLevel || !logger) {
      return fn.apply(fnContext, args);
    }
    var debugContext = {
      type: "invoke public method",
      name: fnName,
      args,
      stacktrace: getStacktrace(1),
      time: {
        start: (/* @__PURE__ */ new Date()).toISOString()
      },
      states: {}
    };
    if (getStates && debugContext.states) {
      debugContext.states.before = getStates();
    }
    var result = fn.apply(fnContext, args);
    if (result && result.promise) {
      result.promise.then(function() {
        if (getStates && debugContext.states) {
          debugContext.states.after = getStates();
        }
        if (debugContext.time) {
          debugContext.time.end = (/* @__PURE__ */ new Date()).toISOString();
        }
        logger.debug(JSON.stringify(debugContext, null, 2));
      });
    } else {
      if (getStates && debugContext.states) {
        debugContext.states.after = getStates();
      }
      if (debugContext.time) {
        debugContext.time.end = (/* @__PURE__ */ new Date()).toISOString();
      }
      logger.debug(JSON.stringify(debugContext, null, 2));
    }
    return result;
  };
};
var isUrlMatchAllowlist = function(url, allowlist) {
  if (!allowlist || !allowlist.length) {
    return true;
  }
  return allowlist.some(function(allowedUrl) {
    if (typeof allowedUrl === "string") {
      return url === allowedUrl;
    }
    return url.match(allowedUrl);
  });
};
var MemoryStorage = (
  /** @class */
  function() {
    function MemoryStorage2() {
      this.memoryStorage = /* @__PURE__ */ new Map();
    }
    MemoryStorage2.prototype.isEnabled = function() {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          return [2, true];
        });
      });
    };
    MemoryStorage2.prototype.get = function(key) {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          return [2, this.memoryStorage.get(key)];
        });
      });
    };
    MemoryStorage2.prototype.getRaw = function(key) {
      return __awaiter(this, void 0, void 0, function() {
        var value;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              return [4, this.get(key)];
            case 1:
              value = _a.sent();
              return [2, value ? JSON.stringify(value) : void 0];
          }
        });
      });
    };
    MemoryStorage2.prototype.set = function(key, value) {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          this.memoryStorage.set(key, value);
          return [
            2
            /*return*/
          ];
        });
      });
    };
    MemoryStorage2.prototype.remove = function(key) {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          this.memoryStorage.delete(key);
          return [
            2
            /*return*/
          ];
        });
      });
    };
    MemoryStorage2.prototype.reset = function() {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          this.memoryStorage.clear();
          return [
            2
            /*return*/
          ];
        });
      });
    };
    return MemoryStorage2;
  }()
);
var CookieStorage = (
  /** @class */
  function() {
    function CookieStorage2(options) {
      this.options = __assign$1({}, options);
    }
    CookieStorage2.prototype.isEnabled = function() {
      return __awaiter(this, void 0, void 0, function() {
        var testStorage, testKey, value;
        return __generator(this, function(_b) {
          switch (_b.label) {
            case 0:
              if (!getGlobalScope$1()) {
                return [2, false];
              }
              CookieStorage2.testValue = String(Date.now());
              testStorage = new CookieStorage2(this.options);
              testKey = "AMP_TEST";
              _b.label = 1;
            case 1:
              _b.trys.push([1, 4, 5, 7]);
              return [4, testStorage.set(testKey, CookieStorage2.testValue)];
            case 2:
              _b.sent();
              return [4, testStorage.get(testKey)];
            case 3:
              value = _b.sent();
              return [2, value === CookieStorage2.testValue];
            case 4:
              _b.sent();
              return [2, false];
            case 5:
              return [4, testStorage.remove(testKey)];
            case 6:
              _b.sent();
              return [
                7
                /*endfinally*/
              ];
            case 7:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    CookieStorage2.prototype.get = function(key) {
      var _a;
      return __awaiter(this, void 0, void 0, function() {
        var value, decodedValue;
        return __generator(this, function(_b) {
          switch (_b.label) {
            case 0:
              return [4, this.getRaw(key)];
            case 1:
              value = _b.sent();
              if (!value) {
                return [2, void 0];
              }
              try {
                decodedValue = (_a = decodeCookiesAsDefault(value)) !== null && _a !== void 0 ? _a : decodeCookiesWithDoubleUrlEncoding(value);
                if (decodedValue === void 0) {
                  console.error("Amplitude Logger [Error]: Failed to decode cookie value for key: ".concat(key, ", value: ").concat(value));
                  return [2, void 0];
                }
                return [2, JSON.parse(decodedValue)];
              } catch (_c) {
                console.error("Amplitude Logger [Error]: Failed to parse cookie value for key: ".concat(key, ", value: ").concat(value));
                return [2, void 0];
              }
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    CookieStorage2.prototype.getRaw = function(key) {
      var _a, _b;
      return __awaiter(this, void 0, void 0, function() {
        var globalScope, cookie, match;
        return __generator(this, function(_c) {
          globalScope = getGlobalScope$1();
          cookie = (_b = (_a = globalScope === null || globalScope === void 0 ? void 0 : globalScope.document) === null || _a === void 0 ? void 0 : _a.cookie.split("; ")) !== null && _b !== void 0 ? _b : [];
          match = cookie.find(function(c2) {
            return c2.indexOf(key + "=") === 0;
          });
          if (!match) {
            return [2, void 0];
          }
          return [2, match.substring(key.length + 1)];
        });
      });
    };
    CookieStorage2.prototype.set = function(key, value) {
      var _a;
      return __awaiter(this, void 0, void 0, function() {
        var expirationDays, expires, expireDate, date, str, globalScope, errorMessage;
        return __generator(this, function(_b) {
          try {
            expirationDays = (_a = this.options.expirationDays) !== null && _a !== void 0 ? _a : 0;
            expires = value !== null ? expirationDays : -1;
            expireDate = void 0;
            if (expires) {
              date = /* @__PURE__ */ new Date();
              date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1e3);
              expireDate = date;
            }
            str = "".concat(key, "=").concat(btoa(encodeURIComponent(JSON.stringify(value))));
            if (expireDate) {
              str += "; expires=".concat(expireDate.toUTCString());
            }
            str += "; path=/";
            if (this.options.domain) {
              str += "; domain=".concat(this.options.domain);
            }
            if (this.options.secure) {
              str += "; Secure";
            }
            if (this.options.sameSite) {
              str += "; SameSite=".concat(this.options.sameSite);
            }
            globalScope = getGlobalScope$1();
            if (globalScope) {
              globalScope.document.cookie = str;
            }
          } catch (error) {
            errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Amplitude Logger [Error]: Failed to set cookie for key: ".concat(key, ". Error: ").concat(errorMessage));
          }
          return [
            2
            /*return*/
          ];
        });
      });
    };
    CookieStorage2.prototype.remove = function(key) {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              return [4, this.set(key, null)];
            case 1:
              _a.sent();
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    CookieStorage2.prototype.reset = function() {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          return [
            2
            /*return*/
          ];
        });
      });
    };
    return CookieStorage2;
  }()
);
var decodeCookiesAsDefault = function(value) {
  try {
    return decodeURIComponent(atob(value));
  } catch (_a) {
    return void 0;
  }
};
var decodeCookiesWithDoubleUrlEncoding = function(value) {
  try {
    return decodeURIComponent(atob(decodeURIComponent(value)));
  } catch (_a) {
    return void 0;
  }
};
var getStorageKey = function(apiKey, postKey, limit) {
  if (postKey === void 0) {
    postKey = "";
  }
  if (limit === void 0) {
    limit = 10;
  }
  return [AMPLITUDE_PREFIX, postKey, apiKey.substring(0, limit)].filter(Boolean).join("_");
};
var BrowserStorage = (
  /** @class */
  function() {
    function BrowserStorage2(storage) {
      this.storage = storage;
    }
    BrowserStorage2.prototype.isEnabled = function() {
      return __awaiter(this, void 0, void 0, function() {
        var random, testStorage, testKey, value;
        return __generator(this, function(_b) {
          switch (_b.label) {
            case 0:
              if (!this.storage) {
                return [2, false];
              }
              random = String(Date.now());
              testStorage = new BrowserStorage2(this.storage);
              testKey = "AMP_TEST";
              _b.label = 1;
            case 1:
              _b.trys.push([1, 4, 5, 7]);
              return [4, testStorage.set(testKey, random)];
            case 2:
              _b.sent();
              return [4, testStorage.get(testKey)];
            case 3:
              value = _b.sent();
              return [2, value === random];
            case 4:
              _b.sent();
              return [2, false];
            case 5:
              return [4, testStorage.remove(testKey)];
            case 6:
              _b.sent();
              return [
                7
                /*endfinally*/
              ];
            case 7:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    BrowserStorage2.prototype.get = function(key) {
      return __awaiter(this, void 0, void 0, function() {
        var value;
        return __generator(this, function(_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, , 3]);
              return [4, this.getRaw(key)];
            case 1:
              value = _b.sent();
              if (!value) {
                return [2, void 0];
              }
              return [2, JSON.parse(value)];
            case 2:
              _b.sent();
              console.error("[Amplitude] Error: Could not get value from storage");
              return [2, void 0];
            case 3:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    BrowserStorage2.prototype.getRaw = function(key) {
      var _a;
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_b) {
          return [2, ((_a = this.storage) === null || _a === void 0 ? void 0 : _a.getItem(key)) || void 0];
        });
      });
    };
    BrowserStorage2.prototype.set = function(key, value) {
      var _a;
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_b) {
          try {
            (_a = this.storage) === null || _a === void 0 ? void 0 : _a.setItem(key, JSON.stringify(value));
          } catch (_c) {
          }
          return [
            2
            /*return*/
          ];
        });
      });
    };
    BrowserStorage2.prototype.remove = function(key) {
      var _a;
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_b) {
          try {
            (_a = this.storage) === null || _a === void 0 ? void 0 : _a.removeItem(key);
          } catch (_c) {
          }
          return [
            2
            /*return*/
          ];
        });
      });
    };
    BrowserStorage2.prototype.reset = function() {
      var _a;
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_b) {
          try {
            (_a = this.storage) === null || _a === void 0 ? void 0 : _a.clear();
          } catch (_c) {
          }
          return [
            2
            /*return*/
          ];
        });
      });
    };
    return BrowserStorage2;
  }()
);
var BaseTransport$1 = (
  /** @class */
  function() {
    function BaseTransport2() {
    }
    BaseTransport2.prototype.send = function(_serverUrl, _payload) {
      return Promise.resolve(null);
    };
    BaseTransport2.prototype.buildResponse = function(responseJSON) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
      if (typeof responseJSON !== "object") {
        return null;
      }
      var statusCode = responseJSON.code || 0;
      var status = this.buildStatus(statusCode);
      switch (status) {
        case Status$1.Success:
          return {
            status,
            statusCode,
            body: {
              eventsIngested: (_a = responseJSON.events_ingested) !== null && _a !== void 0 ? _a : 0,
              payloadSizeBytes: (_b = responseJSON.payload_size_bytes) !== null && _b !== void 0 ? _b : 0,
              serverUploadTime: (_c = responseJSON.server_upload_time) !== null && _c !== void 0 ? _c : 0
            }
          };
        case Status$1.Invalid:
          return {
            status,
            statusCode,
            body: {
              error: (_d = responseJSON.error) !== null && _d !== void 0 ? _d : "",
              missingField: (_e = responseJSON.missing_field) !== null && _e !== void 0 ? _e : "",
              eventsWithInvalidFields: (_f = responseJSON.events_with_invalid_fields) !== null && _f !== void 0 ? _f : {},
              eventsWithMissingFields: (_g = responseJSON.events_with_missing_fields) !== null && _g !== void 0 ? _g : {},
              eventsWithInvalidIdLengths: (_h = responseJSON.events_with_invalid_id_lengths) !== null && _h !== void 0 ? _h : {},
              epsThreshold: (_j = responseJSON.eps_threshold) !== null && _j !== void 0 ? _j : 0,
              exceededDailyQuotaDevices: (_k = responseJSON.exceeded_daily_quota_devices) !== null && _k !== void 0 ? _k : {},
              silencedDevices: (_l = responseJSON.silenced_devices) !== null && _l !== void 0 ? _l : [],
              silencedEvents: (_m = responseJSON.silenced_events) !== null && _m !== void 0 ? _m : [],
              throttledDevices: (_o = responseJSON.throttled_devices) !== null && _o !== void 0 ? _o : {},
              throttledEvents: (_p = responseJSON.throttled_events) !== null && _p !== void 0 ? _p : []
            }
          };
        case Status$1.PayloadTooLarge:
          return {
            status,
            statusCode,
            body: {
              error: (_q = responseJSON.error) !== null && _q !== void 0 ? _q : ""
            }
          };
        case Status$1.RateLimit:
          return {
            status,
            statusCode,
            body: {
              error: (_r = responseJSON.error) !== null && _r !== void 0 ? _r : "",
              epsThreshold: (_s = responseJSON.eps_threshold) !== null && _s !== void 0 ? _s : 0,
              throttledDevices: (_t = responseJSON.throttled_devices) !== null && _t !== void 0 ? _t : {},
              throttledUsers: (_u = responseJSON.throttled_users) !== null && _u !== void 0 ? _u : {},
              exceededDailyQuotaDevices: (_v = responseJSON.exceeded_daily_quota_devices) !== null && _v !== void 0 ? _v : {},
              exceededDailyQuotaUsers: (_w = responseJSON.exceeded_daily_quota_users) !== null && _w !== void 0 ? _w : {},
              throttledEvents: (_x = responseJSON.throttled_events) !== null && _x !== void 0 ? _x : []
            }
          };
        case Status$1.Timeout:
        default:
          return {
            status,
            statusCode
          };
      }
    };
    BaseTransport2.prototype.buildStatus = function(code) {
      if (code >= 200 && code < 300) {
        return Status$1.Success;
      }
      if (code === 429) {
        return Status$1.RateLimit;
      }
      if (code === 413) {
        return Status$1.PayloadTooLarge;
      }
      if (code === 408) {
        return Status$1.Timeout;
      }
      if (code >= 400 && code < 500) {
        return Status$1.Invalid;
      }
      if (code >= 500) {
        return Status$1.Failed;
      }
      return Status$1.Unknown;
    };
    return BaseTransport2;
  }()
);
var FetchTransport = (
  /** @class */
  function(_super) {
    __extends(FetchTransport2, _super);
    function FetchTransport2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    FetchTransport2.prototype.send = function(serverUrl, payload) {
      return __awaiter(this, void 0, void 0, function() {
        var options, response, responseText;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              if (typeof fetch === "undefined") {
                throw new Error("FetchTransport is not supported");
              }
              options = {
                headers: {
                  "Content-Type": "application/json",
                  Accept: "*/*"
                },
                body: JSON.stringify(payload),
                method: "POST"
              };
              return [4, fetch(serverUrl, options)];
            case 1:
              response = _a.sent();
              return [4, response.text()];
            case 2:
              responseText = _a.sent();
              try {
                return [2, this.buildResponse(JSON.parse(responseText))];
              } catch (_b) {
                return [2, this.buildResponse({ code: response.status })];
              }
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    return FetchTransport2;
  }(BaseTransport$1)
);
var ServerZone$1;
(function(ServerZone2) {
  ServerZone2["US"] = "US";
  ServerZone2["EU"] = "EU";
  ServerZone2["STAGING"] = "STAGING";
})(ServerZone$1 || (ServerZone$1 = {}));
var OfflineDisabled = null;
var DEFAULT_CSS_SELECTOR_ALLOWLIST = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "video",
  "audio",
  '[contenteditable="true" i]',
  "[data-amp-default-track]",
  ".amp-default-track"
];
var DEFAULT_DATA_ATTRIBUTE_PREFIX = "data-amp-track-";
var DEFAULT_ACTION_CLICK_ALLOWLIST = ["div", "span", "h1", "h2", "h3", "h4", "h5", "h6"];
var CLICKABLE_ELEMENT_SELECTORS = [
  "a",
  "button",
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="treeitem"]',
  '[contenteditable="true" i]'
];
var DEFAULT_DEAD_CLICK_ALLOWLIST = __spreadArray([
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="reset"]',
  'input[type="image"]',
  'input[type="file"]'
], __read$1(CLICKABLE_ELEMENT_SELECTORS), false);
var DEFAULT_RAGE_CLICK_ALLOWLIST = ["*"];
var DEFAULT_RAGE_CLICK_WINDOW_MS = 1e3;
var DEFAULT_RAGE_CLICK_THRESHOLD = 4;
var DEFAULT_RAGE_CLICK_OUT_OF_BOUNDS_THRESHOLD = 50;
function isJsonPrimitive(json) {
  return typeof json === "string" || typeof json === "number" || typeof json === "boolean" || json === null || json === void 0;
}
function pruneJson(json, allowlist, excludelist) {
  if (!json)
    return;
  var allowlistTokens = allowlist.map(tokenizeJsonPath);
  var excludelistTokens = excludelist.map(tokenizeJsonPath);
  _pruneJson({
    json,
    allowlist: allowlistTokens,
    excludelist: excludelistTokens,
    ancestors: []
  });
}
function _pruneJson(_a) {
  var e_1, _b;
  var json = _a.json, targetObject = _a.targetObject, allowlist = _a.allowlist, excludelist = _a.excludelist, ancestors = _a.ancestors, parentObject = _a.parentObject, targetKey = _a.targetKey;
  if (!targetObject) {
    targetObject = json;
  }
  var keys = Object.keys(targetObject);
  try {
    for (var keys_1 = __values$1(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
      var key = keys_1_1.value;
      var path = __spreadArray(__spreadArray([], __read$1(ancestors), false), [key], false);
      if (isJsonPrimitive(targetObject[key])) {
        if (!hasPathMatchInList(path, allowlist) || hasPathMatchInList(path, excludelist)) {
          delete targetObject[key];
        }
      } else {
        _pruneJson({
          json,
          targetObject: targetObject[key],
          allowlist,
          excludelist,
          ancestors: path,
          parentObject: targetObject,
          targetKey: key
        });
      }
    }
  } catch (e_1_1) {
    e_1 = { error: e_1_1 };
  } finally {
    try {
      if (keys_1_1 && !keys_1_1.done && (_b = keys_1.return)) _b.call(keys_1);
    } finally {
      if (e_1) throw e_1.error;
    }
  }
  if (Object.keys(targetObject).length === 0 && parentObject && targetKey) {
    delete parentObject[targetKey];
  }
}
function tokenizeJsonPath(path) {
  if (path.startsWith("/")) {
    path = path.slice(1);
  }
  return path.split("/").map(function(token) {
    return token.replace(/~0/g, "~").replace(/~1/g, "/");
  });
}
function isPathMatch(path, pathMatcher, i2, j) {
  if (i2 === void 0) {
    i2 = 0;
  }
  if (j === void 0) {
    j = 0;
  }
  if (j === pathMatcher.length) {
    return i2 === path.length;
  }
  if (i2 === path.length) {
    while (j < pathMatcher.length && pathMatcher[j] === "**") {
      j++;
    }
    return j === pathMatcher.length;
  }
  var currentMatcher = pathMatcher[j];
  if (currentMatcher === "**") {
    if (j + 1 === pathMatcher.length) {
      return true;
    }
    for (var k2 = i2; k2 <= path.length; k2++) {
      if (isPathMatch(path, pathMatcher, k2, j + 1)) {
        return true;
      }
    }
    return false;
  } else if (currentMatcher === "*" || currentMatcher === path[i2]) {
    return isPathMatch(path, pathMatcher, i2 + 1, j + 1);
  } else {
    return false;
  }
}
function hasPathMatchInList(path, allowOrExcludeList) {
  return allowOrExcludeList.some(function(l2) {
    return isPathMatch(path, l2);
  });
}
var TEXT_READ_TIMEOUT = 500;
var MAXIMUM_ENTRIES = 100;
var RequestWrapperFetch = (
  /** @class */
  function() {
    function RequestWrapperFetch2(request) {
      this.request = request;
    }
    RequestWrapperFetch2.prototype.headers = function(allow) {
      var e_1, _a;
      if (allow === void 0) {
        allow = [];
      }
      var headersUnsafe = this.request.headers;
      var headersSafeCopy = {};
      if (Array.isArray(headersUnsafe)) {
        headersUnsafe.forEach(function(_a2) {
          var _b2 = __read$1(_a2, 2), headerName = _b2[0], headerValue = _b2[1];
          headersSafeCopy[headerName] = headerValue;
        });
      } else if (headersUnsafe instanceof Headers) {
        headersUnsafe.forEach(function(value2, key2) {
          headersSafeCopy[key2] = value2;
        });
      } else if (typeof headersUnsafe === "object" && headersUnsafe !== null) {
        try {
          for (var _b = __values$1(Object.entries(headersUnsafe)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read$1(_c.value, 2), key = _d[0], value = _d[1];
            headersSafeCopy[key] = value;
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
      }
      return pruneHeaders(headersSafeCopy, { allow });
    };
    Object.defineProperty(RequestWrapperFetch2.prototype, "bodySize", {
      get: function() {
        if (typeof this._bodySize === "number")
          return this._bodySize;
        var global = getGlobalScope$1();
        if (!(global === null || global === void 0 ? void 0 : global.TextEncoder)) {
          return;
        }
        var body = this.request.body;
        this._bodySize = getBodySize(body, MAXIMUM_ENTRIES);
        return this._bodySize;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(RequestWrapperFetch2.prototype, "method", {
      get: function() {
        return this.request.method;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(RequestWrapperFetch2.prototype, "body", {
      get: function() {
        if (typeof this.request.body === "string") {
          return this.request.body;
        }
        return null;
      },
      enumerable: false,
      configurable: true
    });
    RequestWrapperFetch2.prototype.json = function(allow, exclude) {
      if (allow === void 0) {
        allow = [];
      }
      if (exclude === void 0) {
        exclude = [];
      }
      return __awaiter(this, void 0, void 0, function() {
        var text;
        return __generator(this, function(_a) {
          if (allow.length === 0) {
            return [2, null];
          }
          text = this.body;
          return [2, safeParseAndPruneBody(text, allow, exclude)];
        });
      });
    };
    return RequestWrapperFetch2;
  }()
);
var RequestWrapperXhr = (
  /** @class */
  function() {
    function RequestWrapperXhr2(bodyRaw, requestHeaders) {
      this.bodyRaw = bodyRaw;
      this.requestHeaders = requestHeaders;
    }
    RequestWrapperXhr2.prototype.headers = function(allow) {
      if (allow === void 0) {
        allow = [];
      }
      return pruneHeaders(this.requestHeaders, { allow });
    };
    Object.defineProperty(RequestWrapperXhr2.prototype, "bodySize", {
      get: function() {
        return getBodySize(this.bodyRaw, MAXIMUM_ENTRIES);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(RequestWrapperXhr2.prototype, "body", {
      get: function() {
        if (typeof this.bodyRaw === "string") {
          return this.bodyRaw;
        }
        return null;
      },
      enumerable: false,
      configurable: true
    });
    RequestWrapperXhr2.prototype.json = function(allow, exclude) {
      if (allow === void 0) {
        allow = [];
      }
      if (exclude === void 0) {
        exclude = [];
      }
      return __awaiter(this, void 0, void 0, function() {
        var text;
        return __generator(this, function(_a) {
          if (allow.length === 0) {
            return [2, null];
          }
          text = this.body;
          return [2, safeParseAndPruneBody(text, allow, exclude)];
        });
      });
    };
    return RequestWrapperXhr2;
  }()
);
function getBodySize(bodyUnsafe, maxEntries) {
  var e_2, _a;
  var bodySize;
  var global = getGlobalScope$1();
  var TextEncoder = global === null || global === void 0 ? void 0 : global.TextEncoder;
  if (!TextEncoder) {
    return;
  }
  var bodySafe;
  if (typeof bodyUnsafe === "string") {
    bodySafe = bodyUnsafe;
    bodySize = new TextEncoder().encode(bodySafe).length;
  } else if (bodyUnsafe instanceof Blob) {
    bodySafe = bodyUnsafe;
    bodySize = bodySafe.size;
  } else if (bodyUnsafe instanceof URLSearchParams) {
    bodySafe = bodyUnsafe;
    bodySize = new TextEncoder().encode(bodySafe.toString()).length;
  } else if (ArrayBuffer.isView(bodyUnsafe)) {
    bodySafe = bodyUnsafe;
    bodySize = bodySafe.byteLength;
  } else if (bodyUnsafe instanceof ArrayBuffer) {
    bodySafe = bodyUnsafe;
    bodySize = bodySafe.byteLength;
  } else if (bodyUnsafe instanceof FormData) {
    var formData = bodyUnsafe;
    var total = 0;
    var count = 0;
    try {
      for (var _b = __values$1(formData.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
        var _d = __read$1(_c.value, 2), key = _d[0], value = _d[1];
        total += key.length;
        if (typeof value === "string") {
          total += new TextEncoder().encode(value).length;
        } else if (value instanceof Blob) {
          total += value.size;
        } else {
          return;
        }
        if (++count >= maxEntries) {
          return;
        }
      }
    } catch (e_2_1) {
      e_2 = { error: e_2_1 };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
      } finally {
        if (e_2) throw e_2.error;
      }
    }
    bodySize = total;
  } else if (bodyUnsafe instanceof ReadableStream) {
    bodySafe = bodyUnsafe;
    return;
  }
  return bodySize;
}
var ResponseWrapperFetch = (
  /** @class */
  function() {
    function ResponseWrapperFetch2(response) {
      this.response = response;
    }
    ResponseWrapperFetch2.prototype.headers = function(allow) {
      var _a;
      if (allow === void 0) {
        allow = [];
      }
      if (this.response.headers instanceof Headers) {
        var headersSafe = this.response.headers;
        var headersOut_1 = {};
        (_a = headersSafe === null || headersSafe === void 0 ? void 0 : headersSafe.forEach) === null || _a === void 0 ? void 0 : _a.call(headersSafe, function(value, key) {
          headersOut_1[key] = value;
        });
        return pruneHeaders(headersOut_1, { allow });
      }
      return;
    };
    Object.defineProperty(ResponseWrapperFetch2.prototype, "bodySize", {
      get: function() {
        var _a, _b;
        if (this._bodySize !== void 0)
          return this._bodySize;
        var contentLength = (_b = (_a = this.response.headers) === null || _a === void 0 ? void 0 : _a.get) === null || _b === void 0 ? void 0 : _b.call(_a, "content-length");
        var bodySize = contentLength ? parseInt(contentLength, 10) : void 0;
        this._bodySize = bodySize;
        return bodySize;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(ResponseWrapperFetch2.prototype, "status", {
      get: function() {
        return this.response.status;
      },
      enumerable: false,
      configurable: true
    });
    ResponseWrapperFetch2.prototype.text = function() {
      return __awaiter(this, void 0, void 0, function() {
        var textPromise, timer2, text;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              if (!this.clonedResponse) {
                this.clonedResponse = this.response.clone();
              }
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              textPromise = this.clonedResponse.text();
              timer2 = new Promise(function(resolve) {
                return setTimeout(
                  /* istanbul ignore next */
                  function() {
                    return resolve(null);
                  },
                  TEXT_READ_TIMEOUT
                );
              });
              return [4, Promise.race([textPromise, timer2])];
            case 2:
              text = _a.sent();
              return [2, text];
            case 3:
              _a.sent();
              return [2, null];
            case 4:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    ResponseWrapperFetch2.prototype.json = function(allow, exclude) {
      if (allow === void 0) {
        allow = [];
      }
      if (exclude === void 0) {
        exclude = [];
      }
      return __awaiter(this, void 0, void 0, function() {
        var text;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              if (allow.length === 0) {
                return [2, null];
              }
              return [4, this.text()];
            case 1:
              text = _a.sent();
              return [2, safeParseAndPruneBody(text, allow, exclude)];
          }
        });
      });
    };
    return ResponseWrapperFetch2;
  }()
);
var ResponseWrapperXhr = (
  /** @class */
  function() {
    function ResponseWrapperXhr2(statusCode, headersString, size, getJson) {
      this.statusCode = statusCode;
      this.headersString = headersString;
      this.size = size;
      this.getJson = getJson;
    }
    Object.defineProperty(ResponseWrapperXhr2.prototype, "bodySize", {
      get: function() {
        return this.size;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(ResponseWrapperXhr2.prototype, "status", {
      get: function() {
        return this.statusCode;
      },
      enumerable: false,
      configurable: true
    });
    ResponseWrapperXhr2.prototype.headers = function(allow) {
      var e_3, _a;
      if (allow === void 0) {
        allow = [];
      }
      if (!this.headersString) {
        return {};
      }
      var headers = {};
      var headerLines = this.headersString.split("\r\n");
      try {
        for (var headerLines_1 = __values$1(headerLines), headerLines_1_1 = headerLines_1.next(); !headerLines_1_1.done; headerLines_1_1 = headerLines_1.next()) {
          var line = headerLines_1_1.value;
          var _b = __read$1(line.split(": "), 2), key = _b[0], value = _b[1];
          if (key && value) {
            headers[key] = value;
          }
        }
      } catch (e_3_1) {
        e_3 = { error: e_3_1 };
      } finally {
        try {
          if (headerLines_1_1 && !headerLines_1_1.done && (_a = headerLines_1.return)) _a.call(headerLines_1);
        } finally {
          if (e_3) throw e_3.error;
        }
      }
      return pruneHeaders(headers, { allow });
    };
    ResponseWrapperXhr2.prototype.json = function(allow, exclude) {
      if (allow === void 0) {
        allow = [];
      }
      if (exclude === void 0) {
        exclude = [];
      }
      return __awaiter(this, void 0, void 0, function() {
        var jsonBody;
        return __generator(this, function(_a) {
          if (allow.length === 0) {
            return [2, null];
          }
          jsonBody = this.getJson();
          if (jsonBody) {
            pruneJson(jsonBody, allow, exclude);
            return [2, jsonBody];
          }
          return [2, null];
        });
      });
    };
    return ResponseWrapperXhr2;
  }()
);
function safeParseAndPruneBody(text, allow, exclude) {
  if (!text)
    return null;
  try {
    var json = JSON.parse(text);
    pruneJson(json, allow, exclude);
    return json;
  } catch (error) {
    return null;
  }
}
var PRUNE_STRATEGY;
(function(PRUNE_STRATEGY2) {
  PRUNE_STRATEGY2["REDACT"] = "redact";
  PRUNE_STRATEGY2["REMOVE"] = "remove";
})(PRUNE_STRATEGY || (PRUNE_STRATEGY = {}));
var REDACTED_VALUE = "[REDACTED]";
var pruneHeaders = function(headers, options) {
  var e_4, _a;
  var _b = options.allow, allow = _b === void 0 ? [] : _b, _c = options.strategy, strategy = _c === void 0 ? PRUNE_STRATEGY.REMOVE : _c;
  var exclude = __spreadArray([], __read$1(FORBIDDEN_HEADERS), false);
  var headersPruned = {};
  var _loop_1 = function(key2) {
    var lowerKey = key2.toLowerCase();
    if (exclude.find(function(e2) {
      return e2.toLowerCase() === lowerKey;
    })) {
      if (strategy === PRUNE_STRATEGY.REDACT) {
        headersPruned[key2] = REDACTED_VALUE;
      }
    } else if (!allow.find(function(i2) {
      return i2.toLowerCase() === lowerKey;
    })) {
      if (strategy === PRUNE_STRATEGY.REDACT) {
        headersPruned[key2] = REDACTED_VALUE;
      }
    } else {
      headersPruned[key2] = headers[key2];
    }
  };
  try {
    for (var _d = __values$1(Object.keys(headers)), _e = _d.next(); !_e.done; _e = _d.next()) {
      var key = _e.value;
      _loop_1(key);
    }
  } catch (e_4_1) {
    e_4 = { error: e_4_1 };
  } finally {
    try {
      if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
    } finally {
      if (e_4) throw e_4.error;
    }
  }
  return headersPruned;
};
var NetworkRequestEvent = (
  /** @class */
  function() {
    function NetworkRequestEvent2(type, method, timestamp, startTime, url, requestWrapper, status, duration, responseWrapper, error, endTime) {
      if (status === void 0) {
        status = 0;
      }
      this.type = type;
      this.method = method;
      this.timestamp = timestamp;
      this.startTime = startTime;
      this.url = url;
      this.requestWrapper = requestWrapper;
      this.status = status;
      this.duration = duration;
      this.responseWrapper = responseWrapper;
      this.error = error;
      this.endTime = endTime;
    }
    NetworkRequestEvent2.prototype.toSerializable = function() {
      var _a, _b, _c, _d;
      var serialized = {
        type: this.type,
        method: this.method,
        url: this.url,
        timestamp: this.timestamp,
        status: this.status,
        duration: this.duration,
        error: this.error,
        startTime: this.startTime,
        endTime: this.endTime,
        requestHeaders: (_a = this.requestWrapper) === null || _a === void 0 ? void 0 : _a.headers(__spreadArray([], __read$1(SAFE_HEADERS), false)),
        requestBodySize: (_b = this.requestWrapper) === null || _b === void 0 ? void 0 : _b.bodySize,
        responseHeaders: (_c = this.responseWrapper) === null || _c === void 0 ? void 0 : _c.headers(__spreadArray([], __read$1(SAFE_HEADERS), false)),
        responseBodySize: (_d = this.responseWrapper) === null || _d === void 0 ? void 0 : _d.bodySize
      };
      return Object.fromEntries(Object.entries(serialized).filter(function(_a2) {
        var _b2 = __read$1(_a2, 2), v2 = _b2[1];
        return v2 !== void 0;
      }));
    };
    return NetworkRequestEvent2;
  }()
);
function isRequest(requestInfo) {
  return typeof requestInfo === "object" && requestInfo !== null && "url" in requestInfo && "method" in requestInfo;
}
var NetworkEventCallback = (
  /** @class */
  /* @__PURE__ */ function() {
    function NetworkEventCallback2(callback, id) {
      if (id === void 0) {
        id = UUID();
      }
      this.callback = callback;
      this.id = id;
    }
    return NetworkEventCallback2;
  }()
);
var NetworkObserver = (
  /** @class */
  function() {
    function NetworkObserver2(logger) {
      this.eventCallbacks = /* @__PURE__ */ new Map();
      this.isObserving = false;
      this.logger = logger;
      var globalScope = getGlobalScope$1();
      if (!NetworkObserver2.isSupported()) {
        return;
      }
      this.globalScope = globalScope;
    }
    NetworkObserver2.isSupported = function() {
      var globalScope = getGlobalScope$1();
      return !!globalScope && !!globalScope.fetch;
    };
    NetworkObserver2.prototype.subscribe = function(eventCallback, logger) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
      if (!this.logger) {
        this.logger = logger;
      }
      this.eventCallbacks.set(eventCallback.id, eventCallback);
      if (!this.isObserving) {
        var originalXhrOpen = (_c = (_b = (_a = this.globalScope) === null || _a === void 0 ? void 0 : _a.XMLHttpRequest) === null || _b === void 0 ? void 0 : _b.prototype) === null || _c === void 0 ? void 0 : _c.open;
        var originalXhrSend = (_f = (_e = (_d = this.globalScope) === null || _d === void 0 ? void 0 : _d.XMLHttpRequest) === null || _e === void 0 ? void 0 : _e.prototype) === null || _f === void 0 ? void 0 : _f.send;
        var originalXhrSetRequestHeader = (_j = (_h = (_g = this.globalScope) === null || _g === void 0 ? void 0 : _g.XMLHttpRequest) === null || _h === void 0 ? void 0 : _h.prototype) === null || _j === void 0 ? void 0 : _j.setRequestHeader;
        if (originalXhrOpen && originalXhrSend && originalXhrSetRequestHeader) {
          this.observeXhr(originalXhrOpen, originalXhrSend, originalXhrSetRequestHeader);
        }
        var originalFetch = (_k = this.globalScope) === null || _k === void 0 ? void 0 : _k.fetch;
        if (originalFetch) {
          this.observeFetch(originalFetch);
        }
        this.isObserving = true;
      }
    };
    NetworkObserver2.prototype.unsubscribe = function(eventCallback) {
      this.eventCallbacks.delete(eventCallback.id);
    };
    NetworkObserver2.prototype.triggerEventCallbacks = function(event) {
      var _this = this;
      this.eventCallbacks.forEach(function(callback) {
        var _a;
        try {
          callback.callback(event);
        } catch (err) {
          (_a = _this.logger) === null || _a === void 0 ? void 0 : _a.debug("an unexpected error occurred while triggering event callbacks", err);
        }
      });
    };
    NetworkObserver2.prototype.handleNetworkRequestEvent = function(requestType, requestInfo, requestWrapper, responseWrapper, typedError, startTime, durationStart) {
      var _a, _b;
      if (startTime === void 0 || durationStart === void 0) {
        return;
      }
      var url;
      var method = "GET";
      if (isRequest(requestInfo)) {
        url = requestInfo["url"];
        method = requestInfo["method"];
      } else {
        url = (_a = requestInfo === null || requestInfo === void 0 ? void 0 : requestInfo.toString) === null || _a === void 0 ? void 0 : _a.call(requestInfo);
      }
      if (url) {
        try {
          var parsedUrl = new URL(url);
          url = "".concat(parsedUrl.protocol, "//").concat(parsedUrl.host).concat(parsedUrl.pathname).concat(parsedUrl.search).concat(parsedUrl.hash);
        } catch (err) {
          (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error("an unexpected error occurred while parsing the URL", err);
        }
      }
      method = (requestWrapper === null || requestWrapper === void 0 ? void 0 : requestWrapper.method) || method;
      var status, error;
      if (responseWrapper) {
        status = responseWrapper.status;
      }
      if (typedError) {
        error = {
          name: typedError.name || "UnknownError",
          message: typedError.message || "An unknown error occurred"
        };
        status = 0;
      }
      var duration = Math.floor(performance.now() - durationStart);
      var endTime = Math.floor(startTime + duration);
      var requestEvent = new NetworkRequestEvent(
        requestType,
        method,
        startTime,
        // timestamp and startTime are aliases
        startTime,
        url,
        requestWrapper,
        status,
        duration,
        responseWrapper,
        error,
        endTime
      );
      this.triggerEventCallbacks(requestEvent);
    };
    NetworkObserver2.prototype.getTimestamps = function() {
      var _a, _b;
      return {
        startTime: (_a = Date.now) === null || _a === void 0 ? void 0 : _a.call(Date),
        durationStart: (_b = performance === null || performance === void 0 ? void 0 : performance.now) === null || _b === void 0 ? void 0 : _b.call(performance)
      };
    };
    NetworkObserver2.prototype.observeFetch = function(originalFetch) {
      var _this = this;
      if (!this.globalScope || !originalFetch) {
        return;
      }
      this.globalScope.fetch = function(requestInfo, requestInit) {
        return __awaiter(_this, void 0, void 0, function() {
          var timestamps, originalResponse, originalError, err_1;
          var _a, _b;
          return __generator(this, function(_c) {
            switch (_c.label) {
              case 0:
                try {
                  timestamps = this.getTimestamps();
                } catch (error) {
                  (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug("an unexpected error occurred while retrieving timestamps", error);
                }
                _c.label = 1;
              case 1:
                _c.trys.push([1, 3, , 4]);
                return [4, originalFetch(requestInfo, requestInit)];
              case 2:
                originalResponse = _c.sent();
                return [3, 4];
              case 3:
                err_1 = _c.sent();
                originalError = err_1;
                return [3, 4];
              case 4:
                try {
                  this.handleNetworkRequestEvent(
                    "fetch",
                    requestInfo,
                    requestInit ? new RequestWrapperFetch(requestInit) : void 0,
                    originalResponse ? new ResponseWrapperFetch(originalResponse) : void 0,
                    originalError,
                    /* istanbul ignore next */
                    timestamps === null || timestamps === void 0 ? void 0 : timestamps.startTime,
                    /* istanbul ignore next */
                    timestamps === null || timestamps === void 0 ? void 0 : timestamps.durationStart
                  );
                } catch (err) {
                  (_b = this.logger) === null || _b === void 0 ? void 0 : _b.debug("an unexpected error occurred while handling fetch", err);
                }
                if (originalResponse) {
                  return [2, originalResponse];
                } else {
                  throw originalError;
                }
            }
          });
        });
      };
    };
    NetworkObserver2.createXhrJsonParser = function(xhrUnsafe, context) {
      return function() {
        var _a, _b;
        try {
          if (xhrUnsafe.responseType === "json") {
            if ((_a = context.globalScope) === null || _a === void 0 ? void 0 : _a.structuredClone) {
              return context.globalScope.structuredClone(xhrUnsafe.response);
            }
          } else if (["text", ""].includes(xhrUnsafe.responseType)) {
            return JSON.parse(xhrUnsafe.responseText);
          }
        } catch (err) {
          if (err instanceof Error && err.name === "InvalidStateError") {
            (_b = context.logger) === null || _b === void 0 ? void 0 : _b.error("unexpected error when retrieving responseText. responseType='".concat(xhrUnsafe.responseType, "'"));
          }
          return null;
        }
        return null;
      };
    };
    NetworkObserver2.prototype.observeXhr = function(originalXhrOpen, originalXhrSend, originalXhrSetRequestHeader) {
      if (!this.globalScope || !originalXhrOpen || !originalXhrSend) {
        return;
      }
      var xhrProto = this.globalScope.XMLHttpRequest.prototype;
      var networkObserverContext = this;
      xhrProto.open = function() {
        var _a, _b;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var xhrSafe = this;
        var _c = __read$1(args, 2), method = _c[0], url = _c[1];
        try {
          xhrSafe.$$AmplitudeAnalyticsEvent = __assign$1({ method, url: (_a = url === null || url === void 0 ? void 0 : url.toString) === null || _a === void 0 ? void 0 : _a.call(url), headers: {} }, networkObserverContext.getTimestamps());
        } catch (err) {
          (_b = networkObserverContext.logger) === null || _b === void 0 ? void 0 : _b.error("an unexpected error occurred while calling xhr open", err);
        }
        return originalXhrOpen.apply(xhrSafe, args);
      };
      xhrProto.send = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var xhrUnsafe = this;
        var xhrSafe = xhrUnsafe;
        var getJson = NetworkObserver2.createXhrJsonParser(xhrUnsafe, networkObserverContext);
        var body = args[0];
        var requestEvent = xhrSafe.$$AmplitudeAnalyticsEvent;
        xhrSafe.addEventListener("loadend", function() {
          var _a;
          try {
            var responseHeaders = xhrSafe.getAllResponseHeaders();
            var responseBodySize = xhrSafe.getResponseHeader("content-length");
            var responseWrapper = new ResponseWrapperXhr(
              xhrSafe.status,
              responseHeaders,
              /* istanbul ignore next */
              responseBodySize ? parseInt(responseBodySize, 10) : void 0,
              getJson
            );
            var requestHeaders = xhrSafe.$$AmplitudeAnalyticsEvent.headers;
            var requestWrapper = new RequestWrapperXhr(body, requestHeaders);
            requestEvent.status = xhrSafe.status;
            networkObserverContext.handleNetworkRequestEvent("xhr", { url: requestEvent.url, method: requestEvent.method }, requestWrapper, responseWrapper, void 0, requestEvent.startTime, requestEvent.durationStart);
          } catch (err) {
            (_a = networkObserverContext.logger) === null || _a === void 0 ? void 0 : _a.error("an unexpected error occurred while handling xhr send", err);
          }
        });
        return originalXhrSend.apply(xhrSafe, args);
      };
      xhrProto.setRequestHeader = function(headerName, headerValue) {
        var _a;
        var xhrSafe = this;
        try {
          xhrSafe.$$AmplitudeAnalyticsEvent.headers[headerName] = headerValue;
        } catch (err) {
          (_a = networkObserverContext.logger) === null || _a === void 0 ? void 0 : _a.error("an unexpected error occurred while calling xhr setRequestHeader", err);
        }
        originalXhrSetRequestHeader.apply(xhrSafe, [headerName, headerValue]);
      };
    };
    return NetworkObserver2;
  }()
);
var networkObserver = new NetworkObserver();
var CampaignParser$1 = (
  /** @class */
  function() {
    function CampaignParser2() {
    }
    CampaignParser2.prototype.parse = function() {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          return [2, __assign$1(__assign$1(__assign$1(__assign$1({}, BASE_CAMPAIGN$1), this.getUtmParam()), this.getReferrer()), this.getClickIds())];
        });
      });
    };
    CampaignParser2.prototype.getUtmParam = function() {
      var params = getQueryParams$1();
      var utmCampaign = params[UTM_CAMPAIGN$1];
      var utmContent = params[UTM_CONTENT$1];
      var utmId = params[UTM_ID$1];
      var utmMedium = params[UTM_MEDIUM$1];
      var utmSource = params[UTM_SOURCE$1];
      var utmTerm = params[UTM_TERM$1];
      return {
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_id: utmId,
        utm_medium: utmMedium,
        utm_source: utmSource,
        utm_term: utmTerm
      };
    };
    CampaignParser2.prototype.getReferrer = function() {
      var _a, _b;
      var data = {
        referrer: void 0,
        referring_domain: void 0
      };
      try {
        data.referrer = document.referrer || void 0;
        data.referring_domain = (_b = (_a = data.referrer) === null || _a === void 0 ? void 0 : _a.split("/")[2]) !== null && _b !== void 0 ? _b : void 0;
      } catch (_c) {
      }
      return data;
    };
    CampaignParser2.prototype.getClickIds = function() {
      var _a;
      var params = getQueryParams$1();
      return _a = {}, _a[DCLID$1] = params[DCLID$1], _a[FBCLID$1] = params[FBCLID$1], _a[GBRAID$1] = params[GBRAID$1], _a[GCLID$1] = params[GCLID$1], _a[KO_CLICK_ID$1] = params[KO_CLICK_ID$1], _a[LI_FAT_ID$1] = params[LI_FAT_ID$1], _a[MSCLKID$1] = params[MSCLKID$1], _a[RDT_CID$1] = params[RDT_CID$1], _a[TTCLID$1] = params[TTCLID$1], _a[TWCLID$1] = params[TWCLID$1], _a[WBRAID$1] = params[WBRAID$1], _a;
    };
    return CampaignParser2;
  }()
);
var isTrackingEnabled = function(autocapture, event) {
  if (typeof autocapture === "boolean") {
    return autocapture;
  }
  if ((autocapture === null || autocapture === void 0 ? void 0 : autocapture[event]) === false) {
    return false;
  }
  return true;
};
var isAttributionTrackingEnabled = function(autocapture) {
  return isTrackingEnabled(autocapture, "attribution");
};
var isFileDownloadTrackingEnabled = function(autocapture) {
  return isTrackingEnabled(autocapture, "fileDownloads");
};
var isFormInteractionTrackingEnabled = function(autocapture) {
  return isTrackingEnabled(autocapture, "formInteractions");
};
var isPageViewTrackingEnabled = function(autocapture) {
  return isTrackingEnabled(autocapture, "pageViews");
};
var isSessionTrackingEnabled = function(autocapture) {
  return isTrackingEnabled(autocapture, "sessions");
};
var isNetworkTrackingEnabled = function(autocapture) {
  if (typeof autocapture === "object" && (autocapture.networkTracking === true || typeof autocapture.networkTracking === "object")) {
    return true;
  }
  return false;
};
var isElementInteractionsEnabled = function(autocapture) {
  if (typeof autocapture === "boolean") {
    return autocapture;
  }
  if (typeof autocapture === "object" && (autocapture.elementInteractions === true || typeof autocapture.elementInteractions === "object")) {
    return true;
  }
  return false;
};
var isWebVitalsEnabled = function(autocapture) {
  if (typeof autocapture === "object" && autocapture.webVitals === true) {
    return true;
  }
  return false;
};
var isFrustrationInteractionsEnabled = function(autocapture) {
  if (typeof autocapture === "object" && (autocapture.frustrationInteractions === true || typeof autocapture.frustrationInteractions === "object")) {
    return true;
  }
  return false;
};
var getElementInteractionsConfig = function(config2) {
  if (isElementInteractionsEnabled(config2.autocapture) && typeof config2.autocapture === "object" && typeof config2.autocapture.elementInteractions === "object") {
    return config2.autocapture.elementInteractions;
  }
  return void 0;
};
var getFrustrationInteractionsConfig = function(config2) {
  if (isFrustrationInteractionsEnabled(config2.autocapture) && typeof config2.autocapture === "object" && typeof config2.autocapture.frustrationInteractions === "object") {
    return config2.autocapture.frustrationInteractions;
  }
  return void 0;
};
var getNetworkTrackingConfig = function(config2) {
  var _a;
  if (isNetworkTrackingEnabled(config2.autocapture)) {
    var networkTrackingConfig = void 0;
    if (typeof config2.autocapture === "object" && typeof config2.autocapture.networkTracking === "object") {
      networkTrackingConfig = config2.autocapture.networkTracking;
    } else if (config2.networkTrackingOptions) {
      networkTrackingConfig = config2.networkTrackingOptions;
    }
    return __assign$1(__assign$1({}, networkTrackingConfig), { captureRules: (_a = networkTrackingConfig === null || networkTrackingConfig === void 0 ? void 0 : networkTrackingConfig.captureRules) === null || _a === void 0 ? void 0 : _a.map(function(rule) {
      var _a2;
      if (rule.urls && rule.hosts) {
        var hostsString = JSON.stringify(rule.hosts);
        var urlsString = JSON.stringify(rule.urls);
        (_a2 = config2.loggerProvider) === null || _a2 === void 0 ? void 0 : _a2.warn("Found network capture rule with both urls='".concat(urlsString, "' and hosts='").concat(hostsString, "' set. ") + "Definition of urls takes precedence over hosts, so ignoring hosts.");
        return __assign$1(__assign$1({}, rule), { hosts: void 0 });
      }
      return rule;
    }) });
  }
  return;
};
var getPageViewTrackingConfig = function(config2) {
  var trackOn = function() {
    return false;
  };
  var trackHistoryChanges = void 0;
  var eventType;
  var pageCounter = config2.pageCounter;
  var isDefaultPageViewTrackingEnabled = isPageViewTrackingEnabled(config2.defaultTracking);
  if (isDefaultPageViewTrackingEnabled) {
    trackOn = void 0;
    eventType = void 0;
    if (config2.defaultTracking && typeof config2.defaultTracking === "object" && config2.defaultTracking.pageViews && typeof config2.defaultTracking.pageViews === "object") {
      if ("trackOn" in config2.defaultTracking.pageViews) {
        trackOn = config2.defaultTracking.pageViews.trackOn;
      }
      if ("trackHistoryChanges" in config2.defaultTracking.pageViews) {
        trackHistoryChanges = config2.defaultTracking.pageViews.trackHistoryChanges;
      }
      if ("eventType" in config2.defaultTracking.pageViews && config2.defaultTracking.pageViews.eventType) {
        eventType = config2.defaultTracking.pageViews.eventType;
      }
    }
  }
  return {
    trackOn,
    trackHistoryChanges,
    eventType,
    pageCounter
  };
};
var getAttributionTrackingConfig = function(config2) {
  if (isAttributionTrackingEnabled(config2.defaultTracking) && config2.defaultTracking && typeof config2.defaultTracking === "object" && config2.defaultTracking.attribution && typeof config2.defaultTracking.attribution === "object") {
    return __assign$1({}, config2.defaultTracking.attribution);
  }
  return {};
};
var runQueuedFunctions = function(instance, queue) {
  convertProxyObjectToRealObject(instance, queue);
};
var convertProxyObjectToRealObject = function(instance, queue) {
  for (var i2 = 0; i2 < queue.length; i2++) {
    var _a = queue[i2], name_1 = _a.name, args = _a.args, resolve = _a.resolve;
    var fn = instance && instance[name_1];
    if (typeof fn === "function") {
      var result = fn.apply(instance, args);
      if (typeof resolve === "function") {
        resolve(result === null || result === void 0 ? void 0 : result.promise);
      }
    }
  }
  return instance;
};
var isInstanceProxy = function(instance) {
  var instanceProxy = instance;
  return instanceProxy && instanceProxy._q !== void 0;
};
var VERSION$1 = "2.23.7";
var LIBPREFIX = "amplitude-ts";
var BROWSER_PLATFORM = "Web";
var IP_ADDRESS = "$remote";
var Context = (
  /** @class */
  function() {
    function Context2() {
      this.name = "@amplitude/plugin-context-browser";
      this.type = "before";
      this.library = "".concat(LIBPREFIX, "/").concat(VERSION$1);
      if (typeof navigator !== "undefined") {
        this.userAgent = navigator.userAgent;
      }
    }
    Context2.prototype.setup = function(config2) {
      this.config = config2;
      return Promise.resolve(void 0);
    };
    Context2.prototype.execute = function(context) {
      var _a, _b;
      return __awaiter(this, void 0, void 0, function() {
        var time, lastEventId, nextEventId, event;
        return __generator(this, function(_c) {
          time = (/* @__PURE__ */ new Date()).getTime();
          lastEventId = (_a = this.config.lastEventId) !== null && _a !== void 0 ? _a : -1;
          nextEventId = (_b = context.event_id) !== null && _b !== void 0 ? _b : lastEventId + 1;
          this.config.lastEventId = nextEventId;
          if (!context.time) {
            this.config.lastEventTime = time;
          }
          event = __assign$1(__assign$1(__assign$1(__assign$1(__assign$1(__assign$1(__assign$1(__assign$1({ user_id: this.config.userId, device_id: this.config.deviceId, session_id: this.config.sessionId, time }, this.config.appVersion && { app_version: this.config.appVersion }), this.config.trackingOptions.platform && { platform: BROWSER_PLATFORM }), this.config.trackingOptions.language && { language: getLanguage() }), this.config.trackingOptions.ipAddress && { ip: IP_ADDRESS }), { insert_id: UUID(), partner_id: this.config.partnerId, plan: this.config.plan }), this.config.ingestionMetadata && {
            ingestion_metadata: {
              source_name: this.config.ingestionMetadata.sourceName,
              source_version: this.config.ingestionMetadata.sourceVersion
            }
          }), context), { event_id: nextEventId, library: this.library, user_agent: this.userAgent });
          return [2, event];
        });
      });
    };
    return Context2;
  }()
);
var MAX_ARRAY_LENGTH = 1e3;
var LocalStorage = (
  /** @class */
  function(_super) {
    __extends(LocalStorage2, _super);
    function LocalStorage2(config2) {
      var _this = this;
      var _a, _b;
      var localStorage2;
      try {
        localStorage2 = (_a = getGlobalScope$1()) === null || _a === void 0 ? void 0 : _a.localStorage;
      } catch (e2) {
        (_b = config2 === null || config2 === void 0 ? void 0 : config2.loggerProvider) === null || _b === void 0 ? void 0 : _b.debug("Failed to access localStorage. error=".concat(JSON.stringify(e2)));
        localStorage2 = void 0;
      }
      _this = _super.call(this, localStorage2) || this;
      _this.loggerProvider = config2 === null || config2 === void 0 ? void 0 : config2.loggerProvider;
      return _this;
    }
    LocalStorage2.prototype.set = function(key, value) {
      var _a;
      return __awaiter(this, void 0, void 0, function() {
        var droppedEventsCount;
        return __generator(this, function(_b) {
          switch (_b.label) {
            case 0:
              if (!(Array.isArray(value) && value.length > MAX_ARRAY_LENGTH)) return [3, 2];
              droppedEventsCount = value.length - MAX_ARRAY_LENGTH;
              return [4, _super.prototype.set.call(this, key, value.slice(0, MAX_ARRAY_LENGTH))];
            case 1:
              _b.sent();
              (_a = this.loggerProvider) === null || _a === void 0 ? void 0 : _a.error("Failed to save ".concat(droppedEventsCount, " events because the queue length exceeded ").concat(MAX_ARRAY_LENGTH, "."));
              return [3, 4];
            case 2:
              return [4, _super.prototype.set.call(this, key, value)];
            case 3:
              _b.sent();
              _b.label = 4;
            case 4:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    return LocalStorage2;
  }(BrowserStorage)
);
var SessionStorage = (
  /** @class */
  function(_super) {
    __extends(SessionStorage2, _super);
    function SessionStorage2() {
      var _a;
      return _super.call(this, (_a = getGlobalScope$1()) === null || _a === void 0 ? void 0 : _a.sessionStorage) || this;
    }
    return SessionStorage2;
  }(BrowserStorage)
);
var XHRTransport = (
  /** @class */
  function(_super) {
    __extends(XHRTransport2, _super);
    function XHRTransport2() {
      var _this = _super !== null && _super.apply(this, arguments) || this;
      _this.state = {
        done: 4
      };
      return _this;
    }
    XHRTransport2.prototype.send = function(serverUrl, payload) {
      return __awaiter(this, void 0, void 0, function() {
        var _this = this;
        return __generator(this, function(_a) {
          return [2, new Promise(function(resolve, reject) {
            if (typeof XMLHttpRequest === "undefined") {
              reject(new Error("XHRTransport is not supported."));
            }
            var xhr = new XMLHttpRequest();
            xhr.open("POST", serverUrl, true);
            xhr.onreadystatechange = function() {
              if (xhr.readyState === _this.state.done) {
                var responseText = xhr.responseText;
                try {
                  resolve(_this.buildResponse(JSON.parse(responseText)));
                } catch (_a2) {
                  resolve(_this.buildResponse({ code: xhr.status }));
                }
              }
            };
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Accept", "*/*");
            xhr.send(JSON.stringify(payload));
          })];
        });
      });
    };
    return XHRTransport2;
  }(BaseTransport$1)
);
var SendBeaconTransport = (
  /** @class */
  function(_super) {
    __extends(SendBeaconTransport2, _super);
    function SendBeaconTransport2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    SendBeaconTransport2.prototype.send = function(serverUrl, payload) {
      return __awaiter(this, void 0, void 0, function() {
        var _this = this;
        return __generator(this, function(_a) {
          return [2, new Promise(function(resolve, reject) {
            var globalScope = getGlobalScope$1();
            if (!(globalScope === null || globalScope === void 0 ? void 0 : globalScope.navigator.sendBeacon)) {
              throw new Error("SendBeaconTransport is not supported");
            }
            try {
              var data = JSON.stringify(payload);
              var success = globalScope.navigator.sendBeacon(serverUrl, JSON.stringify(payload));
              if (success) {
                return resolve(_this.buildResponse({
                  code: 200,
                  events_ingested: payload.events.length,
                  payload_size_bytes: data.length,
                  server_upload_time: Date.now()
                }));
              }
              return resolve(_this.buildResponse({ code: 500 }));
            } catch (e2) {
              reject(e2);
            }
          })];
        });
      });
    };
    return SendBeaconTransport2;
  }(BaseTransport$1)
);
var parseLegacyCookies = function(apiKey, cookieStorage, deleteLegacyCookies) {
  if (deleteLegacyCookies === void 0) {
    deleteLegacyCookies = true;
  }
  return __awaiter(void 0, void 0, void 0, function() {
    var cookieName, cookies, _a, deviceId, userId, optOut, sessionId, lastEventTime, lastEventId;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          cookieName = getOldCookieName(apiKey);
          return [4, cookieStorage.getRaw(cookieName)];
        case 1:
          cookies = _b.sent();
          if (!cookies) {
            return [2, {
              optOut: false
            }];
          }
          if (!deleteLegacyCookies) return [3, 3];
          return [4, cookieStorage.remove(cookieName)];
        case 2:
          _b.sent();
          _b.label = 3;
        case 3:
          _a = __read$1(cookies.split("."), 6), deviceId = _a[0], userId = _a[1], optOut = _a[2], sessionId = _a[3], lastEventTime = _a[4], lastEventId = _a[5];
          return [2, {
            deviceId,
            userId: decode(userId),
            sessionId: parseTime(sessionId),
            lastEventId: parseTime(lastEventId),
            lastEventTime: parseTime(lastEventTime),
            optOut: Boolean(optOut)
          }];
      }
    });
  });
};
var parseTime = function(num) {
  var integer = parseInt(num, 32);
  if (isNaN(integer)) {
    return void 0;
  }
  return integer;
};
var decode = function(value) {
  if (!atob || !escape || !value) {
    return void 0;
  }
  try {
    return decodeURIComponent(escape(atob(value)));
  } catch (_a) {
    return void 0;
  }
};
var DEFAULT_EVENT_PREFIX = "[Amplitude]";
var DEFAULT_FORM_START_EVENT = "".concat(DEFAULT_EVENT_PREFIX, " Form Started");
var DEFAULT_FORM_SUBMIT_EVENT = "".concat(DEFAULT_EVENT_PREFIX, " Form Submitted");
var DEFAULT_FILE_DOWNLOAD_EVENT = "".concat(DEFAULT_EVENT_PREFIX, " File Downloaded");
var DEFAULT_SESSION_START_EVENT = "session_start";
var DEFAULT_SESSION_END_EVENT = "session_end";
var FILE_EXTENSION = "".concat(DEFAULT_EVENT_PREFIX, " File Extension");
var FILE_NAME = "".concat(DEFAULT_EVENT_PREFIX, " File Name");
var LINK_ID = "".concat(DEFAULT_EVENT_PREFIX, " Link ID");
var LINK_TEXT = "".concat(DEFAULT_EVENT_PREFIX, " Link Text");
var LINK_URL = "".concat(DEFAULT_EVENT_PREFIX, " Link URL");
var FORM_ID = "".concat(DEFAULT_EVENT_PREFIX, " Form ID");
var FORM_NAME = "".concat(DEFAULT_EVENT_PREFIX, " Form Name");
var FORM_DESTINATION = "".concat(DEFAULT_EVENT_PREFIX, " Form Destination");
var DEFAULT_IDENTITY_STORAGE = "cookie";
var DEFAULT_SERVER_ZONE = "US";
var BrowserConfig = (
  /** @class */
  function(_super) {
    __extends(BrowserConfig2, _super);
    function BrowserConfig2(apiKey, appVersion, cookieStorage, cookieOptions, defaultTracking, autocapture, deviceId, flushIntervalMillis, flushMaxRetries, flushQueueSize, identityStorage, ingestionMetadata, instanceName, lastEventId, lastEventTime, loggerProvider, logLevel, minIdLength, offline, optOut, partnerId, plan, serverUrl, serverZone, sessionId, sessionTimeout, storageProvider, trackingOptions, transport, useBatch, fetchRemoteConfig, userId, pageCounter, debugLogsEnabled, networkTrackingOptions) {
      if (cookieStorage === void 0) {
        cookieStorage = new MemoryStorage();
      }
      if (cookieOptions === void 0) {
        cookieOptions = {
          domain: "",
          expiration: 365,
          sameSite: "Lax",
          secure: false,
          upgrade: true
        };
      }
      if (flushIntervalMillis === void 0) {
        flushIntervalMillis = 1e3;
      }
      if (flushMaxRetries === void 0) {
        flushMaxRetries = 5;
      }
      if (flushQueueSize === void 0) {
        flushQueueSize = 30;
      }
      if (identityStorage === void 0) {
        identityStorage = DEFAULT_IDENTITY_STORAGE;
      }
      if (loggerProvider === void 0) {
        loggerProvider = new Logger();
      }
      if (logLevel === void 0) {
        logLevel = LogLevel.Warn;
      }
      if (offline === void 0) {
        offline = false;
      }
      if (optOut === void 0) {
        optOut = false;
      }
      if (serverUrl === void 0) {
        serverUrl = "";
      }
      if (serverZone === void 0) {
        serverZone = DEFAULT_SERVER_ZONE;
      }
      if (sessionTimeout === void 0) {
        sessionTimeout = 30 * 60 * 1e3;
      }
      if (storageProvider === void 0) {
        storageProvider = new LocalStorage({ loggerProvider });
      }
      if (trackingOptions === void 0) {
        trackingOptions = {
          ipAddress: true,
          language: true,
          platform: true
        };
      }
      if (transport === void 0) {
        transport = "fetch";
      }
      if (useBatch === void 0) {
        useBatch = false;
      }
      if (fetchRemoteConfig === void 0) {
        fetchRemoteConfig = true;
      }
      var _this = _super.call(this, { apiKey, storageProvider, transportProvider: createTransport(transport) }) || this;
      _this.apiKey = apiKey;
      _this.appVersion = appVersion;
      _this.cookieOptions = cookieOptions;
      _this.defaultTracking = defaultTracking;
      _this.autocapture = autocapture;
      _this.flushIntervalMillis = flushIntervalMillis;
      _this.flushMaxRetries = flushMaxRetries;
      _this.flushQueueSize = flushQueueSize;
      _this.identityStorage = identityStorage;
      _this.ingestionMetadata = ingestionMetadata;
      _this.instanceName = instanceName;
      _this.loggerProvider = loggerProvider;
      _this.logLevel = logLevel;
      _this.minIdLength = minIdLength;
      _this.offline = offline;
      _this.partnerId = partnerId;
      _this.plan = plan;
      _this.serverUrl = serverUrl;
      _this.serverZone = serverZone;
      _this.sessionTimeout = sessionTimeout;
      _this.storageProvider = storageProvider;
      _this.trackingOptions = trackingOptions;
      _this.transport = transport;
      _this.useBatch = useBatch;
      _this.fetchRemoteConfig = fetchRemoteConfig;
      _this.networkTrackingOptions = networkTrackingOptions;
      _this.version = VERSION$1;
      _this._optOut = false;
      _this._cookieStorage = cookieStorage;
      _this.deviceId = deviceId;
      _this.lastEventId = lastEventId;
      _this.lastEventTime = lastEventTime;
      _this.optOut = optOut;
      _this.sessionId = sessionId;
      _this.pageCounter = pageCounter;
      _this.userId = userId;
      _this.debugLogsEnabled = debugLogsEnabled;
      _this.loggerProvider.enable(debugLogsEnabled ? LogLevel.Debug : _this.logLevel);
      _this.networkTrackingOptions = networkTrackingOptions;
      return _this;
    }
    Object.defineProperty(BrowserConfig2.prototype, "cookieStorage", {
      get: function() {
        return this._cookieStorage;
      },
      set: function(cookieStorage) {
        if (this._cookieStorage !== cookieStorage) {
          this._cookieStorage = cookieStorage;
          this.updateStorage();
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BrowserConfig2.prototype, "deviceId", {
      get: function() {
        return this._deviceId;
      },
      set: function(deviceId) {
        if (this._deviceId !== deviceId) {
          this._deviceId = deviceId;
          this.updateStorage();
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BrowserConfig2.prototype, "userId", {
      get: function() {
        return this._userId;
      },
      set: function(userId) {
        if (this._userId !== userId) {
          this._userId = userId;
          this.updateStorage();
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BrowserConfig2.prototype, "sessionId", {
      get: function() {
        return this._sessionId;
      },
      set: function(sessionId) {
        if (this._sessionId !== sessionId) {
          this._sessionId = sessionId;
          this.updateStorage();
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BrowserConfig2.prototype, "optOut", {
      get: function() {
        return this._optOut;
      },
      set: function(optOut) {
        if (this._optOut !== optOut) {
          this._optOut = optOut;
          this.updateStorage();
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BrowserConfig2.prototype, "lastEventTime", {
      get: function() {
        return this._lastEventTime;
      },
      set: function(lastEventTime) {
        if (this._lastEventTime !== lastEventTime) {
          this._lastEventTime = lastEventTime;
          this.updateStorage();
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BrowserConfig2.prototype, "lastEventId", {
      get: function() {
        return this._lastEventId;
      },
      set: function(lastEventId) {
        if (this._lastEventId !== lastEventId) {
          this._lastEventId = lastEventId;
          this.updateStorage();
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BrowserConfig2.prototype, "pageCounter", {
      get: function() {
        return this._pageCounter;
      },
      set: function(pageCounter) {
        if (this._pageCounter !== pageCounter) {
          this._pageCounter = pageCounter;
          this.updateStorage();
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(BrowserConfig2.prototype, "debugLogsEnabled", {
      set: function(debugLogsEnabled) {
        if (this._debugLogsEnabled !== debugLogsEnabled) {
          this._debugLogsEnabled = debugLogsEnabled;
          this.updateStorage();
        }
      },
      enumerable: false,
      configurable: true
    });
    BrowserConfig2.prototype.updateStorage = function() {
      var cache = {
        deviceId: this._deviceId,
        userId: this._userId,
        sessionId: this._sessionId,
        optOut: this._optOut,
        lastEventTime: this._lastEventTime,
        lastEventId: this._lastEventId,
        pageCounter: this._pageCounter,
        debugLogsEnabled: this._debugLogsEnabled
      };
      void this.cookieStorage.set(getCookieName(this.apiKey), cache);
    };
    return BrowserConfig2;
  }(Config)
);
var useBrowserConfig = function(apiKey, options, amplitudeInstance) {
  if (options === void 0) {
    options = {};
  }
  return __awaiter(void 0, void 0, void 0, function() {
    var identityStorage, cookieOptions, _a, _b, cookieStorage, legacyCookies, previousCookies, queryParams, ampTimestamp, isWithinTimeLimit, deviceId, lastEventId, lastEventTime, optOut, sessionId, userId, trackingOptions, pageCounter, debugLogsEnabled, browserConfig;
    var _c;
    var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
    return __generator(this, function(_3) {
      switch (_3.label) {
        case 0:
          identityStorage = options.identityStorage || DEFAULT_IDENTITY_STORAGE;
          _c = {};
          if (!(identityStorage !== DEFAULT_IDENTITY_STORAGE)) return [3, 1];
          _a = "";
          return [3, 5];
        case 1:
          if (!((_e = (_d = options.cookieOptions) === null || _d === void 0 ? void 0 : _d.domain) !== null && _e !== void 0)) return [3, 2];
          _b = _e;
          return [3, 4];
        case 2:
          return [4, getTopLevelDomain()];
        case 3:
          _b = _3.sent();
          _3.label = 4;
        case 4:
          _a = _b;
          _3.label = 5;
        case 5:
          cookieOptions = __assign$1.apply(void 0, [(_c.domain = _a, _c.expiration = 365, _c.sameSite = "Lax", _c.secure = false, _c.upgrade = true, _c), options.cookieOptions]);
          cookieStorage = createCookieStorage(options.identityStorage, cookieOptions);
          return [4, parseLegacyCookies(apiKey, cookieStorage, (_g = (_f = options.cookieOptions) === null || _f === void 0 ? void 0 : _f.upgrade) !== null && _g !== void 0 ? _g : true)];
        case 6:
          legacyCookies = _3.sent();
          return [4, cookieStorage.get(getCookieName(apiKey))];
        case 7:
          previousCookies = _3.sent();
          queryParams = getQueryParams$1();
          ampTimestamp = queryParams.ampTimestamp ? Number(queryParams.ampTimestamp) : void 0;
          isWithinTimeLimit = ampTimestamp ? Date.now() < ampTimestamp : true;
          deviceId = (_m = (_l = (_k = (_h = options.deviceId) !== null && _h !== void 0 ? _h : isWithinTimeLimit ? (_j = queryParams.ampDeviceId) !== null && _j !== void 0 ? _j : queryParams.deviceId : void 0) !== null && _k !== void 0 ? _k : previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.deviceId) !== null && _l !== void 0 ? _l : legacyCookies.deviceId) !== null && _m !== void 0 ? _m : UUID();
          lastEventId = (_o = previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.lastEventId) !== null && _o !== void 0 ? _o : legacyCookies.lastEventId;
          lastEventTime = (_p = previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.lastEventTime) !== null && _p !== void 0 ? _p : legacyCookies.lastEventTime;
          optOut = (_r = (_q = options.optOut) !== null && _q !== void 0 ? _q : previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.optOut) !== null && _r !== void 0 ? _r : legacyCookies.optOut;
          sessionId = (_s = previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.sessionId) !== null && _s !== void 0 ? _s : legacyCookies.sessionId;
          userId = (_u = (_t = options.userId) !== null && _t !== void 0 ? _t : previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.userId) !== null && _u !== void 0 ? _u : legacyCookies.userId;
          amplitudeInstance.previousSessionDeviceId = (_v = previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.deviceId) !== null && _v !== void 0 ? _v : legacyCookies.deviceId;
          amplitudeInstance.previousSessionUserId = (_w = previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.userId) !== null && _w !== void 0 ? _w : legacyCookies.userId;
          trackingOptions = {
            ipAddress: (_y = (_x = options.trackingOptions) === null || _x === void 0 ? void 0 : _x.ipAddress) !== null && _y !== void 0 ? _y : true,
            language: (_0 = (_z = options.trackingOptions) === null || _z === void 0 ? void 0 : _z.language) !== null && _0 !== void 0 ? _0 : true,
            platform: (_2 = (_1 = options.trackingOptions) === null || _1 === void 0 ? void 0 : _1.platform) !== null && _2 !== void 0 ? _2 : true
          };
          pageCounter = previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.pageCounter;
          debugLogsEnabled = previousCookies === null || previousCookies === void 0 ? void 0 : previousCookies.debugLogsEnabled;
          if (options.autocapture !== void 0) {
            options.defaultTracking = options.autocapture;
          }
          browserConfig = new BrowserConfig(apiKey, options.appVersion, cookieStorage, cookieOptions, options.defaultTracking, options.autocapture, deviceId, options.flushIntervalMillis, options.flushMaxRetries, options.flushQueueSize, identityStorage, options.ingestionMetadata, options.instanceName, lastEventId, lastEventTime, options.loggerProvider, options.logLevel, options.minIdLength, options.offline, optOut, options.partnerId, options.plan, options.serverUrl, options.serverZone, sessionId, options.sessionTimeout, options.storageProvider, trackingOptions, options.transport, options.useBatch, options.fetchRemoteConfig, userId, pageCounter, debugLogsEnabled, options.networkTrackingOptions);
          return [4, browserConfig.storageProvider.isEnabled()];
        case 8:
          if (!_3.sent()) {
            browserConfig.loggerProvider.warn("Storage provider ".concat(browserConfig.storageProvider.constructor.name, " is not enabled. Falling back to MemoryStorage."));
            browserConfig.storageProvider = new MemoryStorage();
          }
          return [2, browserConfig];
      }
    });
  });
};
var createCookieStorage = function(identityStorage, cookieOptions) {
  if (identityStorage === void 0) {
    identityStorage = DEFAULT_IDENTITY_STORAGE;
  }
  if (cookieOptions === void 0) {
    cookieOptions = {};
  }
  switch (identityStorage) {
    case "localStorage":
      return new LocalStorage();
    case "sessionStorage":
      return new SessionStorage();
    case "none":
      return new MemoryStorage();
    case "cookie":
    default:
      return new CookieStorage(__assign$1(__assign$1({}, cookieOptions), { expirationDays: cookieOptions.expiration }));
  }
};
var createTransport = function(transport) {
  if (transport === "xhr") {
    return new XHRTransport();
  }
  if (transport === "beacon") {
    return new SendBeaconTransport();
  }
  return new FetchTransport();
};
var getTopLevelDomain = function(url) {
  return __awaiter(void 0, void 0, void 0, function() {
    var host, parts, levels, storageKey, i2, i2, domain, options, storage, value;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          return [4, new CookieStorage().isEnabled()];
        case 1:
          if (!_a.sent() || (typeof location === "undefined" || !location.hostname)) {
            return [2, ""];
          }
          host = location.hostname;
          parts = host.split(".");
          levels = [];
          storageKey = "AMP_TLDTEST";
          for (i2 = parts.length - 2; i2 >= 0; --i2) {
            levels.push(parts.slice(i2).join("."));
          }
          i2 = 0;
          _a.label = 2;
        case 2:
          if (!(i2 < levels.length)) return [3, 7];
          domain = levels[i2];
          options = { domain: "." + domain };
          storage = new CookieStorage(options);
          return [4, storage.set(storageKey, 1)];
        case 3:
          _a.sent();
          return [4, storage.get(storageKey)];
        case 4:
          value = _a.sent();
          if (!value) return [3, 6];
          return [4, storage.remove(storageKey)];
        case 5:
          _a.sent();
          return [2, "." + domain];
        case 6:
          i2++;
          return [3, 2];
        case 7:
          return [2, ""];
      }
    });
  });
};
var getGlobalScope = function() {
  var ampIntegrationContextName = "ampIntegrationContext";
  if (typeof globalThis !== "undefined" && typeof globalThis[ampIntegrationContextName] !== "undefined") {
    return globalThis[ampIntegrationContextName];
  }
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  return void 0;
};
var getQueryParams = function() {
  var _a;
  var globalScope = getGlobalScope();
  if (!((_a = globalScope === null || globalScope === void 0 ? void 0 : globalScope.location) === null || _a === void 0 ? void 0 : _a.search)) {
    return {};
  }
  var pairs = globalScope.location.search.substring(1).split("&").filter(Boolean);
  var params = pairs.reduce(function(acc, curr) {
    var query = curr.split("=", 2);
    var key = tryDecodeURIComponent(query[0]);
    var value = tryDecodeURIComponent(query[1]);
    if (!value) {
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});
  return params;
};
var tryDecodeURIComponent = function(value) {
  if (value === void 0) {
    value = "";
  }
  try {
    return decodeURIComponent(value);
  } catch (_a) {
    return "";
  }
};
var UTM_CAMPAIGN = "utm_campaign";
var UTM_CONTENT = "utm_content";
var UTM_ID = "utm_id";
var UTM_MEDIUM = "utm_medium";
var UTM_SOURCE = "utm_source";
var UTM_TERM = "utm_term";
var DCLID = "dclid";
var FBCLID = "fbclid";
var GBRAID = "gbraid";
var GCLID = "gclid";
var KO_CLICK_ID = "ko_click_id";
var LI_FAT_ID = "li_fat_id";
var MSCLKID = "msclkid";
var RDT_CID = "rdt_cid";
var TTCLID = "ttclid";
var TWCLID = "twclid";
var WBRAID = "wbraid";
var BASE_CAMPAIGN = {
  utm_campaign: void 0,
  utm_content: void 0,
  utm_id: void 0,
  utm_medium: void 0,
  utm_source: void 0,
  utm_term: void 0,
  referrer: void 0,
  referring_domain: void 0,
  dclid: void 0,
  gbraid: void 0,
  gclid: void 0,
  fbclid: void 0,
  ko_click_id: void 0,
  li_fat_id: void 0,
  msclkid: void 0,
  rdt_cid: void 0,
  ttclid: void 0,
  twclid: void 0,
  wbraid: void 0
};
var CampaignParser = (
  /** @class */
  function() {
    function CampaignParser2() {
    }
    CampaignParser2.prototype.parse = function() {
      return __awaiter(this, void 0, void 0, function() {
        return __generator(this, function(_a) {
          return [2, __assign$1(__assign$1(__assign$1(__assign$1({}, BASE_CAMPAIGN), this.getUtmParam()), this.getReferrer()), this.getClickIds())];
        });
      });
    };
    CampaignParser2.prototype.getUtmParam = function() {
      var params = getQueryParams();
      var utmCampaign = params[UTM_CAMPAIGN];
      var utmContent = params[UTM_CONTENT];
      var utmId = params[UTM_ID];
      var utmMedium = params[UTM_MEDIUM];
      var utmSource = params[UTM_SOURCE];
      var utmTerm = params[UTM_TERM];
      return {
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_id: utmId,
        utm_medium: utmMedium,
        utm_source: utmSource,
        utm_term: utmTerm
      };
    };
    CampaignParser2.prototype.getReferrer = function() {
      var _a, _b;
      var data = {
        referrer: void 0,
        referring_domain: void 0
      };
      try {
        data.referrer = document.referrer || void 0;
        data.referring_domain = (_b = (_a = data.referrer) === null || _a === void 0 ? void 0 : _a.split("/")[2]) !== null && _b !== void 0 ? _b : void 0;
      } catch (_c) {
      }
      return data;
    };
    CampaignParser2.prototype.getClickIds = function() {
      var _a;
      var params = getQueryParams();
      return _a = {}, _a[DCLID] = params[DCLID], _a[FBCLID] = params[FBCLID], _a[GBRAID] = params[GBRAID], _a[GCLID] = params[GCLID], _a[KO_CLICK_ID] = params[KO_CLICK_ID], _a[LI_FAT_ID] = params[LI_FAT_ID], _a[MSCLKID] = params[MSCLKID], _a[RDT_CID] = params[RDT_CID], _a[TTCLID] = params[TTCLID], _a[TWCLID] = params[TWCLID], _a[WBRAID] = params[WBRAID], _a;
    };
    return CampaignParser2;
  }()
);
var IdentifyOperation;
(function(IdentifyOperation2) {
  IdentifyOperation2["SET"] = "$set";
  IdentifyOperation2["SET_ONCE"] = "$setOnce";
  IdentifyOperation2["ADD"] = "$add";
  IdentifyOperation2["APPEND"] = "$append";
  IdentifyOperation2["PREPEND"] = "$prepend";
  IdentifyOperation2["REMOVE"] = "$remove";
  IdentifyOperation2["PREINSERT"] = "$preInsert";
  IdentifyOperation2["POSTINSERT"] = "$postInsert";
  IdentifyOperation2["UNSET"] = "$unset";
  IdentifyOperation2["CLEAR_ALL"] = "$clearAll";
})(IdentifyOperation || (IdentifyOperation = {}));
var RevenueProperty;
(function(RevenueProperty2) {
  RevenueProperty2["REVENUE_PRODUCT_ID"] = "$productId";
  RevenueProperty2["REVENUE_QUANTITY"] = "$quantity";
  RevenueProperty2["REVENUE_PRICE"] = "$price";
  RevenueProperty2["REVENUE_TYPE"] = "$revenueType";
  RevenueProperty2["REVENUE_CURRENCY"] = "$currency";
  RevenueProperty2["REVENUE"] = "$revenue";
})(RevenueProperty || (RevenueProperty = {}));
var SpecialEventType;
(function(SpecialEventType2) {
  SpecialEventType2["IDENTIFY"] = "$identify";
  SpecialEventType2["GROUP_IDENTIFY"] = "$groupidentify";
  SpecialEventType2["REVENUE"] = "revenue_amount";
})(SpecialEventType || (SpecialEventType = {}));
var omitUndefined = function(input) {
  var obj = {};
  for (var key in input) {
    var val = input[key];
    if (val) {
      obj[key] = val;
    }
  }
  return obj;
};
var defaultPageViewEvent = "[Amplitude] Page Viewed";
var pageViewTrackingPlugin = function(options) {
  if (options === void 0) {
    options = {};
  }
  var amplitude;
  var globalScope = getGlobalScope();
  var loggerProvider = void 0;
  var isTracking = false;
  var localConfig;
  var trackOn = options.trackOn, trackHistoryChanges = options.trackHistoryChanges, _a = options.eventType, eventType = _a === void 0 ? defaultPageViewEvent : _a;
  var getDecodeURI = function(locationStr) {
    var decodedLocationStr = locationStr;
    try {
      decodedLocationStr = decodeURI(locationStr);
    } catch (e2) {
      loggerProvider === null || loggerProvider === void 0 ? void 0 : loggerProvider.error("Malformed URI sequence: ", e2);
    }
    return decodedLocationStr;
  };
  var createPageViewEvent = function() {
    return __awaiter(void 0, void 0, void 0, function() {
      var locationHREF, _a2;
      var _b;
      return __generator(this, function(_c) {
        switch (_c.label) {
          case 0:
            locationHREF = getDecodeURI(typeof location !== "undefined" && location.href || "");
            _b = {
              event_type: eventType
            };
            _a2 = [{}];
            return [4, getCampaignParams()];
          case 1:
            return [2, (_b.event_properties = __assign$1.apply(void 0, [__assign$1.apply(void 0, _a2.concat([_c.sent()])), { "[Amplitude] Page Domain": (
              /* istanbul ignore next */
              typeof location !== "undefined" && location.hostname || ""
            ), "[Amplitude] Page Location": locationHREF, "[Amplitude] Page Path": (
              /* istanbul ignore next */
              typeof location !== "undefined" && getDecodeURI(location.pathname) || ""
            ), "[Amplitude] Page Title": (
              /* istanbul ignore next */
              typeof document !== "undefined" && document.title || ""
            ), "[Amplitude] Page URL": locationHREF.split("?")[0] }]), _b)];
        }
      });
    });
  };
  var shouldTrackOnPageLoad = function() {
    return typeof trackOn === "undefined" || typeof trackOn === "function" && trackOn();
  };
  var previousURL = typeof location !== "undefined" ? location.href : null;
  var trackHistoryPageView = function() {
    return __awaiter(void 0, void 0, void 0, function() {
      var newURL, shouldTrackPageView, _b, _c;
      return __generator(this, function(_d) {
        switch (_d.label) {
          case 0:
            newURL = location.href;
            shouldTrackPageView = shouldTrackHistoryPageView(trackHistoryChanges, newURL, previousURL || "") && shouldTrackOnPageLoad();
            previousURL = newURL;
            if (!shouldTrackPageView) return [3, 4];
            loggerProvider === null || loggerProvider === void 0 ? void 0 : loggerProvider.log("Tracking page view event");
            if (!(amplitude === null || amplitude === void 0)) return [3, 1];
            return [3, 3];
          case 1:
            _c = (_b = amplitude).track;
            return [4, createPageViewEvent()];
          case 2:
            _c.apply(_b, [_d.sent()]);
            _d.label = 3;
          case 3:
            _d.label = 4;
          case 4:
            return [
              2
              /*return*/
            ];
        }
      });
    });
  };
  var trackHistoryPageViewWrapper = function() {
    void trackHistoryPageView();
  };
  var plugin = {
    name: "@amplitude/plugin-page-view-tracking-browser",
    type: "enrichment",
    setup: function(config2, client2) {
      return __awaiter(void 0, void 0, void 0, function() {
        var _a2, _b;
        return __generator(this, function(_c) {
          switch (_c.label) {
            case 0:
              amplitude = client2;
              localConfig = config2;
              loggerProvider = config2.loggerProvider;
              loggerProvider.log("Installing @amplitude/plugin-page-view-tracking-browser");
              isTracking = true;
              if (globalScope) {
                globalScope.addEventListener("popstate", trackHistoryPageViewWrapper);
                globalScope.history.pushState = new Proxy(globalScope.history.pushState, {
                  apply: function(target, thisArg, _a3) {
                    var _b2 = __read$1(_a3, 3), state = _b2[0], unused = _b2[1], url = _b2[2];
                    target.apply(thisArg, [state, unused, url]);
                    if (isTracking) {
                      void trackHistoryPageView();
                    }
                  }
                });
              }
              if (!shouldTrackOnPageLoad()) return [3, 2];
              loggerProvider.log("Tracking page view event");
              _b = (_a2 = amplitude).track;
              return [4, createPageViewEvent()];
            case 1:
              _b.apply(_a2, [_c.sent()]);
              _c.label = 2;
            case 2:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    },
    execute: function(event) {
      return __awaiter(void 0, void 0, void 0, function() {
        var pageViewEvent;
        return __generator(this, function(_a2) {
          switch (_a2.label) {
            case 0:
              if (!(trackOn === "attribution" && isCampaignEvent(event))) return [3, 2];
              loggerProvider === null || loggerProvider === void 0 ? void 0 : loggerProvider.log("Enriching campaign event to page view event with campaign parameters");
              return [4, createPageViewEvent()];
            case 1:
              pageViewEvent = _a2.sent();
              event.event_type = pageViewEvent.event_type;
              event.event_properties = __assign$1(__assign$1({}, event.event_properties), pageViewEvent.event_properties);
              _a2.label = 2;
            case 2:
              if (localConfig && event.event_type === eventType) {
                localConfig.pageCounter = !localConfig.pageCounter ? 1 : localConfig.pageCounter + 1;
                event.event_properties = __assign$1(__assign$1({}, event.event_properties), { "[Amplitude] Page Counter": localConfig.pageCounter });
              }
              return [2, event];
          }
        });
      });
    },
    teardown: function() {
      return __awaiter(void 0, void 0, void 0, function() {
        return __generator(this, function(_a2) {
          if (globalScope) {
            globalScope.removeEventListener("popstate", trackHistoryPageViewWrapper);
            isTracking = false;
          }
          return [
            2
            /*return*/
          ];
        });
      });
    }
  };
  return plugin;
};
var getCampaignParams = function() {
  return __awaiter(void 0, void 0, void 0, function() {
    var _a;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          _a = omitUndefined;
          return [4, new CampaignParser().parse()];
        case 1:
          return [2, _a.apply(void 0, [_b.sent()])];
      }
    });
  });
};
var isCampaignEvent = function(event) {
  if (event.event_type === "$identify" && event.user_properties) {
    var properties = event.user_properties;
    var $set = properties[IdentifyOperation.SET] || {};
    var $unset = properties[IdentifyOperation.UNSET] || {};
    var userProperties_1 = __spreadArray(__spreadArray([], __read$1(Object.keys($set)), false), __read$1(Object.keys($unset)), false);
    return Object.keys(BASE_CAMPAIGN).every(function(value) {
      return userProperties_1.includes(value);
    });
  }
  return false;
};
var shouldTrackHistoryPageView = function(trackingOption, newURLStr, oldURLStr) {
  switch (trackingOption) {
    case "pathOnly": {
      if (oldURLStr == "")
        return true;
      var newURL = new URL(newURLStr);
      var oldURL = new URL(oldURLStr);
      var newBaseStr = newURL.origin + newURL.pathname;
      var oldBaseStr = oldURL.origin + oldURL.pathname;
      return newBaseStr !== oldBaseStr;
    }
    default:
      return newURLStr !== oldURLStr;
  }
};
var formInteractionTracking = function() {
  var observer;
  var eventListeners = [];
  var addEventListener2 = function(element, type2, handler) {
    element.addEventListener(type2, handler);
    eventListeners.push({
      element,
      type: type2,
      handler
    });
  };
  var removeClickListeners = function() {
    eventListeners.forEach(function(_a) {
      var element = _a.element, type2 = _a.type, handler = _a.handler;
      element === null || element === void 0 ? void 0 : element.removeEventListener(type2, handler);
    });
    eventListeners = [];
  };
  var name = "@amplitude/plugin-form-interaction-tracking-browser";
  var type = "enrichment";
  var setup = function(config2, amplitude) {
    return __awaiter(void 0, void 0, void 0, function() {
      var initializeFormTracking, window_1;
      return __generator(this, function(_a) {
        initializeFormTracking = function() {
          if (!amplitude) {
            config2.loggerProvider.warn("Form interaction tracking requires a later version of @amplitude/analytics-browser. Form interaction events are not tracked.");
            return;
          }
          if (typeof document === "undefined") {
            return;
          }
          var addFormInteractionListener = function(form) {
            var hasFormChanged = false;
            addEventListener2(form, "change", function() {
              var _a2;
              var formDestination = extractFormAction(form);
              if (!hasFormChanged) {
                amplitude.track(DEFAULT_FORM_START_EVENT, (_a2 = {}, _a2[FORM_ID] = stringOrUndefined(form.id), _a2[FORM_NAME] = stringOrUndefined(form.name), _a2[FORM_DESTINATION] = formDestination, _a2));
              }
              hasFormChanged = true;
            });
            addEventListener2(form, "submit", function() {
              var _a2, _b;
              var formDestination = extractFormAction(form);
              if (!hasFormChanged) {
                amplitude.track(DEFAULT_FORM_START_EVENT, (_a2 = {}, _a2[FORM_ID] = stringOrUndefined(form.id), _a2[FORM_NAME] = stringOrUndefined(form.name), _a2[FORM_DESTINATION] = formDestination, _a2));
              }
              amplitude.track(DEFAULT_FORM_SUBMIT_EVENT, (_b = {}, _b[FORM_ID] = stringOrUndefined(form.id), _b[FORM_NAME] = stringOrUndefined(form.name), _b[FORM_DESTINATION] = formDestination, _b));
              hasFormChanged = false;
            });
          };
          var forms = Array.from(document.getElementsByTagName("form"));
          forms.forEach(addFormInteractionListener);
          if (typeof MutationObserver !== "undefined") {
            observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                  if (node.nodeName === "FORM") {
                    addFormInteractionListener(node);
                  }
                  if ("querySelectorAll" in node && typeof node.querySelectorAll === "function") {
                    Array.from(node.querySelectorAll("form")).map(addFormInteractionListener);
                  }
                });
              });
            });
            observer.observe(document.body, {
              subtree: true,
              childList: true
            });
          }
        };
        if (document.readyState === "complete") {
          initializeFormTracking();
        } else {
          window_1 = getGlobalScope$1();
          if (window_1) {
            window_1.addEventListener("load", initializeFormTracking);
          } else {
            config2.loggerProvider.debug("Form interaction tracking is not installed because global is undefined.");
          }
        }
        return [
          2
          /*return*/
        ];
      });
    });
  };
  var execute = function(event) {
    return __awaiter(void 0, void 0, void 0, function() {
      return __generator(this, function(_a) {
        return [2, event];
      });
    });
  };
  var teardown = function() {
    return __awaiter(void 0, void 0, void 0, function() {
      return __generator(this, function(_a) {
        observer === null || observer === void 0 ? void 0 : observer.disconnect();
        removeClickListeners();
        return [
          2
          /*return*/
        ];
      });
    });
  };
  return {
    name,
    type,
    setup,
    execute,
    teardown
  };
};
var stringOrUndefined = function(name) {
  if (typeof name !== "string") {
    return void 0;
  }
  return name;
};
var extractFormAction = function(form) {
  var formDestination = form.getAttribute("action");
  try {
    formDestination = new URL(encodeURI(formDestination !== null && formDestination !== void 0 ? formDestination : ""), window.location.href).href;
  } catch (_a) {
  }
  return formDestination;
};
var fileDownloadTracking = function() {
  var observer;
  var eventListeners = [];
  var addEventListener2 = function(element, type2, handler) {
    element.addEventListener(type2, handler);
    eventListeners.push({
      element,
      type: type2,
      handler
    });
  };
  var removeClickListeners = function() {
    eventListeners.forEach(function(_a) {
      var element = _a.element, type2 = _a.type, handler = _a.handler;
      element === null || element === void 0 ? void 0 : element.removeEventListener(type2, handler);
    });
    eventListeners = [];
  };
  var name = "@amplitude/plugin-file-download-tracking-browser";
  var type = "enrichment";
  var setup = function(config2, amplitude) {
    return __awaiter(void 0, void 0, void 0, function() {
      var initializeFileDownloadTracking, window_1;
      return __generator(this, function(_a) {
        initializeFileDownloadTracking = function() {
          if (!amplitude) {
            config2.loggerProvider.warn("File download tracking requires a later version of @amplitude/analytics-browser. File download events are not tracked.");
            return;
          }
          if (typeof document === "undefined") {
            return;
          }
          var addFileDownloadListener = function(a2) {
            var url;
            try {
              url = new URL(a2.href, window.location.href);
            } catch (_a2) {
              return;
            }
            var result = ext.exec(url.href);
            var fileExtension = result === null || result === void 0 ? void 0 : result[1];
            if (fileExtension) {
              addEventListener2(a2, "click", function() {
                var _a2;
                if (fileExtension) {
                  amplitude.track(DEFAULT_FILE_DOWNLOAD_EVENT, (_a2 = {}, _a2[FILE_EXTENSION] = fileExtension, _a2[FILE_NAME] = url.pathname, _a2[LINK_ID] = a2.id, _a2[LINK_TEXT] = a2.text, _a2[LINK_URL] = a2.href, _a2));
                }
              });
            }
          };
          var ext = /\.(pdf|xlsx?|docx?|txt|rtf|csv|exe|key|pp(s|t|tx)|7z|pkg|rar|gz|zip|avi|mov|mp4|mpe?g|wmv|midi?|mp3|wav|wma)(\?.+)?$/;
          var links = Array.from(document.getElementsByTagName("a"));
          links.forEach(addFileDownloadListener);
          if (typeof MutationObserver !== "undefined") {
            observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                  if (node.nodeName === "A") {
                    addFileDownloadListener(node);
                  }
                  if ("querySelectorAll" in node && typeof node.querySelectorAll === "function") {
                    Array.from(node.querySelectorAll("a")).map(addFileDownloadListener);
                  }
                });
              });
            });
            observer.observe(document.body, {
              subtree: true,
              childList: true
            });
          }
        };
        if (document.readyState === "complete") {
          initializeFileDownloadTracking();
        } else {
          window_1 = getGlobalScope$1();
          if (window_1) {
            window_1.addEventListener("load", initializeFileDownloadTracking);
          } else {
            config2.loggerProvider.debug("File download tracking is not installed because global is undefined.");
          }
        }
        return [
          2
          /*return*/
        ];
      });
    });
  };
  var execute = function(event) {
    return __awaiter(void 0, void 0, void 0, function() {
      return __generator(this, function(_a) {
        return [2, event];
      });
    });
  };
  var teardown = function() {
    return __awaiter(void 0, void 0, void 0, function() {
      return __generator(this, function(_a) {
        observer === null || observer === void 0 ? void 0 : observer.disconnect();
        removeClickListeners();
        return [
          2
          /*return*/
        ];
      });
    });
  };
  return {
    name,
    type,
    setup,
    execute,
    teardown
  };
};
var notified = false;
var detNotify = function(config2) {
  if (notified || config2.defaultTracking !== void 0) {
    return;
  }
  var message = "`options.defaultTracking` is set to undefined. This implicitly configures your Amplitude instance to track Page Views, Sessions, File Downloads, and Form Interactions. You can suppress this warning by explicitly setting a value to `options.defaultTracking`. The value must either be a boolean, to enable and disable all default events, or an object, for advanced configuration. For example:\n\namplitude.init(<YOUR_API_KEY>, {\n  defaultTracking: true,\n});\n\nVisit https://www.docs.developers.amplitude.com/data/sdks/browser-2/#tracking-default-events for more details.";
  config2.loggerProvider.warn(message);
  notified = true;
};
var networkConnectivityCheckerPlugin = function() {
  var name = "@amplitude/plugin-network-checker-browser";
  var type = "before";
  var globalScope = getGlobalScope$1();
  var eventListeners = [];
  var addNetworkListener = function(type2, handler) {
    if (globalScope === null || globalScope === void 0 ? void 0 : globalScope.addEventListener) {
      globalScope === null || globalScope === void 0 ? void 0 : globalScope.addEventListener(type2, handler);
      eventListeners.push({
        type: type2,
        handler
      });
    }
  };
  var removeNetworkListeners = function() {
    eventListeners.forEach(function(_a) {
      var type2 = _a.type, handler = _a.handler;
      globalScope === null || globalScope === void 0 ? void 0 : globalScope.removeEventListener(type2, handler);
    });
    eventListeners = [];
  };
  var setup = function(config2, amplitude) {
    return __awaiter(void 0, void 0, void 0, function() {
      return __generator(this, function(_a) {
        if (typeof navigator === "undefined") {
          config2.loggerProvider.debug("Network connectivity checker plugin is disabled because navigator is not available.");
          config2.offline = false;
          return [
            2
            /*return*/
          ];
        }
        config2.offline = !navigator.onLine;
        addNetworkListener("online", function() {
          config2.loggerProvider.debug("Network connectivity changed to online.");
          config2.offline = false;
          setTimeout(function() {
            amplitude.flush();
          }, config2.flushIntervalMillis);
        });
        addNetworkListener("offline", function() {
          config2.loggerProvider.debug("Network connectivity changed to offline.");
          config2.offline = true;
        });
        return [
          2
          /*return*/
        ];
      });
    });
  };
  var teardown = function() {
    return __awaiter(void 0, void 0, void 0, function() {
      return __generator(this, function(_a) {
        removeNetworkListeners();
        return [
          2
          /*return*/
        ];
      });
    });
  };
  return {
    name,
    type,
    setup,
    teardown
  };
};
function translateRemoteConfigToLocal(config2) {
  var e_1, _a;
  if (typeof config2 !== "object" || config2 === null) {
    return;
  }
  if (Array.isArray(config2)) {
    return;
  }
  var propertyNames = Object.keys(config2);
  try {
    for (var propertyNames_1 = __values$1(propertyNames), propertyNames_1_1 = propertyNames_1.next(); !propertyNames_1_1.done; propertyNames_1_1 = propertyNames_1.next()) {
      var propertyName = propertyNames_1_1.value;
      try {
        var value = config2[propertyName];
        if (typeof (value === null || value === void 0 ? void 0 : value.enabled) === "boolean") {
          if (value.enabled) {
            delete value.enabled;
            if (Object.keys(value).length === 0) {
              config2[propertyName] = true;
            }
          } else {
            config2[propertyName] = false;
          }
        }
        translateRemoteConfigToLocal(value);
      } catch (e2) {
      }
    }
  } catch (e_1_1) {
    e_1 = { error: e_1_1 };
  } finally {
    try {
      if (propertyNames_1_1 && !propertyNames_1_1.done && (_a = propertyNames_1.return)) _a.call(propertyNames_1);
    } finally {
      if (e_1) throw e_1.error;
    }
  }
}
function updateBrowserConfigWithRemoteConfig(remoteConfig, browserConfig) {
  var e_2, _a;
  var _b, _c;
  if (!remoteConfig) {
    return;
  }
  translateRemoteConfigToLocal(remoteConfig);
  try {
    browserConfig.loggerProvider.debug("Update browser config with remote configuration:", JSON.stringify(remoteConfig));
    var typedRemoteConfig = remoteConfig;
    if (typedRemoteConfig && "autocapture" in typedRemoteConfig) {
      if (typeof typedRemoteConfig.autocapture === "boolean") {
        browserConfig.autocapture = typedRemoteConfig.autocapture;
      }
      if (typeof typedRemoteConfig.autocapture === "object" && typedRemoteConfig.autocapture !== null) {
        var transformedAutocaptureRemoteConfig = __assign$1({}, typedRemoteConfig.autocapture);
        if (browserConfig.autocapture === void 0) {
          browserConfig.autocapture = typedRemoteConfig.autocapture;
        }
        if (typeof typedRemoteConfig.autocapture.elementInteractions === "object" && typedRemoteConfig.autocapture.elementInteractions !== null && ((_b = typedRemoteConfig.autocapture.elementInteractions.pageUrlAllowlistRegex) === null || _b === void 0 ? void 0 : _b.length)) {
          transformedAutocaptureRemoteConfig.elementInteractions = __assign$1({}, typedRemoteConfig.autocapture.elementInteractions);
          var transformedRcElementInteractions = transformedAutocaptureRemoteConfig.elementInteractions;
          var exactAllowList = (_c = transformedRcElementInteractions.pageUrlAllowlist) !== null && _c !== void 0 ? _c : [];
          var regexList = [];
          try {
            for (var _d = __values$1(typedRemoteConfig.autocapture.elementInteractions.pageUrlAllowlistRegex), _e = _d.next(); !_e.done; _e = _d.next()) {
              var pattern = _e.value;
              try {
                regexList.push(new RegExp(pattern));
              } catch (regexError) {
                browserConfig.loggerProvider.warn("Invalid regex pattern: ".concat(pattern), regexError);
              }
            }
          } catch (e_2_1) {
            e_2 = { error: e_2_1 };
          } finally {
            try {
              if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            } finally {
              if (e_2) throw e_2.error;
            }
          }
          var combinedPageUrlAllowlist = exactAllowList.concat(regexList);
          transformedRcElementInteractions.pageUrlAllowlist = combinedPageUrlAllowlist;
          delete transformedRcElementInteractions.pageUrlAllowlistRegex;
        }
        if (typeof browserConfig.autocapture === "boolean") {
          browserConfig.autocapture = __assign$1({ attribution: browserConfig.autocapture, fileDownloads: browserConfig.autocapture, formInteractions: browserConfig.autocapture, pageViews: browserConfig.autocapture, sessions: browserConfig.autocapture, elementInteractions: browserConfig.autocapture, webVitals: browserConfig.autocapture, frustrationInteractions: browserConfig.autocapture }, transformedAutocaptureRemoteConfig);
        }
        if (typeof browserConfig.autocapture === "object") {
          browserConfig.autocapture = __assign$1(__assign$1({}, browserConfig.autocapture), transformedAutocaptureRemoteConfig);
        }
      }
      browserConfig.defaultTracking = browserConfig.autocapture;
    }
    browserConfig.loggerProvider.debug("Browser config after remote config update:", JSON.stringify(browserConfig));
  } catch (e2) {
    browserConfig.loggerProvider.error("Failed to apply remote configuration because of error: ", e2);
  }
}
var ServerZone;
(function(ServerZone2) {
  ServerZone2["US"] = "US";
  ServerZone2["EU"] = "EU";
  ServerZone2["STAGING"] = "STAGING";
})(ServerZone || (ServerZone = {}));
var Status;
(function(Status2) {
  Status2["Unknown"] = "unknown";
  Status2["Skipped"] = "skipped";
  Status2["Success"] = "success";
  Status2["RateLimit"] = "rate_limit";
  Status2["PayloadTooLarge"] = "payload_too_large";
  Status2["Invalid"] = "invalid";
  Status2["Failed"] = "failed";
  Status2["Timeout"] = "Timeout";
  Status2["SystemError"] = "SystemError";
})(Status || (Status = {}));
var BaseTransport = (
  /** @class */
  function() {
    function BaseTransport2() {
    }
    BaseTransport2.prototype.send = function(_serverUrl, _payload) {
      return Promise.resolve(null);
    };
    BaseTransport2.prototype.buildResponse = function(responseJSON) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
      if (typeof responseJSON !== "object") {
        return null;
      }
      var statusCode = responseJSON.code || 0;
      var status = this.buildStatus(statusCode);
      switch (status) {
        case Status.Success:
          return {
            status,
            statusCode,
            body: {
              eventsIngested: (_a = responseJSON.events_ingested) !== null && _a !== void 0 ? _a : 0,
              payloadSizeBytes: (_b = responseJSON.payload_size_bytes) !== null && _b !== void 0 ? _b : 0,
              serverUploadTime: (_c = responseJSON.server_upload_time) !== null && _c !== void 0 ? _c : 0
            }
          };
        case Status.Invalid:
          return {
            status,
            statusCode,
            body: {
              error: (_d = responseJSON.error) !== null && _d !== void 0 ? _d : "",
              missingField: (_e = responseJSON.missing_field) !== null && _e !== void 0 ? _e : "",
              eventsWithInvalidFields: (_f = responseJSON.events_with_invalid_fields) !== null && _f !== void 0 ? _f : {},
              eventsWithMissingFields: (_g = responseJSON.events_with_missing_fields) !== null && _g !== void 0 ? _g : {},
              eventsWithInvalidIdLengths: (_h = responseJSON.events_with_invalid_id_lengths) !== null && _h !== void 0 ? _h : {},
              epsThreshold: (_j = responseJSON.eps_threshold) !== null && _j !== void 0 ? _j : 0,
              exceededDailyQuotaDevices: (_k = responseJSON.exceeded_daily_quota_devices) !== null && _k !== void 0 ? _k : {},
              silencedDevices: (_l = responseJSON.silenced_devices) !== null && _l !== void 0 ? _l : [],
              silencedEvents: (_m = responseJSON.silenced_events) !== null && _m !== void 0 ? _m : [],
              throttledDevices: (_o = responseJSON.throttled_devices) !== null && _o !== void 0 ? _o : {},
              throttledEvents: (_p = responseJSON.throttled_events) !== null && _p !== void 0 ? _p : []
            }
          };
        case Status.PayloadTooLarge:
          return {
            status,
            statusCode,
            body: {
              error: (_q = responseJSON.error) !== null && _q !== void 0 ? _q : ""
            }
          };
        case Status.RateLimit:
          return {
            status,
            statusCode,
            body: {
              error: (_r = responseJSON.error) !== null && _r !== void 0 ? _r : "",
              epsThreshold: (_s = responseJSON.eps_threshold) !== null && _s !== void 0 ? _s : 0,
              throttledDevices: (_t = responseJSON.throttled_devices) !== null && _t !== void 0 ? _t : {},
              throttledUsers: (_u = responseJSON.throttled_users) !== null && _u !== void 0 ? _u : {},
              exceededDailyQuotaDevices: (_v = responseJSON.exceeded_daily_quota_devices) !== null && _v !== void 0 ? _v : {},
              exceededDailyQuotaUsers: (_w = responseJSON.exceeded_daily_quota_users) !== null && _w !== void 0 ? _w : {},
              throttledEvents: (_x = responseJSON.throttled_events) !== null && _x !== void 0 ? _x : []
            }
          };
        case Status.Timeout:
        default:
          return {
            status,
            statusCode
          };
      }
    };
    BaseTransport2.prototype.buildStatus = function(code) {
      if (code >= 200 && code < 300) {
        return Status.Success;
      }
      if (code === 429) {
        return Status.RateLimit;
      }
      if (code === 413) {
        return Status.PayloadTooLarge;
      }
      if (code === 408) {
        return Status.Timeout;
      }
      if (code >= 400 && code < 500) {
        return Status.Invalid;
      }
      if (code >= 500) {
        return Status.Failed;
      }
      return Status.Unknown;
    };
    return BaseTransport2;
  }()
);
var UNEXPECTED_NETWORK_ERROR_MESSAGE = "Network error occurred, remote config fetch failed";
var SUCCESS_REMOTE_CONFIG = "Remote config successfully fetched";
var MAX_RETRIES_EXCEEDED_MESSAGE = "Remote config fetch rejected due to exceeded retry count";
var TIMEOUT_MESSAGE = "Remote config fetch rejected due to timeout after 5 seconds";
var UNEXPECTED_ERROR_MESSAGE = "Unexpected error occurred";
var REMOTE_CONFIG_SERVER_URL = "https://sr-client-cfg.amplitude.com/config";
var REMOTE_CONFIG_SERVER_URL_STAGING = "https://sr-client-cfg.stag2.amplitude.com/config";
var REMOTE_CONFIG_SERVER_URL_EU = "https://sr-client-cfg.eu.amplitude.com/config";
var RemoteConfigFetch = (
  /** @class */
  function() {
    function RemoteConfigFetch2(_a) {
      var localConfig = _a.localConfig, configKeys = _a.configKeys;
      var _this = this;
      this.retryTimeout = 1e3;
      this.attempts = 0;
      this.sessionTargetingMatch = false;
      this.metrics = {};
      this.getRemoteNamespaceConfig = function(configNamespace, sessionId) {
        return __awaiter(_this, void 0, void 0, function() {
          var fetchStartTime, configAPIResponse, remoteConfig;
          return __generator(this, function(_a2) {
            switch (_a2.label) {
              case 0:
                fetchStartTime = Date.now();
                return [4, this.fetchWithTimeout(sessionId)];
              case 1:
                configAPIResponse = _a2.sent();
                if (configAPIResponse) {
                  remoteConfig = configAPIResponse.configs && configAPIResponse.configs[configNamespace];
                  if (remoteConfig) {
                    this.metrics.fetchTimeAPISuccess = Date.now() - fetchStartTime;
                    return [2, remoteConfig];
                  }
                }
                this.metrics.fetchTimeAPIFail = Date.now() - fetchStartTime;
                return [2, void 0];
            }
          });
        });
      };
      this.getRemoteConfig = function(configNamespace, key, sessionId) {
        return __awaiter(_this, void 0, void 0, function() {
          var namespaceConfig;
          return __generator(this, function(_a2) {
            switch (_a2.label) {
              case 0:
                return [4, this.getRemoteNamespaceConfig(configNamespace, sessionId)];
              case 1:
                namespaceConfig = _a2.sent();
                return [2, namespaceConfig === null || namespaceConfig === void 0 ? void 0 : namespaceConfig[key]];
            }
          });
        });
      };
      this.fetchWithTimeout = function(sessionId) {
        return __awaiter(_this, void 0, void 0, function() {
          var controller, timeoutId, remoteConfig;
          return __generator(this, function(_a2) {
            switch (_a2.label) {
              case 0:
                controller = new AbortController();
                timeoutId = setTimeout(function() {
                  return controller.abort();
                }, 5e3);
                return [4, this.fetchRemoteConfig(controller.signal, sessionId)];
              case 1:
                remoteConfig = _a2.sent();
                clearTimeout(timeoutId);
                return [2, remoteConfig];
            }
          });
        });
      };
      this.fetchRemoteConfig = function(signal, sessionId) {
        return __awaiter(_this, void 0, void 0, function() {
          var urlParams, _a2, _b, configKey, options, serverUrl, res, parsedStatus, e_1, knownError;
          var e_2, _c;
          var _d;
          return __generator(this, function(_e) {
            switch (_e.label) {
              case 0:
                if (sessionId === this.lastFetchedSessionId && this.attempts >= this.localConfig.flushMaxRetries) {
                  return [2, this.completeRequest({ err: MAX_RETRIES_EXCEEDED_MESSAGE })];
                } else if (signal.aborted) {
                  return [2, this.completeRequest({ err: TIMEOUT_MESSAGE })];
                } else if (sessionId !== this.lastFetchedSessionId) {
                  this.lastFetchedSessionId = sessionId;
                  this.attempts = 0;
                }
                _e.label = 1;
              case 1:
                _e.trys.push([1, 3, , 4]);
                urlParams = new URLSearchParams({
                  api_key: this.localConfig.apiKey
                });
                try {
                  for (_a2 = __values$1(this.configKeys), _b = _a2.next(); !_b.done; _b = _a2.next()) {
                    configKey = _b.value;
                    urlParams.append("config_keys", configKey);
                  }
                } catch (e_2_1) {
                  e_2 = { error: e_2_1 };
                } finally {
                  try {
                    if (_b && !_b.done && (_c = _a2.return)) _c.call(_a2);
                  } finally {
                    if (e_2) throw e_2.error;
                  }
                }
                if (sessionId) {
                  urlParams.set("session_id", String(sessionId));
                }
                options = {
                  headers: {
                    Accept: "*/*"
                  },
                  method: "GET"
                };
                serverUrl = "".concat(this.getServerUrl(), "?").concat(urlParams.toString());
                this.attempts += 1;
                return [4, fetch(serverUrl, __assign$1(__assign$1({}, options), { signal }))];
              case 2:
                res = _e.sent();
                if (res === null) {
                  return [2, this.completeRequest({ err: UNEXPECTED_ERROR_MESSAGE })];
                }
                parsedStatus = new BaseTransport().buildStatus(res.status);
                switch (parsedStatus) {
                  case Status.Success:
                    this.attempts = 0;
                    return [2, this.parseAndStoreConfig(res)];
                  case Status.Failed:
                    return [2, this.retryFetch(signal, sessionId)];
                  default:
                    return [2, this.completeRequest({ err: UNEXPECTED_NETWORK_ERROR_MESSAGE })];
                }
              case 3:
                e_1 = _e.sent();
                knownError = e_1;
                if (signal.aborted) {
                  return [2, this.completeRequest({ err: TIMEOUT_MESSAGE })];
                }
                return [2, this.completeRequest({ err: (_d = knownError.message) !== null && _d !== void 0 ? _d : UNEXPECTED_ERROR_MESSAGE })];
              case 4:
                return [
                  2
                  /*return*/
                ];
            }
          });
        });
      };
      this.retryFetch = function(signal, sessionId) {
        return __awaiter(_this, void 0, void 0, function() {
          var _this2 = this;
          return __generator(this, function(_a2) {
            switch (_a2.label) {
              case 0:
                return [4, new Promise(function(resolve) {
                  return setTimeout(resolve, _this2.attempts * _this2.retryTimeout);
                })];
              case 1:
                _a2.sent();
                return [2, this.fetchRemoteConfig(signal, sessionId)];
            }
          });
        });
      };
      this.parseAndStoreConfig = function(res) {
        return __awaiter(_this, void 0, void 0, function() {
          var remoteConfig;
          return __generator(this, function(_a2) {
            switch (_a2.label) {
              case 0:
                return [4, res.json()];
              case 1:
                remoteConfig = _a2.sent();
                this.completeRequest({ success: SUCCESS_REMOTE_CONFIG });
                return [2, remoteConfig];
            }
          });
        });
      };
      this.localConfig = localConfig;
      this.configKeys = configKeys;
    }
    RemoteConfigFetch2.prototype.getServerUrl = function() {
      if (this.localConfig.configServerUrl) {
        return this.localConfig.configServerUrl;
      }
      if (this.localConfig.serverZone === ServerZone.STAGING) {
        return REMOTE_CONFIG_SERVER_URL_STAGING;
      }
      if (this.localConfig.serverZone === ServerZone.EU) {
        return REMOTE_CONFIG_SERVER_URL_EU;
      }
      return REMOTE_CONFIG_SERVER_URL;
    };
    RemoteConfigFetch2.prototype.completeRequest = function(_a) {
      var err = _a.err, success = _a.success;
      if (err) {
        throw new Error(err);
      } else if (success) {
        this.localConfig.loggerProvider.log(success);
      }
    };
    return RemoteConfigFetch2;
  }()
);
var createRemoteConfigFetch$1 = function(_a) {
  var localConfig = _a.localConfig, configKeys = _a.configKeys;
  return __awaiter(void 0, void 0, void 0, function() {
    return __generator(this, function(_b) {
      return [2, new RemoteConfigFetch({ localConfig, configKeys })];
    });
  });
};
var createRemoteConfigFetch = createRemoteConfigFetch$1;
var PLUGIN_NAME$2 = "@amplitude/plugin-autocapture-browser";
var FRUSTRATION_PLUGIN_NAME = "@amplitude/plugin-frustration-browser";
var AMPLITUDE_ELEMENT_CLICKED_EVENT = "[Amplitude] Element Clicked";
var AMPLITUDE_ELEMENT_DEAD_CLICKED_EVENT = "[Amplitude] Dead Click";
var AMPLITUDE_ELEMENT_RAGE_CLICKED_EVENT = "[Amplitude] Rage Click";
var AMPLITUDE_ELEMENT_CHANGED_EVENT = "[Amplitude] Element Changed";
var AMPLITUDE_EVENT_PROP_ELEMENT_ID = "[Amplitude] Element ID";
var AMPLITUDE_EVENT_PROP_ELEMENT_CLASS = "[Amplitude] Element Class";
var AMPLITUDE_EVENT_PROP_ELEMENT_TAG = "[Amplitude] Element Tag";
var AMPLITUDE_EVENT_PROP_ELEMENT_TEXT = "[Amplitude] Element Text";
var AMPLITUDE_EVENT_PROP_ELEMENT_HIERARCHY = "[Amplitude] Element Hierarchy";
var AMPLITUDE_EVENT_PROP_ELEMENT_HREF = "[Amplitude] Element Href";
var AMPLITUDE_EVENT_PROP_ELEMENT_POSITION_LEFT = "[Amplitude] Element Position Left";
var AMPLITUDE_EVENT_PROP_ELEMENT_POSITION_TOP = "[Amplitude] Element Position Top";
var AMPLITUDE_EVENT_PROP_ELEMENT_ARIA_LABEL = "[Amplitude] Element Aria Label";
var AMPLITUDE_EVENT_PROP_ELEMENT_ATTRIBUTES = "[Amplitude] Element Attributes";
var AMPLITUDE_EVENT_PROP_ELEMENT_PARENT_LABEL = "[Amplitude] Element Parent Label";
var AMPLITUDE_EVENT_PROP_PAGE_URL = "[Amplitude] Page URL";
var AMPLITUDE_EVENT_PROP_PAGE_TITLE = "[Amplitude] Page Title";
var AMPLITUDE_EVENT_PROP_VIEWPORT_HEIGHT = "[Amplitude] Viewport Height";
var AMPLITUDE_EVENT_PROP_VIEWPORT_WIDTH = "[Amplitude] Viewport Width";
var AMPLITUDE_ORIGIN = "https://app.amplitude.com";
var AMPLITUDE_ORIGIN_EU = "https://app.eu.amplitude.com";
var AMPLITUDE_ORIGIN_STAGING = "https://apps.stag2.amplitude.com";
var AMPLITUDE_ORIGINS_MAP = {
  US: AMPLITUDE_ORIGIN,
  EU: AMPLITUDE_ORIGIN_EU,
  STAGING: AMPLITUDE_ORIGIN_STAGING
};
var AMPLITUDE_VISUAL_TAGGING_SELECTOR_SCRIPT_URL = "https://cdn.amplitude.com/libs/visual-tagging-selector-1.0.0-alpha.js.gz";
var AMPLITUDE_VISUAL_TAGGING_HIGHLIGHT_CLASS = "amp-visual-tagging-selector-highlight";
var DATA_AMP_MASK_ATTRIBUTES = "data-amp-mask-attributes";
var TEXT_MASK_ATTRIBUTE = "data-amp-mask";
var MASKED_TEXT_VALUE = "*****";
var MAX_MASK_TEXT_PATTERNS = 25;
function isFunction(value) {
  return typeof value === "function";
}
function createErrorClass(createImpl2) {
  var _super = function(instance) {
    Error.call(instance);
    instance.stack = new Error().stack;
  };
  var ctorFunc = createImpl2(_super);
  ctorFunc.prototype = Object.create(Error.prototype);
  ctorFunc.prototype.constructor = ctorFunc;
  return ctorFunc;
}
var UnsubscriptionError = createErrorClass(function(_super) {
  return function UnsubscriptionErrorImpl(errors) {
    _super(this);
    this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err, i2) {
      return i2 + 1 + ") " + err.toString();
    }).join("\n  ") : "";
    this.name = "UnsubscriptionError";
    this.errors = errors;
  };
});
function arrRemove(arr, item) {
  if (arr) {
    var index2 = arr.indexOf(item);
    0 <= index2 && arr.splice(index2, 1);
  }
}
var Subscription = function() {
  function Subscription2(initialTeardown) {
    this.initialTeardown = initialTeardown;
    this.closed = false;
    this._parentage = null;
    this._finalizers = null;
  }
  Subscription2.prototype.unsubscribe = function() {
    var e_1, _a, e_2, _b;
    var errors;
    if (!this.closed) {
      this.closed = true;
      var _parentage = this._parentage;
      if (_parentage) {
        this._parentage = null;
        if (Array.isArray(_parentage)) {
          try {
            for (var _parentage_1 = __values$1(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
              var parent_1 = _parentage_1_1.value;
              parent_1.remove(this);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
            } finally {
              if (e_1) throw e_1.error;
            }
          }
        } else {
          _parentage.remove(this);
        }
      }
      var initialFinalizer = this.initialTeardown;
      if (isFunction(initialFinalizer)) {
        try {
          initialFinalizer();
        } catch (e2) {
          errors = e2 instanceof UnsubscriptionError ? e2.errors : [e2];
        }
      }
      var _finalizers = this._finalizers;
      if (_finalizers) {
        this._finalizers = null;
        try {
          for (var _finalizers_1 = __values$1(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
            var finalizer = _finalizers_1_1.value;
            try {
              execFinalizer(finalizer);
            } catch (err) {
              errors = errors !== null && errors !== void 0 ? errors : [];
              if (err instanceof UnsubscriptionError) {
                errors = __spreadArray(__spreadArray([], __read$1(errors)), __read$1(err.errors));
              } else {
                errors.push(err);
              }
            }
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
      }
      if (errors) {
        throw new UnsubscriptionError(errors);
      }
    }
  };
  Subscription2.prototype.add = function(teardown) {
    var _a;
    if (teardown && teardown !== this) {
      if (this.closed) {
        execFinalizer(teardown);
      } else {
        if (teardown instanceof Subscription2) {
          if (teardown.closed || teardown._hasParent(this)) {
            return;
          }
          teardown._addParent(this);
        }
        (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
      }
    }
  };
  Subscription2.prototype._hasParent = function(parent) {
    var _parentage = this._parentage;
    return _parentage === parent || Array.isArray(_parentage) && _parentage.includes(parent);
  };
  Subscription2.prototype._addParent = function(parent) {
    var _parentage = this._parentage;
    this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
  };
  Subscription2.prototype._removeParent = function(parent) {
    var _parentage = this._parentage;
    if (_parentage === parent) {
      this._parentage = null;
    } else if (Array.isArray(_parentage)) {
      arrRemove(_parentage, parent);
    }
  };
  Subscription2.prototype.remove = function(teardown) {
    var _finalizers = this._finalizers;
    _finalizers && arrRemove(_finalizers, teardown);
    if (teardown instanceof Subscription2) {
      teardown._removeParent(this);
    }
  };
  Subscription2.EMPTY = function() {
    var empty = new Subscription2();
    empty.closed = true;
    return empty;
  }();
  return Subscription2;
}();
var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
function isSubscription(value) {
  return value instanceof Subscription || value && "closed" in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe);
}
function execFinalizer(finalizer) {
  if (isFunction(finalizer)) {
    finalizer();
  } else {
    finalizer.unsubscribe();
  }
}
var config = {
  Promise: void 0
};
var timeoutProvider = {
  setTimeout: function(handler, timeout2) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    return setTimeout.apply(void 0, __spreadArray([handler, timeout2], __read$1(args)));
  },
  clearTimeout: function(handle) {
    return clearTimeout(handle);
  },
  delegate: void 0
};
function reportUnhandledError(err) {
  timeoutProvider.setTimeout(function() {
    {
      throw err;
    }
  });
}
function noop() {
}
function errorContext(cb) {
  {
    cb();
  }
}
var Subscriber = function(_super) {
  __extends(Subscriber2, _super);
  function Subscriber2(destination) {
    var _this = _super.call(this) || this;
    _this.isStopped = false;
    if (destination) {
      _this.destination = destination;
      if (isSubscription(destination)) {
        destination.add(_this);
      }
    } else {
      _this.destination = EMPTY_OBSERVER;
    }
    return _this;
  }
  Subscriber2.create = function(next, error, complete) {
    return new SafeSubscriber(next, error, complete);
  };
  Subscriber2.prototype.next = function(value) {
    if (this.isStopped) ;
    else {
      this._next(value);
    }
  };
  Subscriber2.prototype.error = function(err) {
    if (this.isStopped) ;
    else {
      this.isStopped = true;
      this._error(err);
    }
  };
  Subscriber2.prototype.complete = function() {
    if (this.isStopped) ;
    else {
      this.isStopped = true;
      this._complete();
    }
  };
  Subscriber2.prototype.unsubscribe = function() {
    if (!this.closed) {
      this.isStopped = true;
      _super.prototype.unsubscribe.call(this);
      this.destination = null;
    }
  };
  Subscriber2.prototype._next = function(value) {
    this.destination.next(value);
  };
  Subscriber2.prototype._error = function(err) {
    try {
      this.destination.error(err);
    } finally {
      this.unsubscribe();
    }
  };
  Subscriber2.prototype._complete = function() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  };
  return Subscriber2;
}(Subscription);
var ConsumerObserver = function() {
  function ConsumerObserver2(partialObserver) {
    this.partialObserver = partialObserver;
  }
  ConsumerObserver2.prototype.next = function(value) {
    var partialObserver = this.partialObserver;
    if (partialObserver.next) {
      try {
        partialObserver.next(value);
      } catch (error) {
        handleUnhandledError(error);
      }
    }
  };
  ConsumerObserver2.prototype.error = function(err) {
    var partialObserver = this.partialObserver;
    if (partialObserver.error) {
      try {
        partialObserver.error(err);
      } catch (error) {
        handleUnhandledError(error);
      }
    } else {
      handleUnhandledError(err);
    }
  };
  ConsumerObserver2.prototype.complete = function() {
    var partialObserver = this.partialObserver;
    if (partialObserver.complete) {
      try {
        partialObserver.complete();
      } catch (error) {
        handleUnhandledError(error);
      }
    }
  };
  return ConsumerObserver2;
}();
var SafeSubscriber = function(_super) {
  __extends(SafeSubscriber2, _super);
  function SafeSubscriber2(observerOrNext, error, complete) {
    var _this = _super.call(this) || this;
    var partialObserver;
    if (isFunction(observerOrNext) || !observerOrNext) {
      partialObserver = {
        next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : void 0,
        error: error !== null && error !== void 0 ? error : void 0,
        complete: complete !== null && complete !== void 0 ? complete : void 0
      };
    } else {
      {
        partialObserver = observerOrNext;
      }
    }
    _this.destination = new ConsumerObserver(partialObserver);
    return _this;
  }
  return SafeSubscriber2;
}(Subscriber);
function handleUnhandledError(error) {
  {
    reportUnhandledError(error);
  }
}
function defaultErrorHandler(err) {
  throw err;
}
var EMPTY_OBSERVER = {
  closed: true,
  next: noop,
  error: defaultErrorHandler,
  complete: noop
};
var observable = function() {
  return typeof Symbol === "function" && Symbol.observable || "@@observable";
}();
function identity(x2) {
  return x2;
}
function pipeFromArray(fns) {
  if (fns.length === 0) {
    return identity;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return function piped(input) {
    return fns.reduce(function(prev, fn) {
      return fn(prev);
    }, input);
  };
}
var Observable = function() {
  function Observable2(subscribe) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }
  Observable2.prototype.lift = function(operator) {
    var observable2 = new Observable2();
    observable2.source = this;
    observable2.operator = operator;
    return observable2;
  };
  Observable2.prototype.subscribe = function(observerOrNext, error, complete) {
    var _this = this;
    var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
    errorContext(function() {
      var _a = _this, operator = _a.operator, source = _a.source;
      subscriber.add(operator ? operator.call(subscriber, source) : source ? _this._subscribe(subscriber) : _this._trySubscribe(subscriber));
    });
    return subscriber;
  };
  Observable2.prototype._trySubscribe = function(sink) {
    try {
      return this._subscribe(sink);
    } catch (err) {
      sink.error(err);
    }
  };
  Observable2.prototype.forEach = function(next, promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function(resolve, reject) {
      var subscriber = new SafeSubscriber({
        next: function(value) {
          try {
            next(value);
          } catch (err) {
            reject(err);
            subscriber.unsubscribe();
          }
        },
        error: reject,
        complete: resolve
      });
      _this.subscribe(subscriber);
    });
  };
  Observable2.prototype._subscribe = function(subscriber) {
    var _a;
    return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
  };
  Observable2.prototype[observable] = function() {
    return this;
  };
  Observable2.prototype.pipe = function() {
    var operations = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      operations[_i] = arguments[_i];
    }
    return pipeFromArray(operations)(this);
  };
  Observable2.prototype.toPromise = function(promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function(resolve, reject) {
      var value;
      _this.subscribe(function(x2) {
        return value = x2;
      }, function(err) {
        return reject(err);
      }, function() {
        return resolve(value);
      });
    });
  };
  Observable2.create = function(subscribe) {
    return new Observable2(subscribe);
  };
  return Observable2;
}();
function getPromiseCtor(promiseCtor) {
  var _a;
  return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
  return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
}
function isSubscriber(value) {
  return value && value instanceof Subscriber || isObserver(value) && isSubscription(value);
}
function hasLift(source) {
  return isFunction(source === null || source === void 0 ? void 0 : source.lift);
}
function operate(init2) {
  return function(source) {
    if (hasLift(source)) {
      return source.lift(function(liftedSource) {
        try {
          return init2(liftedSource, this);
        } catch (err) {
          this.error(err);
        }
      });
    }
    throw new TypeError("Unable to lift unknown Observable type");
  };
}
function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
  return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}
var OperatorSubscriber = function(_super) {
  __extends(OperatorSubscriber2, _super);
  function OperatorSubscriber2(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
    var _this = _super.call(this, destination) || this;
    _this.onFinalize = onFinalize;
    _this.shouldUnsubscribe = shouldUnsubscribe;
    _this._next = onNext ? function(value) {
      try {
        onNext(value);
      } catch (err) {
        destination.error(err);
      }
    } : _super.prototype._next;
    _this._error = onError ? function(err) {
      try {
        onError(err);
      } catch (err2) {
        destination.error(err2);
      } finally {
        this.unsubscribe();
      }
    } : _super.prototype._error;
    _this._complete = onComplete ? function() {
      try {
        onComplete();
      } catch (err) {
        destination.error(err);
      } finally {
        this.unsubscribe();
      }
    } : _super.prototype._complete;
    return _this;
  }
  OperatorSubscriber2.prototype.unsubscribe = function() {
    var _a;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      var closed_1 = this.closed;
      _super.prototype.unsubscribe.call(this);
      !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
    }
  };
  return OperatorSubscriber2;
}(Subscriber);
var ObjectUnsubscribedError = createErrorClass(function(_super) {
  return function ObjectUnsubscribedErrorImpl() {
    _super(this);
    this.name = "ObjectUnsubscribedError";
    this.message = "object unsubscribed";
  };
});
var Subject = function(_super) {
  __extends(Subject2, _super);
  function Subject2() {
    var _this = _super.call(this) || this;
    _this.closed = false;
    _this.currentObservers = null;
    _this.observers = [];
    _this.isStopped = false;
    _this.hasError = false;
    _this.thrownError = null;
    return _this;
  }
  Subject2.prototype.lift = function(operator) {
    var subject = new AnonymousSubject(this, this);
    subject.operator = operator;
    return subject;
  };
  Subject2.prototype._throwIfClosed = function() {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
  };
  Subject2.prototype.next = function(value) {
    var _this = this;
    errorContext(function() {
      var e_1, _a;
      _this._throwIfClosed();
      if (!_this.isStopped) {
        if (!_this.currentObservers) {
          _this.currentObservers = Array.from(_this.observers);
        }
        try {
          for (var _b = __values$1(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) {
            var observer = _c.value;
            observer.next(value);
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
      }
    });
  };
  Subject2.prototype.error = function(err) {
    var _this = this;
    errorContext(function() {
      _this._throwIfClosed();
      if (!_this.isStopped) {
        _this.hasError = _this.isStopped = true;
        _this.thrownError = err;
        var observers = _this.observers;
        while (observers.length) {
          observers.shift().error(err);
        }
      }
    });
  };
  Subject2.prototype.complete = function() {
    var _this = this;
    errorContext(function() {
      _this._throwIfClosed();
      if (!_this.isStopped) {
        _this.isStopped = true;
        var observers = _this.observers;
        while (observers.length) {
          observers.shift().complete();
        }
      }
    });
  };
  Subject2.prototype.unsubscribe = function() {
    this.isStopped = this.closed = true;
    this.observers = this.currentObservers = null;
  };
  Object.defineProperty(Subject2.prototype, "observed", {
    get: function() {
      var _a;
      return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
    },
    enumerable: false,
    configurable: true
  });
  Subject2.prototype._trySubscribe = function(subscriber) {
    this._throwIfClosed();
    return _super.prototype._trySubscribe.call(this, subscriber);
  };
  Subject2.prototype._subscribe = function(subscriber) {
    this._throwIfClosed();
    this._checkFinalizedStatuses(subscriber);
    return this._innerSubscribe(subscriber);
  };
  Subject2.prototype._innerSubscribe = function(subscriber) {
    var _this = this;
    var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
    if (hasError || isStopped) {
      return EMPTY_SUBSCRIPTION;
    }
    this.currentObservers = null;
    observers.push(subscriber);
    return new Subscription(function() {
      _this.currentObservers = null;
      arrRemove(observers, subscriber);
    });
  };
  Subject2.prototype._checkFinalizedStatuses = function(subscriber) {
    var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
    if (hasError) {
      subscriber.error(thrownError);
    } else if (isStopped) {
      subscriber.complete();
    }
  };
  Subject2.prototype.asObservable = function() {
    var observable2 = new Observable();
    observable2.source = this;
    return observable2;
  };
  Subject2.create = function(destination, source) {
    return new AnonymousSubject(destination, source);
  };
  return Subject2;
}(Observable);
var AnonymousSubject = function(_super) {
  __extends(AnonymousSubject2, _super);
  function AnonymousSubject2(destination, source) {
    var _this = _super.call(this) || this;
    _this.destination = destination;
    _this.source = source;
    return _this;
  }
  AnonymousSubject2.prototype.next = function(value) {
    var _a, _b;
    (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
  };
  AnonymousSubject2.prototype.error = function(err) {
    var _a, _b;
    (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
  };
  AnonymousSubject2.prototype.complete = function() {
    var _a, _b;
    (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
  };
  AnonymousSubject2.prototype._subscribe = function(subscriber) {
    var _a, _b;
    return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
  };
  return AnonymousSubject2;
}(Subject);
var dateTimestampProvider = {
  now: function() {
    return Date.now();
  }
};
var Action = function(_super) {
  __extends(Action2, _super);
  function Action2(scheduler, work) {
    return _super.call(this) || this;
  }
  Action2.prototype.schedule = function(state, delay2) {
    return this;
  };
  return Action2;
}(Subscription);
var intervalProvider = {
  setInterval: function(handler, timeout2) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    return setInterval.apply(void 0, __spreadArray([handler, timeout2], __read$1(args)));
  },
  clearInterval: function(handle) {
    return clearInterval(handle);
  },
  delegate: void 0
};
var AsyncAction = function(_super) {
  __extends(AsyncAction2, _super);
  function AsyncAction2(scheduler, work) {
    var _this = _super.call(this, scheduler, work) || this;
    _this.scheduler = scheduler;
    _this.work = work;
    _this.pending = false;
    return _this;
  }
  AsyncAction2.prototype.schedule = function(state, delay2) {
    var _a;
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (this.closed) {
      return this;
    }
    this.state = state;
    var id = this.id;
    var scheduler = this.scheduler;
    if (id != null) {
      this.id = this.recycleAsyncId(scheduler, id, delay2);
    }
    this.pending = true;
    this.delay = delay2;
    this.id = (_a = this.id) !== null && _a !== void 0 ? _a : this.requestAsyncId(scheduler, this.id, delay2);
    return this;
  };
  AsyncAction2.prototype.requestAsyncId = function(scheduler, _id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    return intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay2);
  };
  AsyncAction2.prototype.recycleAsyncId = function(_scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (delay2 != null && this.delay === delay2 && this.pending === false) {
      return id;
    }
    if (id != null) {
      intervalProvider.clearInterval(id);
    }
    return void 0;
  };
  AsyncAction2.prototype.execute = function(state, delay2) {
    if (this.closed) {
      return new Error("executing a cancelled action");
    }
    this.pending = false;
    var error = this._execute(state, delay2);
    if (error) {
      return error;
    } else if (this.pending === false && this.id != null) {
      this.id = this.recycleAsyncId(this.scheduler, this.id, null);
    }
  };
  AsyncAction2.prototype._execute = function(state, _delay) {
    var errored = false;
    var errorValue;
    try {
      this.work(state);
    } catch (e2) {
      errored = true;
      errorValue = e2 ? e2 : new Error("Scheduled action threw falsy error");
    }
    if (errored) {
      this.unsubscribe();
      return errorValue;
    }
  };
  AsyncAction2.prototype.unsubscribe = function() {
    if (!this.closed) {
      var _a = this, id = _a.id, scheduler = _a.scheduler;
      var actions = scheduler.actions;
      this.work = this.state = this.scheduler = null;
      this.pending = false;
      arrRemove(actions, this);
      if (id != null) {
        this.id = this.recycleAsyncId(scheduler, id, null);
      }
      this.delay = null;
      _super.prototype.unsubscribe.call(this);
    }
  };
  return AsyncAction2;
}(Action);
var Scheduler = function() {
  function Scheduler2(schedulerActionCtor, now) {
    if (now === void 0) {
      now = Scheduler2.now;
    }
    this.schedulerActionCtor = schedulerActionCtor;
    this.now = now;
  }
  Scheduler2.prototype.schedule = function(work, delay2, state) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    return new this.schedulerActionCtor(this, work).schedule(state, delay2);
  };
  Scheduler2.now = dateTimestampProvider.now;
  return Scheduler2;
}();
var AsyncScheduler = function(_super) {
  __extends(AsyncScheduler2, _super);
  function AsyncScheduler2(SchedulerAction, now) {
    if (now === void 0) {
      now = Scheduler.now;
    }
    var _this = _super.call(this, SchedulerAction, now) || this;
    _this.actions = [];
    _this._active = false;
    return _this;
  }
  AsyncScheduler2.prototype.flush = function(action) {
    var actions = this.actions;
    if (this._active) {
      actions.push(action);
      return;
    }
    var error;
    this._active = true;
    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (action = actions.shift());
    this._active = false;
    if (error) {
      while (action = actions.shift()) {
        action.unsubscribe();
      }
      throw error;
    }
  };
  return AsyncScheduler2;
}(Scheduler);
var asyncScheduler = new AsyncScheduler(AsyncAction);
var async = asyncScheduler;
var EMPTY = new Observable(function(subscriber) {
  return subscriber.complete();
});
function isScheduler(value) {
  return value && isFunction(value.schedule);
}
function last(arr) {
  return arr[arr.length - 1];
}
function popScheduler(args) {
  return isScheduler(last(args)) ? args.pop() : void 0;
}
function popNumber(args, defaultValue) {
  return typeof last(args) === "number" ? args.pop() : defaultValue;
}
var isArrayLike = function(x2) {
  return x2 && typeof x2.length === "number" && typeof x2 !== "function";
};
function isPromise(value) {
  return isFunction(value === null || value === void 0 ? void 0 : value.then);
}
function isInteropObservable(input) {
  return isFunction(input[observable]);
}
function isAsyncIterable(obj) {
  return Symbol.asyncIterator && isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
}
function createInvalidObservableTypeError(input) {
  return new TypeError("You provided " + (input !== null && typeof input === "object" ? "an invalid object" : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}
function getSymbolIterator() {
  if (typeof Symbol !== "function" || !Symbol.iterator) {
    return "@@iterator";
  }
  return Symbol.iterator;
}
var iterator = getSymbolIterator();
function isIterable(input) {
  return isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
}
function readableStreamLikeToAsyncGenerator(readableStream) {
  return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
    var reader, _a, value, done;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          reader = readableStream.getReader();
          _b.label = 1;
        case 1:
          _b.trys.push([1, , 9, 10]);
          _b.label = 2;
        case 2:
          return [4, __await(reader.read())];
        case 3:
          _a = _b.sent(), value = _a.value, done = _a.done;
          if (!done) return [3, 5];
          return [4, __await(void 0)];
        case 4:
          return [2, _b.sent()];
        case 5:
          return [4, __await(value)];
        case 6:
          return [4, _b.sent()];
        case 7:
          _b.sent();
          return [3, 2];
        case 8:
          return [3, 10];
        case 9:
          reader.releaseLock();
          return [7];
        case 10:
          return [2];
      }
    });
  });
}
function isReadableStreamLike(obj) {
  return isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
}
function innerFrom(input) {
  if (input instanceof Observable) {
    return input;
  }
  if (input != null) {
    if (isInteropObservable(input)) {
      return fromInteropObservable(input);
    }
    if (isArrayLike(input)) {
      return fromArrayLike(input);
    }
    if (isPromise(input)) {
      return fromPromise(input);
    }
    if (isAsyncIterable(input)) {
      return fromAsyncIterable(input);
    }
    if (isIterable(input)) {
      return fromIterable(input);
    }
    if (isReadableStreamLike(input)) {
      return fromReadableStreamLike(input);
    }
  }
  throw createInvalidObservableTypeError(input);
}
function fromInteropObservable(obj) {
  return new Observable(function(subscriber) {
    var obs = obj[observable]();
    if (isFunction(obs.subscribe)) {
      return obs.subscribe(subscriber);
    }
    throw new TypeError("Provided object does not correctly implement Symbol.observable");
  });
}
function fromArrayLike(array) {
  return new Observable(function(subscriber) {
    for (var i2 = 0; i2 < array.length && !subscriber.closed; i2++) {
      subscriber.next(array[i2]);
    }
    subscriber.complete();
  });
}
function fromPromise(promise) {
  return new Observable(function(subscriber) {
    promise.then(function(value) {
      if (!subscriber.closed) {
        subscriber.next(value);
        subscriber.complete();
      }
    }, function(err) {
      return subscriber.error(err);
    }).then(null, reportUnhandledError);
  });
}
function fromIterable(iterable) {
  return new Observable(function(subscriber) {
    var e_1, _a;
    try {
      for (var iterable_1 = __values$1(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
        var value = iterable_1_1.value;
        subscriber.next(value);
        if (subscriber.closed) {
          return;
        }
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    subscriber.complete();
  });
}
function fromAsyncIterable(asyncIterable) {
  return new Observable(function(subscriber) {
    process$1(asyncIterable, subscriber).catch(function(err) {
      return subscriber.error(err);
    });
  });
}
function fromReadableStreamLike(readableStream) {
  return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}
function process$1(asyncIterable, subscriber) {
  var asyncIterable_1, asyncIterable_1_1;
  var e_2, _a;
  return __awaiter(this, void 0, void 0, function() {
    var value, e_2_1;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, 6, 11]);
          asyncIterable_1 = __asyncValues(asyncIterable);
          _b.label = 1;
        case 1:
          return [4, asyncIterable_1.next()];
        case 2:
          if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done)) return [3, 4];
          value = asyncIterable_1_1.value;
          subscriber.next(value);
          if (subscriber.closed) {
            return [2];
          }
          _b.label = 3;
        case 3:
          return [3, 1];
        case 4:
          return [3, 11];
        case 5:
          e_2_1 = _b.sent();
          e_2 = { error: e_2_1 };
          return [3, 11];
        case 6:
          _b.trys.push([6, , 9, 10]);
          if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return))) return [3, 8];
          return [4, _a.call(asyncIterable_1)];
        case 7:
          _b.sent();
          _b.label = 8;
        case 8:
          return [3, 10];
        case 9:
          if (e_2) throw e_2.error;
          return [7];
        case 10:
          return [7];
        case 11:
          subscriber.complete();
          return [2];
      }
    });
  });
}
function executeSchedule(parentSubscription, scheduler, work, delay2, repeat) {
  if (delay2 === void 0) {
    delay2 = 0;
  }
  if (repeat === void 0) {
    repeat = false;
  }
  var scheduleSubscription = scheduler.schedule(function() {
    work();
    if (repeat) {
      parentSubscription.add(this.schedule(null, delay2));
    } else {
      this.unsubscribe();
    }
  }, delay2);
  parentSubscription.add(scheduleSubscription);
  if (!repeat) {
    return scheduleSubscription;
  }
}
function observeOn(scheduler, delay2) {
  if (delay2 === void 0) {
    delay2 = 0;
  }
  return operate(function(source, subscriber) {
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      return executeSchedule(subscriber, scheduler, function() {
        return subscriber.next(value);
      }, delay2);
    }, function() {
      return executeSchedule(subscriber, scheduler, function() {
        return subscriber.complete();
      }, delay2);
    }, function(err) {
      return executeSchedule(subscriber, scheduler, function() {
        return subscriber.error(err);
      }, delay2);
    }));
  });
}
function subscribeOn(scheduler, delay2) {
  if (delay2 === void 0) {
    delay2 = 0;
  }
  return operate(function(source, subscriber) {
    subscriber.add(scheduler.schedule(function() {
      return source.subscribe(subscriber);
    }, delay2));
  });
}
function scheduleObservable(input, scheduler) {
  return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
}
function schedulePromise(input, scheduler) {
  return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
}
function scheduleArray(input, scheduler) {
  return new Observable(function(subscriber) {
    var i2 = 0;
    return scheduler.schedule(function() {
      if (i2 === input.length) {
        subscriber.complete();
      } else {
        subscriber.next(input[i2++]);
        if (!subscriber.closed) {
          this.schedule();
        }
      }
    });
  });
}
function scheduleIterable(input, scheduler) {
  return new Observable(function(subscriber) {
    var iterator$1;
    executeSchedule(subscriber, scheduler, function() {
      iterator$1 = input[iterator]();
      executeSchedule(subscriber, scheduler, function() {
        var _a;
        var value;
        var done;
        try {
          _a = iterator$1.next(), value = _a.value, done = _a.done;
        } catch (err) {
          subscriber.error(err);
          return;
        }
        if (done) {
          subscriber.complete();
        } else {
          subscriber.next(value);
        }
      }, 0, true);
    });
    return function() {
      return isFunction(iterator$1 === null || iterator$1 === void 0 ? void 0 : iterator$1.return) && iterator$1.return();
    };
  });
}
function scheduleAsyncIterable(input, scheduler) {
  if (!input) {
    throw new Error("Iterable cannot be null");
  }
  return new Observable(function(subscriber) {
    executeSchedule(subscriber, scheduler, function() {
      var iterator2 = input[Symbol.asyncIterator]();
      executeSchedule(subscriber, scheduler, function() {
        iterator2.next().then(function(result) {
          if (result.done) {
            subscriber.complete();
          } else {
            subscriber.next(result.value);
          }
        });
      }, 0, true);
    });
  });
}
function scheduleReadableStreamLike(input, scheduler) {
  return scheduleAsyncIterable(readableStreamLikeToAsyncGenerator(input), scheduler);
}
function scheduled(input, scheduler) {
  if (input != null) {
    if (isInteropObservable(input)) {
      return scheduleObservable(input, scheduler);
    }
    if (isArrayLike(input)) {
      return scheduleArray(input, scheduler);
    }
    if (isPromise(input)) {
      return schedulePromise(input, scheduler);
    }
    if (isAsyncIterable(input)) {
      return scheduleAsyncIterable(input, scheduler);
    }
    if (isIterable(input)) {
      return scheduleIterable(input, scheduler);
    }
    if (isReadableStreamLike(input)) {
      return scheduleReadableStreamLike(input, scheduler);
    }
  }
  throw createInvalidObservableTypeError(input);
}
function from(input, scheduler) {
  return scheduler ? scheduled(input, scheduler) : innerFrom(input);
}
function isValidDate(value) {
  return value instanceof Date && !isNaN(value);
}
var TimeoutError = createErrorClass(function(_super) {
  return function TimeoutErrorImpl(info) {
    if (info === void 0) {
      info = null;
    }
    _super(this);
    this.message = "Timeout has occurred";
    this.name = "TimeoutError";
    this.info = info;
  };
});
function timeout(config2, schedulerArg) {
  var _a = isValidDate(config2) ? { first: config2 } : typeof config2 === "number" ? { each: config2 } : config2, first = _a.first, each = _a.each, _b = _a.with, _with = _b === void 0 ? timeoutErrorFactory : _b, _c = _a.scheduler, scheduler = _c === void 0 ? asyncScheduler : _c, _d = _a.meta, meta = _d === void 0 ? null : _d;
  if (first == null && each == null) {
    throw new TypeError("No timeout provided.");
  }
  return operate(function(source, subscriber) {
    var originalSourceSubscription;
    var timerSubscription;
    var lastValue = null;
    var seen = 0;
    var startTimer = function(delay2) {
      timerSubscription = executeSchedule(subscriber, scheduler, function() {
        try {
          originalSourceSubscription.unsubscribe();
          innerFrom(_with({
            meta,
            lastValue,
            seen
          })).subscribe(subscriber);
        } catch (err) {
          subscriber.error(err);
        }
      }, delay2);
    };
    originalSourceSubscription = source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      timerSubscription === null || timerSubscription === void 0 ? void 0 : timerSubscription.unsubscribe();
      seen++;
      subscriber.next(lastValue = value);
      each > 0 && startTimer(each);
    }, void 0, void 0, function() {
      if (!(timerSubscription === null || timerSubscription === void 0 ? void 0 : timerSubscription.closed)) {
        timerSubscription === null || timerSubscription === void 0 ? void 0 : timerSubscription.unsubscribe();
      }
      lastValue = null;
    }));
    !seen && startTimer(first != null ? typeof first === "number" ? first : +first - scheduler.now() : each);
  });
}
function timeoutErrorFactory(info) {
  throw new TimeoutError(info);
}
function map(project, thisArg) {
  return operate(function(source, subscriber) {
    var index2 = 0;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      subscriber.next(project.call(thisArg, value, index2++));
    }));
  });
}
var isArray$1 = Array.isArray;
function callOrApply(fn, args) {
  return isArray$1(args) ? fn.apply(void 0, __spreadArray([], __read$1(args))) : fn(args);
}
function mapOneOrManyArgs(fn) {
  return map(function(args) {
    return callOrApply(fn, args);
  });
}
function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalFinalizer) {
  var buffer2 = [];
  var active = 0;
  var index2 = 0;
  var isComplete = false;
  var checkComplete = function() {
    if (isComplete && !buffer2.length && !active) {
      subscriber.complete();
    }
  };
  var outerNext = function(value) {
    return active < concurrent ? doInnerSub(value) : buffer2.push(value);
  };
  var doInnerSub = function(value) {
    active++;
    var innerComplete = false;
    innerFrom(project(value, index2++)).subscribe(createOperatorSubscriber(subscriber, function(innerValue) {
      {
        subscriber.next(innerValue);
      }
    }, function() {
      innerComplete = true;
    }, void 0, function() {
      if (innerComplete) {
        try {
          active--;
          var _loop_1 = function() {
            var bufferedValue = buffer2.shift();
            {
              doInnerSub(bufferedValue);
            }
          };
          while (buffer2.length && active < concurrent) {
            _loop_1();
          }
          checkComplete();
        } catch (err) {
          subscriber.error(err);
        }
      }
    }));
  };
  source.subscribe(createOperatorSubscriber(subscriber, outerNext, function() {
    isComplete = true;
    checkComplete();
  }));
  return function() {
  };
}
function mergeMap(project, resultSelector, concurrent) {
  if (concurrent === void 0) {
    concurrent = Infinity;
  }
  if (isFunction(resultSelector)) {
    return mergeMap(function(a2, i2) {
      return map(function(b2, ii) {
        return resultSelector(a2, b2, i2, ii);
      })(innerFrom(project(a2, i2)));
    }, concurrent);
  } else if (typeof resultSelector === "number") {
    concurrent = resultSelector;
  }
  return operate(function(source, subscriber) {
    return mergeInternals(source, subscriber, project, concurrent);
  });
}
function mergeAll(concurrent) {
  if (concurrent === void 0) {
    concurrent = Infinity;
  }
  return mergeMap(identity, concurrent);
}
var nodeEventEmitterMethods = ["addListener", "removeListener"];
var eventTargetMethods = ["addEventListener", "removeEventListener"];
var jqueryMethods = ["on", "off"];
function fromEvent(target, eventName, options, resultSelector) {
  if (isFunction(options)) {
    resultSelector = options;
    options = void 0;
  }
  if (resultSelector) {
    return fromEvent(target, eventName, options).pipe(mapOneOrManyArgs(resultSelector));
  }
  var _a = __read$1(isEventTarget(target) ? eventTargetMethods.map(function(methodName) {
    return function(handler) {
      return target[methodName](eventName, handler, options);
    };
  }) : isNodeStyleEventEmitter(target) ? nodeEventEmitterMethods.map(toCommonHandlerRegistry(target, eventName)) : isJQueryStyleEventEmitter(target) ? jqueryMethods.map(toCommonHandlerRegistry(target, eventName)) : [], 2), add2 = _a[0], remove2 = _a[1];
  if (!add2) {
    if (isArrayLike(target)) {
      return mergeMap(function(subTarget) {
        return fromEvent(subTarget, eventName, options);
      })(innerFrom(target));
    }
  }
  if (!add2) {
    throw new TypeError("Invalid event target");
  }
  return new Observable(function(subscriber) {
    var handler = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return subscriber.next(1 < args.length ? args : args[0]);
    };
    add2(handler);
    return function() {
      return remove2(handler);
    };
  });
}
function toCommonHandlerRegistry(target, eventName) {
  return function(methodName) {
    return function(handler) {
      return target[methodName](eventName, handler);
    };
  };
}
function isNodeStyleEventEmitter(target) {
  return isFunction(target.addListener) && isFunction(target.removeListener);
}
function isJQueryStyleEventEmitter(target) {
  return isFunction(target.on) && isFunction(target.off);
}
function isEventTarget(target) {
  return isFunction(target.addEventListener) && isFunction(target.removeEventListener);
}
function timer(dueTime, intervalOrScheduler, scheduler) {
  if (dueTime === void 0) {
    dueTime = 0;
  }
  if (scheduler === void 0) {
    scheduler = async;
  }
  var intervalDuration = -1;
  if (intervalOrScheduler != null) {
    if (isScheduler(intervalOrScheduler)) {
      scheduler = intervalOrScheduler;
    } else {
      intervalDuration = intervalOrScheduler;
    }
  }
  return new Observable(function(subscriber) {
    var due = isValidDate(dueTime) ? +dueTime - scheduler.now() : dueTime;
    if (due < 0) {
      due = 0;
    }
    var n2 = 0;
    return scheduler.schedule(function() {
      if (!subscriber.closed) {
        subscriber.next(n2++);
        if (0 <= intervalDuration) {
          this.schedule(void 0, intervalDuration);
        } else {
          subscriber.complete();
        }
      }
    }, due);
  });
}
function merge() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  var scheduler = popScheduler(args);
  var concurrent = popNumber(args, Infinity);
  var sources = args;
  return !sources.length ? EMPTY : sources.length === 1 ? innerFrom(sources[0]) : mergeAll(concurrent)(from(sources, scheduler));
}
var isArray = Array.isArray;
function argsOrArgArray(args) {
  return args.length === 1 && isArray(args[0]) ? args[0] : args;
}
function filter(predicate, thisArg) {
  return operate(function(source, subscriber) {
    var index2 = 0;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      return predicate.call(thisArg, value, index2++) && subscriber.next(value);
    }));
  });
}
function race() {
  var sources = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    sources[_i] = arguments[_i];
  }
  sources = argsOrArgArray(sources);
  return sources.length === 1 ? innerFrom(sources[0]) : new Observable(raceInit(sources));
}
function raceInit(sources) {
  return function(subscriber) {
    var subscriptions = [];
    var _loop_1 = function(i3) {
      subscriptions.push(innerFrom(sources[i3]).subscribe(createOperatorSubscriber(subscriber, function(value) {
        if (subscriptions) {
          for (var s2 = 0; s2 < subscriptions.length; s2++) {
            s2 !== i3 && subscriptions[s2].unsubscribe();
          }
          subscriptions = null;
        }
        subscriber.next(value);
      })));
    };
    for (var i2 = 0; subscriptions && !subscriber.closed && i2 < sources.length; i2++) {
      _loop_1(i2);
    }
  };
}
function buffer(closingNotifier) {
  return operate(function(source, subscriber) {
    var currentBuffer = [];
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      return currentBuffer.push(value);
    }, function() {
      subscriber.next(currentBuffer);
      subscriber.complete();
    }));
    innerFrom(closingNotifier).subscribe(createOperatorSubscriber(subscriber, function() {
      var b2 = currentBuffer;
      currentBuffer = [];
      subscriber.next(b2);
    }, noop));
    return function() {
      currentBuffer = null;
    };
  });
}
function debounceTime(dueTime, scheduler) {
  if (scheduler === void 0) {
    scheduler = asyncScheduler;
  }
  return operate(function(source, subscriber) {
    var activeTask = null;
    var lastValue = null;
    var lastTime = null;
    var emit = function() {
      if (activeTask) {
        activeTask.unsubscribe();
        activeTask = null;
        var value = lastValue;
        lastValue = null;
        subscriber.next(value);
      }
    };
    function emitWhenIdle() {
      var targetTime = lastTime + dueTime;
      var now = scheduler.now();
      if (now < targetTime) {
        activeTask = this.schedule(void 0, targetTime - now);
        subscriber.add(activeTask);
        return;
      }
      emit();
    }
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      lastValue = value;
      lastTime = scheduler.now();
      if (!activeTask) {
        activeTask = scheduler.schedule(emitWhenIdle, dueTime);
        subscriber.add(activeTask);
      }
    }, function() {
      emit();
      subscriber.complete();
    }, void 0, function() {
      lastValue = activeTask = null;
    }));
  });
}
function take(count) {
  return count <= 0 ? function() {
    return EMPTY;
  } : operate(function(source, subscriber) {
    var seen = 0;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      if (++seen <= count) {
        subscriber.next(value);
        if (count <= seen) {
          subscriber.complete();
        }
      }
    }));
  });
}
function mapTo(value) {
  return map(function() {
    return value;
  });
}
function delayWhen(delayDurationSelector, subscriptionDelay) {
  return mergeMap(function(value, index2) {
    return innerFrom(delayDurationSelector(value, index2)).pipe(take(1), mapTo(value));
  });
}
function delay(due, scheduler) {
  if (scheduler === void 0) {
    scheduler = asyncScheduler;
  }
  var duration = timer(due, scheduler);
  return delayWhen(function() {
    return duration;
  });
}
function pairwise() {
  return operate(function(source, subscriber) {
    var prev;
    var hasPrev = false;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      var p2 = prev;
      prev = value;
      hasPrev && subscriber.next([p2, value]);
      hasPrev = true;
    }));
  });
}
function share(options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.connector, connector = _a === void 0 ? function() {
    return new Subject();
  } : _a, _b = options.resetOnError, resetOnError = _b === void 0 ? true : _b, _c = options.resetOnComplete, resetOnComplete = _c === void 0 ? true : _c, _d = options.resetOnRefCountZero, resetOnRefCountZero = _d === void 0 ? true : _d;
  return function(wrapperSource) {
    var connection;
    var resetConnection;
    var subject;
    var refCount = 0;
    var hasCompleted = false;
    var hasErrored = false;
    var cancelReset = function() {
      resetConnection === null || resetConnection === void 0 ? void 0 : resetConnection.unsubscribe();
      resetConnection = void 0;
    };
    var reset2 = function() {
      cancelReset();
      connection = subject = void 0;
      hasCompleted = hasErrored = false;
    };
    var resetAndUnsubscribe = function() {
      var conn = connection;
      reset2();
      conn === null || conn === void 0 ? void 0 : conn.unsubscribe();
    };
    return operate(function(source, subscriber) {
      refCount++;
      if (!hasErrored && !hasCompleted) {
        cancelReset();
      }
      var dest = subject = subject !== null && subject !== void 0 ? subject : connector();
      subscriber.add(function() {
        refCount--;
        if (refCount === 0 && !hasErrored && !hasCompleted) {
          resetConnection = handleReset(resetAndUnsubscribe, resetOnRefCountZero);
        }
      });
      dest.subscribe(subscriber);
      if (!connection && refCount > 0) {
        connection = new SafeSubscriber({
          next: function(value) {
            return dest.next(value);
          },
          error: function(err) {
            hasErrored = true;
            cancelReset();
            resetConnection = handleReset(reset2, resetOnError, err);
            dest.error(err);
          },
          complete: function() {
            hasCompleted = true;
            cancelReset();
            resetConnection = handleReset(reset2, resetOnComplete);
            dest.complete();
          }
        });
        innerFrom(source).subscribe(connection);
      }
    })(wrapperSource);
  };
}
function handleReset(reset2, on) {
  var args = [];
  for (var _i = 2; _i < arguments.length; _i++) {
    args[_i - 2] = arguments[_i];
  }
  if (on === true) {
    reset2();
    return;
  }
  if (on === false) {
    return;
  }
  var onSubscriber = new SafeSubscriber({
    next: function() {
      onSubscriber.unsubscribe();
      reset2();
    }
  });
  return innerFrom(on.apply(void 0, __spreadArray([], __read$1(args)))).subscribe(onSubscriber);
}
function switchMap(project, resultSelector) {
  return operate(function(source, subscriber) {
    var innerSubscriber = null;
    var index2 = 0;
    var isComplete = false;
    var checkComplete = function() {
      return isComplete && !innerSubscriber && subscriber.complete();
    };
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      innerSubscriber === null || innerSubscriber === void 0 ? void 0 : innerSubscriber.unsubscribe();
      var outerIndex = index2++;
      innerFrom(project(value, outerIndex)).subscribe(innerSubscriber = createOperatorSubscriber(subscriber, function(innerValue) {
        return subscriber.next(innerValue);
      }, function() {
        innerSubscriber = null;
        checkComplete();
      }));
    }, function() {
      isComplete = true;
      checkComplete();
    }));
  });
}
function throttle(durationSelector, config2) {
  return operate(function(source, subscriber) {
    var _a = {}, _b = _a.leading, leading = _b === void 0 ? true : _b, _c = _a.trailing, trailing = _c === void 0 ? false : _c;
    var hasValue = false;
    var sendValue = null;
    var throttled = null;
    var isComplete = false;
    var endThrottling = function() {
      throttled === null || throttled === void 0 ? void 0 : throttled.unsubscribe();
      throttled = null;
      if (trailing) {
        send();
        isComplete && subscriber.complete();
      }
    };
    var cleanupThrottling = function() {
      throttled = null;
      isComplete && subscriber.complete();
    };
    var startThrottle = function(value) {
      return throttled = innerFrom(durationSelector(value)).subscribe(createOperatorSubscriber(subscriber, endThrottling, cleanupThrottling));
    };
    var send = function() {
      if (hasValue) {
        hasValue = false;
        var value = sendValue;
        sendValue = null;
        subscriber.next(value);
        !isComplete && startThrottle(value);
      }
    };
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      hasValue = true;
      sendValue = value;
      !(throttled && !throttled.closed) && (leading ? send() : startThrottle(value));
    }, function() {
      isComplete = true;
      !(trailing && hasValue && throttled && !throttled.closed) && subscriber.complete();
    }));
  });
}
function throttleTime(duration, scheduler, config2) {
  if (scheduler === void 0) {
    scheduler = asyncScheduler;
  }
  var duration$ = timer(duration, scheduler);
  return throttle(function() {
    return duration$;
  });
}
var SENSITIVE_TAGS = ["input", "select", "textarea"];
var isElementPointerCursor = function(element, actionType) {
  var _a;
  var computedStyle = (_a = window === null || window === void 0 ? void 0 : window.getComputedStyle) === null || _a === void 0 ? void 0 : _a.call(window, element);
  return (computedStyle === null || computedStyle === void 0 ? void 0 : computedStyle.getPropertyValue("cursor")) === "pointer" && actionType === "click";
};
var createShouldTrackEvent = function(autocaptureOptions, allowlist, isAlwaysCaptureCursorPointer) {
  if (isAlwaysCaptureCursorPointer === void 0) {
    isAlwaysCaptureCursorPointer = false;
  }
  return function(actionType, element) {
    var _a, _b;
    var pageUrlAllowlist = autocaptureOptions.pageUrlAllowlist, pageUrlExcludelist = autocaptureOptions.pageUrlExcludelist, shouldTrackEventResolver = autocaptureOptions.shouldTrackEventResolver;
    var tag = (_b = (_a = element === null || element === void 0 ? void 0 : element.tagName) === null || _a === void 0 ? void 0 : _a.toLowerCase) === null || _b === void 0 ? void 0 : _b.call(_a);
    if (!tag) {
      return false;
    }
    if (shouldTrackEventResolver) {
      return shouldTrackEventResolver(actionType, element);
    }
    if (!isUrlMatchAllowlist(window.location.href, pageUrlAllowlist)) {
      return false;
    }
    if (pageUrlExcludelist && pageUrlExcludelist.length > 0 && isUrlMatchAllowlist(window.location.href, pageUrlExcludelist)) {
      return false;
    }
    var elementType = String(element === null || element === void 0 ? void 0 : element.getAttribute("type")) || "";
    if (typeof elementType === "string") {
      switch (elementType.toLowerCase()) {
        case "hidden":
          return false;
        case "password":
          return false;
      }
    }
    var isCursorPointer = isElementPointerCursor(element, actionType);
    if (isAlwaysCaptureCursorPointer && isCursorPointer) {
      return true;
    }
    if (allowlist) {
      var hasMatchAnyAllowedSelector = allowlist.some(function(selector) {
        var _a2;
        return !!((_a2 = element === null || element === void 0 ? void 0 : element.matches) === null || _a2 === void 0 ? void 0 : _a2.call(element, selector));
      });
      if (!hasMatchAnyAllowedSelector) {
        return false;
      }
    }
    switch (tag) {
      case "input":
      case "select":
      case "textarea":
        return actionType === "change" || actionType === "click";
      default: {
        if (isCursorPointer) {
          return true;
        }
        return actionType === "click";
      }
    }
  };
};
var isNonSensitiveElement = function(element) {
  var _a, _b, _c;
  var tag = (_b = (_a = element === null || element === void 0 ? void 0 : element.tagName) === null || _a === void 0 ? void 0 : _a.toLowerCase) === null || _b === void 0 ? void 0 : _b.call(_a);
  var isContentEditable = element instanceof HTMLElement ? ((_c = element.getAttribute("contenteditable")) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === "true" : false;
  return !SENSITIVE_TAGS.includes(tag) && !isContentEditable;
};
var parseAttributesToMask = function(attributeString) {
  return attributeString ? attributeString.split(",").map(function(attr) {
    return attr.trim();
  }).filter(function(attr) {
    return attr.length > 0 && attr !== "id" && attr !== "class";
  }) : [];
};
var extractPrefixedAttributes = function(attrs, prefix) {
  return Object.entries(attrs).reduce(function(attributes, _a) {
    var _b = __read$1(_a, 2), attributeName = _b[0], attributeValue = _b[1];
    if (attributeName.startsWith(prefix)) {
      var attributeKey = attributeName.replace(prefix, "");
      if (attributeKey) {
        attributes[attributeKey] = attributeValue || "";
      }
    }
    return attributes;
  }, {});
};
var isEmpty = function(value) {
  return value === void 0 || value === null || typeof value === "object" && Object.keys(value).length === 0 || typeof value === "string" && value.trim().length === 0;
};
var removeEmptyProperties = function(properties) {
  return Object.keys(properties).reduce(function(filteredProperties, key) {
    var value = properties[key];
    if (!isEmpty(value)) {
      filteredProperties[key] = value;
    }
    return filteredProperties;
  }, {});
};
var getClosestElement = function(element, selectors) {
  if (!element) {
    return null;
  }
  if (selectors.some(function(selector) {
    var _a;
    return (_a = element === null || element === void 0 ? void 0 : element.matches) === null || _a === void 0 ? void 0 : _a.call(element, selector);
  })) {
    return element;
  }
  return getClosestElement(element === null || element === void 0 ? void 0 : element.parentElement, selectors);
};
var asyncLoadScript = function(url) {
  return new Promise(function(resolve, reject) {
    var _a;
    try {
      var scriptElement = document.createElement("script");
      scriptElement.type = "text/javascript";
      scriptElement.async = true;
      scriptElement.src = url;
      scriptElement.addEventListener("load", function() {
        resolve({ status: true });
      }, { once: true });
      scriptElement.addEventListener("error", function() {
        reject({
          status: false,
          message: "Failed to load the script ".concat(url)
        });
      });
      (_a = document.head) === null || _a === void 0 ? void 0 : _a.appendChild(scriptElement);
    } catch (error) {
      reject(error);
    }
  });
};
function generateUniqueId() {
  return "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
}
var filterOutNonTrackableEvents = function(event) {
  if (event.event.target === null || !event.closestTrackedAncestor) {
    return false;
  }
  return true;
};
function isElementBasedEvent(event) {
  return event.type === "click" || event.type === "change";
}
var VERSION = "1.12.1";
var BLOCKED_ATTRIBUTES = /* @__PURE__ */ new Set([
  // Already captured elsewhere in the hierarchy object
  "id",
  "class",
  // non-useful and potentially large attribute
  "style",
  // sensitive as prefilled form data may populate this attribute
  "value",
  // DOM events
  "onclick",
  "onchange",
  "oninput",
  "onblur",
  "onsubmit",
  "onfocus",
  "onkeydown",
  "onkeyup",
  "onkeypress",
  // React specific
  "data-reactid",
  "data-react-checksum",
  "data-reactroot",
  // Amplitude specific - used for redaction but should not be included in getElementProperties
  DATA_AMP_MASK_ATTRIBUTES,
  TEXT_MASK_ATTRIBUTE
]);
var SENSITIVE_ELEMENT_ATTRIBUTE_ALLOWLIST = ["type"];
var SVG_TAGS = ["svg", "path", "g"];
var HIGHLY_SENSITIVE_INPUT_TYPES = ["password", "hidden"];
var MAX_ATTRIBUTE_LENGTH = 128;
function getElementProperties(element, userMaskedAttributeNames) {
  var e_1, _a;
  var _b, _c, _d, _e;
  if (element === null) {
    return null;
  }
  var tagName = String(element.tagName).toLowerCase();
  var properties = {
    tag: tagName
  };
  var siblings = Array.from((_c = (_b = element.parentElement) === null || _b === void 0 ? void 0 : _b.children) !== null && _c !== void 0 ? _c : []);
  if (siblings.length) {
    properties.index = siblings.indexOf(element);
    properties.indexOfType = siblings.filter(function(el) {
      return el.tagName === element.tagName;
    }).indexOf(element);
  }
  var prevSiblingTag = (_e = (_d = element.previousElementSibling) === null || _d === void 0 ? void 0 : _d.tagName) === null || _e === void 0 ? void 0 : _e.toLowerCase();
  if (prevSiblingTag) {
    properties.prevSib = String(prevSiblingTag);
  }
  var id = element.getAttribute("id");
  if (id) {
    properties.id = String(id);
  }
  var classes = Array.from(element.classList);
  if (classes.length) {
    properties.classes = classes;
  }
  var attributes = {};
  var attributesArray = Array.from(element.attributes);
  var filteredAttributes = attributesArray.filter(function(attr2) {
    return !BLOCKED_ATTRIBUTES.has(attr2.name);
  });
  var isSensitiveElement = !isNonSensitiveElement(element);
  if (!HIGHLY_SENSITIVE_INPUT_TYPES.includes(String(element.getAttribute("type"))) && !SVG_TAGS.includes(tagName)) {
    try {
      for (var filteredAttributes_1 = __values$1(filteredAttributes), filteredAttributes_1_1 = filteredAttributes_1.next(); !filteredAttributes_1_1.done; filteredAttributes_1_1 = filteredAttributes_1.next()) {
        var attr = filteredAttributes_1_1.value;
        if (isSensitiveElement && !SENSITIVE_ELEMENT_ATTRIBUTE_ALLOWLIST.includes(attr.name)) {
          continue;
        }
        if (userMaskedAttributeNames.has(attr.name)) {
          attributes[attr.name] = MASKED_TEXT_VALUE;
          continue;
        }
        attributes[attr.name] = String(attr.value).substring(0, MAX_ATTRIBUTE_LENGTH);
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (filteredAttributes_1_1 && !filteredAttributes_1_1.done && (_a = filteredAttributes_1.return)) _a.call(filteredAttributes_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
  }
  if (Object.keys(attributes).length) {
    properties.attrs = attributes;
  }
  return properties;
}
function getAncestors(targetEl) {
  var ancestors = [];
  if (!targetEl) {
    return ancestors;
  }
  ancestors.push(targetEl);
  var current = targetEl.parentElement;
  while (current && current.tagName !== "HTML") {
    ancestors.push(current);
    current = current.parentElement;
  }
  return ancestors;
}
var getDataSource = function(dataSource, contextElement) {
  try {
    if (dataSource.sourceType === "DOM_ELEMENT") {
      var scopingElement = document.documentElement;
      if (dataSource.scope && contextElement) {
        scopingElement = contextElement.closest(dataSource.scope);
      }
      if (scopingElement && dataSource.selector) {
        return scopingElement.querySelector(dataSource.selector);
      }
      return scopingElement;
    }
  } catch (error) {
    return void 0;
  }
  return void 0;
};
var executeActions = function(actions, ev, dataExtractor) {
  actions.forEach(function(action) {
    if (typeof action === "string") {
      return;
    }
    if (action.actionType === "ATTACH_EVENT_PROPERTY") {
      var data = dataExtractor.extractDataFromDataSource(action.dataSource, ev.closestTrackedAncestor);
      ev.targetElementProperties[action.destinationKey] = data;
    }
  });
};
var CC_REGEX = /\b(?:\d[ -]*?){13,16}\b/;
var SSN_REGEX = /(\d{3}-?\d{2}-?\d{4})/g;
var EMAIL_REGEX = /[^\s@]+@[^\s@.]+\.[^\s@]+/g;
var DataExtractor = (
  /** @class */
  /* @__PURE__ */ function() {
    function DataExtractor2(options) {
      var e_1, _a;
      var _this = this;
      var _b;
      this.replaceSensitiveString = function(text) {
        var e_2, _a2;
        if (typeof text !== "string") {
          return "";
        }
        var result = text;
        result = result.replace(CC_REGEX, MASKED_TEXT_VALUE);
        result = result.replace(SSN_REGEX, MASKED_TEXT_VALUE);
        result = result.replace(EMAIL_REGEX, MASKED_TEXT_VALUE);
        try {
          for (var _b2 = __values$1(_this.additionalMaskTextPatterns), _c = _b2.next(); !_c.done; _c = _b2.next()) {
            var pattern = _c.value;
            try {
              result = result.replace(pattern, MASKED_TEXT_VALUE);
            } catch (_d) {
            }
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (_c && !_c.done && (_a2 = _b2.return)) _a2.call(_b2);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
        return result;
      };
      this.getHierarchy = function(element) {
        var e_3, _a2;
        var _b2;
        var hierarchy = [];
        if (!element) {
          return [];
        }
        var ancestors = getAncestors(element);
        var elementToAttributesToMaskMap = /* @__PURE__ */ new Map();
        for (var i2 = ancestors.length - 1; i2 >= 0; i2--) {
          var node = ancestors[i2];
          if (node) {
            var attributesToMask = parseAttributesToMask(node.getAttribute(DATA_AMP_MASK_ATTRIBUTES));
            var ancestorAttributesToMask = i2 === ancestors.length - 1 ? [] : (_b2 = elementToAttributesToMaskMap.get(ancestors[i2 + 1])) !== null && _b2 !== void 0 ? _b2 : /* @__PURE__ */ new Set();
            var combinedAttributesToMask = new Set(__spreadArray(__spreadArray([], __read$1(ancestorAttributesToMask), false), __read$1(attributesToMask), false));
            elementToAttributesToMaskMap.set(node, combinedAttributesToMask);
          }
        }
        hierarchy = ancestors.map(function(el) {
          var _a3;
          return getElementProperties(el, (_a3 = elementToAttributesToMaskMap.get(el)) !== null && _a3 !== void 0 ? _a3 : /* @__PURE__ */ new Set());
        });
        var _loop_1 = function(hierarchyNode2) {
          if (hierarchyNode2 === null || hierarchyNode2 === void 0 ? void 0 : hierarchyNode2.attrs) {
            Object.entries(hierarchyNode2.attrs).forEach(function(_a3) {
              var _b3 = __read$1(_a3, 2), key = _b3[0], value = _b3[1];
              if (hierarchyNode2.attrs) {
                hierarchyNode2.attrs[key] = _this.replaceSensitiveString(value);
              }
            });
          }
        };
        try {
          for (var hierarchy_1 = __values$1(hierarchy), hierarchy_1_1 = hierarchy_1.next(); !hierarchy_1_1.done; hierarchy_1_1 = hierarchy_1.next()) {
            var hierarchyNode = hierarchy_1_1.value;
            _loop_1(hierarchyNode);
          }
        } catch (e_3_1) {
          e_3 = { error: e_3_1 };
        } finally {
          try {
            if (hierarchy_1_1 && !hierarchy_1_1.done && (_a2 = hierarchy_1.return)) _a2.call(hierarchy_1);
          } finally {
            if (e_3) throw e_3.error;
          }
        }
        return hierarchy;
      };
      this.getNearestLabel = function(element) {
        var parent = element.parentElement;
        if (!parent) {
          return "";
        }
        var labelElement;
        try {
          labelElement = parent.querySelector(":scope>span,h1,h2,h3,h4,h5,h6");
        } catch (_a2) {
          labelElement = null;
        }
        if (labelElement) {
          return _this.getText(labelElement);
        }
        return _this.getNearestLabel(parent);
      };
      this.getEventProperties = function(actionType, element, dataAttributePrefix) {
        var _a2;
        var _b2, _c, _d;
        var tag = (_c = (_b2 = element === null || element === void 0 ? void 0 : element.tagName) === null || _b2 === void 0 ? void 0 : _b2.toLowerCase) === null || _c === void 0 ? void 0 : _c.call(_b2);
        var rect = typeof element.getBoundingClientRect === "function" ? element.getBoundingClientRect() : { left: null, top: null };
        var hierarchy = _this.getHierarchy(element);
        var currentElementAttributes = (_d = hierarchy[0]) === null || _d === void 0 ? void 0 : _d.attrs;
        var nearestLabel = _this.getNearestLabel(element);
        var attributes = extractPrefixedAttributes(currentElementAttributes !== null && currentElementAttributes !== void 0 ? currentElementAttributes : {}, dataAttributePrefix);
        var properties = (_a2 = {}, _a2[AMPLITUDE_EVENT_PROP_ELEMENT_HIERARCHY] = hierarchy, _a2[AMPLITUDE_EVENT_PROP_ELEMENT_TAG] = tag, _a2[AMPLITUDE_EVENT_PROP_ELEMENT_TEXT] = _this.getText(element), _a2[AMPLITUDE_EVENT_PROP_ELEMENT_POSITION_LEFT] = rect.left == null ? null : Math.round(rect.left), _a2[AMPLITUDE_EVENT_PROP_ELEMENT_POSITION_TOP] = rect.top == null ? null : Math.round(rect.top), _a2[AMPLITUDE_EVENT_PROP_ELEMENT_ATTRIBUTES] = attributes, _a2[AMPLITUDE_EVENT_PROP_ELEMENT_PARENT_LABEL] = nearestLabel, _a2[AMPLITUDE_EVENT_PROP_PAGE_URL] = window.location.href.split("?")[0], _a2[AMPLITUDE_EVENT_PROP_PAGE_TITLE] = typeof document !== "undefined" && _this.replaceSensitiveString(document.title) || "", _a2[AMPLITUDE_EVENT_PROP_VIEWPORT_HEIGHT] = window.innerHeight, _a2[AMPLITUDE_EVENT_PROP_VIEWPORT_WIDTH] = window.innerWidth, _a2);
        properties[AMPLITUDE_EVENT_PROP_ELEMENT_ID] = element.getAttribute("id") || "";
        properties[AMPLITUDE_EVENT_PROP_ELEMENT_CLASS] = element.getAttribute("class");
        properties[AMPLITUDE_EVENT_PROP_ELEMENT_ARIA_LABEL] = currentElementAttributes === null || currentElementAttributes === void 0 ? void 0 : currentElementAttributes["aria-label"];
        if (tag === "a" && actionType === "click" && element instanceof HTMLAnchorElement) {
          properties[AMPLITUDE_EVENT_PROP_ELEMENT_HREF] = _this.replaceSensitiveString(element.href);
        }
        return removeEmptyProperties(properties);
      };
      this.addAdditionalEventProperties = function(event, type, selectorAllowlist, dataAttributePrefix, isCapturingCursorPointer) {
        if (isCapturingCursorPointer === void 0) {
          isCapturingCursorPointer = false;
        }
        var baseEvent = {
          event,
          timestamp: Date.now(),
          type
        };
        if (isElementBasedEvent(baseEvent) && baseEvent.event.target !== null) {
          if (isCapturingCursorPointer) {
            var isCursorPointer = isElementPointerCursor(baseEvent.event.target, baseEvent.type);
            if (isCursorPointer) {
              baseEvent.closestTrackedAncestor = baseEvent.event.target;
              baseEvent.targetElementProperties = _this.getEventProperties(baseEvent.type, baseEvent.closestTrackedAncestor, dataAttributePrefix);
              return baseEvent;
            }
          }
          var closestTrackedAncestor = getClosestElement(baseEvent.event.target, selectorAllowlist);
          if (closestTrackedAncestor) {
            baseEvent.closestTrackedAncestor = closestTrackedAncestor;
            baseEvent.targetElementProperties = _this.getEventProperties(baseEvent.type, closestTrackedAncestor, dataAttributePrefix);
          }
          return baseEvent;
        }
        return baseEvent;
      };
      this.extractDataFromDataSource = function(dataSource, contextElement) {
        if (dataSource.sourceType === "DOM_ELEMENT") {
          var sourceElement = getDataSource(dataSource, contextElement);
          if (!sourceElement) {
            return void 0;
          }
          if (dataSource.elementExtractType === "TEXT") {
            return _this.getText(sourceElement);
          } else if (dataSource.elementExtractType === "ATTRIBUTE" && dataSource.attribute) {
            return sourceElement.getAttribute(dataSource.attribute);
          }
          return void 0;
        }
        return void 0;
      };
      this.getText = function(element) {
        var hasMaskAttribute = element.closest("[".concat(TEXT_MASK_ATTRIBUTE, "]")) !== null;
        if (hasMaskAttribute) {
          return MASKED_TEXT_VALUE;
        }
        var output = "";
        if (!element.querySelector("[".concat(TEXT_MASK_ATTRIBUTE, "], [contenteditable]"))) {
          output = element.innerText || "";
        } else {
          var clonedTree = element.cloneNode(true);
          clonedTree.querySelectorAll("[".concat(TEXT_MASK_ATTRIBUTE, "], [contenteditable]")).forEach(function(node) {
            node.innerText = MASKED_TEXT_VALUE;
          });
          output = clonedTree.innerText || "";
        }
        return _this.replaceSensitiveString(output.substring(0, 255)).replace(/\s+/g, " ").trim();
      };
      this.getEventTagProps = function(element) {
        var _a2;
        var _b2, _c;
        if (!element) {
          return {};
        }
        var tag = (_c = (_b2 = element === null || element === void 0 ? void 0 : element.tagName) === null || _b2 === void 0 ? void 0 : _b2.toLowerCase) === null || _c === void 0 ? void 0 : _c.call(_b2);
        var properties = (_a2 = {}, _a2[AMPLITUDE_EVENT_PROP_ELEMENT_TAG] = tag, _a2[AMPLITUDE_EVENT_PROP_ELEMENT_TEXT] = _this.getText(element), _a2[AMPLITUDE_EVENT_PROP_PAGE_URL] = window.location.href.split("?")[0], _a2);
        return removeEmptyProperties(properties);
      };
      var rawPatterns = (_b = options.maskTextRegex) !== null && _b !== void 0 ? _b : [];
      var compiled = [];
      try {
        for (var rawPatterns_1 = __values$1(rawPatterns), rawPatterns_1_1 = rawPatterns_1.next(); !rawPatterns_1_1.done; rawPatterns_1_1 = rawPatterns_1.next()) {
          var entry = rawPatterns_1_1.value;
          if (compiled.length >= MAX_MASK_TEXT_PATTERNS) {
            break;
          }
          if (entry instanceof RegExp) {
            compiled.push(entry);
          } else if ("pattern" in entry && typeof entry.pattern === "string") {
            try {
              compiled.push(new RegExp(entry.pattern, "i"));
            } catch (_c) {
            }
          }
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (rawPatterns_1_1 && !rawPatterns_1_1.done && (_a = rawPatterns_1.return)) _a.call(rawPatterns_1);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
      this.additionalMaskTextPatterns = compiled;
    }
    return DataExtractor2;
  }()
);
var WindowMessenger = (
  /** @class */
  function() {
    function WindowMessenger2(_a) {
      var _b = _a === void 0 ? {} : _a, _c = _b.origin, origin = _c === void 0 ? AMPLITUDE_ORIGIN : _c;
      var _this = this;
      this.endpoint = AMPLITUDE_ORIGIN;
      this.requestCallbacks = {};
      this.onSelect = function(data) {
        _this.notify({ action: "element-selected", data });
      };
      this.onTrack = function(type, properties) {
        if (type === "selector-mode-changed") {
          _this.notify({ action: "track-selector-mode-changed", data: properties });
        } else if (type === "selector-moved") {
          _this.notify({ action: "track-selector-moved", data: properties });
        }
      };
      this.endpoint = origin;
    }
    WindowMessenger2.prototype.notify = function(message) {
      var _a, _b, _c, _d;
      (_b = (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug) === null || _b === void 0 ? void 0 : _b.call(_a, "Message sent: ", JSON.stringify(message));
      (_d = (_c = window.opener) === null || _c === void 0 ? void 0 : _c.postMessage) === null || _d === void 0 ? void 0 : _d.call(_c, message, this.endpoint);
    };
    WindowMessenger2.prototype.sendRequest = function(action, args, options) {
      var _this = this;
      if (options === void 0) {
        options = { timeout: 15e3 };
      }
      var id = generateUniqueId();
      var request = {
        id,
        action,
        args
      };
      var promise = new Promise(function(resolve, reject) {
        _this.requestCallbacks[id] = { resolve, reject };
        _this.notify(request);
        if ((options === null || options === void 0 ? void 0 : options.timeout) > 0) {
          setTimeout(function() {
            reject(new Error("".concat(action, " timed out (id: ").concat(id, ")")));
            delete _this.requestCallbacks[id];
          }, options.timeout);
        }
      });
      return promise;
    };
    WindowMessenger2.prototype.handleResponse = function(response) {
      var _a;
      if (!this.requestCallbacks[response.id]) {
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.warn("No callback found for request id: ".concat(response.id));
        return;
      }
      this.requestCallbacks[response.id].resolve(response.responseData);
      delete this.requestCallbacks[response.id];
    };
    WindowMessenger2.prototype.setup = function(_a) {
      var _this = this;
      var _b = _a === void 0 ? { dataExtractor: new DataExtractor({}) } : _a, logger = _b.logger, endpoint = _b.endpoint, isElementSelectable = _b.isElementSelectable, cssSelectorAllowlist = _b.cssSelectorAllowlist, actionClickAllowlist = _b.actionClickAllowlist, dataExtractor = _b.dataExtractor;
      this.logger = logger;
      if (endpoint && this.endpoint === AMPLITUDE_ORIGIN) {
        this.endpoint = endpoint;
      }
      var amplitudeVisualTaggingSelectorInstance = null;
      window.addEventListener("message", function(event) {
        var _a2, _b2, _c, _d, _e;
        (_b2 = (_a2 = _this.logger) === null || _a2 === void 0 ? void 0 : _a2.debug) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, "Message received: ", JSON.stringify(event));
        if (_this.endpoint !== event.origin) {
          return;
        }
        var eventData = event === null || event === void 0 ? void 0 : event.data;
        var action = eventData === null || eventData === void 0 ? void 0 : eventData.action;
        if (!action) {
          return;
        }
        if ("id" in eventData) {
          (_d = (_c = _this.logger) === null || _c === void 0 ? void 0 : _c.debug) === null || _d === void 0 ? void 0 : _d.call(_c, "Received Response to previous request: ", JSON.stringify(event));
          _this.handleResponse(eventData);
        } else {
          if (action === "ping") {
            _this.notify({ action: "pong" });
          } else if (action === "initialize-visual-tagging-selector") {
            var actionData_1 = eventData === null || eventData === void 0 ? void 0 : eventData.data;
            asyncLoadScript(AMPLITUDE_VISUAL_TAGGING_SELECTOR_SCRIPT_URL).then(function() {
              var _a3;
              amplitudeVisualTaggingSelectorInstance = (_a3 = window === null || window === void 0 ? void 0 : window.amplitudeVisualTaggingSelector) === null || _a3 === void 0 ? void 0 : _a3.call(window, {
                getEventTagProps: dataExtractor.getEventTagProps,
                isElementSelectable: function(element) {
                  if (isElementSelectable) {
                    return isElementSelectable((actionData_1 === null || actionData_1 === void 0 ? void 0 : actionData_1.actionType) || "click", element);
                  }
                  return true;
                },
                onTrack: _this.onTrack,
                onSelect: _this.onSelect,
                visualHighlightClass: AMPLITUDE_VISUAL_TAGGING_HIGHLIGHT_CLASS,
                messenger: _this,
                cssSelectorAllowlist,
                actionClickAllowlist,
                extractDataFromDataSource: dataExtractor.extractDataFromDataSource,
                dataExtractor,
                diagnostics: {
                  autocapture: {
                    version: VERSION
                  }
                }
              });
              _this.notify({ action: "selector-loaded" });
            }).catch(function() {
              var _a3;
              (_a3 = _this.logger) === null || _a3 === void 0 ? void 0 : _a3.warn("Failed to initialize visual tagging selector");
            });
          } else if (action === "close-visual-tagging-selector") {
            (_e = amplitudeVisualTaggingSelectorInstance === null || amplitudeVisualTaggingSelectorInstance === void 0 ? void 0 : amplitudeVisualTaggingSelectorInstance.close) === null || _e === void 0 ? void 0 : _e.call(amplitudeVisualTaggingSelectorInstance);
          }
        }
      });
      this.notify({ action: "page-loaded" });
    };
    return WindowMessenger2;
  }()
);
var RAGE_CLICK_THRESHOLD$1 = 5;
function trackClicks(_a) {
  var amplitude = _a.amplitude, allObservables = _a.allObservables, options = _a.options, shouldTrackEvent = _a.shouldTrackEvent, evaluateTriggers = _a.evaluateTriggers;
  var clickObservable = allObservables.clickObservable;
  var comparisonTrigger = clickObservable.pipe(pairwise(), filter(function(_a2) {
    var _b = __read$1(_a2, 2), prev = _b[0], current = _b[1];
    var targetChanged = prev.event.target !== current.event.target;
    var samePos = Math.abs(current.event.screenX - prev.event.screenX) <= 20 && Math.abs(current.event.screenY - prev.event.screenY) <= 20;
    return targetChanged && !samePos;
  }));
  var timeoutTrigger = clickObservable.pipe(debounceTime(options.debounceTime), map(function() {
    return "timeout";
  }));
  var triggers = merge(comparisonTrigger, timeoutTrigger);
  var bufferedClicks = clickObservable.pipe(delay(0), filter(filterOutNonTrackableEvents), filter(function(click) {
    return shouldTrackEvent("click", click.closestTrackedAncestor);
  }), map(function(click) {
    return evaluateTriggers(click);
  }), buffer(triggers));
  return bufferedClicks.subscribe(function(clicks) {
    var e_1, _a2;
    var clickType = clicks.length >= RAGE_CLICK_THRESHOLD$1 ? AMPLITUDE_ELEMENT_CLICKED_EVENT : AMPLITUDE_ELEMENT_CLICKED_EVENT;
    try {
      for (var clicks_1 = __values$1(clicks), clicks_1_1 = clicks_1.next(); !clicks_1_1.done; clicks_1_1 = clicks_1.next()) {
        var click = clicks_1_1.value;
        amplitude === null || amplitude === void 0 ? void 0 : amplitude.track(clickType, click.targetElementProperties);
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (clicks_1_1 && !clicks_1_1.done && (_a2 = clicks_1.return)) _a2.call(clicks_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
  });
}
function trackChange(_a) {
  var amplitude = _a.amplitude, allObservables = _a.allObservables, getEventProperties = _a.getEventProperties, shouldTrackEvent = _a.shouldTrackEvent, evaluateTriggers = _a.evaluateTriggers;
  var changeObservable = allObservables.changeObservable;
  var filteredChangeObservable = changeObservable.pipe(filter(filterOutNonTrackableEvents), filter(function(changeEvent) {
    return shouldTrackEvent("change", changeEvent.closestTrackedAncestor);
  }), map(function(changeEvent) {
    return evaluateTriggers(changeEvent);
  }));
  return filteredChangeObservable.subscribe(function(changeEvent) {
    amplitude === null || amplitude === void 0 ? void 0 : amplitude.track(AMPLITUDE_ELEMENT_CHANGED_EVENT, getEventProperties("change", changeEvent.closestTrackedAncestor));
  });
}
function trackActionClick(_a) {
  var amplitude = _a.amplitude, allObservables = _a.allObservables, options = _a.options, getEventProperties = _a.getEventProperties, shouldTrackEvent = _a.shouldTrackEvent, shouldTrackActionClick = _a.shouldTrackActionClick;
  var clickObservable = allObservables.clickObservable, mutationObservable = allObservables.mutationObservable, navigateObservable = allObservables.navigateObservable;
  var filteredClickObservable = clickObservable.pipe(filter(function(click) {
    return !shouldTrackEvent("click", click.closestTrackedAncestor);
  }), map(function(click) {
    var closestActionClickEl = getClosestElement(click.event.target, options.actionClickAllowlist);
    click.closestTrackedAncestor = closestActionClickEl;
    if (click.closestTrackedAncestor !== null) {
      click.targetElementProperties = getEventProperties(click.type, click.closestTrackedAncestor);
    }
    return click;
  }), filter(filterOutNonTrackableEvents), filter(function(clickEvent) {
    return shouldTrackActionClick("click", clickEvent.closestTrackedAncestor);
  }));
  var changeObservables = [mutationObservable];
  if (navigateObservable) {
    changeObservables.push(navigateObservable);
  }
  var mutationOrNavigate = merge.apply(void 0, __spreadArray([], __read$1(changeObservables), false));
  var actionClicks = filteredClickObservable.pipe(
    // If a mutation occurs within 0.5 seconds of a click event (timeout({ first: 500 })), it emits the original first click event.
    // take 1 to only limit the action events in case there are multiple
    switchMap(function(click) {
      return mutationOrNavigate.pipe(
        take(1),
        timeout({ first: 500, with: function() {
          return EMPTY;
        } }),
        // in case of timeout, map to empty to prevent any click from being emitted
        map(function() {
          return click;
        })
      );
    })
  );
  return actionClicks.subscribe(function(actionClick) {
    amplitude === null || amplitude === void 0 ? void 0 : amplitude.track(AMPLITUDE_ELEMENT_CLICKED_EVENT, getEventProperties("click", actionClick.closestTrackedAncestor));
  });
}
var createMutationObservable = function() {
  return new Observable(function(observer) {
    var mutationObserver = new MutationObserver(function(mutations) {
      observer.next(mutations);
    });
    mutationObserver.observe(document.body, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true
    });
    return function() {
      return mutationObserver.disconnect();
    };
  });
};
var createClickObservable = function(clickType) {
  if (clickType === void 0) {
    clickType = "click";
  }
  return fromEvent(document, clickType, { capture: true });
};
var matchEventToFilter = function(event, filter2) {
  try {
    if (filter2.subprop_key === "[Amplitude] Element Text") {
      return filter2.subprop_op === "is" && filter2.subprop_value.includes(event.targetElementProperties["[Amplitude] Element Text"]);
    } else if (filter2.subprop_key === "[Amplitude] Element Hierarchy") {
      return filter2.subprop_op === "autotrack css match" && !!event.closestTrackedAncestor.closest(filter2.subprop_value.toString());
    }
  } catch (error) {
    console.error("Error matching event to filter", error);
    return false;
  }
  return false;
};
var eventTypeToBrowserEventMap = {
  "[Amplitude] Element Clicked": "click",
  "[Amplitude] Element Changed": "change"
};
var groupLabeledEventIdsByEventType = function(labeledEvents) {
  var e_1, _a, e_2, _b;
  var groupedLabeledEvents = Object.values(eventTypeToBrowserEventMap).reduce(function(acc, browserEvent2) {
    acc[browserEvent2] = /* @__PURE__ */ new Set();
    return acc;
  }, {});
  if (!labeledEvents) {
    return groupedLabeledEvents;
  }
  try {
    for (var labeledEvents_1 = __values$1(labeledEvents), labeledEvents_1_1 = labeledEvents_1.next(); !labeledEvents_1_1.done; labeledEvents_1_1 = labeledEvents_1.next()) {
      var le = labeledEvents_1_1.value;
      try {
        try {
          for (var _c = (e_2 = void 0, __values$1(le.definition)), _d = _c.next(); !_d.done; _d = _c.next()) {
            var def = _d.value;
            var browserEvent = eventTypeToBrowserEventMap[def.event_type];
            if (browserEvent) {
              groupedLabeledEvents[browserEvent].add(le.id);
            }
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
      } catch (e2) {
        console.warn("Skipping Labeled Event due to malformed definition", le === null || le === void 0 ? void 0 : le.id, e2);
      }
    }
  } catch (e_1_1) {
    e_1 = { error: e_1_1 };
  } finally {
    try {
      if (labeledEvents_1_1 && !labeledEvents_1_1.done && (_a = labeledEvents_1.return)) _a.call(labeledEvents_1);
    } finally {
      if (e_1) throw e_1.error;
    }
  }
  return groupedLabeledEvents;
};
var createLabeledEventToTriggerMap = function(triggers) {
  var e_3, _a, e_4, _b;
  var labeledEventToTriggerMap = /* @__PURE__ */ new Map();
  try {
    for (var triggers_1 = __values$1(triggers), triggers_1_1 = triggers_1.next(); !triggers_1_1.done; triggers_1_1 = triggers_1.next()) {
      var trigger = triggers_1_1.value;
      try {
        for (var _c = (e_4 = void 0, __values$1(trigger.conditions)), _d = _c.next(); !_d.done; _d = _c.next()) {
          var condition = _d.value;
          if (condition.type === "LABELED_EVENT") {
            var eventId = condition.match.eventId;
            var existingTriggers = labeledEventToTriggerMap.get(eventId);
            if (!existingTriggers) {
              existingTriggers = [];
              labeledEventToTriggerMap.set(eventId, existingTriggers);
            }
            existingTriggers.push(trigger);
          }
        }
      } catch (e_4_1) {
        e_4 = { error: e_4_1 };
      } finally {
        try {
          if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
        } finally {
          if (e_4) throw e_4.error;
        }
      }
    }
  } catch (e_3_1) {
    e_3 = { error: e_3_1 };
  } finally {
    try {
      if (triggers_1_1 && !triggers_1_1.done && (_a = triggers_1.return)) _a.call(triggers_1);
    } finally {
      if (e_3) throw e_3.error;
    }
  }
  return labeledEventToTriggerMap;
};
var matchEventToLabeledEvents = function(event, labeledEvents) {
  return labeledEvents.filter(function(le) {
    return le.definition.some(function(def) {
      return eventTypeToBrowserEventMap[def.event_type] === event.type && def.filters.every(function(filter2) {
        return matchEventToFilter(event, filter2);
      });
    });
  });
};
var matchLabeledEventsToTriggers = function(labeledEvents, leToTriggerMap) {
  var e_5, _a, e_6, _b;
  var matchingTriggers = /* @__PURE__ */ new Set();
  try {
    for (var labeledEvents_2 = __values$1(labeledEvents), labeledEvents_2_1 = labeledEvents_2.next(); !labeledEvents_2_1.done; labeledEvents_2_1 = labeledEvents_2.next()) {
      var le = labeledEvents_2_1.value;
      var triggers = leToTriggerMap.get(le.id);
      if (triggers) {
        try {
          for (var triggers_2 = (e_6 = void 0, __values$1(triggers)), triggers_2_1 = triggers_2.next(); !triggers_2_1.done; triggers_2_1 = triggers_2.next()) {
            var trigger = triggers_2_1.value;
            matchingTriggers.add(trigger);
          }
        } catch (e_6_1) {
          e_6 = { error: e_6_1 };
        } finally {
          try {
            if (triggers_2_1 && !triggers_2_1.done && (_b = triggers_2.return)) _b.call(triggers_2);
          } finally {
            if (e_6) throw e_6.error;
          }
        }
      }
    }
  } catch (e_5_1) {
    e_5 = { error: e_5_1 };
  } finally {
    try {
      if (labeledEvents_2_1 && !labeledEvents_2_1.done && (_a = labeledEvents_2.return)) _a.call(labeledEvents_2);
    } finally {
      if (e_5) throw e_5.error;
    }
  }
  return Array.from(matchingTriggers);
};
var TriggerEvaluator = (
  /** @class */
  function() {
    function TriggerEvaluator2(groupedLabeledEvents, labeledEventToTriggerMap, dataExtractor, options) {
      this.groupedLabeledEvents = groupedLabeledEvents;
      this.labeledEventToTriggerMap = labeledEventToTriggerMap;
      this.dataExtractor = dataExtractor;
      this.options = options;
    }
    TriggerEvaluator2.prototype.evaluate = function(event) {
      var e_7, _a;
      var pageActions = this.options.pageActions;
      if (!pageActions) {
        return event;
      }
      var matchingLabeledEvents = matchEventToLabeledEvents(event, Array.from(this.groupedLabeledEvents[event.type]).map(function(id) {
        return pageActions.labeledEvents[id];
      }));
      var matchingTriggers = matchLabeledEventsToTriggers(matchingLabeledEvents, this.labeledEventToTriggerMap);
      try {
        for (var matchingTriggers_1 = __values$1(matchingTriggers), matchingTriggers_1_1 = matchingTriggers_1.next(); !matchingTriggers_1_1.done; matchingTriggers_1_1 = matchingTriggers_1.next()) {
          var trigger = matchingTriggers_1_1.value;
          executeActions(trigger.actions, event, this.dataExtractor);
        }
      } catch (e_7_1) {
        e_7 = { error: e_7_1 };
      } finally {
        try {
          if (matchingTriggers_1_1 && !matchingTriggers_1_1.done && (_a = matchingTriggers_1.return)) _a.call(matchingTriggers_1);
        } finally {
          if (e_7) throw e_7.error;
        }
      }
      return event;
    };
    TriggerEvaluator2.prototype.update = function(groupedLabeledEvents, labeledEventToTriggerMap, options) {
      this.groupedLabeledEvents = groupedLabeledEvents;
      this.labeledEventToTriggerMap = labeledEventToTriggerMap;
      this.options = options;
    };
    return TriggerEvaluator2;
  }()
);
var createTriggerEvaluator = function(groupedLabeledEvents, labeledEventToTriggerMap, dataExtractor, options) {
  return new TriggerEvaluator(groupedLabeledEvents, labeledEventToTriggerMap, dataExtractor, options);
};
var ObservablesEnum$1;
(function(ObservablesEnum2) {
  ObservablesEnum2["ClickObservable"] = "clickObservable";
  ObservablesEnum2["ChangeObservable"] = "changeObservable";
  ObservablesEnum2["NavigateObservable"] = "navigateObservable";
  ObservablesEnum2["MutationObservable"] = "mutationObservable";
})(ObservablesEnum$1 || (ObservablesEnum$1 = {}));
var autocapturePlugin = function(options) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  if (options === void 0) {
    options = {};
  }
  var _j = options.dataAttributePrefix, dataAttributePrefix = _j === void 0 ? DEFAULT_DATA_ATTRIBUTE_PREFIX : _j, _k = options.visualTaggingOptions, visualTaggingOptions = _k === void 0 ? {
    enabled: true,
    messenger: new WindowMessenger()
  } : _k;
  options.cssSelectorAllowlist = (_a = options.cssSelectorAllowlist) !== null && _a !== void 0 ? _a : DEFAULT_CSS_SELECTOR_ALLOWLIST;
  options.actionClickAllowlist = (_b = options.actionClickAllowlist) !== null && _b !== void 0 ? _b : DEFAULT_ACTION_CLICK_ALLOWLIST;
  options.debounceTime = (_c = options.debounceTime) !== null && _c !== void 0 ? _c : 0;
  options.pageUrlExcludelist = (_d = options.pageUrlExcludelist) === null || _d === void 0 ? void 0 : _d.reduce(function(acc, excludePattern) {
    if (typeof excludePattern === "string") {
      acc.push(excludePattern);
    }
    if (excludePattern instanceof RegExp) {
      acc.push(excludePattern);
    }
    if (typeof excludePattern === "object" && excludePattern !== null && "pattern" in excludePattern) {
      try {
        acc.push(new RegExp(excludePattern.pattern));
      } catch (regexError) {
        console.warn("Invalid regex pattern: ".concat(excludePattern.pattern), regexError);
        return acc;
      }
    }
    return acc;
  }, []);
  var name = PLUGIN_NAME$2;
  var type = "enrichment";
  var subscriptions = [];
  var dataExtractor = new DataExtractor(options);
  var createObservables = function() {
    var _a2;
    var clickObservable = createClickObservable().pipe(map(function(click) {
      return dataExtractor.addAdditionalEventProperties(click, "click", options.cssSelectorAllowlist, dataAttributePrefix);
    }), share());
    var changeObservable = fromEvent(document, "change", { capture: true }).pipe(map(function(change) {
      return dataExtractor.addAdditionalEventProperties(change, "change", options.cssSelectorAllowlist, dataAttributePrefix);
    }), share());
    var navigateObservable;
    if (window.navigation) {
      navigateObservable = fromEvent(window.navigation, "navigate").pipe(map(function(navigate) {
        return dataExtractor.addAdditionalEventProperties(navigate, "navigate", options.cssSelectorAllowlist, dataAttributePrefix);
      }), share());
    }
    var mutationObservable = createMutationObservable().pipe(map(function(mutation) {
      return dataExtractor.addAdditionalEventProperties(mutation, "mutation", options.cssSelectorAllowlist, dataAttributePrefix);
    }), share());
    return _a2 = {}, _a2[ObservablesEnum$1.ClickObservable] = clickObservable, _a2[ObservablesEnum$1.ChangeObservable] = changeObservable, // [ObservablesEnum.ErrorObservable]: errorObservable,
    _a2[ObservablesEnum$1.NavigateObservable] = navigateObservable, _a2[ObservablesEnum$1.MutationObservable] = mutationObservable, _a2;
  };
  var groupedLabeledEvents = groupLabeledEventIdsByEventType(Object.values((_f = (_e = options.pageActions) === null || _e === void 0 ? void 0 : _e.labeledEvents) !== null && _f !== void 0 ? _f : {}));
  var labeledEventToTriggerMap = createLabeledEventToTriggerMap((_h = (_g = options.pageActions) === null || _g === void 0 ? void 0 : _g.triggers) !== null && _h !== void 0 ? _h : []);
  var evaluateTriggers = createTriggerEvaluator(groupedLabeledEvents, labeledEventToTriggerMap, dataExtractor, options);
  var recomputePageActionsData = function(remotePageActions) {
    var _a2, _b2;
    if (remotePageActions) {
      options.pageActions = __assign$1(__assign$1({}, options.pageActions), remotePageActions);
      groupedLabeledEvents = groupLabeledEventIdsByEventType(Object.values((_a2 = options.pageActions.labeledEvents) !== null && _a2 !== void 0 ? _a2 : {}));
      labeledEventToTriggerMap = createLabeledEventToTriggerMap((_b2 = options.pageActions.triggers) !== null && _b2 !== void 0 ? _b2 : []);
      evaluateTriggers.update(groupedLabeledEvents, labeledEventToTriggerMap, options);
    }
  };
  var setup = function(config2, amplitude) {
    return __awaiter(void 0, void 0, void 0, function() {
      var shouldTrackEvent, shouldTrackActionClick, allObservables, clickTrackingSubscription, changeSubscription, actionClickSubscription, allowlist, actionClickAllowlist;
      var _a2, _b2;
      return __generator(this, function(_c2) {
        if (typeof document === "undefined") {
          return [
            2
            /*return*/
          ];
        }
        if (config2.fetchRemoteConfig) {
          createRemoteConfigFetch({
            localConfig: config2,
            configKeys: ["analyticsSDK.pageActions"]
          }).then(function(remoteConfigFetch) {
            return __awaiter(void 0, void 0, void 0, function() {
              var remotePageActions, error_1;
              var _a3;
              return __generator(this, function(_b3) {
                switch (_b3.label) {
                  case 0:
                    _b3.trys.push([0, 2, , 3]);
                    return [4, remoteConfigFetch.getRemoteConfig("analyticsSDK", "pageActions")];
                  case 1:
                    remotePageActions = _b3.sent();
                    recomputePageActionsData(remotePageActions);
                    return [3, 3];
                  case 2:
                    error_1 = _b3.sent();
                    (_a3 = config2 === null || config2 === void 0 ? void 0 : config2.loggerProvider) === null || _a3 === void 0 ? void 0 : _a3.error("Failed to fetch remote config: ".concat(String(error_1)));
                    return [3, 3];
                  case 3:
                    return [
                      2
                      /*return*/
                    ];
                }
              });
            });
          }).catch(function(error) {
            var _a3;
            (_a3 = config2 === null || config2 === void 0 ? void 0 : config2.loggerProvider) === null || _a3 === void 0 ? void 0 : _a3.error("Failed to create remote config fetch: ".concat(String(error)));
          });
        }
        shouldTrackEvent = createShouldTrackEvent(options, options.cssSelectorAllowlist);
        shouldTrackActionClick = createShouldTrackEvent(options, options.actionClickAllowlist);
        allObservables = createObservables();
        clickTrackingSubscription = trackClicks({
          allObservables,
          options,
          amplitude,
          shouldTrackEvent,
          evaluateTriggers: evaluateTriggers.evaluate.bind(evaluateTriggers)
        });
        subscriptions.push(clickTrackingSubscription);
        changeSubscription = trackChange({
          allObservables,
          getEventProperties: function() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
            }
            return dataExtractor.getEventProperties.apply(dataExtractor, __spreadArray(__spreadArray([], __read$1(args), false), [dataAttributePrefix], false));
          },
          amplitude,
          shouldTrackEvent,
          evaluateTriggers: evaluateTriggers.evaluate.bind(evaluateTriggers)
        });
        subscriptions.push(changeSubscription);
        actionClickSubscription = trackActionClick({
          allObservables,
          options,
          getEventProperties: function() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
            }
            return dataExtractor.getEventProperties.apply(dataExtractor, __spreadArray(__spreadArray([], __read$1(args), false), [dataAttributePrefix], false));
          },
          amplitude,
          shouldTrackEvent,
          shouldTrackActionClick
        });
        subscriptions.push(actionClickSubscription);
        (_a2 = config2 === null || config2 === void 0 ? void 0 : config2.loggerProvider) === null || _a2 === void 0 ? void 0 : _a2.log("".concat(name, " has been successfully added."));
        if (window.opener && visualTaggingOptions.enabled) {
          allowlist = options.cssSelectorAllowlist;
          actionClickAllowlist = options.actionClickAllowlist;
          (_b2 = visualTaggingOptions.messenger) === null || _b2 === void 0 ? void 0 : _b2.setup(__assign$1(__assign$1({ dataExtractor, logger: config2 === null || config2 === void 0 ? void 0 : config2.loggerProvider }, (config2 === null || config2 === void 0 ? void 0 : config2.serverZone) && { endpoint: AMPLITUDE_ORIGINS_MAP[config2.serverZone] }), { isElementSelectable: createShouldTrackEvent(options, __spreadArray(__spreadArray([], __read$1(allowlist), false), __read$1(actionClickAllowlist), false)), cssSelectorAllowlist: allowlist, actionClickAllowlist }));
        }
        return [
          2
          /*return*/
        ];
      });
    });
  };
  var execute = function(event) {
    return __awaiter(void 0, void 0, void 0, function() {
      return __generator(this, function(_a2) {
        return [2, event];
      });
    });
  };
  var teardown = function() {
    return __awaiter(void 0, void 0, void 0, function() {
      var subscriptions_1, subscriptions_1_1, subscription;
      var e_1, _a2;
      return __generator(this, function(_b2) {
        try {
          for (subscriptions_1 = __values$1(subscriptions), subscriptions_1_1 = subscriptions_1.next(); !subscriptions_1_1.done; subscriptions_1_1 = subscriptions_1.next()) {
            subscription = subscriptions_1_1.value;
            subscription.unsubscribe();
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (subscriptions_1_1 && !subscriptions_1_1.done && (_a2 = subscriptions_1.return)) _a2.call(subscriptions_1);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
        return [
          2
          /*return*/
        ];
      });
    });
  };
  return {
    name,
    type,
    setup,
    execute,
    teardown
  };
};
var DEAD_CLICK_TIMEOUT = 3e3;
function trackDeadClick(_a) {
  var amplitude = _a.amplitude, allObservables = _a.allObservables, getEventProperties = _a.getEventProperties, shouldTrackDeadClick = _a.shouldTrackDeadClick;
  var clickObservable = allObservables.clickObservable, mutationObservable = allObservables.mutationObservable, navigateObservable = allObservables.navigateObservable;
  var filteredClickObservable = clickObservable.pipe(filter(filterOutNonTrackableEvents), filter(function(clickEvent) {
    return shouldTrackDeadClick("click", clickEvent.closestTrackedAncestor);
  }));
  var changeObservables = [mutationObservable];
  if (navigateObservable) {
    changeObservables.push(navigateObservable);
  }
  var mutationOrNavigate = merge.apply(void 0, __spreadArray([], __read$1(changeObservables), false));
  var actionClicks = filteredClickObservable.pipe(
    mergeMap(function(click) {
      var timeoutId;
      var timer2 = new Observable(function(subscriber) {
        timeoutId = setTimeout(function() {
          return subscriber.next(click);
        }, DEAD_CLICK_TIMEOUT);
        return function() {
          clearTimeout(timeoutId);
        };
      });
      return race(timer2, mutationOrNavigate.pipe(take(1), map(function() {
        return null;
      }))).pipe(filter(function(value) {
        return value !== null;
      }));
    }),
    // Only allow one dead click event every 3 seconds
    throttleTime(DEAD_CLICK_TIMEOUT)
  );
  return actionClicks.subscribe(function(actionClick) {
    var deadClickEvent = {
      "[Amplitude] X": actionClick.event.clientX,
      "[Amplitude] Y": actionClick.event.clientY
    };
    amplitude.track(AMPLITUDE_ELEMENT_DEAD_CLICKED_EVENT, __assign$1(__assign$1({}, getEventProperties("click", actionClick.closestTrackedAncestor)), deadClickEvent), { time: actionClick.timestamp });
  });
}
var RAGE_CLICK_THRESHOLD = DEFAULT_RAGE_CLICK_THRESHOLD;
var RAGE_CLICK_WINDOW_MS = DEFAULT_RAGE_CLICK_WINDOW_MS;
var RAGE_CLICK_OUT_OF_BOUNDS_THRESHOLD = DEFAULT_RAGE_CLICK_OUT_OF_BOUNDS_THRESHOLD;
function addCoordinates(regionBox, click) {
  var _a, _b, _c, _d;
  var _e = click.event, clientX = _e.clientX, clientY = _e.clientY;
  regionBox.yMin = Math.min((_a = regionBox.yMin) !== null && _a !== void 0 ? _a : clientY, clientY);
  regionBox.yMax = Math.max((_b = regionBox.yMax) !== null && _b !== void 0 ? _b : clientY, clientY);
  regionBox.xMin = Math.min((_c = regionBox.xMin) !== null && _c !== void 0 ? _c : clientX, clientX);
  regionBox.xMax = Math.max((_d = regionBox.xMax) !== null && _d !== void 0 ? _d : clientX, clientX);
  regionBox.isOutOfBounds = regionBox.yMax - regionBox.yMin > RAGE_CLICK_OUT_OF_BOUNDS_THRESHOLD || regionBox.xMax - regionBox.xMin > RAGE_CLICK_OUT_OF_BOUNDS_THRESHOLD;
}
function getRageClickAnalyticsEvent(clickWindow) {
  var firstClick = clickWindow[0];
  var lastClick = clickWindow[clickWindow.length - 1];
  var rageClickEvent = __assign$1({ "[Amplitude] Begin Time": new Date(firstClick.timestamp).toISOString(), "[Amplitude] End Time": new Date(lastClick.timestamp).toISOString(), "[Amplitude] Duration": lastClick.timestamp - firstClick.timestamp, "[Amplitude] Clicks": clickWindow.map(function(click) {
    return {
      X: click.event.clientX,
      Y: click.event.clientY,
      Time: click.timestamp
    };
  }), "[Amplitude] Click Count": clickWindow.length }, firstClick.targetElementProperties);
  return { rageClickEvent, time: firstClick.timestamp };
}
function isClickOutsideRageClickWindow(clickWindow, click) {
  var firstIndex = Math.max(0, clickWindow.length - RAGE_CLICK_THRESHOLD + 1);
  var firstClick = clickWindow[firstIndex];
  return click.timestamp - firstClick.timestamp >= RAGE_CLICK_WINDOW_MS;
}
function isNewElement(clickWindow, click) {
  return clickWindow.length > 0 && clickWindow[clickWindow.length - 1].closestTrackedAncestor !== click.closestTrackedAncestor;
}
function trackRageClicks(_a) {
  var amplitude = _a.amplitude, allObservables = _a.allObservables, shouldTrackRageClick = _a.shouldTrackRageClick;
  var clickObservable = allObservables.clickObservable;
  var clickWindow = [];
  var clickBoundingBox = {};
  var triggerRageClickTimeout;
  function resetClickWindow(click) {
    clickWindow = [];
    clickBoundingBox = {};
    if (click) {
      addCoordinates(clickBoundingBox, click);
      clickWindow.push(click);
    }
  }
  return clickObservable.pipe(filter(filterOutNonTrackableEvents), filter(function(click) {
    return shouldTrackRageClick("click", click.closestTrackedAncestor);
  }), map(function(click) {
    if (triggerRageClickTimeout) {
      clearTimeout(triggerRageClickTimeout);
    }
    addCoordinates(clickBoundingBox, click);
    if (clickWindow.length === 0) {
      clickWindow.push(click);
      return null;
    }
    if (isNewElement(clickWindow, click) || isClickOutsideRageClickWindow(clickWindow, click) || clickBoundingBox.isOutOfBounds) {
      var returnValue = clickWindow.length >= RAGE_CLICK_THRESHOLD ? getRageClickAnalyticsEvent(clickWindow) : null;
      resetClickWindow(click);
      return returnValue;
    }
    clickWindow.push(click);
    if (clickWindow.length >= RAGE_CLICK_THRESHOLD) {
      triggerRageClickTimeout = setTimeout(function() {
        var _a2 = getRageClickAnalyticsEvent(clickWindow), rageClickEvent = _a2.rageClickEvent, time = _a2.time;
        amplitude.track(AMPLITUDE_ELEMENT_RAGE_CLICKED_EVENT, rageClickEvent, { time });
        resetClickWindow();
      }, RAGE_CLICK_WINDOW_MS);
    }
    return null;
  }), filter(function(result) {
    return result !== null;
  })).subscribe(function(data) {
    if (data === null) {
      return;
    }
    amplitude.track(AMPLITUDE_ELEMENT_RAGE_CLICKED_EVENT, data.rageClickEvent, { time: data.time });
  });
}
var frustrationPlugin = function(options) {
  var _a, _b, _c, _d, _e;
  if (options === void 0) {
    options = {};
  }
  var name = FRUSTRATION_PLUGIN_NAME;
  var type = "enrichment";
  var subscriptions = [];
  var rageCssSelectors = (_b = (_a = options.rageClicks) === null || _a === void 0 ? void 0 : _a.cssSelectorAllowlist) !== null && _b !== void 0 ? _b : DEFAULT_RAGE_CLICK_ALLOWLIST;
  var deadCssSelectors = (_d = (_c = options.deadClicks) === null || _c === void 0 ? void 0 : _c.cssSelectorAllowlist) !== null && _d !== void 0 ? _d : DEFAULT_DEAD_CLICK_ALLOWLIST;
  var dataAttributePrefix = (_e = options.dataAttributePrefix) !== null && _e !== void 0 ? _e : DEFAULT_DATA_ATTRIBUTE_PREFIX;
  var dataExtractor = new DataExtractor(options);
  var combinedCssSelectors = __spreadArray([], __read$1(new Set(__spreadArray(__spreadArray([], __read$1(rageCssSelectors), false), __read$1(deadCssSelectors), false))), false);
  var createObservables = function() {
    var _a2;
    var clickObservable = createClickObservable("pointerdown").pipe(map(function(click) {
      return dataExtractor.addAdditionalEventProperties(click, "click", combinedCssSelectors, dataAttributePrefix, true);
    }), share());
    var navigateObservable;
    if (window.navigation) {
      navigateObservable = fromEvent(window.navigation, "navigate").pipe(map(function(navigate) {
        return dataExtractor.addAdditionalEventProperties(navigate, "navigate", combinedCssSelectors, dataAttributePrefix);
      }), share());
    }
    var enrichedMutationObservable = createMutationObservable().pipe(map(function(mutation) {
      return dataExtractor.addAdditionalEventProperties(mutation, "mutation", combinedCssSelectors, dataAttributePrefix);
    }), share());
    return _a2 = {}, _a2[ObservablesEnum$1.ClickObservable] = clickObservable, _a2[ObservablesEnum$1.ChangeObservable] = new Observable(), _a2[ObservablesEnum$1.NavigateObservable] = navigateObservable, _a2[ObservablesEnum$1.MutationObservable] = enrichedMutationObservable, _a2;
  };
  var setup = function(config2, amplitude) {
    return __awaiter(void 0, void 0, void 0, function() {
      var shouldTrackRageClick, shouldTrackDeadClick, allObservables, rageClickSubscription, deadClickSubscription;
      var _a2;
      return __generator(this, function(_b2) {
        if (typeof document === "undefined") {
          return [
            2
            /*return*/
          ];
        }
        shouldTrackRageClick = createShouldTrackEvent(options, rageCssSelectors);
        shouldTrackDeadClick = createShouldTrackEvent(options, deadCssSelectors);
        allObservables = createObservables();
        rageClickSubscription = trackRageClicks({
          allObservables,
          amplitude,
          shouldTrackRageClick
        });
        subscriptions.push(rageClickSubscription);
        deadClickSubscription = trackDeadClick({
          amplitude,
          allObservables,
          getEventProperties: function(actionType, element) {
            return dataExtractor.getEventProperties(actionType, element, dataAttributePrefix);
          },
          shouldTrackDeadClick
        });
        subscriptions.push(deadClickSubscription);
        (_a2 = config2 === null || config2 === void 0 ? void 0 : config2.loggerProvider) === null || _a2 === void 0 ? void 0 : _a2.log("".concat(name, " has been successfully added."));
        return [
          2
          /*return*/
        ];
      });
    });
  };
  var execute = function(event) {
    return __awaiter(void 0, void 0, void 0, function() {
      return __generator(this, function(_a2) {
        return [2, event];
      });
    });
  };
  var teardown = function() {
    return __awaiter(void 0, void 0, void 0, function() {
      var subscriptions_1, subscriptions_1_1, subscription;
      var e_1, _a2;
      return __generator(this, function(_b2) {
        try {
          for (subscriptions_1 = __values$1(subscriptions), subscriptions_1_1 = subscriptions_1.next(); !subscriptions_1_1.done; subscriptions_1_1 = subscriptions_1.next()) {
            subscription = subscriptions_1_1.value;
            subscription.unsubscribe();
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (subscriptions_1_1 && !subscriptions_1_1.done && (_a2 = subscriptions_1.return)) _a2.call(subscriptions_1);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
        return [
          2
          /*return*/
        ];
      });
    });
  };
  return {
    name,
    type,
    setup,
    execute,
    teardown
  };
};
var PLUGIN_NAME$1 = "@amplitude/plugin-network-capture-browser";
var AMPLITUDE_NETWORK_REQUEST_EVENT = "[Amplitude] Network Request";
var DEFAULT_STATUS_CODE_RANGE = "500-599";
function wildcardMatch(str, pattern) {
  var escapedPattern = pattern.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&");
  var regexPattern = "^" + escapedPattern.replace(/\*/g, ".*") + "$";
  var regex = new RegExp(regexPattern);
  return regex.test(str);
}
function isStatusCodeInRange(statusCode, range) {
  var e_1, _a;
  var ranges = range.split(",");
  try {
    for (var ranges_1 = __values$1(ranges), ranges_1_1 = ranges_1.next(); !ranges_1_1.done; ranges_1_1 = ranges_1.next()) {
      var r2 = ranges_1_1.value;
      var _b = __read$1(r2.split("-").map(Number), 2), start = _b[0], end = _b[1];
      if (statusCode === start && end === void 0) {
        return true;
      }
      if (statusCode >= start && statusCode <= end) {
        return true;
      }
    }
  } catch (e_1_1) {
    e_1 = { error: e_1_1 };
  } finally {
    try {
      if (ranges_1_1 && !ranges_1_1.done && (_a = ranges_1.return)) _a.call(ranges_1);
    } finally {
      if (e_1) throw e_1.error;
    }
  }
  return false;
}
function isCaptureRuleMatch(rule, hostname, status, url, method) {
  if (rule.hosts && !rule.hosts.find(function(host) {
    return wildcardMatch(hostname, host);
  })) {
    return;
  }
  if (url && rule.urls && !isUrlMatchAllowlist(url, rule.urls)) {
    return;
  }
  if (method && rule.methods && !rule.methods.find(function(allowedMethod) {
    return method.toLowerCase() === allowedMethod.toLowerCase() || allowedMethod === "*";
  })) {
    return;
  }
  if (status || status === 0) {
    var statusCodeRange = rule.statusCodeRange || DEFAULT_STATUS_CODE_RANGE;
    if (!isStatusCodeInRange(status, statusCodeRange)) {
      return false;
    }
  }
  return true;
}
function parseUrl(url) {
  var _a;
  if (!url) {
    return;
  }
  try {
    var currentHref = (_a = getGlobalScope$1()) === null || _a === void 0 ? void 0 : _a.location.href;
    var urlObj = new URL(url, currentHref);
    var query = urlObj.searchParams.toString();
    var fragment = urlObj.hash.replace("#", "");
    var href = urlObj.href;
    var host = urlObj.host;
    urlObj.hash = "";
    urlObj.search = "";
    var hrefWithoutQueryOrHash = urlObj.href;
    return { query, fragment, href, hrefWithoutQueryOrHash, host };
  } catch (e2) {
    return;
  }
}
function isAmplitudeNetworkRequestEvent(host, requestWrapper) {
  if (host.includes("amplitude.com")) {
    try {
      var body = requestWrapper.body;
      if (typeof body !== "string") {
        return false;
      }
      var bodyObj = JSON.parse(body);
      var events = bodyObj.events;
      if (events.find(function(event) {
        return event.event_type === AMPLITUDE_NETWORK_REQUEST_EVENT;
      })) {
        return true;
      }
    } catch (e2) {
    }
  }
  return false;
}
function parseHeaderCaptureRule(rule) {
  if (typeof rule !== "object" || rule === null) {
    if (rule) {
      return __spreadArray([], __read$1(SAFE_HEADERS), false);
    } else if (rule === void 0) {
      var res = void 0;
      return res;
    }
    return;
  }
  if (rule.length === 0) {
    return;
  }
  return rule;
}
function isBodyCaptureRuleEmpty(rule) {
  var _a, _b;
  return !((_a = rule === null || rule === void 0 ? void 0 : rule.allowlist) === null || _a === void 0 ? void 0 : _a.length) && !((_b = rule === null || rule === void 0 ? void 0 : rule.blocklist) === null || _b === void 0 ? void 0 : _b.length);
}
function shouldTrackNetworkEvent(networkEvent, options) {
  var _a;
  if (options === void 0) {
    options = {};
  }
  var urlObj = parseUrl(networkEvent.url);
  if (!urlObj) {
    return false;
  }
  var host = urlObj.host;
  if (options.ignoreAmplitudeRequests !== false && (wildcardMatch(host, "*.amplitude.com") || wildcardMatch(host, "amplitude.com"))) {
    return false;
  }
  if ((_a = options.ignoreHosts) === null || _a === void 0 ? void 0 : _a.find(function(ignoreHost) {
    return wildcardMatch(host, ignoreHost);
  })) {
    return false;
  }
  if (!options.captureRules && networkEvent.status !== void 0 && !isStatusCodeInRange(networkEvent.status, DEFAULT_STATUS_CODE_RANGE)) {
    return false;
  }
  if (options.captureRules) {
    var isMatch_1;
    __spreadArray([], __read$1(options.captureRules), false).reverse().find(function(rule) {
      isMatch_1 = isCaptureRuleMatch(rule, host, networkEvent.status, networkEvent.url, networkEvent.method);
      if (isMatch_1) {
        var responseHeadersRule = parseHeaderCaptureRule(rule.responseHeaders);
        if (networkEvent.responseWrapper && responseHeadersRule) {
          var responseHeaders = networkEvent.responseWrapper.headers(responseHeadersRule);
          if (responseHeaders) {
            networkEvent.responseHeaders = responseHeaders;
          }
        }
        var requestHeadersRule = parseHeaderCaptureRule(rule.requestHeaders);
        if (networkEvent.requestWrapper && requestHeadersRule) {
          var requestHeaders = networkEvent.requestWrapper.headers(requestHeadersRule);
          if (requestHeaders) {
            networkEvent.requestHeaders = requestHeaders;
          }
        }
        if (networkEvent.responseWrapper && rule.responseBody && !isBodyCaptureRuleEmpty(rule.responseBody)) {
          networkEvent.responseBodyJson = networkEvent.responseWrapper.json(rule.responseBody.allowlist, rule.responseBody.blocklist);
        }
        if (networkEvent.requestWrapper && rule.requestBody && !isBodyCaptureRuleEmpty(rule.requestBody)) {
          networkEvent.requestBodyJson = networkEvent.requestWrapper.json(rule.requestBody.allowlist, rule.requestBody.blocklist);
        }
      }
      return isMatch_1 !== void 0;
    });
    if (!isMatch_1) {
      return false;
    }
  }
  if (networkEvent.requestWrapper && isAmplitudeNetworkRequestEvent(host, networkEvent.requestWrapper)) {
    return false;
  }
  return true;
}
function logNetworkAnalyticsEvent(networkAnalyticsEvent, request, amplitude) {
  return __awaiter(this, void 0, void 0, function() {
    var _a, requestBody, responseBody;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          if (!(request.requestBodyJson || request.responseBodyJson)) return [3, 2];
          return [4, Promise.all([request.requestBodyJson, request.responseBodyJson])];
        case 1:
          _a = __read$1.apply(void 0, [_b.sent(), 2]), requestBody = _a[0], responseBody = _a[1];
          if (requestBody) {
            networkAnalyticsEvent["[Amplitude] Request Body"] = requestBody;
          }
          if (responseBody) {
            networkAnalyticsEvent["[Amplitude] Response Body"] = responseBody;
          }
          _b.label = 2;
        case 2:
          amplitude === null || amplitude === void 0 ? void 0 : amplitude.track(AMPLITUDE_NETWORK_REQUEST_EVENT, networkAnalyticsEvent);
          return [
            2
            /*return*/
          ];
      }
    });
  });
}
function trackNetworkEvents(_a) {
  var allObservables = _a.allObservables, networkTrackingOptions = _a.networkTrackingOptions, amplitude = _a.amplitude;
  var networkObservable = allObservables.networkObservable;
  var filteredNetworkObservable = networkObservable.pipe(filter(function(event) {
    return shouldTrackNetworkEvent(event.event, networkTrackingOptions);
  }));
  return filteredNetworkObservable.subscribe(function(networkEvent) {
    var _a2;
    var _b, _c;
    var request = networkEvent.event;
    var urlObj = parseUrl(request.url);
    if (!urlObj) {
      return;
    }
    var responseBodySize = (_b = request.responseWrapper) === null || _b === void 0 ? void 0 : _b.bodySize;
    var requestBodySize = (_c = request.requestWrapper) === null || _c === void 0 ? void 0 : _c.bodySize;
    var networkAnalyticsEvent = (_a2 = {}, _a2["[Amplitude] URL"] = urlObj.hrefWithoutQueryOrHash, _a2["[Amplitude] URL Query"] = urlObj.query, _a2["[Amplitude] URL Fragment"] = urlObj.fragment, _a2["[Amplitude] Request Method"] = request.method, _a2["[Amplitude] Status Code"] = request.status, _a2["[Amplitude] Start Time"] = request.startTime, _a2["[Amplitude] Completion Time"] = request.endTime, _a2["[Amplitude] Duration"] = request.duration, _a2["[Amplitude] Request Body Size"] = requestBodySize, _a2["[Amplitude] Response Body Size"] = responseBodySize, _a2["[Amplitude] Request Type"] = request.type, _a2["[Amplitude] Request Headers"] = request.requestHeaders, _a2["[Amplitude] Response Headers"] = request.responseHeaders, _a2);
    void logNetworkAnalyticsEvent(networkAnalyticsEvent, request, amplitude);
  });
}
var ObservablesEnum;
(function(ObservablesEnum2) {
  ObservablesEnum2["NetworkObservable"] = "networkObservable";
})(ObservablesEnum || (ObservablesEnum = {}));
var networkCapturePlugin = function(options) {
  if (options === void 0) {
    options = {};
  }
  var name = PLUGIN_NAME$1;
  var type = "enrichment";
  var logger;
  var subscriptions = [];
  var addAdditionalEventProperties = function(event, type2) {
    var baseEvent = {
      event,
      timestamp: Date.now(),
      type: type2
    };
    return baseEvent;
  };
  var createObservables = function() {
    var _a;
    var networkObservable = new Observable(function(observer) {
      var callback = new NetworkEventCallback(function(event) {
        var eventWithProperties = addAdditionalEventProperties(event, "network");
        observer.next(eventWithProperties);
      });
      networkObserver.subscribe(callback, logger);
      return function() {
        networkObserver.unsubscribe(callback);
      };
    });
    return _a = {}, _a[ObservablesEnum.NetworkObservable] = networkObservable, _a;
  };
  var setup = function(config2, amplitude) {
    return __awaiter(void 0, void 0, void 0, function() {
      var allObservables, networkRequestSubscription;
      return __generator(this, function(_a) {
        if (typeof document === "undefined") {
          return [
            2
            /*return*/
          ];
        }
        allObservables = createObservables();
        networkRequestSubscription = trackNetworkEvents({
          allObservables,
          networkTrackingOptions: options,
          amplitude
        });
        subscriptions.push(networkRequestSubscription);
        logger = config2 === null || config2 === void 0 ? void 0 : config2.loggerProvider;
        logger === null || logger === void 0 ? void 0 : logger.log("".concat(name, " has been successfully added."));
        return [
          2
          /*return*/
        ];
      });
    });
  };
  var execute = function(event) {
    return __awaiter(void 0, void 0, void 0, function() {
      return __generator(this, function(_a) {
        return [2, event];
      });
    });
  };
  var teardown = function() {
    return __awaiter(void 0, void 0, void 0, function() {
      var subscriptions_1, subscriptions_1_1, subscription;
      var e_1, _a;
      return __generator(this, function(_b) {
        try {
          for (subscriptions_1 = __values$1(subscriptions), subscriptions_1_1 = subscriptions_1.next(); !subscriptions_1_1.done; subscriptions_1_1 = subscriptions_1.next()) {
            subscription = subscriptions_1_1.value;
            subscription.unsubscribe();
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (subscriptions_1_1 && !subscriptions_1_1.done && (_a = subscriptions_1.return)) _a.call(subscriptions_1);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
        return [
          2
          /*return*/
        ];
      });
    });
  };
  return {
    name,
    type,
    setup,
    execute,
    teardown
  };
};
var PLUGIN_NAME = "web-vitals-browser";
var WEB_VITALS_EVENT_NAME = "[Amplitude] Web Vitals";
let e = -1;
const t = (t2) => {
  addEventListener("pageshow", (n2) => {
    n2.persisted && (e = n2.timeStamp, t2(n2));
  }, true);
}, n = (e2, t2, n2, i2) => {
  let s2, o2;
  return (r2) => {
    t2.value >= 0 && (r2 || i2) && (o2 = t2.value - (s2 ?? 0), (o2 || void 0 === s2) && (s2 = t2.value, t2.delta = o2, t2.rating = ((e3, t3) => e3 > t3[1] ? "poor" : e3 > t3[0] ? "needs-improvement" : "good")(t2.value, n2), e2(t2)));
  };
}, i = (e2) => {
  requestAnimationFrame(() => requestAnimationFrame(() => e2()));
}, s = () => {
  const e2 = performance.getEntriesByType("navigation")[0];
  if (e2 && e2.responseStart > 0 && e2.responseStart < performance.now()) return e2;
}, o = () => {
  const e2 = s();
  return e2?.activationStart ?? 0;
}, r = (t2, n2 = -1) => {
  const i2 = s();
  let r2 = "navigate";
  e >= 0 ? r2 = "back-forward-cache" : i2 && (document.prerendering || o() > 0 ? r2 = "prerender" : document.wasDiscarded ? r2 = "restore" : i2.type && (r2 = i2.type.replace(/_/g, "-")));
  return { name: t2, value: n2, rating: "good", delta: 0, entries: [], id: `v5-${Date.now()}-${Math.floor(8999999999999 * Math.random()) + 1e12}`, navigationType: r2 };
}, c = /* @__PURE__ */ new WeakMap();
function a(e2, t2) {
  return c.get(e2) || c.set(e2, new t2()), c.get(e2);
}
class d {
  constructor() {
    __publicField(this, "t");
    __publicField(this, "i", 0);
    __publicField(this, "o", []);
  }
  h(e2) {
    if (e2.hadRecentInput) return;
    const t2 = this.o[0], n2 = this.o.at(-1);
    this.i && t2 && n2 && e2.startTime - n2.startTime < 1e3 && e2.startTime - t2.startTime < 5e3 ? (this.i += e2.value, this.o.push(e2)) : (this.i = e2.value, this.o = [e2]), this.t?.(e2);
  }
}
const h = (e2, t2, n2 = {}) => {
  try {
    if (PerformanceObserver.supportedEntryTypes.includes(e2)) {
      const i2 = new PerformanceObserver((e3) => {
        Promise.resolve().then(() => {
          t2(e3.getEntries());
        });
      });
      return i2.observe({ type: e2, buffered: true, ...n2 }), i2;
    }
  } catch {
  }
}, f = (e2) => {
  let t2 = false;
  return () => {
    t2 || (e2(), t2 = true);
  };
};
let u = -1;
const l = /* @__PURE__ */ new Set(), m = () => "hidden" !== document.visibilityState || document.prerendering ? 1 / 0 : 0, p = (e2) => {
  if ("hidden" === document.visibilityState) {
    if ("visibilitychange" === e2.type) for (const e3 of l) e3();
    isFinite(u) || (u = "visibilitychange" === e2.type ? e2.timeStamp : 0, removeEventListener("prerenderingchange", p, true));
  }
}, v = () => {
  if (u < 0) {
    const e2 = o(), n2 = document.prerendering ? void 0 : globalThis.performance.getEntriesByType("visibility-state").filter((t2) => "hidden" === t2.name && t2.startTime > e2)[0]?.startTime;
    u = n2 ?? m(), addEventListener("visibilitychange", p, true), addEventListener("prerenderingchange", p, true), t(() => {
      setTimeout(() => {
        u = m();
      });
    });
  }
  return { get firstHiddenTime() {
    return u;
  }, onHidden(e2) {
    l.add(e2);
  } };
}, g = (e2) => {
  document.prerendering ? addEventListener("prerenderingchange", () => e2(), true) : e2();
}, y = [1800, 3e3], E = (e2, s2 = {}) => {
  g(() => {
    const c2 = v();
    let a2, d2 = r("FCP");
    const f2 = h("paint", (e3) => {
      for (const t2 of e3) "first-contentful-paint" === t2.name && (f2.disconnect(), t2.startTime < c2.firstHiddenTime && (d2.value = Math.max(t2.startTime - o(), 0), d2.entries.push(t2), a2(true)));
    });
    f2 && (a2 = n(e2, d2, y, s2.reportAllChanges), t((t2) => {
      d2 = r("FCP"), a2 = n(e2, d2, y, s2.reportAllChanges), i(() => {
        d2.value = performance.now() - t2.timeStamp, a2(true);
      });
    }));
  });
}, b = [0.1, 0.25], L = (e2, s2 = {}) => {
  const o2 = v();
  E(f(() => {
    let c2, f2 = r("CLS", 0);
    const u2 = a(s2, d), l2 = (e3) => {
      for (const t2 of e3) u2.h(t2);
      u2.i > f2.value && (f2.value = u2.i, f2.entries = u2.o, c2());
    }, m2 = h("layout-shift", l2);
    m2 && (c2 = n(e2, f2, b, s2.reportAllChanges), o2.onHidden(() => {
      l2(m2.takeRecords()), c2(true);
    }), t(() => {
      u2.i = 0, f2 = r("CLS", 0), c2 = n(e2, f2, b, s2.reportAllChanges), i(() => c2());
    }), setTimeout(c2));
  }));
};
let P = 0, T = 1 / 0, _ = 0;
const M = (e2) => {
  for (const t2 of e2) t2.interactionId && (T = Math.min(T, t2.interactionId), _ = Math.max(_, t2.interactionId), P = _ ? (_ - T) / 7 + 1 : 0);
};
let w;
const C = () => w ? P : performance.interactionCount ?? 0, I = () => {
  "interactionCount" in performance || w || (w = h("event", M, { type: "event", buffered: true, durationThreshold: 0 }));
};
let F = 0;
class k {
  constructor() {
    __publicField(this, "u", []);
    __publicField(this, "l", /* @__PURE__ */ new Map());
    __publicField(this, "m");
    __publicField(this, "p");
  }
  v() {
    F = C(), this.u.length = 0, this.l.clear();
  }
  L() {
    const e2 = Math.min(this.u.length - 1, Math.floor((C() - F) / 50));
    return this.u[e2];
  }
  h(e2) {
    if (this.m?.(e2), !e2.interactionId && "first-input" !== e2.entryType) return;
    const t2 = this.u.at(-1);
    let n2 = this.l.get(e2.interactionId);
    if (n2 || this.u.length < 10 || e2.duration > t2.P) {
      if (n2 ? e2.duration > n2.P ? (n2.entries = [e2], n2.P = e2.duration) : e2.duration === n2.P && e2.startTime === n2.entries[0].startTime && n2.entries.push(e2) : (n2 = { id: e2.interactionId, entries: [e2], P: e2.duration }, this.l.set(n2.id, n2), this.u.push(n2)), this.u.sort((e3, t3) => t3.P - e3.P), this.u.length > 10) {
        const e3 = this.u.splice(10);
        for (const t3 of e3) this.l.delete(t3.id);
      }
      this.p?.(n2);
    }
  }
}
const A = (e2) => {
  const t2 = globalThis.requestIdleCallback || setTimeout;
  "hidden" === document.visibilityState ? e2() : (e2 = f(e2), addEventListener("visibilitychange", e2, { once: true, capture: true }), t2(() => {
    e2(), removeEventListener("visibilitychange", e2, { capture: true });
  }));
}, B = [200, 500], S = (e2, i2 = {}) => {
  if (!globalThis.PerformanceEventTiming || !("interactionId" in PerformanceEventTiming.prototype)) return;
  const s2 = v();
  g(() => {
    I();
    let o2, c2 = r("INP");
    const d2 = a(i2, k), f2 = (e3) => {
      A(() => {
        for (const t3 of e3) d2.h(t3);
        const t2 = d2.L();
        t2 && t2.P !== c2.value && (c2.value = t2.P, c2.entries = t2.entries, o2());
      });
    }, u2 = h("event", f2, { durationThreshold: i2.durationThreshold ?? 40 });
    o2 = n(e2, c2, B, i2.reportAllChanges), u2 && (u2.observe({ type: "first-input", buffered: true }), s2.onHidden(() => {
      f2(u2.takeRecords()), o2(true);
    }), t(() => {
      d2.v(), c2 = r("INP"), o2 = n(e2, c2, B, i2.reportAllChanges);
    }));
  });
};
class N {
  constructor() {
    __publicField(this, "m");
  }
  h(e2) {
    this.m?.(e2);
  }
}
const q = [2500, 4e3], x = (e2, s2 = {}) => {
  g(() => {
    const c2 = v();
    let d2, u2 = r("LCP");
    const l2 = a(s2, N), m2 = (e3) => {
      s2.reportAllChanges || (e3 = e3.slice(-1));
      for (const t2 of e3) l2.h(t2), t2.startTime < c2.firstHiddenTime && (u2.value = Math.max(t2.startTime - o(), 0), u2.entries = [t2], d2());
    }, p2 = h("largest-contentful-paint", m2);
    if (p2) {
      d2 = n(e2, u2, q, s2.reportAllChanges);
      const o2 = f(() => {
        m2(p2.takeRecords()), p2.disconnect(), d2(true);
      }), c3 = (e3) => {
        e3.isTrusted && (A(o2), removeEventListener(e3.type, c3, { capture: true }));
      };
      for (const e3 of ["keydown", "click", "visibilitychange"]) addEventListener(e3, c3, { capture: true });
      t((t2) => {
        u2 = r("LCP"), d2 = n(e2, u2, q, s2.reportAllChanges), i(() => {
          u2.value = performance.now() - t2.timeStamp, d2(true);
        });
      });
    }
  });
}, H = [800, 1800], O = (e2) => {
  document.prerendering ? g(() => O(e2)) : "complete" !== document.readyState ? addEventListener("load", () => O(e2), true) : setTimeout(e2);
}, $ = (e2, i2 = {}) => {
  let c2 = r("TTFB"), a2 = n(e2, c2, H, i2.reportAllChanges);
  O(() => {
    const d2 = s();
    d2 && (c2.value = Math.max(d2.responseStart - o(), 0), c2.entries = [d2], a2(true), t(() => {
      c2 = r("TTFB", 0), a2 = n(e2, c2, H, i2.reportAllChanges), a2(true);
    }));
  });
};
function getMetricStartTime(metric) {
  var _a;
  var startTime = ((_a = metric.entries[0]) === null || _a === void 0 ? void 0 : _a.startTime) || 0;
  return performance.timeOrigin + startTime;
}
function processMetric(metric) {
  return {
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
    id: metric.id,
    timestamp: Math.floor(getMetricStartTime(metric)),
    navigationStart: Math.floor(performance.timeOrigin)
  };
}
var webVitalsPlugin = function() {
  var visibilityListener = null;
  var globalScope = getGlobalScope$1();
  var doc = globalScope === null || globalScope === void 0 ? void 0 : globalScope.document;
  var location2 = globalScope === null || globalScope === void 0 ? void 0 : globalScope.location;
  var setup = function(config2, amplitude) {
    return __awaiter(void 0, void 0, void 0, function() {
      var getDecodeURI, locationHref, webVitalsPayload;
      return __generator(this, function(_a) {
        getDecodeURI = function(locationStr) {
          var _a2;
          if (!locationStr) {
            return "";
          }
          var decodedLocationStr = locationStr;
          try {
            decodedLocationStr = decodeURI(locationStr);
          } catch (e2) {
            (_a2 = config2.loggerProvider) === null || _a2 === void 0 ? void 0 : _a2.error("Malformed URI sequence: ", e2);
          }
          return decodedLocationStr;
        };
        if (doc === void 0) {
          return [
            2
            /*return*/
          ];
        }
        locationHref = getDecodeURI(
          /* istanbul ignore next */
          location2 === null || location2 === void 0 ? void 0 : location2.href
        );
        webVitalsPayload = {
          "[Amplitude] Page Domain": (
            /* istanbul ignore next */
            (location2 === null || location2 === void 0 ? void 0 : location2.hostname) || ""
          ),
          "[Amplitude] Page Location": locationHref,
          "[Amplitude] Page Path": getDecodeURI(
            /* istanbul ignore next */
            location2 === null || location2 === void 0 ? void 0 : location2.pathname
          ),
          "[Amplitude] Page Title": (
            /* istanbul ignore next */
            typeof document !== "undefined" && document.title || ""
          ),
          "[Amplitude] Page URL": locationHref.split("?")[0]
        };
        x(function(metric) {
          webVitalsPayload["[Amplitude] LCP"] = processMetric(metric);
        });
        E(function(metric) {
          webVitalsPayload["[Amplitude] FCP"] = processMetric(metric);
        });
        S(function(metric) {
          webVitalsPayload["[Amplitude] INP"] = processMetric(metric);
        });
        L(function(metric) {
          webVitalsPayload["[Amplitude] CLS"] = processMetric(metric);
        });
        $(function(metric) {
          webVitalsPayload["[Amplitude] TTFB"] = processMetric(metric);
        });
        visibilityListener = function() {
          if (doc.visibilityState === "hidden" && visibilityListener) {
            amplitude.track(WEB_VITALS_EVENT_NAME, webVitalsPayload);
            doc.removeEventListener("visibilitychange", visibilityListener);
            visibilityListener = null;
          }
        };
        doc.addEventListener("visibilitychange", visibilityListener);
        return [
          2
          /*return*/
        ];
      });
    });
  };
  var execute = function(event) {
    return __awaiter(void 0, void 0, void 0, function() {
      return __generator(this, function(_a) {
        return [2, event];
      });
    });
  };
  var teardown = function() {
    return __awaiter(void 0, void 0, void 0, function() {
      return __generator(this, function(_a) {
        if (visibilityListener) {
          doc === null || doc === void 0 ? void 0 : doc.removeEventListener("visibilitychange", visibilityListener);
        }
        return [
          2
          /*return*/
        ];
      });
    });
  };
  return {
    name: PLUGIN_NAME,
    type: "enrichment",
    setup,
    execute,
    teardown
  };
};
var domainWithoutSubdomain = function(domain) {
  var parts = domain.split(".");
  if (parts.length <= 2) {
    return domain;
  }
  return parts.slice(parts.length - 2, parts.length).join(".");
};
var isDirectTraffic = function(current) {
  return Object.values(current).every(function(value) {
    return !value;
  });
};
var isNewCampaign = function(current, previous, options, logger, isNewSession2) {
  if (isNewSession2 === void 0) {
    isNewSession2 = true;
  }
  var referring_domain = current.referring_domain, currentCampaign = __rest(current, ["referrer", "referring_domain"]);
  var _a = previous || {}, prevReferringDomain = _a.referring_domain, previousCampaign = __rest(_a, ["referrer", "referring_domain"]);
  if (isExcludedReferrer(options.excludeReferrers, current.referring_domain)) {
    logger.debug("This is not a new campaign because ".concat(current.referring_domain, " is in the exclude referrer list."));
    return false;
  }
  if (!isNewSession2 && isDirectTraffic(current) && previous) {
    logger.debug("This is not a new campaign because this is a direct traffic in the same session.");
    return false;
  }
  var hasNewCampaign = JSON.stringify(currentCampaign) !== JSON.stringify(previousCampaign);
  var hasNewDomain = domainWithoutSubdomain(referring_domain || "") !== domainWithoutSubdomain(prevReferringDomain || "");
  var result = !previous || hasNewCampaign || hasNewDomain;
  if (!result) {
    logger.debug("This is not a new campaign because it's the same as the previous one.");
  } else {
    logger.debug("This is a new campaign. An $identify event will be sent.");
  }
  return result;
};
var isExcludedReferrer = function(excludeReferrers, referringDomain) {
  if (excludeReferrers === void 0) {
    excludeReferrers = [];
  }
  if (referringDomain === void 0) {
    referringDomain = "";
  }
  return excludeReferrers.some(function(value) {
    return value instanceof RegExp ? value.test(referringDomain) : value === referringDomain;
  });
};
var createCampaignEvent = function(campaign, options) {
  var campaignParameters = __assign$1(__assign$1({}, BASE_CAMPAIGN$1), campaign);
  var identifyEvent = Object.entries(campaignParameters).reduce(function(identify2, _a) {
    var _b;
    var _c = __read$1(_a, 2), key = _c[0], value = _c[1];
    identify2.setOnce("initial_".concat(key), (_b = value !== null && value !== void 0 ? value : options.initialEmptyValue) !== null && _b !== void 0 ? _b : "EMPTY");
    if (value) {
      return identify2.set(key, value);
    }
    return identify2.unset(key);
  }, new Identify());
  return createIdentifyEvent(identifyEvent);
};
var getDefaultExcludedReferrers = function(cookieDomain) {
  var domain = cookieDomain;
  if (domain) {
    if (domain.startsWith(".")) {
      domain = domain.substring(1);
    }
    return [new RegExp("".concat(domain.replace(".", "\\."), "$"))];
  }
  return [];
};
var WebAttribution = (
  /** @class */
  function() {
    function WebAttribution2(options, config2) {
      var _a;
      this.shouldTrackNewCampaign = false;
      this.options = __assign$1({ initialEmptyValue: "EMPTY", resetSessionOnNewCampaign: false, excludeReferrers: getDefaultExcludedReferrers((_a = config2.cookieOptions) === null || _a === void 0 ? void 0 : _a.domain) }, options);
      this.storage = config2.cookieStorage;
      this.storageKey = getStorageKey(config2.apiKey, "MKTG");
      this.webExpStorageKey = getStorageKey(config2.apiKey, "MKTG_ORIGINAL");
      this.currentCampaign = BASE_CAMPAIGN$1;
      this.sessionTimeout = config2.sessionTimeout;
      this.lastEventTime = config2.lastEventTime;
      this.logger = config2.loggerProvider;
      config2.loggerProvider.log("Installing web attribution tracking.");
    }
    WebAttribution2.prototype.init = function() {
      return __awaiter(this, void 0, void 0, function() {
        var isEventInNewSession;
        var _a;
        return __generator(this, function(_b) {
          switch (_b.label) {
            case 0:
              return [4, this.fetchCampaign()];
            case 1:
              _a = __read$1.apply(void 0, [_b.sent(), 2]), this.currentCampaign = _a[0], this.previousCampaign = _a[1];
              isEventInNewSession = !this.lastEventTime ? true : isNewSession(this.sessionTimeout, this.lastEventTime);
              if (!isNewCampaign(this.currentCampaign, this.previousCampaign, this.options, this.logger, isEventInNewSession)) return [3, 3];
              this.shouldTrackNewCampaign = true;
              return [4, this.storage.set(this.storageKey, this.currentCampaign)];
            case 2:
              _b.sent();
              _b.label = 3;
            case 3:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    WebAttribution2.prototype.fetchCampaign = function() {
      return __awaiter(this, void 0, void 0, function() {
        var originalCampaign;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              return [4, this.storage.get(this.webExpStorageKey)];
            case 1:
              originalCampaign = _a.sent();
              if (!originalCampaign) return [3, 3];
              return [4, this.storage.remove(this.webExpStorageKey)];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3:
              return [4, Promise.all([originalCampaign || new CampaignParser$1().parse(), this.storage.get(this.storageKey)])];
            case 4:
              return [2, _a.sent()];
          }
        });
      });
    };
    WebAttribution2.prototype.generateCampaignEvent = function(event_id) {
      this.shouldTrackNewCampaign = false;
      var campaignEvent = createCampaignEvent(this.currentCampaign, this.options);
      if (event_id) {
        campaignEvent.event_id = event_id;
      }
      return campaignEvent;
    };
    WebAttribution2.prototype.shouldSetSessionIdOnNewCampaign = function() {
      return this.shouldTrackNewCampaign && !!this.options.resetSessionOnNewCampaign;
    };
    return WebAttribution2;
  }()
);
var AmplitudeBrowser = (
  /** @class */
  function(_super) {
    __extends(AmplitudeBrowser2, _super);
    function AmplitudeBrowser2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    AmplitudeBrowser2.prototype.init = function(apiKey, userIdOrOptions, maybeOptions) {
      if (apiKey === void 0) {
        apiKey = "";
      }
      var userId;
      var options;
      if (arguments.length > 2) {
        userId = userIdOrOptions;
        options = maybeOptions;
      } else {
        if (typeof userIdOrOptions === "string") {
          userId = userIdOrOptions;
          options = void 0;
        } else {
          userId = userIdOrOptions === null || userIdOrOptions === void 0 ? void 0 : userIdOrOptions.userId;
          options = userIdOrOptions;
        }
      }
      return returnWrapper(this._init(__assign$1(__assign$1({}, options), { userId, apiKey })));
    };
    AmplitudeBrowser2.prototype._init = function(options) {
      var _a, _b, _c;
      return __awaiter(this, void 0, void 0, function() {
        var browserOptions, attributionTrackingOptions, queryParams, ampTimestamp, isWithinTimeLimit, querySessionId, connector;
        var _this = this;
        return __generator(this, function(_d) {
          switch (_d.label) {
            case 0:
              if (this.initializing) {
                return [
                  2
                  /*return*/
                ];
              }
              this.initializing = true;
              return [4, useBrowserConfig(options.apiKey, options, this)];
            case 1:
              browserOptions = _d.sent();
              if (!browserOptions.fetchRemoteConfig) return [3, 3];
              this.remoteConfigClient = new RemoteConfigClient(browserOptions.apiKey, browserOptions.loggerProvider, browserOptions.serverZone);
              return [4, new Promise(function(resolve) {
                var _a2;
                (_a2 = _this.remoteConfigClient) === null || _a2 === void 0 ? void 0 : _a2.subscribe("configs.analyticsSDK.browserSDK", "all", function(remoteConfig, source, lastFetch) {
                  browserOptions.loggerProvider.debug("Remote configuration received:", JSON.stringify({
                    remoteConfig,
                    source,
                    lastFetch
                  }, null, 2));
                  if (remoteConfig) {
                    updateBrowserConfigWithRemoteConfig(remoteConfig, browserOptions);
                  }
                  resolve();
                });
              })];
            case 2:
              _d.sent();
              _d.label = 3;
            case 3:
              return [4, _super.prototype._init.call(this, browserOptions)];
            case 4:
              _d.sent();
              this.logBrowserOptions(browserOptions);
              if (!isAttributionTrackingEnabled(this.config.defaultTracking)) return [3, 6];
              attributionTrackingOptions = getAttributionTrackingConfig(this.config);
              this.webAttribution = new WebAttribution(attributionTrackingOptions, this.config);
              return [4, this.webAttribution.init()];
            case 5:
              _d.sent();
              _d.label = 6;
            case 6:
              queryParams = getQueryParams$1();
              ampTimestamp = queryParams.ampTimestamp ? Number(queryParams.ampTimestamp) : void 0;
              isWithinTimeLimit = ampTimestamp ? Date.now() < ampTimestamp : true;
              querySessionId = isWithinTimeLimit && !Number.isNaN(Number(queryParams.ampSessionId)) ? Number(queryParams.ampSessionId) : void 0;
              this.setSessionId((_c = (_b = (_a = options.sessionId) !== null && _a !== void 0 ? _a : querySessionId) !== null && _b !== void 0 ? _b : this.config.sessionId) !== null && _c !== void 0 ? _c : Date.now());
              connector = getAnalyticsConnector(options.instanceName);
              connector.identityStore.setIdentity({
                userId: this.config.userId,
                deviceId: this.config.deviceId
              });
              if (!(this.config.offline !== OfflineDisabled)) return [3, 8];
              return [4, this.add(networkConnectivityCheckerPlugin()).promise];
            case 7:
              _d.sent();
              _d.label = 8;
            case 8:
              return [4, this.add(new Destination()).promise];
            case 9:
              _d.sent();
              return [4, this.add(new Context()).promise];
            case 10:
              _d.sent();
              return [4, this.add(new IdentityEventSender()).promise];
            case 11:
              _d.sent();
              detNotify(this.config);
              if (!isFileDownloadTrackingEnabled(this.config.defaultTracking)) return [3, 13];
              this.config.loggerProvider.debug("Adding file download tracking plugin");
              return [4, this.add(fileDownloadTracking()).promise];
            case 12:
              _d.sent();
              _d.label = 13;
            case 13:
              if (!isFormInteractionTrackingEnabled(this.config.defaultTracking)) return [3, 15];
              this.config.loggerProvider.debug("Adding form interaction plugin");
              return [4, this.add(formInteractionTracking()).promise];
            case 14:
              _d.sent();
              _d.label = 15;
            case 15:
              if (!isPageViewTrackingEnabled(this.config.defaultTracking)) return [3, 17];
              this.config.loggerProvider.debug("Adding page view tracking plugin");
              return [4, this.add(pageViewTrackingPlugin(getPageViewTrackingConfig(this.config))).promise];
            case 16:
              _d.sent();
              _d.label = 17;
            case 17:
              if (!isElementInteractionsEnabled(this.config.autocapture)) return [3, 19];
              this.config.loggerProvider.debug("Adding user interactions plugin (autocapture plugin)");
              return [4, this.add(autocapturePlugin(getElementInteractionsConfig(this.config))).promise];
            case 18:
              _d.sent();
              _d.label = 19;
            case 19:
              if (!isFrustrationInteractionsEnabled(this.config.autocapture)) return [3, 21];
              this.config.loggerProvider.debug("Adding frustration interactions plugin");
              return [4, this.add(frustrationPlugin(getFrustrationInteractionsConfig(this.config))).promise];
            case 20:
              _d.sent();
              _d.label = 21;
            case 21:
              if (!isNetworkTrackingEnabled(this.config.autocapture)) return [3, 23];
              this.config.loggerProvider.debug("Adding network tracking plugin");
              return [4, this.add(networkCapturePlugin(getNetworkTrackingConfig(this.config))).promise];
            case 22:
              _d.sent();
              _d.label = 23;
            case 23:
              if (!isWebVitalsEnabled(this.config.autocapture)) return [3, 25];
              this.config.loggerProvider.debug("Adding web vitals plugin");
              return [4, this.add(webVitalsPlugin()).promise];
            case 24:
              _d.sent();
              _d.label = 25;
            case 25:
              this.initializing = false;
              return [4, this.runQueuedFunctions("dispatchQ")];
            case 26:
              _d.sent();
              connector.eventBridge.setEventReceiver(function(event) {
                void _this.track(event.eventType, event.eventProperties);
              });
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
    AmplitudeBrowser2.prototype.getUserId = function() {
      var _a;
      return (_a = this.config) === null || _a === void 0 ? void 0 : _a.userId;
    };
    AmplitudeBrowser2.prototype.setUserId = function(userId) {
      if (!this.config) {
        this.q.push(this.setUserId.bind(this, userId));
        return;
      }
      this.config.loggerProvider.debug("function setUserId: ", userId);
      if (userId !== this.config.userId || userId === void 0) {
        this.config.userId = userId;
        this.timeline.onIdentityChanged({ userId });
        setConnectorUserId(userId, this.config.instanceName);
      }
    };
    AmplitudeBrowser2.prototype.getDeviceId = function() {
      var _a;
      return (_a = this.config) === null || _a === void 0 ? void 0 : _a.deviceId;
    };
    AmplitudeBrowser2.prototype.setDeviceId = function(deviceId) {
      if (!this.config) {
        this.q.push(this.setDeviceId.bind(this, deviceId));
        return;
      }
      this.config.loggerProvider.debug("function setDeviceId: ", deviceId);
      if (deviceId !== this.config.deviceId) {
        this.config.deviceId = deviceId;
        this.timeline.onIdentityChanged({ deviceId });
        setConnectorDeviceId(deviceId, this.config.instanceName);
      }
    };
    AmplitudeBrowser2.prototype.reset = function() {
      this.setDeviceId(UUID());
      this.setUserId(void 0);
    };
    AmplitudeBrowser2.prototype.getIdentity = function() {
      var _a, _b;
      return {
        deviceId: (_a = this.config) === null || _a === void 0 ? void 0 : _a.deviceId,
        userId: (_b = this.config) === null || _b === void 0 ? void 0 : _b.userId,
        userProperties: this.userProperties
      };
    };
    AmplitudeBrowser2.prototype.getOptOut = function() {
      var _a;
      return (_a = this.config) === null || _a === void 0 ? void 0 : _a.optOut;
    };
    AmplitudeBrowser2.prototype.getSessionId = function() {
      var _a;
      return (_a = this.config) === null || _a === void 0 ? void 0 : _a.sessionId;
    };
    AmplitudeBrowser2.prototype.setSessionId = function(sessionId) {
      var _a;
      var promises = [];
      if (!this.config) {
        this.q.push(this.setSessionId.bind(this, sessionId));
        return returnWrapper(Promise.resolve());
      }
      if (sessionId === this.config.sessionId) {
        return returnWrapper(Promise.resolve());
      }
      this.config.loggerProvider.debug("function setSessionId: ", sessionId);
      var previousSessionId = this.getSessionId();
      if (previousSessionId !== sessionId) {
        this.timeline.onSessionIdChanged(sessionId);
      }
      var lastEventTime = this.config.lastEventTime;
      var lastEventId = (_a = this.config.lastEventId) !== null && _a !== void 0 ? _a : -1;
      this.config.sessionId = sessionId;
      this.config.lastEventTime = void 0;
      this.config.pageCounter = 0;
      if (isSessionTrackingEnabled(this.config.defaultTracking)) {
        if (previousSessionId && lastEventTime) {
          promises.push(this.track(DEFAULT_SESSION_END_EVENT, void 0, {
            device_id: this.previousSessionDeviceId,
            event_id: ++lastEventId,
            session_id: previousSessionId,
            time: lastEventTime + 1,
            user_id: this.previousSessionUserId
          }).promise);
        }
        this.config.lastEventTime = this.config.sessionId;
      }
      var isCampaignEventTracked = this.trackCampaignEventIfNeeded(++lastEventId, promises);
      if (isSessionTrackingEnabled(this.config.defaultTracking)) {
        promises.push(this.track(DEFAULT_SESSION_START_EVENT, void 0, {
          event_id: isCampaignEventTracked ? ++lastEventId : lastEventId,
          session_id: this.config.sessionId,
          time: this.config.lastEventTime
        }).promise);
      }
      this.previousSessionDeviceId = this.config.deviceId;
      this.previousSessionUserId = this.config.userId;
      return returnWrapper(Promise.all(promises));
    };
    AmplitudeBrowser2.prototype.extendSession = function() {
      if (!this.config) {
        this.q.push(this.extendSession.bind(this));
        return;
      }
      this.config.lastEventTime = Date.now();
    };
    AmplitudeBrowser2.prototype.setTransport = function(transport) {
      if (!this.config) {
        this.q.push(this.setTransport.bind(this, transport));
        return;
      }
      this.config.transportProvider = createTransport(transport);
    };
    AmplitudeBrowser2.prototype.identify = function(identify2, eventOptions) {
      if (isInstanceProxy(identify2)) {
        var queue = identify2._q;
        identify2._q = [];
        identify2 = convertProxyObjectToRealObject(new Identify(), queue);
      }
      if (eventOptions === null || eventOptions === void 0 ? void 0 : eventOptions.user_id) {
        this.setUserId(eventOptions.user_id);
      }
      if (eventOptions === null || eventOptions === void 0 ? void 0 : eventOptions.device_id) {
        this.setDeviceId(eventOptions.device_id);
      }
      return _super.prototype.identify.call(this, identify2, eventOptions);
    };
    AmplitudeBrowser2.prototype.groupIdentify = function(groupType, groupName, identify2, eventOptions) {
      if (isInstanceProxy(identify2)) {
        var queue = identify2._q;
        identify2._q = [];
        identify2 = convertProxyObjectToRealObject(new Identify(), queue);
      }
      return _super.prototype.groupIdentify.call(this, groupType, groupName, identify2, eventOptions);
    };
    AmplitudeBrowser2.prototype.revenue = function(revenue2, eventOptions) {
      if (isInstanceProxy(revenue2)) {
        var queue = revenue2._q;
        revenue2._q = [];
        revenue2 = convertProxyObjectToRealObject(new Revenue(), queue);
      }
      return _super.prototype.revenue.call(this, revenue2, eventOptions);
    };
    AmplitudeBrowser2.prototype.trackCampaignEventIfNeeded = function(lastEventId, promises) {
      if (!this.webAttribution || !this.webAttribution.shouldTrackNewCampaign) {
        return false;
      }
      var campaignEvent = this.webAttribution.generateCampaignEvent(lastEventId);
      if (promises) {
        promises.push(this.track(campaignEvent).promise);
      } else {
        this.track(campaignEvent);
      }
      this.config.loggerProvider.log("Tracking attribution.");
      return true;
    };
    AmplitudeBrowser2.prototype.process = function(event) {
      return __awaiter(this, void 0, void 0, function() {
        var currentTime, isEventInNewSession, shouldSetSessionIdOnNewCampaign;
        return __generator(this, function(_a) {
          currentTime = Date.now();
          isEventInNewSession = isNewSession(this.config.sessionTimeout, this.config.lastEventTime);
          shouldSetSessionIdOnNewCampaign = this.webAttribution && this.webAttribution.shouldSetSessionIdOnNewCampaign();
          if (event.event_type !== DEFAULT_SESSION_START_EVENT && event.event_type !== DEFAULT_SESSION_END_EVENT && (!event.session_id || event.session_id === this.getSessionId())) {
            if (isEventInNewSession || shouldSetSessionIdOnNewCampaign) {
              this.setSessionId(currentTime);
              if (shouldSetSessionIdOnNewCampaign) {
                this.config.loggerProvider.log("Created a new session for new campaign.");
              }
            } else if (!isEventInNewSession) {
              this.trackCampaignEventIfNeeded();
            }
          }
          if (event.event_type === SpecialEventType$1.IDENTIFY && event.user_properties) {
            this.userProperties = this.getOperationAppliedUserProperties(event.user_properties);
          }
          return [2, _super.prototype.process.call(this, event)];
        });
      });
    };
    AmplitudeBrowser2.prototype.logBrowserOptions = function(browserConfig) {
      try {
        var browserConfigCopy = __assign$1(__assign$1({}, browserConfig), { apiKey: browserConfig.apiKey.substring(0, 10) + "********" });
        this.config.loggerProvider.debug("Initialized Amplitude with BrowserConfig:", JSON.stringify(browserConfigCopy));
      } catch (e2) {
        this.config.loggerProvider.error("Error logging browser config", e2);
      }
    };
    return AmplitudeBrowser2;
  }(AmplitudeCore)
);
var createInstance = function() {
  var client2 = new AmplitudeBrowser();
  return {
    init: debugWrapper(client2.init.bind(client2), "init", getClientLogConfig(client2), getClientStates(client2, ["config"])),
    add: debugWrapper(client2.add.bind(client2), "add", getClientLogConfig(client2), getClientStates(client2, ["config.apiKey", "timeline.plugins"])),
    remove: debugWrapper(client2.remove.bind(client2), "remove", getClientLogConfig(client2), getClientStates(client2, ["config.apiKey", "timeline.plugins"])),
    track: debugWrapper(client2.track.bind(client2), "track", getClientLogConfig(client2), getClientStates(client2, ["config.apiKey", "timeline.queue.length"])),
    logEvent: debugWrapper(client2.logEvent.bind(client2), "logEvent", getClientLogConfig(client2), getClientStates(client2, ["config.apiKey", "timeline.queue.length"])),
    identify: debugWrapper(client2.identify.bind(client2), "identify", getClientLogConfig(client2), getClientStates(client2, ["config.apiKey", "timeline.queue.length"])),
    groupIdentify: debugWrapper(client2.groupIdentify.bind(client2), "groupIdentify", getClientLogConfig(client2), getClientStates(client2, ["config.apiKey", "timeline.queue.length"])),
    setGroup: debugWrapper(client2.setGroup.bind(client2), "setGroup", getClientLogConfig(client2), getClientStates(client2, ["config.apiKey", "timeline.queue.length"])),
    revenue: debugWrapper(client2.revenue.bind(client2), "revenue", getClientLogConfig(client2), getClientStates(client2, ["config.apiKey", "timeline.queue.length"])),
    flush: debugWrapper(client2.flush.bind(client2), "flush", getClientLogConfig(client2), getClientStates(client2, ["config.apiKey", "timeline.queue.length"])),
    getUserId: debugWrapper(client2.getUserId.bind(client2), "getUserId", getClientLogConfig(client2), getClientStates(client2, ["config", "config.userId"])),
    setUserId: debugWrapper(client2.setUserId.bind(client2), "setUserId", getClientLogConfig(client2), getClientStates(client2, ["config", "config.userId"])),
    getDeviceId: debugWrapper(client2.getDeviceId.bind(client2), "getDeviceId", getClientLogConfig(client2), getClientStates(client2, ["config", "config.deviceId"])),
    setDeviceId: debugWrapper(client2.setDeviceId.bind(client2), "setDeviceId", getClientLogConfig(client2), getClientStates(client2, ["config", "config.deviceId"])),
    reset: debugWrapper(client2.reset.bind(client2), "reset", getClientLogConfig(client2), getClientStates(client2, ["config", "config.userId", "config.deviceId"])),
    getSessionId: debugWrapper(client2.getSessionId.bind(client2), "getSessionId", getClientLogConfig(client2), getClientStates(client2, ["config"])),
    setSessionId: debugWrapper(client2.setSessionId.bind(client2), "setSessionId", getClientLogConfig(client2), getClientStates(client2, ["config"])),
    extendSession: debugWrapper(client2.extendSession.bind(client2), "extendSession", getClientLogConfig(client2), getClientStates(client2, ["config"])),
    setOptOut: debugWrapper(client2.setOptOut.bind(client2), "setOptOut", getClientLogConfig(client2), getClientStates(client2, ["config"])),
    setTransport: debugWrapper(client2.setTransport.bind(client2), "setTransport", getClientLogConfig(client2), getClientStates(client2, ["config"])),
    getIdentity: debugWrapper(client2.getIdentity.bind(client2), "getIdentity", getClientLogConfig(client2), getClientStates(client2, ["config"])),
    getOptOut: debugWrapper(client2.getOptOut.bind(client2), "getOptOut", getClientLogConfig(client2), getClientStates(client2, ["config"]))
  };
};
const client = createInstance();
const types = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  DEFAULT_ACTION_CLICK_ALLOWLIST,
  DEFAULT_CSS_SELECTOR_ALLOWLIST,
  DEFAULT_DATA_ATTRIBUTE_PREFIX,
  get IdentifyOperation() {
    return IdentifyOperation$2;
  },
  get LogLevel() {
    return LogLevel;
  },
  OfflineDisabled,
  get RevenueProperty() {
    return RevenueProperty$1;
  },
  get ServerZone() {
    return ServerZone$1;
  },
  get SpecialEventType() {
    return SpecialEventType$1;
  }
});
var add = client.add, extendSession = client.extendSession, flush = client.flush, getDeviceId = client.getDeviceId, getIdentity = client.getIdentity, getOptOut = client.getOptOut, getSessionId = client.getSessionId, getUserId = client.getUserId, groupIdentify = client.groupIdentify, identify = client.identify, init = client.init, logEvent = client.logEvent, remove = client.remove, reset = client.reset, revenue = client.revenue, setDeviceId = client.setDeviceId, setGroup = client.setGroup, setOptOut = client.setOptOut, setSessionId = client.setSessionId, setTransport = client.setTransport, setUserId = client.setUserId, track = client.track;
const index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  AmplitudeBrowser,
  Identify,
  Revenue,
  Types: types,
  add,
  createInstance,
  extendSession,
  flush,
  getDeviceId,
  getIdentity,
  getOptOut,
  getSessionId,
  getUserId,
  groupIdentify,
  identify,
  init,
  logEvent,
  remove,
  reset,
  revenue,
  runQueuedFunctions,
  setDeviceId,
  setGroup,
  setOptOut,
  setSessionId,
  setTransport,
  setUserId,
  track
});
const min = Math.min;
const max = Math.max;
const round = Math.round;
const createCoords = (v2) => ({
  x: v2,
  y: v2
});
const oppositeSideMap = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
const oppositeAlignmentMap = {
  start: "end",
  end: "start"
};
function clamp(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
  return placement.split("-")[0];
}
function getAlignment(placement) {
  return placement.split("-")[1];
}
function getOppositeAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
  return axis === "y" ? "height" : "width";
}
const yAxisSides = /* @__PURE__ */ new Set(["top", "bottom"]);
function getSideAxis(placement) {
  return yAxisSides.has(getSide(placement)) ? "y" : "x";
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.replace(/start|end/g, (alignment) => oppositeAlignmentMap[alignment]);
}
const lrPlacement = ["left", "right"];
const rlPlacement = ["right", "left"];
const tbPlacement = ["top", "bottom"];
const btPlacement = ["bottom", "top"];
function getSideList(side, isStart, rtl) {
  switch (side) {
    case "top":
    case "bottom":
      if (rtl) return isStart ? rlPlacement : lrPlacement;
      return isStart ? lrPlacement : rlPlacement;
    case "left":
    case "right":
      return isStart ? tbPlacement : btPlacement;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === "start", rtl);
  if (alignment) {
    list = list.map((side) => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, (side) => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== "number" ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x: x2,
    y: y2,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y2,
    left: x2,
    right: x2 + width,
    bottom: y2 + height,
    x: x2,
    y: y2
  };
}
function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === "y";
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case "top":
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case "bottom":
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case "right":
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case "left":
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case "start":
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case "end":
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}
const computePosition$1 = async (reference, floating, config2) => {
  const {
    placement = "bottom",
    strategy = "absolute",
    middleware = [],
    platform: platform2
  } = config2;
  const validMiddleware = middleware.filter(Boolean);
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
  let rects = await platform2.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x: x2,
    y: y2
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let middlewareData = {};
  let resetCount = 0;
  for (let i2 = 0; i2 < validMiddleware.length; i2++) {
    const {
      name,
      fn
    } = validMiddleware[i2];
    const {
      x: nextX,
      y: nextY,
      data,
      reset: reset2
    } = await fn({
      x: x2,
      y: y2,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform: platform2,
      elements: {
        reference,
        floating
      }
    });
    x2 = nextX != null ? nextX : x2;
    y2 = nextY != null ? nextY : y2;
    middlewareData = {
      ...middlewareData,
      [name]: {
        ...middlewareData[name],
        ...data
      }
    };
    if (reset2 && resetCount <= 50) {
      resetCount++;
      if (typeof reset2 === "object") {
        if (reset2.placement) {
          statefulPlacement = reset2.placement;
        }
        if (reset2.rects) {
          rects = reset2.rects === true ? await platform2.getElementRects({
            reference,
            floating,
            strategy
          }) : reset2.rects;
        }
        ({
          x: x2,
          y: y2
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i2 = -1;
    }
  }
  return {
    x: x2,
    y: y2,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x: x2,
    y: y2,
    platform: platform2,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = "clippingAncestors",
    rootBoundary = "viewport",
    elementContext = "floating",
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === "floating" ? "reference" : "floating";
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
    element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === "floating" ? {
    x: x2,
    y: y2,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
  const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) ? await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements,
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}
const arrow$1 = (options) => ({
  name: "arrow",
  options,
  async fn(state) {
    const {
      x: x2,
      y: y2,
      placement,
      rects,
      platform: platform2,
      elements,
      middlewareData
    } = state;
    const {
      element,
      padding = 0
    } = evaluate(options, state) || {};
    if (element == null) {
      return {};
    }
    const paddingObject = getPaddingObject(padding);
    const coords = {
      x: x2,
      y: y2
    };
    const axis = getAlignmentAxis(placement);
    const length = getAxisLength(axis);
    const arrowDimensions = await platform2.getDimensions(element);
    const isYAxis = axis === "y";
    const minProp = isYAxis ? "top" : "left";
    const maxProp = isYAxis ? "bottom" : "right";
    const clientProp = isYAxis ? "clientHeight" : "clientWidth";
    const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
    const startDiff = coords[axis] - rects.reference[axis];
    const arrowOffsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(element));
    let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;
    if (!clientSize || !await (platform2.isElement == null ? void 0 : platform2.isElement(arrowOffsetParent))) {
      clientSize = elements.floating[clientProp] || rects.floating[length];
    }
    const centerToReference = endDiff / 2 - startDiff / 2;
    const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
    const minPadding = min(paddingObject[minProp], largestPossiblePadding);
    const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);
    const min$1 = minPadding;
    const max2 = clientSize - arrowDimensions[length] - maxPadding;
    const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
    const offset2 = clamp(min$1, center, max2);
    const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset2 && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
    const alignmentOffset = shouldAddOffset ? center < min$1 ? center - min$1 : center - max2 : 0;
    return {
      [axis]: coords[axis] + alignmentOffset,
      data: {
        [axis]: offset2,
        centerOffset: center - offset2 - alignmentOffset,
        ...shouldAddOffset && {
          alignmentOffset
        }
      },
      reset: shouldAddOffset
    };
  }
});
const flip$1 = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "flip",
    options,
    async fn(state) {
      var _middlewareData$arrow, _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform: platform2,
        elements
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = "bestFit",
        fallbackAxisSideDirection = "none",
        flipAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const initialSideAxis = getSideAxis(initialPlacement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
      const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
      if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements = [initialPlacement, ...fallbackPlacements];
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides = getAlignmentSides(placement, rects, rtl);
        overflows.push(overflow[sides[0]], overflow[sides[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows
      }];
      if (!overflows.every((side2) => side2 <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements[nextIndex];
        if (nextPlacement) {
          const ignoreCrossAxisOverflow = checkCrossAxis === "alignment" ? initialSideAxis !== getSideAxis(nextPlacement) : false;
          if (!ignoreCrossAxisOverflow || // We leave the current main axis only if every placement on that axis
          // overflows the main axis.
          overflowsData.every((d2) => getSideAxis(d2.placement) === initialSideAxis ? d2.overflows[0] > 0 : true)) {
            return {
              data: {
                index: nextIndex,
                overflows: overflowsData
              },
              reset: {
                placement: nextPlacement
              }
            };
          }
        }
        let resetPlacement = (_overflowsData$filter = overflowsData.filter((d2) => d2.overflows[0] <= 0).sort((a2, b2) => a2.overflows[1] - b2.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case "bestFit": {
              var _overflowsData$filter2;
              const placement2 = (_overflowsData$filter2 = overflowsData.filter((d2) => {
                if (hasFallbackAxisSideDirection) {
                  const currentSideAxis = getSideAxis(d2.placement);
                  return currentSideAxis === initialSideAxis || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  currentSideAxis === "y";
                }
                return true;
              }).map((d2) => [d2.placement, d2.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)]).sort((a2, b2) => a2[1] - b2[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
              if (placement2) {
                resetPlacement = placement2;
              }
              break;
            }
            case "initialPlacement":
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};
const originSides = /* @__PURE__ */ new Set(["left", "top"]);
async function convertValueToCoords(state, options) {
  const {
    placement,
    platform: platform2,
    elements
  } = state;
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === "y";
  const mainAxisMulti = originSides.has(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === "number" ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: rawValue.mainAxis || 0,
    crossAxis: rawValue.crossAxis || 0,
    alignmentAxis: rawValue.alignmentAxis
  };
  if (alignment && typeof alignmentAxis === "number") {
    crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}
const offset$1 = function(options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: "offset",
    options,
    async fn(state) {
      var _middlewareData$offse, _middlewareData$arrow;
      const {
        x: x2,
        y: y2,
        placement,
        middlewareData
      } = state;
      const diffCoords = await convertValueToCoords(state, options);
      if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      return {
        x: x2 + diffCoords.x,
        y: y2 + diffCoords.y,
        data: {
          ...diffCoords,
          placement
        }
      };
    }
  };
};
const shift$1 = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "shift",
    options,
    async fn(state) {
      const {
        x: x2,
        y: y2,
        placement
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = false,
        limiter = {
          fn: (_ref) => {
            let {
              x: x3,
              y: y3
            } = _ref;
            return {
              x: x3,
              y: y3
            };
          }
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const coords = {
        x: x2,
        y: y2
      };
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const crossAxis = getSideAxis(getSide(placement));
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      if (checkMainAxis) {
        const minSide = mainAxis === "y" ? "top" : "left";
        const maxSide = mainAxis === "y" ? "bottom" : "right";
        const min2 = mainAxisCoord + overflow[minSide];
        const max2 = mainAxisCoord - overflow[maxSide];
        mainAxisCoord = clamp(min2, mainAxisCoord, max2);
      }
      if (checkCrossAxis) {
        const minSide = crossAxis === "y" ? "top" : "left";
        const maxSide = crossAxis === "y" ? "bottom" : "right";
        const min2 = crossAxisCoord + overflow[minSide];
        const max2 = crossAxisCoord - overflow[maxSide];
        crossAxisCoord = clamp(min2, crossAxisCoord, max2);
      }
      const limitedCoords = limiter.fn({
        ...state,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x2,
          y: limitedCoords.y - y2,
          enabled: {
            [mainAxis]: checkMainAxis,
            [crossAxis]: checkCrossAxis
          }
        }
      };
    }
  };
};
function hasWindow() {
  return typeof window !== "undefined";
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
const invalidOverflowDisplayValues = /* @__PURE__ */ new Set(["inline", "contents"]);
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !invalidOverflowDisplayValues.has(display);
}
const tableElements = /* @__PURE__ */ new Set(["table", "td", "th"]);
function isTableElement(element) {
  return tableElements.has(getNodeName(element));
}
const topLayerSelectors = [":popover-open", ":modal"];
function isTopLayer(element) {
  return topLayerSelectors.some((selector) => {
    try {
      return element.matches(selector);
    } catch (_e) {
      return false;
    }
  });
}
const transformProperties = ["transform", "translate", "scale", "rotate", "perspective"];
const willChangeValues = ["transform", "translate", "scale", "rotate", "perspective", "filter"];
const containValues = ["paint", "layout", "strict", "content"];
function isContainingBlock(elementOrCss) {
  const webkit = isWebKit();
  const css = isElement(elementOrCss) ? getComputedStyle(elementOrCss) : elementOrCss;
  return transformProperties.some((value) => css[value] ? css[value] !== "none" : false) || (css.containerType ? css.containerType !== "normal" : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== "none" : false) || !webkit && (css.filter ? css.filter !== "none" : false) || willChangeValues.some((value) => (css.willChange || "").includes(value)) || containValues.some((value) => (css.contain || "").includes(value));
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode(currentNode);
  }
  return null;
}
function isWebKit() {
  if (typeof CSS === "undefined" || !CSS.supports) return false;
  return CSS.supports("-webkit-backdrop-filter", "none");
}
const lastTraversableNodeNames = /* @__PURE__ */ new Set(["html", "body", "#document"]);
function isLastTraversableNode(node) {
  return lastTraversableNodeNames.has(getNodeName(node));
}
function getComputedStyle(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.scrollX,
    scrollTop: element.scrollY
  };
}
function getParentNode(node) {
  if (getNodeName(node) === "html") {
    return node;
  }
  const result = (
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot || // DOM Element detected.
    node.parentNode || // ShadowRoot detected.
    isShadowRoot(node) && node.host || // Fallback.
    getDocumentElement(node)
  );
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, []));
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}
function getCssDimensions(element) {
  const css = getComputedStyle(element);
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}
function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}
function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $: $2
  } = getCssDimensions(domElement);
  let x2 = ($2 ? round(rect.width) : rect.width) / width;
  let y2 = ($2 ? round(rect.height) : rect.height) / height;
  if (!x2 || !Number.isFinite(x2)) {
    x2 = 1;
  }
  if (!y2 || !Number.isFinite(y2)) {
    y2 = 1;
  }
  return {
    x: x2,
    y: y2
  };
}
const noOffsets = /* @__PURE__ */ createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
    return false;
  }
  return isFixed;
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x2 = (clientRect.left + visualOffsets.x) / scale.x;
  let y2 = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetParent && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x2 *= iframeScale.x;
      y2 *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x2 += left;
      y2 += top;
      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x: x2,
    y: y2
  });
}
function getWindowScrollBarX(element, rect) {
  const leftScroll = getNodeScroll(element).scrollLeft;
  if (!rect) {
    return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
  }
  return rect.left + leftScroll;
}
function getHTMLOffset(documentElement, scroll, ignoreScrollbarX) {
  if (ignoreScrollbarX === void 0) {
    ignoreScrollbarX = false;
  }
  const htmlRect = documentElement.getBoundingClientRect();
  const x2 = htmlRect.left + scroll.scrollLeft - (ignoreScrollbarX ? 0 : (
    // RTL <body> scrollbar.
    getWindowScrollBarX(documentElement, htmlRect)
  ));
  const y2 = htmlRect.top + scroll.scrollTop;
  return {
    x: x2,
    y: y2
  };
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    elements,
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isFixed = strategy === "fixed";
  const documentElement = getDocumentElement(offsetParent);
  const topLayer = elements ? isTopLayer(elements.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll, true) : createCoords(0);
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
  };
}
function getClientRects(element) {
  return Array.from(element.getClientRects());
}
function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const scroll = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x2 = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y2 = -scroll.scrollTop;
  if (getComputedStyle(body).direction === "rtl") {
    x2 += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x: x2,
    y: y2
  };
}
function getViewportRect(element, strategy) {
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x2 = 0;
  let y2 = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
      x2 = visualViewport.offsetLeft;
      y2 = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x: x2,
    y: y2
  };
}
const absoluteOrFixed = /* @__PURE__ */ new Set(["absolute", "fixed"]);
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x2 = left * scale.x;
  const y2 = top * scale.y;
  return {
    width,
    height,
    x: x2,
    y: y2
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === "viewport") {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === "document") {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y,
      width: clippingAncestor.width,
      height: clippingAncestor.height
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = getParentNode(element);
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
}
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, []).filter((el) => isElement(el) && getNodeName(el) !== "body");
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle(element).position === "fixed";
  let currentNode = elementIsFixed ? getParentNode(element) : element;
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === "fixed") {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && absoluteOrFixed.has(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      result = result.filter((ancestor) => ancestor !== currentNode);
    } else {
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstClippingAncestor = clippingAncestors[0];
  const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
  return {
    width: clippingRect.right - clippingRect.left,
    height: clippingRect.bottom - clippingRect.top,
    x: clippingRect.left,
    y: clippingRect.top
  };
}
function getDimensions(element) {
  const {
    width,
    height
  } = getCssDimensions(element);
  return {
    width,
    height
  };
}
function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === "fixed";
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);
  function setLeftRTLScrollbarOffset() {
    offsets.x = getWindowScrollBarX(documentElement);
  }
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      setLeftRTLScrollbarOffset();
    }
  }
  if (isFixed && !isOffsetParentAnElement && documentElement) {
    setLeftRTLScrollbarOffset();
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  const x2 = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
  const y2 = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
  return {
    x: x2,
    y: y2,
    width: rect.width,
    height: rect.height
  };
}
function isStaticPositioned(element) {
  return getComputedStyle(element).position === "static";
}
function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle(element).position === "fixed") {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  let rawOffsetParent = element.offsetParent;
  if (getDocumentElement(element) === rawOffsetParent) {
    rawOffsetParent = rawOffsetParent.ownerDocument.body;
  }
  return rawOffsetParent;
}
function getOffsetParent(element, polyfill) {
  const win = getWindow(element);
  if (isTopLayer(element)) {
    return win;
  }
  if (!isHTMLElement(element)) {
    let svgOffsetParent = getParentNode(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode(svgOffsetParent);
    }
    return win;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
    return win;
  }
  return offsetParent || getContainingBlock(element) || win;
}
const getElementRects = async function(data) {
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  const floatingDimensions = await getDimensionsFn(data.floating);
  return {
    reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
    floating: {
      x: 0,
      y: 0,
      width: floatingDimensions.width,
      height: floatingDimensions.height
    }
  };
};
function isRTL(element) {
  return getComputedStyle(element).direction === "rtl";
}
const platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement,
  isRTL
};
const offset = offset$1;
const shift = shift$1;
const flip = flip$1;
const arrow = arrow$1;
const computePosition = (reference, floating, options) => {
  const cache = /* @__PURE__ */ new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition$1(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};
export {
  computePosition as a,
  shift as b,
  create as c,
  devtools as d,
  arrow as e,
  flip as f,
  index as i,
  offset as o,
  persist as p,
  subscribeWithSelector as s
};
