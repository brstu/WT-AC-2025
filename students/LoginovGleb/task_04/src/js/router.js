/**
 * Router Module - Hash-based SPA routing
 * Handles navigation, route matching, and state management
 */

// Route definitions
const routes = [];
let currentRoute = null;
let notFoundHandler = null;

/**
 * Add a route definition
 * @param {string} path - Route path pattern (e.g., '/items/:id')
 * @param {Function} handler - Route handler function
 */
export function addRoute(path, handler) {
    const paramNames = [];
    
    // Convert path pattern to regex
    // e.g., '/items/:id/edit' -> /^\/items\/([^\/]+)\/edit$/
    const regexPath = path.replace(/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
    });
    
    routes.push({
        path,
        pattern: new RegExp(`^${regexPath}$`),
        paramNames,
        handler
    });
}

/**
 * Set the 404 handler
 * @param {Function} handler - Not found handler function
 */
export function setNotFoundHandler(handler) {
    notFoundHandler = handler;
}

/**
 * Parse the current hash URL
 * @returns {Object} - { path, params, query }
 */
export function parseHash() {
    const hash = window.location.hash.slice(1) || '/items';
    const [pathWithQuery, queryString] = hash.split('?');
    const path = pathWithQuery || '/items';
    
    // Parse query parameters
    const query = {};
    if (queryString) {
        const params = new URLSearchParams(queryString);
        for (const [key, value] of params) {
            query[key] = value;
        }
    }
    
    return { path, query };
}

/**
 * Match a path against registered routes
 * @param {string} path - Path to match
 * @returns {Object|null} - { route, params } or null
 */
function matchRoute(path) {
    for (const route of routes) {
        const match = path.match(route.pattern);
        if (match) {
            const params = {};
            route.paramNames.forEach((name, index) => {
                params[name] = decodeURIComponent(match[index + 1]);
            });
            return { route, params };
        }
    }
    return null;
}

/**
 * Navigate to a new route
 * @param {string} path - Path to navigate to
 * @param {Object} query - Query parameters
 * @param {boolean} replace - Whether to replace the current history entry
 */
export function navigate(path, query = {}, replace = false) {
    let hash = path;
    
    // Add query parameters
    const queryString = new URLSearchParams(query).toString();
    if (queryString) {
        hash += '?' + queryString;
    }
    
    if (replace) {
        window.location.replace('#' + hash);
    } else {
        window.location.hash = hash;
    }
}

/**
 * Update query parameters without changing the path
 * @param {Object} query - New query parameters
 * @param {boolean} merge - Whether to merge with existing query params
 */
export function updateQuery(query, merge = true) {
    const { path, query: currentQuery } = parseHash();
    const newQuery = merge ? { ...currentQuery, ...query } : query;
    
    // Remove empty values
    Object.keys(newQuery).forEach(key => {
        if (!newQuery[key]) {
            delete newQuery[key];
        }
    });
    
    navigate(path, newQuery, true);
}

/**
 * Get current route information
 * @returns {Object} - Current route info
 */
export function getCurrentRoute() {
    return currentRoute;
}

/**
 * Handle route change
 */
async function handleRouteChange() {
    const { path, query } = parseHash();
    const matched = matchRoute(path);
    
    if (matched) {
        currentRoute = {
            path,
            params: matched.params,
            query,
            route: matched.route
        };
        
        try {
            await matched.route.handler(matched.params, query);
        } catch (error) {
            console.error('Route handler error:', error);
        }
    } else if (notFoundHandler) {
        currentRoute = { path, params: {}, query, route: null };
        notFoundHandler();
    } else {
        // Default: redirect to /items
        navigate('/items', {}, true);
    }
    
    updateActiveNavLinks();
}

/**
 * Update active state on navigation links
 */
function updateActiveNavLinks() {
    const { path } = parseHash();
    
    document.querySelectorAll('[data-nav]').forEach(link => {
        const navType = link.dataset.nav;
        let isActive = false;
        
        switch (navType) {
            case 'list':
                isActive = path === '/items' || (path.startsWith('/items/') && !path.endsWith('/edit'));
                break;
            case 'new':
                isActive = path === '/new';
                break;
        }
        
        link.classList.toggle('active', isActive);
    });
}

/**
 * Initialize the router
 */
export function initRouter() {
    // Handle hash change events
    window.addEventListener('hashchange', handleRouteChange);
    
    // Handle initial load
    window.addEventListener('load', () => {
        // If no hash, set default
        if (!window.location.hash) {
            window.location.hash = '/items';
        } else {
            handleRouteChange();
        }
    });
    
    // Handle popstate for browser back/forward
    window.addEventListener('popstate', handleRouteChange);
    
    // Initial route handling if already loaded
    if (document.readyState === 'complete') {
        if (!window.location.hash) {
            window.location.hash = '/items';
        } else {
            handleRouteChange();
        }
    }
}

/**
 * Go back in history
 */
export function goBack() {
    window.history.back();
}

/**
 * Refresh current route
 */
export function refresh() {
    handleRouteChange();
}
