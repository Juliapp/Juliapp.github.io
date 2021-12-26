
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules\svelte-fullpage\src\Indicator\Dot.svelte generated by Svelte v3.44.1 */

    const file$7 = "node_modules\\svelte-fullpage\\src\\Indicator\\Dot.svelte";

    // (13:4) {#if names}
    function create_if_block$2(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*name*/ ctx[2]);
    			attr_dev(p, "class", "svelte-fp-slide-name svelte-tlycps");
    			add_location(p, file$7, 13, 8, 266);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 4) set_data_dev(t, /*name*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(13:4) {#if names}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let li;
    	let t;
    	let button;
    	let button_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*names*/ ctx[3] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (if_block) if_block.c();
    			t = space();
    			button = element("button");

    			attr_dev(button, "class", button_class_value = "svelte-fp-indicator-list-item-btn " + (/*activeSection*/ ctx[0] === /*index*/ ctx[1]
    			? 'svelte-fp-active'
    			: '') + " svelte-tlycps");

    			add_location(button, file$7, 17, 4, 345);
    			attr_dev(li, "class", "svelte-fp-indicator-list-item svelte-tlycps");
    			add_location(li, file$7, 11, 0, 199);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			if (if_block) if_block.m(li, null);
    			append_dev(li, t);
    			append_dev(li, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*goto*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*names*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(li, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*activeSection, index*/ 3 && button_class_value !== (button_class_value = "svelte-fp-indicator-list-item-btn " + (/*activeSection*/ ctx[0] === /*index*/ ctx[1]
    			? 'svelte-fp-active'
    			: '') + " svelte-tlycps")) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dot', slots, []);
    	let { activeSection = 0 } = $$props;
    	let { index = 0 } = $$props;
    	let { name = '' } = $$props;
    	let { names = false } = $$props;

    	const goto = () => {
    		$$invalidate(0, activeSection = index);
    	};

    	const writable_props = ['activeSection', 'index', 'name', 'names'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dot> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('activeSection' in $$props) $$invalidate(0, activeSection = $$props.activeSection);
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('names' in $$props) $$invalidate(3, names = $$props.names);
    	};

    	$$self.$capture_state = () => ({ activeSection, index, name, names, goto });

    	$$self.$inject_state = $$props => {
    		if ('activeSection' in $$props) $$invalidate(0, activeSection = $$props.activeSection);
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('names' in $$props) $$invalidate(3, names = $$props.names);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeSection, index, name, names, goto];
    }

    class Dot extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			activeSection: 0,
    			index: 1,
    			name: 2,
    			names: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dot",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get activeSection() {
    		throw new Error("<Dot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSection(value) {
    		throw new Error("<Dot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Dot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Dot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Dot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Dot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get names() {
    		throw new Error("<Dot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set names(value) {
    		throw new Error("<Dot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-fullpage\src\Indicator\index.svelte generated by Svelte v3.44.1 */
    const file$6 = "node_modules\\svelte-fullpage\\src\\Indicator\\index.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (10:8) {#each sections as page,index}
    function create_each_block$1(ctx) {
    	let dot;
    	let updating_activeSection;
    	let current;

    	function dot_activeSection_binding(value) {
    		/*dot_activeSection_binding*/ ctx[2](value);
    	}

    	let dot_props = {
    		index: /*index*/ ctx[5],
    		name: /*page*/ ctx[3]
    	};

    	if (/*activeSection*/ ctx[0] !== void 0) {
    		dot_props.activeSection = /*activeSection*/ ctx[0];
    	}

    	dot = new Dot({ props: dot_props, $$inline: true });
    	binding_callbacks.push(() => bind(dot, 'activeSection', dot_activeSection_binding));

    	const block = {
    		c: function create() {
    			create_component(dot.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dot, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dot_changes = {};
    			if (dirty & /*sections*/ 2) dot_changes.name = /*page*/ ctx[3];

    			if (!updating_activeSection && dirty & /*activeSection*/ 1) {
    				updating_activeSection = true;
    				dot_changes.activeSection = /*activeSection*/ ctx[0];
    				add_flush_callback(() => updating_activeSection = false);
    			}

    			dot.$set(dot_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dot.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dot.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dot, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(10:8) {#each sections as page,index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let ul;
    	let current;
    	let each_value = /*sections*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-fp-indicator-list svelte-dh6fo0");
    			add_location(ul, file$6, 8, 4, 158);
    			attr_dev(div, "class", "svelte-fp-indicator svelte-dh6fo0");
    			add_location(div, file$6, 7, 0, 120);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*sections, activeSection*/ 3) {
    				each_value = /*sections*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Indicator', slots, []);
    	let { sections = [] } = $$props;
    	let { activeSection = 0 } = $$props;
    	const writable_props = ['sections', 'activeSection'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Indicator> was created with unknown prop '${key}'`);
    	});

    	function dot_activeSection_binding(value) {
    		activeSection = value;
    		$$invalidate(0, activeSection);
    	}

    	$$self.$$set = $$props => {
    		if ('sections' in $$props) $$invalidate(1, sections = $$props.sections);
    		if ('activeSection' in $$props) $$invalidate(0, activeSection = $$props.activeSection);
    	};

    	$$self.$capture_state = () => ({ Dot, sections, activeSection });

    	$$self.$inject_state = $$props => {
    		if ('sections' in $$props) $$invalidate(1, sections = $$props.sections);
    		if ('activeSection' in $$props) $$invalidate(0, activeSection = $$props.activeSection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeSection, sections, dot_activeSection_binding];
    }

    class Indicator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { sections: 1, activeSection: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Indicator",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get sections() {
    		throw new Error("<Indicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sections(value) {
    		throw new Error("<Indicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeSection() {
    		throw new Error("<Indicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSection(value) {
    		throw new Error("<Indicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* node_modules\svelte-fullpage\src\Fullpage.svelte generated by Svelte v3.44.1 */

    const { console: console_1 } = globals;
    const file$5 = "node_modules\\svelte-fullpage\\src\\Fullpage.svelte";

    function create_fragment$6(ctx) {
    	let t0;
    	let div2;
    	let div1;
    	let div0;
    	let t1;
    	let indicator;
    	let updating_activeSection;
    	let updating_sections;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[22].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);

    	function indicator_activeSection_binding(value) {
    		/*indicator_activeSection_binding*/ ctx[25](value);
    	}

    	function indicator_sections_binding(value) {
    		/*indicator_sections_binding*/ ctx[26](value);
    	}

    	let indicator_props = {};

    	if (/*activeSection*/ ctx[0] !== void 0) {
    		indicator_props.activeSection = /*activeSection*/ ctx[0];
    	}

    	if (/*sections*/ ctx[2] !== void 0) {
    		indicator_props.sections = /*sections*/ ctx[2];
    	}

    	indicator = new Indicator({ props: indicator_props, $$inline: true });
    	binding_callbacks.push(() => bind(indicator, 'activeSection', indicator_activeSection_binding));
    	binding_callbacks.push(() => bind(indicator, 'sections', indicator_sections_binding));

    	const block = {
    		c: function create() {
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			create_component(indicator.$$.fragment);
    			attr_dev(div0, "class", "svelte-fp-container svelte-ng9shq");
    			add_location(div0, file$5, 169, 8, 6337);
    			attr_dev(div1, "class", "svelte-fp-container svelte-ng9shq");
    			add_location(div1, file$5, 168, 4, 6295);
    			attr_dev(div2, "class", "" + (null_to_empty(/*classes*/ ctx[5]) + " svelte-ng9shq"));
    			attr_dev(div2, "style", /*style*/ ctx[1]);
    			add_location(div2, file$5, 165, 0, 5979);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[24](div0);
    			append_dev(div1, t1);
    			mount_component(indicator, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*keydown_handler*/ ctx[23], false, false, false),
    					listen_dev(div2, "wheel", /*wheel_handler*/ ctx[27], false, false, false),
    					listen_dev(div2, "touchstart", /*touchstart_handler*/ ctx[28], false, false, false),
    					listen_dev(div2, "touchmove", /*touchmove_handler*/ ctx[29], false, false, false),
    					listen_dev(div2, "drag", drag_handler, false, false, false),
    					listen_dev(div2, "mousedown", /*mousedown_handler*/ ctx[30], false, false, false),
    					listen_dev(div2, "mouseup", /*mouseup_handler*/ ctx[31], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 2097152)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[21],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[21])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[21], dirty, null),
    						null
    					);
    				}
    			}

    			const indicator_changes = {};

    			if (!updating_activeSection && dirty[0] & /*activeSection*/ 1) {
    				updating_activeSection = true;
    				indicator_changes.activeSection = /*activeSection*/ ctx[0];
    				add_flush_callback(() => updating_activeSection = false);
    			}

    			if (!updating_sections && dirty[0] & /*sections*/ 4) {
    				updating_sections = true;
    				indicator_changes.sections = /*sections*/ ctx[2];
    				add_flush_callback(() => updating_sections = false);
    			}

    			indicator.$set(indicator_changes);

    			if (!current || dirty[0] & /*style*/ 2) {
    				attr_dev(div2, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(indicator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(indicator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[24](null);
    			destroy_component(indicator);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const drag_handler = () => {
    	return false;
    };

    function instance$6($$self, $$props, $$invalidate) {
    	let $activeSectionStore;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Fullpage', slots, ['default']);
    	let { class: defaultClasses = '' } = $$props;
    	let { style = '' } = $$props;
    	let { activeSection = 0 } = $$props;
    	const activeSectionStore = writable(activeSection);
    	validate_store(activeSectionStore, 'activeSectionStore');
    	component_subscribe($$self, activeSectionStore, value => $$invalidate(36, $activeSectionStore = value));
    	let sectionCount = 0;
    	let { sectionTitles = false } = $$props;
    	let sections = [];
    	let { transitionDuration = 500 } = $$props;
    	let { arrows = false } = $$props;
    	let { drag = false } = $$props;
    	let { dragThreshold = 100 } = $$props;
    	let { touchThreshold = 75 } = $$props;
    	let { pullDownToRefresh = false } = $$props;

    	// Placeholder for content of slot
    	let fullpageContent;

    	// Auxiliary variables that make possible drag and scroll feature
    	let dragStartPosition;

    	let touchStartPosition;

    	//extending exported classes with wrapper class
    	let classes = `${defaultClasses} svelte-fp-wrapper`;

    	let recentScroll = 0;

    	//setting section visible
    	let active = true;

    	/*
    Passing data about section visibility to all sections, activeSectionStore notifies all child FullpageSections about
    changed active section, so previously active section will hide and newly active section will appear. Function getId
    is for determination sectionId for FullpageSection
     */
    	setContext('section', {
    		activeSectionStore,
    		getId: () => {
    			$$invalidate(20, sectionCount++, sectionCount);
    			return sectionCount - 1;
    		}
    	});

    	//function that handles scroll and sets scroll cooldown based on animation duration
    	const handleScroll = event => {
    		//getting direction of scroll, if negative, scroll up, if positive, scroll down
    		let deltaY = event.deltaY;

    		let timer = new Date().getTime();

    		//if cooldown time is up, fullpage is scrollable again
    		if (transitionDuration < timer - recentScroll) {
    			recentScroll = timer;

    			if (deltaY < 0) {
    				scrollUp();
    			} else if (deltaY > 0) {
    				scrollDown();
    			}
    		}
    	};

    	// toggles visibility of active section
    	const toggleActive = () => {
    		active = !active;
    	};

    	// scroll up effect, only when it's possible
    	const scrollUp = async () => {
    		if ($activeSectionStore > 0) {
    			$$invalidate(0, activeSection--, activeSection);
    		}
    	};

    	// scroll down effect, only when it's possible
    	const scrollDown = async () => {
    		if ($activeSectionStore < sectionCount - 1) {
    			$$invalidate(0, activeSection++, activeSection);
    		}
    	};

    	// handling arrow event
    	const handleKey = event => {
    		if (arrows) {
    			switch (event.key) {
    				case 'ArrowDown':
    					scrollDown();
    					break;
    				case 'ArrowUp':
    					scrollUp();
    					break;
    			}
    		}
    	};

    	// memoize drag start Y coordinate, only if drag effect is enabled
    	const handleDragStart = event => {
    		if (drag) {
    			dragStartPosition = event.screenY;
    		}
    	};

    	// handles drag end event
    	const handleDragEnd = event => {
    		if (drag) {
    			const dragEndPosition = event.screenY;

    			// Trigger scroll event after thresholds are exceeded
    			if (dragStartPosition - dragEndPosition > dragThreshold) {
    				scrollDown();
    			} else if (dragStartPosition - dragEndPosition < -dragThreshold) {
    				scrollUp();
    			}
    		}
    	};

    	// memoize touch start Y coordinate
    	const handleTouchStart = event => {
    		touchStartPosition = event.touches[0].screenY;
    	};

    	// Compare touch start and end Y coordinates, if difference exceeds threshold, scroll function is triggered
    	const handleTouchEnd = event => {
    		// Timer is used for preventing scrolling multiple sections
    		let timer = new Date().getTime();

    		const touchEndPosition = event.touches[0].screenY;

    		if (transitionDuration < timer - recentScroll) {
    			if (touchStartPosition - touchEndPosition > touchThreshold) {
    				scrollDown();
    				recentScroll = timer;
    			} else if (touchStartPosition - touchEndPosition < -touchThreshold) {
    				scrollUp();
    				recentScroll = timer;
    			}
    		}
    	};

    	const writable_props = [
    		'class',
    		'style',
    		'activeSection',
    		'sectionTitles',
    		'transitionDuration',
    		'arrows',
    		'drag',
    		'dragThreshold',
    		'touchThreshold',
    		'pullDownToRefresh'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Fullpage> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = event => handleKey(event);

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			fullpageContent = $$value;
    			$$invalidate(3, fullpageContent);
    		});
    	}

    	function indicator_activeSection_binding(value) {
    		activeSection = value;
    		$$invalidate(0, activeSection);
    	}

    	function indicator_sections_binding(value) {
    		sections = value;
    		((($$invalidate(2, sections), $$invalidate(13, sectionTitles)), $$invalidate(3, fullpageContent)), $$invalidate(20, sectionCount));
    	}

    	const wheel_handler = event => handleScroll(event);
    	const touchstart_handler = event => handleTouchStart(event);
    	const touchmove_handler = event => handleTouchEnd(event);
    	const mousedown_handler = event => handleDragStart(event);
    	const mouseup_handler = event => handleDragEnd(event);

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(12, defaultClasses = $$props.class);
    		if ('style' in $$props) $$invalidate(1, style = $$props.style);
    		if ('activeSection' in $$props) $$invalidate(0, activeSection = $$props.activeSection);
    		if ('sectionTitles' in $$props) $$invalidate(13, sectionTitles = $$props.sectionTitles);
    		if ('transitionDuration' in $$props) $$invalidate(14, transitionDuration = $$props.transitionDuration);
    		if ('arrows' in $$props) $$invalidate(15, arrows = $$props.arrows);
    		if ('drag' in $$props) $$invalidate(16, drag = $$props.drag);
    		if ('dragThreshold' in $$props) $$invalidate(17, dragThreshold = $$props.dragThreshold);
    		if ('touchThreshold' in $$props) $$invalidate(18, touchThreshold = $$props.touchThreshold);
    		if ('pullDownToRefresh' in $$props) $$invalidate(19, pullDownToRefresh = $$props.pullDownToRefresh);
    		if ('$$scope' in $$props) $$invalidate(21, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Indicator,
    		onMount,
    		setContext,
    		writable,
    		defaultClasses,
    		style,
    		activeSection,
    		activeSectionStore,
    		sectionCount,
    		sectionTitles,
    		sections,
    		transitionDuration,
    		arrows,
    		drag,
    		dragThreshold,
    		touchThreshold,
    		pullDownToRefresh,
    		fullpageContent,
    		dragStartPosition,
    		touchStartPosition,
    		classes,
    		recentScroll,
    		active,
    		handleScroll,
    		toggleActive,
    		scrollUp,
    		scrollDown,
    		handleKey,
    		handleDragStart,
    		handleDragEnd,
    		handleTouchStart,
    		handleTouchEnd,
    		$activeSectionStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('defaultClasses' in $$props) $$invalidate(12, defaultClasses = $$props.defaultClasses);
    		if ('style' in $$props) $$invalidate(1, style = $$props.style);
    		if ('activeSection' in $$props) $$invalidate(0, activeSection = $$props.activeSection);
    		if ('sectionCount' in $$props) $$invalidate(20, sectionCount = $$props.sectionCount);
    		if ('sectionTitles' in $$props) $$invalidate(13, sectionTitles = $$props.sectionTitles);
    		if ('sections' in $$props) $$invalidate(2, sections = $$props.sections);
    		if ('transitionDuration' in $$props) $$invalidate(14, transitionDuration = $$props.transitionDuration);
    		if ('arrows' in $$props) $$invalidate(15, arrows = $$props.arrows);
    		if ('drag' in $$props) $$invalidate(16, drag = $$props.drag);
    		if ('dragThreshold' in $$props) $$invalidate(17, dragThreshold = $$props.dragThreshold);
    		if ('touchThreshold' in $$props) $$invalidate(18, touchThreshold = $$props.touchThreshold);
    		if ('pullDownToRefresh' in $$props) $$invalidate(19, pullDownToRefresh = $$props.pullDownToRefresh);
    		if ('fullpageContent' in $$props) $$invalidate(3, fullpageContent = $$props.fullpageContent);
    		if ('dragStartPosition' in $$props) dragStartPosition = $$props.dragStartPosition;
    		if ('touchStartPosition' in $$props) touchStartPosition = $$props.touchStartPosition;
    		if ('classes' in $$props) $$invalidate(5, classes = $$props.classes);
    		if ('recentScroll' in $$props) recentScroll = $$props.recentScroll;
    		if ('active' in $$props) active = $$props.active;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*activeSection*/ 1) {
    			/*
    Everytime activeSection updates, this store gets new value and then all sections that subscribe,
    this is because user may want to control sections programmatically
     */
    			activeSectionStore.set(activeSection);
    		}

    		if ($$self.$$.dirty[0] & /*sectionTitles*/ 8192) {
    			// If user has specified sectionTitles, then sections is overridden
    			if (sectionTitles) $$invalidate(2, sections = sectionTitles);
    		}

    		if ($$self.$$.dirty[0] & /*fullpageContent, sectionTitles, sectionCount, sections*/ 1056780) {
    			// If user hasn't specified sectionTitle, sections array will be generated with placeholder strings
    			if (fullpageContent && !sectionTitles) {
    				console.log(fullpageContent.children.length);

    				for (let i = 0; sectionCount > i; i++) {
    					$$invalidate(2, sections = [...sections, `Section ${i + 1}`]);
    				}
    			}
    		}
    	};

    	return [
    		activeSection,
    		style,
    		sections,
    		fullpageContent,
    		activeSectionStore,
    		classes,
    		handleScroll,
    		handleKey,
    		handleDragStart,
    		handleDragEnd,
    		handleTouchStart,
    		handleTouchEnd,
    		defaultClasses,
    		sectionTitles,
    		transitionDuration,
    		arrows,
    		drag,
    		dragThreshold,
    		touchThreshold,
    		pullDownToRefresh,
    		sectionCount,
    		$$scope,
    		slots,
    		keydown_handler,
    		div0_binding,
    		indicator_activeSection_binding,
    		indicator_sections_binding,
    		wheel_handler,
    		touchstart_handler,
    		touchmove_handler,
    		mousedown_handler,
    		mouseup_handler
    	];
    }

    class Fullpage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{
    				class: 12,
    				style: 1,
    				activeSection: 0,
    				sectionTitles: 13,
    				transitionDuration: 14,
    				arrows: 15,
    				drag: 16,
    				dragThreshold: 17,
    				touchThreshold: 18,
    				pullDownToRefresh: 19
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fullpage",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeSection() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSection(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sectionTitles() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sectionTitles(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionDuration() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionDuration(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get arrows() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arrows(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get drag() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set drag(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dragThreshold() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dragThreshold(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get touchThreshold() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set touchThreshold(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pullDownToRefresh() {
    		throw new Error("<Fullpage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pullDownToRefresh(value) {
    		throw new Error("<Fullpage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* node_modules\svelte-fullpage\src\FullpageSection.svelte generated by Svelte v3.44.1 */
    const file$4 = "node_modules\\svelte-fullpage\\src\\FullpageSection.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i];
    	child_ctx[44] = i;
    	return child_ctx;
    }

    // (166:0) {#if visible}
    function create_if_block$1(ctx) {
    	let section;
    	let div;
    	let t;
    	let section_class_value;
    	let section_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[26].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[25], null);
    	let if_block = /*slides*/ ctx[1][0] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "svelte-fp-container svelte-fp-flexbox-expand svelte-l4liqa");
    			toggle_class(div, "svelte-fp-flexbox-center", /*center*/ ctx[2]);
    			add_location(div, file$4, 169, 8, 5339);
    			attr_dev(section, "class", section_class_value = "" + (null_to_empty(/*classes*/ ctx[6]) + " svelte-l4liqa"));
    			attr_dev(section, "style", /*style*/ ctx[0]);
    			add_location(section, file$4, 166, 4, 5013);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(section, t);
    			if (if_block) if_block.m(section, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(section, "selectstart", /*handleSelect*/ ctx[9], false, false, false),
    					listen_dev(section, "mousedown", /*mousedown_handler*/ ctx[29], false, false, false),
    					listen_dev(section, "mouseup", /*mouseup_handler*/ ctx[30], false, false, false),
    					listen_dev(section, "touchstart", /*touchstart_handler*/ ctx[31], false, false, false),
    					listen_dev(section, "touchmove", /*touchmove_handler*/ ctx[32], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 33554432)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[25],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[25])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[25], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty[0] & /*center*/ 4) {
    				toggle_class(div, "svelte-fp-flexbox-center", /*center*/ ctx[2]);
    			}

    			if (/*slides*/ ctx[1][0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(section, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty[0] & /*classes*/ 64 && section_class_value !== (section_class_value = "" + (null_to_empty(/*classes*/ ctx[6]) + " svelte-l4liqa"))) {
    				attr_dev(section, "class", section_class_value);
    			}

    			if (!current || dirty[0] & /*style*/ 1) {
    				attr_dev(section, "style", /*style*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!section_transition) section_transition = create_bidirectional_transition(section, slide, /*transition*/ ctx[3], true);
    				section_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!section_transition) section_transition = create_bidirectional_transition(section, slide, /*transition*/ ctx[3], false);
    			section_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d();
    			if (detaching && section_transition) section_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(166:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (174:8) {#if slides[0]}
    function create_if_block_1(ctx) {
    	let div;
    	let ul;
    	let each_value = /*slides*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-fp-indicator-list-horizontal svelte-l4liqa");
    			add_location(ul, file$4, 175, 16, 5589);
    			attr_dev(div, "class", "svelte-fp-indicator-horizontal svelte-l4liqa");
    			add_location(div, file$4, 174, 12, 5528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*activeSlideIndicator, toSlide, slides*/ 1058) {
    				each_value = /*slides*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(174:8) {#if slides[0]}",
    		ctx
    	});

    	return block;
    }

    // (177:20) {#each slides as page,index}
    function create_each_block(ctx) {
    	let li;
    	let button;
    	let button_class_value;
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[28](/*index*/ ctx[44]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			t = space();

    			attr_dev(button, "class", button_class_value = "svelte-fp-indicator-list-item-btn " + (/*activeSlideIndicator*/ ctx[5] === /*index*/ ctx[44]
    			? 'svelte-fp-active'
    			: '') + " svelte-l4liqa");

    			add_location(button, file$4, 178, 28, 5782);
    			attr_dev(li, "class", "svelte-fp-indicator-list-item svelte-l4liqa");
    			add_location(li, file$4, 177, 24, 5711);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(li, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*activeSlideIndicator*/ 32 && button_class_value !== (button_class_value = "svelte-fp-indicator-list-item-btn " + (/*activeSlideIndicator*/ ctx[5] === /*index*/ ctx[44]
    			? 'svelte-fp-active'
    			: '') + " svelte-l4liqa")) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(177:20) {#each slides as page,index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*visible*/ ctx[4] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*keydown_handler*/ ctx[27], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*visible*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*visible*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $activeSectionStore;
    	let $activeSlideStore;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FullpageSection', slots, ['default']);
    	let { class: defaultClasses = '' } = $$props;
    	let { style = '' } = $$props;
    	let sectionId;
    	const { getId, activeSectionStore } = getContext('section');
    	validate_store(activeSectionStore, 'activeSectionStore');
    	component_subscribe($$self, activeSectionStore, value => $$invalidate(24, $activeSectionStore = value));
    	let { slides = [] } = $$props;
    	let { activeSlide = 0 } = $$props;
    	const activeSlideStore = writable(activeSlide);
    	validate_store(activeSlideStore, 'activeSlideStore');
    	component_subscribe($$self, activeSlideStore, value => $$invalidate(37, $activeSlideStore = value));
    	let { center = false } = $$props;
    	let { arrows = false } = $$props;
    	let { select = false } = $$props;
    	let { transitionDuration = 500 } = $$props;
    	let { dragThreshold = 100 } = $$props;
    	let { touchThreshold = 75 } = $$props;
    	let { transition = { duration: transitionDuration } } = $$props;
    	sectionId = parseInt(sectionId);
    	let visible;
    	let activeSlideIndicator = activeSlide;
    	let dragStartPosition;
    	let touchStartPosition;
    	let recentSlide = 0;
    	let slideCount = 0;
    	let classes = `${defaultClasses} svelte-fp-section svelte-fp-flexbox-center`;

    	if (!select) {
    		classes = `${classes} svelte-fp-unselectable`;
    	}

    	// Passing data about slide visibility to all slides, same principle as setContext('section',{...}) in Fullpage.svelte
    	setContext('slide', {
    		activeSlideStore,
    		getId: () => {
    			slideCount++;
    			return slideCount - 1;
    		}
    	});

    	const makePositive = num => {
    		let negative = false;

    		if (num < 0) {
    			negative = true;
    			num = -num;
    		}

    		return { num, negative };
    	};

    	const handleSelect = () => {
    		if (!select) {
    			return false;
    		}
    	};

    	const slideRight = () => {
    		const active = makePositive($activeSlideStore);

    		if (active.num < slides.length - 1) {
    			$$invalidate(5, activeSlideIndicator = active.num + 1);
    			activeSlideStore.set(-activeSlideIndicator);
    		} else {
    			activeSlideStore.set(0);
    			$$invalidate(5, activeSlideIndicator = $activeSlideStore);
    		}
    	};

    	const slideLeft = () => {
    		const active = makePositive($activeSlideStore);

    		if (active.num > 0) {
    			activeSlideStore.set(active.num - 1);
    		} else {
    			activeSlideStore.set(slides.length - 1);
    		}

    		$$invalidate(5, activeSlideIndicator = $activeSlideStore);
    	};

    	const toSlide = slideId => {
    		if (slideId > activeSlideIndicator) {
    			while (slideId > activeSlideIndicator) {
    				slideRight();
    			}
    		} else {
    			while (slideId < activeSlideIndicator) {
    				slideLeft();
    			}
    		}
    	};

    	// handling arrow event
    	const handleKey = event => {
    		if (arrows) {
    			switch (event.key) {
    				case 'ArrowLeft':
    					slideLeft();
    					break;
    				case 'ArrowRight':
    					slideRight();
    					break;
    			}
    		}
    	};

    	// memoize drag start X coordinate
    	const handleDragStart = event => {
    		dragStartPosition = event.screenX;
    	};

    	// handles drag end event
    	const handleDragEnd = event => {
    		const dragEndPosition = event.screenX;

    		// Trigger scroll event after thresholds are exceeded
    		if (dragStartPosition - dragEndPosition > dragThreshold) {
    			slideRight();
    		} else if (dragStartPosition - dragEndPosition < -dragThreshold) {
    			slideLeft();
    		}
    	};

    	// memoize touch start X coordinate
    	const handleTouchStart = event => {
    		touchStartPosition = event.touches[0].screenX;
    	};

    	// Compare touch start and end X coordinates, if difference exceeds threshold, scroll function is triggered
    	const handleTouchEnd = event => {
    		// Timer is used for preventing scrolling multiple slides
    		let timer = new Date().getTime();

    		const touchEndPosition = event.touches[0].screenX;

    		if (transitionDuration < timer - recentSlide) {
    			if (touchStartPosition - touchEndPosition > touchThreshold) {
    				slideRight();
    				recentSlide = timer;
    			} else if (touchStartPosition - touchEndPosition < -touchThreshold) {
    				slideLeft();
    				recentSlide = timer;
    			}
    		}
    	};

    	// After DOM is ready ged sectionId
    	onMount(() => {
    		$$invalidate(23, sectionId = getId());
    	});

    	const writable_props = [
    		'class',
    		'style',
    		'slides',
    		'activeSlide',
    		'center',
    		'arrows',
    		'select',
    		'transitionDuration',
    		'dragThreshold',
    		'touchThreshold',
    		'transition'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FullpageSection> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = event => handleKey(event);
    	const click_handler = index => toSlide(index);
    	const mousedown_handler = event => handleDragStart(event);
    	const mouseup_handler = event => handleDragEnd(event);
    	const touchstart_handler = event => handleTouchStart(event);
    	const touchmove_handler = event => handleTouchEnd(event);

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(16, defaultClasses = $$props.class);
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    		if ('slides' in $$props) $$invalidate(1, slides = $$props.slides);
    		if ('activeSlide' in $$props) $$invalidate(17, activeSlide = $$props.activeSlide);
    		if ('center' in $$props) $$invalidate(2, center = $$props.center);
    		if ('arrows' in $$props) $$invalidate(18, arrows = $$props.arrows);
    		if ('select' in $$props) $$invalidate(19, select = $$props.select);
    		if ('transitionDuration' in $$props) $$invalidate(20, transitionDuration = $$props.transitionDuration);
    		if ('dragThreshold' in $$props) $$invalidate(21, dragThreshold = $$props.dragThreshold);
    		if ('touchThreshold' in $$props) $$invalidate(22, touchThreshold = $$props.touchThreshold);
    		if ('transition' in $$props) $$invalidate(3, transition = $$props.transition);
    		if ('$$scope' in $$props) $$invalidate(25, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		getContext,
    		onMount,
    		setContext,
    		writable,
    		defaultClasses,
    		style,
    		sectionId,
    		getId,
    		activeSectionStore,
    		slides,
    		activeSlide,
    		activeSlideStore,
    		center,
    		arrows,
    		select,
    		transitionDuration,
    		dragThreshold,
    		touchThreshold,
    		transition,
    		visible,
    		activeSlideIndicator,
    		dragStartPosition,
    		touchStartPosition,
    		recentSlide,
    		slideCount,
    		classes,
    		makePositive,
    		handleSelect,
    		slideRight,
    		slideLeft,
    		toSlide,
    		handleKey,
    		handleDragStart,
    		handleDragEnd,
    		handleTouchStart,
    		handleTouchEnd,
    		$activeSectionStore,
    		$activeSlideStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('defaultClasses' in $$props) $$invalidate(16, defaultClasses = $$props.defaultClasses);
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    		if ('sectionId' in $$props) $$invalidate(23, sectionId = $$props.sectionId);
    		if ('slides' in $$props) $$invalidate(1, slides = $$props.slides);
    		if ('activeSlide' in $$props) $$invalidate(17, activeSlide = $$props.activeSlide);
    		if ('center' in $$props) $$invalidate(2, center = $$props.center);
    		if ('arrows' in $$props) $$invalidate(18, arrows = $$props.arrows);
    		if ('select' in $$props) $$invalidate(19, select = $$props.select);
    		if ('transitionDuration' in $$props) $$invalidate(20, transitionDuration = $$props.transitionDuration);
    		if ('dragThreshold' in $$props) $$invalidate(21, dragThreshold = $$props.dragThreshold);
    		if ('touchThreshold' in $$props) $$invalidate(22, touchThreshold = $$props.touchThreshold);
    		if ('transition' in $$props) $$invalidate(3, transition = $$props.transition);
    		if ('visible' in $$props) $$invalidate(4, visible = $$props.visible);
    		if ('activeSlideIndicator' in $$props) $$invalidate(5, activeSlideIndicator = $$props.activeSlideIndicator);
    		if ('dragStartPosition' in $$props) dragStartPosition = $$props.dragStartPosition;
    		if ('touchStartPosition' in $$props) touchStartPosition = $$props.touchStartPosition;
    		if ('recentSlide' in $$props) recentSlide = $$props.recentSlide;
    		if ('slideCount' in $$props) slideCount = $$props.slideCount;
    		if ('classes' in $$props) $$invalidate(6, classes = $$props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*sectionId, $activeSectionStore*/ 25165824) {
    			// Recompute visible: boolean everytime one of dependencies change
    			$$invalidate(4, visible = sectionId === $activeSectionStore);
    		}

    		if ($$self.$$.dirty[0] & /*activeSlide*/ 131072) {
    			/*
    Everytime activeSlide updates, this store gets new value and then all slides that subscribe,
    this is because user may want to control slides programmatically
     */
    			activeSlideStore.set(activeSlide);
    		}

    		if ($$self.$$.dirty[0] & /*visible*/ 16) {
    			// Everytime section disappears, slide count resets, this prevents slides from getting wrong ID
    			if (!visible) {
    				slideCount = 0;
    			}
    		}
    	};

    	return [
    		style,
    		slides,
    		center,
    		transition,
    		visible,
    		activeSlideIndicator,
    		classes,
    		activeSectionStore,
    		activeSlideStore,
    		handleSelect,
    		toSlide,
    		handleKey,
    		handleDragStart,
    		handleDragEnd,
    		handleTouchStart,
    		handleTouchEnd,
    		defaultClasses,
    		activeSlide,
    		arrows,
    		select,
    		transitionDuration,
    		dragThreshold,
    		touchThreshold,
    		sectionId,
    		$activeSectionStore,
    		$$scope,
    		slots,
    		keydown_handler,
    		click_handler,
    		mousedown_handler,
    		mouseup_handler,
    		touchstart_handler,
    		touchmove_handler
    	];
    }

    class FullpageSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$5,
    			create_fragment$5,
    			safe_not_equal,
    			{
    				class: 16,
    				style: 0,
    				slides: 1,
    				activeSlide: 17,
    				center: 2,
    				arrows: 18,
    				select: 19,
    				transitionDuration: 20,
    				dragThreshold: 21,
    				touchThreshold: 22,
    				transition: 3
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FullpageSection",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get class() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get slides() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slides(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeSlide() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSlide(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get arrows() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arrows(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get select() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set select(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionDuration() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionDuration(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dragThreshold() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dragThreshold(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get touchThreshold() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set touchThreshold(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<FullpageSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<FullpageSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-fullpage\src\FullpageSlide.svelte generated by Svelte v3.44.1 */
    const file$3 = "node_modules\\svelte-fullpage\\src\\FullpageSlide.svelte";

    // (55:0) {#if slideId === activeSlide}
    function create_if_block(ctx) {
    	let div;
    	let div_class_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`${/*defaultClasses*/ ctx[2]} svelte-fp-content`) + " svelte-1jzpibp"));
    			attr_dev(div, "style", /*style*/ ctx[3]);
    			toggle_class(div, "svelte-fp-flexbox-center", /*center*/ ctx[4]);
    			add_location(div, file$3, 55, 4, 1464);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*defaultClasses*/ 4 && div_class_value !== (div_class_value = "" + (null_to_empty(`${/*defaultClasses*/ ctx[2]} svelte-fp-content`) + " svelte-1jzpibp"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 8) {
    				attr_dev(div, "style", /*style*/ ctx[3]);
    			}

    			if (dirty & /*defaultClasses, center*/ 20) {
    				toggle_class(div, "svelte-fp-flexbox-center", /*center*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fly, /*transitionIn*/ ctx[0]);
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, /*transitionOut*/ ctx[1]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(55:0) {#if slideId === activeSlide}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*slideId*/ ctx[6] === /*activeSlide*/ ctx[5] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*slideId*/ ctx[6] === /*activeSlide*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*slideId, activeSlide*/ 96) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $activeSlideStore;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FullpageSlide', slots, ['default']);
    	let { class: defaultClasses = '' } = $$props;
    	let { style = '' } = $$props;
    	let slideId = 0;
    	let activeSlide = 0;
    	const { activeSlideStore, getId } = getContext('slide');
    	validate_store(activeSlideStore, 'activeSlideStore');
    	component_subscribe($$self, activeSlideStore, value => $$invalidate(8, $activeSlideStore = value));
    	let { center = false } = $$props;
    	let { transitionIn = { duration: 500, x: -2000 } } = $$props;
    	let { transitionOut = { duration: 500, x: 2000 } } = $$props;

    	const makePositive = num => {
    		let negative = false;

    		if (num < 0) {
    			negative = true;
    			num = -num;
    		}

    		return { num, negative };
    	};

    	const correctAnimation = active => {
    		const state = makePositive(active);

    		// Sets animation direction based on scroll/drag/arrow direction
    		if (state.negative) {
    			$$invalidate(0, transitionIn.x = 2000, transitionIn);
    			$$invalidate(1, transitionOut.x = -2000, transitionOut);
    		} else {
    			$$invalidate(0, transitionIn.x = -2000, transitionIn);
    			$$invalidate(1, transitionOut.x = 2000, transitionOut);
    		}

    		$$invalidate(5, activeSlide = state.num);
    	};

    	// After DOM is ready ged slideId
    	onMount(() => {
    		$$invalidate(6, slideId = getId());
    	});

    	const writable_props = ['class', 'style', 'center', 'transitionIn', 'transitionOut'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FullpageSlide> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(2, defaultClasses = $$props.class);
    		if ('style' in $$props) $$invalidate(3, style = $$props.style);
    		if ('center' in $$props) $$invalidate(4, center = $$props.center);
    		if ('transitionIn' in $$props) $$invalidate(0, transitionIn = $$props.transitionIn);
    		if ('transitionOut' in $$props) $$invalidate(1, transitionOut = $$props.transitionOut);
    		if ('$$scope' in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		getContext,
    		onMount,
    		defaultClasses,
    		style,
    		slideId,
    		activeSlide,
    		activeSlideStore,
    		getId,
    		center,
    		transitionIn,
    		transitionOut,
    		makePositive,
    		correctAnimation,
    		$activeSlideStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('defaultClasses' in $$props) $$invalidate(2, defaultClasses = $$props.defaultClasses);
    		if ('style' in $$props) $$invalidate(3, style = $$props.style);
    		if ('slideId' in $$props) $$invalidate(6, slideId = $$props.slideId);
    		if ('activeSlide' in $$props) $$invalidate(5, activeSlide = $$props.activeSlide);
    		if ('center' in $$props) $$invalidate(4, center = $$props.center);
    		if ('transitionIn' in $$props) $$invalidate(0, transitionIn = $$props.transitionIn);
    		if ('transitionOut' in $$props) $$invalidate(1, transitionOut = $$props.transitionOut);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*activeSlide*/ 32) {
    			// When activeSlide value changes, activeSlideStore value updates
    			activeSlideStore.set(activeSlide);
    		}

    		if ($$self.$$.dirty & /*$activeSlideStore*/ 256) {
    			// When activeSlideStore value changes, recompute transitions and change activeSlide
    			correctAnimation($activeSlideStore);
    		}
    	};

    	return [
    		transitionIn,
    		transitionOut,
    		defaultClasses,
    		style,
    		center,
    		activeSlide,
    		slideId,
    		activeSlideStore,
    		$activeSlideStore,
    		$$scope,
    		slots
    	];
    }

    class FullpageSlide extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			class: 2,
    			style: 3,
    			center: 4,
    			transitionIn: 0,
    			transitionOut: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FullpageSlide",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get class() {
    		throw new Error("<FullpageSlide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<FullpageSlide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<FullpageSlide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<FullpageSlide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<FullpageSlide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<FullpageSlide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionIn() {
    		throw new Error("<FullpageSlide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionIn(value) {
    		throw new Error("<FullpageSlide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionOut() {
    		throw new Error("<FullpageSlide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionOut(value) {
    		throw new Error("<FullpageSlide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Slogan.svelte generated by Svelte v3.44.1 */
    const file$2 = "src\\components\\Slogan.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let strong0;
    	let t1;
    	let section;
    	let h10;
    	let t3;
    	let h11;
    	let strong1;
    	let t5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			strong0 = element("strong");
    			strong0.textContent = `${"</>"}`;
    			t1 = space();
    			section = element("section");
    			h10 = element("h1");
    			h10.textContent = "Smart code,";
    			t3 = space();
    			h11 = element("h1");
    			strong1 = element("strong");
    			strong1.textContent = "awesome";
    			t5 = text(" \r\n      software");
    			attr_dev(strong0, "class", "braces svelte-rjcad1");
    			add_location(strong0, file$2, 19, 2, 369);
    			add_location(h10, file$2, 24, 4, 454);
    			attr_dev(strong1, "class", "svelte-rjcad1");
    			add_location(strong1, file$2, 26, 6, 512);
    			attr_dev(h11, "class", "second-part svelte-rjcad1");
    			add_location(h11, file$2, 25, 4, 480);
    			attr_dev(section, "class", "slogan svelte-rjcad1");
    			add_location(section, file$2, 23, 2, 424);
    			attr_dev(div, "class", "slogan-container svelte-rjcad1");
    			add_location(div, file$2, 18, 0, 335);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, strong0);
    			append_dev(div, t1);
    			append_dev(div, section);
    			append_dev(section, h10);
    			append_dev(section, t3);
    			append_dev(section, h11);
    			append_dev(h11, strong1);
    			append_dev(h11, t5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(strong1, "mouseover", /*moseoverhandler*/ ctx[0], false, false, false),
    					listen_dev(strong1, "focus", /*focus_handler*/ ctx[2], false, false, false),
    					listen_dev(strong1, "mouseout", /*moseouthandler*/ ctx[1], false, false, false),
    					listen_dev(strong1, "blur", /*blur_handler*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Slogan', slots, []);
    	let setHovered = getContext('setHovered');

    	function moseoverhandler(e) {
    		// hovered = true;
    		setHovered(true);
    	} // console.log(true);

    	function moseouthandler(e) {
    		setHovered(false);
    	} // hovered = false;
    	// console.log(false);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Slogan> was created with unknown prop '${key}'`);
    	});

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$capture_state = () => ({
    		getContext,
    		setHovered,
    		moseoverhandler,
    		moseouthandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('setHovered' in $$props) setHovered = $$props.setHovered;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [moseoverhandler, moseouthandler, focus_handler, blur_handler];
    }

    class Slogan extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slogan",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\pages\Hero.svelte generated by Svelte v3.44.1 */
    const file$1 = "src\\pages\\Hero.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let slogan;
    	let t0;
    	let section;
    	let h30;
    	let t2;
    	let h31;
    	let current;
    	slogan = new Slogan({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(slogan.$$.fragment);
    			t0 = space();
    			section = element("section");
    			h30 = element("h3");
    			h30.textContent = "Olá, eu sou Juliana Aragão, estudante e";
    			t2 = space();
    			h31 = element("h3");
    			h31.textContent = "Desenvolvedora de software Full Stack";
    			add_location(h30, file$1, 10, 4, 169);
    			add_location(h31, file$1, 11, 4, 223);
    			attr_dev(section, "class", "hero-presentation svelte-yknxdi");
    			add_location(section, file$1, 9, 2, 128);
    			attr_dev(div, "class", "hero-container svelte-yknxdi");
    			add_location(div, file$1, 6, 0, 79);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(slogan, div, null);
    			append_dev(div, t0);
    			append_dev(div, section);
    			append_dev(section, h30);
    			append_dev(section, t2);
    			append_dev(section, h31);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slogan.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slogan.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(slogan);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hero', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Slogan });
    	return [];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\Skills.svelte generated by Svelte v3.44.1 */

    function create_fragment$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("skills");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Skills', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Skills> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Skills extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skills",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.1 */
    const file = "src\\App.svelte";

    // (49:4) <FullpageSection center >
    function create_default_slot_2(ctx) {
    	let hero;
    	let current;
    	hero = new Hero({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(hero.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hero, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hero, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(49:4) <FullpageSection center >",
    		ctx
    	});

    	return block;
    }

    // (52:2) <FullpageSection center>
    function create_default_slot_1(ctx) {
    	let skills;
    	let current;
    	skills = new Skills({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(skills.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(skills, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(skills.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(skills.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(skills, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(52:2) <FullpageSection center>",
    		ctx
    	});

    	return block;
    }

    // (48:1) <Fullpage {sections} arrows>
    function create_default_slot(ctx) {
    	let fullpagesection0;
    	let t;
    	let fullpagesection1;
    	let current;

    	fullpagesection0 = new FullpageSection({
    			props: {
    				center: true,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	fullpagesection1 = new FullpageSection({
    			props: {
    				center: true,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(fullpagesection0.$$.fragment);
    			t = space();
    			create_component(fullpagesection1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fullpagesection0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(fullpagesection1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const fullpagesection0_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				fullpagesection0_changes.$$scope = { dirty, ctx };
    			}

    			fullpagesection0.$set(fullpagesection0_changes);
    			const fullpagesection1_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				fullpagesection1_changes.$$scope = { dirty, ctx };
    			}

    			fullpagesection1.$set(fullpagesection1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fullpagesection0.$$.fragment, local);
    			transition_in(fullpagesection1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fullpagesection0.$$.fragment, local);
    			transition_out(fullpagesection1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fullpagesection0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(fullpagesection1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(48:1) <Fullpage {sections} arrows>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main1;
    	let main0;
    	let fullpage;
    	let current;

    	fullpage = new Fullpage({
    			props: {
    				sections: /*sections*/ ctx[3],
    				arrows: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main1 = element("main");
    			main0 = element("main");
    			create_component(fullpage.$$.fragment);
    			attr_dev(main0, "class", "bg-dotted-grid svelte-nvinl6");
    			add_location(main0, file, 46, 1, 1031);
    			attr_dev(main1, "class", "bg-image svelte-nvinl6");
    			set_style(main1, "--bg-img", "url(" + /*bgs*/ ctx[1][/*hovered*/ ctx[0] ? 1 : /*indexBg*/ ctx[2]] + ")");
    			add_location(main1, file, 45, 0, 953);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main1, anchor);
    			append_dev(main1, main0);
    			mount_component(fullpage, main0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const fullpage_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				fullpage_changes.$$scope = { dirty, ctx };
    			}

    			fullpage.$set(fullpage_changes);

    			if (!current || dirty & /*hovered*/ 1) {
    				set_style(main1, "--bg-img", "url(" + /*bgs*/ ctx[1][/*hovered*/ ctx[0] ? 1 : /*indexBg*/ ctx[2]] + ")");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fullpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fullpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main1);
    			destroy_component(fullpage);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let hovered = false;

    	function setHovered(value) {
    		$$invalidate(0, hovered = value);
    	}

    	setContext('setHovered', setHovered);
    	const bgs = ['./assets/bgnonoise.png', './assets/bg.png'];
    	let indexBg = 0;

    	//Optional, include all titles of your sections, this is also used as number that indicate count of sections
    	const sections = ['Home', 'History', 'Present', 'Future'];

    	//Same mechanics as in sections
    	const slides = ['1982-1993', '1993-2006', '2006-present'];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		setContext,
    		hovered,
    		setHovered,
    		Fullpage,
    		FullpageSection,
    		FullpageSlide,
    		Hero,
    		Skills,
    		bgs,
    		indexBg,
    		sections,
    		slides
    	});

    	$$self.$inject_state = $$props => {
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('indexBg' in $$props) $$invalidate(2, indexBg = $$props.indexBg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [hovered, bgs, indexBg, sections];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {},
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
