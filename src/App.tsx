import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bell, Camera, CheckCircle2, ChevronRight, CircleUserRound, Heart, Home, ImagePlus, LoaderCircle, LogIn, LogOut, Menu, Plus, Search, ShieldCheck, ShoppingBag, SlidersHorizontal, Smartphone, Tag, UserRound, X } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { formatKz } from './lib/currency';
import type { Category, Product } from './types';

const categoryFallback: Category[] = [
 {id:'tecnologia',name:'Tecnologia',icon:'📱'}, {id:'moda',name:'Moda',icon:'👕'}, {id:'casa',name:'Casa',icon:'🏠'}, {id:'veiculos',name:'Veículos',icon:'🚗'}, {id:'imoveis',name:'Imóveis',icon:'🏢'}, {id:'servicos',name:'Serviços',icon:'🛠️'}, {id:'desporto',name:'Desporto',icon:'⚽'}, {id:'beleza',name:'Beleza',icon:'✨'}, {id:'criancas',name:'Crianças',icon:'🧸'}, {id:'outros',name:'Outros',icon:'📦'}
];
const initialProducts: Product[] = [];

type Page = 'home'|'search'|'publish'|'saved'|'profile'|'detail'|'myads';
export default function App() {
 const [page,setPage] = useState<Page>('home');
 const [session,setSession] = useState<Session|null>(null);
 const [phone,setPhone] = useState('+244');
 const [otp,setOtp] = useState('');
 const [otpSent,setOtpSent] = useState(false);
 const [authBusy,setAuthBusy] = useState(false);
 const [authError,setAuthError] = useState('');
 const [categories,setCategories] = useState<Category[]>(categoryFallback);
 const [products,setProducts] = useState<Product[]>(initialProducts);
 const [activeProduct,setActiveProduct] = useState<Product|null>(null);
 const [imageUrls,setImageUrls] = useState<Record<string,string>>({});
 const [editingProductId,setEditingProductId] = useState<string|null>(null);
 const [profileName,setProfileName] = useState('');
 const [profileCity,setProfileCity] = useState('');
 const [profileBusy,setProfileBusy] = useState(false);
 const [search,setSearch] = useState('');
 const [categoryFilter,setCategoryFilter] = useState('');
 const [myProducts,setMyProducts] = useState<Product[]>([]);
 const [title,setTitle] = useState('');
 const [description,setDescription] = useState('');
 const [price,setPrice] = useState('');
 const [city,setCity] = useState('Luanda');
 const [categoryId,setCategoryId] = useState('tecnologia');
 const [photos,setPhotos] = useState<File[]>([]);
 const [busy,setBusy] = useState(false);
 const [notice,setNotice] = useState('');
 const [saved,setSaved] = useState<string[]>([]);

 useEffect(() => {
  if (!supabase) return;
  supabase.auth.getSession().then(({data})=>setSession(data.session));
  const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,next)=>setSession(next));
  return () => subscription.unsubscribe();
 },[]);

 useEffect(() => {
  void loadPublicData();
 },[]);
 useEffect(() => {
  if (session?.user.id) { void loadMine(); } else setMyProducts([]);
 },[session?.user.id]);

 useEffect(() => {
  if (!supabase) return;
  const paths = new Set<string>();
  [...products,...myProducts].forEach(product => (product.product_images || []).forEach(image => paths.add(image.storage_path)));
  const missing = [...paths].filter(path => !imageUrls[path]);
  if (!missing.length) return;
  let cancelled = false;
  void Promise.all(missing.map(async path => {
   const {data,error} = await supabase!.storage.from('product-images').createSignedUrl(path, 3600);
   return error || !data?.signedUrl ? null : [path,data.signedUrl] as const;
  })).then(results => {
   if (cancelled) return;
   const resolved = Object.fromEntries(results.filter((row): row is readonly [string,string] => row !== null));
   if (Object.keys(resolved).length) setImageUrls(previous => ({...previous,...resolved}));
  }).catch(() => { /* Missing thumbnails should not prevent the listing itself from rendering. */ });
  return () => { cancelled = true; };
 },[products,myProducts,session?.user.id,imageUrls]);

 async function loadPublicData() {
  if (!supabase) return;
  const [{data:cs},{data:ps}] = await Promise.all([
   supabase.from('categories').select('id,name,icon').eq('is_active',true).order('position'),
   supabase.from('products').select('*,product_images(id,storage_path,position)').eq('status','active').order('created_at',{ascending:false}).limit(40)
  ]);
  if (cs?.length) setCategories(cs as Category[]);
  if (ps) setProducts(ps as Product[]);
 }
 async function loadMine() {
  if (!supabase || !session?.user.id) return;
  const [{data:ads},{data:profile}] = await Promise.all([
   supabase.from('products').select('*,product_images(id,storage_path,position)').eq('seller_id',session.user.id).neq('status','deleted').order('created_at',{ascending:false}),
   supabase.from('profiles').select('display_name,city').eq('id',session.user.id).maybeSingle()
  ]);
  if (ads) setMyProducts(ads as Product[]);
  if (profile) { setProfileName(profile.display_name || ''); setProfileCity(profile.city || ''); }
 }
 async function saveProfile() {
  if (!supabase || !session) return;
  setProfileBusy(true);
  try {
   const {error} = await supabase.from('profiles').upsert({id:session.user.id,display_name:profileName.trim()||null,city:profileCity.trim()||null},{onConflict:'id'});
   if (error) setNotice(error.message); else setNotice('Perfil actualizado.');
  } catch (error) {
   setNotice(error instanceof Error?error.message:'Não foi possível guardar o perfil.');
  } finally {
   setProfileBusy(false);
  }
 }
 async function sendOtp() {
  setAuthError('');
  if (!supabase) {setAuthError('Configura o Supabase no ficheiro .env.local para activar a autenticação.');return;}
  if (!/^\+244\d{9}$/.test(phone.replace(/\s/g,''))) {setAuthError('Introduz um número angolano no formato +244923456789.');return;}
  setAuthBusy(true);
  const {error} = await supabase.auth.signInWithOtp({phone:phone.replace(/\s/g,'')});
  setAuthBusy(false);
  if (error) setAuthError(error.message); else setOtpSent(true);
 }
 async function verifyOtp() {
  setAuthError('');
  if (!supabase) return;
  setAuthBusy(true);
  const {error} = await supabase.auth.verifyOtp({phone:phone.replace(/\s/g,''),token:otp,type:'sms'});
  setAuthBusy(false);
  if (error) setAuthError(error.message); else {setOtpSent(false);setOtp('');setNotice('Sessão iniciada com sucesso.');}
 }
 async function signOut() { if(supabase) await supabase.auth.signOut(); setNotice('Sessão terminada.'); }
 function publicUrl(path:string) { return imageUrls[path] || ''; }
 async function publishAd() {
  setNotice('');
  if(!supabase || !session) {setNotice('Inicia sessão para publicar um anúncio.');setPage('profile');return;}
  if(!title.trim() || Number(price)<=0 || !categoryId) {setNotice('Preenche o título, categoria e um preço superior a zero.');return;}
  if(photos.length>9) {setNotice('Podes adicionar no máximo 9 fotografias.');return;}
  setBusy(true);
  try {
   let productId = editingProductId;
   if(productId) {
    const {error} = await supabase.from('products').update({title:title.trim(),description:description.trim()||null,price:Number(price),category_id:categoryId,city:city.trim()||null}).eq('id',productId).eq('seller_id',session.user.id);
    if(error) {setNotice(error.message);return;}
    if(photos.length) {
     const {data:oldImages} = await supabase.from('product_images').select('storage_path').eq('product_id',productId);
     const oldPaths = (oldImages||[]).map(row=>row.storage_path as string);
     if(oldPaths.length) {
      const {error:removeError} = await supabase.storage.from('product-images').remove(oldPaths);
      if(removeError) {setNotice('Os dados foram actualizados, mas não foi possível substituir as fotografias antigas. '+removeError.message);return;}
      const {error:deleteRowsError} = await supabase.from('product_images').delete().eq('product_id',productId);
      if(deleteRowsError) {setNotice('Os dados foram actualizados, mas não foi possível actualizar a galeria. '+deleteRowsError.message);return;}
     }
    }
   } else {
    const {data:product,error} = await supabase.from('products').insert({seller_id:session.user.id,title:title.trim(),description:description.trim()||null,price:Number(price),category_id:categoryId,city:city.trim()||null,status:'active'}).select().single();
    if(error || !product) {setNotice(error?.message||'Não foi possível criar o anúncio.');return;}
    productId = product.id;
   }
   let imageFailures = 0;
   if(photos.length && productId) {
    const {data:existingImages} = await supabase.from('product_images').select('position').eq('product_id',productId).order('position',{ascending:false}).limit(1);
    const firstPosition = existingImages?.length ? Number(existingImages[0].position)+1 : 0;
    const imageRows = [] as {product_id:string;storage_path:string;position:number}[];
    for(let i=0;i<photos.length;i++) {
     const file=photos[i];
     const path=`${session.user.id}/${productId}/${Date.now()}-${i}.jpg`;
     const {error:uploadError}=await supabase.storage.from('product-images').upload(path,file,{contentType:file.type,upsert:false});
     if(uploadError) {imageFailures++;continue;}
     imageRows.push({product_id:productId,storage_path:path,position:firstPosition+i});
    }
    if(imageRows.length) {const {error:imageError}=await supabase.from('product_images').insert(imageRows);if(imageError)imageFailures+=imageRows.length;}
   }
   const wasEditing = Boolean(editingProductId);
   setTitle('');setDescription('');setPrice('');setPhotos([]);setEditingProductId(null);setPage('home');
   await loadPublicData();await loadMine();
   setNotice(imageFailures?`${wasEditing?'Anúncio actualizado':'Anúncio criado'}; ${imageFailures} fotografia(s) não foram guardadas.`:wasEditing?'Anúncio actualizado.':'Anúncio publicado.');
  } catch (error) {
   setNotice(error instanceof Error?error.message:'Falha inesperada ao guardar o anúncio.');
  } finally {
   setBusy(false);
  }
 }
 async function setProductStatus(product:Product,status:'active'|'paused'|'sold') {
  if(!supabase || !session)return;
  const {error}=await supabase.from('products').update({status}).eq('id',product.id).eq('seller_id',session.user.id);
  if(error)setNotice(error.message);else {setNotice('Anúncio actualizado.');await loadMine();await loadPublicData();}
 }
 async function deleteProduct(product:Product) {
  if(!supabase || !session)return;
  const {error}=await supabase.from('products').update({status:'deleted'}).eq('id',product.id).eq('seller_id',session.user.id);
  if(error)setNotice(error.message);else {await loadMine();await loadPublicData();setNotice('Anúncio removido.');}
 }
 const filtered = useMemo(()=>products.filter(p=>(!search || p.title.toLowerCase().includes(search.toLowerCase())) && (!categoryFilter||p.category_id===categoryFilter)),[products,search,categoryFilter]);
 function productImage(p:Product) { const imgs=[...(p.product_images||[])].sort((a,b)=>a.position-b.position);return imgs[0]&&supabase?publicUrl(imgs[0].storage_path):''; }
 function topBar(titleText:string,back?:()=>void) {return <header className="topbar">{back&&<button className="iconbtn" onClick={back} aria-label="Voltar"><ArrowLeft size={20}/></button>}<div className="brandmark">Q</div><strong>{titleText}</strong><button className="iconbtn push" aria-label="Notificações" onClick={()=>setNotice('As notificações serão activadas numa fase posterior.')}><Bell size={20}/></button></header>;}
 function productCard(p:Product) {return <article className="product-card" key={p.id}><button className="product-open" onClick={()=>{setActiveProduct(p);setPage('detail')}} aria-label={`Ver anúncio: ${p.title}`}><div className="product-media">{productImage(p)?<img src={productImage(p)} alt={p.title}/>:<div className="placeholder-photo"><ShoppingBag size={34}/></div>}</div><div className="product-copy"><strong>{p.title}</strong><b>{formatKz(p.price)}</b><small>{p.city||'Angola'}</small></div></button><button className="heart" aria-label="Guardar anúncio" onClick={()=>setSaved(prev=>prev.includes(p.id)?prev.filter(id=>id!==p.id):[...prev,p.id])}><Heart size={17} fill={saved.includes(p.id)?'currentColor':'none'}/></button></article>;}
 function bottomNav() {return <nav className="bottom-nav">{[{id:'home' as Page,label:'Início',icon:Home},{id:'search' as Page,label:'Pesquisar',icon:Search},{id:'publish' as Page,label:'Publicar',icon:Plus},{id:'saved' as Page,label:'Guardados',icon:Heart},{id:'profile' as Page,label:'Perfil',icon:UserRound}].map(item=><button key={item.id} className={page===item.id?'active':''} onClick={()=>setPage(item.id)}><item.icon size={20}/><span>{item.label}</span></button>)}</nav>;}
 function authPanel() {return <section className="auth-panel"><div className="auth-emblem"><Smartphone size={30}/></div><h2>{otpSent?'Confirma o teu número':'Entra no Quitaia'}</h2><p>Usa o teu número de telefone para continuar de forma segura.</p>{!otpSent?<><label>Número de telefone</label><input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" placeholder="+244923456789"/><button className="primary" onClick={()=>void sendOtp()} disabled={authBusy}>{authBusy?<LoaderCircle className="spin"/>:'Enviar código SMS'}</button></>:<><label>Código recebido por SMS</label><input value={otp} onChange={e=>setOtp(e.target.value)} inputMode="numeric" maxLength={6} placeholder="123456"/><button className="primary" onClick={()=>void verifyOtp()} disabled={authBusy}>{authBusy?<LoaderCircle className="spin"/>:'Confirmar código'}</button><button className="text-button" onClick={()=>{setOtpSent(false);setOtp('')}}>Alterar número</button></>}{authError&&<p className="error">{authError}</p>}{!isSupabaseConfigured&&<p className="hint">A interface está pronta, mas falta configurar as credenciais públicas do Supabase.</p>}</section>;}
 return <div className="app-shell">
  {topBar(page==='home'?'Quitaia Market':page==='search'?'Pesquisar':page==='publish'?'Publicar anúncio':page==='saved'?'Guardados':page==='profile'?'A tua conta':page==='detail'?'Detalhe do anúncio':'Os meus anúncios',page==='detail'?()=>setPage('home'):undefined)}
  {notice&&<button className="notice" onClick={()=>setNotice('')}><CheckCircle2 size={16}/>{notice}<X size={15}/></button>}
  <main className="page-content">
   {page==='home'&&<><section className="hero"><div><span className="eyebrow">O teu mercado, mais perto</span><h1>Descobre. Compra.<br/><em>Vende com confiança.</em></h1><p>Encontra boas oportunidades em Angola.</p><button className="hero-button" onClick={()=>setPage('publish')}>Publicar anúncio <ChevronRight size={17}/></button></div><div className="hero-mark">Q</div></section><div className="searchbox"><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="O que procuras hoje?" onFocus={()=>setPage('search')}/><button aria-label="Filtros" onClick={()=>setNotice('Escolhe uma categoria para filtrar os resultados.')}><SlidersHorizontal size={19}/></button></div><div className="section-heading"><div><span className="eyebrow">Explora por interesse</span><h2>Categorias</h2></div><button className="subtle-link" onClick={()=>setPage('search')}>Ver todas <ChevronRight size={16}/></button></div><div className="category-grid">{categories.map(c=><button key={c.id} className={categoryFilter===c.id?'category active':'category'} onClick={()=>{setCategoryFilter(categoryFilter===c.id?'':c.id);setPage('home')}}><span>{c.icon||'◈'}</span><small>{c.name}</small></button>)}</div><div className="section-heading"><div><span className="eyebrow">Novas oportunidades</span><h2>Anúncios recentes</h2></div><button className="subtle-link" onClick={()=>setPage('search')}>Explorar <ChevronRight size={16}/></button></div>{filtered.length?<div className="product-grid">{filtered.map(productCard)}</div>:<div className="empty-state"><div className="empty-icon"><ShoppingBag size={28}/></div><h3>As oportunidades começam aqui</h3><p>Não há anúncios publicados nesta selecção. Volta mais tarde ou sê o primeiro a publicar.</p><button className="primary compact" onClick={()=>setPage('publish')}>Publicar o primeiro anúncio</button></div>}</>}
   {page==='search'&&<><div className="searchbox large"><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar anúncios" autoFocus/><button onClick={()=>{setSearch('');setCategoryFilter('')}}><X size={17}/></button></div><div className="filter-chips">{categories.map(c=><button key={c.id} className={categoryFilter===c.id?'chip selected':'chip'} onClick={()=>setCategoryFilter(categoryFilter===c.id?'':c.id)}>{c.name}</button>)}</div><div className="section-heading"><h2>{filtered.length} anúncios</h2></div>{filtered.length?<div className="product-grid">{filtered.map(productCard)}</div>:<div className="empty-state"><Search size={28}/><h3>Nenhum resultado</h3><p>Experimenta outra palavra ou categoria.</p></div>}</>}
   {page==='publish'&&<><div className="form-intro"><span className="eyebrow">Vende de forma simples</span><h1>{editingProductId?'Editar anúncio':'Publicar anúncio'}</h1><p>Apresenta o teu produto com clareza. Fotografias reais ajudam as pessoas a decidir.</p></div>{!session?authPanel():<section className="ad-form"><label>Título do anúncio *</label><input value={title} onChange={e=>setTitle(e.target.value)} maxLength={100} placeholder="Ex.: Samsung Galaxy S24"/><label>Preço (Kz) *</label><input type="number" min="1" value={price} onChange={e=>setPrice(e.target.value)} placeholder="24999"/><label>Categoria *</label><select value={categoryId} onChange={e=>setCategoryId(e.target.value)}>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select><label>Descrição</label><textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} maxLength={3000} placeholder="Estado, características, condições de venda..."/><label>Localização</label><input value={city} onChange={e=>setCity(e.target.value)} placeholder="Cidade ou província"/><label>Fotografias (máximo 9)</label><label className="upload-box"><ImagePlus size={24}/><strong>Adicionar fotografias</strong><small>JPG, PNG ou WebP; até 9 imagens</small><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>setPhotos(Array.from(e.target.files||[]).slice(0,9))} hidden/></label>{photos.length>0&&<p className="hint">{photos.length} fotografia(s) seleccionada(s).</p>}<button className="primary" disabled={busy} onClick={()=>void publishAd()}>{busy?<LoaderCircle className="spin"/>:editingProductId?'Guardar alterações':'Publicar anúncio'}</button>{editingProductId&&<button className="text-button" onClick={()=>{setEditingProductId(null);setTitle('');setDescription('');setPrice('');setPhotos([])}}>Cancelar edição</button>}<p className="hint"><ShieldCheck size={14}/> Ao publicar, confirmas que tens direito de vender este artigo.</p></section>}</>}
   {page==='saved'&&<>{saved.length?<div className="product-grid">{products.filter(p=>saved.includes(p.id)).map(productCard)}</div>:<div className="empty-state"><Heart size={28}/><h3>Os teus guardados</h3><p>Guarda anúncios que te interessam para os encontrares facilmente.</p><button className="primary compact" onClick={()=>setPage('home')}>Explorar anúncios</button></div>}</>}
   {page==='profile'&&<>{session?<><div className="profile-card"><div className="profile-avatar"><CircleUserRound size={34}/></div><h2>{profileName.trim()||'A tua conta'}</h2><p>{session.user.phone||session.user.email}</p><span className="verified"><ShieldCheck size={14}/> Conta autenticada</span></div><section className="ad-form profile-form"><label>Nome a apresentar</label><input value={profileName} onChange={e=>setProfileName(e.target.value)} maxLength={80} placeholder="O teu nome"/><label>Cidade ou província</label><input value={profileCity} onChange={e=>setProfileCity(e.target.value)} maxLength={100} placeholder="Ex.: Luanda"/><button className="primary" onClick={()=>void saveProfile()} disabled={profileBusy}>{profileBusy?<LoaderCircle className="spin"/>:'Guardar perfil'}</button></section><div className="profile-menu"><button onClick={()=>{setPage('myads');void loadMine()}}><Tag/> Os meus anúncios <ChevronRight/></button><button onClick={()=>setNotice('A gestão de perfil será detalhada numa próxima fase.')}><CircleUserRound/> Dados do perfil <ChevronRight/></button><button onClick={()=>setNotice('As notificações serão activadas numa fase posterior.')}><Bell/> Notificações <ChevronRight/></button><button onClick={()=>void signOut()}><LogOut/> Terminar sessão <ChevronRight/></button></div></>:authPanel()}</>}
   {page==='myads'&&<><div className="section-heading"><h2>Os meus anúncios</h2><button className="subtle-link" onClick={()=>setPage('publish')}><Plus size={16}/> Novo</button></div>{myProducts.length?myProducts.map(p=><div className="my-ad" key={p.id}><div className="my-ad-photo">{productImage(p)?<img src={productImage(p)} alt=""/>:<ShoppingBag/>}</div><div className="my-ad-info"><strong>{p.title}</strong><b>{formatKz(p.price)}</b><small>Estado: {p.status}</small><div className="ad-actions">{p.status!=='active'&&p.status!=='sold'&&<button onClick={()=>void setProductStatus(p,'active')}>Activar</button>}<button onClick={()=>{setEditingProductId(p.id);setTitle(p.title);setDescription(p.description||'');setPrice(String(p.price));setCity(p.city||'');setCategoryId(p.category_id);setPhotos([]);setPage('publish')}}>Editar</button>{p.status==='active'&&<button onClick={()=>void setProductStatus(p,'paused')}>Pausar</button>}{p.status!=='sold'&&<button onClick={()=>void setProductStatus(p,'sold')}>Vendido</button>}<button onClick={()=>void deleteProduct(p)}>Remover</button></div></div></div>):<div className="empty-state"><ShoppingBag size={28}/><h3>Ainda não tens anúncios</h3><p>Quando publicares, poderás geri-los aqui.</p><button className="primary compact" onClick={()=>setPage('publish')}>Publicar anúncio</button></div>}</>}
   {page==='detail'&&activeProduct&&<article className="detail-view"><div className="detail-photo">{productImage(activeProduct)?<img src={productImage(activeProduct)} alt={activeProduct.title}/>:<ShoppingBag size={50}/>}</div>{(activeProduct.product_images||[]).length>1&&<div className="detail-gallery">{[...(activeProduct.product_images||[])].sort((a,b)=>a.position-b.position).map(image=>imageUrls[image.storage_path]?<img key={image.id} src={imageUrls[image.storage_path]} alt={activeProduct.title}/>:null)}</div>}<span className="eyebrow">{categories.find(c=>c.id===activeProduct.category_id)?.name||'Anúncio'}</span><h1>{activeProduct.title}</h1><strong className="detail-price">{formatKz(activeProduct.price)}</strong><p className="detail-location">{activeProduct.city||'Angola'}</p><h3>Descrição</h3><p>{activeProduct.description||'O vendedor não adicionou uma descrição.'}</p><button className="primary" onClick={()=>setNotice('A comunicação entre comprador e vendedor será disponibilizada numa próxima fase.')}>Contactar vendedor</button></article>}
  </main>
  {bottomNav()}
 </div>;
}
