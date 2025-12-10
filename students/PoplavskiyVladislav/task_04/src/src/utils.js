export function el(tag, props = {}, ...children){
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k,v])=>{
    if(k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else if(k === "html") node.innerHTML = v;
    else node.setAttribute(k, v);
  });
  children.flat().forEach(c => {
    if (c == null) return;
    node.append(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}

export function showToast(msg, timeout = 3000){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=> t.classList.add('hidden'), timeout);
}

// parse hash like #/teams?query=abc -> {route:'/teams', params: {}, query:{query:'abc'}}
export function parseHash(hash){
  if(!hash) return {route:'/', query:{}};
  const [pathPart, queryPart] = hash.replace(/^#/, '').split('?');
  const params = {};
  const q = {};
  if(queryPart){
    new URLSearchParams(queryPart).forEach((v,k)=> q[k]=v);
  }
  return {route: pathPart || '/', params, query: q};
}
