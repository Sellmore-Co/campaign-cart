var e, t, r = {
    216: function(e, t, r) {
        r.d(t, {
            S: () => n,
            x: () => a
        });
        let a = ["dl_add_contact_info", "dl_add_payment_info", "dl_add_shipping_info", "dl_add_to_cart", "dl_begin_checkout", "dl_login", "dl_purchase", "dl_remove_from_cart", "dl_select_item", "dl_sign_up", "dl_subscribe", "dl_user_data", "dl_view_cart", "dl_view_item", "dl_view_item_list", "dl_view_search_results"]
          , n = ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage", "functionality_storage", "personalization_storage", "security_storage"]
    },
    884: function(e, t, r) {
        r.d(t, {
            $F: () => n,
            E6: () => i,
            Gj: () => a
        });
        let a = e => new Promise(t => setTimeout(t, e))
          , n = e => Object.keys(e)
          , i = e => Object.fromEntries(e)
    },
    546: function(e, t, r) {
        r.d(t, {
            YI: () => p,
            rB: () => v,
            s2: () => g
        });
        var a = r(364)
          , n = r(61)
          , i = r(704)
          , o = r(648);
        let c = [["userId", null], ["sessionId", null], ["sessionCount", null], ["lastDlPushTimestamp", null], ["params", null], ["cookies", null], ["debug", null]]
          , s = async ({cookie: e, setLocalStorage: t}) => {
            await Promise.all(( () => {
                if (!e)
                    return c;
                try {
                    let t = JSON.parse(e);
                    if (Array.isArray(t))
                        return c.map( ([e]) => {
                            let r = t.find(t => Array.isArray(t) && e === t[0] && ("string" == typeof t[1] || null === t[1])) ?? null;
                            return [e, r ? r[1] : null]
                        }
                        );
                    return c
                } catch (e) {
                    return (0,
                    i.k)("UNEXPECTED", [e]),
                    c
                }
            }
            )().map( ([e,r]) => null !== r ? t(e, r) : Promise.resolve()))
        }
          , d = e => {
            switch (e) {
            case "ad_storage":
                return 1;
            case "ad_user_data":
                return 2;
            case "ad_personalization":
                return 3;
            case "analytics_storage":
                return 4;
            case "functionality_storage":
                return 5;
            case "personalization_storage":
                return 6;
            case "security_storage":
                return 7;
            default:
                return e
            }
        }
          , l = e => {
            switch (e) {
            case 1:
                return "ad_storage";
            case 2:
                return "ad_user_data";
            case 3:
                return "ad_personalization";
            case 4:
                return "analytics_storage";
            case 5:
                return "functionality_storage";
            case 6:
                return "personalization_storage";
            case 7:
                return "security_storage";
            default:
                return e
            }
        }
          , u = e => {
            switch (e) {
            case !1:
                return 0;
            case !0:
                return 1;
            case void 0:
                return -1
            }
        }
          , m = e => {
            switch (e) {
            case 0:
                return !1;
            case 1:
                return !0;
            case -1:
                return
            }
        }
          , _ = async ({cookie: e, setLocalStorage: t}) => {
            try {
                let r = JSON.parse(e)
                  , [a] = r;
                if (1 === a) {
                    let[e,a,n,i,o,c,s,d,u] = r
                      , _ = {
                        ...c,
                        ...0 === s.length ? {} : {
                            consent_v2: Object.fromEntries(s.map( ([e,t,r]) => {
                                let a = m(t)
                                  , n = m(r);
                                return [l(e), {
                                    ...void 0 !== a ? {
                                        default: a
                                    } : {},
                                    ...void 0 !== n ? {
                                        update: n
                                    } : {}
                                }]
                            }
                            ))
                        },
                        ...a ? {
                            user_id: a
                        } : {},
                        ...n ? {
                            session_id: n
                        } : {},
                        ...i ? {
                            session_count: i
                        } : {}
                    }
                      , p = (e, r) => {
                        if (r)
                            return t(e, r)
                    }
                    ;
                    await Promise.all([p("userId", a), p("sessionId", n), p("sessionCount", i), p("lastDlPushTimestamp", o), t("params", JSON.stringify(_)), p("cookies", d), p("debug", 1 === u ? "true" : null)])
                }
            } catch (e) {
                (0,
                i.k)("UNEXPECTED", [e])
            }
        }
          , p = async ({getCookie: e, setLocalStorage: t}) => {
            let r = await e(o.VE.modern);
            if (r)
                await _({
                    cookie: r,
                    setLocalStorage: t
                });
            else {
                let r = await e(o.VE.legacy);
                await s({
                    cookie: r,
                    setLocalStorage: t
                })
            }
        }
          , g = async ({apexDomain: e, setCookie: t, removeCookie: r, getLocalStorage: i}) => {
            if (null !== e) {
                let c = async () => {
                    let e = {
                        partialParams: null,
                        packedConsent: []
                    }
                      , t = await i("params");
                    if (null === t)
                        return e;
                    let r = JSON.parse(t);
                    if (!(0,
                    a.a)(r))
                        return e;
                    let o = (0,
                    n.a)(r, ["user_id", "session_id", "session_count", "consent_v2"])
                      , c = r.consent_v2;
                    return (0,
                    a.a)(c) ? {
                        partialParams: o,
                        packedConsent: Object.entries(c).map( ([e,t]) => [d(e), u(t.default), u(t.update)])
                    } : {
                        ...e,
                        partialParams: o
                    }
                }
                  , s = async () => +("true" === await i("debug"))
                  , {partialParams: l, packedConsent: m} = await c()
                  , _ = [1, await i("userId"), await i("sessionId"), await i("sessionCount"), await i("lastDlPushTimestamp"), l, m, await i("cookies"), await s()];
                await r(o.VE.legacy, {
                    domain: e,
                    secure: !0,
                    sameSite: "strict"
                }),
                await t(o.VE.modern, JSON.stringify(_), {
                    domain: e,
                    expires: 365,
                    secure: !0,
                    sameSite: "strict"
                })
            }
        }
          , v = ({apexDomains: e, location: t}) => e.find(e => t.hostname.endsWith(e)) ?? null
    },
    743: function(e, t, r) {
        r.d(t, {
            W: () => o,
            x: () => c
        });
        var a = r(721)
          , n = r(459);
        let i = async () => ({
            user_properties: {
                user_id: await (0,
                a.n5)()
            },
            device: {
                screen_resolution: `${window.screen.width}x${window.screen.height}`,
                viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                encoding: document.characterSet,
                language: navigator.language,
                colors: `${screen.colorDepth}-bit`
            },
            page: {
                title: document.title,
                raw_referrer: document.referrer
            },
            marketing: {
                ...(0,
                a.$1)(),
                ...(0,
                a.Qf)()
            },
            _elevar_internal: {
                isElevarContextPush: !0
            }
        })
          , o = async () => {
            let e = await i();
            (0,
            n.y)(e),
            "function" == typeof window.ElevarContextFn && window.ElevarContextFn(e)
        }
          , c = e => "_elevar_internal"in e && "object" == typeof e._elevar_internal && "isElevarContextPush"in e._elevar_internal && !0 === e._elevar_internal.isElevarContextPush
    },
    721: function(e, t, r) {
        r.d(t, {
            $1: () => S,
            EU: () => v,
            Ee: () => h,
            PX: () => C,
            Qf: () => x,
            RV: () => I,
            U6: () => f,
            Wx: () => E,
            YI: () => l,
            dv: () => b,
            ew: () => T,
            j: () => y,
            lE: () => O,
            n5: () => p,
            s2: () => u,
            v4: () => A,
            v7: () => w,
            zK: () => m
        });
        var a = r(444)
          , n = r(563)
          , i = r(546)
          , o = r(704)
          , c = r(648);
        let s = e => {
            try {
                switch (e.action) {
                case "GET":
                    return localStorage.getItem(c.hT[e.key]);
                case "SET":
                    return localStorage.setItem(c.hT[e.key], e.value);
                case "REMOVE":
                    return localStorage.removeItem(c.hT[e.key])
                }
            } catch (e) {
                throw (0,
                o.k)("LOCAL_STORAGE_ACCESS_DENIED"),
                e
            }
        }
          , d = {
            get: e => s({
                action: "GET",
                key: e
            }),
            set: (e, t) => s({
                action: "SET",
                key: e,
                value: t
            }),
            remove: e => s({
                action: "REMOVE",
                key: e
            })
        }
          , l = () => (0,
        i.YI)({
            getCookie: e => a.Z.get(e) ?? null,
            setLocalStorage: (e, t) => d.set(e, t)
        })
          , u = e => (0,
        i.s2)({
            apexDomain: e,
            setCookie: (e, t, r) => {
                a.Z.set(e, t, r)
            }
            ,
            removeCookie: (e, t) => {
                a.Z.remove(e, t)
            }
            ,
            getLocalStorage: e => d.get(e)
        })
          , m = ({apexDomain: e, isForEvent: t}) => (0,
        c.zK)({
            isForEvent: t,
            getLocalStorage: d.get,
            setLocalStorage: d.set,
            ...e ? {
                updateApexCookie: () => u(e)
            } : {}
        })
          , _ = () => {
            let e = a.Z.get(c.XC);
            if (e)
                return g(e),
                e;
            {
                let e = (0,
                n.x0)();
                return g(e),
                e
            }
        }
          , p = async () => {
            let e = d.get("userId");
            if (null !== e)
                return e;
            if ("function" == typeof window.ElevarUserIdFn)
                try {
                    let e = await window.ElevarUserIdFn();
                    if ("string" == typeof e)
                        return g(e),
                        e;
                    return (0,
                    o.k)("USERID_FN_BAD_RETURN"),
                    _()
                } catch (e) {
                    (0,
                    o.k)("USERID_FN_ERROR_THROWN", [e])
                }
            return _()
        }
          , g = e => {
            d.set("userId", e)
        }
          , v = () => d.get("lastCollectionPathname") ?? ""
          , f = e => {
            d.set("lastCollectionPathname", e)
        }
          , y = () => !!d.get("userOnSignupPath")
          , w = e => {
            e ? d.set("userOnSignupPath", "true") : d.remove("userOnSignupPath")
        }
          , h = () => !!d.get("userLoggedIn")
          , E = e => {
            e ? d.set("userLoggedIn", "true") : d.remove("userLoggedIn")
        }
          , b = () => {
            let e = d.get("cart");
            return null === e ? [] : JSON.parse(e).map( ({variant: e, image: t, ...r}) => ({
                ...r,
                variant: e ?? "Default Title",
                image: "string" == typeof t || null === t ? t : void 0 === t ? null : t.url
            }))
        }
          , I = e => {
            d.set("cart", JSON.stringify(e))
        }
          , x = () => {
            let e = d.get("params");
            return (0,
            c.mX)(e)
        }
          , C = e => {
            d.set("params", (0,
            c.tW)(e))
        }
          , S = () => {
            let e = d.get("cookies");
            return (0,
            c.fX)(e)
        }
          , O = e => {
            d.set("cookies", (0,
            c.P7)(e))
        }
          , A = () => "true" === d.get("debug")
          , T = e => {
            e ? d.set("debug", "true") : d.remove("debug")
        }
    },
    704: function(e, t, r) {
        r.d(t, {
            k: () => i
        });
        let a = e => {
            switch (e) {
            case "UNEXPECTED":
            case "TRANSFORM_FN_BAD_RETURN":
            case "TRANSFORM_FN_ERROR_THROWN":
            case "USERID_FN_BAD_RETURN":
            case "USERID_FN_ERROR_THROWN":
            case "MARKETID_FN_BAD_RETURN":
            case "MARKETID_FN_ERROR_THROWN":
            case "BAD_EVENT_DATA":
            case "BAD_EVENT_ORDER":
            case "DUPLICATE_EVENT":
            case "CART_RECONCILIATION_ENABLED":
            case "MISSED_CONTEXT_INVALIDATION":
            case "MISSING_GOOGLE_TAG_MANAGER":
                return "ERROR";
            case "WEB_PIXEL_LOG":
            case "CONTEXT_PUSHED":
            case "VALIDATION_PASS":
                return "INFO";
            case "CONSENT_CHECK_LIMIT_REACHED":
            case "LOCAL_STORAGE_ACCESS_DENIED":
                return "WARNING"
            }
        }
          , n = e => {
            switch (e) {
            case "INFO":
                return console.log;
            case "WARNING":
                return console.warn;
            case "ERROR":
                return console.error
            }
        }
          , i = (e, t) => {
            let r = a(e)
              , i = n(r)
              , o = e.toLowerCase();
            i(`Elevar ${r}: ${e}`, ...t ? ["\n\n", ...t] : [], `

https://docs.getelevar.com/docs/data-layer-codes#${o}`)
        }
    },
    459: function(e, t, r) {
        r.d(t, {
            y: () => a
        });
        let a = e => {
            window.ElevarDataLayer ??= [],
            window.ElevarDataLayer.push(e)
        }
    },
    648: function(e, t, r) {
        r.d(t, {
            P7: () => l,
            VE: () => o,
            XC: () => i,
            fX: () => d,
            hT: () => n,
            mX: () => c,
            tW: () => s,
            zK: () => _
        });
        let a = "___ELEVAR_GTM_SUITE--"
          , n = {
            userId: `${a}userId`,
            sessionId: `${a}sessionId`,
            sessionCount: `${a}sessionCount`,
            lastCollectionPathname: `${a}lastCollectionPathname`,
            lastDlPushTimestamp: `${a}lastDlPushTimestamp`,
            userOnSignupPath: `${a}userOnSignupPath`,
            userLoggedIn: `${a}userLoggedIn`,
            cart: `${a}cart`,
            params: `${a}params`,
            cookies: `${a}cookies`,
            debug: `${a}debug`,
            elevarCookie: `${a}elevarCookie`
        }
          , i = "_shopify_y"
          , o = {
            modern: "_Elevar-apex",
            legacy: "___ELEVAR_GTM_SUITE--apexDomain"
        }
          , c = e => null !== e ? JSON.parse(e) : {}
          , s = e => JSON.stringify(e)
          , d = e => null !== e ? JSON.parse(e) : {}
          , l = e => JSON.stringify(e)
          , u = e => !!e && Number(e) + 1800 <= Math.floor(Date.now() / 1e3)
          , m = "OTHER"
          , _ = async ({isForEvent: e, getLocalStorage: t, setLocalStorage: r, updateApexCookie: a}) => {
            let n = new Date
              , i = String(Math.floor(n.getTime() / 1e3))
              , [o,c,s] = await Promise.all([t("sessionId"), t("sessionCount"), t("lastDlPushTimestamp")])
              , d = u(s);
            e && (m = null === s ? "FIRST_EVER" : d ? "FIRST_IN_SESSION" : "OTHER");
            let l = null === o || d ? i : o
              , _ = null === c ? "1" : d ? String(Number(c) + 1) : c
              , p = e ? i : s;
            await Promise.all([r("sessionId", l), r("sessionCount", _), ...p ? [r("lastDlPushTimestamp", p)] : []]),
            await a?.();
            let g = {
                id: l,
                count: _
            };
            return e ? {
                session: g,
                lastDlPushTimestamp: p,
                eventState: m,
                date: n
            } : {
                session: g
            }
        }
    },
    444: function(e, t, r) {
        function a(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = arguments[t];
                for (var a in r)
                    e[a] = r[a]
            }
            return e
        }
        r.d(t, {
            Z: () => n
        });
        var n = function e(t, r) {
            function n(e, n, i) {
                if ("undefined" != typeof document) {
                    "number" == typeof (i = a({}, r, i)).expires && (i.expires = new Date(Date.now() + 864e5 * i.expires)),
                    i.expires && (i.expires = i.expires.toUTCString()),
                    e = encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
                    var o = "";
                    for (var c in i)
                        i[c] && (o += "; " + c,
                        !0 !== i[c] && (o += "=" + i[c].split(";")[0]));
                    return document.cookie = e + "=" + t.write(n, e) + o
                }
            }
            return Object.create({
                set: n,
                get: function(e) {
                    if ("undefined" != typeof document && (!arguments.length || e)) {
                        for (var r = document.cookie ? document.cookie.split("; ") : [], a = {}, n = 0; n < r.length; n++) {
                            var i = r[n].split("=")
                              , o = i.slice(1).join("=");
                            try {
                                var c = decodeURIComponent(i[0]);
                                if (a[c] = t.read(o, c),
                                e === c)
                                    break
                            } catch (e) {}
                        }
                        return e ? a[e] : a
                    }
                },
                remove: function(e, t) {
                    n(e, "", a({}, t, {
                        expires: -1
                    }))
                },
                withAttributes: function(t) {
                    return e(this.converter, a({}, this.attributes, t))
                },
                withConverter: function(t) {
                    return e(a({}, this.converter, t), this.attributes)
                }
            }, {
                attributes: {
                    value: Object.freeze(r)
                },
                converter: {
                    value: Object.freeze(t)
                }
            })
        }({
            read: function(e) {
                return '"' === e[0] && (e = e.slice(1, -1)),
                e.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
            },
            write: function(e) {
                return encodeURIComponent(e).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent)
            }
        }, {
            path: "/"
        })
    },
    563: function(e, t, r) {
        r.d(t, {
            x0: () => a
        });
        let a = (e=21) => {
            let t = ""
              , r = crypto.getRandomValues(new Uint8Array(e |= 0));
            for (; e--; )
                t += "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict"[63 & r[e]];
            return t
        }
    },
    52: function(e, t, r) {
        r.d(t, {
            a: () => n
        });
        var a = r(343);
        function n(...e) {
            return (0,
            a.a)(i, e)
        }
        var i = (e, t) => e.length >= t
    },
    364: function(e, t, r) {
        r.d(t, {
            a: () => a
        });
        function a(e) {
            if ("object" != typeof e || null === e)
                return !1;
            let t = Object.getPrototypeOf(e);
            return null === t || t === Object.prototype
        }
    },
    68: function(e, t, r) {
        r.d(t, {
            a: () => a
        });
        function a(e, t, r) {
            let a = r => e(r, ...t);
            return void 0 === r ? a : Object.assign(a, {
                lazy: r,
                lazyArgs: t
            })
        }
    },
    61: function(e, t, r) {
        r.d(t, {
            a: () => i
        });
        var a = r(52)
          , n = r(343);
        function i(...e) {
            return (0,
            n.a)(o, e)
        }
        function o(e, t) {
            if (!(0,
            a.a)(t, 1))
                return {
                    ...e
                };
            if (!(0,
            a.a)(t, 2)) {
                let {[t[0]]: r, ...a} = e;
                return a
            }
            let r = {
                ...e
            };
            for (let e of t)
                delete r[e];
            return r
        }
    },
    343: function(e, t, r) {
        r.d(t, {
            a: () => n
        });
        var a = r(68);
        function n(e, t, r) {
            let n = e.length - t.length;
            if (0 === n)
                return e(...t);
            if (1 === n)
                return (0,
                a.a)(e, t, r);
            throw Error("Wrong number of arguments")
        }
    }
}, a = {};
function n(e) {
    var t = a[e];
    if (void 0 !== t)
        return t.exports;
    var i = a[e] = {
        exports: {}
    };
    return r[e](i, i.exports, n),
    i.exports
}
n.m = r,
n.d = (e, t) => {
    for (var r in t)
        n.o(t, r) && !n.o(e, r) && Object.defineProperty(e, r, {
            enumerable: !0,
            get: t[r]
        })
}
,
n.f = {},
n.e = e => Promise.all(Object.keys(n.f).reduce( (t, r) => (n.f[r](e, t),
t), [])),
n.u = e => "dl-conformity.js",
n.miniCssF = e => "" + e + ".css",
n.h = () => "a9a69f97e68651ea",
n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t),
n.r = e => {
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
        value: "Module"
    }),
    Object.defineProperty(e, "__esModule", {
        value: !0
    })
}
,
n.p = "/",
e = {
    543: 0
},
t = t => {
    var r, a, i = t.__webpack_ids__, o = t.__webpack_modules__, c = t.__webpack_runtime__, s = 0;
    for (r in o)
        n.o(o, r) && (n.m[r] = o[r]);
    for (c && c(n); s < i.length; s++)
        a = i[s],
        n.o(e, a) && e[a] && e[a][0](),
        e[i[s]] = 0
}
,
n.f.j = function(r, a) {
    var i = n.o(e, r) ? e[r] : void 0;
    if (0 !== i)
        if (i)
            a.push(i[1]);
        else {
            var o = import("./" + n.u(r)).then(t, t => {
                throw 0 !== e[r] && (e[r] = void 0),
                t
            }
            )
              , o = Promise.race([o, new Promise(t => {
                i = e[r] = [t]
            }
            )]);
            a.push(i[1] = o)
        }
}
;
var i = {};
( () => {
    let e;
    n.d(i, {
        y: () => tP
    });
    var t, r, a = n(546), o = n(364), c = n(459);
    let s = e => {
        "leadType"in e ? "email" === e.leadType ? (0,
        c.y)({
            event: "dl_subscribe",
            lead_type: "email",
            user_properties: {
                customer_email: e.email,
                ...e.phone ? {
                    customer_phone: e.phone
                } : {}
            }
        }) : (0,
        c.y)({
            event: "dl_subscribe",
            lead_type: "phone",
            user_properties: {
                ...e.email ? {
                    customer_email: e.email
                } : {},
                customer_phone: e.phone
            }
        }) : "email"in e ? (0,
        c.y)({
            event: "dl_subscribe",
            lead_type: "email",
            user_properties: {
                customer_email: e.email
            }
        }) : (0,
        c.y)({
            event: "dl_subscribe",
            lead_type: "phone",
            user_properties: {
                customer_phone: e.phone
            }
        })
    }
      , d = () => {
        window.addEventListener("klaviyoForms", e => {
            "stepSubmit" === e.detail.type && (e.detail.metaData?.$email && s({
                email: e.detail.metaData.$email
            }),
            e.detail.metaData?.$phone_number && s({
                phone: e.detail.metaData.$phone_number
            }))
        }
        )
    }
      , l = () => {
        window.addEventListener("submit", () => {
            let e = document.querySelector('[name="contact[email]"]');
            e?.value && s({
                email: e.value
            })
        }
        )
    }
      , u = () => {
        window.addEventListener("message", e => {
            (0,
            o.a)(e.data) && (0,
            o.a)(e.data.CollectedEmailEvent) && "string" == typeof e.data.CollectedEmailEvent.email && s({
                email: e.data.CollectedEmailEvent.email
            })
        }
        )
    }
      , m = () => {
        window.addEventListener("message", e => {
            if ((0,
            o.a)(e.data) && (0,
            o.a)(e.data.__attentive) && "string" == typeof e.data.__attentive.action) {
                let t = "EMAIL_LEAD" === e.data.__attentive.action ? "email" : "LEAD" === e.data.__attentive.action ? "phone" : null;
                if (t) {
                    let r = "string" == typeof e.data.__attentive.email ? e.data.__attentive.email : void 0
                      , a = "string" == typeof e.data.__attentive.phone ? e.data.__attentive.phone : void 0;
                    if ("email" === t)
                        if (r)
                            s({
                                leadType: t,
                                email: r,
                                phone: a
                            });
                        else
                            throw Error("Elevar: Email not present in Attentive event");
                    else if (a)
                        s({
                            leadType: t,
                            email: r,
                            phone: a
                        });
                    else
                        throw Error("Elevar: Phone not present in Attentive event")
                }
            }
        }
        )
    }
      , _ = () => {
        document.addEventListener("smsbump-custom-form-event", e => {
            e.detail.email && s({
                email: e.detail.email
            }),
            e.detail.phone && s({
                phone: e.detail.phone
            })
        }
        )
    }
      , p = () => {
        window.addEventListener("omnisendForms", e => {
            "submit" === e.detail.type && (e.detail.formValues?.emailField && s({
                email: e.detail.formValues.emailField
            }),
            e.detail.formValues?.phoneNumberField && s({
                phone: e.detail.formValues.phoneNumberField
            }))
        }
        )
    }
      , g = () => {
        let e = !1
          , t = !1;
        document.addEventListener("alia:signup", r => {
            r.detail.email && !e && (s({
                email: r.detail.email
            }),
            e = !0),
            r.detail.phone && !t && (s({
                phone: r.detail.phone
            }),
            t = !0)
        }
        )
    }
      , v = () => {
        d(),
        l(),
        u(),
        m(),
        _(),
        p(),
        g()
    }
      , f = {
        COOKIE_KEY_PREFIX: "_elevar_",
        VISITOR_INFO_KEY: "_elevar_visitor_info"
    }
      , y = {
        AWIN_CHANNEL_COOKIE: "AwinChannelCookie",
        BING_SID: "_uetsid",
        BING_VID: "_uetvid",
        FACEBOOK_BROWSER_ID: "_fbp",
        FACEBOOK_CLICK_ID: "_fbc",
        GOOGLE_ANALYTICS: "_ga",
        GOOGLE_ANALYTICS_GA4_PREFIX: "_ga_",
        REDDIT_UUID: "_rdt_uuid",
        SNAPCHAT_USER_ID: "_scid",
        TIKTOK_CLICK_ID: "ttclid",
        TIKTOK_COOKIE_ID: "_ttp"
    }
      , w = {
        GOOGLE_CLICK_ID: "gclid",
        GOOGLE_GBRAID: "gbraid",
        GOOGLE_WBRAID: "wbraid",
        UTM_CAMPAIGN: "utm_campaign",
        UTM_CONTENT: "utm_content",
        UTM_MEDIUM: "utm_medium",
        UTM_SOURCE: "utm_source",
        UTM_TERM: "utm_term"
    }
      , h = {
        APPLOVIN: "aleid",
        ASPIRE: "transaction_id",
        AWIN: "awc",
        BING: "msclkid",
        CJ: "cjevent",
        FACEBOOK: "fbclid",
        GOOGLE_ADS: "gclsrc",
        IMPACT_RADIUS: "irclickid",
        IMPACT_RADIUS_ALT_ID: "im_ref",
        ITERABLE: "iterable_campaign",
        KLAVIYO: "_kx",
        LINKEDIN: "li_fat_id",
        OUTBRAIN: "dicbo",
        PARTNERIZE: "clickref",
        PEPPERJAM: "clickId",
        PEPPERJAM_PUBLISHER_ID: "ev_publisherId",
        PINTEREST: "epik",
        RAKUTEN: "ranSiteID",
        REDDIT: "rdt_cid",
        SHAREASALE: "sscid",
        SNAPCHAT: "ScCid",
        TABOOLA: "tblci",
        TIKTOK: "ttclid",
        TWITTER: "twclid",
        VOLUUM: "vlmcid"
    }
      , E = {
        FACEBOOK: "fbadid",
        GOOGLE: "gadid",
        PINTEREST: "padid",
        SMARTLY: "smadid",
        SNAPCHAT: "scadid",
        TIKTOK: "ttadid"
    }
      , b = {
        ELEVAR_SESSION_COUNT: "session_count",
        ELEVAR_SESSION_ID: "session_id",
        ELEVAR_USER_ID: "user_id",
        MARKET_ID: "market_id",
        GOOGLE_ADS_CLICK_ID: "google_ads_click_id",
        GTM_CONSENT: "consent",
        GTM_CONSENT_V2: "consent_v2",
        RAKUTEN_TIME_STAMP: "ranSiteID_ts",
        REFERRER: "referrer",
        SMARTLY_TIME_STAMP: "smadid_ts"
    };
    var I = n(704);
    let x = e => {
        let t = document.createElement("script");
        t.async = !0,
        t.src = e,
        document.head.prepend(t)
    }
      , C = e => {
        try {
            let t = e.config.market_groups;
            if (null !== e.marketId || e.orderStatusPageScriptsFallback) {
                let r = t.find(t => t.markets.some(t => "Shopify" === t.source && t.external_id === e.marketId)) ?? t.find(e => e.markets.some(e => "_Required" === e.source && "unconfigured" === e.external_id));
                if (r && "DONT-LOAD-GTM" !== r.gtm_container) {
                    window.dataLayer ??= [],
                    window.dataLayer.push({
                        "gtm.start": Date.now(),
                        event: "gtm.js"
                    });
                    let e = r.gtm_container;
                    x(`https://www.googletagmanager.com/gtm.js?id=${e}`)
                }
            }
        } catch (e) {
            (0,
            I.k)("UNEXPECTED", [e])
        }
    }
    ;
    var S = n(563)
      , O = n(884);
    function A(e, {waitMs: t, timing: r="trailing", maxWaitMs: a}) {
        if (void 0 !== a && void 0 !== t && a < t)
            throw Error(`debounce: maxWaitMs (${a.toString()}) cannot be less than waitMs (${t.toString()})`);
        let n, i, o, c, s = () => {
            if (void 0 !== i) {
                let e = i;
                i = void 0,
                clearTimeout(e)
            }
            if (void 0 === o)
                throw Error("REMEDA[debounce]: latestCallArgs was unexpectedly undefined.");
            let t = o;
            o = void 0,
            c = e(...t)
        }
        , d = () => {
            if (void 0 === n)
                return;
            let e = n;
            n = void 0,
            clearTimeout(e),
            void 0 !== o && s()
        }
        , l = e => {
            o = e,
            void 0 !== a && void 0 === i && (i = setTimeout(s, a))
        }
        ;
        return {
            call: (...i) => {
                if (void 0 === n)
                    "trailing" === r ? l(i) : c = e(...i);
                else {
                    "leading" !== r && l(i);
                    let e = n;
                    n = void 0,
                    clearTimeout(e)
                }
                return n = setTimeout(d, t ?? a ?? 0),
                c
            }
            ,
            cancel: () => {
                if (void 0 !== n) {
                    let e = n;
                    n = void 0,
                    clearTimeout(e)
                }
                if (void 0 !== i) {
                    let e = i;
                    i = void 0,
                    clearTimeout(e)
                }
                o = void 0
            }
            ,
            flush: () => (d(),
            c),
            get isPending() {
                return void 0 !== n
            },
            get cachedValue() {
                return c
            }
        }
    }
    var T = n(216);
    let R = A(e => {
        window.ElevarConsent ??= [],
        window.ElevarConsent.push(e)
    }
    , {
        waitMs: 200,
        maxWaitMs: 2e3
    })
      , k = "NOT_CHECKED"
      , D = {
        getState: () => k,
        process: async e => {
            let t = async (e=1) => {
                let r = window.google_tag_data?.ics?.entries;
                return r && Object.values(r).some(e => void 0 !== e.default || void 0 !== e.update) ? (k = "PRESENT",
                r) : e > 10 ? (k = "CHECK_TIMED_OUT",
                (0,
                I.k)("CONSENT_CHECK_LIMIT_REACHED"),
                null) : (k = "CHECKING",
                await (0,
                O.Gj)(2 ** e * 10),
                t(e + 1))
            }
              , r = await t();
            if (r && !e?.onlySetGcmState) {
                let e = () => {
                    R.call((0,
                    O.E6)(T.S.map(e => [e, "boolean" == typeof r[e]?.default || "boolean" == typeof r[e]?.update ? {
                        ..."boolean" == typeof r[e].default ? {
                            default: r[e].default
                        } : {},
                        ..."boolean" == typeof r[e].update ? {
                            update: r[e].update
                        } : {}
                    } : {
                        default: !1
                    }])))
                }
                ;
                e(),
                (0,
                O.$F)(r).forEach(t => {
                    r[t] = new Proxy(r[t],{
                        set: (t, r, a, n) => ("update" === r && e(),
                        Reflect.set(t, r, a, n))
                    })
                }
                );
                try {
                    window.google_tag_data?.ics?.addListener?.(T.S, e)
                } catch (e) {
                    (0,
                    I.k)("UNEXPECTED", [e])
                }
            }
        }
    }
      , N = {
        process: () => {
            let e = e => {
                R.call({
                    ad_storage: e.marketingAllowed,
                    ad_user_data: e.marketingAllowed,
                    ad_personalization: e.marketingAllowed,
                    analytics_storage: e.analyticsAllowed,
                    functionality_storage: e.preferencesAllowed,
                    personalization_storage: e.preferencesAllowed,
                    security_storage: {
                        default: !0
                    }
                })
            }
            ;
            window.Shopify?.loadFeatures?.([{
                name: "consent-tracking-api",
                version: "0.1"
            }], t => {
                if (t)
                    (0,
                    I.k)("UNEXPECTED", [t]);
                else {
                    let t = window.Shopify.customerPrivacy
                      , r = {
                        marketingAllowed: t.marketingAllowed(),
                        saleOfDataAllowed: t.saleOfDataAllowed(),
                        analyticsAllowed: t.analyticsProcessingAllowed(),
                        preferencesAllowed: t.preferencesProcessingAllowed()
                    };
                    e({
                        marketingAllowed: {
                            default: r.marketingAllowed
                        },
                        saleOfDataAllowed: {
                            default: r.saleOfDataAllowed
                        },
                        analyticsAllowed: {
                            default: r.analyticsAllowed
                        },
                        preferencesAllowed: {
                            default: r.preferencesAllowed
                        }
                    }),
                    document.addEventListener("visitorConsentCollected", t => {
                        e({
                            marketingAllowed: {
                                default: r.marketingAllowed,
                                update: t.detail.marketingAllowed
                            },
                            saleOfDataAllowed: {
                                default: r.saleOfDataAllowed,
                                update: t.detail.saleOfDataAllowed
                            },
                            analyticsAllowed: {
                                default: r.analyticsAllowed,
                                update: t.detail.analyticsAllowed
                            },
                            preferencesAllowed: {
                                default: r.preferencesAllowed,
                                update: t.detail.preferencesAllowed
                            }
                        })
                    }
                    )
                }
            }
            )
        }
    }
      , P = {
        defaultMerge: Symbol("deepmerge-ts: default merge"),
        skip: Symbol("deepmerge-ts: skip")
    };
    function F(e, t) {
        return t
    }
    function L(e, t) {
        return e.filter(e => void 0 !== e)
    }
    function q(e) {
        return "object" != typeof e || null === e ? 0 : Array.isArray(e) ? 2 : !function(e) {
            if (!j.includes(Object.prototype.toString.call(e)))
                return !1;
            let {constructor: t} = e;
            if (void 0 === t)
                return !0;
            let r = t.prototype;
            return null !== r && "object" == typeof r && !!j.includes(Object.prototype.toString.call(r)) && !!r.hasOwnProperty("isPrototypeOf")
        }(e) ? e instanceof Set ? 3 : e instanceof Map ? 4 : 5 : 1
    }
    function M(e) {
        let t = 0
          , r = e[0]?.[Symbol.iterator]();
        return {
            [Symbol.iterator]: () => ({
                next() {
                    for (; ; ) {
                        if (void 0 === r)
                            return {
                                done: !0,
                                value: void 0
                            };
                        let a = r.next();
                        if (!0 === a.done) {
                            t += 1,
                            r = e[t]?.[Symbol.iterator]();
                            continue
                        }
                        return {
                            done: !1,
                            value: a.value
                        }
                    }
                }
            })
        }
    }
    P.defaultMerge,
    (t = r || (r = {}))[t.NOT = 0] = "NOT",
    t[t.RECORD = 1] = "RECORD",
    t[t.ARRAY = 2] = "ARRAY",
    t[t.SET = 3] = "SET",
    t[t.MAP = 4] = "MAP",
    t[t.OTHER = 5] = "OTHER";
    let j = ["[object Object]", "[object Module]"]
      , U = {
        mergeRecords: function(e, t, r) {
            let a = {};
            for (let n of function(e) {
                let t = new Set;
                for (let r of e)
                    for (let e of [...Object.keys(r), ...Object.getOwnPropertySymbols(r)])
                        t.add(e);
                return t
            }(e)) {
                let i = [];
                for (let t of e)
                    "object" == typeof t && Object.prototype.propertyIsEnumerable.call(t, n) && i.push(t[n]);
                if (0 === i.length)
                    continue;
                let o = t.metaDataUpdater(r, {
                    key: n,
                    parents: e
                })
                  , c = G(i, t, o);
                c !== P.skip && ("__proto__" === n ? Object.defineProperty(a, n, {
                    value: c,
                    configurable: !0,
                    enumerable: !0,
                    writable: !0
                }) : a[n] = c)
            }
            return a
        },
        mergeArrays: function(e) {
            return e.flat()
        },
        mergeSets: function(e) {
            return new Set(M(e))
        },
        mergeMaps: function(e) {
            return new Map(M(e))
        },
        mergeOthers: function(e) {
            return e.at(-1)
        }
    };
    function G(e, t, r) {
        let a = t.filterValues?.(e, r) ?? e;
        if (0 === a.length)
            return;
        if (1 === a.length)
            return K(a, t, r);
        let n = q(a[0]);
        if (0 !== n && 5 !== n) {
            for (let e = 1; e < a.length; e++)
                if (q(a[e]) !== n)
                    return K(a, t, r)
        }
        switch (n) {
        case 1:
            var i = a
              , o = t
              , c = r;
            let s = o.mergeFunctions.mergeRecords(i, o, c);
            return s === P.defaultMerge || o.useImplicitDefaultMerging && void 0 === s && o.mergeFunctions.mergeRecords !== o.defaultMergeFunctions.mergeRecords ? o.defaultMergeFunctions.mergeRecords(i, o, c) : s;
        case 2:
            var d = a
              , l = t
              , u = r;
            let m = l.mergeFunctions.mergeArrays(d, l, u);
            return m === P.defaultMerge || l.useImplicitDefaultMerging && void 0 === m && l.mergeFunctions.mergeArrays !== l.defaultMergeFunctions.mergeArrays ? l.defaultMergeFunctions.mergeArrays(d) : m;
        case 3:
            var _ = a
              , p = t
              , g = r;
            let v = p.mergeFunctions.mergeSets(_, p, g);
            return v === P.defaultMerge || p.useImplicitDefaultMerging && void 0 === v && p.mergeFunctions.mergeSets !== p.defaultMergeFunctions.mergeSets ? p.defaultMergeFunctions.mergeSets(_) : v;
        case 4:
            var f = a
              , y = t
              , w = r;
            let h = y.mergeFunctions.mergeMaps(f, y, w);
            return h === P.defaultMerge || y.useImplicitDefaultMerging && void 0 === h && y.mergeFunctions.mergeMaps !== y.defaultMergeFunctions.mergeMaps ? y.defaultMergeFunctions.mergeMaps(f) : h;
        default:
            return K(a, t, r)
        }
    }
    function K(e, t, r) {
        let a = t.mergeFunctions.mergeOthers(e, t, r);
        return a === P.defaultMerge || t.useImplicitDefaultMerging && void 0 === a && t.mergeFunctions.mergeOthers !== t.defaultMergeFunctions.mergeOthers ? t.defaultMergeFunctions.mergeOthers(e) : a
    }
    let V = (e, t) => btoa(t + (e.event_id ? `:${e.event_id}` : "") + (e.event ? `:${e.event}` : ""));
    var $ = n(721);
    let B = ({config: e, scriptType: t, proxy: r, location: a, data: n}) => {
        let i = new URLSearchParams({
            source_url: a.href
        });
        if ("SHOPIFY" !== r.type) {
            let {signing_key: r, shop_url: a} = e;
            i.set("signature", V(n, r)),
            "AGNOSTIC" !== t && (i.set("timestamp", String(Math.floor(Date.now() / 1e3))),
            a && i.set("shop", a))
        }
        let o = "AGNOSTIC" === t ? e.sources.agnostic.api_url : e.connector_url
          , c = "AGNOSTIC" === t ? "/api/hit" : "/base/hit"
          , s = "SHOPIFY" === r.type ? "/a/elevar" : "CUSTOM" === r.type ? `${r.path}${c}` : `${o}${c}`;
        fetch(`${s}?${i.toString()}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ..."AGNOSTIC" === t && e.sources.agnostic ? {
                    "X-Website-ID": e.sources.agnostic.website_id
                } : {}
            },
            body: JSON.stringify(n)
        }),
        window.dispatchEvent(new CustomEvent("elevar-dl-event",{
            detail: n
        })),
        "function" == typeof window.ElevarForwardFn && window.ElevarForwardFn({
            url: s,
            params: i,
            mergedItems: X
        })
    }
      , W = async t => {
        (0,
        $.v4)() && (e || (e = (await n.e("591").then(n.bind(n, 148))).logConformity),
        e(t))
    }
      , H = ["event", "event_id", "event_time", "event_state", "cart_total", "page", "device", "user_properties", "ecommerce", "marketing", "lead_type"]
      , Y = function(e, t) {
        var r, a;
        let n = (r = e,
        a = i,
        {
            defaultMergeFunctions: U,
            mergeFunctions: {
                ...U,
                ...Object.fromEntries(Object.entries(r).filter( ([e,t]) => Object.hasOwn(U, e)).map( ([e,t]) => !1 === t ? [e, U.mergeOthers] : [e, t]))
            },
            metaDataUpdater: r.metaDataUpdater ?? F,
            deepmerge: a,
            useImplicitDefaultMerging: r.enableImplicitDefaultMerging ?? !1,
            filterValues: !1 === r.filterValues ? void 0 : r.filterValues ?? L,
            actions: P
        });
        function i(...e) {
            return G(e, n, void 0)
        }
        return i
    }({
        mergeArrays: !1
    })
      , X = {}
      , z = ({config: e, scriptType: t, proxy: r, location: a, raw: n, transformed: i}) => {
        let o = Object.fromEntries(Object.entries((0,
        $.$1)()).filter( ([e]) => !e.includes(y.GOOGLE_ANALYTICS_GA4_PREFIX)).filter(e => void 0 !== e[1]))
          , c = Object.fromEntries(Object.entries(i).filter( ([e]) => H.includes(e)));
        X = {
            ...Y(X, c),
            marketing: Y(Y(X.marketing ?? {}, c.marketing ?? {}), o)
        },
        c.event && T.x.includes(c.event) && B({
            config: e,
            scriptType: t,
            proxy: r,
            location: a,
            data: X
        }),
        W({
            config: e,
            scriptType: t,
            data: i._elevar_internal?.isElevarContextPush ? {
                type: "CONTEXT",
                item: i
            } : {
                type: "EVENT",
                details: {
                    raw: n,
                    transformed: i,
                    sanitized: c
                }
            }
        })
    }
    ;
    var J = n(743)
      , Z = n(444);
    let Q = Object.values(w)
      , ee = [...Object.values(E), ...Object.values(h)]
      , et = [...Q, ...ee, ...Object.values(b)]
      , er = e => {
        let t = w.GOOGLE_CLICK_ID
          , r = w.GOOGLE_GBRAID
          , a = w.GOOGLE_WBRAID
          , n = e.get(t)
          , i = e.get(r)
          , o = e.get(a);
        return n ? [[b.GOOGLE_ADS_CLICK_ID, `gclid:${n}`]] : i ? [[b.GOOGLE_ADS_CLICK_ID, `gbraid:${i}`]] : o ? [[b.GOOGLE_ADS_CLICK_ID, `wbraid:${o}`]] : []
    }
      , ea = e => {
        let t = new URLSearchParams(e);
        return Object.fromEntries([...Q, ...ee].filter(e => t.has(e)).map(e => [e, t.get(e)]).concat(er(t)))
    }
      , en = null
      , ei = (e, t, r) => {
        if ("" === e)
            return {};
        let a = new URL(e)
          , n = t ? [t, ...r] : r
          , i = e === en
          , o = a.hostname === location.hostname
          , c = n.some(e => a.hostname === e || a.hostname.endsWith(`.${e}`));
        return i || o || c ? {} : (en = e,
        {
            referrer: e
        })
    }
      , eo = e => ({
        consent_v2: Object.fromEntries(Object.entries(e).map( ([e,t]) => [e, {
            ..."boolean" == typeof t.default ? {
                default: t.default
            } : {},
            ..."boolean" == typeof t.update ? {
                update: t.update
            } : {}
        }]))
    })
      , ec = e => {
        let t = Object.entries(e)
          , r = f.VISITOR_INFO_KEY
          , a = t.find( ([e]) => e === r);
        if (!a)
            return {};
        try {
            let e = a[1].replaceAll("&quot;", '"');
            return JSON.parse(e)
        } catch (e) {
            return (0,
            I.k)("UNEXPECTED", [e]),
            {}
        }
    }
      , es = ({stale: e, updated: t}) => {
        let r = Object.fromEntries(e.filter( ([e]) => Q.includes(e)))
          , a = t.some( ([e]) => Q.includes(e))
          , n = t.some( ([e,t]) => e === b.REFERRER && r[e] !== t);
        return Object.fromEntries(a ? [...e.filter( ([e]) => !Q.includes(e)), ...t].filter( ([e]) => e !== b.REFERRER) : n ? [...e, ...t].filter( ([e]) => !Q.includes(e)) : [...e, ...t])
    }
      , ed = ({stale: e, fresh: t, newFiltered: r}) => {
        let a = E.SMARTLY in r && e[E.SMARTLY] !== t[E.SMARTLY]
          , n = h.RAKUTEN in r && e[h.RAKUTEN] !== t[h.RAKUTEN];
        return {
            ...r,
            ...a ? {
                [b.SMARTLY_TIME_STAMP]: Math.floor(Date.now() / 1e3)
            } : b.SMARTLY_TIME_STAMP in e ? {
                [b.SMARTLY_TIME_STAMP]: e[b.SMARTLY_TIME_STAMP]
            } : {},
            ...n ? {
                [b.RAKUTEN_TIME_STAMP]: Math.floor(Date.now() / 1e3)
            } : b.RAKUTEN_TIME_STAMP in e ? {
                [b.RAKUTEN_TIME_STAMP]: e[b.RAKUTEN_TIME_STAMP]
            } : {}
        }
    }
      , el = (e, t) => JSON.stringify(e) === JSON.stringify(t)
      , eu = async ({getPersistedParams: e, setPersistedParams: t, search: r, referrer: a, apexDomain: n, ignoredReferrerDomains: i, userId: o, sessionId: c, sessionCount: s, marketId: d, consentData: l, cartAttributes: u}) => {
        let m = es({
            stale: Object.entries(await e()),
            updated: Object.entries({
                ...ea(r),
                ...ei(a, n, i),
                user_id: o,
                session_id: c,
                session_count: s,
                ...d ? {
                    [b.MARKET_ID]: d
                } : {},
                ...l ? eo(l) : {}
            })
        })
          , _ = u ? ec(u) : {}
          , p = ([e]) => et.includes(e)
          , g = es({
            stale: Object.entries(_).filter(p),
            updated: Object.entries(m).filter(p)
        })
          , v = ed({
            stale: _,
            fresh: m,
            newFiltered: g
        });
        return await t(v),
        Object.entries(v).some( ([e,t]) => !el(t, _[e] ?? null)) ? {
            [f.VISITOR_INFO_KEY]: JSON.stringify(v)
        } : {}
    }
      , em = e => e.startsWith("GS1") ? e.split(".").map( (e, t) => 5 === t ? "0" : e).join(".") : e.split("$").map(e => e.startsWith("t") ? "t0" : e).join("$")
      , e_ = e => Object.fromEntries(Object.entries(e).map( ([e,t]) => [e, e.includes(y.GOOGLE_ANALYTICS_GA4_PREFIX) && t ? em(t) : t]))
      , ep = [y.AWIN_CHANNEL_COOKIE, y.BING_SID, y.BING_VID, y.FACEBOOK_CLICK_ID, y.FACEBOOK_BROWSER_ID, y.GOOGLE_ANALYTICS, y.REDDIT_UUID, y.TIKTOK_CLICK_ID, y.TIKTOK_COOKIE_ID, y.SNAPCHAT_USER_ID]
      , eg = e => [...ep, ...Object.keys(e).filter(e => e.includes(y.GOOGLE_ANALYTICS_GA4_PREFIX))]
      , ev = (e, t) => Object.fromEntries(Object.entries(t).filter( ([t]) => e.includes(t.replace(f.COOKIE_KEY_PREFIX, ""))).map( ([e,t]) => [e.replace(f.COOKIE_KEY_PREFIX, ""), t]))
      , ef = async ({getPersistedParams: e, apexDomain: t, isConsentEnabled: r, freshCookies: a, localCookies: n}) => {
        let i = await e();
        if (!(!r || (0,
        o.a)(i.consent_v2) && (0,
        o.a)(i.consent_v2.ad_storage) && (i.consent_v2.ad_storage.update ?? i.consent_v2.ad_storage.default) && (0,
        o.a)(i.consent_v2.analytics_storage) && (i.consent_v2.analytics_storage.update ?? i.consent_v2.analytics_storage.default) && (0,
        o.a)(i.consent_v2.ad_personalization) && (i.consent_v2.ad_personalization.update ?? i.consent_v2.ad_personalization.default) && (0,
        o.a)(i.consent_v2.ad_user_data) && (i.consent_v2.ad_user_data.update ?? i.consent_v2.ad_user_data.default)))
            return [];
        let c = i[h.FACEBOOK]
          , s = n[y.FACEBOOK_CLICK_ID]
          , d = n[y.FACEBOOK_BROWSER_ID]
          , l = `fb.1.${Date.now()}`
          , u = "string" != typeof c || s && s.split(".")[3] === c ? null : `${l}.${c}`
          , m = d ? null : `${l}.${Math.floor(1e9 + 9e9 * Math.random())}`;
        return (u || !a[y.FACEBOOK_CLICK_ID] && s) && Z.Z.set(y.FACEBOOK_CLICK_ID, u ?? s, {
            domain: t ?? location.hostname.replace("www.", ""),
            expires: 90,
            path: "/"
        }),
        (m || !a[y.FACEBOOK_BROWSER_ID] && d) && Z.Z.set(y.FACEBOOK_BROWSER_ID, m ?? d, {
            domain: t ?? location.hostname.replace("www.", ""),
            expires: 90,
            path: "/"
        }),
        [...u ? [[y.FACEBOOK_CLICK_ID, u]] : [], ...m ? [[y.FACEBOOK_BROWSER_ID, m]] : []]
    }
      , ey = async ({getFreshCookies: e, getPersistedParams: t, getPersistedCookies: r, setPersistedCookies: a, apexDomain: n, isConsentEnabled: i, cartAttributes: o}) => {
        let c = e_(await e())
          , s = eg(c)
          , d = e_(await r())
          , l = o ? e_(ev(s, o)) : {}
          , u = s.map(e => {
            let t = c[e]
              , r = d[e]
              , a = l[e];
            return t !== r && void 0 !== t ? [e, t] : r !== a && void 0 !== r ? [e, r] : null
        }
        ).filter(e => null !== e)
          , m = {
            ...d,
            ...Object.fromEntries(u)
        }
          , _ = await ef({
            getPersistedParams: t,
            apexDomain: n,
            isConsentEnabled: i,
            freshCookies: c,
            localCookies: m
        });
        await a({
            ...m,
            ...Object.fromEntries(_)
        });
        let p = u.filter( ([e]) => !_.some( ([t]) => e === t));
        return Object.fromEntries([..._, ...p].map( ([e,t]) => [`${f.COOKIE_KEY_PREFIX}${e}`, t]))
    }
      , ew = async ({apexDomain: e, ignoredReferrerDomains: t, marketId: r, cartAttributes: a, consentData: n}) => {
        let {session: i} = await (0,
        $.zK)({
            isForEvent: !1
        });
        return eu({
            getPersistedParams: $.Qf,
            setPersistedParams: $.PX,
            search: window.location.search,
            referrer: document.referrer,
            apexDomain: e,
            ignoredReferrerDomains: t,
            userId: await (0,
            $.n5)(),
            sessionId: i.id,
            sessionCount: i.count,
            marketId: r,
            consentData: n,
            cartAttributes: a
        })
    }
      , eh = ({apexDomain: e, isConsentEnabled: t, cartAttributes: r}) => ey({
        getFreshCookies: () => Z.Z.get(),
        getPersistedParams: $.Qf,
        getPersistedCookies: $.$1,
        setPersistedCookies: $.lE,
        apexDomain: e,
        isConsentEnabled: t,
        cartAttributes: r
    })
      , eE = async ({apexDomain: e, ignoredReferrerDomains: t, isConsentEnabled: r, marketId: a=null, cartAttributes: n=null, onNewCartAttributes: i}) => {
        let o = r ? window.ElevarConsent?.at(-1) ?? (0,
        $.Qf)().consent_v2 ?? null : null;
        if (!r || o) {
            let c = await ew({
                apexDomain: e,
                ignoredReferrerDomains: t,
                marketId: a,
                cartAttributes: n,
                consentData: o
            })
              , s = {
                ...await eh({
                    apexDomain: e,
                    isConsentEnabled: r,
                    cartAttributes: n
                }),
                ...c
            };
            await Promise.all([(0,
            J.W)(), (0,
            $.s2)(e), ...Object.entries(s).length > 0 ? [i?.(s)] : []])
        }
    }
      , eb = e => {
        if ("function" != typeof window.ElevarTransformFn)
            return e;
        try {
            let t = window.ElevarTransformFn(e);
            if ("object" == typeof t && !Array.isArray(t) && null !== t)
                return t;
            return (0,
            I.k)("TRANSFORM_FN_BAD_RETURN"),
            e
        } catch (t) {
            return (0,
            I.k)("TRANSFORM_FN_ERROR_THROWN", [t]),
            e
        }
    }
      , eI = async (e, t) => {
        if ((0,
        J.x)(t)) {
            let {user_properties: r, ...a} = t
              , {session: n} = await (0,
            $.zK)({
                apexDomain: e,
                isForEvent: !1
            });
            return eb({
                user_properties: {
                    session_id: n.id,
                    session_count: n.count,
                    ...r
                },
                ...a
            })
        }
        {
            let {event: r, user_properties: a, ...n} = t
              , {session: i, eventState: o, date: c} = await (0,
            $.zK)({
                apexDomain: e,
                isForEvent: !0
            });
            return eb({
                ...r ? {
                    event: r
                } : {},
                event_id: (0,
                S.x0)(),
                event_time: c.toISOString(),
                event_state: o,
                user_properties: {
                    session_id: i.id,
                    session_count: i.count,
                    ...a
                },
                ...n
            })
        }
    }
      , ex = ({config: e, apexDomain: t, scriptType: r, proxy: a, location: n}) => {
        let i = !1
          , o = async () => {
            i = !1,
            await eE({
                apexDomain: t,
                ignoredReferrerDomains: e.ignored_referrer_domains,
                isConsentEnabled: e.consent_enabled
            })
        }
        ;
        window.ElevarDebugMode = $.ew,
        window.ElevarInvalidateContext = o,
        window.ElevarDataLayer ??= [];
        let c = window.ElevarDataLayer.push.bind(window.ElevarDataLayer)
          , s = [...window.ElevarDataLayer]
          , {forwardToGtm: d} = ( () => {
            if (!e.allow_gtm)
                return {
                    forwardToGtm: null
                };
            {
                let t = !e.consent_enabled
                  , r = []
                  , a = e => {
                    window.dataLayer ??= [],
                    window.dataLayer.push(e)
                }
                  , n = async () => {
                    if (!t) {
                        let e = D.getState();
                        if ("NOT_CHECKED" === e || "CHECKING" === e)
                            await (0,
                            O.Gj)(500),
                            n();
                        else
                            for (t = !0; r.length > 0; )
                                a(r.shift())
                    }
                }
                ;
                return n(),
                {
                    forwardToGtm: e => {
                        t ? a(e) : r.push(e)
                    }
                }
            }
        }
        )()
          , l = async () => {
            if (i)
                for (; s.length > 0; ) {
                    let i = s.shift()
                      , o = await eI(t, i);
                    d?.(o),
                    z({
                        config: e,
                        scriptType: r,
                        proxy: a,
                        location: n,
                        raw: i,
                        transformed: o
                    })
                }
        }
        ;
        if (window.ElevarDataLayer.push = function(...e) {
            return c(...e),
            e.forEach(e => {
                (0,
                J.x)(e) ? (i = !0,
                s.unshift(e)) : s.push(e)
            }
            ),
            l(),
            window.ElevarDataLayer.length + e.length
        }
        ,
        l(),
        e.consent_enabled) {
            let a = Array.isArray(window.ElevarConsent);
            window.ElevarConsent ??= [];
            let n = window.ElevarConsent.push.bind(window.ElevarConsent);
            window.ElevarConsent.push = function(...e) {
                return n(...e),
                o(),
                window.ElevarConsent.length + e.length
            }
            ;
            let i = async () => {
                e.allow_gtm ? (await D.process(),
                "CHECK_TIMED_OUT" === D.getState() && await eE({
                    apexDomain: t,
                    ignoredReferrerDomains: e.ignored_referrer_domains,
                    isConsentEnabled: !1
                })) : ("AGNOSTIC" !== r && N.process(),
                e.consent_enabled && e.destinations.ga4?.some(e => !e.consentMode || 0 === e.consentMode.length) && D.process({
                    onlySetGcmState: !0
                }))
            }
            ;
            a || i()
        }
    }
      , eC = {
        consentGranted: (e, t, r) => {
            let a = e.consent
              , n = t.config.consentMode
              , i = r.lax.marketing?.consent_v2;
            if (!a.enabled || null === n)
                return !0;
            {
                let e = i ? (0,
                O.E6)(T.S.map(e => [e, i[e].update ?? i[e].default])) : (0,
                O.E6)(T.S.map(e => [e, a.fallback.includes(e)]));
                return n.every(t => e[t])
            }
        }
        ,
        getIsOnThankYouPage: e => e.location.pathname.includes("thank_you") || e.location.pathname.includes("thank-you") || e.location.pathname.includes("purchase/thanks"),
        getSearchTerm: e => {
            let t = new URLSearchParams(e.location.search);
            return t.get("q")?.toLowerCase()
        }
        ,
        getIsNewOrReturning: e => e ? 2 > Number(e) ? "new" : "returning" : "new",
        rewriteConversionValue: e => {
            switch (e) {
            case "subtotal":
                return "sub_total";
            case "revenue":
                return "revenue";
            case "product_subtotal":
                return "product_sub_total"
            }
        }
        ,
        rewriteOrderAttributeId: e => {
            switch (e) {
            case "id":
            case "order_number":
                return "id";
            case "name":
                return "order_name"
            }
        }
        ,
        rewriteProductAttributeMapping: e => {
            switch (e) {
            case "sku":
                return "id";
            case "product_id":
                return "product_id";
            case "variant_id":
                return "variant_id"
            }
        }
    }
      , eS = e => ({marketGroup: t, destinations: r, globalDetails: a}) => {
        let {id: n} = t
          , i = (r[e.key] ?? []).filter(e => e.all_markets || e.market_groups.some(e => e === n)).map(e => ({
            config: e,
            isSetup: !1
        }));
        if (!(i.length > 0))
            return null;
        {
            let {onEvent: t} = e.register({
                utils: eC,
                globalDetails: a,
                applicableInstances: i
            });
            return t
        }
    }
    ;
    function eO(...e) {
        window.dataLayer.push(arguments)
    }
    let eA = e => {
        let t = document.createElement("script");
        t.async = !0,
        t.src = `https://www.googletagmanager.com/gtag/js?id=${e}`,
        document.head.append(t),
        window.dataLayer ??= [],
        window.gtag = eO,
        eO("js", new Date)
    }
      , eT = e => {
        if ("" === e.referrer)
            return !1;
        let t = new URL(e.referrer)
          , r = e.apexDomain ? [e.apexDomain, ...e.ignoredReferrerDomains] : e.ignoredReferrerDomains
          , a = t.hostname === e.location.hostname
          , n = r.some(e => t.hostname === e || t.hostname.endsWith(`.${e}`))
          , i = ["google", "bing", "yahoo", "yandex", "duckduckgo"].some(t => e.referrer.includes(t));
        return e.referrer && !a && !n && !i
    }
      , eR = "AwinChannelCookie"
      , ek = e => {
        let t = new URLSearchParams(e.location.search).get("utm_source")
          , r = t === e.campaignSource ? "aw" : "other"
          , a = Z.Z.get(eR)
          , n = e.isNewSession || t || eT(e) ? r : a;
        n && Z.Z.set(eR, n, {
            domain: e.apexDomain ?? e.location.hostname.replace("www.", ""),
            expires: 30
        })
    }
      , eD = e => {
        let t = document.createElement("script");
        t.defer = !0,
        t.src = `https://www.dwin1.com/${e}.js`,
        t.type = "text/javascript",
        document.head.append(t)
    }
      , eN = eS({
        key: "awin",
        register: ({utils: e, globalDetails: t, applicableInstances: r}) => ({
            onEvent: a => {
                r.forEach(r => {
                    e.consentGranted(t, r, a) && !r.isSetup && (ek({
                        referrer: a.lax.page?.raw_referrer ?? "",
                        location: t.location,
                        apexDomain: t.apexDomain,
                        ignoredReferrerDomains: t.ignoredReferrerDomains,
                        campaignSource: r.config.campaignSource,
                        isNewSession: "FIRST_EVER" === a.lax.event_state || "FIRST_IN_SESSION" === a.lax.event_state
                    }),
                    eD(r.config.adAccountId),
                    r.isSetup = !0)
                }
                )
            }
        })
    })
      , eP = () => {
        if (!window.fbq) {
            window.fbq = function(...e) {
                window.fbq?.callMethod ? window.fbq.callMethod(...e) : window.fbq?.queue?.push(e)
            }
            ,
            window.fbq.push = window.fbq,
            window.fbq.loaded = !0,
            window.fbq.version = "2.0",
            window.fbq.queue = [];
            let e = document.createElement("script");
            e.async = !0,
            e.src = "https://connect.facebook.net/en_US/fbevents.js",
            document.head.append(e)
        }
    }
      , eF = (...e) => {
        window.fbq?.(...e)
    }
      , eL = eS({
        key: "facebook",
        register: ({utils: e, globalDetails: t, applicableInstances: r}) => {
            let a = null;
            return {
                onEvent: n => {
                    let i = e.getIsOnThankYouPage(t);
                    r.forEach(r => {
                        if (e.consentGranted(t, r, n)) {
                            let o = r.config.pixelId;
                            r.isSetup || (eP(),
                            "dl_user_data" === n.lax.event && (i ? a = n.lax.event_id : eF("init", o, {
                                external_id: n.lax.user_properties.user_id
                            }),
                            r.isSetup = !0),
                            "dl_purchase" === n.lax.event && (eF("init", o, {
                                external_id: n.lax.user_properties.user_id,
                                em: n.lax.user_properties.customer_email,
                                ph: n.lax.user_properties.customer_phone,
                                fn: n.lax.user_properties.customer_first_name,
                                ln: n.lax.user_properties.customer_last_name,
                                ct: n.lax.user_properties.customer_city,
                                st: n.lax.user_properties.customer_province_code,
                                zp: n.lax.user_properties.customer_zip,
                                country: n.lax.user_properties.customer_country_code
                            }),
                            r.isSetup = !0)),
                            "dl_user_data" === n.lax.event && r.config.enabledEvents.pageView && eF("trackSingle", o, "PageView", {}, {
                                eventID: i ? a : n.lax.event_id
                            }),
                            "dl_sign_up" === n.lax.event && r.config.enabledEvents.signUp && eF("trackSingle", o, "CompleteRegistration", {}, {
                                eventID: n.lax.event_id
                            });
                            let c = e.rewriteProductAttributeMapping(r.config.dataConfig.productAttributeMapping);
                            "dl_view_item_list" === n.lax.event && r.config.enabledEvents.viewItemList && eF("trackSingleCustom", o, "ViewCategory", {
                                content_name: t.location.pathname,
                                contents: n.loose.ecommerce?.impressions?.map(e => ({
                                    id: e[c],
                                    name: e.name,
                                    content_category: e.category,
                                    item_price: e.price,
                                    quantity: e.quantity
                                })),
                                content_ids: n.lax.ecommerce.impressions.map(e => e[c]),
                                content_type: r.config.dataConfig.contentType,
                                currency: n.lax.ecommerce.currencyCode
                            }, {
                                eventID: n.lax.event_id
                            }),
                            "dl_view_search_results" === n.lax.event && r.config.enabledEvents.viewSearchResults && eF("trackSingle", o, "Search", {
                                search_string: e.getSearchTerm(t),
                                contents: n.loose.ecommerce?.impressions?.map(e => ({
                                    id: e[c],
                                    name: e.name,
                                    content_category: e.category,
                                    item_price: e.price,
                                    quantity: e.quantity
                                })),
                                content_ids: n.lax.ecommerce.impressions.map(e => e[c]),
                                content_type: r.config.dataConfig.contentType,
                                currency: n.lax.ecommerce.currencyCode
                            }, {
                                eventID: n.lax.event_id
                            }),
                            "dl_view_item" === n.lax.event && r.config.enabledEvents.viewItem && eF("trackSingle", o, "ViewContent", {
                                content_name: n.lax.ecommerce.detail.products[0]?.name,
                                contents: n.loose.ecommerce?.detail?.products.map(e => ({
                                    id: e[c],
                                    name: e.name,
                                    content_category: e.category,
                                    item_price: e.price,
                                    quantity: e.quantity
                                })),
                                content_category: n.lax.ecommerce.detail.products[0]?.category,
                                content_ids: n.lax.ecommerce.detail.products[0]?.[c],
                                content_type: r.config.dataConfig.contentType,
                                value: n.lax.ecommerce.detail.products[0]?.price,
                                currency: n.lax.ecommerce.currencyCode
                            }, {
                                eventID: n.lax.event_id
                            }),
                            "dl_add_to_cart" === n.lax.event && r.config.enabledEvents.addToCart && eF("trackSingle", o, "AddToCart", {
                                content_name: n.lax.ecommerce.add.products[0]?.name,
                                contents: n.lax.ecommerce.add.products.map(e => ({
                                    id: e[c],
                                    name: e.name,
                                    content_category: e.category,
                                    item_price: e.price,
                                    quantity: e.quantity
                                })),
                                content_ids: n.lax.ecommerce.add.products[0]?.[c],
                                content_type: r.config.dataConfig.contentType,
                                value: n.lax.ecommerce.add.products[0]?.price,
                                content_category: n.lax.ecommerce.add.products[0]?.category,
                                currency: n.lax.ecommerce.currencyCode
                            }, {
                                eventID: n.lax.event_id
                            });
                            let s = e => {
                                ("dl_begin_checkout" === n.lax.event || "dl_add_payment_info" === n.lax.event) && eF("trackSingle", o, e, {
                                    content_name: n.lax.ecommerce.checkout.products.map(e => e.name).join(","),
                                    contents: n.lax.ecommerce.checkout.products.map(e => ({
                                        id: e[c],
                                        name: e.name,
                                        content_category: e.category,
                                        item_price: e.price,
                                        quantity: e.quantity
                                    })),
                                    content_ids: n.lax.ecommerce.checkout.products.map(e => e[c]),
                                    content_type: r.config.dataConfig.contentType,
                                    value: n.loose.cart_total,
                                    content_category: n.lax.ecommerce.checkout.products.map(e => e.category).join(","),
                                    currency: n.lax.ecommerce.currencyCode
                                }, {
                                    eventID: n.lax.event_id
                                })
                            }
                            ;
                            "dl_begin_checkout" === n.lax.event && r.config.enabledEvents.beginCheckout && s("InitiateCheckout"),
                            "dl_add_payment_info" === n.lax.event && r.config.enabledEvents.addPaymentInfo && s("AddPaymentInfo");
                            let d = t => {
                                "dl_purchase" === n.lax.event && eF("trackSingle", o, t, {
                                    content_name: n.lax.ecommerce.purchase.products.map(e => e.name).join(","),
                                    contents: n.lax.ecommerce.purchase.products.map(e => ({
                                        id: e[c],
                                        name: e.name,
                                        content_category: e.category,
                                        item_price: e.price,
                                        quantity: e.quantity
                                    })),
                                    content_ids: n.lax.ecommerce.purchase.products.map(e => e[c]),
                                    content_type: r.config.dataConfig.contentType,
                                    value: n.lax.ecommerce.purchase.actionField[e.rewriteConversionValue(r.config.dataConfig.conversionValue)],
                                    content_category: n.lax.ecommerce.purchase.products.map(e => e.category).join(","),
                                    currency: n.lax.ecommerce.currencyCode,
                                    order_id: n.lax.ecommerce.purchase.actionField.id,
                                    customer_type: e.getIsNewOrReturning(n.lax.user_properties.customer_order_count ?? null)
                                }, {
                                    eventID: "Subscribe" === t ? `sub_${n.lax.ecommerce.purchase.actionField.id}` : n.lax.ecommerce.purchase.actionField.id
                                })
                            }
                            ;
                            "dl_purchase" === n.lax.event && r.config.enabledEvents.purchase && d("Purchase"),
                            "dl_purchase" === n.lax.event && r.config.enabledEvents.subscriptionPurchase && n.lax.ecommerce.purchase.products.some(e => "one-time" !== e.selling_plan_name) && d("Subscribe"),
                            "dl_subscribe" === n.lax.event && r.config.enabledEvents.emailSubscribe && "email" === n.lax.lead_type && eF("trackSingle", o, "Lead", {}, {
                                eventID: n.lax.event_id
                            }),
                            "dl_subscribe" === n.lax.event && r.config.enabledEvents.smsSubscribe && "phone" === n.lax.lead_type && eF("trackSingleCustom", o, "SMSSignup", {}, {
                                eventID: n.lax.event_id
                            })
                        }
                    }
                    )
                }
            }
        }
    })
      , eq = () => {
        let e = []
          , t = null;
        return {
            gtagGcmEnqueue: r => {
                let a = D.getState();
                "NOT_CHECKED" === a || "CHECKING" === a ? (e.push(r),
                t ??= setInterval( () => {
                    let r = D.getState();
                    if ("PRESENT" === r)
                        for (; e.length > 0; )
                            eO(...e.shift());
                    ("CHECK_TIMED_OUT" === r || 0 === e.length) && clearInterval(t)
                }
                , 500)) : "PRESENT" === a && eO(...r)
            }
        }
    }
      , eM = eS({
        key: "ga4",
        register: ({utils: e, globalDetails: t, applicableInstances: r}) => {
            let {gtagGcmEnqueue: a} = eq();
            return {
                onEvent: n => {
                    r.forEach(r => {
                        if (e.consentGranted(t, r, n)) {
                            let i = r.config.measurementId
                              , o = t.consent.enabled && (!r.config.consentMode || 0 === r.config.consentMode.length)
                              , c = (...e) => {
                                if (!o)
                                    return eO(...e);
                                a(e)
                            }
                            ;
                            r.isSetup || (t.state.isGtagSetup || (eA(i),
                            t.state.isGtagSetup = !0),
                            c("set", "developer_id.dMjE2OD", !0),
                            r.isSetup = !0),
                            "dl_user_data" === n.lax.event && c("config", i, {
                                send_page_view: r.config.enabledEvents.pageView ?? !1,
                                user_id: n.lax.user_properties.user_id,
                                visitor_type: n.lax.user_properties.visitor_type,
                                user_properties: {
                                    shop_customer_id: n.loose.user_properties?.customer_id
                                }
                            }),
                            "dl_sign_up" === n.lax.event && r.config.enabledEvents.signUp && c("event", "sign_up", {
                                send_to: i
                            }),
                            "dl_login" === n.lax.event && r.config.enabledEvents.login && c("event", "login", {
                                send_to: i
                            });
                            let s = e.rewriteProductAttributeMapping(r.config.dataConfig.productAttributeMapping)
                              , d = e.rewriteOrderAttributeId(r.config.dataConfig.orderAttributeId);
                            if (("dl_view_item_list" === n.lax.event && r.config.enabledEvents.viewItemList || "dl_view_search_results" === n.lax.event && r.config.enabledEvents.viewSearchResults) && (c("event", "view_item_list", {
                                send_to: i,
                                item_list_name: t.location.pathname,
                                item_list_id: t.location.pathname,
                                items: n.lax.ecommerce.impressions.map(e => ({
                                    item_id: e[s],
                                    item_variant_id: e.variant_id,
                                    item_product_id: e.product_id,
                                    index: e.position,
                                    item_list_name: e.list,
                                    item_list_id: e.list,
                                    item_name: e,
                                    item_brand: e.brand,
                                    item_category: e.category,
                                    price: e.price
                                }))
                            }),
                            "dl_view_search_results" === n.lax.event && r.config.enabledEvents.viewSearchResults && c("event", "search_results", {
                                send_to: i,
                                search_query: e.getSearchTerm(t)
                            })),
                            "dl_select_item" === n.lax.event && r.config.enabledEvents.selectItem && c("event", "select_item", {
                                send_to: i,
                                item_list_name: t.location.pathname,
                                item_list_id: t.location.pathname,
                                items: n.lax.ecommerce.click.products.map(e => ({
                                    item_id: e[s],
                                    item_variant_id: e.variant_id,
                                    item_product_id: e.product_id,
                                    index: e.position,
                                    item_list_name: e.list,
                                    item_list_id: e.list,
                                    item_name: e.name,
                                    item_brand: e.brand,
                                    item_category: e.category,
                                    price: e.price
                                }))
                            }),
                            "dl_view_item" === n.lax.event && r.config.enabledEvents.viewItem && c("event", "view_item", {
                                send_to: i,
                                currency: n.lax.ecommerce.currencyCode,
                                value: n.lax.ecommerce.detail.products[0]?.price,
                                items: n.lax.ecommerce.detail.products.map(e => ({
                                    item_id: e[s],
                                    item_variant_id: e.variant_id,
                                    item_product_id: e.product_id,
                                    item_list_name: e.list,
                                    item_list_id: e.list,
                                    item_name: e.name,
                                    item_brand: e.brand,
                                    item_category: e.category,
                                    item_variant: e.variant,
                                    price: e.price
                                }))
                            }),
                            "dl_add_to_cart" === n.lax.event && r.config.enabledEvents.addToCart) {
                                let e = Number(n.lax.ecommerce.add.products[0]?.price) * Number(n.lax.ecommerce.add.products[0]?.quantity);
                                c("event", "add_to_cart", {
                                    send_to: i,
                                    currency: n.lax.ecommerce.currencyCode,
                                    value: e,
                                    items: n.lax.ecommerce.add.products.map(e => ({
                                        item_id: e[s],
                                        item_variant_id: e.variant_id,
                                        item_product_id: e.product_id,
                                        item_list_name: e.list,
                                        item_list_id: e.list,
                                        item_name: e.name,
                                        item_brand: e.brand,
                                        item_category: e.category,
                                        item_variant: e.variant,
                                        quantity: e.quantity,
                                        price: e.price
                                    }))
                                })
                            }
                            if ("dl_view_cart" === n.lax.event && r.config.enabledEvents.viewCart && c("event", "view_cart", {
                                send_to: i,
                                currency: n.lax.ecommerce.currencyCode,
                                value: n.lax.cart_total,
                                items: n.loose.ecommerce?.impressions?.map(e => ({
                                    item_id: e[s],
                                    item_variant_id: e.variant_id,
                                    item_product_id: e.product_id,
                                    item_list_name: e.list,
                                    item_list_id: e.list,
                                    item_name: e.name,
                                    item_brand: e.brand,
                                    item_category: e.category,
                                    item_variant: e.variant,
                                    quantity: e.quantity,
                                    price: e.price
                                }))
                            }),
                            "dl_remove_from_cart" === n.lax.event && r.config.enabledEvents.removeFromCart) {
                                let e = Number(n.lax.ecommerce.remove.products[0]?.price) * Number(n.lax.ecommerce.remove.products[0]?.quantity);
                                c("event", "remove_from_cart", {
                                    send_to: i,
                                    currency: n.lax.ecommerce.currencyCode,
                                    value: e,
                                    items: n.lax.ecommerce.remove.products.map(e => ({
                                        item_id: e[s],
                                        item_variant_id: e.variant_id,
                                        item_product_id: e.product_id,
                                        item_list_name: e.list,
                                        item_list_id: e.list,
                                        item_name: e.name,
                                        item_brand: e.brand,
                                        item_category: e.category,
                                        item_variant: e.variant,
                                        quantity: e.quantity,
                                        price: e.price
                                    }))
                                })
                            }
                            "dl_begin_checkout" === n.lax.event && r.config.enabledEvents.beginCheckout && c("event", "begin_checkout", {
                                send_to: i,
                                currency: n.lax.ecommerce.currencyCode,
                                value: n.loose.cart_total,
                                items: n.lax.ecommerce.checkout.products.map(e => ({
                                    item_id: e[s],
                                    item_variant_id: e.variant_id,
                                    item_product_id: e.product_id,
                                    item_list_name: e.list,
                                    item_list_id: e.list,
                                    item_name: e.name,
                                    item_brand: e.brand,
                                    item_category: e.category,
                                    item_variant: e.variant,
                                    quantity: e.quantity,
                                    price: e.price
                                }))
                            }),
                            "dl_add_shipping_info" === n.lax.event && r.config.enabledEvents.addShippingInfo && c("event", "add_shipping_info", {
                                send_to: i,
                                currency: n.lax.ecommerce.currencyCode,
                                value: n.loose.cart_total,
                                shipping_tier: n.lax.ecommerce.checkout.actionField.shipping_tier,
                                items: n.lax.ecommerce.checkout.products.map(e => ({
                                    item_id: e[s],
                                    item_variant_id: e.variant_id,
                                    item_product_id: e.product_id,
                                    item_list_name: e.list,
                                    item_list_id: e.list,
                                    item_name: e.name,
                                    item_brand: e.brand,
                                    item_category: e.category,
                                    item_variant: e.variant,
                                    quantity: e.quantity,
                                    price: e.price
                                }))
                            }),
                            "dl_add_payment_info" === n.lax.event && r.config.enabledEvents.addPaymentInfo && c("event", "add_payment_info", {
                                send_to: i,
                                currency: n.lax.ecommerce.currencyCode,
                                value: n.loose.cart_total,
                                shipping_tier: n.lax.ecommerce.checkout.actionField.shipping_tier,
                                items: n.lax.ecommerce.checkout.products.map(e => ({
                                    item_id: e[s],
                                    item_variant_id: e.variant_id,
                                    item_product_id: e.product_id,
                                    item_list_name: e.list,
                                    item_list_id: e.list,
                                    item_name: e.name,
                                    item_brand: e.brand,
                                    item_category: e.category,
                                    item_variant: e.variant,
                                    quantity: e.quantity,
                                    price: e.price
                                }))
                            }),
                            "dl_purchase" === n.lax.event && r.config.enabledEvents.purchase && c("event", "purchase", {
                                send_to: i,
                                currency: n.lax.ecommerce.currencyCode,
                                value: n.lax.ecommerce.purchase.actionField[e.rewriteConversionValue(r.config.dataConfig.conversionValue)],
                                shipping_tier: n.lax.ecommerce.purchase.actionField.shipping_tier,
                                items: n.lax.ecommerce.purchase.products.map(e => ({
                                    item_id: e[s],
                                    item_variant_id: e.variant_id,
                                    item_product_id: e.product_id,
                                    item_list_name: e.list,
                                    item_list_id: e.list,
                                    item_name: e.name,
                                    item_brand: e.brand,
                                    item_category: e.category,
                                    item_variant: e.variant,
                                    quantity: e.quantity,
                                    price: e.price
                                })),
                                transaction_id: n.lax.ecommerce.purchase.actionField[d],
                                tax: n.lax.ecommerce.purchase.actionField.tax,
                                shipping: n.lax.ecommerce.purchase.actionField.shipping,
                                coupon: n.lax.ecommerce.purchase.actionField.coupon,
                                user_properties: {
                                    shop_customer_id: n.loose.user_properties?.customer_id
                                }
                            }),
                            "dl_subscribe" === n.lax.event && r.config.enabledEvents.emailSubscribe && "email" === n.lax.lead_type && c("event", "email_signup", {
                                send_to: i
                            }),
                            "dl_subscribe" === n.lax.event && r.config.enabledEvents.smsSubscribe && "phone" === n.lax.lead_type && c("event", "sms_signup", {
                                send_to: i
                            })
                        }
                    }
                    )
                }
            }
        }
    })
      , ej = eS({
        key: "google_ads",
        register: ({utils: e, globalDetails: t, applicableInstances: r}) => {
            let a = new Set
              , n = new Set;
            return {
                onEvent: i => {
                    r.forEach(r => {
                        if (e.consentGranted(t, r, i)) {
                            let e = `AW-${r.config.conversionId}`;
                            r.isSetup || (t.state.isGtagSetup || (eA(e),
                            t.state.isGtagSetup = !0),
                            eO("config", e),
                            r.isSetup = !0);
                            let o = i.loose.user_properties;
                            (!a.has(r.config.id) && o?.customer_email?.includes("@") || !n.has(r.config.id) && o?.customer_phone?.match(/.*\d+.*/)) && (eO("set", "user_data", {
                                email: o.customer_email,
                                phone_number: o.customer_phone,
                                address: {
                                    first_name: o.customer_first_name,
                                    last_name: o.customer_last_name,
                                    street: o.customer_address_1,
                                    city: o.customer_city,
                                    region: o.customer_province,
                                    postal_code: o.customer_zip,
                                    country: o.customer_country_code
                                }
                            }),
                            eO("event", "form_submit", {
                                send_to: e
                            }),
                            o.customer_email && a.add(r.config.id),
                            o.customer_phone && n.add(r.config.id))
                        }
                    }
                    )
                }
            }
        }
    });
    var eU = n(343);
    function eG(...e) {
        return (0,
        eU.a)(eK, e)
    }
    var eK = (e, t) => {
        let r = e.entries()
          , a = r.next();
        if (a.done)
            return 0;
        let {value: [,n]} = a
          , i = t(n, 0, e);
        for (let[a,n] of r)
            i += t(n, a, e);
        return i
    }
    ;
    let eV = () => {
        if (!window.pintrk) {
            window.pintrk = function(...e) {
                window.pintrk?.queue?.push(e)
            }
            ,
            window.pintrk.version = "3.0",
            window.pintrk.queue = [];
            let e = document.createElement("script");
            e.async = !0,
            e.src = "https://s.pinimg.com/ct/core.js",
            document.head.append(e)
        }
    }
      , e$ = (...e) => {
        window.pintrk?.(...e)
    }
      , eB = eS({
        key: "pinterest",
        register: ({utils: e, globalDetails: t, applicableInstances: r}) => ({
            onEvent: a => {
                r.forEach(r => {
                    if (e.consentGranted(t, r, a)) {
                        if (r.isSetup || (eV(),
                        a.loose.user_properties?.customer_email ? e$("load", r.config.tagId, {
                            em: a.loose.user_properties.customer_email
                        }) : e$("load", r.config.tagId),
                        e$("page"),
                        r.isSetup = !0),
                        "dl_user_data" === a.lax.event && r.config.enabledEvents.pageView && !t.location.pathname.includes("/products/") && e$("track", "pagevisit", {
                            event_id: a.lax.event_id
                        }),
                        "dl_sign_up" === a.lax.event && r.config.enabledEvents.signUp && e$("track", "signup", {
                            event_id: a.lax.event_id,
                            lead_type: "account"
                        }),
                        "dl_view_item_list" === a.lax.event && r.config.enabledEvents.viewItemList && e$("track", "viewcategory", {
                            event_id: a.lax.event_id,
                            category_name: t.document.title,
                            line_items: a.loose.ecommerce?.impressions?.map(e => ({
                                product_name: e.name,
                                product_variant: e.variant,
                                product_id: e.product_id,
                                product_variant_id: e.variant_id,
                                product_category: e.category,
                                product_brand: e.brand,
                                product_price: e.price,
                                product_quantity: e.quantity
                            }))
                        }),
                        "dl_view_search_results" === a.lax.event && r.config.enabledEvents.viewSearchResults && e$("track", "search", {
                            event_id: a.lax.event_id,
                            search_query: e.getSearchTerm(t),
                            line_items: a.loose.ecommerce?.impressions?.map(e => ({
                                product_name: e.name,
                                product_variant: e.variant,
                                product_id: e.product_id,
                                product_variant_id: e.variant_id,
                                product_category: e.category,
                                product_brand: e.brand,
                                product_price: e.price,
                                product_quantity: e.quantity
                            }))
                        }),
                        "dl_view_item" === a.lax.event && r.config.enabledEvents.viewItem && e$("track", "pagevisit", {
                            event_id: a.lax.event_id,
                            currency: a.lax.ecommerce.currencyCode,
                            line_items: a.loose.ecommerce?.detail?.products.map(e => ({
                                product_name: e.name,
                                product_variant: e.variant,
                                product_id: e.product_id,
                                product_variant_id: e.variant_id,
                                product_category: e.category,
                                product_brand: e.brand,
                                product_price: e.price,
                                product_quantity: e.quantity
                            }))
                        }),
                        "dl_add_to_cart" === a.lax.event && r.config.enabledEvents.addToCart) {
                            let e = Number(a.lax.ecommerce.add.products[0]?.price) * Number(a.lax.ecommerce.add.products[0]?.quantity);
                            e$("track", "addtocart", {
                                event_id: a.lax.event_id,
                                value: e,
                                order_quantity: a.lax.ecommerce.add.products[0]?.quantity,
                                currency: a.lax.ecommerce.currencyCode,
                                line_items: a.lax.ecommerce.add.products.map(e => ({
                                    product_name: e.name,
                                    product_variant: e.variant,
                                    product_id: e.product_id,
                                    product_variant_id: e.variant_id,
                                    product_category: e.category,
                                    product_brand: e.brand,
                                    product_price: e.price,
                                    product_quantity: e.quantity
                                }))
                            })
                        }
                        "dl_purchase" === a.lax.event && r.config.enabledEvents.purchase && (e$("load", r.config.tagId, {
                            em: a.lax.user_properties.customer_email
                        }),
                        e$("track", "checkout", {
                            event_id: a.lax.ecommerce.purchase.actionField.id,
                            value: a.lax.ecommerce.purchase.actionField[e.rewriteConversionValue(r.config.dataConfig.conversionValue)],
                            order_quantity: eG(a.lax.ecommerce.purchase.products, e => Number(e.quantity)),
                            currency: a.lax.ecommerce.currencyCode,
                            order_id: a.lax.ecommerce.purchase.actionField.id,
                            line_items: a.lax.ecommerce.purchase.products.map(e => ({
                                product_name: e.name,
                                product_variant: e.variant,
                                product_id: e.product_id,
                                product_variant_id: e.variant_id,
                                product_category: e.category,
                                product_brand: e.brand,
                                product_price: e.price,
                                product_quantity: e.quantity
                            }))
                        })),
                        "dl_subscribe" === a.lax.event && r.config.enabledEvents.emailSubscribe && "email" === a.lax.lead_type && e$("track", "lead", {
                            event_id: a.lax.event_id,
                            lead_type: "newsletter"
                        })
                    }
                }
                )
            }
        })
    })
      , eW = () => {
        if (!window.rdt) {
            window.rdt = function(...e) {
                window.rdt?.sendEvent ? window.rdt.sendEvent(...e) : window.rdt?.callQueue?.push(e)
            }
            ,
            window.rdt.callQueue = [];
            let e = document.createElement("script");
            e.async = !0,
            e.src = "https://www.redditstatic.com/ads/pixel.js",
            document.head.append(e)
        }
    }
      , eH = (...e) => {
        window.rdt?.(...e)
    }
      , eY = eS({
        key: "reddit",
        register: ({utils: e, globalDetails: t, applicableInstances: r}) => ({
            onEvent: a => {
                r.forEach(r => {
                    if (e.consentGranted(t, r, a)) {
                        r.isSetup || (eW(),
                        r.isSetup = !0),
                        eH("init", r.config.pixelId, {
                            externalId: a.loose.user_properties?.user_id
                        }),
                        "dl_user_data" === a.lax.event && r.config.enabledEvents.pageView && eH("track", "PageVisit", {
                            conversionId: a.lax.event_id
                        });
                        let t = e.rewriteProductAttributeMapping(r.config.dataConfig.productAttributeMapping);
                        if ("dl_view_search_results" === a.lax.event && r.config.enabledEvents.viewSearchResults && eH("track", "Search", {
                            conversionId: a.lax.event_id,
                            products: a.lax.ecommerce.impressions.map(e => ({
                                id: e[t],
                                name: e.name,
                                category: e.category
                            }))
                        }),
                        "dl_view_item" === a.lax.event && r.config.enabledEvents.viewItem && eH("track", "ViewContent", {
                            conversionId: a.lax.event_id,
                            products: a.lax.ecommerce.detail.products.map(e => ({
                                id: e[t],
                                name: e.name,
                                category: e.category
                            }))
                        }),
                        "dl_add_to_cart" === a.lax.event && r.config.enabledEvents.addToCart) {
                            let e = Number(a.lax.ecommerce.add.products[0]?.price) * Number(a.lax.ecommerce.add.products[0]?.quantity);
                            eH("track", "AddToCart", {
                                conversionId: a.lax.event_id,
                                value: e,
                                itemCount: a.lax.ecommerce.add.products[0]?.quantity,
                                currency: a.lax.ecommerce.currencyCode,
                                products: a.lax.ecommerce.add.products.map(e => ({
                                    id: e[t],
                                    name: e.name,
                                    category: e.category
                                }))
                            })
                        }
                        "dl_purchase" === a.lax.event && r.config.enabledEvents.purchase && eH("track", "Purchase", {
                            conversionId: a.lax.ecommerce.purchase.actionField.id,
                            value: a.lax.ecommerce.purchase.actionField[e.rewriteConversionValue(r.config.dataConfig.conversionValue)],
                            itemCount: eG(a.lax.ecommerce.purchase.products, e => Number(e.quantity)),
                            currency: a.lax.ecommerce.currencyCode,
                            products: a.lax.ecommerce.purchase.products.map(e => ({
                                id: e[t],
                                name: e.name,
                                category: e.category
                            })),
                            transactionId: a.lax.ecommerce.purchase.actionField.id.toString(),
                            email: a.lax.user_properties.customer_email,
                            phoneNumber: a.lax.user_properties.customer_phone
                        }),
                        "dl_subscribe" === a.lax.event && r.config.enabledEvents.emailSubscribe && "email" === a.lax.lead_type && eH("track", "SignUp", {
                            conversionId: a.lax.event_id,
                            email: a.lax.user_properties.customer_email
                        }),
                        "dl_subscribe" === a.lax.event && r.config.enabledEvents.smsSubscribe && "phone" === a.lax.lead_type && eH("track", "Lead", {
                            conversionId: a.lax.event_id,
                            phoneNumber: a.lax.user_properties.customer_phone
                        })
                    }
                }
                )
            }
        })
    })
      , eX = () => {
        if (!window.snaptr) {
            window.snaptr = function(...e) {
                window.snaptr?.handleRequest ? window.snaptr.handleRequest(...e) : window.snaptr?.queue?.push(e)
            }
            ,
            window.snaptr.queue = [];
            let e = document.createElement("script");
            e.async = !0,
            e.src = "https://sc-static.net/scevent.min.js",
            document.head.append(e)
        }
    }
      , ez = (...e) => {
        window.snaptr?.(...e)
    }
      , eJ = eS({
        key: "snapchat",
        register: ({utils: e, globalDetails: t, applicableInstances: r}) => {
            let a = null;
            return {
                onEvent: n => {
                    let i = e.getIsOnThankYouPage(t);
                    r.forEach(r => {
                        if (e.consentGranted(t, r, n)) {
                            let o = r.config.pixelId;
                            r.isSetup || (eX(),
                            "dl_user_data" === n.lax.event && (i ? a = n.lax.event_id : ez("init", o, {
                                user_email: n.lax.user_properties.customer_email ?? ""
                            }),
                            r.isSetup = !0),
                            "dl_purchase" === n.lax.event && (ez("init", o, {
                                user_email: n.lax.user_properties.customer_email ?? "",
                                user_phone_number: n.lax.user_properties.customer_phone ?? "",
                                firstname: n.lax.user_properties.customer_first_name ?? "",
                                lastname: n.lax.user_properties.customer_last_name ?? "",
                                geo_city: n.lax.user_properties.customer_city ?? "",
                                geo_region: n.lax.user_properties.customer_province_code ?? "",
                                geo_postal_code: n.lax.user_properties.customer_zip ?? "",
                                geo_country: n.lax.user_properties.customer_country_code ?? ""
                            }),
                            r.isSetup = !0)),
                            "dl_user_data" === n.lax.event && r.config.enabledEvents.pageView && ez("track", "PAGE_VIEW", {
                                client_dedup_id: i ? a : n.lax.event_id
                            }),
                            "dl_sign_up" === n.lax.event && r.config.enabledEvents.signUp && ez("track", "SIGN_UP", {
                                client_dedup_id: n.lax.event_id
                            }),
                            "dl_login" === n.lax.event && r.config.enabledEvents.login && ez("track", "LOGIN", {
                                client_dedup_id: n.lax.event_id
                            });
                            let c = e.rewriteProductAttributeMapping(r.config.dataConfig.productAttributeMapping);
                            "dl_view_item_list" === n.lax.event && r.config.enabledEvents.viewItemList && ez("track", "LIST_VIEW", {
                                item_ids: n.lax.ecommerce.impressions.map(e => e[c]).join(", "),
                                item_category: n.lax.ecommerce.impressions.map(e => e.product_id).join(", "),
                                currency: n.lax.ecommerce.currencyCode,
                                client_dedup_id: n.lax.event_id
                            }),
                            "dl_view_search_results" === n.lax.event && r.config.enabledEvents.viewSearchResults && ez("track", "SEARCH", {
                                search_string: e.getSearchTerm(t),
                                client_dedup_id: n.lax.event_id
                            }),
                            "dl_view_item" === n.lax.event && r.config.enabledEvents.viewItem && ez("track", "VIEW_CONTENT", {
                                item_ids: n.lax.ecommerce.detail.products[0]?.[c],
                                item_category: n.lax.ecommerce.detail.products[0]?.product_id,
                                description: n.lax.ecommerce.detail.products[0]?.name,
                                price: n.lax.ecommerce.detail.products[0]?.price,
                                currency: n.lax.ecommerce.currencyCode,
                                client_dedup_id: n.lax.event_id
                            }),
                            "dl_add_to_cart" === n.lax.event && r.config.enabledEvents.addToCart && ez("track", "ADD_CART", {
                                item_ids: n.lax.ecommerce.add.products.map(e => e[c]).join(", "),
                                item_category: n.lax.ecommerce.add.products[0]?.product_id,
                                description: n.lax.ecommerce.add.products[0]?.name,
                                price: n.lax.ecommerce.add.products[0]?.price,
                                number_items: n.lax.ecommerce.add.products[0]?.quantity,
                                currency: n.lax.ecommerce.currencyCode,
                                client_dedup_id: n.lax.event_id
                            });
                            let s = e => {
                                ("dl_begin_checkout" === n.lax.event || "dl_add_payment_info" === n.lax.event) && ez("track", e, {
                                    item_ids: n.lax.ecommerce.checkout.products.map(e => e[c]).join(", "),
                                    item_category: n.lax.ecommerce.checkout.products.map(e => e.product_id).join(", "),
                                    price: n.loose.cart_total,
                                    number_items: eG(n.lax.ecommerce.checkout.products, e => Number(e.quantity)),
                                    currency: n.lax.ecommerce.currencyCode,
                                    client_dedup_id: n.lax.event_id
                                })
                            }
                            ;
                            "dl_begin_checkout" === n.lax.event && r.config.enabledEvents.beginCheckout && s("START_CHECKOUT"),
                            "dl_add_payment_info" === n.lax.event && r.config.enabledEvents.addPaymentInfo && s("ADD_BILLING");
                            let d = t => {
                                "dl_purchase" === n.lax.event && ez("track", t, {
                                    item_ids: n.lax.ecommerce.purchase.products.map(e => e[c]).join(", "),
                                    item_category: n.lax.ecommerce.purchase.products.map(e => e.product_id).join(", "),
                                    price: n.lax.ecommerce.purchase.actionField[e.rewriteConversionValue(r.config.dataConfig.conversionValue)],
                                    ..."PURCHASE" === t ? {
                                        number_items: eG(n.lax.ecommerce.purchase.products, e => Number(e.quantity))
                                    } : {},
                                    currency: n.lax.ecommerce.currencyCode,
                                    customer_status: e.getIsNewOrReturning(n.lax.user_properties.customer_order_count ?? null),
                                    transaction_id: n.lax.ecommerce.purchase.actionField.id,
                                    client_dedup_id: "SUBSCRIBE" === t ? `sub_${n.lax.ecommerce.purchase.actionField.id}` : n.lax.ecommerce.purchase.actionField.id
                                })
                            }
                            ;
                            "dl_purchase" === n.lax.event && r.config.enabledEvents.purchase && d("PURCHASE"),
                            "dl_purchase" === n.lax.event && r.config.enabledEvents.subscriptionPurchase && n.lax.ecommerce.purchase.products.some(e => "one-time" !== e.selling_plan_name) && d("SUBSCRIBE")
                        }
                    }
                    )
                }
            }
        }
    })
      , eZ = () => {
        window.TiktokAnalyticsObject = "ttq",
        window.ttq || (window.ttq ??= [],
        window.ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"],
        window.ttq.setAndDefer = (e, t) => {
            e[t] = (...r) => e.push([t, ...r])
        }
        ,
        window.ttq.methods.forEach(e => {
            window.ttq?.setAndDefer?.(window.ttq, e)
        }
        ),
        window.ttq.instance = e => {
            let t = window.ttq?._i?.[e] ?? [];
            return window.ttq?.methods?.forEach(e => {
                window.ttq?.setAndDefer?.(t, e)
            }
            ),
            t
        }
        ,
        window.ttq.load = (e, t) => {
            let r = "https://analytics.tiktok.com/i18n/pixel/events.js";
            window.ttq._i ??= {},
            window.ttq._i[e] = [],
            window.ttq._i[e]._u = r,
            window.ttq._t ??= {},
            window.ttq._t[e] = Date.now(),
            window.ttq._o ??= {},
            window.ttq._o[e] = t ?? {},
            window.ttq._partner ??= "Elevar";
            let a = document.createElement("script");
            a.async = !0,
            a.src = `${r}?sdkid=${e}&lib=ttq`,
            a.type = "text/javascript",
            document.head.append(a)
        }
        )
    }
      , eQ = () => window.ttq
      , e0 = [eM, eL, eS({
        key: "tiktok",
        register: ({utils: e, globalDetails: t, applicableInstances: r}) => ({
            onEvent: a => {
                r.forEach(r => {
                    if (e.consentGranted(t, r, a)) {
                        let n = r.config.pixelId;
                        r.isSetup || (eZ(),
                        eQ().load(n),
                        eQ().page(),
                        r.isSetup = !0);
                        let i = eQ().instance(n);
                        a.loose.user_properties?.customer_email && eQ().identify({
                            external_id: a.loose.user_properties.customer_id,
                            email: a.loose.user_properties.customer_email,
                            ..."dl_purchase" === a.lax.event ? {
                                phone_number: a.lax.user_properties.customer_phone
                            } : {}
                        }),
                        "dl_sign_up" === a.lax.event && r.config.enabledEvents.signUp && i.track("CompleteRegistration", {}, {
                            event_id: a.lax.event_id
                        });
                        let o = e.rewriteProductAttributeMapping(r.config.dataConfig.productAttributeMapping);
                        if ("dl_view_item_list" === a.lax.event && r.config.enabledEvents.viewItemList && i.track("ViewContent", {
                            content_type: r.config.dataConfig.contentType,
                            contents: a.loose.ecommerce?.impressions?.map(e => ({
                                content_name: e.name,
                                content_category: e.category,
                                content_id: e[o],
                                price: e.price,
                                quantity: e.quantity,
                                brand: e.brand
                            })),
                            currency: a.lax.ecommerce.currencyCode,
                            value: eG(a.lax.ecommerce.impressions, e => Number(e.price)),
                            description: t.document.title
                        }, {
                            event_id: a.lax.event_id
                        }),
                        "dl_view_search_results" === a.lax.event && r.config.enabledEvents.viewSearchResults && i.track("Search", {
                            query: e.getSearchTerm(t)
                        }, {
                            event_id: a.lax.event_id
                        }),
                        "dl_view_item" === a.lax.event && r.config.enabledEvents.viewItem) {
                            let e = a.lax.ecommerce.detail.products[0];
                            i.track("ViewContent", {
                                content_type: r.config.dataConfig.contentType,
                                contents: [{
                                    content_name: e?.name,
                                    content_category: e?.category,
                                    content_id: e?.[o],
                                    price: e?.price,
                                    quantity: 1,
                                    brand: e?.brand
                                }],
                                currency: a.lax.ecommerce.currencyCode,
                                value: e?.price,
                                description: t.document.title
                            }, {
                                event_id: a.lax.event_id
                            })
                        }
                        if ("dl_add_to_cart" === a.lax.event && r.config.enabledEvents.addToCart) {
                            let e = a.lax.ecommerce.add.products[0];
                            i.track("AddToCart", {
                                content_type: r.config.dataConfig.contentType,
                                contents: [{
                                    content_name: e?.name,
                                    content_category: e?.category,
                                    content_id: e?.[o],
                                    price: e?.price,
                                    quantity: e?.quantity,
                                    brand: e?.brand
                                }],
                                currency: a.lax.ecommerce.currencyCode,
                                value: Number(e?.price) * Number(e?.quantity),
                                description: t.document.title
                            }, {
                                event_id: a.lax.event_id
                            })
                        }
                        let c = e => {
                            ("dl_begin_checkout" === a.lax.event || "dl_add_payment_info" === a.lax.event) && i.track(e, {
                                content_type: r.config.dataConfig.contentType,
                                contents: a.lax.ecommerce.checkout.products.map(e => ({
                                    content_name: e.name,
                                    content_category: e.category,
                                    content_id: e[o],
                                    price: e.price,
                                    quantity: e.quantity,
                                    brand: e.brand
                                })),
                                currency: a.lax.ecommerce.currencyCode,
                                value: a.loose.cart_total,
                                description: "InitiateCheckout" === e ? "Begin Checkout Page" : "Add Payment Info Page"
                            }, {
                                event_id: a.lax.event_id
                            })
                        }
                        ;
                        "dl_begin_checkout" === a.lax.event && r.config.enabledEvents.beginCheckout && c("InitiateCheckout"),
                        "dl_add_payment_info" === a.lax.event && r.config.enabledEvents.addPaymentInfo && c("AddPaymentInfo");
                        let s = n => {
                            if ("dl_purchase" === a.lax.event) {
                                let c = a.lax.ecommerce.purchase.actionField.id;
                                i.track(n, {
                                    content_type: r.config.dataConfig.contentType,
                                    contents: a.lax.ecommerce.purchase.products.map(e => ({
                                        content_name: e.name,
                                        content_category: e.category,
                                        content_id: e[o],
                                        price: e.price,
                                        quantity: e.quantity,
                                        brand: e.brand
                                    })),
                                    currency: a.lax.ecommerce.currencyCode,
                                    value: a.lax.ecommerce.purchase.actionField[e.rewriteConversionValue(r.config.dataConfig.conversionValue)],
                                    description: t.document.title,
                                    ..."Purchase" === n ? {
                                        query: a.lax.ecommerce.purchase.actionField.coupon ?? ""
                                    } : {}
                                }, {
                                    event_id: "Purchase" === n ? `cp_${c}_${c}` : `sub_${c}_${c}`
                                })
                            }
                        }
                        ;
                        "dl_purchase" === a.lax.event && r.config.enabledEvents.purchase && s("Purchase"),
                        "dl_purchase" === a.lax.event && r.config.enabledEvents.subscriptionPurchase && a.lax.ecommerce.purchase.products.some(e => "one-time" !== e.selling_plan_name) && s("Subscribe"),
                        "dl_subscribe" === a.lax.event && r.config.enabledEvents.emailSubscribe && "email" === a.lax.lead_type && i.track("Lead", {}, {
                            event_id: a.lax.event_id
                        })
                    }
                }
                )
            }
        })
    }), eJ, eB, ej, eN, eY]
      , e1 = e => {
        let t = e.marketId ? e.config.market_groups.find(t => t.markets.some(t => "Shopify" === t.source && t.external_id === e.marketId)) ?? e.config.market_groups.find(e => e.markets.some(e => "_Required" === e.source && "unconfigured" === e.external_id)) : e.config.market_groups.find(e => e.markets.some(e => "_Required" === e.source && "no_market_id" === e.external_id));
        if (t) {
            let r = e.config.destinations
              , a = {
                state: {
                    isGtagSetup: !1
                },
                consent: e.config.consent_enabled ? {
                    enabled: !0,
                    fallback: t.consentFallback
                } : {
                    enabled: !1
                },
                location,
                document,
                apexDomain: e.apexDomain,
                ignoredReferrerDomains: e.config.ignored_referrer_domains
            }
              , n = e0.map(e => e({
                marketGroup: t,
                destinations: r,
                globalDetails: a
            }));
            window.addEventListener("elevar-dl-event", e => {
                n.forEach(t => {
                    try {
                        t?.({
                            lax: e.detail,
                            loose: e.detail
                        })
                    } catch (e) {
                        (0,
                        I.k)("UNEXPECTED", [e])
                    }
                }
                )
            }
            )
        } else
            (0,
            I.k)("UNEXPECTED", ["No market group found - bailing out of gtmless"])
    }
      , e2 = e => `${location.origin}${e}`
      , e4 = async (e, t) => {
        let r = t ?? fetch;
        await r(e2("/cart/update.js"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                attributes: e
            })
        })
    }
      , e3 = async (e, t=!0, r=!1, a=null, n) => (await (0,
    $.YI)(),
    eE({
        apexDomain: a,
        ignoredReferrerDomains: e.ignoredReferrerDomains,
        isConsentEnabled: r,
        marketId: e.marketId,
        cartAttributes: e.attributes,
        onNewCartAttributes: async r => {
            t && e.items.length > 0 && await e4(r, n)
        }
    }));
    var e6 = (e, t) => {
        let r = Object.create(null);
        for (let a = 0; a < e.length; a++) {
            let n = e[a]
              , i = t(n, a, e);
            if (void 0 !== i) {
                let e = r[i];
                void 0 === e ? r[i] = [n] : e.push(n)
            }
        }
        return Object.setPrototypeOf(r, Object.prototype),
        r
    }
    ;
    let e5 = e => e ? Number(e).toFixed(2) : e
      , e7 = e => e?.startsWith("//") ? `https:${e}` : e
      , e8 = e => ({
        event: "dl_add_to_cart",
        ecommerce: {
            currencyCode: e.currencyCode,
            add: {
                actionField: {
                    list: e.item.list
                },
                products: [{
                    id: e.item.id,
                    name: e.item.name,
                    brand: e.item.brand,
                    category: e.item.category,
                    variant: e.item.variant,
                    price: e5(e.item.price),
                    quantity: e.item.quantity,
                    list: e.item.list,
                    product_id: e.item.productId,
                    variant_id: e.item.variantId,
                    ...e.item.compareAtPrice ? {
                        compare_at_price: e5(e.item.compareAtPrice)
                    } : {},
                    image: e7(e.item.image),
                    ...e.item.url ? {
                        url: `${window.location.origin}${e.item.url}`
                    } : {}
                }]
            }
        }
    })
      , e9 = (e, t=!0, r=!1, a=null, n) => {
        let i = t => {
            let r = t.querySelector('select[name="id"]')
              , a = t.querySelector('input[name="quantity"]')
              , n = r ? e.items.find(e => e.variantId === r.value) ?? e.defaultVariant ?? e.items[0] : e.defaultVariant ?? e.items[0];
            return {
                ...n,
                quantity: a?.value ?? "1",
                image: n.image ?? null
            }
        }
          , o = o => {
            let s = (0,
            $.dv)()
              , d = i(o)
              , l = (0,
            $.EU)();
            (0,
            c.y)(e8({
                currencyCode: e.currencyCode,
                item: {
                    ...d,
                    list: l
                }
            }));
            let u = [...s.filter(e => e.variantId !== d.variantId), {
                ...d,
                list: l
            }];
            (0,
            $.RV)(u),
            (0,
            c.y)({
                ecommerce: {
                    cart_contents: {
                        products: u.map(e => ({
                            id: e.id,
                            name: e.name,
                            brand: e.brand,
                            category: e.category,
                            variant: e.variant,
                            price: e5(e.price),
                            quantity: e.quantity,
                            list: e.list,
                            product_id: e.productId,
                            variant_id: e.variantId,
                            compare_at_price: e5(e.compareAtPrice),
                            image: e7(e.image)
                        }))
                    }
                }
            }),
            e3({
                ignoredReferrerDomains: e.ignoredReferrerDomains,
                attributes: e.attributes,
                items: u
            }, t, r, a, n)
        }
        ;
        ( () => {
            let e = Array.from(document.querySelectorAll('form[action*="/cart/add"]'))
              , t = e.filter(e => e.querySelectorAll('[id="name"]').length > 0);
            return t.length > 0 ? t : e
        }
        )().forEach(e => {
            let t = e.querySelectorAll('[name="add"]')
              , r = () => o(e);
            t.length > 0 ? t.forEach(e => e.addEventListener("click", r)) : e.addEventListener("submit", r)
        }
        )
    }
      , te = e => ({
        event: "dl_remove_from_cart",
        ecommerce: {
            currencyCode: e.currencyCode,
            remove: {
                actionField: {
                    list: e.item.list
                },
                products: [{
                    id: e.item.id,
                    name: e.item.name,
                    brand: e.item.brand,
                    category: e.item.category,
                    variant: e.item.variant,
                    price: e5(e.item.price),
                    quantity: e.item.quantity,
                    list: e.item.list,
                    product_id: e.item.productId,
                    variant_id: e.item.variantId,
                    image: e7(e.item.image)
                }]
            }
        }
    })
      , tt = e => {
        let t = t => {
            let r = t.searchParams.get("line");
            if (r) {
                let t = Number(r)
                  , a = e.items.find(e => e.position === t);
                if (a) {
                    let t = (0,
                    $.dv)()
                      , r = t.find(e => e.variantId === a.variantId);
                    (0,
                    c.y)(te({
                        currencyCode: e.currencyCode,
                        item: {
                            ...a,
                            list: r?.list ?? ""
                        }
                    }));
                    let n = t.filter(e => e.variantId !== a.variantId);
                    (0,
                    $.RV)(n),
                    (0,
                    c.y)({
                        ecommerce: {
                            cart_contents: {
                                products: n.map(e => ({
                                    id: e.id,
                                    name: e.name,
                                    brand: e.brand,
                                    category: e.category,
                                    variant: e.variant,
                                    price: e5(e.price),
                                    quantity: e.quantity,
                                    list: e.list,
                                    product_id: e.productId,
                                    variant_id: e.variantId,
                                    compare_at_price: e5(e.compareAtPrice),
                                    image: e7(e.image)
                                }))
                            }
                        }
                    })
                }
            }
        }
          , r = []
          , a = () => {
            let e = Array.from(document.querySelectorAll('a[href*="quantity=0"]'));
            r.forEach( ([e,t]) => {
                e.removeEventListener("click", t)
            }
            ),
            (r = e.map(e => [e, () => t(new URL(e.href,location.origin))])).forEach( ([e,t]) => {
                e.addEventListener("click", t)
            }
            )
        }
        ;
        a();
        let n = document.querySelector('form[action="/cart"]');
        n && new MutationObserver(a).observe(n, {
            subtree: !0,
            childList: !0
        })
    }
      , tr = e => Object.values(function(...e) {
        return (0,
        eU.a)(e6, e)
    }(e, e => e.variantId)).map(e => ({
        ...e[0],
        price: Math.max(...e.map(e => Number(e.price))).toFixed(2),
        quantity: eG(e, e => Number(e.quantity)).toString()
    }))
      , ta = e => {
        let t = tr(e.items)
          , r = tr((0,
        $.dv)())
          , a = (0,
        $.EU)()
          , n = t.filter(e => !r.some(t => t.variantId === e.variantId))
          , i = r.filter(e => !t.some(t => t.variantId === e.variantId))
          , o = r.map(e => {
            let r = t.find(t => t.variantId === e.variantId);
            if (!r)
                return null;
            let a = Number(r.quantity)
              , n = Number(e.quantity);
            if (a === n)
                return null;
            if (a > n) {
                let t = String(a - n);
                return ["INCREASED", {
                    ...e,
                    quantity: t
                }]
            }
            {
                let t = String(n - a);
                return ["DECREASED", {
                    ...e,
                    quantity: t
                }]
            }
        }
        ).filter(e => null !== e)
          , s = o.filter( ([e,t]) => "INCREASED" === e).map( ([e,t]) => t)
          , d = o.filter( ([e,t]) => "DECREASED" === e).map( ([e,t]) => t);
        [...n, ...s].forEach(t => {
            (0,
            c.y)(e8({
                currencyCode: e.currencyCode,
                item: {
                    list: a,
                    ...t
                }
            }))
        }
        ),
        [...i, ...d].forEach(t => {
            (0,
            c.y)(te({
                currencyCode: e.currencyCode,
                item: t
            }))
        }
        );
        let l = [...r.map(e => {
            let r = t.find(t => t.variantId === e.variantId);
            return r ? {
                ...e,
                quantity: r.quantity
            } : null
        }
        ).filter(e => null !== e), ...n.map(e => ({
            ...e,
            list: a
        }))];
        (0,
        $.RV)(l),
        (n.length > 0 || i.length > 0 || o.length > 0) && (0,
        c.y)({
            ecommerce: {
                cart_contents: {
                    products: l.map(e => ({
                        id: e.id,
                        name: e.name,
                        brand: e.brand,
                        category: e.category,
                        variant: e.variant,
                        price: e5(e.price),
                        quantity: e.quantity,
                        list: e.list,
                        product_id: e.productId,
                        variant_id: e.variantId,
                        compare_at_price: e5(e.compareAtPrice),
                        image: e7(e.image)
                    }))
                }
            }
        })
    }
      , tn = e => ({
        event: "dl_view_cart",
        cart_total: e5(e.cartTotal),
        ecommerce: {
            currencyCode: e.currencyCode,
            actionField: {
                list: "Shopping Cart"
            },
            impressions: e.items.map(e => ({
                id: e.id,
                name: e.name,
                brand: e.brand,
                category: e.category,
                variant: e.variant,
                price: e5(e.price),
                position: e.position,
                product_id: e.productId,
                variant_id: e.variantId,
                quantity: e.quantity
            }))
        }
    })
      , ti = e => {
        (0,
        c.y)(tn({
            ...e
        }))
    }
      , to = e => ({
        ...void 0 !== e.customer.id && void 0 !== e.customer.email ? {
            visitor_type: "logged_in",
            customer_id: e.customer.id,
            customer_email: e.customer.email
        } : {
            visitor_type: "guest",
            ...void 0 !== e.customer.email ? {
                customer_email: e.customer.email
            } : {}
        },
        ...void 0 !== e.customer.firstName ? {
            customer_first_name: e.customer.firstName
        } : {},
        ...void 0 !== e.customer.lastName ? {
            customer_last_name: e.customer.lastName
        } : {},
        ...void 0 !== e.customer.phone ? {
            customer_phone: e.customer.phone
        } : {},
        ...void 0 !== e.customer.city ? {
            customer_city: e.customer.city
        } : {},
        ...void 0 !== e.customer.zip ? {
            customer_zip: e.customer.zip
        } : {},
        ...void 0 !== e.customer.address1 ? {
            customer_address_1: e.customer.address1
        } : {},
        ...void 0 !== e.customer.address2 ? {
            customer_address_2: e.customer.address2
        } : {},
        ...void 0 !== e.customer.country ? {
            customer_country: e.customer.country
        } : {},
        ...void 0 !== e.customer.countryCode ? {
            customer_country_code: e.customer.countryCode
        } : {},
        ...void 0 !== e.customer.province ? {
            customer_province: e.customer.province
        } : {},
        ...void 0 !== e.customer.provinceCode ? {
            customer_province_code: e.customer.provinceCode
        } : {},
        ...void 0 !== e.customer.tags ? {
            customer_tags: e.customer.tags
        } : {},
        ...void 0 !== e.customer.orderType ? {
            customer_order_type: e.customer.orderType
        } : {},
        ...void 0 !== e.customer.orderCount ? {
            customer_order_count: String(e.customer.orderCount)
        } : {}
    })
      , tc = e => ({
        event: "dl_purchase",
        user_properties: to({
            customer: e.customer
        }),
        ecommerce: {
            currencyCode: e.currencyCode,
            purchase: {
                actionField: {
                    id: e.actionField.id,
                    ...e.actionField.order_name ? {
                        order_name: e.actionField.order_name
                    } : {},
                    revenue: e5(e.actionField.revenue),
                    tax: e5(e.actionField.tax),
                    shipping: e5(e.actionField.shipping),
                    ...e.actionField.coupon ? {
                        coupon: e.actionField.coupon
                    } : {},
                    ...e.actionField.subTotal ? {
                        sub_total: e5(e.actionField.subTotal)
                    } : {},
                    product_sub_total: e5(e.actionField.productSubTotal),
                    ...e.actionField.discountAmount ? {
                        discount_amount: e5(e.actionField.discountAmount)
                    } : {},
                    ...e.actionField.shippingTier ? {
                        shipping_tier: e.actionField.shippingTier
                    } : {}
                },
                products: e.items.map( (e, t) => ({
                    id: e.id,
                    name: e.name,
                    brand: e.brand,
                    category: e.category,
                    variant: e.variant,
                    price: e5(e.price),
                    quantity: e.quantity,
                    list: e.list,
                    position: String(t + 1),
                    product_id: e.productId,
                    variant_id: e.variantId,
                    image: e7(e.image),
                    ...e.discountAmount ? {
                        discount_amount: e5(e.discountAmount)
                    } : {},
                    ...e.sellingPlanName ? {
                        selling_plan_name: e.sellingPlanName
                    } : {}
                }))
            }
        },
        marketing: {
            landing_site: e.landingSite
        }
    })
      , ts = e => {
        let t = (0,
        $.dv)();
        (0,
        c.y)(tc({
            customer: e.customer ?? {},
            currencyCode: e.currencyCode,
            actionField: e.actionField,
            items: e.items.map(e => ({
                ...e,
                list: t.find(t => t.variantId === e.variantId)?.list ?? ""
            })),
            landingSite: e.landingSite
        })),
        (0,
        $.RV)([]),
        (0,
        c.y)({
            ecommerce: {
                cart_contents: {
                    products: []
                }
            }
        })
    }
      , td = `
  a[href*="/products/"]:not(
    a[href*="/collections/products/"]:not(
      a[href*="/collections/products/products/"]
    )
  )
`.replaceAll(" ", "").replaceAll("\n", "")
      , tl = async e => {
        try {
            let t = `/products/${e}.js`
              , r = await fetch(e2(t))
              , a = await r.json()
              , n = a.variants[0];
            return {
                id: n.sku || String(n.id),
                name: a.title,
                brand: a.vendor,
                category: a.type,
                variant: n.title,
                price: (.01 * a.price).toFixed(2),
                productId: String(a.id),
                variantId: String(n.id),
                image: a.featured_image ?? a.images?.[0] ?? void 0,
                compareAtPrice: "number" == typeof a.compare_at_price ? (.01 * a.compare_at_price).toFixed(2) : void 0,
                handle: e
            }
        } catch (e) {
            return (0,
            I.k)("UNEXPECTED", [e]),
            null
        }
    }
      , tu = e => decodeURIComponent(new URL(e.href,location.origin).pathname).split("/").reverse()[0] ?? null
      , tm = e => document.querySelectorAll(`[href*="${e}"]`)
      , t_ = e => [...new Set(e.filter(e => null !== e))]
      , tp = async (e, t) => (await Promise.all(t_(e).map(e => t.find(t => t.handle === e) ?? tl(e)))).filter(e => null !== e)
      , tg = ({data: e, shouldPushToDataLayer: t, deriveDataLayerItemFn: r}) => {
        let a = []
          , n = []
          , i = []
          , o = []
          , s = []
          , d = decodeURIComponent(location.pathname);
        (0,
        $.U6)(d);
        let l = () => {
            let t = e.currencyCode
              , a = [...i];
            i = [],
            a.length > 0 && (0,
            c.y)(r({
                collectionPathname: d,
                currencyCode: t,
                items: a
            }))
        }
          , u = A(l, {
            waitMs: 1e3,
            maxWaitMs: 5e3
        })
          , m = async (r, c) => {
            let d = [];
            if (r.forEach(e => {
                let t = tu(e.target);
                e.isIntersecting ? (a.push(t),
                d.push(t)) : a = a.filter(e => e !== t)
            }
            ),
            d.length > 0) {
                await (0,
                O.Gj)(250);
                let r = [];
                if (d.forEach(e => {
                    a.includes(e) && !o.includes(e) && (r.push(e),
                    o.push(e),
                    tm(e).forEach(e => c.unobserve(e)))
                }
                ),
                r.length > 0) {
                    let a = (await tp(r, e.items)).map(e => ({
                        ...e,
                        position: n.indexOf(e.handle) + 1
                    }));
                    s.push(...a),
                    t && (i.push(...a),
                    u.call())
                }
            }
        }
          , _ = new IntersectionObserver( (e, t) => void m(e, t),{
            threshold: .8
        })
          , p = () => {
            n = t_(Array.from(document.querySelectorAll(td)).map(e => {
                let t = tu(e);
                return t && !o.includes(t) && _.observe(e),
                t
            }
            ))
        }
        ;
        return new MutationObserver(A(p, {
            waitMs: 250,
            maxWaitMs: 500
        }).call).observe(document.body, {
            childList: !0,
            subtree: !0
        }),
        p(),
        window.addEventListener("pagehide", () => l()),
        {
            products: s,
            processPendingImpressions: l
        }
    }
      , tv = (e, t=!0) => tg({
        data: e,
        shouldPushToDataLayer: t,
        deriveDataLayerItemFn: e => ({
            event: "dl_view_item_list",
            ecommerce: {
                currencyCode: e.currencyCode,
                impressions: e.items.map(t => ({
                    id: t.id,
                    name: t.name,
                    brand: t.brand,
                    category: t.category,
                    variant: t.variant,
                    price: e5(t.price),
                    position: t.position,
                    list: e.collectionPathname,
                    product_id: t.productId,
                    variant_id: t.variantId,
                    compare_at_price: e5(t.compareAtPrice),
                    image: e7(t.image)
                }))
            }
        })
    })
      , tf = async ({saveOrderNotes: e, consentEnabled: t, apexDomain: r, ignoredReferrerDomains: a, nativeFetch: n}) => {
        let i = await n(e2("/cart.js"))
          , o = await i.json();
        ta({
            currencyCode: o.currency,
            items: o.items.map( (e, t) => ({
                id: e.sku || String(e.id),
                name: e.product_title,
                brand: e.vendor,
                category: e.product_type,
                variant: e.variant_title ?? "Default Title",
                position: t,
                price: (.01 * e.price).toFixed(2),
                quantity: String(e.quantity),
                productId: String(e.product_id),
                variantId: String(e.id),
                image: e.featured_image?.url ?? null,
                url: e.url
            }))
        }),
        e3({
            ignoredReferrerDomains: a,
            attributes: o.attributes,
            items: (0,
            $.dv)()
        }, e, t, r, n)
    }
      , ty = e => e.includes("/cart/add") || e.includes("/cart/update") || e.includes("/cart/change") || e.includes("/cart/clear")
      , tw = async (e, t) => {
        let[r] = e;
        ty(r instanceof Request ? r.url : r instanceof URL ? r.toString() : r) && await tf(t)
    }
      , th = e => {
        window.fetch = async (...t) => {
            let r = await e.nativeFetch(...t);
            return tw(t, e),
            r
        }
    }
      , tE = async (e, t) => {
        ty(e) && await tf(t)
    }
      , tb = e => {
        let t = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = function(...r) {
            let a = r[1];
            return this.addEventListener("readystatechange", () => {
                this.readyState === this.DONE && tE(a.toString(), e)
            }
            ),
            t.apply(this, r)
        }
    }
      , tI = (e, t=!0, r=!1, a=null) => {
        let n = window.fetch.bind(window);
        return {
            nativeFetch: n,
            overrideFetch: () => {
                th({
                    saveOrderNotes: t,
                    consentEnabled: r,
                    apexDomain: a,
                    ignoredReferrerDomains: e,
                    nativeFetch: n
                }),
                tb({
                    saveOrderNotes: t,
                    consentEnabled: r,
                    apexDomain: a,
                    ignoredReferrerDomains: e,
                    nativeFetch: n
                })
            }
        }
    }
      , tx = e => ({
        event: "dl_select_item",
        ecommerce: {
            currencyCode: e.currencyCode,
            click: {
                actionField: {
                    list: e.collectionPathname
                },
                products: [{
                    id: e.item.id,
                    name: e.item.name,
                    brand: e.item.brand,
                    category: e.item.category,
                    variant: e.item.variant,
                    price: e5(e.item.price),
                    position: e.item.position,
                    list: e.collectionPathname,
                    product_id: e.item.productId,
                    variant_id: e.item.variantId
                }]
            }
        }
    })
      , tC = e => e instanceof HTMLAnchorElement ? e : e.parentElement ? tC(e.parentElement) : null
      , tS = (e, t) => {
        let {products: r, processPendingImpressions: a} = t
          , n = t => {
            if (t.target instanceof HTMLElement) {
                a();
                let n = tC(t.target);
                if (n?.matches(td)) {
                    let t = new URL(n.href,location.origin)
                      , a = decodeURIComponent(t.pathname).split("/").reverse()[0]
                      , i = r.filter(e => e.handle === a);
                    if (i.length > 0) {
                        let r = t.searchParams.get("variant")
                          , a = i.find(e => e.variantId === r) ?? i[0];
                        a && (0,
                        c.y)(tx({
                            collectionPathname: decodeURIComponent(location.pathname),
                            currencyCode: e.currencyCode,
                            item: a
                        }))
                    }
                }
            }
        }
        ;
        return document.addEventListener("click", n),
        {
            unregister: () => document.removeEventListener("click", n)
        }
    }
      , tO = e => ({
        event: "dl_view_item",
        ecommerce: {
            currencyCode: e.currencyCode,
            detail: {
                actionField: {
                    list: e.item.list
                },
                products: [{
                    id: e.item.id,
                    name: e.item.name,
                    brand: e.item.brand,
                    category: e.item.category,
                    variant: e.item.variant,
                    price: e5(e.item.price),
                    list: e.item.list,
                    product_id: e.item.productId,
                    variant_id: e.item.variantId,
                    compare_at_price: e5(e.item.compareAtPrice),
                    image: e7(e.item.image)
                }]
            }
        }
    })
      , tA = e => {
        let t = null
          , r = r => {
            r.variantId !== t && (t = r.variantId,
            (0,
            c.y)(tO({
                currencyCode: e.currencyCode,
                item: {
                    ...r,
                    list: (0,
                    $.EU)(),
                    image: r.image ?? null
                }
            })))
        }
          , a = setInterval( () => {
            r(( () => {
                let t = document.querySelector('form[action*="/cart/add"] select[name="id"]');
                if (!t)
                    return e.defaultVariant ?? e.items[0];
                {
                    let r = t.value;
                    return e.items.find(e => e.variantId === r) ?? e.defaultVariant ?? e.items[0]
                }
            }
            )())
        }
        , 500);
        window.navigation?.addEventListener("navigate", t => {
            if (t.canIntercept && !t.downloadRequest) {
                let n = new URL(t.destination.url).searchParams.get("variant");
                if (n) {
                    let t = e.items.find(e => e.variantId === n);
                    t && (r(t),
                    clearInterval(a))
                }
            }
        }
        )
    }
      , tT = (e, t=!0) => tg({
        data: e,
        shouldPushToDataLayer: t,
        deriveDataLayerItemFn: e => ({
            event: "dl_view_search_results",
            ecommerce: {
                currencyCode: e.currencyCode,
                actionField: {
                    list: "search results"
                },
                impressions: e.items.map(t => ({
                    id: t.id,
                    name: t.name,
                    brand: t.brand,
                    category: t.category,
                    price: e5(t.price),
                    position: t.position,
                    list: e.collectionPathname,
                    product_id: t.productId,
                    variant_id: t.variantId
                }))
            }
        })
    })
      , tR = e => ({
        event: "dl_sign_up",
        user_properties: {
            visitor_type: "logged_in",
            customer_id: e.customer.id,
            customer_email: e.customer.email
        }
    })
      , tk = e => ({
        event: "dl_login",
        user_properties: {
            visitor_type: "logged_in",
            customer_id: e.customer.id,
            customer_email: e.customer.email
        }
    })
      , tD = e => ({
        event: "dl_user_data",
        cart_total: e5(e.cartTotal),
        user_properties: to({
            customer: e.customer
        }),
        ecommerce: {
            currencyCode: e.currencyCode,
            cart_contents: {
                products: e.cart.map(e => ({
                    id: e.id,
                    name: e.name,
                    brand: e.brand,
                    category: e.category,
                    variant: e.variant,
                    price: e5(e.price),
                    quantity: e.quantity,
                    list: e.list,
                    product_id: e.productId,
                    variant_id: e.variantId,
                    compare_at_price: e5(e.compareAtPrice),
                    image: e7(e.image)
                }))
            }
        }
    })
      , tN = (e, t=[]) => {
        let r = e.customer ?? {}
          , a = new URL(location.href)
          , n = (0,
        $.dv)()
          , i = t.length > 1;
        r.id && r.email ? ((0,
        $.j)() && (i || "/" === a.pathname) && (0,
        c.y)(tR({
            customer: {
                id: r.id,
                email: r.email
            }
        })),
        (0,
        $.v7)(!1),
        (0,
        $.Ee)() || ((0,
        $.Wx)(!0),
        (0,
        c.y)(tk({
            customer: {
                id: r.id,
                email: r.email
            }
        })))) : ((0,
        $.Ee)() && (0,
        $.Wx)(!1),
        a.pathname.endsWith("/account/register") ? (0,
        $.v7)(!0) : a.pathname.endsWith("/challenge") || (0,
        $.v7)(!1)),
        (0,
        c.y)(tD({
            cartTotal: e.cartTotal,
            customer: r,
            currencyCode: e.currencyCode,
            cart: n
        }))
    }
      , tP = (e, t) => {
        if (e.event_config)
            try {
                v();
                let r = window.location
                  , n = window.document
                  , i = (0,
                a.rB)({
                    apexDomains: e.apex_domains,
                    location: r
                })
                  , o = t.cartData.marketId ?? null;
                e1({
                    config: e,
                    location: r,
                    document: n,
                    apexDomain: i,
                    marketId: o
                }),
                e.allow_gtm && C({
                    config: e,
                    marketId: o,
                    orderStatusPageScriptsFallback: !o
                }),
                ex({
                    config: e,
                    apexDomain: i,
                    scriptType: "SHOPIFY_THEME",
                    proxy: {
                        type: "SHOPIFY"
                    },
                    location: r
                });
                let {nativeFetch: c, overrideFetch: s} = tI(e.ignored_referrer_domains, e.event_config.save_order_notes, e.consent_enabled, i);
                if (e3({
                    ...t.cartData,
                    ignoredReferrerDomains: e.ignored_referrer_domains
                }, e.event_config.save_order_notes, e.consent_enabled, i, c),
                e.event_config.user && tN(t.user, e.market_groups),
                !t.checkoutComplete && (e.event_config.product_add_to_cart_ajax && s(),
                e.event_config.cart_reconcile && ta(t.cartData)),
                t.isOnCartPage && (e.event_config.cart_view && ti(t.cartData),
                e.event_config.product_remove_from_cart && tt(t.cartData)),
                t.collectionView) {
                    let r = tv(t.collectionView, e.event_config.collection_view);
                    e.event_config.product_select && tS(t.collectionView, r)
                }
                if (t.searchResultsView) {
                    let r = tT(t.searchResultsView, e.event_config.search_results_view);
                    e.event_config.product_select && tS(t.searchResultsView, r)
                }
                t.productView && (e.event_config.product_view && tA(t.productView),
                e.event_config.product_add_to_cart && e9({
                    ...t.productView,
                    ignoredReferrerDomains: e.ignored_referrer_domains
                }, e.event_config.save_order_notes, e.consent_enabled, i, c)),
                t.checkoutComplete && e.event_config.checkout_complete && ts(t.checkoutComplete)
            } catch (e) {
                (0,
                I.k)("UNEXPECTED", [e])
            }
    }
}
)();
var o = i.y;
export {o as handler};
