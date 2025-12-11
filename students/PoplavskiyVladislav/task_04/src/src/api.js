// small API client. Configure base and optional token
const cfg = {
  base: 'http://localhost:3000',
  token: null // optionally set token
};

export function setApiBase(url){ cfg.base = url; }
export function setToken(token){ cfg.token = token; }

async function call(path, opts = {}){
  const headers = opts.headers || {};
  if(cfg.token) headers['Authorization'] = `Bearer ${cfg.token}`;
  if(opts.body && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(cfg.base + path, {...opts, headers});
  if(!res.ok){
    const txt = await res.text().catch(()=>res.statusText);
    throw new Error(`${res.status} ${res.statusText} — ${txt}`);
  }
  const ct = res.headers.get('content-type') || '';
  if(ct.includes('application/json')) return res.json();
  return res.text();
}

// CRUD for teams
export const api = {
  listTeams: (q = {})=>{
    // q: {q, _page, _limit, name_like ...} -> build query
    const usp = new URLSearchParams(q);
    return call('/teams?' + usp.toString());
  },
  getTeam: (id)=> call(`/teams/${id}`),
  createTeam: (data)=> call('/teams', {method:'POST', body:data}),
  updateTeam: (id, data)=> call(`/teams/${id}`, {method:'PATCH', body:data}),
  deleteTeam: (id)=> call(`/teams/${id}`, {method:'DELETE'}),
  // prefetch helper
  prefetchTeam: async (id) => {
    try{ const t = await call(`/teams/${id}`); return t; } catch(e){ return null; }
  }
};
